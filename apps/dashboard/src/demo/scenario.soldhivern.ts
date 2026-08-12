import { demoScenarioRequest, resetSoldhivernScenario } from './pinadamar';
import type { PortfolioScenario } from './scenario.types';

export const activePortfolioScenario: PortfolioScenario = {
  id: 'soldhivern',
  userId: 'usr_demo_soldhivern',
  email: 'recepcion@soldhivern.example',
  name: "Recepción Sol d'Hivern",
  webHref: '/demos/soldhivern/',
  bannerKey: 'demo.soldhivernBanner',
  request: demoScenarioRequest,
  reset: resetSoldhivernScenario,
};

export const isPortfolioScenario = true;

export const portfolioScenarioRequest = (path: string, init?: RequestInit) =>
  activePortfolioScenario.request(path, init);

export const resetPortfolioScenario = (): void => activePortfolioScenario.reset();
