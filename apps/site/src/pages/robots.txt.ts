import type { APIRoute } from 'astro';

// La landing SÍ se indexa (puerta del producto). La demo en /demo/ va noindex por su cuenta.
export const GET: APIRoute = () =>
  new Response(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /api/',
      '',
      'Sitemap: https://camp.logic2b.com/sitemap.xml',
      '',
    ].join('\n'),
    { headers: { 'content-type': 'text/plain' } },
  );
