import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { assertValidRestoration, parseD1Rows, type BackupSnapshot } from './backup-rehearsal';
import { sqlDumpArgs } from './export';
import { scaffoldTenant, validateTenantIdentity, type TenantIdentity } from './scaffold';

const TEMPORARY_PREFIX = 'logic-camp-onboarding-';
const SOURCE_DATABASE = 'logic-camp-onboarding-source';
const RESTORED_DATABASE = 'logic-camp-onboarding-restored';

export type LocalD1Command = {
  args: string[];
};

export type OnboardingSnapshot = BackupSnapshot & {
  tenants: number;
  seasons: number;
  unitTypes: number;
  units: number;
  ratePlans: number;
  users: number;
  accounts: number;
  owners: number;
  ownerAccounts: number;
  ownerTenantMismatches: number;
  ownerEmail: string | null;
  schemaFingerprint: string;
  dataFingerprint: string;
};

export type LocalOnboardingRehearsalOptions = {
  repoRoot: string;
  identity: TenantIdentity;
  seedYear: number;
};

export type LocalOnboardingRehearsalResult = {
  temporaryDirectory: string;
  migrationNames: string[];
  firstMigrationFingerprint: string;
  secondMigrationFingerprint: string;
  firstSeedSqlFingerprint: string;
  secondSeedSqlFingerprint: string;
  source: OnboardingSnapshot;
  mutated: OnboardingSnapshot;
  restored: OnboardingSnapshot;
  commands: LocalD1Command[];
};

const ONBOARDING_SNAPSHOT_SQL = `
SELECT
  (SELECT COUNT(*) FROM tenants) AS tenants,
  (SELECT COUNT(*) FROM seasons_calendar) AS seasons,
  (SELECT COUNT(*) FROM unit_types) AS unit_types,
  (SELECT COUNT(*) FROM units) AS units,
  (SELECT COUNT(*) FROM rate_plans) AS rate_plans,
  (SELECT COUNT(*) FROM users) AS users,
  (SELECT COUNT(*) FROM accounts) AS accounts,
  (SELECT COUNT(*) FROM bookings) AS bookings,
  (SELECT COUNT(*) FROM guests) AS guests,
  (SELECT COUNT(*) FROM payments) AS payments,
  (SELECT MAX(created_at) FROM bookings) AS last_booking_created_at,
  (SELECT GROUP_CONCAT(name, '|') FROM (SELECT name FROM d1_migrations ORDER BY id)) AS migrations,
  (SELECT COUNT(*) FROM users WHERE role = 'owner') AS owners,
  (SELECT COUNT(*) FROM users u JOIN accounts a ON a.user_id = u.id
    WHERE u.role = 'owner' AND a.provider_id = 'credential'
      AND a.password IS NOT NULL AND LENGTH(a.password) > 0) AS owner_accounts,
  (SELECT COUNT(*) FROM users u LEFT JOIN tenants t ON t.id = u.tenant_id
    WHERE u.role = 'owner' AND t.id IS NULL) AS owner_tenant_mismatches,
  (SELECT GROUP_CONCAT(email, '|') FROM (SELECT email FROM users WHERE role = 'owner' ORDER BY id)) AS owner_email,
  (SELECT COUNT(*) FROM (
    SELECT b.id
    FROM bookings b LEFT JOIN payments p ON p.booking_id = b.id
    GROUP BY b.id
    HAVING b.paid_cents != COALESCE(SUM(p.amount_cents), 0)
  )) AS payment_mismatches,
  (SELECT COUNT(*) FROM bookings a JOIN bookings b
    ON a.unit_id = b.unit_id AND a.id < b.id
   AND a.date_from < b.date_to AND b.date_from < a.date_to
    WHERE a.unit_id IS NOT NULL
      AND a.status IN ('confirmed', 'completed')
      AND b.status IN ('confirmed', 'completed')) AS booking_overlaps,
  (SELECT GROUP_CONCAT(json_array(type, name, tbl_name, sql), CHAR(10)) FROM (
    SELECT type, name, tbl_name, sql FROM sqlite_schema
    WHERE name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%'
    ORDER BY type, name
  )) AS schema_rows,
  COALESCE((SELECT GROUP_CONCAT(json_array('tenants', id, slug, name, tier, timezone, currency, locales, modules), CHAR(10)) FROM (SELECT * FROM tenants ORDER BY id)), '') || CHAR(10) ||
  COALESCE((SELECT GROUP_CONCAT(json_array('seasons_calendar', id, tenant_id, name, date_from, date_to, priority, is_open), CHAR(10)) FROM (SELECT * FROM seasons_calendar ORDER BY id)), '') || CHAR(10) ||
  COALESCE((SELECT GROUP_CONCAT(json_array('unit_types', id, tenant_id, kind, name_i18n, capacity_min, capacity_max, included_persons, features, photos), CHAR(10)) FROM (SELECT * FROM unit_types ORDER BY id)), '') || CHAR(10) ||
  COALESCE((SELECT GROUP_CONCAT(json_array('units', id, tenant_id, unit_type_id, code, attributes, status), CHAR(10)) FROM (SELECT * FROM units ORDER BY id)), '') || CHAR(10) ||
  COALESCE((SELECT GROUP_CONCAT(json_array('rate_plans', id, tenant_id, unit_type_id, season_id, base_cents, extra_person_cents, child_cents, pet_cents, electricity_cents, vehicle_cents, min_stay, max_stay, arrival_days, departure_days), CHAR(10)) FROM (SELECT * FROM rate_plans ORDER BY id)), '') || CHAR(10) ||
  COALESCE((SELECT GROUP_CONCAT(json_array('rate_rules', id, tenant_id, type, conditions, discount, stackable, priority), CHAR(10)) FROM (SELECT * FROM rate_rules ORDER BY id)), '') || CHAR(10) ||
  COALESCE((SELECT GROUP_CONCAT(json_array('extras', id, tenant_id, name_i18n, price_cents, per, required), CHAR(10)) FROM (SELECT * FROM extras ORDER BY id)), '') || CHAR(10) ||
  COALESCE((SELECT GROUP_CONCAT(json_array('inventory_blocks', id, tenant_id, unit_id, unit_type_id, date_from, date_to, reason), CHAR(10)) FROM (SELECT * FROM inventory_blocks ORDER BY id)), '') || CHAR(10) ||
  COALESCE((SELECT GROUP_CONCAT(json_array('guests', id, tenant_id, name, surname, doc_type, doc_number, birthdate, nationality, email, phone, address, gdpr_consent_at, anonymized_at, gdpr_consent_version, sex, second_surname, doc_support_number, kinship), CHAR(10)) FROM (SELECT * FROM guests ORDER BY id)), '') || CHAR(10) ||
  COALESCE((SELECT GROUP_CONCAT(json_array('bookings', id, tenant_id, code, status, channel, date_from, date_to, unit_type_id, unit_id, occupancy, extras, price_breakdown, total_cents, paid_cents, tourist_tax_cents, deposit_cents, notes, locale, created_at, updated_at, checked_in_at, checked_out_at, payment_kind), CHAR(10)) FROM (SELECT * FROM bookings ORDER BY id)), '') || CHAR(10) ||
  COALESCE((SELECT GROUP_CONCAT(json_array('booking_guests', booking_id, guest_id, is_lead), CHAR(10)) FROM (SELECT * FROM booking_guests ORDER BY booking_id, guest_id)), '') || CHAR(10) ||
  COALESCE((SELECT GROUP_CONCAT(json_array('payments', id, booking_id, provider, provider_ref, amount_cents, status, raw, created_at), CHAR(10)) FROM (SELECT * FROM payments ORDER BY id)), '') || CHAR(10) ||
  COALESCE((SELECT GROUP_CONCAT(json_array('enquiries', id, tenant_id, status, date_from, date_to, occupancy, unit_type_id, message, contact, locale, source, converted_booking_id, created_at), CHAR(10)) FROM (SELECT * FROM enquiries ORDER BY id)), '') || CHAR(10) ||
  COALESCE((SELECT GROUP_CONCAT(json_array('users', id, tenant_id, email, role, name, email_verified, image, created_at, updated_at), CHAR(10)) FROM (SELECT * FROM users ORDER BY id)), '') || CHAR(10) ||
  COALESCE((SELECT GROUP_CONCAT(json_array('accounts', id, user_id, account_id, provider_id, password, access_token, refresh_token, id_token, access_token_expires_at, refresh_token_expires_at, scope, created_at, updated_at), CHAR(10)) FROM (SELECT * FROM accounts ORDER BY id)), '') || CHAR(10) ||
  COALESCE((SELECT GROUP_CONCAT(json_array('meta', key, value), CHAR(10)) FROM (SELECT * FROM meta ORDER BY key)), '') AS data_rows
`;

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function numberCell(row: Record<string, unknown>, key: string): number {
  const value = row[key];
  if (typeof value !== 'number') throw new Error(`Huella de onboarding inválida: ${key}`);
  return value;
}

export function onboardingSnapshot(raw: string): OnboardingSnapshot {
  const row = parseD1Rows(raw)[0];
  if (!row) throw new Error('Huella de onboarding inválida: no hay filas');
  const migrations = row.migrations;
  const ownerEmail = row.owner_email;
  const schemaRows = row.schema_rows;
  const dataRows = row.data_rows;
  const lastBookingCreatedAt = row.last_booking_created_at;
  if (typeof migrations !== 'string' || migrations.length === 0) {
    throw new Error('Huella de onboarding inválida: no hay migraciones');
  }
  if (ownerEmail !== null && typeof ownerEmail !== 'string') {
    throw new Error('Huella de onboarding inválida: owner_email');
  }
  if (dataRows !== null && typeof dataRows !== 'string') {
    throw new Error('Huella de onboarding inválida: data_rows');
  }
  if (typeof schemaRows !== 'string' || schemaRows.length === 0) {
    throw new Error('Huella de onboarding inválida: schema_rows');
  }
  if (lastBookingCreatedAt !== null && typeof lastBookingCreatedAt !== 'string') {
    throw new Error('Huella de onboarding inválida: last_booking_created_at');
  }
  return {
    tenants: numberCell(row, 'tenants'),
    seasons: numberCell(row, 'seasons'),
    unitTypes: numberCell(row, 'unit_types'),
    units: numberCell(row, 'units'),
    ratePlans: numberCell(row, 'rate_plans'),
    users: numberCell(row, 'users'),
    accounts: numberCell(row, 'accounts'),
    bookings: numberCell(row, 'bookings'),
    guests: numberCell(row, 'guests'),
    payments: numberCell(row, 'payments'),
    lastBookingCreatedAt,
    migrations,
    owners: numberCell(row, 'owners'),
    ownerAccounts: numberCell(row, 'owner_accounts'),
    ownerTenantMismatches: numberCell(row, 'owner_tenant_mismatches'),
    ownerEmail,
    paymentMismatches: numberCell(row, 'payment_mismatches'),
    bookingOverlaps: numberCell(row, 'booking_overlaps'),
    schemaFingerprint: sha256(schemaRows),
    dataFingerprint: sha256(dataRows ?? ''),
  };
}

/** Toda invocación D1 de este ensayo debe declarar local de forma positiva. */
export function assertLocalD1Args(args: readonly string[]): void {
  if (args.includes('--remote')) {
    throw new Error('El ensayo local rechaza --remote');
  }
  if (!args.includes('--local')) {
    throw new Error('El ensayo local exige --local');
  }
}

function backupPart(snapshot: OnboardingSnapshot): BackupSnapshot {
  return {
    bookings: snapshot.bookings,
    guests: snapshot.guests,
    payments: snapshot.payments,
    lastBookingCreatedAt: snapshot.lastBookingCreatedAt,
    migrations: snapshot.migrations,
    paymentMismatches: snapshot.paymentMismatches,
    bookingOverlaps: snapshot.bookingOverlaps,
  };
}

function assertInitialState(snapshot: OnboardingSnapshot, identity: TenantIdentity): void {
  const expectedCounts = {
    tenants: 1,
    seasons: 1,
    unitTypes: 1,
    units: 3,
    ratePlans: 1,
    users: 1,
    accounts: 1,
    owners: 1,
    ownerAccounts: 1,
    ownerTenantMismatches: 0,
  } as const;
  for (const [key, expected] of Object.entries(expectedCounts)) {
    if (snapshot[key as keyof typeof expectedCounts] !== expected) {
      throw new Error(`Seed inicial incoherente: ${key} debe ser ${expected}`);
    }
  }
  if (snapshot.ownerEmail !== `owner@${identity.domain}`) {
    throw new Error(`Seed inicial incoherente: owner esperado en ${identity.domain}`);
  }
  assertValidRestoration(backupPart(snapshot), backupPart(snapshot));
}

function assertRestored(source: OnboardingSnapshot, restored: OnboardingSnapshot): void {
  assertValidRestoration(backupPart(source), backupPart(restored));
  if (JSON.stringify(source) !== JSON.stringify(restored)) {
    throw new Error('La restauración no recuperó la huella completa del onboarding');
  }
}

function localOnlyEnvironment(seedYear?: number): NodeJS.ProcessEnv {
  const environment = { ...process.env };
  for (const key of [
    'CLOUDFLARE_API_TOKEN',
    'CLOUDFLARE_API_KEY',
    'CLOUDFLARE_EMAIL',
    'CLOUDFLARE_ACCOUNT_ID',
    'CF_API_TOKEN',
    'CF_API_KEY',
    'CF_EMAIL',
  ]) {
    delete environment[key];
  }
  environment.CI = '1';
  environment.WRANGLER_SEND_METRICS = 'false';
  if (seedYear !== undefined) environment.SEED_YEAR = String(seedYear);
  return environment;
}

function writeLocalConfig(path: string): void {
  writeFileSync(
    path,
    JSON.stringify(
      {
        name: 'logic-camp-local-onboarding-rehearsal',
        compatibility_date: '2026-07-01',
        d1_databases: [
          {
            binding: 'DB_SOURCE',
            database_name: SOURCE_DATABASE,
            database_id: '00000000-0000-4000-8000-000000000101',
            migrations_dir: './migrations',
          },
          {
            binding: 'DB_RESTORED',
            database_name: RESTORED_DATABASE,
            database_id: '00000000-0000-4000-8000-000000000102',
            migrations_dir: './migrations',
          },
        ],
      },
      null,
      2,
    ),
    'utf8',
  );
}

export function runLocalOnboardingRehearsal(
  options: LocalOnboardingRehearsalOptions,
): LocalOnboardingRehearsalResult {
  const identity = validateTenantIdentity(options.identity);
  if (!Number.isInteger(options.seedYear) || options.seedYear < 2000 || options.seedYear > 2200) {
    throw new Error('seedYear debe ser un año entero entre 2000 y 2200');
  }

  const repoRoot = resolve(options.repoRoot);
  const temporaryDirectory = mkdtempSync(join(tmpdir(), TEMPORARY_PREFIX));
  const commands: LocalD1Command[] = [];
  const wranglerExecutable = join(repoRoot, 'node_modules', '.bin', 'wrangler');
  const tsxExecutable = join(repoRoot, 'packages', 'cli', 'node_modules', '.bin', 'tsx');
  if (!existsSync(wranglerExecutable) || !existsSync(tsxExecutable)) {
    rmSync(temporaryDirectory, { recursive: true, force: true });
    throw new Error('Faltan los binarios locales de wrangler o tsx; ejecuta pnpm install');
  }

  const configPath = join(temporaryDirectory, 'wrangler.json');
  const migrationsPath = join(temporaryDirectory, 'migrations');
  const tenantsPath = join(temporaryDirectory, 'tenants');
  const dumpSchemaPath = join(temporaryDirectory, 'onboarding.schema.sql');
  const dumpDataPath = join(temporaryDirectory, 'onboarding.data.sql');
  const dumpPath = join(temporaryDirectory, 'onboarding.sql');

  function runD1(args: string[]): string {
    assertLocalD1Args(args);
    commands.push({ args: [...args] });
    try {
      return execFileSync(wranglerExecutable, args, {
        cwd: temporaryDirectory,
        encoding: 'utf8',
        env: localOnlyEnvironment(),
        maxBuffer: 512 * 1024 * 1024,
      });
    } catch (error) {
      const detail =
        typeof error === 'object' && error !== null && 'stderr' in error && String(error.stderr)
          ? String(error.stderr)
          : typeof error === 'object' && error !== null && 'stdout' in error
            ? String(error.stdout)
            : error instanceof Error
              ? error.message
              : String(error);
      throw new Error(`Wrangler local falló: ${detail.trim()}`, { cause: error });
    }
  }

  function snapshot(database: string): OnboardingSnapshot {
    return onboardingSnapshot(
      runD1([
        'd1',
        'execute',
        database,
        '--local',
        '--config',
        configPath,
        '--command',
        ONBOARDING_SNAPSHOT_SQL,
        '--json',
      ]),
    );
  }

  let result!: LocalOnboardingRehearsalResult;
  try {
    cpSync(join(repoRoot, 'packages', 'db', 'migrations'), migrationsPath, {
      recursive: true,
      dereference: false,
    });
    writeLocalConfig(configPath);
    const scaffold = scaffoldTenant(join(repoRoot, 'tenants', '_template'), tenantsPath, identity, {
      generatedOn: '2026-08-10',
    });
    const seedPath = join(scaffold.targetDir, 'seed.sql');
    const writeSeedPath = join(scaffold.targetDir, 'write-seed.ts');

    runD1(['d1', 'migrations', 'apply', SOURCE_DATABASE, '--local', '--config', configPath]);
    const firstMigrations = snapshot(SOURCE_DATABASE);
    runD1(['d1', 'migrations', 'apply', SOURCE_DATABASE, '--local', '--config', configPath]);
    const secondMigrations = snapshot(SOURCE_DATABASE);
    const firstMigrationFingerprint = sha256(firstMigrations.migrations);
    const secondMigrationFingerprint = sha256(secondMigrations.migrations);
    if (firstMigrationFingerprint !== secondMigrationFingerprint) {
      throw new Error('Aplicar migraciones por segunda vez cambió su huella');
    }

    execFileSync(tsxExecutable, [writeSeedPath], {
      cwd: scaffold.targetDir,
      encoding: 'utf8',
      env: localOnlyEnvironment(options.seedYear),
    });
    const firstSeedSqlFingerprint = sha256(readFileSync(seedPath, 'utf8'));
    rmSync(seedPath);
    execFileSync(tsxExecutable, [writeSeedPath], {
      cwd: scaffold.targetDir,
      encoding: 'utf8',
      env: localOnlyEnvironment(options.seedYear),
    });
    const secondSeedSqlFingerprint = sha256(readFileSync(seedPath, 'utf8'));
    if (firstSeedSqlFingerprint !== secondSeedSqlFingerprint) {
      throw new Error('El seed no es determinista para el mismo año');
    }

    runD1([
      'd1',
      'execute',
      SOURCE_DATABASE,
      '--local',
      '--config',
      configPath,
      '--file',
      seedPath,
      '-y',
    ]);
    const source = snapshot(SOURCE_DATABASE);
    assertInitialState(source, identity);

    runD1(sqlDumpArgs(SOURCE_DATABASE, configPath, dumpSchemaPath, true, 'schema'));
    runD1(sqlDumpArgs(SOURCE_DATABASE, configPath, dumpDataPath, true, 'data'));
    writeFileSync(
      dumpPath,
      `${readFileSync(dumpSchemaPath, 'utf8')}\n${readFileSync(dumpDataPath, 'utf8')}`,
      'utf8',
    );

    runD1([
      'd1',
      'execute',
      SOURCE_DATABASE,
      '--local',
      '--config',
      configPath,
      '--command',
      "DELETE FROM accounts WHERE provider_id = 'credential'",
      '-y',
    ]);
    const mutated = snapshot(SOURCE_DATABASE);
    if (mutated.dataFingerprint === source.dataFingerprint || mutated.ownerAccounts !== 0) {
      throw new Error('La mutación de control no alteró la huella del owner');
    }

    runD1([
      'd1',
      'execute',
      RESTORED_DATABASE,
      '--local',
      '--config',
      configPath,
      '--file',
      dumpPath,
      '-y',
    ]);
    const restored = snapshot(RESTORED_DATABASE);
    assertRestored(source, restored);

    result = {
      temporaryDirectory,
      migrationNames: source.migrations.split('|'),
      firstMigrationFingerprint,
      secondMigrationFingerprint,
      firstSeedSqlFingerprint,
      secondSeedSqlFingerprint,
      source,
      mutated,
      restored,
      commands,
    };
  } finally {
    const allowedPrefix = join(tmpdir(), TEMPORARY_PREFIX);
    if (temporaryDirectory.startsWith(allowedPrefix)) {
      rmSync(temporaryDirectory, { recursive: true, force: true });
    }
  }
  return result;
}
