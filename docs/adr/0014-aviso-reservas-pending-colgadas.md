# 0014 — Aviso de reservas `pending` colgadas

- **Fecha**: 2026-07-19
- **Fase**: BACKLOG 8.x (transversal a la Fase 8 · pagos)
- **Estado**: **aceptado por delegación explícita en sesión cloud**, mismo régimen que ADR 0009/0010/0011/0012/0013.

## Contexto

Desde ADR 0011 (Fase 8), una reserva `channel:'web'` con un modo de pago que exige cobro nace `status:'pending'` y solo pasa a `confirmed` cuando llega el webhook de la pasarela (Stripe/Redsys). Si el cliente abandona el pago a mitad — cierra la pestaña, la tarjeta falla, el banco la retiene — esa reserva se queda `pending` **para siempre**: nadie la cancela, nadie la cobra, y sigue contando como ocupación activa (`data.ts`/`admin.ts` la incluyen en `['pending', 'confirmed']`) hasta que alguien de recepción la note a simple vista en la lista de reservas. BACKLOG lo señala desde la Fase 8: _"Cron de purga/aviso de reservas `pending` colgadas... simétrico al cron de holds de la Fase 5"_.

Solo aplica a `channel:'web'`: una reserva `phone`/`walkin` nunca nace `pending` por pago (ADR 0011 §1 — recepción ya sabe cómo se ha cobrado).

## Decisión

### 1. v1 = SOLO avisa. No cancela, no libera inventario

El BACKLOG decía "purga/aviso" con una barra, dejando abierto si había que auto-cancelar. Esta sesión decide **avisar únicamente**, por un motivo concreto: un webhook de pasarela puede llegar con minutos de retraso por causas normales (reintento del proveedor, cola de su lado), y auto-cancelar una reserva `pending` que en realidad SÍ se va a cobrar en breve sería perder una venta real por una carrera de tiempos que no tenemos forma de descartar con certeza desde aquí. El coste de un falso negativo (recepción tarda un rato en enterarse de una reserva colgada de verdad) es mucho menor que el de un falso positivo (cancelar una venta legítima). Cancelar sigue siendo, como hoy, una acción manual de recepción — el aviso solo la hace visible sin que nadie tenga que acordarse de mirar.

Purgar automáticamente (cancelar + liberar inventario) queda declarado para una sesión futura SI el volumen real de reservas colgadas lo justifica — no antes, no especulativamente (BACKLOG).

### 2. Umbral: 2 horas sin pago ni cancelación, aviso UNA vez

Dos horas es tiempo de sobra para cualquier flujo de pago normal (Stripe/Redsys resuelven en segundos) y corto de sobra para que a recepción le sirva de algo el mismo día. El aviso se manda una sola vez por reserva — no cada 15 minutos mientras siga colgada — comprobando en `notifications_log` si ya existe un `booking_pending_stuck` para ese `bookingId` antes de mandarlo. Repetir el aviso sin que nada haya cambiado sería ruido, no información.

### 3. Mismo cron de la Fase 5, no uno nuevo

El Worker de CUALQUIER tenant tier 3+ (con funnel/pagos) ya trae el cron `*/15 * * * *` de purga de holds (ADR 0007) — comentado en `tenants/_template/wrangler.jsonc` hasta que el alta lo activa para ese nivel. Este aviso se engancha al MISMO disparo (`scheduled()` en `apps/api/src/index.ts`, genérico, no algo de la demo): un tenant que ya tiene el cron activado por sus holds recibe el aviso gratis, sin tocar `wrangler.jsonc` de nadie. Contraste con ADR 0013: el reset nocturno de la demo SÍ necesitó un cron propio porque es una acción exclusiva de ese tenant; esto es al revés — una función genérica del motor de pagos que debe correr en CUALQUIER camping con pagos activos, así que vive en `apps/api`, no en `tenants/demo`.

### 4. Email interno, mismo motor de notificaciones — con un ajuste

`packages/notifications` gana el kind `booking_pending_stuck` (payload = el mismo `BookingPayload` que ya usan `booking_confirmed`/`booking_cancelled`, sin campos nuevos: código, titular, estancia, tipo, personas). Va SIEMPRE al buzón interno del camping (`to: null` → `config.notifyTo`), nunca al huésped — no tiene sentido avisarle de que su propio pago no ha llegado por un canal que igual tampoco está revisando.

`apps/api/src/notify.ts` dependía de un `Context` de Hono (`c.get('tenant')`, `c.env`) porque hasta hoy todo disparo de notificación ocurría dentro de una petición HTTP. El `scheduled()` de un cron no tiene ese contexto. Se extrae la parte que de verdad hace falta (`db`, `tenantSlug`, `apiKey`) a un objeto plano; `dispatch()` pasa a depender de eso, no de `Context`. Los cuatro disparos existentes (`notifyEnquiry`, `notifyBookingConfirmed`, `notifyBookingCancelled` vía `notifyAfter`) siguen exactamente igual por fuera — siguen recibiendo `c` — porque `notifyAfter` arma el objeto plano internamente antes de llamar a `dispatch`. El cron usa una función nueva, `notifyNow`, que hace lo mismo sin `waitUntil` (el propio `scheduled()` ya controla su ciclo de vida, igual que la purga de holds).

### 5. Qué NO hace v1

- No cancela ni libera inventario (§1).
- No manda nada al huésped (§4).
- No añade una pantalla nueva al dashboard: la reserva colgada YA es visible en `/admin/#/reservas` filtrando por `pending`, y ahora además en `/admin/#/notificaciones` con el resto del log — reutiliza pantallas existentes en vez de construir una tercera.

## Consecuencias

- `apps/api/src/notify.ts`: refactor de `dispatch`/`unitTypeName` para no depender de un `Context` de Hono — sin cambio de comportamiento en los cuatro disparos existentes (verificado con la suite completa).
- Primera vez que un cron de `apps/api` (genérico, no de un tenant concreto) dispara un email — precedente reutilizable para futuros avisos automáticos (p. ej. recordatorio de llegada, ya en BACKLOG 7.x, bloqueado hoy por no tener `RESEND_API_KEY` real).
- Riesgo aceptado: si `RESEND_API_KEY` no está configurado (como en la demo hoy), el aviso queda `disabled` en el log igual que cualquier otra notificación — no es un fallo nuevo, es el comportamiento ya establecido en ADR 0010.
