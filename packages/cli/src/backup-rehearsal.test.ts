import { describe, expect, it } from 'vitest';
import { assertValidRestoration, backupSnapshot, parseD1Rows } from './backup-rehearsal';

const row = {
  bookings: 40,
  guests: 20,
  payments: 31,
  last_booking_created_at: '2026-08-10T10:00:00.000Z',
  migrations: '0001_base.sql|0002_auth.sql',
  payment_mismatches: 0,
  booking_overlaps: 0,
};
const output = (value = row) => `Mensaje de Wrangler\n${JSON.stringify([{ results: [value] }])}`;

describe('ensayo de restauración', () => {
  it('recorta la salida de cortesía y conserva las filas JSON', () => {
    expect(parseD1Rows(output())).toEqual([row]);
  });

  it('normaliza la huella y acepta una copia idéntica con invariantes verdes', () => {
    const source = backupSnapshot(output());
    expect(source.bookings).toBe(40);
    expect(() => assertValidRestoration(source, { ...source })).not.toThrow();
  });

  it('falla si se pierde una fila o se rompe un invariante', () => {
    const source = backupSnapshot(output());
    expect(() => assertValidRestoration(source, { ...source, guests: 19 })).toThrow('no coincide');
    expect(() => assertValidRestoration(source, { ...source, paymentMismatches: 1 })).toThrow(
      'incumple invariantes',
    );
  });
});
