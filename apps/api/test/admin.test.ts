/**
 * Tests de integración de auth + API privada contra D1 real (workerd) — ADR 0005.
 * Incluye los invariantes 3 (tarifa no toca reservas) y 4 (cancelar libera
 * inventario), roles, registro cerrado y fuga cruzada de sesiones A↛B.
 */
import { createDb, schema } from '@logic-camp/db';
import { env } from 'cloudflare:test';
import { and, eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { app } from '../src/app';
import { provisionUser, resolveAuthSecret } from '../src/auth';
import { seedTenant } from './fixtures';

const envA = { DB: env.DB, TENANT_SLUG: 'alfa', LOGIC_CAMP_DEV_AUTH: '1' };
const envB = { DB: env.DB_B, TENANT_SLUG: 'beta', LOGIC_CAMP_DEV_AUTH: '1' };

const json = (body: unknown, headers: Record<string, string> = {}) => ({
  method: 'POST',
  headers: { 'content-type': 'application/json', ...headers },
  body: JSON.stringify(body),
});

const patch = (body: unknown, cookie: string, headers: Record<string, string> = {}) => ({
  method: 'PATCH',
  headers: { 'content-type': 'application/json', cookie, ...headers },
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
  it('sin AUTH_SECRET ni interruptor local, la autenticación falla cerrada', () => {
    expect(() => resolveAuthSecret({ DB: env.DB, TENANT_SLUG: 'alfa' })).toThrow(
      'AUTH_SECRET ausente',
    );
  });

  it('un AUTH_SECRET corto no se acepta como secreto de producción', () => {
    expect(() =>
      resolveAuthSecret({ DB: env.DB, TENANT_SLUG: 'alfa', AUTH_SECRET: 'demasiado-corto' }),
    ).toThrow('al menos 32 caracteres');
  });

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

/**
 * ADR 0019 §1 — el agujero de orígenes se abre SOLO si se pide explícitamente.
 * Fija las dos direcciones del contrato: sin el interruptor no hay origen
 * cruzado autorizado (fail-closed), y con él solo entra la lista CONSTANTE
 * de localhost. Si alguien "arregla" el 403 abriendo orígenes por defecto,
 * el primer test cae.
 */
describe('trustedOrigins de desarrollo (ADR 0019)', () => {
  // IP propia por test: el rate limit es por IP y en ventana fija (ADR 0004).
  // Sin esto, estos logins gastarían cupo del bucket compartido y tumbarían
  // un `signIn` posterior con un 429 — que es justo lo que pasó al añadirlos.
  const origin = (o: string, ip: string) => ({
    'content-type': 'application/json',
    origin: o,
    'cf-connecting-ip': ip,
  });
  const creds = { email: 'owner@alfa.test', password: 'secreto123' };

  it('sin el interruptor, un Origin cruzado NO se autoriza', async () => {
    const res = await app.request(
      '/api/auth/sign-in/email',
      { ...json(creds), headers: origin('http://localhost:5173', '203.0.113.71') },
      envA, // sin LOGIC_CAMP_DEV_ORIGINS
    );
    expect(res.status).toBe(403);
  });

  it('con el interruptor, el origen local de Vite sí se autoriza', async () => {
    const res = await app.request(
      '/api/auth/sign-in/email',
      { ...json(creds), headers: origin('http://localhost:5173', '203.0.113.72') },
      { ...envA, LOGIC_CAMP_DEV_ORIGINS: '1' },
    );
    expect(res.status).toBe(200);
  });

  it('el interruptor NO autoriza un origen arbitrario — la lista es constante', async () => {
    const res = await app.request(
      '/api/auth/sign-in/email',
      { ...json(creds), headers: origin('https://atacante.example', '203.0.113.73') },
      { ...envA, LOGIC_CAMP_DEV_ORIGINS: '1' },
    );
    expect(res.status).toBe(403);
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

describe('check-in / check-out (ADR 0022)', () => {
  const IP = { 'cf-connecting-ip': 'test-checkin' };
  // todas las peticiones de este bloque van por la MISMA IP (bucket de rate-limit
  // propio): un GET sin cabecera cae al bucket 'local' compartido de todo el fichero.
  const get = (url: string) => app.request(url, { headers: { cookie: reception, ...IP } }, envA);
  const act = (id: string, body: unknown) =>
    app.request(`/api/admin/bookings/${id}`, patch(body, reception, IP), envA);
  const mkConfirmed = async (from: string, to: string) => {
    const r = await app.request(
      '/api/admin/bookings',
      {
        ...json(bookingBody(from, to)),
        headers: { 'content-type': 'application/json', cookie: reception, ...IP },
      },
      envA,
    );
    expect(r.status).toBe(201);
    // el alta manual nace 'confirmed' (canal phone, ver createBooking)
    return ((await r.json()) as { id: string }).id;
  };

  it('check-in estampa checkedInAt sin tocar el status; no toca la ocupación', async () => {
    const id = await mkConfirmed('2026-04-01', '2026-04-05');
    const res = await act(id, { action: 'check_in' });
    expect(res.status).toBe(200);
    expect(((await res.json()) as { checkedInAt: string }).checkedInAt).toBeTruthy();

    const body = (await (await get(`/api/admin/bookings/${id}`)).json()) as {
      status: string;
      checkedInAt: string | null;
    };
    expect(body.status).toBe('confirmed'); // "en casa" NO es un status
    expect(body.checkedInAt).toBeTruthy();
  });

  it('doble check-in → 409', async () => {
    const id = await mkConfirmed('2026-04-06', '2026-04-09');
    await act(id, { action: 'check_in' });
    expect((await act(id, { action: 'check_in' })).status).toBe(409);
  });

  it('deshacer check-in vuelve a dejar checkedInAt null', async () => {
    const id = await mkConfirmed('2026-04-10', '2026-04-13');
    await act(id, { action: 'check_in' });
    expect((await act(id, { action: 'undo_checkin' })).status).toBe(200);
    const body = (await (await get(`/api/admin/bookings/${id}`)).json()) as {
      checkedInAt: string | null;
    };
    expect(body.checkedInAt).toBeNull();
  });

  it('check-out sella checkedOutAt y completa; requiere check-in previo', async () => {
    const id = await mkConfirmed('2026-04-14', '2026-04-17');
    expect((await act(id, { action: 'check_out' })).status).toBe(409); // sin check-in previo
    await act(id, { action: 'check_in' });
    const out = await act(id, { action: 'check_out' });
    expect(out.status).toBe(200);
    expect(((await out.json()) as { status: string }).status).toBe('completed');
    const body = (await (await get(`/api/admin/bookings/${id}`)).json()) as {
      status: string;
      checkedOutAt: string | null;
    };
    expect(body.status).toBe('completed');
    expect(body.checkedOutAt).toBeTruthy();
  });

  it('el planning trae checkedInAt/checkedOutAt para derivar "en casa"', async () => {
    const id = await mkConfirmed('2026-04-20', '2026-04-25');
    await act(id, { action: 'check_in' });
    const data = (await (
      await get('/api/admin/planning?from=2026-04-21&to=2026-04-22')
    ).json()) as { bookings: { id: string; checkedInAt: string | null }[] };
    expect(data.bookings.find((b) => b.id === id)?.checkedInAt).toBeTruthy();
  });
});

describe('huéspedes editables (ADR 0022)', () => {
  const IP = { 'cf-connecting-ip': 'test-guests' };
  const get = (url: string) => app.request(url, { headers: { cookie: reception, ...IP } }, envA);
  const post = (url: string, body: unknown, cookie = reception) =>
    app.request(url, { ...json(body, { cookie, ...IP }) }, envA);
  const del = (url: string) =>
    app.request(url, { method: 'DELETE', headers: { cookie: reception, ...IP } }, envA);
  const mkBooking = async () => {
    const r = await post('/api/admin/bookings', bookingBody('2026-05-01', '2026-05-04'));
    expect(r.status).toBe(201);
    return ((await r.json()) as { id: string }).id;
  };

  it('añadir acompañante, editar su documento y quitarlo; el titular no se puede quitar', async () => {
    const id = await mkBooking();
    const lead = (
      (await (await get(`/api/admin/bookings/${id}`)).json()) as {
        guests: { id: string; isLead: boolean }[];
      }
    ).guests.find((g) => g.isLead)!;

    const add = await post(`/api/admin/bookings/${id}/guests`, {
      name: 'Ana',
      surname: 'Ruiz',
      docType: 'dni',
      docNumber: '12345678Z',
    });
    expect(add.status).toBe(201);
    const { id: guestId, isLead } = (await add.json()) as { id: string; isLead: boolean };
    expect(isLead).toBe(false); // ya había titular

    const edit = await app.request(
      `/api/admin/guests/${guestId}`,
      patch({ docNumber: '99999999R', nationality: 'FR' }, reception, IP),
      envA,
    );
    expect(edit.status).toBe(200);
    expect(((await edit.json()) as { docNumber: string }).docNumber).toBe('99999999R');

    expect((await del(`/api/admin/bookings/${id}/guests/${lead.id}`)).status).toBe(409); // titular no
    expect((await del(`/api/admin/bookings/${id}/guests/${guestId}`)).status).toBe(200); // acompañante sí

    const guests = (
      (await (await get(`/api/admin/bookings/${id}`)).json()) as {
        guests: { id: string }[];
      }
    ).guests;
    expect(guests.some((g) => g.id === guestId)).toBe(false);
  });

  it('readonly no puede editar un huésped → 403', async () => {
    const id = await mkBooking();
    const lead = (
      (await (await get(`/api/admin/bookings/${id}`)).json()) as {
        guests: { id: string }[];
      }
    ).guests[0]!;
    const res = await app.request(
      `/api/admin/guests/${lead.id}`,
      patch({ name: 'X' }, readonly, IP),
      envA,
    );
    expect(res.status).toBe(403);
  });
});

describe('bloqueos desde la UI (ADR 0022)', () => {
  const IP = { 'cf-connecting-ip': 'test-blocks' };
  const get = (url: string) => app.request(url, { headers: { cookie: reception, ...IP } }, envA);
  const post = (url: string, body: unknown) =>
    app.request(url, { ...json(body, { cookie: reception, ...IP }) }, envA);

  it('crear un bloqueo por unidad, verlo en el planning y levantarlo', async () => {
    const create = await post('/api/admin/blocks', {
      unitId: 'unt_1',
      dateFrom: '2026-06-01',
      dateTo: '2026-06-05',
      reason: 'maintenance',
    });
    expect(create.status).toBe(201);
    const { id: blockId } = (await create.json()) as { id: string };

    const data = (await (
      await get('/api/admin/planning?from=2026-06-01&to=2026-06-05')
    ).json()) as { blocks: { id: string; unitId: string }[] };
    expect(data.blocks.some((b) => b.id === blockId && b.unitId === 'unt_1')).toBe(true);

    const del = await app.request(
      `/api/admin/blocks/${blockId}`,
      { method: 'DELETE', headers: { cookie: reception, ...IP } },
      envA,
    );
    expect(del.status).toBe(200);
  });

  it('no se puede bloquear una unidad sobre una reserva viva → 409', async () => {
    const r = await post('/api/admin/bookings', bookingBody('2026-06-10', '2026-06-14'));
    const booking = (await r.json()) as { unitId: string };
    const clash = await post('/api/admin/blocks', {
      unitId: booking.unitId,
      dateFrom: '2026-06-11',
      dateTo: '2026-06-12',
      reason: 'owner',
    });
    expect(clash.status).toBe(409);
  });

  it('un bloqueo necesita unidad o tipo → 400', async () => {
    const res = await post('/api/admin/blocks', {
      dateFrom: '2026-06-20',
      dateTo: '2026-06-24',
      reason: 'manual',
    });
    expect(res.status).toBe(400);
  });

  it('unidad y tipo son excluyentes, y un tipo desconocido no crea un bloqueo huérfano', async () => {
    const both = await post('/api/admin/blocks', {
      unitId: 'unt_1',
      unitTypeId: 'ut_std',
      dateFrom: '2026-06-20',
      dateTo: '2026-06-24',
      reason: 'manual',
    });
    expect(both.status).toBe(400);

    const unknown = await post('/api/admin/blocks', {
      unitTypeId: 'ut_no_existe',
      dateFrom: '2026-06-20',
      dateTo: '2026-06-24',
      reason: 'manual',
    });
    expect(unknown.status).toBe(404);
    await expect(unknown.json()).resolves.toEqual({ error: 'unknown_unit_type' });
  });
});

describe('pagos (ADR 0011)', () => {
  // cabecera propia: el limitador de tasa cuenta por IP y este fichero ya usa
  // muchas peticiones — un bucket aparte evita un 429 que no tiene que ver con el test
  const PAY_IP = { 'cf-connecting-ip': 'test-pagos' };
  const createManual = (from: string, to: string) =>
    app.request(
      '/api/admin/bookings',
      {
        ...json(bookingBody(from, to), PAY_IP),
        headers: { 'content-type': 'application/json', cookie: reception, ...PAY_IP },
      },
      envA,
    );

  it('record_payment: cobro en efectivo suma a paidCents y queda auditado', async () => {
    const create = await createManual('2026-08-01', '2026-08-04');
    const { id, totalCents } = (await create.json()) as { id: string; totalCents: number };

    const forbidden = await app.request(
      `/api/admin/bookings/${id}`,
      patch({ action: 'record_payment', amountCents: 1000, method: 'cash' }, readonly, PAY_IP),
      envA,
    );
    expect(forbidden.status).toBe(403);

    const res = await app.request(
      `/api/admin/bookings/${id}`,
      patch(
        { action: 'record_payment', amountCents: totalCents, method: 'cash' },
        reception,
        PAY_IP,
      ),
      envA,
    );
    expect(res.status).toBe(200);
    expect(((await res.json()) as { paidCents: number }).paidCents).toBe(totalCents);

    const db = createDb(env.DB);
    const payments = await db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.bookingId, id));
    expect(payments).toHaveLength(1);
    expect(payments[0]).toMatchObject({
      provider: 'manual',
      amountCents: totalCents,
      status: 'succeeded',
    });
    const audit = await db
      .select()
      .from(schema.auditLog)
      .where(and(eq(schema.auditLog.entityId, id), eq(schema.auditLog.action, 'record_payment')));
    expect(audit).toHaveLength(1);
  });

  it('set_payment_kind: captura la forma de pago para el parte (ADR 0028) y la audita', async () => {
    const create = await createManual('2026-08-20', '2026-08-23');
    const { id } = (await create.json()) as { id: string };

    const res = await app.request(
      `/api/admin/bookings/${id}`,
      patch({ action: 'set_payment_kind', paymentKind: 'transfer' }, reception, PAY_IP),
      envA,
    );
    expect(res.status).toBe(200);
    expect(((await res.json()) as { paymentKind: string }).paymentKind).toBe('transfer');

    const db = createDb(env.DB);
    const booking = (await db.select().from(schema.bookings).where(eq(schema.bookings.id, id)))[0];
    expect(booking?.paymentKind).toBe('transfer');
    const audit = await db
      .select()
      .from(schema.auditLog)
      .where(and(eq(schema.auditLog.entityId, id), eq(schema.auditLog.action, 'set_payment_kind')));
    expect(audit).toHaveLength(1);
  });

  it('refund: nunca deja paidCents negativo; un cobro manual se reembolsa como asiento contable', async () => {
    const create = await createManual('2026-08-05', '2026-08-08');
    const { id, totalCents } = (await create.json()) as { id: string; totalCents: number };
    await app.request(
      `/api/admin/bookings/${id}`,
      patch(
        { action: 'record_payment', amountCents: totalCents, method: 'card' },
        reception,
        PAY_IP,
      ),
      envA,
    );

    const overRefund = await app.request(
      `/api/admin/bookings/${id}`,
      patch({ action: 'refund', amountCents: totalCents + 1 }, reception, PAY_IP),
      envA,
    );
    expect(overRefund.status).toBe(422);

    const refund = await app.request(
      `/api/admin/bookings/${id}`,
      patch({ action: 'refund', amountCents: totalCents }, reception, PAY_IP),
      envA,
    );
    expect(refund.status).toBe(200);
    expect(((await refund.json()) as { paidCents: number }).paidCents).toBe(0);

    const db = createDb(env.DB);
    const payments = await db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.bookingId, id))
      .orderBy(schema.payments.createdAt);
    expect(payments).toHaveLength(2);
    expect(payments[1]).toMatchObject({
      provider: 'manual',
      amountCents: -totalCents,
      status: 'refunded',
    });
  });

  it('cancelar desde el dashboard ejecuta el reembolso real según la política, no solo el email', async () => {
    const create = await createManual('2026-10-20', '2026-10-23');
    const { id, totalCents } = (await create.json()) as { id: string; totalCents: number };
    await app.request(
      `/api/admin/bookings/${id}`,
      patch(
        { action: 'record_payment', amountCents: totalCents, method: 'cash' },
        reception,
        PAY_IP,
      ),
      envA,
    );

    const cancel = await app.request(
      `/api/admin/bookings/${id}`,
      patch({ action: 'cancel' }, reception, PAY_IP),
      envA,
    );
    expect(cancel.status).toBe(200);

    // fechas en noviembre 2026, muy por delante de "hoy" (2026-07-19): reembolso 100%
    const db = createDb(env.DB);
    const booking = (await db.select().from(schema.bookings).where(eq(schema.bookings.id, id)))[0]!;
    expect(booking.paidCents).toBe(0);
    const payments = await db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.bookingId, id));
    expect(payments.some((p) => p.amountCents < 0)).toBe(true);
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
  it('devuelve tipos, unidades y extras (readonly puede)', async () => {
    const res = await app.request('/api/admin/catalog', { headers: { cookie: readonly } }, envA);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      unitTypes: unknown[];
      units: unknown[];
      extras: unknown[];
    };
    expect(body.unitTypes.length).toBeGreaterThan(0);
    expect(body.units.length).toBeGreaterThan(0);
    expect(body.extras.length).toBeGreaterThan(0);
  });
});

describe('plano del camping (ADR 0021)', () => {
  // IP propia: no compartir el cubo de rate-limit (60/min) del resto del fichero
  // (mismo patrón que "pagos" — ver PROGRESS sesión 24).
  const MAP_IP = { 'cf-connecting-ip': 'test-plano' };
  const withMapIp = (cookie: string) => ({ headers: { cookie, ...MAP_IP } });

  it('sin modules.plano → { plano: null } (degradación, readonly puede)', async () => {
    const res = await app.request('/api/admin/map', withMapIp(readonly), envA);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ plano: null });
  });

  it('con modules.plano → lo devuelve tal cual', async () => {
    const db = createDb(env.DB);
    const row = (
      await db.select().from(schema.tenants).where(eq(schema.tenants.id, 'ten_alfa'))
    )[0]!;
    const plano = {
      version: 1,
      decor: [],
      blocks: [{ id: 'z', label: 'Z', cell: 'pitch', x: 0, y: 0, cols: 2, units: ['A-01'] }],
    };
    await db
      .update(schema.tenants)
      .set({ modules: { ...(row.modules as Record<string, unknown>), plano } })
      .where(eq(schema.tenants.id, 'ten_alfa'));

    const res = await app.request('/api/admin/map', withMapIp(readonly), envA);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ plano });

    // restaurar para no contaminar otros tests
    await db
      .update(schema.tenants)
      .set({ modules: row.modules as Record<string, unknown> })
      .where(eq(schema.tenants.id, 'ten_alfa'));
  });

  it('sin sesión → 401', async () => {
    const res = await app.request('/api/admin/map', { headers: MAP_IP }, envA);
    expect(res.status).toBe(401);
  });
});

describe('inventario', () => {
  it('baja de servicio: reception 403, manager 200; reasignar hacia inactiva se rechaza', async () => {
    const catalog = await app.request(
      '/api/admin/catalog',
      { headers: { cookie: readonly } },
      envA,
    );
    const { units } = (await catalog.json()) as { units: { id: string; status: string }[] };
    const unit = units[0]!;

    const forbidden = await app.request(
      `/api/admin/units/${unit.id}`,
      patch({ status: 'inactive' }, reception),
      envA,
    );
    expect(forbidden.status).toBe(403);

    const ok = await app.request(
      `/api/admin/units/${unit.id}`,
      patch({ status: 'inactive' }, manager),
      envA,
    );
    expect(ok.status).toBe(200);

    // una reserva no puede reasignarse hacia una unidad fuera de servicio
    const created = await app.request(
      '/api/admin/bookings',
      {
        ...json(bookingBody('2026-09-20', '2026-09-23')),
        headers: { 'content-type': 'application/json', cookie: reception },
      },
      envA,
    );
    expect(created.status).toBe(201);
    const { id } = (await created.json()) as { id: string };
    const reassign = await app.request(
      `/api/admin/bookings/${id}`,
      patch({ action: 'reassign', unitId: unit.id }, reception),
      envA,
    );
    expect(reassign.status).toBe(404);

    // restaurar para no contaminar otros tests
    const back = await app.request(
      `/api/admin/units/${unit.id}`,
      patch({ status: 'active' }, manager),
      envA,
    );
    expect(back.status).toBe(200);
  });
});

describe('clientes', () => {
  it('busca por nombre y devuelve historial con recuento', async () => {
    // el storage se aísla por test: el titular se crea aquí mismo
    const created = await app.request(
      '/api/admin/bookings',
      {
        ...json(bookingBody('2026-09-25', '2026-09-27')),
        headers: { 'content-type': 'application/json', cookie: reception },
      },
      envA,
    );
    expect(created.status).toBe(201);

    const res = await app.request(
      '/api/admin/guests?q=Mostrador',
      { headers: { cookie: readonly } },
      envA,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      items: { id: string; name: string; bookingsCount: number; lastStay: string | null }[];
    };
    expect(body.items.length).toBeGreaterThan(0);
    const guest = body.items[0]!;
    expect(guest.bookingsCount).toBeGreaterThan(0);
    expect(guest.lastStay).toBeTruthy();

    const detail = await app.request(
      `/api/admin/guests/${guest.id}`,
      { headers: { cookie: readonly } },
      envA,
    );
    expect(detail.status).toBe(200);
    const d = (await detail.json()) as {
      bookings: {
        code: string;
        isLead: boolean;
        checkedInAt: string | null;
        checkedOutAt: string | null;
      }[];
    };
    expect(d.bookings.length).toBeGreaterThan(0);
    expect(d.bookings[0]!.isLead).toBe(true);
    // el historial entrega los timestamps de check-in para derivar "en casa"
    // (ADR 0022): recién creada la reserva no está presente todavía.
    expect(d.bookings[0]!.checkedInAt).toBeNull();
    expect(d.bookings[0]!.checkedOutAt).toBeNull();
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

  it('un estado de filtro desconocido es 400, nunca equivale a listar toda la bandeja', async () => {
    const res = await app.request(
      '/api/admin/enquiries?status=desconocido',
      { headers: { cookie: readonly } },
      envA,
    );
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({ error: 'invalid_query' });
  });
});

describe('notificaciones (log)', () => {
  it('lista con el destino resuelto (enquiry) y filtra por estado', async () => {
    const created = await app.request(
      '/api/enquiries',
      json({
        message: '¿Aceptáis perros?',
        contact: { name: 'Léa', email: 'lea@example.com' },
        locale: 'fr',
      }),
      envA,
    );
    const { id: enquiryId } = (await created.json()) as { id: string };

    // sin RESEND_API_KEY (envA no la define) el envío queda "disabled" — deja rastro igual
    const res = await app.request(
      '/api/admin/notifications?status=disabled',
      { headers: { cookie: readonly } },
      envA,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      items: {
        enquiryId: string | null;
        status: string;
        enquiryContact: { name: string; email: string } | null;
      }[];
    };
    const row = body.items.find((r) => r.enquiryId === enquiryId);
    expect(row).toBeDefined();
    expect(row?.status).toBe('disabled');
    expect(row?.enquiryContact?.email).toBe('lea@example.com');

    const filtered = await app.request(
      '/api/admin/notifications?status=sent',
      { headers: { cookie: readonly } },
      envA,
    );
    const filteredBody = (await filtered.json()) as { items: { id: string }[] };
    expect(filteredBody.items.every((r) => r.id !== undefined)).toBe(true);
  });
});

describe('pagos (log)', () => {
  // cabecera propia: mismo motivo que en "pagos (ADR 0011)", un bucket de tasa aparte
  const LOG_IP = { 'cf-connecting-ip': 'test-pagos-log' };

  it('lista con el código de reserva resuelto y filtra por proveedor y estado', async () => {
    const create = await app.request(
      '/api/admin/bookings',
      {
        ...json(bookingBody('2026-09-01', '2026-09-04'), LOG_IP),
        headers: { 'content-type': 'application/json', cookie: reception, ...LOG_IP },
      },
      envA,
    );
    const { id, code, totalCents } = (await create.json()) as {
      id: string;
      code: string;
      totalCents: number;
    };
    await app.request(
      `/api/admin/bookings/${id}`,
      patch(
        { action: 'record_payment', amountCents: totalCents, method: 'card' },
        reception,
        LOG_IP,
      ),
      envA,
    );

    const res = await app.request(
      '/api/admin/payments?provider=manual&status=succeeded',
      { headers: { cookie: readonly, ...LOG_IP } },
      envA,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      items: {
        bookingCode: string;
        provider: string;
        status: string;
        amountCents: number;
        raw?: unknown;
      }[];
    };
    const row = body.items.find((r) => r.bookingCode === code);
    expect(row).toBeDefined();
    expect(row).toMatchObject({ provider: 'manual', status: 'succeeded', amountCents: totalCents });
    expect(row).not.toHaveProperty('raw');

    const detail = await app.request(
      `/api/admin/bookings/${id}`,
      {
        headers: { cookie: readonly, ...LOG_IP },
      },
      envA,
    );
    const detailBody = (await detail.json()) as { payments: Record<string, unknown>[] };
    expect(detailBody.payments[0]).not.toHaveProperty('raw');

    const noneMatch = await app.request(
      '/api/admin/payments?provider=stripe',
      { headers: { cookie: readonly, ...LOG_IP } },
      envA,
    );
    const noneBody = (await noneMatch.json()) as { items: { bookingCode: string }[] };
    expect(noneBody.items.some((r) => r.bookingCode === code)).toBe(false);
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

  it('settings rechaza una moneda que rompería la siguiente lectura de TenantConfig', async () => {
    const res = await app.request('/api/admin/settings', patch({ currency: 'eur' }, manager), envA);
    expect(res.status).toBe(400);
    const row = (await createDb(env.DB).select().from(schema.tenants))[0]!;
    expect(row.currency).toBe('EUR');
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

/**
 * ADR 0023 (C1) — el gesto horizontal del tape chart: mover/estirar fechas.
 * `requote` es el dry-run (nunca escribe); `move` re-cotiza SIEMPRE en servidor
 * y `expectedTotalCents` es el candado entre lo que se enseñó y lo que se escribe.
 * Precios de la fixture: base 2000/noche · alta 3800/noche · limpieza obligatoria 1500.
 */
describe('mover y estirar fechas — requote/move (ADR 0023)', () => {
  const db = createDb(env.DB);
  // bucket propio de rate-limit: el bloque hace muchas mutaciones (ver test-pagos)
  const IP = { 'cf-connecting-ip': 'test-move' };

  const crear = async (from: string, to: string, extra: Record<string, unknown> = {}) => {
    const res = await app.request(
      '/api/admin/bookings',
      json({ ...bookingBody(from, to), ...extra }, { cookie: reception, ...IP }),
      envA,
    );
    expect(res.status).toBe(201);
    return (await res.json()) as { id: string; unitId: string | null; totalCents: number };
  };

  const move = (id: string, body: Record<string, unknown>, cookie = reception) =>
    app.request(`/api/admin/bookings/${id}`, patch({ action: 'move', ...body }, cookie, IP), envA);

  const row = async (id: string) =>
    (await db.select().from(schema.bookings).where(eq(schema.bookings.id, id)))[0]!;

  it('requote: dry-run con desglose y total anterior; no escribe nada', async () => {
    const b = await crear('2026-03-20', '2026-03-23'); // 3 noches base = 7500
    const res = await app.request(
      `/api/admin/bookings/${b.id}/requote`,
      json({ dateFrom: '2026-03-24', dateTo: '2026-03-27' }, { cookie: reception, ...IP }),
      envA,
    );
    expect(res.status).toBe(200);
    const q = (await res.json()) as {
      nights: number;
      totalCents: number;
      previousTotalCents: number;
      breakdown: { lines: unknown[]; totalCents: number };
    };
    expect(q.nights).toBe(3);
    expect(q.totalCents).toBe(7500);
    expect(q.previousTotalCents).toBe(7500);
    expect(q.breakdown.lines.length).toBeGreaterThan(0);
    // dry-run: la reserva sigue donde estaba
    expect((await row(b.id)).dateFrom).toBe('2026-03-20');
  });

  it('move: cambia las fechas, re-cotiza en servidor y audita', async () => {
    const b = await crear('2026-05-11', '2026-05-14');
    const res = await move(b.id, { dateFrom: '2026-05-18', dateTo: '2026-05-21' });
    expect(res.status).toBe(200);
    const r = await row(b.id);
    expect(r.dateFrom).toBe('2026-05-18');
    expect(r.dateTo).toBe('2026-05-21');
    expect(r.totalCents).toBe(7500);
    expect((r.priceBreakdown as { totalCents: number }).totalCents).toBe(7500);
    const audits = await db
      .select()
      .from(schema.auditLog)
      .where(and(eq(schema.auditLog.entityId, b.id), eq(schema.auditLog.action, 'move')));
    expect(audits.length).toBe(1);
    const diff = audits[0]!.diff as { from: { dateFrom: string }; to: { dateFrom: string } };
    expect(diff.from.dateFrom).toBe('2026-05-11');
    expect(diff.to.dateFrom).toBe('2026-05-18');
  });

  it('candado de precio: cruzar a temporada alta con el total viejo → 409 price_changed con el desglose fresco', async () => {
    const b = await crear('2026-05-25', '2026-05-28');
    const res = await move(b.id, {
      dateFrom: '2026-07-06',
      dateTo: '2026-07-09',
      expectedTotalCents: b.totalCents, // 7500, ya obsoleto: julio es alta
    });
    expect(res.status).toBe(409);
    const body = (await res.json()) as { error: string; totalCents: number };
    expect(body.error).toBe('price_changed');
    expect(body.totalCents).toBe(12900); // 3×3800 + 1500
    expect((await row(b.id)).dateFrom).toBe('2026-05-25'); // no se movió

    // con el candado fresco, pasa y escribe el desglose nuevo
    const ok = await move(b.id, {
      dateFrom: '2026-07-06',
      dateTo: '2026-07-09',
      expectedTotalCents: 12900,
    });
    expect(ok.status).toBe(200);
    const r = await row(b.id);
    expect(r.totalCents).toBe(12900);
    expect(r.paidCents).toBe(0); // move nunca toca lo pagado
  });

  it('destino que solapa otra reserva de la misma unidad → 409 unit_occupied y nada cambia', async () => {
    const a = await crear('2026-08-10', '2026-08-13');
    const b = await crear('2026-08-17', '2026-08-20');
    await db.update(schema.bookings).set({ unitId: 'unt_1' }).where(eq(schema.bookings.id, a.id));
    await db.update(schema.bookings).set({ unitId: 'unt_1' }).where(eq(schema.bookings.id, b.id));
    const res = await move(a.id, { dateFrom: '2026-08-18', dateTo: '2026-08-21' });
    expect(res.status).toBe(409);
    expect(((await res.json()) as { error: string }).error).toBe('unit_occupied');
    expect((await row(a.id)).dateFrom).toBe('2026-08-10');
  });

  it('estirar: la propia reserva no solapa consigo misma; un bloqueo sí corta → 409', async () => {
    const b = await crear('2026-09-14', '2026-09-16');
    await db.update(schema.bookings).set({ unitId: 'unt_2' }).where(eq(schema.bookings.id, b.id));
    await db.insert(schema.inventoryBlocks).values({
      id: 'blk_move_test',
      tenantId: 'ten_alfa',
      unitId: 'unt_2',
      unitTypeId: null,
      dateFrom: '2026-09-17',
      dateTo: '2026-09-19',
      reason: 'maintenance',
    });
    // +1 noche: el rango nuevo pisa el viejo (consigo misma no cuenta) y roza el
    // bloqueo sin tocarlo (to exclusivo) → 200
    const ok = await move(b.id, { dateFrom: '2026-09-14', dateTo: '2026-09-17' });
    expect(ok.status).toBe(200);
    // +1 más: entra en el bloqueo → 409
    const clash = await move(b.id, { dateFrom: '2026-09-14', dateTo: '2026-09-18' });
    expect(clash.status).toBe(409);
    expect(((await clash.json()) as { error: string }).error).toBe('unit_occupied');
    await db.delete(schema.inventoryBlocks).where(eq(schema.inventoryBlocks.id, 'blk_move_test'));
  });

  it('las reglas de estancia mandan también en el mostrador → 422 explicado', async () => {
    const b = await crear('2026-10-12', '2026-10-15');
    // alta exige minStay 3: dos noches en julio no valen
    const res = await move(b.id, { dateFrom: '2026-07-27', dateTo: '2026-07-29' });
    expect(res.status).toBe(422);
    const body = (await res.json()) as { error: string; issues: unknown[] };
    expect(body.error).toBe('invalid_stay');
    expect(body.issues.length).toBeGreaterThan(0);
  });

  it('diagonal: move con unitId cambia fechas y unidad en UNA acción; unidad desconocida → 404', async () => {
    const b = await crear('2026-04-27', '2026-04-30');
    const res = await move(b.id, {
      dateFrom: '2026-03-24',
      dateTo: '2026-03-27',
      unitId: 'unt_3',
    });
    expect(res.status).toBe(200);
    const r = await row(b.id);
    expect(r.unitId).toBe('unt_3');
    expect(r.dateFrom).toBe('2026-03-24');
    const bad = await move(b.id, {
      dateFrom: '2026-03-24',
      dateTo: '2026-03-27',
      unitId: 'unt_nope',
    });
    expect(bad.status).toBe(404);
  });

  it('una completada no se mueve → 409; readonly no puede mover → 403', async () => {
    const b = await crear('2026-03-16', '2026-03-18');
    const forbidden = await move(b.id, { dateFrom: '2026-03-24', dateTo: '2026-03-26' }, readonly);
    expect(forbidden.status).toBe(403);
    await db
      .update(schema.bookings)
      .set({ status: 'completed' })
      .where(eq(schema.bookings.id, b.id));
    const res = await move(b.id, { dateFrom: '2026-03-24', dateTo: '2026-03-26' });
    expect(res.status).toBe(409);
    expect(((await res.json()) as { error: string }).error).toBe('invalid_state');
  });

  it('fechas invertidas → 400', async () => {
    const b = await crear('2026-06-25', '2026-06-27');
    const res = await move(b.id, { dateFrom: '2026-06-27', dateTo: '2026-06-25' });
    expect(res.status).toBe(400);
  });

  it('el planning devuelve las temporadas para la franja de cabecera', async () => {
    const res = await app.request(
      '/api/admin/planning?from=2026-07-01&to=2026-07-08',
      { headers: { cookie: readonly, ...IP } },
      envA,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { seasons: { name: string; priority: number }[] };
    expect(body.seasons.map((s) => s.name).sort()).toEqual(['Alta', 'Apertura']);
  });

  it('alta con preferredUnitId: la respeta si está libre y cae al asignador si no (ADR 0023 §2)', async () => {
    const a = await crear('2026-08-24', '2026-08-27', { preferredUnitId: 'unt_3' });
    expect(a.unitId).toBe('unt_3');
    const b = await crear('2026-08-24', '2026-08-27', { preferredUnitId: 'unt_3' });
    expect(b.unitId).toBeTruthy();
    expect(b.unitId).not.toBe('unt_3'); // ocupada por la anterior: el asignador decide
  });
});
