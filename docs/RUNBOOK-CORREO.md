# Runbook interno de correo · Resend

> Preparación local R12. No acredita cuenta, dominio, sandbox, entrega, rebote ni
> recepción real. Ejecutar pasos con cuenta, DNS, secrets o Worker únicamente
> para un destino identificado y con autorización explícita.

## 1. Contrato operativo actual

El mismo driver HTTP de `@logic-camp/notifications` sirve al lead comercial y a
las notificaciones de solicitudes/reservas, pero sus secretos se mantienen
separados para que activar captación no active mensajería de un camping. Cada entrega:

1. lleva `Idempotency-Key` sin PII;
2. tiene 8 s de timeout por intento;
3. reintenta una sola vez timeout, red, 408, 429 o 5xx con la misma clave;
4. no reintenta 4xx funcionales;
5. valida con Zod que el `2xx` contenga un `id` no vacío;
6. registra intentos reales y un código cerrado, nunca el body remoto.

Resend conserva las claves idempotentes durante 24 horas según su
[documentación oficial](https://resend.com/docs/dashboard/emails/idempotency-keys).
Este reintento inmediato no sustituye una Queue ni permite reenviar después un
fallo definitivo.

## 2. Configuración y ownership

| Entrada                          | Dónde vive                  | Responsable                           | Regla                                                                      |
| -------------------------------- | --------------------------- | ------------------------------------- | -------------------------------------------------------------------------- |
| cuenta y facturación Resend      | proveedor                   | Logic2B; registrar titular y contacto | no compartir credenciales personales                                       |
| dominio/subdominio remitente     | DNS + Resend                | titular del dominio + Logic2B         | debe estar verificado antes de usarlo                                      |
| `RESEND_API_KEY`                 | secret del Worker           | Logic2B                               | nunca config, `.env`, ticket, log o documentación                          |
| `LEADS_RESEND_API_KEY`           | secret del Worker comercial | Logic2B                               | solo `POST /api/leads`; puede pertenecer a la misma cuenta Resend          |
| `LEADS_TRANSPORT`                | var del Worker              | Logic2B                               | `demo` solo escaparate; `resend` exige key; ausente y sin key = `disabled` |
| `modules.notifications.from`     | D1 del tenant               | cliente + Logic2B                     | dirección de dominio verificado                                            |
| `modules.notifications.notifyTo` | D1 del tenant               | cliente                               | buzón interno válido y atendido                                            |
| `modules.notifications.enabled`  | D1 del tenant               | cliente                               | interruptor por evento, sin deploy                                         |

Antes de activar, registrar en la ficha del cliente: dueño de cuenta, contacto de
soporte, límite/plan y coste vigente, fecha de renovación, dominio, remitentes,
buzones, responsable de DNS, base legal/consentimiento, retención y eventos
contratados. El precio del proveedor se consulta al activar; no se congela una
tarifa cambiante en este repositorio.

## 3. Preflight sin enviar

- [ ] módulo contratado y destino no productivo/real autorizado;
- [ ] cuenta y titularidad confirmadas;
- [ ] subdominio elegido y registros exactos facilitados por Resend;
- [ ] SPF y DKIM verificados, DMARC revisado sin crear un segundo SPF;
- [ ] remitente `from` pertenece al dominio verificado;
- [ ] buzón `notifyTo` y destinatario de prueba aprobados;
- [ ] textos, idiomas, consentimiento, bajas y retención aceptados;
- [ ] owner, coste/límite, soporte y procedimiento de caída registrados;
- [ ] rollback acordado.

La guía oficial exige un dominio verificado y describe SPF/DKIM y DMARC en
[Add and verify a domain](https://resend.com/docs/add-a-domain).

## 4. Activación autorizada

1. Crear una API key de envío con el menor alcance disponible.
2. Guardarla como `LEADS_RESEND_API_KEY` para captación o como `RESEND_API_KEY`
   para mensajería interna; no imprimirla ni pasarla en una línea de comandos
   que quede en historial.
3. En el lead comercial, declarar `LEADS_TRANSPORT=resend`; en notificaciones,
   confirmar `from`, `notifyTo` y eventos activos.
4. Enviar un único caso controlado a cada tipo de destinatario aprobado.
5. Exigir `delivered`/`sent`, id del proveedor y recepción en bandeja; revisar
   spam, enlaces, reply-to, idioma y remitente.
6. Provocar de forma controlada un destinatario rechazado y comprobar error,
   referencia, intentos y ausencia de PII en logs.
7. No declarar operativo hasta revisar rebote/complaint y el procedimiento de
   baja. Los webhooks de eventos no existen en este repo y siguen siendo trabajo
   de activación, no una capacidad implícita.

## 5. Rotación

1. Crear una clave nueva sin revocar todavía la vigente.
2. Sustituir el secret en el destino autorizado y desplegar solo con el proceso
   de publicación aprobado.
3. Ejecutar un envío controlado y confirmar recepción/log.
4. Revocar la clave anterior en Resend.
5. Registrar fecha, operador, destino y evidencia sin copiar ningún secreto.

Si el smoke falla, restaurar el secret anterior mientras siga vigente; no hacer
reintentos ciegos ni revocar ambas claves.

## 6. Caída, degradación y apagado

- Reservas y solicitudes persisten antes del correo; un fallo no revierte la
  operación principal.
- `resend_timeout`, `resend_network`, 408, 429 y 5xx consumen como máximo dos
  intentos idempotentes. Un 4xx o respuesta inválida termina en el primero.
- Quitar `RESEND_API_KEY` deja notificaciones internas en `disabled`. Para el
  lead, retirar `LEADS_RESEND_API_KEY` o cambiar `LEADS_TRANSPORT`; sin key responde 503
  `lead_delivery_disabled` en vez de fingir éxito.
- Cada evento de notificación se puede desactivar en
  `modules.notifications.enabled` sin deploy.
- No existe reenvío manual ni Queue de fallidos. Si el volumen o una incidencia
  real lo justifican, se diseña con deduplicación y retención antes de activarlo.

## 7. Evidencia local disponible

- unidad del driver: éxito, reintento 503, 422 definitivo, `2xx` inválido y
  timeout doble;
- integración del lead: misma clave entre intentos, clave distinta entre
  peticiones, resultado `delivered/failed` y log sin email remoto;
- API sin key: `disabled` explícito y operación principal conservada;
- ninguna prueba ha usado una clave válida ni acredita entrega real.
