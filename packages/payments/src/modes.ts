import type { PaymentMode } from './types';

/**
 * Cuánto se cobra AL CREAR la reserva web según el modo (ADR 0011 §2).
 * `bond` (fianza vía pasarela) queda fuera de v1 — ver BACKLOG.
 */
export function computeChargeAmount(
  mode: PaymentMode,
  totalCents: number,
  depositPercent?: number,
): number {
  switch (mode) {
    case 'none':
      return 0;
    case 'full':
      return totalCents;
    case 'deposit':
      return Math.round((totalCents * (depositPercent ?? 0)) / 100);
  }
}
