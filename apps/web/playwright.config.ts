import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

/* En el contenedor cloud el navegador vive fuera del proyecto; en local lo
 * resuelve Playwright solo. Forzar la ruta de /opt en un Mac rompía `pnpm e2e`. */
const CHROMIUM =
  process.env.CHROMIUM_PATH ??
  (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const E2E_PORT = Number(process.env.E2E_PORT ?? 8787);
const E2E_ORIGIN = `http://127.0.0.1:${E2E_PORT}`;

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
    baseURL: E2E_ORIGIN,
    launchOptions: { executablePath: CHROMIUM },
  },
  webServer: {
    command:
      `pnpm exec wrangler dev --config ../../tenants/demo/wrangler.jsonc ` +
      `--port ${E2E_PORT} ` +
      `--var LOGIC_CAMP_DEV_AUTH:1`,
    url: `${E2E_ORIGIN}/api/health`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
