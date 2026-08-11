import { demoScenarioRequest, resetSerraltaScenario } from './pinadamar';
import type { PortfolioScenario } from './scenario.types';

export const activePortfolioScenario: PortfolioScenario = {
  id: 'serralta',
  userId: 'usr_demo_serralta',
  email: 'recepcion@serralta.example',
  name: 'Recepción Serralta',
  webHref: '/demos/serralta/',
  bannerKey: 'demo.serraltaBanner',
  request: demoScenarioRequest,
  reset: resetSerraltaScenario,
};

export const isPortfolioScenario = true;

export const portfolioScenarioRequest = (path: string, init?: RequestInit) =>
  activePortfolioScenario.request(path, init);

export const resetPortfolioScenario = (): void => activePortfolioScenario.reset();
