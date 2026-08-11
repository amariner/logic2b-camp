import { describe, expect, it } from 'vitest';
import { serraltaFixtureDefinition, serraltaPlano, serraltaTypeSpecs } from './pinadamar';

describe('escenario Camping Serralta', () => {
  it('representa 80 unidades de montaña en cuatro categorías', () => {
    expect(serraltaFixtureDefinition.units).toBe(80);
    expect(serraltaFixtureDefinition.typeCount).toBe(4);
    expect(serraltaTypeSpecs.map((type) => type.count)).toEqual([48, 18, 10, 4]);
  });

  it('prepara la recepción para solicitudes en cuatro idiomas', () => {
    expect(serraltaFixtureDefinition.locales).toEqual(['es', 'fr', 'de', 'en']);
  });

  it('usa un plano propio de bosque, arroyo y rutas', () => {
    const labels = JSON.stringify(serraltaPlano);
    expect(labels).toContain('Hayedo húmedo');
    expect(labels).toContain('Arroyo');
    expect(labels).toContain('Inicio de rutas');
    expect(labels).toContain('Refugios Serralta');
  });
});
