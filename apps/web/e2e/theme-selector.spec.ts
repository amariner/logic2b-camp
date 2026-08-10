import { expect, test } from '@playwright/test';
import { WEB } from './base';

test('tema por URL se aplica antes del paint, persiste y vuelve al predeterminado', async ({
  page,
}) => {
  await page.goto(`${WEB}/?tema=nit`);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'nit');
  await expect(page.locator('#lc-tema button[data-tema="nit"]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(await page.evaluate(() => localStorage.getItem('lc-theme'))).toBe('nit');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe(
    'dark',
  );

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'nit');

  await page.locator('#lc-tema summary').click();
  await page.locator('#lc-tema button[data-tema="mar"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'mar');
  await expect(page).toHaveURL(/\?tema=mar$/);
  expect(await page.evaluate(() => localStorage.getItem('lc-theme'))).toBe('mar');

  await page.locator('#lc-tema summary').click();
  await page.locator('#lc-tema button[data-tema="pinada"]').click();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme');
  await expect(page).not.toHaveURL(/tema=/);
  expect(await page.evaluate(() => localStorage.getItem('lc-theme'))).toBeNull();
});

test('tema desconocido cae al valor persistido y limpia la URL inválida', async ({ page }) => {
  await page.goto(`${WEB}/?tema=garriga`);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'garriga');

  await page.goto(`${WEB}/?tema=no-existe`);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'garriga');
  await expect(page).not.toHaveURL(/tema=/);
});
