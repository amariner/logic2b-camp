import { describe, expect, it, vi } from 'vitest';
import { manualTransport } from './transport';

describe('manualTransport', () => {
  it('no envía por red: conserva el borrador en modo manual', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    try {
      const r = await manualTransport().send('<xml/>');
      expect(r).toEqual({ ok: false, error: 'manual_transport' });
      expect(manualTransport().mode).toBe('manual');
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });
});
