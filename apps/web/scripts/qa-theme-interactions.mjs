#!/usr/bin/env node
/** Menus, touch controls, enquiries, booking and commercial previews. */
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { chromium, webkit, expect } from '@playwright/test';
import { themeQaServer } from './theme-qa-server.mjs';

const root = resolve(import.meta.dirname, '../../..');
const engine = process.env.QA_BROWSER === 'webkit' ? 'webkit' : 'chromium';
const output = join(
  root,
  'test-results/theme-catalog/interactions',
  ...(engine === 'webkit' ? ['webkit'] : []),
);
await mkdir(output, { recursive: true });
const server = await themeQaServer(join(root, 'apps/site/dist'));
const executablePath =
  process.env.CHROMIUM_PATH ||
  (existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : undefined);
const browser = await (engine === 'webkit' ? webkit.launch() : chromium.launch({ executablePath }));
const results = [];
const tenants = ['demo', ...(await readdir(join(root, 'apps/site/dist/demos'))).sort()];
const sizes = [
  { width: 320, height: 568 },
  { width: 375, height: 812 },
  { width: 430, height: 932 },
  { width: 667, height: 375 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1366, height: 900 },
];
async function check(id, run) {
  try {
    await run();
    results.push({ id, ok: true });
    console.log(`✓ ${id}`);
  } catch (error) {
    results.push({ id, ok: false, error: error.message });
    console.log(`✗ ${id}: ${error.message}`);
  }
  await writeFile(join(output, 'report.json'), JSON.stringify(results, null, 2));
}
async function geometry(page) {
  await page.waitForLoadState('load');
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(requestAnimationFrame);
  });
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    'page overflow',
  );
  assert.deepEqual(
    await page.locator('form').evaluateAll((forms) =>
      forms.flatMap((form) => {
        const box = form.getBoundingClientRect();
        if (!box.width) return [];
        return [...form.querySelectorAll('input:not([type=hidden]),select,textarea,button')]
          .filter((el) => {
            const rect = el.getBoundingClientRect();
            return rect.width && (rect.left < box.left - 1 || rect.right > box.right + 1);
          })
          .map((el) => el.outerHTML.slice(0, 160));
      }),
    ),
    [],
    'clipped form controls',
  );
}
try {
  for (const tenant of tenants.filter((t) => !process.env.QA_THEME || process.env.QA_THEME === t)) {
    const base = tenant === 'demo' ? '/demo/' : `/demos/${tenant}/`;
    for (const viewport of sizes.filter(
      (size) =>
        !process.env.QA_WIDTHS || process.env.QA_WIDTHS.split(',').map(Number).includes(size.width),
    )) {
      await check(`${tenant}/${viewport.width}x${viewport.height}/navigation`, async () => {
        const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
        try {
          const page = await context.newPage();
          await page.goto(server.origin + base);
          await page.evaluate(() => document.fonts.ready);
          await geometry(page);
          const summaries = page.locator('.lc-menu > summary:visible');
          for (let i = 0; i < (await summaries.count()); i++) {
            const summary = summaries.nth(i);
            const box = await summary.boundingBox();
            assert.ok(box.width >= 44 && box.height >= 44, 'menu touch target');
            await summary.click();
            await expect(page.locator('.lc-menu[open]')).toHaveCount(1);
            const menu = page.locator('.lc-menu[open] > ul');
            const rect = await menu.boundingBox();
            assert.ok(
              rect.x >= 0 && rect.x + rect.width <= viewport.width + 1,
              'menu outside viewport',
            );
            assert.ok(rect.y + rect.height <= viewport.height + 1, 'menu outside short viewport');
            await page.keyboard.press('Escape');
            await expect(page.locator('.lc-menu[open]')).toHaveCount(0);
            await expect(summary).toBeFocused();
          }
          await page.goto(server.origin + base + 'tarifas/');
          await geometry(page);
          for (const region of await page.locator('.lc-rate-scroll').all()) {
            const overflowing = await region.evaluate((el) => el.scrollWidth > el.clientWidth);
            if (!overflowing) continue;
            await region.focus();
            await page.keyboard.press('ArrowRight');
            await expect.poll(() => region.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
            const positions = await region.evaluate((el) => {
              el.scrollLeft = el.scrollWidth;
              return [
                el.getBoundingClientRect().left,
                el.querySelector('th[scope=row]').getBoundingClientRect().left,
              ];
            });
            assert.ok(Math.abs(positions[0] - positions[1]) <= 2, 'rate row label lost on scroll');
          }
          if (viewport.width === 375)
            await page.screenshot({ path: join(output, `${tenant}-rates.png`), fullPage: true });
        } finally {
          await context.close();
        }
      });
    }
    if (['ballena', 'carrasca', 'mardefondo', 'soldhivern'].includes(tenant)) {
      for (const width of [320, 375, 768, 1366].filter(
        (width) =>
          !process.env.QA_WIDTHS || process.env.QA_WIDTHS.split(',').map(Number).includes(width),
      ))
        await check(`${tenant}/${width}/booking`, async () => {
          const context = await browser.newContext({
            viewport: { width, height: 900 },
            reducedMotion: 'reduce',
          });
          try {
            const page = await context.newPage();
            await page.clock.setFixedTime(new Date('2026-09-05T12:00:00Z'));
            await page.goto(server.origin + base);
            const dates = page.locator('#mostrador input[type=date]');
            await dates.nth(0).fill('2026-09-19');
            await dates.nth(1).fill('2026-09-26');
            await page.locator('#mostrador button[type=submit]').click();
            const choice = page.locator('#mostrador a[href*="/reservar/"]').first();
            await expect(choice).toBeVisible();
            await choice.click();
            await geometry(page);
            await page.locator('a[href*="/titular?"]').click();
            await page.locator('input[name=name]').fill('Revisión de catálogo');
            await page.locator('input[name=email]').fill('qa@example.test');
            await page.locator('input[name=gdprConsent]').check();
            await geometry(page);
            await page.locator('button[type=submit]').click();
            await expect(page).toHaveURL(/\/reserva\?code=/);
            await expect(page.locator('.lc-print')).toBeVisible();
            await geometry(page);
            await page.screenshot({
              path: join(output, `${tenant}-booking-${width}.png`),
              fullPage: true,
            });
          } finally {
            await context.close();
          }
        });
    }
    if (tenant !== 'demo')
      await check(`${tenant}/enquiry`, async () => {
        const context = await browser.newContext({
          viewport: { width: 375, height: 812 },
          reducedMotion: 'reduce',
        });
        try {
          const page = await context.newPage();
          await page.goto(server.origin + base + 'contacto/?demoState=error#consulta');
          const form = page.locator('form[data-transport]');
          assert.match(await form.getAttribute('data-transport'), /^demo(?:-session)?$/);
          await form.locator('[name=name]').fill('Revisión de catálogo');
          await form.locator('[name=email]').fill('qa@example.test');
          await form.locator('[name=message]').fill('Consulta ficticia de prueba de la interfaz.');
          const stay = form.locator('select[name=stay]');
          if (await stay.count()) await stay.selectOption({ index: 1 });
          await form.locator('[type=submit]').click();
          await expect(form.locator('[data-status]')).toBeVisible();
          await expect(form.locator('[type=submit]')).toBeEnabled();
          await page.evaluate(() =>
            history.replaceState(null, '', location.pathname + '#consulta'),
          );
          await form.locator('[type=submit]').click();
          await expect(form.locator('[data-confirmation]')).toBeVisible();
          await geometry(page);
          await page.screenshot({ path: join(output, `${tenant}-enquiry.png`), fullPage: true });
        } finally {
          await context.close();
        }
      });
  }
  if (!process.env.QA_THEME || process.env.QA_THEME === 'commercial') {
    for (const prefix of ['', '/en'])
      for (const viewport of sizes.filter(
        (size) =>
          !process.env.QA_WIDTHS ||
          process.env.QA_WIDTHS.split(',').map(Number).includes(size.width),
      )) {
        await check(`commercial${prefix}/${viewport.width}x${viewport.height}`, async () => {
          const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
          try {
            const page = await context.newPage();
            await page.goto(`${server.origin}${prefix}/temas/`);
            const rejectCookies = page.locator('[data-consent-reject]:visible');
            if (await rejectCookies.count()) await rejectCookies.first().click();
            await expect(page.locator('[data-theme-card]:visible')).toHaveCount(12);
            await page.locator('[data-theme-search]').fill('duna');
            await expect(page.locator('[data-theme-card]:visible')).toHaveCount(1);
            await page.locator('[data-theme-search]').fill('zz-no-results');
            await expect(page.locator('[data-theme-empty]')).toBeVisible();
            await page.locator('[data-theme-search]').fill('');
            await expect(page.locator('[data-theme-card]:visible')).toHaveCount(12);
            await geometry(page);
            const links = await page
              .locator('.theme-catalog-visual')
              .evaluateAll((els) => els.map((el) => el.getAttribute('href')));
            for (const [index, href] of links.entries()) {
              await page.goto(server.origin + href);
              await page.evaluate(() => document.fonts.ready);
              await geometry(page);
              const h1 = await page.locator('h1').boundingBox();
              assert.ok(h1.x >= 0 && h1.x + h1.width <= viewport.width + 1, 'theme name clipped');
              const frame = page.frameLocator('[data-theme-detail-frame]');
              await expect(frame.locator('h1').first()).toBeVisible();
              const trigger = page.locator('[data-theme-detail-expand]');
              await trigger.click();
              await expect(page.locator('dialog:modal')).toHaveCount(1);
              await expect(trigger).toHaveAttribute('aria-expanded', 'true');
              await trigger.click();
              await expect(page.locator('dialog:modal')).toHaveCount(0);
              await expect(trigger).toBeFocused();
              await trigger.click();
              await frame.locator('.lc-brand').focus();
              await page.keyboard.press('Escape');
              await expect(page.locator('dialog:modal')).toHaveCount(0);
              await expect(trigger).toBeFocused();
              if (index === 0 && viewport.width === 375)
                await page.screenshot({
                  path: join(output, `commercial${prefix.replace('/', '-')}.png`),
                  fullPage: true,
                });
            }
          } finally {
            await context.close();
          }
        });
      }
  }
} finally {
  await browser.close();
  server.close();
}
console.log(
  `${results.length} interaction scenarios, ${results.filter((r) => !r.ok).length} failures`,
);
process.exitCode = results.some((r) => !r.ok) ? 1 : 0;
