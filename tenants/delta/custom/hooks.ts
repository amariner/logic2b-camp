/**
 * Puntos de extensión del camping (§3 del super prompt, registro en
 * `packages/core/src/extensions.ts`). `custom/` se ENGANCHA aquí, nunca
 * modifica el core — si lo que necesitas no cabe en un hook de abajo, es
 * que falta un punto de extensión: pídelo, no lo fuerces con un parche.
 *
 * ADR 0012 §3: este fichero está DISEÑADO pero `apps/api` todavía no lo
 * carga (nadie ha necesitado un `custom/` real todavía). Cuando el primer
 * camping lo necesite, esa sesión conecta el alias de build + las llamadas
 * a `transform()`/`emit()` — este fichero ya tiene la forma que se espera.
 *
 * Vacío = comportamiento idéntico al core. No borres las funciones sin usar:
 * son la lista completa de lo que HOY se puede enganchar.
 */
import type { ExtensionRegistry } from '@logic-camp/core';

export function register(ext: ExtensionRegistry): void {
  // ext.on('onEnquiryReceived', async (enquiry) => { ... });
  // ext.on('onBookingCreated', async (booking) => { ... });
  // ext.on('onBookingModified', async (booking) => { ... });
  // ext.on('onBookingCancelled', async (booking) => { ... });
  // ext.on('beforeAvailabilitySearch', async (query) => query);
  // ext.on('afterAvailabilitySearch', async (results) => results);
  // ext.on('onQuoteCalculated', async (quote) => quote);
  // ext.registerRateRule({ ... });
  // ext.registerDashboardPanel({ id: '...', titleKey: '...' });
  // ext.registerWebRoute({ path: '/...', entry: '...' });
  // ext.registerEmailTemplate({ id: '...', subjectKey: '...', entry: '...' });
  void ext;
}
