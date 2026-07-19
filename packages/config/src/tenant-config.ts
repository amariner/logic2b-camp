/**
 * TenantConfig (ADR 0012 §1): el superconjunto que lee `apps/api` en
 * request time desde `tenants.modules`. Consolida lo que hoy vive como
 * constantes duplicadas con el comentario "de TenantConfig en Fase 9"
 * (política de tasa turística y de cancelación, repetidas en
 * `public.ts` y `admin.ts`).
 *
 * `payments`/`notifications` se quedan sin tipar fuerte aquí a propósito:
 * `apps/api/src/payments.ts` y `notify.ts` ya validan y normalizan esas
 * dos claves con más matices (secrets del Worker, defaults por modo) de
 * los que le corresponde duplicar a este paquete — lo suyo es la política
 * de tasa/cancelación, que hasta ahora no tenía dueño.
 *
 * Distinto de `TenantWebConfig` (arriba en este paquete): ese es el
 * subconjunto que `apps/web` necesita en BUILD time y nunca toca D1.
 */
import { z } from 'zod';

export const taxPolicySchema = z.enum(['valencia', 'catalunya', 'none']);
export type TaxPolicyName = z.infer<typeof taxPolicySchema>;

export const cancellationPolicySchema = z.object({
  tiers: z
    .array(
      z.object({
        minDaysBefore: z.number().int().min(0),
        refundPct: z.number().min(0).max(100),
      }),
    )
    .min(1),
});
export type CancellationPolicyConfig = z.infer<typeof cancellationPolicySchema>;

/** Política por defecto hasta que el tenant fije la suya (misma que hoy en public.ts/admin.ts). */
export const DEFAULT_CANCELLATION_POLICY: CancellationPolicyConfig = {
  tiers: [
    { minDaysBefore: 30, refundPct: 100 },
    { minDaysBefore: 7, refundPct: 50 },
    { minDaysBefore: 0, refundPct: 0 },
  ],
};

export type TenantConfig = {
  slug: string;
  name: string;
  tier: 1 | 2 | 3 | 4;
  timezone: string;
  currency: string;
  locales: string[];
  taxPolicy: TaxPolicyName;
  cancellationPolicy: CancellationPolicyConfig;
  /** ADR 0009: solo demo comercial */
  demoThemes?: string[];
};

type TenantRow = {
  slug: string;
  name: string;
  tier: number;
  timezone: string;
  currency: string;
  locales: unknown;
  modules: Record<string, unknown> | null | undefined;
};

/** Valida y aplica defaults — nunca lanza: un módulo mal configurado cae a su default seguro. */
export function loadTenantConfig(row: TenantRow): TenantConfig {
  const modules = row.modules ?? {};
  const taxPolicy = taxPolicySchema.safeParse(modules.taxPolicy);
  const cancellationPolicy = cancellationPolicySchema.safeParse(modules.cancellationPolicy);

  return {
    slug: row.slug,
    name: row.name,
    tier: row.tier >= 1 && row.tier <= 4 ? (row.tier as 1 | 2 | 3 | 4) : 1,
    timezone: row.timezone,
    currency: row.currency,
    locales: Array.isArray(row.locales) ? (row.locales as string[]) : ['es'],
    taxPolicy: taxPolicy.success ? taxPolicy.data : 'none',
    cancellationPolicy: cancellationPolicy.success ? cancellationPolicy.data : DEFAULT_CANCELLATION_POLICY,
    demoThemes: Array.isArray(modules.demoThemes) ? (modules.demoThemes as string[]) : undefined,
  };
}
