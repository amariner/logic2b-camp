import { expect, test } from './fixtures';

test('la demo se actualiza sin borrar ni renovar la sesión', async ({ page }) => {
  await page.goto('/admin/');
  await page.getByRole('button', { name: 'Ver la demo' }).click();
  await expect(page.getByRole('heading', { name: 'Hoy en el camping' })).toBeVisible({
    timeout: 20_000,
  });

  await page.getByRole('button', { name: 'Actualizar demo' }).click();
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();

  const resetResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/demo/reset') && response.request().method() === 'POST',
  );
  await dialog.getByRole('button', { name: 'Actualizar demo' }).click();

  const reset = await resetResponse;
  expect(reset.ok()).toBe(true);
  await expect(page.getByText('La demo ya está en su versión semanal.')).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Hoy en el camping' })).toBeVisible({
    timeout: 20_000,
  });
});
