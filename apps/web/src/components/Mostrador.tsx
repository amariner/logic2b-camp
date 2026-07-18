/**
 * El MOSTRADOR ★ — elemento firma del nivel 3 (ADR 0006).
 * Widget de disponibilidad real contra GET /api/availability. Isla React única;
 * el nivel 1 no la incluye en el bundle (la página no la renderiza).
 */
import { useCallback, useMemo, useState } from 'react';

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

type Props = {
  labels: Labels;
  typeNames: Record<string, string>;
  locale: string;
};

const plus = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const eur = (cents: number, locale: string) =>
  new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(cents / 100);

export default function Mostrador({ labels, typeNames, locale }: Props) {
  const [from, setFrom] = useState(plus(14));
  const [to, setTo] = useState(plus(17));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [results, setResults] = useState<ResultItem[]>([]);

  const datesOk = from < to;

  const search = useCallback(async () => {
    if (!datesOk) return;
    setState('loading');
    try {
      const qs = new URLSearchParams({ from, to, adults: String(adults), children: String(children) });
      const res = await fetch(`/api/availability?${qs}`);
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as { results: ResultItem[] };
      setResults(body.results);
      setState('done');
    } catch {
      setState('error');
    }
  }, [from, to, adults, children, datesOk]);

  const guestsLabel = useMemo(() => {
    const a = `${adults} ${adults === 1 ? labels.adulto : labels.adultos}`;
    return children > 0 ? `${a}, ${children} ${children === 1 ? labels.nino : labels.ninos}` : a;
  }, [adults, children, labels]);

  const closed = state === 'done' && results.length > 0 && results.every((r) => r.status === 'closed');
  const available = results.filter((r) => r.status === 'available' && r.totalPriceCents !== null);
  const soldOut = state === 'done' && !closed && available.length === 0;

  return (
    <div>
      {/* la barra: un solo objeto, siempre operativo */}
      <form
        className="flex flex-col gap-px overflow-hidden rounded-(--lc-radius-lg) border border-tinta/15 bg-hueso shadow-[0_24px_60px_-30px_rgba(14,21,18,0.45)] sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          void search();
        }}
      >
        <label className="flex flex-1 flex-col gap-1 bg-hueso px-4 py-3">
          <span className="text-[11px] font-medium tracking-wide text-tinta-suave uppercase">{labels.llegada}</span>
          <input
            type="date"
            required
            value={from}
            min={plus(0)}
            onChange={(e) => setFrom(e.target.value)}
            className="tnum bg-transparent text-[15px] font-medium outline-none"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 border-t border-tinta/10 bg-hueso px-4 py-3 sm:border-t-0 sm:border-l">
          <span className="text-[11px] font-medium tracking-wide text-tinta-suave uppercase">{labels.salida}</span>
          <input
            type="date"
            required
            value={to}
            min={from}
            onChange={(e) => setTo(e.target.value)}
            className="tnum bg-transparent text-[15px] font-medium outline-none"
          />
        </label>
        <div className="flex flex-1 flex-col gap-1 border-t border-tinta/10 bg-hueso px-4 py-3 sm:border-t-0 sm:border-l">
          <span className="text-[11px] font-medium tracking-wide text-tinta-suave uppercase">{labels.huespedes}</span>
          <div className="flex items-center gap-3 text-[15px] font-medium">
            <span className="tnum min-w-0 truncate">{guestsLabel}</span>
            <span className="ml-auto flex items-center gap-1">
              <Stepper value={adults} min={1} max={12} onChange={setAdults} label={labels.adultos} />
              <Stepper value={children} min={0} max={10} onChange={setChildren} label={labels.ninos} />
            </span>
          </div>
        </div>
        <button
          type="submit"
          disabled={state === 'loading' || !datesOk}
          className="bg-pino px-7 py-4 text-[15px] font-semibold text-hueso transition-colors hover:bg-pino-oscuro disabled:opacity-60 sm:min-w-52"
        >
          {state === 'loading' ? labels.buscando : labels.buscar}
        </button>
      </form>

      {!datesOk && <p className="mt-3 text-[13px] text-mar">{labels.fechasInvalidas}</p>}
      {state === 'error' && <p className="mt-3 text-[13px] text-mar">{labels.error}</p>}
      {closed && <p className="mt-4 text-[15px] font-medium">{labels.cerrado}</p>}
      {soldOut && <p className="mt-4 text-[15px] font-medium">{labels.agotado}</p>}

      {/* resultados EN la página, sin salto */}
      {available.length > 0 && (
        <ul className="mt-5 grid gap-px overflow-hidden rounded-(--lc-radius-lg) border border-tinta/10 bg-tinta/10 sm:grid-cols-2 lg:grid-cols-3">
          {available.map((r) => (
            <li key={r.unitTypeId} className="flex flex-col gap-1 bg-hueso p-5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-display text-[17px] font-semibold">{typeNames[r.unitTypeId] ?? r.unitTypeId}</h3>
                <p className="tnum text-right text-[17px] font-semibold">
                  <span className="mr-1 text-[11px] font-normal text-tinta-suave">{labels.desde}</span>
                  {eur(r.totalPriceCents!, locale)}
                </p>
              </div>
              <p className="text-[12px] text-tinta-suave">
                {labels.porEstancia} ·{' '}
                {r.availableUnits <= 3 ? (
                  <span className="font-medium text-mar">{labels.quedanPocas}</span>
                ) : (
                  <span className="tnum">{r.availableUnits} {labels.unidadesLibres}</span>
                )}
              </p>
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
    <span className="flex items-center rounded-(--lc-radius) border border-tinta/15">
      <button
        type="button"
        aria-label={`− ${label}`}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="px-2 py-0.5 text-tinta-suave transition-colors hover:text-tinta"
      >
        −
      </button>
      <span className="tnum min-w-5 text-center text-[13px]">{value}</span>
      <button
        type="button"
        aria-label={`+ ${label}`}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="px-2 py-0.5 text-tinta-suave transition-colors hover:text-tinta"
      >
        +
      </button>
    </span>
  );
}
