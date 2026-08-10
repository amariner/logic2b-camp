#!/usr/bin/env tsx
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertValidRestoration,
  backupSnapshot,
  BACKUP_SNAPSHOT_SQL,
  type BackupSnapshot,
} from './backup-rehearsal';
import { sqlDumpArgs } from './export';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const [, , slug = 'demo'] = process.argv;

if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error('uso: pnpm backup:rehearse [slug]');
  process.exit(1);
}

const sourceConfig = join(REPO_ROOT, 'tenants', slug, 'wrangler.jsonc');
if (!existsSync(sourceConfig)) throw new Error(`No existe el tenant «${slug}»`);
const sourceDatabase = `logic-camp-${slug}`;
const temporary = mkdtempSync(join(tmpdir(), 'logic-camp-restore-'));
const dumpPath = join(temporary, `${slug}.sql`);
const schemaPath = join(temporary, `${slug}.schema.sql`);
const dataPath = join(temporary, `${slug}.data.sql`);
const restoreConfig = join(temporary, 'wrangler.json');
const restoreDatabase = `${sourceDatabase}-restore`;

function wrangler(args: string[]): string {
  return execFileSync('wrangler', args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 512 * 1024 * 1024,
  });
}

function snapshot(database: string, config: string): BackupSnapshot {
  return backupSnapshot(
    wrangler([
      'd1',
      'execute',
      database,
      '--local',
      '--config',
      config,
      '--command',
      BACKUP_SNAPSHOT_SQL,
      '--json',
    ]),
  );
}

try {
  writeFileSync(
    restoreConfig,
    JSON.stringify(
      {
        name: 'logic-camp-local-restore-rehearsal',
        compatibility_date: '2026-07-01',
        d1_databases: [
          {
            binding: 'DB',
            database_name: restoreDatabase,
            database_id: '00000000-0000-4000-8000-000000000011',
          },
        ],
      },
      null,
      2,
    ),
    'utf8',
  );

  console.log(`→ leyendo huella local de ${sourceDatabase}…`);
  const source = snapshot(sourceDatabase, sourceConfig);
  console.log(
    `  ${source.bookings} reservas · ${source.guests} huéspedes · ${source.payments} pagos`,
  );

  console.log('→ exportando SQL a un directorio temporal…');
  wrangler(sqlDumpArgs(sourceDatabase, sourceConfig, schemaPath, true, 'schema'));
  wrangler(sqlDumpArgs(sourceDatabase, sourceConfig, dataPath, true, 'data'));
  writeFileSync(
    dumpPath,
    `${readFileSync(schemaPath, 'utf8')}\n${readFileSync(dataPath, 'utf8')}`,
    'utf8',
  );

  console.log(`→ restaurando en la D1 local aislada ${restoreDatabase}…`);
  wrangler([
    'd1',
    'execute',
    restoreDatabase,
    '--local',
    '--config',
    restoreConfig,
    '--file',
    dumpPath,
    '-y',
  ]);

  console.log('→ comparando huellas e invariantes…');
  const restored = snapshot(restoreDatabase, restoreConfig);
  assertValidRestoration(source, restored);
  console.log(
    `OK: restauración íntegra (${source.bookings}/${source.guests}/${source.payments}); pagos y solapes = 0.`,
  );
} finally {
  // Solo se borra el directorio que acabamos de crear con mkdtemp.
  if (temporary.startsWith(join(tmpdir(), 'logic-camp-restore-'))) {
    rmSync(temporary, { recursive: true, force: true });
  }
}
