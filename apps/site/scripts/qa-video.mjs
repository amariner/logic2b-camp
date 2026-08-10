import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { chromium } from 'playwright';

const run = promisify(execFile);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDir, '..');
const videoPath = join(siteRoot, 'public/media/logic2b-primera-ola.mp4');
const origin = process.env.VIDEO_QA_ORIGIN ?? 'http://127.0.0.1:4321';
const screenshotDir = process.env.VIDEO_QA_OUTPUT ?? '/tmp';
const chromiumPath = process.env.CHROMIUM_PATH;
const ffprobe = process.env.FFPROBE_PATH ?? 'ffprobe';
const variants = [
  { locale: 'es', path: '/', width: 1366, height: 900 },
  { locale: 'es', path: '/', width: 375, height: 812 },
  { locale: 'en', path: '/en/', width: 1366, height: 900 },
  { locale: 'en', path: '/en/', width: 375, height: 812 },
];

await mkdir(screenshotDir, { recursive: true });
const file = await stat(videoPath);
assert.ok(file.size <= 7_500_000, `el MP4 pesa ${file.size} bytes`);

const metadata = await inspectVideo();
assert.equal(metadata.codec, 'h264');
assert.equal(metadata.width, 1280);
assert.equal(metadata.height, 720);
assert.equal(metadata.hasAudio, false);
assert.ok(metadata.duration >= 35 && metadata.duration <= 60);

const browser = await chromium.launch(chromiumPath ? { executablePath: chromiumPath } : undefined);

try {
  for (const variant of variants) {
    const context = await browser.newContext({
      viewport: { width: variant.width, height: variant.height },
      reducedMotion: 'reduce',
      colorScheme: 'light',
    });
    const page = await context.newPage();
    const failures = [];

    page.on('console', (message) => {
      if (message.type() === 'error') failures.push(`console: ${message.text()}`);
    });
    page.on('pageerror', (error) => failures.push(`page: ${error.message}`));
    page.on('requestfailed', (request) => {
      const reason = request.failure()?.errorText ?? 'unknown';
      // `preload=metadata` cancela deliberadamente el rango restante del MP4
      // cuando ya conoce duración y dimensiones.
      if (!reason.includes('ERR_ABORTED')) failures.push(`request: ${request.url()} (${reason})`);
    });
    page.on('response', (response) => {
      if (response.status() >= 400)
        failures.push(`response: ${response.status()} ${response.url()}`);
    });

    await page.goto(`${origin}${variant.path}`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    const section = page.locator('#video-ola-1');
    await section.scrollIntoViewIfNeeded();
    const video = section.locator('video');
    await video.waitFor({ state: 'visible' });
    await page.waitForFunction(() => {
      const element = document.querySelector('#video-ola-1 video');
      return element && (element.readyState >= 1 || element.error);
    });

    const player = await video.evaluate((element) => {
      const media = /** @type {HTMLVideoElement} */ (element);
      return {
        autoplay: media.autoplay,
        controls: media.controls,
        paused: media.paused,
        playsInline: media.playsInline,
        preload: media.preload,
        duration: media.duration,
        width: media.videoWidth,
        height: media.videoHeight,
        error: media.error?.message ?? null,
        poster: media.poster,
      };
    });
    assert.deepEqual(
      {
        autoplay: player.autoplay,
        controls: player.controls,
        paused: player.paused,
        playsInline: player.playsInline,
        preload: player.preload,
        width: player.width,
        height: player.height,
        error: player.error,
      },
      {
        autoplay: false,
        controls: true,
        paused: true,
        playsInline: true,
        preload: 'metadata',
        width: 1280,
        height: 720,
        error: null,
      },
    );
    assert.ok(player.duration >= 35 && player.duration <= 60);
    assert.ok(player.poster.length > 0);

    const tracks = await section.locator('track').evaluateAll((items) =>
      items.map((item) => ({
        language: item.srclang,
        default: item.default,
        src: item.getAttribute('src'),
      })),
    );
    assert.deepEqual(
      tracks.map((item) => item.language),
      ['es', 'en'],
    );
    assert.equal(tracks.filter((item) => item.default).length, 1);
    assert.equal(tracks.find((item) => item.default)?.language, variant.locale);
    assert.ok(tracks.every((item) => item.src?.endsWith(`.${item.language}.vtt`)));
    assert.equal(await section.locator('.guided-transcript li').count(), 4);

    await video.focus();
    const outline = await video.evaluate((element) => {
      const style = getComputedStyle(element);
      return { style: style.outlineStyle, width: Number.parseFloat(style.outlineWidth) };
    });
    assert.notEqual(outline.style, 'none');
    assert.ok(outline.width >= 2);

    const overflow = await page.evaluate(() => ({
      body: document.body.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    assert.ok(overflow.body <= overflow.viewport);
    assert.deepEqual(failures, []);

    await section.screenshot({
      path: join(screenshotDir, `logic-camp-video-${variant.locale}-${variant.width}.png`),
      animations: 'disabled',
    });
    console.log(
      `${variant.locale} · ${variant.width}px · ${player.duration.toFixed(1)} s · controles, pistas y foco correctos`,
    );
    await context.close();
  }
} finally {
  await browser.close();
}

async function inspectVideo() {
  try {
    const { stdout } = await run(ffprobe, [
      '-v',
      'error',
      '-show_entries',
      'format=duration:stream=codec_name,codec_type,width,height',
      '-of',
      'json',
      videoPath,
    ]);
    const data = JSON.parse(stdout);
    const stream = data.streams.find((item) => item.codec_type === 'video');
    return {
      codec: stream?.codec_name,
      width: stream?.width,
      height: stream?.height,
      hasAudio: data.streams.some((item) => item.codec_type === 'audio'),
      duration: Number(data.format.duration),
    };
  } catch (error) {
    if (error?.code !== 'ENOENT' || process.platform !== 'darwin') throw error;
    // macOS trae Spotlight aunque no tenga FFmpeg. Mantiene la misma prueba
    // local sin convertir la ausencia opcional de ffprobe en un falso rojo.
    const mdls = async (key) =>
      (await run('/usr/bin/mdls', ['-raw', '-name', key, videoPath])).stdout.trim();
    const codecs = await mdls('kMDItemCodecs');
    const audioBitRate = await mdls('kMDItemAudioBitRate');
    return {
      codec: codecs.includes('H.264') ? 'h264' : codecs,
      width: Number(await mdls('kMDItemPixelWidth')),
      height: Number(await mdls('kMDItemPixelHeight')),
      hasAudio: audioBitRate !== '(null)',
      duration: Number(await mdls('kMDItemDurationSeconds')),
    };
  }
}
