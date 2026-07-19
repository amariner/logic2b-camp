/**
 * Bandeja de solicitudes (ADR 0008, sesión 18 = corazón del modo lite).
 * Una solicitud NO es una reserva a medias (ADR 0002): sin inventario, sin precio
 * cerrado. Flujo: nueva → contactada → presupuestada → convertida | perdida.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiGet, apiPatch, type Catalog, type EnquiryItem, type EnquiryStatus } from '../api';
import { t } from '../i18n';

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
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const { data, isPending, isError } = useQuery({
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
      setMsg({ text: t('sol.cambiada', { estado: t(`sol.${input.status}`) }) });
      void qc.invalidateQueries({ queryKey: ['enquiries'] });
    },
    onError: () => setMsg({ text: t('sol.cambioError'), error: true }),
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
      <div className="flex flex-wrap items-center gap-2 border-b border-arena/60 px-4 py-2.5">
        <div className="flex flex-wrap items-center overflow-hidden rounded-(--lc-radius) border border-tinta/20 text-[13px] font-medium">
          <button
            type="button"
            onClick={() => setFiltro('todas')}
            aria-pressed={filtro === 'todas'}
            className={`px-3 py-1 ${filtro === 'todas' ? 'bg-pino text-hueso' : 'hover:bg-arena-suave'}`}
          >
            {t('sol.todas')} · {items.length}
          </button>
          {ESTADOS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFiltro(s)}
              aria-pressed={filtro === s}
              className={`px-3 py-1 ${filtro === s ? 'bg-pino text-hueso' : 'hover:bg-arena-suave'}`}
            >
              {t(`sol.${s}`)} · {porEstado.get(s) ?? 0}
            </button>
          ))}
        </div>
        {msg && (
          <p
            role="status"
            className={`text-[12px] font-medium ${msg.error ? 'text-mar' : 'text-pino'}`}
          >
            {msg.text}
          </p>
        )}
        <p className="tnum ml-auto text-[12px] text-tinta-suave">
          {t('sol.n', { n: visibles.length })}
        </p>
      </div>

      {isPending && <p className="p-6 text-[14px] text-tinta-suave">{t('sol.cargando')}</p>}
      {isError && <p className="p-6 text-[14px] font-medium text-mar">{t('sol.error')}</p>}
      {!isPending && !isError && visibles.length === 0 && (
        <p className="p-6 text-[14px] text-tinta-suave">{t('sol.vacio')}</p>
      )}

      <ul className="min-h-0 flex-1 divide-y divide-arena/40 overflow-y-auto">
        {visibles.map((e) => {
          const pax = e.occupancy ? e.occupancy.adults + e.occupancy.childrenAges.length : null;
          const abiertaEsta = abierta === e.id;
          return (
            <li key={e.id}>
              {/* fila resumen: clicable para expandir el detalle */}
              <button
                type="button"
                onClick={() => setAbierta(abiertaEsta ? null : e.id)}
                aria-expanded={abiertaEsta}
                className="grid w-full grid-cols-[90px_1fr_auto] items-center gap-3 px-4 py-2.5 text-left text-[13px] hover:bg-arena-suave/50 sm:grid-cols-[90px_170px_1fr_130px_auto]"
              >
                <span className="tnum text-tinta-suave">{fecha(e.createdAt)}</span>
                <span className="truncate font-medium">{e.contact.name}</span>
                <span className="tnum hidden truncate text-tinta-suave sm:block">
                  {e.dateFrom && e.dateTo
                    ? `${fecha(e.dateFrom)} → ${fecha(e.dateTo)}${pax ? ` · ${t('planning.pax', { n: pax })}` : ''}`
                    : t('sol.sinFechas')}
                </span>
                <span className="hidden truncate text-tinta-suave sm:block">
                  {tipoNombre(e.unitTypeId)}
                </span>
                <span className={`lc-chip sol-${e.status} justify-self-end`}>
                  {t(`sol.${e.status}`)}
                </span>
              </button>

              {abiertaEsta && (
                <div className="grid gap-3 bg-arena-suave/40 px-4 py-3 text-[13px] sm:grid-cols-2">
                  <div>
                    <h3 className="lc-panel-h">{t('sol.mensaje')}</h3>
                    <p className="whitespace-pre-line">{e.message}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>
                      <h3 className="lc-panel-h">{t('sol.contacto')}</h3>
                      <p className="font-medium">{e.contact.name}</p>
                      <p>
                        <a href={`mailto:${e.contact.email}`} className="text-mar underline">
                          {e.contact.email}
                        </a>
                      </p>
                      {e.contact.phone && (
                        <p>
                          <a href={`tel:${e.contact.phone}`} className="tnum text-mar underline">
                            {e.contact.phone}
                          </a>
                        </p>
                      )}
                      <p className="mt-1 text-tinta-suave">
                        {t('sol.idioma')}: {e.locale.toUpperCase()} · {t('sol.origen')}: {e.source}
                      </p>
                    </div>
                    {NEXT[e.status].length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {NEXT[e.status].map((s) => (
                          <button
                            key={s}
                            type="button"
                            disabled={cambiar.isPending}
                            onClick={() => cambiar.mutate({ id: e.id, status: s })}
                            className={`rounded-(--lc-radius) border px-3 py-1 font-medium disabled:opacity-40 ${
                              s === 'lost'
                                ? 'border-mar/50 text-mar hover:bg-arena-suave'
                                : 'border-pino bg-pino text-hueso hover:bg-pino-oscuro'
                            }`}
                          >
                            {t(`accionSol.${s}`)}
                          </button>
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
