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
const tenantId = 'ten_tarongers';

const seasons: WebSeason[] = [
  { id: 'sea_azahar', tenant_id: tenantId, name: 'Azahar', date_from: `${year}-02-15`, date_to: `${year}-05-01`, priority: 0, is_open: true },
  { id: 'sea_templada', tenant_id: tenantId, name: 'Templada', date_from: `${year}-05-01`, date_to: `${year}-06-21`, priority: 0, is_open: true },
  { id: 'sea_verano', tenant_id: tenantId, name: 'Verano familiar', date_from: `${year}-06-21`, date_to: `${year}-09-15`, priority: 1, is_open: true },
  { id: 'sea_cosecha', tenant_id: tenantId, name: 'Cosecha', date_from: `${year}-09-15`, date_to: `${year}-12-08`, priority: 0, is_open: true },
];

const unitTypes: WebUnitType[] = [
  {
    id: 'ut_taronger', tenant_id: tenantId, kind: 'pitch',
    name_i18n: { es: 'Parcela Taronger' }, capacity_min: 1, capacity_max: 6,
    included_persons: 2, features: { m2: 78, electricityAmps: 10, shade: 'total', pets: true },
    photos: ['tipo-parcela-taronger'], unitCount: 60,
  },
  {
    id: 'ut_sequia', tenant_id: tenantId, kind: 'pitch',
    name_i18n: { es: 'Parcela Séquia' }, capacity_min: 1, capacity_max: 6,
    included_persons: 2, features: { m2: 92, electricityAmps: 10, shade: 'partial', pets: true },
    photos: ['tipo-parcela-sequia'], unitCount: 20,
  },
  {
    id: 'ut_azahar', tenant_id: tenantId, kind: 'lodging',
    name_i18n: { es: 'Bungalow Azahar' }, capacity_min: 1, capacity_max: 5,
    included_persons: 4, features: { m2: 36, beds: 3, bathrooms: 1, airCon: true, pets: false },
    photos: ['tipo-bungalow-azahar'], unitCount: 14,
  },
  {
    id: 'ut_naranjal', tenant_id: tenantId, kind: 'lodging',
    name_i18n: { es: 'Casa Naranjal' }, capacity_min: 1, capacity_max: 6,
    included_persons: 4, features: { m2: 48, beds: 4, bathrooms: 1, airCon: true, pets: false },
    photos: ['tipo-casa-naranjal'], unitCount: 6,
  },
];

const prices: Record<string, [number, number, number, number]> = {
  sea_azahar: [2700, 3300, 7800, 9800],
  sea_templada: [3300, 4100, 9600, 11900],
  sea_verano: [4700, 5600, 13400, 16200],
  sea_cosecha: [2900, 3500, 8400, 10400],
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
    min_stay: season.id === 'sea_verano' && type.kind === 'lodging' ? 5 : 1,
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
    { id: 'ext_cuna', tenant_id: tenantId, name_i18n: { es: 'Cuna y trona' }, price_cents: 0, per: 'stay', required: false },
    { id: 'ext_mascota', tenant_id: tenantId, name_i18n: { es: 'Mascota en parcela' }, price_cents: 450, per: 'night', required: false },
  ],
};

export default webData;
