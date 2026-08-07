/**
 * Prototipo Inteligente explicable: observación → recomendación → decisión.
 * Solo prepara un cambio local; no modifica tarifa, cupo ni reservas.
 */
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  toast,
} from '@logic-camp/ui';
import { Navigate } from '@tanstack/react-router';
import {
  BrainCircuit,
  Check,
  CircleGauge,
  Database,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import { useEffect, useReducer } from 'react';
import {
  INTELIGENTE_RESET_EVENT,
  INTELIGENTE_STATE_KEY,
  inteligenteRecommendationFixture as fixture,
  parseInteligenteState,
  reduceInteligenteState,
} from '../demo/inteligente';
import { t } from '../i18n';
import { eur, fecha } from '../lib/format';

const enabled = import.meta.env.VITE_DEMO_SCENARIO === 'mardefondo';
const previousDay = (isoDate: string) =>
  new Date(Date.parse(`${isoDate}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);

function loadState() {
  try {
    return parseInteligenteState(localStorage.getItem(INTELIGENTE_STATE_KEY));
  } catch {
    return parseInteligenteState(null);
  }
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-muted/35 px-3 py-3">
      <p className="text-[11px] leading-snug font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="tnum mt-1 text-xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs leading-snug text-muted-foreground">{detail}</p>
    </div>
  );
}

export default function Inteligente() {
  const [review, dispatch] = useReducer(reduceInteligenteState, undefined, loadState);

  useEffect(() => {
    try {
      localStorage.setItem(INTELIGENTE_STATE_KEY, JSON.stringify(review));
    } catch {
      // En modo privado se conserva hasta cerrar la pestaña.
    }
  }, [review]);

  useEffect(() => {
    const reset = () => dispatch({ type: 'reset' });
    window.addEventListener(INTELIGENTE_RESET_EVENT, reset);
    return () => window.removeEventListener(INTELIGENTE_RESET_EVENT, reset);
  }, []);

  if (!enabled) return <Navigate to="/" replace />;

  const isReview = review.status === 'review';
  const adjustmentPct = Math.abs(fixture.change.adjustmentBasisPoints) / 100;
  const periodLabel = `${fecha(fixture.period.from)}–${fecha(previousDay(fixture.period.to))}`;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-7">
        <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary/35 text-primary">
                <BrainCircuit className="mr-1 size-3" aria-hidden />
                {t('intel.badge')}
              </Badge>
              <span className="text-xs text-muted-foreground">{t('intel.scenario')}</span>
            </div>
            <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {t('intel.title')}
            </h1>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {t('intel.intro')}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-muted/45 px-3 py-2 text-xs text-muted-foreground">
            <ShieldAlert className="size-4 text-primary" aria-hidden />
            {t('intel.noExecution')}
          </div>
        </header>

        <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.8fr)]">
          <div className="grid min-w-0 content-start gap-5">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="secondary">{fixture.scope}</Badge>
                  <span className="text-xs text-muted-foreground">{periodLabel}</span>
                </div>
                <CardTitle className="pt-2 text-lg">{fixture.title}</CardTitle>
                <CardDescription className="leading-relaxed">{fixture.observation}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <Metric
                    label={t('intel.metric.current')}
                    value={`${fixture.evidence.occupancyPct} %`}
                    detail={`${fixture.evidence.occupiedNights}/${fixture.evidence.capacityNights} ${t('intel.metric.nights')}`}
                  />
                  <Metric
                    label={t('intel.metric.projected')}
                    value={`${fixture.projection.occupancyPctLow}–${fixture.projection.occupancyPctHigh} %`}
                    detail={t('intel.metric.range')}
                  />
                  <div className="col-span-2 sm:col-span-1">
                    <Metric
                      label={t('intel.metric.revenue')}
                      value={`${eur(fixture.projection.revenueImpactCentsLow)} / +${eur(fixture.projection.revenueImpactCentsHigh)}`}
                      detail={t('intel.metric.gross')}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-4">
                  <div className="flex gap-3">
                    <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                    <div>
                      <h2 className="text-sm font-semibold">{t('intel.recommendation')}</h2>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {fixture.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-5 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Database className="size-4 text-primary" aria-hidden />
                    <CardTitle className="text-base">{t('intel.sources')}</CardTitle>
                  </div>
                  <CardDescription>{t('intel.sourcesHelp')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-3">
                    {fixture.sources.map((source) => (
                      <li key={source.label} className="border-l-2 border-primary/35 pl-3">
                        <p className="text-sm font-medium">{source.label}</p>
                        <p className="tnum text-sm text-foreground">{source.value}</p>
                        <p className="text-xs text-muted-foreground">{source.detail}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CircleGauge className="size-4 text-primary" aria-hidden />
                      <CardTitle className="text-base">{t('intel.confidence')}</CardTitle>
                    </div>
                    <Badge variant="outline">
                      {t(`intel.confidence.${fixture.confidence.level}`)} ·{' '}
                      {fixture.confidence.scorePct} %
                    </Badge>
                  </div>
                  <CardDescription>{t('intel.confidenceHelp')}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <ul className="grid gap-2 text-sm">
                    {fixture.confidence.reasons.map((reason) => (
                      <li key={reason} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-border pt-4">
                    <h3 className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                      {t('intel.limitations')}
                    </h3>
                    <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
                      {fixture.limitations.map((limitation) => (
                        <li key={limitation} className="flex gap-2">
                          <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                          <span>{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="h-fit min-w-0 lg:sticky lg:top-5">
            <CardHeader className="border-b border-border">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">{t('intel.changeTitle')}</CardTitle>
                  <CardDescription className="mt-1">{t('intel.changeHelp')}</CardDescription>
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
                  {t(`intel.status.${review.status}`)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 pt-5">
              <dl className="grid gap-3 text-sm">
                <div className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
                  <dt className="text-muted-foreground">{t('intel.change.adjustment')}</dt>
                  <dd className="tnum text-right font-medium">−{adjustmentPct} %</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
                  <dt className="text-muted-foreground">{t('intel.change.minimum')}</dt>
                  <dd className="text-right font-medium">
                    {fixture.change.minimumNights} {t('intel.change.nights')}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
                  <dt className="text-muted-foreground">{t('intel.change.channel')}</dt>
                  <dd className="text-right font-medium">{t('intel.change.web')}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-muted-foreground">{t('intel.change.period')}</dt>
                  <dd className="text-right font-medium">{periodLabel}</dd>
                </div>
              </dl>

              <div className="flex flex-col gap-2 border-t border-border pt-4">
                {isReview ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11"
                      onClick={() => {
                        dispatch({ type: 'discard' });
                        toast(t('intel.discardedToast'));
                      }}
                    >
                      <X className="size-4" aria-hidden />
                      {t('intel.discard')}
                    </Button>
                    <Button
                      type="button"
                      className="min-h-11"
                      onClick={() => {
                        dispatch({ type: 'prepare' });
                        toast.success(t('intel.preparedToast'));
                      }}
                    >
                      <TrendingUp className="size-4" aria-hidden />
                      {t('intel.prepare')}
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11"
                    onClick={() => dispatch({ type: 'reopen' })}
                  >
                    <RotateCcw className="size-4" aria-hidden />
                    {t('intel.reopen')}
                  </Button>
                )}
              </div>

              <div
                role="status"
                className="rounded-lg border border-border bg-muted/45 px-4 py-3 text-sm leading-relaxed"
              >
                <p className="font-medium">{t(`intel.result.${review.status}.title`)}</p>
                <p className="mt-1 text-muted-foreground">
                  {t(`intel.result.${review.status}.description`)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
