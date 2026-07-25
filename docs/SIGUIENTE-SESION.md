# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito al cerrar la sesión 53 (2026-07-25: Clientes y Tarifas a los
> primitivos del DS, BACKLOG B1 5/11, y el arreglo del seed que hacía que los
> 2 032 clientes fueran 20 personas repetidas. Sesión autónoma local).
> Cuando la próxima sesión termine, **reescribe este fichero** con el prompt de
> la siguiente.

---

## Estado en una línea

Las sesiones son **autónomas**: basta "continúa con el desarrollo de este
proyecto" y se ejecuta `docs/CONTINUA.md` completo — **incluido el cierre en
`main` también desde cloud** (permiso permanente de Andreu, 2026-07-25). El MVP
es una **demo fake** — nada de servicios externos reales. Lo último cerrado:
**`[B1]` llega a 5 de 11** (Clientes y Tarifas migradas; con ellas se acaban las
pantallas que **son** tablas), y al mirarlas en el navegador saltó un fallo que
no era de UI — **el seed acoplaba nombre y apellido al mismo índice**, así que la
lista de clientes enseñaba 25 filas seguidas con el mismo nombre y el mismo
correo. Ahora hay 1 600 nombres y correos distintos, con test que lo fija.

## ▶ Prompt para pegar

```
continúa con el desarrollo de este proyecto
```

## Deuda de despliegue

**Sí, y esta vez importa por qué.** La sesión 53 **no se ha desplegado**. El
cambio del seed no afecta al esquema, así que **no hace falta reseed remoto
`--apply`**: el reset nocturno (`tenants/demo/worker.ts`, cron `0 3 * * *` →
`resetDemoData`) re-siembra desde `generateSeed()`, que es **código desplegado**.
Es decir: con un `pnpm --filter @logic-camp/api deploy:demo` normal, la demo
remota se arregla sola a las 3:00 de la madrugada siguiente. Si se quiere ver
antes, está el botón de restablecer del banner de demo.

Recordatorio general: el deploy es manual desde local y **lleva schema, no
datos**; solo un objetivo que dependa de datos que el reset **no** regenera
necesita `pnpm db:seed:remote --apply` (doble candado, solo con Andreu).

## Candidatos de objetivo para la próxima sesión (elegir UNO, criterio CONTINUA)

- **[10] Huéspedes que repiten en el seed** (recomendado si se quiere algo con
  peso en la demo). Hoy el generador crea **un huésped nuevo por reserva**: la
  columna "Reservas" de `/clientes` vale **1 en las 2 032 fichas** y el historial
  de la ficha siempre tiene una sola estancia — o sea, la "memoria comercial del
  camping", que es lo que esa pantalla vende, **no se ve nunca**. Que un
  porcentaje de reservas reutilice un huésped existente (el que vuelve cada
  agosto) lo arregla. **Ojo**: toca el generador de reservas y `booking_guests`,
  hay que comprobar invariantes y el parte de viajeros, y `seed.test.ts` tiene
  10 tests calibrados sobre el ancla. No es un retoque de datos.
- **[B1] Seguir con los primitivos, 2–3 pantallas más**. Quedan 6 y **ninguna es
  una tabla**: Informes e Inventario son rejillas de tiles, Llegadas y
  Solicitudes son listas con acciones por fila (convertirlas a tabla sería una
  regresión), Parte y Ajustes son formulario y detalle. Lo que les toca es
  `Card`/`Input`/`Label`/`Badge`, no `Table*`. Mirar cada una antes de tocarla.
- **[C1] Aviso inline del pendiente negativo** al mover una reserva ya pagada a
  un precio menor (hoy la ficha lo enseña después; el diálogo de precio no).
  Acotado, verificable con el planning.
- **[C2] Limpiar claves i18n huérfanas del dashboard** — con el aviso del
  BACKLOG: siete de las "huérfanas" eran cabeceras que faltaban por pintar. Una
  clave sin usar puede significar "falta la UI". Barato, pero es limpieza.
- **[B1] Rename literal de tokens camping→DS** (~400 usos, mecánico; valor demo
  nulo — sólo si no hay nada visual pendiente).

## Bloqueado (NO tocar en sesión autónoma, esperar a Andreu + credenciales)

- Verificar SES.Hospedajes real / secrets (opción B histórica).
- Fase 9 alta real (`new:camping --apply`), reseed remoto `--apply`.
- Traducciones de guías: descartadas con motivo (ADR 0025 §3).

## Trampas conocidas (heredadas + tres nuevas de la sesión 53)

- `git fetch` y comparar con origin/main ANTES de trabajar. El `main` local del
  contenedor suele venir viejo: `git reset --hard origin/main` antes del merge.
- **NUEVA (53) — un seed puede generar datos válidos y falsos a la vez**, y
  ningún test de invariantes lo ve. `firstNames[b % 20]` y `lastNames[(b*3) % 20]`
  quedan **ambos determinados por `b % 20`**: 20 personas para 2 032 fichas. Al
  desacoplar índices en un generador, comprobar que los ritmos son de verdad
  independientes (dividir, no multiplicar) **y contar los distintos**, que es lo
  único que no se puede engañar. Ojo con lo contrario: para listas cortas
  (solicitudes, ~12 filas) el truco correcto es el **multiplicador**, porque
  dividir les daría el mismo apellido a todas.
- **NUEVA (53) — `getComputedStyle().boxShadow` miente sobre el anillo de foco**
  del DS en este Chrome: `--tw-ring-shadow` se lee correctamente (`0 0 0 3px …`)
  pero el `box-shadow` compuesto sale a cero. El anillo **sí se pinta**. Para
  juzgar un anillo, captura; para juzgar que la regla existe, la variable.
- **NUEVA (53) — antes de bajar la altura de un `Input` del DS "por densidad",
  mirar quién fija de verdad la altura de la fila**. En Tarifas la fijaba el
  botón `size="xs"` (28px), no el campo: `h-7` alinea los dos y no cuesta ni un
  píxel; `h-8` habría crecido sin motivo, y `h-6` habría dejado el campo
  descolgado del botón.
- **El primitivo `Table` y el scroll (52)**: su contenedor lleva `overflow-x-auto`
  y en CSS `overflow-y: visible` **computa a `auto`** en cuanto el otro eje no es
  `visible` → el contenedor pasa a ser el scroller de **ambos** ejes y un
  `<thead sticky top-0>` se pega a algo que nunca se desplaza. Para cabecera
  pegajosa: `containerClassName="min-h-0 flex-1 overflow-auto"` (hay test).
- **Una clave i18n sin usar puede ser "falta la UI" (52)**, no "sobra la clave".
- **La densidad se rompe donde la lista se estrecha (52)**: verificar SIEMPRE con
  el panel lateral abierto, no solo con la lista a pantalla completa.
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
  dashboard **a medio repintar**: recargar antes de juzgar un contraste.
- El **reset nocturno de la demo SÍ existe** (`tenants/demo/worker.ts`, cron
  `0 3 * * *` → `resetDemoData`), y **re-siembra desde `generateSeed()`**: un
  cambio del seed llega a la demo con un deploy normal, sin `--apply`.
- `wrangler dev` del demo a mano necesita `--persist-to <raíz>/.wrangler-demo`;
  `pnpm db:reset` borra `.wrangler-demo` bajo los pies del `wrangler dev` y lo
  mata — **parar el preview, resembrar, y volver a levantarlo**. En local,
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
