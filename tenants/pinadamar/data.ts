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
const tenantId = 'ten_pinadamar';

const seasons: WebSeason[] = [
  { id: 'sea_media', tenant_id: tenantId, name: 'Primavera y otoño', date_from: `${year}-03-15`, date_to: `${year}-06-15`, priority: 0, is_open: true },
  { id: 'sea_alta', tenant_id: tenantId, name: 'Verano', date_from: `${year}-06-15`, date_to: `${year}-09-15`, priority: 1, is_open: true },
  { id: 'sea_suave', tenant_id: tenantId, name: 'Final de temporada', date_from: `${year}-09-15`, date_to: `${year}-11-03`, priority: 0, is_open: true },
];

const unitTypes: WebUnitType[] = [
  {
    id: 'ut_parcela_pino', tenant_id: tenantId, kind: 'pitch',
    name_i18n: { es: 'Parcela Pinar' }, capacity_min: 1, capacity_max: 6,
    included_persons: 2, features: { m2: 80, electricityAmps: 10, shade: 'total', pets: true },
    photos: ['parcela'], unitCount: 60,
  },
  {
    id: 'ut_parcela_mar', tenant_id: tenantId, kind: 'pitch',
    name_i18n: { es: 'Parcela Brisa' }, capacity_min: 1, capacity_max: 6,
    included_persons: 2, features: { m2: 95, electricityAmps: 10, shade: 'partial', pets: true },
    photos: ['calle-pinos'], unitCount: 24,
  },
  {
    id: 'ut_bungalow', tenant_id: tenantId, kind: 'lodging',
    name_i18n: { es: 'Bungalow Familiar' }, capacity_min: 1, capacity_max: 6,
    included_persons: 4, features: { m2: 38, beds: 3, bathrooms: 1, airCon: true, pets: false },
    photos: ['bungalow-exterior', 'bungalow-interior'], unitCount: 16,
  },
  {
    id: 'ut_mobil', tenant_id: tenantId, kind: 'lodging',
    name_i18n: { es: 'Mobil-home Salina' }, capacity_min: 1, capacity_max: 5,
    included_persons: 4, features: { m2: 32, beds: 3, bathrooms: 1, airCon: true, pets: false },
    photos: ['mobil-home'], unitCount: 10,
  },
];

const prices: Record<string, [number, number, number, number]> = {
  sea_media: [3100, 3900, 9200, 10400],
  sea_alta: [4700, 5800, 14200, 15900],
  sea_suave: [3400, 4200, 9800, 11200],
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
    min_stay: season.id === 'sea_alta' && type.kind === 'lodging' ? 4 : 1,
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
    { id: 'ext_cuna', tenant_id: tenantId, name_i18n: { es: 'Cuna' }, price_cents: 0, per: 'stay', required: false },
    { id: 'ext_mascota', tenant_id: tenantId, name_i18n: { es: 'Mascota en parcela' }, price_cents: 450, per: 'night', required: false },
  ],
};

export default webData;
