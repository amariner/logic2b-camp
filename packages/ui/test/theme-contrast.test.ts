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
  const re = new RegExp(`(?:^|\\n)\\s*${selector.replace('.', '\\.')}\\s*\\{([\\s\\S]*?)\\n\\}`, 'g');
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

/** Ratio de contraste WCAG 2.x entre dos colores oklch (tras resolver vars). */
function contrast(tokenA: string, tokenB: string, theme: Map<string, string>): number {
  const lum = (token: string) => {
    const [r, g, b] = oklchToSrgb(resolve(theme.get(token) ?? token, theme));
    const f = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const [la, lb] = [lum(tokenA), lum(tokenB)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const STATUS = ['confirmed', 'inhouse', 'pending', 'no-show', 'completed', 'info'] as const;

describe.each([
  ['light', light],
  ['dark', dark],
] as const)('mapa de color del planning — %s', (_name, theme) => {
  it.each(STATUS)('texto sobre la barra "%s" ≥ 4.5:1 (AA texto)', (status) => {
    const ratio = contrast(`--lc-status-${status}`, `--lc-status-${status}-fg`, theme);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it.each(STATUS)('la barra "%s" se distingue del fondo ≥ 3:1 (AA no-texto)', (status) => {
    const ratio = contrast(`--lc-status-${status}`, '--background', theme);
    expect(ratio).toBeGreaterThanOrEqual(3);
  });

  it('la línea de "hoy" se distingue del fondo ≥ 3:1', () => {
    expect(contrast('--lc-today', '--background', theme)).toBeGreaterThanOrEqual(3);
  });
});

it('el bloque .dark declara los tokens fijos del mapa (no hereda los light)', () => {
  for (const t of ['--lc-status-inhouse', '--lc-status-pending', '--lc-status-no-show', '--lc-status-completed', '--lc-status-info', '--lc-today']) {
    expect(darkOnly.has(t), `${t} falta en .dark`).toBe(true);
  }
});
