# 0007 — Flujo de reserva (Fase 5, sesiones 13–15)

- **Fecha**: 2026-07-19
- **Fase**: 5 · Flujo de reserva
- **Estado**: aceptado (2026-07-19 — Andreu delegó la validación en sesión: "válida tú lo que necesites, avanza el máximo"). Ajuste de implementación: en salida estática la gestión vive en `/reserva?code=…&email=…` (query, no segmento de ruta) — la URL sigue siendo el estado.

## Contexto

El mostrador ya busca disponibilidad real y muestra precios de servidor, pero el botón "Reservar" no existe: no hay camino de resultados → reserva confirmada. La Fase 5 construye ese funnel completo con estado en URL, bloqueo temporal de inventario y gestión posterior por código+email. El pago real es de la Fase 8: aquí se deja el hueco con `payments: 'none'` (confirmación directa), sin rastro de pasarela.

## Decisión

### 1. El funnel vive en `apps/web`, no en una SPA nueva

Páginas Astro bajo `/reservar` con **una isla React por paso** (mismo patrón que el mostrador: import dinámico, el nivel 1/2 no lo arrastra en el bundle — verificable en build). Mismo dominio, misma sesión de caché, cero framework nuevo. El dashboard (Fase 6) seguirá siendo la SPA React; el funnel es parte de la web pública.

**Pasos** (cada uno una URL):
1. `/reservar?from&to&adults&children[&pets]` — resultados (reusa `GET /availability`)
2. `/reservar/{tipo}?from&to&…` — detalle del tipo + desglose en vivo (`POST /quote`)
3. `+ &extras=ext_a,ext_b&elec=1` — extras y opciones (mismo paso 2, el desglose se recalcula en servidor a cada cambio)
4. `/reservar/{tipo}/titular?…` — datos del titular + aceptación de condiciones. Al entrar aquí se crea el **hold de 15 min** (contador visible)
5. Confirmación → `POST /api/bookings` (con `Idempotency-Key` = id del hold) → `/reserva/{code}` con desglose imprimible

### 2. Estado en URL, precio SIEMPRE en servidor

La URL es el estado completo del funnel: compartible, recuperable tras cerrar el navegador, medible (GA4/Cloudflare Analytics por paso). El cliente jamás envía ni almacena precios; cada paso re-cotiza contra la API (regla existente de la Fase 3). Recargar cualquier paso reconstruye todo desde la URL.

### 3. Bloqueo temporal: tabla `inventory_holds` (migración 0002)

```
inventory_holds: id, tenant_id, unit_type_id, date_from, date_to,
                 occupancy JSON, expires_at, created_at
```

- **Hold por TIPO, no por unidad** — coherente con el dominio (se reserva el tipo; la unidad se asigna al confirmar con `assignUnit`, como hasta ahora).
- Un hold vivo **resta 1** a `availableUnits` de su tipo en el cálculo de disponibilidad. El motor (`packages/core`) recibe los holds como parámetro nuevo opcional `holds` de `searchAvailability` — puro, con sus tests ANTES de implementar (invariante 1 se re-verifica con holds en juego).
- **Expiración perezosa + cron**: las queries descartan `expires_at < now` (nadie ve un hold muerto aunque el cron no haya pasado), y un **Cron Trigger** cada 15 min purga filas caducadas (primera pieza de cron del proyecto; el reset nocturno de Fase 10 reusará el patrón).
- `POST /api/holds` crea (validando disponibilidad) → `{ holdId, expiresAt }`; `DELETE /api/holds/:id` libera al abandonar. `POST /api/bookings` acepta `holdId`, verifica vigencia y **consume el hold en el mismo batch atómico** que crea la reserva (invariante 4 aplicado a holds: liberar y reservar son una transacción).
- Sin hold también se puede reservar (el hold protege la UX del funnel, no es requisito de la API).

### 4. Gestión por código+email en la web pública

`/reserva/{code}` (email por query o formulario): ver desglose completo e imprimible, **cancelar** con el reembolso calculado por `calculateCancellationRefund` (confirmación en dos pasos, muestra el importe antes), y **modificar fechas/extras** como re-cotización servidor: solo se aplica si hay disponibilidad y el precio se recalcula entero (invariante 3: la reserva guarda su nuevo desglose auditable; jamás se edita una cifra suelta). Endpoints nuevos: `POST /api/bookings/:code/cancel` y `POST /api/bookings/:code/modify` (ambos código+email, mismas reglas que el GET existente).

### 5. E2E Playwright (primera vez en el repo)

`apps/web/e2e/` contra `wrangler dev` + D1 local sembrada (mismo arranque que `.claude/launch.json`). **Camino feliz**: buscar → elegir → extras → titular → confirmar → el booking aparece en `GET /api/admin/planning` (el "tiempo real" del criterio de fase se valida contra el SELECT del planning; la pantalla llegará en Fase 6). **Tres infelices**: (a) el último hueco se agota entre el paso 1 y confirmar → 409 y vuelta a resultados con mensaje; (b) hold caducado al confirmar → re-valida y avisa sin perder los datos del titular; (c) estancia inválida (mínima de alta / llegada no-sábado) → errores i18n del motor en el paso 2.

### 6. Reparto en sesiones

- **13**: migración `inventory_holds` + motor con holds (tests primero) + API holds + páso 1–2 del funnel (resultados + detalle con desglose)
- **14**: extras + titular + confirmación con hold + página `/reserva/{code}` (ver + cancelar + modificar)
- **15**: E2E completo, contador de hold visible, estados de error pulidos, textos en 6 idiomas, `/check` verde y deploy demo

## Consecuencias

- Nueva tabla y primer Cron Trigger; el core gana un parámetro opcional sin romper API existente (aditivo, como `opensOn`).
- El funnel añade ~1 isla React por paso al bundle del nivel 3; los niveles 1–2 quedan idénticos (verificación TIER=1 en build se amplía a las rutas `/reservar`).
- "Modificar" en la web pública queda limitado a fechas/extras re-cotizados; cambios de tipo o excepciones manuales son del dashboard (Fase 6) — evita duplicar lógica de recepción.
- Los textos nuevos del funnel entran en los 6 JSON de contenido (bloque `reservar`), sin tocar componentes.

## Alternativas descartadas

- **Hold por unidad concreta**: fija la asignación demasiado pronto y pelea con la reasignación libre del planning (ventaja competitiva del dominio). Descartado.
- **Estado del funnel en localStorage/cookie**: no compartible, no recuperable entre dispositivos, invisible para analítica. La URL ya es el estado.
- **Expiración de holds solo por cron**: ventanas de sobreventa entre pasadas. La expiración perezosa en query la elimina; el cron solo limpia.
- **SPA separada para reservar**: framework duplicado, SEO peor en los pasos indexables y bundle mayor para el nivel 3. El patrón isla-por-paso ya está probado con el mostrador.
