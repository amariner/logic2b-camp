import type { EnquiryItem } from '../api';
import type { NewBookingInitial } from '../components/NewBookingPanel';

/**
 * La solicitud aporta contexto, no una reserva cerrada. Solo precargamos los
 * datos estructurados que realmente contiene; recepción puede completar o
 * corregir todo antes de pedir precio y crearla.
 */
export function bookingInitialFromEnquiry(enquiry: EnquiryItem): NewBookingInitial {
  return {
    enquiryId: enquiry.id,
    ...(enquiry.unitTypeId ? { unitTypeId: enquiry.unitTypeId } : {}),
    ...(enquiry.dateFrom ? { dateFrom: enquiry.dateFrom } : {}),
    ...(enquiry.dateTo ? { dateTo: enquiry.dateTo } : {}),
    ...(enquiry.occupancy ? { occupancy: enquiry.occupancy } : {}),
    holder: enquiry.contact,
    locale: enquiry.locale,
  };
}
