# tenants/_template — base de clonación (ADR 0012)

Copia esta carpeta a `tenants/{slug}/` al dar de alta un camping (`pnpm new:camping` la automatiza cuando exista `packages/cli` — hoy se sigue a mano con esta checklist).

```bash
cp -r tenants/_template tenants/{slug}
```

| Fichero | Qué es |
|---|---|
| `config.ts` | Tier, idiomas, dominio, contacto (`TenantWebConfig`, build time) |
| `theme.css` | Tokens del camping: color, tipografía, radios |
| `content/{locale}.json` | Textos de la web por idioma — busca `__TODO__` (`grep -rn __TODO__ content/`) |
| `content/media/` | **No incluido aquí** — fotos WebP + `favicon.svg`/`apple-touch-icon.png`/`og.jpg` (1200×630) propios del camping |
| `data.ts` | Datos que la web consume en build (tipos, temporadas, tarifas, extras) — misma fuente que el seed de la D1 |
| `custom/hooks.ts` | Puntos de extensión — diseñado, `apps/api` aún no lo carga (ver ADR 0012 §3) |
| `seed.ts` / `write-seed.ts` | Generador determinista del seed inicial de su D1 (mínimo: 1 temporada, 1 tipo, 3 unidades, 1 owner) |
| `wrangler.jsonc` | Su Worker (web por Workers Assets + API), su D1 (`logic-camp-{slug}`), su dominio, sus secrets |

## Checklist de alta

**1. Datos base**
- [ ] `config.ts`: slug, nombre, nivel (`docs/TIERS.md`), idiomas, dominio, contacto.
- [ ] `wrangler.jsonc`: `__SLUG__`/`__DOMINIO__`/`__ZONA__` — el `database_id` real se rellena DESPUÉS de crear la D1, nunca a mano.
- [ ] `theme.css`: los 5 hex de la paleta real del camping (dirección visual en `CLAUDE.md`).
- [ ] `content/{lang}.json`: redacta cada `__TODO__` en los idiomas que el camping vaya a ofrecer; borra los ficheros de idiomas que NO ofrece.
- [ ] `content/media/`: fotos + favicon + `og.jpg` propios (no hay placeholders — sin fotos reales no se despliega).

**2. Inventario y tarifas**
- [ ] `seed.ts`: sustituye la temporada/tipo/unidades de ejemplo por las reales (Capa 2 del asistente, `/new-camping`, interpreta el PDF de tarifas y el Excel de parcelas del cliente — **valida los números con Andreu antes de sembrar**).
- [ ] Los `rate_plans` de la plantilla tienen `base_cents: 0` **a propósito**: imposible desplegar con un precio inventado sin que salte a la vista.

**3. Infraestructura** (requiere las credenciales de §5 del super prompt — token con los scopes ahí listados)
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
