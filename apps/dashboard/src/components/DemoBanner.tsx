/**
 * Franja de "esto es una demostración" DENTRO del dashboard (ADR 0029 §5).
 *
 * La web pública ya tiene la suya (`Base.astro`), pero no llega hasta aquí: el
 * visitante que entra por la puerta anónima aterriza en el planning sin ningún
 * contexto. Esta dice la verdad completa en una línea —qué puede tocar y qué
 * no— y lleva el botón que devuelve la demo a su punto de partida.
 *
 * Discreta y fija, nunca modal: no se interrumpe a quien viene a mirar.
 */
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Spinner,
  toast,
} from '@logic-camp/ui';
import { ExternalLink, Info } from 'lucide-react';
import { useResetDemo, useRol } from '../auth';
import { t } from '../i18n';
import { isPinadaScenario } from '../demo/pinadamar';

export default function DemoBanner() {
  const esDemo = useRol() === 'demo';
  const reset = useResetDemo();
  if (!esDemo) return null;
  const webHref = isPinadaScenario ? '/demos/pinadamar/' : '/demo/';

  return (
    <>
      {/* En móvil el aviso vive en la barra superior, junto a búsqueda. No roba
          altura útil ni intenta encajar tres acciones en una sola línea. */}
      <Sheet>
        <div className="absolute right-11 top-0 z-30 flex h-12 items-center md:hidden">
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="iconSm"
              className="size-11"
              aria-label={t('demo.informacion')}
            >
              <Info className="size-5" aria-hidden />
            </Button>
          </SheetTrigger>
        </div>
        <SheetContent side="bottom" className="max-h-[85dvh] rounded-t-xl p-0 md:hidden">
          <SheetHeader>
            <SheetTitle>{t('demo.titulo')}</SheetTitle>
            <SheetDescription className="pr-4 leading-relaxed">
              {t(isPinadaScenario ? 'demo.pinadaBanner' : 'demo.banner')}
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button asChild type="button" variant="outline" className="min-h-11 justify-center">
              <a href={webHref}>
                <ExternalLink className="size-4" aria-hidden />
                {t('demo.verWeb')}
              </a>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="outline" className="min-h-11" disabled={reset.isPending}>
                  {reset.isPending && <Spinner />}
                  {reset.isPending ? t('demo.restableciendo') : t('demo.restablecer')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('demo.restablecerTitulo')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('demo.restablecerCuerpo')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('confirmar.cancelar')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      reset.mutate(undefined, {
                        onSuccess: () => toast.success(t('demo.restablecerOk')),
                        onError: () => toast.error(t('demo.restablecerError')),
                      })
                    }
                  >
                    {t('demo.restablecer')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </SheetContent>
      </Sheet>

      <div className="hidden shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-border bg-muted/60 px-3 py-1.5 text-[13px] text-muted-foreground md:flex">
        <Info className="size-3.5 shrink-0" aria-hidden />
        <p className="min-w-0 flex-1">
          {t(isPinadaScenario ? 'demo.pinadaBanner' : 'demo.banner')}
        </p>
        <Button asChild type="button" variant="ghost" size="sm">
          <a href={webHref}>
            <ExternalLink className="size-3.5" aria-hidden />
            {t('demo.verWeb')}
          </a>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="outline" size="sm" disabled={reset.isPending}>
              {reset.isPending && <Spinner />}
              {reset.isPending ? t('demo.restableciendo') : t('demo.restablecer')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('demo.restablecerTitulo')}</AlertDialogTitle>
              <AlertDialogDescription>{t('demo.restablecerCuerpo')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('confirmar.cancelar')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  reset.mutate(undefined, {
                    onSuccess: () => toast.success(t('demo.restablecerOk')),
                    onError: () => toast.error(t('demo.restablecerError')),
                  })
                }
              >
                {t('demo.restablecer')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
