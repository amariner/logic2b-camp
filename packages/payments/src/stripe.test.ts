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
  vi.useRealTimers();
});

describe('stripeProvider.createIntent', () => {
  it('crea una Checkout Session vía fetch y devuelve la URL de redirección', async () => {
    const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
      expect(url).toBe('https://api.stripe.com/v1/checkout/sessions');
      expect(init.method).toBe('POST');
      expect(new Headers(init.headers).get('idempotency-key')).toBe('checkout/bkg_abc123');
      expect(String(init.body)).toContain('client_reference_id=bkg_abc123');
      expect(String(init.body)).toContain('unit_amount%5D=12345');
      return new Response(
        JSON.stringify({ id: 'cs_test_1', url: 'https://checkout.stripe.com/cs_test_1' }),
        {
          status: 200,
        },
      );
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

  it('devuelve un código cerrado sin copiar el body de error de Stripe', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ error: { message: 'holder@example.com y sk_live_no_copiar' } }),
          { status: 401 },
        ),
    );
    vi.stubGlobal('fetch', fetchMock);
    const provider = stripeProvider(CONFIG);
    const failure = provider.createIntent(PARAMS);
    await expect(failure).rejects.toThrow('stripe_create_intent_failed: stripe_http_401');
    await expect(failure).rejects.not.toThrow(/holder@example|sk_live/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rechaza un 2xx mal formado en vez de fabricar una redirección', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ id: 123, url: 'javascript:alert(1)' }))),
    );
    const provider = stripeProvider(CONFIG);

    await expect(provider.createIntent(PARAMS)).rejects.toThrow(
      'stripe_create_intent_failed: stripe_invalid_response',
    );
  });

  it('reintenta una ambigüedad de red una vez con la MISMA clave', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError('socket holder@example.com closed'))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ id: 'cs_after_retry', url: 'https://checkout.stripe.com/retry' }),
        ),
      );
    vi.stubGlobal('fetch', fetchMock);
    const provider = stripeProvider(CONFIG, { sleep: async () => {} });

    await expect(provider.createIntent(PARAMS)).resolves.toMatchObject({
      providerRef: 'cs_after_retry',
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(
      fetchMock.mock.calls.map(([, init]) =>
        new Headers((init as RequestInit).headers).get('idempotency-key'),
      ),
    ).toEqual(['checkout/bkg_abc123', 'checkout/bkg_abc123']);
  });

  it('aborta dos intentos acotados y no filtra el error de transporte', async () => {
    const fetchMock = vi.fn((_url: Parameters<typeof fetch>[0], init?: RequestInit) => {
      if (!init?.signal) return Promise.reject(new Error('missing_abort_signal'));
      return new Promise<Response>((_resolve, reject) => {
        init.signal?.addEventListener(
          'abort',
          () => reject(new DOMException('holder@example.com timeout', 'AbortError')),
          { once: true },
        );
      });
    });
    vi.stubGlobal('fetch', fetchMock);
    const provider = stripeProvider(CONFIG, { timeoutMs: 5, sleep: async () => {} });

    const failure = provider.createIntent(PARAMS);
    await expect(failure).rejects.toThrow('stripe_create_intent_failed: stripe_timeout');
    await expect(failure).rejects.not.toThrow(/holder@example|missing_abort_signal/);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

async function sign(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

describe('stripeProvider.parseWebhook', () => {
  it('valida la firma y extrae el evento de checkout.session.completed', async () => {
    const provider = stripeProvider(CONFIG);
    const body = JSON.stringify({
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: {
        object: { id: 'cs_test_1', client_reference_id: 'bkg_abc123', amount_total: 12_345 },
      },
    });
    const timestamp = '1700000000';
    vi.useFakeTimers();
    vi.setSystemTime(Number(timestamp) * 1_000);
    const signature = await sign(CONFIG.webhookSecret, `${timestamp}.${body}`);
    const event = await provider.parseWebhook({
      headers: new Headers({
        'stripe-signature': `t=${timestamp},v1=${'0'.repeat(64)},v1=${signature}`,
      }),
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
    const body = JSON.stringify({
      id: 'evt_2',
      type: 'checkout.session.completed',
      data: { object: {} },
    });
    const event = await provider.parseWebhook({
      headers: new Headers({ 'stripe-signature': 't=123,v1=deadbeef' }),
      rawBody: body,
    });
    expect(event).toBeNull();
  });

  it('ignora eventos que no nos interesan', async () => {
    const provider = stripeProvider(CONFIG);
    const body = JSON.stringify({
      id: 'evt_3',
      type: 'payment_intent.created',
      data: { object: {} },
    });
    const timestamp = '1700000000';
    vi.useFakeTimers();
    vi.setSystemTime(Number(timestamp) * 1_000);
    const signature = await sign(CONFIG.webhookSecret, `${timestamp}.${body}`);
    const event = await provider.parseWebhook({
      headers: new Headers({ 'stripe-signature': `t=${timestamp},v1=${signature}` }),
      rawBody: body,
    });
    expect(event).toBeNull();
  });

  it('rechaza una firma correcta recibida fuera de la ventana antirreplay', async () => {
    const provider = stripeProvider(CONFIG);
    const body = JSON.stringify({
      id: 'evt_old',
      type: 'checkout.session.completed',
      data: {
        object: { id: 'cs_test_old', client_reference_id: 'bkg_old', amount_total: 12_345 },
      },
    });
    const timestamp = 1_700_000_000;
    vi.useFakeTimers();
    vi.setSystemTime((timestamp + 301) * 1_000);
    const signature = await sign(CONFIG.webhookSecret, `${timestamp}.${body}`);

    const event = await provider.parseWebhook({
      headers: new Headers({ 'stripe-signature': `t=${timestamp},v1=${signature}` }),
      rawBody: body,
    });

    expect(event).toBeNull();
  });

  it('rechaza un payload firmado cuyo importe no respeta el esquema de Stripe', async () => {
    const provider = stripeProvider(CONFIG);
    const body = JSON.stringify({
      id: 'evt_bad_amount',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_bad_amount',
          client_reference_id: 'bkg_bad_amount',
          amount_total: '12345',
        },
      },
    });
    const timestamp = 1_700_000_000;
    vi.useFakeTimers();
    vi.setSystemTime(timestamp * 1_000);
    const signature = await sign(CONFIG.webhookSecret, `${timestamp}.${body}`);

    const event = await provider.parseWebhook({
      headers: new Headers({ 'stripe-signature': `t=${timestamp},v1=${signature}` }),
      rawBody: body,
    });

    expect(event).toBeNull();
  });
});

describe('stripeProvider.refund', () => {
  it('busca el payment_intent y reembolsa con la identidad explícita de la operación', async () => {
    const calls: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        calls.push(url);
        if (url.includes('/checkout/sessions/cs_test_1')) {
          expect(new Headers(init.headers).has('idempotency-key')).toBe(false);
          return new Response(JSON.stringify({ payment_intent: 'pi_test_1' }), { status: 200 });
        }
        expect(new Headers(init.headers).get('idempotency-key')).toBe(
          'refund/bkg_abc123/12345/5000',
        );
        return new Response(JSON.stringify({ id: 're_test_1' }), { status: 200 });
      }),
    );
    const provider = stripeProvider(CONFIG);
    const result = await provider.refund('cs_test_1', 5_000, 'refund/bkg_abc123/12345/5000');
    expect(result).toEqual({ ok: true, providerRef: 're_test_1' });
    expect(calls[0]).toContain('/checkout/sessions/cs_test_1');
    expect(calls[1]).toBe('https://api.stripe.com/v1/refunds');
  });

  it('rechaza un refund 2xx sin id en vez de afirmar que devolvió dinero', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(new Response(JSON.stringify({ payment_intent: 'pi_test_1' })))
        .mockResolvedValueOnce(new Response(JSON.stringify({ id: '' }))),
    );
    const provider = stripeProvider(CONFIG);

    await expect(
      provider.refund('cs_test_1', 5_000, 'refund/bkg_abc123/12345/5000'),
    ).resolves.toEqual({ ok: false, error: 'stripe_invalid_response' });
  });

  it('rechaza una identidad inválida antes de consultar Stripe', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const provider = stripeProvider(CONFIG);

    await expect(provider.refund('cs_test_1', 5_000, ' ')).resolves.toEqual({
      ok: false,
      error: 'stripe_invalid_idempotency_key',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
