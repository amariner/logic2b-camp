# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito al cerrar la sesión 51 (2026-07-25: auditoría de `prefers-reduced-motion`,
> BACKLOG C2 + B3, sesión autónoma local).
> Cuando la próxima sesión termine, **reescribe este fichero** con el prompt de
> la siguiente.

---

## Estado en una línea

Las sesiones son **autónomas**: basta "continúa con el desarrollo de este
proyecto" y se ejecuta `docs/CONTINUA.md` completo — **incluido el cierre en
`main` también desde cloud** (permiso permanente de Andreu, 2026-07-25). El MVP
es una **demo fake** — nada de servicios externos reales. Lo último cerrado es
el **suelo de accesibilidad**: con `prefers-reduced-motion` activado ya no se
mueve nada (los `motion-reduce:animate-none` por componente **perdían la batalla
de especificidad y no anulaban nada**; ahora es un reset único por raíz, con un
E2E que barre el DOM). De paso se destapó y arregló que el **E2E del funnel
llevaba rojo 4/4 desde ADR 0016** y encima era flaky por fechas inventadas:
`pnpm e2e` está **7/7 verde en tres vueltas seguidas**.

## ▶ Prompt para pegar

```
continúa con el desarrollo de este proyecto
```

## Deuda de despliegue (primer paso de la próxima sesión LOCAL con credenciales)

- Las sesiones 48 y 51 **no están en producción**. La 51 es sólo CSS + tests,
  así que no corre prisa, pero conviene que salga con lo siguiente:
  `pnpm --filter @logic-camp/api deploy:demo`.

## Candidatos de objetivo para la próxima sesión (elegir UNO, criterio CONTINUA)

- **[B1] Adoptar primitivos de `packages/ui`** (Card/Badge/Input/Table…) en 2–3
  pantallas del dashboard. Incremental y demo-visible; hoy sólo el shell usa los
  primitivos y el resto sigue con markup propio ya tematizado. Recomendado si se
  quiere algo visual.
- **[C1] Aviso inline del pendiente negativo** al mover una reserva ya pagada a
  un precio menor (hoy la ficha lo enseña después; el diálogo de precio no).
  Acotado, verificable con el planning.
- **[C2] Limpiar claves i18n huérfanas del dashboard** (~105 marcadas por el
  detector, pero ~53 se construyen con plantilla y NO lo son: verificar una a
  una). Barato, pero es limpieza, no acabado.
- **[10] Bloqueos para el visitante de la demo**: crear/levantar bloqueos le da
  el aviso de solo lectura, y "crear arrastrando sobre celda libre" es el único
  gesto que empieza y no puede terminar. Alcance acotado por Andreu en la sesión
  50 — **reabrir sólo si al enseñar la demo se echa en falta**, no por completismo.
- **[B1] Rename literal de tokens camping→DS** (~400 usos, mecánico; valor demo
  nulo — sólo si no hay nada visual pendiente).

## Bloqueado (NO tocar en sesión autónoma, esperar a Andreu + credenciales)

- Verificar SES.Hospedajes real / secrets (opción B histórica).
- Fase 9 alta real (`new:camping --apply`), reseed remoto `--apply`.
- Traducciones de guías: descartadas con motivo (ADR 0025 §3).

## Trampas conocidas (heredadas + tres nuevas de la sesión 51)

- `git fetch` y comparar con origin/main ANTES de trabajar. El `main` local del
  contenedor suele venir viejo: `git reset --hard origin/main` antes del merge.
- **NUEVA (51) — un test de accesibilidad puede pasar por el motivo equivocado**:
  `test.use({ reducedMotion: 'reduce' })` **no activó la preferencia** con esta
  configuración de Playwright (`matchMedia(...).matches` daba `false`) y el
  barrido salía verde sin auditar nada. Usar `page.emulateMedia()` **y afirmar
  que la preferencia está activa** antes de medir. Lo mismo aplica a cualquier
  emulación (print, dark, viewport).
- **NUEVA (51) — `@media` no suma especificidad**: `motion-reduce:X` (0,1,0)
  pierde contra cualquier variante de atributo tipo `data-[state=open]:Y`
  (0,2,0), en cualquier orden. Si hace falta ganar desde una media query, o se
  sube la especificidad o se usa `!important` (que es lo que hace el reset).
- **NUEVA (51) — `pnpm e2e` necesita el bundle COMPUESTO**: la web del tenant
  vive en `/demo/` (`e2e/base.ts` → `WEB`), no en la raíz. Prepararlo con
  `pnpm db:reset && pnpm db:seed` y luego los builds de `deploy:demo` **sin la
  parte de `wrangler d1 migrations apply --remote` ni `wrangler deploy`**:
  `pnpm --filter @logic-camp/site build && BASE_PATH=/demo pnpm --filter @logic-camp/web build && pnpm --filter @logic-camp/dashboard build && rm -rf apps/site/dist/demo apps/site/dist/admin && cp -r apps/web/dist apps/site/dist/demo && cp -r apps/dashboard/dist apps/site/dist/admin`.
  Ojo: **`pnpm check` reconstruye `apps/site/dist` y se lleva por delante
  `/demo` y `/admin`** — hay que recomponer después.
- **NUEVA (51) — `/api/*` va con rate limit de 60 peticiones por minuto y por IP**
  (`createRateLimiter` en `apps/api/src/app.ts`). Un script de verificación que
  barra fechas o entidades lo agota y empieza a recibir **429**; con Playwright,
  hasta el health check del `webServer` falla y el error que se ve es «Process
  from config.webServer was not able to start», que no se parece en nada a la causa.
- En el panel del navegador, `computer` con `coordinate` usa coordenadas del
  **viewport**, no de la captura (factor 2 en Mac retina, 1,6 en el contenedor).
  Y su `left_click_drag` no dispara los _pointer events_ de las barras del
  planning: para verificar gestos hace falta Playwright.
- El **reset nocturno de la demo SÍ existe** (`tenants/demo/worker.ts`, cron
  `0 3 * * *` → `resetDemoData`). Notas viejas decían lo contrario.
- `wrangler dev` del demo a mano necesita `--persist-to <raíz>/.wrangler-demo` —
  sin eso levanta una D1 vacía («no such table: users») aunque `pnpm db:seed`
  haya ido bien. Ojo: `pnpm db:reset` borra `.wrangler-demo` bajo los pies del
  `wrangler dev` y lo mata — resembrar ANTES de levantarlo. En local,
  `.claude/launch.json` ya lo levanta bien (`preview_start` con `name: "api"`).
- En Playwright, ir de `/admin/` a `/admin/#/…` **no recarga** (sólo cambia el
  hash) → `await p.reload()` después. El **planning vive en `/`**, no en
  `/planning`; con `?date=&unit=unt_…` la virtualización desplaza hasta la unidad.
- En el contenedor cloud, Playwright no encuentra su navegador solo: la config
  ya usa `/opt/pw-browsers/chromium` **si existe** (y `CHROMIUM_PATH` manda).
- Segfault de workerd sobre `reset.test.ts` = solo contenedor cloud (45/45 local).
- `seed.sql` gitignored; el seed LOCAL puede estar viejo → `pnpm db:reset &&
pnpm db:seed` si el plano sale "automático" o falta `modules.*`.
- Login del dashboard: el formulario React no responde a eventos sintéticos por
  coordenadas; usar los `ref_N` del árbol de accesibilidad, o `fetch` a
  `/api/auth/sign-in/email`. Demo: gerencia@calasereno.example / calasereno,
  rutas hash. **Para entrar como visitante ya no hacen falta credenciales**:
  botón "Ver la demo".
- exports/ en .gitignore. Scripts de sesión nunca se commitean.
