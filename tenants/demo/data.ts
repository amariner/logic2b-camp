/**
 * Datos que la web pública consume EN BUILD (alias @tenant/data).
 * Derivados del MISMO generador que siembra la D1: tarifas, temporadas y
 * fichas técnicas no pueden divergir de lo que responde la API.
 * (En Fase 9 el asistente de alta generará este fichero para cada camping.)
 */
import {
  generateSeed,
  type SeedExtra,
  type SeedRatePlan,
  type SeedSeason,
  type SeedUnitType,
} from './seed';

// Mismo ancla por defecto que `pnpm db:seed` (write-seed.ts): el día del build.
// Para la web pública solo cuentan temporadas, tarifas y fichas, que dependen
// del AÑO del ancla y no del día (ADR 0030 §2).
const anchor = new Date().toISOString().slice(0, 10);
const year = Number(anchor.slice(0, 4));
const seed = generateSeed(anchor);

export type WebSeason = SeedSeason;
export type WebRatePlan = SeedRatePlan;
export type WebExtra = SeedExtra;
export type WebUnitType = SeedUnitType & { unitCount: number };

export type WebData = {
  year: number;
  seasons: WebSeason[];
  unitTypes: WebUnitType[];
  ratePlans: WebRatePlan[];
  extras: WebExtra[];
};

export const webData: WebData = {
  year,
  // orden estable por prioridad: la base (Apertura) primero
  seasons: [...seed.seasons_calendar].sort((a, b) => a.priority - b.priority),
  unitTypes: seed.unit_types.map((t) => ({
    ...t,
    unitCount: seed.units.filter((u) => u.unit_type_id === t.id).length,
  })),
  ratePlans: seed.rate_plans,
  extras: seed.extras,
};

export default webData;
