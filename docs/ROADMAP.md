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
| 0 · Fundaciones | ✅ Hecho | 2026-07-18 | Scaffold completo (ADR 0001). `wrangler login` OK, D1 demo creada, Worker desplegado y **`camp.logic2b.com/api/health` responde en producción**. Pendiente menor (no bloquea): secrets `CLOUDFLARE_API_TOKEN`/`ACCOUNT_ID` + `DEPLOY_DEMO_ENABLED=true` en GitHub para CI |
| 1 · Modelo de datos | ✅ Hecho | 2026-07-17 | 16 tablas Drizzle (ADR 0002), seed Cala Sereno (83 uds, 40 reservas, 15 solicitudes) determinista con tests de invariantes, `db:reset`/`db:seed` operativos, D1 remota migrada+sembrada |
| 2 · Motor ★ | ✅ Hecho | 2026-07-17 | `packages/core` puro (ADR 0003): availability con reasignación implícita, quote por tramos con desglose, validateStay acumulativo, assignUnit menos-huecos, reglas, tasa por política, cancelación por tramos, registro de extensiones. 47 tests (7 casos límite incluidos) |
| 3 · API | ✅ Hecho | 2026-07-18 | Sesión 1 (ADR 0004): API pública con precio en servidor, idempotencia, rate limit, RPC tipado. Sesión 2 (ADR 0005): Better Auth sobre la tabla `users` (D1 del binding), roles jerárquicos, /api/admin (planning, bookings con acciones tipadas, enquiries, rates, reports, settings, users), audit_log, alta manual compartiendo motor. 24 tests integración D1 real: fuga cruzada de datos Y de sesión A↛B, invariantes 3 y 4. Desplegado en la demo con login verificado en producción |
| 4 · Web pública + niveles | 🟨 Sesión 2/3 hecha | 2026-07-19 | Sesión 2: TODAS las páginas (alojamientos+detalle, instalaciones, entorno, tarifas, contacto, blog, 404) en 6 idiomas (109 páginas), datos de fichas/tarifas desde la misma fuente que la D1, mostrador con skeleton+cerrado real+deep-link, sitemap/robots/favicon/OG, imágenes AVIF/WebP responsive, Workers Assets configurado (un deploy = web+API). Pendiente sesión 3: redeploy con credenciales, fotos Higgsfield descargadas, Lighthouse ≥95 en producción |
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

1. ~~Git/GitHub~~ → resuelto 2026-07-18: repo `github.com/amariner/logic2b-camp`, rama `main`, push operativo.
2. ~~`wrangler login`~~ → resuelto 2026-07-18: sesión OAuth con permisos completos; DNS de `camp` resolviendo (health y login responden en producción). Queda por verificar: Resend (dominio + API key) para Fase 7 y secrets de GitHub para CI.
3. ~~Confirmar demo~~ → confirmado: la demo ES el tenant `demo` (Cala Sereno).
4. Indexación de la demo: ¿`camp.logic2b.com` se indexa en Google (es la herramienta de ventas) o `noindex` hasta que esté pulida? Propuesta: `noindex` hasta cerrar Fase 10, luego indexar. Decidir con Andreu.

## Pulido de la demo (camp.logic2b.com) — lista de remates

> La demo es LA herramienta de ventas (§0). Esta lista concentra lo que la deja "de premio", cada punto asignado a su fase. Criterio: un director de camping debe poder recorrerla en el móvil desde el primer email comercial y pensar "esto es más serio que mi web actual".

**Fase 4 (sesión 3 = lo no tachado):**
- [x] Servir la web Astro desde `camp.logic2b.com/` con **Workers Assets en el mismo Worker del API**. Un deploy = web + API. *(config y CI listos; falta el redeploy con credenciales)*
- [x] Páginas restantes: alojamientos (+detalle por tipo con galería y ficha técnica desde la DB), instalaciones, entorno, tarifas (tabla por temporada desde `rate_plans`), contacto, blog cableado.
- [ ] 2ª tanda de fotos Higgsfield: **6 generadas** (interiores, piscina, restaurante, premium, autocaravana — IDs en PROGRESS) pendientes de descargar en local; faltan baños y 2ª foto por tipo si se quiere más densidad. OG image ya generada desde el héroe.
- [x] Idiomas ca/fr/de/nl completos + selector accesible; sitemap.xml y robots.txt por tenant.
- [x] Imágenes responsive (`srcset` AVIF/WebP por tamaño) y `preload` del héroe → **Lighthouse ≥95 verificado en local contra el Worker real** (home móvil 96, home/detalle/tarifas 100 en todo; fuentes subseteadas). Falta solo re-medir en producción tras el deploy.
- [x] Favicon + touch icons con la marca del tenant; página 404 propia con foto y enlace al inicio.
- [x] Mostrador: skeleton de carga, mensaje "cerrado" con la fecha REAL de apertura servida por la API desde `seasons_calendar`, deep-link de búsqueda (`/?from=…&to=…`) bidireccional.

**Fase 5 (hace la demo "completa" de verdad):**
- [ ] Funnel de reserva enlazado desde el botón "Reservar" de cada resultado del mostrador, con estado en URL y bloqueo temporal 15 min.
- [ ] Página de confirmación con desglose imprimible + gestión por código+email (ya existe el endpoint).

**Fase 6:**
- [ ] El planning con los datos del seed debe verse ESPECTACULAR en la primera demo: 83 unidades × agosto lleno, colores por estado, bloqueos visibles.

**Fase 10 (remates de demo puros):**
- [ ] Reset nocturno por cron con **fechas relativas a hoy** (jamás una demo con reservas caducadas).
- [ ] Acceso al dashboard demo sin registro (readonly con excepciones para tocar el planning).
- [ ] Conmutador de nivel 1/3 en vivo en la misma URL (enseñar Camp Web al pequeño, Camp Reservas al grande).
- [ ] Banner discreto "entorno de demostración" + datos con historia (nombres plausibles, solicitudes en 4 idiomas, una reserva de grupo, un no-show).
- [ ] `DEMO-SCRIPT.md`: guion de 12 minutos con el recorrido exacto de venta.
- [ ] Cloudflare Web Analytics en la demo: saber qué páginas mira un prospecto tras el email comercial.

**Transversal (cada sesión que toque la web):**
- [ ] Accesibilidad AA real: foco visible, contraste verificado, navegación por teclado del mostrador, `prefers-reduced-motion`.
- [ ] Probar SIEMPRE a 1366px y en móvil 375px antes de cerrar sesión.

## Cómo retomar una sesión

1. `cd /Users/andreumariner/Desktop/proyectos/logic-camp`
2. Leer `PROGRESS.md`, `CLAUDE.md` y este ROADMAP.
3. Continuar la primera fase en ⬜/🟨: ADR primero, una fase por sesión, `/check` verde, actualizar esta tabla y `PROGRESS.md`, cerrar con `/session-close`.

## Orden de ataque (~6h/semana)

- **Semanas 1–6** → Fases 0–3 + Fase 4 parcial (héroe + widget + un tipo de alojamiento) = **demo que vende**. ← estamos aquí (adelantados: Fases 0–3 completas y home nivel 3 funcionando)
- **Semanas 7–10** → Fase 4 completa + Fase 9 en nivel 1 = **primer camping real en producción**.
- **Semanas 11+** → Fases 5–8, cuando el primer camping pida el motor.
