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
    const statements = buildResetStatements('2026-07-15');
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

  it('es determinista para la misma ancla', () => {
    expect(buildResetStatements('2026-07-15')).toEqual(buildResetStatements('2026-07-15'));
  });

  /**
   * ADR 0030: el ancla es ahora el día real, así que el reset de mañana NO
   * produce lo mismo que el de hoy — y eso es el objetivo, no un fallo. Lo que
   * sí tiene que quedarse quieto es el camping: el PRNG se siembra con el año.
   */
  it('mover el ancla un día mueve los datos', () => {
    expect(buildResetStatements('2026-07-15')).not.toEqual(buildResetStatements('2026-07-16'));
  });
});

describe('resetDemoData contra D1 real', () => {
  it('siembra el inventario completo en una base vacía', async () => {
    await resetDemoData(env.DB, '2026-07-15');
    const c = await counts();
    expect(c.units).toBe(83);
    expect(c.bookings).toBeGreaterThanOrEqual(38);
    expect(c.enquiries).toBe(15);
    // 4 empleados (uno por rol) + el visitante anónimo de la demo (ADR 0029)
    expect(c.users).toBe(5);
  });

  it('el visitante de la demo sobrevive al reset: es quien abre la puerta anónima', async () => {
    await resetDemoData(env.DB, '2026-07-15');
    const visitante = (await db.select().from(schema.users)).find((u) => u.id === 'usr_demo');
    // el reset borra `sessions` y `users` y los regenera desde el seed: si este
    // usuario no volviera, el botón "Restablecer" dejaría la demo sin puerta
    // por la que volver a entrar (ADR 0029 §4)
    expect(visitante?.role).toBe('demo');
    expect(visitante?.email).toBe('demo@calasereno.example');
  });

  it('borra la basura acumulada durante el día en vez de acumularla', async () => {
    await resetDemoData(env.DB, '2026-07-15');
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

    await resetDemoData(env.DB, '2026-07-15');
    const after = await counts();
    expect(after).toEqual(before);

    const survivors = await db
      .select()
      .from(schema.notificationsLog)
      .where(sql`${schema.notificationsLog.id} = 'ntf_ruido'`);
    expect(survivors).toHaveLength(0);
  });

  it('vuelve a sembrar 83 unidades y 5 usuarios aunque se llame dos veces seguidas', async () => {
    await resetDemoData(env.DB, '2026-07-15');
    await resetDemoData(env.DB, '2026-07-15');
    const c = await counts();
    expect(c.units).toBe(83);
    expect(c.users).toBe(5);
  });

  /**
   * ADR 0030: por defecto el ancla es HOY, no "mediados de julio del año en
   * curso". Esto es lo que hace que la demo del cron nocturno tenga siempre
   * llegadas y salidas del día — la propiedad que se comprueba aquí contra la
   * D1 real, no solo sobre el objeto del generador.
   */
  it('el ancla por defecto es el día de hoy: la demo tiene llegadas y salidas del día', async () => {
    const hoy = new Date().toISOString().slice(0, 10);
    await resetDemoData(env.DB);
    const tenant = (await db.select().from(schema.tenants))[0]!;
    const bookings = await db.select().from(schema.bookings);
    expect(tenant.slug).toBe('demo');
    expect(bookings.filter((b) => b.dateFrom === hoy).length).toBeGreaterThan(0);
    // y al menos una salida de hoy ofrece el gesto que hasta ADR 0030 no
    // aparecía NUNCA: registrada dentro, sin cerrar
    const cerrables = bookings.filter(
      (b) => b.dateTo === hoy && b.status === 'confirmed' && b.checkedInAt && !b.checkedOutAt,
    );
    expect(cerrables.length, `sin check-out posible el ${hoy}`).toBeGreaterThan(0);
  });
});
