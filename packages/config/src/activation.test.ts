import { describe, expect, it } from 'vitest';
import {
  ACTIVATION_SECRET_NAMES,
  auditTenantActivation,
  type ActivationAuditInput,
} from './activation';

const notificationKinds = [
  'enquiry_received',
  'enquiry_autoreply',
  'booking_confirmed',
  'booking_cancelled',
  'booking_pending_stuck',
  'booking_reminder',
  'system_error',
] as const;

const baseInput = (): ActivationAuditInput => ({
  identity: {
    slug: 'camping-local',
    domain: 'reservas.camping-local.example',
    zone: 'camping-local.example',
  },
  webConfig: {
    slug: 'camping-local',
    name: 'Camping Local',
    tier: 1,
    locales: ['es'],
    defaultLocale: 'es',
    domain: 'https://reservas.camping-local.example',
    contact: {
      email: 'hola@camping-local.example',
      phone: '+34 964 000 000',
      address: 'Camí Local, 1',
    },
    legal: {
      razonSocial: 'Camping Local SL',
      nif: 'B12000000',
      domicilio: 'Camí Local, 1, Castelló',
      emailDerechos: 'privacidad@camping-local.example',
    },
  },
  tenant: {
    tier: 1,
    modules: {
      web: true,
      booking: 'email',
      dashboard: false,
      payments: { provider: 'none', mode: 'none' },
      notifications: { notifyTo: 'reservas@camping-local.example' },
      taxPolicy: 'none',
    },
  },
  workerConfig: {
    name: 'logic-camp-camping-local',
    vars: { TENANT_SLUG: 'camping-local' },
    routes: [
      {
        pattern: 'reservas.camping-local.example/*',
        zone_name: 'camping-local.example',
      },
    ],
    d1_databases: [
      {
        binding: 'DB',
        database_name: 'logic-camp-camping-local',
        database_id: '__TODO_DATABASE_ID__',
        migrations_dir: '../../packages/db/migrations',
      },
    ],
  },
  configuredSecretNames: [],
});

const byName = <T extends { name: string }>(rows: T[], name: string): T => {
  const row = rows.find((candidate) => candidate.name === name);
  if (!row) throw new Error(`No existe ${name}`);
  return row;
};

describe('auditoría de activación de tenant', () => {
  it('expone blockers por nombre y mantiene pagos realmente en none', () => {
    const report = auditTenantActivation(baseInput());

    expect(report.localSafe).toBe(true);
    expect(report.contractReady).toBe(false);
    expect(byName(report.bindings, 'DB')).toMatchObject({ status: 'blocked' });
    expect(byName(report.adapters, 'payments')).toMatchObject({
      adapter: 'none',
      status: 'disabled',
    });
    expect(byName(report.adapters, 'notifications')).toMatchObject({
      adapter: 'disabled',
      status: 'blocked',
    });
    expect(byName(report.secrets, 'AUTH_SECRET').status).toBe('required');
    expect(byName(report.secrets, 'RESEND_API_KEY').status).toBe('required');
    expect(byName(report.secrets, 'STRIPE_SECRET_KEY').status).toBe('not_required');
    expect(report.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['database_id_pending', 'auth_secret_required', 'resend_required']),
    );
  });

  it('declara el contrato completo por nombres sin afirmar proveedor verificado', () => {
    const input = baseInput();
    input.workerConfig.d1_databases[0]!.database_id = '00000000-0000-4000-8000-000000000129';
    input.configuredSecretNames = ['AUTH_SECRET', 'RESEND_API_KEY'];

    const report = auditTenantActivation(input);

    expect(report.contractReady).toBe(true);
    expect(report.externalVerification).toEqual(
      expect.arrayContaining(['database_binding', 'auth_secret_value', 'resend_delivery']),
    );
    expect(byName(report.adapters, 'auth').status).toBe('configured');
    expect(byName(report.adapters, 'notifications')).toMatchObject({
      adapter: 'resend',
      status: 'configured',
    });
  });

  it('falla cerrado ante identidad, binding o base incoherentes', () => {
    const input = baseInput();
    input.workerConfig.name = 'logic-camp-otro';
    input.workerConfig.vars.TENANT_SLUG = 'otro';
    input.workerConfig.d1_databases[0]!.database_name = 'logic-camp-otro';

    const report = auditTenantActivation(input);
    expect(report.contractReady).toBe(false);
    expect(report.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        'worker_name_mismatch',
        'tenant_slug_mismatch',
        'database_name_mismatch',
      ]),
    );
  });

  it('nunca devuelve un valor secreto aunque esté persistido por error', () => {
    const input = baseInput();
    input.workerConfig.vars.AUTH_SECRET = 'valor-super-secreto-que-no-debe-salir';

    const report = auditTenantActivation(input);
    const serialized = JSON.stringify(report);
    expect(report.localSafe).toBe(false);
    expect(report.issues).toContainEqual({
      code: 'secret_value_persisted',
      path: 'workerConfig.vars.AUTH_SECRET',
    });
    expect(serialized).not.toContain('valor-super-secreto');
  });

  it('bloquea proveedor activo sin sus nombres de secret y no confunde mode none', () => {
    const active = baseInput();
    active.tenant.tier = 3;
    active.webConfig.tier = 3;
    active.tenant.modules.booking = 'instant';
    active.tenant.modules.dashboard = 'full';
    active.tenant.modules.payments = { provider: 'stripe', mode: 'full' };
    const activeReport = auditTenantActivation(active);
    expect(byName(activeReport.adapters, 'payments')).toMatchObject({
      adapter: 'stripe',
      status: 'blocked',
    });
    expect(byName(activeReport.secrets, 'STRIPE_SECRET_KEY').status).toBe('required');
    expect(byName(activeReport.secrets, 'STRIPE_WEBHOOK_SECRET').status).toBe('required');

    const none = baseInput();
    none.tenant.modules.payments = { provider: 'stripe', mode: 'none' };
    expect(byName(auditTenantActivation(none).adapters, 'payments')).toMatchObject({
      adapter: 'none',
      status: 'disabled',
    });
  });

  it('rechaza flags demo persistidos y permite desactivar todo el correo sin key', () => {
    const demo = baseInput();
    demo.webConfig.isDemo = true;
    demo.workerConfig.vars.LOGIC_CAMP_DEV_AUTH = '1';
    const demoReport = auditTenantActivation(demo);
    expect(demoReport.localSafe).toBe(false);
    expect(demoReport.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['demo_candidate_not_publishable', 'dev_flag_persisted']),
    );

    const disabled = baseInput();
    disabled.tenant.modules.notifications = {
      notifyTo: 'reservas@camping-local.example',
      enabled: Object.fromEntries(notificationKinds.map((kind) => [kind, false])),
    };
    const disabledReport = auditTenantActivation(disabled);
    expect(byName(disabledReport.adapters, 'notifications')).toMatchObject({
      adapter: 'disabled',
      status: 'disabled',
    });
    expect(byName(disabledReport.secrets, 'RESEND_API_KEY').status).toBe('not_required');
  });

  it('valida nombres sin aceptar pares nombre=valor ni repetir la lista contractual', () => {
    const input = baseInput();
    input.configuredSecretNames = ['AUTH_SECRET=valor'];
    expect(() => auditTenantActivation(input)).toThrow('nombre de secret inválido');
    expect(ACTIVATION_SECRET_NAMES).toContain('AUTH_SECRET');
    expect(ACTIVATION_SECRET_NAMES).toContain('LEADS_RESEND_API_KEY');
    expect(ACTIVATION_SECRET_NAMES).toContain('REDSYS_MERCHANT_KEY');
  });
});
