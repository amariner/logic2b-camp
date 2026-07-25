# 0029 — Acceso a la demo sin registro: rol `demo` + puerta anónima

- **Fecha**: 2026-07-25
- **Fase**: 10 · Modo demo (parte 2 de 2 — cierra el pendiente que dejó abierto el ADR 0013 §"Qué queda fuera")
- **Estado**: **aceptado** — alcance decidido con Andreu en la sesión 50 (las tres preguntas que el ADR 0013 dejó sin responder se le plantearon explícitamente y las contestó) y este documento validado por él antes de escribir la primera línea de código.

## Contexto

`camp.logic2b.com` **es** la herramienta de venta (§0 del super prompt). Hoy la web pública se puede recorrer entera sin registro, pero el dashboard —donde vive el planning, que es la pieza firma— está tras un formulario de login. Un prospecto que llega a la landing desde un enlace, un email o una búsqueda **no puede ver el producto que se le está vendiendo**: tiene que pedir credenciales, es decir, hablar con Andreu antes de convencerse. Eso invierte el orden natural de la venta.

El ADR 0013 §"Qué queda fuera" declaró este trabajo pendiente y explicó por qué no se improvisaba: el roadmap pedía _"readonly con excepciones para tocar el planning"_ y **no definía qué excepciones**. Sus preguntas literales eran tres: ¿reasignar sí, cancelar no? ¿visitante anónimo o enlace firmado? ¿y qué pasa con lo que el visitante deje tocado? Sin esas respuestas, cualquier diseño habría sido diseño-para-lo-hipotético.

**Las tres están respondidas** (sesión 50, decisión de producto de Andreu):

1. **Puerta**: botón anónimo en el propio login. Cero fricción; el prospecto entra sin hablar con nadie. Se descarta el enlace firmado (ver alternativas).
2. **Alcance**: leer todo + **los gestos del planning** (mover, estirar, asignar) y **check-in / check-out**. Nada más muta.
3. **Limpieza**: se mantiene el reset nocturno y se añade un **botón de restablecer** al instante.

Dos hechos del terreno que hacen esto mucho más barato de lo que parecía, y que conviene dejar escritos porque contradicen notas previas:

- **El reset nocturno SÍ existe** y está desplegado (`tenants/demo/worker.ts`, cron `0 3 * * *` → `resetDemoData`, ADR 0013 §1). Una nota de sesión anterior afirmaba que no. Los datos de la demo son **desechables por construcción**: eso es lo que permite dejar que un desconocido los toque.
- **`users.role` no tiene `CHECK` en la migración** (`packages/db/migrations/0000_modelo-datos.sql:221` es un `text NOT NULL` pelado; el `enum` de Drizzle es solo tipo de TypeScript). **Añadir un rol no necesita migración** — solo tocar los cuatro sitios donde la lista está escrita.

## Decisión

### 1. Un rol nuevo, `demo`, en el nivel 0 — que no puede hacer nada hasta que se le abra la puerta explícitamente

`ROLE_LEVEL` (`apps/api/src/auth.ts:15`) pasa a:

```ts
const ROLE_LEVEL: Record<Role, number> = { demo: 0, readonly: 0, reception: 1, manager: 2, owner: 3 };
```

`demo` empata con `readonly` **a propósito**: la jerarquía sigue siendo lineal (la alternativa "tabla de permisos" ya se descartó en el ADR 0005 y sigue descartada), y el nivel 0 es el suelo. La consecuencia importante es que **el rol nace fail-closed**: sin escribir una sola línea más, un usuario `demo` obtiene exactamente lo mismo que `readonly` —los 13 GET de lectura, gracias al suelo `requireRole('readonly')` de `admin.ts:216`— y **se estrella contra un 403 en las 15 rutas que mutan y en los 4 GET elevados** (export RGPD, parte de viajeros, retención, usuarios). La excepción se abre después, a mano, en un sitio y por escrito.

Sitios a tocar (los cuatro que ya identifica el mapa, ninguno es una migración): `apps/api/src/auth.ts`, `packages/db/src/schema.ts:354`, `apps/api/src/schemas.ts:305`, `apps/dashboard/src/auth.tsx`.

**`POST /api/admin/users` no acepta `demo`.** El rol se siembra, no se provisiona: es un rol de atrezzo de la demo, no un rol que un camping real reparta a su plantilla. El Zod de alta de usuario mantiene los cuatro roles reales.

### 2. La excepción: por **acción**, no por ruta, y en dos middlewares con nombre

El gesto del planning no es una ruta: son dos. Soltar una reserva hace primero un **dry-run** (`POST /bookings/:id/requote`, ADR 0023 §"el flujo del gesto") y luego, si se confirma, un `PATCH /bookings/:id` con `action: 'move'`. Y ese mismo `PATCH` es la puerta de **las 13 acciones** de la unión discriminada (`schemas.ts:136-166`), de las que solo cinco entran en el alcance. Autorizar por ruta abriría `cancel`, `record_payment` y `refund` de regalo.

Por eso la unidad de autorización aquí es la acción:

```ts
// apps/api/src/auth.ts
/** Lo ÚNICO que el rol `demo` puede mutar (ADR 0029 §2). Todo lo demás: 403. */
export const DEMO_ACTIONS = ['move', 'reassign', 'check_in', 'check_out', 'undo_checkin'] as const;
```

- `PATCH /api/admin/bookings/:id` cambia `requireRole('reception')` por **`requireReceptionOrDemoAction()`**: para cualquier rol que no sea `demo` se comporta **exactamente** como el `requireRole('reception')` de siempre (misma comparación, mismo cuerpo de error); para `demo`, pasa solo si `action ∈ DEMO_ACTIONS`, y si no devuelve `403 { error: 'demo_readonly' }`. Lee la acción con `c.req.json()`, que Hono cachea — el handler la vuelve a leer sin coste ni segundo parseo.
- `POST /api/admin/bookings/:id/requote` cambia `requireRole('reception')` por **`requireReceptionOrDemo()`**: es un **dry-run que no escribe nada** (calcula el desglose que enseñará el diálogo), así que la excepción es completa y no necesita mirar el cuerpo.

Dos middlewares pequeños, con nombre buscable, en el mismo fichero donde vive la jerarquía. Ninguna otra ruta se toca.

**Queda fuera del alcance, con motivo**: crear y levantar **bloqueos** (sesiones 47 y 48). Son la novedad más reciente y da pena no enseñarla, pero Andreu acotó el alcance a "mover / estirar / asignar + check-in/out", y un bloqueo que un visitante deje puesto **quita inventario de forma visible** hasta el siguiente reset. Se reabre si la demo lo pide en vivo.

### 3. Un barrido que se cierra solo, calcado del de aislamiento

El riesgo real de este ADR no es lo que se abre hoy: es **la ruta que alguien escriba dentro de seis meses**. Por eso el test no es una lista de casos, es un barrido dirigido por `app.routes`, mismo patrón que `apps/api/test/isolation.test.ts` (que ya demostró que funciona: una ruta nueva queda cubierta el día que se escribe):

`apps/api/test/demo-role.test.ts` recorre el registro de Hono y, con una sesión real de rol `demo`, exige que **toda** ruta admin devuelva 403 salvo las declaradas en una constante `DEMO_PERMITIDO` (los 13 GET + las 2 excepciones). Una ruta nueva no declarada hace fallar la entrega. Además, casos explícitos: las 8 acciones NO permitidas del `PATCH` (`confirm`, `cancel`, `no_show`, `complete`, `note`, `record_payment`, `refund`, `set_payment_kind`) devuelven 403 una a una, y los 4 GET elevados siguen negados.

### 4. La puerta anónima vive en `tenants/demo/`, **nunca** en `apps/api`

Es la regla que el ADR 0013 §1 ya fijó y que aquí se respeta al pie: `apps/api/src/index.ts` sigue siendo 100% genérico —ni un nombre de Cala Sereno, ni un byte de "demo" en el bundle de un camping real—. `tenants/demo/worker.ts` **ya envuelve** el Worker genérico, así que solo tiene que interceptar tres rutas antes de delegar, todas bajo la guarda `env.TENANT_SLUG === 'demo'` que ya usa para el cron:

| Ruta | Qué hace |
|---|---|
| `GET /api/demo` | `{ enabled: true }`. Es la **sonda de capacidad**: el dashboard pregunta y solo pinta el botón si le contestan. En el Worker de un camping real la ruta no existe → 404 → no hay botón. |
| `POST /api/demo/sign-in` | Reenvía a `/api/auth/sign-in/email` del Worker genérico con las credenciales del usuario `demo` sembrado, y devuelve **su** respuesta con su `Set-Cookie`. |
| `POST /api/demo/reset` | Llama a `resetDemoData(env.DB)` — la misma función del cron nocturno, sin duplicar nada. Exige sesión válida. |

Tres consecuencias que justifican esta forma y no otra:

- **Cero mecanismo de sesión nuevo.** No hay token propio, ni formato a firmar, ni caducidad que mantener: la puerta produce **una sesión normal de Better Auth**, revocable, con las mismas cookies y el mismo `getSession` que las demás. Toda la superficie de auth que hay que auditar sigue siendo la del ADR 0005.
- **La contraseña del usuario demo no sale del Worker.** El bundle del dashboard no la lleva (que es lo que pasaría si el botón hiciera el `sign-in/email` desde el navegador con credenciales incrustadas).
- **El dashboard sigue siendo genérico**, sin flag de build: pregunta, y el Worker le contesta. Un camping real recibe un 404 y ni se entera.

**El reset exige sesión** (cualquier rol) — se comprueba delegando un `GET /api/auth/get-session` al Worker genérico con las cookies de la petición. No es una barrera de seguridad seria y no pretende serlo: es el pestillo que impide que un desconocido con `curl` deje la demo en un bucle de wipes sin ni siquiera haber entrado.

**Trampa que hay que resolver en la implementación, no descubrir en producción**: `DELETE_ORDER` incluye `sessions` y `users`, así que **el reset mata la sesión del propio visitante que lo pulsa**. El flujo del botón es, por tanto: reset → `POST /api/demo/sign-in` otra vez → invalidar todas las queries. Sin ese segundo paso, restablecer expulsa al visitante al login, que es justo la impresión contraria a la que se busca.

### 5. En el dashboard: entrar es un click, y el "no" se explica en vez de romperse

- **`Login.tsx`**: bajo el formulario, separado, un botón secundario "Ver la demo" (i18n, 6 idiomas). Solo aparece si la sonda contesta. Un click → `POST /api/demo/sign-in` → invalidar `['session']` → dentro.
- **Banner de demo dentro del dashboard** (el de `Base.astro` es de la web pública, no llega aquí): franja discreta, no modal, visible solo con rol `demo`. Dice la verdad completa en una línea —se puede mover reservas en el planning y hacer check-in; el resto es solo lectura— y lleva el **botón "Restablecer datos"** con confirmación.
- **El 403 se traduce, no se escupe.** Hay 13 superficies que hoy pintan botones de mutación sin mirar el rol, y el `useTieneRol` solo se usa en un componente. Esconder los botones uno a uno serían 13 ficheros de trabajo mecánico y una lista que se desincroniza con el servidor a la primera. En su lugar, **un solo punto**: el cliente HTTP (`api.ts`) ya tipa `ApiError`; cuando el cuerpo trae `demo_readonly`, se muestra un toast explicativo ("En la demo esto es solo lectura") en vez de un error crudo. Una frase amable y honesta, en el sitio donde el visitante ha pinchado, y **una sola verdad**: la del servidor. Si algún día la demo se enseña sola sin comercial delante y esto se queda corto, esconder afordancias es un pulido incremental que no exige rediseñar nada.

### 6. Seed

`tenants/demo/seed.ts` siembra un usuario más: `usr_demo` / `demo@calasereno.example`, rol `demo`, con su hash scrypt en `accounts` (mismo patrón que los cuatro existentes). El `usr_consulta` de rol `readonly` **se queda** — sigue siendo el ejemplo de "un empleado con permisos de solo lectura", que es un rol de producto real y no lo mismo que esto.

Como el reset regenera `users` desde el seed, el usuario demo **sobrevive a los resets** por construcción, incluido al que dispara el propio botón.

## Alternativas descartadas

- **Enlace firmado que comparte el comercial.** Da control sobre quién entra y permite caducar, pero mete fricción justo en el momento de la venta (hay que pedirlo, generarlo, mandarlo) y añade un mecanismo de token propio —firmar, verificar, caducar— con su superficie de auditoría, para proteger **datos ficticios que se borran solos cada noche**. Es un candado en una puerta que no tiene nada detrás.
- **Rol `demo` en el nivel de `reception` + middleware global que deniega todo salvo una lista.** Se consideró en serio (la lista sería única y el barrido igual de fácil), pero es **fail-open ante un error de orden de middlewares**: si alguien monta una ruta antes de la guarda, el demo entra con permisos de recepción completos. El nivel 0 falla al revés — y en autorización, el sentido en el que se falla es la decisión.
- **Sesión anónima sin usuario en `users`** (cookie firmada que el middleware traduce a un rol virtual). Evitaría sembrar un usuario, pero rompe la premisa del ADR 0005 —una sola tabla de usuarios, el rol vive en `users.role`— y dejaría `audit_log` apuntando a un `user_id` que no existe.
- **Base de datos efímera por visitante** (cada uno con su copia, mutaciones aisladas). Es la respuesta ideal al problema de "un visitante ensucia la demo del siguiente", y es exactamente el tipo de decisión que la restricción de 6h/semana prohíbe: una D1 por visita multiplica infraestructura y coste por tráfico. El reset —nocturno y a botón— resuelve el 95% por dos órdenes de magnitud menos de trabajo.
- **Readonly estricto, sin excepciones.** El test sería trivial y nada se podría romper, pero el planning es lo que vende: un prospecto que arrastra una reserva y la ve encajar entiende el producto en tres segundos: uno al que le sale un error en todo lo que toca, no.

## Qué queda fuera (BACKLOG, con motivo)

- **Bloqueos desde la demo** (crear/levantar): ver §2. Alcance acotado por Andreu; quitan inventario a la vista hasta el reset.
- **Esconder las afordancias de mutación por rol en las 13 superficies**: ver §5. Es pulido incremental, no barrera —la barrera es el servidor—, y hacerlo ahora es trabajo mecánico que se desincroniza.
- **Métrica de uso de la demo** (cuántos entran, qué tocan): es exactamente el ítem de Cloudflare Web Analytics que sigue bloqueado por un token real, no algo que este ADR deba inventar.
- **Caducar la sesión demo antes que las demás** (hoy hereda la duración estándar de Better Auth): sin tráfico real que lo justifique, es un número inventado.

## Consecuencias

- El dashboard de `camp.logic2b.com` deja de estar tras un muro: cualquiera que llegue a la landing puede recorrerlo entero y **usar** el planning. Es el cambio de mayor efecto comercial de la Fase 10.
- Aparece el primer rol que **no** es una capa de la jerarquía sino "una capa + dos excepciones declaradas". Se acepta a cambio de dejarlo cerrado por un barrido automático; si algún día hacen falta tres roles así, la conclusión será que la jerarquía lineal se quedó corta y tocará un ADR nuevo, no ir sumando excepciones.
- `tenants/demo/worker.ts` pasa de envolver solo `scheduled` a envolver también `fetch`. Es el mismo precedente que ya abrió el ADR 0013 y sigue sin ser el registro de extensiones del ADR 0012 §3.
- Riesgo aceptado y consciente: **un visitante puede dejar el planning movido para el siguiente**. Es el precio de que el planning se pueda tocar, los datos son ficticios, y hay dos redes debajo (botón de restablecer + cron de las 3:00).
