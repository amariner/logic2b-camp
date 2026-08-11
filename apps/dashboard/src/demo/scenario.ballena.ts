import { demoScenarioRequest, resetBallenaScenario } from './pinadamar';
import type { PortfolioScenario } from './scenario.types';

export const activePortfolioScenario: PortfolioScenario = {
  id: 'ballena',
  userId: 'usr_demo_ballena',
  email: 'recepcion@laballena.example',
  name: 'Recepción La Ballena',
  webHref: '/demos/ballena/',
  bannerKey: 'demo.ballenaBanner',
  request: demoScenarioRequest,
  reset: resetBallenaScenario,
};

export const isPortfolioScenario = true;

export const portfolioScenarioRequest = (path: string, init?: RequestInit) =>
  activePortfolioScenario.request(path, init);

export const resetPortfolioScenario = (): void => activePortfolioScenario.reset();
