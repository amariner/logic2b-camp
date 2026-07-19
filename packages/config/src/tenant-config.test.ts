import { describe, expect, it } from 'vitest';
import { DEFAULT_CANCELLATION_POLICY, loadTenantConfig } from './tenant-config';

const baseRow = {
  slug: 'demo',
  name: 'Camping Cala Sereno',
  tier: 3,
  timezone: 'Europe/Madrid',
  currency: 'EUR',
  locales: ['es', 'en'],
  modules: {},
};

describe('loadTenantConfig', () => {
  it('cae a defaults seguros cuando modules no trae política de tasa/cancelación', () => {
    const config = loadTenantConfig(baseRow);
    expect(config.taxPolicy).toBe('none');
    expect(config.cancellationPolicy).toEqual(DEFAULT_CANCELLATION_POLICY);
  });

  it('respeta la política del tenant cuando es válida', () => {
    const config = loadTenantConfig({
      ...baseRow,
      modules: {
        taxPolicy: 'valencia',
        cancellationPolicy: { tiers: [{ minDaysBefore: 14, refundPct: 80 }] },
      },
    });
    expect(config.taxPolicy).toBe('valencia');
    expect(config.cancellationPolicy.tiers).toEqual([{ minDaysBefore: 14, refundPct: 80 }]);
  });

  it('un valor inválido no lanza: cae al default en vez de romper la petición', () => {
    const config = loadTenantConfig({
      ...baseRow,
      modules: { taxPolicy: 'marte', cancellationPolicy: { tiers: [] } },
    });
    expect(config.taxPolicy).toBe('none');
    expect(config.cancellationPolicy).toEqual(DEFAULT_CANCELLATION_POLICY);
  });

  it('tier fuera de 1-4 cae a 1; locales no-array cae a [es]', () => {
    const config = loadTenantConfig({ ...baseRow, tier: 9, locales: 'es' as unknown });
    expect(config.tier).toBe(1);
    expect(config.locales).toEqual(['es']);
  });
});
