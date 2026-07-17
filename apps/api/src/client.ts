/** Cliente RPC tipado para web y dashboard: tipos end-to-end sin codegen. */
import { hc } from 'hono/client';
import type { AppType } from './app';

export const createApiClient = (baseUrl: string, init?: RequestInit) =>
  hc<AppType>(baseUrl, { init });

export type ApiClient = ReturnType<typeof createApiClient>;
export type { AppType };
