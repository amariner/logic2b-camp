import { defineWorkersConfig, readD1Migrations } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig(async () => {
  const migrations = await readD1Migrations('../../packages/db/migrations');
  return {
    test: {
      setupFiles: ['./test/apply-migrations.ts'],
      poolOptions: {
        workers: {
          // El pool de Cloudflare no usa fileParallelism: singleWorker agrupa
          // los ficheros y evita el fallo HashIndex/segfault del runtime en CI.
          singleWorker: true,
          // config de test con DOS D1 (fuga cruzada entre tenants)
          wrangler: { configPath: './test/wrangler.test.jsonc' },
          miniflare: {
            bindings: { TEST_MIGRATIONS: migrations },
          },
        },
      },
    },
  };
});
