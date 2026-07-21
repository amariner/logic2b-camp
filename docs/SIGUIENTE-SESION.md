# Prompt para la siguiente sesión — Frente C

> Reescrito al cerrar la sesión 32 (2026-07-21, C7 · plano del camping, ADR 0021).
> Cuando la próxima sesión termine, **reescribe este fichero** con el prompt de la siguiente.

---

## Estado en una línea

Frente C: **C0 ✅ · C2+C3 ✅ · C7 ✅**. Quedan **C1** (gestos horizontales del planning), **C4** (workflow de recepción), **C5** (fotos, cuesta créditos Higgsfield) y **C6** (documentación).

## ▶ Prompt para pegar

```
Continuamos con el Frente C de Logic Camp (acabado profesional, prioridad visual
en modo fake). Lee primero PROGRESS.md, CLAUDE.md, docs/ROADMAP.md y
docs/FRENTE-C-ACABADO.md (el contrato del frente).

Hecho ya: C0 (HMR + seed denso, ADR 0019), C2+C3 (DS conectado + estados, ADR
0020) y C7 (plano del camping, ADR 0021 — geometría en modules.plano vía
GET /api/admin/map, CampingMap SVG con pan/zoom, salto plano↔planning).

El objetivo de ESTA sesión es C4 — workflow real de recepción. Es el hueco de
DOMINIO que queda (no solo de UI):

1. Check-in / check-out: HOY NO EXISTE ni en cliente ni en API. TRANSITIONS
   (apps/api/src/routes/admin.ts) solo tiene confirm/cancel/no_show/complete.
   DECISIÓN DE ADR: ¿estado `in_house` en la máquina de estados, o campo
   `checked_in_at` sobre la reserva? Afecta a TRANSITIONS, al color del planning
   y del plano ("en casa"), y a los informes. El plano de C7 ya tiene sitio para
   un estado más: unitStateOn en packages/config sabe pintar por estado.
2. Huéspedes y documentos editables (hoy la ficha solo los MUESTRA) — sin esto
   no hay parte de viajeros, requisito legal en un camping español.
3. "Cobrar todo lo pendiente" (hoy hay que teclear la cifra a mano) y crear
   bloqueos desde la UI (planning Y plano los PINTAN pero no hay forma de crear).
4. ⌘K (cmdk, ya declarado para C4 en ADR 0020): buscar reserva/huésped/unidad y
   saltar. cmdk NO se instaló en C2 a propósito, se instala aquí.
5. Rutas direccionables /reservas/$id y /clientes/$id: C3 las dejó EXPLÍCITAMENTE
   para esta sesión (una reserva no se puede enviar por email a un compañero hoy).
   El search-param de C7 (date/unit en /plano y /) es el patrón a seguir.

Sigue el contrato: ADR primero (0022) — y como esta es sesión autónoma, aplica
tu criterio y NO PARES hasta cerrarlo, igual que en C7. Una sesión = una fase.
`pnpm check` verde antes de cerrar (ojo: en el contenedor cloud el pool de
workerd puede segfaultar sobre reset.test.ts y el rate-limit de la API parpadea
bajo carga — verifica cada suite EN AISLAMIENTO si el check completo falla por
eso). Cierra con /session-close.
```

---

## Orden recomendado a partir de aquí

1. **C4 — workflow de recepción** ← *siguiente*. Es el único hueco de **dominio** que queda (check-in). Todo lo demás del frente es pulido de UI sobre cosas que ya funcionan. Y desbloquea el color "en casa" que el planning y el plano (C7) ya pueden pintar.
2. **C1 — gestos horizontales del planning** (mover/estirar fechas arrastrando, crear arrastrando, línea de "hoy"). Ya hereda de C3 el toast con Deshacer. Es profundo pero afecta a una sola pantalla.
3. **C5 — fotos** (Higgsfield, cuesta créditos: **fijar prompts y confirmar la tanda con Andreu antes de generar**). Las capturas del planning/plano para la landing ya se pueden hacer (seed denso + plano en sitio).
4. **C6 — documentación** (absorbe B4): guía recepcionista / dueño / ficha técnica, con marca Logic2B. Cero-riesgo, sin credenciales.

## Cosas que hay que saber antes de tocar nada

- **`pnpm db:reset` hace `rm -rf .wrangler-demo`** → reinicia el Worker después.
- **El dashboard necesita el flag de dev**: `wrangler dev … --var LOGIC_CAMP_DEV_ORIGINS:1` (ya en `.claude/launch.json`). Sin él, login 403 en `:5173`.
- **Credenciales del seed** (contraseña `calasereno`): `direccion@` / `gerencia@` / `recepcion@` / `consulta@calasereno.example`.
- **Cero mocks en el cliente** — propiedad del proyecto. "Modo fake" se resuelve en el seed.
- **El seed debe seguir siendo determinista** (el reset nocturno depende de ello).
- **Verificación visual sin workerd**: si el contenedor no levanta wrangler, se puede renderizar SVG/HTML desde las funciones puras con Playwright/chromium (`/opt/pw-browsers`, `executablePath` + `--no-sandbox`), como se hizo con el plano en C7.
- **El plano (C7) ya tiene `unitStateOn`** en `packages/config`: cuando C4 defina "en casa", añadir ese `kind` ahí y el plano lo pinta con un token nuevo (una línea).

## Decisiones abiertas que bloquean ADRs

- **C4** — check-in: ¿estado `in_house` o campo `checked_in_at`? (afecta a TRANSITIONS, planning, plano, informes).
- **C1** — modo oscuro: sigue detrás de C1.5 (el mapa de color definitivo del planning). Los `.dark` ya no están rotos, pero no hay toggle.
- **B-ii** — documentación: herramienta y audiencia (afecta a C6).
