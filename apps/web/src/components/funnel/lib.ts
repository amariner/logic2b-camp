/** Utilidades compartidas de las islas del funnel (ADR 0007): la URL ES el estado. */

export type FunnelQuery = {
  from: string;
  to: string;
  adults: number;
  children: number;
  pets: number;
  extras: string[];
  elec: boolean;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function readFunnelQuery(): FunnelQuery | null {
  const p = new URLSearchParams(window.location.search);
  const from = p.get('from') ?? '';
  const to = p.get('to') ?? '';
  if (!ISO_DATE.test(from) || !ISO_DATE.test(to) || from >= to) return null;
  return {
    from,
    to,
    adults: Math.min(20, Math.max(1, Number(p.get('adults')) || 2)),
    children: Math.min(20, Math.max(0, Number(p.get('children')) || 0)),
    pets: Math.min(10, Math.max(0, Number(p.get('pets')) || 0)),
    extras: (p.get('extras') ?? '').split(',').filter(Boolean),
    elec: p.get('elec') === '1',
  };
}

export function funnelQs(q: FunnelQuery): string {
  const p = new URLSearchParams({
    from: q.from,
    to: q.to,
    adults: String(q.adults),
    children: String(q.children),
  });
  if (q.pets > 0) p.set('pets', String(q.pets));
  if (q.extras.length) p.set('extras', q.extras.join(','));
  if (q.elec) p.set('elec', '1');
  return p.toString();
}

/** el precio es del servidor; las edades sintéticas replican al API (childAges) */
export const occupancyOf = (q: FunnelQuery) => ({
  adults: q.adults,
  childrenAges: Array.from({ length: q.children }, () => 8),
  pets: q.pets,
  vehicles: 1,
});

export const eur = (cents: number, locale: string) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);

export const fill = (text: string, vars: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));

export type Breakdown = {
  lines: { concept: string; detail: Record<string, string | number>; amountCents: number }[];
  totalCents: number;
  touristTaxCents: number;
  depositCents?: number;
  currency: string;
};

export type Issue = { code: string; params?: Record<string, string | number> };

/** concepto del desglose → texto: mapa del funnel, nombres de extras o el código tal cual */
export const conceptLabel = (
  concept: string,
  conceptos: Record<string, string>,
  extrasNombres: Record<string, string>,
) => conceptos[concept] ?? extrasNombres[concept.replace(/^extra\./, '')] ?? concept;
