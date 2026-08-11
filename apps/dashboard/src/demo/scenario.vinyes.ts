import { demoScenarioRequest, resetVinyesScenario } from './pinadamar';
import type { PortfolioScenario } from './scenario.types';

export const activePortfolioScenario: PortfolioScenario = {
  id: 'vinyes',
  userId: 'usr_demo_vinyes',
  email: 'recepcion@entrevinyes.example',
  name: 'Recepción Entre Vinyes',
  webHref: '/demos/vinyes/',
  bannerKey: 'demo.vinyesBanner',
  request: demoScenarioRequest,
  reset: resetVinyesScenario,
};

export const isPortfolioScenario = true;

export const portfolioScenarioRequest = (path: string, init?: RequestInit) =>
  activePortfolioScenario.request(path, init);

export const resetPortfolioScenario = (): void => activePortfolioScenario.reset();
