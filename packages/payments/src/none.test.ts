import { describe, expect, it } from 'vitest';
import { noneProvider } from './none';

describe('noneProvider', () => {
  it('createIntent es inmediato, sin red ni redirección', async () => {
    const provider = noneProvider();
    const result = await provider.createIntent({
      bookingId: 'bkg_1',
      code: 'CS-2026-0001',
      amountCents: 0,
      currency: 'EUR',
      locale: 'es',
      description: '',
      successUrl: '',
      cancelUrl: '',
      notifyUrl: '',
    });
    expect(result).toEqual({ method: 'immediate', providerRef: 'none_bkg_1' });
  });

  it('no reconoce ningún webhook ni permite reembolso por pasarela', async () => {
    const provider = noneProvider();
    await expect(provider.parseWebhook({ headers: new Headers(), rawBody: '' })).resolves.toBeNull();
    await expect(provider.refund('x', 100)).resolves.toEqual({
      ok: false,
      error: 'none_provider_no_refund',
    });
  });
});
