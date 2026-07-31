# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito al cerrar la sesión 66 (2026-08-01). La **66** (dos encargos de
> Andreu): la portada gana **las tres listas del día** —entradas, salidas y
> solicitudes en tres columnas— y el **wordmark del gestor enlaza** («Logic2B» a
> la matriz, «Campings» al sitio del producto, como en la landing).
> **Sin desplegar.** Texto de la 65 abajo.
>
> Reescrito al cerrar la sesión 65 (2026-07-31). La **65** (dos encargos de
> Andreu): el producto pasa a llamarse **«Gestor de camping»** donde era «el
> mostrador» —respetando los otros dos sentidos de la palabra— y el gestor
> estrena **portada**: cifras de hoy, rejilla de los trece módulos y las últimas
> solicitudes, en vez de aterrizar en el planning. **Desplegada.** Antes, la
> 63 y la 64. Texto de la 64 abajo.
>
> Reescrito al cerrar la sesión 64 (2026-07-31). Dos sesiones seguidas: la **63**
> (apunte prioritario de Andreu, **desplegada**) enlazó **las dos caras de la
> demo** entre sí —web ↔ mostrador, desde la landing y desde cada una a la
> otra— y destapó un **404 vivo desde ADR 0016** en el único enlace que la
> landing tenía al mostrador. La **64** (autónoma) metió **el mostrador dentro
> de la ficha de alojamiento**, precargado con su tipo, con salida conservando
> fechas cuando ese tipo no entra. **Las dos están desplegadas.** Cuando la
> próxima sesión termine, **reescribe este fichero** con el prompt de la
> siguiente.

---

## Estado en una línea

Las sesiones son **autónomas**: basta "continúa con el desarrollo de este
proyecto" y se ejecuta `docs/CONTINUA.md` completo — **incluido el cierre en
`main` también desde cloud** (permiso permanente de Andreu, 2026-07-25). El MVP
es una **demo fake** — nada de servicios externos reales. Lo último cerrado: **el
recorrido del prospecto**, por los dos extremos — que las dos caras de la demo se
encuentren entre sí (63), que la ficha de alojamiento deje reservar sin volver a
empezar (64) y que **entrar al gestor enseñe todo lo que hay** en vez de soltarte
en el planning (65), con **las tres listas del día** y el wordmark enlazado (66).

## ⚠ Lo primero de la próxima sesión

1. **Hay deuda de despliegue: la sesión 66 NO está en producción.** Lo último
   desplegado es la **65** (versión `f133e692`). La 66 no toca esquema ni datos:
   basta `pnpm --filter @logic-camp/api deploy:demo` desde local. Si la próxima
   sesión toca landing, web o marca, verificar **contra producción con
   cache-buster** (`?v=…` o `Cache-Control: no-cache`): un 200 no dice nada
   (trampa de la 62, que **volvió a morder en la 65**: `Cache-Control: no-cache`
   no bastó y `/demo/` devolvió la copia vieja con `cf-cache-status: HIT` — el
   cache-buster `?v=` sí). Ojo también con las rutas de la web del tenant: **sin
   la barra final devuelven 307**, no 404 — seguir la redirección.
2. **ADR 0030 sigue en `propuesto`** y no queda nada que vigilar: sus dos
   comprobaciones están hechas. Le toca a Andreu pasarlo a `aceptado` o
   discutirlo (Cala Sereno abre todo el año; el seed crece a 3,4 MB).

## Estado de la entrega

Producción va por la **65** (`f133e692`). En `main` sin desplegar: la **66**.

## ▶ Prompt para pegar

```
continúa con el desarrollo de este proyecto
```

## Candidatos de objetivo para la próxima sesión (elegir UNO, criterio CONTINUA)

- **[web] La regla dura de niveles está incumplida** (recomendado — es la única
  candidata que `CLAUDE.md` llama "dura"): un build `TIER=1` sin conmutador
  **sí** emite `Mostrador.*.js`. Medido en la 64 y confirmado **preexistente**
  (se construyó el código de la 63 en las mismas condiciones). El import
  dinámico del wrapper no sirve de nada mientras las rutas del funnel
  (`/reservar`, `/reserva`) se sigan generando en nivel 1: sus tres islas
  arrastran lo mismo, y el build emite 139 páginas donde un Camp Web no debería
  tener ninguna ruta de reserva. Arreglo: `getStaticPaths` vacío con
  `mode !== 'instant'`, y verificar que `_astro/` no contiene ninguna de las
  cuatro islas. **De paso** cae la hermana: el héroe de nivel 1 de la home queda
  **invisible** en un build de nivel 1 real (`Home.astro` emite
  `data-hero-nivel` siempre; `AlojamientoDetalle.astro` ya lo hace bien).
- **[seed] Los once "Aalto" seguidos de `/clientes`**: diagnóstico hecho y
  escrito dentro del test que pasa (biyección uniforme → cada apellido toca a
  `fichas/apellidos`; alargar el repertorio NO lo arregla, ya se alargó dos
  veces). Hace falta cola larga de apellidos reales sin perder la unicidad de la
  54. Objetivo de verdad, no retoque.
- **[seed] Una o dos unidades fuera de servicio** (58): el estado que la
  cabecera de Inventario explica no se ve nunca — y de paso se vería en planning
  y plano. Ojo: dar de baja resta cupo; plantarlas sin romper el relleno ni los
  invariantes.
- **[seo] `BreadcrumbList` en las guías** (61): las 25 páginas de documentación
  son "la superficie de búsqueda larga del producto" y son las únicas con
  jerarquía real (guía → página). La landing ya tiene
  `Organization`/`SoftwareApplication`/`FAQPage`; las guías, ninguno. Va en
  `Docs.astro`, que las sirve todas.
- **[B] Nadie comprueba los enlaces ENTRE las tres superficies del bundle
  compuesto** (63): es la razón de que el `/demo/admin/` durara tantas sesiones,
  y no lo cazaría un test de `apps/site` porque esas rutas solo existen cuando
  `deploy:demo` compone los tres `dist/`. Un paso post-ensamblado que recorra
  los `href` absolutos del HTML emitido y verifique que resuelven.
- **[dashboard] El enlace muerto de la sidebar** (59): «Parte de viajeros» es un
  muro de permisos para el visitante de la demo **y para cualquier recepcionista
  real**. El muro es decisión aceptada (ADR 0029); enseñar el enlace a quien
  nunca podrá abrirlo no lo es.
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
  maquetas Ads)** — `docs/FRENTE-D-ESCAPARATE.md` (mandato de Andreu,
  rectificado el mismo día: **solo campings**; hoteles y casas rurales serán un
  **clon del proyecto**, nunca una ampliación de este). Cuelga del **ADR D0 con
  Andreu presente** y su momento es "backend demo muy avanzado". La 60 ya
  adelantó lo adelantable (D5.2 temprana); la **galería** espera a tener **≥3
  demos clicables**. El candidato `[4.x/web]` que sí era de ahora **queda
  cerrado en la 64**.
- **El favicon** (ver BACKLOG `[marca]`): decisión de marca.
- Verificar SES.Hospedajes real / secrets (opción B histórica).
- Fase 9 alta real (`new:camping --apply`), reseed remoto `--apply`.
- Traducciones de guías: descartadas con motivo (ADR 0025 §3).

## Trampas conocidas (heredadas + las nuevas de las sesiones 63–66)

- **NUEVA (66) — un estado que hoy vale lo mismo en TODAS las filas no informa,
  decora.** La columna de salidas marcaba con chip lo pendiente; con los datos
  reales de una mañana normal (10 salidas vivas, 0 con check-out) eso son diez
  chips negros idénticos. No se ve en la captura —parece deliberado—: se ve
  **contando los datos** (`?departuresOn=` y mirar cuántos `checkedOutAt` hay).
  Criterio que queda: el chip marca lo que ya pasó por recepción, el gris es el
  defecto.

- **NUEVA (65) — «mostrador» significa TRES cosas en este repo y solo una es el
  nombre del producto.** Antes de renombrar nada: (1) el **widget de
  disponibilidad** de la web pública (`c.mostrador`, `#mostrador`,
  `Mostrador.tsx`) es el elemento firma del nivel 3 (ADR 0006); (2) el **canal
  `walkin`** y la prosa de las guías («el ordenador del mostrador») son el mueble
  de recepción; (3) solo el **dashboard** era el nombre a cambiar. Un
  `sed` global habría roto el vocabulario de dominio y el ADR 0006 de una vez.
- **NUEVA (65) — en CSS grid, `1fr` es `minmax(auto, 1fr)`, y `auto` respeta el
  ancho mínimo INTRÍNSECO del contenido.** Meter el mostrador (cuatro campos y
  un botón) en la columna `1fr` de una rejilla `[1.5fr_1fr]` no lo comprimió:
  **encogió la otra columna** hasta dejar la galería en una tira de ~300px. No
  hay aviso de ningún tipo; se ve midiendo el `boundingBox` de la columna
  vecina, no la del elemento que acabas de añadir.
- **NUEVA (64) — "no arrastra el motor en el bundle" hay que MEDIRLO, y hoy sale
  que sí lo arrastra.** El import dinámico de `HeroMostrador.astro` protege una
  puerta mientras las páginas del funnel dejan la otra abierta. Para juzgarlo:
  `TIER=1` **y** `demoTierSwitch: false` (con el conmutador puesto la demo
  incluye el motor **a propósito**, ADR 0013), y mirar `dist/_astro/*.js`. Y
  antes de anotarlo como regresión propia, **construir el commit anterior en las
  mismas condiciones** — esta resultó ser preexistente.
- **NUEVA (63) — un 404 puede sobrevivir sesiones enteras si nadie enlaza entre
  superficies.** `/demo/admin/` llevaba roto desde ADR 0016 y era el único
  enlace de la landing al mostrador. `apps/site` no tiene tests, y aunque los
  tuviera, `/demo/` y `/admin/` **no existen dentro del site**: solo aparecen
  cuando `deploy:demo` compone los tres `dist/`. Tras tocar enlaces entre
  superficies, verificar contra el bundle compuesto (Worker local), no contra el
  dev server de una sola app.
- **NUEVA (63) — el panel del navegador se cuelga a mitad de sesión** (`computer`
  devuelve "Browser pane is currently hidden" y agota los 30 s). Ya pasó en la
  59 de otra forma. El camino fiable sigue siendo **Playwright contra el
  Worker** (`pnpm exec playwright test` desde `apps/web`), que además sirve para
  capturar: un spec de usar y tirar en `e2e/zz-*.spec.ts`, borrado al terminar.
- **NUEVA (62) — un renombrado "de 34 apariciones" no cubre lo que no es i18n.**
  Tras un rename, `grep -rn "<nombre viejo>" apps/ packages/ tenants/`
  incluyendo `*.html` y las cadenas de servidor, no solo los JSON de i18n.
- **NUEVA (62) — verificar un deploy por código de estado no verifica nada.**
  `camp.logic2b.com/` devolvía 200 con el **título anterior**: `cf-cache-status:
  HIT` sobre una copia rancia. Cache-buster (`?v=…`), y para un asset que
  conserva la URL entre versiones (`og.png`), comparar **shasum**.
- **NUEVA (62) — `pnpm check` falla de forma intermitente en `api#test`** si hay
  dev server y navegador abiertos: la suite de workerd compite por recursos. En
  aislamiento da 237/237.
- **NUEVA (61) — un asset de marca sin generador commiteado es deuda garantizada.**
  Ahora `apps/site/scripts/og.mjs` (`pnpm --filter @logic-camp/site og`) y los
  colores se **leen** del `:root` del DS, no se copian.
- **NUEVA (61) — cortar un CSS por `indexOf('.dark')` corta en un comentario.**
  Se corta por el selector: `/^\.dark\s*\{/m`.
- `git fetch` y comparar con origin/main ANTES de trabajar. El `main` local del
  contenedor suele venir viejo: `git reset --hard origin/main` antes del merge.
- **NUEVA (60) — con `transition-colors`, `getComputedStyle` en el mismo tick
  del click devuelve el color VIEJO** (t=0 de la transición). Esperar a que
  acabe la transición, o medir un clon sin `transition-*`.
- **NUEVA (59) — un `<form>` de más y el Intro guarda otra cosa.** La sumisión
  implícita de un `<input>` va a **`input.form`**, no al botón más cercano. No
  lo ve ningún test de markup. Al separarlos, **el toast también**.
- **NUEVA (59) — `@fontsource/<fuente>/<peso>.css` arrastra TODOS los subsets.**
  Se importa `latin-<peso>.css`. Mirar el listado de assets de la build.
- **La lección de las sesiones 53–59, ya siete veces**: un dato o un markup puede
  ser **válido y falso a la vez** y ningún test de invariantes lo ve. **Hay que
  mirar la pantalla, y luego escribir el test.**
- **NUEVA (58) — el atajo del reset local de la 56 HA MUERTO.**
  `POST /api/demo/reset` contra el wrangler dev local **cuelga workerd** con el
  seed de 3,4 MB. El camino: **parar el preview → `pnpm db:reset && pnpm db:seed`
  → relevantar**. Contra la D1 real tarda 1,2 s.
- **NUEVA (58) — navegar el dashboard cambiando el hash por URL o con
  `.click()` sintético deja DOS enlaces activos en la sidebar.** Con click real,
  perfecto.
- **NUEVA (58) — si la API de Cloudflare da timeout desde la máquina de Andreu,
  prueba `-4`/`-6` antes de culpar a wrangler** (parece caída y es DNS).
- **Un sorteo dentro de un `if` no es un sorteo, es un desplazamiento** (57).
- **La web pública imprime los rangos de temporada SIN AÑO** (57).
- **Un umbral que la temporada alta cumple sola no comprueba nada** (57): lo
  que la demo tiene que enseñar todos los días **se planta**.
- **Un test verde puede describir mal lo que garantiza** (57): lo que NO
  garantiza, escrito dentro del test.
- **En una lista de filas-`<button>`, ninguna columna `auto`** (55/56/59).
- **Cuando cabecera y fila comparten rejilla, la fila con borde arranca 1px
  después** (59): la cabecera necesita `border border-transparent`.
- **`@container` y su `@md:`/`@3xl:` no pueden ir en el MISMO elemento** (56).
- **Una media query `lg:` mide la PANTALLA, y lo que estrecha una lista casi
  nunca es la pantalla** (56).
- **En una rejilla, dos fichas cortas y una alta no son tres celdas** (59).
- **Un test sobre un solo año comprueba una tirada, no una propiedad** (55); la
  muestra canónica está en `seed.test.ts` (`ANCLAS`).
- **Al sortear un rasgo nuevo del seed, mirar de qué contador depende el rasgo
  de al lado** (54). La solución es un PRNG propio.
- **`getComputedStyle().boxShadow` miente sobre el anillo de foco**; y
  `:focus-visible` no lo activa `.focus()`: Tab de verdad.
- **El primitivo `Table` y el scroll (52)**: cabecera pegajosa =
  `containerClassName="min-h-0 flex-1 overflow-auto"` (hay test).
- **La densidad se rompe donde la lista se estrecha (52)**: verificar SIEMPRE
  con el panel lateral abierto.
- El **seed no trae notificaciones ni reembolsos**: `POST /api/enquiries` (201)
  genera 2 filas de `notifications_log` por solicitud.
- **`pnpm check` reconstruye `apps/site/dist` y se lleva por delante `/demo` y
  `/admin`** — para verificar en navegador hay que recomponer:
  `pnpm --filter @logic-camp/site build && pnpm --filter @logic-camp/dashboard
  build && rm -rf apps/site/dist/admin && cp -r apps/dashboard/dist
  apps/site/dist/admin`. Para la web del tenant, además: `BASE_PATH=/demo pnpm
  --filter @logic-camp/web build && rm -rf apps/site/dist/demo && cp -r
  apps/web/dist apps/site/dist/demo`.
- **Iterar el dashboard con el preview levantado (55)**: rebuild + copiar +
  **recarga real**. `pnpm db:reset` mata el `wrangler dev`: parar antes.
- En Playwright, ir de `/admin/` a `/admin/#/…` no recarga → `await p.reload()`.
- **`/api/*` va con rate limit de 60 req/min por IP** (`createRateLimiter`) —
  los helpers de `e2e/base.ts` barren de una petición en una por esto.
- En el contenedor cloud, Playwright usa `/opt/pw-browsers/chromium` si existe.
  Segfault de workerd sobre `reset.test.ts` = solo contenedor cloud.
- Cambiar el esquema de color en caliente deja el dashboard a medio repintar:
  **recargar antes de juzgar un contraste**.
- El **reset nocturno de la demo SÍ existe** (`tenants/demo/worker.ts`, cron
  `0 3 * * *`) y re-siembra con el ancla del día: un cambio del seed llega a la
  demo con un deploy normal. **Confirmado en producción el 2026-07-29**.
- `seed.sql` gitignored; si el plano sale "automático" o falta `modules.*`:
  `pnpm db:reset && pnpm db:seed`.
- Login del dashboard: para entrar como visitante, botón "Ver la demo" o
  `POST /api/demo/sign-in` (el reset **cierra la sesión**). Con credenciales:
  gerencia@calasereno.example / calasereno — hace falta ese rol para **Parte de
  viajeros** e Informes elevados.
- exports/ en .gitignore. Scripts de sesión nunca se commitean.
