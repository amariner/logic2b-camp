import { describe, expect, it } from 'vitest';
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
      utf8Encode(JSON.stringify({ Ds_Order: '1234xxxx0002', Ds_Response: '0000', Ds_Amount: '100' })),
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
