/**
 * Visión local reversible «Control total» (ADR 0048).
 *
 * Este módulo es deliberadamente puro: fixture + parser + reducer. No conoce
 * API, usuarios, proveedores ni base de datos. Las pantallas solo persisten su
 * resultado en localStorage para que una conversación comercial sobreviva a
 * una recarga y pueda restablecerse por completo.
 */
export const CONTROL_TOTAL_STATE_KEY = 'logic2b-demo:mardefondo:control-total:v1';
export const CONTROL_TOTAL_RESET_EVENT = 'logic2b-demo:control-total-reset';

export const controlTotalModuleKeys = [
  'centro',
  'limpieza',
  'mantenimiento',
  'equipo',
  'huesped',
  'reservas-grupos',
  'ingresos',
  'inteligencia',
] as const;

export type ControlTotalModuleKey = (typeof controlTotalModuleKeys)[number];

/**
 * Mantiene el contrato de rutas de la visión en un módulo puro y probado.
 * Un enlace antiguo o manipulado vuelve al Centro en vez de dejar que la UI
 * propague un segmento desconocido.
 */
export function parseControlTotalModuleKey(raw: string | undefined): ControlTotalModuleKey {
  return controlTotalModuleKeys.includes(raw as ControlTotalModuleKey)
    ? (raw as ControlTotalModuleKey)
    : 'centro';
}

export const controlTotalFixture = {
  date: '2026-08-07',
  tenant: 'Mar de Fondo',
  units: 300,
  pulse: {
    occupancyPct: 81,
    arrivals: 47,
    departures: 39,
    openBalanceCents: 18_460_00,
    teamOnDuty: 28,
  },
  cleaning: {
    unit: 'BL-018',
    departure: '10:22',
    nextArrival: '16:00',
    guest: 'Familia Vidal',
    rotationMinutes: 338,
    assignee: 'Nuria · Equipo 2',
  },
  incident: {
    unit: 'BL-042',
    asset: 'Climatización',
    finding: 'La unidad exterior arranca y se detiene; no mantiene temperatura.',
    nextArrival: '17:30',
    guest: 'Familia Costa',
    alternative: 'MH-018 · Mobil-home Horizonte',
  },
  handover: {
    from: 'Mañana',
    to: 'Tarde',
    nextLead: 'Jordi Serra',
    risks: [
      'BL-042 · reasignación pendiente',
      '4 llegadas sin fianza',
      'Grupo Delta · 2 matrículas pendientes',
    ],
  },
} as const;

export type CleaningStatus = 'detected' | 'assigned' | 'ready' | 'validated';
export type IncidentStatus = 'unreported' | 'reported' | 'triaged' | 'blocked' | 'reassignment';
export type HandoverStatus = 'collecting' | 'reviewed' | 'prepared' | 'acknowledged';

export type ControlTotalState = {
  version: 1;
  cleaning: CleaningStatus;
  incident: IncidentStatus;
  handover: HandoverStatus;
  revision: number;
};

export type ControlTotalAction =
  | { type: 'cleaning.assign' }
  | { type: 'cleaning.ready' }
  | { type: 'cleaning.validate' }
  | { type: 'incident.report' }
  | { type: 'incident.triage' }
  | { type: 'incident.block' }
  | { type: 'incident.prepare-reassignment' }
  | { type: 'handover.review' }
  | { type: 'handover.prepare' }
  | { type: 'handover.acknowledge' }
  | { type: 'reset' };

export const initialControlTotalState = (): ControlTotalState => ({
  version: 1,
  cleaning: 'detected',
  incident: 'unreported',
  handover: 'collecting',
  revision: 0,
});

const next = (state: ControlTotalState, patch: Partial<ControlTotalState>): ControlTotalState => ({
  ...state,
  ...patch,
  revision: state.revision + 1,
});

export function reduceControlTotal(
  state: ControlTotalState,
  action: ControlTotalAction,
): ControlTotalState {
  switch (action.type) {
    case 'cleaning.assign':
      return state.cleaning === 'detected' ? next(state, { cleaning: 'assigned' }) : state;
    case 'cleaning.ready':
      return state.cleaning === 'assigned' ? next(state, { cleaning: 'ready' }) : state;
    case 'cleaning.validate':
      return state.cleaning === 'ready' ? next(state, { cleaning: 'validated' }) : state;
    case 'incident.report':
      return state.incident === 'unreported' ? next(state, { incident: 'reported' }) : state;
    case 'incident.triage':
      return state.incident === 'reported' ? next(state, { incident: 'triaged' }) : state;
    case 'incident.block':
      return state.incident === 'triaged' ? next(state, { incident: 'blocked' }) : state;
    case 'incident.prepare-reassignment':
      return state.incident === 'blocked' ? next(state, { incident: 'reassignment' }) : state;
    case 'handover.review':
      return state.handover === 'collecting' ? next(state, { handover: 'reviewed' }) : state;
    case 'handover.prepare':
      return state.handover === 'reviewed' ? next(state, { handover: 'prepared' }) : state;
    case 'handover.acknowledge':
      return state.handover === 'prepared' ? next(state, { handover: 'acknowledged' }) : state;
    case 'reset':
      return initialControlTotalState();
  }
}

const cleaningStatuses: CleaningStatus[] = ['detected', 'assigned', 'ready', 'validated'];
const incidentStatuses: IncidentStatus[] = [
  'unreported',
  'reported',
  'triaged',
  'blocked',
  'reassignment',
];
const handoverStatuses: HandoverStatus[] = ['collecting', 'reviewed', 'prepared', 'acknowledged'];

export function parseControlTotalState(raw: string | null): ControlTotalState {
  if (!raw) return initialControlTotalState();
  try {
    const value = JSON.parse(raw) as Partial<ControlTotalState>;
    if (
      value.version !== 1 ||
      !cleaningStatuses.includes(value.cleaning as CleaningStatus) ||
      !incidentStatuses.includes(value.incident as IncidentStatus) ||
      !handoverStatuses.includes(value.handover as HandoverStatus) ||
      !Number.isInteger(value.revision) ||
      (value.revision ?? -1) < 0
    ) {
      return initialControlTotalState();
    }
    return value as ControlTotalState;
  } catch {
    return initialControlTotalState();
  }
}

export function controlTotalPulse(state: ControlTotalState) {
  return {
    preparationAlerts: state.cleaning === 'validated' ? 6 : 7,
    blockedUnits: state.incident === 'blocked' || state.incident === 'reassignment' ? 2 : 1,
    criticalRisks: state.incident === 'reassignment' ? 2 : 3,
    handoverPending: state.handover === 'acknowledged' ? 0 : 1,
  };
}

export function controlTotalHandoverRisks(state: ControlTotalState): string[] {
  return [
    ...(state.cleaning === 'validated'
      ? []
      : ['BL-018 · validar antes de la entrada de las 16:00']),
    state.incident === 'reassignment'
      ? 'BL-042 · alternativa MH-018 preparada'
      : state.incident === 'blocked'
        ? 'BL-042 · unidad bloqueada; alternativa pendiente'
        : 'BL-042 · evaluar impacto y próxima llegada',
    '4 llegadas sin fianza',
    'Grupo Delta · 2 matrículas pendientes',
  ];
}

export function resetControlTotalScenario(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(CONTROL_TOTAL_STATE_KEY);
  window.dispatchEvent(new Event(CONTROL_TOTAL_RESET_EVENT));
}
