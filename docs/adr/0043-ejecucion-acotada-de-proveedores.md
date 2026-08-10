# 0043 — Ejecución acotada de proveedores, empezando por Resend

- **Fecha:** 2026-08-10
- **Fase:** R12 · integraciones y proveedores reales
- **Estado:** propuesto por el protocolo autónomo de `docs/CONTINUA.md`. La
  implementación local es reversible y no activa cuentas, secretos ni tráfico
  real; queda abierta a revisión posterior de Andreu.

## Contexto

R11 dejó inventariada la superficie de seguridad, pero el primer barrido de R12
encuentra una diferencia concreta entre el contrato transversal y el correo que
ya atraviesa Inicio, solicitudes y reservas:

- el `fetch` a Resend puede esperar indefinidamente;
- un fallo transitorio no se reintenta y, sin clave idempotente, reintentarlo
  podría duplicar el correo;
- una respuesta `2xx` se acepta con un cast, aunque no contenga el id esperado;
- un error copia hasta 200 caracteres del cuerpo remoto al log. Ese cuerpo puede
  repetir dirección, asunto u otro PII enviado al proveedor;
- `notifications_log.attempts` cuenta la intención local, no los intentos reales.

Resend documenta `Idempotency-Key` en `POST /emails`, con una ventana de 24
horas, precisamente para que el mismo envío se pueda reintentar sin duplicarlo.
La demo y los tests no disponen de `RESEND_API_KEY`, y este ADR no cambia ese
gate.

## Decisión

### 1. Primer corte vertical: el driver Resend

`EmailSender` recibe una clave idempotente explícita. El orquestador la deriva de
tenant, evento y entidad (`booking`, `enquiry` o referencia de error); el lead
comercial crea una referencia por petición. La clave no contiene email, nombre,
mensaje ni código público de reserva, y se envía igual en todos los intentos.

El driver aplica un límite de **8 segundos por intento** y como máximo **dos
intentos**. Solo reintenta resultados transitorios o ambiguos: timeout, error de
red, HTTP 408, 429 o 5xx. Un 4xx funcional no se repite. El segundo intento usa
la misma clave y una espera breve y acotada; no se introduce Queue ni un proceso
en segundo plano que necesite infraestructura.

### 2. La frontera externa se valida y se registra sin PII

El JSON de éxito de Resend se valida con Zod y debe contener un `id` no vacío.
Un `2xx` mal formado es `resend_invalid_response`, nunca un envío confirmado.

Los errores del driver son códigos cerrados (`resend_http_<status>`,
`resend_timeout`, `resend_network`, `resend_invalid_response`). No se lee ni se
persiste el cuerpo de error del proveedor. El llamador conserva su referencia de
correlación y el número real de intentos; el cliente solo recibe el resultado
público y la referencia ya definidos por ADR 0042.

### 3. No abstraer todos los proveedores antes de tener dos casos iguales

El inventario R12 usa un checklist común —validación, idempotencia, timeout,
reintento, correlación, PII, degradación, dueño, coste y apagado—, pero no crea
todavía un paquete de runtime genérico. Stripe, Redsys y SES tienen semánticas
distintas; se extraerá una utilidad compartida solo cuando el siguiente corte
demuestre una coincidencia real.

## Tensión de las ocho lentes

- **Backend/arquitectura:** pide una frontera pequeña, tipada y reutilizable; se
  evita una abstracción especulativa y no se toca D1 ni el motor.
- **Fullstack:** exige que intentos y referencia lleguen del driver al log y al
  error público sin cambiar el contrato visual.
- **Producto/UX:** un lead o una reserva no esperan para siempre ni reciben un
  falso éxito; la operación base sigue funcionando si el correo falla.
- **Frontend/UI/SEO:** no hay cambio de markup, contenido indexable o
  interacción; sus gates no se reabren.
- **Regla de oro:** la política vive una vez en el paquete común y no se configura
  a mano por camping.

## Consecuencias

- Los fallos transitorios de correo tienen un único reintento seguro y medible.
- Un timeout completo puede consumir hasta unos 16 segundos de pared; sigue
  fuera de la respuesta de reservas mediante `waitUntil`, aunque el lead
  comercial sí espera el resultado real para no mentir.
- No se afirma entrega, dominio verificado, rebote, sandbox ni recepción real.
- La activación sigue requiriendo cuenta, dominio, remitente, buzón, secreto y
  prueba autorizada según el runbook.
