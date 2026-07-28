/**
 * Inventario (ADR 0008, sesión 19): unidades por tipo con alta/baja de servicio.
 * Dar de baja NO toca reservas existentes; solo saca la unidad del cupo y de las
 * asignaciones nuevas. Cambiar el estado exige gerencia — el servidor manda.
 *
 * C3 (ADR 0020): la baja se confirma (es destructiva de cupo), el feedback va
 * por toast y la carga tiene la forma real de las fichas de unidad.
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
  Card,
  CardContent,
  CardHeader,
  Skeleton,
  toast,
} from '@logic-camp/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch, type Catalog } from '../api';
import { QueryError } from '../components/QueryError';
import { t } from '../i18n';
import { BotonAyuda } from '../components/BotonAyuda';

/** Esqueleto con la forma real: dos fichas de tipo con su hilera de códigos. */
function InventarioEsqueleto() {
  return (
    <div aria-busy="true" className="grid content-start gap-3 p-4 lg:grid-cols-2">
      {[0, 1].map((s) => (
        <Card key={s}>
          <CardHeader className="px-4 pt-3 pb-0">
            <Skeleton className="mb-1 h-2.5 w-40" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: s === 0 ? 12 : 8 }, (_, i) => (
                <Skeleton key={i} className="h-7 w-14" />
              ))}
            </div>
          </CardContent>
        </Card>
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
    onError: (e) => errorMutacion(e, t('inv.errorCambio')),
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

      <div className="grid min-h-0 flex-1 content-start gap-3 overflow-y-auto p-4 lg:grid-cols-2">
        {data?.unitTypes.map((ut) => {
          const propias = units.filter((u) => u.unitTypeId === ut.id);
          if (!propias.length) return null;
          return (
            <Card key={ut.id}>
              <CardHeader className="px-4 pt-3 pb-0">
                <h2 className="lc-panel-h">
                  {ut.nameI18n.es ?? ut.id} · {propias.length}
                </h2>
              </CardHeader>
              <CardContent className="px-4 pb-3">
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
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
