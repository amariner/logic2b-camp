import { eachNight, rangesOverlap } from './dates';
import { segmentStay } from './seasons';
import type {
  AvailabilityResult,
  Block,
  BookingSpan,
  IsoDate,
  Season,
  Unit,
  UnitType,
} from './types';

export type AvailabilitySearchInput = {
  dateFrom: IsoDate;
  dateTo: IsoDate;
  unitTypes: UnitType[];
  units: Unit[];
  bookings: BookingSpan[];
  blocks: Block[];
  seasons: Season[];
};

/** Estados que ocupan inventario */
const OCCUPIES: BookingSpan['status'][] = ['pending', 'confirmed'];

/**
 * Disponibilidad por tipo con reasignación implícita (ADR 0003):
 * un tipo está disponible si para CADA noche
 *   unidades_activas − reservas_solapadas(noche) − bloqueos(noche) > 0.
 * Con reservas por intervalos esta comprobación por noche garantiza que existe
 * una asignación factible (aunque requiera reasignar unidades).
 */
export function searchAvailability(input: AvailabilitySearchInput): AvailabilityResult[] {
  const { dateFrom, dateTo, seasons } = input;
  const nights = eachNight(dateFrom, dateTo);
  const closed = segmentStay(dateFrom, dateTo, seasons) === null;

  return input.unitTypes.map((type) => {
    if (closed) return { unitTypeId: type.id, availableUnits: 0, status: 'closed' as const };

    const typeUnits = input.units.filter((u) => u.unitTypeId === type.id && u.status === 'active');
    const typeBookings = input.bookings.filter(
      (b) =>
        b.unitTypeId === type.id &&
        OCCUPIES.includes(b.status) &&
        rangesOverlap(b.dateFrom, b.dateTo, dateFrom, dateTo),
    );
    const unitIds = new Set(typeUnits.map((u) => u.id));
    const typeBlocks = input.blocks.filter(
      (blk) =>
        rangesOverlap(blk.dateFrom, blk.dateTo, dateFrom, dateTo) &&
        ((blk.unitId && unitIds.has(blk.unitId)) || blk.unitTypeId === type.id),
    );

    let minFree = typeUnits.length;
    for (const night of nights) {
      const nightTo = night; // rango [night, night+1): basta comparar contra la noche
      const occupied = typeBookings.filter((b) => b.dateFrom <= nightTo && nightTo < b.dateTo).length;
      // bloqueos por unidad concreta cuentan 1; por tipo cuentan todas las unidades
      let blocked = 0;
      for (const blk of typeBlocks) {
        if (!(blk.dateFrom <= nightTo && nightTo < blk.dateTo)) continue;
        blocked += blk.unitId ? 1 : typeUnits.length;
      }
      const free = typeUnits.length - occupied - blocked;
      if (free < minFree) minFree = free;
    }

    const availableUnits = Math.max(0, minFree);
    return {
      unitTypeId: type.id,
      availableUnits,
      status: availableUnits > 0 ? ('available' as const) : ('unavailable' as const),
    };
  });
}
