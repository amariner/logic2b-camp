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

  it('completa cobro, fianza, acceso y check-in en el circuito de recepción', async () => {
    const stored = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => stored.set(key, value),
      removeItem: (key: string) => stored.delete(key),
    });
    try {
      const arrivals = await demoScenarioRequest('/api/admin/bookings?arrivalsOn=2026-08-21');
      const booking = (
        arrivals.body as {
          items: Array<{ id: string }>;
        }
      ).items[0]!;
      const detail = (await demoScenarioRequest(`/api/admin/bookings/${booking.id}`)).body as {
        totalCents: number;
        paidCents: number;
        depositCents: number;
      };
      const act = (body: unknown) =>
        demoScenarioRequest(`/api/admin/bookings/${booking.id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });

      expect((await act({ action: 'check_in' })).status).toBe(409);
      await act({
        action: 'record_payment',
        amountCents: detail.totalCents - detail.paidCents,
        method: 'cash',
      });
      await act({
        action: 'set_arrival_details',
        vehiclePlate: '1234 abc',
        arrivalEta: '2026-08-21T15:30:00.000Z',
        accessCredential: 'Mando recepción 12',
      });
      expect((await act({ action: 'check_in' })).status).toBe(409);
      await act({
        action: 'record_deposit',
        amountCents: detail.depositCents,
        method: 'card',
      });
      expect((await act({ action: 'check_in' })).status).toBe(200);

      expect((await demoScenarioRequest(`/api/admin/bookings/${booking.id}`)).body).toMatchObject({
        checkedInAt: '2026-08-21T12:00:00.000Z',
        accessGrantedAt: '2026-08-21T12:00:00.000Z',
        accessCredential: 'Mando recepción 12',
        depositPaidCents: detail.depositCents,
      });
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
