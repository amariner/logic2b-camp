import { expect, test, type Page } from '@playwright/test';
import { estanciaLibre } from './base';

type BookingItem = {
  id: string;
  code: string;
  status: string;
  checkedInAt: string | null;
  checkedOutAt: string | null;
};

async function entrarComoRecepcion(page: Page) {
  const login = await page.request.post('/api/auth/sign-in/email', {
    data: { email: 'recepcion@calasereno.example', password: 'calasereno' },
  });
  expect(login.ok()).toBe(true);
}

async function abrirReserva(page: Page, booking: BookingItem) {
  await page.goto('/admin/#/reservas');
  const search = page.getByRole('searchbox', { name: 'Buscar por código…' });
  await search.fill(booking.code);
  const row = page.locator('tbody tr').filter({ hasText: booking.code });
  await expect(row).toBeVisible({ timeout: 20_000 });
  await row.click();
  const ficha = page.getByRole('dialog');
  await expect(ficha).toBeVisible();
  return ficha;
}

test('alta manual: el catálogo puede reintentarse y crear espera la cotización vigente', async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await entrarComoRecepcion(page);
  const { from, to } = await estanciaLibre(request);

  await page.route('**/api/admin/catalog', async (route) => {
    await route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
  });
  await page.goto('/admin/#/reservas');
  await page.getByRole('button', { name: 'Nueva reserva' }).click();

  const alta = page.getByRole('dialog', { name: 'Nueva reserva' });
  await expect(alta.getByText('No se ha podido cargar')).toBeVisible({ timeout: 20_000 });

  await page.unroute('**/api/admin/catalog');
  await alta.getByRole('button', { name: 'Reintentar' }).click();
  const tipo = alta.locator('#alta-tipo');
  await expect(tipo).toBeVisible();

  await page.route('**/api/quote', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    await route.continue();
  });
  await alta.getByLabel('Nombre y apellidos').fill('Reserva E2E');
  await alta.getByLabel('Email').fill('reserva-e2e@example.com');
  await tipo.selectOption('ut_glamp');
  await alta.locator('input[type="date"]').nth(0).fill(from);
  await alta.locator('input[type="date"]').nth(1).fill(to);

  const crear = alta.getByRole('button', { name: 'Crear la reserva' });
  await expect(alta.getByText('Cotizando…')).toBeVisible();
  await expect(crear).toBeDisabled();
  await expect(alta.getByText('Total', { exact: true })).toBeVisible({ timeout: 20_000 });
  await expect(crear).toBeEnabled();
});

test('ficha: las transiciones terminales confirman y una estancia en casa se cierra por check-out', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await entrarComoRecepcion(page);

  const response = await page.request.get(
    '/api/admin/bookings?page=1&pageSize=100&status=confirmed',
  );
  expect(response.ok()).toBe(true);
  const { items } = (await response.json()) as { items: BookingItem[] };
  const sinCheckin = items.find((item) => !item.checkedInAt);
  test.skip(!sinCheckin, 'El seed no contiene una reserva confirmada pendiente de check-in.');

  const ficha = await abrirReserva(page, sinCheckin!);

  await ficha.getByRole('button', { name: 'No presentada' }).click();
  let confirmacion = page.getByRole('alertdialog');
  await expect(confirmacion.getByText(/¿Marcar .* como no presentada\?/)).toBeVisible();
  await expect(confirmacion.getByText(/no se puede deshacer/)).toBeVisible();
  await confirmacion.getByRole('button', { name: 'Volver' }).click();

  await ficha.getByRole('button', { name: 'Completar' }).click();
  confirmacion = page.getByRole('alertdialog');
  await expect(confirmacion.getByText(/¿Completar la reserva/)).toBeVisible();
  await expect(confirmacion.getByText(/usa el check-out/)).toBeVisible();
  await confirmacion.getByRole('button', { name: 'Volver' }).click();

  const enCasa = items.find((item) => item.checkedInAt && !item.checkedOutAt);
  if (!enCasa) return;

  const fichaEnCasa = await abrirReserva(page, enCasa);
  await expect(fichaEnCasa.getByRole('button', { name: 'Check-out' })).toBeVisible();
  await expect(fichaEnCasa.getByRole('button', { name: 'Cancelar reserva' })).toHaveCount(0);
  await expect(fichaEnCasa.getByRole('button', { name: 'No presentada' })).toHaveCount(0);
  await expect(fichaEnCasa.getByRole('button', { name: 'Completar' })).toHaveCount(0);
});
