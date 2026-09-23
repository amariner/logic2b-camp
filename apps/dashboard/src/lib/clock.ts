import { isPortfolioScenario } from '@demo-scenario';

/** El reloj del negocio; nunca sustituye Date global ni el reloj de un camping real. */
export const DEMO_NOW = '2026-08-07T12:00:00.000Z';
export const DEMO_SEASON = { from: '2026-06-01', to: '2026-09-01' } as const;
export const businessNow = (): Date => new Date(isPortfolioScenario ? DEMO_NOW : Date.now());
