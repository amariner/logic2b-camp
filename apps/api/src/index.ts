import { createDb, schema } from '@logic-camp/db';
import { inArray, lt } from 'drizzle-orm';
import { app } from './app';
import { assertCronBudget, cronName } from './cron-policy';
import { errorDetail, logEvent } from './errors';
import { notifyArrivalReminders, notifyStuckPendingBookings } from './notify';
import { sweepEnquiries, sweepRetention } from './rgpd';
import type { Bindings } from './tenant';

export type { AppType } from './app';
export type { Bindings } from './tenant';
export { createApiClient, type ApiClient } from './client';
export { CRONS } from './cron-policy';

/**
 * Cada tarea del cron falla SOLA (ADR 0026 §3).
 *
 * Antes iban encadenadas con `await` sin protección: si la purga de holds
 * reventaba, los recordatorios de llegada de ese tick no llegaban a ejecutarse y
 * nadie se enteraba. Un fallo en la limpieza no puede costarle al huésped su aviso
 * de llegada.
 */
async function runTask(name: string, tenant: string, fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
  } catch (err) {
    logEvent({
      level: 'error',
      event: 'cron_task_failed',
      tenant,
      task: name,
      detail: errorDetail(err).message,
    });
  }
}

async function purgeExpiredHolds(db: ReturnType<typeof createDb>): Promise<void> {
  // La expiración perezosa ya protege disponibilidad. Esta limpieza solo evita
  // basura, por eso 50 filas/día son suficientes y actúan como fusible.
  const expired = await db
    .select({ id: schema.inventoryHolds.id })
    .from(schema.inventoryHolds)
    .where(lt(schema.inventoryHolds.expiresAt, new Date().toISOString()))
    .limit(50);
  if (expired.length) {
    await db.delete(schema.inventoryHolds).where(
      inArray(
        schema.inventoryHolds.id,
        expired.map((row) => row.id),
      ),
    );
  }
}

/** Ejecutable y testeable sin desplegar ni tocar la configuración remota. */
export async function runScheduled(event: ScheduledController, env: Bindings): Promise<void> {
  const name = cronName(event.cron);
  if (!name) return;
  assertCronBudget(name);

  const db = createDb(env.DB);
  const tenantSlug = env.TENANT_SLUG ?? 'unknown';

  if (name === 'daily') {
    await runTask('purge_holds', tenantSlug, () => purgeExpiredHolds(db));
    await runTask('stuck_pending', tenantSlug, () =>
      notifyStuckPendingBookings(db, tenantSlug, env.RESEND_API_KEY),
    );
    await runTask('arrival_reminders', tenantSlug, () =>
      notifyArrivalReminders(db, tenantSlug, env.RESEND_API_KEY),
    );
    return;
  }

  // Retención RGPD semanal y con lote máximo. Es irreversible, por lo que no
  // comparte tick con tareas operativas y nunca procesa fixtures sintéticos.
  await runTask('retention_sweep', tenantSlug, async () => {
    const result = await sweepRetention(db, tenantSlug, {
      maxCandidates: 500,
      maxAnonymize: 25,
    });
    if (result.anonymized > 0) {
      logEvent({
        level: 'info',
        event: 'retention_sweep',
        tenant: tenantSlug,
        scanned: result.scanned,
        anonymized: result.anonymized,
        capped: result.capped,
      });
    }
  });
  await runTask('enquiry_retention', tenantSlug, async () => {
    const result = await sweepEnquiries(db, { maxCandidates: 500, maxAnonymize: 25 });
    if (result.anonymized > 0) {
      logEvent({
        level: 'info',
        event: 'enquiry_retention',
        tenant: tenantSlug,
        anonymized: result.anonymized,
        capped: result.capped,
      });
    }
  });
}

export default {
  fetch: app.fetch,

  async scheduled(event: ScheduledController, env: Bindings): Promise<void> {
    await runScheduled(event, env);
  },
};
