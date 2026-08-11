import delta from '../../../../tenants/delta/content/media/miniatura.webp?url';
import duna from '../../../../tenants/duna/content/media/miniatura.webp?url';
import marDeFondo from '../../../../tenants/mardefondo/content/media/miniatura.webp?url';
import olivar from '../../../../tenants/olivar/content/media/miniatura.webp?url';
import pinadaMar from '../../../../tenants/pinadamar/content/media/miniatura.webp?url';
import riuClar from '../../../../tenants/riuclar/content/media/miniatura.webp?url';
import serralta from '../../../../tenants/serralta/content/media/miniatura.webp?url';
import vinyes from '../../../../tenants/vinyes/content/media/miniatura.webp?url';
import tarongers from '../../../../tenants/tarongers/content/media/miniatura.webp?url';

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
