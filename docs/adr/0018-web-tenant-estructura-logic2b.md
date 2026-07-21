# 0018 — Web pública de tenant sobre la estructura del DS Logic2B (Frente B, fase B2)

- **Fecha**: 2026-07-20
- **Fase**: Frente B — B2 (web pública: estructura Logic2B + marca discreta del tenant)
- **Estado**: aceptado (por criterio, 2026-07-20 — Andreu: "aplica tu criterio y continúa"). Decisiones cerradas de los 4 puntos abiertos: (1) base de radios **4px**; (2) titular **sigue con Clash Display**; (3) firma "powered by Logic2B" → raíz `camp.logic2b.com/`; (4) alcance = **alineamiento estructural sin reskin**.

## Contexto

El Frente B tiene tres piezas en vivo (B0-lite, B3 landing, B1 dashboard, ADR 0016/0017) y dos pendientes: **B2** (esta) y **B4** (docs). Tras B1, el dashboard ya se lee como "producto Logic2B" (Inter + Space Grotesk, tokens oklch, radius 10px, isotipo). La **web pública del camping** (`apps/web`) sigue con su identidad mediterránea del **ADR 0006** — y así debe seguir: es la marca **del tenant**, no de Logic2B (BRAND.md §0). El objetivo de B2 no es reskinnear la web, es **alinear su esqueleto** con el del producto para que ambas superficies compartan estructura sin compartir piel.

Lo que el ROADMAP pide para B2 (criterio de "hecho"): _"`apps/web` adopta la ESTRUCTURA del DS (fuente base, ritmo de bloques, patrón de header, escala de radios) manteniendo la identidad mediterránea del tenant. Isotipo discreto 'powered by Logic2B' en el pie, en 6 idiomas. La web sigue siendo del camping pero comparte esqueleto con el producto; Lighthouse ≥95 se mantiene."_

Tensión de diseño que hay que resolver **explícitamente**, porque BRAND.md la deja abierta (§3, nota de convergencia): la web usa **Clash Display + Inter**; el producto usa **Space Grotesk + Inter**. El ADR 0006 hizo de Clash Display la voz "editorial de premio" del héroe. ¿"Adoptar la fuente base del DS" obliga a tirar Clash Display?

Restricciones que gobiernan (§0): ~6h/semana; **nada que escale trabajo por cliente**. Consecuencia dura para B2: cualquier cosa que se toque en `apps/web` la heredan **todos** los tenants, presentes y futuros. Por tanto B2 solo puede tocar el **core compartido** (`apps/web`), nunca meter decisiones de un camping concreto ahí, y no puede introducir un token nuevo que cada tenant tenga que rellenar a mano. La identidad sigue viviendo **solo** en `tenants/{slug}/theme.css` (5 hex + fuentes + radios) — B2 no añade superficie de configuración por tenant.

Además: la regla dura del nivel 1 (no arrastrar el motor en el bundle) y el suelo de accesibilidad (foco AA, `prefers-reduced-motion`, 1366px, teclado) no se tocan; B2 se verifica contra ellos, no los relaja.

## Decisión

B2 es un **alineamiento estructural del esqueleto de `apps/web`, sin reskin de identidad**. La piel (color, fotos, voz de titular) es del tenant y no cambia. Se alinean cuatro ejes que el ROADMAP nombra —**fuente base, escala de radios, patrón de header, ritmo de bloques**— más la **firma discreta "powered by Logic2B"** en el pie. Ni un hex del DS entra en la web; ni un token del tenant entra en el DS. Los dos sistemas de tokens (`--lc-*` del tenant, `--*`/oklch del DS) **no se mezclan**: B2 no importa `@logic-camp/ui/theme.css` en `apps/web`.

### 1. Tipografía: se **mantiene Clash Display** en titulares; se alinea el _ritmo_, no la familia

Cerramos la nota de convergencia de BRAND.md §3 en el sentido que ya recomienda: **web de tenant → sigue con Clash Display; producto → Space Grotesk**. Motivo: Clash Display ES la decisión editorial del ADR 0006 (la voz "premio" del héroe mediterráneo); cambiarla a Space Grotesk neutralizaría la web hacia el look de producto, que es justo lo que §0 prohíbe. Inter ya es común a ambas superficies (cuerpo/UI) — ahí ya convergen.

Lo que sí se alinea es el **ritmo tipográfico** del DS observado en BRAND.md §6: `font-bold tracking-tighter leading-[1.08]` en titulares y `tabular-nums` en cifras. La web ya usa tracking apretado y `tnum`; B2 unifica los valores de `line-height`/`tracking` de titular con la escala del DS (`leading-[1.08]`) **aplicados a Clash Display**, sin tocar la familia. Resultado: mismo _compás_, distinta _voz_.

- **Sin cambio de fuentes servidas** → cero impacto en peso de bundle ni en Lighthouse (no se añade Space Grotesk a `apps/web`).
- BRAND.md §3 se actualiza para marcar esta convergencia como **cerrada** (hoy es "recomendación, cerrar en el ADR de la fase de marca" — esta es esa fase para la web).

### 2. Escala de radios: de `2px/4px` duros a la **escala del DS derivada del tenant**

Hoy `tenants/{slug}/theme.css` fija `--lc-radius: 2px` / `--lc-radius-lg: 4px` (ADR 0006, "interfaz que calla"). El DS usa 10px con una escala derivada (`sm = base−4`, `md = base−2`, `lg = base`, `xl = base+4`). B2 **adopta la forma de la escala** (una base + derivados calculados), **no el valor 10px** — la web mediterránea no debe volverse blanda como un SaaS.

Diseño concreto:

- `tenants/_template/theme.css` y `tenants/demo/theme.css` pasan a declarar **una sola** `--lc-radius` base (propuesta: **4px** — un punto más generoso que el 2px actual, aún firme y lejos del 10px del producto) y derivar el resto por `calc()`, igual que el DS:
  ```css
  --lc-radius: 4px; /* base — la firmeza mediterránea, no el 10px del producto */
  --lc-radius-sm: max(0px, calc(var(--lc-radius) - 2px));
  --lc-radius-md: var(--lc-radius);
  --lc-radius-lg: calc(var(--lc-radius) + 4px);
  ```
- `apps/web/src/styles/global.css` expone la escala completa a Tailwind (`--radius-lc`, `--radius-lc-sm/md/lg`) para que los componentes dejen de mezclar `rounded-(--lc-radius)` con valores sueltos.
- **Un solo número por tenant** (`--lc-radius`): sube de nivel un camping cambiando un valor, no cuatro. No añade trabajo por cliente (§0): el `_template` ya trae la escala derivada.

### 3. Patrón de header: se alinea la **anatomía**, no el color

El header del DS (BRAND.md §6) es: barra superior con **isotipo + navegación de secciones + acción**. El de `apps/web` ya es una barra fija con marca-texto + nav + selectores. B2 alinea la **anatomía** (alturas, agrupación, comportamiento sticky, densidad) con la del DS, manteniendo superficie hueso y acento pino:

- Altura y ritmo del header alineados con el chrome del producto (la variable `--lc-chrome-h` ya existe para el sticky del mostrador y el banner de demo — se respeta intacta).
- La marca-texto del tenant (`config.name`) sigue siendo **texto** (es la marca del camping, no lleva el isotipo Logic2B arriba — el isotipo Logic2B va discreto en el pie, punto 4).
- **Sin cambios de comportamiento**: selector de idioma nativo (`<details>`, sin JS), selector de temas (ADR 0009) y conmutador de nivel (ADR 0013) se conservan tal cual. B2 es estructura, no nuevas features.

### 4. Firma "powered by Logic2B" en el pie — **isotipo del DS, discreto, 6 idiomas**

Único punto donde la marca Logic2B toca la web de tenant (BRAND.md §0). Diseño:

- El isotipo `docs/brand/logo-mark.svg` ya está en `packages/ui/src/brand/logo-mark.svg` y el DS lo expone. Para `apps/web` (Astro, sin React en el chrome) se añade un `LogoMark.astro` mínimo en `apps/web` que inyecta el mismo `<path>` con `fill="currentColor"` (no se importa el componente React del DS en el chrome estático — se comparte el **SVG**, no el runtime). El fichero SVG es la fuente única; si diverge, se copia, no se reescribe.
- Línea de pie discreta, alineada a la derecha del bloque de contacto existente: isotipo pequeño (~16px, `text-tinta-suave`, hereda color) + texto **"powered by Logic2B"** enlazando a la landing de producto (`https://camp.logic2b.com/` — la raíz, B3).
- **i18n en los 6 idiomas** (es, ca, en, fr, de, nl): clave nueva `footer.poweredBy` en los `content/*.json` de `tenants/_template` **y** `tenants/demo`. "powered by" es marca, no se traduce; lo que se localiza es el `aria-label`/título del enlace ("Software de gestión de camping por Logic2B" y equivalentes). Nunca hardcodeado en el componente (regla dura de i18n).
- Discreto de verdad: nada de banda propia ni color de marca Logic2B; hereda `--lc-tinta-suave` del tenant. En la web del camping manda el camping.

### 5. Ritmo de bloques: tokens de espaciado de sección compartidos en `apps/web`

El DS tiene un "ritmo de bloques" (gap consistente, columnas modulares, BRAND.md §6). La web ya tiene su ritmo (secciones con `PageIntro`, separadores de "sombra de pino"). B2 **no rediseña** las páginas; solo unifica los valores de espaciado vertical de sección que hoy están sueltos por los `.astro` en un par de utilidades/tokens en `global.css` (p. ej. `--lc-section-y`), para que el compás sea consistente entre páginas y **medible** de cara a B4 y a futuros tenants. Cambio interno de consistencia, sin efecto visual de identidad.

### Qué NO hace B2 (límites explícitos)

- No importa el tema del DS en la web ni mezcla tokens `--lc-*` con `--*` oklch.
- No cambia la paleta, las fotos, los temas de demo (ADR 0009) ni la voz de titular.
- No cambia Clash Display por Space Grotesk.
- No añade superficie de configuración por tenant (sigue: 5 hex + fuentes + **una** `--lc-radius`).
- No toca el funnel de reserva, el motor, el conmutador de nivel ni el banner de demo (solo los respeta al alinear el header).
- No arrastra runtime del DS a la web (comparte SVG del isotipo, no el componente React).

### Ficheros que se tocan (previsión)

```
docs/BRAND.md                       # §3: convergencia de fuentes → CERRADA (web=Clash, producto=Space Grotesk); §5: escala de radios del tenant
docs/adr/0006-diseno-web-publica.md # nota de "superseded-in-part" apuntando a 0018 para radios y firma de pie (no se reescribe 0006)
tenants/_template/theme.css         # --lc-radius base + derivados por calc()
tenants/demo/theme.css              # idem (y los temas de demo heredan la escala)
tenants/_template/content/*.json    # +footer.poweredBy (aria/title localizado) ×6 idiomas
tenants/demo/content/*.json         # idem ×6 idiomas
apps/web/src/styles/global.css      # escala de radios completa + tokens de ritmo de sección + leading/tracking de titular
apps/web/src/layouts/Base.astro     # header: anatomía alineada; footer: firma "powered by Logic2B"
apps/web/src/components/LogoMark.astro  # nuevo: isotipo compartido (SVG), currentColor, aria
apps/web/src/components/*.astro     # ajustes de rounded-* y espaciado a los tokens nuevos (mecánico)
docs/FUNCIONALIDADES.md             # nota de la firma en pie (visible al cliente)
docs/ROADMAP.md                     # B2 → hecho; checklist al día
```

### Verificación (cómo se cierra la fase)

- `pnpm check` verde (typecheck + lint + tests + build). Sin tests de lógica nuevos (B2 es estructura visual; no hay función de motor nueva) — la regla "tests antes que implementación" aplica a lógica de dominio, no a CSS de layout.
- **Playwright contra el Worker real** (la demo bajo `/demo/`, no solo `apps/web` aislado): capturas a 1366px y 375px de home nivel 3, home nivel 1, una página interior y el pie con la firma; foco de teclado visible en el header; `prefers-reduced-motion` respetado.
- **Lighthouse ≥95** en la demo desplegada (criterio de "hecho" del ROADMAP) — se comprueba que no baja respecto a hoy (no se añaden fuentes ni JS).
- Regla dura del nivel 1 intacta: un build `TIER=1` sigue sin islas ni motor; la firma de pie es HTML estático, no añade runtime.

## Alternativas descartadas

- **Reskinnear la web al DS Logic2B (Space Grotesk, oklch, radius 10px).** Violaría §0 y el ADR 0006: la web es la marca del camping, no de Logic2B. B2 pide "estructura", no "piel".
- **Cambiar Clash Display por Space Grotesk "para converger".** Neutraliza la voz editorial del héroe; convergencia mal entendida (converge el ritmo, no la familia).
- **Importar `@logic-camp/ui/theme.css` en `apps/web` y mapear `--lc-*` sobre los oklch.** Acopla los dos sistemas de tokens; un cambio del DS (producto) rompería webs de tenant. Se mantienen separados a propósito.
- **Compartir el componente React `LogoMark` del DS en el chrome de la web.** Mete runtime React en un header que hoy es 100% estático (coste de bundle, riesgo para el nivel 1). Se comparte el **SVG**, no el componente.
- **Radius 10px del DS en la web.** Ablanda la identidad mediterránea ("interfaz firme, materia no vector"). Se adopta la _forma_ de la escala con base **4px**, no el valor del producto.
- **Un token de radius por variante en cada tenant (`sm/md/lg` a mano).** Escala trabajo por cliente (§0). Una sola base + `calc()`.
- **Meter la firma "powered by Logic2B" como banda visible con color de marca.** Deja de ser discreta; en la web manda el camping. Hereda el color apagado del tenant.

## Consecuencias

**Se gana:**

- Las dos superficies (producto y web de tenant) comparten **esqueleto** (ritmo, escala de radios, anatomía de header) sin compartir identidad — coherencia de sistema sin borrar la marca del camping.
- Base preparada para B4 (docs): el ritmo de bloques queda tokenizado y medible.
- La firma "powered by Logic2B" convierte cada web de cliente en un canal de venta discreto hacia la landing (B3) — a coste cero por tenant (va en `_template`).
- La convergencia de fuentes de BRAND.md §3 queda **cerrada** por escrito, no como recomendación abierta.

**Se compromete / hay que vigilar:**

- **Todos los tenants heredan** el cambio de escala de radios (2px→4px base). Es un cambio visual real en la demo; hay que verificarlo con capturas antes/después y confirmarlo con Andreu (¿4px o mantener 2px y solo derivar la escala?). Punto abierto para validación.
- El SVG del isotipo se **duplica** (DS lo tiene en `packages/ui`, la web tendrá su `LogoMark.astro`). Riesgo bajo (un `<path>` estático) pero anotado: si el isotipo cambia, se copia a los dos sitios. Alternativa futura: exponerlo como asset del DS importable en Astro (BACKLOG).
- ADR 0006 queda **parcialmente reemplazado** en dos puntos (radios y firma de pie); se anota como "superseded-in-part por 0018", no se reescribe 0006 (es historia).
- Lighthouse: el objetivo es "no baja". Si el ajuste de header o la firma introdujeran CLS, se corrige antes de cerrar; no se cierra la fase con regresión de métricas.

## Puntos abiertos para la validación de Andreu

1. **Valor de la base de radios**: propuesta **4px** (más generoso que 2px, firme, lejos del 10px del producto). ¿OK, o mantener 2px y solo adoptar la _forma_ de la escala derivada?
2. **Fuente de titular**: confirmar que la web **sigue con Clash Display** (no Space Grotesk) — cierra BRAND.md §3.
3. **Texto de la firma**: "powered by Logic2B" enlazando a la raíz `camp.logic2b.com/`. ¿Ese literal y ese destino?
4. **Alcance**: ¿te vale B2 como _alineamiento estructural sin reskin_ (esta propuesta), o esperabas algo más visible en la web del camping?
