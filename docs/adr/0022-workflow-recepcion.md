# 0022 — Workflow real de recepción (Frente C, fase C4)

- **Fecha**: 2026-07-21
- **Fase**: Frente C — C4 (workflow de recepción)
- **Estado**: **aceptado e implementado**. Mandato autónomo permanente del Frente C (Andreu, sesión 31: *"aplica tu criterio y no pares hasta cerrarlo"*, como en C7/ADR 0021). La decisión de fondo (§1, el modelo de check-in) se toma aquí y se implementa en la misma sesión; es reversible sin migración destructiva (columnas aditivas nulables).

## Contexto

C4 es **el único hueco de DOMINIO que le quedaba al Frente C** (todo lo demás es pulido de UI sobre cosas que ya funcionan). Lo declaró la auditoría de la sesión 30 (`FRENTE-C-ACABADO.md` §C4): hoy no existe el **check-in** ni en cliente ni en servidor. `TRANSITIONS` (`apps/api/src/routes/admin.ts`) solo conoce `confirm`/`cancel`/`no_show`/`complete`. Una recepcionista **no puede marcar que alguien ha llegado**, que es el acto central de una recepción. Cuatro agujeros hermanos:

1. **Check-in / check-out** no existen (dominio).
2. **Huéspedes y documentos**: la ficha los **muestra** pero no se editan → sin esto no hay parte de viajeros, requisito legal en un camping español.
3. **Cobro**: "cobrar todo lo pendiente" se teclea a mano; **crear bloqueos** desde la UI no se puede (el planning y el plano los *pintan* pero no hay forma de crear uno).
4. **⌘K** (buscar y saltar) y las **rutas direccionables** `/reservas/$id` `/clientes/$id` que C3 dejó explícitamente para aquí.

Restricción que gobierna (§0 super prompt): ~6h/semana, **nada que multiplique el trabajo por número de clientes**, y *¿qué necesita un camping real para operar en agosto?*

## Decisión

### 1. El modelo de check-in: campo `checked_in_at`, NO un estado `in_house` — la decisión de fondo

La pregunta del contrato era: ¿un **estado nuevo `in_house`** en la máquina de estados, o un **campo `checked_in_at`** sobre la reserva? Se elige el campo. Y no es una preferencia estética: es la única de las dos que **no introduce un bug de corrección latente**.

**Por qué el estado `in_house` es peligroso.** El `status` de una reserva es su **ciclo de vida** (`pending → confirmed → completed/cancelled/no_show`). Que un huésped esté físicamente presente es un **hecho ortogonal**: una reserva confirmada cuyo titular ya llegó **sigue siendo confirmada**. Modelar la presencia como un `status` mete dos ejes en uno, y el sistema entero filtra por `status` en sitios donde **ocupación e ingresos dependen de ello**:

- `OCCUPIES` en `packages/config/plano.ts` (`confirmed|pending|completed` ocupan inventario).
- El filtro de `/reports` (`inArray(status, ['pending','confirmed','completed'])`).
- El filtro de solape de `reassign` en `admin.ts` (`['pending','confirmed']`).
- El motor de disponibilidad y el seed (tres sitios que deciden "activa" por `status`).

Si `in_house` fuera un `status`, una reserva con el huésped dentro **saldría de todos esos filtros** salvo que se parchee cada uno — y **olvidar uno es un doble-booking** (la unidad de un huésped presente contada como libre). El campo `checked_in_at` **no toca ni uno**: el `status` sigue siendo `confirmed`, la ocupación y los informes siguen exactos, y "en casa" se **deriva** (`status==='confirmed' && checked_in_at != null && checked_out_at == null`).

**Coste y reversibilidad.** Migración **aditiva** de dos columnas nulables (`checked_in_at`, `checked_out_at`) sin backfill: cero cambio de semántica en ninguna consulta existente. Revertir = dejar de leer dos columnas. Un estado nuevo, en cambio, contamina el enum en `schema`, `core`, `schemas` (×2), `api.ts` (×2) y toda comparación de estado del cliente.

**La máquina de transiciones** gana tres acciones que conviven con `TRANSITIONS` sin alterarlo:

- `check_in`: `confirmed` && `!checkedIn` → estampa `checked_in_at`. El `status` **no cambia**.
- `check_out`: `confirmed` && `checkedIn` && `!checkedOut` → estampa `checked_out_at` **y** transiciona `status` a `completed` (reutiliza el destino que ya existía; el check-out es un `complete` con recibo). Cierre de cuenta en el mismo gesto.
- `undo_checkin`: `confirmed` && `checkedIn` && `!checkedOut` → `checked_in_at = null`. Recuperación de un clic erróneo en el mostrador es cosa de todos los días.

`complete` sigue existiendo para el cierre administrativo sin llegada formal. `checked_out_at` es redundante para el color (un check-out deja `completed`), pero se guarda como **marca de auditoría** ("salió hoy" vs "completada porque pasó") y para poder ofrecer deshacer en el futuro. Es barato y más expresivo.

**El color "en casa" en el planning y el plano.** `unitStateOn` (`packages/config`) gana un `kind: 'inhouse'` que se deriva cuando el ocupante está `checkedIn && !checkedOut` — exactamente la "línea de más" que C7 dejó preparada. Un token nuevo `--lc-status-inhouse` en el DS (verde más vivo que `confirmed`) lo pinta en la barra, en el `<svg>` del plano y en la leyenda. Es la información que un mostrador **más mira a las 9:00**: quién está dentro y quién solo tiene reserva.

**En el seed (modo fake).** Las reservas confirmadas que están en casa **en el ancla del seed** (`Y-07-15`, el "hoy" del seed — misma convención que ya usa el estado `completed/confirmed`, ADR 0019 §2) se estampan `checked_in_at` (la mayoría; ~1 de cada 5 aún "solo tiene reserva, no ha llegado"). Así el planning y el plano enseñan la mezcla "en casa / confirmada / entra hoy" **sin un solo mock en el cliente** — el "fake" se resuelve en el seed, como manda el frente. El seed sigue siendo función pura de `anchorYear` (determinismo intacto: el reset nocturno depende de ello). *Limitación conocida y consistente con ADR 0013*: el ancla es `Y-07-15`, no el "hoy" real, así que la mezcla "en casa" se aprecia navegando el planning a mediados de julio; ya declarado en el BACKLOG de ADR 0013 (ancla ≠ hoy exacto).

### 2. Huéspedes y documentos editables (parte de viajeros)

La ficha ya **muestra** `guests[]`. Ahora se **editan** contra dos rutas nuevas, con el mismo patrón de auditoría del resto de `/admin`:

- `POST /admin/bookings/:id/guests` — añade un huésped (nombre, apellidos, documento, nacimiento, nacionalidad, email/teléfono opcionales) y crea el enlace `booking_guests`. Si la reserva no tiene titular, el primero pasa a `isLead`.
- `PATCH /admin/guests/:id` — edita los datos y el documento de un huésped existente (los que la ficha ya pintaba pero no dejaba tocar).
- `DELETE /admin/bookings/:id/guests/:guestId` — quita a un acompañante de la reserva (nunca al titular; el `guest` en sí no se borra — es memoria comercial).

El **parte de viajeros** en sí (export a la Guardia Civil / Mossos) **no se construye** este sesión: se deja el **modelo preparado** (todos los campos de documento por huésped ya existen en `guests` desde la Fase 1) y declarado en el BACKLOG. El requisito de C4 era que *el hueco esté previsto*, y ahora los datos se pueden capturar y editar; el fichero de export es una pieza aparte con su formato legal.

### 3. Cobro sin fricción y bloqueos desde la UI

- **"Cobrar todo lo pendiente"**: un botón en la ficha que precarga el importe pendiente (`total − pagado`) en el cobro manual que ya existía (ADR 0011). Se valida en cliente que `importe ≤ pendiente` (hoy no se validaba; el servidor ya lo hacía para el reembolso, no para el cobro — se añade la guarda también en el servidor por simetría). Cero ruta nueva: reusa `record_payment`.
- **Crear bloqueos**: `POST /admin/blocks` genérico (unidad **o** tipo, rango de fechas, motivo `maintenance|owner|longstay|manual`), con validación de solape contra reservas vivas y otros bloqueos de esa unidad — una avería no puede taparse sobre una reserva confirmada sin avisar. `DELETE /admin/blocks/:id` para levantarlo. La UI: un diálogo desde el planning **y** desde el plano (los dos ya los pintan). El recibo/ticket imprimible se difiere (la web ya tiene el patrón `@media print`; es pulido, no dominio) al BACKLOG.

### 4. ⌘K y rutas direccionables

- **⌘K** (`cmdk`, declarado para C4 en ADR 0020 y **no** instalado en C2 a propósito): un `command` sobre el primitivo del DS que busca **reserva por código**, **huésped por nombre** y **unidad por código**, y salta a la pantalla correspondiente. Debounce contra `/admin/bookings?q=` y `/admin/guests?q=` (rutas que ya existen); las unidades salen del `catalog` cacheado. Atajo `⌘K`/`Ctrl-K` global.
- **Rutas direccionables** `/reservas/$id` y `/clientes/$id`: el patrón es el **search-param de C7** (fecha+unidad en `/plano` y `/`, ADR 0021 §4). El panel lateral pasa a leer su id de la URL, de modo que una reserva **se puede enviar por email a un compañero**. `/reservas` y `/clientes` mantienen su lista; el id en la ruta abre el panel encima. ⌘K navega a estas rutas.

## Consecuencias

- **Una migración** (`0004`), aditiva y nulable: dos columnas en `bookings`. Sin backfill, sin cambio de semántica. La D1 de la demo se resiembra en el reset; una D1 de tenant real aplicaría `0004` como cualquier otra.
- El **check-in es derivable y no destructivo**: si mañana se decide que sí quiere ser un estado, la información ya está capturada y se puede promover. Al revés (de estado a campo) habría que desmontar filtros.
- **`packages/config` gana `inhouse`** y sube su cobertura (estado por fecha con check-in). El plano de C7 lo pinta con un token, sin tocar su geometría.
- **`apps/api` sigue genérico**: ninguna ruta nueva conoce a Cala Sereno. El seed del tenant es quien pone los `checked_in_at` de demostración.
- **Diferido con motivo** (BACKLOG): el export del parte de viajeros (formato legal, pieza propia), el recibo imprimible del check-out, crear reserva **arrastrando** sobre el plano/planning (es C1.2), y el modo oscuro (detrás de C1.5).

## Qué NO se hace aquí

- No se construye el estado `in_house` (ver §1).
- No se construye el export del parte de viajeros (solo el modelo y la captura).
- No se toca el motor de precios ni disponibilidad: el check-in es ortogonal a ambos.
- No se difiere a "cuando haya credenciales": todo esto se verifica en local/aislamiento, como el resto del Frente C.
