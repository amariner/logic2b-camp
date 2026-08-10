#!/usr/bin/env node
/** Build + capturas de una identidad, sin Worker, D1 ni infraestructura. */
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, rmSync, statSync } from 'node:fs';
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const web = dirname(fileURLToPath(new URL('.', import.meta.url)));
const repo = resolve(web, '../..');
const rawArgs = process.argv.slice(2);
if (rawArgs[0] === '--') rawArgs.shift();
const [slug, routeArg = '/', ...flags] = rawArgs;
if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error('Uso: capture-tenant.mjs <slug> [ruta] [--theme=<tema>]');
  process.exit(1);
}
const tenantDir = join(repo, 'tenants', slug);
if (!existsSync(join(tenantDir, 'config.ts'))) throw new Error(`tenant_unknown:${slug}`);
const theme = flags.find((flag) => flag.startsWith('--theme='))?.slice('--theme='.length);
if (theme && !/^[a-z0-9][a-z0-9-]*$/.test(theme)) throw new Error('theme_invalid');
const route = `/${routeArg.replace(/^\/+|\/+$/g, '')}${routeArg === '/' ? '' : '/'}`;
const base = `/__qa/${slug}`;
const outDir = join(web, 'dist-capture', slug);
const captures = join(repo, 'test-results', 'tenant-factory', slug);
const browserCandidates = [
  process.env.CHROMIUM_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/opt/pw-browsers/chromium',
].filter(Boolean);
const executablePath = browserCandidates.find((candidate) => existsSync(candidate));

rmSync(outDir, { recursive: true, force: true });
execFileSync('npx', ['astro', 'build', '--outDir', outDir], {
  cwd: web,
  stdio: 'inherit',
  env: { ...process.env, TENANT: slug, BASE_PATH: base, TIER: '' },
});
await mkdir(captures, { recursive: true });

const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
  const relative = pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname;
  const candidate = normalize(join(outDir, relative));
  if (!candidate.startsWith(outDir)) {
    response.writeHead(400).end();
    return;
  }
  const file =
    existsSync(candidate) && statSync(candidate).isFile()
      ? candidate
      : join(candidate, 'index.html');
  if (!existsSync(file)) {
    response.writeHead(404).end('not found');
    return;
  }
  response.setHeader('content-type', mime[extname(file)] ?? 'application/octet-stream');
  response.end(await readFile(file));
});
await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
const address = server.address();
if (!address || typeof address === 'string') throw new Error('server_address_missing');

const browser = await chromium.launch(executablePath ? { executablePath } : undefined);
try {
  const page = await browser.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  const query = theme ? `?tema=${theme}` : '';
  const target = `http://127.0.0.1:${address.port}${base}${route}${query}`;
  const safeRoute = route === '/' ? 'home' : route.replaceAll('/', '-').replace(/^-|-$/g, '');
  for (const viewport of [
    { width: 375, height: 812 },
    { width: 1366, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(target, { waitUntil: 'networkidle' });
    await page.screenshot({
      path: join(captures, `${safeRoute}-${viewport.width}${theme ? `-${theme}` : ''}.png`),
      fullPage: true,
    });
  }
  if (errors.length > 0) throw new Error(`capture_errors:${[...new Set(errors)].join(' | ')}`);
  console.log(`[capture] ✓ ${slug}${route} · 375/1366 · ${captures}`);
} finally {
  await browser.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}
