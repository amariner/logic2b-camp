/**
 * LOS 7 CASOS QUE ROMPEN A LOS PRODUCTOS GENÉRICOS (§9 Fase 2).
 * Escritos ANTES que la implementación. Si esto está verde, el motor vale.
 */
import { describe, expect, it } from 'vitest';
import { searchAvailability } from './availability';
import { calculateCancellationRefund } from './cancellation';
import { quote } from './pricing';
import { calculateTouristTax, VALENCIA_TAX } from './touristTax';
import { validateStay } from './validate';
import {
  bungalowType,
  mkBooking,
  mkUnits,
  noBlocks,
  pitchNoElec,
  pitchType,
  plans,
  seasons,
} from './fixtures.test-helper';

const occ2 = { adults: 2, childrenAges: [], pets: 0, vehicles: 1 };

describe('CASO 1 — estancia que cruza dos temporadas', () => {
  const q = quote({
    unitType: bungalowType,
    dateFrom: '2026-06-27',
    dateTo: '2026-07-04',
    occupancy: { adults: 4, childrenAges: [], pets: 0, vehicles: 1 },
    seasons,
    ratePlans: plans,
    currency: 'EUR',
  });

  it('el precio se calcula por tramos: media (4 noches) + alta (3 noches)', () => {
    const baseLines = q.breakdown.lines.filter((l) => l.concept === 'price.base');
    expect(baseLines).toHaveLength(2);
    expect(baseLines[0]!.detail.season).toBe('Media');
    expect(baseLines[0]!.detail.nights).toBe(4);
    expect(baseLines[0]!.amountCents).toBe(10500 * 4);
    expect(baseLines[1]!.detail.season).toBe('Alta');
    expect(baseLines[1]!.detail.nights).toBe(3);
    expect(baseLines[1]!.amountCents).toBe(15500 * 3);
    expect(q.breakdown.totalCents).toBe(10500 * 4 + 15500 * 3);
  });

  it('la estancia mínima aplicable es la MÁS restrictiva de las temporadas tocadas', () => {
    // toca alta (minStay 7): 7 noches pasa, 5 noches no
    const v = validateStay({
      unitType: bungalowType,
      dateFrom: '2026-06-29',
      dateTo: '2026-07-04', // 5 noches cruzando a alta
      occupancy: occ2,
      seasons,
      ratePlans: plans,
    });
    expect(v.valid).toBe(false);
    if (!v.valid) {
      expect(v.issues.some((i) => i.code === 'stay.min_stay' && i.params?.minStay === 7)).toBe(true);
    }
  });
});

describe('CASO 2 — 7 noches con día de entrada fijo sábado', () => {
  it('entrar en sábado (2026-07-04) es válido', () => {
    const v = validateStay({
      unitType: bungalowType,
      dateFrom: '2026-07-04',
      dateTo: '2026-07-11',
      occupancy: occ2,
      seasons,
      ratePlans: plans,
    });
    expect(v.valid).toBe(true);
  });

  it('entrar en miércoles se rechaza con el día permitido en los params', () => {
    const v = validateStay({
      unitType: bungalowType,
      dateFrom: '2026-07-08',
      dateTo: '2026-07-15',
      occupancy: occ2,
      seasons,
      ratePlans: plans,
    });
    expect(v.valid).toBe(false);
    if (!v.valid) {
      const issue = v.issues.find((i) => i.code === 'stay.arrival_day');
      expect(issue).toBeDefined();
      expect(String(issue!.params?.allowedDays)).toContain('6');
    }
  });
});

describe('CASO 3 — 6 unidades, 6 reservas solapadas parciales: hay hueco reasignando', () => {
  // 6 unidades; 6 reservas de 5 noches escalonadas 1 día: cada unidad tiene
  // reserva y ninguna está libre todo el rango, pero cada noche queda ≥1 hueco
  // → solo se puede vender reasignando. Los productos genéricos dicen "completo".
  const units = mkUnits('ut_std', 6);
  const bookings = [
    mkBooking('b1', 'ut_std', 'ut_std_1', '2026-07-01', '2026-07-06'),
    mkBooking('b2', 'ut_std', 'ut_std_2', '2026-07-02', '2026-07-07'),
    mkBooking('b3', 'ut_std', 'ut_std_3', '2026-07-03', '2026-07-08'),
    mkBooking('b4', 'ut_std', 'ut_std_4', '2026-07-04', '2026-07-09'),
    mkBooking('b5', 'ut_std', 'ut_std_5', '2026-07-05', '2026-07-10'),
    mkBooking('b6', 'ut_std', 'ut_std_6', '2026-07-06', '2026-07-11'),
  ];

  it('cada noche hay ≤5 ocupadas → el tipo sigue disponible (reasignación implícita)', () => {
    const res = searchAvailability({
      dateFrom: '2026-07-01',
      dateTo: '2026-07-11',
      unitTypes: [pitchType],
      units,
      bookings,
      blocks: noBlocks,
      seasons,
    });
    expect(res[0]!.status).toBe('available');
    expect(res[0]!.availableUnits).toBeGreaterThanOrEqual(1);
  });

  it('con una 7ª reserva que satura una noche, deja de estar disponible', () => {
    const res = searchAvailability({
      dateFrom: '2026-07-01',
      dateTo: '2026-07-11',
      unitTypes: [pitchType],
      units,
      bookings: [...bookings, mkBooking('b7', 'ut_std', null, '2026-07-04', '2026-07-08')],
      blocks: noBlocks,
      seasons,
    });
    expect(res[0]!.status).toBe('unavailable');
  });
});

describe('CASO 4 — niño de 3 años: exento de tasa, cuenta para capacidad', () => {
  it('no paga tasa turística', () => {
    const tax = calculateTouristTax(
      { adults: 2, childrenAges: [3, 17], pets: 0, vehicles: 1 },
      7,
      VALENCIA_TAX,
    );
    // 2 adultos + 1 niño de 17 (≥16) pagan; el de 3 no
    expect(tax).toBe(3 * VALENCIA_TAX.perPersonNightCents * 7);
  });

  it('pero sí cuenta para la capacidad máxima', () => {
    const v = validateStay({
      unitType: pitchNoElec, // capacidad 4
      dateFrom: '2026-05-01',
      dateTo: '2026-05-04',
      occupancy: { adults: 3, childrenAges: [3, 6], pets: 0, vehicles: 1 }, // 5 personas
      seasons,
      ratePlans: plans,
    });
    expect(v.valid).toBe(false);
    if (!v.valid) expect(v.issues.some((i) => i.code === 'stay.capacity')).toBe(true);
  });
});

describe('CASO 5 — parcela sin electricidad + caravana que la necesita', () => {
  it('bloquea con mensaje útil (código i18n + contexto), no con un genérico', () => {
    const v = validateStay({
      unitType: pitchNoElec,
      dateFrom: '2026-05-01',
      dateTo: '2026-05-04',
      occupancy: occ2,
      seasons,
      ratePlans: plans,
      needsElectricity: true,
    });
    expect(v.valid).toBe(false);
    if (!v.valid) {
      const issue = v.issues.find((i) => i.code === 'stay.no_electricity');
      expect(issue).toBeDefined();
    }
  });

  it('la misma parcela sin necesidad de electricidad es válida', () => {
    const v = validateStay({
      unitType: pitchNoElec,
      dateFrom: '2026-05-01',
      dateTo: '2026-05-04',
      occupancy: occ2,
      seasons,
      ratePlans: plans,
      needsElectricity: false,
    });
    expect(v.valid).toBe(true);
  });
});

describe('CASO 6 — larga estancia bloquea 6 meses sin ensuciar el motor diario', () => {
  const units = mkUnits('ut_std', 3);
  const blocks = [
    { unitId: 'ut_std_1', dateFrom: '2026-04-01', dateTo: '2026-10-01', reason: 'longstay' as const },
  ];

  it('la unidad bloqueada no cuenta como disponible', () => {
    const res = searchAvailability({
      dateFrom: '2026-07-01',
      dateTo: '2026-07-08',
      unitTypes: [pitchType],
      units,
      bookings: [],
      blocks,
      seasons,
    });
    expect(res[0]!.availableUnits).toBe(2);
  });

  it('si las otras se llenan, el tipo se agota — el bloqueo pesa como ocupación', () => {
    const res = searchAvailability({
      dateFrom: '2026-07-01',
      dateTo: '2026-07-08',
      unitTypes: [pitchType],
      units,
      bookings: [
        mkBooking('b1', 'ut_std', 'ut_std_2', '2026-07-01', '2026-07-08'),
        mkBooking('b2', 'ut_std', 'ut_std_3', '2026-07-03', '2026-07-06'),
      ],
      blocks,
      seasons,
    });
    expect(res[0]!.status).toBe('unavailable');
  });
});

describe('CASO 7 — cancelación a 20 días con política 50% / 7 días', () => {
  const policy = {
    tiers: [
      { minDaysBefore: 21, refundPct: 100 },
      { minDaysBefore: 7, refundPct: 50 },
      { minDaysBefore: 0, refundPct: 0 },
    ],
  };

  it('a 20 días de la llegada devuelve el 50% de lo pagado', () => {
    const r = calculateCancellationRefund(
      { dateFrom: '2026-08-01', paidCents: 30000 },
      policy,
      '2026-07-12',
    );
    expect(r.daysBefore).toBe(20);
    expect(r.appliedRefundPct).toBe(50);
    expect(r.refundCents).toBe(15000);
    expect(r.retainedCents).toBe(15000);
  });

  it('a 21 días devuelve el 100%; a 3 días, nada', () => {
    expect(
      calculateCancellationRefund({ dateFrom: '2026-08-01', paidCents: 30000 }, policy, '2026-07-11')
        .refundCents,
    ).toBe(30000);
    expect(
      calculateCancellationRefund({ dateFrom: '2026-08-01', paidCents: 30000 }, policy, '2026-07-29')
        .refundCents,
    ).toBe(0);
  });
});
