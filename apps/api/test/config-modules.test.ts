import { describe, expect, it } from 'vitest';
import {
  parseNotificationsConfig,
  parsePaymentsConfig,
  tenantModulesPatchSchema,
} from '../src/config-modules';

describe('config de módulos', () => {
  it('mantiene defaults seguros solo cuando el módulo está ausente', () => {
    expect(parsePaymentsConfig(undefined)).toEqual({ provider: 'none', mode: 'none' });
    expect(parseNotificationsConfig(undefined)).toEqual({});
  });

  it('deposit sin porcentaje cae a none y nunca abre un cobro de cero', () => {
    expect(parsePaymentsConfig({ provider: 'redsys', mode: 'deposit' })).toMatchObject({
      provider: 'redsys',
      mode: 'none',
    });
  });

  it('rechaza proveedor, porcentaje y modo incoherentes', () => {
    expect(() => parsePaymentsConfig({ provider: 'inventado', mode: 'full' })).toThrow(
      'TenantConfig inválida (modules.payments)',
    );
    expect(() =>
      parsePaymentsConfig({ provider: 'stripe', mode: 'deposit', depositPercent: 150 }),
    ).toThrow('TenantConfig inválida (modules.payments)');
    expect(() => parsePaymentsConfig({ provider: 'none', mode: 'full' })).toThrow(
      'provider: no puede ser none cuando mode es full',
    );
    expect(() => parsePaymentsConfig({ mode: 'full' })).toThrow(
      'provider: no puede ser none cuando mode es full',
    );
  });

  it('rechaza destinatarios y flags de notificación mal tipados', () => {
    expect(() => parseNotificationsConfig({ notifyTo: 'no-es-email' })).toThrow(
      'TenantConfig inválida (modules.notifications)',
    );
    expect(() => parseNotificationsConfig({ enabled: { booking_confirmed: 'sí' } })).toThrow(
      'TenantConfig inválida (modules.notifications)',
    );
  });

  it('el PATCH de ajustes valida las claves conocidas sin borrar extensiones', () => {
    expect(
      tenantModulesPatchSchema.parse({
        booking: 'instant',
        notifications: { enabled: { booking_confirmed: false } },
        customFutureModule: { enabled: true },
      }),
    ).toHaveProperty('customFutureModule');
    expect(
      tenantModulesPatchSchema.safeParse({ payments: { provider: 'none', mode: 'full' } }).success,
    ).toBe(false);
  });
});
