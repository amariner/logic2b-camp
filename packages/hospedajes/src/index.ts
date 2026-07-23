export { ageOn, buildParte, EDAD_MENOR } from './build';
export { escapeXml, serializeParte } from './serialize';
export {
  manualTransport,
  sesTransport,
  type HospedajesTransport,
  type SendResult,
  type SesCredentials,
} from './transport';
export type {
  DocKind,
  Establecimiento,
  IsoDate,
  ParteEstancia,
  ParteHuesped,
  ParteIssue,
  ParteIssueCode,
  PartePayload,
  PaymentKind,
  Sex,
} from './types';
