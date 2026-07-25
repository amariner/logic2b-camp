/**
 * Auditoría de `prefers-reduced-motion` (BACKLOG C2) contra el bundle real.
 *
 * Los componentes del DS llevaban `motion-reduce:animate-none`, pero nunca se
 * había comprobado con la preferencia activada. No bastaba: las variantes de
 * Radix (`data-[state=open]:animate-in`) generan `.clase[data-state=open]`
 * —especificidad (0,2,0)— y `motion-reduce:animate-none` vive en un `@media`
 * con especificidad (0,1,0). Las media queries NO suman especificidad, así que
 * la animación ganaba siempre. Este test barre el DOM y falla si algo se mueve.
 *
 * Corre contra el bundle compuesto (raíz = landing Logic2B, /demo/ = web del
 * tenant, /admin/ = dashboard), igual que producción.
 */
import { expect, test, type Page } from '@playwright/test';
import { WEB } from './base';

/* `test.use({ reducedMotion: 'reduce' })` NO llegó a activar la preferencia con
 * esta configuración (matchMedia devolvía false y el barrido pasaba en verde por
 * el motivo equivocado). Se emula por página y se COMPRUEBA en cada barrido. */
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

/** Umbral: por debajo no hay movimiento perceptible (el reset canónico usa 0,01ms). */
const UMBRAL_MS = 40;

type Movimiento = { selector: string; motivo: string };

/**
 * Barre TODO el DOM (incluidos los portales de Radix) y devuelve lo que sigue
 * animándose o transicionando por encima del umbral. Vacío = nada se mueve.
 */
async function loQueSeMueve(page: Page, umbralMs: number): Promise<Movimiento[]> {
  return page.evaluate((umbral) => {
    const aMs = (v: string) => {
      const n = parseFloat(v);
      if (Number.isNaN(n)) return 0;
      return v.trim().endsWith('ms') ? n : n * 1000;
    };
    const maxMs = (lista: string) => lista.split(',').reduce((m, v) => Math.max(m, aMs(v)), 0);
    const identificar = (el: Element) => {
      const clases = el.className && typeof el.className === 'string' ? el.className : '';
      return `${el.tagName.toLowerCase()}${clases ? `.${clases.trim().split(/\s+/).slice(0, 3).join('.')}` : ''}`;
    };

    const fallos: { selector: string; motivo: string }[] = [];
    for (const el of Array.from(document.querySelectorAll('*'))) {
      const cs = getComputedStyle(el);
      const anima = cs.animationName !== 'none' && cs.animationName !== '';
      if (anima && maxMs(cs.animationDuration) > umbral) {
        fallos.push({
          selector: identificar(el),
          motivo: `animation ${cs.animationName} ${cs.animationDuration}`,
        });
      } else if (anima && cs.animationIterationCount.includes('infinite')) {
        // aunque dure 0,01ms, repetir sin fin repinta para siempre
        fallos.push({
          selector: identificar(el),
          motivo: `animation ${cs.animationName} infinite`,
        });
      }
      if (cs.transitionProperty !== 'none' && maxMs(cs.transitionDuration) > umbral) {
        fallos.push({
          selector: identificar(el),
          motivo: `transition ${cs.transitionProperty} ${cs.transitionDuration}`,
        });
      }
    }
    return fallos;
  }, umbralMs);
}

async function esperarQuieto(page: Page, contexto: string) {
  // sin esto, un barrido sin preferencia activa pasaría en verde sin auditar nada
  const activa = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  expect(activa, `${contexto}: la preferencia reduced-motion no está activa`).toBe(true);

  const fallos = await loQueSeMueve(page, UMBRAL_MS);
  // agrupado por motivo: 40 asas idénticas son UN fallo, no 40 líneas de ruido
  const porMotivo = new Map<string, number>();
  for (const f of fallos) porMotivo.set(f.motivo, (porMotivo.get(f.motivo) ?? 0) + 1);
  const resumen = [...porMotivo].map(([motivo, n]) => `${n}× ${motivo}`);
  expect(resumen, `${contexto}: sigue habiendo movimiento`).toEqual([]);
}

test('web pública del tenant: portada y buscador quietos', async ({ page }) => {
  await page.goto(`${WEB}/`);
  await expect(page.locator('h1').first()).toBeVisible();
  await esperarQuieto(page, `web pública ${WEB}/`);

  // el mostrador con su esqueleto latiendo (.lc-skeleton, animación infinita)
  await page.goto(`${WEB}/reservar?from=2026-09-10&to=2026-09-13&adults=2&children=0`);
  await expect(page.locator('ul li h3').first()).toBeVisible();
  await esperarQuieto(page, `resultados ${WEB}/reservar`);
});

test('landing Logic2B: el reveal deja el contenido visible y sin transición', async ({ page }) => {
  await page.goto('/');
  const revelados = page.locator('.lc-reveal');
  await expect(revelados.first()).toBeVisible();

  // el script marca todo visible de entrada: nada puede quedarse a opacidad 0
  const opacidades = await revelados.evaluateAll((els) =>
    els.map((el) => getComputedStyle(el).opacity),
  );
  expect(opacidades.every((o) => Number(o) === 1)).toBe(true);

  await esperarQuieto(page, 'landing Logic2B');
});

test('dashboard: planning, diálogo, tooltip y menú sin animación', async ({ page }) => {
  await page.goto('/admin/');
  await page.locator('button', { hasText: 'Ver la demo' }).click();

  // el visitante aterriza en el planning (tape chart)
  await expect(page.locator('.lc-bar').first()).toBeVisible({ timeout: 20_000 });
  await esperarQuieto(page, 'dashboard planning');

  // alert dialog del banner de demo: overlay + contenido son los que animaban
  await page.locator('button', { hasText: 'Restablecer datos' }).click();
  await expect(page.locator('[role=alertdialog]')).toBeVisible();
  await esperarQuieto(page, 'dashboard alert dialog abierto');

  await page.keyboard.press('Escape');
  await expect(page.locator('[role=alertdialog]')).toHaveCount(0);

  // tooltip del botón de ayuda (el `?` de la barra de cada pantalla)
  await page.getByLabel('Abrir la guía de esta pantalla', { exact: false }).first().hover();
  await expect(page.locator('[role=tooltip]').first()).toBeVisible();
  await esperarQuieto(page, 'dashboard tooltip abierto');
});
