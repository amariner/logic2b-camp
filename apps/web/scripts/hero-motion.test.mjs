import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { canPlayHeroMotion, heroVideoMimeType, syncHeroMotion } from '../src/lib/hero-motion.mjs';

function videoFixture({ playRejects = false } = {}) {
  const attributes = new Map([['data-ready', '']]);
  const sources = [
    { dataset: { src: '/media/hero-mobile.hash.webm' }, src: '' },
    { dataset: { src: '/media/hero.hash.mp4' }, src: '' },
  ];
  const calls = { load: 0, pause: 0, play: 0 };
  return {
    video: {
      dataset: {},
      load() {
        calls.load += 1;
      },
      pause() {
        calls.pause += 1;
      },
      async play() {
        calls.play += 1;
        if (playRejects) throw new Error('autoplay rechazado');
      },
      querySelectorAll() {
        return sources;
      },
      setAttribute(name, value) {
        attributes.set(name, value);
      },
      removeAttribute(name) {
        attributes.delete(name);
      },
    },
    attributes,
    calls,
    sources,
  };
}

describe('hero motion progresivo', () => {
  it('declara el MIME real aunque Vite añada hash o query', () => {
    assert.equal(heroVideoMimeType('/hero.abc123.webm'), 'video/webm');
    assert.equal(heroVideoMimeType('/hero.webm?url'), 'video/webm');
    assert.equal(heroVideoMimeType('/hero.abc123.mp4'), 'video/mp4');
  });

  it('bloquea reproducción con movimiento reducido o ahorro de datos', () => {
    assert.equal(canPlayHeroMotion({ reducedMotion: false, saveData: false }), true);
    assert.equal(canPlayHeroMotion({ reducedMotion: true, saveData: false }), false);
    assert.equal(canPlayHeroMotion({ reducedMotion: false, saveData: true }), false);
  });

  it('no hidrata fuentes mientras la preferencia bloquea el vídeo', async () => {
    const fixture = videoFixture();
    assert.equal(await syncHeroMotion(fixture.video, false), false);
    assert.deepEqual(fixture.calls, { load: 0, pause: 1, play: 0 });
    assert.deepEqual(
      fixture.sources.map((source) => source.src),
      ['', ''],
    );
    assert.equal(fixture.video.dataset.initialized, undefined);
    assert.equal(fixture.attributes.has('data-ready'), false);
  });

  it('hidrata una sola vez y puede reanudar después de cambiar la preferencia', async () => {
    const fixture = videoFixture();
    assert.equal(await syncHeroMotion(fixture.video, true), true);
    assert.deepEqual(fixture.calls, { load: 1, pause: 0, play: 1 });
    assert.deepEqual(
      fixture.sources.map((source) => source.src),
      ['/media/hero-mobile.hash.webm', '/media/hero.hash.mp4'],
    );
    assert.equal(fixture.attributes.has('data-ready'), true);

    await syncHeroMotion(fixture.video, false);
    assert.equal(fixture.attributes.has('data-ready'), false);
    assert.equal(await syncHeroMotion(fixture.video, true), true);
    assert.deepEqual(fixture.calls, { load: 1, pause: 1, play: 2 });
  });

  it('conserva el póster si autoplay o la carga fallan', async () => {
    const fixture = videoFixture({ playRejects: true });
    assert.equal(await syncHeroMotion(fixture.video, true), false);
    assert.equal(fixture.attributes.has('data-ready'), false);
  });
});
