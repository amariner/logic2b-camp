import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const manifest = JSON.parse(await readFile(join(dist, '.vite', 'manifest.json'), 'utf8'));
const entry = manifest['index.html'];

if (!entry?.isEntry) {
  throw new Error('M6: Vite no ha declarado index.html como entrada del dashboard.');
}

const initialKeys = new Set();
const collectStaticImports = (key) => {
  if (initialKeys.has(key)) return;
  const chunk = manifest[key];
  if (!chunk) throw new Error(`M6: el manifiesto referencia un chunk inexistente: ${key}`);
  initialKeys.add(key);
  for (const imported of chunk.imports ?? []) collectStaticImports(imported);
};
collectStaticImports('index.html');

let initialGzipBytes = 0;
for (const key of initialKeys) {
  const file = manifest[key]?.file;
  if (!file?.endsWith('.js')) continue;
  initialGzipBytes += gzipSync(await readFile(join(dist, file))).byteLength;
}

const BUDGET_BYTES = 200_000;
if (initialGzipBytes >= BUDGET_BYTES) {
  throw new Error(
    `M6: la entrada JS pesa ${(initialGzipBytes / 1000).toFixed(2)} kB gzip; ` +
      `el presupuesto es <${BUDGET_BYTES / 1000} kB.`,
  );
}

for (const page of ['Planning', 'Plano']) {
  const pageKey = Object.keys(manifest).find((key) => key.endsWith(`/pages/${page}.tsx`));
  if (!pageKey || !manifest[pageKey]?.isDynamicEntry) {
    throw new Error(`M6: ${page} debe seguir siendo una entrada dinámica.`);
  }
  if (initialKeys.has(pageKey)) {
    throw new Error(`M6: ${page} ha vuelto al grafo JS inicial.`);
  }
}

const jsFiles = [
  ...new Set(
    Object.values(manifest)
      .map((chunk) => chunk.file)
      .filter((file) => file?.endsWith('.js')),
  ),
];
const emittedSource = (
  await Promise.all(jsFiles.map((file) => readFile(join(dist, file), 'utf8')))
).join('\n');
const scenario = process.env.VITE_DEMO_SCENARIO?.trim();
const scenarioMarkers = {
  pinadamar: ['usr_demo_pinadamar', 'logic2b-demo:pinadamar'],
  serralta: ['usr_demo_serralta', 'logic2b-demo:serralta'],
  vinyes: ['usr_demo_vinyes', 'logic2b-demo:vinyes'],
  mardefondo: ['usr_demo_mardefondo', 'MF-DEMO-001'],
};
for (const [id, markers] of Object.entries(scenarioMarkers)) {
  const present = markers.every((marker) => emittedSource.includes(marker));
  if (id === scenario && !present) {
    throw new Error(`R3: el build ${id} no contiene su adaptador demo completo.`);
  }
  if (id !== scenario && markers.some((marker) => emittedSource.includes(marker))) {
    throw new Error(`R3: el build ${scenario ?? 'normal'} arrastra fixtures de ${id}.`);
  }
}

console.log(
  `M6: entrada JS ${(initialGzipBytes / 1000).toFixed(2)} kB gzip; ` +
    `Planning y Plano bajo demanda; frontera ${scenario ?? 'normal'} limpia.`,
);
