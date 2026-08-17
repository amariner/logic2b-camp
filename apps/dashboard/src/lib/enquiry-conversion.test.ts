import { describe, expect, it } from 'vitest';
import type { EnquiryItem } from '../api';
import { bookingInitialFromEnquiry } from './enquiry-conversion';

const enquiry: EnquiryItem = {
  id: 'enq_quoted',
  status: 'quoted',
  dateFrom: '2026-09-10',
  dateTo: '2026-09-14',
  occupancy: { adults: 2, childrenAges: [6, 9], pets: 1, vehicles: 1 },
  unitTypeId: 'ut_bungalow',
  message: 'Aceptamos el presupuesto.',
  contact: {
    name: 'Nora Vidal',
    email: 'nora@example.com',
    phone: '+34 600 000 001',
  },
  locale: 'ca',
  source: 'web',
  convertedBookingId: null,
  createdAt: '2026-08-17T08:00:00.000Z',
};

describe('precarga de una reserva desde solicitud', () => {
  it('conserva estancia, ocupación, titular, idioma y vínculo sin copiar el mensaje a notas', () => {
    expect(bookingInitialFromEnquiry(enquiry)).toEqual({
      enquiryId: 'enq_quoted',
      unitTypeId: 'ut_bungalow',
      dateFrom: '2026-09-10',
      dateTo: '2026-09-14',
      occupancy: { adults: 2, childrenAges: [6, 9], pets: 1, vehicles: 1 },
      holder: {
        name: 'Nora Vidal',
        email: 'nora@example.com',
        phone: '+34 600 000 001',
      },
      locale: 'ca',
    });
  });

  it('deja editables los datos de estancia que la solicitud no incluía', () => {
    expect(
      bookingInitialFromEnquiry({
        ...enquiry,
        dateFrom: null,
        dateTo: null,
        occupancy: null,
        unitTypeId: null,
      }),
    ).toEqual({
      enquiryId: 'enq_quoted',
      holder: enquiry.contact,
      locale: 'ca',
    });
  });
});
