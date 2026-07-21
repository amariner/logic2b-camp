#!/usr/bin/env tsx
/**
 * `pnpm export:tenant <slug> [--local]` — volcado completo de la base de un camping
 * en SQL + los cuadros principales en CSV (ADR 0026 §4).
 *
 * Es la pieza que hace verdad la portabilidad que promete la ficha técnica. El
 * procedimiento completo, incluida la RESTAURACIÓN, está en `docs/RUNBOOK-COPIAS.md`.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CSV_TABLES, csvFileName, sqlDumpArgs, toCsv, type Cell } from './export';

/**
 * Raíz del monorepo. pnpm ejecuta este script con `cwd` en `packages/cli`, así que
 * las rutas relativas a `tenants/` no valen: se resuelven desde el propio fichero.
 */
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
/** Mismo directorio de persistencia que usan `db:reset` y `db:seed`. */
const LOCAL_PERSIST = '.wrangler-demo';

const [, , slug, ...flags] = process.argv;
if (!slug) {
  console.error('uso: pnpm export:tenant <slug> [--local]\n');
  console.error('  <slug>   carpeta bajo tenants/ (p.ej. demo)');
  console.error('  --local  exporta la base local de desarrollo en vez de la remota');
  process.exit(1);
}

const local = flags.includes('--local');
const configPath = `tenants/${slug}/wrangler.jsonc`;
const database = `logic-camp-${slug}`;
const today = new Date().toISOString().slice(0, 10);
const outDir = join(REPO_ROOT, 'exports', `${slug}-${today}`);

/**
 * Se ejecuta con argumentos sueltos y desde la raíz: nada pasa por una shell.
 *
 * `persist` solo lo admite `d1 execute`; `d1 export` lo rechaza. Por eso el volcado
 * SQL local no es posible (ver abajo) en vez de producir un fichero vacío.
 */
function wrangler(args: string[], persist = false): string {
  const full = local && persist ? [...args, '--persist-to', LOCAL_PERSIST] : args;
  return execFileSync('wrangler', full, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 512 * 1024 * 1024,
  });
}

mkdirSync(outDir, { recursive: true });

// 1. Volcado SQL completo — es el que vale para restaurar y el que se entrega
//    íntegro si un camping se va.
//
//    En LOCAL no se hace, y se dice por qué: `wrangler d1 export` no acepta
//    `--persist-to`, así que leería el directorio por defecto —vacío— y escribiría
//    un .sql sin datos con aspecto de copia buena. Una copia falsa es peor que
//    ninguna, porque se descubre el día que hace falta restaurar.
if (local) {
  console.log('→ volcado SQL: OMITIDO en --local (d1 export no admite --persist-to).');
  console.log('  El volcado SQL es una operación de producción: usa el modo remoto.');
} else {
  const sqlPath = join(outDir, `${slug}-${today}.sql`);
  console.log(`→ volcado SQL de ${database}…`);
  wrangler(sqlDumpArgs(database, configPath, sqlPath));
  console.log(`  ${sqlPath}`);
}

// 2. Cuadros principales en CSV — para que se puedan abrir sin saber SQL.
for (const table of CSV_TABLES) {
  const raw = wrangler(
    [
      'd1',
      'execute',
      database,
      local ? '--local' : '--remote',
      '--config',
      configPath,
      '--command',
      `SELECT * FROM ${table}`,
      '--json',
    ],
    true,
  );
  // wrangler antepone líneas de cortesía al JSON; se recorta desde el primer corchete
  const parsed = JSON.parse(raw.slice(raw.indexOf('['))) as {
    results: Record<string, Cell>[];
  }[];
  const rows = parsed[0]?.results ?? [];
  const file = join(outDir, csvFileName(slug, table, today));
  writeFileSync(file, toCsv(rows), 'utf8');
  console.log(`  ${file} (${rows.length} filas)`);
}

console.log(`\nListo: ${outDir}`);
console.log('Restauración y verificación: docs/RUNBOOK-COPIAS.md');
