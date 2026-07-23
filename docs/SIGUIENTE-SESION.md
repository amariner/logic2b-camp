# Prompt para la siguiente sesión — parte de viajeros DESPLEGADO; elegir frente

> Reescrito al cerrar la sesión 44 (2026-07-24: desplegado el parte de viajeros a la
> demo y re-sembrada la D1 remota a mano). Cuando la próxima sesión termine,
> **reescribe este fichero** con el prompt de la siguiente.

---

## Estado en una línea

El **parte de viajeros (ADR 0028)** está **desplegado y verificado en producción**
(`camp.logic2b.com`, versión `105e5097`, migración 0006 aplicada, demo re-sembrada
con el módulo activo). Sigue **sin verificar contra el webservice SES real** (sin
credenciales). Todo lo de la sesión 44 fue deploy/datos/docs — **cero cambios de
código**; `main` local = `origin/main`.

## ▶ Prompt para pegar

```
Logic Camp (SaaS de campings, monorepo pnpm/Turborepo, repo amariner/logic2b-camp,
dir /Users/andreumariner/Desktop/proyectos/logic-camp).

Lee PROGRESS.md, CLAUDE.md, docs/EQUIPO.md y docs/ROADMAP.md antes de tocar nada.
Haz `git fetch` y compara con origin/main ANTES de trabajar: el main local se queda
atrás con el árbol limpio en varias sesiones. Compara siempre.

CÓMO TRABAJAR: ocho lentes de rol a la vez (arquitecto, fullstack, backend, frontend,
product, UX, UI, SEO) — docs/EQUIPO.md. Aplícalas SIEMPRE. El skill /equipo hace un
pase explícito sobre un ADR o un diff.

ESTADO
- El PARTE DE VIAJEROS (ADR 0028) está DESPLEGADO y verificado en la demo
  (camp.logic2b.com, versión 105e5097, migración 0006 en remoto, módulo hospedajes
  activo tras re-sembrar). Opera en MODO MANUAL (sin secrets SES): "Descargar XML",
  sin "Enviar". El envío real (sesTransport) sigue SIN VERIFICAR — no hay credenciales.
- OJO / TRAMPA NUEVA (sesión 44): la demo NO re-siembra la D1 remota sola. El "reset
  nocturno" que decían las notas NO existe en el código (ni scheduled(), ni la GH
  Action, ni script). El deploy lleva SCHEMA (migración), no DATOS. Si cambias el seed
  (p. ej. activar un módulo en tenants.modules), hay que re-sembrar la remota A MANO:
  wipe hijos→padres por --command (D1 SÍ fuerza FKs; el --file masivo hace fetch
  failed), preservando d1_migrations, + `wrangler d1 execute --remote --file seed.sql`
  (INSERT-only, exige DB vacía). Ver memoria demo-sin-reseed-remoto y BACKLOG [infra].

LO PRIMERO: decide con Andreu el objetivo (una sesión = un objetivo, dilo antes):

OPCIÓN A — INFRA: `pnpm db:seed:remote` (cierra la trampa de arriba). Un script/skill
  que encapsule wipe FK-safe (orden hijos→padres, --command tabla a tabla, preserva
  d1_migrations) + `seed:sql` + `seed --file` contra la remota, en un comando. Es la
  deuda [infra] del BACKLOG y evita repetir a mano el reseed de la sesión 44. Pequeño,
  sin credenciales nuevas (el token de Cloudflare de Andreu ya vale), alto valor.

OPCIÓN B — VERIFICAR contra SES.Hospedajes real (requiere a Andreu + credenciales):
  cerrar nombres/códigos exactos del XML contra la ESPECIFICACIÓN OFICIAL del
  webservice (serializeParte tiene estructura provisional y honesta): sexo, parentesco,
  país en alpha-3 (la ficha guarda alpha-2 → mapear en serialize), forma de pago. Poner
  los secrets SES_HOSPEDAJES_* como wrangler secret. Probar sesTransport contra el
  entorno de PRUEBAS de SES. NO por tu cuenta: credenciales.

OPCIÓN C — FASE 9, primer alta real de un tenant. `pnpm new:camping` escrito y
  testeado (17 tests) pero --apply NUNCA ejecutado (doble candado). Requiere
  credenciales de Cloudflare y a Andreu presente decidiendo el camping.

OPCIÓN D — traducir la prosa de la guía gestion/parte (hoy solo es, fallback visible).
  Sin código ni credenciales; mismo criterio diferido del ADR 0025 §3.

CONTRATO (CLAUDE.md, no negociable)
- ~6h/semana; nada que multiplique el trabajo por camping.
- TypeScript estricto, nada de `any`. Dinero en céntimos con desglose auditable.
  Fechas ISO sin zona, date_from inclusive / date_to exclusive.
- Textos de UI SIEMPRE vía i18n. Cero mocks: el "fake" se resuelve en el seed.
- ADR antes de código en fase nueva, y PARAR a validar. pnpm check verde al cerrar.

TRAMPAS CONOCIDAS
- La demo NO tiene reseed remoto (ver ESTADO/OJO arriba). D1 fuerza FKs.
- vitest-pool-workers aísla el almacenamiento POR TEST; solo persiste beforeAll.
- Segfault de workerd sobre reset.test.ts = contenedor cloud (45/45 en local).
- seed.sql está gitignored (se regenera con `pnpm --filter @tenant/demo seed:sql`).
- Dashboard en dev: --var LOGIC_CAMP_DEV_ORIGINS:1 (ya en launch.json) o 403.
- El dashboard en prod usa rutas HASH (/admin/#/parte); /admin/parte da 404 (no es
  fallo). Para verificar logueado: /admin/, login gerencia@calasereno.example /
  calasereno, navega por hash. (El wipe de la 44 borró sesiones → toca re-login.)
- exports/ sigue en .gitignore (documentos de identidad reales).
- Verificación sin wrangler: vite/astro build real + servidor Node/python sobre el
  dist + navegador. Scripts de sesión NUNCA se commitean.

Cierra con /session-close, mergea a main, súbelo a GitHub y reescribe
docs/SIGUIENTE-SESION.md apuntando a lo que siga.
```

---

## Notas de la sesión 44

- **Objetivo cumplido**: Opción A de la 43 (desplegar el parte). Deploy limpio, la
  pantalla del parte funciona con datos reales en producción, modo manual correcto.
- **Lo que costó**: el supuesto de que "la pantalla nace con datos porque el módulo
  va en el seed" era **falso** — no hay reseed remoto. Diagnóstico honesto (no se
  improvisó un wipe destructivo sin decidirlo con Andreu; se preguntó y eligió
  "reseed completo"), y ejecución cuidadosa (FK-safe, `d1_migrations` preservada).
- **Descubrimientos de plataforma** (memoria `demo-sin-reseed-remoto`): D1 **sí**
  fuerza foreign keys; el `--file` masivo hace `fetch failed` por timeout mientras
  los `--command` pequeños entran; el `seed.sql` es INSERT-only.
- **Pendiente que sigue igual**: envío SES real (credenciales), campos/códigos del
  XML contra la espec, prosa de la guía en más idiomas.
