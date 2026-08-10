/**
 * Ejecución REAL de `infraPlan()` contra la cuenta de Cloudflare — la única
 * parte de este paquete con blast radius fuera del repo (ADR 0012 §5).
 *
 * Doble candado a propósito, ninguno de los dos basta por sí solo:
 * 1. `--apply` explícito en la CLI (por defecto solo se imprime el plan).
 * 2. `LOGIC_CAMP_ALLOW_INFRA=1` en el entorno — confirma que quien ejecuta
 *    tiene mandato y credenciales reales, no solo está probando la CLI.
 * Sin los dos, `runInfraPlan` lanza y no ejecuta un solo comando. Incluso con
 * ambos, el preflight rechaza un plan con pasos manuales antes de iniciarlo.
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

/**
 * El plan actual contiene decisiones humanas (database_id y DNS). Empezarlo de
 * forma automática dejaría recursos parciales antes de que la persona pueda
 * completar el siguiente paso, así que se rechaza entero durante el preflight.
 */
export class InfraManualStepError extends Error {
  constructor(step: PlanStep) {
    super(
      `ejecución automática bloqueada: el plan contiene el paso manual «${step.note}». ` +
        'Ejecuta el alta por fases supervisadas; el dry-run nunca crea recursos.',
    );
    this.name = 'InfraManualStepError';
  }
}

export type InfraStepResult = { step: PlanStep; ranCommand: boolean; exitCode: number | null };

export type CommandRunner = (command: string, args: string[]) => { status: number | null };

/**
 * Ejecuta un plan completamente automático y se detiene en el primer fallo.
 * Los pasos manuales se rechazan en preflight, antes del primer proceso.
 */
export function runInfraPlan(
  steps: PlanStep[],
  opts: { allowInfraEnv?: string; runner?: CommandRunner } = {},
): InfraStepResult[] {
  if ((opts.allowInfraEnv ?? process.env.LOGIC_CAMP_ALLOW_INFRA) !== '1') {
    throw new InfraNotConfirmedError();
  }

  const manualStep = steps.find((step) => step.command === null);
  if (manualStep) throw new InfraManualStepError(manualStep);

  const results: InfraStepResult[] = [];
  const runner: CommandRunner =
    opts.runner ??
    ((command, args) => spawnSync(command, args, { stdio: 'inherit', shell: false }));
  for (const step of steps) {
    if (!step.command) throw new InfraManualStepError(step);
    const [cmd, ...args] = step.command.split(' ');
    const result = runner(cmd!, args);
    results.push({ step, ranCommand: true, exitCode: result.status });
    if (result.status !== 0) break;
  }
  return results;
}
