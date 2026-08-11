/**
 * Documentación de producto (ADR 0025, fase C6).
 *
 * La PROSA vive en Markdown (`src/content/docs/{guia}/{slug}.{lang}.md`), no en los
 * JSON de i18n: es contenido, la misma categoría que el blog del tenant. El CROMO
 * (nav, títulos, avisos) sí sale de `content/{lang}.json`, como el resto de la landing.
 *
 * El mecanismo es el que este repo ya usa para Markdown multi-idioma
 * (`apps/web/src/lib/content.ts` §blog): `import.meta.glob` + `{slug}.{lang}.md` +
 * lectura con fallback al idioma por defecto. No se estrenan content collections:
 * el problema ya estaba resuelto una vez y una segunda forma sería deuda gratis.
 */
import type { MarkdownInstance } from 'astro';
import { DEFAULT_LOCALE, type Locale } from './i18n';

/**
 * Las audiencias del ADR 0025 §4. El orden es el del índice, y es una escalera:
 * mostrador → llevar el negocio → decidir → informático. `gestion` (informes,
 * tarifas, ajustes) se añadió como remate de BACKLOG tras C6.
 */
export const GUIAS = ['recepcion', 'gestion', 'dueno', 'tecnica'] as const;
export type Guia = (typeof GUIAS)[number];

export type DocFrontmatter = {
  /** Título de la página, tal cual se pinta en el H1 y en el índice lateral. */
  title: string;
  /** Una línea: para el `<meta description>` y el subtítulo del índice. */
  description: string;
  /** Idioma de ESTE fichero. El fallback compara contra DEFAULT_LOCALE. */
  lang: Locale;
  /** Posición dentro de su guía. Sin él, el orden sería alfabético (frágil). */
  orden: number;
  /** Último cambio sustancial del contenido, para `<lastmod>` en el sitemap. */
  updated: string;
};

export type Doc = MarkdownInstance<DocFrontmatter> & { guia: Guia; slug: string };

const modules = import.meta.glob<MarkdownInstance<DocFrontmatter>>('../content/docs/**/*.md', {
  eager: true,
});

/** `…/content/docs/{guia}/{slug}.{lang}.md` → { guia, slug }. */
function parsePath(path: string): { guia: Guia; slug: string } {
  const parts = path.split('/');
  const file = parts.pop()!;
  const guia = parts.pop() as Guia;
  return { guia, slug: file.replace(/\.[a-z]{2}\.md$/, '') };
}

const allDocs: Doc[] = Object.entries(modules).map(([path, mod]) => ({
  ...mod,
  ...parsePath(path),
}));

/**
 * Páginas de una guía en el idioma pedido, ordenadas.
 *
 * Fallback por página, no por guía: si mañana se traducen 3 de 13 páginas al inglés,
 * el lector inglés ve esas 3 en inglés y las otras 10 en español, en vez de que la
 * traducción a medias tire toda la guía al castellano. Que una página venga del
 * fallback se avisa en pantalla (`esFallback`), nunca en silencio.
 */
export function getGuia(guia: Guia, locale: Locale): Doc[] {
  const slugs = [...new Set(allDocs.filter((d) => d.guia === guia).map((d) => d.slug))];
  return slugs
    .map((slug) => getDoc(guia, slug, locale))
    .filter((d): d is Doc => d !== undefined)
    .sort((a, b) => a.frontmatter.orden - b.frontmatter.orden);
}

/** Una página concreta, con fallback al idioma por defecto. */
export function getDoc(guia: Guia, slug: string, locale: Locale): Doc | undefined {
  const versions = allDocs.filter((d) => d.guia === guia && d.slug === slug);
  return (
    versions.find((d) => d.frontmatter.lang === locale) ??
    versions.find((d) => d.frontmatter.lang === DEFAULT_LOCALE)
  );
}

/** ¿Esta página se está sirviendo en un idioma distinto al pedido? */
export function esFallback(doc: Doc, locale: Locale): boolean {
  return doc.frontmatter.lang !== locale;
}

/** Todos los pares {guia, slug} — para `getStaticPaths`. Independiente del idioma. */
export function todasLasRutas(): { guia: Guia; slug: string; lastmod: string }[] {
  const vistas = new Set<string>();
  const rutas: { guia: Guia; slug: string; lastmod: string }[] = [];
  for (const d of allDocs) {
    const clave = `${d.guia}/${d.slug}`;
    if (vistas.has(clave)) continue;
    vistas.add(clave);
    const lastmod = allDocs
      .filter((version) => version.guia === d.guia && version.slug === d.slug)
      .map((version) => version.frontmatter.updated)
      .sort()
      .at(-1)!;
    rutas.push({ guia: d.guia, slug: d.slug, lastmod });
  }
  return rutas;
}

/** Anterior/siguiente dentro de la guía, para la navegación del pie. */
export function vecinos(
  guia: Guia,
  slug: string,
  locale: Locale,
): { anterior?: Doc; siguiente?: Doc } {
  const paginas = getGuia(guia, locale);
  const i = paginas.findIndex((d) => d.slug === slug);
  if (i === -1) return {};
  return { anterior: paginas[i - 1], siguiente: paginas[i + 1] };
}
