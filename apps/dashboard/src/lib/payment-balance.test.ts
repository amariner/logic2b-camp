import { describe, expect, it } from 'vitest';
import { overpaymentCents } from './payment-balance';

describe('overpaymentCents', () => {
  it('devuelve el exceso cuando lo cobrado supera el total nuevo', () => {
    expect(overpaymentCents(12500, 5500)).toBe(7000);
  });

  it('no fabrica un pendiente negativo si falta cobrar o queda saldado', () => {
    expect(overpaymentCents(3000, 5500)).toBe(0);
    expect(overpaymentCents(5500, 5500)).toBe(0);
  });
});
