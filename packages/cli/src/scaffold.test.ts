import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterEach, describe, expect, it } from 'vitest';
import { dryRunTenant, scaffoldTenant, validateSlug, validateTenantIdentity } from './scaffold';

const templateDir = join(dirname(), '../../../tenants/_template');

function dirname(): string {
  return fileURLToPath(new URL('.', import.meta.url));
}

const identity = {
  slug: 'test-camping',
  name: 'Camping de Prueba',
  domain: 'campingdeprueba.com',
  zone: 'campingdeprueba.com',
};

let tenantsDir: string;

afterEach(() => {
  if (tenantsDir) rmSync(tenantsDir, { recursive: true, force: true });
});

describe('validateSlug', () => {
  it('acepta minúsculas/números/guiones', () => {
    expect(validateSlug('cala-sereno-2')).toBeNull();
  });

  it('rechaza mayúsculas, espacios y guiones al borde', () => {
    expect(validateSlug('Cala Sereno')).not.toBeNull();
    expect(validateSlug('-cala')).not.toBeNull();
    expect(validateSlug('cala-')).not.toBeNull();
  });

  it('rechaza los slugs reservados', () => {
    expect(validateSlug('_template')).not.toBeNull();
    expect(validateSlug('demo')).not.toBeNull();
  });
});

describe('validateTenantIdentity', () => {
  it('normaliza dominio y zona y conserva caracteres legítimos del nombre', () => {
    expect(
      validateTenantIdentity({
        ...identity,
        name: `  Camping d'Andreu "Nord"  `,
        domain: 'RESERVAS.CAMPINGDEPRUEBA.COM',
        zone: 'CAMPINGDEPRUEBA.COM',
      }),
    ).toMatchObject({
      name: `Camping d'Andreu "Nord"`,
      domain: 'reservas.campingdeprueba.com',
      zone: 'campingdeprueba.com',
    });
  });

  it.each([
    { field: 'name', patch: { name: '   ' } },
    { field: 'domain', patch: { domain: 'https://camping.example' } },
    { field: 'domain', patch: { domain: 'camping.example/ruta' } },
    { field: 'zone', patch: { domain: 'camping.example', zone: 'otra.example' } },
  ])('rechaza una identidad insegura o incoherente: $field', ({ patch }) => {
    expect(() => validateTenantIdentity({ ...identity, ...patch })).toThrow();
  });
});

describe('scaffoldTenant', () => {
  it('copia _template sustituyendo los tokens de identidad', () => {
    tenantsDir = mkdtempSync(join(tmpdir(), 'logic-camp-cli-'));
    const result = scaffoldTenant(templateDir, tenantsDir, identity);

    const config = readFileSync(join(result.targetDir, 'config.ts'), 'utf8');
    expect(config).toContain(`slug: 'test-camping'`);
    expect(config).toContain(`name: 'Camping de Prueba'`);
    expect(config).toContain('https://campingdeprueba.com');
    expect(config).not.toContain('__SLUG__');
    expect(config).not.toContain('__NOMBRE_DEL_CAMPING__');
    expect(config).not.toContain('__DOMINIO__');

    const wrangler = readFileSync(join(result.targetDir, 'wrangler.jsonc'), 'utf8');
    expect(wrangler).toContain('logic-camp-test-camping');
    expect(wrangler).toContain('campingdeprueba.com/*');
    expect(wrangler).toContain('__TODO_DATABASE_ID__'); // Capa 3, no se inventa

    const pkg = JSON.parse(readFileSync(join(result.targetDir, 'package.json'), 'utf8'));
    expect(pkg.name).toBe('@tenant/test-camping');

    const seed = readFileSync(join(result.targetDir, 'seed.ts'), 'utf8');
    expect(seed).not.toContain('__SLUG__');
    expect(seed).toContain("SLUG = 'test-camping'");
  });

  it('deja intacto el contenido de idioma (Capa 2, no automatizable) y lo reporta', () => {
    tenantsDir = mkdtempSync(join(tmpdir(), 'logic-camp-cli-'));
    const result = scaffoldTenant(templateDir, tenantsDir, identity);

    const es = readFileSync(join(result.targetDir, 'content/es.json'), 'utf8');
    expect(es).toContain('__TODO__');
    expect(result.contentTodos.length).toBeGreaterThan(0);
    expect(result.contentTodos.every((t) => t.file.startsWith('content/'))).toBe(true);
    expect(result.setupTodos.some((t) => t.file === 'identity.json')).toBe(true);
    expect(result.setupTodos.some((t) => t.file === 'fotos.json')).toBe(true);
    expect(existsSync(join(result.targetDir, 'content/media'))).toBe(true);
    expect(result.pendingDatabaseId).toBe(true);
  });

  it('personaliza el brief y el manifiesto sin tocar apps ni packages', () => {
    tenantsDir = mkdtempSync(join(tmpdir(), 'logic-camp-cli-'));
    const result = scaffoldTenant(templateDir, tenantsDir, identity);
    const brief = JSON.parse(readFileSync(join(result.targetDir, 'identity.json'), 'utf8'));
    const fotos = JSON.parse(readFileSync(join(result.targetDir, 'fotos.json'), 'utf8'));
    expect(brief.id).toBe(identity.slug);
    expect(brief.name).toBe(identity.name);
    expect(fotos.derivados.titulo).toBe(identity.name);
  });

  it('escapa nombre y dirección según TS/JSON sin perder su valor', () => {
    tenantsDir = mkdtempSync(join(tmpdir(), 'logic-camp-cli-'));
    const specialIdentity = {
      ...identity,
      name: `Camping d'Andreu "Nord"`,
      address: `Camí d'Enmig, 3`,
    };
    const result = scaffoldTenant(templateDir, tenantsDir, specialIdentity);

    const config = readFileSync(join(result.targetDir, 'config.ts'), 'utf8');
    expect(config).toContain(`name: 'Camping d\\'Andreu "Nord"'`);
    expect(config).toContain(`address: 'Camí d\\'Enmig, 3'`);
    expect(JSON.parse(readFileSync(join(result.targetDir, 'identity.json'), 'utf8')).name).toBe(
      specialIdentity.name,
    );
    expect(
      JSON.parse(readFileSync(join(result.targetDir, 'fotos.json'), 'utf8')).derivados.titulo,
    ).toBe(specialIdentity.name);
    for (const relativePath of result.filesWritten.filter((file) => file.endsWith('.ts'))) {
      const transpiled = ts.transpileModule(
        readFileSync(join(result.targetDir, relativePath), 'utf8'),
        { reportDiagnostics: true },
      );
      const errors = (transpiled.diagnostics ?? []).filter(
        (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
      );
      expect(errors, relativePath).toEqual([]);
    }
  });

  it('reporta todos los marcadores pendientes, incluidos legal, dirección y D1', () => {
    tenantsDir = mkdtempSync(join(tmpdir(), 'logic-camp-cli-'));
    const result = scaffoldTenant(templateDir, tenantsDir, identity);
    const config = result.placeholders.find((report) => report.file === 'config.ts');
    const wrangler = result.placeholders.find((report) => report.file === 'wrangler.jsonc');

    expect(config?.markers).toEqual(
      expect.arrayContaining([
        '__DIRECCION__',
        '__RAZON_SOCIAL__',
        '__NIF__',
        '__DOMICILIO_FISCAL__',
        '__DATOS_REGISTRALES__',
      ]),
    );
    expect(wrangler?.markers).toContain('__TODO_DATABASE_ID__');
  });

  it('no copia el README de plantilla ni el wrangler.jsonc.example', () => {
    tenantsDir = mkdtempSync(join(tmpdir(), 'logic-camp-cli-'));
    const result = scaffoldTenant(templateDir, tenantsDir, identity);
    expect(result.filesWritten).not.toContain('wrangler.jsonc.example');
    const readme = readFileSync(join(result.targetDir, 'README.md'), 'utf8');
    expect(readme).toContain('tenants/test-camping');
    expect(readme).toContain('Camping de Prueba');
    expect(readme).toContain('pnpm new:camping test-camping --plan-only');
  });

  it('rechaza un slug ya existente', () => {
    tenantsDir = mkdtempSync(join(tmpdir(), 'logic-camp-cli-'));
    scaffoldTenant(templateDir, tenantsDir, identity);
    expect(() => scaffoldTenant(templateDir, tenantsDir, identity)).toThrow(/ya existe/);
  });

  it('rechaza un slug inválido antes de tocar el disco', () => {
    tenantsDir = mkdtempSync(join(tmpdir(), 'logic-camp-cli-'));
    expect(() =>
      scaffoldTenant(templateDir, tenantsDir, { ...identity, slug: 'Mal Slug' }),
    ).toThrow();
  });

  it('rechaza enlaces simbólicos en la plantilla antes de crear un tenant parcial', () => {
    const root = mkdtempSync(join(tmpdir(), 'logic-camp-cli-symlink-'));
    tenantsDir = root;
    const unsafeTemplate = join(root, 'template');
    mkdirSync(unsafeTemplate);
    writeFileSync(join(root, 'outside.txt'), 'fuera');
    symlinkSync(join(root, 'outside.txt'), join(unsafeTemplate, 'leak.txt'));

    expect(() => scaffoldTenant(unsafeTemplate, root, identity)).toThrow(/enlace simbólico/);
    expect(existsSync(join(root, identity.slug))).toBe(false);
  });

  it('rellena __DIRECCION__ solo si se aporta', () => {
    tenantsDir = mkdtempSync(join(tmpdir(), 'logic-camp-cli-'));
    const result = scaffoldTenant(templateDir, tenantsDir, {
      ...identity,
      address: 'Camí de la Platja, 3',
    });
    const config = readFileSync(join(result.targetDir, 'config.ts'), 'utf8');
    expect(config).toContain('Camí de la Platja, 3');
    expect(config).not.toContain('__DIRECCION__');
  });
});

describe('dryRunTenant', () => {
  it('ensaya en temporal, no persiste el tenant y produce una huella determinista', () => {
    const dryIdentity = { ...identity, slug: 'r13-dry-run-test' };
    const repoTenant = join(templateDir, '..', dryIdentity.slug);
    expect(existsSync(repoTenant)).toBe(false);

    const first = dryRunTenant(templateDir, dryIdentity, { generatedOn: '2026-08-10' });
    const second = dryRunTenant(templateDir, dryIdentity, { generatedOn: '2026-08-10' });

    expect(first.fingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(second.fingerprint).toBe(first.fingerprint);
    expect(first.filesWritten.length).toBeGreaterThan(0);
    expect(first.placeholders.some((report) => report.file === 'config.ts')).toBe(true);
    expect(existsSync(repoTenant)).toBe(false);
  });
});
