/**
 * Gestión por código + email (ADR 0007): ver (imprimible), cancelar con el
 * reembolso a la vista y cambiar fechas re-cotizado entero en servidor.
 * Sin cuentas: /reserva?code=…&email=… es recuperable y compartible.
 */
import { useCallback, useEffect, useState } from 'react';
import { conceptLabel, eur, fill, type Breakdown } from './lib';

type BookingView = {
  code: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  unitTypeId: string;
  occupancy: { adults: number; childrenAges: number[]; pets: number };
  totalCents: number;
  paidCents: number;
  touristTaxCents: number;
  breakdown: Breakdown;
  cancellation: { refundCents: number; daysBefore: number; appliedRefundPct: number } | null;
};

type Props = {
  locale: string;
  labels: {
    nueva: string;
    buscar: Record<string, string>;
    estado: Record<string, string>;
    campos: Record<string, string>;
    imprimir: string;
    cancelar: Record<string, string>;
    modificar: Record<string, string>;
    pago: Record<string, string>;
  };
  typeNames: Record<string, string>;
  conceptos: Record<string, string>;
  extrasNombres: Record<string, string>;
  mostrador: Record<string, string>;
};

export default function ReservaGestion({
  locale,
  labels,
  typeNames,
  conceptos,
  extrasNombres,
  mostrador,
}: Props) {
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [booking, setBooking] = useState<BookingView | null>(null);
  const [state, setState] = useState<'form' | 'loading' | 'ok' | 'notfound'>('form');
  const [panel, setPanel] = useState<'none' | 'cancel' | 'modify'>('none');
  const [flash, setFlash] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pagoParam, setPagoParam] = useState<'ok' | 'cancelado' | null>(null);
  const [polling, setPolling] = useState(false);

  const load = useCallback(async (c: string, e: string) => {
    setState('loading');
    const p = new URLSearchParams(window.location.search);
    p.set('code', c);
    p.set('email', e);
    window.history.replaceState(null, '', `${window.location.pathname}?${p}`);
    try {
      const res = await fetch(
        `/api/bookings/${encodeURIComponent(c)}?email=${encodeURIComponent(e)}`,
      );
      if (!res.ok) {
        setState('notfound');
        return;
      }
      setBooking((await res.json()) as BookingView);
      setState('ok');
    } catch {
      setState('notfound');
    }
  }, []);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const c = p.get('code');
    const e = p.get('email');
    setIsNew(p.get('nueva') === '1');
    const pago = p.get('pago');
    if (pago === 'ok' || pago === 'cancelado') setPagoParam(pago);
    if (c && e) {
      setCode(c);
      setEmail(e);
      void load(c, e);
    }
  }, [load]);

  // pago pendiente de confirmar por webhook (ADR 0011 §4): la vuelta de la
  // pasarela es más rápida que el aviso server-to-server — se reconsulta unas
  // pocas veces antes de rendirse (recepción ve igualmente la reserva 'pending')
  useEffect(() => {
    if (pagoParam !== 'ok' || !booking || booking.status !== 'pending') return;
    let cancelled = false;
    let attempts = 0;
    setPolling(true);
    const tick = () => {
      window.setTimeout(async () => {
        if (cancelled) return;
        attempts += 1;
        await load(booking.code, email);
        if (!cancelled && attempts < 8) tick();
        else if (!cancelled) setPolling(false);
      }, 2000);
    };
    tick();
    return () => {
      cancelled = true;
      setPolling(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagoParam, booking?.status]);

  const fecha = (d: string) =>
    new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(
      new Date(`${d}T12:00:00Z`),
    );
  const nights = booking
    ? Math.round((Date.parse(booking.dateTo) - Date.parse(booking.dateFrom)) / 86400000)
    : 0;

  const doCancel = async () => {
    if (!booking) return;
    setBusy(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(booking.code)}/cancel`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setFlash(labels.cancelar.hecha ?? null);
      setPanel('none');
      await load(booking.code, email);
    } catch {
      setActionError(labels.cancelar.error ?? null);
    } finally {
      setBusy(false);
    }
  };

  const doModify = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!booking) return;
    const data = new FormData(e.currentTarget);
    const from = String(data.get('from'));
    const to = String(data.get('to'));
    if (!from || !to || from >= to) return;
    setBusy(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(booking.code)}/modify`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, dateFrom: from, dateTo: to }),
      });
      if (res.status === 409) {
        setActionError(labels.modificar.noDisponible ?? null);
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as { totalCents: number };
      setFlash(fill(labels.modificar.hecho ?? '', { importe: eur(body.totalCents, locale) }));
      setPanel('none');
      await load(booking.code, email);
    } catch {
      setActionError(labels.modificar.error ?? null);
    } finally {
      setBusy(false);
    }
  };

  // ---------- formulario de acceso ----------
  if (state !== 'ok' || !booking) {
    return (
      <form
        className="flex max-w-md flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (code && email) void load(code.trim(), email.trim());
        }}
      >
        <p className="text-[15px] text-tinta-suave">{labels.buscar.intro}</p>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium tracking-wide text-tinta-suave uppercase">
            {labels.buscar.codigo}
          </span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            placeholder="CS-2026-000000"
            className="tnum rounded-(--lc-radius) border border-tinta/15 bg-hueso px-3.5 py-2.5 text-[15px]"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium tracking-wide text-tinta-suave uppercase">
            {labels.buscar.email}
          </span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="rounded-(--lc-radius) border border-tinta/15 bg-hueso px-3.5 py-2.5 text-[15px]"
          />
        </label>
        <button
          type="submit"
          disabled={state === 'loading'}
          className="self-start rounded-(--lc-radius) bg-pino px-7 py-3 text-[15px] font-semibold text-hueso transition-colors hover:bg-pino-oscuro disabled:opacity-60"
        >
          {state === 'loading' ? labels.buscar.buscando : labels.buscar.ver}
        </button>
        {state === 'notfound' && (
          <p className="text-[14px] font-medium text-mar">{labels.buscar.noEncontrada}</p>
        )}
      </form>
    );
  }

  // ---------- vista de la reserva ----------
  const active = booking.status === 'pending' || booking.status === 'confirmed';
  const occ = booking.occupancy;
  const guests = `${occ.adults} ${occ.adults === 1 ? mostrador.adulto : mostrador.adultos}${
    occ.childrenAges.length > 0
      ? `, ${occ.childrenAges.length} ${occ.childrenAges.length === 1 ? mostrador.nino : mostrador.ninos}`
      : ''
  }`;

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      {isNew && (
        <p className="rounded-(--lc-radius) border border-pino/30 bg-pino/10 px-4 py-3 text-[14px] font-medium text-pino">
          {labels.nueva}
        </p>
      )}
      {polling && (
        <p
          role="status"
          className="rounded-(--lc-radius) border border-arena/60 bg-arena-suave/40 px-4 py-3 text-[14px] font-medium"
        >
          {labels.pago.esperando}
        </p>
      )}
      {pagoParam === 'cancelado' && booking.status === 'pending' && (
        <p className="rounded-(--lc-radius) border border-mar/40 bg-mar/5 px-4 py-3 text-[14px] font-medium text-mar">
          {labels.pago.cancelado}
        </p>
      )}
      {pagoParam === 'ok' && !polling && booking.status === 'pending' && (
        <p className="rounded-(--lc-radius) border border-mar/40 bg-mar/5 px-4 py-3 text-[14px] font-medium text-mar">
          {labels.pago.pendiente}
        </p>
      )}
      {flash && (
        <p className="rounded-(--lc-radius) border border-pino/30 bg-pino/10 px-4 py-3 text-[14px] font-medium text-pino">
          {flash}
        </p>
      )}

      <div className="lc-print flex flex-col gap-5 rounded-(--lc-radius-lg) border border-arena/60 p-6">
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-display tnum text-[22px] font-semibold">{booking.code}</p>
          <span className="rounded-(--lc-radius) bg-arena-suave px-3 py-1 text-[12px] font-semibold tracking-wide uppercase">
            {labels.estado[booking.status] ?? booking.status}
          </span>
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 text-[14px]">
          <dt className="font-medium text-tinta-suave">{labels.campos.alojamiento}</dt>
          <dd className="text-right font-medium">
            {typeNames[booking.unitTypeId] ?? booking.unitTypeId}
          </dd>
          <dt className="font-medium text-tinta-suave">{labels.campos.llegada}</dt>
          <dd className="tnum text-right">{fecha(booking.dateFrom)}</dd>
          <dt className="font-medium text-tinta-suave">{labels.campos.salida}</dt>
          <dd className="tnum text-right">{fecha(booking.dateTo)}</dd>
          <dt className="font-medium text-tinta-suave">{labels.campos.noches}</dt>
          <dd className="tnum text-right">{nights}</dd>
          <dt className="font-medium text-tinta-suave">{labels.campos.huespedes}</dt>
          <dd className="tnum text-right">{guests}</dd>
        </dl>

        <ul className="flex flex-col divide-y divide-arena/50 border-t border-arena/50 text-[14px]">
          {booking.breakdown.lines.map((l, i) => (
            <li key={i} className="flex items-baseline justify-between gap-3 py-2">
              <span className={l.amountCents < 0 ? 'text-pino' : ''}>
                {conceptLabel(l.concept, conceptos, extrasNombres)}
              </span>
              <span className={`tnum whitespace-nowrap ${l.amountCents < 0 ? 'text-pino' : ''}`}>
                {eur(l.amountCents, locale)}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-1 border-t-2 border-tinta/20 pt-3 text-[14px]">
          <p className="flex items-baseline justify-between text-[17px] font-semibold">
            <span>{labels.campos.total}</span>
            <span className="tnum">{eur(booking.totalCents, locale)}</span>
          </p>
          <p className="flex items-baseline justify-between text-tinta-suave">
            <span>{labels.campos.pagado}</span>
            <span className="tnum">{eur(booking.paidCents, locale)}</span>
          </p>
          <p className="flex items-baseline justify-between text-tinta-suave">
            <span>{labels.campos.tasa}</span>
            <span className="tnum">{eur(booking.touristTaxCents, locale)}</span>
          </p>
        </div>
      </div>

      <div className="no-print flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-(--lc-radius) border border-tinta/20 px-5 py-2.5 text-[14px] font-semibold transition-colors hover:bg-arena-suave"
        >
          {labels.imprimir}
        </button>
        {active && (
          <>
            <button
              type="button"
              onClick={() => setPanel(panel === 'modify' ? 'none' : 'modify')}
              className="rounded-(--lc-radius) border border-tinta/20 px-5 py-2.5 text-[14px] font-semibold transition-colors hover:bg-arena-suave"
            >
              {labels.modificar.boton}
            </button>
            <button
              type="button"
              onClick={() => setPanel(panel === 'cancel' ? 'none' : 'cancel')}
              className="rounded-(--lc-radius) border border-mar/40 px-5 py-2.5 text-[14px] font-semibold text-mar transition-colors hover:bg-mar/10"
            >
              {labels.cancelar.boton}
            </button>
          </>
        )}
      </div>

      {panel === 'cancel' && booking.cancellation && (
        <div className="no-print flex flex-col gap-4 rounded-(--lc-radius-lg) border border-mar/40 bg-mar/5 p-5">
          <p className="text-[14px]">
            {fill(labels.cancelar.aviso ?? '', {
              dias: booking.cancellation.daysBefore,
              pct: booking.cancellation.appliedRefundPct,
              importe: eur(booking.cancellation.refundCents, locale),
            })}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={doCancel}
              disabled={busy}
              className="rounded-(--lc-radius) bg-mar px-5 py-2.5 text-[14px] font-semibold text-hueso transition-colors hover:opacity-90 disabled:opacity-60"
            >
              {labels.cancelar.confirmar}
            </button>
            <button
              type="button"
              onClick={() => setPanel('none')}
              className="rounded-(--lc-radius) border border-tinta/20 px-5 py-2.5 text-[14px] font-semibold"
            >
              {labels.cancelar.volver}
            </button>
          </div>
          {actionError && <p className="text-[14px] font-medium text-mar">{actionError}</p>}
        </div>
      )}

      {panel === 'modify' && (
        <form
          onSubmit={doModify}
          className="no-print flex flex-col gap-4 rounded-(--lc-radius-lg) border border-arena/60 bg-arena-suave/40 p-5"
        >
          <p className="font-display text-[15px] font-semibold">{labels.modificar.titulo}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium tracking-wide text-tinta-suave uppercase">
                {labels.campos.llegada}
              </span>
              <input
                name="from"
                type="date"
                required
                defaultValue={booking.dateFrom}
                className="tnum rounded-(--lc-radius) border border-tinta/15 bg-hueso px-3.5 py-2.5 text-[15px]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium tracking-wide text-tinta-suave uppercase">
                {labels.campos.salida}
              </span>
              <input
                name="to"
                type="date"
                required
                defaultValue={booking.dateTo}
                className="tnum rounded-(--lc-radius) border border-tinta/15 bg-hueso px-3.5 py-2.5 text-[15px]"
              />
            </label>
          </div>
          <p className="text-[12px] text-tinta-suave">{labels.modificar.nota}</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-(--lc-radius) bg-pino px-5 py-2.5 text-[14px] font-semibold text-hueso transition-colors hover:bg-pino-oscuro disabled:opacity-60"
            >
              {busy ? labels.modificar.aplicando : labels.modificar.aplicar}
            </button>
          </div>
          {actionError && <p className="text-[14px] font-medium text-mar">{actionError}</p>}
        </form>
      )}
    </div>
  );
}
