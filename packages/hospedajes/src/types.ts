/**
 * Tipos del parte de viajeros (ADR 0028). Este paquete es PURO: `buildParte` y
 * `serializeParte` no tocan D1 ni la red — la entrada es plana, derivada de lo que
 * `apps/api` ya lee de la base. Espejo de `@logic-camp/payments` (ADR 0011).
 */

/** Fecha de estancia ISO `YYYY-MM-DD` sin zona, como todo el sistema. */
export type IsoDate = string;

export type DocKind = 'dni' | 'nie' | 'passport' | 'other';
export type Sex = 'M' | 'F';
/** Forma de pago de la operación. Códigos internos; `serializeParte` los mapea. */
export type PaymentKind = 'cash' | 'card' | 'transfer' | 'platform';

export interface ParteHuesped {
  /** Para señalar issues y enlazar a la ficha del huésped desde el dashboard. */
  guestId: string;
  name: string;
  surname: string;
  secondSurname: string | null;
  sex: Sex | null;
  docType: DocKind | null;
  docNumber: string | null;
  /** Nº de soporte del documento (distinto del número): lo pide el parte. */
  docSupportNumber: string | null;
  birthdate: IsoDate | null;
  /**
   * Nacionalidad tal como la guarda la ficha hoy: ISO 3166-1 **alpha-2**. La
   * especificación SES usa alpha-3; el mapeo se cierra en `serializeParte` contra
   * la especificación oficial, no aquí (ADR 0028).
   */
  nationality: string | null;
  /** Parentesco con el acompañante — SOLO para viajeros menores de 14. */
  kinship: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  isLead: boolean;
}

export interface ParteEstancia {
  bookingId: string;
  bookingCode: string;
  /** from inclusive / to exclusive, como todo el sistema. */
  dateFrom: IsoDate;
  dateTo: IsoDate;
  checkedInAt: string | null;
  /**
   * Medio de pago: dato PROPIO, no derivado de `payments.provider` (que es el
   * proveedor, no el medio). Nulo hasta que se capture (ADR 0028 §Contexto).
   */
  paymentKind: PaymentKind | null;
  huespedes: ParteHuesped[];
}

/** Datos del establecimiento que el parte repite en cada comunicación. */
export interface Establecimiento {
  /** Código de establecimiento asignado por SES.Hospedajes. */
  codigo: string;
  nombre: string;
  direccion: string;
  municipio: string;
  provincia: string;
  cp: string;
}

export type ParteIssueCode =
  | 'no_guests'
  | 'missing_payment_kind'
  | 'invalid_dates'
  | 'missing_doc_type'
  | 'missing_doc_number'
  | 'missing_doc_support'
  | 'missing_birthdate'
  | 'missing_sex'
  | 'missing_nationality'
  | 'missing_second_surname'
  | 'missing_kinship';

/**
 * Un dato que falta para poder comunicar. La recepcionista ve QUÉ falta y en qué
 * reserva/huésped — no un rechazo genérico del ministerio (ADR 0028 §1).
 */
export interface ParteIssue {
  bookingId: string;
  bookingCode: string;
  /** `null` = problema de la estancia (fechas, pago), no de un huésped concreto. */
  guestId: string | null;
  guestName: string | null;
  /** Nombre del campo, para que la UI lleve a rellenarlo. */
  field: string;
  code: ParteIssueCode;
}

/** Lo que `serializeParte` convierte al XML. Solo estancias YA validadas. */
export interface PartePayload {
  establecimiento: Establecimiento;
  estancias: ParteEstancia[];
}
