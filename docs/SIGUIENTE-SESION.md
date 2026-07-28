# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito al cerrar la sesión 58 (2026-07-28, **con Andreu**: deuda de deploy
> 53–57 saldada —versión `9d85c8c5`—, B1 Informes + Inventario al DS —9/11— y,
> en su segunda parte, el **Frente D documentado por mandato de Andreu**:
> portfolio de 12 demos + landing de escalabilidad + maquetas Ads, ver
> `docs/FRENTE-D-ESCAPARATE.md`). Cuando la próxima sesión termine,
> **reescribe este fichero** con el prompt de la siguiente.

---

## Estado en una línea

Las sesiones son **autónomas**: basta "continúa con el desarrollo de este
proyecto" y se ejecuta `docs/CONTINUA.md` completo — **incluido el cierre en
`main` también desde cloud** (permiso permanente de Andreu, 2026-07-25). El MVP
es una **demo fake** — nada de servicios externos reales. Lo último cerrado:
**Informes e Inventario al DS** (B1 en 9/11 — quedan Parte y Ajustes) y, antes,
**la deuda de deploy de cinco sesiones saldada**: `camp.logic2b.com` corre la 57
con el ancla móvil, y su reset contra D1 real tarda **1,2 s** (verificado
pulsándolo — la mitad de la vigilancia de ADR 0030 §2 ya está despejada).

## ⚠ Lo primero de la próxima sesión

1. **Comprobar que el cron de las 3:00 corrió** (la otra mitad de ADR 0030 §2).
   No hacen falta credenciales: entrar como visitante
   (`POST /api/demo/sign-in` contra `camp.logic2b.com`) y pedir
   `/api/admin/reports?from=HOY&to=HOY+1` — si devuelve la ocupación del día es
   que el reset nocturno re-ancló. Si NO corrió, la demo se queda con los datos
   de la víspera y no avisa nadie: diagnosticarlo pasa a ser EL objetivo.
2. **ADR 0030 sigue en `propuesto`** (la sesión 58 fue con Andreu pero eligió
   deploy + B1; leerlo sigue pendiente). Reabre ADR 0013 §1: le toca a Andreu
   pasarlo a `aceptado` o discutirlo. Los dos puntos que piden su opinión están
   escritos allí: Cala Sereno abre todo el año (el estado "cerrado" deja de
   verse en la web demo) y el seed crece a 3,4 MB.

## Estado de la entrega

**Sesión 58 en `main`** (push al cerrar). Desplegado en producción: hasta la 57
(versión `9d85c8c5`, 2026-07-28).

## ▶ Prompt para pegar

```
continúa con el desarrollo de este proyecto
```

## Deuda de despliegue

**Solo la sesión 58** (markup del dashboard: Informes + Inventario). Sin
esquema, sin datos: un `pnpm --filter @logic-camp/api deploy:demo` normal
cuando acumule compañía. Recordatorio general: el deploy es manual desde local
y **lleva schema, no datos**; el reset nocturno re-siembra desde
`generateSeed()` (código desplegado) con el ancla del día en que corre.

## Candidatos de objetivo para la próxima sesión (elegir UNO, criterio CONTINUA)

- **[B1] Parte y Ajustes** (recomendado): las DOS últimas pantallas — con ellas
  **B1 queda 11/11 y se cierra**. Son formulario y detalle, no tablas ni
  rejillas: lo suyo es `Card`/`Input`/`Label` donde toque. Ajustes ya usa
  `Input`/`Label`/`Switch` (le queda poco); Parte tiene además el campo de
  fecha crudo anotado abajo. Y la regla de seis sesiones seguidas: **mirar la
  pantalla antes de tocar el markup** — en Inventario (58) el encargo del
  BACKLOG describía mal el trabajo real.
- **[seed] Los once "Aalto" seguidos de `/clientes`**: diagnóstico hecho y
  escrito dentro del test que pasa (biyección uniforme → cada apellido toca a
  `fichas/apellidos`; alargar el repertorio NO lo arregla, ya se alargó dos
  veces). Hace falta cola larga de apellidos reales sin perder la unicidad de
  la 54. Objetivo de verdad, no retoque.
- **[seed] Una o dos unidades fuera de servicio** (nuevo, 58): el estado que la
  cabecera de Inventario explica no se ve nunca — y de paso se vería en
  planning y plano. Ojo: dar de baja resta cupo; plantarlas sin romper el
  relleno ni los invariantes.
- **[4.x/web] El mostrador dentro de la página de alojamiento** (nuevo, 58 —
  observación de Andreu verificada en código): el CTA del detalle en nivel 3
  (`AlojamientoDetalle.astro:57`) devuelve a la home (`#mostrador`) **sin
  precargar el tipo** que el visitante miraba — justo donde se pierden
  reservas. Montar el mostrador (o variante compacta) en el detalle
  precargado con ese `unit_type`; conservar la degradación 1/2 → contacto.
  Cliente-visible, sin API nueva: encaja de lleno en el criterio CONTINUA.
- **[C4] La ficha de reserva en móvil**: `BookingPanel` es `w-[360px]
  shrink-0`; a 375px deja **15px** a la lista. Debería ser `Sheet` a pantalla
  completa bajo `md`. Afecta a todas las pantallas que abren ficha.
- **[C1] Aviso inline del pendiente negativo** al mover una reserva pagada a un
  precio menor (hoy la ficha lo enseña después; el diálogo de precio no).
- **[seed] `created_at` de las ~3 500 reservas es el ancla**: en `/reservas`
  ordenado por alta todas empatan. Derivarlo del canal (mostrador = el día de
  llegada; web = meses antes).

## Bloqueado (NO tocar en sesión autónoma, esperar a Andreu + credenciales)

- **Frente D entero (portfolio de 12 demos, landing v2, maquetas Ads)** —
  documentado en `docs/FRENTE-D-ESCAPARATE.md` (sesión 58, mandato de Andreu),
  pero **cuelga del ADR D0 con Andreu presente** porque toca el alcance §0
  (rural/hostal/hotel además de campings), y su momento es "backend demo muy
  avanzado". Lo único del tema que SÍ es de ahora: el candidato
  [4.x/web] del mostrador en el detalle (arriba), que es deuda de la demo
  actual. Regla mientras tanto: el core no adquiere supuestos campistas
  nuevos (donde el dominio dice "unidad", no escribir "parcela").
- Verificar SES.Hospedajes real / secrets (opción B histórica).
- Fase 9 alta real (`new:camping --apply`), reseed remoto `--apply`.
- Traducciones de guías: descartadas con motivo (ADR 0025 §3).

## Trampas conocidas (heredadas + las nuevas de la sesión 58)

- `git fetch` y comparar con origin/main ANTES de trabajar. El `main` local del
  contenedor suele venir viejo: `git reset --hard origin/main` antes del merge.
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
  puntero, perfecto. Para verificar en navegador: refs de `read_page` y clicks
  reales, o recargar tras navegar por URL — y no diagnosticar como defecto lo
  que es el artefacto (está en BACKLOG como menor).
- **NUEVA (58) — si la API de Cloudflare da timeout desde la máquina de Andreu,
  prueba `-4`/`-6` antes de culpar a wrangler**: el resolutor DNS de la red
  local tarda 200–300 ms por consulta y a ratos se atasca cuando se piden A y
  AAAA a la vez (google va, Cloudflare no — parece caída y es DNS). Es
  intermitente: reintentar en ventana buena.
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
- **La lección de las sesiones 53–58, ya seis veces**: un dato puede ser
  **válido y falso a la vez** y ningún test de invariantes lo ve (…las 83
  unidades todas en servicio). **Hay que mirar la pantalla, y luego escribir el
  test.**
- **En una lista de filas-`<button>`, ninguna columna `auto`** (55); si hay un
  botón de acción fuera del `<button>` de la fila, el hueco se reserva para
  toda la lista o para ninguna (56).
- **`@container` y su `@md:`/`@3xl:` no pueden ir en el MISMO elemento** (56).
  No falla ruidoso: la consulta no coincide nunca. El `@container` va en el
  padre.
- **Una media query `lg:` mide la PANTALLA, y lo que estrecha una lista casi
  nunca es la pantalla** (56) — en `/llegadas` era la ficha de reserva.
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
- En el panel del navegador, `computer` con `coordinate` usa coordenadas del
  **viewport**, no de la captura — para pulsar, los `ref_N` de `read_page`
  (que caducan al navegar o recargar: releer). `left_click_drag` no dispara los
  pointer events del planning: para gestos, Playwright. `resize_window` y la
  captura se desincronizan tras recargar: re-fijar medidas o medir el DOM.
- Cambiar el esquema de color en caliente deja el dashboard a medio repintar:
  **recargar antes de juzgar un contraste**.
- El **reset nocturno de la demo SÍ existe** (`tenants/demo/worker.ts`, cron
  `0 3 * * *` → `resetDemoData`) y re-siembra desde `generateSeed()` con el
  ancla del día: un cambio del seed llega a la demo con un deploy normal.
- En Playwright, ir de `/admin/` a `/admin/#/…` no recarga → `await p.reload()`.
  El planning vive en `/`; con `?date=&unit=unt_…` la virtualización desplaza.
- **`/api/*` va con rate limit de 60 req/min por IP** (`createRateLimiter`).
- En el contenedor cloud, Playwright usa `/opt/pw-browsers/chromium` si existe
  (`CHROMIUM_PATH` manda). Segfault de workerd sobre `reset.test.ts` = solo
  contenedor cloud (57/57 local).
- `seed.sql` gitignored; si el plano sale "automático" o falta `modules.*`:
  `pnpm db:reset && pnpm db:seed`.
- Login del dashboard: para entrar como visitante, botón "Ver la demo" o
  `POST /api/demo/sign-in` (el reset/`db:reset` **cierra la sesión**: volver a
  entrar). Con credenciales: gerencia@calasereno.example / calasereno. El
  formulario React no responde a eventos sintéticos por coordenadas: `ref_N`
  del árbol de accesibilidad o `fetch` a `/api/auth/sign-in/email`.
- exports/ en .gitignore. Scripts de sesión nunca se commitean.
