import { describe, expect, it } from 'vitest';
import { computeChargeAmount } from './modes';

describe('computeChargeAmount', () => {
  it('none nunca cobra nada', () => {
    expect(computeChargeAmount('none', 100_000)).toBe(0);
    expect(computeChargeAmount('none', 100_000, 30)).toBe(0);
  });

  it('full cobra el total exacto', () => {
    expect(computeChargeAmount('full', 123_456)).toBe(123_456);
  });

  it('deposit redondea el porcentaje del total', () => {
    expect(computeChargeAmount('deposit', 10_000, 30)).toBe(3_000);
    // 33.33% de 10000 = 3333.33... -> redondeo estándar
    expect(computeChargeAmount('deposit', 10_000, 33.33)).toBe(3_333);
  });

  it('deposit sin porcentaje configurado no cobra nada (config incompleta, no un fallo)', () => {
    expect(computeChargeAmount('deposit', 10_000)).toBe(0);
  });
});
