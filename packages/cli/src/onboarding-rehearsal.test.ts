import { execFile } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  assertLocalD1Args,
  runLocalOnboardingRehearsal,
  type LocalOnboardingRehearsalResult,
} from './onboarding-rehearsal';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const execFileAsync = promisify(execFile);

describe('frontera local del ensayo de onboarding', () => {
  it('rechaza cualquier orden D1 que no fuerce local o que pueda resolver remoto', () => {
    expect(() => assertLocalD1Args(['d1', 'execute', 'db', '--command', 'SELECT 1'])).toThrow(
      '--local',
    );
    expect(() =>
      assertLocalD1Args(['d1', 'execute', 'db', '--local', '--remote', '--command', 'SELECT 1']),
    ).toThrow('--remote');
    expect(() =>
      assertLocalD1Args(['d1', 'execute', 'db', '--local', '--command', 'SELECT 1']),
    ).not.toThrow();
  });

  it('limpia el temporal aunque falle antes de ejecutar Wrangler', () => {
    const temporaries = () =>
      readdirSync(tmpdir())
        .filter((entry) => entry.startsWith('logic-camp-onboarding-'))
        .sort();
    const before = temporaries();
    expect(() =>
      runLocalOnboardingRehearsal({
        repoRoot: join(tmpdir(), 'logic-camp-repo-inexistente'),
        identity: {
          slug: 'r13-failure',
          name: 'Camping R13 Failure',
          domain: 'r13-failure.example.test',
          zone: 'example.test',
        },
        seedYear: 2026,
      }),
    ).toThrow('Faltan los binarios locales');
    expect(temporaries()).toEqual(before);
  });

  it(
    'migra, siembra, rompe y restaura una D1 desechable sin tocar tenants/',
    // El ensayo levanta varias instancias locales de Wrangler. Se ejecuta en un
    // hijo para que sus llamadas síncronas no bloqueen el RPC interno de Vitest
    // cuando GitHub Actions tarda más de un minuto.
    { timeout: 180_000 },
    async () => {
      const slug = 'r13-local';
      const { stdout } = await execFileAsync(
        join(REPO_ROOT, 'packages', 'cli', 'node_modules', '.bin', 'tsx'),
        [join(REPO_ROOT, 'packages', 'cli', 'src', 'onboarding-rehearsal.child.ts')],
        {
          cwd: REPO_ROOT,
          encoding: 'utf8',
          maxBuffer: 16 * 1024 * 1024,
          timeout: 180_000,
        },
      );
      const result = JSON.parse(stdout) as LocalOnboardingRehearsalResult;

      expect(result.source.ownerEmail).toBe(`owner@${slug}.example.test`);
      expect(existsSync(result.temporaryDirectory)).toBe(false);
      expect(existsSync(join(REPO_ROOT, 'tenants', slug))).toBe(false);
      expect(result.migrationNames).toEqual([
        '0000_modelo-datos.sql',
        '0001_auth.sql',
        '0002_inventory-holds.sql',
        '0003_notifications-log-created-at.sql',
        '0004_checkin.sql',
        '0005_rgpd.sql',
        '0006_hospedajes.sql',
        '0007_scrub_payment_raw.sql',
        '0008_e_mejoras.sql',
        '0009_e_mejoras_access.sql',
        '0010_d1_budget.sql',
      ]);
      expect(result.firstMigrationFingerprint).toBe(result.secondMigrationFingerprint);
      expect(result.firstSeedSqlFingerprint).toBe(result.secondSeedSqlFingerprint);
      expect(result.source).toMatchObject({
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
        ownerEmail: `owner@${slug}.example.test`,
        paymentMismatches: 0,
        bookingOverlaps: 0,
      });
      expect(result.mutated.dataFingerprint).not.toBe(result.source.dataFingerprint);
      expect(result.restored).toEqual(result.source);
      expect(result.commands.length).toBeGreaterThan(0);
      expect(result.commands.every((command) => command.args.includes('--local'))).toBe(true);
      expect(result.commands.some((command) => command.args.includes('--remote'))).toBe(false);
      expect(result.timings.totalMs).toBeGreaterThan(0);
      expect(result.timings.phases.map((phase) => phase.name)).toEqual([
        'scaffold',
        'migrations',
        'seed',
        'backup',
        'restore',
        'activation',
      ]);
      expect(result.timings.phases.every((phase) => phase.durationMs >= 0)).toBe(true);
      expect(result.activation.profiles.map((profile) => profile.tier)).toEqual([1, 2, 3]);
      expect(result.activation.protectedSourcesFingerprintBefore).toBe(
        result.activation.protectedSourcesFingerprintAfter,
      );
      expect(result.operationalCost).toMatchObject({
        verdict: 'not_proven',
        automatedDurationMs: result.timings.totalMs,
      });
      expect(result.operationalCost.unmeasuredHumanBlocks).toEqual(
        expect.arrayContaining(['content_and_identity', 'inventory_and_tariffs', 'acceptance']),
      );
      expect(result.operationalCost.externalGates).toEqual(
        expect.arrayContaining(['cloudflare_resources', 'dns', 'providers', 'deploy']),
      );
    },
  );
});
