/**
 * Observabilidad mínima de la API (ADR 0026, bloque 3).
 *
 * Antes de esto, una excepción no capturada salía como 500 con el stack trace
 * en el cuerpo de la respuesta —fuga de información al cliente— y nadie se
 * enteraba nunca. Tres piezas pequeñas lo cierran:
 *
 *  - `createOnError`: el cliente recibe un JSON limpio con una referencia de
 *    correlación; el detalle completo (mensaje, nombre y stack) se queda
 *    SIEMPRE del lado del servidor, bajo esa misma referencia.
 *  - `notFoundHandler`: JSON coherente con el resto de la API, no el HTML de
 *    Hono.
 *  - `logEvent`: una línea de JSON por suceso. Es lo que hace útil el log de
 *    Cloudflare y el único punto donde se engancharía Logpush o Sentry.
 *
 * PUNTO CIEGO CONOCIDO Y ACEPTADO (ADR 0026 §3): el aviso al buzón de la casa
 * viaja por correo. Si lo que ha fallado es precisamente el correo, el aviso no
 * llega a nadie y solo queda la línea de log. No se resuelve aquí: la
 * observabilidad de verdad necesita un canal que no dependa del sistema que
 * vigila, y eso es Logpush o Sentry, que necesitan credenciales.
 */
import type { Context, ErrorHandler, MiddlewareHandler, NotFoundHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { uid } from './ids';
import type { Env } from './tenant';

// ---------------------------------------------------------------------------
// Log estructurado
// ---------------------------------------------------------------------------

export type LogLevel = 'error' | 'warn' | 'info';

/** Solo escalares: la línea tiene que seguir siendo JSON plano y grepable. */
export type LogValue = string | number | boolean | null | undefined;

export type LogEntry = {
  level: LogLevel;
  /** identificador estable del suceso en snake_case — es lo que se filtra en el panel */
  event: string;
  /** slug del tenant: en producción cada Worker es uno, pero el log se lee junto */
  tenant?: string;
  /** misma referencia que ha visto el cliente: permite cruzar queja ↔ log */
  requestId?: string;
  /** el porqué del fallo, en texto — nunca sale hacia el cliente */
  detail?: string;
  [key: string]: LogValue;
};

export type LogFn = (entry: LogEntry) => void;

/** Redacción defensiva para los formatos de PII/credencial que más llegan de proveedores. */
export function redactSensitiveText(value: string): string {
  return value
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted-email]')
    .replace(/\+?\d(?:[\s().-]*\d){8,14}\b/g, '[redacted-phone]')
    .replace(/\bCS-\d{4}-[A-Z0-9-]+\b/gi, '[redacted-booking]')
    .replace(/\bBearer\s+[^\s"']+/gi, 'Bearer [redacted-token]')
    .replace(/\b(?:sk|rk|whsec|re)_(?:live_|test_)?[A-Za-z0-9_-]+\b/g, '[redacted-token]');
}

/**
 * Emite UNA línea de JSON. Un `console.error` con la cadena interpolada es
 * ilegible en cuanto hay volumen; esto se filtra por `event`, se agrupa por
 * `tenant` y se cruza por `requestId`.
 */
export function logEvent(entry: LogEntry): void {
  const safeEntry = Object.fromEntries(
    Object.entries(entry).map(([key, value]) => [
      key,
      typeof value === 'string' ? redactSensitiveText(value) : value,
    ]),
  );
  const line = JSON.stringify({ ts: new Date().toISOString(), ...safeEntry });

  // ENGANCHE Logpush / Sentry (ADR 0026 §3): hoy la línea sale por la salida
  // estándar del Worker, que es lo que recoge `wrangler tail` y lo que Logpush
  // reenviaría a un destino externo SIN tocar este código. El día que haya
  // credenciales, el envío al recolector va aquí: una llamada, un solo sitio.
  if (entry.level === 'error') console.error(line);
  else if (entry.level === 'warn') console.warn(line);
  else console.log(line);
}

/** Todo lo que sabemos del fallo, para el log del servidor. JAMÁS para el cliente. */
export function errorDetail(err: unknown): { name?: string; message: string; stack?: string } {
  if (err instanceof Error) return { name: err.name, message: err.message, stack: err.stack };
  if (typeof err === 'string') return { message: err };
  try {
    return { message: JSON.stringify(err) ?? String(err) };
  } catch {
    return { message: 'error no serializable' };
  }
}

// ---------------------------------------------------------------------------
// Cortafuegos del buzón de la casa
// ---------------------------------------------------------------------------

/** Ventana del cortafuegos: como mucho UN aviso por ruta y ventana. */
export const ALERT_WINDOW_MS = 15 * 60 * 1000;
const ALERT_MAX_KEYS = 500;

type AlertBucket = { openedAt: number; suppressed: number };
const alertBuckets = new Map<string, AlertBucket>();

export type AlertDecision = { send: boolean; suppressed: number };

/**
 * Una ruta que revienta en cada petición mandaría cientos de correos a la
 * recepción del camping y el aviso dejaría de leerse, que es peor que no
 * tenerlo. Se agrupa por ruta y sale UNO por ventana; los que se callan se
 * cuentan y el contador viaja en el aviso siguiente, para que nadie confunda
 * "ha pasado una vez" con "está pasando sin parar".
 *
 * Vive en memoria del isolate, igual que el rate limiter (ADR 0004): no es
 * exacto entre isolates y no hace falta que lo sea — sirve para no inundar el
 * buzón, no para medir.
 */
export function shouldAlert(key: string, now: number = Date.now()): AlertDecision {
  const bucket = alertBuckets.get(key);
  if (!bucket || now - bucket.openedAt >= ALERT_WINDOW_MS) {
    const suppressed = bucket?.suppressed ?? 0;
    alertBuckets.set(key, { openedAt: now, suppressed: 0 });
    if (alertBuckets.size > ALERT_MAX_KEYS) {
      for (const [k, v] of alertBuckets)
        if (now - v.openedAt >= ALERT_WINDOW_MS) alertBuckets.delete(k);
    }
    return { send: true, suppressed };
  }
  bucket.suppressed += 1;
  return { send: false, suppressed: bucket.suppressed };
}

/** Solo para tests: la ventana vive en memoria del isolate y no se reinicia sola. */
export function resetAlertBuckets(): void {
  alertBuckets.clear();
}

// ---------------------------------------------------------------------------
// onError / notFound
// ---------------------------------------------------------------------------

/** Lo que se le cuenta al buzón de la casa. Sin mensaje interno, sin stack. */
export type SystemAlert = {
  ref: string;
  event: string;
  /** método + patrón de ruta, p. ej. `POST /api/bookings` */
  route: string;
  occurredAt: string;
  suppressed: number;
};

/**
 * Canal del aviso. Se inyecta desde `app.ts` en vez de importarlo aquí para que
 * este módulo no dependa de `notify.ts` (que sí depende de este por `logEvent`)
 * y para poder probar que un aviso que revienta no tumba la respuesta.
 */
export type AlertFn = (c: Context<Env>, alert: SystemAlert) => void;

/** Códigos por defecto de los 4xx intencionados que no traen mensaje propio. */
const HTTP_CODES: Record<number, string> = {
  400: 'bad_request',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'not_found',
  405: 'method_not_allowed',
  409: 'conflict',
  422: 'unprocessable_entity',
  429: 'rate_limited',
};

/**
 * Hono solo entrega a `onError` lo que es un `Error` (así está escrito en
 * `hono-base`: si no lo es, lo relanza). Un `throw 'texto'` o un `throw {…}`
 * —de una librería de terceros, por ejemplo— se escaparía del handler y
 * llegaría a workerd, que responde con SU propio 500 y su propio texto: justo
 * la fuga que este bloque cierra. Este middleware envuelve cualquier
 * lanzamiento raro en un `Error` para que ninguno se salga por ese hueco.
 *
 * Va el PRIMERO de la cadena, para cubrir también a los demás middlewares.
 */
export const normalizeThrown: MiddlewareHandler<Env> = async (c, next) => {
  try {
    await next();
  } catch (e) {
    if (e instanceof Error) throw e;
    const wrapped = new Error(errorDetail(e).message, { cause: e });
    wrapped.name = 'NonError';
    throw wrapped;
  }
};

export function createOnError(alert: AlertFn, logger: LogFn = logEvent): ErrorHandler<Env> {
  return (err, c) => {
    // Un 4xx lanzado A PROPÓSITO por un handler no es un fallo del sistema: se
    // devuelve tal cual, sin referencia y sin despertar a nadie. Convertirlo en
    // 500 sería mentir sobre de quién es el problema.
    if (err instanceof HTTPException && err.status < 500) {
      if (err.res) return err.res;
      return c.json({ error: err.message || HTTP_CODES[err.status] || 'http_error' }, err.status);
    }

    const ref = uid('err');
    const detail = errorDetail(err);
    const occurredAt = new Date().toISOString();
    // `routePath` es el patrón registrado (`/api/bookings/:id`), no el path con
    // el id dentro: agrupa bien y no mete identificadores en el log ni el correo.
    const route = `${c.req.method} ${safeRoutePath(c)}`;
    const tenant = safeTenantSlug(c);

    logger({
      level: 'error',
      event: 'unhandled_error',
      tenant,
      requestId: ref,
      route,
      errorName: detail.name,
      detail: detail.message,
      stack: detail.stack,
    });

    // El aviso al buzón NUNCA puede tumbar la petición original: ni por lanzar
    // aquí, ni por rechazar después (de eso se encarga el propio canal).
    try {
      const decision = shouldAlert(route);
      if (decision.send)
        alert(c, {
          ref,
          event: 'unhandled_error',
          route,
          occurredAt,
          suppressed: decision.suppressed,
        });
    } catch (alertErr) {
      logger({
        level: 'warn',
        event: 'system_alert_failed',
        tenant,
        requestId: ref,
        detail: errorDetail(alertErr).message,
      });
    }

    // Esto es TODO lo que ve el cliente: nunca el mensaje interno, nunca el
    // stack. La referencia es lo único que comparte con el log del servidor.
    return c.json({ error: 'internal_error', ref }, 500);
  };
}

/**
 * Ruta desconocida: mismo `{ error }` que el resto de la API en vez del HTML
 * por defecto de Hono, que rompe a cualquier cliente que espere JSON.
 *
 * No se registra: un escáner de rutas llenaría el log de ruido y taparía justo
 * lo que este bloque quiere que se vea.
 */
export const notFoundHandler: NotFoundHandler<Env> = (c) =>
  c.json({ error: 'not_found', path: c.req.path }, 404);

function safeRoutePath(c: Context<Env>): string {
  try {
    return c.req.routePath || c.req.path;
  } catch {
    return c.req.path;
  }
}

function safeTenantSlug(c: Context<Env>): string {
  // si lo que ha fallado es el propio middleware de tenant, aún no hay slug
  try {
    return (c.get('tenant') as { slug?: string } | undefined)?.slug ?? 'unknown';
  } catch {
    return 'unknown';
  }
}
