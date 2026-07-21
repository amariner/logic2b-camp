# 0025 — Documentación de producto (Frente C, fase C6 — absorbe B4)

- **Fecha**: 2026-07-21
- **Fase**: Frente C — C6 (documentación). Absorbe **B4** del Frente B.
- **Estado**: **aceptado e implementado**. Mandato autónomo permanente del Frente C (Andreu, al cerrar C7/C4/C1/C5: _"aplica tu criterio y no pares hasta cerrarlo"_).
- **Resuelve la decisión pendiente B-ii** del ROADMAP (audiencia, herramienta e idiomas de la documentación).

## Contexto

C6 es la **última fase del Frente C**. Con C0–C5 y C7 cerrados, el producto tiene por fin un flujo completo que documentar: llegada → check-in → cobro → mover en el planning → check-out, más el plano, el ⌘K y las rutas direccionables (C4/ADR 0022, C1/ADR 0023, C7/ADR 0021).

Lo que hay hoy y lo que falta:

- **`docs/FUNCIONALIDADES.md`** (326 líneas) ya describe cada funcionalidad del producto y está al día. Pero es un documento **comercial**, escrito para que un director de camping entienda _qué hace_ el producto — no para que una recepcionista _lo use un martes por la mañana_. Y vive en el repo, no en la web: un cliente no lo ve nunca.
- **`docs/TIERS.md`** tiene la matriz de los 4 niveles, pero en formato de contrato interno (config `ts` incluida), no de escalera comercial explicada.
- **No hay ficha técnica** dirigida al "informático de confianza" del camping: hoy esa información está repartida entre `FUNCIONALIDADES.md` §11, `CLAUDE.md` y los ADR.
- El dashboard **no tiene ninguna ayuda contextual**: una recepcionista atascada no tiene a dónde ir salvo llamar por teléfono.

`FRENTE-C-ACABADO.md` §C6 pide tres piezas (guía de recepcionista, guía de dueño, ficha técnica), con **marca Logic2B** (no la mediterránea del tenant — `BRAND.md` §0), enlazadas desde la landing y desde el dashboard.

**La decisión de fondo es B-ii**, que lleva abierta desde el 2026-07-19: _¿páginas Astro propias, Starlight, o reutilizar el layout de `ui.logic2b.com`?_

## La pregunta que decide, y la observación que la resuelve

El criterio del proyecto es siempre el mismo: **¿qué NO multiplica el trabajo cuando se dé de alta un camping nuevo?**

Aplicado aquí, la respuesta empieza por una observación que reordena la decisión entera:

> **La documentación es del PRODUCTO, no del tenant.** Se escribe **una vez** y sirve a **todos** los campings. Un camping nuevo no genera ni una página de documentación nueva.

Eso tiene dos consecuencias que mandan sobre todo lo demás:

1. **El coste por camping ya es cero en las tres opciones.** B-ii no se decide por el eje habitual del proyecto, porque ninguna alternativa multiplica nada. Se decide por el **coste fijo de construcción y mantenimiento** con 6h/semana.
2. **Las docs viven en UN solo sitio y todos los dashboards apuntan ahí con URL absoluta.** El dashboard de `campingdelnorte.com/admin/` enlaza a `https://camp.logic2b.com/docs/…`. Si en vez de eso cada tenant sirviera su copia de las docs, dar de alta un camping pasaría a incluir "desplegar y mantener su documentación" — **eso** sí multiplicaría. Queda descartado explícitamente.

## Decisión

### 1. Herramienta: páginas Astro dentro de `apps/site` (B-ii resuelta)

Las docs son **rutas `/docs/…` de la app que ya existe** (`apps/site`, la landing de producto que ocupa la raíz de `camp.logic2b.com`). Ni Starlight, ni un paquete nuevo, ni `ui.logic2b.com`.

Lo que esto aprovecha sin escribir una línea:

| Ya resuelto en `apps/site`                                                                            | Qué habría que rehacer en Starlight                      |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Tokens oklch de `BRAND.md` §4 vía `@logic-camp/ui/theme.css`                                          | Re-tematizar el DS de Starlight a los tokens Logic2B     |
| Inter Variable + Space Grotesk self-hosted, subsetadas, sin CDN                                       | Volver a cablear las fuentes contra el tema de Starlight |
| Isotipo, header, footer, selector de idioma                                                           | Reimplementar o sobrescribir los componentes del tema    |
| i18n es/en/ca (`lib/i18n.ts`, `content/{lang}.json`)                                                  | El i18n propio de Starlight, en paralelo al que ya hay   |
| SEO: canonical, hreflang, OG, sitemap                                                                 | El de Starlight, con su propia configuración             |
| **Despliegue: `apps/site/dist` ES el bundle compuesto del Worker** (`tenants/demo/wrangler.jsonc:18`) | Un segundo build que habría que componer en el bundle    |

Ese último punto es el decisivo y es puramente mecánico: el Worker del tenant sirve **un solo directorio de assets**, `apps/site/dist`, en el que `deploy:demo` compone la landing en la raíz, la web-demo en `/demo/` y el dashboard en `/admin/`. Una página Astro nueva en `apps/site/src/pages/docs/` **aparece desplegada sin tocar el pipeline**. Starlight obligaría a un tercer build y a un paso de composición nuevo — coste fijo permanente a cambio de features (buscador, versionado, sidebar autogenerada) que un producto con **tres guías** no necesita.

`ui.logic2b.com` queda descartado por un motivo distinto y más simple: es **externo a este repo** y su relación con `packages/ui` es la **decisión B-iii, todavía abierta**. Acoplar C6 a una decisión sin tomar sería bloquear la última fase del frente por algo que no tiene nada que ver con documentar.

> Nota: el propio `apps/site/astro.config.mjs` ya lo anticipaba en un comentario — _"Sitio de PRODUCTO Logic2B (landing ahora, docs en B4)"_. Esta decisión confirma esa intención, no la improvisa.

### 2. La prosa va en Markdown, no en los JSON de i18n

`CLAUDE.md` dice **"textos de UI siempre vía i18n, nunca hardcodeados"**. Se respeta, distinguiendo lo que ya distingue el resto del proyecto:

- **Cromo** (nav, títulos de sección, etiquetas del índice, "siguiente/anterior", el aviso de idioma) → **i18n**, en `content/{lang}.json` de `apps/site`, como el resto de la landing.
- **Prosa de las guías** → **Markdown**, un fichero por página. Es **contenido**, la misma categoría que `tenants/{slug}/content/blog/*.md` — meter tres guías de párrafos y tablas dentro de un JSON de claves sería ilegible y no lo pide ninguna regla del proyecto.

Y se usa **el idiom que este repo ya tiene** para Markdown multi-idioma (`apps/web/src/lib/content.ts:154-195`): `import.meta.glob` sobre `{slug}.{lang}.md` + una función de lectura con **fallback al idioma por defecto**. No se introducen content collections de Astro: el repo ya resolvió este problema una vez y una segunda forma de hacerlo sería deuda gratis.

### 3. Idiomas: cromo en es/en/ca, prosa en **es** al arrancar — y dicho en voz alta

El cromo se localiza en los tres idiomas que la landing ya tiene. **La prosa de las guías se escribe en español**, con fallback honesto: un visitante en `/en/docs/…` ve el cromo en inglés y un aviso visible de que esa guía todavía está en español.

El motivo es la restricción que gobierna el proyecto: escribir las tres guías en tres idiomas **triplica la prosa y triplica el mantenimiento de por vida** (cada cambio de UI toca 3 ficheros), para un producto con **cero clientes en producción** y cuyo mercado inmediato son campings españoles. La estructura queda montada por idioma desde el primer día (`{slug}.{lang}.md`): añadir el inglés cuando haya un cliente que lo pida es soltar ficheros, no rehacer nada.

Lo que **no** se hace es fingir que están traducidas. El aviso de idioma es una decisión de honestidad, del mismo tipo que "cerrado — abrimos el 15 de marzo" en vez de "sin disponibilidad".

### 4. Tres audiencias, tres guías, una sola casa

`/docs/` es un índice que reparte a tres sitios, porque las tres audiencias no se solapan:

| Guía          | URL                | Para quién                    | Tono                                                          |
| ------------- | ------------------ | ----------------------------- | ------------------------------------------------------------- |
| **Recepción** | `/docs/recepcion/` | La recepcionista de 55 años   | Llano, imperativo, **una tarea por página**, captura grande   |
| **Dueño**     | `/docs/dueno/`     | Quien paga                    | Los 4 niveles como escalera: qué incluye, qué cambia al subir |
| **Técnica**   | `/docs/tecnica/`   | "El informático de confianza" | Dominios, DNS, correo, aislamiento por D1, RGPD, backups      |

La guía de recepción se parte en **una página por tarea** (contrato explícito de `FRENTE-C-ACABADO.md` §C6), siguiendo el orden real de un día de mostrador, no el orden del menú del dashboard.

### 5. Ayuda contextual: el `?` de cada pantalla lleva a SU página

Cada pantalla del dashboard declara **a qué página de la guía corresponde**, y el `?` de su cabecera abre esa página en una pestaña nueva. Con **URL absoluta a `camp.logic2b.com/docs/…`**, por lo dicho en §"la observación que resuelve": un solo sitio de docs para todos los tenants.

El mapa pantalla→página vive en **un único módulo** del dashboard, no repartido por las pantallas: así se ve de un vistazo qué pantalla se quedó sin documentar, y añadir una guía nueva es una línea.

## Qué NO se hace, y por qué

- **Starlight, buscador y versionado de docs.** Tres guías no necesitan búsqueda full-text ni versiones. Si algún día las docs crecen a 50 páginas, migrar Markdown a Starlight es mecánico — el contenido no se pierde. Decidirlo ahora sería pagar por adelantado.
- **Traducir la prosa a en/ca.** §3. Estructura lista, prosa cuando haya cliente.
- **Docs por tenant** (`sucamping.com/docs/`). Multiplicaría el alta por camping — justo lo prohibido. URL absoluta a la casa común.
- **Vídeo o GIF de los gestos del planning.** El gesto de arrastrar se explica mucho mejor en movimiento que en foto, y está registrado en BACKLOG. Pero grabarlo exige el patrón de captura con Playwright + stub de C1/C5 y un pipeline de vídeo que hoy no existe. Fuera de alcance, anotado.
- **Reescribir `FUNCIONALIDADES.md`.** Sigue siendo el documento comercial de referencia y la fuente de la que sale la guía del dueño. Se mantiene; no se duplica.

## Consecuencias

- `apps/site` deja de ser "la landing" y pasa a ser **el sitio de producto Logic2B**: landing + docs. Es el sitio que le corresponde por marca (`BRAND.md` §0).
- El dashboard gana una dependencia **de enlace** (no de código) hacia `camp.logic2b.com/docs/`. Si un día las docs se mueven, es una constante.
- **Coste de mantenimiento honesto**: cambiar un gesto del planning obliga a repasar su página de la guía. Es el precio de tener documentación de verdad, y por eso la prosa está en **un** idioma.
- Cierra **B-ii** y con ella **B4**, y con C6 cerrado, **el Frente C entero** (salvo el bloqueo de red de C5, que no es de código).
