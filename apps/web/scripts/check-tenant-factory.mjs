#!/usr/bin/env node
/**
 * Contrato ejecutable de la fábrica de identidades (R8).
 *
 * No construye una lista de marcas en el core: descubre `tenants/*` y valida
 * que cada identidad se pueda expresar con configuración, brief, contenido,
 * tokens y media. Los conceptos del catálogo usan el mismo brief antes de
 * convertirse en tenant durante R9.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const tenantsDir = join(repo, 'tenants');
const conceptsDir = join(repo, 'docs/theme-briefs');
const REQUIRED_TOKENS = [
  'tinta',
  'hueso',
  'pino',
  'arena',
  'mar',
  'pino-oscuro',
  'tinta-suave',
  'arena-suave',
  'font-display',
  'font-text',
  'radius',
  'radius-sm',
  'radius-md',
  'radius-lg',
];
const PALETTE_TOKENS = ['tinta', 'hueso', 'pino', 'arena', 'mar'];
const BRIEF_TEXT_FIELDS = [
  'id',
  'name',
  'status',
  'icp',
  'objection',
  'commercialLevel',
  'story',
  'tone',
  'typography',
  'successCriterion',
];

function fail(message) {
  throw new Error(`[factory] ${message}`);
}

function read(path) {
  return readFileSync(path, 'utf8');
}

function json(path) {
  try {
    return JSON.parse(read(path));
  } catch (error) {
    fail(`${path}: JSON inválido (${error instanceof Error ? error.message : String(error)})`);
  }
}

function list(value, label, min = 1) {
  if (
    !Array.isArray(value) ||
    value.length < min ||
    value.some((item) => typeof item !== 'string' || item.trim().length < 3)
  ) {
    fail(`${label}: requiere al menos ${min} texto(s) no vacíos`);
  }
}

function requiredText(value, label) {
  if (typeof value !== 'string' || value.trim().length < 2) fail(`${label}: falta texto`);
}

function validateHumanContent(slug, locale, content) {
  const label = `${slug}/content/${locale}.json`;
  if (content.vida) {
    requiredText(content.vida.titulo, `${label}: vida.titulo`);
    requiredText(content.vida.intro, `${label}: vida.intro`);
    if (
      !Array.isArray(content.vida.escenas) ||
      content.vida.escenas.length < 2 ||
      content.vida.escenas.length > 3
    ) {
      fail(`${label}: vida.escenas requiere dos o tres escenas`);
    }
    for (const [index, scene] of content.vida.escenas.entries()) {
      requiredText(scene.foto, `${label}: vida.escenas[${index}].foto`);
      requiredText(scene.titulo, `${label}: vida.escenas[${index}].titulo`);
      requiredText(scene.texto, `${label}: vida.escenas[${index}].texto`);
      if (!existsSync(join(tenantsDir, slug, 'content/media', `${scene.foto}.webp`))) {
        fail(`${label}: vida.escenas[${index}] referencia una foto inexistente`);
      }
    }
  }

  const routes = content.entornoPagina?.rutas;
  if (!routes) return;
  requiredText(routes.titulo, `${label}: entornoPagina.rutas.titulo`);
  requiredText(routes.intro, `${label}: entornoPagina.rutas.intro`);
  requiredText(routes.aviso, `${label}: entornoPagina.rutas.aviso`);
  for (const key of ['duracion', 'dificultad', 'salida', 'momento', 'mapa']) {
    requiredText(routes.etiquetas?.[key], `${label}: entornoPagina.rutas.etiquetas.${key}`);
  }
  if (!Array.isArray(routes.items) || routes.items.length !== 3) {
    fail(`${label}: entornoPagina.rutas.items requiere exactamente tres planes`);
  }
  for (const [index, route] of routes.items.entries()) {
    for (const key of [
      'nombre',
      'resumen',
      'tipo',
      'duracion',
      'dificultad',
      'salida',
      'momento',
      'recomendacion',
      'foto',
    ]) {
      requiredText(route[key], `${label}: entornoPagina.rutas.items[${index}].${key}`);
    }
    if (!existsSync(join(tenantsDir, slug, 'content/media', `${route.foto}.webp`))) {
      fail(`${label}: entornoPagina.rutas.items[${index}] referencia una foto inexistente`);
    }
    if (route.mapaUrl && !/^https:\/\//.test(route.mapaUrl)) {
      fail(`${label}: entornoPagina.rutas.items[${index}].mapaUrl debe usar HTTPS`);
    }
  }
}

function validateBrief(brief, label, { allowTodos = false } = {}) {
  if (!brief || typeof brief !== 'object' || brief.version !== 1)
    fail(`${label}: version debe ser 1`);
  for (const key of BRIEF_TEXT_FIELDS) {
    const value = brief[key];
    if (typeof value !== 'string' || value.trim().length < 3) fail(`${label}: falta ${key}`);
    if (!allowTodos && value.includes('__TODO__')) fail(`${label}: ${key} sigue pendiente`);
  }
  if (!brief.palette || typeof brief.palette !== 'object') fail(`${label}: falta palette`);
  for (const token of PALETTE_TOKENS) {
    const value = brief.palette[token];
    if (typeof value !== 'string' || !/^#[\da-f]{6}$/i.test(value)) {
      fail(`${label}: palette.${token} debe ser un hex de seis dígitos`);
    }
  }
  list(brief.signatureScreens, `${label}: signatureScreens`, 2);
  list(brief.photoInventory, `${label}: photoInventory`, 3);
  return brief;
}

function configArray(source, field) {
  const match = source.match(new RegExp(`\\b${field}\\s*:\\s*\\[([^\\]]*)\\]`));
  if (!match) return [];
  return [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map((item) => item[1]);
}

function configString(source, field) {
  return source.match(new RegExp(`\\b${field}\\s*:\\s*['"]([^'"]+)['"]`))?.[1];
}

function cssRules(source) {
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: match[1].trim(),
    vars: Object.fromEntries(
      [...match[2].matchAll(/--lc-([\w-]+)\s*:\s*([^;]+);/g)].map((item) => [
        item[1],
        item[2].trim(),
      ]),
    ),
  }));
}

function contrast(a, b) {
  const luminance = (hex) => {
    const channels = hex
      .slice(1)
      .match(/../g)
      .map((value) => Number.parseInt(value, 16) / 255)
      .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

function validatePalette(vars, label) {
  for (const token of PALETTE_TOKENS) {
    if (!/^#[\da-f]{6}$/i.test(vars[token] ?? '')) fail(`${label}: --lc-${token} debe ser hex`);
  }
  for (const foreground of ['tinta', 'pino', 'mar']) {
    const ratio = contrast(vars[foreground], vars.hueso);
    if (ratio < 4.5)
      fail(`${label}: --lc-${foreground} / --lc-hueso = ${ratio.toFixed(2)}, requiere AA 4.5`);
  }
}

function validateTheme(slug, source, demoThemes, brief) {
  const rules = cssRules(source);
  const baseRules = rules.filter((rule) => rule.selector === ':root');
  const base = Object.assign({}, ...baseRules.map((rule) => rule.vars));
  for (const token of REQUIRED_TOKENS) {
    if (!base[token]) fail(`${slug}/theme.css: falta --lc-${token}`);
  }
  if (
    !base['radius-sm'].includes('var(--lc-radius)') ||
    base['radius-md'] !== 'var(--lc-radius)' ||
    !base['radius-lg'].includes('var(--lc-radius)')
  ) {
    fail(`${slug}/theme.css: la escala de radios debe derivar de --lc-radius`);
  }
  validatePalette(base, `${slug}/theme.css :root`);
  for (const token of PALETTE_TOKENS) {
    if (brief.palette[token].toLowerCase() !== base[token].toLowerCase()) {
      fail(`${slug}: identity.json y theme.css discrepan en ${token}`);
    }
  }

  const declared = new Set(demoThemes.slice(1));
  const selectors = new Set(
    rules.flatMap((rule) =>
      [...rule.selector.matchAll(/:root\[data-theme=['"]([^'"]+)['"]\]/g)].map((match) => match[1]),
    ),
  );
  if (
    [...selectors].some((theme) => !declared.has(theme)) ||
    [...declared].some((theme) => !selectors.has(theme))
  ) {
    fail(`${slug}/theme.css: config.demoThemes y selectores data-theme no coinciden`);
  }
  for (const theme of demoThemes) {
    const swatch = rules.some(
      (rule) =>
        rule.selector.includes(`data-swatch='${theme}'`) ||
        rule.selector.includes(`data-swatch="${theme}"`),
    );
    if (!swatch) fail(`${slug}/theme.css: falta muestra data-swatch para ${theme}`);
    if (theme === demoThemes[0]) continue;
    const overlay = Object.assign(
      {},
      ...rules
        .filter(
          (rule) =>
            rule.selector.includes(`data-theme='${theme}'`) ||
            rule.selector.includes(`data-theme="${theme}"`),
        )
        .map((rule) => rule.vars),
    );
    validatePalette({ ...base, ...overlay }, `${slug}/theme.css [data-theme=${theme}]`);
  }
}

async function validateManifest(slug, path, { requireFiles = true } = {}) {
  const manifest = json(path);
  if (
    !manifest.procedencia ||
    !['generada', 'licenciada', 'cliente', 'legado-documentado'].includes(manifest.procedencia.tipo)
  ) {
    fail(`${slug}/fotos.json: procedencia.tipo ausente o inválido`);
  }
  for (const field of ['fuente', 'licencia', 'nota']) {
    if (
      typeof manifest.procedencia[field] !== 'string' ||
      manifest.procedencia[field].trim().length < 3
    ) {
      fail(`${slug}/fotos.json: falta procedencia.${field}`);
    }
  }
  const pieces = manifest.piezas;
  if (!pieces || typeof pieces !== 'object' || Object.keys(pieces).length < 1)
    fail(`${slug}/fotos.json: no contiene piezas`);
  for (const [name, piece] of Object.entries(pieces)) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) fail(`${slug}/fotos.json: nombre inseguro ${name}`);
    if (typeof piece.prompt !== 'string' || piece.prompt.trim().length < 20)
      fail(`${slug}/fotos.json: prompt incompleto ${name}`);
    if (!/^\d+:\d+$/.test(piece.aspecto ?? ''))
      fail(`${slug}/fotos.json: aspecto inválido ${name}`);
    if (requireFiles) {
      const file = join(tenantsDir, slug, 'content/media', `${name}.webp`);
      if (!existsSync(file)) fail(`${slug}/fotos.json: falta el final aprobado ${name}.webp`);
      const bytes = statSync(file).size;
      if (bytes > 750 * 1024) fail(`${slug}/${name}.webp: supera 750 KB`);
      const metadata = await sharp(file).metadata();
      if (
        !metadata.width ||
        !metadata.height ||
        Math.max(metadata.width, metadata.height) > 2000 ||
        Math.max(metadata.width, metadata.height) < 900
      ) {
        fail(`${slug}/${name}.webp: dimensiones fuera del rango 900–2000 px`);
      }
    }
  }
  for (const batch of manifest.lotes ?? []) {
    if (!Array.isArray(batch) || batch.length < 1 || batch.length > 2)
      fail(`${slug}/fotos.json: cada lote debe contener una o dos piezas`);
    for (const name of batch)
      if (!pieces[name]) fail(`${slug}/fotos.json: lote referencia ${name} desconocida`);
  }
  if (!manifest.derivados || !pieces[manifest.derivados.fuente])
    fail(`${slug}/fotos.json: derivados.fuente no referencia una pieza`);
  if (requireFiles) {
    const media = join(tenantsDir, slug, 'content/media');
    const derivatives = [
      ['miniatura.webp', 320 * 1024, 1600, 1000],
      ['og.jpg', 180 * 1024, 1200, 630],
      ['apple-touch-icon.png', 40 * 1024, 180, 180],
    ];
    for (const [name, limit, width, height] of derivatives) {
      const file = join(media, name);
      if (!existsSync(file)) fail(`${slug}: falta derivado ${name}`);
      if (statSync(file).size > limit)
        fail(`${slug}/${name}: supera ${Math.round(limit / 1024)} KB`);
      const metadata = await sharp(file).metadata();
      if (metadata.width !== width || metadata.height !== height)
        fail(`${slug}/${name}: requiere ${width}×${height}`);
    }
  }
}

const tenantSlugs = readdirSync(tenantsDir)
  .filter((slug) => slug !== '_template' && statSync(join(tenantsDir, slug)).isDirectory())
  .sort();

for (const slug of tenantSlugs) {
  const dir = join(tenantsDir, slug);
  for (const rel of [
    'config.ts',
    'theme.css',
    'data.ts',
    'custom/hooks.ts',
    'identity.json',
    'fotos.json',
  ]) {
    if (!existsSync(join(dir, rel))) fail(`${slug}: falta ${rel}`);
  }
  const config = read(join(dir, 'config.ts'));
  if (configString(config, 'slug') !== slug) fail(`${slug}/config.ts: slug incoherente`);
  const locales = configArray(config, 'locales');
  const defaultLocale = configString(config, 'defaultLocale');
  if (locales.length < 1 || !locales.includes(defaultLocale))
    fail(`${slug}/config.ts: locales/defaultLocale incoherentes`);
  for (const locale of locales) {
    const content = join(dir, 'content', `${locale}.json`);
    if (!existsSync(content)) fail(`${slug}: falta content/${locale}.json`);
    validateHumanContent(slug, locale, json(content));
  }
  const brief = validateBrief(json(join(dir, 'identity.json')), `${slug}/identity.json`);
  if (brief.id !== slug) fail(`${slug}/identity.json: id incoherente`);
  validateTheme(slug, read(join(dir, 'theme.css')), configArray(config, 'demoThemes'), brief);
  await validateManifest(slug, join(dir, 'fotos.json'));
}

const templateBrief = validateBrief(
  json(join(tenantsDir, '_template', 'identity.json')),
  '_template/identity.json',
  { allowTodos: true },
);
validateTheme('_template', read(join(tenantsDir, '_template', 'theme.css')), [], templateBrief);
await validateManifest('_template', join(tenantsDir, '_template', 'fotos.json'), {
  requireFiles: false,
});

const conceptSlugs = ['familiar', 'parcela'];
for (const slug of conceptSlugs) {
  const brief = validateBrief(json(join(conceptsDir, `${slug}.json`)), `theme-briefs/${slug}.json`);
  if (brief.id !== slug || brief.status !== 'catalog-concept')
    fail(`theme-briefs/${slug}.json: identidad/estado incoherente`);
}
const catalog = json(join(repo, 'apps/site/src/content/es.json')).temas.items;
const nonNavigableItems = catalog.filter((item) => !item.href);
if (nonNavigableItems.length > 0)
  fail(
    `catálogo ES: quedan conceptos sin demo (${nonNavigableItems.map((item) => item.slug).join(', ')})`,
  );
const soldhivernItem = catalog.find((item) => item.slug === 'soldhivern');
if (!soldhivernItem || soldhivernItem.href !== '/demos/soldhivern/')
  fail("catálogo ES: Sol d'Hivern debe enlazar a su demo navegable");

// Regresión del escape hallado en R8: el formulario común llegó a escribir el
// slug, id de solicitud y tipo de unidad de una demo concreta. La clave se
// deriva ahora de config/data; ningún tenant nuevo necesita editar el componente.
const enquirySource = read(join(repo, 'apps/web/src/components/EnquiryForm.astro'));
for (const leaked of ['logic2b-demo:pinadamar', 'enq_pinada_web', "'ut_bungalow'"]) {
  if (enquirySource.includes(leaked))
    fail(`EnquiryForm.astro conserva identidad concreta: ${leaked}`);
}

const baseSource = read(join(repo, 'apps/web/src/layouts/Base.astro'));
for (const required of ['logic2bContactEnabled(config)', '<Logic2BContact locale={locale}']) {
  if (!baseSource.includes(required)) fail(`Base.astro pierde el interruptor B5: ${required}`);
}
for (const forbidden of ['626 432 316', '34626432316', 'wa.me/']) {
  if (baseSource.includes(forbidden))
    fail(`Base.astro duplica el destino de plataforma en vez de usar config/contact: ${forbidden}`);
}
for (const required of [
  'fixedStayId',
  "unitTypeId: data.get('stay') || defaultStayId",
  "unitTypeId: data.get('stay') || undefined",
]) {
  if (!enquirySource.includes(required))
    fail(`EnquiryForm.astro pierde el contrato de solicitud contextual: ${required}`);
}

console.log(
  `[factory] ✓ ${tenantSlugs.length} tenants + plantilla + ${conceptSlugs.length} briefs (${catalog.length} demos en catálogo) cumplen el contrato R8`,
);
