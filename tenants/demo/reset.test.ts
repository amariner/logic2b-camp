/**
 * Reset nocturno contra D1 real (ADR 0013) — mismo patrón que apps/api/test:
 * migraciones reales, D1 local de vitest-pool-workers, nada simulado.
 */
import { createDb, schema } from '@logic-camp/db';
import { env } from 'cloudflare:test';
import { sql } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { buildResetStatements, resetDemoData } from './reset';

const db = createDb(env.DB);

async function counts() {
  const [units, bookings, enquiries, users, notifications, audit, sessions] = await Promise.all([
    db.select().from(schema.units),
    db.select().from(schema.bookings),
    db.select().from(schema.enquiries),
    db.select().from(schema.users),
    db.select().from(schema.notificationsLog),
    db.select().from(schema.auditLog),
    db.select().from(schema.sessions),
  ]);
  return {
    units: units.length,
    bookings: bookings.length,
    enquiries: enquiries.length,
    users: users.length,
    notifications: notifications.length,
    audit: audit.length,
    sessions: sessions.length,
  };
}

describe('buildResetStatements (puro)', () => {
  it('borra las 21 tablas de la app antes de sembrar', () => {
    const statements = buildResetStatements(2026);
    const deletes = statements.filter((s) => s.startsWith('DELETE FROM'));
    expect(deletes.length).toBe(21);
    expect(deletes[0]).toBe('DELETE FROM notifications_log;');
    expect(deletes.at(-1)).toBe('DELETE FROM tenants;');
    // orden hijo→padre: bookings se borra antes que units, y units antes que unit_types
    expect(deletes.indexOf('DELETE FROM bookings;')).toBeLessThan(
      deletes.indexOf('DELETE FROM units;'),
    );
    expect(deletes.indexOf('DELETE FROM units;')).toBeLessThan(
      deletes.indexOf('DELETE FROM unit_types;'),
    );
  });

  it('es determinista para el mismo año', () => {
    expect(buildResetStatements(2026)).toEqual(buildResetStatements(2026));
  });
});

describe('resetDemoData contra D1 real', () => {
  it('siembra el inventario completo en una base vacía', async () => {
    await resetDemoData(env.DB, 2026);
    const c = await counts();
    expect(c.units).toBe(83);
    expect(c.bookings).toBeGreaterThanOrEqual(38);
    expect(c.enquiries).toBe(15);
    // 4 empleados (uno por rol) + el visitante anónimo de la demo (ADR 0029)
    expect(c.users).toBe(5);
  });

  it('el visitante de la demo sobrevive al reset: es quien abre la puerta anónima', async () => {
    await resetDemoData(env.DB, 2026);
    const visitante = (await db.select().from(schema.users)).find((u) => u.id === 'usr_demo');
    // el reset borra `sessions` y `users` y los regenera desde el seed: si este
    // usuario no volviera, el botón "Restablecer" dejaría la demo sin puerta
    // por la que volver a entrar (ADR 0029 §4)
    expect(visitante?.role).toBe('demo');
    expect(visitante?.email).toBe('demo@calasereno.example');
  });

  it('borra la basura acumulada durante el día en vez de acumularla', async () => {
    await resetDemoData(env.DB, 2026);
    const before = await counts();

    // simula lo que deja un día de demo: una notificación, una entrada de
    // auditoría y una sesión de más, sin pasar por resetDemoData
    const tenant = (await db.select().from(schema.tenants))[0]!;
    const user = (await db.select().from(schema.users))[0]!;
    await db.insert(schema.notificationsLog).values({
      id: 'ntf_ruido',
      tenantId: tenant.id,
      channel: 'email',
      template: 'test',
      status: 'sent',
    });
    await db.insert(schema.auditLog).values({
      id: 'aud_ruido',
      tenantId: tenant.id,
      userId: user.id,
      entity: 'booking',
      entityId: 'x',
      action: 'note',
      createdAt: new Date().toISOString(),
    });
    await db.insert(schema.sessions).values({
      id: 'ses_ruido',
      userId: user.id,
      token: 'ruido-token',
      expiresAt: new Date(Date.now() + 3600_000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const dirty = await counts();
    expect(dirty.notifications).toBe(before.notifications + 1);
    expect(dirty.audit).toBe(before.audit + 1);
    expect(dirty.sessions).toBe(before.sessions + 1);

    await resetDemoData(env.DB, 2026);
    const after = await counts();
    expect(after).toEqual(before);

    const survivors = await db
      .select()
      .from(schema.notificationsLog)
      .where(sql`${schema.notificationsLog.id} = 'ntf_ruido'`);
    expect(survivors).toHaveLength(0);
  });

  it('vuelve a sembrar 83 unidades y 5 usuarios aunque se llame dos veces seguidas', async () => {
    await resetDemoData(env.DB, 2026);
    await resetDemoData(env.DB, 2026);
    const c = await counts();
    expect(c.units).toBe(83);
    expect(c.users).toBe(5);
  });

  it('el ancla es el año en curso por defecto, sin pasarlo explícito', async () => {
    const currentYear = new Date().getUTCFullYear();
    await resetDemoData(env.DB);
    const tenant = (await db.select().from(schema.tenants))[0]!;
    const bookings = await db.select().from(schema.bookings);
    // el ancla mid-julio del año en curso está en las fechas de la primera reserva
    expect(bookings.some((b) => b.dateFrom.startsWith(String(currentYear)))).toBe(true);
    expect(tenant.slug).toBe('demo');
  });
});
