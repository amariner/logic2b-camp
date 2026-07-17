# PROGRESS — Logic Camp

Diario de sesiones. Se actualiza al cerrar cada sesión con `/session-close`. La sesión siguiente empieza leyendo este fichero.

## Estado actual

- **Fase actual**: 3 🟨 sesión 1/2 hecha (API pública) · Siguiente: **Fase 3 sesión 2 — Better Auth + endpoints privados** (`/planning`, CRUD reservas/solicitudes/tarifas, `/reports`, `/settings`, roles owner/manager/reception/readonly)
- **Último `/check`**: ✅ verde 2026-07-17 (32/32 tareas)
- **Repo**: https://github.com/amariner/logic2b-camp
- **Cloudflare**: login OK (ojo: el proxy corporativo rompe wrangler — ejecutar con `env -u HTTP_PROXY -u HTTPS_PROXY …`). D1 `logic-camp-demo` creada, migrada y sembrada en remoto. Worker desplegado con ruta `camp.logic2b.com/api/*`.
- **Pendiente de Andreu (cierra Fase 0)**: registro DNS en zona logic2b.com: `AAAA camp → 100::` proxied. También: secrets `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` + var `DEPLOY_DEMO_ENABLED=true` en GitHub para el deploy automático de la demo.

## Sesiones

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
