/**
 * Plan del reseed remoto de la demo — la parte PURA y testeable (sin red,
 * sin credenciales, sin `node:`). Encapsula lo que la sesión 44 tuvo que
 * hacer a mano (deuda [infra] del BACKLOG):
 *
 *   1. regenerar `seed.sql` con el ancla del año en curso (`seed:sql`),
 *   2. VACIAR la D1 remota tabla a tabla en orden hijo→padre —la D1 remota SÍ
 *      fuerza las FKs, y el `--file` masivo de miles de DELETE hace `fetch
 *      failed` por timeout, así que van de uno en uno con `--command`—, sin
 *      tocar `d1_migrations` (no está en `DELETE_ORDER`: se preserva sola),
 *   3. sembrar con `--file seed.sql` (INSERT-only: exige la base vacía).
 *
 * La ejecución real (spawn de estos comandos, bajo doble candado) vive en
 * `scripts/seed-remote.ts`, igual que `runInfraPlan` en `packages/cli`.
 */
import { DELETE_ORDER } from './reset';

/** Config del Worker demo y nombre de la D1, relativos a la RAÍZ del repo. */
const CONFIG = 'tenants/demo/wrangler.jsonc';
const DB_NAME = 'logic-camp-demo';
const SEED_SQL = 'tenants/demo/seed.sql';

/** Un comando como argv (sin shell): `spawnSync` lo ejecuta tal cual. */
export type Command = { readonly label: string; readonly argv: readonly string[] };

/** `pnpm exec` resuelve el binario de wrangler sin depender del PATH del proceso. */
function wrangler(...args: string[]): readonly string[] {
  return ['pnpm', 'exec', 'wrangler', ...args];
}

/**
 * El plan completo, en orden de ejecución. Puro y determinista: el mismo
 * array siempre, sin leer entorno ni red.
 */
export function buildRemoteSeedCommands(): Command[] {
  const regen: Command = {
    label: 'regenerar seed.sql (ancla = año en curso)',
    argv: ['pnpm', '--filter', '@tenant/demo', 'seed:sql'],
  };

  const wipes: Command[] = DELETE_ORDER.map((table) => ({
    label: `vaciar ${table}`,
    argv: wrangler(
      'd1',
      'execute',
      DB_NAME,
      '--remote',
      '--config',
      CONFIG,
      '--command',
      `DELETE FROM ${table};`,
      '-y',
    ),
  }));

  const seed: Command = {
    label: 'sembrar desde seed.sql (INSERT-only, exige base vacía)',
    argv: wrangler(
      'd1',
      'execute',
      DB_NAME,
      '--remote',
      '--config',
      CONFIG,
      '--file',
      SEED_SQL,
      '-y',
    ),
  };

  return [regen, ...wipes, seed];
}
