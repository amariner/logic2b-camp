import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runLocalOnboardingRehearsal } from './onboarding-rehearsal';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

const result = runLocalOnboardingRehearsal({
  repoRoot,
  identity: {
    slug: 'r13-local',
    name: 'Camping R13 Local',
    domain: 'r13-local.example.test',
    zone: 'example.test',
  },
  seedYear: 2026,
});

process.stdout.write(JSON.stringify(result));
