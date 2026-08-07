#!/usr/bin/env node
/**
 * Orquestador resiliente de fotografía por tenant.
 *
 * Codex integrado sigue siendo el proveedor principal, pero no expone una API
 * invocable desde el repositorio. Sus resultados se incorporan con `ingest` y
 * sus fallos se anotan con `record-failure`. Al alcanzar el umbral declarado,
 * `run` ejecuta únicamente el primer lote incompleto mediante Higgsfield, baja
 * el máster y valida dimensiones/proporción. El WebP queda en staging hasta
 * que una inspección visual explícita lo aprueba y lo publica de forma atómica.
 */
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '../../..');
const MAX_BATCH = 2;
const MAX_SIDE = 2000;
const WEBP_QUALITY = 78;
const MIN_IMAGE_SIDE = 900;
const ASPECT_TOLERANCE = 0.12;

const DEFAULT_POLICY = {
  primary: 'codex-integrated',
  fallback: 'higgsfield',
  fallbackAfterFailures: 2,
  fallbackScope: 'manifest',
  higgsfieldModel: 'soul_location',
  higgsfieldFallbackModel: 'gpt_image_2',
  modelFallbackAfterRejections: 2,
};

export function assertSafeToken(value, label) {
  if (typeof value !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(value)) {
    throw new Error(`${label}_invalid`);
  }
  return value;
}

export function parseAspectRatio(value) {
  const match = /^(\d+):(\d+)$/.exec(value ?? '');
  if (!match) throw new Error(`aspect_ratio_invalid:${String(value)}`);
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (width <= 0 || height <= 0) throw new Error(`aspect_ratio_invalid:${value}`);
  return width / height;
}

function declaredBatches(manifest) {
  return Array.isArray(manifest.lotes)
    ? manifest.lotes
    : Object.keys(manifest.piezas ?? {}).reduce((batches, name, index) => {
        if (index % MAX_BATCH === 0) batches.push([]);
        batches.at(-1).push(name);
        return batches;
      }, []);
}

export function activeBatch(manifest, localNames) {
  return (
    declaredBatches(manifest).find((batch) => batch.some((name) => !localNames.has(name))) ?? []
  );
}

export function nextBatch(manifest, localNames) {
  for (const batch of declaredBatches(manifest)) {
    const pending = batch.filter((name) => !localNames.has(name));
    if (pending.length > 0) return pending.slice(0, MAX_BATCH);
  }
  return [];
}

export function chooseProvider(policy, attempts) {
  const failures = attempts.filter(
    (attempt) =>
      attempt.provider === policy.primary &&
      attempt.status === 'failed' &&
      attempt.error === 'network_before_bytes',
  ).length;
  return failures >= policy.fallbackAfterFailures ? policy.fallback : policy.primary;
}

export function higgsfieldArgs(model, piece) {
  const aspect = model === 'gpt_image_2' && piece.aspecto === '21:9' ? '16:9' : piece.aspecto;
  const args = ['generate', 'create', model, '--prompt', piece.prompt, '--aspect_ratio', aspect];
  if (model === 'gpt_image_2') {
    args.push('--quality', 'high', '--resolution', '2k');
  }
  args.push('--wait', '--json');
  return args;
}

export function higgsfieldModelFor(policy, rejections) {
  return rejections.length >= policy.modelFallbackAfterRejections
    ? policy.higgsfieldFallbackModel
    : policy.higgsfieldModel;
}

export function sourceAspectForModel(model, requestedAspect) {
  return model === 'gpt_image_2' && requestedAspect === '21:9' ? '16:9' : requestedAspect;
}

function expectedJobParams(model, piece) {
  return {
    prompt: piece.prompt,
    aspect_ratio: sourceAspectForModel(model, piece.aspecto),
    ...(model === 'gpt_image_2' ? { quality: 'high', resolution: '2k' } : {}),
  };
}

export function reusableJob(jobs, model, piece, excludedJobIds = new Set()) {
  const expected = expectedJobParams(model, piece);
  return jobs.find(
    (job) =>
      job.job_type === model &&
      !excludedJobIds.has(job.id) &&
      Object.entries(expected).every(([key, value]) => job.params?.[key] === value) &&
      (job.status === 'completed' || job.status === 'running'),
  );
}

export function sanitizeFailure(value) {
  return String(value)
    .replace(/Authorization:\s*Bearer\s+[^\s]+/gi, 'Authorization: [redacted]')
    .replace(/((?:api[_-]?key|token|secret))=([^\s&]+)/gi, '$1=[redacted]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
}

const exists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

async function writeJsonAtomic(path, value) {
  const temporary = `${path}.partial-${process.pid}`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`);
  await rename(temporary, path);
}

function tenantPaths(slug) {
  assertSafeToken(slug, 'slug');
  const tenantDir = join(REPO_ROOT, 'tenants', slug);
  return {
    tenantDir,
    manifestPath: join(tenantDir, 'fotos.json'),
    statePath: join(tenantDir, 'fotos.estado.json'),
    mediaDir: join(tenantDir, 'content', 'media'),
    stagingDir: join(tenantDir, 'content', 'media', '.staging'),
    rejectedDir: join(tenantDir, 'content', 'media', '.rejected'),
  };
}

async function loadContext(slug) {
  const paths = tenantPaths(slug);
  const manifest = await readJson(paths.manifestPath);
  const state = (await exists(paths.statePath))
    ? await readJson(paths.statePath)
    : { version: 1, policy: DEFAULT_POLICY, attempts: {} };
  state.policy = { ...DEFAULT_POLICY, ...(state.policy ?? {}) };
  state.attempts ??= {};
  state.approvals ??= {};
  state.rejections ??= {};
  validateManifest(manifest);
  await mkdir(paths.mediaDir, { recursive: true });
  await mkdir(paths.stagingDir, { recursive: true });
  await mkdir(paths.rejectedDir, { recursive: true });
  return { manifest, paths, state };
}

function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object' || !manifest.piezas) {
    throw new Error('manifest_invalid');
  }
  for (const [name, piece] of Object.entries(manifest.piezas)) {
    assertSafeToken(name, 'pieza');
    if (typeof piece.prompt !== 'string' || piece.prompt.trim().length < 20) {
      throw new Error(`prompt_invalid:${name}`);
    }
    parseAspectRatio(piece.aspecto);
  }
  for (const batch of manifest.lotes ?? []) {
    if (!Array.isArray(batch) || batch.length === 0 || batch.length > MAX_BATCH) {
      throw new Error('batch_invalid');
    }
    for (const name of batch) {
      if (!manifest.piezas[name]) throw new Error(`batch_piece_unknown:${name}`);
    }
  }
}

async function localNames(context) {
  const names = new Set();
  for (const name of Object.keys(context.manifest.piezas)) {
    if (await exists(join(context.paths.mediaDir, `${name}.webp`))) names.add(name);
  }
  return names;
}

async function stagedNames(context) {
  const names = new Set();
  for (const name of Object.keys(context.manifest.piezas)) {
    if (await exists(join(context.paths.stagingDir, `${name}.webp`))) names.add(name);
  }
  return names;
}

function attemptsFor(state, names) {
  return names.flatMap((name) => state.attempts[name] ?? []);
}

async function appendAttempt(context, name, attempt) {
  context.state.attempts[name] ??= [];
  context.state.attempts[name].push({ at: new Date().toISOString(), ...attempt });
  await writeJsonAtomic(context.paths.statePath, context.state);
}

function binaryPath() {
  if (process.env.HIGGSFIELD_BIN) return process.env.HIGGSFIELD_BIN;
  const local = join(homedir(), '.local', 'bin', 'higgsfield');
  return local;
}

function runCommand(command, args, { allowFailure = false } = {}) {
  return new Promise((resolveCommand, rejectCommand) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('error', rejectCommand);
    child.on('close', (code) => {
      if (code === 0 || allowFailure) resolveCommand({ code, stdout, stderr });
      else rejectCommand(new Error(sanitizeFailure(stderr || stdout || `exit_${code}`)));
    });
  });
}

function asJobs(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.jobs)) return value.jobs;
  if (Array.isArray(value?.data)) return value.data;
  return value && typeof value === 'object' ? [value] : [];
}

function jobUrl(job) {
  return job?.result_url ?? job?.min_result_url ?? job?.result?.url ?? null;
}

async function findReusableJob(bin, model, piece, excludedJobIds) {
  const result = await runCommand(bin, ['generate', 'list', '--json']);
  const jobs = asJobs(JSON.parse(result.stdout));
  return reusableJob(jobs, model, piece, excludedJobIds);
}

async function resolveJob(bin, model, piece, excludedJobIds) {
  const reusable = await findReusableJob(bin, model, piece, excludedJobIds);
  if (reusable?.status === 'completed' && jobUrl(reusable)) {
    return { job: reusable, reused: true };
  }
  if (reusable?.id) {
    const waited = await runCommand(bin, ['generate', 'wait', reusable.id, '--json']);
    return { job: asJobs(JSON.parse(waited.stdout))[0], reused: true };
  }
  const generated = await runCommand(bin, higgsfieldArgs(model, piece));
  return { job: asJobs(JSON.parse(generated.stdout))[0], reused: false };
}

async function fetchWithRetry(url, attempts = 3) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:') throw new Error('result_url_not_https');
  let lastError;
  for (let index = 0; index < attempts; index++) {
    try {
      const response = await fetch(parsed, { signal: AbortSignal.timeout(60_000) });
      if (!response.ok) throw new Error(`download_http_${response.status}`);
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      lastError = error;
      if (index + 1 < attempts) {
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 1_000 * 2 ** index));
      }
    }
  }
  throw lastError;
}

async function validateAndStage(context, name, piece, sourceBuffer, sourceAspect = piece.aspecto) {
  const normalized = await sharp(sourceBuffer).rotate().toBuffer({ resolveWithObject: true });
  const { width, height, format } = normalized.info;
  if (!width || !height || Math.min(width, height) < MIN_IMAGE_SIDE) {
    throw new Error(`image_too_small:${width}x${height}`);
  }
  const expectedSource = parseAspectRatio(sourceAspect);
  const actual = width / height;
  if (Math.abs(actual / expectedSource - 1) > ASPECT_TOLERANCE) {
    throw new Error(`aspect_mismatch:${width}x${height}:${sourceAspect}`);
  }

  const extension = format === 'jpeg' ? 'jpg' : format || 'bin';
  const sourcePath = join(context.paths.mediaDir, `${name}-source.${extension}`);
  await writeFile(sourcePath, normalized.data);

  const targetAspect = parseAspectRatio(piece.aspecto);
  const targetWidth = targetAspect >= 1 ? MAX_SIDE : Math.round(MAX_SIDE * targetAspect);
  const targetHeight = targetAspect >= 1 ? Math.round(MAX_SIDE / targetAspect) : MAX_SIDE;
  const webp = await sharp(normalized.data)
    .resize({
      width: targetWidth,
      height: targetHeight,
      fit: 'cover',
      position: 'attention',
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
  const stagedPath = join(context.paths.stagingDir, `${name}.webp`);
  const temporary = `${stagedPath}.partial-${process.pid}`;
  await writeFile(temporary, webp);
  await rename(temporary, stagedPath);
  return { stagedPath, sourcePath, width, height, bytes: webp.length };
}

async function status(slug) {
  const context = await loadContext(slug);
  const local = await localNames(context);
  const staged = await stagedNames(context);
  const batch = nextBatch(context.manifest, local);
  const awaitingReview = batch.filter((name) => staged.has(name));
  const generationPending = batch.filter((name) => !staged.has(name));
  const provider = generationPending.length
    ? chooseProvider(
        context.state.policy,
        attemptsFor(context.state, Object.keys(context.manifest.piezas)),
      )
    : null;
  console.log(
    `${slug}: ${local.size}/${Object.keys(context.manifest.piezas).length} finales locales`,
  );
  if (batch.length === 0) {
    console.log('Cola completa.');
    return;
  }
  console.log(`Lote activo (${batch.length}/${MAX_BATCH}): ${batch.join(' + ')}`);
  if (awaitingReview.length) {
    console.log(`En revisión: ${awaitingReview.join(' + ')}`);
  }
  if (generationPending.length) console.log(`Proveedor habilitado: ${provider}`);
}

async function recordFailure(slug, name, provider, error, detail = '') {
  assertSafeToken(name, 'pieza');
  assertSafeToken(provider, 'provider');
  const context = await loadContext(slug);
  if (!context.manifest.piezas[name]) throw new Error(`piece_unknown:${name}`);
  await appendAttempt(context, name, {
    provider,
    status: 'failed',
    error: sanitizeFailure(error),
    detail: sanitizeFailure(detail),
  });
  console.log(`Fallo registrado: ${name} · ${provider} · ${sanitizeFailure(error)}`);
}

async function ingest(slug, name, source, provider = 'codex-integrated', model = 'integrated') {
  assertSafeToken(name, 'pieza');
  const context = await loadContext(slug);
  const piece = context.manifest.piezas[name];
  if (!piece) throw new Error(`piece_unknown:${name}`);
  const active = nextBatch(context.manifest, await localNames(context));
  if (!active.includes(name)) throw new Error(`piece_not_in_active_batch:${name}`);
  const sourcePath = resolve(source);
  if (basename(sourcePath) === '' || !(await exists(sourcePath))) throw new Error('source_missing');
  const staged = await validateAndStage(context, name, piece, await readFile(sourcePath));
  await appendAttempt(context, name, {
    provider,
    model,
    status: 'staged',
    promptSha256: createHash('sha256').update(piece.prompt).digest('hex'),
    sourceExtension: extname(staged.sourcePath),
    dimensions: `${staged.width}x${staged.height}`,
  });
  console.log(`◉ ${name}.webp en revisión · ${staged.width}×${staged.height}`);
}

async function approve(slug, requestedNames) {
  const context = await loadContext(slug);
  const staged = await stagedNames(context);
  const active = nextBatch(context.manifest, await localNames(context));
  const names = requestedNames.length ? requestedNames : active.filter((name) => staged.has(name));
  if (names.length === 0 || names.length > MAX_BATCH) throw new Error('approve_batch_invalid');
  for (const name of names) {
    assertSafeToken(name, 'pieza');
    if (!context.manifest.piezas[name] || !active.includes(name) || !staged.has(name)) {
      throw new Error(`staged_piece_missing:${name}`);
    }
  }
  for (const name of names) {
    const finalPath = join(context.paths.mediaDir, `${name}.webp`);
    if (await exists(finalPath)) throw new Error(`final_already_exists:${name}`);
    await rename(join(context.paths.stagingDir, `${name}.webp`), finalPath);
    context.state.approvals[name] = {
      at: new Date().toISOString(),
      gate: 'visual-inspection',
    };
  }
  await writeJsonAtomic(context.paths.statePath, context.state);
  console.log(`✓ Publicadas tras revisión: ${names.join(' + ')}`);
}

async function reject(slug, name, reason = 'visual_quality_rejected') {
  assertSafeToken(name, 'pieza');
  const context = await loadContext(slug);
  const stagedPath = join(context.paths.stagingDir, `${name}.webp`);
  if (!context.manifest.piezas[name] || !(await exists(stagedPath))) {
    throw new Error(`staged_piece_missing:${name}`);
  }
  const rejectedPath = join(context.paths.rejectedDir, `${name}-${Date.now()}.webp`);
  await rename(stagedPath, rejectedPath);
  context.state.rejections[name] ??= [];
  const lastJobId = [...(context.state.attempts[name] ?? [])]
    .reverse()
    .find((attempt) => attempt.jobId)?.jobId;
  context.state.rejections[name].push({
    at: new Date().toISOString(),
    reason: sanitizeFailure(reason),
    ...(lastJobId ? { jobId: lastJobId } : {}),
  });
  await writeJsonAtomic(context.paths.statePath, context.state);
  console.log(`↺ Rechazada y conservada para auditoría: ${name}`);
}

async function run(slug) {
  const context = await loadContext(slug);
  const local = await localNames(context);
  const staged = await stagedNames(context);
  const batch = nextBatch(context.manifest, local);
  if (batch.length === 0) {
    console.log(`${slug}: la cola fotográfica ya está completa.`);
    return;
  }
  const generationBatch = batch.filter((name) => !staged.has(name));
  if (generationBatch.length === 0) {
    console.log(
      `El lote ${batch.join(' + ')} está en revisión. Usa \`fotos approve\` o \`fotos reject\` antes de continuar.`,
    );
    return;
  }
  const provider = chooseProvider(
    context.state.policy,
    attemptsFor(context.state, Object.keys(context.manifest.piezas)),
  );
  if (provider !== 'higgsfield') {
    console.log(
      `El lote ${generationBatch.join(' + ')} sigue asignado a ${provider}. ` +
        'Genera como máximo esta pareja y usa `fotos ingest`, o registra el fallo con `fotos record-failure`.',
    );
    process.exitCode = 2;
    return;
  }

  const bin = binaryPath();
  if (!(await exists(bin))) throw new Error(`higgsfield_cli_missing:${bin}`);
  const account = await runCommand(bin, ['account', 'status'], { allowFailure: true });
  if (account.code !== 0) throw new Error('higgsfield_auth_required');
  console.log(`Fallback controlado: Higgsfield · lote ${generationBatch.join(' + ')}`);

  for (const name of generationBatch) {
    const finalPath = join(context.paths.mediaDir, `${name}.webp`);
    if (await exists(finalPath)) continue;
    const piece = context.manifest.piezas[name];
    const rejections = context.state.rejections[name] ?? [];
    const model = higgsfieldModelFor(context.state.policy, rejections);
    console.log(`Modelo ${name}: ${model}`);
    let job;
    try {
      const excludedJobIds = new Set(
        (context.state.rejections[name] ?? []).map((rejection) => rejection.jobId).filter(Boolean),
      );
      const resolved = await resolveJob(bin, model, piece, excludedJobIds);
      job = resolved.job;
      const url = jobUrl(job);
      if (!job?.id || job.status !== 'completed' || !url) {
        throw new Error(`higgsfield_job_incomplete:${job?.status ?? 'unknown'}`);
      }
      const stagedResult = await validateAndStage(
        context,
        name,
        piece,
        await fetchWithRetry(url),
        sourceAspectForModel(model, piece.aspecto),
      );
      await appendAttempt(context, name, {
        provider: 'higgsfield',
        model,
        status: 'staged',
        jobId: job.id,
        reusedJob: resolved.reused,
        promptSha256: createHash('sha256').update(piece.prompt).digest('hex'),
        sourceExtension: extname(stagedResult.sourcePath),
        dimensions: `${stagedResult.width}x${stagedResult.height}`,
      });
      console.log(
        `◉ ${name}.webp en revisión · ${stagedResult.width}×${stagedResult.height} · ` +
          `${(stagedResult.bytes / 1024).toFixed(0)} KB`,
      );
    } catch (error) {
      const errorMessage = sanitizeFailure(error instanceof Error ? error.message : error);
      if (job?.id && /^(?:aspect_mismatch|image_too_small):/.test(errorMessage)) {
        context.state.rejections[name] ??= [];
        context.state.rejections[name].push({
          at: new Date().toISOString(),
          reason: `automatic_validation:${errorMessage}`,
          jobId: job.id,
        });
      }
      await appendAttempt(context, name, {
        provider: 'higgsfield',
        model,
        status: 'failed',
        ...(job?.id ? { jobId: job.id } : {}),
        error: errorMessage,
      });
      throw error;
    }
  }
  console.log('Lote en staging. Inspecciona la pareja y aprueba o rechaza antes de continuar.');
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv[0] === '--') argv.shift();
  const [command, slug, ...args] = argv;
  if (!command || !slug) {
    console.error(
      'Uso: foto-pipeline.mjs <status|run|record-failure|ingest|approve|reject> <slug> [argumentos]',
    );
    process.exit(1);
  }
  if (command === 'status') return status(slug);
  if (command === 'run') return run(slug);
  if (command === 'record-failure') {
    const [name, provider, error, detail] = args;
    if (!name || !provider || !error) throw new Error('record_failure_args_missing');
    return recordFailure(slug, name, provider, error, detail);
  }
  if (command === 'ingest') {
    const [name, source, provider, model] = args;
    if (!name || !source) throw new Error('ingest_args_missing');
    return ingest(slug, name, source, provider, model);
  }
  if (command === 'approve') return approve(slug, args);
  if (command === 'reject') {
    const [name, reason] = args;
    if (!name) throw new Error('reject_args_missing');
    return reject(slug, name, reason);
  }
  throw new Error(`command_unknown:${command}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`✗ ${sanitizeFailure(error instanceof Error ? error.message : error)}`);
    process.exit(1);
  });
}
