import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repo = join(packageRoot, '..', '..');
const tsx = join(packageRoot, 'node_modules', '.bin', 'tsx');
const cli = join(packageRoot, 'src', 'cli.ts');

describe('new:camping --dry-run', () => {
  it('valida el alta completa sin escribir dentro de tenants', () => {
    const slug = 'r13-cli-dry-run';
    const target = join(repo, 'tenants', slug);
    expect(existsSync(target)).toBe(false);

    const result = spawnSync(
      tsx,
      [
        cli,
        slug,
        '--name',
        `Camping d'Andreu "Nord"`,
        '--domain',
        'camping-r13.example',
        '--dry-run',
      ],
      { cwd: repo, encoding: 'utf8' },
    );

    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain('dry-run');
    expect(result.stdout).toMatch(/huella [a-f0-9]{64}/);
    expect(existsSync(target)).toBe(false);
  });

  it('impide combinar dry-run con apply', () => {
    const result = spawnSync(
      tsx,
      [
        cli,
        'r13-cli-conflict',
        '--name',
        'Camping R13',
        '--domain',
        'camping-r13.example',
        '--dry-run',
        '--apply',
      ],
      { cwd: repo, encoding: 'utf8' },
    );

    expect(result.status).toBe(1);
    expect(`${result.stdout}\n${result.stderr}`).toContain('no se pueden combinar');
    expect(existsSync(join(repo, 'tenants', 'r13-cli-conflict'))).toBe(false);
  });
});
