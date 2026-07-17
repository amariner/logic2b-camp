import { daysUntil } from './dates';
import type { CancellationPolicy, CancellationRefund, IsoDate } from './types';

/**
 * Reembolso de cancelación por tramos: aplica el tramo de mayor minDaysBefore
 * que sea ≤ a la antelación real. Se calcula sobre lo PAGADO; la fianza no es
 * ingreso y va aparte. Redondeo hacia abajo (nunca se devuelve de más).
 */
export function calculateCancellationRefund(
  booking: { dateFrom: IsoDate; paidCents: number },
  policy: CancellationPolicy,
  today: IsoDate,
): CancellationRefund {
  const daysBefore = Math.max(0, daysUntil(today, booking.dateFrom));
  const tier = [...policy.tiers]
    .sort((a, b) => b.minDaysBefore - a.minDaysBefore)
    .find((t) => t.minDaysBefore <= daysBefore);
  const pct = tier?.refundPct ?? 0;
  const refundCents = Math.floor((booking.paidCents * pct) / 100);
  return {
    refundCents,
    retainedCents: booking.paidCents - refundCents,
    daysBefore,
    appliedRefundPct: pct,
  };
}
