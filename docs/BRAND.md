# BRAND — Marca Logic2B y su relación con Logic Camp

> Fuente de verdad de la identidad **Logic2B** aplicada a Logic Camp. Extraído del sistema real en `https://ui.logic2b.com/` (CSS de producción, 2026-07-19). Este documento es el contrato visual: cuando una fase implemente marca (dashboard, landing de producto, docs), copia de aquí, no reinventa.

## 0. Las dos marcas — no confundirlas

Logic Camp tiene **dos superficies visuales distintas**, cada una con su dueño de marca:

| Superficie                                                               | Marca                                                                       | Dónde                                        |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------- | -------------------------------------------- |
| **Producto Logic2B** — dashboard/gestor, landing de venta, documentación | **Logic2B** (esta guía): neutra, Inter, isotipo, shadcn                     | `/admin`, landing de producto, docs          |
| **Web pública de cada camping** (tenant)                                 | **Del camping** — su color, sus fotos, su identidad mediterránea (ADR 0006) | `camp.logic2b.com` y cada dominio de cliente |

Regla: **el gestor y todo lo "de Logic2B" llevan marca Logic2B; la web de cara al huésped lleva la marca del camping.** El isotipo Logic2B aparece en el producto y, de forma discreta ("powered by Logic2B"), en el pie de las webs de tenant. Esto respeta el principio de §0 (cada cliente es su marca) sin perder que el producto es reconociblemente Logic2B.

> **Excepción (ADR 0027, 2026-07-22):** la **landing de venta** puede llevar **fotografía atmosférica de camping** en el héroe (contrato de arte del ADR 0024, con scrim que garantiza AA). El resto de superficies Logic2B — `og.png`, cards, guías, dashboard — siguen neutras, y la tipografía/paleta no cambian: la foto es atmósfera, no un rebrand.

## 1. Origen técnico

`ui.logic2b.com` es la instancia Logic2B de **shadcn/ui** (base de color **"neutral"**, estilo New York), construida con Astro + Tailwind v4 (tokens como CSS vars en oklch). Coincide con lo que CLAUDE.md ya declara: _"Tailwind v4 + shadcn/ui copiado en `packages/ui` (es nuestro DS)"_. Alinear la marca = **poblar `packages/ui` con estos tokens y componentes**, hoy vacío.

Navegación del DS de referencia: `Home · Docs · Components · Blocks · Charts · Create · Typeset`.
Tagline: _"The Foundation for your Design System — for humans and coding agents alike. Open Source. Open Code."_

## 2. Logo — wordmark «Logic2B Campings», sin isotipo

**Decisión de Andreu, sesión 59 (2026-07-29)**: el logo del producto es **solo
texto**. El isotipo se retira del lockup; la referencia es el wordmark de
`logic2b-norte`, que ya había hecho el mismo movimiento.

- Componentes: `Wordmark` (`packages/ui/src/components/wordmark.tsx`) y su gemelo
  `Wordmark.astro` (`apps/site`). **Comparten clases**; la tipografía y el color
  viven en `packages/ui/theme.css` (`--font-wordmark`, `--logo-2b`), así que
  cabecera, pie y login no pueden divergir.
- Lockup: **Poppins**. «Logic» en **600** a plena tinta · «2B» en **800** sobre
  `--logo-2b` (un punto por debajo de `--foreground`) · «Campings» en 600 sobre
  `--muted-foreground`. `letter-spacing: .015em` → lockup geométrico.
- El salto 600→800 **es** la marca: hacen falta las dos caras reales. Con
  negrita sintética el «2B» sale sucio en hidpi.
- De norte se replica la **relación** de color, no sus hex: allí `--text` arranca
  más oscuro que el `--foreground` de este DS.
- Tres variantes, porque el hueco del isotipo hay que ocuparlo: `full`
  (Logic2B Campings) · `brand` (Logic2B) · `compact` (**2B**, para la sidebar
  plegada de 56px, con `aria-label` completo).
- **En la landing el lockup son DOS enlaces** (decisión de Andreu, sesión 59):
  «**Logic2B**» → `https://logic2b.com` (la matriz) · «**Campings**» → el inicio
  de la landing, consciente del idioma (`localePath(locale)`). Consecuencias que
  no se pueden olvidar: el envoltorio **no puede ser un `<a>`** (HTML no permite
  anidar enlaces — la cabecera lo era, y dejó de serlo), cada mitad necesita su
  `aria-label` porque «Campings» a secas no dice adónde va, y **el espacio que
  las separa va fuera de los dos** o el área activa se come un espacio ajeno
  (Astro deja los saltos de línea del JSX dentro del `<a>` y colapsan a espacio).
  En el dashboard el wordmark **no enlaza**: sacar a la recepcionista de la
  aplicación desde el logo no es lo que quiere una herramienta de mostrador.
- Fuentes: dashboard vía `@fontsource/poppins/latin-600|latin-800` (**nunca**
  `600.css`/`800.css`: arrastran todos los subsets, 180 kB de Devanagari para dos
  palabras). Landing self-hosted en `/fonts/`, con el 800 subsetado a sus dos
  glifos (824 B) — si cambia el texto del logo hay que regenerarlo:
  `fonts.googleapis.com/css2?family=Poppins:wght@800&text=2B`.

### El isotipo, que sigue existiendo para dos usos

- Fichero: [`docs/brand/logo-mark.svg`](brand/logo-mark.svg) — capturado de `ui.logic2b.com/logo-mark.svg`.
- Forma: un **trazo/pincelada fluida** continua, monocroma. `viewBox="0 0 523.83 536.87"`, un solo `<path>`.
- Uso: `fill="currentColor"` — hereda el color del contexto (tinta sobre claro, hueso sobre oscuro). Nunca recolorear con un tercer color.
- **Sigue siendo el favicon** (`<link rel="icon" href="/logo-mark.svg">`): un wordmark no funciona a 32px.
- **Sigue firmando el pie de la web del tenant** («powered by Logic2B»): ahí no es el logo del producto, es un crédito.
- `apps/site/src/components/LogoMark.astro` queda **sin uso** pero conservado y anotado — como norte conserva `.logo-mark` por si se recupera la decisión.

## 3. Tipografía

| Rol               | Familia                    | Notas                                                                 |
| ----------------- | -------------------------- | --------------------------------------------------------------------- |
| Sans / cuerpo     | **Inter Variable**         | `--font-sans: "Inter Variable", ui-sans-serif, system-ui, sans-serif` |
| Titulares (h1–h4) | **Inter Variable**         | `--font-heading` = misma que sans; los `h1..h4` la aplican por CSS    |
| Display / alt     | **Space Grotesk Variable** | cargada como webfont; disponible para acentos de titular / marca      |
| Mono              | ui-monospace               | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`    |

- **Webfonts subsetadas** (self-hosted, no Google Fonts CDN): `inter-*-wght-normal.woff2` y `space-grotesk-*-wght-normal.woff2` (latin, latin-ext, y demás rangos). Servir desde el propio origen, igual que la web pública ya subsetea sus fuentes.
- Estilo de titular observado: `font-bold tracking-tighter leading-[1.08]` (negrita, interletrado apretado, línea compacta). Números: `tabular-nums`.

> Convergencia de fuentes — **CERRADA en ADR 0018** (fase B2): **producto → Space Grotesk; web de tenant → sigue con Clash Display**. Inter es común a ambas superficies (cuerpo/UI). B2 alinea el _ritmo_ tipográfico (tracking apretado, `tabular-nums`) entre web y producto, pero **no** la familia display: cambiar Clash Display por Space Grotesk neutralizaría la voz editorial del héroe mediterráneo (ADR 0006) — eso sería un reskin, no un alineamiento estructural.

## 4. Tokens de color (shadcn "neutral", oklch)

Escala **monocroma neutra**: fondo blanco, tinta casi negra, grises fríos. El color solo entra en los **charts**. Valores exactos capturados (light / dark):

| Token                    | Light                      | Dark                       |
| ------------------------ | -------------------------- | -------------------------- |
| `--background`           | `oklch(100% 0 0)`          | `oklch(14.5% 0 0)`         |
| `--foreground`           | `oklch(14.5% 0 0)`         | `oklch(98.5% 0 0)`         |
| `--card`                 | `oklch(100% 0 0)`          | `oklch(20.5% 0 0)`         |
| `--card-foreground`      | `oklch(14.5% 0 0)`         | `oklch(98.5% 0 0)`         |
| `--popover`              | `oklch(100% 0 0)`          | `oklch(20.5% 0 0)`         |
| `--primary`              | `oklch(20.5% 0 0)`         | `oklch(92.2% 0 0)`         |
| `--primary-foreground`   | `oklch(98.5% 0 0)`         | `oklch(20.5% 0 0)`         |
| `--secondary`            | `oklch(97% 0 0)`           | `oklch(26.9% 0 0)`         |
| `--secondary-foreground` | `oklch(20.5% 0 0)`         | `oklch(98.5% 0 0)`         |
| `--muted`                | `oklch(97% 0 0)`           | `oklch(26.9% 0 0)`         |
| `--muted-foreground`     | `oklch(55.6% 0 0)`         | `oklch(70.8% 0 0)`         |
| `--accent`               | `oklch(97% 0 0)`           | `oklch(26.9% 0 0)`         |
| `--accent-foreground`    | `oklch(20.5% 0 0)`         | `oklch(98.5% 0 0)`         |
| `--destructive`          | `oklch(57.7% .245 27.325)` | `oklch(70.4% .191 22.216)` |
| `--border`               | `oklch(92.2% 0 0)`         | `oklch(100% 0 0 / .1)`     |
| `--input`                | `oklch(92.2% 0 0)`         | `oklch(100% 0 0 / .15)`    |
| `--ring`                 | `oklch(70.8% 0 0)`         | `oklch(55.6% 0 0)`         |

**Sidebar** (mismos grises, superficie propia): `--sidebar`, `--sidebar-foreground`, `--sidebar-primary(-foreground)`, `--sidebar-accent(-foreground)`, `--sidebar-border`, `--sidebar-ring` — light basa en blanco/tinta, dark en `oklch(20.5%)`.

**Charts** (única entrada de color; paleta shadcn por defecto, light / dark):
`--chart-1` `oklch(48.8% .243 264.376)` / `oklch(64.6% .222 41.116)` ·
`--chart-2` `oklch(60% .118 184.704)` / `oklch(69.6% .17 162.48)` ·
`--chart-3` `oklch(39.8% .07 227.392)` / `oklch(76.9% .188 70.08)` ·
`--chart-4` `oklch(62.7% .265 303.9)` / `oklch(82.8% .189 84.429)` ·
`--chart-5` `oklch(64.5% .246 16.439)` / `oklch(76.9% .188 70.08)`.

> El tenant puede aportar **un color de acento** que tiña `--primary`/`--ring` en su instancia del dashboard, sin romper la neutralidad del resto. A decidir en el ADR.

## 5. Radios y geometría

- `--radius: .625rem` (**10px**) base. Derivados: `--radius-sm = radius - 4px`, `--radius-md = radius - 2px`, `--radius-lg = radius`, `--radius-xl = radius + 4px`, `--radius-2xl = 1rem`.
- **Producto** (dashboard, landing, docs): base 10px.
- **Web de tenant** (ADR 0018, fase B2): adopta la **forma** de la escala (una base + derivados por `calc()`) pero **no el valor** — base **4px** (`--lc-radius`, con `-sm`/`-md`/`-lg` derivados). Sube un punto respecto al 2px de ADR 0006 (más generoso, alineado con el ritmo del DS) sin ablandar la firmeza mediterránea hacia el 10px del producto. Un tenant cambia su radio tocando **un solo** número.

## 6. Componentes y layout (convenciones observadas)

- Componentes **shadcn/ui** con `data-slot="…"` (card, card-header, card-title, card-description, card-content, badge, button, input, label, select-trigger, slider…).
- **Card**: `bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6`; header con `px-6`, contenido `px-6`.
- **Badge**: `inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium`.
- **Input**: `h-9 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs`; foco `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]`.
- **Botones**: variantes `primary` (sólido `--primary`), `outline`, `secondary`, `ghost` (`text-muted-foreground`, hover `bg-accent`).
- **Header/nav**: barra superior con logo-mark + navegación de secciones + buscador (`Search… ⌘K`) + acción primaria ("New Project"). En el dashboard, **sidebar agrupada por bloques** (`Overview / Planning / Account / Support`) con etiquetas `text-[11px] uppercase tracking-wide text-muted-foreground` e ítems `rounded-md px-2 py-1.5 text-sm`, activo con `bg-accent text-accent-foreground`.
- **Ritmo de bloques**: tarjetas modulares en columnas, `gap` consistente, `break-inside-avoid` (layout tipo masonry en la home del DS).
- Titulares hero: `text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter leading-[1.08]`.

## 7. Mapa de aplicación en Logic Camp (qué se toca)

1. **`packages/ui`** (hoy vacío): copiar shadcn/ui (primitivos + tokens de §4/§5 + fuentes de §3). Se vuelve el DS real, consumido por dashboard y por las superficies de producto.
2. **Dashboard** (`apps/dashboard`): sustituir la paleta camping y `.lc-*` a mano por los tokens/componentes Logic2B; sidebar agrupada; isotipo en el header. El **planning** mantiene su color por estado, pero derivado de tokens del DS, no de hex sueltos.
3. **Web pública de tenant** (`apps/web`): adopta la **estructura** (fuente base, ritmo de bloques, patrón de header, escala de radios) manteniendo la identidad del camping; isotipo discreto "powered by Logic2B" en el pie.
4. **Landing de producto** (nueva): 100% marca Logic2B.
5. **Documentación** (nueva): 100% marca Logic2B, a poder ser reutilizando el layout de docs del DS.

Detalle de fases, orden y criterios de "hecho": ver `docs/ROADMAP.md` → sección **"Frente B — Marca, sitio de producto y documentación"**.
