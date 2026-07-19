# tenants/_template — base de clonación

Copiar esta carpeta a `tenants/{slug}/` al dar de alta un camping (automatizado en Fase 9 con `pnpm new:camping`).

| Fichero | Qué es |
|---|---|
| `config.ts` | Tier, módulos, idiomas, pagos, tasa turística, from de email (`TenantConfig`, Fase 9) |
| `theme.css` | Tokens del camping: color, tipografía, radios |
| `content/{locale}.json` | Textos de la web por idioma (uno por locale de `config.locales`) |
| `content/media/` | Fotos WebP + `favicon.svg`, `apple-touch-icon.png`, `og.jpg` (1200×630) |
| `content/blog/{slug}.{lang}.md` | Posts del cuaderno; los idiomas sin versión hacen fallback al idioma por defecto |
| `data.ts` | Datos que la web consume en build (tipos, temporadas, tarifas, extras) — misma fuente que el seed de la D1 |
| `custom/` | Código propio del camping — solo vía puntos de extensión, nunca tocando el core |
| `seed.ts` | Datos iniciales de su D1 |
| `wrangler.jsonc` | Su Worker (web por Workers Assets + API), su D1 (`logic-camp-{slug}`), su dominio, sus secrets |

Estado del tenant, nivel contratado y pendientes: en el `README.md` de cada tenant.
