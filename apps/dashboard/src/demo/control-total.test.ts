import { describe, expect, it, vi } from 'vitest';
import {
  CONTROL_TOTAL_RESET_EVENT,
  CONTROL_TOTAL_STATE_KEY,
  controlTotalPulse,
  parseControlTotalModuleKey,
  controlTotalHandoverRisks,
  initialControlTotalState,
  parseControlTotalState,
  reduceControlTotal,
  resetControlTotalScenario,
} from './control-total';

describe('Control total · estado local reversible', () => {
  it('acepta únicamente los ocho módulos y recupera Centro ante rutas desconocidas', () => {
    expect(parseControlTotalModuleKey('limpieza')).toBe('limpieza');
    expect(parseControlTotalModuleKey('reservas-grupos')).toBe('reservas-grupos');
    expect(parseControlTotalModuleKey('inventado')).toBe('centro');
    expect(parseControlTotalModuleKey(undefined)).toBe('centro');
  });

  it('solo permite las transiciones previstas de limpieza', () => {
    const initial = initialControlTotalState();
    expect(reduceControlTotal(initial, { type: 'cleaning.ready' })).toBe(initial);
    const assigned = reduceControlTotal(initial, { type: 'cleaning.assign' });
    const ready = reduceControlTotal(assigned, { type: 'cleaning.ready' });
    const validated = reduceControlTotal(ready, { type: 'cleaning.validate' });
    expect(validated.cleaning).toBe('validated');
    expect(controlTotalPulse(validated).preparationAlerts).toBe(6);
    expect(controlTotalHandoverRisks(validated)).not.toContain(
      'BL-018 · validar antes de la entrada de las 16:00',
    );
  });

  it('propaga el bloqueo y la reasignación al pulso', () => {
    let state = initialControlTotalState();
    state = reduceControlTotal(state, { type: 'incident.report' });
    state = reduceControlTotal(state, { type: 'incident.triage' });
    state = reduceControlTotal(state, { type: 'incident.block' });
    expect(controlTotalPulse(state).blockedUnits).toBe(2);
    state = reduceControlTotal(state, { type: 'incident.prepare-reassignment' });
    expect(controlTotalPulse(state).criticalRisks).toBe(2);
    expect(controlTotalHandoverRisks(state).some((risk) => risk.includes('MH-018 preparada'))).toBe(
      true,
    );
  });

  it('cierra el relevo únicamente después de revisar y preparar', () => {
    let state = initialControlTotalState();
    expect(reduceControlTotal(state, { type: 'handover.acknowledge' })).toBe(state);
    state = reduceControlTotal(state, { type: 'handover.review' });
    state = reduceControlTotal(state, { type: 'handover.prepare' });
    state = reduceControlTotal(state, { type: 'handover.acknowledge' });
    expect(state.handover).toBe('acknowledged');
    expect(controlTotalPulse(state).handoverPending).toBe(0);
  });

  it('recupera el fixture ante JSON corrupto o estados imposibles', () => {
    expect(parseControlTotalState('{')).toEqual(initialControlTotalState());
    expect(parseControlTotalState(JSON.stringify({ version: 1, cleaning: 'flying' }))).toEqual(
      initialControlTotalState(),
    );
  });

  it('el reset general borra la clave y avisa a una pantalla abierta', () => {
    const removeItem = vi.fn();
    const dispatchEvent = vi.fn();
    vi.stubGlobal('localStorage', { removeItem });
    vi.stubGlobal('window', { dispatchEvent });
    try {
      resetControlTotalScenario();
      expect(removeItem).toHaveBeenCalledWith(CONTROL_TOTAL_STATE_KEY);
      expect(dispatchEvent.mock.calls[0]?.[0]).toBeInstanceOf(Event);
      expect((dispatchEvent.mock.calls[0]?.[0] as Event).type).toBe(CONTROL_TOTAL_RESET_EVENT);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
