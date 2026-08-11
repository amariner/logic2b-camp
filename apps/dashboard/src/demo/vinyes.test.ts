import { describe, expect, it } from 'vitest';
import { vinyesFixtureDefinition, vinyesPlano, vinyesTypeSpecs } from './pinadamar';

describe('escenario Camping Entre Vinyes', () => {
  it('representa 70 unidades rurales en cuatro categorías', () => {
    expect(vinyesFixtureDefinition.units).toBe(70);
    expect(vinyesFixtureDefinition.typeCount).toBe(4);
    expect(vinyesTypeSpecs.map((type) => type.count)).toEqual([38, 18, 10, 4]);
  });

  it('hace explícito el solape de verano y vendimia', () => {
    expect(vinyesFixtureDefinition.overlappingSeasons).toEqual(['sea_verano', 'sea_vendimia']);
  });

  it('usa un plano propio de viña, bancales y cosecha', () => {
    const labels = JSON.stringify(vinyesPlano);
    expect(labels).toContain('Viña vieja');
    expect(labels).toContain('Recepción y cosecha');
    expect(labels).toContain('Casetas de Viña');
  });
});
