/**
 * @logic-camp/ui — el Design System del PRODUCTO Logic2B (dashboard, landing, docs).
 * Ver docs/BRAND.md. El tema vive en ./theme.css; el isotipo en ./brand/logo-mark.svg.
 * Componentes React (shadcn/ui con marca Logic2B) añadidos en B1 (ADR 0017);
 * primitivas sobre Radix + sonner añadidas en C2 (ADR 0020).
 */
export const PACKAGE = '@logic-camp/ui';

/** Marca a mostrar junto al isotipo. */
export const BRAND_NAME = 'Logic2B';

export { cn, focusRing } from './lib/cn';

export { Button, buttonVariants, type ButtonProps } from './components/button';
export { Badge, badgeVariants, type BadgeProps } from './components/badge';
export { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/card';
export { LogoMark } from './components/logo-mark';

export { Skeleton, SkeletonText, SkeletonRows } from './components/skeleton';
export { Spinner, EmptyState, ErrorState, type EmptyArt } from './components/states';
export { Toaster, toast } from './components/toast';

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './components/dialog';

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './components/alert-dialog';

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './components/sheet';

export {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type TableProps,
} from './components/table';

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './components/command';

export { Input, Label, SelectNative, Textarea } from './components/input';
export { Checkbox, Switch } from './components/controls';

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './components/overlays';
