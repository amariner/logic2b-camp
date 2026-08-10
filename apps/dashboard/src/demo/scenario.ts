/** Implementación productiva: no importa fixtures ni ofrece sesión/reset local. */
import type { PortfolioScenario, ScenarioResult } from './scenario.types';

export const activePortfolioScenario: PortfolioScenario | null = null;
export const isPortfolioScenario = false;

export const portfolioScenarioRequest: (
  path: string,
  init?: RequestInit,
) => Promise<ScenarioResult> = async () => {
  throw new Error('portfolio_scenario_not_active');
};

export function resetPortfolioScenario(): void {
  // No-op deliberado: el bundle productivo no tiene ningún estado demo que borrar.
}
