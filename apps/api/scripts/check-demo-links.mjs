import { access, readdir, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultDist = process.env.DEMO_DIST
  ? path.resolve(process.env.DEMO_DIST)
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../site/dist');
const defaultOrigin = 'https://camp.logic2b.com';
const hrefPattern = /<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/giu;

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) return htmlFiles(filename);
      return entry.isFile() && entry.name.endsWith('.html') ? [filename] : [];
    }),
  );
  return nested.flat();
}

function internalPathname(href, origin) {
  if (href.startsWith('//')) return null;

  if (href.startsWith('/')) return new URL(href, origin).pathname;

  try {
    const url = new URL(href);
    return url.origin === origin ? url.pathname : null;
  } catch {
    return null;
  }
}

function candidatesFor(pathname, dist) {
  const relative = pathname.replace(/^\/+/, '');
  const target = path.resolve(dist, relative);

  // A URL nunca puede salir del bundle que se está validando.
  if (target !== dist && !target.startsWith(`${dist}${path.sep}`)) return [];
  if (pathname.endsWith('/')) return [path.join(target, 'index.html')];
  if (path.extname(pathname)) return [target];

  // Workers Assets redirige las rutas sin barra a su variante con barra.
  return [target, path.join(target, 'index.html')];
}

async function exists(filename) {
  try {
    await access(filename, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Comprueba las rutas navegables internas absolutas del bundle compuesto de la demo.
 * Las URLs externas, los anclajes y el SEO declarativo se dejan fuera: no son rutas
 * que una persona pueda abrir desde una de las tres superficies.
 */
export async function checkDemoLinks({ dist = defaultDist, origin = defaultOrigin } = {}) {
  const absoluteDist = path.resolve(dist);
  // Astro emite `404.html` como documento de fallback, no como la ruta `/404/`.
  // Sus alternates de idioma conservan la URL fallida por diseño y no son enlaces
  // navegables del sitio publicado.
  const files = (await htmlFiles(absoluteDist)).filter((filename) => path.basename(filename) !== '404.html');
  const broken = [];
  let checked = 0;

  for (const filename of files) {
    const html = await readFile(filename, 'utf8');
    for (const match of html.matchAll(hrefPattern)) {
      const href = match[2];
      const pathname = internalPathname(href, origin);
      if (!pathname) continue;

      checked += 1;
      const candidates = candidatesFor(pathname, absoluteDist);
      if (!(await Promise.all(candidates.map(exists))).some(Boolean)) {
        broken.push({ from: path.relative(absoluteDist, filename), href });
      }
    }
  }

  return { broken, checked, files: files.length };
}

async function main() {
  const result = await checkDemoLinks();
  if (result.broken.length > 0) {
    const details = result.broken.map(({ from, href }) => `  ${from} → ${href}`).join('\n');
    throw new Error(`Enlaces internos rotos en el bundle compuesto:\n${details}`);
  }

  console.log(`[demo-links] ${result.checked} enlaces internos en ${result.files} HTML: OK`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
