import { nightsBetween, rangesOverlap } from './dates';
import type { Block, BookingSpan, IsoDate, Unit, UnitAssignment } from './types';

export type AssignUnitInput = {
  unitTypeId: string;
  dateFrom: IsoDate;
  dateTo: IsoDate;
  units: Unit[];
  bookings: BookingSpan[];
  blocks: Block[];
};

const OCCUPIES: BookingSpan['status'][] = ['pending', 'confirmed'];
/** hueco mayor que esto no penaliza más (ya cabe otra estancia) */
const GAP_CAP = 30;

/**
 * Asignación óptima: entre las unidades libres todo el rango, la que deja MENOS
 * hueco alrededor (fragmentación mínima del planning). Empate → menor código.
 * Devuelve null si ninguna unidad está libre (puede requerir reasignación manual).
 */
export function assignUnit(input: AssignUnitInput): UnitAssignment | null {
  const candidates = input.units.filter(
    (u) => u.unitTypeId === input.unitTypeId && u.status === 'active',
  );

  const scored: { unit: Unit; gapScore: number }[] = [];
  for (const unit of candidates) {
    const occupations = [
      ...input.bookings
        .filter((b) => b.unitId === unit.id && OCCUPIES.includes(b.status))
        .map((b) => ({ from: b.dateFrom, to: b.dateTo })),
      ...input.blocks
        .filter((blk) => blk.unitId === unit.id)
        .map((blk) => ({ from: blk.dateFrom, to: blk.dateTo })),
    ];
    if (occupations.some((o) => rangesOverlap(o.from, o.to, input.dateFrom, input.dateTo)))
      continue;

    // hueco hasta la ocupación anterior y la siguiente (capado)
    const before = occupations.filter((o) => o.to <= input.dateFrom);
    const after = occupations.filter((o) => o.from >= input.dateTo);
    const gapBefore = before.length
      ? Math.min(...before.map((o) => nightsBetween(o.to, input.dateFrom)))
      : GAP_CAP;
    const gapAfter = after.length
      ? Math.min(...after.map((o) => nightsBetween(input.dateTo, o.from)))
      : GAP_CAP;
    scored.push({ unit, gapScore: Math.min(gapBefore, GAP_CAP) + Math.min(gapAfter, GAP_CAP) });
  }

  if (!scored.length) return null;
  scored.sort((a, b) => a.gapScore - b.gapScore || a.unit.code.localeCompare(b.unit.code));

  const [best, ...rest] = scored;
  return {
    unitId: best!.unit.id,
    unitCode: best!.unit.code,
    gapScore: best!.gapScore,
    alternatives: rest.map((s) => ({
      unitId: s.unit.id,
      unitCode: s.unit.code,
      gapScore: s.gapScore,
    })),
  };
}
