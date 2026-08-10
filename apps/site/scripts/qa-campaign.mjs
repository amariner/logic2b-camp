import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';

const origin = process.env.CAMPAIGN_QA_ORIGIN ?? 'http://127.0.0.1:4321';
const screenshotDir = process.env.CAMPAIGN_QA_OUTPUT ?? '/tmp';
const chromiumPath =
  process.env.CHROMIUM_PATH ??
  (existsSync('/opt/pw-browsers/chromium')
    ? '/opt/pw-browsers/chromium'
    : existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : undefined);

const variants = [
  { locale: 'es', path: '/', width: 1366, height: 900 },
  { locale: 'es', path: '/', width: 375, height: 812 },
  { locale: 'en', path: '/en/', width: 1366, height: 900 },
  { locale: 'en', path: '/en/', width: 375, height: 812 },
];

const browser = await chromium.launch({ executablePath: chromiumPath });

try {
  for (const variant of variants) {
    const context = await browser.newContext({
      viewport: { width: variant.width, height: variant.height },
      reducedMotion: 'reduce',
      colorScheme: 'light',
    });
    const page = await context.newPage();
    const failures = [];

    page.on('console', (message) => {
      if (message.type() === 'error') failures.push(`console: ${message.text()}`);
    });
    page.on('pageerror', (error) => failures.push(`page: ${error.message}`));
    page.on('requestfailed', (request) => {
      const reason = request.failure()?.errorText ?? 'unknown';
      // `preload=metadata` puede cancelar el rango restante del vídeo cuando
      // ya conoce duración y dimensiones; no es un recurso roto.
      if (!reason.includes('ERR_ABORTED')) failures.push(`request: ${request.url()} (${reason})`);
    });
    page.on('response', (response) => {
      if (response.status() >= 400)
        failures.push(`response: ${response.status()} ${response.url()}`);
    });

    await page.goto(`${origin}${variant.path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    const section = page.locator('#campanas');
    await section.scrollIntoViewIfNeeded();
    await page.waitForFunction(() =>
      [...document.querySelectorAll('#campanas img')].every(
        (image) => image.complete && image.naturalWidth > 0,
      ),
    );
    const campaignLinks = section.locator('.campaign-card > a');
    await assert.doesNotReject(() => assertCampaignLinks(campaignLinks));

    const brokenImages = await section
      .locator('img')
      .evaluateAll((images) =>
        images
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.getAttribute('src')),
      );
    assert.deepEqual(brokenImages, [], `${variant.locale}/${variant.width}: imágenes rotas`);

    const overflow = await page.evaluate(() => ({
      body: document.body.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    assert.ok(
      overflow.body <= overflow.viewport,
      `${variant.locale}/${variant.width}: desborde ${overflow.body}px > ${overflow.viewport}px`,
    );

    const count = await campaignLinks.count();
    for (let index = 0; index < count; index += 1) {
      const link = campaignLinks.nth(index);
      await link.focus();
      const outline = await link.evaluate((element) => {
        const style = getComputedStyle(element);
        return { style: style.outlineStyle, width: Number.parseFloat(style.outlineWidth) };
      });
      assert.notEqual(outline.style, 'none', `${variant.locale}/${variant.width}: foco sin estilo`);
      assert.ok(outline.width >= 2, `${variant.locale}/${variant.width}: foco menor de 2px`);
    }

    assert.deepEqual(failures, [], `${variant.locale}/${variant.width}: errores de navegador`);
    await section.screenshot({
      path: `${screenshotDir}/logic-camp-campaign-${variant.locale}-${variant.width}.png`,
      animations: 'disabled',
    });
    console.log(`${variant.locale} · ${variant.width}px · 3 formatos · sin desborde ni errores`);
    await context.close();
  }
} finally {
  await browser.close();
}

async function assertCampaignLinks(locator) {
  const hrefs = await locator.evaluateAll((links) =>
    links.map((link) => link.getAttribute('href')),
  );
  assert.equal(hrefs.length, 3, 'la campaña debe tener exactamente tres formatos clicables');

  const contents = new Set();
  for (const href of hrefs) {
    assert.ok(href, 'enlace de campaña vacío');
    const url = new URL(href, origin);
    assert.equal(url.pathname, '/demos/mardefondo/');
    assert.equal(url.hash, '#mostrador');
    assert.equal(url.searchParams.get('utm_campaign'), 'mar_de_fondo_agosto');
    assert.ok(url.searchParams.get('utm_source'));
    assert.ok(url.searchParams.get('utm_medium'));
    assert.ok(url.searchParams.get('utm_content'));
    contents.add(url.searchParams.get('utm_content'));
  }
  assert.equal(contents.size, 3, 'cada formato debe conservar un utm_content distinto');
}
