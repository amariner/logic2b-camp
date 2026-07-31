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
  Spinner,
  toast,
} from '@logic-camp/ui';
import { ExternalLink, Info } from 'lucide-react';
import { useResetDemo, useRol } from '../auth';
import { t } from '../i18n';

export default function DemoBanner() {
  const esDemo = useRol() === 'demo';
  const reset = useResetDemo();
  if (!esDemo) return null;

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-border bg-muted/60 px-3 py-1.5 text-[13px] text-muted-foreground">
      <Info className="size-3.5 shrink-0" aria-hidden />
      <p className="min-w-0 flex-1">{t('demo.banner')}</p>
      {/* La vuelta a la otra cara de la demo: quien entra por la landing
          directo al mostrador no tiene forma de llegar a la web del camping. */}
      <Button asChild type="button" variant="ghost" size="sm">
        <a href="/demo/">
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
  );
}
