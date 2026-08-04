import { expect, test, type Page } from '@playwright/test';

async function entrarEnDemo(page: Page) {
  await page.goto('/admin/');
  await page.getByRole('button', { name: 'Ver la demo' }).click();
  await expect(page.getByRole('heading', { name: 'Hoy en el camping' })).toBeVisible({
    timeout: 20_000,
  });
}

test('dashboard: las pantallas densas se cargan por ruta y quedan en caché', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });

  const scripts: string[] = [];
  const fonts: string[] = [];
  page.on('response', (response) => {
    const url = response.url();
    if (/\/admin\/assets\/.*\.js$/.test(url)) scripts.push(url);
    if (/\/admin\/assets\/.*\.woff2$/.test(url)) fonts.push(url);
  });

  await entrarEnDemo(page);

  // La portada puede pedir su pequeño chunk, nunca los dos módulos densos.
  expect(scripts.some((url) => /\/Planning-[^/]+\.js$/.test(url))).toBe(false);
  expect(scripts.some((url) => /\/Plano-[^/]+\.js$/.test(url))).toBe(false);
  expect(fonts.every((url) => /-latin-/.test(url))).toBe(true);

  await page.goto('/admin/#/planning');
  await expect(page.getByRole('region', { name: 'Agenda del planning' })).toBeVisible({
    timeout: 20_000,
  });
  expect(scripts.filter((url) => /\/Planning-[^/]+\.js$/.test(url))).toHaveLength(1);
  expect(scripts.some((url) => /\/Plano-[^/]+\.js$/.test(url))).toBe(false);

  await page.goto('/admin/#/plano');
  await expect(page.getByRole('application', { name: /Plano del camping/ })).toBeVisible({
    timeout: 20_000,
  });
  expect(scripts.filter((url) => /\/Plano-[^/]+\.js$/.test(url))).toHaveLength(1);

  // Volver no inicia otra descarga: el import dinámico resuelto se conserva.
  await page.goto('/admin/#/planning');
  await expect(page.getByRole('region', { name: 'Agenda del planning' })).toBeVisible({
    timeout: 20_000,
  });
  expect(scripts.filter((url) => /\/Planning-[^/]+\.js$/.test(url))).toHaveLength(1);
});
