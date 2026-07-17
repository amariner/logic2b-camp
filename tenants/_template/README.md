# tenants/_template — base de clonación

Copiar esta carpeta a `tenants/{slug}/` al dar de alta un camping (automatizado en Fase 9 con `pnpm new:camping`).

| Fichero | Qué es |
|---|---|
| `config.ts` | Tier, módulos, idiomas, pagos, tasa turística, from de email (`TenantConfig`, Fase 9) |
| `theme.css` | Tokens del camping: color, tipografía, radios |
| `content/` | Textos por idioma y fotos |
| `custom/` | Código propio del camping — solo vía puntos de extensión, nunca tocando el core |
| `seed.ts` | Datos iniciales de su D1 |
| `wrangler.jsonc` | Su Worker, su D1 (`logic-camp-{slug}`), su dominio, sus secrets |

Estado del tenant, nivel contratado y pendientes: en el `README.md` de cada tenant.
