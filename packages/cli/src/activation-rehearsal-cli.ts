#!/usr/bin/env tsx
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runLocalActivationRehearsal } from './activation-rehearsal';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

try {
  const result = runLocalActivationRehearsal({
    repoRoot: REPO_ROOT,
    identity: {
      slug: 'activation-local',
      name: 'Camping Activation Local',
      domain: 'activation-local.example.test',
      zone: 'example.test',
    },
  });

  console.log(
    `✓ candidato temporal: ${result.scaffoldFiles} ficheros; huella ${result.candidateFingerprint}`,
  );
  console.log(`  marcadores de alta aún pendientes: ${result.scaffoldMarkers}`);
  for (const profile of result.profiles) {
    const adapters = profile.report.adapters
      .map((adapter) => `${adapter.name}=${adapter.adapter}/${adapter.status}`)
      .join(' · ');
    const secrets = profile.report.secrets
      .filter((secret) => secret.status !== 'not_required')
      .map((secret) => `${secret.name}=${secret.status}`)
      .join(' · ');
    console.log(`${profile.report.contractReady ? '✓' : '△'} tier ${profile.tier}: ${adapters}`);
    console.log(`  nombres: ${secrets}`);
    console.log(
      `  verificación externa pendiente: ${profile.report.externalVerification.join(', ')}`,
    );
  }
  console.log(`⊘ Automatiza: ${result.unavailableProfiles[0]!.reason}`);
  console.log(`✓ apps/ y packages/ intactos: ${result.protectedSourcesFingerprintAfter}`);
  console.log('✓ temporal eliminado; cero Wrangler, DNS, valores de secrets, proveedores o red');
} catch (error) {
  console.error(`✗ ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
