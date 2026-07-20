/**
 * Llegadas y salidas del día (ADR 0008, sesión 18 — modo lite).
 * La hoja que recepción imprime mentalmente cada mañana: quién entra, quién sale,
 * qué queda por cobrar. La ficha (BookingPanel) se abre desde cada fila.
 */
import { useQuery } from '@tanstack/react-query';
import { useRef, useState, type ReactNode } from 'react';
import { Button, EmptyState, Skeleton, SkeletonRows, cn, focusRing } from '@logic-camp/ui';
import { apiGet, type BookingListItem } from '../api';
import BookingPanel from '../components/BookingPanel';
import { QueryError } from '../components/QueryError';
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
  vacio: ReactNode;
  onOpen: (id: string, el: HTMLElement) => void;
}) {
  return (
    <section className="min-w-0 flex-1">
      <h2 className="lc-panel-h px-4 pt-3">
        {titulo} · {items.length}
      </h2>
      {items.length === 0 && vacio}
      <ul className="divide-y divide-border/40">
        {items.map((b) => {
          const pax = b.occupancy.adults + b.occupancy.childrenAges.length;
          const pendiente = b.totalCents - b.paidCents;
          return (
            <li key={b.id}>
              {/*
                Fila entera clicable: se queda como <button> nativo a propósito
                (ADR 0020, C2). <Button> del DS es `inline-flex` y aquí la fila
                ES la rejilla de 3 columnas: convertirla rompería la maquetación.
                Lo único que la migración debe garantizar es el foco visible, y
                por eso lleva el mismo anillo que `buttonVariants`.
              */}
              <button
                type="button"
                aria-label={t('dia.abrir', { code: b.code })}
                onClick={(e) => onOpen(b.id, e.currentTarget)}
                className={cn('grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-0.5 rounded-md px-4 py-2 text-left text-[13px] hover:bg-accent/50', focusRing)}
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
            <Button
              variant="outline"
              size="iconSm"
              onClick={() => setDia(addDays(dia, -1))}
              aria-label={t('dia.anterior')}
            >
              ←
            </Button>
            <Button variant="outline" size="xs" onClick={() => setDia(hoyIso())}>
              {t('dia.hoy')}
            </Button>
            <Button
              variant="outline"
              size="iconSm"
              onClick={() => setDia(addDays(dia, 1))}
              aria-label={t('dia.siguiente')}
            >
              →
            </Button>
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

        {cargando && (
          /* Dos columnas de filas de 3 huecos: código · nombre · importe. La
             forma de la hoja real, no un rectángulo (ADR 0020, C3). */
          <div
            aria-busy="true"
            aria-label={t('dia.cargando')}
            className="flex min-h-0 flex-1 flex-col gap-2 pb-4 lg:flex-row lg:divide-x lg:divide-border/60"
          >
            {[t('dia.llegadas'), t('dia.salidas')].map((titulo) => (
              <section key={titulo} className="min-w-0 flex-1">
                <Skeleton className="mx-4 mt-3 mb-2 h-3 w-28" />
                <SkeletonRows rows={5} cols={['w-12', 'w-40', 'w-14', 'w-20']} />
              </section>
            ))}
          </div>
        )}

        {error && (
          <QueryError
            error={llegadas.error ?? salidas.error}
            onRetry={() => {
              void llegadas.refetch();
              void salidas.refetch();
            }}
          />
        )}

        {!cargando && !error && (
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-4 lg:flex-row lg:divide-x lg:divide-border/60">
            <Lista
              titulo={t('dia.llegadas')}
              items={llegadasHoy}
              onOpen={openPanel}
              vacio={
                <EmptyState
                  art="calendar"
                  title={t('vacio.llegadas.titulo')}
                  description={t('vacio.llegadas.desc')}
                  /* Un vacío sin salida es un callejón: se ofrece avanzar el día. */
                  action={
                    <Button variant="outline" size="sm" onClick={() => setDia(addDays(dia, 1))}>
                      {t('vacio.llegadas.manana')}
                    </Button>
                  }
                />
              }
            />
            <Lista
              titulo={t('dia.salidas')}
              items={salidasHoy}
              onOpen={openPanel}
              vacio={<EmptyState art="calendar" title={t('vacio.salidas.titulo')} />}
            />
          </div>
        )}
      </div>

      {openId && <BookingPanel bookingId={openId} onClose={closePanel} />}
    </div>
  );
}
