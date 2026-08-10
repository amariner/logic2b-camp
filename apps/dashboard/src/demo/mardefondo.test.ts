import { describe, expect, it } from 'vitest';
import { demoScenarioRequest, mardefondoFixtureCounts, mardefondoPlano } from './mardefondo';

describe('escenario Mar de Fondo', () => {
  it('representa exactamente las 300 unidades de la demo Visión', () => {
    expect(mardefondoFixtureCounts).toMatchObject({
      units: 300,
      mapUnits: 300,
      bookings: 240,
      inactiveUnits: 1,
    });
  });

  it('comparte con la web los cuatro identificadores de producto', async () => {
    const result = await demoScenarioRequest('/api/admin/catalog');
    const ids = (result.body as { unitTypes: { id: string }[] }).unitTypes.map((type) => type.id);
    expect(ids).toEqual([
      'ut_parcela_atlantica',
      'ut_bungalow_laguna',
      'ut_mobil_horizonte',
      'ut_glamping_duna',
    ]);
  });

  it('incluye la reserva web firma en planning, búsqueda y ficha', async () => {
    const planning = await demoScenarioRequest('/api/admin/planning?from=2026-08-01&to=2026-09-01');
    const items = (planning.body as { bookings: { code: string }[] }).bookings;
    expect(items.some((booking) => booking.code === 'MF-DEMO-001')).toBe(true);

    const detail = await demoScenarioRequest('/api/admin/bookings/book_mf_demo_001');
    expect(detail.body).toMatchObject({ code: 'MF-DEMO-001', unitCode: 'BL-008' });
  });

  it('expone valor de reservas y cobros sin fabricar una métrica fiscal', async () => {
    const result = await demoScenarioRequest('/api/admin/reports?from=2026-08-01&to=2026-09-01');
    const body = result.body as {
      bookingValue?: { totalCents: number; paidCents: number; bookings: number };
      revenue?: unknown;
    };

    expect(body.bookingValue).toMatchObject({ bookings: expect.any(Number) });
    expect(body.bookingValue!.totalCents).toBeGreaterThanOrEqual(body.bookingValue!.paidCents);
    expect(body.revenue).toBeUndefined();
  });

  it('no genera solapes de unidad en el agosto canónico', async () => {
    const planning = await demoScenarioRequest('/api/admin/planning?from=2026-08-01&to=2026-09-01');
    const bookings = (
      planning.body as {
        bookings: { unitId: string | null; dateFrom: string; dateTo: string }[];
      }
    ).bookings;
    for (const booking of bookings) {
      expect(
        bookings.some(
          (candidate) =>
            candidate !== booking &&
            candidate.unitId === booking.unitId &&
            candidate.dateFrom < booking.dateTo &&
            candidate.dateTo > booking.dateFrom,
        ),
      ).toBe(false);
    }
  });

  it('tiene plano propio completo con laguna, playa y cuatro familias', () => {
    const labels = JSON.stringify(mardefondoPlano);
    expect(labels).toContain('Laguna central');
    expect(labels).toContain('Playa y Mediterráneo');
    expect(labels).toContain('Recepción y acceso');
    expect(labels).toContain('Glamping Duna');
  });

  it('registra un cobro local reversible en la ficha', async () => {
    const before = await demoScenarioRequest('/api/admin/bookings/book_mf_001');
    const previous = (before.body as { paidCents: number }).paidCents;
    const result = await demoScenarioRequest('/api/admin/bookings/book_mf_001', {
      method: 'PATCH',
      body: JSON.stringify({ action: 'record_payment', amountCents: 1200, method: 'card' }),
    });
    expect(result.status).toBe(200);
    expect((result.body as { paidCents: number }).paidCents).toBe(previous + 1200);
  });
});
