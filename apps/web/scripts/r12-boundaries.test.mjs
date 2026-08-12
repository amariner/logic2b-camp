import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  auditR12Repository,
  auditPublicArtifact,
  assertNoExternalRuntime,
  assertNoForbiddenDependency,
  assertNoTrackingSource,
} from './r12-boundaries.mjs';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

describe('fronteras locales R12', () => {
  it('rechaza trackers y almacenamiento de seguimiento en el código público', () => {
    assert.throws(() => assertNoTrackingSource("gtag('config', 'G-123')", 'fixture.ts'), /gtag/);
    assert.throws(
      () => assertNoTrackingSource("navigator.sendBeacon('/collect', body)", 'fixture.ts'),
      /sendBeacon/,
    );
    assert.throws(
      () => assertNoTrackingSource("document.cookie = 'visitor=abc'", 'fixture.ts'),
      /document\.cookie/,
    );
    assert.doesNotThrow(() =>
      assertNoTrackingSource("localStorage.setItem('lc-theme', 'oscuro')", 'fixture.ts'),
    );
  });

  it('rechaza dependencias que activarían analítica, modelos u OTA', () => {
    for (const dependency of ['@sentry/cloudflare', 'posthog-js', 'openai', '@anthropic-ai/sdk']) {
      assert.throws(() => assertNoForbiddenDependency(dependency, 'fixture/package.json'));
    }
    assert.doesNotThrow(() => assertNoForbiddenDependency('astro', 'fixture/package.json'));
  });

  it('permite enlaces externos pero no recursos ejecutables o píxeles remotos', () => {
    assert.doesNotThrow(() =>
      assertNoExternalRuntime('<a href="https://example.com">Referencia</a>', 'index.html'),
    );
    assert.throws(
      () =>
        assertNoExternalRuntime(
          '<script src="https://www.googletagmanager.com/gtag/js"></script>',
          'index.html',
        ),
      /script remoto/,
    );
    assert.throws(
      () => assertNoExternalRuntime('<img src="https://tracker.example/pixel">', 'index.html'),
      /imagen remota/,
    );
    assert.throws(
      () => assertNoExternalRuntime("fetch('https://collector.example/event')", 'app.js'),
      /fetch remoto/,
    );
  });

  it('permite retirar el contacto cuando el contrato del tenant lo desactiva', () => {
    const fixture = mkdtempSync(join(tmpdir(), 'logic-camp-r12-contact-'));
    try {
      writeFileSync(join(fixture, 'index.html'), '<!doctype html><title>Tenant</title>');
      assert.doesNotThrow(() =>
        auditPublicArtifact(fixture, {
          requireCookies: false,
          requireLogic2BContact: false,
        }),
      );
      assert.throws(
        () => auditPublicArtifact(fixture, { requireCookies: false }),
        /data-logic2b-contact/,
      );
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });

  it('mantiene cerradas las cuatro fronteras en el repositorio real', () => {
    const result = auditR12Repository(repo);

    assert.ok(result.sourceFiles > 0);
    assert.ok(result.manifests > 0);
  });
});
