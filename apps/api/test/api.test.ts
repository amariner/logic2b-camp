/** Tests de integración de la API pública contra D1 real (workerd). */
import { createDb, schema } from '@logic-camp/db';
import { env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { seedTenant } from './fixtures';

const envA = { DB: env.DB, TENANT_SLUG: 'alfa' };
const envB = { DB: env.DB_B, TENANT_SLUG: 'beta' };

const json = (body: unknown, headers: Record<string, string> = {}) => ({
  method: 'POST',
  headers: { 'content-type': 'application/json', ...headers },
  body: JSON.stringify(body),
});

const bookingBody = (from: string, to: string) => ({
  unitTypeId: 'ut_std',
  dateFrom: from,
  dateTo: to,
  occupancy: { adults: 2, childrenAges: [], pets: 0, vehicles: 1 },
  extraIds: [],
  holder: { name: 'Test Holder', email: 'holder@example.com' },
  locale: 'es',
});

beforeAll(async () => {
  await seedTenant(env.DB, 'alfa');
  await seedTenant(env.DB_B, 'beta');
});

describe('GET /api/availability', () => {
  it('devuelve disponibilidad con precio calculado en servidor', async () => {
    const res = await app.request(
      '/api/availability?from=2026-05-01&to=2026-05-04&adults=2',
      {},
      envA,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { results: { status: string; totalPriceCents: number }[] };
    expect(body.results[0]!.status).toBe('available');
    expect(body.results[0]!.totalPriceCents).toBe(2000 * 3);
  });

  it('fuera de temporada devuelve closed, no unavailable', async () => {
    const res = await app.request('/api/availability?from=2026-12-01&to=2026-12-04', {}, envA);
    const body = (await res.json()) as { opensOn: string | null; results: { status: string }[] };
    expect(body.results[0]!.status).toBe('closed');
    // sin temporada futura en el calendario: no se inventa fecha de apertura
    expect(body.opensOn).toBeNull();
  });

  it('cerrado antes de la apertura anuncia la fecha real de seasons_calendar', async () => {
    const res = await app.request('/api/availability?from=2026-01-10&to=2026-01-13', {}, envA);
    const body = (await res.json()) as { opensOn: string | null; results: { status: string }[] };
    expect(body.results[0]!.status).toBe('closed');
    expect(body.opensOn).toBe('2026-03-15');
  });

  it('valida la query', async () => {
    const res = await app.request('/api/availability?from=nofecha&to=2026-05-04', {}, envA);
    expect(res.status).toBe(400);
  });
});

describe('POST /api/quote', () => {
  it('devuelve desglose completo con extras obligatorios y tasa turística', async () => {
    const res = await app.request(
      '/api/quote',
      json({
        unitTypeId: 'ut_std',
        dateFrom: '2026-05-01',
        dateTo: '2026-05-04',
        occupancy: { adults: 2, childrenAges: [3], pets: 0, vehicles: 1 },
      }),
      envA,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      breakdown: {
        lines: { concept: string; amountCents: number }[];
        totalCents: number;
        touristTaxCents: number;
      };
    };
    const concepts = body.breakdown.lines.map((l) => l.concept);
    expect(concepts).toContain('price.base');
    expect(concepts).toContain('extra.ext_limpieza'); // required aunque no se pida
    expect(body.breakdown.totalCents).toBe(
      body.breakdown.lines.reduce((s, l) => s + l.amountCents, 0),
    );
    // 2 adultos × 3 noches × 100c; el niño de 3 está exento
    expect(body.breakdown.touristTaxCents).toBe(600);
  });

  it('estancia inválida → 422 con TODOS los errores', async () => {
    const res = await app.request(
      '/api/quote',
      json({
        unitTypeId: 'ut_std',
        dateFrom: '2026-07-03',
        dateTo: '2026-07-04', // 1 noche en alta (min 3)
        occupancy: { adults: 7, childrenAges: [], pets: 0, vehicles: 1 }, // capacidad 6
      }),
      envA,
    );
    expect(res.status).toBe(422);
    const body = (await res.json()) as { issues: { code: string }[] };
    const codes = body.issues.map((i) => i.code);
    expect(codes).toContain('stay.min_stay');
    expect(codes).toContain('stay.capacity');
  });
});

describe('POST /api/enquiries', () => {
  it('guarda la solicitud SIEMPRE (nivel 1 incluido) y la persiste', async () => {
    const res = await app.request(
      '/api/enquiries',
      json({
        message: '¿Tenéis sitio en agosto?',
        contact: { name: 'Ana', email: 'ana@example.com' },
      }),
      envA,
    );
    expect(res.status).toBe(201);
    const { id } = (await res.json()) as { id: string };
    const rows = await createDb(env.DB).select().from(schema.enquiries);
    expect(rows.some((r) => r.id === id && r.status === 'new')).toBe(true);
  });
});

describe('POST /api/bookings', () => {
  it('crea la reserva con precio de servidor, unidad asignada y titular', async () => {
    const res = await app.request(
      '/api/bookings',
      json(bookingBody('2026-05-10', '2026-05-13')),
      envA,
    );
    expect(res.status).toBe(201);
    const body = (await res.json()) as { code: string; unitId: string; totalCents: number };
    expect(body.code).toMatch(/^CS-2026-/);
    expect(body.unitId).toBeTruthy();
    expect(body.totalCents).toBe(2000 * 3 + 1500); // base + limpieza obligatoria

    const db = createDb(env.DB);
    const stored = await db.select().from(schema.bookings);
    const mine = stored.find((b) => b.code === body.code)!;
    expect(mine.priceBreakdown.lines.length).toBeGreaterThan(0); // desglose auditable persistido
  });

  it('es idempotente con Idempotency-Key', async () => {
    const key = 'idem-test-1';
    const r1 = await app.request(
      '/api/bookings',
      json(bookingBody('2026-05-20', '2026-05-22'), { 'Idempotency-Key': key }),
      envA,
    );
    expect(r1.status).toBe(201);
    const b1 = (await r1.json()) as { code: string };

    const r2 = await app.request(
      '/api/bookings',
      json(bookingBody('2026-05-20', '2026-05-22'), { 'Idempotency-Key': key }),
      envA,
    );
    expect(r2.status).toBe(200);
    const b2 = (await r2.json()) as { code: string; idempotent: boolean };
    expect(b2.code).toBe(b1.code);
    expect(b2.idempotent).toBe(true);
  });

  it('rechaza cuando el tipo está agotado (409), liberando el día de salida', async () => {
    // 3 unidades → 3 reservas solapadas agotan; una 4ª no entra
    for (const i of [1, 2, 3]) {
      const r = await app.request(
        '/api/bookings',
        json(bookingBody('2026-06-01', '2026-06-05')),
        envA,
      );
      expect(r.status, `reserva ${i}`).toBe(201);
    }
    const full = await app.request(
      '/api/bookings',
      json(bookingBody('2026-06-03', '2026-06-06')),
      envA,
    );
    expect(full.status).toBe(409);
    // pero entrar el día que salen es válido (to exclusive)
    const backToBack = await app.request(
      '/api/bookings',
      json(bookingBody('2026-06-05', '2026-06-08')),
      envA,
    );
    expect(backToBack.status).toBe(201);
  });
});

describe('GET /api/bookings/:code', () => {
  it('recupera por código + email del titular; email equivocado → 404', async () => {
    const created = await app.request(
      '/api/bookings',
      json(bookingBody('2026-09-01', '2026-09-04')),
      envA,
    );
    const { code } = (await created.json()) as { code: string };

    const ok = await app.request(`/api/bookings/${code}?email=holder@example.com`, {}, envA);
    expect(ok.status).toBe(200);
    const body = (await ok.json()) as { code: string; totalCents: number };
    expect(body.code).toBe(code);

    const bad = await app.request(`/api/bookings/${code}?email=otro@example.com`, {}, envA);
    expect(bad.status).toBe(404);
  });
});

describe('FUNNEL (ADR 0007): holds', () => {
  const holdBody = (from: string, to: string) => ({
    unitTypeId: 'ut_std',
    dateFrom: from,
    dateTo: to,
    occupancy: { adults: 2, childrenAges: [], pets: 0, vehicles: 1 },
  });

  it('un hold resta disponibilidad y liberarlo la devuelve', async () => {
    const before = await app.request('/api/availability?from=2026-10-05&to=2026-10-08', {}, envA);
    const nBefore = ((await before.json()) as { results: { availableUnits: number }[] }).results[0]!
      .availableUnits;

    const created = await app.request(
      '/api/holds',
      json(holdBody('2026-10-05', '2026-10-08')),
      envA,
    );
    expect(created.status).toBe(201);
    const { holdId, expiresAt } = (await created.json()) as { holdId: string; expiresAt: string };
    expect(expiresAt > new Date().toISOString()).toBe(true);

    const during = await app.request('/api/availability?from=2026-10-05&to=2026-10-08', {}, envA);
    const nDuring = ((await during.json()) as { results: { availableUnits: number }[] }).results[0]!
      .availableUnits;
    expect(nDuring).toBe(nBefore - 1);

    const freed = await app.request(`/api/holds/${holdId}`, { method: 'DELETE' }, envA);
    expect(freed.status).toBe(204);
    const after = await app.request('/api/availability?from=2026-10-05&to=2026-10-08', {}, envA);
    const nAfter = ((await after.json()) as { results: { availableUnits: number }[] }).results[0]!
      .availableUnits;
    expect(nAfter).toBe(nBefore);
  });

  it('holds ajenos bloquean la reserva; el propio se consume en la misma transacción', async () => {
    // 3 unidades → 3 holds agotan el tipo
    const ids: string[] = [];
    for (const i of [1, 2, 3]) {
      const r = await app.request('/api/holds', json(holdBody('2026-10-12', '2026-10-15')), envA);
      expect(r.status, `hold ${i}`).toBe(201);
      ids.push(((await r.json()) as { holdId: string }).holdId);
    }
    const fourth = await app.request(
      '/api/holds',
      json(holdBody('2026-10-12', '2026-10-15')),
      envA,
    );
    expect(fourth.status).toBe(409);

    // sin hold no se puede reservar (los 3 holds ocupan)
    const noHold = await app.request(
      '/api/bookings',
      json(bookingBody('2026-10-12', '2026-10-15')),
      envA,
    );
    expect(noHold.status).toBe(409);

    // con SU hold sí: el propio no le bloquea y se consume atómicamente
    const withHold = await app.request(
      '/api/bookings',
      json({ ...bookingBody('2026-10-12', '2026-10-15'), holdId: ids[0] }),
      envA,
    );
    expect(withHold.status).toBe(201);
    const holdsLeft = await createDb(env.DB).select().from(schema.inventoryHolds);
    expect(holdsLeft.find((h) => h.id === ids[0])).toBeUndefined();

    // limpieza: liberar los otros dos holds
    for (const id of ids.slice(1))
      await app.request(`/api/holds/${id}`, { method: 'DELETE' }, envA);
  });

  it('un hold caducado no permite confirmar (hold_expired) y no ocupa', async () => {
    const db = createDb(env.DB);
    await db.insert(schema.inventoryHolds).values({
      id: 'hld_caducado',
      tenantId: 'alfa',
      unitTypeId: 'ut_std',
      dateFrom: '2026-10-20',
      dateTo: '2026-10-22',
      occupancy: { adults: 2, childrenAges: [], pets: 0, vehicles: 1 },
      expiresAt: '2026-01-01T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    const res = await app.request(
      '/api/bookings',
      json({ ...bookingBody('2026-10-20', '2026-10-22'), holdId: 'hld_caducado' }),
      envA,
    );
    expect(res.status).toBe(409);
    expect(((await res.json()) as { error: string }).error).toBe('hold_expired');

    // y no resta disponibilidad (expiración perezosa)
    const avail = await app.request('/api/availability?from=2026-10-20&to=2026-10-22', {}, envA);
    expect(
      ((await avail.json()) as { results: { availableUnits: number }[] }).results[0]!
        .availableUnits,
    ).toBe(3);
  });
});

describe('FUNNEL (ADR 0007): gestión por código + email', () => {
  it('el GET incluye la previsión de cancelación para reservas activas', async () => {
    const created = await app.request(
      '/api/bookings',
      json(bookingBody('2026-10-25', '2026-10-27')),
      envA,
    );
    const { code } = (await created.json()) as { code: string };

    const res = await app.request(`/api/bookings/${code}?email=holder@example.com`, {}, envA);
    const body = (await res.json()) as {
      cancellation: { appliedRefundPct: number; refundCents: number };
    };
    // con >30 días de antelación el tramo aplicado es el del 100%
    expect(body.cancellation.appliedRefundPct).toBe(100);
    expect(body.cancellation.refundCents).toBe(0); // sin pagos aún (Fase 8)
  });

  it('cancelar libera inventario y es terminal (segunda vez → 409)', async () => {
    const created = await app.request(
      '/api/bookings',
      json(bookingBody('2026-04-06', '2026-04-09')),
      envA,
    );
    const { code } = (await created.json()) as { code: string };

    const cancel = await app.request(
      `/api/bookings/${code}/cancel`,
      json({ email: 'holder@example.com' }),
      envA,
    );
    expect(cancel.status).toBe(200);
    expect(((await cancel.json()) as { status: string }).status).toBe('cancelled');

    // inventario liberado: vuelven a estar las 3 unidades
    const avail = await app.request('/api/availability?from=2026-04-06&to=2026-04-09', {}, envA);
    expect(
      ((await avail.json()) as { results: { availableUnits: number }[] }).results[0]!
        .availableUnits,
    ).toBe(3);

    const again = await app.request(
      `/api/bookings/${code}/cancel`,
      json({ email: 'holder@example.com' }),
      envA,
    );
    expect(again.status).toBe(409);
  });

  it('modificar re-cotiza entero en servidor y mantiene el desglose auditable', async () => {
    const created = await app.request(
      '/api/bookings',
      json(bookingBody('2026-04-13', '2026-04-16')),
      envA,
    );
    const { code, totalCents } = (await created.json()) as { code: string; totalCents: number };
    expect(totalCents).toBe(2000 * 3 + 1500);

    const res = await app.request(
      `/api/bookings/${code}/modify`,
      json({ email: 'holder@example.com', dateFrom: '2026-04-13', dateTo: '2026-04-17' }),
      envA,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      totalCents: number;
      breakdown: { totalCents: number; lines: unknown[] };
    };
    expect(body.totalCents).toBe(2000 * 4 + 1500);
    // invariante: el desglose nuevo cuadra con el total nuevo, nunca una cifra suelta
    expect(body.breakdown.totalCents).toBe(body.totalCents);
    expect(body.breakdown.lines.length).toBeGreaterThan(0);

    // email equivocado no puede modificar
    const bad = await app.request(
      `/api/bookings/${code}/modify`,
      json({ email: 'otro@example.com', dateFrom: '2026-04-13', dateTo: '2026-04-15' }),
      envA,
    );
    expect(bad.status).toBe(404);
  });

  it('modificar hacia fechas ocupadas devuelve 409 sin tocar la reserva', async () => {
    const created = await app.request(
      '/api/bookings',
      json(bookingBody('2026-04-20', '2026-04-22')),
      envA,
    );
    const { code } = (await created.json()) as { code: string };

    // agotar otras fechas con 3 holds
    const ids: string[] = [];
    for (let i = 0; i < 3; i++) {
      const r = await app.request(
        '/api/holds',
        json({ unitTypeId: 'ut_std', dateFrom: '2026-04-27', dateTo: '2026-04-29' }),
        envA,
      );
      ids.push(((await r.json()) as { holdId: string }).holdId);
    }

    const res = await app.request(
      `/api/bookings/${code}/modify`,
      json({ email: 'holder@example.com', dateFrom: '2026-04-27', dateTo: '2026-04-29' }),
      envA,
    );
    expect(res.status).toBe(409);

    // la reserva sigue intacta
    const check = await app.request(`/api/bookings/${code}?email=holder@example.com`, {}, envA);
    const body = (await check.json()) as { dateFrom: string; dateTo: string };
    expect(body.dateFrom).toBe('2026-04-20');
    expect(body.dateTo).toBe('2026-04-22');

    for (const id of ids) await app.request(`/api/holds/${id}`, { method: 'DELETE' }, envA);
  });
});

describe('AISLAMIENTO ENTRE TENANTS (invariante 5)', () => {
  it('lo escrito en el tenant A no existe en el tenant B', async () => {
    const created = await app.request(
      '/api/bookings',
      json(bookingBody('2026-10-01', '2026-10-04')),
      envA,
    );
    expect(created.status).toBe(201);
    const { code } = (await created.json()) as { code: string };

    // B no puede leer la reserva de A ni con el código correcto
    const cross = await app.request(`/api/bookings/${code}?email=holder@example.com`, {}, envB);
    expect(cross.status).toBe(404);

    // y su tabla bookings sigue vacía
    const inB = await createDb(env.DB_B).select().from(schema.bookings);
    expect(inB.find((b) => b.code === code)).toBeUndefined();

    // la app de B no comparte NADA del estado de A: ni solicitudes ni huéspedes
    const enquiriesB = await createDb(env.DB_B).select().from(schema.enquiries);
    expect(enquiriesB).toHaveLength(0);
  });
});
