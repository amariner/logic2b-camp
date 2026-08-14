import { describe, expect, it } from 'vitest';
import { DOCS_BASE, ayudaDe } from './ayuda';

describe('ayudaDe', () => {
  it('la portada abre su propia guía de orientación', () => {
    expect(ayudaDe('/')).toBe(`${DOCS_BASE}/recepcion/inicio/`);
  });

  it('las fichas direccionables heredan la guía de su lista', () => {
    expect(ayudaDe('/reservas/bkg_123')).toBe(`${DOCS_BASE}/recepcion/nueva-reserva/`);
    expect(ayudaDe('/clientes/gst_123')).toBe(`${DOCS_BASE}/recepcion/huespedes/`);
  });

  it('enlaza Control total con la decisión diaria correspondiente', () => {
    expect(ayudaDe('/control-total/limpieza')).toBe(
      `${DOCS_BASE}/direccion/coordinar-salidas/`,
    );
    expect(ayudaDe('/control-total/equipo')).toBe(`${DOCS_BASE}/direccion/entregar-turno/`);
  });

  it('no inventa un destino para pantallas sin documentación', () => {
    expect(ayudaDe('/automatiza')).toBeNull();
    expect(ayudaDe('/desconocida')).toBeNull();
  });
});
