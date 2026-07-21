/**
 * Páginas legales de la web de tenant (ADR 0026 §2.5).
 *
 * El texto legal es de **producto**, no de tenant: se escribe una vez, en
 * `src/content/legal/{slug}.{lang}.md`, y sirve a todos los campings. Lo único
 * que varía por instancia son los cinco campos de `config.legal`, que se
 * interpolan como `{razonSocial}`, `{nif}`… en la prosa ya compilada. Escribir
 * el aviso legal a mano por camping sería exactamente la decisión prohibida por
 * CLAUDE.md: multiplicar trabajo por número de clientes.
 *
 * El mecanismo multi-idioma es el que ya usan el blog del tenant
 * (`content.ts` §blog) y la documentación de producto (`apps/site/src/lib/docs.ts`,
 * ADR 0025): `import.meta.glob` + `{slug}.{lang}.md` + lectura con fallback al
 * castellano, **avisado en pantalla** (`esFallback`) y nunca en silencio.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * AVISO PARA QUIEN AÑADA ANALÍTICA:
 * `cookies.es.md` afirma que esta web no tiene seguimiento y que por eso no hay
 * banner de consentimiento. Hoy es verdad y es comprobable: el único almacenamiento
 * del cliente son `lc-theme` y `lc-nivel` en localStorage (`Base.astro`), ambos
 * funcionales, y la única cookie es la de sesión de Better Auth, necesaria.
 * Una herramienta de medición *cookieless* y sin identificadores de dispositivo
 * (p. ej. Cloudflare Web Analytics) mantiene esa posición. **Cualquier otra la
 * rompe**: obliga a banner de consentimiento previo y a reescribir esta página.
 * ────────────────────────────────────────────────────────────────────────────
 */
import type { MarkdownInstance } from 'astro';
import { config } from './content';
import ui from '../content/legal/ui.json';

/** Las tres páginas legales. El orden es el del pie de página. */
export const LEGAL_SLUGS = ['aviso-legal', 'privacidad', 'cookies'] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export type LegalFrontmatter = {
  /** Título de la página: H1 y `<title>`. */
  title: string;
  /** Una línea, para el `<meta description>` y el subtítulo. */
  description: string;
  /** Idioma de ESTE fichero. El fallback compara contra el castellano. */
  lang: string;
  /** ISO YYYY-MM-DD de la última revisión del texto. */
  actualizado: string;
  /**
   * Solo `cookies`: la frase sobre almacenamiento local, en sus dos variantes.
   * Los conmutadores de estilo y de nivel son atrezzo de la demo comercial
   * (ADR 0009 y 0013); un camping real no los tiene y su página no debe
   * describir un almacenamiento que no existe.
   */
  almacenamiento?: { con: string; sin: string };
};

export type LegalDoc = MarkdownInstance<LegalFrontmatter> & { slug: LegalSlug };

/** Idioma en el que se redacta la prosa legal, y versión válida a efectos legales. */
const PROSA_LOCALE = 'es';

const modules = import.meta.glob<MarkdownInstance<LegalFrontmatter>>('../content/legal/*.md', {
  eager: true,
});

const allDocs: LegalDoc[] = Object.entries(modules).map(([path, mod]) => ({
  ...mod,
  slug: path
    .split('/')
    .pop()!
    .replace(/\.[a-z]{2}\.md$/, '') as LegalSlug,
}));

/** Una página legal en el idioma pedido, con fallback al castellano. */
export function getLegal(slug: LegalSlug, locale: string): LegalDoc {
  const versions = allDocs.filter((d) => d.slug === slug);
  const doc =
    versions.find((d) => d.frontmatter.lang === locale) ??
    versions.find((d) => d.frontmatter.lang === PROSA_LOCALE);
  if (!doc) throw new Error(`Página legal no encontrada: ${slug}`);
  return doc;
}

/** ¿Esta página se sirve en un idioma distinto al pedido? Se avisa en pantalla. */
export function esFallback(doc: LegalDoc, locale: string): boolean {
  return doc.frontmatter.lang !== locale;
}

type LegalUi = { nav: string; fallback: string; actualizado: string };

/** Cromo de la página (nav, aviso de idioma, etiqueta de fecha) en los seis idiomas. */
export function getLegalUi(locale: string): LegalUi {
  const textos: Record<string, LegalUi> = ui;
  return textos[locale] ?? textos[config.defaultLocale] ?? textos[PROSA_LOCALE]!;
}

/** Los valores del tenant viajan a HTML por `set:html`: hay que escaparlos. */
const escapar = (valor: string) =>
  valor.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Valores que la prosa legal interpola. Un placeholder sin valor se queda visible
 * (`{loQueSea}`) en vez de desaparecer: un hueco que se ve se arregla.
 */
export function legalVars(doc: LegalDoc): Record<string, string> {
  const { legal } = config;
  const tieneAlmacenamientoLocal =
    (config.demoThemes?.length ?? 0) > 0 || config.demoTierSwitch === true;
  const almacenamiento = doc.frontmatter.almacenamiento;

  return Object.fromEntries(
    Object.entries({
      nombre: config.name,
      dominio: config.domain.replace(/^https?:\/\//, ''),
      email: config.contact.email,
      telefono: config.contact.phone,
      direccion: config.contact.address,
      razonSocial: legal.razonSocial,
      nif: legal.nif,
      domicilio: legal.domicilio,
      // frase completa o nada: un titular sin datos registrales no deja hueco
      registro: legal.registro ?? '',
      emailDerechos: legal.emailDerechos,
      almacenamiento: almacenamiento
        ? tieneAlmacenamientoLocal
          ? almacenamiento.con
          : almacenamiento.sin
        : '',
    }).map(([clave, valor]) => [clave, escapar(valor)]),
  );
}
