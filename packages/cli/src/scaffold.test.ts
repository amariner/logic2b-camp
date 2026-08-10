import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { scaffoldTenant, validateSlug } from './scaffold';

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

  it('no copia el README de plantilla ni el wrangler.jsonc.example', () => {
    tenantsDir = mkdtempSync(join(tmpdir(), 'logic-camp-cli-'));
    const result = scaffoldTenant(templateDir, tenantsDir, identity);
    expect(result.filesWritten).not.toContain('wrangler.jsonc.example');
    const readme = readFileSync(join(result.targetDir, 'README.md'), 'utf8');
    expect(readme).toContain('tenants/test-camping');
    expect(readme).toContain('Camping de Prueba');
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
