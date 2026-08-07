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
const tenantId = 'ten_mardefondo';

const seasons: WebSeason[] = [
  {
    id: 'sea_apertura',
    tenant_id: tenantId,
    name: 'Apertura',
    date_from: `${year}-03-20`,
    date_to: `${year}-06-15`,
    priority: 0,
    is_open: true,
  },
  {
    id: 'sea_verano',
    tenant_id: tenantId,
    name: 'Verano',
    date_from: `${year}-06-15`,
    date_to: `${year}-09-15`,
    priority: 1,
    is_open: true,
  },
  {
    id: 'sea_calma',
    tenant_id: tenantId,
    name: 'Calma mediterránea',
    date_from: `${year}-09-15`,
    date_to: `${year}-11-02`,
    priority: 0,
    is_open: true,
  },
];

const unitTypes: WebUnitType[] = [
  {
    id: 'ut_parcela_atlantica',
    tenant_id: tenantId,
    kind: 'pitch',
    name_i18n: { es: 'Parcela Atlántica' },
    capacity_min: 1,
    capacity_max: 6,
    included_persons: 2,
    features: { m2: 100, electricityAmps: 16, shade: 'partial', pets: true },
    photos: ['parcela-atlantica'],
    unitCount: 150,
  },
  {
    id: 'ut_bungalow_laguna',
    tenant_id: tenantId,
    kind: 'lodging',
    name_i18n: { es: 'Bungalow Laguna' },
    capacity_min: 1,
    capacity_max: 6,
    included_persons: 4,
    features: { m2: 46, beds: 3, bathrooms: 2, airCon: true, pets: false },
    photos: ['bungalow-laguna', 'bungalow-laguna-interior'],
    unitCount: 60,
  },
  {
    id: 'ut_mobil_horizonte',
    tenant_id: tenantId,
    kind: 'lodging',
    name_i18n: { es: 'Mobil-home Horizonte' },
    capacity_min: 1,
    capacity_max: 5,
    included_persons: 4,
    features: { m2: 38, beds: 3, bathrooms: 2, airCon: true, pets: false },
    photos: ['mobil-horizonte', 'mobil-horizonte-interior'],
    unitCount: 60,
  },
  {
    id: 'ut_glamping_duna',
    tenant_id: tenantId,
    kind: 'lodging',
    name_i18n: { es: 'Glamping Duna' },
    capacity_min: 1,
    capacity_max: 4,
    included_persons: 2,
    features: { m2: 32, beds: 2, bathrooms: 1, airCon: true, pets: false },
    photos: ['glamping-duna', 'glamping-duna-interior'],
    unitCount: 30,
  },
];

const prices: Record<string, [number, number, number, number]> = {
  sea_apertura: [4200, 13200, 14800, 16900],
  sea_verano: [6900, 21900, 23800, 26400],
  sea_calma: [4700, 14900, 16400, 18800],
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
    min_stay: season.id === 'sea_verano' && type.kind === 'lodging' ? 5 : 2,
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
      id: 'ext_desayuno',
      tenant_id: tenantId,
      name_i18n: { es: 'Desayuno mediterráneo' },
      price_cents: 1400,
      per: 'person',
      required: false,
    },
    {
      id: 'ext_cabana',
      tenant_id: tenantId,
      name_i18n: { es: 'Cabaña de piscina' },
      price_cents: 4500,
      per: 'stay',
      required: false,
    },
    {
      id: 'ext_late',
      tenant_id: tenantId,
      name_i18n: { es: 'Salida tardía' },
      price_cents: 3500,
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
