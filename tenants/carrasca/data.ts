export type WebSeason = {
  id: string;
  tenant_id: string;
  name: string;
  date_from: string;
  date_to: string;
  priority: number;
  is_open: boolean;
};

type UnitFeatures = {
  m2?: number;
  electricityAmps?: number;
  shade?: 'partial' | 'total';
  beds?: number;
  bathrooms?: number;
  airCon?: boolean;
  pets?: boolean;
};

export type WebUnitType = {
  id: string;
  tenant_id: string;
  kind: 'pitch' | 'lodging';
  name_i18n: Record<string, string>;
  capacity_min: number;
  capacity_max: number;
  included_persons: number;
  features: UnitFeatures;
  photos: string[];
  unitCount: number;
};

export type WebRatePlan = {
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

export type WebExtra = {
  id: string;
  tenant_id: string;
  name_i18n: Record<string, string>;
  price_cents: number;
  per: 'person' | 'stay' | 'night';
  required: boolean;
};

export type WebData = {
  year: number;
  seasons: WebSeason[];
  unitTypes: WebUnitType[];
  ratePlans: WebRatePlan[];
  extras: WebExtra[];
};

const year = 2026;
const tenantId = 'ten_carrasca';

const seasons: WebSeason[] = [
  {
    id: 'sea_baja',
    tenant_id: tenantId,
    name: 'Invierno abierto',
    date_from: `${year}-01-01`,
    date_to: `${year}-04-01`,
    priority: 0,
    is_open: true,
  },
  {
    id: 'sea_primavera',
    tenant_id: tenantId,
    name: 'Primavera del carrascal',
    date_from: `${year}-04-01`,
    date_to: `${year}-06-15`,
    priority: 0,
    is_open: true,
  },
  {
    id: 'sea_verano',
    tenant_id: tenantId,
    name: 'Verano de interior',
    date_from: `${year}-06-15`,
    date_to: `${year}-09-15`,
    priority: 1,
    is_open: true,
  },
  {
    id: 'sea_otono', tenant_id: tenantId, name: 'Otoño',
    date_from: `${year}-09-15`, date_to: `${year}-12-31`, priority: 0,
    is_open: true,
  },
];

const unitTypes: WebUnitType[] = [
  {
    id: 'ut_encina',
    tenant_id: tenantId,
    kind: 'pitch',
    name_i18n: { es: 'Parcela Encina' },
    capacity_min: 1,
    capacity_max: 6,
    included_persons: 2,
    features: { m2: 90, electricityAmps: 10, shade: 'total', pets: true },
    photos: ['parcela-encina'],
    unitCount: 80,
  },
  {
    id: 'ut_carrascal',
    tenant_id: tenantId,
    kind: 'pitch',
    name_i18n: { es: 'Parcela Carrascal' },
    capacity_min: 1,
    capacity_max: 6,
    included_persons: 2,
    features: { m2: 110, electricityAmps: 16, shade: 'partial', pets: true },
    photos: ['parcela-carrascal'],
    unitCount: 30,
  },
  {
    id: 'ut_bellota',
    tenant_id: tenantId,
    kind: 'lodging',
    name_i18n: { es: 'Bungalow Bellota' },
    capacity_min: 1,
    capacity_max: 4,
    included_persons: 4,
    features: { m2: 36, beds: 2, bathrooms: 1, airCon: true, pets: false },
    photos: ['bungalow-bellota'],
    unitCount: 24,
  },
  {
    id: 'ut_umbria',
    tenant_id: tenantId,
    kind: 'lodging',
    name_i18n: { es: 'Casa Umbría' },
    capacity_min: 1,
    capacity_max: 6,
    included_persons: 4,
    features: { m2: 54, beds: 4, bathrooms: 2, airCon: true, pets: false },
    photos: ['casa-umbria'],
    unitCount: 16,
  },
];

const prices: Record<string, [number, number, number, number]> = {
  sea_baja: [2600, 3300, 7900, 11200],
  sea_primavera: [3400, 4200, 9800, 13400],
  sea_verano: [4900, 5900, 13900, 17800],
  sea_otono: [3000, 3700, 8600, 11900],
};

const ratePlans: WebRatePlan[] = seasons.flatMap((season) =>
  unitTypes.map((type, index) => ({
    id: `rp_${type.id}_${season.id}`,
    tenant_id: tenantId,
    unit_type_id: type.id,
    season_id: season.id,
    base_cents: prices[season.id]![index]!,
    extra_person_cents: type.kind === 'pitch' ? 950 : 1600,
    child_cents: type.kind === 'pitch' ? 700 : 1100,
    pet_cents: type.kind === 'pitch' ? 600 : 0,
    electricity_cents: 0,
    vehicle_cents: 700,
    min_stay: season.id === 'sea_verano' && type.kind === 'lodging' ? 4 : 1,
    max_stay: null,
    arrival_days: null,
    departure_days: null,
  })),
);

export const webData: WebData = {
  year,
  seasons,
  unitTypes,
  ratePlans,
  extras: [
    {
      id: 'ext_lena',
      tenant_id: tenantId,
      name_i18n: { es: 'Saco de leña local' },
      price_cents: 900,
      per: 'stay',
      required: false,
    },
    {
      id: 'ext_cuna',
      tenant_id: tenantId,
      name_i18n: { es: 'Cuna y trona' },
      price_cents: 0,
      per: 'stay',
      required: false,
    },
    {
      id: 'ext_cancelacion',
      tenant_id: tenantId,
      name_i18n: { es: 'Cobertura de cancelación flexible' },
      price_cents: 1200,
      per: 'stay',
      required: false,
    },
    {
      id: 'ext_mascota',
      tenant_id: tenantId,
      name_i18n: { es: 'Mascota en parcela' },
      price_cents: 600,
      per: 'night',
      required: false,
    },
  ],
};

export default webData;
