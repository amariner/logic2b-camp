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
  `Contrato comercial del sitio verificado: ${locales.length * 2} páginas de planes, ${guidePages.length} páginas de guía y ${coveredIndexes.size} índices localizados.`,
);
