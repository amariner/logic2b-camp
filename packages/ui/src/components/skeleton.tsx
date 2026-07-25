import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

/**
 * Bloque de carga. El criterio (ADR 0020, C3) es que tenga **la forma del
 * contenido real**, no un rectángulo genérico: por eso se compone, no se
 * parametriza. Ver `SkeletonText`/`SkeletonRows` para los casos frecuentes.
 *
 * `prefers-reduced-motion` corta el pulso —quien lo pide no quiere nada
 * latiendo— desde el bloque único de `theme.css`, no desde aquí.
 */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

/** Renglones de texto de ancho decreciente — la forma de un párrafo. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  const widths = ['w-full', 'w-11/12', 'w-4/5', 'w-3/5', 'w-2/3'];
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn('h-3', widths[i % widths.length])} />
      ))}
    </div>
  );
}

/**
 * Filas de tabla con sus columnas. `cols` recibe anchos de Tailwind para que el
 * esqueleto reproduzca la rejilla real de cada pantalla.
 */
export function SkeletonRows({
  rows = 6,
  cols = ['w-24', 'w-40', 'w-20', 'w-16'],
  className,
}: {
  rows?: number;
  cols?: string[];
  className?: string;
}) {
  return (
    <div className={cn('divide-y divide-border', className)} data-slot="skeleton-rows">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-2.5">
          {cols.map((w, c) => (
            <Skeleton key={c} className={cn('h-3', w)} />
          ))}
        </div>
      ))}
    </div>
  );
}
