import { afterEach, describe, expect, it, vi } from 'vitest';
import { resendSender } from './senders';

const INPUT = {
  from: 'Camping Cala Sereno <reservas@calasereno.example>',
  to: 'eva@example.com',
  replyTo: 'recepcion@calasereno.example',
  idempotencyKey: 'booking-confirmed/demo/bkg_abc123',
  message: {
    subject: 'Reserva confirmada',
    html: '<p>Confirmada</p>',
    text: 'Confirmada',
  },
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('resendSender', () => {
  it('falla antes de red si la clave idempotente no cumple el contrato de Resend', async () => {
    const fetchImpl = vi.fn<typeof fetch>();

    const result = await resendSender('re_test', { fetchImpl })({
      ...INPUT,
      idempotencyKey: 'x'.repeat(257),
    });

    expect(result).toEqual({
      ok: false,
      error: 'resend_invalid_idempotency_key',
      attempts: 0,
      retryable: false,
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('valida el éxito y envía una clave idempotente sin duplicarla en el body', async () => {
    const fetchImpl = vi.fn(async (_url: Parameters<typeof fetch>[0], init?: RequestInit) => {
      if (!init) throw new Error('RequestInit ausente');
      const headers = new Headers(init.headers);
      expect(headers.get('authorization')).toBe('Bearer re_test');
      expect(headers.get('idempotency-key')).toBe(INPUT.idempotencyKey);
      const body = JSON.parse(String(init.body)) as Record<string, unknown>;
      expect(body).not.toHaveProperty('idempotencyKey');
      expect(body.to).toEqual([INPUT.to]);
      return new Response(JSON.stringify({ id: 'email_123' }), { status: 200 });
    });

    const result = await resendSender('re_test', { fetchImpl })(INPUT);

    expect(result).toEqual({ ok: true, id: 'email_123', attempts: 1 });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('reintenta una respuesta transitoria una sola vez con la MISMA clave', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('temporal', { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'email_after_retry' }), { status: 200 }),
      );
    const sleep = vi.fn(async () => {});

    const result = await resendSender('re_test', { fetchImpl, sleep })(INPUT);

    expect(result).toEqual({ ok: true, id: 'email_after_retry', attempts: 2 });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(
      fetchImpl.mock.calls.map(([, init]) =>
        new Headers((init as RequestInit).headers).get('idempotency-key'),
      ),
    ).toEqual([INPUT.idempotencyKey, INPUT.idempotencyKey]);
    expect(sleep).toHaveBeenCalledTimes(1);
  });

  it('no reintenta un 4xx funcional ni copia el cuerpo remoto con PII al error', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ message: 'recipient eva@example.com rejected' }), {
          status: 422,
        }),
    );

    const result = await resendSender('re_test', { fetchImpl })(INPUT);

    expect(result).toEqual({
      ok: false,
      error: 'resend_http_422',
      attempts: 1,
      retryable: false,
    });
    expect(JSON.stringify(result)).not.toContain('eva@example.com');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('rechaza un 2xx sin id válido en vez de afirmar entrega', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ id: '', recipient: 'eva@example.com' }), { status: 200 }),
    );

    const result = await resendSender('re_test', { fetchImpl })(INPUT);

    expect(result).toEqual({
      ok: false,
      error: 'resend_invalid_response',
      attempts: 1,
      retryable: false,
    });
    expect(JSON.stringify(result)).not.toContain('eva@example.com');
  });

  it('aborta cada intento acotado y devuelve un código estable sin el error de red', async () => {
    const fetchImpl = vi.fn((_url: Parameters<typeof fetch>[0], init?: RequestInit) => {
      if (!init) throw new Error('RequestInit ausente');
      return new Promise<Response>((_resolve, reject) => {
        init.signal?.addEventListener(
          'abort',
          () => reject(new DOMException('connection to eva@example.com aborted', 'AbortError')),
          { once: true },
        );
      });
    });

    const result = await resendSender('re_test', {
      fetchImpl,
      timeoutMs: 5,
      sleep: async () => {},
    })(INPUT);

    expect(result).toEqual({
      ok: false,
      error: 'resend_timeout',
      attempts: 2,
      retryable: true,
    });
    expect(JSON.stringify(result)).not.toContain('eva@example.com');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
