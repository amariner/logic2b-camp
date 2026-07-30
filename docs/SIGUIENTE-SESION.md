# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito al cerrar la sesión 60 (2026-07-30, con Andreu). Tres mandatos
> suyos: **el header de la landing a los raíles de `logic2b-norte`** (1440px /
> gutter 24→32 / 50px / botones 10px), **prioridad a marketing** → la landing
> gana la sección de **escalabilidad** (franja de cifras) y la **escalera como
> recorrido** («¿cuántas parcelas tienes?») — la versión temprana de D5.2 que
> el Frente D dejaba adelantar — y **la landing queda en DOS idiomas (es/en)**:
> vende al dueño, no al campista; los seis idiomas siguen en la web de tenant
> (`apps/web`), que no se toca. Cuando la próxima sesión termine, **reescribe
> este fichero** con el prompt de la siguiente.

---

## Estado en una línea

Las sesiones son **autónomas**: basta "continúa con el desarrollo de este
proyecto" y se ejecuta `docs/CONTINUA.md` completo — **incluido el cierre en
`main` también desde cloud** (permiso permanente de Andreu, 2026-07-25). El MVP
es una **demo fake** — nada de servicios externos reales. Lo último cerrado:
**la landing vende escalabilidad (D5.2 temprana)** y el header en los raíles
de norte; antes, B1 11/11 y el logo «Logic2B Campings».

## ⚠ Lo primero de la próxima sesión

1. **La deuda de despliegue son ya TRES sesiones (58, 59 y 60), y las dos
   últimas SE VEN.** El logo (59) y ahora **la landing de venta entera** (60:
   header nuevo, sección de escalabilidad, recorrido de niveles) — lo primero
   que ve un prospecto en `camp.logic2b.com`. Un
   `pnpm --filter @logic-camp/api deploy:demo` normal — sin esquema, sin
   datos. Es el primer paso natural de la próxima sesión **local** (necesita
   credenciales de Cloudflare: si la sesión es autónoma, dejarlo anotado otra
   vez y elegir otro objetivo).
2. **ADR 0030 sigue en `propuesto`** y ya no queda nada que vigilar: sus dos
   comprobaciones están hechas (reset a mano en 1,2 s en la 58; **cron de las
   3:00 confirmado en la 59** — las reservas remotas traen el `createdAt` del
   día). Le toca a Andreu pasarlo a `aceptado` o discutirlo. Los dos puntos que
   piden su opinión están escritos allí: Cala Sereno abre todo el año y el seed
   crece a 3,4 MB.

## Estado de la entrega

**Sesiones 58, 59 y 60 en `main`** (push al cerrar). Desplegado en producción:
hasta la 57 (versión `9d85c8c5`, 2026-07-28).

## ▶ Prompt para pegar

```
continúa con el desarrollo de este proyecto
```

## Candidatos de objetivo para la próxima sesión (elegir UNO, criterio CONTINUA)

- **[4.x/web] El mostrador dentro de la página de alojamiento** (recomendado —
  el mejor candidato cliente-visible que queda): el CTA del detalle en nivel 3
  (`AlojamientoDetalle.astro:57`) devuelve al visitante a la home
  (`#mostrador`) **sin precargar el tipo** que estaba mirando — justo donde se
  pierden reservas. Montar el mostrador (o una variante compacta) en el detalle,
  precargado con ese `unit_type`; conservar la degradación de nivel 1/2 →
  contacto. Sin API nueva. Observación de Andreu verificada en código (58).
- **[seed] Los once "Aalto" seguidos de `/clientes`**: diagnóstico hecho y
  escrito dentro del test que pasa (biyección uniforme → cada apellido toca a
  `fichas/apellidos`; alargar el repertorio NO lo arregla, ya se alargó dos
  veces). Hace falta cola larga de apellidos reales sin perder la unicidad de la
  54. Objetivo de verdad, no retoque.
- **[seed] Una o dos unidades fuera de servicio** (58): el estado que la
  cabecera de Inventario explica no se ve nunca — y de paso se vería en planning
  y plano. Ojo: dar de baja resta cupo; plantarlas sin romper el relleno ni los
  invariantes.
- **[marca] Rematar el cambio de logo** (nuevo, 59): la **OG image** de la
  landing sigue llevando el isotipo, así que al compartir el enlace se ve una
  marca distinta de la de la cabecera. Regenerarla con el wordmark. El
  **favicon** es decisión de Andreu, no de sesión autónoma (ver BACKLOG).
- **[dashboard] El enlace muerto de la sidebar** (nuevo, 59): «Parte de
  viajeros» es un muro de permisos para el visitante de la demo **y para
  cualquier recepcionista real** — el muro es decisión aceptada (ADR 0029), pero
  enseñar el enlace a quien nunca podrá abrirlo no lo es. Ocultarlo por rol, o
  explicar «esto es de gerencia» desde el propio menú.
- **[C4] La ficha de reserva en móvil**: `BookingPanel` es `w-[360px]
  shrink-0`; a 375px deja **15px** a la lista. Debería ser `Sheet` a pantalla
  completa bajo `md`. Afecta a todas las pantallas que abren ficha.
- **[B1] El último campo de fecha crudo**: queda `Planning.tsx` (Parte cayó en
  la 59, Llegadas en la 56). Va además **sin nombre accesible**.
- **[seed] `created_at` de las ~3 500 reservas es el ancla**: en `/reservas`
  ordenado por alta todas empatan. Derivarlo del canal (mostrador = el día de
  llegada; web = meses antes).

## Bloqueado (NO tocar en sesión autónoma, esperar a Andreu + credenciales)

- **El resto del Frente D (portfolio de 12 demos, galería de la landing,
  maquetas Ads)** — documentado en `docs/FRENTE-D-ESCAPARATE.md` (sesión 58,
  mandato de Andreu, **rectificado el mismo día: solo campings** — hoteles y
  casas rurales serán un **clon del proyecto** cuando toque, nunca una
  ampliación de este). Cuelga del **ADR D0 con Andreu presente** y su momento
  es "backend demo muy avanzado". **La 60 ya adelantó lo adelantable** (D5.2
  temprana: franja de cifras + recorrido, con Andreu presente); la **galería**
  espera a tener **≥3 demos clicables**. Lo único del tema que SÍ es de ahora:
  el candidato [4.x/web] del mostrador en el detalle (arriba). Regla mientras
  tanto: seguir usando el vocabulario del glosario (unidad/tipo), que es lo
  que abarata la parametrización del seed y el clon.
- **El favicon** (ver BACKLOG `[marca]`): cambiarlo o no es decisión de marca.
- Verificar SES.Hospedajes real / secrets (opción B histórica).
- Fase 9 alta real (`new:camping --apply`), reseed remoto `--apply`.
- Traducciones de guías: descartadas con motivo (ADR 0025 §3).

## Trampas conocidas (heredadas + las nuevas de las sesiones 59–60)

- `git fetch` y comparar con origin/main ANTES de trabajar. El `main` local del
  contenedor suele venir viejo: `git reset --hard origin/main` antes del merge.
- **NUEVA (60) — con `transition-colors`, `getComputedStyle` en el mismo tick
  del click devuelve el color VIEJO** (t=0 de la transición): parecía que
  `aria-pressed:bg-primary` no aplicaba, y aplicaba perfectamente. Para juzgar
  un estilo tras una interacción: esperar a que acabe la transición (o medir
  un clon sin `transition-*`).
- **NUEVA (59) — un `<form>` de más y el Intro guarda otra cosa.** La sumisión
  implícita de un `<input>` va a **`input.form`**, no al botón más cercano: dos
  bloques con botón propio dentro de un mismo `<form>` es un guardado silencioso
  y equivocado. No lo ve ningún test de markup; se ve pulsando Intro y mirando
  la petición. Al separarlos, **el toast también hay que separarlo**.
- **NUEVA (59) — `@fontsource/<fuente>/<peso>.css` arrastra TODOS los subsets.**
  Metió 180 kB de Poppins Devanagari para pintar dos palabras. Se importa
  `latin-<peso>.css`. Mirar el listado de assets de la build, que lo canta.
- **NUEVA (59) — el panel del navegador de esta sesión no entregaba los clicks**
  (`computer` con `ref` o con coordenadas correctas → `activeElement` seguía
  siendo `BODY`, y `resize_window` reportaba 1366×800 mientras la captura salía
  a otra escala). Para gestos reales y medidas fiables: **Playwright** contra el
  Worker (`node_modules/.pnpm/playwright@*/node_modules/playwright/index.mjs` —
  no hay `playwright` resoluble desde la raíz) y **medir el DOM**, no la captura.
- **La lección de las sesiones 53–59, ya siete veces**: un dato o un markup puede
  ser **válido y falso a la vez** y ningún test de invariantes lo ve. **Hay que
  mirar la pantalla, y luego escribir el test.** En la 59 lo que se veía bien
  era el markup, y lo roto era el Intro.
- **NUEVA (58) — el atajo del reset local de la 56 HA MUERTO.**
  `POST /api/demo/reset` contra el wrangler dev local **cuelga workerd** con el
  seed de 3,4 MB: 180 s sin contestar y el proceso deja de servir hasta
  `GET /`. El camino es: **parar el preview → `pnpm db:reset && pnpm db:seed`
  (el CLI va por fichero y tarda segundos) → relevantar** (`preview_start`
  `name: "api"`). Contra la D1 real desplegada tarda 1,2 s — es un límite del
  miniflare local, no del producto. Para sembrar con otra ancla sigue valiendo
  `SEED_ANCHOR=2026-01-15 pnpm --filter @tenant/demo seed:sql` + `wrangler d1
  execute … --file`, con el preview parado.
- **NUEVA (58) — navegar el dashboard cambiando el hash por URL o con
  `.click()` sintético deja DOS enlaces activos en la sidebar** (el
  `aria-current` viejo no se limpia; el contenido sí cambia). Con click real de
  puntero, perfecto. Para verificar en navegador: clicks reales, o recargar tras
  navegar por URL — y no diagnosticar como defecto lo que es el artefacto.
- **NUEVA (58) — si la API de Cloudflare da timeout desde la máquina de Andreu,
  prueba `-4`/`-6` antes de culpar a wrangler**: el resolutor DNS de la red
  local tarda 200–300 ms por consulta y a ratos se atasca cuando se piden A y
  AAAA a la vez (google va, Cloudflare no — parece caída y es DNS).
- **Un sorteo dentro de un `if` no es un sorteo, es un desplazamiento** (57).
  Los cuatro PRNGs del seed se consumen **una vez por reserva y sin
  condiciones**; la propiedad que lo vigila: las doce anclas de 2026 producen
  el mismo reparto de estancias.
- **La web pública imprime los rangos de temporada SIN AÑO** (57): ventana de
  siembra y temporada declarada son cosas distintas (`SEED_FROM`/`SEED_TO` vs
  `sea_apertura`).
- **Un umbral que la temporada alta cumple sola no comprueba nada** (57): lo
  que la demo tiene que enseñar todos los días **se planta**, después del
  relleno. Y al plantar, si no hay hueco, **se acorta la estancia** antes que
  renunciar a la unidad.
- **Un test verde puede describir mal lo que garantiza** (57): lo que NO
  garantiza, escrito dentro del test (ej.: los once "Aalto").
- **En una lista de filas-`<button>`, ninguna columna `auto`** (55); si hay un
  botón de acción fuera del `<button>` de la fila, el hueco se reserva para
  toda la lista o para ninguna (56). Y si la fila ocupa todo el ancho, un
  `justify-between` manda el control al otro extremo del lienzo (59: 810px).
- **Cuando cabecera y fila comparten rejilla, la fila con borde arranca 1px
  después** (59): la cabecera necesita `border border-transparent`, o las dos
  columnas no coinciden.
- **`@container` y su `@md:`/`@3xl:` no pueden ir en el MISMO elemento** (56).
  No falla ruidoso: la consulta no coincide nunca. El `@container` va en el
  padre.
- **Una media query `lg:` mide la PANTALLA, y lo que estrecha una lista casi
  nunca es la pantalla** (56) — en `/llegadas` era la ficha de reserva.
- **En una rejilla, dos fichas cortas y una alta no son tres celdas** (59): la
  fila la estira la más alta y las cortas dejan hueco muerto. Las cortas se
  apilan en UNA celda.
- **Un test sobre un solo año comprueba una tirada, no una propiedad** (55), y
  desde la 57 tampoco basta un solo día: la muestra canónica está en
  `seed.test.ts` (`ANCLAS`).
- **Al sortear un rasgo nuevo del seed, mirar de qué contador depende el rasgo
  de al lado** (54). La solución es un PRNG propio.
- **`getComputedStyle().boxShadow` miente sobre el anillo de foco** en este
  Chrome: para juzgar un anillo, captura; para la regla, la variable. Y
  `:focus-visible` no lo activa `.focus()`: Tab de verdad.
- **El primitivo `Table` y el scroll (52)**: cabecera pegajosa =
  `containerClassName="min-h-0 flex-1 overflow-auto"` (hay test).
- **La densidad se rompe donde la lista se estrecha (52)**: verificar SIEMPRE
  con el panel lateral abierto.
- El **seed no trae notificaciones ni reembolsos**: `POST /api/enquiries` (201)
  genera 2 filas de `notifications_log` por solicitud.
- **`pnpm check` reconstruye `apps/site/dist` y se lleva por delante `/demo` y
  `/admin`** — para verificar el dashboard en navegador hay que recomponer:
  `pnpm --filter @logic-camp/site build && pnpm --filter @logic-camp/dashboard
  build && rm -rf apps/site/dist/admin && cp -r apps/dashboard/dist
  apps/site/dist/admin`. Para la web del tenant, además: `BASE_PATH=/demo pnpm
  --filter @logic-camp/web build && rm -rf apps/site/dist/demo && cp -r
  apps/web/dist apps/site/dist/demo`.
- **Iterar el dashboard con el preview levantado (55)**: `wrangler dev` sirve
  `apps/site/dist` → tras cada cambio, rebuild + copiar + **recarga real**
  (`window.location.reload()`; navegar a la misma URL con hash no recarga).
  `pnpm db:reset` mata el `wrangler dev` que esté corriendo: parar antes.
- En Playwright, ir de `/admin/` a `/admin/#/…` no recarga → `await p.reload()`.
  El planning vive en `/`; con `?date=&unit=unt_…` la virtualización desplaza.
- **`/api/*` va con rate limit de 60 req/min por IP** (`createRateLimiter`).
- En el contenedor cloud, Playwright usa `/opt/pw-browsers/chromium` si existe
  (`CHROMIUM_PATH` manda). Segfault de workerd sobre `reset.test.ts` = solo
  contenedor cloud (57/57 local).
- Cambiar el esquema de color en caliente deja el dashboard a medio repintar:
  **recargar antes de juzgar un contraste**.
- El **reset nocturno de la demo SÍ existe** (`tenants/demo/worker.ts`, cron
  `0 3 * * *` → `resetDemoData`) y re-siembra desde `generateSeed()` con el
  ancla del día: un cambio del seed llega a la demo con un deploy normal.
  **Confirmado corriendo en producción el 2026-07-29** (sesión 59).
- `seed.sql` gitignored; si el plano sale "automático" o falta `modules.*`:
  `pnpm db:reset && pnpm db:seed`.
- Login del dashboard: para entrar como visitante, botón "Ver la demo" o
  `POST /api/demo/sign-in` (el reset/`db:reset` **cierra la sesión**: volver a
  entrar). Con credenciales: gerencia@calasereno.example / calasereno — hace
  falta ese rol para ver **Parte de viajeros** e Informes elevados. El
  formulario React no responde a eventos sintéticos por coordenadas: `ref_N`
  del árbol de accesibilidad o `fetch` a `/api/auth/sign-in/email`.
- exports/ en .gitignore. Scripts de sesión nunca se commitean.
