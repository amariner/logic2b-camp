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
    const res = await app.request('/api/availability?from=2026-05-01&to=2026-05-04&adults=2', {}, envA);
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
      breakdown: { lines: { concept: string; amountCents: number }[]; totalCents: number; touristTaxCents: number };
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
      json({ message: '¿Tenéis sitio en agosto?', contact: { name: 'Ana', email: 'ana@example.com' } }),
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
    const res = await app.request('/api/bookings', json(bookingBody('2026-05-10', '2026-05-13')), envA);
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
      const r = await app.request('/api/bookings', json(bookingBody('2026-06-01', '2026-06-05')), envA);
      expect(r.status, `reserva ${i}`).toBe(201);
    }
    const full = await app.request('/api/bookings', json(bookingBody('2026-06-03', '2026-06-06')), envA);
    expect(full.status).toBe(409);
    // pero entrar el día que salen es válido (to exclusive)
    const backToBack = await app.request('/api/bookings', json(bookingBody('2026-06-05', '2026-06-08')), envA);
    expect(backToBack.status).toBe(201);
  });
});

describe('GET /api/bookings/:code', () => {
  it('recupera por código + email del titular; email equivocado → 404', async () => {
    const created = await app.request('/api/bookings', json(bookingBody('2026-09-01', '2026-09-04')), envA);
    const { code } = (await created.json()) as { code: string };

    const ok = await app.request(`/api/bookings/${code}?email=holder@example.com`, {}, envA);
    expect(ok.status).toBe(200);
    const body = (await ok.json()) as { code: string; totalCents: number };
    expect(body.code).toBe(code);

    const bad = await app.request(`/api/bookings/${code}?email=otro@example.com`, {}, envA);
    expect(bad.status).toBe(404);
  });
});

describe('AISLAMIENTO ENTRE TENANTS (invariante 5)', () => {
  it('lo escrito en el tenant A no existe en el tenant B', async () => {
    const created = await app.request('/api/bookings', json(bookingBody('2026-10-01', '2026-10-04')), envA);
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
