import { describe, expect, it } from 'vitest';
import { escapeXml, serializeParte } from './serialize';
import type { PartePayload } from './types';

const payload: PartePayload = {
  establecimiento: {
    codigo: 'CE-0001',
    nombre: 'Camping Cala Sereno',
    direccion: 'Ctra. del Faro s/n',
    municipio: 'Alcossebre',
    provincia: 'Castellón',
    cp: '12579',
  },
  estancias: [
    {
      bookingId: 'bkg_1',
      bookingCode: 'CS-0001',
      dateFrom: '2026-08-01',
      dateTo: '2026-08-05',
      checkedInAt: '2026-08-01T14:00:00.000Z',
      paymentKind: 'card',
      huespedes: [
        {
          guestId: 'gst_1',
          name: 'Ada',
          surname: 'Lovelace',
          secondSurname: 'Byron',
          sex: 'F',
          docType: 'dni',
          docNumber: '12345678Z',
          docSupportNumber: 'BAA123456',
          birthdate: '1990-12-10',
          nationality: 'ES',
          kinship: null,
          address: 'Calle Uno 1',
          phone: '600111222',
          email: 'ada@example.com',
          isLead: true,
        },
      ],
    },
  ],
};

describe('escapeXml', () => {
  it('escapa los cinco caracteres XML', () => {
    expect(escapeXml(`a & b < c > d " e ' f`)).toBe(
      'a &amp; b &lt; c &gt; d &quot; e &apos; f',
    );
  });
});

describe('serializeParte', () => {
  it('produce XML bien formado con la cabecera y el código de establecimiento', () => {
    const xml = serializeParte(payload);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<establecimiento codigo="CE-0001">');
    expect(xml).toContain('<referencia>CS-0001</referencia>');
    expect(xml).toContain('<numeroSoporte>BAA123456</numeroSoporte>');
    expect(xml).toContain('<pago tipo="TARJT"/>');
  });

  it('es determinista: misma entrada, misma salida', () => {
    expect(serializeParte(payload)).toBe(serializeParte(payload));
  });

  it('omite los elementos de los campos nulos, sin dejar etiquetas vacías', () => {
    const sinPago: PartePayload = {
      ...payload,
      estancias: [
        {
          ...payload.estancias[0]!,
          paymentKind: null,
          huespedes: [{ ...payload.estancias[0]!.huespedes[0]!, secondSurname: null, phone: null }],
        },
      ],
    };
    const xml = serializeParte(sinPago);
    expect(xml).not.toContain('<apellido2>');
    expect(xml).not.toContain('<telefono>');
    expect(xml).toContain('<pago/>'); // sin tipo cuando no hay forma de pago
  });

  it('escapa el contenido de los datos (no rompe el XML)', () => {
    const conAmp: PartePayload = {
      ...payload,
      establecimiento: { ...payload.establecimiento, nombre: 'Sol & Mar' },
    };
    const xml = serializeParte(conAmp);
    expect(xml).toContain('<nombre>Sol &amp; Mar</nombre>');
  });
});
