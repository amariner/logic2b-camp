/**
 * PLANO DEL CAMPING (ADR 0021, Frente C · C7) — el "¿dónde?" que complementa al
 * "¿cuándo?" del planning. Vista cenital con el estado real de cada unidad en una
 * fecha, click en unidad ocupada → la misma ficha lateral que el planning, y
 * salto plano ↔ planning conservando unidad y fecha.
 *
 * Cero mocks: el estado sale de /api/admin/planning (una noche) y la geometría de
 * /api/admin/map. La geometría y el estado por fecha son puros (@logic-camp/config).
 */
import {
  autoPlano,
  expandPlano,
  unitStateOn,
  type PlanoBlockRange,
  type PlanoBooking,
  type PlanoLayout,
  type UnitDayState,
} from '@logic-camp/config';
import { Button, EmptyState, Skeleton } from '@logic-camp/ui';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Ban, CalendarRange } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { apiGet, type MapData, type PlanningData, type PlanningUnit } from '../api';
import BlockDialog from '../components/BlockDialog';
import BookingPanel from '../components/BookingPanel';
import CampingMap from '../components/CampingMap';
import { QueryError } from '../components/QueryError';
import { t } from '../i18n';
import { BotonAyuda } from '../components/BotonAyuda';

type TKey = Parameters<typeof t>[0];

const DAY_MS = 86_400_000;
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (isoDate: string, n: number) =>
  iso(new Date(Date.parse(`${isoDate}T00:00:00Z`) + n * DAY_MS));

/** Leyenda: los mismos colores que el planning, explicados. */
const LEGEND: { key: TKey; className: string }[] = [
  { key: 'plano.estado.libre', className: 'lg-free' },
  { key: 'plano.estado.enCasa', className: 'lg-inhouse' },
  { key: 'plano.estado.ocupada', className: 'lg-confirmed' },
  { key: 'plano.estado.ocupadaPend', className: 'lg-pending' },
  { key: 'plano.estado.entra', className: 'lg-arrival' },
  { key: 'plano.estado.sale', className: 'lg-departure' },
  { key: 'plano.estado.bloqueada', className: 'lg-blocked' },
];

function PlanoSkeleton() {
  return (
    <div aria-busy="true" className="min-h-0 flex-1 p-6">
      <Skeleton className="h-full w-full rounded-lg" />
    </div>
  );
}

export default function Plano() {
  const search = useSearch({ strict: false }) as { date?: string; unit?: string };
  const navigate = useNavigate();
  const today = iso(new Date());
  const date = search.date ?? today;

  const setDate = (d: string) =>
    navigate({ to: '/plano', search: (p) => ({ ...p, date: d }), replace: true });
  const setUnit = (unitId: string | undefined) =>
    navigate({ to: '/plano', search: (p) => ({ ...p, unit: unitId }), replace: true });

  // el estado de la noche `date` = /planning de un solo día
  const to = addDays(date, 1);
  const planning = useQuery({
    queryKey: ['planning', date, to],
    queryFn: () => apiGet<PlanningData>(`/api/admin/planning?from=${date}&to=${to}`),
    staleTime: 15_000,
  });
  // la geometría cambia poco: cachearla de sobra
  const map = useQuery({
    queryKey: ['map'],
    queryFn: () => apiGet<MapData>('/api/admin/map'),
    staleTime: 5 * 60_000,
  });

  const data = planning.data;

  const unitByCode = useMemo(() => {
    const m = new Map<string, PlanningUnit>();
    for (const u of data?.units ?? []) m.set(u.code, u);
    return m;
  }, [data]);
  const codeById = useMemo(() => {
    const m = new Map<string, string>();
    for (const u of data?.units ?? []) m.set(u.id, u.code);
    return m;
  }, [data]);

  // layout: descriptor del tenant si existe; si no, autogenerado (degradación honesta)
  const layout: PlanoLayout | null = useMemo(() => {
    if (!data) return null;
    if (map.data?.plano) return expandPlano(map.data.plano);
    if (map.isPending) return null; // aún puede llegar un descriptor: no parpadear al auto
    return autoPlano(data.units, data.unitTypes, 'es');
  }, [data, map.data, map.isPending]);

  // bloqueos resueltos a nivel de unidad (los de tipo aplican a todas sus unidades)
  const blocksByUnit = useMemo<PlanoBlockRange[]>(() => {
    if (!data) return [];
    const out: PlanoBlockRange[] = [];
    for (const b of data.blocks) {
      if (b.unitId)
        out.push({ unitId: b.unitId, dateFrom: b.dateFrom, dateTo: b.dateTo, reason: b.reason });
      else if (b.unitTypeId)
        for (const u of data.units.filter((x) => x.unitTypeId === b.unitTypeId))
          out.push({ unitId: u.id, dateFrom: b.dateFrom, dateTo: b.dateTo, reason: b.reason });
    }
    return out;
  }, [data]);

  const bookings = useMemo<PlanoBooking[]>(
    () =>
      (data?.bookings ?? []).map((b) => ({
        id: b.id,
        status: b.status,
        unitId: b.unitId,
        dateFrom: b.dateFrom,
        dateTo: b.dateTo,
        // "en casa" (ADR 0022): unitStateOn lo deriva de estos dos
        checkedInAt: b.checkedInAt,
        checkedOutAt: b.checkedOutAt,
      })),
    [data],
  );

  const stateByCode = useMemo(() => {
    const m = new Map<string, UnitDayState>();
    if (!data) return m;
    for (const u of data.units) m.set(u.code, unitStateOn(date, u.id, bookings, blocksByUnit));
    return m;
  }, [data, date, bookings, blocksByUnit]);

  // resumen para la barra: ocupación de la noche
  const summary = useMemo(() => {
    let occ = 0;
    let free = 0;
    for (const s of stateByCode.values()) {
      if (s.kind === 'occupied' || s.kind === 'arrival') occ++;
      else if (s.kind === 'free' || s.kind === 'departure') free++;
    }
    const total = occ + free || 1;
    return { occ, total: stateByCode.size, pct: Math.round((occ / total) * 100) };
  }, [stateByCode]);

  const selectedCode = search.unit ? (codeById.get(search.unit) ?? null) : null;
  const [openId, setOpenId] = useState<string | null>(null);
  const [bloqueoAbierto, setBloqueoAbierto] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);

  const onSelectUnit = (code: string) => {
    const unit = unitByCode.get(code);
    setUnit(unit?.id);
    const st = stateByCode.get(code);
    if (st && (st.kind === 'occupied' || st.kind === 'arrival' || st.kind === 'departure'))
      setOpenId(st.bookingId);
    else setOpenId(null);
  };

  const openInPlanning = () => navigate({ to: '/', search: { date, unit: search.unit } as never });

  return (
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* barra de mando */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border/60 px-4 py-2.5">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="iconSm"
              onClick={() => setDate(addDays(date, -1))}
              aria-label={t('plano.diaAnterior')}
            >
              ←
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDate(today)}>
              {t('planning.hoy')}
            </Button>
            <Button
              variant="outline"
              size="iconSm"
              onClick={() => setDate(addDays(date, 1))}
              aria-label={t('plano.diaSiguiente')}
            >
              →
            </Button>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className="tnum rounded-(--lc-radius) border border-foreground/20 bg-background px-2 py-1 text-[13px]"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={openInPlanning}
            title={t('plano.verEnPlanning')}
          >
            <CalendarRange className="size-4" />
            {t('plano.verEnPlanning')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBloqueoAbierto(true)}
            title={t('bloqueo.crear')}
          >
            <Ban className="size-4" />
            {t('bloqueo.crear')}
          </Button>
          {data && (
            <p className="tnum ml-auto text-[12px] text-muted-foreground">
              {t('plano.ocupacion', { pct: summary.pct, occ: summary.occ, total: summary.total })}
            </p>
          )}
          <BotonAyuda />
        </div>

        {/* leyenda */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-border/60 px-4 py-2">
          {LEGEND.map((l) => (
            <span
              key={l.key}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
            >
              <span className={`plano-lg ${l.className}`} aria-hidden="true" />
              {t(l.key)}
            </span>
          ))}
          {layout?.generated && (
            <span
              className="ml-auto text-[11px] text-muted-foreground italic"
              title={t('plano.autoDesc')}
            >
              {t('plano.auto')}
            </span>
          )}
        </div>

        {(planning.isPending || (map.isPending && !map.data)) && <PlanoSkeleton />}
        {planning.isError && (
          <QueryError error={planning.error} onRetry={() => void planning.refetch()} />
        )}

        {data && data.units.length === 0 && (
          <EmptyState
            art="map"
            title={t('plano.vacio.titulo')}
            description={t('plano.vacio.desc')}
          />
        )}

        {layout && data && data.units.length > 0 && (
          <CampingMap
            layout={layout}
            stateByCode={stateByCode}
            selectedCode={selectedCode}
            onSelectUnit={onSelectUnit}
          />
        )}
      </div>

      {openId && (
        <BookingPanel
          bookingId={openId}
          onClose={() => {
            setOpenId(null);
            openerRef.current?.focus();
          }}
        />
      )}
      <BlockDialog
        open={bloqueoAbierto}
        onOpenChange={setBloqueoAbierto}
        defaultUnitId={search.unit}
        defaultDate={date}
      />
    </div>
  );
}
