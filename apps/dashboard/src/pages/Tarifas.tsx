/**
 * Tarifas (ADR 0008, sesión 19): planes por temporada con edición inline.
 * Guardar exige gerencia (el servidor manda). Invariante 3 a la vista:
 * cambiar una tarifa JAMÁS modifica una reserva ya confirmada.
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
  Input,
  Skeleton,
  SkeletonRows,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  toast,
} from '@logic-camp/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiGet, apiPut, type Catalog, type RatePlan, type RatesData } from '../api';
import { usePuede } from '../auth';
import { QueryError } from '../components/QueryError';
import { t } from '../i18n';
import { fecha } from '../lib/format';
import { BotonAyuda } from '../components/BotonAyuda';

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

function Fila({
  plan,
  tipoNombre,
  editable,
}: {
  plan: RatePlan;
  tipoNombre: string;
  editable: boolean;
}) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Partial<Record<CampoCents | 'minStay', string>>>({});

  const guardar = useMutation({
    mutationFn: (patch: Partial<RatePlan>) => apiPut(`/api/admin/rates/${plan.id}`, patch),
    onSuccess: () => {
      toast.success(t('tar.guardada'));
      setDraft({});
      void qc.invalidateQueries({ queryKey: ['rates'] });
    },
    onError: (e) => errorMutacion(e, t('tar.errorGuardar')),
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

  /* `Input` del DS con la altura a `h-7` (28px) y no la de serie (`h-8`): quien
     fijaba la altura de esta fila era ya el botón `size="xs"`, también de 28px.
     Con `h-7` el campo y el botón quedan a la misma línea y la fila no crece ni
     un píxel; con `h-8` crecería sin motivo. La densidad manda (CLAUDE.md), y el
     borde, el radio y el anillo de foco pasan a ser los del DS en vez de
     copiados a mano. */
  const celda = 'tnum h-7 w-20 px-1.5 text-right';

  return (
    <TableRow>
      <TableCell className="py-1.5 pl-4 font-medium">{tipoNombre}</TableCell>
      {CAMPOS.map(([campo, etiqueta]) => (
        <TableCell key={campo} className="px-1.5 py-1.5">
          <Input
            type="text"
            inputMode="decimal"
            aria-label={`${t(etiqueta)} · ${tipoNombre}`}
            value={draft[campo] ?? aEuros(plan[campo])}
            onChange={(e) => setDraft((d) => ({ ...d, [campo]: e.target.value }))}
            disabled={!editable}
            className={celda}
          />
        </TableCell>
      ))}
      <TableCell className="px-1.5 py-1.5">
        <Input
          type="number"
          min={1}
          aria-label={`${t('tar.minStay')} · ${tipoNombre}`}
          value={draft.minStay ?? String(plan.minStay)}
          onChange={(e) => setDraft((d) => ({ ...d, minStay: e.target.value }))}
          disabled={!editable}
          className={`${celda} w-14`}
        />
      </TableCell>
      <TableCell className="py-1.5 pr-4">
        {/* Guardar una tarifa afecta a las reservas NUEVAS: se confirma (ADR 0020). */}
        {editable && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" size="xs" disabled={!sucia || guardar.isPending}>
                {t('tar.guardar')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('confirmar.tarifas.titulo')}</AlertDialogTitle>
                <AlertDialogDescription>{t('confirmar.tarifas.desc')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('confirmar.cancelar')}</AlertDialogCancel>
                <AlertDialogAction onClick={enviar}>{t('confirmar.tarifas.ok')}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </TableCell>
    </TableRow>
  );
}

/** Esqueleto con la rejilla real: tipo + 6 importes + mín. noches + acción. */
const COLS_TARIFAS = ['w-32', 'w-20', 'w-20', 'w-20', 'w-20', 'w-20', 'w-20', 'w-14', 'w-16'];

function TarifasEsqueleto() {
  return (
    <div aria-busy="true" className="min-h-0 flex-1 overflow-hidden p-4">
      {[0, 1].map((s) => (
        <section key={s} className="mb-6">
          <Skeleton className="mb-2 h-2.5 w-56" />
          <div className="rounded-(--lc-radius) border border-border/60">
            <SkeletonRows rows={4} cols={COLS_TARIFAS} />
          </div>
        </section>
      ))}
    </div>
  );
}

export default function Tarifas() {
  const puedeEditar = usePuede('rates:manage');
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
        <BotonAyuda className="ml-auto" />
      </div>

      {rates.isPending && <TarifasEsqueleto />}
      {rates.isError && <QueryError error={rates.error} onRetry={() => void rates.refetch()} />}

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
              {/* Tabla del DS (B1, sesión 53). Aquí NO hay cabecera pegajosa: son
                  N tablas cortas dentro de un mismo scroll, una por temporada. */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-1 pl-4">{t('tar.tipo')}</TableHead>
                    {CAMPOS.map(([campo, etiqueta]) => (
                      <TableHead key={campo} className="px-1.5 py-1 text-right">
                        {t(etiqueta)}
                      </TableHead>
                    ))}
                    <TableHead className="px-1.5 py-1 text-right">{t('tar.minStay')}</TableHead>
                    <TableHead className="py-1 pr-4" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planes.map((p) => (
                    <Fila
                      key={p.id}
                      plan={p}
                      tipoNombre={tipoNombre(p.unitTypeId)}
                      editable={puedeEditar}
                    />
                  ))}
                </TableBody>
              </Table>
            </section>
          );
        })}
      </div>
    </div>
  );
}
