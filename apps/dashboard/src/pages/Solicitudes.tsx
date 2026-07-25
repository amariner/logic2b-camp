/**
 * Bandeja de solicitudes (ADR 0008, sesión 18 = corazón del modo lite).
 * Una solicitud NO es una reserva a medias (ADR 0002): sin inventario, sin precio
 * cerrado. Flujo: nueva → contactada → presupuestada → convertida | perdida.
 */
import { errorMutacion } from '../avisos';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button, EmptyState, SkeletonRows, cn, focusRing, toast } from '@logic-camp/ui';
import { apiGet, apiPatch, type Catalog, type EnquiryItem, type EnquiryStatus } from '../api';
import { QueryError } from '../components/QueryError';
import { t } from '../i18n';
import { BotonAyuda } from '../components/BotonAyuda';

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

export default function Solicitudes() {
  const qc = useQueryClient();
  const [filtro, setFiltro] = useState<EnquiryStatus | 'todas'>('todas');
  const [abierta, setAbierta] = useState<string | null>(null);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['enquiries'],
    queryFn: () => apiGet<{ items: EnquiryItem[] }>('/api/admin/enquiries'),
    refetchInterval: 60_000,
  });
  const { data: catalog } = useQuery({
    queryKey: ['catalog'],
    queryFn: () => apiGet<Catalog>('/api/admin/catalog'),
    staleTime: 5 * 60_000,
  });

  const cambiar = useMutation({
    mutationFn: (input: { id: string; status: EnquiryStatus }) =>
      apiPatch(`/api/admin/enquiries/${input.id}`, { status: input.status }),
    onSuccess: (_d, input) => {
      toast.success(t('sol.cambiada', { estado: t(`sol.${input.status}`) }));
      void qc.invalidateQueries({ queryKey: ['enquiries'] });
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
    <div className="flex h-full flex-col">
      {/* filtros por estado, con recuento — la bandeja se lee de un vistazo */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-1">
          <Button
            variant={filtro === 'todas' ? 'primary' : 'outline'}
            size="xs"
            onClick={() => setFiltro('todas')}
            aria-pressed={filtro === 'todas'}
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
            >
              {t(`sol.${s}`)} · {porEstado.get(s) ?? 0}
            </Button>
          ))}
        </div>
        <p className="tnum ml-auto text-[12px] text-muted-foreground">
          {t('sol.n', { n: visibles.length })}
        </p>
        <BotonAyuda />
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
                  'grid w-full grid-cols-[90px_1fr_auto] items-center gap-3 rounded-md px-4 py-2.5 text-left text-[13px] hover:bg-accent/50 sm:grid-cols-[90px_170px_1fr_130px_auto]',
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
                        <a href={`mailto:${e.contact.email}`} className="text-link underline">
                          {e.contact.email}
                        </a>
                      </p>
                      {e.contact.phone && (
                        <p>
                          <a href={`tel:${e.contact.phone}`} className="tnum text-link underline">
                            {e.contact.phone}
                          </a>
                        </p>
                      )}
                      <p className="mt-1 text-muted-foreground">
                        {t('sol.idioma')}: {e.locale.toUpperCase()} · {t('sol.origen')}: {e.source}
                      </p>
                    </div>
                    {NEXT[e.status].length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {NEXT[e.status].map((s) => (
                          <Button
                            key={s}
                            size="xs"
                            variant={s === 'lost' ? 'destructiveOutline' : 'primary'}
                            disabled={cambiar.isPending}
                            onClick={() => cambiar.mutate({ id: e.id, status: s })}
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
  );
}
