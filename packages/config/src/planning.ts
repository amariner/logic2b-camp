/**
 * Geometría pura del tape chart (ADR 0023, C1): fecha ↔ píxel, sombreado de
 * fin de semana como UN gradiente (no un nodo por celda), línea de "hoy" y
 * franja de temporada de la cabecera. Sin DOM, sin I/O — mismo criterio que
 * `plano.ts` (ADR 0021): lo que el dashboard pinta se calcula aquí y se testea.
 */

const DAY_MS = 86_400_000;

export const isoDay = (d: Date): string => d.toISOString().slice(0, 10);

export const addDaysIso = (iso: string, n: number): string =>
  isoDay(new Date(Date.parse(`${iso}T00:00:00Z`) + n * DAY_MS));

export const daysBetweenIso = (a: string, b: string): number =>
  Math.round((Date.parse(b) - Date.parse(a)) / DAY_MS);

/** Redondeo de un desplazamiento en píxeles a días enteros (snap de celda). */
export const snapDays = (dx: number, cellW: number): number => Math.round(dx / cellW);

export type BarGeometry = {
  left: number;
  width: number;
  /** la estancia empieza antes del borde visible (indicador de continuación ‹) */
  clipStart: boolean;
  /** la estancia acaba después del borde visible (indicador ›) */
  clipEnd: boolean;
};

/**
 * Posición de una barra en el lienzo visible. `null` si cae fuera.
 * from inclusive / to exclusive, como todo el dominio.
 */
export function barGeometry(
  viewFrom: string,
  viewDays: number,
  cellW: number,
  dateFrom: string,
  dateTo: string,
): BarGeometry | null {
  const startDay = daysBetweenIso(viewFrom, dateFrom);
  const endDay = daysBetweenIso(viewFrom, dateTo);
  const start = Math.max(0, startDay);
  const end = Math.min(viewDays, endDay);
  if (end <= start) return null;
  return {
    left: start * cellW,
    width: end * cellW - start * cellW - 2,
    clipStart: startDay < 0,
    clipEnd: endDay > viewDays,
  };
}

/** X en píxeles del borde izquierdo de la celda de `today`; `null` si no está a la vista. */
export function todayOffset(
  viewFrom: string,
  viewDays: number,
  cellW: number,
  today: string,
): number | null {
  const idx = daysBetweenIso(viewFrom, today);
  if (idx < 0 || idx >= viewDays) return null;
  return idx * cellW;
}

const utcDow = (iso: string): number => new Date(`${iso}T12:00:00Z`).getUTCDay();

/**
 * Sombreado de fin de semana como UN `repeating-linear-gradient` para todo el
 * lienzo (período 7 celdas, fase según el día de la semana de `viewFrom`).
 * Sustituye al `<div>` por celda de finde × fila del planning original
 * (~26 × filas visibles ≈ miles de nodos → 1). Sáb+dom contiguos salvo cuando
 * `viewFrom` cae en domingo: ahí la banda se parte (dom al inicio, sáb al final).
 */
export function weekendBackground(viewFrom: string, cellW: number, color: string): string {
  const period = 7 * cellW;
  const daysToSaturday = (6 - utcDow(viewFrom) + 7) % 7;
  if (daysToSaturday === 6) {
    // viewFrom es domingo: [dom][lun…vie][sáb]
    return `repeating-linear-gradient(90deg, ${color} 0px, ${color} ${cellW}px, transparent ${cellW}px, transparent ${6 * cellW}px, ${color} ${6 * cellW}px, ${color} ${period}px)`;
  }
  const s = daysToSaturday * cellW;
  return `repeating-linear-gradient(90deg, transparent 0px, transparent ${s}px, ${color} ${s}px, ${color} ${s + 2 * cellW}px, transparent ${s + 2 * cellW}px, transparent ${period}px)`;
}

export type SeasonSpan = {
  id: string;
  name: string;
  dateFrom: string;
  dateTo: string;
  priority: number;
};

export type SeasonBand = {
  /** índice de día (0-based) donde empieza la banda */
  start: number;
  days: number;
  name: string;
  /** tono 0–3, estable por temporada (cíclico); el color exacto lo pone el DS */
  tone: number;
};

/**
 * Franja de temporada de la cabecera: por día gana la temporada de mayor
 * prioridad (mismo criterio que el motor, `seasonForNight`), días contiguos de
 * la misma temporada se funden en una banda. Días sin temporada = hueco
 * (cerrado — no se pinta "sin datos" como si fuera una temporada más).
 */
export function seasonBands(
  seasons: SeasonSpan[],
  viewFrom: string,
  viewDays: number,
): SeasonBand[] {
  // tono estable: por orden temporal de la temporada, no por orden de aparición en la vista
  const ordered = [...seasons].sort(
    (a, b) => a.dateFrom.localeCompare(b.dateFrom) || a.id.localeCompare(b.id),
  );
  const toneById = new Map(ordered.map((s, i) => [s.id, i % 4]));

  const bands: (SeasonBand & { seasonId: string })[] = [];
  let current: (SeasonBand & { seasonId: string }) | null = null;
  for (let i = 0; i < viewDays; i++) {
    const day = addDaysIso(viewFrom, i);
    let winner: SeasonSpan | null = null;
    for (const s of seasons) {
      if (s.dateFrom <= day && day < s.dateTo && (!winner || s.priority > winner.priority))
        winner = s;
    }
    if (!winner) {
      if (current) bands.push(current);
      current = null;
      continue;
    }
    if (current && current.seasonId === winner.id) {
      current.days += 1;
      continue;
    }
    if (current) bands.push(current);
    current = {
      seasonId: winner.id,
      start: i,
      days: 1,
      name: winner.name,
      tone: toneById.get(winner.id)!,
    };
  }
  if (current) bands.push(current);
  return bands.map((b) => ({ start: b.start, days: b.days, name: b.name, tone: b.tone }));
}
