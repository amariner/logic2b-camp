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
import { eq } from 'drizzle-orm';
import { loadEngineData, loadExtras, loadLiveHolds, loadRequiredExtraIds } from './data';
import type { BookingRequest } from './schemas';
import type { TenantContext } from './tenant';

const CURRENCY = 'EUR';

export const uid = (prefix: string) =>
  `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
export const nowIso = () => new Date().toISOString();

export type CreateBookingResult =
  | { ok: false; status: 404 | 409 | 422; body: Record<string, unknown> }
  | { ok: true; status: 200 | 201; body: Record<string, unknown> };

export async function createBooking(
  tenant: TenantContext,
  body: BookingRequest,
  opts: {
    channel: 'web' | 'phone' | 'walkin';
    idemKey?: string | null;
    taxPolicy: Parameters<typeof calculateTouristTax>[2];
  },
): Promise<CreateBookingResult> {
  const db = tenant.db;

  // idempotencia: misma clave → misma reserva (ADR 0004)
  if (opts.idemKey) {
    const existing = await db
      .select()
      .from(schema.meta)
      .where(eq(schema.meta.key, `idem:${opts.idemKey}`));
    if (existing[0]) {
      const booking = await db
        .select()
        .from(schema.bookings)
        .where(eq(schema.bookings.id, existing[0].value));
      if (booking[0]) {
        return {
          ok: true,
          status: 200,
          body: {
            id: booking[0].id,
            code: booking[0].code,
            status: booking[0].status,
            idempotent: true,
          },
        };
      }
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

  const assignment = assignUnit({
    unitTypeId: unitType.id,
    dateFrom: body.dateFrom,
    dateTo: body.dateTo,
    units: data.units,
    bookings: data.bookings,
    blocks: data.blocks,
  });

  const id = uid('bkg');
  const code = `CS-${body.dateFrom.slice(0, 4)}-${crypto.randomUUID().replace(/\D/g, '').slice(0, 6)}`;
  const guestId = uid('gst');
  const ts = nowIso();

  const inserts = [
    db.insert(schema.bookings).values({
      id,
      tenantId: tenant.slug,
      code,
      status: 'confirmed', // pagos (Fase 8) introducirán 'pending'
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
      gdprConsentAt: ts,
    }),
    db.insert(schema.bookingGuests).values({ bookingId: id, guestId, isLead: true }),
    ...(opts.idemKey
      ? [db.insert(schema.meta).values({ key: `idem:${opts.idemKey}`, value: id })]
      : []),
    // el hold se consume EN la misma transacción que crea la reserva (ADR 0007)
    ...(body.holdId
      ? [db.delete(schema.inventoryHolds).where(eq(schema.inventoryHolds.id, body.holdId))]
      : []),
  ];

  // batch atómico: reserva + titular (+ clave de idempotencia + hold consumido) juntos o nada
  await db.batch(inserts as unknown as Parameters<typeof db.batch>[0]);

  // Fase 7: hook onBookingCreated → email confirmación
  return {
    ok: true,
    status: 201,
    body: {
      id,
      code,
      status: 'confirmed',
      unitId: assignment?.unitId ?? null,
      totalCents: result.breakdown.totalCents,
      touristTaxCents,
      breakdown: { ...result.breakdown, touristTaxCents },
    },
  };
}
