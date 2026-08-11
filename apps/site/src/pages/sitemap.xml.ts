import type { APIRoute } from 'astro';
import { GUIAS, todasLasRutas } from '../lib/docs';
import { LOCALES, localePath } from '../lib/i18n';

const site = 'https://camp.logic2b.com';

type SitemapRoute = { path: string; lastmod: string };

/**
 * Todas las rutas canónicas e indexables del sitio de producto.
 * `lastmod` solo cambia cuando cambia sustancialmente la página: Google ignora
 * `priority` y `changefreq`, y desconfía de fechas que se renuevan en cada build.
 */
function rutas(): SitemapRoute[] {
  return [
    { path: '/', lastmod: '2026-08-11' },
    { path: 'precios/', lastmod: '2026-08-11' },
    { path: 'temas/', lastmod: '2026-08-11' },
    { path: 'aviso-legal/', lastmod: '2026-08-11' },
    { path: 'privacidad/', lastmod: '2026-08-11' },
    { path: 'cookies/', lastmod: '2026-08-11' },
    { path: 'docs/', lastmod: '2026-08-11' },
    ...GUIAS.map((g) => ({ path: `docs/${g}/`, lastmod: '2026-08-11' })),
    // Las guías son la superficie de búsqueda larga del producto ("cómo hacer
    // el check-in en un camping"): entran en el sitemap como todo lo demás.
    ...todasLasRutas().map(({ guia, slug, lastmod }) => ({
      path: `docs/${guia}/${slug}/`,
      lastmod,
    })),
  ];
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export const GET: APIRoute = () => {
  // Los alternates hreflang viven en el `<head>` de cada página. Duplicarlos
  // aquí con `xhtml:link` hace que algunos visores de XML pinten solo el texto.
  const urls = rutas()
    .flatMap(({ path, lastmod }) =>
      LOCALES.map((l) => {
        const loc = escapeXml(new URL(localePath(l, path), site).href);
        return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
      }),
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
};
