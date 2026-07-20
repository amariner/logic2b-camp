# Prompt para la siguiente sesión — Frente C

> Escrito al cerrar la sesión 30 (2026-07-20). Copia el bloque de abajo tal cual al abrir la sesión siguiente.
> Cuando esa sesión termine, **reescribe este fichero** con el prompt de la siguiente.

---

## ▶ Prompt para pegar

```
Continuamos con el Frente C de Logic Camp (acabado profesional, prioridad visual
en modo fake). Lee primero PROGRESS.md, CLAUDE.md, docs/ROADMAP.md y sobre todo
docs/FRENTE-C-ACABADO.md, que es el contrato de este frente.

Contexto: C0 está hecho (ADR 0019) — ya hay HMR en el dashboard y el seed es
denso, así que el planning se ve lleno (346 reservas a la vista, agosto al 86%).

El objetivo de ESTA sesión es C2 + C3 juntos, como un solo objetivo:
"el design system conectado y los estados". Van juntos a propósito: sin
skeleton/toast/alert-dialog en el DS, C3 no se puede hacer bien, y C2 sin C3
no se nota en pantalla.

Sigue el contrato del proyecto: ADR primero (0020) y PARA a esperar mi
validación antes de escribir código. Una sesión = una fase. `pnpm check` verde
antes de cerrar, y cierra con /session-close.

Dos apuntes para el ADR:
- El bloqueo de fondo de C2 es que packages/ui NO tiene ninguna dependencia de
  Radix. Decide en el ADR el alcance exacto (qué paquetes, versiones).
- Aprovecha y arregla C-BUG-1 y C-BUG-2, que son baratos y caen dentro de C2.

Levanta el dev antes de empezar (api + dashboard) y verifica visualmente contra
el navegador, no solo con tests.
```

---

## Orden recomendado a partir de aquí

Razonado, no arbitrario — cada paso desbloquea al siguiente.

### 1. **C2 + C3** — el DS conectado y los estados ← *siguiente sesión*

**Por qué primero**: es lo más ancho. Sube las 11 pantallas a la vez, mientras que el resto son mejoras profundas en pocas pantallas. Con prioridad visual declarada, lo transversal va antes.

- Meter **Radix** en `packages/ui` (es el bloqueo de fondo: sin primitivas no hay dialog/sheet/popover/toast/⌘K).
- Primitivos por orden de uso real: `skeleton` · `toast`(sonner) · `dialog` · `alert-dialog` · `sheet` · `table` · `input` · `label` · `select` · `dropdown-menu` · `popover` · `tooltip` · `command`.
- Migrar los **41 `<button>` crudos** a `<Button>`. Criterio de hecho: **0 `<button>` crudos**.
- Skeletons con la forma real del contenido · **error boundaries** por ruta (hoy 0: un throw = pantalla blanca) · toasts con **deshacer** · confirmación en **toda** acción destructiva (hoy solo hay una; el reembolso no confirma).
- **Rutas direccionables** (`/reservas/$id`): hoy no hay una sola ruta con parámetro, así que una reserva no se puede enviar por email a un compañero.
- Cerrar el rename de la paleta camping y **decidir el modo oscuro** (existen 25 tokens `.dark` sin toggle: código muerto — o se conecta o se retira).
- **C-BUG-1** y **C-BUG-2** caen aquí.

### 2. **C1** — el planning como pieza de exhibición

**Por qué después de C3**: necesita toasts para el "deshacer" de C1.4. Hacerlo antes obliga a rehacerlo.

- El gesto que falta: **mover y estirar fechas arrastrando en horizontal** (re-cotizando siempre en servidor).
- **Crear reserva arrastrando** sobre celdas vacías, y arrastrar desde la bandeja "sin asignar".
- **Línea de "hoy"**, indicador de continuación, franja de temporada.
- **C1.5 — el mapa de color por estado** desde `--chart-*`. Ojo: esto **condiciona C7**.

### 3. **C4** — workflow real de recepción

- **Check-in**: no existe ni en cliente ni en API (`TRANSITIONS` solo tiene confirm/cancel/no_show/complete). Decisión de dominio en el ADR: ¿estado `in_house` o campo `checked_in_at`?
- **Huéspedes y documentos** editables — sin esto no hay parte de viajeros (requisito legal en un camping español).
- "Cobrar todo lo pendiente" (hoy hay que teclear la cifra a mano), crear bloqueos desde la UI, **⌘K**.

### 4. **C7** — plano del camping

**Por qué aquí y no antes**: necesita el mapa de color de C1.5, o el plano y el planning no se parecerán — que es peor que no tener plano. Y necesitaba el seed denso de C0 (un plano con todo libre no enseña nada).

- Base: `gestor-reservas/src/lib/components/camping-map.svelte` (**no** está en `logic2b-norte`).
- Es **reescritura a React**, no copy-paste: se reutiliza el modelo y la geometría, que es la parte cara.
- Decisión de fondo del ADR: **dónde vive la geometría** (inclinación: `tenants/{slug}/`, no columna en D1 — así no hay que migrar la D1 de todos los tenants).
- Corregir los dos defectos del original: constantes duplicadas y decorado del recinto cableado. Añadir pan/zoom (no lo trae).

### 5. **C5** — fotos (Higgsfield) · 6. **C6** — documentación

- C5: 4 ficheros que el código **ya referencia** y no existen (`ut_prem` y `ut_moto` enseñan foto de parcela; galerías de 1 sola imagen). **Fijar prompts y confirmar la tanda antes de generar** — cuesta créditos. Capturas del planning para la landing: ya se pueden hacer, el planning está lleno.
- C6: guía de recepcionista (la usuaria real es la de 55 años), guía de dueño, ficha técnica. Absorbe B4.

---

## Cosas que hay que saber antes de tocar nada

- **`pnpm db:reset` hace `rm -rf .wrangler-demo`** → reinicia el Worker después, o queda apuntando a un directorio borrado y devuelve 500.
- **El dashboard necesita el flag de dev**: `wrangler dev … --var LOGIC_CAMP_DEV_ORIGINS:1`. Ya está en `.claude/launch.json`. Sin él, login 403 en `:5173`. Ver `apps/dashboard/README.md`.
- **Credenciales del seed** (contraseña `calasereno`): `direccion@` / `gerencia@` / `recepcion@` / `consulta@calasereno.example`.
- **Cero mocks en el cliente** — es una propiedad del proyecto, no un accidente. "Modo fake" se resuelve en el seed.
- **El seed debe seguir siendo determinista**: el reset nocturno de la demo depende de ello.

## Decisiones abiertas que bloquean ADRs

- **C7** — dónde vive la geometría del plano (D1 vs `tenants/{slug}/`).
- **C2** — modo oscuro: ¿se conecta o se retira?
- **B-ii** — documentación: herramienta y audiencia (afecta a C6).
- **B-v** — ¿el dashboard de un tenant puede teñir `--primary` con su color, o se queda neutro Logic2B?
