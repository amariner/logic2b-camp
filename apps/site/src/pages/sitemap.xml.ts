import type { APIRoute } from 'astro';
import { GUIAS, todasLasRutas } from '../lib/docs';
import { LOCALES, localePath } from '../lib/i18n';

const site = 'https://camp.logic2b.com';

/** Todas las rutas del sitio de producto, sin prefijo de idioma. */
function rutas(): string[] {
  return [
    '/',
    'docs/',
    ...GUIAS.map((g) => `docs/${g}/`),
    // Las guías son la superficie de búsqueda larga del producto ("cómo hacer
    // el check-in en un camping"): entran en el sitemap como todo lo demás.
    ...todasLasRutas().map(({ guia, slug }) => `docs/${guia}/${slug}/`),
  ];
}

export const GET: APIRoute = () => {
  const urls = rutas()
    .flatMap((ruta) =>
      LOCALES.map((l) => {
        const loc = new URL(localePath(l, ruta), site).href;
        const alts = LOCALES.map(
          (a) =>
            `    <xhtml:link rel="alternate" hreflang="${a}" href="${new URL(localePath(a, ruta), site).href}"/>`,
        ).join('\n');
        return `  <url>\n    <loc>${loc}</loc>\n${alts}\n  </url>`;
      }),
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;

  return new Response(xml, { headers: { 'content-type': 'application/xml' } });
};
