import {
  cancellationPolicySchema,
  taxPolicySchema,
  tenantHospedajesSchema,
} from '@logic-camp/config';
import type { PaymentMode } from '@logic-camp/payments';
import type { NotificationsConfig } from '@logic-camp/notifications';
import { z } from 'zod';

const notificationKinds = [
  'enquiry_received',
  'enquiry_autoreply',
  'booking_confirmed',
  'booking_cancelled',
  'booking_pending_stuck',
  'booking_reminder',
  'system_error',
] as const;

export const notificationsConfigSchema = z
  .object({
    enabled: z
      .object(Object.fromEntries(notificationKinds.map((kind) => [kind, z.boolean().optional()])))
      .strict()
      .optional(),
    from: z.string().trim().min(1).max(320).optional(),
    notifyTo: z.string().email().optional(),
  })
  .strict();

const paymentsConfigSchema = z
  .object({
    provider: z.enum(['stripe', 'redsys', 'none']).optional(),
    mode: z.enum(['none', 'deposit', 'full']).optional(),
    depositPercent: z.number().gt(0).max(100).optional(),
    redsysMerchantCode: z.string().trim().min(1).optional(),
    redsysTerminal: z.string().trim().min(1).optional(),
    environment: z.enum(['test', 'production']).optional(),
  })
  .strict()
  .superRefine((config, ctx) => {
    if (
      (config.mode === 'deposit' || config.mode === 'full') &&
      (config.provider ?? 'none') === 'none'
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['provider'],
        message: `no puede ser none cuando mode es ${config.mode}`,
      });
    }
  });

/** Valida las claves conocidas antes de persistir un PATCH de ajustes. */
export const tenantModulesPatchSchema = z
  .object({
    web: z.boolean().optional(),
    booking: z.enum(['email', 'request', 'instant']).optional(),
    dashboard: z.union([z.boolean(), z.enum(['lite', 'full'])]).optional(),
    payments: paymentsConfigSchema.optional(),
    notifications: notificationsConfigSchema.optional(),
    taxPolicy: taxPolicySchema.optional(),
    cancellationPolicy: cancellationPolicySchema.optional(),
    hospedajes: tenantHospedajesSchema.optional(),
    demoThemes: z.array(z.string().trim().min(1)).min(1).optional(),
  })
  .passthrough();

export type TenantPaymentsConfig = {
  provider: 'stripe' | 'redsys' | 'none';
  mode: PaymentMode;
  depositPercent?: number;
  redsysMerchantCode?: string;
  redsysTerminal?: string;
  environment?: 'test' | 'production';
};

function fail(area: string, error: z.ZodError): never {
  const detail = error.issues
    .map((issue) => `${issue.path.join('.') || area}: ${issue.message}`)
    .join('; ');
  throw new Error(`TenantConfig inválida (${area}): ${detail}`);
}

export function tenantModules(input: unknown): Record<string, unknown> {
  const result = z.record(z.string(), z.unknown()).safeParse(input ?? {});
  if (!result.success) fail('modules', result.error);
  return result.data;
}

export function parsePaymentsConfig(input: unknown): TenantPaymentsConfig {
  if (input === undefined) return { provider: 'none', mode: 'none' };
  const result = paymentsConfigSchema.safeParse(input);
  if (!result.success) fail('modules.payments', result.error);
  const raw = result.data;
  // Sin porcentaje no se abre nunca un cobro de 0 €: degradación segura histórica.
  const mode: PaymentMode =
    raw.mode === 'deposit' && !raw.depositPercent ? 'none' : (raw.mode ?? 'none');
  return { ...raw, provider: raw.provider ?? 'none', mode };
}

export function parseNotificationsConfig(input: unknown): NotificationsConfig {
  if (input === undefined) return {};
  const result = notificationsConfigSchema.safeParse(input);
  if (!result.success) fail('modules.notifications', result.error);
  return result.data as NotificationsConfig;
}
