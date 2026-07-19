import { applyD1Migrations, env } from 'cloudflare:test';

// Las migraciones reales de packages/db, aplicadas a la D1 de test (ADR 0013).
await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
