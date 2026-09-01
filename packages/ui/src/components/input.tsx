import * as LabelPrimitive from '@radix-ui/react-label';
import type { ComponentProps } from 'react';
import { cn } from '../lib/cn';

// Input, Textarea y Label del DS (ADR 0020). Altura alineada con `Button` size
// `sm` (h-8) para que un filtro y su botón queden a la misma línea.

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'h-8 w-full rounded-md border border-input bg-background px-2.5 text-[13px] outline-none transition-[color,box-shadow]',
        'placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/60',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/30',
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-[13px] outline-none transition-[color,box-shadow]',
        'placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/60',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        'text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

/** `<select>` nativo con la piel del DS. Para listas cortas de filtro el nativo
 * gana al de Radix: teclado del sistema, cero JS y funciona igual en móvil. */
export function SelectNative({ className, ...props }: ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        'h-8 rounded-md border border-input bg-background px-2 text-[13px] outline-none transition-[color,box-shadow]',
        'focus-visible:ring-[3px] focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
