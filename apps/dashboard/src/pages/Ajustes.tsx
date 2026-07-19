/**
 * Ajustes del camping (ADR 0008, sesión 20). Edita lo operativo (nombre, zona,
 * moneda) vía PATCH /api/admin/settings (gerencia, auditado). Nivel e idiomas
 * se muestran pero se cambian con Logic2B: afectan al despliegue de la web.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiGet, apiPatch, type TenantSettings } from '../api';
import { t } from '../i18n';

export default function Ajustes() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<
    Partial<Pick<TenantSettings, 'name' | 'timezone' | 'currency'>>
  >({});
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const { data, isPending, isError } = useQuery({
    queryKey: ['settings'],
    queryFn: () => apiGet<TenantSettings>('/api/admin/settings'),
  });

  const guardar = useMutation({
    mutationFn: (patch: typeof draft) => apiPatch('/api/admin/settings', patch),
    onSuccess: () => {
      setMsg({ text: t('aju.guardado') });
      setDraft({});
      void qc.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: () => setMsg({ text: t('aju.errorGuardar'), error: true }),
  });

  const sucia = Object.keys(draft).length > 0;
  const input =
    'w-full max-w-sm rounded-(--lc-radius) border border-tinta/20 bg-hueso px-2 py-1.5 text-[13px]';
  const label = 'text-[11px] font-semibold tracking-[0.08em] text-tinta-suave uppercase';

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-arena/60 px-4 py-2.5">
        <p className="text-[12px] text-tinta-suave">{t('aju.nota')}</p>
        {msg && (
          <p
            role="status"
            className={`text-[12px] font-medium ${msg.error ? 'text-mar' : 'text-pino'}`}
          >
            {msg.text}
          </p>
        )}
      </div>

      {isPending && <p className="p-6 text-[14px] text-tinta-suave">{t('aju.cargando')}</p>}
      {isError && <p className="p-6 text-[14px] font-medium text-mar">{t('aju.error')}</p>}

      {data && (
        <form
          className="flex max-w-xl flex-col gap-4 p-4 text-[13px]"
          onSubmit={(e) => {
            e.preventDefault();
            if (sucia && !guardar.isPending) guardar.mutate(draft);
          }}
        >
          <div>
            <label htmlFor="aju-nombre" className={label}>
              {t('aju.nombre')}
            </label>
            <input
              id="aju-nombre"
              type="text"
              value={draft.name ?? data.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              className={input}
            />
          </div>
          <div>
            <label htmlFor="aju-zona" className={label}>
              {t('aju.zona')}
            </label>
            <input
              id="aju-zona"
              type="text"
              value={draft.timezone ?? data.timezone}
              onChange={(e) => setDraft((d) => ({ ...d, timezone: e.target.value }))}
              className={input}
            />
          </div>
          <div>
            <label htmlFor="aju-moneda" className={label}>
              {t('aju.moneda')}
            </label>
            <input
              id="aju-moneda"
              type="text"
              maxLength={3}
              value={draft.currency ?? data.currency}
              onChange={(e) => setDraft((d) => ({ ...d, currency: e.target.value.toUpperCase() }))}
              className={`${input} tnum w-24`}
            />
          </div>

          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-tinta-suave">
            <dt className={label}>{t('aju.nivel')}</dt>
            <dd className="font-medium text-tinta">
              {t(`aju.nivel${data.tier as 1 | 2 | 3 | 4}`)} · {data.tier}
            </dd>
            <dt className={label}>{t('aju.idiomas')}</dt>
            <dd className="tnum uppercase">{data.locales.join(' · ')}</dd>
          </dl>

          <button
            type="submit"
            disabled={!sucia || guardar.isPending}
            className="w-fit rounded-(--lc-radius) border border-pino bg-pino px-3 py-1.5 font-semibold text-hueso hover:bg-pino-oscuro disabled:opacity-40"
          >
            {t('aju.guardar')}
          </button>
        </form>
      )}
    </div>
  );
}
