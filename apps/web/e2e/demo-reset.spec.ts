import { expect, test } from './fixtures';

test('la demo se restablece y renueva la sesión sin expulsar al visitante', async ({ page }) => {
  await page.goto('/admin/');
  await page.getByRole('button', { name: 'Ver la demo' }).click();
  await expect(page.getByRole('heading', { name: 'Hoy en el camping' })).toBeVisible({
    timeout: 20_000,
  });

  await page.getByRole('button', { name: 'Restablecer datos' }).click();
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();

  const resetResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/demo/reset') && response.request().method() === 'POST',
  );
  const signInResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/demo/sign-in') && response.request().method() === 'POST',
  );
  await dialog.getByRole('button', { name: 'Restablecer datos' }).click();

  const [reset, signIn] = await Promise.all([resetResponse, signInResponse]);
  expect(reset.ok()).toBe(true);
  expect(signIn.ok()).toBe(true);
  await expect(page.getByText('Demo restablecida.')).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Hoy en el camping' })).toBeVisible({
    timeout: 20_000,
  });
});
