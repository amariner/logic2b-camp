import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { checkDemoLinks } from './check-demo-links.mjs';

async function fixture(files) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'logic-camp-links-'));
  await Promise.all(
    Object.entries(files).map(async ([filename, content]) => {
      const target = path.join(directory, filename);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, content);
    }),
  );
  return directory;
}

test('acepta rutas navegables de las tres superficies y la barra final automática', async (t) => {
  const dist = await fixture({
    'index.html': '<a href="/demo/">Demo</a><a href="/admin/">Gestor</a><link href="/_astro/site.css">',
    'demo/index.html': '<a href="/demo/reservar">Reservar</a>',
    'demo/reservar/index.html': '<a href="https://camp.logic2b.com/admin/">Gestor</a>',
    'admin/index.html': '<a href="https://logic2b.com/">Logic2B</a>',
    '_astro/site.css': '',
  });
  t.after(() => rm(dist, { force: true, recursive: true }));

  const result = await checkDemoLinks({ dist });
  assert.equal(result.broken.length, 0);
  assert.equal(result.checked, 4);
});

test('informa cada enlace interno que no existe y omite anclajes y enlaces externos', async (t) => {
  const dist = await fixture({
    'index.html': '<a href="/demo/perdida/">Rota</a><a href="#contacto">Ancla</a><a href="mailto:hola@example.com">Correo</a>',
  });
  t.after(() => rm(dist, { force: true, recursive: true }));

  const result = await checkDemoLinks({ dist });
  assert.deepEqual(result.broken, [{ from: 'index.html', href: '/demo/perdida/' }]);
  assert.equal(result.checked, 1);
});

test('no trata el documento fallback 404.html como una ruta publicada', async (t) => {
  const dist = await fixture({
    '404.html': '<a href="/demo/404">Ruta de fallback</a>',
  });
  t.after(() => rm(dist, { force: true, recursive: true }));

  const result = await checkDemoLinks({ dist });
  assert.deepEqual(result, { broken: [], checked: 0, files: 0 });
});
