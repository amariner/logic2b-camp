import { afterEach, describe, expect, it, vi } from 'vitest';
const mode = vi.hoisted(() => ({ isPortfolioScenario: true }));
vi.mock('@demo-scenario', () => mode);
import { businessNow } from './clock';
afterEach(() => {
  vi.useRealTimers();
  mode.isPortfolioScenario = true;
});
describe('reloj del negocio', () => {
  it('mantiene agosto de 2026 aunque cambie el año real', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2031-01-01'));
    expect(businessNow().toISOString()).toBe('2026-08-07T12:00:00.000Z');
  });
  it('conserva el reloj real fuera de las demos', () => {
    mode.isPortfolioScenario = false;
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2031-01-01'));
    expect(businessNow().toISOString()).toBe('2031-01-01T00:00:00.000Z');
  });
});
