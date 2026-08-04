import { expect, test, type Page } from '@playwright/test';

const VIEWPORTS = [320, 375, 430] as const;

async function entrarEnDemo(page: Page) {
  await page.goto('/admin/');
  await page.getByRole('button', { name: 'Ver la demo' }).click();
  await expect(page.getByRole('heading', { name: 'Hoy en el camping' })).toBeVisible({
    timeout: 20_000,
  });
}

async function topDelBloque(page: Page, heading: string) {
  return page.getByRole('heading', { name: heading }).evaluate((node) => {
    const section = node.closest('section');
    if (!section) throw new Error(`El encabezado «${node.textContent}» no está dentro de section`);
    return section.getBoundingClientRect().top;
  });
}

test('dashboard: la portada y el shell responden entre móvil y escritorio', async ({ page }) => {
  await page.setViewportSize({ width: VIEWPORTS[0], height: 812 });
  await entrarEnDemo(page);

  // Una sola sesión de demo recorre todos los anchos: además de ser más rápida,
  // evita que la propia regresión consuma el rate limit de autenticación.
  for (const width of VIEWPORTS) {
    await page.setViewportSize({ width, height: 812 });

    // En móvil, las listas operativas aparecen antes que el catálogo de módulos.
    expect(await topDelBloque(page, 'Entradas de hoy')).toBeLessThan(
      await topDelBloque(page, 'Todo el gestor'),
    );
    expect(await topDelBloque(page, 'Últimas solicitudes')).toBeLessThan(
      await topDelBloque(page, 'Todo el gestor'),
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);

    const menu = page.getByRole('button', { name: 'Abrir el menú' });
    const search = page.getByRole('button', { name: 'Buscar' });
    for (const control of [menu, search]) {
      const box = await control.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }

    // La entrada táctil abre exactamente la misma paleta que ⌘K, con foco en
    // el campo, y devuelve el foco a su origen al cerrar.
    await search.click();
    const searchDialog = page.getByRole('dialog', {
      name: 'Buscar reserva, cliente o unidad…',
    });
    await expect(searchDialog).toBeVisible();
    await expect(searchDialog.getByPlaceholder('Buscar reserva, cliente o unidad…')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(searchDialog).toHaveCount(0);
    await expect(search).toBeFocused();

    // El menú entra por la primera ruta útil, no por el selector de tema, y
    // Escape vuelve al botón que lo abrió gracias al SheetTrigger real.
    await menu.click();
    const menuDialog = page.getByRole('dialog', { name: 'Menú' });
    await expect(menuDialog).toBeVisible();
    await expect(menuDialog.getByRole('link', { name: 'Inicio' })).toBeFocused();
    const close = menuDialog.getByRole('button', { name: 'Cerrar' });
    const closeBox = await close.boundingBox();
    expect(closeBox?.width).toBeGreaterThanOrEqual(44);
    expect(closeBox?.height).toBeGreaterThanOrEqual(44);
    await page.keyboard.press('Escape');
    await expect(menuDialog).toHaveCount(0);
    await expect(menu).toBeFocused();
  }

  await page.setViewportSize({ width: 1366, height: 900 });
  expect(await topDelBloque(page, 'Todo el gestor')).toBeLessThan(
    await topDelBloque(page, 'Entradas de hoy'),
  );

  // El nuevo disparador no sustituye el contrato de escritorio: el atajo sigue
  // abriendo la misma instancia controlada de la paleta.
  await page.keyboard.press('Control+K');
  const shortcutDialog = page.getByRole('dialog', {
    name: 'Buscar reserva, cliente o unidad…',
  });
  await expect(shortcutDialog).toBeVisible();
  await expect(shortcutDialog.getByPlaceholder('Buscar reserva, cliente o unidad…')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(shortcutDialog).toHaveCount(0);
});
