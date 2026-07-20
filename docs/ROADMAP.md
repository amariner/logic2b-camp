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
| 5 · Flujo de reserva | ✅ Hecho | 2026-07-19 | ADR 0007: funnel con estado en URL (resultados→detalle+extras con desglose vivo→titular con hold 15 min y contador→confirmación), `inventory_holds` por tipo con expiración perezosa + primer cron, gestión código+email (ver/cancelar con reembolso/modificar re-cotizado), 6 idiomas, TIER=1 sin funnel ni islas. E2E Playwright 4/4 (feliz + 3 infelices) contra el Worker real; la reserva aparece en /api/admin/planning |
| 6 · Dashboard | ✅ Hecho (9 pantallas) | 2026-07-19 | ADR 0008: SPA en /admin/ del mismo Worker (hash history, cookie compartida), login Better Auth, planning v1 en lectura — filas virtualizadas, sticky, colores por estado con tokens, bloqueos, bandeja sin asignar, zoom 7/31/92 días. Sesión 2: DnD de reasignación con pointer events, optimista+rollback en 409, teclado ↑/↓. Sesión 3: ficha de reserva en panel lateral (click/Enter/bandeja) — estancia, titular, desglose auditable, pagos, notas editables y acciones tipadas por estado (confirm/cancel con doble confirmación/no_show/complete), verificado contra el Worker con 0 errores JS. Sesión 4: modo lite — bandeja de solicitudes (filtros con recuento, detalle expandible, siguiente-paso auditado) y llegadas/salidas del día (pendiente de cobro a la vista, ficha desde la fila); API con arrivalsOn/departuresOn, unitCode+leadName en listas y /catalog (34 tests). Sesión 5: lista de reservas con búsqueda/filtro/paginación, alta manual con cotización en vivo del servidor e Idempotency-Key, inventario con baja/alta de servicio (PATCH units, auditado) y tarifas editables en línea por temporada (35 tests API). Sesión 6 (cierre): clientes con búsqueda e historial→ficha, informes (tiles + ocupación por tipo con medidores), ajustes editables auditados; guests API con agregados por página (36 tests). FASE COMPLETA |
| 7 · Notificaciones | ✅ Hecho (v1) | 2026-07-19 | ADR 0010: packages/notifications puro (plantillas 6 idiomas testeadas, drivers resend/noop), notify.ts con notifications_log (sent/failed/disabled), 4 eventos enganchados (solicitud×2, confirmación web+manual, cancelación web+dashboard), on/off por evento desde Ajustes sin deploy, waitUntil (Queues en BACKLOG). Envío real pendiente solo de RESEND_API_KEY + dominio verificado |
| 8 · Pagos | ✅ Hecho (v1) | 2026-07-19 | ADR 0011: `packages/payments` puro (interfaz `PaymentProvider`, adaptadores stripe/redsys/none), modos v1 `none`/`deposit`/`full` (`bond`/fianza vía pasarela deferido a BACKLOG), solo canal web pasa por la pasarela. DES/3DES propio para la firma de Redsys (Workers no lo soporta nativo) — 500 tests cruzados contra `node:crypto` en batch aleatorio. Booking nace `pending` cuando el modo exige pago y confirma por webhook idempotente (reutiliza `meta`, sin tabla nueva); `booking_confirmed` se dispara en el momento real de la confirmación. Reembolsos reales (no solo el email) en cancelación web y de dashboard, más `record_payment`/`refund` tipados en el panel. 8 tests de integración de pagos + 3 nuevos en admin (49 en total la suite privada). Demo con `payments:{provider:'stripe', mode:'none'}` hasta tener credenciales reales (mismo criterio que Resend en Fase 7) |
| 9 · Instancias + asistente | 🟨 Parcial | 2026-07-19 | ADR 0012 (diseño aceptado, implementación parcial). Sesión 1: `packages/config` con `TenantConfig` (tasa+cancelación, con test) sustituye las constantes `TAX_POLICY`/`CANCEL_POLICY` duplicadas en `public.ts`/`admin.ts`; `tenants/_template/` completo y funcional; `docs/ONBOARDING.md` primer borrador. Sesión 21 (ADR 0012 §7): `packages/cli` — `pnpm new:camping <slug> --name --domain [--zone] [--address]` genera `tenants/{slug}/` desde `_template` con los tokens de identidad sustituidos (17 tests), imprime el plan de infra (`infraPlan()`, puro) y solo lo EJECUTA con `--apply` + `LOGIC_CAMP_ALLOW_INFRA=1` (doble candado, nunca invocado contra la cuenta real). Verificado con un tenant de prueba real (`smoke-test`, typecheck+lint limpios, borrado después). Registro de extensiones (Fase 2, sin usar hasta hoy) sigue diseñado pero sin conectar — no hay todavía ningún `custom/` real que lo necesite. Crear un tenant de prueba REAL en Cloudflare y verificar `--apply` contra la cuenta: bloqueado por credenciales/mandato, no por código — es lo único que queda para cerrar la fase |
| 10 · Modo demo + ui.logic2b.com | 🟨 Parcial | 2026-07-19 | ADR 0013 (sesión 25): reset nocturno + conmutador de nivel 1/3 + banner de demo, verificados contra el Worker real. Quedan: acceso readonly al dashboard sin registro (alcance sin decidir), Cloudflare Web Analytics (credenciales), `ui.logic2b.com`/Storybook (su propio objetivo de fase, paquete nuevo entero) |
| 11 · Endurecimiento + 1er cliente | ⬜ Pendiente | | |
| 12 · Camp Motor | 🚫 No construir | | Hasta que alguien lo pague |

## Frente B — Marca Logic2B, sitio de producto y documentación

> **Añadido 2026-07-19** (sesión con Andreu presente). Las fases 0–12 de arriba son el **Frente A: el producto para el camping** (la web del tenant + el motor + el gestor). Este **Frente B** es lo que hasta ahora faltaba: la **marca Logic2B** aplicada al producto, la **web comercial que vende Logic Camp** a un director de camping, y la **documentación**. No renumera el Frente A: corre en paralelo. Contrato visual completo en [`docs/BRAND.md`](BRAND.md).
>
> **El malentendido que corrige:** hasta hoy "la herramienta de ventas" era `camp.logic2b.com`, que en realidad es la **demo de un camping ficticio** (Cala Sereno) — enseña *cómo queda la web de un cliente*, no *qué es Logic Camp ni por qué comprarlo*. Falta el equivalente a la landing de `ecom.logic2b.com`: un sitio de producto dirigido al **comprador** (dueño/CEO de camping), que explique web + gestor y enlace demo, precios/niveles y documentación.
>
> Regla del proyecto que sigue vigente: **ADR antes de código, una fase por sesión, `/check` verde**. Cada fase B abre con su ADR.

| Fase | Nombre | Objetivo | Hecho cuando |
|---|---|---|---|
| **B0** | Fundación del DS Logic2B | Poblar `packages/ui` (hoy vacío) con shadcn/ui: tokens oklch de `BRAND.md` §4, radios §5, fuentes §3 (Inter Variable + Space Grotesk self-hosted), isotipo. Modo claro/oscuro. Sin rediseñar nada todavía: solo el DS disponible. | `packages/ui` exporta primitivos tipados + tokens; un componente de muestra se pinta con la marca; `pnpm check` verde |
| **B1** | Dashboard sobre Logic2B UI | Migrar `apps/dashboard` del look camping (`.lc-*`, paleta pino/arena, radius 2px) a los componentes/tokens del DS. Sidebar agrupada (Overview/Planning/Account/Support), isotipo en el header, radius 10px. El **planning** conserva color por estado pero derivado de tokens del DS. | El gestor se lee como "producto Logic2B"; 0 hex sueltos; densidad y velocidad intactas; usable a 1366px y móvil; foco AA |
| **B2** | Web pública: estructura Logic2B + marca discreta | `apps/web` adopta la ESTRUCTURA del DS (fuente base, ritmo de bloques, patrón de header, escala de radios) **manteniendo la identidad mediterránea del tenant** (ADR 0006). Isotipo discreto "powered by Logic2B" en el pie, en 6 idiomas. | La web sigue siendo del camping pero comparte esqueleto con el producto; Lighthouse ≥95 se mantiene |
| **B3** | Landing de producto (venta al CEO) | Sitio comercial nuevo que vende Logic Camp al dueño de camping: qué es, los 4 niveles (`TIERS.md`) como escalera de precio, web + gestor, el planning como pieza estrella, enlace a la demo viva (`camp.logic2b.com`), captación de contacto/solicitud de demo. 100% marca Logic2B. Multi-idioma. | Un director de camping entiende la propuesta y pide demo sin llamada previa; enlaza demo + docs; SEO/OG propios |
| **B4** | Documentación de producto | Docs de Logic Camp con layout del DS: guía de la recepcionista (operar el gestor), guía del dueño (niveles, qué incluye cada uno), y ficha técnica para el "informático de confianza". Reutiliza/alinea con `FUNCIONALIDADES.md` y `ONBOARDING.md`. | Un cliente resuelve dudas de uso sin escribir a soporte; enlazada desde landing y dashboard |

**Estado del Frente B** (2026-07-20): **B0-lite + B3 + B1 HECHOS y en vivo** (ADR 0016 y 0017 aceptados). `packages/ui` = DS real (tema/tokens/isotipo + componentes React shadcn); `apps/site` con la landing (es/en/ca) en `camp.logic2b.com/`; demo en `/demo/`; `POST /api/leads`. **B1**: dashboard reskinneado a Logic2B UI — sidebar agrupada plegable con isotipo, tokens/fuentes del DS, planning con colores del mapa aprobado; verificado en vivo (login, sidebar, plegado, 1366px, foco AA). `pnpm check` verde (41/41). Pendientes: **B2** (estructura Logic2B en la web de tenant), **B4** (documentación) — cada uno con su ADR. Remates en BACKLOG (rename literal de tokens del dashboard, off-canvas móvil de la sidebar, OG image, capturas reales del planning, fr/de/nl, E2E del funnel bajo `/demo/`).

### Detalle por fase (checklists — se afinan en cada ADR)

**B0 · Fundación del DS Logic2B**
- [ ] ADR de fase: alcance del DS, qué primitivos shadcn se copian primero, estrategia claro/oscuro, cómo un tenant tiñe un acento sobre el neutro (`BRAND.md` §4 nota).
- [ ] `packages/ui`: tokens `:root` + `.dark` de `BRAND.md` §4–§5 en un `theme.css` único, reexportado.
- [ ] Fuentes self-hosted subsetadas: Inter Variable + Space Grotesk (`BRAND.md` §3), sin CDN.
- [ ] Isotipo `docs/brand/logo-mark.svg` → componente/asset del DS (`currentColor`).
- [ ] Primitivos base: Button (primary/outline/secondary/ghost), Card, Badge, Input, Label, Select. Con test de render.
- [ ] Decidir Storybook: `ui.logic2b.com` es el DS de Logic2B **ya existente** (externo); el Storybook de camp sigue siendo Fase 10 del Frente A — no adelantar aquí salvo que se decida fusionar. (Ver decisión pendiente B-iii.)

**B1 · Dashboard sobre Logic2B UI**
- [ ] ADR de fase: mapa `.lc-*` → componentes del DS; qué se conserva del planning; cómo entra el color por estado con tokens.
- [ ] Reemplazar `apps/dashboard/src/styles.css` (paleta camping) por consumo del DS; radius 10px; Inter Variable real.
- [ ] Shell: header con isotipo + sidebar agrupada (Overview/Planning/Account/Support) — `BRAND.md` §6.
- [ ] Migrar las 9–10 pantallas a Card/Badge/Input/Table del DS sin perder densidad ni velocidad.
- [ ] Planning (tape chart): barras y chips con tokens del DS, no hex sueltos; verificar rendimiento (300 uds × 90 días).
- [ ] AA: foco visible, contraste, teclado, `prefers-reduced-motion`; probar 1366px y 375px.

**B2 · Web pública: estructura Logic2B + marca discreta** — ✅ HECHO (ADR 0018, 2026-07-20)
- [x] ADR de fase (0018): "estructura sin reskin"; convergencia de fuentes cerrada (Clash Display tenant / Space Grotesk producto — `BRAND.md` §3).
- [x] Escala de radios derivada (base **4px** + `calc()`, como el DS pero firme) en `_template`+`demo`, expuesta a Tailwind; se propaga a toda la web por el token del tenant.
- [x] Ritmo de bloques tokenizado (`--spacing-section` / `py-section`) en el ritmo canónico (Home + secciones finales), cambio de valor cero.
- [x] Isotipo "powered by Logic2B" discreto en el pie (6 idiomas, `aria`/title localizado), SVG compartido sin runtime, enlazando a la landing (B3).
- [x] `pnpm check` verde; verificado visualmente contra el Worker real (home nivel 3/1, interior, pie con firma; 1366px y 375px; foco AA).
- [ ] Remate: Lighthouse ≥95 re-medido en producción (mismo bloqueo de credenciales/red que el resto de la demo — no se añaden fuentes ni JS, así que no debería moverse).

**B3 · Landing de producto (venta al CEO)**
- [ ] ADR de fase: dónde vive (dominio — decisión pendiente B-i), arquitectura (¿app nueva en el monorepo?, ¿Astro?), narrativa de venta, idiomas.
- [ ] Estructura: héroe (propuesta de valor), niveles/precios (`TIERS.md`), web+gestor, el planning como pieza estrella (captura o demo embebida), prueba social, FAQ, CTA "pedir demo".
- [ ] Enlace vivo a la demo (`camp.logic2b.com`) y a la documentación (B4).
- [ ] Formulario "pedir demo/contacto" → mismo canal que las `enquiries`/email (reutilizar infra existente).
- [ ] SEO/OG/hreflang propios; marca Logic2B (isotipo, Inter/Space Grotesk, tokens neutros).

**B4 · Documentación de producto**
- [ ] ADR de fase: audiencia y herramienta (decisión pendiente B-ii), estructura de secciones, idiomas.
- [ ] Guía recepcionista (operar el gestor, apoyada en `FUNCIONALIDADES.md`), guía dueño (niveles), ficha técnica.
- [ ] Layout de docs con marca Logic2B (alinear con el del DS de referencia si se decide reutilizar).
- [ ] Enlazada desde la landing (B3) y desde el dashboard (ayuda contextual).

### Decisiones pendientes del Frente B (bloquean sus ADR)

- ~~**B-i — Dominio/ubicación de la landing de producto.**~~ → **resuelto 2026-07-19**: la landing vive en la **raíz de `camp.logic2b.com/`** (vende Logic Camp al CEO); la **demo del camping ficticio** (Cala Sereno) se mueve a **`camp.logic2b.com/demo/`** y se enlaza desde la landing con "ver demo en vivo". Implica reconfigurar el routing del Worker demo: hoy `apps/web` (la web del tenant) se sirve en `/`; pasará a `/demo/*`, y `/` lo ocupa la landing de producto. Detalle de implementación en el ADR de B3.
- **B-ii — Documentación: audiencia y herramienta.** ¿Docs unificadas (dueño + recepcionista + técnica) o separadas? ¿Herramienta: páginas Astro propias, Starlight, o reutilizar el layout de docs de `ui.logic2b.com`? Idiomas de arranque.
- **B-iii — Relación con `ui.logic2b.com` / Storybook.** `ui.logic2b.com` ya existe como DS de Logic2B (externo a este repo). ¿`packages/ui` **consume** ese DS, lo **replica**, o el Storybook de camp (Fase 10 A) se **fusiona** con él? Afecta a B0 y a la Fase 10 del Frente A.
- **B-iv — Assets de marca que faltan.** Conseguir de Logic2B el **logotipo completo** (isotipo + palabra) y color(es) de marca si existen más allá del neutro. Hoy solo tenemos el isotipo monocromo. Ver `BRAND.md` §2.
- **B-v — Acento de tenant sobre el neutro.** ¿El dashboard de cada camping puede teñir `--primary`/`--ring` con un color del tenant, o se mantiene 100% neutro Logic2B? Ver `BRAND.md` §4.

## Decisiones tomadas

- 2026-07-19: **Deploy de la demo = MANUAL**, con un único comando `pnpm --filter @logic-camp/api deploy:demo` (ahora incluye `wrangler d1 migrations apply --remote` antes del deploy — el hueco que tumbó la demo el 2026-07-19). CI automático (GitHub Actions) **descartado a propósito**: la sesión OAuth de wrangler no puede crear un API Token (falta el scope `user:tokens`, verificado con 403/9109) y habría que pegar secrets en GitHub a mano. El workflow `deploy-demo.yml` sigue existiendo pero apagado (`DEPLOY_DEMO_ENABLED` sin poner). Si algún día se automatiza: crear token con `D1 Edit` + pegar secrets + añadir el paso de migraciones al YAML.
- 2026-07-19: Landing de producto en la **raíz de `camp.logic2b.com/`**; la demo del camping ficticio baja a `/demo/` (decisión B-i). Requiere reconfigurar el routing del Worker demo en B3.
- 2026-07-19: **Frente B abierto** (marca Logic2B + landing de producto + documentación), en paralelo a las 12 fases del Frente A. Contrato visual en `docs/BRAND.md` (extraído del CSS real de `ui.logic2b.com`). Split de marca: **producto (dashboard/landing/docs) = Logic2B; web de tenant = marca del camping** con isotipo discreto. Isotipo ya guardado en `docs/brand/logo-mark.svg`.
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
- [x] Funnel de reserva enlazado desde el botón "Reservar" de cada resultado del mostrador, con estado en URL y bloqueo temporal 15 min.
- [x] Página de confirmación con desglose imprimible + gestión por código+email (ver, cancelar con reembolso a la vista, cambiar fechas).

**Fase 6:**
- [ ] El planning con los datos del seed debe verse ESPECTACULAR en la primera demo: 83 unidades × agosto lleno, colores por estado, bloqueos visibles.

**Adelantados (hechos fuera de su fase):**
- [x] **Selector de temas en vivo** (ADR 0009, sesión 14): 4 estilos (pinada/mar/garriga/noche) para enseñar "tu marca, un fichero" delante del cliente. Demo-only tras `config.demoThemes`.
- [x] `docs/FUNCIONALIDADES.md`: guía comercial detallada de todas las funcionalidades (sesión 14) — mantener al día.

**Fase 10 (remates de demo puros):**
- [x] Reset nocturno por cron (ADR 0013, sesión 25): `tenants/demo/worker.ts` + `reset.ts`, wipe+reseed atómico (`db.batch`) contra el año en curso, cron `0 3 * * *` propio del tenant demo, verificado contra el Worker real (login+nota de prueba en una reserva → cron → vuelve al estado del seed). *Ancla sigue siendo mitad de temporada alta del año en curso, no "hoy" exacto — ver ADR 0013 §1 para el motivo.*
- [ ] Acceso al dashboard demo sin registro (readonly con excepciones para tocar el planning) — alcance sin decidir, ver ADR 0013 "qué queda fuera".
- [x] Conmutador de nivel 1/3 en vivo en la misma URL (ADR 0013, sesión 25): `config.demoTierSwitch`, ambos héroes en el HTML tras el flag, CSS puro (`[data-hero-nivel]` + `:root[data-nivel]`) decide cuál se ve, sin FOUC, sin segundo build. Verificado visualmente (capturas 1366px/375px + toggle).
- [x] Banner discreto "entorno de demostración" (ADR 0013, sesión 25): `config.isDemo`, franja fija en 6 idiomas, no empuja el resto del layout (`--lc-chrome-h` compensa el offset del header/sticky).
- [x] `DEMO-SCRIPT.md`: guion de 12 minutos con el recorrido exacto de venta — hecho 2026-07-19 (sesión 22, sin esperar al resto de Fase 10: es puramente documental, no depende de código pendiente).
- [ ] Cloudflare Web Analytics en la demo: saber qué páginas mira un prospecto tras el email comercial — bloqueado por credenciales reales, ver ADR 0013.
- [ ] Datos con historia (nombres plausibles, solicitudes en varios idiomas, una reserva de grupo, un no-show) — el seed de la Fase 1 YA los tiene (40 reservas con casos límite, 15 solicitudes en 5 estados); pendiente solo si Andreu quiere ampliarlos, no bloquea el reset nocturno.

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
