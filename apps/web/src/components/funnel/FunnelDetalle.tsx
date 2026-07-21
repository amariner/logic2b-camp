/**
 * Paso 2–3 del funnel (ADR 0007): detalle del tipo + extras con desglose EN VIVO.
 * Cada cambio re-cotiza contra POST /api/quote — el cliente jamás calcula precios.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  conceptLabel,
  eur,
  fill,
  funnelQs,
  occupancyOf,
  readFunnelQuery,
  type Breakdown,
  type FunnelQuery,
  type Issue,
} from './lib';

type ExtraItem = { id: string; priceCents: number; per: string; required: boolean };

type Props = {
  locale: string;
  unitTypeId: string;
  labels: {
    detalle: Record<string, string>;
    conceptos: Record<string, string>;
    errores: Record<string, string>;
    noches: string;
  };
  extrasCatalog: ExtraItem[];
  extrasNombres: Record<string, string>;
  extrasPor: Record<string, string>;
  mostrador: Record<string, string>;
  hasElectricity: boolean;
  reservarPath: string;
  titularPath: string;
};

export default function FunnelDetalle({
  locale,
  unitTypeId,
  labels,
  extrasCatalog,
  extrasNombres,
  extrasPor,
  mostrador,
  hasElectricity,
  reservarPath,
  titularPath,
}: Props) {
  const [query, setQuery] = useState<FunnelQuery | null>(null);
  const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
  const [nights, setNights] = useState(0);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [state, setState] = useState<'loading' | 'ok' | 'invalid' | 'error'>('loading');

  const requote = useCallback(
    async (q: FunnelQuery) => {
      setState('loading');
      window.history.replaceState(null, '', `${window.location.pathname}?${funnelQs(q)}`);
      try {
        const res = await fetch('/api/quote', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            unitTypeId,
            dateFrom: q.from,
            dateTo: q.to,
            occupancy: occupancyOf(q),
            extraIds: q.extras,
            withElectricity: q.elec,
            needsElectricity: q.elec,
          }),
        });
        if (res.status === 422) {
          const body = (await res.json()) as { issues?: Issue[]; error: string };
          setIssues(body.issues ?? [{ code: `stay.${body.error}` }]);
          setState('invalid');
          return;
        }
        if (!res.ok) throw new Error(String(res.status));
        const body = (await res.json()) as { nights: number; breakdown: Breakdown };
        setBreakdown(body.breakdown);
        setNights(body.nights);
        setIssues([]);
        setState('ok');
      } catch {
        setState('error');
      }
    },
    [unitTypeId],
  );

  useEffect(() => {
    const q = readFunnelQuery();
    if (!q) {
      window.location.href = reservarPath;
      return;
    }
    setQuery(q);
    void requote(q);
  }, [requote, reservarPath]);

  if (!query) return null;

  const toggleExtra = (id: string) => {
    const extras = query.extras.includes(id)
      ? query.extras.filter((e) => e !== id)
      : [...query.extras, id];
    const q = { ...query, extras };
    setQuery(q);
    void requote(q);
  };

  const toggleElec = () => {
    const q = { ...query, elec: !query.elec };
    setQuery(q);
    void requote(q);
  };

  const optionalExtras = extrasCatalog.filter((e) => !e.required);
  const requiredExtras = extrasCatalog.filter((e) => e.required);
  const fecha = (d: string) =>
    new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(
      new Date(`${d}T12:00:00Z`),
    );

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
      {/* columna izquierda: estancia + extras */}
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="font-display mb-3 text-[15px] font-semibold">{labels.detalle.estancia}</h2>
          <p className="tnum text-[15px]">
            {fecha(query.from)} → {fecha(query.to)} · {fill(labels.noches, { n: nights || '…' })} ·{' '}
            {query.adults} {query.adults === 1 ? mostrador.adulto : mostrador.adultos}
            {query.children > 0 &&
              `, ${query.children} ${query.children === 1 ? mostrador.nino : mostrador.ninos}`}
          </p>
          <p className="mt-2">
            <a
              href={`${reservarPath}?${funnelQs(query)}`}
              className="text-[13px] font-medium text-tinta-suave underline underline-offset-4 transition-colors hover:text-tinta"
            >
              ← {labels.detalle.volver}
            </a>
          </p>
        </div>

        <div>
          <h2 className="font-display mb-3 text-[15px] font-semibold">{labels.detalle.extras}</h2>
          <ul className="flex flex-col divide-y divide-arena/50 border-y border-arena/50">
            {hasElectricity && (
              <li className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
                <label className="flex flex-1 cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={query.elec}
                    onChange={toggleElec}
                    className="size-4 accent-(--lc-pino)"
                  />
                  {labels.detalle.electricidad}
                </label>
              </li>
            )}
            {optionalExtras.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
                <label className="flex flex-1 cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={query.extras.includes(e.id)}
                    onChange={() => toggleExtra(e.id)}
                    className="size-4 accent-(--lc-pino)"
                  />
                  {extrasNombres[e.id] ?? e.id}
                </label>
                <span className="tnum whitespace-nowrap text-tinta-suave">
                  {eur(e.priceCents, locale)} {extrasPor[e.per]}
                </span>
              </li>
            ))}
            {requiredExtras.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-3 py-2.5 text-[14px] text-tinta-suave"
              >
                <span>{extrasNombres[e.id] ?? e.id}</span>
                <span className="tnum whitespace-nowrap">
                  {eur(e.priceCents, locale)} · {labels.detalle.incluido}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* columna derecha: desglose del servidor */}
      <div className="flex flex-col gap-5 rounded-(--lc-radius-lg) border border-arena/60 bg-arena-suave/40 p-6 lg:sticky lg:top-24 lg:self-start">
        <h2 className="font-display text-[15px] font-semibold">{labels.detalle.desglose}</h2>

        {state === 'invalid' && (
          <ul className="flex flex-col gap-1.5 text-[14px] font-medium text-mar">
            {issues.map((i) => (
              <li key={i.code}>{fill(labels.errores[i.code] ?? i.code, i.params ?? {})}</li>
            ))}
          </ul>
        )}
        {state === 'error' && (
          <p className="text-[14px] font-medium text-mar">{labels.detalle.error}</p>
        )}
        {state === 'loading' && (
          <div aria-busy="true" className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <span key={i} className="lc-skeleton h-4 w-full rounded-(--lc-radius)" />
            ))}
          </div>
        )}

        {state === 'ok' && breakdown && (
          <>
            <ul className="flex flex-col divide-y divide-arena/50 text-[14px]">
              {breakdown.lines.map((l, i) => (
                <li key={i} className="flex items-baseline justify-between gap-3 py-2">
                  <span className={l.amountCents < 0 ? 'text-pino' : ''}>
                    {conceptLabel(l.concept, labels.conceptos, extrasNombres)}
                  </span>
                  <span
                    className={`tnum whitespace-nowrap ${l.amountCents < 0 ? 'text-pino' : ''}`}
                  >
                    {eur(l.amountCents, locale)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="flex items-baseline justify-between border-t-2 border-tinta/20 pt-3 text-[17px] font-semibold">
              <span>{labels.detalle.total}</span>
              <span className="tnum">{eur(breakdown.totalCents, locale)}</span>
            </p>
            <p className="text-[12px] text-tinta-suave">
              {fill(labels.detalle.tasaNota ?? '', {
                importe: eur(breakdown.touristTaxCents, locale),
              })}
            </p>
            <a
              href={`${titularPath}?${funnelQs(query)}`}
              className="rounded-(--lc-radius) bg-pino px-7 py-3 text-center text-[15px] font-semibold text-hueso transition-colors hover:bg-pino-oscuro"
            >
              {labels.detalle.continuar} →
            </a>
          </>
        )}
      </div>
    </div>
  );
}
