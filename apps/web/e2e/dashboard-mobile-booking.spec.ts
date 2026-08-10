import { expect, test } from '@playwright/test';

const VIEWPORTS = [320, 375, 430] as const;

for (const width of VIEWPORTS) {
  test(`dashboard: ficha móvil completa, accesible y sin desborde a ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 812 });
    const login = await page.request.post('/api/auth/sign-in/email', {
      data: { email: 'recepcion@calasereno.example', password: 'calasereno' },
    });
    expect(login.ok()).toBe(true);
    await page.goto('/admin/');
    await expect(page.locator('h1', { hasText: 'Hoy en el camping' })).toBeVisible({
      timeout: 20_000,
    });

    // Recepción tampoco recibe una puerta reservada a gerencia.
    expect(await page.getByRole('link', { name: 'Parte de viajeros' }).count()).toBe(0);

    await page.goto('/admin/#/llegadas');
    const opener = page.getByRole('button', { name: /Abrir la ficha de/ }).first();
    await expect(opener).toBeVisible({ timeout: 20_000 });
    await opener.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect
      .poll(() => dialog.evaluate((node) => node.contains(document.activeElement)))
      .toBe(true);
    // `toBeVisible` coincide desde el primer fotograma del slide-in; la medida
    // estable empieza cuando el borde de la hoja ya alcanzó el viewport.
    await expect.poll(() => dialog.evaluate((node) => node.getBoundingClientRect().left)).toBe(0);

    const geometry = await dialog.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        width: rect.width,
        scrollWidth: node.scrollWidth,
        viewport: document.documentElement.clientWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
      };
    });
    expect(geometry.left).toBe(0);
    expect(geometry.right).toBe(width);
    expect(geometry.width).toBe(width);
    expect(geometry.scrollWidth).toBeLessThanOrEqual(width);
    expect(geometry.documentScrollWidth).toBeLessThanOrEqual(geometry.viewport);

    const close = page.getByRole('button', { name: 'Cerrar la ficha' });
    const closeBox = await close.boundingBox();
    expect(closeBox?.width).toBeGreaterThanOrEqual(44);
    expect(closeBox?.height).toBeGreaterThanOrEqual(44);

    const editableSizes = await dialog
      .locator('input, select, textarea')
      .evaluateAll((nodes) =>
        nodes.map((node) => Number.parseFloat(getComputedStyle(node).fontSize)),
      );
    expect(editableSizes.length).toBeGreaterThan(0);
    expect(editableSizes.every((size) => size >= 16)).toBe(true);

    // La cabecera sigue al alcance aunque la cuenta se haya recorrido entera.
    await dialog.evaluate((node) => node.scrollTo({ top: node.scrollHeight }));
    await expect(close).toBeInViewport();

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();
  });
}
