import { describe, expect, it } from 'vitest';
import { carrascaFixtureDefinition, carrascaPlano, carrascaTypeSpecs } from './pinadamar';

describe('escenario Camping La Carrasca', () => {
  it('representa 150 unidades de interior en cuatro categorías', () => {
    expect(carrascaFixtureDefinition.units).toBe(150);
    expect(carrascaFixtureDefinition.typeCount).toBe(4);
    expect(carrascaTypeSpecs.map((type) => type.count)).toEqual([80, 30, 24, 16]);
  });

  it('declara la política regional ficticia que diferencia el escenario', () => {
    expect(carrascaFixtureDefinition.touristTax).toEqual({ adultCents: 120, maxNights: 7 });
    expect(carrascaFixtureDefinition.cancellationDays).toEqual([14, 7, 0]);
  });

  it('usa un plano propio de encinar, era y piscina proporcionada', () => {
    const labels = JSON.stringify(carrascaPlano);
    expect(labels).toContain('Encinar adulto');
    expect(labels).toContain('Era común');
    expect(labels).toContain('Casas Umbría');
  });
});
