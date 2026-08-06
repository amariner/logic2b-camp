/**
 * Escenario comercial Pinada del Mar.
 *
 * No suplanta una API real: el segundo build del gestor lo activa de forma
 * explícita y conserva únicamente ficción reversible en localStorage. El build
 * normal no entra aquí y sigue hablando con `/api` por cookie.
 */
import type { PlanoDescriptor } from '@logic-camp/config';
import type {
  BookingDetail,
  BookingListItem,
  Catalog,
  EnquiryItem,
  EnquiryStatus,
  PlanningData,
  PlanningUnit,
  ReportsData,
  TenantSettings,
} from '../api';

export const isPinadaScenario = import.meta.env.VITE_DEMO_SCENARIO === 'pinadamar';

export const PINADA_STATE_KEY = 'logic2b-demo:pinadamar:state:v1';
export const PINADA_WEB_ENQUIRY_KEY = 'logic2b-demo:pinadamar:submitted-enquiry:v1';

const DAY_MS = 86_400_000;
const anchorYear = 2026;
const iso = (day: number) => `${anchorYear}-08-${String(day).padStart(2, '0')}`;
const addDays = (date: string, days: number) =>
  new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);

const range = (prefix: string, count: number) =>
  Array.from({ length: count }, (_, index) => `${prefix}-${String(index + 1).padStart(2, '0')}`);

const typeSpecs = [
  { id: 'ut_parcela_pino', kind: 'pitch' as const, name: 'Parcela Pinar', count: 60, prefix: 'P' },
  { id: 'ut_parcela_mar', kind: 'pitch' as const, name: 'Parcela Brisa', count: 24, prefix: 'M' },
  { id: 'ut_bungalow', kind: 'lodging' as const, name: 'Bungalow Familiar', count: 16, prefix: 'B' },
  { id: 'ut_mobil', kind: 'lodging' as const, name: 'Mobil-home Salina', count: 10, prefix: 'MH' },
] as const;

const unitTypes: Catalog['unitTypes'] = typeSpecs.map((spec) => ({
  id: spec.id,
  kind: spec.kind,
  nameI18n: { es: spec.name },
  capacityMin: 1,
  capacityMax: spec.kind === 'pitch' ? 6 : spec.id === 'ut_bungalow' ? 6 : 5,
  includedPersons: spec.kind === 'pitch' ? 2 : 4,
}));

const units: PlanningUnit[] = typeSpecs.flatMap((spec) =>
  range(spec.prefix, spec.count).map((code, index) => ({
    id: `unit_${code.toLowerCase().replace('-', '_')}`,
    unitTypeId: spec.id,
    code,
    status: spec.prefix === 'B' && index === 11 ? 'inactive' : 'active',
  })),
);

const catalog: Catalog = {
  unitTypes,
  units,
  extras: [
    { id: 'ext_cuna', nameI18n: { es: 'Cuna' }, priceCents: 0, per: 'stay', required: false },
    { id: 'ext_mascota', nameI18n: { es: 'Mascota' }, priceCents: 500, per: 'night', required: false },
  ],
};

const firstNames = [
  'Marta', 'Pau', 'Sophie', 'Jonas', 'Lucía', 'Marc', 'Claire', 'Nora', 'Elena', 'Bruno',
  'Emma', 'Daniel', 'Laura', 'Hugo', 'Mila', 'Thomas', 'Aina', 'Lars', 'Carmen', 'Leo',
];
const surnames = [
  'Ferrer', 'Vidal', 'Martin', 'Schmidt', 'Costa', 'Dubois', 'Navarro', 'Weber', 'Serra', 'Bernard',
];
const locales = ['es', 'ca', 'fr', 'de'] as const;
const statuses: EnquiryStatus[] = ['new', 'new', 'contacted', 'quoted', 'converted', 'lost'];

export const baseEnquiries: EnquiryItem[] = Array.from({ length: 42 }, (_, index) => {
  const locale = locales[index % locales.length]!;
  const type = typeSpecs[index % typeSpecs.length]!;
  const from = iso(8 + (index % 17));
  return {
    id: `enq_pinada_${String(index + 1).padStart(3, '0')}`,
    status: statuses[index % statuses.length]!,
    dateFrom: from,
    dateTo: addDays(from, 4 + (index % 5)),
    occupancy: {
      adults: 2 + (index % 2),
      childrenAges: index % 3 === 0 ? [6, 10] : index % 3 === 1 ? [8] : [],
      pets: index % 7 === 0 ? 1 : 0,
      vehicles: 1,
    },
    unitTypeId: type.id,
    message: `Consulta ficticia ${index + 1}: preferimos sombra y una zona tranquila. No se enviará ningún mensaje.`,
    contact: {
      name: `${firstNames[index % firstNames.length]} ${surnames[index % surnames.length]}`,
      email: `familia${index + 1}@example.test`,
      phone: `+34 600 10 ${String(index + 1).padStart(2, '0')} 00`,
    },
    locale,
    source: 'web-demo',
    convertedBookingId: null,
    createdAt: `${iso(1 + (index % 6))}T${String(8 + (index % 12)).padStart(2, '0')}:15:00.000Z`,
  };
});

type DemoBooking = BookingListItem & { locale: string; guestEmail: string };

function baseBookings(): DemoBooking[] {
  return Array.from({ length: 84 }, (_, index) => {
    const unit = units[(index * 13) % units.length]!;
    const start = 1 + ((index * 5) % 27);
    const dateFrom = iso(start);
    const duration = 3 + (index % 6);
    const status: BookingListItem['status'] = index % 13 === 0 ? 'pending' : 'confirmed';
    const inHouse = start <= 6 && start + duration > 6 && status === 'confirmed';
    const totalCents = 36000 + (index % 9) * 4300;
    return {
      id: `book_pinada_${String(index + 1).padStart(3, '0')}`,
      code: `PM-26-${String(index + 1).padStart(4, '0')}`,
      status,
      channel: index % 4 === 0 ? 'phone' : 'web',
      dateFrom,
      dateTo: addDays(dateFrom, duration),
      unitTypeId: unit.unitTypeId,
      unitId: unit.id,
      unitCode: unit.code,
      leadName: `${firstNames[(index + 4) % firstNames.length]} ${surnames[(index + 3) % surnames.length]}`,
      occupancy: {
        adults: 2,
        childrenAges: index % 3 === 0 ? [5, 9] : index % 3 === 1 ? [7] : [],
        pets: index % 11 === 0 ? 1 : 0,
        vehicles: 1,
      },
      totalCents,
      paidCents: index % 5 === 0 ? 0 : Math.round(totalCents * 0.35),
      notes: index % 8 === 0 ? 'Llegada prevista después de las 18:00.' : null,
      checkedInAt: inHouse ? `${iso(6)}T10:20:00.000Z` : null,
      checkedOutAt: null,
      createdAt: `2026-07-${String(1 + (index % 28)).padStart(2, '0')}T10:00:00.000Z`,
      locale: locales[index % locales.length]!,
      guestEmail: `reserva${index + 1}@example.test`,
    };
  });
}

type ScenarioState = { enquiries: EnquiryItem[]; bookings: DemoBooking[] };

function readWebEnquiry(): EnquiryItem | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PINADA_WEB_ENQUIRY_KEY);
    return raw ? (JSON.parse(raw) as EnquiryItem) : null;
  } catch {
    return null;
  }
}

function initialState(): ScenarioState {
  const enquiry = readWebEnquiry();
  return {
    enquiries: enquiry ? [enquiry, ...baseEnquiries] : [...baseEnquiries],
    bookings: baseBookings(),
  };
}

function loadState(): ScenarioState {
  if (typeof localStorage === 'undefined') return initialState();
  try {
    const raw = localStorage.getItem(PINADA_STATE_KEY);
    if (raw) return JSON.parse(raw) as ScenarioState;
  } catch {
    /* Un almacenamiento corrupto degrada al fixture canónico. */
  }
  const state = initialState();
  saveState(state);
  return state;
}

function saveState(state: ScenarioState): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(PINADA_STATE_KEY, JSON.stringify(state));
}

export function resetPinadaScenario(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(PINADA_STATE_KEY);
  localStorage.removeItem(PINADA_WEB_ENQUIRY_KEY);
}

export const pinadaPlano: PlanoDescriptor = {
  version: 1,
  decor: [
    { kind: 'enclosure', x: 20, y: 20, w: 900, h: 650 },
    { kind: 'water', x: 850, y: 0, w: 90, h: 700, label: 'Mar Mediterráneo · este' },
    { kind: 'green', x: 40, y: 40, w: 760, h: 54, label: 'Pinada litoral' },
    { kind: 'road', x: 60, y: 168, w: 740, h: 18 },
    { kind: 'road', x: 60, y: 358, w: 740, h: 18 },
    { kind: 'road', x: 430, y: 94, w: 18, h: 510 },
    { kind: 'road', x: 280, y: 604, w: 168, h: 22 },
    { kind: 'service', x: 60, y: 530, w: 150, h: 64, label: 'Recepción y acceso', icon: 'reception' },
    { kind: 'service', x: 488, y: 230, w: 126, h: 84, label: 'Piscina familiar', icon: 'pool' },
    { kind: 'service', x: 638, y: 230, w: 78, h: 58, label: 'Aseos', icon: 'wc' },
    { kind: 'service', x: 488, y: 410, w: 102, h: 56, label: 'Súper', icon: 'shop' },
    { kind: 'service', x: 610, y: 410, w: 106, h: 56, label: 'Juegos', icon: 'playground' },
    { kind: 'label', x: 742, y: 112, text: 'Brisa marina', size: 's' },
  ],
  blocks: [
    { id: 'calle_pinos_1', label: 'Calle de los Pinos I', cell: 'pitch', x: 60, y: 112, cols: 12, units: range('P', 30) },
    { id: 'calle_pinos_2', label: 'Calle de los Pinos II', cell: 'pitch', x: 60, y: 206, cols: 12, units: range('P', 60).slice(30) },
    { id: 'calle_brisa', label: 'Calle Brisa', cell: 'pitch', x: 60, y: 396, cols: 12, units: range('M', 24) },
    { id: 'anillo_bungalows', label: 'Anillo de bungalows', cell: 'lodging', x: 488, y: 112, cols: 8, units: range('B', 16) },
    { id: 'mobil_salina', label: 'Mobil-home Salina', cell: 'lodging', x: 488, y: 490, cols: 5, units: range('MH', 10) },
  ],
};

function overlaps(booking: DemoBooking, from: string, to: string): boolean {
  return booking.dateFrom < to && booking.dateTo > from && booking.status !== 'cancelled';
}

function bookingDetail(booking: DemoBooking): BookingDetail {
  return {
    ...booking,
    priceBreakdown: {
      lines: [{ concept: 'stay', detail: { nights: 6 }, amountCents: booking.totalCents - 420 }],
      totalCents: booking.totalCents,
      touristTaxCents: 420,
      currency: 'EUR',
    },
    touristTaxCents: 420,
    depositCents: Math.round(booking.totalCents * 0.35),
    paymentKind: booking.paidCents > 0 ? 'card' : null,
    locale: booking.locale,
    guests: [
      {
        id: `guest_${booking.id}`,
        name: booking.leadName?.split(' ')[0] ?? 'Familia',
        surname: booking.leadName?.split(' ').slice(1).join(' ') ?? 'Demo',
        secondSurname: null,
        sex: null,
        email: booking.guestEmail,
        phone: '+34 600 000 000',
        docType: null,
        docNumber: null,
        docSupportNumber: null,
        kinship: null,
        birthdate: null,
        nationality: 'ESP',
        isLead: true,
      },
    ],
    payments: booking.paidCents
      ? [{ id: `pay_${booking.id}`, provider: 'manual', amountCents: booking.paidCents, status: 'succeeded', createdAt: booking.createdAt }]
      : [],
  };
}

function reports(state: ScenarioState, from: string, to: string): ReportsData {
  const active = state.bookings.filter((booking) => overlaps(booking, from, to));
  const total = active.reduce((sum, booking) => sum + booking.totalCents, 0);
  const paid = active.reduce((sum, booking) => sum + booking.paidCents, 0);
  return {
    from,
    to,
    nights: Math.max(1, Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS)),
    occupancy: typeSpecs.map((type) => ({
      unitTypeId: type.id,
      units: type.count,
      occupiedNights: active.filter((booking) => booking.unitTypeId === type.id).length,
      capacityNights: type.count,
      occupancyPct: Math.round((active.filter((booking) => booking.unitTypeId === type.id).length / type.count) * 100),
    })),
    revenue: { totalCents: total, paidCents: paid, bookings: active.length },
    arrivals: state.bookings.filter((booking) => booking.dateFrom >= from && booking.dateFrom < to).length,
    departures: state.bookings.filter((booking) => booking.dateTo > from && booking.dateTo <= to).length,
  };
}

function convertEnquiry(state: ScenarioState, enquiry: EnquiryItem): DemoBooking {
  const requestedType = unitTypes.some((type) => type.id === enquiry.unitTypeId)
    ? enquiry.unitTypeId!
    : 'ut_bungalow';
  const preferredCode: Record<string, string> = {
    ut_parcela_pino: 'P-08',
    ut_parcela_mar: 'M-08',
    ut_bungalow: 'B-08',
    ut_mobil: 'MH-08',
  };
  const unit = units.find((candidate) => candidate.code === preferredCode[requestedType])!;
  const index = state.bookings.length + 1;
  const booking: DemoBooking = {
    id: `book_pinada_web_${enquiry.id}`,
    code: `PM-26-${String(index).padStart(4, '0')}`,
    status: 'confirmed',
    channel: 'web',
    dateFrom: enquiry.dateFrom ?? iso(18),
    dateTo: enquiry.dateTo ?? iso(24),
    unitTypeId: requestedType,
    unitId: unit.id,
    unitCode: unit.code,
    leadName: enquiry.contact.name,
    occupancy: enquiry.occupancy ?? { adults: 2, childrenAges: [6, 9], pets: 0, vehicles: 1 },
    totalCents: 86400,
    paidCents: 0,
    notes: `Convertida desde ${enquiry.id}. Datos exclusivamente ficticios.`,
    checkedInAt: null,
    checkedOutAt: null,
    createdAt: '2026-08-06T12:00:00.000Z',
    locale: enquiry.locale,
    guestEmail: enquiry.contact.email,
  };
  state.bookings.unshift(booking);
  enquiry.convertedBookingId = booking.id;
  return booking;
}

type ScenarioResult = { status: number; body: unknown };
const ok = (body: unknown, status = 200): ScenarioResult => ({ status, body });
const fail = (status: number, error: string): ScenarioResult => ({ status, body: { error } });

function bodyOf(init?: RequestInit): Record<string, unknown> {
  if (typeof init?.body !== 'string') return {};
  try {
    return JSON.parse(init.body) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function demoScenarioRequest(path: string, init?: RequestInit): Promise<ScenarioResult> {
  const method = init?.method ?? 'GET';
  const url = new URL(path, 'https://demo.invalid');
  const state = loadState();
  const forcedState =
    typeof window === 'undefined'
      ? null
      : new URLSearchParams(window.location.search).get('demoState');

  if (method === 'GET' && forcedState === 'loading') {
    await new Promise((resolve) => window.setTimeout(resolve, 1_500));
  }
  if (method === 'GET' && forcedState === 'error' && url.pathname.startsWith('/api/admin/')) {
    return fail(503, 'scenario_forced_error');
  }

  if (method === 'GET' && url.pathname === '/api/admin/enquiries')
    return ok({ items: forcedState === 'empty' ? [] : state.enquiries });
  if (method === 'GET' && url.pathname === '/api/admin/catalog') return ok(catalog);
  if (method === 'GET' && url.pathname === '/api/admin/map') return ok({ plano: pinadaPlano });
  if (method === 'GET' && url.pathname === '/api/admin/settings') {
    const settings: TenantSettings = {
      id: 'ten_pinadamar', slug: 'pinadamar', name: 'Camping Pinada del Mar', tier: 2,
      timezone: 'Europe/Madrid', currency: 'EUR', locales: ['es', 'ca', 'fr', 'de'], modules: { demo: true },
    };
    return ok(settings);
  }
  if (method === 'GET' && url.pathname === '/api/admin/reports') {
    return ok(reports(state, url.searchParams.get('from') ?? iso(6), url.searchParams.get('to') ?? iso(7)));
  }
  if (method === 'GET' && url.pathname === '/api/admin/planning') {
    const from = url.searchParams.get('from') ?? iso(1);
    const to = url.searchParams.get('to') ?? iso(31);
    const data: PlanningData = {
      from,
      to,
      unitTypes,
      units,
      seasons: [{ id: 'sea_alta', name: 'Agosto · temporada alta', dateFrom: iso(1), dateTo: '2026-09-01', priority: 1 }],
      bookings: state.bookings.filter((booking) => overlaps(booking, from, to)).map((booking) => ({
        id: booking.id,
        code: booking.code,
        status: booking.status === 'cancelled' ? 'completed' : booking.status,
        unitTypeId: booking.unitTypeId,
        unitId: booking.unitId,
        dateFrom: booking.dateFrom,
        dateTo: booking.dateTo,
        occupancy: { adults: booking.occupancy.adults, childrenAges: booking.occupancy.childrenAges },
        checkedInAt: booking.checkedInAt,
        checkedOutAt: booking.checkedOutAt,
      })),
      blocks: [{ id: 'block_b12', unitId: units.find((unit) => unit.code === 'B-12')!.id, unitTypeId: null, dateFrom: iso(1), dateTo: iso(31), reason: 'maintenance' }],
    };
    return ok(data);
  }
  if (method === 'GET' && url.pathname === '/api/admin/bookings') {
    let items = [...state.bookings];
    const arrival = url.searchParams.get('arrivalsOn');
    const departure = url.searchParams.get('departuresOn');
    const query = url.searchParams.get('q')?.toLowerCase();
    const status = url.searchParams.get('status');
    if (arrival) items = items.filter((booking) => booking.dateFrom === arrival);
    if (departure) items = items.filter((booking) => booking.dateTo === departure);
    if (query) items = items.filter((booking) => `${booking.code} ${booking.leadName}`.toLowerCase().includes(query));
    if (status) items = items.filter((booking) => booking.status === status);
    return ok({ items });
  }
  const bookingMatch = url.pathname.match(/^\/api\/admin\/bookings\/([^/]+)$/);
  if (method === 'GET' && bookingMatch) {
    const booking = state.bookings.find((candidate) => candidate.id === bookingMatch[1]);
    return booking ? ok(bookingDetail(booking)) : fail(404, 'not_found');
  }
  const enquiryMatch = url.pathname.match(/^\/api\/admin\/enquiries\/([^/]+)$/);
  if (method === 'PATCH' && enquiryMatch) {
    const enquiry = state.enquiries.find((candidate) => candidate.id === enquiryMatch[1]);
    if (!enquiry) return fail(404, 'not_found');
    const status = bodyOf(init).status as EnquiryStatus | undefined;
    if (!status) return fail(400, 'invalid_body');
    enquiry.status = status;
    const booking = status === 'converted' && !enquiry.convertedBookingId ? convertEnquiry(state, enquiry) : null;
    saveState(state);
    return ok({ id: enquiry.id, status, convertedBookingId: enquiry.convertedBookingId, booking });
  }
  if (method === 'PATCH' && bookingMatch) {
    const booking = state.bookings.find((candidate) => candidate.id === bookingMatch[1]);
    if (!booking) return fail(404, 'not_found');
    const body = bodyOf(init);
    if (body.action === 'reassign' && typeof body.unitId === 'string') {
      const unit = units.find((candidate) => candidate.id === body.unitId);
      if (!unit || unit.status !== 'active') return fail(409, 'unit_occupied');
      const occupied = state.bookings.some(
        (candidate) =>
          candidate.id !== booking.id &&
          candidate.unitId === unit.id &&
          overlaps(candidate, booking.dateFrom, booking.dateTo),
      );
      if (occupied) return fail(409, 'unit_occupied');
      booking.unitId = unit.id;
      booking.unitCode = unit.code;
    }
    if (body.action === 'move' && typeof body.dateFrom === 'string' && typeof body.dateTo === 'string') {
      booking.dateFrom = body.dateFrom;
      booking.dateTo = body.dateTo;
    }
    if (body.action === 'note' && typeof body.notes === 'string') booking.notes = body.notes;
    if (body.action === 'confirm') booking.status = 'confirmed';
    if (body.action === 'cancel') booking.status = 'cancelled';
    if (body.action === 'check_in') booking.checkedInAt = '2026-08-06T12:00:00.000Z';
    if (body.action === 'undo_checkin') booking.checkedInAt = null;
    saveState(state);
    return ok({ id: booking.id, status: booking.status, notes: booking.notes, paidCents: booking.paidCents });
  }
  const requoteMatch = url.pathname.match(/^\/api\/admin\/bookings\/([^/]+)\/requote$/);
  if (method === 'POST' && requoteMatch) {
    const booking = state.bookings.find((candidate) => candidate.id === requoteMatch[1]);
    if (!booking) return fail(404, 'not_found');
    const body = bodyOf(init);
    const dateFrom = typeof body.dateFrom === 'string' ? body.dateFrom : booking.dateFrom;
    const dateTo = typeof body.dateTo === 'string' ? body.dateTo : booking.dateTo;
    const nights = Math.max(1, Math.round((Date.parse(`${dateTo}T00:00:00Z`) - Date.parse(`${dateFrom}T00:00:00Z`)) / DAY_MS));
    const totalCents = nights * 14400;
    return ok({ nights, totalCents, previousTotalCents: booking.totalCents, breakdown: { lines: [{ concept: 'stay', detail: { nights }, amountCents: totalCents }], totalCents, touristTaxCents: nights * 70, currency: 'EUR' }, unitId: body.unitId ?? booking.unitId });
  }
  if (method === 'GET' && url.pathname === '/api/admin/search') return ok({ bookings: [], guests: [], units: [] });
  return fail(404, 'scenario_route_not_implemented');
}

export const pinadaFixtureCounts = {
  units: units.length,
  enquiries: baseEnquiries.length,
  bookings: baseBookings().length,
  locales: new Set(baseEnquiries.map((enquiry) => enquiry.locale)).size,
  inactiveUnits: units.filter((unit) => unit.status !== 'active').length,
};
