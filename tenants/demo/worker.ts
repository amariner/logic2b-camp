/**
 * Punto de entrada del Worker del tenant `demo` (ADR 0013). Envuelve el
 * Worker genérico de `@logic-camp/api` sin tocarlo — SOLO aquí, dentro de
 * `tenants/demo/`, vive el reset nocturno: ningún camping real (que sigue
 * apuntando `main` a `apps/api/src/index.ts` directamente) carga un byte
 * de este fichero ni de los datos ficticios de Cala Sereno.
 */
import apiWorker, { type Bindings } from '@logic-camp/api';
import { resetDemoData } from './reset';

// distinto del cron de purga de holds cada 15 min (ADR 0007), que sigue igual
const RESET_CRON = '0 3 * * *';

export default {
  fetch: apiWorker.fetch,

  async scheduled(event: ScheduledController, env: Bindings): Promise<void> {
    await apiWorker.scheduled(event, env);
    // doble guarda: el cron correcto Y el tenant correcto, aunque este
    // fichero nunca se referencia desde el wrangler.jsonc de otro tenant.
    if (event.cron === RESET_CRON && env.TENANT_SLUG === 'demo') {
      await resetDemoData(env.DB);
    }
  },
};
