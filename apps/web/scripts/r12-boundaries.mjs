#!/usr/bin/env node
/**
 * Contrato ejecutable de las cuatro fronteras locales que cierran R12.
 *
 * No acredita proveedores ni producción. Demuestra lo contrario: el código y
 * el artefacto público siguen sin analítica, modelos o conectores OTA; la
 * observabilidad termina en el log local redactado; y los prototipos de
 * Automatiza/Inteligente no pueden ejecutar una acción externa.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const TRACKING_SOURCE_PATTERNS = [
  ['googletagmanager', /googletagmanager/i],
  ['gtag', /\bgtag\s*\(/i],
  ['dataLayer', /\bdataLayer\s*(?:=|\.push)/i],
  ['PostHog', /\bposthog\b/i],
  ['Plausible', /\bplausible\s*\(/i],
  ['Matomo', /\bmatomo\b|_paq\s*\.push/i],
  ['Clarity', /\bclarity\s*\(/i],
  ['sendBeacon', /\bsendBeacon\s*\(/i],
  ['document.cookie', /\bdocument\.cookie\s*=/i],
  ['Meta Pixel', /\bfbq\s*\(/i],
];

const FORBIDDEN_DEPENDENCIES = [
  '@sentry/',
  'sentry',
  'posthog',
  'plausible',
  '@segment/',
  'analytics-node',
  'openai',
  '@anthropic-ai/',
  '@google/generative-ai',
  '@google/genai',
  'mistralai',
  'cohere-ai',
  'langchain',
  '@langchain/',
  'channex',
  'booking.com',
  'expedia',
  'airbnb',
];

const EXTERNAL_RUNTIME_PATTERNS = [
  ['script remoto', /<script\b[^>]*\bsrc=["']https?:\/\//i],
  ['iframe remoto', /<iframe\b[^>]*\bsrc=["']https?:\/\//i],
  ['imagen remota', /<(?:img|source)\b[^>]*\bsrc(?:set)?=["']https?:\/\//i],
  [
    'hoja de estilos remota',
    /<link\b(?=[^>]*\brel=["']stylesheet["'])[^>]*\bhref=["']https?:\/\//i,
  ],
  ['fetch remoto', /\bfetch\s*\(\s*["']https?:\/\//i],
  ['import remoto', /\bimport\s*\(\s*["']https?:\/\//i],
  ['src JavaScript remoto', /\.src\s*=\s*["']https?:\/\//i],
  ['beacon', /\bsendBeacon\s*\(/i],
  ['píxel JavaScript', /\bnew\s+Image\s*\(/i],
  ['recurso CSS remoto', /\burl\(\s*["']?https?:\/\//i],
  ['import CSS remoto', /@import\s+(?:url\()?\s*["']?https?:\/\//i],
];

function fail(label, finding) {
  throw new Error(`[r12] ${label}: aparece ${finding}`);
}

export function assertNoTrackingSource(source, label) {
  for (const [name, pattern] of TRACKING_SOURCE_PATTERNS) {
    if (pattern.test(source)) fail(label, name);
  }
}

export function assertNoForbiddenDependency(dependency, label) {
  const normalized = dependency.toLowerCase();
  const match = FORBIDDEN_DEPENDENCIES.find(
    (item) => normalized === item || normalized.startsWith(item),
  );
  if (match) fail(label, `dependencia ${dependency}`);
}

export function assertNoExternalRuntime(source, label) {
  for (const [name, pattern] of EXTERNAL_RUNTIME_PATTERNS) {
    if (pattern.test(source)) fail(label, name);
  }
}

function filesUnder(root, predicate = () => true, prefix = '') {
  return readdirSync(join(root, prefix)).flatMap((name) => {
    const relativePath = join(prefix, name);
    const absolute = join(root, relativePath);
    if (statSync(absolute).isDirectory()) return filesUnder(root, predicate, relativePath);
    return predicate(absolute) ? [absolute] : [];
  });
}

function assertIncludes(source, fragment, label) {
  if (!source.includes(fragment)) fail(label, `contrato ausente «${fragment}»`);
}

function assertExcludes(source, pattern, label, finding) {
  if (pattern.test(source)) fail(label, finding);
}

function packageManifests(repo) {
  const roots = [repo, join(repo, 'apps'), join(repo, 'packages'), join(repo, 'tenants')];
  return roots.flatMap((root, index) => {
    if (index === 0) return [join(repo, 'package.json')];
    return readdirSync(root)
      .map((name) => join(root, name, 'package.json'))
      .filter((path) => {
        try {
          return statSync(path).isFile();
        } catch {
          return false;
        }
      });
  });
}

export function auditR12Repository(repo) {
  const sourceFiles = [
    join(repo, 'apps', 'web', 'src'),
    join(repo, 'apps', 'site', 'src'),
    join(repo, 'apps', 'dashboard', 'src'),
  ].flatMap((root) =>
    filesUnder(root, (path) =>
      ['.astro', '.css', '.js', '.json', '.md', '.mjs', '.ts', '.tsx'].includes(extname(path)),
    ),
  );
  for (const path of sourceFiles) {
    const source = readFileSync(path, 'utf8');
    assertNoTrackingSource(source, relative(repo, path));
  }

  const manifests = packageManifests(repo);
  for (const path of manifests) {
    const manifest = JSON.parse(readFileSync(path, 'utf8'));
    for (const section of ['dependencies', 'devDependencies', 'optionalDependencies']) {
      for (const dependency of Object.keys(manifest[section] ?? {})) {
        assertNoForbiddenDependency(dependency, relative(repo, path));
      }
    }
  }

  const errorsPath = join(repo, 'apps', 'api', 'src', 'errors.ts');
  const errors = readFileSync(errorsPath, 'utf8');
  for (const fragment of [
    'redactSensitiveText',
    'requestId?: string',
    'console.error(line)',
    'console.warn(line)',
    'console.log(line)',
  ]) {
    assertIncludes(errors, fragment, 'apps/api/src/errors.ts');
  }
  assertExcludes(errors, /\bfetch\s*\(/, 'apps/api/src/errors.ts', 'transporte externo activo');
  assertExcludes(
    errors,
    /\b(?:Sentry\.)?(?:captureException|captureMessage)\s*\(/,
    'apps/api/src/errors.ts',
    'SDK de observabilidad activo',
  );

  const automatizaPath = join(repo, 'apps', 'dashboard', 'src', 'demo', 'automatiza.ts');
  const automatiza = readFileSync(automatizaPath, 'utf8');
  assertIncludes(automatiza, "execution: 'manual_external'", 'Automatiza');
  assertExcludes(
    automatiza,
    /\|\s*\{\s*type:\s*['"](?:send|publish|deliver|open_ticket)['"]/,
    'Automatiza',
    'acción externa en el reducer',
  );
  assertNoExternalRuntime(automatiza, 'Automatiza');

  const inteligentePath = join(repo, 'apps', 'dashboard', 'src', 'demo', 'inteligente.ts');
  const inteligente = readFileSync(inteligentePath, 'utf8');
  assertIncludes(inteligente, "execution: 'none'", 'Inteligente');
  assertExcludes(
    inteligente,
    /\{\s*type:\s*['"](?:apply|execute)['"]/,
    'Inteligente',
    'acción de aplicación en el reducer',
  );
  assertNoExternalRuntime(inteligente, 'Inteligente');

  const scenarioPath = join(repo, 'apps', 'dashboard', 'src', 'demo', 'mardefondo.ts');
  const scenario = readFileSync(scenarioPath, 'utf8');
  assertIncludes(scenario, "execution: 'none'", 'parte de incidencias');
  assertIncludes(scenario, "channel: index % 5 === 0 ? 'phone' : 'web'", 'Mar de Fondo');
  assertExcludes(
    scenario,
    /booking\.com|airbnb|expedia|channel[_ -]?manager|\bota\b|\b(?:sync|synchroni[sz]|sincroni[sz])/i,
    'Mar de Fondo',
    'conector o sincronización OTA',
  );

  const cookiesPath = join(repo, 'apps', 'web', 'src', 'content', 'legal', 'cookies.es.md');
  const cookies = readFileSync(cookiesPath, 'utf8');
  assertIncludes(cookies, 'no utiliza cookies de analítica', 'política de cookies');
  assertIncludes(cookies, 'no incorpora píxeles de seguimiento', 'política de cookies');

  return { sourceFiles: sourceFiles.length, manifests: manifests.length };
}

export function auditPublicArtifact(dist, { requireCookies = true } = {}) {
  const runtimeFiles = filesUnder(dist, (path) =>
    ['.css', '.html', '.js', '.mjs'].includes(extname(path)),
  );
  for (const path of runtimeFiles) {
    assertNoExternalRuntime(readFileSync(path, 'utf8'), relative(dist, path));
  }

  if (requireCookies) {
    const cookiesPath = join(dist, 'cookies', 'index.html');
    const cookies = readFileSync(cookiesPath, 'utf8');
    assertIncludes(cookies, 'no utiliza cookies de analítica', 'artefacto /cookies');
    assertIncludes(cookies, 'no incorpora píxeles de seguimiento', 'artefacto /cookies');
  }
  return { runtimeFiles: runtimeFiles.length };
}

function run() {
  const web = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const repo = resolve(web, '..', '..');
  const source = auditR12Repository(repo);
  const artifact = auditPublicArtifact(join(web, 'dist'));
  console.log(
    `[r12] fronteras locales verificadas: ${source.sourceFiles} fuentes, ` +
      `${source.manifests} manifiestos y ${artifact.runtimeFiles} artefactos; ` +
      'sin tracker, SDK externo, OTA ni ejecución de IA.',
  );
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) run();
