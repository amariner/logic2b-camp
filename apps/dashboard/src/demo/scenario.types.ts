export type PortfolioScenarioId =
  | 'pinadamar'
  | 'serralta'
  | 'vinyes'
  | 'tarongers'
  | 'carrasca'
  | 'ballena'
  | 'soldhivern'
  | 'mardefondo';

export type ScenarioResult = { status: number; body: unknown };

export type PortfolioScenario = {
  id: PortfolioScenarioId;
  userId: string;
  email: string;
  name: string;
  webHref: string;
  bannerKey:
    | 'demo.pinadaBanner'
    | 'demo.serraltaBanner'
    | 'demo.vinyesBanner'
    | 'demo.tarongersBanner'
    | 'demo.carrascaBanner'
    | 'demo.ballenaBanner'
    | 'demo.soldhivernBanner'
    | 'demo.mardefondoBanner';
  request: (path: string, init?: RequestInit) => Promise<ScenarioResult>;
  reset: () => void;
};
