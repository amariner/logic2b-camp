import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app';

const envA = { DB: env.DB, TENANT_SLUG: 'alfa', LOGIC_CAMP_DEV_AUTH: '1' };

const EXPECTED_HEADERS = {
  'content-security-policy': "base-uri 'self'; frame-ancestors 'none'; object-src 'none'",
  'permissions-policy': 'camera=(), geolocation=(), microphone=()',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'strict-transport-security': 'max-age=31536000',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
} as const;

function expectSecurityHeaders(response: Response) {
  for (const [name, value] of Object.entries(EXPECTED_HEADERS)) {
    expect(response.headers.get(name), name).toBe(value);
  }
}

describe('frontera HTTP defensiva', () => {
  it.each([
    ['200', '/api/health', 200],
    ['401', '/api/admin/planning?from=2026-08-10&to=2026-08-11', 401],
    ['404', '/api/no-existe', 404],
  ])('aplica las cabeceras también a una respuesta %s', async (_label, path, status) => {
    const response = await app.request(path, {}, envA);
    expect(response.status).toBe(status);
    expectSecurityHeaders(response);
  });

  it('no abre CORS a un origen arbitrario', async () => {
    const response = await app.request(
      '/api/health',
      { headers: { origin: 'https://atacante.example' } },
      envA,
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('access-control-allow-origin')).toBeNull();
  });
});
