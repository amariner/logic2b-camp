# LOGIC CAMP — CLAUDE.md

Producto SaaS de Logic2B (Castellón): web + reservas + gestión para **campings**, y solo campings. Cada cliente es una **instancia**: mismo código, su propia D1, su config, su dominio. Referencia completa: `LOGIC-CAMP-Super-Prompt.md`. Este fichero es el contrato de trabajo de cada sesión.

## Cómo se trabaja este proyecto

Cada decisión se juzga desde **ocho lentes a la vez** (arquitecto, fullstack, backend, frontend, product designer, UX, UI, SEO) — el "equipo" que encarna una sola persona. Definición, vetos y desempate en **`docs/EQUIPO.md`**; skill `/equipo` para pasar una decisión o un diff por las ocho. Aplica siempre, no solo al invocarlo.

## Sesiones autónomas ("continúa con el desarrollo")

Si el prompt es solo **"continúa con el desarrollo de este proyecto"** (o
equivalente), se ejecuta el protocolo de **`docs/CONTINUA.md`** completo y sin
preguntar: sincronizar con origin → leer PROGRESS/SIGUIENTE-SESION/BACKLOG →
elegir UN objetivo ejecutable **sin credenciales ni Andreu presente** (prioridad:
lo que el cliente ve en la demo) → implementar → verificar → documentar (PROGRESS,
BACKLOG, SIGUIENTE-SESION) → commit a `main` y **push a GitHub**. El MVP es una
demo: nada de configurar servicios externos reales (Resend, Stripe, SES…); lo fake
se resuelve en el seed.

## Objetivo duradero de desarrollo

Si Andreu usa **`/goal sigue desarrollando este proyecto todo lo que puedas`**,
manda `docs/RUTA-DESARROLLO-CONTINUO.md`. Codex recorre sus checkpoints desde el
primero incompleto hasta agotar el trabajo verificable. La ruta incluye la
fábrica de temas, nuevas demos D5-V/D6-V, proveedores, publicación, alta real y
expansiones; cada frente se abre únicamente en su checkpoint y al cumplir su
gate. Pertenecer a la ruta no sustituye la autorización explícita necesaria para
credenciales, infraestructura remota, deploys o datos de un cliente real.

## Mandato demo-first (2026-08-06)

Mientras no haya un cliente contratado, la fuente de verdad es
`docs/ESTRATEGIA-DEMO-FIRST.md`: se construye primero lo que un prospecto puede
ver, tocar y comprar. El frontend y el portfolio de demos son el producto
inmediato; el backend solo sostiene sus recorridos con seed, fixtures tipados o
adaptadores demo. CLI, aprovisionamiento industrial, integraciones externas y
endurecimiento invisible se **documentan para activarlos con el primer cliente**,
pero no desplazan trabajo visual. Toda simulación se etiqueta como demo,
prototipo o roadmap; nunca se presenta como producción real.

## Restricción que lo gobierna todo

El desarrollador trabaja ~6h/semana. **Cualquier decisión que multiplique el trabajo por número de clientes está prohibida.** Dar de alta un camping nuevo debe costar una tarde. Regla de desempate: _¿qué necesita un camping real para operar en agosto?_ Eso gana.

## Arquitectura

- **Un monorepo** (pnpm workspaces + Turborepo). Clientes en `tenants/{slug}/`.
- **Una base de datos D1 por camping**, nunca compartida. Aislamiento por binding, no por `WHERE tenant_id`. Fuga cruzada imposible por diseño.
- Lo que varía entre campings: `config.ts` + `theme.css` + `content/` + `custom/`.
- `custom/` se **engancha** al core mediante puntos de extensión declarados; nunca lo modifica. Si `custom/` no alcanza, falta un punto de extensión en el core.
- Si un cliente necesita tocar `apps/` o `packages/`: o es feature del core (la tienen todos) o falta un punto de extensión.

```
apps/       web (Astro) · dashboard (React SPA) · api (Hono/Workers) · site (landing/docs)
packages/   core ★ (motor puro, sin I/O) · db · ui · config · extensions · i18n
            notifications · payments · cli · tsconfig
tenants/    _template/ · demo/ (Camping Cala Sereno → camp.logic2b.com) · {slug}/
docs/       ROADMAP · TIERS · DOMAIN · BACKLOG · ONBOARDING · DEMO-SCRIPT · adr/
```

## Niveles de producto (ver docs/TIERS.md)

La oferta pública usa **Inicio (0) → Gestión (1) → Automatiza (2) →
Inteligente (3)**. El código conserva los tiers técnicos 1–4 de `TIERS.md`: no
se renombran a ciegas. Inicio reutiliza el carril de build estático del tier
técnico 1, pero no su persistencia histórica: transporta la consulta por email
sin D1; en demo usa un adaptador sin red. Subir de nivel = cambiar config,
nunca un proyecto nuevo.

1. **Camp Web** — web + formulario→email. Sin motor, sin dashboard. Las solicitudes **se guardan igual** (silenciosas): es el histórico que hace renovar.
2. **Camp Solicitudes** — bandeja de solicitudes + dashboard lite.
3. **Camp Reservas** — motor real, pagos, dashboard completo.
4. **Camp Motor** — solo motor + dashboard, web ajena. **NO CONSTRUIR hasta que alguien pague.**

**Regla dura**: el nivel 1 funciona con el motor apagado y **sin arrastrarlo en el bundle**.

## Stack cerrado (no proponer alternativas salvo bloqueo técnico real)

|                                 |                                                                                                                                                                                                                                         |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Monorepo                        | pnpm workspaces + Turborepo                                                                                                                                                                                                             |
| Web pública                     | Astro 5 + islas React (SEO crítico)                                                                                                                                                                                                     |
| Dashboard                       | React 19 + Vite + TanStack Router + TanStack Query                                                                                                                                                                                      |
| API                             | Hono en Cloudflare Workers, RPC tipado (hono/client)                                                                                                                                                                                    |
| DB                              | Cloudflare D1 + Drizzle ORM + drizzle-kit                                                                                                                                                                                               |
| Auth                            | Better Auth (adaptador D1)                                                                                                                                                                                                              |
| Validación                      | Zod, esquemas compartidos API↔clientes                                                                                                                                                                                                  |
| UI                              | Tailwind v4 + shadcn/ui copiado en `packages/ui` (es nuestro DS)                                                                                                                                                                        |
| Email                           | Resend + React Email — una cuenta, N dominios verificados, `from` por tenant                                                                                                                                                            |
| Colas / Cron / Ficheros / Cache | Cloudflare Queues · Cron Triggers · R2 (prefijo por tenant) · KV                                                                                                                                                                        |
| Pagos                           | capa propia `PaymentProvider`: stripe \| redsys \| none                                                                                                                                                                                 |
| Deploy                          | Wrangler. **Demo: manual desde local** (`pnpm --filter @logic-camp/api deploy:demo`) — el workflow `deploy-demo.yml` invoca ese mismo script pero está apagado (`DEPLOY_DEMO_ENABLED` sin poner). Producción por tenant: manual siempre |
| Tests                           | Vitest (unit + integración D1 local) + Playwright (E2E)                                                                                                                                                                                 |

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

- **Dos marcas, no confundirlas** (ver `docs/BRAND.md`): el **producto Logic2B** (dashboard, landing de venta, docs) lleva marca **Logic2B** — shadcn/ui neutro, Inter Variable + Space Grotesk, wordmark «Logic2B Campings», radius 10px y tokens oklch derivados de `ui.logic2b.com`. La **web pública de cada camping** lleva la marca del **tenant** (mediterránea, ADR 0006), con el isotipo discreto «powered by Logic2B» únicamente en el pie. El Frente B de `docs/ROADMAP.md` está construido; sus remates viven en la ruta duradera y el BACKLOG.
- **Antimodelo**: SaaS azul isométrico Y TAMBIÉN el look crema+serif+terracota. Ambos gastados.
- **Territorio**: camping mediterráneo real — pino carrasco, sombra, lona, arena compactada. Materia, no vector.
- Landing nivel 3: el héroe es el **widget de disponibilidad funcionando de verdad**. Nivel 1: héroe distinto (sin motor).
- Dashboard: densidad sin ruido. **El planning (tape chart) es el elemento firma** — ahí va la ambición. Rápido antes que bonito.
- Suelo: responsive, foco de teclado visible, `prefers-reduced-motion`, contraste AA, usable a 1366px. La usuaria real es la recepcionista de 55 años.

### Política de generación de imágenes en Codex

- Cuando una sesión se ejecute en **Codex**, los activos raster nuevos se intentan
  primero con el **modelo de imagen integrado de mayor calidad disponible en
  Codex**. Tras dos fallos técnicos registrados antes de obtener bytes, el
  circuito del manifiesto queda abierto y el orquestador puede usar el fallback
  explícito de Higgsfield en los lotes restantes. El cambio nunca es silencioso:
  proveedor, modelo, intento y huella del prompt quedan en
  `tenants/{slug}/fotos.estado.json`. No se reutiliza fotografía de otro tenant.
- La generación se ejecuta en **tandas máximas de 2 imágenes**. Cada pareja se
  inspecciona como conjunto antes de lanzar la siguiente para proteger la
  coherencia visual, evitar saturar el servidor y no consumir créditos a ciegas.
- Todo encargo fija antes el papel, proporción, prompt y nombre final en
  `tenants/{slug}/fotos.json`. `pnpm fotos -- run {slug}` genera o reanuda solo
  el lote activo y lo deja en `.staging`; `approve` es la única operación que lo
  mueve al contenido consumido por la web. El producto solo referencia derivados
  locales WebP/AVIF aprobados, nunca URLs temporales.
- Se mantienen las reglas del contrato visual: una geografía y luz coherentes,
  sin rostros reconocibles, texto generado, marcas, matrículas legibles, HDR ni
  arquitectura imposible. Las imágenes de una demo se declaran ficción
  comercial, no prueba de un establecimiento real.

## Entornos

- `camp.logic2b.com` → landing/documentación comercial en la raíz, Cala Sereno
  ficticio bajo `/demo/`, otras marcas bajo `/demos/*` y gestor bajo `/admin/`.
  El conjunto es la herramienta de ventas: prioridad visual máxima.
- `ui.logic2b.com` → design system externo de referencia; este repo mantiene sus componentes en `packages/ui` y no duplica otro Storybook sin una necesidad demostrada.
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
- ❌ Duplicar `ui.logic2b.com` con un Storybook propio sin un consumidor o necesidad demostrada.
- ❌ Mezclar fases en una sesión, o escribir código antes del ADR validado.
- ❌ Que el nivel 1 arrastre el motor en el bundle o dependa de él para funcionar.
- ❌ Reabrir decisiones cerradas de §0 del super prompt sin motivo nuevo real.
- ❌ Modelar `enquiries` como bookings en borrador.
- ❌ Repos separados por cliente, o sacar código de un cliente fuera de `tenants/{slug}/custom/`.
