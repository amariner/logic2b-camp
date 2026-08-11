import { demoScenarioRequest, resetCarrascaScenario } from './pinadamar';
import type { PortfolioScenario } from './scenario.types';

export const activePortfolioScenario: PortfolioScenario = {
  id: 'carrasca',
  userId: 'usr_demo_carrasca',
  email: 'recepcion@lacarrasca.example',
  name: 'Recepción La Carrasca',
  webHref: '/demos/carrasca/',
  bannerKey: 'demo.carrascaBanner',
  request: demoScenarioRequest,
  reset: resetCarrascaScenario,
};

export const isPortfolioScenario = true;

export const portfolioScenarioRequest = (path: string, init?: RequestInit) =>
  activePortfolioScenario.request(path, init);

export const resetPortfolioScenario = (): void => activePortfolioScenario.reset();
