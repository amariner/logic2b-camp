/**
 * Generador de las OG images de la landing (1200×630, una por idioma).
 *
 * `pnpm --filter @logic-camp/site og`
 *
 * Por qué existe como fichero commiteado y no como script de sesión: la OG
 * anterior (C5.2, ADR 0024) se renderizó con un script que no se guardó, así
 * que al cambiar el logo en la sesión 59 la tarjeta quedó con una marca
 * muerta y hubo que reconstruir el generador entero para rehacerla. Ahora un
 * cambio de marca es UN comando.
 *
 * Contrato de la pieza (docs/BRAND.md §0): la landing es superficie **Logic2B**,
 * no del tenant — cero fotografía de camping, cero isotipo (retirado del logo
 * del producto en la 59). Los colores NO se copian aquí: se leen del `:root` de
 * `packages/ui/src/theme.css`, que es la fuente de verdad del DS. Duplicarlos
 * habría creado justo la deuda que este fichero existe para evitar — una marca
 * que cambia en el sitio y no en la tarjeta.
 */
import { chromium } from 'playwright';
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const fuentes = join(raiz, 'public', 'fonts');

/**
 * Tokens leídos del `:root` del DS. Se corta el fichero al llegar al SELECTOR
 * `.dark {` —no a la primera aparición del texto «.dark», que sale antes en un
 * comentario y dejaba fuera del corte la mitad del `:root`— porque el tema
 * oscuro redefine los mismos nombres y su valor ganaría.
 */
async function tokensDelDS() {
  const css = await readFile(
    join(raiz, '..', '..', 'packages', 'ui', 'src', 'theme.css'),
    'utf8',
  );
  const claro = css.slice(0, css.search(/^\.dark\s*\{/m));
  const lee = (nombre) => {
    const m = claro.match(new RegExp(`--${nombre}:\\s*([^;]+);`));
    if (!m) throw new Error(`Token --${nombre} no está en el :root de theme.css`);
    return m[1].trim();
  };
  return {
    background: lee('background'),
    foreground: lee('foreground'),
    logo2b: lee('logo-2b'),
    muted: lee('muted-foreground'),
    border: lee('border'),
  };
}
const T = await tokensDelDS();

/** El texto sale del MISMO content/{lang}.json que pinta la landing. */
const TARJETAS = [
  { lang: 'es', salida: 'og.png' },
  { lang: 'en', salida: 'og-en.png' },
];

async function fuenteBase64(fichero) {
  return (await readFile(join(fuentes, fichero))).toString('base64');
}

async function html({ kicker, titulo, nota }) {
  const [p600, p800, sg, inter] = await Promise.all([
    fuenteBase64('poppins-600-latin.woff2'),
    fuenteBase64('poppins-800-logo.woff2'),
    fuenteBase64('SpaceGrotesk-latin.woff2'),
    fuenteBase64('InterVariable.woff2'),
  ]);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face { font-family: Poppins; font-weight: 600; src: url(data:font/woff2;base64,${p600}) format('woff2'); }
  @font-face { font-family: Poppins; font-weight: 800; src: url(data:font/woff2;base64,${p800}) format('woff2'); }
  @font-face { font-family: 'Space Grotesk'; font-weight: 300 700; src: url(data:font/woff2;base64,${sg}) format('woff2'); }
  @font-face { font-family: Inter; font-weight: 100 900; src: url(data:font/woff2;base64,${inter}) format('woff2'); }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; display: flex; flex-direction: column;
    justify-content: space-between; padding: 88px 96px;
    background: ${T.background}; color: ${T.foreground};
    font-family: Inter, sans-serif; -webkit-font-smoothing: antialiased;
    /* Rejilla apenas visible: la misma textura de la tarjeta anterior, que es
       lo único que se conserva de ella (continuidad de marca, no del logo). */
    background-image:
      linear-gradient(${T.border} 1px, transparent 1px),
      linear-gradient(90deg, ${T.border} 1px, transparent 1px);
    background-size: 96px 96px;
    background-position: -1px -1px;
  }
  /* La rejilla se apaga BAJO el texto, no al lado: al desvanecerla hacia la
     derecha, la textura quedaba fuerte justo en la mitad sin contenido y ese
     lado se leía como un hueco. Ahora es un velo suave sobre todo el lienzo,
     un poco más denso a la izquierda, donde vive la tipografía. */
  .velo {
    position: absolute; inset: 0;
    background: linear-gradient(105deg, ${T.background} 0%, ${T.background} 34%, rgba(255,255,255,.72) 78%, rgba(255,255,255,.6) 100%),
                linear-gradient(0deg, ${T.background} 4%, transparent 34%);
  }
  .capa { position: relative; display: flex; flex-direction: column; justify-content: center; height: 100%; }
  .kicker {
    font-size: 21px; font-weight: 500; letter-spacing: .14em; text-transform: uppercase;
    color: ${T.muted};
  }
  .wordmark {
    margin-top: 26px;
    font-family: Poppins, sans-serif; font-weight: 600; font-size: 82px;
    letter-spacing: .015em; line-height: 1;
  }
  .wordmark .dosb { font-weight: 800; color: ${T.logo2b}; }
  .wordmark .campings { color: ${T.muted}; }
  h1 {
    margin-top: 38px; max-width: 14em;
    font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 46px;
    line-height: 1.2; letter-spacing: -.022em;
  }
  /* La promesa que la landing hace en el héroe, palabra por palabra: es lo que
     separa esta tarjeta de una placa de marca. */
  .nota { margin-top: 26px; font-size: 22px; color: ${T.muted}; }
  .pie {
    position: absolute; left: 0; right: 0; bottom: 0;
    display: flex; align-items: center; gap: 16px;
    padding-top: 24px; border-top: 1px solid ${T.border};
    font-size: 21px; color: ${T.muted};
  }
  .punto { width: 5px; height: 5px; border-radius: 50%; background: ${T.border}; }
</style></head><body>
  <div class="velo"></div>
  <div class="capa">
    <div>
      <p class="kicker">${kicker}</p>
      <p class="wordmark">Logic<span class="dosb">2B</span> <span class="campings">Campings</span></p>
      <h1>${titulo}</h1>
      <p class="nota">${nota}</p>
    </div>
    <div class="pie"><span>camp.logic2b.com</span><span class="punto"></span><span>Logic2B · Castelló</span></div>
  </div>
</body></html>`;
}

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await mkdir(join(raiz, 'public'), { recursive: true });

for (const { lang, salida } of TARJETAS) {
  const c = JSON.parse(await readFile(join(raiz, 'src', 'content', `${lang}.json`), 'utf8'));
  // El kicker de la landing lleva «· de Logic2B» y aquí la marca ya está en el
  // wordmark: se recorta lo que sobra en vez de escribir un texto paralelo que
  // mañana diverja del de la página.
  const kicker = c.hero.kicker.split('·')[0].trim();
  await pagina.setContent(await html({ kicker, titulo: c.hero.titulo, nota: c.hero.nota }), {
    waitUntil: 'load',
  });
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.screenshot({ path: join(raiz, 'public', salida) });
  console.log(`✓ public/${salida} — ${kicker} · ${c.hero.titulo}`);
}

await navegador.close();
