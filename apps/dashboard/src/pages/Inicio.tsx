/**
 * Portada del gestor de camping (sesión 65).
 *
 * Antes, entrar al gestor te dejaba directamente en el planning: la pantalla más
 * densa del producto, sin contexto y sin ninguna pista de que detrás hubiera
 * trece módulos más. Al que abre el programa por primera vez —y al prospecto que
 * entra en la demo— le pasaba lo mismo que en la web: veía una cara y se perdía
 * el resto.
 *
 * Tres bloques, en el orden en que se miran: cómo va HOY (cifras), qué hay
 * (rejilla de módulos) y qué ha entrado sin que estuvieras (solicitudes).
 *
 * Sin API nueva: se compone de `/reports` (dos rangos) y `/enquiries`, que ya
 * existían y que el rol `demo` puede leer — comprobado, porque el visitante
 * anónimo de la demo es justo quien más va a ver esta pantalla.
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton, cn, focusRing } from '@logic-camp/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { apiGet, type EnquiryItem, type ReportsData } from '../api';
import { QueryError } from '../components/QueryError';
import { t } from '../i18n';
import { eur } from '../lib/format';
import { NAV_GROUPS } from '../lib/nav';

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Hoy y mañana en UTC: el sistema va en UTC y las estancias son fechas sin hora. */
function rangos() {
  const hoy = new Date();
  const y = hoy.getUTCFullYear();
  const m = hoy.getUTCMonth();
  const d = hoy.getUTCDate();
  return {
    hoy: { from: iso(new Date(Date.UTC(y, m, d))), to: iso(new Date(Date.UTC(y, m, d + 1))) },
    mes: { from: iso(new Date(Date.UTC(y, m, 1))), to: iso(new Date(Date.UTC(y, m + 1, 1))) },
  };
}

const fechaCorta = (isoDate: string) =>
  new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }).format(
    new Date(`${isoDate.slice(0, 10)}T12:00:00Z`),
  );

/**
 * Tarjeta de cifra. Misma anatomía que los tiles de Informes (ADR 0020) para que
 * las dos pantallas no se lean como productos distintos: rótulo recesivo arriba,
 * cifra grande, detalle debajo. Con `to`, la tarjeta entera es el enlace.
 */
function Kpi({
  titulo,
  valor,
  detalle,
  to,
  accion,
}: {
  titulo: string;
  valor: string;
  detalle?: string;
  to?: string;
  accion?: string;
}) {
  const cuerpo = (
    <CardHeader className="gap-0.5 px-4 py-3">
      {/* dos líneas reservadas: un rótulo que parte no hunde su cifra respecto
          de las vecinas (la corrección de Informes en la sesión 58) */}
      <CardDescription className="min-h-[2lh] text-[11px] leading-snug font-semibold tracking-[0.1em] uppercase">
        {titulo}
      </CardDescription>
      {/* A 375px en dos columnas, un importe como «15.848,35 €» a 26px toca el
          borde de su tarjeta: la cifra arranca más pequeña y crece con el hueco. */}
      <CardTitle className="tnum text-[21px] leading-tight sm:text-[26px]">{valor}</CardTitle>
      <p className="tnum min-h-[1lh] text-[12px] text-muted-foreground">{detalle ?? ''}</p>
      {to && accion && (
        <span className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-primary">
          {accion}
          <ArrowRight className="size-3" aria-hidden />
        </span>
      )}
    </CardHeader>
  );
  if (!to) return <Card>{cuerpo}</Card>;
  return (
    <Card className="transition-colors hover:border-primary/40">
      <Link to={to} className={cn('block rounded-(--radius)', focusRing)}>
        {cuerpo}
      </Link>
    </Card>
  );
}

function KpiEsqueleto() {
  return (
    <Card>
      <CardHeader className="gap-0.5 px-4 py-3">
        <div className="min-h-[2lh]">
          <Skeleton className="h-2.5 w-24" />
        </div>
        <Skeleton className="h-6 w-20" />
        <div className="min-h-[1lh]">
          <Skeleton className="h-2.5 w-28" />
        </div>
      </CardHeader>
    </Card>
  );
}

export default function Inicio() {
  const { hoy, mes } = rangos();

  const qHoy = useQuery({
    queryKey: ['reports', hoy.from, hoy.to],
    queryFn: () => apiGet<ReportsData>(`/api/admin/reports?from=${hoy.from}&to=${hoy.to}`),
  });
  const qMes = useQuery({
    queryKey: ['reports', mes.from, mes.to],
    queryFn: () => apiGet<ReportsData>(`/api/admin/reports?from=${mes.from}&to=${mes.to}`),
  });
  const qSol = useQuery({
    queryKey: ['enquiries'],
    queryFn: () => apiGet<{ items: EnquiryItem[] }>('/api/admin/enquiries'),
  });

  // Ocupación de hoy: unidades ocupadas sobre el parque entero. `occupancy` viene
  // por tipo y en NOCHES; como el rango es de una sola noche, noches = unidades.
  const ocup = qHoy.data?.occupancy ?? [];
  const ocupadas = ocup.reduce((n, o) => n + o.occupiedNights, 0);
  const totales = ocup.reduce((n, o) => n + o.units, 0);
  const pct = totales > 0 ? Math.round((ocupadas / totales) * 100) : 0;

  const rev = qMes.data?.revenue;
  const pendiente = rev ? rev.totalCents - rev.paidCents : 0;

  // Las cinco más recientes: `/enquiries` ya llega ordenado por fecha descendente.
  const solicitudes = (qSol.data?.items ?? []).slice(0, 5);

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 p-4 sm:p-6">
        {/* ---------- cifras del día ---------- */}
        <section>
          <h1 className="font-display text-[20px] font-semibold">{t('ini.titulo')}</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{t('ini.saludo')}</p>

          {qHoy.isError ? (
            <div className="mt-4">
              <QueryError error={qHoy.error} onRetry={() => void qHoy.refetch()} />
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {qHoy.isPending || qMes.isPending ? (
                Array.from({ length: 4 }, (_, i) => <KpiEsqueleto key={i} />)
              ) : (
                <>
                  <Kpi
                    titulo={t('ini.kpi.ocupacion')}
                    valor={`${pct}%`}
                    detalle={t('ini.kpi.unidadesOcupadas')
                      .replace('{n}', String(ocupadas))
                      .replace('{total}', String(totales))}
                    to="/planning"
                    accion={t('ini.kpi.verPlanning')}
                  />
                  <Kpi
                    titulo={t('ini.kpi.llegadas')}
                    valor={String(qHoy.data?.arrivals ?? 0)}
                    to="/llegadas"
                    accion={t('ini.kpi.verLlegadas')}
                  />
                  <Kpi
                    titulo={t('ini.kpi.salidas')}
                    valor={String(qHoy.data?.departures ?? 0)}
                    to="/llegadas"
                    accion={t('ini.kpi.verLlegadas')}
                  />
                  <Kpi
                    titulo={t('ini.kpi.pendiente')}
                    valor={eur(pendiente)}
                    detalle={t('ini.kpi.pendienteDetalle').replace(
                      '{total}',
                      eur(rev?.totalCents ?? 0),
                    )}
                    to="/informes"
                    accion={t('ini.kpi.verInformes')}
                  />
                </>
              )}
            </div>
          )}
        </section>

        {/* ---------- la rejilla de módulos ---------- */}
        <section>
          <h2 className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            {t('ini.modulos')}
          </h2>
          <div className="mt-3 flex flex-col gap-5">
            {NAV_GROUPS.map((grupo) => (
              <div key={grupo.label}>
                <h3 className="mb-2 text-[12px] font-medium text-muted-foreground">
                  {t(grupo.label)}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {grupo.items.map(([ruta, rotulo, Icono, frase]) => (
                    <Card key={ruta} className="transition-colors hover:border-primary/40">
                      <Link
                        to={ruta}
                        className={cn('block rounded-(--radius) p-4', focusRing)}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-(--radius) bg-primary/10 text-primary">
                            <Icono className="size-4" aria-hidden />
                          </span>
                          <span className="font-medium">{t(rotulo)}</span>
                        </span>
                        <span className="mt-2 block text-[13px] leading-snug text-muted-foreground">
                          {t(frase)}
                        </span>
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- lo que ha entrado solo ---------- */}
        <section>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              {t('ini.solicitudes')}
            </h2>
            <Link
              to="/solicitudes"
              className={cn('rounded-(--radius) text-[13px] font-medium text-primary', focusRing)}
            >
              {t('ini.solicitudesTodas')} →
            </Link>
          </div>

          <Card className="mt-3">
            <CardContent className="p-0">
              {qSol.isError ? (
                <div className="p-4">
                  <QueryError error={qSol.error} onRetry={() => void qSol.refetch()} />
                </div>
              ) : qSol.isPending ? (
                <ul className="divide-y divide-border">
                  {Array.from({ length: 3 }, (_, i) => (
                    <li key={i} className="flex items-center gap-3 px-4 py-3">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-40" />
                      <Skeleton className="ml-auto h-4 w-20" />
                    </li>
                  ))}
                </ul>
              ) : solicitudes.length === 0 ? (
                <p className="px-4 py-6 text-center text-[13px] text-muted-foreground">
                  {t('ini.solicitudesVacio')}
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {solicitudes.map((s) => (
                    <li key={s.id}>
                      <Link
                        to="/solicitudes"
                        className={cn(
                          'grid w-full grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5 px-4 py-3 text-left transition-colors hover:bg-muted/50 sm:grid-cols-[150px_1fr_104px]',
                          focusRing,
                        )}
                      >
                        <span className="truncate font-medium">{s.contact.name}</span>
                        <span className="tnum truncate text-[13px] text-muted-foreground">
                          {s.dateFrom && s.dateTo
                            ? `${fechaCorta(s.dateFrom)} – ${fechaCorta(s.dateTo)}`
                            : t('ini.sinFechas')}
                        </span>
                        <span className={`lc-chip sol-${s.status} justify-self-end`}>
                          {t(`sol.${s.status}`)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
