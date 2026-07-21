/**
 * Clientes (ADR 0008, sesión 20): la memoria comercial del camping.
 * Búsqueda en servidor, historial por cliente y salto directo a la ficha
 * de cualquiera de sus reservas.
 */
import { Button, EmptyState, Skeleton, SkeletonRows, SkeletonText } from '@logic-camp/ui';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { apiGet, type GuestDetail, type GuestListItem } from '../api';
import BookingPanel from '../components/BookingPanel';
import { QueryError } from '../components/QueryError';
import { t } from '../i18n';
import { eur, fecha } from '../lib/format';
import { BotonAyuda } from '../components/BotonAyuda';

/** Foco visible en las filas clicables: son rejillas enteras, no botones. */
const FILA_FOCO =
  'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none';

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
  const { data, isPending, isError, error, refetch } = useQuery({
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
        <Button
          variant="outline"
          size="iconSm"
          onClick={onClose}
          aria-label={t('cli.cerrar')}
          className="ml-auto"
        >
          ✕
        </Button>
      </div>

      {/* Esqueleto con la forma de la ficha: nombre, contacto y lista de estancias. */}
      {isPending && (
        <div
          aria-busy="true"
          aria-label={t('cli.cargandoFicha')}
          className="flex flex-col gap-4 p-4"
        >
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-24" />
            <SkeletonText lines={3} />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-32" />
            <SkeletonRows rows={3} cols={['w-16', 'w-20', 'w-14']} className="-mx-4" />
          </div>
        </div>
      )}
      {isError && <QueryError error={error} onRetry={() => refetch()} />}

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
                  {/* Fila-rejilla completa: se queda como fila (no <Button>), pero
                      con rol, teclado y foco visible. */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={t('cli.abrirReserva', { code: b.code })}
                    onClick={() => onOpenBooking(b.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onOpenBooking(b.id);
                      }
                    }}
                    className={`grid w-full cursor-pointer grid-cols-[1fr_auto] items-center gap-x-2 gap-y-0.5 border-b border-border/40 py-2 text-left hover:bg-accent/50 ${FILA_FOCO}`}
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
                  </div>
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
  // ficha de cliente direccionable por la URL (/clientes/$id, ADR 0022 §4)
  const navigate = useNavigate();
  const { id: guestId } = useParams({ strict: false }) as { id?: string };
  const [bookingId, setBookingId] = useState<string | null>(null);
  const openGuest = (id: string) => {
    setBookingId(null);
    void navigate({ to: '/clientes/$id', params: { id } });
  };

  const params = new URLSearchParams({ page: String(page), pageSize: '25' });
  if (q.trim()) params.set('q', q.trim());

  const { data, isPending, isError, error, refetch } = useQuery({
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
            <Button
              variant="outline"
              size="iconSm"
              aria-label={t('res.anterior')}
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ←
            </Button>
            <span className="tnum px-1 text-muted-foreground">{t('res.pagina', { n: page })}</span>
            <Button
              variant="outline"
              size="iconSm"
              aria-label={t('res.siguiente')}
              disabled={items.length < 25}
              onClick={() => setPage((p) => p + 1)}
            >
              →
            </Button>
          </div>
          <BotonAyuda className="ml-auto" />
        </div>

        {/* Columnas del esqueleto = columnas reales: nombre · contacto · documento · nº · última estancia. */}
        {isPending && (
          <div aria-busy="true" aria-label={t('cli.cargando')} className="pt-2">
            <SkeletonRows rows={8} cols={['w-36', 'w-44', 'w-24', 'w-6', 'w-20']} />
          </div>
        )}
        {isError && <QueryError error={error} onRetry={() => refetch()} />}
        {!isPending && !isError && items.length === 0 && (
          <EmptyState
            art="search"
            title={t('cli.vacio')}
            description={t('cli.vacioDesc')}
            action={
              q.trim() ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setQ('');
                    setPage(1);
                  }}
                >
                  {t('cli.limpiarBusqueda')}
                </Button>
              ) : undefined
            }
          />
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
                    onClick={() => openGuest(g.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openGuest(g.id);
                      }
                    }}
                    tabIndex={0}
                    className={`cursor-pointer border-b border-border/40 hover:bg-accent/50 ${FILA_FOCO}`}
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
            onClose={() => void navigate({ to: '/clientes' })}
            onOpenBooking={(id) => setBookingId(id)}
          />
        )
      )}
    </div>
  );
}
