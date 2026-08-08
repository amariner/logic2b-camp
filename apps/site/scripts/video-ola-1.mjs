import { execFile } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { chromium } from 'playwright';

const run = promisify(execFile);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDir, '..');
const outputDir = join(siteRoot, 'public/media');
const outputPath = join(outputDir, 'logic2b-primera-ola.mp4');
const origin = process.env.VIDEO_ORIGIN ?? 'http://127.0.0.1:4321';
const ffmpeg = process.env.FFMPEG_PATH ?? 'ffmpeg';
const ffprobe = process.env.FFPROBE_PATH ?? 'ffprobe';
const chromiumPath = process.env.CHROMIUM_PATH;
const workDir = await mkdtemp(join(tmpdir(), 'logic-camp-video-'));
const recordDir = join(workDir, 'recording');
const candidatePath = join(workDir, 'logic2b-primera-ola.mp4');

const FIXED_NOW = '2026-08-08T10:00:00+02:00';
const VIDEO_BUDGET_BYTES = 7_500_000;
const MIN_DURATION_SECONDS = 35;
const MAX_DURATION_SECONDS = 60;

await mkdir(recordDir, { recursive: true });
await mkdir(outputDir, { recursive: true });

let browser;

try {
  browser = await chromium.launch(chromiumPath ? { executablePath: chromiumPath } : undefined);
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    colorScheme: 'light',
    locale: 'es-ES',
    recordVideo: { dir: recordDir, size: { width: 1280, height: 720 } },
  });

  await context.addInitScript(
    ({ fixedNow }) => {
      const NativeDate = Date;
      const fixedTimestamp = NativeDate.parse(fixedNow);

      class FixedDate extends NativeDate {
        constructor(...args) {
          super(...(args.length === 0 ? [fixedTimestamp] : args));
        }

        static now() {
          return fixedTimestamp;
        }
      }

      Object.defineProperty(globalThis, 'Date', { value: FixedDate });
    },
    { fixedNow: FIXED_NOW },
  );

  const page = await context.newPage();
  const video = page.video();
  if (!video) throw new Error('Playwright no ha creado el stream de vídeo');

  const failures = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('status of 404'))
      failures.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => failures.push(`page: ${error.message}`));
  page.on('requestfailed', (request) => {
    const reason = request.failure()?.errorText ?? 'unknown';
    if (!reason.includes('ERR_ABORTED')) failures.push(`request: ${request.url()} (${reason})`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400) failures.push(`response: ${response.status()} ${response.url()}`);
  });

  const pause = (milliseconds) => page.waitForTimeout(milliseconds);
  const settle = async () => {
    await page.waitForLoadState('domcontentloaded');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() =>
      [...document.images].every((image) => image.complete && image.naturalWidth > 0),
    );
    await pause(650);
  };
  const reveal = async (locator, milliseconds) => {
    await locator.scrollIntoViewIfNeeded();
    await locator.waitFor({ state: 'visible' });
    await pause(milliseconds);
  };

  await page.goto(`${origin}/#campanas`, { waitUntil: 'domcontentloaded' });
  await settle();
  const searchCreative = page.locator('.campaign-card-search > a');
  await reveal(searchCreative, 3_600);
  await searchCreative.click();

  await settle();
  const dateInputs = page.locator('#mostrador input[type="date"]');
  await dateInputs.first().waitFor({ state: 'visible' });
  await pause(1_600);
  await dateInputs.nth(0).fill('2026-08-24');
  await dateInputs.nth(1).fill('2026-08-30');
  await page.getByRole('button', { name: 'Ver disponibilidad' }).click();
  const reserveLinks = page.getByRole('link', { name: /Reservar en la demo/ });
  await reserveLinks.nth(1).waitFor({ state: 'visible' });
  await pause(3_300);
  await reserveLinks.nth(1).click();

  await settle();
  const breakdownTitle = page.getByRole('heading', { name: 'Desglose del precio simulado' });
  await reveal(breakdownTitle, 2_000);
  await page.getByLabel('Cabaña de piscina').check();
  await pause(2_600);
  await page.getByRole('link', { name: /Continuar en la demo/ }).click();

  await settle();
  await page.getByLabel('Nombre ficticio').fill('Familia Demo');
  await pause(450);
  await page.getByLabel('Email de prueba').fill('familia@example.com');
  await pause(450);
  await page.getByLabel(/Entiendo que es una demostración/).check();
  await pause(2_300);
  await page.getByRole('button', { name: 'Confirmar reserva demo' }).click();

  await page.getByText(/Reserva demo confirmada\. Pago simulado/).waitFor({ state: 'visible' });
  await settle();
  await pause(5_000);

  await page.goto(`${origin}/demos/mardefondo/gestion/#/planning`, {
    waitUntil: 'domcontentloaded',
  });
  await settle();
  await page.getByText('300 unidades').first().waitFor({ state: 'visible' });
  await pause(5_500);

  await page.goto(`${origin}/demos/mardefondo/gestion/#/inteligente`, {
    waitUntil: 'domcontentloaded',
  });
  await settle();
  await page.getByText('Prototipo · no ejecuta cambios').waitFor({ state: 'visible' });
  await page.getByRole('heading', { name: /recomendación que enseña sus cuentas/ }).waitFor();
  await pause(6_500);

  if (failures.length > 0) throw new Error(failures.join('\n'));

  await context.close();
  const recordingPath = await video.path();
  await browser.close();
  browser = undefined;

  await run(
    ffmpeg,
    [
      '-y',
      '-i',
      recordingPath,
      '-an',
      '-vf',
      'fps=30,format=yuv420p',
      '-c:v',
      'libx264',
      '-preset',
      'medium',
      '-crf',
      '24',
      '-movflags',
      '+faststart',
      candidatePath,
    ],
    { maxBuffer: 10 * 1024 * 1024 },
  );

  const metadata = await probe(candidatePath);
  const videoStream = metadata.streams.find((stream) => stream.codec_type === 'video');
  const audioStream = metadata.streams.find((stream) => stream.codec_type === 'audio');
  const duration = Number(metadata.format.duration);
  const { size } = await stat(candidatePath);

  if (videoStream?.codec_name !== 'h264') throw new Error('El MP4 final no usa H.264');
  if (videoStream.width !== 1280 || videoStream.height !== 720)
    throw new Error(`Resolución inesperada: ${videoStream.width}×${videoStream.height}`);
  if (audioStream) throw new Error('El MP4 final contiene una pista de audio inesperada');
  if (duration < MIN_DURATION_SECONDS || duration > MAX_DURATION_SECONDS)
    throw new Error(`Duración fuera de contrato: ${duration.toFixed(2)} s`);
  if (size > VIDEO_BUDGET_BYTES)
    throw new Error(
      `El vídeo supera ${Math.round(VIDEO_BUDGET_BYTES / 1_000_000)} MB: ${size} bytes`,
    );

  await copyFile(candidatePath, outputPath);
  console.log(
    `logic2b-primera-ola.mp4 · ${duration.toFixed(1)} s · 1280×720 · ${Math.round(size / 1024)} kB`,
  );
} finally {
  if (browser) await browser.close().catch(() => undefined);
  await rm(workDir, { recursive: true, force: true });
}

async function probe(path) {
  const { stdout } = await run(ffprobe, [
    '-v',
    'error',
    '-show_entries',
    'format=duration,size:stream=codec_name,codec_type,width,height',
    '-of',
    'json',
    path,
  ]);
  return JSON.parse(stdout);
}
