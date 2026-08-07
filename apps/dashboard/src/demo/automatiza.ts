/**
 * Fixture y estado del primer prototipo Automatiza de Mar de Fondo.
 *
 * El componente solo presenta y revisa estos datos. No hay proveedor, endpoint,
 * cola ni envío escondidos detrás del botón: «preparar» es el último estado que
 * puede alcanzar la demo.
 */
export const AUTOMATIZA_STATE_KEY = 'logic2b-demo:mardefondo:automatiza-state:v1';
export const AUTOMATIZA_RESET_EVENT = 'logic2b-demo:automatiza-reset';

export const automatizaReviewFixture = {
  id: 'auto_mf_review_001',
  kind: 'review_reply',
  trigger: 'Nueva reseña · 3 de 5 estrellas',
  received: 'Hace 18 minutos',
  channel: 'Perfil de empresa · escenario de muestra',
  author: 'Clara V.',
  stay: 'Estancia ficticia MF-2026-0184 · 12–16 ago',
  review:
    'La laguna y el bungalow estaban impecables. El único problema fue esperar bastante al llegar; había mucha gente haciendo el check-in a la misma hora.',
  summary:
    'Valora limpieza y alojamiento; señala 27 minutos de espera durante el pico de llegadas.',
  sources: [
    'Reseña de muestra en español · 3/5',
    'Estancia ficticia verificada en el escenario',
    'Incidencias de recepción · espera media 27 min entre 16:00 y 17:00',
  ],
  safeguards: [
    'Reconocer la espera sin discutir la valoración',
    'No revelar datos de la estancia ni de la huésped',
    'No prometer una compensación que nadie haya autorizado',
  ],
  proposedReply:
    'Gracias, Clara, por destacar el cuidado de la laguna y del bungalow. Sentimos que la llegada fuera más lenta de lo esperado. En esa franja coincidieron varias entradas y el equipo está revisando cómo repartirlas mejor. Gracias por señalarlo: nos ayuda a mejorar la recepción sin perder el trato personal.',
  execution: 'manual_external',
} as const;

export type AutomatizaReviewStatus = 'review' | 'prepared' | 'discarded';

export type AutomatizaReviewState = {
  draft: string;
  status: AutomatizaReviewStatus;
  revision: number;
};

export type AutomatizaReviewAction =
  | { type: 'edit'; draft: string }
  | { type: 'prepare' }
  | { type: 'discard' }
  | { type: 'reopen' }
  | { type: 'reset' };

export function initialAutomatizaReviewState(): AutomatizaReviewState {
  return {
    draft: automatizaReviewFixture.proposedReply,
    status: 'review',
    revision: 0,
  };
}

/** Transición pura: incluso aprobada, la propuesta nunca alcanza «sent». */
export function reduceAutomatizaReview(
  state: AutomatizaReviewState,
  action: AutomatizaReviewAction,
): AutomatizaReviewState {
  if (action.type === 'reset') return initialAutomatizaReviewState();
  if (action.type === 'edit') {
    return { ...state, draft: action.draft, status: 'review', revision: state.revision + 1 };
  }
  if (action.type === 'prepare') {
    if (state.draft.trim().length < 40) return state;
    return { ...state, status: 'prepared', revision: state.revision + 1 };
  }
  if (action.type === 'discard') {
    return { ...state, status: 'discarded', revision: state.revision + 1 };
  }
  return { ...state, status: 'review', revision: state.revision + 1 };
}

export function parseAutomatizaReviewState(raw: string | null): AutomatizaReviewState {
  if (!raw) return initialAutomatizaReviewState();
  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === 'object' &&
      value !== null &&
      'draft' in value &&
      typeof value.draft === 'string' &&
      value.draft.length <= 2_000 &&
      'status' in value &&
      (value.status === 'review' || value.status === 'prepared' || value.status === 'discarded') &&
      'revision' in value &&
      typeof value.revision === 'number' &&
      Number.isInteger(value.revision) &&
      value.revision >= 0
    ) {
      return { draft: value.draft, status: value.status, revision: value.revision };
    }
  } catch {
    // Estado corrupto o de una versión anterior: el fixture conocido es seguro.
  }
  return initialAutomatizaReviewState();
}

export function resetAutomatizaScenario(): void {
  try {
    localStorage.removeItem(AUTOMATIZA_STATE_KEY);
  } catch {
    // Modo privado: la demo funciona durante la sesión aunque no persista.
  }
  window.dispatchEvent(new Event(AUTOMATIZA_RESET_EVENT));
}
