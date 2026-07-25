import type { APIRequestContext } from '@playwright/test';

/**
 * Prefijo de la web del tenant dentro del bundle compuesto (ADR 0016).
 *
 * El Worker de la demo sirve tres cosas del mismo `apps/site/dist`: la landing
 * de producto en `/`, la web del camping en `/demo/` y el dashboard en
 * `/admin/`. `deploy:demo` construye la web con `BASE_PATH=/demo`, así que en
 * producción —y en cualquier `wrangler dev` montado igual— `/reservar` NO
 * existe: es `/demo/reservar`.
 *
 * Los E2E del funnel se escribieron antes de que el bundle se compusiera y
 * apuntaban a la raíz; desde entonces fallaban los 4 contra el bundle real.
 */
export const WEB = process.env.E2E_WEB_BASE ?? '/demo';

/**
 * Elige una estancia de 3 noches de septiembre en la que el tipo `ut_glamp`
 * —el que usa todo el funnel— tenga hueco DE VERDAD, preguntándoselo a la API.
 *
 * Antes las fechas salían de `10 + (minutos % 12)` a ciegas, y eso escondía dos
 * fallos que hacían el funnel flaky en rojo sin culpa del código de producción:
 *
 * 1. En el seed limpio, el glamping está lleno del 17 al 20 de septiembre. Cuatro
 *    de los doce minutos del ciclo daban «no hay hueco» y la suite fallaba por el
 *    reloj, no por una regresión.
 * 2. El ciclo se repetía cada **12 minutos** y un hold vive **15**: dos pasadas
 *    seguidas caían en la misma fecha con los holds de la anterior aún vivos (el
 *    cron que los purga no corre en `wrangler dev`), y se envenenaban entre sí.
 *
 * Ahora se pregunta primero y se rota **entre las fechas libres**, con un ciclo
 * más largo que la vida del hold. Si el seed cambia, esto se entera; si no queda
 * ninguna, se dice claro en vez de fallar en un `expect` a tres pasos de aquí.
 */
export async function estanciaLibre(
  request: APIRequestContext,
  unitTypeId = 'ut_glamp',
): Promise<{ from: string; to: string; qs: string }> {
  const DIAS = 26;
  const dia = (d: number) => `2026-09-${String(d).padStart(2, '0')}`;
  // arranca en un día distinto cada minuto (dos pasadas seguidas no se pisan) y
  // avanza hasta encontrar hueco. Y si se pisaran da igual: un hold vivo de la
  // pasada anterior baja las unidades libres, así que esa fecha ya no se elige.
  const inicio = Math.floor(Date.now() / 60_000) % DIAS;

  // de una en una y parando al primer acierto: `/api/*` va con rate limit de 60
  // peticiones por minuto y barrer el mes entero se comía media suite
  for (let i = 0; i < DIAS; i++) {
    const d = ((inicio + i) % DIAS) + 1;
    const from = dia(d);
    const to = dia(d + 3);
    const qs = `from=${from}&to=${to}&adults=2&children=1`;
    const res = await request.get(`/api/availability?${qs}`);
    if (!res.ok()) continue;
    const { results } = (await res.json()) as {
      results: { unitTypeId: string; status: string; availableUnits: number }[];
    };
    const tipo = results.find((r) => r.unitTypeId === unitTypeId);
    if (tipo?.status === 'available' && tipo.availableUnits > 0) return { from, to, qs };
  }

  throw new Error(
    `Sin ninguna estancia de 3 noches libre para ${unitTypeId} en septiembre de 2026. ` +
      `¿Base sembrada (pnpm db:reset && pnpm db:seed) y sin holds colgados?`,
  );
}
