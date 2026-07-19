/**
 * Foto(s) de cada tipo de alojamiento con fallback a la foto de familia.
 * Las claves son nombres de fichero en tenants/{slug}/content/media/ —
 * si el tenant añade una foto específica del tipo, se usa sola, sin tocar código.
 */
import type { ImageMetadata } from 'astro';
import { images } from './content';

const principal: Record<string, string[]> = {
  ut_std: ['tipo-parcela'],
  ut_conf: ['tipo-parcela'],
  ut_prem: ['tipo-premium', 'tipo-parcela'],
  ut_moto: ['tipo-autocaravana', 'tipo-parcela'],
  ut_bung4: ['tipo-bungalow'],
  ut_bung6: ['tipo-bungalow'],
  ut_mobil: ['tipo-bungalow'],
  ut_glamp: ['tipo-glamping'],
};

const detalle: Record<string, string[]> = {
  ut_bung4: ['detalle-bungalow-interior'],
  ut_bung6: ['detalle-bungalow-interior'],
  ut_mobil: ['detalle-bungalow-interior'],
  ut_glamp: ['detalle-glamping-interior'],
  ut_prem: ['hero-dia'],
  ut_std: ['textura-lona'],
  ut_conf: ['textura-lona'],
  ut_moto: ['textura-lona'],
};

const resolve = (keys: string[] = []): ImageMetadata | undefined =>
  keys.map((k) => images[k]).find((i): i is ImageMetadata => Boolean(i));

export const fotoTipo = (unitTypeId: string): ImageMetadata =>
  resolve(principal[unitTypeId]) ?? images['tipo-parcela']!;

/** Galería del detalle: principal + interior/ambiente, sin duplicados. */
export const galeriaTipo = (unitTypeId: string): ImageMetadata[] => {
  const fotos = [fotoTipo(unitTypeId), resolve(detalle[unitTypeId])].filter(
    (i): i is ImageMetadata => Boolean(i),
  );
  return [...new Set(fotos)];
};
