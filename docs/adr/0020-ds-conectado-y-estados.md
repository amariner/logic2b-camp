# 0020 — El design system conectado y los estados (Frente C, fases C2 + C3)

- **Fecha**: 2026-07-20
- **Fase**: Frente C — C2 (DS completo y conectado) + C3 (estados y microinteracción), como **un solo objetivo**
- **Estado**: **aceptado e implementado** (2026-07-20 — Andreu: "me parece bien tu propuesta continua con el proyecto"). Incluye la tercera vía de §4 (modo oscuro ordenado detrás de C1.5). Ver §Resultado medido al final.

## Contexto

C0 (ADR 0019) dejó el terreno listo: hay HMR en `:5173` y el planning se ve lleno (346 reservas a la vista, agosto al 86%). Verificado en vivo al abrir esta sesión.

C2 y C3 van juntos **a propósito, no por comodidad**: son las dos mitades de un mismo cambio.

- Sin `skeleton`, `toast` y `alert-dialog` en el DS, **C3 no se puede hacer**: los estados que pide C3 son, literalmente, componentes que hoy no existen.
- C2 sin C3 **no se ve**: migrar 43 `<button>` a `<Button>` produce un diff enorme y una pantalla que parece la misma. El retorno visual de C2 lo cobra C3.

Hacerlos por separado significa tocar los mismos 16 ficheros dos veces. Se hacen a la vez.

### Lo que está medido (no opinado)

Verificado en el repo al abrir la sesión:

| Hecho | Medida |
|---|---|
| `<button>` crudos en `apps/dashboard` | **43** en 16 ficheros |
| Usos de `<Button>`/`<Card>`/`<Badge>` del DS | **0** |
| Dependencias de Radix en `packages/ui` | **0** — el bloqueo de fondo |
| Claves `*.cargando` renderizadas como `<p>` | **12** |
| Skeletons · spinners · error boundaries · toasts | **0 · 0 · 0 · 0** |
| `useState<{text, error}>` duplicado a mano | **6 ficheros** |
| Usos del vocabulario viejo (`pino`/`arena`/`tinta`/`hueso`/`mar`) | **352** |
| Script `test` en `packages/ui` | **no existe** |

### Los dos bugs, verificados — y ninguno es lo que parecía

**C-BUG-1 no es "un token mal": son los 5 desplazados, y arreglarlo cambia el planning.**

`packages/ui/src/theme.css:33-37` (`:root`, light) contiene exactamente la **columna dark** de `BRAND.md` §4. Comprobado valor a valor:

| token | `:root` hoy | BRAND light (correcto) | BRAND dark |
|---|---|---|---|
| `--chart-1` | `64.6% .222 41.116` | `48.8% .243 264.376` | ← lo de hoy |
| `--chart-4` | `82.8% .189 84.429` | `62.7% .265 303.9` | ← lo de hoy |

Y aquí está lo que no era obvio: **`--chart-4` pinta las barras `pending` del planning** (`styles.css`, `.lc-bar.st-pending`). Hoy es ámbar y funciona. El valor correcto de BRAND es **morado** (`62.7% .265 303.9`) — y además con `color: var(--foreground)` (texto negro encima) a esa luminosidad **no pasa AA**.

O sea: *arreglar el bug tal cual rompe el planning*. Ese es el hallazgo. Ver decisión 2.

Complementos del mismo bug: falta `--radius-2xl: 1rem` (BRAND §5 lo pide), y el bloque `.dark` **no declara ningún `--chart-*`** — en oscuro los charts heredarían los de `:root`, que es precisamente por lo que nadie notó que estaban cambiados.

**C-BUG-2 no es un alias mal apuntado: es un token con dos significados.**

`apps/dashboard/src/styles.css:18` — `--color-mar: var(--foreground)`, así que `text-mar` se pinta en negro. Pero al contar los 44 usos de `mar` aparece que **no todos son errores**:

- **error / importe negativo / aviso** → la mayoría (`Planning.tsx:357`, `BookingPanel.tsx:161`, `Login.tsx:54`…)
- **enlace** `mailto:`/`tel:` → **4 usos** con `underline` (`Clientes.tsx:69,76`, `Solicitudes.tsx:147,153`)

Apuntar `--color-mar` a `--destructive` arregla los errores y **pinta los enlaces de contacto en rojo**. El token está sobrecargado desde ADR 0008; el arreglo correcto no es reapuntarlo, es **separarlo por significado**.

## Decisión

Seis decisiones. La 4 es la única que pido decidir a Andreu antes de tocar código.

---

### 1. Radix: alcance acotado, no los 21 primitivos de la lista

El contrato (`FRENTE-C-ACABADO.md` C2) lista 21 primitivos. **No se instalan los 21.** Se instala lo que C2+C3 usan *en esta sesión*, y el resto se declara con su fase.

**Se instala ahora** (12 paquetes Radix + 1 de toast, versiones verificadas hoy contra el registro):

| paquete | versión | lo usa |
|---|---|---|
| `@radix-ui/react-slot` | `1.3.0` | `asChild` en `Button` — base de todo lo demás |
| `@radix-ui/react-dialog` | `1.1.20` | `dialog` + `sheet` (el panel lateral de la ficha) |
| `@radix-ui/react-alert-dialog` | `1.1.20` | **C3** — confirmación de acciones destructivas |
| `@radix-ui/react-dropdown-menu` | `2.1.21` | menús de fila (reservas, pagos, solicitudes) |
| `@radix-ui/react-popover` | `1.1.20` | filtros del planning |
| `@radix-ui/react-tooltip` | `1.2.13` | densidad: iconos sin etiqueta |
| `@radix-ui/react-select` | `2.3.4` | los `<select>` crudos de filtros |
| `@radix-ui/react-label` | `2.1.12` | accesibilidad de formularios |
| `@radix-ui/react-separator` | `1.1.12` | estructura de paneles |
| `@radix-ui/react-tabs` | `1.1.18` | ficha de reserva e informes |
| `@radix-ui/react-switch` | `1.3.4` | los toggles de Ajustes |
| `@radix-ui/react-checkbox` | `1.3.8` | selección en tablas |
| `sonner` | `2.0.7` | **C3** — toasts con "Deshacer" |

Sin Radix (son CSS + markup nuestro): `skeleton`, `table`, `input`, `card`, `badge`, `button`, `empty-state`, `spinner`.

**Se declara y NO se instala**, con motivo:

| primitivo | por qué no ahora |
|---|---|
| `cmdk` (⌘K) | El contrato lo sitúa en **C4**, no en C2. Instalarlo sin la búsqueda detrás es peso muerto. |
| `calendar` / `date-picker` | Arrastra una librería de fechas y **una decisión de dominio** (`date_to` exclusive, UTC, sin zona). Merece su propio ADR, no un renglón de este. |
| `form` (react-hook-form) | Dependencia grande y los formularios de hoy son cortos y funcionan. Sin justificación medida. |
| `scroll-area` | El planning está **virtualizado**; interponer un scroll custom entre el virtualizador y el scroll nativo es pedir un bug de rendimiento a cambio de una barra más bonita. |
| `avatar` | Cero usos reales. No hay fotos de usuario en el producto. |
| `vaul` (drawer móvil) | El `sheet` de `react-dialog` cubre el caso; revisar en el remate móvil (BACKLOG B1). |

**Por qué paquetes sueltos y no `radix-ui` (el meta-paquete).** Los sueltos dejan el árbol de dependencias legible y permiten que el bundle del dashboard crezca solo por lo que se usa. El dashboard es una SPA privada tras login (el presupuesto de bytes duro es el **nivel 1**, que no incluye dashboard ni React), pero eso no es excusa para arrastrar 21 paquetes sin usar.

---

### 2. C-BUG-1: arreglar los 5 tokens **y** desacoplar el planning de ellos

Los dos hechos a la vez: los tokens de BRAND están mal, y el planning no puede depender directamente de un token de gráfica cuyo valor correcto es morado.

**2.1 — Se corrigen los 5 `--chart-*` de `:root` a los valores light de BRAND §4.** Se añade `--radius-2xl: 1rem`. Se añade el bloque `--chart-*` que falta en `.dark` con los valores dark de BRAND.

**2.2 — El planning deja de leer `--chart-*` y pasa a leer tokens semánticos propios.** Se introduce una capa de nombres con significado operativo:

```css
/* estado de reserva → color. El planning y (futuro) el plano leen SOLO de aquí. */
--lc-status-confirmed: …;
--lc-status-pending:   …;
--lc-status-no-show:   …;
--lc-status-completed: …;
--lc-status-blocked:   …;
```

**Con los valores de hoy**, para que este ADR no cambie ni un píxel del planning: `--lc-status-pending` conserva el ámbar actual (`oklch(82.8% .189 84.429)`) escrito como valor propio, no como `var(--chart-4)`.

**Por qué es lo correcto y no un parche.** `BRAND.md` §4 dice que el color solo entra por los `--chart-*` — y eso sigue valiéndose: los `--lc-status-*` **salen** de esa familia, pero el planning no se ata al *índice* de una escala de gráficas. Un tape chart no necesita "el color 4", necesita "el color de pendiente de pago". Hoy están acoplados por accidente, y ese accidente es exactamente el mecanismo por el que un bug de tokens llegó a la pantalla firma del producto.

Y deja **C1.5 limpio**: cuando toque decidir el mapa de color definitivo (incluido "en casa" tras C4), se cambian 5 valores en un sitio, sin tocar CSS de barras ni de chips ni el futuro plano de C7. Ahora mismo esos colores están escritos **dos veces** (`.lc-bar.st-*` y `.lc-chip.st-*`); esta capa los unifica de paso.

**Este ADR NO decide el mapa de color final.** Eso es C1.5. Aquí solo se construye el sitio donde vivirá y se mantiene el aspecto actual.

---

### 3. C-BUG-2: separar el token sobrecargado y **cerrar el rename**

**3.1 — `mar` se parte en dos por significado**, revisando los 44 usos uno a uno (no con un `sed`):

- error / aviso / importe negativo → `--destructive` (token semántico real del DS)
- enlace de contacto (`mailto:`/`tel:`, 4 usos) → color de enlace propio, **no** destructive

**3.2 — Se cierra el rename completo de la paleta camping.** Los 352 usos del vocabulario viejo pasan a los nombres del DS (`bg-pino` → `bg-primary`, `text-tinta-suave` → `text-muted-foreground`, …) y **el bloque de alias de `styles.css:10-20 desaparece**.

Por qué terminarlo ahora y no dejarlo en BACKLOG: mientras el puente exista, C-BUG-2 **puede repetirse** — cualquier alias mal apuntado vuelve a producir un color absurdo sin que nada falle. Además ya voy a tocar los 16 ficheros para migrar los botones; hacerlo dos veces es el desperdicio que la restricción de 6h/semana prohíbe.

Riesgo asumido: es el cambio más ancho de la sesión. Mitigación: va en **su propio commit mecánico**, separado de los cambios de comportamiento, para que sea revisable y reversible solo.

---

### 4. ⚠️ Modo oscuro: **no se decide aquí — se decide después de C1.5**

El contrato dice "o se conecta o se retira, no dejarlo a medias". **Propongo una tercera vía y es la única decisión de este ADR que quiero validada explícitamente.**

- **Retirarlo** contradice `BRAND.md`, que especifica los 25 tokens `.dark` como parte del contrato de marca. Borrarlos es tirar una decisión de marca ya tomada.
- **Conectarlo ahora** significa auditar 11 pantallas en oscuro. Y su superficie más difícil son exactamente **las barras del planning**, cuyo mapa de color **aún no está decidido** (es C1.5). Conectarlo hoy es decidir el color oscuro dos veces.
- **Lo que propongo**: completar el bloque `.dark` (los `--chart-*` que faltan, decisión 2.1) para que **deje de estar roto**, y conectar toggle + `prefers-color-scheme` **inmediatamente después de C1.5**, cuando los `--lc-status-*` tengan dueño y solo haya que darles su variante oscura.

No es "a medias": es ordenarlo detrás de la decisión de la que depende. Pero es tu llamada — **si prefieres el toggle en esta sesión, dilo y entra**, a cambio de recortar en otro sitio (probablemente el rename de 3.2).

---

### 5. C3: qué entra y qué no

**Entra** — las piezas transversales que suben las 11 pantallas a la vez:

- **Skeletons con la forma real del contenido** (no un rectángulo gris) sustituyendo los 12 `<p>Cargando…</p>`. Se reutiliza el criterio del mostrador de la web, que ya lo hace bien con `aria-busy`.
- **Error boundary por ruta** (hoy: 0; un throw en render = pantalla en blanco). Mensaje humano + "reintentar" + vuelta al planning.
- **Errores de query diferenciados**: 401 (sesión caducada → login sin perder el contexto), 403 (sin permiso, explicando el rol), 500 (reintentar). Hoy los tres son el mismo `<p>`.
- **Toasts (`sonner`)** sustituyendo el `useState<{text,error}>` de los 6 ficheros, con acción **"Deshacer"** donde el backend ya lo permite.
- **Confirmación en toda acción destructiva** con `alert-dialog`. Hoy solo confirma una (doble click en Cancelar, `BookingPanel.tsx:387`): **el reembolso no confirma** (`:340`), dar de baja una unidad no confirma, guardar tarifas no confirma.
- **Estados vacíos** con ilustración discreta y salida (CTA), sobre los 8 mensajes que ya existen en `i18n.ts`.
- **Foco y teclado**: el `focus-visible: ring-[3px]` de shadcn es mejor que el `outline` actual; que no se pierda en la migración.
- **`prefers-reduced-motion`** en toda animación nueva (la web ya lo respeta; el dashboard debe igualarlo).

**No entra — se difiere con motivo:**

- **Rutas direccionables** (`/reservas/$id`, `/clientes/$id`). Es lo único de la lista de C3 que **no es un estado**: es un refactor del router y del panel lateral. Y su valor real ("enviar una reserva por email a un compañero") se cobra junto a la **navegación de ⌘K**, que es C4. Va a C4.

---

### 6. Tests: `packages/ui` estrena runner

Hoy `packages/ui` **no tiene script `test`** — los 4 componentes existentes nunca se probaron, pese a lo que dice el contrato. Los primitivos nuevos necesitan test de render, así que se añade:

- `vitest` + `jsdom` + `@testing-library/react` como devDeps de `packages/ui`
- script `"test": "vitest run"` (mismo patrón que `packages/core`)
- un test de render por primitivo, **más los 4 que hoy no tienen ninguno**

Efecto en el pipeline: `pnpm check` pasa de **41 a 42 tareas**.

## Consecuencias

**Buenas**

- Las 11 pantallas suben de nivel a la vez: es la mejor relación esfuerzo/percepción del Frente C.
- El DS deja de ser decorativo. A partir de aquí, una mejora en `packages/ui` llega a todo el dashboard sin tocar pantallas.
- Se elimina el puente de tokens: no vuelve a haber un alias capaz de pintar un error en negro.
- C1 hereda `toast` con "Deshacer", que es exactamente lo que C1.4 necesita y hoy no tiene.
- C7 (plano) hereda los `--lc-status-*`: plano y planning **no podrán** divergir de color, que era el riesgo declarado.

**Costes y riesgos**

- **14 dependencias nuevas** en `packages/ui`. Es el precio de las primitivas; el contrato lo identifica como el bloqueo de fondo y no hay atajo.
- **Diff muy ancho** (16 ficheros × botones + 352 usos de token). Mitigado partiendo en commits: (a) DS y primitivos, (b) bugs y tokens, (c) rename mecánico, (d) estados.
- **La densidad es requisito, no adorno.** Los componentes shadcn por defecto son más aireados que la UI actual. Se ajustan tamaños a la densidad de hoy y **se verifica a 1366px en el navegador**, no de memoria.
- El planning es la pantalla con más riesgo de regresión de rendimiento. Se verifica con el seed denso (346 reservas), que para eso está.

## Alternativas descartadas

- **Solo C2, sin C3.** Diff enorme sin cambio visible. Vender un producto no mejora porque los botones estén mejor construidos.
- **Solo C3, sin C2.** Habría que escribir a mano `skeleton`/`toast`/`alert-dialog` en el dashboard y volver a moverlos al DS después. Trabajo hecho dos veces.
- **Arreglar C-BUG-1 tal cual** (chart-4 → morado). Rompe el planning y falla AA. Ver decisión 2.
- **Reapuntar `--color-mar` a `--destructive`.** Pinta de rojo los 4 enlaces de contacto. El token está sobrecargado; se separa.
- **Dejar el rename en BACKLOG.** El puente es el mecanismo que produjo C-BUG-2; y ya toco esos ficheros.
- **Instalar los 21 primitivos.** 6 no tienen ningún uso en esta sesión, y 2 (`calendar`, `form`) arrastran decisiones que merecen su propio ADR.

## Qué queda fuera (y en qué fase se cobra)

| Diferido | Fase |
|---|---|
| Toggle de modo oscuro + `prefers-color-scheme` | tras **C1.5** (ver decisión 4) |
| Mapa de color definitivo de estado (incluido "en casa") | **C1.5** |
| ⌘K / `cmdk` y búsqueda global | **C4** |
| Rutas direccionables `/reservas/$id`, `/clientes/$id` | **C4** |
| `calendar` / `date-picker` | ADR propio |
| `form` / react-hook-form | sin justificación medida |

## Criterio de "hecho" de esta sesión

1. **0 `<button>` crudos** en `apps/dashboard` (hoy 43) — verificable con `grep`.
2. **0 `<p>Cargando…</p>`**: las 11 pantallas con skeleton de la forma del contenido.
3. **0 usos del vocabulario viejo** de tokens; el bloque de alias de `styles.css` eliminado.
4. Un throw en render **no deja pantalla en blanco** en ninguna ruta — probado provocándolo.
5. Toda acción destructiva confirma; los reembolsos también.
6. `--chart-*` de `:root` coinciden con `BRAND.md` §4 light, y **el planning se ve igual que antes** de tocarlos.
7. Los 4 enlaces `mailto:`/`tel:` **no** están en rojo, y los errores **sí** se distinguen del texto normal.
8. `pnpm check` verde (42 tareas) y **verificación visual en el navegador a 1366px y 375px**, no solo tests.
