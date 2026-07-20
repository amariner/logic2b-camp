/**
 * Inventario (ADR 0008, sesión 19): unidades por tipo con alta/baja de servicio.
 * Dar de baja NO toca reservas existentes; solo saca la unidad del cupo y de las
 * asignaciones nuevas. Cambiar el estado exige gerencia — el servidor manda.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiGet, apiPatch, type Catalog } from '../api';
import { t } from '../i18n';

export default function Inventario() {
  const qc = useQueryClient();
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const { data, isPending, isError } = useQuery({
    queryKey: ['catalog'],
    queryFn: () => apiGet<Catalog>('/api/admin/catalog'),
    staleTime: 60_000,
  });

  const cambiar = useMutation({
    mutationFn: (input: { id: string; code: string; status: 'active' | 'inactive' }) =>
      apiPatch(`/api/admin/units/${input.id}`, { status: input.status }),
    onSuccess: (_d, input) => {
      setMsg({
        text: t('inv.cambiada', {
          code: input.code,
          estado: t(input.status === 'active' ? 'inv.activa' : 'inv.inactiva'),
        }),
      });
      void qc.invalidateQueries({ queryKey: ['catalog'] });
      void qc.invalidateQueries({ queryKey: ['planning'] });
    },
    onError: () => setMsg({ text: t('inv.errorCambio'), error: true }),
  });

  const units = data?.units ?? [];
  const activas = units.filter((u) => u.status === 'active').length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-border/60 px-4 py-2.5">
        <p className="tnum text-[13px] font-medium">
          {t('inv.activas', { n: activas })}
          {units.length - activas > 0 && (
            <span className="text-destructive"> · {t('inv.inactivas', { n: units.length - activas })}</span>
          )}
        </p>
        {msg && (
          <p
            role="status"
            className={`text-[12px] font-medium ${msg.error ? 'text-destructive' : 'text-primary'}`}
          >
            {msg.text}
          </p>
        )}
        <p className="ml-auto max-w-96 text-[12px] text-muted-foreground">{t('inv.nota')}</p>
      </div>

      {isPending && <p className="p-6 text-[14px] text-muted-foreground">{t('inv.cargando')}</p>}
      {isError && <p className="p-6 text-[14px] font-medium text-destructive">{t('inv.error')}</p>}

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
                  return (
                    <li key={u.id}>
                      <button
                        type="button"
                        disabled={cambiar.isPending}
                        title={activa ? t('inv.darBaja') : t('inv.darAlta')}
                        aria-pressed={!activa}
                        onClick={() =>
                          cambiar.mutate({
                            id: u.id,
                            code: u.code,
                            status: activa ? 'inactive' : 'active',
                          })
                        }
                        className={`tnum rounded-(--lc-radius) border px-2.5 py-1 text-[12px] font-medium disabled:opacity-40 ${
                          activa
                            ? 'border-foreground/20 hover:bg-accent'
                            : 'border-destructive/50 bg-destructive/10 text-destructive line-through hover:bg-accent'
                        }`}
                      >
                        {u.code}
                      </button>
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
