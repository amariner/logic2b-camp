import type { PlaceholderReport, TodoReport } from './scaffold';

export const READINESS_CATEGORIES = [
  'identity_legal',
  'content',
  'inventory_tariffs',
  'media_theme',
  'infrastructure',
] as const;

export type CandidateReadinessCategory = (typeof READINESS_CATEGORIES)[number];

export type CandidateReadinessBlocker = {
  category: CandidateReadinessCategory;
  code: string;
  path: string;
  count: number;
  blocksBuild: boolean;
  blocksPublish: boolean;
};

export type CandidateReadinessInput = {
  placeholders: PlaceholderReport[];
  todoFiles: TodoReport[];
  activation: {
    issues: Array<{ code: string; path: string }>;
    /** Nombres de verificaciones, nunca valores ni resultados inventados. */
    externalVerification: string[];
  };
};

export type CandidateReadinessReport = {
  buildReady: boolean;
  publishReady: boolean;
  blockers: CandidateReadinessBlocker[];
  summary: Record<CandidateReadinessCategory, number>;
};

function categoryFor(path: string): CandidateReadinessCategory {
  if (path === 'config.ts' || path === 'identity.json') return 'identity_legal';
  if (path.startsWith('content/')) return 'content';
  if (path === 'seed.ts' || path === 'data.ts') return 'inventory_tariffs';
  if (path === 'theme.css' || path === 'fotos.json' || path.startsWith('content/media/')) {
    return 'media_theme';
  }
  return 'infrastructure';
}

function safeCodePart(value: string): string {
  return value
    .replace(/^__|__$/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_');
}

function buildBlocker(
  category: CandidateReadinessCategory,
  code: string,
  path: string,
  count: number,
  blocksBuild: boolean,
): CandidateReadinessBlocker {
  return { category, code, path, count, blocksBuild, blocksPublish: true };
}

/**
 * Contrato puro del preflight. Clasifica evidencia ya extraída del scaffold y
 * de la matriz de activación; no ejecuta Astro, Wrangler, providers ni runners.
 */
export function candidateReadinessReport(input: CandidateReadinessInput): CandidateReadinessReport {
  const blockers: CandidateReadinessBlocker[] = [];
  const todoPaths = new Set(input.todoFiles.map((report) => report.file));

  for (const report of input.placeholders) {
    for (const marker of report.markers) {
      // __TODO__ ya viaja con su recuento real en todoFiles.
      if (marker === '__TODO__' && todoPaths.has(report.file)) continue;
      const category = categoryFor(report.file);
      blockers.push(
        buildBlocker(
          category,
          `placeholder.${safeCodePart(marker)}`,
          report.file,
          1,
          category !== 'infrastructure',
        ),
      );
    }
  }

  for (const report of input.todoFiles) {
    if (report.todoCount < 1) continue;
    const category = categoryFor(report.file);
    blockers.push(buildBlocker(category, 'todo.unresolved', report.file, report.todoCount, true));
  }

  for (const issue of input.activation.issues) {
    blockers.push(buildBlocker('infrastructure', `activation.${issue.code}`, issue.path, 1, true));
  }

  for (const name of input.activation.externalVerification) {
    blockers.push(
      buildBlocker('infrastructure', `external.${safeCodePart(name)}`, 'activation', 1, false),
    );
  }

  const unique = new Map<string, CandidateReadinessBlocker>();
  for (const blocker of blockers) {
    unique.set(`${blocker.code}\0${blocker.path}`, blocker);
  }
  const ordered = [...unique.values()].sort(
    (left, right) =>
      READINESS_CATEGORIES.indexOf(left.category) - READINESS_CATEGORIES.indexOf(right.category) ||
      left.path.localeCompare(right.path) ||
      left.code.localeCompare(right.code),
  );
  const summary = Object.fromEntries(
    READINESS_CATEGORIES.map((category) => [
      category,
      ordered
        .filter((blocker) => blocker.category === category)
        .reduce((total, blocker) => total + blocker.count, 0),
    ]),
  ) as Record<CandidateReadinessCategory, number>;

  return {
    buildReady: !ordered.some((blocker) => blocker.blocksBuild),
    publishReady: !ordered.some((blocker) => blocker.blocksPublish),
    blockers: ordered,
    summary,
  };
}
