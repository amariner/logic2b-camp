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
const tenantId = 'ten_delta';

const seasons: WebSeason[] = [
  {
    id: 'sea_primavera',
    tenant_id: tenantId,
    name: 'Primavera',
    date_from: `${year}-04-03`,
    date_to: `${year}-06-20`,
    priority: 0,
    is_open: true,
  },
  {
    id: 'sea_arroz',
    tenant_id: tenantId,
    name: 'Arroz',
    date_from: `${year}-06-20`,
    date_to: `${year}-09-06`,
    priority: 1,
    is_open: true,
  },
  {
    id: 'sea_aves',
    tenant_id: tenantId,
    name: 'Aves',
    date_from: `${year}-09-06`,
    date_to: `${year}-10-18`,
    priority: 2,
    is_open: true,
  },
];

const unitTypes: WebUnitType[] = [
  {
    id: 'ut_std',
    tenant_id: tenantId,
    kind: 'pitch',
    name_i18n: { es: 'Parcela Cañizo' },
    capacity_min: 1,
    capacity_max: 4,
    included_persons: 2,
    features: { m2: 48, electricityAmps: 6, shade: 'partial', pets: true },
    photos: ['tipo-parcela-canizo', 'detalle-observatorio'],
    unitCount: 10,
  },
  {
    id: 'ut_conf',
    tenant_id: tenantId,
    kind: 'pitch',
    name_i18n: { es: 'Parcela Arrozal' },
    capacity_min: 1,
    capacity_max: 5,
    included_persons: 2,
    features: { m2: 68, electricityAmps: 10, shade: 'partial', pets: true },
    photos: ['tipo-parcela-arrozal', 'entorno-camino-arrozal'],
    unitCount: 6,
  },
];

const prices: Record<string, [number, number]> = {
  sea_primavera: [2100, 2500],
  sea_arroz: [2700, 3200],
  sea_aves: [2300, 2800],
};

const ratePlans: WebRatePlan[] = seasons.flatMap((season) =>
  unitTypes.map((type, index) => ({
    id: `rp_${type.id}_${season.id}`,
    tenant_id: tenantId,
    unit_type_id: type.id,
    season_id: season.id,
    base_cents: prices[season.id]![index]!,
    extra_person_cents: 600,
    child_cents: 400,
    pet_cents: 250,
    electricity_cents: type.id === 'ut_conf' ? 500 : 350,
    vehicle_cents: 400,
    min_stay: 1,
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
      id: 'ext_bici',
      tenant_id: tenantId,
      name_i18n: { es: 'Bicicleta de paseo' },
      price_cents: 1200,
      per: 'night',
      required: false,
    },
    {
      id: 'ext_cesta',
      tenant_id: tenantId,
      name_i18n: { es: 'Cesta de producto local' },
      price_cents: 1600,
      per: 'stay',
      required: false,
    },
  ],
};

export default webData;
