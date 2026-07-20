/**
 * Better Auth sobre la MISMA tabla `users` del dominio, vía adaptador Drizzle (ADR 0005).
 * Una instancia por petición con el binding del tenant: el Worker solo puede
 * autenticar contra su propia D1 — el aislamiento lo da el entorno, como siempre.
 */
import { createDb, schema } from '@logic-camp/db';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { MiddlewareHandler } from 'hono';
import type { Bindings, Env } from './tenant';

export type Role = 'owner' | 'manager' | 'reception' | 'readonly';

/** Jerarquía: cada rol incluye lo del anterior. */
const ROLE_LEVEL: Record<Role, number> = { readonly: 0, reception: 1, manager: 2, owner: 3 };

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

export function createAuth(env: Bindings, opts: { allowSignUp?: boolean } = {}) {
  return betterAuth({
    // El secret real llega por wrangler secret; el fallback es solo dev/test local.
    secret: env.AUTH_SECRET ?? 'logic-camp-dev-secret',
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
  const { eq } = await import('drizzle-orm');
  await db.update(schema.users).set({ role: input.role }).where(eq(schema.users.id, res.user.id));
  return {
    id: res.user.id,
    email: res.user.email,
    name: res.user.name,
    role: input.role,
    tenantId: env.TENANT_SLUG ?? 'unknown',
  };
}

/** Exige sesión y rol mínimo. readonly=GETs; el nivel de escritura lo fija cada ruta. */
export function requireRole(min: Role): MiddlewareHandler<AuthEnv> {
  return async (c, next) => {
    const auth = createAuth(c.env);
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json({ error: 'unauthorized' }, 401);
    const user = session.user as unknown as AuthUser;
    const role = (user.role ?? 'readonly') as Role;
    if (ROLE_LEVEL[role] === undefined || ROLE_LEVEL[role] < ROLE_LEVEL[min]) {
      return c.json({ error: 'forbidden', required: min }, 403);
    }
    c.set('user', { ...user, role });
    await next();
  };
}
