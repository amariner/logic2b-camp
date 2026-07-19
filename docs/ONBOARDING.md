# ONBOARDING — dar de alta un camping (el manual de la tarde)

> Objetivo de negocio (ADR 0012, §7 del super prompt): que dar de alta un camping cueste **una tarde**, no tres días. Este documento es el manual; si en algún punto hay que improvisar algo que no está aquí, el manual no está terminado — corrígelo antes de seguir.

Ver `docs/adr/0012-instancias-custom-asistente.md` (§1-6 diseño y estado, §7 `packages/cli`). **Todavía no ejecutado de punta a punta contra un tenant real**: eso es el criterio de "hecho" de esta fase, pendiente de una sesión con Andreu presente y sus credenciales de Cloudflare — la Capa 1 mecánica ya está automatizada (ver abajo), lo que falta es solo infraestructura real y mandato para tocarla.

## Antes de empezar

Necesitas (§5 del super prompt):
- `wrangler login` hecho, o un `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` con los scopes: `Workers Scripts:Edit` · `D1:Edit` · `Pages:Edit` · `Workers KV Storage:Edit` · `R2:Edit` · `Queues:Edit` · `Zone:DNS:Edit` (sobre `logic2b.com` y la zona del cliente si mueve sus nameservers) · `Account Settings:Read`.
- Del cliente: nombre del camping, dominio deseado, idiomas a ofrecer, nivel contratado (`docs/TIERS.md`), comunidad autónoma (tasa turística), y **material real**: PDF de tarifas, Excel/CSV de parcelas, URL de su web actual si tiene.
- Una decisión tomada: ¿mueve sus nameservers a Cloudflare (camino A, por defecto) o usa Cloudflare for SaaS / Custom Hostnames (camino B, a partir de 10-15 clientes)? Ver §5 del super prompt.

## Los tres capas del alta

### Capa 1 — mecánica (automatizada por `pnpm new:camping`, `packages/cli`)

1. `pnpm new:camping {slug} --name "Nombre real" --domain dominio.com [--zone zona.com] [--address "..."]` — copia `tenants/_template` a `tenants/{slug}` y rellena `config.ts`, `seed.ts`, `wrangler.jsonc` y `package.json` con la identidad (slug/nombre/dominio/zona) sola. Imprime qué queda pendiente: los `__TODO__` de `content/{lang}.json` (Capa 2, borra los idiomas que no aplican) y que `database_id` sigue sin la D1 real.
2. El mismo comando imprime el plan de infraestructura (Capa 3 de este documento) en el orden correcto — no hace falta memorizarlo ni tenerlo en otro sitio.
3. Ejecutar ese plan de verdad contra Cloudflare requiere `--apply` **y** `LOGIC_CAMP_ALLOW_INFRA=1` en el entorno (doble candado deliberado, ver ADR 0012 §7) — sin los dos, no toca la cuenta real. Esto es lo único de la Capa 1 que sigue sin poder hacerse sin las credenciales de §5 y a Andreu presente.
4. Secrets según los módulos contratados: `RESEND_API_KEY` (notificaciones), `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` o `REDSYS_MERCHANT_KEY` (pagos, ADR 0011) — nunca en `config.ts`, siempre `wrangler secret put`.
5. Cambia la contraseña del owner sembrado antes de dar el acceso al cliente.

El checklist completo, fichero a fichero, sigue en `tenants/_template/README.md` — este documento es el resumen narrativo, aquel es la fuente de verdad operativa.

### Capa 2 — interpretativa (el margen de Logic2B — slash command `/new-camping`)

Con el material real del cliente:
- **PDF de tarifas** → propuesta de `seasons_calendar` + `rate_plans` (+ `rate_rules` si hay descuentos) → **Andreu valida los números antes de sembrar nada** — nunca se inventan precios.
- **Excel/CSV de parcelas** → inventario normalizado (`unit_types` + `units`) → sustituye a los de ejemplo del seed.
- **Su web actual** → borrador de los textos de la landing en sus idiomas, a `content/{lang}.json`.

Esta capa es la que convierte "montar un camping" de tres días a media tarde — es manual (o asistida por `/new-camping`), no un formulario.

### Capa 3 — onboarding en el dashboard (nivel 2+, no construido todavía)

Checklist dentro del propio dashboard para que el camping se sienta dueño del alta (subir su logo, revisar sus tarifas, conectar su pasarela, publicar) — evita que Logic2B sea el cuello de botella en cada detalle menor. Fuera del alcance de esta sesión.

## Qué NO se automatiza (y por qué)

- **Crear D1/Workers/DNS reales** requiere las credenciales de Cloudflare de producción y es una acción con impacto fuera del repositorio (no revertible con `git revert`) — se hace con Andreu presente o con su mandato explícito, nunca de forma autónoma sin supervisión.
- **Precios y tarifas**: el asistente PROPONE desde el PDF del cliente, nunca los inventa ni los siembra sin validación explícita.
- **`custom/`**: si el camping pide algo que los puntos de extensión de §3 (super prompt) no cubren, es que falta un punto de extensión en el core — se añade ahí, no con un parche en su `custom/`.

## Verificación de que el alta está completa

- `grep -rn __TODO__ tenants/{slug}/` no debe devolver nada.
- `pnpm check` en verde.
- El camping responde en su dominio real, con sus datos reales, en los idiomas contratados.
- Login del owner funciona con una contraseña que el camping ya ha cambiado (no la sembrada).
- Recorre `docs/DEMO-SCRIPT.md` (Fase 10) contra el tenant real como si fueras el propio dueño del camping — si algo no se puede hacer sin `git log` para acordarte de un truco, el alta no está terminada.
