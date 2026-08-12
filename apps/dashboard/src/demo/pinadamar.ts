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
export const isSerraltaScenario = import.meta.env.VITE_DEMO_SCENARIO === 'serralta';
export const isVinyesScenario = import.meta.env.VITE_DEMO_SCENARIO === 'vinyes';
export const isTarongersScenario = import.meta.env.VITE_DEMO_SCENARIO === 'tarongers';
export const isCarrascaScenario = import.meta.env.VITE_DEMO_SCENARIO === 'carrasca';
export const isBallenaScenario = import.meta.env.VITE_DEMO_SCENARIO === 'ballena';
export const isSoldhivernScenario = import.meta.env.VITE_DEMO_SCENARIO === 'soldhivern';

export const PINADA_STATE_KEY = 'logic2b-demo:pinadamar:state:v1';
export const PINADA_WEB_ENQUIRY_KEY = 'logic2b-demo:pinadamar:submitted-enquiry:v1';
export const SERRALTA_STATE_KEY = 'logic2b-demo:serralta:state:v1';
export const SERRALTA_WEB_ENQUIRY_KEY = 'logic2b-demo:serralta:submitted-enquiry:v1';
export const VINYES_STATE_KEY = 'logic2b-demo:vinyes:state:v1';
export const VINYES_WEB_ENQUIRY_KEY = 'logic2b-demo:vinyes:submitted-enquiry:v1';
export const TARONGERS_STATE_KEY = 'logic2b-demo:tarongers:state:v1';
export const TARONGERS_WEB_ENQUIRY_KEY = 'logic2b-demo:tarongers:submitted-enquiry:v1';
export const CARRASCA_STATE_KEY = 'logic2b-demo:carrasca:state:v1';
export const CARRASCA_WEB_ENQUIRY_KEY = 'logic2b-demo:carrasca:submitted-enquiry:v1';
export const BALLENA_STATE_KEY = 'logic2b-demo:ballena:state:v1';
export const BALLENA_WEB_ENQUIRY_KEY = 'logic2b-demo:ballena:submitted-enquiry:v1';
export const SOLDHIVERN_STATE_KEY = 'logic2b-demo:soldhivern:state:v1';
export const SOLDHIVERN_WEB_ENQUIRY_KEY = 'logic2b-demo:soldhivern:submitted-enquiry:v1';

const activeScenario = isSoldhivernScenario
  ? {
      id: 'soldhivern',
      stateKey: SOLDHIVERN_STATE_KEY,
      enquiryKey: SOLDHIVERN_WEB_ENQUIRY_KEY,
      bookingPrefix: 'SH',
      tenantId: 'ten_soldhivern',
      name: "Camping Sol d'Hivern",
      locales: ['es'],
    }
  : isBallenaScenario
    ? {
        id: 'ballena',
        stateKey: BALLENA_STATE_KEY,
        enquiryKey: BALLENA_WEB_ENQUIRY_KEY,
        bookingPrefix: 'BL',
        tenantId: 'ten_ballena',
        name: 'Camping La Ballena',
        locales: ['es'],
      }
    : isCarrascaScenario
      ? {
          id: 'carrasca',
          stateKey: CARRASCA_STATE_KEY,
          enquiryKey: CARRASCA_WEB_ENQUIRY_KEY,
          bookingPrefix: 'CR',
          tenantId: 'ten_carrasca',
          name: 'Camping La Carrasca',
          locales: ['es'],
        }
      : isTarongersScenario
        ? {
            id: 'tarongers',
            stateKey: TARONGERS_STATE_KEY,
            enquiryKey: TARONGERS_WEB_ENQUIRY_KEY,
            bookingPrefix: 'TG',
            tenantId: 'ten_tarongers',
            name: 'Camping Els Tarongers',
            locales: ['es'],
          }
        : isVinyesScenario
          ? {
              id: 'vinyes',
              stateKey: VINYES_STATE_KEY,
              enquiryKey: VINYES_WEB_ENQUIRY_KEY,
              bookingPrefix: 'VY',
              tenantId: 'ten_vinyes',
              name: 'Camping Entre Vinyes',
              locales: ['es'],
            }
          : isSerraltaScenario
            ? {
                id: 'serralta',
                stateKey: SERRALTA_STATE_KEY,
                enquiryKey: SERRALTA_WEB_ENQUIRY_KEY,
                bookingPrefix: 'SR',
                tenantId: 'ten_serralta',
                name: 'Camping Serralta',
                locales: ['es', 'fr', 'de', 'en'],
              }
            : {
                id: 'pinadamar',
                stateKey: PINADA_STATE_KEY,
                enquiryKey: PINADA_WEB_ENQUIRY_KEY,
                bookingPrefix: 'PM',
                tenantId: 'ten_pinadamar',
                name: 'Camping Pinada del Mar',
                locales: ['es', 'ca', 'fr', 'de'],
              };
const activeScenarioId = activeScenario.id;
const activeStateKey = activeScenario.stateKey;
const activeWebEnquiryKey = activeScenario.enquiryKey;
const activeBookingPrefix = activeScenario.bookingPrefix;

const DAY_MS = 86_400_000;
const anchorYear = 2026;
const iso = (day: number) => `${anchorYear}-08-${String(day).padStart(2, '0')}`;
const addDays = (date: string, days: number) =>
  new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);

const range = (prefix: string, count: number) =>
  Array.from({ length: count }, (_, index) => `${prefix}-${String(index + 1).padStart(2, '0')}`);

const pinadaTypeSpecs = [
  { id: 'ut_parcela_pino', kind: 'pitch' as const, name: 'Parcela Pinar', count: 60, prefix: 'P' },
  { id: 'ut_parcela_mar', kind: 'pitch' as const, name: 'Parcela Brisa', count: 24, prefix: 'M' },
  {
    id: 'ut_bungalow',
    kind: 'lodging' as const,
    name: 'Bungalow Familiar',
    count: 16,
    prefix: 'B',
  },
  { id: 'ut_mobil', kind: 'lodging' as const, name: 'Mobil-home Salina', count: 10, prefix: 'MH' },
] as const;

export const serraltaTypeSpecs = [
  { id: 'ut_bosque', kind: 'pitch' as const, name: 'Parcela Bosque', count: 48, prefix: 'BOS' },
  { id: 'ut_mirador', kind: 'pitch' as const, name: 'Parcela Mirador', count: 18, prefix: 'MIR' },
  { id: 'ut_cabana', kind: 'lodging' as const, name: 'Cabaña Pizarra', count: 10, prefix: 'CAB' },
  { id: 'ut_refugio', kind: 'lodging' as const, name: 'Refugio Serralta', count: 4, prefix: 'REF' },
] as const;

export const vinyesTypeSpecs = [
  { id: 'ut_cepa', kind: 'pitch' as const, name: 'Parcela Cepa', count: 38, prefix: 'CEP' },
  { id: 'ut_bancal', kind: 'pitch' as const, name: 'Parcela Bancal', count: 18, prefix: 'BAN' },
  { id: 'ut_cal', kind: 'lodging' as const, name: 'Cabaña de Cal', count: 10, prefix: 'CAL' },
  { id: 'ut_caseta', kind: 'lodging' as const, name: 'Caseta de Viña', count: 4, prefix: 'CSV' },
] as const;

export const tarongersTypeSpecs = [
  { id: 'ut_taronger', kind: 'pitch' as const, name: 'Parcela Taronger', count: 60, prefix: 'TAR' },
  { id: 'ut_sequia', kind: 'pitch' as const, name: 'Parcela Séquia', count: 20, prefix: 'SEQ' },
  { id: 'ut_azahar', kind: 'lodging' as const, name: 'Bungalow Azahar', count: 14, prefix: 'AZA' },
  { id: 'ut_naranjal', kind: 'lodging' as const, name: 'Casa Naranjal', count: 6, prefix: 'NAR' },
] as const;

export const carrascaTypeSpecs = [
  { id: 'ut_encina', kind: 'pitch' as const, name: 'Parcela Encina', count: 80, prefix: 'ENC' },
  {
    id: 'ut_carrascal',
    kind: 'pitch' as const,
    name: 'Parcela Carrascal',
    count: 30,
    prefix: 'CAR',
  },
  {
    id: 'ut_bellota',
    kind: 'lodging' as const,
    name: 'Bungalow Bellota',
    count: 24,
    prefix: 'BEL',
  },
  { id: 'ut_umbria', kind: 'lodging' as const, name: 'Casa Umbría', count: 16, prefix: 'UMB' },
] as const;

export const ballenaTypeSpecs = [
  { id: 'ut_orilla', kind: 'pitch' as const, name: 'Parcela Orilla', count: 110, prefix: 'ORI' },
  { id: 'ut_brisa', kind: 'pitch' as const, name: 'Parcela Brisa', count: 50, prefix: 'BRI' },
  { id: 'ut_ola', kind: 'lodging' as const, name: 'Bungalow Ola', count: 54, prefix: 'OLA' },
  { id: 'ut_marea', kind: 'lodging' as const, name: 'Mobil-home Marea', count: 36, prefix: 'MAR' },
] as const;

export const soldhivernTypeSpecs = [
  { id: 'ut_llevant', kind: 'pitch' as const, name: 'Parcela Llevant', count: 90, prefix: 'LLE' },
  { id: 'ut_migdia', kind: 'pitch' as const, name: 'Parcela Migdia', count: 80, prefix: 'MIG' },
  {
    id: 'ut_olivera',
    kind: 'lodging' as const,
    name: 'Bungalow Olivera',
    count: 20,
    prefix: 'OLI',
  },
  { id: 'ut_garbi', kind: 'lodging' as const, name: 'Estudio Garbí', count: 10, prefix: 'GAR' },
] as const;

const typeSpecs = isSoldhivernScenario
  ? soldhivernTypeSpecs
  : isBallenaScenario
    ? ballenaTypeSpecs
    : isCarrascaScenario
      ? carrascaTypeSpecs
      : isTarongersScenario
        ? tarongersTypeSpecs
        : isVinyesScenario
          ? vinyesTypeSpecs
          : isSerraltaScenario
            ? serraltaTypeSpecs
            : pinadaTypeSpecs;

const unitTypes: Catalog['unitTypes'] = typeSpecs.map((spec) => ({
  id: spec.id,
  kind: spec.kind,
  nameI18n: { es: spec.name },
  capacityMin: 1,
  capacityMax:
    spec.kind === 'pitch'
      ? 6
      : spec.id === 'ut_garbi'
        ? 2
        : spec.id === 'ut_olivera'
          ? 4
          : spec.id === 'ut_marea'
            ? 6
            : spec.id === 'ut_bungalow' || spec.id === 'ut_refugio'
              ? 6
              : spec.id === 'ut_bellota'
                ? 4
                : spec.id === 'ut_umbria'
                  ? 6
                  : spec.id === 'ut_azahar'
                    ? 5
                    : spec.id === 'ut_naranjal'
                      ? 6
                      : spec.id === 'ut_cabana' || spec.id === 'ut_cal' || spec.id === 'ut_caseta'
                        ? 4
                        : 5,
  includedPersons:
    spec.kind === 'pitch' ||
    spec.id === 'ut_cabana' ||
    spec.id === 'ut_cal' ||
    spec.id === 'ut_caseta' ||
    spec.id === 'ut_olivera' ||
    spec.id === 'ut_garbi'
      ? 2
      : 4,
}));

const units: PlanningUnit[] = typeSpecs.flatMap((spec) =>
  range(spec.prefix, spec.count).map((code, index) => ({
    id: `unit_${code.toLowerCase().replace('-', '_')}`,
    unitTypeId: spec.id,
    code,
    status:
      (spec.prefix === 'B' && index === 11) ||
      (spec.prefix === 'CAB' && index === 7) ||
      (spec.prefix === 'CAL' && index === 7) ||
      (spec.prefix === 'AZA' && index === 7) ||
      (spec.prefix === 'BEL' && index === 7) ||
      (spec.prefix === 'OLA' && index === 17) ||
      (spec.prefix === 'OLI' && index === 7)
        ? 'inactive'
        : 'active',
  })),
);

const preferredCodeByType: Record<string, string> = {
  ut_parcela_pino: 'P-08',
  ut_parcela_mar: 'M-08',
  ut_bungalow: 'B-08',
  ut_mobil: 'MH-08',
  ut_bosque: 'BOS-08',
  ut_mirador: 'MIR-08',
  ut_cabana: 'CAB-06',
  ut_refugio: 'REF-02',
  ut_cepa: 'CEP-08',
  ut_bancal: 'BAN-08',
  ut_cal: 'CAL-06',
  ut_caseta: 'CSV-02',
  ut_taronger: 'TAR-08',
  ut_sequia: 'SEQ-08',
  ut_azahar: 'AZA-06',
  ut_naranjal: 'NAR-02',
  ut_encina: 'ENC-08',
  ut_carrascal: 'CAR-08',
  ut_bellota: 'BEL-06',
  ut_umbria: 'UMB-02',
  ut_orilla: 'ORI-08',
  ut_brisa: 'BRI-08',
  ut_ola: 'OLA-06',
  ut_marea: 'MAR-06',
  ut_llevant: 'LLE-08',
  ut_migdia: 'MIG-08',
  ut_olivera: 'OLI-06',
  ut_garbi: 'GAR-02',
};

const catalog: Catalog = {
  unitTypes,
  units,
  extras: [
    {
      id: 'ext_mascota',
      nameI18n: { es: 'Mascota' },
      priceCents: 500,
      per: 'night',
      required: false,
    },
  ],
};

const firstNames = [
  'Marta',
  'Pau',
  'Sophie',
  'Jonas',
  'Lucía',
  'Marc',
  'Claire',
  'Nora',
  'Elena',
  'Bruno',
  'Emma',
  'Daniel',
  'Laura',
  'Hugo',
  'Mila',
  'Thomas',
  'Aina',
  'Lars',
  'Carmen',
  'Leo',
];
const surnames = [
  'Ferrer',
  'Vidal',
  'Martin',
  'Schmidt',
  'Costa',
  'Dubois',
  'Navarro',
  'Weber',
  'Serra',
  'Bernard',
];
const locales = activeScenario.locales;
const statuses: EnquiryStatus[] = ['new', 'new', 'contacted', 'quoted', 'converted', 'lost'];
const enquiryMessages: Record<string, string> = {
  es: isSoldhivernScenario
    ? 'Queremos pasar 60 noches entre invierno y primavera y confirmar electricidad, agua y cómo se gestiona una prórroga.'
    : isBallenaScenario
      ? 'Queremos una semana completa en agosto y necesitamos saber si toda la familia puede llegar el sábado en la misma franja.'
      : isCarrascaScenario
        ? 'Necesitamos ver la tasa regional, la señal y qué devolución se aplicaría si cancelamos antes de confirmar.'
        : isTarongersScenario
          ? 'Somos dos adultos con niños de 6 y 10 años; preferimos sombra de tarde y necesitamos confirmar el espacio del vehículo.'
          : isVinyesScenario
            ? 'Queremos venir durante la vendimia y saber qué temporada se aplica a nuestras fechas.'
            : 'Nos interesa una ruta de bosque y necesitamos saber cómo está el firme.',
  ca: 'Preferim ombra i una zona tranquil·la. No s’enviarà cap missatge.',
  fr: 'Nous prévoyons une randonnée et souhaitons connaître l’état du sentier.',
  de: 'Wir planen eine Wanderung und möchten den aktuellen Wegezustand wissen.',
  en: 'We plan to hike and would like to know the current trail conditions.',
};

export const baseEnquiries: EnquiryItem[] = Array.from({ length: 42 }, (_, index) => {
  const locale = locales[index % locales.length]!;
  const type = typeSpecs[index % typeSpecs.length]!;
  const from = iso(8 + (index % 17));
  return {
    id: `enq_${activeScenarioId}_${String(index + 1).padStart(3, '0')}`,
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
    message: `${enquiryMessages[locale]} [Demo ${index + 1}]`,
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
  if (isSoldhivernScenario) {
    const longStayUnits = units.filter((unit) => unit.status === 'active');
    return longStayUnits.map((unit, index) => {
      const dateFrom = ['2026-06-01', '2026-06-15', '2026-07-01'][index % 3]!;
      const duration = 60 + (index % 3) * 15;
      const totalCents =
        duration *
        (unit.unitTypeId === 'ut_garbi' ? 3600 : unit.unitTypeId === 'ut_olivera' ? 5200 : 2400);
      return {
        id: `book_soldhivern_${String(index + 1).padStart(3, '0')}`,
        code: `SH-26-${String(index + 1).padStart(4, '0')}`,
        status: index % 19 === 0 ? 'pending' : 'confirmed',
        channel: index % 4 === 0 ? 'phone' : 'web',
        dateFrom,
        dateTo: addDays(dateFrom, duration),
        unitTypeId: unit.unitTypeId,
        unitId: unit.id,
        unitCode: unit.code,
        leadName: `${firstNames[(index + 4) % firstNames.length]} ${surnames[(index + 3) % surnames.length]}`,
        occupancy: {
          adults: index % 5 === 0 ? 1 : 2,
          childrenAges: [],
          pets: index % 9 === 0 ? 1 : 0,
          vehicles: 1,
        },
        totalCents,
        paidCents: index % 7 === 0 ? 0 : Math.round(totalCents * 0.15),
        notes: index % 8 === 0 ? 'Estancia larga: revisar consumo y opción de prórroga.' : null,
        checkedInAt: index % 19 === 0 ? null : '2026-08-06T10:20:00.000Z',
        checkedOutAt: null,
        createdAt: `2026-05-${String(1 + (index % 28)).padStart(2, '0')}T10:00:00.000Z`,
        locale: 'es',
        guestEmail: `largaestancia${index + 1}@example.test`,
      };
    });
  }
  if (isBallenaScenario) {
    const weeklyUnits = units.filter((unit) => unit.status === 'active');
    return weeklyUnits.map((unit, index) => {
      // Tres olas de sábados consecutivos: la ocupación del planning se acerca
      // al límite y recepción puede filtrar una llegada masiva sin datos reales.
      const dateFrom = iso(1 + (index % 3) * 7);
      const dateTo = addDays(dateFrom, 7);
      const totalCents = 108000 + (index % 12) * 7600;
      return {
        id: `book_ballena_${String(index + 1).padStart(3, '0')}`,
        code: `BL-26-${String(index + 1).padStart(4, '0')}`,
        status: index % 17 === 0 ? 'pending' : 'confirmed',
        channel: index % 3 === 0 ? 'phone' : 'web',
        dateFrom,
        dateTo,
        unitTypeId: unit.unitTypeId,
        unitId: unit.id,
        unitCode: unit.code,
        leadName: `${firstNames[(index + 4) % firstNames.length]} ${surnames[(index + 3) % surnames.length]}`,
        occupancy: {
          adults: 2,
          childrenAges: index % 2 === 0 ? [5, 9] : [7],
          pets: unit.unitTypeId.startsWith('ut_') && index % 11 === 0 ? 1 : 0,
          vehicles: 1,
        },
        totalCents,
        paidCents: index % 5 === 0 ? 0 : Math.round(totalCents * 0.25),
        notes: index % 8 === 0 ? 'Llegada de sábado: franja de acceso asignada en la demo.' : null,
        checkedInAt: null,
        checkedOutAt: null,
        createdAt: `2026-07-${String(1 + (index % 28)).padStart(2, '0')}T10:00:00.000Z`,
        locale: 'es',
        guestEmail: `semana${index + 1}@example.test`,
      };
    });
  }
  return Array.from({ length: 84 }, (_, index) => {
    const unit = units[(index * 13) % units.length]!;
    const start = 1 + ((index * 5) % 27);
    const dateFrom = iso(start);
    const duration = 3 + (index % 6);
    const status: BookingListItem['status'] = index % 13 === 0 ? 'pending' : 'confirmed';
    const inHouse = start <= 6 && start + duration > 6 && status === 'confirmed';
    const totalCents = 36000 + (index % 9) * 4300;
    return {
      id: `book_${activeScenarioId}_${String(index + 1).padStart(3, '0')}`,
      code: `${activeBookingPrefix}-26-${String(index + 1).padStart(4, '0')}`,
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
      paidCents:
        index % 5 === 0
          ? 0
          : Math.round(totalCents * (isCarrascaScenario ? 0.3 : isBallenaScenario ? 0.25 : 0.35)),
      notes: index % 8 === 0 ? 'Llegada prevista después de las 18:00.' : null,
      checkedInAt: inHouse ? `${iso(6)}T10:20:00.000Z` : null,
      checkedOutAt: null,
      createdAt: `2026-07-${String(1 + (index % 28)).padStart(2, '0')}T10:00:00.000Z`,
      locale: locales[index % locales.length]!,
      guestEmail: `reserva${index + 1}@example.test`,
    };
  });
}

function readPublicBookings(): DemoBooking[] {
  if (
    (!isCarrascaScenario && !isBallenaScenario && !isSoldhivernScenario) ||
    typeof localStorage === 'undefined'
  )
    return [];
  try {
    const slug = isSoldhivernScenario ? 'soldhivern' : isBallenaScenario ? 'ballena' : 'carrasca';
    const raw = localStorage.getItem(`logic2b-demo:${slug}:public-bookings:v1`);
    if (!raw) return [];
    const items = JSON.parse(raw) as Array<{
      code: string;
      email?: string;
      status: BookingListItem['status'];
      dateFrom: string;
      dateTo: string;
      unitTypeId: string;
      occupancy: BookingListItem['occupancy'];
      totalCents: number;
      paidCents: number;
    }>;
    return items.flatMap((item, index) => {
      const unit = units.find(
        (candidate) => candidate.code === preferredCodeByType[item.unitTypeId],
      );
      if (!unit || !item.code || !item.dateFrom || !item.dateTo) return [];
      return [
        {
          id: `book_${slug}_public_${item.code.toLowerCase().replaceAll('-', '_')}`,
          code: item.code,
          status: item.status,
          channel: 'web',
          dateFrom: item.dateFrom,
          dateTo: item.dateTo,
          unitTypeId: item.unitTypeId,
          unitId: unit.id,
          unitCode: unit.code,
          leadName: `Familia demo ${index + 1}`,
          occupancy: item.occupancy,
          totalCents: item.totalCents,
          paidCents: item.paidCents,
          notes: isSoldhivernScenario
            ? 'Reserva creada en la web demo con estancia larga, señal y prórroga ficticias.'
            : isBallenaScenario
              ? 'Reserva creada en la web demo con semana, sábado y señal ficticios.'
              : 'Reserva creada en la web demo con tasa, señal y cancelación ficticias.',
          checkedInAt: null,
          checkedOutAt: null,
          createdAt: '2026-08-11T12:00:00.000Z',
          locale: 'es',
          guestEmail: item.email ?? `reserva.${slug}@example.test`,
        },
      ];
    });
  } catch {
    return [];
  }
}

type ScenarioState = { enquiries: EnquiryItem[]; bookings: DemoBooking[] };

function readWebEnquiry(): EnquiryItem | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(activeWebEnquiryKey);
    return raw ? (JSON.parse(raw) as EnquiryItem) : null;
  } catch {
    return null;
  }
}

function initialState(): ScenarioState {
  const enquiry = readWebEnquiry();
  return {
    enquiries: enquiry ? [enquiry, ...baseEnquiries] : [...baseEnquiries],
    bookings: [...readPublicBookings(), ...baseBookings()],
  };
}

function loadState(): ScenarioState {
  if (typeof localStorage === 'undefined') return initialState();
  try {
    const raw = localStorage.getItem(activeStateKey);
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
  localStorage.setItem(activeStateKey, JSON.stringify(state));
}

export function resetPinadaScenario(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(activeStateKey);
  localStorage.removeItem(activeWebEnquiryKey);
  if (isCarrascaScenario) {
    localStorage.removeItem('logic2b-demo:carrasca:public-bookings:v1');
  }
  if (isBallenaScenario) localStorage.removeItem('logic2b-demo:ballena:public-bookings:v1');
  if (isSoldhivernScenario) localStorage.removeItem('logic2b-demo:soldhivern:public-bookings:v1');
}

export const resetSerraltaScenario = resetPinadaScenario;
export const resetVinyesScenario = resetPinadaScenario;
export const resetTarongersScenario = resetPinadaScenario;
export const resetCarrascaScenario = resetPinadaScenario;
export const resetBallenaScenario = resetPinadaScenario;
export const resetSoldhivernScenario = resetPinadaScenario;

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
    {
      kind: 'service',
      x: 60,
      y: 530,
      w: 150,
      h: 64,
      label: 'Recepción y acceso',
      icon: 'reception',
    },
    { kind: 'service', x: 488, y: 230, w: 126, h: 84, label: 'Piscina familiar', icon: 'pool' },
    { kind: 'service', x: 638, y: 230, w: 78, h: 58, label: 'Aseos', icon: 'wc' },
    { kind: 'service', x: 488, y: 410, w: 102, h: 56, label: 'Súper', icon: 'shop' },
    { kind: 'service', x: 610, y: 410, w: 106, h: 56, label: 'Juegos', icon: 'playground' },
    { kind: 'label', x: 742, y: 112, text: 'Brisa marina', size: 's' },
  ],
  blocks: [
    {
      id: 'calle_pinos_1',
      label: 'Calle de los Pinos I',
      cell: 'pitch',
      x: 60,
      y: 112,
      cols: 12,
      units: range('P', 30),
    },
    {
      id: 'calle_pinos_2',
      label: 'Calle de los Pinos II',
      cell: 'pitch',
      x: 60,
      y: 206,
      cols: 12,
      units: range('P', 60).slice(30),
    },
    {
      id: 'calle_brisa',
      label: 'Calle Brisa',
      cell: 'pitch',
      x: 60,
      y: 396,
      cols: 12,
      units: range('M', 24),
    },
    {
      id: 'anillo_bungalows',
      label: 'Anillo de bungalows',
      cell: 'lodging',
      x: 488,
      y: 112,
      cols: 8,
      units: range('B', 16),
    },
    {
      id: 'mobil_salina',
      label: 'Mobil-home Salina',
      cell: 'lodging',
      x: 488,
      y: 490,
      cols: 5,
      units: range('MH', 10),
    },
  ],
};

export const serraltaPlano: PlanoDescriptor = {
  version: 1,
  decor: [
    { kind: 'enclosure', x: 20, y: 20, w: 900, h: 650 },
    { kind: 'green', x: 36, y: 36, w: 848, h: 92, label: 'Hayedo húmedo · norte' },
    { kind: 'water', x: 42, y: 610, w: 820, h: 28, label: 'Arroyo · cota baja' },
    { kind: 'road', x: 72, y: 166, w: 736, h: 18 },
    { kind: 'road', x: 72, y: 356, w: 736, h: 18 },
    { kind: 'road', x: 420, y: 110, w: 18, h: 476 },
    {
      kind: 'service',
      x: 64,
      y: 500,
      w: 152,
      h: 68,
      label: 'Recepción y partes',
      icon: 'reception',
    },
    { kind: 'service', x: 480, y: 232, w: 124, h: 70, label: 'Baños y secadero', icon: 'wc' },
    {
      kind: 'service',
      x: 628,
      y: 232,
      w: 112,
      h: 70,
      label: 'Fuego común',
      icon: 'restaurant',
    },
    { kind: 'service', x: 480, y: 418, w: 108, h: 58, label: 'Despensa', icon: 'shop' },
    { kind: 'label', x: 734, y: 132, text: 'Inicio de rutas', size: 's' },
  ],
  blocks: [
    {
      id: 'bosque_bajo',
      label: 'Bosque Bajo',
      cell: 'pitch',
      x: 72,
      y: 112,
      cols: 12,
      units: range('BOS', 24),
    },
    {
      id: 'bosque_alto',
      label: 'Bosque Alto',
      cell: 'pitch',
      x: 72,
      y: 208,
      cols: 12,
      units: range('BOS', 48).slice(24),
    },
    {
      id: 'mirador',
      label: 'Calle Mirador',
      cell: 'pitch',
      x: 72,
      y: 398,
      cols: 9,
      units: range('MIR', 18),
    },
    {
      id: 'cabanas',
      label: 'Cabañas Pizarra',
      cell: 'lodging',
      x: 480,
      y: 112,
      cols: 5,
      units: range('CAB', 10),
    },
    {
      id: 'refugios',
      label: 'Refugios Serralta',
      cell: 'lodging',
      x: 620,
      y: 418,
      cols: 4,
      units: range('REF', 4),
    },
  ],
};

export const vinyesPlano: PlanoDescriptor = {
  version: 1,
  decor: [
    { kind: 'enclosure', x: 20, y: 20, w: 900, h: 650 },
    { kind: 'green', x: 36, y: 36, w: 848, h: 78, label: 'Viña vieja · bancal norte' },
    { kind: 'road', x: 70, y: 176, w: 742, h: 18 },
    { kind: 'road', x: 70, y: 372, w: 742, h: 18 },
    { kind: 'road', x: 430, y: 108, w: 18, h: 482 },
    {
      kind: 'service',
      x: 66,
      y: 516,
      w: 152,
      h: 66,
      label: 'Recepción y cosecha',
      icon: 'reception',
    },
    {
      kind: 'service',
      x: 486,
      y: 236,
      w: 126,
      h: 68,
      label: 'Patio de sombra',
      icon: 'restaurant',
    },
    { kind: 'service', x: 638, y: 236, w: 100, h: 68, label: 'Baños', icon: 'wc' },
    { kind: 'service', x: 486, y: 432, w: 112, h: 56, label: 'Despensa', icon: 'shop' },
    { kind: 'label', x: 716, y: 132, text: 'Camino de bancales', size: 's' },
  ],
  blocks: [
    {
      id: 'cepas_bajas',
      label: 'Cepas Bajas',
      cell: 'pitch',
      x: 70,
      y: 116,
      cols: 10,
      units: range('CEP', 20),
    },
    {
      id: 'cepas_altas',
      label: 'Cepas Altas',
      cell: 'pitch',
      x: 70,
      y: 216,
      cols: 9,
      units: range('CEP', 38).slice(20),
    },
    {
      id: 'bancal',
      label: 'Parcela Bancal',
      cell: 'pitch',
      x: 70,
      y: 410,
      cols: 9,
      units: range('BAN', 18),
    },
    {
      id: 'cabanas_cal',
      label: 'Cabañas de Cal',
      cell: 'lodging',
      x: 486,
      y: 116,
      cols: 5,
      units: range('CAL', 10),
    },
    {
      id: 'casetas_vinya',
      label: 'Casetas de Viña',
      cell: 'lodging',
      x: 630,
      y: 430,
      cols: 4,
      units: range('CSV', 4),
    },
  ],
};

export const tarongersPlano: PlanoDescriptor = {
  version: 1,
  decor: [
    { kind: 'enclosure', x: 20, y: 20, w: 900, h: 650 },
    { kind: 'green', x: 36, y: 36, w: 848, h: 72, label: 'Naranjal adulto · sombra norte' },
    { kind: 'water', x: 824, y: 112, w: 34, h: 470, label: 'Acequia protegida' },
    { kind: 'road', x: 66, y: 184, w: 720, h: 18 },
    { kind: 'road', x: 66, y: 382, w: 720, h: 18 },
    { kind: 'road', x: 442, y: 108, w: 18, h: 492 },
    {
      kind: 'service',
      x: 66,
      y: 520,
      w: 150,
      h: 64,
      label: 'Recepción y acceso',
      icon: 'reception',
    },
    { kind: 'service', x: 492, y: 232, w: 130, h: 78, label: 'Piscina familiar', icon: 'pool' },
    { kind: 'service', x: 646, y: 232, w: 92, h: 62, label: 'Baños', icon: 'wc' },
    { kind: 'service', x: 492, y: 438, w: 110, h: 56, label: 'Tienda y pan', icon: 'shop' },
    { kind: 'service', x: 624, y: 438, w: 114, h: 56, label: 'Patio de agua', icon: 'playground' },
    { kind: 'label', x: 696, y: 130, text: 'Linde de la huerta', size: 's' },
  ],
  blocks: [
    {
      id: 'tarongers_oest',
      label: 'Tarongers Oest',
      cell: 'pitch',
      x: 68,
      y: 116,
      cols: 10,
      units: range('TAR', 30),
    },
    {
      id: 'tarongers_est',
      label: 'Tarongers Est',
      cell: 'pitch',
      x: 68,
      y: 222,
      cols: 10,
      units: range('TAR', 60).slice(30),
    },
    {
      id: 'sequia',
      label: 'Parcelas Séquia',
      cell: 'pitch',
      x: 68,
      y: 418,
      cols: 10,
      units: range('SEQ', 20),
    },
    {
      id: 'bungalows_azahar',
      label: 'Bungalows Azahar',
      cell: 'lodging',
      x: 492,
      y: 116,
      cols: 7,
      units: range('AZA', 14),
    },
    {
      id: 'casas_naranjal',
      label: 'Casas Naranjal',
      cell: 'lodging',
      x: 620,
      y: 510,
      cols: 6,
      units: range('NAR', 6),
    },
  ],
};

export const carrascaPlano: PlanoDescriptor = {
  version: 1,
  decor: [
    { kind: 'enclosure', x: 20, y: 20, w: 900, h: 650 },
    { kind: 'green', x: 36, y: 36, w: 848, h: 74, label: 'Encinar adulto · linde norte' },
    { kind: 'road', x: 64, y: 194, w: 730, h: 18 },
    { kind: 'road', x: 64, y: 398, w: 730, h: 18 },
    { kind: 'road', x: 454, y: 108, w: 18, h: 500 },
    {
      kind: 'service',
      x: 64,
      y: 530,
      w: 152,
      h: 64,
      label: 'Recepción y reglas',
      icon: 'reception',
    },
    { kind: 'service', x: 508, y: 236, w: 134, h: 76, label: 'Piscina del claro', icon: 'pool' },
    { kind: 'service', x: 664, y: 236, w: 112, h: 66, label: 'Era común', icon: 'restaurant' },
    { kind: 'service', x: 508, y: 426, w: 104, h: 58, label: 'Baños', icon: 'wc' },
    { kind: 'service', x: 638, y: 426, w: 138, h: 58, label: 'Taller de bicis', icon: 'shop' },
    { kind: 'label', x: 704, y: 130, text: 'Camino del carrascal', size: 's' },
  ],
  blocks: [
    {
      id: 'encinas_oeste',
      label: 'Encinas Oeste',
      cell: 'pitch',
      x: 66,
      y: 116,
      cols: 10,
      units: range('ENC', 40),
    },
    {
      id: 'encinas_este',
      label: 'Encinas Este',
      cell: 'pitch',
      x: 66,
      y: 228,
      cols: 10,
      units: range('ENC', 80).slice(40),
    },
    {
      id: 'carrascal',
      label: 'Parcelas Carrascal',
      cell: 'pitch',
      x: 66,
      y: 432,
      cols: 10,
      units: range('CAR', 30),
    },
    {
      id: 'bungalows_bellota',
      label: 'Bungalows Bellota',
      cell: 'lodging',
      x: 508,
      y: 116,
      cols: 8,
      units: range('BEL', 24),
    },
    {
      id: 'casas_umbria',
      label: 'Casas Umbría',
      cell: 'lodging',
      x: 638,
      y: 506,
      cols: 8,
      units: range('UMB', 16),
    },
  ],
};

export const ballenaPlano: PlanoDescriptor = {
  version: 1,
  decor: [
    { kind: 'enclosure', x: 20, y: 20, w: 900, h: 650 },
    { kind: 'green', x: 36, y: 36, w: 848, h: 74, label: 'Pinar joven · linde norte' },
    { kind: 'road', x: 66, y: 184, w: 726, h: 18 },
    { kind: 'road', x: 66, y: 382, w: 726, h: 18 },
    { kind: 'road', x: 454, y: 108, w: 18, h: 492 },
    {
      kind: 'service',
      x: 64,
      y: 526,
      w: 156,
      h: 68,
      label: 'Recepción de sábado',
      icon: 'reception',
    },
    { kind: 'service', x: 506, y: 224, w: 146, h: 86, label: 'Parque de agua', icon: 'pool' },
    { kind: 'service', x: 674, y: 224, w: 100, h: 64, label: 'Club familiar', icon: 'playground' },
    { kind: 'service', x: 506, y: 426, w: 108, h: 58, label: 'Baños', icon: 'wc' },
    { kind: 'service', x: 638, y: 426, w: 136, h: 58, label: 'Mercado y pan', icon: 'shop' },
    { kind: 'label', x: 690, y: 130, text: 'Entrada escalonada', size: 's' },
  ],
  blocks: [
    {
      id: 'orilla_oeste',
      label: 'Parcelas Orilla Oeste',
      cell: 'pitch',
      x: 66,
      y: 116,
      cols: 11,
      units: range('ORI', 55),
    },
    {
      id: 'orilla_este',
      label: 'Parcelas Orilla Este',
      cell: 'pitch',
      x: 66,
      y: 220,
      cols: 11,
      units: range('ORI', 110).slice(55),
    },
    {
      id: 'brisa',
      label: 'Parcelas Brisa',
      cell: 'pitch',
      x: 66,
      y: 416,
      cols: 10,
      units: range('BRI', 50),
    },
    {
      id: 'olas',
      label: 'Bungalows Ola',
      cell: 'lodging',
      x: 506,
      y: 116,
      cols: 9,
      units: range('OLA', 54),
    },
    {
      id: 'mareas',
      label: 'Mobil-homes Marea',
      cell: 'lodging',
      x: 638,
      y: 510,
      cols: 9,
      units: range('MAR', 36),
    },
  ],
};

export const soldhivernPlano: PlanoDescriptor = {
  version: 1,
  decor: [
    { kind: 'enclosure', x: 20, y: 20, w: 900, h: 650 },
    { kind: 'green', x: 36, y: 36, w: 848, h: 74, label: 'Almendros · linde norte' },
    { kind: 'road', x: 64, y: 190, w: 730, h: 18 },
    { kind: 'road', x: 64, y: 390, w: 730, h: 18 },
    { kind: 'road', x: 458, y: 108, w: 18, h: 492 },
    { kind: 'service', x: 64, y: 526, w: 140, h: 68, label: 'Recepción', icon: 'reception' },
    { kind: 'service', x: 510, y: 224, w: 146, h: 82, label: 'Salón común', icon: 'shop' },
    { kind: 'service', x: 680, y: 224, w: 100, h: 64, label: 'Lavandería', icon: 'wc' },
    { kind: 'service', x: 510, y: 430, w: 112, h: 58, label: 'Bombonas', icon: 'shop' },
    { kind: 'service', x: 646, y: 430, w: 134, h: 58, label: 'Taller camper', icon: 'reception' },
    { kind: 'label', x: 700, y: 132, text: 'Invierno suave', size: 's' },
  ],
  blocks: [
    {
      id: 'llevant_oeste',
      label: 'Parcelas Llevant Oeste',
      cell: 'pitch',
      x: 64,
      y: 116,
      cols: 9,
      units: range('LLE', 45),
    },
    {
      id: 'llevant_este',
      label: 'Parcelas Llevant Este',
      cell: 'pitch',
      x: 64,
      y: 224,
      cols: 9,
      units: range('LLE', 90).slice(45),
    },
    {
      id: 'migdia',
      label: 'Parcelas Migdia',
      cell: 'pitch',
      x: 64,
      y: 424,
      cols: 10,
      units: range('MIG', 80),
    },
    {
      id: 'olivera',
      label: 'Bungalows Olivera',
      cell: 'lodging',
      x: 510,
      y: 116,
      cols: 5,
      units: range('OLI', 20),
    },
    {
      id: 'garbi',
      label: 'Estudios Garbí',
      cell: 'lodging',
      x: 646,
      y: 516,
      cols: 5,
      units: range('GAR', 10),
    },
  ],
};

const activePlano = isSoldhivernScenario
  ? soldhivernPlano
  : isBallenaScenario
    ? ballenaPlano
    : isCarrascaScenario
      ? carrascaPlano
      : isTarongersScenario
        ? tarongersPlano
        : isVinyesScenario
          ? vinyesPlano
          : isSerraltaScenario
            ? serraltaPlano
            : pinadaPlano;

function overlaps(booking: DemoBooking, from: string, to: string): boolean {
  return booking.dateFrom < to && booking.dateTo > from && booking.status !== 'cancelled';
}

function bookingDetail(booking: DemoBooking): BookingDetail {
  const nights = Math.max(
    1,
    Math.round(
      (Date.parse(`${booking.dateTo}T00:00:00Z`) - Date.parse(`${booking.dateFrom}T00:00:00Z`)) /
        DAY_MS,
    ),
  );
  const touristTaxCents = isCarrascaScenario
    ? Math.min(nights, 7) * booking.occupancy.adults * 120
    : isBallenaScenario || isSoldhivernScenario
      ? 0
      : 420;
  return {
    ...booking,
    priceBreakdown: {
      lines: [
        { concept: 'stay', detail: { nights }, amountCents: booking.totalCents - touristTaxCents },
      ],
      totalCents: booking.totalCents,
      touristTaxCents,
      currency: 'EUR',
    },
    touristTaxCents,
    depositCents: Math.round(
      booking.totalCents *
        (isCarrascaScenario ? 0.3 : isBallenaScenario ? 0.25 : isSoldhivernScenario ? 0.15 : 0.35),
    ),
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
      ? [
          {
            id: `pay_${booking.id}`,
            provider: 'manual',
            amountCents: booking.paidCents,
            status: 'succeeded',
            createdAt: booking.createdAt,
          },
        ]
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
    nights: Math.max(
      1,
      Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS),
    ),
    occupancy: typeSpecs.map((type) => ({
      unitTypeId: type.id,
      units: type.count,
      occupiedNights: active.filter((booking) => booking.unitTypeId === type.id).length,
      capacityNights: type.count,
      occupancyPct: Math.round(
        (active.filter((booking) => booking.unitTypeId === type.id).length / type.count) * 100,
      ),
    })),
    bookingValue: { totalCents: total, paidCents: paid, bookings: active.length },
    arrivals: state.bookings.filter((booking) => booking.dateFrom >= from && booking.dateFrom < to)
      .length,
    departures: state.bookings.filter((booking) => booking.dateTo > from && booking.dateTo <= to)
      .length,
  };
}

function convertEnquiry(state: ScenarioState, enquiry: EnquiryItem): DemoBooking {
  const lodgingFallback = typeSpecs.find((type) => type.kind === 'lodging')!.id;
  const requestedType = unitTypes.some((type) => type.id === enquiry.unitTypeId)
    ? enquiry.unitTypeId!
    : lodgingFallback;
  const unit = units.find((candidate) => candidate.code === preferredCodeByType[requestedType])!;
  const index = state.bookings.length + 1;
  const booking: DemoBooking = {
    id: `book_${activeScenarioId}_web_${enquiry.id}`,
    code: `${activeBookingPrefix}-26-${String(index).padStart(4, '0')}`,
    status: 'confirmed',
    channel: 'web',
    dateFrom:
      enquiry.dateFrom ??
      (isSoldhivernScenario ? '2026-11-01' : isBallenaScenario ? iso(15) : iso(18)),
    dateTo:
      enquiry.dateTo ??
      (isSoldhivernScenario ? '2026-12-16' : isBallenaScenario ? iso(22) : iso(24)),
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

  if (method === 'GET' && forcedState === 'loading') {
    await new Promise((resolve) => window.setTimeout(resolve, 1_500));
  }
  if (method === 'GET' && forcedState === 'error' && url.pathname.startsWith('/api/admin/')) {
    return fail(503, 'scenario_forced_error');
  }

  if (method === 'GET' && url.pathname === '/api/admin/enquiries')
    return ok({ items: forcedState === 'empty' ? [] : state.enquiries });
  if (method === 'GET' && url.pathname === '/api/admin/catalog') return ok(catalog);
  if (method === 'GET' && url.pathname === '/api/admin/map') return ok({ plano: activePlano });
  if (method === 'GET' && url.pathname === '/api/admin/settings') {
    const settings: TenantSettings = {
      id: activeScenario.tenantId,
      slug: activeScenarioId,
      name: activeScenario.name,
      tier: isCarrascaScenario || isBallenaScenario || isSoldhivernScenario ? 3 : 2,
      timezone: 'Europe/Madrid',
      currency: 'EUR',
      locales: [...activeScenario.locales],
      modules: { demo: true },
    };
    return ok(settings);
  }
  if (method === 'GET' && url.pathname === '/api/admin/reports') {
    return ok(
      reports(state, url.searchParams.get('from') ?? iso(6), url.searchParams.get('to') ?? iso(7)),
    );
  }
  if (method === 'GET' && url.pathname === '/api/admin/planning') {
    const from = url.searchParams.get('from') ?? iso(1);
    const to = url.searchParams.get('to') ?? iso(31);
    const data: PlanningData = {
      from,
      to,
      unitTypes,
      units,
      seasons: isSoldhivernScenario
        ? [
            {
              id: 'sea_hivern',
              name: 'Invierno suave · estancias mínimas de 45 noches · prioridad 2',
              dateFrom: '2026-01-01',
              dateTo: '2026-04-01',
              priority: 2,
            },
            {
              id: 'sea_entretemps',
              name: 'Entretiempo · prioridad 0',
              dateFrom: '2026-04-01',
              dateTo: '2026-11-01',
              priority: 0,
            },
            {
              id: 'sea_tornada',
              name: 'Vuelta del invierno · estancias mínimas de 45 noches · prioridad 2',
              dateFrom: '2026-11-01',
              dateTo: '2027-01-01',
              priority: 2,
            },
          ]
        : isBallenaScenario
          ? [
              {
                id: 'sea_semanal',
                name: 'Verano por semanas · sábado a sábado · prioridad 2',
                dateFrom: '2026-06-20',
                dateTo: '2026-09-12',
                priority: 2,
              },
            ]
          : isCarrascaScenario
            ? [
                {
                  id: 'sea_verano',
                  name: 'Verano de interior · prioridad 1',
                  dateFrom: '2026-06-15',
                  dateTo: '2026-09-15',
                  priority: 1,
                },
              ]
            : isTarongersScenario
              ? [
                  {
                    id: 'sea_verano',
                    name: 'Verano familiar · prioridad 1',
                    dateFrom: '2026-06-21',
                    dateTo: '2026-09-15',
                    priority: 1,
                  },
                ]
              : isVinyesScenario
                ? [
                    {
                      id: 'sea_verano',
                      name: 'Verano · prioridad 1',
                      dateFrom: '2026-06-01',
                      dateTo: '2026-10-01',
                      priority: 1,
                    },
                    {
                      id: 'sea_vendimia',
                      name: 'Vendimia · prioridad 2',
                      dateFrom: '2026-08-25',
                      dateTo: '2026-10-13',
                      priority: 2,
                    },
                  ]
                : [
                    {
                      id: isSerraltaScenario ? 'sea_cumbre' : 'sea_alta',
                      name: isSerraltaScenario
                        ? 'Agosto · temporada Cumbre'
                        : 'Agosto · temporada alta',
                      dateFrom: iso(1),
                      dateTo: '2026-09-01',
                      priority: 1,
                    },
                  ],
      bookings: state.bookings
        .filter((booking) => overlaps(booking, from, to))
        .map((booking) => ({
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
          id: isSoldhivernScenario
            ? 'block_oli08'
            : isBallenaScenario
              ? 'block_ola18'
              : isTarongersScenario
                ? 'block_aza08'
                : isCarrascaScenario
                  ? 'block_bel08'
                  : isVinyesScenario
                    ? 'block_cal08'
                    : isSerraltaScenario
                      ? 'block_cab08'
                      : 'block_b12',
          unitId: units.find(
            (unit) =>
              unit.code ===
              (isSoldhivernScenario
                ? 'OLI-08'
                : isBallenaScenario
                  ? 'OLA-18'
                  : isTarongersScenario
                    ? 'AZA-08'
                    : isCarrascaScenario
                      ? 'BEL-08'
                      : isVinyesScenario
                        ? 'CAL-08'
                        : isSerraltaScenario
                          ? 'CAB-08'
                          : 'B-12'),
          )!.id,
          unitTypeId: null,
          dateFrom: iso(1),
          dateTo: iso(31),
          reason: 'maintenance',
        },
      ],
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
    if (query)
      items = items.filter((booking) =>
        `${booking.code} ${booking.leadName}`.toLowerCase().includes(query),
      );
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
    const booking =
      status === 'converted' && !enquiry.convertedBookingId ? convertEnquiry(state, enquiry) : null;
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
    if (
      body.action === 'move' &&
      typeof body.dateFrom === 'string' &&
      typeof body.dateTo === 'string'
    ) {
      booking.dateFrom = body.dateFrom;
      booking.dateTo = body.dateTo;
    }
    if (body.action === 'note' && typeof body.notes === 'string') booking.notes = body.notes;
    if (body.action === 'confirm') booking.status = 'confirmed';
    if (body.action === 'cancel') booking.status = 'cancelled';
    if (body.action === 'check_in') booking.checkedInAt = '2026-08-06T12:00:00.000Z';
    if (body.action === 'undo_checkin') booking.checkedInAt = null;
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
    const totalCents = nights * 14400;
    return ok({
      nights,
      totalCents,
      previousTotalCents: booking.totalCents,
      breakdown: {
        lines: [{ concept: 'stay', detail: { nights }, amountCents: totalCents }],
        totalCents,
        touristTaxCents: isCarrascaScenario
          ? Math.min(nights, 7) * 2 * 120
          : isBallenaScenario || isSoldhivernScenario
            ? 0
            : nights * 70,
        currency: 'EUR',
      },
      unitId: body.unitId ?? booking.unitId,
    });
  }
  if (method === 'GET' && url.pathname === '/api/admin/search')
    return ok({ bookings: [], guests: [], units: [] });
  return fail(404, 'scenario_route_not_implemented');
}

export const pinadaFixtureCounts = {
  units: units.length,
  enquiries: baseEnquiries.length,
  bookings: baseBookings().length,
  locales: new Set(baseEnquiries.map((enquiry) => enquiry.locale)).size,
  inactiveUnits: units.filter((unit) => unit.status !== 'active').length,
};

export const serraltaFixtureDefinition = {
  units: serraltaTypeSpecs.reduce((sum, type) => sum + type.count, 0),
  typeCount: serraltaTypeSpecs.length,
  locales: ['es', 'fr', 'de', 'en'] as const,
  inactiveUnit: 'CAB-08',
};

export const vinyesFixtureDefinition = {
  units: vinyesTypeSpecs.reduce((sum, type) => sum + type.count, 0),
  typeCount: vinyesTypeSpecs.length,
  locales: ['es'] as const,
  inactiveUnit: 'CAL-08',
  overlappingSeasons: ['sea_verano', 'sea_vendimia'] as const,
};

export const tarongersFixtureDefinition = {
  units: tarongersTypeSpecs.reduce((sum, type) => sum + type.count, 0),
  typeCount: tarongersTypeSpecs.length,
  locales: ['es'] as const,
  inactiveUnit: 'AZA-08',
  enquiryFocus: ['edades', 'sombra'] as const,
};

export const carrascaFixtureDefinition = {
  units: carrascaTypeSpecs.reduce((sum, type) => sum + type.count, 0),
  typeCount: carrascaTypeSpecs.length,
  locales: ['es'] as const,
  inactiveUnit: 'BEL-08',
  touristTax: { adultCents: 120, maxNights: 7 } as const,
  cancellationDays: [14, 7, 0] as const,
};

export const ballenaFixtureDefinition = {
  units: ballenaTypeSpecs.reduce((sum, type) => sum + type.count, 0),
  typeCount: ballenaTypeSpecs.length,
  locales: ['es'] as const,
  inactiveUnit: 'OLA-18',
  weeklyRotation: { minStay: 7, arrivalDays: [6] as const },
};

export const soldhivernFixtureDefinition = {
  units: soldhivernTypeSpecs.reduce((sum, type) => sum + type.count, 0),
  typeCount: soldhivernTypeSpecs.length,
  locales: ['es'] as const,
  inactiveUnit: 'OLI-08',
  longStay: { minStay: 45, typicalNights: [60, 75, 90] as const },
};
