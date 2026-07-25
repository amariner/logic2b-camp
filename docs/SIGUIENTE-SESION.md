# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito al cerrar la sesión 52 (2026-07-25: primitivos del DS en las tres
> pantallas de lista, BACKLOG B1 3/11, sesión autónoma local).
> Cuando la próxima sesión termine, **reescribe este fichero** con el prompt de
> la siguiente.

---

## Estado en una línea

Las sesiones son **autónomas**: basta "continúa con el desarrollo de este
proyecto" y se ejecuta `docs/CONTINUA.md` completo — **incluido el cierre en
`main` también desde cloud** (permiso permanente de Andreu, 2026-07-25). El MVP
es una **demo fake** — nada de servicios externos reales. Lo último cerrado es el
**avance de `[B1]`**: Pagos, Notificaciones y Reservas ya usan los primitivos del
DS, y al migrarlas apareció el hueco de verdad — **Pagos y Notificaciones no
tenían cabecera de columna**: los nombres vivían en un comentario y las siete
claves i18n que debían pintarlos estaban escritas y sin usar (el detector de C2
las contaba como huérfanas y **no lo eran**). El primitivo `Table` necesitó un
`containerClassName` para poder llevar cabecera pegajosa.

## ▶ Prompt para pegar

```
continúa con el desarrollo de este proyecto
```

## Deuda de despliegue

**Ninguna.** Las sesiones 48, 51 y 52 se desplegaron al cerrar la 52
(`camp.logic2b.com`, versión `48c0b6dc`) y se verificaron en vivo como visitante
anónimo. Sin migraciones nuevas → **no hizo falta reseed remoto**. Recordatorio
para la próxima: el deploy es manual desde local, `pnpm --filter @logic-camp/api deploy:demo`,
y **lleva schema, no datos** — si un objetivo depende de datos nuevos del seed,
hace falta además `pnpm db:seed:remote --apply` (doble candado, solo con Andreu).

## Candidatos de objetivo para la próxima sesión (elegir UNO, criterio CONTINUA)

- **[B1] Seguir con los primitivos, 2–3 pantallas más** (recomendado si se quiere
  algo visual y con final). Las siguientes que sí son tabla: **Clientes** y
  **Tarifas** (hoy tabla a mano, con las clases del DS copiadas). **Ojo**: de las
  8 que quedan, **Llegadas y Solicitudes NO deben pasar a tabla** (son listas con
  acciones por fila; convertirlas por simetría es una regresión) e Informes e
  Inventario son rejillas de tiles. Mirar cada una antes de tocarla.
- **[C1] Aviso inline del pendiente negativo** al mover una reserva ya pagada a
  un precio menor (hoy la ficha lo enseña después; el diálogo de precio no).
  Acotado, verificable con el planning.
- **[C2] Limpiar claves i18n huérfanas del dashboard** — con el aviso nuevo del
  BACKLOG: siete de las "huérfanas" eran cabeceras que faltaban por pintar. Una
  clave sin usar puede significar "falta la UI". Barato, pero es limpieza.
- **[10] Bloqueos para el visitante de la demo**: alcance acotado por Andreu en
  la sesión 50 — **reabrir sólo si al enseñar la demo se echa en falta**.
- **[B1] Rename literal de tokens camping→DS** (~400 usos, mecánico; valor demo
  nulo — sólo si no hay nada visual pendiente).

## Bloqueado (NO tocar en sesión autónoma, esperar a Andreu + credenciales)

- Verificar SES.Hospedajes real / secrets (opción B histórica).
- Fase 9 alta real (`new:camping --apply`), reseed remoto `--apply`.
- Traducciones de guías: descartadas con motivo (ADR 0025 §3).

## Trampas conocidas (heredadas + tres nuevas de la sesión 52)

- `git fetch` y comparar con origin/main ANTES de trabajar. El `main` local del
  contenedor suele venir viejo: `git reset --hard origin/main` antes del merge.
- **NUEVA (52) — el primitivo `Table` del DS y el scroll**: su contenedor lleva
  `overflow-x-auto`, y en CSS `overflow-y: visible` **computa a `auto`** en cuanto
  el otro eje no es `visible` → el contenedor pasa a ser el scroller de **ambos**
  ejes y un `<thead sticky top-0>` se queda pegado a algo que nunca se desplaza
  (la cabecera se va con el scroll de fuera). Para cabecera pegajosa hay que
  pasar `containerClassName="min-h-0 flex-1 overflow-auto"` — `twMerge` descarta
  el `overflow-x-auto` por él, y hay un test que lo fija.
- **NUEVA (52) — una clave i18n sin usar puede ser "falta la UI"**, no "sobra la
  clave": siete de las huérfanas de C2 eran las cabeceras de Pagos y
  Notificaciones, que nunca se pintaron. Mirar qué describe antes de borrarla.
- **NUEVA (52) — la densidad se rompe donde la lista se estrecha**: con la ficha
  abierta, `CS-2026-0008` se partía en tres líneas y las filas triplicaban su
  altura. Un identificador y un chip nunca se parten (`whitespace-nowrap`; el del
  chip va en `.lc-chip`, que se pinta en 6 pantallas). Verificar SIEMPRE con el
  panel lateral abierto, no solo con la lista a pantalla completa.
- El **seed no trae notificaciones ni reembolsos**: para ver `notifications_log`
  con datos, `POST /api/enquiries` (201) genera 2 filas por solicitud — el camino
  real, sin insertar filas a mano. Los importes negativos de Pagos siguen sin
  poder verse en vivo.
- **`pnpm check` reconstruye `apps/site/dist` y se lleva por delante `/demo` y
  `/admin`** — para verificar el dashboard en navegador hay que recomponer:
  `pnpm --filter @logic-camp/site build && pnpm --filter @logic-camp/dashboard build && rm -rf apps/site/dist/admin && cp -r apps/dashboard/dist apps/site/dist/admin`.
  Para `pnpm e2e` hace falta además `/demo`:
  `BASE_PATH=/demo pnpm --filter @logic-camp/web build && cp -r apps/web/dist apps/site/dist/demo`.
- **Un test de accesibilidad puede pasar por el motivo equivocado** (51):
  `test.use({ reducedMotion })` no activó la preferencia; usar
  `page.emulateMedia()` **y afirmar que está activa**. Lo mismo con `:focus-visible`
  — `.focus()` programático **no** lo activa (hay que pulsar Tab de verdad).
- **`@media` no suma especificidad** (51): `motion-reduce:X` (0,1,0) pierde contra
  `data-[state=open]:Y` (0,2,0) en cualquier orden.
- **`/api/*` va con rate limit de 60 req/min por IP** (`createRateLimiter`): un
  script que barra fechas se come la cuota y recibe **429**; con Playwright el
  síntoma es «Process from config.webServer was not able to start».
- En el panel del navegador, `computer` con `coordinate` usa coordenadas del
  **viewport**, no de la captura. Su `left_click_drag` no dispara los pointer
  events de las barras del planning: para gestos, Playwright.
- Cambiar el esquema de color en caliente (`resize_window colorScheme`) deja el
  dashboard **a medio repintar** (texto casi invisible sobre fondo claro):
  recargar antes de juzgar un contraste. No es un bug del producto.
- El **reset nocturno de la demo SÍ existe** (`tenants/demo/worker.ts`, cron
  `0 3 * * *` → `resetDemoData`). Notas viejas decían lo contrario.
- `wrangler dev` del demo a mano necesita `--persist-to <raíz>/.wrangler-demo`;
  `pnpm db:reset` borra `.wrangler-demo` bajo los pies del `wrangler dev` y lo
  mata — resembrar ANTES de levantarlo. En local, `.claude/launch.json` ya lo
  levanta bien (`preview_start` con `name: "api"`).
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
