# Prompt para la siguiente sesión — Frente C

> Reescrito al cerrar la sesión 34 (2026-07-21, C1 · el planning como pieza de exhibición, ADR 0023).
> Cuando la próxima sesión termine, **reescribe este fichero** con el prompt de la siguiente.

---

## Estado en una línea

Frente C: **C0 ✅ · C2+C3 ✅ · C7 ✅ · C4 ✅ · C1 ✅**. Quedan **C5** (fotos) y **C6** (documentación, absorbe B4, cero-riesgo). El planning ya es la pieza de exhibición declarada: gesto horizontal, crear arrastrando, mapa de color definitivo con test AA y modo oscuro.

> **Andreu autorizó Higgsfield el 2026-07-21** (al cierre de la sesión 34): C5 está desbloqueado. Sigue valiendo la prudencia del contrato — fijar la lista de prompts ANTES de generar y no quemar créditos a ciegas (tandas pequeñas, revisar, seguir).

## ▶ Prompt para pegar

```
Continuamos con el Frente C de Logic Camp (acabado profesional, prioridad visual
en modo fake). Lee primero PROGRESS.md, CLAUDE.md, docs/ROADMAP.md y
docs/FRENTE-C-ACABADO.md (el contrato del frente).

Hecho ya: C0 (ADR 0019), C2+C3 (ADR 0020), C7 (plano, ADR 0021), C4 (recepción,
ADR 0022) y C1 (gestos del planning, ADR 0023 — mover/estirar con re-cotización
en servidor, crear arrastrando, hoy/temporada/filtros, mapa de color definitivo
con test AA, modo oscuro).

El objetivo de ESTA sesión es C6 — la documentación (absorbe B4):
1. Guía de la recepcionista: operar el gestor de principio a fin, lenguaje
   llano, una tarea por página. La usuaria real tiene 55 años. Con C4+C1
   hechos, el flujo completo ya existe (llegada → check-in → cobro → mover
   en el planning → check-out).
2. Guía del dueño: los 4 niveles (TIERS.md) como escalera.
3. Ficha técnica para "el informático de confianza": dominios, DNS, correo,
   aislamiento por D1, RGPD, backups.
4. Decisión B-ii pendiente: herramienta (páginas Astro propias vs Starlight vs
   layout de ui.logic2b.com). Decidela en el ADR (0024) con el criterio de
   siempre: ¿qué NO multiplica el trabajo por cliente?
5. Marca Logic2B, enlazada desde la landing; ayuda contextual (el "?" de cada
   pantalla → su sección).

Alternativa si prefieres C5 (fotos Higgsfield): NO generes nada sin fijar la
lista de prompts y que Andreu confirme la tanda — cada generación cuesta
créditos. Lo que SÍ se puede hacer sin gastar: capturas reales del planning y
el plano para la landing (el seed denso + check-in + gestos ya lucen).

Sigue el contrato: ADR primero. Sesión autónoma — aplica tu criterio y NO PARES
hasta cerrarlo, como en C7/C4/C1. Una sesión = una fase. `pnpm check` verde
antes de cerrar (ojo: en el contenedor cloud el pool de workerd segfaulta sobre
reset.test.ts y el rate-limit de la API parpadea bajo carga — el check completo
cae por eso, 40/42; verifica cada suite EN AISLAMIENTO). Cierra con
/session-close y reescribe docs/SIGUIENTE-SESION.md.
```

---

## Orden recomendado a partir de aquí

1. **C6 — documentación** ← *recomendado*: cero-riesgo, sin credenciales, y con C4+C1 cerrados la guía de recepcionista tiene por fin el flujo completo que documentar. Desbloquea también la ayuda contextual del dashboard.
2. **C5 — fotos** (Higgsfield): fijar prompts y **confirmar la tanda con Andreu antes de generar** (cuesta créditos). Las capturas del planning/plano para la landing (BACKLOG B3: sustituir la maqueta CSS) ya se pueden hacer sin gastar nada — considera hacerlas dentro de C5 o como remate suelto.
3. **Remates de BACKLOG** si sobra sesión: "en casa" en `/reservas`, sidebar móvil off-canvas (Sheet ya existe), limpiar claves i18n huérfanas.

## Cosas que hay que saber antes de tocar nada

- **`pnpm db:reset` hace `rm -rf .wrangler-demo`** → reinicia el Worker después.
- **El dashboard necesita el flag de dev**: `wrangler dev … --var LOGIC_CAMP_DEV_ORIGINS:1` (ya en `.claude/launch.json`). Sin él, login 403 en `:5173`.
- **Credenciales del seed** (contraseña `calasereno`): `direccion@` / `gerencia@` / `recepcion@` / `consulta@calasereno.example`.
- **Cero mocks en el cliente** — propiedad del proyecto. "Modo fake" se resuelve en el seed.
- **Verificación sin workerd**: la sesión 34 estrenó un listón mejor que las capturas estáticas — **bundle real (`vite build`) + stub de API en memoria (node) + Playwright** permite ejercitar gestos completos en el navegador (22/22). El stub vive solo en el scratchpad de la sesión, nunca en el repo. Chromium: `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, `--no-sandbox`.
- **El mapa de color tiene contrato de test** (`packages/ui/test/theme-contrast.test.ts`): cambiar un `--lc-status-*` sin AA rompe la suite. Es intencionado — si C5/C6 tocan color, que el test mande.
- **El precio de mover fechas lo calcula el servidor** (`requote`/`move`, ADR 0023). Si alguna pantalla nueva quiere mover fechas, que reutilice esas rutas — no se calcula precio en cliente jamás.
- **Modo oscuro**: clase `.dark` en `<html>`, decidida por el script inline de `index.html` + `ThemeToggle` (localStorage `lc-theme`). La landing y la web de tenant NO tienen modo oscuro (decisión de ADR 0023: otra marca, otro tema).

## Decisiones abiertas que bloquean ADRs

- **B-ii** — herramienta y layout de la documentación (bloquea C6; decidir en su ADR 0024).
- **C5** — lista definitiva de fotos y prompts de Higgsfield (bloquea la generación; la parte de capturas del producto no está bloqueada).
