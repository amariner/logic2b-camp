import { Hono } from 'hono';
import { createAuth } from './auth';
import { adminRoutes } from './routes/admin';
import { publicRoutes } from './routes/public';
import { createRateLimiter, tenantMiddleware, type Env } from './tenant';

export function createApp() {
  return new Hono<Env>()
    .use('*', tenantMiddleware)
    .use('/api/*', createRateLimiter(60, 60_000))
    // la ruta de producción solo expone /api/*; /health se mantiene para dev
    .on('GET', ['/health', '/api/health'], (c) =>
      c.json({
        ok: true,
        tenant: c.get('tenant').slug,
        version: '0.0.1',
        time: new Date().toISOString(),
      }),
    )
    // Better Auth gestiona sus propias rutas (sign-in, sign-out, session…) — ADR 0005
    .on(['GET', 'POST'], '/api/auth/*', (c) => createAuth(c.env).handler(c.req.raw))
    .route('/api/admin', adminRoutes)
    .route('/api', publicRoutes);
}

export const app = createApp();
export type AppType = ReturnType<typeof createApp>;
