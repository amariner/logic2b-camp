/**
 * PLANNING ★ (ADR 0008 · gestos ADR 0023) — el tape chart que recepción mira
 * 200 veces al día. Virtualización de FILAS con @tanstack/react-virtual; las
 * reservas son barras absolutas por fila. Gestos con pointer events nativos
 * (manipulación directa del DOM, cero re-render por frame):
 *   · vertical  = reasignar unidad (optimista + Deshacer)
 *   · horizontal = mover la estancia (mantiene noches) — re-cotiza el SERVIDOR
 *   · bordes    = estirar/acortar (resize handles)
 *   · celdas libres = crear reserva con unidad+fechas precargadas
 *   · bandeja "sin asignar" = arrastrar a una fila para asignar
 * Si el precio cambia al soltar, un diálogo enseña el desglose nuevo ANTES de
 * confirmar (candado expectedTotalCents contra el servidor). La geometría
 * fecha↔píxel vive en @logic-camp/config (pura, testeada).
 */
import {
  addDaysIso,
  barGeometry,
  daysBetweenIso,
  isoDay,
  seasonBands,
  snapDays,
  todayOffset,
  weekendBackground,
} from '@logic-camp/config';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  EmptyState,
  Input,
  SelectNative,
  Skeleton,
  toast,
} from '@logic-camp/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Ban, Map as MapIcon, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ApiError,
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  type PlanningBlock,
  type PlanningBooking,
  type PlanningData,
  type PlanningUnit,
  type RequoteResponse,
} from '../api';
import BlockDialog from '../components/BlockDialog';
import BookingPanel from '../components/BookingPanel';
import NewBookingPanel, { type NewBookingInitial } from '../components/NewBookingPanel';
import { QueryError } from '../components/QueryError';
import { t, tDyn } from '../i18n';
import { conceptLabel, eur, stayError } from '../lib/format';
import { BotonAyuda } from '../components/BotonAyuda';

/** "en casa" (ADR 0022): huésped presente. Se DERIVA, no es un status. */
const barStatusClass = (b: PlanningBooking) =>
  b.status === 'confirmed' && b.checkedInAt && !b.checkedOutAt ? 'inhouse' : b.status;

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
 * Un movimiento de fechas (y opcionalmente unidad) pendiente de escribir.
 * `prev` es lo que hace posible el Deshacer; `expectedTotalCents` el candado
 * de precio contra el servidor (ADR 0023 §1).
 */
type MoveIntent = {
  id: string;
  code: string;
  dateFrom: string;
  dateTo: string;
  unitId?: string;
  expectedTotalCents?: number;
  prev: { dateFrom: string; dateTo: string; unitId: string };
  undo?: boolean;
};

const shortDate = (d: string) =>
  new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }).format(
    new Date(`${d}T12:00:00Z`),
  );

/**
 * Esqueleto con la forma del tape chart (ADR 0020, C3): columna de códigos de
 * unidad a la izquierda y barras de anchos y desplazamientos distintos a la
 * derecha. Está fuera del componente a propósito: no entra en el camino caliente
 * del render de barras ni de celdas de día.
 */
const SKELETON_BARS: ReadonlyArray<ReadonlyArray<[number, number]>> = [
  [
    [2, 26],
    [40, 18],
  ],
  [[0, 34]],
  [
    [12, 20],
    [46, 30],
  ],
  [[6, 48]],
  [
    [28, 14],
    [52, 22],
  ],
  [
    [0, 18],
    [36, 12],
    [62, 26],
  ],
  [[18, 40]],
  [
    [4, 12],
    [30, 34],
  ],
];

function PlanningSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label={t('planning.cargando')}
      className="min-h-0 flex-1 overflow-hidden"
    >
      {/* cabecera de días */}
      <div className="flex border-b-2 border-foreground/20" style={{ paddingLeft: LABEL_W }}>
        {Array.from({ length: 24 }, (_, i) => (
          <Skeleton key={i} className="mx-1 my-1.5 h-2.5 w-4 shrink-0 rounded-sm" />
        ))}
      </div>
      {SKELETON_BARS.map((bars, r) => (
        <div
          key={r}
          className="flex items-center border-b border-border/40"
          style={{ height: ROW_H }}
        >
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
  const [anchor, setAnchor] = useState(() => search.date ?? isoDay(new Date()));
  const zoom = ZOOMS.find((z) => z.id === zoomId)!;
  const from = anchor;
  const to = addDaysIso(anchor, zoom.days);
  const today = isoDay(new Date());

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['planning', from, to],
    queryFn: () => apiGet<PlanningData>(`/api/admin/planning?from=${from}&to=${to}`),
    staleTime: 15_000,
    refetchInterval: 60_000, // "tiempo real" de recepción: refresco de cortesía
  });

  // ---------- filtros DENTRO del planning (ADR 0023 §3) ----------
  // tipo oculta grupos de filas; estado y búsqueda ATENÚAN barras (ocultarlas
  // mentiría sobre la ocupación real de la unidad).
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [buscar, setBuscar] = useState('');
  const hayFiltroBarras = Boolean(estadoFiltro || buscar.trim());
  const barDimmed = (b: PlanningBooking, unitCode: string) => {
    if (!hayFiltroBarras) return false;
    if (estadoFiltro && barStatusClass(b) !== estadoFiltro) return true;
    const q = buscar.trim().toLowerCase();
    return Boolean(q && !b.code.toLowerCase().includes(q) && !unitCode.toLowerCase().includes(q));
  };

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
      if (tipoFiltro && type.id !== tipoFiltro) continue;
      const units = byType.get(type.id) ?? [];
      if (!units.length) continue;
      out.push({ kind: 'group', id: `g_${type.id}`, label: type.nameI18n.es ?? type.id });
      for (const u of units) out.push({ kind: 'unit', id: u.id, unit: u });
    }
    return out;
  }, [data, tipoFiltro]);

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

  // ---------- mover/estirar fechas (ADR 0023 §1): el precio SIEMPRE del servidor ----------
  const moveErrorText = (e: unknown): string => {
    if (e instanceof ApiError && e.body && typeof e.body === 'object') {
      const body = e.body as {
        error?: string;
        issues?: { code: string; params?: Record<string, string | number> }[];
      };
      if (body.error === 'invalid_stay' && body.issues?.length)
        return body.issues.map((i) => stayError(i.code, i.params)).join(' ');
      if (body.error)
        return tDyn(`planning.moverError.${body.error}`, t('planning.moverError.generic'));
    }
    return t('planning.moverError.generic');
  };

  const moverRef = useRef<(input: MoveIntent) => void>(() => {});
  const mover = useMutation({
    mutationFn: (input: MoveIntent) =>
      apiPatch(`/api/admin/bookings/${input.id}`, {
        action: 'move',
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
        unitId: input.unitId,
        expectedTotalCents: input.expectedTotalCents,
      }),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: ['planning', from, to] });
      const prev = qc.getQueryData<PlanningData>(['planning', from, to]);
      qc.setQueryData<PlanningData>(['planning', from, to], (d) =>
        d
          ? {
              ...d,
              bookings: d.bookings.map((b) =>
                b.id === input.id
                  ? {
                      ...b,
                      dateFrom: input.dateFrom,
                      dateTo: input.dateTo,
                      unitId: input.unitId ?? b.unitId,
                    }
                  : b,
              ),
            }
          : d,
      );
      return { prev };
    },
    onError: (e, input, ctx) => {
      if (ctx?.prev) qc.setQueryData(['planning', from, to], ctx.prev);
      toast.error(input.undo ? t('accion.errorDeshacer') : moveErrorText(e));
    },
    onSuccess: (_d, input) => {
      if (input.undo) {
        toast.success(t('accion.deshecho'));
        return;
      }
      toast.success(
        t('planning.movida', {
          from: shortDate(input.dateFrom),
          to: shortDate(input.dateTo),
        }),
        {
          action: {
            label: t('accion.deshacer'),
            // el deshacer es otro move a las fechas/unidad de origen, SIN candado:
            // el servidor re-cotiza y las tarifas no han cambiado en segundos
            onClick: () =>
              moverRef.current({
                id: input.id,
                code: input.code,
                dateFrom: input.prev.dateFrom,
                dateTo: input.prev.dateTo,
                unitId: input.prev.unitId,
                prev: {
                  dateFrom: input.dateFrom,
                  dateTo: input.dateTo,
                  unitId: input.unitId ?? input.prev.unitId,
                },
                undo: true,
              }),
          },
        },
      );
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: ['planning'] }),
  });
  moverRef.current = mover.mutate;

  // el flujo del gesto: soltar → requote (dry-run) → si el total no cambia,
  // commit directo; si cambia, diálogo con el desglose nuevo antes de escribir
  const [pendingMove, setPendingMove] = useState<{
    intent: MoveIntent;
    quote: RequoteResponse;
  } | null>(null);
  const requote = useMutation({
    mutationFn: (input: MoveIntent) =>
      apiPost<RequoteResponse>(`/api/admin/bookings/${input.id}/requote`, {
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
        unitId: input.unitId,
      }),
    onSuccess: (q, input) => {
      const intent = { ...input, expectedTotalCents: q.totalCents };
      if (q.totalCents === q.previousTotalCents) mover.mutate(intent);
      else setPendingMove({ intent, quote: q });
    },
    onError: (e) => toast.error(moveErrorText(e)),
  });
  const startMove = (intent: MoveIntent) => {
    if (
      intent.dateFrom === intent.prev.dateFrom &&
      intent.dateTo === intent.prev.dateTo &&
      (!intent.unitId || intent.unitId === intent.prev.unitId)
    )
      return; // no-op: ni fechas ni unidad cambian
    requote.mutate(intent);
  };

  // ---------- infraestructura de arrastre (manipulación directa del DOM) ----------
  const rowsRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const createSelRef = useRef<HTMLDivElement>(null);

  const showTip = (e: { clientX: number; clientY: number }, f: string, tt: string) => {
    const tip = tipRef.current;
    if (!tip) return;
    const n = daysBetweenIso(f, tt);
    tip.textContent = `${shortDate(f)} → ${shortDate(tt)} · ${n === 1 ? t('ficha.noche') : t('ficha.noches', { n })}`;
    tip.style.display = 'block';
    tip.style.left = `${e.clientX + 14}px`;
    tip.style.top = `${e.clientY + 18}px`;
  };
  const hideTip = () => {
    if (tipRef.current) tipRef.current.style.display = 'none';
  };

  /** Fila de unidad bajo el cursor (solo filas visibles: la virtualización manda). */
  const unitRowUnder = (clientY: number): Row | undefined => {
    const rowsTop = rowsRef.current?.getBoundingClientRect().top ?? 0;
    const y = clientY - rowsTop;
    const vi = virtualizer.getVirtualItems().find((v) => v.start <= y && y < v.end);
    return vi ? rows[vi.index] : undefined;
  };

  type DragState = {
    mode: 'click' | 'bar' | 'resize-l' | 'resize-r';
    booking: PlanningBooking;
    sourceUnitId: string;
    el: HTMLElement;
    startX: number;
    startY: number;
    moved: boolean;
    /** move: desplazamiento en días; resize: delta efectivo del borde (clampado a ≥1 noche) */
    dayDelta: number;
    targetUnitId: string | null;
    targetEl: HTMLElement | null;
    baseLeft: number;
    baseWidth: number;
  };
  const dragRef = useRef<DragState | null>(null);

  const clearTargetHighlight = () => {
    const d = dragRef.current;
    if (d?.targetEl) d.targetEl.style.boxShadow = '';
  };

  const beginDrag = (
    e: React.PointerEvent<HTMLElement>,
    b: PlanningBooking,
    sourceUnitId: string,
    mode: DragState['mode'],
    barEl: HTMLElement,
  ) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      mode,
      booking: b,
      sourceUnitId,
      el: barEl,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      dayDelta: 0,
      targetUnitId: null,
      targetEl: null,
      baseLeft: barEl.offsetLeft,
      baseWidth: barEl.offsetWidth,
    };
  };

  const onBarPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    b: PlanningBooking,
    sourceUnitId: string,
  ) => beginDrag(e, b, sourceUnitId, 'click', e.currentTarget);

  const onHandlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    b: PlanningBooking,
    sourceUnitId: string,
    edge: 'l' | 'r',
  ) => {
    e.stopPropagation();
    beginDrag(
      e,
      b,
      sourceUnitId,
      edge === 'l' ? 'resize-l' : 'resize-r',
      e.currentTarget.parentElement as HTMLElement,
    );
  };

  const onBarPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return; // umbral: un click no es un drag
    d.moved = true;
    if (d.mode === 'click') d.mode = 'bar';
    const b = d.booking;

    if (d.mode === 'bar') {
      const dd = snapDays(dx, zoom.cellW);
      d.dayDelta = dd;
      d.el.style.transform = `translate(${dd * zoom.cellW}px, ${dy}px)`;
      d.el.style.zIndex = '40';
      d.el.style.opacity = '0.85';
      // destino vertical (reasignación): fila del MISMO tipo bajo el cursor
      const row = unitRowUnder(e.clientY);
      clearTargetHighlight();
      if (
        row?.kind === 'unit' &&
        row.unit.unitTypeId === b.unitTypeId &&
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
      showTip(e, addDaysIso(b.dateFrom, dd), addDaysIso(b.dateTo, dd));
      return;
    }

    // resize: clamp a ≥1 noche; feedback moviendo solo el borde arrastrado
    const raw = snapDays(dx, zoom.cellW);
    if (d.mode === 'resize-r') {
      const minDelta = daysBetweenIso(b.dateTo, addDaysIso(b.dateFrom, 1));
      d.dayDelta = Math.max(raw, minDelta);
      d.el.style.width = `${d.baseWidth + d.dayDelta * zoom.cellW}px`;
      showTip(e, b.dateFrom, addDaysIso(b.dateTo, d.dayDelta));
    } else {
      const maxDelta = daysBetweenIso(b.dateFrom, addDaysIso(b.dateTo, -1));
      d.dayDelta = Math.min(raw, maxDelta);
      d.el.style.left = `${d.baseLeft + d.dayDelta * zoom.cellW}px`;
      d.el.style.width = `${d.baseWidth - d.dayDelta * zoom.cellW}px`;
      showTip(e, addDaysIso(b.dateFrom, d.dayDelta), b.dateTo);
    }
    d.el.style.zIndex = '40';
    d.el.style.opacity = '0.85';
  };

  const onBarPointerUp = () => {
    const d = dragRef.current;
    if (!d) return;
    clearTargetHighlight();
    hideTip();
    d.el.style.transform = '';
    d.el.style.zIndex = '';
    d.el.style.opacity = '';
    d.el.style.left = `${d.baseLeft}px`;
    d.el.style.width = `${d.baseWidth}px`;
    dragRef.current = null;

    const b = d.booking;
    const prev = { dateFrom: b.dateFrom, dateTo: b.dateTo, unitId: d.sourceUnitId };
    if (!d.moved) {
      if (d.mode === 'click') openPanel(b.id, d.el); // un click (sin drag) abre la ficha
      return;
    }
    if (d.mode === 'bar') {
      if (d.dayDelta === 0 && d.targetUnitId) {
        // gesto puramente vertical: la reasignación de siempre
        reassign.mutate({ id: b.id, unitId: d.targetUnitId, fromUnitId: d.sourceUnitId });
      } else if (d.dayDelta !== 0) {
        startMove({
          id: b.id,
          code: b.code,
          dateFrom: addDaysIso(b.dateFrom, d.dayDelta),
          dateTo: addDaysIso(b.dateTo, d.dayDelta),
          unitId: d.targetUnitId ?? undefined, // diagonal: fecha+unidad en UNA acción
          prev,
        });
      }
      return;
    }
    if (d.dayDelta !== 0) {
      startMove({
        id: b.id,
        code: b.code,
        dateFrom: d.mode === 'resize-l' ? addDaysIso(b.dateFrom, d.dayDelta) : b.dateFrom,
        dateTo: d.mode === 'resize-r' ? addDaysIso(b.dateTo, d.dayDelta) : b.dateTo,
        prev,
      });
    }
  };

  // teclado (paridad con el gesto, ADR 0023 §1): ↑/↓ reasigna · ←/→ mueve un día
  // · Shift+←/→ estira/encoge · Enter/Espacio abre la ficha
  const onBarKeyDown = (e: React.KeyboardEvent, b: PlanningBooking, sourceUnitId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPanel(b.id, e.currentTarget as HTMLElement);
      return;
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      if (e.repeat) return; // cada pulsación = una re-cotización; mantenerla no debe ametrallar
      const dd = e.key === 'ArrowRight' ? 1 : -1;
      const prev = { dateFrom: b.dateFrom, dateTo: b.dateTo, unitId: sourceUnitId };
      if (e.shiftKey) {
        const newTo = addDaysIso(b.dateTo, dd);
        if (daysBetweenIso(b.dateFrom, newTo) < 1) return;
        startMove({ id: b.id, code: b.code, dateFrom: b.dateFrom, dateTo: newTo, prev });
      } else {
        startMove({
          id: b.id,
          code: b.code,
          dateFrom: addDaysIso(b.dateFrom, dd),
          dateTo: addDaysIso(b.dateTo, dd),
          prev,
        });
      }
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

  // ---------- crear arrastrando sobre celdas libres (ADR 0023 §2 / C1.2) ----------
  const createRef = useRef<{
    unit: PlanningUnit;
    rowTop: number;
    startDay: number;
    endDay: number;
    moved: boolean;
  } | null>(null);

  const dayAtClientX = (clientX: number) => {
    const left = (rowsRef.current?.getBoundingClientRect().left ?? 0) + LABEL_W;
    return Math.min(zoom.days - 1, Math.max(0, Math.floor((clientX - left) / zoom.cellW)));
  };

  const paintCreateSel = () => {
    const c = createRef.current;
    const sel = createSelRef.current;
    if (!c || !sel) return;
    const a = Math.min(c.startDay, c.endDay);
    const b = Math.max(c.startDay, c.endDay);
    sel.style.display = 'block';
    sel.style.top = `${c.rowTop + 3}px`;
    sel.style.height = `${ROW_H - 7}px`;
    sel.style.left = `${LABEL_W + a * zoom.cellW}px`;
    sel.style.width = `${(b - a + 1) * zoom.cellW - 2}px`;
  };

  const onRowPointerDown = (e: React.PointerEvent<HTMLDivElement>, row: Row, rowTop: number) => {
    // solo el lienzo vacío: las barras y bloqueos capturan su propio pointerdown
    if (e.button !== 0 || e.target !== e.currentTarget || row.kind !== 'unit') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const day = dayAtClientX(e.clientX);
    createRef.current = { unit: row.unit, rowTop, startDay: day, endDay: day, moved: false };
  };

  const onRowPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const c = createRef.current;
    if (!c) return;
    const day = dayAtClientX(e.clientX);
    if (!c.moved && day === c.startDay) return;
    c.moved = true;
    c.endDay = day;
    paintCreateSel();
    const a = Math.min(c.startDay, c.endDay);
    const b = Math.max(c.startDay, c.endDay);
    showTip(e, addDaysIso(from, a), addDaysIso(from, b + 1));
  };

  const onRowPointerUp = () => {
    const c = createRef.current;
    createRef.current = null;
    if (createSelRef.current) createSelRef.current.style.display = 'none';
    hideTip();
    if (!c?.moved) return; // un click suelto en celda vacía no crea nada
    const a = Math.min(c.startDay, c.endDay);
    const b = Math.max(c.startDay, c.endDay);
    setAlta({
      unitTypeId: c.unit.unitTypeId,
      unitId: c.unit.id,
      unitCode: c.unit.code,
      dateFrom: addDaysIso(from, a),
      dateTo: addDaysIso(from, b + 1),
    });
  };

  // ---------- arrastrar desde la bandeja "sin asignar" (ADR 0023 §2) ----------
  const chipDragRef = useRef<{
    booking: PlanningBooking;
    el: HTMLElement;
    startX: number;
    startY: number;
    moved: boolean;
    targetUnitId: string | null;
    targetEl: HTMLElement | null;
  } | null>(null);
  const chipClickGuard = useRef(false);

  const asignar = useMutation({
    mutationFn: (input: { id: string; unitId: string }) =>
      apiPatch(`/api/admin/bookings/${input.id}`, { action: 'reassign', unitId: input.unitId }),
    onSuccess: (_d, input) => {
      const unit = data?.units.find((u) => u.id === input.unitId);
      const code = data?.bookings.find((b) => b.id === input.id)?.code ?? '';
      toast.success(t('planning.asignada', { code, unit: unit?.code ?? input.unitId }));
    },
    onError: () => toast.error(t('planning.asignarError')),
    onSettled: () => void qc.invalidateQueries({ queryKey: ['planning'] }),
  });

  const onChipPointerDown = (e: React.PointerEvent<HTMLElement>, b: PlanningBooking) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    chipDragRef.current = {
      booking: b,
      el: e.currentTarget,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      targetUnitId: null,
      targetEl: null,
    };
  };

  const onChipPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const c = chipDragRef.current;
    if (!c) return;
    if (!c.moved && Math.abs(e.clientX - c.startX) < 4 && Math.abs(e.clientY - c.startY) < 4)
      return;
    c.moved = true;
    c.el.style.opacity = '0.5';
    if (c.targetEl) c.targetEl.style.boxShadow = '';
    const row = unitRowUnder(e.clientY);
    if (row?.kind === 'unit' && row.unit.unitTypeId === c.booking.unitTypeId) {
      const el =
        rowsRef.current?.querySelector<HTMLElement>(`[data-unit-row="${row.unit.id}"]`) ?? null;
      if (el) el.style.boxShadow = 'inset 0 0 0 2px var(--primary)';
      c.targetUnitId = row.unit.id;
      c.targetEl = el;
    } else {
      c.targetUnitId = null;
      c.targetEl = null;
    }
    showTip(e, c.booking.dateFrom, c.booking.dateTo);
  };

  const onChipPointerUp = () => {
    const c = chipDragRef.current;
    chipDragRef.current = null;
    if (!c) return;
    if (c.targetEl) c.targetEl.style.boxShadow = '';
    c.el.style.opacity = '';
    hideTip();
    if (!c.moved) return; // el click normal lo gestiona onClick (abre la ficha)
    chipClickGuard.current = true; // que el click posterior al drag no abra la ficha
    if (c.targetUnitId) asignar.mutate({ id: c.booking.id, unitId: c.targetUnitId });
  };

  // ---------- alta manual y bloqueos desde el planning (ADR 0022 §3/§4 · 0023 §2) ----------
  const [alta, setAlta] = useState<NewBookingInitial | null>(null);
  const [bloqueoAbierto, setBloqueoAbierto] = useState(false);

  // Levantar un bloqueo desde el propio planning: el plano ya cerraba el ciclo
  // (sesión 47, UnitPanel) pero aquí las barras rayadas eran solo pintura. El
  // gesto es un CLICK discreto, no un arrastre: el modelo de arrastre de esta
  // pantalla es para reservas, y un bloqueo no se mueve (se levanta y se vuelve
  // a crear). El foco vuelve a la barra al cerrar, como en la ficha.
  const [pendingUnblock, setPendingUnblock] = useState<PlanningBlock | null>(null);
  const unblockOpenerRef = useRef<HTMLElement | null>(null);
  const unblockConfirmedRef = useRef(false);
  const quitarBloqueo = useMutation({
    mutationFn: (blockId: string) => apiDelete<{ ok: boolean }>(`/api/admin/blocks/${blockId}`),
    onSuccess: () => toast.success(t('bloqueo.quitado')),
    onError: () => toast.error(t('bloqueo.quitarError')),
    onSettled: () => void qc.invalidateQueries({ queryKey: ['planning'] }),
  });
  const askUnblock = (blk: PlanningBlock, opener: HTMLElement) => {
    unblockOpenerRef.current = opener;
    unblockConfirmedRef.current = false;
    setPendingUnblock(blk);
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

  // búsqueda: Enter centra la primera coincidencia (reserva o unidad) a la vista
  const jumpToMatch = () => {
    const q = buscar.trim().toLowerCase();
    if (!q || !data) return;
    const match = data.bookings.find((b) => b.unitId && b.code.toLowerCase().includes(q));
    const unitId = match?.unitId ?? data.units.find((u) => u.code.toLowerCase().includes(q))?.id;
    if (!unitId) return;
    const idx = rows.findIndex((r) => r.kind === 'unit' && r.unit.id === unitId);
    if (idx >= 0) virtualizer.scrollToIndex(idx, { align: 'center' });
  };

  const days = useMemo(
    () => Array.from({ length: zoom.days }, (_, i) => addDaysIso(from, i)),
    [from, zoom.days],
  );
  const gridW = zoom.days * zoom.cellW;

  const dayLabel = (d: string) =>
    new Intl.DateTimeFormat('es', { day: 'numeric' }).format(new Date(`${d}T12:00:00Z`));
  const monthLabel = (d: string) =>
    new Intl.DateTimeFormat('es', { month: 'short', year: 'numeric' }).format(
      new Date(`${d}T12:00:00Z`),
    );
  const isWeekend = (d: string) => [0, 6].includes(new Date(`${d}T12:00:00Z`).getUTCDay());

  // orientación (ADR 0023 §3): hoy, temporadas — calculado, no por celda
  const todayX = todayOffset(from, zoom.days, zoom.cellW, today);
  const bands = useMemo(
    () => (data ? seasonBands(data.seasons, from, zoom.days) : []),
    [data, from, zoom.days],
  );

  return (
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* barra de mando: fechas, zoom, datos a la vista */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border/60 px-4 py-2.5">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="iconSm"
              onClick={() => setAnchor(addDaysIso(anchor, -zoom.days))}
              aria-label={t('planning.anterior')}
            >
              ←
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAnchor(isoDay(new Date()))}>
              {t('planning.hoy')}
            </Button>
            <Button
              variant="outline"
              size="iconSm"
              onClick={() => setAnchor(addDaysIso(anchor, zoom.days))}
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBloqueoAbierto(true)}
            title={t('bloqueo.crear')}
          >
            <Ban className="size-4" />
            {t('bloqueo.crear')}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setOpenId(null);
              setAlta({});
            }}
          >
            <Plus className="size-4" />
            {t('planning.nuevaReserva')}
          </Button>
          {data && (
            <p className="tnum ml-auto text-[12px] text-muted-foreground">
              {t('planning.unidades', { n: data.units.length })} ·{' '}
              {t('planning.reservas', { n: data.bookings.length })}
            </p>
          )}
          <BotonAyuda />
        </div>

        {/* filtros dentro del planning (ADR 0023 §3) */}
        {data && (
          <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-4 py-1.5">
            <SelectNative
              aria-label={t('planning.filtro.tipo')}
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
            >
              <option value="">{t('planning.filtro.todos')}</option>
              {data.unitTypes.map((ut) => (
                <option key={ut.id} value={ut.id}>
                  {ut.nameI18n.es ?? ut.id}
                </option>
              ))}
            </SelectNative>
            <SelectNative
              aria-label={t('planning.filtro.estado')}
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="">{t('planning.filtro.todas')}</option>
              {(['confirmed', 'inhouse', 'pending', 'completed', 'no_show'] as const).map((s) => (
                <option key={s} value={s}>
                  {t(`estado.${s}`)}
                </option>
              ))}
            </SelectNative>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') jumpToMatch();
                }}
                placeholder={t('planning.buscar')}
                aria-label={t('planning.buscar')}
                className="w-56 pl-7"
              />
            </div>
          </div>
        )}

        {/* bandeja sin asignar: nada se pierde de vista — y se arrastra a una fila */}
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
                title={`${b.code} · ${b.dateFrom} → ${b.dateTo} · ${t('planning.arrastrarChip')}`}
                className={`lc-chip lc-grab st-${b.status} h-6 px-1.5`}
                onPointerDown={(e) => onChipPointerDown(e, b)}
                onPointerMove={onChipPointerMove}
                onPointerUp={onChipPointerUp}
                onPointerCancel={onChipPointerUp}
                onClick={(e) => {
                  if (chipClickGuard.current) {
                    chipClickGuard.current = false;
                    return;
                  }
                  openPanel(b.id, e.currentTarget);
                }}
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
              {/* cabecera sticky: meses + días + franja de temporada */}
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
                <div className="flex" style={{ paddingLeft: LABEL_W }}>
                  {days.map((d) => (
                    <div
                      key={d}
                      className={`tnum shrink-0 py-0.5 text-center text-[11px] ${isWeekend(d) ? 'lc-weekend font-semibold' : 'text-muted-foreground'}`}
                      style={{
                        width: zoom.cellW,
                        ...(d === today ? { color: 'var(--lc-today)', fontWeight: 700 } : {}),
                      }}
                      title={d === today ? t('planning.hoy') : undefined}
                    >
                      {dayLabel(d)}
                    </div>
                  ))}
                </div>
                {/* franja de temporada: contexto de negocio, nombre en tooltip */}
                <div
                  className="relative border-b-2 border-foreground/20"
                  style={{ marginLeft: LABEL_W, width: gridW, height: 7 }}
                >
                  {bands.map((band) => (
                    <div
                      key={`${band.start}-${band.name}`}
                      className="lc-season-band"
                      style={{
                        left: band.start * zoom.cellW,
                        width: band.days * zoom.cellW - 1,
                        background: `var(--lc-season-${band.tone})`,
                      }}
                      title={band.name}
                    />
                  ))}
                </div>
              </div>

              {/* filas virtualizadas */}
              <div
                ref={rowsRef}
                style={{ height: virtualizer.getTotalSize(), position: 'relative' }}
              >
                {/* finde: UNA capa con gradiente para todo el lienzo (ADR 0023 §5) */}
                <div
                  aria-hidden
                  className="absolute inset-y-0"
                  style={{
                    left: LABEL_W,
                    width: gridW,
                    backgroundImage: weekendBackground(from, zoom.cellW, 'var(--lc-weekend-fill)'),
                  }}
                />
                {/* línea de HOY sobre toda la malla */}
                {todayX !== null && (
                  <div
                    aria-hidden
                    className="lc-today-line"
                    style={{ left: LABEL_W + todayX }}
                    title={t('planning.hoy')}
                  />
                )}
                {/* selección de "crear arrastrando" (un solo nodo, se mueve por JS) */}
                <div ref={createSelRef} className="lc-create-sel" style={{ display: 'none' }} />

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
                            onPointerDown={(e) => onRowPointerDown(e, row, vi.start)}
                            onPointerMove={onRowPointerMove}
                            onPointerUp={onRowPointerUp}
                            onPointerCancel={onRowPointerUp}
                          >
                            {/* bloqueos */}
                            {(byUnit.blocks.get(row.unit.id) ?? []).map((blk) => {
                              const g = barGeometry(
                                from,
                                zoom.days,
                                zoom.cellW,
                                blk.dateFrom,
                                blk.dateTo,
                              );
                              return g ? (
                                <div
                                  key={blk.id}
                                  role="button"
                                  tabIndex={0}
                                  className="lc-block"
                                  style={{ left: g.left, width: g.width }}
                                  title={`${t(`bloqueo.${blk.reason}`)} · ${blk.dateFrom} → ${blk.dateTo} · ${t('planning.bloqueo.pista')}`}
                                  aria-label={t('planning.bloqueo.aria', {
                                    motivo: t(`bloqueo.${blk.reason}`),
                                    desde: blk.dateFrom,
                                    hasta: blk.dateTo,
                                    unidad: row.unit.code,
                                  })}
                                  onClick={(e) => askUnblock(blk, e.currentTarget)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      askUnblock(blk, e.currentTarget);
                                    }
                                  }}
                                >
                                  {t(`bloqueo.${blk.reason}`)}
                                </div>
                              ) : null;
                            })}
                            {/* reservas */}
                            {(byUnit.bookings.get(row.unit.id) ?? []).map((b) => {
                              const g = barGeometry(
                                from,
                                zoom.days,
                                zoom.cellW,
                                b.dateFrom,
                                b.dateTo,
                              );
                              if (!g) return null;
                              const pax = b.occupancy.adults + b.occupancy.childrenAges.length;
                              const dim = barDimmed(b, row.unit.code);
                              return (
                                <div
                                  key={b.id}
                                  tabIndex={0}
                                  className={`lc-bar lc-grab st-${barStatusClass(b)}${g.clipStart ? ' lc-clip-l' : ''}${g.clipEnd ? ' lc-clip-r' : ''}${dim ? ' lc-dim' : ''}`}
                                  style={{ left: g.left, width: g.width }}
                                  title={`${b.code} · ${t(`estado.${b.status}`)} · ${b.dateFrom} → ${b.dateTo} · ${t('planning.pax', { n: pax })}`}
                                  onPointerDown={(e) => onBarPointerDown(e, b, row.unit.id)}
                                  onPointerMove={onBarPointerMove}
                                  onPointerUp={onBarPointerUp}
                                  onPointerCancel={onBarPointerUp}
                                  onKeyDown={(e) => onBarKeyDown(e, b, row.unit.id)}
                                >
                                  {/* asas de estirar (ADR 0023 §1); en un borde recortado no hay asa */}
                                  {!g.clipStart && (
                                    <div
                                      aria-hidden
                                      className="lc-handle lc-handle-l"
                                      onPointerDown={(e) =>
                                        onHandlePointerDown(e, b, row.unit.id, 'l')
                                      }
                                    />
                                  )}
                                  {b.code.replace(/^CS-\d{4}-/, '')} · {pax}p
                                  {!g.clipEnd && (
                                    <div
                                      aria-hidden
                                      className="lc-handle lc-handle-r"
                                      onPointerDown={(e) =>
                                        onHandlePointerDown(e, b, row.unit.id, 'r')
                                      }
                                    />
                                  )}
                                </div>
                              );
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
      {alta && (
        <NewBookingPanel
          initial={alta}
          onClose={() => setAlta(null)}
          onCreated={(id) => {
            setAlta(null);
            setOpenId(id);
          }}
        />
      )}
      <BlockDialog open={bloqueoAbierto} onOpenChange={setBloqueoAbierto} defaultDate={from} />

      {/* levantar un bloqueo pinchando su barra rayada (BACKLOG [C1], remate de C4.4) */}
      <AlertDialog
        open={pendingUnblock !== null}
        onOpenChange={(open) => {
          if (!open) setPendingUnblock(null);
        }}
      >
        <AlertDialogContent
          // volver atrás devuelve el foco a la barra que abrió el diálogo; si el
          // bloqueo se ha levantado la barra ya no existe y no hay a dónde volver
          onCloseAutoFocus={(e) => {
            const opener = unblockOpenerRef.current;
            unblockOpenerRef.current = null;
            if (!unblockConfirmedRef.current && opener?.isConnected) {
              e.preventDefault();
              opener.focus();
            }
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmar.quitarBloqueo.titulo')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirmar.quitarBloqueo.desc')}</AlertDialogDescription>
          </AlertDialogHeader>
          {pendingUnblock && (
            <div className="text-[13px]">
              <p className="font-medium">
                {tDyn(`bloqueo.${pendingUnblock.reason}`, pendingUnblock.reason)}
              </p>
              <p className="tnum text-muted-foreground">
                {pendingUnblock.dateFrom} → {pendingUnblock.dateTo}
              </p>
              {!pendingUnblock.unitId && (
                <p className="mt-1 text-muted-foreground">{t('plano.unidad.bloqueoTipo')}</p>
              )}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>{t('confirmar.cancelar')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                unblockConfirmedRef.current = true;
                if (pendingUnblock) quitarBloqueo.mutate(pendingUnblock.id);
                setPendingUnblock(null);
              }}
            >
              {t('confirmar.quitarBloqueo.ok')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* el precio cambia: desglose nuevo ANTES de confirmar (ADR 0023 §1) */}
      <AlertDialog
        open={pendingMove !== null}
        onOpenChange={(open) => {
          if (!open) setPendingMove(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('planning.precio.titulo')}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingMove &&
                t('planning.precio.desc', {
                  code: pendingMove.intent.code,
                  antes: eur(pendingMove.quote.previousTotalCents),
                  ahora: eur(pendingMove.quote.totalCents),
                })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {pendingMove && (
            <dl className="max-h-56 overflow-y-auto text-[13px]">
              {pendingMove.quote.breakdown.lines.map((line, i) => (
                <div key={i} className="flex justify-between gap-2 py-0.5">
                  <dt className={line.amountCents < 0 ? 'text-primary' : ''}>
                    {conceptLabel(line.concept)}
                  </dt>
                  <dd className={`tnum ${line.amountCents < 0 ? 'text-primary' : ''}`}>
                    {eur(line.amountCents, pendingMove.quote.breakdown.currency)}
                  </dd>
                </div>
              ))}
              <div className="mt-1 flex justify-between gap-2 border-t border-border/60 pt-1 font-semibold">
                <dt>{t('alta.total')}</dt>
                <dd className="tnum">
                  {eur(pendingMove.quote.totalCents, pendingMove.quote.breakdown.currency)}
                </dd>
              </div>
            </dl>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>{t('planning.precio.cancelar')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingMove) mover.mutate(pendingMove.intent);
                setPendingMove(null);
              }}
            >
              {t('planning.precio.confirmar', {
                importe: eur(pendingMove?.quote.totalCents ?? 0),
              })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* tooltip flotante del arrastre: fechas + noches junto al cursor */}
      <div ref={tipRef} aria-hidden className="lc-drag-tip" style={{ display: 'none' }} />
    </div>
  );
}
