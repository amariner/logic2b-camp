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
import { apiGet, type BookingListItem, type EnquiryItem, type ReportsData } from '../api';
import { useRol } from '../auth';
import { QueryError } from '../components/QueryError';
import { t } from '../i18n';
import { eur } from '../lib/format';
import { navGroupsForRole } from '../lib/nav';

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

/**
 * Una de las tres listas del día. Las tres comparten cabecera, esqueleto, vacío
 * y error: si vivieran por separado, la de solicitudes acabaría con un estado
 * vacío distinto del de entradas el día que alguien toque una — el mismo motivo
 * por el que la rejilla de las listas vive en una constante (sesiones 55 y 59).
 *
 * Lo único que cambia por lista es CÓMO se pinta la fila, así que eso es lo que
 * se recibe: las tres columnas son `[nombre, dato, estado]`, y la del medio se
 * encoge antes que el nombre.
 */
function Panel<T extends { id: string }>({
  titulo,
  to,
  enlace,
  query,
  filas,
  fila,
  vacio,
}: {
  titulo: string;
  to: string;
  enlace: string;
  query: { isPending: boolean; isError: boolean; error: unknown; refetch: () => unknown };
  filas: T[];
  fila: (item: T) => React.ReactNode;
  vacio: string;
}) {
  return (
    <section className="flex min-w-0 flex-col">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          {titulo}
        </h2>
        <Link
          to={to}
          className={cn(
            'shrink-0 rounded-(--radius) text-[13px] font-medium text-primary',
            focusRing,
          )}
        >
          {enlace} →
        </Link>
      </div>

      <Card className="mt-3 flex-1">
        <CardContent className="p-0">
          {query.isError ? (
            <div className="p-4">
              <QueryError error={query.error} onRetry={() => void query.refetch()} />
            </div>
          ) : query.isPending ? (
            <ul className="divide-y divide-border">
              {Array.from({ length: 3 }, (_, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="ml-auto h-4 w-16" />
                </li>
              ))}
            </ul>
          ) : filas.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-muted-foreground">{vacio}</p>
          ) : (
            <ul className="divide-y divide-border">
              {filas.map((item) => (
                <li key={item.id}>
                  <Link
                    to={to}
                    className={cn(
                      'grid w-full grid-cols-[minmax(0,1fr)_minmax(0,auto)_auto] items-center gap-x-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/50',
                      focusRing,
                    )}
                  >
                    {fila(item)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export default function Inicio() {
  const { hoy, mes } = rangos();
  const navGroups = navGroupsForRole(useRol());

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
  // Mismas claves que la pantalla de Llegadas: al saltar de aquí a `/llegadas`
  // la lista ya está en caché y no parpadea.
  const qEntradas = useQuery({
    queryKey: ['bookings', 'arrivals', hoy.from],
    queryFn: () =>
      apiGet<{ items: BookingListItem[] }>(
        `/api/admin/bookings?arrivalsOn=${hoy.from}&pageSize=100`,
      ),
  });
  const qSalidas = useQuery({
    queryKey: ['bookings', 'departures', hoy.from],
    queryFn: () =>
      apiGet<{ items: BookingListItem[] }>(
        `/api/admin/bookings?departuresOn=${hoy.from}&pageSize=100`,
      ),
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
  // Canceladas fuera: no llegan ni salen (mismo criterio que `Llegadas`).
  const vivas = (items?: BookingListItem[]) =>
    (items ?? []).filter((b) => b.status !== 'cancelled');
  const entradas = vivas(qEntradas.data?.items).slice(0, 5);
  const salidas = vivas(qSalidas.data?.items).slice(0, 5);

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
            {navGroups.map((grupo) => (
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

        {/* ---------- las tres listas del día, en paralelo ----------
           Entradas y salidas son la operación de HOY; solicitudes es lo que ha
           entrado sin que estuvieras. Las tres caben de un vistazo y cada una
           sale a su pantalla. Debajo de `xl` se apilan: tres columnas a 1024px
           dejarían los nombres en un acordeón ilegible. */}
        <section className="grid gap-4 xl:grid-cols-3">
          <Panel
            titulo={t('ini.entradas')}
            to="/llegadas"
            enlace={t('ini.verTodas')}
            query={qEntradas}
            vacio={t('ini.entradasVacio')}
            filas={entradas}
            fila={(b) => (
              <>
                <span className="truncate font-medium">{b.leadName ?? b.code}</span>
                <span className="tnum truncate text-[13px] text-muted-foreground">
                  {b.unitCode ?? t('dia.sinUnidad')}
                </span>
                {b.checkedInAt ? (
                  <span className="lc-chip sol-converted justify-self-end">
                    {t('ini.dentro')}
                  </span>
                ) : (
                  <span className="justify-self-end text-[12px] text-muted-foreground">
                    {t('ini.porLlegar')}
                  </span>
                )}
              </>
            )}
          />
          <Panel
            titulo={t('ini.salidas')}
            to="/llegadas"
            enlace={t('ini.verTodas')}
            query={qSalidas}
            vacio={t('ini.salidasVacio')}
            filas={salidas}
            fila={(b) => (
              <>
                <span className="truncate font-medium">{b.leadName ?? b.code}</span>
                <span className="tnum truncate text-[13px] text-muted-foreground">
                  {b.unitCode ?? t('dia.sinUnidad')}
                </span>
                {/* Mismo criterio que en entradas: el chip marca lo que YA pasó
                   por recepción y el gris es el estado por defecto. Al revés,
                   una mañana normal —hoy: 10 salidas, 0 con check-out— son diez
                   chips idénticos gritando, que es ruido, no información. */}
                {b.checkedOutAt ? (
                  <span className="lc-chip sol-converted justify-self-end">{t('ini.fuera')}</span>
                ) : (
                  <span className="justify-self-end text-[12px] text-muted-foreground">
                    {t('ini.porSalir')}
                  </span>
                )}
              </>
            )}
          />
          <Panel
            titulo={t('ini.solicitudes')}
            to="/solicitudes"
            enlace={t('ini.solicitudesTodas')}
            query={qSol}
            vacio={t('ini.solicitudesVacio')}
            filas={solicitudes}
            fila={(e) => (
              <>
                <span className="truncate font-medium">{e.contact.name}</span>
                <span className="tnum truncate text-[13px] text-muted-foreground">
                  {e.dateFrom && e.dateTo
                    ? `${fechaCorta(e.dateFrom)} – ${fechaCorta(e.dateTo)}`
                    : t('ini.sinFechas')}
                </span>
                <span className={`lc-chip sol-${e.status} justify-self-end`}>
                  {t(`sol.${e.status}`)}
                </span>
              </>
            )}
          />
        </section>
      </div>
    </div>
  );
}
