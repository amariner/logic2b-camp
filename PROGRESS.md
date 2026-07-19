# PROGRESS — Logic Camp

Diario de sesiones. Se actualiza al cerrar cada sesión con `/session-close`. La sesión siguiente empieza leyendo este fichero.

## Estado actual

- **Fase actual**: 9 🟨 PARCIAL (ver ADR 0012 — `TenantConfig`+`_template`+`ONBOARDING.md`+`packages/cli` hechos; solo queda el tenant de prueba real, bloqueado por credenciales de Cloudflare, no por código) · Siguiente: sesión con Andreu presente para el primer alta real con `--apply`, o remates de demo de Fase 10. Antes, en local: redeploy demo (`pnpm --filter @logic-camp/api deploy:demo`), descargar fotos Higgsfield (UUIDs completos en BACKLOG — mismo bloqueo de red que sesión 8), re-audit Lighthouse en producción.
- **Docs de cliente**: `docs/FUNCIONALIDADES.md` (sesión 14, al día con Fase 8 en sesión 19) — actualizar con cada funcionalidad nueva.
- **Último `/check`**: ✅ verde 2026-07-19 (38/38 tareas)
- **Repo**: https://github.com/amariner/logic2b-camp
- **Cloudflare**: login OK (en local). D1 `logic-camp-demo` migrada (0000+0001) y sembrada en remoto. Worker desplegado con `/api/*`; **pendiente redeploy** para activar la ruta nueva `camp.logic2b.com/*` con la web (esta sesión cloud no tiene credenciales — NO simulado).
- **Pendiente de Andreu (cierra Fase 0)**: registro DNS en zona logic2b.com: `AAAA camp → 100::` proxied. También: secrets `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` + var `DEPLOY_DEMO_ENABLED=true` en GitHub para el deploy automático de la demo.

## Sesiones

### Sesión 24 — 2026-07-19 · BACKLOG 8.x · Log de pagos en el dashboard

**Hecho** (continuación de la misma sesión cloud)
- **`GET /api/admin/payments`** (`provider`/`status` opcionales, paginado): a diferencia de `/notifications`, `payments.bookingId` es `NOT NULL` — un solo `innerJoin` con `bookings` basta, sin la resolución en dos pasos que sí hace falta cuando el destino es opcional. Sin migración: `payments.createdAt` ya existía desde el modelo de datos de la Fase 1.
- **`/admin/#/pagos`** (11ª pantalla del dashboard): dos filas de filtros (proveedor × estado), reutiliza literalmente el diccionario `pago.*` que ya existía para la ficha de reserva (Fase 8) — cero claves i18n nuevas para las etiquetas de proveedor/estado, solo las de la pantalla en sí. Importe con signo (reembolso en negativo, mismo criterio visual que la ficha).
- **1 test de integración nuevo** (`admin.test.ts`, suite en 51/51): alta manual + `record_payment`, filtra por `provider=manual&status=succeeded` y confirma que NO aparece al filtrar por `provider=stripe`. Atrapado y corregido en el propio desarrollo: las peticiones sin `cf-connecting-ip` propio compartían el "cubo" de rate-limit (`60/min`) del fichero entero de tests y tumbaban un test posterior con 429 — se les dio su propia cabecera de IP, mismo patrón que ya usaba el bloque "pagos (ADR 0011)".
- **Verificado en navegador contra el Worker real** (wrangler dev + D1 local sembrada): reserva por teléfono + cobro manual por curl → visible en la lista junto a los 24 pagos del seed, filtro "Manual" → 1 fila, 0 errores JS. D1 local restaurada después.
- `docs/FUNCIONALIDADES.md` §6.15, `docs/BACKLOG.md` al día
- **`pnpm check`**: ✅ verde (38/38)

**`/check`**: ✅ verde (38/38) · API 51/51

### Sesión 23 — 2026-07-19 · Fase 10 (adelantado) · `docs/DEMO-SCRIPT.md`

**Hecho** (continuación de la misma sesión cloud)
- `docs/DEMO-SCRIPT.md`: guion de venta de 12 minutos, minuto a minuto (mostrador → reserva completa con hold y reembolso previsto → multi-idioma+móvil → selector de temas explicado como atrezzo comercial, no feature del cliente → planning con DnD y ficha → modo lite → informes/clientes/log de notificaciones → el argumento de seguridad de D1 por camping → niveles y cierre), más variantes según interlocutor (camping pequeño escéptico / camping grande con Excel / interlocutor técnico) y qué NO enseñar todavía (cobro real, reenvío de notificaciones, reset nocturno) para no prometer de más.
- Grounded en datos reales del seed y sesiones anteriores (credenciales de demo verificadas por curl en la sesión 22, temas de ADR 0009, ancla de temporada de `tenants/demo/seed.ts`) — nada inventado.
- Adelantado de Fase 10 a propósito: es puro documento, no depende de ningún código pendiente de esa fase (reset nocturno, dashboard readonly, conmutador de nivel, Storybook) — mismo criterio que el selector de temas en la sesión 14.
- `docs/ROADMAP.md`: ítem de Fase 10 marcado hecho

**`/check`**: ✅ verde (38/38, sin cambios de código)

### Sesión 22 — 2026-07-19 · BACKLOG 7.x · Log de notificaciones en el dashboard

**Hecho** (continuación de la misma sesión cloud: "sigue perfilando... sin parar")
- **`notifications_log.created_at`**: columna nueva (nullable — como `sentAt`, las filas de antes de esta sesión no tienen fecha real que inventar), migración `0003_notifications-log-created-at.sql` generada con `drizzle-kit`. Sin ella no había forma de ordenar el log por recencia: los IDs son UUID aleatorios, no ordenables.
- **`GET /api/admin/notifications`** (`status` opcional, paginado): mismo patrón que `/guests` — dos consultas cortas para resolver el destino de la página pedida (código de reserva o contacto de solicitud), nunca un join N×M.
- **`/admin/#/notificaciones`**: pantalla nueva (10ª del dashboard), filtro por estado con chips (mismo lenguaje visual que Solicitudes), fecha, evento (i18n con `tDyn`, fallback al nombre técnico), destino, canal, intentos y el chip de estado con sus propios colores (`ntf-sent`/`ntf-queued`/`ntf-failed`/`ntf-disabled`). Nota visible en la propia pantalla explicando por qué todo aparece "desactivada" sin Resend configurado — no es un fallo, es el comportamiento correcto.
- **Deliberadamente NO hecho**: reenvío manual de fallidos (backlog original lo pedía junto a la pantalla). Sin `RESEND_API_KEY` real todo el tráfico de la demo cae en "desactivada", nunca en "fallida" — no hay ningún envío real que reenviar ni manera de verificar la función en el navegador contra el Worker real, que es como se verifica todo en este proyecto. Se queda en BACKLOG hasta que haya una cuenta Resend real con tráfico que falle de verdad.
- **1 test de integración nuevo** (`admin.test.ts`, suite en 50/50): crea una solicitud, confirma que queda en el log con el contacto resuelto y que el filtro por estado funciona.
- **Verificado en navegador contra el Worker real** (wrangler dev + D1 local sembrada): enquiry FR por curl → 2 filas visibles con el nombre del solicitante, filtro "Desactivada" → mismas 2 filas, 0 errores JS relacionados con la pantalla. Capturas en `/tmp` (no versionadas). D1 local restaurada a la seed limpia después.
- `docs/FUNCIONALIDADES.md` §6.14 y §8, `docs/BACKLOG.md` al día
- **`pnpm check`**: ✅ verde (38/38)

**`/check`**: ✅ verde (38/38) · API 50/50

### Sesión 21 — 2026-07-19 · Fase 9 (continuación) · `packages/cli` — `pnpm new:camping` (ADR 0012 §7)

**Hecho** (petición de Andreu en sesión cloud: "sigue perfilando... sin parar... con tu criterio cierra temas")
- **`packages/cli`**: implementada la parte pura de la Capa 1 del alta que ADR 0012 §5 dejó explícitamente declarada como segura de construir sin credenciales ("se puede escribir y testear su lógica de plantillas sin ejecutar un solo comando contra Cloudflare"):
  - `scaffold.ts` — `scaffoldTenant()` copia `tenants/_template` → `tenants/{slug}` sustituyendo los tokens de identidad (`__SLUG__`/`__NOMBRE_DEL_CAMPING__`/`__DOMINIO__`/`__ZONA__`/`__DIRECCION__` opcional) SOLO en `config.ts`/`seed.ts`/`wrangler.jsonc`/`package.json` — el resto (`content/*.json`, `custom/hooks.ts`, `data.ts`) se copia intacto porque su contenido es Capa 2 (interpretación del material real del cliente, no mecánica). Valida el slug (formato + reservados) y no sobrescribe un tenant existente. Genera un `README.md` de estado propio (no el instruccional de `_template`) y reporta qué `__TODO__` de contenido quedan y si falta el `database_id` real.
  - `plan.ts` — `infraPlan()` pura: los 8 pasos de infraestructura real (crear D1, migrar, sembrar, construir, desplegar, DNS) como datos, en el orden correcto que exigen sus dependencias.
  - `infra.ts` — `runInfraPlan()`, el único punto que puede tocar Cloudflare de verdad: doble candado deliberado, `--apply` en la CLI Y `LOGIC_CAMP_ALLOW_INFRA=1` en el entorno, ninguno basta solo. **No se ha invocado ni una vez contra la cuenta real** — sigue exactamente igual de bloqueado que antes de esta sesión, solo que ahora el código de la Capa 1 mecánica ya no hay que escribirlo a mano el día que haya credenciales.
  - `cli.ts` — `pnpm new:camping <slug> --name --domain [--zone] [--address] [--apply]`.
- **17 tests** contra el `_template` real del repo. Atrapado y arreglado un bug real durante el propio desarrollo: `walk()` seguía los symlinks de `node_modules` de pnpm (workspace) y arrastraba miles de ficheros del store (`5006 ficheros` en el primer smoke test) — arreglado excluyendo `node_modules`/`.turbo`/`dist`/`.wrangler`. También corregido un efecto colateral en `tenants/_template/wrangler.jsonc`: su comentario de cabecera citaba literalmente `__TODO__`/`__SLUG__` como texto documental, y la sustitución de tokens (ciega a propósito, sin parsear comentarios) lo dejaba con texto sin sentido en el tenant generado.
- **Verificado de extremo a extremo, no solo con tests**: `pnpm new:camping smoke-test --name "Camping Smoke Test" --domain smoketest.example.com --zone example.com` → 16 ficheros, plan de 8 pasos impreso, nada ejecutado sin `--apply`; `pnpm --filter @tenant/smoke-test typecheck && lint` limpios sobre el tenant generado; tenant de prueba borrado después, no queda en el repo.
- `docs/adr/0012-instancias-custom-asistente.md` §7 (addendum), `docs/ROADMAP.md` y `docs/BACKLOG.md` al día
- **`pnpm check`**: ✅ verde (38/38, todo el monorepo con el paquete nuevo)

**Sigue pendiente de Fase 9** (sin cambios de fondo, ver ADR 0012 §5): crear un tenant de prueba REAL contra la cuenta de Cloudflare y probar `runInfraPlan --apply` por primera vez — bloqueado por credenciales (`CLOUDFLARE_API_TOKEN` con los scopes de §5 del super prompt) y por mandato explícito de Andreu, no por código. Registro de extensiones (`custom/`) sigue diseñado sin conectar — se conecta cuando el primer `custom/` real lo necesite.
**Pendiente de Andreu**: token de Cloudflare + decidir el primer camping candidato + estar presente en la sesión que ejecute el primer `--apply` real
**`/check`**: ✅ verde (38/38) · cli 17/17

### Sesión 20 — 2026-07-19 · Fase 9 (parcial) · Instancias, TenantConfig, `_template` (ADR 0012)

**Hecho** (ADR 0012 aceptado por delegación explícita en sesión cloud, continuación de la sesión 19)
- **`packages/config`**: `TenantConfig` (tasa turística + política de cancelación, con `loadTenantConfig` que valida y cae a defaults seguros sin lanzar nunca) + 4 tests. Deliberadamente NO incluye `payments`/`notifications` — esos ya tienen dueño propio con más matices (ADR 0010/0011) y forzarlos aquí habría sido una abstracción de más.
- **`apps/api/src/tenant-config.ts`**: envoltorio que añade la lectura de D1. Sustituye `TAX_POLICY`/`CANCEL_POLICY`, dos constantes **idénticas y duplicadas a mano** en `public.ts` Y `admin.ts` con el comentario "de TenantConfig en Fase 9" desde la Fase 3 — ahora se leen del tenant en las 7 llamadas donde se usaban. `notify.ts`: el idioma del aviso interno de solicitudes deja de ser `'es'` fijo (usa `TenantConfig.locales[0]`). Seed demo y fixtures de test declaran `taxPolicy:'valencia'` explícitamente (antes invisible). **49/49 tests siguen en verde** tras el cambio — verificado, no asumido.
- **`tenants/_template/`**: `config.ts`, `theme.css`, `content/{6 idiomas}.json` (todas las claves de la web como `__TODO__` — un `grep` te dice qué falta), `custom/hooks.ts` (no-op documentado, sin conectar aún), `seed.ts`+`write-seed.ts`+`data.ts` (mínimo: 1 temporada, 1 tipo, 3 unidades, 1 owner con contraseña `cambia-esta-clave` — **hash scrypt real**, calculado con `better-auth/crypto` y verificado con `verifyPassword` antes de fijarlo, no inventado), `wrangler.jsonc` parametrizado, `README.md` con checklist de alta. `pnpm --filter @tenant/_template typecheck/lint` limpios; `write-seed.ts` genera un `seed.sql` válido de verdad (verificado a mano).
- **`docs/ONBOARDING.md`**: primer borrador — capas 1 (mecánica)/2 (interpretativa, `/new-camping`)/3 (dashboard, no construida), qué NO se automatiza y por qué, checklist de verificación.
- **Deliberadamente NO hecho esta sesión** (ver ADR 0012 §5-6, con motivo explícito): registro de extensiones (Fase 2, `createExtensionRegistry`, sigue sin instanciarse — no hay todavía ningún `custom/` real que lo necesite, conectar seis ficheros para que operen sobre un registro perpetuamente vacío es diseñar para lo hipotético); `packages/cli`/`pnpm new:camping`; crear de verdad un tenant de prueba — estas dos últimas implican `wrangler d1 create`/`deploy`/DNS **contra la cuenta real de Cloudflare de Logic2B**, una acción con impacto fuera del repo que esta sesión no tiene ni credenciales ni mandato explícito para ejecutar sin Andreu presente.
- Intento de descargar las 6 fotos Higgsfield pendientes de la sesión 8: localizados los 6 UUIDs completos en el historial de la cuenta (contenido verificado contra el nombre esperado), pero la descarga sigue bloqueada por la misma política de red del contenedor (403 en el CONNECT a `cloudfront.net`, confirmado en el proxy) — **mismo bloqueo que hace 11 sesiones**, no se generó nada nuevo ni se dejaron ficheros a medias. UUIDs completos anotados en BACKLOG para la próxima sesión con salida de red permitida.
- `docs/ROADMAP.md`/`BACKLOG.md`/`ONBOARDING.md` al día

**Pendiente de Andreu**: token de Cloudflare con los scopes de §5 del super prompt + estar presente (o delegar explícitamente) en la sesión que implemente `packages/cli` y ejecute la primera alta real; decidir el primer camping candidato
**`/check`**: ✅ verde (37/37) · API 49/49 · config 4/4 · `_template` typecheck/lint limpios

### Sesión 19 — 2026-07-19 · Fase 8 · Pagos (ADR 0011)

**Hecho** (ADR 0011 aceptado por delegación explícita en sesión cloud — "sigue perfilando... con tu criterio cierra temas")
- **`packages/payments`** (puro, sin D1): interfaz `PaymentProvider` (`createIntent`/`parseWebhook`/`refund`), `computeChargeAmount` (modos `none`/`deposit`/`full` — `bond`/fianza vía pasarela queda en BACKLOG, ver §2 del ADR), adaptador `stripe` (Checkout Session por `fetch`, sin SDK, verificación de webhook HMAC-SHA256 con `crypto.subtle`) y `none`. **20 tests**
- **Adaptador `redsys`**: firma HMAC SHA256 con derivación de clave por pedido en 3DES-CBC — **bloqueo técnico real**: Workers no soporta 3DES en `crypto.subtle`, así que se implementó DES/3DES puro en TypeScript (`des.ts`, tablas FIPS 46-3). Verificado contra `node:crypto` (`des-ede3-cbc`, IV cero) en **500 casos aleatorios** desde el propio test (Node sí lo soporta nativo, sirve de oráculo aunque producción no pueda usarlo). Algoritmo cruzado contra la guía oficial de migración a HMAC SHA256 y la implementación de referencia `santiperez/node-redsys-api` (investigación vía WebFetch/WebSearch en esta sesión). **Pendiente real declarado**: sin credenciales de comercio no se ha podido probar contra el sandbox de Redsys — BACKLOG antes del primer cobro real
- **`apps/api/src/payments.ts`**: orquestación (mismo patrón que `notify.ts`) — `loadPaymentsConfig`/`resolveProvider` (secrets del Worker, `payment_not_configured` explícito si faltan), `recordPaymentEvent` (webhook idempotente reutilizando `meta`, **sin tabla ni migración nueva**), `executeRefund` (llama al proveedor si hay cobro de pasarela detrás, nunca dobla el cobro) y `recordManualPayment`
- **`bookings.ts`**: solo `channel:'web'` con modo≠`none` bifurca a `status:'pending'` y crea el intent tras el batch atómico (si falla, la reserva queda `pending` sin intent — recepción la resuelve, no se auto-cancela); `phone`/`walkin` siguen confirmando al instante como siempre
- **`public.ts`**: `booking_confirmed` ya no se dispara incondicionalmente al crear — solo cuando la reserva nace `confirmed` o al confirmarla el webhook; nuevo `POST /api/payments/webhook/:provider`; cancelación web ejecuta el reembolso real (antes solo el email con la cifra prevista)
- **`admin.ts`**: dos acciones tipadas nuevas en `PATCH /bookings/:id` — `record_payment` (cobro en efectivo/tarjeta física) y `refund` (422 si supera lo pagado); cancelar desde el dashboard también ejecuta el reembolso real según la política
- **8 tests de integración de pagos** (`apps/api/test/payments.test.ts`: gating por modo, misconfiguración, intent redsys real sin red, webhook idempotente de extremo a extremo, firma inválida) + **3 nuevos en `admin.test.ts`** (record_payment auditado, refund con tope, cancelación con reembolso real) — **49 tests** en la suite privada
- **Web**: `FunnelTitular.tsx` redirige (Stripe) o auto-postea un formulario oculto (Redsys) cuando la reserva exige pago; `ReservaGestion.tsx` sondea unas pocas veces cuando vuelve con `?pago=ok` y la reserva sigue `pending` (el webhook puede tardar más que la vuelta del navegador). 6 idiomas (`reserva.pago.*`). TIER=1 re-verificado: 121 páginas, 0 islas
- Seed demo: `modules.payments: {provider:'stripe', mode:'none'}` — mismo criterio que Resend en Fase 7: activar de verdad es solo secrets + config, sin deploy
- `docs/FUNCIONALIDADES.md` §4.4 (cobro al reservar), §6.3 ampliada (registrar pago/reembolsar), §10 y §11 al día
- **`pnpm check`**: ✅ verde (34/34, todo el monorepo)

**Decisiones**: ver ADR 0011 — modos v1 `none`/`deposit`/`full` (fianza vía pasarela fuera de v1), solo canal web pasa por la pasarela, webhooks reutilizan `meta` en vez de una tabla nueva, DES/3DES propio como único camino técnico para Redsys en Workers
**Pendiente de Andreu**: cuenta Stripe (modo test primero) + comercio Redsys real (clave, FUC, terminal) para activar de verdad y verificar contra su sandbox antes del primer cobro
**`/check`**: ✅ verde (34/34) · API 49/49 · payments 20/20

### Sesión 18 — 2026-07-19 · Fase 7 · Notificaciones (ADR 0010)

**Hecho** (ADR 0010 aceptado por delegación explícita en sesión cloud)
- **`packages/notifications`** (puro, sin DB): tipos de evento, diccionarios de email en 6 idiomas (+ etiquetas de conceptos del desglose), plantillas como funciones `(payload, lang) → {subject, html, text}` con layout de marca sin webfonts, `resendSender` (POST HTTP, sin SDK) y `noopSender`. **6 tests** (idiomas, céntimos formateados, escape XSS, fallback de idioma)
- **`apps/api/notify.ts`**: único punto que toca `notifications_log` — lee `modules.notifications` del tenant, decide (on/off por evento SIN deploy), renderiza, envía y registra sent/failed/**disabled** (sin `RESEND_API_KEY` no sale nada y queda constancia). `waitUntil` tras responder; en tests se espera inline
- **4 eventos** enganchados: `enquiry_received` (al buzón del camping) + `enquiry_autoreply` (al solicitante en SU idioma) en el POST público; `booking_confirmed` (web Y alta manual, con desglose traducido y botón de gestión) ; `booking_cancelled` (gestión web con reembolso previsto Y acción del dashboard, buscando el email del titular)
- **Ajustes**: sección de notificaciones con 4 toggles + remitente + buzón interno (PATCH auditado). Seed y fixtures con config
- **38 tests API** (+2: solicitud deja 2 filas en el log con status disabled; reserva web deja `booking_confirmed` y cancelar añade `booking_cancelled`)
- **Verificado contra el Worker real**: solicitud FR por curl → 2 filas en el log; reserva CA creada y cancelada → sus 2 filas; toggles guardan y persisten tras recargar; previews HTML de los emails generadas. Seed restaurado
- Desviaciones documentadas en el ADR: plantillas HTML puras (React Email en BACKLOG), `waitUntil` en vez de Queues (BACKLOG), idioma del aviso interno fijo a es hasta TenantConfig (F9)

**Pendiente de Andreu**: verificar dominio en Resend y `wrangler secret put RESEND_API_KEY` — con eso los emails salen sin tocar código
**`/check`**: ✅ verde (33/33) · API 38/38 · notifications 6/6

### Sesión 17 — 2026-07-19 · Fase 6 (cierre) · Clientes + informes + ajustes

**Hecho**
- **API**: `GET /api/admin/guests` (búsqueda contiene en nombre/apellidos/email, paginada, con `bookingsCount` y `lastStay` agregados solo para la página — dos consultas cortas, no un join N×M) y `GET /guests/:id` (ficha + historial con `isLead`). **36 tests** (+1; ojo: `isolatedStorage` de vitest-pool-workers aísla el storage POR TEST — lo que un test crea no existe en el siguiente; el test crea su propia reserva)
- **Clientes** (`/admin/#/clientes`): buscador en servidor, tabla (nombre/contacto/documento/nº reservas/última estancia), panel de ficha con contacto clicable, RGPD con fecha e **historial de reservas → click abre la ficha operativa** (BookingPanel reemplaza el panel; cerrar vuelve al cliente)
- **Informes** (`/admin/#/informes`): presets este mes / próximo / 3 meses; tiles de titular (ocupación global calculada de la capacidad real, ingresos por llegada, cobrado, llegadas, salidas) y **ocupación por tipo como medidor de un solo tono** (pino sobre arena-suave, texto en tinta, % + noches en title/aria)
- **Ajustes** (`/admin/#/ajustes`): nombre/zona/moneda editables (PATCH auditado, gerencia), nivel e idiomas en lectura con nota de que se cambian con Logic2B
- **Nav refactorizada** a lista (9 pantallas, orden operativo: día a día primero, configuración al final), email oculto <xl para que quepa a 1366px
- **Verificado en navegador contra el Worker real como gerencia**: búsqueda "dubois"→2, ficha con salto a CS-2026-0015, informes con 8 medidores y cambio de rango, ajustes guardados y verificados; 0 errores JS. Seed restaurado
- `docs/FUNCIONALIDADES.md`: §6.11 clientes, §6.12 informes, §6.13 ajustes

**La Fase 6 queda COMPLETA**: planning ★ con DnD y ficha, llegadas, solicitudes, reservas con alta manual, clientes, informes, inventario, tarifas y ajustes — 9 pantallas operativas
**`/check`**: ✅ verde (32/32) · API 36/36

### Sesión 16 — 2026-07-19 · Fase 6 (5/5 parcial) · Reservas + alta manual + inventario + tarifas

**Hecho**
- **API**: `/catalog` incluye extras; `PATCH /api/admin/units/:id {status}` (gerencia, auditado) para baja/alta de servicio — reasignar hacia una inactiva se rechaza (test). **35 tests** (+2, uno corregido: fechas de fixture fuera de temporada daban 422)
- **Lista de reservas** (`/admin/#/reservas`): tabla con búsqueda por código (prefijo, en servidor), filtro por estado, paginación; titular/fechas/unidad/canal/estado/total/**pendiente en mar**; fila → ficha; accesible por teclado
- **Alta manual** (`NewBookingPanel`): tipo (capacidades del catálogo), fechas, ocupación con edades de niños (input CSV validado 0-17), electricidad, extras del catálogo (obligatorios marcados y forzados), canal teléfono/mostrador, titular, notas. **Cotización EN VIVO contra `POST /api/quote`** con el desglose línea a línea y los errores del motor traducidos (`stay.min_stay` con params, etc.). Crear → `POST /api/admin/bookings` con **Idempotency-Key por apertura** (doble click = una reserva); 409 = "sin disponibilidad"; éxito → se abre la ficha de la nueva
- **Inventario** (`/admin/#/inventario`): unidades por tipo, contador en servicio/fuera, click = baja/alta (tachada en mar cuando está fuera), nota clara de que no toca reservas existentes
- **Tarifas** (`/admin/#/tarifas`): tabla por temporada (orden por prioridad) × tipo con edición inline **en euros** (conversión a céntimos al guardar), estancia mínima, guardado por fila vía `PUT /rates/:id` (solo campos cambiados), invariante 3 anunciada en pantalla
- `lib/format.ts` compartido (eur/fecha/noches/conceptLabel/stayError) — BookingPanel refactorizado; fallback de extras humanizado ("Extra: limpieza", no "ext_limpieza")
- **Verificado en navegador contra el Worker real como gerencia**: 25 listadas y búsqueda a 10; alta con cotización 99,00 € → CS-2026-808228 creada y ficha abierta; error "estancia mínima 3 noches" en vivo; A-01 fuera y de vuelta a servicio; tarifa 38→21,50 guardada y restaurada; 0 errores JS. Seed restaurado
- `docs/FUNCIONALIDADES.md`: §6.4 reescrito (lista+alta), §6.9 inventario, §6.10 tarifas

**Pendiente fase**: sesión 20 — clientes con historial, informes en pantalla, ajustes del tenant
**`/check`**: ✅ verde (32/32) · API 35/35

### Sesión 15 — 2026-07-19 · Fase 6 (4/5) · Solicitudes + llegadas = modo lite

**Hecho**
- **API**: `GET /api/admin/bookings` gana `arrivalsOn`/`departuresOn` (igualdad exacta con `date_from`/`date_to` — salida = día que se libera, exclusivo) y devuelve `unitCode` + `leadName` por join (unidad y titular a la vista en las listas). `GET /bookings/:id` devuelve `unitCode`. Nuevo `GET /api/admin/catalog` (tipos+unidades, para selects y nombres). **34 tests** (+2: llegadas/salidas con titular, catálogo)
- **Bandeja de solicitudes** (`/admin/#/solicitudes`): filtros por estado con recuento (Todas·15 / Nueva·4 / …), fila expandible con mensaje completo, contacto clicable (mailto/tel), idioma y origen; **acciones de siguiente paso natural** (nueva→contactada|perdida, contactada→presupuestada|perdida, presupuestada→convertida|perdida, perdida→reabrir) sobre el PATCH existente auditado. Chips `sol-*` con los tokens
- **Llegadas/salidas del día** (`/admin/#/llegadas`): día navegable (hoy/←/→/calendario), dos columnas con titular, unidad, pax·noches, estado y **pendiente de cobro destacado** (la cifra del check-in) o "Pagada"; canceladas fuera; click en fila → **BookingPanel reutilizado**
- `BookingPanel` simplificado: ya no necesita la prop `units` (el detalle trae `unitCode`)
- **Verificado en navegador contra el Worker real**: 15 solicitudes, filtro Nueva 4→3 tras marcar contactada (mensaje `role=status`), llegadas 1-ago = 3+3 con pendientes correctos, ficha desde fila y Esc devuelve el foco; 0 errores JS. Seed restaurado después
- `docs/FUNCIONALIDADES.md` al día (§6.7 llegadas, §6.8 bandeja)

**Pendiente fase**: sesión 19 (lista de reservas + alta manual UI + inventario/tarifas), sesión 20 (clientes/informes/ajustes). El "calendario de ocupación manual" del lite queda con el planning (ya cubre la lectura)
**`/check`**: ✅ verde (32/32) · API 34/34

### Sesión 14 — 2026-07-19 · Demo comercial · Selector de temas (ADR 0009) + docs de funcionalidades

**Hecho** (petición directa de Andreu en sesión: temas para enseñar la demo en varios estilos + documentación de cara al cliente)
- **ADR 0009**: temas = bloques `[data-theme]` en el `theme.css` del tenant (los derivados `color-mix` se recalculan solos → un tema son ~6 variables, cero cambios en componentes). Demo-only tras `config.demoThemes` — sin el flag no se renderiza ni un byte. Mismas fuentes en todos (cambiar tipografía = pagar Lighthouse).
- **4 temas** dentro del territorio y fuera del antimodelo: `pinada` (actual, defecto), `mar` (posidonia/roca húmeda), `garriga` (oliva/tierra seca) y `nit` (**modo oscuro completo** con `color-scheme: dark` — la prueba de fuego del sistema de tokens). Botón "Ver disponibilidad" en nit ~5.5:1 AA.
- **Selector sin islas** en la cabecera: `<details>` nativo como el de idioma, swatches que pintan el color de acción de cada tema vía el propio bloque de tokens (`.lc-swatch[data-swatch]` comparte selector — sin duplicar hex), `aria-pressed`, script inline anti-FOUC en `<head>` + persistencia `localStorage`. OJO Astro: las expresiones dentro de `<script is:inline>` NO se evalúan — hay que usar `set:html` (el primer intento emitía el JS como cadena inerte).
- i18n en los 6 content JSONs (`nav.tema` + bloque `temas`); `TenantWebConfig.demoThemes?: string[]`; tipo `Content.temas?`.
- **`docs/FUNCIONALIDADES.md`**: guía completa de cara al cliente — niveles, web (idiomas/SEO/rendimiento/temas), mostrador, funnel con holds, autogestión, precios explicables, dashboard (planning/DnD/ficha/roles/auditoría), solicitudes, seguridad (D1 por camping), roadmap honesto y ficha técnica. Mantener al día con cada feature nueva.
- **Verificado en navegador contra el Worker real**: 4 temas cambian en vivo (fondos comprobados por computed style), persisten entre páginas (localStorage), vuelta al defecto limpia (atributo y storage fuera), `aria-pressed` marca el activo, 0 errores JS. **Regla dura re-verificada**: build TIER=1 → 121 páginas, 0 islas, selector presente (es vanilla).
- BACKLOG: `?tema=x` por URL y tematizar el dashboard (ambos Fase 10).

**Decisiones**: ver ADR 0009 (demo-only, un cliente real tiene UN tema; el selector es atrezzo comercial, no feature)
**`/check`**: ✅ verde (32/32)

### Sesión 13 — 2026-07-19 · Fase 6 (3/5) · Ficha de reserva: panel lateral con acciones tipadas

**Hecho**
- **Panel lateral no modal** (`components/BookingPanel.tsx`) sobre el planning: click en una barra (sin drag, el umbral de 4px distingue), Enter/Espacio con la barra enfocada, o click en un chip de la bandeja "sin asignar" (ahora botones). Esc cierra desde cualquier sitio (listener a nivel de documento — el foco puede salir del panel al deshabilitarse un botón) y el foco vuelve a quien la abrió
- **Contenido**: código + chip de estado (mismos tokens que las barras), estancia (fechas→noches, ocupación con edades, unidad, canal, creada), titular y acompañantes, **desglose auditable línea a línea** (conceptos i18n con `tDyn` de fallback, descuentos en negativo en pino), total/tasa/fianza/pagado/**pendiente de pago** en mar, pagos con signo, notas editables (acción `note`, botón deshabilitado si no hay cambio)
- **Acciones tipadas** contra `PATCH /api/admin/bookings/:id`: espejo cliente de TRANSITIONS del servidor (pending→confirm|cancel, confirmed→cancel|no_show|complete) — solo se ofrecen las que aplican, el servidor valida SIEMPRE. Cancelar exige **doble confirmación inline** ("¿Seguro? Sí, cancelar"). Éxito → mensaje `role=status` + invalidación de ficha y planning
- Tipos `BookingDetail`/`BookingGuest`/`BookingPayment`/`PriceLine` en el cliente; ~60 claves i18n nuevas
- **Verificado en navegador contra el Worker real** (build servido desde `/admin/` del Worker — el login via proxy Vite da 403 de origen, nota abajo): abrir ficha (868,00 € de desglose correcto), guardar nota, Esc, confirmar una pendiente (chip y barra del planning pasan a pino), cancelar con doble confirmación (la barra desaparece = inventario liberado), 0 errores JS. Seed restaurado después

**Decisiones**: panel no modal (se sigue viendo el planning al lado); en dev el dashboard se prueba servido por el Worker (mismo origen que Better Auth), el `vite dev` con proxy queda para iterar UI sin sesión
**Pendiente fase**: sesiones 18–20 (solicitudes+llegadas=lite, reservas/inventario/tarifas, clientes/informes/ajustes)
**`/check`**: ✅ verde (32/32)

### Sesión 12 — 2026-07-19 · Fase 6 (2/5, parcial) · Drag & drop de reasignación en el planning

**Hecho**
- **DnD con Pointer Events nativos** (sin librería, según ADR 0008): arrastrar una barra verticalmente a otra unidad del MISMO tipo — umbral de 4px (un click no es un drag), transform directo al DOM (cero re-render por frame), resaltado de la fila destino válida en pino, detección de fila vía las posiciones del virtualizador
- **Optimista con rollback**: `PATCH /api/admin/bookings/:id {action:'reassign'}` — la caché de Query se actualiza al soltar y se restaura si el servidor responde 409 (solape/estado); mensaje `role=status` con el resultado ("Reserva movida a A-05" / error). El servidor valida SIEMPRE — la UI nunca decide
- **Teclado**: barra enfocable, ↑/↓ reasigna a la unidad adyacente del mismo tipo (misma mutación, mismos mensajes)
- `apiPatch` en el cliente del dashboard (las acciones tipadas del admin son PATCH)
- **Verificado en navegador contra el Worker real**: drop en fila libre → movida; drop en fila con solape → 409 + rollback visual; teclado contra fila ocupada → rechazo informado; 0 errores JS

**Pendiente sesión 17**: panel lateral de ficha con acciones tipadas
**`/check`**: ✅ verde (32/32)

### Sesión 11 — 2026-07-19 · Fase 6 (1/5) · ADR 0008 + dashboard con planning v1

**Hecho** (ADR 0008 aceptado por la misma delegación)
- `docs/adr/0008-dashboard-planning.md`: SPA en `/admin/` del MISMO Worker (un deploy = web+API+dashboard, misma cookie Better Auth, cero CORS), hash history (`/admin/#/…` — sin rewrites en estático), virtualización propia de FILAS + barras absolutas, DnD con pointer events nativos (sesión 17), reparto 16–20
- `apps/dashboard` real: React 19 + Vite + **TanStack Router** (hash) + **TanStack Query** + Tailwind v4 con los tokens de la demo. Login contra Better Auth (cookie), guardia de sesión en la raíz, i18n por diccionario `t()` desde el día 1 (es)
- **Planning v1 (tape chart ★, lectura)**: filas virtualizadas con `@tanstack/react-virtual` (~40 renderizadas de 300 posibles), cabecera de meses+días sticky, columna de unidades sticky, findes sombreados, grupos por tipo, **colores por estado con los tokens** (confirmed=pino · pending=arena · no_show=mar · completed=tinta-suave), bloqueos rayados con motivo, **bandeja "sin asignar"**, zoom semana/mes/temporada (96/42/22px), navegación ←/hoy/→ + fecha, refresco de cortesía cada 60 s, tooltips con código·estado·fechas·pax
- Deploy cableado: `deploy:demo` construye web + dashboard y copia `dist` a `web/dist/admin/`; CI `deploy-demo.yml` igual
- **Verificado en navegador contra el Worker real**: login recepción → planning de agosto (83 unidades · 13 reservas a la vista · CS-2026-0006 en la bandeja sin asignar), zoom temporada, scroll a la última fila fluido, 0 errores JS

**Pendiente fase**: sesiones 17–20 (DnD+ficha, solicitudes+llegadas=modo lite, reservas+inventario+tarifas, clientes+informes+ajustes)
**`/check`**: ✅ verde (32/32)

### Sesión 10 — 2026-07-19 · Fase 5 · Flujo de reserva completo (ADR 0007)

**Hecho** (ADR 0007 aceptado por delegación explícita de Andreu en sesión)
- **Motor**: `searchAvailability` acepta `holds` + `now` (expiración perezosa) — 4 tests nuevos ANTES de implementar (51 total). Tipo `Hold` en el dominio
- **Modelo**: tabla `inventory_holds` (migración 0002 con drizzle-kit), hold por TIPO, índices por tipo/fechas y por expiración
- **API**: `POST/DELETE /api/holds` (valida estancia + disponibilidad, TTL 15 min), availability y bookings cuentan holds vivos, `createBooking` consume el hold EN el mismo batch que crea la reserva (y rechaza hold caducado/ajeno con 409), `GET /bookings/:code` devuelve previsión de cancelación, `POST /bookings/:code/cancel` (libera inventario, auditado) y `/modify` (re-cotización COMPLETA en servidor, 409 si no cabe, desglose nuevo auditable). Primer **Cron Trigger** (purga de holds cada 15 min). 7 tests de integración nuevos (32 total)
- **Web**: funnel `/reservar` (resultados=mostrador con botón Reservar) → `/reservar/{tipo}` (extras + desglose EN VIVO del servidor, errores i18n del motor) → `/reservar/{tipo}/titular` (hold al entrar con contador mm:ss, liberación con `pagehide` si se abandona) → confirmación en `/reserva?code&email&nueva=1` (resguardo imprimible con @media print). Gestión completa: ver, **cancelar con el reembolso a la vista**, **cambiar fechas** re-cotizado. 6 idiomas (bloques `reservar`/`reserva` en los JSONs), noindex en páginas de proceso, Idempotency-Key = hold
- **Regla dura re-verificada**: TIER=1 → 121 páginas, **0 islas** en todo el sitio, `/reservar` y `/reserva` degradan a redirección sin JS; los 8×2 pasos por tipo ni se generan
- **E2E Playwright** (`apps/web/e2e`, `pnpm e2e`, webServer wrangler): camino feliz (buscar→extras→hold→confirmar→**aparece en /api/admin/planning** ✅ criterio de fase→modificar→cancelar) + 3 infelices: tipo agotado entre pasos, hold caducado al confirmar (reintento revalida sin perder el formulario), estancia inválida en alta (mín. 7 noches + sábado). **4/4 verdes** contra el Worker real
- Verificado también a mano en navegador: reserva CS-2026-785715 creada, modificada (nuevo total del servidor) y cancelada, 0 errores JS

**Decisiones**: hold por tipo (no por unidad — la asignación sigue libre para el planning); gestión en `/reserva?code=…` (query, no segmento — salida estática); sin hold también se puede confirmar (el hold protege la UX, el servidor siempre revalida)
**Pendiente**: pago real (Fase 8: la pantalla confirma directo con `payments:'none'`); emails (Fase 7, hooks anotados)
**`/check`**: ✅ verde (32/32) · E2E 4/4

### Sesión 9 — 2026-07-19 · Fase 4 (remates) · Lighthouse ≥95 local + ADR 0007 propuesto

**Hecho**
- **Lighthouse contra el Worker local** (assets reales, red y CPU emuladas): home desktop **100/100/100/100**, detalle glamping móvil **100**, tarifas desktop **100**, home móvil **96/100/100/100**. Objetivo ≥95 cumplido en todo lo auditado
- Los dos arreglos que lo consiguieron: **fuentes subseteadas** con fonttools a latín+latín-ext+signos (Inter 352→101 KB, Clash 29→23 KB — el render del héroe pasaba 2,1 s esperando ancho de banda) y **imágenes**: héroe webp calidad 60, separador de lona 287→~60 KB como `<img loading="lazy">`
- `.claude/launch.json`: el server `api` crea `apps/web/dist` si falta (wrangler dev con assets exige que exista el directorio)
- **`docs/adr/0007-flujo-de-reserva.md` PROPUESTO** (Fase 5): funnel en apps/web con isla por paso, estado en URL, `inventory_holds` por tipo con expiración perezosa + primer Cron Trigger, gestión código+email (ver/cancelar/modificar re-cotizado), E2E Playwright feliz + 3 infelices, reparto sesiones 13–15. **Sin código de Fase 5 — esperando validación**

**`/check`**: ✅ verde (32/32)

### Sesión 8 — 2026-07-19 · Fase 4 (2/3) · Web completa, 6 idiomas, Workers Assets

**Hecho**
- **Páginas restantes**: alojamientos (lista por familias) + detalle por tipo (galería, ficha técnica y precios por temporada **desde los mismos datos que la D1** vía `tenants/demo/data.ts` → `generateSeed`), instalaciones, entorno, tarifas (tabla tipos×temporadas + suplementos + extras + condiciones desde `rate_plans`), contacto (datos+horario+cómo llegar+formulario), blog cableado (`content/blog/{slug}.{lang}.md`, fallback al idioma por defecto) y 404 propia con foto y CTA
- **6 idiomas completos** (es/ca/en/fr/de/nl): content JSONs ampliados (~380 claves/idioma), selector de idioma accesible (`<details>` nativo, sin JS), menú móvil, rutas `/{lang}/…` con wrappers `[lang]` (109 páginas estáticas)
- **API**: `GET /api/availability` devuelve `opensOn` (próxima apertura real de `seasons_calendar`) cuando las fechas caen en cerrado + 2 tests (25 total)
- **Mostrador**: skeleton de carga, mensaje "cerrado — abrimos el {fecha}" con la fecha REAL de la API formateada por locale, deep-link `/?from=&to=&adults=&children=` bidireccional (lee la URL al cargar y la escribe al buscar)
- **Workers Assets**: `tenants/demo/wrangler.jsonc` sirve `apps/web/dist` en `camp.logic2b.com/*` con `run_worker_first: ["/api/*"]` y 404 propia; `deploy:demo` construye la web antes; CI `deploy-demo.yml` actualizado. Un deploy = web + API
- **SEO técnico**: sitemap.xml (todas las rutas × idiomas con alternates hreflang), robots.txt por tenant, favicon SVG + apple-touch-icon con la marca, og.jpg 1200×630 derivada del héroe (sharp), JSON-LD CampingPitch/Accommodation+Offer por tipo
- **Imágenes responsive**: astro:assets con `Picture` AVIF/WebP (fallback webp forzado — el default png pesaba 5MB), preload del héroe con imagesrcset, sharp como dep del workspace
- Seed: `seasons/unit_types/rate_plans/extras` tipados (`SeedSeason`…) — la web los consume sin `any`
- **Verificado en navegador (worker real, 1366+375)**: búsqueda → 8 resultados con precios de servidor, deep-link reproducible, cerrado con "15 de marzo", 0 errores JS, sitemap/robots/404 servidos por el Worker. TIER=1: 0 islas referenciadas en las 109 páginas
- 6 fotos nuevas generadas en Higgsfield (interiores bungalow/glamping, piscina, restaurante, premium mar, autocaravana)

**Pendiente fase (sesión 3)**
- Redeploy de la demo con credenciales (esta sesión cloud no las tiene — el deploy NO se ha hecho): `pnpm --filter @logic-camp/api deploy:demo`
- Descargar fotos Higgsfield (egress del contenedor bloqueaba la CDN) → `tenants/demo/content/media/`: `detalle-bungalow-interior`←job `f5ac46f2`, `detalle-glamping-interior`←`9bfdfd4b`, `instalacion-piscina`←`9a9eeb15`, `instalacion-restaurante`←`1cbee642`, `tipo-premium`←`32b5b013`, `tipo-autocaravana`←`2ba71b99` (WebP ~2000px, q78; la web ya las engancha por nombre de fichero sin tocar código)
- Lighthouse ≥95 contra producción (aquí verificado solo funcionalmente)

**Decisiones**: datos de web en build desde el generador del seed (`data.ts`) — misma fuente de verdad que la D1, sin drift de tarifas; fallback de blog al idioma por defecto con aviso; `fallbackFormat="webp"` obligatorio en `Picture`
**`/check`**: ✅ verde (32/32)

### Sesión 7 — 2026-07-18 · Fase 4 (1/3) · Diseño + home con mostrador

**Hecho**
- ADR 0006 (plan de diseño validado por Andreu): paleta 5 hex (tinta/hueso/pino/arena/mar), Clash Display + Inter self-host, wireframes de los dos héroes, elemento firma "el mostrador"
- 6 assets fotográficos con Higgsfield (Nano Banana Pro 4K héroes 21:9, Soul 2.0 tarjetas/textura), optimizados a WebP (86MB→2.2MB) en `tenants/demo/content/media/`
- `apps/web` real: Astro 5 + islas React + Tailwind v4. Alias `@tenant` resuelto en build (TENANT=slug), tokens en `tenants/demo/theme.css` (@theme de Tailwind mapea variables → cambiar el fichero re-viste todo)
- `packages/config`: `TenantWebConfig` + `bookingMode()` (nivel→comportamiento)
- Home completa ES+EN: héroe nivel 3 con **Mostrador** (fechas+huéspedes → GET /api/availability real, resultados en página, sticky) · héroe nivel 1 (anochecer + promesa + ticker) · tarjetas de tipos · separador de lona (firma secundaria) · entorno · formulario→POST /api/enquiries (vanilla JS, todos los niveles)
- **Regla dura verificada**: TIER=1 build → 0 islas, 0 JS referenciado en el HTML (wrapper HeroMostrador.astro con import dinámico)
- SEO: hreflang es/en/x-default, canonical, OG, JSON-LD Campground+LodgingBusiness
- Verificado en navegador: mostrador devuelve 8 tipos con precios del servidor (114/138/177€…), enquiry aparece en la D1 local
- `.claude/launch.json`: servidores `api` (wrangler dev + D1 local sembrada) y `web` (astro dev, proxy /api→8787)

**Decisiones**: @astrojs/react v4 (la v6 es de Astro 6/vite8 y rompe el dev server); tenant en build via alias, no runtime (Fase 9 revisará)
**Pendiente fase**: páginas restantes (alojamientos+detalle, instalaciones, entorno, tarifas, contacto, blog), 4 idiomas más (ca/fr/de/nl), sitemap, Lighthouse ≥95, deploy de la web a camp.logic2b.com (ahora solo /api/* pasa por el Worker)
**`/check`**: ✅ verde (32/32)

### Sesión 6 — 2026-07-18 · Fase 3 (2/2) · Better Auth + API privada

**Hecho**
- `docs/adr/0005-auth-privada.md`
- Better Auth 1.6 sobre la MISMA tabla `users` (adaptador Drizzle, D1 del binding): migración `0001_auth.sql` (users ampliada + sessions/accounts/verifications), instancia por petición en `auth.ts`, registro público desactivado, provisión en servidor (`provisionUser`), `requireRole` con jerarquía readonly<reception<manager<owner
- `routes/admin.ts` (`/api/admin`): `/planning` (el SELECT del tape chart), bookings (lista/detalle/alta manual phone|walkin/acciones tipadas confirm|cancel|no_show|complete|reassign|note), enquiries, rates, `/reports` (ocupación/ingresos/llegadas), `/settings`, users (solo owner). Toda mutación escribe `audit_log`
- `bookings.ts`: creación de reserva extraída y compartida público↔manual (mismo motor, precio en servidor)
- 13 tests de integración nuevos (24 total): 401/403, registro cerrado, fuga cruzada de sesión A↛B, **invariante 3** (cambiar tarifa no toca reserva confirmada) e **invariante 4** (cancelar libera inventario), reasignación con solape 409
- Seed demo: 4 usuarios (uno por rol) con credencial `calasereno` (hash scrypt constante ⇒ determinista); `db:reset && db:seed` verificado con 0001
- Remoto: migración 0001 aplicada, D1 re-sembrada, `AUTH_SECRET` puesto, Worker redesplegado

**Decisiones**: una sola tabla de usuario (nada de espejo), sesiones revocables en D1 (no JWT), jerarquía de roles como Record — ver ADR 0005. Nota técnica: better-auth arrastra `kysely` y duplicaba los tipos de drizzle-orm; se unifica con `kysely` como devDep de `packages/db`.
**Pendiente**: nada de la fase. `AUTH_SECRET` en CI/despliegues nuevos.
**`/check`**: ✅ verde (32/32)

### Sesión 5 — 2026-07-17 · Fase 3 (1/2) · API pública

**Hecho**
- `docs/adr/0004-api-publica.md`
- `apps/api` reestructurada: `schemas.ts` (Zod), `tenant.ts` (contexto por binding + rate limit 60/min), `data.ts` (filas→dominio), `routes/public.ts`, `app.ts`, `client.ts` (RPC `hono/client`)
- Endpoints: `GET /api/availability` (precio en servidor, closed≠unavailable), `POST /api/quote` (desglose + extras obligatorios + tasa), `POST /api/enquiries` (guarda SIEMPRE), `POST /api/bookings` (revalida, re-cotiza en servidor, asigna unidad, batch atómico, **Idempotency-Key** vía tabla `meta`), `GET /api/bookings/:code?email=`
- Tests de integración con `@cloudflare/vitest-pool-workers@0.9.14` (¡la 0.18 requiere Vitest 4 — no subir!): D1 real ×2 con migraciones reales, 11 tests incl. back-to-back (to exclusive), idempotencia, 409 agotado y **fuga cruzada A↛B** (invariante 5)
- Worker demo redesplegado con la API nueva

**Decisiones**: aislamiento por binding = un Worker por tenant (el middleware no elige DB, la trae el entorno). Config test propia `test/wrangler.test.jsonc` con DB y DB_B.
**Pendiente fase**: sesión 2 — Better Auth + rutas privadas.
**`/check`**: ✅ verde (32/32)

### Sesión 4 — 2026-07-17 · Fase 2 ★ · Motor de disponibilidad y precios

**Hecho**
- `docs/adr/0003-motor-core.md`
- `packages/core` puro (sin I/O, sin Drizzle): `searchAvailability` (disponibilidad por tipo con reasignación implícita — comprobación por noche, exacta para intervalos), `quote` (desglose por tramos de temporada, sum(lines)==total por construcción), `applyRules` (stackables + mejor exclusiva, descuentos como líneas negativas), `validateStay` (acumula todos los errores, códigos i18n), `assignUnit` (menos huecos, con alternativas), `calculateTouristTax` (política como dato: valencia/catalunya/none), `calculateCancellationRefund` (tramos), `createExtensionRegistry` (los 11 hooks de §3)
- Tests ANTES que implementación: `edge-cases.test.ts` con los 7 casos que rompen productos genéricos + `engine.test.ts` por módulo. **47 tests verdes**
- Distinción cerrado ≠ sin disponibilidad en todo el motor (`closed` / `ClosedError`)

**Decisiones**: tipos de dominio propios del core (no los de Drizzle) — ADR 0003.
**`/check`**: ✅ verde (32/32)

### Sesión 3 — 2026-07-17 · Fase 1 · Modelo de datos

**Hecho**
- `docs/adr/0002-modelo-de-datos.md`
- `packages/db/src/schema.ts`: las 16 tablas de §4 tipadas (JSON tipado: Occupancy, PriceBreakdown…), índices de disponibilidad, migración única `0000_modelo-datos.sql`
- Seed demo Cala Sereno en `tenants/demo/seed.ts`: generador puro y determinista (fecha ancla → listo para reset nocturno Fase 10). 83 unidades (60 parcelas/4 tipos, 18 bungalow-mobil/3 tipos, 5 glamping), 3 temporadas solapadas por prioridad, 12 extras, 3 reglas, 40 reservas con casos límite (cruce de temporadas, 28 noches, grupo 8 pax con niño exento de tasa, cancelada, no-show, sin asignar), 15 solicitudes en 5 estados, bloqueos (mantenimiento + longstay)
- 10 tests Vitest del seed, incluyendo invariantes: sin solapes por unidad, `sum(payments)==paid_cents`, desglose==total, precio por tramos
- `pnpm db:reset` / `pnpm db:seed` (D1 local en `.wrangler-demo/`); `tenants/*` añadido al workspace
- D1 **remota** migrada y sembrada; Worker demo desplegado (falta solo el DNS)

**Decisiones**: ver ADR 0002 (IDs texto, tenant_id documental, payments con signo, enquiries tabla propia).
**`/check`**: ✅ verde (31/31)

### Sesión 2 — 2026-07-17 · Fase 0 · Scaffold del monorepo

**Hecho**
- `docs/adr/0001-scaffold.md` (aceptado con el OK de fase de Andreu)
- Monorepo pnpm + Turborepo: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, ESLint 9 flat + Prettier, `.gitignore`, git init (rama `main`)
- `apps/api`: Hono + `GET /health` + tests Vitest + wrangler.jsonc dev + build dry-run
- `apps/web` (Astro 5) y `apps/dashboard` (React 19 + Vite) placeholders
- `packages/db`: Drizzle + schema `meta` + migración 0000; `packages/tsconfig`; 8 paquetes reservados compilando
- `tenants/_template/` documentado + `tenants/demo/` (wrangler.jsonc con ruta camp.logic2b.com/api/*)
- CI: `check.yml` y `deploy-demo.yml` (skip explícito hasta tener secrets)

**Sin terminar**: deploy real (sin `wrangler login` ni D1 creada), remoto GitHub.
**Decisiones**: `wrangler.jsonc` en vez de `.toml` (ADR 0001); lint de `.astro` diferido a Fase 4.
**`/check`**: ✅ verde (28/28)

### Sesión 1 — 2026-07-17 · Fundación documental (§1 BRIEF)

### Sesión 1 — 2026-07-17 · Fundación documental (§1 BRIEF)

**Hecho**
- `CLAUDE.md` (arquitectura, niveles, convenciones, visual, qué NO hacer)
- `docs/TIERS.md`, `docs/ROADMAP.md`, `docs/DOMAIN.md`, `docs/BACKLOG.md`
- `PROGRESS.md` (este fichero)
- `.claude/commands/`: `session-close.md`, `new-camping.md`, `check.md`, `adr.md`

**Sin hacer (deliberadamente)**: código, scaffold, repo git.

**Abierto**: ver dudas listadas al final de la sesión (prerrequisitos §5, git remoto, etc.)

---

<!-- Plantilla de entrada:
### Sesión N — YYYY-MM-DD · Fase X · <objetivo>
**Hecho**: …
**Sin terminar**: …
**Decisiones**: … (con enlace al ADR si aplica)
**Siguiente paso**: …
**`/check`**: verde/rojo
-->
