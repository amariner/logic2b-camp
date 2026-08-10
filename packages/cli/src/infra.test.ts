import { describe, expect, it } from 'vitest';
import { InfraManualStepError, InfraNotConfirmedError, runInfraPlan } from './infra';
import { infraPlan } from './plan';
import type { PlanStep } from './plan';

const steps: PlanStep[] = [{ command: 'echo uno', note: 'paso 1' }];

describe('runInfraPlan', () => {
  it('lanza InfraNotConfirmedError sin el doble candado, antes de tocar ningún proceso', () => {
    expect(() => runInfraPlan(steps, { allowInfraEnv: undefined })).toThrow(InfraNotConfirmedError);
  });

  it('lanza igualmente si el env var no es exactamente "1"', () => {
    expect(() => runInfraPlan(steps, { allowInfraEnv: 'true' })).toThrow(InfraNotConfirmedError);
  });

  it('ejecuta un plan totalmente automático cuando el candado está abierto', () => {
    const calls: Array<{ command: string; args: string[] }> = [];
    const results = runInfraPlan(steps, {
      allowInfraEnv: '1',
      runner: (command, args) => {
        calls.push({ command, args });
        return { status: 0 };
      },
    });
    expect(results).toHaveLength(1);
    expect(calls).toEqual([{ command: 'echo', args: ['uno'] }]);
    expect(results[0]?.ranCommand).toBe(true);
    expect(results[0]?.exitCode).toBe(0);
  });

  it('rechaza antes de ejecutar un plan con pasos manuales intermedios', () => {
    const identity = {
      slug: 'la-pineda',
      name: 'Camping La Pineda',
      domain: 'lapineda.com',
      zone: 'lapineda.com',
    };
    let calls = 0;
    expect(() =>
      runInfraPlan(infraPlan(identity), {
        allowInfraEnv: '1',
        runner: () => {
          calls += 1;
          return { status: 0 };
        },
      }),
    ).toThrow(InfraManualStepError);
    expect(calls).toBe(0);
  });

  it('se detiene en el primer fallo sin ejecutar el resto', () => {
    const failing: PlanStep[] = [
      { command: 'node -e process.exit(1)', note: 'falla' },
      { command: 'echo nunca-deberia-correr', note: 'siguiente' },
    ];
    const calls: string[] = [];
    const results = runInfraPlan(failing, {
      allowInfraEnv: '1',
      runner: (command) => {
        calls.push(command);
        return { status: 1 };
      },
    });
    expect(results).toHaveLength(1);
    expect(calls).toEqual(['node']);
    expect(results[0]?.exitCode).toBe(1);
  });
});
