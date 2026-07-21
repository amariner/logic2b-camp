/**
 * Inventario (ADR 0008, sesión 19): unidades por tipo con alta/baja de servicio.
 * Dar de baja NO toca reservas existentes; solo saca la unidad del cupo y de las
 * asignaciones nuevas. Cambiar el estado exige gerencia — el servidor manda.
 *
 * C3 (ADR 0020): la baja se confirma (es destructiva de cupo), el feedback va
 * por toast y la carga tiene la forma real de las fichas de unidad.
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
  Skeleton,
  toast,
} from '@logic-camp/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch, type Catalog } from '../api';
import { QueryError } from '../components/QueryError';
import { t } from '../i18n';
import { BotonAyuda } from '../components/BotonAyuda';

/** Esqueleto con la forma real: dos bloques de tipo con su hilera de códigos. */
function InventarioEsqueleto() {
  return (
    <div aria-busy="true" className="p-4">
      {[0, 1].map((s) => (
        <section key={s} className="mb-5">
          <Skeleton className="mb-2 h-2.5 w-40" />
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: s === 0 ? 12 : 8 }, (_, i) => (
              <Skeleton key={i} className="h-7 w-14" />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function Inventario() {
  const qc = useQueryClient();

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['catalog'],
    queryFn: () => apiGet<Catalog>('/api/admin/catalog'),
    staleTime: 60_000,
  });

  const cambiar = useMutation({
    mutationFn: (input: { id: string; code: string; status: 'active' | 'inactive' }) =>
      apiPatch(`/api/admin/units/${input.id}`, { status: input.status }),
    onSuccess: (_d, input) => {
      toast.success(
        t('inv.cambiada', {
          code: input.code,
          estado: t(input.status === 'active' ? 'inv.activa' : 'inv.inactiva'),
        }),
      );
      void qc.invalidateQueries({ queryKey: ['catalog'] });
      void qc.invalidateQueries({ queryKey: ['planning'] });
    },
    onError: () => toast.error(t('inv.errorCambio')),
  });

  const units = data?.units ?? [];
  const activas = units.filter((u) => u.status === 'active').length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-border/60 px-4 py-2.5">
        <p className="tnum text-[13px] font-medium">
          {t('inv.activas', { n: activas })}
          {units.length - activas > 0 && (
            <span className="text-destructive">
              {' '}
              · {t('inv.inactivas', { n: units.length - activas })}
            </span>
          )}
        </p>
        <p className="ml-auto max-w-96 text-[12px] text-muted-foreground">{t('inv.nota')}</p>
        <BotonAyuda />
      </div>

      {isPending && <InventarioEsqueleto />}
      {isError && <QueryError error={error} onRetry={() => void refetch()} />}

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {data?.unitTypes.map((ut) => {
          const propias = units.filter((u) => u.unitTypeId === ut.id);
          if (!propias.length) return null;
          return (
            <section key={ut.id} className="mb-5">
              <h2 className="lc-panel-h">
                {ut.nameI18n.es ?? ut.id} · {propias.length}
              </h2>
              <ul className="flex flex-wrap gap-1.5">
                {propias.map((u) => {
                  const activa = u.status === 'active';
                  const chip = (
                    <Button
                      type="button"
                      size="xs"
                      variant={activa ? 'outline' : 'destructiveOutline'}
                      disabled={cambiar.isPending}
                      title={activa ? t('inv.darBaja') : t('inv.darAlta')}
                      aria-pressed={!activa}
                      className={activa ? 'tnum' : 'tnum bg-destructive/10 line-through'}
                      onClick={
                        activa
                          ? undefined
                          : () => cambiar.mutate({ id: u.id, code: u.code, status: 'active' })
                      }
                    >
                      {u.code}
                    </Button>
                  );

                  return (
                    <li key={u.id}>
                      {activa ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>{chip}</AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {t('confirmar.unidad.titulo', { code: u.code })}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('confirmar.unidad.desc')}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('confirmar.cancelar')}</AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                onClick={() =>
                                  cambiar.mutate({ id: u.id, code: u.code, status: 'inactive' })
                                }
                              >
                                {t('confirmar.unidad.ok')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        chip
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
