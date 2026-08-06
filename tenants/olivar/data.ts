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
const tenantId = 'ten_olivar';

const seasons: WebSeason[] = [
  {
    id: 'sea_primavera',
    tenant_id: tenantId,
    name: 'Primavera',
    date_from: `${year}-03-01`,
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
    id: 'sea_otono',
    tenant_id: tenantId,
    name: 'Otoño',
    date_from: `${year}-09-15`,
    date_to: `${year}-11-03`,
    priority: 2,
    is_open: true,
  },
];

const unitTypes: WebUnitType[] = [
  {
    id: 'ut_std',
    tenant_id: tenantId,
    kind: 'pitch',
    name_i18n: { es: 'Parcela entre olivos' },
    capacity_min: 1,
    capacity_max: 6,
    included_persons: 2,
    features: { m2: 80, electricityAmps: 6, shade: 'partial', pets: true },
    photos: [],
    unitCount: 18,
  },
  {
    id: 'ut_glamp',
    tenant_id: tenantId,
    kind: 'lodging',
    name_i18n: { es: 'Tienda premontada' },
    capacity_min: 1,
    capacity_max: 4,
    included_persons: 2,
    features: { m2: 20, beds: 1, shade: 'total', airCon: false, pets: false },
    photos: [],
    unitCount: 4,
  },
];

const prices: Record<string, [number, number]> = {
  sea_primavera: [2800, 6500],
  sea_verano: [3600, 8200],
  sea_otono: [3000, 6800],
};

const ratePlans: WebRatePlan[] = seasons.flatMap((season) =>
  unitTypes.map((type, index) => ({
    id: `rp_${type.id}_${season.id}`,
    tenant_id: tenantId,
    unit_type_id: type.id,
    season_id: season.id,
    base_cents: prices[season.id]![index]!,
    extra_person_cents: type.kind === 'pitch' ? 700 : 1200,
    child_cents: type.kind === 'pitch' ? 450 : 800,
    pet_cents: type.kind === 'pitch' ? 350 : 0,
    electricity_cents: type.kind === 'pitch' ? 450 : 0,
    vehicle_cents: 400,
    min_stay: season.id === 'sea_verano' && type.kind === 'lodging' ? 3 : 1,
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
      name_i18n: { es: 'Cesta de desayuno local' },
      price_cents: 2400,
      per: 'stay',
      required: false,
    },
    {
      id: 'ext_toallas',
      tenant_id: tenantId,
      name_i18n: { es: 'Juego de toallas' },
      price_cents: 800,
      per: 'person',
      required: false,
    },
  ],
};

export default webData;
