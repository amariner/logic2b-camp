# 0001 — Scaffold del monorepo

- **Fecha**: 2026-07-17
- **Fase**: 0 · Fundaciones
- **Estado**: aceptado (OK de fase dado por Andreu: "comienza el desarrollo"; revisable)

## Contexto

Repo vacío (solo documentación). Hay que montar el monorepo completo según `CLAUDE.md` sin escribir lógica de negocio ni UI: estructura, tooling, CI y un `/health` desplegable. Restricciones: stack cerrado, ~6h/semana, nada que escale trabajo por cliente. `wrangler login` aún no está hecho en esta máquina → el deploy a `camp.logic2b.com` queda como paso manual pendiente; todo lo demás debe funcionar en local.

## Decisión

**Estructura** (la de CLAUDE.md, con lo mínimo viable por paquete):

```
apps/api          Hono en Workers. GET /health → { ok, tenant, version }. wrangler.jsonc con D1 local.
apps/web          Astro 5 mínimo (una página placeholder). Sin contenido real.
apps/dashboard    React 19 + Vite + TanStack Router mínimo (pantalla placeholder).
packages/db       Drizzle + drizzle-kit apuntando a D1 (sqlite). Migración 0000 con la tabla
                  `meta` (key, value) — marcador de versión de esquema; el esquema real es Fase 1.
packages/tsconfig base.json / astro.json / react.json / workers.json compartidos.
packages/{core,ui,config,extensions,i18n,notifications,payments,cli}
                  creados con package.json + index.ts vacío exportando su nombre — reservan el
                  sitio y compilan, sin lógica (evita decisiones prematuras de Fases 2+).
tenants/_template config.ts.example, theme.css, content/, custom/, wrangler.jsonc.example, README.md
tenants/demo      wrangler.jsonc del Worker demo (binding DB "logic-camp-demo"), README.md
```

**Tooling**:

- pnpm workspaces (`apps/*`, `packages/*`) + Turborepo. Script raíz `pnpm check` = `turbo run typecheck lint test build`.
- TypeScript 5 estricto en todos los paquetes; tipos compartidos desde `packages/tsconfig`.
- ESLint 9 flat config + Prettier, config única en la raíz.
- Vitest en raíz (proyecto por paquete cuando haga falta); un test humo en `apps/api` (el handler `/health` responde 200) para que `pnpm test` ejerza algo real.
- Wrangler como devDependency (no global). Config en **`wrangler.jsonc`** (formato actual recomendado por Cloudflare; el super prompt dice `.toml`, funcionalmente equivalente — si molesta, se cambia, es un rename).

**CI (GitHub Actions)**:

- `check.yml`: en PR y push → pnpm install + `pnpm check`.
- `deploy-demo.yml`: en push a `main` → deploy del Worker demo con `CLOUDFLARE_API_TOKEN`/`ACCOUNT_ID` de secrets. Hasta que existan los secrets, el job hace skip explícito (no falla).
- No hay workflow de deploy por tenant aún (Fase 9).

**Git**: `git init` en este directorio con rama `main`. El remoto GitHub (`logic-camp` privado) lo crea Andreu; se documenta el comando en PROGRESS.

## Alternativas descartadas

- Esquema Drizzle completo ya en Fase 0 — invade la Fase 1 y su ADR.
- Deploy real en esta sesión — bloqueado por `wrangler login`/token; se deja listo el comando.
- Un solo tsconfig raíz sin paquete — los targets difieren (workers/astro/react); mejor resolverlo ya.
- Storybook — Fase 10, prohibido antes.

## Consecuencias

- `pnpm check` verde en local desde el día 0; cualquier fase siguiente hereda tooling.
- El deploy a `camp.logic2b.com/api/health` (criterio de "hecho" de Fase 0) queda **pendiente de credenciales** — se completa en cuanto haya `wrangler login` + zona en Cloudflare.
- Los paquetes vacíos compilan pero no aportan nada aún: es deliberado.
