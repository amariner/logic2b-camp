/**
 * Adaptador Redsys (ADR 0011 §7): conexión por redirección (formulario
 * auto-post al TPV) + notificación server-to-server + reembolso por el
 * webservice REST. "Su comercio, su clave, por camping" — obligatorio en
 * España.
 *
 * Firma HMAC SHA256 verificada contra la implementación de referencia
 * `santiperez/node-redsys-api` y la guía oficial de migración a HMAC
 * SHA256 (consultadas en la sesión que escribió este adaptador). El 3DES
 * que deriva la clave por pedido es propio (`des.ts`) porque Workers no lo
 * soporta nativo — cruzado contra `node:crypto` en `des.test.ts`.
 *
 * PENDIENTE REAL: sin credenciales de comercio reales no se ha podido
 * verificar contra el sandbox de Redsys. Verificar antes del primer cobro
 * real (ver ADR 0011 §7 y BACKLOG).
 */
import { base64Decode, base64Encode, utf8Decode, utf8Encode } from './base64';
import { tripleDesCbcEncrypt } from './des';
import type {
  PaymentIntentParams,
  PaymentIntentResult,
  PaymentProvider,
  PaymentWebhookEvent,
} from './types';
import { z } from 'zod';

export type RedsysConfig = {
  /** FUC, 9 dígitos */
  merchantCode: string;
  terminal: string;
  /** clave de comercio en base64 (24 bytes tras decodificar) */
  secretKeyBase64: string;
  environment: 'test' | 'production';
};

export type RedsysProviderOptions = {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
};

const REDIRECT_URL: Record<RedsysConfig['environment'], string> = {
  test: 'https://sis-t.redsys.es:25443/sis/realizarPago',
  production: 'https://sis.redsys.es/sis/realizarPago',
};
const REST_URL: Record<RedsysConfig['environment'], string> = {
  test: 'https://sis-t.redsys.es:25443/sis/rest/trataPeticionREST',
  production: 'https://sis.redsys.es/sis/rest/trataPeticionREST',
};
const DEFAULT_REFUND_TIMEOUT_MS = 8_000;

const signedValueSchema = z
  .string()
  .min(1)
  .regex(/^[A-Za-z0-9+/_-]+={0,2}$/);
const redsysRestEnvelopeSchema = z.object({
  Ds_SignatureVersion: z.literal('HMAC_SHA256_V1'),
  Ds_MerchantParameters: signedValueSchema,
  Ds_Signature: signedValueSchema,
});
const redsysRestErrorSchema = z.object({
  errorCode: z.string().trim().min(1).max(32),
});
const redsysRefundResponseSchema = z.object({
  Ds_Order: z.string().trim().min(1),
  Ds_Amount: z.string().regex(/^\d+$/),
  Ds_Response: z.string().regex(/^\d{4}$/),
});

const CONSUMER_LANGUAGE: Record<string, string> = {
  es: '001',
  en: '002',
  ca: '003',
  fr: '004',
  de: '005',
  nl: '006',
};

function zeroPadTo8(bytes: Uint8Array): Uint8Array {
  const rem = bytes.length % 8;
  if (rem === 0) return bytes;
  const out = new Uint8Array(bytes.length + (8 - rem));
  out.set(bytes);
  return out;
}

async function hmacSha256(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  // Uint8Array.from() fuerza un ArrayBuffer concreto (no ArrayBufferLike):
  // crypto.subtle exige BufferSource, y los tipos de las funciones internas
  // se widen a Uint8Array<ArrayBufferLike> por las anotaciones explícitas.
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    Uint8Array.from(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, Uint8Array.from(message));
  return new Uint8Array(signature);
}

async function orderKey(order: string, secretKeyBase64: string): Promise<Uint8Array> {
  const key24 = base64Decode(secretKeyBase64);
  const padded = zeroPadTo8(utf8Encode(order));
  return tripleDesCbcEncrypt(padded, key24);
}

/**
 * Firma un `Ds_MerchantParameters` (base64) para un pedido dado. Exportada
 * porque la petición saliente y la notificación entrante firman IGUAL
 * (§7 del ADR 0011) — sirve tanto para `createIntent`/`refund` como para
 * fabricar notificaciones de prueba contra el sandbox propio.
 */
export async function signRedsysParameters(
  paramsBase64: string,
  order: string,
  secretKeyBase64: string,
): Promise<string> {
  const key = await orderKey(order, secretKeyBase64);
  const digest = await hmacSha256(key, utf8Encode(paramsBase64));
  return base64Encode(digest);
}

/** 4 dígitos numéricos + hasta 8 alfanuméricos (norma Ds_Merchant_Order). */
function generateOrder(bookingId: string): string {
  const numericPrefix = String(Math.floor(Math.random() * 10_000)).padStart(4, '0');
  const suffix = bookingId
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(-8)
    .padEnd(4, '0');
  return `${numericPrefix}${suffix}`;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

function matchesCents(value: string, amountCents: number): boolean {
  if (!Number.isSafeInteger(amountCents) || amountCents < 0) return false;
  return value.replace(/^0+(?=\d)/, '') === String(amountCents);
}

async function validateRefundResponse(
  payload: unknown,
  providerRef: string,
  amountCents: number,
  secretKeyBase64: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (redsysRestErrorSchema.safeParse(payload).success) {
    return { ok: false, error: 'redsys_provider_error' };
  }

  const envelope = redsysRestEnvelopeSchema.safeParse(payload);
  if (!envelope.success) return { ok: false, error: 'redsys_invalid_response' };

  let decoded: unknown;
  try {
    decoded = JSON.parse(utf8Decode(base64Decode(envelope.data.Ds_MerchantParameters)));
  } catch {
    return { ok: false, error: 'redsys_invalid_response' };
  }
  const refund = redsysRefundResponseSchema.safeParse(decoded);
  if (!refund.success) return { ok: false, error: 'redsys_invalid_response' };

  const expectedSignature = await signRedsysParameters(
    envelope.data.Ds_MerchantParameters,
    refund.data.Ds_Order,
    secretKeyBase64,
  );
  if (
    !constantTimeEqual(base64Decode(expectedSignature), base64Decode(envelope.data.Ds_Signature))
  ) {
    return { ok: false, error: 'redsys_invalid_signature' };
  }

  if (refund.data.Ds_Order !== providerRef || !matchesCents(refund.data.Ds_Amount, amountCents)) {
    return { ok: false, error: 'redsys_invalid_response' };
  }
  return refund.data.Ds_Response === '0900'
    ? { ok: true }
    : { ok: false, error: 'redsys_refund_rejected' };
}

export function redsysProvider(
  config: RedsysConfig,
  options: RedsysProviderOptions = {},
): PaymentProvider {
  const timeoutMs =
    options.timeoutMs !== undefined &&
    Number.isSafeInteger(options.timeoutMs) &&
    options.timeoutMs > 0
      ? Math.min(options.timeoutMs, 60_000)
      : DEFAULT_REFUND_TIMEOUT_MS;
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    name: 'redsys',

    async createIntent(params: PaymentIntentParams): Promise<PaymentIntentResult> {
      const order = generateOrder(params.bookingId);
      const merchantParams = {
        Ds_Merchant_Amount: String(params.amountCents),
        Ds_Merchant_Order: order,
        Ds_Merchant_MerchantCode: config.merchantCode,
        Ds_Merchant_Currency: '978', // EUR
        Ds_Merchant_TransactionType: '0', // autorización
        Ds_Merchant_Terminal: config.terminal,
        Ds_Merchant_MerchantURL: params.notifyUrl,
        Ds_Merchant_UrlOK: params.successUrl,
        Ds_Merchant_UrlKO: params.cancelUrl,
        Ds_Merchant_ProductDescription: params.description.slice(0, 125),
        Ds_Merchant_ConsumerLanguage: CONSUMER_LANGUAGE[params.locale.slice(0, 2)] ?? '001',
      };
      const paramsBase64 = base64Encode(utf8Encode(JSON.stringify(merchantParams)));
      const signature = await signRedsysParameters(paramsBase64, order, config.secretKeyBase64);
      return {
        method: 'form',
        action: REDIRECT_URL[config.environment],
        fields: {
          Ds_SignatureVersion: 'HMAC_SHA256_V1',
          Ds_MerchantParameters: paramsBase64,
          Ds_Signature: signature,
        },
        providerRef: order,
      };
    },

    async parseWebhook(req: {
      headers: Headers;
      rawBody: string;
    }): Promise<PaymentWebhookEvent | null> {
      const form = new URLSearchParams(req.rawBody);
      const paramsBase64 = form.get('Ds_MerchantParameters');
      const receivedSignature = form.get('Ds_Signature');
      if (!paramsBase64 || !receivedSignature) return null;

      let decoded: Record<string, string>;
      try {
        const raw = JSON.parse(utf8Decode(base64Decode(paramsBase64))) as Record<string, string>;
        decoded = Object.fromEntries(
          Object.entries(raw).map(([k, v]) => [k, decodeURIComponent(String(v))]),
        );
      } catch {
        return null;
      }
      const order = decoded.Ds_Order;
      if (!order) return null;

      const expected = await signRedsysParameters(paramsBase64, order, config.secretKeyBase64);
      if (!constantTimeEqual(base64Decode(expected), base64Decode(receivedSignature))) return null;

      const responseCode = Number(decoded.Ds_Response ?? '9999');
      const succeeded = Number.isFinite(responseCode) && responseCode >= 0 && responseCode <= 99;
      return {
        eventId: `${order}:${decoded.Ds_AuthorisationCode ?? decoded.Ds_Response ?? ''}`,
        providerRef: order,
        orderRef: order,
        status: succeeded ? 'succeeded' : 'failed',
        amountCents: Number(decoded.Ds_Amount ?? '0'),
      };
    },

    async refund(providerRef: string, amountCents: number, idempotencyKey: string) {
      // El contrato ya transporta identidad, pero Redsys no la usa hasta
      // verificar en su documentación qué semántica evita duplicar devoluciones.
      void idempotencyKey;
      const merchantParams = {
        Ds_Merchant_Amount: String(amountCents),
        Ds_Merchant_Order: providerRef,
        Ds_Merchant_MerchantCode: config.merchantCode,
        Ds_Merchant_Currency: '978',
        Ds_Merchant_TransactionType: '3', // devolución
        Ds_Merchant_Terminal: config.terminal,
      };
      const paramsBase64 = base64Encode(utf8Encode(JSON.stringify(merchantParams)));
      const signature = await signRedsysParameters(
        paramsBase64,
        providerRef,
        config.secretKeyBase64,
      );
      const controller = new AbortController();
      let timedOut = false;
      const timeout = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeoutMs);
      try {
        const res = await fetchImpl(REST_URL[config.environment], {
          method: 'POST',
          signal: controller.signal,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            Ds_SignatureVersion: 'HMAC_SHA256_V1',
            Ds_MerchantParameters: paramsBase64,
            Ds_Signature: signature,
          }),
        });
        if (!res.ok) return { ok: false, error: `redsys_http_${res.status}` };
        const payload: unknown = await res.json().catch(() => null);
        const validated = await validateRefundResponse(
          payload,
          providerRef,
          amountCents,
          config.secretKeyBase64,
        );
        if (!validated.ok) return validated;
        return { ok: true, providerRef };
      } catch {
        return { ok: false, error: timedOut ? 'redsys_timeout' : 'redsys_network' };
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}
