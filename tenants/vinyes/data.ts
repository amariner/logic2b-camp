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
const tenantId = 'ten_vinyes';

const seasons: WebSeason[] = [
  { id: 'sea_brotacion', tenant_id: tenantId, name: 'Brotación', date_from: `${year}-03-15`, date_to: `${year}-06-15`, priority: 0, is_open: true },
  { id: 'sea_verano', tenant_id: tenantId, name: 'Verano', date_from: `${year}-06-01`, date_to: `${year}-09-30`, priority: 1, is_open: true },
  { id: 'sea_vendimia', tenant_id: tenantId, name: 'Vendimia', date_from: `${year}-08-25`, date_to: `${year}-10-12`, priority: 2, is_open: true },
  { id: 'sea_reposo', tenant_id: tenantId, name: 'Reposo', date_from: `${year}-10-12`, date_to: `${year}-12-08`, priority: 0, is_open: true },
];

const unitTypes: WebUnitType[] = [
  {
    id: 'ut_cepa', tenant_id: tenantId, kind: 'pitch',
    name_i18n: { es: 'Parcela Cepa' }, capacity_min: 1, capacity_max: 6,
    included_persons: 2, features: { m2: 80, electricityAmps: 10, shade: 'partial', pets: true },
    photos: ['tipo-parcela-cepa'], unitCount: 38,
  },
  {
    id: 'ut_bancal', tenant_id: tenantId, kind: 'pitch',
    name_i18n: { es: 'Parcela Bancal' }, capacity_min: 1, capacity_max: 6,
    included_persons: 2, features: { m2: 90, electricityAmps: 10, shade: 'partial', pets: true },
    photos: ['tipo-parcela-bancal'], unitCount: 18,
  },
  {
    id: 'ut_cal', tenant_id: tenantId, kind: 'lodging',
    name_i18n: { es: 'Cabaña de Cal' }, capacity_min: 1, capacity_max: 4,
    included_persons: 2, features: { m2: 34, beds: 2, bathrooms: 1, airCon: true, pets: false },
    photos: ['tipo-cabana-cal'], unitCount: 10,
  },
  {
    id: 'ut_caseta', tenant_id: tenantId, kind: 'lodging',
    name_i18n: { es: 'Caseta de Viña' }, capacity_min: 1, capacity_max: 4,
    included_persons: 2, features: { m2: 42, beds: 2, bathrooms: 1, airCon: true, pets: false },
    photos: ['tipo-caseta-vinya'], unitCount: 4,
  },
];

const prices: Record<string, [number, number, number, number]> = {
  sea_brotacion: [2900, 3500, 8400, 10200],
  sea_verano: [3900, 4700, 11200, 13600],
  sea_vendimia: [4400, 5200, 12600, 14900],
  sea_reposo: [2700, 3300, 7900, 9600],
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
    min_stay: season.id === 'sea_vendimia' && type.kind === 'lodging' ? 3 : 1,
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
    { id: 'ext_cesta', tenant_id: tenantId, name_i18n: { es: 'Cesta de desayuno local' }, price_cents: 1800, per: 'stay', required: false },
    { id: 'ext_mascota', tenant_id: tenantId, name_i18n: { es: 'Mascota en parcela' }, price_cents: 450, per: 'night', required: false },
  ],
};

export default webData;
