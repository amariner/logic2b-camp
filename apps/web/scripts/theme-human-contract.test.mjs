import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { validateApprovedHumanContract } from './theme-human-contract.mjs';

function fixture() {
  return {
    slug: 'camping-prueba',
    defaultLocale: 'es',
    pieces: {
      'vida-llegada': {},
      'vida-recepcion': {},
      'vida-servicio-piscina': {},
      'vida-entorno': {},
    },
    content: {
      vida: {
        escenas: [
          { foto: 'vida-llegada' },
          { foto: 'vida-recepcion' },
          { foto: 'vida-servicio-piscina' },
        ],
      },
      entornoPagina: {
        rutas: {
          items: [{ foto: 'vida-entorno' }, { foto: 'vida-entorno' }, { foto: 'vida-entorno' }],
        },
      },
      instalaciones: {
        items: [{ id: 'recepcion' }, { id: 'piscina' }],
      },
    },
  };
}

describe('contrato humano final de temas aprobados', () => {
  it('acepta vida, rutas, cuatro piezas y dos servicios humanos trazados', () => {
    assert.doesNotThrow(() => validateApprovedHumanContract(fixture()));
  });

  it('rechaza que desaparezca vida o rutas de una demo cerrada', () => {
    const withoutLife = fixture();
    delete withoutLife.content.vida;
    assert.throws(() => validateApprovedHumanContract(withoutLife), /requiere vida/);

    const withoutRoutes = fixture();
    delete withoutRoutes.content.entornoPagina.rutas;
    assert.throws(
      () => validateApprovedHumanContract(withoutRoutes),
      /requiere entornoPagina\.rutas/,
    );
  });

  it('rechaza perder una de las cuatro piezas humanas', () => {
    const context = fixture();
    delete context.pieces['vida-llegada'];
    assert.throws(() => validateApprovedHumanContract(context), /cuatro piezas vida-/);
  });

  it('rechaza fotos editoriales no trazadas por el manifiesto', () => {
    const context = fixture();
    context.content.vida.escenas[0].foto = 'vida-desconocida';
    assert.throws(() => validateApprovedHumanContract(context), /no está trazada/);
  });

  it('rechaza recepción o servicio sin una escena humana asociada', () => {
    const withoutReception = fixture();
    withoutReception.content.instalaciones.items[0] = { id: 'entrada' };
    assert.throws(() => validateApprovedHumanContract(withoutReception), /recepción requiere/);

    const withoutService = fixture();
    withoutService.content.instalaciones.items[1] = { id: 'supermercado' };
    assert.throws(() => validateApprovedHumanContract(withoutService), /otro servicio requiere/);
  });
});
