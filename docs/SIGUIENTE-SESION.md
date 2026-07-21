# Prompt para la siguiente sesión — Frente C

> Reescrito al cerrar la sesión 35 (2026-07-21, C5 · materia: fotos e imagen, ADR 0024).
> Cuando la próxima sesión termine, **reescribe este fichero** con el prompt de la siguiente.

---

## Estado en una línea

Frente C: **C0 ✅ · C2+C3 ✅ · C7 ✅ · C4 ✅ · C1 ✅ · C5 🟨 PARCIAL**. Queda **C6** (documentación, absorbe B4) — la **última fase del frente**. C5 se cerró casi entero: capturas reales del producto y OG image hechas; lo único pendiente es descargar 6 fotos ya generadas, bloqueado por red del contenedor (script listo).

## ▶ Prompt para pegar

```
Continuamos con el Frente C de Logic Camp (acabado profesional, prioridad visual
en modo fake). Lee primero PROGRESS.md, CLAUDE.md, docs/ROADMAP.md y
docs/FRENTE-C-ACABADO.md (el contrato del frente).

Hecho ya: C0 (ADR 0019), C2+C3 (ADR 0020), C7 (plano, ADR 0021), C4 (recepción,
ADR 0022), C1 (gestos del planning, ADR 0023) y C5 (fotos/imagen, ADR 0024 —
🟨 parcial: capturas reales del planning/plano y OG image de marca hechas;
las 6 fotos de camping (Higgsfield) ya están generadas pero pendientes de
descargar, bloqueado por red del contenedor — script listo en
tenants/demo/scripts/fetch-higgsfield-fotos.ts, `pnpm --filter @tenant/demo
fetch:fotos`. Si tienes salida a cloudfront.net en este contenedor, ejecútalo
primero y cierra C-BUG-5 del todo antes de seguir).

El objetivo de ESTA sesión es C6 — la documentación (absorbe B4), la ÚLTIMA
fase del Frente C:

1. Guía de la recepcionista: operar el gestor de principio a fin, lenguaje
   llano, una tarea por página. La usuaria real tiene 55 años. Con C4+C1
   hechos, el flujo completo ya existe (llegada → check-in → cobro → mover
   en el planning → check-out). Apóyate en FUNCIONALIDADES.md.
2. Guía del dueño: los 4 niveles (TIERS.md) como escalera — qué incluye cada
   uno, qué cambia al subir.
3. Ficha técnica para "el informático de confianza": dominios, DNS, correo,
   aislamiento por D1, RGPD, backups.
4. Decisión B-ii pendiente: herramienta y layout (páginas Astro propias vs
   Starlight vs reutilizar el layout de ui.logic2b.com). Decídela en el ADR
   (0025) con el criterio de siempre: ¿qué NO multiplica el trabajo por
   cliente? Marca Logic2B, alineado con el DS (packages/ui, docs/BRAND.md).
5. Enlazada desde la landing (apps/site, ya tiene la sección de niveles y el
   nav) y desde el dashboard (ayuda contextual — el "?" de cada pantalla →
   su sección).
6. `docs/img/captura-plano.webp` ya existe (sesión C5, ADR 0024) — úsalo en
   la guía de recepcionista/dueño en vez de generar una captura nueva.

Sigue el contrato: ADR primero. Sesión autónoma — aplica tu criterio y NO PARES
hasta cerrarlo, como en C7/C4/C1/C5. Una sesión = una fase. `pnpm check` verde
antes de cerrar (ojo: en el contenedor cloud el pool de workerd segfaulta sobre
reset.test.ts — el check completo cae por eso, 40/42; verifica cada suite EN
AISLAMIENTO, el propio workerd falla DESPUÉS de que los tests reales pasen).
Cierra con /session-close y reescribe docs/SIGUIENTE-SESION.md.

Con C6 cerrado, el Frente C completo queda: C0-C4 ✅, C1 ✅, C5 🟨 (bloqueo de
red, no de código), C6 ✅ — replantea entonces qué sigue en el roadmap (Frente
A/B ya cerrados salvo remates de BACKLOG, Fase 9/10 bloqueadas por
credenciales de Andreu).
```

---

## Orden recomendado a partir de aquí

1. **C6 — documentación** ← *única fase que queda*: cero-riesgo, sin credenciales, y con C1/C4/C5 cerrados hay flujo completo y capturas reales que documentar.
2. Si hay salida de red a `cloudfront.net` en el contenedor: correr `pnpm --filter @tenant/demo fetch:fotos` primero (2 minutos) y cerrar `C-BUG-5` del todo — no es bloqueante para C6, pero es gratis si la red está disponible.
3. **Remates de BACKLOG** si sobra sesión: "en casa" en `/reservas`, sidebar móvil off-canvas (Sheet ya existe), limpiar claves i18n huérfanas, fr/de/nl de la landing.

## Cosas que hay que saber antes de tocar nada

- **`pnpm db:reset` hace `rm -rf .wrangler-demo`** → reinicia el Worker después.
- **El dashboard necesita el flag de dev**: `wrangler dev … --var LOGIC_CAMP_DEV_ORIGINS:1` (ya en `.claude/launch.json`). Sin él, login 403 en `:5173`.
- **Credenciales del seed** (contraseña `calasereno`): `direccion@` / `gerencia@` / `recepcion@` / `consulta@calasereno.example`.
- **Cero mocks en el cliente** — propiedad del proyecto. "Modo fake" se resuelve en el seed.
- **Verificación sin workerd**: bundle real (`vite build`) + stub de API en memoria (node) + Playwright permite ejercitar gestos completos y capturar pantallas reales en el navegador (usado en C1 y C5). El stub vive solo en el scratchpad de la sesión, nunca en el repo. Chromium: `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, `--no-sandbox`.
- **El mapa de color tiene contrato de test** (`packages/ui/test/theme-contrast.test.ts`): cambiar un `--lc-status-*` sin AA rompe la suite.
- **El precio de mover fechas lo calcula el servidor** (`requote`/`move`, ADR 0023). Si alguna pantalla nueva quiere mover fechas, que reutilice esas rutas.
- **Modo oscuro**: clase `.dark` en `<html>`, decidida por el script inline de `index.html` + `ThemeToggle` (localStorage `lc-theme`). La landing y la web de tenant NO tienen modo oscuro.
- **Red bloqueada a `cloudfront.net`**: confirmado en 3 sesiones distintas (8, la de descarga fallida, C5/ADR 0024). No reintentar sin más — es política de egress del contenedor, no un fallo de certificado (`$HTTPS_PROXY/__agentproxy/status` lo confirma). Si sigue bloqueado, no es tarea para esta sesión cloud — es de Andreu (correr el script en su máquina) o de quien administre la política de red.
- **Activos listos para C6**: `docs/img/captura-plano.webp` (plano real del camping, sesión C5) — úsalo en vez de generar uno nuevo. `apps/site/public/captura-planning.webp` y `og.png` son de la landing, no de las docs, pero sirven de referencia de qué pinta bien.

## Decisiones abiertas que bloquean ADRs

- **B-ii** — herramienta y layout de la documentación (bloquea C6; decidir en su ADR 0025).
