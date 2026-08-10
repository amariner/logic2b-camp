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
import { z } from 'zod';

export type StripeConfig = {
  secretKey: string;
  webhookSecret: string;
};

const API_BASE = 'https://api.stripe.com/v1';
const WEBHOOK_TOLERANCE_SECONDS = 300;

const stripeWebhookSchema = z.object({
  id: z.string().trim().min(1),
  type: z.enum([
    'checkout.session.completed',
    'checkout.session.async_payment_failed',
    'checkout.session.expired',
  ]),
  data: z.object({
    object: z.object({
      id: z.string().trim().min(1),
      client_reference_id: z.string().trim().min(1).nullable().optional(),
      metadata: z.record(z.string(), z.string()).nullable().optional(),
      amount_total: z.number().int().nonnegative().nullable(),
    }),
  }),
});

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
function parseSignatureHeader(header: string): { timestamp: number; signatures: string[] } | null {
  let timestamp: number | null = null;
  const signatures: string[] = [];
  for (const item of header.split(',')) {
    const [rawKey, rawValue] = item.trim().split('=', 2);
    if (!rawKey || !rawValue) continue;
    if (rawKey === 't' && /^\d+$/.test(rawValue)) timestamp = Number(rawValue);
    if (rawKey === 'v1' && /^[a-f0-9]{64}$/i.test(rawValue)) signatures.push(rawValue);
  }
  return timestamp !== null && Number.isSafeInteger(timestamp) && signatures.length > 0
    ? { timestamp, signatures }
    : null;
}

function constantTimeHexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return diff === 0;
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
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
      const signatureHeader = parseSignatureHeader(header);
      if (!signatureHeader) return null;
      const { timestamp, signatures } = signatureHeader;

      const expected = await hmacSha256Hex(config.webhookSecret, `${timestamp}.${req.rawBody}`);
      if (!signatures.some((signature) => constantTimeHexEqual(signature, expected))) return null;
      if (Math.floor(Date.now() / 1_000) - timestamp > WEBHOOK_TOLERANCE_SECONDS) return null;

      const event = stripeWebhookSchema.safeParse(parseJson(req.rawBody));
      if (!event.success) return null;
      const session = event.data.data.object;
      const bookingId = session.client_reference_id ?? session.metadata?.bookingId;

      if (event.data.type === 'checkout.session.completed') {
        if (session.amount_total === null) return null;
        return {
          eventId: event.data.id,
          providerRef: session.id,
          orderRef: bookingId,
          status: 'succeeded',
          amountCents: session.amount_total,
        };
      }
      if (
        event.data.type === 'checkout.session.async_payment_failed' ||
        event.data.type === 'checkout.session.expired'
      ) {
        return {
          eventId: event.data.id,
          providerRef: session.id,
          orderRef: bookingId,
          status: 'failed',
          amountCents: session.amount_total ?? 0,
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
      const paymentIntent = session.ok
        ? (session.data.payment_intent as string | undefined)
        : undefined;
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
