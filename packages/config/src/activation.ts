import { z } from 'zod';
import { tenantHospedajesSchema } from './tenant-config';

export const notificationKinds = [
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

export const paymentsConfigSchema = z
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

export type TenantPaymentsConfig = {
  provider: 'stripe' | 'redsys' | 'none';
  mode: 'none' | 'deposit' | 'full';
  depositPercent?: number;
  redsysMerchantCode?: string;
  redsysTerminal?: string;
  environment?: 'test' | 'production';
};

export type TenantNotificationsConfig = z.infer<typeof notificationsConfigSchema>;

function invalidConfig(area: string, error: z.ZodError): never {
  const detail = error.issues
    .map((issue) => `${issue.path.join('.') || area}: ${issue.message}`)
    .join('; ');
  throw new Error(`TenantConfig inválida (${area}): ${detail}`);
}

export function parsePaymentsConfig(input: unknown): TenantPaymentsConfig {
  if (input === undefined) return { provider: 'none', mode: 'none' };
  const result = paymentsConfigSchema.safeParse(input);
  if (!result.success) invalidConfig('modules.payments', result.error);
  const raw = result.data;
  const mode = raw.mode === 'deposit' && !raw.depositPercent ? 'none' : (raw.mode ?? 'none');
  return { ...raw, provider: raw.provider ?? 'none', mode };
}

export function parseNotificationsConfig(input: unknown): TenantNotificationsConfig {
  if (input === undefined) return {};
  const result = notificationsConfigSchema.safeParse(input);
  if (!result.success) invalidConfig('modules.notifications', result.error);
  return result.data;
}

export const ACTIVATION_SECRET_NAMES = [
  'AUTH_SECRET',
  'LEADS_RESEND_API_KEY',
  'RESEND_API_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'REDSYS_MERCHANT_KEY',
  'SES_HOSPEDAJES_ENDPOINT',
  'SES_HOSPEDAJES_USER',
  'SES_HOSPEDAJES_PASSWORD',
] as const;

export type ActivationSecretName = (typeof ACTIVATION_SECRET_NAMES)[number];
export type ActivationSecretStatus = 'configured' | 'required' | 'blocked' | 'not_required';
export type ActivationComponentStatus = 'configured' | 'blocked' | 'disabled' | 'manual';

const workerConfigSchema = z
  .object({
    name: z.string().min(1),
    vars: z.record(z.string(), z.unknown()),
    routes: z.array(
      z.object({ pattern: z.string().min(1), zone_name: z.string().min(1) }).passthrough(),
    ),
    d1_databases: z.array(
      z
        .object({
          binding: z.string().min(1),
          database_name: z.string().min(1),
          database_id: z.string().min(1),
          migrations_dir: z.string().min(1),
        })
        .passthrough(),
    ),
  })
  .passthrough();

const activationWebConfigSchema = z
  .object({
    slug: z.string().min(1),
    tier: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    domain: z.string().url(),
    isDemo: z.boolean().optional(),
    enquiryTransport: z.enum(['persisted', 'demo', 'demo-session']).optional(),
    bookingTransport: z.enum(['persisted', 'demo-session']).optional(),
    demoManagerPath: z.string().optional(),
    demoThemes: z.array(z.string()).optional(),
    demoTierSwitch: z.boolean().optional(),
  })
  .passthrough();

const activationModulesSchema = z
  .object({
    web: z.boolean(),
    booking: z.enum(['email', 'request', 'instant']),
    dashboard: z.union([z.boolean(), z.enum(['lite', 'full'])]),
    payments: z.unknown().optional(),
    notifications: z.unknown().optional(),
    hospedajes: z.unknown().optional(),
  })
  .passthrough();

export type ActivationWorkerConfig = z.infer<typeof workerConfigSchema>;
export type ActivationWebConfig = z.infer<typeof activationWebConfigSchema>;

export type ActivationAuditInput = {
  identity: { slug: string; domain: string; zone: string };
  webConfig: ActivationWebConfig;
  tenant: {
    tier: 1 | 2 | 3 | 4;
    modules: Record<string, unknown>;
  };
  workerConfig: ActivationWorkerConfig;
  /** Solo nombres. Esta frontera no acepta ni lee valores de secrets. */
  configuredSecretNames: string[];
};

export type ActivationIssue = { code: string; path: string };
export type ActivationBinding = {
  name: 'WORKER' | 'TENANT_SLUG' | 'DB' | 'DOMAIN';
  status: 'configured' | 'blocked';
};
export type ActivationAdapter = {
  name: 'auth' | 'notifications' | 'payments' | 'hospedajes';
  adapter: 'better-auth' | 'disabled' | 'resend' | 'none' | 'stripe' | 'redsys' | 'manual';
  status: ActivationComponentStatus;
};
export type ActivationSecret = { name: ActivationSecretName; status: ActivationSecretStatus };

export type ActivationAuditReport = {
  tenant: { slug: string; tier: 1 | 2 | 3 | 4 };
  bindings: ActivationBinding[];
  adapters: ActivationAdapter[];
  secrets: ActivationSecret[];
  issues: ActivationIssue[];
  /** No contiene valores secretos, flags demo ni tier 4 no autorizado. */
  localSafe: boolean;
  /** Estructura y nombres completos; no equivale a proveedor o destino verificado. */
  contractReady: boolean;
  externalVerification: string[];
};

const DATABASE_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SECRET_KEY_RE = /(?:^|_)(?:SECRET|PASSWORD|API_KEY|MERCHANT_KEY|TOKEN)$/i;
const DEV_FLAGS = new Set(['LOGIC_CAMP_DEV_AUTH', 'LOGIC_CAMP_DEV_ORIGINS']);

function secretValuePaths(value: unknown, prefix: string): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => secretValuePaths(entry, `${prefix}.${index}`));
  }
  if (typeof value !== 'object' || value === null) return [];
  const paths: string[] = [];
  for (const [key, child] of Object.entries(value)) {
    const path = `${prefix}.${key}`;
    if (SECRET_KEY_RE.test(key) || ACTIVATION_SECRET_NAMES.includes(key as ActivationSecretName)) {
      paths.push(path);
    } else {
      paths.push(...secretValuePaths(child, path));
    }
  }
  return paths;
}

function expectedBooking(tier: 1 | 2 | 3 | 4): 'email' | 'request' | 'instant' {
  if (tier === 1) return 'email';
  if (tier === 2) return 'request';
  return 'instant';
}

function expectedDashboard(tier: 1 | 2 | 3 | 4): false | 'lite' | 'full' {
  if (tier === 1) return false;
  if (tier === 2) return 'lite';
  return 'full';
}

export function auditTenantActivation(rawInput: ActivationAuditInput): ActivationAuditReport {
  const workerResult = workerConfigSchema.safeParse(rawInput.workerConfig);
  if (!workerResult.success) invalidConfig('workerConfig', workerResult.error);
  const webResult = activationWebConfigSchema.safeParse(rawInput.webConfig);
  if (!webResult.success) invalidConfig('webConfig', webResult.error);
  const modulesResult = activationModulesSchema.safeParse(rawInput.tenant.modules);
  if (!modulesResult.success) invalidConfig('modules', modulesResult.error);
  const worker = workerResult.data;
  const web = webResult.data;
  const modules = modulesResult.data;

  for (const name of rawInput.configuredSecretNames) {
    if (!/^[A-Z][A-Z0-9_]*$/.test(name)) {
      throw new Error('nombre de secret inválido: use solo el nombre, nunca nombre=valor');
    }
  }
  const configuredNames = new Set(rawInput.configuredSecretNames);
  const requiredNames = new Set<ActivationSecretName>(['AUTH_SECRET']);
  const blockedNames = new Set<ActivationSecretName>();
  const issues: ActivationIssue[] = [];
  const issue = (code: string, path: string): void => {
    if (!issues.some((candidate) => candidate.code === code && candidate.path === path)) {
      issues.push({ code, path });
    }
  };

  const expectedWorkerName = `logic-camp-${rawInput.identity.slug}`;
  const workerOk = worker.name === expectedWorkerName;
  if (!workerOk) issue('worker_name_mismatch', 'workerConfig.name');

  const tenantSlugOk = worker.vars.TENANT_SLUG === rawInput.identity.slug;
  if (!tenantSlugOk) issue('tenant_slug_mismatch', 'workerConfig.vars.TENANT_SLUG');

  if (worker.d1_databases.length !== 1) {
    issue('database_binding_count', 'workerConfig.d1_databases');
  }
  const database = worker.d1_databases.find((candidate) => candidate.binding === 'DB');
  if (!database) issue('database_binding_missing', 'workerConfig.d1_databases');
  const databaseNameOk = database?.database_name === expectedWorkerName;
  if (database && !databaseNameOk) {
    issue('database_name_mismatch', 'workerConfig.d1_databases.DB.database_name');
  }
  const databaseIdOk = database ? DATABASE_ID_RE.test(database.database_id) : false;
  if (database && !databaseIdOk) {
    issue(
      database.database_id.startsWith('__') ? 'database_id_pending' : 'database_id_invalid',
      'workerConfig.d1_databases.DB.database_id',
    );
  }

  const route = worker.routes.find(
    (candidate) =>
      candidate.pattern === `${rawInput.identity.domain}/*` &&
      candidate.zone_name === rawInput.identity.zone,
  );
  const domainOk = route !== undefined;
  if (!domainOk) issue('domain_route_mismatch', 'workerConfig.routes');

  if (web.slug !== rawInput.identity.slug) issue('web_slug_mismatch', 'webConfig.slug');
  if (web.domain !== `https://${rawInput.identity.domain}`) {
    issue('web_domain_mismatch', 'webConfig.domain');
  }
  if (web.tier !== rawInput.tenant.tier) issue('tier_mismatch', 'webConfig.tier');
  if (modules.booking !== expectedBooking(rawInput.tenant.tier)) {
    issue('booking_mode_mismatch', 'tenant.modules.booking');
  }
  if (modules.dashboard !== expectedDashboard(rawInput.tenant.tier)) {
    issue('dashboard_mode_mismatch', 'tenant.modules.dashboard');
  }
  if (rawInput.tenant.tier === 4) issue('tier4_not_authorized', 'tenant.tier');

  const demoConfigured =
    web.isDemo === true ||
    web.enquiryTransport === 'demo' ||
    web.enquiryTransport === 'demo-session' ||
    web.bookingTransport === 'demo-session' ||
    web.demoManagerPath !== undefined ||
    web.demoThemes !== undefined ||
    web.demoTierSwitch === true;
  if (demoConfigured) issue('demo_candidate_not_publishable', 'webConfig');

  for (const key of Object.keys(worker.vars)) {
    if (DEV_FLAGS.has(key)) issue('dev_flag_persisted', `workerConfig.vars.${key}`);
  }
  for (const path of [
    ...secretValuePaths(worker, 'workerConfig'),
    ...secretValuePaths(rawInput.tenant.modules, 'tenant.modules'),
    ...secretValuePaths(web, 'webConfig'),
  ]) {
    issue('secret_value_persisted', path);
  }

  if (!configuredNames.has('AUTH_SECRET')) {
    issue('auth_secret_required', 'secrets.AUTH_SECRET');
  }
  const authConfigured = configuredNames.has('AUTH_SECRET');

  const notifications = parseNotificationsConfig(modules.notifications);
  const notificationsDisabled = notificationKinds.every(
    (kind) => notifications.enabled?.[kind] === false,
  );
  let notificationsAdapter: ActivationAdapter;
  if (notificationsDisabled) {
    notificationsAdapter = { name: 'notifications', adapter: 'disabled', status: 'disabled' };
  } else {
    requiredNames.add('RESEND_API_KEY');
    const hasKey = configuredNames.has('RESEND_API_KEY');
    if (!hasKey) issue('resend_required', 'secrets.RESEND_API_KEY');
    if (!notifications.notifyTo) {
      issue('notification_recipient_required', 'tenant.modules.notifications.notifyTo');
    }
    notificationsAdapter = {
      name: 'notifications',
      adapter: hasKey ? 'resend' : 'disabled',
      status: hasKey && notifications.notifyTo ? 'configured' : 'blocked',
    };
  }

  const payments = parsePaymentsConfig(modules.payments);
  let paymentsAdapter: ActivationAdapter;
  if (payments.mode === 'none') {
    paymentsAdapter = { name: 'payments', adapter: 'none', status: 'disabled' };
  } else if (payments.provider === 'stripe') {
    requiredNames.add('STRIPE_SECRET_KEY');
    requiredNames.add('STRIPE_WEBHOOK_SECRET');
    const configured =
      configuredNames.has('STRIPE_SECRET_KEY') && configuredNames.has('STRIPE_WEBHOOK_SECRET');
    if (!configuredNames.has('STRIPE_SECRET_KEY')) {
      issue('stripe_secret_required', 'secrets.STRIPE_SECRET_KEY');
    }
    if (!configuredNames.has('STRIPE_WEBHOOK_SECRET')) {
      issue('stripe_webhook_secret_required', 'secrets.STRIPE_WEBHOOK_SECRET');
    }
    paymentsAdapter = {
      name: 'payments',
      adapter: 'stripe',
      status: configured ? 'configured' : 'blocked',
    };
  } else {
    requiredNames.add('REDSYS_MERCHANT_KEY');
    const configured =
      configuredNames.has('REDSYS_MERCHANT_KEY') &&
      Boolean(payments.redsysMerchantCode && payments.redsysTerminal);
    if (!configuredNames.has('REDSYS_MERCHANT_KEY')) {
      issue('redsys_secret_required', 'secrets.REDSYS_MERCHANT_KEY');
    }
    if (!payments.redsysMerchantCode || !payments.redsysTerminal) {
      issue('redsys_public_config_required', 'tenant.modules.payments');
    }
    paymentsAdapter = {
      name: 'payments',
      adapter: 'redsys',
      status: configured ? 'configured' : 'blocked',
    };
  }
  if (payments.mode !== 'none' && rawInput.tenant.tier < 3) {
    issue('payments_require_tier3', 'tenant.modules.payments.mode');
    paymentsAdapter.status = 'blocked';
  }

  let hospedajesAdapter: ActivationAdapter = {
    name: 'hospedajes',
    adapter: 'disabled',
    status: 'disabled',
  };
  if (modules.hospedajes !== undefined) {
    const hospedajesResult = tenantHospedajesSchema.safeParse(modules.hospedajes);
    if (!hospedajesResult.success) invalidConfig('modules.hospedajes', hospedajesResult.error);
    if (hospedajesResult.data.enabled) {
      hospedajesAdapter = { name: 'hospedajes', adapter: 'manual', status: 'manual' };
    }
  }
  for (const name of [
    'SES_HOSPEDAJES_ENDPOINT',
    'SES_HOSPEDAJES_USER',
    'SES_HOSPEDAJES_PASSWORD',
  ] as const) {
    if (configuredNames.has(name)) {
      blockedNames.add(name);
      issue('ses_secret_cannot_activate_transport', `secrets.${name}`);
    }
  }

  const secrets: ActivationSecret[] = ACTIVATION_SECRET_NAMES.map((name) => ({
    name,
    status: blockedNames.has(name)
      ? 'blocked'
      : requiredNames.has(name)
        ? configuredNames.has(name)
          ? 'configured'
          : 'required'
        : 'not_required',
  }));

  const bindings: ActivationBinding[] = [
    { name: 'WORKER', status: workerOk ? 'configured' : 'blocked' },
    { name: 'TENANT_SLUG', status: tenantSlugOk ? 'configured' : 'blocked' },
    {
      name: 'DB',
      status:
        database !== undefined && worker.d1_databases.length === 1 && databaseNameOk && databaseIdOk
          ? 'configured'
          : 'blocked',
    },
    { name: 'DOMAIN', status: domainOk ? 'configured' : 'blocked' },
  ];
  const adapters: ActivationAdapter[] = [
    {
      name: 'auth',
      adapter: 'better-auth',
      status: authConfigured ? 'configured' : 'blocked',
    },
    notificationsAdapter,
    paymentsAdapter,
    hospedajesAdapter,
  ];
  const unsafeCodes = new Set([
    'secret_value_persisted',
    'demo_candidate_not_publishable',
    'dev_flag_persisted',
    'tier4_not_authorized',
  ]);
  const localSafe = !issues.some((candidate) => unsafeCodes.has(candidate.code));
  const contractReady =
    issues.length === 0 &&
    bindings.every((binding) => binding.status === 'configured') &&
    adapters.every((adapter) => adapter.status !== 'blocked') &&
    secrets.every((secret) => secret.status !== 'required' && secret.status !== 'blocked');

  const externalVerification = ['database_binding', 'auth_secret_value', 'domain_dns'];
  if (!notificationsDisabled) externalVerification.push('resend_delivery');
  if (payments.mode !== 'none') externalVerification.push(`${payments.provider}_provider`);
  if (hospedajesAdapter.status === 'manual') externalVerification.push('ses_manual_acceptance');

  return {
    tenant: { slug: rawInput.identity.slug, tier: rawInput.tenant.tier },
    bindings,
    adapters,
    secrets,
    issues,
    localSafe,
    contractReady,
    externalVerification,
  };
}
