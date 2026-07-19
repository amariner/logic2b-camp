/**
 * Cron de aviso de reservas `pending` colgadas (ADR 0014): contra D1 real,
 * no toca `status` ni inventario — solo deja rastro en `notifications_log`.
 */
import { createDb, schema } from '@logic-camp/db';
import { env } from 'cloudflare:test';
import { and, eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { notifyStuckPendingBookings } from '../src/notify';
import { seedTenant } from './fixtures';

const db = createDb(env.DB);
const T = 'ten_cron';

const isoHoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

async function insertBooking(opts: {
  id: string;
  status: 'pending' | 'confirmed';
  channel: 'web' | 'phone';
  createdAt: string;
  leadName?: string;
}) {
  await db.insert(schema.bookings).values({
    id: opts.id,
    tenantId: T,
    code: `CS-${opts.id}`,
    status: opts.status,
    channel: opts.channel,
    dateFrom: '2026-08-01',
    dateTo: '2026-08-08',
    unitTypeId: 'ut_std',
    unitId: 'unt_1',
    occupancy: { adults: 2, childrenAges: [], pets: 0, vehicles: 0 },
    extras: [],
    priceBreakdown: { lines: [], totalCents: 14000, touristTaxCents: 0, currency: 'EUR' },
    totalCents: 14000,
    paidCents: 0,
    touristTaxCents: 0,
    locale: 'es',
    createdAt: opts.createdAt,
    updatedAt: opts.createdAt,
  });
  if (opts.leadName) {
    await db.insert(schema.guests).values({ id: `gst_${opts.id}`, tenantId: T, name: opts.leadName, surname: 'Dubois' });
    await db
      .insert(schema.bookingGuests)
      .values({ bookingId: opts.id, guestId: `gst_${opts.id}`, isLead: true });
  }
}

async function logsFor(bookingId: string) {
  return db
    .select()
    .from(schema.notificationsLog)
    .where(
      and(
        eq(schema.notificationsLog.bookingId, bookingId),
        eq(schema.notificationsLog.template, 'booking_pending_stuck'),
      ),
    );
}

beforeAll(async () => {
  await seedTenant(env.DB, 'cron');
});

describe('notifyStuckPendingBookings (ADR 0014)', () => {
  it('avisa de una reserva web pending de más de 2h, con el titular, sin tocar su status, y no repite el aviso', async () => {
    await insertBooking({
      id: 'bkg_old',
      status: 'pending',
      channel: 'web',
      createdAt: isoHoursAgo(3),
      leadName: 'Marc',
    });

    await notifyStuckPendingBookings(db, 'cron', undefined);

    const logs = await logsFor('bkg_old');
    expect(logs).toHaveLength(1);
    expect(logs[0]?.status).toBe('disabled'); // sin RESEND_API_KEY en el entorno de test

    const booking = (
      await db.select().from(schema.bookings).where(eq(schema.bookings.id, 'bkg_old'))
    )[0];
    expect(booking?.status).toBe('pending'); // el aviso NO cancela ni toca inventario

    // una segunda pasada del cron (p.ej. el siguiente tick de 15 min) no repite el aviso
    await notifyStuckPendingBookings(db, 'cron', undefined);
    expect(await logsFor('bkg_old')).toHaveLength(1);
  });

  it('NO avisa de una reserva reciente (menos de 2h)', async () => {
    await insertBooking({ id: 'bkg_recent', status: 'pending', channel: 'web', createdAt: isoHoursAgo(1) });
    await notifyStuckPendingBookings(db, 'cron', undefined);
    expect(await logsFor('bkg_recent')).toHaveLength(0);
  });

  it('NO avisa de una reserva confirmada aunque sea vieja', async () => {
    await insertBooking({ id: 'bkg_confirmed', status: 'confirmed', channel: 'web', createdAt: isoHoursAgo(5) });
    await notifyStuckPendingBookings(db, 'cron', undefined);
    expect(await logsFor('bkg_confirmed')).toHaveLength(0);
  });

  it('NO avisa de una reserva pending por teléfono (nunca nace pending por pago)', async () => {
    await insertBooking({ id: 'bkg_phone', status: 'pending', channel: 'phone', createdAt: isoHoursAgo(5) });
    await notifyStuckPendingBookings(db, 'cron', undefined);
    expect(await logsFor('bkg_phone')).toHaveLength(0);
  });
});
