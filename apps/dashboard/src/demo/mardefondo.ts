/** Escenario operativo local de la demo Visión «Mar de Fondo». */
import type { PlanoDescriptor } from '@logic-camp/config';
import type {
  BookingDetail,
  BookingListItem,
  BookingPayment,
  Catalog,
  PaymentLogItem,
  PlanningData,
  PlanningUnit,
  ReportsData,
  TenantSettings,
} from '../api';
import { automatizaIncidentDraft, resetAutomatizaScenario } from './automatiza';
import { resetInteligenteScenario } from './inteligente';

export const isMardefondoScenario = import.meta.env.VITE_DEMO_SCENARIO === 'mardefondo';
export const MARDEFONDO_STATE_KEY = 'logic2b-demo:mardefondo:manager-state:v1';
export const MARDEFONDO_PUBLIC_BOOKINGS_KEY = 'logic2b-demo:mardefondo:public-bookings:v1';

const DAY_MS = 86_400_000;
const iso = (day: number) => `2026-08-${String(day).padStart(2, '0')}`;
const addDays = (date: string, days: number) =>
  new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
const range = (prefix: string, count: number) =>
  Array.from({ length: count }, (_, index) => `${prefix}-${String(index + 1).padStart(3, '0')}`);

const typeSpecs = [
  {
    id: 'ut_parcela_atlantica',
    kind: 'pitch' as const,
    name: 'Parcela Atlántica',
    count: 150,
    prefix: 'A',
  },
  {
    id: 'ut_bungalow_laguna',
    kind: 'lodging' as const,
    name: 'Bungalow Laguna',
    count: 60,
    prefix: 'BL',
  },
  {
    id: 'ut_mobil_horizonte',
    kind: 'lodging' as const,
    name: 'Mobil-home Horizonte',
    count: 60,
    prefix: 'MH',
  },
  {
    id: 'ut_glamping_duna',
    kind: 'lodging' as const,
    name: 'Glamping Duna',
    count: 30,
    prefix: 'GD',
  },
] as const;

const unitTypes: Catalog['unitTypes'] = typeSpecs.map((spec) => ({
  id: spec.id,
  kind: spec.kind,
  nameI18n: { es: spec.name },
  capacityMin: 1,
  capacityMax: spec.kind === 'pitch' ? 6 : spec.id === 'ut_bungalow_laguna' ? 6 : 5,
  includedPersons: spec.kind === 'pitch' ? 2 : 4,
}));

const units: PlanningUnit[] = typeSpecs.flatMap((spec) =>
  range(spec.prefix, spec.count).map((code, index) => ({
    id: `unit_mf_${code.toLowerCase().replace('-', '_')}`,
    unitTypeId: spec.id,
    code,
    status: spec.prefix === 'BL' && index === 41 ? 'inactive' : 'active',
  })),
);

const catalog: Catalog = {
  unitTypes,
  units,
  extras: [
    {
      id: 'ext_desayuno',
      nameI18n: { es: 'Desayuno mediterráneo' },
      priceCents: 1400,
      per: 'person',
      required: false,
    },
    {
      id: 'ext_mascota',
      nameI18n: { es: 'Mascota' },
      priceCents: 700,
      per: 'night',
      required: false,
    },
    { id: 'ext_cuna', nameI18n: { es: 'Cuna' }, priceCents: 0, per: 'stay', required: false },
  ],
};

const firstNames = [
  'Alba',
  'Marc',
  'Sofía',
  'Leo',
  'Nora',
  'Hugo',
  'Marta',
  'Pau',
  'Emma',
  'Daniel',
];
const surnames = ['Costa', 'Vidal', 'Ferrer', 'Serra', 'Navarro', 'Martín', 'Roca', 'Soler'];
const signatureCodes = new Set(['A-150', 'BL-008', 'MH-060', 'GD-030']);
const fixtureUnits = units.filter(
  (unit) => unit.status === 'active' && !signatureCodes.has(unit.code),
);
type DemoBooking = BookingListItem & {
  locale: string;
  guestEmail: string;
  touristTaxCents: number;
  payments: BookingPayment[];
};

function makeBooking(index: number): DemoBooking {
  // Una unidad distinta por fixture: agosto queda denso pero nunca inventa
  // dos reservas solapadas. BL-008 se reserva para el hilo MF-DEMO-001.
  const unit = fixtureUnits[index % fixtureUnits.length]!;
  const start = 1 + ((index * 7) % 27);
  const dateFrom = iso(start);
  const duration = 3 + (index % 6);
  const totalCents = 48000 + (index % 12) * 6900;
  const paidCents = index % 6 === 0 ? 0 : Math.round(totalCents * 0.35);
  const status: BookingListItem['status'] = index % 17 === 0 ? 'pending' : 'confirmed';
  const checkedInAt =
    status === 'confirmed' && start <= 7 && start + duration > 7
      ? '2026-08-07T10:15:00.000Z'
      : null;
  return {
    id: `book_mf_${String(index + 1).padStart(3, '0')}`,
    code: `MF-26-${String(index + 1).padStart(4, '0')}`,
    status,
    channel: index % 5 === 0 ? 'phone' : 'web',
    dateFrom,
    dateTo: addDays(dateFrom, duration),
    unitTypeId: unit.unitTypeId,
    unitId: unit.id,
    unitCode: unit.code,
    leadName: `${firstNames[index % firstNames.length]} ${surnames[(index * 3) % surnames.length]}`,
    occupancy: {
      adults: 2 + (index % 2),
      childrenAges: index % 3 === 0 ? [6, 10] : [],
      pets: index % 13 === 0 ? 1 : 0,
      vehicles: 1,
    },
    totalCents,
    paidCents,
    touristTaxCents: duration * 210,
    notes: index % 19 === 0 ? 'Preferencia ficticia: llegada después de las 18:00.' : null,
    checkedInAt,
    checkedOutAt: null,
    createdAt: `2026-07-${String(1 + (index % 28)).padStart(2, '0')}T10:30:00.000Z`,
    locale: 'es',
    guestEmail: `familia${index + 1}@example.test`,
    payments: paidCents
      ? [
          {
            id: `pay_mf_${index + 1}_deposit`,
            provider: 'manual',
            amountCents: paidCents,
            status: 'succeeded',
            createdAt: `2026-07-${String(1 + (index % 28)).padStart(2, '0')}T10:31:00.000Z`,
          },
        ]
      : [],
  };
}

type PublicBooking = {
  code: string;
  email?: string;
  status: BookingListItem['status'];
  dateFrom: string;
  dateTo: string;
  unitTypeId: string;
  occupancy: DemoBooking['occupancy'];
  totalCents: number;
  paidCents: number;
  touristTaxCents: number;
};

function readPublicBookings(): PublicBooking[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    return JSON.parse(
      localStorage.getItem(MARDEFONDO_PUBLIC_BOOKINGS_KEY) ?? '[]',
    ) as PublicBooking[];
  } catch {
    return [];
  }
}

function signatureBooking(source?: PublicBooking): DemoBooking {
  const sourceType = unitTypes.some((type) => type.id === source?.unitTypeId)
    ? source!.unitTypeId
    : 'ut_bungalow_laguna';
  const preferredCode: Record<string, string> = {
    ut_parcela_atlantica: 'A-150',
    ut_bungalow_laguna: 'BL-008',
    ut_mobil_horizonte: 'MH-060',
    ut_glamping_duna: 'GD-030',
  };
  const unit = units.find((item) => item.code === preferredCode[sourceType])!;
  const paidCents = source?.paidCents ?? 45900;
  return {
    id: 'book_mf_demo_001',
    code: source?.code ?? 'MF-DEMO-001',
    status: source?.status ?? 'confirmed',
    channel: 'web',
    dateFrom: source?.dateFrom ?? iso(18),
    dateTo: source?.dateTo ?? iso(24),
    unitTypeId: sourceType,
    unitId: unit.id,
    unitCode: unit.code,
    leadName: 'Familia Demo',
    occupancy: source?.occupancy ?? { adults: 2, childrenAges: [6, 9], pets: 0, vehicles: 1 },
    totalCents: source?.totalCents ?? 131400,
    paidCents,
    touristTaxCents: source?.touristTaxCents ?? 1260,
    notes: 'Reserva creada en la web Mar de Fondo. Datos y cobro exclusivamente ficticios.',
    checkedInAt: null,
    checkedOutAt: null,
    createdAt: '2026-08-07T09:30:00.000Z',
    locale: 'es',
    guestEmail: source?.email ?? 'familia.demo@example.test',
    payments: paidCents
      ? [
          {
            id: 'pay_mf_demo_001',
            provider: 'manual',
            amountCents: paidCents,
            status: 'succeeded',
            createdAt: '2026-08-07T09:31:00.000Z',
          },
        ]
      : [],
  };
}

type ScenarioState = { bookings: DemoBooking[] };
function initialState(): ScenarioState {
  const publicBooking = readPublicBookings().find((item) => item.code === 'MF-DEMO-001');
  return {
    bookings: [
      signatureBooking(publicBooking),
      ...Array.from({ length: 239 }, (_, index) => makeBooking(index)),
    ],
  };
}
function saveState(state: ScenarioState): void {
  if (typeof localStorage !== 'undefined')
    localStorage.setItem(MARDEFONDO_STATE_KEY, JSON.stringify(state));
}
function loadState(): ScenarioState {
  if (typeof localStorage === 'undefined') return initialState();
  try {
    const stored = localStorage.getItem(MARDEFONDO_STATE_KEY);
    if (stored) return JSON.parse(stored) as ScenarioState;
  } catch {
    /* Un estado roto vuelve al fixture canónico. */
  }
  const state = initialState();
  saveState(state);
  return state;
}
export function resetMardefondoScenario(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(MARDEFONDO_STATE_KEY);
  localStorage.removeItem(MARDEFONDO_PUBLIC_BOOKINGS_KEY);
  resetAutomatizaScenario();
  resetInteligenteScenario();
}

export const mardefondoPlano: PlanoDescriptor = {
  version: 1,
  decor: [
    { kind: 'enclosure', x: 20, y: 20, w: 1420, h: 900 },
    { kind: 'water', x: 570, y: 300, w: 300, h: 200, label: 'Laguna central' },
    { kind: 'water', x: 20, y: 850, w: 1420, h: 70, label: 'Playa y Mediterráneo · sur' },
    { kind: 'green', x: 50, y: 50, w: 1360, h: 40, label: 'Corredor verde' },
    { kind: 'road', x: 50, y: 260, w: 1360, h: 18 },
    { kind: 'road', x: 50, y: 550, w: 1360, h: 18 },
    { kind: 'road', x: 700, y: 90, w: 18, h: 760 },
    {
      kind: 'service',
      x: 60,
      y: 750,
      w: 170,
      h: 70,
      label: 'Recepción y acceso',
      icon: 'reception',
    },
    {
      kind: 'service',
      x: 930,
      y: 330,
      w: 130,
      h: 70,
      label: 'Restaurante Laguna',
      icon: 'restaurant',
    },
    { kind: 'service', x: 930, y: 420, w: 130, h: 60, label: 'Club infantil', icon: 'playground' },
    { kind: 'service', x: 1090, y: 330, w: 100, h: 60, label: 'Mercado', icon: 'market' },
    { kind: 'label', x: 1180, y: 805, text: 'Acceso directo a playa', size: 'm' },
  ],
  blocks: [
    {
      id: 'parcelas_levante',
      label: 'Parcelas Levante',
      cell: 'pitch',
      x: 50,
      y: 115,
      cols: 25,
      units: range('A', 75),
    },
    {
      id: 'parcelas_poniente',
      label: 'Parcelas Poniente',
      cell: 'pitch',
      x: 50,
      y: 590,
      cols: 25,
      units: range('A', 150).slice(75),
    },
    {
      id: 'bungalows_laguna',
      label: 'Bungalows Laguna',
      cell: 'lodging',
      x: 50,
      y: 315,
      cols: 15,
      units: range('BL', 60),
    },
    {
      id: 'mobil_mar',
      label: 'Mobil-homes Mar',
      cell: 'lodging',
      x: 740,
      y: 115,
      cols: 15,
      units: range('MH', 60),
    },
    {
      id: 'glamping_duna',
      label: 'Glamping Duna',
      cell: 'glamping',
      x: 740,
      y: 590,
      cols: 15,
      units: range('GD', 30),
    },
  ],
};

const overlaps = (booking: DemoBooking, from: string, to: string) =>
  booking.dateFrom < to && booking.dateTo > from && booking.status !== 'cancelled';

/** Señales auditables que alimentan el fixture Inteligente, sin API ni modelo. */
export function mardefondoRecommendationAudit() {
  const from = '2026-08-18';
  const to = '2026-09-01';
  const state = initialState();
  const relevant = state.bookings.filter(
    (booking) => booking.unitTypeId === 'ut_bungalow_laguna' && overlaps(booking, from, to),
  );
  const sellableUnits = units.filter(
    (unit) => unit.unitTypeId === 'ut_bungalow_laguna' && unit.status === 'active',
  ).length;
  const periodNights = Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS,
  );
  const occupiedNights = relevant.reduce((sum, booking) => {
    const overlapFrom = Math.max(
      Date.parse(`${booking.dateFrom}T00:00:00Z`),
      Date.parse(`${from}T00:00:00Z`),
    );
    const overlapTo = Math.min(
      Date.parse(`${booking.dateTo}T00:00:00Z`),
      Date.parse(`${to}T00:00:00Z`),
    );
    return sum + Math.max(0, Math.round((overlapTo - overlapFrom) / DAY_MS));
  }, 0);
  const capacityNights = sellableUnits * periodNights;
  const directWebBookings = relevant.filter((booking) => booking.channel === 'web').length;
  return {
    sellableUnits,
    occupiedNights,
    capacityNights,
    occupancyPct: Math.round((occupiedNights / capacityNights) * 100),
    overlappingBookings: relevant.length,
    directWebBookings,
    directWebSharePct: Math.round((directWebBookings / relevant.length) * 100),
  };
}

export type MardefondoIncidentSeverity = 'high' | 'medium' | 'low';

export type MardefondoIncidentFixture = {
  id: string;
  kind: 'incident_summary';
  period: { from: string; to: string; timezone: 'Europe/Madrid' };
  groupBy: 'operational_area';
  recipient: string;
  evidence: ReturnType<typeof mardefondoIncidentAudit>;
  incidents: {
    id: string;
    area: 'reception' | 'payments' | 'maintenance';
    severity: MardefondoIncidentSeverity;
    title: string;
    detail: string;
    occurredAt: string;
    owner: string;
    metric: string;
    amountCents?: number;
    sourceIds: string[];
  }[];
  sources: { id: string; label: string; value: string; detail: string }[];
  limitations: string[];
  proposedSummary: string;
  delivery: 'internal_draft';
  execution: 'none';
};

/** Datos que justifican el parte ficticio, calculados desde el mismo escenario local. */
export function mardefondoIncidentAudit() {
  const from = '2026-08-07';
  const to = '2026-08-08';
  const arrivals = initialState().bookings.filter(
    (booking) =>
      booking.dateFrom >= from && booking.dateFrom < to && booking.status !== 'cancelled',
  );
  const unsecuredArrivals = arrivals.filter((booking) => booking.paidCents === 0);
  const inactiveUnit = units.find((unit) => unit.status === 'inactive');
  return {
    arrivals: arrivals.length,
    checkedInArrivals: arrivals.filter((booking) => booking.checkedInAt !== null).length,
    averageWaitMinutes: 27,
    unsecuredArrivals: unsecuredArrivals.length,
    unsecuredOutstandingCents: unsecuredArrivals.reduce(
      (sum, booking) => sum + booking.totalCents - booking.paidCents,
      0,
    ),
    unsecuredBookingCodes: unsecuredArrivals.map((booking) => booking.code),
    inactiveUnits: units.filter((unit) => unit.status === 'inactive').length,
    inactiveUnitCode: inactiveUnit?.code ?? null,
  };
}

const incidentEvidence = mardefondoIncidentAudit();

export const mardefondoIncidentFixture: MardefondoIncidentFixture = {
  id: 'auto_mf_incidents_001',
  kind: 'incident_summary',
  period: { from: '2026-08-07', to: '2026-08-08', timezone: 'Europe/Madrid' },
  groupBy: 'operational_area',
  recipient: 'Coordinación de operaciones · relevo del turno',
  evidence: incidentEvidence,
  incidents: [
    {
      id: 'incident_reception_peak',
      area: 'reception',
      severity: 'high',
      title: 'Espera elevada durante el pico de llegadas',
      detail:
        'El registro ficticio de recepción marca 27 minutos de espera media entre las 16:00 y las 17:00.',
      occurredAt: '2026-08-07T17:00:00+02:00',
      owner: 'Marta Roca · coordinación ficticia',
      metric: `${incidentEvidence.arrivals} llegadas · ${incidentEvidence.checkedInArrivals} registradas`,
      sourceIds: ['planning', 'frontdesk_log'],
    },
    {
      id: 'incident_unsecured_arrival',
      area: 'payments',
      severity: 'medium',
      title: 'Llegadas sin señal registradas',
      detail: `${incidentEvidence.unsecuredBookingCodes[0]} y otras ${incidentEvidence.unsecuredArrivals - 1} reservas ficticias. El equipo debe revisar los cobros en el relevo.`,
      occurredAt: '2026-08-07T18:10:00+02:00',
      owner: 'Equipo de recepción · muestra',
      metric: 'Pendiente simulado',
      amountCents: incidentEvidence.unsecuredOutstandingCents,
      sourceIds: ['planning', 'payment_log'],
    },
    {
      id: 'incident_maintenance_block',
      area: 'maintenance',
      severity: 'medium',
      title: 'Unidad bloqueada por mantenimiento',
      detail: `${incidentEvidence.inactiveUnitCode} continúa fuera de servicio. El bloqueo evita nuevas asignaciones y no solapa ninguna estancia.`,
      occurredAt: '2026-08-07T09:00:00+02:00',
      owner: 'Mantenimiento · equipo ficticio',
      metric: `${incidentEvidence.inactiveUnits} unidad fuera de servicio`,
      sourceIds: ['inventory'],
    },
  ],
  sources: [
    {
      id: 'planning',
      label: 'Planning local · 7 ago',
      value: `${incidentEvidence.arrivals} llegadas previstas`,
      detail: `${incidentEvidence.checkedInArrivals} check-ins registrados en el fixture`,
    },
    {
      id: 'frontdesk_log',
      label: 'Registro ficticio de recepción',
      value: `${incidentEvidence.averageWaitMinutes} min de espera media`,
      detail: 'Pico simulado de 16:00 a 17:00',
    },
    {
      id: 'payment_log',
      label: 'Cobros simulados',
      value: `${incidentEvidence.unsecuredArrivals} llegadas sin señal`,
      detail: `${incidentEvidence.unsecuredBookingCodes.join(' · ')} · ningún cargo real`,
    },
    {
      id: 'inventory',
      label: 'Inventario y plano',
      value: `${incidentEvidence.inactiveUnitCode} fuera de servicio`,
      detail: 'Bloqueo local de mantenimiento',
    },
  ],
  limitations: [
    'No consulta sensores, mensajería, reseñas ni sistemas externos',
    'La espera y las identidades pertenecen a un escenario completamente ficticio',
    'Preparar el parte no lo entrega ni abre tickets: el relevo sigue siendo humano',
  ],
  proposedSummary: automatizaIncidentDraft,
  delivery: 'internal_draft',
  execution: 'none',
};

function bookingDetail(booking: DemoBooking): BookingDetail {
  const nights = Math.max(
    1,
    Math.round(
      (Date.parse(`${booking.dateTo}T00:00:00Z`) - Date.parse(`${booking.dateFrom}T00:00:00Z`)) /
        DAY_MS,
    ),
  );
  return {
    ...booking,
    priceBreakdown: {
      lines: [
        {
          concept: 'stay',
          detail: { nights },
          amountCents: booking.totalCents - booking.touristTaxCents,
        },
      ],
      totalCents: booking.totalCents,
      touristTaxCents: booking.touristTaxCents,
      currency: 'EUR',
    },
    depositCents: Math.round(booking.totalCents * 0.35),
    paymentKind: booking.paidCents > 0 ? 'card' : null,
    guests: [
      {
        id: `guest_${booking.id}`,
        name: booking.leadName?.split(' ')[0] ?? 'Familia',
        surname: booking.leadName?.split(' ').slice(1).join(' ') || 'Demo',
        secondSurname: null,
        sex: null,
        email: booking.guestEmail,
        phone: '+34 600 000 300',
        docType: null,
        docNumber: null,
        docSupportNumber: null,
        kinship: null,
        birthdate: null,
        nationality: 'ESP',
        isLead: true,
      },
    ],
  };
}

function reports(state: ScenarioState, from: string, to: string): ReportsData {
  const active = state.bookings.filter((booking) => overlaps(booking, from, to));
  const total = active.reduce((sum, booking) => sum + booking.totalCents, 0);
  const paid = active.reduce((sum, booking) => sum + booking.paidCents, 0);
  return {
    from,
    to,
    nights: Math.max(
      1,
      Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS),
    ),
    occupancy: typeSpecs.map((type) => {
      const used = active.filter((booking) => booking.unitTypeId === type.id).length;
      return {
        unitTypeId: type.id,
        units: type.count,
        occupiedNights: used,
        capacityNights: type.count,
        occupancyPct: Math.round((used / type.count) * 100),
      };
    }),
    bookingValue: { totalCents: total, paidCents: paid, bookings: active.length },
    arrivals: state.bookings.filter((booking) => booking.dateFrom >= from && booking.dateFrom < to)
      .length,
    departures: state.bookings.filter((booking) => booking.dateTo > from && booking.dateTo <= to)
      .length,
  };
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

export async function demoScenarioRequest(
  path: string,
  init?: RequestInit,
): Promise<ScenarioResult> {
  const method = init?.method ?? 'GET';
  const url = new URL(path, 'https://demo.invalid');
  const state = loadState();
  const forcedState =
    typeof window === 'undefined'
      ? null
      : new URLSearchParams(window.location.search).get('demoState');
  if (method === 'GET' && forcedState === 'loading')
    await new Promise((resolve) => window.setTimeout(resolve, 1_500));
  if (method === 'GET' && forcedState === 'error' && url.pathname.startsWith('/api/admin/'))
    return fail(503, 'scenario_forced_error');

  if (method === 'GET' && url.pathname === '/api/admin/catalog') return ok(catalog);
  if (method === 'GET' && url.pathname === '/api/admin/map') return ok({ plano: mardefondoPlano });
  if (method === 'GET' && url.pathname === '/api/admin/enquiries') return ok({ items: [] });
  if (method === 'GET' && url.pathname === '/api/admin/settings') {
    const settings: TenantSettings = {
      id: 'ten_mardefondo',
      slug: 'mardefondo',
      name: 'Camping Resort Mar de Fondo',
      tier: 3,
      timezone: 'Europe/Madrid',
      currency: 'EUR',
      locales: ['es'],
      modules: { demo: true },
    };
    return ok(settings);
  }
  if (method === 'GET' && url.pathname === '/api/admin/reports')
    return ok(
      reports(state, url.searchParams.get('from') ?? iso(7), url.searchParams.get('to') ?? iso(8)),
    );
  if (method === 'GET' && url.pathname === '/api/admin/planning') {
    const from = url.searchParams.get('from') ?? iso(1);
    const to = url.searchParams.get('to') ?? '2026-09-01';
    const data: PlanningData = {
      from,
      to,
      unitTypes,
      units,
      seasons: [
        {
          id: 'sea_mf_alta',
          name: 'Agosto · temporada alta',
          dateFrom: iso(1),
          dateTo: '2026-09-01',
          priority: 1,
        },
      ],
      bookings: (forcedState === 'empty'
        ? []
        : state.bookings.filter((booking) => overlaps(booking, from, to))
      ).map((booking) => ({
        id: booking.id,
        code: booking.code,
        status: booking.status === 'cancelled' ? 'completed' : booking.status,
        unitTypeId: booking.unitTypeId,
        unitId: booking.unitId,
        dateFrom: booking.dateFrom,
        dateTo: booking.dateTo,
        occupancy: {
          adults: booking.occupancy.adults,
          childrenAges: booking.occupancy.childrenAges,
        },
        checkedInAt: booking.checkedInAt,
        checkedOutAt: booking.checkedOutAt,
      })),
      blocks: [
        {
          id: 'block_bl_042',
          unitId: units.find((unit) => unit.code === 'BL-042')!.id,
          unitTypeId: null,
          dateFrom: iso(1),
          dateTo: '2026-09-01',
          reason: 'maintenance',
        },
      ],
    };
    return ok(data);
  }
  if (method === 'GET' && url.pathname === '/api/admin/bookings') {
    let items = forcedState === 'empty' ? [] : [...state.bookings];
    const arrival = url.searchParams.get('arrivalsOn');
    const departure = url.searchParams.get('departuresOn');
    const query = url.searchParams.get('q')?.toLowerCase();
    const status = url.searchParams.get('status');
    if (arrival) items = items.filter((booking) => booking.dateFrom === arrival);
    if (departure) items = items.filter((booking) => booking.dateTo === departure);
    if (query)
      items = items.filter((booking) =>
        `${booking.code} ${booking.leadName} ${booking.guestEmail}`.toLowerCase().includes(query),
      );
    if (status) items = items.filter((booking) => booking.status === status);
    return ok({ items });
  }
  if (method === 'GET' && url.pathname === '/api/admin/payments') {
    const provider = url.searchParams.get('provider');
    const status = url.searchParams.get('status');
    let items: PaymentLogItem[] = state.bookings.flatMap((booking) =>
      booking.payments.map((payment) => ({
        ...payment,
        bookingId: booking.id,
        bookingCode: booking.code,
        providerRef: null,
      })),
    );
    if (provider) items = items.filter((payment) => payment.provider === provider);
    if (status) items = items.filter((payment) => payment.status === status);
    return ok({ items: items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
  }
  const bookingMatch = url.pathname.match(/^\/api\/admin\/bookings\/([^/]+)$/);
  if (method === 'GET' && bookingMatch) {
    const booking = state.bookings.find((candidate) => candidate.id === bookingMatch[1]);
    return booking ? ok(bookingDetail(booking)) : fail(404, 'not_found');
  }
  if (method === 'PATCH' && bookingMatch) {
    const booking = state.bookings.find((candidate) => candidate.id === bookingMatch[1]);
    if (!booking) return fail(404, 'not_found');
    const body = bodyOf(init);
    if (body.action === 'reassign' && typeof body.unitId === 'string') {
      const unit = units.find((candidate) => candidate.id === body.unitId);
      if (!unit || unit.status !== 'active') return fail(409, 'unit_occupied');
      if (
        state.bookings.some(
          (candidate) =>
            candidate.id !== booking.id &&
            candidate.unitId === unit.id &&
            overlaps(candidate, booking.dateFrom, booking.dateTo),
        )
      )
        return fail(409, 'unit_occupied');
      booking.unitId = unit.id;
      booking.unitCode = unit.code;
      booking.unitTypeId = unit.unitTypeId;
    }
    if (
      body.action === 'move' &&
      typeof body.dateFrom === 'string' &&
      typeof body.dateTo === 'string'
    ) {
      const nights = Math.max(
        1,
        Math.round(
          (Date.parse(`${body.dateTo}T00:00:00Z`) - Date.parse(`${body.dateFrom}T00:00:00Z`)) /
            DAY_MS,
        ),
      );
      booking.dateFrom = body.dateFrom;
      booking.dateTo = body.dateTo;
      booking.totalCents = nights * 21900;
      booking.touristTaxCents = nights * 210;
    }
    if (body.action === 'note' && typeof body.notes === 'string') booking.notes = body.notes;
    if (body.action === 'confirm') booking.status = 'confirmed';
    if (body.action === 'cancel') booking.status = 'cancelled';
    if (body.action === 'check_in') booking.checkedInAt = '2026-08-07T12:00:00.000Z';
    if (body.action === 'undo_checkin') booking.checkedInAt = null;
    if (body.action === 'check_out') {
      booking.checkedOutAt = '2026-08-07T12:10:00.000Z';
      booking.status = 'completed';
    }
    if (
      body.action === 'record_payment' &&
      typeof body.amountCents === 'number' &&
      body.amountCents > 0
    ) {
      const amount = Math.min(body.amountCents, booking.totalCents - booking.paidCents);
      booking.paidCents += amount;
      booking.payments.push({
        id: `pay_${booking.id}_${booking.payments.length + 1}`,
        provider: 'manual',
        amountCents: amount,
        status: 'succeeded',
        createdAt: '2026-08-07T12:05:00.000Z',
      });
    }
    if (body.action === 'refund' && typeof body.amountCents === 'number' && body.amountCents > 0) {
      const amount = Math.min(body.amountCents, booking.paidCents);
      booking.paidCents -= amount;
      booking.payments.push({
        id: `pay_${booking.id}_refund_${booking.payments.length + 1}`,
        provider: 'manual',
        amountCents: -amount,
        status: 'refunded',
        createdAt: '2026-08-07T12:06:00.000Z',
      });
    }
    saveState(state);
    return ok({
      id: booking.id,
      status: booking.status,
      notes: booking.notes,
      paidCents: booking.paidCents,
    });
  }
  const requoteMatch = url.pathname.match(/^\/api\/admin\/bookings\/([^/]+)\/requote$/);
  if (method === 'POST' && requoteMatch) {
    const booking = state.bookings.find((candidate) => candidate.id === requoteMatch[1]);
    if (!booking) return fail(404, 'not_found');
    const body = bodyOf(init);
    const dateFrom = typeof body.dateFrom === 'string' ? body.dateFrom : booking.dateFrom;
    const dateTo = typeof body.dateTo === 'string' ? body.dateTo : booking.dateTo;
    const nights = Math.max(
      1,
      Math.round(
        (Date.parse(`${dateTo}T00:00:00Z`) - Date.parse(`${dateFrom}T00:00:00Z`)) / DAY_MS,
      ),
    );
    const totalCents = nights * 21900;
    return ok({
      nights,
      totalCents,
      previousTotalCents: booking.totalCents,
      paidCents: booking.paidCents,
      breakdown: {
        lines: [{ concept: 'stay', detail: { nights }, amountCents: totalCents }],
        totalCents,
        touristTaxCents: nights * 210,
        currency: 'EUR',
      },
      unitId: body.unitId ?? booking.unitId,
    });
  }
  if (method === 'GET' && url.pathname === '/api/admin/search') {
    const q = url.searchParams.get('q')?.toLowerCase() ?? '';
    return ok({
      bookings: state.bookings
        .filter((booking) => `${booking.code} ${booking.leadName}`.toLowerCase().includes(q))
        .slice(0, 8),
      guests: [],
      units: units.filter((unit) => unit.code.toLowerCase().includes(q)).slice(0, 8),
    });
  }
  return fail(404, 'scenario_route_not_implemented');
}

export const mardefondoFixtureCounts = {
  units: units.length,
  bookings: initialState().bookings.length,
  inactiveUnits: units.filter((unit) => unit.status !== 'active').length,
  mapUnits: mardefondoPlano.blocks.reduce((sum, block) => sum + block.units.length, 0),
};
