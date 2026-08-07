import { describe, expect, it } from 'vitest';
import {
  automatizaReviewFixture,
  initialAutomatizaReviewState,
  parseAutomatizaReviewState,
  reduceAutomatizaReview,
} from './automatiza';

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
});
