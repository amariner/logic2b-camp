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
 * @param anchor el **"hoy" de la demo**, ISO `YYYY-MM-DD` (ADR 0030).
 *
 * Hasta la sesión 57 el parámetro era un AÑO y el ancla salía siempre del
 * `15 de julio`: el seed tenía un "hoy" y el dashboard otro, y las dos líneas
 * temporales solo coincidían un día al año. La consecuencia medida: el botón
 * de check-out no aparecía **nunca**, ningún día, y fuera de abril–octubre la
 * pantalla de llegadas y salidas salía vacía.
 *
 * El generador **sigue siendo puro**: no lee el reloj por dentro. Quien lo lee
 * es el llamante (`reset.ts`, `write-seed.ts`, `data.ts`), que es lo que
 * permite que el reset nocturno siga siendo determinista dado su ancla.
 */
export function generateSeed(anchor: string): SeedData {
  const Y = Number(anchor.slice(0, 4));
  /**
   * El PRNG se siembra con el AÑO, no con el día — y eso es media decisión
   * (ADR 0030 §2). Si colgara del ancla completa, la demo se reorganizaría
   * entera cada madrugada: otras reservas, otros clientes, otros códigos, y el
   * `CS-2026-0412` que un comercial enseñó ayer sería hoy otra cosa. Con el año,
   * el reparto de la temporada es el mismo los 365 días y lo único que se mueve
   * es la línea de HOY que lo recorre.
   */
  const rand = rng(Y * 7919);
  const T = 'ten_calasereno';
  const now = `${anchor}T08:00:00.000Z`;

  // --- temporadas: solapadas, resueltas por prioridad ---
  //
  // La apertura abarca el AÑO ENTERO desde ADR 0030: para que "hoy" caiga
  // siempre dentro de la ventana sembrada, la ventana tiene que ser el año. Eso
  // convierte a Cala Sereno en un camping abierto todo el año —lo que son
  // muchos de la costa de Castellón, y lo que ya insinuaban sus dos bloqueos
  // `longstay`—, a cambio de que el estado "cerrado" del motor (`is_open:false`)
  // deje de verse en la web pública de la demo. Se acepta con motivo escrito en
  // el ADR: un mes de pantallas vacías cuesta más que un argumento de
  // conversación, y la capacidad sigue teniendo su test en `packages/core`.
  const seasons = [
    {
      id: 'sea_apertura',
      name: 'Apertura',
      // El año natural, que es lo que la tabla de tarifas de la web pública
      // sabe leer: "Apertura · 1 ene – 31 dic" dice **abierto todo el año** de
      // un vistazo. Se probó declararla sobre la ventana sembrada entera y la
      // página quedaba diciendo "Apertura · 15 nov – 15 feb", que es
      // exactamente lo contrario de lo que significa. La ventana de siembra
      // desborda el año por su cuenta (ver `SEED_FROM`/`SEED_TO`).
      date_from: `${Y}-01-01`,
      date_to: `${Y}-12-31`,
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
    // Invernante (ADR 0030): la autocaravana del norte de Europa que pasa el
    // invierno en la costa. Los otros dos `longstay` son de verano, así que
    // hasta ahora el planning de enero no tenía ni una barra rayada — y el
    // invernante es justo lo que explica que un camping de costa abra en enero.
    {
      id: 'blk_long3',
      tenant_id: T,
      unit_id: 'unt_moto_08',
      unit_type_id: null,
      date_from: `${Y}-01-01`,
      date_to: `${Y}-03-20`,
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

  /**
   * PRNG **propio** para lo que se ha cobrado (ver `defaultPaidRatio`). No sale
   * del general a propósito: el relleno por curva sortea fechas, duraciones y
   * huecos contra `rand()`, así que una tirada más movería la temporada entera
   * y con ella los diez tests calibrados. Y tampoco puede colgar de `bkgN` —
   * de ahí ya cuelgan el medio de pago (`% 6`, `% 4`), el idioma (`% 6`), el
   * censo de habituales (`% 4`) y el check-in (`% 5`): dos rasgos sobre el
   * mismo contador no son dos ritmos (la lección de la sesión 54).
   */
  const payRand = rng(Y * 104729 + 17);
  /**
   * PRNG propio del **mostrador**: quién ha registrado su llegada, quién ya se
   * ha ido esta mañana. Mismo motivo que `payRand` (no colgar de `bkgN`, que ya
   * carga cuatro rasgos) más uno nuevo de ADR 0030: se consulta **una vez por
   * reserva y sin condiciones**, de forma que la tirada de cada reserva no
   * dependa de dónde caiga el ancla. Si se consultara solo en algunas ramas, la
   * secuencia se desplazaría cada día y el mostrador de la demo cambiaría de
   * protagonistas cada madrugada sin motivo.
   */
  const recepRand = rng(Y * 15485863 + 101);

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
    'Romero',
    'Iglesias',
    'Molina',
    'Ortega',
    'Delgado',
    'Castro',
    'Rubio',
    'Marín',
    'Santos',
    'Cabrera',
    'Reyes',
    'Gallego',
    'Lorenzo',
    'Vargas',
    'Bruguera',
    'Fabra',
    'Estellés',
    'Salvador',
    'Beltrán',
    'Balaguer',
    'Cardona',
    'Company',
    'Fuster',
    'Llopis',
    'Mestre',
    'Ribes',
    'Solé',
    'Tarragó',
    'Vilanova',
    'Bonet',
    'Girard',
    'Lefevre',
    'Roux',
    'Fournier',
    'Chevalier',
    'Perrin',
    'Marchand',
    'Renaud',
    'Bourgeois',
    'Guillaume',
    'Colin',
    'Poirier',
    'Leclerc',
    'Menard',
    'Becker',
    'Wagner',
    'Schulz',
    'Richter',
    'Neumann',
    'Zimmermann',
    'Braun',
    'Krüger',
    'Hartmann',
    'Werner',
    'Lange',
    'König',
    'Vogel',
    'Winkler',
    'Smit',
    'Meijer',
    'Boer',
    'Mulder',
    'Bos',
    'Vos',
    'Kok',
    'Willems',
    'Hendriks',
    'Maas',
    'Verhoeven',
    'Kuipers',
    'Prins',
    'Blom',
    'Ferrari',
    'Esposito',
    'Romano',
    'Colombo',
    'Greco',
    'Marino',
    'Gallo',
    'Rizzo',
    'Lombardi',
    'Moretti',
    'Barbieri',
    'Fontana',
    'Caruso',
    'Taylor',
    'Walker',
    'Clarke',
    'Hughes',
    'Bennett',
    'Wright',
    'Harris',
    'Palmer',
    'Cooper',
    'Ward',
    'Ellis',
    'Barnes',
    'Hayes',
    'Sørensen',
    'Pedersen',
    'Kristensen',
    'Madsen',
    'Rasmussen',
    'Lund',
    'Berg',
    'Holm',
    'Dahl',
    'Lindqvist',
    'Nyström',
    'Åkesson',
    'Novak',
    'Kowalski',
    'Horvat',
    'Kovács',
    'Szabó',
    'Marek',
    'Dvořák',
    'Almeida',
    'Carvalho',
    'Teixeira',
    'Fonseca',
    // De 161 a 241 (sesión 57). No es un retoque del retoque: al sembrar el año
    // entero el censo pasa de ~1 500 fichas a ~2 400, y con 161 apellidos vuelven
    // a tocar a 15 por apellido — la primera página de `/clientes`, que se ordena
    // por apellido, volvía a salir con DOS apellidos en veinticinco filas. Es la
    // misma cuenta de la sesión 54 con otro numerador: el repertorio tiene que
    // crecer con el censo, y una lista de 2 400 clientes reales de un camping de
    // costa tiene bastantes más de 161 apellidos distintos.
    'Aguilar',
    'Alonso',
    'Benítez',
    'Bravo',
    'Calvo',
    'Camps',
    'Cano',
    'Carbonell',
    'Cerdá',
    'Domínguez',
    'Esteve',
    'Gimeno',
    'Guerrero',
    'Herrero',
    'Ibáñez',
    'Jordán',
    'Lozano',
    'Martorell',
    'Medina',
    'Montero',
    'Nadal',
    'Olivares',
    'Pastor',
    'Quiles',
    'Rovira',
    'Sabater',
    'Tomás',
    'Ureña',
    'Valls',
    'Zapata',
    'Barbier',
    'Caron',
    'Dumont',
    'Faure',
    'Gaillard',
    'Humbert',
    'Joly',
    'Lemoine',
    'Masson',
    'Noël',
    'Berger',
    'Dietrich',
    'Engel',
    'Frank',
    'Gruber',
    'Haas',
    'Jäger',
    'Keller',
    'Ludwig',
    'Baas',
    'Cornelissen',
    'Driessen',
    'Groen',
    'Hoekstra',
    'Jonker',
    'Kramer',
    'Veenstra',
    'Amato',
    'Bellini',
    'Cattaneo',
    'De Luca',
    'Farina',
    'Grassi',
    'Leone',
    'Sartori',
    'Abbott',
    'Bailey',
    'Chapman',
    'Dawson',
    'Fletcher',
    'Gibson',
    'Newton',
    'Sharpe',
    'Aalto',
    'Bergström',
    'Eriksen',
    'Halvorsen',
    'Karlsen',
    'Moen',
    'Solberg',
    'Vik',
  ];
  /** Los de `firstNames` que son de mujer — de aquí sale el sexo del parte de viajeros. */
  const nombresFemeninos = new Set([
    'María',
    'Sophie',
    'Emma',
    'Anna',
    'Carmen',
    'Julia',
    'Nina',
    'Sara',
    'Lena',
    'Eva',
    'Greta',
    'Laia',
    'Rosa',
    'Klara',
    'Elke',
    'Iris',
    'Manon',
    'Ingrid',
    'Nadia',
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
      doc_support_number: isSpanish
        ? faltaDato
          ? null
          : `BAA${String(100000 + bkgN * 71)}`
        : null,
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

  /**
   * Cuánto se ha cobrado de una reserva. Era **una constante**: todas las
   * confirmadas llevaban el mismo 30 %, así que la columna "saldo" de Llegadas
   * repetía «Pendiente: …» en las veinte filas del día y la palabra «Pagada» no
   * salía jamás — un dato válido y falso a la vez, como los 2 032 clientes que
   * eran 20 personas (sesión 53). En un camping real depende de **dónde está la
   * estancia** y de **por dónde entró**:
   *
   * - terminada, o ya empezada en el ancla → **liquidada**: el saldo se cobra en
   *   recepción al entrar, nadie pasa una semana dentro debiendo el 70 %.
   * - futura sin confirmar (pendiente, cancelada) → 0, que es justo por lo que
   *   está pendiente.
   * - futura por **mostrador** → 0: quien aparece sin reserva no ha podido
   *   pagar nada por adelantado.
   * - futura por **teléfono** → señal del 30 % por transferencia, o nada
   *   (recepción la apunta y ya cobrará).
   * - futura por **web** → señal del 30 %, o la estancia entera: una parte de la
   *   gente paga el total al reservar, y es el caso que hace aparecer «Pagada».
   *
   * Las cifras salen de `payRand` (ver arriba), no de `bkgN` ni del PRNG general.
   */
  function defaultPaidRatio(from: string, status: string, channel: string): number {
    // La tirada se consume SIEMPRE, antes de mirar nada: así el `r` de cada
    // reserva es el mismo caiga donde caiga el ancla (ADR 0030 §2). Cuando se
    // sorteaba dentro de las ramas, mover el ancla un día desplazaba la
    // secuencia entera y cambiaba lo cobrado de media temporada.
    const r = payRand();
    if (status !== 'confirmed' && status !== 'completed') return 0;
    // `<`, no `<=`: quien ENTRA hoy todavía no ha pasado por el mostrador, y el
    // saldo que se le cobra al registrar la llegada es justo lo que la pantalla
    // de Llegadas existe para enseñar. Con `<=` las once llegadas del día salían
    // todas «Pagada», que es el defecto de la sesión 56 al revés.
    if (from < anchor) return 1;
    if (channel === 'walkin') return 0;
    if (channel === 'phone') return r < 0.5 ? 0.3 : 0;
    return r < 0.35 ? 1 : 0.3;
  }

  /**
   * Dónde está una estancia respecto del "hoy" de la demo (ADR 0030 §4). Los
   * cinco casos son los cinco que distingue una recepción, y dos de ellos —los
   * que salen hoy y los que llegan hoy— no existían: el seed solo sabía de
   * "terminada", "en casa" y "futura", y por eso el botón de check-out no
   * aparecía nunca (la lista de Salidas pide `checked_in_at`, y quien se iba hoy
   * quedaba fuera del `anchor < to` que lo estampaba).
   */
  type Situacion = 'pasada' | 'sale_hoy' | 'en_casa' | 'llega_hoy' | 'futura';
  function situacionDe(from: string, to: string): Situacion {
    if (to < anchor) return 'pasada';
    if (to === anchor) return 'sale_hoy';
    if (from === anchor) return 'llega_hoy';
    if (from < anchor) return 'en_casa';
    return 'futura';
  }

  /** Tarde de entrada / mañana de salida: las horas del mostrador, no medianoche. */
  const LLEGADA_H = 'T16:20:00.000Z';
  const SALIDA_H = 'T10:35:00.000Z';

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
    /**
     * Sustituye la tirada del mostrador para esta reserva (0 = ya pasó por
     * recepción, 1 = todavía no). Solo lo usa la banda del día, que planta lo
     * que el sorteo no puede garantizar. El PRNG se consume igual, para no
     * mover la secuencia de las demás.
     */
    recepcion?: number;
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
    const paid = Math.round(
      total * (opts.paidRatio ?? defaultPaidRatio(opts.from, opts.status, opts.channel ?? 'web')),
    );
    // ¿Vuelve alguien, o es gente nueva? El idioma de la reserva lo manda la
    // ficha cuando se reutiliza: la nacionalidad del huésped ya está grabada y
    // una reserva en francés a nombre de un titular español sería incoherente.
    const repite = pickHabitual(opts.from, opts.to);
    const locale = repite ? repite.locale : locales[bkgN % locales.length]!;
    const gid = repite ? repite.id : addGuest(locale, opts.from, opts.to);
    if (repite) repite.stays.push([opts.from, opts.to]);
    booking_guests.push({ booking_id: id, guest_id: gid, is_lead: true });
    /**
     * El mostrador (ADR 0022 + ADR 0030 §4). La tirada se consume SIEMPRE,
     * incluso para las canceladas, por lo mismo que en `defaultPaidRatio`: si
     * dependiera de la rama, movería la secuencia al mover el ancla.
     *
     * Solo se estampa sobre reservas que llegaron a existir de verdad —una
     * cancelada o un no-show no pisan la recepción— y el estado se recalcula
     * aquí para los dos casos del día: quien sale hoy sigue `confirmed` y en
     * casa (es lo que hace aparecer el botón de check-out), y una parte de las
     * salidas del día ya ha pasado por recepción esta mañana.
     */
    const recepSorteo = recepRand();
    const recepR = opts.recepcion ?? recepSorteo;
    const situacion =
      opts.status === 'confirmed' || opts.status === 'completed'
        ? situacionDe(opts.from, opts.to)
        : 'futura';
    let status = opts.status;
    let checkedInAt: string | null = null;
    let checkedOutAt: string | null = null;
    if (situacion === 'pasada') {
      // Hasta ADR 0030 el histórico no tenía ni check-in ni check-out: la ficha
      // de cliente decía que aquel huésped nunca llegó a entrar.
      status = 'completed';
      checkedInAt = `${opts.from}${LLEGADA_H}`;
      checkedOutAt = `${opts.to}${SALIDA_H}`;
    } else if (situacion === 'sale_hoy') {
      checkedInAt = `${opts.from}${LLEGADA_H}`;
      if (recepR < 0.25) {
        // madrugadores: ya han entregado la llave (el check_out real de la API
        // sella `checked_out_at` Y completa la reserva — apps/api, admin.ts)
        checkedOutAt = `${anchor}${SALIDA_H}`;
        status = 'completed';
      } else {
        status = 'confirmed';
      }
    } else if (situacion === 'en_casa') {
      // ~1 de cada 6 sigue sin registrar: recepción no siempre lo hace al entrar
      if (recepR < 0.84) checkedInAt = `${opts.from}${LLEGADA_H}`;
    } else if (situacion === 'llega_hoy') {
      // La mayoría NO ha llegado aún: es lo que pone el botón "Registrar
      // llegada" en la pantalla. Una parte ya está dentro, para que la lista de
      // Llegadas enseñe también el estado "En casa".
      if (recepR < 0.25) checkedInAt = `${anchor}T11:20:00.000Z`;
    }
    bookings.push({
      id,
      tenant_id: T,
      code: `CS-${Y}-${String(bkgN).padStart(4, '0')}`,
      status,
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
      checked_in_at: checkedInAt,
      checked_out_at: checkedOutAt,
      // Forma de pago de la operación para el parte de viajeros (ADR 0028): sembrada
      // rotando entre los cuatro medios; ~1 de cada 6 se deja sin fijar, para que la
      // pantalla del parte muestre el aviso "falta forma de pago" sin un mock.
      payment_kind:
        bkgN % 6 === 3 ? null : (['card', 'cash', 'transfer', 'platform'] as const)[bkgN % 4],
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

  /**
   * Ventana de siembra (ADR 0030 §3). Antes iba de mediados de abril a mediados
   * de octubre y la mitad del calendario no tenía ni una reserva: la pantalla de
   * la operación diaria salía vacía medio año.
   *
   * Desborda el año natural **dos meses y medio por cada lado**, y ese desborde
   * es lo que evita que el ancla se quede pegada a un borde: el 1 de enero
   * seguiría sin un solo día de pasado (`/informes` en blanco) y el 28 de
   * diciembre sin futuro (el planning acabando en una pared). Son los meses más
   * flojos del año, así que es el trozo de calendario más barato de sembrar.
   *
   * Esas colas caen fuera de la temporada declarada, así que `seasonFor` les da
   * la apertura por defecto — que es justo la temporada que les tocaría. La
   * contrapartida, asumida: para el motor esas fechas son "cerrado", de modo que
   * la web pública diría "cerrado" en enero del año siguiente al del seed. A
   * trece meses vista no lo mira nadie, y a cambio la tabla de tarifas —que sí
   * se enseña— dice la verdad.
   */
  const SEED_FROM = `${Y - 1}-11-15`;
  const SEED_TO = `${Y + 1}-02-15`;

  // Casos límite explícitos.
  //
  // Los tres primeros se declaran `confirmed` y **dejan que el ancla decida** su
  // estado (ADR 0030 §4): el estado no es el caso que ilustran —el cruce de
  // temporada, la estancia larga, el grupo familiar—, así que escribirlo a mano
  // solo garantizaba que fuera falso la mayor parte del año. Los dos que SÍ son
  // su estado (cancelada, no-show) se conservan literales.
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
    status: 'confirmed',
    occ: { adults: 2, childrenAges: [], pets: 1, vehicles: 1 },
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
  // La reserva sin unidad es la que llena la bandeja "sin asignar" del planning
  // (ADR 0023), o sea una TAREA PENDIENTE del mostrador. Clavada en agosto, once
  // meses al año era historia: nadie asigna una unidad a una estancia que ya
  // terminó. Se coloca relativa al ancla, sin salirse del año sembrado.
  const sinAsignarFrom = (() => {
    const tope = addDays(SEED_TO, -12);
    const d = addDays(anchor, 20);
    const f = d < tope ? d : tope;
    // en la última quincena de diciembre el tope queda DETRÁS del ancla: entonces
    // manda estar en el futuro, aunque la estancia asome al año siguiente.
    return f > anchor ? f : addDays(anchor, 2);
  })();
  addBooking({
    typeId: 'ut_bung4',
    unitIdx: null,
    from: sinAsignarFrom,
    to: addDays(sinAsignarFrom, 7),
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

  /**
   * Ocupación objetivo por MES: la FORMA de la temporada es el argumento de
   * venta. Desde ADR 0030 el relleno cubre el año entero, así que los meses de
   * invierno dejan de caer en un `else` y se declaran: un camping de la costa de
   * Castellón abierto todo el año hace un 18-22% en enero, no un cero.
   */
  const OCUPACION_MES = [
    0.18, // ene
    0.18, // feb
    0.22, // mar
    0.22, // abr
    0.26, // may
    0.45, // jun
    0.75, // jul
    0.93, // ago
    0.45, // sep
    0.22, // oct
    0.18, // nov
    0.22, // dic — el puente y la Navidad levantan un poco el mes
  ] as const;

  function targetOccupancy(date: string): number {
    const month = Number(date.slice(5, 7));
    const base = OCUPACION_MES[month - 1]!;
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
    // Invierno (nov-mar): la mezcla de un camping de costa abierto todo el año.
    // El fin de semana corto de siempre CONVIVE con el invernante que se planta
    // meses. Sin la parte larga no hay ocupación que enseñar; sin la corta no
    // hay llegadas ningún día, que es justo el defecto que arregla ADR 0030.
    if (month <= 3 || month >= 11) return r < 0.45 ? 3 : r < 0.78 ? 7 : r < 0.93 ? 14 : 45;
    return r < 0.55 ? 2 : r < 0.85 ? 3 : 5;
  }

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
    let cursor = SEED_FROM;

    while (cursor < SEED_TO) {
      // La duración se sortea ANTES de decidir: la probabilidad de arranque
      // depende de cuántas noches va a ocupar esta estancia concreta.
      const nights = pickNights(cursor);
      if (rand() >= startProbability(cursor, nights)) {
        cursor = addDays(cursor, 1);
        continue;
      }
      const to = addDays(cursor, nights);
      if (to > SEED_TO) break;

      // No pisar un bloqueo (avería o larga estancia): saltar al final del que estorbe.
      const clash = blocks.find(([bf, bt]) => cursor < bt && bf < to);
      if (clash) {
        cursor = clash[1];
        continue;
      }

      // La coherencia con la línea temporal la resuelve `addBooking` a partir del
      // ancla (ADR 0030 §4) — aquí solo se decide lo que el ancla NO puede saber:
      // que un ~9% de las futuras se queda pendiente de pago y un ~3% se cancela.
      // La cancelada NO ocupa, así que deja un hueco real en el planning.
      // La tirada se consume SIEMPRE aunque solo se use en el futuro: si
      // dependiera del ancla, mover un día el "hoy" desplazaría el PRNG y con él
      // TODA la temporada que viene detrás (ADR 0030 §2).
      const rEstado = rand();
      const status =
        cursor > anchor
          ? rEstado < 0.09
            ? 'pending'
            : rEstado < 0.12
              ? 'cancelled'
              : 'confirmed'
          : 'confirmed';

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
        // lo cobrado ya no se decide aquí: `defaultPaidRatio` lo saca de la
        // posición de la estancia y del canal, en un solo sitio para las 40.
      });

      // Hueco tras la salida. El de 1 noche es el que todo camping odia y el que
      // justifica el producto: aparece a propósito, no por accidente.
      const g = rand();
      cursor = addDays(to, g < 0.22 ? 1 : g < 0.3 ? 2 : 0);
    }
  }

  // --- La banda del día: lo que el sorteo no puede garantizar ------------------
  //
  // Con el ancla móvil, "hoy" cae siempre dentro de la temporada sembrada, pero
  // dentro no es lo mismo que encima: el 15 de enero, con el camping al 18 %, el
  // relleno dejaba UNA salida en todo el día, y esa una estaba entre el 25 % que
  // ya había entregado la llave → el botón de check-out volvía a no existir. Un
  // día concreto es una tirada, no una propiedad.
  //
  // Así que la mezcla que la pantalla de la operación diaria TIENE que enseñar
  // se planta, como los quince casos de la bandeja de solicitudes (sesión 55) y
  // como los casos límite de arriba: dos salidas con el gesto disponible, una
  // que ya se fue esta mañana, dos llegadas por registrar, una ya registrada.
  //
  // Va DESPUÉS del relleno a propósito: si fuera antes, sus fechas —que dependen
  // del ancla— empujarían el cursor del recorrido por unidad y con él la
  // temporada entera, y la demo dejaría de ser la misma todos los días del año.
  const BANDA_HOY: { desde: number; hasta: number; recepcion: number; nota: string }[] = [
    { desde: -5, hasta: 0, recepcion: 0.9, nota: 'Salida de hoy — pendiente de check-out' },
    { desde: -9, hasta: 0, recepcion: 0.9, nota: 'Salida de hoy — pendiente de check-out' },
    { desde: -3, hasta: 0, recepcion: 0.1, nota: 'Salida de hoy — ya entregó la llave' },
    { desde: 0, hasta: 4, recepcion: 0.9, nota: 'Llegada de hoy — pendiente de registrar' },
    { desde: 0, hasta: 7, recepcion: 0.9, nota: 'Llegada de hoy — pendiente de registrar' },
    { desde: 0, hasta: 3, recepcion: 0.1, nota: 'Llegada de hoy — ya registrada' },
  ];
  /** Primera unidad libre en el rango, empezando por un punto rotatorio del parque. */
  function unidadLibre(from: string, to: string, arranque: number): Row | null {
    for (let k = 0; k < units.length; k++) {
      const u = units[(arranque + k) % units.length]!;
      const uid = u.id as string;
      const ocupada = (occupied.get(uid) ?? []).some(([f, t]) => from < t && f < to);
      const bloqueada = (blockedByUnit.get(uid) ?? []).some(([f, t]) => from < t && f < to);
      if (!ocupada && !bloqueada) return u;
    }
    return null;
  }
  BANDA_HOY.forEach((caso, i) => {
    // El arranque separa las seis por el parque: seis filas seguidas de A-01 a
    // A-06 se leerían como generadas incluso siendo correctas.
    const arranque = i * 17 + 3;
    // Un hueco de nueve noches seguidas puede sencillamente no existir —en junio
    // el parque va al 45 % pero con estancias de tres noches, así que está
    // troceado, y en agosto va al 93 %—. Antes que renunciar a la unidad, se
    // ACORTA la estancia: lo que la pantalla necesita es la fecha del día, no la
    // duración. Solo si no cabe ni la más corta se queda sin asignar.
    let from = addDays(anchor, caso.desde);
    let to = addDays(anchor, caso.hasta);
    let unidad: Row | null = null;
    for (let recorte = 0; recorte <= Math.abs(caso.hasta - caso.desde) - 2; recorte++) {
      from = addDays(anchor, caso.desde < 0 ? caso.desde + recorte : caso.desde);
      to = addDays(anchor, caso.hasta > 0 ? caso.hasta - recorte : caso.hasta);
      unidad = unidadLibre(from, to, arranque);
      if (unidad) break;
    }
    addBooking({
      typeId: (unidad?.unit_type_id as string) ?? 'ut_std',
      unitId: unidad ? (unidad.id as string) : undefined,
      unitIdx: unidad ? undefined : null,
      from,
      to,
      status: 'confirmed',
      channel: i % 3 === 2 ? 'phone' : 'web',
      recepcion: caso.recepcion,
      notes: caso.nota,
    });
  });

  // --- 15 solicitudes en todos los estados ---
  //
  // El estado de una solicitud es, sobre todo, EDAD: lo que sigue "nueva" entró
  // esta semana, y lo que se ganó o se perdió lleva semanas en la bandeja. Este
  // bloque las sembraba TODAS en el ancla, así que la columna "recibida" repetía
  // quince veces «15 jul» — un dato válido y falso a la vez, el mismo defecto que
  // destaparon las sesiones 53 y 54 en la lista de clientes. Peor: `date_from`
  // salía de `${Y}-07-01` sin mirar la recepción, y había solicitudes pidiendo
  // una estancia que ya había TERMINADO el día que se escribieron.
  //
  // Ahora cada estado tiene su banda de antigüedad (se solapan, como en una
  // bandeja real) y la estancia se pide siempre con antelación sobre su propia
  // recepción. Lo que varía sin consecuencias —hora, pax, tipo pedido— se sortea
  // con `rand()`, que es el generador ya sembrado y determinista, y NO con
  // `n % k`: dos rasgos que salen del mismo contador nunca son dos ritmos
  // (trampa de la sesión 54). Aquí eran dos parejas atadas de nacimiento:
  // `source`/`hasDates` compartían `n % 4` (ninguna solicitud de teléfono traía
  // fechas, ninguna de web las omitía) y `unit_type_id`/niños compartían `n % 3`
  // (quien no pedía tipo no traía niños, jamás).
  //
  /** Días que lleva la solicitud en la bandeja, por estado. Bandas solapadas. */
  const ENQ_EDAD: Record<string, [number, number]> = {
    new: [0, 5],
    contacted: [2, 12],
    quoted: [6, 21],
    converted: [12, 40],
    lost: [16, 52],
  };
  /**
   * Lo que escribe quien pregunta, en su idioma. Un camping del Mediterráneo
   * recibe la bandeja en seis idiomas, y tenerla entera en castellano —con el
   * mismo párrafo repetido quince veces y un «(solicitud demo nº7)» al final—
   * era el otro modo de leerse como generada.
   */
  const ENQ_MENSAJES: Record<string, string[]> = {
    es: [
      'Buenas, ¿os queda algo libre esas fechas? Somos familia con niños y nos gustaría estar cerca de la piscina.',
      'Hola, querríamos una parcela con sombra y enchufe para la nevera. ¿Qué precio tendría?',
      '¿Admitís perro pequeño? Va siempre atado y es muy tranquilo. Gracias.',
    ],
    ca: [
      'Bon dia, tenim caravana i busquem parcel·la amb ombra. Hi ha disponibilitat?',
      'Hola! Voldríem reservar aquests dies. Ens podríeu passar pressupost, si us plau?',
    ],
    fr: [
      "Bonjour, auriez-vous encore de la place à ces dates ? Nous venons en van aménagé, merci d'avance.",
      'Bonsoir, nous cherchons un bungalow avec climatisation pour deux adultes et un enfant. Quel est le tarif ?',
    ],
    de: [
      'Guten Tag, haben Sie in diesem Zeitraum noch einen Stellplatz mit Schatten frei? Vielen Dank!',
      'Hallo, wir reisen mit Wohnmobil (7 m) an. Ist die Einfahrt breit genug?',
    ],
    nl: [
      'Goedendag, is er nog plaats in deze periode? Wij komen met een caravan en twee kinderen.',
      'Hallo, kunnen wij een plek dicht bij het strand reserveren? Alvast bedankt.',
    ],
    en: [
      'Hello, do you still have availability on these dates? We are two adults travelling with a small tent.',
      'Hi there, is the pool open in September? We would like to book a mobile home. Thanks!',
    ],
  };

  /** Prefijo telefónico del mercado emisor de cada idioma. */
  const ENQ_PREFIJO: Record<string, string> = {
    es: '+34',
    ca: '+34',
    fr: '+33',
    de: '+49',
    nl: '+31',
    en: '+44',
  };

  /**
   * Los quince casos, declarados uno a uno. En el formulario público las fechas
   * son OPCIONALES (`EnquiryForm.astro`, y `dateFrom` es `.optional()` en el
   * esquema), y por teléfono las apunta recepción: lo normal es web sin fechas y
   * teléfono con ellas — justo las dos combinaciones que `n % 4` hacía
   * imposibles. La bandeja de la demo tiene que enseñar SIEMPRE la mezcla, y una
   * mezcla sorteada es una mezcla que algún año no sale (el reset nocturno
   * re-siembra con el año en curso, así que la tirada cambia cada 1 de enero).
   * Se plantan, como los casos límite de las reservas.
   */
  const ENQ_CASOS: {
    status: string;
    source: 'web' | 'phone';
    fechas: boolean;
    /** false = «Cualquiera»: no pide un tipo concreto. También va plantado. */
    tipo: boolean;
  }[] = [
    { status: 'new', source: 'web', fechas: true, tipo: true },
    { status: 'new', source: 'phone', fechas: true, tipo: false },
    { status: 'new', source: 'web', fechas: false, tipo: true },
    { status: 'new', source: 'web', fechas: true, tipo: true },
    { status: 'contacted', source: 'phone', fechas: true, tipo: true },
    { status: 'contacted', source: 'web', fechas: true, tipo: false },
    { status: 'contacted', source: 'web', fechas: false, tipo: false },
    { status: 'quoted', source: 'web', fechas: true, tipo: true },
    { status: 'quoted', source: 'phone', fechas: false, tipo: true },
    { status: 'quoted', source: 'web', fechas: true, tipo: true },
    { status: 'converted', source: 'web', fechas: true, tipo: true },
    { status: 'converted', source: 'phone', fechas: true, tipo: false },
    { status: 'lost', source: 'web', fechas: false, tipo: false },
    { status: 'lost', source: 'web', fechas: true, tipo: true },
    { status: 'lost', source: 'phone', fechas: true, tipo: true },
  ];

  const enquiries: Row[] = [];
  ENQ_CASOS.forEach((caso, i) => {
    const { status, source, fechas: hasDates, tipo: pideTipo } = caso;
    const n = i + 1;
    // Aquí los multiplicadores SÍ valen: son ~una docena de solicitudes, y con
    // n pequeño cada una cae en una pareja distinta. El truco de dividir que usa
    // el generador de huéspedes daría el mismo apellido a las doce.
    const fn = firstNames[(n * 7) % firstNames.length]!;
    const ln = lastNames[(n * 11) % lastNames.length]!;
    const locale = locales[n % locales.length]!;

    // Recepción: dentro de la banda de su estado, hacia atrás desde el ancla.
    const [edadMin, edadMax] = ENQ_EDAD[status]!;
    const recibida = addDays(anchor, -(edadMin + Math.floor(rand() * (edadMax - edadMin + 1))));
    // El teléfono solo suena con recepción abierta; el formulario web entra a
    // cualquier hora, y de hecho buena parte de las solicitudes llegan de noche.
    const hora = source === 'phone' ? 9 + Math.floor(rand() * 11) : Math.floor(rand() * 24);
    const minuto = Math.floor(rand() * 60);

    // Quién viene, antes de qué pide: el tipo solicitado tiene que caberles.
    const adults = [2, 2, 2, 3, 4, 1, 2, 5][Math.floor(rand() * 8)]!;
    const childrenAges =
      rand() < 0.45
        ? Array.from({ length: 1 + Math.floor(rand() * 2) }, () => 2 + Math.floor(rand() * 14))
        : [];
    const pax = adults + childrenAges.length;
    const caben = unitTypeDefs.filter((d) => d.capMax >= pax);
    const tipoPedido = pideTipo ? (caben[Math.floor(rand() * caben.length)]?.id ?? null) : null;

    // Antelación con la que se pide la estancia: de 4 días (última hora) a ~11
    // semanas. El mínimo es la invariante: nadie escribe pidiendo una estancia
    // que ya ha empezado.
    const antelacion = 4 + Math.floor(rand() * 74);
    const from = hasDates ? addDays(recibida, antelacion) : null;

    const mensajes = ENQ_MENSAJES[locale] ?? ENQ_MENSAJES.es!;
    const contact: ContactInfo = {
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}${n}@example.com`,
      // El prefijo va con el idioma: un +33 en una solicitud en neerlandés es la
      // misma clase de mentira que el mensaje en castellano firmado por Klara.
      phone: n % 2 ? `${ENQ_PREFIJO[locale] ?? '+34'} 6${10000000 + n * 731}` : undefined,
      locale,
    };
    enquiries.push({
      id: `enq_${String(n).padStart(3, '0')}`,
      tenant_id: T,
      status,
      date_from: from,
      date_to: from ? addDays(from, 3 + Math.floor(rand() * 9)) : null,
      occupancy: hasDates
        ? { adults, childrenAges, pets: rand() < 0.2 ? 1 : 0, vehicles: 1 }
        : null,
      unit_type_id: tipoPedido,
      message: mensajes[Math.floor(rand() * mensajes.length)]!,
      contact,
      locale,
      source,
      converted_booking_id: status === 'converted' ? `bkg_${String(n).padStart(3, '0')}` : null,
      created_at: `${recibida}T${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}:00.000Z`,
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
