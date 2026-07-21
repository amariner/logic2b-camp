# 0011 — Pagos (Fase 8)

- **Fecha**: 2026-07-19
- **Fase**: 8 · Pagos
- **Estado**: aceptado por delegación explícita de Andreu en sesión cloud ("sigue perfilando... con tu criterio cierra temas"), mismo régimen que ADR 0009/0010. Revisable con motivo antes de Fase 9.

## Contexto

`bookings` nace siempre `confirmed` con `paidCents: 0` (`apps/api/src/bookings.ts`, con el comentario explícito `// pagos (Fase 8) introducirán 'pending'` dejado en sesión 10). La tabla `payments` existe desde la Fase 1 (`provider: stripe|redsys|manual|none`, `amountCents` con signo, invariante 2: `sum(payments.amount_cents) == bookings.paid_cents`) pero **nada escribe en ella todavía**. El dashboard ya renderiza `data.payments` y `pendingCents`/`depositCents` (`BookingPanel.tsx`) y el i18n del dashboard ya tiene las claves `pago.stripe/redsys/manual/none` y `pago.pending/succeeded/failed/refunded` — construido anticipando esta fase, solo falta quien escriba y las acciones para hacerlo.

Restricción real de esta sesión: sin credenciales de Stripe/Redsys ni dominio verificado (igual que Resend en Fase 7). Criterio de fase: **`payments: 'none'` deja el producto entero sin rastro de pasarela en la UI.**

## Decisión

### 1. `packages/payments` puro + orquestación en la API (mismo patrón que Fase 7)

`packages/payments` es puro (sin D1, sin `fetch` fuera de los adaptadores, testeable con Vitest a secas): interfaz `PaymentProvider`, tres adaptadores (`stripeProvider`, `redsysProvider`, `noneProvider`) y `computeChargeAmount` (lógica pura de modos). `apps/api` es quien lo conecta a D1, igual que `notify.ts` hace con `packages/notifications`.

```ts
export type PaymentMode = 'none' | 'deposit' | 'full';

export type PaymentsConfig = {
  provider: 'stripe' | 'redsys' | 'none';
  mode: PaymentMode;
  /** % del total a cobrar como señal cuando mode='deposit' (p.ej. 30) */
  depositPercent?: number;
};

export type PaymentIntentParams = {
  bookingId: string;
  code: string;
  amountCents: number;
  currency: string;
  locale: string;
  description: string;
  successUrl: string;
  cancelUrl: string;
  notifyUrl: string;
};

export type PaymentIntentResult =
  | { method: 'redirect'; redirectUrl: string; providerRef: string }
  | { method: 'form'; action: string; fields: Record<string, string>; providerRef: string }
  | { method: 'immediate'; providerRef: string }; // none: cobrado (no hay nada que cobrar)

export type PaymentWebhookEvent = {
  eventId: string;
  providerRef: string;
  orderRef?: string;
  status: 'succeeded' | 'failed';
  amountCents: number;
};

export interface PaymentProvider {
  readonly name: 'stripe' | 'redsys' | 'none';
  createIntent(params: PaymentIntentParams): Promise<PaymentIntentResult>;
  parseWebhook(req: { headers: Headers; rawBody: string }): Promise<PaymentWebhookEvent | null>;
  refund(providerRef: string, amountCents: number): Promise<{ ok: boolean; providerRef?: string }>;
}
```

`PaymentsConfig` vive en `tenants.modules.payments`, leído en `apps/api` con el mismo `SELECT` directo que usa `notify.ts` para `modules.notifications` (no se crea una capa de tenant-config nueva; eso es Fase 9).

### 2. Modos v1: `none` / `deposit` / `full` — **`bond` (fianza vía pasarela) queda en BACKLOG**

El ROADMAP menciona un cuarto modo, "fianza". `depositCents` (fianza, `DOMAIN.md`: _"depósito reembolsable, no es ingreso, no se mezcla con el total"_) es dinero que **no puede** pasar por la tabla `payments` sin romper la invariante 2 (`sum(payments)==paidCents`), y cobrarla de verdad vía pasarela exige una pre-autorización con captura diferida (Stripe `capture_method:manual`, o en Redsys una operación de autorización tipo `1` con confirmación posterior tipo `2`) que además necesita una vía para _capturar solo una parte_ si hay que retener por daños — un flujo completo con su propia máquina de estados que no es necesario para que el producto funcione. Se declara conscientemente fuera de v1 (igual que React Email/Queues en la Fase 7): la fianza se sigue cobrando in situ (efectivo/TPV físico) y se registra ya en el campo `depositCents` que existe desde la Fase 1; el dashboard ya lo muestra. Anotado en BACKLOG para cuando un camping real lo pida.

`computeChargeAmount(mode, totalCents, depositPercent)`:

- `none` → 0 (no se crea intent; la reserva nace `confirmed` como hoy).
- `deposit` → `round(totalCents * depositPercent / 100)`.
- `full` → `totalCents`.

### 3. Solo el canal `web` pasa por la pasarela; `phone`/`walkin` siguen confirmando al instante

Una reserva de mostrador o teléfono la cobra recepción in situ (efectivo/TPV físico ya en el camping) — no tiene sentido redirigirla a un Checkout online. `createBooking()` (`apps/api/src/bookings.ts`) solo bifurca el `status` inicial cuando `channel === 'web'` **y** `mode !== 'none'`:

- `channel !== 'web'` **o** `mode === 'none'` → `status: 'confirmed'` (comportamiento actual, sin cambios).
- `channel === 'web'` y `mode` en `deposit`/`full` → `status: 'pending'`, y en la MISMA respuesta se crea el `PaymentIntent` (llamada awaited al adaptador, antes de responder) por `computeChargeAmount(...)`. La respuesta incluye `payment: PaymentIntentResult` para que el funnel redirija.

El pago de reserva manual (dashboard) sigue sin tocar pasarela — para eso está la acción `record_payment` (§5).

### 4. Confirmación por webhook, idempotente vía `meta` (sin tabla ni migración nueva)

`POST /api/payments/webhook/:provider` (público, sin tenant header — un Worker = un tenant, igual que el resto de la API):

- **Stripe**: verifica la cabecera `Stripe-Signature` (esquema `t=…,v1=…`, HMAC-SHA256 con `STRIPE_WEBHOOK_SECRET` sobre `${t}.${rawBody}`, con `crypto.subtle` — no hace falta el SDK) sobre eventos `checkout.session.completed`/`checkout.session.async_payment_failed`. `client_reference_id` = `bookingId`.
- **Redsys**: recibe `application/x-www-form-urlencoded` con `Ds_SignatureVersion`, `Ds_MerchantParameters` (JSON en base64, valores `encodeURIComponent`-ados), `Ds_Signature`. Verifica recalculando la firma (§6) y comprobando `Ds_Response` (`0000`–`0099` = autorizada).
- Idempotencia: **reutiliza `meta`** exactamente como el `Idempotency-Key` de `POST /api/bookings` (`apps/api/src/bookings.ts` líneas 40-63/187) — clave `webhook:{provider}:{eventId}` insertada en el MISMO `db.batch()` que el insert en `payments` y el update de `bookings` (status→confirmed, `paidCents += amountCents`). Un reintento del proveedor con el mismo evento no duplica el cobro. No se añade tabla ni migración nueva.
- Al confirmar (pending→confirmed) se dispara `notifyBookingConfirmed` — **no se crea un evento de notificación nuevo**: `booking_confirmed` se sigue disparando en el único momento en que la reserva pasa a `confirmed`, que ahora puede ser en la creación (mode `none`/canal no-web) o en el webhook (mode `deposit`/`full` por web). `public.ts` deja de llamarlo incondicionalmente tras el 201 y pasa a mirar `result.body.status === 'confirmed'`.
- Si el pago falla o el hold ya expiró entretanto: la reserva queda `pending` (no se auto-cancela en v1; recepción la ve en la bandeja/planning y decide — anotado en BACKLOG un cron de purga de `pending` viejas, simétrico al cron de holds de la Fase 5).

### 5. Pago manual y reembolso desde el dashboard (acciones tipadas, mismo patrón que `TRANSITIONS`)

`bookingActionSchema` (discriminated union) gana dos literales, junto a los 6 ya existentes:

```ts
z.object({ action: z.literal('record_payment'), amountCents: z.number().int().positive(), method: z.enum(['cash', 'card']) }),
z.object({ action: z.literal('refund'), amountCents: z.number().int().positive() }),
```

- `record_payment`: inserta `payments` (`provider:'manual'`, `status:'succeeded'`, `providerRef: null`) y `paidCents += amountCents` — para cobros en efectivo/TPV físico ya recibidos (canal `phone`/`walkin`, o un resto de `deposit` cobrado in situ). Auditado igual que las demás acciones (`audit(..., 'record_payment', {amountCents, method})`).
- `refund`: nunca deja `paidCents` negativo (422 si `amountCents > paidCents`); inserta `payments` con `amountCents` **negativo**; si el último pago con ese `providerRef` fue por `stripe`/`redsys`, llama a `provider.refund(providerRef, amountCents)` primero (409 si el proveedor lo rechaza, nada se escribe); si fue `manual`, es un asiento contable sin llamada externa. Mismo `audit()`.
- La cancelación web (`POST /bookings/:code/cancel`, `public.ts:375` "Fase 8: ejecución real del reembolso") y la cancelación del dashboard (`admin.ts:348`) pasan a ejecutar el reembolso real con el mismo mecanismo antes de notificar, en vez de solo mandar el email con la cifra prevista.

### 6. Adaptador `stripe`: Checkout Session por `fetch`, sin SDK (mismo criterio que `resendSender` en Fase 7)

`createIntent` → `POST https://api.stripe.com/v1/checkout/sessions` (form-urlencoded, `Authorization: Bearer STRIPE_SECRET_KEY`) con `mode:'payment'`, `line_items[0][price_data]...`, `client_reference_id: bookingId`, `success_url`/`cancel_url`. Devuelve `{method:'redirect', redirectUrl: session.url, providerRef: session.id}`. `refund` → `POST /v1/refunds`. Verificación de webhook con `crypto.subtle` (HMAC-SHA256), sin el SDK de Stripe (evita arrastrar su cliente Node al Worker, igual razón que evitó React Email en notificaciones).

### 7. Adaptador `redsys`: firma HMAC SHA256 con 3DES en JS puro (Workers no lo soporta nativo)

Redsys es "su comercio, su clave, por camping" — obligatorio en España, conexión por redirección (formulario auto-post a `Ds_Merchant_MerchantURL`/TPV). El algoritmo (verificado contra la implementación de referencia `santiperez/node-redsys-api` y la guía oficial de migración a HMAC SHA256, ambas consultadas en esta sesión):

1. `orderKey = 3DES-CBC(clave_comercio_base64, IV=0, plaintext=Ds_Merchant_Order rellenado con \0 a múltiplo de 8)`.
2. `Ds_Signature = base64(HMAC-SHA256(orderKey, Ds_MerchantParameters_base64))`.
3. Notificación entrante: mismo cálculo pero con `Ds_Order` extraído del JSON decodificado; valores del JSON vienen `encodeURIComponent`-ados campo a campo (hay que `decodeURIComponent` cada uno).

**Bloqueo técnico real** (declarado explícitamente, no simulado): Cloudflare Workers no implementa 3DES/DES en `crypto.subtle` (solo AES/RSA/EC/HMAC/SHA). Se implementa un DES/3DES puro en TypeScript (sin librería — sería la única forma de tener Redsys en Workers de todos modos). Verificado en esta sesión con tests que comparan la salida contra `node:crypto` (`des-ede3-cbc`, IV cero, sin padding) para un lote de casos aleatorios — Node sí soporta 3DES nativo, así que sirve de oráculo en los tests aunque el código de producción no pueda usarlo. **Pendiente real declarado**: no hay forma de probar esto contra el entorno de pruebas real de Redsys sin las credenciales de comercio de Andreu (clave de comercio, FUC, terminal); antes de aceptar el primer pago real con Redsys hay que verificarlo contra su sandbox. Anotado en PROGRESS y BACKLOG.

### 8. Secrets por camping, convención igual que `RESEND_API_KEY`

`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `REDSYS_MERCHANT_KEY` como `wrangler secret` opcionales en `Bindings` (`apps/api/src/tenant.ts`). Sin ellos, si `modules.payments.provider` los necesita, `createIntent` devuelve un error claro (500 `payment_not_configured`) en vez de fallar en silencio — a diferencia de notificaciones (donde "sin key = disabled y no pasa nada" es aceptable), aquí un pago mal configurado no debe dejar la reserva a medias sin explicación.

## Consecuencias

- `payments:'none'` (o cualquier reserva `phone`/`walkin`) no cambia una sola línea de comportamiento observable — cumple el "hecho cuando" de la fase tal cual.
- El dashboard gana dos acciones (`record_payment`, `refund`) sobre una UI que ya estaba preparada desde la Fase 6 para mostrarlas.
- Riesgo aceptado y declarado: Redsys sin verificar contra sandbox real; fianza vía pasarela fuera de v1; sin cron de purga de `pending` colgadas (BACKLOG, simétrico al de holds).
- Pendiente de Andreu: cuenta Stripe (modo test primero) + su comercio Redsys real (clave, FUC, terminal) para verificar de verdad antes de cobrar un euro real.
