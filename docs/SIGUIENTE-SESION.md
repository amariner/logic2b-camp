# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito al cerrar la sesión 79 (2026-08-06). El `created_at` de las 3.426
> reservas ya cuenta una historia posible por canal. `pnpm check` 46/46,
> tenant demo 62/62, bundle compuesto 9.994 enlaces y navegador 1/1. Sin deploy.

## Estado en una línea

`main` queda con E0–E2 cerrados y con la deuda visible del seed resuelta. E3 es
el siguiente bloque estructural, pero conserva su gate técnico con Andreu. La
producción sigue en la sesión 76; faltan por desplegar M6 (77), la nueva escalera
comercial (78) y la cronología del seed (79).

## Lo primero de la próxima sesión

1. Ejecutar `git fetch` y comparar `main` con `origin/main` antes de tocar nada.
2. Si Andreu está presente, priorizar **E3** y cerrar su contrato técnico antes
   de código: tier 0 estático, endpoint compartido sin persistencia, antispam,
   privacidad, entrega fiable y onboarding ≤1 h.
3. Si vuelve a ser autónoma, elegir una deuda visible y sin credenciales. El
   candidato recomendado es la **guía de Inicio del dashboard**: crear
   `recepcion/inicio`, explicar cifras y bloques reales, conectarla en
   `apps/dashboard/src/lib/ayuda.ts`, verificar fallback/i18n y navegador.
4. No hacer deploy remoto ni reseed remoto sin la autorización/credenciales
   previstas por `docs/CONTINUA.md`.

## Candidato autónomo recomendado

**[dashboard] Guía contextual de la portada.** Es la primera pantalla del
gestor y la única sin `?`: `lib/ayuda.ts` devuelve `null` porque enlazar a una
página que no responde era peor que no enlazar. Crear una página
`apps/site/src/content/docs/recepcion/inicio.es.md` contra la UI real (cuatro
cifras, tres listas del día y rejilla de módulos), añadirla al orden de la guía
y mapear `/` a esa URL. No inventar funciones ni traducir la prosa: el contrato
actual mantiene prosa ES con fallback visible.

**Hecho cuando**: el `?` aparece en Inicio, abre la página correcta, la guía
describe exactamente la pantalla actual, entra en sitemap/jerarquía y pasa
build, enlaces compuestos y navegador a 1366/375 px.

## Bloqueado / esperar a Andreu

- E3 si su gate técnico cambia alcance o tratamiento de datos.
- Frente D completo y ADR D0; la galería espera ≥3 demos clicables.
- `new:camping --apply`, reseed remoto `--apply`, SES.Hospedajes real, secrets,
  Cloudflare Web Analytics, ensayo remoto de restauración y deploy de producción.
- Favicon y cualquier cambio de identidad de marca.

## Trampas vigentes

- `pnpm check` reconstruye `apps/site/dist` y borra la composición. Para probar
  navegador hay que volver a montar web en `/demo/` y dashboard en `/admin/`.
- En esta máquina Playwright puede no tener Chromium descargado; usar
  `CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`.
- Usar un puerto libre con `E2E_PORT`; no matar un Worker ajeno en 8787.
- La demo limita `/api/*` a 60 peticiones/minuto: una sesión por spec y evitar
  barridos innecesarios.
- Producción puede servir caché vieja con 200/HIT: verificar con `?v=`.
- El seed debe seguir puro: un rasgo nuevo no consume `rand()` general ni cuelga
  de un contador ya compartido. Toda propiedad temporal se prueba sobre varias
  anclas, no solo 2026.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
