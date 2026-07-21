/**
 * Plano declarativo de Camping Cala Sereno (ficticio) — la GEOMETRÍA del tenant.
 *
 * Fuente de verdad de dónde está cada parcela y alojamiento (ADR 0021 §1). El
 * seed lo materializa en `modules.plano` y `GET /api/admin/map` lo sirve al
 * dashboard, que lo expande con `expandPlano` (packages/config).
 *
 * Es DATO, no dibujo: se declara "bloque de 24 parcelas en 6 columnas desde
 * aquí" y el decorado del recinto (mar, piscina, recepción, pinada) como formas.
 * Alta de un camping nuevo = escribir un fichero como éste, no 300 rectángulos.
 *
 * Norte = arriba: el mar al norte, la entrada y recepción al sur. Las unidades
 * "vista mar" (C premium, BM bungalow) pegadas a la playa; la pinada al este.
 */
import type { PlanoDescriptor } from '@logic-camp/config';

/** Códigos de un tipo: range('A', 24) → ['A-01', … 'A-24'] (mismo formato que el seed). */
const range = (prefix: string, n: number): string[] =>
  Array.from({ length: n }, (_, i) => `${prefix}-${String(i + 1).padStart(2, '0')}`);

export function buildDemoPlano(): PlanoDescriptor {
  return {
    version: 1,
    decor: [
      // --- el mar y la playa al norte ---
      { kind: 'water', x: 0, y: 0, w: 900, h: 60, label: 'Mar Mediterráneo' },
      { kind: 'green', x: 0, y: 60, w: 900, h: 26 }, // duna / playa

      // --- recinto ---
      { kind: 'enclosure', x: 16, y: 96, w: 868, h: 560 },

      // --- calles ---
      { kind: 'road', x: 16, y: 196, w: 868, h: 16 }, // vía principal E-O bajo la fila mar
      { kind: 'road', x: 258, y: 212, w: 16, h: 420 }, // espina N-S izquierda
      { kind: 'road', x: 528, y: 212, w: 16, h: 420 }, // espina N-S derecha
      { kind: 'road', x: 420, y: 632, w: 20, h: 24 }, // entrada al sur

      // --- zonas verdes (pino carrasco) ---
      { kind: 'green', x: 744, y: 220, w: 128, h: 300, label: 'Pinada' },
      { kind: 'green', x: 560, y: 372, w: 176, h: 60 }, // bajo el glamping

      // --- servicios ---
      { kind: 'service', x: 300, y: 236, w: 150, h: 92, label: 'Piscina', icon: 'pool' },
      { kind: 'service', x: 300, y: 344, w: 150, h: 56, label: 'Restaurante', icon: 'restaurant' },
      { kind: 'service', x: 300, y: 416, w: 74, h: 56, label: 'Juegos', icon: 'playground' },
      { kind: 'service', x: 388, y: 416, w: 62, h: 40, label: 'Aseos', icon: 'wc' },
      { kind: 'service', x: 300, y: 560, w: 122, h: 60, label: 'Recepción', icon: 'reception' },
      { kind: 'service', x: 452, y: 560, w: 76, h: 60, label: 'Súper', icon: 'shop' },
      { kind: 'service', x: 560, y: 452, w: 62, h: 40, label: 'Aseos', icon: 'wc' },

      // --- etiquetas de zona ---
      { kind: 'label', x: 40, y: 118, text: 'Vista mar', size: 's' },
    ],
    blocks: [
      // Fila del mar: premium (C) y bungalows vista mar (BM), pegados a la playa
      {
        id: 'z_prem',
        label: 'Parcela Premium Mar',
        cell: 'pitch',
        x: 40,
        y: 128,
        cols: 10,
        units: range('C', 10),
      },
      {
        id: 'z_bung6',
        label: 'Bungalow 6 pax Vista Mar',
        cell: 'lodging',
        x: 560,
        y: 128,
        cols: 3,
        units: range('BM', 6),
      },

      // Parcelas estándar (A) — el gran bloque a la izquierda
      {
        id: 'z_std',
        label: 'Parcela Estándar',
        cell: 'pitch',
        x: 40,
        y: 236,
        cols: 6,
        units: range('A', 24),
      },
      // Parcelas confort (B) — debajo de las estándar
      {
        id: 'z_conf',
        label: 'Parcela Confort',
        cell: 'pitch',
        x: 40,
        y: 396,
        cols: 6,
        units: range('B', 18),
      },
      // Autocaravanas (D) — fila hacia la entrada, sobre la banda de recepción
      {
        id: 'z_moto',
        label: 'Parcela Autocaravana',
        cell: 'motorhome',
        x: 40,
        y: 505,
        cols: 8,
        units: range('D', 8),
      },

      // Alojamientos a la derecha
      {
        id: 'z_bung4',
        label: 'Bungalow 4 pax',
        cell: 'lodging',
        x: 560,
        y: 236,
        cols: 4,
        units: range('BG', 8),
      },
      {
        id: 'z_mobil',
        label: 'Mobil-home 5 pax',
        cell: 'lodging',
        x: 560,
        y: 320,
        cols: 4,
        units: range('MH', 4),
      },
      {
        id: 'z_glamp',
        label: 'Tienda Glamping',
        cell: 'glamping',
        x: 560,
        y: 380,
        cols: 5,
        units: range('GL', 5),
      },
    ],
  };
}
