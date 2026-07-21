import { describe, expect, it } from 'vitest';
import { csvCell, csvFileName, sqlDumpArgs, toCsv } from './export';

describe('csvCell', () => {
  it('deja en paz lo que no necesita comillas', () => {
    expect(csvCell('Cala Sereno')).toBe('Cala Sereno');
    expect(csvCell(12345)).toBe('12345');
  });

  it('entrecomilla comas, comillas y saltos de línea', () => {
    expect(csvCell('Serra, Eva')).toBe('"Serra, Eva"');
    expect(csvCell('dijo "hola"')).toBe('"dijo ""hola"""');
    expect(csvCell('línea1\nlínea2')).toBe('"línea1\nlínea2"');
  });

  it('null se emite VACÍO, no como la palabra "null"', () => {
    // En una hoja de cálculo, "null" es un dato; un hueco es un hueco.
    expect(csvCell(null)).toBe('');
  });

  it('el dinero sale como entero de céntimos, sin decimales ni separadores', () => {
    // Invariante del proyecto: nunca float. Si esto imprimiera 123.45 el CSV
    // estaría mintiendo sobre el modelo de datos.
    expect(csvCell(12345)).toBe('12345');
  });
});

describe('toCsv', () => {
  it('cabecera + filas', () => {
    expect(toCsv([{ code: 'CS-1', totalCents: 1000 }])).toBe('code,totalCents\nCS-1,1000\n');
  });

  it('sin filas devuelve cadena vacía, no una cabecera huérfana', () => {
    expect(toCsv([])).toBe('');
  });

  it('toma las columnas de la UNIÓN de las filas, no de la primera', () => {
    // D1 devuelve JSON por fila; una fila con un campo nulo puede traer menos
    // claves. Mirando solo la primera se perdería una columna entera en silencio.
    const csv = toCsv([{ a: 1 }, { a: 2, b: 3 }]);
    expect(csv).toBe('a,b\n1,\n2,3\n');
  });

  it('respeta el orden de aparición de las columnas', () => {
    expect(toCsv([{ z: 1, a: 2 }])).toBe('z,a\n1,2\n');
  });
});

describe('csvFileName', () => {
  it('es estable y ordenable', () => {
    expect(csvFileName('demo', 'bookings', '2026-07-21')).toBe('demo-bookings-2026-07-21.csv');
  });
});

describe('sqlDumpArgs', () => {
  it('devuelve argumentos sueltos — el slug nunca toca una shell', () => {
    const args = sqlDumpArgs('logic-camp-demo', 'tenants/demo/wrangler.jsonc', 'out.sql');
    expect(args).toEqual([
      'd1',
      'export',
      'logic-camp-demo',
      '--remote',
      '--config',
      'tenants/demo/wrangler.jsonc',
      '--output',
      'out.sql',
    ]);
    // un nombre hostil viaja como UN argumento, no como comando
    expect(sqlDumpArgs('a; rm -rf /', 'c', 'o')[2]).toBe('a; rm -rf /');
  });
});
