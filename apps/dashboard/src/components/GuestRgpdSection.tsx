/**
 * Derechos del interesado desde la ficha de cliente (ADR 0026 §2).
 *
 * Existe porque `camp.logic2b.com/docs/tecnica/datos-rgpd/` dice por escrito que
 * "acceso, rectificación, supresión y portabilidad se atienden desde el propio
 * gestor". Hasta hoy eso solo era cierto para quien supiera llamar a la API.
 *
 * Las tres piezas: descargar (art. 15/20), suprimir (art. 17, anonimizando) y el
 * consentimiento, que el panel solo LEÍA. Lo delicado no son los botones: es el
 * mensaje del 409 — un "no se puede" sin fecha es indistinguible de un producto
 * roto, y el camping necesita algo que reenviarle al interesado.
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
  Badge,
  Button,
  Label,
  Spinner,
  Switch,
  toast,
} from '@logic-camp/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  apiDelete,
  apiGet,
  apiPatch,
  retentionHold,
  type GuestDeleteResult,
  type GuestDetail,
  type GuestExport,
  type RetentionHold,
} from '../api';
import { useTieneRol } from '../auth';
import { t, tDyn } from '../i18n';
import { fecha } from '../lib/format';

/**
 * Baja el export como fichero. El nombre lleva id y fecha (identificadores, no
 * texto de interfaz): dos exports del mismo día no se pisan en Descargas.
 */
function descargarJson(datos: GuestExport, guestId: string): void {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = `rgpd-${guestId}-${datos.generatedAt.slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * El aviso del plazo legal. Se queda en pantalla (no es un toast) justamente
 * porque su función es que alguien lo lea entero y lo copie.
 */
function AvisoPlazo({ hold }: { hold: RetentionHold }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-1 rounded-(--lc-radius) border border-border/60 bg-muted/60 p-2.5"
    >
      <p className="font-semibold text-foreground">{t('rgpd.plazo.titulo')}</p>
      <p className="text-muted-foreground">
        {t('rgpd.plazo.desc', {
          base: tDyn(`rgpd.base.${hold.basis}`, t('rgpd.base.generico')),
          fecha: fecha(hold.until),
        })}
      </p>
      <p className="text-muted-foreground">{t('rgpd.plazo.copia')}</p>
    </div>
  );
}

export default function GuestRgpdSection({ guest }: { guest: GuestDetail }) {
  const qc = useQueryClient();
  const puedeGestionar = useTieneRol('manager');
  const puedeEditar = useTieneRol('reception');
  const [hold, setHold] = useState<RetentionHold | null>(null);

  const refrescar = () => {
    void qc.invalidateQueries({ queryKey: ['guest', guest.id] });
    void qc.invalidateQueries({ queryKey: ['guests'] });
  };

  const consentir = useMutation({
    // La respuesta trae el guest ya actualizado, pero no la usamos: el refetch de
    // ['guest', id] es la única fuente de verdad del panel.
    mutationFn: (valor: boolean) =>
      apiPatch<unknown>(`/api/admin/guests/${guest.id}`, { gdprConsent: valor }),
    onSuccess: (_data, valor) => {
      toast.success(valor ? t('rgpd.consent.guardado') : t('rgpd.consent.retirado'));
      refrescar();
    },
    onError: () => toast.error(t('rgpd.consent.error')),
  });

  const exportar = useMutation({
    mutationFn: () => apiGet<GuestExport>(`/api/admin/guests/${guest.id}/export`),
    onSuccess: (datos) => {
      descargarJson(datos, guest.id);
      toast.success(t('rgpd.exportado'));
    },
    onError: () => toast.error(t('rgpd.exportError')),
  });

  const suprimir = useMutation({
    mutationFn: () => apiDelete<GuestDeleteResult>(`/api/admin/guests/${guest.id}`),
    onSuccess: (res) => {
      setHold(null);
      toast.success(res.alreadyDone ? t('rgpd.yaSuprimido') : t('rgpd.suprimido'));
      refrescar();
    },
    onError: (error) => {
      // El plazo legal NO es un error genérico: es la respuesta del producto.
      const bloqueo = retentionHold(error);
      if (bloqueo) {
        setHold(bloqueo);
        return;
      }
      toast.error(t('rgpd.suprimirError'));
    },
  });

  // Ficha ya suprimida: no hay derechos que ejercer ni nada que editar.
  if (guest.anonymizedAt) {
    return (
      <section className="flex flex-col gap-2">
        <h3 className="lc-panel-h">{t('rgpd.titulo')}</h3>
        <Badge variant="muted" className="self-start">
          {t('rgpd.anonimizada.badge')}
        </Badge>
        <p className="text-muted-foreground">
          {t('rgpd.anonimizada.desc', { fecha: fecha(guest.anonymizedAt) })}
        </p>
      </section>
    );
  }

  const consentido = Boolean(guest.gdprConsentAt);

  return (
    <section className="flex flex-col gap-2">
      <h3 className="lc-panel-h">{t('rgpd.titulo')}</h3>

      <div className="flex items-start gap-2">
        <Switch
          id={`rgpd-consent-${guest.id}`}
          checked={consentido}
          disabled={!puedeEditar || consentir.isPending}
          onCheckedChange={(valor) => consentir.mutate(valor)}
          className="mt-0.5"
        />
        <div className="min-w-0">
          <Label
            htmlFor={`rgpd-consent-${guest.id}`}
            className="text-[13px] font-normal normal-case tracking-normal text-foreground"
          >
            {t('rgpd.consent.label')}
          </Label>
          {consentido && guest.gdprConsentAt ? (
            <>
              <p className="tnum text-muted-foreground">
                {t('rgpd.consent.registrado', { fecha: fecha(guest.gdprConsentAt) })}
              </p>
              <p className="tnum text-muted-foreground">
                {guest.gdprConsentVersion
                  ? t('rgpd.consent.version', { version: guest.gdprConsentVersion })
                  : t('rgpd.consent.sinVersion')}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">{t('rgpd.consent.noRegistrado')}</p>
          )}
        </div>
      </div>

      {/* Descargar y suprimir son de gerencia: vuelcan o destruyen datos personales. */}
      {puedeGestionar && (
        <div className="flex flex-col gap-2 border-t border-border/40 pt-2">
          <div>
            <Button
              type="button"
              size="xs"
              variant="outline"
              disabled={exportar.isPending}
              onClick={() => exportar.mutate()}
            >
              {exportar.isPending ? (
                <Spinner className="size-3.5" />
              ) : (
                <Download className="size-3.5" />
              )}
              {exportar.isPending ? t('rgpd.exportando') : t('rgpd.exportar')}
            </Button>
            <p className="mt-1 text-muted-foreground">{t('rgpd.exportAyuda')}</p>
          </div>

          <div>
            {/* Disparador en `destructiveOutline` y confirmación en `destructive`:
                el mismo par que cancelar una reserva o dar de baja una unidad. El
                peso visual va donde está el punto de no retorno. */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  size="xs"
                  variant="destructiveOutline"
                  disabled={suprimir.isPending}
                >
                  {suprimir.isPending ? (
                    <Spinner className="size-3.5" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                  {suprimir.isPending ? t('rgpd.suprimiendo') : t('rgpd.suprimir')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t('confirmar.suprimir.titulo', {
                      nombre: `${guest.name} ${guest.surname}`.trim(),
                    })}
                  </AlertDialogTitle>
                  <AlertDialogDescription>{t('confirmar.suprimir.desc')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('confirmar.cancelar')}</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={() => suprimir.mutate()}>
                    {t('confirmar.suprimir.ok')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <p className="mt-1 text-muted-foreground">{t('rgpd.suprimirAyuda')}</p>
          </div>

          {hold && <AvisoPlazo hold={hold} />}
        </div>
      )}
    </section>
  );
}
