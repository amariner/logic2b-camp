/**
 * Refresco incremental de reservas ficticias de Cala Sereno.
 *
 * No toca catálogo, usuarios, sesiones, huéspedes ni ninguna fila real. Compara
 * el seed semanal con las filas marcadas `demo_fixture=1` y solo escribe las
 * diferencias, además de sus pagos/notificaciones/auditoría dependientes.
 */
import { generateSeed } from './seed';

const LIMITS = {
  bookingUpdates: 250,
  enquiryUpdates: 25,
  paymentMutations: 250,
  dependentDeletes: 250,
  statements: 800,
  rowsWritten: 800,
  batchStatements: 50,
} as const;

export const DEMO_REFRESH_BUDGET = {
  maxQueries: 812,
  maxRowsRead: 10_000,
  maxRowsWritten: 800,
} as const;

export const DEMO_WEEKLY_CRON_BUDGET = {
  // Incluye la política semanal genérica (140/20k/250) y este refresco.
  maxQueries: 1_000,
  maxRowsRead: 30_000,
  maxRowsWritten: 1_100,
} as const;

export const DEMO_REFRESH_TABLES = [
  'bookings',
  'payments',
  'enquiries',
  'notifications_log',
  'audit_log',
  'meta',
] as const;

const DEMO_PROTECTED_TABLES = new Set([
  'tenants',
  'seasons_calendar',
  'unit_types',
  'units',
  'rate_plans',
  'rate_rules',
  'extras',
  'inventory_blocks',
  'guests',
  'booking_guests',
  'users',
  'accounts',
  'sessions',
  'verifications',
]);

export function assertDemoRefreshBudget(): void {
  const forbidden = DEMO_REFRESH_TABLES.filter((table) => DEMO_PROTECTED_TABLES.has(table));
  if (forbidden.length) throw new Error(`refresco demo toca tablas protegidas: ${forbidden}`);
  if (DEMO_REFRESH_BUDGET.maxQueries > DEMO_WEEKLY_CRON_BUDGET.maxQueries - 140)
    throw new Error('refresco demo excede maxQueries');
  if (DEMO_REFRESH_BUDGET.maxRowsRead > DEMO_WEEKLY_CRON_BUDGET.maxRowsRead - 20_000)
    throw new Error('refresco demo excede maxRowsRead');
  if (DEMO_REFRESH_BUDGET.maxRowsWritten > DEMO_WEEKLY_CRON_BUDGET.maxRowsWritten - 250)
    throw new Error('refresco demo excede maxRowsWritten');
}

export type DemoRefreshReport = {
  skipped: boolean;
  period: string;
  bookingUpdates: number;
  enquiryUpdates: number;
  paymentInserts: number;
  paymentUpdates: number;
  paymentDeletes: number;
  notificationDeletes: number;
  auditDeletes: number;
  statements: number;
  rowsWritten: number;
};

type RawRow = Record<string, unknown> & { id: string };

const bookingFields = [
  'status',
  'channel',
  'date_from',
  'date_to',
  'unit_type_id',
  'unit_id',
  'occupancy',
  'extras',
  'price_breakdown',
  'total_cents',
  'paid_cents',
  'tourist_tax_cents',
  'deposit_cents',
  'notes',
  'checked_in_at',
  'checked_out_at',
  'payment_kind',
  'locale',
] as const;

const enquiryFields = [
  'status',
  'date_from',
  'date_to',
  'occupancy',
  'unit_type_id',
  'message',
  'contact',
  'locale',
  'source',
  'converted_booking_id',
  'created_at',
] as const;

const paymentFields = ['provider', 'provider_ref', 'amount_cents', 'status', 'raw'] as const;

function dbValue(value: unknown): unknown {
  if (value === undefined) return null;
  if (value !== null && typeof value === 'object') return JSON.stringify(value);
  if (typeof value === 'boolean') return value ? 1 : 0;
  return value;
}

function differs(actual: RawRow, desired: RawRow, fields: readonly string[]): boolean {
  return fields.some(
    (field) => String(actual[field] ?? '') !== String(dbValue(desired[field]) ?? ''),
  );
}

function updateStatement(
  db: D1Database,
  table: 'bookings' | 'enquiries' | 'payments',
  desired: RawRow,
  fields: readonly string[],
): D1PreparedStatement {
  const extra = table === 'bookings' ? ', updated_at = ?' : '';
  const sql = `UPDATE ${table} SET ${fields.map((field) => `${field} = ?`).join(', ')}${extra} WHERE id = ?`;
  const values = fields.map((field) => dbValue(desired[field]));
  if (table === 'bookings') values.push(dbValue(desired.updated_at));
  values.push(desired.id);
  return db.prepare(sql).bind(...values);
}

function mondayOf(anchor: string): string {
  const date = new Date(`${anchor}T00:00:00.000Z`);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - day + 1);
  return date.toISOString().slice(0, 10);
}

function groups<T>(values: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let offset = 0; offset < values.length; offset += size)
    out.push(values.slice(offset, offset + size));
  return out;
}

function placeholders(length: number): string {
  return Array.from({ length }, () => '?').join(',');
}

async function rows<T extends RawRow>(statement: D1PreparedStatement): Promise<T[]> {
  return (await statement.all<T>()).results;
}

function assertLimit(label: string, actual: number, limit: number): void {
  if (actual > limit) throw new Error(`fusible demo: ${label}=${actual} supera ${limit}`);
}

export const demoRefreshPeriod = (anchor: string): string => `demo-refresh:${mondayOf(anchor)}`;

export async function refreshDemoReservations(
  db: D1Database,
  anchor = new Date().toISOString().slice(0, 10),
): Promise<DemoRefreshReport> {
  assertDemoRefreshBudget();
  const period = demoRefreshPeriod(anchor);
  const token = `${period}:${crypto.randomUUID()}`;
  const lock = await db
    .prepare('INSERT OR IGNORE INTO meta (`key`, `value`) VALUES (?, ?)')
    .bind(period, token)
    .run();
  if ((lock.meta.changes ?? 0) === 0) {
    return {
      skipped: true,
      period,
      bookingUpdates: 0,
      enquiryUpdates: 0,
      paymentInserts: 0,
      paymentUpdates: 0,
      paymentDeletes: 0,
      notificationDeletes: 0,
      auditDeletes: 0,
      statements: 0,
      rowsWritten: 0,
    };
  }

  try {
    const seed = generateSeed(anchor);
    const desiredBookings = new Map(seed.bookings.map((row) => [row.id, row as RawRow]));
    const desiredEnquiries = new Map(seed.enquiries.map((row) => [String(row.id), row as RawRow]));
    const desiredPayments = new Map(
      seed.payments.map((row) => [String(row.id), row as unknown as RawRow]),
    );

    const [currentBookings, currentEnquiries, currentPayments] = await Promise.all([
      rows<RawRow>(db.prepare('SELECT * FROM bookings WHERE demo_fixture = 1')),
      rows<RawRow>(db.prepare('SELECT * FROM enquiries WHERE demo_fixture = 1')),
      rows<RawRow>(
        db.prepare(
          'SELECT payments.* FROM payments JOIN bookings ON bookings.id = payments.booking_id WHERE bookings.demo_fixture = 1',
        ),
      ),
    ]);

    // Si cambia el universo (p.ej. salto de año), el refresco se para. Añadir o
    // borrar miles de fixtures requiere un reseed local revisado, nunca un cron.
    if (
      currentBookings.length !== desiredBookings.size ||
      currentBookings.some((row) => !desiredBookings.has(row.id)) ||
      currentEnquiries.length !== desiredEnquiries.size ||
      currentEnquiries.some((row) => !desiredEnquiries.has(row.id))
    ) {
      throw new Error(
        'fusible demo: el universo de fixtures cambió; requiere reseed manual revisado',
      );
    }

    const changedBookings = currentBookings.filter((row) =>
      differs(row, desiredBookings.get(row.id)!, bookingFields),
    );
    const changedEnquiries = currentEnquiries.filter((row) =>
      differs(row, desiredEnquiries.get(row.id)!, enquiryFields),
    );
    const currentPaymentById = new Map(currentPayments.map((row) => [row.id, row]));
    const paymentInserts = [...desiredPayments.values()].filter(
      (row) => !currentPaymentById.has(row.id),
    );
    const paymentUpdates = currentPayments.filter((row) => {
      const desired = desiredPayments.get(row.id);
      return desired ? differs(row, desired, paymentFields) : false;
    });
    const paymentDeletes = currentPayments.filter((row) => !desiredPayments.has(row.id));

    assertLimit('bookingUpdates', changedBookings.length, LIMITS.bookingUpdates);
    assertLimit('enquiryUpdates', changedEnquiries.length, LIMITS.enquiryUpdates);
    assertLimit(
      'paymentMutations',
      paymentInserts.length + paymentUpdates.length + paymentDeletes.length,
      LIMITS.paymentMutations,
    );

    const changedIds = changedBookings.map((row) => row.id);
    const changedIdChunks = groups(changedIds, 75);
    const [notificationIds, auditIds] = changedIds.length
      ? await Promise.all([
          Promise.all(
            changedIdChunks.map((ids) =>
              rows<RawRow>(
                db
                  .prepare(
                    `SELECT id FROM notifications_log WHERE booking_id IN (${placeholders(ids.length)}) LIMIT ?`,
                  )
                  .bind(...ids, LIMITS.dependentDeletes + 1),
              ),
            ),
          ).then((parts) => parts.flat()),
          Promise.all(
            changedIdChunks.map((ids) =>
              rows<RawRow>(
                db
                  .prepare(
                    `SELECT id FROM audit_log WHERE entity = 'booking' AND entity_id IN (${placeholders(ids.length)}) LIMIT ?`,
                  )
                  .bind(...ids, LIMITS.dependentDeletes + 1),
              ),
            ),
          ).then((parts) => parts.flat()),
        ])
      : [[], []];
    assertLimit('notificationDeletes', notificationIds.length, LIMITS.dependentDeletes);
    assertLimit('auditDeletes', auditIds.length, LIMITS.dependentDeletes);

    const statements: D1PreparedStatement[] = [];
    for (const row of changedBookings) {
      statements.push(updateStatement(db, 'bookings', desiredBookings.get(row.id)!, bookingFields));
    }
    for (const row of changedEnquiries) {
      statements.push(
        updateStatement(db, 'enquiries', desiredEnquiries.get(row.id)!, enquiryFields),
      );
    }
    for (const row of paymentUpdates) {
      statements.push(updateStatement(db, 'payments', desiredPayments.get(row.id)!, paymentFields));
    }
    for (const row of paymentInserts) {
      statements.push(
        db
          .prepare(
            'INSERT INTO payments (id, booking_id, provider, provider_ref, amount_cents, status, raw, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          )
          .bind(
            row.id,
            row.booking_id,
            row.provider,
            row.provider_ref ?? null,
            row.amount_cents,
            row.status,
            dbValue(row.raw),
            row.created_at,
          ),
      );
    }
    for (const chunk of groups(
      paymentDeletes.map((row) => row.id),
      75,
    )) {
      statements.push(
        db
          .prepare(`DELETE FROM payments WHERE id IN (${placeholders(chunk.length)})`)
          .bind(...chunk),
      );
    }
    for (const [table, ids] of [
      ['notifications_log', notificationIds.map((row) => row.id)],
      ['audit_log', auditIds.map((row) => row.id)],
    ] as const) {
      for (const chunk of groups(ids, 75)) {
        statements.push(
          db
            .prepare(`DELETE FROM ${table} WHERE id IN (${placeholders(chunk.length)})`)
            .bind(...chunk),
        );
      }
    }

    const rowsWritten =
      1 +
      changedBookings.length +
      changedEnquiries.length +
      paymentInserts.length +
      paymentUpdates.length +
      paymentDeletes.length +
      notificationIds.length +
      auditIds.length;
    assertLimit('statements', statements.length, LIMITS.statements);
    assertLimit('rowsWritten', rowsWritten, LIMITS.rowsWritten);

    for (const chunk of groups(statements, LIMITS.batchStatements)) await db.batch(chunk);

    return {
      skipped: false,
      period,
      bookingUpdates: changedBookings.length,
      enquiryUpdates: changedEnquiries.length,
      paymentInserts: paymentInserts.length,
      paymentUpdates: paymentUpdates.length,
      paymentDeletes: paymentDeletes.length,
      notificationDeletes: notificationIds.length,
      auditDeletes: auditIds.length,
      statements: statements.length,
      rowsWritten,
    };
  } catch (error) {
    // Permite reintentar tras un fallo parcial: todas las escrituras son
    // idempotentes y la siguiente pasada recalcula únicamente lo que falte.
    await db.prepare('DELETE FROM meta WHERE `key` = ? AND `value` = ?').bind(period, token).run();
    throw error;
  }
}
