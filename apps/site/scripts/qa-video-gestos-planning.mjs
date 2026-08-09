import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { chromium } from 'playwright';
import sharp from 'sharp';

const run = promisify(execFile);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDir, '..');
const videoPath = join(siteRoot, 'public/media/logic2b-gestos-planning.mp4');
const posterPath = join(siteRoot, 'public/media/logic2b-gestos-planning-poster.webp');
const trackPath = join(siteRoot, 'public/media/logic2b-gestos-planning.es.vtt');
const origin = process.env.PLANNING_VIDEO_QA_ORIGIN ?? 'http://127.0.0.1:4321';
const screenshotDir = process.env.PLANNING_VIDEO_QA_OUTPUT ?? '/tmp';
const chromiumPath = process.env.CHROMIUM_PATH;
const ffprobe = process.env.FFPROBE_PATH ?? 'ffprobe';
const variants = [
  { width: 1366, height: 900 },
  { width: 375, height: 812 },
];

await mkdir(screenshotDir, { recursive: true });
const videoFile = await stat(videoPath);
const posterFile = await stat(posterPath);
assert.ok(videoFile.size <= 2_000_000, `el MP4 pesa ${videoFile.size} bytes`);
assert.ok(posterFile.size <= 350_000, `el póster pesa ${posterFile.size} bytes`);

const { stdout } = await run(ffprobe, [
  '-v',
  'error',
  '-show_entries',
  'format=duration:stream=codec_name,codec_type,width,height',
  '-of',
  'json',
  videoPath,
]);
const metadata = JSON.parse(stdout);
const stream = metadata.streams.find((item) => item.codec_type === 'video');
const duration = Number(metadata.format.duration);
assert.equal(stream?.codec_name, 'h264');
assert.equal(stream?.width, 1280);
assert.equal(stream?.height, 720);
assert.equal(
  metadata.streams.some((item) => item.codec_type === 'audio'),
  false,
);
assert.ok(duration >= 20 && duration <= 35, `duración ${duration}`);

const poster = await sharp(posterPath).metadata();
assert.equal(poster.format, 'webp');
assert.equal(poster.width, 1280);
assert.equal(poster.height, 720);
const track = await readFile(trackPath, 'utf8');
assert.match(track, /^WEBVTT/);
assert.equal((track.match(/-->/g) ?? []).length, 3);

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
      if (!reason.includes('ERR_ABORTED')) failures.push(`request: ${request.url()} (${reason})`);
    });
    page.on('response', (response) => {
      if (response.status() >= 400)
        failures.push(`response: ${response.status()} ${response.url()}`);
    });

    await page.goto(`${origin}/docs/recepcion/mover/`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    const section = page.locator('#video-gestos-planning');
    await section.scrollIntoViewIfNeeded();
    const video = section.locator('video');
    await video.waitFor({ state: 'visible' });
    await page.waitForFunction(() => {
      const element = document.querySelector('#video-gestos-planning video');
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
    assert.ok(player.duration >= 20 && player.duration <= 35);
    assert.ok(player.poster.endsWith('/media/logic2b-gestos-planning-poster.webp'));
    assert.equal(await section.locator('track[kind="captions"][srclang="es"]').count(), 1);
    assert.equal(await section.locator('.planning-video-transcript li').count(), 3);
    assert.match(await section.locator('figcaption').innerText(), /no se confirma/i);

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
      path: join(screenshotDir, `logic-camp-planning-video-${variant.width}.png`),
      animations: 'disabled',
    });
    console.log(
      `${variant.width}px · ${player.duration.toFixed(1)} s · controles, pista, foco y texto correctos`,
    );
    await context.close();
  }
} finally {
  await browser.close();
}
