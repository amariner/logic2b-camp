import { describe, expect, it } from 'vitest';
import {
  RETENTION,
  addYears,
  anonymizableFrom,
  isDueForAnonymization,
  lastStayEnd,
} from './retention';

describe('addYears', () => {
  it('suma años conservando el día', () => {
    expect(addYears('2026-03-13', 3)).toBe('2029-03-13');
    expect(addYears('2026-08-01', 6)).toBe('2032-08-01');
  });

  it('el 29 de febrero cae al 28 en año no bisiesto — nunca al 1 de marzo', () => {
    // Si esto se fuera al 1 de marzo estaríamos alargando la retención un día
    // sobre el plazo legal, que es justo lo que no se puede hacer.
    expect(addYears('2024-02-29', 3)).toBe('2027-02-28');
    expect(addYears('2024-02-29', 4)).toBe('2028-02-29');
  });

  it('no toca el día cuando no hay desbordamiento', () => {
    expect(addYears('2026-01-31', 1)).toBe('2027-01-31');
  });
});

describe('lastStayEnd', () => {
  it('devuelve la salida más tardía', () => {
    expect(
      lastStayEnd([{ dateTo: '2026-08-10' }, { dateTo: '2027-07-02' }, { dateTo: '2026-01-01' }]),
    ).toBe('2027-07-02');
  });

  it('sin estancias no hay nada que conservar', () => {
    expect(lastStayEnd([])).toBeNull();
  });
});

describe('anonymizableFrom — el plazo del registro de viajeros (RD 933/2021)', () => {
  const hoy = '2026-07-21';

  it('un huésped sin estancias se puede anonimizar ya', () => {
    expect(anonymizableFrom([], hoy)).toBeNull();
  });

  it('una estancia reciente BLOQUEA, y devuelve la fecha exacta desde la que se podrá', () => {
    // date_to es exclusive: el 14/03/2026 es el día de salida. Tres años.
    expect(anonymizableFrom([{ dateTo: '2026-03-14' }], hoy)).toBe('2029-03-14');
  });

  it('una estancia ya vencida no bloquea', () => {
    expect(anonymizableFrom([{ dateTo: '2023-06-01' }], hoy)).toBeNull();
  });

  it('manda la estancia MÁS RECIENTE, no la primera', () => {
    // Un cliente de siempre: su primera visita venció hace años, la última no.
    expect(anonymizableFrom([{ dateTo: '2019-08-20' }, { dateTo: '2026-06-30' }], hoy)).toBe(
      '2029-06-30',
    );
  });

  it('el día exacto en que vence ya NO bloquea (plazo cumplido)', () => {
    expect(anonymizableFrom([{ dateTo: '2023-07-21' }], hoy)).toBeNull();
  });

  it('el día anterior al vencimiento todavía bloquea', () => {
    expect(anonymizableFrom([{ dateTo: '2023-07-22' }], hoy)).toBe('2026-07-22');
  });

  it('una estancia FUTURA bloquea contando desde su salida, no desde hoy', () => {
    expect(anonymizableFrom([{ dateTo: '2026-08-15' }], hoy)).toBe('2029-08-15');
  });

  it('el plazo es configurable, pero por defecto es el legal', () => {
    expect(RETENTION.travellerRegistryYears).toBe(3);
    expect(anonymizableFrom([{ dateTo: '2026-03-14' }], hoy, 5)).toBe('2031-03-14');
  });
});

describe('isDueForAnonymization — la purga automática del cron', () => {
  const hoy = '2026-07-21';

  it('no purga a quien todavía está en plazo', () => {
    expect(isDueForAnonymization([{ dateTo: '2024-08-01' }], hoy)).toBe(false);
  });

  it('purga a quien pasó la ventana de producto (6 años, por encima del plazo legal)', () => {
    expect(RETENTION.defaultPurgeYears).toBe(6);
    expect(isDueForAnonymization([{ dateTo: '2020-07-20' }], hoy)).toBe(true);
  });

  it('la ventana de purga NUNCA puede ser menor que el plazo legal', () => {
    // Un tenant que configure 1 año no puede hacernos incumplir el RD 933/2021:
    // la purga se retrasa hasta que el plazo legal se cumple.
    expect(isDueForAnonymization([{ dateTo: '2025-01-01' }], hoy, 1)).toBe(false);
    expect(isDueForAnonymization([{ dateTo: '2022-01-01' }], hoy, 1)).toBe(true);
  });

  it('un huésped sin estancias no es candidato de la purga automática', () => {
    // Se puede anonimizar a petición, pero el cron no barre fichas sueltas:
    // sin estancia no hay fecha desde la que contar.
    expect(isDueForAnonymization([], hoy)).toBe(false);
  });
});
