# 0021 — Plano del camping (Frente C, fase C7)

- **Fecha**: 2026-07-21
- **Fase**: Frente C — C7 (plano del camping)
- **Estado**: **aceptado e implementado**. Andreu, al cerrar la sesión anterior: *"continua como creas conveniente pero no pares hasta conseguirlo todo"* — mandato autónomo permanente para el Frente C. La decisión de fondo (§1) se toma aquí y se implementa en la misma sesión; si Andreu quiere revertir el sitio de la geometría, es un cambio de una capa (el descriptor), no del componente.

## Contexto

C7 estaba **registrado y pensado, no construido** desde la sesión 30 (`docs/FRENTE-C-ACABADO.md` §C7). Sus tres precondiciones ya están cumplidas:

- **C0.2** (seed denso, ADR 0019): un plano sobre un camping vacío no enseña nada. Hoy agosto está al ~86%.
- **C1.5 / C2** (mapa de color de estado, ADR 0020): los `--lc-status-*` viven en `packages/ui/theme.css` y ya los comparten el planning y la maqueta de la landing. El plano **tiene que** usar los mismos, o un plano y un planning que no se parecen es peor que no tener plano.

El material de partida real es `gestor-reservas/src/lib/components/camping-map.svelte` (Svelte 5 + SVG puro, `mapPosition` por unidad, layout por factories). **No está en este repo** (verificado en la sesión 30) y es otro framework: C7 es **reescritura del modelo y la geometría a React**, no copy-paste. El original tiene dos defectos conocidos que este ADR corrige por diseño:

1. Las constantes de rejilla estaban **duplicadas literalmente** en el `.svelte` y en `accommodation.ts`. → una sola fuente.
2. El decorado del recinto (recepción, diagonal, etiqueta "BUNGALOWS") estaba **cableado a ese camping**. En un producto multi-tenant eso **tiene que ser dato**. → decorado declarativo.

Y lo que el original **no** trae y a 300 unidades hace falta: **pan/zoom**.

Restricciones que gobiernan (§0 del super prompt): ~6h/semana y **nada que multiplique el trabajo por número de clientes**. Dar de alta el plano de un camping nuevo debe costar una tarde, no dibujar 300 rectángulos a mano.

## Decisión

### 1. Dónde vive la geometría — la decisión de fondo

Las dos opciones que el contrato dejaba abiertas eran: **columna en `units` (D1)** o **fichero de tenant**. Se elige una **tercera vía que es la síntesis honesta de ambas**, y que resulta ser exactamente cómo funciona ya *todo lo demás* en este proyecto:

> **La fuente de verdad de la geometría es un descriptor declarativo en `tenants/{slug}/` (`tenants/demo/plano.ts`). El seed lo materializa en la columna JSON `tenants.modules` (bajo `modules.plano`), igual que ya materializa `unit_types`, `rate_plans` o el resto de la config del tenant. El dashboard genérico lo recibe por un endpoint genérico (`GET /api/admin/map`).**

Por qué esta vía y no las otras dos:

- **Contra "columna nueva en `units`"**: obligaría a una **migración de la D1 de todos los tenants** (el ADR ya inclinaba en contra por esto). Además la geometría es config de instancia que **cambia una vez y no en caliente**, no un atributo operativo que se edite por unidad desde recepción.
- **Contra "fichero de tenant leído por la API"**: `apps/api` es **100% genérico** — no importa ni un byte de `tenants/{slug}/` (regla dura: ningún camping real carga datos de Cala Sereno en su bundle). Un fichero que la API tuviera que `import`ar rompería eso.
- **La vía elegida respeta ambas cosas a la vez**: el **autor** escribe el plano en un fichero de tenant (`plano.ts`, con factories declarativas → alta ≤ una tarde); el **transporte** es la columna `modules` que **ya existe** (cero migración) y que el API genérico ya sabe leer y servir. Es el mismísimo camino que recorren las unidades: declaradas en `seed.ts` (fichero de tenant) → materializadas a D1 → servidas por el API genérico → pintadas por el dashboard genérico. Que la geometría siga ese camino no es un compromiso: es **coherencia**.

`modules.plano` es un **descriptor compacto** (llamadas a factory, no 83 rectángulos): "bloque de 24 parcelas en 6 columnas desde aquí" + el decorado del recinto como lista de formas. ~2 KB. El dashboard lo **expande** a rectángulos en tiempo de render con una función pura (`expandPlano`), que es el port de `parcela()/bungalow()/parcelBlock()` con las constantes de rejilla en **un solo sitio** (`PLANO_GRID`, en `packages/config`) — defecto 1 del original, corregido.

### 2. La geometría pura vive en `packages/config`, no en el dashboard

Toda la lógica de geometría y estado es **pura, sin React, sin SVG**, y por tanto **testeable en Vitest**:

- **`packages/config/src/plano.ts`**:
  - `PLANO_GRID` — las constantes de rejilla, **fuente única**.
  - Tipos `PlanoDescriptor` / `PlanoBlock` / `PlanoDecor` — compartidos entre el productor (`tenants/demo`) y el consumidor (`apps/dashboard`). Un solo sitio, sin duplicar el contrato.
  - `expandPlano(descriptor)` → `PlanoLayout` (rectángulos por código de unidad + decorado + `viewBox` calculado). Puro.
  - `autoPlano(units, unitTypes)` → `PlanoLayout` — **degradación honesta**: un camping **sin** `modules.plano` no ve una pantalla rota, ve un layout autogenerado por tipo de unidad (bloques por zona). Es la degradación que el contrato pedía, promovida a comportamiento por defecto para que un tenant nuevo tenga plano el día uno.
  - `unitStateOn(date, unitId, bookings, blocks)` → estado del día (`free`/`occupied`/`arrival`/`departure`/`blocked` + `bookingId` + `turnover`). Puro. Es lo que convierte el dibujo en herramienta.

El dashboard solo pone la **piel**: el `<svg>`, el pan/zoom, los colores (tokens del DS), la accesibilidad. La parte cara y la parte con riesgo de bug (geometría, estado por fecha) queda cubierta por tests que no dependen del navegador.

### 3. El componente `CampingMap` — controlado y puro

Igual que el original: recibe `layout` + `stateByUnit` + `selectedCode` + callbacks, y **no toca queries ni stores por dentro**. SVG inline, sin librería de mapas (respeta el stack cerrado: ni leaflet, ni mapbox, ni d3). Capas: fondo → recinto → calles → servicios/zona verde/agua → unidades encima → etiquetas. Cada unidad es un `<g role="button" tabindex="0">` con `<title>` (tooltip nativo accesible, como el original y como el planning), click y Enter/Espacio. Halo de selección con `feDropShadow`. **Pan/zoom** (rueda hacia el cursor, arrastre para desplazar, botones +/−/ajustar, teclado) — lo que el original no traía. `prefers-reduced-motion` respetado.

**Color de estado desde los mismos `--lc-status-*` que el planning** (§C1.5), no una segunda paleta:

| Estado del día | Token | Lectura de recepción a las 9:00 |
|---|---|---|
| Ocupada (confirmada) | `--lc-status-confirmed` | ahí hay gente y está pagado |
| Ocupada (pendiente de pago) | `--lc-status-pending` | ahí hay gente pero falta cobrar |
| Entra hoy | confirmed/pending + marca de esquina | llega alguien: preparar |
| Sale hoy | `--lc-status-completed` (neutro) + marca | se libera: limpiar |
| Bloqueada (avería/larga estancia) | `--lc-status-blocked` (rayado) | no tocar |
| Libre | `--muted` + borde | disponible |

### 4. Integración: el ida y vuelta es la demo

- **Selector de fecha** (por defecto hoy): el plano lee `GET /api/admin/planning?from=D&to=D+1` para el estado de esa noche. Un plano sin selector de fecha es un dibujo; con él, es la foto del camping a día D.
- **Click en unidad ocupada → la misma ficha lateral** (`BookingPanel`) que ya usa el planning. Cero UI duplicada.
- **Saltar plano ↔ planning conservando unidad y fecha** vía search params de la ruta (`?date=…&unit=…`). Del plano al planning: abre el planning anclado a esa fecha, hace scroll a la fila de la unidad y la resalta (y abre su ficha si esa noche está ocupada). Del planning al plano: botón que lleva la fecha visible. Es el gesto que en una demo hace decir "espera, ¿esto es mi camping?".
- **375px**: el `<svg>` escala al ancho y el pan/zoom con controles grandes permite recorrerlo; no se intenta meter la rejilla completa en el móvil.

## Alternativas descartadas

- **Geometría por unidad en `units.attributes` (JSON ya existente)**: evita migración igual que `modules`, pero dispersa el plano en 83 filas y **no tiene sitio para el decorado del recinto** (calles, piscina, recepción), que no es de ninguna unidad. El descriptor de tenant lo tiene todo junto y es lo que se edita de una vez.
- **Fichero estático servido por el bundle compuesto** (`/tenant/plano.json`): funcionaría en producción pero **rompe el HMR** que C0.1 acaba de desbloquear (el dev server de Vite no sirve ese asset del tenant), y añade un paso al `deploy:demo`. El canal `modules` funciona idéntico en dev y en prod.
- **Segunda paleta de color para el plano**: descartada de plano (nunca mejor dicho). Con dos consumidores del mapa de estado (planning + plano) y la maqueta de la landing como tercero, el sitio del color es el DS. Ver ADR 0020 §2.2.

## Consecuencias

- **`apps/api` sigue 100% genérico**: `GET /api/admin/map` lee `modules.plano` de la fila `tenants` y lo devuelve tal cual. Ni una tabla ni un dato de Cala Sereno entra en su bundle.
- **Cero migración de D1**: se usa la columna `modules` existente.
- **Alta de un camping nuevo**: escribir su `plano.ts` (bloques + decorado declarativos) — una tarde, no un día de dibujar rectángulos. Y si no se escribe, `autoPlano` da un plano correcto por defecto.
- **La geometría y el estado por fecha quedan bajo test** en `packages/config`, sin depender del navegador.
- **Diferido con motivo** (fuera del alcance de C7, anotado en BACKLOG): crear reserva arrastrando sobre una celda libre del plano (es C1.2, gesto del planning), y crear bloqueos desde el plano (es C4.4). El plano de C7 **lee** estado y **navega**; no crea todavía.

## Resultado medido

Implementado en una sesión (2026-07-21).

- **Geometría pura y testeada** en `packages/config/src/plano.ts` (`expandPlano`/`autoPlano`/`unitStateOn`/`PLANO_GRID`), **18 tests** nuevos: colocación en rejilla, `viewBox`, cobertura del auto-layout, y los estados por fecha (entra/sale/turnover/bloqueada/libre, la cancelada no ocupa, from inclusive / to exclusive). Constantes de rejilla en **un solo sitio** (defecto 1 del original, cerrado).
- **Descriptor demo** `tenants/demo/plano.ts` (declarativo, decorado del recinto como dato → defecto 2 cerrado) materializado en `modules.plano`. **Test de cobertura en el seed**: `expandPlano(modules.plano)` coloca EXACTAMENTE las 83 unidades del seed, sin huérfanas ni duplicadas — si alguien añade un tipo y olvida el plano, el test lo caza.
- **Endpoint genérico** `GET /api/admin/map` (lee `modules.plano ?? null`), **3 tests** (degradación `null`, descriptor round-trip, 401 sin sesión). `apps/api` intacto y genérico.
- **`CampingMap`** (React, SVG inline, pan/zoom por viewBox, tooltip `<title>`, teclado, foco, `prefers-reduced-motion`, halo `feDropShadow`) + **página `Plano`** con selector de fecha, estado en vivo de una noche, click→ficha, y salto plano↔planning por search params. Nav nueva entrada + ilustración `map` de estado vacío en el DS.
- **Verificación visual sin workerd**: como el contenedor de esta sesión no puede levantar wrangler (workerd segfaulta), el plano se renderizó desde el descriptor REAL + los tokens reales del DS con Playmwright/chromium (captura en PROGRESS). Comprobado además por script: **83 unidades colocadas, 0 solapes unidad-unidad, 0 solapes unidad-servicio** (una primera pasada dio 2 parcelas de autocaravana pisando Recepción → corregido subiendo la fila).
- **`pnpm check`**: todo verde salvo dos fallos **ambientales y ajenos a C7** — el pool de workerd (`@cloudflare/vitest-pool-workers`) segfaulta en este contenedor sobre `tenants/demo/reset.test.ts` (fichero **no tocado**), y el test de rate-limit de usuarios de la API (pre-existente, PROGRESS sesión 24) parpadea bajo carga paralela. Cada suite afectada pasa **en aislamiento**: API **65/65**, `@logic-camp/ui` **26/26**, `@logic-camp/config` **22/22**, `@tenant/demo` seed **11/11**.

**Diferido con motivo** (BACKLOG): crear reserva arrastrando sobre celda libre del plano (es C1.2) y crear bloqueos desde el plano (C4.4). El plano de C7 lee y navega; todavía no crea.
