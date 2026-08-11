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

const year = new Date().getUTCFullYear();
const tenantId = 'ten_serralta';

const seasons: WebSeason[] = [
  { id: 'sea_deshielo', tenant_id: tenantId, name: 'Deshielo', date_from: `${year}-05-01`, date_to: `${year}-06-20`, priority: 0, is_open: true },
  { id: 'sea_cumbre', tenant_id: tenantId, name: 'Cumbre', date_from: `${year}-06-20`, date_to: `${year}-09-10`, priority: 1, is_open: true },
  { id: 'sea_setas', tenant_id: tenantId, name: 'Setas', date_from: `${year}-09-10`, date_to: `${year}-11-03`, priority: 0, is_open: true },
];

const unitTypes: WebUnitType[] = [
  {
    id: 'ut_bosque', tenant_id: tenantId, kind: 'pitch',
    name_i18n: { es: 'Parcela Bosque' }, capacity_min: 1, capacity_max: 6,
    included_persons: 2, features: { m2: 75, electricityAmps: 10, shade: 'total', pets: true },
    photos: ['tipo-parcela-bosque'], unitCount: 48,
  },
  {
    id: 'ut_mirador', tenant_id: tenantId, kind: 'pitch',
    name_i18n: { es: 'Parcela Mirador' }, capacity_min: 1, capacity_max: 6,
    included_persons: 2, features: { m2: 90, electricityAmps: 10, shade: 'partial', pets: true },
    photos: ['tipo-parcela-mirador'], unitCount: 18,
  },
  {
    id: 'ut_cabana', tenant_id: tenantId, kind: 'lodging',
    name_i18n: { es: 'Cabaña Pizarra' }, capacity_min: 1, capacity_max: 4,
    included_persons: 2, features: { m2: 32, beds: 2, bathrooms: 1, airCon: false, pets: false },
    photos: ['tipo-cabana-pizarra'], unitCount: 10,
  },
  {
    id: 'ut_refugio', tenant_id: tenantId, kind: 'lodging',
    name_i18n: { es: 'Refugio Serralta' }, capacity_min: 1, capacity_max: 6,
    included_persons: 4, features: { m2: 44, beds: 3, bathrooms: 1, airCon: false, pets: true },
    photos: ['tipo-refugio-familiar'], unitCount: 4,
  },
];

const prices: Record<string, [number, number, number, number]> = {
  sea_deshielo: [2800, 3400, 8200, 10800],
  sea_cumbre: [3900, 4700, 11800, 14600],
  sea_setas: [3100, 3700, 9100, 11900],
};

const ratePlans: WebRatePlan[] = seasons.flatMap((season) =>
  unitTypes.map((type, index) => ({
    id: `rp_${type.id}_${season.id}`,
    tenant_id: tenantId,
    unit_type_id: type.id,
    season_id: season.id,
    base_cents: prices[season.id]![index]!,
    extra_person_cents: type.kind === 'pitch' ? 850 : 1300,
    child_cents: type.kind === 'pitch' ? 600 : 900,
    pet_cents: type.kind === 'pitch' ? 450 : 0,
    electricity_cents: 0,
    vehicle_cents: 500,
    min_stay: season.id === 'sea_cumbre' && type.kind === 'lodging' ? 3 : 1,
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
    { id: 'ext_lena', tenant_id: tenantId, name_i18n: { es: 'Saco de leña certificada' }, price_cents: 750, per: 'stay', required: false },
    { id: 'ext_mascota', tenant_id: tenantId, name_i18n: { es: 'Mascota en parcela o refugio' }, price_cents: 450, per: 'night', required: false },
  ],
};

export default webData;
