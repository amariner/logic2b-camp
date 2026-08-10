import { existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { assertLocalD1Args, runLocalOnboardingRehearsal } from './onboarding-rehearsal';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

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
    { timeout: 60_000 },
    () => {
      const slug = 'r13-local';
      const result = runLocalOnboardingRehearsal({
        repoRoot: REPO_ROOT,
        identity: {
          slug,
          name: 'Camping R13 Local',
          domain: `${slug}.example.test`,
          zone: 'example.test',
        },
        seedYear: 2026,
      });

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
    },
  );
});
