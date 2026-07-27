# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito al cerrar la sesión 56 (2026-07-27: Llegadas deja de repetir la
> misma palabra veinte veces —BACKLOG `[B1]`, 7/11— y salen tres
> desalineaciones que se tapaban entre sí). Sesión autónoma local, con el dev
> levantado.
> Cuando la próxima sesión termine, **reescribe este fichero** con el prompt de
> la siguiente.

---

## Estado en una línea

Las sesiones son **autónomas**: basta "continúa con el desarrollo de este
proyecto" y se ejecuta `docs/CONTINUA.md` completo — **incluido el cierre en
`main` también desde cloud** (permiso permanente de Andreu, 2026-07-25). El MVP
es una **demo fake** — nada de servicios externos reales. Lo último cerrado:
`/llegadas`. La columna del saldo decía «Pendiente: …» en las veinte filas del
día y **nunca «Pagada»** (el seed cobraba el mismo 30% a todas), y eso tapaba una
rejilla que nunca alineó: las **dos** columnas de los extremos eran `auto` y la
fila sin botón de recepción medía **109px más** que sus vecinas. Además el corte
de las dos listas iba por el ancho de **pantalla** cuando quien las estrecha es
**la ficha de reserva** — con el panel abierto el titular quedaba en 45px.

## Estado de la entrega

**Sesión 56 en `origin/main`.** Se desarrolló sin red —el entorno no resolvía
`github.com`, así que ni el `git fetch` de apertura ni el push del cierre
funcionaron— y se empujó al recuperarse la conexión, en fast-forward: `main`
iba 1 commit por delante y 0 por detrás, sin nada que rebasar. Comprobado
también que **ninguna rama `claude/*`** (ni la local ni las dos remotas) tiene
commits fuera de `main`: no hay trabajo colgando en ninguna parte.

## ▶ Prompt para pegar

```
continúa con el desarrollo de este proyecto
```

## Deuda de despliegue

**Sí — y sigue sin necesitar `--apply`.** Las sesiones 53, 54, 55 y 56 no se han
desplegado. Ninguna toca esquema: el reset nocturno (`tenants/demo/worker.ts`,
cron `0 3 * * *` → `resetDemoData`) re-siembra desde `generateSeed()`, que es
**código desplegado**. Con un `pnpm --filter @logic-camp/api deploy:demo`
normal, la demo remota se pone al día sola a las 3:00 de la madrugada
siguiente; para verlo antes, el botón de restablecer del banner de demo.

Recordatorio general: el deploy es manual desde local y **lleva schema, no
datos**; solo un objetivo que dependa de datos que el reset **no** regenera
necesita `pnpm db:seed:remote --apply` (doble candado, solo con Andreu).

## Candidatos de objetivo para la próxima sesión (elegir UNO, criterio CONTINUA)

- **[10] Reset nocturno v2: el ancla móvil** (recomendado, y la sesión 56 le ha
  puesto precio a no hacerlo). Estaba declarado fuera de v1 (ADR 0013 §1), pero
  la evidencia nueva es dura: **el botón de check-out no aparece nunca en la
  demo, ningún día del año**, porque el seed estampa `checked_in_at` solo sobre
  las estancias que contienen el ancla `Y-07-15` y la pantalla mira el día real.
  Y fuera de julio, `/llegadas` —la pantalla que la recepcionista mira más veces
  al día— sale **vacía**. Es trabajo de verdad (redistribuir `generateSeed` con
  una franja alrededor de la fecha real, y 10 tests calibrados sobre el ancla
  fija), así que **ADR primero** y marcado `propuesto`. Ojo con el determinismo:
  el reset re-siembra a diario, así que el ancla nueva tiene que ser función de
  su entrada, no de `Date.now()` leído dentro de `generateSeed`.
- **[B1] Informes e Inventario** (rejillas de tiles → `Card` del DS). En
  Informes hay un defecto visible ya anotado: el titular "Ingresos (por
  llegada)" ocupa dos líneas y **hunde su cifra** respecto de las otras cuatro
  tarjetas, que quedan desalineadas en la fila. Quedan 4 de 11 para cerrar B1.
- **[C1] Aviso inline del pendiente negativo** al mover una reserva ya pagada a
  un precio menor (hoy la ficha lo enseña después; el diálogo de precio no).
  Acotado, verificable con el planning. **Y ahora es más fácil de ver**: desde
  la sesión 56 hay reservas pagadas al 100% en el seed, que antes no había.
- **[C4] La ficha de reserva en móvil**: `BookingPanel` es `w-[360px] shrink-0`,
  así que a 375px deja **15px** a la lista de detrás. Debería ser `Sheet` a
  pantalla completa bajo `md`. Afecta a todas las pantallas que abren ficha.
- **[seed] Nombre y idioma discordantes**: "Guten Tag" firmado Matteo Ricci. No
  es un retoque — el recorrido de parejas nombre×apellido es lo que
  **garantiza** que no haya dos clientes iguales (sesión 54), así que atarlo al
  `locale` exige decidir cómo se cruzan las dos propiedades.

## Bloqueado (NO tocar en sesión autónoma, esperar a Andreu + credenciales)

- Verificar SES.Hospedajes real / secrets (opción B histórica).
- Fase 9 alta real (`new:camping --apply`), reseed remoto `--apply`.
- Traducciones de guías: descartadas con motivo (ADR 0025 §3).

## Trampas conocidas (heredadas + cuatro nuevas de la sesión 56)

- `git fetch` y comparar con origin/main ANTES de trabajar. El `main` local del
  contenedor suele venir viejo: `git reset --hard origin/main` antes del merge.
- **NUEVA (56) — `@container` y su `@md:`/`@3xl:` no pueden ir en el MISMO
  elemento.** Un elemento no puede consultarse a sí mismo. Y no falla ruidoso:
  `container-type` queda aplicado, la consulta se resuelve contra un contenedor
  ancestro que no existe y **no coincide nunca**. Medido: 1142px de ancho y
  `flex-direction: column` con un `@3xl:flex-row` puesto. El `@container` va en
  el padre.
- **NUEVA (56) — una media query `lg:` mide la PANTALLA, y lo que estrecha una
  lista casi nunca es la pantalla.** En `/llegadas` era la ficha de reserva
  (`w-[360px]`): a 1366px el hueco baja de 1142 a 782px y las dos columnas
  seguían partiéndoselo. El umbral del corte se saca de **la cuenta de la fila**
  (hueco del botón + columnas fijas + lo que necesita el nombre), no de un
  número redondo.
- **NUEVA (56) — dos defectos pueden taparse el uno al otro.** La columna del
  saldo saltaba 43px entre «Pendiente: …» y «Pagada», y era invisible porque el
  seed no generaba ni una «Pagada». Corolario: **si una columna solo toma un
  valor en toda la pantalla, el defecto está en el dato, y probablemente hay
  otro escondido detrás.**
- **NUEVA (56) — una clave i18n muerta también puede sobrar de verdad.** En
  Solicitudes faltaba la UI (sesión 55); en Llegadas, no: la fila son 3 columnas
  en **dos renglones**, y tres rótulos nombrarían la mitad de los seis valores.
  Se borran, pero **con el motivo escrito al lado**, o la sesión siguiente las
  vuelve a leer como "falta la UI".
- **En una lista de filas-`<button>`, ninguna columna `auto`** (55). No hay
  `<table>` que las alinee: cada fila es su propia rejilla. Y si hay un botón de
  acción **fuera** del `<button>` de la fila, el hueco se reserva para toda la
  lista o para ninguna fila, o las filas no miden lo mismo (56: 109px).
- **Un test sobre un solo año comprueba una tirada, no una propiedad** (55). El
  reset re-siembra con `new Date().getUTCFullYear()`, así que el PRNG del seed
  cambia cada 1 de enero: los tests corren sobre 2026–2035.
- **Al sortear un rasgo nuevo del seed, mirar de qué contador depende el rasgo
  de al lado** (54). `bkgN` ya lleva encima el medio de pago (`% 6`, `% 4`), el
  idioma (`% 6`), los habituales (`% 4`) y el check-in (`% 5`). En la 56 la
  solución fue un **PRNG propio** (`payRand`): ni comparte contador, ni consume
  del general (que movería el relleno por curva entero).
- **La lección de las sesiones 53, 54, 55 y 56, ya cuatro veces**: un dato puede
  ser **válido y falso a la vez**, y ningún test de invariantes lo ve — 2 032
  fichas correctas que eran 20 personas; quince solicitudes recibidas el mismo
  día; veinte reservas debiendo exactamente el 70%. **Hay que mirar la pantalla,
  y luego escribir el test.**
- **`getComputedStyle().boxShadow` miente sobre el anillo de foco** del DS en
  este Chrome: `--tw-ring-shadow` se lee bien pero el compuesto sale a cero. El
  anillo **sí se pinta**. Para juzgar un anillo, captura; para juzgar que la
  regla existe, la variable. Y `:focus-visible` **no** lo activa `.focus()`:
  hay que pulsar Tab de verdad.
- **El primitivo `Table` y el scroll (52)**: su contenedor lleva `overflow-x-auto`
  y en CSS `overflow-y: visible` **computa a `auto`** en cuanto el otro eje no es
  `visible` → el contenedor pasa a ser el scroller de **ambos** ejes y un
  `<thead sticky top-0>` se pega a algo que nunca se desplaza. Para cabecera
  pegajosa: `containerClassName="min-h-0 flex-1 overflow-auto"` (hay test).
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
- **Iterar el dashboard con el preview levantado (55)**: `wrangler dev` sirve
  `apps/site/dist`, así que tras cada cambio hay que **rebuild + copiar** a
  `apps/site/dist/admin` y **recargar de verdad** (`window.location.reload()`) —
  navegar a la misma URL con hash **no recarga**. Y `pnpm db:reset` borra
  `.wrangler-demo` bajo los pies del `wrangler dev` y lo mata: **parar el
  preview, resembrar, y volver a levantarlo** (`preview_start` con `name: "api"`).
  **Atajo de la 56**: para volver a datos limpios sin parar nada,
  `POST /api/demo/reset` desde la consola de la página (es lo que hace el botón
  del banner) y luego `POST /api/demo/sign-in`, que el wipe borra la sesión.
- En el panel del navegador, `computer` con `coordinate` usa coordenadas del
  **viewport**, no de la captura — para pulsar una fila, los `ref_N` de
  `read_page`. **Y ojo (56): un `left_click` sobre un `ref` viejo, después de
  navegar, aterriza donde caiga** — en esta sesión hizo un check-in real y dejó
  un huésped "En casa" que el seed no había sembrado; tres minutos perdidos
  buscando el fallo en el seed. Si un dato no cuadra, mirar primero su
  `updated_at`/`checked_in_at`. Su `left_click_drag` no dispara los pointer
  events de las barras del planning: para gestos, Playwright. **Y `resize_window`
  y la captura se desincronizan tras recargar**: para juzgar geometría, medir el
  DOM (`getBoundingClientRect`), que no miente.
- Cambiar el esquema de color en caliente (`resize_window colorScheme`) deja el
  dashboard **a medio repintar**: recargar antes de juzgar un contraste.
- El **reset nocturno de la demo SÍ existe** (`tenants/demo/worker.ts`, cron
  `0 3 * * *` → `resetDemoData`), y **re-siembra desde `generateSeed()`**: un
  cambio del seed llega a la demo con un deploy normal, sin `--apply`.
- En Playwright, ir de `/admin/` a `/admin/#/…` **no recarga** (sólo cambia el
  hash) → `await p.reload()` después. El **planning vive en `/`**, no en
  `/planning`; con `?date=&unit=unt_…` la virtualización desplaza hasta la unidad.
- **`/api/*` va con rate limit de 60 req/min por IP** (`createRateLimiter`): un
  script que barra fechas se come la cuota y recibe **429**; con Playwright el
  síntoma es «Process from config.webServer was not able to start».
- En el contenedor cloud, Playwright no encuentra su navegador solo: la config
  ya usa `/opt/pw-browsers/chromium` **si existe** (y `CHROMIUM_PATH` manda).
- Segfault de workerd sobre `reset.test.ts` = solo contenedor cloud (45/45 local).
- `seed.sql` gitignored; el seed LOCAL puede estar viejo → `pnpm db:reset &&
pnpm db:seed` si el plano sale "automático" o falta `modules.*`.
- Login del dashboard: el formulario React no responde a eventos sintéticos por
  coordenadas; usar los `ref_N` del árbol de accesibilidad, o `fetch` a
  `/api/auth/sign-in/email`. Demo: gerencia@calasereno.example / calasereno,
  rutas hash. **Para entrar como visitante ya no hacen falta credenciales**:
  botón "Ver la demo" (o `POST /api/demo/sign-in`). Ojo: `db:reset` **cierra la
  sesión**, hay que volver a entrar.
- exports/ en .gitignore. Scripts de sesión nunca se commitean.
