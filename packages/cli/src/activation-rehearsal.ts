import {
  ACTIVATION_SECRET_NAMES,
  auditTenantActivation,
  notificationKinds,
  type ActivationAuditInput,
  type ActivationAuditReport,
  type ActivationWorkerConfig,
} from '@logic-camp/config';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  lstatSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { candidateReadinessReport, type CandidateReadinessReport } from './candidate-readiness';
import type { PlanStep } from './plan';
import { scaffoldTenant, validateTenantIdentity, type TenantIdentity } from './scaffold';

const TEMPORARY_PREFIX = 'logic-camp-activation-';
const SYNTHETIC_DATABASE_ID = '00000000-0000-4000-8000-000000000130';
const SKIP_FINGERPRINT_DIRS = new Set(['node_modules', 'dist', '.turbo', '.wrangler']);

export type TechnicalTier = 1 | 2 | 3;

export type ActivationProfileResult = {
  tier: TechnicalTier;
  report: ActivationAuditReport;
};

export type LocalActivationRehearsalOptions = {
  repoRoot: string;
  identity: TenantIdentity;
  /** Solo nombres. Un valor o un par NOMBRE=valor se rechaza. */
  configuredSecretNames?: string[];
  tiers?: TechnicalTier[];
  /** Plan opcional para acreditar el preflight; el ensayo normal no tiene comandos. */
  plan?: PlanStep[];
  inspectorRunner?: LocalInspectorRunner;
};

export type LocalActivationRehearsalResult = {
  temporaryDirectory: string;
  scaffoldFiles: number;
  scaffoldMarkers: number;
  candidateFingerprint: string;
  protectedSourcesFingerprintBefore: string;
  protectedSourcesFingerprintAfter: string;
  inspectedFiles: ['config.ts', 'seed.ts', 'wrangler.jsonc'];
  candidates: ActivationProfileResult[];
  /** Alias descriptivo conservado para consumidores del primer corte. */
  profiles: ActivationProfileResult[];
  unavailableProfiles: Array<{ name: 'automatiza'; reason: string }>;
  readiness: CandidateReadinessReport;
};

export type LocalInspectorRunner = (executable: string, args: string[], cwd: string) => string;

function sha256(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex');
}

/**
 * El candidato local no ejecuta infraestructura. Si alguien intenta reutilizar
 * el plan de alta real, se rechaza entero antes de que exista un runner.
 */
export function assertLocalActivationPlan(steps: readonly PlanStep[]): void {
  const executable = steps.find((step) => step.command !== null);
  if (executable) {
    throw new Error(
      `El candidato de activación solo admite validaciones locales sin comandos; rechazado: ${executable.command}`,
    );
  }
}

function stripJsonComments(source: string): string {
  let output = '';
  let inString = false;
  let escaped = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]!;
    const next = source[index + 1];
    if (inString) {
      output += character;
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') {
      inString = true;
      output += character;
      continue;
    }
    if (character === '/' && next === '/') {
      while (index < source.length && source[index] !== '\n') index += 1;
      output += '\n';
      continue;
    }
    if (character === '/' && next === '*') {
      index += 2;
      while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) {
        if (source[index] === '\n') output += '\n';
        index += 1;
      }
      index += 1;
      continue;
    }
    output += character;
  }
  return output;
}

/** Parser acotado al JSONC de Wrangler: comentarios y comas finales. */
export function parseWorkerJsonc(source: string): ActivationWorkerConfig {
  const withoutComments = stripJsonComments(source);
  const withoutTrailingCommas = withoutComments.replace(/,\s*([}\]])/g, '$1');
  return JSON.parse(withoutTrailingCommas) as ActivationWorkerConfig;
}

function fingerprintFiles(root: string): string {
  const hash = createHash('sha256');

  function walk(directory: string): void {
    for (const entry of readdirSync(directory).sort()) {
      if (SKIP_FINGERPRINT_DIRS.has(entry)) continue;
      const path = join(directory, entry);
      const stat = lstatSync(path);
      if (stat.isSymbolicLink()) continue;
      if (stat.isDirectory()) walk(path);
      else if (stat.isFile()) {
        hash.update(relative(root, path));
        hash.update('\0');
        hash.update(readFileSync(path));
        hash.update('\0');
      }
    }
  }

  walk(root);
  return hash.digest('hex');
}

export function protectedSourcesFingerprint(repoRoot: string): string {
  const hash = createHash('sha256');
  for (const directory of ['apps', 'packages']) {
    const path = join(repoRoot, directory);
    hash.update(directory);
    hash.update(fingerprintFiles(path));
  }
  return hash.digest('hex');
}

function assertSecretNames(names: readonly string[]): void {
  const allowed = new Set<string>(ACTIVATION_SECRET_NAMES);
  for (const name of names) {
    if (!/^[A-Z][A-Z0-9_]*$/.test(name) || !allowed.has(name)) {
      throw new Error(`nombre de secret inválido o desconocido: ${name}`);
    }
  }
}

function requestedTiers(input: readonly TechnicalTier[] | undefined): TechnicalTier[] {
  const tiers = input ?? [1, 2, 3];
  if (
    tiers.length === 0 ||
    new Set(tiers).size !== tiers.length ||
    tiers.some((tier) => tier !== 1 && tier !== 2 && tier !== 3)
  ) {
    throw new Error('tiers debe contener una selección única de 1, 2 y/o 3');
  }
  return [...tiers];
}

type InspectedCandidate = {
  webConfig: ActivationAuditInput['webConfig'];
  tenant: { tier: number; modules: Record<string, unknown> };
};

/** El lector no hereda tokens, perfiles Cloudflare ni secretos del shell. */
function localInspectorEnvironment(): NodeJS.ProcessEnv {
  const environment: NodeJS.ProcessEnv = { CI: '1' };
  for (const name of ['PATH', 'TMPDIR', 'TEMP', 'TMP'] as const) {
    const value = process.env[name];
    if (value) environment[name] = value;
  }
  return environment;
}

function inspectCandidate(
  targetDir: string,
  temporaryDirectory: string,
  tsxExecutable: string,
  runner: LocalInspectorRunner,
): InspectedCandidate {
  const inspectionScript = join(temporaryDirectory, 'inspect-candidate.ts');
  const configUrl = pathToFileURL(join(targetDir, 'config.ts')).href;
  const seedUrl = pathToFileURL(join(targetDir, 'seed.ts')).href;
  writeFileSync(
    inspectionScript,
    `import config from ${JSON.stringify(configUrl)};\n` +
      `import { generateSeed } from ${JSON.stringify(seedUrl)};\n` +
      `const tenant = generateSeed(2026).tenants[0];\n` +
      `process.stdout.write(JSON.stringify({ webConfig: config, tenant }));\n`,
    'utf8',
  );
  const raw = runner(tsxExecutable, [inspectionScript], temporaryDirectory);
  return JSON.parse(raw) as InspectedCandidate;
}

function profileInput(
  inspected: InspectedCandidate,
  tier: TechnicalTier,
): Pick<ActivationAuditInput, 'webConfig' | 'tenant'> {
  const modules = {
    ...inspected.tenant.modules,
    web: true,
    booking: tier === 1 ? 'email' : tier === 2 ? 'request' : 'instant',
    dashboard: tier === 1 ? false : tier === 2 ? 'lite' : 'full',
    payments: { provider: 'none', mode: 'none' },
    notifications: {
      enabled: Object.fromEntries(notificationKinds.map((kind) => [kind, false])),
    },
  };
  return {
    webConfig: { ...inspected.webConfig, tier },
    tenant: { tier, modules },
  };
}

function candidateFingerprint(profiles: ActivationProfileResult[]): string {
  return sha256(
    JSON.stringify(
      profiles.map(({ tier, report }) => ({
        tier,
        bindings: report.bindings,
        adapters: report.adapters,
        secrets: report.secrets,
        issues: report.issues,
        externalVerification: report.externalVerification,
      })),
    ),
  );
}

function unresolvedTodos(
  targetDir: string,
  setupTodos: Array<{ file: string; todoCount: number }>,
) {
  const reports = new Map(setupTodos.map((report) => [report.file, { ...report }]));
  for (const file of ['config.ts', 'seed.ts', 'theme.css']) {
    const todoCount = (readFileSync(join(targetDir, file), 'utf8').match(/\bTODO\b/g) ?? []).length;
    if (todoCount > 0) reports.set(file, { file, todoCount });
  }
  return [...reports.values()].sort((left, right) => left.file.localeCompare(right.file));
}

/**
 * Tercer corte R13: monta un scaffold bajo /tmp, audita tiers 1–3 con
 * pagos/correo apagados y borra el candidato. No invoca Wrangler, DNS,
 * secrets, proveedor ni el plan de infraestructura real.
 */
export function runLocalActivationRehearsal(
  options: LocalActivationRehearsalOptions,
): LocalActivationRehearsalResult {
  const repoRoot = resolve(options.repoRoot);
  const identity = validateTenantIdentity(options.identity);
  const configuredSecretNames = options.configuredSecretNames ?? ['AUTH_SECRET'];
  const tiers = requestedTiers(options.tiers);
  assertSecretNames(configuredSecretNames);
  assertLocalActivationPlan(options.plan ?? []);

  const tsxExecutable = join(repoRoot, 'packages', 'cli', 'node_modules', '.bin', 'tsx');
  if (!existsSync(tsxExecutable)) {
    throw new Error('Falta el binario local de tsx; ejecuta pnpm install');
  }
  const inspectorRunner: LocalInspectorRunner =
    options.inspectorRunner ??
    ((executable, args, cwd) =>
      execFileSync(executable, args, {
        cwd,
        encoding: 'utf8',
        env: localInspectorEnvironment(),
      }));

  const before = protectedSourcesFingerprint(repoRoot);
  const temporaryDirectory = mkdtempSync(join(tmpdir(), TEMPORARY_PREFIX));

  try {
    const scaffold = scaffoldTenant(
      join(repoRoot, 'tenants', '_template'),
      join(temporaryDirectory, 'tenants'),
      identity,
      { generatedOn: '2026-08-11' },
    );
    const worker = parseWorkerJsonc(
      readFileSync(join(scaffold.targetDir, 'wrangler.jsonc'), 'utf8'),
    );
    const database = worker.d1_databases[0];
    if (!database) throw new Error('El candidato no contiene el binding D1 esperado');
    // Identificador estructural, no un recurso: solo vive en /tmp y el informe
    // conserva database_binding dentro de externalVerification.
    database.database_id = SYNTHETIC_DATABASE_ID;
    const inspected = inspectCandidate(
      scaffold.targetDir,
      temporaryDirectory,
      tsxExecutable,
      inspectorRunner,
    );

    const profiles: ActivationProfileResult[] = tiers.map((tier) => {
      const profile = profileInput(inspected, tier);
      const report = auditTenantActivation({
        identity: { slug: identity.slug, domain: identity.domain, zone: identity.zone },
        webConfig: profile.webConfig,
        tenant: profile.tenant,
        workerConfig: structuredClone(worker),
        configuredSecretNames: [...configuredSecretNames],
      });
      if (!report.localSafe || !report.contractReady) {
        throw new Error(
          `El candidato tier ${tier} no queda listo: ${JSON.stringify(report.issues)}`,
        );
      }
      return { tier, report };
    });
    const readiness = candidateReadinessReport({
      placeholders: scaffold.placeholders,
      todoFiles: unresolvedTodos(scaffold.targetDir, scaffold.setupTodos),
      activation: {
        issues: profiles.flatMap((profile) => profile.report.issues),
        externalVerification: profiles.flatMap((profile) => profile.report.externalVerification),
      },
    });

    const manifest = {
      identity: { slug: identity.slug, domain: identity.domain, zone: identity.zone },
      configuredSecretNames,
      profiles,
    };
    const serializedManifest = JSON.stringify(manifest, null, 2);
    writeFileSync(
      join(temporaryDirectory, 'activation-candidate.json'),
      serializedManifest,
      'utf8',
    );

    const after = protectedSourcesFingerprint(repoRoot);
    if (before !== after) {
      throw new Error('El ensayo de activación modificó apps/ o packages/');
    }

    return {
      temporaryDirectory,
      scaffoldFiles: scaffold.filesWritten.length,
      scaffoldMarkers: scaffold.placeholders.reduce(
        (total, report) => total + report.markers.length,
        0,
      ),
      candidateFingerprint: candidateFingerprint(profiles),
      protectedSourcesFingerprintBefore: before,
      protectedSourcesFingerprintAfter: after,
      inspectedFiles: ['config.ts', 'seed.ts', 'wrangler.jsonc'],
      candidates: profiles,
      profiles,
      unavailableProfiles: [
        {
          name: 'automatiza',
          reason:
            'No existe un contrato de activación distinto del tier 3: R12 conserva ejecución externa en none/manual.',
        },
      ],
      readiness,
    };
  } finally {
    if (
      existsSync(temporaryDirectory) &&
      temporaryDirectory.startsWith(join(tmpdir(), TEMPORARY_PREFIX))
    ) {
      rmSync(temporaryDirectory, { recursive: true, force: true });
    }
  }
}
