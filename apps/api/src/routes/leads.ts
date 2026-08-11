/**
 * Leads de producto (ADR 0016, Frente B): el formulario "Pedir demo" de la landing.
 * NO es una `enquiry` (huésped→camping): es un comprador→Logic2B. Sin tabla en v1;
 * se envía por email reusando el driver Resend. El resultado público distingue
 * entrega, simulación y ausencia/fallo de proveedor (ADR 0042).
 */
import { resendSender } from '@logic-camp/notifications';
import { Hono } from 'hono';
import { z } from 'zod';
import { logEvent } from '../errors';
import { uid } from '../ids';
import type { Env } from '../tenant';

const leadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  campingName: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(60).optional(),
  message: z.string().trim().max(2000).optional(),
  lang: z.string().trim().max(5).optional(),
  plan: z.string().trim().max(100).optional(),
  accept: z.literal(true),
  website: z.string().trim().max(200).optional(),
});

/** Buzón comercial de Logic2B. Remitente de plataforma (dominio verificado en Resend). */
const LEADS_TO = 'marinerandreu@gmail.com';
const LEADS_FROM = 'Logic2B Campings <leads@logic2b.com>';

export const leadsRoutes = new Hono<Env>().post('/leads', async (c) => {
  const raw = await c.req.json().catch(() => null);
  const botCheck = z.object({ website: z.string().optional() }).passthrough().safeParse(raw);
  // Honeypot: se responde de forma neutra y no se consume cuota de Resend.
  if (botCheck.success && botCheck.data.website?.trim()) {
    return c.json({ ok: true as const, outcome: 'received' as const }, 202);
  }
  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) return c.json({ error: 'invalid', issues: parsed.error.issues }, 400);
  const d = parsed.data;

  const rows: [string, string][] = [
    ['Camping', d.campingName],
    ['Nombre', d.name],
    ['Email', d.email],
    ['Teléfono', d.phone || '—'],
    ['Plan', d.plan || '—'],
    ['Idioma', d.lang || '—'],
    ['Consentimiento', 'Aceptó la política de privacidad'],
  ];
  const requestTitle = d.plan ? `Nueva solicitud del plan ${d.plan}` : 'Nueva petición de demo';
  const text = `${requestTitle} — Logic2B Campings\n\n${rows
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')}\n\nMensaje:\n${d.message || '—'}`;
  const html = `<h2>${escapeHtml(requestTitle)} — Logic2B Campings</h2><table>${rows
    .map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${escapeHtml(v)}</td></tr>`)
    .join('')}</table><p><strong>Mensaje:</strong><br>${escapeHtml(d.message || '—')}</p>`;

  const configured = c.env.LEADS_TRANSPORT;
  if (configured !== undefined && configured !== 'demo' && configured !== 'resend') {
    throw new Error(`LEADS_TRANSPORT inválido: ${configured}`);
  }
  const transport = configured ?? (c.env.LEADS_RESEND_API_KEY ? 'resend' : 'disabled');
  if (transport === 'disabled' || (transport === 'resend' && !c.env.LEADS_RESEND_API_KEY)) {
    return c.json(
      { ok: false as const, outcome: 'disabled' as const, error: 'lead_delivery_disabled' },
      503,
    );
  }
  if (transport === 'demo') {
    logEvent({
      level: 'info',
      event: 'lead_demo_simulated',
      tenant: c.get('tenant').slug,
    });
    return c.json({ ok: true as const, outcome: 'demo' as const }, 202);
  }

  const ref = uid('err');
  const result = await resendSender(c.env.LEADS_RESEND_API_KEY!)({
    from: LEADS_FROM,
    to: LEADS_TO,
    replyTo: d.email,
    idempotencyKey: `lead/${ref}`,
    message: { subject: `${d.plan ? `Plan ${d.plan}` : 'Demo'}: ${d.campingName}`, html, text },
  });
  if (!result.ok) {
    logEvent({
      level: 'error',
      event: 'lead_send_failed',
      tenant: c.get('tenant').slug,
      requestId: ref,
      attempts: result.attempts,
      detail: result.error,
    });
    return c.json(
      {
        ok: false as const,
        outcome: 'failed' as const,
        error: 'lead_delivery_failed',
        ref,
      },
      502,
    );
  }
  return c.json({ ok: true as const, outcome: 'delivered' as const }, 202);
});

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch] ?? ch,
  );
}
