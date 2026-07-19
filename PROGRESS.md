# PROGRESS — Logic Camp

Diario de sesiones. Se actualiza al cerrar cada sesión con `/session-close`. La sesión siguiente empieza leyendo este fichero.

## Estado actual

- **Fase actual**: 6 🟨 sesiones 1–3/5 (planning con DnD + ficha) · Siguiente: **Fase 6 sesión 18** — solicitudes + llegadas = modo lite (bandeja de enquiries con cambio de estado, lista de llegadas/salidas del día). Antes, en local: redeploy demo (`pnpm --filter @logic-camp/api deploy:demo` — sirve web+API+funnel+dashboard **+ selector de temas nuevo**), descargar fotos Higgsfield (IDs abajo), re-audit Lighthouse en producción.
- **Docs de cliente**: `docs/FUNCIONALIDADES.md` (sesión 14) — actualizar con cada funcionalidad nueva.
- **Último `/check`**: ✅ verde 2026-07-19 (32/32 tareas)
- **Repo**: https://github.com/amariner/logic2b-camp
- **Cloudflare**: login OK (en local). D1 `logic-camp-demo` migrada (0000+0001) y sembrada en remoto. Worker desplegado con `/api/*`; **pendiente redeploy** para activar la ruta nueva `camp.logic2b.com/*` con la web (esta sesión cloud no tiene credenciales — NO simulado).
- **Pendiente de Andreu (cierra Fase 0)**: registro DNS en zona logic2b.com: `AAAA camp → 100::` proxied. También: secrets `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` + var `DEPLOY_DEMO_ENABLED=true` en GitHub para el deploy automático de la demo.

## Sesiones

### Sesión 14 — 2026-07-19 · Demo comercial · Selector de temas (ADR 0009) + docs de funcionalidades

**Hecho** (petición directa de Andreu en sesión: temas para enseñar la demo en varios estilos + documentación de cara al cliente)
- **ADR 0009**: temas = bloques `[data-theme]` en el `theme.css` del tenant (los derivados `color-mix` se recalculan solos → un tema son ~6 variables, cero cambios en componentes). Demo-only tras `config.demoThemes` — sin el flag no se renderiza ni un byte. Mismas fuentes en todos (cambiar tipografía = pagar Lighthouse).
- **4 temas** dentro del territorio y fuera del antimodelo: `pinada` (actual, defecto), `mar` (posidonia/roca húmeda), `garriga` (oliva/tierra seca) y `nit` (**modo oscuro completo** con `color-scheme: dark` — la prueba de fuego del sistema de tokens). Botón "Ver disponibilidad" en nit ~5.5:1 AA.
- **Selector sin islas** en la cabecera: `<details>` nativo como el de idioma, swatches que pintan el color de acción de cada tema vía el propio bloque de tokens (`.lc-swatch[data-swatch]` comparte selector — sin duplicar hex), `aria-pressed`, script inline anti-FOUC en `<head>` + persistencia `localStorage`. OJO Astro: las expresiones dentro de `<script is:inline>` NO se evalúan — hay que usar `set:html` (el primer intento emitía el JS como cadena inerte).
- i18n en los 6 content JSONs (`nav.tema` + bloque `temas`); `TenantWebConfig.demoThemes?: string[]`; tipo `Content.temas?`.
- **`docs/FUNCIONALIDADES.md`**: guía completa de cara al cliente — niveles, web (idiomas/SEO/rendimiento/temas), mostrador, funnel con holds, autogestión, precios explicables, dashboard (planning/DnD/ficha/roles/auditoría), solicitudes, seguridad (D1 por camping), roadmap honesto y ficha técnica. Mantener al día con cada feature nueva.
- **Verificado en navegador contra el Worker real**: 4 temas cambian en vivo (fondos comprobados por computed style), persisten entre páginas (localStorage), vuelta al defecto limpia (atributo y storage fuera), `aria-pressed` marca el activo, 0 errores JS. **Regla dura re-verificada**: build TIER=1 → 121 páginas, 0 islas, selector presente (es vanilla).
- BACKLOG: `?tema=x` por URL y tematizar el dashboard (ambos Fase 10).

**Decisiones**: ver ADR 0009 (demo-only, un cliente real tiene UN tema; el selector es atrezzo comercial, no feature)
**`/check`**: ✅ verde (32/32)

### Sesión 13 — 2026-07-19 · Fase 6 (3/5) · Ficha de reserva: panel lateral con acciones tipadas

**Hecho**
- **Panel lateral no modal** (`components/BookingPanel.tsx`) sobre el planning: click en una barra (sin drag, el umbral de 4px distingue), Enter/Espacio con la barra enfocada, o click en un chip de la bandeja "sin asignar" (ahora botones). Esc cierra desde cualquier sitio (listener a nivel de documento — el foco puede salir del panel al deshabilitarse un botón) y el foco vuelve a quien la abrió
- **Contenido**: código + chip de estado (mismos tokens que las barras), estancia (fechas→noches, ocupación con edades, unidad, canal, creada), titular y acompañantes, **desglose auditable línea a línea** (conceptos i18n con `tDyn` de fallback, descuentos en negativo en pino), total/tasa/fianza/pagado/**pendiente de pago** en mar, pagos con signo, notas editables (acción `note`, botón deshabilitado si no hay cambio)
- **Acciones tipadas** contra `PATCH /api/admin/bookings/:id`: espejo cliente de TRANSITIONS del servidor (pending→confirm|cancel, confirmed→cancel|no_show|complete) — solo se ofrecen las que aplican, el servidor valida SIEMPRE. Cancelar exige **doble confirmación inline** ("¿Seguro? Sí, cancelar"). Éxito → mensaje `role=status` + invalidación de ficha y planning
- Tipos `BookingDetail`/`BookingGuest`/`BookingPayment`/`PriceLine` en el cliente; ~60 claves i18n nuevas
- **Verificado en navegador contra el Worker real** (build servido desde `/admin/` del Worker — el login via proxy Vite da 403 de origen, nota abajo): abrir ficha (868,00 € de desglose correcto), guardar nota, Esc, confirmar una pendiente (chip y barra del planning pasan a pino), cancelar con doble confirmación (la barra desaparece = inventario liberado), 0 errores JS. Seed restaurado después

**Decisiones**: panel no modal (se sigue viendo el planning al lado); en dev el dashboard se prueba servido por el Worker (mismo origen que Better Auth), el `vite dev` con proxy queda para iterar UI sin sesión
**Pendiente fase**: sesiones 18–20 (solicitudes+llegadas=lite, reservas/inventario/tarifas, clientes/informes/ajustes)
**`/check`**: ✅ verde (32/32)

### Sesión 12 — 2026-07-19 · Fase 6 (2/5, parcial) · Drag & drop de reasignación en el planning

**Hecho**
- **DnD con Pointer Events nativos** (sin librería, según ADR 0008): arrastrar una barra verticalmente a otra unidad del MISMO tipo — umbral de 4px (un click no es un drag), transform directo al DOM (cero re-render por frame), resaltado de la fila destino válida en pino, detección de fila vía las posiciones del virtualizador
- **Optimista con rollback**: `PATCH /api/admin/bookings/:id {action:'reassign'}` — la caché de Query se actualiza al soltar y se restaura si el servidor responde 409 (solape/estado); mensaje `role=status` con el resultado ("Reserva movida a A-05" / error). El servidor valida SIEMPRE — la UI nunca decide
- **Teclado**: barra enfocable, ↑/↓ reasigna a la unidad adyacente del mismo tipo (misma mutación, mismos mensajes)
- `apiPatch` en el cliente del dashboard (las acciones tipadas del admin son PATCH)
- **Verificado en navegador contra el Worker real**: drop en fila libre → movida; drop en fila con solape → 409 + rollback visual; teclado contra fila ocupada → rechazo informado; 0 errores JS

**Pendiente sesión 17**: panel lateral de ficha con acciones tipadas
**`/check`**: ✅ verde (32/32)

### Sesión 11 — 2026-07-19 · Fase 6 (1/5) · ADR 0008 + dashboard con planning v1

**Hecho** (ADR 0008 aceptado por la misma delegación)
- `docs/adr/0008-dashboard-planning.md`: SPA en `/admin/` del MISMO Worker (un deploy = web+API+dashboard, misma cookie Better Auth, cero CORS), hash history (`/admin/#/…` — sin rewrites en estático), virtualización propia de FILAS + barras absolutas, DnD con pointer events nativos (sesión 17), reparto 16–20
- `apps/dashboard` real: React 19 + Vite + **TanStack Router** (hash) + **TanStack Query** + Tailwind v4 con los tokens de la demo. Login contra Better Auth (cookie), guardia de sesión en la raíz, i18n por diccionario `t()` desde el día 1 (es)
- **Planning v1 (tape chart ★, lectura)**: filas virtualizadas con `@tanstack/react-virtual` (~40 renderizadas de 300 posibles), cabecera de meses+días sticky, columna de unidades sticky, findes sombreados, grupos por tipo, **colores por estado con los tokens** (confirmed=pino · pending=arena · no_show=mar · completed=tinta-suave), bloqueos rayados con motivo, **bandeja "sin asignar"**, zoom semana/mes/temporada (96/42/22px), navegación ←/hoy/→ + fecha, refresco de cortesía cada 60 s, tooltips con código·estado·fechas·pax
- Deploy cableado: `deploy:demo` construye web + dashboard y copia `dist` a `web/dist/admin/`; CI `deploy-demo.yml` igual
- **Verificado en navegador contra el Worker real**: login recepción → planning de agosto (83 unidades · 13 reservas a la vista · CS-2026-0006 en la bandeja sin asignar), zoom temporada, scroll a la última fila fluido, 0 errores JS

**Pendiente fase**: sesiones 17–20 (DnD+ficha, solicitudes+llegadas=modo lite, reservas+inventario+tarifas, clientes+informes+ajustes)
**`/check`**: ✅ verde (32/32)

### Sesión 10 — 2026-07-19 · Fase 5 · Flujo de reserva completo (ADR 0007)

**Hecho** (ADR 0007 aceptado por delegación explícita de Andreu en sesión)
- **Motor**: `searchAvailability` acepta `holds` + `now` (expiración perezosa) — 4 tests nuevos ANTES de implementar (51 total). Tipo `Hold` en el dominio
- **Modelo**: tabla `inventory_holds` (migración 0002 con drizzle-kit), hold por TIPO, índices por tipo/fechas y por expiración
- **API**: `POST/DELETE /api/holds` (valida estancia + disponibilidad, TTL 15 min), availability y bookings cuentan holds vivos, `createBooking` consume el hold EN el mismo batch que crea la reserva (y rechaza hold caducado/ajeno con 409), `GET /bookings/:code` devuelve previsión de cancelación, `POST /bookings/:code/cancel` (libera inventario, auditado) y `/modify` (re-cotización COMPLETA en servidor, 409 si no cabe, desglose nuevo auditable). Primer **Cron Trigger** (purga de holds cada 15 min). 7 tests de integración nuevos (32 total)
- **Web**: funnel `/reservar` (resultados=mostrador con botón Reservar) → `/reservar/{tipo}` (extras + desglose EN VIVO del servidor, errores i18n del motor) → `/reservar/{tipo}/titular` (hold al entrar con contador mm:ss, liberación con `pagehide` si se abandona) → confirmación en `/reserva?code&email&nueva=1` (resguardo imprimible con @media print). Gestión completa: ver, **cancelar con el reembolso a la vista**, **cambiar fechas** re-cotizado. 6 idiomas (bloques `reservar`/`reserva` en los JSONs), noindex en páginas de proceso, Idempotency-Key = hold
- **Regla dura re-verificada**: TIER=1 → 121 páginas, **0 islas** en todo el sitio, `/reservar` y `/reserva` degradan a redirección sin JS; los 8×2 pasos por tipo ni se generan
- **E2E Playwright** (`apps/web/e2e`, `pnpm e2e`, webServer wrangler): camino feliz (buscar→extras→hold→confirmar→**aparece en /api/admin/planning** ✅ criterio de fase→modificar→cancelar) + 3 infelices: tipo agotado entre pasos, hold caducado al confirmar (reintento revalida sin perder el formulario), estancia inválida en alta (mín. 7 noches + sábado). **4/4 verdes** contra el Worker real
- Verificado también a mano en navegador: reserva CS-2026-785715 creada, modificada (nuevo total del servidor) y cancelada, 0 errores JS

**Decisiones**: hold por tipo (no por unidad — la asignación sigue libre para el planning); gestión en `/reserva?code=…` (query, no segmento — salida estática); sin hold también se puede confirmar (el hold protege la UX, el servidor siempre revalida)
**Pendiente**: pago real (Fase 8: la pantalla confirma directo con `payments:'none'`); emails (Fase 7, hooks anotados)
**`/check`**: ✅ verde (32/32) · E2E 4/4

### Sesión 9 — 2026-07-19 · Fase 4 (remates) · Lighthouse ≥95 local + ADR 0007 propuesto

**Hecho**
- **Lighthouse contra el Worker local** (assets reales, red y CPU emuladas): home desktop **100/100/100/100**, detalle glamping móvil **100**, tarifas desktop **100**, home móvil **96/100/100/100**. Objetivo ≥95 cumplido en todo lo auditado
- Los dos arreglos que lo consiguieron: **fuentes subseteadas** con fonttools a latín+latín-ext+signos (Inter 352→101 KB, Clash 29→23 KB — el render del héroe pasaba 2,1 s esperando ancho de banda) y **imágenes**: héroe webp calidad 60, separador de lona 287→~60 KB como `<img loading="lazy">`
- `.claude/launch.json`: el server `api` crea `apps/web/dist` si falta (wrangler dev con assets exige que exista el directorio)
- **`docs/adr/0007-flujo-de-reserva.md` PROPUESTO** (Fase 5): funnel en apps/web con isla por paso, estado en URL, `inventory_holds` por tipo con expiración perezosa + primer Cron Trigger, gestión código+email (ver/cancelar/modificar re-cotizado), E2E Playwright feliz + 3 infelices, reparto sesiones 13–15. **Sin código de Fase 5 — esperando validación**

**`/check`**: ✅ verde (32/32)

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
