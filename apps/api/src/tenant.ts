import { createDb, type Db } from '@logic-camp/db';
import type { MiddlewareHandler } from 'hono';

/**
 * Bindings del Worker de UN tenant. El aislamiento es por diseño (ADR 0004):
 * el host enruta al Worker del tenant y este solo puede ver su propio binding DB.
 */
export type Bindings = {
  DB: D1Database;
  TENANT_SLUG?: string;
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
    const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? 'local';
    const now = Date.now();
    const entry = hits.get(ip);
    if (!entry || entry.resetAt <= now) {
      hits.set(ip, { count: 1, resetAt: now + windowMs });
    } else if (++entry.count > limit) {
      return c.json({ error: 'rate_limited' }, 429);
    }
    if (hits.size > 10_000) {
      for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
    }
    await next();
  };
}
