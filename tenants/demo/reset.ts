/**
 * Reset nocturno de la demo (ADR 0013): wipe + reseed atómico.
 * Agnóstico del binding real — recibe cualquier `D1Database`. El guardado
 * de que esto SOLO se invoque contra el tenant `demo` vive en `worker.ts`,
 * que es el único fichero que lo llama.
 */
import { generateSeed, seedToSql } from './seed';

/**
 * Orden hijo→padre: evita violar FKs aunque D1/SQLite no las fuerce por
 * defecto (disciplina correcta, no una prueba de que fallaría sin ella).
 * Cubre TODAS las tablas de la app, no solo las que siembra `seedToSql`
 * (notifications_log/sessions/accounts/verifications/inventory_holds/meta
 * son operativas: las llena el uso del día, hay que vaciarlas igual).
 *
 * Fuente ÚNICA de este orden: lo reusa también el reseed remoto
 * (`remote-seed.ts`), donde D1 SÍ fuerza las FKs — así el wipe local y el
 * remoto no pueden divergir. `d1_migrations` no está a propósito: se preserva.
 */
export const DELETE_ORDER = [
  'notifications_log',
  'payments',
  'booking_guests',
  'audit_log',
  'sessions',
  'accounts',
  'verifications',
  'inventory_holds',
  'bookings',
  'enquiries',
  'guests',
  'inventory_blocks',
  'rate_rules',
  'rate_plans',
  'units',
  'extras',
  'unit_types',
  'seasons_calendar',
  'users',
  'meta',
  'tenants',
];

/** Puro: construye las sentencias sin tocar ninguna base — testeable sin D1. */
export function buildResetStatements(anchorYear: number): string[] {
  const inserts = seedToSql(generateSeed(anchorYear))
    .split('\n')
    .filter((line) => line.startsWith('INSERT INTO'));
  const deletes = DELETE_ORDER.map((table) => `DELETE FROM ${table};`);
  return [...deletes, ...inserts];
}

/**
 * Ejecuta el wipe + reseed en un único `db.batch()` — D1 lo trata como una
 * transacción: todo o nada. Un reset a medias sería peor que no resetear.
 */
export async function resetDemoData(
  db: D1Database,
  anchorYear = new Date().getUTCFullYear(),
): Promise<void> {
  const statements = buildResetStatements(anchorYear);
  await db.batch(statements.map((sql) => db.prepare(sql)));
}
