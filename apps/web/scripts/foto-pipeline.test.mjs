import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  activeBatch,
  assertSafeToken,
  chooseProvider,
  derivativeConfig,
  higgsfieldArgs,
  higgsfieldModelFor,
  nextBatch,
  parseAspectRatio,
  reusableJob,
  sanitizeFailure,
  sourceAspectForModel,
} from './foto-pipeline.mjs';

const manifest = {
  lotes: [
    ['hero-a', 'hero-b'],
    ['card-a', 'card-b'],
  ],
  piezas: {
    'hero-a': { aspecto: '21:9', prompt: 'Hero A' },
    'hero-b': { aspecto: '21:9', prompt: 'Hero B' },
    'card-a': { aspecto: '3:2', prompt: 'Card A' },
    'card-b': { aspecto: '3:2', prompt: 'Card B' },
  },
};

describe('foto-pipeline', () => {
  it('solo devuelve el primer lote incompleto y nunca más de dos piezas', () => {
    assert.deepEqual(nextBatch(manifest, new Set(['hero-a'])), ['hero-b']);
    assert.deepEqual(nextBatch(manifest, new Set(['hero-a', 'hero-b'])), ['card-a', 'card-b']);
    assert.deepEqual(
      nextBatch({ ...manifest, lotes: [['hero-a', 'hero-b', 'card-a']] }, new Set()),
      ['hero-a', 'hero-b'],
    );
  });

  it('mantiene el lote completo activo aunque una pieza ya esté aprobada', () => {
    assert.deepEqual(activeBatch(manifest, new Set(['hero-a'])), ['hero-a', 'hero-b']);
    assert.deepEqual(activeBatch(manifest, new Set(['hero-a', 'hero-b'])), ['card-a', 'card-b']);
  });

  it('mantiene Codex como principal y abre Higgsfield tras dos fallos sin bytes', () => {
    const policy = {
      primary: 'codex-integrated',
      fallback: 'higgsfield',
      fallbackAfterFailures: 2,
    };
    assert.equal(chooseProvider(policy, []), 'codex-integrated');
    assert.equal(
      chooseProvider(policy, [
        { provider: 'codex-integrated', status: 'failed', error: 'network_before_bytes' },
      ]),
      'codex-integrated',
    );
    assert.equal(
      chooseProvider(policy, [
        { provider: 'codex-integrated', status: 'failed', error: 'network_before_bytes' },
        { provider: 'codex-integrated', status: 'failed', error: 'visual_quality_rejected' },
      ]),
      'codex-integrated',
    );
    assert.equal(
      chooseProvider(policy, [
        { provider: 'codex-integrated', status: 'failed', error: 'network_before_bytes' },
        { provider: 'codex-integrated', status: 'failed', error: 'network_before_bytes' },
      ]),
      'higgsfield',
    );
  });

  it('construye una llamada Higgsfield bloqueante y reproducible', () => {
    assert.deepEqual(higgsfieldArgs('soul_location', manifest.piezas['hero-a']), [
      'generate',
      'create',
      'soul_location',
      '--prompt',
      'Hero A',
      '--aspect_ratio',
      '21:9',
      '--wait',
      '--json',
    ]);
    assert.deepEqual(higgsfieldArgs('gpt_image_2', manifest.piezas['hero-a']), [
      'generate',
      'create',
      'gpt_image_2',
      '--prompt',
      'Hero A',
      '--aspect_ratio',
      '16:9',
      '--quality',
      'high',
      '--resolution',
      '2k',
      '--wait',
      '--json',
    ]);
    assert.equal(sourceAspectForModel('gpt_image_2', '21:9'), '16:9');
  });

  it('cambia de modelo tras dos rechazos visuales sin cambiar de proveedor', () => {
    const policy = {
      higgsfieldModel: 'soul_location',
      higgsfieldFallbackModel: 'gpt_image_2',
      modelFallbackAfterRejections: 2,
    };
    assert.equal(higgsfieldModelFor(policy, [{}]), 'soul_location');
    assert.equal(higgsfieldModelFor(policy, [{}, {}]), 'gpt_image_2');
  });

  it('no reutiliza un trabajo que ya fue rechazado visualmente', () => {
    const jobs = [
      {
        id: 'job-rejected',
        job_type: 'soul_location',
        status: 'completed',
        params: { prompt: 'Hero A', aspect_ratio: '21:9' },
      },
      {
        id: 'job-new',
        job_type: 'soul_location',
        status: 'completed',
        params: { prompt: 'Hero A', aspect_ratio: '21:9' },
      },
    ];
    assert.equal(
      reusableJob(jobs, 'soul_location', manifest.piezas['hero-a'], new Set(['job-rejected'])).id,
      'job-new',
    );
    assert.equal(
      reusableJob(
        [{ ...jobs[1], params: { prompt: 'Hero A', aspect_ratio: '3:2' } }],
        'soul_location',
        manifest.piezas['hero-a'],
      ),
      undefined,
    );
  });

  it('valida proporciones y rechaza nombres capaces de salir del tenant', () => {
    assert.equal(parseAspectRatio('21:9'), 21 / 9);
    assert.equal(parseAspectRatio('3:2'), 1.5);
    assert.throws(() => parseAspectRatio('auto'));
    assert.equal(assertSafeToken('hero-laguna', 'pieza'), 'hero-laguna');
    assert.throws(() => assertSafeToken('../secreto', 'pieza'));
  });

  it('no persiste secretos ni respuestas enormes en el registro de fallos', () => {
    const failure = sanitizeFailure(
      'Authorization: Bearer super-secret-token api_key=also-secret\nnetwork timeout '.repeat(40),
    );
    assert.ok(failure.length <= 300);
    assert.doesNotMatch(failure, /super-secret-token/);
    assert.doesNotMatch(failure, /also-secret/);
    assert.match(failure, /Authorization: \[redacted\]/);
    assert.match(failure, /api_key=\[redacted\]/);
  });

  it('valida la receta de derivados sin permitir fuentes ajenas al manifiesto', () => {
    assert.deepEqual(
      derivativeConfig({
        ...manifest,
        derivados: {
          fuente: 'hero-a',
          titulo: 'Mar de Fondo',
          subtitulo: '300 unidades · Costa Blanca',
        },
      }),
      {
        source: 'hero-a',
        title: 'Mar de Fondo',
        subtitle: '300 unidades · Costa Blanca',
      },
    );
    assert.throws(() =>
      derivativeConfig({
        ...manifest,
        derivados: { fuente: 'otro-tenant', titulo: 'Demo', subtitulo: 'Costa' },
      }),
    );
  });
});
