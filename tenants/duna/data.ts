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
const tenantId = 'ten_duna';

const seasons: WebSeason[] = [
  {
    id: 'sea_brisa',
    tenant_id: tenantId,
    name: 'Brisa',
    date_from: `${year}-03-27`,
    date_to: `${year}-06-19`,
    priority: 0,
    is_open: true,
  },
  {
    id: 'sea_sal',
    tenant_id: tenantId,
    name: 'Sal',
    date_from: `${year}-06-19`,
    date_to: `${year}-09-13`,
    priority: 1,
    is_open: true,
  },
  {
    id: 'sea_calma',
    tenant_id: tenantId,
    name: 'Calma',
    date_from: `${year}-09-13`,
    date_to: `${year}-11-02`,
    priority: 2,
    is_open: true,
  },
];

const unitTypes: WebUnitType[] = [
  {
    id: 'ut_std',
    tenant_id: tenantId,
    kind: 'pitch',
    name_i18n: { es: 'Plaza Base' },
    capacity_min: 1,
    capacity_max: 4,
    included_persons: 2,
    features: { m2: 55, electricityAmps: 6, shade: 'partial', pets: true },
    photos: ['tipo-plaza-base', 'detalle-tienda-tablas'],
    unitCount: 12,
  },
  {
    id: 'ut_conf',
    tenant_id: tenantId,
    kind: 'pitch',
    name_i18n: { es: 'Plaza Duna' },
    capacity_min: 1,
    capacity_max: 5,
    included_persons: 2,
    features: { m2: 75, electricityAmps: 10, shade: 'partial', pets: true },
    photos: ['tipo-plaza-duna', 'entorno-pasarela-mar'],
    unitCount: 8,
  },
];

const prices: Record<string, [number, number]> = {
  sea_brisa: [2400, 2900],
  sea_sal: [3400, 4100],
  sea_calma: [2600, 3100],
};

const ratePlans: WebRatePlan[] = seasons.flatMap((season) =>
  unitTypes.map((type, index) => ({
    id: `rp_${type.id}_${season.id}`,
    tenant_id: tenantId,
    unit_type_id: type.id,
    season_id: season.id,
    base_cents: prices[season.id]![index]!,
    extra_person_cents: 700,
    child_cents: 450,
    pet_cents: 300,
    electricity_cents: type.id === 'ut_conf' ? 600 : 450,
    vehicle_cents: 500,
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
      id: 'ext_tabla',
      tenant_id: tenantId,
      name_i18n: { es: 'Tabla blanda de iniciación' },
      price_cents: 1800,
      per: 'night',
      required: false,
    },
    {
      id: 'ext_desayuno',
      tenant_id: tenantId,
      name_i18n: { es: 'Desayuno para llevar' },
      price_cents: 850,
      per: 'person',
      required: false,
    },
  ],
};

export default webData;
