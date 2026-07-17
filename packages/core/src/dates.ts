import type { IsoDate } from './types';

const MS_DAY = 86400000;

export const parseIso = (d: IsoDate): number => Date.parse(`${d}T00:00:00Z`);

export const isValidIso = (d: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(parseIso(d));

export const nightsBetween = (from: IsoDate, to: IsoDate): number =>
  Math.round((parseIso(to) - parseIso(from)) / MS_DAY);

export const addDays = (d: IsoDate, days: number): IsoDate => {
  const t = new Date(parseIso(d) + days * MS_DAY);
  return t.toISOString().slice(0, 10);
};

/** 0=domingo … 6=sábado (UTC) */
export const weekday = (d: IsoDate): number => new Date(parseIso(d)).getUTCDay();

/** noches de la estancia: [from, to) */
export function eachNight(from: IsoDate, to: IsoDate): IsoDate[] {
  const out: IsoDate[] = [];
  for (let d = from; d < to; d = addDays(d, 1)) out.push(d);
  return out;
}

/** solape de rangos semiabiertos [aFrom,aTo) ∩ [bFrom,bTo) */
export const rangesOverlap = (aFrom: IsoDate, aTo: IsoDate, bFrom: IsoDate, bTo: IsoDate): boolean =>
  aFrom < bTo && bFrom < aTo;

/** días entre hoy (ISO) y una fecha, redondeando hacia abajo */
export const daysUntil = (from: IsoDate, to: IsoDate): number =>
  Math.floor((parseIso(to) - parseIso(from)) / MS_DAY);
