import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  assertLocalActivationPlan,
  protectedSourcesFingerprint,
  runLocalActivationRehearsal,
} from './activation-rehearsal';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

const byName = <T extends { name: string }>(rows: T[], name: string): T => {
  const row = rows.find((candidate) => candidate.name === name);
  if (!row) throw new Error(`No existe ${name}`);
  return row;
};

const temporaries = (): string[] =>
  readdirSync(tmpdir())
    .filter((entry) => entry.startsWith('logic-camp-activation-'))
    .sort();

describe('ensayo local del candidato de activación', () => {
  it('ignora artefactos generados pero detecta fuentes nuevas o modificadas', () => {
    const fakeRepo = mkdtempSync(join(tmpdir(), 'logic-camp-fingerprint-'));
    try {
      mkdirSync(join(fakeRepo, 'apps', 'site'), { recursive: true });
      mkdirSync(join(fakeRepo, 'packages', 'config'), { recursive: true });
      writeFileSync(join(fakeRepo, '.gitignore'), 'dist/\n', 'utf8');
      writeFileSync(join(fakeRepo, 'apps', 'site', 'source.ts'), 'export const value = 1;\n', 'utf8');
      writeFileSync(join(fakeRepo, 'packages', 'config', 'index.ts'), 'export {};\n', 'utf8');
      execFileSync('git', ['init', '--quiet'], { cwd: fakeRepo });
      execFileSync('git', ['add', '.gitignore', 'apps', 'packages'], { cwd: fakeRepo });

      const initial = protectedSourcesFingerprint(fakeRepo);
      mkdirSync(join(fakeRepo, 'apps', 'site', 'dist'));
      writeFileSync(join(fakeRepo, 'apps', 'site', 'dist', 'bundle.js'), 'generated\n', 'utf8');
      expect(protectedSourcesFingerprint(fakeRepo)).toBe(initial);

      writeFileSync(join(fakeRepo, 'apps', 'site', 'new-source.ts'), 'export {};\n', 'utf8');
      expect(protectedSourcesFingerprint(fakeRepo)).not.toBe(initial);
    } finally {
      rmSync(fakeRepo, { recursive: true, force: true });
    }
  });

  it('audita tiers 1/2/3 bajo un temporal con adaptadores none y solo nombres', () => {
    const before = temporaries();
    const slug = 'r13-candidate';
    const result = runLocalActivationRehearsal({
      repoRoot: REPO_ROOT,
      identity: {
        slug,
        name: 'Camping R13 Candidate',
        domain: `${slug}.example.test`,
        zone: 'example.test',
        address: 'Camí del Candidat, 13',
      },
    });

    expect(existsSync(result.temporaryDirectory)).toBe(false);
    expect(existsSync(join(REPO_ROOT, 'tenants', slug))).toBe(false);
    expect(temporaries()).toEqual(before);
    expect(result.scaffoldFiles).toBeGreaterThan(0);
    expect(result.scaffoldMarkers).toBeGreaterThan(0);
    expect(result.readiness).toMatchObject({ buildReady: false, publishReady: false });
    expect(result.readiness.summary).toMatchObject({
      identity_legal: expect.any(Number),
      content: expect.any(Number),
      inventory_tariffs: expect.any(Number),
      media_theme: expect.any(Number),
      infrastructure: expect.any(Number),
    });
    expect(result.readiness.blockers.some((blocker) => blocker.path === 'seed.ts')).toBe(true);
    expect(result.readiness.blockers.some((blocker) => blocker.path === 'theme.css')).toBe(true);
    expect(result.profiles.map((profile) => profile.tier)).toEqual([1, 2, 3]);
    expect(result.protectedSourcesFingerprintAfter).toBe(result.protectedSourcesFingerprintBefore);
    expect(result.candidateFingerprint).toMatch(/^[a-f0-9]{64}$/);

    for (const profile of result.profiles) {
      const { report } = profile;
      expect(report.tenant).toEqual({ slug, tier: profile.tier });
      expect(report.localSafe).toBe(true);
      expect(report.contractReady).toBe(true);
      expect(report.bindings.every((binding) => binding.status === 'configured')).toBe(true);
      expect(byName(report.adapters, 'auth')).toMatchObject({
        adapter: 'better-auth',
        status: 'configured',
      });
      expect(byName(report.adapters, 'payments')).toMatchObject({
        adapter: 'none',
        status: 'disabled',
      });
      expect(byName(report.adapters, 'notifications')).toMatchObject({
        adapter: 'disabled',
        status: 'disabled',
      });
      expect(byName(report.secrets, 'AUTH_SECRET').status).toBe('configured');
      expect(byName(report.secrets, 'RESEND_API_KEY').status).toBe('not_required');
      expect(byName(report.secrets, 'STRIPE_SECRET_KEY').status).toBe('not_required');
      expect(byName(report.secrets, 'STRIPE_WEBHOOK_SECRET').status).toBe('not_required');
      expect(byName(report.secrets, 'REDSYS_MERCHANT_KEY').status).toBe('not_required');
      expect(report.issues).toEqual([]);
      expect(report.externalVerification).toEqual([
        'database_binding',
        'auth_secret_value',
        'domain_dns',
      ]);
    }

    expect(result.unavailableProfiles).toEqual([expect.objectContaining({ name: 'automatiza' })]);
    expect(JSON.stringify(result)).not.toContain('cambia-esta-clave');
  });

  it('rechaza cualquier plan ejecutable antes de crear el temporal', () => {
    const before = temporaries();
    expect(() =>
      assertLocalActivationPlan([
        {
          command: 'wrangler d1 execute logic-camp-r13 --remote',
          note: 'nunca debe ejecutarse',
        },
      ]),
    ).toThrow('solo admite validaciones locales sin comandos');
    expect(temporaries()).toEqual(before);
  });

  it('limpia el temporal si el scaffold falla después de crearlo', () => {
    const before = temporaries();
    const fakeRepo = mkdtempSync(join(tmpdir(), 'logic-camp-fixture-'));
    try {
      mkdirSync(join(fakeRepo, 'apps'));
      mkdirSync(join(fakeRepo, 'packages'));
      expect(() =>
        runLocalActivationRehearsal({
          repoRoot: fakeRepo,
          identity: {
            slug: 'r13-failure',
            name: 'Camping R13 Failure',
            domain: 'r13-failure.example.test',
            zone: 'example.test',
          },
        }),
      ).toThrow();
      expect(temporaries()).toEqual(before);
    } finally {
      rmSync(fakeRepo, { recursive: true, force: true });
    }
  });
});
