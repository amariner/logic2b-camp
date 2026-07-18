/**
 * Carga de config + contenido del tenant resuelto en build (alias @tenant).
 * Cero texto en componentes: TODO sale de tenants/{slug}/content/{locale}.json.
 */
import { bookingMode, type TenantWebConfig } from '@logic-camp/config';
import tenantConfig from '@tenant/config';

export type TipoCard = { id: string; nombre: string; desc: string; foto: string };

export type Content = {
  seo: { title: string; description: string };
  nav: Record<string, string>;
  hero3: { titulo: string; prueba: string };
  hero1: { titulo: string; cta: string };
  ticker: string[];
  mostrador: Record<string, string>;
  tipos: { titulo: string; subtitulo: string; nombres: Record<string, string>; cards: TipoCard[] };
  entorno: { titulo: string; texto: string };
  form: Record<string, string>;
  footer: Record<string, string>;
};

export const config: TenantWebConfig = tenantConfig;

/** TIER=1 pnpm dev degrada la demo para previsualizar el nivel 1. */
const tierOverride = Number(import.meta.env.TIER_OVERRIDE || '') || null;
export const tier = (tierOverride ?? config.tier) as TenantWebConfig['tier'];
export const mode = bookingMode(tier);

const locales = import.meta.glob<{ default: Content }>('@tenant/content/*.json', { eager: true });

export function getContent(locale: string): Content {
  const find = (l: string) =>
    Object.entries(locales).find(([path]) => path.endsWith(`/${l}.json`))?.[1]?.default;
  const content = find(locale) ?? find(config.defaultLocale);
  if (!content) throw new Error(`Contenido no encontrado para ${locale}`);
  return content;
}

/** URLs finales (hash de Vite) de las fotos del tenant, por nombre de fichero sin extensión. */
const mediaModules = import.meta.glob<string>('@tenant/content/media/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});
export const media: Record<string, string> = Object.fromEntries(
  Object.entries(mediaModules).map(([path, url]) => [path.split('/').pop()!.replace('.webp', ''), url]),
);

/** Ruta localizada: el idioma por defecto vive en la raíz. */
export const localePath = (locale: string, path = '/') =>
  locale === config.defaultLocale ? path : `/${locale}${path === '/' ? '/' : path}`;
