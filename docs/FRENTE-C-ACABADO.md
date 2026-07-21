# FRENTE C — Acabado profesional (modo fake, prioridad visual)

> **Abierto 2026-07-20.** Contrato de trabajo del acabado visual y de flujo. El Frente A construyó **el producto**; el Frente B le puso **la marca**. El Frente C es lo que separa "funciona y está bien construido" de **"esto lo compro"**.
>
> **Premisa de este frente** (dicha por Andreu, 2026-07-20): *ahora mismo tiene prioridad la parte visual en modo fake. Tiene que estar todo previsto y pensado, pero lo importante es que el cliente vea la interfaz bien pensada y que sea profesional.*
>
> **Qué significa "modo fake" aquí — y qué NO significa.** Significa que un flujo puede estar *representado* antes de estar *conectado*: una pantalla de check-in puede existir y ser navegable aunque el estado no persista todavía. **No** significa maquetas muertas ni datos inventados en el cliente. La regla dura del proyecto sigue en pie: **cero mocks en el cliente**. Hoy el dashboard tiene 0 mocks y toda pantalla habla con la API real (verificado en auditoría) — eso es un activo y no se tira. Lo "fake" se resuelve **en el seed y en la capa de estado**, nunca en el componente.
>
> **ADR antes de código.** Cada fase C abre con su ADR y PARA a esperar validación, como el resto del proyecto.

---

## 0. Estado real medido (2026-07-20)

No opiniones: auditoría de los dos frentes visuales + verificación en vivo contra el Worker local.

### Lo que está mejor de lo que parecía

| | |
|---|---|
| **Web pública** | 216 páginas generadas, 6 idiomas con **267 claves y 0 faltantes**, funnel completo y cerrado (mostrador → detalle → titular con hold de 15 min → confirmación → gestión por código+email), estados de UI reales (loading/error/agotado/**cerrado con la fecha real de apertura**), Lighthouse ≥95 verificado en local |
| **Dashboard** | **11 pantallas, ninguna vacía ni esqueleto.** Planning virtualizado con drag&drop de reasignación, mutación optimista con rollback, navegación por teclado ↑/↓ real |
| **Datos** | **Cero mocks.** 0 `faker`, 0 fixtures, 0 `msw`. Todo contra `/api/admin/*` real |
| **Marca** | B1 hecho: sidebar agrupada, isotipo, Inter+Space Grotesk, radius 10px, ~17 tokens oklch que **coinciden exactamente** con `BRAND.md` §4 |

Lo construido es honesto. El problema no es que falte producto: es que **el producto no se está luciendo**.

### Los siete agujeros que impiden que parezca profesional

Ordenados por daño visual en una demo, no por dificultad.

**1. El planning está vacío. Es el problema número uno.**
Verificado en vivo: *83 unidades · 29 reservas a la vista*. De `A-09` hacia abajo, **nada** — 92 días de rejilla en blanco, en pleno agosto. El ROADMAP ya lo pedía ("debe verse ESPECTACULAR: 83 unidades × agosto lleno") y nunca se hizo. Un director de camping mira eso y ve un negocio sin clientes. **El elemento firma del producto está enseñando el peor dato posible.**

**2. El design system existe y no se usa.**
`packages/ui` = 101 líneas, 4 componentes (`Button`, `Badge`, `Card`, `LogoMark`). En todo `apps/dashboard`: **0 usos de `<Button>`, `<Card>` o `<Badge>`**, y **41 `<button>` crudos** con las mismas clases Tailwind copiadas a mano. El único import del DS es `cn` y `LogoMark` en `main.tsx:8`.
Bloqueo de fondo: `packages/ui/package.json` **no tiene ninguna dependencia de Radix**, ni `sonner`, ni `cmdk`. Dialog, sheet, popover, toast y ⌘K no son "copiar un fichero": falta la capa de primitivas entera.

**3. Los estados son texto plano.**
12 pantallas con `<p>Cargando…</p>`. **0 skeletons, 0 spinners, 0 error boundaries** (un throw en render = pantalla en blanco), **0 toasts**. El sustituto es un `useState<{text,error}>` local repetido en **6 ficheros**, pintado como un `<p>` que no desaparece solo. Esto es exactamente lo que separa "funciona" de "impresiona", y afecta a las 11 pantallas a la vez.

**4. El planning solo arrastra en vertical.**
Se reasigna de unidad, sí. Pero **no se pueden mover ni estirar fechas arrastrando** — el gesto que cualquiera que haya usado un tape chart busca en los primeros 10 segundos. Tampoco se crea reserva arrastrando sobre una celda vacía, ni se arrastra desde la bandeja "sin asignar". Sin línea de "hoy". El feedback de reasignación es un `<p>`, y no hay deshacer.

**5. No existe el check-in.**
Ni en cliente ni en servidor: `TRANSITIONS` (`apps/api/src/routes/admin.ts:36-40`) solo tiene `confirm`, `cancel`, `no_show`, `complete`. **No hay concepto de "huésped presente".** Una recepcionista no puede marcar que alguien ha llegado. Es un hueco de *dominio*, no de UI, y es el acto central de una recepción.
Hermano del mismo agujero: la ficha **muestra** `guests[]` pero **no se pueden añadir ni editar huéspedes ni sus documentos**. Sin eso no hay parte de viajeros — requisito legal en un camping español.

**6. La primera pantalla del producto es un formulario flotando en blanco.**
Verificado: el login es un `<h1>` + 2 inputs + botón, centrados sobre blanco puro. Sin isotipo, sin nombre del camping, sin una sola señal de marca. Es literalmente lo primero que ve un cliente del gestor.

**7. Faltan fotos y hay tokens mal.**
`src/lib/fotos.ts:12,13,21-24` referencia **4 ficheros que no existen** (`tipo-premium`, `tipo-autocaravana`, `detalle-bungalow-interior`, `detalle-glamping-interior`). Resultado: **6 fotos reales para 9 tipos de alojamiento**; `ut_prem` y `ut_moto` enseñan la foto de parcela, y la "galería" del detalle es de **una sola imagen** en bungalow/mobil/glamping.

### Dos bugs concretos, baratos, con efecto visible

- **`packages/ui/src/theme.css:33-37`** — los `--chart-*` de `:root` (light) contienen los **valores dark** de `BRAND.md` §4. Los 5 están desplazados. `--chart-4` pinta el estado *pending* de las barras del planning: **las reservas pendientes se están pintando con un token equivocado.** Además falta `--radius-2xl` (BRAND §5 lo pide).
- **`apps/dashboard/src/styles.css:18`** — `--color-mar: var(--foreground)`. El color de error/aviso es literalmente el color de texto normal, así que **`text-mar` en los mensajes de error se pinta en negro** y no se distingue (ver `Planning.tsx:357`, `BookingPanel.tsx:161`).

### Un bloqueo de entorno que hay que resolver antes de trabajar

`pnpm dev` del dashboard (`:5173`) **no permite iniciar sesión**: `POST /api/auth/sign-in/email` → **403**. No son las credenciales — la misma petición contra `:8787` devuelve 200 + cookie. Es Better Auth rechazando el origen cruzado: `apps/api/src/auth.ts` no declara `trustedOrigins`, y el proxy de Vite manda `Origin: localhost:5173`.
En producción no se nota (el dashboard vive en `/admin/` del **mismo** Worker, mismo origen). Pero significa que **hoy el dashboard se desarrolla sin HMR**, compilando y sirviendo desde el Worker. Para una noche de trabajo de diseño, eso es la diferencia entre iterar en 1 segundo o en 40.

---

## 1. Las fases del Frente C

| Fase | Nombre | Objetivo | Hecho cuando |
|---|---|---|---|
| **C0** | Desbloqueo | HMR del dashboard + seed denso. Sin esto, todo lo demás se hace a ciegas y sobre un lienzo vacío. | `pnpm dev` permite login en `:5173`; el planning de agosto se ve lleno |
| ~~**C1**~~ ✅ | El planning como pieza de exhibición | El elemento firma, a la altura de su declaración. Gesto horizontal, línea de hoy, crear arrastrando, deshacer. | **HECHO (ADR 0023)** — mover/estirar con re-cotización en servidor y candado de precio, crear arrastrando, bandeja arrastrable, hoy/continuación/temporada/filtros, mapa de color definitivo con test AA + modo oscuro, finde en un gradiente |
| **C2** | DS completo y conectado | Radix + los primitivos que faltan; los 41 botones crudos pasan a `<Button>`. | 0 `<button>` crudos en el dashboard; `dialog/sheet/toast/command/skeleton/table` existen y se usan |
| **C3** | Estados y microinteracción | Skeletons, error boundaries, toasts con deshacer. Las 11 pantallas a la vez. | Ninguna pantalla enseña `<p>Cargando…</p>`; ningún error deja pantalla blanca |
| ~~**C4**~~ ✅ | Workflow real de recepción | Check-in, huéspedes y documentos, alta desde el planning, ⌘K. | **HECHO (ADR 0022)** — check-in como `checked_in_at` (no estado), huéspedes editables, cobrar todo, bloqueos desde la UI, ⌘K, rutas `/reservas/$id` `/clientes/$id` |
| **C5** | Materia: fotos e imagen | Cerrar el hueco de fotos con Higgsfield; densidad real por tipo. | 9 tipos con foto propia; ninguna galería de 1 sola imagen |
| **C6** | Documentación (absorbe B4) | Guía de recepcionista, guía de dueño, ficha técnica. Con esencia Logic2B. | Un cliente resuelve una duda de uso sin escribir a soporte |
| **C7** | **Plano del camping** | Vista cenital de parcelas y alojamientos con estado en vivo. Base ya resuelta en `gestor-reservas`. | Se ve el camping de verdad y se salta plano ↔ planning ↔ ficha |

---

## C0 · Desbloqueo — *primero, y es rápido*

Sin esto se trabaja a ciegas. Son las dos cosas que multiplican la velocidad del resto de la noche.

### C0.1 — HMR del dashboard

- [ ] `apps/api/src/auth.ts`: declarar `trustedOrigins` **estrictamente en dev**. Criterio de "dev" explícito (una var en `wrangler.jsonc` de desarrollo o la ausencia de `AUTH_SECRET` real), **nunca** un comodín. Escribir el porqué en el propio fichero: en producción es mismo-origen y esta lista debe quedar vacía.
- [ ] Documentar el flujo de dev del dashboard en `apps/dashboard/README.md` — hoy **no está escrito en ninguna parte**, que es justo por lo que nadie se topó con el 403 antes.
- [ ] Verificar: login en `:5173`, HMR vivo, y que el mismo login sigue funcionando en `:8787`.

### C0.2 — Seed denso: que el planning tenga algo que enseñar

**Este es el punto de mayor retorno visual de todo el documento.** Es "modo fake" en su forma legítima: datos ricos en el seed, no mocks en el cliente.

Hoy: 40 reservas / 83 unidades. Objetivo: **una temporada que respira**, con la textura de un camping real.

- [ ] **Ocupación por curva de temporada, no plana.** Agosto al ~90-95%, julio ~75%, junio/septiembre ~45%, mayo/octubre ~20%. Que el zoom "Temporada" **muestre la forma de la temporada** — eso solo ya es un argumento de venta visual.
- [ ] **Fines de semana más llenos que entresemana** en temporada media. Es lo que hace que un profesional reconozca sus propios datos.
- [ ] **Huecos con carácter**: noches sueltas entre reservas (el hueco de 1 noche que todo camping odia), un par de unidades fuera de servicio por avería (`blocks`, que el planning ya sabe pintar y hoy casi no se ven).
- [ ] **Mezcla de estados realista**: confirmadas mayoría, un puñado de pendientes de pago, 1-2 no-shows, alguna cancelada reciente. Que los colores del planning **tengan de verdad algo que diferenciar**.
- [ ] **Estancias de duración variada**: la de 14 noches de la familia holandesa de agosto, el fin de semana de 2, el mes entero del residente de temporada.
- [ ] **Nombres y procedencias plausibles y variadas** (ES, FR, DE, NL, GB) — refuerza el multi-idioma sin decir una palabra.
- [ ] Mantener **determinista** (el seed lo es hoy, y el reset nocturno de la demo depende de ello) y mantener **verdes los tests de invariantes** del seed.

> Criterio de aceptación, literal: abrir `/admin/` en zoom "Temporada" y que la pantalla se vea **densa, con ritmo y con color**. Si sigue habiendo tramos de 10 filas en blanco, no está hecho.

---

## C1 · El planning como pieza de exhibición — ✅ HECHO (ADR 0023, 2026-07-21)

> **Cerrado entero en ADR 0023**, incluido C1.5 (mapa de color definitivo → modo oscuro). El gesto horizontal existe: mover arrastrando (y en diagonal: fecha+unidad en una acción), estirar por los bordes, con tooltip en vivo, **re-cotización SIEMPRE en servidor** (`requote` dry-run + `move` con candado `expectedTotalCents`), desglose nuevo en diálogo antes de confirmar si el importe cambia, rechazo explicado si solapa, Deshacer en todo, y paridad de teclado (←/→, Shift+←/→). Crear arrastrando sobre celdas libres (alta precargada con `preferredUnitId`) y chips de la bandeja arrastrables. Línea de HOY, continuación en barras cortadas, franja de temporada, filtros y búsqueda dentro del planning. El mapa `--lc-status-*` es **definitivo con test de contraste** (27 aserciones light+dark en `packages/ui`; cazó que el ámbar provisional se quedaba en **1.7:1** sobre blanco) y el **modo oscuro está conectado** (toggle claro/oscuro/sistema + script anti-FOUC). El finde pasó de un `<div>` por celda×fila a **un gradiente por lienzo** — la virtualización horizontal se descarta con medida. Verificado en vivo: **22/22 gestos** con Playwright contra el bundle real. **Diferido** (BACKLOG): mover a otro tipo, crear bloqueos arrastrando, gesto táctil móvil.

Estaba declarado como **el elemento firma**. Era sólido de ingeniería (virtualización, DnD vertical, optimista con rollback, teclado) y **pobre de gesto**.

### C1.1 — El gesto que falta: horizontal

- [ ] **Mover la estancia arrastrando en horizontal** (cambia `dateFrom`/`dateTo` manteniendo noches).
- [ ] **Estirar por los bordes** para alargar/acortar (resize handles). Es *el* gesto de un tape chart.
- [ ] **Re-cotización al soltar**: el precio lo calcula **siempre el servidor** (regla dura del proyecto). Enseñar el nuevo desglose antes de confirmar si el importe cambia.
- [ ] Feedback en vivo durante el arrastre: fechas y nº de noches flotando junto al cursor.
- [ ] Rechazo visible y explicado si el destino solapa — no un silencio.

### C1.2 — Crear donde ocurre la venta

- [ ] **Arrastrar sobre celdas vacías → nueva reserva** con esas fechas y esa unidad precargadas. Hoy el alta manual vive solo en `/reservas`, que **no es donde estás cuando entra alguien sin reserva**.
- [ ] **Arrastrar desde la bandeja "sin asignar"** a una fila. Hoy esas reservas solo se clican.

### C1.3 — Orientación

- [ ] **Línea vertical de "hoy"** sobre la malla. Hoy no existe: la fecha está en un input pero no en el lienzo.
- [ ] Indicador de continuación cuando una barra se sale por el borde (verificado: hoy se cortan sin más).
- [ ] Franja de temporada en la cabecera (alta/media/baja con el tono correspondiente) — contexto de negocio gratis.
- [ ] Filtro por tipo de unidad y por estado; búsqueda dentro del planning.

### C1.4 — Confianza

- [ ] **Deshacer** en toda acción del planning (toast con "Deshacer", ver C3). Hoy no hay undo ni siquiera en la reasignación.
- [ ] Sustituir el `<p>` de feedback (`Planning.tsx:319-326`) por toast real.
- [ ] Revisar el rendimiento con el seed denso de C0.2 (300 uds × 90 días es el listón declarado). Considerar virtualizar también el eje horizontal: hoy se pintan todos los `<div>` de fin de semana por fila (`Planning.tsx:431-439`).
- [ ] **Limpiar el comentario obsoleto** de `Planning.tsx:5` — dice que el D&D "llega en la sesión 17" y está implementado 150 líneas más abajo.

### C1.5 — Color: la decisión de diseño de fondo

Hoy las barras son **negro y ámbar**. Funciona, pero es monótono y desperdicia el eje que más información puede llevar. `BRAND.md` §4 dice que en Logic2B **el color solo entra por los `--chart-*`** — y un tape chart **es** una visualización de datos, así que los `--chart-*` son exactamente el sitio legítimo del que sacarlo.

- [ ] Definir el mapa de estado→token sobre `--chart-*` (arreglando antes el bug de C-BUG-1), con AA verificado sobre la barra.
- [ ] Distinguir visualmente: confirmada / pendiente de pago / en casa (tras C4) / salida hoy / bloqueo / cancelada.
- [ ] Que el color diga algo **operativo**, no decorativo: lo que la recepcionista necesita ver de un vistazo a las 9:00.

---

## C2 · Design system completo y conectado

El DS está bien hecho y **desconectado**. Conectarlo es lo que hace que las 11 pantallas suban de nivel a la vez.

- [ ] **Meter Radix en `packages/ui`.** Es el bloqueo de fondo: sin las primitivas no hay dialog/sheet/popover/dropdown. Decidir en el ADR el alcance exacto (qué paquetes de Radix, versiones).
- [ ] **Primitivos que faltan**, por orden de uso real en este producto:
  `skeleton` · `toast`(sonner) · `dialog` · `alert-dialog` · `sheet` · `table` · `input` · `label` · `select` · `dropdown-menu` · `popover` · `tooltip` · `tabs` · `command`(⌘K) · `separator` · `scroll-area` · `switch` · `checkbox` · `calendar`/`date-picker` · `avatar` · `form`.
- [ ] **Migrar los 41 `<button>` crudos** a `<Button>`. Criterio de hecho: **0 `<button>` crudos** en `apps/dashboard`.
- [ ] Migrar tablas, inputs y tarjetas a los primitivos del DS sin perder densidad ni velocidad (la densidad es requisito, no adorno).
- [ ] **Cerrar el rename de la paleta camping.** `styles.css:9-19` mapea `--color-pino → var(--primary)` etc. Es un puente consciente, pero deja **~400 usos escritos en el vocabulario viejo** y produce el bug C-BUG-2. Terminarlo aquí.
- [ ] **Decidir el modo oscuro.** Existen los 25 tokens `.dark` y **no hay ni toggle ni detección** — es código muerto. O se conecta (un mostrador de recepción a las 23:00 lo agradece, y es un detalle que impresiona en demo) o se retira. No dejarlo a medias.
- [ ] Test de render por primitivo, como ya se hizo con los 4 existentes.

---

## C3 · Estados y microinteracción — *el multiplicador barato*

Once pantallas, un puñado de piezas transversales. Probablemente la mejor relación esfuerzo/percepción de todo el documento.

- [ ] **Skeletons** con la forma real del contenido (no un rectángulo gris) en las 11 pantallas. Reutilizar el criterio del mostrador de la web, que ya lo hace bien con `aria-busy`.
- [ ] **Error boundaries** por ruta. Hoy: **0**. Un throw en render = pantalla en blanco. Con mensaje humano + "reintentar" + vuelta al planning.
- [ ] **Errores de query diferenciados**: 401 (sesión caducada → al login, sin perder lo que hacías), 403 (sin permiso, explicando el rol), 500 (reintentar). Hoy todo es el mismo `<p>`.
- [ ] **Toasts** (`sonner`) sustituyendo el `useState<{text,error}>` repetido en 6 ficheros. Con **acción "Deshacer"** donde tenga sentido.
- [ ] **Confirmación en toda acción destructiva.** Hoy solo hay una (doble click en Cancelar, `BookingPanel.tsx:387`): **el reembolso no confirma** (`:340`), dar de baja una unidad no confirma, guardar tarifas no confirma. Con `alert-dialog` del DS.
- [ ] **Estados vacíos con dibujo y salida.** Los 8 mensajes de `i18n.ts` son buenos pero son texto pelado. Ilustración discreta + CTA ("no hay llegadas hoy" → "ver mañana").
- [ ] **Foco y teclado** revisados tras la migración al DS: el `focus-visible` de shadcn (`ring-[3px]`) es mejor que lo que hay; que no se pierda por el camino.
- [ ] `prefers-reduced-motion` en toda animación nueva (la web ya lo respeta en sus tres animaciones; el dashboard debe igualarlo).
- [ ] **Rutas direccionables.** Hoy **no hay una sola ruta con parámetro**: todo detalle es panel lateral con estado local. Una reserva **no se puede enviar por email a un compañero**. Añadir `/reservas/$id`, `/clientes/$id` y que el panel lateral lea de la URL.

---

## C4 · Workflow real de recepción — ✅ HECHO (ADR 0022, 2026-07-21)

> **La decisión de fondo (§C4.1) se cerró: `checked_in_at`, no un estado `in_house`.** Un estado nuevo caería fuera de ~8 filtros por `status` (ocupación, informes, solape) y olvidar uno es un doble-booking; el campo no toca ninguno y "en casa" se deriva. Migración aditiva `0004` (dos columnas nulables). Hecho: check-in/check-out/deshacer (TRANSITIONS intacto), huéspedes y documentos editables (añadir/editar/quitar acompañante), "cobrar todo lo pendiente" con guarda ≤pendiente (cliente y servidor), crear/levantar bloqueos desde el planning **y** el plano, ⌘K (`cmdk`) buscando reserva/cliente/unidad, rutas direccionables `/reservas/$id` y `/clientes/$id`. Token `--lc-status-inhouse` (verde esmeralda, AA 5.5:1) en barra, plano y leyenda; `unitStateOn` gana `inhouse`. Seed: check-in de demostración sobre las confirmadas presentes en el ancla (puro, determinista). **Diferido** (BACKLOG): export del parte de viajeros (formato legal), recibo imprimible del check-out, crear reserva arrastrando (es C1.2).

Aquí "todo previsto y pensado" es literal: el flujo tiene que existir aunque parte se resuelva en modo fake.

### C4.1 — Check-in / check-out (hueco de dominio)

- [ ] **Decidir el modelo en el ADR**: ¿nuevo estado `in_house` en la máquina de estados, o un campo `checked_in_at` sobre la reserva? Afecta a `TRANSITIONS` (`apps/api/src/routes/admin.ts:36-40`), al planning (color "en casa") y a los informes.
- [ ] Acción de check-in desde: la fila de `/llegadas`, la ficha, y la barra del planning.
- [ ] Check-out con **cierre de cuenta**: pendiente a la vista y cobro en el mismo gesto.
- [ ] Que el planning **distinga visualmente "en casa"** de "confirmada". Es la información que más se mira en un mostrador.

### C4.2 — Huéspedes y documentos (requisito legal)

- [ ] Añadir/editar huéspedes de una reserva (hoy solo se **muestran**).
- [ ] Datos de documento por huésped (tipo, número, fecha de nacimiento, nacionalidad).
- [ ] **Parte de viajeros**: dejar el modelo preparado y el export declarado. Implementación real fuera del alcance visual, pero **el hueco tiene que estar previsto** — es de las primeras preguntas de un camping español.

### C4.3 — Cobro sin fricción

- [ ] Botón **"cobrar todo lo pendiente"**. Hoy hay que leer la cifra arriba y **teclearla a mano**.
- [ ] Validar que el importe ≤ pendiente (hoy no se valida en cliente).
- [ ] Recibo/ticket imprimible. La web ya tiene un patrón de impresión resuelto (`@media print` + `.lc-print`) — reutilizarlo.

### C4.4 — Poner las acciones donde ocurren

- [ ] **Alta manual alcanzable desde el planning** (además de `/reservas`).
- [ ] **Reasignar desde la ficha y desde `/reservas`**, no solo arrastrando en el planning.
- [ ] **Crear bloqueos desde la UI**: el planning **pinta** `blocks` pero no hay forma de crear uno. Una avería es cosa de todos los días.
- [ ] **⌘K** (`command`): buscar reserva por código, huésped por nombre, unidad, y saltar a pantalla. Es el detalle que hace que un producto se sienta moderno en 3 segundos de demo.

---

## C5 · Materia: fotos e imagen

`CLAUDE.md` dice **"materia, no vector"**, y el antimodelo está explícito: ni SaaS azul isométrico ni crema+serif+terracota.

### C5.1 — Cerrar el hueco de fotos (Higgsfield)

Faltan **4 ficheros ya referenciados en código** (`src/lib/fotos.ts:12,13,21-24`), más densidad de galería:

- [ ] `tipo-premium` — parcela grande con sombra de pino, suelo de arena compactada, toma de servicios visible
- [ ] `tipo-autocaravana` — plaza de autocaravana, hormigón + gravilla, luz de media tarde
- [ ] `detalle-bungalow-interior` — interior sencillo y limpio, luz natural, sin estilismo de catálogo
- [ ] `detalle-glamping-interior` — interior de tienda safari, lona, textil natural
- [ ] **2ª foto por tipo** donde la galería es de una sola imagen (bungalow, mobil, glamping): hoy la "galería" del detalle es de un elemento.
- [ ] Descargar las **6 ya generadas** que siguen pendientes de bajar (IDs en `PROGRESS.md`): interiores, piscina, restaurante, premium, autocaravana.

**Dirección de arte, común a todas** — pino carrasco, sombra real, lona, arena compactada, luz mediterránea de mañana o de última hora (nunca mediodía plano), sin personas reconocibles, sin saturación de folleto, sin HDR. Coherencia de hora y estación entre todas.

**Antes de generar en Higgsfield**: fijar la lista definitiva y los prompts, y confirmar la tanda. Cada generación cuesta créditos y no quiero quemarlos a ciegas.

### C5.2 — Imagen del producto (no del camping)

- [ ] **Capturas reales del planning** para la landing y las docs — y esto **depende de C0.2**: capturar el planning vacío de hoy sería contraproducente. Es la razón de ordenar el seed primero.
- [ ] OG image de la landing de producto (pendiente en BACKLOG).
- [ ] Ilustraciones discretas de estado vacío (C3), en la línea Logic2B: monocromo, trazo, nada de mascotas ni isometrías.

---

## C6 · Documentación (absorbe B4)

Petición explícita: *"que todo tenga una esencia Logic2B"* y *"una documentación súper detallada"*.

- [ ] **Guía de la recepcionista** — operar el gestor de principio a fin. **La usuaria real es la recepcionista de 55 años**: lenguaje llano, capturas grandes, una tarea por página. Apoyada en `FUNCIONALIDADES.md`.
- [ ] **Guía del dueño** — los 4 niveles (`TIERS.md`) como escalera, qué incluye cada uno, qué cambia al subir.
- [ ] **Ficha técnica** — para "el informático de confianza": dominios, DNS, correo, datos, aislamiento por D1, RGPD, backups.
- [ ] **Layout con marca Logic2B**, alineado con el DS. Decidir herramienta (decisión pendiente **B-ii** del ROADMAP: páginas Astro propias vs. Starlight vs. reutilizar el layout de `ui.logic2b.com`).
- [ ] Enlazada desde la landing (B3, hecha) y desde el dashboard (ayuda contextual — que el `?` de una pantalla lleve a *su* sección).
- [ ] **Mantener vivo este documento**: cada fase C que se cierre actualiza su bloque aquí y la tabla del ROADMAP.

---

---

## C7 · Plano del camping — ✅ HECHO (ADR 0021, 2026-07-21)

> **Pedido por Andreu (2026-07-20)** revisando el dashboard. Es una pieza de exhibición de primer orden: un director de camping **reconoce su propio camping** en la pantalla, y eso es un tipo de conexión que un tape chart no da. Complementa al planning, no lo sustituye — el planning responde *"¿cuándo?"*, el plano responde *"¿dónde?"*.
>
> **Resuelto en ADR 0021.** La decisión de fondo (§C7.1, dónde vive la geometría) se cerró por una **tercera vía**: descriptor declarativo en `tenants/{slug}/plano.ts` → `modules.plano` (columna JSON existente, **cero migración**) → `GET /api/admin/map` genérico → el dashboard lo expande con `expandPlano` (`packages/config`, puro y testeado). Los dos defectos del original cerrados (constantes únicas en `PLANO_GRID`, decorado como dato). `autoPlano` da degradación honesta. `CampingMap` (SVG, **pan/zoom** nuevo, teclado/foco/tooltip, colores `--lc-status-*` del planning) + página `Plano` (selector de fecha, estado en vivo, click→ficha, salto plano↔planning conservando unidad+fecha). Verificado visualmente con Playwright. **Diferido**: crear reserva/bloqueo desde el plano (C1.2/C4.4).

### C7.0 — El material de partida (ya existe, verificado)

**`/Users/andreumariner/Desktop/proyectos/gestor-reservas/src/lib/components/camping-map.svelte`** (518 líneas) + **`src/lib/data/accommodation.ts`** (246 líneas).

> Nota: Andreu lo situó en `logic2b-norte`; ahí **no está** — verificado árbol completo, `package.json` e historial git de las 3 ramas. Está en `gestor-reservas`. Hay una segunda versión en `c-reservas/src/components/admin/CampingMapView.svelte`, pero es un grid de `<div>` sin un solo `<svg>` y con reservas mock: **no sirve como plano real**.

Qué está resuelto y se aprovecha:

- **Geometría por unidad**: `mapPosition: { x, y, width, height }` embebido en cada unidad.
- **Layout generado, no dibujado**: factories `parcela()` / `bungalow()` / `mobileHome()` y `parcelBlock(startNum, gx, gy, cols)` sobre constantes de rejilla (`pw=32, ph=28, gapH=2, gapV=2, streetW=18, streetH=18`).
- **SVG puro inline, cero dependencias de mapas** — ni leaflet, ni mapbox, ni d3. Coherente con el stack cerrado.
- **`viewBox` calculado dinámicamente** + `preserveAspectRatio` → responsive sin esfuerzo.
- **Capas**: fondo → borde del recinto → calles (`<rect>`) → servicios/recepción/zona verde → unidades encima.
- **Interacción accesible**: cada unidad es un `<g role="button" tabindex="0">` con click, hover y Enter. Tooltip y leyenda incluidos.
- **Estado visual** por tipo × seleccionado × hover, con halos vía `feDropShadow`.

Los dos defectos conocidos del original, que **hay que corregir al portar**:

1. Las constantes de rejilla están **duplicadas literalmente** en el `.svelte` y en `accommodation.ts` (con un comentario `must match accommodation.ts` que lo delata). → módulo compartido único.
2. Los elementos decorativos del recinto están **cableados a ese camping** (recepción en `x=12 y=8`, la diagonal `M 72 0`, la etiqueta "BUNGALOWS" en `x=745`). En un producto multi-tenant eso **tiene que ser dato**, igual que ya lo son las unidades.

Y lo que **no** trae: **no hay pan/zoom** (solo escalado por `viewBox`). Para 300 unidades hará falta.

### C7.1 — La decisión de fondo: dónde vive la geometría

**Esto es lo que obliga a ADR y no es una decisión de UI.** El plano necesita coordenadas por unidad, y hay que elegir:

- [ ] **¿Columna en `units` (D1) o fichero de tenant?** Argumento para D1: la geometría es dato operativo del camping, y el dashboard ya lee `units`. Argumento para `tenants/{slug}/`: es configuración de instancia, cambia una vez y no en caliente. **Mi inclinación: `tenants/{slug}/`**, porque encaja con "lo que varía entre campings" del CLAUDE.md y **no obliga a migrar la D1 de todos los tenants**.
- [ ] **El plano del recinto como dato**: calles, servicios, zonas verdes, contorno. Un `plano.ts` (o JSON) por tenant.
- [ ] **Degradación honesta**: un camping sin plano definido **no debe ver una pantalla rota**. O la sección no aparece, o hay un layout autogenerado por zona a partir de `units.zone`.
- [ ] **Coste de alta ≤ una tarde** — restricción que gobierna todo el proyecto. Si dibujar el plano de un camping nuevo cuesta dos días, **la feature está mal diseñada**. Las factories del original apuntan en la buena dirección: se declara "bloque de 20 parcelas en 5 columnas desde aquí", no 20 rectángulos.

### C7.2 — El port a React

- [ ] Es **reescritura de componente, no copy-paste**: el original es Svelte 5 con runes; aquí es React 19. Lo que se reutiliza es **el modelo y la geometría**, que es la parte cara y ya está pensada.
- [ ] SVG inline, sin librería de mapas (respeta el stack cerrado).
- [ ] Componente **controlado y puro**, como el original: recibe unidades + selección + callbacks, no toca stores por dentro.
- [ ] Colores de estado desde los **mismos tokens** que el planning (C1.5), no una segunda paleta. Un plano y un planning que no se parecen es peor que no tener plano.

### C7.3 — Estado en vivo e integración

- [ ] Estado real por unidad en una fecha: libre / ocupada / entra hoy / sale hoy / bloqueada. Con **selector de fecha**, que es lo que lo convierte de dibujo en herramienta.
- [ ] **Click en unidad → ficha de reserva**, el mismo panel que ya usa el planning. Sin duplicar UI.
- [ ] **Saltar plano ↔ planning** conservando unidad y fecha. Ese ida y vuelta es la demo.
- [ ] Pan/zoom (falta en el original) — obligatorio a 300 unidades.
- [ ] Densidad legible a **1366px**, y decidir qué hace en **375px** (probablemente pan/zoom con controles grandes, no la rejilla completa).
- [ ] Teclado y foco visible, al nivel del original (que lo tenía).

### C7.4 — Dónde encaja

Depende de **C0.2** (con el seed vacío, un plano en el que casi todo está libre no enseña nada) y se apoya en **C2** (tooltip/popover del DS) y **C1.5** (mapa de color de estado compartido). Por eso va después, no porque sea menos importante.

> ~~Alcance de esta noche: registrado y pensado, no construido.~~ **Construido en ADR 0021 (2026-07-21).**

---

## 2. Bugs registrados (arreglar dentro de su fase)

| id | Dónde | Qué | Fase |
|---|---|---|---|
| ~~**C-BUG-1**~~ ✅ | `packages/ui/src/theme.css` | Los `--chart-*` de `:root` (light) eran los valores **dark** de `BRAND.md` §4; los 5 desplazados. **Arreglado en ADR 0020** — y no era trivial: el valor light correcto de `--chart-4` es morado y no pasa AA con texto negro, así que arreglarlo *tal cual* rompía el planning. Se corrigieron los 5, se añadió `--radius-2xl`, se añadió el bloque `--chart-*` que **faltaba entero** en `.dark` (por eso nadie lo detectó), y el planning se desacopló a tokens semánticos `--lc-status-*` | C2 ✅ |
| ~~**C-BUG-2**~~ ✅ | `apps/dashboard/src/styles.css` | `--color-mar: var(--foreground)` → los errores en negro. **Arreglado en ADR 0020** — tampoco era lo que parecía: `mar` tenía **dos significados** (de sus 44 usos, 4 eran enlaces `mailto:`/`tel:`), así que reapuntarlo a `--destructive` habría pintado los contactos en rojo. Se partió por significado: token `--link` propio para enlaces, `--destructive` para el resto. El puente de alias entero se eliminó | C2 ✅ |
| **C-BUG-3** | `apps/api/src/auth.ts` | Sin `trustedOrigins` → **403 en el login del dev server** (`:5173`). Bloquea el HMR del dashboard | C0.1 |
| ~~**C-BUG-4**~~ ✅ | `apps/dashboard/src/pages/Planning.tsx:5` | Comentario obsoleto: decía que el D&D "llega en la sesión 17"; estaba implementado abajo. **Arreglado en ADR 0020** al pasar por el fichero | C2 ✅ |
| **C-BUG-5** | `apps/web/src/lib/fotos.ts:12,13,21-24` | 4 ficheros de imagen inexistentes; `ut_prem`/`ut_moto` sin foto propia | C5.1 |
| **C-BUG-6** | `apps/dashboard/src/pages/Planning.tsx:199` | **Encontrado en ADR 0020.** El resaltado de la celda destino al arrastrar se pintaba con `var(--lc-pino)`, variable que el dashboard **nunca define** (solo existe en los temas de tenant de la web) → declaración inválida, resaltado **invisible**. Resto de ADR 0008, cuando el dashboard compartía paleta con la web. Arreglado a `var(--primary)` | C2 ✅ |

## 3. Remates menores de la web (no bloquean, pero suman)

- [ ] `src/pages/404.astro` **no está localizada** (solo idioma por defecto). Las otras 216 páginas sí.
- [ ] **Blog solo en `es`/`en`**: 4 idiomas caen a fallback y ven español.
- [ ] Sin `aria-live`/`role="alert"` en resultados y errores dinámicos del mostrador y del funnel: **un lector de pantalla no anuncia que aparecieron resultados**.
- [ ] `ca.json`: revisar `nav.idioma`, `nav.menu`, `mostrador.reservar`, `ticker.1` (idénticos a `es`).
- [ ] Errores de la web pintados con `--lc-mar` (token de *info*), sin token semántico de error. Mismo vicio que C-BUG-2.

## 4. Orden propuesto y por qué

**C0 primero, y no es negociable.** El seed denso (C0.2) cambia cómo se ve *todo* lo demás, y el HMR (C0.1) cambia la velocidad de *todo* lo demás. Hacer C1 sobre un planning vacío es diseñar a ciegas.

Después, **C3 antes que C4**: los estados son transversales y suben las 11 pantallas de golpe; el workflow es profundo pero afecta a pocas. Con prioridad visual declarada, lo ancho va primero.

**C2 corre en paralelo** a C1/C3 porque los alimenta: sin `skeleton`, `toast` y `alert-dialog` en el DS, C3 no se puede hacer bien.

**C5 en cuanto haya seed denso** — las capturas del planning dependen de ello.

```
C0 ──┬─► C2 ──┬─► C3 ──► C4
     │        │
     └─► C1 ◄─┘
     │
     └─► C5 ──► C6
     │
     └─► C7 (plano; necesita C0.2 + C1.5 + C2)
```

## 5. Criterio de "hecho" del Frente C entero

Uno solo, y es el mismo de siempre:

> Un director de camping recorre la demo en su móvil desde el primer email comercial, entra al gestor, arrastra una reserva, y piensa **"esto es más serio que lo que tengo"**.

Y el suelo de calidad que no se negocia en ninguna fase: responsive real, foco de teclado visible, `prefers-reduced-motion`, contraste AA, **usable a 1366px**, y probado a **375px** antes de cerrar sesión.
