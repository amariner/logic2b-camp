/**
 * Exceso informativo después de re-cotizar una estancia. El valor nunca implica
 * un reembolso: esa sigue siendo una acción explícita y auditada de la ficha.
 */
export const overpaymentCents = (paidCents: number, totalCents: number) =>
  Math.max(0, paidCents - totalCents);
