/**
 * E2E del mostrador DENTRO de la ficha de alojamiento (sesión 64).
 *
 * Lo que protege: antes, el CTA de la ficha devolvía al visitante a la home
 * (`#mostrador`) sin llevarse el tipo que estaba mirando — tenía que volver a
 * encontrarlo entre todos. Ahora la ficha contesta por SU tipo, y cuando ese
 * tipo no entra ofrece la salida en vez de ser un callejón.
 *
 * Corre contra el Worker real, igual que el funnel.
 */
import { expect, test, type APIRequestContext } from './fixtures';
import { estanciaLibre, WEB } from './base';

const TIPO = 'ut_glamp';

type Fila = { unitTypeId: string; status: string; availableUnits: number };

/**
 * Una estancia en la que `tipo` NO entra pero el camping SÍ tiene algo libre —
 * el único caso donde la salida "ver qué queda libre" tiene sentido.
 *
 * Se pregunta a la API en vez de fiarse de una fecha escrita a mano: `base.ts`
 * dejó dicho que el glamping está lleno del 17 al 20 de septiembre, pero eso
 * era verdad de un seed que ADR 0030 ya cambió una vez. Presupuesto acotado a
 * 20 peticiones por el rate limit de 60/min de `/api/*`.
 */
async function estanciaSinEsteTipo(
  request: APIRequestContext,
  tipo: string,
): Promise<{ qs: string } | null> {
  for (let d = 1; d <= 20; d++) {
    const from = `2026-09-${String(d).padStart(2, '0')}`;
    const to = `2026-09-${String(d + 3).padStart(2, '0')}`;
    const qs = `from=${from}&to=${to}&adults=2&children=1`;
    const res = await request.get(`/api/availability?${qs}`);
    if (!res.ok()) continue;
    const { results } = (await res.json()) as { results: Fila[] };
    const suyo = results.find((r) => r.unitTypeId === tipo);
    const otros = results.filter((r) => r.unitTypeId !== tipo && r.status === 'available');
    if (suyo && suyo.status !== 'available' && otros.length > 0) return { qs };
  }
  return null;
}

test('la ficha contesta por SU tipo y el botón de reservar se lo lleva puesto', async ({
  page,
  request,
}) => {
  const { from, to, qs } = await estanciaLibre(request, TIPO);

  // deep-link: la ficha reproduce la búsqueda igual que la home
  await page.goto(`${WEB}/alojamientos/${TIPO}?${qs}`);

  const tarjetas = page.locator('ul li h3');
  await expect(tarjetas).toHaveCount(1); // solo el suyo, no el camping entero

  // y el botón lleva el tipo Y las fechas: eso es lo que antes se perdía
  const reservar = page.locator(`a[href*="/reservar/${TIPO}"]`);
  await expect(reservar).toBeVisible();
  const href = (await reservar.getAttribute('href'))!;
  expect(href).toContain(`from=${from}`);
  expect(href).toContain(`to=${to}`);

  // el recorrido completo: sigue al funnel sin volver a elegir nada
  await reservar.click();
  await expect(page).toHaveURL(new RegExp(`/reservar/${TIPO}`));
});

test('si su tipo no entra, la ficha ofrece salida en vez de ser un callejón', async ({
  page,
  request,
}) => {
  const caso = await estanciaSinEsteTipo(request, TIPO);
  test.skip(
    caso === null,
    `Sin ninguna estancia de septiembre en la que ${TIPO} esté lleno y quede otra cosa libre. ` +
      'No es una regresión: el seed reparte la ocupación y puede no producir el caso.',
  );

  await page.goto(`${WEB}/alojamientos/${TIPO}?${caso!.qs}`);

  // ni una tarjeta suya, pero tampoco un final de trayecto
  await expect(page.locator('ul li h3')).toHaveCount(0);
  const salida = page.locator('a[href*="#mostrador"]');
  await expect(salida).toBeVisible();

  // la salida conserva las fechas: el visitante no las reescribe
  const href = (await salida.getAttribute('href'))!;
  expect(href).toContain(`from=${caso!.qs.split('&')[0]!.replace('from=', '')}`);
});
