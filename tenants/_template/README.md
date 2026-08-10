# tenants/_template — base de clonación (ADR 0012)

Crea un camping con la CLI local. El dry-run monta y audita el scaffold en un
directorio temporal del sistema, imprime su huella y lo elimina; no escribe en
`tenants/` ni toca Cloudflare.

```bash
pnpm new:camping -- {slug} --name "Camping …" --domain camping.example --dry-run
# tras aprobar el informe, quita --dry-run para crear tenants/{slug}/
```

Nombre, dominio y zona se validan antes de escribir. El scaffold es atómico,
rechaza symlinks y escapa los valores según el destino TS/JSON. El informe
enumera **todos** los marcadores `__...__`; no solo los `__TODO__` de contenido.

| Fichero                     | Qué es                                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `config.ts`                 | Tier, idiomas, dominio, contacto e identidad legal (`TenantWebConfig`, build time)                         |
| `theme.css`                 | Tokens del camping: color, tipografía, radios                                                              |
| `identity.json`             | Brief aprobable: ICP, objeción, historia, tono, paleta, pantallas, inventario y éxito                      |
| `content/{locale}.json`     | Textos de la web por idioma — busca `__TODO__` (`grep -rn __TODO__ content/`)                              |
| `fotos.json`                | Procedencia/licencia, prompts, lotes de 1–2 y fuente de derivados                                          |
| `content/media/`            | Destino de WebP + `favicon.svg`/`apple-touch-icon.png`/`og.jpg` (1200×630) propios del camping             |
| `data.ts`                   | Datos que la web consume en build (tipos, temporadas, tarifas, extras) — misma fuente que el seed de la D1 |
| `custom/hooks.ts`           | Puntos de extensión — diseñado, `apps/api` aún no lo carga (ver ADR 0012 §3)                               |
| `seed.ts` / `write-seed.ts` | Generador determinista del seed inicial de su D1 (mínimo: 1 temporada, 1 tipo, 3 unidades, 1 owner)        |
| `wrangler.jsonc`            | Su Worker (web por Workers Assets + API), su D1 (`logic-camp-{slug}`), su dominio, sus secrets             |

## Checklist de alta

**1. Datos base**

- [ ] `config.ts`: slug, nombre, nivel (`docs/TIERS.md`), idiomas, dominio, contacto.
- [ ] `identity.json`: aprobar todos los campos antes de redactar o producir fotografía.
- [ ] `config.ts` → `legal`: razón social, NIF, domicilio, datos registrales (o borra la línea) y buzón de derechos RGPD. El TEXTO de las páginas legales es de producto y no se toca: solo estos campos (ADR 0026 §2.5).
- [ ] `wrangler.jsonc`: `__SLUG__`/`__DOMINIO__`/`__ZONA__` — el `database_id` real se rellena DESPUÉS de crear la D1, nunca a mano.
- [ ] `theme.css`: los 5 hex de la paleta real del camping (dirección visual en `CLAUDE.md`).
- [ ] `content/{lang}.json`: redacta cada `__TODO__` en los idiomas que el camping vaya a ofrecer; borra los ficheros de idiomas que NO ofrece.
- [ ] `fotos.json`: documentar procedencia/licencia, papeles, prompts y lotes máximos de dos.
- [ ] `pnpm fotos -- status {slug}` → `run`/`ingest` → inspección → `approve`; luego derivados responsive, favicon y OG.

**2. Inventario y tarifas**

- [ ] `seed.ts`: sustituye la temporada/tipo/unidades de ejemplo por las reales (Capa 2 del asistente, `/new-camping`, interpreta el PDF de tarifas y el Excel de parcelas del cliente — **valida los números con Andreu antes de sembrar**).
- [ ] Los `rate_plans` de la plantilla tienen `base_cents: 0` **a propósito**: imposible desplegar con un precio inventado sin que salte a la vista.

**3. Infraestructura** (requiere las credenciales de §5 del super prompt — token con los scopes ahí listados)

> El plan contiene pasos humanos (`database_id` y DNS). El runner automático lo
> rechaza entero en preflight antes de lanzar el primer comando: no se puede usar
> `--apply` para empezar un alta parcial. La ejecución real se hará por fases
> supervisadas cuando exista destino, credenciales y autorización explícitos.

- [ ] `pnpm onboarding:rehearse {año}` → migraciones, seed, owner y rollback
      verdes en dos D1 locales desechables; no usa este tenant ni credenciales.
- [ ] `wrangler d1 create logic-camp-{slug}` → pega el `database_id` en `wrangler.jsonc`.
- [ ] `wrangler d1 migrations apply logic-camp-{slug} --remote --config tenants/{slug}/wrangler.jsonc`.
- [ ] `pnpm --filter @tenant/{slug} seed:sql` → genera `seed.sql` → `wrangler d1 execute logic-camp-{slug} --remote --file tenants/{slug}/seed.sql -y`.
- [ ] `TENANT={slug} pnpm --filter @logic-camp/web build` y despliega: `wrangler deploy --config tenants/{slug}/wrangler.jsonc`.
- [ ] DNS/dominio: ver §5 del super prompt (camino A por defecto — nameservers a Cloudflare).

**4. Seguridad — antes de dar el acceso al cliente**

- [ ] **Cambiar la contraseña del owner sembrado** (`owner@__DOMINIO__` / `cambia-esta-clave` — hash real y funcional, pensado solo para verificar el alta).
- [ ] Notificaciones activas: dominio verificado en Resend + `wrangler secret put RESEND_API_KEY`.
- [ ] Pagos activos: `wrangler secret put STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` o `REDSYS_MERCHANT_KEY`, y `modules.payments` en el seed (ADR 0011).

**5. Cierre**

- [ ] `pnpm check` en verde.
- [ ] Sustituye este README por el README del tenant: estado, nivel contratado, qué falta.

Cuando no quede ningún `__TODO__` (ni en código ni en contenido), el alta está terminada — no antes.
