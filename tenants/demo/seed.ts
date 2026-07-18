/**
 * Seed demo — Camping Cala Sereno (ficticio).
 * Generador PURO y DETERMINISTA: misma fecha ancla → mismo resultado.
 * Fechas relativas al ancla (año de la temporada en curso) → preparado
 * para el reset nocturno de la Fase 10. Emite sentencias SQL.
 */
import type {
  ContactInfo,
  Occupancy,
  PriceBreakdown,
  PriceLine,
} from '@logic-camp/db/schema';

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
export type SeedData = {
  anchor: string;
  tenants: Row[];
  seasons_calendar: Row[];
  unit_types: Row[];
  units: Row[];
  rate_plans: Row[];
  rate_rules: Row[];
  extras: Row[];
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
    { id: 'sea_apertura', name: 'Apertura', date_from: `${Y}-03-15`, date_to: `${Y}-11-01`, priority: 0, is_open: true },
    { id: 'sea_media', name: 'Temporada media', date_from: `${Y}-06-01`, date_to: `${Y}-09-15`, priority: 10, is_open: true },
    { id: 'sea_alta', name: 'Temporada alta', date_from: `${Y}-07-01`, date_to: `${Y}-08-31`, priority: 20, is_open: true },
  ];

  // --- tipos: 4 de parcela (60 uds), 3 de bungalow (18), 1 glamping (5) ---
  const unitTypeDefs = [
    { id: 'ut_std', kind: 'pitch', es: 'Parcela Estándar', en: 'Standard Pitch', capMax: 6, incl: 2, count: 24, m2: 70, elec: 6, shade: 'parcial', base: [1800, 2600, 3800] },
    { id: 'ut_conf', kind: 'pitch', es: 'Parcela Confort', en: 'Comfort Pitch', capMax: 6, incl: 2, count: 18, m2: 90, elec: 10, shade: 'total', base: [2400, 3300, 4600] },
    { id: 'ut_prem', kind: 'pitch', es: 'Parcela Premium Mar', en: 'Premium Sea Pitch', capMax: 6, incl: 2, count: 10, m2: 100, elec: 16, shade: 'total', base: [3000, 4200, 5900] },
    { id: 'ut_moto', kind: 'pitch', es: 'Parcela Autocaravana', en: 'Motorhome Pitch', capMax: 4, incl: 2, count: 8, m2: 80, elec: 10, shade: 'parcial', base: [2200, 3000, 4200] },
    { id: 'ut_bung4', kind: 'lodging', es: 'Bungalow 4 pax', en: 'Bungalow 4 pax', capMax: 4, incl: 4, count: 8, beds: 3, baths: 1, base: [7500, 10500, 15500] },
    { id: 'ut_bung6', kind: 'lodging', es: 'Bungalow 6 pax Vista Mar', en: 'Sea View Bungalow 6 pax', capMax: 6, incl: 6, count: 6, beds: 4, baths: 2, base: [9500, 13500, 19500] },
    { id: 'ut_mobil', kind: 'lodging', es: 'Mobil-home 5 pax', en: 'Mobile home 5 pax', capMax: 5, incl: 5, count: 4, beds: 3, baths: 1, base: [8200, 11500, 16800] },
    { id: 'ut_glamp', kind: 'lodging', es: 'Tienda Glamping', en: 'Glamping Tent', capMax: 4, incl: 2, count: 5, beds: 2, baths: 0, base: [6000, 8500, 12500] },
  ] as const;

  const unit_types: Row[] = unitTypeDefs.map((d) => ({
    id: d.id,
    tenant_id: T,
    kind: d.kind,
    name_i18n: { es: d.es, en: d.en },
    capacity_min: 1,
    capacity_max: d.capMax,
    included_persons: d.incl,
    features:
      d.kind === 'pitch'
        ? { m2: (d as { m2: number }).m2, electricityAmps: (d as { elec: number }).elec, shade: (d as { shade: string }).shade, pets: true }
        : { beds: (d as { beds: number }).beds, bathrooms: (d as { baths: number }).baths, pets: d.id === 'ut_mobil', airCon: d.id !== 'ut_glamp' },
    photos: [],
  }));

  const units: Row[] = [];
  const prefixes: Record<string, string> = { ut_std: 'A', ut_conf: 'B', ut_prem: 'C', ut_moto: 'D', ut_bung4: 'BG', ut_bung6: 'BM', ut_mobil: 'MH', ut_glamp: 'GL' };
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
  const rate_plans: Row[] = [];
  unitTypeDefs.forEach((d) => {
    seasons.forEach((s, si) => {
      rate_plans.push({
        id: `rp_${d.id.slice(3)}_${s.id.slice(4)}`,
        tenant_id: T,
        unit_type_id: d.id,
        season_id: s.id,
        base_cents: d.base[si],
        extra_person_cents: d.kind === 'pitch' ? [450, 550, 700][si] : 0,
        child_cents: d.kind === 'pitch' ? [300, 350, 450][si] : 0,
        pet_cents: 350,
        electricity_cents: d.kind === 'pitch' ? 550 : 0,
        vehicle_cents: d.kind === 'pitch' ? 400 : 0,
        min_stay: s.id === 'sea_alta' ? (d.kind === 'lodging' ? 7 : 3) : s.id === 'sea_media' ? 2 : 1,
        max_stay: null,
        arrival_days: s.id === 'sea_alta' && d.kind === 'lodging' ? [6] : null, // solo sábados
        departure_days: null,
      });
    });
  });

  const rate_rules: Row[] = [
    { id: 'rr_early', tenant_id: T, type: 'early_booking', conditions: { minDaysAhead: 60 }, discount: { type: 'percent', value: 10 }, stackable: false, priority: 10 },
    { id: 'rr_long', tenant_id: T, type: 'long_stay', conditions: { minNights: 14 }, discount: { type: 'percent', value: 8 }, stackable: true, priority: 20 },
    { id: 'rr_acsi', tenant_id: T, type: 'acsi', conditions: { card: 'acsi', seasons: ['sea_apertura'] }, discount: { type: 'percent', value: 20 }, stackable: false, priority: 5 },
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
  const extras: Row[] = extrasDefs.map(([id, es, en, price, per, required]) => ({
    id, tenant_id: T, name_i18n: { es, en }, price_cents: price, per, required,
  }));

  // --- bloqueos: mantenimiento + larga estancia (caso límite 6 del motor) ---
  const inventory_blocks: Row[] = [
    { id: 'blk_maint1', tenant_id: T, unit_id: 'unt_bung4_03', unit_type_id: null, date_from: `${Y}-07-10`, date_to: `${Y}-07-17`, reason: 'maintenance' },
    { id: 'blk_maint2', tenant_id: T, unit_id: 'unt_std_11', unit_type_id: null, date_from: `${Y}-06-20`, date_to: `${Y}-06-27`, reason: 'maintenance' },
    { id: 'blk_long1', tenant_id: T, unit_id: 'unt_std_24', unit_type_id: null, date_from: `${Y}-04-01`, date_to: `${Y}-10-01`, reason: 'longstay' },
    { id: 'blk_long2', tenant_id: T, unit_id: 'unt_conf_18', unit_type_id: null, date_from: `${Y}-05-01`, date_to: `${Y}-09-30`, reason: 'longstay' },
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

  const firstNames = ['María', 'Jan', 'Sophie', 'Luca', 'Emma', 'Pierre', 'Anna', 'Tom', 'Carmen', 'Lars', 'Julia', 'David', 'Nina', 'Paul', 'Sara', 'Marc', 'Lena', 'Hugo', 'Eva', 'Jordi'];
  const lastNames = ['García', 'de Vries', 'Martin', 'Rossi', 'Müller', 'Dubois', 'Jansen', 'Smith', 'López', 'Nielsen', 'Weber', 'Ferrer', 'Bakker', 'Laurent', 'Serra', 'Klein', 'Moreau', 'Costa', 'Peeters', 'Vidal'];
  const locales = ['es', 'es', 'fr', 'de', 'nl', 'en', 'ca'];

  const seasonFor = (date: string) =>
    [...seasons].sort((a, b) => b.priority - a.priority).find((s) => date >= s.date_from && date < s.date_to) ?? seasons[0]!;

  const planFor = (typeId: string, seasonId: string) =>
    rate_plans.find((p) => p.unit_type_id === typeId && p.season_id === seasonId)!;

  function makeBreakdown(typeId: string, from: string, to: string, occ: Occupancy, pets: number): PriceBreakdown {
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
      lines.push({ concept: 'price.base', detail: { season: s.name, nights, perNight: base }, amountCents: base * nights });
      const typeDef = unitTypeDefs.find((t) => t.id === typeId)!;
      const extraAdults = Math.max(0, occ.adults - typeDef.incl);
      const children = occ.childrenAges.length;
      if (typeDef.kind === 'pitch') {
        if (extraAdults > 0) lines.push({ concept: 'price.extra_person', detail: { season: s.name, nights, persons: extraAdults }, amountCents: (plan.extra_person_cents as number) * extraAdults * nights });
        if (children > 0) lines.push({ concept: 'price.child', detail: { season: s.name, nights, children }, amountCents: (plan.child_cents as number) * children * nights });
        lines.push({ concept: 'price.electricity', detail: { season: s.name, nights }, amountCents: (plan.electricity_cents as number) * nights });
      }
      if (pets > 0) lines.push({ concept: 'price.pet', detail: { season: s.name, nights, pets }, amountCents: (plan.pet_cents as number) * pets * nights });
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
  function addBooking(opts: {
    typeId: string; unitIdx?: number | null; from: string; to: string;
    status: BookingSeed['status'] extends string ? string : string;
    channel?: string; occ?: Occupancy; pets?: number; notes?: string | null; paidRatio?: number;
  }) {
    bkgN++;
    const id = `bkg_${String(bkgN).padStart(3, '0')}`;
    const occ: Occupancy = opts.occ ?? { adults: 2, childrenAges: [], pets: opts.pets ?? 0, vehicles: 1 };
    const typeUnits = units.filter((u) => u.unit_type_id === opts.typeId);
    let unit_id: string | null = null;
    if (opts.unitIdx !== null) {
      // asignación: primera unidad del tipo libre en el rango (solo reservas activas ocupan)
      const range: [string, string] = [opts.from, opts.to];
      const isActive = opts.status === 'confirmed' || opts.status === 'pending' || opts.status === 'completed';
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
    const locale = locales[bkgN % locales.length]!;
    gstN++;
    const gid = `gst_${String(gstN).padStart(3, '0')}`;
    const fn = firstNames[bkgN % firstNames.length]!;
    const ln = lastNames[(bkgN * 3) % lastNames.length]!;
    guests.push({ id: gid, tenant_id: T, name: fn, surname: ln, doc_type: 'passport', doc_number: `X${String(1000000 + bkgN * 137)}`, birthdate: `${1960 + (bkgN % 40)}-0${1 + (bkgN % 9)}-15`, nationality: locale === 'es' || locale === 'ca' ? 'ES' : locale.toUpperCase(), email: `${fn.toLowerCase()}.${ln.toLowerCase().replace(/ /g, '')}@example.com`, phone: `+34 6${String(10000000 + bkgN * 9137)}`, address: null, gdpr_consent_at: now });
    booking_guests.push({ booking_id: id, guest_id: gid, is_lead: true });
    bookings.push({
      id, tenant_id: T, code: `CS-${Y}-${String(bkgN).padStart(4, '0')}`,
      status: opts.status, channel: opts.channel ?? 'web',
      date_from: opts.from, date_to: opts.to,
      unit_type_id: opts.typeId, unit_id,
      occupancy: occ, extras: [],
      price_breakdown: breakdown,
      total_cents: total, paid_cents: paid,
      tourist_tax_cents: breakdown.touristTaxCents,
      deposit_cents: opts.typeId.startsWith('ut_bung') || opts.typeId === 'ut_mobil' ? 10000 : 0,
      notes: opts.notes ?? null, locale,
      created_at: now, updated_at: now,
    });
    if (paid > 0) {
      payments.push({ id: `pay_${String(bkgN).padStart(3, '0')}a`, booking_id: id, provider: 'stripe', provider_ref: `pi_demo_${bkgN}`, amount_cents: paid, status: 'succeeded', raw: null, created_at: now });
    }
    return id;
  }

  // Casos límite explícitos
  addBooking({ typeId: 'ut_bung6', from: `${Y}-06-25`, to: `${Y}-07-05`, status: 'confirmed', notes: 'Cruza temporada media→alta (precio por tramos)' });
  addBooking({ typeId: 'ut_std', from: `${Y}-05-02`, to: `${Y}-05-30`, status: 'completed', occ: { adults: 2, childrenAges: [], pets: 1, vehicles: 1 }, paidRatio: 1, notes: 'Estancia larga 28 noches con mascota' });
  addBooking({ typeId: 'ut_conf', from: `${Y}-07-19`, to: `${Y}-07-26`, status: 'confirmed', occ: { adults: 4, childrenAges: [3, 8, 12, 15], pets: 0, vehicles: 2 }, notes: 'Grupo familiar 8 pax — niño de 3 años exento de tasa' });
  addBooking({ typeId: 'ut_bung4', from: `${Y}-08-02`, to: `${Y}-08-09`, status: 'cancelled', paidRatio: 0.5, notes: 'Cancelada con señal pagada' });
  addBooking({ typeId: 'ut_glamp', from: `${Y}-07-12`, to: `${Y}-07-14`, status: 'no_show', paidRatio: 0.3, notes: 'No-show' });
  addBooking({ typeId: 'ut_bung4', unitIdx: null, from: `${Y}-08-16`, to: `${Y}-08-23`, status: 'confirmed', notes: 'Sin unidad asignada — para probar asignación' });

  // Relleno: ocupación de agosto y temporada media, canales variados
  const fillDefs: [string, string, number, number][] = [
    ['ut_std', `${Y}-07-15`, 7, 8], ['ut_std', `${Y}-08-01`, 14, 4], ['ut_conf', `${Y}-08-05`, 7, 5],
    ['ut_prem', `${Y}-07-22`, 10, 3], ['ut_moto', `${Y}-06-10`, 3, 3], ['ut_bung6', `${Y}-08-09`, 7, 3],
    ['ut_mobil', `${Y}-07-05`, 7, 2], ['ut_glamp', `${Y}-06-20`, 4, 2], ['ut_bung4', `${Y}-09-01`, 5, 2],
    ['ut_std', `${Y}-09-10`, 5, 2],
  ];
  for (const [typeId, start, nights, count] of fillDefs) {
    for (let i = 0; i < count; i++) {
      const from = addDays(start, Math.floor(rand() * 4) * (i % 3));
      const status = rand() < 0.12 ? 'pending' : 'confirmed';
      const channel = rand() < 0.2 ? 'phone' : rand() < 0.1 ? 'walkin' : 'web';
      const adults = 2 + Math.floor(rand() * 3);
      const nChildren = Math.floor(rand() * 3);
      const childrenAges = Array.from({ length: nChildren }, (_, k) => 2 + ((bkgN + k * 5) % 15));
      addBooking({ typeId, from, to: addDays(from, nights), status, channel, occ: { adults, childrenAges, pets: rand() < 0.25 ? 1 : 0, vehicles: 1 } });
    }
  }

  // --- 15 solicitudes en todos los estados ---
  const enquiries: Row[] = [];
  const enqStatuses = ['new', 'new', 'new', 'new', 'contacted', 'contacted', 'contacted', 'quoted', 'quoted', 'quoted', 'converted', 'converted', 'lost', 'lost', 'lost'];
  enqStatuses.forEach((status, i) => {
    const n = i + 1;
    const fn = firstNames[(n * 7) % firstNames.length]!;
    const ln = lastNames[(n * 11) % lastNames.length]!;
    const locale = locales[n % locales.length]!;
    const hasDates = n % 4 !== 0;
    const from = hasDates ? addDays(`${Y}-07-01`, (n * 3) % 60) : null;
    const contact: ContactInfo = { name: `${fn} ${ln}`, email: `${fn.toLowerCase()}${n}@example.com`, phone: n % 2 ? `+33 6${10000000 + n * 731}` : undefined, locale };
    enquiries.push({
      id: `enq_${String(n).padStart(3, '0')}`,
      tenant_id: T,
      status,
      date_from: from,
      date_to: from ? addDays(from, 3 + (n % 7)) : null,
      occupancy: hasDates ? { adults: 2, childrenAges: n % 3 ? [4] : [], pets: n % 5 === 0 ? 1 : 0, vehicles: 1 } : null,
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
  const DEMO_PASSWORD_HASH =
    '931abc0463c0d2df6516487fdc25c1b3:d6bac2bf4c8ad0619f9355e39697834c72f0381a538bcb36beba1890b6fb90831ccd3fe61de0378819d76ea71806f198efa575673fab62a4a2f012be4bfc164a';
  const authTs = Date.parse(`${anchor}T00:00:00.000Z`);
  const users: Row[] = [
    { id: 'usr_owner', tenant_id: T, email: 'direccion@calasereno.example', role: 'owner', name: 'Dirección' },
    { id: 'usr_manager', tenant_id: T, email: 'gerencia@calasereno.example', role: 'manager', name: 'Gerencia' },
    { id: 'usr_recepcion', tenant_id: T, email: 'recepcion@calasereno.example', role: 'reception', name: 'Recepción' },
    { id: 'usr_consulta', tenant_id: T, email: 'consulta@calasereno.example', role: 'readonly', name: 'Consulta' },
  ].map((u) => ({ ...u, email_verified: true, image: null, created_at: authTs, updated_at: authTs }));
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
    tenants: [{ id: T, slug: 'demo', name: 'Camping Cala Sereno', tier: 3, timezone: 'Europe/Madrid', currency: 'EUR', locales: ['es', 'ca', 'en', 'fr', 'de', 'nl'], modules: { web: true, booking: 'instant', dashboard: 'full', payments: 'stripe' } }],
    seasons_calendar: seasons.map((s) => ({ ...s, tenant_id: T })),
    unit_types, units, rate_plans, rate_rules, extras, inventory_blocks,
    enquiries, bookings, guests, booking_guests, payments, users, accounts,
  };
}

// ---------- SQL ----------

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
    for (const row of rows) {
      out.push(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${cols.map((c) => q(row[c])).join(', ')});`);
    }
  }
  return out.join('\n');
}
