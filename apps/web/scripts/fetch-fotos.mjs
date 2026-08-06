#!/usr/bin/env node
/**
 * Baja y optimiza la sesión de fotos de UN camping.
 *
 *   node apps/web/scripts/fetch-fotos.mjs pinadamar
 *
 * Lee `tenants/{slug}/fotos.json` — que es a la vez el **encargo de arte** (el
 * prompt fijado de cada pieza) y el **manifiesto de descarga** (su URL cuando ya
 * está generada) — y deja los WebP en `tenants/{slug}/content/media/` con los
 * nombres que la web ya espera. No hay nada que tocar en código después: si el
 * fichero existe, la foto se usa; si no, la caja la ocupa `<Materia>`.
 *
 * POR QUÉ ES UN SCRIPT Y NO SE HACE EN LA SESIÓN. El contenedor cloud sale a
 * internet por un proxy con **lista blanca**: npm, GitHub, Anthropic y los
 * servidores MCP pasan; todo lo demás recibe **403 en el CONNECT**. No es la CDN
 * del generador en concreto —`example.com` también da 403—, y no es un fallo de
 * certificado ni de créditos. Por eso el mismo muro reaparece cada pocas
 * sesiones (8, 40, C5, 83): no se arregla reintentando, se arregla en la lista
 * blanca del entorno o corriendo esto fuera. Generar SÍ funciona (la API del
 * generador entra por MCP, no por el proxy), así que el reparto es: la sesión
 * cloud fija prompts y anota URLs aquí; una máquina con salida las aterriza.
 *
 * Perfil de salida: mismo que el resto de tenants — WebP, lado mayor ~2000px,
 * calidad 78. Los másteres no se commitean (`.gitignore`: `*-source.*`).
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const MAX_SIDE = 2000;
const QUALITY = 78;

const slug = process.argv[2];
if (!slug) {
  console.error('Uso: node apps/web/scripts/fetch-fotos.mjs <slug-del-camping>');
  process.exit(1);
}

const raiz = join(dirname(fileURLToPath(new URL('.', import.meta.url))), '..', '..');
const tenantDir = join(raiz, 'tenants', slug);
const outDir = join(tenantDir, 'content', 'media');

/** @type {{ piezas: Record<string, { prompt: string, url?: string, nota?: string }> }} */
const manifiesto = JSON.parse(readFileSync(join(tenantDir, 'fotos.json'), 'utf8'));
const piezas = Object.entries(manifiesto.piezas);
const conUrl = piezas.filter(([, p]) => p.url);
const sinUrl = piezas.filter(([, p]) => !p.url);

console.log(`${slug}: ${piezas.length} piezas · ${conUrl.length} con URL · ${sinUrl.length} por generar`);
if (sinUrl.length > 0) {
  console.log('\nPendientes de generar (el prompt ya está fijado en fotos.json):');
  for (const [nombre] of sinUrl) console.log(`  · ${nombre}`);
  console.log('');
}

await mkdir(outDir, { recursive: true });
let ok = 0;
for (const [nombre, pieza] of conUrl) {
  const res = await fetch(pieza.url);
  if (!res.ok) {
    console.error(`✗ ${nombre}: HTTP ${res.status}`);
    continue;
  }
  const original = sharp(Buffer.from(await res.arrayBuffer())).rotate();
  const meta = await original.metadata();
  const ajustada =
    meta.width && meta.width > MAX_SIDE
      ? original.resize({ width: MAX_SIDE, withoutEnlargement: true })
      : original;
  const webp = await ajustada.webp({ quality: QUALITY }).toBuffer();
  await writeFile(join(outDir, `${nombre}.webp`), webp);
  console.log(`✓ ${nombre}.webp (${(webp.length / 1024).toFixed(0)} KB)`);
  ok++;
}

console.log(
  `\n${ok}/${conUrl.length} aterrizadas en tenants/${slug}/content/media/.` +
    ` Verificar con: TENANT=${slug} BASE_PATH=/demos/${slug} pnpm --filter @logic-camp/web build`,
);
if (sinUrl.length > 0) process.exitCode = 1;
