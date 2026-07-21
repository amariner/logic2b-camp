# Prompt para la siguiente sesión — la Fase 11 cerró sus cuatro bloques

> Reescrito al cerrar la sesión 37 (2026-07-21, Fase 11 · endurecimiento, ADR 0026).
> Cuando la próxima sesión termine, **reescribe este fichero** con el prompt de la siguiente.

---

## Estado en una línea

Frentes B y C **cerrados**, y la **Fase 11 con sus cuatro bloques hechos** (aislamiento, RGPD, observabilidad, copias). Lo que queda del producto ya no es construir: es **desplegar lo de esta sesión** y **conseguir el primer camping real**. Casi todo lo demás está bloqueado por credenciales o por no tener cliente.

## ✅ Desplegado y verificado en producción (2026-07-21, versión `f4288603`)

La Fase 11 **está en vivo** en `camp.logic2b.com`. Verificado tras el despliegue:

- **Migración `0005_rgpd.sql` aplicada en la D1 remota** — `d1_migrations` la lista y `guests` tiene `anonymized_at` y `gdpr_consent_version`.
- **Páginas legales** `/demo/privacidad`, `/aviso-legal`, `/cookies` y `/demo/fr/privacidad` → 200, con los datos del tenant interpolados (sin marcadores `__X__` sin rellenar) y **0 errores de consola**.
- **Ficha técnica corregida** en `/docs/tecnica/datos-rgpd/` → ya dice "42 rutas barridas" y la precisión sobre el registro de auditoría.
- **Rutas RGPD nuevas desplegadas**: `/api/admin/guests/:id/export` y `/api/admin/rgpd/retention` responden **401** sin sesión (existen y exigen rol).
- **`notFound` en JSON**: `/api/no-existe` → `{"error":"not_found","path":"/api/no-existe"}` en vez del HTML por defecto de Hono.

**Lo único que queda por comprobar a mano** (necesita sesión en el dashboard): la ficha de cliente → bloque "Protección de datos", y el caso bonito — **suprimir un cliente con estancia reciente debe responder con la fecha exacta** desde la que se podrá. Credenciales del seed abajo.

## ▶ Prompt para pegar

```
Logic Camp (SaaS de campings, monorepo pnpm/Turborepo, repo amariner/logic2b-camp).
Lee primero PROGRESS.md, CLAUDE.md y docs/ROADMAP.md antes de tocar nada.

Estado: main al día en GitHub (commit 586cbef). Frentes B y C cerrados y la Fase 11
(endurecimiento, ADR 0026) con sus cuatro bloques hechos: aislamiento verificable
por barrido de las 42 rutas, RGPD operativo (export, supresión que anonimiza y
niega con fecha, consentimiento con versión, retención en cron, páginas legales),
observabilidad mínima y copias con runbook. pnpm check verde 42/42.

La Fase 11 YA ESTÁ DESPLEGADA y verificada en camp.logic2b.com (versión f4288603,
migración 0005 aplicada en la D1 remota). Lo único sin comprobar a mano es el
bloque "Protección de datos" de la ficha de cliente en el dashboard, que necesita
sesión: entra con gerencia@calasereno.example / calasereno y prueba suprimir un
cliente con estancia reciente — debe responder con la fecha exacta desde la que
se podrá, no con un error genérico.

Elige objetivo. Mi recomendación en orden:

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
| **Desplegar la Fase 11**               | ✅ Hecho 2026-07-21 (versión `f4288603`)  | —                                                                             |
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
