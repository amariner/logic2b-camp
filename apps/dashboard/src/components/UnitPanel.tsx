/**
 * Panel contextual de UNIDAD en el plano (C4.4): al pinchar una unidad libre o
 * bloqueada no hay reserva que abrir — lo útil es actuar sobre la unidad ahí
 * mismo. Libre → bloquearla (avería, propietario…); bloqueada → levantar el
 * bloqueo (DELETE /api/admin/blocks/:id, que ya existía sin UI que lo llamara).
 * Mismo idiom de panel lateral que la ficha (BookingPanel), en pequeño.
 */
import { errorMutacion } from '../avisos';
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
  SheetClose,
  SheetContent,
  SheetTitle,
  toast,
} from '@logic-camp/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UnitDayState } from '@logic-camp/config';
import { Ban, CalendarRange } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { apiDelete, type PlanningBlock, type PlanningUnit } from '../api';
import { usePuede } from '../auth';
import { t, tDyn } from '../i18n';
import { fecha } from '../lib/format';

const MOBILE_PANEL_QUERY = '(max-width: 767px)';

function useMobilePanel(): boolean {
  const [mobile, setMobile] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(MOBILE_PANEL_QUERY).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(MOBILE_PANEL_QUERY);
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return mobile;
}

export default function UnitPanel({
  unit,
  typeName,
  date,
  state,
  block,
  onClose,
  onBlock,
  onOpenPlanning,
}: {
  unit: PlanningUnit;
  typeName: string;
  date: string;
  /** Solo llega libre o bloqueada: el resto de estados abre la ficha de reserva. */
  state: UnitDayState;
  /** El bloqueo que cubre `date`, resuelto por el llamante (null si está libre). */
  block: PlanningBlock | null;
  onClose: () => void;
  onBlock: () => void;
  onOpenPlanning: () => void;
}) {
  const qc = useQueryClient();
  const puedeBloquear = usePuede('block:manage');
  const panelRef = useRef<HTMLElement>(null);
  const mobile = useMobilePanel();
  const blocked = state.kind === 'blocked';
  const inactive = state.kind === 'inactive';

  // al abrir o cambiar de unidad: foco dentro, como en la ficha
  useEffect(() => {
    panelRef.current?.querySelector<HTMLElement>('button')?.focus();
  }, [unit.id]);

  // Esc cierra aunque el foco haya salido del panel
  useEffect(() => {
    if (mobile) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobile, onClose]);

  const quitar = useMutation({
    mutationFn: (blockId: string) => apiDelete<{ ok: boolean }>(`/api/admin/blocks/${blockId}`),
    onSuccess: () => {
      toast.success(t('bloqueo.quitado'));
      void qc.invalidateQueries({ queryKey: ['planning'] });
    },
    onError: (e) => errorMutacion(e, t('bloqueo.quitarError')),
  });

  const content = (
    <>
      {/* cabecera: código + estado + cerrar */}
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border/60 bg-background px-4 py-2.5">
        <span className="tnum text-[14px] font-semibold">{unit.code}</span>
        <span
          className={`lc-chip ${inactive ? 'st-inactive' : blocked ? 'st-blocked' : 'st-free'}`}
        >
          {inactive
            ? t('inv.inactiva')
            : blocked
              ? t('plano.estado.bloqueada')
              : t('plano.estado.libre')}
        </span>
        {mobile ? (
          <SheetClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="iconSm"
              aria-label={t('plano.unidad.cerrar')}
              className="ml-auto size-11"
            >
              ✕
            </Button>
          </SheetClose>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="iconSm"
            onClick={onClose}
            aria-label={t('plano.unidad.cerrar')}
            className="ml-auto"
          >
            ✕
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 px-4 py-3">
        <div className="text-[13px]">
          <p className="font-medium">{typeName}</p>
          <p className="tnum text-muted-foreground">
            {inactive
              ? t('inv.nota')
              : blocked && block
                ? `${tDyn(`bloqueo.${block.reason}`, block.reason)} · ${fecha(block.dateFrom)} → ${fecha(block.dateTo)}`
                : t('plano.unidad.libreEl', { date: fecha(date) })}
          </p>
        </div>

        {blocked && block && !block.unitId && (
          <p className="text-[12px] text-muted-foreground">{t('plano.unidad.bloqueoTipo')}</p>
        )}

        <div className="flex flex-col gap-1.5">
          {inactive || !puedeBloquear ? null : blocked && block ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={quitar.isPending}>
                  <Ban className="size-4" />
                  {t('bloqueo.quitar')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('confirmar.quitarBloqueo.titulo')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('confirmar.quitarBloqueo.desc')}
                    {!block.unitId && ` ${t('plano.unidad.bloqueoTipo')}`}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('confirmar.cancelar')}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => quitar.mutate(block.id)}>
                    {t('confirmar.quitarBloqueo.ok')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button variant="outline" size="sm" onClick={onBlock}>
              <Ban className="size-4" />
              {t('plano.unidad.bloquear')}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onOpenPlanning}>
            <CalendarRange className="size-4" />
            {t('plano.verEnPlanning')}
          </Button>
        </div>
      </div>
    </>
  );

  if (mobile) {
    return (
      <Sheet open onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          ref={(node) => {
            panelRef.current = node;
          }}
          side="bottom"
          showClose={false}
          onCloseAutoFocus={(event) => event.preventDefault()}
          className="max-h-[60dvh] w-full overflow-y-auto rounded-t-xl p-0 pb-[env(safe-area-inset-bottom)] [&_button]:min-h-11"
        >
          <SheetTitle className="sr-only">{t('plano.unidad.aria', { code: unit.code })}</SheetTitle>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      ref={panelRef}
      role="dialog"
      aria-label={t('plano.unidad.aria', { code: unit.code })}
      className="flex w-[360px] shrink-0 flex-col overflow-y-auto border-l border-border/60 bg-background"
    >
      {content}
    </aside>
  );
}
