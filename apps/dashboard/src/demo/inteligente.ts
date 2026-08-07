/**
 * Recomendación precalculada del prototipo Inteligente de Mar de Fondo.
 *
 * No hay modelo ni endpoint detrás: las señales se auditan contra el escenario
 * canónico en tests y la única transición final posible es «prepared».
 */
export const INTELIGENTE_STATE_KEY = 'logic2b-demo:mardefondo:inteligente-state:v1';
export const INTELIGENTE_RESET_EVENT = 'logic2b-demo:inteligente-reset';

export const inteligenteRecommendationFixture = {
  id: 'intel_mf_occupancy_001',
  kind: 'occupancy_recommendation',
  period: { from: '2026-08-18', to: '2026-09-01' },
  scope: 'Bungalow Laguna · venta directa',
  title: 'Preparar una tarifa flexible para estancias de 4 noches o más',
  observation:
    'La ocupación prevista de Bungalow Laguna sigue baja para las dos últimas semanas de agosto, mientras la mayor parte de las reservas del periodo entra por la web.',
  recommendation:
    'Preparar una prueba limitada del 7 % de reducción en venta directa, solo para nuevas estancias de al menos 4 noches entre el 18 y el 31 de agosto.',
  evidence: {
    sellableUnits: 59,
    occupiedNights: 152,
    capacityNights: 826,
    occupancyPct: 18,
    overlappingBookings: 32,
    directWebBookings: 25,
    directWebSharePct: 78,
  },
  projection: {
    occupancyPctLow: 22,
    occupancyPctHigh: 28,
    revenueImpactCentsLow: -90_000,
    revenueImpactCentsHigh: 160_000,
  },
  change: {
    type: 'rate_adjustment_draft',
    adjustmentBasisPoints: -700,
    minimumNights: 4,
    channel: 'web_direct',
  },
  confidence: {
    level: 'medium',
    scorePct: 64,
    reasons: [
      'La señal usa el planning completo del periodo',
      'El canal directo representa 25 de las 32 reservas observadas',
      'El escenario no incluye histórico equivalente del año anterior',
    ],
  },
  sources: [
    {
      label: 'Planning · Bungalow Laguna',
      value: '152 de 826 noches ocupadas',
      detail: '59 unidades vendibles · 18–31 ago',
    },
    {
      label: 'Reservas que solapan el periodo',
      value: '32 reservas',
      detail: 'Solo datos ficticios del escenario local',
    },
    {
      label: 'Origen de la demanda',
      value: '25 reservas web · 78 %',
      detail: 'La prueba se limita al canal directo',
    },
  ],
  limitations: [
    'No compara precios de competidores ni consulta fuentes externas',
    'No conoce cancelaciones futuras, meteorología ni demanda no registrada',
    'El rango es orientativo: dirección debe revisar margen y disponibilidad real',
  ],
  execution: 'none',
} as const;

export type InteligenteStatus = 'review' | 'prepared' | 'discarded';

export type InteligenteState = {
  status: InteligenteStatus;
  revision: number;
};

export type InteligenteAction =
  { type: 'prepare' } | { type: 'discard' } | { type: 'reopen' } | { type: 'reset' };

export function initialInteligenteState(): InteligenteState {
  return { status: 'review', revision: 0 };
}

/** Deliberadamente no existe una acción «apply» ni «execute». */
export function reduceInteligenteState(
  state: InteligenteState,
  action: InteligenteAction,
): InteligenteState {
  if (action.type === 'reset') return initialInteligenteState();
  if (action.type === 'prepare') {
    return { status: 'prepared', revision: state.revision + 1 };
  }
  if (action.type === 'discard') {
    return { status: 'discarded', revision: state.revision + 1 };
  }
  return { status: 'review', revision: state.revision + 1 };
}

export function parseInteligenteState(raw: string | null): InteligenteState {
  if (!raw) return initialInteligenteState();
  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === 'object' &&
      value !== null &&
      'status' in value &&
      (value.status === 'review' || value.status === 'prepared' || value.status === 'discarded') &&
      'revision' in value &&
      typeof value.revision === 'number' &&
      Number.isInteger(value.revision) &&
      value.revision >= 0
    ) {
      return { status: value.status, revision: value.revision };
    }
  } catch {
    // Un estado corrupto o antiguo vuelve al fixture seguro.
  }
  return initialInteligenteState();
}

export function resetInteligenteScenario(): void {
  try {
    localStorage.removeItem(INTELIGENTE_STATE_KEY);
  } catch {
    // En modo privado la interacción sigue funcionando durante la pestaña.
  }
  window.dispatchEvent(new Event(INTELIGENTE_RESET_EVENT));
}
