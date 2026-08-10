import { describe, expect, it } from 'vitest';
import { t } from '../i18n';

describe('frontera fiscal del gestor', () => {
  it('nombra importes de reservas y cobros sin afirmar que existe una factura', () => {
    const textos = [
      t('ini.kpi.pendienteDetalle', { total: '1.200,00 €' }),
      t('inf.valorReservas'),
      t('inf.cobradoReservas'),
    ];

    expect(textos).toEqual([
      'de 1.200,00 € en reservas con llegada este mes',
      'Valor de reservas (por llegada)',
      'Cobrado en esas reservas',
    ]);
    expect(textos.join(' ')).not.toMatch(/factur/i);
  });
});
