#!/usr/bin/env tsx
/**
 * `pnpm export:tenant <slug> [--local]` — volcado completo de la base de un camping
 * en SQL + los cuadros principales en CSV (ADR 0026 §4).
 *
 * Es la pieza que hace verdad la portabilidad que promete la ficha técnica. El
 * procedimiento completo, incluida la RESTAURACIÓN, está en `docs/RUNBOOK-COPIAS.md`.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CSV_TABLES, csvFileName, sqlDumpArgs, toCsv, type Cell } from './export';

/**
 * Raíz del monorepo. pnpm ejecuta este script con `cwd` en `packages/cli`, así que
 * las rutas relativas a `tenants/` no valen: se resuelven desde el propio fichero.
 */
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
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
 * La persistencia local predeterminada se resuelve desde el wrangler.jsonc. Al
 * compartir esa convención, exportación, consultas y servidor leen la misma D1.
 */
function wrangler(args: string[]): string {
  return execFileSync('wrangler', args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 512 * 1024 * 1024,
  });
}

mkdirSync(outDir, { recursive: true });

// 1. Volcado SQL completo — es el que vale para restaurar y el que se entrega
//    íntegro si un camping se va.
//
//    Wrangler 4.111 intercala cada tabla y sus INSERT. Con FKs, eso puede intentar
//    insertar `booking_guests` antes de crear `guests`. Se exportan esquema y
//    datos por separado y se concatenan en ese orden: un único SQL restaurable.
const sqlPath = join(outDir, `${slug}-${today}.sql`);
const schemaPath = join(outDir, `.${slug}-${today}.schema.tmp.sql`);
const dataPath = join(outDir, `.${slug}-${today}.data.tmp.sql`);
console.log(`→ volcado SQL ${local ? 'local ' : ''}de ${database}…`);
try {
  wrangler(sqlDumpArgs(database, configPath, schemaPath, local, 'schema'));
  wrangler(sqlDumpArgs(database, configPath, dataPath, local, 'data'));
  writeFileSync(
    sqlPath,
    `${readFileSync(schemaPath, 'utf8')}\n${readFileSync(dataPath, 'utf8')}`,
    'utf8',
  );
} finally {
  rmSync(schemaPath, { force: true });
  rmSync(dataPath, { force: true });
}
console.log(`  ${sqlPath}`);

// 2. Cuadros principales en CSV — para que se puedan abrir sin saber SQL.
for (const table of CSV_TABLES) {
  const raw = wrangler([
    'd1',
    'execute',
    database,
    local ? '--local' : '--remote',
    '--config',
    configPath,
    '--command',
    `SELECT * FROM ${table}`,
    '--json',
  ]);
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
