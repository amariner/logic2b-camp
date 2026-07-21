# Prompt para la siguiente sesión — Fase 11 desplegada, remates en marcha

> Reescrito al cerrar la sesión 38 (2026-07-21, remates cortos de BACKLOG).
> Cuando la próxima sesión termine, **reescribe este fichero** con el prompt de la siguiente.

---

## Estado en una línea

Frentes B y C **cerrados**; la **Fase 11 desplegada y verificada** en producción (versión `f4288603`, migración `0005_rgpd.sql` aplicada). Lo que queda del producto ya no es construir: es **conseguir el primer camping real** (Fase 9) o cerrar el **parte de viajeros** (fase propia). Casi todo lo demás está bloqueado por credenciales o por no tener cliente.

## ⚠️ Lo único sin comprobar de la Fase 11 (necesita sesión logueada)

El bloque **"Protección de datos"** de la ficha de cliente en el dashboard no se ha verificado en vivo (una sesión cloud sin credenciales no puede loguearse contra la demo desplegada). Son 5 minutos, tarea de Andreu:

- Entra en `camp.logic2b.com/admin/` con `gerencia@calasereno.example` / `calasereno`.
- Abre un cliente con estancia reciente e intenta **suprimirlo**: debe responder con **la fecha exacta** desde la que se podrá (RD 933/2021), no con un error genérico.

## ▶ Prompt para pegar

```
Logic Camp (SaaS de campings, monorepo pnpm/Turborepo, repo amariner/logic2b-camp).
Lee primero PROGRESS.md, CLAUDE.md y docs/ROADMAP.md antes de tocar nada.
Haz `git fetch` y compara con origin/main ANTES de trabajar: el main local se ha
quedado atrás con el árbol limpio en dos sesiones distintas (36 y 38).

Estado: main al día en GitHub. Frentes B y C cerrados; la Fase 11 (endurecimiento,
ADR 0026) con sus cuatro bloques hechos y DESPLEGADA y verificada en producción
(versión f4288603, migración 0005 aplicada). pnpm check verde 42/42 en la máquina
de Andreu (en cloud, 38/42 por el segfault de workerd y el flaky del rate-limit,
ambientales — verificar en aislamiento las suites tocadas).

Sin comprobar de la fase anterior: el bloque "Protección de datos" de la ficha de
cliente (necesita sesión logueada; 5 min de Andreu — ver arriba).

Elige objetivo. Recomendación en orden:

1. FASE 9 — primer alta real de un tenant. Lo único que cierra una fase entera y
   lo que desbloquea el negocio. `pnpm new:camping` está escrito y testeado (17
   tests) pero `--apply` NUNCA se ha ejecutado contra Cloudflare (doble candado:
   --apply + LOGIC_CAMP_ALLOW_INFRA=1). Requiere credenciales y que Andreu esté
   presente y decida el camping. NO ejecutar por tu cuenta.

2. PARTE DE VIAJEROS (SES.Hospedajes). El mayor hueco funcional para un camping
   español real: el modelo ya captura documento, nacimiento y nacionalidad (ADR
   0022) y la retención respeta su plazo de 3 años (ADR 0026), pero no existe ni
   el fichero con el formato oficial ni su envío. Fase propia, ADR 0027 primero y
   PARAR a validar. La parte que sí se puede hacer sin credenciales es generar el
   fichero en formato oficial (puro y testeable, como la capa PaymentProvider de
   Fase 8); el envío se difiere hasta tener credenciales SES + establecimiento.

3. Remates de BACKLOG (sesión corta): idiomas fr/de/nl de la landing
   (apps/site/src/content/{lang}.json), guías de /informes /tarifas /ajustes.
   (Ya hechos en sesión 38: sidebar móvil off-canvas y "en casa" en /reservas.)

Contrato del proyecto (CLAUDE.md, no negociable):
- ~6h/semana; nada que multiplique el trabajo por camping.
- TypeScript estricto, nada de `any`. Dinero en céntimos con desglose auditable.
  Fechas ISO sin zona, date_from inclusive / date_to exclusive.
- Textos de UI vía i18n. Cero mocks en el cliente: el "fake" se resuelve en el seed.
- ADR en docs/adr/NNNN-titulo.md ANTES de escribir código, y PARAR a validar.
- pnpm check verde antes de cerrar.

Cierra con /session-close, mergea a main, súbelo a GitHub y reescribe
docs/SIGUIENTE-SESION.md apuntando a lo que siga.
```

---

## El mapa completo de lo que queda

| Candidato                              | Estado                                    | Bloqueo                                                                       |
| -------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------- |
| **Fase 9 · Alta real de un tenant**    | 🟨 Solo falta `--apply`                   | Credenciales + Andreu presente                                                |
| **Parte de viajeros (SES.Hospedajes)** | ⬜ Sin empezar                            | Ninguno técnico para el fichero — es fase propia con su ADR (0027)            |
| Verificar "Protección de datos" ficha  | 🟨 Código desplegado                      | Sesión logueada (5 min de Andreu)                                            |
| Fase 11 · Sentry/Logpush               | ⬜ Enganche listo en un solo punto        | Credenciales                                                                  |
| Fase 11 · Ensayo real de restauración  | ⬜ Runbook escrito, tabla de ensayo vacía | Credenciales de Cloudflare                                                    |
| Fase 11 · Pruebas de carga             | ⬜                                        | **Falta el objetivo declarado**, no el tiempo                                 |
| Fase 10 · Dashboard demo readonly      | 🟨                                        | Alcance sin decidir (ADR 0013)                                                |
| Fase 10 · Web Analytics                | 🟨                                        | Credenciales. **Ojo: si no es cookieless, rompe la posición de "sin banner"** |
| Fase 10 · `ui.logic2b.com` / Storybook | ⬜                                        | Su propio objetivo de fase + decisión B-iii                                   |
| C5 · Descargar 6 fotos                 | 🟨                                        | **Red**, no código. `pnpm --filter @tenant/demo fetch:fotos`                  |
| Remates B3/C6 (fr/de/nl landing, guías gestión) | ⬜                              | Ninguno — contenido, sesión corta                                            |
| Fase 12 · Camp Motor                   | 🚫                                        | **No construir hasta que alguien pague**                                      |

## Decisiones abiertas

- **B-iii** — relación entre `packages/ui` y `ui.logic2b.com`. Bloquea el Storybook de la Fase 10.
- **B-iv** — logotipo completo de Logic2B (hoy solo el isotipo monocromo).
- **B-v** — ¿puede el dashboard de un camping teñir `--primary` con su color, o se mantiene neutro Logic2B?
- **Indexación de la demo** — la landing y las guías se indexan; la demo bajo `/demo/` va `noindex`. Confirmar.
- **¿auditoría con encadenado criptográfico?** Construir el append-only con hash solo si un cliente lo exige.

## Cosas que hay que saber antes de tocar nada

- **El `main` local puede quedarse atrás.** Pasó en las sesiones 36 y 38 (árbol limpio, nada lo delataba salvo comparar con el remoto). **`git fetch` y compara antes de trabajar.**
- **`pnpm db:reset` hace `rm -rf .wrangler-demo`** → reinicia el Worker después. La base local está **una migración por detrás** si no la reseteas (le faltan las columnas de `0005_rgpd.sql`).
- **El dashboard necesita el flag de dev**: `--var LOGIC_CAMP_DEV_ORIGINS:1` (ya en `.claude/launch.json`). Sin él, login 403 en `:5173`.
- **Credenciales del seed** (contraseña `calasereno`): `direccion@` / `gerencia@` / `recepcion@` / `consulta@calasereno.example`.
- **Cero mocks en el cliente** — propiedad del proyecto. "Modo fake" se resuelve en el seed.
- **El segfault de workerd sobre `reset.test.ts` es del contenedor cloud.** En la máquina de Andreu da 42/42. Si ves 40/42 (o más ruido: crash de esbuild "callback is not a function" tras un reinicio del worker) en cloud, es ambiental — **verifica en aislamiento las suites que tocaste** y sigue.
- **`vitest-pool-workers` aísla el almacenamiento POR TEST**: lo que crea un `it` no lo ve el siguiente. Solo lo escrito en `beforeAll` persiste. **Cada test crea sus propios datos.**
- **Una ruta nueva de API nace con test de fuga cruzada** por el barrido de `isolation.test.ts`. Si añades una que no sepa recorrer, **falla** y te dice qué declarar. No la silencies sin motivo real.
- **`exports/` está en `.gitignore` y debe seguir estando**: contiene documentos de identidad de huéspedes reales.
- **Si algún día se añade analítica que NO sea cookieless**, hay que revisar la política de cookies y probablemente poner banner.
- **El mapa de color tiene contrato de test** (`packages/ui/test/theme-contrast.test.ts`).
- **El precio lo calcula SIEMPRE el servidor** (`requote`/`move`, ADR 0023).
- **Red bloqueada a `cloudfront.net`**: confirmado en 4+ sesiones. Es tarea de Andreu desde su máquina.
- **El `@theme` de `packages/ui/src/theme.css` debe declarar TODA familia de token que se use como utilidad** (`bg-*`, `border-*`…). La familia `sidebar` faltaba y salía transparente (sesión 38). Si añades un token a `:root`, mapéalo en `@theme` o la clase no genera CSS y "funciona por coincidencia".

## Verificación sin poder levantar wrangler

Patrón ya usado en C1, C5, C6 y en la sesión 38 (shell): `vite build` real del dashboard + servidor Node stub que sirve ese bundle y responde `/api/auth/get-session` + `/api/admin/*` con datos del generador de seed puro (o mínimos) + Playwright a 1366px y 375px. El stub es un script de sesión y **nunca se commitea** (vive en el scratchpad). Para `apps/web` y `apps/site` basta `preview_start` con las configs de `.claude/launch.json` (puertos 4321 y 4330).
