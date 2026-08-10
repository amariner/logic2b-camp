/**
 * Inventario ejecutable de contratos (ADR 0042 §1).
 *
 * Aislamiento y rol demo tienen sus propios barridos. Este cierra las otras
 * dimensiones: una ruta nueva no puede aparecer sin declarar autenticación,
 * validación, idempotencia y límite de tráfico.
 */
import { describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { ROUTE_CONTRACTS } from '../src/route-contracts';

const key = (method: string, path: string) => `${method} ${path}`;

function inventory(): string[] {
  const routes = new Set<string>();
  for (const route of app.routes) {
    if (route.method === 'ALL') continue;
    routes.add(key(route.method, route.path));
  }
  return [...routes].sort();
}

describe('inventario de contratos de API (ADR 0042)', () => {
  it('toda ruta Hono está clasificada y no quedan contratos de rutas borradas', () => {
    expect(Object.keys(ROUTE_CONTRACTS).sort()).toEqual(inventory());
  });

  it('toda mutación propia declara validación e idempotencia de forma explícita', () => {
    for (const [route, contract] of Object.entries(ROUTE_CONTRACTS)) {
      if (!contract.mutates || contract.owner === 'better-auth') continue;
      expect(contract.validation, `${route} no declara validación`).not.toBe('none');
      expect(
        contract.idempotency,
        `${route} no declara si es idempotente, deduplicada o deliberadamente no idempotente`,
      ).not.toBe('unspecified');
    }
  });

  it('admin nunca nace público y toda mutación anónima tiene cuota específica', () => {
    for (const [route, contract] of Object.entries(ROUTE_CONTRACTS)) {
      if (route.includes('/api/admin')) expect(contract.auth).not.toBe('none');
      if (contract.mutates && contract.auth === 'none' && contract.owner !== 'better-auth') {
        expect(contract.rateLimit, `${route} usa solo la cuota general`).not.toBe('general');
      }
    }
  });
});
