import { describe, expect, it } from 'vitest';
import {
  baseEnquiries,
  demoScenarioRequest,
  pinadaFixtureCounts,
  pinadaPlano,
} from './pinadamar';

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
});
