/**
 * Seed demo — Camping Cala Sereno (ficticio).
 * Generador PURO y DETERMINISTA: misma fecha ancla → mismo resultado.
 * Fechas relativas al ancla (año de la temporada en curso) → preparado
 * para el reset nocturno de la Fase 10. Emite sentencias SQL.
 */
import type { ContactInfo, Occupancy, PriceBreakdown, PriceLine } from '@logic-camp/db/schema';
import { buildDemoPlano } from './plano';

// ---------- utilidades deterministas ----------

/** PRNG determinista (mulberry32) — nada de Math.random en el seed */
function rng(seedNum: number) {
  let a = seedNum >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (isoDate: string, days: number) => {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return iso(d);
};
/**
 * Credenciales del visitante anónimo de la demo (ADR 0029 §4).
 *
 * Las usa `worker.ts` para abrir sesión en nombre de quien pulsa "Ver la demo",
 * y por eso NO viajan en el bundle del dashboard: el navegador pide la puerta,
 * el Worker la abre. La contraseña es la misma de siempre (`calasereno`, ya
 * documentada en el README); su hash scrypt está junto a los usuarios, abajo.
 */
export const DEMO_LOGIN = { email: 'demo@calasereno.example', password: 'calasereno' } as const;

export const nightsBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);

const q = (v: unknown): string => {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? '1' : '0';
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  return `'${s.replace(/'/g, "''")}'`;
};

// ---------- tipos del seed ----------

type Row = Record<string, unknown>;

// Tablas tipadas: la web pública las consume en build (tenants/demo/data.ts)
// — misma fuente de verdad que la D1, tarifas y fichas no pueden divergir.
export type SeedSeason = {
  id: string;
  tenant_id: string;
  name: string;
  date_from: string;
  date_to: string;
  priority: number;
  is_open: boolean;
};
export type SeedUnitType = {
  id: string;
  tenant_id: string;
  kind: 'pitch' | 'lodging';
  name_i18n: { es: string; en: string };
  capacity_min: number;
  capacity_max: number;
  included_persons: number;
  features: {
    m2?: number;
    electricityAmps?: number;
    shade?: string;
    pets?: boolean;
    beds?: number;
    bathrooms?: number;
    airCon?: boolean;
  };
  photos: string[];
};
export type SeedRatePlan = {
  id: string;
  tenant_id: string;
  unit_type_id: string;
  season_id: string;
  base_cents: number;
  extra_person_cents: number;
  child_cents: number;
  pet_cents: number;
  electricity_cents: number;
  vehicle_cents: number;
  min_stay: number;
  max_stay: number | null;
  arrival_days: number[] | null;
  departure_days: number[] | null;
};
export type SeedExtra = {
  id: string;
  tenant_id: string;
  name_i18n: { es: string; en: string };
  price_cents: number;
  per: 'person' | 'stay' | 'night';
  required: boolean;
};

export type SeedData = {
  anchor: string;
  tenants: Row[];
  seasons_calendar: SeedSeason[];
  unit_types: SeedUnitType[];
  units: Row[];
  rate_plans: SeedRatePlan[];
  rate_rules: Row[];
  extras: SeedExtra[];
  inventory_blocks: Row[];
  enquiries: Row[];
  bookings: (Row & {
    id: string;
    unit_id: string | null;
    status: string;
    date_from: string;
    date_to: string;
    total_cents: number;
    paid_cents: number;
    price_breakdown: PriceBreakdown;
  })[];
  guests: Row[];
  booking_guests: Row[];
  payments: (Row & { booking_id: string; amount_cents: number })[];
  users: Row[];
  accounts: Row[];
};

// ---------- generador ----------

/**
 * @param anchorYear año de la temporada "en curso" del seed (las fechas se derivan de él)
 */
export function generateSeed(anchorYear: number): SeedData {
  const rand = rng(anchorYear * 7919);
  const Y = anchorYear;
  const anchor = `${Y}-07-15`; // mitad de la temporada alta
  const T = 'ten_calasereno';
  const now = `${anchor}T08:00:00.000Z`;

  // --- temporadas: solapadas, resueltas por prioridad ---
  const seasons = [
    {
      id: 'sea_apertura',
      name: 'Apertura',
      date_from: `${Y}-03-15`,
      date_to: `${Y}-11-01`,
      priority: 0,
      is_open: true,
    },
    {
      id: 'sea_media',
      name: 'Temporada media',
      date_from: `${Y}-06-01`,
      date_to: `${Y}-09-15`,
      priority: 10,
      is_open: true,
    },
    {
      id: 'sea_alta',
      name: 'Temporada alta',
      date_from: `${Y}-07-01`,
      date_to: `${Y}-08-31`,
      priority: 20,
      is_open: true,
    },
  ];

  // --- tipos: 4 de parcela (60 uds), 3 de bungalow (18), 1 glamping (5) ---
  const unitTypeDefs = [
    {
      id: 'ut_std',
      kind: 'pitch',
      es: 'Parcela Estándar',
      en: 'Standard Pitch',
      capMax: 6,
      incl: 2,
      count: 24,
      m2: 70,
      elec: 6,
      shade: 'parcial',
      base: [1800, 2600, 3800],
    },
    {
      id: 'ut_conf',
      kind: 'pitch',
      es: 'Parcela Confort',
      en: 'Comfort Pitch',
      capMax: 6,
      incl: 2,
      count: 18,
      m2: 90,
      elec: 10,
      shade: 'total',
      base: [2400, 3300, 4600],
    },
    {
      id: 'ut_prem',
      kind: 'pitch',
      es: 'Parcela Premium Mar',
      en: 'Premium Sea Pitch',
      capMax: 6,
      incl: 2,
      count: 10,
      m2: 100,
      elec: 16,
      shade: 'total',
      base: [3000, 4200, 5900],
    },
    {
      id: 'ut_moto',
      kind: 'pitch',
      es: 'Parcela Autocaravana',
      en: 'Motorhome Pitch',
      capMax: 4,
      incl: 2,
      count: 8,
      m2: 80,
      elec: 10,
      shade: 'parcial',
      base: [2200, 3000, 4200],
    },
    {
      id: 'ut_bung4',
      kind: 'lodging',
      es: 'Bungalow 4 pax',
      en: 'Bungalow 4 pax',
      capMax: 4,
      incl: 4,
      count: 8,
      beds: 3,
      baths: 1,
      base: [7500, 10500, 15500],
    },
    {
      id: 'ut_bung6',
      kind: 'lodging',
      es: 'Bungalow 6 pax Vista Mar',
      en: 'Sea View Bungalow 6 pax',
      capMax: 6,
      incl: 6,
      count: 6,
      beds: 4,
      baths: 2,
      base: [9500, 13500, 19500],
    },
    {
      id: 'ut_mobil',
      kind: 'lodging',
      es: 'Mobil-home 5 pax',
      en: 'Mobile home 5 pax',
      capMax: 5,
      incl: 5,
      count: 4,
      beds: 3,
      baths: 1,
      base: [8200, 11500, 16800],
    },
    {
      id: 'ut_glamp',
      kind: 'lodging',
      es: 'Tienda Glamping',
      en: 'Glamping Tent',
      capMax: 4,
      incl: 2,
      count: 5,
      beds: 2,
      baths: 0,
      base: [6000, 8500, 12500],
    },
  ] as const;

  const unit_types: SeedUnitType[] = unitTypeDefs.map((d) => ({
    id: d.id,
    tenant_id: T,
    kind: d.kind,
    name_i18n: { es: d.es, en: d.en },
    capacity_min: 1,
    capacity_max: d.capMax,
    included_persons: d.incl,
    features:
      d.kind === 'pitch'
        ? {
            m2: (d as { m2: number }).m2,
            electricityAmps: (d as { elec: number }).elec,
            shade: (d as { shade: string }).shade,
            pets: true,
          }
        : {
            beds: (d as { beds: number }).beds,
            bathrooms: (d as { baths: number }).baths,
            pets: d.id === 'ut_mobil',
            airCon: d.id !== 'ut_glamp',
          },
    photos: [],
  }));

  const units: Row[] = [];
  const prefixes: Record<string, string> = {
    ut_std: 'A',
    ut_conf: 'B',
    ut_prem: 'C',
    ut_moto: 'D',
    ut_bung4: 'BG',
    ut_bung6: 'BM',
    ut_mobil: 'MH',
    ut_glamp: 'GL',
  };
  for (const d of unitTypeDefs) {
    for (let i = 1; i <= d.count; i++) {
      units.push({
        id: `unt_${d.id.slice(3)}_${String(i).padStart(2, '0')}`,
        tenant_id: T,
        unit_type_id: d.id,
        code: `${prefixes[d.id]}-${String(i).padStart(2, '0')}`,
        attributes: {},
        status: 'active',
      });
    }
  }

  // --- planes: un plan por tipo × temporada ---
  const rate_plans: SeedRatePlan[] = [];
  unitTypeDefs.forEach((d) => {
    seasons.forEach((s, si) => {
      rate_plans.push({
        id: `rp_${d.id.slice(3)}_${s.id.slice(4)}`,
        tenant_id: T,
        unit_type_id: d.id,
        season_id: s.id,
        base_cents: d.base[si]!,
        extra_person_cents: d.kind === 'pitch' ? [450, 550, 700][si]! : 0,
        child_cents: d.kind === 'pitch' ? [300, 350, 450][si]! : 0,
        pet_cents: 350,
        electricity_cents: d.kind === 'pitch' ? 550 : 0,
        vehicle_cents: d.kind === 'pitch' ? 400 : 0,
        min_stay:
          s.id === 'sea_alta' ? (d.kind === 'lodging' ? 7 : 3) : s.id === 'sea_media' ? 2 : 1,
        max_stay: null,
        arrival_days: s.id === 'sea_alta' && d.kind === 'lodging' ? [6] : null, // solo sábados
        departure_days: null,
      });
    });
  });

  const rate_rules: Row[] = [
    {
      id: 'rr_early',
      tenant_id: T,
      type: 'early_booking',
      conditions: { minDaysAhead: 60 },
      discount: { type: 'percent', value: 10 },
      stackable: false,
      priority: 10,
    },
    {
      id: 'rr_long',
      tenant_id: T,
      type: 'long_stay',
      conditions: { minNights: 14 },
      discount: { type: 'percent', value: 8 },
      stackable: true,
      priority: 20,
    },
    {
      id: 'rr_acsi',
      tenant_id: T,
      type: 'acsi',
      conditions: { card: 'acsi', seasons: ['sea_apertura'] },
      discount: { type: 'percent', value: 20 },
      stackable: false,
      priority: 5,
    },
  ];

  const extrasDefs = [
    ['ext_sabanas', 'Ropa de cama', 'Bed linen', 900, 'person', false],
    ['ext_toallas', 'Toallas', 'Towels', 500, 'person', false],
    ['ext_limpieza', 'Limpieza final', 'Final cleaning', 4500, 'stay', true],
    ['ext_nevera', 'Nevera parcela', 'Fridge', 400, 'night', false],
    ['ext_parking2', 'Segundo vehículo', 'Second vehicle', 400, 'night', false],
    ['ext_late', 'Late checkout', 'Late checkout', 1500, 'stay', false],
    ['ext_cuna', 'Cuna bebé', 'Baby cot', 300, 'night', false],
    ['ext_trona', 'Trona', 'High chair', 150, 'night', false],
    ['ext_bbq', 'Kit barbacoa', 'BBQ kit', 800, 'stay', false],
    ['ext_wifi', 'WiFi premium', 'Premium WiFi', 300, 'night', false],
    ['ext_hielo', 'Bolsa de hielo diaria', 'Daily ice bag', 200, 'night', false],
    ['ext_pack', 'Pack bienvenida', 'Welcome pack', 1200, 'stay', false],
  ] as const;
  const extras: SeedExtra[] = extrasDefs.map(([id, es, en, price, per, required]) => ({
    id,
    tenant_id: T,
    name_i18n: { es, en },
    price_cents: price,
    per,
    required,
  }));

  // --- bloqueos: mantenimiento + larga estancia (caso límite 6 del motor) ---
  const inventory_blocks: Row[] = [
    {
      id: 'blk_maint1',
      tenant_id: T,
      unit_id: 'unt_bung4_03',
      unit_type_id: null,
      date_from: `${Y}-07-10`,
      date_to: `${Y}-07-17`,
      reason: 'maintenance',
    },
    {
      id: 'blk_maint2',
      tenant_id: T,
      unit_id: 'unt_std_11',
      unit_type_id: null,
      date_from: `${Y}-06-20`,
      date_to: `${Y}-06-27`,
      reason: 'maintenance',
    },
    {
      id: 'blk_long1',
      tenant_id: T,
      unit_id: 'unt_std_24',
      unit_type_id: null,
      date_from: `${Y}-04-01`,
      date_to: `${Y}-10-01`,
      reason: 'longstay',
    },
    {
      id: 'blk_long2',
      tenant_id: T,
      unit_id: 'unt_conf_18',
      unit_type_id: null,
      date_from: `${Y}-05-01`,
      date_to: `${Y}-09-30`,
      reason: 'longstay',
    },
  ];

  // --- reservas: 40 con casos límite; ocupación por unidad sin solapes activos ---
  type BookingSeed = SeedData['bookings'][number];
  const bookings: BookingSeed[] = [];
  const payments: SeedData['payments'] = [];
  const guests: Row[] = [];
  const booking_guests: Row[] = [];
  /** por unidad: rangos ocupados por reservas ACTIVAS (from,to exclusive) */
  const occupied = new Map<string, [string, string][]>();
  const overlaps = (a: [string, string], b: [string, string]) => a[0] < b[1] && b[0] < a[1];

  const firstNames = [
    'María',
    'Jan',
    'Sophie',
    'Luca',
    'Emma',
    'Pierre',
    'Anna',
    'Tom',
    'Carmen',
    'Lars',
    'Julia',
    'David',
    'Nina',
    'Paul',
    'Sara',
    'Marc',
    'Lena',
    'Hugo',
    'Eva',
    'Jordi',
    // Segunda veintena (sesión 53): con 20 × 20 y ~2000 huéspedes, cada pareja
    // nombre+apellido salía 5 veces, y ordenada por apellido la lista enseñaba
    // bloques de cinco filas idénticas — que se leen como un fallo de datos.
    // 40 × 40 baja la repetición a ~1,3. Sin acentos a propósito: el correo se
    // deriva del nombre y no queremos meter más partes locales no ASCII.
    'Bram',
    'Matteo',
    'Greta',
    'Antoine',
    'Laia',
    'Finn',
    'Rosa',
    'Mads',
    'Klara',
    'Alvaro',
    'Elke',
    'Guillem',
    'Iris',
    'Thomas',
    'Manon',
    'Pau',
    'Ingrid',
    'Vicent',
    'Nadia',
    'Bruno',
  ];
  const lastNames = [
    'García',
    'de Vries',
    'Martin',
    'Rossi',
    'Müller',
    'Dubois',
    'Jansen',
    'Smith',
    'López',
    'Nielsen',
    'Weber',
    'Ferrer',
    'Bakker',
    'Laurent',
    'Serra',
    'Klein',
    'Moreau',
    'Costa',
    'Peeters',
    'Vidal',
    'Navarro',
    'Bianchi',
    'Schmidt',
    'Visser',
    'Andersen',
    'Roca',
    'Fischer',
    'Mercier',
    'Conti',
    'Jensen',
    'Blanco',
    'Dekker',
    'Bernard',
    'Ricci',
    'Hoffmann',
    'Puig',
    'Larsen',
    'Sanz',
    'Meyer',
    'Vermeer',
    // De 40 a 160 (sesión 54). Con 40 apellidos y ~1 500 fichas tocaban a 38
    // por apellido, y `/clientes` se ordena por apellido: la primera página
    // entera salía "Andersen" — mismo defecto que las 20 personas repetidas de
    // la sesión 53, solo que en la columna de al lado. Con 160 tocan a ~9, que
    // es lo que se ve en un listado de verdad: dos o tres hermanos seguidos,
    // no media pantalla.
    'Romero', 'Iglesias', 'Molina', 'Ortega', 'Delgado', 'Castro', 'Rubio',
    'Marín', 'Santos', 'Cabrera', 'Reyes', 'Gallego', 'Lorenzo', 'Vargas',
    'Bruguera', 'Fabra', 'Estellés', 'Salvador', 'Beltrán', 'Balaguer',
    'Cardona', 'Company', 'Fuster', 'Llopis', 'Mestre', 'Ribes', 'Solé',
    'Tarragó', 'Vilanova', 'Bonet',
    'Girard', 'Lefevre', 'Roux', 'Fournier', 'Chevalier', 'Perrin', 'Marchand',
    'Renaud', 'Bourgeois', 'Guillaume', 'Colin', 'Poirier', 'Leclerc', 'Menard',
    'Becker', 'Wagner', 'Schulz', 'Richter', 'Neumann', 'Zimmermann', 'Braun',
    'Krüger', 'Hartmann', 'Werner', 'Lange', 'König', 'Vogel', 'Winkler',
    'Smit', 'Meijer', 'Boer', 'Mulder', 'Bos', 'Vos', 'Kok', 'Willems',
    'Hendriks', 'Maas', 'Verhoeven', 'Kuipers', 'Prins', 'Blom',
    'Ferrari', 'Esposito', 'Romano', 'Colombo', 'Greco', 'Marino', 'Gallo',
    'Rizzo', 'Lombardi', 'Moretti', 'Barbieri', 'Fontana', 'Caruso',
    'Taylor', 'Walker', 'Clarke', 'Hughes', 'Bennett', 'Wright', 'Harris',
    'Palmer', 'Cooper', 'Ward', 'Ellis', 'Barnes', 'Hayes',
    'Sørensen', 'Pedersen', 'Kristensen', 'Madsen', 'Rasmussen', 'Lund',
    'Berg', 'Holm', 'Dahl', 'Lindqvist', 'Nyström', 'Åkesson',
    'Novak', 'Kowalski', 'Horvat', 'Kovács', 'Szabó', 'Marek', 'Dvořák',
    'Almeida', 'Carvalho', 'Teixeira', 'Fonseca',
  ];
  /** Los de `firstNames` que son de mujer — de aquí sale el sexo del parte de viajeros. */
  const nombresFemeninos = new Set([
    'María', 'Sophie', 'Emma', 'Anna', 'Carmen', 'Julia', 'Nina', 'Sara', 'Lena',
    'Eva', 'Greta', 'Laia', 'Rosa', 'Klara', 'Elke', 'Iris', 'Manon', 'Ingrid', 'Nadia',
  ]);
  const locales = ['es', 'es', 'fr', 'de', 'nl', 'en', 'ca'];

  const seasonFor = (date: string) =>
    [...seasons]
      .sort((a, b) => b.priority - a.priority)
      .find((s) => date >= s.date_from && date < s.date_to) ?? seasons[0]!;

  const planFor = (typeId: string, seasonId: string) =>
    rate_plans.find((p) => p.unit_type_id === typeId && p.season_id === seasonId)!;

  function makeBreakdown(
    typeId: string,
    from: string,
    to: string,
    occ: Occupancy,
    pets: number,
  ): PriceBreakdown {
    const lines: PriceLine[] = [];
    // precio por tramos si cruza temporadas (caso límite 1)
    let d = from;
    while (d < to) {
      const s = seasonFor(d);
      let end = to;
      // el tramo termina donde cambie la temporada efectiva
      let probe = d;
      while (probe < to && seasonFor(probe).id === s.id) probe = addDays(probe, 1);
      end = probe;
      const nights = nightsBetween(d, end);
      const plan = planFor(typeId, s.id);
      const base = plan.base_cents as number;
      lines.push({
        concept: 'price.base',
        detail: { season: s.name, nights, perNight: base },
        amountCents: base * nights,
      });
      const typeDef = unitTypeDefs.find((t) => t.id === typeId)!;
      const extraAdults = Math.max(0, occ.adults - typeDef.incl);
      const children = occ.childrenAges.length;
      if (typeDef.kind === 'pitch') {
        if (extraAdults > 0)
          lines.push({
            concept: 'price.extra_person',
            detail: { season: s.name, nights, persons: extraAdults },
            amountCents: (plan.extra_person_cents as number) * extraAdults * nights,
          });
        if (children > 0)
          lines.push({
            concept: 'price.child',
            detail: { season: s.name, nights, children },
            amountCents: (plan.child_cents as number) * children * nights,
          });
        lines.push({
          concept: 'price.electricity',
          detail: { season: s.name, nights },
          amountCents: (plan.electricity_cents as number) * nights,
        });
      }
      if (pets > 0)
        lines.push({
          concept: 'price.pet',
          detail: { season: s.name, nights, pets },
          amountCents: (plan.pet_cents as number) * pets * nights,
        });
      d = end;
    }
    const nights = nightsBetween(from, to);
    // tasa turística CV (ficticia demo): 100c adulto/noche, exentos <16
    const taxable = occ.adults + occ.childrenAges.filter((a) => a >= 16).length;
    const touristTaxCents = taxable * 100 * nights;
    const totalCents = lines.reduce((s, l) => s + l.amountCents, 0);
    return { lines, totalCents, touristTaxCents, currency: 'EUR' };
  }

  let bkgN = 0;
  let gstN = 0;

  /**
   * Huéspedes que REPITEN — la memoria comercial del camping (sesión 54).
   *
   * Hasta ahora el generador creaba un huésped nuevo por reserva: las 2 000
   * fichas de `/clientes` valían todas "1 reserva" y el historial de la ficha
   * tenía siempre una sola estancia. O sea, lo único que esa pantalla vende —el
   * cliente que vuelve cada agosto— no se veía nunca en la demo.
   *
   * Una parte de las nuevas fichas entra en este censo de "habituales" y una
   * parte de las reservas posteriores reutiliza una de ellas, con dos reglas
   * que evitan datos falsos:
   *
   *  - **tope de estancias por ficha** (`REPEAT_SHAPE`): sin él, las ~670
   *    reutilizaciones se acumularían en las primeras fichas del censo y
   *    saldrían familias con ocho estancias en una sola temporada.
   *  - **holgura de 7 días entre estancias**: dos estancias que no se solapan
   *    pero se tocan (sale el 9, entra el 10) se leen como un fallo de datos,
   *    no como un cliente que vuelve.
   *
   * La decisión de reutilizar NO consume del PRNG: sale de la aritmética de
   * `bkgN`, igual que el resto de rasgos del huésped. Es deliberado — el
   * relleno por curva de temporada (ocupación, precios, invariante 1) queda
   * byte a byte como estaba, y el único diff del seed son las fichas.
   */
  type Habitual = { id: string; locale: string; stays: [string, string][]; cap: number };
  const habituales: Habitual[] = [];
  /** cursor rotatorio: reparte las reutilizaciones por todo el censo, no por la cabeza */
  let habCursor = 0;
  /** holgura mínima entre dos estancias de la misma ficha, en días */
  const REPEAT_GAP_DAYS = 7;
  /**
   * Cuántas estancias llega a tener una ficha habitual, sorteado por `bkgN % 10`.
   * La forma importa tanto como el hecho de que repitan: si todas las que vuelven
   * tuvieran el mismo número de estancias, la lista volvería a delatarse como
   * generada — el mismo defecto que "todas tienen 1", solo que con otro número.
   * La mayoría vuelve una segunda vez; unos pocos son los fijos de la casa.
   */
  const REPEAT_SHAPE = [2, 2, 2, 2, 2, 2, 3, 3, 3, 4] as const;

  /** Devuelve la ficha que reutiliza esta reserva, o `null` si toca una nueva. */
  function pickHabitual(from: string, to: string): Habitual | null {
    // 1 de cada 3 reservas intenta reutilizar; el resto estrena ficha.
    if (bkgN % 3 !== 1 || habituales.length === 0) return null;
    const holgadoDesde = addDays(from, -REPEAT_GAP_DAYS);
    const holgadoHasta = addDays(to, REPEAT_GAP_DAYS);
    // Barrido acotado: si en 12 candidatos no hay ninguno libre en estas fechas,
    // sale ficha nueva. Recorrer el censo entero por cada reserva no compra nada
    // (el seed corre en cada reset nocturno) y el reparto ya lo da el cursor.
    for (let k = 0; k < Math.min(12, habituales.length); k++) {
      habCursor = (habCursor + 1) % habituales.length;
      const cand = habituales[habCursor]!;
      if (cand.stays.length >= cand.cap) continue;
      if (cand.stays.some(([f, t]) => holgadoDesde < t && f < holgadoHasta)) continue;
      return cand;
    }
    return null;
  }

  /**
   * Ficha nueva. Todos los rasgos derivan de `bkgN` — determinista y sin PRNG.
   * Una de cada cuatro entra en el censo de habituales con su tope de estancias.
   */
  function addGuest(locale: string, from: string, to: string): string {
    gstN++;
    const gid = `gst_${String(gstN).padStart(3, '0')}`;
    // Nombre y apellido: NO dos módulos sobre `bkgN`, sino un recorrido del
    // espacio de parejas. Dos módulos sobre el mismo contador es justo lo que
    // hundió el seed en la sesión 53 (`bkgN % 20` y `(bkgN * 3) % 20` quedan
    // ambos determinados por `bkgN % 20`: 20 personas para 2 000 fichas), y
    // repararlo con "otro ritmo" solo aplaza el problema — dos ritmos con un
    // factor común vuelven a ser uno.
    //
    // Aquí se numeran las 40 × 161 = 6 440 parejas posibles y se recorren a
    // saltos de 2 371, que es primo y por tanto coprimo con 6 440: el recorrido
    // pasa por TODAS las parejas antes de repetir ninguna. Como las fichas son
    // ~1 500, la consecuencia es una garantía, no una estadística: **no puede
    // haber dos clientes que se llamen igual**. Se comprueba en el test.
    const PARES = firstNames.length * lastNames.length;
    const par = (gstN * 2371) % PARES;
    const fn = firstNames[par % firstNames.length]!;
    const ln = lastNames[Math.floor(par / firstNames.length)]!;
    const nationality = locale === 'es' || locale === 'ca' ? 'ES' : locale.toUpperCase();
    // Datos del parte de viajeros (ADR 0028), sembrados de verdad (cero mocks): los
    // huéspedes españoles llevan DNI con su nº de soporte; los extranjeros, pasaporte
    // (que ni exige soporte ni segundo apellido). ~1 de cada 6 deja un dato del parte
    // sin rellenar, para que la pantalla enseñe también el estado "faltan datos".
    const isSpanish = nationality === 'ES';
    const faltaDato = bkgN % 6 === 0;
    guests.push({
      id: gid,
      tenant_id: T,
      name: fn,
      surname: ln,
      second_surname: isSpanish ? lastNames[Math.floor(bkgN / 3) % lastNames.length]! : null,
      // El sexo sale del NOMBRE, no de `bkgN % 2`. Hasta la sesión 54 salía del
      // contador, que es el mismo del que salía el nombre: "María" quedaba
      // marcada M en todas sus fichas. En una lista de clientes es feo; en el
      // parte de viajeros, que es un documento con valor legal, es un dato falso.
      sex: nombresFemeninos.has(fn) ? 'F' : 'M',
      doc_type: isSpanish ? 'dni' : 'passport',
      doc_number: isSpanish
        ? `${10000000 + ((bkgN * 137) % 89999999)}Z`
        : `X${String(1000000 + bkgN * 137)}`,
      doc_support_number: isSpanish ? (faltaDato ? null : `BAA${String(100000 + bkgN * 71)}`) : null,
      kinship: null,
      birthdate: `${1960 + (bkgN % 40)}-0${1 + (bkgN % 9)}-15`,
      nationality,
      // Único porque la pareja nombre+apellido lo es (ver el recorrido de arriba);
      // dos fichas con el mismo correo se leerían en `/clientes` como un duplicado
      // pendiente de fusionar. Hay test.
      email: `${fn.toLowerCase()}.${ln.toLowerCase().replace(/ /g, '')}@example.com`,
      phone: `+34 6${String(10000000 + bkgN * 9137)}`,
      address: null,
      gdpr_consent_at: now,
    });
    // El tope se sortea con el TAMAÑO DEL CENSO, no con `bkgN`: la ficha entra
    // aquí cuando `bkgN % 4 === 0`, así que `bkgN` es siempre par y `bkgN % 10`
    // nunca alcanzaría los índices impares de la forma (el tope 4 no salía
    // jamás). Es la trampa de la sesión 53 otra vez: dos módulos que comparten
    // factor no son dos ritmos, son uno.
    if (bkgN % 4 === 0)
      habituales.push({
        id: gid,
        locale,
        stays: [[from, to]],
        cap: REPEAT_SHAPE[habituales.length % REPEAT_SHAPE.length]!,
      });
    return gid;
  }

  function addBooking(opts: {
    typeId: string;
    unitIdx?: number | null;
    /** fuerza una unidad concreta (el relleno por curva recorre unidad a unidad) */
    unitId?: string;
    from: string;
    to: string;
    status: BookingSeed['status'] extends string ? string : string;
    channel?: string;
    occ?: Occupancy;
    pets?: number;
    notes?: string | null;
    paidRatio?: number;
  }) {
    bkgN++;
    const id = `bkg_${String(bkgN).padStart(3, '0')}`;
    const occ: Occupancy = opts.occ ?? {
      adults: 2,
      childrenAges: [],
      pets: opts.pets ?? 0,
      vehicles: 1,
    };
    const typeUnits = units.filter((u) => u.unit_type_id === opts.typeId);
    let unit_id: string | null = null;
    const isActiveStatus =
      opts.status === 'confirmed' || opts.status === 'pending' || opts.status === 'completed';
    if (opts.unitId) {
      // unidad forzada: el llamante ya garantizó que está libre en el rango
      unit_id = opts.unitId;
      if (isActiveStatus) {
        const ranges = occupied.get(unit_id) ?? [];
        occupied.set(unit_id, [...ranges, [opts.from, opts.to]]);
      }
    } else if (opts.unitIdx !== null) {
      // asignación: primera unidad del tipo libre en el rango (solo reservas activas ocupan)
      const range: [string, string] = [opts.from, opts.to];
      const isActive =
        opts.status === 'confirmed' || opts.status === 'pending' || opts.status === 'completed';
      for (const u of typeUnits) {
        const uid = u.id as string;
        const ranges = occupied.get(uid) ?? [];
        if (!ranges.some((r) => overlaps(r, range))) {
          unit_id = uid;
          if (isActive) occupied.set(uid, [...ranges, range]);
          break;
        }
      }
    }
    const breakdown = makeBreakdown(opts.typeId, opts.from, opts.to, occ, occ.pets);
    const total = breakdown.totalCents;
    const paid = Math.round(total * (opts.paidRatio ?? (opts.status === 'cancelled' ? 0 : 0.3)));
    // ¿Vuelve alguien, o es gente nueva? El idioma de la reserva lo manda la
    // ficha cuando se reutiliza: la nacionalidad del huésped ya está grabada y
    // una reserva en francés a nombre de un titular español sería incoherente.
    const repite = pickHabitual(opts.from, opts.to);
    const locale = repite ? repite.locale : locales[bkgN % locales.length]!;
    const gid = repite ? repite.id : addGuest(locale, opts.from, opts.to);
    if (repite) repite.stays.push([opts.from, opts.to]);
    booking_guests.push({ booking_id: id, guest_id: gid, is_lead: true });
    // Check-in de demostración (ADR 0022): las confirmadas que están EN CASA en el
    // ancla del seed (Y-07-15, el "hoy" del seed) ya hicieron check-in — salvo ~1
    // de cada 5, que "solo tiene reserva, no ha llegado". Así el planning y el plano
    // enseñan la mezcla "en casa / confirmada / entra hoy" sin un mock en el cliente.
    // Puro: solo depende de anchorYear (el reset nocturno depende del determinismo).
    const inHouseAtAnchor = opts.status === 'confirmed' && opts.from <= anchor && anchor < opts.to;
    const checkedIn = inHouseAtAnchor && bkgN % 5 !== 0;
    bookings.push({
      id,
      tenant_id: T,
      code: `CS-${Y}-${String(bkgN).padStart(4, '0')}`,
      status: opts.status,
      channel: opts.channel ?? 'web',
      date_from: opts.from,
      date_to: opts.to,
      unit_type_id: opts.typeId,
      unit_id,
      occupancy: occ,
      extras: [],
      price_breakdown: breakdown,
      total_cents: total,
      paid_cents: paid,
      tourist_tax_cents: breakdown.touristTaxCents,
      deposit_cents: opts.typeId.startsWith('ut_bung') || opts.typeId === 'ut_mobil' ? 10000 : 0,
      notes: opts.notes ?? null,
      checked_in_at: checkedIn ? `${anchor}T09:30:00.000Z` : null,
      checked_out_at: null,
      // Forma de pago de la operación para el parte de viajeros (ADR 0028): sembrada
      // rotando entre los cuatro medios; ~1 de cada 6 se deja sin fijar, para que la
      // pantalla del parte muestre el aviso "falta forma de pago" sin un mock.
      payment_kind: bkgN % 6 === 3 ? null : (['card', 'cash', 'transfer', 'platform'] as const)[bkgN % 4],
      locale,
      created_at: now,
      updated_at: now,
    });
    if (paid > 0) {
      payments.push({
        id: `pay_${String(bkgN).padStart(3, '0')}a`,
        booking_id: id,
        provider: 'stripe',
        provider_ref: `pi_demo_${bkgN}`,
        amount_cents: paid,
        status: 'succeeded',
        raw: null,
        created_at: now,
      });
    }
    return id;
  }

  // Casos límite explícitos
  addBooking({
    typeId: 'ut_bung6',
    from: `${Y}-06-25`,
    to: `${Y}-07-05`,
    status: 'confirmed',
    notes: 'Cruza temporada media→alta (precio por tramos)',
  });
  addBooking({
    typeId: 'ut_std',
    from: `${Y}-05-02`,
    to: `${Y}-05-30`,
    status: 'completed',
    occ: { adults: 2, childrenAges: [], pets: 1, vehicles: 1 },
    paidRatio: 1,
    notes: 'Estancia larga 28 noches con mascota',
  });
  addBooking({
    typeId: 'ut_conf',
    from: `${Y}-07-19`,
    to: `${Y}-07-26`,
    status: 'confirmed',
    occ: { adults: 4, childrenAges: [3, 8, 12, 15], pets: 0, vehicles: 2 },
    notes: 'Grupo familiar 8 pax — niño de 3 años exento de tasa',
  });
  addBooking({
    typeId: 'ut_bung4',
    from: `${Y}-08-02`,
    to: `${Y}-08-09`,
    status: 'cancelled',
    paidRatio: 0.5,
    notes: 'Cancelada con señal pagada',
  });
  addBooking({
    typeId: 'ut_glamp',
    from: `${Y}-07-12`,
    to: `${Y}-07-14`,
    status: 'no_show',
    paidRatio: 0.3,
    notes: 'No-show',
  });
  addBooking({
    typeId: 'ut_bung4',
    unitIdx: null,
    from: `${Y}-08-16`,
    to: `${Y}-08-23`,
    status: 'confirmed',
    notes: 'Sin unidad asignada — para probar asignación',
  });

  // --- Relleno por CURVA DE TEMPORADA (ADR 0019 §2) ---------------------------
  //
  // Sustituye al relleno antiguo de 10 definiciones fijas (34 reservas sobre 83
  // unidades), que dejaba el planning vacío de A-09 hacia abajo en pleno agosto.
  //
  // Se recorre UNIDAD A UNIDAD a lo largo de la temporada colocando estancias
  // consecutivas. Recorrer por unidad tiene una propiedad que vale oro: el
  // invariante 1 (no dos reservas activas solapadas) se cumple POR CONSTRUCCIÓN,
  // no por comprobación — el cursor nunca retrocede. Es lo que permite subir al
  // ~93% de agosto sin pelearse con el generador.

  /** Ocupación objetivo por fecha: la FORMA de la temporada es el argumento de venta. */
  function targetOccupancy(date: string): number {
    const month = Number(date.slice(5, 7));
    const base = month === 8 ? 0.93 : month === 7 ? 0.75 : month === 6 || month === 9 ? 0.45 : 0.2;
    // Sesgo de fin de semana SOLO fuera de temporada alta: en agosto está lleno
    // igual, y en mayo/junio las llegadas se agolpan en viernes y sábado. Es lo
    // que hace que un profesional reconozca sus propios datos.
    if (base >= 0.75) return base;
    const dow = new Date(`${date}T00:00:00Z`).getUTCDay();
    return dow === 5 || dow === 6 ? Math.min(0.95, base * 1.7) : base;
  }

  /**
   * Convierte "quiero un X% de ocupación" en "con qué probabilidad arranco una
   * estancia HOY en esta unidad" — que es la decisión que toma el bucle.
   *
   * No son lo mismo, y confundirlas fue el primer resultado de esta fase: con
   * p=0.45 en junio salía un 66% real, porque cada estancia colocada ocupa
   * después N noches seguidas. Con ciclo = n noches ocupadas + hueco + espera:
   *
   *     ocupación = n / (n + hueco + espera)   y   espera = (1-p)/p
   *
   * despejando p. Así la constante de arriba dice lo que significa: el 45% de
   * junio ES un 45%, no una probabilidad que casualmente produce otra cosa.
   */
  const AVG_GAP = 0.22 * 1 + 0.08 * 2; // ver el sorteo de hueco al final del bucle
  function startProbability(date: string, nights: number): number {
    const q = targetOccupancy(date);
    const idle = nights / q - nights - AVG_GAP;
    return idle <= 0 ? 1 : 1 / (1 + idle);
  }

  /** Duración típica según el mes de llegada. */
  function pickNights(date: string): number {
    const month = Number(date.slice(5, 7));
    const r = rand();
    if (month === 8) return r < 0.45 ? 7 : r < 0.75 ? 14 : r < 0.9 ? 10 : 4;
    if (month === 7) return r < 0.5 ? 7 : r < 0.85 ? 5 : 10;
    return r < 0.55 ? 2 : r < 0.85 ? 3 : 5;
  }

  const SEASON_FROM = `${Y}-04-15`;
  const SEASON_TO = `${Y}-10-15`;

  /** Rangos bloqueados por unidad — el relleno debe respetarlos (averías, larga estancia). */
  const blockedByUnit = new Map<string, [string, string][]>();
  for (const b of inventory_blocks) {
    const uid = b.unit_id as string | null;
    if (!uid) continue;
    blockedByUnit.set(uid, [
      ...(blockedByUnit.get(uid) ?? []),
      [b.date_from as string, b.date_to as string],
    ]);
  }

  for (const unit of units) {
    const uid = unit.id as string;
    const typeId = unit.unit_type_id as string;
    // Ocupación previa = bloqueos + las reservas de caso límite ya colocadas
    // arriba (que eligieron unidad ellas solas). Sin esto el recorrido las
    // pisaría: es exactamente el solape que cazó el test del invariante 1.
    const blocks = [...(blockedByUnit.get(uid) ?? []), ...(occupied.get(uid) ?? [])].sort((a, b) =>
      a[0] < b[0] ? -1 : 1,
    );
    let cursor = SEASON_FROM;

    while (cursor < SEASON_TO) {
      // La duración se sortea ANTES de decidir: la probabilidad de arranque
      // depende de cuántas noches va a ocupar esta estancia concreta.
      const nights = pickNights(cursor);
      if (rand() >= startProbability(cursor, nights)) {
        cursor = addDays(cursor, 1);
        continue;
      }
      const to = addDays(cursor, nights);
      if (to > SEASON_TO) break;

      // No pisar un bloqueo (avería o larga estancia): saltar al final del que estorbe.
      const clash = blocks.find(([bf, bt]) => cursor < bt && bf < to);
      if (clash) {
        cursor = clash[1];
        continue;
      }

      // Estado coherente con la línea temporal del ancla (Y-07-15 = "hoy" del seed):
      // lo terminado está completado, lo que está en curso o por venir, confirmado.
      // Un ~9% de las futuras quedan pendientes de pago, y un ~3% se cancela —
      // la cancelada NO ocupa, así que deja un hueco real en el planning.
      let status: string;
      if (to <= anchor) status = 'completed';
      else if (cursor <= anchor) status = 'confirmed';
      else {
        const r = rand();
        status = r < 0.09 ? 'pending' : r < 0.12 ? 'cancelled' : 'confirmed';
      }

      const adults = 2 + Math.floor(rand() * 3);
      const nChildren = rand() < 0.45 ? 1 + Math.floor(rand() * 2) : 0;
      const childrenAges = Array.from({ length: nChildren }, (_, k) => 2 + ((bkgN + k * 5) % 15));
      const chR = rand();
      addBooking({
        typeId,
        unitId: uid,
        from: cursor,
        to,
        status,
        channel: chR < 0.14 ? 'phone' : chR < 0.19 ? 'walkin' : 'web',
        occ: { adults, childrenAges, pets: rand() < 0.25 ? 1 : 0, vehicles: 1 },
        paidRatio: status === 'completed' ? 1 : status === 'pending' ? 0 : undefined,
      });

      // Hueco tras la salida. El de 1 noche es el que todo camping odia y el que
      // justifica el producto: aparece a propósito, no por accidente.
      const g = rand();
      cursor = addDays(to, g < 0.22 ? 1 : g < 0.3 ? 2 : 0);
    }
  }

  // --- 15 solicitudes en todos los estados ---
  const enquiries: Row[] = [];
  const enqStatuses = [
    'new',
    'new',
    'new',
    'new',
    'contacted',
    'contacted',
    'contacted',
    'quoted',
    'quoted',
    'quoted',
    'converted',
    'converted',
    'lost',
    'lost',
    'lost',
  ];
  enqStatuses.forEach((status, i) => {
    const n = i + 1;
    // Aquí los multiplicadores SÍ valen: son ~una docena de solicitudes, y con
    // n pequeño cada una cae en una pareja distinta. El truco de dividir que usa
    // el generador de huéspedes daría el mismo apellido a las doce.
    const fn = firstNames[(n * 7) % firstNames.length]!;
    const ln = lastNames[(n * 11) % lastNames.length]!;
    const locale = locales[n % locales.length]!;
    const hasDates = n % 4 !== 0;
    const from = hasDates ? addDays(`${Y}-07-01`, (n * 3) % 60) : null;
    const contact: ContactInfo = {
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}${n}@example.com`,
      phone: n % 2 ? `+33 6${10000000 + n * 731}` : undefined,
      locale,
    };
    enquiries.push({
      id: `enq_${String(n).padStart(3, '0')}`,
      tenant_id: T,
      status,
      date_from: from,
      date_to: from ? addDays(from, 3 + (n % 7)) : null,
      occupancy: hasDates
        ? { adults: 2, childrenAges: n % 3 ? [4] : [], pets: n % 5 === 0 ? 1 : 0, vehicles: 1 }
        : null,
      unit_type_id: n % 3 === 0 ? 'ut_bung4' : n % 3 === 1 ? 'ut_std' : null,
      message: `Hola, ¿tenéis disponibilidad? Somos una familia y nos interesa (solicitud demo nº${n}).`,
      contact,
      locale,
      source: n % 4 === 0 ? 'phone' : 'web',
      converted_booking_id: status === 'converted' ? `bkg_${String(n).padStart(3, '0')}` : null,
      created_at: `${anchor}T0${n % 10}:15:00.000Z`,
    });
  });

  // Usuarios del dashboard, uno por rol. Contraseña demo: "calasereno" —
  // hash scrypt de Better Auth precomputado (constante ⇒ seed determinista, ADR 0005).
  // El par en claro del visitante anónimo vive en `DEMO_LOGIN`, justo debajo de
  // este hash a propósito: si algún día se rota la contraseña, las dos líneas
  // que hay que cambiar están a la vista la una de la otra.
  const DEMO_PASSWORD_HASH =
    '931abc0463c0d2df6516487fdc25c1b3:d6bac2bf4c8ad0619f9355e39697834c72f0381a538bcb36beba1890b6fb90831ccd3fe61de0378819d76ea71806f198efa575673fab62a4a2f012be4bfc164a';
  const authTs = Date.parse(`${anchor}T00:00:00.000Z`);
  const users: Row[] = [
    {
      id: 'usr_owner',
      tenant_id: T,
      email: 'direccion@calasereno.example',
      role: 'owner',
      name: 'Dirección',
    },
    {
      id: 'usr_manager',
      tenant_id: T,
      email: 'gerencia@calasereno.example',
      role: 'manager',
      name: 'Gerencia',
    },
    {
      id: 'usr_recepcion',
      tenant_id: T,
      email: 'recepcion@calasereno.example',
      role: 'reception',
      name: 'Recepción',
    },
    {
      id: 'usr_consulta',
      tenant_id: T,
      email: 'consulta@calasereno.example',
      role: 'readonly',
      name: 'Consulta',
    },
    // El visitante anónimo de la demo (ADR 0029). NO es lo mismo que
    // `usr_consulta`: aquel es el ejemplo de un empleado con permisos de solo
    // lectura —un rol de producto real—, y este es atrezzo comercial que además
    // puede mover reservas en el planning. Se siembra, nunca se provisiona por
    // la API. Como el reset regenera `users` desde el seed, sobrevive a los
    // resets, incluido al que dispara el propio botón de restablecer.
    {
      id: 'usr_demo',
      tenant_id: T,
      email: 'demo@calasereno.example',
      role: 'demo',
      name: 'Visita',
    },
  ].map((u) => ({
    ...u,
    email_verified: true,
    image: null,
    created_at: authTs,
    updated_at: authTs,
  }));
  const accounts: Row[] = users.map((u) => ({
    id: `acc_${String(u.id).slice(4)}`,
    user_id: u.id,
    account_id: u.id,
    provider_id: 'credential',
    password: DEMO_PASSWORD_HASH,
    access_token: null,
    refresh_token: null,
    id_token: null,
    access_token_expires_at: null,
    refresh_token_expires_at: null,
    scope: null,
    created_at: authTs,
    updated_at: authTs,
  }));

  return {
    anchor,
    tenants: [
      {
        id: T,
        slug: 'demo',
        name: 'Camping Cala Sereno',
        tier: 3,
        timezone: 'Europe/Madrid',
        currency: 'EUR',
        locales: ['es', 'ca', 'en', 'fr', 'de', 'nl'],
        modules: {
          web: true,
          booking: 'instant',
          dashboard: 'full',
          // mode:'none' hasta tener credenciales reales de Stripe (ADR 0011 §8):
          // cambiar a 'deposit'/'full' es solo este objeto + los secrets del Worker,
          // sin deploy de código — mismo criterio que RESEND_API_KEY en Fase 7.
          payments: { provider: 'stripe', mode: 'none' },
          // Comunitat Valenciana (ADR 0012 §1 — antes hardcodeado en public.ts/admin.ts)
          taxPolicy: 'valencia',
          notifications: {
            notifyTo: 'recepcion@calasereno.example',
            from: 'Camping Cala Sereno <reservas@calasereno.example>',
          },
          // Parte de viajeros (ADR 0028): activo con un código de establecimiento de
          // demo. Sin credenciales SES (secrets del Worker), la demo opera en modo
          // manual (descarga del XML) — el envío automático se activa con los secrets.
          hospedajes: {
            enabled: true,
            codigoEstablecimiento: 'CS-DEMO-0001',
            establecimiento: {
              nombre: 'Camping Cala Sereno',
              direccion: 'Ctra. de la Cala, km 3',
              municipio: 'Alcossebre',
              provincia: 'Castellón',
              cp: '12579',
            },
          },
          // Geometría del plano del camping (ADR 0021, C7). Descriptor declarativo
          // materializado aquí desde tenants/demo/plano.ts; GET /api/admin/map lo
          // sirve al dashboard. NO es una columna nueva ni obliga a migrar la D1.
          plano: buildDemoPlano(),
        },
      },
    ],
    seasons_calendar: seasons.map((s) => ({ ...s, tenant_id: T })),
    unit_types,
    units,
    rate_plans,
    rate_rules,
    extras,
    inventory_blocks,
    enquiries,
    bookings,
    guests,
    booking_guests,
    payments,
    users,
    accounts,
  };
}

// ---------- SQL ----------

/**
 * Presupuesto de bytes por sentencia INSERT.
 *
 * Se trocea por TAMAÑO, no por número de filas: el límite que impone D1 es la
 * longitud de la sentencia (`SQLITE_TOOBIG`), y las filas de este seed son muy
 * desiguales — una de `booking_guests` son 2 ids, una de `bookings` lleva el
 * `price_breakdown` JSON entero. Un tope fijo de filas reventaba en `bookings`
 * y desaprovechaba el resto. Así cada tabla se agrupa a su propia densidad.
 */
const SQL_CHUNK_BYTES = 48_000;

export function seedToSql(data: SeedData): string {
  const out: string[] = ['-- Seed demo Camping Cala Sereno (generado — no editar a mano)'];
  const tables: [string, Row[]][] = [
    ['tenants', data.tenants],
    ['seasons_calendar', data.seasons_calendar],
    ['unit_types', data.unit_types],
    ['units', data.units],
    ['rate_plans', data.rate_plans],
    ['rate_rules', data.rate_rules],
    ['extras', data.extras],
    ['inventory_blocks', data.inventory_blocks],
    ['guests', data.guests],
    ['bookings', data.bookings],
    ['booking_guests', data.booking_guests],
    ['payments', data.payments],
    ['enquiries', data.enquiries],
    ['users', data.users],
    ['accounts', data.accounts],
  ];
  for (const [table, rows] of tables) {
    if (!rows.length) continue;
    const cols = Object.keys(rows[0]!);
    // INSERT multi-fila troceado (ADR 0019 §2.3). Una sentencia por fila hacía
    // que el reset nocturno —que ejecuta wipe+reseed en un ÚNICO db.batch()
    // para ser atómico (ADR 0013)— creciera con el nº de filas: al densificar
    // el seed pasó de 321 a >8.000 sentencias, que no caben en un Worker.
    // Así las FILAS crecen y las SENTENCIAS quedan acotadas, sin tocar la
    // atomicidad. El tamaño de trozo respeta el límite de variables de SQLite.
    const head = `INSERT INTO ${table} (${cols.join(', ')}) VALUES `;
    let batch: string[] = [];
    let bytes = head.length;
    const flush = () => {
      if (batch.length) out.push(`${head}${batch.join(', ')};`);
      batch = [];
      bytes = head.length;
    };
    for (const row of rows) {
      const tuple = `(${cols.map((c) => q(row[c])).join(', ')})`;
      // +2 por ", ". Una fila que por sí sola pase del presupuesto va igualmente
      // en su propia sentencia: trocear más no la haría más pequeña.
      if (batch.length && bytes + tuple.length + 2 > SQL_CHUNK_BYTES) flush();
      batch.push(tuple);
      bytes += tuple.length + 2;
    }
    flush();
  }
  return out.join('\n');
}
