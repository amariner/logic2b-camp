import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

// Botón shadcn/ui con la marca Logic2B (docs/BRAND.md §6).
// Tamaños ajustados a la densidad del dashboard (ADR 0020): la recepcionista
// mira una pantalla llena de filas, no una landing.
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow,opacity] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:opacity-90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
        // Acción destructiva "de fila": pesa menos que `destructive` pero se lee
        // como peligrosa. Sustituye a los botones con `border-mar/50` de ADR 0008.
        destructiveOutline: 'border border-destructive/50 text-destructive hover:bg-destructive/10',
        link: 'text-link underline underline-offset-2 hover:opacity-80',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-[13px]',
        // Densidad: el tamaño real de los botones de fila del dashboard.
        xs: 'h-7 rounded-md px-2.5 text-[12px]',
        icon: 'size-9',
        iconSm: 'size-7',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Renderiza el hijo en lugar de un <button> (enlaces con aspecto de botón). */
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
