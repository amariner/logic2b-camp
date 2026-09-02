import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(siteDir, 'dist');
const routes = [
  { file: 'index.html', kind: 'home' },
  { file: 'en/index.html', kind: 'home' },
  { file: 'temas/index.html', kind: 'catalog' },
  { file: 'en/temas/index.html', kind: 'catalog' },
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

function tagsWithAttribute(html, marker) {
  return [...html.matchAll(new RegExp(`<[^>]+\\s${marker}(?:="[^"]*")?[^>]*>`, 'gi'))].map(
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

const mobileHomeUrls = new Set();
const mobileCatalogUrls = new Set();

for (const route of routes) {
  const html = await readFile(path.join(distDir, route.file), 'utf8');
  const tags = imageTags(html, 'data-theme-thumbnail');
  // La portada reutiliza cada miniatura tres veces: dos copias del carril y
  // una tarjeta del slider. Los dialogs cargan la demo completa en un iframe.
  const expected = route.kind === 'home' ? 36 : 12;
  assert(tags.length === expected, `${route.file}: ${tags.length}/${expected} miniaturas`);
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

    const signature = `${attribute(tag, 'src')}|${attribute(tag, 'srcset')}`;
    const signatures = byTheme.get(theme) ?? [];
    signatures.push(signature);
    byTheme.set(theme, signatures);

    const target = route.kind === 'home' ? mobileHomeUrls : mobileCatalogUrls;
    const selectedWidth = route.kind === 'home' ? 360 : 800;
    target.add(widths.find(({ width }) => width === selectedWidth).url);
  }

  assert(byTheme.size === 12, `${route.file}: deben existir doce temas únicos`);
  for (const [theme, signatures] of byTheme) {
    const expectedCopies = route.kind === 'home' ? 3 : 1;
    assert(
      signatures.length === expectedCopies,
      `${route.file}/${theme}: ${signatures.length} copias`,
    );
    assert(
      new Set(signatures).size === 1,
      `${route.file}/${theme}: las apariciones generan URLs distintas`,
    );
  }

  if (route.kind === 'home') {
    const showcaseStart = html.indexOf('data-theme-showcase');
    const trackStart = html.indexOf('class="theme-showcase-track"', showcaseStart);
    const dialogsStart = html.indexOf('data-theme-preview-dialog', trackStart);
    assert(showcaseStart >= 0, `${route.file}: falta el slider de temas`);
    assert(trackStart >= 0, `${route.file}: falta el carril del slider`);
    assert(dialogsStart >= 0, `${route.file}: faltan las previews ampliadas`);
    const showcaseTags = imageTags(html.slice(trackStart, dialogsStart), 'data-theme-thumbnail');
    const dialogFrames = tagsWithAttribute(html.slice(dialogsStart), 'data-theme-preview-frame');
    const railTags = imageTags(html.slice(0, showcaseStart), 'data-theme-thumbnail');
    assert(showcaseTags.length === 12, `${route.file}: ${showcaseTags.length}/12 temas en slider`);
    assert(
      dialogFrames.length === 12,
      `${route.file}: ${dialogFrames.length}/12 webs completas en dialogs`,
    );
    assert(railTags.length === 24, `${route.file}: ${railTags.length}/24 temas en carril`);

    for (const [scope, scopedTags, copies] of [
      ['slider', showcaseTags, 1],
      ['carril', railTags, 2],
    ]) {
      const counts = new Map();
      for (const tag of scopedTags) {
        const theme = attribute(tag, 'data-theme-thumbnail');
        counts.set(theme, (counts.get(theme) ?? 0) + 1);
      }
      assert(counts.size === 12, `${route.file}: ${scope} sin los doce temas únicos`);
      for (const [theme, count] of counts) {
        assert(count === copies, `${route.file}/${theme}: ${count}/${copies} copias en ${scope}`);
      }
    }
  }
}

async function bytes(urls) {
  let total = 0;
  for (const url of urls) total += (await stat(outputPath(url))).size;
  return total;
}

const homeBytes = await bytes(mobileHomeUrls);
const catalogBytes = await bytes(mobileCatalogUrls);
assert(mobileHomeUrls.size === 12, `portada: ${mobileHomeUrls.size}/12 salidas móviles únicas`);
assert(
  mobileCatalogUrls.size === 12,
  `catálogo: ${mobileCatalogUrls.size}/12 salidas móviles únicas`,
);
assert(homeBytes <= 450 * 1024, `portada móvil: ${(homeBytes / 1024).toFixed(1)} KiB > 450 KiB`);
assert(
  catalogBytes <= 900 * 1024,
  `catálogo móvil 2x: ${(catalogBytes / 1024).toFixed(1)} KiB > 900 KiB`,
);

console.log(
  `Miniaturas responsive verificadas: 12 temas, carril y slider con URLs compartidas, ` +
    `${(homeBytes / 1024).toFixed(1)} KiB a 360w y ${(catalogBytes / 1024).toFixed(1)} KiB a 800w.`,
);
