# 0005 — Auth y API privada (Fase 3, sesión 2 de 2)

- **Fecha**: 2026-07-18
- **Fase**: 3 · API
- **Estado**: propuesto (implementado en la misma sesión por indicación de Andreu de avanzar; revisable)

## Contexto

Cierra la Fase 3: Better Auth con roles y los endpoints privados del dashboard (`/planning`, CRUD de reservas/solicitudes/tarifas, `/reports`, `/settings`). El stack cerrado manda Better Auth (adaptador D1). La tabla `users` con `role(owner|manager|reception|readonly)` existe desde la Fase 1.

## Decisión

**Better Auth sobre la MISMA tabla `users`, vía adaptador Drizzle.** Nada de dos tablas de usuario. Better Auth exige `name`, `email_verified`, `image`, `created_at`, `updated_at`: la migración `0001_auth.sql` las añade a `users` (aditiva, sin tocar filas) y crea `sessions`, `accounts` (credenciales: el hash scrypt vive aquí, no en `users`) y `verifications`. `role` y `tenant_id` se declaran como `additionalFields` con `input: false` — un cliente no puede autoconcederse rol.

**Instancia por petición, con el binding del tenant.** `createAuth(env)` construye Better Auth con `drizzleAdapter(createDb(env.DB))`. Igual que en el ADR 0004: el aislamiento lo da el binding — el Worker del tenant solo puede autenticar contra su propia D1. Sesión por **cookie** (`getSession` por header), `basePath /api/auth`.

**Registro público desactivado.** `disableSignUp: true` en las rutas montadas. Los usuarios se provisionan: `POST /api/admin/users` (solo `owner`) usa una instancia interna con signup permitido (`createAuth(env, { allowSignUp: true })`) y fija el rol después, en servidor. El seed de la demo hace lo mismo.

**Roles jerárquicos**: `readonly(0) < reception(1) < manager(2) < owner(3)`. Middleware `requireRole(min)` sobre `/api/admin/*`:
- `readonly` → todos los GET.
- `reception` → mutaciones operativas (reservas, solicitudes, reasignación).
- `manager` → tarifas y ajustes.
- `owner` → gestión de usuarios.

**Rutas privadas** (`routes/admin.ts`, montadas en `/api/admin`):
- `GET /planning?from&to` — unidades + reservas + bloqueos que solapan el rango. El SELECT del tape chart (Fase 6 solo pinta).
- `GET /bookings` (filtros estado/rango/código, paginado) · `GET /bookings/:id` (con huéspedes y pagos) · `POST /bookings` (alta manual `phone|walkin`; mismo motor y mismo precio-en-servidor que la pública, extraído a `createBooking()` compartido) · `PATCH /bookings/:id` con **acciones tipadas** (union discriminada Zod): `confirm | cancel | no_show | complete | reassign | note`. Transiciones validadas; `reassign` comprueba tipo y solape. Cancelar libera inventario en el mismo acto (invariante 4, con test).
- `GET /enquiries?status` · `PATCH /enquiries/:id` (transición de estado del embudo).
- `GET /rates` · `PUT /rates/:id` — actualizar tarifa jamás toca reservas (invariante 3, con test: el desglose guardado es la verdad).
- `GET /reports?from&to` — ocupación por tipo (noches ocupadas/noches·unidad), ingresos, llegadas/salidas.
- `GET|PATCH /settings` — fila `tenants` (nombre, tz, moneda, locales, módulos).
- Toda mutación escribe `audit_log` (helper `audit()`).

**Secreto**: `AUTH_SECRET` por Worker (wrangler secret); fallback dev/test documentado. Pendiente de Andreu en el deploy real.

## Alternativas descartadas

- Tabla `user` de Better Auth aparte + espejo en `users` — dos fuentes de verdad para el rol; sincronización es un bug esperando.
- JWT stateless — las sesiones revocables (echar a un empleado YA) valen más que ahorrarse un SELECT; D1 está al lado.
- Plugin `admin` de Better Auth — trae banning/impersonation que no necesitamos; la jerarquía de 4 roles es un `Record<Role, number>`.
- Permisos por endpoint en tabla — config sobre convención a este tamaño es ruido; la jerarquía cubre los 4 roles reales.
