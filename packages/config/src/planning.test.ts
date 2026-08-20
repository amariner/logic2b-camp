import { describe, expect, it } from 'vitest';
import {
  addDaysIso,
  barGeometry,
  daysBetweenIso,
  seasonBands,
  snapDays,
  todayOffset,
  weekendBackground,
  type SeasonSpan,
} from './planning';

const CW = 40; // ancho de celda de los tests

describe('fechas', () => {
  it('addDaysIso y daysBetweenIso son inversas y cruzan meses', () => {
    expect(addDaysIso('2026-07-30', 3)).toBe('2026-08-02');
    expect(daysBetweenIso('2026-07-30', '2026-08-02')).toBe(3);
    expect(daysBetweenIso('2026-08-02', '2026-07-30')).toBe(-3);
  });

  it('snapDays redondea al día más cercano', () => {
    expect(snapDays(59, CW)).toBe(1);
    expect(snapDays(61, CW)).toBe(2);
    expect(snapDays(-59, CW)).toBe(-1);
  });
});

describe('barGeometry', () => {
  const view = { from: '2026-08-01', days: 31 };

  it('barra entera dentro: sin recortes', () => {
    const g = barGeometry(view.from, view.days, CW, '2026-08-03', '2026-08-06')!;
    expect(g).toMatchObject({ left: 2.5 * CW, clipStart: false, clipEnd: false });
    expect(g.width).toBe(3 * CW - 2);
  });

  it('empieza antes del borde: recortada y marcada clipStart', () => {
    const g = barGeometry(view.from, view.days, CW, '2026-07-28', '2026-08-04')!;
    expect(g.left).toBe(0);
    expect(g.clipStart).toBe(true);
    expect(g.clipEnd).toBe(false);
  });

  it('acaba después del borde: recortada y marcada clipEnd', () => {
    const g = barGeometry(view.from, view.days, CW, '2026-08-29', '2026-09-05')!;
    expect(g.clipEnd).toBe(true);
    expect(g.left + g.width + 2).toBe(31 * CW);
  });

  it('fuera del rango visible → null', () => {
    expect(barGeometry(view.from, view.days, CW, '2026-09-10', '2026-09-12')).toBeNull();
    expect(barGeometry(view.from, view.days, CW, '2026-07-01', '2026-07-31')).toBeNull();
  });

  it('muestra media celda de salida al inicio de la ventana', () => {
    expect(barGeometry(view.from, view.days, CW, '2026-07-28', '2026-08-01')).toMatchObject({
      left: 0,
      width: 0.5 * CW - 2,
      clipStart: true,
      clipEnd: false,
    });
  });
});

describe('todayOffset', () => {
  it('dentro del rango: píxel del borde izquierdo de su celda', () => {
    expect(todayOffset('2026-08-01', 31, CW, '2026-08-01')).toBe(0);
    expect(todayOffset('2026-08-01', 31, CW, '2026-08-15')).toBe(14 * CW);
  });
  it('fuera del rango → null (la línea no se pinta)', () => {
    expect(todayOffset('2026-08-01', 31, CW, '2026-07-31')).toBeNull();
    expect(todayOffset('2026-08-01', 31, CW, '2026-09-01')).toBeNull();
  });
});

describe('weekendBackground', () => {
  it('lunes: banda sáb+dom contigua en las celdas 5–6', () => {
    // 2026-07-20 es lunes
    const bg = weekendBackground('2026-07-20', CW, 'red');
    expect(bg).toContain(`transparent ${5 * CW}px, red ${5 * CW}px, red ${7 * CW}px`);
  });

  it('domingo: la banda se parte (dom al inicio, sáb al final del período)', () => {
    // 2026-07-26 es domingo
    const bg = weekendBackground('2026-07-26', CW, 'red');
    expect(bg).toContain(`red 0px, red ${CW}px`);
    expect(bg).toContain(`red ${6 * CW}px, red ${7 * CW}px`);
  });

  it('sábado: banda al principio del período', () => {
    // 2026-07-25 es sábado
    const bg = weekendBackground('2026-07-25', CW, 'red');
    expect(bg).toContain(`transparent 0px, red 0px, red ${2 * CW}px`);
  });
});

describe('seasonBands', () => {
  const seasons: SeasonSpan[] = [
    { id: 's_base', name: 'Apertura', dateFrom: '2026-03-15', dateTo: '2026-11-01', priority: 0 },
    { id: 's_alta', name: 'Alta', dateFrom: '2026-07-01', dateTo: '2026-08-31', priority: 20 },
  ];

  it('gana la prioridad por día y las bandas contiguas se funden', () => {
    // vista 2026-06-28 → 7 días: 3 de Apertura + 4 de Alta
    const bands = seasonBands(seasons, '2026-06-28', 7);
    expect(bands).toHaveLength(2);
    expect(bands[0]).toMatchObject({ start: 0, days: 3, name: 'Apertura' });
    expect(bands[1]).toMatchObject({ start: 3, days: 4, name: 'Alta' });
  });

  it('fuera de toda temporada = hueco, no una banda', () => {
    // vista que cruza el cierre del 2026-11-01
    const bands = seasonBands(seasons, '2026-10-30', 5);
    expect(bands).toHaveLength(1);
    expect(bands[0]).toMatchObject({ start: 0, days: 2, name: 'Apertura' });
  });

  it('el tono es estable por temporada (orden temporal, cíclico 0–3)', () => {
    const a = seasonBands(seasons, '2026-06-28', 7);
    const b = seasonBands(seasons, '2026-08-25', 10);
    const toneAlta = a.find((x) => x.name === 'Alta')!.tone;
    expect(b.find((x) => x.name === 'Alta')!.tone).toBe(toneAlta);
    expect(a.find((x) => x.name === 'Apertura')!.tone).not.toBe(toneAlta);
  });
});
