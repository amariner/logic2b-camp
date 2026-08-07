import marDeFondo from '../../../../tenants/mardefondo/content/media/miniatura.webp?url';
import olivar from '../../../../tenants/olivar/content/media/miniatura.webp?url';
import pinadaMar from '../../../../tenants/pinadamar/content/media/miniatura.webp?url';

/**
 * Una sola fuente para las miniaturas comerciales: el derivado aprobado de
 * cada tenant. Importarlas hace que Vite las versione y que un build falle si
 * alguien elimina el activo que sostiene la tarjeta del portfolio.
 */
export const portfolioImages = {
  olivar,
  pinadamar: pinadaMar,
  mardefondo: marDeFondo,
} as const;

export type PortfolioSlug = keyof typeof portfolioImages;

export function portfolioImage(slug: string | undefined, fallback: string): string {
  return slug && slug in portfolioImages ? portfolioImages[slug as PortfolioSlug] : fallback;
}

export function requiredPortfolioImage(slug: string): string {
  const image = portfolioImage(slug, '');
  if (!image) throw new Error(`Miniatura de portfolio desconocida: ${slug}`);
  return image;
}
