/**
 * Prototipos supervisados de Automatiza: dos tareas locales que terminan en
 * «prepared». Ninguna transición publica, entrega, cobra ni abre tickets.
 */
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  toast,
} from '@logic-camp/ui';
import { Navigate } from '@tanstack/react-router';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  FileSearch,
  ListChecks,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { useEffect, useReducer, type Dispatch } from 'react';
import {
  AUTOMATIZA_INCIDENT_STATE_KEY,
  AUTOMATIZA_RESET_EVENT,
  AUTOMATIZA_STATE_KEY,
  automatizaReviewFixture as reviewFixture,
  parseAutomatizaIncidentState,
  parseAutomatizaReviewState,
  reduceAutomatizaIncident,
  reduceAutomatizaReview,
  type AutomatizaIncidentAction,
  type AutomatizaIncidentState,
  type AutomatizaReviewAction,
  type AutomatizaReviewState,
} from '../demo/automatiza';
import { mardefondoIncidentFixture as incidentFixture } from '../demo/mardefondo';
import { t } from '../i18n';
import { eur, fecha } from '../lib/format';

const enabled = import.meta.env.VITE_DEMO_SCENARIO === 'mardefondo';

function loadReview() {
  try {
    return parseAutomatizaReviewState(localStorage.getItem(AUTOMATIZA_STATE_KEY));
  } catch {
    return parseAutomatizaReviewState(null);
  }
}

function loadIncident() {
  try {
    return parseAutomatizaIncidentState(localStorage.getItem(AUTOMATIZA_INCIDENT_STATE_KEY));
  } catch {
    return parseAutomatizaIncidentState(null);
  }
}

function FlowSteps({
  label,
  steps,
}: {
  label: string;
  steps: readonly (readonly [string, boolean])[];
}) {
  return (
    <ol className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4" aria-label={label}>
      {steps.map(([step, done], index) => (
        <li
          key={step}
          className="flex min-h-11 items-center gap-2 rounded-lg border border-border bg-card px-3"
        >
          {done ? (
            <CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden />
          ) : (
            <CircleDot className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          )}
          <span>
            <span className="mr-1 text-muted-foreground">0{index + 1}</span>
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}

function ReviewScenario({
  review,
  dispatch,
}: {
  review: AutomatizaReviewState;
  dispatch: Dispatch<AutomatizaReviewAction>;
}) {
  const isReview = review.status === 'review';
  const canPrepare = review.draft.trim().length >= 40;

  return (
    <>
      <FlowSteps
        label={t('auto.flow')}
        steps={[
          [t('auto.step.trigger'), true],
          [t('auto.step.draft'), true],
          [t('auto.step.review'), review.status !== 'discarded'],
          [t('auto.step.prepare'), review.status === 'prepared'],
        ]}
      />

      <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.5fr)]">
        <div className="grid content-start gap-5">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="secondary">{t('auto.trigger')}</Badge>
                <span className="text-xs text-muted-foreground">{reviewFixture.received}</span>
              </div>
              <CardTitle className="pt-2 text-base">{reviewFixture.trigger}</CardTitle>
              <CardDescription>{reviewFixture.channel}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <blockquote className="border-l-2 border-primary/45 pl-3 text-sm leading-relaxed">
                “{reviewFixture.review}”
              </blockquote>
              <div className="text-xs leading-relaxed text-muted-foreground">
                <p className="font-medium text-foreground">{reviewFixture.author}</p>
                <p>{reviewFixture.stay}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileSearch className="size-4 text-primary" aria-hidden />
                <CardTitle className="text-base">{t('auto.why')}</CardTitle>
              </div>
              <CardDescription>{reviewFixture.summary}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div>
                <h2 className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  {t('auto.sources')}
                </h2>
                <ul className="mt-2 grid gap-2 text-sm">
                  {reviewFixture.sources.map((source) => (
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
                  {reviewFixture.safeguards.map((guard) => (
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
            <label htmlFor="automatiza-review-draft" className="text-sm font-medium">
              {t('auto.draftLabel')}
            </label>
            <Textarea
              id="automatiza-review-draft"
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
    </>
  );
}

function IncidentScenario({
  incident,
  dispatch,
}: {
  incident: AutomatizaIncidentState;
  dispatch: Dispatch<AutomatizaIncidentAction>;
}) {
  const isReview = incident.status === 'review';
  const canPrepare = incident.draft.trim().length >= 80;

  return (
    <>
      <FlowSteps
        label={t('auto.incident.flow')}
        steps={[
          [t('auto.incident.step.collect'), true],
          [t('auto.incident.step.summarize'), true],
          [t('auto.incident.step.review'), incident.status !== 'discarded'],
          [t('auto.incident.step.prepare'), incident.status === 'prepared'],
        ]}
      />

      <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="grid min-w-0 content-start gap-5">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="secondary">{t('auto.incident.count')}</Badge>
                <span className="text-xs text-muted-foreground">
                  {fecha(incidentFixture.period.from)} · {incidentFixture.period.timezone}
                </span>
              </div>
              <CardTitle className="pt-2 text-base">{t('auto.incident.period')}</CardTitle>
              <CardDescription>{t('auto.incident.group')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {incidentFixture.incidents.map((item) => (
                <article
                  key={item.id}
                  className="min-w-0 rounded-lg border border-border bg-muted/25 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={item.severity === 'high' ? 'default' : 'outline'}>
                      {t(`auto.incident.severity.${item.severity}`)}
                    </Badge>
                    <span className="text-xs font-medium text-muted-foreground">
                      {t(`auto.incident.area.${item.area}`)}
                    </span>
                  </div>
                  <h2 className="mt-2 text-sm font-semibold">{item.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.detail}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs">
                    <span className="text-muted-foreground">{item.owner}</span>
                    <span className="tnum font-medium text-foreground">
                      {item.amountCents === undefined ? item.metric : eur(item.amountCents)}
                    </span>
                  </div>
                </article>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ListChecks className="size-4 text-primary" aria-hidden />
                <CardTitle className="text-base">{t('auto.incident.sources')}</CardTitle>
              </div>
              <CardDescription>{t('auto.incident.sourcesHelp')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {incidentFixture.sources.map((source) => (
                <div key={source.id} className="min-w-0 rounded-lg border border-border p-3">
                  <p className="text-xs font-medium text-muted-foreground">{source.label}</p>
                  <p className="mt-1 text-sm font-semibold">{source.value}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {source.detail}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid min-w-0 content-start gap-5">
          <Card className="min-w-0">
            <CardHeader className="border-b border-border">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">{t('auto.incident.reviewTitle')}</CardTitle>
                  <CardDescription className="mt-1">
                    {t('auto.incident.reviewHelp')}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    incident.status === 'prepared'
                      ? 'default'
                      : incident.status === 'discarded'
                        ? 'muted'
                        : 'outline'
                  }
                >
                  {t(`auto.incident.status.${incident.status}`)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 pt-5">
              <div className="rounded-lg border border-border bg-muted/35 px-3 py-2 text-xs">
                <span className="text-muted-foreground">{t('auto.incident.recipient')}: </span>
                <span className="font-medium">{incidentFixture.recipient}</span>
              </div>
              <label htmlFor="automatiza-incident-draft" className="text-sm font-medium">
                {t('auto.incident.draftLabel')}
              </label>
              <Textarea
                id="automatiza-incident-draft"
                rows={10}
                value={incident.draft}
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
                        toast(t('auto.incident.discardedToast'));
                      }}
                    >
                      <X className="size-4" aria-hidden />
                      {t('auto.incident.discard')}
                    </Button>
                    <Button
                      type="button"
                      className="min-h-11 sm:ml-auto sm:min-h-8"
                      disabled={!canPrepare}
                      onClick={() => {
                        dispatch({ type: 'prepare' });
                        toast.success(t('auto.incident.preparedToast'));
                      }}
                    >
                      <Check className="size-4" aria-hidden />
                      {t('auto.incident.prepare')}
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
                    {t('auto.incident.reopen')}
                  </Button>
                )}
              </div>
              <div
                role="status"
                className="rounded-lg border border-border bg-muted/45 px-4 py-3 text-sm leading-relaxed"
              >
                <p className="font-medium">{t(`auto.incident.result.${incident.status}.title`)}</p>
                <p className="mt-1 text-muted-foreground">
                  {t(`auto.incident.result.${incident.status}.description`)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-primary" aria-hidden />
                <CardTitle className="text-base">{t('auto.incident.limitations')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm text-muted-foreground">
                {incidentFixture.limitations.map((limitation) => (
                  <li key={limitation} className="flex gap-2">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>{limitation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default function Automatiza() {
  const [review, dispatchReview] = useReducer(reduceAutomatizaReview, undefined, loadReview);
  const [incident, dispatchIncident] = useReducer(
    reduceAutomatizaIncident,
    undefined,
    loadIncident,
  );

  useEffect(() => {
    try {
      localStorage.setItem(AUTOMATIZA_STATE_KEY, JSON.stringify(review));
    } catch {
      // En modo privado se conserva la interacción hasta cerrar la pestaña.
    }
  }, [review]);

  useEffect(() => {
    try {
      localStorage.setItem(AUTOMATIZA_INCIDENT_STATE_KEY, JSON.stringify(incident));
    } catch {
      // En modo privado se conserva la interacción hasta cerrar la pestaña.
    }
  }, [incident]);

  useEffect(() => {
    const reset = () => {
      dispatchReview({ type: 'reset' });
      dispatchIncident({ type: 'reset' });
    };
    window.addEventListener(AUTOMATIZA_RESET_EVENT, reset);
    return () => window.removeEventListener(AUTOMATIZA_RESET_EVENT, reset);
  }, []);

  if (!enabled) return <Navigate to="/" replace />;

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

        <Tabs defaultValue="review" className="mt-5 min-w-0">
          <TabsList className="grid min-h-12 w-full grid-cols-2 sm:w-fit sm:min-w-96">
            <TabsTrigger value="review" className="min-h-10 gap-2">
              <FileSearch className="size-4" aria-hidden />
              {t('auto.tab.review')}
            </TabsTrigger>
            <TabsTrigger value="incidents" className="min-h-10 gap-2">
              <ClipboardList className="size-4" aria-hidden />
              {t('auto.tab.incidents')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="review" className="mt-5 outline-none">
            <ReviewScenario review={review} dispatch={dispatchReview} />
          </TabsContent>
          <TabsContent value="incidents" className="mt-5 outline-none">
            <IncidentScenario incident={incident} dispatch={dispatchIncident} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
