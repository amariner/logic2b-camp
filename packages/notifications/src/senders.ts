/**
 * Drivers de envío (ADR 0010/0043). Resend es un POST HTTP — no hace falta SDK.
 * Sin API key, el que llama usa noopSender y el log queda en 'disabled'.
 */
import type { EmailSender, SendResult } from './types';
import { z } from 'zod';

const resendSuccessSchema = z.object({ id: z.string().trim().min(1) }).passthrough();
const idempotencyKeySchema = z.string().min(1).max(256);

const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_MAX_ATTEMPTS = 2;
const DEFAULT_RETRY_DELAY_MS = 200;

export type ResendSenderOptions = {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  maxAttempts?: number;
  retryDelayMs?: number;
  sleep?: (ms: number) => Promise<void>;
};

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function isTransientStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === 'AbortError'
    : typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError';
}

export function resendSender(apiKey: string, options: ResendSenderOptions = {}): EmailSender {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = Math.max(1, Math.trunc(options.timeoutMs ?? DEFAULT_TIMEOUT_MS));
  const maxAttempts = Math.min(
    DEFAULT_MAX_ATTEMPTS,
    Math.max(1, Math.trunc(options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS)),
  );
  const retryDelayMs = Math.max(0, Math.trunc(options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS));
  const sleep = options.sleep ?? defaultSleep;

  return async ({ from, to, replyTo, idempotencyKey, message }) => {
    if (!idempotencyKeySchema.safeParse(idempotencyKey).success) {
      return {
        ok: false,
        error: 'resend_invalid_idempotency_key',
        attempts: 0,
        retryable: false,
      };
    }

    let lastFailure: Extract<SendResult, { ok: false }> = {
      ok: false,
      error: 'resend_network',
      attempts: 0,
      retryable: true,
    };

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      let result: SendResult;

      try {
        const res = await fetchImpl('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${apiKey}`,
            'content-type': 'application/json',
            'idempotency-key': idempotencyKey,
          },
          body: JSON.stringify({
            from,
            to: [to],
            ...(replyTo ? { reply_to: replyTo } : {}),
            subject: message.subject,
            html: message.html,
            text: message.text,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          result = {
            ok: false,
            error: `resend_http_${res.status}`,
            attempts: attempt,
            retryable: isTransientStatus(res.status),
          };
        } else {
          const parsed = resendSuccessSchema.safeParse(await res.json().catch(() => null));
          result = parsed.success
            ? { ok: true, id: parsed.data.id, attempts: attempt }
            : {
                ok: false,
                error: 'resend_invalid_response',
                attempts: attempt,
                retryable: false,
              };
        }
      } catch (error) {
        const timedOut = controller.signal.aborted || isAbortError(error);
        result = {
          ok: false,
          error: timedOut ? 'resend_timeout' : 'resend_network',
          attempts: attempt,
          retryable: true,
        };
      } finally {
        clearTimeout(timer);
      }

      if (result.ok) return result;
      lastFailure = result;
      if (!result.retryable || attempt === maxAttempts) return result;
      await sleep(retryDelayMs);
    }

    return lastFailure;
  };
}

/** Sin proveedor configurado: no envía nada (el orquestador registra 'disabled'). */
export const noopSender: EmailSender = () =>
  Promise.resolve({ ok: false, error: 'no_provider', attempts: 0, retryable: false });
