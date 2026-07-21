#!/usr/bin/env -S npx tsx
/**
 * Descarga + optimiza la 1ª tanda pendiente de fotos Higgsfield (sesión 8,
 * cerrada en ADR 0024). Los 6 ficheros ya estaban generados; lo único que
 * faltaba era la descarga, bloqueada por política de red del contenedor
 * cloud (docs/adr/0024-c5-fotos-imagen.md §1). Ejecutar desde cualquier
 * máquina con salida a cloudfront.net:
 *
 *   pnpm --filter @tenant/demo fetch:fotos
 *
 * Requiere `sharp` (devDependency de este paquete). Deja los WebP directamente
 * en tenants/demo/content/media/ con el nombre que fotos.ts / Instalaciones.astro
 * ya esperan — sin tocar código.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'content', 'media');

// nombre destino -> URL cruda de Higgsfield (job_display, sesión 8; UUIDs también en docs/BACKLOG.md)
const FOTOS = {
  'tipo-premium':
    'https://d8j0ntlcm91z4.cloudfront.net/user_3EwueYuQyj9CIIhuP4eF24jbxo5/hf_20260718_230032_32b5b013-44b5-4bf4-9ec4-18009cbf00ef.png',
  'tipo-autocaravana':
    'https://d8j0ntlcm91z4.cloudfront.net/user_3EwueYuQyj9CIIhuP4eF24jbxo5/hf_20260718_230034_2ba71b99-2b56-47a6-bcf1-af26efba53b3.png',
  'detalle-bungalow-interior':
    'https://d8j0ntlcm91z4.cloudfront.net/user_3EwueYuQyj9CIIhuP4eF24jbxo5/hf_20260718_230018_f5ac46f2-f0eb-4a47-ab17-ef8ea694f924.png',
  'detalle-glamping-interior':
    'https://d8j0ntlcm91z4.cloudfront.net/user_3EwueYuQyj9CIIhuP4eF24jbxo5/hf_20260718_230020_9bfdfd4b-5563-4f98-8d5b-874f76efb44b.png',
  'instalacion-piscina':
    'https://d8j0ntlcm91z4.cloudfront.net/user_3EwueYuQyj9CIIhuP4eF24jbxo5/hf_20260718_230025_9a9eeb15-b009-47e3-9de8-95d0d6fb0b44.png',
  'instalacion-restaurante':
    'https://d8j0ntlcm91z4.cloudfront.net/user_3EwueYuQyj9CIIhuP4eF24jbxo5/hf_20260718_230027_1cbee642-34bd-4d6a-b992-49d4e38d88b2.png',
};

// mismo perfil que el resto de tenants/demo/content/media/: WebP, lado mayor
// ~2000px, calidad 78 (sesión 8, PROGRESS.md línea 472).
const MAX_SIDE = 2000;
const QUALITY = 78;

async function fetchOne(name, url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status} descargando ${url}`);
  const raw = Buffer.from(await res.arrayBuffer());

  const image = sharp(raw).rotate();
  const meta = await image.metadata();
  const resized =
    meta.width && meta.width > MAX_SIDE
      ? image.resize({ width: MAX_SIDE, withoutEnlargement: true })
      : image;

  const webp = await resized.webp({ quality: QUALITY }).toBuffer();
  await writeFile(join(outDir, `${name}.webp`), webp);
  console.log(`✓ ${name}.webp (${(webp.length / 1024).toFixed(0)} KB)`);
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const entries = Object.entries(FOTOS);
  console.log(`Descargando ${entries.length} fotos a ${outDir}…`);
  for (const [name, url] of entries) {
    await fetchOne(name, url);
  }
  console.log('Hecho. `pnpm --filter @logic-camp/web build` para verificar que se enganchan.');
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
