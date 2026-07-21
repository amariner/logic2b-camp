import { describe, expect, it } from 'vitest';
import { expandPlano, type PlanoDescriptor } from '@logic-camp/config';
import { generateSeed, nightsBetween, seedToSql } from './seed';

const data = generateSeed(2026);

describe('seed demo Cala Sereno', () => {
  it('es determinista', () => {
    expect(seedToSql(generateSeed(2026))).toBe(seedToSql(data));
  });

  it('tiene el inventario exigido: 60 parcelas, 18 bungalows/mobil, 5 glamping', () => {
    const byKind = (kind: string) =>
      data.units.filter((u) => {
        const t = data.unit_types.find((ut) => ut.id === u.unit_type_id)!;
        return t.kind === kind;
      }).length;
    expect(byKind('pitch')).toBe(60);
    expect(byKind('lodging')).toBe(23); // 18 bungalow/mobil + 5 glamping
    expect(data.units.filter((u) => u.unit_type_id === 'ut_glamp').length).toBe(5);
    expect(data.unit_types.length).toBe(8);
  });

  it('tiene 3 temporadas, 12 extras, ~40 reservas y 15 solicitudes', () => {
    expect(data.seasons_calendar.length).toBe(3);
    expect(data.extras.length).toBe(12);
    expect(data.bookings.length).toBeGreaterThanOrEqual(38);
    expect(data.enquiries.length).toBe(15);
  });

  it('PLANO (C7): modules.plano coloca TODAS las unidades y solo unidades que existen', () => {
    const plano = (data.tenants[0]!.modules as { plano?: PlanoDescriptor }).plano;
    expect(plano).toBeDefined();
    const placed = expandPlano(plano!).rects.map((r) => r.code);
    const real = data.units.map((u) => u.code as string);
    // cada unidad del seed tiene un sitio en el plano
    expect(new Set(placed)).toEqual(new Set(real));
    // sin códigos huérfanos ni duplicados
    expect(placed.length).toBe(real.length);
    expect(new Set(placed).size).toBe(placed.length);
  });

  it('CHECK-IN (ADR 0022): hay huéspedes "en casa" en el ancla, y solo confirmadas', () => {
    const anchor = data.anchor;
    const checkedIn = data.bookings.filter((b) => b.checked_in_at !== null);
    // el planning/plano de la demo tienen que enseñar la mezcla "en casa"
    expect(checkedIn.length).toBeGreaterThan(0);
    // "en casa" solo se estampa sobre confirmadas presentes en el ancla; nadie
    // con check-in ha hecho check-out todavía (seguiría 'confirmed', no completada)
    for (const b of checkedIn) {
      expect(b.status).toBe('confirmed');
      expect(b.checked_out_at).toBeNull();
      expect(b.date_from <= anchor && anchor < b.date_to).toBe(true);
    }
  });

  it('incluye los casos límite: cancelada, no-show, sin asignar, larga estancia, grupo', () => {
    const statuses = data.bookings.map((b) => b.status);
    expect(statuses).toContain('cancelled');
    expect(statuses).toContain('no_show');
    expect(data.bookings.some((b) => b.unit_id === null)).toBe(true);
    expect(data.bookings.some((b) => nightsBetween(b.date_from, b.date_to) >= 14)).toBe(true);
    expect(
      data.bookings.some((b) => {
        const o = b.occupancy as { adults: number; childrenAges: number[] };
        return o.adults + o.childrenAges.length >= 6;
      }),
    ).toBe(true);
  });

  it('INVARIANTE: ninguna unidad tiene dos reservas activas solapadas (to exclusive)', () => {
    const active = data.bookings.filter((b) =>
      ['confirmed', 'pending', 'completed'].includes(b.status),
    );
    const byUnit = new Map<string, typeof active>();
    for (const b of active) {
      if (!b.unit_id) continue;
      byUnit.set(b.unit_id, [...(byUnit.get(b.unit_id) ?? []), b]);
    }
    for (const [unit, list] of byUnit) {
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i]!;
          const b = list[j]!;
          const overlap = a.date_from < b.date_to && b.date_from < a.date_to;
          expect(overlap, `solape en ${unit}: ${a.id} vs ${b.id}`).toBe(false);
        }
      }
    }
  });

  it('INVARIANTE: sum(payments.amount_cents) == paid_cents por reserva', () => {
    for (const b of data.bookings) {
      const sum = data.payments
        .filter((p) => p.booking_id === b.id)
        .reduce((s, p) => s + p.amount_cents, 0);
      expect(sum, b.id).toBe(b.paid_cents);
    }
  });

  it('el desglose suma exactamente el total, en céntimos enteros', () => {
    for (const b of data.bookings) {
      const sum = b.price_breakdown.lines.reduce((s, l) => s + l.amountCents, 0);
      expect(sum, b.id).toBe(b.total_cents);
      expect(Number.isInteger(b.total_cents)).toBe(true);
      expect(b.price_breakdown.lines.length).toBeGreaterThan(0);
    }
  });

  it('reserva que cruza temporadas tiene el precio por tramos', () => {
    const cross = data.bookings.find((b) => b.date_from < '2026-07-01' && b.date_to > '2026-07-01')!;
    const baseSeasons = cross.price_breakdown.lines
      .filter((l) => l.concept === 'price.base')
      .map((l) => l.detail.season);
    expect(new Set(baseSeasons).size).toBeGreaterThan(1);
  });

  it('los niños <16 no pagan tasa turística pero cuentan para capacidad', () => {
    const fam = data.bookings.find((b) => b.notes?.toString().includes('exento'))!;
    const occ = fam.occupancy as { adults: number; childrenAges: number[] };
    const nights = nightsBetween(fam.date_from, fam.date_to);
    const taxable = occ.adults + occ.childrenAges.filter((a) => a >= 16).length;
    expect(fam.tourist_tax_cents).toBe(taxable * 100 * nights);
    expect(taxable).toBeLessThan(occ.adults + occ.childrenAges.length);
  });

  it('el SQL generado no contiene undefined ni NaN', () => {
    const sql = seedToSql(data);
    expect(sql).not.toMatch(/undefined|NaN/);
  });
});
