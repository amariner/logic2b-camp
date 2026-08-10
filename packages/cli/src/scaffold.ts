/**
 * Capa 1 (mecánica) del alta de un camping — ADR 0012 §5. Copia
 * `tenants/_template` a `tenants/{slug}` sustituyendo los tokens de
 * identidad en los ficheros que los llevan. Puro: solo lee/escribe en el
 * repo local, no toca Cloudflare — eso es `infra.ts`, y solo con `--apply`.
 */
import { createHash } from 'node:crypto';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, extname, join, relative } from 'node:path';
import { domainToASCII } from 'node:url';

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

function normalizedText(value: string, label: string, maxLength: number): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${label} no puede estar vacío`);
  if (normalized.length > maxLength) {
    throw new Error(`${label} no puede superar ${maxLength} caracteres`);
  }
  if (
    [...normalized].some((character) => {
      const code = character.charCodeAt(0);
      return code <= 31 || code === 127;
    })
  ) {
    throw new Error(`${label} no admite caracteres de control`);
  }
  return normalized;
}

function normalizedHostname(value: string, label: string): string {
  const normalized = value.trim().toLowerCase();
  if (!normalized || /[\\/:@?#\s]/.test(normalized)) {
    throw new Error(`${label} debe ser un hostname sin protocolo, ruta, puerto ni credenciales`);
  }
  const ascii = domainToASCII(normalized);
  const labels = ascii.split('.');
  if (
    !ascii ||
    ascii.length > 253 ||
    labels.length < 2 ||
    labels.some(
      (part) =>
        part.length < 1 || part.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(part),
    )
  ) {
    throw new Error(`${label} debe ser un hostname DNS válido`);
  }
  return ascii;
}

/** Frontera única de identidad antes de generar ficheros o planes. */
export function validateTenantIdentity(identity: TenantIdentity): TenantIdentity {
  const slugError = validateSlug(identity.slug);
  if (slugError) throw new Error(slugError);
  const name = normalizedText(identity.name, 'el nombre', 120);
  const domain = normalizedHostname(identity.domain, 'el dominio');
  const zone = normalizedHostname(identity.zone, 'la zona');
  if (domain !== zone && !domain.endsWith(`.${zone}`)) {
    throw new Error(`el dominio ${domain} no pertenece a la zona ${zone}`);
  }
  const address =
    identity.address === undefined
      ? undefined
      : normalizedText(identity.address, 'la dirección', 240);
  return { slug: identity.slug, name, domain, zone, address };
}

// Ficheros de _template que NO se copian tal cual al tenant nuevo.
const SKIP_FILES = new Set(['wrangler.jsonc.example', 'README.md']);
// Ficheros donde se sustituyen los tokens de identidad — el resto
// (content/*.json, custom/hooks.ts, data.ts) se copia byte a byte: sus
// TODOs son trabajo de la Capa 2 (interpretar el material real del cliente).
const TOKEN_FILES = new Set([
  'config.ts',
  'seed.ts',
  'wrangler.jsonc',
  'package.json',
  'identity.json',
  'fotos.json',
]);

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

function escapedStringContent(value: string): string {
  return JSON.stringify(value).slice(1, -1);
}

function tokenValueForFile(value: string, relativePath: string): string {
  const extension = extname(relativePath);
  if (extension === '.json' || extension === '.jsonc') return escapedStringContent(value);
  if (extension === '.ts') return value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
  return value;
}

function applyTokens(
  content: string,
  tokens: Array<[string, string]>,
  relativePath: string,
): string {
  let out = content;
  for (const [k, v] of tokens) out = out.split(k).join(tokenValueForFile(v, relativePath));
  return out;
}

// `_template` es un workspace de pnpm: tiene su propio `node_modules` (symlinks
// reales al store) que jamás debe copiarse a un tenant nuevo.
const SKIP_DIRS = new Set(['node_modules', '.turbo', 'dist', '.wrangler']);

function walk(dir: string, base: string = dir): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir).sort()) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const stat = lstatSync(full);
    if (stat.isSymbolicLink()) {
      throw new Error(
        `la plantilla contiene un enlace simbólico no permitido: ${relative(base, full)}`,
      );
    }
    if (stat.isDirectory()) files.push(...walk(full, base));
    else files.push(relative(base, full));
  }
  return files;
}

export type TodoReport = { file: string; todoCount: number };
export type PlaceholderReport = { file: string; markers: string[] };

export type ScaffoldResult = {
  targetDir: string;
  filesWritten: string[];
  /** Compatibilidad: subconjunto de TODOs que vive bajo content/. */
  contentTodos: TodoReport[];
  /** Todos los ficheros de identidad/contenido/media que requieren criterio. */
  setupTodos: TodoReport[];
  /** Todos los marcadores `__...__` que impiden considerar lista el alta. */
  placeholders: PlaceholderReport[];
  /** `true` si `wrangler.jsonc` sigue con `database_id` de plantilla (Capa 3: infra real). */
  pendingDatabaseId: boolean;
};

export type ScaffoldOptions = { generatedOn?: string };

export type DryRunResult = Omit<ScaffoldResult, 'targetDir'> & { fingerprint: string };

function generatedDate(value = new Date().toISOString().slice(0, 10)): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
    throw new Error('generatedOn debe ser una fecha ISO YYYY-MM-DD');
  }
  return value;
}

export function scaffoldTenant(
  templateDir: string,
  tenantsDir: string,
  identity: TenantIdentity,
  options: ScaffoldOptions = {},
): ScaffoldResult {
  const validIdentity = validateTenantIdentity(identity);
  const generatedOn = generatedDate(options.generatedOn);

  const targetDir = join(tenantsDir, validIdentity.slug);
  if (existsSync(targetDir)) {
    throw new Error(`ya existe tenants/${validIdentity.slug} — bórralo primero o elige otro slug`);
  }

  const tokens = tokenMap(validIdentity);
  const relFiles = walk(templateDir).filter((rel) => !SKIP_FILES.has(rel.split('/').pop() ?? ''));
  mkdirSync(tenantsDir, { recursive: true });
  const stagingDir = mkdtempSync(join(tenantsDir, `.${validIdentity.slug}-staging-`));

  const filesWritten: string[] = [];
  try {
    for (const rel of relFiles) {
      const destPath = join(stagingDir, rel);
      mkdirSync(dirname(destPath), { recursive: true });
      let content = readFileSync(join(templateDir, rel), 'utf8');
      if (TOKEN_FILES.has(rel.split('/').pop() ?? '')) {
        content = applyTokens(content, tokens, rel);
      }
      writeFileSync(destPath, content);
      filesWritten.push(rel);
    }

    const readmePath = join(stagingDir, 'README.md');
    writeFileSync(readmePath, tenantReadme(validIdentity, generatedOn));
    filesWritten.push('README.md');

    // README.md es contenido fresco de este scaffold (no copiado de _template) y
    // habla DEL marcador __TODO__ en su propia checklist — excluirlo evita un
    // falso positivo, no es un TODO sin resolver.
    // Un directorio vacío no viaja en git ni aparece en `walk()`: se crea de
    // forma explícita para que `pnpm fotos` tenga siempre el mismo destino.
    mkdirSync(join(stagingDir, 'content', 'media'), { recursive: true });

    for (const rel of filesWritten.filter((file) => extname(file) === '.json')) {
      try {
        JSON.parse(readFileSync(join(stagingDir, rel), 'utf8'));
      } catch (error) {
        throw new Error(
          `el scaffold genera JSON inválido en ${rel}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    const setupTodos = filesWritten
      .filter((rel) => rel !== 'README.md')
      .map((rel) => ({
        file: rel,
        todoCount: (readFileSync(join(stagingDir, rel), 'utf8').match(/__TODO__/g) ?? []).length,
      }))
      .filter((r) => r.todoCount > 0);
    const contentTodos = setupTodos.filter((report) => report.file.startsWith('content/'));
    const placeholders = filesWritten
      .filter((rel) => rel !== 'README.md')
      .map((rel) => ({
        file: rel,
        markers: [
          ...new Set(
            readFileSync(join(stagingDir, rel), 'utf8').match(/__[A-Z][A-Z0-9_]*__/g) ?? [],
          ),
        ].sort(),
      }))
      .filter((report) => report.markers.length > 0);

    const wranglerContent = readFileSync(join(stagingDir, 'wrangler.jsonc'), 'utf8');
    const pendingDatabaseId = wranglerContent.includes('__TODO_DATABASE_ID__');

    renameSync(stagingDir, targetDir);
    return {
      targetDir,
      filesWritten,
      contentTodos,
      setupTodos,
      placeholders,
      pendingDatabaseId,
    };
  } catch (error) {
    rmSync(stagingDir, { recursive: true, force: true });
    throw error;
  }
}

/** Ensaya el scaffold en el directorio temporal del sistema y elimina todo al terminar. */
export function dryRunTenant(
  templateDir: string,
  identity: TenantIdentity,
  options: ScaffoldOptions = {},
): DryRunResult {
  const scratch = mkdtempSync(join(tmpdir(), 'logic-camp-onboarding-'));
  try {
    const result = scaffoldTenant(templateDir, scratch, identity, options);
    const hash = createHash('sha256');
    for (const rel of [...result.filesWritten].sort()) {
      hash.update(rel);
      hash.update('\0');
      hash.update(readFileSync(join(result.targetDir, rel)));
      hash.update('\0');
    }
    return {
      filesWritten: result.filesWritten,
      contentTodos: result.contentTodos,
      setupTodos: result.setupTodos,
      placeholders: result.placeholders,
      pendingDatabaseId: result.pendingDatabaseId,
      fingerprint: hash.digest('hex'),
    };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

function tenantReadme(identity: TenantIdentity, generatedOn: string): string {
  const { slug, name } = identity;
  return `# tenants/${slug} — ${name}

Generado por \`pnpm new:camping\` (ADR 0012 §5) el ${generatedOn}. Identidad base
(slug, nombre, dominio, zona) ya rellenada en \`config.ts\`/\`wrangler.jsonc\`/\`seed.ts\`. Lo que queda es
trabajo real, no mecánico — nadie lo automatiza por ti.

## Pendiente

**Capa 2 — contenido e inventario reales** (interpreta el material del cliente, \`/new-camping\` ayuda; valida
los números con Andreu antes de sembrar nada):
- [ ] \`identity.json\`: aprueba ICP, objeción, nivel, historia, tono, paleta, tipografía, pantallas firma,
      inventario fotográfico y criterio de éxito antes de producir piezas.
- [ ] \`content/{lang}.json\`: redacta cada \`__TODO__\` (\`grep -rln __TODO__ content/\`) en los idiomas que
      este camping vaya a ofrecer; borra los ficheros de los idiomas que NO ofrece.
- [ ] \`fotos.json\` + \`content/media/\`: fija procedencia/licencia, prompts y lotes; genera o ingiere con
      \`pnpm fotos -- status ${slug}\` / \`run ${slug}\` y aprueba antes de crear derivados. Sin fotos no se despliega.
- [ ] \`seed.ts\`: sustituye la temporada/tipo/unidades/tarifas de ejemplo por las reales (\`base_cents: 0\` es
      deliberado — imposible desplegar con un precio inventado sin que salte a la vista).
- [ ] \`config.ts\`: revisa \`tier\`, \`locales\`, \`contact\` (el asistente solo rellena identidad, no todo el resto).

**Capa 3 — infraestructura real** (requiere las credenciales de §5 del super prompt; ver \`infraPlan()\` en
\`packages/cli/src/plan.ts\` o vuelve a ejecutar \`pnpm new:camping ${slug} --plan-only\` para reimprimir los pasos):
- [ ] Crear la D1, aplicar migraciones, sembrar, desplegar, DNS.
- [ ] Cambiar la contraseña del owner sembrado (\`owner@${identity.domain}\` / \`cambia-esta-clave\`).
- [ ] Notificaciones/pagos: secrets + \`modules\` reales en el seed cuando el camping los active.

**Cierre**: \`pnpm check\` en verde, sin ningún \`__TODO__\` restante (ni código ni contenido) → sustituye este
README por uno de estado normal (nivel contratado, qué falta operativamente, no de alta).
`;
}
