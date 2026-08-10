import { expect, test } from './fixtures';

const EXPECTED_HEADERS = {
  'content-security-policy': "base-uri 'self'; frame-ancestors 'none'; object-src 'none'",
  'permissions-policy': 'camera=(), geolocation=(), microphone=()',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'strict-transport-security': 'max-age=31536000',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
} as const;

for (const [surface, path] of [
  ['estático', '/'],
  ['Worker', '/api/health'],
] as const) {
  test(`cabeceras defensivas en ${surface}`, async ({ request }) => {
    const response = await request.get(path);
    expect(response.ok()).toBe(true);
    const headers = response.headers();
    for (const [name, value] of Object.entries(EXPECTED_HEADERS)) {
      expect(headers[name], name).toBe(value);
    }
  });
}
