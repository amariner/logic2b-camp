#!/usr/bin/env node
/**
 * Pipeline local de vídeo ambiental por tenant.
 *
 * `stage` normaliza un único clip a MP4 H.264 sin audio y lo deja fuera del
 * runtime. `approve` solo publica ese candidato después de una inspección
 * visual explícita y crea/actualiza movimiento.json de forma atómica. `reject`
 * conserva el candidato y su evidencia para auditoría.
 */
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { assertVideoTechnical, probeVideo } from './hero-motion-contract.mjs';

const run = promisify(execFile);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const defaultRepo = resolve(scriptDir, '../../..');
const ROLE_KEYS = { desktop: 'hero-motion', mobile: 'hero-motion-mobile' };

function fail(message) {
  throw new Error(`[hero-motion-pipeline] ${message}`);
}

export function safeToken(value, label) {
  if (typeof value !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(value)) {
    fail(`${label}: valor inseguro`);
  }
  return value;
}

function safeIdentifier(value, label) {
  if (typeof value !== 'string' || !/^[a-z0-9][a-z0-9_.-]*$/.test(value)) {
    fail(`${label}: identificador inseguro`);
  }
  return value;
}

function requiredText(value, label, min = 2) {
  if (typeof value !== 'string' || value.trim().length < min) fail(`${label}: falta texto`);
  return value.trim();
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function writeJsonAtomic(path, value) {
  const temporary = `${path}.partial-${process.pid}`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`);
  await rename(temporary, path);
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function posterFromConfig(source) {
  const poster = source.match(/\bstaticHeroImage\s*:\s*['"]([^'"]+)['"]/)?.[1];
  if (!poster) fail('config.staticHeroImage: falta la clave del póster');
  return safeToken(poster, 'config.staticHeroImage');
}

function pathsFor(repo, slug, role) {
  safeToken(slug, 'slug');
  const key = ROLE_KEYS[role];
  if (!key) fail(`role: usa ${Object.keys(ROLE_KEYS).join(' o ')}`);
  const tenantDir = join(repo, 'tenants', slug);
  const mediaDir = join(tenantDir, 'content', 'media');
  const stagingDir = join(mediaDir, '.motion-staging');
  const rejectedDir = join(mediaDir, '.motion-rejected');
  return {
    key,
    tenantDir,
    mediaDir,
    stagingDir,
    rejectedDir,
    configPath: join(tenantDir, 'config.ts'),
    manifestPath: join(tenantDir, 'movimiento.json'),
    stagedVideo: join(stagingDir, `${key}.mp4`),
    stagedEvidence: join(stagingDir, `${key}.json`),
    finalVideo: join(mediaDir, `${key}.mp4`),
  };
}

export function ffmpegArgs(source, output) {
  return [
    '-y',
    '-i',
    source,
    '-map',
    '0:v:0',
    '-an',
    '-vf',
    'format=yuv420p',
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-crf',
    '24',
    '-movflags',
    '+faststart',
    output,
  ];
}

function validateEvidence(raw, poster) {
  const evidence = {
    provider: safeIdentifier(raw?.provider, 'evidence.provider'),
    model: safeIdentifier(raw?.model, 'evidence.model'),
    prompt: requiredText(raw?.prompt, 'evidence.prompt', 20),
    generatedAt: requiredText(raw?.generatedAt, 'evidence.generatedAt'),
    poster,
  };
  if (!Number.isFinite(Date.parse(evidence.generatedAt))) {
    fail('evidence.generatedAt: fecha inválida');
  }
  return evidence;
}

async function defaultFfmpeg(command, args) {
  try {
    await run(command, args, { maxBuffer: 10 * 1024 * 1024 });
  } catch (error) {
    if (error?.code === 'ENOENT') {
      fail('ffmpeg no está disponible; instala FFmpeg o define FFMPEG_PATH');
    }
    throw error;
  }
}

export async function stageClip({
  slug,
  role,
  source,
  evidencePath,
  repo = defaultRepo,
  ffmpeg = defaultFfmpeg,
  probe = probeVideo,
  ffmpegBin = process.env.FFMPEG_PATH ?? 'ffmpeg',
} = {}) {
  const paths = pathsFor(repo, slug, role);
  const sourcePath = resolve(source ?? '');
  if (!source || basename(sourcePath) === '' || !(await exists(sourcePath)))
    fail('source: no existe');
  if ((await stat(sourcePath)).isDirectory()) fail('source: debe ser un archivo');
  if (!evidencePath || !(await exists(resolve(evidencePath)))) fail('evidence: no existe');
  if (await exists(paths.finalVideo)) fail(`${paths.key}: el final ya existe`);
  if ((await exists(paths.stagedVideo)) || (await exists(paths.stagedEvidence))) {
    fail(`${paths.key}: ya hay un candidato en revisión`);
  }

  const poster = posterFromConfig(await readFile(paths.configPath, 'utf8'));
  const evidence = validateEvidence(
    JSON.parse(await readFile(resolve(evidencePath), 'utf8')),
    poster,
  );
  const sourceBuffer = await readFile(sourcePath);
  const sourceExtension = extname(sourcePath).toLowerCase() || 'unknown';
  const temporary = `${paths.stagedVideo}.partial-${process.pid}.mp4`;
  await mkdir(paths.stagingDir, { recursive: true });

  try {
    await ffmpeg(ffmpegBin, ffmpegArgs(sourcePath, temporary));
    const buffer = await readFile(temporary);
    const metadata = await probe(temporary);
    assertVideoTechnical({
      file: temporary,
      role,
      bytes: buffer.length,
      buffer,
      metadata,
    });
    await rename(temporary, paths.stagedVideo);
    await writeJsonAtomic(paths.stagedEvidence, {
      version: 1,
      key: paths.key,
      role,
      ...evidence,
      stagedAt: new Date().toISOString(),
      sourceExtension,
      sourceSha256: sha256(sourceBuffer),
      normalizedSha256: sha256(buffer),
    });
    return { path: paths.stagedVideo, bytes: buffer.length, metadata };
  } catch (error) {
    await rm(temporary, { force: true });
    await rm(paths.stagedVideo, { force: true });
    await rm(paths.stagedEvidence, { force: true });
    throw error;
  }
}

async function readManifest(path) {
  if (!(await exists(path))) return { version: 1, clips: {} };
  const manifest = JSON.parse(await readFile(path, 'utf8'));
  if (manifest.version !== 1 || !manifest.clips || typeof manifest.clips !== 'object') {
    fail('movimiento.json: requiere version 1 y clips');
  }
  return manifest;
}

export async function approveClip({
  slug,
  role,
  repo = defaultRepo,
  probe = probeVideo,
  now = () => new Date(),
} = {}) {
  const paths = pathsFor(repo, slug, role);
  if (!(await exists(paths.stagedVideo)) || !(await exists(paths.stagedEvidence))) {
    fail(`${paths.key}: falta el candidato o su evidencia`);
  }
  if (await exists(paths.finalVideo)) fail(`${paths.key}: el final ya existe`);

  const evidence = JSON.parse(await readFile(paths.stagedEvidence, 'utf8'));
  const buffer = await readFile(paths.stagedVideo);
  if (evidence.version !== 1 || evidence.key !== paths.key || evidence.role !== role) {
    fail(`${paths.key}: evidencia de staging incoherente`);
  }
  if (evidence.normalizedSha256 !== sha256(buffer)) {
    fail(`${paths.key}: el candidato cambió después de staging`);
  }
  assertVideoTechnical({
    file: paths.stagedVideo,
    role,
    bytes: buffer.length,
    buffer,
    metadata: await probe(paths.stagedVideo),
  });

  const approvedAt = now().toISOString();
  if (Date.parse(approvedAt) < Date.parse(evidence.generatedAt)) {
    fail(`${paths.key}: la aprobación precede a la generación`);
  }
  const manifest = await readManifest(paths.manifestPath);
  if (manifest.clips[paths.key]) fail(`${paths.key}: ya está declarado en movimiento.json`);
  manifest.clips[paths.key] = {
    poster: evidence.poster,
    provider: evidence.provider,
    model: evidence.model,
    prompt: evidence.prompt,
    generatedAt: evidence.generatedAt,
    approvedAt,
    approval: 'visual-inspection',
    sha256: evidence.normalizedSha256,
  };

  const manifestTemporary = `${paths.manifestPath}.partial-${process.pid}`;
  await writeFile(manifestTemporary, `${JSON.stringify(manifest, null, 2)}\n`);
  try {
    await rename(paths.stagedVideo, paths.finalVideo);
    await rename(manifestTemporary, paths.manifestPath);
    await rm(paths.stagedEvidence);
  } catch (error) {
    await rm(manifestTemporary, { force: true });
    if ((await exists(paths.finalVideo)) && !(await exists(paths.stagedVideo))) {
      await rename(paths.finalVideo, paths.stagedVideo);
    }
    throw error;
  }
  return { path: paths.finalVideo, manifestPath: paths.manifestPath };
}

export async function rejectClip({
  slug,
  role,
  reason = 'visual_quality_rejected',
  repo = defaultRepo,
  now = () => new Date(),
} = {}) {
  const paths = pathsFor(repo, slug, role);
  if (!(await exists(paths.stagedVideo)) || !(await exists(paths.stagedEvidence))) {
    fail(`${paths.key}: falta el candidato o su evidencia`);
  }
  const rejectedAt = now().toISOString();
  const suffix = rejectedAt.replaceAll(':', '-');
  const evidence = JSON.parse(await readFile(paths.stagedEvidence, 'utf8'));
  evidence.rejectedAt = rejectedAt;
  evidence.reason = requiredText(reason, 'reason').slice(0, 300);
  await mkdir(paths.rejectedDir, { recursive: true });
  const rejectedVideo = join(paths.rejectedDir, `${paths.key}-${suffix}.mp4`);
  const rejectedEvidence = join(paths.rejectedDir, `${paths.key}-${suffix}.json`);
  try {
    await writeJsonAtomic(rejectedEvidence, evidence);
    await rename(paths.stagedVideo, rejectedVideo);
    await rm(paths.stagedEvidence);
  } catch (error) {
    await rm(rejectedEvidence, { force: true });
    throw error;
  }
  return { path: rejectedVideo, evidencePath: rejectedEvidence };
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv[0] === '--') argv.shift();
  const [command, slug, role, ...args] = argv;
  if (!command || !slug || !role) {
    console.error(
      'Uso: hero-motion-pipeline.mjs <stage|approve|reject> <slug> <desktop|mobile> [argumentos]',
    );
    process.exit(1);
  }
  if (command === 'stage') {
    const [source, evidencePath] = args;
    const result = await stageClip({ slug, role, source, evidencePath });
    console.log(
      `◉ ${basename(result.path)} en revisión · ${result.metadata.duration.toFixed(1)} s · ${Math.round(result.bytes / 1024)} KB`,
    );
    return;
  }
  if (command === 'approve') {
    const result = await approveClip({ slug, role });
    console.log(`✓ Publicado tras inspección visual: ${basename(result.path)}`);
    return;
  }
  if (command === 'reject') {
    const result = await rejectClip({ slug, role, reason: args.join(' ') || undefined });
    console.log(`↺ Rechazado y conservado para auditoría: ${basename(result.path)}`);
    return;
  }
  fail(`comando desconocido: ${command}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
