import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// El tenant se resuelve en BUILD (un build por instancia — mismo aislamiento
// que la API: el entorno decide, no el código). TENANT=slug pnpm build.
const tenant = process.env.TENANT ?? 'demo';
const tenantDir = fileURLToPath(new URL(`../../tenants/${tenant}`, import.meta.url));
// Resolverlo en build time permite que Rollup elimine por completo las rutas
// e islas del funnel cuando el camping no tiene motor.
const tenantConfigSource = readFileSync(new URL(`../../tenants/${tenant}/config.ts`, import.meta.url), 'utf8');
const configuredTier = Number(tenantConfigSource.match(/\btier\s*:\s*([1-4])/i)?.[1] ?? 3);
const buildTier = Number(process.env.TIER ?? '') || configuredTier;
const hasBookingEngine =
  buildTier >= 3 ||
  (/\bdemoTierSwitch\s*:\s*true\b/.test(tenantConfigSource) && buildTier === configuredTier);
const bookingDisabled = fileURLToPath(new URL('./src/components/BookingDisabled.astro', import.meta.url));
const bookingComponents = hasBookingEngine
  ? {
      '@booking/hero': fileURLToPath(new URL('./src/components/HeroMostrador.astro', import.meta.url)),
      '@booking/reservar': fileURLToPath(new URL('./src/components/paginas/Reservar.astro', import.meta.url)),
      '@booking/reserva': fileURLToPath(new URL('./src/components/paginas/Reserva.astro', import.meta.url)),
      '@booking/detalle': fileURLToPath(new URL('./src/components/paginas/ReservarDetalle.astro', import.meta.url)),
      '@booking/titular': fileURLToPath(new URL('./src/components/paginas/ReservarTitular.astro', import.meta.url)),
    }
  : {
      '@booking/hero': bookingDisabled,
      '@booking/reservar': bookingDisabled,
      '@booking/reserva': bookingDisabled,
      '@booking/detalle': bookingDisabled,
      '@booking/titular': bookingDisabled,
    };

// La demo se sirve bajo /demo/ (la raíz la ocupa la landing de producto, ADR 0016).
// BASE_PATH=/demo pnpm build. Por defecto raíz (un tenant real vive en su dominio, en /).
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: { '@tenant': tenantDir, ...bookingComponents },
    },
    define: {
      // TIER=1 pnpm dev → previsualizar la demo degradada a nivel 1 (Fase 10 lo hará en runtime)
      'import.meta.env.TIER_OVERRIDE': JSON.stringify(process.env.TIER ?? ''),
      'import.meta.env.BOOKING_ENGINE': JSON.stringify(hasBookingEngine ? 'instant' : 'none'),
    },
    server: {
      // dev: el API corre en wrangler dev (8787); misma-origen en producción
      proxy: { '/api': 'http://localhost:8787' },
    },
  },
});
