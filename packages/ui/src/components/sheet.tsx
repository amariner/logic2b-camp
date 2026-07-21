import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '../lib/cn';

/**
 * Panel lateral (ADR 0020). Comparte primitiva con `Dialog` — un sheet ES un
 * dialog anclado a un borde, no un componente aparte.
 *
 * Es el envoltorio destinado a la ficha de reserva y al alta manual, que hoy son
 * `<aside>` a mano sin trampa de foco ni cierre con Escape.
 */

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

const sides = {
  right:
    'inset-y-0 right-0 h-full border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
  left: 'inset-y-0 left-0 h-full border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
  bottom:
    'inset-x-0 bottom-0 border-t data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
} as const;

export function SheetContent({
  className,
  children,
  side = 'right',
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { side?: keyof typeof sides }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-foreground/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 motion-reduce:animate-none" />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-50 flex flex-col border-border bg-background shadow-lg outline-none',
          'data-[state=open]:animate-in data-[state=closed]:animate-out motion-reduce:animate-none',
          sides[side],
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <X className="size-4" />
          <span className="sr-only">Cerrar</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function SheetHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-1 border-b border-border p-4 pr-10', className)}
      {...props}
    />
  );
}

export function SheetTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('text-[15px] font-semibold leading-none', className)}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn('text-[13px] text-muted-foreground', className)}
      {...props}
    />
  );
}
