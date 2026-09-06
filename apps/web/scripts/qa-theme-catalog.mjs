#!/usr/bin/env node
/** Browser audit of every published theme. Run after bundle:demo. */
import { existsSync } from 'node:fs';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { chromium, webkit } from '@playwright/test';
import { themeQaServer } from './theme-qa-server.mjs';

const root = resolve(import.meta.dirname, '../../..');
const dist = join(root, 'apps/site/dist');
const engine = process.env.QA_BROWSER === 'webkit' ? 'webkit' : 'chromium';
const output = join(root, 'test-results/theme-catalog', ...(engine === 'webkit' ? ['webkit'] : []));
await mkdir(output, { recursive: true });
const server = await themeQaServer(dist);
const { origin } = server;
const executablePath =
  process.env.CHROMIUM_PATH ||
  (existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : undefined);
const browser = await (engine === 'webkit' ? webkit.launch() : chromium.launch({ executablePath }));
const report = [];
const tenants = [
  'demo',
  ...(await readdir(join(root, 'tenants')))
    .filter(
      (slug) =>
        slug !== 'demo' &&
        !slug.startsWith('_') &&
        existsSync(join(root, 'tenants', slug, 'config.ts')),
    )
    .sort(),
];
for (const tenant of tenants) {
  const home = tenant === 'demo' ? 'demo/index.html' : `demos/${tenant}/index.html`;
  if (!existsSync(join(dist, home)))
    throw new Error(`Missing built theme: ${tenant}. Run bundle:demo first.`);
}
try {
  for (const tenant of tenants.filter((t) => !process.env.QA_THEME || t === process.env.QA_THEME)) {
    const base = tenant === 'demo' ? '/demo/' : `/demos/${tenant}/`;
    const files = await readdir(join(dist, base), { recursive: true });
    const routes = files
      .filter(
        (f) =>
          f.endsWith('index.html') &&
          !/^(?:(?:ca|es|en|fr|de|nl)\/)?(?:gestion|reservar|reserva)(\/|\.)/.test(f),
      )
      .map((f) => f.replace(/index.html$/, ''))
      .sort();
    const context = await browser.newContext({ reducedMotion: 'reduce', colorScheme: 'light' });
    const page = await context.newPage();
    // Cala Sereno uses the local API; no booking requests are exercised by this static audit.
    await page.route('**/api/availability**', (route) =>
      route.fulfill({ json: { types: [], closed: false } }),
    );
    for (const route of routes) {
      const translated = /^(ca|es|en|fr|de|nl)\//.test(route);
      const widths = process.env.QA_WIDTHS
        ? process.env.QA_WIDTHS.split(',').map(Number)
        : translated
          ? [375]
          : [320, 360, 375, 390, 430, 768, 1024, 1366];
      for (const width of widths) {
        const errors = [];
        const onError = (e) => errors.push(e.message);
        page.on('pageerror', onError);
        await page.setViewportSize({ width, height: width < 768 ? 812 : 900 });
        await page.goto(origin + base + route, { waitUntil: 'load' });
        await page.evaluate(async () => {
          await document.fonts.ready;
          for (const image of document.images) image.loading = 'eager';
          await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
          await new Promise(requestAnimationFrame);
        });
        const result = await page.evaluate(() => {
          const visible = (el) =>
            !!(el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
          const width = document.documentElement.clientWidth;
          const h1 = [...document.querySelectorAll('h1')].filter(visible);
          const header = document.querySelector('body > .fixed');
          const overflowing = [...document.querySelectorAll('body *')]
            .filter((el) => {
              if (!visible(el)) return false;
              const rect = el.getBoundingClientRect();
              if (rect.right <= width + 1 && rect.left >= -1) return false;
              for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
                if (['auto', 'scroll', 'hidden', 'clip'].includes(getComputedStyle(p).overflowX))
                  return false;
              }
              return true;
            })
            .slice(0, 8)
            .map((el) => `${el.tagName}.${el.className}: ${el.textContent?.trim().slice(0, 70)}`);
          return {
            overflow:
              document.documentElement.scrollWidth > width + 1 ||
              document.body.scrollWidth > width + 1,
            overflowing,
            brokenImages: [...document.images]
              .filter((i) => visible(i) && !i.naturalWidth)
              .map((i) => i.src),
            missingAlt: [...document.images]
              .filter((i) => !i.hasAttribute('alt'))
              .map((i) => i.src),
            h1Count: h1.length,
            obscuredTitle:
              h1.length === 1 &&
              header &&
              h1[0].getBoundingClientRect().top < header.getBoundingClientRect().bottom - 1,
            smallInputs: [...document.querySelectorAll('input:not([type=hidden]),select,textarea')]
              .filter(
                (el) =>
                  !['checkbox', 'radio'].includes(el.type) &&
                  visible(el) &&
                  parseFloat(getComputedStyle(el).fontSize) < 16,
              )
              .map((el) => el.name),
          };
        });
        const record = { tenant, route: base + route, width, ...result, errors };
        report.push(record);
        if (!translated && [375, 1366].includes(width)) {
          await page.screenshot({
            path: join(output, `${tenant}-${route.replaceAll('/', '-') || 'home'}-${width}.png`),
            fullPage: true,
          });
        }
        page.off('pageerror', onError);
      }
    }
    await context.close();
    await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2));
    const issues = report.filter(
      (r) =>
        r.tenant === tenant &&
        (r.overflow ||
          r.brokenImages.length ||
          r.errors.length ||
          r.obscuredTitle ||
          r.h1Count !== 1),
    );
    console.log(
      `${tenant}: ${report.filter((r) => r.tenant === tenant).length} views, ${issues.length} issues`,
    );
  }
} finally {
  await browser.close();
  server.close();
  await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2));
}
const failures = report.filter(
  (r) =>
    r.overflow || r.brokenImages.length || r.errors.length || r.obscuredTitle || r.h1Count !== 1,
);
console.log(`${report.length} views audited; ${failures.length} failures. ${output}/report.json`);
process.exitCode = failures.length ? 1 : 0;
