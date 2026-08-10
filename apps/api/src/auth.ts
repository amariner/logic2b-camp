/**
 * Better Auth sobre la MISMA tabla `users` del dominio, vía adaptador Drizzle (ADR 0005).
 * Una instancia por petición con el binding del tenant: el Worker solo puede
 * autenticar contra su propia D1 — el aislamiento lo da el entorno, como siempre.
 */
import { createDb, schema } from '@logic-camp/db';
import { DEMO_BOOKING_ACTIONS, roleAtLeast, type Role } from '@logic-camp/config/roles';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { eq } from 'drizzle-orm';
import type { Context, MiddlewareHandler } from 'hono';
import { z } from 'zod';
import type { Bindings, Env } from './tenant';

export type { Role } from '@logic-camp/config/roles';

/**
 * Lo ÚNICO que el rol `demo` puede mutar (ADR 0029 §2).
 *
 * `PATCH /bookings/:id` es la puerta de las 13 acciones de la unión discriminada
 * (`schemas.ts`), así que autorizar por RUTA le regalaría al visitante `cancel`,
 * `record_payment` y `refund`. La unidad de autorización aquí es la acción.
 */
export const DEMO_ACTIONS = DEMO_BOOKING_ACTIONS;

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  tenantId: string;
};

export type AuthEnv = {
  Bindings: Bindings;
  Variables: Env['Variables'] & { user: AuthUser };
};

/**
 * Orígenes autorizados SOLO en desarrollo local (ADR 0019 §1).
 *
 * La lista es una CONSTANTE del código a propósito: `LOGIC_CAMP_DEV_ORIGINS`
 * actúa como interruptor, nunca como valor. Una variable de valor libre sería
 * una puerta con cerradura de plástico — un despiste autorizaría un dominio
 * arbitrario. Así, el peor caso posible es autorizar `localhost`, que un
 * atacante remoto no controla.
 *
 * En producción el dashboard es MISMO ORIGEN (`/admin/` del propio Worker),
 * así que esta lista debe quedar vacía. Fail-closed: sin el flag, `[]`.
 */
const DEV_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const LOCAL_AUTH_SECRET = 'local-only-8Kq4Yp2Vm9Rz7Tx5Nc3Hs6Wb1Df0GjLu';

/** Producción nunca cae a una clave conocida; el fallback necesita un interruptor local explícito. */
export function resolveAuthSecret(env: Bindings): string {
  if (env.AUTH_SECRET !== undefined) {
    if (env.AUTH_SECRET.length < 32) {
      throw new Error('AUTH_SECRET inválido: debe tener al menos 32 caracteres');
    }
    return env.AUTH_SECRET;
  }
  if (env.LOGIC_CAMP_DEV_AUTH === '1') return LOCAL_AUTH_SECRET;
  throw new Error(
    'AUTH_SECRET ausente: configure el secret o active LOGIC_CAMP_DEV_AUTH=1 en local',
  );
}

export function createAuth(env: Bindings, opts: { allowSignUp?: boolean } = {}) {
  return betterAuth({
    secret: resolveAuthSecret(env),
    basePath: '/api/auth',
    // Fail-closed: ausencia del interruptor ⇒ ningún origen cruzado autorizado.
    trustedOrigins: env.LOGIC_CAMP_DEV_ORIGINS ? DEV_ORIGINS : [],
    database: drizzleAdapter(createDb(env.DB), {
      provider: 'sqlite',
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),
    emailAndPassword: {
      enabled: true,
      // registro público desactivado: los usuarios se provisionan (ADR 0005)
      disableSignUp: !opts.allowSignUp,
      requireEmailVerification: false,
    },
    user: {
      modelName: 'user',
      additionalFields: {
        // input:false — un cliente no puede autoconcederse rol ni tenant
        role: { type: 'string', required: false, defaultValue: 'readonly', input: false },
        tenantId: {
          type: 'string',
          required: false,
          defaultValue: env.TENANT_SLUG ?? 'unknown',
          input: false,
        },
      },
    },
    advanced: {
      database: { generateId: () => `usr_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}` },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;

/** Provisión en servidor: crea el usuario con signup interno y fija el rol después. */
export async function provisionUser(
  env: Bindings,
  input: { email: string; password: string; name: string; role: Role },
): Promise<AuthUser> {
  const auth = createAuth(env, { allowSignUp: true });
  const res = await auth.api.signUpEmail({
    body: { email: input.email, password: input.password, name: input.name },
  });
  const db = createDb(env.DB);
  const tenantSlug = env.TENANT_SLUG ?? 'unknown';
  const [tenant] = await db
    .select({ id: schema.tenants.id })
    .from(schema.tenants)
    .where(eq(schema.tenants.slug, tenantSlug))
    .limit(1);
  const tenantId = tenant?.id ?? tenantSlug;
  await db
    .update(schema.users)
    .set({ role: input.role, tenantId })
    .where(eq(schema.users.id, res.user.id));
  return {
    id: res.user.id,
    email: res.user.email,
    name: res.user.name,
    role: input.role,
    tenantId,
  };
}

/** Fail-closed: un rol que no esté en la tabla no alcanza ningún nivel. */
const alcanza = roleAtLeast;

/**
 * Resuelve la sesión de la petición. Cada guarda la resuelve por su cuenta (no
 * lee `c.get('user')`) para que ninguna dependa del orden en que se monte.
 */
async function resolverUsuario(c: Context<AuthEnv>): Promise<AuthUser | null> {
  const auth = createAuth(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return null;
  const parsed = z
    .object({
      id: z.string().min(1),
      email: z.string().email(),
      name: z.string(),
      role: z.enum(['owner', 'manager', 'reception', 'readonly', 'demo']).default('readonly'),
      tenantId: z.string().min(1),
    })
    .safeParse(session.user);
  if (!parsed.success) return null;

  const tenant = c.get('tenant');
  if (parsed.data.tenantId !== tenant.slug) {
    // Los seeds guardan el ID opaco de `tenants`; usuarios provisionados antes
    // de esta corrección podían guardar el slug. Ambos identifican la misma D1,
    // pero cualquier otro valor falla cerrado.
    const [row] = await tenant.db
      .select({ id: schema.tenants.id })
      .from(schema.tenants)
      .where(eq(schema.tenants.slug, tenant.slug))
      .limit(1);
    if (!row || parsed.data.tenantId !== row.id) return null;
  }
  return parsed.data;
}

/** Exige sesión y rol mínimo. readonly=GETs; el nivel de escritura lo fija cada ruta. */
export function requireRole(min: Role): MiddlewareHandler<AuthEnv> {
  return async (c, next) => {
    const user = await resolverUsuario(c);
    if (!user) return c.json({ error: 'unauthorized' }, 401);
    if (!alcanza(user.role, min)) return negar(c, user, min);
    c.set('user', user);
    await next();
  };
}

/**
 * El "no", con motivo. A un rol normal se le dice qué nivel hacía falta; al
 * visitante de la demo se le dice que ESTO es la demo (ADR 0029 §5) — porque
 * si no, el dashboard le enseñaría el error genérico de la pantalla ("no se ha
 * podido aplicar, recarga la ficha"), que además de feo sería mentira.
 *
 * Es el servidor quien lo decide, no el cliente: una sola verdad.
 */
function negar(c: Context<AuthEnv>, user: AuthUser, min: Role) {
  if (user.role === 'demo') return c.json({ error: 'demo_readonly' }, 403);
  return c.json({ error: 'forbidden', required: min }, 403);
}

/**
 * `requireRole('reception')` con UNA excepción declarada: el rol `demo` pasa si
 * —y solo si— la acción que trae el cuerpo está en `DEMO_ACTIONS` (ADR 0029 §2).
 *
 * Leer el cuerpo aquí no cuesta un segundo parseo: Hono cachea `c.req.json()`,
 * de modo que el handler recibe el mismo objeto ya leído.
 */
export function requireReceptionOrDemoAction(): MiddlewareHandler<AuthEnv> {
  return async (c, next) => {
    const user = await resolverUsuario(c);
    if (!user) return c.json({ error: 'unauthorized' }, 401);
    if (user.role === 'demo') {
      const body: unknown = await c.req.json().catch(() => null);
      const action =
        typeof body === 'object' && body !== null && 'action' in body
          ? (body as { action: unknown }).action
          : null;
      if (typeof action !== 'string' || !DEMO_ACTIONS.includes(action as never)) {
        return c.json({ error: 'demo_readonly' }, 403);
      }
    } else if (!alcanza(user.role, 'reception')) {
      return negar(c, user, 'reception');
    }
    c.set('user', user);
    await next();
  };
}

/**
 * `requireRole('reception')` con la misma excepción, pero SIN mirar el cuerpo:
 * para rutas que no escriben nada. Hoy solo `POST /bookings/:id/requote`, que
 * es el dry-run del gesto del planning (ADR 0023) — cotiza y no guarda.
 */
export function requireReceptionOrDemo(): MiddlewareHandler<AuthEnv> {
  return async (c, next) => {
    const user = await resolverUsuario(c);
    if (!user) return c.json({ error: 'unauthorized' }, 401);
    if (user.role !== 'demo' && !alcanza(user.role, 'reception')) {
      return negar(c, user, 'reception');
    }
    c.set('user', user);
    await next();
  };
}
