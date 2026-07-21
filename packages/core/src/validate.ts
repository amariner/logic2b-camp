import { isValidIso, nightsBetween, weekday } from './dates';
import { segmentStay } from './seasons';
import type {
  IsoDate,
  Occupancy,
  RatePlan,
  Season,
  UnitType,
  ValidationIssue,
  ValidationResult,
} from './types';

export type ValidateStayInput = {
  unitType: UnitType;
  dateFrom: IsoDate;
  dateTo: IsoDate;
  occupancy: Occupancy;
  seasons: Season[];
  ratePlans: RatePlan[];
  /** la estancia necesita electricidad (caravana, autocaravana…) */
  needsElectricity?: boolean;
};

/**
 * Valida una estancia acumulando TODOS los errores (códigos i18n + params).
 * Reglas: fechas, cierre, min/max stay (la más restrictiva), día de llegada/salida,
 * capacidad (los niños cuentan), mascotas, electricidad (caso 5).
 */
export function validateStay(input: ValidateStayInput): ValidationResult {
  const issues: ValidationIssue[] = [];
  const { unitType, occupancy } = input;

  if (!isValidIso(input.dateFrom) || !isValidIso(input.dateTo) || input.dateFrom >= input.dateTo) {
    return { valid: false, issues: [{ code: 'stay.invalid_dates' }] };
  }
  const nights = nightsBetween(input.dateFrom, input.dateTo);

  const segments = segmentStay(input.dateFrom, input.dateTo, input.seasons);
  if (!segments) {
    // cerrado ≠ sin disponibilidad: mensaje propio
    return { valid: false, issues: [{ code: 'stay.closed' }] };
  }

  const plansTouched = segments.map((seg) => {
    const plan = input.ratePlans.find(
      (p) => p.unitTypeId === unitType.id && p.seasonId === seg.season.id,
    );
    return { seg, plan };
  });
  const missing = plansTouched.find((p) => !p.plan);
  if (missing) {
    return {
      valid: false,
      issues: [{ code: 'stay.no_rate', params: { season: missing.seg.season.name } }],
    };
  }

  // estancia mínima/máxima: la MÁS restrictiva de las temporadas tocadas
  const minStay = Math.max(...plansTouched.map((p) => p.plan!.minStay));
  if (nights < minStay) issues.push({ code: 'stay.min_stay', params: { minStay, nights } });
  const maxStays = plansTouched.map((p) => p.plan!.maxStay).filter((m): m is number => m !== null);
  if (maxStays.length) {
    const maxStay = Math.min(...maxStays);
    if (nights > maxStay) issues.push({ code: 'stay.max_stay', params: { maxStay, nights } });
  }

  // día de llegada: según el plan de la temporada de la noche de llegada
  const arrivalPlan = plansTouched[0]!.plan!;
  if (arrivalPlan.arrivalDays?.length) {
    const day = weekday(input.dateFrom);
    if (!arrivalPlan.arrivalDays.includes(day)) {
      issues.push({
        code: 'stay.arrival_day',
        params: { day, allowedDays: arrivalPlan.arrivalDays.join(',') },
      });
    }
  }
  // día de salida: según el plan de la última noche
  const departurePlan = plansTouched[plansTouched.length - 1]!.plan!;
  if (departurePlan.departureDays?.length) {
    const day = weekday(input.dateTo);
    if (!departurePlan.departureDays.includes(day)) {
      issues.push({
        code: 'stay.departure_day',
        params: { day, allowedDays: departurePlan.departureDays.join(',') },
      });
    }
  }

  // capacidad: TODOS cuentan, también los niños exentos de tasa (caso 4)
  const persons = occupancy.adults + occupancy.childrenAges.length;
  if (persons > unitType.capacityMax) {
    issues.push({ code: 'stay.capacity', params: { persons, capacityMax: unitType.capacityMax } });
  }
  if (persons < unitType.capacityMin) {
    issues.push({
      code: 'stay.capacity_min',
      params: { persons, capacityMin: unitType.capacityMin },
    });
  }
  if (occupancy.adults < 1) issues.push({ code: 'stay.no_adults' });

  if (occupancy.pets > 0 && unitType.features.pets === false) {
    issues.push({ code: 'stay.no_pets' });
  }

  // caso 5: parcela sin electricidad con equipo que la requiere — mensaje útil
  if (input.needsElectricity && unitType.kind === 'pitch') {
    const amps = unitType.features.electricityAmps ?? 0;
    if (amps <= 0) {
      issues.push({ code: 'stay.no_electricity', params: { unitType: unitType.id } });
    }
  }

  return issues.length ? { valid: false, issues } : { valid: true };
}
