/**
 * Primer prototipo navegable de Automatiza: trigger → borrador → revisión humana
 * → propuesta preparada. Solo existe en el escenario Mar de Fondo y no contiene
 * ninguna transición capaz de publicar o enviar la respuesta.
 */
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Textarea,
  toast,
} from '@logic-camp/ui';
import { Navigate } from '@tanstack/react-router';
import {
  Check,
  CheckCircle2,
  CircleDot,
  FileSearch,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { useEffect, useReducer } from 'react';
import {
  AUTOMATIZA_RESET_EVENT,
  AUTOMATIZA_STATE_KEY,
  automatizaReviewFixture as fixture,
  parseAutomatizaReviewState,
  reduceAutomatizaReview,
} from '../demo/automatiza';
import { t } from '../i18n';

const enabled = import.meta.env.VITE_DEMO_SCENARIO === 'mardefondo';

function loadReview() {
  try {
    return parseAutomatizaReviewState(localStorage.getItem(AUTOMATIZA_STATE_KEY));
  } catch {
    return parseAutomatizaReviewState(null);
  }
}

export default function Automatiza() {
  const [review, dispatch] = useReducer(reduceAutomatizaReview, undefined, loadReview);

  useEffect(() => {
    try {
      localStorage.setItem(AUTOMATIZA_STATE_KEY, JSON.stringify(review));
    } catch {
      // En modo privado se conserva la interacción hasta cerrar la pestaña.
    }
  }, [review]);

  useEffect(() => {
    const reset = () => dispatch({ type: 'reset' });
    window.addEventListener(AUTOMATIZA_RESET_EVENT, reset);
    return () => window.removeEventListener(AUTOMATIZA_RESET_EVENT, reset);
  }, []);

  if (!enabled) return <Navigate to="/" replace />;

  const isReview = review.status === 'review';
  const canPrepare = review.draft.trim().length >= 40;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-7">
        <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary/35 text-primary">
                <Sparkles className="mr-1 size-3" aria-hidden />
                {t('auto.badge')}
              </Badge>
              <span className="text-xs text-muted-foreground">{t('auto.scenario')}</span>
            </div>
            <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {t('auto.title')}
            </h1>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {t('auto.intro')}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-muted/45 px-3 py-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" aria-hidden />
            {t('auto.noExecution')}
          </div>
        </header>

        <ol
          className="mt-5 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4"
          aria-label={t('auto.flow')}
        >
          {[
            [t('auto.step.trigger'), true],
            [t('auto.step.draft'), true],
            [t('auto.step.review'), review.status !== 'discarded'],
            [t('auto.step.prepare'), review.status === 'prepared'],
          ].map(([label, done], index) => (
            <li
              key={String(label)}
              className="flex min-h-11 items-center gap-2 rounded-lg border border-border bg-card px-3"
            >
              {done ? (
                <CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden />
              ) : (
                <CircleDot className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              )}
              <span>
                <span className="mr-1 text-muted-foreground">0{index + 1}</span>
                {label}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.5fr)]">
          <div className="grid content-start gap-5">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="secondary">{t('auto.trigger')}</Badge>
                  <span className="text-xs text-muted-foreground">{fixture.received}</span>
                </div>
                <CardTitle className="pt-2 text-base">{fixture.trigger}</CardTitle>
                <CardDescription>{fixture.channel}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <blockquote className="border-l-2 border-primary/45 pl-3 text-sm leading-relaxed">
                  “{fixture.review}”
                </blockquote>
                <div className="text-xs leading-relaxed text-muted-foreground">
                  <p className="font-medium text-foreground">{fixture.author}</p>
                  <p>{fixture.stay}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileSearch className="size-4 text-primary" aria-hidden />
                  <CardTitle className="text-base">{t('auto.why')}</CardTitle>
                </div>
                <CardDescription>{fixture.summary}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                <div>
                  <h2 className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                    {t('auto.sources')}
                  </h2>
                  <ul className="mt-2 grid gap-2 text-sm">
                    {fixture.sources.map((source) => (
                      <li key={source} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                        <span>{source}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                    {t('auto.safeguards')}
                  </h2>
                  <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
                    {fixture.safeguards.map((guard) => (
                      <li key={guard} className="flex gap-2">
                        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
                        <span>{guard}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="min-w-0">
            <CardHeader className="border-b border-border">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">{t('auto.reviewTitle')}</CardTitle>
                  <CardDescription className="mt-1">{t('auto.reviewHelp')}</CardDescription>
                </div>
                <Badge
                  variant={
                    review.status === 'prepared'
                      ? 'default'
                      : review.status === 'discarded'
                        ? 'muted'
                        : 'outline'
                  }
                >
                  {t(`auto.status.${review.status}`)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 pt-5">
              <label htmlFor="automatiza-draft" className="text-sm font-medium">
                {t('auto.draftLabel')}
              </label>
              <Textarea
                id="automatiza-draft"
                rows={10}
                value={review.draft}
                disabled={!isReview}
                onChange={(event) => dispatch({ type: 'edit', draft: event.currentTarget.value })}
                className="min-h-56 resize-y text-base leading-relaxed sm:text-sm"
              />
              <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
                {isReview ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11 sm:min-h-8"
                      onClick={() => {
                        dispatch({ type: 'discard' });
                        toast(t('auto.discardedToast'));
                      }}
                    >
                      <X className="size-4" aria-hidden />
                      {t('auto.discard')}
                    </Button>
                    <Button
                      type="button"
                      className="min-h-11 sm:ml-auto sm:min-h-8"
                      disabled={!canPrepare}
                      onClick={() => {
                        dispatch({ type: 'prepare' });
                        toast.success(t('auto.preparedToast'));
                      }}
                    >
                      <Check className="size-4" aria-hidden />
                      {t('auto.prepare')}
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11 sm:min-h-8"
                    onClick={() => dispatch({ type: 'reopen' })}
                  >
                    <RotateCcw className="size-4" aria-hidden />
                    {t('auto.reopen')}
                  </Button>
                )}
              </div>

              <div
                role="status"
                className="rounded-lg border border-border bg-muted/45 px-4 py-3 text-sm leading-relaxed"
              >
                <p className="font-medium">{t(`auto.result.${review.status}.title`)}</p>
                <p className="mt-1 text-muted-foreground">
                  {t(`auto.result.${review.status}.description`)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
