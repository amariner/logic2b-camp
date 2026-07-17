/**
 * Registro de puntos de extensión (§3 del super prompt, diseñado en Fase 2).
 * `tenants/{slug}/custom/` se ENGANCHA aquí; nunca modifica el core.
 * Dos familias:
 *  - transformadores: reciben un valor y devuelven el (posiblemente) modificado,
 *    encadenados en orden de registro (beforeAvailabilitySearch, afterAvailabilitySearch,
 *    onQuoteCalculated)
 *  - observadores: efectos del lado del llamante (onEnquiryReceived, onBookingCreated…)
 *  - registros declarativos: rate rules, paneles, rutas, plantillas
 */
import type { AvailabilityResult, Quote, RateRule } from './types';
import type { AvailabilitySearchInput } from './availability';

type MaybePromise<T> = T | Promise<T>;

export type DashboardPanel = { id: string; titleKey: string; icon?: string; order?: number };
export type WebRoute = { path: string; entry: string };
export type EmailTemplate = { id: string; subjectKey: string; entry: string };

export type ExtensionHooks = {
  // observadores
  onEnquiryReceived: (enquiry: unknown) => MaybePromise<void>;
  onBookingCreated: (booking: unknown) => MaybePromise<void>;
  onBookingModified: (booking: unknown) => MaybePromise<void>;
  onBookingCancelled: (booking: unknown) => MaybePromise<void>;
  // transformadores
  beforeAvailabilitySearch: (query: AvailabilitySearchInput) => MaybePromise<AvailabilitySearchInput>;
  afterAvailabilitySearch: (results: AvailabilityResult[]) => MaybePromise<AvailabilityResult[]>;
  onQuoteCalculated: (quote: Quote) => MaybePromise<Quote>;
};

export type ExtensionRegistry = {
  on: <K extends keyof ExtensionHooks>(hook: K, fn: ExtensionHooks[K]) => void;
  /** ejecuta observadores en orden de registro */
  emit: <K extends 'onEnquiryReceived' | 'onBookingCreated' | 'onBookingModified' | 'onBookingCancelled'>(
    hook: K,
    payload: Parameters<ExtensionHooks[K]>[0],
  ) => Promise<void>;
  /** encadena transformadores en orden de registro */
  transform: <K extends 'beforeAvailabilitySearch' | 'afterAvailabilitySearch' | 'onQuoteCalculated'>(
    hook: K,
    value: Parameters<ExtensionHooks[K]>[0],
  ) => Promise<Awaited<ReturnType<ExtensionHooks[K]>>>;
  registerRateRule: (rule: RateRule) => void;
  registerDashboardPanel: (panel: DashboardPanel) => void;
  registerWebRoute: (route: WebRoute) => void;
  registerEmailTemplate: (template: EmailTemplate) => void;
  getRateRules: () => RateRule[];
  getDashboardPanels: () => DashboardPanel[];
  getWebRoutes: () => WebRoute[];
  getEmailTemplates: () => EmailTemplate[];
};

export function createExtensionRegistry(): ExtensionRegistry {
  const handlers = new Map<keyof ExtensionHooks, ExtensionHooks[keyof ExtensionHooks][]>();
  const rateRules: RateRule[] = [];
  const panels: DashboardPanel[] = [];
  const routes: WebRoute[] = [];
  const templates: EmailTemplate[] = [];

  return {
    on(hook, fn) {
      handlers.set(hook, [...(handlers.get(hook) ?? []), fn]);
    },
    async emit(hook, payload) {
      for (const fn of handlers.get(hook) ?? []) {
        await (fn as (p: unknown) => MaybePromise<void>)(payload);
      }
    },
    async transform(hook, value) {
      let current: unknown = value;
      for (const fn of handlers.get(hook) ?? []) {
        current = await (fn as (v: unknown) => MaybePromise<unknown>)(current);
      }
      return current as never;
    },
    registerRateRule: (rule) => void rateRules.push(rule),
    registerDashboardPanel: (panel) => void panels.push(panel),
    registerWebRoute: (route) => void routes.push(route),
    registerEmailTemplate: (template) => void templates.push(template),
    getRateRules: () => [...rateRules],
    getDashboardPanels: () => [...panels].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    getWebRoutes: () => [...routes],
    getEmailTemplates: () => [...templates],
  };
}
