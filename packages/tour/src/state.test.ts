import { describe, expect, it } from 'vitest';
import { initialTourState, normalizeTourState, transitionTour } from './state';

describe('máquina del recorrido Camp', () => {
  it('abre la elección y empieza siempre por el primer hito', () => {
    const opened = transitionTour(initialTourState, { type: 'open' }, 9);
    expect(opened).toEqual({ status: 'intro', stepIndex: 0 });
    expect(transitionTour(opened, { type: 'start' }, 9)).toEqual({
      status: 'active',
      stepIndex: 0,
    });
  });

  it('avanza sin saltarse hitos y completa al cerrar el noveno', () => {
    let state = transitionTour(initialTourState, { type: 'start' }, 9);
    for (let index = 1; index < 9; index += 1) {
      state = transitionTour(state, { type: 'next' }, 9);
      expect(state).toEqual({ status: 'active', stepIndex: index });
    }
    expect(transitionTour(state, { type: 'next' }, 9)).toEqual({
      status: 'complete',
      stepIndex: 8,
    });
  });

  it('pausa y reanuda exactamente en el hito pendiente', () => {
    const onStepFour = { status: 'active', stepIndex: 3 } as const;
    const paused = transitionTour(onStepFour, { type: 'pause' }, 9);
    expect(paused).toEqual({ status: 'paused', stepIndex: 3 });
    expect(transitionTour(paused, { type: 'resume' }, 9)).toEqual(onStepFour);
  });

  it('salir o restablecer no conserva progreso de la visita', () => {
    const active = { status: 'active', stepIndex: 5 } as const;
    expect(transitionTour(active, { type: 'exit' }, 9)).toEqual(initialTourState);
    expect(transitionTour(active, { type: 'reset' }, 9)).toEqual(initialTourState);
  });

  it('normaliza almacenamiento corrupto y limita el índice al recorrido real', () => {
    expect(normalizeTourState(null, 9)).toEqual(initialTourState);
    expect(normalizeTourState({ status: 'active', stepIndex: 99 }, 9)).toEqual({
      status: 'active',
      stepIndex: 8,
    });
    expect(normalizeTourState({ status: 'desconocido', stepIndex: 2 }, 9)).toEqual(
      initialTourState,
    );
  });
});
