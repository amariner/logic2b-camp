/** Selector único de los escenarios comerciales compilados del gestor. */
import { demoScenarioRequest as mardefondoRequest, resetMardefondoScenario } from './mardefondo';
import { demoScenarioRequest as pinadamarRequest, resetPinadaScenario } from './pinadamar';

export type PortfolioScenarioId = 'pinadamar' | 'mardefondo';

type PortfolioScenario = {
  id: PortfolioScenarioId;
  userId: string;
  email: string;
  name: string;
  webHref: string;
  bannerKey: 'demo.pinadaBanner' | 'demo.mardefondoBanner';
  request: typeof pinadamarRequest;
  reset: () => void;
};

const scenarioId = import.meta.env.VITE_DEMO_SCENARIO as PortfolioScenarioId | undefined;

export const activePortfolioScenario: PortfolioScenario | null =
  scenarioId === 'pinadamar'
    ? {
        id: 'pinadamar',
        userId: 'usr_demo_pinadamar',
        email: 'recepcion@pinadamar.example',
        name: 'Recepción Pinada del Mar',
        webHref: '/demos/pinadamar/',
        bannerKey: 'demo.pinadaBanner',
        request: pinadamarRequest,
        reset: resetPinadaScenario,
      }
    : scenarioId === 'mardefondo'
      ? {
          id: 'mardefondo',
          userId: 'usr_demo_mardefondo',
          email: 'recepcion@mardefondo.example',
          name: 'Recepción Mar de Fondo',
          webHref: '/demos/mardefondo/',
          bannerKey: 'demo.mardefondoBanner',
          request: mardefondoRequest,
          reset: resetMardefondoScenario,
        }
      : null;

export const isPortfolioScenario = activePortfolioScenario !== null;

export async function portfolioScenarioRequest(path: string, init?: RequestInit) {
  if (!activePortfolioScenario) throw new Error('portfolio_scenario_not_active');
  return activePortfolioScenario.request(path, init);
}

export function resetPortfolioScenario(): void {
  activePortfolioScenario?.reset();
}
