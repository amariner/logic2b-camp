/**
 * AISLAMIENTO ENTRE TENANTS POR BARRIDO (invariante 5, ADR 0026 §1).
 *
 * No hay un test por ruta: hay UN test que se dirige solo desde el inventario de
 * rutas del propio Hono (`app.routes`). Por cada ruta registrada se lanza la
 * petición contra el env del tenant B con identificadores y sesión del tenant A,
 * y se exige que NO devuelva datos de A.
 *
 * La propiedad que compra este diseño, y la razón de elegirlo: **una ruta nueva
 * queda cubierta el día que se escribe, sin que nadie haga nada.** Y el cierre
 * del bucle (último `describe` de este fichero) hace que una ruta que NO se pueda
 * barrer automáticamente tampoco se cuele en silencio: obliga a una línea
 * explícita en `EXCEPCIONES` con su motivo.
 *
 * Honestidad técnica (ADR 0026 §1): el aislamiento real lo da el binding
 * (`tenant.ts:46`, `createDb(c.env.DB)`), no un filtro `WHERE tenant_id`. Con esa
 * arquitectura este barrido es *en teoría* redundante. Se hace igual porque
 * `admin.ts` sí usa `tenantId` en algunas escrituras — el modelo mental no es
 * uniforme y una regresión es posible — y porque la doc publicada promete el
 * test, no la arquitectura.
 */
import { createDb, schema } from '@logic-camp/db';
import { env } from 'cloudflare:test';
import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { provisionUser } from '../src/auth';
import { seedTenant } from './fixtures';

const envA = { DB: env.DB, TENANT_SLUG: 'alfa', LOGIC_CAMP_DEV_AUTH: '1' };
const envB = { DB: env.DB_B, TENANT_SLUG: 'beta', LOGIC_CAMP_DEV_AUTH: '1' };

/** Titular de la reserva de A: sirve de credencial en el funnel público por código+email. */
const TITULAR_A = 'titular-solo-en-alfa@example.com';

// ---------------------------------------------------------------------------
// Inventario de rutas
// ---------------------------------------------------------------------------

/** Clave canónica `MÉTODO /path`. Todo el fichero compara rutas por esta cadena. */
const clave = (method: string, path: string) => `${method} ${path}`;

/**
 * Rutas reales registradas en la app, sin middleware y sin duplicados.
 *
 * `app.routes` incluye tanto los handlers como los `use()`, y también las rutas
 * de los routers montados con `.route()` ya con su path completo. Los `use()`
 * llegan siempre como método `ALL` sobre un comodín (`ALL /api/admin/*`): eso es
 * middleware, no superficie de API, y se descarta. Si algún día se registra una
 * ruta de verdad con `app.all('/loquesea/*')`, quedaría fuera del barrido — por
 * eso el filtro es lo más estrecho posible y se comprueba aquí abajo.
 */
function inventario(): string[] {
  const vistas = new Set<string>();
  for (const r of app.routes) {
    if (r.method === 'ALL' && r.path.endsWith('*')) continue; // middleware
    vistas.add(clave(r.method, r.path));
  }
  return [...vistas].sort();
}

/**
 * TABLA DE EXCEPCIONES — rutas que NO se pueden barrer automáticamente.
 *
 * Cada línea la tiene que escribir alguien a conciencia, con su motivo. No es un
 * cajón para esconder una fuga: si el barrido encuentra una, se arregla el
 * código, no se añade aquí.
 */
const EXCEPCIONES: Record<string, string> = {
  'GET /api/auth/*':
    'Better Auth enruta internamente sus propios endpoints (sign-in, sign-out, session…) ' +
    'bajo este comodín: no hay un path concreto que barrer ni parámetros que sustituir. ' +
    'La fuga cruzada de sesión está cubierta explícitamente en admin.test.ts ("fuga cruzada: ' +
    'la sesión de A no vale en B y el usuario de A no existe en B").',
  'POST /api/auth/*':
    'Mismo comodín de Better Auth. El mismo test de admin.test.ts comprueba además que el ' +
    'login de un usuario de A contra el env de B falla.',
  'POST /api/payments/webhook/:provider':
    'Webhook: el identificador de la reserva no viaja en el path sino dentro de un cuerpo ' +
    'FIRMADO por el proveedor (`parseWebhook` → 400 invalid_signature sin firma válida). Sin ' +
    'la clave de comercio no se puede alcanzar el código que lee o escribe una reserva, así ' +
    'que un barrido genérico solo probaría que un proveedor no configurado responde 404.',
};

/** Rutas que el barrido tiene que cubrir: el inventario menos las excepciones. */
const RUTAS_BARRIBLES = inventario().filter((k) => !(k in EXCEPCIONES));

/** Se rellena dentro del barrido, DESPUÉS de asertar. Lo lee el cierre del bucle. */
const barridas = new Set<string>();

// ---------------------------------------------------------------------------
// Identificadores reales del tenant A
// ---------------------------------------------------------------------------

/**
 * Identificadores REALES del tenant A, literales y reconocibles: son a la vez el
 * dato que se inyecta en el path y la cadena que se busca en la respuesta de B.
 * Ninguno existe ni puede existir en el tenant B.
 */
const idsA = {
  bookingId: 'bkg_solo_en_alfa',
  code: 'CS-2026-SOLOALFA',
  guestId: 'gst_solo_en_alfa',
  enquiryId: 'enq_solo_en_alfa',
  holdId: 'hld_solo_en_alfa',
  blockId: 'blk_solo_en_alfa',
};

/**
 * Qué identificador de A poner en cada parámetro del path. Se resuelve por el
 * SEGMENTO que precede al parámetro (`/bookings/:id` → reserva, `/guests/:guestId`
 * → huésped), nunca por la ruta entera: así una ruta nueva sobre una entidad ya
 * conocida queda barrida sin tocar este fichero. Si aparece una entidad nueva,
 * el barrido falla en voz alta pidiendo la línea que falta.
 */
function identificadorDeA(entidad: string, parametro: string): string {
  if (parametro === 'code') return idsA.code; // el funnel público indexa por código, no por id
  const porEntidad: Record<string, string> = {
    bookings: idsA.bookingId,
    guests: idsA.guestId,
    enquiries: idsA.enquiryId,
    holds: idsA.holdId,
    blocks: idsA.blockId,
    units: 'unt_1',
    rates: 'rp_alfa_0',
  };
  const id = porEntidad[entidad];
  if (!id) {
    throw new Error(
      `El barrido de aislamiento no sabe qué identificador del tenant A poner en ` +
        `":${parametro}" bajo "/${entidad}/". Añade la entidad a identificadorDeA() ` +
        `en test/isolation.test.ts creando el dato en el beforeAll, o declara la ruta ` +
        `en EXCEPCIONES con su motivo.`,
    );
  }
  return id;
}

/** Sustituye los parámetros del path por identificadores REALES de A. */
function urlConDatosDeA(path: string): string {
  const partes = path.split('/');
  return partes
    .map((seg, i) =>
      seg.startsWith(':') ? identificadorDeA(partes[i - 1] ?? '', seg.slice(1)) : seg,
    )
    .join('/');
}

/**
 * Query y cuerpo por ruta. Solo para las rutas públicas donde un cuerpo vacío
 * daría un 400 de validación antes de llegar a mirar el dato de A: ahí interesa
 * el 404 de verdad ("esa reserva no existe en B"), que es lo que prueba algo.
 * El resto va con `{}` y un 400 es respuesta aceptable.
 */
const QUERY: Record<string, string> = {
  'GET /api/bookings/:code': `email=${encodeURIComponent(TITULAR_A)}`,
};

const CUERPO: Record<string, unknown> = {
  'POST /api/bookings/:code/cancel': { email: TITULAR_A },
  'POST /api/bookings/:code/modify': {
    email: TITULAR_A,
    dateFrom: '2026-05-04',
    dateTo: '2026-05-07',
  },
};

/**
 * Estados aceptables al pedir un dato de A contra B. El 400 entra porque un
 * cuerpo genérico no valida en muchas rutas, y un 400 tampoco devuelve nada.
 * El 204 entra porque, sin cuerpo, no puede llevar datos de A por definición
 * (el DELETE de holds es ciego por diseño y cae sobre la D1 de B).
 */
const ESTADOS_ACEPTABLES = [204, 400, 401, 403, 404, 409, 422];

// ---------------------------------------------------------------------------

/** Cookie de sesión de un `owner` REAL del tenant A: el máximo privilegio posible. */
let sesionA = '';

beforeAll(async () => {
  await seedTenant(env.DB, 'alfa');
  await seedTenant(env.DB_B, 'beta');

  const db = createDb(env.DB);

  // sesión de A con el rol más alto: si algo se colase, se colaría aquí
  await provisionUser(envA, {
    email: 'owner@alfa.test',
    password: 'secreto123',
    name: 'Owner',
    role: 'owner',
  });
  const login = await app.request(
    '/api/auth/sign-in/email',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'cf-connecting-ip': 'iso-login' },
      body: JSON.stringify({ email: 'owner@alfa.test', password: 'secreto123' }),
    },
    envA,
  );
  expect(login.status).toBe(200);
  // getSetCookie existe en workerd pero aún no en los tipos de Headers
  sesionA = (login.headers as Headers & { getSetCookie(): string[] })
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .join('; ');
  expect(sesionA).toContain('session_token');

  // Los datos de A se escriben DIRECTOS en su D1, no por la API. A propósito:
  // este fichero comprueba el aislamiento, no el funnel — si mañana cambia un
  // esquema de petición (un campo obligatorio nuevo, p. ej.), el barrido no se
  // cae con él. Los valores replican lo que escribe el propio código
  // (`bookings.ts`: `tenantId: tenant.slug`).
  const ocupacion = { adults: 2, childrenAges: [], pets: 0, vehicles: 1 };
  const desglose = {
    lines: [{ concept: 'price.base', amountCents: 6000, detail: {} }],
    totalCents: 6000,
    touristTaxCents: 0,
    depositCents: 0,
  };

  await db.insert(schema.bookings).values({
    id: idsA.bookingId,
    tenantId: 'alfa',
    code: idsA.code,
    status: 'confirmed',
    channel: 'web',
    dateFrom: '2026-05-04',
    dateTo: '2026-05-07',
    unitTypeId: 'ut_std',
    unitId: 'unt_1',
    occupancy: ocupacion,
    extras: [],
    priceBreakdown: desglose as never,
    totalCents: 6000,
    paidCents: 0,
    touristTaxCents: 0,
    depositCents: 0,
    locale: 'es',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  });
  await db.insert(schema.guests).values({
    id: idsA.guestId,
    tenantId: 'alfa',
    name: 'Titular',
    surname: 'Alfa',
    email: TITULAR_A,
  });
  await db
    .insert(schema.bookingGuests)
    .values({ bookingId: idsA.bookingId, guestId: idsA.guestId, isLead: true });

  await db.insert(schema.enquiries).values({
    id: idsA.enquiryId,
    tenantId: 'alfa',
    status: 'new',
    message: 'Solicitud que solo existe en alfa',
    contact: { name: 'Titular Alfa', email: TITULAR_A },
    locale: 'es',
    source: 'web',
    createdAt: '2026-01-01T00:00:00.000Z',
  });

  await db.insert(schema.inventoryHolds).values({
    id: idsA.holdId,
    tenantId: 'alfa',
    unitTypeId: 'ut_std',
    dateFrom: '2026-05-11',
    dateTo: '2026-05-13',
    occupancy: ocupacion,
    // muy en el futuro: el hold tiene que seguir vivo durante todo el barrido
    expiresAt: '2099-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
  });

  await db.insert(schema.inventoryBlocks).values({
    id: idsA.blockId,
    tenantId: 'alfa',
    unitId: 'unt_1',
    unitTypeId: null,
    dateFrom: '2027-01-05',
    dateTo: '2027-01-08',
    reason: 'maintenance',
  });

  // control de la fixture: los datos de A existen de verdad en A. Sin esto, un
  // seed roto haría pasar todo el barrido por la razón equivocada.
  const enA = await db.select().from(schema.bookings).where(eq(schema.bookings.id, idsA.bookingId));
  expect(enA).toHaveLength(1);
});

/** Cadenas que SOLO existen en el tenant A: si una sale por la respuesta de B, es fuga. */
const secretosDeA = (): Record<string, string> => ({
  'id de reserva': idsA.bookingId,
  'código de reserva': idsA.code,
  'id de huésped': idsA.guestId,
  'id de solicitud': idsA.enquiryId,
  'id de hold': idsA.holdId,
  'id de bloqueo': idsA.blockId,
  'email del titular': TITULAR_A,
});

describe('AISLAMIENTO ENTRE TENANTS — barrido del inventario de rutas (ADR 0026 §1)', () => {
  it.each(RUTAS_BARRIBLES)('%s no devuelve nada del tenant A', async (ruta) => {
    const [method, path] = ruta.split(' ') as [string, string];
    const url = urlConDatosDeA(path);
    const query = QUERY[ruta];
    // una IP por ruta: el limitador es por IP y en ventana fija (ADR 0004), y un
    // barrido de ~40 peticiones tumbaría el bucket compartido con un 429 que no
    // tiene nada que ver con el aislamiento
    const cabeceras: Record<string, string> = {
      cookie: sesionA,
      'cf-connecting-ip': `iso-${method}-${path}`,
    };
    const init: RequestInit = { method, headers: cabeceras };
    if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
      cabeceras['content-type'] = 'application/json';
      init.body = JSON.stringify(CUERPO[ruta] ?? {});
    }

    const res = await app.request(query ? `${url}?${query}` : url, init, envB);
    const cuerpo = await res.text();

    // 1) el cuerpo NUNCA puede contener un identificador del tenant A
    for (const [nombre, valor] of Object.entries(secretosDeA())) {
      expect(cuerpo, `${ruta} filtró el ${nombre} del tenant A: ${valor}`).not.toContain(valor);
    }

    // 2) si el path llevaba un identificador de A, no hay éxito legítimo posible:
    //    un 200/201 significaría que B ha leído o escrito sobre una entidad de A
    if (path.includes('/:')) {
      expect(
        ESTADOS_ACEPTABLES,
        `${ruta} respondió ${res.status} a un identificador del tenant A. ` +
          `Un identificador de A contra la D1 de B no puede tener éxito. Cuerpo: ${cuerpo.slice(0, 300)}`,
      ).toContain(res.status);
    }

    barridas.add(ruta);
  });
});

/**
 * EL CIERRE DEL BUCLE. Es lo importante de todo el fichero: sin esto, el barrido
 * cubre lo que cubre hoy y una ruta nueva nace sin test de fuga cruzada.
 */
describe('CIERRE DEL BUCLE — el inventario de rutas manda', () => {
  it('toda ruta registrada está barrida o declarada como excepción con su motivo', () => {
    const cubiertas = new Set([...barridas, ...Object.keys(EXCEPCIONES)]);
    const huerfanas = inventario().filter((k) => !cubiertas.has(k));

    expect(
      huerfanas,
      huerfanas.length === 0
        ? ''
        : `Hay ${huerfanas.length} ruta(s) registrada(s) que el barrido de aislamiento no cubre:\n` +
            huerfanas.map((k) => `  · ${k}`).join('\n') +
            `\n\nQué hacer (apps/api/test/isolation.test.ts):\n` +
            `  a) Si la ruta se puede barrer, comprueba que sus parámetros se resuelven en ` +
            `identificadorDeA() — puede que necesite una entidad nueva creada en el beforeAll.\n` +
            `  b) Si NO se puede barrer (cuerpo firmado, webhook, auth propia de Better Auth…), ` +
            `añádela a EXCEPCIONES con el MOTIVO escrito.\n` +
            `No la dejes fuera: una ruta sin declarar es una ruta sin test de fuga cruzada.`,
    ).toEqual([]);
  });

  it('no hay excepciones caducadas: toda excepción corresponde a una ruta que existe', () => {
    const registradas = new Set(inventario());
    const caducadas = Object.keys(EXCEPCIONES).filter((k) => !registradas.has(k));
    expect(
      caducadas,
      `Estas excepciones ya no corresponden a ninguna ruta registrada; bórralas de ` +
        `EXCEPCIONES en test/isolation.test.ts:\n${caducadas.map((k) => `  · ${k}`).join('\n')}`,
    ).toEqual([]);
  });

  it('toda excepción trae un motivo escrito, no una línea puesta para callar el test', () => {
    // el motivo es la única defensa contra que EXCEPCIONES se use de cajón: si
    // no se puede exigir que sea bueno, al menos se exige que exista y que
    // alguien lo haya escrito
    const sinMotivo = Object.entries(EXCEPCIONES)
      .filter(([, motivo]) => motivo.trim().length < 40)
      .map(([ruta]) => ruta);
    expect(
      sinMotivo,
      `Estas excepciones no explican POR QUÉ la ruta no se puede barrer:\n${sinMotivo
        .map((k) => `  · ${k}`)
        .join('\n')}`,
    ).toEqual([]);
  });

  it('el barrido cubre la superficie pública y privada, no un puñado de rutas', () => {
    // guarda contra un filtro de middleware que se lleve por delante rutas reales
    expect(RUTAS_BARRIBLES.length).toBeGreaterThan(30);
    expect(RUTAS_BARRIBLES.some((k) => k.includes('/api/admin/'))).toBe(true);
    expect(RUTAS_BARRIBLES.some((k) => !k.includes('/api/admin/'))).toBe(true);
  });
});
