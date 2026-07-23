# LOGIC CAMP — CLAUDE.md

Producto SaaS de Logic2B (Castellón): web + reservas + gestión para **campings**, y solo campings. Cada cliente es una **instancia**: mismo código, su propia D1, su config, su dominio. Referencia completa: `LOGIC-CAMP-Super-Prompt.md`. Este fichero es el contrato de trabajo de cada sesión.

## Cómo se trabaja este proyecto

Cada decisión se juzga desde **ocho lentes a la vez** (arquitecto, fullstack, backend, frontend, product designer, UX, UI, SEO) — el "equipo" que encarna una sola persona. Definición, vetos y desempate en **`docs/EQUIPO.md`**; skill `/equipo` para pasar una decisión o un diff por las ocho. Aplica siempre, no solo al invocarlo.

## Restricción que lo gobierna todo

El desarrollador trabaja ~6h/semana. **Cualquier decisión que multiplique el trabajo por número de clientes está prohibida.** Dar de alta un camping nuevo debe costar una tarde. Regla de desempate: _¿qué necesita un camping real para operar en agosto?_ Eso gana.

## Arquitectura

- **Un monorepo** (pnpm workspaces + Turborepo). Clientes en `tenants/{slug}/`.
- **Una base de datos D1 por camping**, nunca compartida. Aislamiento por binding, no por `WHERE tenant_id`. Fuga cruzada imposible por diseño.
- Lo que varía entre campings: `config.ts` + `theme.css` + `content/` + `custom/`.
- `custom/` se **engancha** al core mediante puntos de extensión declarados; nunca lo modifica. Si `custom/` no alcanza, falta un punto de extensión en el core.
- Si un cliente necesita tocar `apps/` o `packages/`: o es feature del core (la tienen todos) o falta un punto de extensión.

```
apps/       web (Astro) · dashboard (React SPA) · api (Hono/Workers) · storybook (Fase 10)
packages/   core ★ (motor puro, sin I/O) · db · ui · config · extensions · i18n
            notifications · payments · cli · tsconfig
tenants/    _template/ · demo/ (Camping Cala Sereno → camp.logic2b.com) · {slug}/
docs/       ROADMAP · TIERS · DOMAIN · BACKLOG · ONBOARDING · DEMO-SCRIPT · adr/
```

## Niveles de producto (ver docs/TIERS.md)

Un código, cuatro flags. Subir de nivel = cambiar config, nunca un proyecto nuevo.

1. **Camp Web** — web + formulario→email. Sin motor, sin dashboard. Las solicitudes **se guardan igual** (silenciosas): es el histórico que hace renovar.
2. **Camp Solicitudes** — bandeja de solicitudes + dashboard lite.
3. **Camp Reservas** — motor real, pagos, dashboard completo.
4. **Camp Motor** — solo motor + dashboard, web ajena. **NO CONSTRUIR hasta que alguien pague.**

**Regla dura**: el nivel 1 funciona con el motor apagado y **sin arrastrarlo en el bundle**.

## Stack cerrado (no proponer alternativas salvo bloqueo técnico real)

|                                 |                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------- |
| Monorepo                        | pnpm workspaces + Turborepo                                                     |
| Web pública                     | Astro 5 + islas React (SEO crítico)                                             |
| Dashboard                       | React 19 + Vite + TanStack Router + TanStack Query                              |
| API                             | Hono en Cloudflare Workers, RPC tipado (hono/client)                            |
| DB                              | Cloudflare D1 + Drizzle ORM + drizzle-kit                                       |
| Auth                            | Better Auth (adaptador D1)                                                      |
| Validación                      | Zod, esquemas compartidos API↔clientes                                          |
| UI                              | Tailwind v4 + shadcn/ui copiado en `packages/ui` (es nuestro DS)                |
| Email                           | Resend + React Email — una cuenta, N dominios verificados, `from` por tenant    |
| Colas / Cron / Ficheros / Cache | Cloudflare Queues · Cron Triggers · R2 (prefijo por tenant) · KV                |
| Pagos                           | capa propia `PaymentProvider`: stripe \| redsys \| none                         |
| Deploy                          | Wrangler + GitHub Actions (main→demo automático; producción por tenant, manual) |
| Tests                           | Vitest (unit + integración D1 local) + Playwright (E2E)                         |

## Convenciones no negociables

- TypeScript estricto. Nada de `any`. Tipos derivados de Zod y Drizzle.
- Todo dinero en **céntimos, entero**. Nunca float.
- El precio se guarda siempre con **desglose auditable** (`price_breakdown` JSON), nunca como número suelto.
- Fechas de estancia en ISO `YYYY-MM-DD` sin zona horaria. Sistema en UTC. `date_from` inclusive, `date_to` **exclusive** (el día de salida se libera).
- Textos de UI **siempre vía i18n** (es, ca, en, fr, de, nl). Nunca hardcodeados. El contenido de tenant vive en `tenants/{slug}/content/`.
- Cada función del motor va con sus tests. **Tests antes que implementación.**
- ADR en `docs/adr/NNNN-titulo.md` antes de escribir código en una fase nueva, y PARAR a esperar validación.
- Una sesión = una fase = un objetivo. Ideas de otras fases → `docs/BACKLOG.md`.
- No inventar librerías ni APIs. Ante la duda, decirlo.

## Invariantes con test propio obligatorio

1. Una unidad no puede tener dos reservas solapadas (from inclusive, to exclusive).
2. `sum(payments.amount_cents) == bookings.paid_cents`, siempre.
3. Cambiar una tarifa no modifica jamás una reserva ya confirmada.
4. Cancelar libera inventario en la misma transacción.
5. Cada tenant opera solo contra su binding D1 — test explícito de fuga cruzada.

## Glosario de dominio

Ver `docs/DOMAIN.md` — es la ventaja competitiva. Claves: se reserva un **tipo de unidad**, el camping asigna la **unidad** física (reasignable sin cancelar). Parcela ≠ alojamiento. Temporadas solapadas por prioridad. Tasa turística por persona/noche con exenciones por edad, aparte. Fianza no es ingreso. Fuera de temporada = "cerrado", no "sin disponibilidad". `enquiries` es tabla propia, no un booking en borrador.

## Dirección visual

- **Dos marcas, no confundirlas** (ver `docs/BRAND.md`): el **producto Logic2B** (dashboard, landing de venta, docs) lleva marca **Logic2B** — shadcn/ui neutro, Inter Variable + Space Grotesk, isotipo `docs/brand/logo-mark.svg`, radius 10px, tokens oklch de `ui.logic2b.com`. La **web pública de cada camping** lleva la marca del **tenant** (mediterránea, ADR 0006), con isotipo discreto "powered by Logic2B" en el pie. El plan de alineación es el **Frente B** de `docs/ROADMAP.md`.
- **Antimodelo**: SaaS azul isométrico Y TAMBIÉN el look crema+serif+terracota. Ambos gastados.
- **Territorio**: camping mediterráneo real — pino carrasco, sombra, lona, arena compactada. Materia, no vector.
- Landing nivel 3: el héroe es el **widget de disponibilidad funcionando de verdad**. Nivel 1: héroe distinto (sin motor).
- Dashboard: densidad sin ruido. **El planning (tape chart) es el elemento firma** — ahí va la ambición. Rápido antes que bonito.
- Suelo: responsive, foco de teclado visible, `prefers-reduced-motion`, contraste AA, usable a 1366px. La usuaria real es la recepcionista de 55 años.

## Entornos

- `camp.logic2b.com` → demo comercial (Camping Cala Sereno, ficticio, reset nocturno). ES la herramienta de ventas: prioridad visual máxima.
- `ui.logic2b.com` → Storybook (Fase 10, no antes).
- `{cliente}` → dominio propio de cada camping.

## Comandos

- `pnpm check` — typecheck + lint + tests + build (verde antes de cerrar sesión, siempre)
- `pnpm db:reset && pnpm db:seed` — base demo desde cero
- `pnpm new:camping` — asistente de alta (Fase 9)
- Slash commands: `/session-close` · `/check` · `/adr` · `/new-camping`

## Qué NO hacer

- ❌ Construir Camp Motor (Fase 12) — declarado, no construido, hasta que alguien pague.
- ❌ Compartir una D1 entre tenants o proteger con `WHERE tenant_id` como única barrera.
- ❌ Guardar precios como número suelto, o dinero en float.
- ❌ Hardcodear textos de UI o contenido de tenant en componentes.
- ❌ Deploy automático a producción de un tenant. Solo manual (`workflow_dispatch`).
- ❌ Empezar Storybook / `ui.logic2b.com` antes de la Fase 10.
- ❌ Mezclar fases en una sesión, o escribir código antes del ADR validado.
- ❌ Que el nivel 1 arrastre el motor en el bundle o dependa de él para funcionar.
- ❌ Reabrir decisiones cerradas de §0 del super prompt sin motivo nuevo real.
- ❌ Modelar `enquiries` como bookings en borrador.
- ❌ Repos separados por cliente, o sacar código de un cliente fuera de `tenants/{slug}/custom/`.
