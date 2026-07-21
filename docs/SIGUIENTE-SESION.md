# Prompt para la siguiente sesión — Frente C

> Reescrito al cerrar la sesión 33 (2026-07-21, C4 · workflow de recepción, ADR 0022).
> Cuando la próxima sesión termine, **reescribe este fichero** con el prompt de la siguiente.

---

## Estado en una línea

Frente C: **C0 ✅ · C2+C3 ✅ · C7 ✅ · C4 ✅**. Quedan **C1** (gestos horizontales del planning), **C5** (fotos, cuesta créditos Higgsfield) y **C6** (documentación). El check-in ya existe y el mapa de color está completo (incluido "en casa").

## ▶ Prompt para pegar

```
Continuamos con el Frente C de Logic Camp (acabado profesional, prioridad visual
en modo fake). Lee primero PROGRESS.md, CLAUDE.md, docs/ROADMAP.md y
docs/FRENTE-C-ACABADO.md (el contrato del frente).

Hecho ya: C0 (HMR + seed denso, ADR 0019), C2+C3 (DS conectado + estados, ADR
0020), C7 (plano del camping, ADR 0021) y C4 (workflow de recepción, ADR 0022 —
check-in como campo checked_in_at, huéspedes editables, cobrar todo, bloqueos
desde la UI, ⌘K, rutas /reservas/$id y /clientes/$id, token --lc-status-inhouse).

El objetivo de ESTA sesión es C1 — el planning como pieza de exhibición. Es el
elemento firma declarado y hoy es sólido de ingeniería (virtualización, DnD
vertical, optimista con rollback, teclado) pero POBRE de gesto:

1. Gesto HORIZONTAL: mover la estancia arrastrando (cambia dateFrom/dateTo
   manteniendo noches) y estirar por los bordes (resize handles) — EL gesto de
   un tape chart. El precio lo recalcula SIEMPRE el servidor (regla dura): al
   soltar, re-cotizar y enseñar el nuevo desglose antes de confirmar si cambia.
   Rechazo visible y explicado si el destino solapa. Feedback en vivo (fechas +
   nº de noches flotando junto al cursor).
2. Crear arrastrando sobre celdas LIBRES → alta con esas fechas+unidad
   precargadas (es C1.2; también resuelve el diferido de C7/C4 "crear desde el
   plano"). Arrastrar desde la bandeja "sin asignar" a una fila.
3. Orientación: línea vertical de "HOY", indicador de continuación cuando una
   barra se sale por el borde, franja de temporada en la cabecera, filtros por
   tipo/estado y búsqueda DENTRO del planning.
4. C1.5 — el mapa de color DEFINITIVO sobre --lc-status-* (hoy los valores son
   provisionales): ya están confirmada/en casa/pendiente/completada/no-show/
   bloqueada; decidir el mapa final con AA verificado, y con ello desbloquear el
   MODO OSCURO (detrás de C1.5 desde ADR 0020).
5. Rendimiento: virtualizar también el eje horizontal (hoy un <div> de finde por
   celda × fila; 83 uds × 92 días en zoom Temporada es mucho nodo).

Sigue el contrato: ADR primero (0023) — y como esta es sesión autónoma, aplica
tu criterio y NO PARES hasta cerrarlo, igual que en C7/C4. Una sesión = una fase.
`pnpm check` verde antes de cerrar (ojo: en el contenedor cloud el pool de
workerd segfaulta sobre reset.test.ts y el rate-limit de la API parpadea bajo
carga — el `pnpm check` completo cae por eso; verifica cada suite EN AISLAMIENTO).
Cierra con /session-close.
```

---

## Orden recomendado a partir de aquí

1. **C1 — el planning como pieza de exhibición** ← *siguiente*. Es el elemento firma declarado y el único que aún no está a la altura. Afecta a una sola pantalla pero es profundo. Ya hereda todo lo que le hacía falta: toast con Deshacer (C3), el mapa de color con "en casa" (C4), y el seed denso (C0.2). Incluye **C1.5** (mapa de color definitivo) que a su vez **desbloquea el modo oscuro**.
2. **C5 — fotos** (Higgsfield, cuesta créditos: **fijar prompts y confirmar la tanda con Andreu antes de generar**). Las capturas del planning/plano para la landing ya se pueden hacer (seed denso + plano + check-in en sitio).
3. **C6 — documentación** (absorbe B4): guía recepcionista / dueño / ficha técnica, marca Logic2B. Cero-riesgo, sin credenciales. Con C4 hecho, la guía de recepcionista ya tiene el flujo completo que documentar (llegada → check-in → cobro → check-out).

## Cosas que hay que saber antes de tocar nada

- **`pnpm db:reset` hace `rm -rf .wrangler-demo`** → reinicia el Worker después.
- **El dashboard necesita el flag de dev**: `wrangler dev … --var LOGIC_CAMP_DEV_ORIGINS:1` (ya en `.claude/launch.json`). Sin él, login 403 en `:5173`.
- **Credenciales del seed** (contraseña `calasereno`): `direccion@` / `gerencia@` / `recepcion@` / `consulta@calasereno.example`.
- **Cero mocks en el cliente** — propiedad del proyecto. "Modo fake" se resuelve en el seed.
- **El seed debe seguir siendo determinista** (el reset nocturno depende de ello). El check-in de demo (C4) se estampa sobre el ancla `Y-07-15`, no sobre "hoy" real — misma convención que `completed/confirmed` (ADR 0019 §2, limitación de ancla ya declarada en ADR 0013).
- **Verificación visual sin workerd**: si el contenedor no levanta wrangler, se puede renderizar SVG/HTML desde las funciones puras / con los tokens compilados (`apps/dashboard/dist/assets/index-*.css`) usando Playwright/chromium (`/opt/pw-browsers`, `require()` desde `node_modules/.pnpm/playwright@*/…`, `executablePath` + `--no-sandbox`), como se hizo con el plano (C7) y el mapa de color (C4).
- **El check-in es un campo, no un estado** (ADR 0022): "en casa" se deriva de `checked_in_at && !checked_out_at`. Si C1.5 toca el color de "en casa", el token es `--lc-status-inhouse` (packages/ui/theme.css).

## Decisiones abiertas que bloquean ADRs

- **C1.5** — el mapa de color definitivo del planning (hoy los `--lc-status-*` son provisionales). Su superficie más difícil son las barras. Decidirlo desbloquea el **modo oscuro** (el bloque `.dark` ya no está roto, pero no hay toggle ni detección).
- **C1** — rendimiento del eje horizontal: ¿virtualizar también las columnas, o basta con no pintar el sombreado de finde por celda?
- **B-ii** — documentación: herramienta y audiencia (afecta a C6).
