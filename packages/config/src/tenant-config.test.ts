import { describe, expect, it } from 'vitest';
import { DEFAULT_CANCELLATION_POLICY, loadTenantConfig, tenantLegalSchema } from './tenant-config';

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

  it('un valor explícito inválido falla en vez de aplicar una política distinta en silencio', () => {
    expect(() =>
      loadTenantConfig({
        ...baseRow,
        modules: { taxPolicy: 'marte' },
      }),
    ).toThrow('TenantConfig inválida (modules.taxPolicy)');

    expect(() =>
      loadTenantConfig({
        ...baseRow,
        modules: { cancellationPolicy: { tiers: [] } },
      }),
    ).toThrow('TenantConfig inválida (modules.cancellationPolicy)');
  });

  it('rechaza tier y locales inválidos en la fila persistida', () => {
    expect(() => loadTenantConfig({ ...baseRow, tier: 9 })).toThrow('TenantConfig inválida (fila)');
    expect(() => loadTenantConfig({ ...baseRow, locales: 'es' as unknown })).toThrow(
      'TenantConfig inválida (fila)',
    );
  });

  it('rechaza demoThemes mal tipado o repetido', () => {
    expect(() => loadTenantConfig({ ...baseRow, modules: { demoThemes: ['mar', 2] } })).toThrow(
      'TenantConfig inválida (modules.demoThemes)',
    );
    expect(() => loadTenantConfig({ ...baseRow, modules: { demoThemes: ['mar', 'mar'] } })).toThrow(
      'TenantConfig inválida (modules.demoThemes)',
    );
  });
});

describe('tenantLegalSchema', () => {
  const legal = {
    razonSocial: 'Cala Sereno Turisme, S.L.',
    nif: 'B12345678',
    domicilio: 'Partida Cala Sereno s/n, 12500 Castellón',
    registro: 'Inscrita en el Registro Mercantil de Castellón, tomo 1234, folio 56, hoja CS-7890.',
    emailDerechos: 'privacidad@calasereno.example',
  };

  it('acepta el bloque completo', () => {
    expect(tenantLegalSchema.parse(legal)).toEqual(legal);
  });

  it('los datos registrales son opcionales — un empresario individual no los tiene', () => {
    const sinRegistro = { ...legal, registro: undefined };
    expect(tenantLegalSchema.safeParse(sinRegistro).success).toBe(true);
  });

  it('rechaza identidad incompleta: sin ella no se puede publicar el aviso legal', () => {
    for (const campo of ['razonSocial', 'nif', 'domicilio'] as const) {
      expect(tenantLegalSchema.safeParse({ ...legal, [campo]: '' }).success).toBe(false);
    }
  });

  it('rechaza un canal de derechos que no es un correo válido', () => {
    expect(tenantLegalSchema.safeParse({ ...legal, emailDerechos: 'escríbenos' }).success).toBe(
      false,
    );
  });
});
