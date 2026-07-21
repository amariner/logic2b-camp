/** Suite por módulo del motor — complementa edge-cases.test.ts */
import { describe, expect, it } from 'vitest';
import { assignUnit } from './assign';
import { searchAvailability } from './availability';
import { addDays, daysUntil, eachNight, nightsBetween, rangesOverlap, weekday } from './dates';
import { createExtensionRegistry } from './extensions';
import { applyRules, ClosedError, quote } from './pricing';
import { seasonForNight, segmentStay } from './seasons';
import { calculateTouristTax, NO_TAX, VALENCIA_TAX } from './touristTax';
import { validateStay } from './validate';
import {
  bungalowType,
  mkBooking,
  mkUnits,
  noBlocks,
  pitchType,
  plans,
  seasons,
} from './fixtures.test-helper';
import type { RateRule } from './types';

const occ2 = { adults: 2, childrenAges: [], pets: 0, vehicles: 1 };

describe('dates', () => {
  it('nightsBetween con to exclusive', () => {
    expect(nightsBetween('2026-07-01', '2026-07-08')).toBe(7);
    expect(nightsBetween('2026-07-01', '2026-07-02')).toBe(1);
  });
  it('eachNight devuelve las noches [from,to)', () => {
    expect(eachNight('2026-07-30', '2026-08-02')).toEqual([
      '2026-07-30',
      '2026-07-31',
      '2026-08-01',
    ]);
  });
  it('rangesOverlap: el día de salida se libera (semiabierto)', () => {
    expect(rangesOverlap('2026-07-01', '2026-07-05', '2026-07-05', '2026-07-10')).toBe(false);
    expect(rangesOverlap('2026-07-01', '2026-07-06', '2026-07-05', '2026-07-10')).toBe(true);
  });
  it('weekday y addDays cruzando meses', () => {
    expect(weekday('2026-07-04')).toBe(6); // sábado
    expect(addDays('2026-07-31', 1)).toBe('2026-08-01');
    expect(daysUntil('2026-07-12', '2026-08-01')).toBe(20);
  });
});

describe('seasons', () => {
  it('el solape se resuelve por prioridad', () => {
    expect(seasonForNight('2026-07-15', seasons)!.id).toBe('alta');
    expect(seasonForNight('2026-06-15', seasons)!.id).toBe('media');
    expect(seasonForNight('2026-04-10', seasons)!.id).toBe('apertura');
  });
  it('noche fuera de toda temporada → null (cerrado)', () => {
    expect(seasonForNight('2026-12-20', seasons)).toBeNull();
  });
  it('segmentStay parte por temporada efectiva con dateTo exclusive', () => {
    const segs = segmentStay('2026-06-28', '2026-07-03', seasons)!;
    expect(segs.map((s) => [s.season.id, s.nights])).toEqual([
      ['media', 3],
      ['alta', 2],
    ]);
    expect(segs[0]!.dateTo).toBe('2026-07-01');
  });
  it('temporada cerrada (isOpen=false) no cuenta aunque cubra la fecha', () => {
    const closed = seasons.map((s) => (s.id === 'alta' ? { ...s, isOpen: false } : s));
    expect(seasonForNight('2026-07-15', closed)!.id).toBe('media');
  });
});

describe('quote', () => {
  it('parcela: persona extra, niño, electricidad y mascota por noche', () => {
    const q = quote({
      unitType: pitchType, // 2 incluidas
      dateFrom: '2026-05-01',
      dateTo: '2026-05-04', // apertura, base 1800
      occupancy: { adults: 3, childrenAges: [7], pets: 1, vehicles: 1 },
      seasons,
      ratePlans: plans,
      currency: 'EUR',
      withElectricity: true,
    });
    const by = (c: string) => q.breakdown.lines.find((l) => l.concept === c)?.amountCents;
    expect(by('price.base')).toBe(1800 * 3);
    expect(by('price.extra_person')).toBe(500 * 1 * 3);
    expect(by('price.child')).toBe(300 * 1 * 3);
    expect(by('price.electricity')).toBe(550 * 3);
    expect(by('price.pet')).toBe(350 * 3);
    expect(q.breakdown.totalCents).toBe(q.breakdown.lines.reduce((s, l) => s + l.amountCents, 0));
  });

  it('los niños dentro del cupo incluido no pagan como extra', () => {
    const q = quote({
      unitType: pitchType, // 2 incluidas
      dateFrom: '2026-05-01',
      dateTo: '2026-05-03',
      occupancy: { adults: 1, childrenAges: [7], pets: 0, vehicles: 1 }, // 1+1 = cupo
      seasons,
      ratePlans: plans,
      currency: 'EUR',
    });
    expect(q.breakdown.lines.find((l) => l.concept === 'price.child')).toBeUndefined();
    expect(q.breakdown.lines.find((l) => l.concept === 'price.extra_person')).toBeUndefined();
  });

  it('bungalow: sin líneas de parcela (electricidad incluida)', () => {
    const q = quote({
      unitType: bungalowType,
      dateFrom: '2026-05-01',
      dateTo: '2026-05-03',
      occupancy: { adults: 4, childrenAges: [], pets: 0, vehicles: 1 },
      seasons,
      ratePlans: plans,
      currency: 'EUR',
      withElectricity: true,
    });
    expect(q.breakdown.lines).toHaveLength(1);
    expect(q.breakdown.lines[0]!.concept).toBe('price.base');
  });

  it('extras por estancia, por noche y por persona', () => {
    const q = quote({
      unitType: pitchType,
      dateFrom: '2026-05-01',
      dateTo: '2026-05-04', // 3 noches
      occupancy: { adults: 2, childrenAges: [5], pets: 0, vehicles: 1 }, // 3 personas
      seasons,
      ratePlans: plans,
      currency: 'EUR',
      extras: [
        { id: 'limpieza', concept: 'extra.cleaning', priceCents: 4500, per: 'stay', qty: 1 },
        { id: 'nevera', concept: 'extra.fridge', priceCents: 400, per: 'night', qty: 1 },
        { id: 'sabanas', concept: 'extra.linen', priceCents: 900, per: 'person', qty: 1 },
      ],
    });
    const by = (c: string) => q.breakdown.lines.find((l) => l.concept === c)?.amountCents;
    expect(by('extra.cleaning')).toBe(4500);
    expect(by('extra.fridge')).toBe(400 * 3);
    expect(by('extra.linen')).toBe(900 * 3);
  });

  it('estancia fuera de temporada lanza ClosedError (cerrado ≠ sin disponibilidad)', () => {
    expect(() =>
      quote({
        unitType: pitchType,
        dateFrom: '2026-12-01',
        dateTo: '2026-12-05',
        occupancy: occ2,
        seasons,
        ratePlans: plans,
        currency: 'EUR',
      }),
    ).toThrow(ClosedError);
  });
});

describe('applyRules', () => {
  const baseQuote = () =>
    quote({
      unitType: pitchType,
      dateFrom: '2026-05-01',
      dateTo: '2026-05-15', // 14 noches apertura
      occupancy: occ2,
      seasons,
      ratePlans: plans,
      currency: 'EUR',
    });
  const rules: RateRule[] = [
    {
      id: 'early',
      type: 'early_booking',
      conditions: { minDaysAhead: 60 },
      discount: { type: 'percent', value: 10 },
      stackable: false,
      priority: 10,
    },
    {
      id: 'acsi',
      type: 'acsi',
      conditions: { card: 'acsi', seasonIds: ['apertura'] },
      discount: { type: 'percent', value: 20 },
      stackable: false,
      priority: 5,
    },
    {
      id: 'long',
      type: 'long_stay',
      conditions: { minNights: 14 },
      discount: { type: 'percent', value: 8 },
      stackable: true,
      priority: 20,
    },
  ];
  const ctx = { today: '2026-01-15', seasonIds: ['apertura'], cards: ['acsi'] };

  it('aplica la no-stackable de mayor prioridad + todas las stackables', () => {
    const q = applyRules(baseQuote(), rules, ctx);
    const discounts = q.breakdown.lines.filter((l) => l.amountCents < 0).map((l) => l.concept);
    expect(discounts).toContain('discount.long_stay');
    expect(discounts).toContain('discount.early_booking'); // prioridad 10 > acsi 5
    expect(discounts).not.toContain('discount.acsi');
  });

  it('los descuentos son líneas negativas y el total cuadra', () => {
    const before = baseQuote();
    const q = applyRules(before, rules, ctx);
    expect(q.breakdown.totalCents).toBe(q.breakdown.lines.reduce((s, l) => s + l.amountCents, 0));
    expect(q.breakdown.totalCents).toBeLessThan(before.breakdown.totalCents);
  });

  it('una regla cuyas condiciones no se cumplen no aplica', () => {
    const q = applyRules(baseQuote(), rules, { today: '2026-04-20', seasonIds: ['apertura'] });
    // sin antelación 60d, sin carnet: solo long_stay (14 noches)
    const discounts = q.breakdown.lines.filter((l) => l.amountCents < 0).map((l) => l.concept);
    expect(discounts).toEqual(['discount.long_stay']);
  });

  it('no muta el quote de entrada', () => {
    const before = baseQuote();
    const totalBefore = before.breakdown.totalCents;
    applyRules(before, rules, ctx);
    expect(before.breakdown.totalCents).toBe(totalBefore);
    expect(before.breakdown.lines.every((l) => l.amountCents >= 0)).toBe(true);
  });
});

describe('searchAvailability', () => {
  const units = mkUnits('ut_std', 3);

  it('resta reservas pending y confirmed, ignora cancelled/no_show/completed pasadas', () => {
    const res = searchAvailability({
      dateFrom: '2026-07-01',
      dateTo: '2026-07-05',
      unitTypes: [pitchType],
      units,
      bookings: [
        mkBooking('b1', 'ut_std', 'ut_std_1', '2026-07-01', '2026-07-05', 'confirmed'),
        mkBooking('b2', 'ut_std', null, '2026-07-02', '2026-07-06', 'pending'),
        mkBooking('b3', 'ut_std', 'ut_std_3', '2026-07-01', '2026-07-05', 'cancelled'),
      ],
      blocks: noBlocks,
      seasons,
    });
    expect(res[0]!.availableUnits).toBe(1);
    expect(res[0]!.status).toBe('available');
  });

  it('fuera de temporada → closed, no unavailable', () => {
    const res = searchAvailability({
      dateFrom: '2026-12-01',
      dateTo: '2026-12-05',
      unitTypes: [pitchType],
      units,
      bookings: [],
      blocks: noBlocks,
      seasons,
    });
    expect(res[0]!.status).toBe('closed');
  });

  it('un bloqueo por tipo anula todas las unidades', () => {
    const res = searchAvailability({
      dateFrom: '2026-07-01',
      dateTo: '2026-07-05',
      unitTypes: [pitchType],
      units,
      bookings: [],
      blocks: [
        { unitTypeId: 'ut_std', dateFrom: '2026-07-02', dateTo: '2026-07-03', reason: 'manual' },
      ],
      seasons,
    });
    expect(res[0]!.status).toBe('unavailable');
  });

  it('el día de salida no ocupa: back-to-back es válido', () => {
    const oneUnit = mkUnits('ut_std', 1);
    const res = searchAvailability({
      dateFrom: '2026-07-05',
      dateTo: '2026-07-10',
      unitTypes: [pitchType],
      units: oneUnit,
      bookings: [mkBooking('b1', 'ut_std', 'ut_std_1', '2026-07-01', '2026-07-05')],
      blocks: noBlocks,
      seasons,
    });
    expect(res[0]!.status).toBe('available');
  });

  it('un hold vivo resta 1 unidad a su tipo (ADR 0007)', () => {
    const oneUnit = mkUnits('ut_std', 1);
    const res = searchAvailability({
      dateFrom: '2026-07-01',
      dateTo: '2026-07-05',
      unitTypes: [pitchType],
      units: oneUnit,
      bookings: [],
      blocks: noBlocks,
      seasons,
      holds: [
        {
          id: 'h1',
          unitTypeId: 'ut_std',
          dateFrom: '2026-07-03',
          dateTo: '2026-07-06',
          expiresAt: '2026-06-01T10:15:00.000Z',
        },
      ],
      now: '2026-06-01T10:00:00.000Z',
    });
    expect(res[0]!.status).toBe('unavailable');
    expect(res[0]!.availableUnits).toBe(0);
  });

  it('un hold caducado NO ocupa aunque el cron no haya pasado (expiración perezosa)', () => {
    const oneUnit = mkUnits('ut_std', 1);
    const res = searchAvailability({
      dateFrom: '2026-07-01',
      dateTo: '2026-07-05',
      unitTypes: [pitchType],
      units: oneUnit,
      bookings: [],
      blocks: noBlocks,
      seasons,
      holds: [
        {
          id: 'h1',
          unitTypeId: 'ut_std',
          dateFrom: '2026-07-01',
          dateTo: '2026-07-05',
          expiresAt: '2026-06-01T09:59:59.000Z',
        },
      ],
      now: '2026-06-01T10:00:00.000Z',
    });
    expect(res[0]!.status).toBe('available');
    expect(res[0]!.availableUnits).toBe(1);
  });

  it('holds sin solape de fechas no restan (to exclusive: back-to-back con hold vale)', () => {
    const oneUnit = mkUnits('ut_std', 1);
    const res = searchAvailability({
      dateFrom: '2026-07-05',
      dateTo: '2026-07-08',
      unitTypes: [pitchType],
      units: oneUnit,
      bookings: [],
      blocks: noBlocks,
      seasons,
      holds: [
        {
          id: 'h1',
          unitTypeId: 'ut_std',
          dateFrom: '2026-07-01',
          dateTo: '2026-07-05',
          expiresAt: '2026-06-01T10:15:00.000Z',
        },
        {
          id: 'h2',
          unitTypeId: 'ut_bung',
          dateFrom: '2026-07-05',
          dateTo: '2026-07-08',
          expiresAt: '2026-06-01T10:15:00.000Z',
        },
      ],
      now: '2026-06-01T10:00:00.000Z',
    });
    expect(res[0]!.status).toBe('available');
  });

  it('invariante 1 con holds: reservas + holds nunca superan las unidades', () => {
    const twoUnits = mkUnits('ut_std', 2);
    const res = searchAvailability({
      dateFrom: '2026-07-01',
      dateTo: '2026-07-04',
      unitTypes: [pitchType],
      units: twoUnits,
      bookings: [mkBooking('b1', 'ut_std', 'ut_std_1', '2026-07-02', '2026-07-06')],
      blocks: noBlocks,
      seasons,
      holds: [
        {
          id: 'h1',
          unitTypeId: 'ut_std',
          dateFrom: '2026-07-03',
          dateTo: '2026-07-04',
          expiresAt: '2026-06-01T10:15:00.000Z',
        },
      ],
      now: '2026-06-01T10:00:00.000Z',
    });
    expect(res[0]!.availableUnits).toBe(0);
    expect(res[0]!.status).toBe('unavailable');
  });

  it('unidades inactivas no cuentan', () => {
    const mixed = [
      ...mkUnits('ut_std', 2),
      { ...mkUnits('ut_std', 3)[2]!, status: 'inactive' as const },
    ];
    const res = searchAvailability({
      dateFrom: '2026-07-01',
      dateTo: '2026-07-03',
      unitTypes: [pitchType],
      units: mixed,
      bookings: [],
      blocks: noBlocks,
      seasons,
    });
    expect(res[0]!.availableUnits).toBe(2);
  });
});

describe('assignUnit', () => {
  const units = mkUnits('ut_std', 3);

  it('elige la unidad que deja menos hueco (back-to-back gana)', () => {
    const a = assignUnit({
      unitTypeId: 'ut_std',
      dateFrom: '2026-07-05',
      dateTo: '2026-07-10',
      units,
      bookings: [
        mkBooking('b1', 'ut_std', 'ut_std_2', '2026-07-01', '2026-07-05'), // pegada
        mkBooking('b2', 'ut_std', 'ut_std_3', '2026-07-01', '2026-07-03'), // hueco de 2
      ],
      blocks: noBlocks,
    })!;
    expect(a.unitId).toBe('ut_std_2');
    expect(a.gapScore).toBeLessThan(a.alternatives[0]!.gapScore);
  });

  it('descarta unidades ocupadas o bloqueadas en el rango', () => {
    const a = assignUnit({
      unitTypeId: 'ut_std',
      dateFrom: '2026-07-05',
      dateTo: '2026-07-10',
      units,
      bookings: [mkBooking('b1', 'ut_std', 'ut_std_1', '2026-07-07', '2026-07-09')],
      blocks: [
        { unitId: 'ut_std_2', dateFrom: '2026-07-01', dateTo: '2026-08-01', reason: 'longstay' },
      ],
    })!;
    expect(a.unitId).toBe('ut_std_3');
    expect(a.alternatives).toHaveLength(0);
  });

  it('devuelve null si no hay unidad libre todo el rango', () => {
    const a = assignUnit({
      unitTypeId: 'ut_std',
      dateFrom: '2026-07-05',
      dateTo: '2026-07-10',
      units: mkUnits('ut_std', 1),
      bookings: [mkBooking('b1', 'ut_std', 'ut_std_1', '2026-07-07', '2026-07-09')],
      blocks: noBlocks,
    });
    expect(a).toBeNull();
  });

  it('empate de hueco → menor código (estable)', () => {
    const a = assignUnit({
      unitTypeId: 'ut_std',
      dateFrom: '2026-07-05',
      dateTo: '2026-07-10',
      units,
      bookings: [],
      blocks: noBlocks,
    })!;
    expect(a.unitCode).toBe('U-01');
  });
});

describe('touristTax', () => {
  it('respeta maxNights de la política', () => {
    const tax = calculateTouristTax(
      { adults: 2, childrenAges: [], pets: 0, vehicles: 1 },
      10,
      VALENCIA_TAX,
    );
    expect(tax).toBe(2 * 100 * 7); // capado a 7 noches
  });
  it('política none devuelve 0', () => {
    expect(
      calculateTouristTax({ adults: 4, childrenAges: [], pets: 0, vehicles: 1 }, 7, NO_TAX),
    ).toBe(0);
  });
});

describe('validateStay — acumulación de errores', () => {
  it('devuelve TODOS los errores, no solo el primero', () => {
    const v = validateStay({
      unitType: bungalowType, // capacidad 6, sin mascotas, alta: min 7 + sábado
      dateFrom: '2026-07-08', // miércoles
      dateTo: '2026-07-10', // 2 noches
      occupancy: { adults: 6, childrenAges: [4, 8], pets: 1, vehicles: 1 }, // 8 pax + mascota
      seasons,
      ratePlans: plans,
    });
    expect(v.valid).toBe(false);
    if (!v.valid) {
      const codes = v.issues.map((i) => i.code);
      expect(codes).toContain('stay.min_stay');
      expect(codes).toContain('stay.arrival_day');
      expect(codes).toContain('stay.capacity');
      expect(codes).toContain('stay.no_pets');
    }
  });

  it('fechas invertidas → invalid_dates', () => {
    const v = validateStay({
      unitType: pitchType,
      dateFrom: '2026-07-10',
      dateTo: '2026-07-05',
      occupancy: occ2,
      seasons,
      ratePlans: plans,
    });
    expect(v.valid).toBe(false);
    if (!v.valid) expect(v.issues[0]!.code).toBe('stay.invalid_dates');
  });
});

describe('extensiones', () => {
  it('los transformadores se encadenan en orden de registro', async () => {
    const reg = createExtensionRegistry();
    reg.on('afterAvailabilitySearch', (results) => results.filter((r) => r.status === 'available'));
    reg.on('afterAvailabilitySearch', (results) =>
      results.map((r) => ({ ...r, availableUnits: r.availableUnits - 1 })),
    );
    const out = await reg.transform('afterAvailabilitySearch', [
      { unitTypeId: 'a', availableUnits: 3, status: 'available' },
      { unitTypeId: 'b', availableUnits: 0, status: 'unavailable' },
    ]);
    expect(out).toEqual([{ unitTypeId: 'a', availableUnits: 2, status: 'available' }]);
  });

  it('los observadores se ejecutan todos (incluso async)', async () => {
    const reg = createExtensionRegistry();
    const calls: string[] = [];
    reg.on('onBookingCreated', () => void calls.push('sync'));
    reg.on('onBookingCreated', async () => void calls.push('async'));
    await reg.emit('onBookingCreated', { id: 'b1' });
    expect(calls).toEqual(['sync', 'async']);
  });

  it('los registros declarativos devuelven copias ordenadas', () => {
    const reg = createExtensionRegistry();
    reg.registerDashboardPanel({ id: 'p2', titleKey: 'x', order: 2 });
    reg.registerDashboardPanel({ id: 'p1', titleKey: 'y', order: 1 });
    reg.registerRateRule({
      id: 'r1',
      type: 'promo',
      conditions: {},
      discount: { type: 'percent', value: 5 },
      stackable: true,
      priority: 0,
    });
    expect(reg.getDashboardPanels().map((p) => p.id)).toEqual(['p1', 'p2']);
    expect(reg.getRateRules()).toHaveLength(1);
  });
});
