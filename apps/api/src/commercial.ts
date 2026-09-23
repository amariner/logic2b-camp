/** Worker comercial de demo: ningún import de DB/auth ni API de reservas. */
import { Hono } from 'hono';
import { leadsRoutes, type LeadsEnv } from './routes/leads';
import { securityHeaders } from './security';

const hits = new Map<string, { count: number; until: number }>();
export const commercialApp = new Hono<LeadsEnv>()
  .use('*', securityHeaders)
  .use('/api/leads', async (c, next) => {
    const now = Date.now();
    const ip = c.req.header('cf-connecting-ip') ?? 'local';
    const entry = hits.get(ip);
    if (entry && entry.until > now) {
      if (++entry.count > 5) return c.json({ error: 'rate_limited' }, 429);
    } else hits.set(ip, { count: 1, until: now + 60_000 });
    if (hits.size > 10_000)
      for (const [key, value] of hits) if (value.until <= now) hits.delete(key);
    await next();
  })
  .get('/api/health', (c) =>
    c.json({ ok: true, mode: 'static-demo', database: false, date: '2026-08-07' }),
  )
  .get('/api/demo', (c) => c.json({ enabled: true, mode: 'local-fixtures' }))
  .route('/api', leadsRoutes)
  .all('/api/*', (c) =>
    c.json(
      {
        error: 'static_demo_only',
        message: 'Esta demo funciona con datos locales. Abre uno de los gestores del catálogo.',
      },
      410,
    ),
  )
  .onError((_, c) => c.json({ error: 'commercial_request_failed' }, 500));

export default {
  fetch: commercialApp.fetch,
  // También neutraliza disparos antiguos mientras Cloudflare propaga crons: [].
  async scheduled(): Promise<void> {},
};
