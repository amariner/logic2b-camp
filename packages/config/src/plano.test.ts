import { describe, expect, it } from 'vitest';
import {
  autoPlano,
  computeViewBox,
  expandPlano,
  PLANO_GRID,
  unitStateOn,
  type PlanoBooking,
  type PlanoBlockRange,
  type PlanoDescriptor,
  type PlanoUnit,
  type PlanoUnitType,
} from './plano';

describe('expandPlano', () => {
  const descriptor: PlanoDescriptor = {
    version: 1,
    decor: [{ kind: 'enclosure', x: -10, y: -10, w: 200, h: 200 }],
    blocks: [
      {
        id: 'b1',
        label: 'Bloque',
        cell: 'pitch',
        x: 0,
        y: 0,
        cols: 2,
        units: ['A-01', 'A-02', 'A-03'],
      },
    ],
  };

  it('coloca cada código una vez, en rejilla fila a fila', () => {
    const { rects } = expandPlano(descriptor);
    expect(rects).toHaveLength(3);
    const { w, h } = PLANO_GRID.cell.pitch;
    // fila 0: (0,0) y (w+gap, 0); fila 1: (0, h+gap)
    expect(rects[0]).toMatchObject({ code: 'A-01', x: 0, y: 0 });
    expect(rects[1]).toMatchObject({ code: 'A-02', x: w + PLANO_GRID.gapX, y: 0 });
    expect(rects[2]).toMatchObject({ code: 'A-03', x: 0, y: h + PLANO_GRID.gapY });
  });

  it('conserva blockId/blockLabel en cada rectángulo', () => {
    const { rects } = expandPlano(descriptor);
    expect(rects.every((r) => r.blockId === 'b1' && r.blockLabel === 'Bloque')).toBe(true);
  });

  it('el viewBox envuelve el decorado y las unidades con margen', () => {
    const { viewBox } = expandPlano(descriptor);
    // el decorado (-10..190) domina; margen = pad
    expect(viewBox.minX).toBe(-10 - PLANO_GRID.pad);
    expect(viewBox.minY).toBe(-10 - PLANO_GRID.pad);
    expect(viewBox.w).toBeGreaterThanOrEqual(200 + PLANO_GRID.pad * 2);
  });

  it('marca generated=false', () => {
    expect(expandPlano(descriptor).generated).toBe(false);
  });
});

describe('computeViewBox', () => {
  it('degrada a una caja por defecto sin nada que envolver', () => {
    expect(computeViewBox([], [])).toEqual({ minX: 0, minY: 0, w: 100, h: 100 });
  });
});

describe('autoPlano (degradación)', () => {
  const unitTypes: PlanoUnitType[] = [
    { id: 'ut_bung', kind: 'lodging', nameI18n: { es: 'Bungalow' } },
    { id: 'ut_std', kind: 'pitch', nameI18n: { es: 'Parcela' } },
  ];
  const units: PlanoUnit[] = [
    { id: 'u1', code: 'A-02', unitTypeId: 'ut_std' },
    { id: 'u2', code: 'A-01', unitTypeId: 'ut_std' },
    { id: 'u3', code: 'BG-01', unitTypeId: 'ut_bung' },
  ];

  it('coloca TODAS las unidades', () => {
    const { rects } = autoPlano(units, unitTypes);
    expect(rects.map((r) => r.code).sort()).toEqual(['A-01', 'A-02', 'BG-01']);
  });

  it('parcelas antes que alojamientos (parcela arriba)', () => {
    const { rects } = autoPlano(units, unitTypes);
    const parcelY = rects.find((r) => r.code === 'A-01')!.y;
    const bungY = rects.find((r) => r.code === 'BG-01')!.y;
    expect(parcelY).toBeLessThan(bungY);
  });

  it('ordena las unidades de un tipo por código', () => {
    const { rects } = autoPlano(units, unitTypes);
    const parcels = rects.filter((r) => r.blockId === 'auto_ut_std');
    expect(parcels.map((r) => r.code)).toEqual(['A-01', 'A-02']);
  });

  it('marca generated=true y añade recinto envolvente', () => {
    const layout = autoPlano(units, unitTypes);
    expect(layout.generated).toBe(true);
    expect(layout.decor.some((d) => d.kind === 'enclosure')).toBe(true);
  });

  it('es determinista', () => {
    expect(autoPlano(units, unitTypes)).toEqual(autoPlano(units, unitTypes));
  });
});

describe('unitStateOn', () => {
  const b = (over: Partial<PlanoBooking>): PlanoBooking => ({
    id: 'bkg',
    status: 'confirmed',
    unitId: 'u1',
    dateFrom: '2026-08-10',
    dateTo: '2026-08-14',
    ...over,
  });

  it('libre cuando no hay nada', () => {
    expect(unitStateOn('2026-08-10', 'u1', [], [])).toEqual({ kind: 'free' });
  });

  it('fuera de servicio cuando la unidad está inactiva y no tiene una reserva previa', () => {
    expect(unitStateOn('2026-08-10', 'u1', [], [], 'inactive')).toEqual({ kind: 'inactive' });
  });

  it('conserva visible una reserva existente aunque la unidad pase a inactiva', () => {
    const s = unitStateOn('2026-08-12', 'u1', [b({})], [], 'inactive');
    expect(s).toMatchObject({ kind: 'occupied', bookingId: 'bkg' });
  });

  it('ocupada en una noche intermedia', () => {
    const s = unitStateOn('2026-08-12', 'u1', [b({})], []);
    expect(s).toMatchObject({ kind: 'occupied', bookingId: 'bkg', status: 'confirmed' });
  });

  it('entra hoy el día de llegada (from inclusive)', () => {
    const s = unitStateOn('2026-08-10', 'u1', [b({})], []);
    expect(s.kind).toBe('arrival');
  });

  it('libre el día de salida si nadie más entra (to exclusive)', () => {
    // una sola reserva que sale el 14 → esa noche la unidad está libre, pero
    // marcamos "departure" para que recepción sepa que hay que limpiarla
    const s = unitStateOn('2026-08-14', 'u1', [b({})], []);
    expect(s).toMatchObject({ kind: 'departure', bookingId: 'bkg' });
  });

  it('turnover: una sale y otra entra el mismo día', () => {
    const sale = b({ id: 'sale', dateFrom: '2026-08-08', dateTo: '2026-08-14' });
    const entra = b({ id: 'entra', dateFrom: '2026-08-14', dateTo: '2026-08-20' });
    const s = unitStateOn('2026-08-14', 'u1', [sale, entra], []);
    expect(s).toMatchObject({ kind: 'arrival', bookingId: 'entra', turnover: true });
  });

  it('una cancelada NO ocupa', () => {
    const s = unitStateOn('2026-08-12', 'u1', [b({ status: 'cancelled' })], []);
    expect(s).toEqual({ kind: 'free' });
  });

  it('en casa (ADR 0022): check-in hecho, check-out no → inhouse en noche intermedia', () => {
    const s = unitStateOn('2026-08-12', 'u1', [b({ checkedInAt: '2026-08-10T10:00:00Z' })], []);
    expect(s).toMatchObject({ kind: 'inhouse', bookingId: 'bkg', status: 'confirmed' });
  });

  it('en casa manda sobre "entra hoy": si ya hizo check-in el día de llegada, está dentro', () => {
    const s = unitStateOn('2026-08-10', 'u1', [b({ checkedInAt: '2026-08-10T10:00:00Z' })], []);
    expect(s.kind).toBe('inhouse');
  });

  it('tras check-out ya no está en casa (checkedOutAt !=null) → ocupada normal', () => {
    const s = unitStateOn(
      '2026-08-12',
      'u1',
      [b({ checkedInAt: '2026-08-10T10:00:00Z', checkedOutAt: '2026-08-12T09:00:00Z' })],
      [],
    );
    expect(s.kind).toBe('occupied');
  });

  it('bloqueada por avería', () => {
    const blk: PlanoBlockRange = {
      unitId: 'u1',
      dateFrom: '2026-08-01',
      dateTo: '2026-08-20',
      reason: 'maintenance',
    };
    expect(unitStateOn('2026-08-12', 'u1', [], [blk])).toEqual({
      kind: 'blocked',
      reason: 'maintenance',
    });
  });

  it('la reserva gana al bloqueo (no debería coexistir, pero el orden es explícito)', () => {
    const blk: PlanoBlockRange = {
      unitId: 'u1',
      dateFrom: '2026-08-01',
      dateTo: '2026-08-20',
      reason: 'maintenance',
    };
    const s = unitStateOn('2026-08-12', 'u1', [b({})], [blk]);
    expect(s.kind).toBe('occupied');
  });
});
