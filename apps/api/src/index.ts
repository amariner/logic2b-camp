import { Hono } from 'hono';

export type Env = {
  Bindings: {
    DB: D1Database;
    TENANT_SLUG?: string;
  };
};

const app = new Hono<Env>();

app.get('/health', (c) =>
  c.json({
    ok: true,
    tenant: c.env.TENANT_SLUG ?? 'unknown',
    version: '0.0.1',
    time: new Date().toISOString(),
  }),
);

export default app;
