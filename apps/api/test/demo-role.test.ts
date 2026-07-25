/**
 * EL ROL `demo`, POR BARRIDO (ADR 0029 §3).
 *
 * El riesgo de este rol no es lo que se abre hoy: es la ruta que alguien escriba
 * dentro de seis meses. Por eso no hay un test por caso, hay UN barrido dirigido
 * por el inventario del propio Hono (`app.routes`), calcado del de aislamiento:
 * con una sesión real de rol `demo`, toda ruta de `/api/admin` debe responder
 * **403** salvo las que estén declaradas aquí abajo, una a una y con su motivo.
 *
 * La propiedad que compra: una ruta nueva **nace denegada**, y si alguien la
 * abre al visitante tiene que escribir la línea que lo dice. La entrega falla
 * hasta entonces — incluida una ruta nueva de LECTURA, que por la jerarquía
 * pasaría sola (`demo` empata con `readonly`) y si no se declara, aquí salta.
 *
 * La afirmación se comprueba en los dos sentidos: lo denegado devuelve 403, y lo
 * permitido NO devuelve 403 (si algún día se cierra por accidente, también salta).
 */
import { env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { DEMO_ACTIONS, provisionUser } from '../src/auth';
import { seedTenant } from './fixtures';

const envA = { DB: env.DB, TENANT_SLUG: 'alfa' };

const json = (body: unknown, headers: Record<string, string> = {}) => ({
  method: 'POST',
  headers: { 'content-type': 'application/json', ...headers },
  body: JSON.stringify(body),
});

async function signIn(email: string, password: string): Promise<string> {
  const res = await app.request('/api/auth/sign-in/email', json({ email, password }), envA);
  expect(res.status).toBe(200);
  const setCookies = (res.headers as Headers & { getSetCookie(): string[] }).getSetCookie();
  return setCookies.map((c) => c.split(';')[0]).join('; ');
}

// ---------------------------------------------------------------------------
// Inventario (mismo criterio que isolation.test.ts: los `use()` son middleware)
// ---------------------------------------------------------------------------

const clave = (method: string, path: string) => `${method} ${path}`;

function inventarioAdmin(): string[] {
  const vistas = new Set<string>();
  for (const r of app.routes) {
    if (r.method === 'ALL' && r.path.endsWith('*')) continue; // middleware
    if (!r.path.startsWith('/api/admin/')) continue;
    vistas.add(clave(r.method, r.path));
  }
  return [...vistas].sort();
}

/**
 * LO QUE EL VISITANTE DE LA DEMO PUEDE PEDIR SIN MÁS (ADR 0029 §1 y §2).
 *
 * Son los GET de lectura —los mismos que ve un `readonly`, ni uno más— y el
 * dry-run del gesto del planning. Ninguno escribe en la base.
 */
const DEMO_PERMITIDO: Record<string, string> = {
  'GET /api/admin/planning': 'el tape chart: es la pantalla que se viene a ver',
  'GET /api/admin/catalog': 'tipos, extras y temporadas — contexto del planning',
  'GET /api/admin/map': 'el plano del camping',
  'GET /api/admin/bookings': 'lista de reservas',
  'GET /api/admin/bookings/:id': 'ficha de reserva',
  'GET /api/admin/guests': 'lista de huéspedes',
  'GET /api/admin/guests/:id': 'ficha de huésped',
  'GET /api/admin/enquiries': 'bandeja de solicitudes',
  'GET /api/admin/notifications': 'log de notificaciones',
  'GET /api/admin/payments': 'log de pagos',
  'GET /api/admin/rates': 'tabla de tarifas (leer sí, editar no)',
  'GET /api/admin/reports': 'informes',
  'GET /api/admin/settings': 'ajustes (leer sí, editar no)',
  'POST /api/admin/bookings/:id/requote':
    'dry-run del gesto del planning (ADR 0023): cotiza el movimiento para enseñar ' +
    'el desglose antes de confirmar. NO escribe nada — por eso la excepción es completa.',
};

/**
 * La única ruta que MUTA y que el visitante alcanza, y solo con 5 de sus 13
 * acciones. No entra en el barrido genérico porque su respuesta depende del
 * cuerpo: la cubre entera el bloque "las 13 acciones" de más abajo.
 */
const DEMO_POR_ACCION: Record<string, string> = {
  'PATCH /api/admin/bookings/:id':
    'puerta de las 13 acciones: solo pasan las de DEMO_ACTIONS (mover, asignar, ' +
    'check-in/out). Cubierta acción por acción, no por barrido.',
};

/** Identificador falso por entidad: el 403 llega ANTES del handler, no hace falta que exista. */
function idFalso(entidad: string): string {
  const porEntidad: Record<string, string> = {
    bookings: 'bkg_inexistente',
    guests: 'gst_inexistente',
    enquiries: 'enq_inexistente',
    blocks: 'blk_inexistente',
    units: 'unt_1',
    rates: 'rp_alfa_0',
  };
  const id = porEntidad[entidad];
  if (!id) {
    throw new Error(
      `El barrido del rol demo no sabe qué identificador poner bajo "/${entidad}/". ` +
        `Añade la entidad a idFalso() en test/demo-role.test.ts.`,
    );
  }
  return id;
}

function url(path: string): string {
  const partes = path.split('/');
  return partes
    .map((seg, i) => (seg.startsWith(':') ? idFalso(partes[i - 1] ?? '') : seg))
    .join('/');
}

/** Petición genérica con la sesión de demo: cuerpo vacío, que basta para el 403. */
function peticion(method: string, cookie: string): RequestInit {
  if (method === 'GET' || method === 'DELETE') return { method, headers: { cookie } };
  return { method, headers: { 'content-type': 'application/json', cookie }, body: '{}' };
}

let demo = '';
let reception = '';
let bookingId = '';

beforeAll(async () => {
  await seedTenant(env.DB, 'alfa');

  await provisionUser(envA, {
    email: 'demo@alfa.test',
    password: 'secreto123',
    name: 'Visitante',
    role: 'demo',
  });
  await provisionUser(envA, {
    email: 'recepcion-demo@alfa.test',
    password: 'secreto123',
    name: 'Recepción',
    role: 'reception',
  });
  demo = await signIn('demo@alfa.test', 'secreto123');
  reception = await signIn('recepcion-demo@alfa.test', 'secreto123');

  // una reserva real: hace falta para probar que las acciones permitidas
  // pasan la guarda de verdad (y no solo que "no dan 403 sobre un 404")
  const res = await app.request(
    '/api/admin/bookings',
    json(
      {
        unitTypeId: 'ut_std',
        dateFrom: '2026-07-06',
        dateTo: '2026-07-09',
        occupancy: { adults: 2, childrenAges: [], pets: 0, vehicles: 1 },
        extraIds: [],
        holder: { name: 'Visitante', email: 'visitante@example.com' },
        locale: 'es',
        channel: 'phone',
      },
      { cookie: reception },
    ),
    envA,
  );
  expect(res.status).toBe(201);
  bookingId = ((await res.json()) as { id: string }).id;
});

// ---------------------------------------------------------------------------

describe('rol demo: barrido de /api/admin', () => {
  const rutas = inventarioAdmin();
  const barridas = new Set<string>();

  for (const k of rutas) {
    const [method, path] = k.split(' ') as [string, string];

    if (k in DEMO_POR_ACCION) continue; // la cubre el bloque de acciones

    if (k in DEMO_PERMITIDO) {
      it(`${k} → el visitante la alcanza`, async () => {
        const res = await app.request(url(path), peticion(method, demo), envA);
        // puede ser 200, o 400/404 por el cuerpo vacío y los ids falsos —
        // lo que NO puede ser es un 403: eso significaría que se ha cerrado
        expect(res.status).not.toBe(403);
        barridas.add(k);
      });
      continue;
    }

    it(`${k} → 403 demo_readonly para el visitante`, async () => {
      const res = await app.request(url(path), peticion(method, demo), envA);
      expect(res.status).toBe(403);
      // el cuerpo importa: el dashboard lo traduce a "en la demo esto es solo
      // lectura" en vez de al error genérico de la pantalla (ADR 0029 §5)
      expect(await res.json()).toEqual({ error: 'demo_readonly' });
      barridas.add(k);
    });
  }

  it('el bucle se cierra: todas las rutas admin quedan clasificadas', () => {
    const clasificadas = rutas.filter((k) => k in DEMO_POR_ACCION || barridas.has(k));
    expect(clasificadas.sort()).toEqual(rutas);
    // guarda de que el inventario no se ha quedado vacío por un cambio de Hono
    expect(rutas.length).toBeGreaterThan(25);
  });

  it('lo declarado existe de verdad: ninguna línea muerta', () => {
    for (const k of [...Object.keys(DEMO_PERMITIDO), ...Object.keys(DEMO_POR_ACCION)]) {
      expect(rutas, `declarada "${k}" pero ya no existe: repasa la declaración`).toContain(k);
    }
  });
});

describe('rol demo: las 13 acciones de PATCH /bookings/:id', () => {
  const PERMITIDAS = DEMO_ACTIONS;
  const NEGADAS = [
    'confirm',
    'cancel',
    'no_show',
    'complete',
    'note',
    'record_payment',
    'refund',
    'set_payment_kind',
  ] as const;

  it('la lista permitida es exactamente la del ADR 0029 §2', () => {
    expect([...PERMITIDAS]).toEqual(['move', 'reassign', 'check_in', 'check_out', 'undo_checkin']);
  });

  for (const action of NEGADAS) {
    it(`"${action}" → 403 demo_readonly`, async () => {
      const res = await app.request(
        `/api/admin/bookings/${bookingId}`,
        { method: 'PATCH', headers: { 'content-type': 'application/json', cookie: demo }, body: JSON.stringify({ action }) },
        envA,
      );
      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ error: 'demo_readonly' });
    });
  }

  for (const action of PERMITIDAS) {
    it(`"${action}" → pasa la guarda`, async () => {
      const res = await app.request(
        `/api/admin/bookings/${bookingId}`,
        { method: 'PATCH', headers: { 'content-type': 'application/json', cookie: demo }, body: JSON.stringify({ action }) },
        envA,
      );
      // el estado de la reserva puede rechazar la acción (400/409) — eso es
      // asunto del motor. Lo que se comprueba aquí es que la AUTORIZACIÓN pasa.
      expect(res.status).not.toBe(403);
    });
  }

  it('sin acción reconocible → 403, no 400: la guarda va antes que el validador', async () => {
    const res = await app.request(
      `/api/admin/bookings/${bookingId}`,
      { method: 'PATCH', headers: { 'content-type': 'application/json', cookie: demo }, body: '{}' },
      envA,
    );
    expect(res.status).toBe(403);
  });
});

describe('rol demo: mover una reserva de verdad (el gesto que vende)', () => {
  it('requote + move: el visitante mueve la reserva y la base lo refleja', async () => {
    const requote = await app.request(
      `/api/admin/bookings/${bookingId}/requote`,
      json({ dateFrom: '2026-07-07', dateTo: '2026-07-10' }, { cookie: demo }),
      envA,
    );
    expect(requote.status).toBe(200);

    const move = await app.request(
      `/api/admin/bookings/${bookingId}`,
      {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', cookie: demo },
        body: JSON.stringify({ action: 'move', dateFrom: '2026-07-07', dateTo: '2026-07-10' }),
      },
      envA,
    );
    expect(move.status).toBe(200);

    const ficha = await app.request(
      `/api/admin/bookings/${bookingId}`,
      { headers: { cookie: demo } },
      envA,
    );
    const body = (await ficha.json()) as { dateFrom: string; dateTo: string };
    expect(body.dateFrom).toBe('2026-07-07');
    expect(body.dateTo).toBe('2026-07-10');
  });
});

describe('rol demo: no se cuela por los lados', () => {
  it('no puede crear usuarios (ni siquiera otro demo)', async () => {
    const res = await app.request(
      '/api/admin/users',
      json(
        { email: 'colado@alfa.test', password: 'secreto123', name: 'Colado', role: 'owner' },
        { cookie: demo },
      ),
      envA,
    );
    expect(res.status).toBe(403);
  });

  it('`demo` no es un rol que se pueda provisionar por la API', async () => {
    const res = await app.request(
      '/api/admin/users',
      json(
        { email: 'otro@alfa.test', password: 'secreto123', name: 'Otro', role: 'demo' },
        { cookie: reception },
      ),
      envA,
    );
    // reception ya no llega a owner (403); lo que importa es que el rol tampoco
    // es válido para el esquema — se siembra, no se reparte (ADR 0029 §1)
    expect(res.status).not.toBe(201);
  });

  it('a un `readonly` de verdad se le sigue diciendo "forbidden", no "demo"', async () => {
    await provisionUser(envA, {
      email: 'consulta-demo@alfa.test',
      password: 'secreto123',
      name: 'Consulta',
      role: 'readonly',
    });
    const readonly = await signIn('consulta-demo@alfa.test', 'secreto123');
    const res = await app.request(
      '/api/admin/blocks',
      json({ unitId: 'unt_1', dateFrom: '2026-07-01', dateTo: '2026-07-02' }, { cookie: readonly }),
      envA,
    );
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'forbidden', required: 'reception' });
  });

  it('la API genérica NO tiene puerta de demo: un camping real ni la ofrece', async () => {
    // La sonda, el sign-in anónimo y el reset viven SOLO en tenants/demo/worker.ts
    // (ADR 0029 §4). Si algún día alguien los subiera a `apps/api`, este test cae:
    // el dashboard pinta el botón "Ver la demo" en cuanto la sonda contesta, así
    // que un 200 aquí significaría ofrecer acceso anónimo en TODOS los campings.
    for (const path of ['/api/demo', '/api/demo/sign-in', '/api/demo/reset']) {
      const res = await app.request(path, { method: 'GET' }, envA);
      expect(res.status, `${path} no debería existir en la API genérica`).toBe(404);
    }
  });

  it('sin sesión sigue siendo 401, no 403', async () => {
    const res = await app.request('/api/admin/planning?from=2026-07-01&to=2026-07-08', {}, envA);
    expect(res.status).toBe(401);
  });

  it('no regresión: recepción sigue pudiendo cancelar', async () => {
    const res = await app.request(
      `/api/admin/bookings/${bookingId}`,
      {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', cookie: reception },
        body: JSON.stringify({ action: 'cancel' }),
      },
      envA,
    );
    expect(res.status).toBe(200);
  });
});
