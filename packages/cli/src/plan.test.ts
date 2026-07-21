import { describe, expect, it } from 'vitest';
import { formatPlan, infraPlan } from './plan';

const identity = {
  slug: 'la-pineda',
  name: 'Camping La Pineda',
  domain: 'lapineda.com',
  zone: 'lapineda.com',
};

describe('infraPlan', () => {
  it('referencia el slug en cada comando de infra', () => {
    const steps = infraPlan(identity);
    const commands = steps.filter((s) => s.command).map((s) => s.command as string);
    expect(commands.some((c) => c.includes('wrangler d1 create logic-camp-la-pineda'))).toBe(true);
    expect(commands.some((c) => c.includes('--config tenants/la-pineda/wrangler.jsonc'))).toBe(
      true,
    );
    expect(commands.some((c) => c.includes('wrangler deploy'))).toBe(true);
  });

  it('incluye los pasos manuales (database_id, DNS) sin comando ejecutable', () => {
    const steps = infraPlan(identity);
    const manual = steps.filter((s) => s.command === null);
    expect(manual.length).toBeGreaterThanOrEqual(2);
    expect(manual.some((s) => s.note.includes('database_id'))).toBe(true);
    expect(manual.some((s) => s.note.includes('DNS'))).toBe(true);
  });

  it('mantiene el orden: crear D1 antes de migrar, migrar antes de sembrar, sembrar antes de desplegar', () => {
    const steps = infraPlan(identity);
    const idx = (needle: string) => steps.findIndex((s) => s.command?.includes(needle));
    expect(idx('d1 create')).toBeLessThan(idx('migrations apply'));
    expect(idx('migrations apply')).toBeLessThan(idx('seed:sql'));
    expect(idx('seed:sql')).toBeLessThan(idx('d1 execute'));
    expect(idx('d1 execute')).toBeLessThan(idx('wrangler deploy'));
  });
});

describe('formatPlan', () => {
  it('numera los pasos y marca los manuales', () => {
    const text = formatPlan(infraPlan(identity));
    expect(text).toMatch(/^01\. wrangler d1 create/);
    expect(text).toContain('[manual]');
  });
});
