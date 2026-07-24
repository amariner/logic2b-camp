/**
 * El plan del reseed remoto es puro: se testea entero sin red ni credenciales.
 * Estos tests fijan las tres lecciones que costaron media sesión 44 (ver
 * `remote-seed.ts`) para que una futura edición no las pierda en silencio.
 */
import { describe, expect, it } from 'vitest';
import { DELETE_ORDER } from './reset';
import { buildRemoteSeedCommands } from './remote-seed';

describe('buildRemoteSeedCommands (puro)', () => {
  const plan = buildRemoteSeedCommands();

  it('empieza regenerando seed.sql (ancla = año en curso)', () => {
    expect(plan[0]!.argv).toEqual(['pnpm', '--filter', '@tenant/demo', 'seed:sql']);
  });

  it('vacía las 21 tablas en orden hijo→padre, igual que el reset local', () => {
    const wipes = plan.filter((c) => c.argv.includes('--command'));
    expect(wipes).toHaveLength(DELETE_ORDER.length);
    expect(wipes).toHaveLength(21);
    // el comando va como `--command "DELETE FROM x;" -y` → el SQL es el penúltimo argv
    expect(wipes.map((c) => c.argv.at(-2))).toEqual(
      DELETE_ORDER.map((t) => `DELETE FROM ${t};`),
    );
    // hijo antes que padre: la trampa de la D1 remota que SÍ fuerza FKs
    const tables = wipes.map((c) => c.argv.at(-2));
    expect(tables.indexOf('DELETE FROM bookings;')).toBeLessThan(
      tables.indexOf('DELETE FROM units;'),
    );
    expect(tables.indexOf('DELETE FROM payments;')).toBeLessThan(
      tables.indexOf('DELETE FROM bookings;'),
    );
  });

  it('NUNCA toca d1_migrations (se preserva sola)', () => {
    expect(plan.some((c) => c.argv.some((a) => a.includes('d1_migrations')))).toBe(false);
  });

  it('siembra en último lugar y con --file (el masivo va aquí, no en el wipe)', () => {
    const seedIdx = plan.findIndex((c) => c.argv.includes('--file'));
    expect(seedIdx).toBe(plan.length - 1);
    expect(plan.at(-1)!.argv).toContain('tenants/demo/seed.sql');
    // exactamente un `--file` en todo el plan: el wipe va por `--command`
    expect(plan.filter((c) => c.argv.includes('--file'))).toHaveLength(1);
  });

  it('todos los comandos de wrangler apuntan a la base REMOTA y al config del demo', () => {
    const wranglerCmds = plan.filter((c) => c.argv.includes('wrangler'));
    expect(wranglerCmds).toHaveLength(22); // 21 wipes + 1 seed
    for (const c of wranglerCmds) {
      expect(c.argv).toContain('--remote');
      expect(c.argv).toContain('tenants/demo/wrangler.jsonc');
      expect(c.argv).toContain('logic-camp-demo');
      expect(c.argv).toContain('-y');
    }
  });

  it('es determinista', () => {
    expect(buildRemoteSeedCommands().map((c) => c.argv)).toEqual(
      buildRemoteSeedCommands().map((c) => c.argv),
    );
  });
});
