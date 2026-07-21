# 0023 — El planning como pieza de exhibición: gestos, orientación y color definitivo (Frente C, fase C1)

- **Fecha**: 2026-07-21
- **Fase**: Frente C — C1 (planning ★)
- **Estado**: **aceptado e implementado**. Mandato autónomo permanente del Frente C (Andreu: *"aplica tu criterio y no pares hasta cerrarlo"*, como en C7/ADR 0021 y C4/ADR 0022). Todo lo que se decide aquí es reversible: no hay migración de D1, ni cambio de semántica en datos existentes — solo una acción nueva de API (aditiva), tokens CSS y cliente.

## Contexto

El planning está declarado **elemento firma** desde ADR 0008, y hoy es sólido de ingeniería (virtualización de filas, DnD vertical optimista con rollback, teclado) pero **pobre de gesto**: no se pueden mover ni estirar fechas arrastrando — *el* gesto que cualquiera que haya usado un tape chart busca en los primeros 10 segundos (`FRENTE-C-ACABADO.md` §C1). Tampoco se crea reserva arrastrando, no hay línea de "hoy", las barras se cortan en el borde sin avisar, no hay filtros dentro del planning, y el mapa de color es provisional desde ADR 0020 — lo que a su vez bloquea el modo oscuro.

Herencias ya cobradas: toast con **Deshacer** (C3), mapa de color con "en casa" (C4), seed denso (C0.2), `AlertDialog`/primitivos del DS (C2).

Reglas duras que gobiernan este ADR:

- **El precio lo calcula SIEMPRE el servidor** (contrato del proyecto, y así lo hacen ya el alta manual y el `modify` público).
- **Invariante 1** (sin solapes) y **auditoría** de toda mutación.
- Invariante 3 se lee bien: *cambiar una tarifa* no toca reservas. **Cambiar las fechas de una reserva SÍ re-cotiza** — es un cambio de la estancia, no de la tarifa; exactamente lo que ya hace `POST /bookings/:code/modify` de la web pública.
- Suelo de calidad: teclado, `prefers-reduced-motion`, AA, 1366px.

## Decisión

### 1. El gesto horizontal: previsualizar en cliente, cotizar y escribir en servidor (C1.1)

**Una sola acción nueva de API** cubre mover y estirar: `PATCH /api/admin/bookings/:id` con `{ action: 'move', dateFrom, dateTo, unitId?, expectedTotalCents? }`. Se elige extender el `bookingActionSchema` existente (y no una ruta nueva) porque mover fechas ES una acción sobre la reserva, como `reassign`, y hereda rol (`reception`), auditoría y patrón de errores.

Semántica de `move` (espejo del `modify` público, que es el precedente en el código):

- Solo `pending`/`confirmed` (una completada/cancelada/no-show no se mueve; 409 explicado).
- `unitId` opcional **del mismo tipo**: un arrastre diagonal (fecha + unidad) es UNA acción y UN deshacer, no dos. Sin `unitId`, la reserva se queda en su unidad.
- Valida `validateStay` (min/max stay, días de llegada/salida, temporada abierta) — el mostrador juega con las mismas reglas que la web; el rechazo se **explica** con las mismas claves `stay.*` que ya traduce el alta manual.
- Valida el solape **contra la unidad concreta destino** (reservas vivas + bloqueos, from inclusive / to exclusive) — mismo criterio que `reassign`.
- **Re-cotiza en servidor** con los extras ya contratados de la reserva (+ los obligatorios) y `withElectricity` inferido del desglose vigente (la línea `price.electricity` del `price_breakdown` — el desglose auditable es la fuente de verdad de qué se contrató).
- Escribe fechas + unidad + desglose + total en un batch atómico con su asiento de `audit_log` (`from`/`to` con fechas y total). `paidCents` **no se toca**: si el nuevo total queda por debajo de lo pagado, la ficha ya enseña el pendiente negativo y el reembolso es la acción explícita de siempre (mismo criterio que el `modify` público).

**`expectedTotalCents` — el candado del "confirmar antes de cobrar".** El contrato pide *"enseñar el desglose nuevo antes de confirmar si el importe cambia"*. Eso obliga a un paso de previsualización, y toda previsualización puede quedarse obsoleta. El cliente manda el total que le enseñó al usuario; si el que recalcula el servidor difiere, la acción devuelve **409 `price_changed`** con el desglose fresco y la UI vuelve a preguntar. Sin este campo habría una ventana en la que se confirma un precio y se escribe otro.

**La previsualización es `POST /api/admin/bookings/:id/requote`** (dry-run): mismas validaciones y misma cotización que `move`, **sin escribir nada**. Devuelve `{ nights, breakdown, totalCents, previousTotalCents }` o el mismo catálogo de errores (`unit_occupied`, `invalid_stay`, `closed`). Existe porque el flujo del gesto es: soltar → requote → *si el total no cambia*, commit directo (optimista, toast con Deshacer); *si cambia*, `AlertDialog` con desglose viejo→nuevo → confirmar → `move` con el candado. Reutilizar `POST /api/quote` (público) no vale: cotiza por **tipo**, no valida la **unidad** destino ni excluye la propia reserva del solape.

**El deshacer de un `move`** es otro `move` a las fechas/unidad de origen con `expectedTotalCents` = total de origen: como las tarifas no han cambiado en los segundos intermedios, el servidor recalcula el mismo desglose y el candado pasa. Si justo entonces alguien ocupó el hueco de origen, el deshacer falla **explicado** — que es más honesto que fingir que siempre se puede.

**En el cliente** el arrastre es manipulación directa del DOM (cero re-render por frame), como el vertical que ya existe:

- **Mover**: pointer down sobre el cuerpo de la barra → el eje dominante del primer movimiento decide si es un drag vertical (reasignar, el de siempre) u horizontal (mover fechas, `translateX` con snap a celda). El diagonal combina ambos en un solo `move`.
- **Estirar**: dos asas (`resize handles`) en los bordes de la barra, visibles al hover/focus, `cursor: ew-resize`. Arrastrar el borde derecho cambia `dateTo`; el izquierdo, `dateFrom`. Mínimo 1 noche.
- **Feedback en vivo**: un tooltip flotante junto al cursor con `dateFrom → dateTo · N noches` actualizado a cada celda cruzada, y la barra fantasma en la posición de destino. La validación fina (solape, precio) NO se hace por frame — se hace al soltar, en servidor, que es quien manda.
- **Teclado** (paridad con el gesto, suelo de calidad): con la barra enfocada, `←`/`→` mueven la estancia un día; `Shift+←`/`Shift+→` estiran/encogen `dateTo` un día. Mismo flujo requote→confirmación al soltar la tecla (debounce corto). `↑`/`↓` siguen reasignando como hasta hoy.

### 2. Crear donde ocurre la venta (C1.2)

- **Arrastrar sobre celdas libres** de una fila de unidad → abre el alta manual (`NewBookingPanel`) **precargada** con tipo, fechas y unidad. El panel gana una prop `initial`; no se duplica ni un formulario.
- Para que el alta caiga en **esa** unidad y no en la que el asignador elija: `adminBookingCreateSchema` gana `preferredUnitId` (opcional) y `createBooking` lo pasa al asignador como preferencia — si la unidad preferida está libre se usa; si no, el asignador decide como siempre (nunca falla el alta por la preferencia). Un parámetro opcional, cero cambio para la web pública.
- **Arrastrar un chip de la bandeja "sin asignar"** hasta una fila del mismo tipo → `reassign` de siempre (que ya acepta asignar unidad a quien no la tiene). El chip se vuelve arrastrable con los mismos pointer events; el destino se resalta como en el drag vertical.
- Esto cierra también el diferido de C7/C4 "crear desde el plano": el plano ya salta al planning conservando unidad y fecha, y ahora esa fila es un lienzo donde crear.

### 3. Orientación (C1.3)

- **Línea de "hoy"**: una línea vertical de 2px (`--lc-today`, rojo teja discreto) sobre TODO el lienzo con un marcador en la cabecera. Solo si "hoy" cae dentro del rango visible.
- **Indicador de continuación**: si `dateFrom` queda antes del borde visible, la barra pierde el radio izquierdo y pinta un chevrón `‹`; simétrico a la derecha. Deja de parecer que la estancia "empieza" donde la corta el viewport.
- **Franja de temporada** en la cabecera: una banda fina bajo los días coloreada por temporada (resuelta por **prioridad** por día, como el motor). El color no es semántico de negocio (los nombres de temporada los pone cada camping): escala fija de 4 tonos suaves cíclicos por temporada distinta, con el nombre en tooltip. `/api/admin/planning` devuelve ahora también `seasons` (ya viajan en `/rates`; aquí solo se añaden al SELECT).
- **Filtros DENTRO del planning**: filtro por **tipo** (oculta grupos de filas), por **estado** (atenúa las barras que no casan — ocultarlas mentiría sobre la ocupación) y **búsqueda** por código de reserva o de unidad (atenúa lo demás y `Enter` centra la primera coincidencia). Todo en cliente: los datos ya están en memoria.

### 4. C1.5 — el mapa de color DEFINITIVO, y con él el modo oscuro

El mapa provisional de ADR 0020/0022 **se confirma como definitivo en estructura** — está bien elegido operativamente: lo que la recepcionista mira a las 9:00 es *quién está dentro* (verde), *quién llega/está confirmado* (tinta), *quién no ha pagado* (ámbar), *quién no vino* (rojo), *qué ya pasó* (gris), *qué está fuera de servicio* (rayado). Lo que faltaba no era otro mapa, era **cerrarlo**: valores finales, pareja `.dark`, AA **verificado por test** y no por ojo, y declarar `--lc-today` y la escala de temporada como tokens del DS (los consumirá también el plano).

- Los 7 pares `--lc-status-*`/`-fg` quedan con **valor final en `:root` y en `.dark`** (hasta hoy `.dark` no declaraba ninguno: heredaba los light — el mismo agujero que C-BUG-1). Los que derivan de tokens semánticos (`confirmed`→`primary`, `completed`→`muted-foreground`…) ya se adaptan solos; los fijos (`inhouse`, `pending`, `info`) reciben pareja dark explícita.
- **Test de contraste en `packages/ui`**: conversión oklch→sRGB en el propio test y aserción WCAG — texto sobre barra ≥ 4.5:1 (AA texto normal) y barra sobre fondo ≥ 3:1 (AA no-texto), en light **y** dark. El mapa deja de poder romperse en silencio: cambiar un token a un valor sin contraste hace fallar la suite.
- **Modo oscuro**: con el mapa cerrado, se desbloquea (dependencia declarada en ADR 0020 §4). Toggle de tres estados (claro / oscuro / sistema) en el pie de la sidebar, persistido en `localStorage` (`lc-theme`), detección `prefers-color-scheme` para "sistema", y un script mínimo pre-React en `index.html` para no parpadear (mismo patrón sin-FOUC que el selector de temas de la web, ADR 0009). Alcance: **el dashboard**. La landing y la web de tenant no cambian en esta sesión.

### 5. Rendimiento: el eje horizontal NO se virtualiza — se elimina el trabajo (C1.4)

La pregunta abierta era "¿virtualizar también columnas?". Medido el DOM real: con 83 unidades × 92 días el coste no son las barras (~350, ya acotadas por virtualización de filas) sino **el sombreado de fin de semana: un `<div>` por celda de finde × fila** (~26 × filas visibles ≈ 1.000+ nodos que se recrean al hacer scroll) más 92 celdas × 2 de cabecera. Virtualizar columnas añadiría un segundo eje de complejidad para ahorrar nodos que **pueden no existir**:

- El sombreado de finde pasa a **UNA capa por lienzo** (no por fila): un `repeating-linear-gradient` de período `7 × cellW` con fase calculada desde el día de la semana de `from`, en un solo `<div>` absoluto detrás de las filas. De ~1.000 nodos a **1**, y deja de repintarse al hacer scroll vertical.
- La cabecera (92 + 92 nodos estáticos) y la franja de temporada (segmentos, no celdas) son irrelevantes.
- Conclusión: **no virtualizar el eje horizontal**. Si algún día el zoom "Año" (365 días × 300 unidades) existe, se reabre con medidas, no antes. Queda escrito para no re-decidirlo por intuición.

## Qué queda fuera (y por qué)

- **Mover una reserva a OTRO tipo de unidad** arrastrando: cambia el precio de forma no comparable (otro producto) y el asignador/validador están tipados por tipo. Es un caso de mostrador raro que ya se resuelve cancelando y creando. BACKLOG si un camping real lo pide.
- **Crear bloqueos arrastrando**: el diálogo de bloqueo (C4) ya se precarga desde el planning; duplicar el gesto de crear-reserva para bloqueos añade ambigüedad (¿este arrastre crea reserva o bloqueo?) sin demanda real.
- **Modo oscuro en landing/web de tenant**: otra marca, otro tema (ADR 0006/0018); no se toca aquí.
- **`aria-live` de anuncios del arrastre para lector de pantalla**: el gesto tiene paridad completa por teclado (que es lo exigible); anunciar cada celda cruzada por voz es ruido. El resultado (toast) ya es accesible.

## Consecuencias

- La API gana `requote` + `move` (aditivo; `TRANSITIONS` intacto — mover no es una transición de estado). Tests de integración D1 propios: mover sin cambio de precio, mover cruzando temporadas con `price_changed`, solape → 409, estirar sobre bloqueo → 409, `validateStay` → 422 explicado, diagonal con `unitId`, `preferredUnitId` respetado e ignorado-si-ocupado, y auditoría del `move`.
- El planning pinta menos nodos que antes con más información en pantalla (línea de hoy, temporada, continuación).
- El mapa de color pasa de "provisional" a **contrato con test**: el plano (C7) y la maqueta de la landing lo heredan sin tocarlos, incluido el modo oscuro del dashboard.
- `Planning.tsx` crece en lógica de gesto; la geometría fecha↔píxel y el cálculo de fase del gradiente se extraen a `lib/planning-geometry.ts` **puro** para poder testearlo sin DOM.
