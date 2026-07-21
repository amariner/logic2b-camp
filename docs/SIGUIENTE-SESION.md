# Prompt para la siguiente sesión — la Fase 11 cerró sus cuatro bloques

> Reescrito al cerrar la sesión 37 (2026-07-21, Fase 11 · endurecimiento, ADR 0026).
> Cuando la próxima sesión termine, **reescribe este fichero** con el prompt de la siguiente.

---

## Estado en una línea

Frentes B y C **cerrados**, y la **Fase 11 con sus cuatro bloques hechos** (aislamiento, RGPD, observabilidad, copias). Lo que queda del producto ya no es construir: es **desplegar lo de esta sesión** y **conseguir el primer camping real**. Casi todo lo demás está bloqueado por credenciales o por no tener cliente.

## ⚠️ Lo primero de la próxima sesión, antes que nada

**La Fase 11 NO está desplegada.** El commit está en `main` pero la demo sigue sirviendo la versión anterior, y hay una **migración de D1 nueva** (`0005_rgpd.sql`, aditiva: tres columnas nulables, sin backfill).

```bash
cd apps/api && pnpm run deploy:demo   # compone site+web+dashboard, migra la D1 remota y despliega
```

Después, comprobar en vivo:

- `camp.logic2b.com/docs/tecnica/datos-rgpd/` → la ficha corregida
- `camp.logic2b.com/demo/privacidad`, `/aviso-legal`, `/cookies` → las páginas legales nuevas
- Ficha de cliente en el dashboard → "Protección de datos" con export, supresión y consentimiento
- Y el caso bonito: **suprimir un cliente con estancia reciente** debe responder con la fecha exacta desde la que se podrá

Los assets tardan ~30 s en propagar: 404 mezclados con 200 justo después **no** es un fallo.

## ▶ Prompt para pegar

```
Logic Camp (SaaS de campings, monorepo pnpm/Turborepo, repo amariner/logic2b-camp).
Lee primero PROGRESS.md, CLAUDE.md y docs/ROADMAP.md antes de tocar nada.

Estado: main al día en GitHub (commit 586cbef). Frentes B y C cerrados y la Fase 11
(endurecimiento, ADR 0026) con sus cuatro bloques hechos: aislamiento verificable
por barrido de las 42 rutas, RGPD operativo (export, supresión que anonimiza y
niega con fecha, consentimiento con versión, retención en cron, páginas legales),
observabilidad mínima y copias con runbook. pnpm check verde 42/42.

PRIMERO, ANTES DE NADA: la Fase 11 no está desplegada y trae migración de D1 nueva
(0005_rgpd.sql, aditiva). Ejecuta `cd apps/api && pnpm run deploy:demo` y verifica
en vivo las páginas legales, la ficha técnica corregida y el bloque de protección
de datos en la ficha de cliente. Los assets tardan ~30 s en propagar.

Después, elige objetivo. Mi recomendación en orden:

1. FASE 9 — primer alta real de un tenant. Es lo único que queda para cerrar una
   fase entera y lo que de verdad desbloquea el negocio. `pnpm new:camping` está
   escrito y testeado (17 tests) pero `--apply` NUNCA se ha ejecutado contra la
   cuenta de Cloudflare. Necesita credenciales y que Andreu esté presente.

2. PARTE DE VIAJEROS (SES.Hospedajes). El hueco funcional más grande que queda
   para un camping español real: el modelo ya captura documento, nacimiento y
   nacionalidad, y la retención ya respeta su plazo de 3 años, pero no existe ni
   el fichero con el formato oficial ni su envío. Es integración con la
   Administración: fase propia con su ADR.

3. Remates de BACKLOG si prefieres sesión corta: sidebar móvil off-canvas (el
   primitivo Sheet ya existe), "en casa" en /reservas, idiomas fr/de/nl de la
   landing, guías de /informes /tarifas /ajustes.

Contrato del proyecto (CLAUDE.md, no negociable):
- ~6h/semana; nada que multiplique el trabajo por camping. Dar de alta un camping
  debe costar una tarde.
- TypeScript estricto, nada de `any`. Dinero en céntimos enteros con desglose
  auditable. Fechas ISO sin zona, date_from inclusive / date_to exclusive.
- Textos de UI siempre vía i18n. Cero mocks en el cliente: el "modo fake" se
  resuelve en el seed.
- ADR en docs/adr/NNNN-titulo.md ANTES de escribir código, y PARAR a validar.
- `pnpm check` verde antes de cerrar.

Cierra con /session-close, mergea a main, súbelo a GitHub y reescribe
docs/SIGUIENTE-SESION.md apuntando a lo que siga.
```

---

## El mapa completo de lo que queda

| Candidato                              | Estado                                    | Bloqueo                                                                       |
| -------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------- |
| **Desplegar la Fase 11**               | ⬜ Pendiente                              | **Ninguno** ← hazlo primero                                                   |
| **Fase 9 · Alta real de un tenant**    | 🟨 Solo falta `--apply`                   | Credenciales + Andreu presente                                                |
| **Parte de viajeros (SES.Hospedajes)** | ⬜ Sin empezar                            | Ninguno técnico — es fase propia con su ADR                                   |
| Fase 11 · Sentry/Logpush               | ⬜ Enganche listo en un solo punto        | Credenciales                                                                  |
| Fase 11 · Ensayo real de restauración  | ⬜ Runbook escrito, tabla de ensayo vacía | Credenciales de Cloudflare                                                    |
| Fase 11 · Pruebas de carga             | ⬜                                        | **Falta el objetivo declarado**, no el tiempo                                 |
| Fase 10 · Dashboard demo readonly      | 🟨                                        | Alcance sin decidir (ADR 0013)                                                |
| Fase 10 · Web Analytics                | 🟨                                        | Credenciales. **Ojo: si no es cookieless, rompe la posición de "sin banner"** |
| Fase 10 · `ui.logic2b.com` / Storybook | ⬜                                        | Su propio objetivo de fase + decisión B-iii                                   |
| C5 · Descargar 6 fotos                 | 🟨                                        | **Red**, no código. `pnpm --filter @tenant/demo fetch:fotos`                  |
| Fase 12 · Camp Motor                   | 🚫                                        | **No construir hasta que alguien pague**                                      |

## Decisiones abiertas

- **B-iii** — relación entre `packages/ui` y `ui.logic2b.com`. Bloquea el Storybook de la Fase 10.
- **B-iv** — logotipo completo de Logic2B (hoy solo el isotipo monocromo).
- **B-v** — ¿puede el dashboard de un camping teñir `--primary` con su color, o se mantiene neutro Logic2B?
- **Indexación de la demo** — la landing y las guías se indexan; la demo bajo `/demo/` va `noindex`. Confirmar que sigue siendo lo que se quiere.
- **NUEVA — ¿auditoría con encadenado criptográfico?** La ficha técnica ya dice con precisión lo que el `audit_log` es y lo que no. Construir el append-only con hash solo si un cliente lo exige: su valor frente a un D1 gestionado con PITR es discutible.

## Cosas que hay que saber antes de tocar nada

- **El `main` local puede quedarse atrás.** Pasó en la sesión 36 (5 commits, árbol limpio, nada lo delataba). **`git fetch` y compara antes de trabajar.**
- **`pnpm db:reset` hace `rm -rf .wrangler-demo`** → reinicia el Worker después. La base local está **una migración por detrás** si no la reseteas (le faltan las columnas de `0005_rgpd.sql`).
- **El dashboard necesita el flag de dev**: `--var LOGIC_CAMP_DEV_ORIGINS:1` (ya en `.claude/launch.json`). Sin él, login 403 en `:5173`.
- **Credenciales del seed** (contraseña `calasereno`): `direccion@` / `gerencia@` / `recepcion@` / `consulta@calasereno.example`.
- **Cero mocks en el cliente** — propiedad del proyecto. "Modo fake" se resuelve en el seed.
- **El segfault de workerd sobre `reset.test.ts` es del contenedor cloud.** En la máquina de Andreu da 42/42 (confirmado de nuevo en la sesión 37). Si ves 40/42 en cloud, es eso.
- **`vitest-pool-workers` aísla el almacenamiento POR TEST**: lo que crea un `it` no lo ve el siguiente. Solo lo escrito en `beforeAll` persiste. Costó dos vueltas descubrirlo en la sesión 37 — **cada test debe crear sus propios datos**.
- **Una ruta nueva de API nace con test de fuga cruzada**, sin que nadie haga nada. Si añades una que el barrido no sepa recorrer, `isolation.test.ts` **falla** y te dice qué declarar. No lo silencies metiéndola en excepciones sin motivo real.
- **`exports/` está en `.gitignore` y debe seguir estando**: contiene documentos de identidad de huéspedes reales.
- **Si algún día se añade analítica que NO sea cookieless**, hay que revisar la política de cookies y probablemente poner banner. El aviso está escrito en `apps/web/src/lib/legal.ts` y junto a los scripts de `Base.astro`.
- **El mapa de color tiene contrato de test** (`packages/ui/test/theme-contrast.test.ts`).
- **El precio lo calcula SIEMPRE el servidor** (`requote`/`move`, ADR 0023).
- **Red bloqueada a `cloudfront.net`**: confirmado en 4 sesiones. Es tarea de Andreu desde su máquina.

## Verificación sin poder levantar wrangler

Patrón ya usado en C1, C5 y C6: `vite build` real del dashboard + servidor Node stub que sirve ese bundle y responde `/api/admin/*` con datos del MISMO `generateSeed(2026)` + Playwright. El stub es un script de sesión y **nunca se commitea**. Para `apps/web` y `apps/site` basta `preview_start` con las configs de `.claude/launch.json` (puertos 4321 y 4330) — así se verificaron las páginas legales en la sesión 37.
