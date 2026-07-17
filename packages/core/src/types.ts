/**
 * Tipos de dominio del motor. Independientes de la persistencia (ADR 0003):
 * la API mapea filas de DB → estos tipos. Dinero en céntimos enteros.
 * Fechas 'YYYY-MM-DD', dateFrom inclusive, dateTo EXCLUSIVE.
 */

export type IsoDate = string;

export type Occupancy = {
  adults: number;
  /** edades de los niños — necesarias para tasa y capacidad */
  childrenAges: number[];
  pets: number;
  vehicles: number;
};

export type Season = {
  id: string;
  name: string;
  dateFrom: IsoDate;
  dateTo: IsoDate;
  priority: number;
  isOpen: boolean;
};

export type UnitTypeKind = 'pitch' | 'lodging';

export type UnitTypeFeatures = {
  electricityAmps?: number;
  pets?: boolean;
  m2?: number;
  shade?: string;
  beds?: number;
  bathrooms?: number;
  [k: string]: unknown;
};

export type UnitType = {
  id: string;
  kind: UnitTypeKind;
  capacityMin: number;
  capacityMax: number;
  includedPersons: number;
  features: UnitTypeFeatures;
};

export type Unit = {
  id: string;
  unitTypeId: string;
  code: string;
  status: 'active' | 'inactive';
};

/** Reserva reducida a lo que el motor necesita para ocupación */
export type BookingSpan = {
  id: string;
  unitTypeId: string;
  unitId: string | null;
  dateFrom: IsoDate;
  dateTo: IsoDate;
  /** solo confirmed/pending ocupan inventario */
  status: 'pending' | 'confirmed' | 'cancelled' | 'no_show' | 'completed';
};

export type Block = {
  unitId?: string | null;
  unitTypeId?: string | null;
  dateFrom: IsoDate;
  dateTo: IsoDate;
  reason: 'maintenance' | 'owner' | 'longstay' | 'manual';
};

export type RatePlan = {
  unitTypeId: string;
  seasonId: string;
  baseCents: number;
  extraPersonCents: number;
  childCents: number;
  petCents: number;
  electricityCents: number;
  vehicleCents: number;
  minStay: number;
  maxStay: number | null;
  /** 0=domingo … 6=sábado; null/[] = cualquier día */
  arrivalDays: number[] | null;
  departureDays: number[] | null;
};

export type RateRule = {
  id: string;
  type: 'early_booking' | 'last_minute' | 'long_stay' | 'acsi' | 'promo';
  conditions: {
    minDaysAhead?: number;
    maxDaysAhead?: number;
    minNights?: number;
    card?: string;
    seasonIds?: string[];
    unitTypeIds?: string[];
  };
  discount: { type: 'percent'; value: number } | { type: 'fixed_cents'; value: number };
  stackable: boolean;
  priority: number;
};

export type ExtraSelection = {
  id: string;
  priceCents: number;
  per: 'stay' | 'night' | 'person';
  qty: number;
  /** clave i18n del nombre para el desglose */
  concept: string;
};

// ---------- resultados ----------

export type PriceLine = {
  concept: string;
  detail: Record<string, string | number>;
  amountCents: number;
};

export type PriceBreakdown = {
  lines: PriceLine[];
  totalCents: number;
  touristTaxCents: number;
  currency: string;
};

export type Quote = {
  unitTypeId: string;
  dateFrom: IsoDate;
  dateTo: IsoDate;
  nights: number;
  occupancy: Occupancy;
  breakdown: PriceBreakdown;
};

export type ValidationIssue = {
  /** clave i18n del error */
  code: string;
  params?: Record<string, string | number>;
};

export type ValidationResult = { valid: true } | { valid: false; issues: ValidationIssue[] };

export type AvailabilityResult = {
  unitTypeId: string;
  /** mínimo de unidades libres en la noche más ocupada del rango */
  availableUnits: number;
  status: 'available' | 'unavailable' | 'closed';
};

export type UnitAssignment = {
  unitId: string;
  unitCode: string;
  /** hueco total (noches) que deja alrededor — menor es mejor */
  gapScore: number;
  alternatives: { unitId: string; unitCode: string; gapScore: number }[];
};

export type TouristTaxPolicy = {
  perPersonNightCents: number;
  /** menores de esta edad no pagan (sí cuentan capacidad) */
  exemptUnderAge: number;
  /** noches máximas gravadas por estancia (null = todas) */
  maxNights: number | null;
};

export type CancellationPolicy = {
  /** ordenables por minDaysBefore desc; aplica el mayor tramo ≤ antelación real */
  tiers: { minDaysBefore: number; refundPct: number }[];
};

export type CancellationRefund = {
  refundCents: number;
  retainedCents: number;
  daysBefore: number;
  appliedRefundPct: number;
};
