import { existsSync } from 'node:fs';
import { mkdir, rm, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '../../..');
const outputDir = join(repoRoot, 'tenants/mardefondo/content/media/capturas');
const origin = process.env.CAPTURE_ORIGIN ?? 'http://127.0.0.1:4173';
const chromiumPath =
  process.env.CHROMIUM_PATH ??
  (existsSync('/opt/pw-browsers/chromium')
    ? '/opt/pw-browsers/chromium'
    : existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : undefined);

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ executablePath: chromiumPath });
const context = await browser.newContext({
  viewport: { width: 1366, height: 768 },
  deviceScaleFactor: 1,
  reducedMotion: 'reduce',
  colorScheme: 'light',
});
const page = await context.newPage();
const failures = [];

page.on('console', (message) => {
  if (message.type() === 'error' && !message.text().includes('status of 404'))
    failures.push(`console: ${message.text()}`);
});
page.on('pageerror', (error) => failures.push(`page: ${error.message}`));
page.on('requestfailed', (request) =>
  failures.push(`request: ${request.url()} (${request.failure()?.errorText ?? 'unknown'})`),
);
page.on('response', (response) => {
  if (response.status() >= 400) failures.push(`response: ${response.status()} ${response.url()}`);
});

async function settle() {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
}

async function checkImages(label) {
  const brokenImages = await page
    .locator('img')
    .evaluateAll((images) =>
      images
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.src),
    );
  if (brokenImages.length > 0) failures.push(`${label} images: ${brokenImages.join(', ')}`);
}

async function writeWebp(name, screenshot) {
  const temporary = join(outputDir, `.${name}.png`);
  const destination = join(outputDir, `${name}.webp`);
  await screenshot(temporary);
  await sharp(temporary).webp({ quality: 78, effort: 5, smartSubsample: true }).toFile(destination);
  await rm(temporary);
  const { size } = await stat(destination);
  if (size > 450_000) throw new Error(`${name}.webp supera 450 kB (${size} bytes)`);
  console.log(`${name}.webp · ${Math.round(size / 1024)} kB`);
}

try {
  await page.goto(`${origin}/demos/mardefondo/`);
  await settle();
  await page
    .getByRole('heading', { name: 'Un horizonte amplio. Cada detalle bajo control.' })
    .waitFor();
  await checkImages('portada-reserva');
  await writeWebp('portada-reserva-1366', (path) => page.screenshot({ path }));

  await page.goto(`${origin}/demos/mardefondo/gestion/#/planning`);
  await settle();
  await page.getByText('300 unidades').first().waitFor({ state: 'visible' });
  await checkImages('planning');
  await writeWebp('planning-1366', (path) => page.screenshot({ path }));

  await page.goto(`${origin}/demos/mardefondo/gestion/#/inteligente`);
  await settle();
  await page.getByText('Prototipo · no ejecuta cambios').waitFor({ state: 'visible' });
  await checkImages('inteligente');
  await writeWebp('inteligente-1366', (path) => page.screenshot({ path }));

  if (failures.length > 0) throw new Error(failures.join('\n'));
} finally {
  await browser.close();
}
