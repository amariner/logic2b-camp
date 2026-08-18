import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';

const cacheDir = process.env.HERO_MOTION_FIXTURE_CACHE;
const fixtureRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: fixtureRoot,
  srcDir: join(fixtureRoot, 'src'),
  publicDir: join(fixtureRoot, 'public'),
  cacheDir: cacheDir ?? fileURLToPath(new URL('./.astro/', import.meta.url)),
  vite: {
    cacheDir: cacheDir ? join(cacheDir, 'vite') : join(fixtureRoot, '.vite'),
  },
});
