import { afterEach, describe, expect, it, vi } from 'vitest';
import { base64Decode, base64Encode, utf8Encode } from './base64';
import { redsysProvider, signRedsysParameters, type RedsysConfig } from './redsys';

// Clave de test pública publicada en la documentación de Redsys.
const TEST_CONFIG: RedsysConfig = {
  merchantCode: '999008881',
  terminal: '001',
  secretKeyBase64: 'sq7HjrUOBfKmC576ILgskD5srU870gJ7',
  environment: 'test',
};

const PARAMS = {
  bookingId: 'bkg_abc123def456',
  code: 'CS-2026-0042',
  amountCents: 12_345,
  currency: 'EUR',
  locale: 'es',
  description: 'Reserva CS-2026-0042',
  successUrl: 'https://camp.logic2b.com/reserva?code=CS-2026-0042&pago=ok',
  cancelUrl: 'https://camp.logic2b.com/reserva?code=CS-2026-0042&pago=cancelado',
  notifyUrl: 'https://camp.logic2b.com/api/payments/webhook/redsys',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

async function signedRefundResponse(
  values: Partial<Record<'Ds_Order' | 'Ds_Amount' | 'Ds_Response', string>> = {},
): Promise<Response> {
  const fields = {
    Ds_Order: '1234abcd0001',
    Ds_Amount: '5000',
    Ds_Response: '0900',
    Ds_AuthorisationCode: '439764',
    ...values,
  };
  const paramsBase64 = base64Encode(utf8Encode(JSON.stringify(fields)));
  const signature = await signRedsysParameters(
    paramsBase64,
    fields.Ds_Order,
    TEST_CONFIG.secretKeyBase64,
  );
  return new Response(
    JSON.stringify({
      Ds_SignatureVersion: 'HMAC_SHA256_V1',
      Ds_MerchantParameters: paramsBase64,
      Ds_Signature: signature,
    }),
    { headers: { 'content-type': 'application/json' } },
  );
}

describe('redsysProvider.createIntent', () => {
  it('devuelve un formulario auto-post con la firma y el pedido', async () => {
    const provider = redsysProvider(TEST_CONFIG);
    const result = await provider.createIntent(PARAMS);
    expect(result.method).toBe('form');
    if (result.method !== 'form') throw new Error('unreachable');
    expect(result.action).toContain('sis-t.redsys.es');
    expect(result.fields.Ds_SignatureVersion).toBe('HMAC_SHA256_V1');
    expect(result.providerRef).toMatch(/^\d{4}[a-zA-Z0-9]+$/);

    const decoded = JSON.parse(
      new TextDecoder().decode(base64Decode(result.fields.Ds_MerchantParameters!)),
    );
    expect(decoded.Ds_Merchant_Amount).toBe('12345');
    expect(decoded.Ds_Merchant_Order).toBe(result.providerRef);
    expect(decoded.Ds_Merchant_Currency).toBe('978');
  });
});

describe('redsysProvider.parseWebhook', () => {
  it('valida una notificación correctamente firmada y extrae los campos', async () => {
    const provider = redsysProvider(TEST_CONFIG);
    // firmamos manualmente una notificación con las mismas primitivas que usa el provider
    const order = '1234abcd0001';
    const raw = {
      Ds_Order: order,
      Ds_Response: '0000',
      Ds_Amount: '12345',
      Ds_AuthorisationCode: '123456',
      Ds_Date: '02/01/2026',
    };
    const encoded = Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, encodeURIComponent(v)]),
    );
    const paramsBase64 = base64Encode(utf8Encode(JSON.stringify(encoded)));
    const signed = await signRedsysParameters(paramsBase64, order, TEST_CONFIG.secretKeyBase64);

    const event = await provider.parseWebhook({
      headers: new Headers(),
      rawBody: new URLSearchParams({
        Ds_SignatureVersion: 'HMAC_SHA256_V1',
        Ds_MerchantParameters: paramsBase64,
        Ds_Signature: signed,
      }).toString(),
    });

    expect(event).not.toBeNull();
    expect(event?.status).toBe('succeeded');
    expect(event?.orderRef).toBe(order);
    expect(event?.amountCents).toBe(12_345);
    expect(event?.eventId).toBe(`${order}:123456`);
  });

  it('rechaza una firma inválida', async () => {
    const provider = redsysProvider(TEST_CONFIG);
    const paramsBase64 = base64Encode(
      utf8Encode(
        JSON.stringify({ Ds_Order: '1234xxxx0002', Ds_Response: '0000', Ds_Amount: '100' }),
      ),
    );
    const event = await provider.parseWebhook({
      headers: new Headers(),
      rawBody: new URLSearchParams({
        Ds_SignatureVersion: 'HMAC_SHA256_V1',
        Ds_MerchantParameters: paramsBase64,
        Ds_Signature: 'firma-falsa==',
      }).toString(),
    });
    expect(event).toBeNull();
  });

  it('marca como fallida una respuesta denegada (código fuera de 0000-0099)', async () => {
    const provider = redsysProvider(TEST_CONFIG);
    const order = '1234deny0003';
    const paramsBase64 = base64Encode(
      utf8Encode(
        JSON.stringify({
          Ds_Order: order,
          Ds_Response: encodeURIComponent('0180'), // denegada
          Ds_Amount: '100',
        }),
      ),
    );
    const signed = await signRedsysParameters(paramsBase64, order, TEST_CONFIG.secretKeyBase64);
    const event = await provider.parseWebhook({
      headers: new Headers(),
      rawBody: new URLSearchParams({
        Ds_SignatureVersion: 'HMAC_SHA256_V1',
        Ds_MerchantParameters: paramsBase64,
        Ds_Signature: signed,
      }).toString(),
    });
    expect(event?.status).toBe('failed');
  });
});

describe('redsysProvider.refund', () => {
  it('solo confirma una devolución 0900 firmada para el pedido e importe exactos', async () => {
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      expect(init.signal).toBeInstanceOf(AbortSignal);
      expect(new Headers(init.headers).has('idempotency-key')).toBe(false);
      const envelope = JSON.parse(String(init.body)) as {
        Ds_SignatureVersion: string;
        Ds_MerchantParameters: string;
      };
      expect(envelope.Ds_SignatureVersion).toBe('HMAC_SHA256_V1');
      const request = JSON.parse(
        new TextDecoder().decode(base64Decode(envelope.Ds_MerchantParameters)),
      ) as Record<string, string>;
      expect(request).toMatchObject({
        Ds_Merchant_Order: '1234abcd0001',
        Ds_Merchant_Amount: '5000',
        Ds_Merchant_TransactionType: '3',
      });
      return signedRefundResponse();
    });
    vi.stubGlobal('fetch', fetchMock);
    const provider = redsysProvider(TEST_CONFIG);

    await expect(provider.refund('1234abcd0001', 5_000, 'refund/bkg_1/5000/5000')).resolves.toEqual(
      { ok: true, providerRef: '1234abcd0001' },
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rechaza un HTTP 2xx vacío en vez de afirmar que devolvió dinero', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 200 })),
    );
    const provider = redsysProvider(TEST_CONFIG);

    await expect(provider.refund('1234abcd0001', 5_000, 'refund/bkg_1/5000/5000')).resolves.toEqual(
      { ok: false, error: 'redsys_invalid_response' },
    );
  });

  it('reduce el errorCode oficial a un código local sin copiar el body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ errorCode: 'SIS0042', detail: 'holder@example.com no copiar' }),
      ),
    );
    const provider = redsysProvider(TEST_CONFIG);

    await expect(provider.refund('1234abcd0001', 5_000, 'refund/bkg_1/5000/5000')).resolves.toEqual(
      { ok: false, error: 'redsys_provider_error' },
    );
  });

  it('rechaza un 2xx firmado cuyo código funcional no es 0900', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => signedRefundResponse({ Ds_Response: '0180' })),
    );
    const provider = redsysProvider(TEST_CONFIG);

    await expect(provider.refund('1234abcd0001', 5_000, 'refund/bkg_1/5000/5000')).resolves.toEqual(
      { ok: false, error: 'redsys_refund_rejected' },
    );
  });

  it('rechaza una respuesta firmada para otro pedido', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => signedRefundResponse({ Ds_Order: '1234other001' })),
    );
    const provider = redsysProvider(TEST_CONFIG);

    await expect(provider.refund('1234abcd0001', 5_000, 'refund/bkg_1/5000/5000')).resolves.toEqual(
      { ok: false, error: 'redsys_invalid_response' },
    );
  });

  it('rechaza un 0900 cuya firma no protege los parámetros', async () => {
    const response = await signedRefundResponse();
    const envelope = (await response.json()) as Record<string, string>;
    envelope.Ds_Signature = base64Encode(new Uint8Array(32));
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json(envelope)),
    );
    const provider = redsysProvider(TEST_CONFIG);

    await expect(provider.refund('1234abcd0001', 5_000, 'refund/bkg_1/5000/5000')).resolves.toEqual(
      { ok: false, error: 'redsys_invalid_signature' },
    );
  });

  it('aborta una única petición acotada sin filtrar el error de transporte', async () => {
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
    const provider = redsysProvider(TEST_CONFIG, { timeoutMs: 5 });

    await expect(provider.refund('1234abcd0001', 5_000, 'refund/bkg_1/5000/5000')).resolves.toEqual(
      { ok: false, error: 'redsys_timeout' },
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('cierra un error de red sin filtrarlo ni reintentar una devolución ambigua', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('socket holder@example.com closed'));
    vi.stubGlobal('fetch', fetchMock);
    const provider = redsysProvider(TEST_CONFIG);

    await expect(provider.refund('1234abcd0001', 5_000, 'refund/bkg_1/5000/5000')).resolves.toEqual(
      { ok: false, error: 'redsys_network' },
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
