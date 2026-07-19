import { createDb, schema } from '@logic-camp/db';
import { lt } from 'drizzle-orm';
import { app } from './app';
import { notifyStuckPendingBookings } from './notify';
import type { Bindings } from './tenant';

export type { AppType } from './app';
export type { Bindings } from './tenant';
export { createApiClient, type ApiClient } from './client';

export default {
  fetch: app.fetch,

  // Cron (ADR 0007 + ADR 0014): purga de holds caducados (la expiración
  // perezosa ya los ignora en las queries; esto solo limpia filas muertas) +
  // aviso de reservas web `pending` colgadas sin pagar ni cancelar.
  async scheduled(_event: ScheduledController, env: Bindings): Promise<void> {
    const db = createDb(env.DB);
    await db
      .delete(schema.inventoryHolds)
      .where(lt(schema.inventoryHolds.expiresAt, new Date().toISOString()));
    await notifyStuckPendingBookings(db, env.TENANT_SLUG ?? 'unknown', env.RESEND_API_KEY);
  },
};
