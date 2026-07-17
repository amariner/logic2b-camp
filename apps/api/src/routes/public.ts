import {
  assignUnit,
  calculateTouristTax,
  ClosedError,
  quote,
  searchAvailability,
  TAX_POLICIES,
  validateStay,
  type Occupancy,
} from '@logic-camp/core';
import { schema } from '@logic-camp/db';
import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { loadEngineData, loadExtras, loadRequiredExtraIds } from '../data';
import {
  availabilityQuerySchema,
  bookingRequestSchema,
  enquiryRequestSchema,
  quoteRequestSchema,
} from '../schemas';
import type { Env } from '../tenant';

const CURRENCY = 'EUR';
/** Política de tasa del tenant — de TenantConfig en Fase 9; demo = valencia */
const TAX_POLICY = TAX_POLICIES.valencia!;

const uid = (prefix: string) => `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
const nowIso = () => new Date().toISOString();

/** edades sintéticas cuando la búsqueda solo trae el número de niños */
const childAges = (n: number) => Array.from({ length: n }, () => 8);

export const publicRoutes = new Hono<Env>()
  .get('/availability', async (c) => {
    const parsed = availabilityQuerySchema.safeParse(c.req.query());
    if (!parsed.success) return c.json({ error: 'invalid_query', issues: parsed.error.issues }, 400);
    const q = parsed.data;
    if (q.from >= q.to) return c.json({ error: 'invalid_dates' }, 400);

    const data = await loadEngineData(c.get('tenant').db);
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

    return c.json({ from: q.from, to: q.to, results: items });
  })

  .post('/quote', async (c) => {
    const parsed = quoteRequestSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'invalid_body', issues: parsed.error.issues }, 400);
    const body = parsed.data;
    const db = c.get('tenant').db;
    const data = await loadEngineData(db);

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
      const touristTaxCents = calculateTouristTax(body.occupancy, result.nights, TAX_POLICY);
      return c.json({
        ...result,
        breakdown: { ...result.breakdown, touristTaxCents },
      });
    } catch (e) {
      if (e instanceof ClosedError) return c.json({ error: 'closed' }, 422);
      throw e;
    }
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
    // Fase 7: hook onEnquiryReceived → email Resend
    return c.json({ id, status: 'new' }, 201);
  })

  .post('/bookings', async (c) => {
    const parsed = bookingRequestSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'invalid_body', issues: parsed.error.issues }, 400);
    const body = parsed.data;
    const tenant = c.get('tenant');
    const db = tenant.db;

    // idempotencia: misma clave → misma reserva (ADR 0004)
    const idemKey = c.req.header('Idempotency-Key');
    if (idemKey) {
      const existing = await db
        .select()
        .from(schema.meta)
        .where(eq(schema.meta.key, `idem:${idemKey}`));
      if (existing[0]) {
        const booking = await db
          .select()
          .from(schema.bookings)
          .where(eq(schema.bookings.id, existing[0].value));
        if (booking[0]) {
          return c.json(
            { id: booking[0].id, code: booking[0].code, status: booking[0].status, idempotent: true },
            200,
          );
        }
      }
    }

    const data = await loadEngineData(db);
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

    const availability = searchAvailability({
      dateFrom: body.dateFrom,
      dateTo: body.dateTo,
      unitTypes: [unitType],
      units: data.units,
      bookings: data.bookings,
      blocks: data.blocks,
      seasons: data.seasons,
    })[0]!;
    if (availability.status !== 'available') {
      return c.json({ error: availability.status === 'closed' ? 'closed' : 'no_availability' }, 409);
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
    const touristTaxCents = calculateTouristTax(body.occupancy, result.nights, TAX_POLICY);

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
        channel: 'web',
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
      ...(idemKey
        ? [db.insert(schema.meta).values({ key: `idem:${idemKey}`, value: id })]
        : []),
    ];

    // batch atómico: reserva + titular (+ clave de idempotencia) juntos o nada
    await db.batch(inserts as unknown as Parameters<typeof db.batch>[0]);

    // Fase 7: hook onBookingCreated → email confirmación
    return c.json(
      {
        id,
        code,
        status: 'confirmed',
        unitId: assignment?.unitId ?? null,
        totalCents: result.breakdown.totalCents,
        touristTaxCents,
        breakdown: { ...result.breakdown, touristTaxCents },
      },
      201,
    );
  })

  .get('/bookings/:code', async (c) => {
    const code = c.req.param('code');
    const email = c.req.query('email');
    if (!email) return c.json({ error: 'email_required' }, 400);
    const db = c.get('tenant').db;

    const rows = await db.select().from(schema.bookings).where(eq(schema.bookings.code, code));
    const booking = rows[0];
    if (!booking) return c.json({ error: 'not_found' }, 404);

    // gestión sin cuenta: código + email del titular deben coincidir
    const links = await db
      .select()
      .from(schema.bookingGuests)
      .where(and(eq(schema.bookingGuests.bookingId, booking.id), eq(schema.bookingGuests.isLead, true)));
    const lead = links[0]
      ? (await db.select().from(schema.guests).where(eq(schema.guests.id, links[0].guestId)))[0]
      : undefined;
    if (!lead || lead.email?.toLowerCase() !== email.toLowerCase()) {
      return c.json({ error: 'not_found' }, 404);
    }

    return c.json({
      code: booking.code,
      status: booking.status,
      dateFrom: booking.dateFrom,
      dateTo: booking.dateTo,
      unitTypeId: booking.unitTypeId,
      occupancy: booking.occupancy,
      totalCents: booking.totalCents,
      paidCents: booking.paidCents,
      touristTaxCents: booking.touristTaxCents,
      breakdown: booking.priceBreakdown,
    });
  });
