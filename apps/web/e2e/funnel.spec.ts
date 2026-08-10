/**
 * E2E del flujo de reserva (ADR 0007): camino feliz + los 3 infelices.
 * Corre contra el Worker real (web estática + API + D1 local sembrada).
 */
import { expect, test, type APIRequestContext } from './fixtures';
import { estanciaLibre, WEB } from './base';

// Fechas preguntadas a la API, no inventadas: ver `estanciaLibre` en base.ts —
// las de antes (`10 + minutos % 12`) caían en septiembre lleno 4 de cada 12
// minutos y reciclaban holds vivos, y la suite fallaba por el reloj.
let FROM: string;
let TO: string;
let QS: string;

test.beforeAll(async ({ request }) => {
  ({ from: FROM, to: TO, qs: QS } = await estanciaLibre(request));
});

const hold = (api: APIRequestContext, unitTypeId: string, dateFrom: string, dateTo: string) =>
  api.post('/api/holds', { data: { unitTypeId, dateFrom, dateTo } });

test('camino feliz: buscar → detalle → titular con hold → confirmada → planning', async ({
  page,
}) => {
  // paso 1: resultados por deep-link
  await page.goto(`${WEB}/reservar?${QS}`);
  await expect(page.locator('ul li h3').first()).toBeVisible();

  // paso 2: detalle del glamping con desglose del servidor; un extra re-cotiza
  await page.goto(`${WEB}/reservar/ut_glamp?${QS}`);
  const quote = page.waitForResponse('**/api/quote');
  await page.locator('label', { hasText: 'Ropa de cama' }).locator('input').check();
  await quote;
  await expect(page).toHaveURL(/extras=ext_sabanas/);

  // paso 3: titular — el hold aparece con contador
  await page.locator('a', { hasText: 'Continuar' }).click();
  await expect(page.locator('[role=timer]')).toBeVisible();

  // paso 4: confirmar
  await page.fill('input[name=name]', 'E2E Feliz');
  await page.fill('input[name=email]', 'e2e-feliz@example.com');
  await page.locator('input[type=checkbox][required]').check();
  await page.locator('button[type=submit]').click();

  // confirmación: código visible en el resguardo
  await expect(page).toHaveURL(/\/reserva\/?\?/);
  const codigo = (await page.locator('.font-display.tnum').first().textContent())!.trim();
  expect(codigo).toMatch(/^CS-2026-/);

  // criterio de fase: la reserva aparece en el planning (SELECT del dashboard)
  const login = await page.request.post('/api/auth/sign-in/email', {
    data: { email: 'recepcion@calasereno.example', password: 'calasereno' },
  });
  expect(login.ok()).toBe(true);
  const planning = await page.request.get(`/api/admin/planning?from=${FROM}&to=${TO}`);
  expect(JSON.stringify(await planning.json())).toContain(codigo);

  // limpieza: cancelar desde la propia página de gestión
  await page.locator('button', { hasText: 'Cancelar la reserva' }).click();
  await page.locator('button', { hasText: 'Sí, cancelar' }).click();
  await expect(page.locator('text=Cancelada').first()).toBeVisible();
});

test('infeliz 1: el tipo se agota entre el detalle y el titular', async ({ page, request }) => {
  // agotar las 5 tiendas glamping con holds ajenos
  const ids: string[] = [];
  for (let i = 0; i < 5; i++) {
    const r = await hold(request, 'ut_glamp', FROM, TO);
    if (r.status() === 201) ids.push(((await r.json()) as { holdId: string }).holdId);
  }
  expect(ids.length).toBeGreaterThan(0);

  await page.goto(`${WEB}/reservar/ut_glamp/titular?${QS}`);
  // sin hueco: aviso claro y vuelta a los resultados, sin cobrar nada
  await expect(page.locator('text=/última unidad/')).toBeVisible();

  for (const id of ids) await request.delete(`/api/holds/${id}`);
});

test('infeliz 2: el hold caduca al confirmar — se avisa y el reintento revalida', async ({
  page,
  request,
}) => {
  await page.goto(`${WEB}/reservar/ut_glamp/titular?${QS}`);
  const holdRes = await page.waitForResponse('**/api/holds');
  const { holdId } = (await holdRes.json()) as { holdId: string };
  await expect(page.locator('[role=timer]')).toBeVisible();

  // el hold muere fuera de la página (simula la caducidad de los 15 min)
  await request.delete(`/api/holds/${holdId}`);

  await page.fill('input[name=name]', 'E2E Caducado');
  await page.fill('input[name=email]', 'e2e-caducado@example.com');
  await page.locator('input[type=checkbox][required]').check();
  await page.locator('button[type=submit]').click();

  // aviso sin perder los datos del formulario
  await expect(page.locator('text=/caducado/')).toBeVisible();
  await expect(page.locator('input[name=name]')).toHaveValue('E2E Caducado');

  // reintento: el servidor revalida disponibilidad y confirma
  await page.locator('button[type=submit]').click();
  await expect(page).toHaveURL(/\/reserva\/?\?/, { timeout: 20_000 });

  // limpieza
  await page.locator('button', { hasText: 'Cancelar la reserva' }).click();
  await page.locator('button', { hasText: 'Sí, cancelar' }).click();
  await expect(page.locator('text=Cancelada').first()).toBeVisible();
});

test('infeliz 3: estancia inválida en alta — errores i18n del motor en el detalle', async ({
  page,
}) => {
  // bungalow 6 en agosto: mínimo 7 noches y llegada en sábado → 2 noches entre semana falla
  await page.goto(`${WEB}/reservar/ut_bung6?from=2026-08-03&to=2026-08-05&adults=2&children=0`);
  await expect(page.locator('text=/Estancia mínima de 7 noches/')).toBeVisible();
  await expect(page.locator('text=/llegada es en sábado/')).toBeVisible();
  // y sin botón de continuar: no se puede avanzar con una estancia inválida
  await expect(page.locator('a', { hasText: 'Continuar' })).toHaveCount(0);
});
