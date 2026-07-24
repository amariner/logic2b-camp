#!/usr/bin/env node
/**
 * `pnpm db:seed:remote` — re-siembra la D1 REMOTA de la demo desde cero,
 * encapsulando el procedimiento que la sesión 44 hizo a mano (deuda [infra]
 * del BACKLOG). El QUÉ (qué comandos y en qué orden) es puro y está testeado
 * en `../remote-seed.ts`; aquí solo se IMPRIME o se LANZA con spawnSync.
 *
 * Doble candado deliberado, calcado de `runInfraPlan` (packages/cli/src/infra.ts)
 * porque el blast radius es el mismo: una base de PRODUCCIÓN. Ninguno basta solo:
 *   1. `--apply` explícito (por defecto solo imprime el plan — dry-run).
 *   2. `LOGIC_CAMP_ALLOW_REMOTE_SEED=1` en el entorno.
 * Sin los dos, no se ejecuta un solo comando.
 *
 * Requiere además credenciales de Cloudflare (`wrangler login` / API token con
 * D1 Edit). No se puede probar el `--apply` en el contenedor cloud: no las hay.
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRemoteSeedCommands } from '../remote-seed';

/** tenants/demo/scripts/seed-remote.ts → tres niveles arriba = raíz del repo. */
function repoRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
}

/** Solo para IMPRIMIR: entrecomilla los argv con espacios/`;` para que la línea
 *  sea copiable a mano. La ejecución NO usa shell (spawnSync con argv). */
function displayLine(argv: readonly string[]): string {
  return argv.map((a) => (/[\s;"']/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a)).join(' ');
}

function main(): void {
  const apply = process.argv.slice(2).includes('--apply');
  const allowed = process.env.LOGIC_CAMP_ALLOW_REMOTE_SEED === '1';
  const commands = buildRemoteSeedCommands();
  const root = repoRoot();

  console.log('Reseed de la D1 REMOTA de la demo (logic-camp-demo). Plan:\n');
  commands.forEach((c, i) => {
    console.log(`  ${String(i + 1).padStart(2)}. ${c.label}`);
    console.log(`      ${displayLine(c.argv)}`);
  });

  if (!apply) {
    console.log(
      '\n(dry-run — no se ha ejecutado nada. Pasa --apply, con ' +
        'LOGIC_CAMP_ALLOW_REMOTE_SEED=1 y credenciales de Cloudflare, para lanzarlo.)',
    );
    return;
  }

  if (!allowed) {
    console.error(
      '\n✗ --apply bloqueado: falta LOGIC_CAMP_ALLOW_REMOTE_SEED=1 en el entorno ' +
        '(doble candado deliberado — vas a BORRAR y re-sembrar una base de producción).',
    );
    process.exitCode = 1;
    return;
  }

  console.log('\n--apply: ejecutando contra la base REMOTA…\n');
  for (const c of commands) {
    console.log(`→ ${c.label}`);
    const [cmd, ...args] = c.argv;
    const result = spawnSync(cmd!, [...args], { stdio: 'inherit', shell: false, cwd: root });
    if (result.status !== 0) {
      console.error(`\n✗ falló: ${displayLine(c.argv)} (código ${result.status ?? 'sin código'})`);
      process.exitCode = 1;
      return;
    }
  }
  console.log('\n✓ reseed remoto completado. (Recuerda: el wipe borra sesiones → re-login.)');
}

main();
