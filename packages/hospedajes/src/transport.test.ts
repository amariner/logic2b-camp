import { describe, expect, it, vi } from 'vitest';
import { manualTransport, sesTransport, type SesCredentials } from './transport';

const CREDS: SesCredentials = {
  endpoint: 'https://ses.example/ws/comunicacion',
  usuario: 'camping',
  password: 's3cr3t',
};

describe('manualTransport', () => {
  it('no envía por red: señala que el parte se descarga a mano', async () => {
    const r = await manualTransport().send('<xml/>', null);
    expect(r).toEqual({ ok: false, error: 'manual_transport' });
    expect(manualTransport().mode).toBe('manual');
  });
});

describe('sesTransport', () => {
  it('sin credenciales → missing_credentials, sin tocar la red', async () => {
    const fetchImpl = vi.fn();
    const r = await sesTransport(fetchImpl as unknown as typeof fetch).send('<xml/>', null);
    expect(r).toEqual({ ok: false, error: 'missing_credentials' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('POST con basic auth y content-type XML; lee la referencia de la respuesta', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response('<respuesta><referencia>LOTE-42</referencia></respuesta>', { status: 200 }),
    );
    const r = await sesTransport(fetchImpl as unknown as typeof fetch).send('<xml/>', CREDS);
    expect(r).toEqual({ ok: true, reference: 'LOTE-42' });

    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(url).toBe(CREDS.endpoint);
    expect(init.method).toBe('POST');
    expect(headers.authorization).toBe(`Basic ${btoa('camping:s3cr3t')}`);
    expect(headers['content-type']).toContain('application/xml');
    expect(init.body).toBe('<xml/>');
  });

  it('respuesta de error HTTP → ses_http_<status>', async () => {
    const fetchImpl = vi.fn(async () => new Response('nope', { status: 503 }));
    const r = await sesTransport(fetchImpl as unknown as typeof fetch).send('<xml/>', CREDS);
    expect(r).toEqual({ ok: false, error: 'ses_http_503' });
  });

  it('sede inalcanzable (fetch lanza) → ses_unreachable, nunca lanza', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('network');
    });
    const r = await sesTransport(fetchImpl as unknown as typeof fetch).send('<xml/>', CREDS);
    expect(r).toEqual({ ok: false, error: 'ses_unreachable' });
  });

  it('200 sin referencia reconocible → ok con reference null', async () => {
    const fetchImpl = vi.fn(async () => new Response('<ok/>', { status: 200 }));
    const r = await sesTransport(fetchImpl as unknown as typeof fetch).send('<xml/>', CREDS);
    expect(r).toEqual({ ok: true, reference: null });
  });
});
