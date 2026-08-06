/**
 * Leads de producto (ADR 0016, Frente B): el formulario "Pedir demo" de la landing.
 * NO es una `enquiry` (huésped→camping): es un comprador→Logic2B. Sin tabla en v1;
 * se envía por email reusando el driver Resend. Sin API key → noop (no rompe la landing).
 */
import { noopSender, resendSender } from '@logic-camp/notifications';
import { Hono } from 'hono';
import { z } from 'zod';
import { logEvent } from '../errors';
import type { Env } from '../tenant';

const leadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  campingName: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(60).optional(),
  message: z.string().trim().max(2000).optional(),
  lang: z.string().trim().max(5).optional(),
  plan: z.string().trim().max(100).optional(),
});

/** Buzón comercial de Logic2B. Remitente de plataforma (dominio verificado en Resend). */
const LEADS_TO = 'marinerandreu@gmail.com';
const LEADS_FROM = 'Logic2B Campings <leads@logic2b.com>';

export const leadsRoutes = new Hono<Env>().post('/leads', async (c) => {
  const parsed = leadSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'invalid', issues: parsed.error.issues }, 400);
  const d = parsed.data;

  const rows: [string, string][] = [
    ['Camping', d.campingName],
    ['Nombre', d.name],
    ['Email', d.email],
    ['Teléfono', d.phone || '—'],
    ['Plan', d.plan || '—'],
    ['Idioma', d.lang || '—'],
  ];
  const requestTitle = d.plan ? `Nueva solicitud del plan ${d.plan}` : 'Nueva petición de demo';
  const text = `${requestTitle} — Logic2B Campings\n\n${rows
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')}\n\nMensaje:\n${d.message || '—'}`;
  const html = `<h2>${escapeHtml(requestTitle)} — Logic2B Campings</h2><table>${rows
    .map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${escapeHtml(v)}</td></tr>`)
    .join('')}</table><p><strong>Mensaje:</strong><br>${escapeHtml(d.message || '—')}</p>`;

  const apiKey = c.env.RESEND_API_KEY;
  const sender = apiKey ? resendSender(apiKey) : noopSender;
  const result = await sender({
    from: LEADS_FROM,
    to: LEADS_TO,
    replyTo: d.email,
    message: { subject: `${d.plan ? `Plan ${d.plan}` : 'Demo'}: ${d.campingName}`, html, text },
  });
  // El visitante siempre recibe ok si el input es válido; el fallo de envío se registra en servidor.
  if (!result.ok)
    logEvent({
      level: 'error',
      event: 'lead_send_failed',
      tenant: c.get('tenant').slug,
      detail: result.error,
    });
  return c.json({ ok: true });
});

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch] ?? ch,
  );
}
