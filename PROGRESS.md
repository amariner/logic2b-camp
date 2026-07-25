# PROGRESS — Logic Camp

Diario de sesiones. Se actualiza al cerrar cada sesión con `/session-close`. La sesión siguiente empieza leyendo este fichero.

## Estado actual

- **Fase 11 (endurecimiento)**: 🟨 **PARCIAL** (ADR 0026, 2026-07-21, sesión 37). Cuatro bloques cerrados de verdad: **aislamiento verificable por barrido** (42 rutas, dirigido por `app.routes` — una ruta nueva queda cubierta el día que se escribe, y la entrega falla si alguien añade una sin declarar), **RGPD operativo** (export del interesado, supresión que anonimiza y **niega con fecha** cuando corre el plazo del RD 933/2021, limpieza del PII copiado en `audit_log`, consentimiento con fecha y versión, retención en cron incluida la del nivel 1, y aviso legal + privacidad + cookies sin banner porque no hay seguimiento), **observabilidad mínima** (`onError` — antes se devolvía 500 con el stack trace en el cuerpo—, log estructurado, aviso con cortafuegos, cron que falla por tarea) y **copias** (sin pipeline propio, por decisión: comando `pnpm export:tenant` probado + runbook de restauración con verificación de invariantes). El criterio que ordenó la fase: **la página publicada es la especificación** — la ficha técnica de C6 hacía cuatro afirmaciones falsas y ninguna sobrevive. **DESPLEGADA y verificada en producción** (versión `f4288603`, migración `0005_rgpd.sql` aplicada en la D1 remota). **Queda**: verificar en vivo el bloque "Protección de datos" de la ficha de cliente (necesita sesión logueada — 5 min de Andreu), parte de viajeros (fase propia), Sentry/Logpush y ensayo real de restauración (credenciales), pruebas de carga (falta objetivo declarado), y el primer cliente.
- **Frente C (acabado profesional: visual + workflow + docs)**: abierto 2026-07-20. Prioridad declarada por Andreu: **la interfaz, en modo fake** — todo previsto y pensado, pero lo que manda es que el cliente vea algo bien pensado y profesional. Regla dura: "fake" se resuelve en el **seed**, nunca con mocks en el cliente. Contrato completo en **[`docs/FRENTE-C-ACABADO.md`](docs/FRENTE-C-ACABADO.md)** (8 fases C0–C7 + bugs registrados). **C0 ✅** (ADR 0019), **C2+C3 ✅** (ADR 0020) y **C7 ✅** (ADR 0021). C0: HMR desbloqueado y seed denso (planning 25 → **346 reservas a la vista**, agosto al 86%). C2+C3: el DS conectado (Radix + 16 primitivos, 43 → 2 `<button>` crudos, rename de tokens cerrado) y los estados (0 `<p>Cargando…</p>`, error boundary por ruta, toasts con deshacer, confirmación en las 3 acciones destructivas). **C7: el plano del camping** — geometría pura y testeada en `packages/config` (`expandPlano`/`autoPlano`/`unitStateOn`, 18 tests), descriptor declarativo en `tenants/demo/plano.ts` → `modules.plano` (columna JSON existente, **cero migración D1**) → `GET /api/admin/map` genérico → `CampingMap` (SVG, pan/zoom, colores `--lc-status-*` del planning) + página `Plano` con estado en vivo por fecha, click→ficha y salto plano↔planning. **C4 ✅** (ADR 0022): **el workflow de recepción** — check-in como campo `checked_in_at` (**no** un estado `in_house`: un estado nuevo caería fuera de ~8 filtros por `status` y olvidar uno es un doble-booking; el campo no toca ninguno y "en casa" se deriva), migración aditiva `0004`; huéspedes y documentos editables (base del parte de viajeros), "cobrar todo lo pendiente" con guarda ≤pendiente, crear/levantar bloqueos desde planning y plano, ⌘K (`cmdk`) y rutas `/reservas/$id` `/clientes/$id`; token nuevo `--lc-status-inhouse` (verde AA 5.5:1) en barra/plano/leyenda + `inhouse` en `unitStateOn`. **C1 ✅** (ADR 0023): **el planning como pieza de exhibición** — gesto horizontal (mover arrastrando manteniendo noches, diagonal fecha+unidad en una acción, estirar por los bordes), re-cotización SIEMPRE en servidor (`requote` dry-run + `move` con candado `expectedTotalCents`; desglose nuevo en diálogo antes de confirmar; rechazo explicado; Deshacer; teclado ←/→ y Shift+←/→), crear arrastrando sobre celdas libres (alta precargada, `preferredUnitId`), bandeja "sin asignar" arrastrable, línea de HOY + continuación + franja de temporada + filtros/búsqueda dentro del planning, **C1.5 cerrado** (mapa `--lc-status-*` definitivo con test AA de 27 aserciones y pareja `.dark` → **modo oscuro conectado**, toggle claro/oscuro/sistema sin FOUC), y finde en UN gradiente por lienzo (geometría pura en `packages/config`). Verificado en vivo: 22/22 gestos con Playwright contra el bundle real. **C5 🟨 PARCIAL** (ADR 0024, 2026-07-21): auditoría reveló que las 6 fotos que hacían falta para **C-BUG-5** ya estaban generadas desde sesión 8 (prompts ya cumplen el contrato de arte — lista definitiva cerrada, no hacía falta generar nada nuevo); el hueco es solo de **descarga**, bloqueada por la política de red del contenedor (`cloudfront.net`, 403, 3ª sesión consecutiva con el mismo bloqueo) — script listo (`pnpm --filter @tenant/demo fetch:fotos`) para ejecutar desde un entorno con esa salida. **C5.2 ✅**: capturas reales del planning y del plano (bundle `vite build` + stub Node con datos del generador de seed puro `generateSeed(2026)`, sin workerd, mismo patrón que C1) reemplazan la maqueta CSS de la landing (cierra BACKLOG [B3]) y OG image de marca Logic2B (1200×630, tokens oklch + isotipo, sin fotografía del tenant). **C6 ✅** (ADR 0025, 2026-07-21) — **la documentación, ÚLTIMA fase del frente: el Frente C queda CERRADO.** Resuelve además la decisión pendiente **B-ii** y cierra **B4** del Frente B. **21 páginas** en `camp.logic2b.com/docs/`: **guía de recepción (14 páginas, una tarea por página)** en el orden de un día real de mostrador (entrar · llegadas/salidas · check-in · cobrar · leer el planning · mover/estirar · plano · alta manual · huéspedes y documentos · check-out · bloqueos · solicitudes · ⌘K · qué hacer cuando algo falla), **guía del dueño (3)** — los niveles como escalera, qué cambia y qué **no** al subir (dominio, web, SEO e histórico se mantienen), qué aportar en el alta — y **ficha técnica (4)** — arquitectura, DNS, correo (SPF/DKIM/DMARC con el aviso del SPF duplicado), datos/aislamiento/RGPD/backups/portabilidad. **B-ii se resolvió por una observación que reordena el criterio**: la documentación es del **producto**, no del tenant — se escribe una vez y sirve a todos los campings, así que el coste por camping ya era cero en las tres opciones y la decisión se juega en **coste fijo de construcción con 6h/semana**, donde `apps/site` gana solo: hereda tokens, fuentes, isotipo, i18n y SEO, y sobre todo **el pipeline de despliegue** (`apps/site/dist` **ya es** el directorio de assets del Worker del tenant → una página nueva se despliega sin tocar nada). Starlight exigía un tercer build y re-tematizar su DS entero; `ui.logic2b.com` está detrás de **B-iii**, sin decidir. Corolario descartado explícitamente: **docs servidas por cada tenant**, que sí habrían multiplicado el alta — el dashboard enlaza con **URL absoluta**. Prosa en Markdown / cromo en i18n, con el idiom que el repo ya usaba para el blog (`import.meta.glob` + `{slug}.{lang}.md` + fallback **por página**, avisado en pantalla, nunca en silencio). Idiomas: cromo es/en/ca, **prosa es**. Enlazada desde la landing (nav, pie y bloque propio tras "niveles") y desde el dashboard con **`BotonAyuda`** en las **12 barras de pantalla**, con el mapa pantalla→página en un módulo único (`apps/dashboard/src/lib/ayuda.ts`). **`pnpm check` verde 42/42** (esta sesión corrió en la máquina de Andreu, sin el segfault de workerd del contenedor cloud). **B4 absorbida en C6 y cerrada.**
- **Frente B (marca Logic2B + landing de producto + docs)**: abierto 2026-07-19. **B0-lite + B3 + B1 + B2 HECHOS** (ADR 0016, 0017, 0018). **B2 (ADR 0018, 2026-07-20)**: web de tenant alineada al esqueleto del DS Logic2B **sin reskin** — la identidad mediterránea (ADR 0006) intacta. (1) Escala de radios derivada, base **4px** + `calc()` (`--lc-radius-sm/md/lg`) en `_template`+`demo`, expuesta a Tailwind; se propaga a toda la web por el token del tenant (antes 2px sueltos). (2) Ritmo de bloques tokenizado (`--spacing-section`/`py-section`) en el ritmo canónico (Home + secciones finales), cambio de valor cero. (3) Firma discreta **"powered by Logic2B"** en el pie: isotipo compartido vía `LogoMark.astro` (SVG, sin runtime React), `currentColor`, enlaza a la landing; `footer.poweredBy` (aria/title) en los 6 idiomas ×`_template`+`demo`. Convergencia de fuentes CERRADA en BRAND.md §3: web=Clash Display, producto=Space Grotesk. Verificado con Playwright contra el dev real (home nivel 3, pie con firma, 1366px y 375px). `pnpm check` verde (41/41). Pendiente **B4** (docs) + remate: re-medir Lighthouse ≥95 en producción (no se añaden fuentes ni JS). B1 (ADR 0017): dashboard reskinneado a Logic2B UI — `packages/ui` es ya librería React (cn + Button/Card/Badge/LogoMark shadcn); shell = sidebar agrupada plegable con isotipo; tokens/fuentes del DS; planning con el mapa de colores aprobado. Verificado en vivo. Remates en BACKLOG (rename literal de tokens, off-canvas móvil). **B0-lite + B3 HECHOS y en vivo** (ADR 0016): `packages/ui` con tema/tokens/isotipo Logic2B; `apps/site` = landing de producto (es/en/ca) sirviéndose en `camp.logic2b.com/`; demo movida a `camp.logic2b.com/demo/` (routing por prefijo en el mismo Worker, `localePath` consciente del `base`); `POST /api/leads`. Deploy manual con `pnpm --filter @logic-camp/api deploy:demo` (ahora compone site+web+dashboard, migra y despliega). Pendientes B1 (dashboard→Logic2B UI), B2 (web de tenant), B4 (docs) + remates en BACKLOG. Contrato de marca en `docs/BRAND.md`.
- **Fase actual**: 10 🟨 PARCIAL (ADR 0013 — reset nocturno + conmutador de nivel 1/3 + banner de demo hechos y verificados contra el Worker real; queda acceso readonly al dashboard sin registro —alcance sin decidir—, Cloudflare Web Analytics —credenciales— y `ui.logic2b.com`/Storybook —su propio objetivo de fase—). BACKLOG 7.x y 8.x cerrados en la misma sesión cloud (ADR 0014 + ADR 0015): cron de aviso de reservas `pending` colgadas y recordatorio de llegada al huésped, ambos genéricos para cualquier tenant con pagos (no solo la demo). Fase 9 sigue 🟨 PARCIAL detrás (ver ADR 0012 — solo queda el tenant de prueba real, bloqueado por credenciales de Cloudflare, no por código) · Siguiente: sesión con Andreu presente para el primer alta real con `--apply`, o seguir cerrando remates de Fase 10. Antes, en local: redeploy demo (`pnpm --filter @logic-camp/api deploy:demo` — el `main` de `tenants/demo/wrangler.jsonc` ahora es `./worker.ts`, el script de deploy no cambia), descargar fotos Higgsfield (`pnpm --filter @tenant/demo fetch:fotos`, script listo desde ADR 0024 — mismo bloqueo de red que sesiones 8 y C5), re-audit Lighthouse en producción.
- **Docs de cliente**: `docs/FUNCIONALIDADES.md` (sesión 14, al día con Fase 8 en sesión 19) — actualizar con cada funcionalidad nueva.
- **DESPLEGADO en la sesión 41 (2026-07-22)**: la landing atmosférica (ADR 0027), las 6 fotos del tenant y los cambios de dashboard de la sesión 38 están **por fin en producción** (`camp.logic2b.com`, versión `1d2c2f37`). Verificado en vivo: rutas es/fr/de/nl + `/demo/` 200, 0 imágenes rotas, 0 errores de consola; **Lighthouse contra producción desktop 98 / móvil 96** (LCP 1,0s / 1,8s — la foto del héroe no penaliza: es un `<img fetchpriority="high">`, sin preload); y la supresión RGPD de Fase 11 verificada logueada (`DELETE /guests/gst_044 → 409 {retention_hold, until:2029-08-18, basis:traveller_registry}` + aviso persistente con fecha exacta, no toast). **Pendiente**: desplegar la cuarta guía "gestión" añadida esta misma sesión (ver abajo) — NO está en producción.
- **Parte de viajeros (ADR 0028, sesión 43, 2026-07-23)**: 🟩 **IMPLEMENTADO y DESPLEGADO a la demo** (sesión 44, 2026-07-24), sin verificar contra el webservice real. Andreu validó el ADR (estado `aceptado`). Vertical completo: migración D1 **0006** aditiva (5 columnas nulables: `guests.sex/second_surname/doc_support_number/kinship` + `bookings.payment_kind`), paquete PURO **`packages/hospedajes`** (`buildParte` valida y devuelve issues por reserva/campo · `serializeParte` XML determinista y escapado —estructura provisional, honesta: los nombres/códigos exactos del XML se cierran contra la espec oficial cuando haya credenciales— · `HospedajesTransport` con `manualTransport` (descarga, opera hoy) y `sesTransport` (webservice real escrito, **NO verificado** —como Stripe/Redsys—), **22 tests puros**), config `tenants.modules.hospedajes` (schema Zod en `packages/config`) + secrets SES en el Worker, rutas `GET /hospedajes/parte?date=` y `POST /hospedajes/enviar` (con `audit_log`) **recogidas solas por el barrido de aislamiento** (46→48), acción `set_payment_kind`, pantalla **Parte de viajeros** en el dashboard + ficha de huésped ampliada + guía `gestion/parte`, y **seed con datos SES reales** (cero mocks: DNI+soporte para españoles, ~1/6 con un dato a falta para enseñar el estado "faltan datos"). **Corrección clave contra la espec** (no de memoria): el campo real es **"número de soporte del documento"**, no la "fecha/país de expedición" que el ADR anticipó. **Bug de contraste** cazado en la verificación en navegador y arreglado: los tokens `--lc-status-*-fg` son texto para el chip, no para el fondo de página (ilegibles en oscuro) → avisos en `foreground`/`muted-foreground` con el ámbar solo en el icono, AA en claro y oscuro. **Pendiente**: verificar contra el webservice SES real (credenciales + código de establecimiento), cerrar campos/códigos contra la espec oficial, traducir la prosa de la guía.
- **DESPLEGADO en la sesión 42 (2026-07-23)**: la cuarta guía "gestión" (informes/tarifas/ajustes) + los `?` del dashboard, en producción (`camp.logic2b.com`, versión `e3113865`). La deuda "desplegar guía gestión" de la sesión 41 (línea de arriba) queda **cerrada**.
- **DESPLEGADO en la sesión 44 (2026-07-24)**: el **parte de viajeros** (ADR 0028) en producción (`camp.logic2b.com`, versión `105e5097`, migración `0006_hospedajes.sql` aplicada en la D1 remota). Verificado logueado en `/admin/#/parte`: lista de llegadas con datos reales, banner "faltan datos en N campos" + aviso por fila, `<select>` de forma de pago, "Descargar XML" (modo manual, sin botón "Enviar" porque la demo no tiene secrets SES — correcto), `?`→`/docs/gestion/parte/` (200), web pública 200. **Hallazgo que costó la mitad de la sesión**: la demo **NO tiene reseed remoto automático** (el "reset nocturno" de las notas **no existe** — ni `scheduled()`, ni `deploy-demo.yml`, ni script; ver [[demo-sin-reseed-remoto]] y BACKLOG `[infra]`); el deploy solo lleva **schema**, no **datos**, así que la pantalla salió "no activado" hasta re-sembrar la remota a mano (wipe **hijos→padres** por `--command` porque D1 **sí** fuerza FKs y el `--file` masivo hace `fetch failed`, preservando `d1_migrations`, + `seed --file` que es INSERT-only). Reseed OK: 26.561 filas, `modules.hospedajes.enabled=1`, 2032 reservas/huéspedes restaurados.
- **HECHO en la sesión 45 (2026-07-24)**: **`pnpm db:seed:remote`** — reseed remoto de la demo FK-safe en un comando, cerrando la deuda `[infra]` que costó media sesión 44. Plan puro y testeado (`tenants/demo/remote-seed.ts`, reusa `DELETE_ORDER` del reset local; 6 tests) + shell fino bajo **doble candado** (`--apply` + `LOGIC_CAMP_ALLOW_REMOTE_SEED=1`, calcado de `runInfraPlan`), dry-run por defecto. El `--apply` real contra la remota queda para Andreu con credenciales (nunca ejecutado desde cloud, como `new:camping --apply`). **Sin cambios de comportamiento en runtime**: solo tooling + `export` de `DELETE_ORDER`.
- **HECHO en la sesión 45 (2026-07-24), 2º objetivo**: **recibo/ticket imprimible del check-out** (BACKLOG `[C4→C4.3]`) — botón "Imprimir recibo" en la ficha (`BookingPanel`) → `window.print()` sobre un recibo limpio (`BookingReceipt.tsx`, portal a `<body>`, oculto en pantalla y único contenido al imprimir, negro sobre blanco). Reutiliza el desglose auditable + cobros de la ficha y el nombre del establecimiento. Verificado en navegador (bundle real + stub + Playwright `emulateMedia:print`). Front-desk real, sin dominio nuevo ni credenciales.
- **HECHO en la sesión 48 (2026-07-25)**: **levantar un bloqueo desde el propio planning** (BACKLOG `[C1]`) — la barra rayada `lc-block` era pintura con `title`; ahora es un `role="button"` con `tabIndex=0`, `aria-label` (motivo + rango + unidad), activación por click y por Enter/Espacio, y la afordancia que le faltaba (`cursor: pointer`, realce al pasar por encima, anillo de foco del DS, todo por token). Click → `AlertDialog` con el detalle del bloqueo y, si es de **tipo**, el aviso de que levantarlo libera todas las unidades de ese tipo → `DELETE /blocks/:id` + toast + invalidación. El foco vuelve a la barra al cancelar. **Cero cambios de backend** (la ruta existía testeada desde C4; le faltaba la segunda pantalla que la llamara) y **sin arrastre**: un bloqueo no se mueve, se levanta y se vuelve a crear (ADR 0023 ya lo había decidido). Con esto el ciclo completo del bloqueo —crear y levantar— está en **las dos** pantallas, plano y planning.
- **Último `/check`**: **2026-07-25 (sesión 48) — cloud, 43/45 con los dos rojos re-verificados en aislamiento y ajenos a lo tocado**: `@logic-camp/api` **182/182** verde por su cuenta (flaky sólo bajo carga paralela) y `tenants/demo` `seed.test`+`remote-seed.test` **18/18**; el único rojo real sigue siendo el segfault de workerd sobre `reset.test.ts` (`ECONNREFUSED`, sólo contenedor cloud, no tocado). Dashboard typecheck + lint + build verdes. Referencia anterior: **2026-07-24 (sesión 45) — cloud, todo verde salvo el segfault ambiental de `reset.test`**: typecheck+lint+build **36/36 tareas**, tests **8/8 tareas no-demo** (API **182/182**), demo `seed.test`+`remote-seed.test` **18/18** en aislamiento. El único rojo es `tenants/demo:test` por el segfault documentado de workerd sobre `reset.test.ts` en el contenedor cloud (`kj/table.c++:57` / `ECONNREFUSED`) — **no tocado esta sesión** (el único cambio en `reset.ts` fue exportar `DELETE_ORDER`, sin cambio de comportamiento); en local es 45/45. La referencia local previa: 2026-07-23 (sesión 43) — local 45/45 verde (API **182/182**, hospedajes **22/22**, demo 18/18 incl. `reset.test` sin segfault en local). La referencia cloud anterior, por si se vuelve allí: 2026-07-21 (sesión 38) — cloud **38/42**, todos los rojos **ambientales y ajenos a lo tocado**. Verificado en aislamiento lo que sí se tocó: `@logic-camp/api` typecheck + **172/172** + lint verdes; `@logic-camp/dashboard` typecheck + build + lint verdes; `@logic-camp/ui` typecheck + **54/54** (incl. `theme-contrast`) + lint verdes; `@logic-camp/web` typecheck **0 errores** (no tocado). Rojos del paralelo: `web:build` crash de esbuild ("callback is not a function", worker reiniciado a mitad de sesión), `tenants/demo:test` crash del pool de workerd (el segfault documentado sobre `reset.test.ts`), `api:test` flaky bajo carga paralela. "Si ves 40/42 en cloud, es eso" (sesiones 32–37).
- **Repo**: https://github.com/amariner/logic2b-camp
- **Cloudflare**: login OK (en local). D1 `logic-camp-demo` migrada (0000+0001) y sembrada en remoto. Worker desplegado con `/api/*`; **pendiente redeploy** para activar la ruta nueva `camp.logic2b.com/*` con la web (esta sesión cloud no tiene credenciales — NO simulado).
- **Pendiente de Andreu (cierra Fase 0)**: registro DNS en zona logic2b.com: `AAAA camp → 100::` proxied. También: secrets `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` + var `DEPLOY_DEMO_ENABLED=true` en GitHub para el deploy automático de la demo.

## Sesiones

### Sesión 48 — 2026-07-25 · **[C1] Levantar un bloqueo desde el propio planning: la barra rayada deja de ser pintura** (remate C1/C4.4, sin ADR)

**Contexto**: sesión autónoma cloud (protocolo `docs/CONTINUA.md`), rama de sesión `claude/project-development-continue-4hz01z` partiendo de `origin/main` = `0434212`. Objetivo elegido: el candidato **[C1]** de SIGUIENTE-SESION — el único de la lista que es a la vez demo-visible (el planning es la pieza firma) y ejecutable sin credenciales. Cierra el ciclo que la sesión 47 dejó a medias: el **plano** ya crea _y_ levanta bloqueos desde su panel de unidad, pero en el **planning** las barras `lc-block` seguían siendo sólo pintura con un `title`.

**La decisión de diseño que gobernó el gesto**: el planning tiene su propio modelo de interacción — todo se arrastra (mover, estirar, crear, asignar). Un bloqueo **no** entra en ese modelo: no se mueve, se levanta y se vuelve a crear (así lo dejó ya decidido ADR 0023 al descartar "crear bloqueos arrastrando"). Así que el gesto es un **click discreto**, no un arrastre — y eso, además, sale gratis: `onRowPointerDown` ya se guarda con `e.target !== e.currentTarget`, de modo que pinchar una barra nunca arranca un arrastre de crear-reserva.

**Hecho**

- **La barra es un botón de verdad**, no pintura: `role="button"` + `tabIndex={0}` + `aria-label` con motivo, rango y unidad (`planning.bloqueo.aria`), activación por **click y por Enter/Espacio**, y `title` con la pista de qué pasa al pulsar. La afordancia visual faltaba por completo (parecía decoración): `cursor: pointer`, realce del borde y del texto al pasar por encima, y anillo de foco `--ring` del DS — todo en `.lc-block[role='button']`, con tokens, sin un solo hex.
- **Confirmación antes de borrar**, como las otras tres acciones destructivas (C3): `AlertDialog` con el detalle del bloqueo (motivo + `date_from → date_to`) y, si es un bloqueo **de tipo** (`unitId === null`, pintado en todas las unidades del tipo), el aviso explícito de que levantarlo las libera todas. Reutiliza las claves i18n que ya existían huérfanas (`confirmar.quitarBloqueo.*`, `bloqueo.quitad*`); sólo 2 claves nuevas.
- **El foco vuelve a su sitio**: `onCloseAutoFocus` devuelve el foco a la barra que abrió el diálogo al _cancelar_, y no lo intenta cuando se ha confirmado (la barra ya no existe: se comprueba con `isConnected`). Sin esto, "Volver" dejaba el foco en `<body>` — comprobado en el navegador antes de arreglarlo.
- Backend: **cero cambios**. `DELETE /api/admin/blocks/:id` ya existía, testeado y con rol `reception`; lo que faltaba era una segunda pantalla que lo llamara.

**Verificado**: `pnpm check` cloud **43/45**, y los dos rojos re-verificados en aislamiento y ajenos a lo tocado — `@logic-camp/api` **182/182** verde por su cuenta (flaky sólo bajo carga paralela, ya documentado) y `tenants/demo` `seed.test`+`remote-seed.test` **18/18**, quedando únicamente el segfault de workerd sobre `reset.test.ts` (`ECONNREFUSED`, sólo contenedor cloud). Dashboard typecheck + lint + build verdes. **En navegador contra el Worker real** (`wrangler dev` :8787 con `--persist-to .wrangler-demo`, D1 local re-sembrada, login por `fetch` a Better Auth): sobre el bloqueo de larga estancia de A-24 → `role`/`tabindex`/`aria-label`/`cursor:pointer` correctos, **foco de teclado con `:focus-visible = true`**, Enter abre el diálogo con motivo y rango, "Volver" **no borra** y devuelve el foco a la barra, click → "Levantar" → la barra desaparece y sale el toast "Bloqueo levantado". Claro y oscuro. Único error de consola: el `favicon.ico` 404 del bundle local (confirmado en el log del Worker, no es de la app).

**Trampa nueva para la lista**: en la verificación con Playwright, ir de `/admin/` a `/admin/#/…` **no recarga** (sólo cambia el hash), así que la app se queda con el estado "sin sesión" aunque el login por `fetch` haya devuelto 200 — hay que `reload()` después. Y el planning vive en la ruta **`/`**, no en `/planning`; se le pasa `?date=&unit=` para que la virtualización de filas desplace hasta la unidad que interesa.

**Sin terminar / diferido con motivo**: nada del objetivo. El resto de candidatos de la lista (adoptar primitivos de `packages/ui`, auditar `prefers-reduced-motion`, ADR del acceso readonly a la demo) sigue en SIGUIENTE-SESION.

**Siguiente paso**: ver `docs/SIGUIENTE-SESION.md`.

### Sesión 47 — 2026-07-24 · **[C4.4] Bloqueos desde el propio plano: panel de unidad + fix de defaults del diálogo** (remate C4/C7, sin ADR)

**Contexto**: sesión autónoma cloud (protocolo `docs/CONTINUA.md`), rama de sesión `claude/continuacion-proyecto-yhq05n` partiendo de `origin/main` = `705ed6e`. Objetivo elegido: el primer candidato de SIGUIENTE-SESION, **[C4.4] crear bloqueos desde el plano**, siguiendo su propia instrucción de "verificar primero qué hace hoy el diálogo". **Cierre**: Andreu dio en la misma sesión **permiso permanente** para que las sesiones cloud hagan merge a `main` — hecho aquí (ff `705ed6e → 27b9918` + este commit de docs), mandato escrito en `docs/CONTINUA.md` §7, rama de sesión borrada. Trampa que picó: el `main` local del contenedor era un resto del día 1 con historia pre-reescritura (6 commits del 17-jul que ya no son ancestros de origin) — `git reset --hard origin/main` antes del merge, sin pérdida (su contenido lleva en origin desde entonces).

**Lo que la auditoría previa encontró** (y convirtió el "pulido" en dos arreglos de verdad):

1. **`BlockDialog` perdía la unidad y la fecha en silencio**: el diálogo vive montado (animación de Radix) y sus `default*` se captaban en el `useState` del PRIMER render — "seleccionar la A-12 y pulsar Nuevo bloqueo" abría el formulario vacío. Afectaba a plano Y planning.
2. **`DELETE /api/admin/blocks/:id` no tenía UI**: la ruta existe y está testeada (rol reception, `admin.test.ts`), y las claves i18n `bloqueo.quitar`/`confirmar.quitarBloqueo.*` estaban escritas… pero ninguna pantalla la llamaba. Un bloqueo creado era eterno salvo SQL a mano.

**Hecho**

- **`BlockDialog`**: al abrir, resincroniza con la pantalla (`useEffect` sobre `open`): unidad seleccionada, fecha del día mirado, y "hasta" arranca en **una noche** — el caso común (avería hoy) queda a un click. Aplica a plano y planning.
- **`UnitPanel.tsx`** (nuevo): panel contextual de UNIDAD en el plano, mismo idiom de panel lateral que la ficha. Al pinchar una unidad **libre** → código + chip + tipo + "Libre la noche del X" + **"Bloquear esta unidad"** (diálogo precargado) + "Ver en el planning". Al pinchar una **bloqueada** → motivo y rango del bloqueo que cubre esa noche + **"Levantar el bloqueo"** con confirmación (`AlertDialog`, las claves que estaban huérfanas) → `DELETE /blocks/:id` + invalidación de `['planning']`. Si el bloqueo es **de tipo**, el panel y la confirmación avisan de que cubre todas las unidades del tipo. Esc cierra, foco al abrir, chips nuevos `st-free`/`st-blocked` en `styles.css` (tokens, sin hex).
- **`Plano.tsx`**: resuelve unidad seleccionada + estado + bloqueo que cubre la fecha (unidad o tipo) y monta el panel solo en libre/bloqueada (ocupada sigue abriendo la ficha). 5 claves i18n nuevas `plano.unidad.*`.

**Verificado**: dashboard typecheck+lint+build verdes. `pnpm check` cloud: **42/45 + los 3 ambientales documentados re-verificados en aislamiento** — `api:test` **182/182**, `web:build` verde, demo `seed.test`+`remote-seed.test` **18/18**; el único rojo real sigue siendo el segfault de workerd sobre `reset.test.ts` (señal 11, solo contenedor cloud). **En navegador contra el Worker real** (`wrangler dev` :8787 + D1 local re-sembrada + login por fetch a Better Auth): ciclo completo con Playwright — click en BM-06 libre → panel; "Bloquear esta unidad" → diálogo con **BM-06 + 12 ago → 13 ago precargados**; crear → la unidad pasa a "Bloqueada · Mantenimiento" rayada; click → panel de bloqueada con motivo y rango; levantar + confirmar → libre otra vez. Claro y oscuro, 0 errores de consola (solo el favicon del bundle local).

**Trampa nueva para la lista**: el `wrangler dev` del demo lanzado a mano necesita `--persist-to <raíz>/.wrangler-demo` — sin eso levanta una D1 local vacía ("no such table: users") aunque `pnpm db:seed` haya ido bien, porque los scripts `db:*` de la raíz persisten ahí.

**Sin terminar / diferido con motivo**: el gesto en el planning (click en la barra rayada de un bloqueo → levantarlo) queda en BACKLOG — el planning tiene su propio modelo de interacción (arrastre) y merece su pase; el plano ya cubre el ciclo entero.

**Siguiente paso**: ver `docs/SIGUIENTE-SESION.md`.

### Sesión 46 — 2026-07-24 · **Protocolo "continúa con el desarrollo" (docs/CONTINUA.md) + iconos de servicio en el plano** (remate [C7], sin ADR)

**Contexto**: `git fetch` de arranque OK (`main` = `origin/main` = `07fbe73`, árbol limpio). Mandato nuevo de Andreu para las sesiones venideras: **el MVP es una demo fake** — no configurar servicios externos reales (Resend, Stripe, SES…) y que cada chat nuevo funcione con solo "continúa con el desarrollo de este proyecto", con la IA decidiendo sola. Eso descarta las opciones B (SES real) y C (alta real) del prompt anterior (credenciales/Andreu) y D seguía descartada con motivo (ADR 0025 §3).

**Hecho — objetivo 1: la metodología**. **`docs/CONTINUA.md`**: protocolo de sesión autónoma en 8 pasos (sincronizar → situarse → elegir UN objetivo ejecutable sin credenciales, prioridad "lo que el cliente ve en la demo" → implementar → verificar → documentar → commit+push a main → cerrar), con la lista explícita de lo que una sesión autónoma NO hace (`--apply` remoto, deploy de tenant, secrets, reabrir decisiones cerradas). Enganchado desde `CLAUDE.md` (sección nueva "Sesiones autónomas") para que cualquier chat lo recoja sin más prompt.

**Hecho — objetivo 2: iconos de servicio en el plano** (BACKLOG [C7]). El `icon` de `PlanoServiceIcon` estaba tipado desde ADR 0021 pero nunca se dibujaba. En `CampingMap.tsx`: mapa `SERVICE_ICONS` de los 7 servicios a componentes lucide (reception→`ConciergeBell`, pool→`Waves`, restaurant→`Utensils`, wc→`ShowerHead`, playground→`Baby`, market→`ShoppingCart`, shop→`Store` — todos verificados presentes en lucide-react 0.550) renderizados **dentro** del `<svg>` del plano (svg anidado válido; color por `currentColor` → `--muted-foreground`, nunca hex suelto), tamaño derivado del recinto (`clamp(min(w,h)*0.35, 12, 18)`), icono centrado y etiqueta debajo. Sin tocar geometría, API ni descriptor: solo la piel.

**Verificado**: `pnpm check` **45/45 verde** (local, incl. `reset.test` sin segfault). En navegador contra el **Worker real** (`wrangler dev` :8787, D1 local re-sembrada — el seed local estaba viejo y el plano salía "automático"): los 7 servicios con su glifo en **claro y oscuro**, 0 errores de consola. Nota de proceso: el formulario de login no responde a los eventos sintéticos del panel del navegador (React controlado); el login se hizo por `fetch` al endpoint real de Better Auth — mismo backend, sin stub.

**Siguiente paso**: ver `docs/SIGUIENTE-SESION.md`.

### Sesión 45 — 2026-07-24 · **`pnpm db:seed:remote`: reseed remoto FK-safe en un comando** (deuda [infra], sin ADR)

**Contexto**: `git fetch` de arranque **sí** sincronizado (`main` local = `origin/main` = `4e246c3`, árbol limpio — la trampa de sesiones anteriores no picó esta vez). Objetivo elegido con Andreu (una sesión = un objetivo): **Opción A** — cerrar la deuda `[infra]` del BACKLOG que costó media sesión 44: encapsular el reseed remoto de la demo (que **no** existe como automatismo — no hay reset nocturno remoto) en un solo comando. Pequeño, alto valor, sin credenciales nuevas para construirlo. No es fase nueva → sin ADR.

**Hecho** (tooling puro + shell fino, calcado del idiom de `new:camping`)

- **`tenants/demo/remote-seed.ts`** (PURO, sin `node:`, typecheck+test): `buildRemoteSeedCommands()` devuelve el plan completo como argv — regenerar `seed.sql` → vaciar las 21 tablas **hijo→padre** con `--command` una a una → sembrar con `--file seed.sql`. Reusa `DELETE_ORDER` de `reset.ts` (**exportado**, fuente única: el wipe local y el remoto no pueden divergir); `d1_migrations` se preserva sola por no estar en el orden.
- **`tenants/demo/remote-seed.test.ts`** (**6 tests**): fija las tres lecciones de la sesión 44 — 21 tablas hijo→padre en el mismo orden que el reset local, `d1_migrations` nunca tocada, el `--file` va solo en el seed final (el wipe por `--command`), y todos los comandos apuntan a `--remote` + config del demo. Corre limpio en el pool de workerd (el fichero puro no importa `node:`).
- **`tenants/demo/scripts/seed-remote.ts`** (shell fino, en `scripts/` como `fetch:fotos`, no bundleado al Worker): imprime el plan (dry-run por defecto) o lo lanza con `spawnSync`. **Doble candado** calcado de `runInfraPlan` (ADR 0012 §5): ejecuta solo con `--apply` **Y** `LOGIC_CAMP_ALLOW_REMOTE_SEED=1` (+ credenciales de Cloudflare). Sin los dos, no toca nada. Impresión con comillas para líneas copiables a mano; ejecución sin shell (argv).
- **Wiring**: `pnpm db:seed:remote` (raíz) → `@tenant/demo seed:remote` → `tsx scripts/seed-remote.ts`. Documentado en `tenants/demo/README.md`. Deuda `[infra]` del BACKLOG marcada **hecha**.

**Verificado** (sin tocar la remota — no hay credenciales en cloud): dry-run imprime el plan completo (23 pasos); `--apply` sin la env var → **bloqueado con exit 1** (candado probado); `remote-seed.test` **6/6**; `seed.test`+`remote-seed.test` **18/18**; typecheck+lint+build **36/36 tareas**; tests no-demo **8/8** (API 182/182). El `--apply` real contra la D1 remota queda para Andreu con credenciales, exactamente como `new:camping --apply` (nunca ejecutado desde el contenedor).

**Sin terminar / diferido con motivo**: el `--apply` real no se ha ejecutado (credenciales de Cloudflare — mismo candado que Fase 9). Sigue sin existir un reseed **automático** (cron / GH Action): decisión consciente — el reseed remoto es destructivo y raro, un comando bajo doble candado es lo correcto, no un automatismo.

**Segundo objetivo (misma sesión, tras "continúa con el desarrollo")**: con B y C bloqueadas por credenciales y D descartada con motivo (ADR 0025 §3), se eligió el remate de más valor front-desk que se puede cerrar y verificar sin credenciales: **el recibo/ticket imprimible del check-out** (`[C4→C4.3]`). Botón "Imprimir recibo" en la ficha (`BookingPanel`, sección desglose) → `window.print()`; recibo presentacional `BookingReceipt.tsx` montado por **portal a `<body>`**, oculto en pantalla y único contenido al imprimir (`@media print`: `#root` oculto, `.lc-receipt` en block), **colores fijos negro/blanco** (el modo oscuro no llega al papel). Reutiliza el desglose auditable + cobros de la ficha (misma `conceptLabel`/`eur`/`fecha`, invariante 2 intacto) + nombre del establecimiento (`/api/admin/settings`, caché compartida con Ajustes). Honesto: "No es una factura." 7 claves i18n `recibo.*`. **Verificado en navegador** (bundle `vite build` real + stub Node + Playwright `emulateMedia:print`, patrón C1/C5): recibo completo y correcto, `#root` oculto/recibo en block, negro sobre blanco, 0 errores (salvo el favicon del stub). Dashboard typecheck+lint+build verdes. **Diferido** (BACKLOG): vídeo/GIF de gestos, traducción de guías — sin cambios.

**Siguiente paso**: ver `docs/SIGUIENTE-SESION.md`.

### Sesión 44 — 2026-07-24 · **Deploy del parte de viajeros a la demo** (sin ADR, remate de la 43)

**Contexto**: `main` local al día con `origin/main` (`e6c7a2f`, el merge de la 43 ya subido). `git fetch` de arranque falló por un corte de DNS transitorio; se reintentó al recuperar red y **sí** estaba sincronizado. Objetivo elegido con Andreu al empezar (una sesión = un objetivo): **Opción A — desplegar el parte** de la sesión 43. Sin cambios de código: solo deploy, reseed remoto y docs.

**Hecho**

- **Pre-vuelo**: `pnpm check` **45/45 verde** (local, sin cambios), `wrangler whoami` OK, migración `0006_hospedajes.sql` confirmada **pendiente** en la D1 remota.
- **`deploy:demo`** (`apps/api`): build de site+web(`BASE_PATH=/demo`)+dashboard → copia a `site/dist/{demo,admin}` → **migración 0006 aplicada en remoto** → `wrangler deploy` del Worker. Versión **`105e5097`**, triggers `camp.logic2b.com/*` + crons activos.
- **Reseed remoto de la demo** (ver "Hallazgo"): wipe FK-safe tabla a tabla + `seed --file` → **26.561 filas**, `modules.hospedajes.enabled=1`, `codigoEstablecimiento=CS-DEMO-0001`, 2032 reservas/huéspedes/booking_guests restaurados, `d1_migrations` preservada.
- **Verificado en producción** (logueado `gerencia@calasereno.example`, rutas hash): `/admin/#/parte` con lista de llegadas real, banner "faltan datos en 3 campos", aviso por fila con enlace a la ficha, `<select>` de forma de pago (Plataforma/Transferencia/Tarjeta/Sin forma de pago), **"Descargar XML"** presente y **sin "Enviar"** (modo manual, correcto sin secrets SES). `/docs/gestion/parte/` y `/demo/` → 200.

**Hallazgo (raíz del sobrecoste de la sesión)**: la demo **no re-siembra la D1 remota sola**. El "reset nocturno" que asumían las notas de la 43 **no existe en el código**: el `scheduled()` del Worker solo purga holds/avisos/retención, `deploy-demo.yml` solo hace `wrangler deploy`, y `db:reset`/`db:seed` son **solo locales**. Por eso, tras el deploy, la pantalla salió **"este camping todavía no tiene activado el parte"** (degradación limpia, no un fallo): la migración lleva el **schema** pero `modules.hospedajes` vivía solo en el **seed**, y la remota tenía datos viejos. Re-sembrar a mano tuvo dos trampas: (1) **D1 sí fuerza foreign keys** → `DELETE FROM bookings` suelto da `FOREIGN KEY constraint failed`; hay que borrar **hijos→padres**; (2) el `--file` con miles de borrados hace `fetch failed` (timeout del batch) → ir **tabla a tabla con `--command`** (requests pequeños), preservando `d1_migrations`. El `seed.sql` es **INSERT-only** (no idempotente): exige DB vacía. Registrado en `docs/BACKLOG.md` `[infra]` y en memoria `demo-sin-reseed-remoto` (pendiente: un `pnpm db:seed:remote` que encapsule wipe FK-safe + seed).

**Sin terminar / diferido con motivo**: `sesTransport` sigue **sin verificar** contra el webservice SES real (credenciales — misma categoría que Stripe/Redsys). Nombres/códigos exactos del XML sin cerrar contra la espec oficial. Prosa de la guía solo en `es`. La descarga real del XML **no** se probó desde el navegador (requiere permiso de descarga; el botón y el modo manual quedan verificados por presencia).

**Verificado**: `pnpm check` **45/45** (local, sin cambios de código). Deploy y reseed verificados contra la D1/Worker **remotos** reales y en el navegador contra producción.

**Siguiente paso**: ver `docs/SIGUIENTE-SESION.md`.

### Sesión 43 — 2026-07-23 · **Parte de viajeros** (ADR 0028) · fase propia

**Contexto**: `main` local al día con `origin/main` (árbol limpio, `git fetch` de arranque como manda la trampa de sesiones anteriores — esta vez sí estaba sincronizado). El trabajo de la sesión 42 (sistema EQUIPO, skill `/equipo`, ADR 0028) **ya estaba commiteado y subido** (`d7009a3`), al contrario de lo que anticipaba el prompt. Andreu **validó el ADR 0028** al empezar → estado `aceptado`, luz verde para implementar.

**La decisión que ordenó el alcance**: el ADR se escribió reconociendo por adelantado dos huecos "de memoria" a cerrar contra la especificación oficial. Al investigarla (SES.Hospedajes / RD 933/2021), el campo que el ADR llamó "fecha/país de expedición del documento" resulta ser **"número de soporte del documento"** — un dato distinto del número, que en el DNI es el código IDESP. Justo el motivo por el que el contrato pide cerrar contra la espec y no de memoria. Se corrigió en la migración, el modelo y la ficha.

**Hecho** (vertical completo, en el orden del ADR)

- **Migración D1 `0006` aditiva** (5 columnas nulables, sin backfill, mismo criterio que 0004/0005): `guests.sex`, `second_surname`, `doc_support_number`, `kinship` (parentesco, solo menores <14) + `bookings.payment_kind` (forma de pago, dato **propio**, no derivado de `payments.provider`). Reflejada en `schema.ts`.
- **`packages/hospedajes`** (paquete PURO, espejo de `payments`/ADR 0011, **22 tests**): `buildParte` valida antes de generar y devuelve un `ParteIssue` por reserva/campo que falta (adulto vs menor de 14, pasaporte sin exigir soporte/2º apellido, estancia sin forma de pago…); `serializeParte` produce XML determinista y escapado — **estructura provisional y honesta**, con aviso de que nombres/códigos exactos se cierran contra la espec oficial; `HospedajesTransport` con `manualTransport` (descarga, opera desde el día uno) y `sesTransport` (webservice real escrito con `fetch` inyectable, **sin verificar** hasta credenciales, como Stripe/Redsys/Resend).
- **Config + orquestación**: `tenantHospedajesSchema` en `packages/config` (`modules.hospedajes`), secrets SES en el `Worker` (`Bindings`, no en `modules`), y `apps/api/src/hospedajes.ts` (`loadHospedajesConfig` + `resolveTransport` + `gatherEstancias` + `buildParteForDate`, resultado discriminado disabled/empty/issues/ready).
- **API**: `GET /api/admin/hospedajes/parte?date=` y `POST /api/admin/hospedajes/enviar` (con `audit_log`), rol `manager`. **Nacieron cubiertas por el barrido de `isolation.test.ts`** (46→48 sin tocar el test — la propiedad de diseño del ADR 0026 en acción). Acción `set_payment_kind` en `bookingActionSchema`. Campos SES añadidos a `guestCreate`/`guestPatch` (Zod). **+10 tests de API → 182/182** (7 de orquestación en `hospedajes.test.ts` + 1 de `set_payment_kind` + 2 del barrido).
- **Dashboard**: pantalla **Parte de viajeros** (`pages/Parte.tsx`) — navegación por día, lista de llegadas, avisos de datos que faltan con enlace a la ficha, `<select>` de forma de pago por estancia, botones Descargar XML / Enviar (este solo si el transporte es `ses`). Ruta + nav en el grupo Gestión + `ayuda.ts` (`/parte → gestion/parte`) + i18n. **Ficha de huésped ampliada** (`GuestsSection`) con 2º apellido, sexo, nº de soporte y parentesco.
- **Guía `gestion/parte.es.md`** (escrita contra la pantalla real, principio "la página publicada es la especificación") — el índice de docs pasa a **4 páginas** en gestión; cromo de la guía actualizado en los **6 idiomas** para mencionar el parte.
- **Seed con datos SES reales** (cero mocks): módulo `hospedajes` activo en la demo, `payment_kind` rotando por reserva, DNI+nº de soporte para huéspedes españoles y pasaporte para extranjeros, **~1 de cada 6 con un dato a falta** para que la pantalla enseñe también el estado "faltan datos". `seed.sql` regenerado (gitignored).

**Hallazgo propio en la verificación**: los tokens `--lc-status-*-fg` son el color de texto **sobre el chip** (casi negro), no sobre el fondo de página — usados como texto de aviso quedaban **ilegibles en modo oscuro** (viola el contraste AA del contrato). Corregido: texto en `foreground`/`muted-foreground`, ámbar solo en el icono. Verificado legible en claro **y** oscuro.

**Verificado**: `pnpm check` **45/45 tareas verde** (local). Navegador contra los bundles reales (patrón stub Node, sin wrangler): la guía `/docs/gestion/parte/` renderiza con índice de 4 páginas y el índice de docs muestra las 4 tarjetas; la pantalla del dashboard renderiza en claro y oscuro con **0 errores de consola**, los avisos en ámbar legibles, el `?` apuntando a `camp.logic2b.com/docs/gestion/parte/`, y las dos estancias (una completa con "Tarjeta", otra con dos avisos + enlace a la ficha).

**Sin terminar / diferido con motivo**: NO desplegado (`deploy:demo`). `sesTransport` **NO verificado** contra el webservice real (sin credenciales — misma categoría que Stripe/Redsys). Los nombres/códigos exactos del XML (sexo, parentesco, país en alpha-3 —la ficha guarda alpha-2—, forma de pago) se cierran contra la espec oficial cuando se implemente el envío real. Prosa de la guía solo en `es` (fallback visible, criterio ADR 0025).

**Siguiente paso**: ver `docs/SIGUIENTE-SESION.md`.

### Sesión 41 — 2026-07-22 · **Deploy de la sesión 40 + guías de gestión** (remate BACKLOG, sin ADR)

**Contexto**: sesión en local, con Andreu presente. El `main` local **sí** estaba al día con `origin/main` esta vez (se comprobó con `git fetch` de arranque, como manda la trampa de las sesiones 36/38/40). Dos bloques: primero desplegar y medir lo que la sesión 40 dejó sin subir; después, elegido por Andreu, el remate de las **guías de gestión**.

**Hecho — bloque 1: desplegar y medir** (lo que pedía el prompt de la 40)

- **Desplegada la demo** (`pnpm run deploy:demo`, versión `1d2c2f37`): se subieron de una vez la landing atmosférica (ADR 0027), las 6 fotos del tenant descargadas en la 40, y los cambios de dashboard de la **sesión 38** (gris de sidebar + off-canvas móvil) que llevaban dos sesiones sin desplegar. Migraciones remotas aplicadas, cron activo.
- **Verificado en producción**: `/` `/fr/` `/de/` `/nl/` `/demo/` y las fotos del héroe → 200; h1 traducidos correctos; héroe atmosférico + marco `captura-web.webp` + galerías del tenant cargando, **0 imágenes rotas, 0 errores de consola**.
- **Lighthouse real contra producción** (Chrome headless): **desktop 98 / móvil 96** en Performance; accesibilidad 96/100, best-practices 100, SEO 100. LCP 1,0s (desktop) / 1,8s (móvil), CLS 0. **La foto del héroe (224KB) NO penaliza**: el elemento LCP es `<img src="/hero-atmosfera.webp" fetchpriority="high">` — ya prioriza la carga, sin necesidad de preload ni bajar calidad. Se descarta la mitigación que el prompt tenía preparada.
- **Verificada la supresión RGPD de Fase 11** (pendiente logueada): abierto un cliente con estancia reciente (Emma Bakker, estancia 4–18 ago 2026) e intentada la supresión → `DELETE /api/admin/guests/gst_044 → 409 {error:"retention_hold", until:"2029-08-18", basis:"traveller_registry"}`. Fecha exacta y calculada (salida 18 ago 2026 + 3 años del RD 933/2021), no error genérico. La UI **no** usa toast: pinta un aviso persistente (`role="alert"`, "Todavía no se pueden suprimir… a partir del 18 de agosto de 2029… puedes copiar este aviso y enviárselo") — por diseño, para que se lea entero y se copie. También confirmado que el bloque "Protección de datos" de la ficha renderiza con sesión.

**Hecho — bloque 2: guías de gestión** (remate BACKLOG [C6], objetivo elegido por Andreu)

- **Decisión de IA con Andreu**: informes/tarifas/ajustes son de **gestión del negocio** (gerencia/dirección), ni recepción de mostrador ni decisión de compra → **cuarta guía "gestión"** propia, no dentro de "dueño" (para no mezclar páginas estratégicas —niveles— con operativas —informes—). `GUIAS` pasa a `['recepcion','gestion','dueno','tecnica']`, una escalera: mostrador → llevar el negocio → decidir → informático.
- **Tres páginas de prosa** (`apps/site/src/content/docs/gestion/{informes,tarifas,ajustes}.es.md`), escritas **contra el código real** de cada pantalla (principio de Fase 11 "la página publicada es la especificación"): Informes (3 rangos, 5 tiles con la distinción ingresos/cobrado, ocupación por tipo, solo-lectura en vivo); Tarifas (tabla por temporada, 6 importes + mín. noches, invariante 3 a la vista —cambiar tarifa no toca reserva confirmada—, temporadas por prioridad); Ajustes (nombre/zona/moneda editables, nivel+idiomas de solo-lectura porque afectan al despliegue, notificaciones on/off sin deploy + remitente + buzón).
- **Cromo en los 6 idiomas** (`content/{es,en,ca,fr,de,nl}.json`): `docs.guias.gestion.{nombre,para,texto}`, subtítulo del índice reescrito ("Tres/Cuatro guías…") y `docs.seo.title/description` con la gestión añadida. Prosa solo `es` con aviso de fallback (mismo criterio que ADR 0025 §3).
- **Ayuda contextual conectada**: `apps/dashboard/src/lib/ayuda.ts` deja de devolver `null` en `/informes` `/tarifas` `/ajustes` → el `?` (ya presente en las tres pantallas) se pinta y abre su página. Sin tocar el componente.

**Verificado**: `pnpm check` **42/42** (local; el único "hint" de site:typecheck es preexistente en Landing.astro:417, ajeno). Build del site **180 páginas** (antes 156), las 24 páginas de gestión (3 + índice × 6 idiomas) generadas. Navegador contra el `dist` servido: índice `/docs/` con **4 tarjetas** en orden y recuentos correctos (14·3·3·4), página de tarifas renderizada (índice lateral, prosa con negritas/listas, 0 errores de consola), y `/en/docs/gestion/informes/` con cromo en inglés + aviso de fallback + prosa en es. Typecheck del dashboard limpio.

**Deuda conocida de la sesión**: la cuarta guía **no se desplegó a producción** (el `?` del dashboard en producción todavía apunta a páginas que aún no existen allí; el dashboard desplegado sigue siendo el de antes de este cambio, así que en producción no hay incoherencia hasta que se despliegue). Primer paso de la próxima sesión: `cd apps/api && pnpm run deploy:demo` para subir las guías + los `?` juntos.

**Siguiente paso**: ver `docs/SIGUIENTE-SESION.md` — desplegar las guías de gestión y luego elegir frente (Fase 9 alta real, o Parte de viajeros con su ADR 0028).

### Sesión 40 — 2026-07-22 · **Landing atmosférica** (ADR 0027) — primera sesión en la máquina de Andreu con Higgsfield funcionando

**Contexto**: sesión en local (no cloud). La primera mitad del chat fue planificación (sesión 39 de facto): diagnóstico de por qué la landing de venta se sentía "de plantilla" y decisión de Andreu de reabrir la parte "sin fotografía" de la marca del Frente B → dirección **atmosférica**. El main local estaba **1 commit por detrás** de origin/main (tercera vez: sesiones 36, 38 y esta) — sincronizado con fast-forward antes de tocar nada. Rama `sesion-40-landing-atmosferica`.

**Hecho**

- **ADR 0027 — landing atmosférica**: la landing de venta lleva fotografía de camping como **atmósfera contenida** (héroe con scrim AA); el resto de superficies Logic2B siguen neutras; tipografía/paleta no cambian (atmosférica ≠ crema+serif+terracota). Excepción anotada en `BRAND.md` §0.
- **Desbloqueado el atasco de 4 sesiones**: `pnpm --filter @tenant/demo fetch:fotos` corrió sin el bloqueo de red del contenedor — las **6 fotos del tenant (C5.1)** descargadas y commiteadas en `tenants/demo/content/media/`.
- **Héroe nuevo**: foto Higgsfield generada esta sesión (contrato de arte ADR 0024: pino carrasco, primera luz, sin gente, sin HDR; 219KB desktop + 69KB móvil) + **marco de navegador con captura REAL de la web del tenant** con su widget de disponibilidad a la vista (cumple por fin "el héroe es el widget funcionando" del CLAUDE.md). Captura tomada con Playwright contra el dev real (patrón C5), sin la franja de demo.
- **Cuerpo de la landing**: bloques "dos caras" con captura por cara (web/planning), planning firma a ancho completo con `captura-plano.webp` asomando (existía sin usar), niveles como **escalera** (número 01–04 + destacado elevado con `Recomendado` i18n), iconos lucide inline (sin dependencia), checks en vez de puntitos, y **reveal on-scroll** con doble guardia: sin JS todo visible desde el primer paint (`html.lc-js` como gate) y `prefers-reduced-motion` salta el observer. Bug encontrado y arreglado por verificación en navegador: la regla de ocultación ganaba por especificidad a la de visibilidad (`html.lc-js .lc-reveal` (0,2,1) > `.lc-reveal.lc-visible` (0,2,0)).
- **fr/de/nl completos** (cierra [B3] del BACKLOG): `fr.json`/`de.json`/`nl.json` traducidos enteros (landing + cromo de guías) + `LOCALES` ampliado a 6 — **156 páginas** construidas, hreflang y sitemap salen solos del bucle existente.

**Verificado**: typecheck 0 errores; build de site limpio; **`pnpm check` 42/42** (local, sin los rojos ambientales del cloud); Playwright full-page a **1366px y 375px** — 0 errores de consola, 0 imágenes rotas (la única "rota" en móvil es el plano `hidden sm:block`, que nunca se muestra ni carga ahí, correcto); reduced-motion con 0 elementos ocultos; `/fr/` `/de/` `/nl/` responden 200 con su h1 traducido.

**Deuda conocida de la sesión**: la prosa de las guías sigue solo en `es` — los 3 idiomas nuevos ven el aviso de fallback (decisión del ADR 0025, sin cambio). El screenshot del panel de preview quedaba en blanco tras scroll programático (limitación de la herramienta, no de la página — verificado vía Playwright).

**Siguiente paso**: desplegar (`cd apps/api && pnpm run deploy:demo`) — se llevan de una vez la landing nueva, las 6 fotos del tenant Y los cambios de dashboard de la sesión 38 que seguían sin desplegar; re-medir Lighthouse ≥95 en producción con la foto del héroe. Después: Fase 9 (alta real) o parte de viajeros (su ADR será el **0028**, el 0027 lo ocupó esta sesión).

### Sesión 38 — 2026-07-21 · **Remates cortos de BACKLOG** (sin ADR — no es fase nueva)

**Contexto**: con los Frentes B/C cerrados y la Fase 11 desplegada, Andreu eligió una sesión corta de remates. Rama `claude/estas-69xl50`. **El main local estaba 2 commits por detrás de `origin/main`** (solo docs del despliegue de la Fase 11) — reseteada la rama a `origin/main` antes de tocar nada. La trampa de la sesión 36 volvió a estar viva; sigue mereciendo el `git fetch` de arranque.

**Hecho** (dos remates + un bug de raíz que destapó el segundo)

- **"En casa" en `/reservas` y en la ficha de cliente** ([C4] BACKLOG): la tabla de gestión mostraba "Confirmada" a un huésped presente. Ahora el estado se **deriva** igual que en el planning/plano/Llegadas (`status==='confirmed' && checkedInAt && !checkedOutAt → 'inhouse'`, misma expresión que `Planning.tsx:67`, inline siguiendo el precedente del repo). `/reservas` no necesitó API (`BookingListItem` ya traía los timestamps). El historial de la ficha sí: se añadieron `checkedInAt`/`checkedOutAt` al select de `GET /guests/:id` (aditivo, ruta existente → el barrido de aislamiento no se toca) y al tipo `GuestBooking`, con el test de `admin.test.ts` extendido para cubrirlo.
- **Sidebar móvil off-canvas** ([B1] BACKLOG): bajo `md` la sidebar persistente se oculta (`hidden md:flex`) y una barra con hamburguesa abre la navegación en el primitivo **`Sheet`** (`side="left"`: trampa de foco + Escape + overlay, ya existía desde C2); pulsar un enlace cierra el drawer. El contenido de la sidebar se extrajo a **`SidebarInner`**, compartido por la aside de escritorio y el off-canvas — añadir un enlace no se puede olvidar en una de las dos vistas. El `<Outlet>` se envolvió en un `<main>` flex-col que descuenta la barra móvil (las páginas usan `h-full`/`flex-1` esperando ser hijo-flex del contenedor).
- **Bug de raíz destapado** (`packages/ui/src/theme.css`): la familia `--color-sidebar*` **no estaba mapeada en `@theme`**, así que `bg-sidebar`/`border-sidebar-border` **no generaban CSS desde B1** (ADR 0017) — la sidebar iba **transparente**, invisible sobre página blanca pero destapada por el overlay del drawer (el panel se veía a través). Mapeada la familia completa (8 tokens que ya existían en `:root`/`.dark`). Misma clase de bug "el DS funciona por coincidencia" del hallazgo Tailwind de ADR 0020. **Efecto lateral visible**: la aside de escritorio ahora tiene su gris tenue real (`--sidebar`, oklch 98.5% en claro) que la separa del contenido — el look shadcn buscado, no una regresión.

**Verificado** (patrón stub sin workerd, como C1/C5/C6): `vite build` real del dashboard + servidor Node que sirve el bundle y stubbea `/api/auth/get-session` + `/api/admin/*`, con Playwright/chromium. **1366px**: aside visible, sin hamburguesa. **375px**: aside oculta, hamburguesa visible, el drawer abre con los **12 enlaces** y **cierra al navegar** (URL → `/reservas`). Panel opaco confirmado en **claro** (`oklch 0.985`) y **oscuro** (`oklch 0.205`). Capturas enviadas a Andreu.

**`pnpm check`**: cloud **38/42**, todos los fallos **ambientales y ajenos a lo tocado**, confirmados en aislamiento: `api` typecheck + **172/172** tests + lint verdes; `dashboard` typecheck + build + lint verdes; `ui` typecheck + **54/54** (incl. `theme-contrast`, mi cambio no rompe el contrato AA) + lint verdes; `web` typecheck **0 errores** (no tocado). Los rojos del paralelo: `web:build` crash de esbuild ("callback is not a function", worker reiniciado a mitad de sesión), `tenants/demo:test` crash del pool de workerd (`ECONNREFUSED`/unhandled rejection en `[worker eval]` — el segfault documentado sobre `reset.test.ts`, no tocado), `api:test` flaky bajo carga paralela. Es el "si ves 40/42 en cloud, es eso" de las sesiones 32–37.

**Siguiente paso**: ver `docs/SIGUIENTE-SESION.md` — Fase 9 (alta real, con Andreu + credenciales) o Parte de Viajeros (ADR 0027). Quedan de este bloque de remates: fr/de/nl de la landing y guías de gestión.

### Sesión 37 — 2026-07-21 · **Fase 11 — endurecimiento** (ADR 0026)

**Contexto**: primera fase tras cerrar los Frentes B y C. Es la puerta declarada antes del primer camping real en producción. Rama `claude/endurecimiento-fase11`. (El `main` local **sí** estaba al día esta vez — se comprobó con `git fetch` antes de tocar nada, como quedó escrito tras el susto de la sesión 36.)

**El hallazgo que reordenó la fase.** La Fase 11 estaba en el plan como una lista de buenas intenciones ("aislamiento, RGPD, backups, observabilidad, carga, legales") sin criterio para ordenarla. La auditoría previa al ADR le encontró uno, y no era el esperado: en C6 (sesión 36) publicamos `camp.logic2b.com/docs/tecnica/datos-rgpd/`, la página que lee **el informático del cliente antes de que su jefe firme** — y **cuatro de sus afirmaciones no eran verdad**:

| Afirmación publicada                                            | Realidad medida                                                                                                      |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| "test automático explícito que en cada entrega intenta la fuga" | Existía, cubría **3 de 40 rutas** (7,5 %)                                                                            |
| "el sistema guarda el consentimiento con su fecha"              | `admin.ts:839` lo escribía siempre `null`, y el _checkbox_ del funnel **no tenía `name`**: nunca llegaba al servidor |
| "Registro de auditoría **inalterable**"                         | Tabla D1 normal. La demo la borra entera cada noche                                                                  |
| "volcado en SQL **y en CSV**… pedid una exportación de prueba"  | **No existía exportador de ninguna clase** en el repo                                                                |

La última es la peor: no es una exageración, es **una invitación explícita a pedir una prueba** que habría terminado en silencio. De ahí el criterio del ADR 0026, que Andreu validó: **la página publicada es la especificación**. Cada bloque se juzga por si hace verdad una frase ya publicada, o corrige una que no lo es. Ninguna afirmación falsa sobre datos personales sobrevive a la sesión.

**Las dos decisiones de diseño que mandan**

- **El aislamiento se prueba por BARRIDO, no ruta por ruta.** El hueco era de 37 rutas; escribir 37 tests es la decisión prohibida por el contrato: no multiplica por camping, pero **multiplica por funcionalidad** y depende de que nadie se olvide — que es exactamente cómo se llegó al 7,5 %. Verificado que `app.routes` de Hono expone el inventario completo **incluidos los routers montados**, el test se genera de ahí: **42 rutas barridas** + 3 excepciones declaradas con motivo, y **falla si aparece una ruta que no esté ni barrida ni declarada**. Mismo movimiento que el test de cobertura del plano en C7: en vez de comprobar los casos que se nos ocurren, se comprueba que no falte ninguno. Demostración involuntaria de que funciona: mientras el agente lo escribía, otro frente añadió `/guests/:id/export` y `/rgpd/retention` — **el barrido las recogió solas**.
- **La supresión anonimiza, y cuando no puede NIEGA CON FECHA.** Borrar en duro es ilegal (reservas y pagos por obligación fiscal, identidad por RD 933/2021); ignorar la petición también. Así que `DELETE /guests/:id` nunca borra: vacía los datos personales y conserva el histórico sin dueño identificable; y si hay una estancia en plazo responde **409 con la fecha exacta** desde la que sí se podrá. Un "no" sin fecha es indistinguible de un producto que no sabe hacerlo; un "no hasta el 14/03/2029 porque la estancia del 14/03/2026 está sujeta al plazo del registro de viajeros" es una respuesta que el camping reenvía al interesado tal cual.

**Hecho** (4 bloques + 3 hallazgos propios)

- **ADR 0026**, validado antes de escribir código. Andreu aprobó el encuadre, la decisión de dominio 2.2, el bloque 4 sin pipeline propio (a recomendación explícita) y el alcance de los cuatro bloques.
- **Bloque 1 — aislamiento** (`apps/api/test/isolation.test.ts`, **46 tests**): 42 rutas barridas contra el tenant B con identificadores y sesión de A. **Cero fugas reales.** Verificado además que el cierre del bucle **falla de verdad** al romperlo a propósito — una comprobación que no puede fallar no vale nada.
- **Bloque 2 — RGPD operativo** (`packages/core/src/retention.ts` **17 tests puros** · `apps/api/src/rgpd.ts` · **24 tests** de integración): export del interesado (art. 15/20, auditado — entregar un export también es un tratamiento), anonimización con el freno legal, **limpieza del PII que `audit_log` había copiado** (sin eso la anonimización sería de mentira: `PATCH /guests/:id` volcaba el patch entero, documento incluido), consentimiento con fecha **y versión** sellada por el servidor, y retención automática en cron. El esquema separa el consentimiento por puerta: `literal(true)` en la web —una reserva web sin consentimiento **no se puede crear**— y `boolean` en mostrador, que lo recoge en papel y no puede quedarse bloqueado.
- **Bloque 2.5 — páginas legales**: aviso legal, privacidad y cookies como **texto de PRODUCTO** con datos de tenant interpolados desde un bloque `legal` nuevo en `TenantWebConfig` (18 páginas, 6 locales). **Sin banner de cookies**, y comprobado en vez de supuesto: no hay analítica, ni píxeles, ni `document.cookie`. Las claves `footer.legal`/`footer.privacidad`, huérfanas desde hacía seis idiomas, por fin apuntan a algo.
- **Bloque 3 — observabilidad**: `onError`/`notFound` (antes **cualquier excepción salía como 500 con el stack trace en el cuerpo**), log estructurado JSON de una línea con enganche único para Logpush/Sentry, aviso al buzón con cortafuegos de 15 min agrupado por ruta, y cada tarea del cron **falla sola** (antes, si la purga de holds reventaba, los recordatorios de llegada de ese tick no se ejecutaban).
- **Bloque 4 — copias**: decidido **no** montar pipeline propio (con 6h/semana se pudre en silencio, y una copia que descubres rota el día que la necesitas es peor que no tenerla). Sí: `pnpm export:tenant` (SQL + CSV, **10 tests** en la parte pura) **probado contra la base local** — 2032 reservas, 2032 huéspedes, 1898 pagos, CSV verificado con anchos constantes — y `docs/RUNBOOK-COPIAS.md` con restauración, comandos verificados contra el `wrangler` real, y **cinco comprobaciones que incluyen los invariantes 1 y 2** antes de dar una copia por buena.
- **`docs/RAT-PLANTILLA.md`**: registro de actividades del art. 30, plantilla de producto — se escribe una vez y el alta rellena cinco campos.

**Tres hallazgos propios, fuera del encargo**

1. **El cron de `tenants/_template/wrangler.jsonc` estaba COMENTADO.** Un camping nuevo nacía sin purga de holds ni recordatorios — y ahora tampoco tendría retención de datos. Era un paso silencioso y olvidable en un alta que debe costar una tarde: la línea roja del proyecto. Activado, con el motivo escrito.
2. **El nivel 1 acumulaba datos personales para siempre.** No tiene motor ni reservas, pero sus `enquiries` guardan nombre, correo y teléfono. Se añadió purga propia que **anonimiza el contacto y conserva la solicitud** — porque el histórico de peticiones es lo que hace renovar al nivel 1 (CLAUDE.md) y las fechas no son dato personal.
3. **Hono solo entrega a `onError` lo que es `instanceof Error`**: un `throw 'texto'` se escapaba a workerd, que respondía con su propio 500 — la misma fuga por otra puerta. Tapado con un middleware que normaliza lo lanzado.

**La doc publicada, corregida**: `datos-rgpd.es.md` reescrita entera en sus afirmaciones. Las cuatro falsas o se implementaron o se corrigieron; "inalterable" pasa a decir **exactamente lo que el registro es y lo que no es**, con la invitación a hablarlo si la política del cliente exige más. Se añaden dos pruebas nuevas que un cliente puede pedir: el procedimiento de restauración y una demostración del ejercicio de derechos, **incluida la respuesta de un plazo legal que lo impide**.

**Verificado en el navegador** (web de tenant real): privacidad con los datos del tenant interpolados, cookies con la variante correcta de la demo, los tres enlaces del pie, el aviso de fallback en francés con `lang="es"` solo en la prosa, y **0 errores de consola**.

**`pnpm check`**: ✅ **verde 42/42** — API **172/172**, `@tenant/demo` 18/18, sin el segfault de workerd (sesión en la máquina de Andreu).

**Desplegado en producción** el mismo día (versión `f4288603`): migración `0005_rgpd.sql` aplicada en la D1 remota (verificado en `d1_migrations` y en `pragma_table_info('guests')`), páginas legales en vivo con los datos del tenant interpolados y 0 errores de consola, ficha técnica corregida servida, rutas `/guests/:id/export` y `/rgpd/retention` respondiendo 401 sin sesión, y `notFound` devolviendo JSON en vez del HTML por defecto de Hono. Queda una comprobación manual con sesión: el bloque "Protección de datos" de la ficha de cliente.

**Siguiente paso**: ver `docs/SIGUIENTE-SESION.md`.

### Sesión 36 — 2026-07-21 · **Frente C — C6: documentación** (ADR 0025) · **cierra el Frente C**

**Contexto**: última fase del Frente C, y la que arrastraba la decisión pendiente **B-ii** desde el 2026-07-19. Con C1/C4/C5/C7 cerrados existe por fin un flujo completo que documentar (llegada → check-in → cobro → mover en el planning → check-out) y capturas reales del producto. Rama `claude/docs-c6-cmtsyf`.

**Hallazgo de arranque**: el `main` local estaba **5 commits por detrás** de `origin/main` (01539e7 vs 5b0e8a6) — el trabajo de C7/C4/C1/C5 vivía solo en el remoto. Fast-forward antes de tocar nada. Merece registro porque el árbol de trabajo estaba limpio y nada lo delataba salvo comparar con el remoto.

**La decisión (B-ii), y la observación que la resuelve**: el criterio del proyecto es siempre "¿qué NO multiplica el trabajo por camping?". Aplicado aquí no discrimina, porque **la documentación es del PRODUCTO, no del tenant**: se escribe una vez y sirve a todos, así que el coste por camping ya es cero en las tres opciones. Eso mueve la decisión al **coste fijo de construcción con 6h/semana** — y ahí `apps/site` gana sin discusión: ya trae tokens oklch, Inter/Space Grotesk self-hosted, isotipo, i18n es/en/ca, canonical/hreflang/OG **y el pipeline de despliegue**, porque `apps/site/dist` **es** el directorio de assets que compone el Worker del tenant (`tenants/demo/wrangler.jsonc:18`). Una página nueva en `src/pages/docs/` se despliega sin tocar el pipeline. Starlight habría exigido un tercer build, un paso de composición nuevo y re-tematizar su DS a Logic2B, a cambio de buscador y versionado que tres guías no necesitan; `ui.logic2b.com` es externo al repo y su relación con `packages/ui` es **B-iii, todavía abierta** — acoplar la última fase del frente a una decisión sin tomar habría sido bloquearla por algo ajeno. El corolario que sí habría multiplicado el alta queda descartado por escrito: **docs por tenant**, no; URL absoluta a la casa común.

**Hecho**

- **ADR 0025**: resuelve B-ii, fija el reparto prosa/cromo, los idiomas de arranque, las tres audiencias y la ayuda contextual. Con su sección de "qué NO se hace y por qué".
- **21 páginas de guía** (`apps/site/src/content/docs/`): recepción **14** (una tarea por página, orden de un día de mostrador), dueño **3**, técnica **4**. Escritas para su lector: la de recepción sin una palabra de jerga y con la salida a mano en cada apuro; la técnica sin marketing, con las decisiones que un informático pregunta (céntimos enteros, fechas sin zona horaria con `date_to` exclusive, precio calculado en servidor, base D1 por camping con test de fuga cruzada) y con una nota honesta sobre el estado del endurecimiento RGPD.
- **Infraestructura de docs**: `lib/docs.ts` (glob + fallback **por página**, no por guía — 3 páginas traducidas no deben tirar la guía entera al castellano), `layouts/Docs.astro` (índice lateral, `order-last` en móvil sin JS ni acordeón), `DocsIndice`/`DocsGuia`/`DocsPagina` y 6 rutas (`/docs/…` + `/{lang}/docs/…`). `Base.astro` generalizado con `ruta`/`seo` para que canonical, hreflang y el selector de idioma **conserven la página** en vez de mandar siempre a la portada.
- **Prosa sin dependencia nueva**: `.lc-prosa` en `global.css` (~15 selectores) en vez de `@tailwindcss/typography`. Cuerpo a 17px/1.7 a propósito — la lectora de referencia es la recepcionista de 55 años. Con `kbd` de verdad para las teclas del gestor y tablas que scrollan ellas (nunca el body) en móvil.
- **Ayuda contextual en el dashboard**: `BotonAyuda` en las **12 barras de pantalla**, leyendo la ruta activa del router (una pantalla nueva solo pone el componente; el destino lo decide el mapa único de `lib/ayuda.ts`). Es un `<a target="_blank">` real, no un botón con `window.open`, para que se pueda copiar y mandar. Las rutas con parámetro (`/reservas/$id`) heredan la ayuda de su lista.
- **Enlaces**: landing (nav, pie y bloque propio de las tres guías tras "niveles") y **sitemap** ampliado — las guías son la superficie de búsqueda larga del producto ("cómo hacer el check-in en un camping"), así que entran como todo lo demás.

**Diferido con motivo** (BACKLOG): guías de `/informes`, `/tarifas` y `/ajustes` — son pantallas de gestión, fuera del alcance de una guía de recepción; su `?` **no se pinta**, a propósito. Vídeo/GIF de los gestos del planning (un arrastre se explica mejor en movimiento, pero exige un pipeline de vídeo que hoy no existe). Traducción de la prosa a en/ca.

**`pnpm check`**: ✅ **verde 42/42**. Esta sesión corrió en la máquina de Andreu, así que **no apareció el segfault de workerd** sobre `reset.test.ts` que tumba el check en el contenedor cloud — se confirma que era ambiental, como se venía registrando.

**Siguiente paso**: el Frente C está cerrado. Ver `docs/SIGUIENTE-SESION.md` para el replanteo de qué sigue.

### Sesión 35 — 2026-07-21 · sesión autónoma · **Frente C — C5: materia, fotos e imagen** (ADR 0024)

**Contexto**: mandato autónomo permanente del Frente C. Andreu autorizó Higgsfield al cerrar la sesión 34, con la prudencia de siempre (fijar prompts antes de generar, tandas pequeñas). ADR primero, criterio propio, no parar hasta cerrarlo — como C7/C4/C1.

**El giro que cambió el alcance**: antes de generar nada, se audita el estado real de la 1ª tanda de fotos (sesión 8) y resulta que **las 6 fotos que hacían falta ya estaban generadas** — de los 4 ficheros que pide `C-BUG-5` y los 2 de `Instalaciones.astro`, los 6 UUIDs ya estaban en `docs/BACKLOG.md` con prompts que cumplen el contrato de arte (pino de Alepo, luz de mañana/última hora, sin gente, sin HDR). Por cómo compone `fotos.ts` (`[principal, detalle]` deduplicado), descargar solo 2 de esos 6 ficheros (`detalle-bungalow-interior`, `detalle-glamping-interior`) también cierra sola la "2ª foto por tipo" en bungalow/mobil/glamping. **El hueco nunca fue de prompt ni de crédito — es de descarga**, y la descarga sigue bloqueada por la política de red del contenedor (`d8j0ntlcm91z4.cloudfront.net`, 403 confirmado de nuevo hoy en `$HTTPS_PROXY/__agentproxy/status`, **3ª sesión consecutiva** con el idéntico bloqueo, mismo README del proxy: "do not retry or route around it"). Decisión de fondo (ADR 0024): **no generar nada nuevo** (regenerar no resuelve nada — la imagen nueva viviría en el mismo host bloqueado) — se prepara en su lugar un script listo para ejecutar en cuanto haya red.

**Hecho**

- **ADR 0024**: audita el estado real, cierra la lista de 6 prompts como definitiva (tabla con UUID + resumen de cada uno), decide no gastar créditos, y fija la metodología de C5.2 (capturas reales sin red externa, OG image de marca sin fotografía).
- **`tenants/demo/scripts/fetch-higgsfield-fotos.ts`** (+ `sharp` como devDependency de `@tenant/demo`, `pnpm --filter @tenant/demo fetch:fotos`): descarga las 6 `rawUrl` conocidas y las optimiza a WebP ~2000px `q78` (mismo perfil que el resto de `tenants/demo/content/media/`) directamente con el nombre que el código ya espera — cero cambio de código cuando se ejecute. No se pudo correr en este contenedor (mismo bloqueo); es la tarea de Andreu (o de una sesión con otra política de red) de unos minutos.
- **`docs/FRENTE-C-ACABADO.md`**: C5 pasa a 🟨 PARCIAL con el detalle de qué está cerrado (lista de prompts, código de degradación) y qué falta (solo bytes); `C-BUG-5` igual — registrado honestamente como bloqueo de entorno, no de código, misma categoría que el bloqueo de credenciales de Cloudflare en Fase 9.
- **C5.2 (✅ completo, sin red)**: un agente en paralelo construyó el bundle real del dashboard (`vite build`) + un servidor Node stub que sirve ese bundle y responde `/api/admin/planning`+`/api/admin/map` con datos calculados del MISMO generador de seed puro (`generateSeed(2026)`, transformado a las formas camelCase de `apps/dashboard/src/api.ts`) — sin workerd, mismo patrón que C1/ADR 0023 — y Playwright/chromium capturó el planning real (agosto 2026, ~319 reservas visibles) y el plano real. La captura del planning sustituye la maqueta CSS de `apps/site/src/components/Landing.astro` (cierra BACKLOG **[B3]**); la del plano queda en `docs/img/captura-plano.webp` para **C6** (no hay sección de plano en la landing hoy). Además, una **OG image de marca Logic2B** (1200×630, tokens oklch exactos de `packages/ui/src/theme.css`, isotipo, Space Grotesk, sin fotografía del tenant — la landing es superficie Logic2B, `BRAND.md` §0) reemplaza el placeholder del isotipo suelto en `Base.astro`.
- **Verificación propia tras el agente**: revisadas las 3 imágenes (dimensiones, contenido visual correcto — planning denso real con códigos de reserva, plano reconocible con zonas/colores, tarjeta de marca limpia), `pnpm --filter @logic-camp/site build` limpio, `git status` sin residuos de scripts de sesión. Web de tenant comprobada con Playwright contra el build real: `ut_prem`/`ut_moto`/`ut_bung4`/`ut_glamp`/`instalaciones` → **0 imágenes rotas, 0 errores de consola** — la degradación a `tipo-parcela` y el filtrado de instalaciones sin foto funcionan exactamente como se documentó, sin ningún bug de cliente.

**Diferido con motivo**: descarga real de las 6 fotos (bloqueada por red; script listo — recomendación directa a Andreu de correrlo desde su máquina). Sección de plano en la landing (no pedida; activo listo para C6). Más densidad de fotos (baños, exteriores) — BACKLOG, no bloquea C5.

**`pnpm check`**: 40/42 tareas — verde salvo el mismo fallo ambiental de siempre (workerd segfaulta sobre `reset.test.ts`, no tocado). `@tenant/demo` seed 12/12 en aislamiento; `@logic-camp/site` y `@logic-camp/web` typecheck/lint/build limpios; no se tocó código de API/config/ui.

**Siguiente paso**: **C6** — documentación, última fase del Frente C (absorbe B4). Ver `docs/SIGUIENTE-SESION.md`.

### Sesión 34 — 2026-07-21 · sesión autónoma · **Frente C — C1: el planning como pieza de exhibición** (ADR 0023)

**Contexto**: mandato autónomo permanente del Frente C. C1 era el elemento firma declarado y el único que no estaba a la altura: sólido de ingeniería (virtualización, DnD vertical, optimista, teclado) y **pobre de gesto**. ADR primero (0023), criterio propio, no parar hasta cerrarlo — como C7/C4. Rama `claude/planning-c1-gestures-c1ni7l`.

**Las decisiones de fondo**

- **El gesto escribe por la MISMA puerta que todo lo demás**: `move` es una acción más de `bookingActionSchema` (no una ruta aparte) — hereda rol, auditoría y patrón de errores. Espejo del `modify` público, que era el precedente: cambiar fechas re-cotiza SIEMPRE en servidor (el invariante 3 habla de _tarifas_, no de esto).
- **El candado `expectedTotalCents`**: "enseñar el desglose antes de confirmar" obliga a un paso de previsualización (`POST /bookings/:id/requote`, dry-run con las MISMAS validaciones), y toda previsualización caduca. El cliente manda el total que enseñó; si el servidor recalcula otro → 409 `price_changed` con el desglose fresco. Sin ese campo habría una ventana confirmas-X-se-escribe-Y.
- **`preferredUnitId` es preferencia, nunca garantía**: crear arrastrando en la fila A-08 pide A-08; si justo se ocupó, asigna el motor — el alta no falla por la preferencia.
- **NO virtualizar el eje horizontal**: medido, el coste no eran las barras sino el sombreado de finde (`<div>` por celda×fila ≈ miles de nodos). Ahora es UN `repeating-linear-gradient` por lienzo con la fase calculada del día de semana (`weekendBackground`). Descartado con medida, no por intuición — reabrir solo si existe un zoom "Año".
- **C1.5**: el mapa provisional se confirma en estructura y se cierra con **contrato de test** — 27 aserciones oklch→sRGB→WCAG en `packages/ui` (texto ≥4.5:1, barra/fondo ≥3:1, light Y dark). El test cazó de inmediato que el **ámbar provisional de `pending` se quedaba en 1.7:1** sobre blanco (ahora ámbar profundo, 5.6/3.5) y que el `.dark` no declaraba ningún token de estado. Con el mapa cerrado, **modo oscuro conectado** (dependencia declarada en ADR 0020): toggle claro/oscuro/sistema en la sidebar + script pre-React en `index.html` (sin FOUC).

**Hecho**

- **API** (+11 tests → **86/86**): `requote` (dry-run) y `move` (con `unitId` opcional para el diagonal: fecha+unidad en UNA acción y UN deshacer) sobre `quoteMove()` compartido — validateStay con claves `stay.*` explicadas, solape unidad-concreta (o disponibilidad de tipo si va sin asignar), re-cotización con los extras contratados (la electricidad se infiere del `price_breakdown`, que es la fuente de verdad auditable), batch + audit con from/to. `/planning` devuelve `seasons`. `adminBookingCreateSchema` gana `preferredUnitId` (el asignador lo respeta si está libre).
- **`packages/config`** (+14 tests → **39/39**): `planning.ts` puro — `barGeometry` (con `clipStart/clipEnd`), `todayOffset`, `weekendBackground` (incluye el caso domingo, banda partida), `seasonBands` (prioridad por día como el motor, bandas fundidas, tono estable), `snapDays`.
- **Dashboard**: `Planning.tsx` reescrito — arrastre horizontal con snap a celda y tooltip en vivo (fechas+noches junto al cursor, manipulación directa del DOM, cero re-render por frame), asas de resize en los bordes (ocultas en un borde recortado), flujo soltar→requote→commit directo si el total no cambia / `AlertDialog` con desglose viejo→nuevo si cambia, deshacer que es otro `move` al origen, rechazo explicado por clave (`unit_occupied`, `invalid_stay` con sus issues…), teclado ←/→ y Shift+←/→ (con guard anti-repeat), crear arrastrando (overlay de selección + `NewBookingPanel` con prop `initial`), chips de la bandeja arrastrables (con guard de click), filtros tipo/estado/búsqueda (atenúan con `.lc-dim`, Enter centra la coincidencia), línea de HOY, franja de temporada, chevrons de continuación, y la capa única de finde. `ThemeToggle` + script anti-FOUC.
- **`packages/ui`** (+27 tests → **54/54**): mapa `--lc-status-*` definitivo en `:root` y `.dark` + tokens nuevos `--lc-today`, `--lc-season-0..3`, `--lc-weekend-fill`; `theme-contrast.test.ts` parsea el CSS real (sin comentarios — un `--token:` citado en un comentario se comía la declaración siguiente), resuelve `var()` y convierte oklch→sRGB en el propio test.

**Verificación EN VIVO sin workerd** (nuevo listón para este contenedor): bundle real de `vite build` + **stub de API en memoria** (node puro, misma forma que `/api/admin`) + Playwright → **22/22 comprobaciones de gesto**: mover +7 días (commit directo), Deshacer, mover 2 días (diálogo de precio con desglose y confirmación **verificada contra los datos**), destino ocupado (409 + toast explicado + rollback verificado), resize con diálogo, crear arrastrando (alta precargada "Unidad A-08"), chip de bandeja→fila (verificado en datos), filtros (atenúa 8/deja 3; tipo deja 4 filas), Shift+→ por teclado, toggle dark (token `inhouse` dark aplicado al píxel) y persistencia del tema tras recarga. Capturas light/dark/diálogo enviadas a Andreu.

**Diferido con motivo** (BACKLOG): mover a OTRO tipo arrastrando, crear bloqueos arrastrando, gesto táctil móvil, aviso inline de reembolso en el diálogo de precio. El diferido de C7 "crear desde el plano" queda **cerrado** por C1.2.

**Lo ambiental que impide `pnpm check` 100% verde aquí** (idéntico a sesiones 32/33, ajeno a C1): (1) workerd segfaulta sobre `reset.test.ts` (no tocado) y tumba la suite de `@tenant/demo` del check completo; (2) el rate-limit de la API parpadea bajo carga paralela. **Cada suite pasa en aislamiento** (API 86/86 · config 39/39 · ui 54/54 · seed 12/12 · core 51/51 · notifications 7/7 · payments 20/20 · cli 17/17); typecheck/lint/build de los 31 targets verdes.

**Siguiente paso**: **C5** (fotos Higgsfield — fijar prompts y **confirmar la tanda con Andreu antes de gastar créditos**; las capturas del planning/plano para la landing ya se pueden hacer) o **C6** (documentación, absorbe B4, cero-riesgo). Ver `docs/SIGUIENTE-SESION.md`.

**`/check`**: verde salvo los dos fallos ambientales de arriba (40/42 tareas), ambos ajenos a C1.

### Sesión 33 — 2026-07-21 · sesión autónoma · **Frente C — C4: workflow de recepción** (ADR 0022)

**Contexto**: mandato autónomo permanente del Frente C. C4 era **el único hueco de DOMINIO** que quedaba (el resto del frente es pulido de UI). ADR primero, criterio propio, no parar hasta cerrarlo — como C7.

**La decisión de fondo (el modelo de check-in) — campo, no estado**
Las dos opciones del contrato: estado `in_house` en la máquina de estados, o campo `checked_in_at` sobre la reserva. Se eligió el **campo**, y no por estética: es la única que **no mete un bug de corrección latente**. El `status` es el ciclo de vida (`pending→confirmed→completed/…`); que un huésped esté presente es un hecho **ortogonal** (una confirmada con el titular dentro sigue confirmada). El sistema filtra por `status` donde ocupación e ingresos dependen de ello: `OCCUPIES` (plano), el filtro de `/reports`, el solape de `reassign`, el motor y el seed. Un estado `in_house` **saldría de todos** salvo que se parchee cada uno, y **olvidar uno es un doble-booking**. El campo no toca ninguno: "en casa" = `status==='confirmed' && checked_in_at && !checked_out_at`, derivado. Migración **aditiva** `0004` (dos columnas nulables, sin backfill). Detalle en ADR 0022 §1.

**Hecho**

- **Migración `0004` + `schema`**: `checked_in_at`/`checked_out_at` en `bookings` (nulables). `unitStateOn` (`packages/config`) gana `kind: 'inhouse'` (la "línea de más" que C7 dejó preparada) — **3 tests nuevos** (25/25).
- **API** (`admin.ts`, **13 tests nuevos** → 75/75): acciones `check_in` / `check_out` (completa + sella salida) / `undo_checkin`, con `TRANSITIONS` intacto; guarda `record_payment ≤ pendiente` (simetría con el reembolso); **huéspedes editables** (`POST /bookings/:id/guests`, `PATCH /guests/:id`, `DELETE /bookings/:id/guests/:guestId` — nunca al titular); **bloqueos** (`POST /blocks` con solape validado, `DELETE /blocks/:id`). `/planning` devuelve los dos timestamps.
- **Dashboard**: `--lc-status-inhouse` (verde esmeralda **oklch(0.5 0.14 152)**, AA **5.5:1** con blanco — verificado con los tokens compilados y Playwright, el primer valor L=0.648 daba 2.99:1 y se corrigió) en barra del planning, `<svg>` del plano, chips y leyenda. Ficha: sección Recepción (check-in/out/deshacer + chip "En casa"), **huéspedes editables** (`GuestsSection`), **"cobrar todo lo pendiente"** con validación en cliente. Llegadas: botón de check-in por llegada / check-out por salida. **⌘K** (`cmdk`, instalado aquí a propósito, no en C2) buscando reserva/cliente/unidad → `CommandPalette` + primitivo `Command` en el DS (**+1 test**, ui 27/27). **Rutas direccionables** `/reservas/$id` `/clientes/$id` (patrón search-param de C7). `BlockDialog` reutilizado por planning y plano.
- **Seed** (puro, determinista): check-in de demostración sobre las confirmadas presentes en el ancla `Y-07-15` (~4 de cada 5; ~1 "solo tiene reserva") → el planning y el plano enseñan la mezcla "en casa / confirmada / entra hoy" **sin un mock en el cliente**. +1 test de cobertura (seed 12/12).

**Verificación visual sin workerd** (el contenedor no levanta wrangler): render de los chips/barras/leyenda con los **tokens compilados reales** (Playwright/chromium `/opt/pw-browsers`) — el verde "en casa" queda distinto de confirmada (negro), pendiente (ámbar) y del resto; contraste AA medido sobre el pixel renderizado. Captura enviada a Andreu.

**Diferido con motivo** (BACKLOG): export del **parte de viajeros** (formato legal, pieza propia — el modelo y la captura ya están), recibo imprimible del check-out, "en casa" en la lista `/reservas`, crear reserva arrastrando (es C1.2).

**Lo ambiental que impide `pnpm check` 100% verde aquí** (ajeno a C4, como en C7): (1) workerd segfaulta sobre `reset.test.ts` (fichero no tocado; el `pnpm check` completo cae por él); (2) el rate-limit de la API parpadea bajo carga paralela. **Cada suite pasa en aislamiento** (API 75/75, config 25/25, seed 12/12, ui 27/27); typecheck/lint/build de los 17 paquetes verdes.

**Siguiente paso**: **C1 — gestos horizontales del planning** (mover/estirar fechas arrastrando, crear arrastrando, línea de "hoy", filtros dentro del planning). Ya hereda de C3 el toast con Deshacer y de C4 el mapa de color completo (incluido "en casa"). Alternativa: **C5** (fotos, cuesta créditos Higgsfield — fijar prompts y confirmar la tanda con Andreu) o **C6** (documentación, cero-riesgo). Ver `docs/SIGUIENTE-SESION.md`.

**`/check`**: verde salvo los dos fallos ambientales de arriba, ambos ajenos a C4.

### Sesión 32 — 2026-07-21 · sesión autónoma · **Frente C — C7: plano del camping** (ADR 0021)

**Contexto**: Andreu al cerrar la sesión 31: _"continua como creas conveniente pero no pares hasta conseguirlo todo cuando lo termines replantea lo siguiente en el roadmap"_ — mandato autónomo. Siguiente pieza desbloqueada: **C7**, porque C1.5/C2 ya fijaron el mapa de color (`--lc-status-*`) y C0.2 el seed denso (un plano de un camping vacío no enseña nada).

**La decisión de fondo (dónde vive la geometría) — tercera vía**
Las dos opciones abiertas eran columna en `units` (D1) o fichero de tenant. Se eligió la síntesis: **fuente de verdad en `tenants/{slug}/plano.ts`** (descriptor declarativo), **materializado en `modules.plano`** (columna JSON que YA existe → **cero migración de D1**), **servido por `GET /api/admin/map` genérico** (`apps/api` intacto, ni un dato de Cala Sereno en su bundle). Es el mismo camino que ya recorren las unidades: fichero de tenant → seed → D1 → API genérico → dashboard. No es un compromiso, es coherencia (ADR 0021 §1).

**Hecho**

- **`packages/config/src/plano.ts`** (puro, **18 tests**): `PLANO_GRID` (constantes de rejilla en **un solo sitio** → defecto 1 del original cerrado), `expandPlano` (descriptor → rectángulos + viewBox), `autoPlano` (**degradación honesta**: un camping sin plano ve un layout por zonas, no una pantalla rota), `unitStateOn` (estado por fecha: libre/ocupada/entra/sale/turnover/bloqueada, from inclusive / to exclusive, la cancelada no ocupa).
- **`tenants/demo/plano.ts`**: descriptor declarativo de Cala Sereno (mar al norte, premium/vista-mar en la playa, parcelas A/B, autocaravanas D, piscina/restaurante/recepción/súper/aseos/juegos como servicios, pinada al este). Decorado del recinto **como dato** → defecto 2 del original cerrado. Enganchado a `modules.plano` en `seed.ts`.
- **Seed test de cobertura**: `expandPlano(modules.plano)` coloca EXACTAMENTE las 83 unidades del seed (sin huérfanas ni duplicadas) — si se añade un tipo y se olvida el plano, salta.
- **`GET /api/admin/map`** genérico (lee `modules.plano ?? null`), **3 tests** (degradación null, round-trip, 401).
- **`CampingMap.tsx`**: SVG inline puro/controlado, **pan/zoom** por viewBox (rueda hacia el cursor, arrastre, botones +/−/ajustar, teclado) — lo que el original en Svelte NO traía. Tooltip `<title>` nativo, `role=button`+teclado por unidad, halo `feDropShadow`, `prefers-reduced-motion`. Colores desde los **mismos `--lc-status-*` que el planning** (nunca una segunda paleta). Ilustración `map` nueva en el DS para el estado vacío.
- **`pages/Plano.tsx`** + ruta `/plano` + entrada de nav: selector de fecha, estado en vivo de una noche (de `/planning?from=D&to=D+1`), leyenda, click en unidad ocupada → la **misma** `BookingPanel`, y **salto plano↔planning conservando unidad+fecha** por search params (validados en ambas rutas). Del plano al planning: ancla la fecha, centra la fila de la unidad, la resalta y abre su ficha si esa noche está ocupada.

**Verificación visual SIN workerd** (el contenedor de esta sesión cloud no puede levantar wrangler — workerd segfaulta): el plano se renderizó desde el **descriptor real** + los **tokens reales del DS** con Playwright/chromium (`/opt/pw-browsers`), y sale un **camping reconocible** (captura enviada a Andreu). Además, script de colisiones: **83 unidades, 0 solapes unidad-unidad, 0 solapes unidad-servicio** (una primera pasada dio 2 autocaravanas pisando Recepción → corregido subiendo la fila de `y:540` a `y:505`).

**Un bug propio cazado por el typecheck**: importar `Map` de lucide-react en `Planning.tsx` **sombreaba el `Map` nativo** → `new Map()` reventaba. Aliaseado a `MapIcon`.

**Lo ambiental que impide `pnpm check` 100% verde aquí** (y no es de C7): (1) el pool de workerd segfaulta sobre `reset.test.ts` (fichero no tocado; segfaulta incluso solo) — es el binario de workerd crasheando en este contenedor; (2) el test de rate-limit de usuarios de la API parpadea bajo carga paralela (pre-existente, sesión 24). **Cada suite pasa en aislamiento** (API 65/65, config 22/22, seed 11/11, ui 26/26); typecheck/lint/build del monorepo verdes.

**Diferido con motivo** (BACKLOG): crear reserva arrastrando sobre celda libre del plano (es C1.2), crear bloqueos desde el plano (C4.4), iconos de servicio dentro del SVG, y verificar 375px en vivo cuando haya un entorno con Worker. El plano de C7 **lee y navega**; todavía no crea.

**Siguiente paso**: **C4 — workflow real de recepción** (check-in como decisión de dominio en su ADR, huéspedes+documentos editables, "cobrar todo lo pendiente", ⌘K con `cmdk`, y las **rutas direccionables** `/reservas/$id` `/clientes/$id` que C3 dejó explícitamente para aquí). Alternativa transversal: **C1** (gestos horizontales del planning) o **C5/C6** (fotos/documentación). Ver `docs/SIGUIENTE-SESION.md`.

**`/check`**: verde salvo los dos fallos ambientales de arriba (workerd segfault + rate-limit flaky), ambos ajenos a C7.

### Sesión 31 — 2026-07-21 · Andreu presente · **Frente C — C2 + C3** (ADR 0020)

**Contexto**: continuación de la sesión 30. Objetivo declarado por Andreu: C2 y C3 **como un solo objetivo** ("el DS conectado y los estados"), porque están acoplados — sin `skeleton`/`toast`/`alert-dialog` en el DS, C3 no se puede hacer; y C2 sin C3 no se nota en pantalla. ADR primero y parada a validar; Andreu: _"me parece bien tu propuesta continua con el proyecto"_.

**Los dos bugs no eran lo que parecían — y eso cambió el ADR**

- **C-BUG-1**: los 5 `--chart-*` de `:root` eran la columna **dark** de BRAND §4. Pero el valor light correcto de `--chart-4` es **morado**, y `--chart-4` pinta las barras `pending` del planning: _arreglar el bug tal cual rompía la pantalla firma_ (y no pasaba AA con texto negro). Solución: corregir los 5 **y** desacoplar el planning a tokens semánticos `--lc-status-*`, con los valores de hoy → **el planning no cambió ni un píxel** (verificado en el navegador). C1.5 decidirá el mapa definitivo tocando 5 valores en un sitio. Además faltaba `--radius-2xl` y el bloque `.dark` **no declaraba ningún `--chart-*`**, que es justo por lo que el bug pasó desapercibido.
- **C-BUG-2**: `--color-mar` tenía **dos significados**. De sus 44 usos, **4 eran enlaces** `mailto:`/`tel:`, así que reapuntarlo a `--destructive` habría pintado los contactos en rojo. Se partió por significado: token `--link` propio para enlaces, `--destructive` para el resto.

**Hecho**

- **C2**: 11 paquetes Radix + `sonner` (**alcance acotado a propósito**: `cmdk` es C4; `calendar`/`form` merecen ADR propio; `scroll-area` descartado por el virtualizador del planning). 16 primitivos nuevos. **43 → 2 `<button>` crudos** (los 2 restantes son filas que **son** su rejilla CSS; su anillo de foco es ya `focusRing`, export del DS, así que no queda estilo copiado a mano). **Rename cerrado**: 352 usos del vocabulario de ADR 0008 → **0**, alias eliminado. `packages/ui` **estrena runner de tests: 26**, incluidos los 4 componentes de B1 que nunca tuvieron ninguno.
- **C3**: 12 `<p>Cargando…</p>` → **0** (esqueletos con la **forma** del contenido, no rectángulos). Error boundary por ruta + `notFound` con salida. Errores de query diferenciados **401/403/red/500** (antes los cuatro eran el mismo `<p>`); el QueryClient deja de reintentar 401/403. Los 6 `useState<{text,error}>` → toasts, con **Deshacer real** en la reasignación del planning. Confirmación en las **3 acciones destructivas que no la tenían** (reembolso, baja de unidad, tarifas) y el "doble click" de cancelar sustituido por `alert-dialog`. Estados vacíos con ilustración de trazo y salida. **Login** con marca (isotipo, Card, Spinner). 16 claves i18n nuevas, cero cadenas hardcodeadas.
- Migración de las 15 pantallas repartida en **5 agentes en paralelo** con ficheros disjuntos y una spec común; `i18n.ts` quedó fuera de su alcance (zona compartida) y se mezcló al final para evitar que se pisaran.

**Lo que solo apareció mirando la pantalla** (y es la lección de la sesión): **Tailwind v4 no escanea `node_modules`**, y `@logic-camp/ui` entra por symlink de pnpm. Las clases que viven **solo** en el DS (`size-14`, `translate-x-4`, `rounded-[4px]`, `min-w-[10rem]`) **no generaban CSS** — el DS funcionaba por coincidencia, porque sus clases más comunes (`h-9`, `bg-primary`, `px-4`) también estaban en el código de la app. Se detectó porque el error boundary pintaba su icono a **384px** en vez de 56. Afectaba al pulsador del `Switch`, al radio del `Checkbox`, al ancho del `DropdownMenu` y a todas las ilustraciones. Arreglado con `@source` en dashboard **y** landing. **Tests verdes y typecheck limpio no dicen nada sobre si una clase de Tailwind existe.**

**Otras dos correcciones de criterio propio durante la implementación**

- Los `--lc-status-*` se colocaron primero en el dashboard y hubo que **moverlos a `packages/ui`**: la maqueta de planning de la **landing** usaba `bg-chart-4` para la misma idea de "pendiente". Con dos consumidores (y C7 llegando), el sitio es el DS — si landing y producto enseñaran colores distintos para "pendiente", la demo desmentiría a la página de venta.
- **`@radix-ui/react-select` no se instaló** pese a estar en el ADR: para listas cortas de filtro el `<select>` nativo gana (teclado del sistema, cero JS, igual en móvil). Se expone como `SelectNative` con la piel del DS.

**Bug nuevo (C-BUG-6)**: `Planning.tsx:199` pintaba el resaltado del destino al arrastrar con `var(--lc-pino)` — variable que el dashboard **nunca define** (solo existe en los temas de tenant de la web) → declaración inválida, **resaltado invisible**. Resto de ADR 0008. Corregido a `var(--primary)`.

**Sin terminar / diferido con motivo**

- **Rutas direccionables** (`/reservas/$id`, `/clientes/$id`) → **C4**: es lo único de la lista de C3 que no es un estado, y su valor se cobra junto a la navegación de ⌘K.
- **Modo oscuro** → detrás de **C1.5** (la tercera vía del ADR §4, aprobada): su superficie más difícil son las barras del planning, y decidirlo antes de fijar ese mapa de color sería decidirlo dos veces. Mientras, el bloque `.dark` deja de estar roto.
- **375px**: el sidebar sigue ocupando media pantalla. **No es regresión** (viene de B1) y ya estaba en BACKLOG; ahora está **desbloqueado**, porque su pendiente era "añadir el primitivo Sheet" y `Sheet` ya existe.

**Verificado en el navegador** contra el Worker real, 1366px y 375px: planning **idéntico** tras corregir los tokens, "Pendiente de pago" ya en rojo y no en negro, ruta inexistente con estado y salida, `AlertDialog` de reembolso con el importe real interpolado, `Switch` operativo, **0 errores de consola**.

**Siguiente paso**: **C1 — el planning como pieza de exhibición** (ADR propio). Ya hereda de esta sesión lo que le hacía falta: `toast` con **Deshacer** (C1.4) y los `--lc-status-*` donde vivirá el mapa de color de **C1.5**. Lo que toca: arrastre **horizontal** (mover y estirar fechas), crear reserva arrastrando sobre celdas vacías, **línea de "hoy"**, indicador de continuación cuando la barra se sale del borde, y filtros dentro del planning. Ojo al rendimiento: hoy se pinta un `<div>` de fin de semana por celda y por fila con 83 unidades × 92 días — considerar virtualizar también el eje horizontal.

**`/check`**: ✅ verde (**42/42** · API 62/62 · `@tenant/demo` 16/16 · `packages/ui` 26/26 nuevos)

### Sesión 30 — 2026-07-20 · Andreu presente · **Frente C abierto** + C0: desbloqueo (ADR 0019)

**Contexto**: Andreu pide levantar el dev y revisar cómo va la parte visual, con prioridad declarada en **la interfaz en modo fake** — "que el cliente vea una interfaz bien pensada y profesional". Se audita el estado real, se abre el **Frente C (acabado profesional)** y se implementa su primera fase.

**Auditoría (medida, no opinada)**. Lo construido es honesto: 11 pantallas sin esqueletos, **0 mocks** (todo contra API real), 267 claves i18n sin huecos en 6 idiomas, funnel cerrado. El problema es que **el producto no se está luciendo**. Tres hallazgos que mandan: (1) **el planning estaba vacío** — 83 unidades, 29 reservas, nada de A-09 abajo en pleno agosto, siendo el elemento firma declarado; (2) **el DS existe y no se usa** — `packages/ui` son 101 líneas con **0 usos** de `<Button>`/`<Card>`/`<Badge>` y **41 `<button>` crudos**, sin Radix; (3) **estados en texto plano** — 0 skeletons, 0 error boundaries, 0 toasts en 11 pantallas. Más: no existe el **check-in** (ni en cliente ni en API), no se editan huéspedes/documentos (requisito legal), login sin marca, y 4 ficheros de foto referenciados que no existen.

**Hecho**

- `docs/FRENTE-C-ACABADO.md` (nuevo): contrato del frente — auditoría, **7 fases C0–C7**, checklists, 5 bugs registrados (C-BUG-1..5), dirección de arte para Higgsfield, grafo de dependencias. `ROADMAP.md` registra el Frente C; **B4 (docs) queda absorbida en C6**.
- **C7 · Plano del camping** (pedido por Andreu): registrado, no construido. Ojo — Andreu lo situó en `logic2b-norte`; **ahí no está** (verificado árbol, package.json e historial git de 3 ramas). Está en **`gestor-reservas/src/lib/components/camping-map.svelte`** (518 L, Svelte 5 + SVG puro, `mapPosition` por unidad, layout por factories). Al portar hay que corregir dos defectos del original: constantes de rejilla duplicadas y decorado del recinto cableado a ese camping. No trae pan/zoom. Decisión de fondo abierta: **dónde vive la geometría** (inclinación: `tenants/{slug}/`, no columna en D1).
- **ADR 0019 + C0 implementado** (ver commit `f0806cb`):
  - **C0.1 HMR**: el login fallaba con **403** desde `:5173` (Better Auth rechazaba el origen cruzado; `auth.ts` no declaraba `trustedOrigins`). Fail-closed en 3 capas: lista de orígenes **constante** en código, la var es solo interruptor, y se pasa por `--var` en `launch.json` para no existir en ningún `wrangler.jsonc` (que es el fichero que despliega a producción). 3 tests fijan el contrato en ambas direcciones. `apps/dashboard/README.md` nuevo documenta el flujo, que no estaba escrito en ninguna parte.
  - **C0.2 seed denso**: relleno de 10 definiciones fijas → **recorrido unidad a unidad por curva de temporada** (el invariante 1 se cumple _por construcción_: el cursor nunca retrocede). **40 → 2.032 reservas**; planning **25 → 346 a la vista**, todas las filas pobladas. Curva real: abr 12% · may 26% · jun 51% · jul 73% · **ago 86%** · sep 55% · oct 11%.

**Tres cosas aprendidas implementando** (detalle en el ADR): (1) **ocupación ≠ probabilidad de arranque** — `p=0.45` en junio daba 66% real porque cada estancia ocupa luego N noches; se invierte la fórmula para que la constante diga lo que significa. (2) **El límite de D1 es de BYTES, no de filas** — trocear a 200 filas reventó con `SQLITE_TOOBIG` (las filas de `bookings` llevan el `price_breakdown` entero); troceado por presupuesto de bytes: **8.155 → 54 sentencias**, reset nocturno atómico intacto. (3) El **invariante 1 cazó un solape real**: las reservas de caso límite se colocan antes del recorrido y el bucle las pisaba.

**Gotcha operativo**: `pnpm db:reset` hace `rm -rf .wrangler-demo` → **hay que reiniciar el Worker después** o queda apuntando a un directorio borrado y devuelve 500.

**Siguiente paso**: **C2 + C3 como un solo objetivo** ("el DS conectado y los estados") — están acoplados: sin `skeleton`/`toast`/`alert-dialog` en el DS, C3 no se puede hacer bien, y C2 sin C3 no se nota. Antes, opcionalmente, los dos bugs baratos (C-BUG-1 y C-BUG-2). **C1** (gestos del planning) después, ya con toasts para el "deshacer". **C7** cuando C1.5 haya fijado el mapa de color, o el plano y el planning no se parecerán.

**`/check`**: ✅ verde (41/41)

### Sesión 29 — 2026-07-20 · sesión cloud · Frente B B2: web de tenant sobre estructura Logic2B (ADR 0018)

**Contexto**: Andreu pregunta "¿cómo va y con qué seguimos?" → tras repasar estado, el siguiente pendiente **desbloqueado** (sin credenciales) es B2. Se redacta ADR 0018 y se pide validación; Andreu responde "aplica tu criterio y continúa todo lo que puedas" → se cierran por criterio los 4 puntos abiertos y se implementa.

**Decisiones (por criterio)**: (1) base de radios **4px** (un punto sobre el 2px de ADR 0006, firme, lejos del 10px del producto); (2) titular **sigue con Clash Display** (cambiar a Space Grotesk sería reskin); (3) firma "powered by Logic2B" → raíz `camp.logic2b.com/`; (4) alcance = **alineamiento estructural sin reskin** (la identidad mediterránea no se toca).

**Hecho**

- `docs/adr/0018-web-tenant-estructura-logic2b.md`: aceptado por criterio. Principio: converge el _esqueleto_ (ritmo, radios, anatomía de header), no la _piel_. Los dos sistemas de tokens (`--lc-*` tenant / oklch DS) NO se mezclan — la web no importa el tema del DS.
- **Radios**: `tenants/_template/theme.css` y `tenants/demo/theme.css` pasan de `2px/4px` sueltos a **una base `--lc-radius: 4px` + `--lc-radius-sm/md/lg` por `calc()`** (misma forma que la escala del DS, BRAND.md §5). `apps/web/src/styles/global.css` expone la escala completa a Tailwind. Los componentes ya usaban `rounded-(--lc-radius)`/`-lg` → el cambio se propaga solo, sin renombrar nada ni valores sueltos.
- **Ritmo de bloques**: `--spacing-section`/`--spacing-section-lg` en `@theme` → `py-section`/`md:py-section-lg`. Aplicado al ritmo canónico (Home 3 secciones + secciones finales `pb-24` de las interiores) con cambio de valor CERO (24 = 6rem) — pura tokenización, dejando intactas las intermedias `pb-16`/bandeadas `py-16` (roles deliberados).
- **Firma "powered by Logic2B"**: `apps/web/src/components/LogoMark.astro` nuevo — inyecta el mismo `<path>` del isotipo que `packages/ui` pero en Astro puro (comparte el SVG, NO el runtime React: el header/pie de la web es 100% estático, regla dura del nivel 1). Pie de `Base.astro` gana una línea discreta (isotipo `currentColor` + "powered by Logic2B") alineada con el contacto, enlazando a la landing. `footer.poweredBy` (aria/title localizado) añadido a `content/*.json` en los **6 idiomas** × `_template` **y** `demo` (12 ficheros). El texto visible "powered by Logic2B" es marca fija; se localiza solo la etiqueta accesible.
- Docs: BRAND.md §3 (convergencia de fuentes CERRADA) y §5 (escala de radios del tenant); ADR 0006 marcado "reemplazado en parte por 0018" en 2 puntos (radios + firma); `FUNCIONALIDADES.md` §2.4 (la firma del pie); `ROADMAP.md` B2 → ✅ hecho.
- **Verificado**: `pnpm check` verde (41/41 · API 59/59 · web build 217 páginas). Playwright contra el dev real (`apps/web` en :4330): home nivel 3 con el héroe Clash Display y el mostrador intactos (radio 4px sutil), pie con la firma discreta a la derecha (desktop) y apilada (móvil 375px), interiores OK. Capturas en scratchpad (no versionadas).

**Pendiente**: **B4** (documentación de producto, siguiente pieza desbloqueada del Frente B, con su ADR) · remate de B2: re-medir Lighthouse ≥95 en producción cuando haya credenciales/red (no se añaden fuentes ni JS, no debería moverse).

**`/check`**: ✅ verde (41/41)

### Sesión 28 — 2026-07-19 · Andreu presente · Frente B: marca Logic2B + landing de producto (ADR 0016)

**Contexto**: sesión de revisión con Andreu. (1) Se detectó que `main` local estaba en Fase 4 (21 commits atrás) → sincronizado. (2) La demo `camp.logic2b.com` estaba CAÍDA (web+dashboard 404, D1 sin migrar) → arreglada en vivo (deploy manual + 2 migraciones remotas). (3) Se decidió **deploy manual** (CI descartado: la sesión OAuth no puede crear API token, 403/9109) y `deploy:demo` ahora migra. (4) Andreu pidió alinear la marca con Logic2B y, sobre todo, **crear la landing de producto que faltaba** (vender Logic Camp al director de camping, distinta de la demo del camping ficticio) + documentación.

**Hecho**

- `docs/BRAND.md` + `docs/brand/logo-mark.svg`: contrato de marca Logic2B extraído del CSS real de `ui.logic2b.com` (shadcn "neutral": Inter Variable + Space Grotesk, tokens oklch light/dark, radius 10px, isotipo).
- `docs/ROADMAP.md`: **Frente B** (B0–B4) en paralelo a las 12 fases, con checklist y decisiones (landing en `/`, demo a `/demo/`, deploy manual).
- ADR 0016 (aceptado por Andreu): landing de producto + fundación DS B0-lite + routing por prefijo.
- **B0-lite**: `packages/ui` (antes vacío) con `theme.css` (tokens Logic2B), fuentes self-hosted, isotipo. Lo consumirá el dashboard en B1.
- **B3 landing** (`apps/site`, Astro, marca Logic2B): héroe, problema, producto (web+gestor), planning pieza estrella, 4 niveles (TIERS), alta en una tarde, FAQ, formulario "pedir demo". i18n es/en/ca, SEO/OG/hreflang/sitemap/robots, indexable.
- `POST /api/leads` (`apps/api/src/routes/leads.ts`): lead por email (reusa Resend), sin tabla ni tocar `enquiries`.
- **Routing** `/demo/`: `apps/web` gana `base` configurable (`BASE_PATH=/demo`); `localePath` consciente del `base` → funnel/nav/canonical/hreflang/sitemap bajo `/demo/` con un cambio; demo `noindex` bajo `/demo/`. `wrangler.jsonc` sirve el bundle compuesto (`apps/site/dist`); `deploy:demo` compone site+web(base)+dashboard → migra → deploy.
- **Verificado**: `pnpm check` verde (41/41, API 59/59); bundle compuesto servido en local (/ landing, /demo/ Cala Sereno, /admin/ dashboard, /demo/alojamientos con base); **desplegado y en vivo** (/ landing, /demo/ demo, /admin/ dashboard, `/api/leads` → `{ok:true}`, todo 200 tras refrescar caché de borde).

**`/check`**: ✅ verde (41/41)

### Sesión 27 — 2026-07-19 · BACKLOG 7.x · ADR 0015 — recordatorio de llegada

**Hecho** (continuación de la misma sesión cloud: "continua")

- `docs/adr/0015-recordatorio-de-llegada.md`: el motivo original del aplazamiento ("cuando haya API key de Resend") ya no aplica — ADR 0014 (esta misma sesión) demostró que se verifica igual de bien en estado `disabled`. Reutiliza el cron de 15 min de ADR 0007/0014 en vez de un cron diario nuevo por tenant: "diario" se cumple por deduplicación en `notifications_log`, y de hecho llega antes que un cron a hora fija (dentro de los primeros 15 min desde que la llegada pasa a ser "mañana", no hasta 24h después).
- `packages/notifications`: kind `booking_reminder` (mismo `BookingPayload`, sin desglose ni botón de gestión — recuerda, no repite la confirmación), i18n en los 6 idiomas. 1 test nuevo (7/7 en el paquete).
- `notifyArrivalReminders(db, tenantSlug, apiKey)` en `apps/api/src/notify.ts`: reservas `status:'confirmed'` con `date_from = mañana`, cualquier canal, resuelve el email del titular vía `booking_guests`/`guests` — **si no tiene email, se omite sin más**, nunca cae al buzón interno del camping como sustituto (a diferencia del aviso de `pending`, este SÍ va al huésped). Dedup igual que ADR 0014. Enganchado al mismo `scheduled()` en `apps/api/src/index.ts`.
- Corregido de paso un descuido de la sesión anterior: `booking_pending_stuck` (ADR 0014) se quedó fuera de la lista `EVENTOS` de Ajustes y no tenía toggle visible en el dashboard pese a la promesa de ADR 0010 ("control total desde Ajustes"). Esta sesión añade AMBOS kinds nuevos a `apps/dashboard/src/pages/Ajustes.tsx` + etiquetas en `i18n.ts`.
- **4 tests de integración nuevos** (`apps/api/test/notify-cron.test.ts`, ahora también cubre ADR 0015): recuerda a un huésped confirmado que llega mañana y no repite el recordatorio, NO recuerda sin email del titular, NO recuerda una llegada que no es mañana, NO recuerda una reserva `pending` aunque llegue mañana. 59/59 en la suite privada.
- **Verificado contra el Worker real** (wrangler dev + D1 local sembrada + `--test-scheduled`): reserva confirmada de prueba con llegada "mañana" (fecha real, no de demo) y email del titular → el cron generó el recordatorio (`disabled`, sin `RESEND_API_KEY` local). Capturas de `/admin/#/ajustes` (los 6 toggles, incluidos los 2 nuevos) y `/admin/#/notificaciones` (las 5 notificaciones del aviso de `pending` de la sesión anterior + el recordatorio nuevo, todas resueltas correctamente). Datos de prueba limpiados después.
- `docs/FUNCIONALIDADES.md` §8, `docs/BACKLOG.md` al día
- **`pnpm check`**: ✅ verde (38/38)

**`/check`**: ✅ verde (38/38) · API 59/59 · notifications 7/7

### Sesión 26 — 2026-07-19 · BACKLOG 8.x · ADR 0014 — aviso de reservas `pending` colgadas

**Hecho** (continuación de la misma sesión cloud: "sigue perfilando... sin parar")

- `docs/adr/0014-aviso-reservas-pending-colgadas.md`: decisión v1 = SOLO avisa (no auto-cancela ni libera inventario) — un webhook de pasarela puede llegar con minutos de retraso por causas normales; cancelar de más perdería una venta real. Cancelar sigue siendo, como hoy, una acción manual de recepción.
- `packages/notifications`: kind nuevo `booking_pending_stuck` (reutiliza `BookingPayload`, sin campos nuevos salvo el ya existente `holderName`), plantilla propia sin desglose ni botón de gestión (es un aviso interno, nunca llega al huésped), i18n en los 6 idiomas. 1 test nuevo (7/7 en el paquete).
- `apps/api/src/notify.ts`: `dispatch`/`unitTypeName` dejan de depender de un `Context` de Hono (hasta hoy todo disparo de notificación ocurría dentro de una petición HTTP) — se extrae a un objeto plano `{db, tenantSlug, apiKey}`; `notifyAfter` (rutas) lo arma desde `c` sin cambiar su firma pública, `notifyNow` (nuevo) lo recibe directo para usarse desde un cron. Cero cambio de comportamiento en los 4 disparos existentes — verificado con la suite completa antes/después.
- `notifyStuckPendingBookings(db, tenantSlug, apiKey)`: reservas `channel:'web'` `status:'pending'` de más de 2h, avisa UNA vez (comprueba `notifications_log` antes de repetir), con el nombre del titular resuelto vía `booking_guests`/`guests` (mismo join que ya usaba `/admin/bookings`). Enganchado al MISMO cron `*/15 * * * *` de purga de holds de la Fase 5 en `apps/api/src/index.ts` (genérico — corre en cualquier tenant tier 3+ con pagos, no solo la demo; nada que tocar en `tenants/_template/wrangler.jsonc`).
- **4 tests de integración nuevos** (`apps/api/test/notify-cron.test.ts`, D1 real): avisa de una `pending` vieja con el titular y sin tocar su `status`, no repite el aviso en una segunda pasada del cron, NO avisa de una reciente (<2h), NO avisa de una confirmada aunque sea vieja, NO avisa de una `pending` por teléfono (nunca nace así por pago). 55/55 en la suite privada.
- **Verificado contra el Worker real** (wrangler dev + D1 local sembrada + `--test-scheduled`): insertada a mano una reserva `pending` de prueba (el demo usa `payments:{mode:'none'}`, así que nunca genera una `pending` real por su cuenta) — al disparar el cron aparecieron avisos para ELLA Y para 4 reservas `pending` reales que ya traía el seed (fechas del ancla de temporada, ya "viejas" respecto al reloj real), cada una `status:'disabled'` (sin `RESEND_API_KEY` local) con el código resuelto en `/admin/#/notificaciones`. Segunda pasada del cron: mismas 5, cero duplicados. Datos de prueba limpiados después.
- `docs/FUNCIONALIDADES.md` §8, `docs/BACKLOG.md` al día
- **`pnpm check`**: ✅ verde (38/38)

**Decisiones**: purgar de verdad (auto-cancelar + liberar inventario) queda declarado para cuando el volumen real de reservas colgadas lo justifique, no antes — ver ADR 0014 §1 para el porqué.
**`/check`**: ✅ verde (38/38) · API 55/55 · notifications 7/7

### Sesión 25 — 2026-07-19 · Fase 10 (1/varias) · ADR 0013 — reset nocturno + conmutador de nivel + banner de demo

**Hecho** (petición de Andreu en sesión cloud: "sigue perfilando... sin parar... con tu criterio cierra temas y comitea, mergea y sube a la rama principal")

- `docs/adr/0013-modo-demo.md`: de los cinco remates de Fase 10 pendientes, se cierran los tres que no dependen de ninguna cuenta real (reset nocturno, conmutador de nivel, banner); los otros dos (acceso readonly sin registro, Web Analytics) y `ui.logic2b.com`/Storybook quedan en BACKLOG con motivo explícito — ver "qué queda fuera" del ADR.
- **Reset nocturno**: `tenants/demo/reset.ts` (`resetDemoData`: `DELETE FROM` de las 21 tablas de la app en orden hijo→padre + `INSERT` del seed regenerado con el año en curso, todo en un único `db.batch()` atómico) + `tenants/demo/worker.ts` (envuelve `@logic-camp/api` sin tocarlo — apps/api sigue siendo 100% genérico, ni una tabla de Cala Sereno entra en su bundle; solo `tenants/demo/wrangler.jsonc` apunta su `main` aquí). Segundo cron `0 3 * * *` junto al de purga de holds de la Fase 5. Doble guarda (`TENANT_SLUG==='demo'` + cron correcto) aunque el fichero nunca se referencia desde otro tenant.
  - `apps/api` gana un `exports` en su `package.json` (no lo necesitaba: nadie lo importaba como paquete hasta hoy) y re-exporta el tipo `Bindings` desde `index.ts` — cero cambios de comportamiento.
  - 16 tests nuevos en `tenants/demo` (`reset.test.ts`, D1 real vía `@cloudflare/vitest-pool-workers` — primera vez que este tenant tiene su propia D1 de test, mismo patrón que `apps/api`): siembra completa, wipe+reseed sin acumular basura de un "día de demo" simulado (notificación+auditoría+sesión de más, insertadas a mano y confirmadas borradas), determinismo, orden de borrado.
  - **Verificado contra el Worker real** (`wrangler dev --test-scheduled`): login, nota de prueba en `bkg_001` vía `PATCH`, disparo de `/cdn-cgi/handler/scheduled?cron=0+3+*+*+*` → la nota vuelve a la del seed, la sesión anterior queda invalidada (sesiones también se borran), 83 unidades siguen ahí. Cron de purga de holds verificado igual, sin cambios.
- **Conmutador de nivel 1/3**: `config.demoTierSwitch` (packages/config) + `Home.astro` genera LOS DOS héroes cuando está activo (antes solo uno, según `TIER` de build) con `data-hero-nivel`, CSS puro en `global.css` (`:root[data-nivel]`) decide cuál se ve — mismo patrón sin-FOUC que el selector de temas del ADR 0009. Verificado que la regla dura del bundle sigue intacta: un tenant real (`demoTierSwitch` nunca definido) con `TIER=1` sigue en 121 páginas, 0 islas — el flag es la única puerta.
- **Banner de demo**: `config.isDemo` + franja fija en `Base.astro`, 6 idiomas nuevos (`demo.banner/nivel/nivel1/nivel3` en los content JSON). Envuelto en el mismo contenedor `fixed` que el header (no lo solapa, lo empuja) y variable CSS `--lc-chrome-h` (3.5rem sin banner, 5.5rem con él) que el `sticky` del mostrador de Home.astro consume — verificado con capturas que no hay solape ni en el héroe ni al hacer scroll con el mostrador pegado.
- **Verificado visualmente con Playwright contra el Worker real** (1366px y 375px): banner + header + mostrador sin solape, toggle de nivel cambia de héroe en el sitio sin recarga, versión móvil legible. Capturas en `/tmp` (no versionadas).
- `docs/ROADMAP.md` (Fase 10 pasa a 🟨 parcial, checklist de remates al día), `docs/BACKLOG.md` (los tres diferidos + el refinamiento de ancla "hoy" para v2)
- **`pnpm check`**: ✅ verde (38/38, sin tareas nuevas en el pipeline — `tenants/demo` ya tenía su propio `test`)

**Decisiones**: el reset vive SOLO en `tenants/demo/` (no en `apps/api`) — mismo principio que separa `apps/web` de `tenants/{slug}/content`; el conmutador de nivel es atrezzo dentro de un build tier 3 real, no un segundo build (la demo siempre construye `TIER=3`); el ancla del reset sigue siendo mitad de temporada alta del año en curso, no "hoy" exacto — ver ADR 0013 §1 para el motivo y el v2 declarado en BACKLOG.
**`/check`**: ✅ verde (38/38) · `@tenant/demo` 16/16 nuevos (26 en total con `seed.test.ts`)

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
