/**
 * Clientes (ADR 0008, sesión 20): la memoria comercial del camping.
 * Búsqueda en servidor, historial por cliente y salto directo a la ficha
 * de cualquiera de sus reservas.
 */
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { apiGet, type GuestDetail, type GuestListItem } from '../api';
import BookingPanel from '../components/BookingPanel';
import { t } from '../i18n';
import { eur, fecha } from '../lib/format';

function GuestPanel({
  guestId,
  onClose,
  onOpenBooking,
}: {
  guestId: string;
  onClose: () => void;
  onOpenBooking: (id: string) => void;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const { data, isPending, isError } = useQuery({
    queryKey: ['guest', guestId],
    queryFn: () => apiGet<GuestDetail>(`/api/admin/guests/${guestId}`),
  });

  useEffect(() => {
    panelRef.current?.querySelector<HTMLElement>('button')?.focus();
  }, [guestId]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <aside
      ref={panelRef}
      role="dialog"
      aria-label={data ? `${data.name} ${data.surname}`.trim() : t('cli.ficha')}
      className="flex w-[360px] shrink-0 flex-col overflow-y-auto border-l border-border/60 bg-background"
    >
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border/60 bg-background px-4 py-2.5">
        <span className="text-[14px] font-semibold">
          {data ? `${data.name} ${data.surname}`.trim() : t('cli.ficha')}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('cli.cerrar')}
          className="ml-auto rounded-(--lc-radius) border border-foreground/20 px-2 py-0.5 text-[13px] font-semibold hover:bg-accent"
        >
          ✕
        </button>
      </div>

      {isPending && <p className="p-4 text-[13px] text-muted-foreground">{t('cli.cargando')}</p>}
      {isError && <p className="p-4 text-[13px] font-medium text-destructive">{t('cli.error')}</p>}

      {data && (
        <div className="flex flex-col gap-4 p-4 text-[13px]">
          <section>
            <h3 className="lc-panel-h">{t('cli.contacto')}</h3>
            {data.email && (
              <p>
                <a href={`mailto:${data.email}`} className="text-link underline">
                  {data.email}
                </a>
              </p>
            )}
            {data.phone && (
              <p>
                <a href={`tel:${data.phone}`} className="tnum text-link underline">
                  {data.phone}
                </a>
              </p>
            )}
            {data.docNumber && (
              <p className="tnum text-muted-foreground">
                {data.docType?.toUpperCase()} {data.docNumber}
                {data.nationality && ` · ${data.nationality}`}
              </p>
            )}
            {data.gdprConsentAt && (
              <p className="tnum text-muted-foreground">
                {t('cli.rgpd')}: {fecha(data.gdprConsentAt)}
              </p>
            )}
          </section>

          <section>
            <h3 className="lc-panel-h">{t('cli.historial')}</h3>
            {data.bookings.length === 0 && (
              <p className="text-muted-foreground">{t('cli.sinHistorial')}</p>
            )}
            <ul className="flex flex-col">
              {data.bookings.map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    aria-label={t('cli.abrirReserva', { code: b.code })}
                    onClick={() => onOpenBooking(b.id)}
                    className="grid w-full grid-cols-[1fr_auto] items-center gap-x-2 gap-y-0.5 border-b border-border/40 py-2 text-left hover:bg-accent/50"
                  >
                    <span className="tnum font-semibold">
                      {b.code}
                      {!b.isLead && (
                        <span className="ml-1 font-normal text-muted-foreground">
                          · {t('cli.acompanante')}
                        </span>
                      )}
                    </span>
                    <span className={`lc-chip st-${b.status} justify-self-end`}>
                      {t(`estado.${b.status}`)}
                    </span>
                    <span className="tnum text-muted-foreground">
                      {fecha(b.dateFrom)} → {fecha(b.dateTo)}
                    </span>
                    <span className="tnum justify-self-end text-muted-foreground">
                      {eur(b.totalCents)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </aside>
  );
}

export default function Clientes() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const params = new URLSearchParams({ page: String(page), pageSize: '25' });
  if (q.trim()) params.set('q', q.trim());

  const { data, isPending, isError } = useQuery({
    queryKey: ['guests', params.toString()],
    queryFn: () => apiGet<{ items: GuestListItem[] }>(`/api/admin/guests?${params}`),
  });
  const items = data?.items ?? [];

  return (
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-4 py-2.5">
          <input
            type="search"
            placeholder={t('cli.buscar')}
            aria-label={t('cli.buscar')}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="w-56 rounded-(--lc-radius) border border-foreground/20 bg-background px-2 py-1 text-[13px]"
          />
          <div className="flex items-center gap-1 text-[13px]">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-(--lc-radius) border border-foreground/20 px-2 py-1 font-semibold hover:bg-accent disabled:opacity-40"
            >
              ←
            </button>
            <span className="tnum px-1 text-muted-foreground">{t('res.pagina', { n: page })}</span>
            <button
              type="button"
              disabled={items.length < 25}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-(--lc-radius) border border-foreground/20 px-2 py-1 font-semibold hover:bg-accent disabled:opacity-40"
            >
              →
            </button>
          </div>
        </div>

        {isPending && <p className="p-6 text-[14px] text-muted-foreground">{t('cli.cargando')}</p>}
        {isError && <p className="p-6 text-[14px] font-medium text-destructive">{t('cli.error')}</p>}
        {!isPending && !isError && items.length === 0 && (
          <p className="p-6 text-[14px] text-muted-foreground">{t('cli.vacio')}</p>
        )}

        {items.length > 0 && (
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead className="sticky top-0 z-10 bg-background">
                <tr className="border-b-2 border-foreground/20 text-left">
                  {[
                    t('cli.nombre'),
                    t('cli.contacto'),
                    t('cli.documento'),
                    t('cli.reservas'),
                    t('cli.ultimaEstancia'),
                  ].map((h) => (
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
                {items.map((g) => (
                  <tr
                    key={g.id}
                    onClick={() => {
                      setBookingId(null);
                      setGuestId(g.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setBookingId(null);
                        setGuestId(g.id);
                      }
                    }}
                    tabIndex={0}
                    className="cursor-pointer border-b border-border/40 hover:bg-accent/50"
                  >
                    <td className="px-3 py-2 font-medium first:pl-4">
                      {`${g.name} ${g.surname}`.trim()}
                    </td>
                    <td className="max-w-52 truncate px-3 py-2 text-muted-foreground">
                      {g.email ?? g.phone ?? '—'}
                    </td>
                    <td className="tnum px-3 py-2 text-muted-foreground">{g.docNumber ?? '—'}</td>
                    <td className="tnum px-3 py-2">{g.bookingsCount}</td>
                    <td className="tnum px-3 py-2 text-muted-foreground last:pr-4">
                      {g.lastStay ? fecha(g.lastStay) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {bookingId ? (
        <BookingPanel bookingId={bookingId} onClose={() => setBookingId(null)} />
      ) : (
        guestId && (
          <GuestPanel
            guestId={guestId}
            onClose={() => setGuestId(null)}
            onOpenBooking={(id) => setBookingId(id)}
          />
        )
      )}
    </div>
  );
}
