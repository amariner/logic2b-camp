import { applyD1Migrations, env } from 'cloudflare:test';

// Las migraciones reales de packages/db, aplicadas a las dos D1 de test.
await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
await applyD1Migrations(env.DB_B, env.TEST_MIGRATIONS);
