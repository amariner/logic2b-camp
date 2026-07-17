import { Hono } from 'hono';
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
    .route('/api', publicRoutes);
}

export const app = createApp();
export type AppType = ReturnType<typeof createApp>;
