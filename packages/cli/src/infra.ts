/**
 * Ejecución REAL de `infraPlan()` contra la cuenta de Cloudflare — la única
 * parte de este paquete con blast radius fuera del repo (ADR 0012 §5).
 *
 * Doble candado a propósito, ninguno de los dos basta por sí solo:
 * 1. `--apply` explícito en la CLI (por defecto solo se imprime el plan).
 * 2. `LOGIC_CAMP_ALLOW_INFRA=1` en el entorno — confirma que quien ejecuta
 *    tiene mandato y credenciales reales, no solo está probando la CLI.
 * Sin los dos, `runInfraPlan` lanza y no ejecuta un solo comando.
 */
import { spawnSync } from 'node:child_process';
import type { PlanStep } from './plan';

export class InfraNotConfirmedError extends Error {
  constructor() {
    super(
      'ejecución de infraestructura real bloqueada: falta LOGIC_CAMP_ALLOW_INFRA=1 en el entorno ' +
        '(doble candado deliberado, ADR 0012 §5 — no lo actives sin credenciales de Cloudflare Y mandato explícito)',
    );
    this.name = 'InfraNotConfirmedError';
  }
}

export type InfraStepResult = { step: PlanStep; ranCommand: boolean; exitCode: number | null };

/** Ejecuta los pasos con `command` en orden; se detiene en el primer fallo. Los pasos manuales solo se listan. */
export function runInfraPlan(steps: PlanStep[], opts: { allowInfraEnv?: string } = {}): InfraStepResult[] {
  if ((opts.allowInfraEnv ?? process.env.LOGIC_CAMP_ALLOW_INFRA) !== '1') {
    throw new InfraNotConfirmedError();
  }

  const results: InfraStepResult[] = [];
  for (const step of steps) {
    if (!step.command) {
      results.push({ step, ranCommand: false, exitCode: null });
      continue;
    }
    const [cmd, ...args] = step.command.split(' ');
    const result = spawnSync(cmd!, args, { stdio: 'inherit', shell: false });
    results.push({ step, ranCommand: true, exitCode: result.status });
    if (result.status !== 0) break;
  }
  return results;
}
