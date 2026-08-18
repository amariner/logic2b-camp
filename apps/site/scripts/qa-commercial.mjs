import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';

const origin = process.env.COMMERCIAL_QA_ORIGIN ?? 'http://127.0.0.1:4321';
const output = process.env.COMMERCIAL_QA_OUTPUT ?? '/tmp';
const chromiumPath =
  process.env.CHROMIUM_PATH ??
  (existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : undefined);
const variants = [
  { locale: 'es', prefix: '', width: 1366, height: 900 },
  { locale: 'es', prefix: '', width: 375, height: 812 },
  { locale: 'en', prefix: '/en', width: 1366, height: 900 },
  { locale: 'en', prefix: '/en', width: 375, height: 812 },
];
const motionLabels = {
  es: {
    pause: 'Pausar el movimiento de los temas',
    resume: 'Reanudar el movimiento de los temas',
  },
  en: { pause: 'Pause theme motion', resume: 'Resume theme motion' },
};

const launchOptions = chromiumPath ? { executablePath: chromiumPath } : {};
if (process.env.COMMERCIAL_QA_NO_PROXY === '1') launchOptions.args = ['--no-proxy-server'];
const browser = await chromium.launch(launchOptions);

async function assertThemeMotionControls(variant) {
  const context = await browser.newContext({
    viewport: { width: variant.width, height: variant.height },
    reducedMotion: 'no-preference',
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
    if (!reason.includes('ERR_ABORTED')) failures.push(`request: ${request.url()} (${reason})`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400) failures.push(`response: ${response.status()} ${response.url()}`);
  });

  try {
    await page.goto(`${origin}${variant.prefix || '/'}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const rail = page.locator('[data-theme-motion]');
    const toggle = rail.locator('[data-theme-motion-toggle]');
    const tracks = rail.locator('.camp-theme-track');
    const labels = motionLabels[variant.locale];

    assert.equal(await rail.count(), 1, `${variant.locale}/${variant.width}: carril único`);
    assert.equal(
      await rail.locator('.camp-theme-card:not([aria-hidden="true"])').count(),
      12,
      `${variant.locale}/${variant.width}: doce temas accesibles`,
    );
    assert.ok(await toggle.isVisible(), `${variant.locale}/${variant.width}: control visible`);
    const toggleBox = await toggle.boundingBox();
    assert.ok(
      (toggleBox?.width ?? 0) >= 44 && (toggleBox?.height ?? 0) >= 44,
      `${variant.locale}/${variant.width}: objetivo táctil del control`,
    );
    assert.equal(
      await toggle.getAttribute('aria-label'),
      labels.pause,
      `${variant.locale}/${variant.width}: etiqueta inicial`,
    );
    assert.deepEqual(
      await tracks.evaluateAll((items) =>
        items.map((item) => getComputedStyle(item).animationPlayState),
      ),
      ['running', 'running'],
      `${variant.locale}/${variant.width}: movimiento inicial`,
    );

    await toggle.focus();
    await page.keyboard.press('Enter');
    assert.equal(await toggle.getAttribute('aria-pressed'), 'true');
    assert.equal(await toggle.getAttribute('aria-label'), labels.resume);
    assert.deepEqual(
      await tracks.evaluateAll((items) =>
        items.map((item) => getComputedStyle(item).animationPlayState),
      ),
      ['paused', 'paused'],
      `${variant.locale}/${variant.width}: pausa manual`,
    );
    await rail.screenshot({
      path: `${output}/logic-camp-theme-motion-${variant.locale}-${variant.width}.png`,
    });

    await page.keyboard.press('Space');
    assert.equal(await toggle.getAttribute('aria-pressed'), 'false');
    assert.equal(await toggle.getAttribute('aria-label'), labels.pause);
    assert.deepEqual(
      await tracks.evaluateAll((items) =>
        items.map((item) => getComputedStyle(item).animationPlayState),
      ),
      ['running', 'running'],
      `${variant.locale}/${variant.width}: reanudación manual`,
    );

    await rail.locator('.camp-theme-link').focus();
    assert.equal(await rail.getAttribute('data-focus-paused'), 'true');
    assert.deepEqual(
      await tracks.evaluateAll((items) =>
        items.map((item) => getComputedStyle(item).animationPlayState),
      ),
      ['paused', 'paused'],
      `${variant.locale}/${variant.width}: pausa durante el foco`,
    );
    await toggle.focus();
    assert.equal(await rail.getAttribute('data-focus-paused'), 'false');
    await assertNoOverflow(page, `${variant.locale}/${variant.width}: carril de temas`);
    assert.deepEqual(failures, [], `${variant.locale}/${variant.width}: errores del carril`);
  } finally {
    await context.close();
  }
}

async function assertContact(page, { context, visible, label }) {
  const contact = page.locator('[data-logic2b-contact]');
  assert.equal(await contact.count(), 1, `${label}: debe existir un único contacto`);
  assert.equal(await contact.getAttribute('data-contact-context'), context, `${label}: contexto`);
  assert.match(
    await contact.getAttribute('href'),
    /^https:\/\/wa\.me\/34626432316\?text=/,
    `${label}: destino`,
  );
  assert.equal(await contact.getAttribute('target'), '_blank', `${label}: target`);
  assert.equal(await contact.getAttribute('rel'), 'noopener noreferrer', `${label}: rel`);
  await page.waitForFunction(
    ({ expected }) =>
      document.querySelector('[data-logic2b-contact]')?.getAttribute('data-visible') === expected,
    { expected: String(visible) },
  );
  assert.equal(await contact.getAttribute('tabindex'), visible ? '0' : '-1', `${label}: foco`);
  if (visible) {
    assert.ok(await contact.isVisible(), `${label}: visible`);
    const box = await contact.boundingBox();
    assert.ok((box?.width ?? 0) >= 44 && (box?.height ?? 0) >= 44, `${label}: objetivo 44px`);
  }
}

try {
  for (const variant of variants) {
    await assertThemeMotionControls(variant);
    const context = await browser.newContext({
      viewport: { width: variant.width, height: variant.height },
      reducedMotion: 'reduce',
      colorScheme: 'light',
    });
    const googleRequests = [];
    await context.route(
      /https:\/\/(?:www\.googletagmanager\.com|www\.google-analytics\.com)\//,
      async (route) => {
        googleRequests.push(route.request().url());
        await route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
      },
    );
    const page = await context.newPage();
    const failures = [];
    page.on('console', (message) => {
      if (message.type() === 'error') failures.push(`console: ${message.text()}`);
    });
    page.on('pageerror', (error) => failures.push(`page: ${error.message}`));
    page.on('requestfailed', (request) => {
      const reason = request.failure()?.errorText ?? 'unknown';
      if (!reason.includes('ERR_ABORTED')) failures.push(`request: ${request.url()} (${reason})`);
    });
    page.on('response', (response) => {
      if (response.status() >= 400)
        failures.push(`response: ${response.status()} ${response.url()}`);
    });

    await page.goto(`${origin}${variant.prefix || '/'}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const reducedThemeTracks = page.locator('[data-theme-motion] .camp-theme-track');
    assert.deepEqual(
      await reducedThemeTracks.evaluateAll((items) =>
        items.map((item) => getComputedStyle(item).animationPlayState),
      ),
      ['paused', 'paused'],
      `${variant.locale}/${variant.width}: movimiento reducido`,
    );
    assert.equal(
      await page.locator('[data-theme-motion-toggle]').isVisible(),
      false,
      `${variant.locale}/${variant.width}: control redundante con movimiento reducido`,
    );
    assert.deepEqual(
      googleRequests,
      [],
      `${variant.locale}/${variant.width}: Google cargó antes del consentimiento`,
    );
    const consentBanner = page.locator('[data-consent-banner]');
    assert.ok(
      await consentBanner.isVisible(),
      `${variant.locale}/${variant.width}: banner visible`,
    );
    const acceptsAnalytics = variant.locale === 'es' && variant.width === 1366;
    if (acceptsAnalytics) {
      await consentBanner.locator('[data-consent-accept]').click();
      await page.waitForFunction(() => window.l2bGtmLoaded === true);
      assert.equal(googleRequests.length, 1, 'aceptar debe cargar GTM una sola vez');
    } else {
      await consentBanner.locator('[data-consent-reject]').first().click();
      assert.deepEqual(
        googleRequests,
        [],
        `${variant.locale}/${variant.width}: rechazar cargó Google`,
      );
    }
    await assertContact(page, {
      context: 'commercial',
      visible: false,
      label: `${variant.locale}/${variant.width}: contacto inicial`,
    });
    const planSection = page.locator('#niveles');
    await planSection.scrollIntoViewIfNeeded();
    await assertContact(page, {
      context: 'commercial',
      visible: true,
      label: `${variant.locale}/${variant.width}: contacto tras scroll`,
    });
    const statuses = planSection.locator('[data-plan-status]');
    assert.equal(
      await statuses.count(),
      4,
      `${variant.locale}/${variant.width}: estados en portada`,
    );
    const stateTypes = await statuses.evaluateAll((items) =>
      items.map((item) => item.getAttribute('data-plan-status')),
    );
    assert.deepEqual(stateTypes, ['disponible', 'disponible', 'desarrollo', 'vision']);
    const treatments = await statuses.evaluateAll((items) =>
      items.map((item) => {
        const style = getComputedStyle(item);
        return `${style.backgroundColor}/${style.borderColor}`;
      }),
    );
    assert.equal(
      new Set(treatments).size,
      3,
      `${variant.locale}/${variant.width}: tratamientos de estado`,
    );

    const guides = page.locator('.botanical-guide-grid a');
    assert.equal(
      await guides.count(),
      5,
      `${variant.locale}/${variant.width}: cinco guías en portada`,
    );

    const faq = page.locator('.botanical-faq-list details');
    assert.equal(await faq.count(), 6, `${variant.locale}/${variant.width}: FAQ completa`);
    await faq.first().locator('summary').click();
    assert.ok(
      await faq.first().evaluate((item) => item.open),
      `${variant.locale}/${variant.width}: FAQ operativa`,
    );
    const faqContract = await page.evaluate(() => {
      const data = [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map((script) => JSON.parse(script.textContent ?? '{}'))
        .find((item) => item['@type'] === 'FAQPage');
      const visible = [...document.querySelectorAll('.botanical-faq-list details')].map((item) => ({
        question: item.querySelector('summary span')?.textContent?.trim(),
        answer: item.querySelector('p')?.textContent?.trim(),
      }));
      return { structured: data?.mainEntity, visible };
    });
    assert.deepEqual(
      faqContract.structured.map((item) => ({
        question: item.name,
        answer: item.acceptedAnswer.text,
      })),
      faqContract.visible,
      `${variant.locale}/${variant.width}: FAQ visible y estructurada divergen`,
    );

    const leadForm = page.locator('#lead-form');
    assert.equal(
      await leadForm.locator('label').count(),
      7,
      `${variant.locale}/${variant.width}: campos del formulario`,
    );
    assert.equal(
      await leadForm.locator('[required]').count(),
      4,
      `${variant.locale}/${variant.width}: campos obligatorios`,
    );
    const requestedPlan = await planSection
      .locator('[data-project-request-plan]')
      .last()
      .getAttribute('data-project-request-plan');
    await planSection.locator('[data-project-request-plan]').last().click();
    const dialog = page.locator('#project-request-dialog');
    assert.ok(
      await dialog.evaluate((item) => item.open),
      `${variant.locale}/${variant.width}: diálogo de solicitud`,
    );
    await assertContact(page, {
      context: 'commercial',
      visible: false,
      label: `${variant.locale}/${variant.width}: contacto bajo modal`,
    });
    assert.equal(
      await dialog.locator('[data-project-request-plan-input]').inputValue(),
      requestedPlan,
      `${variant.locale}/${variant.width}: el plan no llega al formulario`,
    );
    await dialog.locator('[data-project-request-close]').click();
    assert.ok(
      !(await dialog.evaluate((item) => item.open)),
      `${variant.locale}/${variant.width}: cierre del diálogo`,
    );
    await assertContact(page, {
      context: 'commercial',
      visible: true,
      label: `${variant.locale}/${variant.width}: contacto tras modal`,
    });
    await page.screenshot({
      path: `${output}/logic-camp-commercial-contact-${variant.locale}-${variant.width}.png`,
      animations: 'disabled',
    });

    await assertNoOverflow(page, `${variant.locale}/${variant.width}: portada`);
    await page.screenshot({
      path: `${output}/logic-camp-commercial-home-${variant.locale}-${variant.width}.png`,
      fullPage: true,
      animations: 'disabled',
    });

    await page.goto(`${origin}${variant.prefix}/precios/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(
      await page.locator('[data-plan-status]').count(),
      4,
      `${variant.locale}/${variant.width}: estados en precios`,
    );
    await assertNoOverflow(page, `${variant.locale}/${variant.width}: precios`);
    await page.evaluate(() => window.scrollTo(0, 320));
    await assertContact(page, {
      context: 'commercial',
      visible: true,
      label: `${variant.locale}/${variant.width}: contacto en precios`,
    });

    await page.goto(`${origin}${variant.prefix}/docs/recepcion/check-in/`, {
      waitUntil: 'networkidle',
    });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.scrollTo(0, 320));
    await assertContact(page, {
      context: 'docs',
      visible: true,
      label: `${variant.locale}/${variant.width}: contacto en guía`,
    });
    await page.screenshot({
      path: `${output}/logic-camp-doc-contact-${variant.locale}-${variant.width}.png`,
      animations: 'disabled',
    });
    const breadcrumb = await page.evaluate(() => {
      const scripts = [...document.head.querySelectorAll('script[type="application/ld+json"]')];
      return scripts
        .map((script) => JSON.parse(script.textContent ?? '{}'))
        .find((item) => item['@type'] === 'BreadcrumbList');
    });
    assert.equal(
      breadcrumb?.itemListElement?.length,
      3,
      `${variant.locale}/${variant.width}: breadcrumb en head`,
    );
    await assertNoOverflow(page, `${variant.locale}/${variant.width}: guía`);

    const aside = page.locator('main aside');
    if (variant.width >= 1024) {
      await page.evaluate(() => window.scrollTo(0, 650));
      await page.waitForTimeout(100);
      const stickyClearance = await page.evaluate(() => {
        const header = document.querySelector('header');
        const sidebar = document.querySelector('main aside');
        return sidebar.getBoundingClientRect().top - header.getBoundingClientRect().bottom;
      });
      assert.ok(
        stickyClearance >= 20,
        `${variant.locale}/${variant.width}: el índice queda bajo el header (${stickyClearance}px)`,
      );
    } else {
      const mobileOrder = await page.evaluate(() => {
        const grid = document.querySelector('main > div');
        const sidebar = grid?.querySelector(':scope > aside');
        const article = grid?.querySelector(':scope > div');
        return {
          asideTop: sidebar?.getBoundingClientRect().top,
          articleTop: article?.getBoundingClientRect().top,
        };
      });
      assert.ok(
        await aside.isVisible(),
        `${variant.locale}/${variant.width}: índice móvil visible`,
      );
      assert.ok(
        Number(mobileOrder.asideTop) > Number(mobileOrder.articleTop),
        `${variant.locale}/${variant.width}: el índice móvil debe ir después del texto`,
      );
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `${output}/logic-camp-commercial-doc-${variant.locale}-${variant.width}.png`,
      fullPage: true,
      animations: 'disabled',
    });

    await page.locator('footer').scrollIntoViewIfNeeded();
    await assertContact(page, {
      context: 'docs',
      visible: false,
      label: `${variant.locale}/${variant.width}: contacto retirado ante pie`,
    });

    await page.goto(`${origin}${variant.prefix}/cookies/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    assert.ok(
      await page.locator('[data-consent-reset]').isVisible(),
      `${variant.locale}/${variant.width}: control de revocación`,
    );
    if (acceptsAnalytics) {
      await page.locator('[data-consent-reset]').click();
      await page.waitForLoadState('networkidle');
      assert.ok(
        await page.locator('[data-consent-banner]').isVisible(),
        'revocar debe reabrir el banner',
      );
      await page.locator('[data-consent-reject]').first().click();
    }
    await assertNoOverflow(page, `${variant.locale}/${variant.width}: cookies`);

    assert.deepEqual(failures, [], `${variant.locale}/${variant.width}: errores de navegador`);
    console.log(
      `${variant.locale} · ${variant.width}px · portada, precios y guía sin desborde ni errores`,
    );
    await context.close();
  }
} finally {
  await browser.close();
}

async function assertNoOverflow(page, label) {
  const sizes = await page.evaluate(() => ({
    body: document.body.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  assert.ok(sizes.body <= sizes.viewport, `${label}: ${sizes.body}px > ${sizes.viewport}px`);
}
