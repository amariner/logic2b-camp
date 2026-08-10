import type { Cell } from './export';

export type BackupSnapshot = {
  bookings: number;
  guests: number;
  payments: number;
  lastBookingCreatedAt: string | null;
  migrations: string;
  paymentMismatches: number;
  bookingOverlaps: number;
};

/**
 * Una sola consulta produce la huella que debe sobrevivir al volcado.
 * Los dos últimos campos son invariantes: no basta con conservar el número de
 * filas si la restauración ha roto relaciones o importes.
 */
export const BACKUP_SNAPSHOT_SQL = `
SELECT
  (SELECT COUNT(*) FROM bookings) AS bookings,
  (SELECT COUNT(*) FROM guests) AS guests,
  (SELECT COUNT(*) FROM payments) AS payments,
  (SELECT MAX(created_at) FROM bookings) AS last_booking_created_at,
  (SELECT GROUP_CONCAT(name, '|') FROM (SELECT name FROM d1_migrations ORDER BY id)) AS migrations,
  (SELECT COUNT(*) FROM (
    SELECT b.id
    FROM bookings b LEFT JOIN payments p ON p.booking_id = b.id
    GROUP BY b.id
    HAVING b.paid_cents != COALESCE(SUM(p.amount_cents), 0)
  )) AS payment_mismatches,
  (SELECT COUNT(*) FROM bookings a JOIN bookings b
    ON a.unit_id = b.unit_id AND a.id < b.id
   AND a.date_from < b.date_to AND b.date_from < a.date_to
    WHERE a.unit_id IS NOT NULL
      AND a.status IN ('confirmed', 'completed')
      AND b.status IN ('confirmed', 'completed')) AS booking_overlaps
`;

export function parseD1Rows(raw: string): Record<string, Cell>[] {
  const start = raw.indexOf('[');
  if (start < 0) throw new Error('Wrangler no devolvió JSON');
  const parsed = JSON.parse(raw.slice(start)) as { results?: Record<string, Cell>[] }[];
  return parsed[0]?.results ?? [];
}

function numberCell(row: Record<string, Cell>, key: string): number {
  const value = row[key];
  if (typeof value !== 'number') throw new Error(`Huella inválida: ${key} no es numérico`);
  return value;
}

export function backupSnapshot(raw: string): BackupSnapshot {
  const row = parseD1Rows(raw)[0];
  if (!row) throw new Error('Huella inválida: la consulta no devolvió filas');
  const lastBookingCreatedAt = row.last_booking_created_at;
  const migrations = row.migrations;
  if (lastBookingCreatedAt !== null && typeof lastBookingCreatedAt !== 'string') {
    throw new Error('Huella inválida: last_booking_created_at no es texto');
  }
  if (typeof migrations !== 'string' || migrations.length === 0) {
    throw new Error('Huella inválida: no se encontraron migraciones');
  }
  return {
    bookings: numberCell(row, 'bookings'),
    guests: numberCell(row, 'guests'),
    payments: numberCell(row, 'payments'),
    lastBookingCreatedAt,
    migrations,
    paymentMismatches: numberCell(row, 'payment_mismatches'),
    bookingOverlaps: numberCell(row, 'booking_overlaps'),
  };
}

export function assertValidRestoration(source: BackupSnapshot, restored: BackupSnapshot): void {
  if (source.paymentMismatches !== 0 || source.bookingOverlaps !== 0) {
    throw new Error('La base origen ya incumple invariantes; no sirve como copia de referencia');
  }
  if (restored.paymentMismatches !== 0 || restored.bookingOverlaps !== 0) {
    throw new Error('La base restaurada incumple invariantes');
  }
  if (JSON.stringify(source) !== JSON.stringify(restored)) {
    throw new Error(
      `La huella restaurada no coincide con el origen\norigen=${JSON.stringify(source)}\nrestaurada=${JSON.stringify(restored)}`,
    );
  }
}
