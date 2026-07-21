import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Une clases y resuelve conflictos de Tailwind (última gana). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Anillo de foco del DS, como valor reutilizable.
 *
 * Existe para el caso legítimo en que un elemento ES un botón semántico pero NO
 * puede usar `<Button>`: una fila entera clicable cuya maquetación es una rejilla
 * CSS (`<Button>` es `inline-flex` y la rompería). Antes de ADR 0020 esas filas
 * copiaban las clases a mano — que es exactamente lo que convertía un botón en
 * "crudo". Copiado a mano se desincroniza; importado, no.
 */
export const focusRing = 'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';
