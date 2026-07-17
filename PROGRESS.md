# PROGRESS — Logic Camp

Diario de sesiones. Se actualiza al cerrar cada sesión con `/session-close`. La sesión siguiente empieza leyendo este fichero.

## Estado actual

- **Fase actual**: 0 · Fundaciones — scaffold hecho, deploy pendiente de credenciales
- **Último `/check`**: ✅ verde 2026-07-17 (28/28 tareas)
- **Repo**: https://github.com/amariner/logic2b-camp (push hecho 2026-07-17)
- **Siguiente paso**: (1) `wrangler login` + `pnpm exec wrangler d1 create logic-camp-demo` (rellenar `database_id` en `tenants/demo/wrangler.jsonc`) + `pnpm --filter @logic-camp/api deploy:demo`; (3) secrets `CLOUDFLARE_*` y var `DEPLOY_DEMO_ENABLED=true` en GitHub. Con `/health` respondiendo en camp.logic2b.com, Fase 0 cerrada → siguiente sesión: **Fase 1 (modelo de datos)**, ADR primero.

## Sesiones

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
