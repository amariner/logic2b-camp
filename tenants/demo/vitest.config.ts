import { defineWorkersConfig, readD1Migrations } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig(async () => {
  const migrations = await readD1Migrations('../../packages/db/migrations');
  return {
    test: {
      setupFiles: ['./test/apply-migrations.ts'],
      // seed.test.ts barre ~20 anclas por aserción (3–9 s cada una en un
      // portátil cargado): el límite por defecto de 5 s daba timeouts aleatorios.
      testTimeout: 30_000,
      poolOptions: {
        workers: {
          // El pool de Cloudflare no usa fileParallelism: singleWorker agrupa
          // los tres ficheros D1 y evita su HashIndex/segfault interno en CI.
          singleWorker: true,
          wrangler: { configPath: './test/wrangler.test.jsonc' },
          miniflare: {
            bindings: { TEST_MIGRATIONS: migrations },
          },
        },
      },
    },
  };
});
