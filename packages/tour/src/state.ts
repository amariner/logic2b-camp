export const TOUR_STATUSES = ['idle', 'intro', 'active', 'paused', 'complete'] as const;

export type TourStatus = (typeof TOUR_STATUSES)[number];
export type TourState = { status: TourStatus; stepIndex: number };
export type TourAction =
  | { type: 'open' }
  | { type: 'start' }
  | { type: 'next' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'complete' }
  | { type: 'exit' }
  | { type: 'reset' };

export const initialTourState: TourState = { status: 'idle', stepIndex: 0 };

export function normalizeTourState(value: unknown, stepCount: number): TourState {
  if (!value || typeof value !== 'object' || stepCount < 1) return initialTourState;
  const candidate = value as Partial<TourState>;
  if (!TOUR_STATUSES.includes(candidate.status as TourStatus)) return initialTourState;
  if (typeof candidate.stepIndex !== 'number' || !Number.isFinite(candidate.stepIndex)) {
    return initialTourState;
  }
  return {
    status: candidate.status as TourStatus,
    stepIndex: Math.max(0, Math.min(stepCount - 1, Math.floor(candidate.stepIndex))),
  };
}

export function transitionTour(state: TourState, action: TourAction, stepCount: number): TourState {
  if (stepCount < 1) return initialTourState;
  switch (action.type) {
    case 'open':
      return { status: 'intro', stepIndex: 0 };
    case 'start':
      return { status: 'active', stepIndex: 0 };
    case 'next':
      if (state.status !== 'active') return state;
      if (state.stepIndex >= stepCount - 1) {
        return { status: 'complete', stepIndex: stepCount - 1 };
      }
      return { status: 'active', stepIndex: state.stepIndex + 1 };
    case 'pause':
      return state.status === 'active' ? { ...state, status: 'paused' } : state;
    case 'resume':
      return state.status === 'paused' ? { ...state, status: 'active' } : state;
    case 'complete':
      return { status: 'complete', stepIndex: stepCount - 1 };
    case 'exit':
    case 'reset':
      return initialTourState;
  }
}
