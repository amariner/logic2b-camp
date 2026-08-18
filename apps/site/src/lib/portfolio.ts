import type { ImageMetadata } from 'astro';
import delta from '../../../../tenants/delta/content/media/miniatura.webp';
import duna from '../../../../tenants/duna/content/media/miniatura.webp';
import marDeFondo from '../../../../tenants/mardefondo/content/media/miniatura.webp';
import olivar from '../../../../tenants/olivar/content/media/miniatura.webp';
import pinadaMar from '../../../../tenants/pinadamar/content/media/miniatura.webp';
import riuClar from '../../../../tenants/riuclar/content/media/miniatura.webp';
import serralta from '../../../../tenants/serralta/content/media/miniatura.webp';
import vinyes from '../../../../tenants/vinyes/content/media/miniatura.webp';
import tarongers from '../../../../tenants/tarongers/content/media/miniatura.webp';
import carrasca from '../../../../tenants/carrasca/content/media/miniatura.webp';
import ballena from '../../../../tenants/ballena/content/media/miniatura.webp';
import soldhivern from '../../../../tenants/soldhivern/content/media/miniatura.webp';

/**
 * Una sola fuente para las miniaturas comerciales: el derivado aprobado de
 * cada tenant. Importarlas hace que Vite las versione y que un build falle si
 * alguien elimina el activo que sostiene la tarjeta del portfolio.
 */
export const portfolioImages = {
  delta,
  duna,
  olivar,
  pinadamar: pinadaMar,
  mardefondo: marDeFondo,
  riuclar: riuClar,
  serralta,
  vinyes,
  tarongers,
  carrasca,
  ballena,
  soldhivern,
} as const;

export type PortfolioSlug = keyof typeof portfolioImages;
export type PortfolioImage = ImageMetadata | string;

/**
 * Un mismo conjunto de transformaciones sirve al carril, al catálogo y a las
 * tres tarjetas de portfolio. Así Astro reutiliza URLs entre copias del bucle
 * en vez de crear derivados distintos para cada consumidor.
 */
export const PORTFOLIO_IMAGE_WIDTHS = [240, 360, 480, 640, 800, 1280];
export const PORTFOLIO_IMAGE_QUALITY = 72;

export function portfolioImage(slug: string | undefined, fallback: string): PortfolioImage {
  return slug && slug in portfolioImages ? portfolioImages[slug as PortfolioSlug] : fallback;
}

export function requiredPortfolioImage(slug: string): ImageMetadata {
  const image = portfolioImage(slug, '');
  if (typeof image === 'string') throw new Error(`Miniatura de portfolio desconocida: ${slug}`);
  return image;
}
