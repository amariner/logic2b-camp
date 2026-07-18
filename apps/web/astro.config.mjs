import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

// El tenant se resuelve en BUILD (un build por instancia — mismo aislamiento
// que la API: el entorno decide, no el código). TENANT=slug pnpm build.
const tenant = process.env.TENANT ?? 'demo';
const tenantDir = fileURLToPath(new URL(`../../tenants/${tenant}`, import.meta.url));

export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: { '@tenant': tenantDir },
    },
    define: {
      // TIER=1 pnpm dev → previsualizar la demo degradada a nivel 1 (Fase 10 lo hará en runtime)
      'import.meta.env.TIER_OVERRIDE': JSON.stringify(process.env.TIER ?? ''),
    },
    server: {
      // dev: el API corre en wrangler dev (8787); misma-origen en producción
      proxy: { '/api': 'http://localhost:8787' },
    },
  },
});
