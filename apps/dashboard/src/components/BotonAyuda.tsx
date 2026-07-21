/**
 * El `?` de cada pantalla: abre SU página de la guía (ADR 0025 §5).
 *
 * Lee la ruta activa del router en vez de recibir la pantalla por props: así una
 * pantalla nueva solo tiene que poner `<BotonAyuda />` en su barra, y el destino lo
 * decide el mapa único de `lib/ayuda.ts`.
 *
 * Es un `<a>` de verdad, no un botón con `window.open`: se puede abrir con el botón
 * central, copiar el enlace, o mandárselo a un compañero.
 */
import { Tooltip, TooltipContent, TooltipTrigger, buttonVariants, cn } from '@logic-camp/ui';
import { useRouterState } from '@tanstack/react-router';
import { CircleHelp } from 'lucide-react';
import { t } from '../i18n';
import { ayudaDe } from '../lib/ayuda';

export function BotonAyuda({ className }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const url = ayudaDe(pathname);
  if (!url) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('ayuda.aria')}
          className={cn(buttonVariants({ variant: 'ghost', size: 'iconSm' }), className)}
        >
          <CircleHelp className="size-4" aria-hidden="true" />
        </a>
      </TooltipTrigger>
      <TooltipContent>{t('ayuda.tooltip')}</TooltipContent>
    </Tooltip>
  );
}
