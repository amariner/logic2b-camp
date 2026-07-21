import { Hono } from 'hono';
import { createAuth } from './auth';
import { createOnError, normalizeThrown, notFoundHandler } from './errors';
import { notifySystemError } from './notify';
import { adminRoutes } from './routes/admin';
import { leadsRoutes } from './routes/leads';
import { publicRoutes } from './routes/public';
import { createRateLimiter, tenantMiddleware, type Env } from './tenant';

export function createApp() {
  return (
    new Hono<Env>()
      // el primero de todos: nada de lo que se lance puede saltarse el onError
      .use('*', normalizeThrown)
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
      .route('/api', leadsRoutes)
      .route('/api', publicRoutes)
      // Observabilidad mínima (ADR 0026 §3): sin esto, una excepción no
      // capturada salía como 500 con el stack en el cuerpo de la respuesta.
      .onError(createOnError(notifySystemError))
      .notFound(notFoundHandler)
  );
}

export const app = createApp();
export type AppType = ReturnType<typeof createApp>;
