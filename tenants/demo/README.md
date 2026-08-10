# Tenant demo — Camping Cala Sereno

- **Qué es**: camping ficticio canónico bajo `/demo/` dentro de la herramienta
  comercial compuesta de `camp.logic2b.com`.
- **Nivel**: build técnico tier 3; el conmutador de demo compara Inicio y
  Gestión sin crear otro bundle.
- **Identidad**: `identity.json`, `theme.css`, contenido en seis idiomas y cuatro
  temas accesibles (`pinada`, `mar`, `garriga`, `nit`).
- **Media**: 12/12 piezas finales locales, procedencia histórica documentada en
  `fotos.json` y derivados dentro de presupuesto.
- **Estado remoto**: cualquier deploy, migración o reseed sigue requiriendo
  autorización explícita; este README no afirma el estado actual de producción.

## Usuarios del dashboard (seed)

Contraseña de todos: `calasereno` (solo demo — el hash scrypt vive en `accounts`; seed determinista, ADR 0005).

| Email                        | Rol       |
| ---------------------------- | --------- |
| direccion@calasereno.example | owner     |
| gerencia@calasereno.example  | manager   |
| recepcion@calasereno.example | reception |
| consulta@calasereno.example  | readonly  |

Login: `POST /api/auth/sign-in/email` con `{ email, password }` (cookie de sesión Better Auth). Rutas privadas bajo `/api/admin/*`.

## Reseed de la D1 REMOTA (`pnpm db:seed:remote`)

El deploy lleva **schema** (migraciones), **no datos** — no existe reset nocturno
remoto. Si cambias el seed (p. ej. activas un módulo en `tenants.modules`), la
demo remota se queda con los datos viejos hasta re-sembrarla. Este comando
encapsula el procedimiento FK-safe que antes se hacía a mano (deuda `[infra]`):

```bash
pnpm db:seed:remote            # dry-run: imprime el plan, no toca nada
LOGIC_CAMP_ALLOW_REMOTE_SEED=1 pnpm db:seed:remote --apply   # ejecuta (destructivo)
```

Doble candado (`--apply` **y** `LOGIC_CAMP_ALLOW_REMOTE_SEED=1`) porque **borra y
re-siembra una base de producción**; requiere además credenciales de Cloudflare.
El plan: regenera `seed.sql` → vacía las 21 tablas **hijo→padre** con `--command`
uno a uno (la D1 remota **sí** fuerza FKs; el `--file` masivo hace `fetch failed`)
preservando `d1_migrations` → siembra con `--file seed.sql` (INSERT-only). El
orden de borrado es el mismo `DELETE_ORDER` del reset local (`reset.ts`), fuente
única; la lógica es pura y está testeada en `remote-seed.test.ts`. Ojo: el wipe
borra sesiones, así que después toca re-login en el dashboard.

## Fábrica local

```bash
pnpm fotos -- status demo
node apps/web/scripts/check-tenant-factory.mjs
pnpm --filter @logic-camp/web capture:tenant -- demo / --theme=nit
```

La receta y las fronteras de marca completas viven en
`docs/FABRICA-IDENTIDADES.md`.
