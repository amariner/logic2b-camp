import { expect, test } from './fixtures';

test.describe('recorrido guiado Camp', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'l2b-consent',
        JSON.stringify({
          essential: true,
          analytics: false,
          timestamp: '2026-08-29T10:00:00.000Z',
          version: '1.0.0',
        }),
      );
    });
  });

  test('inicia, navega, pausa, reanuda y completa nueve hitos sin mutaciones', async ({ page }) => {
    const mutations: string[] = [];
    page.on('request', (request) => {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) mutations.push(request.url());
    });

    await page.goto('/');
    const trigger = page.locator('[data-camp-tour-trigger]');
    await trigger.click();

    const dialog = page.locator('.lc-tour-intro');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('role', 'dialog');
    await expect(dialog).toHaveAttribute('aria-label', /conocer Logic2B Campings/i);
    await expect(dialog).toContainText('9 hitos');
    await page.getByRole('button', { name: 'Visita guiada' }).click();
    await expect(page).toHaveURL(/#niveles$/);

    const card = page.getByRole('region', { name: /Dos formas de empezar/i });
    await expect(card).toBeVisible();
    await expect(card.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');

    await page.keyboard.press('Escape');
    await expect(page.locator('[data-tour-resume]')).toBeVisible();
    await page.locator('[data-tour-resume]').click();
    await expect(card).toBeVisible();

    const destinations = [
      /\/temas\/$/,
      /\/demos\/pinadamar\/$/,
      /\/demos\/pinadamar\/#contacto$/,
      /\/demos\/pinadamar\/gestion\/#\/$/,
      /#\/planning$/,
      /#\/solicitudes$/,
      /#\/informes$/,
      /#\/notificaciones$/,
    ];
    for (const destination of destinations) {
      await page.locator('[data-tour-next]').click();
      await expect(page).toHaveURL(destination);
      await expect(page.locator('.lc-tour-card')).toBeVisible();
    }

    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '9');
    await page.getByRole('button', { name: 'Seguir explorando' }).click();
    await expect(page.locator('.lc-tour-card')).toHaveCount(0);
    await expect
      .poll(() => page.evaluate(() => sessionStorage.getItem('logic2b:camp-tour:v1')))
      .toBeNull();
    expect(mutations).toEqual([]);
  });

  test('la tarjeta móvil conserva acciones y objetivo visibles a 320 px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto('/');
    await page.locator('[data-camp-tour-trigger]').click();
    await page.getByRole('button', { name: 'Visita guiada' }).click();

    const card = page.locator('.lc-tour-card');
    await expect(card).toBeVisible();
    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
    await expect(card.locator('[data-tour-pause]')).toBeVisible();
    await expect(card.locator('[data-tour-next]')).toBeVisible();
    await expect(page.locator('#niveles')).toBeVisible();
  });
});
