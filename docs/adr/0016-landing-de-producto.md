# 0016 — Landing de producto Logic Camp (Frente B, fase B3 + fundación de marca B0-lite)

- **Fecha**: 2026-07-19
- **Fase**: Frente B — B3 (landing de producto), arrastra B0-lite (fundación del DS Logic2B)
- **Estado**: aceptado (Andreu, 2026-07-19). (a) `apps/site` nueva — la más eficiente; (b) routing `/demo/` aprobado; (c) es/en/ca; (d) leads por email sin tabla v1.

## Contexto

Hasta hoy "la herramienta de ventas" era `camp.logic2b.com`, que en realidad es la **demo de un camping ficticio** (Cala Sereno): enseña *cómo queda la web de un cliente*, no *qué es Logic Camp ni por qué comprarlo*. Falta el equivalente a la landing de `ecom.logic2b.com`: un **sitio de producto** dirigido al **comprador** (director/dueño/CEO de camping) que explique web + gestor, muestre la escalera de niveles (`docs/TIERS.md`), use el planning como pieza estrella, enlace la demo viva y capte contacto.

Decisiones ya tomadas (ROADMAP, 2026-07-19): la landing vive en la **raíz `camp.logic2b.com/`**; la demo baja a **`camp.logic2b.com/demo/`**. La marca del producto es **Logic2B** (`docs/BRAND.md`): shadcn/ui neutro, Inter Variable + Space Grotesk, isotipo, radius 10px, tokens oklch.

Restricciones que gobiernan (§0): ~6h/semana; **nada que escale trabajo por cliente**. La landing es de Logic2B (una sola, no por tenant), así que no viola esa regla — pero sí debe reusar infra existente (Resend, Astro, Workers Assets) y no abrir sistemas nuevos.

Problema central de diseño: **servir tres bundles estáticos desde un único Worker** (landing en `/`, web-demo en `/demo/`, dashboard en `/admin/`) sin romper el funnel de reserva de la demo (deep-links, sitemap, hreflang, cron de reset, banner, conmutador de nivel), y hacerlo con una fundación de marca mínima pero real en `packages/ui` (hoy vacío).

## Decisión

### 1. Arquitectura: app nueva `apps/site` (Astro), no reusar `apps/web`

`apps/web` es **tenant-driven** (contenido desde `tenants/{slug}/`, un build por instancia). La landing **no es un tenant**: es el producto Logic2B. Meterla en `apps/web` contaminaría el modelo de tenant. Se crea **`apps/site`** — la superficie de producto Logic2B: la landing ahora (B3) y la documentación después (B4). Astro (mismo stack, SEO crítico, islas solo donde haga falta).

```
apps/site/
  astro.config.mjs          # base '/', alias @ui → packages/ui
  src/
    pages/[lang]/index.astro # landing por idioma
    layouts/Base.astro       # <head> SEO/OG/hreflang + chrome de marca Logic2B
    components/…              # secciones de venta (islas solo si interactivas)
    content/{es,en,ca}.json   # textos de venta i18n (una fuente, sin hardcode)
    styles/…                  # consume el tema de packages/ui
```

### 2. Fundación de marca **B0-lite** en `packages/ui`

No se hace el B0 completo (todos los primitivos shadcn) antes de la landing: se puebla `packages/ui` con **lo que la landing necesita y el dashboard reusará** (B1), ni más ni menos:

- `packages/ui/src/theme.css` — tokens `:root` + `.dark` de `docs/BRAND.md` §4–§5 (oklch), radius 10px, escala de radios.
- `packages/ui/src/fonts/` — Inter Variable + Space Grotesk **self-hosted subsetados** (woff2), con su `@font-face`. Sin CDN.
- `packages/ui/src/brand/LogoMark.astro` (o `.tsx`) — envuelve `docs/brand/logo-mark.svg`, `currentColor`, con `aria-label`.
- Primitivos mínimos: `Button` (primary/outline/ghost), `Card`, `Badge` — como componentes Astro/React con las clases de `BRAND.md` §6. El resto (Input, Select, Table…) llega en B1 cuando el dashboard los pida.

`packages/ui/src/index.ts` reexporta tema + componentes. Sigue siendo el DS que consumirán `apps/site`, `apps/dashboard` (B1) y `apps/web` (B2).

### 3. Routing: **un Worker, un bundle compuesto por prefijo de ruta**

Workers Assets sirve **un solo directorio**. Se compone en el deploy:

- `apps/site` build (`base: '/'`) → **raíz** del bundle.
- `apps/web` build del tenant demo con **`base: '/demo/'`** → copiado a `dist/demo/`.
- `apps/dashboard` build → copiado a `dist/admin/` (igual que hoy).
- `apps/api` sigue sirviendo `/api/*` en el mismo Worker (Hono), sin cambios de lógica.

`tenants/demo/wrangler.jsonc`: `assets.directory` pasa de `../../apps/web/dist` a un dir compuesto (raíz = `apps/site/dist`, con `demo/` y `admin/` copiados dentro). El script `deploy:demo` se amplía para orquestarlo:

```
site build → web build (BASE=/demo/) → dashboard build
→ componer dist (site raíz + web→/demo + dashboard→/admin)
→ migrate --remote → wrangler deploy
```

**`apps/web` gana `base` configurable** (`astro.config.mjs`: `base: process.env.BASE_PATH ?? '/'`). En el build de la demo se pasa `BASE_PATH=/demo/`. Astro reescribe los enlaces internos, `sitemap`, `canonical` y el deep-link del mostrador (`/?from=…` → `/demo/?from=…`) vía `import.meta.env.BASE_URL`. **Hay que auditar y corregir toda ruta absoluta escrita a mano** en `apps/web` (funnel, gestión por código+email, hreflang, robots/sitemap, OG) — es el mayor riesgo de esta fase.

### 4. Narrativa de venta (secciones de la landing)

Dirigida al **director de camping**, no al huésped. La unidad narrativa es *"tu web y tu recepción, resueltas"*, no el feature suelto.

1. **Héroe**: propuesta de valor + isotipo Logic2B + doble CTA — **"Pedir demo"** (formulario) y **"Ver la demo en vivo"** (→ `/demo/`).
2. **El problema**: la web actual del camping + la gestión en papel/Excel.
3. **El producto**: web pública moderna **+** gestor (dashboard), un solo sistema.
4. **La escalera de niveles** (`docs/TIERS.md`): los 4 tiers como planes; nivel 1 como puerta de entrada barata.
5. **El planning como pieza estrella**: captura/animación del tape chart (el elemento firma, §Dirección visual).
6. **Alta en una tarde** (§0): el argumento operativo de que montar su camping es rápido.
7. **Prueba social** (placeholder hasta tener el primer cliente) + **FAQ**.
8. **CTA final + formulario de contacto/demo**.

### 5. Captación de contacto: endpoint **`/api/leads`** nuevo, NO reusar `enquiries`

`enquiries` es, por dominio (`docs/DOMAIN.md`), la **solicitud de un huésped a un camping** — tabla de primera clase, tenant-scoped. Un "pedir demo" del producto es un **lead comercial de Logic2B**, semántica distinta; mezclarlos rompería el modelo. Se añade en `apps/api` un endpoint mínimo **`POST /api/leads`** (Zod: `{name, campingName, email, phone?, message?, lang}`) que **envía un email a Logic2B** (`marinerandreu@gmail.com`) reusando el driver Resend de `packages/notifications`. **Sin tabla nueva en v1** (email-only; si hace falta histórico, se añade `product_leads` más adelante). Rate limit igual que el resto de la API pública.

### 6. i18n, SEO e indexación

- **Idiomas de arranque**: `es` (principal), `en`, `ca` (Logic2B es de Castellón). `fr/de/nl` se añaden luego — textos en `apps/site/src/content/{lang}.json`, nunca hardcodeados.
- **SEO/OG propios** de la landing: `sitemap.xml`, `hreflang` entre idiomas, OG image con marca Logic2B, `canonical`.
- **Indexación**: la landing **SÍ se indexa** (es la puerta del producto). La demo en `/demo/` va **`noindex`** hasta pulir (cierra de paso la decisión pendiente #4 del ROADMAP para el caso demo). El dashboard sigue `noindex`.

### 7. Alcance de esta fase (qué NO entra)

Este ADR cubre **B3 (landing) + B0-lite (fundación DS mínima)**. **No** incluye: reskin del dashboard a Logic2B (**B1**, ADR propio), alinear la estructura de `apps/web` (**B2**, ADR propio), ni la documentación (**B4**, ADR propio). "Empezar la landing y todo lo demás" se hace **por fases con su ADR**, no en un solo golpe — lo exige el propio contrato del proyecto.

## Alternativas descartadas

- **Reusar `apps/web` para la landing** (un "tenant producto"): contamina el modelo tenant-driven; la landing no tiene inventario, tarifas ni motor.
- **Landing en subruta y demo en raíz**: descartado por decisión de Andreu (landing en `/`).
- **Demo en subdominio propio** (`demo.logic2b.com`): más realista, pero abre otro dominio/DNS/Worker que mantener — contra la regla de ~6h/semana. Reevaluable si la demo crece.
- **Dos Workers (uno landing, otro demo)**: duplica deploy y routing; el bundle único por prefijo es más simple.
- **Reusar `enquiries` para los leads**: rompe el dominio (`enquiries` = huésped→camping, no comprador→Logic2B).
- **B0 completo antes de la landing**: bloquearía la pieza comercial tras un paquete entero de primitivos que aún nadie usa; B0-lite entrega solo lo necesario y crece con B1.
- **Guardar leads en tabla desde v1**: innecesario para arrancar; email cumple. Se añade histórico si el volumen lo pide.

## Consecuencias

- **Se gana**: por fin un argumento de venta del producto (no solo la demo), con marca Logic2B coherente y `packages/ui` dejando de estar vacío. La demo sigue viva bajo `/demo/`, enlazada desde la landing.
- **Se compromete / a vigilar**:
  - **Riesgo principal**: mover la demo a `base: '/demo/'` puede romper enlaces absolutos, el deep-link del mostrador, el funnel de reserva, gestión por código, `sitemap`/`hreflang`/OG. Hay que **auditar `apps/web` ruta por ruta** y re-verificar el E2E de Playwright y el DEMO-SCRIPT (URLs `/` → `/demo/`).
  - `deploy:demo` se vuelve más largo (3 builds + composición). Mantenerlo como **un solo comando** idempotente.
  - `wrangler.jsonc` `assets.directory` cambia; `not_found_handling` debe seguir sirviendo el 404 correcto por zona (landing vs demo).
  - Lighthouse ≥95 y accesibilidad AA deben mantenerse también en la landing (mismo listón que la web).
  - Fuentes self-hosted en `packages/ui`: vigilar peso y subsetting; la landing no debe cargar rangos de idioma que no usa.
  - `docs/DEMO-SCRIPT.md`, `docs/ROADMAP.md` (estado B3/B0) y `PROGRESS.md` se actualizan al cerrar la fase.

---

**PARADO a esperar validación de Andreu.** No se escribe código de la landing, del DS ni del routing hasta que este ADR 0016 esté aceptado. Puntos que conviene que Andreu confirme antes de arrancar: (a) app nueva `apps/site` vs otra ubicación; (b) el enfoque de routing por prefijo con la demo a `base:/demo/` (asumiendo el coste de auditar `apps/web`); (c) idiomas de arranque es/en/ca; (d) leads por email a `marinerandreu@gmail.com` sin tabla en v1.
