import { expect, test, type Page } from './fixtures';
import { WEB } from './base';

const contact = (page: Page) => page.locator('[data-logic2b-contact]').first();

test('la web tenant ofrece Logic2B tras scroll y lo retira ante el pie', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${WEB}/`);

  const link = contact(page);
  await expect(link).toHaveCount(1);
  await expect(link).toHaveAttribute('data-contact-context', 'tenant');
  await expect(link).toHaveAttribute('data-visible', 'false');
  await expect(link).toHaveAttribute('tabindex', '-1');
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', 'noopener noreferrer');

  await page.evaluate(() => window.scrollTo(0, 360));
  await expect(link).toHaveAttribute('data-visible', 'true');
  await expect(link).toHaveAttribute('tabindex', '0');
  await expect(link).toBeVisible();
  await expect(link).toContainText('Logic2B');
  const href = new URL((await link.getAttribute('href'))!);
  expect(`${href.origin}${href.pathname}`).toBe('https://wa.me/34626432316');
  expect([...href.searchParams.keys()]).toEqual(['text']);
  expect(href.searchParams.get('text')).not.toMatch(/@|\b\d{3,}\b|reserva|booking|https?:/i);
  const box = await link.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(375 - 15);

  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(link).toHaveAttribute('data-visible', 'false');
  await expect(link).toHaveAttribute('tabindex', '-1');
});

test('el gestor ofrece ayuda Logic2B en login, drawer y sidebar', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/admin/');

  await expect(page.getByRole('heading', { name: 'Entrar al gestor de camping' })).toBeVisible();
  const loginContact = page.getByRole('link', {
    name: 'Pide ayuda sobre el gestor a Logic2B por WhatsApp',
  });
  await expect(loginContact).toBeVisible();
  await expect(loginContact).toHaveAttribute('data-contact-context', 'dashboard');
  await expect(loginContact).toHaveAttribute('target', '_blank');
  await expect(loginContact).toHaveAttribute('rel', 'noopener noreferrer');
  const loginBox = await loginContact.boundingBox();
  expect(loginBox?.height).toBeGreaterThanOrEqual(44);
  const href = await loginContact.getAttribute('href');

  await page.getByRole('button', { name: 'Ver la demo' }).click();
  await expect(page.getByRole('heading', { name: 'Hoy en el camping' })).toBeVisible({
    timeout: 20_000,
  });
  await page.getByRole('button', { name: 'Abrir el menú' }).click();
  const drawer = page.getByRole('dialog', { name: 'Menú' });
  const drawerContact = drawer.getByRole('link', {
    name: 'Pide ayuda sobre el gestor a Logic2B por WhatsApp',
  });
  await expect(drawerContact).toBeVisible();
  const drawerBox = await drawerContact.boundingBox();
  expect(drawerBox?.height).toBeGreaterThanOrEqual(44);
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();

  await page.setViewportSize({ width: 1366, height: 900 });
  await expect(page.getByRole('heading', { name: 'Hoy en el camping' })).toBeVisible();
  const sidebarContact = page.locator('aside [data-logic2b-contact]');
  await expect(sidebarContact).toBeVisible();
  await expect(sidebarContact).toHaveAccessibleName(
    'Pide ayuda sobre el gestor a Logic2B por WhatsApp',
  );
  expect(await sidebarContact.getAttribute('href')).toBe(href);
});
