# Prompt para la siguiente sesión — landing atmosférica hecha; toca desplegar y elegir frente

> Reescrito al cerrar la sesión 40 (2026-07-22, landing atmosférica, ADR 0027).
> Cuando la próxima sesión termine, **reescribe este fichero** con el prompt de la siguiente.

---

## Estado en una línea

La **landing de venta es por fin una pieza de venta**: héroe atmosférico (ADR 0027) con la web del tenant y su widget a la vista, capturas reales por todas partes, niveles como escalera, 6 idiomas (156 páginas), `pnpm check` 42/42 en local. Las **6 fotos Higgsfield del tenant (C5.1) por fin descargadas** tras 4 sesiones de bloqueo. **Nada de esto está desplegado** — y tampoco lo de la sesión 38.

## ▶ Prompt para pegar

```
Logic Camp (SaaS de campings, monorepo pnpm/Turborepo, repo amariner/logic2b-camp,
dir /Users/andreumariner/Desktop/proyectos/logic-camp).

Lee PROGRESS.md, CLAUDE.md y docs/ROADMAP.md antes de tocar nada.
Haz `git fetch` y compara con origin/main ANTES de trabajar: el main local se ha
quedado atrás con el árbol limpio en TRES sesiones (36, 38 y 40). Compara siempre.

ESTADO
Sesión 40 cerrada y mergeada a main: landing atmosférica (ADR 0027) — héroe con
foto Higgsfield + marco con la web del tenant y su widget, capturas reales en
"dos caras" y planning, niveles en escalera, iconos, reveal on-scroll accesible,
fr/de/nl completos (156 páginas). C5.1 CERRADO: las 6 fotos del tenant
descargadas (el bloqueo de cloudfront.net era del contenedor cloud; en el Mac de
Andreu funciona). pnpm check 42/42 en local. BRAND.md anotado con la excepción
del ADR 0027 (foto SOLO como atmósfera del héroe de la landing; el resto de
superficies Logic2B neutras).

LO PRIMERO — DESPLEGAR Y MEDIR (nada de esto está en producción):
1. cd apps/api && pnpm run deploy:demo
   Se llevan de una vez: la landing nueva, las 6 fotos del tenant, y los cambios
   de dashboard de la sesión 38 (gris de sidebar + off-canvas móvil) que seguían
   sin desplegar. Assets tardan ~30 s en propagar; 404+200 mezclados justo
   después NO es fallo.
2. Verifica en producción: camp.logic2b.com (héroe con foto y marco), /fr/ /de/
   /nl/, /demo/ con las galerías del tenant ya con sus 6 fotos nuevas.
3. Lighthouse ≥95 en camp.logic2b.com/ — la foto del héroe (219KB + preload de
   fuentes) es lo nuevo a vigilar. Si LCP sufre: <link rel="preload"> de
   hero-atmosfera.webp o bajar calidad, no quitar la foto.
4. Pendiente de la Fase 11 (5 min, logueado): en camp.logic2b.com/admin/
   (gerencia@calasereno.example / calasereno) abre un cliente con estancia
   reciente e intenta suprimirlo — debe responder con la fecha exacta (RD
   933/2021), no error genérico.

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
   (el 0027 ya está ocupado por la landing) y PARAR a validar.
3. Remates cortos: traducir la prosa de las guías (hoy solo es, con fallback
   visible), guías de /informes /tarifas /ajustes, 2ª tanda de fotos del tenant
   (baños + segunda foto por tipo — Higgsfield funciona desde el Mac de Andreu).

CONTRATO (CLAUDE.md, no negociable)
- ~6h/semana; nada que multiplique el trabajo por camping.
- TypeScript estricto, nada de `any`. Dinero en céntimos con desglose auditable.
  Fechas ISO sin zona, date_from inclusive / date_to exclusive.
- Textos de UI SIEMPRE vía i18n (ahora son 6 ficheros content/{lang}.json en
  apps/site — una clave nueva va en LOS SEIS). Cero mocks: el "fake" se resuelve
  en el seed; las capturas salen del producto real (patrón C5).
- Token nuevo usado como utilidad (bg-*, border-*) → declararlo en el @theme de
  packages/ui/src/theme.css o no genera CSS (bug sidebar, sesión 38).
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
  verifica con Playwright (patrón de sesión 40), no te fíes de ese blanco.

Cierra con /session-close, mergea a main, súbelo a GitHub y reescribe
docs/SIGUIENTE-SESION.md apuntando a lo que siga.
```

---

## El mapa completo de lo que queda

| Candidato                                       | Estado                                    | Bloqueo                                                                        |
| ----------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------ |
| **Deploy demo (landing + fotos + sesión 38)**   | 🟥 Sin desplegar                          | Ninguno — es el primer paso de la próxima sesión                               |
| **Fase 9 · Alta real de un tenant**             | 🟨 Solo falta `--apply`                   | Credenciales + Andreu presente                                                 |
| **Parte de viajeros (SES.Hospedajes)**          | ⬜ Sin empezar                            | Ninguno técnico para el fichero — fase propia con su ADR (**0028**)            |
| Verificar "Protección de datos" ficha           | 🟨 Código desplegado                      | Sesión logueada (5 min de Andreu)                                              |
| Lighthouse ≥95 en producción con héroe con foto | ⬜                                        | El deploy de arriba                                                            |
| Fase 11 · Sentry/Logpush                        | ⬜ Enganche listo en un solo punto        | Credenciales                                                                   |
| Fase 11 · Ensayo real de restauración           | ⬜ Runbook escrito, tabla de ensayo vacía | Credenciales de Cloudflare                                                     |
| Fase 11 · Pruebas de carga                      | ⬜                                        | **Falta el objetivo declarado**, no el tiempo                                  |
| Fase 10 · Dashboard demo readonly               | 🟨                                        | Alcance sin decidir (ADR 0013)                                                 |
| Fase 10 · Web Analytics                         | 🟨                                        | Credenciales. **Ojo: si no es cookieless, rompe la posición de "sin banner"**  |
| Fase 10 · `ui.logic2b.com` / Storybook          | ⬜                                        | Su propio objetivo de fase + decisión B-iii                                    |
| Prosa de guías en en/ca (+ ahora fr/de/nl)      | ⬜                                        | Decisión consciente del ADR 0025: cuando lo pida un cliente real               |
| 2ª tanda fotos tenant (baños, 2ª por tipo)      | ⬜                                        | Ninguno — Higgsfield funciona desde el Mac de Andreu (sesión 40 lo demostró)   |
| Fase 12 · Camp Motor                            | 🚫                                        | **No construir hasta que alguien pague**                                       |

## Decisiones abiertas

- **B-iii** — relación entre `packages/ui` y `ui.logic2b.com`. Bloquea el Storybook de la Fase 10.
- **B-iv** — logotipo completo de Logic2B (hoy solo el isotipo monocromo).
- **B-v** — ¿puede el dashboard de un camping teñir `--primary` con su color, o se mantiene neutro Logic2B?
- **Indexación de la demo** — la landing y las guías se indexan; la demo bajo `/demo/` va `noindex`. Confirmar.
- **¿auditoría con encadenado criptográfico?** Solo si un cliente lo exige.

## Cosas que hay que saber antes de tocar nada

- **El `main` local se queda atrás.** Ya van TRES sesiones (36, 38, 40) con el árbol limpio y nada que lo delatara salvo comparar con el remoto. **`git fetch` + comparar, siempre, lo primero.**
- **La landing tiene ahora 6 idiomas**: una clave nueva de i18n va en `es/en/ca/fr/de/nl.json` — los seis, o el typecheck de `Record<Locale, typeof es>` lo cazará.
- **La excepción de marca del ADR 0027 es estrecha**: foto atmosférica SOLO en el héroe de la landing (y con moderación en transiciones). `og.png`, cards, guías y dashboard siguen neutros. No ensancharla sin otro ADR.
- **Higgsfield + descarga funcionan desde el Mac de Andreu** (sesión 40) — el bloqueo de `cloudfront.net` era exclusivo del contenedor cloud. Las tareas de generación de imagen dejan de estar bloqueadas si la sesión corre en local.
- **`pnpm db:reset` hace `rm -rf .wrangler-demo`** → reinicia el Worker después; la base local va una migración por detrás si no la reseteas (columnas de `0005_rgpd.sql`).
- **El dashboard necesita el flag de dev** `--var LOGIC_CAMP_DEV_ORIGINS:1` (ya en `.claude/launch.json`) o login 403 en `:5173`.
- **Credenciales del seed** (contraseña `calasereno`): `direccion@` / `gerencia@` / `recepcion@` / `consulta@calasereno.example`.
- **El segfault de workerd sobre `reset.test.ts` es del contenedor cloud** — en local 42/42 (confirmado de nuevo en sesión 40).
- **`vitest-pool-workers` aísla el almacenamiento POR TEST** — cada test crea sus propios datos.
- **Una ruta nueva de API nace con test de fuga cruzada** (barrido de `isolation.test.ts`).
- **`exports/` está en `.gitignore` y debe seguir estando.**
- **El mapa de color tiene contrato de test** (`packages/ui/test/theme-contrast.test.ts`).
- **El precio lo calcula SIEMPRE el servidor** (`requote`/`move`, ADR 0023).
- **El `@theme` de `packages/ui/src/theme.css` debe declarar TODA familia de token usada como utilidad** (bug sidebar, sesión 38).
- **El screenshot del panel de preview puede quedarse en blanco tras scroll programático** (sesión 40): la página estaba bien (DOM y consola limpios) — verifica con Playwright antes de diagnosticar un blanco como bug.

## Verificación sin poder levantar wrangler

Patrón ya usado en C1, C5, C6, 38 y 40: `vite build` real + servidor Node stub (`/api/auth/get-session` + `/api/admin/*` con datos del generador de seed puro) + Playwright a 1366px y 375px. Para `apps/site` y `apps/web` basta `preview_start` (:4330 / :4321) o Playwright directo contra el dev. Los scripts de stub/captura son de sesión y **nunca se commitean** (viven en el scratchpad; en la 40, la captura de la web del tenant se hizo así y solo se commiteó el `.webp` resultante).
