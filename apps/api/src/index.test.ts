import { describe, expect, it } from 'vitest';
import app from './index';

const env = { TENANT_SLUG: 'test', DB: {} as D1Database };

describe('GET /health', () => {
  it('responds 200 with ok payload', async () => {
    const res = await app.request('/health', {}, env);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; tenant: string };
    expect(body.ok).toBe(true);
    expect(body.tenant).toBe('test');
  });

  it('404s on unknown routes', async () => {
    const res = await app.request('/nope', {}, env);
    expect(res.status).toBe(404);
  });
});
