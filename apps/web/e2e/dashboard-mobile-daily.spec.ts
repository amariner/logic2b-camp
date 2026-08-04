import { expect, test, type Locator, type Page } from '@playwright/test';

const VIEWPORTS = [320, 375, 430] as const;

async function entrarEnDemo(page: Page) {
  await page.goto('/admin/');
  await page.getByRole('button', { name: 'Ver la demo' }).click();
  await expect(page.getByRole('heading', { name: 'Hoy en el camping' })).toBeVisible({
    timeout: 20_000,
  });
}

async function abrirRuta(page: Page, ruta: string, testigo: Locator) {
  await page.goto(`/admin/#${ruta}`);
  await expect(testigo).toBeVisible({ timeout: 20_000 });
}

async function esperar44(control: Locator) {
  const box = await control.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);
}

async function sinDesborde(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
}

test('dashboard: la operación del día se puede tocar con una mano', async ({ page }) => {
  await page.setViewportSize({ width: VIEWPORTS[0], height: 812 });
  await entrarEnDemo(page);

  // Igual que la regresión del shell: una sesión recorre la matriz de anchos y
  // no convierte el rate limit del login demo en parte accidental de la prueba.
  for (const width of VIEWPORTS) {
    await page.setViewportSize({ width, height: 812 });

    const date = page.getByLabel('Día que se muestra');
    await abrirRuta(page, '/llegadas', date);
    await sinDesborde(page);

    for (const control of [
      page.getByRole('button', { name: 'Día anterior' }),
      page.getByRole('button', { name: 'Hoy', exact: true }),
      page.getByRole('button', { name: 'Día siguiente' }),
      date,
    ]) {
      await esperar44(control);
    }
    expect(await date.evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize))).toBe(
      16,
    );

    const checkin = page.getByRole('button', { name: 'Check-in' }).first();
    const checkout = page.getByRole('button', { name: 'Check-out' }).first();
    await expect(checkin).toBeVisible();
    await expect(checkout).toBeVisible();
    await esperar44(checkin);
    await esperar44(checkout);
    await esperar44(page.getByRole('button', { name: /Abrir la ficha de/ }).first());

    // Check-out mantiene la confirmación que explica el cierre de cuenta. Se
    // cancela para que la regresión no modifique la D1 compartida.
    await checkout.click();
    const confirmation = page.getByRole('alertdialog');
    await expect(confirmation).toBeVisible();
    await expect(
      confirmation.getByRole('heading', { name: '¿Cerrar la cuenta y hacer check-out?' }),
    ).toBeVisible();
    const back = confirmation.getByRole('button', { name: 'Volver' });
    const confirm = confirmation.getByRole('button', { name: 'Check-out' });
    await esperar44(back);
    await esperar44(confirm);
    await back.click();
    await expect(confirmation).toHaveCount(0);
    await expect(checkout).toBeFocused();

    const allFilter = page.getByRole('button', { name: /^Todas ·/ });
    await abrirRuta(page, '/solicitudes', allFilter);
    await sinDesborde(page);

    const filterBar = allFilter.locator('..');
    const filters = filterBar.getByRole('button');
    expect(await filters.count()).toBe(6);
    for (let i = 0; i < (await filters.count()); i++) await esperar44(filters.nth(i));

    // Los filtros crecen hacia un scroll local de una línea, no hacia tres
    // filas que aparten las solicitudes de la pantalla.
    const filterTops = await filters.evaluateAll((nodes) =>
      nodes.map((node) => node.getBoundingClientRect().top),
    );
    expect(new Set(filterTops).size).toBe(1);

    const actionable = page
      .locator('li')
      .filter({ has: page.locator('.sol-new, .sol-contacted, .sol-quoted, .sol-lost') })
      .first();
    const row = actionable.locator('button[aria-expanded]');
    await expect(row).toBeVisible();
    await esperar44(row);
    await row.click();

    const statusActions = actionable.getByRole('button', { name: /^(Marcar|Reabrir)/ });
    expect(await statusActions.count()).toBeGreaterThan(0);
    for (let i = 0; i < (await statusActions.count()); i++) {
      await esperar44(statusActions.nth(i));
    }
    await esperar44(actionable.getByRole('link', { name: /@/ }));
  }

  // La densidad de escritorio es parte del contrato: los mismos controles
  // vuelven a 28px cuando hay ratón y espacio de mostrador.
  await page.setViewportSize({ width: 1366, height: 900 });
  const desktopFilter = page.getByRole('button', { name: /^Todas ·/ });
  const desktopFilterBox = await desktopFilter.boundingBox();
  expect(desktopFilterBox?.height).toBe(28);

  const date = page.getByLabel('Día que se muestra');
  await abrirRuta(page, '/llegadas', date);
  const desktopCheckin = await page.getByRole('button', { name: 'Check-in' }).first().boundingBox();
  expect(desktopCheckin?.height).toBe(28);
});
