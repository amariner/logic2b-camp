/**
 * Tipos del sistema de pagos (ADR 0011).
 * Este paquete es PURO: interfaz PaymentProvider + adaptadores. La base de
 * datos (tabla payments, paidCents) vive en la API, no aquí.
 */

export type PaymentMode = 'none' | 'deposit' | 'full';

/** Config por tenant (vive en tenants.modules.payments). */
export type PaymentsConfig = {
  provider: 'stripe' | 'redsys' | 'none';
  mode: PaymentMode;
  /** % del total cobrado como señal cuando mode='deposit' (p.ej. 30) */
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
  /** none: no hay nada que cobrar, la reserva confirma directo */
  | { method: 'immediate'; providerRef: string };

export type PaymentWebhookEvent = {
  /** identificador único del EVENTO (no del pago) para deduplicar reintentos */
  eventId: string;
  providerRef: string;
  orderRef?: string;
  status: 'succeeded' | 'failed';
  amountCents: number;
};

export type RefundResult = { ok: true; providerRef?: string } | { ok: false; error: string };

export interface PaymentProvider {
  readonly name: 'stripe' | 'redsys' | 'none';
  createIntent(params: PaymentIntentParams): Promise<PaymentIntentResult>;
  /** null = firma inválida o payload irreconocible (nunca lanza) */
  parseWebhook(req: { headers: Headers; rawBody: string }): Promise<PaymentWebhookEvent | null>;
  refund(providerRef: string, amountCents: number): Promise<RefundResult>;
}
