/**
 * Capa 1 (mecánica) — los pasos de infraestructura real que da de alta un
 * camping (ADR 0012 §5). Función PURA: solo produce la lista de comandos,
 * nunca los ejecuta. `infra.ts` es quien los ejecuta, y solo con `--apply`.
 */
import type { TenantIdentity } from './scaffold';

export type PlanStep = {
  /** Comando de shell a ejecutar, o `null` si es una acción manual (DNS, pegar un id). */
  command: string | null;
  note: string;
};

export function infraPlan(identity: TenantIdentity): PlanStep[] {
  const { slug } = identity;
  const wranglerConfig = `tenants/${slug}/wrangler.jsonc`;
  return [
    {
      command: `wrangler d1 create logic-camp-${slug}`,
      note: 'crea la D1 del camping',
    },
    {
      command: null,
      note: `pega el database_id devuelto en ${wranglerConfig} (sustituye __TODO_DATABASE_ID__ a mano — nunca se genera solo)`,
    },
    {
      command: `wrangler d1 migrations apply logic-camp-${slug} --remote --config ${wranglerConfig}`,
      note: 'aplica el esquema (packages/db/migrations, el mismo para todos los tenants)',
    },
    {
      command: `pnpm --filter @tenant/${slug} seed:sql`,
      note: 'genera seed.sql desde seed.ts (Capa 2 ya debe estar rellenada con datos reales)',
    },
    {
      command: `wrangler d1 execute logic-camp-${slug} --remote --file tenants/${slug}/seed.sql -y`,
      note: 'siembra la D1 remota',
    },
    {
      command: `TENANT=${slug} pnpm --filter @logic-camp/web build`,
      note: 'construye la web de este tenant (alias @tenant resuelto en build, ADR sesión 7)',
    },
    {
      command: `wrangler deploy --config ${wranglerConfig}`,
      note: 'despliega Worker (web + API en un solo deploy, Workers Assets)',
    },
    {
      command: null,
      note: 'DNS: ver §5 del super prompt — nameservers a Cloudflare (camino A) o registro delegado (camino B)',
    },
  ];
}

export function formatPlan(steps: PlanStep[]): string {
  return steps
    .map((s, i) => {
      const n = String(i + 1).padStart(2, '0');
      return s.command ? `${n}. ${s.command}\n    ${s.note}` : `${n}. [manual] ${s.note}`;
    })
    .join('\n');
}
