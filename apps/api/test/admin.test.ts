/**
 * Tests de integración de auth + API privada contra D1 real (workerd) — ADR 0005.
 * Incluye los invariantes 3 (tarifa no toca reservas) y 4 (cancelar libera
 * inventario), roles, registro cerrado y fuga cruzada de sesiones A↛B.
 */
import { env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { provisionUser } from '../src/auth';
import { seedTenant } from './fixtures';

const envA = { DB: env.DB, TENANT_SLUG: 'alfa' };
const envB = { DB: env.DB_B, TENANT_SLUG: 'beta' };

const json = (body: unknown, headers: Record<string, string> = {}) => ({
  method: 'POST',
  headers: { 'content-type': 'application/json', ...headers },
  body: JSON.stringify(body),
});

const patch = (body: unknown, cookie: string) => ({
  method: 'PATCH',
  headers: { 'content-type': 'application/json', cookie },
  body: JSON.stringify(body),
});

async function signIn(email: string, password: string, targetEnv = envA): Promise<string> {
  const res = await app.request('/api/auth/sign-in/email', json({ email, password }), targetEnv);
  expect(res.status).toBe(200);
  // getSetCookie existe en workerd pero aún no en los tipos de Headers
  const setCookies = (res.headers as Headers & { getSetCookie(): string[] }).getSetCookie();
  const cookie = setCookies.map((c) => c.split(';')[0]).join('; ');
  expect(cookie).toContain('session_token');
  return cookie;
}

const bookingBody = (from: string, to: string) => ({
  unitTypeId: 'ut_std',
  dateFrom: from,
  dateTo: to,
  occupancy: { adults: 2, childrenAges: [], pets: 0, vehicles: 1 },
  extraIds: [],
  holder: { name: 'Mostrador', email: 'mostrador@example.com' },
  locale: 'es',
  channel: 'phone' as const,
});

let owner = '';
let manager = '';
let reception = '';
let readonly = '';

beforeAll(async () => {
  await seedTenant(env.DB, 'alfa');
  await seedTenant(env.DB_B, 'beta');
  await provisionUser(envA, {
    email: 'owner@alfa.test',
    password: 'secreto123',
    name: 'Owner',
    role: 'owner',
  });
  await provisionUser(envA, {
    email: 'manager@alfa.test',
    password: 'secreto123',
    name: 'Manager',
    role: 'manager',
  });
  await provisionUser(envA, {
    email: 'recepcion@alfa.test',
    password: 'secreto123',
    name: 'Recepción',
    role: 'reception',
  });
  await provisionUser(envA, {
    email: 'readonly@alfa.test',
    password: 'secreto123',
    name: 'Solo Lectura',
    role: 'readonly',
  });
  owner = await signIn('owner@alfa.test', 'secreto123');
  manager = await signIn('manager@alfa.test', 'secreto123');
  reception = await signIn('recepcion@alfa.test', 'secreto123');
  readonly = await signIn('readonly@alfa.test', 'secreto123');
});

describe('auth', () => {
  it('sin sesión → 401', async () => {
    const res = await app.request('/api/admin/planning?from=2026-05-01&to=2026-05-08', {}, envA);
    expect(res.status).toBe(401);
  });

  it('el registro público está desactivado', async () => {
    const res = await app.request(
      '/api/auth/sign-up/email',
      json({ email: 'intruso@alfa.test', password: 'secreto123', name: 'Intruso' }),
      envA,
    );
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('fuga cruzada: la sesión de A no vale en B y el usuario de A no existe en B', async () => {
    const res = await app.request(
      '/api/admin/planning?from=2026-05-01&to=2026-05-08',
      { headers: { cookie: owner } },
      envB,
    );
    expect(res.status).toBe(401);
    const login = await app.request(
      '/api/auth/sign-in/email',
      json({ email: 'owner@alfa.test', password: 'secreto123' }),
      envB,
    );
    expect(login.status).toBeGreaterThanOrEqual(400);
  });
});

describe('GET /api/admin/planning', () => {
  it('devuelve unidades, reservas y bloqueos del rango (readonly puede)', async () => {
    const res = await app.request(
      '/api/admin/planning?from=2026-05-01&to=2026-05-08',
      { headers: { cookie: readonly } },
      envA,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { units: unknown[]; bookings: unknown[]; blocks: unknown[] };
    expect(body.units).toHaveLength(3);
    expect(Array.isArray(body.bookings)).toBe(true);
    expect(Array.isArray(body.blocks)).toBe(true);
  });
});

describe('reservas privadas', () => {
  it('readonly no puede crear → 403; reception sí → 201 con canal phone', async () => {
    const forbidden = await app.request(
      '/api/admin/bookings',
      {
        ...json(bookingBody('2026-09-01', '2026-09-04')),
        headers: { 'content-type': 'application/json', cookie: readonly },
      },
      envA,
    );
    expect(forbidden.status).toBe(403);

    const res = await app.request(
      '/api/admin/bookings',
      {
        ...json(bookingBody('2026-09-01', '2026-09-04')),
        headers: { 'content-type': 'application/json', cookie: reception },
      },
      envA,
    );
    expect(res.status).toBe(201);
    const created = (await res.json()) as { id: string; code: string; totalCents: number };
    // 3 noches × 2000 + limpieza obligatoria 1500
    expect(created.totalCents).toBe(7500);

    const list = await app.request(
      `/api/admin/bookings?q=${created.code.slice(0, 7)}`,
      { headers: { cookie: readonly } },
      envA,
    );
    const listBody = (await list.json()) as { items: { id: string; channel: string }[] };
    const found = listBody.items.find((b) => b.id === created.id);
    expect(found?.channel).toBe('phone');
  });

  it('llegadas/salidas del día: arrivalsOn/departuresOn filtran por fecha exacta y traen unitCode', async () => {
    const res = await app.request(
      '/api/admin/bookings',
      {
        ...json(bookingBody('2026-10-05', '2026-10-08')),
        headers: { 'content-type': 'application/json', cookie: reception },
      },
      envA,
    );
    expect(res.status).toBe(201);
    const { id } = (await res.json()) as { id: string };

    type Item = { id: string; unitCode: string | null };
    const fetchItems = async (query: string) => {
      const r = await app.request(
        `/api/admin/bookings?${query}`,
        { headers: { cookie: readonly } },
        envA,
      );
      expect(r.status).toBe(200);
      return ((await r.json()) as { items: Item[] }).items;
    };

    const llegadas = await fetchItems('arrivalsOn=2026-10-05');
    const encontrada = llegadas.find((b) => b.id === id) as
      (Item & { leadName: string | null }) | undefined;
    expect(encontrada).toBeDefined();
    // la creación asigna unidad → el join la trae para pintarla en la lista
    expect(encontrada?.unitCode).toBeTruthy();
    // el titular sale en la lista (la recepcionista pregunta "¿a nombre de quién?")
    expect(encontrada?.leadName).toContain('Mostrador');

    // date_to es exclusivo: la salida es el día que la unidad se libera
    expect((await fetchItems('departuresOn=2026-10-08')).some((b) => b.id === id)).toBe(true);
    expect((await fetchItems('arrivalsOn=2026-10-06')).some((b) => b.id === id)).toBe(false);
    expect((await fetchItems('departuresOn=2026-10-05')).some((b) => b.id === id)).toBe(false);
  });

  it('transición inválida → 409', async () => {
    const res = await app.request(
      '/api/admin/bookings',
      {
        ...json(bookingBody('2026-09-05', '2026-09-07')),
        headers: { 'content-type': 'application/json', cookie: reception },
      },
      envA,
    );
    const { id } = (await res.json()) as { id: string };
    // confirmed → confirm no es transición válida
    const bad = await app.request(
      `/api/admin/bookings/${id}`,
      patch({ action: 'confirm' }, reception),
      envA,
    );
    expect(bad.status).toBe(409);
  });

  it('invariante 4: cancelar libera el inventario', async () => {
    const mk = () =>
      app.request(
        '/api/admin/bookings',
        {
          ...json(bookingBody('2026-09-10', '2026-09-13')),
          headers: { 'content-type': 'application/json', cookie: reception },
        },
        envA,
      );
    // llenar las 3 unidades
    const ids: string[] = [];
    for (let i = 0; i < 3; i++) {
      const r = await mk();
      expect(r.status).toBe(201);
      ids.push(((await r.json()) as { id: string }).id);
    }
    const full = await mk();
    expect(full.status).toBe(409);

    const cancel = await app.request(
      `/api/admin/bookings/${ids[0]}`,
      patch({ action: 'cancel' }, reception),
      envA,
    );
    expect(cancel.status).toBe(200);
    expect(((await cancel.json()) as { status: string }).status).toBe('cancelled');

    const retry = await mk();
    expect(retry.status).toBe(201); // el hueco quedó libre en el mismo acto
  });

  it('reasignación: a unidad ocupada 409, a unidad libre 200', async () => {
    const r1 = await app.request(
      '/api/admin/bookings',
      {
        ...json(bookingBody('2026-09-20', '2026-09-23')),
        headers: { 'content-type': 'application/json', cookie: reception },
      },
      envA,
    );
    const b1 = (await r1.json()) as { id: string; unitId: string };
    const r2 = await app.request(
      '/api/admin/bookings',
      {
        ...json(bookingBody('2026-09-20', '2026-09-23')),
        headers: { 'content-type': 'application/json', cookie: reception },
      },
      envA,
    );
    const b2 = (await r2.json()) as { id: string; unitId: string };

    const clash = await app.request(
      `/api/admin/bookings/${b2.id}`,
      patch({ action: 'reassign', unitId: b1.unitId }, reception),
      envA,
    );
    expect(clash.status).toBe(409);

    const free = ['unt_1', 'unt_2', 'unt_3'].find((u) => u !== b1.unitId && u !== b2.unitId)!;
    const ok = await app.request(
      `/api/admin/bookings/${b2.id}`,
      patch({ action: 'reassign', unitId: free }, reception),
      envA,
    );
    expect(ok.status).toBe(200);
    expect(((await ok.json()) as { unitId: string }).unitId).toBe(free);
  });
});

describe('tarifas', () => {
  it('invariante 3: cambiar una tarifa no modifica una reserva confirmada', async () => {
    const res = await app.request(
      '/api/admin/bookings',
      {
        ...json(bookingBody('2026-10-01', '2026-10-04')),
        headers: { 'content-type': 'application/json', cookie: reception },
      },
      envA,
    );
    const booking = (await res.json()) as { id: string; totalCents: number };
    expect(booking.totalCents).toBe(7500);

    // reception no puede tocar tarifas
    const forbidden = await app.request(
      '/api/admin/rates/rp_alfa_0',
      {
        method: 'PUT',
        headers: { 'content-type': 'application/json', cookie: reception },
        body: JSON.stringify({ baseCents: 9999 }),
      },
      envA,
    );
    expect(forbidden.status).toBe(403);

    const updated = await app.request(
      '/api/admin/rates/rp_alfa_0',
      {
        method: 'PUT',
        headers: { 'content-type': 'application/json', cookie: manager },
        body: JSON.stringify({ baseCents: 9999 }),
      },
      envA,
    );
    expect(updated.status).toBe(200);
    expect(((await updated.json()) as { baseCents: number }).baseCents).toBe(9999);

    // la reserva guardada NO cambia: el desglose almacenado es la verdad
    const detail = await app.request(
      `/api/admin/bookings/${booking.id}`,
      { headers: { cookie: readonly } },
      envA,
    );
    const stored = (await detail.json()) as {
      totalCents: number;
      priceBreakdown: { totalCents: number };
    };
    expect(stored.totalCents).toBe(7500);
    expect(stored.priceBreakdown.totalCents).toBe(7500);

    // …pero una cotización nueva sí usa la tarifa nueva
    const q = await app.request(
      '/api/quote',
      json({
        unitTypeId: 'ut_std',
        dateFrom: '2026-10-05',
        dateTo: '2026-10-06',
        occupancy: { adults: 2, childrenAges: [], pets: 0, vehicles: 1 },
      }),
      envA,
    );
    expect(((await q.json()) as { breakdown: { totalCents: number } }).breakdown.totalCents).toBe(
      9999 + 1500,
    );

    // restaurar para no contaminar otros tests
    await app.request(
      '/api/admin/rates/rp_alfa_0',
      {
        method: 'PUT',
        headers: { 'content-type': 'application/json', cookie: manager },
        body: JSON.stringify({ baseCents: 2000 }),
      },
      envA,
    );
  });
});

describe('catálogo', () => {
  it('devuelve tipos y unidades (readonly puede)', async () => {
    const res = await app.request('/api/admin/catalog', { headers: { cookie: readonly } }, envA);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { unitTypes: unknown[]; units: unknown[] };
    expect(body.unitTypes.length).toBeGreaterThan(0);
    expect(body.units.length).toBeGreaterThan(0);
  });
});

describe('solicitudes', () => {
  it('lista y transiciona estado', async () => {
    const created = await app.request(
      '/api/enquiries',
      json({
        message: '¿Tenéis hueco en agosto?',
        contact: { name: 'Ana', email: 'ana@example.com' },
        locale: 'es',
      }),
      envA,
    );
    const { id } = (await created.json()) as { id: string };

    const res = await app.request(
      `/api/admin/enquiries/${id}`,
      patch({ status: 'contacted' }, reception),
      envA,
    );
    expect(res.status).toBe(200);

    const list = await app.request(
      '/api/admin/enquiries?status=contacted',
      { headers: { cookie: readonly } },
      envA,
    );
    const body = (await list.json()) as { items: { id: string }[] };
    expect(body.items.some((e) => e.id === id)).toBe(true);
  });
});

describe('informes y ajustes', () => {
  it('reports devuelve ocupación e ingresos del rango', async () => {
    // autocontenido: el storage se aísla por test, la reserva se crea aquí
    const created = await app.request(
      '/api/admin/bookings',
      {
        ...json(bookingBody('2026-09-01', '2026-09-04')),
        headers: { 'content-type': 'application/json', cookie: reception },
      },
      envA,
    );
    expect(created.status).toBe(201);

    const res = await app.request(
      '/api/admin/reports?from=2026-09-01&to=2026-09-04',
      { headers: { cookie: readonly } },
      envA,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      occupancy: { unitTypeId: string; occupiedNights: number; capacityNights: number }[];
      revenue: { totalCents: number; bookings: number };
    };
    const std = body.occupancy.find((o) => o.unitTypeId === 'ut_std')!;
    expect(std.capacityNights).toBe(9); // 3 unidades × 3 noches
    expect(std.occupiedNights).toBeGreaterThanOrEqual(3); // la reserva de 2026-09-01→04
    expect(body.revenue.bookings).toBeGreaterThanOrEqual(1);
  });

  it('settings: GET readonly, PATCH exige manager y audita', async () => {
    const forbidden = await app.request(
      '/api/admin/settings',
      patch({ name: 'Camping Renombrado' }, readonly),
      envA,
    );
    expect(forbidden.status).toBe(403);

    const res = await app.request(
      '/api/admin/settings',
      patch({ name: 'Camping Renombrado' }, manager),
      envA,
    );
    expect(res.status).toBe(200);
    expect(((await res.json()) as { name: string }).name).toBe('Camping Renombrado');
  });
});

describe('usuarios (solo owner)', () => {
  it('manager no puede crear usuarios; owner sí y el nuevo puede entrar', async () => {
    const newUser = {
      email: 'nueva@alfa.test',
      password: 'secreto123',
      name: 'Nueva',
      role: 'reception' as const,
    };

    const forbidden = await app.request(
      '/api/admin/users',
      { ...json(newUser), headers: { 'content-type': 'application/json', cookie: manager } },
      envA,
    );
    expect(forbidden.status).toBe(403);

    const res = await app.request(
      '/api/admin/users',
      { ...json(newUser), headers: { 'content-type': 'application/json', cookie: owner } },
      envA,
    );
    expect(res.status).toBe(201);
    expect(((await res.json()) as { role: string }).role).toBe('reception');

    const cookie = await signIn('nueva@alfa.test', 'secreto123');
    const ping = await app.request(
      '/api/admin/planning?from=2026-05-01&to=2026-05-02',
      { headers: { cookie } },
      envA,
    );
    expect(ping.status).toBe(200);

    const dup = await app.request(
      '/api/admin/users',
      { ...json(newUser), headers: { 'content-type': 'application/json', cookie: owner } },
      envA,
    );
    expect(dup.status).toBe(409);
  });
});
