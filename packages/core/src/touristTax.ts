import type { Occupancy, TouristTaxPolicy } from './types';

/**
 * Políticas de arranque. Las cuantías cambian por normativa: cada tenant puede
 * traer la suya en config; esto son valores por defecto razonables de demo.
 */
export const VALENCIA_TAX: TouristTaxPolicy = {
  perPersonNightCents: 100,
  exemptUnderAge: 16,
  maxNights: 7,
};

export const CATALUNYA_TAX: TouristTaxPolicy = {
  perPersonNightCents: 125,
  exemptUnderAge: 17,
  maxNights: 7,
};

export const NO_TAX: TouristTaxPolicy = { perPersonNightCents: 0, exemptUnderAge: 0, maxNights: null };

export const TAX_POLICIES: Record<string, TouristTaxPolicy> = {
  valencia: VALENCIA_TAX,
  catalunya: CATALUNYA_TAX,
  none: NO_TAX,
};

/**
 * Tasa por persona y noche con exención por edad. Los exentos NO pagan pero SÍ
 * cuentan para capacidad (eso lo valida validateStay). Liquidación aparte del precio.
 */
export function calculateTouristTax(
  occupancy: Occupancy,
  nights: number,
  policy: TouristTaxPolicy,
): number {
  if (nights <= 0 || policy.perPersonNightCents <= 0) return 0;
  const taxablePersons =
    occupancy.adults + occupancy.childrenAges.filter((age) => age >= policy.exemptUnderAge).length;
  const taxableNights = policy.maxNights === null ? nights : Math.min(nights, policy.maxNights);
  return taxablePersons * taxableNights * policy.perPersonNightCents;
}
