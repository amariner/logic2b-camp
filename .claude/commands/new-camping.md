---
description: Asistente de alta de un camping nuevo a partir del material real del cliente (Fase 9)
argument-hint: <slug o nombre del camping> [rutas al material: PDF tarifas, Excel parcelas, URL web actual]
---

Asistente de alta de instancia para: $ARGUMENTS

> ⚠️ Operativo a partir de la **Fase 9**. Si `packages/cli` y `tenants/_template/` aún no existen, dilo y para.

Objetivo de negocio: que dar de alta un camping cueste **una tarde**, no tres días.

1. **Datos base** — pregunta lo que falte: nombre, slug, nivel contratado (1–4; el 4 no se construye), dominio, idiomas, pagos (nivel 3), comunidad autónoma (tasa turística), origen del inventario.
2. **Parte mecánica** — ejecuta `pnpm new:camping` (o guía su equivalente): D1 nueva, `config.ts`, `theme.css`, `content/`, `wrangler.toml`, migración, seed, Worker + DNS, usuario owner, `README.md` del tenant.
3. **Parte interpretativa** (el margen de Logic2B) — con el material aportado:
   - PDF de tarifas → propuesta de `seasons_calendar` + `rate_plans` + `rate_rules` → **valida con Andreu antes de sembrar**.
   - Excel/CSV de parcelas → inventario normalizado (`unit_types` + `units`) → seed.
   - Web actual → borrador de textos de la landing en sus idiomas, a `tenants/{slug}/content/`.
4. **Cierre** — abre PR con todo, y actualiza el `README.md` del tenant con estado, nivel contratado y pendientes.

Nunca inventes tarifas ni datos del camping: si el material no lo dice, pregunta.
