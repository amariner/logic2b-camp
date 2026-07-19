/**
 * @logic-camp/ui — el Design System del PRODUCTO Logic2B (dashboard, landing, docs).
 * Ver docs/BRAND.md. El tema vive en ./theme.css; el isotipo en ./brand/logo-mark.svg.
 * Componentes React (shadcn/ui con marca Logic2B) añadidos en B1 (ADR 0017).
 */
export const PACKAGE = '@logic-camp/ui';

/** Marca a mostrar junto al isotipo. */
export const BRAND_NAME = 'Logic2B';

export { cn } from './lib/cn';
export { Button, buttonVariants, type ButtonProps } from './components/button';
export { Badge, badgeVariants, type BadgeProps } from './components/badge';
export {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './components/card';
export { LogoMark } from './components/logo-mark';
