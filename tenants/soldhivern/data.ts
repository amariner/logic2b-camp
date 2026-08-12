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
const tenantId = 'ten_soldhivern';

const seasons: WebSeason[] = [
  {
    id: 'sea_hivern',
    tenant_id: tenantId,
    name: 'Invierno suave',
    date_from: `${year}-01-01`,
    date_to: `${year}-04-01`,
    priority: 2,
    is_open: true,
  },
  {
    id: 'sea_entretemps',
    tenant_id: tenantId,
    name: 'Primavera y otoño',
    date_from: `${year}-04-01`,
    date_to: `${year}-11-01`,
    priority: 0,
    is_open: true,
  },
  {
    id: 'sea_tornada',
    tenant_id: tenantId,
    name: 'Regreso de invierno',
    date_from: `${year}-11-01`,
    date_to: `${year + 1}-01-01`,
    priority: 2,
    is_open: true,
  },
];

const unitTypes: WebUnitType[] = [
  {
    id: 'ut_llevant',
    tenant_id: tenantId,
    kind: 'pitch',
    name_i18n: { es: 'Parcela Llevant' },
    capacity_min: 1,
    capacity_max: 4,
    included_persons: 2,
    features: { m2: 90, electricityAmps: 10, shade: 'partial', pets: true },
    photos: ['parcela-llevant'],
    unitCount: 90,
  },
  {
    id: 'ut_migdia',
    tenant_id: tenantId,
    kind: 'pitch',
    name_i18n: { es: 'Parcela Migdia' },
    capacity_min: 1,
    capacity_max: 4,
    included_persons: 2,
    features: { m2: 120, electricityAmps: 16, shade: 'partial', pets: true },
    photos: ['parcela-migdia'],
    unitCount: 80,
  },
  {
    id: 'ut_olivera',
    tenant_id: tenantId,
    kind: 'lodging',
    name_i18n: { es: 'Bungalow Olivera' },
    capacity_min: 1,
    capacity_max: 4,
    included_persons: 2,
    features: { m2: 35, beds: 2, bathrooms: 1, airCon: true, pets: false },
    photos: ['bungalow-olivera'],
    unitCount: 20,
  },
  {
    id: 'ut_garbi',
    tenant_id: tenantId,
    kind: 'lodging',
    name_i18n: { es: 'Estudio Garbí' },
    capacity_min: 1,
    capacity_max: 2,
    included_persons: 2,
    features: { m2: 28, beds: 1, bathrooms: 1, airCon: true, pets: false },
    photos: ['estudio-garbi'],
    unitCount: 10,
  },
];

const prices: Record<string, [number, number, number, number]> = {
  sea_hivern: [1800, 2300, 5200, 4300],
  sea_entretemps: [2700, 3400, 7600, 6200],
  sea_tornada: [1900, 2400, 5400, 4500],
};

const ratePlans: WebRatePlan[] = seasons.flatMap((season) =>
  unitTypes.map((type, index) => ({
    id: `rp_${type.id}_${season.id}`,
    tenant_id: tenantId,
    unit_type_id: type.id,
    season_id: season.id,
    base_cents: prices[season.id]![index]!,
    extra_person_cents: type.kind === 'pitch' ? 600 : 900,
    child_cents: type.kind === 'pitch' ? 400 : 650,
    pet_cents: type.kind === 'pitch' ? 300 : 0,
    electricity_cents: type.id === 'ut_migdia' ? 450 : 0,
    vehicle_cents: 300,
    min_stay: season.priority === 2 ? 45 : 7,
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
      id: 'ext_bombona',
      tenant_id: tenantId,
      name_i18n: { es: 'Entrega de bombona de gas' },
      price_cents: 2300,
      per: 'stay',
      required: false,
    },
    {
      id: 'ext_lavanderia',
      tenant_id: tenantId,
      name_i18n: { es: 'Tarjeta de lavandería' },
      price_cents: 1200,
      per: 'stay',
      required: false,
    },
    {
      id: 'ext_trastero',
      tenant_id: tenantId,
      name_i18n: { es: 'Taquilla para estancia larga' },
      price_cents: 2500,
      per: 'stay',
      required: false,
    },
    {
      id: 'ext_mascota',
      tenant_id: tenantId,
      name_i18n: { es: 'Mascota en parcela' },
      price_cents: 300,
      per: 'night',
      required: false,
    },
  ],
};

export default webData;
