/**
 * PLANO DEL CAMPING ★ (ADR 0021, Frente C · C7) — vista cenital de parcelas y
 * alojamientos con estado en vivo. SVG inline puro, sin librería de mapas
 * (respeta el stack cerrado). Controlado y puro: recibe `layout` + `stateByCode`
 * + selección + callbacks, y no toca queries por dentro.
 *
 * La geometría y el estado por fecha son puros y viven en `@logic-camp/config`
 * (bajo test). Aquí solo va la PIEL: el `<svg>`, el pan/zoom, los colores (mismos
 * `--lc-status-*` que el planning, §C1.5) y la accesibilidad.
 *
 * Pan/zoom vía viewBox (el navegador hace la aritmética de escala): rueda hacia
 * el cursor, arrastre para desplazar, botones +/−/ajustar, teclado. Lo que el
 * original en Svelte no traía y a 300 unidades hace falta.
 */
import type {
  PlanoDecor,
  PlanoLayout,
  PlanoRect,
  PlanoServiceIcon,
  UnitDayState,
} from '@logic-camp/config';
import { Button } from '@logic-camp/ui';
import type { LucideIcon } from 'lucide-react';
import {
  Baby,
  ConciergeBell,
  Maximize,
  Minus,
  Move,
  Plus,
  ShoppingCart,
  ShowerHead,
  Store,
  Utensils,
  Waves,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { t, tDyn } from '../i18n';

type View = { x: number; y: number; w: number; h: number };

/**
 * Glifo por servicio del descriptor (C7, BACKLOG "iconos de servicio en el plano"):
 * el `icon` de `PlanoServiceIcon` estaba tipado desde ADR 0021 pero no se dibujaba.
 * Los componentes lucide renderizan un `<svg>`; anidado dentro del plano es SVG
 * válido y hereda `currentColor`.
 */
const SERVICE_ICONS: Record<PlanoServiceIcon, LucideIcon> = {
  reception: ConciergeBell,
  pool: Waves,
  restaurant: Utensils,
  wc: ShowerHead,
  playground: Baby,
  market: ShoppingCart,
  shop: Store,
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const MOBILE_MAP_QUERY = '(max-width: 767px)';

function useMobileMap(): boolean {
  const [mobile, setMobile] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(MOBILE_MAP_QUERY).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(MOBILE_MAP_QUERY);
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return mobile;
}

/** Estado del día → color de relleno/texto, desde los tokens del DS (nunca hex suelto). */
function unitVisual(state: UnitDayState): {
  fill: string;
  fg: string;
  pattern: 'blocked' | 'inactive' | false;
  free: boolean;
} {
  switch (state.kind) {
    case 'inactive':
      return {
        fill: 'var(--destructive)',
        fg: 'var(--destructive-foreground)',
        pattern: 'inactive',
        free: false,
      };
    case 'blocked':
      return {
        fill: 'var(--lc-status-blocked)',
        fg: 'var(--background)',
        pattern: 'blocked',
        free: false,
      };
    case 'free':
      return { fill: 'var(--muted)', fg: 'var(--muted-foreground)', pattern: false, free: true };
    case 'inhouse':
      // "en casa" (ADR 0022): huésped presente. Token propio, más vivo que confirmed.
      return {
        fill: 'var(--lc-status-inhouse)',
        fg: 'var(--lc-status-inhouse-fg)',
        pattern: false,
        free: false,
      };
    case 'departure':
      return {
        fill: 'var(--lc-status-completed)',
        fg: 'var(--lc-status-completed-fg)',
        pattern: false,
        free: false,
      };
    default: {
      // occupied / arrival: el color lo da el estado de la reserva
      const st = 'status' in state ? state.status : 'confirmed';
      if (st === 'pending')
        return {
          fill: 'var(--lc-status-pending)',
          fg: 'var(--lc-status-pending-fg)',
          pattern: false,
          free: false,
        };
      if (st === 'completed')
        return {
          fill: 'var(--lc-status-completed)',
          fg: 'var(--lc-status-completed-fg)',
          pattern: false,
          free: false,
        };
      return {
        fill: 'var(--lc-status-confirmed)',
        fg: 'var(--lc-status-confirmed-fg)',
        pattern: false,
        free: false,
      };
    }
  }
}

function stateLabel(state: UnitDayState): string {
  switch (state.kind) {
    case 'free':
      return t('plano.estado.libre');
    case 'inactive':
      return t('inv.inactiva');
    case 'blocked':
      return `${t('plano.estado.bloqueada')} · ${tDyn(`bloqueo.${state.reason}`, state.reason)}`;
    case 'arrival':
      return state.turnover ? t('plano.estado.turnover') : t('plano.estado.entra');
    case 'inhouse':
      return t('plano.estado.enCasa');
    case 'departure':
      return t('plano.estado.sale');
    case 'occupied':
      return state.status === 'pending' ? t('plano.estado.ocupadaPend') : t('plano.estado.ocupada');
  }
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export default function CampingMap({
  layout,
  stateByCode,
  selectedCode,
  onSelectUnit,
}: {
  layout: PlanoLayout;
  stateByCode: Map<string, UnitDayState>;
  selectedCode: string | null;
  onSelectUnit: (code: string, opener: SVGGElement) => void;
}) {
  const base = layout.viewBox;
  const svgRef = useRef<SVGSVGElement>(null);
  const mobile = useMobileMap();
  const initialCodeRef = useRef(selectedCode);
  const [touchPan, setTouchPan] = useState(false);
  const [view, setView] = useState<View>({ x: base.minX, y: base.minY, w: base.w, h: base.h });

  const fit = () => setView({ x: base.minX, y: base.minY, w: base.w, h: base.h });

  // zoom limitado: entre 1/8 del ancho base (muy cerca) y 1.5× (todo el recinto)
  const MIN_W = base.w / 8;
  const MAX_W = base.w * 1.5;

  /**
   * En móvil se entra a 8×, centrado en una unidad. En la geometría más pequeña
   * del descriptor (34×22), ese suelo convierte los 7–12px auditados en un
   * blanco físico superior a 44px en 320/375/430. `Ajustar` sigue disponible
   * para recuperar contexto y elegir otra zona.
   */
  const focusUnit = useCallback(
    (code: string | null | undefined) => {
      const rect = layout.rects.find((candidate) => candidate.code === code) ?? layout.rects[0];
      if (!rect) return;
      const w = base.w / 8;
      const h = base.h / 8;
      const x = clamp(rect.x + rect.w / 2 - w / 2, base.minX, base.minX + base.w - w);
      const y = clamp(rect.y + rect.h / 2 - h / 2, base.minY, base.minY + base.h - h);
      setView({ x, y, w, h });
    },
    [base.h, base.minX, base.minY, base.w, layout.rects],
  );

  // Reajustar cuando cambia el camping o el breakpoint. En móvil, la primera
  // unidad visible nace ya a escala de pulgar; escritorio conserva el encaje.
  useEffect(() => {
    setTouchPan(false);
    if (mobile) focusUnit(initialCodeRef.current);
    else fit();
  }, [base.minX, base.minY, base.w, base.h, focusUnit, mobile]);

  // Una selección procedente de URL o teclado siempre queda centrada y legible.
  useEffect(() => {
    if (mobile && selectedCode) focusUnit(selectedCode);
  }, [focusUnit, mobile, selectedCode]);

  /** Escala "meet" real (con letterbox) para convertir px de pantalla a coords de plano. */
  const meet = () => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const scale = Math.min(rect.width / view.w, rect.height / view.h);
    return {
      rect,
      scale,
      offX: (rect.width - view.w * scale) / 2,
      offY: (rect.height - view.h * scale) / 2,
    };
  };

  const zoomAt = (factor: number, svgX: number, svgY: number) => {
    setView((v) => {
      const nw = clamp(v.w / factor, MIN_W, MAX_W);
      const nh = (nw / v.w) * v.h;
      // mantener el punto (svgX,svgY) fijo bajo el cursor
      const rx = (svgX - v.x) / v.w;
      const ry = (svgY - v.y) / v.h;
      return { x: svgX - rx * nw, y: svgY - ry * nh, w: nw, h: nh };
    });
  };

  const onWheel = (e: React.WheelEvent) => {
    const m = meet();
    if (!m) return;
    const svgX = view.x + (e.clientX - m.rect.left - m.offX) / m.scale;
    const svgY = view.y + (e.clientY - m.rect.top - m.offY) / m.scale;
    zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, svgX, svgY);
  };

  // pan por arrastre del fondo (los clicks en unidades no llegan aquí)
  const pan = useRef<{ x: number; y: number; scale: number } | null>(null);
  const onBgPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' && !touchPan) return;
    const m = meet();
    if (!m) return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    pan.current = { x: e.clientX, y: e.clientY, scale: m.scale };
  };
  const onBgPointerMove = (e: React.PointerEvent) => {
    const p = pan.current;
    if (!p) return;
    const dx = (e.clientX - p.x) / p.scale;
    const dy = (e.clientY - p.y) / p.scale;
    p.x = e.clientX;
    p.y = e.clientY;
    setView((v) => ({ ...v, x: v.x - dx, y: v.y - dy }));
  };
  const onBgPointerUp = () => {
    pan.current = null;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = view.w * 0.08;
    if (e.key === 'ArrowLeft') setView((v) => ({ ...v, x: v.x - step }));
    else if (e.key === 'ArrowRight') setView((v) => ({ ...v, x: v.x + step }));
    else if (e.key === 'ArrowUp') setView((v) => ({ ...v, y: v.y - step }));
    else if (e.key === 'ArrowDown') setView((v) => ({ ...v, y: v.y + step }));
    else if (e.key === '+' || e.key === '=') zoomAt(1.2, view.x + view.w / 2, view.y + view.h / 2);
    else if (e.key === '-') zoomAt(1 / 1.2, view.x + view.w / 2, view.y + view.h / 2);
    else return;
    e.preventDefault();
  };

  const centerZoom = (factor: number) => zoomAt(factor, view.x + view.w / 2, view.y + view.h / 2);

  const smooth = !prefersReducedMotion();

  const selectUnit = (code: string, opener: SVGGElement) => {
    opener.focus();
    if (mobile) focusUnit(code);
    onSelectUnit(code, opener);
  };

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden bg-muted/30">
      {/* controles */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        <Button
          variant="outline"
          size="iconSm"
          onClick={() => centerZoom(1.2)}
          aria-label={t('plano.acercar')}
          title={t('plano.acercar')}
          className="size-11 md:size-7"
        >
          <Plus className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="iconSm"
          onClick={() => centerZoom(1 / 1.2)}
          aria-label={t('plano.alejar')}
          title={t('plano.alejar')}
          className="size-11 md:size-7"
        >
          <Minus className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="iconSm"
          onClick={fit}
          aria-label={t('plano.ajustar')}
          title={t('plano.ajustar')}
          className="size-11 md:size-7"
        >
          <Maximize className="size-4" />
        </Button>
      </div>

      <Button
        type="button"
        variant={touchPan ? 'primary' : 'outline'}
        size="sm"
        aria-pressed={touchPan}
        onClick={() => setTouchPan((active) => !active)}
        className="absolute bottom-3 left-3 z-10 h-11 md:hidden"
      >
        <Move className="size-4" />
        {touchPan ? t('plano.moverTerminar') : t('plano.mover')}
      </Button>

      <svg
        ref={svgRef}
        role="application"
        aria-label={t('plano.svgLabel')}
        tabIndex={0}
        className={`h-full w-full outline-none select-none ${
          touchPan ? 'touch-none' : 'touch-pan-y md:touch-none'
        }`}
        viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
        preserveAspectRatio="xMidYMid meet"
        onWheel={onWheel}
        onKeyDown={onKeyDown}
        style={smooth ? { transition: 'none' } : undefined}
      >
        <defs>
          <linearGradient id="plano-water" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--lc-status-info)" stopOpacity="0.12" />
            <stop offset="1" stopColor="var(--lc-status-info)" stopOpacity="0.34" />
          </linearGradient>
          <linearGradient id="plano-green" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--lc-status-confirmed)" stopOpacity="0.2" />
            <stop offset="1" stopColor="var(--lc-status-confirmed)" stopOpacity="0.07" />
          </linearGradient>
          <pattern id="plano-pines" width="22" height="18" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="7" r="2.2" fill="var(--lc-status-confirmed)" opacity="0.32" />
            <circle cx="15" cy="13" r="1.6" fill="var(--lc-status-confirmed)" opacity="0.24" />
          </pattern>
          <pattern id="plano-waves" width="28" height="12" patternUnits="userSpaceOnUse">
            <path
              d="M0 6 Q7 1 14 6 T28 6"
              fill="none"
              stroke="var(--lc-status-info)"
              strokeWidth="1.4"
              opacity="0.28"
            />
          </pattern>
          {/* rayados: bloqueo temporal y baja de servicio indefinida. */}
          <pattern
            id="plano-blocked-hatch"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="8" height="8" fill="var(--lc-status-blocked)" opacity="0.18" />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="8"
              stroke="var(--lc-status-blocked)"
              strokeWidth="3"
              opacity="0.5"
            />
          </pattern>
          <pattern
            id="plano-inactive-hatch"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="8" height="8" fill="var(--destructive)" opacity="0.18" />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="8"
              stroke="var(--destructive)"
              strokeWidth="3"
              opacity="0.5"
            />
          </pattern>
          <filter id="plano-halo" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="3"
              floodColor="var(--ring)"
              floodOpacity="0.9"
            />
          </filter>
        </defs>

        {/* fondo capturador de pan (debajo de todo) */}
        <rect
          x={base.minX - base.w}
          y={base.minY - base.h}
          width={base.w * 3}
          height={base.h * 3}
          fill="transparent"
          onPointerDown={onBgPointerDown}
          onPointerMove={onBgPointerMove}
          onPointerUp={onBgPointerUp}
          onPointerCancel={onBgPointerUp}
          style={{ cursor: pan.current ? 'grabbing' : 'grab' }}
        />

        {/* decorado del recinto */}
        {layout.decor.map((d, i) => (
          <Decor key={i} d={d} />
        ))}

        {/* unidades */}
        {layout.rects.map((r) => (
          <Unit
            key={r.code}
            rect={r}
            state={stateByCode.get(r.code) ?? { kind: 'free' }}
            selected={r.code === selectedCode}
            onSelect={selectUnit}
          />
        ))}
      </svg>
    </div>
  );
}

// ---------- decorado ----------

function Decor({ d }: { d: PlanoDecor }) {
  if (d.kind === 'label')
    return (
      <text
        x={d.x}
        y={d.y}
        className="fill-muted-foreground"
        style={{ fontSize: d.size === 'l' ? 16 : d.size === 's' ? 9 : 12, fontWeight: 600 }}
      >
        {d.text}
      </text>
    );
  const common = { x: d.x, y: d.y, width: d.w, height: d.h };
  if (d.kind === 'enclosure')
    return (
      <rect
        {...common}
        rx={10}
        fill="none"
        stroke="var(--muted-foreground)"
        strokeWidth={1.5}
        strokeDasharray="4 5"
        opacity={0.55}
      />
    );
  if (d.kind === 'road')
    return (
      <g>
        <rect {...common} rx={5} fill="var(--muted)" opacity={0.78} />
        <line
          x1={d.w > d.h ? d.x + 8 : d.x + d.w / 2}
          y1={d.w > d.h ? d.y + d.h / 2 : d.y + 8}
          x2={d.w > d.h ? d.x + d.w - 8 : d.x + d.w / 2}
          y2={d.w > d.h ? d.y + d.h / 2 : d.y + d.h - 8}
          stroke="var(--muted-foreground)"
          strokeWidth={1}
          strokeDasharray="7 8"
          opacity={0.24}
        />
      </g>
    );
  if (d.kind === 'water')
    return (
      <g>
        <rect {...common} rx={10} fill="url(#plano-water)" />
        <rect {...common} rx={10} fill="url(#plano-waves)" />
        {d.label && (
          <text
            x={d.x + 8}
            y={d.y + d.h / 2 + 4}
            className="fill-muted-foreground"
            style={{ fontSize: 11, fontWeight: 600 }}
          >
            {d.label}
          </text>
        )}
      </g>
    );
  if (d.kind === 'green')
    return (
      <g>
        <rect {...common} rx={9} fill="url(#plano-green)" />
        <rect {...common} rx={9} fill="url(#plano-pines)" />
        {d.label && (
          <text
            x={d.x + 6}
            y={d.y + 14}
            className="fill-muted-foreground"
            style={{ fontSize: 10, fontStyle: 'italic' }}
          >
            {d.label}
          </text>
        )}
      </g>
    );
  // service: icono + etiqueta (icono arriba, etiqueta debajo, ambos centrados)
  const Icon = SERVICE_ICONS[d.icon];
  const s = clamp(Math.min(d.w, d.h) * 0.35, 12, 18);
  return (
    <g>
      <rect
        {...common}
        rx={8}
        fill="var(--card)"
        stroke="var(--muted-foreground)"
        strokeWidth={1.25}
        opacity={0.96}
      />
      <Icon
        x={d.x + d.w / 2 - s / 2}
        y={d.y + d.h / 2 - s + 1}
        width={s}
        height={s}
        strokeWidth={1.75}
        aria-hidden
        style={{ color: 'var(--muted-foreground)' }}
      />
      <text
        x={d.x + d.w / 2}
        y={d.y + d.h / 2 + s - 2}
        textAnchor="middle"
        className="fill-foreground"
        style={{ fontSize: 9, fontWeight: 600 }}
      >
        {d.label}
      </text>
    </g>
  );
}

// ---------- unidad ----------

function Unit({
  rect,
  state,
  selected,
  onSelect,
}: {
  rect: PlanoRect;
  state: UnitDayState;
  selected: boolean;
  onSelect: (code: string, opener: SVGGElement) => void;
}) {
  const v = unitVisual(state);
  const showCode = rect.w >= 26;
  const marker = state.kind === 'arrival' || state.kind === 'departure';
  const turnover = (state.kind === 'arrival' && state.turnover) === true;

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${rect.code} · ${stateLabel(state)}`}
      style={{ cursor: 'pointer', outline: 'none' }}
      onClick={(event) => onSelect(rect.code, event.currentTarget)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(rect.code, e.currentTarget);
        }
      }}
      filter={selected ? 'url(#plano-halo)' : undefined}
    >
      <title>{`${rect.code} · ${rect.blockLabel} · ${stateLabel(state)}`}</title>
      <rect
        x={rect.x}
        y={rect.y}
        width={rect.w}
        height={rect.h}
        rx={4}
        fill={v.free ? 'var(--card)' : v.fill}
        stroke={selected ? 'var(--ring)' : v.free ? 'var(--border)' : 'transparent'}
        strokeWidth={selected ? 2 : 1}
      />
      {v.pattern && (
        <rect
          x={rect.x}
          y={rect.y}
          width={rect.w}
          height={rect.h}
          rx={4}
          fill={`url(#plano-${v.pattern}-hatch)`}
        />
      )}
      {/* marca de entra/sale hoy: cuña en la esquina */}
      {marker && (
        <polygon
          points={
            state.kind === 'arrival'
              ? `${rect.x},${rect.y + rect.h} ${rect.x},${rect.y + rect.h - 8} ${rect.x + 8},${rect.y + rect.h}`
              : `${rect.x + rect.w},${rect.y + rect.h} ${rect.x + rect.w - 8},${rect.y + rect.h} ${rect.x + rect.w},${rect.y + rect.h - 8}`
          }
          fill={v.fg}
          opacity={0.85}
        />
      )}
      {turnover && (
        <polygon
          points={`${rect.x + rect.w},${rect.y + rect.h} ${rect.x + rect.w - 8},${rect.y + rect.h} ${rect.x + rect.w},${rect.y + rect.h - 8}`}
          fill={v.fg}
          opacity={0.85}
        />
      )}
      {showCode && (
        <text
          x={rect.x + rect.w / 2}
          y={rect.y + rect.h / 2 + 3}
          textAnchor="middle"
          fill={v.free ? 'var(--muted-foreground)' : v.fg}
          style={{ fontSize: 8.5, fontWeight: 600, pointerEvents: 'none' }}
        >
          {rect.code}
        </text>
      )}
    </g>
  );
}
