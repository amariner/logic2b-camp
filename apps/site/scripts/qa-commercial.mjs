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
    assert.equal(
      await page.locator('[data-logic2b-contact]').count(),
      0,
      `${variant.locale}/${variant.width}: la portada usa su cierre comercial propio`,
    );
    if (acceptsAnalytics) {
      await page
        .locator('a[href="/demos/pinadamar/gestion/#/planning"]')
        .first()
        .evaluate((link) => {
          if (!(link instanceof HTMLAnchorElement)) throw new Error('enlace de gestión ausente');
          link.addEventListener('click', (event) => event.preventDefault(), { once: true });
          link.click();
        });
      assert.equal(
        await page.evaluate(() => window.dataLayer?.at(-1)?.event),
        'camp_open_manager',
        'la demo de gestión conserva su evento analítico',
      );
    }

    const themeShowcase = page.locator('[data-theme-showcase]');
    const themeShowcasePrevious = themeShowcase.locator('[data-theme-showcase-prev]');
    const themeShowcaseNext = themeShowcase.locator('[data-theme-showcase-next]');
    assert.equal(await themeShowcase.count(), 1, `${variant.locale}/${variant.width}: slider único`);
    assert.equal(
      await themeShowcase.locator('.theme-showcase-card').count(),
      12,
      `${variant.locale}/${variant.width}: doce temas en el slider`,
    );
    assert.equal(await themeShowcasePrevious.isDisabled(), true, `${variant.locale}/${variant.width}: inicio del slider`);
    assert.equal(await themeShowcaseNext.isDisabled(), false, `${variant.locale}/${variant.width}: slider navegable`);
    await themeShowcaseNext.click();
    await page.waitForFunction(
      () => {
        const track = document.querySelector('[data-theme-showcase-track]');
        const previous = document.querySelector('[data-theme-showcase-prev]');
        return (track?.scrollLeft ?? 0) > 2 && previous instanceof HTMLButtonElement && !previous.disabled;
      },
    );
    assert.equal(await themeShowcasePrevious.isDisabled(), false, `${variant.locale}/${variant.width}: retorno del slider`);

    const planSection = page.locator('#precios');
    await planSection.scrollIntoViewIfNeeded();
    const pricingCards = planSection.locator('.pricing-card');
    assert.equal(
      await pricingCards.count(),
      3,
      `${variant.locale}/${variant.width}: tres planes en portada`,
    );
    assert.equal(
      await planSection.locator('[data-plan-status]').count(),
      0,
      `${variant.locale}/${variant.width}: sin estados del catálogo anterior`,
    );
    const requestLinks = planSection.locator('[data-request-base]');
    const requestedPlans = await requestLinks.evaluateAll((items) =>
      items.map((item) => new URL(item.getAttribute('data-request-base'), location.origin).searchParams.get('plan')),
    );
    assert.deepEqual(
      requestedPlans,
      ['inicial', 'gestion', 'avanzado'],
      `${variant.locale}/${variant.width}: identidad de los planes`,
    );
    assert.deepEqual(
      await requestLinks.evaluateAll((items) =>
        items.map((item) => new URL(item.href).searchParams.get('billing')),
      ),
      ['monthly', 'monthly', 'monthly'],
      `${variant.locale}/${variant.width}: solicitud mensual inicial`,
    );
    const annualBilling = planSection.locator('[data-billing-option="annual"]');
    await annualBilling.click();
    assert.equal(await annualBilling.getAttribute('aria-pressed'), 'true');
    assert.equal(await planSection.getAttribute('data-billing'), 'annual');
    assert.ok(
      await planSection.locator('[data-pricing-price]').evaluateAll((items) =>
        items.every((item) => item.textContent.trim() === item.getAttribute('data-annual')),
      ),
      `${variant.locale}/${variant.width}: precios anuales visibles`,
    );
    assert.deepEqual(
      await requestLinks.evaluateAll((items) =>
        items.map((item) => new URL(item.href).searchParams.get('billing')),
      ),
      ['annual', 'annual', 'annual'],
      `${variant.locale}/${variant.width}: solicitud anual`,
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

    const leadForm = page.locator('#project-request-form');
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
    const requestTrigger = page.locator('.home-closing-button');
    await requestTrigger.scrollIntoViewIfNeeded();
    await requestTrigger.click();
    const dialog = page.locator('#project-request-dialog');
    assert.ok(
      await dialog.evaluate((item) => item.open),
      `${variant.locale}/${variant.width}: diálogo de solicitud`,
    );
    assert.equal(
      await dialog.locator('[data-project-request-plan-input]').inputValue(),
      '',
      `${variant.locale}/${variant.width}: la solicitud general no preselecciona plan`,
    );
    await dialog.locator('[data-project-request-close]').click();
    assert.ok(
      !(await dialog.evaluate((item) => item.open)),
      `${variant.locale}/${variant.width}: cierre del diálogo`,
    );
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

    await page.goto(`${origin}${variant.prefix}/paneles/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(
      await page.locator('main').count(),
      1,
      `${variant.locale}/${variant.width}: estructura principal de paneles`,
    );
    const panelVisuals = page.locator('.management-panel-visual');
    assert.equal(
      await panelVisuals.count(),
      2,
      `${variant.locale}/${variant.width}: dos paneles de gestión`,
    );
    const panelVisualText = (await panelVisuals.allTextContents()).join(' ');
    assert.match(
      panelVisualText,
      variant.locale === 'es'
        ? /Planning semanal.*Vista ejecutiva/s
        : /Weekly planner.*Executive overview/s,
      `${variant.locale}/${variant.width}: paneles localizados`,
    );
    assert.deepEqual(
      await page.locator('.panels-type-copy > a').evaluateAll((items) =>
        items.map((item) => item.getAttribute('href')),
      ),
      [
        '/demos/pinadamar/gestion/#/planning',
        '/demos/mardefondo/gestion/#/inteligente',
      ],
      `${variant.locale}/${variant.width}: destinos de los paneles`,
    );
    await assertNoOverflow(page, `${variant.locale}/${variant.width}: paneles`);
    await page.screenshot({
      path: `${output}/logic-camp-commercial-panels-${variant.locale}-${variant.width}.png`,
      fullPage: true,
      animations: 'disabled',
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
      `${variant.locale} · ${variant.width}px · portada, precios, paneles y guía sin desborde ni errores`,
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
