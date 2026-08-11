import { describe, expect, it } from 'vitest';
import { candidateReadinessReport } from './candidate-readiness';

describe('preflight de readiness del candidato', () => {
  it('clasifica marcadores y TODOs por responsabilidad sin exponer valores', () => {
    const report = candidateReadinessReport({
      placeholders: [
        { file: 'config.ts', markers: ['__NIF__'] },
        { file: 'content/es.json', markers: ['__TODO__'] },
        { file: 'wrangler.jsonc', markers: ['__TODO_DATABASE_ID__'] },
      ],
      todoFiles: [
        { file: 'content/es.json', todoCount: 12 },
        { file: 'seed.ts', todoCount: 5 },
        { file: 'theme.css', todoCount: 7 },
      ],
      activation: {
        issues: [],
        externalVerification: ['database_binding', 'auth_secret_value', 'domain_dns'],
      },
    });

    expect(report.buildReady).toBe(false);
    expect(report.publishReady).toBe(false);
    expect(Object.keys(report.summary)).toEqual([
      'identity_legal',
      'content',
      'inventory_tariffs',
      'media_theme',
      'infrastructure',
    ]);
    expect(report.blockers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ category: 'identity_legal', path: 'config.ts' }),
        expect.objectContaining({ category: 'content', path: 'content/es.json', count: 12 }),
        expect.objectContaining({ category: 'inventory_tariffs', path: 'seed.ts', count: 5 }),
        expect.objectContaining({ category: 'media_theme', path: 'theme.css', count: 7 }),
        expect.objectContaining({
          category: 'infrastructure',
          code: 'external.database_binding',
          blocksBuild: false,
          blocksPublish: true,
        }),
      ]),
    );
  });

  it('separa candidato construible de publicación externa pendiente', () => {
    const report = candidateReadinessReport({
      placeholders: [],
      todoFiles: [],
      activation: {
        issues: [],
        externalVerification: ['database_binding', 'auth_secret_value', 'domain_dns'],
      },
    });

    expect(report.buildReady).toBe(true);
    expect(report.publishReady).toBe(false);
    expect(report.blockers.every((blocker) => blocker.blocksBuild === false)).toBe(true);
  });

  it('hace fallar build y publicación ante incoherencia config-seed-wrangler', () => {
    const report = candidateReadinessReport({
      placeholders: [],
      todoFiles: [],
      activation: {
        issues: [{ code: 'tier_mismatch', path: 'webConfig.tier' }],
        externalVerification: [],
      },
    });

    expect(report).toMatchObject({ buildReady: false, publishReady: false });
    expect(report.blockers).toContainEqual({
      category: 'infrastructure',
      code: 'activation.tier_mismatch',
      path: 'webConfig.tier',
      count: 1,
      blocksBuild: true,
      blocksPublish: true,
    });
  });
});
