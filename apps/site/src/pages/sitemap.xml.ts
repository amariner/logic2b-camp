import type { APIRoute } from 'astro';
import { LOCALES, localePath } from '../lib/i18n';

const site = 'https://camp.logic2b.com';

export const GET: APIRoute = () => {
  const urls = LOCALES.map((l) => {
    const loc = new URL(localePath(l), site).href;
    const alts = LOCALES.map(
      (a) => `    <xhtml:link rel="alternate" hreflang="${a}" href="${new URL(localePath(a), site).href}"/>`,
    ).join('\n');
    return `  <url>\n    <loc>${loc}</loc>\n${alts}\n  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;

  return new Response(xml, { headers: { 'content-type': 'application/xml' } });
};
