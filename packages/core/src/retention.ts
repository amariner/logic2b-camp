/**
 * Plazos de conservación de datos personales (ADR 0026 §2.2 y §2.4).
 *
 * PURO, como el resto del motor: recibe fechas, devuelve fechas. Vive aquí y no en
 * la API porque es una regla de DOMINIO con consecuencia legal, y las reglas de
 * dominio se prueban solas.
 *
 * La asimetría que gobierna este módulo: borrar antes de tiempo incumple el
 * RD 933/2021 (registro de viajeros); borrar tarde incumple el art. 17 del RGPD.
 * Los dos errores se pagan, así que las dos fronteras se calculan explícitamente.
 */
import type { IsoDate } from './types';

export const RETENTION = {
  /**
   * Registro de viajeros — RD 933/2021: tres años desde la finalización de la
   * estancia. Mientras corre, los datos de identidad del huésped NO se pueden
   * suprimir aunque los pida el interesado.
   */
  travellerRegistryYears: 3,
  /**
   * Ventana por defecto de la purga automática. Seis años (conservación mercantil,
   * art. 30 del Código de Comercio) — deliberadamente POR ENCIMA del plazo legal
   * de identidad: una anonimización automática no tiene vuelta atrás, así que el
   * defecto de producto es el conservador.
   */
  defaultPurgeYears: 6,
} as const;

/** Lo único que este módulo necesita saber de una estancia: cuándo terminó. */
export type RetentionStay = { dateTo: IsoDate };

/**
 * Suma años a una fecha ISO sin salirse del mes.
 *
 * El 29 de febrero cae al 28 en año no bisiesto, nunca al 1 de marzo: irse al mes
 * siguiente alargaría la retención un día por encima del plazo legal.
 */
export function addYears(date: IsoDate, years: number): IsoDate {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  const targetYear = y + years;
  // días del mes de destino (el día 0 del mes siguiente es el último del mes)
  const lastDay = new Date(Date.UTC(targetYear, m, 0)).getUTCDate();
  const day = Math.min(d, lastDay);
  return `${String(targetYear).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Salida más tardía de todas las estancias, o null si no hay ninguna. */
export function lastStayEnd(stays: readonly RetentionStay[]): IsoDate | null {
  let last: IsoDate | null = null;
  for (const s of stays) if (last === null || s.dateTo > last) last = s.dateTo;
  return last;
}

/**
 * Fecha a partir de la cual se puede anonimizar a un huésped, o `null` si ya se puede.
 *
 * Devolver la fecha en vez de un booleano es la decisión de producto: un "no" sin
 * fecha es indistinguible de un producto que no sabe hacerlo. Con ella, el camping
 * puede responderle al interesado hasta cuándo y por qué.
 */
export function anonymizableFrom(
  stays: readonly RetentionStay[],
  today: IsoDate,
  years: number = RETENTION.travellerRegistryYears,
): IsoDate | null {
  const last = lastStayEnd(stays);
  if (last === null) return null;
  const deadline = addYears(last, years);
  return deadline > today ? deadline : null;
}

/**
 * ¿Le toca a este huésped la purga automática del cron?
 *
 * La ventana configurable NUNCA puede quedar por debajo del plazo legal: un tenant
 * que configure un año no puede hacernos incumplir el RD 933/2021.
 *
 * Sin estancias devuelve `false` a propósito: no hay fecha desde la que contar, así
 * que el cron no barre fichas sueltas. A petición del interesado sí se pueden
 * anonimizar (`anonymizableFrom` las autoriza) — pero eso es un acto deliberado.
 */
export function isDueForAnonymization(
  stays: readonly RetentionStay[],
  today: IsoDate,
  years: number = RETENTION.defaultPurgeYears,
): boolean {
  if (lastStayEnd(stays) === null) return false;
  const effective = Math.max(years, RETENTION.travellerRegistryYears);
  return anonymizableFrom(stays, today, effective) === null;
}
