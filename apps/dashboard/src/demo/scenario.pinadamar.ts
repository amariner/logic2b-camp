import { demoScenarioRequest, resetPinadaScenario } from './pinadamar';
import type { PortfolioScenario } from './scenario.types';

export const activePortfolioScenario: PortfolioScenario = {
  id: 'pinadamar',
  userId: 'usr_demo_pinadamar',
  email: 'recepcion@pinadamar.example',
  name: 'Recepción Pinada del Mar',
  webHref: '/demos/pinadamar/',
  bannerKey: 'demo.pinadaBanner',
  request: demoScenarioRequest,
  reset: resetPinadaScenario,
};

export const isPortfolioScenario = true;

export const portfolioScenarioRequest = (path: string, init?: RequestInit) =>
  activePortfolioScenario.request(path, init);

export const resetPortfolioScenario = (): void => activePortfolioScenario.reset();
