# ROADMAP — 12 fases, ~28 sesiones

> **Documento de continuidad** (misma metodología que ecom.logic2b.com). Cada sesión de Claude Code debe:
> 1. Leer `PROGRESS.md`, `CLAUDE.md` y este fichero al empezar.
> 2. Actualizar la tabla "Estado de fases" al terminar, con fecha y notas.
> 3. Anotar decisiones tomadas y pendientes abajo. Cerrar con `/session-close`.

Regla: una sesión = una fase = un objetivo. No se pasa de fase sin `/check` en verde. ADR antes de código. Detalle completo y prompts de sesión en `LOGIC-CAMP-Super-Prompt.md` §9.

| Fase | Nombre | Sesiones | Objetivo | Hecho cuando |
|---|---|---|---|---|
| 0 | Fundaciones | 1–2 | Monorepo + tooling + CI + `/health` desplegable. Sin lógica ni UI. | `pnpm check` verde y `camp.logic2b.com/api/health` responde |
| 1 | Modelo de datos | 3–4 | Esquema §4 en Drizzle, `enquiries` de primera clase, seed demo Cala Sereno (~80 unidades, 40 reservas, 15 solicitudes) | `db:reset && db:seed` deja base consultable; el planning se pinta de un SELECT |
| 2 | **Motor ★** | 5–7 | `packages/core` puro (sin I/O): disponibilidad, quote con desglose, validación de estancia, asignación, reglas, tasa turística, cancelación. + registro de puntos de extensión | ≥40 tests verdes incluyendo los 7 casos límite de §9 |
| 3 | API | 8–9 | Hono: endpoints públicos y privados, Better Auth + roles, resolución de tenant por host → binding D1, Zod, rate limit, idempotencia | Tests de integración D1 local; test explícito de aislamiento A↛B |
| 4 | Web pública + niveles | 10–12 | Astro completa, widget en héroe (nivel 3), formulario→`enquiries`+Resend (todos los niveles), degradación por nivel, SEO/hreflang | Lighthouse ≥95; demo funciona en nivel 1 y nivel 3 |
| 5 | Flujo de reserva | 13–15 | Funnel completo con estado en URL, bloqueo temporal 15 min, gestión por código+email, E2E Playwright | Una reserva completa aparece en el planning en tiempo real |
| 6 | Dashboard | 16–20 | 10 pantallas; **planning (tape chart) = elemento firma**: 300 unidades × 90 días fluido, drag&drop. Modo lite = solicitudes + llegadas + calendario manual | Se opera un día completo del demo sin tocar la DB; lite arranca sin motor |
| 7 | Notificaciones | 21 | React Email 6 idiomas, Resend multidominio, Queues+Cron, `notifications_log`, ajustes por tenant | On/off por notificación sin deploy; nivel 1 solo usa las de solicitud |
| 8 | Pagos | 22–23 | `PaymentProvider` + stripe/redsys/none, modos (sin pago/señal/completo/fianza), webhooks idempotentes, reembolsos | `payments:'none'` deja el producto entero sin rastro de pasarela |
| 9 | Instancias + asistente | 24–26 | `TenantConfig`, resolución host→D1+KV, `_template/`, `custom/` operativo, `pnpm new:camping`, `/new-camping`, `ONBOARDING.md` | Un camping nuevo de cero en menos de una tarde, solo con el manual |
| 10 | Modo demo + ui.logic2b.com | 27 | Reset nocturno con fechas relativas, dashboard demo readonly, conmutador de nivel, Storybook, `DEMO-SCRIPT.md` | — |
| 11 | Endurecimiento + 1er cliente | 28+ | Auditoría de aislamiento, RGPD, backups, observabilidad, carga, legales | Primer camping real en producción + caso de estudio |
| 12 | Camp Motor | — | **NO CONSTRUIR HASTA QUE ALGUIEN LO PAGUE.** Declarado para la conversación comercial. | — |

## Estado de fases

| Fase | Estado | Fecha | Notas |
|---|---|---|---|
| Pre (sesión 1: documentación §1 BRIEF) | ✅ Hecho | 2026-07-17 | CLAUDE.md + docs + commands generados; dudas abiertas abajo |
| 0 · Fundaciones | 🟨 Casi hecho | 2026-07-17 | Scaffold completo, `pnpm check` verde (28/28). Pendiente SOLO: deploy real a camp.logic2b.com (falta `wrangler login` + D1 demo + secrets GitHub). ADR 0001 |
| 1 · Modelo de datos | ✅ Hecho | 2026-07-17 | 16 tablas Drizzle (ADR 0002), seed Cala Sereno (83 uds, 40 reservas, 15 solicitudes) determinista con tests de invariantes, `db:reset`/`db:seed` operativos, D1 remota migrada+sembrada |
| 2 · Motor ★ | ✅ Hecho | 2026-07-17 | `packages/core` puro (ADR 0003): availability con reasignación implícita, quote por tramos con desglose, validateStay acumulativo, assignUnit menos-huecos, reglas, tasa por política, cancelación por tramos, registro de extensiones. 47 tests (7 casos límite incluidos) |
| 3 · API | ✅ Hecho | 2026-07-18 | Sesión 1 (ADR 0004): API pública con precio en servidor, idempotencia, rate limit, RPC tipado. Sesión 2 (ADR 0005): Better Auth sobre la tabla `users` (D1 del binding), roles jerárquicos, /api/admin (planning, bookings con acciones tipadas, enquiries, rates, reports, settings, users), audit_log, alta manual compartiendo motor. 24 tests integración D1 real: fuga cruzada de datos Y de sesión A↛B, invariantes 3 y 4. Desplegado en la demo con login verificado en producción |
| 4 · Web pública + niveles | ⬜ Pendiente | | |
| 5 · Flujo de reserva | ⬜ Pendiente | | |
| 6 · Dashboard | ⬜ Pendiente | | |
| 7 · Notificaciones | ⬜ Pendiente | | |
| 8 · Pagos | ⬜ Pendiente | | |
| 9 · Instancias + asistente | ⬜ Pendiente | | |
| 10 · Modo demo + ui.logic2b.com | ⬜ Pendiente | | |
| 11 · Endurecimiento + 1er cliente | ⬜ Pendiente | | |
| 12 · Camp Motor | 🚫 No construir | | Hasta que alguien lo pague |

## Decisiones tomadas

- 2026-07-17: Metodología de continuidad alineada con ecom.logic2b.com — este ROADMAP es la fuente de verdad del estado de fases; `PROGRESS.md` lleva el diario de sesiones y el siguiente paso.
- 2026-07-17: Stack alineado con ecom donde procede (Cloudflare, Astro 5, Tailwind v4, Resend, TS estricto, Vitest, céntimos enteros); las diferencias (monorepo, Hono, Drizzle, React en dashboard, Better Auth) responden a que camp es SaaS multi-instancia con dashboard complejo.

## Decisiones pendientes (bloquean avance)

1. Git/GitHub: el directorio no es repo; el super prompt pide repo privado `logic-camp`. ¿`git init` aquí + remoto, o clonar y mover?
2. Prerrequisitos §5 sin verificar: nameservers logic2b.com en Cloudflare, Workers Paid, Resend verificado, `wrangler login`, token API con scopes.
3. Confirmar que la "demo" pedida = tenant `demo` (Cala Sereno) del roadmap, no un prototipo aparte.

## Cómo retomar una sesión

1. `cd /Users/es00500546/Desktop/Proyectos/camp.logic2b.com`
2. Leer `PROGRESS.md`, `CLAUDE.md` y este ROADMAP.
3. Continuar la primera fase en ⬜: ADR primero, una fase por sesión, `/check` verde, actualizar esta tabla y `PROGRESS.md`, cerrar con `/session-close`.

## Orden de ataque (~6h/semana)

- **Semanas 1–6** → Fases 0–3 + Fase 4 parcial (héroe + widget + un tipo de alojamiento) = **demo que vende**.
- **Semanas 7–10** → Fase 4 completa + Fase 9 en nivel 1 = **primer camping real en producción**.
- **Semanas 11+** → Fases 5–8, cuando el primer camping pida el motor.
