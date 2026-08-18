import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, it } from 'node:test';
import { rm } from 'node:fs/promises';
import { approveClip, ffmpegArgs, rejectClip, stageClip } from './hero-motion-pipeline.mjs';

const roots = [];
const box = (type) => {
  const result = Buffer.alloc(8);
  result.writeUInt32BE(8, 0);
  result.write(type, 4, 4, 'ascii');
  return result;
};
const fastMp4 = Buffer.concat([box('ftyp'), box('moov'), box('mdat')]);
const desktopMetadata = {
  duration: 6.2,
  formatName: 'mov,mp4,m4a,3gp,3g2,mj2',
  streams: [
    {
      codecName: 'h264',
      codecType: 'video',
      width: 1280,
      height: 720,
      pixelFormat: 'yuv420p',
    },
  ],
};

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function fixture() {
  const repo = await mkdtemp(join(tmpdir(), 'logic-camp-motion-pipeline-'));
  roots.push(repo);
  const tenant = join(repo, 'tenants', 'olivar');
  const media = join(tenant, 'content', 'media');
  await mkdir(media, { recursive: true });
  await writeFile(
    join(tenant, 'config.ts'),
    `export const config = { staticHeroImage: 'hero-dia' };`,
  );
  const source = join(repo, 'raw.mov');
  await writeFile(source, Buffer.from('raw-provider-bytes'));
  const evidencePath = join(repo, 'evidence.json');
  await writeFile(
    evidencePath,
    JSON.stringify({
      provider: 'higgsfield',
      model: 'seedance_2_0',
      prompt: 'Locked-off documentary motion with stable geometry and exposure.',
      generatedAt: '2026-08-18T15:00:00.000Z',
    }),
  );
  const ffmpeg = async (_command, args) => writeFile(args.at(-1), fastMp4);
  const probe = async () => desktopMetadata;
  return { repo, media, source, evidencePath, ffmpeg, probe };
}

async function missing(path) {
  try {
    await access(path);
    return false;
  } catch {
    return true;
  }
}

describe('pipeline de hero motion', () => {
  it('normaliza a una sola pista H.264 y elimina el audio con faststart', () => {
    const args = ffmpegArgs('/tmp/raw.mov', '/tmp/final.mp4');
    assert.deepEqual(args.slice(args.indexOf('-map'), args.indexOf('-map') + 2), ['-map', '0:v:0']);
    assert.ok(args.includes('-an'));
    assert.deepEqual(args.slice(args.indexOf('-c:v'), args.indexOf('-c:v') + 2), [
      '-c:v',
      'libx264',
    ]);
    assert.deepEqual(args.slice(args.indexOf('-vf'), args.indexOf('-vf') + 2), [
      '-vf',
      'format=yuv420p',
    ]);
    assert.deepEqual(args.slice(args.indexOf('-movflags'), args.indexOf('-movflags') + 2), [
      '-movflags',
      '+faststart',
    ]);
  });

  it('deja vídeo y procedencia en staging sin activar el tenant', async () => {
    const context = await fixture();
    const result = await stageClip({
      ...context,
      slug: 'olivar',
      role: 'desktop',
    });
    const stagedEvidence = JSON.parse(
      await readFile(join(context.media, '.motion-staging', 'hero-motion.json'), 'utf8'),
    );
    assert.equal(result.path, join(context.media, '.motion-staging', 'hero-motion.mp4'));
    assert.equal(stagedEvidence.poster, 'hero-dia');
    assert.equal(stagedEvidence.provider, 'higgsfield');
    assert.equal(
      stagedEvidence.normalizedSha256,
      createHash('sha256').update(fastMp4).digest('hex'),
    );
    assert.equal(await missing(join(context.media, 'hero-motion.mp4')), true);
    assert.equal(await missing(join(context.repo, 'tenants', 'olivar', 'movimiento.json')), true);
  });

  it('publica solo tras aprobación explícita y crea la evidencia final', async () => {
    const context = await fixture();
    await stageClip({ ...context, slug: 'olivar', role: 'desktop' });
    await approveClip({
      ...context,
      slug: 'olivar',
      role: 'desktop',
      now: () => new Date('2026-08-18T15:05:00.000Z'),
    });
    const manifest = JSON.parse(
      await readFile(join(context.repo, 'tenants', 'olivar', 'movimiento.json'), 'utf8'),
    );
    assert.equal(manifest.version, 1);
    assert.deepEqual(manifest.clips['hero-motion'], {
      poster: 'hero-dia',
      provider: 'higgsfield',
      model: 'seedance_2_0',
      prompt: 'Locked-off documentary motion with stable geometry and exposure.',
      generatedAt: '2026-08-18T15:00:00.000Z',
      approvedAt: '2026-08-18T15:05:00.000Z',
      approval: 'visual-inspection',
      sha256: createHash('sha256').update(fastMp4).digest('hex'),
    });
    assert.deepEqual(await readFile(join(context.media, 'hero-motion.mp4')), fastMp4);
    assert.equal(await missing(join(context.media, '.motion-staging', 'hero-motion.json')), true);
  });

  it('conserva un rechazo fuera del runtime sin crear manifiesto', async () => {
    const context = await fixture();
    await stageClip({ ...context, slug: 'olivar', role: 'desktop' });
    const result = await rejectClip({
      ...context,
      slug: 'olivar',
      role: 'desktop',
      reason: 'exposición pulsante',
      now: () => new Date('2026-08-18T15:04:00.000Z'),
    });
    const evidence = JSON.parse(await readFile(result.evidencePath, 'utf8'));
    assert.equal(evidence.reason, 'exposición pulsante');
    assert.deepEqual(await readFile(result.path), fastMp4);
    assert.equal(await missing(join(context.media, 'hero-motion.mp4')), true);
    assert.equal(await missing(join(context.repo, 'tenants', 'olivar', 'movimiento.json')), true);
  });

  it('rechaza un supuesto móvil que siga siendo apaisado', async () => {
    const context = await fixture();
    await assert.rejects(
      stageClip({ ...context, slug: 'olivar', role: 'mobile' }),
      /fuente móvil debe tener encuadre propio/,
    );
    assert.equal(
      await missing(join(context.media, '.motion-staging', 'hero-motion-mobile.mp4')),
      true,
    );
  });
});
