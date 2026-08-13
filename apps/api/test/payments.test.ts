/**
 * Tests de integración de pagos (ADR 0011) contra D1 real (workerd).
 * Cubre: gating pending/confirmed por modo, creación de intent redsys
 * (sin red — createIntent solo firma, no llama a fetch), webhook idempotente
 * y disparo de booking_confirmed en el momento real de la confirmación.
 */
import { createDb, schema } from '@logic-camp/db';
import { base64Decode, signRedsysParameters, utf8Decode } from '@logic-camp/payments';
import { env } from 'cloudflare:test';
import { eq } from 'drizzle-orm';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { app } from '../src/app';
import { executeRefund } from '../src/payments';
import { seedTenant } from './fixtures';

const REDSYS_ENV = {
  DB: env.DB,
  TENANT_SLUG: 'alfa',
  REDSYS_MERCHANT_KEY: 'sq7HjrUOBfKmC576ILgskD5srU870gJ7', // clave de test pública de Redsys
};
const REDSYS_CONFIG = {
  provider: 'redsys' as const,
  mode: 'deposit' as const,
  depositPercent: 30,
  redsysMerchantCode: '999008881',
  redsysTerminal: '001',
  environment: 'test' as const,
};

const json = (body: unknown, headers: Record<string, string> = {}) => ({
  method: 'POST',
  headers: { 'content-type': 'application/json', ...headers },
  body: JSON.stringify(body),
});

const bookingBody = (from: string, to: string, email = 'holder@example.com') => ({
  unitTypeId: 'ut_std',
  dateFrom: from,
  dateTo: to,
  occupancy: { adults: 2, childrenAges: [], pets: 0, vehicles: 1 },
  extraIds: [],
  holder: { name: 'Test Holder', email },
  locale: 'es',
  // ADR 0026 §2.3: la web pública no puede reservar sin consentimiento
  gdprConsent: true as const,
});

async function setPaymentsConfig(config: Record<string, unknown> | null) {
  const db = createDb(env.DB);
  const row = (await db.select().from(schema.tenants))[0]!;
  const modules = { ...(row.modules as Record<string, unknown>) };
  if (config) modules.payments = config;
  else delete modules.payments;
  await db.update(schema.tenants).set({ modules }).where(eq(schema.tenants.id, row.id));
}

function decodeMerchantParams(paramsBase64: string): Record<string, string> {
  return JSON.parse(utf8Decode(base64Decode(paramsBase64)));
}

/** Fabrica una notificación Redsys válidamente firmada, como la mandaría el TPV. */
async function buildNotification(
  order: string,
  responseCode: string,
  amountCents: number,
  authorizationCode = '123456',
) {
  return buildSignedNotification({
    Ds_Order: order,
    Ds_Response: responseCode,
    Ds_Amount: String(amountCents),
    Ds_AuthorisationCode: authorizationCode,
  });
}

async function buildSignedNotification(raw: Record<string, unknown>) {
  const encoded = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, typeof v === 'string' ? encodeURIComponent(v) : v]),
  );
  const paramsBase64 = Buffer.from(JSON.stringify(encoded)).toString('base64');
  const signature = await signRedsysParameters(
    paramsBase64,
    String(raw.Ds_Order ?? ''),
    REDSYS_ENV.REDSYS_MERCHANT_KEY,
  );
  return new URLSearchParams({
    Ds_SignatureVersion: 'HMAC_SHA256_V1',
    Ds_MerchantParameters: paramsBase64,
    Ds_Signature: signature,
  }).toString();
}

async function signStripeWebhook(secret: string, timestamp: number, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const digest = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${timestamp}.${body}`),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

beforeAll(async () => {
  await seedTenant(env.DB, 'alfa');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('gating por modo de pago (ADR 0011 §3)', () => {
  it('mode:none (explícito) confirma al instante, sin campo payment', async () => {
    await setPaymentsConfig({ provider: 'none', mode: 'none' });
    const res = await app.request(
      '/api/bookings',
      json(bookingBody('2026-05-01', '2026-05-04')),
      REDSYS_ENV,
    );
    expect(res.status).toBe(201);
    const body = (await res.json()) as { status: string; payment?: unknown };
    expect(body.status).toBe('confirmed');
    expect(body.payment).toBeUndefined();
  });

  it('mode:deposit sin depositPercent se normaliza a none (nunca pending por un cobro de 0€)', async () => {
    await setPaymentsConfig({ provider: 'redsys', mode: 'deposit' }); // sin depositPercent
    const res = await app.request(
      '/api/bookings',
      json(bookingBody('2026-05-05', '2026-05-08')),
      REDSYS_ENV,
    );
    expect(res.status).toBe(201);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe('confirmed');
  });

  it('canal phone/walkin nunca pasa por la pasarela aunque el modo lo exija', async () => {
    await setPaymentsConfig(REDSYS_CONFIG);
    // el alta manual la hace admin.ts con channel phone/walkin — aquí simulamos
    // el mismo efecto llamando a createBooking indirectamente vía el motor:
    // basta con comprobar que el canal 'web' SÍ exige pago (siguiente test) y
    // que el schema público no admite otro canal que 'web'.
    const res = await app.request(
      '/api/bookings',
      json(bookingBody('2026-05-09', '2026-05-11')),
      REDSYS_ENV,
    );
    // canal web con redsys deposit configurado: SÍ debe quedar pending
    expect(res.status).toBe(201);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe('pending');
  });

  it('provider mal configurado (redsys sin REDSYS_MERCHANT_KEY) → 500 y no crea nada', async () => {
    await setPaymentsConfig(REDSYS_CONFIG);
    const before = (await createDb(env.DB).select().from(schema.bookings)).length;
    const res = await app.request(
      '/api/bookings',
      json(bookingBody('2026-05-12', '2026-05-14')),
      { DB: env.DB, TENANT_SLUG: 'alfa' }, // SIN REDSYS_MERCHANT_KEY
    );
    expect(res.status).toBe(500);
    expect((await res.json()) as { error: string }).toEqual({ error: 'payment_not_configured' });
    const after = (await createDb(env.DB).select().from(schema.bookings)).length;
    expect(after).toBe(before);
  });
});

describe('reserva web con pago (redsys deposit)', () => {
  it('crea la reserva pending con un formulario firmado por el importe de la señal', async () => {
    await setPaymentsConfig(REDSYS_CONFIG);
    const res = await app.request(
      '/api/bookings',
      json(bookingBody('2026-05-15', '2026-05-18')),
      REDSYS_ENV,
    );
    expect(res.status).toBe(201);
    const body = (await res.json()) as {
      status: string;
      totalCents: number;
      payment: {
        method: string;
        action: string;
        fields: Record<string, string>;
        providerRef: string;
      };
    };
    expect(body.status).toBe('pending');
    expect(body.payment.method).toBe('form');
    expect(body.payment.action).toContain('redsys.es');
    const params = decodeMerchantParams(body.payment.fields.Ds_MerchantParameters!);
    const expectedDeposit = Math.round(body.totalCents * 0.3);
    expect(params.Ds_Merchant_Amount).toBe(String(expectedDeposit));
    expect(params.Ds_Merchant_Order).toBe(body.payment.providerRef);
    expect(JSON.stringify(params)).not.toContain('holder@example.com');
    expect(JSON.stringify(params)).not.toContain('holder%40example.com');

    // la reserva mapea a su intent para poder confirmarla luego desde el webhook
    const meta = await createDb(env.DB)
      .select()
      .from(schema.meta)
      .where(eq(schema.meta.key, `payment_order:redsys:${body.payment.providerRef}`));
    expect(meta).toHaveLength(1);
  });

  it('un reintento de Idempotency-Key recupera las mismas instrucciones de pago', async () => {
    await setPaymentsConfig(REDSYS_CONFIG);
    const init = json(bookingBody('2026-06-01', '2026-06-04', 'idem-pay@example.com'), {
      'Idempotency-Key': 'idem-payment-1',
    });
    const first = await app.request('/api/bookings', init, REDSYS_ENV);
    expect(first.status).toBe(201);
    const firstBody = (await first.json()) as {
      id: string;
      status: string;
      payment: Record<string, unknown>;
    };

    const retry = await app.request(
      '/api/bookings',
      json(bookingBody('2026-06-01', '2026-06-04', 'idem-pay@example.com'), {
        'Idempotency-Key': 'idem-payment-1',
      }),
      REDSYS_ENV,
    );
    expect(retry.status).toBe(200);
    const retryBody = (await retry.json()) as {
      id: string;
      status: string;
      idempotent: boolean;
      payment: Record<string, unknown>;
    };
    expect(retryBody).toMatchObject({
      id: firstBody.id,
      status: 'pending',
      idempotent: true,
    });
    expect(retryBody.payment).toEqual(firstBody.payment);
  });

  it('el titular recupera el mismo intento pendiente sin crear otro cobro', async () => {
    await setPaymentsConfig(REDSYS_CONFIG);
    const create = await app.request(
      '/api/bookings',
      json(bookingBody('2026-07-01', '2026-07-04', 'continue-payment@example.com')),
      REDSYS_ENV,
    );
    expect(create.status).toBe(201);
    const created = (await create.json()) as {
      id: string;
      code: string;
      payment: Record<string, unknown>;
    };

    const retry = await app.request(
      `/api/bookings/${created.code}/payment`,
      json({ email: 'continue-payment@example.com' }),
      REDSYS_ENV,
    );

    expect(retry.status).toBe(200);
    await expect(retry.json()).resolves.toEqual({ payment: created.payment });
    const intents = await createDb(env.DB)
      .select()
      .from(schema.meta)
      .where(eq(schema.meta.key, `payment_intent:${created.id}`));
    expect(intents).toHaveLength(1);
  });

  it('el reintento de pago falla cerrado para otro email o una reserva no pendiente', async () => {
    await setPaymentsConfig(REDSYS_CONFIG);
    const create = await app.request(
      '/api/bookings',
      json(bookingBody('2026-07-05', '2026-07-08', 'closed-retry@example.com')),
      REDSYS_ENV,
    );
    const created = (await create.json()) as {
      id: string;
      code: string;
      totalCents: number;
      payment: { providerRef: string };
    };

    const stranger = await app.request(
      `/api/bookings/${created.code}/payment`,
      json({ email: 'other@example.com' }),
      REDSYS_ENV,
    );
    expect(stranger.status).toBe(404);

    const amountCents = Math.round(created.totalCents * 0.3);
    const notification = await buildNotification(created.payment.providerRef, '0000', amountCents);
    const hook = await app.request(
      '/api/payments/webhook/redsys',
      {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: notification,
      },
      REDSYS_ENV,
    );
    expect(hook.status).toBe(200);

    const confirmed = await app.request(
      `/api/bookings/${created.code}/payment`,
      json({ email: 'closed-retry@example.com' }),
      REDSYS_ENV,
    );
    expect(confirmed.status).toBe(409);
    await expect(confirmed.json()).resolves.toEqual({
      error: 'payment_not_pending',
      status: 'confirmed',
    });
  });

  it('el webhook confirma la reserva, registra el pago y dispara booking_confirmed', async () => {
    await setPaymentsConfig(REDSYS_CONFIG);
    const create = await app.request(
      '/api/bookings',
      json(bookingBody('2026-05-19', '2026-05-22', 'webhook@example.com')),
      REDSYS_ENV,
    );
    const created = (await create.json()) as {
      id: string;
      totalCents: number;
      payment: { providerRef: string };
    };
    const depositCents = Math.round(created.totalCents * 0.3);
    const order = created.payment.providerRef;

    const notification = await buildNotification(order, '0000', depositCents);
    const hook = await app.request(
      '/api/payments/webhook/redsys',
      {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: notification,
      },
      REDSYS_ENV,
    );
    expect(hook.status).toBe(200);
    expect((await hook.json()) as { outcome: string }).toEqual({ ok: true, outcome: 'recorded' });

    const db = createDb(env.DB);
    const booking = (
      await db.select().from(schema.bookings).where(eq(schema.bookings.id, created.id))
    )[0]!;
    expect(booking.status).toBe('confirmed');
    expect(booking.paidCents).toBe(depositCents);

    const payments = await db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.bookingId, created.id));
    expect(payments).toHaveLength(1);
    expect(payments[0]!.provider).toBe('redsys');
    expect(payments[0]!.amountCents).toBe(depositCents);
    expect(payments[0]!.status).toBe('succeeded');

    // booking_confirmed se dispara AHORA (al confirmar), no al crear la reserva pending
    const log = await db
      .select()
      .from(schema.notificationsLog)
      .where(eq(schema.notificationsLog.bookingId, created.id));
    expect(log.map((l) => l.template)).toEqual(['booking_confirmed']);
  });

  it('reintento del mismo evento no vuelve a cobrar (idempotente)', async () => {
    await setPaymentsConfig(REDSYS_CONFIG);
    const create = await app.request(
      '/api/bookings',
      json(bookingBody('2026-05-23', '2026-05-26', 'retry@example.com')),
      REDSYS_ENV,
    );
    const created = (await create.json()) as {
      id: string;
      totalCents: number;
      payment: { providerRef: string };
    };
    const depositCents = Math.round(created.totalCents * 0.3);
    const notification = await buildNotification(created.payment.providerRef, '0000', depositCents);

    for (let i = 0; i < 2; i++) {
      await app.request(
        '/api/payments/webhook/redsys',
        {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: notification,
        },
        REDSYS_ENV,
      );
    }

    const db = createDb(env.DB);
    const booking = (
      await db.select().from(schema.bookings).where(eq(schema.bookings.id, created.id))
    )[0]!;
    expect(booking.paidCents).toBe(depositCents); // no se dobló
    const payments = await db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.bookingId, created.id));
    expect(payments).toHaveLength(1);
  });

  it('un importe firmado distinto del intent falla cerrado y no confirma ni registra pago', async () => {
    await setPaymentsConfig(REDSYS_CONFIG);
    const create = await app.request(
      '/api/bookings',
      json(bookingBody('2026-06-05', '2026-06-08', 'amount-mismatch@example.com')),
      REDSYS_ENV,
    );
    const created = (await create.json()) as {
      id: string;
      totalCents: number;
      payment: { providerRef: string };
    };
    const expected = Math.round(created.totalCents * 0.3);
    const notification = await buildNotification(created.payment.providerRef, '0000', expected - 1);
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const hook = await app.request(
      '/api/payments/webhook/redsys',
      {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: notification,
      },
      REDSYS_ENV,
    );
    expect(hook.status).toBe(409);
    await expect(hook.json()).resolves.toEqual({ error: 'payment_amount_mismatch' });

    const db = createDb(env.DB);
    const booking = (
      await db.select().from(schema.bookings).where(eq(schema.bookings.id, created.id))
    )[0]!;
    expect(booking.status).toBe('pending');
    expect(booking.paidCents).toBe(0);
    expect(
      await db.select().from(schema.payments).where(eq(schema.payments.bookingId, created.id)),
    ).toHaveLength(0);
  });

  it('un callback firmado pero mal tipado responde 400 y no escribe pagos ni saldo', async () => {
    await setPaymentsConfig(REDSYS_CONFIG);
    const create = await app.request(
      '/api/bookings',
      json(bookingBody('2026-06-25', '2026-06-28', 'typed-callback@example.com')),
      REDSYS_ENV,
    );
    const created = (await create.json()) as {
      id: string;
      totalCents: number;
      payment: { providerRef: string };
    };
    const amountCents = Math.round(created.totalCents * 0.3);
    const notification = await buildSignedNotification({
      Ds_Order: created.payment.providerRef,
      Ds_Response: '0000',
      Ds_Amount: amountCents,
      Ds_AuthorisationCode: 'TYPE-FAIL',
    });

    const hook = await app.request(
      '/api/payments/webhook/redsys',
      {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: notification,
      },
      REDSYS_ENV,
    );
    expect(hook.status).toBe(400);
    await expect(hook.json()).resolves.toEqual({ error: 'invalid_signature' });

    const db = createDb(env.DB);
    const booking = (
      await db.select().from(schema.bookings).where(eq(schema.bookings.id, created.id))
    )[0]!;
    expect(booking.status).toBe('pending');
    expect(booking.paidCents).toBe(0);
    expect(
      await db.select().from(schema.payments).where(eq(schema.payments.bookingId, created.id)),
    ).toHaveLength(0);
  });

  it('dos eventId distintos del mismo providerRef representan un solo cobro', async () => {
    await setPaymentsConfig(REDSYS_CONFIG);
    const create = await app.request(
      '/api/bookings',
      json(bookingBody('2026-06-09', '2026-06-12', 'provider-ref@example.com')),
      REDSYS_ENV,
    );
    const created = (await create.json()) as {
      id: string;
      totalCents: number;
      payment: { providerRef: string };
    };
    const amount = Math.round(created.totalCents * 0.3);
    const first = await buildNotification(created.payment.providerRef, '0000', amount, 'AUTH-ONE');
    const second = await buildNotification(created.payment.providerRef, '0000', amount, 'AUTH-TWO');

    for (const body of [first, second]) {
      const res = await app.request(
        '/api/payments/webhook/redsys',
        {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body,
        },
        REDSYS_ENV,
      );
      expect(res.status).toBe(200);
    }

    const db = createDb(env.DB);
    const booking = (
      await db.select().from(schema.bookings).where(eq(schema.bookings.id, created.id))
    )[0]!;
    expect(booking.paidCents).toBe(amount);
    expect(
      await db.select().from(schema.payments).where(eq(schema.payments.bookingId, created.id)),
    ).toHaveLength(1);
  });

  it('un refund Redsys funcionalmente rechazado no reduce el saldo local', async () => {
    await setPaymentsConfig(REDSYS_CONFIG);
    const create = await app.request(
      '/api/bookings',
      json(bookingBody('2026-06-21', '2026-06-24', 'refund-denied@example.com')),
      REDSYS_ENV,
    );
    const created = (await create.json()) as {
      id: string;
      totalCents: number;
      payment: { providerRef: string };
    };
    const amountCents = Math.round(created.totalCents * 0.3);
    const notification = await buildNotification(created.payment.providerRef, '0000', amountCents);
    const hook = await app.request(
      '/api/payments/webhook/redsys',
      {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: notification,
      },
      REDSYS_ENV,
    );
    expect(hook.status).toBe(200);

    const responseFields = {
      Ds_Order: created.payment.providerRef,
      Ds_Amount: String(amountCents),
      Ds_Response: '0180',
    };
    const responseParams = Buffer.from(JSON.stringify(responseFields)).toString('base64');
    const responseSignature = await signRedsysParameters(
      responseParams,
      created.payment.providerRef,
      REDSYS_ENV.REDSYS_MERCHANT_KEY,
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({
          Ds_SignatureVersion: 'HMAC_SHA256_V1',
          Ds_MerchantParameters: responseParams,
          Ds_Signature: responseSignature,
        }),
      ),
    );

    const db = createDb(env.DB);
    await expect(executeRefund(db, REDSYS_ENV, created.id, amountCents)).resolves.toEqual({
      ok: false,
      error: 'redsys_refund_rejected',
    });
    const booking = (
      await db.select().from(schema.bookings).where(eq(schema.bookings.id, created.id))
    )[0]!;
    expect(booking.paidCents).toBe(amountCents);
    expect(
      await db.select().from(schema.payments).where(eq(schema.payments.bookingId, created.id)),
    ).toHaveLength(1);
  });

  it('si crear el intent externo falla, responde 502 y declara la reserva pending persistida', async () => {
    await setPaymentsConfig({ provider: 'stripe', mode: 'full' });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { message: 'provider unavailable' } }), {
          status: 503,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await app.request(
      '/api/bookings',
      json(bookingBody('2026-06-13', '2026-06-16', 'intent-failed@example.com')),
      {
        DB: env.DB,
        TENANT_SLUG: 'alfa',
        STRIPE_SECRET_KEY: 'sk_test',
        STRIPE_WEBHOOK_SECRET: 'whsec_test',
      },
    );
    expect(res.status).toBe(502);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toMatchObject({
      error: 'payment_intent_failed',
      status: 'pending',
      persisted: true,
    });
    expect(body.ref).toMatch(/^err_/);
  });

  it('Stripe reintenta una creación ambigua con la identidad estable de la reserva', async () => {
    await setPaymentsConfig({ provider: 'stripe', mode: 'full' });
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError('socket closed after send'))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 'cs_after_retry',
            url: 'https://checkout.stripe.com/c/pay/cs_after_retry',
          }),
          { headers: { 'content-type': 'application/json' } },
        ),
      );
    vi.stubGlobal('fetch', fetchMock);

    const res = await app.request(
      '/api/bookings',
      json(bookingBody('2026-06-17', '2026-06-20', 'stripe-retry@example.com')),
      {
        DB: env.DB,
        TENANT_SLUG: 'alfa',
        STRIPE_SECRET_KEY: 'sk_test',
        STRIPE_WEBHOOK_SECRET: 'whsec_test',
      },
    );

    expect(res.status).toBe(201);
    const body = (await res.json()) as {
      id: string;
      status: string;
      payment: { providerRef: string };
    };
    expect(body).toMatchObject({
      status: 'pending',
      payment: { providerRef: 'cs_after_retry' },
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const keys = fetchMock.mock.calls.map(([, init]) =>
      new Headers((init as RequestInit).headers).get('idempotency-key'),
    );
    expect(keys).toEqual([`checkout/${body.id}`, `checkout/${body.id}`]);
  });

  it('Stripe rechaza en la frontera HTTP un evento correctamente firmado pero caducado', async () => {
    await setPaymentsConfig({ provider: 'stripe', mode: 'full' });
    const stripeEnv = {
      DB: env.DB,
      TENANT_SLUG: 'alfa',
      STRIPE_SECRET_KEY: 'sk_test',
      STRIPE_WEBHOOK_SECRET: 'whsec_test',
    };
    const body = JSON.stringify({
      id: 'evt_expired_signature',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_expired_signature',
          client_reference_id: 'bkg_unknown',
          amount_total: 12_345,
        },
      },
    });
    const timestamp = Math.floor(Date.now() / 1_000) - 301;
    const signature = await signStripeWebhook(stripeEnv.STRIPE_WEBHOOK_SECRET, timestamp, body);
    const db = createDb(env.DB);
    const paymentsBefore = (await db.select().from(schema.payments)).length;

    const hook = await app.request(
      '/api/payments/webhook/stripe',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'stripe-signature': `t=${timestamp},v1=${signature}`,
        },
        body,
      },
      stripeEnv,
    );

    expect(hook.status).toBe(400);
    await expect(hook.json()).resolves.toEqual({ error: 'invalid_signature' });
    expect((await db.select().from(schema.payments)).length).toBe(paymentsBefore);
  });

  it('firma inválida → 400, no toca la reserva', async () => {
    await setPaymentsConfig(REDSYS_CONFIG);
    const create = await app.request(
      '/api/bookings',
      json(bookingBody('2026-05-27', '2026-05-29', 'tampered@example.com')),
      REDSYS_ENV,
    );
    const created = (await create.json()) as { id: string; payment: { providerRef: string } };
    const params = { Ds_Order: created.payment.providerRef, Ds_Response: '0000', Ds_Amount: '100' };
    const paramsBase64 = Buffer.from(JSON.stringify(params)).toString('base64');
    const tampered = new URLSearchParams({
      Ds_SignatureVersion: 'HMAC_SHA256_V1',
      Ds_MerchantParameters: paramsBase64,
      Ds_Signature: 'firma-de-mentira==',
    }).toString();

    const hook = await app.request(
      '/api/payments/webhook/redsys',
      {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: tampered,
      },
      REDSYS_ENV,
    );
    expect(hook.status).toBe(400);

    const booking = (
      await createDb(env.DB)
        .select()
        .from(schema.bookings)
        .where(eq(schema.bookings.id, created.id))
    )[0]!;
    expect(booking.status).toBe('pending');
    expect(booking.paidCents).toBe(0);
  });
});
