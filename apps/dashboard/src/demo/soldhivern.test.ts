import { describe, expect, it } from 'vitest';
import { soldhivernFixtureDefinition, soldhivernPlano, soldhivernTypeSpecs } from './pinadamar';

describe("escenario Sol d'Hivern", () => {
  it('modela 200 unidades orientadas a estancias largas', () => {
    expect(soldhivernTypeSpecs.map((type) => type.count)).toEqual([90, 80, 20, 10]);
    expect(soldhivernFixtureDefinition).toMatchObject({
      units: 200,
      typeCount: 4,
      inactiveUnit: 'OLI-08',
      longStay: { minStay: 45, typicalNights: [60, 75, 90] },
    });
  });

  it('hace visibles las zonas y servicios de larga estancia', () => {
    const labels = JSON.stringify(soldhivernPlano);
    expect(labels).toContain('Salón común');
    expect(labels).toContain('Parcelas Migdia');
    expect(labels).toContain('Estudios Garbí');
    expect(soldhivernPlano.blocks.flatMap((block) => block.units)).toHaveLength(200);
  });
});
