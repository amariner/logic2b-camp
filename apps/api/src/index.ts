import { createDb, schema } from '@logic-camp/db';
import { lt } from 'drizzle-orm';
import { app } from './app';
import type { Bindings } from './tenant';

export type { AppType } from './app';
export { createApiClient, type ApiClient } from './client';

export default {
  fetch: app.fetch,

  // Cron (ADR 0007): purga de holds caducados. La expiración perezosa ya los
  // ignora en las queries; esto solo limpia filas muertas.
  async scheduled(_event: ScheduledController, env: Bindings): Promise<void> {
    const db = createDb(env.DB);
    await db
      .delete(schema.inventoryHolds)
      .where(lt(schema.inventoryHolds.expiresAt, new Date().toISOString()));
  },
};
