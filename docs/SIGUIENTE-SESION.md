# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito al cerrar la sesión 55 (2026-07-25: la bandeja de solicitudes deja
> de leerse como generada —BACKLOG `[B1]`, 6/11— y, de paso, se descubre que las
> columnas de esa lista nunca estuvieron alineadas entre sí. Sesión autónoma
> local, con el dev levantado).
> Cuando la próxima sesión termine, **reescribe este fichero** con el prompt de
> la siguiente.

---

## Estado en una línea

Las sesiones son **autónomas**: basta "continúa con el desarrollo de este
proyecto" y se ejecuta `docs/CONTINUA.md` completo — **incluido el cierre en
`main` también desde cloud** (permiso permanente de Andreu, 2026-07-25). El MVP
es una **demo fake** — nada de servicios externos reales. Lo último cerrado:
`/solicitudes`. Las quince solicitudes se sembraban **el mismo día** y varias
pedían una estancia **anterior a su propia fecha de recepción**; ahora llegan
escalonadas por edad del estado, piden siempre con antelación, y caen los dos
acoplamientos que las ataban (`source`/fechas por `n % 4`, tipo/niños por
`n % 3`). Además cada una escribe **en su idioma** con el prefijo de su mercado.
Y la cabecera de columnas que le faltaba destapó que **la columna "Tipo
solicitado" bailaba 46 px de una fila a otra**: cada fila es su propia rejilla y
la última columna era `auto`.

## ▶ Prompt para pegar

```
continúa con el desarrollo de este proyecto
```

## Deuda de despliegue

**Sí — y sigue sin necesitar `--apply`.** Las sesiones 53, 54 y 55 no se han
desplegado. Ninguna toca esquema: el reset nocturno (`tenants/demo/worker.ts`,
cron `0 3 * * *` → `resetDemoData`) re-siembra desde `generateSeed()`, que es
**código desplegado**. Con un `pnpm --filter @logic-camp/api deploy:demo`
normal, la demo remota se pone al día sola a las 3:00 de la madrugada
siguiente; para verlo antes, el botón de restablecer del banner de demo.

Recordatorio general: el deploy es manual desde local y **lleva schema, no
datos**; solo un objetivo que dependa de datos que el reset **no** regenera
necesita `pnpm db:seed:remote --apply` (doble candado, solo con Andreu).

## Candidatos de objetivo para la próxima sesión (elegir UNO, criterio CONTINUA)

- **[B1] Llegadas** (recomendado): es la gemela de Solicitudes —lista con
  acciones por fila— y es la pantalla de **la operación diaria**, la que la
  recepcionista mira más veces al día. Primero mirar si arrastra el mismo
  defecto que acaba de aparecer: **última columna `auto` en filas que son
  rejillas independientes**. Y comprobar si le falta cabecera igual que a las
  otras tres (buscar claves `lleg.*` escritas y sin usar — el detector es
  `grep` de la clave fuera de `i18n.ts`).
- **[B1] Informes e Inventario** (rejillas de tiles → `Card` del DS). En
  Informes hay un defecto visible ya anotado: el titular "Ingresos (por
  llegada)" ocupa dos líneas y **hunde su cifra** respecto de las otras cuatro
  tarjetas, que quedan desalineadas en la fila.
- **[C1] Aviso inline del pendiente negativo** al mover una reserva ya pagada a
  un precio menor (hoy la ficha lo enseña después; el diálogo de precio no).
  Acotado, verificable con el planning.
- **[10] Informes con la memoria comercial ya sembrada**: desde la sesión 54 hay
  clientes que repiten; mirar si `/informes` puede decir algo que antes era
  imposible (cuántos vuelven, qué porcentaje de reservas son de repetidores).
  **Ojo**: es feature nueva, no acabado — comprobar antes si cabe sin abrir fase.
- **[seed] Nombre y idioma discordantes** (nuevo en BACKLOG): "Guten Tag"
  firmado Matteo Ricci. No es un retoque — el recorrido de parejas
  nombre×apellido es lo que **garantiza** que no haya dos clientes iguales
  (sesión 54), así que atarlo al `locale` exige decidir cómo se cruzan las dos
  propiedades. Afecta a las ~1 500 fichas, no solo a las 15 solicitudes.

## Bloqueado (NO tocar en sesión autónoma, esperar a Andreu + credenciales)

- Verificar SES.Hospedajes real / secrets (opción B histórica).
- Fase 9 alta real (`new:camping --apply`), reseed remoto `--apply`.
- Traducciones de guías: descartadas con motivo (ADR 0025 §3).

## Trampas conocidas (heredadas + tres nuevas de la sesión 55)

- `git fetch` y comparar con origin/main ANTES de trabajar. El `main` local del
  contenedor suele venir viejo: `git reset --hard origin/main` antes del merge.
- **NUEVA (55) — en una lista de filas-`<button>`, ninguna columna `auto`.** No
  hay `<table>` que las alinee: **cada fila es su propia rejilla**, así que una
  columna `auto` la dimensiona el contenido *de esa fila* y todo lo que hay a su
  izquierda se desplaza. Medido en Solicitudes: la columna "Tipo solicitado"
  empezaba en 1116, 1134, 1137, 1153 o 1162 px según lo largo que fuera el chip
  de estado. **Nadie lo había visto porque no había cabecera contra la que
  mirar** — poner la cabecera fue lo que lo destapó. Y la rejilla va en **una
  constante compartida** por cabecera y fila, o se desincronizan.
- **NUEVA (55) — un test sobre un solo año comprueba una tirada, no una
  propiedad.** El reset nocturno re-siembra con `new Date().getUTCFullYear()`,
  así que el PRNG del seed **cambia cada 1 de enero**. Los tests de solicitudes
  corren sobre 2026–2035 y eso cazó en el acto que "sin tipo y con niños" no
  salía en 2028: era un umbral estadístico disfrazado de garantía. Corolario:
  **lo que la demo deba enseñar SIEMPRE se planta, no se sortea** (como los
  casos límite de las reservas); lo que solo aporta variedad, se sortea.
- **NUEVA (55) — antes de "arreglar" un dato del seed, mirar qué dice el
  dominio.** El acoplamiento `n % 4` hacía que ninguna solicitud de teléfono
  trajera fechas y ninguna de web las omitiera. La verdad va **al revés**: en el
  formulario público las fechas son opcionales (`EnquiryForm.astro`,
  `dateFrom.optional()`) y por teléfono las apunta recepción. Arreglar el
  acoplamiento sin mirar el formulario habría dado datos igual de falsos.
- **La lección de las sesiones 53, 54 y 55, ya tres veces**: un dato puede ser
  **válido y falso a la vez**, y ningún test de invariantes lo ve — 2 032 fichas
  correctas que eran 20 personas; "María" con sexo M en todas sus fichas; quince
  solicitudes correctas recibidas todas el mismo día pidiendo estancias
  pasadas. **Hay que mirar la pantalla, y luego escribir el test.**
- **Ampliar el repertorio no arregla un acoplamiento, lo diluye** (54): lo que
  lo cierra es cambiar de mecanismo. Y **dos módulos sobre el mismo contador
  nunca son dos ritmos**, ni aunque los números parezcan distintos (`% 4` y
  `% 2` comparten el factor 2). Al sortear un rasgo, preguntarse de qué contador
  depende **el rasgo de al lado**.
- **Una clave i18n sin usar puede ser "falta la UI"** (52, y otra vez en la 55
  con `sol.recibida`/`sol.fechas`/`sol.tipo`), no "sobra la clave".
- **`getComputedStyle().boxShadow` miente sobre el anillo de foco** del DS en
  este Chrome: `--tw-ring-shadow` se lee bien pero el compuesto sale a cero. El
  anillo **sí se pinta**. Para juzgar un anillo, captura; para juzgar que la
  regla existe, la variable.
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
  **viewport**, no de la captura — para pulsar una fila, los `ref_N` de
  `read_page`. Su `left_click_drag` no dispara los pointer events de las barras
  del planning: para gestos, Playwright. **Y (55) `resize_window` y la captura se
  desincronizan tras recargar**: si la captura sale con la página metida en una
  esquina, volver a fijar el viewport; para juzgar geometría, medir el DOM
  (`getBoundingClientRect`), que no miente.
- Cambiar el esquema de color en caliente (`resize_window colorScheme`) deja el
  dashboard **a medio repintar**: recargar antes de juzgar un contraste.
- El **reset nocturno de la demo SÍ existe** (`tenants/demo/worker.ts`, cron
  `0 3 * * *` → `resetDemoData`), y **re-siembra desde `generateSeed()`**: un
  cambio del seed llega a la demo con un deploy normal, sin `--apply`.
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
  botón "Ver la demo". Ojo: `db:reset` **cierra la sesión**, hay que volver a
  entrar.
- exports/ en .gitignore. Scripts de sesión nunca se commitean.
