#!/usr/bin/env node
/**
 * `pnpm new:camping` — Capa 1 (mecánica) del alta de un camping (ADR 0012 §5).
 * Por defecto SOLO escribe ficheros en el repo y muestra el plan de infra —
 * nunca toca Cloudflare sin `--apply` Y `LOGIC_CAMP_ALLOW_INFRA=1` (infra.ts).
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { InfraNotConfirmedError, runInfraPlan } from './infra';
import { formatPlan, infraPlan } from './plan';
import { scaffoldTenant, validateSlug, type TenantIdentity } from './scaffold';

const USAGE = `Uso:
  pnpm new:camping <slug> --name "Nombre" --domain dominio.com [--zone zona.com] [--address "..."] [--apply]
  pnpm new:camping <slug> --plan-only    # reimprime el plan de infra para un tenant ya creado

  --apply   ejecuta el plan de infra contra Cloudflare (requiere además LOGIC_CAMP_ALLOW_INFRA=1)
`;

type Args = {
  slug: string;
  name?: string;
  domain?: string;
  zone?: string;
  address?: string;
  apply: boolean;
  planOnly: boolean;
};

function parseArgs(rawArgv: string[]): Args {
  // `pnpm run new:camping -- <args>` reenvía el "--" tal cual (no lo consume
  // pnpm) — se tolera un único separador inicial, igual que hacen otras CLIs.
  const argv = rawArgv[0] === '--' ? rawArgv.slice(1) : rawArgv;
  const [slug, ...rest] = argv;
  if (!slug) throw new Error(USAGE);
  const args: Args = { slug, apply: false, planOnly: false };
  for (let i = 0; i < rest.length; i++) {
    const flag = rest[i];
    if (flag === '--apply') args.apply = true;
    else if (flag === '--plan-only') args.planOnly = true;
    else if (flag === '--name') args.name = rest[++i];
    else if (flag === '--domain') args.domain = rest[++i];
    else if (flag === '--zone') args.zone = rest[++i];
    else if (flag === '--address') args.address = rest[++i];
    else throw new Error(`flag desconocido: ${flag}\n\n${USAGE}`);
  }
  return args;
}

function repoRoot(): string {
  // packages/cli/src/cli.ts → tres niveles arriba
  return join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));

  const slugError = validateSlug(args.slug);
  if (slugError) {
    console.error(`✗ ${slugError}`);
    process.exitCode = 1;
    return;
  }

  const root = repoRoot();
  const identity: TenantIdentity = {
    slug: args.slug,
    name: args.name ?? args.slug,
    domain: args.domain ?? `${args.slug}.example.com`,
    zone: args.zone ?? args.domain ?? `${args.slug}.example.com`,
    address: args.address,
  };

  if (!args.planOnly) {
    if (!args.name || !args.domain) {
      console.error(
        `✗ faltan --name y/o --domain (obligatorios salvo con --plan-only)\n\n${USAGE}`,
      );
      process.exitCode = 1;
      return;
    }
    const result = scaffoldTenant(join(root, 'tenants/_template'), join(root, 'tenants'), identity);
    console.log(`✓ tenants/${identity.slug}/ creado (${result.filesWritten.length} ficheros)`);
    console.log('\nCapa 2 pendiente (brief, contenido y media reales):');
    for (const t of result.setupTodos) console.log(`  · ${t.file}: ${t.todoCount} __TODO__`);
    if (result.pendingDatabaseId) {
      console.log(
        '  · wrangler.jsonc: database_id pendiente (se rellena tras crear la D1 real, paso 1 del plan)',
      );
    }
  }

  const steps = infraPlan(identity);
  console.log(
    '\nCapa 3 — plan de infraestructura (requiere credenciales de Cloudflare, §5 del super prompt):',
  );
  console.log(formatPlan(steps));

  if (args.apply) {
    console.log('\n--apply: ejecutando el plan contra Cloudflare…');
    try {
      const results = runInfraPlan(steps);
      const failed = results.find((r) => r.ranCommand && r.exitCode !== 0);
      if (failed) {
        console.error(`✗ falló: ${failed.step.command} (código ${failed.exitCode})`);
        process.exitCode = 1;
      } else {
        console.log('✓ plan ejecutado');
      }
    } catch (err) {
      if (err instanceof InfraNotConfirmedError) {
        console.error(`\n✗ ${err.message}`);
        process.exitCode = 1;
      } else {
        throw err;
      }
    }
  } else {
    console.log(
      '\n(no ejecutado — pasa --apply, con LOGIC_CAMP_ALLOW_INFRA=1, cuando tengas las credenciales)',
    );
  }
}

main();
