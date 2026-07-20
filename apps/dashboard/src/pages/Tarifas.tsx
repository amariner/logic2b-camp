/**
 * Tarifas (ADR 0008, sesión 19): planes por temporada con edición inline.
 * Guardar exige gerencia (el servidor manda). Invariante 3 a la vista:
 * cambiar una tarifa JAMÁS modifica una reserva ya confirmada.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiGet, apiPut, type Catalog, type RatePlan, type RatesData } from '../api';
import { t } from '../i18n';
import { fecha } from '../lib/format';

/** Campos editables en céntimos, en orden de columna. */
const CAMPOS = [
  ['baseCents', 'tar.base'],
  ['extraPersonCents', 'tar.personaExtra'],
  ['childCents', 'tar.nino'],
  ['petCents', 'tar.mascota'],
  ['electricityCents', 'tar.electricidad'],
  ['vehicleCents', 'tar.vehiculo'],
] as const;
type CampoCents = (typeof CAMPOS)[number][0];

const aEuros = (cents: number) => (cents / 100).toFixed(2);
const aCents = (euros: string) => Math.round(Number(euros.replace(',', '.')) * 100);

function Fila({ plan, tipoNombre }: { plan: RatePlan; tipoNombre: string }) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Partial<Record<CampoCents | 'minStay', string>>>({});
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const guardar = useMutation({
    mutationFn: (patch: Partial<RatePlan>) => apiPut(`/api/admin/rates/${plan.id}`, patch),
    onSuccess: () => {
      setMsg({ text: t('tar.guardada') });
      setDraft({});
      void qc.invalidateQueries({ queryKey: ['rates'] });
    },
    onError: () => setMsg({ text: t('tar.errorGuardar'), error: true }),
  });

  const sucia = Object.keys(draft).length > 0;
  const enviar = () => {
    const patch: Partial<RatePlan> = {};
    for (const [campo] of CAMPOS) {
      const v = draft[campo];
      if (v !== undefined && Number.isFinite(aCents(v))) patch[campo] = aCents(v);
    }
    if (draft.minStay !== undefined) {
      const n = Number.parseInt(draft.minStay, 10);
      if (Number.isInteger(n) && n >= 1) patch.minStay = n;
    }
    if (Object.keys(patch).length) guardar.mutate(patch);
  };

  const celda =
    'tnum w-20 rounded-(--lc-radius) border border-foreground/20 bg-background px-1.5 py-0.5 text-right text-[13px]';

  return (
    <tr className="border-b border-border/40">
      <td className="px-3 py-1.5 font-medium first:pl-4">{tipoNombre}</td>
      {CAMPOS.map(([campo, etiqueta]) => (
        <td key={campo} className="px-1.5 py-1.5">
          <input
            type="text"
            inputMode="decimal"
            aria-label={`${t(etiqueta)} · ${tipoNombre}`}
            value={draft[campo] ?? aEuros(plan[campo])}
            onChange={(e) => setDraft((d) => ({ ...d, [campo]: e.target.value }))}
            className={celda}
          />
        </td>
      ))}
      <td className="px-1.5 py-1.5">
        <input
          type="number"
          min={1}
          aria-label={`${t('tar.minStay')} · ${tipoNombre}`}
          value={draft.minStay ?? String(plan.minStay)}
          onChange={(e) => setDraft((d) => ({ ...d, minStay: e.target.value }))}
          className={`${celda} w-14`}
        />
      </td>
      <td className="px-3 py-1.5 last:pr-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!sucia || guardar.isPending}
            onClick={enviar}
            className="rounded-(--lc-radius) border border-primary bg-primary px-2.5 py-0.5 text-[12px] font-semibold text-background hover:bg-primary disabled:opacity-30"
          >
            {t('tar.guardar')}
          </button>
          {msg && (
            <span
              role="status"
              className={`text-[11px] font-medium ${msg.error ? 'text-destructive' : 'text-primary'}`}
            >
              {msg.text}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function Tarifas() {
  const rates = useQuery({
    queryKey: ['rates'],
    queryFn: () => apiGet<RatesData>('/api/admin/rates'),
  });
  const catalog = useQuery({
    queryKey: ['catalog'],
    queryFn: () => apiGet<Catalog>('/api/admin/catalog'),
    staleTime: 5 * 60_000,
  });

  const tipoNombre = (id: string) =>
    catalog.data?.unitTypes.find((ut) => ut.id === id)?.nameI18n.es ?? id;

  // temporadas por prioridad (la que pincha primero, arriba) y fecha
  const temporadas = [...(rates.data?.seasons ?? [])].sort(
    (a, b) => b.priority - a.priority || a.dateFrom.localeCompare(b.dateFrom),
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border/60 px-4 py-2.5">
        <p className="text-[12px] text-muted-foreground">{t('tar.nota')}</p>
      </div>

      {rates.isPending && <p className="p-6 text-[14px] text-muted-foreground">{t('tar.cargando')}</p>}
      {rates.isError && <p className="p-6 text-[14px] font-medium text-destructive">{t('tar.error')}</p>}

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {temporadas.map((s) => {
          const planes = (rates.data?.ratePlans ?? []).filter((p) => p.seasonId === s.id);
          if (!planes.length) return null;
          return (
            <section key={s.id} className="mb-6">
              <h2 className="lc-panel-h">
                {s.name}
                <span className="tnum ml-2 normal-case">
                  {fecha(s.dateFrom)} → {fecha(s.dateTo)}
                </span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b-2 border-foreground/20 text-left">
                      <th className="px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase first:pl-4">
                        {t('tar.tipo')}
                      </th>
                      {CAMPOS.map(([campo, etiqueta]) => (
                        <th
                          key={campo}
                          className="px-1.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
                        >
                          {t(etiqueta)}
                        </th>
                      ))}
                      <th className="px-1.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                        {t('tar.minStay')}
                      </th>
                      <th className="px-3 py-1 last:pr-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {planes.map((p) => (
                      <Fila key={p.id} plan={p} tipoNombre={tipoNombre(p.unitTypeId)} />
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
