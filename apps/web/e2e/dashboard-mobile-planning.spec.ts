import { expect, test, type Locator, type Page } from './fixtures';

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

test('dashboard: Planning móvil es una agenda táctil y conserva el tape chart', async ({
  page,
}) => {
  await page.setViewportSize({ width: VIEWPORTS[0], height: 812 });
  await entrarEnDemo(page);

  // Una sesión demo recorre los tres anchos: el rate limit no forma parte de
  // esta regresión de interfaz.
  for (const width of VIEWPORTS) {
    await page.setViewportSize({ width, height: 812 });
    await page.goto('/admin/#/planning');

    const agenda = page.getByRole('region', { name: 'Agenda del planning' });
    await expect(agenda).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByRole('region', { name: 'Calendario completo del planning' }),
    ).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);

    const date = page.getByLabel('Día inicial de la agenda');
    for (const control of [
      page.getByRole('button', { name: 'Periodo anterior' }),
      page.getByRole('button', { name: 'Hoy', exact: true }),
      page.getByRole('button', { name: 'Periodo siguiente' }),
      page.getByRole('button', { name: 'Día', exact: true }),
      page.getByRole('button', { name: 'Semana', exact: true }),
      date,
    ]) {
      await esperar44(control);
    }
    expect(await date.evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize))).toBe(
      16,
    );

    const week = page.getByRole('button', { name: 'Semana', exact: true });
    await week.click();
    await expect(week).toHaveAttribute('aria-pressed', 'true');
    await expect(agenda.getByRole('heading', { level: 2 })).toHaveCount(7);

    const openBooking = agenda.getByRole('button', { name: /Abrir la ficha de/ }).first();
    const openUnit = agenda.getByRole('button', { name: /Ver .* en el plano/ }).first();
    const editStay = agenda.getByRole('button', { name: /Cambiar fechas o unidad de/ }).first();
    await expect(openBooking).toBeVisible();
    await esperar44(openBooking);
    await esperar44(openUnit);
    await esperar44(editStay);

    await openBooking.click();
    const bookingSheet = page.getByRole('dialog');
    await expect(bookingSheet).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(bookingSheet).toHaveCount(0);
    await expect(openBooking).toBeFocused();

    await editStay.click();
    const editor = agenda.getByRole('group', { name: /Cambiar estancia/ }).first();
    await expect(editor).toBeVisible();
    for (const control of [
      editor.getByLabel('Entrada'),
      editor.getByLabel('Salida'),
      editor.getByLabel('Unidad'),
      editor.getByRole('button', { name: 'Dejarlo como estaba' }),
      editor.getByRole('button', { name: 'Aplicar cambio' }),
    ]) {
      await esperar44(control);
    }
    const editableSizes = await editor
      .locator('input, select')
      .evaluateAll((nodes) =>
        nodes.map((node) => Number.parseFloat(getComputedStyle(node).fontSize)),
      );
    expect(editableSizes.every((size) => size >= 16)).toBe(true);
    await editor.getByRole('button', { name: 'Dejarlo como estaba' }).click();
    await expect(editor).toHaveCount(0);
    await expect(editStay).toBeFocused();
  }

  // A partir de `md` no coexisten dos modelos interactivos: vuelve el chart
  // firma con sus controles compactos de escritorio.
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/admin/#/planning');
  const tape = page.getByRole('region', { name: 'Calendario completo del planning' });
  await expect(tape).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole('region', { name: 'Agenda del planning' })).toHaveCount(0);
  expect((await page.getByRole('button', { name: 'Periodo anterior' }).boundingBox())?.height).toBe(
    28,
  );
});
