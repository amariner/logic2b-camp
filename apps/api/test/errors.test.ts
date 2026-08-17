/**
 * Observabilidad mínima (ADR 0026 §3): el cliente NUNCA ve el stack, el
 * servidor siempre lo registra, el buzón de la casa se entera sin inundarse y
 * un aviso que revienta no tumba la petición que ya estaba fallando.
 */
import { createDb, schema } from '@logic-camp/db';
import { env } from 'cloudflare:test';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { app } from '../src/app';
import {
  ALERT_WINDOW_MS,
  createOnError,
  errorDetail,
  logEvent,
  normalizeThrown,
  notFoundHandler,
  resetAlertBuckets,
  shouldAlert,
  type LogEntry,
  type SystemAlert,
} from '../src/errors';
import { sendSystemErrorAlert } from '../src/notify';
import { tenantMiddleware, type Env } from '../src/tenant';
import { seedTenant } from './fixtures';

const db = createDb(env.DB);
const envA = { DB: env.DB, TENANT_SLUG: 'errs' };

/** Texto que jamás debe salir del servidor: si aparece en una respuesta, hay fuga. */
const SECRETO = 'DATOS-INTERNOS-QUE-NO-DEBEN-SALIR-4711';

const alerts: SystemAlert[] = [];
const serverLogs: LogEntry[] = [];
const alertSpy = (_c: unknown, a: SystemAlert) => {
  alerts.push(a);
};

/** App de prueba con rutas que revientan a propósito, con el MISMO onError. */
const boom = new Hono<Env>()
  .use('*', normalizeThrown)
  .use('*', tenantMiddleware)
  .get('/api/boom', () => {
    throw new Error(SECRETO);
  })
  .get('/api/boom-no-error', () => {
    throw SECRETO; // no todo lo que se lanza es un Error
  })
  .get('/api/prohibido', () => {
    throw new HTTPException(403, { message: 'forbidden' });
  })
  .get('/api/prohibido-sin-mensaje', () => {
    throw new HTTPException(409);
  })
  .onError(createOnError(alertSpy, (entry) => serverLogs.push(entry)))
  .notFound(notFoundHandler);

/** Igual, pero el canal de aviso está roto: la respuesta debe sobrevivir igual. */
const boomConAvisoRoto = new Hono<Env>()
  .use('*', tenantMiddleware)
  .get('/api/boom', () => {
    throw new Error(SECRETO);
  })
  .onError(
    createOnError(() => {
      throw new Error('el canal de avisos también está roto');
    }),
  );

beforeAll(async () => {
  await seedTenant(env.DB, 'errs');
});

beforeEach(() => {
  alerts.length = 0;
  serverLogs.length = 0;
  resetAlertBuckets();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('onError: el cliente no ve nunca el detalle interno', () => {
  it('devuelve 500 JSON con referencia y SIN stack trace ni mensaje interno', async () => {
    const res = await boom.request('/api/boom', {}, envA);
    const texto = await res.clone().text();

    expect(res.status).toBe(500);
    expect(res.headers.get('content-type')).toContain('application/json');

    // lo que importa de todo este bloque: nada del error sale en el cuerpo
    expect(texto).not.toContain(SECRETO);
    expect(texto).not.toContain('Error:');
    expect(texto).not.toContain(' at '); // marca de línea de stack
    expect(texto).not.toContain('.ts:');

    const body = (await res.json()) as Record<string, unknown>;
    expect(Object.keys(body).sort()).toEqual(['error', 'ref']); // ni un campo más
    expect(body.error).toBe('internal_error');
    expect(String(body.ref)).toMatch(/^err_[0-9a-f]{12}$/);
  });

  it('tampoco filtra cuando lo lanzado no es un Error (Hono se lo saltaría)', async () => {
    const res = await boom.request('/api/boom-no-error', {}, envA);
    expect(res.status).toBe(500);
    const texto = await res.clone().text();
    expect(texto).not.toContain(SECRETO);
    expect((await res.json()) as unknown).toMatchObject({ error: 'internal_error' });
    // el valor lanzado no se pierde: acaba en el log del servidor
    expect(serverLogs.map((entry) => entry.detail).join('\n')).toContain(SECRETO);
  });

  it('registra el detalle completo en servidor con la MISMA referencia del cliente', async () => {
    const res = await boom.request('/api/boom', {}, envA);
    const { ref } = (await res.json()) as { ref: string };

    const entrada = serverLogs.find((entry) => entry.requestId === ref);
    expect(entrada).toBeDefined();
    if (!entrada) throw new Error('No se capturó el log correlacionado');
    expect(entrada.level).toBe('error');
    expect(entrada.event).toBe('unhandled_error');
    expect(entrada.tenant).toBe('errs');
    expect(entrada.requestId).toBe(ref);
    expect(entrada.route).toBe('GET /api/boom');
    // el detalle y el stack SÍ están, pero solo aquí
    expect(entrada.detail).toBe(SECRETO);
    expect(String(entrada.stack)).toContain(SECRETO);
  });

  it('un 4xx intencionado NO se convierte en 500 ni genera referencia ni aviso', async () => {
    const res = await boom.request('/api/prohibido', {}, envA);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'forbidden' });
    expect(alerts).toHaveLength(0);

    const sinMensaje = await boom.request('/api/prohibido-sin-mensaje', {}, envA);
    expect(sinMensaje.status).toBe(409);
    expect(await sinMensaje.json()).toEqual({ error: 'conflict' });
    expect(alerts).toHaveLength(0);
  });

  it('si el canal de aviso revienta, la petición original responde igual', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const res = await boomConAvisoRoto.request('/api/boom', {}, envA);
    expect(res.status).toBe(500);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.error).toBe('internal_error');
    expect(body.ref).toBeDefined();
  });
});

describe('notFound', () => {
  it('la app real devuelve JSON coherente, no el HTML por defecto de Hono', async () => {
    const res = await app.request('/api/ruta-que-no-existe', {}, envA);
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toContain('application/json');
    expect(await res.json()).toEqual({ error: 'not_found', path: '/api/ruta-que-no-existe' });
  });
});

describe('logEvent', () => {
  it('emite UNA línea de JSON con nivel, evento, tenant, requestId y detalle', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logEvent({
      level: 'error',
      event: 'prueba',
      tenant: 'errs',
      requestId: 'err_abc',
      detail: 'algo',
      extra: 42,
    });
    expect(spy).toHaveBeenCalledTimes(1);
    const linea = String(spy.mock.calls[0]?.[0]);
    expect(linea.split('\n')).toHaveLength(1);
    expect(JSON.parse(linea)).toMatchObject({
      level: 'error',
      event: 'prueba',
      tenant: 'errs',
      requestId: 'err_abc',
      detail: 'algo',
      extra: 42,
    });
    expect(JSON.parse(linea).ts).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('usa el canal que toca según el nivel', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    logEvent({ level: 'warn', event: 'ojo' });
    logEvent({ level: 'info', event: 'nada' });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledTimes(1);
  });

  it('redacta PII y credenciales reconocibles antes de escribir el log', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logEvent({
      level: 'error',
      event: 'provider_failed',
      detail:
        'recipient ana@example.com phone +34 699 999 999 booking CS-2026-123456 Authorization: Bearer sk_live_secret',
    });
    const line = String(spy.mock.calls[0]?.[0]);
    expect(line).not.toContain('ana@example.com');
    expect(line).not.toContain('+34 699 999 999');
    expect(line).not.toContain('CS-2026-123456');
    expect(line).not.toContain('sk_live_secret');
    expect(line).toContain('[redacted-email]');
  });
});

describe('errorDetail', () => {
  it('extrae nombre, mensaje y stack de un Error', () => {
    const d = errorDetail(new TypeError('roto'));
    expect(d.name).toBe('TypeError');
    expect(d.message).toBe('roto');
    expect(d.stack).toContain('roto');
  });

  it('no revienta con lo que no es un Error', () => {
    expect(errorDetail('texto').message).toBe('texto');
    expect(errorDetail({ a: 1 }).message).toBe('{"a":1}');
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(errorDetail(circular).message).toBe('error no serializable');
    expect(errorDetail(undefined).message).toBeTypeOf('string');
  });
});

describe('cortafuegos del buzón (shouldAlert)', () => {
  it('avisa del primero, calla los siguientes de la ventana y los cuenta', () => {
    const t0 = 1_000_000;
    expect(shouldAlert('GET /api/x', t0)).toEqual({ send: true, suppressed: 0 });
    expect(shouldAlert('GET /api/x', t0 + 1)).toEqual({ send: false, suppressed: 1 });
    expect(shouldAlert('GET /api/x', t0 + 2)).toEqual({ send: false, suppressed: 2 });
  });

  it('pasada la ventana vuelve a avisar, y arrastra el contador de los callados', () => {
    const t0 = 2_000_000;
    shouldAlert('GET /api/y', t0);
    shouldAlert('GET /api/y', t0 + 1);
    shouldAlert('GET /api/y', t0 + 2);
    expect(shouldAlert('GET /api/y', t0 + ALERT_WINDOW_MS)).toEqual({
      send: true,
      suppressed: 2,
    });
  });

  it('agrupa por ruta: un fallo en otra ruta sí avisa', () => {
    const t0 = 3_000_000;
    expect(shouldAlert('GET /api/a', t0).send).toBe(true);
    expect(shouldAlert('GET /api/a', t0 + 1).send).toBe(false);
    expect(shouldAlert('POST /api/b', t0 + 2).send).toBe(true);
  });

  it('onError solo dispara un aviso por ráfaga de la misma ruta', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    for (let i = 0; i < 5; i++) await boom.request('/api/boom', {}, envA);
    expect(alerts).toHaveLength(1);
    expect(alerts[0]?.route).toBe('GET /api/boom');
    expect(alerts[0]?.event).toBe('unhandled_error');
    expect(alerts[0]?.suppressed).toBe(0);
  });
});

describe('aviso al buzón de la casa (system_error)', () => {
  it('deja rastro en notifications_log con el canal de la casa, sin reserva asociada', async () => {
    await sendSystemErrorAlert(
      { db, tenantSlug: 'errs', apiKey: undefined },
      {
        ref: 'err_000000000001',
        event: 'unhandled_error',
        route: 'POST /api/bookings',
        occurredAt: new Date().toISOString(),
        suppressed: 0,
      },
    );

    const logs = await db
      .select()
      .from(schema.notificationsLog)
      .where(eq(schema.notificationsLog.template, 'system_error'));
    expect(logs).toHaveLength(1);
    expect(logs[0]?.status).toBe('disabled'); // sin RESEND_API_KEY en test
    expect(logs[0]?.bookingId).toBeNull();
    expect(logs[0]?.enquiryId).toBeNull();
  });

  it('con la base caída resuelve sin lanzar — avisar jamás genera un fallo nuevo', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const dbRoto = createDb({
      prepare: () => {
        throw new Error('D1 caída');
      },
      batch: () => {
        throw new Error('D1 caída');
      },
    } as unknown as D1Database);

    await expect(
      sendSystemErrorAlert(
        { db: dbRoto, tenantSlug: 'errs' },
        {
          ref: 'err_000000000002',
          event: 'unhandled_error',
          route: 'GET /api/x',
          occurredAt: new Date().toISOString(),
          suppressed: 0,
        },
      ),
    ).resolves.toBeUndefined();
  });
});
