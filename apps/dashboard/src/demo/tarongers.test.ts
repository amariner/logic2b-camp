import { describe, expect, it } from 'vitest';
import {
  tarongersFixtureDefinition,
  tarongersPlano,
  tarongersTypeSpecs,
} from './pinadamar';

describe('escenario Camping Els Tarongers', () => {
  it('representa 100 unidades familiares en cuatro categorías', () => {
    expect(tarongersFixtureDefinition.units).toBe(100);
    expect(tarongersFixtureDefinition.typeCount).toBe(4);
    expect(tarongersTypeSpecs.map((type) => type.count)).toEqual([60, 20, 14, 6]);
  });

  it('centra la consulta comercial en edades y sombra', () => {
    expect(tarongersFixtureDefinition.enquiryFocus).toEqual(['edades', 'sombra']);
  });

  it('usa un plano propio de naranjal y acequia protegida', () => {
    const labels = JSON.stringify(tarongersPlano);
    expect(labels).toContain('Naranjal adulto');
    expect(labels).toContain('Acequia protegida');
    expect(labels).toContain('Bungalows Azahar');
  });
});
