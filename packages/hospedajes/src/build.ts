/**
 * `buildParte` — el equivalente a `computeChargeAmount` de pagos: PURO y 100 %
 * testeable aquí (ADR 0028 §1). VALIDA antes de generar: recorre cada estancia y
 * cada huésped y, por cada dato que el parte exige y falta, emite un `ParteIssue`
 * con la reserva, el huésped y el campo. Si algo falta, devuelve `ok:false` con
 * TODOS los issues — el mostrador los arregla y reintenta, en vez de que el
 * ministerio rechace el envío entero por un campo.
 *
 * Las REGLAS de qué es obligatorio salen del RD 933/2021 (SES.Hospedajes); los
 * matices que dependen del formato exacto del webservice (códigos de país, de
 * parentesco) se cierran en `serializeParte` contra la especificación oficial.
 */
import type { ParteEstancia, ParteHuesped, ParteIssue, PartePayload } from './types';
import type { Establecimiento } from './types';

/** Menor de esta edad = conjunto de datos reducido (sin documento, con parentesco). */
export const EDAD_MENOR = 14;

/**
 * Edad en años cumplidos en la fecha `on`. Aritmética pura sobre ISO `YYYY-MM-DD`
 * (sin `Date`, para no arrastrar zona horaria en un dato que no la tiene).
 */
export function ageOn(birthdate: string, on: string): number {
  const [by, bm, bd] = birthdate.split('-').map(Number) as [number, number, number];
  const [oy, om, od] = on.split('-').map(Number) as [number, number, number];
  let age = oy - by;
  if (om < bm || (om === bm && od < bd)) age -= 1;
  return age;
}

type BuildResult = { ok: true; payload: PartePayload } | { ok: false; issues: ParteIssue[] };

export function buildParte(est: Establecimiento, estancias: ParteEstancia[]): BuildResult {
  const issues: ParteIssue[] = [];

  for (const e of estancias) {
    const stayIssue = (field: string, code: ParteIssue['code']) =>
      issues.push({
        bookingId: e.bookingId,
        bookingCode: e.bookingCode,
        guestId: null,
        guestName: null,
        field,
        code,
      });

    if (e.dateFrom >= e.dateTo) stayIssue('dates', 'invalid_dates');
    if (!e.paymentKind) stayIssue('paymentKind', 'missing_payment_kind');
    if (e.huespedes.length === 0) {
      stayIssue('guests', 'no_guests');
      continue;
    }

    for (const g of e.huespedes) {
      const nombre = `${g.name} ${g.surname}`.trim();
      const gIssue = (field: string, code: ParteIssue['code']) =>
        issues.push({
          bookingId: e.bookingId,
          bookingCode: e.bookingCode,
          guestId: g.guestId,
          guestName: nombre,
          field,
          code,
        });

      // La fecha de nacimiento es obligatoria SIEMPRE: sin ella no se puede saber
      // si el viajero es menor (y con ello qué otros datos se le exigen).
      if (!g.birthdate) {
        gIssue('birthdate', 'missing_birthdate');
        validateAdult(g, gIssue); // sin edad conocida, se le exige el set completo
        continue;
      }

      const esMenor = ageOn(g.birthdate, e.dateFrom) < EDAD_MENOR;
      if (esMenor) {
        // Menor de 14: identidad reducida + parentesco con el acompañante.
        if (!g.kinship) gIssue('kinship', 'missing_kinship');
      } else {
        validateAdult(g, gIssue);
      }
    }
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, payload: { establecimiento: est, estancias } };
}

/** Datos que el parte exige a un viajero de 14 o más años. */
function validateAdult(
  g: ParteHuesped,
  gIssue: (field: string, code: ParteIssue['code']) => void,
): void {
  if (!g.sex) gIssue('sex', 'missing_sex');
  if (!g.nationality) gIssue('nationality', 'missing_nationality');
  if (!g.docType) gIssue('docType', 'missing_doc_type');
  if (!g.docNumber) gIssue('docNumber', 'missing_doc_number');
  // El nº de soporte y el segundo apellido solo tienen sentido en documento español
  // (DNI/NIE); un pasaporte extranjero ni los tiene ni los pide el parte.
  if (g.docType === 'dni' || g.docType === 'nie') {
    if (!g.docSupportNumber) gIssue('docSupportNumber', 'missing_doc_support');
    if (!g.secondSurname) gIssue('secondSurname', 'missing_second_surname');
  }
}
