/** Fixtures compartidos de los tests del motor — camping mediterráneo tipo Cala Sereno. */
import type { Block, BookingSpan, RatePlan, Season, Unit, UnitType } from './types';

export const seasons: Season[] = [
  {
    id: 'apertura',
    name: 'Apertura',
    dateFrom: '2026-03-15',
    dateTo: '2026-11-01',
    priority: 0,
    isOpen: true,
  },
  {
    id: 'media',
    name: 'Media',
    dateFrom: '2026-06-01',
    dateTo: '2026-09-15',
    priority: 10,
    isOpen: true,
  },
  {
    id: 'alta',
    name: 'Alta',
    dateFrom: '2026-07-01',
    dateTo: '2026-08-31',
    priority: 20,
    isOpen: true,
  },
];

export const pitchType: UnitType = {
  id: 'ut_std',
  kind: 'pitch',
  capacityMin: 1,
  capacityMax: 6,
  includedPersons: 2,
  features: { electricityAmps: 6, pets: true, m2: 70 },
};

/** parcela SIN electricidad (caso 5) */
export const pitchNoElec: UnitType = {
  id: 'ut_eco',
  kind: 'pitch',
  capacityMin: 1,
  capacityMax: 4,
  includedPersons: 2,
  features: { electricityAmps: 0, pets: true, m2: 60 },
};

export const bungalowType: UnitType = {
  id: 'ut_bung',
  kind: 'lodging',
  capacityMin: 1,
  capacityMax: 6,
  includedPersons: 6,
  features: { beds: 4, bathrooms: 2, pets: false },
};

const mkPlan = (unitTypeId: string, seasonId: string, over: Partial<RatePlan> = {}): RatePlan => ({
  unitTypeId,
  seasonId,
  baseCents: 2000,
  extraPersonCents: 500,
  childCents: 300,
  petCents: 350,
  electricityCents: 550,
  vehicleCents: 400,
  minStay: 1,
  maxStay: null,
  arrivalDays: null,
  departureDays: null,
  ...over,
});

export const plans: RatePlan[] = [
  mkPlan('ut_std', 'apertura', { baseCents: 1800 }),
  mkPlan('ut_std', 'media', { baseCents: 2600, minStay: 2 }),
  mkPlan('ut_std', 'alta', { baseCents: 3800, minStay: 3 }),
  mkPlan('ut_eco', 'apertura', { baseCents: 1400, electricityCents: 0 }),
  mkPlan('ut_eco', 'media', { baseCents: 2000, electricityCents: 0 }),
  mkPlan('ut_eco', 'alta', { baseCents: 2900, electricityCents: 0, minStay: 3 }),
  mkPlan('ut_bung', 'apertura', {
    baseCents: 7500,
    extraPersonCents: 0,
    childCents: 0,
    electricityCents: 0,
    vehicleCents: 0,
  }),
  mkPlan('ut_bung', 'media', {
    baseCents: 10500,
    extraPersonCents: 0,
    childCents: 0,
    electricityCents: 0,
    vehicleCents: 0,
    minStay: 2,
  }),
  // alta: mínimo 7 noches, entrada solo sábados (casos 1 y 2)
  mkPlan('ut_bung', 'alta', {
    baseCents: 15500,
    extraPersonCents: 0,
    childCents: 0,
    electricityCents: 0,
    vehicleCents: 0,
    minStay: 7,
    arrivalDays: [6],
  }),
];

export const mkUnits = (typeId: string, count: number, prefix = 'U'): Unit[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `${typeId}_${i + 1}`,
    unitTypeId: typeId,
    code: `${prefix}-${String(i + 1).padStart(2, '0')}`,
    status: 'active' as const,
  }));

export const mkBooking = (
  id: string,
  unitTypeId: string,
  unitId: string | null,
  dateFrom: string,
  dateTo: string,
  status: BookingSpan['status'] = 'confirmed',
): BookingSpan => ({ id, unitTypeId, unitId, dateFrom, dateTo, status });

export const noBlocks: Block[] = [];
