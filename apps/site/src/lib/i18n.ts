/**
 * i18n del sitio de producto. es = idioma por defecto (vive en la raíz);
 * en/ca prefijados (/en/…, /ca/…). Sin texto hardcodeado: todo sale de content/{lang}.json.
 */
import ca from '../content/ca.json';
import en from '../content/en.json';
import es from '../content/es.json';

export const DEFAULT_LOCALE = 'es' as const;
export const LOCALES = ['es', 'en', 'ca'] as const;
export type Locale = (typeof LOCALES)[number];

const content: Record<Locale, typeof es> = { es, en, ca };

export function getContent(locale: Locale): typeof es {
  return content[locale] ?? content[DEFAULT_LOCALE];
}

/** Ruta localizada: el idioma por defecto vive en la raíz. */
export function localePath(locale: Locale, path = '/'): string {
  const clean = path === '/' ? '' : path;
  return locale === DEFAULT_LOCALE
    ? `/${clean}`.replace('//', '/')
    : `/${locale}/${clean}`.replace('//', '/');
}

/** Idiomas alternativos con su URL, para el selector y los hreflang. */
export function altLocales(current: Locale): { locale: Locale; label: string }[] {
  const labels: Record<Locale, string> = { es: 'ES', en: 'EN', ca: 'CA' };
  return LOCALES.map((l) => ({ locale: l, label: labels[l] })).filter((x) => x.locale !== current);
}
