import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { ComponentProps } from 'react';
import { cn } from '../lib/cn';

/**
 * Capas flotantes y estructura: dropdown-menu, popover, tooltip, tabs, separator.
 * Agrupados porque comparten exactamente el mismo lenguaje de superficie
 * (`bg-popover`, borde, sombra, misma animación de entrada) — tenerlos juntos es
 * lo que impide que se desincronicen con el tiempo.
 */

const surface =
  'z-50 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg outline-none ' +
  'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 motion-reduce:animate-none';

/* ---------- dropdown menu ---------- */

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(surface, 'min-w-[10rem]', className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  variant,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item> & { variant?: 'destructive' }) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        'flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none',
        'focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        variant === 'destructive' &&
          'text-destructive focus:bg-destructive/10 focus:text-destructive',
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn(
        'px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

/* ---------- popover ---------- */

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export function PopoverContent({
  className,
  align = 'start',
  sideOffset = 4,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(surface, 'w-64 p-3', className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

/* ---------- tooltip ---------- */

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  sideOffset = 4,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          'z-50 rounded-md bg-foreground px-2 py-1 text-[12px] text-background shadow-md',
          'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=delayed-open]:fade-in-0 data-[state=closed]:fade-out-0 motion-reduce:animate-none',
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}

/* ---------- tabs ---------- */

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn('inline-flex items-center gap-1 rounded-lg bg-muted p-1', className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'rounded-md px-3 py-1 text-[13px] font-medium text-muted-foreground outline-none transition-colors',
        'focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        className,
      )}
      {...props}
    />
  );
}

export const TabsContent = TabsPrimitive.Content;

/* ---------- separator ---------- */

export function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  );
}
