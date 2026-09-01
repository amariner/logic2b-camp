/**
 * Contrato AA del mapa de color del planning (ADR 0023, C1.5): lee los tokens
 * REALES de theme.css (light y dark), resuelve los var() internos, convierte
 * oklch→sRGB y comprueba WCAG. Texto sobre barra ≥ 4.5:1 (AA texto normal);
 * barra/línea sobre el fondo de página ≥ 3:1 (AA no-texto). Si alguien cambia
 * un token a un valor sin contraste, esta suite falla — el mapa dejó de poder
 * romperse en silencio.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// sin comentarios: un `--token:` citado dentro de un comentario rompería el parseo
const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../src/theme.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

/** Extrae las declaraciones `--x: valor;` de un bloque `selector { … }`. */
function tokensOf(selector: string): Map<string, string> {
  const map = new Map<string, string>();
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(?:^|\\n)\\s*${escapedSelector}\\s*\\{([\\s\\S]*?)\\n\\}`, 'g');
  for (const block of css.matchAll(re)) {
    for (const m of block[1]!.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      map.set(m[1]!, m[2]!.trim());
    }
  }
  return map;
}

const light = tokensOf(':root');
const darkOnly = tokensOf('.dark');
const dark = new Map([...light, ...darkOnly]); // .dark hereda :root y pisa lo suyo
const logic2bOnly = tokensOf('.theme-logic2b');
const logic2bDarkOnly = tokensOf('.dark.theme-logic2b');
const logic2bLight = new Map([...light, ...logic2bOnly]);
const logic2bDark = new Map([...light, ...darkOnly, ...logic2bOnly, ...logic2bDarkOnly]);

/* Snapshot contractual de los tokens estructurales observados en la hoja
 * pública de ui.logic2b.com el 2026-09-01. No hace red en CI: fija la base que
 * se auditó y obliga a documentar cualquier divergencia futura. */
const UI_LOGIC2B_LIGHT = {
  '--radius': '0.625rem',
  '--background': 'oklch(100% 0 0)',
  '--foreground': 'oklch(14.5% 0 0)',
  '--primary': 'oklch(20.5% 0 0)',
  '--primary-foreground': 'oklch(98.5% 0 0)',
  '--secondary': 'oklch(97% 0 0)',
  '--muted': 'oklch(97% 0 0)',
  '--accent': 'oklch(97% 0 0)',
  '--border': 'oklch(92.2% 0 0)',
  '--input': 'oklch(92.2% 0 0)',
  '--ring': 'oklch(70.8% 0 0)',
  '--chart-1': 'oklch(64.6% 0.222 41.116)',
  '--chart-2': 'oklch(60% 0.118 184.704)',
  '--chart-3': 'oklch(39.8% 0.07 227.392)',
  '--chart-4': 'oklch(82.8% 0.189 84.429)',
  '--chart-5': 'oklch(76.9% 0.188 70.08)',
  '--sidebar': 'oklch(98.5% 0 0)',
  '--sidebar-primary': 'oklch(20.5% 0 0)',
  '--logo-2b': '#2a2c30',
  '--logo-ui': '#6b7178',
} as const;

const UI_LOGIC2B_DARK = {
  '--background': 'oklch(14.5% 0 0)',
  '--foreground': 'oklch(98.5% 0 0)',
  '--primary': 'oklch(92.2% 0 0)',
  '--primary-foreground': 'oklch(20.5% 0 0)',
  '--secondary': 'oklch(26.9% 0 0)',
  '--muted': 'oklch(26.9% 0 0)',
  '--accent': 'oklch(26.9% 0 0)',
  '--border': 'oklch(100% 0 0 / 0.1)',
  '--input': 'oklch(100% 0 0 / 0.15)',
  '--ring': 'oklch(55.6% 0 0)',
  '--chart-1': 'oklch(48.8% 0.243 264.376)',
  '--chart-2': 'oklch(69.6% 0.17 162.48)',
  '--chart-3': 'oklch(76.9% 0.188 70.08)',
  '--chart-4': 'oklch(62.7% 0.265 303.9)',
  '--chart-5': 'oklch(64.5% 0.246 16.439)',
  '--sidebar': 'oklch(20.5% 0 0)',
  '--sidebar-primary': 'oklch(92.2% 0 0)',
  '--logo-2b': '#e6e8ea',
  '--logo-ui': '#9099a1',
} as const;

describe('base estructural de ui.logic2b.com — snapshot 2026-09-01', () => {
  it.each(Object.entries(UI_LOGIC2B_LIGHT))('%s coincide en light', (token, value) => {
    expect(light.get(token)).toBe(value);
  });

  it.each(Object.entries(UI_LOGIC2B_DARK))('%s coincide en dark', (token, value) => {
    expect(darkOnly.get(token)).toBe(value);
  });
});

/** Resuelve var(--x) contra el mapa del tema (recursivo). */
function resolve(value: string, theme: Map<string, string>): string {
  const m = value.match(/^var\((--[\w-]+)\)$/);
  if (!m) return value;
  const next = theme.get(m[1]!);
  if (!next) throw new Error(`token sin definir: ${m[1]}`);
  return resolve(next, theme);
}

/** oklch(L C H [/ a]) → sRGB gamma [0..1]. L admite % o 0–1. */
function oklchToSrgb(raw: string): [number, number, number] {
  const m = raw.match(/oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)/);
  if (!m) throw new Error(`no es oklch: ${raw}`);
  const L = m[1]!.endsWith('%') ? Number.parseFloat(m[1]!) / 100 : Number.parseFloat(m[1]!);
  const C = Number.parseFloat(m[2]!);
  const H = (Number.parseFloat(m[3]!) * Math.PI) / 180;
  const a = C * Math.cos(H);
  const b = C * Math.sin(H);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const mm = m_ ** 3;
  const s = s_ ** 3;

  const lin: [number, number, number] = [
    4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s,
  ];
  return lin.map((c) => {
    const v = Math.min(1, Math.max(0, c));
    return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
  }) as [number, number, number];
}

/** Hex de seis dígitos u oklch → sRGB gamma [0..1]. */
function colorToSrgb(raw: string): [number, number, number] {
  const hex = raw.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (hex) {
    return [hex[1], hex[2], hex[3]].map((part) => Number.parseInt(part!, 16) / 255) as [
      number,
      number,
      number,
    ];
  }
  return oklchToSrgb(raw);
}

function luminance([r, g, b]: [number, number, number]): number {
  const f = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function ratio(colorA: [number, number, number], colorB: [number, number, number]): number {
  const [la, lb] = [luminance(colorA), luminance(colorB)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function resolvedColor(token: string, theme: Map<string, string>): [number, number, number] {
  return colorToSrgb(resolve(theme.get(token) ?? token, theme));
}

/** Ratio de contraste WCAG 2.x entre dos colores (tras resolver vars). */
function contrast(tokenA: string, tokenB: string, theme: Map<string, string>): number {
  return ratio(resolvedColor(tokenA, theme), resolvedColor(tokenB, theme));
}

/** Contraste de un color semitransparente tras componerlo sobre su superficie. */
function compositedContrast(
  foreground: string,
  background: string,
  alpha: number,
  theme: Map<string, string>,
): number {
  const fg = resolvedColor(foreground, theme);
  const bg = resolvedColor(background, theme);
  const composed = fg.map((channel, index) => channel * alpha + bg[index]! * (1 - alpha)) as [
    number,
    number,
    number,
  ];
  return ratio(composed, bg);
}

const SOLID_STATES = [
  'confirmed',
  'inhouse',
  'pending',
  'no-show',
  'completed',
  'info',
  'inactive',
] as const;

describe.each([
  ['light', light],
  ['dark', dark],
] as const)('mapa de color del planning — %s', (_name, theme) => {
  it.each(SOLID_STATES)('texto sobre el estado "%s" ≥ 4.5:1 (AA texto)', (status) => {
    const ratio = contrast(`--lc-status-${status}`, `--lc-status-${status}-fg`, theme);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it.each(SOLID_STATES)('el estado "%s" se distingue del fondo ≥ 3:1 (AA no-texto)', (status) => {
    const ratio = contrast(`--lc-status-${status}`, '--background', theme);
    expect(ratio).toBeGreaterThanOrEqual(3);
  });

  it('la línea de "hoy" se distingue del fondo ≥ 3:1', () => {
    expect(contrast('--lc-today', '--background', theme)).toBeGreaterThanOrEqual(3);
  });
});

const SEMANTIC_PAIRS = [
  ['--foreground', '--background'],
  ['--card-foreground', '--card'],
  ['--popover-foreground', '--popover'],
  ['--primary-foreground', '--primary'],
  ['--secondary-foreground', '--secondary'],
  ['--muted-foreground', '--muted'],
  ['--accent-foreground', '--accent'],
  ['--destructive-foreground', '--destructive'],
  ['--sidebar-foreground', '--sidebar'],
  ['--sidebar-primary-foreground', '--sidebar-primary'],
  ['--sidebar-accent-foreground', '--sidebar-accent'],
] as const;

describe.each([
  ['light', logic2bLight],
  ['dark', logic2bDark],
] as const)('variante Logic2B — %s', (_name, theme) => {
  it.each(SEMANTIC_PAIRS)('%s sobre %s ≥ 4.5:1 (AA texto)', (foreground, background) => {
    expect(contrast(foreground, background, theme)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(['--background', '--card', '--popover', '--muted', '--accent'])(
    'el enlace se distingue de %s ≥ 4.5:1',
    (surface) => {
      expect(contrast('--link', surface, theme)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('el anillo de foco se distingue del fondo ≥ 3:1', () => {
    expect(contrast('--ring', '--background', theme)).toBeGreaterThanOrEqual(3);
  });

  it.each([
    '--background',
    '--card',
    '--popover',
    '--secondary',
    '--muted',
    '--accent',
    '--sidebar-accent',
  ])('el anillo real al 60 % se distingue de %s ≥ 3:1', (surface) => {
    expect(compositedContrast('--ring', surface, 0.6, theme)).toBeGreaterThanOrEqual(3);
  });

  it.each(['--background', '--card', '--popover', '--secondary', '--muted', '--accent'])(
    'el límite de los controles se distingue de %s ≥ 3:1',
    (surface) => {
      expect(contrast('--input', surface, theme)).toBeGreaterThanOrEqual(3);
    },
  );

  it.each(['--background', '--card', '--popover'])(
    'la acción primaria se distingue de %s ≥ 3:1',
    (surface) => {
      expect(contrast('--primary', surface, theme)).toBeGreaterThanOrEqual(3);
    },
  );

  it('el chip de unidad bloqueada conserva texto AA', () => {
    expect(contrast('--background', '--lc-status-blocked', theme)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(SOLID_STATES)(
    'el texto del estado operativo "%s" conserva AA bajo la variante',
    (status) => {
      expect(
        contrast(`--lc-status-${status}-fg`, `--lc-status-${status}`, theme),
      ).toBeGreaterThanOrEqual(4.5);
    },
  );

  it.each(SOLID_STATES)(
    'el estado operativo "%s" se distingue del fondo de marca ≥ 3:1',
    (status) => {
      expect(contrast(`--lc-status-${status}`, '--background', theme)).toBeGreaterThanOrEqual(3);
    },
  );
});

describe('variante Logic2B — contraste cruzado del tema claro', () => {
  it.each(['--background', '--card', '--popover', '--muted', '--accent'])(
    'el texto secundario se lee sobre %s ≥ 4.5:1',
    (surface) => {
      expect(contrast('--muted-foreground', surface, logic2bLight)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('el texto secundario de la navegación se lee sobre la sidebar', () => {
    expect(contrast('--muted-foreground', '--sidebar', logic2bLight)).toBeGreaterThanOrEqual(4.5);
  });
});

it('la variante Logic2B remapea todas las familias semánticas y de sidebar', () => {
  for (const token of [
    '--background',
    '--foreground',
    '--card',
    '--card-foreground',
    '--popover',
    '--popover-foreground',
    '--primary',
    '--primary-foreground',
    '--secondary',
    '--secondary-foreground',
    '--muted',
    '--muted-foreground',
    '--accent',
    '--accent-foreground',
    '--destructive',
    '--destructive-foreground',
    '--border',
    '--input',
    '--ring',
    '--link',
    '--sidebar',
    '--sidebar-foreground',
    '--sidebar-primary',
    '--sidebar-primary-foreground',
    '--sidebar-accent',
    '--sidebar-accent-foreground',
    '--sidebar-border',
    '--sidebar-ring',
  ]) {
    expect(logic2bOnly.has(token), `${token} falta en .theme-logic2b`).toBe(true);
    expect(logic2bDarkOnly.has(token), `${token} falta en .dark.theme-logic2b`).toBe(true);
  }
});

it('el bloque .dark declara los tokens fijos del mapa (no hereda los light)', () => {
  for (const t of [
    '--lc-status-inhouse',
    '--lc-status-pending',
    '--lc-status-no-show',
    '--lc-status-completed',
    '--lc-status-info',
    '--lc-today',
  ]) {
    expect(darkOnly.has(t), `${t} falta en .dark`).toBe(true);
  }
});
