/**
 * PLANNING ★ (ADR 0008) — el tape chart que recepción mira 200 veces al día.
 * Virtualización de FILAS con @tanstack/react-virtual; las reservas se pintan
 * como barras absolutas por fila (decenas de nodos por frame, no miles).
 * Incluye reasignación por arrastre (pointer events nativos, optimista con
 * rollback y toast con "Deshacer") y por teclado ↑/↓, más la ficha lateral de
 * la reserva. Ver `onBarPointerDown` y siguientes.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button, EmptyState, Skeleton, toast } from '@logic-camp/ui';
import { Map as MapIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  apiGet,
  apiPatch,
  type PlanningBlock,
  type PlanningBooking,
  type PlanningData,
  type PlanningUnit,
} from '../api';
import BookingPanel from '../components/BookingPanel';
import { QueryError } from '../components/QueryError';
import { t } from '../i18n';

const DAY_MS = 86_400_000;
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (isoDate: string, n: number) =>
  iso(new Date(Date.parse(`${isoDate}T00:00:00Z`) + n * DAY_MS));
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / DAY_MS);

const ZOOMS = [
  { id: 'semana', days: 7, cellW: 96 },
  { id: 'mes', days: 31, cellW: 42 },
  { id: 'temporada', days: 92, cellW: 22 },
] as const;

const LABEL_W = 148;
const ROW_H = 32;
const GROUP_H = 30;

type Row =
  { kind: 'group'; id: string; label: string } | { kind: 'unit'; id: string; unit: PlanningUnit };

/** Reasignar una reserva a otra unidad. `fromUnitId` solo se usa para deshacer. */
type ReassignInput = { id: string; unitId: string; fromUnitId: string; undo?: boolean };

/**
 * Esqueleto con la forma del tape chart (ADR 0020, C3): columna de códigos de
 * unidad a la izquierda y barras de anchos y desplazamientos distintos a la
 * derecha. Está fuera del componente a propósito: no entra en el camino caliente
 * del render de barras ni de celdas de día.
 */
const SKELETON_BARS: ReadonlyArray<ReadonlyArray<[number, number]>> = [
  [[2, 26], [40, 18]],
  [[0, 34]],
  [[12, 20], [46, 30]],
  [[6, 48]],
  [[28, 14], [52, 22]],
  [[0, 18], [36, 12], [62, 26]],
  [[18, 40]],
  [[4, 12], [30, 34]],
];

function PlanningSkeleton() {
  return (
    <div aria-busy="true" aria-label={t('planning.cargando')} className="min-h-0 flex-1 overflow-hidden">
      {/* cabecera de días */}
      <div className="flex border-b-2 border-foreground/20" style={{ paddingLeft: LABEL_W }}>
        {Array.from({ length: 24 }, (_, i) => (
          <Skeleton key={i} className="mx-1 my-1.5 h-2.5 w-4 shrink-0 rounded-sm" />
        ))}
      </div>
      {SKELETON_BARS.map((bars, r) => (
        <div key={r} className="flex items-center border-b border-border/40" style={{ height: ROW_H }}>
          <div
            className="flex shrink-0 items-center border-r border-border/60 px-2"
            style={{ width: LABEL_W }}
          >
            <Skeleton className="h-2.5 w-16" />
          </div>
          <div className="relative h-full flex-1">
            {bars.map(([left, width], i) => (
              <Skeleton
                key={i}
                className="absolute top-1 h-6 rounded-sm"
                style={{ left: `${left}%`, width: `${width}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Planning() {
  // date+unit por la URL: el salto plano ↔ planning conserva ambas (ADR 0021 §4)
  const search = useSearch({ strict: false }) as { date?: string; unit?: string };
  const navigate = useNavigate();
  const [zoomId, setZoomId] = useState<(typeof ZOOMS)[number]['id']>('mes');
  const [anchor, setAnchor] = useState(() => search.date ?? iso(new Date()));
  const zoom = ZOOMS.find((z) => z.id === zoomId)!;
  const from = anchor;
  const to = addDays(anchor, zoom.days);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['planning', from, to],
    queryFn: () => apiGet<PlanningData>(`/api/admin/planning?from=${from}&to=${to}`),
    staleTime: 15_000,
    refetchInterval: 60_000, // "tiempo real" de recepción: refresco de cortesía
  });

  // filas: cabecera de grupo por tipo + sus unidades (orden estable por código)
  const rows = useMemo<Row[]>(() => {
    if (!data) return [];
    const byType = new Map<string, PlanningUnit[]>();
    for (const u of data.units) {
      if (!byType.has(u.unitTypeId)) byType.set(u.unitTypeId, []);
      byType.get(u.unitTypeId)!.push(u);
    }
    const out: Row[] = [];
    for (const type of data.unitTypes) {
      const units = byType.get(type.id) ?? [];
      if (!units.length) continue;
      out.push({ kind: 'group', id: `g_${type.id}`, label: type.nameI18n.es ?? type.id });
      for (const u of units) out.push({ kind: 'unit', id: u.id, unit: u });
    }
    return out;
  }, [data]);

  const byUnit = useMemo(() => {
    const bookings = new Map<string, PlanningBooking[]>();
    const blocks = new Map<string, PlanningBlock[]>();
    if (!data) return { bookings, blocks, unassigned: [] as PlanningBooking[] };
    const unassigned: PlanningBooking[] = [];
    for (const b of data.bookings) {
      if (!b.unitId) {
        unassigned.push(b);
        continue;
      }
      if (!bookings.has(b.unitId)) bookings.set(b.unitId, []);
      bookings.get(b.unitId)!.push(b);
    }
    for (const blk of data.blocks) {
      if (blk.unitId) {
        if (!blocks.has(blk.unitId)) blocks.set(blk.unitId, []);
        blocks.get(blk.unitId)!.push(blk);
      } else if (blk.unitTypeId) {
        // bloqueo por tipo: aplica a todas sus unidades
        for (const u of data.units.filter((x) => x.unitTypeId === blk.unitTypeId)) {
          if (!blocks.has(u.id)) blocks.set(u.id, []);
          blocks.get(u.id)!.push(blk);
        }
      }
    }
    return { bookings, blocks, unassigned };
  }, [data]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (i) => (rows[i]!.kind === 'group' ? GROUP_H : ROW_H),
    overscan: 8,
  });

  // ---------- reasignación (ADR 0008): optimista con rollback; el servidor valida SIEMPRE ----------
  const qc = useQueryClient();
  // El "Deshacer" del toast se dispara desde dentro del propio `onSuccess`, así
  // que la mutación no puede referenciarse a sí misma: se pasa por este ref.
  const reassignRef = useRef<(input: ReassignInput) => void>(() => {});
  const reassign = useMutation({
    // `fromUnitId` no viaja al servidor: es lo que hace posible el "Deshacer"
    // (mover la reserva de vuelta a su unidad de origen). `undo` evita que el
    // deshacer ofrezca a su vez otro deshacer, en bucle.
    mutationFn: (input: ReassignInput) =>
      apiPatch(`/api/admin/bookings/${input.id}`, { action: 'reassign', unitId: input.unitId }),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: ['planning', from, to] });
      const prev = qc.getQueryData<PlanningData>(['planning', from, to]);
      qc.setQueryData<PlanningData>(['planning', from, to], (d) =>
        d
          ? {
              ...d,
              bookings: d.bookings.map((b) =>
                b.id === input.id ? { ...b, unitId: input.unitId } : b,
              ),
            }
          : d,
      );
      return { prev };
    },
    onError: (_e, input, ctx) => {
      if (ctx?.prev) qc.setQueryData(['planning', from, to], ctx.prev);
      toast.error(input.undo ? t('accion.errorDeshacer') : t('planning.reasignarError'));
    },
    onSuccess: (_d, input) => {
      if (input.undo) {
        toast.success(t('accion.deshecho'));
        return;
      }
      const unit = data?.units.find((u) => u.id === input.unitId);
      toast.success(t('planning.reasignada', { unit: unit?.code ?? input.unitId }), {
        action: {
          label: t('accion.deshacer'),
          onClick: () =>
            reassignRef.current({
              id: input.id,
              unitId: input.fromUnitId,
              fromUnitId: input.unitId,
              undo: true,
            }),
        },
      });
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: ['planning'] }),
  });
  reassignRef.current = reassign.mutate;

  // drag con pointer events nativos: manipulación directa del DOM (cero re-render por frame)
  const rowsRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    bookingId: string;
    unitTypeId: string;
    sourceUnitId: string;
    el: HTMLElement;
    startY: number;
    moved: boolean;
    targetUnitId: string | null;
    targetEl: HTMLElement | null;
  } | null>(null);

  const clearTargetHighlight = () => {
    const d = dragRef.current;
    if (d?.targetEl) d.targetEl.style.boxShadow = '';
  };

  const onBarPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    b: PlanningBooking,
    sourceUnitId: string,
  ) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      bookingId: b.id,
      unitTypeId: b.unitTypeId,
      sourceUnitId,
      el: e.currentTarget,
      startY: e.clientY,
      moved: false,
      targetUnitId: null,
      targetEl: null,
    };
  };

  const onBarPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.abs(dy) < 4) return; // umbral: un click no es un drag
    d.moved = true;
    d.el.style.transform = `translateY(${dy}px)`;
    d.el.style.zIndex = '40';
    d.el.style.opacity = '0.85';
    // fila bajo el cursor (solo filas visibles: la virtualización manda)
    const rowsTop = rowsRef.current?.getBoundingClientRect().top ?? 0;
    const y = e.clientY - rowsTop;
    const vi = virtualizer.getVirtualItems().find((v) => v.start <= y && y < v.end);
    const row = vi ? rows[vi.index] : undefined;
    clearTargetHighlight();
    if (
      row?.kind === 'unit' &&
      row.unit.unitTypeId === d.unitTypeId &&
      row.unit.id !== d.sourceUnitId
    ) {
      const el =
        rowsRef.current?.querySelector<HTMLElement>(`[data-unit-row="${row.unit.id}"]`) ?? null;
      if (el) el.style.boxShadow = 'inset 0 0 0 2px var(--primary)';
      d.targetUnitId = row.unit.id;
      d.targetEl = el;
    } else {
      d.targetUnitId = null;
      d.targetEl = null;
    }
  };

  const onBarPointerUp = () => {
    const d = dragRef.current;
    if (!d) return;
    clearTargetHighlight();
    d.el.style.transform = '';
    d.el.style.zIndex = '';
    d.el.style.opacity = '';
    if (d.moved && d.targetUnitId)
      reassign.mutate({
        id: d.bookingId,
        unitId: d.targetUnitId,
        fromUnitId: d.sourceUnitId,
      });
    else if (!d.moved) openPanel(d.bookingId, d.el); // un click (sin drag) abre la ficha
    dragRef.current = null;
  };

  // teclado: ↑/↓ reasigna a la unidad adyacente del MISMO tipo · Enter/Espacio abre la ficha
  const onBarKeyDown = (e: React.KeyboardEvent, b: PlanningBooking, sourceUnitId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPanel(b.id, e.currentTarget as HTMLElement);
      return;
    }
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    if (!data) return;
    const sameType = data.units.filter((u) => u.unitTypeId === b.unitTypeId);
    const idx = sameType.findIndex((u) => u.id === sourceUnitId);
    const next = sameType[idx + (e.key === 'ArrowDown' ? 1 : -1)];
    if (next) reassign.mutate({ id: b.id, unitId: next.id, fromUnitId: sourceUnitId });
  };

  // ---------- ficha (sesión 17): panel lateral, el foco vuelve a quien la abrió ----------
  const [openId, setOpenId] = useState<string | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const openPanel = (bookingId: string, opener: HTMLElement) => {
    openerRef.current = opener;
    setOpenId(bookingId);
  };
  const closePanel = () => {
    setOpenId(null);
    openerRef.current?.focus();
    openerRef.current = null;
  };

  // llegada desde el plano (ADR 0021 §4): centrar la unidad, resaltarla y abrir su
  // ficha si esa noche está ocupada. Una sola vez, para no pelear con el scroll manual.
  const focusedOnce = useRef(false);
  useEffect(() => {
    if (focusedOnce.current || !data || !search.unit) return;
    const idx = rows.findIndex((r) => r.kind === 'unit' && r.unit.id === search.unit);
    if (idx < 0) return;
    focusedOnce.current = true;
    virtualizer.scrollToIndex(idx, { align: 'center' });
    const occ = data.bookings.find(
      (b) => b.unitId === search.unit && b.dateFrom <= from && from < b.dateTo,
    );
    if (occ) setOpenId(occ.id);
  }, [data, rows, from, search.unit, virtualizer]);

  const days = useMemo(
    () => Array.from({ length: zoom.days }, (_, i) => addDays(from, i)),
    [from, zoom.days],
  );
  const gridW = zoom.days * zoom.cellW;

  const barGeometry = (dateFrom: string, dateTo: string) => {
    const start = Math.max(0, daysBetween(from, dateFrom));
    const end = Math.min(zoom.days, daysBetween(from, dateTo));
    if (end <= start) return null;
    return { left: start * zoom.cellW, width: end * zoom.cellW - start * zoom.cellW - 2 };
  };

  const dayLabel = (d: string) =>
    new Intl.DateTimeFormat('es', { day: 'numeric' }).format(new Date(`${d}T12:00:00Z`));
  const monthLabel = (d: string) =>
    new Intl.DateTimeFormat('es', { month: 'short', year: 'numeric' }).format(
      new Date(`${d}T12:00:00Z`),
    );
  const isWeekend = (d: string) => [0, 6].includes(new Date(`${d}T12:00:00Z`).getUTCDay());

  return (
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* barra de mando: fechas, zoom, datos a la vista */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border/60 px-4 py-2.5">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="iconSm"
              onClick={() => setAnchor(addDays(anchor, -zoom.days))}
              aria-label={t('planning.anterior')}
            >
              ←
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAnchor(iso(new Date()))}>
              {t('planning.hoy')}
            </Button>
            <Button
              variant="outline"
              size="iconSm"
              onClick={() => setAnchor(addDays(anchor, zoom.days))}
              aria-label={t('planning.siguiente')}
            >
              →
            </Button>
          </div>
          <input
            type="date"
            value={anchor}
            onChange={(e) => e.target.value && setAnchor(e.target.value)}
            className="tnum rounded-(--lc-radius) border border-foreground/20 bg-background px-2 py-1 text-[13px]"
          />
          {/* grupo de selección: un solo zoom activo, aspecto segmentado */}
          <div className="flex items-center overflow-hidden rounded-(--lc-radius) border border-input">
            {ZOOMS.map((z) => (
              <Button
                key={z.id}
                variant={z.id === zoomId ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setZoomId(z.id)}
                className="rounded-none border-0 border-l border-input first:border-l-0"
                aria-pressed={z.id === zoomId}
              >
                {t(`planning.${z.id}`)}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: '/plano', search: { date: from, unit: search.unit } })}
            title={t('planning.verEnPlano')}
          >
            <MapIcon className="size-4" />
            {t('planning.verEnPlano')}
          </Button>
          {data && (
            <p className="tnum ml-auto text-[12px] text-muted-foreground">
              {t('planning.unidades', { n: data.units.length })} ·{' '}
              {t('planning.reservas', { n: data.bookings.length })}
            </p>
          )}
        </div>

        {/* bandeja sin asignar: nada se pierde de vista */}
        {byUnit.unassigned.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-accent/50 px-4 py-2">
            <span className="text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
              {t('planning.sinAsignar')}
            </span>
            {byUnit.unassigned.map((b) => (
              <Button
                key={b.id}
                variant="ghost"
                size="xs"
                title={`${b.code} · ${b.dateFrom} → ${b.dateTo}`}
                className={`lc-chip st-${b.status} h-6 px-1.5`}
                onClick={(e) => openPanel(b.id, e.currentTarget)}
              >
                {b.code}
              </Button>
            ))}
          </div>
        )}

        {isPending && <PlanningSkeleton />}
        {isError && <QueryError error={error} onRetry={() => void refetch()} />}

        {data && rows.length === 0 && (
          <EmptyState
            art="calendar"
            title={t('planning.vacio.titulo')}
            description={t('planning.vacio.desc')}
          />
        )}

        {data && rows.length > 0 && (
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto">
            <div style={{ width: LABEL_W + gridW, position: 'relative' }}>
              {/* cabecera sticky: meses + días */}
              <div className="sticky top-0 z-30 bg-background" style={{ width: LABEL_W + gridW }}>
                <div className="flex border-b border-border/60" style={{ paddingLeft: LABEL_W }}>
                  {days.map((d, i) => {
                    const first = i === 0 || d.endsWith('-01');
                    return (
                      <div
                        key={d}
                        className="tnum shrink-0 overflow-visible text-[10px] font-semibold whitespace-nowrap text-muted-foreground uppercase"
                        style={{ width: zoom.cellW, height: 16 }}
                      >
                        {first ? monthLabel(d) : ''}
                      </div>
                    );
                  })}
                </div>
                <div className="flex border-b-2 border-foreground/20" style={{ paddingLeft: LABEL_W }}>
                  {days.map((d) => (
                    <div
                      key={d}
                      className={`tnum shrink-0 py-0.5 text-center text-[11px] ${isWeekend(d) ? 'lc-weekend font-semibold' : 'text-muted-foreground'}`}
                      style={{ width: zoom.cellW }}
                    >
                      {dayLabel(d)}
                    </div>
                  ))}
                </div>
              </div>

              {/* filas virtualizadas */}
              <div
                ref={rowsRef}
                style={{ height: virtualizer.getTotalSize(), position: 'relative' }}
              >
                {virtualizer.getVirtualItems().map((vi) => {
                  const row = rows[vi.index]!;
                  return (
                    <div
                      key={row.id}
                      style={{
                        position: 'absolute',
                        top: vi.start,
                        height: vi.size,
                        width: LABEL_W + gridW,
                      }}
                    >
                      {row.kind === 'group' ? (
                        <div
                          className="flex h-full items-end border-b border-border/60 bg-background pb-0.5"
                          style={{ paddingLeft: 8 }}
                        >
                          <span className="sticky left-2 z-10 text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                            {row.label}
                          </span>
                        </div>
                      ) : (
                        <div className="flex h-full border-b border-border/40">
                          <div
                            className={`tnum sticky left-0 z-20 flex shrink-0 items-center border-r border-border/60 bg-background px-2 text-[12px] font-medium ${row.unit.id === search.unit ? 'text-primary font-semibold' : ''}`}
                            style={{ width: LABEL_W }}
                          >
                            {row.unit.code}
                          </div>
                          <div
                            className="relative"
                            data-unit-row={row.unit.id}
                            style={{ width: gridW }}
                          >
                            {/* sombreado de fin de semana */}
                            {days.map((d, i) =>
                              isWeekend(d) ? (
                                <div
                                  key={d}
                                  className="lc-weekend absolute inset-y-0"
                                  style={{ left: i * zoom.cellW, width: zoom.cellW }}
                                />
                              ) : null,
                            )}
                            {/* bloqueos */}
                            {(byUnit.blocks.get(row.unit.id) ?? []).map((blk) => {
                              const g = barGeometry(blk.dateFrom, blk.dateTo);
                              return g ? (
                                <div
                                  key={blk.id}
                                  className="lc-block"
                                  style={g}
                                  title={`${t(`bloqueo.${blk.reason}`)} · ${blk.dateFrom} → ${blk.dateTo}`}
                                >
                                  {t(`bloqueo.${blk.reason}`)}
                                </div>
                              ) : null;
                            })}
                            {/* reservas */}
                            {(byUnit.bookings.get(row.unit.id) ?? []).map((b) => {
                              const g = barGeometry(b.dateFrom, b.dateTo);
                              const pax = b.occupancy.adults + b.occupancy.childrenAges.length;
                              return g ? (
                                <div
                                  key={b.id}
                                  tabIndex={0}
                                  className={`lc-bar lc-grab st-${b.status}`}
                                  style={g}
                                  title={`${b.code} · ${t(`estado.${b.status}`)} · ${b.dateFrom} → ${b.dateTo} · ${t('planning.pax', { n: pax })}`}
                                  onPointerDown={(e) => onBarPointerDown(e, b, row.unit.id)}
                                  onPointerMove={onBarPointerMove}
                                  onPointerUp={onBarPointerUp}
                                  onPointerCancel={onBarPointerUp}
                                  onKeyDown={(e) => onBarKeyDown(e, b, row.unit.id)}
                                >
                                  {b.code.replace(/^CS-\d{4}-/, '')} · {pax}p
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {openId && data && <BookingPanel bookingId={openId} onClose={closePanel} />}
    </div>
  );
}
