import { createDb, type Db } from '@logic-camp/db';
import type { MiddlewareHandler } from 'hono';

/**
 * Bindings del Worker de UN tenant. El aislamiento es por diseño (ADR 0004):
 * el host enruta al Worker del tenant y este solo puede ver su propio binding DB.
 */
export type Bindings = {
  DB: D1Database;
  TENANT_SLUG?: string;
  /** wrangler secret en producción; en dev/test hay fallback (ADR 0005) */
  AUTH_SECRET?: string;
  /** wrangler secret; sin él las notificaciones quedan 'disabled' (ADR 0010) */
  RESEND_API_KEY?: string;
  /** Captación Logic2B: `demo` simula de forma explícita; sin valor se usa Resend solo si hay key. */
  LEADS_TRANSPORT?: string;
  /** wrangler secrets de pago (ADR 0011). Sin ellos, un provider≠none da 500 payment_not_configured. */
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  /** clave de comercio Redsys en base64 — "su comercio, su clave, por camping" */
  REDSYS_MERCHANT_KEY?: string;
  /**
   * Credenciales del webservice de SES.Hospedajes (ADR 0028). Secrets del Worker,
   * NO en `modules` (que es JSON legible en D1). Sin las tres, el envío automático
   * no está disponible y el parte solo se descarga (modo manual).
   */
  SES_HOSPEDAJES_ENDPOINT?: string;
  SES_HOSPEDAJES_USER?: string;
  SES_HOSPEDAJES_PASSWORD?: string;
  /**
   * SOLO desarrollo local (ADR 0019). Interruptor, NUNCA un valor: habilita la
   * lista CONSTANTE `DEV_ORIGINS` de `auth.ts` para que el dev server de Vite
   * (:5173) pueda autenticar contra `wrangler dev` (:8787).
   *
   * Se pasa por `--var` en `.claude/launch.json`, jamás en `tenants/*\/wrangler.jsonc`:
   * ese fichero es el MISMO que despliega a producción.
   */
  LOGIC_CAMP_DEV_ORIGINS?: string;
  /** Interruptor local explícito para el secreto fijo de Better Auth. Nunca se despliega. */
  LOGIC_CAMP_DEV_AUTH?: string;
};

export type TenantContext = {
  slug: string;
  db: Db;
};

export type Env = {
  Bindings: Bindings;
  Variables: {
    tenant: TenantContext;
  };
};

export const tenantMiddleware: MiddlewareHandler<Env> = async (c, next) => {
  c.set('tenant', {
    slug: c.env.TENANT_SLUG ?? 'unknown',
    db: createDb(c.env.DB),
  });
  await next();
};

/** Rate limit v1: ventana fija en memoria del isolate por IP (ver ADR 0004). */
export function createRateLimiter(limit: number, windowMs: number): MiddlewareHandler<Env> {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return async (c, next) => {
    const forwarded = c.req.header('x-forwarded-for')?.split(',', 1)[0]?.trim();
    const ip = c.req.header('cf-connecting-ip') ?? forwarded ?? 'local';
    const now = Date.now();
    const entry = hits.get(ip);
    if (!entry || entry.resetAt <= now) {
      hits.set(ip, { count: 1, resetAt: now + windowMs });
    } else if (++entry.count > limit) {
      const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      c.header('Retry-After', String(retryAfter));
      return c.json({ error: 'rate_limited', retryAfter }, 429);
    }
    if (hits.size > 10_000) {
      for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
    }
    await next();
  };
}
