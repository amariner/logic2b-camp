# 0004 — API pública (Fase 3, sesión 1 de 2)

- **Fecha**: 2026-07-17
- **Fase**: 3 · API
- **Estado**: aceptado (OK de continuidad de Andreu; revisable)

## Contexto

La Fase 3 abarca dos sesiones. Esta primera cubre la **API pública** end-to-end con tests de integración sobre D1 local y el test de fuga cruzada. La segunda cubrirá Better Auth + endpoints privados (CRUD, /planning, /reports, /settings). Así cada sesión mantiene un objetivo.

## Decisión

**Aislamiento por binding, no por host-routing interno.** Cada tenant ES su propio Worker con su binding `DB` (Fase 0). El "middleware que resuelve tenant por host y selecciona binding" se materializa así: el host enruta al Worker del tenant (rutas de Cloudflare), y dentro del Worker el middleware `tenant` construye el contexto `{ slug, db }` desde `env`. No existe código capaz de abrir la D1 de otro tenant: la fuga cruzada es imposible por diseño y el test lo demuestra instanciando la app con dos entornos (DB y DB_B) y verificando que lo escrito en A no es visible desde B.

**Estructura** (`apps/api/src`):
- `schemas.ts` — Zod de entrada/salida compartidos (fuente de tipos del cliente RPC).
- `tenant.ts` — middleware de contexto (slug, db drizzle) + tipos de entorno.
- `data.ts` — loaders: filas Drizzle → tipos de dominio del core (el adaptador fino del ADR 0003).
- `routes/public.ts` — `GET /availability` · `POST /quote` · `POST /enquiries` · `POST /bookings` · `GET /bookings/:code`.
- `app.ts` — composición Hono; `index.ts` exporta el Worker y el tipo `AppType` para `hono/client`.

**Contratos clave**
- `GET /availability?from&to&adults&children&pets` → por tipo: estado (`available|unavailable|closed`), unidades libres y precio "desde" (quote de la ocupación pedida). `closed` distingue cierre de agotado.
- `POST /quote` → valida con `validateStay` (todos los errores, códigos i18n) y devuelve desglose completo + tasa turística según política del tenant.
- `POST /bookings` → revalida y **recalcula el precio en servidor** (el cliente jamás envía precios), comprueba disponibilidad, asigna unidad con `assignUnit` y escribe en un `batch` atómico (booking + pago inicial si procede). **Idempotencia**: header `Idempotency-Key`; la clave se guarda como fila `meta` (`idem:<key>` → booking id) en el mismo batch — la PK de `meta` convierte la repetición en conflicto y la respuesta repetida devuelve la reserva original.
- `POST /enquiries` → guarda SIEMPRE (todos los niveles); el email llega en Fase 7 vía hook `onEnquiryReceived`.
- `GET /bookings/:code?email=` → gestión sin cuenta: código + email del titular.
- Rate limiting: ventana fija en memoria por isolate + IP (`x-forwarded-for`), 60 req/min públicos. Suficiente v1; KV cuando haya datos de abuso real (anotado en BACKLOG).

**Tests de integración**: `@cloudflare/vitest-pool-workers` (runtime workerd real) con dos D1 locales (`DB`, `DB_B`) y `applyD1Migrations` en el setup desde `packages/db/migrations`. Cubren: disponibilidad (incl. cerrado), quote con desglose, enquiry, booking feliz + código único + idempotencia + conflicto de fechas, y **fuga cruzada A↛B**.

**Config de tenant en la API** (política de tasa, moneda, política de cancelación): por ahora del registro `tenants` + defaults; `TenantConfig` completo llega en Fase 9.

## Alternativas descartadas

- Un único Worker multi-tenant resolviendo binding por host — rompe el aislamiento por diseño de §0; prohibido.
- Idempotencia en tabla dedicada — `meta` ya da PK única y TTL no es necesario en v1.
- Rate limiting con KV desde ya — coste/complejidad sin evidencia de abuso; la interfaz del middleware lo permite después.
- Mock de D1 en tests — el pool de workers ejecuta D1 real local; mockear resta valor justo donde está el riesgo.

## Consecuencias

- El cliente RPC (`hono/client` + `AppType`) da tipos end-to-end a web y dashboard sin codegen.
- La sesión 2 de la fase añade auth y rutas privadas sobre esta misma estructura (`routes/admin.ts`).
- El flujo de reserva (Fase 5) ya tiene su backend público completo.
