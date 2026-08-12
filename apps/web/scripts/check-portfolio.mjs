#!/usr/bin/env node
/**
 * Guardia del escaparate: **cada camping de `tenants/` construye**.
 *
 * Por qué existe. `pnpm check` construía `apps/web` UNA vez, con el tenant por
 * defecto (`demo`), que tiene fotos, motor y todas las claves. Los campings del
 * portfolio (L'Olivar, Pinada del Mar…) solo se construyen dentro de
 * `bundle:demo`, que nadie corre al cerrar sesión — así que la sesión 83 pudo
 * cerrar con `pnpm check` 50/50 y el bundle compuesto **roto**: Pinada del Mar
 * no construía por dos aserciones del core sobre claves que su camping no tiene
 * (`images['hero-anochecer']!` y `plan('ut_std', …)!`).
 *
 * Con el portfolio yendo a 3 → 6 → 12 demos, "lo verá la próxima sesión" deja
 * de ser una estrategia. Esto lo ve `pnpm check`.
 *
 * Construye a un directorio propio por tenant para no pisar el `dist/` que
 * turbo cachea como salida de `build`. El tier NO se pasa: `astro.config.mjs`
 * ya lo lee del `config.ts` de cada camping.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = dirname(fileURLToPath(new URL('.', import.meta.url)));
const tenantsDir = join(web, '..', '..', 'tenants');
const outRoot = join(web, 'dist-portfolio');

// `_template` no es un camping; `demo` ya lo construye la tarea `build`.
const EXCLUIDOS = new Set(['_template', 'demo']);

function filesUnder(root, prefix = '') {
  return readdirSync(join(root, prefix)).flatMap((name) => {
    const relative = join(prefix, name);
    return statSync(join(root, relative)).isDirectory()
      ? filesUnder(root, relative)
      : [relative.replaceAll('\\', '/')];
  });
}

function configuredTier(slug) {
  const source = readFileSync(join(tenantsDir, slug, 'config.ts'), 'utf8');
  const matches = [...source.matchAll(/^\s*tier\s*:\s*([1-4])\s*,/gim)];
  if (matches.length !== 1) throw new Error(`${slug}: config.ts no declara un único tier 1–4`);
  return Number(matches[0][1]);
}

function checkTierBoundary(slug, outDir) {
  const tier = configuredTier(slug);
  const files = filesUnder(outDir);
  const html = files.filter((file) => file.endsWith('.html'));
  const js = files.filter((file) => file.endsWith('.js'));
  const bookingRoutes = html.filter(
    (file) => file === 'reserva/index.html' || file.startsWith('reservar/'),
  );
  const bookingChunks = js.filter((file) =>
    /(?:Mostrador|FunnelDetalle|FunnelTitular|ReservaGestion)\.[^.]+\.js$/.test(file),
  );

  if (tier < 3 && (bookingRoutes.length > 0 || bookingChunks.length > 0)) {
    throw new Error(
      `${slug}: tier ${tier} arrastra motor (${[...bookingRoutes, ...bookingChunks].join(', ')})`,
    );
  }
  if (tier <= 2) {
    const accommodationPages = html.filter((file) =>
      /^alojamientos\/[^/]+\/index\.html$/.test(file),
    );
    const pagesWithSpecificEnquiry = accommodationPages.filter((file) => {
      const unitTypeId = file.split('/')[1];
      const source = readFileSync(join(outDir, file), 'utf8');
      return (
        source.includes('href="#consulta"') &&
        source.includes('id="consulta"') &&
        source.includes(`data-enquiry-unit-type="${unitTypeId}"`) &&
        source.includes(`name="stay" value="${unitTypeId}"`)
      );
    });
    const invalidPages = tier === 2
      ? accommodationPages.filter((file) => !pagesWithSpecificEnquiry.includes(file))
      : pagesWithSpecificEnquiry;
    if (accommodationPages.length === 0 || invalidPages.length > 0) {
      throw new Error(
        `${slug}: tier ${tier} rompe la frontera de solicitud contextual (${[
          ...(accommodationPages.length === 0 ? ['sin fichas de alojamiento'] : []),
          ...invalidPages,
        ].join(', ')})`,
      );
    }
  }
  if (tier >= 3) {
    const requiredRoutes = ['reserva/index.html', 'reservar/index.html'];
    const missingRoutes = requiredRoutes.filter((file) => !html.includes(file));
    const requiredChunks = ['Mostrador', 'FunnelDetalle', 'FunnelTitular', 'ReservaGestion'];
    const missingChunks = requiredChunks.filter(
      (name) => !bookingChunks.some((file) => file.includes(`${name}.`)),
    );
    if (missingRoutes.length > 0 || missingChunks.length > 0) {
      throw new Error(
        `${slug}: tier ${tier} ha perdido motor (${[
          ...missingRoutes,
          ...missingChunks.map((name) => `${name}.*.js`),
        ].join(', ')})`,
      );
    }
  }

  return { tier, pages: html.length, js: js.length };
}

const tenants = readdirSync(tenantsDir)
  .filter((slug) => !EXCLUIDOS.has(slug) && statSync(join(tenantsDir, slug)).isDirectory())
  .sort();

if (tenants.length === 0) {
  console.log('[portfolio] no hay campings además de la demo: nada que comprobar');
  process.exit(0);
}

rmSync(outRoot, { recursive: true, force: true });

const fallos = [];
for (const slug of tenants) {
  const t0 = Date.now();
  try {
    execFileSync('npx', ['astro', 'build', '--outDir', join(outRoot, slug)], {
      cwd: web,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, TENANT: slug, BASE_PATH: `/demos/${slug}`, TIER: '' },
    });
    const boundary = checkTierBoundary(slug, join(outRoot, slug));
    console.log(
      `[portfolio] ✓ ${slug} · tier ${boundary.tier} · ${boundary.pages} HTML / ${boundary.js} JS ` +
        `(${((Date.now() - t0) / 1000).toFixed(1)}s)`,
    );
  } catch (err) {
    const salida = `${err.stdout ?? ''}${err.stderr ?? ''}`.trim();
    fallos.push(slug);
    console.error(
      `[portfolio] ✗ ${slug} NO construye\n${salida.split('\n').slice(-25).join('\n')}`,
    );
  }
}

rmSync(outRoot, { recursive: true, force: true });

if (fallos.length > 0) {
  console.error(`\n[portfolio] ${fallos.length} camping(s) rotos: ${fallos.join(', ')}`);
  process.exit(1);
}
console.log(`[portfolio] ${tenants.length} camping(s) construyen: ${tenants.join(', ')}`);
