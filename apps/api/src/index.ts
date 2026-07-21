import { createDb, schema } from '@logic-camp/db';
import { lt } from 'drizzle-orm';
import { app } from './app';
import { errorDetail, logEvent } from './errors';
import { notifyArrivalReminders, notifyStuckPendingBookings } from './notify';
import { sweepEnquiries, sweepRetention } from './rgpd';
import type { Bindings } from './tenant';

export type { AppType } from './app';
export type { Bindings } from './tenant';
export { createApiClient, type ApiClient } from './client';

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

export default {
  fetch: app.fetch,

  // Cron (ADR 0007 + 0014 + 0015 + 0026): purga de holds caducados (la expiración
  // perezosa ya los ignora en las queries; esto solo limpia filas muertas) + aviso
  // de reservas web `pending` colgadas sin pagar ni cancelar + recordatorio de
  // llegada al huésped el día antes + purga por retención de datos personales.
  async scheduled(_event: ScheduledController, env: Bindings): Promise<void> {
    const db = createDb(env.DB);
    const tenantSlug = env.TENANT_SLUG ?? 'unknown';

    await runTask('purge_holds', tenantSlug, () =>
      db
        .delete(schema.inventoryHolds)
        .where(lt(schema.inventoryHolds.expiresAt, new Date().toISOString())),
    );
    await runTask('stuck_pending', tenantSlug, () =>
      notifyStuckPendingBookings(db, tenantSlug, env.RESEND_API_KEY),
    );
    await runTask('arrival_reminders', tenantSlug, () =>
      notifyArrivalReminders(db, tenantSlug, env.RESEND_API_KEY),
    );
    // Retención RGPD (ADR 0026 §2.4). Va la ÚLTIMA a propósito: es la única tarea
    // irreversible del tick, y no debe correr por delante de las que sí se pueden
    // repetir sin daño.
    await runTask('retention_sweep', tenantSlug, async () => {
      const result = await sweepRetention(db, tenantSlug);
      if (result.anonymized > 0) {
        logEvent({
          level: 'info',
          event: 'retention_sweep',
          tenant: tenantSlug,
          scanned: result.scanned,
          anonymized: result.anonymized,
        });
      }
    });
    // Solicitudes: corre en TODOS los niveles, incluido el 1, que no tiene motor
    // pero sí acumula datos de contacto de cualquiera que rellenó el formulario.
    await runTask('enquiry_retention', tenantSlug, async () => {
      const result = await sweepEnquiries(db);
      if (result.anonymized > 0) {
        logEvent({
          level: 'info',
          event: 'enquiry_retention',
          tenant: tenantSlug,
          anonymized: result.anonymized,
        });
      }
    });
  },
};
