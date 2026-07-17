import { daysUntil, nightsBetween } from './dates';
import { segmentStay } from './seasons';
import type {
  ExtraSelection,
  IsoDate,
  Occupancy,
  PriceLine,
  Quote,
  RatePlan,
  RateRule,
  Season,
  UnitType,
} from './types';

export type QuoteInput = {
  unitType: UnitType;
  dateFrom: IsoDate;
  dateTo: IsoDate;
  occupancy: Occupancy;
  seasons: Season[];
  ratePlans: RatePlan[];
  extras?: ExtraSelection[];
  currency: string;
  /** solo parcelas: si la estancia contrata electricidad */
  withElectricity?: boolean;
};

export class ClosedError extends Error {
  constructor() {
    super('stay.closed');
  }
}
export class MissingRatePlanError extends Error {
  constructor(seasonId: string) {
    super(`pricing.missing_rate_plan:${seasonId}`);
  }
}

/**
 * Presupuesto con desglose auditable por tramos de temporada (ADR 0003).
 * Cada línea: concepto (clave i18n) + detalle + importe. sum(lines) == totalCents.
 */
export function quote(input: QuoteInput): Quote {
  const { unitType, occupancy } = input;
  const segments = segmentStay(input.dateFrom, input.dateTo, input.seasons);
  if (!segments) throw new ClosedError();

  const lines: PriceLine[] = [];
  const extraAdults = Math.max(0, occupancy.adults - unitType.includedPersons);
  const children = occupancy.childrenAges.length;
  const includedAfterAdults = Math.max(0, unitType.includedPersons - occupancy.adults);
  const extraChildren = Math.max(0, children - includedAfterAdults);
  const extraVehicles = Math.max(0, occupancy.vehicles - 1);

  for (const seg of segments) {
    const plan = input.ratePlans.find(
      (p) => p.unitTypeId === unitType.id && p.seasonId === seg.season.id,
    );
    if (!plan) throw new MissingRatePlanError(seg.season.id);
    const n = seg.nights;
    const season = seg.season.name;

    lines.push({
      concept: 'price.base',
      detail: { season, nights: n, perNight: plan.baseCents },
      amountCents: plan.baseCents * n,
    });
    if (unitType.kind === 'pitch') {
      if (extraAdults > 0 && plan.extraPersonCents > 0)
        lines.push({
          concept: 'price.extra_person',
          detail: { season, nights: n, persons: extraAdults, perNight: plan.extraPersonCents },
          amountCents: plan.extraPersonCents * extraAdults * n,
        });
      if (extraChildren > 0 && plan.childCents > 0)
        lines.push({
          concept: 'price.child',
          detail: { season, nights: n, children: extraChildren, perNight: plan.childCents },
          amountCents: plan.childCents * extraChildren * n,
        });
      if (input.withElectricity && plan.electricityCents > 0)
        lines.push({
          concept: 'price.electricity',
          detail: { season, nights: n, perNight: plan.electricityCents },
          amountCents: plan.electricityCents * n,
        });
      if (extraVehicles > 0 && plan.vehicleCents > 0)
        lines.push({
          concept: 'price.vehicle',
          detail: { season, nights: n, vehicles: extraVehicles, perNight: plan.vehicleCents },
          amountCents: plan.vehicleCents * extraVehicles * n,
        });
    }
    if (occupancy.pets > 0 && plan.petCents > 0)
      lines.push({
        concept: 'price.pet',
        detail: { season, nights: n, pets: occupancy.pets, perNight: plan.petCents },
        amountCents: plan.petCents * occupancy.pets * n,
      });
  }

  const nights = nightsBetween(input.dateFrom, input.dateTo);
  const persons = occupancy.adults + children;
  for (const ex of input.extras ?? []) {
    const mult = ex.per === 'night' ? nights : ex.per === 'person' ? persons : 1;
    lines.push({
      concept: ex.concept,
      detail: { per: ex.per, qty: ex.qty, unit: ex.priceCents },
      amountCents: ex.priceCents * ex.qty * mult,
    });
  }

  return {
    unitTypeId: unitType.id,
    dateFrom: input.dateFrom,
    dateTo: input.dateTo,
    nights,
    occupancy,
    breakdown: {
      lines,
      totalCents: lines.reduce((s, l) => s + l.amountCents, 0),
      touristTaxCents: 0, // la tasa se calcula y muestra aparte (touristTax.ts)
      currency: input.currency,
    },
  };
}

export type ApplyRulesContext = {
  /** fecha de hoy para reglas de antelación */
  today: IsoDate;
  /** carnets presentados (acsi…) */
  cards?: string[];
  /** temporadas tocadas por la estancia */
  seasonIds: string[];
};

function ruleApplies(rule: RateRule, q: Quote, ctx: ApplyRulesContext): boolean {
  const c = rule.conditions;
  const ahead = daysUntil(ctx.today, q.dateFrom);
  if (c.minDaysAhead !== undefined && ahead < c.minDaysAhead) return false;
  if (c.maxDaysAhead !== undefined && ahead > c.maxDaysAhead) return false;
  if (c.minNights !== undefined && q.nights < c.minNights) return false;
  if (c.card !== undefined && !(ctx.cards ?? []).includes(c.card)) return false;
  if (c.seasonIds !== undefined && !ctx.seasonIds.every((s) => c.seasonIds!.includes(s)))
    return false;
  if (c.unitTypeIds !== undefined && !c.unitTypeIds.includes(q.unitTypeId)) return false;
  return true;
}

/**
 * Aplica reglas de tarifa: todas las stackables aplicables + la no-stackable de
 * mayor prioridad. Los descuentos son líneas NEGATIVAS del desglose (auditables).
 * Nunca muta el quote de entrada.
 */
export function applyRules(q: Quote, rules: RateRule[], ctx: ApplyRulesContext): Quote {
  const applicable = rules.filter((r) => ruleApplies(r, q, ctx));
  const stackables = applicable.filter((r) => r.stackable);
  const exclusive = applicable
    .filter((r) => !r.stackable)
    .sort((a, b) => b.priority - a.priority)[0];
  const toApply = [...(exclusive ? [exclusive] : []), ...stackables].sort(
    (a, b) => b.priority - a.priority,
  );

  const lines = [...q.breakdown.lines.map((l) => ({ ...l }))];
  let running = lines.reduce((s, l) => s + l.amountCents, 0);
  for (const rule of toApply) {
    const amount =
      rule.discount.type === 'percent'
        ? -Math.round((running * rule.discount.value) / 100)
        : -rule.discount.value;
    if (amount === 0) continue;
    lines.push({
      concept: `discount.${rule.type}`,
      detail:
        rule.discount.type === 'percent'
          ? { rule: rule.id, percent: rule.discount.value, base: running }
          : { rule: rule.id, fixed: rule.discount.value },
      amountCents: amount,
    });
    running += amount;
  }

  return {
    ...q,
    breakdown: { ...q.breakdown, lines, totalCents: running },
  };
}
