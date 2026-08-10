/**
 * `serializeParte` — convierte un `PartePayload` YA validado a un documento XML.
 *
 * ⚠️ HONESTIDAD (ADR 0028): el ESQUEMA exacto del webservice de SES.Hospedajes
 * (nombres de elementos, espacio de nombres, códigos de país/parentesco/pago) NO
 * está en contexto fiable y no se inventa de memoria. Este serializador produce un
 * XML **determinista, bien formado y con los datos correctamente escapados**, con
 * una estructura legible que refleja el modelo de datos: un borrador local para
 * revisión, no un fichero que se afirme compatible con la carga de la Sede. Cuando
 * haya acceso autorizado a la especificación autenticada, se ajustan aquí nombres y
 * códigos; la arquitectura (build → serialize → transport) no cambia.
 */
import type { PartePayload, ParteHuesped, PaymentKind, Sex } from './types';

/** Escape XML mínimo y suficiente para texto y atributos. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const el = (tag: string, value: string | null): string =>
  value == null || value === '' ? '' : `<${tag}>${escapeXml(value)}</${tag}>`;

/** Etiquetas provisionales (ver aviso de arriba): se cierran contra la espec SES. */
const SEXO: Record<Sex, string> = { M: 'V', F: 'M' }; // Varón / Mujer (provisional)
const PAGO: Record<PaymentKind, string> = {
  cash: 'EFECT',
  card: 'TARJT',
  transfer: 'TRANS',
  platform: 'PLATF',
};

function viajeroXml(g: ParteHuesped): string {
  const partes = [
    el('nombre', g.name),
    el('apellido1', g.surname),
    el('apellido2', g.secondSurname),
    g.sex ? el('sexo', SEXO[g.sex]) : '',
    el('tipoDocumento', g.docType),
    el('numeroDocumento', g.docNumber),
    el('numeroSoporte', g.docSupportNumber),
    el('fechaNacimiento', g.birthdate),
    el('nacionalidad', g.nationality),
    el('parentesco', g.kinship),
    el('telefono', g.phone),
    el('correo', g.email),
    el('direccion', g.address),
  ].filter(Boolean);
  return `      <viajero>\n        ${partes.join('\n        ')}\n      </viajero>`;
}

export function serializeParte(payload: PartePayload): string {
  const { establecimiento: est, estancias } = payload;
  const estanciasXml = estancias
    .map((e) => {
      const viajeros = e.huespedes.map(viajeroXml).join('\n');
      const pago = e.paymentKind ? ` tipo="${escapeXml(PAGO[e.paymentKind])}"` : '';
      return [
        '    <estancia>',
        `      ${el('referencia', e.bookingCode)}`,
        `      ${el('fechaEntrada', e.dateFrom)}`,
        `      ${el('fechaSalida', e.dateTo)}`,
        `      <pago${pago}/>`,
        '      <viajeros>',
        viajeros,
        '      </viajeros>',
        '    </estancia>',
      ].join('\n');
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<comunicacion>',
    `  <establecimiento codigo="${escapeXml(est.codigo)}">`,
    `    ${el('nombre', est.nombre)}`,
    `    ${el('direccion', est.direccion)}`,
    `    ${el('municipio', est.municipio)}`,
    `    ${el('provincia', est.provincia)}`,
    `    ${el('codigoPostal', est.cp)}`,
    '  </establecimiento>',
    '  <estancias>',
    estanciasXml,
    '  </estancias>',
    '</comunicacion>',
  ].join('\n');
}
