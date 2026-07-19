/**
 * Drivers de envío (ADR 0010). Resend es un POST HTTP — no hace falta SDK.
 * Sin API key, el que llama usa noopSender y el log queda en 'disabled'.
 */
import type { EmailSender, SendResult } from './types';

export function resendSender(apiKey: string): EmailSender {
  return async ({ from, to, replyTo, message }) => {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          from,
          to: [to],
          ...(replyTo ? { reply_to: replyTo } : {}),
          subject: message.subject,
          html: message.html,
          text: message.text,
        }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        return { ok: false, error: `resend_${res.status}: ${body.slice(0, 200)}` };
      }
      const data = (await res.json().catch(() => ({}))) as { id?: string };
      return { ok: true, id: data.id };
    } catch (e) {
      return { ok: false, error: `resend_network: ${String(e).slice(0, 200)}` } as SendResult;
    }
  };
}

/** Sin proveedor configurado: no envía nada (el orquestador registra 'disabled'). */
export const noopSender: EmailSender = () => Promise.resolve({ ok: false, error: 'no_provider' });
