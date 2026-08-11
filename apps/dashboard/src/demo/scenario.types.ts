export type PortfolioScenarioId = 'pinadamar' | 'serralta' | 'mardefondo';

export type ScenarioResult = { status: number; body: unknown };

export type PortfolioScenario = {
  id: PortfolioScenarioId;
  userId: string;
  email: string;
  name: string;
  webHref: string;
  bannerKey: 'demo.pinadaBanner' | 'demo.serraltaBanner' | 'demo.mardefondoBanner';
  request: (path: string, init?: RequestInit) => Promise<ScenarioResult>;
  reset: () => void;
};
