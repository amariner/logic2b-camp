import { demoScenarioRequest, resetMardefondoScenario } from './mardefondo';
import type { PortfolioScenario } from './scenario.types';

export const activePortfolioScenario: PortfolioScenario = {
  id: 'mardefondo',
  userId: 'usr_demo_mardefondo',
  email: 'recepcion@mardefondo.example',
  name: 'Recepción Mar de Fondo',
  webHref: '/demos/mardefondo/',
  bannerKey: 'demo.mardefondoBanner',
  request: demoScenarioRequest,
  reset: resetMardefondoScenario,
};

export const isPortfolioScenario = true;

export const portfolioScenarioRequest = (path: string, init?: RequestInit) =>
  activePortfolioScenario.request(path, init);

export const resetPortfolioScenario = (): void => activePortfolioScenario.reset();
