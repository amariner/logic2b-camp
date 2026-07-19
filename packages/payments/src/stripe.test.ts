import { afterEach, describe, expect, it, vi } from 'vitest';
import { stripeProvider } from './stripe';

const CONFIG = { secretKey: 'sk_test_123', webhookSecret: 'whsec_test' };
const PARAMS = {
  bookingId: 'bkg_abc123',
  code: 'CS-2026-0042',
  amountCents: 12_345,
  currency: 'EUR',
  locale: 'es',
  description: 'Reserva CS-2026-0042',
  successUrl: 'https://camp.logic2b.com/reserva?code=CS-2026-0042&pago=ok',
  cancelUrl: 'https://camp.logic2b.com/reserva?code=CS-2026-0042&pago=cancelado',
  notifyUrl: 'https://camp.logic2b.com/api/payments/webhook/stripe',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('stripeProvider.createIntent', () => {
  it('crea una Checkout Session vía fetch y devuelve la URL de redirección', async () => {
    const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
      expect(url).toBe('https://api.stripe.com/v1/checkout/sessions');
      expect(init.method).toBe('POST');
      expect(String(init.body)).toContain('client_reference_id=bkg_abc123');
      expect(String(init.body)).toContain('unit_amount%5D=12345');
      return new Response(JSON.stringify({ id: 'cs_test_1', url: 'https://checkout.stripe.com/cs_test_1' }), {
        status: 200,
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const provider = stripeProvider(CONFIG);
    const result = await provider.createIntent(PARAMS);
    expect(result).toEqual({
      method: 'redirect',
      redirectUrl: 'https://checkout.stripe.com/cs_test_1',
      providerRef: 'cs_test_1',
    });
  });

  it('lanza con el mensaje de Stripe si la sesión falla', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ error: { message: 'clave inválida' } }), { status: 401 })),
    );
    const provider = stripeProvider(CONFIG);
    await expect(provider.createIntent(PARAMS)).rejects.toThrow(/clave inválida/);
  });
});

async function sign(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

describe('stripeProvider.parseWebhook', () => {
  it('valida la firma y extrae el evento de checkout.session.completed', async () => {
    const provider = stripeProvider(CONFIG);
    const body = JSON.stringify({
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_1', client_reference_id: 'bkg_abc123', amount_total: 12_345 } },
    });
    const timestamp = '1700000000';
    const signature = await sign(CONFIG.webhookSecret, `${timestamp}.${body}`);
    const event = await provider.parseWebhook({
      headers: new Headers({ 'stripe-signature': `t=${timestamp},v1=${signature}` }),
      rawBody: body,
    });
    expect(event).toEqual({
      eventId: 'evt_1',
      providerRef: 'cs_test_1',
      orderRef: 'bkg_abc123',
      status: 'succeeded',
      amountCents: 12_345,
    });
  });

  it('rechaza una firma inválida', async () => {
    const provider = stripeProvider(CONFIG);
    const body = JSON.stringify({ id: 'evt_2', type: 'checkout.session.completed', data: { object: {} } });
    const event = await provider.parseWebhook({
      headers: new Headers({ 'stripe-signature': 't=123,v1=deadbeef' }),
      rawBody: body,
    });
    expect(event).toBeNull();
  });

  it('ignora eventos que no nos interesan', async () => {
    const provider = stripeProvider(CONFIG);
    const body = JSON.stringify({ id: 'evt_3', type: 'payment_intent.created', data: { object: {} } });
    const timestamp = '1700000000';
    const signature = await sign(CONFIG.webhookSecret, `${timestamp}.${body}`);
    const event = await provider.parseWebhook({
      headers: new Headers({ 'stripe-signature': `t=${timestamp},v1=${signature}` }),
      rawBody: body,
    });
    expect(event).toBeNull();
  });
});

describe('stripeProvider.refund', () => {
  it('busca el payment_intent de la session y reembolsa', async () => {
    const calls: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        calls.push(url);
        if (url.includes('/checkout/sessions/cs_test_1')) {
          return new Response(JSON.stringify({ payment_intent: 'pi_test_1' }), { status: 200 });
        }
        return new Response(JSON.stringify({ id: 're_test_1' }), { status: 200 });
      }),
    );
    const provider = stripeProvider(CONFIG);
    const result = await provider.refund('cs_test_1', 5_000);
    expect(result).toEqual({ ok: true, providerRef: 're_test_1' });
    expect(calls[0]).toContain('/checkout/sessions/cs_test_1');
    expect(calls[1]).toBe('https://api.stripe.com/v1/refunds');
  });
});
