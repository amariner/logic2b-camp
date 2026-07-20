/**
 * Lista de reservas (ADR 0008, sesión 19): búsqueda por código, filtro por
 * estado y paginación. La ficha se abre al lado; el alta manual comparte
 * motor y precio-en-servidor con la web pública.
 */
import { useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { apiGet, type BookingDetail, type BookingListItem } from '../api';
import BookingPanel from '../components/BookingPanel';
import NewBookingPanel from '../components/NewBookingPanel';
import { eur, fecha, noches } from '../lib/format';
import { t } from '../i18n';

const ESTADOS: BookingDetail['status'][] = [
  'pending',
  'confirmed',
  'cancelled',
  'no_show',
  'completed',
];
const PAGE_SIZE = 25;

export default function Reservas() {
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState<BookingDetail['status'] | ''>('');
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [altaAbierta, setAltaAbierta] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);

  const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
  if (q.trim()) params.set('q', q.trim().toUpperCase());
  if (estado) params.set('status', estado);

  const { data, isPending, isError } = useQuery({
    queryKey: ['bookings', 'list', params.toString()],
    queryFn: () => apiGet<{ items: BookingListItem[] }>(`/api/admin/bookings?${params}`),
    refetchInterval: 60_000,
  });

  const items = data?.items ?? [];

  const openPanel = (id: string, el: HTMLElement) => {
    openerRef.current = el;
    setAltaAbierta(false);
    setOpenId(id);
  };
  const closePanel = () => {
    setOpenId(null);
    openerRef.current?.focus();
    openerRef.current = null;
  };

  return (
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-4 py-2.5">
          <input
            type="search"
            placeholder={t('res.buscar')}
            aria-label={t('res.buscar')}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="tnum w-44 rounded-(--lc-radius) border border-foreground/20 bg-background px-2 py-1 text-[13px]"
          />
          <select
            aria-label={t('res.estado')}
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value as BookingDetail['status'] | '');
              setPage(1);
            }}
            className="rounded-(--lc-radius) border border-foreground/20 bg-background px-2 py-1 text-[13px]"
          >
            <option value="">{t('res.todas')}</option>
            {ESTADOS.map((s) => (
              <option key={s} value={s}>
                {t(`estado.${s}`)}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1 text-[13px]">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-(--lc-radius) border border-foreground/20 px-2 py-1 font-semibold disabled:opacity-40 hover:bg-accent"
            >
              ←
            </button>
            <span className="tnum px-1 text-muted-foreground">{t('res.pagina', { n: page })}</span>
            <button
              type="button"
              disabled={items.length < PAGE_SIZE}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-(--lc-radius) border border-foreground/20 px-2 py-1 font-semibold disabled:opacity-40 hover:bg-accent"
            >
              →
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpenId(null);
              setAltaAbierta(true);
            }}
            className="ml-auto rounded-(--lc-radius) border border-primary bg-primary px-3 py-1 text-[13px] font-semibold text-background hover:bg-primary"
          >
            {t('res.nueva')}
          </button>
        </div>

        {isPending && <p className="p-6 text-[14px] text-muted-foreground">{t('res.cargando')}</p>}
        {isError && <p className="p-6 text-[14px] font-medium text-destructive">{t('res.error')}</p>}
        {!isPending && !isError && items.length === 0 && (
          <p className="p-6 text-[14px] text-muted-foreground">{t('res.vacio')}</p>
        )}

        {items.length > 0 && (
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead className="sticky top-0 z-10 bg-background">
                <tr className="border-b-2 border-foreground/20 text-left">
                  {(
                    [
                      t('res.codigo'),
                      t('res.titular'),
                      t('res.fechas'),
                      t('res.unidad'),
                      t('res.canal'),
                      t('res.estado'),
                      t('res.total'),
                      t('res.pendiente'),
                    ] as const
                  ).map((h) => (
                    <th
                      key={h}
                      className="px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase first:pl-4 last:pr-4"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((b) => {
                  const pendiente = b.totalCents - b.paidCents;
                  return (
                    <tr
                      key={b.id}
                      onClick={(e) => openPanel(b.id, e.currentTarget)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openPanel(b.id, e.currentTarget);
                        }
                      }}
                      tabIndex={0}
                      className="cursor-pointer border-b border-border/40 hover:bg-accent/50"
                    >
                      <td className="tnum px-3 py-2 font-semibold first:pl-4">{b.code}</td>
                      <td className="max-w-40 truncate px-3 py-2 font-medium">
                        {b.leadName ?? '—'}
                      </td>
                      <td className="tnum px-3 py-2 whitespace-nowrap text-muted-foreground">
                        {fecha(b.dateFrom)} → {fecha(b.dateTo)} · {noches(b.dateFrom, b.dateTo)}n
                      </td>
                      <td className="tnum px-3 py-2">{b.unitCode ?? '—'}</td>
                      <td className="px-3 py-2 text-muted-foreground">{t(`canal.${b.channel}`)}</td>
                      <td className="px-3 py-2">
                        <span className={`lc-chip st-${b.status}`}>{t(`estado.${b.status}`)}</span>
                      </td>
                      <td className="tnum px-3 py-2">{eur(b.totalCents)}</td>
                      <td
                        className={`tnum px-3 py-2 last:pr-4 ${
                          pendiente > 0 && b.status !== 'cancelled'
                            ? 'font-medium text-destructive'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {pendiente > 0 && b.status !== 'cancelled' ? eur(pendiente) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {openId && <BookingPanel bookingId={openId} onClose={closePanel} />}
      {altaAbierta && (
        <NewBookingPanel
          onClose={() => setAltaAbierta(false)}
          onCreated={(id) => {
            setAltaAbierta(false);
            setOpenId(id);
          }}
        />
      )}
    </div>
  );
}
