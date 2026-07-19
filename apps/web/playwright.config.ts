import { defineConfig } from '@playwright/test';

/**
 * E2E del funnel (ADR 0007) contra el Worker real con la web construida.
 * Preparación: `pnpm db:reset && pnpm db:seed && pnpm --filter @logic-camp/web build`
 * y el Worker levantado (o se levanta solo con webServer). Ejecutar: `pnpm e2e`.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  retries: 0,
  workers: 1, // el estado de la D1 local es compartido: secuencial a propósito
  use: {
    baseURL: 'http://localhost:8787',
    launchOptions: { executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium' },
  },
  webServer: {
    command:
      'pnpm exec wrangler dev --config ../../tenants/demo/wrangler.jsonc --persist-to ../../.wrangler-demo --port 8787',
    url: 'http://localhost:8787/api/health',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
