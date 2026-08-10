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
const tenantId = 'ten_riuclar';

const seasons: WebSeason[] = [
  {
    id: 'sea_primavera',
    tenant_id: tenantId,
    name: 'Primavera',
    date_from: `${year}-04-04`,
    date_to: `${year}-06-20`,
    priority: 0,
    is_open: true,
  },
  {
    id: 'sea_estiu',
    tenant_id: tenantId,
    name: 'Estiu',
    date_from: `${year}-06-20`,
    date_to: `${year}-09-14`,
    priority: 1,
    is_open: true,
  },
  {
    id: 'sea_tardor',
    tenant_id: tenantId,
    name: 'Tardor',
    date_from: `${year}-09-14`,
    date_to: `${year}-10-19`,
    priority: 2,
    is_open: true,
  },
];

const unitTypes: WebUnitType[] = [
  {
    id: 'ut_std',
    tenant_id: tenantId,
    kind: 'pitch',
    name_i18n: { ca: 'Parcel·la de bosc' },
    capacity_min: 1,
    capacity_max: 6,
    included_persons: 2,
    features: { m2: 75, electricityAmps: 6, shade: 'total', pets: true },
    photos: ['tipus-parcella-bosc', 'detall-refugi-comu'],
    unitCount: 16,
  },
  {
    id: 'ut_conf',
    tenant_id: tenantId,
    kind: 'pitch',
    name_i18n: { ca: 'Parcel·la de ribera' },
    capacity_min: 1,
    capacity_max: 5,
    included_persons: 2,
    features: { m2: 90, electricityAmps: 10, shade: 'partial', pets: true },
    photos: ['tipus-parcella-riu', 'entorn-sender-humit'],
    unitCount: 8,
  },
];

const prices: Record<string, [number, number]> = {
  sea_primavera: [2700, 3200],
  sea_estiu: [3500, 4100],
  sea_tardor: [2900, 3400],
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
    pet_cents: 350,
    electricity_cents: type.id === 'ut_conf' ? 600 : 450,
    vehicle_cents: 450,
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
      id: 'ext_llenya',
      tenant_id: tenantId,
      name_i18n: { ca: 'Feix de llenya local' },
      price_cents: 900,
      per: 'stay',
      required: false,
    },
    {
      id: 'ext_esmorzar',
      tenant_id: tenantId,
      name_i18n: { ca: 'Cistella d’esmorzar' },
      price_cents: 2200,
      per: 'stay',
      required: false,
    },
  ],
};

export default webData;
