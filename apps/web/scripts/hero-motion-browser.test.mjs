import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, statSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { chromium } from '@playwright/test';

const run = promisify(execFile);
const scriptsDir = dirname(fileURLToPath(import.meta.url));
const webDir = resolve(scriptsDir, '..');
const astroBin = join(webDir, 'node_modules/.bin/astro');
const fixtureRoot = join(webDir, 'test-fixtures/hero-motion');

// Dos colores planos generados localmente con FFmpeg: H.264 32x18 y VP9 18x32,
// un segundo, dos fotogramas, sin audio ni procedencia externa.
const DESKTOP_MP4 = Buffer.from(
  'AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAMsbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAAA+gAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAld0cmFrAAAAXHRraGQAAAADAAAAAAAAAAAAAAABAAAAAAAAA+gAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAACAAAAASAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAAPoAAAAAAABAAAAAAHPbWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAABAAAAAQABVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAABem1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAATpzdGJsAAAAunN0c2QAAAAAAAAAAQAAAKphdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAACAAEgBIAAAASAAAAAAAAAABFUxhdmM2Mi4xMS4xMDAgbGlieDI2NAAAAAAAAAAAAAAAGP//AAAAMGF2Y0MBQsAe/+EAGGdCwB7ZCX4jARAAAAMAEAAAAwBA8WLkgAEABWjLg8sgAAAAEHBhc3AAAAABAAAAAQAAABRidHJ0AAAAAAAAFMAAAAAAAAAAGHN0dHMAAAAAAAAAAQAAAAIAACAAAAAAFHN0c3MAAAAAAAAAAQAAAAEAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAIAAAABAAAAHHN0c3oAAAAAAAAAAAAAAAIAAAKOAAAACgAAABRzdGNvAAAAAAAAAAEAAANcAAAAYXVkdGEAAABZbWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAbWRpcmFwcGwAAAAAAAAAAAAAAAAsaWxzdAAAACSpdG9vAAAAHGRhdGEAAAABAAAAAExhdmY2Mi4zLjEwMAAAAAhmcmVlAAACoG1kYXQAAAJwBgX//2zcRem95tlIt5Ys2CDZI+7veDI2NCAtIGNvcmUgMTY1IHIzMjIyIGIzNTYwNWEgLSBILjI2NC9NUEVHLTQgQVZDIGNvZGVjIC0gQ29weWxlZnQgMjAwMy0yMDI1IC0gaHR0cDovL3d3dy52aWRlb2xhbi5vcmcveDI2NC5odG1sIC0gb3B0aW9uczogY2FiYWM9MCByZWY9MyBkZWJsb2NrPTE6MDowIGFuYWx5c2U9MHgxOjB4MTExIG1lPWhleCBzdWJtZT03IHBzeT0xIHBzeV9yZD0xLjAwOjAuMDAgbWl4ZWRfcmVmPTEgbWVfcmFuZ2U9MTYgY2hyb21hX21lPTEgdHJlbGxpcz0xIDh4OGRjdD0wIGNxbT0wIGRlYWR6b25lPTIxLDExIGZhc3RfcHNraXA9MSBjaHJvbWFfcXBfb2Zmc2V0PS0yIHRocmVhZHM9MSBsb29rYWhlYWRfdGhyZWFkcz0xIHNsaWNlZF90aHJlYWRzPTAgbnI9MCBkZWNpbWF0ZT0xIGludGVybGFjZWQ9MCBibHVyYXlfY29tcGF0PTAgY29uc3RyYWluZWRfaW50cmE9MCBiZnJhbWVzPTAgd2VpZ2h0cD0wIGtleWludD0yNTAga2V5aW50X21pbj0yIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAAFmWIhAU8RigAChTHAAEAOOAAIjcnXXgAAAAGQZo4CXlg',
  'base64',
);
const MOBILE_WEBM = Buffer.from(
  'GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChYECGFOAZwEAAAAAAAIKEU2bdLpNu4tTq4QVSalmU6yBoU27i1OrhBZUrmtTrIHWTbuMU6uEElTDZ1OsggEjTbuMU6uEHFO7a1OsggH07AEAAAAAAABZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVSalmsCrXsYMPQkBNgIxMYXZmNjIuMy4xMDBXQYxMYXZmNjIuMy4xMDBEiYhAj0AAAAAAABZUrmvIrgEAAAAAAAA/14EBc8WI++WVk0v2oCicgQAitZyDdW5kiIEAhoVWX1ZQOYOBASPjg4QdzWUA4JCwgRK6gSCagQJVsIRVuYEBElTDZ0B/c3OfY8CAZ8iZRaOHRU5DT0RFUkSHjExhdmY2Mi4zLjEwMHNz2mPAi2PFiPvllZNL9qAoZ8ilRaOHRU5DT0RFUkSHmExhdmM2Mi4xMS4xMDAgbGlidnB4LXZwOWfIoUWjiERVUkFUSU9ORIeTMDA6MDA6MDEuMDAwMDAwMDAwAB9DtnXH54EAo6uBAACAgkmDQgABEAH2ADgkHBhKAAAwYAAAXz//EU////pwP///4EEtrpoAo5WBAfQAhgBAkpwAUAAAA2AAAHV7mQAcU7trkbuPs4EAt4r3gQHxggGo8IED',
  'base64',
);
const POSTER_SVG = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="18"><rect width="32" height="18" fill="#ece5d5"/></svg>',
);

const media = new Map([
  ['/fixture/desktop.mp4', ['video/mp4', DESKTOP_MP4]],
  ['/fixture/mobile.webm', ['video/webm', MOBILE_WEBM]],
  ['/fixture/poster.svg', ['image/svg+xml', POSTER_SVG]],
]);
const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
};

let temporaryRoot;
let outputDir;
let server;
let browser;
let origin;

function executablePath() {
  return [
    process.env.CHROMIUM_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/opt/pw-browsers/chromium',
  ].find((candidate) => candidate && existsSync(candidate));
}

function staticFile(pathname) {
  const candidate = normalize(join(outputDir, pathname));
  if (!candidate.startsWith(outputDir)) return null;
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  const index = join(candidate, 'index.html');
  return existsSync(index) ? index : null;
}

async function newPage({ width, reducedMotion = 'no-preference', saveData = false } = {}) {
  const context = await browser.newContext({
    viewport: { width: width ?? 1024, height: 720 },
    reducedMotion,
  });
  if (saveData) {
    await context.addInitScript(() => {
      const connection = new EventTarget();
      Object.defineProperty(connection, 'saveData', { value: true });
      Object.defineProperty(navigator, 'connection', { configurable: true, value: connection });
    });
  }
  const page = await context.newPage();
  const requests = [];
  page.on('request', (request) => {
    const pathname = new URL(request.url()).pathname;
    if (pathname.endsWith('.mp4') || pathname.endsWith('.webm')) requests.push(pathname);
  });
  return { context, page, requests };
}

async function posterState(page) {
  return page.locator('[data-hero-media] img').evaluate((image) => ({
    complete: image.complete,
    currentPath: new URL(image.currentSrc).pathname,
    hasPixels: image.naturalWidth > 0 && image.naturalHeight > 0,
    visible: image.getBoundingClientRect().width > 0 && image.getBoundingClientRect().height > 0,
  }));
}

const expectedPoster = {
  complete: true,
  currentPath: '/fixture/poster.svg',
  hasPixels: true,
  visible: true,
};

before(async () => {
  temporaryRoot = await mkdtemp(join(tmpdir(), 'logic-camp-hero-browser-'));
  outputDir = join(temporaryRoot, 'dist');
  await run(astroBin, ['build', '--outDir', outputDir], {
    cwd: fixtureRoot,
    env: { ...process.env, HERO_MOTION_FIXTURE_CACHE: join(temporaryRoot, 'cache') },
    timeout: 30_000,
  });

  server = createServer(async (request, response) => {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    const fixture = media.get(pathname);
    if (fixture) {
      const [contentType, body] = fixture;
      response.writeHead(200, { 'content-length': body.length, 'content-type': contentType });
      response.end(body);
      return;
    }
    const file = staticFile(pathname);
    if (!file) {
      response.writeHead(404).end('not found');
      return;
    }
    const body = await readFile(file);
    response.writeHead(200, {
      'content-length': body.length,
      'content-type': mime[extname(file)] ?? 'application/octet-stream',
    });
    response.end(body);
  });
  await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  origin = `http://127.0.0.1:${address.port}`;
  const path = executablePath();
  browser = await chromium.launch(path ? { executablePath: path } : undefined);
});

after(async () => {
  await browser?.close();
  if (server) await new Promise((resolveClose) => server.close(resolveClose));
  if (temporaryRoot) await rm(temporaryRoot, { force: true, recursive: true });
  await Promise.all(
    ['.astro', '.vite', 'node_modules'].map((entry) =>
      rm(join(fixtureRoot, entry), { force: true, recursive: true }),
    ),
  );
});

describe('HeroMedia activo en navegador', { concurrency: 1 }, () => {
  it('no solicita vídeo con prefers-reduced-motion y conserva el póster', async () => {
    const { context, page, requests } = await newPage({ reducedMotion: 'reduce' });
    try {
      await page.goto(origin, { waitUntil: 'networkidle' });
      assert.deepEqual(requests, []);
      assert.equal(await page.locator('video').getAttribute('data-ready'), null);
      assert.equal(await page.locator('video').getAttribute('data-initialized'), null);
      assert.deepEqual(await posterState(page), expectedPoster);
    } finally {
      await context.close();
    }
  });

  it('no solicita vídeo con saveData y conserva el póster', async () => {
    const { context, page, requests } = await newPage({ saveData: true });
    try {
      await page.goto(origin, { waitUntil: 'networkidle' });
      assert.equal(await page.evaluate(() => navigator.connection?.saveData), true);
      assert.deepEqual(requests, []);
      assert.equal(await page.locator('video').getAttribute('data-ready'), null);
      assert.deepEqual(await posterState(page), expectedPoster);
    } finally {
      await context.close();
    }
  });

  for (const variant of [
    { name: 'escritorio', width: 1024, path: '/fixture/desktop.mp4', dimensions: [32, 18] },
    { name: 'móvil', width: 375, path: '/fixture/mobile.webm', dimensions: [18, 32] },
  ]) {
    it(`selecciona la fuente de ${variant.name}, reproduce y marca ready`, async () => {
      const { context, page, requests } = await newPage({ width: variant.width });
      try {
        await page.goto(origin, { waitUntil: 'networkidle' });
        await page.waitForFunction(() =>
          document.querySelector('video')?.hasAttribute('data-ready'),
        );
        const state = await page.locator('video').evaluate((video) => ({
          currentPath: new URL(video.currentSrc).pathname,
          dimensions: [video.videoWidth, video.videoHeight],
          paused: video.paused,
          ready: video.hasAttribute('data-ready'),
        }));
        assert.equal(state.currentPath, variant.path);
        assert.deepEqual(state.dimensions, variant.dimensions);
        assert.equal(state.paused, false);
        assert.equal(state.ready, true);
        assert.deepEqual([...new Set(requests)], [variant.path]);
      } finally {
        await context.close();
      }
    });
  }

  it('mantiene el póster si autoplay rechaza la reproducción', async () => {
    const { context, page } = await newPage();
    try {
      await context.addInitScript(() => {
        Object.defineProperty(HTMLMediaElement.prototype, 'play', {
          configurable: true,
          value: () => Promise.reject(new DOMException('autoplay blocked', 'NotAllowedError')),
        });
      });
      await page.goto(origin, { waitUntil: 'networkidle' });
      await page.waitForFunction(
        () => document.querySelector('video')?.dataset.initialized === 'true',
      );
      assert.equal(await page.locator('video').getAttribute('data-ready'), null);
      assert.deepEqual(await posterState(page), expectedPoster);
    } finally {
      await context.close();
    }
  });

  it('retira ready y mantiene el póster si el medio falla', async () => {
    const { context, page } = await newPage();
    try {
      await page.route('**/fixture/desktop.mp4', (route) =>
        route.fulfill({ body: 'not found', contentType: 'text/plain', status: 404 }),
      );
      const failedMedia = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname === '/fixture/desktop.mp4' && response.status() === 404,
      );
      await page.goto(origin, { waitUntil: 'networkidle' });
      await failedMedia;
      await page.waitForFunction(
        () => document.querySelector('video')?.dataset.initialized === 'true',
      );
      await page.waitForTimeout(200);
      assert.equal(await page.locator('video').getAttribute('data-ready'), null);
      assert.deepEqual(await posterState(page), expectedPoster);
    } finally {
      await context.close();
    }
  });
});
