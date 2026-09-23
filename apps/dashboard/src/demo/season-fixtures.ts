import type {
  BookingListItem,
  BookingPayment,
  Catalog,
  EnquiryItem,
  GuestDetail,
  GuestListItem,
  NotificationLogItem,
  ParteData,
  PaymentLogItem,
  RatesData,
} from '../api';
import type { ScenarioResult } from './scenario.types';

const NOW = '2026-08-07T12:00:00.000Z';
const shift = (date: string, days: number) =>
  new Date(Date.parse(`${date.slice(0, 10)}T12:00:00Z`) + days * 86400000)
    .toISOString()
    .slice(0, 10);
type FixtureBooking = BookingListItem & { guestEmail: string; payments?: BookingPayment[] };

/** Histórico determinista: misma unidad, sin solapes ni ocupación inventada. */
export function summerBookings<T extends FixtureBooking>(
  source: T[],
  units: Catalog['units'] = [],
  reservedCodes: string[] = [],
): T[] {
  const canonical = source.map((booking) => ({
    ...booking,
    dateTo: booking.dateTo > '2026-09-01' ? '2026-09-01' : booking.dateTo,
  }));
  const result = structuredClone(canonical);
  for (const offset of [-61, -31]) {
    canonical.forEach((booking, index) => {
      if (booking.dateFrom < '2026-08-01') return;
      const from = shift(booking.dateFrom, offset);
      const to = shift(booking.dateTo, offset);
      if (
        from < '2026-06-01' ||
        to > '2026-08-01' ||
        result.some(
          (item) => item.unitId === booking.unitId && item.dateFrom < to && item.dateTo > from,
        )
      )
        return;
      const id = `${booking.id}_summer_${-offset}`;
      const cancelled = index % 11 === 0;
      const noShow = !cancelled && index % 13 === 0;
      const paidCents = cancelled || noShow ? 0 : booking.totalCents;
      const createdAt = `${shift(from, -14)}T10:00:00.000Z`;
      result.push({
        ...booking,
        id,
        code: `${booking.code}-S${-offset}`,
        dateFrom: from,
        dateTo: to,
        status: cancelled ? 'cancelled' : noShow ? 'no_show' : 'completed',
        paidCents,
        checkedInAt: cancelled || noShow ? null : `${from}T12:00:00.000Z`,
        checkedOutAt: cancelled || noShow ? null : `${to}T10:00:00.000Z`,
        createdAt,
        ...(booking.payments
          ? {
              payments: paidCents
                ? [
                    {
                      id: `pay_${id}`,
                      provider: 'manual',
                      amountCents: paidCents,
                      status: 'succeeded',
                      createdAt,
                    },
                  ]
                : [],
            }
          : {}),
      } as T);
    });
  }
  // Completa huecos con estancias de temporada alta; conserva reservas firma y bloqueos.
  units
    .filter((unit) => unit.status === 'active' && !reservedCodes.includes(unit.code))
    .forEach((unit, index) => {
      const template = canonical.find((booking) => booking.unitTypeId === unit.unitTypeId);
      if (!template) return;
      const occupied = result.filter((booking) => booking.unitId === unit.id);
      let cursor = shift('2026-06-01', index % 4);
      let sequence = 0;
      while (cursor < '2026-08-30') {
        const end = shift(cursor, 9 + (index % 5));
        const to = end > '2026-09-01' ? '2026-09-01' : end;
        const conflict = occupied.find(
          (booking) => booking.dateFrom < to && booking.dateTo > cursor,
        );
        if (conflict) {
          cursor = conflict.dateTo;
          continue;
        }
        const id = `summer_${unit.id}_${sequence++}`;
        const past = to <= '2026-08-07';
        const inHouse = cursor < '2026-08-07' && !past;
        const totalCents =
          Math.round((Date.parse(to) - Date.parse(cursor)) / 86400000) *
          (unit.unitTypeId.includes('parcela') ? 4800 : 9200);
        const paidCents =
          past || inHouse || index % 3 === 0 ? totalCents : Math.round(totalCents * 0.35);
        const createdAt = `${shift(cursor, -14) > '2026-08-07' ? '2026-08-07' : shift(cursor, -14)}T10:00:00.000Z`;
        const booking = {
          ...template,
          id,
          code: `VER-${unit.code}-${sequence}`,
          unitId: unit.id,
          unitCode: unit.code,
          dateFrom: cursor,
          dateTo: to,
          status: past ? 'completed' : 'confirmed',
          totalCents,
          paidCents,
          guestEmail: `${id}@example.test`,
          createdAt,
          depositCents: 15000,
          depositPaidCents: inHouse ? 15000 : 0,
          accessCredential: inHouse ? `DEMO-${unit.code}` : null,
          notes: 'Estancia ficticia de temporada alta.',
          checkedInAt: past || inHouse ? `${cursor}T12:00:00.000Z` : null,
          checkedOutAt: past ? `${to}T10:00:00.000Z` : null,
          ...(template.payments
            ? {
                payments: [
                  {
                    id: `pay_${id}`,
                    provider: 'manual',
                    status: 'succeeded',
                    amountCents: paidCents,
                    createdAt,
                  },
                ],
              }
            : {}),
        } as T;
        result.push(booking);
        occupied.push(booking);
        cursor = shift(to, 2 + (index % 3));
      }
    });
  return result;
}

export function summerEnquiries(catalog: Catalog, slug: string): EnquiryItem[] {
  const states = ['new', 'contacted', 'quoted', 'converted', 'lost'] as const;
  return Array.from({ length: 45 }, (_, index) => ({
    id: `enq_${slug}_summer_${index}`,
    status: states[index % states.length]!,
    dateFrom: `2026-08-${String(8 + (index % 17)).padStart(2, '0')}`,
    dateTo: `2026-08-${String(12 + (index % 17)).padStart(2, '0')}`,
    occupancy: { adults: 2, childrenAges: index % 2 ? [7] : [], pets: 0, vehicles: 1 },
    unitTypeId: catalog.unitTypes[index % catalog.unitTypes.length]!.id,
    message: [
      'Consulta de disponibilidad y acceso tardío.',
      'Solicitamos presupuesto familiar.',
      'Preferimos una parcela con sombra.',
    ][index % 3]!,
    contact: {
      name: `Familia Demo ${index + 1}`,
      email: `solicitud${index + 1}@example.test`,
      phone: undefined,
    },
    locale: ['es', 'en', 'fr'][index % 3]!,
    source: 'web-demo',
    convertedBookingId: null,
    createdAt: `2026-08-${String(1 + (index % 6)).padStart(2, '0')}T10:00:00.000Z`,
  }));
}

/** Superficies de lectura comunes a TODOS los gestores: jamás recurren a fetch. */
export function fixtureRead(
  url: URL,
  catalog: Catalog,
  bookings: FixtureBooking[],
): ScenarioResult | null {
  const ok = (body: unknown): ScenarioResult => ({ status: 200, body });
  const path = url.pathname;
  const query = url.searchParams.get('q')?.toLowerCase() ?? '';
  const guests: GuestListItem[] = bookings.map((booking) => ({
    id: `guest_${booking.id}`,
    name: booking.leadName?.split(' ')[0] ?? 'Familia',
    surname: booking.leadName?.split(' ').slice(1).join(' ') || 'Demo',
    email: booking.guestEmail,
    phone: null,
    docType: null,
    docNumber: null,
    nationality: 'ESP',
    bookingsCount: 1,
    lastStay: booking.dateFrom,
  }));
  if (path === '/api/admin/guests')
    return ok({
      items: guests.filter((guest) =>
        `${guest.name} ${guest.surname} ${guest.email}`.toLowerCase().includes(query),
      ),
    });
  const guestMatch = path.match(/^\/api\/admin\/guests\/([^/]+)$/);
  if (guestMatch) {
    const index = guests.findIndex((guest) => guest.id === guestMatch[1]);
    if (index < 0) return { status: 404, body: { error: 'not_found' } };
    const booking = bookings[index]!;
    const detail: GuestDetail = {
      ...guests[index]!,
      address: 'Dirección ficticia de demostración',
      gdprConsentAt: booking.createdAt,
      gdprConsentVersion: 'demo',
      anonymizedAt: null,
      bookings: [{ ...booking, isLead: true }],
    };
    return ok(detail);
  }
  if (path === '/api/admin/rates') {
    const seasons = ['06', '07', '08'].map((month, index) => ({
      id: `summer_${month}`,
      name: ['Junio · verano', 'Julio · alta', 'Agosto · alta'][index]!,
      dateFrom: `2026-${month}-01`,
      dateTo: index === 2 ? '2026-09-01' : `2026-${String(index + 7).padStart(2, '0')}-01`,
      priority: index,
    }));
    const data: RatesData = {
      seasons,
      ratePlans: seasons.flatMap((season, index) =>
        catalog.unitTypes.map((type) => ({
          id: `rate_${season.id}_${type.id}`,
          unitTypeId: type.id,
          seasonId: season.id,
          baseCents: (type.kind === 'pitch' ? 3500 : 11000) + index * 1000,
          extraPersonCents: 900,
          childCents: 500,
          petCents: 400,
          electricityCents: 500,
          vehicleCents: 600,
          minStay: 2 + index,
          maxStay: null,
          arrivalDays: null,
          departureDays: null,
        })),
      ),
    };
    return ok(data);
  }
  if (path === '/api/admin/notifications') {
    const statuses = ['sent', 'queued', 'failed', 'disabled'] as const;
    const items: NotificationLogItem[] = bookings.slice(0, 48).map((booking, index) => ({
      id: `notification_${booking.id}`,
      bookingId: booking.id,
      bookingCode: booking.code,
      enquiryId: null,
      enquiryContact: null,
      channel: index % 3 ? 'email' : 'whatsapp',
      template: index % 2 ? 'booking_confirmation' : 'arrival_reminder',
      status: statuses[index % 4]!,
      attempts: index % 4 === 2 ? 3 : 1,
      sentAt: index % 4 === 0 ? NOW : null,
      createdAt: booking.createdAt,
    }));
    return ok({
      items: items.filter(
        (item) => !url.searchParams.get('status') || item.status === url.searchParams.get('status'),
      ),
    });
  }
  if (path === '/api/admin/payments') {
    const items: PaymentLogItem[] = bookings.flatMap((booking) =>
      (
        booking.payments ??
        (booking.paidCents
          ? [
              {
                id: `pay_${booking.id}`,
                provider: 'manual' as const,
                amountCents: booking.paidCents,
                status: 'succeeded' as const,
                createdAt: booking.createdAt,
              },
            ]
          : [])
      ).map((payment) => ({
        ...payment,
        bookingId: booking.id,
        bookingCode: booking.code,
        providerRef: null,
      })),
    );
    // Cancelaciones históricas ya reembolsadas; saldo neto de la reserva: cero.
    bookings
      .filter((booking) => booking.status === 'cancelled' && booking.paidCents === 0)
      .slice(0, 8)
      .forEach((booking) => {
        for (const status of ['succeeded', 'refunded'] as const)
          items.push({
            id: `refund_demo_${booking.id}_${status}`,
            bookingId: booking.id,
            bookingCode: booking.code,
            provider: 'manual',
            providerRef: null,
            amountCents: booking.totalCents,
            status,
            createdAt: booking.createdAt,
          });
      });
    // Intentos fallidos y pendientes no alteran el saldo de ninguna reserva.
    bookings.slice(0, 12).forEach((booking, index) =>
      items.push({
        id: `attempt_${booking.id}`,
        bookingId: booking.id,
        bookingCode: booking.code,
        provider: index % 2 ? 'stripe' : 'redsys',
        providerRef: `SIMULADO-${index}`,
        amountCents: Math.max(0, booking.totalCents - booking.paidCents),
        status: index % 2 ? 'pending' : 'failed',
        createdAt: NOW,
      }),
    );
    return ok({
      items: items
        .filter(
          (item) =>
            (!url.searchParams.get('provider') ||
              item.provider === url.searchParams.get('provider')) &&
            (!url.searchParams.get('status') || item.status === url.searchParams.get('status')),
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    });
  }
  if (path === '/api/admin/hospedajes/parte') {
    const date = url.searchParams.get('date') ?? '2026-08-07';
    const arrivals = bookings.filter(
      (booking) => booking.dateFrom === date && booking.status === 'confirmed',
    );
    const data: ParteData = {
      status: arrivals.length ? 'issues' : 'empty',
      date,
      transport: 'manual',
      count: arrivals.length,
      estancias: arrivals.map((booking) => ({
        bookingId: booking.id,
        bookingCode: booking.code,
        dateFrom: booking.dateFrom,
        dateTo: booking.dateTo,
        paymentKind: 'card',
        guests: [
          {
            guestId: `guest_${booking.id}`,
            name: booking.leadName ?? 'Demo',
            surname: 'Demo',
            isLead: true,
          },
        ],
      })),
      issues: arrivals.map((booking) => ({
        bookingId: booking.id,
        bookingCode: booking.code,
        guestId: `guest_${booking.id}`,
        guestName: booking.leadName,
        field: 'docNumber',
        code: 'required',
      })),
      xml: null,
    };
    return ok(data);
  }
  if (path === '/api/admin/search')
    return ok({
      bookings: bookings
        .filter((item) => `${item.code} ${item.leadName}`.toLowerCase().includes(query))
        .slice(0, 12),
      guests: guests
        .filter((item) => `${item.name} ${item.surname}`.toLowerCase().includes(query))
        .slice(0, 12),
      units: catalog.units.filter((item) => item.code.toLowerCase().includes(query)).slice(0, 12),
    });
  return null;
}
