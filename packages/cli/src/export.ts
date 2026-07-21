/**
 * Exportación de la base de un camping (ADR 0026 §4).
 *
 * Existe porque la ficha técnica publicada promete un volcado en SQL y en CSV, y
 * porque la portabilidad del cliente no puede depender de que alguien recuerde la
 * invocación correcta de `wrangler` un día de agosto.
 *
 * La decisión de fondo del bloque 4: NO montamos un pipeline de copias propio. El
 * point-in-time recovery de Cloudflare es continuo y mejor que lo que
 * construiríamos con 6h/semana. Lo que sí hace falta es que exportar y RESTAURAR
 * estén escritos y probados — ver `docs/RUNBOOK-COPIAS.md`.
 */

/**
 * Cuadros que se entregan en CSV. Son los que un camping mira cuando se va: las
 * reservas, quién era quién y qué se cobró.
 */
export const CSV_TABLES = ['bookings', 'guests', 'payments'] as const;
export type CsvTable = (typeof CSV_TABLES)[number];

/** Un valor de D1 tal y como sale de `wrangler d1 execute --json`. */
export type Cell = string | number | boolean | null;

/**
 * Escapa un campo para CSV (RFC 4180).
 *
 * `null` se emite VACÍO y no como la cadena "null": en un CSV que va a abrirse con
 * una hoja de cálculo, "null" es un dato y un hueco es un hueco.
 */
export function csvCell(value: Cell): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

/**
 * Filas → CSV con cabecera.
 *
 * Las columnas se toman de la UNIÓN de todas las filas, no de la primera: D1
 * devuelve JSON por fila y una fila con un campo nulo puede traer menos claves.
 * Tomando solo la primera se perderían columnas enteras en silencio.
 */
export function toCsv(rows: readonly Record<string, Cell>[]): string {
  if (!rows.length) return '';
  const columns: string[] = [];
  for (const row of rows) {
    for (const key of Object.keys(row)) if (!columns.includes(key)) columns.push(key);
  }
  const lines = [columns.join(',')];
  for (const row of rows) lines.push(columns.map((c) => csvCell(row[c] ?? null)).join(','));
  return `${lines.join('\n')}\n`;
}

/** Nombre de fichero estable y ordenable: `{slug}-{tabla}-{fecha}.csv`. */
export function csvFileName(slug: string, table: string, isoDate: string): string {
  return `${slug}-${table}-${isoDate}.csv`;
}

/**
 * Comando de volcado SQL completo. Se devuelve como array de argumentos —no como
 * cadena— para que el slug no pueda inyectar nada en una shell.
 */
export function sqlDumpArgs(databaseName: string, configPath: string, output: string): string[] {
  return ['d1', 'export', databaseName, '--remote', '--config', configPath, '--output', output];
}
