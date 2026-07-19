import { describe, expect, it } from 'vitest';
import { InfraNotConfirmedError, runInfraPlan } from './infra';
import type { PlanStep } from './plan';

const steps: PlanStep[] = [
  { command: 'echo uno', note: 'paso 1' },
  { command: null, note: 'paso manual' },
];

describe('runInfraPlan', () => {
  it('lanza InfraNotConfirmedError sin el doble candado, antes de tocar ningún proceso', () => {
    expect(() => runInfraPlan(steps, { allowInfraEnv: undefined })).toThrow(InfraNotConfirmedError);
  });

  it('lanza igualmente si el env var no es exactamente "1"', () => {
    expect(() => runInfraPlan(steps, { allowInfraEnv: 'true' })).toThrow(InfraNotConfirmedError);
  });

  it('ejecuta los pasos con comando y respeta los manuales cuando el candado está abierto', () => {
    const results = runInfraPlan(steps, { allowInfraEnv: '1' });
    expect(results).toHaveLength(2);
    expect(results[0]?.ranCommand).toBe(true);
    expect(results[0]?.exitCode).toBe(0);
    expect(results[1]?.ranCommand).toBe(false);
    expect(results[1]?.exitCode).toBeNull();
  });

  it('se detiene en el primer fallo sin ejecutar el resto', () => {
    const failing: PlanStep[] = [
      { command: 'node -e process.exit(1)', note: 'falla' },
      { command: 'echo nunca-deberia-correr', note: 'siguiente' },
    ];
    const results = runInfraPlan(failing, { allowInfraEnv: '1' });
    expect(results).toHaveLength(1);
    expect(results[0]?.exitCode).toBe(1);
  });
});
