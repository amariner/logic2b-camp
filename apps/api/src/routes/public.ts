import {
  assignUnit,
  calculateCancellationRefund,
  calculateTouristTax,
  ClosedError,
  quote,
  searchAvailability,
  TAX_POLICIES,
  validateStay,
  type Occupancy,
} from '@logic-camp/core';
import { schema, type Db } from '@logic-camp/db';
import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { createBooking, nowIso, uid } from '../bookings';
import { loadEngineData, loadExtras, loadLiveHolds, loadRequiredExtraIds } from '../data';
import { logEvent } from '../errors';
import { notifyBookingCancelled, notifyBookingConfirmed, notifyEnquiry } from '../notify';
import {
  executeRefund,
  loadStoredPaymentIntent,
  loadPaymentsConfig,
  paymentIntentRequiresReplacement,
  recordPaymentEvent,
  resolveProvider,
} from '../payments';
import {
  availabilityQuerySchema,
  bookingCancelSchema,
  bookingModifySchema,
  bookingRequestSchema,
  enquiryRequestSchema,
  holdRequestSchema,
  idempotencyKeySchema,
  quoteRequestSchema,
} from '../schemas';
import type { Env } from '../tenant';
import { loadTenantConfig } from '../tenant-config';

const CURRENCY = 'EUR';
/** Vida del bloqueo temporal del funnel (ADR 0007) */
const HOLD_TTL_MS = 15 * 60 * 1000;

const ACTIVE_STATUSES = ['pending', 'confirmed'];

/** Gestión sin cuenta: la reserva se localiza por código + email del titular. */
async function findBookingByCodeEmail(db: Db, code: string, email: string) {
  const rows = await db.select().from(schema.bookings).where(eq(schema.bookings.code, code));
  const booking = rows[0];
  if (!booking) return null;
  const links = await db
    .select()
    .from(schema.bookingGuests)
    .where(
      and(eq(schema.bookingGuests.bookingId, booking.id), eq(schema.bookingGuests.isLead, true)),
    );
  const lead = links[0]
    ? (await db.select().from(schema.guests).where(eq(schema.guests.id, links[0].guestId)))[0]
    : undefined;
  if (!lead || lead.email?.toLowerCase() !== email.toLowerCase()) return null;
  return booking;
}

/** edades sintéticas cuando la búsqueda solo trae el número de niños */
const childAges = (n: number) => Array.from({ length: n }, () => 8);

export const publicRoutes = new Hono<Env>()
  .get('/availability', async (c) => {
    const parsed = availabilityQuerySchema.safeParse(c.req.query());
    if (!parsed.success)
      return c.json({ error: 'invalid_query', issues: parsed.error.issues }, 400);
    const q = parsed.data;
    if (q.from >= q.to) return c.json({ error: 'invalid_dates' }, 400);

    const db = c.get('tenant').db;
    const now = nowIso();
    const [data, holds] = await Promise.all([loadEngineData(db), loadLiveHolds(db, now)]);
    const occupancy: Occupancy = {
      adults: q.adults,
      childrenAges: childAges(q.children),
      pets: q.pets,
      vehicles: 1,
    };

    const results = searchAvailability({
      dateFrom: q.from,
      dateTo: q.to,
      unitTypes: data.unitTypes,
      units: data.units,
      bookings: data.bookings,
      blocks: data.blocks,
      seasons: data.seasons,
      holds,
      now,
    });

    const items = results.map((r) => {
      const type = data.unitTypes.find((t) => t.id === r.unitTypeId)!;
      const persons = occupancy.adults + occupancy.childrenAges.length;
      const fits = persons <= type.capacityMax;
      let priceCents: number | null = null;
      if (r.status === 'available' && fits) {
        try {
          priceCents = quote({
            unitType: type,
            dateFrom: q.from,
            dateTo: q.to,
            occupancy,
            seasons: data.seasons,
            ratePlans: data.ratePlans,
            currency: CURRENCY,
          }).breakdown.totalCents;
        } catch {
          priceCents = null; // sin plan para alguna temporada: no se ofrece
        }
      }
      return {
        unitTypeId: r.unitTypeId,
        kind: type.kind,
        status: fits ? r.status : ('unavailable' as const),
        availableUnits: r.availableUnits,
        capacityMax: type.capacityMax,
        totalPriceCents: priceCents,
        currency: CURRENCY,
      };
    });

    // fechas cerradas: la próxima apertura REAL sale de seasons_calendar, nunca hardcodeada
    const opensOn = items.some((i) => i.status === 'closed')
      ? (data.seasons
          .filter((s) => s.isOpen && s.dateFrom > q.from)
          .map((s) => s.dateFrom)
          .sort()[0] ?? null)
      : null;

    return c.json({ from: q.from, to: q.to, opensOn, results: items });
  })

  .post('/quote', async (c) => {
    const parsed = quoteRequestSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'invalid_body', issues: parsed.error.issues }, 400);
    const body = parsed.data;
    const db = c.get('tenant').db;
    const [data, tenantConfig] = await Promise.all([loadEngineData(db), loadTenantConfig(db)]);

    const unitType = data.unitTypes.find((t) => t.id === body.unitTypeId);
    if (!unitType) return c.json({ error: 'unknown_unit_type' }, 404);

    const validation = validateStay({
      unitType,
      dateFrom: body.dateFrom,
      dateTo: body.dateTo,
      occupancy: body.occupancy,
      seasons: data.seasons,
      ratePlans: data.ratePlans,
      needsElectricity: body.needsElectricity,
    });
    if (!validation.valid) return c.json({ error: 'invalid_stay', issues: validation.issues }, 422);

    const requiredIds = await loadRequiredExtraIds(db);
    const extras = await loadExtras(db, [...new Set([...body.extraIds, ...requiredIds])]);

    try {
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
      const touristTaxCents = calculateTouristTax(
        body.occupancy,
        result.nights,
        TAX_POLICIES[tenantConfig.taxPolicy]!,
      );
      return c.json({
        ...result,
        breakdown: { ...result.breakdown, touristTaxCents },
      });
    } catch (e) {
      if (e instanceof ClosedError) return c.json({ error: 'closed' }, 422);
      throw e;
    }
  })

  // ---------- holds del funnel (ADR 0007) ----------

  .post('/holds', async (c) => {
    const parsed = holdRequestSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'invalid_body', issues: parsed.error.issues }, 400);
    const body = parsed.data;
    if (body.dateFrom >= body.dateTo) return c.json({ error: 'invalid_dates' }, 400);
    const db = c.get('tenant').db;
    const now = nowIso();

    const [data, holds] = await Promise.all([loadEngineData(db), loadLiveHolds(db, now)]);
    const unitType = data.unitTypes.find((t) => t.id === body.unitTypeId);
    if (!unitType) return c.json({ error: 'unknown_unit_type' }, 404);

    const occupancy: Occupancy = body.occupancy ?? {
      adults: 2,
      childrenAges: [],
      pets: 0,
      vehicles: 1,
    };
    const validation = validateStay({
      unitType,
      dateFrom: body.dateFrom,
      dateTo: body.dateTo,
      occupancy,
      seasons: data.seasons,
      ratePlans: data.ratePlans,
      needsElectricity: false,
    });
    if (!validation.valid) {
      return c.json({ error: 'invalid_stay', issues: validation.issues }, 422);
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
      return c.json(
        { error: availability.status === 'closed' ? 'closed' : 'no_availability' },
        409,
      );
    }

    const id = uid('hld');
    const expiresAt = new Date(Date.parse(now) + HOLD_TTL_MS).toISOString();
    await db.insert(schema.inventoryHolds).values({
      id,
      tenantId: c.get('tenant').slug,
      unitTypeId: body.unitTypeId,
      dateFrom: body.dateFrom,
      dateTo: body.dateTo,
      occupancy,
      expiresAt,
      createdAt: now,
    });
    return c.json({ holdId: id, expiresAt }, 201);
  })

  // liberar al abandonar el funnel — idempotente
  .delete('/holds/:id', async (c) => {
    const db = c.get('tenant').db;
    await db.delete(schema.inventoryHolds).where(eq(schema.inventoryHolds.id, c.req.param('id')));
    return c.body(null, 204);
  })

  .post('/enquiries', async (c) => {
    const parsed = enquiryRequestSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'invalid_body', issues: parsed.error.issues }, 400);
    const body = parsed.data;
    const tenant = c.get('tenant');

    const id = uid('enq');
    await tenant.db.insert(schema.enquiries).values({
      id,
      tenantId: tenant.slug,
      status: 'new',
      dateFrom: body.dateFrom ?? null,
      dateTo: body.dateTo ?? null,
      occupancy: body.occupancy ?? null,
      unitTypeId: body.unitTypeId ?? null,
      message: body.message,
      contact: body.contact,
      locale: body.locale,
      source: body.source,
      createdAt: nowIso(),
    });
    await notifyEnquiry(c, id, body);
    return c.json({ id, status: 'new' }, 201);
  })

  .post('/bookings', async (c) => {
    const parsed = bookingRequestSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'invalid_body', issues: parsed.error.issues }, 400);

    const idem = idempotencyKeySchema.safeParse(c.req.header('Idempotency-Key'));
    if (!idem.success) return c.json({ error: 'invalid_idempotency_key' }, 400);

    const tenant = c.get('tenant');
    const tenantConfig = await loadTenantConfig(tenant.db);
    // toda la lógica vive en createBooking, compartida con el alta manual del dashboard (ADR 0005)
    const result = await createBooking(tenant, parsed.data, {
      channel: 'web',
      idemKey: idem.data,
      taxPolicy: TAX_POLICIES[tenantConfig.taxPolicy]!,
      env: c.env,
      webOrigin: new URL(c.req.url).origin,
    });
    if (result.ok && result.status === 201) {
      // solo se notifica la confirmación en el momento en que REALMENTE se confirma:
      // al crear (mode none / sin pago) o más tarde, desde el webhook (ADR 0011 §4)
      if (result.body.status === 'confirmed') {
        await notifyBookingConfirmed(
          c,
          parsed.data,
          result.body as Parameters<typeof notifyBookingConfirmed>[2],
        );
      }
    }
    return c.json(result.body, result.status);
  })

  .get('/bookings/:code', async (c) => {
    const email = c.req.query('email');
    if (!email) return c.json({ error: 'email_required' }, 400);
    const db = c.get('tenant').db;
    const booking = await findBookingByCodeEmail(db, c.req.param('code'), email);
    if (!booking) return c.json({ error: 'not_found' }, 404);

    // previsión de cancelación: el titular ve el importe ANTES de confirmar
    const cancellation = ACTIVE_STATUSES.includes(booking.status)
      ? calculateCancellationRefund(
          { dateFrom: booking.dateFrom, paidCents: booking.paidCents },
          (await loadTenantConfig(db)).cancellationPolicy,
          nowIso().slice(0, 10),
        )
      : null;

    return c.json({
      code: booking.code,
      status: booking.status,
      dateFrom: booking.dateFrom,
      dateTo: booking.dateTo,
      unitTypeId: booking.unitTypeId,
      occupancy: booking.occupancy,
      extras: booking.extras,
      totalCents: booking.totalCents,
      paidCents: booking.paidCents,
      touristTaxCents: booking.touristTaxCents,
      breakdown: booking.priceBreakdown,
      cancellation,
    });
  })

  .post('/bookings/:code/payment', async (c) => {
    const parsed = bookingCancelSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'invalid_body', issues: parsed.error.issues }, 400);
    const db = c.get('tenant').db;
    const booking = await findBookingByCodeEmail(db, c.req.param('code'), parsed.data.email);
    if (!booking) return c.json({ error: 'not_found' }, 404);
    if (booking.status !== 'pending') {
      return c.json({ error: 'payment_not_pending', status: booking.status }, 409);
    }

    // ADR 0042: el reintento local no crea otro cobro ni recalcula el importe.
    // Devuelve únicamente las instrucciones ya persistidas del intento vigente;
    // expiración y renovación real se verifican con el proveedor en R12.
    const payment = await loadStoredPaymentIntent(db, booking.id);
    if (!payment || payment.method === 'immediate') {
      return c.json({ error: 'payment_unavailable' }, 409);
    }
    return c.json({ payment });
  })

  // ---------- gestión por código + email (ADR 0007) ----------

  .post('/bookings/:code/cancel', async (c) => {
    const parsed = bookingCancelSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'invalid_body', issues: parsed.error.issues }, 400);
    const db = c.get('tenant').db;
    const booking = await findBookingByCodeEmail(db, c.req.param('code'), parsed.data.email);
    if (!booking) return c.json({ error: 'not_found' }, 404);
    if (booking.status === 'cancelled') {
      return c.json({ code: booking.code, status: 'cancelled', idempotent: true });
    }
    if (!ACTIVE_STATUSES.includes(booking.status)) {
      return c.json({ error: 'not_cancellable', status: booking.status }, 409);
    }

    const refund = calculateCancellationRefund(
      { dateFrom: booking.dateFrom, paidCents: booking.paidCents },
      (await loadTenantConfig(db)).cancellationPolicy,
      nowIso().slice(0, 10),
    );
    const ts = nowIso();
    // cancelar libera inventario en la MISMA transacción (invariante 4):
    // el estado 'cancelled' deja de ocupar en todas las queries del motor
    await db.batch([
      db
        .update(schema.bookings)
        .set({ status: 'cancelled', updatedAt: ts })
        .where(eq(schema.bookings.id, booking.id)),
      db.insert(schema.auditLog).values({
        id: uid('aud'),
        tenantId: c.get('tenant').slug,
        userId: null,
        entity: 'booking',
        entityId: booking.id,
        action: 'cancel',
        diff: {
          via: 'web',
          actor: 'guest',
          refundCents: refund.refundCents,
        },
        createdAt: ts,
      }),
    ]);
    // Ejecución real del reembolso (ADR 0011 §5) — la cancelación YA liberó el
    // inventario por encima; si el reembolso falla, la reserva sigue cancelada
    // (recepción lo resuelve a mano, no se revierte la cancelación).
    const refundOutcome = await executeRefund(db, c.env, booking.id, refund.refundCents);
    await notifyBookingCancelled(
      c,
      booking,
      parsed.data.email,
      refundOutcome.ok ? refundOutcome.refundedCents : 0,
    );
    return c.json({ code: booking.code, status: 'cancelled', refund, refunded: refundOutcome.ok });
  })

  .post('/bookings/:code/modify', async (c) => {
    const parsed = bookingModifySchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'invalid_body', issues: parsed.error.issues }, 400);
    const body = parsed.data;
    if (body.dateFrom >= body.dateTo) return c.json({ error: 'invalid_dates' }, 400);
    const db = c.get('tenant').db;
    const booking = await findBookingByCodeEmail(db, c.req.param('code'), body.email);
    if (!booking) return c.json({ error: 'not_found' }, 404);
    if (!ACTIVE_STATUSES.includes(booking.status)) {
      return c.json({ error: 'not_modifiable', status: booking.status }, 409);
    }

    const now = nowIso();
    const [data, holds, tenantConfig] = await Promise.all([
      loadEngineData(db),
      loadLiveHolds(db, now),
      loadTenantConfig(db),
    ]);
    const unitType = data.unitTypes.find((t) => t.id === booking.unitTypeId)!;
    const occupancy = booking.occupancy;

    const validation = validateStay({
      unitType,
      dateFrom: body.dateFrom,
      dateTo: body.dateTo,
      occupancy,
      seasons: data.seasons,
      ratePlans: data.ratePlans,
      needsElectricity: body.needsElectricity,
    });
    if (!validation.valid) {
      return c.json({ error: 'invalid_stay', issues: validation.issues }, 422);
    }

    // la propia reserva no ocupa contra sí misma
    const otherBookings = data.bookings.filter((b) => b.id !== booking.id);
    const availability = searchAvailability({
      dateFrom: body.dateFrom,
      dateTo: body.dateTo,
      unitTypes: [unitType],
      units: data.units,
      bookings: otherBookings,
      blocks: data.blocks,
      seasons: data.seasons,
      holds,
      now,
    })[0]!;
    if (availability.status !== 'available') {
      return c.json(
        { error: availability.status === 'closed' ? 'closed' : 'no_availability' },
        409,
      );
    }

    // re-cotización COMPLETA en servidor: el desglose nuevo sustituye al viejo entero
    const requiredIds = await loadRequiredExtraIds(db);
    const extras = await loadExtras(db, [...new Set([...body.extraIds, ...requiredIds])]);
    let result;
    try {
      result = quote({
        unitType,
        dateFrom: body.dateFrom,
        dateTo: body.dateTo,
        occupancy,
        seasons: data.seasons,
        ratePlans: data.ratePlans,
        extras,
        currency: CURRENCY,
        withElectricity: body.withElectricity,
      });
    } catch (e) {
      if (e instanceof ClosedError) return c.json({ error: 'closed' }, 422);
      throw e;
    }
    const touristTaxCents = calculateTouristTax(
      occupancy,
      result.nights,
      TAX_POLICIES[tenantConfig.taxPolicy]!,
    );

    if (
      await paymentIntentRequiresReplacement(
        db,
        booking.id,
        booking.totalCents,
        result.breakdown.totalCents,
      )
    ) {
      return c.json(
        {
          error: 'payment_intent_replacement_required',
          previousTotalCents: booking.totalCents,
          totalCents: result.breakdown.totalCents,
        },
        409,
      );
    }

    const assignment = assignUnit({
      unitTypeId: unitType.id,
      dateFrom: body.dateFrom,
      dateTo: body.dateTo,
      units: data.units,
      bookings: otherBookings,
      blocks: data.blocks,
    });

    const ts = nowIso();
    await db.batch([
      db
        .update(schema.bookings)
        .set({
          dateFrom: body.dateFrom,
          dateTo: body.dateTo,
          unitId: assignment?.unitId ?? null,
          extras: extras.map((e) => ({ extraId: e.id, qty: e.qty, amountCents: e.priceCents })),
          priceBreakdown: { ...result.breakdown, touristTaxCents },
          totalCents: result.breakdown.totalCents,
          touristTaxCents,
          updatedAt: ts,
        })
        .where(eq(schema.bookings.id, booking.id)),
      db.insert(schema.auditLog).values({
        id: uid('aud'),
        tenantId: c.get('tenant').slug,
        userId: null,
        entity: 'booking',
        entityId: booking.id,
        action: 'modify',
        diff: {
          via: 'web',
          actor: 'guest',
          from: {
            dateFrom: booking.dateFrom,
            dateTo: booking.dateTo,
            totalCents: booking.totalCents,
          },
          to: {
            dateFrom: body.dateFrom,
            dateTo: body.dateTo,
            totalCents: result.breakdown.totalCents,
          },
        },
        createdAt: ts,
      }),
    ]);

    return c.json({
      code: booking.code,
      status: booking.status,
      dateFrom: body.dateFrom,
      dateTo: body.dateTo,
      unitId: assignment?.unitId ?? null,
      totalCents: result.breakdown.totalCents,
      paidCents: booking.paidCents,
      touristTaxCents,
      breakdown: { ...result.breakdown, touristTaxCents },
    });
  })

  // ---------- webhooks de pago (ADR 0011 §4) ----------
  .post('/payments/webhook/:provider', async (c) => {
    const providerName = c.req.param('provider');
    if (providerName !== 'stripe' && providerName !== 'redsys') {
      return c.json({ error: 'unknown_provider' }, 404);
    }
    const db = c.get('tenant').db;
    const config = await loadPaymentsConfig(db);
    if (config.provider !== providerName) return c.json({ error: 'provider_mismatch' }, 404);
    const provider = resolveProvider(config, c.env);
    if (!provider) return c.json({ error: 'payment_not_configured' }, 500);

    const rawBody = await c.req.text();
    const event = await provider.parseWebhook({ headers: c.req.raw.headers, rawBody });
    if (!event) return c.json({ error: 'invalid_signature' }, 400);

    const outcome = await recordPaymentEvent(db, providerName, event);
    if (
      outcome.kind === 'amount_mismatch' ||
      outcome.kind === 'unverifiable_amount' ||
      outcome.kind === 'payment_conflict'
    ) {
      const ref = uid('err');
      logEvent({
        level: 'warn',
        event: 'payment_webhook_rejected',
        tenant: c.get('tenant').slug,
        requestId: ref,
        provider: providerName,
        outcome: outcome.kind,
      });
      return c.json(
        {
          error:
            outcome.kind === 'amount_mismatch'
              ? 'payment_amount_mismatch'
              : outcome.kind === 'unverifiable_amount'
                ? 'payment_amount_unverifiable'
                : 'payment_conflict',
        },
        409,
      );
    }
    if (outcome.kind === 'recorded' && outcome.justConfirmed) {
      // booking_confirmed se dispara AHORA (Fase 8) porque es el momento real
      // en que la reserva pasa a confirmed — no en la creación (ADR 0011 §4)
      const booking = (
        await db.select().from(schema.bookings).where(eq(schema.bookings.id, outcome.bookingId))
      )[0];
      const lead = booking
        ? (
            await db
              .select({ name: schema.guests.name, email: schema.guests.email })
              .from(schema.bookingGuests)
              .innerJoin(schema.guests, eq(schema.guests.id, schema.bookingGuests.guestId))
              .where(
                and(
                  eq(schema.bookingGuests.bookingId, booking.id),
                  eq(schema.bookingGuests.isLead, true),
                ),
              )
          )[0]
        : undefined;
      if (booking && lead?.email) {
        await notifyBookingConfirmed(
          c,
          {
            unitTypeId: booking.unitTypeId,
            dateFrom: booking.dateFrom,
            dateTo: booking.dateTo,
            occupancy: booking.occupancy,
            holder: { name: lead.name, email: lead.email },
            locale: booking.locale,
          },
          {
            id: booking.id,
            code: booking.code,
            totalCents: booking.totalCents,
            touristTaxCents: booking.touristTaxCents,
            breakdown: booking.priceBreakdown,
          },
        );
      }
    }
    return c.json({ ok: true, outcome: outcome.kind });
  });
