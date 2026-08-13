import { describe, expect, it, vi } from 'vitest';
import { baseEnquiries, demoScenarioRequest, pinadaFixtureCounts, pinadaPlano } from './pinadamar';

describe('escenario Pinada del Mar', () => {
  it('representa un camping mediano y agosto operativo', () => {
    expect(pinadaFixtureCounts.units).toBe(110);
    expect(pinadaFixtureCounts.bookings).toBeGreaterThanOrEqual(70);
    expect(pinadaFixtureCounts.inactiveUnits).toBeGreaterThanOrEqual(1);
  });

  it('mantiene 35–50 solicitudes en cuatro idiomas y todos los estados', () => {
    expect(baseEnquiries.length).toBeGreaterThanOrEqual(35);
    expect(baseEnquiries.length).toBeLessThanOrEqual(50);
    expect(pinadaFixtureCounts.locales).toBe(4);
    expect(new Set(baseEnquiries.map((item) => item.status))).toEqual(
      new Set(['new', 'contacted', 'quoted', 'converted', 'lost']),
    );
  });

  it('usa un plano propio con mar al este y las zonas firmadas', () => {
    const labels = JSON.stringify(pinadaPlano);
    expect(labels).toContain('este');
    expect(labels).toContain('Recepción y acceso');
    expect(labels).toContain('Calle de los Pinos I');
    expect(labels).toContain('Anillo de bungalows');
  });

  it('convierte conservando fechas y tipo solicitado', async () => {
    const source = baseEnquiries[0]!;
    const result = await demoScenarioRequest(`/api/admin/enquiries/${source.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'converted' }),
    });
    const body = result.body as {
      booking: { unitTypeId: string; dateFrom: string; dateTo: string; unitCode: string };
    };
    expect(result.status).toBe(200);
    expect(body.booking).toMatchObject({
      unitTypeId: source.unitTypeId,
      dateFrom: source.dateFrom,
      dateTo: source.dateTo,
      unitCode: 'P-08',
    });
  });

  it('re-cotiza el total local al mover y conserva la nueva base para otro cambio', async () => {
    const stored = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => stored.set(key, value),
      removeItem: (key: string) => stored.delete(key),
    });
    try {
      const planning = await demoScenarioRequest(
        '/api/admin/planning?from=2026-08-01&to=2026-09-01',
      );
      const booking = (planning.body as { bookings: { id: string }[] }).bookings[0]!;
      const moved = await demoScenarioRequest(`/api/admin/bookings/${booking.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          action: 'move',
          dateFrom: '2026-08-10',
          dateTo: '2026-08-12',
          expectedTotalCents: 28800,
        }),
      });
      expect(moved.status).toBe(200);

      const detail = await demoScenarioRequest(`/api/admin/bookings/${booking.id}`);
      expect(detail.body).toMatchObject({ totalCents: 28800 });
      const nextQuote = await demoScenarioRequest(`/api/admin/bookings/${booking.id}/requote`, {
        method: 'POST',
        body: JSON.stringify({ dateFrom: '2026-08-10', dateTo: '2026-08-13' }),
      });
      expect(nextQuote.body).toMatchObject({ previousTotalCents: 28800, totalCents: 43200 });
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
