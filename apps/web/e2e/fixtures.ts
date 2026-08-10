import { expect, test as base } from '@playwright/test';

/**
 * Cada test representa un navegador/cliente independiente. Wrangler, como un
 * Worker real, agrupa las cuotas por `cf-connecting-ip`; sin esta cabecera los
 * 23 recorridos de la suite compartirían localhost y el resultado dependería
 * del orden. Una IP privada determinista conserva el rate limit de producto y
 * evita convertir el harness en un único usuario artificial.
 */
function clientIp(testId: string): string {
  let hash = 2_166_136_261;
  for (const char of testId) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16_777_619);
  }
  return `10.${(hash >>> 16) & 255}.${(hash >>> 8) & 255}.${(hash & 254) + 1}`;
}

export const test = base.extend<{ clientIsolation: void }>({
  clientIsolation: [
    async ({ context }, use, testInfo) => {
      await context.setExtraHTTPHeaders({ 'cf-connecting-ip': clientIp(testInfo.testId) });
      await use();
    },
    { auto: true },
  ],
});

export { expect };
export type { APIRequestContext, Locator, Page } from '@playwright/test';
