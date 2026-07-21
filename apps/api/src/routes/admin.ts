/**
 * API privada del dashboard (ADR 0005). Montada en /api/admin tras requireRole:
 * readonly=GETs · reception=operativa · manager=tarifas/ajustes · owner=usuarios.
 * Toda mutación deja rastro en audit_log.
 */
import {
  calculateCancellationRefund,
  calculateTouristTax,
  ClosedError,
  quote,
  searchAvailability,
  TAX_POLICIES,
  validateStay,
} from '@logic-camp/core';
import { schema, type Db } from '@logic-camp/db';
import { and, desc, eq, gt, inArray, like, lt, ne, or } from 'drizzle-orm';
import { Hono } from 'hono';
import { provisionUser, requireRole, type AuthEnv } from '../auth';
import { createBooking, nowIso, uid } from '../bookings';
import { loadEngineData, loadExtras, loadRequiredExtraIds } from '../data';
import { notifyBookingCancelled, notifyBookingConfirmed } from '../notify';
import { CONSENT_VERSION } from '../consent';
import { executeRefund, recordManualPayment } from '../payments';
import { anonymizeGuest, exportGuest, sweepRetention } from '../rgpd';
import {
  adminBookingCreateSchema,
  blockCreateSchema,
  bookingActionSchema,
  bookingsListQuerySchema,
  enquiryPatchSchema,
  guestCreateSchema,
  guestPatchSchema,
  guestsListQuerySchema,
  notificationsListQuerySchema,
  paymentsListQuerySchema,
  planningQuerySchema,
  ratePatchSchema,
  requoteSchema,
  reportsQuerySchema,
  settingsPatchSchema,
  unitPatchSchema,
  userCreateSchema,
} from '../schemas';
import { loadTenantConfig } from '../tenant-config';

/** Transiciones de estado permitidas. Lo que no está aquí, es 409. */
const TRANSITIONS: Record<
  string,
  { from: string[]; to: 'confirmed' | 'cancelled' | 'no_show' | 'completed' }
> = {
  confirm: { from: ['pending'], to: 'confirmed' },
  cancel: { from: ['pending', 'confirmed'], to: 'cancelled' },
  no_show: { from: ['confirmed'], to: 'no_show' },
  complete: { from: ['confirmed'], to: 'completed' },
};

const nightsBetween = (from: string, to: string) =>
  Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

/**
 * Validación + re-cotización de un cambio de fechas/unidad (ADR 0023, C1).
 * La comparten el dry-run (`POST /bookings/:id/requote`) y la escritura
 * (`PATCH action:'move'`): lo que se previsualiza y lo que se escribe salen del
 * MISMO cálculo, siempre en servidor. Nunca escribe nada.
 */
async function quoteMove(
  db: Db,
  booking: typeof schema.bookings.$inferSelect,
  target: { dateFrom: string; dateTo: string; unitId?: string },
): Promise<
  | { ok: false; status: 400 | 404 | 409 | 422; body: Record<string, unknown> }
  | {
      ok: true;
      targetUnitId: string | null;
      nights: number;
      totalCents: number;
      touristTaxCents: number;
      breakdown: Record<string, unknown>;
      extras: Awaited<ReturnType<typeof loadExtras>>;
    }
> {
  if (target.dateFrom >= target.dateTo)
    return { ok: false, status: 400, body: { error: 'invalid_dates' } };
  // solo una reserva viva se mueve: completada/cancelada/no-show son historia
  if (booking.status !== 'pending' && booking.status !== 'confirmed')
    return { ok: false, status: 409, body: { error: 'invalid_state', status: booking.status } };

  const data = await loadEngineData(db);
  const unitType = data.unitTypes.find((t) => t.id === booking.unitTypeId);
  if (!unitType) return { ok: false, status: 404, body: { error: 'unknown_unit_type' } };

  // unidad destino: la pedida (arrastre diagonal) o la que ya tiene; puede ser ninguna
  let targetUnitId = booking.unitId;
  if (target.unitId) {
    const unit = data.units.find((u) => u.id === target.unitId);
    if (!unit || unit.status !== 'active')
      return { ok: false, status: 404, body: { error: 'unknown_unit' } };
    if (unit.unitTypeId !== booking.unitTypeId)
      return { ok: false, status: 409, body: { error: 'unit_type_mismatch' } };
    targetUnitId = unit.id;
  }

  // qué se contrató (electricidad): el desglose auditable es la fuente de verdad
  const withElectricity = booking.priceBreakdown.lines.some(
    (l) => l.concept === 'price.electricity',
  );

  const validation = validateStay({
    unitType,
    dateFrom: target.dateFrom,
    dateTo: target.dateTo,
    occupancy: booking.occupancy,
    seasons: data.seasons,
    ratePlans: data.ratePlans,
    needsElectricity: withElectricity,
  });
  if (!validation.valid)
    return { ok: false, status: 422, body: { error: 'invalid_stay', issues: validation.issues } };

  // solape contra el destino (from inclusive / to exclusive), excluyéndose a sí misma
  const others = data.bookings.filter((b) => b.id !== booking.id);
  if (targetUnitId) {
    const clash = others.some(
      (b) => b.unitId === targetUnitId && b.dateFrom < target.dateTo && b.dateTo > target.dateFrom,
    );
    const blocked = data.blocks.some(
      (blk) =>
        (blk.unitId === targetUnitId || (!blk.unitId && blk.unitTypeId === booking.unitTypeId)) &&
        blk.dateFrom < target.dateTo &&
        blk.dateTo > target.dateFrom,
    );
    if (clash || blocked) return { ok: false, status: 409, body: { error: 'unit_occupied' } };
  } else {
    // sin unidad asignada: basta con que el TIPO tenga hueco en las fechas nuevas
    const availability = searchAvailability({
      dateFrom: target.dateFrom,
      dateTo: target.dateTo,
      unitTypes: [unitType],
      units: data.units,
      bookings: others,
      blocks: data.blocks,
      seasons: data.seasons,
    })[0]!;
    if (availability.status !== 'available')
      return {
        ok: false,
        status: 409,
        body: { error: availability.status === 'closed' ? 'closed' : 'no_availability' },
      };
  }

  // re-cotización COMPLETA con los extras ya contratados (+ obligatorios)
  const requiredIds = await loadRequiredExtraIds(db);
  const contracted = (booking.extras ?? []).map((e) => e.extraId);
  const extras = await loadExtras(db, [...new Set([...contracted, ...requiredIds])]);
  let result;
  try {
    result = quote({
      unitType,
      dateFrom: target.dateFrom,
      dateTo: target.dateTo,
      occupancy: booking.occupancy,
      seasons: data.seasons,
      ratePlans: data.ratePlans,
      extras,
      currency: 'EUR',
      withElectricity,
    });
  } catch (e) {
    if (e instanceof ClosedError) return { ok: false, status: 422, body: { error: 'closed' } };
    throw e;
  }
  const tenantConfig = await loadTenantConfig(db);
  const touristTaxCents = calculateTouristTax(
    booking.occupancy,
    result.nights,
    TAX_POLICIES[tenantConfig.taxPolicy]!,
  );

  return {
    ok: true,
    targetUnitId,
    nights: result.nights,
    totalCents: result.breakdown.totalCents,
    touristTaxCents,
    breakdown: { ...result.breakdown, touristTaxCents },
    extras,
  };
}

async function audit(
  db: Db,
  tenantId: string,
  userId: string,
  entity: string,
  entityId: string,
  action: string,
  diff?: Record<string, unknown>,
) {
  await db.insert(schema.auditLog).values({
    id: uid('aud'),
    tenantId,
    userId,
    entity,
    entityId,
    action,
    diff: diff ?? null,
    createdAt: nowIso(),
  });
}

export const adminRoutes = new Hono<AuthEnv>()
  // sesión + rol mínimo para TODO el bloque; cada mutación exige el suyo
  .use('*', requireRole('readonly'))

  // ---------- Planning (el SELECT del tape chart — Fase 6 solo pinta) ----------
  .get('/planning', async (c) => {
    const parsed = planningQuerySchema.safeParse(c.req.query());
    if (!parsed.success)
      return c.json({ error: 'invalid_query', issues: parsed.error.issues }, 400);
    const { from, to } = parsed.data;
    if (from >= to) return c.json({ error: 'invalid_dates' }, 400);
    const db = c.get('tenant').db;

    const [types, units, seasons, bookings, blocks] = await Promise.all([
      db.select().from(schema.unitTypes),
      db.select().from(schema.units).orderBy(schema.units.code),
      // temporadas: la franja de contexto de la cabecera (ADR 0023 §3)
      db.select().from(schema.seasonsCalendar),
      db
        .select({
          id: schema.bookings.id,
          code: schema.bookings.code,
          status: schema.bookings.status,
          unitTypeId: schema.bookings.unitTypeId,
          unitId: schema.bookings.unitId,
          dateFrom: schema.bookings.dateFrom,
          dateTo: schema.bookings.dateTo,
          occupancy: schema.bookings.occupancy,
          // "en casa" (ADR 0022): el planning y el plano lo derivan de estos dos
          checkedInAt: schema.bookings.checkedInAt,
          checkedOutAt: schema.bookings.checkedOutAt,
        })
        .from(schema.bookings)
        .where(
          and(
            ne(schema.bookings.status, 'cancelled'),
            lt(schema.bookings.dateFrom, to),
            gt(schema.bookings.dateTo, from),
          ),
        ),
      db
        .select()
        .from(schema.inventoryBlocks)
        .where(
          and(lt(schema.inventoryBlocks.dateFrom, to), gt(schema.inventoryBlocks.dateTo, from)),
        ),
    ]);

    return c.json({ from, to, unitTypes: types, units, seasons, bookings, blocks });
  })

  // ---------- Catálogo (tipos + unidades + extras: estable, para selects y formularios) ----------
  .get('/catalog', async (c) => {
    const db = c.get('tenant').db;
    const [types, units, extras] = await Promise.all([
      db.select().from(schema.unitTypes),
      db.select().from(schema.units).orderBy(schema.units.code),
      db.select().from(schema.extras),
    ]);
    return c.json({ unitTypes: types, units, extras });
  })

  // ---------- Plano del camping (ADR 0021, C7): la geometría vive en modules.plano ----------
  // GENÉRICO: no importa ni un dato de tenant; solo devuelve el descriptor JSON que
  // el seed materializó desde tenants/{slug}/plano.ts. `null` si el camping no tiene
  // plano definido → el dashboard degrada a un layout autogenerado (autoPlano).
  .get('/map', async (c) => {
    const db = c.get('tenant').db;
    const row = (await db.select({ modules: schema.tenants.modules }).from(schema.tenants))[0];
    const plano = (row?.modules as { plano?: unknown } | undefined)?.plano ?? null;
    return c.json({ plano });
  })

  // baja/alta de servicio de una unidad (inventario). No toca reservas existentes:
  // solo impide asignar/reasignar hacia ella y sale del cupo de disponibilidad.
  .patch('/units/:id', requireRole('manager'), async (c) => {
    const parsed = unitPatchSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'invalid_body', issues: parsed.error.issues }, 400);
    const tenant = c.get('tenant');
    const db = tenant.db;
    const id = c.req.param('id');

    const unit = (await db.select().from(schema.units).where(eq(schema.units.id, id)))[0];
    if (!unit) return c.json({ error: 'not_found' }, 404);

    await db
      .update(schema.units)
      .set({ status: parsed.data.status })
      .where(eq(schema.units.id, id));
    await audit(db, tenant.slug, c.get('user').id, 'unit', id, 'status', {
      from: unit.status,
      to: parsed.data.status,
    });
    return c.json({ id, status: parsed.data.status });
  })

  // ---------- Reservas ----------
  .get('/bookings', async (c) => {
    const parsed = bookingsListQuerySchema.safeParse(c.req.query());
    if (!parsed.success)
      return c.json({ error: 'invalid_query', issues: parsed.error.issues }, 400);
    const q = parsed.data;
    const db = c.get('tenant').db;

    const filters = [
      ...(q.status ? [eq(schema.bookings.status, q.status)] : []),
      ...(q.from ? [gt(schema.bookings.dateTo, q.from)] : []),
      ...(q.to ? [lt(schema.bookings.dateFrom, q.to)] : []),
      ...(q.arrivalsOn ? [eq(schema.bookings.dateFrom, q.arrivalsOn)] : []),
      ...(q.departuresOn ? [eq(schema.bookings.dateTo, q.departuresOn)] : []),
      ...(q.q ? [like(schema.bookings.code, `${q.q}%`)] : []),
    ];
    const rows = await db
      .select({
        booking: schema.bookings,
        unitCode: schema.units.code,
        leadName: schema.guests.name,
        leadSurname: schema.guests.surname,
      })
      .from(schema.bookings)
      .leftJoin(schema.units, eq(schema.bookings.unitId, schema.units.id))
      .leftJoin(
        schema.bookingGuests,
        and(
          eq(schema.bookingGuests.bookingId, schema.bookings.id),
          eq(schema.bookingGuests.isLead, true),
        ),
      )
      .leftJoin(schema.guests, eq(schema.guests.id, schema.bookingGuests.guestId))
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(schema.bookings.createdAt))
      .limit(q.pageSize)
      .offset((q.page - 1) * q.pageSize);

    return c.json({
      page: q.page,
      pageSize: q.pageSize,
      items: rows.map((r) => ({
        ...r.booking,
        unitCode: r.unitCode,
        leadName: r.leadName ? `${r.leadName} ${r.leadSurname ?? ''}`.trim() : null,
      })),
    });
  })

  .get('/bookings/:id', async (c) => {
    const db = c.get('tenant').db;
    const id = c.req.param('id');
    const booking = (await db.select().from(schema.bookings).where(eq(schema.bookings.id, id)))[0];
    if (!booking) return c.json({ error: 'not_found' }, 404);

    const links = await db
      .select()
      .from(schema.bookingGuests)
      .where(eq(schema.bookingGuests.bookingId, id));
    const guests = links.length
      ? await db
          .select()
          .from(schema.guests)
          .where(
            inArray(
              schema.guests.id,
              links.map((l) => l.guestId),
            ),
          )
      : [];
    const payments = await db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.bookingId, id));
    const unit = booking.unitId
      ? (await db.select().from(schema.units).where(eq(schema.units.id, booking.unitId)))[0]
      : undefined;

    return c.json({
      ...booking,
      unitCode: unit?.code ?? null,
      guests: guests.map((g) => ({
        ...g,
        isLead: links.find((l) => l.guestId === g.id)?.isLead ?? false,
      })),
      payments,
    });
  })

  // alta manual: mismo motor y mismo precio-en-servidor que la ruta pública
  .post('/bookings', requireRole('reception'), async (c) => {
    const parsed = adminBookingCreateSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'invalid_body', issues: parsed.error.issues }, 400);
    const { channel, preferredUnitId, ...body } = parsed.data;

    const tenant = c.get('tenant');
    const tenantConfig = await loadTenantConfig(tenant.db);
    const result = await createBooking(tenant, body, {
      channel,
      idemKey: c.req.header('Idempotency-Key'),
      taxPolicy: TAX_POLICIES[tenantConfig.taxPolicy]!,
      preferredUnitId,
    });
    if (result.ok && result.status === 201) {
      await audit(
        tenant.db,
        tenant.slug,
        c.get('user').id,
        'booking',
        String(result.body.id),
        'create',
        {
          channel,
        },
      );
      await notifyBookingConfirmed(
        c,
        body,
        result.body as Parameters<typeof notifyBookingConfirmed>[2],
      );
    }
    return c.json(result.body, result.status);
  })

  // dry-run del gesto horizontal (ADR 0023): valida y cotiza un cambio de
  // fechas/unidad SIN escribir. El cliente lo llama al soltar el arrastre para
  // enseñar el desglose nuevo antes de confirmar si el importe cambia.
  .post('/bookings/:id/requote', requireRole('reception'), async (c) => {
    const parsed = requoteSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'invalid_body', issues: parsed.error.issues }, 400);
    const db = c.get('tenant').db;
    const id = c.req.param('id');
    const booking = (await db.select().from(schema.bookings).where(eq(schema.bookings.id, id)))[0];
    if (!booking) return c.json({ error: 'not_found' }, 404);

    const q = await quoteMove(db, booking, parsed.data);
    if (!q.ok) return c.json(q.body, q.status);
    return c.json({
      nights: q.nights,
      totalCents: q.totalCents,
      previousTotalCents: booking.totalCents,
      breakdown: q.breakdown,
      unitId: q.targetUnitId,
    });
  })

  .patch('/bookings/:id', requireRole('reception'), async (c) => {
    const parsed = bookingActionSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'invalid_body', issues: parsed.error.issues }, 400);
    const action = parsed.data;
    const tenant = c.get('tenant');
    const db = tenant.db;
    const id = c.req.param('id');

    const booking = (await db.select().from(schema.bookings).where(eq(schema.bookings.id, id)))[0];
    if (!booking) return c.json({ error: 'not_found' }, 404);

    if (action.action === 'note') {
      await db
        .update(schema.bookings)
        .set({ notes: action.notes, updatedAt: nowIso() })
        .where(eq(schema.bookings.id, id));
      await audit(db, tenant.slug, c.get('user').id, 'booking', id, 'note');
      return c.json({ id, notes: action.notes });
    }

    // Check-in / check-out (ADR 0022): hechos ortogonales al status, no
    // transiciones. "En casa" = checkedInAt != null && checkedOutAt == null; el
    // status sigue 'confirmed', así que ocupación e informes no se enteran.
    if (
      action.action === 'check_in' ||
      action.action === 'check_out' ||
      action.action === 'undo_checkin'
    ) {
      const inHouse = Boolean(booking.checkedInAt) && !booking.checkedOutAt;
      if (action.action === 'check_in') {
        if (booking.status !== 'confirmed' || booking.checkedInAt)
          return c.json({ error: 'invalid_checkin', status: booking.status }, 409);
        const at = nowIso();
        await db
          .update(schema.bookings)
          .set({ checkedInAt: at, updatedAt: at })
          .where(eq(schema.bookings.id, id));
        await audit(db, tenant.slug, c.get('user').id, 'booking', id, 'check_in');
        return c.json({ id, checkedInAt: at });
      }
      if (action.action === 'undo_checkin') {
        if (booking.status !== 'confirmed' || !inHouse)
          return c.json({ error: 'invalid_checkin', status: booking.status }, 409);
        await db
          .update(schema.bookings)
          .set({ checkedInAt: null, updatedAt: nowIso() })
          .where(eq(schema.bookings.id, id));
        await audit(db, tenant.slug, c.get('user').id, 'booking', id, 'undo_checkin');
        return c.json({ id, checkedInAt: null });
      }
      // check_out: cierra la estancia — sella checkedOutAt y completa (invariante
      // 3 intacto: no toca precio). Es el `complete` con recibo del mostrador.
      if (booking.status !== 'confirmed' || !inHouse)
        return c.json({ error: 'invalid_checkout', status: booking.status }, 409);
      const at = nowIso();
      await db
        .update(schema.bookings)
        .set({ checkedOutAt: at, status: 'completed', updatedAt: at })
        .where(eq(schema.bookings.id, id));
      await audit(db, tenant.slug, c.get('user').id, 'booking', id, 'check_out', {
        from: booking.status,
        to: 'completed',
      });
      return c.json({ id, status: 'completed', checkedOutAt: at });
    }

    // cobro en efectivo/TPV físico ya recibido en recepción (ADR 0011 §5) — sin pasarela
    if (action.action === 'record_payment') {
      // el cobro no puede pasar del pendiente (ADR 0022 §3): la guarda que el
      // reembolso ya tenía, ahora también aquí (simetría cliente↔servidor).
      const pending = booking.totalCents - booking.paidCents;
      if (action.amountCents > pending)
        return c.json({ error: 'payment_exceeds_pending', pendingCents: pending }, 422);
      await recordManualPayment(db, id, action.amountCents);
      await audit(db, tenant.slug, c.get('user').id, 'booking', id, 'record_payment', {
        amountCents: action.amountCents,
        method: action.method,
      });
      const updated = (
        await db.select().from(schema.bookings).where(eq(schema.bookings.id, id))
      )[0]!;
      return c.json({ id, paidCents: updated.paidCents });
    }

    // reembolso (ADR 0011 §5): nunca deja paidCents negativo; si hay cobro de
    // pasarela detrás, llama a provider.refund ANTES de escribir nada
    if (action.action === 'refund') {
      if (action.amountCents > booking.paidCents) {
        return c.json({ error: 'refund_exceeds_paid', paidCents: booking.paidCents }, 422);
      }
      const outcome = await executeRefund(db, c.env, id, action.amountCents);
      if (!outcome.ok) return c.json({ error: outcome.error }, 409);
      await audit(db, tenant.slug, c.get('user').id, 'booking', id, 'refund', {
        amountCents: action.amountCents,
      });
      const updated = (
        await db.select().from(schema.bookings).where(eq(schema.bookings.id, id))
      )[0]!;
      return c.json({ id, paidCents: updated.paidCents });
    }

    // mover/estirar fechas desde el tape chart (ADR 0023): re-cotiza SIEMPRE en
    // servidor; `expectedTotalCents` es el candado entre lo previsualizado y lo
    // que se escribe. `unitId` opcional = arrastre diagonal (fecha+unidad, un acto).
    if (action.action === 'move') {
      const q = await quoteMove(db, booking, action);
      if (!q.ok) return c.json(q.body, q.status);
      if (action.expectedTotalCents !== undefined && action.expectedTotalCents !== q.totalCents) {
        return c.json(
          {
            error: 'price_changed',
            totalCents: q.totalCents,
            previousTotalCents: booking.totalCents,
            breakdown: q.breakdown,
          },
          409,
        );
      }
      await db
        .update(schema.bookings)
        .set({
          dateFrom: action.dateFrom,
          dateTo: action.dateTo,
          unitId: q.targetUnitId,
          extras: q.extras.map((e) => ({ extraId: e.id, qty: e.qty, amountCents: e.priceCents })),
          priceBreakdown: q.breakdown as typeof booking.priceBreakdown,
          totalCents: q.totalCents,
          touristTaxCents: q.touristTaxCents,
          updatedAt: nowIso(),
        })
        .where(eq(schema.bookings.id, id));
      await audit(db, tenant.slug, c.get('user').id, 'booking', id, 'move', {
        from: {
          dateFrom: booking.dateFrom,
          dateTo: booking.dateTo,
          unitId: booking.unitId,
          totalCents: booking.totalCents,
        },
        to: {
          dateFrom: action.dateFrom,
          dateTo: action.dateTo,
          unitId: q.targetUnitId,
          totalCents: q.totalCents,
        },
      });
      return c.json({
        id,
        dateFrom: action.dateFrom,
        dateTo: action.dateTo,
        unitId: q.targetUnitId,
        totalCents: q.totalCents,
        breakdown: q.breakdown,
      });
    }

    if (action.action === 'reassign') {
      const unit = (
        await db.select().from(schema.units).where(eq(schema.units.id, action.unitId))
      )[0];
      if (!unit || unit.status !== 'active') return c.json({ error: 'unknown_unit' }, 404);
      if (unit.unitTypeId !== booking.unitTypeId)
        return c.json({ error: 'unit_type_mismatch' }, 409);

      // solape con otras reservas vivas de esa unidad (from inclusive, to exclusive)
      const clash = await db
        .select({ id: schema.bookings.id })
        .from(schema.bookings)
        .where(
          and(
            eq(schema.bookings.unitId, action.unitId),
            ne(schema.bookings.id, id),
            inArray(schema.bookings.status, ['pending', 'confirmed']),
            lt(schema.bookings.dateFrom, booking.dateTo),
            gt(schema.bookings.dateTo, booking.dateFrom),
          ),
        );
      const blocked = await db
        .select({ id: schema.inventoryBlocks.id })
        .from(schema.inventoryBlocks)
        .where(
          and(
            eq(schema.inventoryBlocks.unitId, action.unitId),
            lt(schema.inventoryBlocks.dateFrom, booking.dateTo),
            gt(schema.inventoryBlocks.dateTo, booking.dateFrom),
          ),
        );
      if (clash.length || blocked.length) return c.json({ error: 'unit_occupied' }, 409);

      await db
        .update(schema.bookings)
        .set({ unitId: action.unitId, updatedAt: nowIso() })
        .where(eq(schema.bookings.id, id));
      await audit(db, tenant.slug, c.get('user').id, 'booking', id, 'reassign', {
        from: booking.unitId,
        to: action.unitId,
      });
      return c.json({ id, unitId: action.unitId });
    }

    // transición de estado. Cancelar libera inventario en el mismo acto (invariante 4):
    // la disponibilidad se calcula sobre reservas vivas, y el estado cambia aquí.
    const t = TRANSITIONS[action.action]!;
    if (!t.from.includes(booking.status)) {
      return c.json(
        { error: 'invalid_transition', from: booking.status, action: action.action },
        409,
      );
    }
    await db
      .update(schema.bookings)
      .set({ status: t.to, updatedAt: nowIso() })
      .where(eq(schema.bookings.id, id));
    await audit(db, tenant.slug, c.get('user').id, 'booking', id, action.action, {
      from: booking.status,
      to: t.to,
    });
    // cancelación desde el mostrador: reembolso real según la política + email al titular
    if (t.to === 'cancelled') {
      const refund = calculateCancellationRefund(
        { dateFrom: booking.dateFrom, paidCents: booking.paidCents },
        (await loadTenantConfig(db)).cancellationPolicy,
        nowIso().slice(0, 10),
      );
      const refundOutcome = await executeRefund(db, c.env, id, refund.refundCents);
      const lead = (
        await db
          .select({ email: schema.guests.email })
          .from(schema.bookingGuests)
          .innerJoin(schema.guests, eq(schema.guests.id, schema.bookingGuests.guestId))
          .where(and(eq(schema.bookingGuests.bookingId, id), eq(schema.bookingGuests.isLead, true)))
      )[0];
      if (lead?.email) {
        await notifyBookingCancelled(
          c,
          booking,
          lead.email,
          refundOutcome.ok ? refundOutcome.refundedCents : 0,
        );
      }
    }
    return c.json({ id, status: t.to });
  })

  // ---------- Clientes (guests): la memoria comercial del camping ----------
  .get('/guests', async (c) => {
    const parsed = guestsListQuerySchema.safeParse(c.req.query());
    if (!parsed.success)
      return c.json({ error: 'invalid_query', issues: parsed.error.issues }, 400);
    const { q, page, pageSize } = parsed.data;
    const db = c.get('tenant').db;

    const filter = q
      ? or(
          like(schema.guests.name, `%${q}%`),
          like(schema.guests.surname, `%${q}%`),
          like(schema.guests.email, `%${q}%`),
        )
      : undefined;
    const rows = await db
      .select()
      .from(schema.guests)
      .where(filter)
      .orderBy(schema.guests.surname, schema.guests.name)
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    // historial agregado SOLO de la página pedida (dos consultas cortas, no un join N×M)
    const ids = rows.map((r) => r.id);
    const links = ids.length
      ? await db
          .select({
            guestId: schema.bookingGuests.guestId,
            bookingId: schema.bookingGuests.bookingId,
          })
          .from(schema.bookingGuests)
          .where(inArray(schema.bookingGuests.guestId, ids))
      : [];
    const bookingIds = [...new Set(links.map((l) => l.bookingId))];
    const stays = bookingIds.length
      ? await db
          .select({
            id: schema.bookings.id,
            dateFrom: schema.bookings.dateFrom,
            status: schema.bookings.status,
          })
          .from(schema.bookings)
          .where(inArray(schema.bookings.id, bookingIds))
      : [];
    const stayById = new Map(stays.map((s) => [s.id, s]));

    return c.json({
      page,
      pageSize,
      items: rows.map((g) => {
        const own = links
          .filter((l) => l.guestId === g.id)
          .map((l) => stayById.get(l.bookingId))
          .filter((s): s is NonNullable<typeof s> => Boolean(s))
          .filter((s) => s.status !== 'cancelled');
        return {
          ...g,
          bookingsCount: own.length,
          lastStay: own.reduce<string | null>(
            (max, s) => (max === null || s.dateFrom > max ? s.dateFrom : max),
            null,
          ),
        };
      }),
    });
  })

  .get('/guests/:id', async (c) => {
    const db = c.get('tenant').db;
    const id = c.req.param('id');
    const guest = (await db.select().from(schema.guests).where(eq(schema.guests.id, id)))[0];
    if (!guest) return c.json({ error: 'not_found' }, 404);

    const links = await db
      .select()
      .from(schema.bookingGuests)
      .where(eq(schema.bookingGuests.guestId, id));
    const bookings = links.length
      ? await db
          .select({
            id: schema.bookings.id,
            code: schema.bookings.code,
            status: schema.bookings.status,
            dateFrom: schema.bookings.dateFrom,
            dateTo: schema.bookings.dateTo,
            totalCents: schema.bookings.totalCents,
            channel: schema.bookings.channel,
            // "en casa" se DERIVA de estos dos (ADR 0022): el historial también
            // lo pinta, para no mostrar "Confirmada" a un huésped presente.
            checkedInAt: schema.bookings.checkedInAt,
            checkedOutAt: schema.bookings.checkedOutAt,
          })
          .from(schema.bookings)
          .where(
            inArray(
              schema.bookings.id,
              links.map((l) => l.bookingId),
            ),
          )
          .orderBy(desc(schema.bookings.dateFrom))
      : [];

    return c.json({
      ...guest,
      bookings: bookings.map((b) => ({
        ...b,
        isLead: links.find((l) => l.bookingId === b.id)?.isLead ?? false,
      })),
    });
  })

  // ---------- RGPD (ADR 0026 §2): derechos del interesado ----------
  // Art. 15 y 20: todo lo que el sistema sabe de esta persona, en un formato
  // estructurado. Rol gerencia: es un volcado de datos personales, no una consulta
  // de mostrador.
  .get('/guests/:id/export', requireRole('manager'), async (c) => {
    const tenant = c.get('tenant');
    const id = c.req.param('id');
    const data = await exportGuest(tenant.db, tenant.slug, id);
    if (!data) return c.json({ error: 'not_found' }, 404);
    // Entregar un export TAMBIÉN es un tratamiento: queda registrado quién lo pidió.
    await audit(tenant.db, tenant.slug, c.get('user').id, 'guest', id, 'export');
    return c.json(data);
  })

  // Art. 17: supresión. Nunca borra en duro — anonimiza, y si un plazo legal lo
  // impide responde 409 con la fecha exacta desde la que se podrá (ADR 0026 §2.2).
  .delete('/guests/:id', requireRole('manager'), async (c) => {
    const tenant = c.get('tenant');
    const id = c.req.param('id');
    const result = await anonymizeGuest(tenant.db, tenant.slug, id, {
      userId: c.get('user').id,
    });
    if (!result.ok && result.reason === 'not_found') return c.json({ error: 'not_found' }, 404);
    if (!result.ok) {
      return c.json(
        { error: 'retention_hold', until: result.until, basis: 'traveller_registry' },
        409,
      );
    }
    return c.json({ ok: true, alreadyDone: result.alreadyDone });
  })

  // Qué anonimizaría la purga automática si corriera ahora. Solo lectura: existe
  // para poder mirar ANTES, porque una anonimización no tiene vuelta atrás.
  .get('/rgpd/retention', requireRole('owner'), async (c) => {
    const tenant = c.get('tenant');
    return c.json(await sweepRetention(tenant.db, tenant.slug, { dryRun: true }));
  })

  // ---------- Huéspedes editables (ADR 0022 §2): parte de viajeros ----------
  // añadir un huésped a una reserva (crea guest + enlace). Si la reserva no tiene
  // titular, el primero pasa a serlo.
  .post('/bookings/:id/guests', requireRole('reception'), async (c) => {
    const parsed = guestCreateSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'invalid_body', issues: parsed.error.issues }, 400);
    const tenant = c.get('tenant');
    const db = tenant.db;
    const bookingId = c.req.param('id');

    const booking = (
      await db.select().from(schema.bookings).where(eq(schema.bookings.id, bookingId))
    )[0];
    if (!booking) return c.json({ error: 'not_found' }, 404);

    const existing = await db
      .select()
      .from(schema.bookingGuests)
      .where(eq(schema.bookingGuests.bookingId, bookingId));
    const isLead = existing.every((l) => !l.isLead);

    const guestId = uid('gst');
    const d = parsed.data;
    await db.insert(schema.guests).values({
      id: guestId,
      tenantId: tenant.slug,
      name: d.name,
      surname: d.surname,
      docType: d.docType ?? null,
      docNumber: d.docNumber ?? null,
      birthdate: d.birthdate ?? null,
      nationality: d.nationality ?? null,
      email: d.email || null,
      phone: d.phone ?? null,
      address: null,
      // ADR 0026 §2.3: antes esto era `null` fijo — recepción no tenía forma de
      // registrar un consentimiento que la doc publicada daba por guardado.
      gdprConsentAt: d.gdprConsent ? nowIso() : null,
      gdprConsentVersion: d.gdprConsent ? CONSENT_VERSION : null,
    });
    await db.insert(schema.bookingGuests).values({ bookingId, guestId, isLead });
    await audit(db, tenant.slug, c.get('user').id, 'booking', bookingId, 'guest_add', { guestId });
    return c.json({ id: guestId, isLead }, 201);
  })

  // quitar un ACOMPAÑANTE de una reserva (nunca al titular; el guest en sí no se
  // borra — es memoria comercial).
  .delete('/bookings/:id/guests/:guestId', requireRole('reception'), async (c) => {
    const tenant = c.get('tenant');
    const db = tenant.db;
    const bookingId = c.req.param('id');
    const guestId = c.req.param('guestId');

    const link = (
      await db
        .select()
        .from(schema.bookingGuests)
        .where(
          and(
            eq(schema.bookingGuests.bookingId, bookingId),
            eq(schema.bookingGuests.guestId, guestId),
          ),
        )
    )[0];
    if (!link) return c.json({ error: 'not_found' }, 404);
    if (link.isLead) return c.json({ error: 'cannot_remove_lead' }, 409);

    await db
      .delete(schema.bookingGuests)
      .where(
        and(
          eq(schema.bookingGuests.bookingId, bookingId),
          eq(schema.bookingGuests.guestId, guestId),
        ),
      );
    await audit(db, tenant.slug, c.get('user').id, 'booking', bookingId, 'guest_remove', {
      guestId,
    });
    return c.json({ ok: true });
  })

  // editar los datos y el documento de un huésped existente
  .patch('/guests/:id', requireRole('reception'), async (c) => {
    const parsed = guestPatchSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'invalid_body', issues: parsed.error.issues }, 400);
    if (!Object.keys(parsed.data).length) return c.json({ error: 'empty_patch' }, 400);
    const tenant = c.get('tenant');
    const db = tenant.db;
    const id = c.req.param('id');

    const guest = (await db.select().from(schema.guests).where(eq(schema.guests.id, id)))[0];
    if (!guest) return c.json({ error: 'not_found' }, 404);

    // una ficha ya anonimizada no se vuelve a rellenar: sería deshacer un derecho
    // de supresión ya ejercido (ADR 0026 §2.2)
    if (guest.anonymizedAt) return c.json({ error: 'anonymized' }, 409);

    // '' en email → null (el campo es opcional en la BD, no una cadena vacía)
    const { gdprConsent, ...rest } = parsed.data;
    const patch: Partial<typeof schema.guests.$inferInsert> = { ...rest };
    if (patch.email === '') patch.email = null;
    // el consentimiento es revocable: retirarlo borra fecha Y versión juntas, para
    // que no quede una versión huérfana que parezca un consentimiento vivo
    if (gdprConsent !== undefined) {
      patch.gdprConsentAt = gdprConsent ? nowIso() : null;
      patch.gdprConsentVersion = gdprConsent ? CONSENT_VERSION : null;
    }
    await db.update(schema.guests).set(patch).where(eq(schema.guests.id, id));
    await audit(db, tenant.slug, c.get('user').id, 'guest', id, 'update', parsed.data);
    const updated = (await db.select().from(schema.guests).where(eq(schema.guests.id, id)))[0];
    return c.json(updated);
  })

  // ---------- Bloqueos de inventario desde la UI (ADR 0022 §3) ----------
  // crear un bloqueo (avería, propietario…): por unidad O por tipo. No se puede
  // tapar sobre una reserva viva de esa unidad sin avisar (mismo criterio de
  // solape que reassign, from inclusive / to exclusive).
  .post('/blocks', requireRole('reception'), async (c) => {
    const parsed = blockCreateSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'invalid_body', issues: parsed.error.issues }, 400);
    const { unitId, unitTypeId, dateFrom, dateTo, reason } = parsed.data;
    const tenant = c.get('tenant');
    const db = tenant.db;

    // unidades afectadas: la unidad concreta, o todas las del tipo
    const targetUnitIds = unitId
      ? [unitId]
      : (
          await db
            .select({ id: schema.units.id })
            .from(schema.units)
            .where(eq(schema.units.unitTypeId, unitTypeId!))
        ).map((u) => u.id);
    if (unitId) {
      const unit = (await db.select().from(schema.units).where(eq(schema.units.id, unitId)))[0];
      if (!unit) return c.json({ error: 'unknown_unit' }, 404);
    }

    if (targetUnitIds.length) {
      const clash = await db
        .select({ id: schema.bookings.id })
        .from(schema.bookings)
        .where(
          and(
            inArray(schema.bookings.unitId, targetUnitIds),
            inArray(schema.bookings.status, ['pending', 'confirmed']),
            lt(schema.bookings.dateFrom, dateTo),
            gt(schema.bookings.dateTo, dateFrom),
          ),
        );
      if (clash.length) return c.json({ error: 'unit_occupied' }, 409);
    }

    const blockId = uid('blk');
    await db.insert(schema.inventoryBlocks).values({
      id: blockId,
      tenantId: tenant.slug,
      unitId: unitId ?? null,
      unitTypeId: unitTypeId ?? null,
      dateFrom,
      dateTo,
      reason,
    });
    await audit(db, tenant.slug, c.get('user').id, 'block', blockId, 'create', {
      unitId: unitId ?? null,
      unitTypeId: unitTypeId ?? null,
      dateFrom,
      dateTo,
      reason,
    });
    return c.json({ id: blockId }, 201);
  })

  // levantar un bloqueo
  .delete('/blocks/:id', requireRole('reception'), async (c) => {
    const tenant = c.get('tenant');
    const db = tenant.db;
    const id = c.req.param('id');
    const row = (
      await db.select().from(schema.inventoryBlocks).where(eq(schema.inventoryBlocks.id, id))
    )[0];
    if (!row) return c.json({ error: 'not_found' }, 404);
    await db.delete(schema.inventoryBlocks).where(eq(schema.inventoryBlocks.id, id));
    await audit(db, tenant.slug, c.get('user').id, 'block', id, 'delete');
    return c.json({ ok: true });
  })

  // ---------- Solicitudes ----------
  .get('/enquiries', async (c) => {
    const status = c.req.query('status');
    const db = c.get('tenant').db;
    const valid = ['new', 'contacted', 'quoted', 'converted', 'lost'] as const;
    const filter = valid.find((s) => s === status);
    const rows = await db
      .select()
      .from(schema.enquiries)
      .where(filter ? eq(schema.enquiries.status, filter) : undefined)
      .orderBy(desc(schema.enquiries.createdAt));
    return c.json({ items: rows });
  })

  .patch('/enquiries/:id', requireRole('reception'), async (c) => {
    const parsed = enquiryPatchSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'invalid_body', issues: parsed.error.issues }, 400);
    const tenant = c.get('tenant');
    const db = tenant.db;
    const id = c.req.param('id');

    const row = (await db.select().from(schema.enquiries).where(eq(schema.enquiries.id, id)))[0];
    if (!row) return c.json({ error: 'not_found' }, 404);

    await db
      .update(schema.enquiries)
      .set({ status: parsed.data.status })
      .where(eq(schema.enquiries.id, id));
    await audit(db, tenant.slug, c.get('user').id, 'enquiry', id, 'status', {
      from: row.status,
      to: parsed.data.status,
    });
    return c.json({ id, status: parsed.data.status });
  })

  // ---------- Log de notificaciones (ADR 0010 §BACKLOG 7.x) ----------
  .get('/notifications', async (c) => {
    const parsed = notificationsListQuerySchema.safeParse(c.req.query());
    if (!parsed.success)
      return c.json({ error: 'invalid_query', issues: parsed.error.issues }, 400);
    const { status, page, pageSize } = parsed.data;
    const db = c.get('tenant').db;

    const rows = await db
      .select()
      .from(schema.notificationsLog)
      .where(status ? eq(schema.notificationsLog.status, status) : undefined)
      .orderBy(desc(schema.notificationsLog.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    // destino a la vista (booking/enquiry) en dos consultas cortas de la
    // página pedida — mismo patrón que /guests, nunca un join N×M.
    const bookingIds = [
      ...new Set(rows.map((r) => r.bookingId).filter((v): v is string => Boolean(v))),
    ];
    const enquiryIds = [
      ...new Set(rows.map((r) => r.enquiryId).filter((v): v is string => Boolean(v))),
    ];
    const [bookingRows, enquiryRows] = await Promise.all([
      bookingIds.length
        ? db
            .select({ id: schema.bookings.id, code: schema.bookings.code })
            .from(schema.bookings)
            .where(inArray(schema.bookings.id, bookingIds))
        : Promise.resolve([]),
      enquiryIds.length
        ? db
            .select({ id: schema.enquiries.id, contact: schema.enquiries.contact })
            .from(schema.enquiries)
            .where(inArray(schema.enquiries.id, enquiryIds))
        : Promise.resolve([]),
    ]);
    const bookingCodeById = new Map(bookingRows.map((b) => [b.id, b.code]));
    const enquiryContactById = new Map(enquiryRows.map((e) => [e.id, e.contact]));

    return c.json({
      page,
      pageSize,
      items: rows.map((r) => ({
        ...r,
        bookingCode: r.bookingId ? (bookingCodeById.get(r.bookingId) ?? null) : null,
        enquiryContact: r.enquiryId ? (enquiryContactById.get(r.enquiryId) ?? null) : null,
      })),
    });
  })

  // ---------- Log de pagos (BACKLOG 8.x): payments YA es el log, esta pantalla lo hace visible ----------
  .get('/payments', async (c) => {
    const parsed = paymentsListQuerySchema.safeParse(c.req.query());
    if (!parsed.success)
      return c.json({ error: 'invalid_query', issues: parsed.error.issues }, 400);
    const { status, provider, page, pageSize } = parsed.data;
    const db = c.get('tenant').db;

    const filters = [
      ...(status ? [eq(schema.payments.status, status)] : []),
      ...(provider ? [eq(schema.payments.provider, provider)] : []),
    ];
    // bookingId es NOT NULL en payments — un join simple basta, sin la
    // resolución en dos pasos que sí hace falta en /notifications (destino opcional).
    const rows = await db
      .select({ payment: schema.payments, bookingCode: schema.bookings.code })
      .from(schema.payments)
      .innerJoin(schema.bookings, eq(schema.bookings.id, schema.payments.bookingId))
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(schema.payments.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return c.json({
      page,
      pageSize,
      items: rows.map((r) => ({ ...r.payment, bookingCode: r.bookingCode })),
    });
  })

  // ---------- Tarifas (cambiarlas JAMÁS toca reservas — invariante 3) ----------
  .get('/rates', async (c) => {
    const db = c.get('tenant').db;
    const [plans, seasons] = await Promise.all([
      db.select().from(schema.ratePlans),
      db.select().from(schema.seasonsCalendar),
    ]);
    return c.json({ ratePlans: plans, seasons });
  })

  .put('/rates/:id', requireRole('manager'), async (c) => {
    const parsed = ratePatchSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'invalid_body', issues: parsed.error.issues }, 400);
    if (!Object.keys(parsed.data).length) return c.json({ error: 'empty_patch' }, 400);
    const tenant = c.get('tenant');
    const db = tenant.db;
    const id = c.req.param('id');

    const row = (await db.select().from(schema.ratePlans).where(eq(schema.ratePlans.id, id)))[0];
    if (!row) return c.json({ error: 'not_found' }, 404);

    await db.update(schema.ratePlans).set(parsed.data).where(eq(schema.ratePlans.id, id));
    await audit(db, tenant.slug, c.get('user').id, 'rate_plan', id, 'update', parsed.data);
    const updated = (
      await db.select().from(schema.ratePlans).where(eq(schema.ratePlans.id, id))
    )[0];
    return c.json(updated);
  })

  // ---------- Informes ----------
  .get('/reports', async (c) => {
    const parsed = reportsQuerySchema.safeParse(c.req.query());
    if (!parsed.success)
      return c.json({ error: 'invalid_query', issues: parsed.error.issues }, 400);
    const { from, to } = parsed.data;
    if (from >= to) return c.json({ error: 'invalid_dates' }, 400);
    const db = c.get('tenant').db;

    const [types, units, rows] = await Promise.all([
      db.select().from(schema.unitTypes),
      db.select().from(schema.units).where(eq(schema.units.status, 'active')),
      db
        .select({
          status: schema.bookings.status,
          unitTypeId: schema.bookings.unitTypeId,
          dateFrom: schema.bookings.dateFrom,
          dateTo: schema.bookings.dateTo,
          totalCents: schema.bookings.totalCents,
          paidCents: schema.bookings.paidCents,
        })
        .from(schema.bookings)
        .where(
          and(
            inArray(schema.bookings.status, ['pending', 'confirmed', 'completed']),
            lt(schema.bookings.dateFrom, to),
            gt(schema.bookings.dateTo, from),
          ),
        ),
    ]);

    const rangeNights = nightsBetween(from, to);
    const clip = (b: { dateFrom: string; dateTo: string }) =>
      nightsBetween(b.dateFrom > from ? b.dateFrom : from, b.dateTo < to ? b.dateTo : to);

    const occupancy = types.map((t) => {
      const unitCount = units.filter((u) => u.unitTypeId === t.id).length;
      const occupied = rows.filter((b) => b.unitTypeId === t.id).reduce((s, b) => s + clip(b), 0);
      const capacity = unitCount * rangeNights;
      return {
        unitTypeId: t.id,
        units: unitCount,
        occupiedNights: occupied,
        capacityNights: capacity,
        occupancyPct: capacity ? Math.round((occupied / capacity) * 1000) / 10 : 0,
      };
    });

    // ingresos atribuidos por llegada dentro del rango
    const arrivals = rows.filter((b) => b.dateFrom >= from && b.dateFrom < to);
    const departures = rows.filter((b) => b.dateTo > from && b.dateTo <= to);

    return c.json({
      from,
      to,
      nights: rangeNights,
      occupancy,
      revenue: {
        totalCents: arrivals.reduce((s, b) => s + b.totalCents, 0),
        paidCents: arrivals.reduce((s, b) => s + b.paidCents, 0),
        bookings: arrivals.length,
      },
      arrivals: arrivals.length,
      departures: departures.length,
    });
  })

  // ---------- Ajustes ----------
  .get('/settings', async (c) => {
    const db = c.get('tenant').db;
    const row = (await db.select().from(schema.tenants))[0];
    if (!row) return c.json({ error: 'not_found' }, 404);
    return c.json(row);
  })

  .patch('/settings', requireRole('manager'), async (c) => {
    const parsed = settingsPatchSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'invalid_body', issues: parsed.error.issues }, 400);
    if (!Object.keys(parsed.data).length) return c.json({ error: 'empty_patch' }, 400);
    const tenant = c.get('tenant');
    const db = tenant.db;

    const row = (await db.select().from(schema.tenants))[0];
    if (!row) return c.json({ error: 'not_found' }, 404);

    await db.update(schema.tenants).set(parsed.data).where(eq(schema.tenants.id, row.id));
    await audit(db, tenant.slug, c.get('user').id, 'tenant', row.id, 'settings', parsed.data);
    const updated = (
      await db.select().from(schema.tenants).where(eq(schema.tenants.id, row.id))
    )[0];
    return c.json(updated);
  })

  // ---------- Usuarios (solo owner) ----------
  .get('/users', requireRole('owner'), async (c) => {
    const db = c.get('tenant').db;
    const rows = await db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        name: schema.users.name,
        role: schema.users.role,
      })
      .from(schema.users);
    return c.json({ items: rows });
  })

  .post('/users', requireRole('owner'), async (c) => {
    const parsed = userCreateSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'invalid_body', issues: parsed.error.issues }, 400);
    const tenant = c.get('tenant');

    try {
      const user = await provisionUser(c.env, parsed.data);
      await audit(tenant.db, tenant.slug, c.get('user').id, 'user', user.id, 'create', {
        role: user.role,
      });
      return c.json({ id: user.id, email: user.email, name: user.name, role: user.role }, 201);
    } catch {
      // email duplicado es el caso real; Better Auth lanza APIError
      return c.json({ error: 'user_exists' }, 409);
    }
  });
