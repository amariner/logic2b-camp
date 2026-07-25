# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito al cerrar la sesión 54 (2026-07-25: los clientes que vuelven en el
> seed —BACKLOG `[10]`, cerrado— y, de paso, la lista de clientes deja de
> leerse como generada: 161 apellidos, parejas nombre+apellido únicas por
> construcción y el sexo saliendo del nombre. Sesión autónoma local).
> Cuando la próxima sesión termine, **reescribe este fichero** con el prompt de
> la siguiente.

---

## Estado en una línea

Las sesiones son **autónomas**: basta "continúa con el desarrollo de este
proyecto" y se ejecuta `docs/CONTINUA.md` completo — **incluido el cierre en
`main` también desde cloud** (permiso permanente de Andreu, 2026-07-25). El MVP
es una **demo fake** — nada de servicios externos reales. Lo último cerrado:
`/clientes` **por fin enseña lo que vende**. El seed creaba un huésped nuevo por
reserva, así que la columna "Reservas" valía 1 en las 2 032 fichas; ahora hay un
censo de habituales y **1 521 fichas con 1, 2, 3 y 4 estancias** (1 168 / 223 /
102 / 28). Y al mirarlo en el navegador saltó el mismo defecto de la sesión 53
una columna a la derecha: con 40 apellidos, la primera página salía entera
"Andersen" → 161 apellidos y, sobre todo, **otro mecanismo** (recorrido de las
6 440 parejas a saltos coprimos), que convierte "casi no se repiten" en
**garantía de que no pueden repetirse**.

## ▶ Prompt para pegar

```
continúa con el desarrollo de este proyecto
```

## Deuda de despliegue

**Sí — y sigue sin necesitar `--apply`.** Las sesiones 53 y 54 no se han
desplegado. Ninguna toca esquema: el reset nocturno (`tenants/demo/worker.ts`,
cron `0 3 * * *` → `resetDemoData`) re-siembra desde `generateSeed()`, que es
**código desplegado**. Con un `pnpm --filter @logic-camp/api deploy:demo`
normal, la demo remota se pone al día sola a las 3:00 de la madrugada
siguiente; para verlo antes, el botón de restablecer del banner de demo.

Recordatorio general: el deploy es manual desde local y **lleva schema, no
datos**; solo un objetivo que dependa de datos que el reset **no** regenera
necesita `pnpm db:seed:remote --apply` (doble candado, solo con Andreu).

## Candidatos de objetivo para la próxima sesión (elegir UNO, criterio CONTINUA)

- **[B1] Seguir con los primitivos del DS, 2–3 pantallas** (recomendado: es lo
  único visual con final claro que queda a mano). Van 5 de 11 y **ninguna de las
  6 restantes es una tabla**: Informes e Inventario son rejillas de tiles,
  Llegadas y Solicitudes son listas con acciones por fila (convertirlas a tabla
  sería una regresión), Parte y Ajustes son formulario y detalle. Lo que les
  toca es `Card`/`Input`/`Label`/`Badge`, no `Table*`. **Mirar cada una antes de
  tocarla** — en las tres últimas migraciones el hallazgo de valor no estuvo en
  el markup sino en lo que el markup destapaba.
- **[C1] Aviso inline del pendiente negativo** al mover una reserva ya pagada a
  un precio menor (hoy la ficha lo enseña después; el diálogo de precio no).
  Acotado, verificable con el planning.
- **[10] Informes con la memoria comercial ya sembrada**: ahora que hay clientes
  que repiten, mirar si `/informes` puede decir algo que antes era imposible
  (cuántos vuelven, qué porcentaje de las reservas son de repetidores). **Ojo**:
  es feature nueva, no acabado — comprobar antes si cabe sin abrir fase.
- **[C2] Limpiar claves i18n huérfanas del dashboard** — con el aviso del
  BACKLOG: siete de las "huérfanas" eran cabeceras que faltaban por pintar. Una
  clave sin usar puede significar "falta la UI". Barato, pero es limpieza.
- **[B1] Rename literal de tokens camping→DS** (~400 usos, mecánico; valor demo
  nulo — sólo si no hay nada visual pendiente).

## Bloqueado (NO tocar en sesión autónoma, esperar a Andreu + credenciales)

- Verificar SES.Hospedajes real / secrets (opción B histórica).
- Fase 9 alta real (`new:camping --apply`), reseed remoto `--apply`.
- Traducciones de guías: descartadas con motivo (ADR 0025 §3).

## Trampas conocidas (heredadas + dos nuevas de la sesión 54)

- `git fetch` y comparar con origin/main ANTES de trabajar. El `main` local del
  contenedor suele venir viejo: `git reset --hard origin/main` antes del merge.
- **NUEVA (54) — ampliar el repertorio no arregla un acoplamiento, lo diluye.**
  La sesión 53 desacopló nombre y apellido y subió las listas a 40 × 40; la 54
  descubrió que **la primera página de `/clientes` seguía siendo un bloque del
  mismo apellido** (40 apellidos ÷ 1 500 fichas = 38 cada uno, y la lista se
  ordena por apellido). Y al ampliar a 161, `bkgN % 40` y `floor(bkgN/40) % 161`
  habrían vuelto a acoplarse. Lo que lo cierra es **cambiar de mecanismo**:
  numerar el espacio de parejas y recorrerlo a saltos coprimos con su tamaño —
  pasa por todas antes de repetir ninguna. Entonces el test se puede escribir en
  absoluto (`new Set(nombres).size === nombres.length`) en vez de con un umbral,
  y **un umbral que se cumple es justo lo que deja pasar estos fallos**.
- **NUEVA (54) — dos módulos sobre el mismo contador nunca son dos ritmos**, ni
  aunque los números parezcan distintos. `bkgN % 4 === 0` (quién entra en el
  censo de habituales) y `bkgN % 10` (cuántas estancias le tocan) comparten el
  factor 2: el índice impar de la forma **no salía jamás** y el tope de 4
  estancias no existía. Se arregló sorteando con el **tamaño del censo**, que es
  otro contador de verdad. Regla: al sortear un rasgo, preguntarse de qué
  contador depende **el rasgo de al lado**.
- **Un dato puede ser válido y falso a la vez** (53, 54): el seed generaba 2 032
  fichas correctas que eran 20 personas; y "María" iba con sexo M en todas sus
  fichas porque el sexo salía del mismo contador que el nombre. **Ningún test de
  invariantes ve esto** — hay que mirar la pantalla, y luego escribir el test.
- **`getComputedStyle().boxShadow` miente sobre el anillo de foco** del DS en
  este Chrome: `--tw-ring-shadow` se lee bien pero el compuesto sale a cero. El
  anillo **sí se pinta**. Para juzgar un anillo, captura; para juzgar que la
  regla existe, la variable.
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
  **viewport**, no de la captura — para pulsar una fila, los `ref_N` de
  `read_page`. Su `left_click_drag` no dispara los pointer events de las barras
  del planning: para gestos, Playwright.
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
