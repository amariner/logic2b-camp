# `@logic-camp/dashboard` — el gestor

SPA de React 19 (Vite + TanStack Router/Query) que en producción se sirve en **`/admin/` del mismo Worker del tenant** (ADR 0008): misma cookie de sesión, cero CORS.

## Desarrollo

Hacen falta **dos procesos**, porque el dashboard no tiene backend propio:

```bash
# 1) API + D1 local (Worker)
pnpm exec wrangler dev --config tenants/demo/wrangler.jsonc \
  --port 8787 --var LOGIC_CAMP_DEV_ORIGINS:1 --var LOGIC_CAMP_DEV_AUTH:1

# 2) dashboard con HMR
pnpm --filter @logic-camp/dashboard exec vite --port 5173
```

Luego `http://localhost:5173`. Vite hace de proxy de `/api` → `:8787` (ver `vite.config.ts`).

> Con Claude Code, los dos están en `.claude/launch.json` (`api` y `dashboard`) y se levantan solos con el flag ya puesto.

**Usuarios del seed demo** (contraseña `calasereno` en todos):

| Email                          | Rol       |
| ------------------------------ | --------- |
| `direccion@calasereno.example` | owner     |
| `gerencia@calasereno.example`  | manager   |
| `recepcion@calasereno.example` | reception |
| `consulta@calasereno.example`  | readonly  |

Si la base está vacía: `pnpm db:reset && pnpm db:seed`.

### Los dos interruptores locales — por qué hacen falta

`LOGIC_CAMP_DEV_AUTH:1` habilita el secreto de autenticación reservado al
entorno local; sin él el Worker falla cerrado. `LOGIC_CAMP_DEV_ORIGINS:1`
autoriza el origen fijo de Vite: sin este segundo flag el login falla con 403
aunque las credenciales sean correctas (ADR 0019).

Better Auth rechaza el origen cruzado: el proxy de Vite manda `Origin: http://localhost:5173` mientras la API responde en `:8787`. En producción no ocurre porque el dashboard vive en `/admin/` del **mismo** Worker.

Ambos flags son **interruptores, no valores de configuración**. El de orígenes
habilita una lista **constante** (`localhost:5173`) definida en
`apps/api/src/auth.ts`. No se puede usar para autorizar un dominio arbitrario, y
se pasan por `--var` en la línea de comandos precisamente para que **no existan
en `tenants/*/wrangler.jsonc`**, el fichero que despliega a producción.

El contrato está fijado por tests en `apps/api/test/admin.test.ts` (`describe('trustedOrigins de desarrollo')`): sin el flag el 403 se mantiene, y con él solo entra localhost.

## Sin HMR, contra el Worker real

Para verificar el bundle tal cual se sirve en producción (mismo origen, sin proxy):

```bash
pnpm --filter @logic-camp/dashboard build
rm -rf apps/site/dist/admin && cp -r apps/dashboard/dist apps/site/dist/admin
# con el Worker levantado → http://localhost:8787/admin/
```

## Comandos

|                                                 |                     |
| ----------------------------------------------- | ------------------- |
| `pnpm --filter @logic-camp/dashboard build`     | build de producción |
| `pnpm --filter @logic-camp/dashboard typecheck` | typecheck           |
| `pnpm --filter @logic-camp/dashboard lint`      | lint                |
