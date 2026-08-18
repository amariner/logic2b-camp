#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const scriptPath = fileURLToPath(import.meta.url);
const defaultRepo = resolve(dirname(scriptPath), '../../..');
const VIDEO_EXTENSIONS = ['.mp4', '.webm'];
const LIMITS = { desktop: 3 * 1024 * 1024, mobile: 1.5 * 1024 * 1024 };

function fail(message) {
  throw new Error(`[hero-motion] ${message}`);
}

function requiredText(value, label, min = 2) {
  if (typeof value !== 'string' || value.trim().length < min) fail(`${label}: falta texto`);
}

function configString(source, field) {
  return source.match(new RegExp(`\\b${field}\\s*:\\s*['"]([^'"]+)['"]`))?.[1];
}

export function extractHeroMotion(source) {
  const body = source.match(/\bheroMotion\s*:\s*\{([^}]*)\}/s)?.[1];
  if (!body) return null;
  const desktop = configString(body, 'desktop');
  if (!desktop) fail('config.heroMotion.desktop: falta clave local');
  return {
    desktop,
    mobile: configString(body, 'mobile'),
    position: configString(body, 'position'),
  };
}

function boxes(buffer, start = 0, end = buffer.length) {
  const result = [];
  let offset = start;
  while (offset + 8 <= end) {
    let size = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    let header = 8;
    if (size === 1) {
      if (offset + 16 > end) break;
      const large = buffer.readBigUInt64BE(offset + 8);
      if (large > BigInt(Number.MAX_SAFE_INTEGER)) break;
      size = Number(large);
      header = 16;
    } else if (size === 0) {
      size = end - offset;
    }
    if (size < header || offset + size > end) break;
    result.push({ type, offset, size });
    offset += size;
  }
  return result;
}

export function hasFastStart(buffer) {
  const topLevel = boxes(buffer);
  const moov = topLevel.find((box) => box.type === 'moov');
  const mdat = topLevel.find((box) => box.type === 'mdat');
  return Boolean(moov && mdat && moov.offset < mdat.offset);
}

export function assertVideoTechnical({ file, role, bytes, buffer, metadata }) {
  const label = `${role} ${file}`;
  const extension = extname(file).toLowerCase();
  if (!VIDEO_EXTENSIONS.includes(extension)) fail(`${label}: extensión no admitida`);
  if (bytes > LIMITS[role]) fail(`${label}: ${bytes} bytes supera ${LIMITS[role]} bytes`);
  if (!Number.isFinite(metadata.duration) || metadata.duration < 6 || metadata.duration > 10)
    fail(`${label}: duración ${metadata.duration}; requiere 6–10 s`);

  const videoStreams = metadata.streams.filter((stream) => stream.codecType === 'video');
  if (videoStreams.length !== 1) fail(`${label}: requiere exactamente una pista de vídeo`);
  if (metadata.streams.some((stream) => stream.codecType === 'audio'))
    fail(`${label}: no puede contener audio`);

  const video = videoStreams[0];
  if (!video.width || !video.height) fail(`${label}: faltan dimensiones`);
  if (role === 'desktop' && video.width <= video.height)
    fail(`${label}: la fuente de escritorio debe ser apaisada`);
  if (role === 'mobile' && video.width > video.height)
    fail(`${label}: la fuente móvil debe tener encuadre propio vertical o cuadrado`);

  if (extension === '.mp4') {
    if (video.codecName !== 'h264') fail(`${label}: MP4 requiere H.264`);
    if (video.pixelFormat !== 'yuv420p') fail(`${label}: H.264 requiere yuv420p`);
    if (!metadata.formatName?.split(',').some((name) => ['mov', 'mp4'].includes(name)))
      fail(`${label}: contenedor MP4 no reconocido`);
    if (!hasFastStart(buffer)) fail(`${label}: el átomo moov debe preceder a mdat (faststart)`);
  } else {
    if (!['vp9', 'av1'].includes(video.codecName)) fail(`${label}: WebM requiere VP9 o AV1`);
    if (!metadata.formatName?.split(',').includes('webm'))
      fail(`${label}: contenedor WebM inválido`);
  }
}

export function validateClipEvidence({ clip, key, poster, file, bytes, buffer }) {
  requiredText(clip?.provider, `${key}.provider`);
  requiredText(clip?.model, `${key}.model`);
  requiredText(clip?.prompt, `${key}.prompt`, 20);
  requiredText(clip?.generatedAt, `${key}.generatedAt`);
  requiredText(clip?.approvedAt, `${key}.approvedAt`);
  if (clip?.approval !== 'visual-inspection') fail(`${key}.approval: requiere visual-inspection`);
  if (clip?.poster !== poster) fail(`${key}.poster: debe coincidir con ${poster}`);
  if (
    !Number.isFinite(Date.parse(clip.generatedAt)) ||
    !Number.isFinite(Date.parse(clip.approvedAt))
  )
    fail(`${key}: fechas inválidas`);
  if (Date.parse(clip.approvedAt) < Date.parse(clip.generatedAt))
    fail(`${key}: approvedAt precede a generatedAt`);
  if (!/^[a-f0-9]{64}$/.test(clip.sha256 ?? '')) fail(`${key}.sha256: huella inválida`);
  const actual = createHash('sha256').update(buffer).digest('hex');
  if (clip.sha256 !== actual) fail(`${key}.sha256: no coincide con ${file} (${bytes} bytes)`);
}

export async function probeVideo(file, ffprobe = process.env.FFPROBE_PATH ?? 'ffprobe') {
  let stdout;
  try {
    ({ stdout } = await run(ffprobe, [
      '-v',
      'error',
      '-show_entries',
      'format=duration,format_name:stream=codec_name,codec_type,width,height,pix_fmt',
      '-of',
      'json',
      file,
    ]));
  } catch (error) {
    if (error?.code === 'ENOENT')
      fail(
        `ffprobe no está disponible; instala FFmpeg o define FFPROBE_PATH para verificar ${file}`,
      );
    throw error;
  }
  const raw = JSON.parse(stdout);
  return {
    duration: Number(raw.format?.duration),
    formatName: raw.format?.format_name,
    streams: (raw.streams ?? []).map((stream) => ({
      codecName: stream.codec_name,
      codecType: stream.codec_type,
      width: stream.width,
      height: stream.height,
      pixelFormat: stream.pix_fmt,
    })),
  };
}

function resolveVideo(mediaDir, key) {
  const candidates = VIDEO_EXTENSIONS.map((extension) =>
    join(mediaDir, `${key}${extension}`),
  ).filter(existsSync);
  if (candidates.length !== 1)
    fail(
      `${key}: requiere exactamente un final local MP4 o WebM, encontrados ${candidates.length}`,
    );
  return candidates[0];
}

export async function auditHeroMotionTenant(dir, { probe = probeVideo } = {}) {
  const slug = dir.split('/').pop();
  const configSource = readFileSync(join(dir, 'config.ts'), 'utf8');
  const motion = extractHeroMotion(configSource);
  if (!motion) return false;
  if (motion.mobile === motion.desktop)
    fail(`${slug}: desktop y mobile no pueden reutilizar el mismo recorte`);

  const manifestPath = join(dir, 'movimiento.json');
  if (!existsSync(manifestPath)) fail(`${slug}: heroMotion requiere movimiento.json`);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (manifest.version !== 1 || !manifest.clips || typeof manifest.clips !== 'object')
    fail(`${slug}/movimiento.json: requiere version 1 y clips`);

  const poster = configString(configSource, 'staticHeroImage') ?? 'hero-anochecer';
  const requested = [
    ['desktop', motion.desktop],
    ...(motion.mobile ? [['mobile', motion.mobile]] : []),
  ];
  const requestedKeys = new Set(requested.map(([, key]) => key));
  const extra = Object.keys(manifest.clips).filter((key) => !requestedKeys.has(key));
  if (extra.length > 0) fail(`${slug}/movimiento.json: clips no activados: ${extra.join(', ')}`);

  for (const [role, key] of requested) {
    const file = resolveVideo(join(dir, 'content/media'), key);
    const buffer = readFileSync(file);
    const bytes = statSync(file).size;
    validateClipEvidence({ clip: manifest.clips[key], key, poster, file, bytes, buffer });
    assertVideoTechnical({ file, role, bytes, buffer, metadata: await probe(file) });
  }
  return true;
}

export async function auditHeroMotionRepository(repo = defaultRepo, options) {
  const tenantsDir = join(repo, 'tenants');
  const tenants = readdirSync(tenantsDir)
    .filter((slug) => slug !== '_template' && statSync(join(tenantsDir, slug)).isDirectory())
    .sort();
  const active = [];
  for (const slug of tenants) {
    if (await auditHeroMotionTenant(join(tenantsDir, slug), options)) active.push(slug);
  }
  return active;
}

if (resolve(process.argv[1] ?? '') === scriptPath) {
  const active = await auditHeroMotionRepository();
  console.log(
    `[hero-motion] ✓ ${active.length} tenant(s) con vídeo aprobado${
      active.length ? `: ${active.join(', ')}` : '; fallback estático intacto'
    }`,
  );
}
