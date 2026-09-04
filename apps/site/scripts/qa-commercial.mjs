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
const compactDialogVariants = [
  { width: 320, height: 568, orientation: 'portrait' },
  { width: 667, height: 375, orientation: 'landscape' },
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

async function assertContact(page, { context, label }) {
  const contact = page.locator('[data-logic2b-contact]');
  assert.equal(await contact.count(), 2, `${label}: contacto en header desktop y menú móvil`);

  const contacts = await contact.evaluateAll((items) =>
    items.map((item) => ({
      context: item.getAttribute('data-contact-context'),
      href: item.getAttribute('href'),
      target: item.getAttribute('target'),
      rel: item.getAttribute('rel'),
    })),
  );
  for (const item of contacts) {
    assert.equal(item.context, context, `${label}: contexto`);
    assert.match(item.href, /^https:\/\/wa\.me\/34626432316\?text=/, `${label}: destino`);
    assert.equal(item.target, '_blank', `${label}: target`);
    assert.equal(item.rel, 'noopener noreferrer', `${label}: rel`);
  }

  const isMobile = (page.viewportSize()?.width ?? 0) < 1280;
  const visibleContact = page.locator('[data-logic2b-contact]:visible');
  assert.equal(await visibleContact.count(), isMobile ? 0 : 1, `${label}: visibilidad inicial`);

  if (isMobile) {
    const toggle = page.locator('[data-site-menu-toggle]');
    await toggle.click();
    assert.equal(await visibleContact.count(), 1, `${label}: contacto visible en menú móvil`);
    const box = await visibleContact.boundingBox();
    assert.ok((box?.width ?? 0) >= 44 && (box?.height ?? 0) >= 44, `${label}: objetivo 44px`);
    await toggle.click();
  } else {
    const box = await visibleContact.boundingBox();
    assert.ok((box?.width ?? 0) >= 44 && (box?.height ?? 0) >= 44, `${label}: objetivo 44px`);
  }
}

async function assertTouchTarget(locator, label) {
  const box = await locator.boundingBox();
  const dimensions = box ? `${box.width.toFixed(1)}×${box.height.toFixed(1)}px` : 'invisible';
  assert.ok(
    box && box.width >= 44 && box.height >= 44,
    `${label}: objetivo táctil ${dimensions}, mínimo 44×44px`,
  );
}

async function assertCompactDialogLayout(page, testCase, variant) {
  await page.locator(testCase.trigger).first().click();
  const dialog = page.locator(testCase.dialog);
  assert.equal(
    await dialog.count(),
    1,
    `${variant.width}×${variant.height}/${testCase.label}: el diálogo no abre`,
  );
  assert.ok(
    await dialog.isVisible(),
    `${variant.width}×${variant.height}/${testCase.label}: diálogo invisible`,
  );

  const dialogBox = await dialog.boundingBox();
  const previewBox = await dialog.locator(testCase.preview).boundingBox();
  const detailBox = await dialog.locator(testCase.detail).boundingBox();
  assert.ok(
    dialogBox && previewBox && detailBox,
    `${variant.width}×${variant.height}/${testCase.label}: vista o ficha invisible`,
  );

  if (testCase.inset) {
    assert.ok(
      dialogBox.x >= 8 &&
        dialogBox.y >= 8 &&
        dialogBox.x + dialogBox.width <= variant.width - 8 &&
        dialogBox.y + dialogBox.height <= variant.height - 8,
      `${variant.width}×${variant.height}/${testCase.label}: el fondo no queda visible alrededor del popup`,
    );
    assert.equal(
      await dialog.locator(testCase.popout).count(),
      0,
      `${variant.width}×${variant.height}/${testCase.label}: no debe aparecer la acción de pantalla completa`,
    );
  }

  if (variant.orientation === 'portrait') {
    const horizontalOverlap =
      Math.min(previewBox.x + previewBox.width, detailBox.x + detailBox.width) -
      Math.max(previewBox.x, detailBox.x);
    assert.ok(
      previewBox.height >= 240,
      `${variant.width}×${variant.height}/${testCase.label}: vista ${previewBox.height.toFixed(1)}px < 240px`,
    );
    assert.ok(
      detailBox.height >= (testCase.minimumPortraitDetail ?? 220),
      `${variant.width}×${variant.height}/${testCase.label}: ficha ${detailBox.height.toFixed(1)}px demasiado baja`,
    );
    if (testCase.minimumPortraitPreviewRatio) {
      assert.ok(
        previewBox.height / dialogBox.height >= testCase.minimumPortraitPreviewRatio,
        `${variant.width}×${variant.height}/${testCase.label}: la web no ocupa suficiente altura`,
      );
    }
    if (testCase.previewPriority) {
      assert.ok(
        previewBox.height > detailBox.height,
        `${variant.width}×${variant.height}/${testCase.label}: la ficha ocupa más altura que la web`,
      );
    }
    assert.ok(
      previewBox.y + previewBox.height <= detailBox.y + 1 &&
        horizontalOverlap >= Math.min(previewBox.width, detailBox.width) * 0.8,
      `${variant.width}×${variant.height}/${testCase.label}: vista y ficha no están apiladas`,
    );
  } else {
    const verticalOverlap =
      Math.min(previewBox.y + previewBox.height, detailBox.y + detailBox.height) -
      Math.max(previewBox.y, detailBox.y);
    assert.ok(
      previewBox.width >= 240,
      `${variant.width}×${variant.height}/${testCase.label}: vista ${previewBox.width.toFixed(1)}px < 240px`,
    );
    assert.ok(
      detailBox.width >= (testCase.minimumLandscapeDetail ?? 240),
      `${variant.width}×${variant.height}/${testCase.label}: ficha ${detailBox.width.toFixed(1)}px demasiado estrecha`,
    );
    if (testCase.previewPriority) {
      assert.ok(
        previewBox.width > detailBox.width,
        `${variant.width}×${variant.height}/${testCase.label}: la ficha ocupa más anchura que la web`,
      );
    }
    if (testCase.maximumLandscapeDetailRatio) {
      assert.ok(
        detailBox.width / dialogBox.width <= testCase.maximumLandscapeDetailRatio,
        `${variant.width}×${variant.height}/${testCase.label}: la ficha roba demasiada anchura a la web`,
      );
    }
    assert.ok(
      previewBox.x + previewBox.width <= detailBox.x + 1 &&
        verticalOverlap >= Math.min(previewBox.height, detailBox.height) * 0.8,
      `${variant.width}×${variant.height}/${testCase.label}: el diálogo no está en dos columnas`,
    );
  }

  await assertTouchTarget(
    dialog.locator(testCase.close),
    `${variant.width}×${variant.height}/${testCase.label}: cierre`,
  );
  await assertTouchTarget(
    dialog.locator(testCase.primary),
    `${variant.width}×${variant.height}/${testCase.label}: acción principal`,
  );
  await assertTouchTarget(
    dialog.locator(testCase.secondary),
    `${variant.width}×${variant.height}/${testCase.label}: acción secundaria`,
  );

  await page.keyboard.press('Escape');
  assert.equal(
    await dialog.count(),
    0,
    `${variant.width}×${variant.height}/${testCase.label}: Escape no cierra el diálogo`,
  );
}

async function assertCompactHomeDialogs() {
  const testCases = [
    {
      label: 'tema',
      trigger: '[data-theme-showcase] [data-theme-preview-open="theme-preview-olivar"]',
      dialog: '[data-theme-preview-dialog][open]',
      preview: '.theme-preview-browser',
      detail: '.theme-preview-side',
      close: '[data-theme-preview-close]',
      primary: '.theme-preview-primary',
      secondary: '.theme-preview-secondary',
      popout: '.theme-preview-popout',
      inset: true,
      previewPriority: true,
      minimumPortraitDetail: 60,
      minimumLandscapeDetail: 188,
      minimumPortraitPreviewRatio: 0.85,
      maximumLandscapeDetailRatio: 0.32,
    },
    {
      label: 'panel',
      trigger:
        '[data-management-explorer].is-home [data-management-open="management-preview-home-planning"]',
      dialog: '[data-management-dialog][open]',
      preview: '.management-preview-browser',
      detail: '.management-preview-side',
      close: '[data-management-close]',
      primary: '.management-preview-primary',
      secondary: '.management-preview-secondary',
      popout: '.management-preview-popout',
      inset: true,
      previewPriority: true,
      minimumLandscapeDetail: 220,
    },
  ];

  for (const variant of compactDialogVariants) {
    const context = await browser.newContext({
      viewport: { width: variant.width, height: variant.height },
      reducedMotion: 'reduce',
      colorScheme: 'light',
    });
    await context.route('**/demos/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<!doctype html><html><body style="min-height:1200px"></body></html>',
      }),
    );
    const page = await context.newPage();

    try {
      await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const rejectConsent = page.locator('[data-consent-reject]').first();
      if (await rejectConsent.isVisible()) await rejectConsent.click();

      for (const testCase of testCases) {
        await assertCompactDialogLayout(page, testCase, variant);
      }
      await assertNoOverflow(page, `${variant.width}×${variant.height}: dialogs compactos`);
      console.log(
        `${variant.width}×${variant.height} · previews de tema y panel con reparto útil y objetivos táctiles`,
      );
    } finally {
      await context.close();
    }
  }
}

async function assertDesktopSubpageHeaders() {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 900 },
    reducedMotion: 'reduce',
    colorScheme: 'light',
  });
  const page = await context.newPage();
  const routes = ['/temas/', '/paneles/', '/precios/', '/inteligente/', '/docs/'];

  try {
    for (const route of routes) {
      await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const geometry = await page.evaluate(() => {
        const header = document.querySelector('.site-header-inner')?.getBoundingClientRect();
        const heroElement = document.querySelector('.botanical-subpage-hero');
        const hero = heroElement?.getBoundingClientRect();
        return {
          header: header ? { x: header.x, width: header.width } : null,
          hero: hero ? { x: hero.x, width: hero.width } : null,
          borderTop: heroElement ? getComputedStyle(heroElement).borderTopWidth : null,
          borderBottom: heroElement ? getComputedStyle(heroElement).borderBottomWidth : null,
          backgroundWidth: heroElement
            ? Number.parseFloat(getComputedStyle(heroElement, '::before').width)
            : 0,
          viewportWidth: document.documentElement.clientWidth,
          overflow: document.body.scrollWidth - document.documentElement.clientWidth,
        };
      });

      assert.ok(geometry.header && geometry.hero, `${route}: faltan cabecera o hero comercial`);
      assert.ok(
        Math.abs(geometry.header.x - geometry.hero.x) <= 1 &&
          Math.abs(geometry.header.width - geometry.hero.width) <= 1,
        `${route}: cabecera y hero no comparten alineación`,
      );
      assert.equal(geometry.borderTop, '0px', `${route}: línea superior del hero`);
      assert.equal(geometry.borderBottom, '0px', `${route}: línea inferior del hero`);
      assert.ok(
        geometry.backgroundWidth >= geometry.viewportWidth - 1,
        `${route}: la banda del hero no conserva el fondo completo`,
      );
      assert.equal(geometry.overflow, 0, `${route}: la banda del hero provoca desborde`);
    }
    console.log('desktop · cabeceras comerciales alineadas y sin líneas divisorias');
  } finally {
    await context.close();
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
      const text = message.text();
      const isDevToolbarAuditFailure =
        text.includes('Astro') &&
        text.includes("Error while running audit's match function") &&
        text.includes('Failed to fetch');
      if (message.type() === 'error' && !isDevToolbarAuditFailure)
        failures.push(`console: ${text}`);
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
    if (variant.width < 640) {
      const menuToggle = page.locator('[data-site-menu-toggle]');
      await assertTouchTarget(
        consentBanner.locator('[data-consent-configure]'),
        `${variant.locale}/${variant.width}: configurar cookies`,
      );
      // La toolbar de desarrollo de Astro ocupa la esquina inferior en móvil;
      // no existe en build y puede interceptar este control del banner.
      await consentBanner.locator('[data-consent-configure]').click({ force: true });
      await assertTouchTarget(
        consentBanner.locator('[data-consent-back]'),
        `${variant.locale}/${variant.width}: volver de preferencias`,
      );
      await assertTouchTarget(
        consentBanner.locator('.consent__toggle'),
        `${variant.locale}/${variant.width}: selector de analítica`,
      );
      await consentBanner.locator('[data-consent-back]').click();
      await menuToggle.click();
      assert.ok(
        await page.locator('[data-site-menu]').isVisible(),
        `${variant.locale}/${variant.width}: el menú móvil no abre`,
      );
      assert.equal(
        await consentBanner.isVisible(),
        false,
        `${variant.locale}/${variant.width}: menú y cookies se solapan`,
      );
      assert.equal(
        await menuToggle.getAttribute('aria-label'),
        variant.locale === 'es' ? 'Cerrar menú' : 'Close menu',
        `${variant.locale}/${variant.width}: el menú no anuncia su estado abierto`,
      );
      await page.keyboard.press('Escape');
      assert.equal(
        await page.locator('[data-site-menu]').isVisible(),
        false,
        `${variant.locale}/${variant.width}: Escape no cierra el menú`,
      );
      assert.ok(
        await consentBanner.isVisible(),
        `${variant.locale}/${variant.width}: cookies no reaparece al cerrar el menú`,
      );
      assert.ok(
        await menuToggle.evaluate((element) => document.activeElement === element),
        `${variant.locale}/${variant.width}: el foco no vuelve al botón del menú`,
      );
    }
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
      2,
      `${variant.locale}/${variant.width}: cabecera y menú conservan el contacto Logic2B`,
    );
    const websitesHref = variant.locale === 'es' ? '/#demos' : '/en/#demos';
    const websitesLink = page
      .locator(`header a[href="${websitesHref}"]`)
      .filter({ hasText: variant.locale === 'es' ? 'Webs' : 'Websites' })
      .first();
    assert.equal(
      await websitesLink.getAttribute('href'),
      websitesHref,
      `${variant.locale}/${variant.width}: Webs no enlaza el portfolio del home`,
    );
    await page
      .locator('[data-theme-showcase] [data-theme-preview-open="theme-preview-olivar"]')
      .first()
      .click();
    const themeDialog = page.locator('[data-theme-preview-dialog][open]');
    assert.equal(
      await themeDialog.count(),
      1,
      `${variant.locale}/${variant.width}: el tema no abre su preview`,
    );
    assert.ok(
      await themeDialog.isVisible(),
      `${variant.locale}/${variant.width}: preview de tema invisible`,
    );
    const themeFrame = themeDialog.locator('[data-theme-preview-frame]');
    assert.equal(
      await themeFrame.getAttribute('src'),
      '/demos/olivar/',
      `${variant.locale}/${variant.width}: el visor no carga la web completa del tema`,
    );
    await page.waitForFunction(() => {
      const frame = document.querySelector(
        '[data-theme-preview-dialog][open] [data-theme-preview-frame]',
      );
      return Boolean(
        frame?.contentDocument?.body &&
        frame.contentDocument.readyState === 'complete' &&
        frame.contentDocument.body.scrollHeight > frame.clientHeight,
      );
    });
    const conversionHref = `${variant.prefix}/empezar/?theme=olivar`;
    const detailHref = `${variant.prefix}/temas/olivar/`;
    assert.equal(
      await themeDialog.locator('.theme-preview-primary').getAttribute('href'),
      conversionHref,
      `${variant.locale}/${variant.width}: Quiero esta web no conserva el tema`,
    );
    assert.equal(
      (await themeDialog.locator('.theme-preview-primary').textContent())?.trim(),
      variant.locale === 'es' ? 'Quiero esta web→' : 'I want this website→',
      `${variant.locale}/${variant.width}: acción principal del tema`,
    );
    assert.equal(
      await themeDialog.locator('.theme-preview-secondary').getAttribute('href'),
      detailHref,
      `${variant.locale}/${variant.width}: Más información no lleva a la ficha`,
    );
    const closeClearance = await themeDialog.evaluate((dialog) => {
      const close = dialog.querySelector('[data-theme-preview-close]');
      const dialogBox = dialog.getBoundingClientRect();
      const closeBox = close?.getBoundingClientRect();
      return closeBox
        ? { top: closeBox.top - dialogBox.top, right: dialogBox.right - closeBox.right }
        : null;
    });
    assert.ok(
      closeClearance && closeClearance.top <= 20 && closeClearance.right <= 20,
      `${variant.locale}/${variant.width}: la X no está en la esquina superior derecha`,
    );
    await assertTouchTarget(
      themeDialog.locator('[data-theme-preview-close]'),
      `${variant.locale}/${variant.width}: cierre del tema`,
    );
    await assertTouchTarget(
      themeDialog.locator('.theme-preview-primary'),
      `${variant.locale}/${variant.width}: acción principal del tema`,
    );
    await assertTouchTarget(
      themeDialog.locator('.theme-preview-secondary'),
      `${variant.locale}/${variant.width}: ficha del tema`,
    );
    await page.keyboard.press('Escape');
    assert.equal(
      await themeDialog.count(),
      0,
      `${variant.locale}/${variant.width}: Escape no cierra la preview`,
    );

    const heroThemeRail = page.locator('[data-theme-motion]');
    const heroThemeTrigger = heroThemeRail
      .locator(
        '.camp-theme-card:not([aria-hidden="true"]) [data-theme-preview-open="theme-preview-olivar"]',
      )
      .first();
    await heroThemeTrigger.click();
    assert.equal(
      await page.locator('[data-theme-preview-dialog][open]').count(),
      1,
      `${variant.locale}/${variant.width}: el carrusel visual del hero no abre el tema`,
    );
    assert.equal(
      await heroThemeRail.getAttribute('data-preview-paused'),
      'true',
      `${variant.locale}/${variant.width}: el carrusel visual sigue moviéndose bajo el diálogo`,
    );
    await page.keyboard.press('Escape');
    assert.equal(
      await page.locator('[data-theme-preview-dialog][open]').count(),
      0,
      `${variant.locale}/${variant.width}: el tema del hero no cierra con Escape`,
    );

    const panelTriggers = page.locator(
      '[data-management-explorer].is-home [data-management-open="management-preview-home-planning"]',
    );
    assert.equal(
      await panelTriggers.count(),
      2,
      `${variant.locale}/${variant.width}: deben existir dos accesos al panel`,
    );
    await assertTouchTarget(
      panelTriggers.first(),
      `${variant.locale}/${variant.width}: acceso visual al panel`,
    );
    await assertTouchTarget(
      panelTriggers.last(),
      `${variant.locale}/${variant.width}: acceso secundario al panel`,
    );
    await panelTriggers.first().click();
    const panelDialog = page.locator('[data-management-dialog][open]');
    assert.equal(
      await panelDialog.count(),
      1,
      `${variant.locale}/${variant.width}: el panel no abre su preview`,
    );
    assert.ok(
      await panelDialog.isVisible(),
      `${variant.locale}/${variant.width}: preview del panel invisible`,
    );
    assert.equal(
      await panelDialog.locator('[data-management-frame]').getAttribute('src'),
      '/demos/pinadamar/gestion/#/planning',
      `${variant.locale}/${variant.width}: el visor no carga el planning completo`,
    );
    await page.waitForFunction(() => {
      const frame = document.querySelector(
        '[data-management-dialog][open] [data-management-frame]',
      );
      return Boolean(
        frame?.contentDocument?.body && frame.contentDocument.readyState === 'complete',
      );
    });
    assert.equal(
      await panelDialog.locator('.management-preview-primary').getAttribute('href'),
      `${variant.prefix}/empezar/?panel=planning`,
      `${variant.locale}/${variant.width}: el CTA no conserva el panel`,
    );
    assert.equal(
      (await panelDialog.locator('.management-preview-primary').textContent())?.trim(),
      variant.locale === 'es' ? 'Quiero este panel→' : 'I want this dashboard→',
      `${variant.locale}/${variant.width}: acción principal del panel`,
    );
    assert.equal(
      await panelDialog.locator('.management-preview-secondary').getAttribute('href'),
      `${variant.prefix}/paneles/planning/`,
      `${variant.locale}/${variant.width}: la ficha no corresponde al panel`,
    );
    assert.equal(
      (await panelDialog.locator('.management-preview-secondary').textContent())?.trim(),
      variant.locale === 'es' ? 'Ver ficha completa↗' : 'View full dashboard page↗',
      `${variant.locale}/${variant.width}: etiqueta de la ficha del panel`,
    );
    await assertTouchTarget(
      panelDialog.locator('[data-management-close]'),
      `${variant.locale}/${variant.width}: cierre del panel`,
    );
    await assertTouchTarget(
      panelDialog.locator('.management-preview-primary'),
      `${variant.locale}/${variant.width}: acción principal del panel`,
    );
    await assertTouchTarget(
      panelDialog.locator('.management-preview-secondary'),
      `${variant.locale}/${variant.width}: ficha del panel`,
    );
    await page.keyboard.press('Escape');
    assert.equal(
      await panelDialog.count(),
      0,
      `${variant.locale}/${variant.width}: Escape no cierra la preview del panel`,
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
    assert.equal(
      await themeShowcase.count(),
      1,
      `${variant.locale}/${variant.width}: slider único`,
    );
    assert.equal(
      await themeShowcase.locator('.theme-showcase-card').count(),
      12,
      `${variant.locale}/${variant.width}: doce temas en el slider`,
    );
    assert.equal(
      await themeShowcasePrevious.isDisabled(),
      true,
      `${variant.locale}/${variant.width}: inicio del slider`,
    );
    assert.equal(
      await themeShowcaseNext.isDisabled(),
      false,
      `${variant.locale}/${variant.width}: slider navegable`,
    );
    await themeShowcaseNext.click();
    await page.waitForFunction(() => {
      const track = document.querySelector('[data-theme-showcase-track]');
      const previous = document.querySelector('[data-theme-showcase-prev]');
      return (
        (track?.scrollLeft ?? 0) > 2 && previous instanceof HTMLButtonElement && !previous.disabled
      );
    });
    assert.equal(
      await themeShowcasePrevious.isDisabled(),
      false,
      `${variant.locale}/${variant.width}: retorno del slider`,
    );

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
      items.map((item) =>
        new URL(item.getAttribute('data-request-base'), location.origin).searchParams.get('plan'),
      ),
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
      await planSection
        .locator('[data-pricing-price]')
        .evaluateAll((items) =>
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

    await page.goto(`${origin}${conversionHref}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(
      await page.locator('[data-conversion-plan-name]').textContent(),
      "L'Olivar",
      `${variant.locale}/${variant.width}: el formulario no muestra el tema elegido`,
    );
    assert.equal(
      await page.locator('[data-conversion-theme-input]').inputValue(),
      'olivar',
      `${variant.locale}/${variant.width}: el formulario no conserva el identificador del tema`,
    );
    assert.match(
      await page.locator('#conversion-lead-form [name="message"]').inputValue(),
      /L'Olivar/,
      `${variant.locale}/${variant.width}: falta el mensaje predeterminado del tema`,
    );
    await assertNoOverflow(page, `${variant.locale}/${variant.width}: conversión por tema`);

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
    const panelVisuals = page.locator('.panel-catalog-grid .management-panel-visual');
    assert.equal(
      await panelVisuals.count(),
      6,
      `${variant.locale}/${variant.width}: seis vistas de gestión`,
    );
    const panelVisualText = (
      await page.locator('.panel-catalog-grid .panel-catalog-meta h2').allTextContents()
    ).join(' ');
    assert.match(
      panelVisualText,
      variant.locale === 'es'
        ? /Planning semanal.*Plano de ocupación.*Solicitudes.*Informes operativos.*Centro de control.*Vista inteligente/s
        : /Weekly planner.*Occupancy map.*Enquiries.*Operational reports.*Control centre.*Intelligent view/s,
      `${variant.locale}/${variant.width}: paneles localizados`,
    );
    assert.deepEqual(
      await page
        .locator('.panel-catalog-grid .panel-catalog-open')
        .evaluateAll((items) => items.map((item) => item.getAttribute('href'))),
      [
        `${variant.prefix}/paneles/planning/`,
        `${variant.prefix}/paneles/plano/`,
        `${variant.prefix}/paneles/solicitudes/`,
        `${variant.prefix}/paneles/informes/`,
        `${variant.prefix}/paneles/control-total/`,
        `${variant.prefix}/paneles/inteligente/`,
      ],
      `${variant.locale}/${variant.width}: fichas de los paneles`,
    );
    await page.goto(`${origin}${variant.prefix}/paneles/planning/`, { waitUntil: 'networkidle' });
    assert.equal(
      await page
        .locator('.panel-detail-screen iframe[src="/demos/pinadamar/gestion/#/planning"]')
        .count(),
      1,
      `${variant.locale}/${variant.width}: ficha con panel navegable`,
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
        stickyClearance >= 0,
        `${variant.locale}/${variant.width}: el índice no se solapa con el header (${stickyClearance}px)`,
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
  await assertDesktopSubpageHeaders();
  await assertCompactHomeDialogs();
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
