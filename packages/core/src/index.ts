/**
 * @logic-camp/core — motor de disponibilidad y precios.
 * PURO: recibe datos, devuelve resultados. Sin I/O, sin Drizzle, sin framework.
 */
export * from './types';
export { addDays, daysUntil, eachNight, isValidIso, nightsBetween, rangesOverlap, weekday } from './dates';
export { seasonForNight, segmentStay, type SeasonSegment } from './seasons';
export { searchAvailability, type AvailabilitySearchInput } from './availability';
export { applyRules, ClosedError, MissingRatePlanError, quote, type ApplyRulesContext, type QuoteInput } from './pricing';
export { validateStay, type ValidateStayInput } from './validate';
export { assignUnit, type AssignUnitInput } from './assign';
export { calculateTouristTax, CATALUNYA_TAX, NO_TAX, TAX_POLICIES, VALENCIA_TAX } from './touristTax';
export { calculateCancellationRefund } from './cancellation';
export {
  createExtensionRegistry,
  type DashboardPanel,
  type EmailTemplate,
  type ExtensionHooks,
  type ExtensionRegistry,
  type WebRoute,
} from './extensions';
