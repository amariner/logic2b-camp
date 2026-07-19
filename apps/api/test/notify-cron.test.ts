/**
 * Cron de avisos automáticos (ADR 0014 + ADR 0015): contra D1 real. Ninguno
 * de los dos toca `status` ni inventario — solo dejan rastro en
 * `notifications_log`.
 */
import { createDb, schema } from '@logic-camp/db';
import { env } from 'cloudflare:test';
import { and, eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { notifyArrivalReminders, notifyStuckPendingBookings } from '../src/notify';
import { seedTenant } from './fixtures';

const db = createDb(env.DB);
const T = 'ten_cron';

const isoHoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
const isoDate = (offsetDays: number) =>
  new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10);

async function insertBooking(opts: {
  id: string;
  status: 'pending' | 'confirmed';
  channel: 'web' | 'phone';
  createdAt: string;
  dateFrom?: string;
  leadName?: string;
  leadEmail?: string;
}) {
  await db.insert(schema.bookings).values({
    id: opts.id,
    tenantId: T,
    code: `CS-${opts.id}`,
    status: opts.status,
    channel: opts.channel,
    dateFrom: opts.dateFrom ?? '2026-08-01',
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
    await db.insert(schema.guests).values({
      id: `gst_${opts.id}`,
      tenantId: T,
      name: opts.leadName,
      surname: 'Dubois',
      email: opts.leadEmail,
    });
    await db
      .insert(schema.bookingGuests)
      .values({ bookingId: opts.id, guestId: `gst_${opts.id}`, isLead: true });
  }
}

async function logsFor(bookingId: string, template: string) {
  return db
    .select()
    .from(schema.notificationsLog)
    .where(
      and(
        eq(schema.notificationsLog.bookingId, bookingId),
        eq(schema.notificationsLog.template, template),
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

    const logs = await logsFor('bkg_old', 'booking_pending_stuck');
    expect(logs).toHaveLength(1);
    expect(logs[0]?.status).toBe('disabled'); // sin RESEND_API_KEY en el entorno de test

    const booking = (
      await db.select().from(schema.bookings).where(eq(schema.bookings.id, 'bkg_old'))
    )[0];
    expect(booking?.status).toBe('pending'); // el aviso NO cancela ni toca inventario

    // una segunda pasada del cron (p.ej. el siguiente tick de 15 min) no repite el aviso
    await notifyStuckPendingBookings(db, 'cron', undefined);
    expect(await logsFor('bkg_old', 'booking_pending_stuck')).toHaveLength(1);
  });

  it('NO avisa de una reserva reciente (menos de 2h)', async () => {
    await insertBooking({ id: 'bkg_recent', status: 'pending', channel: 'web', createdAt: isoHoursAgo(1) });
    await notifyStuckPendingBookings(db, 'cron', undefined);
    expect(await logsFor('bkg_recent', 'booking_pending_stuck')).toHaveLength(0);
  });

  it('NO avisa de una reserva confirmada aunque sea vieja', async () => {
    await insertBooking({ id: 'bkg_confirmed', status: 'confirmed', channel: 'web', createdAt: isoHoursAgo(5) });
    await notifyStuckPendingBookings(db, 'cron', undefined);
    expect(await logsFor('bkg_confirmed', 'booking_pending_stuck')).toHaveLength(0);
  });

  it('NO avisa de una reserva pending por teléfono (nunca nace pending por pago)', async () => {
    await insertBooking({ id: 'bkg_phone', status: 'pending', channel: 'phone', createdAt: isoHoursAgo(5) });
    await notifyStuckPendingBookings(db, 'cron', undefined);
    expect(await logsFor('bkg_phone', 'booking_pending_stuck')).toHaveLength(0);
  });
});

describe('notifyArrivalReminders (ADR 0015)', () => {
  it('recuerda a un huésped confirmado que llega mañana, y no repite el recordatorio', async () => {
    await insertBooking({
      id: 'bkg_arrival',
      status: 'confirmed',
      channel: 'web',
      createdAt: isoHoursAgo(48),
      dateFrom: isoDate(1),
      leadName: 'Anna',
      leadEmail: 'anna@example.com',
    });

    await notifyArrivalReminders(db, 'cron', undefined);

    const logs = await logsFor('bkg_arrival', 'booking_reminder');
    expect(logs).toHaveLength(1);
    expect(logs[0]?.status).toBe('disabled'); // sin RESEND_API_KEY en el entorno de test

    // una segunda pasada del cron no repite el recordatorio
    await notifyArrivalReminders(db, 'cron', undefined);
    expect(await logsFor('bkg_arrival', 'booking_reminder')).toHaveLength(1);
  });

  it('NO recuerda sin email del titular — nunca cae al buzón interno como sustituto', async () => {
    await insertBooking({
      id: 'bkg_arrival_sin_email',
      status: 'confirmed',
      channel: 'phone',
      createdAt: isoHoursAgo(48),
      dateFrom: isoDate(1),
      leadName: 'Bruno',
    });
    await notifyArrivalReminders(db, 'cron', undefined);
    expect(await logsFor('bkg_arrival_sin_email', 'booking_reminder')).toHaveLength(0);
  });

  it('NO recuerda una llegada que no es mañana', async () => {
    await insertBooking({
      id: 'bkg_arrival_lejos',
      status: 'confirmed',
      channel: 'web',
      createdAt: isoHoursAgo(48),
      dateFrom: isoDate(3),
      leadName: 'Chloé',
      leadEmail: 'chloe@example.com',
    });
    await notifyArrivalReminders(db, 'cron', undefined);
    expect(await logsFor('bkg_arrival_lejos', 'booking_reminder')).toHaveLength(0);
  });

  it('NO recuerda una reserva pending que llega mañana (solo confirmadas)', async () => {
    await insertBooking({
      id: 'bkg_arrival_pending',
      status: 'pending',
      channel: 'web',
      createdAt: isoHoursAgo(1),
      dateFrom: isoDate(1),
      leadName: 'Diego',
      leadEmail: 'diego@example.com',
    });
    await notifyArrivalReminders(db, 'cron', undefined);
    expect(await logsFor('bkg_arrival_pending', 'booking_reminder')).toHaveLength(0);
  });
});
