# Tenant demo — Camping Cala Sereno

- **Qué es**: camping ficticio de la demo comercial → `camp.logic2b.com`. Reset nocturno (Fase 10).
- **Nivel**: conmutable 1/3 en la demo (Fase 10).
- **Estado**: Fase 3 — D1 real creada, migrada y sembrada; Worker desplegado con la API pública y privada. Pendiente: DNS `camp` (AAAA `100::` proxied), config/theme/content en Fases 4 y 9.

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
