import { createDb, schema } from '@logic-camp/db';
import { env } from 'cloudflare:test';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import {
  DEMO_REFRESH_BUDGET,
  DEMO_REFRESH_TABLES,
  DEMO_WEEKLY_CRON_BUDGET,
  assertDemoRefreshBudget,
  refreshDemoReservations,
} from './refresh';
import { resetDemoData } from './reset';

const db = createDb(env.DB);
const ANCHOR = '2026-07-15';

describe('refresco semanal de fixtures contra D1 real', () => {
  it('cabe en el presupuesto total y no declara tablas protegidas', () => {
    expect(() => assertDemoRefreshBudget()).not.toThrow();
    expect(DEMO_REFRESH_BUDGET.maxQueries + 140).toBeLessThanOrEqual(
      DEMO_WEEKLY_CRON_BUDGET.maxQueries,
    );
    expect(DEMO_REFRESH_BUDGET.maxRowsRead + 20_000).toBeLessThanOrEqual(
      DEMO_WEEKLY_CRON_BUDGET.maxRowsRead,
    );
    expect(DEMO_REFRESH_BUDGET.maxRowsWritten + 250).toBeLessThanOrEqual(
      DEMO_WEEKLY_CRON_BUDGET.maxRowsWritten,
    );
    expect(DEMO_REFRESH_TABLES).not.toContain('guests');
    expect(DEMO_REFRESH_TABLES).not.toContain('users');
    expect(DEMO_REFRESH_TABLES).not.toContain('units');
  });

  it('es idempotente, acotado y preserva todas las filas reales y el catálogo', async () => {
    await resetDemoData(env.DB, ANCHOR);
    const fixture = (
      await db.select().from(schema.bookings).where(eq(schema.bookings.demoFixture, true))
    )[0]!;
    const fixtureGuest = (
      await db.select().from(schema.guests).where(eq(schema.guests.demoFixture, true))
    )[0]!;
    const fixtureEnquiry = (
      await db.select().from(schema.enquiries).where(eq(schema.enquiries.demoFixture, true))
    )[0]!;
    const unitsBefore = await db.select().from(schema.units);
    const usersBefore = await db.select().from(schema.users);

    await db.insert(schema.bookings).values({
      ...fixture,
      id: 'real_booking_keep',
      code: 'REAL-KEEP-001',
      notes: 'reserva real intocable',
      demoFixture: false,
    });
    await db.insert(schema.guests).values({
      ...fixtureGuest,
      id: 'real_guest_keep',
      name: 'Contacto real',
      demoFixture: false,
    });
    await db.insert(schema.enquiries).values({
      ...fixtureEnquiry,
      id: 'real_enquiry_keep',
      message: 'solicitud real intocable',
      demoFixture: false,
    });

    const changedStatus = fixture.status === 'cancelled' ? 'confirmed' : 'cancelled';
    await db
      .update(schema.bookings)
      .set({ status: changedStatus, notes: 'ruido de una visita' })
      .where(eq(schema.bookings.id, fixture.id));
    await db.insert(schema.payments).values({
      id: 'pay_demo_ruido',
      bookingId: fixture.id,
      provider: 'manual',
      amountCents: 1,
      status: 'succeeded',
      createdAt: `${ANCHOR}T12:00:00.000Z`,
    });
    await db.insert(schema.notificationsLog).values({
      id: 'ntf_demo_ruido',
      tenantId: fixture.tenantId,
      bookingId: fixture.id,
      channel: 'email',
      template: 'booking_reminder',
      status: 'disabled',
    });
    await db.insert(schema.auditLog).values({
      id: 'aud_demo_ruido',
      tenantId: fixture.tenantId,
      entity: 'booking',
      entityId: fixture.id,
      action: 'demo_edit',
      createdAt: `${ANCHOR}T12:00:00.000Z`,
    });

    const report = await refreshDemoReservations(env.DB, ANCHOR);
    expect(report.skipped).toBe(false);
    expect(report.bookingUpdates).toBe(1);
    expect(report.paymentDeletes).toBe(1);
    expect(report.notificationDeletes).toBe(1);
    expect(report.auditDeletes).toBe(1);
    expect(report.rowsWritten).toBeLessThanOrEqual(800);

    expect(
      (await db.select().from(schema.bookings).where(eq(schema.bookings.id, fixture.id)))[0]
        ?.status,
    ).toBe(fixture.status);
    expect(
      await db.select().from(schema.payments).where(eq(schema.payments.id, 'pay_demo_ruido')),
    ).toHaveLength(0);
    expect(
      await db
        .select()
        .from(schema.notificationsLog)
        .where(eq(schema.notificationsLog.id, 'ntf_demo_ruido')),
    ).toHaveLength(0);
    expect(
      await db.select().from(schema.auditLog).where(eq(schema.auditLog.id, 'aud_demo_ruido')),
    ).toHaveLength(0);

    expect(
      (
        await db.select().from(schema.bookings).where(eq(schema.bookings.id, 'real_booking_keep'))
      )[0]?.notes,
    ).toBe('reserva real intocable');
    expect(
      (await db.select().from(schema.guests).where(eq(schema.guests.id, 'real_guest_keep')))[0]
        ?.name,
    ).toBe('Contacto real');
    expect(
      (
        await db.select().from(schema.enquiries).where(eq(schema.enquiries.id, 'real_enquiry_keep'))
      )[0]?.message,
    ).toBe('solicitud real intocable');
    expect(await db.select().from(schema.units)).toEqual(unitsBefore);
    expect(await db.select().from(schema.users)).toEqual(usersBefore);

    expect((await refreshDemoReservations(env.DB, ANCHOR)).skipped).toBe(true);
  });

  it('una semana real de movimiento cabe holgadamente en los fusibles', async () => {
    await resetDemoData(env.DB, '2026-08-18');
    const report = await refreshDemoReservations(env.DB, '2026-08-25');
    expect(report.skipped).toBe(false);
    expect(report.bookingUpdates).toBeLessThanOrEqual(250);
    expect(
      report.paymentInserts + report.paymentUpdates + report.paymentDeletes,
    ).toBeLessThanOrEqual(250);
    expect(report.enquiryUpdates).toBeLessThanOrEqual(25);
    expect(report.rowsWritten).toBeLessThanOrEqual(DEMO_REFRESH_BUDGET.maxRowsWritten);
  });
});
