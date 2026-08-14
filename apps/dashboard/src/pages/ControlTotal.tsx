import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
  toast,
} from '@logic-camp/ui';
import { Link, Navigate, useRouterState } from '@tanstack/react-router';
import {
  Banknote,
  BedDouble,
  BellRing,
  BrainCircuit,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  Gauge,
  MessageSquareText,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  SprayCan,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useReducer } from 'react';
import { BotonAyuda } from '../components/BotonAyuda';
import {
  CONTROL_TOTAL_RESET_EVENT,
  CONTROL_TOTAL_STATE_KEY,
  controlTotalFixture as fixture,
  controlTotalHandoverRisks,
  controlTotalPulse,
  initialControlTotalState,
  parseControlTotalModuleKey,
  parseControlTotalState,
  reduceControlTotal,
  type ControlTotalAction,
  type ControlTotalModuleKey,
  type ControlTotalState,
} from '../demo/control-total';
import { t } from '../i18n';

const enabled = import.meta.env.VITE_DEMO_SCENARIO === 'mardefondo';

type Maturity = 'demo' | 'next' | 'future';

const modules: {
  key: ControlTotalModuleKey;
  label: string;
  short: string;
  icon: LucideIcon;
  maturity: Maturity;
}[] = [
  {
    key: 'centro',
    label: t('ct.module.centro'),
    short: t('ct.module.centro.short'),
    icon: Gauge,
    maturity: 'demo',
  },
  {
    key: 'limpieza',
    label: t('ct.module.limpieza'),
    short: t('ct.module.limpieza'),
    icon: SprayCan,
    maturity: 'demo',
  },
  {
    key: 'mantenimiento',
    label: t('ct.module.mantenimiento'),
    short: t('ct.module.mantenimiento.short'),
    icon: Wrench,
    maturity: 'demo',
  },
  {
    key: 'equipo',
    label: t('ct.module.equipo'),
    short: t('ct.module.equipo.short'),
    icon: Users,
    maturity: 'demo',
  },
  {
    key: 'huesped',
    label: t('ct.module.huesped'),
    short: t('ct.module.huesped.short'),
    icon: MessageSquareText,
    maturity: 'next',
  },
  {
    key: 'reservas-grupos',
    label: t('ct.module.grupos'),
    short: t('ct.module.grupos.short'),
    icon: BedDouble,
    maturity: 'next',
  },
  {
    key: 'ingresos',
    label: t('ct.module.ingresos'),
    short: t('ct.module.ingresos.short'),
    icon: CircleDollarSign,
    maturity: 'future',
  },
  {
    key: 'inteligencia',
    label: t('ct.module.inteligencia'),
    short: t('ct.module.inteligencia.short'),
    icon: BrainCircuit,
    maturity: 'future',
  },
];

function loadState() {
  try {
    return parseControlTotalState(localStorage.getItem(CONTROL_TOTAL_STATE_KEY));
  } catch {
    return initialControlTotalState();
  }
}

function StatusBadge({ maturity }: { maturity: Maturity }) {
  const active = maturity === 'demo';
  return (
    <Badge
      variant={active ? 'default' : 'outline'}
      className={cn(!active && 'text-muted-foreground')}
    >
      {t(`ct.status.${maturity}`)}
    </Badge>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card>
      <CardContent className="px-4 py-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="tnum mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function handoverStateLabel(state: ControlTotalState['handover']): string {
  return t(`ct.handover.state.${state}`);
}

function FlowSteps({
  steps,
  current,
}: {
  steps: { key: string; label: string }[];
  current: string;
}) {
  const activeIndex = steps.findIndex((step) => step.key === current);
  return (
    <ol className="grid gap-2 sm:grid-cols-4" aria-label={t('ct.flow.aria')}>
      {steps.map((step, index) => (
        <li
          key={step.key}
          className={cn(
            'flex min-h-11 items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium',
            index <= activeIndex
              ? 'border-primary/35 bg-primary/5 text-foreground'
              : 'text-muted-foreground',
          )}
        >
          <span
            className={cn(
              'grid size-5 shrink-0 place-items-center rounded-full border text-[10px]',
              index <= activeIndex && 'border-primary bg-primary text-primary-foreground',
            )}
          >
            {index < activeIndex ? <Check className="size-3" /> : index + 1}
          </span>
          {step.label}
        </li>
      ))}
    </ol>
  );
}

function ActionButton({
  action,
  dispatch,
  children,
}: {
  action: ControlTotalAction;
  dispatch: React.Dispatch<ControlTotalAction>;
  children: React.ReactNode;
}) {
  return (
    <Button
      className="min-h-11 md:min-h-9"
      onClick={() => {
        dispatch(action);
        toast.success(t('ct.toast.local'));
      }}
    >
      {children}
      <ChevronRight className="size-4" />
    </Button>
  );
}

function Operations({ state }: { state: ControlTotalState }) {
  const pulse = controlTotalPulse(state);
  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label={t('ct.metric.occupancy')}
          value={`${fixture.pulse.occupancyPct} %`}
          detail={t('ct.metric.unitsDate', { units: fixture.units })}
        />
        <Metric
          label={t('ct.metric.movements')}
          value={`${fixture.pulse.arrivals} / ${fixture.pulse.departures}`}
          detail={t('ct.metric.preparations', { count: pulse.preparationAlerts })}
        />
        <Metric
          label={t('ct.metric.blocked')}
          value={String(pulse.blockedUnits)}
          detail={t('ct.metric.blockedHelp')}
        />
        <Metric
          label={t('ct.metric.risks')}
          value={String(pulse.criticalRisks)}
          detail={t(pulse.handoverPending ? 'ct.metric.handoverPending' : 'ct.metric.handoverDone')}
        />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.35fr_.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t('ct.pulse.title')}</CardTitle>
            <CardDescription>{t('ct.pulse.help')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              [
                t('ct.pulse.cleaning'),
                `BL-018 · ${t(state.cleaning === 'validated' ? 'ct.pulse.cleaningDone' : 'ct.pulse.cleaningPending')}`,
                state.cleaning === 'validated',
              ],
              [
                t('ct.pulse.maintenance'),
                `BL-042 · ${t(state.incident === 'reassignment' ? 'ct.pulse.alternative' : 'ct.pulse.impact')}`,
                state.incident === 'reassignment',
              ],
              [
                t('ct.pulse.handover'),
                `${fixture.handover.from} → ${fixture.handover.to} · ${handoverStateLabel(state.handover)}`,
                state.handover === 'acknowledged',
              ],
            ].map(([label, detail, done]) => (
              <div
                key={String(label)}
                className="flex items-start gap-3 rounded-lg border border-border px-4 py-3"
              >
                <span
                  className={cn(
                    'mt-0.5 grid size-7 shrink-0 place-items-center rounded-full',
                    done
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
                  )}
                >
                  {done ? <Check className="size-4" /> : <BellRing className="size-4" />}
                </span>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-sm text-muted-foreground">{detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('ct.horizon.title')}</CardTitle>
            <CardDescription>{t('ct.horizon.help')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex h-36 items-end gap-2" aria-label={t('ct.horizon.aria')}>
              {[81, 84, 87, 91, 93, 89, 86].map((value, index) => (
                <div
                  key={index}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                >
                  <span className="text-[10px] text-muted-foreground">{value}</span>
                  <span
                    className="w-full rounded-t bg-primary/75"
                    style={{ height: `${value}%` }}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{t('ct.horizon.note')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Cleaning({
  state,
  dispatch,
}: {
  state: ControlTotalState;
  dispatch: React.Dispatch<ControlTotalAction>;
}) {
  const steps = [
    { key: 'detected', label: t('ct.cleaning.step.detected') },
    { key: 'assigned', label: t('ct.cleaning.step.assigned') },
    { key: 'ready', label: t('ct.cleaning.step.ready') },
    { key: 'validated', label: t('ct.cleaning.step.validated') },
  ];
  return (
    <div className="grid gap-5">
      <FlowSteps steps={steps} current={state.cleaning} />
      <div className="grid gap-5 lg:grid-cols-[1fr_390px]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <CardTitle>{t('ct.cleaning.rotation', { unit: fixture.cleaning.unit })}</CardTitle>
                <CardDescription>
                  {t('ct.cleaning.schedule', {
                    departure: fixture.cleaning.departure,
                    arrival: fixture.cleaning.nextArrival,
                    minutes: fixture.cleaning.rotationMinutes,
                  })}
                </CardDescription>
              </div>
              <Badge variant="outline">{t('ct.priority.high')}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">{t('ct.cleaning.nextGuest')}</dt>
                <dd className="font-medium">{fixture.cleaning.guest}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t('ct.cleaning.team')}</dt>
                <dd className="font-medium">{fixture.cleaning.assignee}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2">
              {state.cleaning === 'detected' && (
                <ActionButton action={{ type: 'cleaning.assign' }} dispatch={dispatch}>
                  {t('ct.cleaning.assign')}
                </ActionButton>
              )}
              {state.cleaning === 'assigned' && (
                <ActionButton action={{ type: 'cleaning.ready' }} dispatch={dispatch}>
                  {t('ct.cleaning.ready')}
                </ActionButton>
              )}
              {state.cleaning === 'ready' && (
                <ActionButton action={{ type: 'cleaning.validate' }} dispatch={dispatch}>
                  {t('ct.cleaning.validate')}
                </ActionButton>
              )}
              {state.cleaning === 'validated' && (
                <Badge className="min-h-9 px-3">
                  <ShieldCheck className="mr-2 size-4" />
                  {t('ct.cleaning.validated')}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
        <div
          className="mx-auto w-full max-w-[390px] rounded-[2rem] border-[6px] border-foreground/85 bg-background p-3 shadow-xl"
          aria-label={t('ct.cleaning.preview.aria')}
        >
          <div className="flex items-center justify-between border-b border-border px-1 pb-3">
            <span className="text-xs font-semibold">{t('ct.cleaning.preview.title')}</span>
            <span className="text-[10px] text-muted-foreground">
              {t('ct.cleaning.preview.size')}
            </span>
          </div>
          <div className="grid gap-4 py-4">
            <div>
              <p className="text-xs text-muted-foreground">{t('ct.cleaning.preview.next')}</p>
              <p className="mt-1 text-xl font-semibold">{fixture.cleaning.unit}</p>
              <p className="text-sm text-muted-foreground">
                {t('ct.cleaning.preview.arrival', { time: fixture.cleaning.nextArrival })}
              </p>
            </div>
            <div className="grid gap-2">
              {[
                t('ct.cleaning.preview.bedroom'),
                t('ct.cleaning.preview.bathroom'),
                t('ct.cleaning.preview.kitchen'),
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm"
                >
                  <span
                    className={cn(
                      'grid size-5 place-items-center rounded border',
                      state.cleaning === 'ready' || state.cleaning === 'validated' || index === 0
                        ? 'border-primary bg-primary text-primary-foreground'
                        : '',
                    )}
                  >
                    {state.cleaning !== 'detected' &&
                    (index === 0 ||
                      state.cleaning === 'ready' ||
                      state.cleaning === 'validated') ? (
                      <Check className="size-3" />
                    ) : null}
                  </span>
                  {item}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{t('ct.cleaning.preview.note')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Maintenance({
  state,
  dispatch,
}: {
  state: ControlTotalState;
  dispatch: React.Dispatch<ControlTotalAction>;
}) {
  const steps = [
    { key: 'unreported', label: t('ct.incident.step.unreported') },
    { key: 'reported', label: t('ct.incident.step.reported') },
    { key: 'triaged', label: t('ct.incident.step.triaged') },
    { key: 'blocked', label: t('ct.incident.step.blocked') },
    { key: 'reassignment', label: t('ct.incident.step.reassignment') },
  ];
  return (
    <div className="grid gap-5">
      <FlowSteps steps={steps} current={state.incident} />
      <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <CardTitle>
                  {t('ct.incident.title', {
                    unit: fixture.incident.unit,
                    asset: fixture.incident.asset,
                  })}
                </CardTitle>
                <CardDescription>
                  {t('ct.incident.arrival', { time: fixture.incident.nextArrival })}
                </CardDescription>
              </div>
              <Badge variant="outline">{t('ct.incident.impactHigh')}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5">
            <p className="rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed">
              {fixture.incident.finding}
            </p>
            <div className="flex flex-wrap gap-2">
              {state.incident === 'unreported' && (
                <ActionButton action={{ type: 'incident.report' }} dispatch={dispatch}>
                  {t('ct.incident.report')}
                </ActionButton>
              )}
              {state.incident === 'reported' && (
                <ActionButton action={{ type: 'incident.triage' }} dispatch={dispatch}>
                  {t('ct.incident.triage')}
                </ActionButton>
              )}
              {state.incident === 'triaged' && (
                <ActionButton action={{ type: 'incident.block' }} dispatch={dispatch}>
                  {t('ct.incident.block')}
                </ActionButton>
              )}
              {state.incident === 'blocked' && (
                <ActionButton
                  action={{ type: 'incident.prepare-reassignment' }}
                  dispatch={dispatch}
                >
                  {t('ct.incident.prepare')}
                </ActionButton>
              )}
              {state.incident === 'reassignment' && (
                <Badge className="min-h-9 px-3">
                  <ShieldCheck className="mr-2 size-4" />
                  {t('ct.incident.prepared')}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('ct.incident.inventory')}</CardTitle>
            <CardDescription>{t('ct.incident.inventoryHelp')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">{t('ct.incident.affected')}</p>
              <p className="font-medium">
                {fixture.incident.guest} · {fixture.incident.nextArrival}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('ct.incident.alternative')}</p>
              <p className="font-medium">{fixture.incident.alternative}</p>
            </div>
            <div className="rounded-md border border-amber-300/60 bg-amber-50 p-3 text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
              {t('ct.incident.noExecution')}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Team({
  state,
  dispatch,
}: {
  state: ControlTotalState;
  dispatch: React.Dispatch<ControlTotalAction>;
}) {
  const steps = [
    { key: 'collecting', label: t('ct.handover.step.collect') },
    { key: 'reviewed', label: t('ct.handover.step.review') },
    { key: 'prepared', label: t('ct.handover.step.prepare') },
    { key: 'acknowledged', label: t('ct.handover.step.acknowledge') },
  ];
  const risks = controlTotalHandoverRisks(state);
  return (
    <div className="grid gap-5">
      <FlowSteps steps={steps} current={state.handover} />
      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between gap-2">
            <div>
              <CardTitle>
                {t('ct.handover.title', { from: fixture.handover.from, to: fixture.handover.to })}
              </CardTitle>
              <CardDescription>{t('ct.handover.help')}</CardDescription>
            </div>
            <Badge variant="outline">
              {t('ct.handover.nextLead', { name: fixture.handover.nextLead })}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5">
          <ul className="grid gap-2">
            {risks.map((risk, index) => (
              <li
                key={risk}
                className="flex min-h-11 items-center gap-3 rounded-md border border-border px-3 text-sm"
              >
                <span className="tnum text-xs font-semibold text-muted-foreground">
                  0{index + 1}
                </span>
                {risk}
              </li>
            ))}
          </ul>
          <div className="rounded-lg bg-muted/50 p-4 text-sm leading-relaxed">
            <p className="font-medium">{t('ct.handover.summary')}</p>
            <p className="mt-1 text-muted-foreground">{t('ct.handover.summaryBody')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {state.handover === 'collecting' && (
              <ActionButton action={{ type: 'handover.review' }} dispatch={dispatch}>
                {t('ct.handover.review')}
              </ActionButton>
            )}
            {state.handover === 'reviewed' && (
              <ActionButton action={{ type: 'handover.prepare' }} dispatch={dispatch}>
                {t('ct.handover.prepare')}
              </ActionButton>
            )}
            {state.handover === 'prepared' && (
              <ActionButton action={{ type: 'handover.acknowledge' }} dispatch={dispatch}>
                {t('ct.handover.acknowledge')}
              </ActionButton>
            )}
            {state.handover === 'acknowledged' && (
              <Badge className="min-h-9 px-3">
                <Check className="mr-2 size-4" />
                {t('ct.handover.done')}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const scenarioContent: Record<
  Exclude<ControlTotalModuleKey, 'centro' | 'limpieza' | 'mantenimiento' | 'equipo'>,
  {
    title: string;
    intro: string;
    icon: LucideIcon;
    cards: { title: string; value: string; detail: string }[];
    note: string;
  }
> = {
  huesped: {
    title: t('ct.scenario.guest.title'),
    intro: t('ct.scenario.guest.intro'),
    icon: MessageSquareText,
    cards: [
      {
        title: t('ct.scenario.guest.open'),
        value: '12',
        detail: t('ct.scenario.guest.openDetail'),
      },
      {
        title: t('ct.scenario.guest.precheckin'),
        value: '36/47',
        detail: t('ct.scenario.guest.precheckinDetail'),
      },
      {
        title: t('ct.scenario.guest.languages'),
        value: '6',
        detail: t('ct.scenario.guest.languagesDetail'),
      },
    ],
    note: t('ct.scenario.guest.note'),
  },
  'reservas-grupos': {
    title: t('ct.scenario.group.title'),
    intro: t('ct.scenario.group.intro'),
    icon: Building2,
    cards: [
      {
        title: t('ct.scenario.group.units'),
        value: '18',
        detail: t('ct.scenario.group.unitsDetail'),
      },
      {
        title: t('ct.scenario.group.rooming'),
        value: '41/46',
        detail: t('ct.scenario.group.roomingDetail'),
      },
      {
        title: t('ct.scenario.group.balance'),
        value: '4.280 €',
        detail: t('ct.scenario.group.balanceDetail'),
      },
    ],
    note: t('ct.scenario.group.note'),
  },
  ingresos: {
    title: t('ct.scenario.revenue.title'),
    intro: t('ct.scenario.revenue.intro'),
    icon: Banknote,
    cards: [
      {
        title: t('ct.scenario.revenue.value'),
        value: '31.840 €',
        detail: t('ct.scenario.revenue.valueDetail'),
      },
      {
        title: t('ct.scenario.revenue.collected'),
        value: '24.630 €',
        detail: t('ct.scenario.revenue.collectedDetail'),
      },
      {
        title: t('ct.scenario.revenue.open'),
        value: '7.210 €',
        detail: t('ct.scenario.revenue.openDetail'),
      },
    ],
    note: t('ct.scenario.revenue.note'),
  },
  inteligencia: {
    title: t('ct.scenario.intelligence.title'),
    intro: t('ct.scenario.intelligence.intro'),
    icon: BrainCircuit,
    cards: [
      {
        title: t('ct.scenario.intelligence.demand'),
        value: t('ct.scenario.intelligence.high'),
        detail: t('ct.scenario.intelligence.range'),
      },
      {
        title: t('ct.scenario.intelligence.staff'),
        value: '+2',
        detail: t('ct.scenario.intelligence.staffDetail'),
      },
      {
        title: t('ct.scenario.intelligence.anomalies'),
        value: '3',
        detail: t('ct.scenario.intelligence.anomaliesDetail'),
      },
    ],
    note: t('ct.scenario.intelligence.note'),
  },
};

function Scenario({ module }: { module: keyof typeof scenarioContent }) {
  const content = scenarioContent[module];
  const Icon = content.icon;
  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader>
          <div className="flex gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <div>
              <CardTitle>{content.title}</CardTitle>
              <CardDescription className="mt-1 max-w-3xl">{content.intro}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {content.cards.map((card) => (
              <Metric key={card.title} label={card.title} value={card.value} detail={card.detail} />
            ))}
          </div>
          <div className="mt-5 rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            <Sparkles className="mr-2 inline size-4 text-primary" />
            {content.note}
          </div>
          {module === 'inteligencia' && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to="/automatiza"
                className="inline-flex min-h-10 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-accent"
              >
                {t('ct.scenario.openAutomatiza')}
              </Link>
              <Link
                to="/inteligente"
                className="inline-flex min-h-10 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-accent"
              >
                {t('ct.scenario.openInteligente')}
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ControlTotal() {
  const pathname = useRouterState({ select: (router) => router.location.pathname });
  const active = parseControlTotalModuleKey(pathname.split('/')[2]);
  const current = modules.find((module) => module.key === active)!;
  const [state, dispatch] = useReducer(reduceControlTotal, undefined, loadState);

  useEffect(() => {
    try {
      localStorage.setItem(CONTROL_TOTAL_STATE_KEY, JSON.stringify(state));
    } catch {
      /* La demo sigue viva en memoria. */
    }
  }, [state]);
  useEffect(() => {
    const reset = () => dispatch({ type: 'reset' });
    window.addEventListener(CONTROL_TOTAL_RESET_EVENT, reset);
    return () => window.removeEventListener(CONTROL_TOTAL_RESET_EVENT, reset);
  }, []);

  if (!enabled) return <Navigate to="/" replace />;

  return (
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 z-20 border-b border-amber-300/60 bg-amber-50/95 px-4 py-2 text-amber-950 backdrop-blur dark:bg-amber-950/95 dark:text-amber-100">
        <div className="mx-auto flex max-w-7xl items-center gap-2 text-xs">
          <ShieldCheck className="size-4 shrink-0" />
          <strong>{t('ct.banner.title')}</strong>
          <span>{t('ct.banner.body')}</span>
        </div>
      </div>
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7">
        <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>
                <Sparkles className="mr-1 size-3" />
                {t('ct.badge')}
              </Badge>
              <span className="text-xs text-muted-foreground">{t('ct.scenario')}</span>
            </div>
            <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {current.label}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('ct.intro')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge maturity={current.maturity} />
            <BotonAyuda className="size-11 shrink-0 md:size-10" />
            <Button
              className="min-h-11 shrink-0 md:min-h-8"
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: 'reset' })}
            >
              <RotateCcw className="size-4" />
              {t('ct.reset')}
            </Button>
          </div>
        </header>

        <nav
          className="-mx-4 overflow-x-auto border-b border-border px-4 sm:-mx-6 sm:px-6"
          aria-label={t('ct.nav.aria')}
        >
          <div className="flex w-max gap-1 py-3">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.key}
                  to={`/control-total/${module.key}` as '/control-total/$section'}
                  params={{ section: module.key }}
                  aria-current={active === module.key ? 'page' : undefined}
                  className={cn(
                    'inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground',
                    active === module.key && 'bg-accent font-medium text-foreground',
                  )}
                >
                  <Icon className="size-4" />
                  {module.short}
                </Link>
              );
            })}
          </div>
        </nav>

        <main className="py-5">
          {active === 'centro' && <Operations state={state} />}
          {active === 'limpieza' && <Cleaning state={state} dispatch={dispatch} />}
          {active === 'mantenimiento' && <Maintenance state={state} dispatch={dispatch} />}
          {active === 'equipo' && <Team state={state} dispatch={dispatch} />}
          {(active === 'huesped' ||
            active === 'reservas-grupos' ||
            active === 'ingresos' ||
            active === 'inteligencia') && <Scenario module={active} />}
        </main>
      </div>
    </div>
  );
}
