import { describe, expect, it, vi } from 'vitest';
import worker, { commercialApp } from '../src/commercial';

describe('worker comercial sin D1', () => {
  const env = new Proxy(
    { TENANT_SLUG: 'demo', LEADS_TRANSPORT: 'demo' },
    {
      get(target, key) {
        if (key === 'DB') throw new Error('D1 está prohibido en la demo');
        return Reflect.get(target, key);
      },
    },
  );
  it('responde salud y rechaza cualquier API operativa sin abrir D1', async () => {
    expect((await commercialApp.request('/api/health', {}, env)).status).toBe(200);
    for (const path of [
      '/api/admin/bookings',
      '/api/auth/get-session',
      '/api/demo/reset',
      '/api/availability',
    ]) {
      expect((await commercialApp.request(path, { method: 'POST' }, env)).status).toBe(410);
    }
  });
  it('mantiene captación comercial aislada de la base de datos', async () => {
    const response = await commercialApp.request(
      '/api/leads',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'Demo',
          campingName: 'Ejemplo',
          email: 'demo@example.test',
          accept: true,
        }),
      },
      env,
    );
    expect(response.status).toBe(202);
    expect(await response.json()).toMatchObject({ outcome: 'demo' });
  });
  it('un disparo antiguo de cron no ejecuta ninguna tarea ni red', async () => {
    const network = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('No network'));
    try {
      await worker.scheduled();
      expect(network).not.toHaveBeenCalled();
    } finally {
      network.mockRestore();
    }
  });
});
