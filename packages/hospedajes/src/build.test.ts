import { describe, expect, it } from 'vitest';
import { ageOn, buildParte } from './build';
import type { Establecimiento, ParteEstancia, ParteHuesped } from './types';

const EST: Establecimiento = {
  codigo: 'CE-0001',
  nombre: 'Camping Cala Sereno',
  direccion: 'Ctra. del Faro s/n',
  municipio: 'Alcossebre',
  provincia: 'Castellón',
  cp: '12579',
};

/** Adulto español completo por defecto; se sobreescribe lo que cada test necesite. */
function huesped(over: Partial<ParteHuesped> = {}): ParteHuesped {
  return {
    guestId: 'gst_1',
    name: 'Ada',
    surname: 'Lovelace',
    secondSurname: 'Byron',
    sex: 'F',
    docType: 'dni',
    docNumber: '12345678Z',
    docSupportNumber: 'BAA123456',
    birthdate: '1990-12-10',
    nationality: 'ES',
    kinship: null,
    address: 'Calle Uno 1',
    phone: '600111222',
    email: 'ada@example.com',
    isLead: true,
    ...over,
  };
}

function estancia(huespedes: ParteHuesped[], over: Partial<ParteEstancia> = {}): ParteEstancia {
  return {
    bookingId: 'bkg_1',
    bookingCode: 'CS-0001',
    dateFrom: '2026-08-01',
    dateTo: '2026-08-05',
    checkedInAt: '2026-08-01T14:00:00.000Z',
    paymentKind: 'card',
    huespedes,
    ...over,
  };
}

describe('ageOn', () => {
  it('cuenta años cumplidos en la fecha dada', () => {
    expect(ageOn('1990-08-01', '2026-08-01')).toBe(36);
    expect(ageOn('1990-08-02', '2026-08-01')).toBe(35); // cumple mañana
    expect(ageOn('2012-08-01', '2026-08-01')).toBe(14); // justo 14 → adulto
    expect(ageOn('2012-08-02', '2026-08-01')).toBe(13); // aún 13 → menor
  });
});

describe('buildParte — estancia y pago', () => {
  it('un parte completo devuelve ok con el payload', () => {
    const r = buildParte(EST, [estancia([huesped()])]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.payload.establecimiento).toEqual(EST);
      expect(r.payload.estancias).toHaveLength(1);
    }
  });

  it('estancia sin forma de pago → issue de estancia (guestId null)', () => {
    const r = buildParte(EST, [estancia([huesped()], { paymentKind: null })]);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      const i = r.issues.find((x) => x.code === 'missing_payment_kind');
      expect(i).toBeDefined();
      expect(i?.guestId).toBeNull();
    }
  });

  it('estancia sin huéspedes → no_guests', () => {
    const r = buildParte(EST, [estancia([])]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.issues.some((x) => x.code === 'no_guests')).toBe(true);
  });

  it('fechas invertidas → invalid_dates', () => {
    const r = buildParte(EST, [estancia([huesped()], { dateFrom: '2026-08-05', dateTo: '2026-08-01' })]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.issues.some((x) => x.code === 'invalid_dates')).toBe(true);
  });
});

describe('buildParte — datos del viajero adulto', () => {
  it('adulto sin documento, sexo, soporte, 2º apellido y nacionalidad → un issue por campo', () => {
    const r = buildParte(EST, [
      estancia([
        huesped({
          sex: null,
          docType: null,
          docNumber: null,
          docSupportNumber: null,
          secondSurname: null,
          nationality: null,
        }),
      ]),
    ]);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      const codes = r.issues.map((x) => x.code).sort();
      // sin docType no se exige soporte/2º apellido (dependen de dni/nie) → 4 campos
      expect(codes).toEqual(
        ['missing_doc_number', 'missing_doc_type', 'missing_nationality', 'missing_sex'].sort(),
      );
      expect(r.issues[0]?.guestId).toBe('gst_1');
      expect(r.issues[0]?.guestName).toBe('Ada Lovelace');
    }
  });

  it('DNI sin nº de soporte ni segundo apellido → los reclama', () => {
    const r = buildParte(EST, [
      estancia([huesped({ docSupportNumber: null, secondSurname: null })]),
    ]);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.issues.some((x) => x.code === 'missing_doc_support')).toBe(true);
      expect(r.issues.some((x) => x.code === 'missing_second_surname')).toBe(true);
    }
  });

  it('pasaporte extranjero NO necesita nº de soporte ni segundo apellido', () => {
    const r = buildParte(EST, [
      estancia([
        huesped({
          docType: 'passport',
          docNumber: 'X1234567',
          docSupportNumber: null,
          secondSurname: null,
          nationality: 'GB',
        }),
      ]),
    ]);
    expect(r.ok).toBe(true);
  });

  it('sin fecha de nacimiento → missing_birthdate + se le exige el set de adulto', () => {
    const r = buildParte(EST, [estancia([huesped({ birthdate: null })])]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.issues.some((x) => x.code === 'missing_birthdate')).toBe(true);
  });
});

describe('buildParte — menores de 14', () => {
  it('menor con parentesco y sin documento → válido', () => {
    const menor = huesped({
      guestId: 'gst_2',
      name: 'Leo',
      birthdate: '2016-01-01', // 10 años en la estancia
      docType: null,
      docNumber: null,
      docSupportNumber: null,
      secondSurname: null,
      sex: null,
      nationality: null,
      kinship: 'hijo',
      isLead: false,
    });
    const r = buildParte(EST, [estancia([huesped(), menor])]);
    expect(r.ok).toBe(true);
  });

  it('menor sin parentesco → missing_kinship', () => {
    const menor = huesped({
      guestId: 'gst_2',
      birthdate: '2016-01-01',
      docType: null,
      docNumber: null,
      docSupportNumber: null,
      secondSurname: null,
      sex: null,
      nationality: null,
      kinship: null,
      isLead: false,
    });
    const r = buildParte(EST, [estancia([menor])]);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.issues).toHaveLength(1);
      expect(r.issues[0]?.code).toBe('missing_kinship');
    }
  });
});
