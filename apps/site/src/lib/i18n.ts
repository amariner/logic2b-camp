/**
 * i18n del sitio de producto. es = idioma por defecto (vive en la raíz);
 * el resto prefijados (/en/…). Sin texto hardcodeado: todo sale de
 * content/{lang}.json.
 *
 * Solo es/en (decisión de Andreu, sesión 60): la landing le vende al DUEÑO
 * del camping, no al campista. Los seis idiomas viven en la web de tenant
 * (apps/web), que es donde son argumento de venta.
 */
import en from '../content/en.json';
import es from '../content/es.json';

export const DEFAULT_LOCALE = 'es' as const;
export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

const content: Record<Locale, typeof es> = { es, en };

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
  const labels: Record<Locale, string> = { es: 'ES', en: 'EN' };
  return LOCALES.map((l) => ({ locale: l, label: labels[l] })).filter((x) => x.locale !== current);
}
