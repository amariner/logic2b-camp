import { CAMP_TOUR_ID } from './definition';

export type TourAnalyticsEvent =
  | 'tour_start'
  | 'tour_step_complete'
  | 'tour_pause'
  | 'tour_resume'
  | 'tour_complete'
  | 'tour_exit'
  | 'tour_cta';

type AnalyticsWindow = Window & {
  l2bTrackEvent?: (event: string, attributes: Record<string, string | boolean>) => void;
  dataLayer?: Record<string, unknown>[];
};

export function trackTourEvent(event: TourAnalyticsEvent, stepIndex: number): void {
  try {
    const raw = localStorage.getItem('l2b-consent');
    const consent = raw ? (JSON.parse(raw) as { version?: unknown; analytics?: unknown }) : null;
    if (consent?.version !== '1.0.0' || consent.analytics !== true) return;
  } catch {
    return;
  }

  const attributes = {
    tour_id: CAMP_TOUR_ID,
    step_index: String(stepIndex + 1),
  };
  const target = window as AnalyticsWindow;
  if (target.l2bTrackEvent) {
    target.l2bTrackEvent(event, attributes);
    return;
  }
  target.dataLayer = target.dataLayer ?? [];
  target.dataLayer.push({ event, ...attributes });
}
