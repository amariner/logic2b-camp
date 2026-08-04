import { expect, test, type Locator, type Page } from '@playwright/test';

const VIEWPORTS = [320, 375, 430] as const;

async function entrarEnDemo(page: Page) {
  await page.goto('/admin/');
  await page.getByRole('button', { name: 'Ver la demo' }).click();
  await expect(page.getByRole('heading', { name: 'Hoy en el camping' })).toBeVisible({
    timeout: 20_000,
  });
}

async function esperar44(control: Locator) {
  const box = await control.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);
}

async function abrirPlano(page: Page) {
  await page.goto('/admin/#/plano');
  const map = page.getByRole('application', { name: /Plano del camping/ });
  await expect(map).toBeVisible({ timeout: 20_000 });
  return map;
}

test('dashboard: el plano móvil ofrece escala táctil, scroll libre y ficha inferior', async ({
  page,
}) => {
  await page.setViewportSize({ width: VIEWPORTS[0], height: 812 });
  await entrarEnDemo(page);

  // Una sola sesión demo recorre los tres anchos para no convertir el rate
  // limit del acceso anónimo en parte accidental de esta regresión.
  for (const width of VIEWPORTS) {
    await page.setViewportSize({ width, height: 812 });
    const map = await abrirPlano(page);

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);

    const date = page.getByLabel('Día que se muestra');
    for (const control of [
      page.getByRole('button', { name: 'Día anterior' }),
      page.getByRole('button', { name: 'Hoy', exact: true }),
      page.getByRole('button', { name: 'Día siguiente' }),
      date,
      page.getByRole('button', { name: 'Acercar' }),
      page.getByRole('button', { name: 'Alejar' }),
      page.getByRole('button', { name: 'Ajustar a la pantalla' }),
      page.getByRole('button', { name: 'Mover plano' }),
    ]) {
      await esperar44(control);
    }
    expect(await date.evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize))).toBe(
      16,
    );

    // Por defecto un dedo vertical pertenece a la página. El modo explícito de
    // movimiento captura el gesto y puede abandonarse con el mismo botón.
    expect(await map.evaluate((node) => getComputedStyle(node).touchAction)).toBe('pan-y');
    await page.getByRole('button', { name: 'Mover plano' }).click();
    expect(await map.evaluate((node) => getComputedStyle(node).touchAction)).toBe('none');
    await page.getByRole('button', { name: 'Terminar de mover' }).click();
    expect(await map.evaluate((node) => getComputedStyle(node).touchAction)).toBe('pan-y');

    // La entrada móvil nace ampliada: la primera unidad visible ya es un blanco
    // real de pulgar, no el rectángulo de 10×7px encontrado por M0.
    const units = map.locator('[role="button"]');
    const visibleIndex = await units.evaluateAll((nodes) => {
      const svg = nodes[0]?.ownerSVGElement;
      if (!svg) return -1;
      const viewport = svg.getBoundingClientRect();
      return nodes.findIndex((node) => {
        const rect = node.getBoundingClientRect();
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;
        return (
          centerX >= viewport.left &&
          centerX <= viewport.right - 60 &&
          centerY >= viewport.top &&
          centerY <= viewport.bottom - 60
        );
      });
    });
    expect(visibleIndex).toBeGreaterThanOrEqual(0);
    const visibleUnit = units.nth(visibleIndex);
    await esperar44(visibleUnit);
    await visibleUnit.click();
    const firstDialog = page.getByRole('dialog');
    await expect(firstDialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(firstDialog).toHaveCount(0);
    await expect(visibleUnit).toBeFocused();

    // Una unidad libre conserva Enter/Espacio y abre la variante móvil inferior.
    const freeUnit = map.locator('[role="button"][aria-label$="Libre"]').first();
    await freeUnit.focus();
    await page.keyboard.press('Enter');
    const unitPanel = page.getByRole('dialog', { name: /^Unidad / });
    await expect(unitPanel).toBeVisible();
    await expect
      .poll(() =>
        unitPanel.evaluate((node) => {
          const rect = node.getBoundingClientRect();
          return rect.y + rect.height;
        }),
      )
      .toBe(812);
    const panelBox = await unitPanel.boundingBox();
    expect(panelBox ? panelBox.y + panelBox.height : undefined).toBe(812);
    expect(panelBox?.width).toBe(width);
    expect(panelBox?.height).toBeLessThanOrEqual(812 * 0.6 + 1);
    await esperar44(unitPanel.getByRole('button', { name: 'Cerrar' }));
    await page.keyboard.press('Escape');
    await expect(unitPanel).toHaveCount(0);
    await expect(freeUnit).toBeFocused();

    // El lienzo y las unidades siguen teniendo recorrido de teclado propio.
    await map.focus();
    const before = await map.getAttribute('viewBox');
    await page.keyboard.press('ArrowRight');
    expect(await map.getAttribute('viewBox')).not.toBe(before);
  }

  // Escritorio conserva la densidad de 28px y el encaje completo del recinto.
  await page.setViewportSize({ width: 1366, height: 900 });
  const map = await abrirPlano(page);
  expect(await page.getByRole('button', { name: 'Mover plano' }).count()).toBe(0);
  expect((await page.getByRole('button', { name: 'Acercar' }).boundingBox())?.height).toBe(28);

  const freeUnit = map.locator('[role="button"][aria-label$="Libre"]').first();
  await freeUnit.focus();
  await page.keyboard.press('Enter');
  const desktopPanel = page.getByRole('dialog', { name: /^Unidad / });
  await expect(desktopPanel).toBeVisible();
  expect((await desktopPanel.boundingBox())?.width).toBe(360);
});
