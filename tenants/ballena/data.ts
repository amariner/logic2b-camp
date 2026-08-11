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
const tenantId = 'ten_ballena';

const seasons: WebSeason[] = [
  {
    id: 'sea_previa',
    tenant_id: tenantId,
    name: 'Primavera de agua',
    date_from: `${year}-03-27`,
    date_to: `${year}-06-20`,
    priority: 0,
    is_open: true,
  },
  {
    id: 'sea_semanal',
    tenant_id: tenantId,
    name: 'Verano por semanas',
    date_from: `${year}-06-20`,
    date_to: `${year}-09-12`,
    priority: 2,
    is_open: true,
  },
  {
    id: 'sea_final',
    tenant_id: tenantId,
    name: 'Septiembre familiar',
    date_from: `${year}-09-12`,
    date_to: `${year}-10-25`,
    priority: 0,
    is_open: true,
  },
];

const unitTypes: WebUnitType[] = [
  {
    id: 'ut_orilla',
    tenant_id: tenantId,
    kind: 'pitch',
    name_i18n: { es: 'Parcela Orilla' },
    capacity_min: 1,
    capacity_max: 6,
    included_persons: 2,
    features: { m2: 85, electricityAmps: 10, shade: 'partial', pets: true },
    photos: ['parcela-orilla'],
    unitCount: 110,
  },
  {
    id: 'ut_brisa',
    tenant_id: tenantId,
    kind: 'pitch',
    name_i18n: { es: 'Parcela Brisa' },
    capacity_min: 1,
    capacity_max: 6,
    included_persons: 2,
    features: { m2: 100, electricityAmps: 16, shade: 'partial', pets: true },
    photos: ['parcela-brisa'],
    unitCount: 50,
  },
  {
    id: 'ut_ola',
    tenant_id: tenantId,
    kind: 'lodging',
    name_i18n: { es: 'Bungalow Ola' },
    capacity_min: 1,
    capacity_max: 5,
    included_persons: 4,
    features: { m2: 38, beds: 3, bathrooms: 1, airCon: true, pets: false },
    photos: ['bungalow-ola'],
    unitCount: 54,
  },
  {
    id: 'ut_marea',
    tenant_id: tenantId,
    kind: 'lodging',
    name_i18n: { es: 'Mobil-home Marea' },
    capacity_min: 1,
    capacity_max: 6,
    included_persons: 4,
    features: { m2: 42, beds: 3, bathrooms: 2, airCon: true, pets: false },
    photos: ['mobil-marea'],
    unitCount: 36,
  },
];

const prices: Record<string, [number, number, number, number]> = {
  sea_previa: [3500, 4300, 11800, 14400],
  sea_semanal: [5700, 6800, 18800, 22600],
  sea_final: [4100, 5000, 13200, 15800],
};

const ratePlans: WebRatePlan[] = seasons.flatMap((season) =>
  unitTypes.map((type, index) => ({
    id: `rp_${type.id}_${season.id}`,
    tenant_id: tenantId,
    unit_type_id: type.id,
    season_id: season.id,
    base_cents: prices[season.id]![index]!,
    extra_person_cents: type.kind === 'pitch' ? 1100 : 1650,
    child_cents: type.kind === 'pitch' ? 750 : 1000,
    pet_cents: type.kind === 'pitch' ? 650 : 0,
    electricity_cents: 0,
    vehicle_cents: 750,
    min_stay: season.id === 'sea_semanal' ? 7 : 2,
    max_stay: null,
    arrival_days: season.id === 'sea_semanal' ? [6] : null,
    departure_days: season.id === 'sea_semanal' ? [6] : null,
  })),
);

export const webData: WebData = {
  year,
  seasons,
  unitTypes,
  ratePlans,
  extras: [
    {
      id: 'ext_pulsera',
      tenant_id: tenantId,
      name_i18n: { es: 'Pulsera de actividades' },
      price_cents: 0,
      per: 'person',
      required: false,
    },
    {
      id: 'ext_bicicleta',
      tenant_id: tenantId,
      name_i18n: { es: 'Alquiler de bicicleta infantil' },
      price_cents: 900,
      per: 'night',
      required: false,
    },
    {
      id: 'ext_cuna',
      tenant_id: tenantId,
      name_i18n: { es: 'Cuna de viaje' },
      price_cents: 1200,
      per: 'stay',
      required: false,
    },
    {
      id: 'ext_mascota',
      tenant_id: tenantId,
      name_i18n: { es: 'Mascota en parcela' },
      price_cents: 650,
      per: 'night',
      required: false,
    },
  ],
};

export default webData;
