/**
 * Envío del parte: interfaz + adaptadores (ADR 0028 §2). Mismo patrón que los
 * `PaymentProvider` de pagos — el adaptador REAL se implementa pero queda **sin
 * verificar contra el entorno real hasta tener credenciales** de SES.Hospedajes,
 * exactamente como Stripe/Redsys/Resend.
 */

export interface SesCredentials {
  /** URL del webservice de comunicación (entorno de pruebas o producción). */
  endpoint: string;
  usuario: string;
  password: string;
}

export type SendResult =
  | { ok: true; reference: string | null }
  | { ok: false; error: string };

export interface HospedajesTransport {
  readonly mode: 'manual' | 'ses';
  /** `creds` es null en el modo manual. */
  send(xml: string, creds: SesCredentials | null): Promise<SendResult>;
}

/**
 * Modo con el que un camping opera desde el DÍA UNO, sin esperar al alta del
 * webservice: el parte se DESCARGA (GET /hospedajes/parte) y se sube a mano en la
 * sede electrónica. Este adaptador no envía nada por red — su `send` lo dice
 * explícitamente para que la orquestación responda "descárgalo" en vez de fingir.
 */
export function manualTransport(): HospedajesTransport {
  return {
    mode: 'manual',
    async send() {
      return { ok: false, error: 'manual_transport' };
    },
  };
}

/**
 * Adaptador del webservice real. Implementado, NO verificado (sin credenciales).
 * `fetchImpl` inyectable para poder testear la construcción de la petición sin red.
 */
export function sesTransport(fetchImpl: typeof fetch = fetch): HospedajesTransport {
  return {
    mode: 'ses',
    async send(xml, creds) {
      if (!creds) return { ok: false, error: 'missing_credentials' };
      const auth = base64(`${creds.usuario}:${creds.password}`);
      let res: Response;
      try {
        res = await fetchImpl(creds.endpoint, {
          method: 'POST',
          headers: {
            'content-type': 'application/xml; charset=utf-8',
            authorization: `Basic ${auth}`,
          },
          body: xml,
        });
      } catch {
        // La sede caída o inalcanzable NO es un envío fallido definitivo: el
        // llamador puede reintentar. Nunca lanza (como parseWebhook en pagos).
        return { ok: false, error: 'ses_unreachable' };
      }
      if (!res.ok) return { ok: false, error: `ses_http_${res.status}` };
      const body = await res.text().catch(() => '');
      return { ok: true, reference: extractReference(body) };
    },
  };
}

/** Intenta leer un identificador de comunicación de la respuesta; null si no hay. */
function extractReference(body: string): string | null {
  const m = body.match(/<(?:referencia|codigoComunicacion|loteId)>([^<]+)</i);
  return m ? m[1]!.trim() : null;
}

/** Base64 con `btoa` global (Workers y Node ≥16), igual criterio que pagos. */
function base64(input: string): string {
  return btoa(input);
}
