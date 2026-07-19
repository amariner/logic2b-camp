/** robots.txt por tenant: la API no se rastrea; sitemap con el dominio propio. */
import type { APIRoute } from 'astro';
import { config } from '../lib/content';

export const GET: APIRoute = () =>
  new Response(
    `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${config.domain}/sitemap.xml\n`,
    { headers: { 'content-type': 'text/plain; charset=utf-8' } },
  );
