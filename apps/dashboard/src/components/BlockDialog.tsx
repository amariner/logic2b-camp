/**
 * Crear un bloqueo de inventario desde la UI (ADR 0022 §3): avería, propietario…
 * El planning y el plano YA los pintan; hasta ahora no había forma de crear uno.
 * Por unidad o por tipo; el servidor valida el solape con reservas vivas.
 */
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  SelectNative,
  toast,
} from '@logic-camp/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError, apiGet, apiPost, type Catalog } from '../api';
import { t } from '../i18n';

const REASONS = ['maintenance', 'owner', 'longstay', 'manual'] as const;
const iso = (d: Date) => d.toISOString().slice(0, 10);

export default function BlockDialog({
  open,
  onOpenChange,
  defaultUnitId,
  defaultDate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultUnitId?: string;
  defaultDate?: string;
}) {
  const qc = useQueryClient();
  const [scope, setScope] = useState<'unit' | 'type'>('unit');
  const [unitId, setUnitId] = useState(defaultUnitId ?? '');
  const [unitTypeId, setUnitTypeId] = useState('');
  const [from, setFrom] = useState(defaultDate ?? iso(new Date()));
  const [to, setTo] = useState(defaultDate ? defaultDate : iso(new Date()));
  const [reason, setReason] = useState<(typeof REASONS)[number]>('maintenance');

  const { data: catalog } = useQuery({
    queryKey: ['catalog'],
    queryFn: () => apiGet<Catalog>('/api/admin/catalog'),
    staleTime: 5 * 60_000,
    enabled: open,
  });

  const crear = useMutation({
    mutationFn: () =>
      apiPost<{ id: string }>('/api/admin/blocks', {
        ...(scope === 'unit' ? { unitId } : { unitTypeId }),
        dateFrom: from,
        dateTo: to,
        reason,
      }),
    onSuccess: () => {
      toast.success(t('bloqueo.creado'));
      void qc.invalidateQueries({ queryKey: ['planning'] });
      onOpenChange(false);
    },
    onError: (e) =>
      toast.error(e instanceof ApiError && e.status === 409 ? t('bloqueo.ocupado') : t('bloqueo.error')),
  });

  const listo =
    from < to && (scope === 'unit' ? Boolean(unitId) : Boolean(unitTypeId));

  const field = 'w-full text-[13px]';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('bloqueo.titulo')}</DialogTitle>
          <DialogDescription>{t('bloqueo.motivo')}</DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (listo && !crear.isPending) crear.mutate();
          }}
        >
          <div>
            <Label>{t('bloqueo.alcance')}</Label>
            <div className="mt-1 flex gap-1.5">
              {(['unit', 'type'] as const).map((s) => (
                <Button
                  key={s}
                  type="button"
                  size="xs"
                  variant={scope === s ? 'primary' : 'outline'}
                  onClick={() => setScope(s)}
                  aria-pressed={scope === s}
                  className="flex-1"
                >
                  {t(s === 'unit' ? 'bloqueo.porUnidad' : 'bloqueo.porTipo')}
                </Button>
              ))}
            </div>
          </div>

          {scope === 'unit' ? (
            <div>
              <Label htmlFor="blk-unit">{t('bloqueo.unidad')}</Label>
              <SelectNative
                id="blk-unit"
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className={field}
              >
                <option value="" />
                {catalog?.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.code}
                  </option>
                ))}
              </SelectNative>
            </div>
          ) : (
            <div>
              <Label htmlFor="blk-type">{t('bloqueo.tipo')}</Label>
              <SelectNative
                id="blk-type"
                value={unitTypeId}
                onChange={(e) => setUnitTypeId(e.target.value)}
                className={field}
              >
                <option value="" />
                {catalog?.unitTypes.map((ut) => (
                  <option key={ut.id} value={ut.id}>
                    {ut.nameI18n.es ?? ut.id}
                  </option>
                ))}
              </SelectNative>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="blk-from">{t('bloqueo.desde')}</Label>
              <Input
                id="blk-from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className={`${field} tnum`}
              />
            </div>
            <div>
              <Label htmlFor="blk-to">{t('bloqueo.hasta')}</Label>
              <Input
                id="blk-to"
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.target.value)}
                className={`${field} tnum`}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="blk-reason">{t('bloqueo.motivo')}</Label>
            <SelectNative
              id="blk-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as (typeof REASONS)[number])}
              className={field}
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {t(`bloqueo.${r}`)}
                </option>
              ))}
            </SelectNative>
          </div>

          <DialogFooter>
            <Button type="submit" size="sm" disabled={!listo || crear.isPending}>
              {crear.isPending ? t('bloqueo.creando') : t('bloqueo.crearBtn')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
