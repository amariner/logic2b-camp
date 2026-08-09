import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { copyFile, mkdir, mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { chromium } from 'playwright';
import sharp from 'sharp';

const run = promisify(execFile);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDir, '..');
const distRoot = join(siteRoot, 'dist');
const managerEntry = join(distRoot, 'demos/mardefondo/gestion/index.html');
const outputDir = join(siteRoot, 'public/media');
const outputVideo = join(outputDir, 'logic2b-gestos-planning.mp4');
const outputPoster = join(outputDir, 'logic2b-gestos-planning-poster.webp');
const ffmpeg = process.env.FFMPEG_PATH ?? 'ffmpeg';
const ffprobe = process.env.FFPROBE_PATH ?? 'ffprobe';
const chromiumPath = process.env.CHROMIUM_PATH;
const workDir = await mkdtemp(join(tmpdir(), 'logic-camp-planning-video-'));
const recordDir = join(workDir, 'recording');
const candidateVideo = join(workDir, 'logic2b-gestos-planning.mp4');
const candidatePoster = join(workDir, 'logic2b-gestos-planning-poster.webp');
const posterPng = join(workDir, 'poster.png');

const FIXED_NOW = '2026-08-08T10:00:00+02:00';
const VIDEO_BUDGET_BYTES = 2_000_000;
const POSTER_BUDGET_BYTES = 350_000;
const MIN_DURATION_SECONDS = 20;
const MAX_DURATION_SECONDS = 35;

await stat(managerEntry).catch(() => {
  throw new Error(
    'Falta el bundle compuesto. Ejecuta `pnpm --filter @logic-camp/api bundle:demo` antes de grabar.',
  );
});
await mkdir(recordDir, { recursive: true });
await mkdir(outputDir, { recursive: true });

let browser;
let localServer;

try {
  const externalOrigin = process.env.PLANNING_VIDEO_ORIGIN;
  if (!externalOrigin) localServer = await serveStatic(distRoot);
  const origin = externalOrigin ?? localServer.origin;

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
      localStorage.removeItem('logic2b-demo:mardefondo:manager-state:v1');
      localStorage.removeItem('logic2b-demo:mardefondo:public-bookings:v1');
    },
    { fixedNow: FIXED_NOW },
  );

  const page = await context.newPage();
  const video = page.video();
  if (!video) throw new Error('Playwright no ha creado el stream de vídeo');

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
    if (response.status() >= 400) failures.push(`response: ${response.status()} ${response.url()}`);
  });

  const pause = (milliseconds) => page.waitForTimeout(milliseconds);
  const drag = async (locator, deltaX, deltaY, duration = 900) => {
    const box = await locator.boundingBox();
    if (!box) throw new Error('No se ha podido medir el elemento que se arrastra');
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    const steps = 14;
    await page.mouse.move(startX, startY);
    await pause(350);
    await page.mouse.down();
    for (let step = 1; step <= steps; step += 1) {
      await page.mouse.move(startX + (deltaX * step) / steps, startY + (deltaY * step) / steps);
      await pause(Math.round(duration / steps));
    }
    await pause(300);
    await page.mouse.up();
  };

  await page.goto(`${origin}/demos/mardefondo/gestion/#/planning?date=2026-08-01`, {
    waitUntil: 'domcontentloaded',
  });
  await page.evaluate(() => document.fonts.ready);
  await page.getByText('300 unidades').first().waitFor({ state: 'visible' });
  // En 1280 px el final de la reserva firma queda fuera del viewport en zoom
  // mensual. Temporada conserva el gesto, pero deja visibles los dos bordes.
  await page.getByRole('button', { name: 'Temporada' }).click();
  await page.getByLabel('Filtrar por tipo').selectOption({ label: 'Bungalow Laguna' });

  let signature = page.locator('.lc-bar[title^="MF-DEMO-001"]').first();
  await signature.waitFor({ state: 'visible' });
  await pause(2_600);
  await page.screenshot({ path: posterPng, animations: 'disabled' });

  // 1 · mover un día: seis noches conservan el importe del fixture y el
  // adaptador demo confirma la mutación reversible sin diálogo intermedio.
  await drag(signature, 22, 0);
  await page.getByText(/Estancia movida:/).waitFor({ state: 'visible' });
  await pause(3_200);

  // 2 · estirar la salida: una noche extra obliga a revisar el precio antes de
  // confirmar, igual que en producción.
  signature = page.locator('.lc-bar[title^="MF-DEMO-001"]').first();
  await signature.waitFor({ state: 'visible' });
  const rightHandle = signature.locator('.lc-handle-r');
  await drag(rightHandle, 22, 0);
  await page
    .getByRole('heading', { name: 'El precio cambia con las fechas nuevas' })
    .waitFor({ state: 'visible' });
  await pause(2_200);
  await page.getByRole('button', { name: /Confirmar por/ }).click();
  await page.getByText(/Estancia movida:/).waitFor({ state: 'visible' });
  await pause(3_100);

  // 3 · seleccionar un hueco libre abre el alta con unidad y fechas. La pieza
  // termina aquí: no pulsa «Crear la reserva» ni finge permisos o resultados.
  const emptyRow = page.locator('[data-unit-row="unit_mf_bl_001"]');
  await emptyRow.waitFor({ state: 'visible' });
  const rowBox = await emptyRow.boundingBox();
  if (!rowBox) throw new Error('No se ha podido medir la fila libre BL-001');
  const startX = rowBox.x + 4 * 22 + 5;
  const startY = rowBox.y + rowBox.height / 2;
  const endX = rowBox.x + 7 * 22 + 17;
  await page.mouse.move(startX, startY);
  await pause(350);
  await page.mouse.down();
  for (let step = 1; step <= 14; step += 1) {
    await page.mouse.move(startX + ((endX - startX) * step) / 14, startY);
    await pause(65);
  }
  await pause(300);
  await page.mouse.up();
  const newBooking = page.getByRole('dialog', { name: 'Nueva reserva' });
  await newBooking.waitFor({ state: 'visible' });
  await newBooking.getByText('Unidad BL-001 (si sigue libre al crear)').waitFor();
  await pause(4_200);

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
      candidateVideo,
    ],
    { maxBuffer: 10 * 1024 * 1024 },
  );
  await sharp(posterPng)
    .webp({ quality: 78, effort: 5, smartSubsample: true })
    .toFile(candidatePoster);

  const metadata = await probe(candidateVideo);
  const videoStream = metadata.streams.find((stream) => stream.codec_type === 'video');
  const audioStream = metadata.streams.find((stream) => stream.codec_type === 'audio');
  const duration = Number(metadata.format.duration);
  const videoFile = await stat(candidateVideo);
  const posterFile = await stat(candidatePoster);
  const posterMeta = await sharp(candidatePoster).metadata();

  if (videoStream?.codec_name !== 'h264') throw new Error('El MP4 final no usa H.264');
  if (videoStream.width !== 1280 || videoStream.height !== 720)
    throw new Error(`Resolución inesperada: ${videoStream.width}×${videoStream.height}`);
  if (audioStream) throw new Error('El MP4 final contiene una pista de audio inesperada');
  if (duration < MIN_DURATION_SECONDS || duration > MAX_DURATION_SECONDS)
    throw new Error(`Duración fuera de contrato: ${duration.toFixed(2)} s`);
  if (videoFile.size > VIDEO_BUDGET_BYTES)
    throw new Error(`El vídeo supera 2 MB: ${videoFile.size} bytes`);
  if (posterMeta.width !== 1280 || posterMeta.height !== 720 || posterMeta.format !== 'webp')
    throw new Error(
      `Póster inesperado: ${posterMeta.format} ${posterMeta.width}×${posterMeta.height}`,
    );
  if (posterFile.size > POSTER_BUDGET_BYTES)
    throw new Error(`El póster supera 350 kB: ${posterFile.size} bytes`);

  await copyFile(candidateVideo, outputVideo);
  await copyFile(candidatePoster, outputPoster);
  console.log(
    `logic2b-gestos-planning.mp4 · ${duration.toFixed(1)} s · 1280×720 · ${Math.round(videoFile.size / 1024)} kB`,
  );
  console.log(
    `logic2b-gestos-planning-poster.webp · 1280×720 · ${Math.round(posterFile.size / 1024)} kB`,
  );
} finally {
  if (browser) await browser.close().catch(() => undefined);
  if (localServer) await localServer.close().catch(() => undefined);
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

async function serveStatic(root) {
  const mime = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.woff2': 'font/woff2',
  };
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
      let candidate = resolve(root, `.${pathname}`);
      const rel = relative(root, candidate);
      if (rel.startsWith('..') || rel === '..') throw new Error('path_outside_root');
      const info = await stat(candidate).catch(() => null);
      if (info?.isDirectory()) candidate = join(candidate, 'index.html');
      const body = await readFile(candidate);
      response.writeHead(200, {
        'content-type': mime[extname(candidate)] ?? 'application/octet-stream',
        'cache-control': 'no-store',
      });
      response.end(body);
    } catch {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Not found');
    }
  });
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const address = server.address();
  if (!address || typeof address === 'string')
    throw new Error('No se pudo abrir el servidor local');
  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise((resolveClose, reject) => server.close((e) => (e ? reject(e) : resolveClose()))),
  };
}
