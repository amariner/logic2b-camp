# Prompt de arranque para sesiones en la nube (Claude Code web/cloud)

> Copiar y pegar el bloque siguiente como primer mensaje de la sesión. Mantenerlo actualizado cuando cambie el estado del proyecto.

---

Trabajas en **LOGIC CAMP**, el SaaS de Logic2B para campings (web + reservas + gestión, multi-instancia). Repo: `https://github.com/amariner/logic2b-camp` (rama `main`).

**Antes de escribir una sola línea de código, lee por este orden:**
1. `PROGRESS.md` — estado actual y diario de sesiones (la última entrada dice exactamente dónde lo dejamos)
2. `CLAUDE.md` — el contrato de trabajo: arquitectura, stack cerrado, convenciones no negociables, invariantes con test obligatorio y lo que está PROHIBIDO hacer
3. `docs/ROADMAP.md` — fases, estado y la sección **"Pulido de la demo — lista de remates"**, que es tu backlog priorizado
4. Si vas a tocar una fase nueva: su sección en `LOGIC-CAMP-Super-Prompt.md` §9 y los ADR de `docs/adr/`

**Reglas de oro (resumen, el detalle manda en CLAUDE.md):**
- Una sesión = una fase = un objetivo. ADR antes de código en fase nueva y PARAR a validarlo conmigo.
- `pnpm check` (typecheck+lint+tests+build) VERDE antes de cerrar. Nunca cierres una sesión en rojo.
- TypeScript estricto, dinero en céntimos enteros, precios siempre con desglose auditable, precio SIEMPRE calculado en servidor, fechas `YYYY-MM-DD` con salida exclusiva, textos vía i18n (nada hardcodeado), tests antes que implementación en el motor.
- Aislamiento por binding D1 (un Worker por tenant). Jamás compartir D1 ni proteger solo con `WHERE tenant_id`.
- El nivel 1 funciona sin motor y sin arrastrarlo en el bundle (verificado en build).
- Al cerrar: actualizar `PROGRESS.md` + tabla de estado de `docs/ROADMAP.md`, commit con mensaje descriptivo en español y push a `main`.

**Entorno y despliegue:**
- Monorepo pnpm 11 (corepack) + Turborepo, Node ≥22. `pnpm install` primero.
- API local: `pnpm exec wrangler dev --config tenants/demo/wrangler.jsonc --persist-to .wrangler-demo --port 8787` (D1 local: `pnpm db:reset && pnpm db:seed`).
- Web local: `pnpm --filter @logic-camp/web dev` (proxy `/api` → 8787). `TIER=1` delante para previsualizar el nivel 1.
- Producción demo: Worker `logic-camp-demo` en `camp.logic2b.com/api/*`, D1 remota migrada y sembrada, secret `AUTH_SECRET` puesto. Deploy: `pnpm --filter @logic-camp/api deploy:demo`. Si la sesión cloud no tiene sesión wrangler, pide el `CLOUDFLARE_API_TOKEN` o deja el deploy anotado como pendiente — NUNCA lo simules.
- Usuarios demo del dashboard: `direccion|gerencia|recepcion|consulta@calasereno.example`, contraseña `calasereno` (ver `tenants/demo/README.md`).

**Objetivo permanente:** dejar la demo `camp.logic2b.com` TAN pulida que venda sola — es la herramienta comercial (§0). Criterio: un director de camping la abre en el móvil y piensa "esto es más serio que mi web actual". La dirección visual aprobada está en `docs/adr/0006-diseno-web-publica.md` (minimalismo editorial, paleta 5 hex, Clash Display + Inter, el mostrador como elemento firma). Antimodelo prohibido: SaaS azul isométrico y crema+serif+terracota.

**Tu tarea de hoy:** lee la última entrada de `PROGRESS.md` y continúa por el "Siguiente" que indica, usando la lista de remates del ROADMAP como orden de prioridad. Si todo lo de la fase en curso está hecho, pasa al primer punto no tachado de "Pulido de la demo". Empieza confirmándome en 5 líneas qué vas a hacer en esta sesión y luego ejecuta.

---

## Notas de mantenimiento de este prompt

- Actualiza la línea de "usuarios demo" o el estado de despliegue si cambian.
- Si se añade un entorno nuevo (Resend, Stripe test…), añádelo al bloque de entorno con su secret.
- `docs/FUNCIONALIDADES.md` es la guía de cara al cliente: cada sesión que añada funcionalidad visible debe actualizarla antes de cerrar.
