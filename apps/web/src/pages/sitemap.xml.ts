/**
 * Sitemap por tenant: todas las rutas estáticas × idiomas, con alternates hreflang.
 * Se genera en build — mismas fuentes que las páginas (config, tipos, posts).
 */
import type { APIRoute } from 'astro';
import { config, data, localePath, postSlugs } from '../lib/content';
import { LEGAL_SLUGS } from '../lib/legal';

const paths = [
  '/',
  '/alojamientos',
  ...data.unitTypes.map((t) => `/alojamientos/${t.id}`),
  '/instalaciones',
  '/entorno',
  '/tarifas',
  '/contacto',
  '/blog',
  ...postSlugs.map((slug) => `/blog/${slug}`),
  // legales (ADR 0026 §2.5): entran. Son páginas públicas, indexables y con
  // versión en cada idioma — que un buscador las conozca es correcto y ayuda a
  // que se encuentren sin depender del pie.
  ...LEGAL_SLUGS.map((slug) => `/${slug}`),
];

const url = (locale: string, path: string) => `${config.domain}${localePath(locale, path)}`;

export const GET: APIRoute = () => {
  const entries = paths
    .flatMap((path) =>
      config.locales.map((locale) => {
        const alternates = config.locales
          .map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${url(l, path)}"/>`)
          .join('\n');
        return `  <url>\n    <loc>${url(locale, path)}</loc>\n${alternates}\n  </url>`;
      }),
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries}\n</urlset>\n`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};
