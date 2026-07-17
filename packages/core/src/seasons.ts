import { addDays, eachNight } from './dates';
import type { IsoDate, Season } from './types';

/** Temporada efectiva de una noche: la de mayor prioridad que la contiene y está abierta. */
export function seasonForNight(night: IsoDate, seasons: Season[]): Season | null {
  let best: Season | null = null;
  for (const s of seasons) {
    if (!s.isOpen) continue;
    if (night >= s.dateFrom && night < s.dateTo) {
      if (!best || s.priority > best.priority) best = s;
    }
  }
  return best;
}

export type SeasonSegment = { season: Season; dateFrom: IsoDate; dateTo: IsoDate; nights: number };

/**
 * Parte una estancia en segmentos contiguos por temporada efectiva.
 * Si alguna noche no tiene temporada abierta → null (cerrado, no "sin disponibilidad").
 */
export function segmentStay(from: IsoDate, to: IsoDate, seasons: Season[]): SeasonSegment[] | null {
  const segments: SeasonSegment[] = [];
  for (const night of eachNight(from, to)) {
    const season = seasonForNight(night, seasons);
    if (!season) return null;
    const last = segments[segments.length - 1];
    if (last && last.season.id === season.id) {
      last.nights += 1;
      last.dateTo = addDays(night, 1);
    } else {
      segments.push({ season, dateFrom: night, dateTo: addDays(night, 1), nights: 1 });
    }
  }
  return segments;
}
