/**
 * Plantillas de email (ADR 0010): funciones puras (payload, lang) → mensaje.
 * HTML sobrio con la marca del producto (hueso/tinta/pino), tipografía de
 * sistema (los emails no cargan webfonts) y SIEMPRE con versión texto.
 */
import { normalizeLang, tr } from './i18n';
import type { EmailMessage, EmailPriceLine, NotificationPayload } from './types';

const eur = (cents: number, currency = 'EUR') =>
  new Intl.NumberFormat('es', { style: 'currency', currency }).format(cents / 100);

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Layout común: una tarjeta sobre hueso, acento pino, sin imágenes remotas. */
function layout(campName: string, lang: string, title: string, body: string): string {
  return `<!doctype html><html lang="${lang}"><body style="margin:0;padding:24px;background:#f4f2ec;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#181818">
<div style="max-width:560px;margin:0 auto;background:#fdfcf9;border:1px solid #e4ddcc;border-radius:4px">
<div style="padding:20px 24px;border-bottom:2px solid #1f4d3a">
<span style="font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">${esc(campName)}</span>
</div>
<div style="padding:24px">
<h1 style="margin:0 0 8px;font-size:19px;line-height:1.3">${esc(title)}</h1>
${body}
</div>
<div style="padding:14px 24px;border-top:1px solid #e4ddcc;font-size:12px;color:#6c675c">
${esc(tr(lang, 'common.footer', { camp: campName }))}
</div>
</div></body></html>`;
}

const p = (text: string) =>
  `<p style="margin:0 0 14px;font-size:14px;line-height:1.55">${text}</p>`;
const row = (label: string, value: string) =>
  `<tr><td style="padding:3px 12px 3px 0;font-size:13px;color:#6c675c;white-space:nowrap">${esc(label)}</td><td style="padding:3px 0;font-size:13px">${value}</td></tr>`;
const table = (rows: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 14px">${rows}</table>`;

function breakdownHtml(
  lines: EmailPriceLine[],
  totalCents: number,
  currency: string,
  lang: string,
) {
  const filas = lines
    .map(
      (l) =>
        `<tr><td style="padding:2px 12px 2px 0;font-size:13px">${esc(l.label)}</td><td align="right" style="padding:2px 0;font-size:13px;font-variant-numeric:tabular-nums">${eur(l.amountCents, currency)}</td></tr>`,
    )
    .join('');
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 14px">${filas}
<tr><td style="padding:6px 12px 2px 0;font-size:14px;font-weight:700;border-top:1px solid #e4ddcc">${esc(tr(lang, 'bkg.total'))}</td><td align="right" style="padding:6px 0 2px;font-size:14px;font-weight:700;border-top:1px solid #e4ddcc;font-variant-numeric:tabular-nums">${eur(totalCents, currency)}</td></tr></table>`;
}

export function render(payload: NotificationPayload, locale: string): EmailMessage {
  const lang = normalizeLang(locale);

  if (payload.kind === 'enquiry_received' || payload.kind === 'enquiry_autoreply') {
    const d = payload.data;
    const auto = payload.kind === 'enquiry_autoreply';
    const pre = auto ? 'auto' : 'enq';
    const subject = auto
      ? tr(lang, 'auto.subject', { camp: d.campName })
      : tr(lang, 'enq.subject', { name: d.contactName });
    const datos = [
      row(
        tr(lang, 'enq.contact'),
        `${esc(d.contactName)} · ${esc(d.contactEmail)}${d.contactPhone ? ` · ${esc(d.contactPhone)}` : ''}`,
      ),
      d.dateFrom && d.dateTo ? row(tr(lang, 'enq.dates'), `${d.dateFrom} → ${d.dateTo}`) : '',
      d.persons ? row(tr(lang, 'enq.persons'), String(d.persons)) : '',
    ].join('');
    const body =
      p(esc(tr(lang, `${pre}.intro`))) +
      table(datos) +
      `<p style="margin:0 0 4px;font-size:13px;color:#6c675c">${esc(tr(lang, 'enq.message'))}</p>` +
      p(esc(d.message).replace(/\n/g, '<br>'));
    const text = [
      tr(lang, `${pre}.title`),
      '',
      `${tr(lang, 'enq.contact')}: ${d.contactName} · ${d.contactEmail}${d.contactPhone ? ` · ${d.contactPhone}` : ''}`,
      d.dateFrom && d.dateTo ? `${tr(lang, 'enq.dates')}: ${d.dateFrom} → ${d.dateTo}` : '',
      d.persons ? `${tr(lang, 'enq.persons')}: ${d.persons}` : '',
      '',
      d.message,
    ]
      .filter(Boolean)
      .join('\n');
    return { subject, html: layout(d.campName, lang, tr(lang, `${pre}.title`), body), text };
  }

  // booking_confirmed | booking_cancelled | booking_pending_stuck | booking_reminder
  const d = payload.data;
  const cancel = payload.kind === 'booking_cancelled';
  const stuck = payload.kind === 'booking_pending_stuck';
  const reminder = payload.kind === 'booking_reminder';
  const noBreakdown = cancel || stuck || reminder;
  const pre = cancel ? 'cnl' : stuck ? 'stk' : reminder ? 'rem' : 'bkg';
  const subject = tr(lang, `${pre}.subject`, { code: d.code, camp: d.campName });

  const datos = [
    row(tr(lang, 'bkg.code'), `<strong>${esc(d.code)}</strong>`),
    stuck ? row(tr(lang, 'stk.holder'), esc(d.holderName)) : '',
    row(
      tr(lang, 'bkg.stay'),
      `${d.dateFrom} → ${d.dateTo} · ${tr(lang, 'bkg.nights', { n: d.nights })}`,
    ),
    row(tr(lang, 'bkg.type'), esc(d.unitTypeName)),
    row(tr(lang, 'bkg.persons'), String(d.persons)),
    cancel && d.refundCents !== undefined
      ? row(tr(lang, 'cnl.refund'), `<strong>${eur(d.refundCents, d.currency)}</strong>`)
      : '',
  ].join('');

  let body = p(esc(tr(lang, `${pre}.intro`))) + table(datos);
  if (!noBreakdown) {
    body += `<p style="margin:0 0 4px;font-size:13px;color:#6c675c">${esc(tr(lang, 'bkg.breakdown'))}</p>`;
    body += breakdownHtml(d.lines, d.totalCents, d.currency, lang);
    if (d.touristTaxCents > 0)
      body += p(
        `${esc(tr(lang, 'bkg.tax'))}: <strong>${eur(d.touristTaxCents, d.currency)}</strong>`,
      );
    if (d.manageUrl)
      body += `<p style="margin:18px 0 4px"><a href="${esc(d.manageUrl)}" style="display:inline-block;background:#1f4d3a;color:#fdfcf9;text-decoration:none;font-size:14px;font-weight:600;padding:9px 16px;border-radius:2px">${esc(tr(lang, 'bkg.manage'))}</a></p>`;
  }

  const text = [
    tr(lang, `${pre}.title`),
    '',
    `${tr(lang, 'bkg.code')}: ${d.code}`,
    ...(stuck ? [`${tr(lang, 'stk.holder')}: ${d.holderName}`] : []),
    `${tr(lang, 'bkg.stay')}: ${d.dateFrom} → ${d.dateTo} · ${tr(lang, 'bkg.nights', { n: d.nights })}`,
    `${tr(lang, 'bkg.type')}: ${d.unitTypeName}`,
    ...(cancel && d.refundCents !== undefined
      ? [`${tr(lang, 'cnl.refund')}: ${eur(d.refundCents, d.currency)}`]
      : noBreakdown
        ? []
        : [
            '',
            ...d.lines.map((l) => `${l.label}: ${eur(l.amountCents, d.currency)}`),
            `${tr(lang, 'bkg.total')}: ${eur(d.totalCents, d.currency)}`,
            ...(d.manageUrl ? ['', `${tr(lang, 'bkg.manage')}: ${d.manageUrl}`] : []),
          ]),
  ].join('\n');

  return { subject, html: layout(d.campName, lang, tr(lang, `${pre}.title`), body), text };
}
