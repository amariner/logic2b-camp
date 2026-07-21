/**
 * Capa 1 (mecánica) del alta de un camping — ADR 0012 §5. Copia
 * `tenants/_template` a `tenants/{slug}` sustituyendo los tokens de
 * identidad en los ficheros que los llevan. Puro: solo lee/escribe en el
 * repo local, no toca Cloudflare — eso es `infra.ts`, y solo con `--apply`.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

export type TenantIdentity = {
  slug: string;
  name: string;
  /** Dominio sin protocolo, p.ej. "campinglapineda.com". */
  domain: string;
  /** Zona DNS en Cloudflare — normalmente el dominio raíz. */
  zone: string;
  address?: string;
};

const SLUG_RE = /^[a-z][a-z0-9-]{1,30}[a-z0-9]$/;
const RESERVED_SLUGS = new Set(['_template', 'demo']);

export function validateSlug(slug: string): string | null {
  if (!SLUG_RE.test(slug)) {
    return 'el slug debe ser minúsculas/números/guiones, 3-32 caracteres, sin empezar ni acabar en guión';
  }
  if (RESERVED_SLUGS.has(slug)) return `"${slug}" está reservado`;
  return null;
}

// Ficheros de _template que NO se copian tal cual al tenant nuevo.
const SKIP_FILES = new Set(['wrangler.jsonc.example', 'README.md']);
// Ficheros donde se sustituyen los tokens de identidad — el resto
// (content/*.json, custom/hooks.ts, data.ts) se copia byte a byte: sus
// TODOs son trabajo de la Capa 2 (interpretar el material real del cliente).
const TOKEN_FILES = new Set(['config.ts', 'seed.ts', 'wrangler.jsonc', 'package.json']);

function tokenMap(identity: TenantIdentity): Array<[string, string]> {
  const tokens: Array<[string, string]> = [
    ['@tenant/_template', `@tenant/${identity.slug}`],
    ['__SLUG__', identity.slug],
    ['__NOMBRE_DEL_CAMPING__', identity.name],
    ['__DOMINIO__', identity.domain],
    ['__ZONA__', identity.zone],
  ];
  if (identity.address) tokens.push(['__DIRECCION__', identity.address]);
  return tokens;
}

function applyTokens(content: string, tokens: Array<[string, string]>): string {
  let out = content;
  for (const [k, v] of tokens) out = out.split(k).join(v);
  return out;
}

// `_template` es un workspace de pnpm: tiene su propio `node_modules` (symlinks
// reales al store) que jamás debe copiarse a un tenant nuevo.
const SKIP_DIRS = new Set(['node_modules', '.turbo', 'dist', '.wrangler']);

function walk(dir: string, base: string = dir): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...walk(full, base));
    else files.push(relative(base, full));
  }
  return files;
}

export type TodoReport = { file: string; todoCount: number };

export type ScaffoldResult = {
  targetDir: string;
  filesWritten: string[];
  /** Ficheros con `__TODO__` sin resolver (Capa 2: contenido en idioma real). */
  contentTodos: TodoReport[];
  /** `true` si `wrangler.jsonc` sigue con `database_id` de plantilla (Capa 3: infra real). */
  pendingDatabaseId: boolean;
};

export function scaffoldTenant(
  templateDir: string,
  tenantsDir: string,
  identity: TenantIdentity,
): ScaffoldResult {
  const slugError = validateSlug(identity.slug);
  if (slugError) throw new Error(slugError);

  const targetDir = join(tenantsDir, identity.slug);
  if (existsSync(targetDir)) {
    throw new Error(`ya existe tenants/${identity.slug} — bórralo primero o elige otro slug`);
  }

  const tokens = tokenMap(identity);
  const relFiles = walk(templateDir).filter((rel) => !SKIP_FILES.has(rel.split('/').pop() ?? ''));

  const filesWritten: string[] = [];
  for (const rel of relFiles) {
    const destPath = join(targetDir, rel);
    mkdirSync(dirname(destPath), { recursive: true });
    let content = readFileSync(join(templateDir, rel), 'utf8');
    if (TOKEN_FILES.has(rel.split('/').pop() ?? '')) content = applyTokens(content, tokens);
    writeFileSync(destPath, content);
    filesWritten.push(rel);
  }

  const readmePath = join(targetDir, 'README.md');
  writeFileSync(readmePath, tenantReadme(identity));
  filesWritten.push('README.md');

  // README.md es contenido fresco de este scaffold (no copiado de _template) y
  // habla DEL marcador __TODO__ en su propia checklist — excluirlo evita un
  // falso positivo, no es un TODO sin resolver.
  const contentTodos = filesWritten
    .filter((rel) => rel !== 'README.md')
    .map((rel) => ({
      file: rel,
      todoCount: (readFileSync(join(targetDir, rel), 'utf8').match(/__TODO__/g) ?? []).length,
    }))
    .filter((r) => r.todoCount > 0);

  const wranglerContent = readFileSync(join(targetDir, 'wrangler.jsonc'), 'utf8');
  const pendingDatabaseId = wranglerContent.includes('__TODO_DATABASE_ID__');

  return { targetDir, filesWritten, contentTodos, pendingDatabaseId };
}

function tenantReadme(identity: TenantIdentity): string {
  const { slug, name } = identity;
  return `# tenants/${slug} — ${name}

Generado por \`pnpm new:camping\` (ADR 0012 §5) el ${new Date().toISOString().slice(0, 10)}. Identidad base
(slug, nombre, dominio, zona) ya rellenada en \`config.ts\`/\`wrangler.jsonc\`/\`seed.ts\`. Lo que queda es
trabajo real, no mecánico — nadie lo automatiza por ti.

## Pendiente

**Capa 2 — contenido e inventario reales** (interpreta el material del cliente, \`/new-camping\` ayuda; valida
los números con Andreu antes de sembrar nada):
- [ ] \`content/{lang}.json\`: redacta cada \`__TODO__\` (\`grep -rln __TODO__ content/\`) en los idiomas que
      este camping vaya a ofrecer; borra los ficheros de los idiomas que NO ofrece.
- [ ] \`content/media/\`: fotos + favicon + \`og.jpg\` propios — no hay placeholders, sin fotos no se despliega.
- [ ] \`seed.ts\`: sustituye la temporada/tipo/unidades/tarifas de ejemplo por las reales (\`base_cents: 0\` es
      deliberado — imposible desplegar con un precio inventado sin que salte a la vista).
- [ ] \`config.ts\`: revisa \`tier\`, \`locales\`, \`contact\` (el asistente solo rellena identidad, no todo el resto).

**Capa 3 — infraestructura real** (requiere las credenciales de §5 del super prompt; ver \`infraPlan()\` en
\`packages/cli/src/plan.ts\` o vuelve a ejecutar \`pnpm new:camping ${slug} --plan\` para reimprimir los pasos):
- [ ] Crear la D1, aplicar migraciones, sembrar, desplegar, DNS.
- [ ] Cambiar la contraseña del owner sembrado (\`owner@${identity.domain}\` / \`cambia-esta-clave\`).
- [ ] Notificaciones/pagos: secrets + \`modules\` reales en el seed cuando el camping los active.

**Cierre**: \`pnpm check\` en verde, sin ningún \`__TODO__\` restante (ni código ni contenido) → sustituye este
README por uno de estado normal (nivel contratado, qué falta operativamente, no de alta).
`;
}
