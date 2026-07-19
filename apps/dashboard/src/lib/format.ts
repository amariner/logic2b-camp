/** Formato compartido del dashboard: dinero, fechas y conceptos del desglose. */
import { t, tDyn } from '../i18n';

export const eur = (cents: number, currency = 'EUR') =>
  new Intl.NumberFormat('es', { style: 'currency', currency }).format(cents / 100);

export const fecha = (isoDate: string) =>
  new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(`${isoDate.slice(0, 10)}T12:00:00Z`),
  );

export const noches = (from: string, to: string) =>
  Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

/** Concepto de línea del desglose → texto (extras y descuentos con fallback legible). */
export const conceptLabel = (concept: string) => {
  if (!concept.startsWith('extra.')) return tDyn(`concepto.${concept}`, concept);
  // sin traducción, el identificador se humaniza: 'extra.ext_limpieza' → 'limpieza'
  const fallback = concept.slice('extra.'.length).replace(/^ext_/, '').replace(/_/g, ' ');
  return `${t('concepto.extra')}: ${tDyn(`concepto.${concept}`, fallback)}`;
};

/** Código de error del motor (stay.*) → mensaje; sin traducción enseña el código. */
export const stayError = (code: string, params?: Record<string, string | number>) => {
  const raw = tDyn(`error.${code}`, code);
  return params ? raw.replace(/\{(\w+)\}/g, (_, k: string) => String(params[k] ?? `{${k}}`)) : raw;
};
