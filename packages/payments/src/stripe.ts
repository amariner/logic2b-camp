/**
 * Adaptador Stripe (ADR 0011 §6): Checkout Session por `fetch` — sin el SDK
 * de Stripe (evita arrastrar su cliente Node al Worker, mismo criterio que
 * `resendSender` en Fase 7). Verificación de webhook con `crypto.subtle`
 * (HMAC-SHA256), tal como documenta Stripe para "verifying signatures
 * manually" sin su librería.
 */
import type {
  PaymentIntentParams,
  PaymentIntentResult,
  PaymentProvider,
  PaymentWebhookEvent,
} from './types';

export type StripeConfig = {
  secretKey: string;
  webhookSecret: string;
};

const API_BASE = 'https://api.stripe.com/v1';

function formEncode(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

async function stripeRequest(
  secretKey: string,
  path: string,
  params: Record<string, string>,
  method: 'GET' | 'POST' = 'POST',
): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; error: string }> {
  try {
    const url =
      method === 'GET' && Object.keys(params).length > 0
        ? `${API_BASE}${path}?${formEncode(params)}`
        : `${API_BASE}${path}`;
    const res = await fetch(url, {
      method,
      headers: {
        authorization: `Bearer ${secretKey}`,
        ...(method === 'POST' ? { 'content-type': 'application/x-www-form-urlencoded' } : {}),
      },
      ...(method === 'POST' ? { body: formEncode(params) } : {}),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      const message =
        typeof data.error === 'object' && data.error && 'message' in data.error
          ? String((data.error as { message?: unknown }).message)
          : `stripe_${res.status}`;
      return { ok: false, error: message };
    }
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: `stripe_network: ${String(e).slice(0, 200)}` };
  }
}

async function hmacSha256Hex(key: string, message: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const digest = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Cabecera `Stripe-Signature: t=…,v1=…,v1=…` (puede traer varios v1 en rotación de secret). */
function parseSignatureHeader(header: string): { timestamp: string; signatures: string[] } {
  const parts = Object.fromEntries(
    header.split(',').map((kv) => {
      const [k, v] = kv.split('=', 2);
      return [k, v ?? ''];
    }),
  ) as Record<string, string>;
  const signatures = header
    .split(',')
    .filter((kv) => kv.trim().startsWith('v1='))
    .map((kv) => kv.trim().slice(3));
  return { timestamp: parts.t ?? '', signatures };
}

export function stripeProvider(config: StripeConfig): PaymentProvider {
  return {
    name: 'stripe',

    async createIntent(params: PaymentIntentParams): Promise<PaymentIntentResult> {
      const result = await stripeRequest(config.secretKey, '/checkout/sessions', {
        mode: 'payment',
        'payment_method_types[0]': 'card',
        client_reference_id: params.bookingId,
        'metadata[bookingId]': params.bookingId,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        'line_items[0][price_data][currency]': params.currency.toLowerCase(),
        'line_items[0][price_data][unit_amount]': String(params.amountCents),
        'line_items[0][price_data][product_data][name]': params.description.slice(0, 250),
        'line_items[0][quantity]': '1',
        locale: params.locale.slice(0, 2),
      });
      if (!result.ok) throw new Error(`stripe_create_intent_failed: ${result.error}`);
      const url = result.data.url;
      const id = result.data.id;
      if (typeof url !== 'string' || typeof id !== 'string') {
        throw new Error('stripe_create_intent_failed: respuesta inesperada');
      }
      return { method: 'redirect', redirectUrl: url, providerRef: id };
    },

    async parseWebhook(req: {
      headers: Headers;
      rawBody: string;
    }): Promise<PaymentWebhookEvent | null> {
      const header = req.headers.get('stripe-signature');
      if (!header) return null;
      const { timestamp, signatures } = parseSignatureHeader(header);
      if (!timestamp || signatures.length === 0) return null;

      const expected = await hmacSha256Hex(config.webhookSecret, `${timestamp}.${req.rawBody}`);
      if (!signatures.includes(expected)) return null;

      let event: {
        id?: string;
        type?: string;
        data?: { object?: Record<string, unknown> };
      };
      try {
        event = JSON.parse(req.rawBody);
      } catch {
        return null;
      }
      const session = event.data?.object ?? {};
      const bookingId =
        (session.client_reference_id as string | undefined) ??
        ((session.metadata as Record<string, string> | undefined)?.bookingId as
          | string
          | undefined);
      const sessionId = session.id as string | undefined;
      if (!event.id || !sessionId) return null;

      if (event.type === 'checkout.session.completed') {
        return {
          eventId: event.id,
          providerRef: sessionId,
          orderRef: bookingId,
          status: 'succeeded',
          amountCents: Number(session.amount_total ?? 0),
        };
      }
      if (event.type === 'checkout.session.async_payment_failed' || event.type === 'checkout.session.expired') {
        return {
          eventId: event.id,
          providerRef: sessionId,
          orderRef: bookingId,
          status: 'failed',
          amountCents: Number(session.amount_total ?? 0),
        };
      }
      return null; // otros eventos no nos interesan
    },

    async refund(providerRef: string, amountCents: number) {
      // providerRef aquí es el checkout session id; Stripe reembolsa por payment_intent.
      const session = await stripeRequest(
        config.secretKey,
        `/checkout/sessions/${providerRef}`,
        {},
        'GET',
      );
      const paymentIntent = session.ok ? (session.data.payment_intent as string | undefined) : undefined;
      if (!paymentIntent) return { ok: false, error: 'stripe_refund_no_payment_intent' };
      const result = await stripeRequest(config.secretKey, '/refunds', {
        payment_intent: paymentIntent,
        amount: String(amountCents),
      });
      if (!result.ok) return { ok: false, error: result.error };
      return { ok: true, providerRef: String(result.data.id ?? '') };
    },
  };
}
