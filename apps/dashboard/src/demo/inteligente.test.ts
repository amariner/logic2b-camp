import { describe, expect, it, vi } from 'vitest';
import {
  INTELIGENTE_RESET_EVENT,
  INTELIGENTE_STATE_KEY,
  initialInteligenteState,
  inteligenteRecommendationFixture,
  parseInteligenteState,
  reduceInteligenteState,
} from './inteligente';
import { mardefondoRecommendationAudit, resetMardefondoScenario } from './mardefondo';

describe('prototipo Inteligente explicable', () => {
  it('deriva sus señales del escenario canónico de Mar de Fondo', () => {
    const audit = mardefondoRecommendationAudit();
    const evidence = inteligenteRecommendationFixture.evidence;

    expect(evidence).toMatchObject(audit);
    expect(inteligenteRecommendationFixture.sources).toHaveLength(3);
    expect(inteligenteRecommendationFixture.limitations).toHaveLength(3);
  });

  it('expone periodo, incertidumbre e impacto económico sin floats', () => {
    const fixture = inteligenteRecommendationFixture;

    expect(fixture.period).toEqual({ from: '2026-08-18', to: '2026-09-01' });
    expect(fixture.projection.occupancyPctLow).toBeLessThan(fixture.projection.occupancyPctHigh);
    expect(fixture.confidence.level).toBe('medium');
    expect(Number.isInteger(fixture.projection.revenueImpactCentsLow)).toBe(true);
    expect(Number.isInteger(fixture.projection.revenueImpactCentsHigh)).toBe(true);
  });

  it('preparar no cambia tarifa, cupo ni reservas', () => {
    const prepared = reduceInteligenteState(initialInteligenteState(), { type: 'prepare' });

    expect(prepared.status).toBe('prepared');
    expect(inteligenteRecommendationFixture.execution).toBe('none');
    expect(Object.values(prepared)).not.toContain('applied');
    expect(Object.values(prepared)).not.toContain('executed');
  });

  it('permite descartar y reabrir sin perder la recomendación', () => {
    const discarded = reduceInteligenteState(initialInteligenteState(), { type: 'discard' });
    const reopened = reduceInteligenteState(discarded, { type: 'reopen' });

    expect(discarded.status).toBe('discarded');
    expect(reopened.status).toBe('review');
    expect(reopened.revision).toBe(2);
  });

  it('el reset y el parseo fail-safe vuelven al estado conocido', () => {
    const prepared = reduceInteligenteState(initialInteligenteState(), { type: 'prepare' });

    expect(reduceInteligenteState(prepared, { type: 'reset' })).toEqual(initialInteligenteState());
    expect(parseInteligenteState('{')).toEqual(initialInteligenteState());
    expect(parseInteligenteState('{"status":"applied","revision":1}')).toEqual(
      initialInteligenteState(),
    );
  });

  it('el restablecimiento común borra la decisión y avisa a la pantalla abierta', () => {
    const removeItem = vi.fn();
    const dispatchEvent = vi.fn();
    vi.stubGlobal('localStorage', { removeItem });
    vi.stubGlobal('window', { dispatchEvent });
    try {
      resetMardefondoScenario();
      expect(removeItem).toHaveBeenCalledWith(INTELIGENTE_STATE_KEY);
      expect(dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: INTELIGENTE_RESET_EVENT }),
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
