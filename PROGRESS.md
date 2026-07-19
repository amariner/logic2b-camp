# PROGRESS — Logic Camp

Diario de sesiones. Se actualiza al cerrar cada sesión con `/session-close`. La sesión siguiente empieza leyendo este fichero.

## Estado actual

- **Fase actual**: 4 🟨 sesión 2/3 (web completa 6 idiomas + Workers Assets) · Siguiente: **Fase 4 sesión 3** — redesplegar la demo (`pnpm --filter @logic-camp/api deploy:demo` sirve ya web+API), descargar la 2ª tanda de fotos Higgsfield (IDs abajo), auditoría Lighthouse ≥95 contra producción y remates que salgan de verla desplegada.
- **Último `/check`**: ✅ verde 2026-07-19 (32/32 tareas)
- **Repo**: https://github.com/amariner/logic2b-camp
- **Cloudflare**: login OK (en local). D1 `logic-camp-demo` migrada (0000+0001) y sembrada en remoto. Worker desplegado con `/api/*`; **pendiente redeploy** para activar la ruta nueva `camp.logic2b.com/*` con la web (esta sesión cloud no tiene credenciales — NO simulado).
- **Pendiente de Andreu (cierra Fase 0)**: registro DNS en zona logic2b.com: `AAAA camp → 100::` proxied. También: secrets `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` + var `DEPLOY_DEMO_ENABLED=true` en GitHub para el deploy automático de la demo.

## Sesiones

### Sesión 8 — 2026-07-19 · Fase 4 (2/3) · Web completa, 6 idiomas, Workers Assets

**Hecho**
- **Páginas restantes**: alojamientos (lista por familias) + detalle por tipo (galería, ficha técnica y precios por temporada **desde los mismos datos que la D1** vía `tenants/demo/data.ts` → `generateSeed`), instalaciones, entorno, tarifas (tabla tipos×temporadas + suplementos + extras + condiciones desde `rate_plans`), contacto (datos+horario+cómo llegar+formulario), blog cableado (`content/blog/{slug}.{lang}.md`, fallback al idioma por defecto) y 404 propia con foto y CTA
- **6 idiomas completos** (es/ca/en/fr/de/nl): content JSONs ampliados (~380 claves/idioma), selector de idioma accesible (`<details>` nativo, sin JS), menú móvil, rutas `/{lang}/…` con wrappers `[lang]` (109 páginas estáticas)
- **API**: `GET /api/availability` devuelve `opensOn` (próxima apertura real de `seasons_calendar`) cuando las fechas caen en cerrado + 2 tests (25 total)
- **Mostrador**: skeleton de carga, mensaje "cerrado — abrimos el {fecha}" con la fecha REAL de la API formateada por locale, deep-link `/?from=&to=&adults=&children=` bidireccional (lee la URL al cargar y la escribe al buscar)
- **Workers Assets**: `tenants/demo/wrangler.jsonc` sirve `apps/web/dist` en `camp.logic2b.com/*` con `run_worker_first: ["/api/*"]` y 404 propia; `deploy:demo` construye la web antes; CI `deploy-demo.yml` actualizado. Un deploy = web + API
- **SEO técnico**: sitemap.xml (todas las rutas × idiomas con alternates hreflang), robots.txt por tenant, favicon SVG + apple-touch-icon con la marca, og.jpg 1200×630 derivada del héroe (sharp), JSON-LD CampingPitch/Accommodation+Offer por tipo
- **Imágenes responsive**: astro:assets con `Picture` AVIF/WebP (fallback webp forzado — el default png pesaba 5MB), preload del héroe con imagesrcset, sharp como dep del workspace
- Seed: `seasons/unit_types/rate_plans/extras` tipados (`SeedSeason`…) — la web los consume sin `any`
- **Verificado en navegador (worker real, 1366+375)**: búsqueda → 8 resultados con precios de servidor, deep-link reproducible, cerrado con "15 de marzo", 0 errores JS, sitemap/robots/404 servidos por el Worker. TIER=1: 0 islas referenciadas en las 109 páginas
- 6 fotos nuevas generadas en Higgsfield (interiores bungalow/glamping, piscina, restaurante, premium mar, autocaravana)

**Pendiente fase (sesión 3)**
- Redeploy de la demo con credenciales (esta sesión cloud no las tiene — el deploy NO se ha hecho): `pnpm --filter @logic-camp/api deploy:demo`
- Descargar fotos Higgsfield (egress del contenedor bloqueaba la CDN) → `tenants/demo/content/media/`: `detalle-bungalow-interior`←job `f5ac46f2`, `detalle-glamping-interior`←`9bfdfd4b`, `instalacion-piscina`←`9a9eeb15`, `instalacion-restaurante`←`1cbee642`, `tipo-premium`←`32b5b013`, `tipo-autocaravana`←`2ba71b99` (WebP ~2000px, q78; la web ya las engancha por nombre de fichero sin tocar código)
- Lighthouse ≥95 contra producción (aquí verificado solo funcionalmente)

**Decisiones**: datos de web en build desde el generador del seed (`data.ts`) — misma fuente de verdad que la D1, sin drift de tarifas; fallback de blog al idioma por defecto con aviso; `fallbackFormat="webp"` obligatorio en `Picture`
**`/check`**: ✅ verde (32/32)

### Sesión 7 — 2026-07-18 · Fase 4 (1/3) · Diseño + home con mostrador

**Hecho**
- ADR 0006 (plan de diseño validado por Andreu): paleta 5 hex (tinta/hueso/pino/arena/mar), Clash Display + Inter self-host, wireframes de los dos héroes, elemento firma "el mostrador"
- 6 assets fotográficos con Higgsfield (Nano Banana Pro 4K héroes 21:9, Soul 2.0 tarjetas/textura), optimizados a WebP (86MB→2.2MB) en `tenants/demo/content/media/`
- `apps/web` real: Astro 5 + islas React + Tailwind v4. Alias `@tenant` resuelto en build (TENANT=slug), tokens en `tenants/demo/theme.css` (@theme de Tailwind mapea variables → cambiar el fichero re-viste todo)
- `packages/config`: `TenantWebConfig` + `bookingMode()` (nivel→comportamiento)
- Home completa ES+EN: héroe nivel 3 con **Mostrador** (fechas+huéspedes → GET /api/availability real, resultados en página, sticky) · héroe nivel 1 (anochecer + promesa + ticker) · tarjetas de tipos · separador de lona (firma secundaria) · entorno · formulario→POST /api/enquiries (vanilla JS, todos los niveles)
- **Regla dura verificada**: TIER=1 build → 0 islas, 0 JS referenciado en el HTML (wrapper HeroMostrador.astro con import dinámico)
- SEO: hreflang es/en/x-default, canonical, OG, JSON-LD Campground+LodgingBusiness
- Verificado en navegador: mostrador devuelve 8 tipos con precios del servidor (114/138/177€…), enquiry aparece en la D1 local
- `.claude/launch.json`: servidores `api` (wrangler dev + D1 local sembrada) y `web` (astro dev, proxy /api→8787)

**Decisiones**: @astrojs/react v4 (la v6 es de Astro 6/vite8 y rompe el dev server); tenant en build via alias, no runtime (Fase 9 revisará)
**Pendiente fase**: páginas restantes (alojamientos+detalle, instalaciones, entorno, tarifas, contacto, blog), 4 idiomas más (ca/fr/de/nl), sitemap, Lighthouse ≥95, deploy de la web a camp.logic2b.com (ahora solo /api/* pasa por el Worker)
**`/check`**: ✅ verde (32/32)

### Sesión 6 — 2026-07-18 · Fase 3 (2/2) · Better Auth + API privada

**Hecho**
- `docs/adr/0005-auth-privada.md`
- Better Auth 1.6 sobre la MISMA tabla `users` (adaptador Drizzle, D1 del binding): migración `0001_auth.sql` (users ampliada + sessions/accounts/verifications), instancia por petición en `auth.ts`, registro público desactivado, provisión en servidor (`provisionUser`), `requireRole` con jerarquía readonly<reception<manager<owner
- `routes/admin.ts` (`/api/admin`): `/planning` (el SELECT del tape chart), bookings (lista/detalle/alta manual phone|walkin/acciones tipadas confirm|cancel|no_show|complete|reassign|note), enquiries, rates, `/reports` (ocupación/ingresos/llegadas), `/settings`, users (solo owner). Toda mutación escribe `audit_log`
- `bookings.ts`: creación de reserva extraída y compartida público↔manual (mismo motor, precio en servidor)
- 13 tests de integración nuevos (24 total): 401/403, registro cerrado, fuga cruzada de sesión A↛B, **invariante 3** (cambiar tarifa no toca reserva confirmada) e **invariante 4** (cancelar libera inventario), reasignación con solape 409
- Seed demo: 4 usuarios (uno por rol) con credencial `calasereno` (hash scrypt constante ⇒ determinista); `db:reset && db:seed` verificado con 0001
- Remoto: migración 0001 aplicada, D1 re-sembrada, `AUTH_SECRET` puesto, Worker redesplegado

**Decisiones**: una sola tabla de usuario (nada de espejo), sesiones revocables en D1 (no JWT), jerarquía de roles como Record — ver ADR 0005. Nota técnica: better-auth arrastra `kysely` y duplicaba los tipos de drizzle-orm; se unifica con `kysely` como devDep de `packages/db`.
**Pendiente**: nada de la fase. `AUTH_SECRET` en CI/despliegues nuevos.
**`/check`**: ✅ verde (32/32)

### Sesión 5 — 2026-07-17 · Fase 3 (1/2) · API pública

**Hecho**
- `docs/adr/0004-api-publica.md`
- `apps/api` reestructurada: `schemas.ts` (Zod), `tenant.ts` (contexto por binding + rate limit 60/min), `data.ts` (filas→dominio), `routes/public.ts`, `app.ts`, `client.ts` (RPC `hono/client`)
- Endpoints: `GET /api/availability` (precio en servidor, closed≠unavailable), `POST /api/quote` (desglose + extras obligatorios + tasa), `POST /api/enquiries` (guarda SIEMPRE), `POST /api/bookings` (revalida, re-cotiza en servidor, asigna unidad, batch atómico, **Idempotency-Key** vía tabla `meta`), `GET /api/bookings/:code?email=`
- Tests de integración con `@cloudflare/vitest-pool-workers@0.9.14` (¡la 0.18 requiere Vitest 4 — no subir!): D1 real ×2 con migraciones reales, 11 tests incl. back-to-back (to exclusive), idempotencia, 409 agotado y **fuga cruzada A↛B** (invariante 5)
- Worker demo redesplegado con la API nueva

**Decisiones**: aislamiento por binding = un Worker por tenant (el middleware no elige DB, la trae el entorno). Config test propia `test/wrangler.test.jsonc` con DB y DB_B.
**Pendiente fase**: sesión 2 — Better Auth + rutas privadas.
**`/check`**: ✅ verde (32/32)

### Sesión 4 — 2026-07-17 · Fase 2 ★ · Motor de disponibilidad y precios

**Hecho**
- `docs/adr/0003-motor-core.md`
- `packages/core` puro (sin I/O, sin Drizzle): `searchAvailability` (disponibilidad por tipo con reasignación implícita — comprobación por noche, exacta para intervalos), `quote` (desglose por tramos de temporada, sum(lines)==total por construcción), `applyRules` (stackables + mejor exclusiva, descuentos como líneas negativas), `validateStay` (acumula todos los errores, códigos i18n), `assignUnit` (menos huecos, con alternativas), `calculateTouristTax` (política como dato: valencia/catalunya/none), `calculateCancellationRefund` (tramos), `createExtensionRegistry` (los 11 hooks de §3)
- Tests ANTES que implementación: `edge-cases.test.ts` con los 7 casos que rompen productos genéricos + `engine.test.ts` por módulo. **47 tests verdes**
- Distinción cerrado ≠ sin disponibilidad en todo el motor (`closed` / `ClosedError`)

**Decisiones**: tipos de dominio propios del core (no los de Drizzle) — ADR 0003.
**`/check`**: ✅ verde (32/32)

### Sesión 3 — 2026-07-17 · Fase 1 · Modelo de datos

**Hecho**
- `docs/adr/0002-modelo-de-datos.md`
- `packages/db/src/schema.ts`: las 16 tablas de §4 tipadas (JSON tipado: Occupancy, PriceBreakdown…), índices de disponibilidad, migración única `0000_modelo-datos.sql`
- Seed demo Cala Sereno en `tenants/demo/seed.ts`: generador puro y determinista (fecha ancla → listo para reset nocturno Fase 10). 83 unidades (60 parcelas/4 tipos, 18 bungalow-mobil/3 tipos, 5 glamping), 3 temporadas solapadas por prioridad, 12 extras, 3 reglas, 40 reservas con casos límite (cruce de temporadas, 28 noches, grupo 8 pax con niño exento de tasa, cancelada, no-show, sin asignar), 15 solicitudes en 5 estados, bloqueos (mantenimiento + longstay)
- 10 tests Vitest del seed, incluyendo invariantes: sin solapes por unidad, `sum(payments)==paid_cents`, desglose==total, precio por tramos
- `pnpm db:reset` / `pnpm db:seed` (D1 local en `.wrangler-demo/`); `tenants/*` añadido al workspace
- D1 **remota** migrada y sembrada; Worker demo desplegado (falta solo el DNS)

**Decisiones**: ver ADR 0002 (IDs texto, tenant_id documental, payments con signo, enquiries tabla propia).
**`/check`**: ✅ verde (31/31)

### Sesión 2 — 2026-07-17 · Fase 0 · Scaffold del monorepo

**Hecho**
- `docs/adr/0001-scaffold.md` (aceptado con el OK de fase de Andreu)
- Monorepo pnpm + Turborepo: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, ESLint 9 flat + Prettier, `.gitignore`, git init (rama `main`)
- `apps/api`: Hono + `GET /health` + tests Vitest + wrangler.jsonc dev + build dry-run
- `apps/web` (Astro 5) y `apps/dashboard` (React 19 + Vite) placeholders
- `packages/db`: Drizzle + schema `meta` + migración 0000; `packages/tsconfig`; 8 paquetes reservados compilando
- `tenants/_template/` documentado + `tenants/demo/` (wrangler.jsonc con ruta camp.logic2b.com/api/*)
- CI: `check.yml` y `deploy-demo.yml` (skip explícito hasta tener secrets)

**Sin terminar**: deploy real (sin `wrangler login` ni D1 creada), remoto GitHub.
**Decisiones**: `wrangler.jsonc` en vez de `.toml` (ADR 0001); lint de `.astro` diferido a Fase 4.
**`/check`**: ✅ verde (28/28)

### Sesión 1 — 2026-07-17 · Fundación documental (§1 BRIEF)

### Sesión 1 — 2026-07-17 · Fundación documental (§1 BRIEF)

**Hecho**
- `CLAUDE.md` (arquitectura, niveles, convenciones, visual, qué NO hacer)
- `docs/TIERS.md`, `docs/ROADMAP.md`, `docs/DOMAIN.md`, `docs/BACKLOG.md`
- `PROGRESS.md` (este fichero)
- `.claude/commands/`: `session-close.md`, `new-camping.md`, `check.md`, `adr.md`

**Sin hacer (deliberadamente)**: código, scaffold, repo git.

**Abierto**: ver dudas listadas al final de la sesión (prerrequisitos §5, git remoto, etc.)

---

<!-- Plantilla de entrada:
### Sesión N — YYYY-MM-DD · Fase X · <objetivo>
**Hecho**: …
**Sin terminar**: …
**Decisiones**: … (con enlace al ADR si aplica)
**Siguiente paso**: …
**`/check`**: verde/rojo
-->
