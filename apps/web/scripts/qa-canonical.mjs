#!/usr/bin/env node
/** QA navegable de las superficies canónicas contra el bundle compuesto. */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { existsSync, statSync } from 'node:fs';
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const web = dirname(fileURLToPath(new URL('.', import.meta.url)));
const repo = resolve(web, '../..');
const dist = join(repo, 'apps/site/dist');
const captures = join(repo, 'test-results/canonical-r10');

if (!existsSync(join(dist, 'index.html')) || !existsSync(join(dist, 'demo/index.html'))) {
  throw new Error('bundle_missing: ejecuta pnpm --filter @logic-camp/api bundle:demo');
}

const mime = {
  '.avif': 'image/avif',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.vtt': 'text/vtt; charset=utf-8',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  const candidate = normalize(join(dist, pathname));
  if (!candidate.startsWith(dist)) {
    response.writeHead(400).end();
    return;
  }
  const file =
    existsSync(candidate) && statSync(candidate).isFile()
      ? candidate
      : join(candidate, 'index.html');
  if (!existsSync(file)) {
    response.writeHead(404, { 'content-type': 'text/plain' }).end('not found');
    return;
  }
  response.writeHead(200, { 'content-type': mime[extname(file)] ?? 'application/octet-stream' });
  response.end(await readFile(file));
});

await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
const address = server.address();
if (!address || typeof address === 'string') throw new Error('server_address_missing');
const origin = `http://127.0.0.1:${address.port}`;
await mkdir(captures, { recursive: true });

const routes = [
  { id: 'landing-es', path: '/', noindex: false, texts: ['Logic2B', 'camping'] },
  { id: 'landing-en', path: '/en/', noindex: false, texts: ['Logic2B', 'campsite'] },
  {
    id: 'themes-es',
    path: '/temas/',
    noindex: false,
    texts: ["Sol d'Hivern", 'Doce campings ficticios'],
    absentTexts: ['Concepto visual'],
  },
  {
    id: 'docs',
    path: '/docs/recepcion/check-in/',
    noindex: false,
    texts: ['check-in', 'familia ya está dentro'],
  },
  { id: 'cala-home', path: '/demo/', noindex: true, texts: ['Cala Sereno'] },
  {
    id: 'cala-detail',
    path: '/demo/alojamientos/ut_glamp/',
    noindex: true,
    texts: ['Cala Sereno', 'Glamping'],
  },
  {
    id: 'olivar-home',
    path: '/demos/olivar/',
    noindex: true,
    texts: ['Sombra de olivo', 'Veintidós maneras'],
  },
  {
    id: 'riuclar-home',
    path: '/demos/riuclar/',
    noindex: true,
    texts: ['Boira al riu', 'Vint-i-quatre llocs'],
  },
  {
    id: 'duna-home',
    path: '/demos/duna/',
    noindex: true,
    texts: ['Sal en el aire', 'Veinte plazas'],
  },
  {
    id: 'delta-home',
    path: '/demos/delta/',
    noindex: true,
    texts: ['Dieciséis parcelas', 'Dos parcelas'],
  },
  {
    id: 'pinada-home',
    path: '/demos/pinadamar/',
    noindex: true,
    texts: ['Pinos altos', 'Todo listo para llegar'],
  },
  {
    id: 'pinada-planning',
    path: '/demos/pinadamar/gestion/#/planning',
    noindex: true,
    texts: ['PM-26-'],
    visibleSelector:
      '[role="region"][aria-label="Agenda del planning"], [role="region"][aria-label="Calendario completo del planning"]',
  },
  {
    id: 'serralta-home',
    path: '/demos/serralta/',
    noindex: true,
    texts: ['Bosque húmedo', '80 unidades'],
  },
  {
    id: 'serralta-planning',
    path: '/demos/serralta/gestion/#/planning',
    noindex: true,
    texts: ['SR-26-'],
    visibleSelector:
      '[role="region"][aria-label="Agenda del planning"], [role="region"][aria-label="Calendario completo del planning"]',
  },
  {
    id: 'vinyes-home',
    path: '/demos/vinyes/',
    noindex: true,
    texts: ['Cepa vieja', 'VENDIMIA POR ENCIMA DEL VERANO'],
  },
  {
    id: 'vinyes-planning',
    path: '/demos/vinyes/gestion/#/planning',
    noindex: true,
    texts: ['VY-26-', 'Caseta de Viña'],
    visibleSelector:
      '[role="region"][aria-label="Agenda del planning"], [role="region"][aria-label="Calendario completo del planning"]',
  },
  {
    id: 'tarongers-home',
    path: '/demos/tarongers/',
    noindex: true,
    texts: ['Azahar por la mañana', '80 PARCELAS ENTRE NARANJOS'],
  },
  {
    id: 'tarongers-planning',
    path: '/demos/tarongers/gestion/#/planning',
    noindex: true,
    texts: ['TG-26-', 'Casa Naranjal'],
    visibleSelector:
      '[role="region"][aria-label="Agenda del planning"], [role="region"][aria-label="Calendario completo del planning"]',
  },
  {
    id: 'carrasca-home',
    path: '/demos/carrasca/',
    noindex: true,
    texts: ['Ciento cincuenta unidades', 'Cuatro formas de quedarse en el carrascal'],
  },
  {
    id: 'carrasca-planning',
    path: '/demos/carrasca/gestion/#/planning',
    noindex: true,
    texts: ['CR-26-', 'Casa Umbría'],
    visibleSelector:
      '[role="region"][aria-label="Agenda del planning"], [role="region"][aria-label="Calendario completo del planning"]',
  },
  {
    id: 'ballena-home',
    path: '/demos/ballena/',
    noindex: true,
    texts: ['Doscientas cincuenta unidades', 'Cuatro formas de vivir la semana'],
  },
  {
    id: 'ballena-planning',
    path: '/demos/ballena/gestion/#/planning',
    noindex: true,
    texts: ['BL-26-', 'Mobil-home Marea'],
    visibleSelector:
      '[role="region"][aria-label="Agenda del planning"], [role="region"][aria-label="Calendario completo del planning"]',
  },
  {
    id: 'soldhivern-home',
    path: '/demos/soldhivern/',
    noindex: true,
    texts: ['Doscientas unidades', 'Cuatro formas de quedarse más tiempo'],
  },
  {
    id: 'soldhivern-planning',
    path: '/demos/soldhivern/gestion/#/planning',
    noindex: true,
    texts: ['SH-26-', 'Estudio Garbí'],
    visibleSelector:
      '[role="region"][aria-label="Agenda del planning"], [role="region"][aria-label="Calendario completo del planning"]',
  },
  {
    id: 'marde-home',
    path: '/demos/mardefondo/',
    noindex: true,
    texts: ['Un horizonte amplio', 'Cada detalle bajo control'],
  },
  {
    id: 'marde-automatiza',
    path: '/demos/mardefondo/gestion/#/automatiza',
    noindex: true,
    texts: ['Prototipo supervisado', 'no publica, entrega ni abre tickets'],
  },
  {
    id: 'marde-inteligente',
    path: '/demos/mardefondo/gestion/#/inteligente',
    noindex: true,
    texts: ['Prototipo · no ejecuta cambios', 'no toca precios ni reservas'],
  },
  {
    id: 'marde-control-total',
    path: '/demos/mardefondo/gestion/#/control-total/centro',
    noindex: true,
    texts: ['Visión interactiva.', 'Centro de operaciones', 'Pulso operativo'],
    visibleSelector: 'nav[aria-label="Módulos de Control total"] [aria-current="page"]',
  },
];
const routeFilter = process.env.QA_CANONICAL_ROUTE;
const selectedRoutes = routeFilter ? routes.filter((route) => route.id === routeFilter) : routes;
if (selectedRoutes.length === 0) throw new Error(`canonical_route_unknown:${routeFilter}`);

const executablePath = [
  process.env.CHROMIUM_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/opt/pw-browsers/chromium',
].find((candidate) => candidate && existsSync(candidate));
const browser = await chromium.launch(executablePath ? { executablePath } : undefined);

try {
  for (const route of selectedRoutes) {
    for (const viewport of [
      { width: 375, height: 812 },
      { width: 1366, height: 900 },
    ]) {
      const context = await browser.newContext({
        viewport,
        reducedMotion: 'reduce',
        colorScheme: 'light',
      });
      const page = await context.newPage();
      const failures = [];
      page.on('console', (message) => {
        if (message.type() === 'error') {
          const source = message.location().url;
          failures.push(`console: ${message.text()}${source ? ` (${source})` : ''}`);
        }
      });
      page.on('pageerror', (error) => failures.push(`page: ${error.message}`));
      page.on('requestfailed', (request) => {
        if (!request.failure()?.errorText.includes('ERR_ABORTED')) {
          failures.push(`request: ${request.url()} (${request.failure()?.errorText})`);
        }
      });
      page.on('response', (response) => {
        if (response.status() >= 400)
          failures.push(`response: ${response.status()} ${response.url()}`);
      });

      await page.goto(`${origin}${route.path}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(async () => {
        for (let top = 0; top < document.documentElement.scrollHeight; top += 600) {
          window.scrollTo(0, top);
          await new Promise((resolveScroll) => setTimeout(resolveScroll, 40));
        }
        window.scrollTo(0, 0);
      });
      try {
        await page.waitForFunction(() =>
          [...document.images].every((image) => image.naturalWidth > 0),
        );
      } catch (error) {
        const pendingImages = await page.evaluate(() =>
          [...document.images]
            .filter((image) => image.naturalWidth === 0)
            .map((image) => ({
              src: image.currentSrc || image.src,
              loading: image.loading,
              complete: image.complete,
              naturalWidth: image.naturalWidth,
            })),
        );
        throw new Error(
          `${route.id}/${viewport.width}: imágenes sin cargar ${JSON.stringify(pendingImages)}`,
          { cause: error },
        );
      }

      const body = await page.locator('body').innerText();
      for (const text of route.texts) {
        assert.ok(
          body.includes(text),
          `${route.id}/${viewport.width}: falta «${text}»; visible=${JSON.stringify(body.slice(0, 500))}`,
        );
      }
      for (const text of route.absentTexts ?? []) {
        assert.ok(!body.includes(text), `${route.id}/${viewport.width}: todavía aparece «${text}»`);
      }
      assert.ok(
        await page
          .locator(route.visibleSelector ?? 'h1')
          .first()
          .isVisible(),
        `${route.id}/${viewport.width}: testigo principal no visible`,
      );
      const robots = await page.evaluate(
        () => document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null,
      );
      if (route.noindex) {
        assert.match(robots ?? '', /noindex/, `${route.id}/${viewport.width}: falta noindex`);
      } else {
        assert.doesNotMatch(
          robots ?? '',
          /noindex/,
          `${route.id}/${viewport.width}: no debe ser noindex`,
        );
      }
      const geometry = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
      }));
      assert.ok(
        geometry.document <= geometry.viewport && geometry.body <= geometry.viewport,
        `${route.id}/${viewport.width}: desborde ${geometry.document}/${geometry.body} > ${geometry.viewport}`,
      );
      assert.deepEqual([...new Set(failures)], [], `${route.id}/${viewport.width}: errores`);

      const contact = page.locator('[data-logic2b-contact]');
      assert.equal(await contact.count(), 1, `${route.id}/${viewport.width}: contacto único`);
      assert.match(
        (await contact.getAttribute('href')) ?? '',
        /^https:\/\/wa\.me\/34626432316\?text=/,
        `${route.id}/${viewport.width}: destino de contacto`,
      );
      if (route.path.includes('/gestion/')) {
        assert.equal(
          await contact.getAttribute('data-contact-context'),
          'dashboard',
          `${route.id}/${viewport.width}: contexto gestor`,
        );
        if (viewport.width < 768) {
          await page.getByRole('button', { name: 'Abrir el menú' }).click();
          assert.ok(
            await contact.last().isVisible(),
            `${route.id}/${viewport.width}: contacto drawer`,
          );
          await page.keyboard.press('Escape');
        } else {
          assert.ok(await contact.isVisible(), `${route.id}/${viewport.width}: contacto sidebar`);
        }
      } else if (
        route.path === '/' ||
        route.path === '/en/' ||
        route.path === '/temas/' ||
        route.path.startsWith('/docs/')
      ) {
        assert.equal(
          await contact.getAttribute('data-contact-context'),
          route.path.startsWith('/docs/') ? 'docs' : 'commercial',
          `${route.id}/${viewport.width}: contexto comercial`,
        );
      } else {
        assert.equal(
          await contact.getAttribute('data-contact-context'),
          'tenant',
          `${route.id}/${viewport.width}: contexto tenant`,
        );
        await page.evaluate(() => window.scrollTo(0, 360));
        await page.waitForFunction(
          () =>
            document.querySelector('[data-logic2b-contact]')?.getAttribute('data-visible') ===
            'true',
        );
        assert.ok(
          await contact.isVisible(),
          `${route.id}/${viewport.width}: contacto tenant visible`,
        );
      }

      if (route.id !== 'landing-en' && route.id !== 'cala-detail') {
        await page.screenshot({
          path: join(captures, `${route.id}-${viewport.width}.png`),
          fullPage: true,
          animations: 'disabled',
        });
      }
      await context.close();
    }
    console.log(`[canonical] ✓ ${route.id} · 375/1366`);
  }

  const mediaChecks = [
    ['/logo-mark.svg', 'image/svg+xml'],
    ['/og.png', 'image/png'],
    ['/media/logic2b-primera-ola.mp4', 'video/mp4'],
    ['/media/logic2b-primera-ola.es.vtt', 'text/vtt'],
    ['/logic2b-campings-primera-ola.pdf', 'application/pdf'],
  ];
  for (const [path, expected] of mediaChecks) {
    const response = await fetch(`${origin}${path}`);
    assert.equal(response.status, 200, `${path}: ${response.status}`);
    assert.ok(
      response.headers.get('content-type')?.startsWith(expected),
      `${path}: MIME ${response.headers.get('content-type')} != ${expected}`,
    );
    assert.ok((await response.arrayBuffer()).byteLength > 0, `${path}: vacío`);
  }
  console.log(`[canonical] ✓ ${mediaChecks.length} formatos/MIME`);
} finally {
  await browser.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}

console.log(
  `[canonical] ✓ ${selectedRoutes.length} superficies · ${selectedRoutes.length * 2} vistas · ${captures}`,
);
