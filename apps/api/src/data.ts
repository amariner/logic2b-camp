/**
 * Adaptador fino filas Drizzle → tipos de dominio del core (ADR 0003/0004).
 * Toda la I/O de lectura para el motor vive aquí.
 */
import type {
  Block,
  BookingSpan,
  ExtraSelection,
  Hold,
  RatePlan,
  Season,
  Unit,
  UnitType,
} from '@logic-camp/core';
import { schema, type Db } from '@logic-camp/db';
import { gt, inArray } from 'drizzle-orm';

export type EngineData = {
  seasons: Season[];
  unitTypes: UnitType[];
  units: Unit[];
  bookings: BookingSpan[];
  blocks: Block[];
  ratePlans: RatePlan[];
};

/** Carga el universo que necesita el motor. Filtrar por fechas es optimización futura. */
export async function loadEngineData(db: Db): Promise<EngineData> {
  const [seasonRows, typeRows, unitRows, bookingRows, blockRows, planRows] = await Promise.all([
    db.select().from(schema.seasonsCalendar),
    db.select().from(schema.unitTypes),
    db.select().from(schema.units),
    db
      .select({
        id: schema.bookings.id,
        unitTypeId: schema.bookings.unitTypeId,
        unitId: schema.bookings.unitId,
        dateFrom: schema.bookings.dateFrom,
        dateTo: schema.bookings.dateTo,
        status: schema.bookings.status,
      })
      .from(schema.bookings)
      .where(inArray(schema.bookings.status, ['pending', 'confirmed'])),
    db.select().from(schema.inventoryBlocks),
    db.select().from(schema.ratePlans),
  ]);

  return {
    seasons: seasonRows.map((s) => ({
      id: s.id,
      name: s.name,
      dateFrom: s.dateFrom,
      dateTo: s.dateTo,
      priority: s.priority,
      isOpen: s.isOpen,
    })),
    unitTypes: typeRows.map((t) => ({
      id: t.id,
      kind: t.kind,
      capacityMin: t.capacityMin,
      capacityMax: t.capacityMax,
      includedPersons: t.includedPersons,
      features: t.features as UnitType['features'],
    })),
    units: unitRows.map((u) => ({
      id: u.id,
      unitTypeId: u.unitTypeId,
      code: u.code,
      status: u.status,
    })),
    bookings: bookingRows,
    blocks: blockRows.map((b) => ({
      unitId: b.unitId,
      unitTypeId: b.unitTypeId,
      dateFrom: b.dateFrom,
      dateTo: b.dateTo,
      reason: b.reason,
    })),
    ratePlans: planRows.map((p) => ({
      unitTypeId: p.unitTypeId,
      seasonId: p.seasonId,
      baseCents: p.baseCents,
      extraPersonCents: p.extraPersonCents,
      childCents: p.childCents,
      petCents: p.petCents,
      electricityCents: p.electricityCents,
      vehicleCents: p.vehicleCents,
      minStay: p.minStay,
      maxStay: p.maxStay,
      arrivalDays: p.arrivalDays,
      departureDays: p.departureDays,
    })),
  };
}

/** Holds vivos del funnel (ADR 0007). Expiración perezosa: los caducados no se cargan. */
export async function loadLiveHolds(db: Db, now: string): Promise<Hold[]> {
  const rows = await db
    .select()
    .from(schema.inventoryHolds)
    .where(gt(schema.inventoryHolds.expiresAt, now));
  return rows.map((h) => ({
    id: h.id,
    unitTypeId: h.unitTypeId,
    dateFrom: h.dateFrom,
    dateTo: h.dateTo,
    expiresAt: h.expiresAt,
  }));
}

export async function loadExtras(db: Db, ids: string[]): Promise<ExtraSelection[]> {
  if (!ids.length) return [];
  const rows = await db.select().from(schema.extras).where(inArray(schema.extras.id, ids));
  return rows.map((r) => ({
    id: r.id,
    priceCents: r.priceCents,
    per: r.per,
    qty: 1,
    concept: `extra.${r.id}`,
  }));
}

/** Extras obligatorios del tenant (required=true) que se añaden siempre. */
export async function loadRequiredExtraIds(db: Db): Promise<string[]> {
  const all = await db.select().from(schema.extras);
  return all.filter((e) => e.required).map((e) => e.id);
}
