/**
 * Bandeja de solicitudes (ADR 0008, sesión 18 = corazón del modo lite).
 * Una solicitud NO es una reserva a medias (ADR 0002): sin inventario, sin precio
 * cerrado. Flujo: nueva → contactada → presupuestada → convertida | perdida.
 */
import { errorMutacion } from '../avisos';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button, EmptyState, SkeletonRows, cn, focusRing, toast } from '@logic-camp/ui';
import {
  D1_REFETCH_MS,
  apiGet,
  apiPatch,
  type Catalog,
  type EnquiryItem,
  type EnquiryStatus,
} from '../api';
import { usePuede } from '../auth';
import { QueryError } from '../components/QueryError';
import { t } from '../i18n';
import { BotonAyuda } from '../components/BotonAyuda';
import { isPinadaScenario, isSerraltaScenario } from '../demo/pinadamar';
import NewBookingPanel from '../components/NewBookingPanel';
import { bookingInitialFromEnquiry } from '../lib/enquiry-conversion';

const isLitePortfolioScenario = isPinadaScenario || isSerraltaScenario;

/** Siguientes pasos naturales por estado (el servidor admite cualquiera; la UI guía). */
const NEXT: Record<EnquiryStatus, EnquiryStatus[]> = {
  new: ['contacted', 'lost'],
  contacted: ['quoted', 'lost'],
  quoted: ['converted', 'lost'],
  converted: [],
  lost: ['new'],
};

const ESTADOS: EnquiryStatus[] = ['new', 'contacted', 'quoted', 'converted', 'lost'];

const fecha = (iso: string) =>
  new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }).format(
    new Date(`${iso.slice(0, 10)}T12:00:00Z`),
  );

/**
 * La rejilla de la fila, en un solo sitio: la usan la cabecera de columnas y la
 * fila, y si vive dos veces se desalinean el día que alguien toque una anchura
 * (la lección de la sidebar de la sesión 38: una fuente, dos vistas).
 *
 * La columna de estado va a ANCHO FIJO, no `auto`. Cada fila es su propia
 * rejilla —son `<button>` sueltos, no un `<table>`—, así que con `auto` la
 * anchura la decidía la palabra del chip de esa fila: «Presupuestada» empujaba
 * la columna «Tipo solicitado» 46 px a la izquierda respecto de «Nueva». Las
 * columnas de esta lista nunca han estado alineadas entre sí; sin cabecera
 * contra la que mirar, no se veía. 104px entran los cinco estados con aire.
 */
const REJILLA =
  'grid w-full grid-cols-[90px_1fr_104px] items-center gap-3 px-4 sm:grid-cols-[90px_170px_1fr_130px_104px]';

/** Misma tipografía que `TableHead` del DS: la cabecera se lee igual en todo el dashboard. */
const CABECERA = 'text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase';

export default function Solicitudes() {
  const qc = useQueryClient();
  const puedeGestionar = usePuede('enquiry:manage');
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<EnquiryStatus | 'todas'>('todas');
  const [abierta, setAbierta] = useState<string | null>(null);
  const [convirtiendo, setConvirtiendo] = useState<EnquiryItem | null>(null);
  const conversionOpenerRef = useRef<HTMLElement | null>(null);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['enquiries'],
    queryFn: () => apiGet<{ items: EnquiryItem[] }>('/api/admin/enquiries'),
    refetchInterval: D1_REFETCH_MS,
  });
  const { data: catalog } = useQuery({
    queryKey: ['catalog'],
    queryFn: () => apiGet<Catalog>('/api/admin/catalog'),
    staleTime: 5 * 60_000,
  });

  const cambiar = useMutation({
    mutationFn: (input: { id: string; status: EnquiryStatus }) =>
      apiPatch<{
        id: string;
        status: EnquiryStatus;
        convertedBookingId?: string | null;
        booking?: { dateFrom: string; unitId: string | null } | null;
      }>(`/api/admin/enquiries/${input.id}`, { status: input.status }),
    onSuccess: (result, input) => {
      toast.success(
        `${t('sol.cambiada', { estado: t(`sol.${input.status}`) })}${isLitePortfolioScenario ? ` ${t('demo.cambioLocal')}` : ''}`,
      );
      void qc.invalidateQueries({ queryKey: ['enquiries'] });
      void qc.invalidateQueries({ queryKey: ['planning'] });
      if (isLitePortfolioScenario && result.convertedBookingId && result.booking) {
        void navigate({
          to: '/planning',
          search: { date: result.booking.dateFrom, unit: result.booking.unitId ?? undefined },
        });
      }
    },
    onError: (e) => errorMutacion(e, t('sol.cambioError')),
  });

  const items = data?.items ?? [];
  const porEstado = new Map<EnquiryStatus, number>();
  for (const e of items) porEstado.set(e.status, (porEstado.get(e.status) ?? 0) + 1);
  const visibles = filtro === 'todas' ? items : items.filter((e) => e.status === filtro);

  const tipoNombre = (id: string | null) =>
    id
      ? (catalog?.unitTypes.find((ut) => ut.id === id)?.nameI18n.es ?? id)
      : t('sol.cualquierTipo');

  return (
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* filtros por estado, con recuento — la bandeja se lee de un vistazo */}
        <div className="flex items-center gap-2 border-b border-border/60 px-2 py-2 md:px-4 md:py-2.5">
          <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-x-auto md:flex-wrap md:overflow-visible">
            <Button
              variant={filtro === 'todas' ? 'primary' : 'outline'}
              size="xs"
              onClick={() => setFiltro('todas')}
              aria-pressed={filtro === 'todas'}
              className="h-11 shrink-0 md:h-7"
            >
              {t('sol.todas')} · {items.length}
            </Button>
            {ESTADOS.map((s) => (
              <Button
                key={s}
                variant={filtro === s ? 'primary' : 'outline'}
                size="xs"
                onClick={() => setFiltro(s)}
                aria-pressed={filtro === s}
                className="h-11 shrink-0 md:h-7"
              >
                {t(`sol.${s}`)} · {porEstado.get(s) ?? 0}
              </Button>
            ))}
          </div>
          <p className="tnum ml-auto hidden text-[12px] text-muted-foreground md:block">
            {t('sol.n', { n: visibles.length })}
          </p>
          <BotonAyuda className="size-11 shrink-0 md:size-7" />
        </div>

        {isPending && (
          /* Misma rejilla que la fila real: fecha · nombre · fechas · tipo · estado. */
          <div aria-busy="true" aria-label={t('sol.cargando')}>
            <SkeletonRows rows={7} cols={['w-14', 'w-32', 'w-44', 'w-28', 'w-16']} />
          </div>
        )}
        {isError && <QueryError error={error} onRetry={() => refetch()} />}
        {!isPending && !isError && visibles.length === 0 && (
          <EmptyState
            art="inbox"
            title={t('sol.vacio')}
            /* Salida: si el vacío lo ha causado el filtro, se puede quitar. */
            action={
              filtro !== 'todas' ? (
                <Button variant="outline" size="sm" onClick={() => setFiltro('todas')}>
                  {t('sol.verTodas')}
                </Button>
              ) : undefined
            }
          />
        )}

        {/*
        Cabecera de columnas. Las claves `sol.recibida`/`sol.fechas`/`sol.tipo`
        llevaban desde la sesión 18 en el diccionario sin que las usara nadie: no
        sobraba la clave, faltaba la UI (el mismo hallazgo que Pagos y
        Notificaciones en la 52). Va `aria-hidden` a propósito — las filas son
        `<button>`, no celdas, así que el lector de pantalla ya lee cada valor
        dentro de su fila y esto solo añadiría una hilera suelta de palabras.
      */}
        {!isPending && !isError && visibles.length > 0 && (
          <div
            aria-hidden="true"
            className={cn(REJILLA, CABECERA, 'border-b border-border/60 py-2')}
          >
            <span>{t('sol.recibida')}</span>
            <span>{t('sol.contacto')}</span>
            <span className="hidden sm:block">{t('sol.fechas')}</span>
            <span className="hidden sm:block">{t('sol.tipo')}</span>
            <span className="justify-self-end">{t('res.estado')}</span>
          </div>
        )}

        <ul className="min-h-0 flex-1 divide-y divide-border/40 overflow-y-auto">
          {visibles.map((e) => {
            const pax = e.occupancy ? e.occupancy.adults + e.occupancy.childrenAges.length : null;
            const abiertaEsta = abierta === e.id;
            return (
              <li key={e.id}>
                {/*
                Fila resumen clicable para expandir el detalle. Se queda como
                <button> nativo: la fila ES la rejilla de 5 columnas y <Button>
                del DS es `inline-flex`, así que convertirla rompería la
                maquetación (ADR 0020, C2 — excepción de "fila entera clicable").
                Lleva el mismo anillo de foco que `buttonVariants`.
              */}
                <button
                  type="button"
                  onClick={() => setAbierta(abiertaEsta ? null : e.id)}
                  aria-expanded={abiertaEsta}
                  className={cn(
                    REJILLA,
                    'min-h-11 rounded-md py-2.5 text-left text-[13px] hover:bg-accent/50',
                    focusRing,
                  )}
                >
                  <span className="tnum text-muted-foreground">{fecha(e.createdAt)}</span>
                  <span className="truncate font-medium">{e.contact.name}</span>
                  <span className="tnum hidden truncate text-muted-foreground sm:block">
                    {e.dateFrom && e.dateTo
                      ? `${fecha(e.dateFrom)} → ${fecha(e.dateTo)}${pax ? ` · ${t('planning.pax', { n: pax })}` : ''}`
                      : t('sol.sinFechas')}
                  </span>
                  <span className="hidden truncate text-muted-foreground sm:block">
                    {tipoNombre(e.unitTypeId)}
                  </span>
                  <span className={`lc-chip sol-${e.status} justify-self-end`}>
                    {t(`sol.${e.status}`)}
                  </span>
                </button>

                {abiertaEsta && (
                  <div className="grid gap-3 bg-accent/40 px-4 py-3 text-[13px] sm:grid-cols-2">
                    <div>
                      <h3 className="lc-panel-h">{t('sol.mensaje')}</h3>
                      <p className="whitespace-pre-line">{e.message}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div>
                        <h3 className="lc-panel-h">{t('sol.contacto')}</h3>
                        <p className="font-medium">{e.contact.name}</p>
                        <p>
                          <a
                            href={`mailto:${e.contact.email}`}
                            className="inline-flex min-h-11 items-center text-link underline md:min-h-0"
                          >
                            {e.contact.email}
                          </a>
                        </p>
                        {e.contact.phone && (
                          <p>
                            <a
                              href={`tel:${e.contact.phone}`}
                              className="tnum inline-flex min-h-11 items-center text-link underline md:min-h-0"
                            >
                              {e.contact.phone}
                            </a>
                          </p>
                        )}
                        <p className="mt-1 text-muted-foreground">
                          {t('sol.idioma')}: {e.locale.toUpperCase()} · {t('sol.origen')}:{' '}
                          {e.source}
                        </p>
                      </div>
                      {puedeGestionar && NEXT[e.status].length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {(isLitePortfolioScenario && e.status === 'contacted'
                            ? (['converted', 'lost'] as EnquiryStatus[])
                            : NEXT[e.status]
                          ).map((s) => (
                            <Button
                              key={s}
                              size="xs"
                              variant={s === 'lost' ? 'destructiveOutline' : 'primary'}
                              disabled={cambiar.isPending}
                              onClick={(event) => {
                                if (s === 'converted' && !isLitePortfolioScenario) {
                                  conversionOpenerRef.current = event.currentTarget;
                                  setConvirtiendo(e);
                                  return;
                                }
                                cambiar.mutate({ id: e.id, status: s });
                              }}
                              className="min-h-11 md:min-h-7"
                            >
                              {t(`accionSol.${s}`)}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      {puedeGestionar && convirtiendo && (
        <NewBookingPanel
          initial={bookingInitialFromEnquiry(convirtiendo)}
          onClose={() => {
            setConvirtiendo(null);
            requestAnimationFrame(() => conversionOpenerRef.current?.focus());
          }}
          onCreated={(id) => {
            setConvirtiendo(null);
            void navigate({ to: '/reservas/$id', params: { id } });
          }}
        />
      )}
    </div>
  );
}
