/**
 * El MOSTRADOR ★ — elemento firma del nivel 3 (ADR 0006).
 * Widget de disponibilidad real contra GET /api/availability. Isla React única;
 * el nivel 1 no la incluye en el bundle (la página no la renderiza).
 * Deep-link: /?from=YYYY-MM-DD&to=YYYY-MM-DD&adults=2&children=1 reproduce la búsqueda.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';

type Labels = Record<string, string>;

type ResultItem = {
  unitTypeId: string;
  kind: 'pitch' | 'lodging';
  status: 'available' | 'unavailable' | 'closed';
  availableUnits: number;
  capacityMax: number;
  totalPriceCents: number | null;
  currency: string;
};

type Query = { from: string; to: string; adults: number; children: number };

type Props = {
  labels: Labels;
  typeNames: Record<string, string>;
  locale: string;
  /** base del funnel (p.ej. /reservar): cada resultado gana su botón "Reservar" */
  reservarBase?: string;
  /**
   * Ficha de alojamiento: el mostrador contesta SOLO por este tipo. La API
   * sigue devolviendo el camping entero (una consulta, sin endpoint nuevo) —
   * lo que cambia es qué se pinta y, sobre todo, qué se dice cuando ESTE tipo
   * no entra: sin salida, la ficha es un callejón.
   */
  soloTipo?: string;
  /** a dónde mandar al visitante cuando su tipo no queda libre (el mostrador general) */
  verOtrosBase?: string;
};

const plus = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const eur = (cents: number, locale: string) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(cents / 100);

export default function Mostrador({
  labels,
  typeNames,
  locale,
  reservarBase,
  soloTipo,
  verOtrosBase,
}: Props) {
  const [from, setFrom] = useState(plus(14));
  const [to, setTo] = useState(plus(17));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [opensOn, setOpensOn] = useState<string | null>(null);

  const datesOk = from < to;

  const runSearch = useCallback(async (q: Query) => {
    setState('loading');
    // búsqueda compartible/recuperable: la URL ES el estado
    const qs = new URLSearchParams({
      from: q.from,
      to: q.to,
      adults: String(q.adults),
      children: String(q.children),
    });
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}?${qs}${window.location.hash}`,
    );
    try {
      const res = await fetch(`/api/availability?${qs}`);
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as { opensOn: string | null; results: ResultItem[] };
      setResults(body.results);
      setOpensOn(body.opensOn ?? null);
      setState('done');
    } catch {
      setState('error');
    }
  }, []);

  // deep-link: al cargar, si la URL trae fechas válidas se reproduce la búsqueda
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pFrom = params.get('from');
    const pTo = params.get('to');
    if (!pFrom || !pTo || !ISO_DATE.test(pFrom) || !ISO_DATE.test(pTo) || pFrom >= pTo) return;
    const pAdults = Math.min(12, Math.max(1, Number(params.get('adults')) || 2));
    const pChildren = Math.min(10, Math.max(0, Number(params.get('children')) || 0));
    setFrom(pFrom);
    setTo(pTo);
    setAdults(pAdults);
    setChildren(pChildren);
    void runSearch({ from: pFrom, to: pTo, adults: pAdults, children: pChildren });
  }, [runSearch]);

  const guestsLabel = useMemo(() => {
    const a = `${adults} ${adults === 1 ? labels.adulto : labels.adultos}`;
    return children > 0 ? `${a}, ${children} ${children === 1 ? labels.nino : labels.ninos}` : a;
  }, [adults, children, labels]);

  const closed =
    state === 'done' && results.length > 0 && results.every((r) => r.status === 'closed');
  const libres = results.filter((r) => r.status === 'available' && r.totalPriceCents !== null);
  // en la ficha solo interesa SU tipo; el resto del camping se sigue consultando
  // igual porque es lo que permite ofrecer la salida cuando este no entra.
  const available = soloTipo ? libres.filter((r) => r.unitTypeId === soloTipo) : libres;
  const soldOut = state === 'done' && !closed && available.length === 0;
  // ¿el camping tiene algo libre aunque ESTE tipo no? entonces hay a dónde ir
  const hayAlternativa = soloTipo ? libres.length > 0 : false;

  // el enlace de salida conserva las fechas y el grupo: el visitante no los reescribe
  const verOtrosHref =
    verOtrosBase &&
    `${verOtrosBase}?${new URLSearchParams({
      from,
      to,
      adults: String(adults),
      children: String(children),
    })}#mostrador`;

  // "cerrado" con la fecha REAL de apertura que devuelve la API (seasons_calendar)
  const closedMessage = useMemo(() => {
    if (!opensOn) return labels.cerrado;
    const date = new Date(`${opensOn}T12:00:00Z`);
    const sameYear = date.getUTCFullYear() === new Date().getFullYear();
    const texto = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      ...(sameYear ? {} : { year: 'numeric' }),
    }).format(date);
    return (labels.cerradoEl ?? labels.cerrado ?? '').replace('{fecha}', texto);
  }, [opensOn, labels, locale]);

  return (
    <div>
      {/* la barra: un solo objeto, siempre operativo */}
      <form
        className="grid grid-cols-1 gap-px overflow-hidden rounded-(--lc-radius-lg) border border-tinta/15 bg-hueso shadow-[0_24px_60px_-30px_rgba(14,21,18,0.45)] min-[360px]:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          if (datesOk) void runSearch({ from, to, adults, children });
        }}
      >
        <label className="flex min-w-0 flex-col justify-center gap-1 bg-hueso px-4 py-3">
          <span className="text-[11px] font-medium tracking-wide text-tinta-suave uppercase">
            {labels.llegada}
          </span>
          <input
            type="date"
            required
            value={from}
            min={plus(0)}
            onChange={(e) => setFrom(e.target.value)}
            className="tnum min-h-11 min-w-0 w-full bg-transparent text-[16px] font-medium"
          />
        </label>
        <label className="flex min-w-0 flex-col justify-center gap-1 border-t border-tinta/10 bg-hueso px-4 py-3 min-[360px]:border-t-0 min-[360px]:border-l">
          <span className="text-[11px] font-medium tracking-wide text-tinta-suave uppercase">
            {labels.salida}
          </span>
          <input
            type="date"
            required
            value={to}
            min={from}
            onChange={(e) => setTo(e.target.value)}
            className="tnum min-h-11 min-w-0 w-full bg-transparent text-[16px] font-medium"
          />
        </label>
        <div className="flex min-w-0 flex-col gap-1 border-t border-tinta/10 bg-hueso px-4 py-3 min-[360px]:col-span-2 lg:col-span-1 lg:border-t-0 lg:border-l">
          <span className="text-[11px] font-medium tracking-wide text-tinta-suave uppercase">
            {labels.huespedes}
          </span>
          <div className="flex flex-col gap-2 text-[15px] font-medium">
            <span className="sr-only" aria-live="polite">
              {guestsLabel}
            </span>
            <span className="flex flex-wrap items-center justify-between gap-2">
              <Stepper
                value={adults}
                min={1}
                max={12}
                onChange={setAdults}
                label={labels.adultos}
              />
              <Stepper
                value={children}
                min={0}
                max={10}
                onChange={setChildren}
                label={labels.ninos}
              />
            </span>
          </div>
        </div>
        <button
          type="submit"
          disabled={state === 'loading' || !datesOk}
          className="min-h-12 bg-pino px-5 py-4 text-[15px] font-semibold text-hueso transition-colors hover:bg-pino-oscuro disabled:opacity-60 min-[360px]:col-span-2 lg:col-span-1 lg:max-w-52"
        >
          {state === 'loading' ? labels.buscando : labels.buscar}
        </button>
      </form>

      {!datesOk && <p className="mt-3 text-[13px] text-mar">{labels.fechasInvalidas}</p>}
      {state === 'error' && <p className="mt-3 text-[13px] text-mar">{labels.error}</p>}
      {closed && <p className="mt-4 text-[15px] font-medium">{closedMessage}</p>}
      {soldOut && (
        <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[15px] font-medium">
          <span>{soloTipo ? (labels.agotadoTipo ?? labels.agotado) : labels.agotado}</span>
          {hayAlternativa && verOtrosHref && (
            <a href={verOtrosHref} className="text-[14px] font-semibold text-pino underline">
              {labels.verOtros} →
            </a>
          )}
        </p>
      )}

      {/* skeleton mientras responde la API: la página no salta */}
      {state === 'loading' && (
        <ul
          aria-busy="true"
          className="mt-5 grid gap-px overflow-hidden rounded-(--lc-radius-lg) border border-tinta/10 bg-tinta/10 sm:grid-cols-2 lg:grid-cols-3"
        >
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex flex-col gap-2.5 bg-hueso p-5">
              <span className="flex items-baseline justify-between gap-2">
                <span className="lc-skeleton h-4 w-28 rounded-(--lc-radius)" />
                <span className="lc-skeleton h-4 w-16 rounded-(--lc-radius)" />
              </span>
              <span className="lc-skeleton h-3 w-20 rounded-(--lc-radius)" />
            </li>
          ))}
        </ul>
      )}

      {/* resultados EN la página, sin salto */}
      {state !== 'loading' && available.length > 0 && (
        <ul
          className={`mt-5 grid gap-px overflow-hidden rounded-(--lc-radius-lg) border border-tinta/10 bg-tinta/10 ${
            soloTipo ? '' : 'sm:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {available.map((r) => (
            <li key={r.unitTypeId} className="flex flex-col gap-1 bg-hueso p-5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-display text-[17px] font-semibold">
                  {typeNames[r.unitTypeId] ?? r.unitTypeId}
                </h3>
                <p className="tnum text-right text-[17px] font-semibold">
                  <span className="mr-1 text-[11px] font-normal text-tinta-suave">
                    {labels.desde}
                  </span>
                  {eur(r.totalPriceCents!, locale)}
                </p>
              </div>
              <p className="text-[12px] text-tinta-suave">
                {labels.porEstancia} ·{' '}
                {r.availableUnits <= 3 ? (
                  <span className="font-medium text-mar">{labels.quedanPocas}</span>
                ) : (
                  <span className="tnum">
                    {r.availableUnits} {labels.unidadesLibres}
                  </span>
                )}
              </p>
              {reservarBase && (
                <a
                  href={`${reservarBase}/${r.unitTypeId}?${new URLSearchParams({ from, to, adults: String(adults), children: String(children) })}`}
                  className="mt-2 self-start rounded-(--lc-radius) bg-pino px-4 py-1.5 text-[13px] font-semibold text-hueso transition-colors hover:bg-pino-oscuro"
                >
                  {labels.reservar} →
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stepper({
  value,
  min,
  max,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <span className="flex flex-col gap-1">
      <span className="text-[12px] text-tinta-suave">{label}</span>
      <span className="flex items-center rounded-(--lc-radius) border border-tinta/15">
        <button
          type="button"
          aria-label={`− ${label}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="min-h-11 min-w-11 text-tinta-suave transition-colors hover:text-tinta disabled:opacity-40"
        >
          −
        </button>
        <span className="tnum min-w-5 text-center text-[13px]">{value}</span>
        <button
          type="button"
          aria-label={`+ ${label}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="min-h-11 min-w-11 text-tinta-suave transition-colors hover:text-tinta disabled:opacity-40"
        >
          +
        </button>
      </span>
    </span>
  );
}
