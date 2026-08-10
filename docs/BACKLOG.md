# BACKLOG

Ideas y peticiones que NO son de la fase en curso. Aquí, no al código. Formato: `- [fase probable] descripción — fecha`.

## Índice operativo de pendientes vivos (R12 · 2026-08-10)

Este índice manda para elegir trabajo; las entradas extensas de debajo conservan
la historia y los criterios. Un ítem no cambia de gate porque parezca barato.

- **Local ahora, por checkpoint:** R12 integraciones y proveedores. Primero se
  inventaría por tier qué recorrido existe y se termina el contrato común que
  pueda probarse sin red; cualquier sandbox o cuenta permanece en su gate. R11
  está cerrado y la auditoría R9 deja D5-V en espera 3/3 porque una demo nueva
  sigue detrás de señal comercial, no de disponibilidad técnica.
- **Cliente real:** extensiones `custom/`, cache KV por tráfico, fianza,
  reintento de pago, mover entre tipos, traducción de guías, auditoría
  encadenada, parte de viajeros y cualquier bloque `[CLIENTE-REAL]`.
- **Credencial/proveedor:** sandbox Redsys, Analytics, Sentry/Logpush, Queues y
  reintentos reales, restauración remota, carga contra un objetivo autorizado y
  revisión del payload real de pagos.
- **Decisión/aprendizaje comercial:** tematizar el gestor, enriquecer email,
  abrir bloqueos al visitante, volver a mostrar «cerrado», nacionalidad/nombre y
  cualquier nueva demo D5-V/D6-V. Requieren señal observada, no iniciativa
  técnica.
- **Descartado o ya absorbido:** Storybook duplicado, crear bloqueos arrastrando,
  textos originales conservados bajo cierres posteriores y E3-V/E4-V absorbidos
  por D1-V. No se seleccionan como trabajo.

La publicación del vídeo de la sesión 104 está **preparada pero no autorizada**;
es un gate de producción, no un pendiente local de implementación.

- ~~[10] `?tema=x` en la URL de la demo~~ → hecho 2026-07-19 (sesión 18: el parámetro valida contra la lista, persiste y gana a localStorage)
- [10] Tematizar también el dashboard de la demo con los temas del ADR 0009 —
  **no seleccionado en R8**: el gestor conserva marca Logic2B y los escenarios
  cambian datos/recorrido dentro de `apps/dashboard/src/demo/`, no la piel. Abrir
  solo si una demostración comercial observa valor superior al coste de mezclar
  ambas marcas — 2026-07-19, auditado 2026-08-10.
- [7.x] Migrar plantillas de email a React Email cuando haga falta diseño rico (el contrato render() no cambia — ADR 0010) — 2026-07-19
- [7.x] Cloudflare Queues + reintentos programados para notificaciones cuando el volumen lo pida. R12/ADR 0043 ya cubre el fallo transitorio inmediato con dos intentos y la misma clave idempotente; sigue faltando una cola durable para reenvío posterior, y no se abre sin volumen o tráfico fallido real (hoy `waitUntil`) — 2026-07-19, actualizado 2026-08-10
- ~~[7.x] Pantalla de log de notificaciones en el dashboard~~ → hecho 2026-07-19 (sesión 21: `GET /api/admin/notifications` + `/admin/#/notificaciones`, filtro por estado, destino resuelto a booking/enquiry). **Reenvío manual de fallidos queda fuera**: el driver ya registra uno o dos intentos y puede probar `failed` sin red, pero no existe evidencia de fallo/volumen real que justifique Queue o acción manual; retomar con una cuenta autorizada y tráfico real
- ~~[7.x] Recordatorio de llegada (cron diario sobre arrivalsOn)~~ → hecho 2026-07-19 (sesión 27, ADR 0015): resulta que NO hacía falta esperar a tener `RESEND_API_KEY` real — se verifica igual de bien en estado "desactivada" (ADR 0014 ya lo demostró). Mismo cron de 15 min de ADR 0007/0014, sin trigger nuevo por tenant.
- [8.x] Fianza (`deposit_cents`) cobrada vía pasarela: pre-autorización (Stripe `capture_method:manual`, Redsys autorización tipo 1 + confirmación tipo 2) sin mezclarla con `paidCents` — declarado fuera de v1 en ADR 0011 §2 — 2026-07-19
- [8.x] Verificar el adaptador Redsys contra su sandbox real con las credenciales de comercio de Andreu (clave, FUC, terminal) antes del primer cobro real — la firma está verificada por construcción (3DES cruzado contra `node:crypto`, HMAC nativo) pero no contra el TPV real — ADR 0011 §7 — 2026-07-19
- ~~[R12/pagos] Cerrar la salida HTTP de Stripe~~ → **hecho 2026-08-10 (sesión 117)**: timeout 8 s, clave estable por Checkout/refund, respuesta Zod, máximo dos intentos seguros y error cerrado sin body remoto. Sigue pendiente validar el acuse funcional del refund Redsys, que hoy considera aceptado cualquier HTTP 2xx. Es trabajo local previo al sandbox, no evidencia de proveedor.
- ~~[8.x] Cron de purga/aviso de reservas `pending` colgadas~~ → hecho 2026-07-19 (sesión 26, ADR 0014): SOLO avisa (email interno + `notifications_log`, una vez por reserva), no cancela ni libera inventario — riesgo de cancelar una venta real por lag del webhook. Mismo cron de la purga de holds de la Fase 5 (`apps/api`, genérico). **Purgar de verdad (auto-cancelar) queda declarado para cuando el volumen real lo justifique**, no antes.
- [8.x] Botón "reintentar el pago" en `/reserva` cuando `pago=cancelado`/queda `pending` mucho tiempo (hoy solo se informa y se remite a recepción) — 2026-07-19
- ~~[8.x] Pantalla de log de pagos en el dashboard~~ → hecho 2026-07-19 (sesión 24: `GET /api/admin/payments` — `payments` ya era el log completo desde ADR 0011, esta pantalla solo lo hace visible — filtro por proveedor y estado, `/admin/#/pagos`)
- ~~[C5.1] Descargar las 6 fotos Higgsfield de sesión 8~~ → **hecho 2026-07-22 (sesión 40, en la máquina de Andreu)**: `pnpm --filter @tenant/demo fetch:fotos` corrió sin el bloqueo de red del contenedor — las 6 fotos (premium, autocaravana, interiores bungalow/glamping, piscina, restaurante) en `tenants/demo/content/media/`. Texto original: Descargar las 6 fotos Higgsfield de sesión 8 (`C-BUG-5`, ADR 0024): script listo, `pnpm --filter @tenant/demo fetch:fotos` (`tenants/demo/scripts/fetch-higgsfield-fotos.mjs`), descarga+optimiza las 6 a WebP en `tenants/demo/content/media/`. **Bloqueo de red repetido en TRES sesiones distintas** (8, la de esta línea, y la de C5/ADR 0024): el contenedor no tiene salida a `cloudfront.net` (403 de política, confirmado de nuevo en `$HTTPS_PROXY/__agentproxy/status`, no es un fallo de certificado). No hace falta regenerar nada — solo correr el script desde un entorno con esa salida permitida (máquina de Andreu, o pedir al administrador que añada el host a la lista de permitidos) — 2026-07-19, actualizado 2026-07-21
- ~~[9.x] `packages/cli` (`pnpm new:camping`): parte pura (scaffold + plan)~~ → hecho 2026-07-19 (sesión 21, ADR 0012 §7). Queda: `runInfraPlan --apply` NUNCA se ha ejecutado contra la cuenta real — bloqueado por credenciales y mandato, no por código. Cuando Andreu tenga el token de §5: probar `--apply` contra un tenant real por primera vez, con supervisión.
- [9.x] Conectar `createExtensionRegistry()` (Fase 2, sin usar desde entonces) a `apps/api`: alias de build para `custom/hooks.ts` + `transform()`/`emit()` en los puntos reales — diseñado en ADR 0012 §3, se hace en la sesión del primer `custom/` real — 2026-07-19
- [9.x] Crear un tenant de prueba real en nivel 1 (criterio de "hecho" de la Fase 9) — bloqueado por credenciales de Cloudflare y mandato explícito, ver ADR 0012 §5 — 2026-07-19
- [9.x] Cachear `TenantConfig` en KV (`CONFIG` binding) con invalidación en `PATCH /api/admin/settings` — hoy es un `SELECT` por request, barato mientras solo exista la demo; optimizar cuando haya un camping real con tráfico (ADR 0012 §2) — 2026-07-19
- ~~[10] Acceso al dashboard demo sin registro~~ → **hecho 2026-07-25 (sesión 50, ADR 0029)**: las tres preguntas que lo tenían parado se le plantearon a Andreu y las contestó — puerta **anónima** (botón "Ver la demo" en el login), alcance **leer + gestos del planning + check-in/out**, y limpieza con **botón de restablecer** además del cron nocturno. Rol `demo` en el **nivel 0** (empatado con `readonly`, fail-closed: nace sin poder mutar nada) + la excepción autorizada **por acción, no por ruta** (`PATCH /bookings/:id` es la puerta de 13 acciones; abrirlo entero habría regalado `cancel`/`record_payment`/`refund`). Barrido `demo-role.test.ts` dirigido por `app.routes`: una ruta nueva nace denegada y la entrega falla si alguien la abre sin declararlo. Puerta en `tenants/demo/worker.ts` (sonda + sign-in + reset), nunca en `apps/api`. Sin migración: `users.role` no tiene `CHECK`
- [10] Que el visitante de la demo pueda **crear y levantar bloqueos**: fuera del alcance que acotó Andreu en la sesión 50 (un bloqueo quita inventario a la vista hasta el reset). El gesto de "crear arrastrando sobre celda libre" del planning (ADR 0023 §2) también acaba en el aviso de solo lectura — es coherente y está explicado, pero es el único gesto del planning que el visitante empieza y no puede terminar. Reabrir si al enseñar la demo se echa en falta — 2026-07-25
- ~~[10] Esconder por rol las afordancias de mutación en las 13 pantallas que hoy pintan botones sin mirarlo~~ → **hecho 2026-08-10 (sesión 109/R6)**: API y gestor consumen `@logic-camp/config/roles`; no existe una lista cliente independiente. El servidor conserva la autoridad y el rol demo solo recibe la capacidad visual que corresponde a sus cinco acciones explícitas. Planning, plano, ficha, huéspedes, reservas, llegadas, solicitudes, inventario, tarifas, ajustes y RGPD ocultan o desactivan la mutación sin perder lectura; un E2E fija la matriz demo. El subpath dedicado evita arrastrar el barrel de configuración al bundle — 2026-07-25, cerrado 2026-08-10
- [10] Cloudflare Web Analytics en la demo — necesita un token real del panel de Cloudflare, mismo bloqueo que Resend/Stripe/Redsys en fases anteriores — 2026-07-19
- ~~[10] `ui.logic2b.com` / Storybook propio~~ → **descartado 2026-08-10
  (R1)**: `ui.logic2b.com` ya es la referencia externa y `packages/ui` cubre el
  consumo local. Reabrir solo con un consumidor demostrado.
- ~~[10] Reset nocturno v2: el ancla móvil~~ → **hecho 2026-07-27 (sesión 57, ADR 0030)**: `generateSeed` recibe una FECHA (`YYYY-MM-DD`) en vez de un año, y esa fecha es **hoy** — la lee el llamante (`reset.ts`/`write-seed.ts`/`data.ts`), no el generador, que sigue puro. El PRNG se sigue sembrando con el **año**, a propósito: el camping es el mismo los 365 días y lo único que se mueve es la línea de HOY (si colgara del día, la demo se reorganizaría entera cada madrugada y el `CS-2026-0412` de ayer sería hoy otra cosa). La ventana de siembra pasa de `abr-15 → oct-15` a **`${Y-1}-11-15 → ${Y+1}-02-15`** (el desborde es lo que evita que el 1 de enero no haya pasado y el 28 de diciembre no haya futuro), la apertura declarada pasa al **año natural** (`1 ene – 31 dic`, que es lo que la tabla de tarifas de la web sabe leer) y la curva de ocupación gana los meses de invierno con estancias largas de invernante. La línea temporal alrededor del ancla se resuelve en **una función con cinco casos** —pasada, sale hoy, en casa, llega hoy, futura— y las dos que faltaban son justo las del defecto. Además, **la banda del día se planta**: seis reservas alrededor del ancla garantizan los dos gestos incluso un 15 de enero al 18 % de ocupación, donde el sorteo dejaba una sola salida y encima ya cerrada. **Coste**: el seed pasa de 2 032 a 3 491 reservas y el SQL de 1,95 a 3,4 MB (53 → 84 sentencias) — verificado contra D1 real en workerd. Texto original abajo — 2026-07-19, cerrado 2026-07-27
- ~~[seed] **`/clientes` enseña once "Aalto" seguidos**~~ → **hecho 2026-08-03 (sesión 68)**: el seed sustituye la biyección uniforme por plazas de apellido con cola larga (1–40 apariciones), manteniendo cada pareja nombre+apellido y correo única. En las 23 anclas, la primera página contiene ≥7 apellidos y ninguno ocupa más de cuatro filas.
- ~~[seed] **`created_at` de las 3 500 reservas es el ancla**~~ → **hecho
  2026-08-06 (sesión 79)**: cada alta deriva ahora del canal con PRNG propio
  (web 30–180 días, teléfono 2–41, mostrador en la llegada; las futuras se
  ajustan para no crear datos futuros). Cuatro tests sobre 23 anclas fijan
  cronología, diferencia de medianas, mostrador y >180 fechas distintas. D1
  real: 3.426 reservas, 400 fechas web, 115 días medios web frente a 47 por
  teléfono y cero altas posteriores a llegada/ancla. La ficha histórica se
  verificó en navegador contra el bundle y Worker reales. Texto original:
  una estancia terminada en mayo decía que se creó hoy, y en `/reservas`
  ordenado por fecha de alta todas empataban — 2026-07-27.
- [10] **El estado "cerrado" del motor ya no se ve en la demo**: ADR 0030 abre Cala Sereno todo el año, así que ninguna fecha cae fuera de temporada y la web pública nunca contesta "cerrado, abre el …". La capacidad sigue con su test en `packages/core` (`engine.test.ts`) y en el editor de temporadas. La variante que conserva las dos cosas: una **ventana cerrada derivada del ancla**, siempre a varios meses de hoy — se descartó por gimmicky, pero es barata si al enseñar la demo se echa en falta — 2026-07-27
- _(texto original de la línea de arriba)_ [10] Reset nocturno v2: recalcular el ancla para que "hoy" caiga siempre dentro de la ventana de llegadas/salidas del día, no solo mitad de temporada alta del año en curso — exige redistribuir `generateSeed` con una franja de reservas alrededor de la fecha real además del bloque histórico de temporada alta, tocando lógica con 10 tests calibrados sobre el ancla fija; declarado fuera de v1 en ADR 0013 §1 — 2026-07-19. **Evidencia nueva (sesión 56, 2026-07-27), que sube su prioridad**: el **botón de check-out no aparece NUNCA en la demo, ningún día del año**. `checked_in_at` solo se estampa sobre las estancias que contienen el ancla (`from <= anchor < to`) y `/llegadas` mira el **día real**, así que quien sale hoy —según el reloj del seed— todavía no ha llegado, y la lista de Salidas no ofrece jamás el gesto que la justifica. Y no basta con arreglar el `<` final: ni siquiera el propio 15 de julio lo enseñaría bien, porque el reloj del seed y el del navegador solo coinciden un día al año. Corolario: fuera de la ventana de julio la pantalla de la operación diaria sale **vacía**, y es la que la recepcionista mira más veces al día
- ~~[B3] OG image real de la landing~~ → hecho 2026-07-21 (sesión C5, ADR 0024): tarjeta de marca Logic2B (tokens oklch + isotipo + Space Grotesk, 1200×630), `apps/site/public/og.png`, sin fotografía del tenant.
- ~~[B3] Sustituir la maqueta CSS del planning en la landing por captura REAL~~ → hecho 2026-07-21 (sesión C5, ADR 0024): captura real del dashboard con datos del generador de seed puro, sin workerd (bundle + stub Node + Playwright, mismo patrón que C1). Animación queda fuera — solo se pidió sustituir la maqueta estática.
- ~~[B3] Idiomas fr/de/nl de la landing~~ → hecho 2026-07-22 (sesión 40, ADR 0027): `fr.json`/`de.json`/`nl.json` completos + `LOCALES` ampliado — la landing y el cromo de las guías en 6 idiomas (156 páginas construidas)
- ~~[B3] Re-correr el E2E de Playwright del funnel de reserva contra la demo bajo `/demo/`~~ → hecho 2026-07-25 (sesión 51), y no era solo re-correrlo: estaba **rojo 4/4** desde ADR 0016 porque el spec navegaba a `/reservar` y en el bundle compuesto la web del tenant vive en `/demo/reservar` (prefijo extraído a `e2e/base.ts` → `WEB`, sobreescribible con `E2E_WEB_BASE`). Debajo había **dos fuentes de flakiness propias del test**, no del producto: (a) las fechas salían de `10 + (minutos % 12)` a ciegas y el glamping está **lleno del 17 al 20 de septiembre** en el seed limpio → 4 de cada 12 minutos fallaba por el reloj; (b) el ciclo de fechas duraba **12 min** y un hold vive **15**, así que dos pasadas seguidas reciclaban holds vivos (el cron que los purga no corre en `wrangler dev`). Ahora `estanciaLibre()` **le pregunta a la API** y avanza hasta el primer hueco real, de una petición en una (el rate limit de `/api/*` es 60/min y barrer el mes entero se comía media suite). Suite **7/7 verde en tres vueltas consecutivas** sin resembrar entre medias
- ~~[B] Actualizar `docs/DEMO-SCRIPT.md` a `/demo/`~~ → **hecho 2026-08-10
  (sesión 105/R1)**: separa landing, web ficticia y gestor; elimina agosto/año
  fijos y usa la puerta anónima vigente.
- ~~[B1] Reskin del dashboard a Logic2B UI~~ → **hecho en ADR 0017**; esta
  entrada era un duplicado anterior al cierre ya documentado abajo.
- ~~[B2] Estructura Logic2B en la web de tenant + firma «powered by Logic2B»~~
  → **hecho en ADR 0018**.
- ~~[B4] Documentación de producto con marca Logic2B~~ → **hecho en ADR 0025
  y sus ampliaciones C6**.
- ~~[B1] Reskin del dashboard a Logic2B UI~~ → hecho 2026-07-20 (ADR 0017): sidebar agrupada plegable con isotipo, tokens/fuentes del DS, planning con el mapa de colores aprobado. Verificado en vivo. Quedan dos remates abajo.
- ~~[B1] Rename literal de las clases del dashboard~~ → **cerrado 2026-08-10
  (sesión 110/R6)**: la deuda descrita ya no existe. Un barrido literal sobre
  `apps/dashboard/src` devuelve cero usos de `pino`, `arena`, `tinta`, `crema`
  y `tinta-suave`; ADR 0020 ya había eliminado los puentes de `styles.css`.
  `.lc-bar`, `.lc-chip` y `.lc-receipt` permanecen porque nombran componentes
  de dominio, no colores del tenant. No se ejecutó un rename sin objetivos.
- [C2] **AVISO antes de tocar este ítem (sesión 52)**: siete de las claves que el detector marcaba como huérfanas —`pagl.fecha/reserva/proveedor/importe` y `ntf.fecha/evento/destino/canal`— **no lo eran**: eran las cabeceras de columna de Pagos y Notificaciones, que nunca se pintaron. Ya se usan. La lección para el resto de la lista: una clave sin usar puede significar "falta la UI", no "sobra la clave" — mirar qué describe antes de borrarla.
- ~~[C2] Limpiar claves i18n huérfanas del dashboard tras ADR 0020~~ → **hecho
  2026-08-10 (sesión 110/R6)**: comprobadas por literal y por familia antes de
  borrar. Se retiraron `planning.error`, `ficha.error`, `res.error`,
  `inv.cargando/error`, `tar.cargando/error`, `inf.cargando/error` y
  `pagl.error`; `dia.error` ya no existía. Las claves dinámicas y las cabeceras
  advertidas en la sesión 52 no se tocaron. Los estados visibles usan
  `Skeleton*` y `QueryError` con salida de reintento.
- ~~[C1] Planning: virtualizar también el eje horizontal~~ → resuelto de otra forma en ADR 0023 §5 (2026-07-21): el coste no eran las barras sino el sombreado de finde por celda×fila; ahora es UN `repeating-linear-gradient` por lienzo (`weekendBackground`, `packages/config`) y la virtualización de columnas queda **descartada con medida** — reabrir solo si algún día existe un zoom "Año" (365 días × 300 uds), con medidas nuevas
- ~~[C2] Auditar las animaciones nuevas del DS (`tw-animate-css`) bajo `prefers-reduced-motion`~~ → hecho 2026-07-25 (sesión 51), y la sospecha era fundada: **`motion-reduce:animate-none` no servía para nada** en dialog/alert-dialog/sheet/popover/dropdown/tooltip. Motivo comprobado en navegador: las variantes de Radix generan `.clase[data-state=open]` —especificidad (0,2,0)— y `motion-reduce:animate-none` vive en un `@media`, que **no suma especificidad**: (0,1,0). Perdía siempre, en cualquier orden. Además seguían vivas TODAS las transiciones de Tailwind en la web pública y el dashboard (43 y 151 elementos). Arreglado con el reset canónico en un solo bloque por raíz (`packages/ui/theme.css`, `apps/web`, `apps/site`) en lugar de N clases por componente; las 14 clases `motion-reduce:*` se han borrado para que nadie vuelva a creerse una guardia inerte. `animation-iteration-count: 1` faltaba también en el bloque de `apps/site` (0,01ms en bucle infinito repinta para siempre). Lo vigila `apps/web/e2e/reduced-motion.spec.ts`, que barre el DOM y falla si algo se mueve
- ~~[B1] Sidebar del dashboard en móvil (375px): off-canvas con botón hamburguesa~~ → hecho 2026-07-21 (sesión 38): bajo `md` la sidebar persistente se oculta (`hidden md:flex`) y una barra con hamburguesa abre la navegación en el primitivo `Sheet` (`side="left"`, trampa de foco + Escape + overlay); pulsar un enlace cierra el drawer. El contenido se extrajo a `SidebarInner`, compartido por la sidebar de escritorio y el off-canvas (añadir un enlace no se olvida en una de las dos vistas). Verificado con Playwright a 1366px (aside visible, sin hamburguesa) y 375px (aside oculta, drawer abre con los 12 enlaces y cierra al navegar), light y dark. **Hallazgo**: destapó que la familia `--color-sidebar*` NO estaba mapeada en el `@theme` de `packages/ui/src/theme.css` — `bg-sidebar`/`border-sidebar-border` no generaban CSS desde B1 (ADR 0017) y la sidebar iba **transparente** (invisible sobre página blanca, el overlay del drawer la destapó). Mapeada — misma clase de bug "el DS funciona por coincidencia" del hallazgo Tailwind de ADR 0020
- ~~[B1] Adoptar los primitivos de `packages/ui` (Card/Badge/Input/Table…) en las 11 pantallas del dashboard de forma incremental (hoy solo el shell usa Button/LogoMark; el resto sigue con markup propio ya tematizado por tokens) — 2026-07-20. **3 de 11 hechas en la sesión 52 (2026-07-25)**: Pagos, Notificaciones y Reservas usan `Table*` del DS (+ `Input`/`SelectNative`/`focusRing` en Reservas), y de paso apareció que **Pagos y Notificaciones no tenían cabecera de columna** — los nombres vivían en un comentario. El primitivo `Table` necesitó `containerClassName` para poder llevar cabecera pegajosa (su `overflow-x-auto` convertía al contenedor en el scroller de ambos ejes y el `thead sticky` se pegaba a algo inmóvil). **5 de 11 tras la sesión 53 (2026-07-25)**: Clientes y Tarifas migradas también — con ellas se acaban las pantallas que **son** tablas. En Tarifas los `Input` van a `h-7` porque la altura de fila ya la fijaba el botón `size="xs"` (28px): con el `h-8` de serie la fila crecería sin motivo. De paso, defecto del primitivo arreglado en el primitivo: `TableRow` iluminaba también la fila de `<thead>` al pasar por encima → anulado en `TableHeader` (`[&_tr]:hover:bg-transparent`), con test. **Las 6 que quedan NO deben ser tablas** (Informes e Inventario son rejillas de tiles; **Llegadas y Solicitudes son listas con acciones por fila y convertirlas a tabla por simetría sería una regresión**; Parte y Ajustes son formulario y detalle): lo que les toca ya no es `Table*` sino `Card`/`Input`/`Label`/`Badge`. Mirar cada una antes de tocarla. El chip de estado se queda en `.lc-chip` y **no** pasa a `Badge`: comparte el mapa de color con `lc-bar` del planning (ADR 0017). **6 de 11 tras la sesión 55 (2026-07-25)**: Solicitudes. Confirmado que NO era trabajo de markup — ya usaba `Button`/`EmptyState`/`SkeletonRows`/`focusRing`, y lo que le faltaba era **cabecera de columnas** (`sol.recibida`/`sol.fechas`/`sol.tipo` llevaban desde la sesión 18 escritas y sin usar: mismo hallazgo que Pagos y Notificaciones en la 52). Y la cabecera destapó lo de verdad: **las columnas de la lista nunca estuvieron alineadas entre sí** — cada fila es su propia rejilla (`<button>` sueltos, no un `<table>`) y la última columna era `auto`, así que la palabra del chip movía la columna "Tipo solicitado" **46 px** de una fila a otra. Ancho fijo para el estado (104px) y la rejilla en **una sola constante** compartida por cabecera y fila. **Regla para las 5 que quedan**: en una lista de filas-`<button>`, ninguna columna `auto` — no hay `<table>` que las alinee~~ → **CERRADO 2026-07-29 (sesión 59): 11 de 11.** Las dos últimas, Parte y Ajustes, en la línea de abajo.
- ~~[B1] Las 2 pantallas que quedan para cerrar la adopción del DS: **Parte** y **Ajustes** (formulario y detalle; Ajustes ya usa `Input`/`Label`/`Switch`, así que le queda poco) — 2026-07-25. **Informes e Inventario hechas en la sesión 58** (9 de 11): en Informes el `Tile` a mano pasa a `Card` y el defecto del titular de dos líneas que hundía su cifra se arregla **reservando la altura de dos líneas de rótulo en todas las tarjetas** (`min-h-[2lh]` en el `CardDescription`) — estructural, no de copy: con i18n el alemán partirá titulares que el español no parte, y la reserva vale para cualquier idioma. En Inventario el encargo decía «tiles → Card» pero los chips **ya eran** `Button` del DS con `AlertDialog`; lo que faltaba era estructura — secciones planas que dejaban medio lienzo vacío («Mobil-home · 4» = 4 chips y una fila desierta) → fichas `Card` por tipo en **rejilla de 2 columnas** (`lg:grid-cols-2`), los 8 tipos a la vista sin scroll a 1100×800. Regla confirmada por sexta vez: mirar la pantalla antes de tocar el markup. **Llegadas hecha en la sesión 56** (7 de 11): arrastraba el `auto` **por partida doble** (las dos columnas de los extremos) más una tercera desalineación propia —la fila sin botón de recepción medía 109px más que sus vecinas—, y la peor de todas, el corte de las dos listas por `lg:` cuando quien las estrecha es la ficha de reserva (titular de 45px con el panel abierto) → `@container`. **Cabecera de columnas descartada con motivo**: la fila son 3 columnas en dos renglones, y tres rótulos nombrarían la mitad de los seis valores; las cinco claves `dia.*` muertas se borraron con la razón escrita al lado. Regla que se confirma otra vez: **mirar cada pantalla antes de tocarla**, que el hallazgo no está en el markup~~ → **hecho 2026-07-29 (sesión 59): B1 queda 11/11 y se cierra.** Y por séptima vez, mirar la pantalla cambió el trabajo: en **Ajustes** el defecto no era de markup sino de **comportamiento** — el bloque de notificaciones vivía DENTRO del `<form>` de datos del camping, así que la sumisión implícita de sus `<input>` (que va a `input.form`) hacía que **Intro en «Buzón interno» guardara nombre/zona/moneda**, o nada si esos tres no estaban sucios: el correo escrito se perdía en silencio. Dos `<form>`, dos submits, y clave de toast propia para no decir «Ajustes guardados» al guardar notificaciones. Verificado con Intro real: un solo PATCH y es el de `modules.notifications`. Lo visual: tres `Card` en rejilla de 2 columnas (`max-w-xl` dejaba dos tercios del lienzo vacíos a 1366px), las dos fichas cortas apiladas en UNA celda —como celdas hermanas la fila la estiraba «Notificaciones» y quedaban 200px muertos— y la ficha de solo lectura «Nivel e idiomas» fuera de entre el último campo editable y el botón (ahí parecía editable). En **Parte**, medido: la forma de pago quedaba a **810px** de su código de reserva por el `justify-between` a lo ancho → columna de ancho fijo (11rem) con cabecera y la rejilla en UNA constante compartida (regla de la 55) → las 8 filas y la cabecera en **x=819 exacto**; estados vacíos a `EmptyState`.
- ~~[B1] Los otros dos campos de fecha crudos del dashboard~~ → **cerrado
  2026-08-04 (sesión 76)**. Parte pasó a `Input` en la 59; Planning completa
  el remate al construir M4: `Input` del DS, nombre accesible y 32 px compactos
  en escritorio, 44 px/16 px en la agenda móvil. El anillo de foco deja de ser
  una piel local y vuelve a la fuente única del DS. Contexto original: Llegadas
  ya había migrado en la 56 y las tres pantallas arrastraban pieles distintas.
- ~~[marca] Decidir el favicon tras el cambio a wordmark~~ → **cerrado al
  reconciliar BRAND en R1 (2026-08-10)**: se conserva el isotipo precisamente
  para favicon y firma del tenant; no se presenta como lockup del producto.
- ~~[marca] **`docs/brand/` y el OG image siguen con el isotipo como logo del producto**~~ → **hecho 2026-07-30 (sesión 61)**: dos tarjetas (`og.png` / `og-en.png`, una por idioma) con el wordmark «Logic2B Campings», sin isotipo, y el texto sacado del mismo `content/{lang}.json` que pinta la landing. Lo que de verdad cierra el ítem es que ahora hay **generador commiteado** — `apps/site/scripts/og.mjs`, `pnpm --filter @logic-camp/site og` —: la tarjeta de C5.2 se hizo con un script de sesión que no se guardó, y por eso este ítem existió. Los colores se **leen** del `:root` de `packages/ui/src/theme.css` en vez de copiarse (verificado: el PNG sale byte a byte idéntico). Queda vivo solo lo de `docs/brand/`, abajo
- ~~[dashboard] «Parte de viajeros» se ofrecía a roles sin permiso~~ → **hecho
  2026-08-04 (M1)**: `NAV_GROUPS` declara `manager` y sidebar/portada filtran
  desde la misma fuente; el servidor conserva su 403.
- ~~[C4] Ficha de reserva móvil como `Sheet` completo~~ → **hecho 2026-08-04
  (M1)** a 320/375/430 px con foco, Escape y retorno al origen.
- ~~[seed] **Ninguna de las 83 unidades está fuera de servicio**~~ → **hecho 2026-08-03 (sesión 69)**: `C-10` (avería eléctrica) y `MH-04` (reforma) quedan `inactive` en las 23 anclas, sin reservas asignadas. Inventario, Planning y Plano enseñan el estado; Planning impide crear, mover o reasignar hacia una baja y el Plano la distingue de un bloqueo temporal. El relleno y la banda diaria excluyen ambas, sin romper capacidad ni invariantes.
- ~~[B1] La sidebar deja **dos enlaces marcados como activos** al navegar
  cambiando el hash programáticamente~~ → **cerrado 2026-08-10 (sesión
  108/R6)**: el defecto ya no se reproduce con el router actual. Un E2E contra
  el bundle y Worker reales fija exactamente un `aria-current=page` en portada,
  tras asignar `window.location.hash` y tras un `.click()` sintético; los dos
  últimos casos dejan activo únicamente el destino.
- ~~[dashboard] La portada no tenía guía contextual~~ → **hecho 2026-08-10
  (sesión 108/R6)**: nueva guía «Orientarte desde la portada» sobre cifras,
  listas, módulos por rol y puntos de entrada; el `?` de Inicio la abre y una
  prueba E2E comprueba destino y ausencia de desbordamiento a 375/1366 px.
- ~~[infra] **`POST /api/demo/reset` cuelga el workerd LOCAL con el seed grande
  de ADR 0030**~~ → **cerrado 2026-08-10 (sesión 113/R10)**: ya no se reproduce
  con el runtime local actual. Un E2E dedicado ejecuta el `db.batch()` completo,
  exige 200, espera el nuevo sign-in, comprueba el aviso y recarga el gestor sin
  expulsar al visitante; la respuesta volvió en menos de un segundo. El seed
  conserva sus 3,4 MB / 84 sentencias y no se añadió un atajo distinto para
  local. Texto original: el workerd de 2026-07-28 quedaba colgado tras 180 s,
  aunque D1 remota completaba el mismo endpoint en 1,2 s.
- ~~[seed] Los nombres de las solicitudes no concordaban con su idioma~~ →
  **hecho 2026-08-10 (sesión 107/R5)**: las 15 firmas salen de repertorios
  locales independientes por idioma, con email único y sin tocar el recorrido
  combinatorio de las ~1.500 fichas de huéspedes. Una prueba sobre diez
  temporadas exige nombre↔idioma, unicidad y determinismo; mensaje y prefijo ya
  tenían su propia garantía desde la sesión 55. La relación nombre↔nacionalidad
  de huéspedes continúa diferida por la razón explícita de su entrada propia.
- [seed] `enquiries.converted_booking_id` apunta a `bkg_0NN` por número de orden:
  la reserva enlazada no tiene nada que ver con la solicitud (ni titular, ni
  fechas, ni tipo). R5 confirmó que el gestor no pinta ni enlaza este campo; se
  conserva hasta que exista un recorrido de conversión real, porque corregir un
  dato invisible violaría el alcance del checkpoint — 2026-07-25, revalidado
  2026-08-10
- ~~[C7→C1.2] Crear reserva arrastrando sobre una celda LIBRE del plano~~ → cerrado con C1.2 (ADR 0023, 2026-07-21): arrastrar sobre celdas libres del planning abre el alta con tipo+fechas+unidad precargadas (`preferredUnitId`), y el plano ya salta al planning conservando unidad+fecha — esa fila es ahora un lienzo donde crear. (Si algún día se quiere el gesto DENTRO del `<svg>` del plano, es pulido aparte.)
- ~~[C7→C4.4] Crear bloqueos (avería, larga estancia) desde el plano~~ → **hecho 2026-07-24 (sesión 47)**: panel contextual de unidad en el plano (`UnitPanel.tsx`) — click en unidad libre → "Bloquear esta unidad" (diálogo precargado con unidad+fecha, "hasta" = una noche); click en bloqueada → motivo/rango + "Levantar el bloqueo" con confirmación (`DELETE /blocks/:id`, que existía testeado pero SIN UI que lo llamara). De paso, fix real: `BlockDialog` captaba `defaultUnitId`/`defaultDate` solo en el primer render (siempre montado) y perdía la selección en silencio — ahora resincroniza al abrir. Verificado con Playwright contra el Worker real, ciclo completo, claro y oscuro — 2026-07-21, cerrado 2026-07-24
- ~~[C1] Levantar un bloqueo desde el PLANNING (click en la barra rayada → confirmar)~~ → **hecho 2026-07-25 (sesión 48)**: la barra `lc-block` es ahora un `role="button"` con `tabIndex=0`, `aria-label` con motivo+rango+unidad y afordancia visible (cursor, realce al pasar por encima, anillo de foco del DS). Click o Enter → `AlertDialog` con el detalle del bloqueo (y el aviso de "cubre todas las unidades del tipo" si es un bloqueo de tipo) → `DELETE /blocks/:id` + toast + invalidación. El foco vuelve a la barra al cancelar (`onCloseAutoFocus`), y no vuelve si el bloqueo ha desaparecido. No hay arrastre: un bloqueo no se mueve, se levanta y se vuelve a crear. Verificado con Playwright contra el Worker real, claro y oscuro — 2026-07-24, cerrado 2026-07-25
- ~~[C7] Verificar el plano en móvil con dedo/teclado~~ → **hecho 2026-08-04
  (M5)** a 320/375/430 px, con unidades ≥44 px, pan explícito, foco y teclado.
- ~~[C7] Iconos de servicio en el plano~~ → hecho 2026-07-24 (sesión 46): los 7 `PlanoServiceIcon` mapeados a componentes lucide (`ConciergeBell`/`Waves`/`Utensils`/`ShowerHead`/`Baby`/`ShoppingCart`/`Store`) y dibujados dentro del `<svg>` del plano (svg anidado válido, hereda `currentColor` → `--muted-foreground`), icono centrado sobre la etiqueta con tamaño derivado del recinto (`clamp(min(w,h)*0.35, 12, 18)`). Verificado en navegador contra el Worker real en claro y oscuro, 0 errores de consola. Texto original: hoy se pinta la etiqueta de texto del descriptor (`PlanoServiceIcon` está tipado pero no se dibuja el glifo) — 2026-07-21
- [C4→C4.2] Export del **parte de viajeros** (Guardia Civil / Mossos): el modelo ya captura documento, nacimiento y nacionalidad por huésped, y la ficha los edita (ADR 0022). Falta el fichero con el formato legal y su envío — pieza propia con su formato, no acabado visual — 2026-07-21
- ~~[C4→C4.3] Recibo/ticket imprimible del check-out~~ → **hecho 2026-07-24 (sesión 45)**: botón "Imprimir recibo" en la ficha (`BookingPanel`, sección desglose, disponible en cualquier estado con cuenta) → `window.print()`. Recibo presentacional (`BookingReceipt.tsx`) montado por **portal a `<body>`** (hermano de `#root`), oculto en pantalla (`.lc-receipt{display:none}`) y ÚNICO contenido al imprimir (`@media print{ #root{display:none} .lc-receipt{display:block} }`), colores FIJOS negro/blanco (el modo oscuro no llega al papel). Reutiliza el desglose auditable + cobros de la ficha (misma `conceptLabel`/`eur`/`fecha`) + nombre del establecimiento (`/api/admin/settings`, caché compartida con Ajustes). Honesto: "Documento informativo del estado de cuenta. No es una factura." Verificado en navegador (bundle real + stub + Playwright `emulateMedia:print`): recibo completo y correcto, `#root` oculto / recibo en block, 0 errores (salvo el favicon del stub) — 2026-07-21, cerrado 2026-07-24
- ~~[C4] "En casa" en la **lista de reservas** (`/reservas`) y en la ficha de cliente~~ → hecho 2026-07-21 (sesión 38): el estado se **deriva** en la tabla igual que en el planning (`status==='confirmed' && checkedInAt && !checkedOutAt → 'inhouse'`, misma expresión que `Planning.tsx`). `/reservas` no necesitó API (`BookingListItem` ya traía los timestamps); el historial de la ficha de cliente sí — se añadieron `checkedInAt`/`checkedOutAt` al select de `GET /guests/:id` (aditivo, ruta existente, sin tocar el barrido de aislamiento) y al tipo `GuestBooking`, con test extendido en `admin.test.ts`
- [C1] Mover una reserva a OTRO tipo de unidad arrastrando: fuera de alcance en ADR 0023 (cambia el producto, no solo el precio; el validador/asignador están tipados por tipo). Hoy se resuelve cancelando y creando. Reabrir si un camping real lo pide — 2026-07-21
- ~~[C1] Crear BLOQUEOS arrastrando sobre celdas libres~~ → **descartado en
  ADR 0023** por ambigüedad y falta de demanda; el diálogo ya se abre desde
  planning y plano.
- ~~[C1] Resolver el planning táctil~~ → **hecho 2026-08-04 (M4)**: móvil
  usa agenda día/semana con campos y acciones ≥44 px que reutilizan requote y
  mutación; el chart de arrastre permanece en escritorio.
- [C1] Al confirmar un movimiento con cambio de precio y `paidCents > total` nuevo, la ficha enseña el pendiente negativo (reembolso manual, como el `modify` público) — considerar un aviso inline en el propio diálogo de precio — 2026-07-21
- ~~[C6] Guías de las pantallas de **gestión** (`/informes`, `/tarifas`, `/ajustes`)~~ → hecho 2026-07-22 (sesión 41): **cuarta guía "gestión"** en `camp.logic2b.com/docs/` (decisión de IA con Andreu: guía propia, no dentro de "dueño", para no mezclar páginas estratégicas con operativas). Tres páginas de prosa `es` (`content/docs/gestion/{informes,tarifas,ajustes}.es.md`) escritas contra el código real de cada pantalla (Informes: 5 tiles + ocupación por tipo; Tarifas: tabla por temporada con invariante 3 a la vista; Ajustes: datos + nivel/idiomas de solo-lectura + notificaciones). `GUIAS` pasa a `['recepcion','gestion','dueno','tecnica']` (escalera), cromo en los 6 idiomas (subtítulo "Cuatro guías…", seo y `docs.guias.gestion`), y `ayuda.ts` deja de devolver `null` → el `?` se pinta ya en las tres pantallas (el componente ya estaba puesto). Verificado: build 180 páginas, `pnpm check` 42/42, navegador (índice con 4 tarjetas, prosa renderizada, fallback visible en en). Diferido con motivo: NO se desplegó a producción esta sesión (ver SIGUIENTE-SESION)
- ~~[C6] Vídeo/GIF de los gestos del planning~~ → **hecho 2026-08-09 (sesión 104, ADR 0040)**: una captura reproducible de 22,1 s muestra mover, estirar con revisión del precio y crear arrastrando hasta el alta precargada, sin confirmar una reserva. MP4 H.264 1280×720 sin audio de 590 kB, póster WebP de 42 kB, pista descriptiva y alternativa textual dentro de `/docs/recepcion/mover/`. El generador y su QA quedan acotados a esta pieza; no nace un pipeline general. Verificado a 1366/375 y `pnpm check` 53/53. Sin desplegar — 2026-08-08, cerrado 2026-08-09
- [C6] Traducir la prosa de las guías a en/ca (hoy solo `es`, con aviso de fallback visible en pantalla). La estructura por idioma ya está montada (`{slug}.{lang}.md` + fallback **por página**): es soltar ficheros, sin tocar código. Decisión consciente del ADR 0025 §3 — 21 páginas ×3 triplica el mantenimiento de por vida con cero clientes en producción; hacerlo cuando lo pida un cliente real — 2026-07-21
- [12] **SES.Hospedajes real**: modelo, validación, XML, descarga manual y
  transporte están implementados y probados contra endpoint simulado (ADR
  0028). Falta acreditar credenciales/formato vigente y recorrer aceptación,
  rechazo, reintento y duplicado en el entorno oficial autorizado. INE no está
  implementado — 2026-07-21, actualizado 2026-08-10.
- [11] **Sentry / Logpush**: el `logEvent` de `apps/api/src/errors.ts` deja el enganche señalado en UN solo punto — el día que haya credenciales es una llamada. Cierra además el punto ciego circular que ADR 0026 §3 deja escrito: hoy el aviso de fallo viaja por correo, así que **si lo que falla es el correo no se entera nadie**. La observabilidad de verdad necesita un canal que no dependa del sistema que vigila — 2026-07-21
- [11] **Auditoría con encadenado criptográfico** (append-only + hash): hoy `audit_log` es una tabla D1 normal. La ficha técnica decía "inalterable" y **se ha corregido** para decir exactamente lo que es y lo que no (ADR 0026 §3). Construirlo solo si un cliente lo exige por política: su valor real frente a un D1 gestionado con PITR es discutible — 2026-07-21
- [11] **Pruebas de carga**: fuera de ADR 0026 a propósito. Necesitan un entorno desplegado y, sobre todo, **un objetivo declarado** ("cuántas reservas simultáneas en agosto", "cuántas recepcionistas a la vez en el planning"). Sin ese número, medir es teatro: responder la pregunta antes de escribir el primer script — 2026-07-21
- [12] **Ensayo remoto de restauración**: R11 ya restauró el SQL local en una D1
  aislada (3426 reservas, 2568 huéspedes, 3109 pagos, huella exacta e invariantes
  0/0). Sigue sin acreditarse una copia **remota** ni Time Travel; requiere
  credenciales, autorización y una base nueva. Anotar fecha/evidencia en
  `RUNBOOK-COPIAS.md` — 2026-07-21, actualizado 2026-08-10.
- [11] **Reintento de notificaciones en `failed`**: `notifications_log` marca los fallos pero nada los reintenta (ADR 0026 §3 lo deja fuera por depender del mismo canal roto). Ligado al ítem de Sentry/Logpush y al de Queues de la Fase 7 — 2026-07-21
- ~~[11] **`payments.raw` puede contener PII del proveedor**~~ → **cerrado en R4 (ADR 0042, 2026-08-10)**: la aplicación ya no lo expone ni escribe, el export lo omite y `0007_scrub_payment_raw.sql` limpia el legado. Un proveedor futuro deberá definir evidencia mínima y retención antes de guardar payloads.
- ~~[11] **`bookings.notes` puede contener datos personales**~~ → **cerrado en R4 (ADR 0042, 2026-08-10)**: la anonimización vacía las notas de todas las reservas vinculadas en el mismo batch que la ficha; prevalece la supresión verificable sobre conservar texto libre ambiguo.
- ~~[infra] **`pnpm db:seed:remote`**~~ → **hecho 2026-07-24 (sesión 45)**: comando que encapsula el reseed remoto FK-safe en un solo paso. Regenera `seed.sql` → vacía las 21 tablas **hijo→padre** con `--command` una a una (D1 remota **sí** fuerza FKs; el `--file` masivo hace `fetch failed`) preservando `d1_migrations` → siembra con `--file seed.sql` (INSERT-only). El orden de borrado reusa `DELETE_ORDER` de `tenants/demo/reset.ts` (fuente única, no duplica); la lógica del plan es pura y testeada (`remote-seed.test.ts`, 6 tests). **Doble candado** calcado de `runInfraPlan`: por defecto dry-run que imprime el plan; ejecuta solo con `--apply` **y** `LOGIC_CAMP_ALLOW_REMOTE_SEED=1` (+ credenciales de Cloudflare). El `--apply` real NUNCA se ha ejecutado desde el contenedor cloud (no hay credenciales) — igual que `new:camping --apply`. Contexto original abajo. — 2026-07-24
  - _(por qué existía)_: la demo NO re-siembra la D1 remota sola — el "reset nocturno" de las notas no existe en el código; el deploy lleva schema, no datos. En la sesión 44, tras desplegar el parte de viajeros, la pantalla salió "no activado" porque `modules.hospedajes` vivía solo en el seed y la remota tenía datos viejos, y hubo que re-sembrar a mano.
- ~~[10] **El seed crea un huésped nuevo por reserva**~~ → **hecho 2026-07-25 (sesión 54)**: censo de habituales (1 de cada 4 fichas nuevas, con su número de estancias sorteado sobre `REPEAT_SHAPE`) + 1 de cada 3 reservas reutilizando una ficha que quepa — **1 521 fichas: 1 168 con una estancia, 223 con dos, 102 con tres, 28 con cuatro**. Tope por ficha (si no, las ~670 reutilizaciones se acumulan en la cabeza del censo) y **holgura de 7 días** entre estancias de la misma ficha: dos estancias que no se solapan pero se tocan se leen como un fallo de datos. La decisión de reutilizar **no consume del PRNG** (sale de `bkgN`), así que el relleno por curva de temporada queda byte a byte igual y los invariantes ni se mueven. El correo compartido se arregló del todo, pero **no por tener menos fichas**: ver la entrada de abajo.
- ~~[10] Correos y nombres repetidos entre fichas~~ → **hecho 2026-07-25 (sesión 54)**, y la lección va más allá del seed: ampliar los repertorios **no arregla** un acoplamiento, solo lo diluye. Los apellidos pasan de 40 a **161** (con 40 tocaban a 38 fichas cada uno y, como `/clientes` se ordena por apellido, **la primera página salía entera "Andersen"** — el defecto de la sesión 53 corrido una columna), pero lo que lo cierra es cambiar de mecanismo: en vez de dos módulos sobre el mismo contador, se **numeran las 40 × 161 = 6 440 parejas y se recorren a saltos de 2 371** (primo → coprimo con 6 440), que pasa por todas antes de repetir ninguna. Con ~1 500 fichas eso es **garantía, no estadística**: no puede haber dos clientes que se llamen igual ni dos con el mismo correo. Test en absoluto (`Set.size === length`), no con umbral.
- ~~[10] El sexo del huésped no concordaba con su nombre~~ → **hecho 2026-07-25 (sesión 54)**: salía de `bkgN % 2`, el mismo contador del que salía el nombre, así que "María" iba marcada **M** en todas sus fichas. En la lista es feo; en el **parte de viajeros, que es un documento con valor legal, es un dato falso**. Ahora sale del nombre (`nombresFemeninos`) — 2026-07-25
- [10] **El nombre del huésped no guarda relación con su nacionalidad**: hay "María Bakker · NL" y "María Berg · DE" porque el nombre se sortea sobre el repertorio entero y la nacionalidad sale del `locale` de la reserva. En Europa pasa, y en un camping de costa más, así que no es falso — pero el patrón se nota al barrer el parte de viajeros. Agrupar repertorios por locale obligaría a rehacer el recorrido de parejas (hoy es una biyección sobre el espacio completo, que es justo lo que garantiza que no haya dos clientes iguales): no compensa hasta que alguien lo eche en falta — 2026-07-25
- ~~[4.x/web] El mostrador dentro de la página de alojamiento~~ → **hecho 2026-07-31 (sesión 64)**: la ficha monta el mostrador precargado con SU tipo (prop `soloTipo` en `Mostrador.tsx`, misma isla, mismo `GET /api/availability` — sin endpoint nuevo) y el botón entra al funnel con tipo y fechas puestos. Lo que no estaba en el encargo y resultó ser la mitad del valor: **qué se dice cuando ese tipo NO entra** — como la respuesta ya trae el camping entero, se ofrece la salida al mostrador general **conservando fechas y grupo**, en vez de dejar la ficha en un callejón. A ancho completo FUERA de la rejilla: dentro de la columna de `1fr` su ancho mínimo intrínseco se comía el `1.5fr` de la galería. Dos E2E nuevos + etiquetas en los seis idiomas. Texto original abajo.
- _(texto original de la línea de arriba)_ [4.x/web] **El mostrador dentro de la página de alojamiento** (observación de Andreu, 2026-07-28, verificada contra el código): en el detalle de un alojamiento NO se puede consultar la disponibilidad de ese alojamiento — el CTA de nivel 3 (`AlojamientoDetalle.astro:57`, `mode === 'instant'`) apunta a `${localePath(locale)}#mostrador`, o sea **de vuelta a la home**, y además **sin precargar el tipo** que el visitante estaba mirando; `Mostrador.tsx` no se monta nunca en el detalle. Es el punto exacto donde se pierden reservas: el visitante ya decidió QUÉ quiere y le mandamos a repetir la selección. Arreglo: montar el mostrador (o variante compacta) en el detalle precargado con ese `unit_type`, o como mínimo que el CTA arrastre el tipo en la URL (el funnel ya lee parámetros desde Fase 5). La degradación por nivel actual (1/2 → `/contacto`) está bien y se conserva. **Candidato cercano de sesión** — es deuda de la demo actual, no del Frente D — 2026-07-28
- ~~[D0-V] **Contrato visual de la primera ola**~~ → **hecho 2026-08-06
  (sesión 81)**: L'Olivar / Inicio, Pinada del Mar / Gestión y Mar de Fondo /
  Visión quedan fijados con ICP, promesa, guiones 5/8/12 min, pantallas,
  dirección de arte, activos, soporte demo y fichas de activación. La auditoría
  reutiliza estructura, fuentes y capturas del producto, pero veta cruzar fotos
  de Cala o activos de Azahar. Contrato ejecutable:
  `docs/CONTRATO-VISUAL-OLA-1.md`.
- ~~[D1-V] **Primera demo Inicio — L'Olivar**~~ → **hecho 2026-08-06
  (sesión 82)**: 22 unidades/dos tipos, ocho fotos coherentes y derivados de
  marca, contenido completo, transporte demo sin red/PII con éxito/error/spam,
  build `tier: 1` en `/demos/olivar/`, `noindex`, bundle compuesto y tres
  capturas. QA 375/1366, 10.302 enlaces y `pnpm check` 48/48.
- ~~[D2-V] **Demo Gestión**: web → solicitud → gestor/planning/plano con datos
  sembrados creíbles.~~ → **cerrado 2026-08-06 (sesión 85)**: al recorrido de la
  sesión 84 se suman 11 fotografías generadas con el modelo integrado de Codex,
  sin Higgsfield ni URLs externas, y los cuatro derivados de marca. El manifiesto
  y `fetch-fotos.mjs` reconocen los activos finales locales (11/11).
- [infra] **El contenedor cloud sale por lista blanca** (npm, GitHub, Anthropic,
  MCP): cualquier otro host recibe **403 en el CONNECT**, `example.com` incluido.
  Diagnóstico corregido en la sesión 84 — no es "cloudfront bloqueado", que es
  como estaba anotado desde la sesión 8 y por eso se volvía a investigar cada
  vez. Consecuencia práctica: **generar imágenes sí se puede** (entra por MCP),
  **bajarlas no**. Se arregla pidiendo al administrador que añada el host a la
  lista, o corriendo el script de descarga fuera del contenedor — 2026-08-06
- ~~[pinadamar] **Favicon, apple-touch-icon, OG y miniatura de Pinada del Mar**~~
  → **hecho 2026-08-06 (sesión 85)** junto a la sesión fotográfica completa.
- ~~[D3-V] **Demo Visión — Mar de Fondo**~~ → **cerrado 2026-08-07 (sesión 98)**: recorrido completo disponibilidad → recibo → gestor → planning/ficha/
  plano → llegada/cobro, con 300 unidades, 240 reservas, `MF-DEMO-001`, reset y
  cero red. Automatiza e Inteligente son prototipos supervisados, explicables y
  no ejecutan acciones externas. El manifiesto fotográfico queda **14/14**:
  siete tandas aprobadas, staging vacío, historial de proveedores/rechazos y
  huellas de prompt conservado. Las seis últimas piezas se generaron con el
  integrado de OpenAI de una en una, con inspección y pausas de 20 segundos,
  sin fallback ni CLI/API con clave. Capturas firma y derivados sociales siguen
  siendo reproducibles; build específico **25 páginas / 112 derivados**.
- ~~[D4-V] **Escaparate de las tres**~~ → **cerrado 2026-08-08 (sesiones
  97/99/100/101)**: galería y
  comparador bilingües ya viven en la landing con las tres miniaturas aprobadas,
  escala, recorrido y enlaces al momento firma. La ficha comercial ES/EN se
  genera desde la misma fuente, pesa 307 kB y se descarga desde la sección. La
  campaña de Mar de Fondo añade búsqueda, display y feed clicables con UTM
  ficticias y alcance demo explícito. Una captura guiada reproducible de 38,9 s
  cierra campaña → disponibilidad → operación, con controles, subtítulos y
  transcripción ES/EN. Ampliar a 6 y 12 solo con aprendizaje.
- ~~[D4-V/temas] **Fotografía propia para los conceptos Montaña, Familiar y
  Parcela**~~ → **hecho 2026-08-08 (sesión 102)**: tres piezas originales del
  integrado de Codex, en tandas 2+1, sustituyen los préstamos de la propuesta
  Azahar. WebP 1440×960 locales, prompts/proveedor/huellas trazados y QA ES/EN
  1366/375 verde. Son conceptos visuales, no nuevas demos ni marcas; D5-V sigue
  detrás de aprendizaje comercial.
- ~~[D4-V/ficha] **Ficha comercial descargable de la primera ola**~~ → **hecho
  2026-08-08 (sesión 99)**: dos PDF A4 de tres páginas generados desde el
  portfolio i18n, con las tres miniaturas, capturas aprobadas, comparación por
  resultados, enlaces y QR. Reproducible con ReportLab, 307 kB por idioma y
  enlazado sin JavaScript desde la landing.
- ~~[D-PRECIO] Primera tarifa pública 69/119/249 €~~ → **sustituida
  2026-08-05 por E1**: `/precios/` publica la escalera 49/149/249/399 € y
  `docs/TARIFAS-LOGIC2B.md` pasa a v2. Se mantiene la revisión de margen después
  de los tres primeros clientes, midiendo horas por bloque.
- ~~[D4-V/landing] **Sensación de escalabilidad**~~ → **hecho 2026-08-07
  (sesión 97)**: galería de tres y comparador por resultados, con entrada a cada
  web y a su momento firma; la franja de cifras temprana ya existía.
- ~~[D4-V/campaña] **Creatividades de muestra Google/Meta/búsqueda**~~ → **hecho
  2026-08-08 (sesión 100)**: búsqueda, display 300×250 y feed 1080×1080 en
  HTML/CSS estático, sin logos de plataforma, cuentas, píxeles o métricas
  inventadas. Reutilizan fotografía aprobada, se rotulan como ejemplo y enlazan
  al mostrador de Mar de Fondo con UTM ficticias distintas.
- ~~[D4-V/vídeo] **Captura guiada del recorrido de la primera ola**~~ → **hecho
  2026-08-08 (sesión 101)**: MP4 H.264 de 38,9 s, 1280×720 y 1,0 MB, generado
  con Playwright/Chromium sobre el bundle compuesto y normalizado con ffmpeg.
  Comparte metraje en ES/EN, con póster aprobado, controles, carga bajo demanda,
  subtítulos y transcripción. `qa:video` verifica ambos idiomas a 1366/375.
- ~~[marca] `docs/brand/`/BRAND seguía describiendo el isotipo como logo del
  producto~~ → **hecho 2026-08-10 (sesión 105/R1)**: wordmark para producto;
  isotipo solo para favicon y crédito del tenant.
- ~~[seo] **`BreadcrumbList` en las guías**~~ → **hecho 2026-08-10
  (sesión 111/R7)**: `Docs.astro` emite una lista de dos o tres niveles en la
  ranura real de `<head>` de `Base`; raíz, guía y página usan URL absoluta y
  canonical localizado. El build analiza las 60 rutas de guía ES/EN y fija
  tipo, posiciones, nombres, URL final y ausencia de una copia en `<body>`.
- ~~[B] Nadie comprueba los enlaces ENTRE las tres superficies del bundle compuesto~~ → **hecho 2026-08-04 (sesión 70)**: `apps/api/scripts/check-demo-links.mjs` recorre los `<a href>` internos del `dist` compuesto y comprueba que resuelven dentro de él (incluye `/demo/`, `/admin/`, rutas sin barra que Workers Assets redirige y URLs absolutas del mismo origen). Corre tras copiar los tres builds y **antes** de migrar o desplegar en `deploy:demo`; informa cada HTML origen y ruta rota. El `404.html` se excluye correctamente: es el documento fallback de Astro, no una ruta publicada. Tres tests nativos fijan el contrato; el primer barrido real dio **9.286 enlaces / 304 HTML, OK**.
- ~~[web] **El héroe de nivel 1 de la home queda invisible en un build de nivel 1 REAL**~~ → **hecho 2026-08-03 (sesión 67)**: `Home.astro` solo emite `data-hero-nivel="1"` cuando está activo el conmutador de la demo; el build real de nivel 1 mantiene visible el héroe. Verificado con `TIER=1`.
- ~~[web] **La regla dura de niveles está incumplida hoy: un build de nivel 1 SÍ arrastra el motor en el bundle**~~ → **hecho 2026-08-03 (sesión 67)**: aliases de build y `getStaticPaths()` aíslan el motor y sus rutas en niveles 1–2. Verificado con `TIER=1` (126 páginas, cero rutas/chunks del motor) y `TIER=3` (motor conservado).
- ~~[dashboard] **La portada del gestor no tiene página de guía**~~ → **hecho
  2026-08-10 (sesión 108/R6)**: `BotonAyuda` enlaza
  `recepcion/inicio`, «Orientarte desde la portada», con las cuatro cifras,
  listas diarias, catálogo por rol y punto de entrada de cada tarea. La entrada
  histórica seguía abierta aunque implementación, E2E y PROGRESS ya la daban
  por cerrada.
- ~~[dashboard] La portada enseñaba módulos inalcanzables por rol~~ → **hecho
  2026-08-04 (M1)**: portada y sidebar usan `navGroupsForRole()` sobre
  `NAV_GROUPS`; el test fija que «Parte» solo aparece para manager/owner.

## Frente E — Escalera comercial y producto IA

> Aprobado por Andreu el 2026-08-05. Fuente de verdad:
> `docs/FRENTE-E-ESCALERA-COMERCIAL.md`; ADR 0033 aceptado. E1/E2 cerrados.

- ~~[E0] Validar las cinco preguntas del ADR 0033~~ → **hecho 2026-08-05**:
  Logic Camp Inicio, 12 meses o 490 €/año, un idioma/un destinatario, endpoint
  compartido sin persistencia y 149/249/399 como lanzamiento; ADR aceptado.
- ~~[E1] Remodelar `/precios/` a cuatro niveles~~ → **hecho 2026-08-05**:
  resultados, precio/alta, condiciones de Inicio, costes de terceros y estados
  comerciales honestos en `es/en`; SEO, FAQ y guía del dueño alineados.
- ~~[E2] Sustituir `#niveles` por Inicio → Gestión → Automatiza → Inteligente~~
  → **hecho 2026-08-05**: selector por problema, escalera 00–03 y CTA propio;
  héroe orientado a la progresión. Verificado a 1366/375 px, sin desborde.
- ~~[E3-V/E4-V] **Inicio como demo y campaña**~~: queda absorbido por D1-V. El
  formulario usa un adaptador demo y muestra éxito/error/antispam; receptor,
  privacidad operativa y onboarding reales van al dossier de activación.
- ~~[E5-V] **Automatiza representado**~~ → **hecho 2026-08-07 (sesión 91)**:
  respuesta a reseña y parte de incidencias comparten una ruta navegable con
  fuentes, límites, edición, descarte, preparación humana y reset. Ninguna tarea
  contiene estados ni acciones de envío, publicación o ticket. Se descartan
  variantes de plantilla/traducción sin historia comercial concreta para no
  multiplicar pantallas de relleno.
- ~~[E6-V] **Inteligente representado**~~ → **hecho 2026-08-07 (sesión 90)**:
  recomendación de ocupación sobre datos demo con fuentes, periodo, rango,
  confianza y límites visibles; la confirmación solo prepara, nunca ejecuta.

## Producción diferida — activar con cliente contratado

> Estos ítems se documentan y estiman; no compiten con D0-V–D4-V. Se convierten
> en ejecución solo si entran en el alcance firmado de un cliente.

- [CLIENTE-REAL] Receptor de formularios, antispam, consentimiento, entrega y
  onboarding real del plan Inicio.
- [CLIENTE-REAL] Aprovisionamiento de tenant/D1/dominio/secrets, CLI o runbook
  equivalente y ensayo de alta/baja.
- [CLIENTE-REAL] Resend/SMS/WhatsApp, Stripe/Redsys y webhooks operados con
  credenciales del proveedor.
- [CLIENTE-REAL] Facturación/VeriFactu, SES.Hospedajes/INE y pre-check-in
  validados contra el entorno oficial aplicable.
- [CLIENTE-REAL] Channel manager/OTA elegido por demanda real; idempotencia,
  conflictos y reconciliación.
- [CLIENTE-REAL] Migración, backups/restauración, observabilidad, soporte,
  analytics/consentimiento y seguridad operativa.
- [CLIENTE-REAL] IA/forecast/copiloto: proveedor, costes, permisos, evaluación,
  límites, auditoría y supervisión humana.

## Frente M — Dashboard móvil

> Prioridad de producto declarada por Andreu (2026-08-03). No se pretende meter
> el planning de 90 días entero en 375 px: móvil sirve para consultar y resolver
> urgencias; escritorio sigue siendo la herramienta principal de recepción.

- ~~[M0] **Auditoría móvil por tarea y rol** a 320/375/430 px~~ → **hecho
  2026-08-04 (sesión 71)**: contrato en ADR 0031 e informe reproducible en
  `docs/AUDITORIA-MOVIL.md`. Cero desborde global en las cinco pantallas base,
  pero seis P1 de interacción: búsqueda sin entrada táctil, ficha de 360 px que
  desborda 40 px a 320, check-in/out de 36×28, plano con unidades de 10–17 px,
  tape chart sin alternativa táctil y “Parte de viajeros” ofrecida a roles que
  no pueden usarla. Orden medido: M1 → M2 → M3 → M5 → M4 → M6.
- ~~[M1] **Ficha de reserva como `Sheet` a pantalla completa bajo `md`**~~ →
  **hecho 2026-08-04 (sesión 72)**: bajo 768 px solo se monta una hoja Radix de
  ancho completo; escritorio conserva el panel lateral no modal. Cabecera fija,
  cierre y acciones ≥44 px, campos ≥16 px, safe area, trampa de foco, Escape y
  retorno al elemento de origen. Regresión real con D1 a 320/375/430: 3/3, sin
  desborde. `NAV_GROUPS` declara además `manager` para `/parte`; sidebar y
  portada filtran la misma fuente, mientras el servidor conserva su 403.
- ~~[M2] **Portada y shell móvil orientados a hoy**~~ → **hecho 2026-08-04
  (sesión 73)**: bajo `md`, cifras → tres listas → módulos; desde `md` se
  conserva el orden de escritorio. Botón Buscar 44×44 conectado a la misma
  paleta que `⌘/Ctrl+K`, con foco inicial y retorno al origen. El menú usa
  `SheetTrigger`, abre enfocado en Inicio, vuelve a la hamburguesa con Escape y
  sus rutas/tema/salir/cierre alcanzan 44 px. Regresión real a 320/375/430 y
  control de escritorio.
- ~~[M3] **Llegadas, salidas y solicitudes operables con una mano**~~ → **hecho
  2026-08-04 (sesión 74)**: fecha, navegación, filtros, filas, contactos y
  acciones alcanzan 44 px bajo `md`; escritorio conserva 28–32 px. Check-in/out
  mantiene huésped, estado y saldo visibles a 320 px. El check-out directo pide
  confirmación, avisa del saldo y devuelve el foco; los seis filtros permanecen
  en una línea con scroll local. Regresión real a 320/375/430 y control de
  escritorio, ejecutada junto a M1–M2: 5/5.
- ~~[M4] **Planning móvil como agenda**~~ → **hecho 2026-08-04 (sesión 76)**:
  bajo `md` monta agenda de día/semana, no el chart comprimido. Reserva y unidad
  son acciones independientes ≥44 px; ficha y plano conservan contexto y foco.
  Entrada, salida y unidad se cambian con campos ≥44 px/16 px que reutilizan la
  recotización y mutación del tape chart, por lo que precio, solape y
  disponibilidad siguen en servidor. Filtros con scroll local, cero desborde a
  320/375/430; desde `md` se monta solo el chart original con gestos y densidad.
- ~~[M5] **Plano táctil**~~ → **hecho 2026-08-04 (sesión 75)**: bajo `md` entra
  ampliado 8× y centrado, con unidades ≥44 px a 320/375/430; seleccionar
  recentra y ajustar recupera el recinto. Controles/fecha ≥44 y input 16 px.
  `pan-y` deja libre el scroll hasta activar «Mover plano»; unidades sin reserva
  abren un `Sheet` inferior, las ocupadas conservan la ficha completa y ambas
  devuelven el foco. Roles/nombres accesibles, Enter/Espacio/flechas/Escape y
  escritorio fijados en Playwright. Corregida además la apertura de `inhouse`.
- ~~[M6] **Rendimiento móvil del dashboard**~~ → **hecho 2026-08-04 (sesión 77)**: las 14 pantallas son entradas dinámicas de TanStack Router con
  precarga por intención y estado de carga accesible. La entrada baja de
  785,80/234,75 kB a **533,71/170,04 kB min/gzip**; Planning queda en 17,26 kB
  gzip y Plano en 8,47 kB, ambos bajo demanda y cacheados tras abrirlos. El
  build genera manifiesto y falla si la entrada vuelve a ≥200 kB gzip o si
  cualquiera de esas dos pantallas deja de ser dinámica. Fontsource pasa de 15
  ficheros emitidos a cuatro WOFF2 latinos. Playwright prueba la red real:
  portada sin Planning/Plano, descarga al entrar y cero segunda descarga al
  volver.
