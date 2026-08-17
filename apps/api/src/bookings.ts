/**
 * Creación de reservas compartida por la ruta pública y el alta manual del
 * dashboard (ADR 0005). Mismo motor, mismas reglas, precio SIEMPRE en servidor.
 */
import {
  assignUnit,
  calculateTouristTax,
  quote,
  searchAvailability,
  validateStay,
} from '@logic-camp/core';
import { schema } from '@logic-camp/db';
import { computeChargeAmount, type PaymentIntentResult } from '@logic-camp/payments';
import { and, eq, isNull } from 'drizzle-orm';
import { CONSENT_VERSION } from './consent';
import { loadEngineData, loadExtras, loadLiveHolds, loadRequiredExtraIds } from './data';
import { errorDetail, logEvent } from './errors';
import { nowIso, uid } from './ids';
import {
  loadPaymentsConfig,
  loadStoredPaymentIntent,
  rememberIntent,
  resolveProvider,
  type PaymentEnv,
} from './payments';
import type { BookingRequest } from './schemas';
import type { TenantContext } from './tenant';

const CURRENCY = 'EUR';

export { nowIso, uid };

async function idempotencyMetaKey(key: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
  const hex = [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return `idem:v2:${hex}`;
}

export type CreateBookingResult =
  | { ok: false; status: 404 | 409 | 422 | 500 | 502; body: Record<string, unknown> }
  | { ok: true; status: 200 | 201; body: Record<string, unknown> };

export async function createBooking(
  tenant: TenantContext,
  body: BookingRequest,
  opts: {
    channel: 'web' | 'phone' | 'walkin';
    idemKey?: string | null;
    taxPolicy: Parameters<typeof calculateTouristTax>[2];
    /** secrets del Worker — solo hace falta para channel:'web' con pago activo (ADR 0011) */
    env?: PaymentEnv;
    /** origen público (para construir las URLs de vuelta de la pasarela) */
    webOrigin?: string;
    /** unidad preferida (ADR 0023 §2, crear desde el planning): si está libre se usa */
    preferredUnitId?: string;
    /** solicitud presupuestada que se convierte atómicamente con esta reserva */
    convertEnquiryId?: string;
  },
): Promise<CreateBookingResult> {
  const db = tenant.db;

  // idempotencia: misma clave → misma reserva (ADR 0004)
  if (opts.idemKey) {
    const safeKey = await idempotencyMetaKey(opts.idemKey);
    let existing = await db.select().from(schema.meta).where(eq(schema.meta.key, safeKey));
    // Compatibilidad de lectura con reservas anteriores a ADR 0042. Las nuevas
    // claves no se persisten nunca en claro: son input externo y podrían llevar PII.
    if (!existing[0]) {
      existing = await db
        .select()
        .from(schema.meta)
        .where(eq(schema.meta.key, `idem:${opts.idemKey}`));
    }
    if (existing[0]) {
      const booking = await db
        .select()
        .from(schema.bookings)
        .where(eq(schema.bookings.id, existing[0].value));
      if (booking[0]) {
        const payment = await loadStoredPaymentIntent(db, booking[0].id);
        return {
          ok: true,
          status: 200,
          body: {
            id: booking[0].id,
            code: booking[0].code,
            status: booking[0].status,
            idempotent: true,
            ...(payment ? { payment } : {}),
          },
        };
      }
    }
  }

  if (opts.convertEnquiryId) {
    const [enquiry] = await db
      .select({
        status: schema.enquiries.status,
        convertedBookingId: schema.enquiries.convertedBookingId,
      })
      .from(schema.enquiries)
      .where(eq(schema.enquiries.id, opts.convertEnquiryId));
    if (!enquiry) {
      return { ok: false, status: 404, body: { error: 'unknown_enquiry' } };
    }
    if (enquiry.status !== 'quoted' || enquiry.convertedBookingId) {
      return {
        ok: false,
        status: 409,
        body: {
          error: enquiry.convertedBookingId ? 'enquiry_already_converted' : 'enquiry_not_quoted',
          ...(enquiry.convertedBookingId ? { bookingId: enquiry.convertedBookingId } : {}),
        },
      };
    }
  }

  const data = await loadEngineData(db);
  const unitType = data.unitTypes.find((t) => t.id === body.unitTypeId);
  if (!unitType) return { ok: false, status: 404, body: { error: 'unknown_unit_type' } };

  // hold del funnel (ADR 0007): debe estar vivo y coincidir con lo que se reserva
  const now = nowIso();
  if (body.holdId) {
    const holdRows = await db
      .select()
      .from(schema.inventoryHolds)
      .where(eq(schema.inventoryHolds.id, body.holdId));
    const hold = holdRows[0];
    if (!hold || hold.expiresAt <= now) {
      return { ok: false, status: 409, body: { error: 'hold_expired' } };
    }
    if (
      hold.unitTypeId !== body.unitTypeId ||
      hold.dateFrom !== body.dateFrom ||
      hold.dateTo !== body.dateTo
    ) {
      return { ok: false, status: 409, body: { error: 'hold_mismatch' } };
    }
  }
  // los demás holds vivos ocupan; el propio se excluye (si no, se bloquearía a sí mismo)
  const holds = (await loadLiveHolds(db, now)).filter((h) => h.id !== body.holdId);

  const validation = validateStay({
    unitType,
    dateFrom: body.dateFrom,
    dateTo: body.dateTo,
    occupancy: body.occupancy,
    seasons: data.seasons,
    ratePlans: data.ratePlans,
    needsElectricity: body.needsElectricity,
  });
  if (!validation.valid) {
    return { ok: false, status: 422, body: { error: 'invalid_stay', issues: validation.issues } };
  }

  const availability = searchAvailability({
    dateFrom: body.dateFrom,
    dateTo: body.dateTo,
    unitTypes: [unitType],
    units: data.units,
    bookings: data.bookings,
    blocks: data.blocks,
    seasons: data.seasons,
    holds,
    now,
  })[0]!;
  if (availability.status !== 'available') {
    return {
      ok: false,
      status: 409,
      body: { error: availability.status === 'closed' ? 'closed' : 'no_availability' },
    };
  }

  // precio SIEMPRE en servidor
  const requiredIds = await loadRequiredExtraIds(db);
  const extras = await loadExtras(db, [...new Set([...body.extraIds, ...requiredIds])]);
  const result = quote({
    unitType,
    dateFrom: body.dateFrom,
    dateTo: body.dateTo,
    occupancy: body.occupancy,
    seasons: data.seasons,
    ratePlans: data.ratePlans,
    extras,
    currency: CURRENCY,
    withElectricity: body.withElectricity,
  });
  const touristTaxCents = calculateTouristTax(body.occupancy, result.nights, opts.taxPolicy);

  let assignment = assignUnit({
    unitTypeId: unitType.id,
    dateFrom: body.dateFrom,
    dateTo: body.dateTo,
    units: data.units,
    bookings: data.bookings,
    blocks: data.blocks,
  });
  // preferencia, nunca garantía (ADR 0023 §2): si la unidad pedida está entre las
  // libres (titular o alternativa del asignador), se usa; si no, manda el asignador.
  if (assignment && opts.preferredUnitId && assignment.unitId !== opts.preferredUnitId) {
    const alt = assignment.alternatives.find((a) => a.unitId === opts.preferredUnitId);
    if (alt) assignment = { ...assignment, unitId: alt.unitId, unitCode: alt.unitCode };
  }

  // Pagos (ADR 0011): solo el canal web pasa por la pasarela — una reserva de
  // mostrador/teléfono la cobra recepción in situ y confirma al instante como
  // siempre. Se valida ANTES de escribir nada: un provider mal configurado
  // nunca debe dejar una reserva a medias sin explicación.
  let chargeAmountCents = 0;
  let provider: ReturnType<typeof resolveProvider> = null;
  if (opts.channel === 'web') {
    const paymentsConfig = await loadPaymentsConfig(db);
    chargeAmountCents = computeChargeAmount(
      paymentsConfig.mode,
      result.breakdown.totalCents,
      paymentsConfig.depositPercent,
    );
    if (chargeAmountCents > 0) {
      provider = resolveProvider(paymentsConfig, opts.env ?? {});
      if (!provider) return { ok: false, status: 500, body: { error: 'payment_not_configured' } };
    }
  }
  const requiresPayment = chargeAmountCents > 0;

  const id = uid('bkg');
  const code = `CS-${body.dateFrom.slice(0, 4)}-${crypto.randomUUID().replace(/\D/g, '').slice(0, 6)}`;
  const guestId = uid('gst');
  const ts = nowIso();

  const inserts = [
    db.insert(schema.bookings).values({
      id,
      tenantId: tenant.slug,
      code,
      status: requiresPayment ? 'pending' : 'confirmed',
      channel: opts.channel,
      dateFrom: body.dateFrom,
      dateTo: body.dateTo,
      unitTypeId: unitType.id,
      unitId: assignment?.unitId ?? null,
      occupancy: body.occupancy,
      extras: extras.map((e) => ({ extraId: e.id, qty: e.qty, amountCents: e.priceCents })),
      priceBreakdown: { ...result.breakdown, touristTaxCents },
      totalCents: result.breakdown.totalCents,
      paidCents: 0,
      touristTaxCents,
      depositCents: 0,
      notes: body.notes ?? null,
      locale: body.locale,
      createdAt: ts,
      updatedAt: ts,
    }),
    db.insert(schema.guests).values({
      id: guestId,
      tenantId: tenant.slug,
      name: body.holder.name,
      surname: '',
      email: body.holder.email,
      phone: body.holder.phone ?? null,
      // ADR 0026 §2.3: sin consentimiento NO se inventa una fecha. La web pública
      // no puede llegar aquí sin él (su esquema es `literal(true)`); el mostrador sí,
      // y entonces se registra después desde la ficha. La versión la sella el servidor.
      gdprConsentAt: body.gdprConsent ? ts : null,
      gdprConsentVersion: body.gdprConsent ? CONSENT_VERSION : null,
    }),
    db.insert(schema.bookingGuests).values({ bookingId: id, guestId, isLead: true }),
    ...(opts.idemKey
      ? [db.insert(schema.meta).values({ key: await idempotencyMetaKey(opts.idemKey), value: id })]
      : []),
    // el hold se consume EN la misma transacción que crea la reserva (ADR 0007)
    ...(body.holdId
      ? [db.delete(schema.inventoryHolds).where(eq(schema.inventoryHolds.id, body.holdId))]
      : []),
    ...(opts.convertEnquiryId
      ? [
          // La clave reclama la solicitud dentro del mismo batch. Dos altas con
          // claves idempotentes distintas no pueden crear dos reservas: la PK de
          // meta hace fallar y revertir por completo el segundo batch.
          db.insert(schema.meta).values({
            key: `enquiry-booking:${opts.convertEnquiryId}`,
            value: id,
          }),
          db
            .update(schema.enquiries)
            .set({ status: 'converted', convertedBookingId: id })
            .where(
              and(
                eq(schema.enquiries.id, opts.convertEnquiryId),
                eq(schema.enquiries.status, 'quoted'),
                isNull(schema.enquiries.convertedBookingId),
              ),
            ),
        ]
      : []),
  ];

  // batch atómico: reserva + titular (+ clave de idempotencia + hold consumido) juntos o nada
  try {
    await db.batch(inserts as unknown as Parameters<typeof db.batch>[0]);
  } catch (error) {
    if (opts.convertEnquiryId) {
      const [enquiry] = await db
        .select({ convertedBookingId: schema.enquiries.convertedBookingId })
        .from(schema.enquiries)
        .where(eq(schema.enquiries.id, opts.convertEnquiryId));
      if (enquiry?.convertedBookingId) {
        return {
          ok: false,
          status: 409,
          body: {
            error: 'enquiry_already_converted',
            bookingId: enquiry.convertedBookingId,
          },
        };
      }
    }
    throw error;
  }

  const baseBody = {
    id,
    code,
    status: requiresPayment ? ('pending' as const) : ('confirmed' as const),
    unitId: assignment?.unitId ?? null,
    totalCents: result.breakdown.totalCents,
    touristTaxCents,
    breakdown: { ...result.breakdown, touristTaxCents },
  };

  if (!requiresPayment) {
    // Fase 7: hook onBookingCreated → email confirmación (lo dispara la ruta, aquí solo el 201)
    return { ok: true, status: 201, body: baseBody };
  }

  // El intent se crea DESPUÉS del batch: es una llamada de red, no una escritura
  // en D1. Si falla, la reserva ya existe como 'pending' — recepción la ve en
  // la bandeja y puede resolverlo a mano (ADR 0011 §4, no se auto-cancela).
  if (!provider || !opts.webOrigin) return { ok: true, status: 201, body: baseBody };
  try {
    const intent: PaymentIntentResult = await provider.createIntent({
      bookingId: id,
      code,
      amountCents: chargeAmountCents,
      currency: CURRENCY,
      locale: body.locale,
      description: `Reserva ${code}`,
      // El retorno no contiene PII. La pantalla pide el email para abrir la
      // reserva; persistir el formulario Redsys no debe duplicar el correo en meta.
      successUrl: `${opts.webOrigin}/reserva?code=${code}&nueva=1&pago=ok`,
      cancelUrl: `${opts.webOrigin}/reserva?code=${code}&nueva=1&pago=cancelado`,
      notifyUrl: `${opts.webOrigin}/api/payments/webhook/${provider.name}`,
    });
    await rememberIntent(tenant.db, provider.name, intent, id, chargeAmountCents);
    return { ok: true, status: 201, body: { ...baseBody, payment: intent } };
  } catch (e) {
    const ref = uid('err');
    logEvent({
      level: 'error',
      event: 'payment_intent_failed',
      tenant: tenant.slug,
      requestId: ref,
      provider: provider.name,
      detail: errorDetail(e).message,
      stack: errorDetail(e).stack,
    });
    return {
      ok: false,
      status: 502,
      body: {
        error: 'payment_intent_failed',
        ref,
        id,
        code,
        status: 'pending',
        persisted: true,
      },
    };
  }
}
