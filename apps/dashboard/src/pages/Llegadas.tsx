/**
 * Llegadas y salidas del día (ADR 0008, sesión 18 — modo lite).
 * La hoja que recepción imprime mentalmente cada mañana: quién entra, quién sale,
 * qué queda por cobrar. La ficha (BookingPanel) se abre desde cada fila.
 */
import { errorMutacion } from '../avisos';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState, type ReactNode } from 'react';
import {
  Button,
  EmptyState,
  Input,
  Skeleton,
  SkeletonRows,
  cn,
  focusRing,
  toast,
} from '@logic-camp/ui';
import { DoorOpen, LogOut } from 'lucide-react';
import { apiGet, apiPatch, type BookingListItem } from '../api';
import BookingPanel from '../components/BookingPanel';
import { QueryError } from '../components/QueryError';
import { t } from '../i18n';
import { BotonAyuda } from '../components/BotonAyuda';

const inHouse = (b: BookingListItem) =>
  b.status === 'confirmed' && Boolean(b.checkedInAt) && !b.checkedOutAt;

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

/**
 * La rejilla de la fila. Ninguna columna es `auto` y eso NO es un detalle: cada
 * fila es su propia rejilla —son `<button>` sueltos, no un `<table>`—, así que
 * una columna `auto` la dimensiona el contenido *de esa fila* y desplaza a las
 * vecinas. Medido en la demo antes de arreglarlo (1366px, 26 jul):
 *
 * - columna 1 (`código` arriba, `unidad` abajo): 33,8px con «A-01» y **46,7px
 *   con «MH-03»** → la columna del titular empezaba 13px más a la derecha en
 *   una fila de mobil-home que en las diez de al lado.
 * - columna 3 (`estado` arriba, `saldo` abajo): 117,4px con «Pendiente: 823,20 €»
 *   y **74,6px** con «Pagada» → el día que una llegada aparece pagada, los
 *   chips de estado de esa fila saltan 43px. Hasta la sesión 56 no aparecía
 *   ninguna: el seed cobraba el mismo 30% a todas.
 *
 * Va en UNA constante porque la usan las dos listas (llegadas y salidas), y dos
 * copias se desincronizan el día que alguien toque una anchura.
 *
 * Las anchuras son `minmax(0, …)`, no fijas: son un TOPE. Todas las filas de una
 * lista miden ya lo mismo (ver `ACCION`), así que si la lista se estrecha las
 * tres columnas encogen igual en todas y siguen alineadas — pero nunca desbordan.
 */
const REJILLA =
  'grid grid-cols-[minmax(0,72px)_1fr_minmax(0,136px)] items-center gap-x-3 gap-y-0.5';

/**
 * Hueco del botón de recepción, reservado para TODA la lista o para ninguna
 * fila. El botón vive fuera del `<button>` de la fila (no se anida), así que sin
 * hueco fijo la fila que no lo tiene —una llegada aún pendiente de pago, que no
 * se puede registrar— se estiraba 96px más que sus vecinas y sacaba su estado y
 * su saldo fuera de la columna. `w-28` entra «Check-out», el más largo.
 *
 * En un hueco de móvil el botón se queda en el icono. No es cosmética: con los
 * 112px del botón rotulado, la columna del saldo bajaba a 78px para un texto de
 * 117px («Pendiente: 229,25 €») y, al ir pegado a la derecha, se PINTABA ENCIMA
 * del nombre del titular. Seis datos y un botón rotulado no caben en 375px.
 */
const ACCION = 'flex w-9 shrink-0 justify-end @sm:w-28';

/**
 * Llegadas y salidas, una al lado de la otra… mientras quepan. El corte iba por
 * `lg:` —el ANCHO DE PANTALLA— y quien estrecha estas listas no es la pantalla,
 * es la ficha de reserva: a 1366px con el panel abierto el hueco baja de 1126 a
 * 766px y las dos columnas seguían partiéndoselo a 383px cada una, con el nombre
 * del titular reducido a «Pierre B…». Es la trampa de la sesión 52 («la densidad
 * se rompe donde la lista se estrecha») en su forma más literal: la media query
 * medía otra cosa distinta de la que se estaba rompiendo.
 *
 * Con `@container` el corte lo decide el hueco real: si no llega a 1024px, las
 * listas se apilan y cada una se queda con todo el ancho. El umbral sale de la
 * cuenta de la fila, no de un número redondo: hueco del botón (112) + rejilla
 * (72 + 136 + separaciones + margen = 264) dejan al titular con 178px por lista
 * a 1142px de hueco, y con 45px —«Pierre B…»— si se parten 782px entre dos.
 *
 * OJO: el `@container` va en la COLUMNA DE LA PÁGINA, no aquí. Un elemento no
 * puede consultarse a sí mismo — declararse contenedor y llevar encima el
 * `@3xl:` no falla, hace algo peor: `container-type` queda aplicado, la consulta
 * se resuelve contra un contenedor ancestro que no existe y no coincide nunca.
 * Medido: 1142px de ancho y `flex-direction: column`.
 */
const COLUMNAS =
  'flex min-h-0 flex-1 flex-col gap-2 @5xl:flex-row @5xl:divide-x @5xl:divide-border/60';

/**
 * El botón de recepción de una fila (check-in / check-out). En hueco de móvil se
 * queda en el icono, pero NUNCA se queda sin nombre: el rótulo sigue ahí como
 * `aria-label` y como `title`, así que el lector de pantalla lee lo mismo que se
 * lee con el ratón encima.
 */
function BotonRecepcion({
  icono: Icono,
  rotulo,
  disabled,
  onClick,
}: {
  icono: typeof DoorOpen;
  rotulo: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="xs"
      variant="outline"
      disabled={disabled}
      onClick={onClick}
      title={rotulo}
      aria-label={rotulo}
      className="w-full justify-center px-0 @sm:px-2.5"
    >
      <Icono className="size-3.5 shrink-0" />
      <span className="hidden @sm:inline">{rotulo}</span>
    </Button>
  );
}

function Lista({
  titulo,
  items,
  vacio,
  onOpen,
  action,
}: {
  titulo: string;
  items: BookingListItem[];
  vacio: ReactNode;
  onOpen: (id: string, el: HTMLElement) => void;
  /** botón de recepción (check-in/check-out) por fila, FUERA del <button> de la fila */
  action?: (b: BookingListItem) => ReactNode;
}) {
  // Se resuelve una vez por lista: si NINGUNA fila puede registrarse, la lista
  // no reserva el hueco y no deja un canalón vacío de 112px a la derecha.
  const acciones = items.map((b) => action?.(b) ?? null);
  const hayAcciones = acciones.some(Boolean);
  return (
    <section className="min-w-0 flex-1">
      <h2 className="lc-panel-h px-4 pt-3">
        {titulo} · {items.length}
      </h2>
      {items.length === 0 && vacio}
      <ul className="divide-y divide-border/40">
        {items.map((b, i) => {
          const pax = b.occupancy.adults + b.occupancy.childrenAges.length;
          const pendiente = b.totalCents - b.paidCents;
          const here = inHouse(b);
          return (
            <li key={b.id} className="flex items-center gap-1 pr-2">
              {/*
                Fila entera clicable: se queda como <button> nativo a propósito
                (ADR 0020, C2). <Button> del DS es `inline-flex` y aquí la fila
                ES la rejilla de 3 columnas: convertirla rompería la maquetación.
                Lo único que la migración debe garantizar es el foco visible, y
                por eso lleva el mismo anillo que `buttonVariants`. El botón de
                recepción vive FUERA (no se puede anidar <button> en <button>).
              */}
              <button
                type="button"
                aria-label={t('dia.abrir', { code: b.code })}
                onClick={(e) => onOpen(b.id, e.currentTarget)}
                className={cn(
                  REJILLA,
                  'min-w-0 flex-1 rounded-md px-4 py-2 text-left text-[13px] hover:bg-accent/50',
                  focusRing,
                )}
              >
                <span className="tnum truncate font-semibold">
                  {b.code.replace(/^[A-Z]+-\d{4}-/, '')}
                </span>
                <span className="truncate font-medium">{b.leadName ?? '—'}</span>
                {here ? (
                  <span className="lc-chip st-inhouse justify-self-end">
                    {t('plano.estado.enCasa')}
                  </span>
                ) : (
                  <span className={`lc-chip st-${b.status} justify-self-end`}>
                    {t(`estado.${b.status}`)}
                  </span>
                )}
                <span className="tnum col-start-1 truncate text-muted-foreground">
                  {b.unitCode ?? t('dia.sinUnidad')}
                </span>
                <span className="tnum col-start-2 text-muted-foreground">
                  {t('planning.pax', { n: pax })} ·{' '}
                  {t('dia.noches', { n: noches(b.dateFrom, b.dateTo) })}
                </span>
                <span
                  className={`tnum col-start-3 justify-self-end text-[12px] font-medium whitespace-nowrap ${
                    pendiente > 0 ? 'text-destructive' : 'text-primary'
                  }`}
                >
                  {pendiente > 0
                    ? t('dia.pendiente', { importe: eur(pendiente) })
                    : t('dia.alCorriente')}
                </span>
              </button>
              {hayAcciones && <div className={ACCION}>{acciones[i]}</div>}
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
  const qc = useQueryClient();

  // check-in desde la llegada / check-out desde la salida (ADR 0022): el gesto
  // más frecuente del mostrador, sin abrir la ficha. El servidor valida SIEMPRE.
  const recepcion = useMutation({
    mutationFn: (v: { id: string; action: 'check_in' | 'check_out' }) =>
      apiPatch(`/api/admin/bookings/${v.id}`, { action: v.action }),
    onSuccess: (_r, v) => {
      toast.success(t(v.action === 'check_in' ? 'ficha.checkinHecho' : 'ficha.checkoutHecho'));
      void qc.invalidateQueries({ queryKey: ['bookings'] });
      void qc.invalidateQueries({ queryKey: ['planning'] });
    },
    onError: (e) => errorMutacion(e, t('ficha.checkinError')),
  });

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
      {/* el contenedor de consulta: lo que mide aquí es el hueco que deja la
          ficha de reserva cuando está abierta, que es quien estrecha las listas */}
      <div className="@container flex min-w-0 flex-1 flex-col">
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
          {/* `Input` del DS (B1): el campo llevaba borde y radio propios, así que
              no tenía el anillo de foco del sistema —el único que se ve contra
              cualquier fondo— y encima iba sin nombre accesible: un lector de
              pantalla anunciaba «editar fecha», sin decir de qué. */}
          <Input
            type="date"
            value={dia}
            onChange={(e) => e.target.value && setDia(e.target.value)}
            aria-label={t('dia.elegir')}
            className="tnum w-auto"
          />
          <p className="text-[13px] font-medium">{fechaLarga(dia)}</p>
          <p className="tnum ml-auto text-[12px] text-muted-foreground">
            {t('dia.nLlegadas', { n: llegadasHoy.length })} ·{' '}
            {t('dia.nSalidas', { n: salidasHoy.length })}
          </p>
          <BotonAyuda />
        </div>

        {cargando && (
          /* Dos columnas de filas de 3 huecos: código · nombre · importe. La
             forma de la hoja real, no un rectángulo (ADR 0020, C3). */
          <div
            aria-busy="true"
            aria-label={t('dia.cargando')}
            className={cn(COLUMNAS, 'pb-4')}
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
          <div className={cn(COLUMNAS, 'overflow-y-auto pb-4')}>
            <Lista
              titulo={t('dia.llegadas')}
              items={llegadasHoy}
              onOpen={openPanel}
              action={(b) =>
                b.status === 'confirmed' && !b.checkedInAt ? (
                  <BotonRecepcion
                    icono={DoorOpen}
                    rotulo={t('accion.check_in')}
                    disabled={recepcion.isPending}
                    onClick={() => recepcion.mutate({ id: b.id, action: 'check_in' })}
                  />
                ) : null
              }
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
              action={(b) =>
                inHouse(b) ? (
                  <BotonRecepcion
                    icono={LogOut}
                    rotulo={t('accion.check_out')}
                    disabled={recepcion.isPending}
                    onClick={() => recepcion.mutate({ id: b.id, action: 'check_out' })}
                  />
                ) : null
              }
              vacio={<EmptyState art="calendar" title={t('vacio.salidas.titulo')} />}
            />
          </div>
        )}
      </div>

      {openId && <BookingPanel bookingId={openId} onClose={closePanel} />}
    </div>
  );
}
