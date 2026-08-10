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

export type StripeProviderOptions = {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  retryDelayMs?: number;
  sleep?: (delayMs: number) => Promise<void>;
};

const API_BASE = 'https://api.stripe.com/v1';
const WEBHOOK_TOLERANCE_SECONDS = 300;
const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_MAX_ATTEMPTS = 2;
const DEFAULT_RETRY_DELAY_MS = 200;

const stripeCheckoutSessionSchema = z.object({
  id: z.string().trim().min(1),
  url: z
    .string()
    .url()
    .refine((value) => value.startsWith('https://')),
});

const stripeRefundSessionSchema = z.object({
  payment_intent: z.string().trim().min(1).nullable(),
});

const stripeRefundSchema = z.object({
  id: z.string().trim().min(1),
});

const stripeIdempotencyKeySchema = z.string().trim().min(1).max(255);

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

type StripeRequest = {
  path: string;
  params: Record<string, string>;
  method?: 'GET' | 'POST';
  idempotencyKey?: string;
};

type StripeRuntime = {
  fetchImpl: typeof fetch;
  timeoutMs: number;
  retryDelayMs: number;
  sleep: (delayMs: number) => Promise<void>;
};

function shouldRetryResponse(response: Response): boolean {
  const directive = response.headers.get('stripe-should-retry');
  if (directive === 'false') return false;
  if (directive === 'true') return true;
  return response.status === 409 || response.status >= 500;
}

async function stripeRequest<T>(
  secretKey: string,
  request: StripeRequest,
  schema: z.ZodType<T>,
  runtime: StripeRuntime,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const method = request.method ?? 'POST';
  const parsedIdempotencyKey = stripeIdempotencyKeySchema.safeParse(request.idempotencyKey);
  if (method === 'POST' && !parsedIdempotencyKey.success) {
    return { ok: false, error: 'stripe_invalid_idempotency_key' };
  }

  const url =
    method === 'GET' && Object.keys(request.params).length > 0
      ? `${API_BASE}${request.path}?${formEncode(request.params)}`
      : `${API_BASE}${request.path}`;

  for (let attempt = 1; attempt <= DEFAULT_MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, runtime.timeoutMs);

    try {
      const response = await runtime.fetchImpl(url, {
        method,
        signal: controller.signal,
        headers: {
          authorization: `Bearer ${secretKey}`,
          ...(method === 'POST'
            ? {
                'content-type': 'application/x-www-form-urlencoded',
                'Idempotency-Key': parsedIdempotencyKey.success ? parsedIdempotencyKey.data : '',
              }
            : {}),
        },
        ...(method === 'POST' ? { body: formEncode(request.params) } : {}),
      });

      if (!response.ok) {
        if (attempt < DEFAULT_MAX_ATTEMPTS && shouldRetryResponse(response)) {
          clearTimeout(timeout);
          await runtime.sleep(runtime.retryDelayMs);
          continue;
        }
        return { ok: false, error: `stripe_http_${response.status}` };
      }

      const payload: unknown = await response.json().catch(() => null);
      const parsed = schema.safeParse(payload);
      return parsed.success
        ? { ok: true, data: parsed.data }
        : { ok: false, error: 'stripe_invalid_response' };
    } catch {
      const error = timedOut ? 'stripe_timeout' : 'stripe_network';
      if (attempt < DEFAULT_MAX_ATTEMPTS) {
        clearTimeout(timeout);
        await runtime.sleep(runtime.retryDelayMs);
        continue;
      }
      return { ok: false, error };
    } finally {
      clearTimeout(timeout);
    }
  }

  return { ok: false, error: 'stripe_network' };
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

export function stripeProvider(
  config: StripeConfig,
  options: StripeProviderOptions = {},
): PaymentProvider {
  const positiveInteger = (value: number | undefined, fallback: number, maximum: number): number =>
    value !== undefined && Number.isSafeInteger(value) && value > 0
      ? Math.min(value, maximum)
      : fallback;
  const runtime: StripeRuntime = {
    fetchImpl: options.fetchImpl ?? fetch,
    timeoutMs: positiveInteger(options.timeoutMs, DEFAULT_TIMEOUT_MS, 60_000),
    retryDelayMs: positiveInteger(options.retryDelayMs, DEFAULT_RETRY_DELAY_MS, 5_000),
    sleep: options.sleep ?? ((delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs))),
  };

  return {
    name: 'stripe',

    async createIntent(params: PaymentIntentParams): Promise<PaymentIntentResult> {
      const result = await stripeRequest(
        config.secretKey,
        {
          path: '/checkout/sessions',
          params: {
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
          },
          idempotencyKey: `checkout/${params.bookingId}`,
        },
        stripeCheckoutSessionSchema,
        runtime,
      );
      if (!result.ok) throw new Error(`stripe_create_intent_failed: ${result.error}`);
      return { method: 'redirect', redirectUrl: result.data.url, providerRef: result.data.id };
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

    async refund(providerRef: string, amountCents: number, idempotencyKey: string) {
      // providerRef aquí es el checkout session id; Stripe reembolsa por payment_intent.
      if (!stripeIdempotencyKeySchema.safeParse(idempotencyKey).success) {
        return { ok: false, error: 'stripe_invalid_idempotency_key' };
      }
      const session = await stripeRequest(
        config.secretKey,
        {
          path: `/checkout/sessions/${encodeURIComponent(providerRef)}`,
          params: {},
          method: 'GET',
        },
        stripeRefundSessionSchema,
        runtime,
      );
      if (!session.ok) return { ok: false, error: session.error };
      if (!session.data.payment_intent) {
        return { ok: false, error: 'stripe_refund_no_payment_intent' };
      }
      const result = await stripeRequest(
        config.secretKey,
        {
          path: '/refunds',
          params: {
            payment_intent: session.data.payment_intent,
            amount: String(amountCents),
          },
          idempotencyKey,
        },
        stripeRefundSchema,
        runtime,
      );
      if (!result.ok) return { ok: false, error: result.error };
      return { ok: true, providerRef: result.data.id };
    },
  };
}
