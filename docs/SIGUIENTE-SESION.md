# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito al cerrar la sesión 57 (2026-07-27: **el ancla móvil** —BACKLOG
> `[10]`, ADR 0030 `propuesto`—: el seed tenía un "hoy" y el dashboard tenía
> otro). Sesión autónoma local, con el dev levantado.
> Cuando la próxima sesión termine, **reescribe este fichero** con el prompt de
> la siguiente.

---

## Estado en una línea

Las sesiones son **autónomas**: basta "continúa con el desarrollo de este
proyecto" y se ejecuta `docs/CONTINUA.md` completo — **incluido el cierre en
`main` también desde cloud** (permiso permanente de Andreu, 2026-07-25). El MVP
es una **demo fake** — nada de servicios externos reales. Lo último cerrado: el
**ancla del seed es hoy**. Hasta ayer todo se derivaba del 15 de julio mientras
el dashboard miraba el día real, así que el botón de **check-out no aparecía
nunca, ningún día del año**, y fuera de abril–octubre `/llegadas` salía vacía.
Ahora el año entero está sembrado (y dos meses y medio por cada lado), la
recepción distingue cinco situaciones alrededor de "hoy" y lo que el sorteo no
puede garantizar —que todos los días haya los dos gestos— **se planta**.

## ⚠ Lo primero de la próxima sesión con Andreu delante

**ADR 0030 está en estado `propuesto`.** Reabre una decisión que ADR 0013 §1
había cerrado con motivo, así que le toca a Andreu leerlo y pasarlo a `aceptado`
(o discutirlo). Los dos puntos que más merecen su opinión están escritos allí:

1. **Cala Sereno pasa a abrir todo el año**, y con eso el estado "cerrado" del
   motor deja de verse en la web pública de la demo. Se aceptó porque un mes de
   pantallas vacías cuesta más que un argumento de conversación, pero es una
   decisión de producto, no técnica.
2. **El seed pasa de 1,95 a 3,4 MB** (53 → 84 sentencias en el `db.batch()` del
   reset nocturno). Verificado contra D1 real en workerd, pero **conviene mirar
   el cron tras el primer `deploy:demo`**: si fallara, la demo se queda con los
   datos de la víspera y no avisa nadie.

## Estado de la entrega

**Sesión 57 en `origin/main`.**

## ▶ Prompt para pegar

```
continúa con el desarrollo de este proyecto
```

## Deuda de despliegue

**Sí — y sigue sin necesitar `--apply`.** Las sesiones 53, 54, 55, 56 y 57 no se
han desplegado. Ninguna toca esquema: el reset nocturno (`tenants/demo/worker.ts`,
cron `0 3 * * *` → `resetDemoData`) re-siembra desde `generateSeed()`, que es
**código desplegado**. Con un `pnpm --filter @logic-camp/api deploy:demo` normal,
la demo remota se pone al día sola a las 3:00 de la madrugada siguiente; para
verlo antes, el botón de restablecer del banner de demo. **Desde la 57 eso vale
doble**: el ancla del reset es el día en que corre, así que la demo desplegada se
mantiene al día ella sola sin volver a tocarla.

Recordatorio general: el deploy es manual desde local y **lleva schema, no
datos**; solo un objetivo que dependa de datos que el reset **no** regenera
necesita `pnpm db:seed:remote --apply` (doble candado, solo con Andreu).

## Candidatos de objetivo para la próxima sesión (elegir UNO, criterio CONTINUA)

- **[B1] Informes e Inventario** (recomendado). Rejillas de tiles → `Card` del
  DS; quedan **4 de 11** para cerrar B1. En Informes hay un defecto ya visible y
  anotado: el titular "Ingresos (por llegada)" ocupa dos líneas y **hunde su
  cifra** respecto de las otras cuatro tarjetas. Y la regla que llevan
  confirmando cuatro sesiones seguidas: **mirar la pantalla antes de tocar el
  markup**, que el hallazgo casi nunca está donde dice el encargo.
- **[seed] Los once "Aalto" seguidos de `/clientes`**. Diagnóstico ya hecho en la
  sesión 57 y escrito dentro del test que pasa: el emparejamiento
  nombre×apellido es una biyección **uniforme**, así que cada apellido toca a
  `fichas / apellidos` fichas y la lista se ordena por apellido. **Alargar el
  repertorio no lo arregla** (ya se alargó dos veces: 40 → 161 → 242). Hace falta
  la cola larga que tienen los apellidos reales, sin perder la garantía de que no
  haya dos clientes iguales (sesión 54). Es un objetivo de verdad, no un retoque.
- **[C1] Aviso inline del pendiente negativo** al mover una reserva ya pagada a
  un precio menor (hoy la ficha lo enseña después; el diálogo de precio no).
  Acotado y verificable con el planning.
- **[C4] La ficha de reserva en móvil**: `BookingPanel` es `w-[360px] shrink-0`,
  así que a 375px deja **15px** a la lista de detrás. Debería ser `Sheet` a
  pantalla completa bajo `md`. Afecta a todas las pantallas que abren ficha.
- **[seed] `created_at` de las 3 500 reservas es el ancla**: una estancia
  terminada en mayo dice que se creó hoy, y en `/reservas` ordenado por alta
  todas empatan. Debería derivarse del canal (mostrador = el mismo día; web =
  meses antes).

## Bloqueado (NO tocar en sesión autónoma, esperar a Andreu + credenciales)

- Verificar SES.Hospedajes real / secrets (opción B histórica).
- Fase 9 alta real (`new:camping --apply`), reseed remoto `--apply`.
- Traducciones de guías: descartadas con motivo (ADR 0025 §3).

## Trampas conocidas (heredadas + cinco nuevas de la sesión 57)

- `git fetch` y comparar con origin/main ANTES de trabajar. El `main` local del
  contenedor suele venir viejo: `git reset --hard origin/main` antes del merge.
- **NUEVA (57) — un sorteo dentro de un `if` no es un sorteo, es un
  desplazamiento.** El seed tiene ahora cuatro PRNGs y todos se consumen **una
  vez por reserva y sin condiciones**. Si una tirada solo se pide en algunas
  ramas, cambiar la entrada (aquí: mover el ancla un día) desplaza la secuencia
  entera y **cambia datos que no tenían por qué cambiar**. La propiedad que lo
  vigila: las doce anclas de 2026 producen el mismo reparto de estancias.
- **NUEVA (57) — la web pública imprime los rangos de temporada SIN AÑO.** Una
  apertura declarada sobre quince meses salía en la tabla de tarifas como
  «Apertura · 15 nov – 15 feb», que dice justo lo contrario de "abierto todo el
  año". **Ventana de siembra y temporada declarada son cosas distintas** y ahora
  se declaran por separado (`SEED_FROM`/`SEED_TO` vs `sea_apertura`). Cazado en
  el navegador, no en un test.
- **NUEVA (57) — un umbral que la temporada alta cumple sola no comprueba
  nada.** El relleno por curva daba llegadas y salidas de sobra en julio y
  **una sola salida, ya cerrada,** el 15 de enero. Lo que la demo tiene que
  enseñar todos los días **se planta** (como los 15 casos de solicitudes de la
  55), y se planta **después** del relleno para no empujarle el cursor.
- **NUEVA (57) — al plantar una estancia hay que poder acortarla.** Un hueco de
  nueve noches seguidas puede no existir: en junio el parque va al 45 % pero
  troceado en estancias de tres. Antes que renunciar a la unidad, se recorta.
- **NUEVA (57) — un test verde puede describir mal lo que garantiza.** "La
  primera página de `/clientes` no es un bloque del mismo apellido" pasa con
  once "Aalto" a la vista, porque solo exige 3 apellidos en 25 filas. Lo que NO
  garantiza está ahora escrito **dentro del test**.
- **La lección de las sesiones 53–57, ya cinco veces**: un dato puede ser
  **válido y falso a la vez**, y ningún test de invariantes lo ve — 2 032 fichas
  correctas que eran 20 personas; quince solicitudes recibidas el mismo día;
  veinte reservas debiendo exactamente el 70 %; y un botón que no aparecía nunca.
  **Hay que mirar la pantalla, y luego escribir el test.**
- **En una lista de filas-`<button>`, ninguna columna `auto`** (55). No hay
  `<table>` que las alinee: cada fila es su propia rejilla. Y si hay un botón de
  acción **fuera** del `<button>` de la fila, el hueco se reserva para toda la
  lista o para ninguna fila (56: 109px de diferencia).
- **`@container` y su `@md:`/`@3xl:` no pueden ir en el MISMO elemento** (56).
  No falla ruidoso: la consulta se resuelve contra un ancestro que no existe y
  no coincide nunca. El `@container` va en el padre.
- **Una media query `lg:` mide la PANTALLA, y lo que estrecha una lista casi
  nunca es la pantalla** (56) — en `/llegadas` era la ficha de reserva.
- **Un test sobre un solo año comprueba una tirada, no una propiedad** (55), y
  desde la 57 **tampoco basta un solo día**: el reset re-siembra con la fecha en
  curso. La muestra canónica está en `seed.test.ts` (`ANCLAS`): doce meses,
  bordes de año, 29 de febrero y diez temporadas.
- **Al sortear un rasgo nuevo del seed, mirar de qué contador depende el rasgo
  de al lado** (54). `bkgN` ya lleva encima el medio de pago, el idioma, los
  habituales y (hasta la 57) el check-in. La solución es un PRNG propio.
- **`getComputedStyle().boxShadow` miente sobre el anillo de foco** del DS en
  este Chrome. Para juzgar un anillo, captura; para juzgar que la regla existe,
  la variable. Y `:focus-visible` **no** lo activa `.focus()`: Tab de verdad.
- **El primitivo `Table` y el scroll (52)**: para cabecera pegajosa,
  `containerClassName="min-h-0 flex-1 overflow-auto"` (hay test).
- **La densidad se rompe donde la lista se estrecha (52)**: verificar SIEMPRE
  con el panel lateral abierto, no solo con la lista a pantalla completa.
- El **seed no trae notificaciones ni reembolsos**: para ver `notifications_log`
  con datos, `POST /api/enquiries` (201) genera 2 filas por solicitud.
- **`pnpm check` reconstruye `apps/site/dist` y se lleva por delante `/demo` y
  `/admin`** — para verificar el dashboard en navegador hay que recomponer:
  `pnpm --filter @logic-camp/site build && pnpm --filter @logic-camp/dashboard build && rm -rf apps/site/dist/admin && cp -r apps/dashboard/dist apps/site/dist/admin`.
  Para la web del tenant, además:
  `BASE_PATH=/demo pnpm --filter @logic-camp/web build && rm -rf apps/site/dist/demo && cp -r apps/web/dist apps/site/dist/demo`.
- **Iterar el dashboard con el preview levantado (55)**: `wrangler dev` sirve
  `apps/site/dist`, así que tras cada cambio hay que **rebuild + copiar** y
  **recargar de verdad** (`window.location.reload()`) — navegar a la misma URL
  con hash **no recarga**. Y `pnpm db:reset` borra `.wrangler-demo` bajo los pies
  del `wrangler dev` y lo mata: **parar el preview, resembrar, y volver a
  levantarlo** (`preview_start` con `name: "api"`). **Atajo (56)**: para volver a
  datos limpios sin parar nada, `POST /api/demo/reset` desde la consola y luego
  `POST /api/demo/sign-in`, que el wipe borra la sesión. **Y (57)**: para
  sembrar con un ancla distinta —imprescindible para ver la demo "en enero"—
  `SEED_ANCHOR=2026-01-15 pnpm --filter @tenant/demo seed:sql` y cargar el
  `seed.sql` con `wrangler d1 execute … --file`, con el preview parado.
- En el panel del navegador, `computer` con `coordinate` usa coordenadas del
  **viewport**, no de la captura — para pulsar una fila, los `ref_N` de
  `read_page`. **Y ojo (56): un `left_click` sobre un `ref` viejo, después de
  navegar, aterriza donde caiga.** Su `left_click_drag` no dispara los pointer
  events de las barras del planning: para gestos, Playwright. **Y
  `resize_window` y la captura se desincronizan tras recargar**: volver a
  llamar a `resize_window` con medidas explícitas antes de juzgar geometría, o
  medir el DOM (`getBoundingClientRect`), que no miente.
- Cambiar el esquema de color en caliente (`resize_window colorScheme`) deja el
  dashboard **a medio repintar**: recargar antes de juzgar un contraste.
- El **reset nocturno de la demo SÍ existe** (`tenants/demo/worker.ts`, cron
  `0 3 * * *` → `resetDemoData`), y **re-siembra desde `generateSeed()`**: un
  cambio del seed llega a la demo con un deploy normal, sin `--apply`.
- En Playwright, ir de `/admin/` a `/admin/#/…` **no recarga** (sólo cambia el
  hash) → `await p.reload()` después. El **planning vive en `/`**, no en
  `/planning`; con `?date=&unit=unt_…` la virtualización desplaza hasta la unidad.
- **`/api/*` va con rate limit de 60 req/min por IP** (`createRateLimiter`).
- En el contenedor cloud, Playwright no encuentra su navegador solo: la config
  ya usa `/opt/pw-browsers/chromium` **si existe** (y `CHROMIUM_PATH` manda).
- Segfault de workerd sobre `reset.test.ts` = solo contenedor cloud (57/57 local).
- `seed.sql` gitignored; el seed LOCAL puede estar viejo → `pnpm db:reset &&
pnpm db:seed` si el plano sale "automático" o falta `modules.*`.
- Login del dashboard: el formulario React no responde a eventos sintéticos por
  coordenadas; usar los `ref_N` del árbol de accesibilidad, o `fetch` a
  `/api/auth/sign-in/email`. Demo: gerencia@calasereno.example / calasereno,
  rutas hash. **Para entrar como visitante ya no hacen falta credenciales**:
  botón "Ver la demo" (o `POST /api/demo/sign-in`). Ojo: `db:reset` **cierra la
  sesión**, hay que volver a entrar.
- exports/ en .gitignore. Scripts de sesión nunca se commitean.
