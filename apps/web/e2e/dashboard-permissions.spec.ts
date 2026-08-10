import { expect, test, type Page } from '@playwright/test';

async function entrarEnDemo(page: Page) {
  await page.goto('/admin/');
  await page.getByRole('button', { name: 'Ver la demo' }).click();
  await expect(page.getByRole('heading', { name: 'Hoy en el camping' })).toBeVisible({
    timeout: 20_000,
  });
}

async function ir(page: Page, route: string) {
  await page.evaluate((next) => {
    window.location.hash = next;
  }, `#${route}`);
  await expect(page).toHaveURL(new RegExp(`#${route.replaceAll('/', '\\/')}$`));
}

test('dashboard: demo solo ve las mutaciones que el servidor le permite completar', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await entrarEnDemo(page);

  await ir(page, '/planning');
  await expect(page.locator('.lc-bar').first()).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('.lc-bar.lc-grab').first()).toBeVisible();
  await expect(page.locator('.lc-handle').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Nueva reserva' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Nuevo bloqueo' })).toHaveCount(0);
  await expect(page.locator('.lc-block[role="button"]')).toHaveCount(0);

  await ir(page, '/reservas');
  await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole('button', { name: 'Nueva reserva' })).toHaveCount(0);
  await page.locator('tbody tr').first().click();
  const booking = page.getByRole('dialog');
  await expect(booking).toBeVisible();
  await expect(booking.getByRole('button', { name: 'Añadir huésped' })).toHaveCount(0);
  await expect(booking.getByRole('button', { name: 'Registrar cobro' })).toHaveCount(0);
  await expect(booking.getByRole('button', { name: 'Guardar nota' })).toHaveCount(0);
  await expect(booking.getByRole('button', { name: 'Cancelar reserva' })).toHaveCount(0);

  await ir(page, '/solicitudes');
  const enquiry = page.locator('main li > button[aria-expanded]').first();
  await expect(enquiry).toBeVisible({ timeout: 20_000 });
  await enquiry.click();
  await expect(
    page.getByRole('button', {
      name: /Marcar contactada|Marcar presupuestada|Marcar convertida|Marcar perdida|Reabrir/,
    }),
  ).toHaveCount(0);

  await ir(page, '/inventario');
  await expect(page.getByText(/en servicio/)).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('button[title="Dar de baja"]')).toHaveCount(0);
  await expect(page.locator('button[title="Dar de alta"]')).toHaveCount(0);

  await ir(page, '/tarifas');
  const rateInputs = page.locator('tbody input');
  await expect(rateInputs.first()).toBeVisible({ timeout: 20_000 });
  expect(await rateInputs.count()).toBeGreaterThan(0);
  expect(
    await rateInputs.evaluateAll((inputs) =>
      inputs.every((input) => input.hasAttribute('disabled')),
    ),
  ).toBe(true);
  await expect(page.getByRole('button', { name: 'Guardar' })).toHaveCount(0);

  await ir(page, '/ajustes');
  const name = page.locator('#aju-nombre');
  await expect(name).toBeVisible({ timeout: 20_000 });
  await expect(name).toBeDisabled();
  await expect(page.locator('#aju-notif-to')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Guardar los ajustes' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Guardar notificaciones' })).toHaveCount(0);
});
