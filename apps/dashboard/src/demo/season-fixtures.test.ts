import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BookingListItem, PlanningData } from '../api';

const scenarios = [
  'pinadamar',
  'serralta',
  'vinyes',
  'tarongers',
  'carrasca',
  'ballena',
  'soldhivern',
  'mardefondo',
];
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe('demos de verano aisladas de D1', () => {
  it.each(scenarios)('%s contiene las pantallas completas sin tráfico de API', async (scenario) => {
    vi.resetModules();
    vi.stubEnv('VITE_DEMO_SCENARIO', scenario);
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    });
    const network = vi.fn(() => {
      throw new Error('La demo no puede usar red');
    });
    vi.stubGlobal('fetch', network);
    const module =
      scenario === 'mardefondo' ? await import('./mardefondo') : await import('./pinadamar');
    for (const endpoint of ['bookings', 'enquiries', 'guests', 'payments', 'notifications']) {
      const result = await module.demoScenarioRequest(`/api/admin/${endpoint}`);
      expect(result.status, endpoint).toBe(200);
      expect((result.body as { items: unknown[] }).items.length, endpoint).toBeGreaterThan(0);
    }
    const rates = await module.demoScenarioRequest('/api/admin/rates');
    expect(rates.status).toBe(200);
    expect((rates.body as { ratePlans: unknown[] }).ratePlans.length).toBeGreaterThan(0);
    for (const month of ['06', '07', '08']) {
      const planning = await module.demoScenarioRequest(
        `/api/admin/planning?from=2026-${month}-01&to=2026-${month}-28`,
      );
      expect((planning.body as PlanningData).bookings.length, month).toBeGreaterThan(0);
    }
    const before = await module.demoScenarioRequest('/api/admin/bookings');
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2031-12-24T00:00:00Z'));
    expect(await module.demoScenarioRequest('/api/admin/bookings')).toEqual(before);
    const bookings = (before.body as { items: BookingListItem[] }).items;
    expect(
      bookings.every(
        (booking) => booking.dateFrom >= '2026-06-01' && booking.dateTo <= '2026-09-01',
      ),
    ).toBe(true);
    expect(network).not.toHaveBeenCalled();
  });
});
