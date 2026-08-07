import { describe, expect, it, vi } from 'vitest';
import {
  AUTOMATIZA_INCIDENT_STATE_KEY,
  AUTOMATIZA_RESET_EVENT,
  AUTOMATIZA_STATE_KEY,
  automatizaReviewFixture,
  initialAutomatizaIncidentState,
  initialAutomatizaReviewState,
  parseAutomatizaIncidentState,
  parseAutomatizaReviewState,
  reduceAutomatizaIncident,
  reduceAutomatizaReview,
  resetAutomatizaScenario,
} from './automatiza';
import { mardefondoIncidentAudit, mardefondoIncidentFixture } from './mardefondo';

describe('prototipo Automatiza supervisado', () => {
  it('explica la propuesta con fuentes y límites de revisión', () => {
    expect(automatizaReviewFixture.sources).toHaveLength(3);
    expect(automatizaReviewFixture.safeguards).toHaveLength(3);
    expect(automatizaReviewFixture.execution).toBe('manual_external');
  });

  it('aprobar solo prepara: no existe una transición de envío', () => {
    const prepared = reduceAutomatizaReview(initialAutomatizaReviewState(), { type: 'prepare' });

    expect(prepared.status).toBe('prepared');
    expect(prepared.draft).toBe(automatizaReviewFixture.proposedReply);
    expect(Object.values(prepared)).not.toContain('sent');
  });

  it('permite descartar y reabrir la revisión sin perder el borrador', () => {
    const edited = reduceAutomatizaReview(initialAutomatizaReviewState(), {
      type: 'edit',
      draft: 'Borrador revisado por recepción que conserva suficiente contexto para aprobarse.',
    });
    const discarded = reduceAutomatizaReview(edited, { type: 'discard' });
    const reopened = reduceAutomatizaReview(discarded, { type: 'reopen' });

    expect(reopened).toMatchObject({ draft: edited.draft, status: 'review' });
  });

  it('el reset devuelve el fixture inicial aunque la pantalla siga abierta', () => {
    const prepared = reduceAutomatizaReview(initialAutomatizaReviewState(), { type: 'prepare' });

    expect(reduceAutomatizaReview(prepared, { type: 'reset' })).toEqual(
      initialAutomatizaReviewState(),
    );
  });

  it('descarta estado local corrupto o incompatible', () => {
    expect(parseAutomatizaReviewState('{')).toEqual(initialAutomatizaReviewState());
    expect(parseAutomatizaReviewState('{"draft":"x","status":"sent","revision":1}')).toEqual(
      initialAutomatizaReviewState(),
    );
  });

  it('deriva el parte de incidencias del escenario canónico de Mar de Fondo', () => {
    expect(mardefondoIncidentFixture.evidence).toEqual(mardefondoIncidentAudit());
    expect(mardefondoIncidentFixture.period).toEqual({
      from: '2026-08-07',
      to: '2026-08-08',
      timezone: 'Europe/Madrid',
    });
    expect(mardefondoIncidentFixture.groupBy).toBe('operational_area');
    expect(mardefondoIncidentFixture.incidents).toHaveLength(3);
    expect(
      new Set(mardefondoIncidentFixture.incidents.map((incident) => incident.severity)),
    ).toEqual(new Set(['high', 'medium']));
    expect(mardefondoIncidentFixture.sources).toHaveLength(4);
    expect(mardefondoIncidentFixture.limitations).toHaveLength(3);
    expect(mardefondoIncidentFixture.proposedSummary).toContain(
      `${mardefondoIncidentFixture.evidence.unsecuredArrivals} reservas`,
    );
    expect(mardefondoIncidentFixture.evidence.unsecuredOutstandingCents).toBe(274_800);
  });

  it('preparar el parte solo crea una entrega interna local', () => {
    const prepared = reduceAutomatizaIncident(initialAutomatizaIncidentState(), {
      type: 'prepare',
    });

    expect(prepared.status).toBe('prepared');
    expect(mardefondoIncidentFixture.delivery).toBe('internal_draft');
    expect(mardefondoIncidentFixture.execution).toBe('none');
    expect(Object.values(prepared)).not.toContain('sent');
    expect(Object.values(prepared)).not.toContain('published');
    expect(Object.values(prepared)).not.toContain('ticket_opened');
  });

  it('permite editar, descartar y reabrir el parte sin perder el contenido', () => {
    const edited = reduceAutomatizaIncident(initialAutomatizaIncidentState(), {
      type: 'edit',
      draft:
        'Resumen revisado por coordinación con el detalle suficiente para el relevo del turno siguiente.',
    });
    const discarded = reduceAutomatizaIncident(edited, { type: 'discard' });
    const reopened = reduceAutomatizaIncident(discarded, { type: 'reopen' });

    expect(reopened).toMatchObject({ draft: edited.draft, status: 'review' });
  });

  it('descarta estados imposibles del parte y conserva un fixture seguro', () => {
    expect(parseAutomatizaIncidentState('{')).toEqual(initialAutomatizaIncidentState());
    expect(
      parseAutomatizaIncidentState('{"draft":"x","status":"ticket_opened","revision":1}'),
    ).toEqual(initialAutomatizaIncidentState());
  });

  it('el reset común borra ambas decisiones y actualiza la pantalla abierta', () => {
    const removeItem = vi.fn();
    const dispatchEvent = vi.fn();
    vi.stubGlobal('localStorage', { removeItem });
    vi.stubGlobal('window', { dispatchEvent });
    try {
      resetAutomatizaScenario();
      expect(removeItem).toHaveBeenCalledWith(AUTOMATIZA_STATE_KEY);
      expect(removeItem).toHaveBeenCalledWith(AUTOMATIZA_INCIDENT_STATE_KEY);
      expect(dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: AUTOMATIZA_RESET_EVENT }),
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
