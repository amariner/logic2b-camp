import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import {
  assertVideoTechnical,
  auditHeroMotionTenant,
  extractHeroMotion,
  hasFastStart,
} from './hero-motion-contract.mjs';

function box(type, payload = Buffer.alloc(0)) {
  const result = Buffer.alloc(8 + payload.length);
  result.writeUInt32BE(result.length, 0);
  result.write(type, 4, 4, 'ascii');
  payload.copy(result, 8);
  return result;
}

const fastMp4 = Buffer.concat([box('ftyp'), box('moov'), box('mdat')]);
const slowMp4 = Buffer.concat([box('ftyp'), box('mdat'), box('moov')]);
const validMetadata = {
  duration: 6.5,
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

describe('contrato técnico de hero motion', () => {
  it('extrae solo claves locales declaradas en config', () => {
    assert.deepEqual(
      extractHeroMotion(`heroMotion: {
        desktop: 'hero-motion',
        mobile: 'hero-motion-mobile',
        position: '52% center',
      },`),
      { desktop: 'hero-motion', mobile: 'hero-motion-mobile', position: '52% center' },
    );
    assert.equal(extractHeroMotion(`staticHeroImage: 'hero-dia'`), null);
  });

  it('detecta faststart por el orden real de átomos MP4', () => {
    assert.equal(hasFastStart(fastMp4), true);
    assert.equal(hasFastStart(slowMp4), false);
  });

  it('rechaza audio, duración, píxeles y faststart incorrectos', () => {
    assert.throws(
      () =>
        assertVideoTechnical({
          file: 'hero.mp4',
          role: 'desktop',
          bytes: 100,
          buffer: fastMp4,
          metadata: { ...validMetadata, duration: 11 },
        }),
      /duración/,
    );
    assert.throws(
      () =>
        assertVideoTechnical({
          file: 'hero.mp4',
          role: 'desktop',
          bytes: 100,
          buffer: fastMp4,
          metadata: {
            ...validMetadata,
            streams: [...validMetadata.streams, { codecType: 'audio', codecName: 'aac' }],
          },
        }),
      /audio/,
    );
    assert.throws(
      () =>
        assertVideoTechnical({
          file: 'hero.mp4',
          role: 'desktop',
          bytes: 100,
          buffer: fastMp4,
          metadata: {
            ...validMetadata,
            streams: [{ ...validMetadata.streams[0], pixelFormat: 'yuv444p' }],
          },
        }),
      /yuv420p/,
    );
    assert.throws(
      () =>
        assertVideoTechnical({
          file: 'hero.mp4',
          role: 'desktop',
          bytes: 100,
          buffer: slowMp4,
          metadata: validMetadata,
        }),
      /faststart/,
    );
  });

  it('exige trazabilidad y verifica la huella del final aprobado', async () => {
    const root = mkdtempSync(join(tmpdir(), 'logic-camp-motion-'));
    try {
      const media = join(root, 'content/media');
      mkdirSync(media, { recursive: true });
      writeFileSync(
        join(root, 'config.ts'),
        `export const config = {
          staticHeroImage: 'hero-dia',
          heroMotion: { desktop: 'hero-motion' },
        };`,
      );
      writeFileSync(join(media, 'hero-motion.mp4'), fastMp4);
      const sha256 = createHash('sha256').update(fastMp4).digest('hex');
      writeFileSync(
        join(root, 'movimiento.json'),
        JSON.stringify({
          version: 1,
          clips: {
            'hero-motion': {
              poster: 'hero-dia',
              provider: 'higgsfield',
              model: 'seedance_2_0',
              prompt: 'Movimiento ambiental lento y estable para el héroe.',
              generatedAt: '2026-08-18T15:00:00.000Z',
              approvedAt: '2026-08-18T15:05:00.000Z',
              approval: 'visual-inspection',
              sha256,
            },
          },
        }),
      );
      assert.equal(await auditHeroMotionTenant(root, { probe: async () => validMetadata }), true);

      const manifest = JSON.parse(
        await import('node:fs/promises').then(({ readFile }) =>
          readFile(join(root, 'movimiento.json'), 'utf8'),
        ),
      );
      manifest.clips['hero-motion'].sha256 = '0'.repeat(64);
      writeFileSync(join(root, 'movimiento.json'), JSON.stringify(manifest));
      await assert.rejects(
        auditHeroMotionTenant(root, { probe: async () => validMetadata }),
        /no coincide/,
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
