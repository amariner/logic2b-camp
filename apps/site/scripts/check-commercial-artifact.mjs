import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(siteDir, 'dist');
const contentDir = path.join(siteDir, 'src', 'content');
const locales = [
  { code: 'es', prefix: '' },
  { code: 'en', prefix: 'en/' },
];
const guides = ['recepcion', 'gestion', 'dueno', 'tecnica'];
const requiredSecurityHeaders = [
  "Content-Security-Policy: base-uri 'self'; frame-ancestors 'none'; object-src 'none'",
  'Permissions-Policy: camera=(), geolocation=(), microphone=()',
  'Referrer-Policy: strict-origin-when-cross-origin',
  'Strict-Transport-Security: max-age=31536000',
  'X-Content-Type-Options: nosniff',
  'X-Frame-Options: DENY',
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readHtml(relativePath) {
  return readFile(path.join(distDir, relativePath), 'utf8');
}

function decodeText(value) {
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function planStatuses(html) {
  return [...html.matchAll(/<span[^>]*data-plan-status="([^"]+)"[^>]*>([\s\S]*?)<\/span>/gi)].map(
    ([, state, label]) => ({ state, label: decodeText(label) }),
  );
}

function structuredData(fragment) {
  return [
    ...fragment.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi),
  ].map(([, json]) => JSON.parse(json));
}

function assertContact(html, context, label) {
  assert(html.includes('data-logic2b-contact'), `${label}: falta contacto Logic2B`);
  assert(
    html.includes(`data-contact-context="${context}"`),
    `${label}: contexto de contacto incorrecto`,
  );
  assert(html.includes('https://wa.me/34626432316?text='), `${label}: destino WhatsApp incorrecto`);
  assert(html.includes('target="_blank"'), `${label}: el contacto no abre fuera de la operación`);
  assert(
    html.includes('rel="noopener noreferrer"'),
    `${label}: faltan garantías del enlace externo`,
  );
}

async function walk(directory, base = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolute, base)));
    else files.push(path.relative(base, absolute).split(path.sep).join('/'));
  }
  return files;
}

const headersArtifact = await readFile(path.join(distDir, '_headers'), 'utf8');
const headerLines = headersArtifact
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);
assert(headerLines[0] === '/*', '_headers: la regla global debe ser /*');
assert(
  headerLines.filter((line) => line === '/*').length === 1,
  '_headers: debe existir una única regla global',
);
for (const header of requiredSecurityHeaders) {
  assert(headerLines.includes(header), `_headers: falta la cabecera obligatoria «${header}»`);
}

for (const locale of locales) {
  const content = JSON.parse(await readFile(path.join(contentDir, `${locale.code}.json`), 'utf8'));
  const expectedHome = content.niveles.items.map(({ estadoTipo: state, estado: label }) => ({
    state,
    label,
  }));
  const expectedPricing = content.precios.planes.map(({ estadoTipo: state, estado: label }) => ({
    state,
    label,
  }));
  assert(
    JSON.stringify(expectedHome) === JSON.stringify(expectedPricing),
    `${locale.code}: portada y precios divergen en sus estados comerciales`,
  );

  const home = await readHtml(`${locale.prefix}index.html`);
  const pricing = await readHtml(`${locale.prefix}precios/index.html`);
  const themes = await readHtml(`${locale.prefix}temas/index.html`);
  const legalPaths = ['aviso-legal', 'privacidad', 'cookies'];
  assert(
    JSON.stringify(planStatuses(home)) === JSON.stringify(expectedHome),
    `${locale.code}: la portada no muestra exactamente los cuatro estados comerciales`,
  );
  assert(
    JSON.stringify(planStatuses(pricing)) === JSON.stringify(expectedPricing),
    `${locale.code}: precios no muestra exactamente los cuatro estados comerciales`,
  );

  for (const guide of guides) {
    const href = `/${locale.prefix}docs/${guide}/`;
    assert(
      home.includes(`href="${href}"`),
      `${locale.code}: la portada no enlaza la guía ${guide}`,
    );
  }
  assert(home.includes('href="/demo/"'), `${locale.code}: falta el salto a la web demo`);
  assert(home.includes('href="/admin/"'), `${locale.code}: falta el salto al gestor demo`);
  assert(home.includes('GTM-TVDWZ9LC'), `${locale.code}: falta el contenedor GTM comercial`);
  assert(home.includes('data-consent-banner'), `${locale.code}: falta el banner de consentimiento`);
  assertContact(home, 'commercial', `${locale.code}: portada`);
  assertContact(pricing, 'commercial', `${locale.code}: precios`);
  assertContact(themes, 'commercial', `${locale.code}: temas`);
  assert(
    !/<script[^>]+src=["']https:\/\/www\.googletagmanager\.com/i.test(home),
    `${locale.code}: GTM se carga de forma inmediata antes del consentimiento`,
  );
  for (const legalPath of legalPaths) {
    const href = `/${locale.prefix}${legalPath}/`;
    assert(home.includes(`href="${href}"`), `${locale.code}: el footer no enlaza ${legalPath}`);
    const legalHtml = await readHtml(`${locale.prefix}${legalPath}/index.html`);
    assertContact(legalHtml, 'commercial', `${locale.code}/${legalPath}`);
    assert(
      legalHtml.includes('<link rel="canonical"'),
      `${locale.code}/${legalPath}: falta canonical`,
    );
    assert(legalHtml.includes('hreflang="es"'), `${locale.code}/${legalPath}: falta hreflang es`);
    assert(legalHtml.includes('hreflang="en"'), `${locale.code}/${legalPath}: falta hreflang en`);
  }
  const cookies = await readHtml(`${locale.prefix}cookies/index.html`);
  assert(cookies.includes('data-consent-reset'), `${locale.code}: cookies no permite revocar`);
  assert(cookies.includes('_ga'), `${locale.code}: cookies no declara Google Analytics`);
}

const sitemap = await readHtml('sitemap.xml');
const sitemapUrls = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, entry]) => entry);
assert(sitemapUrls.length > 0, 'sitemap: no contiene URLs');
for (const entry of sitemapUrls) {
  assert(/<loc>https:\/\/camp\.logic2b\.com\//.test(entry), 'sitemap: `<loc>` no es absoluta');
  assert(
    /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/.test(entry),
    'sitemap: falta `<lastmod>` con fecha W3C',
  );
}
assert(
  !sitemap.includes('xmlns:xhtml') && !sitemap.includes('<xhtml:'),
  'sitemap: el namespace XHTML impide que algunos navegadores muestren el árbol XML',
);
for (const pathName of ['aviso-legal', 'privacidad', 'cookies']) {
  assert(
    sitemap.includes(`https://camp.logic2b.com/${pathName}/`) &&
      sitemap.includes(`https://camp.logic2b.com/en/${pathName}/`),
    `sitemap: faltan rutas localizadas de ${pathName}`,
  );
}

const allFiles = await walk(distDir);
const guidePages = allFiles.filter((file) =>
  /^(?:en\/)?docs\/(?:recepcion|gestion|dueno|tecnica)(?:\/[^/]+)?\/index\.html$/.test(file),
);
assert(guidePages.length > 0, 'No se encontraron páginas de guía en el artefacto');

const coveredGuides = new Set();
const coveredIndexes = new Set();
for (const file of guidePages) {
  const html = await readHtml(file);
  assertContact(html, 'docs', file);
  const headMatch = html.match(/<head(?:\s[^>]*)?>([\s\S]*?)<\/head>/i);
  assert(headMatch, `${file}: falta <head>`);
  const head = headMatch[1];
  const breadcrumbs = structuredData(head).filter((item) => item['@type'] === 'BreadcrumbList');
  assert(breadcrumbs.length === 1, `${file}: debe haber un BreadcrumbList, y debe estar en <head>`);

  const relativeParts = file.split('/');
  const localized = relativeParts[0] === 'en';
  const docsIndex = localized ? 1 : 0;
  const guide = relativeParts[docsIndex + 1];
  const isGuideIndex = relativeParts.length === (localized ? 4 : 3);
  const localeCode = localized ? 'en' : 'es';
  coveredGuides.add(`${localeCode}:${guide}`);
  if (isGuideIndex) coveredIndexes.add(`${localeCode}:${guide}`);

  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
  assert(canonical, `${file}: falta canonical`);
  const items = breadcrumbs[0].itemListElement;
  assert(Array.isArray(items), `${file}: itemListElement no es una lista`);
  assert(items.length === (isGuideIndex ? 2 : 3), `${file}: número de migas incorrecto`);
  items.forEach((item, index) => {
    assert(item['@type'] === 'ListItem', `${file}: miga ${index + 1} sin tipo ListItem`);
    assert(item.position === index + 1, `${file}: posición discontinua en la miga ${index + 1}`);
    assert(
      typeof item.name === 'string' && item.name.trim(),
      `${file}: miga ${index + 1} sin nombre`,
    );
    assert(
      item.item.startsWith('https://camp.logic2b.com/'),
      `${file}: miga ${index + 1} no absoluta`,
    );
  });
  const prefix = localized ? '/en/' : '/';
  assert(
    items[0].item === `https://camp.logic2b.com${prefix}docs/`,
    `${file}: raíz de migas incorrecta`,
  );
  assert(
    items[1].item === `https://camp.logic2b.com${prefix}docs/${guide}/`,
    `${file}: guía de migas incorrecta`,
  );
  assert(items.at(-1).item === canonical, `${file}: la última miga no coincide con canonical`);

  const bodyWithoutHead = html.replace(headMatch[0], '');
  assert(
    !structuredData(bodyWithoutHead).some((item) => item['@type'] === 'BreadcrumbList'),
    `${file}: BreadcrumbList se ha renderizado fuera de <head>`,
  );
}

for (const locale of locales) {
  for (const guide of guides) {
    assert(
      coveredGuides.has(`${locale.code}:${guide}`),
      `${locale.code}: no se construyó la guía ${guide}`,
    );
    assert(
      coveredIndexes.has(`${locale.code}:${guide}`),
      `${locale.code}: no se construyó el índice ${guide}`,
    );
  }
}

console.log(
  `Contrato comercial y cabeceras del sitio verificados: ${locales.length * 2} páginas de planes, ${guidePages.length} páginas de guía y ${coveredIndexes.size} índices localizados.`,
);
