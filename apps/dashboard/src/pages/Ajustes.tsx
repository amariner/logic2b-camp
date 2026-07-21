/**
 * Ajustes del camping (ADR 0008, sesión 20). Edita lo operativo (nombre, zona,
 * moneda) vía PATCH /api/admin/settings (gerencia, auditado). Nivel e idiomas
 * se muestran pero se cambian con Logic2B: afectan al despliegue de la web.
 *
 * C3 (ADR 0020): feedback por toast, esqueleto con forma de formulario y los
 * toggles de notificación con el `Switch` del DS.
 */
import { Button, Input, Label, Skeleton, Switch, toast } from '@logic-camp/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiGet, apiPatch, type TenantSettings } from '../api';
import { QueryError } from '../components/QueryError';
import { t } from '../i18n';
import { BotonAyuda } from '../components/BotonAyuda';

const ETIQUETA = 'text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase';

/** Esqueleto con la forma real: tres campos + la ficha de nivel/idiomas. */
function AjustesEsqueleto() {
  return (
    <div aria-busy="true" className="flex max-w-xl flex-col gap-4 p-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="h-2.5 w-28" />
          <Skeleton className={i === 2 ? 'h-8 w-24' : 'h-8 w-full max-w-sm'} />
        </div>
      ))}
      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 pt-2">
        <Skeleton className="h-2.5 w-28" />
        <Skeleton className="h-2.5 w-32" />
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="h-2.5 w-40" />
      </div>
      <Skeleton className="h-8 w-40" />
    </div>
  );
}

export default function Ajustes() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<
    Partial<Pick<TenantSettings, 'name' | 'timezone' | 'currency'>>
  >({});

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['settings'],
    queryFn: () => apiGet<TenantSettings>('/api/admin/settings'),
  });

  const guardar = useMutation({
    mutationFn: (patch: typeof draft) => apiPatch('/api/admin/settings', patch),
    onSuccess: () => {
      toast.success(t('aju.guardado'));
      setDraft({});
      void qc.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: () => toast.error(t('aju.errorGuardar')),
  });

  const sucia = Object.keys(draft).length > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border/60 px-4 py-2.5">
        <p className="text-[12px] text-muted-foreground">{t('aju.nota')}</p>
        <BotonAyuda className="ml-auto" />
      </div>

      {isPending && <AjustesEsqueleto />}
      {isError && <QueryError error={error} onRetry={() => void refetch()} />}

      {data && (
        <form
          className="flex max-w-xl flex-col gap-4 p-4 text-[13px]"
          onSubmit={(e) => {
            e.preventDefault();
            if (sucia && !guardar.isPending) guardar.mutate(draft);
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="aju-nombre">{t('aju.nombre')}</Label>
            <Input
              id="aju-nombre"
              type="text"
              value={draft.name ?? data.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              className="max-w-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="aju-zona">{t('aju.zona')}</Label>
            <Input
              id="aju-zona"
              type="text"
              value={draft.timezone ?? data.timezone}
              onChange={(e) => setDraft((d) => ({ ...d, timezone: e.target.value }))}
              className="max-w-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="aju-moneda">{t('aju.moneda')}</Label>
            <Input
              id="aju-moneda"
              type="text"
              maxLength={3}
              value={draft.currency ?? data.currency}
              onChange={(e) => setDraft((d) => ({ ...d, currency: e.target.value.toUpperCase() }))}
              className="tnum w-24"
            />
          </div>

          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-muted-foreground">
            <dt className={ETIQUETA}>{t('aju.nivel')}</dt>
            <dd className="font-medium text-foreground">
              {t(`aju.nivel${data.tier as 1 | 2 | 3 | 4}`)} · {data.tier}
            </dd>
            <dt className={ETIQUETA}>{t('aju.idiomas')}</dt>
            <dd className="tnum uppercase">{data.locales.join(' · ')}</dd>
          </dl>

          <Button type="submit" size="sm" disabled={!sucia || guardar.isPending} className="w-fit">
            {t('aju.guardar')}
          </Button>

          <Notificaciones data={data} />
        </form>
      )}
    </div>
  );
}

/** on/off por evento SIN deploy (ADR 0010): edita modules.notifications vía el PATCH auditado. */
const EVENTOS = [
  'enquiry_received',
  'enquiry_autoreply',
  'booking_confirmed',
  'booking_cancelled',
  'booking_pending_stuck',
  'booking_reminder',
] as const;

type NotifConfig = {
  enabled?: Partial<Record<(typeof EVENTOS)[number], boolean>>;
  from?: string;
  notifyTo?: string;
};

function Notificaciones({ data }: { data: TenantSettings }) {
  const qc = useQueryClient();
  const actual = (data.modules.notifications ?? {}) as NotifConfig;
  const [draft, setDraft] = useState<NotifConfig | null>(null); // null = sin cambios
  const config = draft ?? actual;

  const guardar = useMutation({
    mutationFn: (next: NotifConfig) =>
      apiPatch('/api/admin/settings', { modules: { ...data.modules, notifications: next } }),
    onSuccess: () => {
      setDraft(null);
      toast.success(t('aju.guardado'));
      void qc.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: () => toast.error(t('aju.errorGuardar')),
  });

  return (
    <fieldset className="mt-2 flex flex-col gap-2 border-t border-border/60 pt-4">
      <legend className="lc-panel-h float-left w-full">{t('aju.notificaciones')}</legend>
      <p className="text-[12px] text-muted-foreground">{t('aju.notifNota')}</p>
      {EVENTOS.map((ev) => (
        <div key={ev} className="flex items-center gap-2 py-0.5">
          <Switch
            id={`aju-notif-${ev}`}
            checked={config.enabled?.[ev] ?? true}
            onCheckedChange={(checked) =>
              setDraft({
                ...config,
                enabled: { ...config.enabled, [ev]: checked },
              })
            }
          />
          <Label
            htmlFor={`aju-notif-${ev}`}
            className="text-[13px] normal-case tracking-normal font-normal text-foreground"
          >
            {t(`notif.${ev}`)}
          </Label>
        </div>
      ))}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="aju-notif-from">{t('aju.notifFrom')}</Label>
        <Input
          id="aju-notif-from"
          type="text"
          placeholder="Camping X <reservas@campingx.com>"
          value={config.from ?? ''}
          onChange={(e) => setDraft({ ...config, from: e.target.value })}
          className="max-w-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="aju-notif-to">{t('aju.notifTo')}</Label>
        <Input
          id="aju-notif-to"
          type="email"
          value={config.notifyTo ?? ''}
          onChange={(e) => setDraft({ ...config, notifyTo: e.target.value })}
          className="max-w-sm"
        />
      </div>
      <Button
        type="button"
        size="sm"
        disabled={draft === null || guardar.isPending}
        onClick={() => draft && guardar.mutate(draft)}
        className="w-fit"
      >
        {t('aju.guardarNotif')}
      </Button>
    </fieldset>
  );
}
