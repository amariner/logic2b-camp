import { demoScenarioRequest, resetTarongersScenario } from './pinadamar';
import type { PortfolioScenario } from './scenario.types';

export const activePortfolioScenario: PortfolioScenario = {
  id: 'tarongers',
  userId: 'usr_demo_tarongers',
  email: 'recepcion@elstarongers.example',
  name: 'Recepción Els Tarongers',
  webHref: '/demos/tarongers/',
  bannerKey: 'demo.tarongersBanner',
  request: demoScenarioRequest,
  reset: resetTarongersScenario,
};

export const isPortfolioScenario = true;

export const portfolioScenarioRequest = (path: string, init?: RequestInit) =>
  activePortfolioScenario.request(path, init);

export const resetPortfolioScenario = (): void => activePortfolioScenario.reset();
