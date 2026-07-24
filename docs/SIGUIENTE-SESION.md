# Prompt para la siguiente sesión — `db:seed:remote` HECHO; elegir frente (B/C/D)

> Reescrito al cerrar la sesión 45 (2026-07-24: cerrada la deuda [infra] con
> `pnpm db:seed:remote`). Cuando la próxima sesión termine, **reescribe este
> fichero** con el prompt de la siguiente.

---

## Estado en una línea

El reseed remoto de la demo ya es **un comando** (`pnpm db:seed:remote`, deuda
[infra] cerrada): plan puro y testeado + doble candado, dry-run por defecto. El
**parte de viajeros (ADR 0028)** sigue desplegado y verde en producción
(`camp.logic2b.com`, versión `105e5097`), en modo manual, **sin verificar contra
el webservice SES real**. La Opción A del prompt anterior está hecha; quedan B, C
y D.

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
- RESEED REMOTO RESUELTO (sesión 45): `pnpm db:seed:remote` encapsula el wipe
  FK-safe (21 tablas hijo→padre por --command, preserva d1_migrations) + seed --file,
  con DOBLE CANDADO (--apply Y LOGIC_CAMP_ALLOW_REMOTE_SEED=1) y dry-run por defecto.
  Plan puro y testeado en tenants/demo/remote-seed.ts (reusa DELETE_ORDER del reset
  local). El --apply REAL nunca se ha ejecutado desde cloud (credenciales) — cuando
  toque re-sembrar la remota de verdad, corre desde la máquina de Andreu con el token
  de Cloudflare: `LOGIC_CAMP_ALLOW_REMOTE_SEED=1 pnpm db:seed:remote --apply`.
- El PARTE DE VIAJEROS (ADR 0028) sigue DESPLEGADO y verde en la demo
  (camp.logic2b.com, versión 105e5097), en MODO MANUAL (sin secrets SES): "Descargar
  XML", sin "Enviar". El envío real (sesTransport) sigue SIN VERIFICAR — no hay
  credenciales.
- La demo sigue SIN reseed AUTOMÁTICO (cron/GH Action) — decisión consciente: el
  reseed es destructivo y raro, un comando bajo doble candado es lo correcto.

LO PRIMERO: decide con Andreu el objetivo (una sesión = un objetivo, dilo antes):

OPCIÓN B — VERIFICAR contra SES.Hospedajes real (requiere a Andreu + credenciales):
  cerrar nombres/códigos exactos del XML contra la ESPECIFICACIÓN OFICIAL del
  webservice (serializeParte tiene estructura provisional y honesta): sexo, parentesco,
  país en alpha-3 (la ficha guarda alpha-2 → mapear en serialize), forma de pago. Poner
  los secrets SES_HOSPEDAJES_* como wrangler secret. Probar sesTransport contra el
  entorno de PRUEBAS de SES. NO por tu cuenta: credenciales. Es la deuda de MÁS valor.

OPCIÓN C — FASE 9, primer alta real de un tenant. `pnpm new:camping` escrito y
  testeado (17 tests) pero --apply NUNCA ejecutado (doble candado). Requiere
  credenciales de Cloudflare y a Andreu presente decidiendo el camping.

OPCIÓN D — traducir la prosa de la guía gestion/parte (hoy solo es, fallback visible).
  Sin código ni credenciales; mismo criterio diferido del ADR 0025 §3 (traducir triplica
  el mantenimiento de por vida con cero clientes en producción — decidido con motivo).

CONTRATO (CLAUDE.md, no negociable)
- ~6h/semana; nada que multiplique el trabajo por camping.
- TypeScript estricto, nada de `any`. Dinero en céntimos con desglose auditable.
  Fechas ISO sin zona, date_from inclusive / date_to exclusive.
- Textos de UI SIEMPRE vía i18n. Cero mocks: el "fake" se resuelve en el seed.
- ADR antes de código en fase nueva, y PARAR a validar. pnpm check verde al cerrar.

TRAMPAS CONOCIDAS
- Reseed remoto: ya hay comando (`pnpm db:seed:remote`), pero el --apply necesita
  credenciales de Cloudflare. D1 remota SÍ fuerza FKs.
- vitest-pool-workers aísla el almacenamiento POR TEST; solo persiste beforeAll.
- Segfault de workerd sobre reset.test.ts = contenedor cloud (45/45 en local). El pool
  del demo revienta con `kj/table.c++:57` / `ECONNREFUSED`; aísla lo tocado y compáralo.
- seed.sql está gitignored (se regenera con `pnpm --filter @tenant/demo seed:sql`).
- Dashboard en dev: --var LOGIC_CAMP_DEV_ORIGINS:1 (ya en launch.json) o 403.
- El dashboard en prod usa rutas HASH (/admin/#/parte); /admin/parte da 404 (no es
  fallo). Login demo: gerencia@calasereno.example / calasereno, navega por hash.
- exports/ sigue en .gitignore (documentos de identidad reales).
- Verificación sin wrangler: vite/astro build real + servidor Node/python sobre el
  dist + navegador. Scripts de sesión NUNCA se commitean.

Cierra con /session-close, mergea a main, súbelo a GitHub y reescribe
docs/SIGUIENTE-SESION.md apuntando a lo que siga.
```

---

## Notas de la sesión 45

- **Objetivo cumplido**: Opción A del prompt anterior — `pnpm db:seed:remote`.
  Tooling puro + shell fino, calcado del idiom de `new:camping` (plan puro testeado
  + ejecutor bajo doble candado). Deuda `[infra]` del BACKLOG cerrada.
- **Decisión de diseño (ocho lentes)**: reusar `DELETE_ORDER` de `reset.ts` como
  fuente única del orden hijo→padre (el wipe local y el remoto no pueden divergir);
  plan puro sin `node:` para que el test corra en el pool de workerd; ejecutor en
  `scripts/` (no bundleado al Worker, como `fetch:fotos`); doble candado porque el
  blast radius es una base de PRODUCCIÓN.
- **No se ejecutó el `--apply` real**: no hay credenciales de Cloudflare en el
  contenedor cloud — igual que `new:camping --apply`, queda para Andreu con el token.
- **Pendiente que sigue igual**: envío SES real (credenciales), campos/códigos del
  XML contra la espec, prosa de la guía en más idiomas.
- **Nota de proceso**: recuerda que en cloud `tenants/demo:test` sale rojo por el
  segfault de workerd; no es regresión. Aísla el test tocado para el semáforo real.
