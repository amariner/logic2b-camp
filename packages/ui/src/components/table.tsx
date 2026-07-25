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

export type TableProps = ComponentProps<'table'> & {
  /**
   * Clases del contenedor de scroll (el `div` que envuelve la `<table>`), no de
   * la tabla. Existe porque `overflow-x-auto` hace de ese `div` el contenedor de
   * scroll de AMBOS ejes (`overflow-y: visible` computa a `auto` cuando el otro
   * eje no es visible), y entonces un `<thead className="sticky top-0">` se
   * queda pegado a un contenedor que nunca desplaza: la cabecera se va con el
   * scroll de fuera. Una lista a pantalla completa pasa aquí
   * `min-h-0 flex-1 overflow-auto` y el contenedor pasa a ser el que desplaza,
   * que es lo que la cabecera pegajosa necesita.
   */
  containerClassName?: string;
};

export function Table({ className, containerClassName, ...props }: TableProps) {
  return (
    <div className={cn('w-full overflow-x-auto', containerClassName)}>
      <table
        className={cn('w-full caption-bottom border-collapse text-[13px]', className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return (
    <thead
      className={cn(
        '[&_tr]:border-b [&_tr]:border-border',
        // Una cabecera no es una fila clicable: se anula aquí el realce al pasar
        // por encima que `TableRow` aplica a todas sus filas. Va en el DS y no en
        // cada pantalla porque el error es de la primitiva, no de quien la usa.
        '[&_tr]:hover:bg-transparent',
        className,
      )}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return <tbody className={cn('divide-y divide-border', className)} {...props} />;
}

export function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-accent/60 data-[state=selected]:bg-accent',
        className,
      )}
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
