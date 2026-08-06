/**
 * Carga de config + contenido del tenant resuelto en build (alias @tenant).
 * Cero texto en componentes: TODO sale de tenants/{slug}/content/{locale}.json.
 * Los datos de tarifas/fichas salen de @tenant/data — la misma fuente que la D1.
 */
import { bookingMode, type TenantWebConfig } from '@logic-camp/config';
import tenantConfig from '@tenant/config';
import { webData, type WebData, type WebUnitType } from '@tenant/data';
import type { ImageMetadata, MarkdownInstance } from 'astro';

export type TipoCard = { id: string; nombre: string; desc: string; foto: string };
export type Seo = { title: string; description: string };
export type NamedItem = { id: string; nombre: string; desc: string };

export type Content = {
  seo: Seo;
  nav: Record<string, string>;
  /** nombres de los temas de demo (ADR 0009); solo la demo los define */
  temas?: Record<string, string>;
  /** banner + conmutador de nivel de demo (ADR 0013); solo la demo lo define */
  demo?: { banner: string; mostrador?: string; nivel: string; nivel1: string; nivel3: string };
  hero3: { titulo: string; prueba: string };
  hero1: { titulo: string; cta: string };
  ticker: string[];
  mostrador: Record<string, string>;
  tipos: {
    titulo: string;
    subtitulo: string;
    verTodo: string;
    nombres: Record<string, string>;
    cards: TipoCard[];
  };
  entorno: { titulo: string; texto: string };
  form: Record<string, string>;
  footer: Record<string, string>;
  alojamientos: {
    seo: Seo;
    titulo: string;
    intro: string;
    desdeNoche: string;
    verFicha: string;
    consultar: string;
    volver: string;
    parcelas: string;
    alojados: string;
    fichas: Record<string, string>;
    ficha: Record<string, string>;
  };
  instalaciones: { seo: Seo; titulo: string; intro: string; items: NamedItem[] };
  entornoPagina: {
    seo: Seo;
    titulo: string;
    intro: string;
    secciones: { titulo: string; texto: string }[];
    distancias: { titulo: string; items: { lugar: string; valor: string }[] };
  };
  tarifas: {
    seo: Seo;
    titulo: string;
    intro: string;
    tabla: { tipo: string; noche: string };
    temporadas: Record<string, string>;
    suplementos: Record<string, string>;
    extras: { titulo: string; por: Record<string, string>; nombres: Record<string, string> };
    condiciones: { titulo: string; items: string[] };
  };
  contacto: {
    seo: Seo;
    titulo: string;
    intro: string;
    datos: Record<string, string>;
    horario: { titulo: string; texto: string };
    llegar: { titulo: string; texto: string };
  };
  blog: { seo: Seo; titulo: string; intro: string; leerMas: string; volver: string; vacio: string };
  noEncontrada: { titulo: string; texto: string; cta: string };
  reservar: {
    seo: Seo;
    titulo: string;
    intro: string;
    elegir: string;
    noches: string;
    detalle: Record<string, string>;
    titular: Record<string, string>;
    conceptos: Record<string, string>;
    errores: Record<string, string>;
  };
  reserva: {
    seo: Seo;
    titulo: string;
    nueva: string;
    buscar: Record<string, string>;
    estado: Record<string, string>;
    campos: Record<string, string>;
    imprimir: string;
    cancelar: Record<string, string>;
    modificar: Record<string, string>;
    pago: Record<string, string>;
  };
};

export const config: TenantWebConfig = tenantConfig;
export const data: WebData = webData;
export type { WebUnitType };

/** TIER=1 pnpm dev degrada la demo para previsualizar el nivel 1. */
const tierOverride = Number(import.meta.env.TIER_OVERRIDE || '') || null;
export const tier = (tierOverride ?? config.tier) as TenantWebConfig['tier'];
export const mode = bookingMode(tier);
/** El conmutador es atrezzo solo para el build normal de la demo. */
export const demoTierSwitch = config.demoTierSwitch === true && tier === config.tier;

const locales = import.meta.glob<{ default: Content }>('@tenant/content/*.json', { eager: true });

export function getContent(locale: string): Content {
  const find = (l: string) =>
    Object.entries(locales).find(([path]) => path.endsWith(`/${l}.json`))?.[1]?.default;
  const content = find(locale) ?? find(config.defaultLocale);
  if (!content) throw new Error(`Contenido no encontrado para ${locale}`);
  return content;
}

/** URLs finales (hash de Vite) de las fotos del tenant, por nombre sin extensión. */
const mediaModules = import.meta.glob<string>(
  ['@tenant/content/media/*.{webp,jpg,svg,png}', '!@tenant/content/media/*-source.*'],
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
);
export const media: Record<string, string> = Object.fromEntries(
  Object.entries(mediaModules).map(([path, url]) => [
    path
      .split('/')
      .pop()!
      .replace(/\.(webp|jpg|svg|png)$/, ''),
    url,
  ]),
);

/** Las mismas fotos como ImageMetadata → astro:assets genera srcset AVIF/WebP. */
const imageModules = import.meta.glob<{ default: ImageMetadata }>(
  ['@tenant/content/media/*.{webp,jpg}', '!@tenant/content/media/*-source.*'],
  {
    eager: true,
  },
);
export const images: Record<string, ImageMetadata> = Object.fromEntries(
  Object.entries(imageModules).map(([path, mod]) => [
    path
      .split('/')
      .pop()!
      .replace(/\.(webp|jpg)$/, ''),
    mod.default,
  ]),
);

// ---------- blog ----------

export type PostFrontmatter = {
  title: string;
  description: string;
  date: string;
  lang: string;
  photo?: string;
};
export type Post = MarkdownInstance<PostFrontmatter> & { slug: string };

const postModules = import.meta.glob<MarkdownInstance<PostFrontmatter>>(
  '@tenant/content/blog/*.md',
  {
    eager: true,
  },
);
const allPosts: Post[] = Object.entries(postModules).map(([path, mod]) => ({
  ...mod,
  // {slug}.{lang}.md → slug
  slug: path
    .split('/')
    .pop()!
    .replace(/\.[a-z]{2}\.md$/, ''),
}));

/** Slugs únicos, del post más reciente al más antiguo. */
export const postSlugs: string[] = [
  ...new Set(
    allPosts
      .sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date))
      .map((p) => p.slug),
  ),
];

/** Post en el idioma pedido, con fallback al idioma por defecto del tenant. */
export function getPost(slug: string, locale: string): Post | undefined {
  const versions = allPosts.filter((p) => p.slug === slug);
  return (
    versions.find((p) => p.frontmatter.lang === locale) ??
    versions.find((p) => p.frontmatter.lang === config.defaultLocale)
  );
}

/** Posts que se listan para un idioma (versión localizada o fallback), recientes primero. */
export function getPosts(locale: string): Post[] {
  return postSlugs.map((slug) => getPost(slug, locale)).filter((p): p is Post => Boolean(p));
}

// ---------- helpers ----------

/** base del despliegue ('/' en un tenant real, '/demo/' en la demo — ADR 0016). */
const BASE = import.meta.env.BASE_URL;

/**
 * Ruta localizada: el idioma por defecto vive en la raíz del sitio, prefijada por el `base`.
 * Un solo punto: todos los enlaces internos, canonical, hreflang, sitemap y el funnel
 * pasan por aquí, así que respetar el `base` aquí basta para servir la demo bajo /demo/.
 */
export const localePath = (locale: string, path = '/') => {
  const rel = locale === config.defaultLocale ? path : `/${locale}${path === '/' ? '/' : path}`;
  return `${BASE.replace(/\/$/, '')}${rel}`.replace(/\/{2,}/g, '/') || '/';
};

/** Idiomas no-default: rutas prefijadas /{lang}/… (getStaticPaths de [lang]). */
export const extraLocales = config.locales.filter((l) => l !== config.defaultLocale);

/** Céntimos → precio localizado sin decimales de relleno (18 € / €18). */
export const eur = (cents: number, locale: string) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);

/** Rellena placeholders {n}, {precio}, {fecha}… en textos de contenido. */
export const fill = (text: string, vars: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));

/** Fecha ISO → texto localizado (ej. "15 de marzo"). */
export const fecha = (isoDate: string, locale: string, opts?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(locale, opts ?? { day: 'numeric', month: 'long' }).format(
    new Date(`${isoDate}T12:00:00Z`),
  );
