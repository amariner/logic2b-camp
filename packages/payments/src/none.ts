/**
 * Adaptador `none` (ADR 0011 §1): sin pasarela. `mode:'none'` en la config
 * de tenant hace que nunca se llame a `createIntent` de verdad, pero el
 * contrato existe para que el resto del código no necesite un `if` especial.
 */
import type { PaymentIntentParams, PaymentIntentResult, PaymentProvider } from './types';

export function noneProvider(): PaymentProvider {
  return {
    name: 'none',
    async createIntent(params: PaymentIntentParams): Promise<PaymentIntentResult> {
      return { method: 'immediate', providerRef: `none_${params.bookingId}` };
    },
    async parseWebhook() {
      return null;
    },
    async refund() {
      return { ok: false, error: 'none_provider_no_refund' };
    },
  };
}
