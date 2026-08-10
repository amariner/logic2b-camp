# 0002 — Modelo de datos

- **Fecha**: 2026-07-17
- **Fase**: 1 · Modelo de datos
- **Estado**: aceptado (OK de continuidad de Andreu: "continúa con el proyecto"; revisable)

## Contexto

Implementar el esquema de §4 del super prompt en Drizzle (D1/SQLite), con seed demo realista (Camping Cala Sereno). Cada instancia tiene su propia D1: el esquema es el de UNA instancia. Restricciones clave: dinero en céntimos enteros, `price_breakdown` auditable, fechas `YYYY-MM-DD` from-inclusive/to-exclusive, `enquiries` de primera clase.

## Decisión

**Convenciones transversales**

- IDs: `text` (prefijo por entidad + aleatorio, p.ej. `bkg_x7f3…`), generados en aplicación. D1 no tiene secuencias fiables y los IDs opacos viajan bien por URL/API.
- Dinero: `integer` céntimos, sufijo `_cents`. Fechas de estancia: `text` ISO `YYYY-MM-DD`; timestamps: `text` ISO 8601 UTC.
- JSON: columnas `text` con `{ mode: 'json' }` y `$type<>` para tipado estricto (occupancy, price_breakdown, conditions, diff…).
- `tenant_id` **se mantiene** en las tablas aunque cada camping tenga su D1 (así lo fija §4): documenta la pertenencia en backups/exports y no es la barrera de aislamiento (esa es el binding).

**Las 16 tablas de §4, sin desvíos**: `tenants`, `seasons_calendar`, `unit_types`, `units`, `rate_plans`, `rate_rules`, `extras`, `inventory_blocks`, `enquiries`, `bookings`, `guests`, `booking_guests`, `payments`, `notifications_log`, `users`, `audit_log`.

Decisiones de detalle:

- `unit_types.kind`: `'pitch' | 'lodging'` — parcela y alojamiento en la MISMA tabla, diferenciadas por kind + `features` JSON. No se duplican tablas.
- `unit_type` es lo reservable; `unit` lo asignable → `bookings.unit_id` es **nullable** (reserva sin asignar es estado válido), `bookings.unit_type_id` no.
- `enquiries` tabla propia: sin FK a unidad, fechas opcionales, estados `new|contacted|quoted|converted|lost`, `converted_booking_id` nullable. **Por qué no es un booking en borrador**: no bloquea inventario, no tiene precio cerrado ni unidad; sus invariantes (ninguna) difieren de las de booking (solape, sumas de pagos). Modelarlo como booking obligaría a llenar el motor de `if draft`.
- `bookings.status`: `pending|confirmed|cancelled|no_show|completed`; `channel`: `web|phone|walkin|import`. `price_breakdown` JSON obligatorio.
- `payments.status`: `pending|succeeded|failed|refunded`; `amount_cents` con signo (reembolso = negativo) para que `sum(amount) == paid_cents` sea literal.
- Índices para disponibilidad (las consultas que sufren): `bookings(unit_type_id, date_from, date_to)`, `bookings(unit_id, date_from, date_to)`, `inventory_blocks(unit_id, date_from, date_to)` y `(unit_type_id, …)`, `units(unit_type_id)`, `rate_plans(unit_type_id, season_id)`, `seasons_calendar(date_from, date_to)`, `enquiries(status)`, únicos en `bookings.code`, `units.code`, `users.email`.

**Migraciones**: `drizzle-kit generate` → `packages/db/migrations/`. La 0000 (`meta`) se conserva; el esquema real es la 0001. `migrations_dir` apuntado desde los wrangler.jsonc.

**Seed demo** (Camping Cala Sereno, mediterráneo, ~83 unidades): generador TS **puro y determinista** en `tenants/demo/seed.ts` (fechas relativas a una fecha ancla parametrizable — prepara el reset nocturno de Fase 10) que emite `seed.sql`. Contenido: 60 parcelas en 4 tipos, 18 bungalows en 3 tipos, 5 glampings, 3 temporadas solapadas por prioridad, tarifas de mercado, 12 extras, ~40 reservas con casos límite (larga estancia, grupo, mascota, cancelada, no-show, sin asignar), 15 solicitudes en todos los estados. `tenants/demo` pasa a ser paquete workspace para poder testear el generador.

- **Tests del generador** (Vitest): conteos exigidos, cero solapes entre reservas activas por unidad, `sum(payments) == paid_cents` por reserva, breakdown suma = total.

**Comandos raíz**: `pnpm db:reset` (borra estado local + aplica migraciones a la D1 local demo) y `pnpm db:seed` (genera y ejecuta `seed.sql`), vía Wrangler `--local`. Se usa su persistencia predeterminada junto al `wrangler.jsonc`, de modo que `d1 execute`, `d1 export` y `wrangler dev` lean exactamente la misma base.

## Alternativas descartadas

- IDs autoincrement — frágiles en D1 y feos en API pública.
- Tablas separadas parcela/alojamiento — duplica FKs y consultas; `kind` + JSON cubre la variación.
- Enquiry como booking en borrador — prohibido por CLAUDE.md; invariantes distintas.
- Seed como SQL estático — no permite fechas relativas ni tests; el generador TS sí.
- Timestamps numéricos epoch — legibilidad en SQL directo vale más que los bytes.

## Consecuencias

- El planning se pinta de un `SELECT` sobre `units` × `bookings`/`inventory_blocks` con los índices anteriores.
- Fase 2 (motor puro) consumirá estos tipos exportados desde `@logic-camp/db/schema` sin tocar I/O.
- El generador determinista con fecha ancla deja casi resuelto el reset nocturno de la Fase 10.
