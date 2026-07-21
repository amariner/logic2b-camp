/**
 * Geometría y estado del PLANO DEL CAMPING (ADR 0021, Frente C · C7) — PURO.
 *
 * Sin React, sin SVG: solo el modelo y las matemáticas. La parte cara del plano
 * (la geometría) y la parte con riesgo de bug (el estado por fecha) viven aquí,
 * bajo test en Vitest, sin depender del navegador. El dashboard pone la piel.
 *
 * Fuente de verdad de la geometría de un camping: un descriptor declarativo en
 * `tenants/{slug}/plano.ts`, materializado por el seed en `modules.plano` (D1) y
 * servido por `GET /api/admin/map`. Ver ADR 0021 §1.
 */

/**
 * Constantes de rejilla — FUENTE ÚNICA. En el original (`camping-map.svelte`)
 * estaban duplicadas literalmente en dos ficheros con un comentario
 * "must match accommodation.ts" que delataba el defecto. Aquí viven una vez.
 */
export const PLANO_GRID = {
  gapX: 4,
  gapY: 5,
  /** margen alrededor de todo el plano para el viewBox */
  pad: 26,
  /** tamaño de celda por tipo de forma */
  cell: {
    pitch: { w: 30, h: 26 },
    motorhome: { w: 34, h: 22 },
    lodging: { w: 38, h: 26 },
    glamping: { w: 30, h: 30 },
  },
} as const;

export type PlanoCellKind = keyof typeof PLANO_GRID.cell;

/** Un bloque de unidades colocadas en rejilla: "24 parcelas en 6 columnas desde (x,y)". */
export type PlanoBlock = {
  id: string;
  label: string;
  cell: PlanoCellKind;
  x: number;
  y: number;
  cols: number;
  /** códigos de unidad en orden de colocación (fila a fila) */
  units: string[];
};

export type PlanoServiceIcon =
  | 'reception'
  | 'pool'
  | 'restaurant'
  | 'wc'
  | 'playground'
  | 'market'
  | 'shop';

/** Decorado del recinto — DATO, no cableado (defecto 2 del original corregido). */
export type PlanoDecor =
  | { kind: 'enclosure'; x: number; y: number; w: number; h: number }
  | { kind: 'road'; x: number; y: number; w: number; h: number }
  | { kind: 'green'; x: number; y: number; w: number; h: number; label?: string }
  | { kind: 'water'; x: number; y: number; w: number; h: number; label?: string }
  | {
      kind: 'service';
      x: number;
      y: number;
      w: number;
      h: number;
      label: string;
      icon: PlanoServiceIcon;
    }
  | { kind: 'label'; x: number; y: number; text: string; size?: 's' | 'm' | 'l' };

export type PlanoDescriptor = {
  version: 1;
  decor: PlanoDecor[];
  blocks: PlanoBlock[];
};

// ---------- expansión: descriptor → rectángulos ----------

export type PlanoRect = {
  code: string;
  x: number;
  y: number;
  w: number;
  h: number;
  blockId: string;
  blockLabel: string;
};

export type PlanoViewBox = { minX: number; minY: number; w: number; h: number };

export type PlanoLayout = {
  rects: PlanoRect[];
  decor: PlanoDecor[];
  viewBox: PlanoViewBox;
  /** true si el layout lo generó `autoPlano` (camping sin descriptor propio) */
  generated: boolean;
};

/** Coloca los códigos de un bloque en rejilla. Usado por expandPlano y autoPlano. */
function layoutBlock(block: PlanoBlock): PlanoRect[] {
  const { w, h } = PLANO_GRID.cell[block.cell];
  const cols = Math.max(1, block.cols);
  return block.units.map((code, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      code,
      x: block.x + col * (w + PLANO_GRID.gapX),
      y: block.y + row * (h + PLANO_GRID.gapY),
      w,
      h,
      blockId: block.id,
      blockLabel: block.label,
    };
  });
}

/** viewBox = caja que envuelve todo (rectángulos + decorado) con margen. */
export function computeViewBox(rects: PlanoRect[], decor: PlanoDecor[]): PlanoViewBox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const extend = (x: number, y: number, w = 0, h = 0) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + w);
    maxY = Math.max(maxY, y + h);
  };
  for (const r of rects) extend(r.x, r.y, r.w, r.h);
  for (const d of decor) {
    if (d.kind === 'label') extend(d.x, d.y);
    else extend(d.x, d.y, d.w, d.h);
  }
  if (!Number.isFinite(minX)) return { minX: 0, minY: 0, w: 100, h: 100 };
  const p = PLANO_GRID.pad;
  return { minX: minX - p, minY: minY - p, w: maxX - minX + p * 2, h: maxY - minY + p * 2 };
}

/** Descriptor de tenant → layout listo para pintar. Puro. */
export function expandPlano(descriptor: PlanoDescriptor): PlanoLayout {
  const rects = descriptor.blocks.flatMap(layoutBlock);
  return {
    rects,
    decor: descriptor.decor,
    viewBox: computeViewBox(rects, descriptor.decor),
    generated: false,
  };
}

// ---------- degradación honesta: layout autogenerado por tipo ----------

export type PlanoUnit = { id: string; code: string; unitTypeId: string };
export type PlanoUnitType = {
  id: string;
  kind: 'pitch' | 'lodging';
  nameI18n: Record<string, string>;
};

/** Nombre de tipo para las etiquetas del layout autogenerado. */
function typeLabel(type: PlanoUnitType, locale: string): string {
  return type.nameI18n[locale] ?? type.nameI18n.es ?? Object.values(type.nameI18n)[0] ?? type.id;
}

/** Forma de celda por tipo, con heurística por id (moto/glamping) para el auto-layout. */
function cellFor(type: PlanoUnitType): PlanoCellKind {
  const id = type.id.toLowerCase();
  if (type.kind === 'pitch') return id.includes('moto') || id.includes('auto') ? 'motorhome' : 'pitch';
  return id.includes('glamp') || id.includes('tent') ? 'glamping' : 'lodging';
}

/**
 * Camping SIN `modules.plano`: se genera un plano por zona a partir de los tipos
 * de unidad. No es una pantalla rota — es un plano correcto por defecto, la
 * degradación que pedía el contrato (FRENTE-C §C7.1). Determinista: mismo orden
 * de tipos y unidades → mismo plano.
 */
export function autoPlano(
  units: PlanoUnit[],
  unitTypes: PlanoUnitType[],
  locale = 'es',
): PlanoLayout {
  const byType = new Map<string, PlanoUnit[]>();
  for (const u of units) {
    if (!byType.has(u.unitTypeId)) byType.set(u.unitTypeId, []);
    byType.get(u.unitTypeId)!.push(u);
  }
  // parcelas antes que alojamientos; dentro, el orden dado de tipos
  const orderedTypes = [...unitTypes].sort((a, b) =>
    a.kind === b.kind ? 0 : a.kind === 'pitch' ? -1 : 1,
  );

  const decor: PlanoDecor[] = [];
  const rects: PlanoRect[] = [];
  const originX = 0;
  let y = 0;
  const COLS = 8;
  const LABEL_H = 22;

  for (const type of orderedTypes) {
    const list = (byType.get(type.id) ?? []).slice().sort((a, b) => (a.code < b.code ? -1 : 1));
    if (!list.length) continue;
    const cell = cellFor(type);
    decor.push({ kind: 'label', x: originX, y: y + 12, text: typeLabel(type, locale), size: 'm' });
    y += LABEL_H;
    const block: PlanoBlock = {
      id: `auto_${type.id}`,
      label: typeLabel(type, locale),
      cell,
      x: originX,
      y,
      cols: COLS,
      units: list.map((u) => u.code),
    };
    const blockRects = layoutBlock(block);
    rects.push(...blockRects);
    const rows = Math.ceil(list.length / COLS);
    y += rows * (PLANO_GRID.cell[cell].h + PLANO_GRID.gapY) + 24;
  }

  const viewBox = computeViewBox(rects, decor);
  // recinto envolvente para que el auto-layout también "sea" un camping
  decor.unshift({
    kind: 'enclosure',
    x: viewBox.minX + PLANO_GRID.pad / 2,
    y: viewBox.minY + PLANO_GRID.pad / 2,
    w: viewBox.w - PLANO_GRID.pad,
    h: viewBox.h - PLANO_GRID.pad,
  });

  return { rects, decor, viewBox, generated: true };
}

// ---------- estado por unidad en una fecha ----------

export type PlanoBooking = {
  id: string;
  status: string;
  unitId: string | null;
  dateFrom: string;
  dateTo: string;
  /** Check-in / check-out (ADR 0022): "en casa" se DERIVA, no es un status. */
  checkedInAt?: string | null;
  checkedOutAt?: string | null;
};

export type PlanoBlockRange = {
  unitId: string;
  dateFrom: string;
  dateTo: string;
  reason: string;
};

export type UnitDayState =
  | { kind: 'free' }
  | { kind: 'blocked'; reason: string }
  | { kind: 'occupied'; bookingId: string; status: string; turnover: boolean }
  | { kind: 'arrival'; bookingId: string; status: string; turnover: boolean }
  | { kind: 'inhouse'; bookingId: string; status: string; turnover: boolean }
  | { kind: 'departure'; bookingId: string; status: string };

/** Solo las reservas activas ocupan inventario (las canceladas dejan hueco real). */
const OCCUPIES = (status: string) =>
  status === 'confirmed' || status === 'pending' || status === 'completed';

/**
 * "En casa" (ADR 0022) se DERIVA: huésped presente = check-in hecho y check-out
 * no. Es ortogonal al status (la reserva sigue 'confirmed'), por eso no toca
 * `OCCUPIES` ni ningún filtro de ocupación.
 */
const IN_HOUSE = (b: PlanoBooking) => Boolean(b.checkedInAt) && !b.checkedOutAt;

/**
 * Qué le pasa a una unidad la noche del `date` (ISO `YYYY-MM-DD`, from inclusive,
 * to exclusive — mismo criterio que todo el proyecto). `turnover` marca el día en
 * que una sale y otra entra: el que recepción más vigila.
 *
 * Los bloqueos por TIPO deben venir ya expandidos a `unitId` por el llamante
 * (igual que hace el planning) — aquí se filtra por `unitId` a secas.
 */
export function unitStateOn(
  date: string,
  unitId: string,
  bookings: PlanoBooking[],
  blocks: PlanoBlockRange[],
): UnitDayState {
  const forUnit = bookings.filter((b) => b.unitId === unitId && OCCUPIES(b.status));
  const occupant = forUnit.find((b) => b.dateFrom <= date && date < b.dateTo);
  const departing = forUnit.find((b) => b.dateTo === date);

  if (occupant) {
    const turnover = !!departing;
    const base = { bookingId: occupant.id, status: occupant.status, turnover };
    // "en casa" manda sobre "entra hoy"/"ocupada": el huésped ya está dentro.
    if (IN_HOUSE(occupant)) return { kind: 'inhouse', ...base };
    return occupant.dateFrom === date
      ? { kind: 'arrival', ...base }
      : { kind: 'occupied', ...base };
  }
  if (departing) return { kind: 'departure', bookingId: departing.id, status: departing.status };

  const blk = blocks.find((b) => b.unitId === unitId && b.dateFrom <= date && date < b.dateTo);
  if (blk) return { kind: 'blocked', reason: blk.reason };

  return { kind: 'free' };
}
