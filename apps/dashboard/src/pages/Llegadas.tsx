/**
 * Llegadas y salidas del día (ADR 0008, sesión 18 — modo lite).
 * La hoja que recepción imprime mentalmente cada mañana: quién entra, quién sale,
 * qué queda por cobrar. La ficha (BookingPanel) se abre desde cada fila.
 */
import { useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { apiGet, type BookingListItem } from '../api';
import BookingPanel from '../components/BookingPanel';
import { t } from '../i18n';

const DAY_MS = 86_400_000;
const hoyIso = () => new Date().toISOString().slice(0, 10);
const addDays = (iso: string, n: number) =>
  new Date(Date.parse(`${iso}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);
const eur = (cents: number) =>
  new Intl.NumberFormat('es', { style: 'currency', currency: 'EUR' }).format(cents / 100);
const noches = (from: string, to: string) =>
  Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS);
const fechaLarga = (iso: string) => {
  const s = new Intl.DateTimeFormat('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${iso}T12:00:00Z`));
  return s.charAt(0).toUpperCase() + s.slice(1);
};

function Lista({
  titulo,
  items,
  vacio,
  onOpen,
}: {
  titulo: string;
  items: BookingListItem[];
  vacio: string;
  onOpen: (id: string, el: HTMLElement) => void;
}) {
  return (
    <section className="min-w-0 flex-1">
      <h2 className="lc-panel-h px-4 pt-3">
        {titulo} · {items.length}
      </h2>
      {items.length === 0 && <p className="px-4 py-2 text-[13px] text-muted-foreground">{vacio}</p>}
      <ul className="divide-y divide-border/40">
        {items.map((b) => {
          const pax = b.occupancy.adults + b.occupancy.childrenAges.length;
          const pendiente = b.totalCents - b.paidCents;
          return (
            <li key={b.id}>
              <button
                type="button"
                aria-label={t('dia.abrir', { code: b.code })}
                onClick={(e) => onOpen(b.id, e.currentTarget)}
                className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-0.5 px-4 py-2 text-left text-[13px] hover:bg-accent/50"
              >
                <span className="tnum font-semibold">{b.code.replace(/^[A-Z]+-\d{4}-/, '')}</span>
                <span className="truncate font-medium">{b.leadName ?? '—'}</span>
                <span className={`lc-chip st-${b.status} justify-self-end`}>
                  {t(`estado.${b.status}`)}
                </span>
                <span className="tnum col-start-1 text-muted-foreground">
                  {b.unitCode ?? t('dia.sinUnidad')}
                </span>
                <span className="tnum col-start-2 text-muted-foreground">
                  {t('planning.pax', { n: pax })} ·{' '}
                  {t('dia.noches', { n: noches(b.dateFrom, b.dateTo) })}
                </span>
                <span
                  className={`tnum col-start-3 justify-self-end text-[12px] font-medium ${
                    pendiente > 0 ? 'text-destructive' : 'text-primary'
                  }`}
                >
                  {pendiente > 0
                    ? t('dia.pendiente', { importe: eur(pendiente) })
                    : t('dia.alCorriente')}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function Llegadas() {
  const [dia, setDia] = useState(hoyIso);
  const [openId, setOpenId] = useState<string | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const llegadas = useQuery({
    queryKey: ['bookings', 'arrivals', dia],
    queryFn: () =>
      apiGet<{ items: BookingListItem[] }>(`/api/admin/bookings?arrivalsOn=${dia}&pageSize=100`),
    refetchInterval: 60_000,
  });
  const salidas = useQuery({
    queryKey: ['bookings', 'departures', dia],
    queryFn: () =>
      apiGet<{ items: BookingListItem[] }>(`/api/admin/bookings?departuresOn=${dia}&pageSize=100`),
    refetchInterval: 60_000,
  });

  // canceladas fuera: no llegan ni salen
  const soloVivas = (items?: BookingListItem[]) =>
    (items ?? []).filter((b) => b.status !== 'cancelled');
  const llegadasHoy = soloVivas(llegadas.data?.items);
  const salidasHoy = soloVivas(salidas.data?.items);

  const openPanel = (id: string, el: HTMLElement) => {
    openerRef.current = el;
    setOpenId(id);
  };
  const closePanel = () => {
    setOpenId(null);
    openerRef.current?.focus();
    openerRef.current = null;
  };

  const cargando = llegadas.isPending || salidas.isPending;
  const error = llegadas.isError || salidas.isError;

  return (
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-3 border-b border-border/60 px-4 py-2.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setDia(addDays(dia, -1))}
              aria-label="←"
              className="rounded-(--lc-radius) border border-foreground/20 px-2.5 py-1 text-[13px] font-semibold hover:bg-accent"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => setDia(hoyIso())}
              className="rounded-(--lc-radius) border border-foreground/20 px-3 py-1 text-[13px] font-semibold hover:bg-accent"
            >
              {t('dia.hoy')}
            </button>
            <button
              type="button"
              onClick={() => setDia(addDays(dia, 1))}
              aria-label="→"
              className="rounded-(--lc-radius) border border-foreground/20 px-2.5 py-1 text-[13px] font-semibold hover:bg-accent"
            >
              →
            </button>
          </div>
          <input
            type="date"
            value={dia}
            onChange={(e) => e.target.value && setDia(e.target.value)}
            className="tnum rounded-(--lc-radius) border border-foreground/20 bg-background px-2 py-1 text-[13px]"
          />
          <p className="text-[13px] font-medium">{fechaLarga(dia)}</p>
          <p className="tnum ml-auto text-[12px] text-muted-foreground">
            {t('dia.nLlegadas', { n: llegadasHoy.length })} ·{' '}
            {t('dia.nSalidas', { n: salidasHoy.length })}
          </p>
        </div>

        {cargando && <p className="p-6 text-[14px] text-muted-foreground">{t('dia.cargando')}</p>}
        {error && <p className="p-6 text-[14px] font-medium text-destructive">{t('dia.error')}</p>}

        {!cargando && !error && (
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-4 lg:flex-row lg:divide-x lg:divide-border/60">
            <Lista
              titulo={t('dia.llegadas')}
              items={llegadasHoy}
              vacio={t('dia.sinLlegadas')}
              onOpen={openPanel}
            />
            <Lista
              titulo={t('dia.salidas')}
              items={salidasHoy}
              vacio={t('dia.sinSalidas')}
              onOpen={openPanel}
            />
          </div>
        )}
      </div>

      {openId && <BookingPanel bookingId={openId} onClose={closePanel} />}
    </div>
  );
}
