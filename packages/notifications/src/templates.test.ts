/** Tests de render (ADR 0010): idiomas, dinero en céntimos, escape y fallbacks. */
import { describe, expect, it } from 'vitest';
import { normalizeLang } from './i18n';
import { render } from './templates';
import type { BookingPayload, EnquiryPayload } from './types';

const enquiry: EnquiryPayload = {
  campName: 'Camping Cala Sereno',
  contactName: 'Marc <b>Dubois</b>',
  contactEmail: 'marc@example.com',
  contactPhone: '+34 600 000 000',
  dateFrom: '2026-08-01',
  dateTo: '2026-08-08',
  persons: 4,
  message: 'Hola,\n¿tenéis sitio con sombra?',
};

const booking: BookingPayload = {
  campName: 'Camping Cala Sereno',
  code: 'CS-2026-0042',
  holderName: 'Marc Dubois',
  dateFrom: '2026-08-01',
  dateTo: '2026-08-08',
  nights: 7,
  persons: 4,
  unitTypeName: 'Parcela Estándar',
  lines: [
    { label: 'Estancia', amountCents: 26600 },
    { label: 'Electricidad', amountCents: 3850 },
  ],
  totalCents: 30450,
  touristTaxCents: 2800,
  currency: 'EUR',
  manageUrl: 'https://camp.logic2b.com/reserva?code=CS-2026-0042&email=marc%40example.com',
};

describe('render de plantillas', () => {
  it('booking_confirmed en los 6 idiomas: asunto propio y total formateado', () => {
    for (const lang of ['es', 'ca', 'en', 'fr', 'de', 'nl'] as const) {
      const msg = render({ kind: 'booking_confirmed', data: booking }, lang);
      expect(msg.subject).toContain('CS-2026-0042');
      expect(msg.html).toContain('304,50');
      expect(msg.text).toContain('304,50');
      // el href escapa & como &amp; (HTML correcto); la versión texto lleva la URL cruda
      expect(msg.html).toContain(booking.manageUrl!.replace(/&/g, '&amp;'));
      expect(msg.text).toContain(booking.manageUrl!);
    }
    // los asuntos difieren entre idiomas (no hay hardcode)
    const es = render({ kind: 'booking_confirmed', data: booking }, 'es').subject;
    const de = render({ kind: 'booking_confirmed', data: booking }, 'de').subject;
    expect(es).not.toBe(de);
  });

  it('el HTML escapa el contenido del usuario', () => {
    const msg = render({ kind: 'enquiry_received', data: enquiry }, 'es');
    expect(msg.html).not.toContain('<b>Dubois</b>');
    expect(msg.html).toContain('&lt;b&gt;');
    // la versión texto conserva el original
    expect(msg.text).toContain('Marc <b>Dubois</b>');
  });

  it('la cancelación lleva el reembolso y no lleva desglose ni botón', () => {
    const msg = render(
      { kind: 'booking_cancelled', data: { ...booking, refundCents: 21315 } },
      'es',
    );
    expect(msg.html).toContain('213,15');
    expect(msg.html).not.toContain('Desglose');
    expect(msg.html).not.toContain(booking.manageUrl!);
  });

  it('autoreply al cliente en su idioma; idioma raro cae a es', () => {
    const nl = render({ kind: 'enquiry_autoreply', data: enquiry }, 'nl');
    expect(nl.subject).toContain('We hebben je aanvraag ontvangen');
    const ru = render({ kind: 'enquiry_autoreply', data: enquiry }, 'ru');
    expect(ru.subject).toContain('Hemos recibido tu solicitud');
  });

  it('normalizeLang: variantes regionales y desconocidos', () => {
    expect(normalizeLang('en-GB')).toBe('en');
    expect(normalizeLang('CA')).toBe('ca');
    expect(normalizeLang('pt')).toBe('es');
  });
});
