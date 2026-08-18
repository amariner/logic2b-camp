import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(siteDir, 'dist');
const routes = [
  { file: 'index.html', expected: 24, duplicateCycle: true },
  { file: 'en/index.html', expected: 24, duplicateCycle: true },
  { file: 'temas/index.html', expected: 12, duplicateCycle: false },
  { file: 'en/temas/index.html', expected: 12, duplicateCycle: false },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function attribute(tag, name) {
  return tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`, 'i'))?.[1];
}

function imageTags(html, marker) {
  return [...html.matchAll(new RegExp(`<img\\b(?=[^>]*\\s${marker}="[^"]+")[^>]*>`, 'gi'))].map(
    ([tag]) => tag,
  );
}

function candidates(tag) {
  const srcset = attribute(tag, 'srcset');
  assert(srcset, `miniatura sin srcset: ${tag.slice(0, 160)}`);
  return srcset.split(',').map((candidate) => {
    const match = candidate.trim().match(/^(\S+)\s+(\d+)w$/);
    assert(match, `candidato srcset inválido: ${candidate}`);
    return { url: match[1], width: Number(match[2]) };
  });
}

function outputPath(url) {
  const pathname = new URL(url, 'https://camp.logic2b.com').pathname;
  return path.join(distDir, decodeURIComponent(pathname).replace(/^\//, ''));
}

const mobileRailUrls = new Set();
const mobileCatalogUrls = new Set();

for (const route of routes) {
  const html = await readFile(path.join(distDir, route.file), 'utf8');
  const tags = imageTags(html, 'data-theme-thumbnail');
  assert(
    tags.length === route.expected,
    `${route.file}: ${tags.length}/${route.expected} miniaturas`,
  );
  assert(
    imageTags(html, 'data-theme-thumbnail-fallback').length === 0,
    `${route.file}: alguna miniatura conocida cayó al asset público sin optimizar`,
  );

  const byTheme = new Map();
  for (const tag of tags) {
    const theme = attribute(tag, 'data-theme-thumbnail');
    const sizes = attribute(tag, 'sizes');
    const widths = candidates(tag);
    assert(theme, `${route.file}: miniatura sin identidad`);
    assert(sizes, `${route.file}/${theme}: falta sizes`);
    assert(widths.length === 6, `${route.file}/${theme}: se esperaban seis anchos`);
    assert(
      widths.map(({ width }) => width).join(',') === '240,360,480,640,800,1280',
      `${route.file}/${theme}: escalera responsive inesperada`,
    );

    const signature = `${attribute(tag, 'src')}|${attribute(tag, 'srcset')}|${sizes}`;
    const signatures = byTheme.get(theme) ?? [];
    signatures.push(signature);
    byTheme.set(theme, signatures);

    const target = route.duplicateCycle ? mobileRailUrls : mobileCatalogUrls;
    const selectedWidth = route.duplicateCycle ? 360 : 800;
    target.add(widths.find(({ width }) => width === selectedWidth).url);
  }

  assert(byTheme.size === 12, `${route.file}: deben existir doce temas únicos`);
  for (const [theme, signatures] of byTheme) {
    const expectedCopies = route.duplicateCycle ? 2 : 1;
    assert(
      signatures.length === expectedCopies,
      `${route.file}/${theme}: ${signatures.length} copias`,
    );
    assert(
      new Set(signatures).size === 1,
      `${route.file}/${theme}: el ciclo duplicado genera URLs distintas`,
    );
  }

  if (route.duplicateCycle) {
    const themeCandidates = new Set(
      tags.flatMap((tag) => candidates(tag).map(({ url, width }) => `${width}:${url}`)),
    );
    const portfolioTags = imageTags(html, 'data-portfolio-thumbnail');
    assert(portfolioTags.length === 3, `${route.file}: ${portfolioTags.length}/3 anclas`);
    for (const tag of portfolioTags) {
      const slug = attribute(tag, 'data-portfolio-thumbnail');
      assert(attribute(tag, 'sizes'), `${route.file}/${slug}: ancla sin sizes`);
      for (const { url, width } of candidates(tag)) {
        assert(
          themeCandidates.has(`${width}:${url}`),
          `${route.file}/${slug}: el portfolio no reutiliza el derivado ${width}w del carril`,
        );
      }
    }
  }
}

async function bytes(urls) {
  let total = 0;
  for (const url of urls) total += (await stat(outputPath(url))).size;
  return total;
}

const railBytes = await bytes(mobileRailUrls);
const catalogBytes = await bytes(mobileCatalogUrls);
assert(mobileRailUrls.size === 12, `rail: ${mobileRailUrls.size}/12 salidas móviles únicas`);
assert(
  mobileCatalogUrls.size === 12,
  `catálogo: ${mobileCatalogUrls.size}/12 salidas móviles únicas`,
);
assert(railBytes <= 450 * 1024, `rail móvil: ${(railBytes / 1024).toFixed(1)} KiB > 450 KiB`);
assert(
  catalogBytes <= 900 * 1024,
  `catálogo móvil 2x: ${(catalogBytes / 1024).toFixed(1)} KiB > 900 KiB`,
);

console.log(
  `Miniaturas responsive verificadas: 12 temas, ciclo con URLs compartidas, ` +
    `${(railBytes / 1024).toFixed(1)} KiB a 360w y ${(catalogBytes / 1024).toFixed(1)} KiB a 800w.`,
);
