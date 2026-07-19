import type { D1Migration } from '@cloudflare/workers-types/experimental';

declare module 'cloudflare:test' {
  interface ProvidedEnv {
    DB: D1Database;
    TENANT_SLUG?: string;
    TEST_MIGRATIONS: D1Migration[];
  }
}
