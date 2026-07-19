# 0010 — Notificaciones (Fase 7)

- **Fecha**: 2026-07-19
- **Fase**: 7 · Notificaciones
- **Estado**: aceptado por delegación explícita de Andreu en sesión cloud ("continúa todo lo que puedas sin parar"). Revisable: cualquier punto se reabre con motivo antes de Fase 8.

## Contexto

El producto ya crea reservas y guarda solicitudes pero no avisa a nadie: el cliente no recibe su confirmación y recepción no se entera de una solicitud si no mira la bandeja. Restricciones reales de esta sesión: **no hay API key de Resend todavía** (dominio sin verificar) y no hay Queues configuradas. El criterio de fase manda: *on/off por notificación sin deploy; el nivel 1 solo usa las de solicitud*.

## Decisión

### 1. Paquete puro `packages/notifications` + orquestación en la API

- `packages/notifications`: **puro y sin I/O de base de datos** — tipos de evento, diccionarios 6 idiomas, plantillas y el contrato `EmailSender`. Testeable con Vitest a secas.
- `apps/api/src/notify.ts`: la orquestación con D1 — escribe `notifications_log` (queued), renderiza, envía, actualiza (sent/failed/disabled). Es el único sitio que toca la tabla.

### 2. Envío: Resend por HTTP, detrás de un driver; sin API key = apagado limpio

`EmailSender` con dos implementaciones: `resendSender` (un `POST https://api.resend.com/emails` — no hace falta SDK) y `noopSender`. La elección es por entorno: **si `RESEND_API_KEY` existe se envía; si no, el log registra `disabled` y no sale nada**. Activar emails en un tenant = poner el secret + verificar su dominio en Resend. Cero código.

`from` por tenant: `modules.notifications.from` (fallback a un remitente de plataforma). La cuenta Resend es una con N dominios verificados (§0 del super prompt).

### 3. Plantillas: funciones TS que devuelven HTML, no React Email (v1)

Desviación consciente del stack y por qué: React Email arrastra react-dom/server al bundle del Worker para render de 3 plantillas de texto con marca. En v1 las plantillas son **funciones puras `(payload, lang) → {subject, html, text}`** con un layout común (fondo hueso, acento pino, tipografía de sistema — los emails no cargan webfonts). Cuando un email necesite diseño rico de verdad, se migra a React Email **sin tocar nada más** (el contrato `render()` no cambia) — anotado en BACKLOG.

### 4. Eventos v1 y a quién van

| Evento | A quién | Niveles |
|---|---|---|
| `enquiry_received` | al camping (`notifyTo`) | 1-4 (la del caballo de Troya) |
| `enquiry_autoreply` | al solicitante, en SU idioma | 1-4 |
| `booking_confirmed` | al titular, en su idioma, con desglose | 3-4 |
| `booking_cancelled` | al titular, con el reembolso previsto | 3-4 |

Los 6 idiomas salen de diccionarios por plantilla; el idioma es el `locale` guardado con la solicitud/reserva.

### 5. Disparo: `waitUntil`, no Queues (v1)

Los envíos van en `executionCtx.waitUntil()` tras responder: la respuesta HTTP no espera al email y un fallo de Resend jamás rompe una reserva (queda `failed` en el log). **Queues se difiere** hasta tener volumen o reintentos programados que lo justifiquen — un camping envía decenas de emails al día, no miles (anotado en BACKLOG; la firma de `dispatch` ya es compatible con encolar).

### 6. On/off por notificación sin deploy

`modules.notifications` en la fila del tenant: `{ enabled: { enquiry_received: true, … }, from, notifyTo }`. Editable desde **Ajustes** del dashboard (PATCH ya existente, auditado). Evento desactivado → fila `disabled` en el log (rastro de que ocurrió, constancia de que no se envió).

## Consecuencias

- El nivel 1 cumple su promesa (formulario→email) en cuanto haya API key, sin motor.
- `notifications_log` queda poblado desde ya — la pantalla de log en el dashboard es una lista más (sesión futura).
- Riesgo: sin Queues no hay reintentos automáticos; mitigación: estado `failed` visible y reenvío manual como mejora futura.
- Pendiente de Andreu: verificar dominio en Resend y poner `RESEND_API_KEY` (secret por tenant/Worker).
