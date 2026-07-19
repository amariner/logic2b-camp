/**
 * API privada del dashboard (ADR 0005). Montada en /api/admin tras requireRole:
 * readonly=GETs · reception=operativa · manager=tarifas/ajustes · owner=usuarios.
 * Toda mutación deja rastro en audit_log.
 */
import { calculateCancellationRefund, TAX_POLICIES } from '@logic-camp/core';
import { schema, type Db } from '@logic-camp/db';
import { and, desc, eq, gt, inArray, like, lt, ne, or } from 'drizzle-orm';
import { Hono } from 'hono';
import { provisionUser, requireRole, type AuthEnv } from '../auth';
import { createBooking, nowIso, uid } from '../bookings';
import { notifyBookingCancelled, notifyBookingConfirmed } from '../notify';
import { executeRefund, recordManualPayment } from '../payments';
import {
  adminBookingCreateSchema,
  bookingActionSchema,
  bookingsListQuerySchema,
  enquiryPatchSchema,
  guestsListQuerySchema,
  planningQuerySchema,
  ratePatchSchema,
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

    const [types, units, bookings, blocks] = await Promise.all([
      db.select().from(schema.unitTypes),
      db.select().from(schema.units).orderBy(schema.units.code),
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

    return c.json({ from, to, unitTypes: types, units, bookings, blocks });
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
    const { channel, ...body } = parsed.data;

    const tenant = c.get('tenant');
    const tenantConfig = await loadTenantConfig(tenant.db);
    const result = await createBooking(tenant, body, {
      channel,
      idemKey: c.req.header('Idempotency-Key'),
      taxPolicy: TAX_POLICIES[tenantConfig.taxPolicy]!,
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

    // cobro en efectivo/TPV físico ya recibido en recepción (ADR 0011 §5) — sin pasarela
    if (action.action === 'record_payment') {
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
