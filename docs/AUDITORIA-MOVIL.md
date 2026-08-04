# Auditoría móvil del gestor — M0

- **Fecha**: 2026-08-04
- **Estado**: cerrada
- **Contrato**: ADR 0031
- **Bundle**: `main` en sesión 70, construido y servido desde `/admin/` por el
  Worker local del tenant demo
- **Datos**: seed real con ancla `2026-08-04`; cero mocks

## Resultado ejecutivo

El gestor **no desborda como página** en portada, llegadas, solicitudes,
planning ni plano a 320, 375 o 430 px. La carcasa móvil y las rejillas adaptadas
han hecho su trabajo. Sin embargo, solo **solicitudes** completa hoy su tarea de
principio a fin con una composición móvil razonable, y aun allí los objetivos
táctiles son pequeños.

Los bloqueos no son de “responsive” entendido como que todo quepa. Son de modelo
de interacción:

- la búsqueda global solo se abre con `⌘/Ctrl+K`, por lo que **no existe para un
  teléfono sin teclado físico**;
- la ficha de reserva mide 360 px siempre y desborda 40 px en un móvil de 320;
- las acciones directas de check-in/out miden 36×28 px;
- el planning sigue siendo un tape chart operado con barras de 24 px y asas de
  8 px;
- las unidades del plano se reducen hasta 10–17 × 7–12 px;
- demo y recepción reciben una puerta a “Parte de viajeros” que termina en el
  mensaje de gerencia que ya se sabía inevitable.

No se encontró ningún P0. Hay **seis P1**, cinco P2 y un P3. El orden que sale de
la evidencia es **M1 → M2 → M3 → M5 → M4 → M6**: primero poder cerrar una cuenta
y encontrar una reserva; después la operación del día; luego las dos vistas
densas con una interacción propia; finalmente carga inicial.

## Matriz recorrida

| tarea                         | demo                            | recepción                                               | gerencia         | resultado actual                                            |
| ----------------------------- | ------------------------------- | ------------------------------------------------------- | ---------------- | ----------------------------------------------------------- |
| orientarse en portada         | verificada                      | verificada 320/375/430                                  | —                | parcial: KPIs primero, listas del día después de 13 módulos |
| buscar reserva/cliente/unidad | verificada por teclado          | 6 resultados reales por teclado                         | —                | **fallo táctil**: no hay botón que abra la paleta           |
| tramitar llegada/salida       | —                               | 5 check-in y 10 check-out ofrecidos sobre datos del día | —                | parcial: datos legibles, acción primaria 36×28              |
| abrir ficha y cobrar          | —                               | ficha real con “Cobrar todo lo pendiente”               | —                | **fallo a 320** y controles de 28–32 px                     |
| gestionar solicitud           | —                               | detalle, email/teléfono y cambio de estado visibles     | —                | operable; acciones 128×28 y 109×28                          |
| consultar planning            | gestos demo permitidos          | consultado 320/375/430                                  | —                | lectura parcial; operación táctil inviable                  |
| consultar plano               | lectura demo                    | consultado 320/375/430                                  | —                | mapa visible; selección táctil inviable                     |
| Parte de viajeros             | puerta ofrecida, pantalla niega | puerta ofrecida, pantalla niega                         | datos operativos | fallo de navegación por rol, backend correcto               |

La auditoría no repite toda la matriz con gerencia porque la geometría es el
mismo bundle. Ese rol solo sirve de control para confirmar que `/parte` sí carga
datos cuando corresponde.

## Hallazgos priorizados

### M0-01 · P1 · La ficha no cabe en el suelo de 320 px → M1

`BookingPanel` es un `<aside>` fijo de **360 px**:

| viewport | izquierda | ancho | borde derecho | desborde documento |
| -------: | --------: | ----: | ------------: | -----------------: |
|      320 |         0 |   360 |           360 |          **40 px** |
|      375 |        15 |   360 |           375 |                  0 |
|      430 |        70 |   360 |           430 |                  0 |

A 375 px deja una tira de 15 px de la lista de fondo, sin aportar contexto útil;
a 320 corta contenido. El cierre mide 28×28 y el campo de importe 13 px. Lo que
sí funciona y debe conservarse: Escape cierra y el foco vuelve a la fila origen;
“Cobrar todo lo pendiente” está disponible con el importe calculado por servidor.

**Aceptación de M1**: `Sheet` a pantalla completa bajo `md`, sin desborde a 320,
cabecera y acción de cuenta alcanzables, trampa de foco, Escape/atrás y devolución
del foco. Campos editables a 16 px como mínimo.

### M0-02 · P1 · Buscar no tiene entrada táctil → M2

La paleta funciona bien una vez abierta: el campo recibe foco, mide 325×44 a
375 px y devuelve seis resultados reales al buscar `CS-2026`. Pero su única
entrada es `⌘/Ctrl+K`; no hay botón en la barra móvil, el menú ni la portada.

**Aceptación de M2**: botón “Buscar” de 44×44 en la barra móvil (y atajo intacto
en escritorio), nombre accesible, apertura con foco en el campo y retorno al
disparador al cerrar.

### M0-03 · P1 · Check-in/out exige precisión de ratón → M3

La hoja de llegadas conserva los datos críticos sin scroll horizontal: código,
unidad, titular, pax/noches, estado y saldo. El seed ofrece cinco check-in y diez
check-out el día auditado. Bajo 375 px, cada acción se reduce a icono de **36×28
px**; a 430 recupera texto y 112 px de ancho, pero sigue midiendo 28 px de alto.

**Aceptación de M3**: acción primaria ≥44 px, rótulo visible o patrón inequívoco,
sin perder saldo/estado; confirmación de check-out y mensajes de servidor
inalterados.

### M0-04 · P1 · El plano se ve, pero sus unidades no se pueden tocar → M5

El mapa completo entra en pantalla, el SVG acepta teclado y existen controles de
acercar/alejar/ajustar. Al ajustar todo el recinto, cada unidad mide entre **10×7
y 17×12 px** según ancho y geometría; los tres controles miden 28×28. El
`touch-none` del SVG evita el scroll accidental, pero no crea un objetivo táctil.

**Aceptación de M5**: selección con área efectiva ≥44 px o zoom automático que la
garantice, controles ≥44, pan/zoom que no secuestre el scroll de página, recentrar
y ficha inferior; mantener navegación de las unidades por teclado.

### M0-05 · P1 · El tape chart móvil no es una agenda → M4

No hay desborde del documento porque el lienzo desplaza dentro de su contenedor,
pero el modelo sigue siendo el de escritorio: filas de 32 px, barras de **24 px**,
asas de estirar de **8 px**, arrastre horizontal/vertical y una barra de mando que
ocupa varias filas antes de llegar a hoy. Los filtros y la búsqueda interna
miden 32 px y usan texto de 13 px.

La vista sirve para una inspección aproximada, no para mover o cambiar una
estancia con el pulgar. Inflar barras dentro del mismo tape chart solo reduciría
la cantidad de contexto sin resolver el gesto.

**Aceptación de M4**: agenda día/semana bajo `md`, reserva y unidad como filas
tocables, cambio de fecha/unidad con controles explícitos; tape chart intacto en
tablet/escritorio.

### M0-06 · P1 · Navegación deshonesta por rol → bloque común M1–M2

“Parte de viajeros” se ofrece en sidebar y portada a los tres roles. Demo y
recepción llegan a una pantalla que dice correctamente “Esta pantalla es de
gerencia”; gerencia ve los registros. La barrera de servidor funciona, pero la
puerta ofrecida promete una tarea que esos roles no pueden terminar.

**Aceptación**: `NAV_GROUPS` declara el rol mínimo y sus dos consumidores filtran
la misma lista. El servidor conserva el 403; ocultar es cortesía, no seguridad.

### M0-07 · P2 · La portada pone el catálogo antes que el día → M2

Los cuatro KPIs caben en dos columnas y enlazan. Después aparecen trece tarjetas
de módulos; solo al rebasarlas se llega a entradas, salidas y solicitudes. En
móvil se entiende qué existe, pero no se llega rápido a lo urgente.

**Aceptación de M2**: KPIs → tres listas del día en una columna → módulos
secundarios. La portada de escritorio puede conservar las tres listas en
paralelo.

### M0-08 · P2 · Solicitudes funciona, con objetivos de 28–40 px → M3

La lista reduce honestamente sus cinco columnas a fecha, contacto y estado; el
detalle muestra mensaje, email, teléfono y acciones sin desbordar. Los filtros
miden 28 px, cada fila 40 px y “Marcar contactada/perdida” 128×28 / 109×28.

**Aceptación de M3**: filas y cambios de estado ≥44 px, acción principal visible
y secundaria en menú si hace falta; conservar la densidad y las tres columnas
que ya funcionan.

### M0-09 · P2 · Foco del menú móvil y objetivos del shell

La hamburguesa mide 36×36. El `Sheet` se abre a 256 px, pero Radix enfoca el
control de tema del pie en lugar del inicio de la navegación y Escape **no
devuelve el foco a la hamburguesa** porque la apertura se controla sin
`SheetTrigger`. Los enlaces del wordmark miden 20 px de alto y los botones de
ayuda 28×28.

**Aceptación**: disparadores del shell ≥44, foco inicial útil, orden de tabulación
de arriba abajo y retorno al disparador en Escape/cierre.

### M0-10 · P2 · Campos de 13–14 px provocan zoom del teclado

Fechas, filtros y búsqueda del planning, fecha del plano y cobro usan 13 px; la
paleta global usa 14 px. En iOS, enfocar texto menor de 16 px puede ampliar el
viewport y ocultar la acción que se pretendía completar.

**Aceptación transversal M1–M5**: entradas editables a 16 px bajo `md`, sin
cambiar necesariamente su escala en escritorio.

### M0-11 · P2 · Entrada de 230,42 kB gzip → M6

La build produce un único JS de **768,96 kB minificado / 230,42 kB gzip**. Supera
en 30,42 kB el objetivo inicial de 200 kB y carga Planning/Plano aunque la
primera visita sea la portada. La build también emite subsets no latinos de las
fuentes variables; en el recorrido se solicitaron los latinos, pero la salida
sigue cargada de activos que M6 debe revisar.

**Aceptación de M6**: rutas lazy, chunk inicial <200 kB gzip, Planning/Plano bajo
demanda y navegación posterior cacheada. Medir red real, no solo ficheros
emitidos.

### M0-12 · P3 · Enlaces compactos secundarios

“Ver el día”, “Ver todas”, ayuda y varios iconos secundarios no llegan a 44 px.
No todos necesitan una caja visual mayor, pero sí un área de toque suficiente y
sin solaparse. Se corrigen dentro del patrón dueño de cada pantalla, no con un
`min-height` global que infle el dashboard de escritorio.

## Propiedades que ya pasan y no deben regresionar

- Cero desborde global en las cinco pantallas base a 320/375/430, salvo la ficha
  abierta a 320, que es el hallazgo M0-01.
- El contenido crítico de llegadas y solicitudes se adapta sin tabla horizontal.
- La búsqueda devuelve resultados reales y enfoca el campo al abrir.
- La ficha devuelve el foco a la fila origen al cerrar.
- El mapa conserva control por teclado, además del pointer.
- Los permisos se siguen imponiendo en servidor aunque la navegación futura
  deje de ofrecer rutas imposibles.

## Método reproducible

1. `pnpm db:reset && pnpm db:seed`.
2. Construir `site`, `web` con `BASE_PATH=/demo` y `dashboard`; componer sus
   `dist/` igual que `deploy:demo`.
3. Servir `tenants/demo/wrangler.jsonc` con la D1 local.
4. Recorrer con Playwright/Chromium a 320×812, 375×812 y 430×812, usando los
   usuarios del seed y la entrada demo.
5. Medir `scrollWidth/clientWidth`, cajas de todos los elementos interactivos,
   tamaño tipográfico de inputs, foco antes/después y resultado por rol.

La sonda exploratoria de M0 no se conserva como una gran E2E frágil. Cada fase
M1–M6 debe fijar con una regresión pequeña la propiedad estable que arregle
(p. ej. panel sin desborde y foco recuperado), tal como exige ADR 0031.
