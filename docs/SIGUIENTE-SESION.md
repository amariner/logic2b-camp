# Prompt para la siguiente sesión — guías de gestión hechas; toca desplegarlas y elegir frente

> Reescrito al cerrar la sesión 41 (2026-07-22: deploy de la landing atmosférica + cuarta guía "gestión").
> Cuando la próxima sesión termine, **reescribe este fichero** con el prompt de la siguiente.

---

## Estado en una línea

La landing atmosférica (ADR 0027), las 6 fotos del tenant y los remates de la sesión 38 **ya están en producción y medidos** (Lighthouse 98 desktop / 96 móvil; supresión RGPD de Fase 11 verificada logueada). Encima, la sesión 41 añadió la **cuarta guía "gestión"** (informes/tarifas/ajustes) con su `?` en el dashboard — hecha y verificada en local (`pnpm check` 42/42), pero **sin desplegar**.

## ▶ Prompt para pegar

```
Logic Camp (SaaS de campings, monorepo pnpm/Turborepo, repo amariner/logic2b-camp,
dir /Users/andreumariner/Desktop/proyectos/logic-camp).

Lee PROGRESS.md, CLAUDE.md y docs/ROADMAP.md antes de tocar nada.
Haz `git fetch` y compara con origin/main ANTES de trabajar: el main local se ha
quedado atrás con el árbol limpio en varias sesiones (36, 38, 40). Compara siempre.

ESTADO
Sesión 41 cerrada y mergeada a main. Dos bloques: (1) se desplegó y midió lo que
la sesión 40 dejó sin subir — landing atmosférica, 6 fotos del tenant y remates
de la sesión 38 ya en producción (camp.logic2b.com, versión 1d2c2f37); Lighthouse
real 98 desktop / 96 móvil (la foto del héroe NO penaliza: es <img
fetchpriority="high">); supresión RGPD de Fase 11 verificada logueada (409
retention_hold con fecha exacta 2029-08-18). (2) Remate BACKLOG [C6]: cuarta guía
"gestión" (informes/tarifas/ajustes) en camp.logic2b.com/docs/, con prosa es
escrita contra el código real de cada pantalla, cromo en los 6 idiomas, y el ? del
dashboard ya conectado (ayuda.ts). pnpm check 42/42 en local. NADA de la guía
nueva está en producción todavía.

LO PRIMERO — DESPLEGAR LA GUÍA NUEVA (una sola cosa, y coherente):
1. cd apps/api && pnpm run deploy:demo
   Sube JUNTOS la cuarta guía de docs Y el dashboard con el ? ya activo en
   /informes /tarifas /ajustes. Van juntos a propósito: si subes solo el
   dashboard, sus ? apuntarían a páginas que aún no existirían.
   Assets tardan ~30 s en propagar; 404+200 mezclados justo después NO es fallo.
2. Verifica en producción: camp.logic2b.com/docs/ debe mostrar CUATRO tarjetas
   (recepción · gestión · dueño · técnica); abre /docs/gestion/tarifas/ y
   comprueba que la prosa renderiza; en el dashboard logueado (gerencia@
   calasereno.example / calasereno) el ? ya aparece en Informes, Tarifas y Ajustes
   y abre su página.

DESPUÉS — ELIGE (dilo antes de empezar; una sesión = un objetivo):
1. FASE 9 — primer alta real de un tenant. Lo único que cierra fase y desbloquea
   el negocio. `pnpm new:camping` escrito y testeado (17 tests) pero `--apply`
   NUNCA ejecutado contra Cloudflare (doble candado: --apply +
   LOGIC_CAMP_ALLOW_INFRA=1). Requiere credenciales y a Andreu presente
   decidiendo el camping. NO lo ejecutes por tu cuenta.
2. PARTE DE VIAJEROS (SES.Hospedajes) — mayor hueco funcional para un camping
   español real. El modelo ya captura documento/nacimiento/nacionalidad (ADR
   0022) y la retención respeta los 3 años (ADR 0026). Falta el fichero en
   formato oficial (puro y testeable, como PaymentProvider) + envío (difiere a
   credenciales SES + código de establecimiento). Fase propia: ADR 0028 PRIMERO
   y PARAR a validar.
3. Remates cortos: 2ª tanda de fotos del tenant (baños + segunda foto por tipo —
   Higgsfield funciona desde el Mac de Andreu), o traducir la prosa de las guías
   (hoy solo es, con fallback visible — decisión consciente del ADR 0025, solo si
   lo pide un cliente real).

CONTRATO (CLAUDE.md, no negociable)
- ~6h/semana; nada que multiplique el trabajo por camping.
- TypeScript estricto, nada de `any`. Dinero en céntimos con desglose auditable.
  Fechas ISO sin zona, date_from inclusive / date_to exclusive.
- Textos de UI SIEMPRE vía i18n (6 ficheros content/{lang}.json en apps/site —
  una clave nueva va en LOS SEIS, o el Record<Locale, typeof es> lo caza). Cero
  mocks: el "fake" se resuelve en el seed; las capturas salen del producto real.
- La prosa de las guías es Markdown en content/docs/{guia}/{slug}.{lang}.md; el
  cromo (nav, títulos, avisos) en los JSON. Una página nueva se descubre sola por
  glob; una guía nueva se declara en GUIAS (lib/docs.ts) y su cromo en los 6 JSON.
- ADR antes de código en fase nueva, y PARAR a validar. pnpm check verde al cerrar.

TRAMPAS CONOCIDAS
- vitest-pool-workers aísla el almacenamiento POR TEST; solo persiste beforeAll.
- Segfault de workerd sobre reset.test.ts = contenedor cloud (42/42 en local).
- `pnpm db:reset` hace rm -rf .wrangler-demo → reinicia el Worker; la base local
  va una migración por detrás si no la reseteas (columnas de 0005).
- Dashboard en dev: --var LOGIC_CAMP_DEV_ORIGINS:1 (ya en launch.json) o 403.
- Ruta nueva de API nace con test de fuga cruzada (barrido isolation.test.ts).
- exports/ sigue en .gitignore (documentos de identidad reales).
- El precio lo calcula SIEMPRE el servidor (requote/move, ADR 0023).
- El screenshot del panel de preview se queda en blanco tras scroll programático:
  verifica con Playwright/JS (patrón sesiones 40/41), no te fíes de ese blanco.
- Si otro chat tiene el dev server del site en :4330, sirve el dist en otro puerto
  (python -m http.server) en vez de tocar launch.json (patrón sesión 41).

Cierra con /session-close, mergea a main, súbelo a GitHub y reescribe
docs/SIGUIENTE-SESION.md apuntando a lo que siga.
```

---

## El mapa completo de lo que queda

| Candidato                                       | Estado                                    | Bloqueo                                                                        |
| ----------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------ |
| **Deploy de la cuarta guía "gestión"**          | 🟥 Hecha en local, sin desplegar          | Ninguno — es el primer paso de la próxima sesión                               |
| **Fase 9 · Alta real de un tenant**             | 🟨 Solo falta `--apply`                   | Credenciales + Andreu presente                                                 |
| **Parte de viajeros (SES.Hospedajes)**          | ⬜ Sin empezar                            | Ninguno técnico para el fichero — fase propia con su ADR (**0028**)            |
| Lighthouse en producción con héroe con foto     | ✅ Hecho (98 desktop / 96 móvil)          | —                                                                              |
| Verificar "Protección de datos" ficha           | ✅ Hecho (sesión 41, logueado)            | —                                                                              |
| Fase 11 · Sentry/Logpush                        | ⬜ Enganche listo en un solo punto        | Credenciales                                                                   |
| Fase 11 · Ensayo real de restauración           | ⬜ Runbook escrito, tabla de ensayo vacía | Credenciales de Cloudflare                                                     |
| Fase 11 · Pruebas de carga                      | ⬜                                        | **Falta el objetivo declarado**, no el tiempo                                  |
| Fase 10 · Dashboard demo readonly               | 🟨                                        | Alcance sin decidir (ADR 0013)                                                 |
| Fase 10 · Web Analytics                         | 🟨                                        | Credenciales. **Ojo: si no es cookieless, rompe la posición de "sin banner"**  |
| Fase 10 · `ui.logic2b.com` / Storybook          | ⬜                                        | Su propio objetivo de fase + decisión B-iii                                    |
| Prosa de guías en en/ca/fr/de/nl (25 páginas)   | ⬜                                        | Decisión consciente del ADR 0025: cuando lo pida un cliente real               |
| 2ª tanda fotos tenant (baños, 2ª por tipo)      | ⬜                                        | Ninguno — Higgsfield funciona desde el Mac de Andreu                           |
| Fase 12 · Camp Motor                            | 🚫                                        | **No construir hasta que alguien pague**                                       |

## Decisiones abiertas

- **B-iii** — relación entre `packages/ui` y `ui.logic2b.com`. Bloquea el Storybook de la Fase 10.
- **B-iv** — logotipo completo de Logic2B (hoy solo el isotipo monocromo).
- **B-v** — ¿puede el dashboard de un camping teñir `--primary` con su color, o se mantiene neutro Logic2B?
- **Indexación de la demo** — la landing y las guías se indexan; la demo bajo `/demo/` va `noindex`. Confirmar.
- **¿auditoría con encadenado criptográfico?** Solo si un cliente lo exige.

## Cosas que hay que saber antes de tocar nada

- **El `main` local se queda atrás.** Ya van varias sesiones (36, 38, 40) con el árbol limpio y nada que lo delatara salvo comparar con el remoto. **`git fetch` + comparar, siempre, lo primero.** (En la 41 sí estaba al día.)
- **Las docs tienen ahora CUATRO guías**: `GUIAS = ['recepcion','gestion','dueno','tecnica']` en `apps/site/src/lib/docs.ts`. El índice, las rutas estáticas y el sitemap salen solos del array + glob. Una clave de cromo nueva va en los 6 JSON o el typecheck la caza.
- **El `?` del dashboard** lee `apps/dashboard/src/lib/ayuda.ts`: pantalla → página de la guía, o `null` (no se pinta el botón). Ya cubre informes/tarifas/ajustes.
- **La foto del héroe no es un riesgo de LCP**: es un `<img fetchpriority="high">`, no un background CSS. Lighthouse 98/96 en producción lo confirma. No añadir preload salvo que una medida futura lo pida.
- **Higgsfield + descarga funcionan desde el Mac de Andreu** — el bloqueo de `cloudfront.net` era exclusivo del contenedor cloud.
- **`pnpm db:reset` hace `rm -rf .wrangler-demo`** → reinicia el Worker; la base local va una migración por detrás si no la reseteas (columnas de `0005_rgpd.sql`).
- **El dashboard necesita el flag de dev** `--var LOGIC_CAMP_DEV_ORIGINS:1` (ya en `.claude/launch.json`) o login 403 en `:5173`.
- **Credenciales del seed** (contraseña `calasereno`): `direccion@` / `gerencia@` / `recepcion@` / `consulta@calasereno.example`.
- **El segfault de workerd sobre `reset.test.ts` es del contenedor cloud** — en local 42/42.
- **Una ruta nueva de API nace con test de fuga cruzada** (barrido de `isolation.test.ts`).
- **`exports/` está en `.gitignore` y debe seguir estando.**
- **El precio lo calcula SIEMPRE el servidor** (`requote`/`move`, ADR 0023).
- **El `@theme` de `packages/ui/src/theme.css` debe declarar TODA familia de token usada como utilidad** (bug sidebar, sesión 38).

## Verificación sin poder levantar wrangler / con el dev server ocupado

Patrón ya usado en C1, C5, C6, 38, 40 y 41: `vite build`/`astro build` real + servidor Node/`python -m http.server` sobre el `dist` + Playwright o el panel del navegador a 1366px y 375px. Para `apps/site` basta servir `apps/site/dist` en un puerto libre (en la 41, el `site` dev estaba ocupado por otro chat en :4330, así que se sirvió el dist en :4331 sin tocar `launch.json`). Los scripts de stub/captura son de sesión y **nunca se commitean**.
