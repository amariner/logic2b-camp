import { describe, expect, it } from 'vitest';
import { ballenaFixtureDefinition, ballenaPlano, ballenaTypeSpecs } from './pinadamar';

describe('escenario Camping La Ballena', () => {
  it('representa 250 unidades familiares en cuatro categorías', () => {
    expect(ballenaFixtureDefinition.units).toBe(250);
    expect(ballenaFixtureDefinition.typeCount).toBe(4);
    expect(ballenaTypeSpecs.map((type) => type.count)).toEqual([110, 50, 54, 36]);
  });

  it('hace visible la rotación de verano de sábado a sábado', () => {
    expect(ballenaFixtureDefinition.weeklyRotation).toEqual({ minStay: 7, arrivalDays: [6] });
  });

  it('usa un plano propio de agua, club y calles de llegada', () => {
    const labels = JSON.stringify(ballenaPlano);
    expect(labels).toContain('Parque de agua');
    expect(labels).toContain('Club familiar');
    expect(labels).toContain('Mobil-homes Marea');
  });
});
