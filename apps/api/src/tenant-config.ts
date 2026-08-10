/**
 * Envoltorio de `@logic-camp/config` (ADR 0012): añade la lectura de D1 que
 * el paquete puro no puede hacer. Sustituye los `TAX_POLICY`/`CANCEL_POLICY`
 * que vivían como constantes hardcodeadas y duplicadas en `public.ts` y
 * `admin.ts` con el comentario "de TenantConfig en Fase 9".
 */
import { loadTenantConfig as loadTenantConfigPure, type TenantConfig } from '@logic-camp/config';
import { schema, type Db } from '@logic-camp/db';

export async function loadTenantConfig(db: Db): Promise<TenantConfig> {
  const row = (await db.select().from(schema.tenants))[0];
  if (!row) throw new Error('TenantConfig ausente: la D1 no contiene una fila tenants');
  return loadTenantConfigPure(row);
}
