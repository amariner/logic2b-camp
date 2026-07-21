/**
 * Seed MÍNIMO de partida (ADR 0012 §4): un tipo de unidad, una temporada,
 * un plan tarifario, un usuario owner. Sustituye estos datos por los reales
 * del camping (Capa 2 del asistente: `/new-camping` interpreta su PDF de
 * tarifas y su Excel de parcelas y AMPLÍA este fichero — no lo reescribe
 * desde cero). Mismo patrón que `tenants/demo/seed.ts`: generador PURO y
 * DETERMINISTA que emite SQL, sin tocar D1 directamente.
 */
type Row = Record<string, unknown>;

const q = (v: unknown): string => {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? '1' : '0';
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  return `'${s.replace(/'/g, "''")}'`;
};

// Tablas tipadas: la web pública las consume en build (tenants/{slug}/data.ts)
// — misma fuente de verdad que la D1, mismo patrón que tenants/demo/seed.ts.
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
  name_i18n: Record<string, string>;
  capacity_min: number;
  capacity_max: number;
  included_persons: number;
  features: Record<string, unknown>;
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
  name_i18n: Record<string, string>;
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
  bookings: Row[];
  guests: Row[];
  booking_guests: Row[];
  payments: Row[];
  users: Row[];
  accounts: Row[];
};

/** TODO (alta de camping): slug real del tenant — debe coincidir con wrangler.jsonc. */
const SLUG = '__SLUG__';
const T = `ten_${SLUG}`;

export function generateSeed(year: number): SeedData {
  const anchor = `${year}-01-01`;

  // TODO: sustituir por las temporadas reales (PDF de tarifas del cliente).
  const seasons: SeedSeason[] = [
    {
      id: `sea_${SLUG}_base`,
      tenant_id: T,
      name: 'Temporada única',
      date_from: `${year}-01-01`,
      date_to: `${year}-12-31`,
      priority: 0,
      is_open: true,
    },
  ];

  // TODO: sustituir por los tipos de unidad reales (Excel de parcelas del cliente).
  const unit_types: SeedUnitType[] = [
    {
      id: 'ut_estandar',
      tenant_id: T,
      kind: 'pitch',
      name_i18n: { es: 'Parcela Estándar' },
      capacity_min: 1,
      capacity_max: 6,
      included_persons: 2,
      features: {},
      photos: [],
    },
  ];

  // TODO: una fila por unidad física real (código de la propia numeración del camping).
  const units: Row[] = ['01', '02', '03'].map((code) => ({
    id: `unt_${SLUG}_${code}`,
    tenant_id: T,
    unit_type_id: 'ut_estandar',
    code: `P-${code}`,
    attributes: {},
    status: 'active',
  }));

  // TODO: precios reales — hoy 0 céntimos a propósito, para que sea imposible
  // desplegar con un precio inventado sin darse cuenta.
  const rate_plans: SeedRatePlan[] = [
    {
      id: `rp_${SLUG}_base`,
      tenant_id: T,
      unit_type_id: 'ut_estandar',
      season_id: `sea_${SLUG}_base`,
      base_cents: 0,
      extra_person_cents: 0,
      child_cents: 0,
      pet_cents: 0,
      electricity_cents: 0,
      vehicle_cents: 0,
      min_stay: 1,
      max_stay: null,
      arrival_days: null,
      departure_days: null,
    },
  ];

  // Un owner de arranque — hash scrypt REAL de la contraseña "cambia-esta-clave"
  // (calculado con `better-auth/crypto` `hashPassword`, verificado con `verifyPassword`
  // antes de fijarlo aquí — igual de determinista que el de la demo, ADR 0005).
  // CAMBIAR LA CONTRASEÑA es el primer paso del checklist del README antes de
  // dar el acceso al cliente.
  const PLACEHOLDER_PASSWORD_HASH =
    '7572ccd063ba9d92692df9cf6af051da:92b88d55e9499ecd65472e8ce8cff273b92085be344a5233a2c6100703805437e48f487b011b318b3c9ff2e6c00da3b9df87afb940220622ead6dbe102a2c019';
  const authTs = Date.parse(`${anchor}T00:00:00.000Z`);
  const users: Row[] = [
    {
      id: 'usr_owner',
      tenant_id: T,
      email: 'owner@__DOMINIO__',
      role: 'owner',
      name: 'Dirección',
      email_verified: true,
      image: null,
      created_at: authTs,
      updated_at: authTs,
    },
  ];
  const accounts: Row[] = users.map((u) => ({
    id: `acc_${String(u.id).slice(4)}`,
    user_id: u.id,
    account_id: u.id,
    provider_id: 'credential',
    password: PLACEHOLDER_PASSWORD_HASH,
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
        slug: SLUG,
        // TODO: nombre real, zona horaria real, moneda si no es EUR.
        name: '__NOMBRE_DEL_CAMPING__',
        tier: 1,
        timezone: 'Europe/Madrid',
        currency: 'EUR',
        locales: ['es'],
        modules: {
          web: true,
          booking: 'email', // nivel 1: formulario→email, sin motor (ver docs/TIERS.md)
          dashboard: false,
          payments: { provider: 'none', mode: 'none' },
          taxPolicy: 'none', // TODO: 'valencia'|'catalunya' según la comunidad autónoma
          notifications: {},
        },
      },
    ],
    seasons_calendar: seasons,
    unit_types,
    units,
    rate_plans,
    rate_rules: [],
    extras: [],
    inventory_blocks: [],
    enquiries: [],
    bookings: [],
    guests: [],
    booking_guests: [],
    payments: [],
    users,
    accounts,
  };
}

export function seedToSql(data: SeedData): string {
  const out: string[] = [
    `-- Seed de ${data.tenants[0]?.slug ?? '__SLUG__'} (generado — no editar a mano)`,
  ];
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
      out.push(
        `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${cols.map((c) => q(row[c])).join(', ')});`,
      );
    }
  }
  return out.join('\n');
}
