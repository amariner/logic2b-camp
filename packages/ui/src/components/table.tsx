import type { ComponentProps } from 'react';
import { cn } from '../lib/cn';

/**
 * Tabla del DS (ADR 0020). Sin Radix: es markup y CSS.
 *
 * Densidad deliberada — `py-2` y 13px, NO el `py-4`/14px por defecto de shadcn.
 * La densidad es requisito del producto (CLAUDE.md, "densidad sin ruido"): una
 * recepcionista necesita ver el máximo de filas de un vistazo. Cambiar esto
 * hacia el default de shadcn es una regresión, no una mejora estética.
 */

export function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full caption-bottom border-collapse text-[13px]', className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return <thead className={cn('[&_tr]:border-b [&_tr]:border-border', className)} {...props} />;
}

export function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return <tbody className={cn('divide-y divide-border', className)} {...props} />;
}

export function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return (
    <tr
      className={cn('transition-colors hover:bg-accent/60 data-[state=selected]:bg-accent', className)}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      className={cn(
        'px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return <td className={cn('px-3 py-2 align-middle', className)} {...props} />;
}
