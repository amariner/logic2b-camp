#!/usr/bin/env tsx
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runLocalOnboardingRehearsal } from './onboarding-rehearsal';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const rawArguments = process.argv.slice(2);
const argumentsWithoutSeparator = rawArguments[0] === '--' ? rawArguments.slice(1) : rawArguments;
const rawYear = argumentsWithoutSeparator[0] ?? String(new Date().getUTCFullYear());
const seedYear = Number(rawYear);

try {
  const result = runLocalOnboardingRehearsal({
    repoRoot: REPO_ROOT,
    identity: {
      slug: 'onboarding-local',
      name: 'Camping Onboarding Local',
      domain: 'onboarding-local.example.test',
      zone: 'example.test',
    },
    seedYear,
  });
  console.log(`✓ migraciones ${result.migrationNames.length}/${result.migrationNames.length}`);
  console.log(`  huella: ${result.secondMigrationFingerprint}`);
  console.log(`✓ seed determinista (${seedYear})`);
  console.log(`  huella: ${result.secondSeedSqlFingerprint}`);
  console.log(
    `✓ estado: ${result.source.tenants} tenant · ${result.source.units} unidades · ${result.source.owners} owner`,
  );
  console.log(`  esquema: ${result.source.schemaFingerprint}`);
  console.log(`  datos: ${result.source.dataFingerprint}`);
  console.log('✓ mutación detectada y rollback restaurado con la huella lógica exacta');
  console.log('✓ contrato de activación temporal: tiers 1/2/3, sin proveedor');
  for (const phase of result.timings.phases) {
    console.log(`  ${phase.name}: ${phase.durationMs.toFixed(2)} ms`);
  }
  console.log(`  total automático con limpieza: ${result.timings.totalMs.toFixed(2)} ms`);
  console.log(
    `△ coste de una tarde no acreditado; trabajo humano sin medir: ${result.operationalCost.unmeasuredHumanBlocks.join(', ')}`,
  );
  console.log(`  gates externos: ${result.operationalCost.externalGates.join(', ')}`);
  console.log('✓ temporal eliminado; cero tenants y cero D1 persistentes');
} catch (error) {
  console.error(`✗ ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
