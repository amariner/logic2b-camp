# Prompt para la siguiente sesión — parte de viajeros implementado; toca desplegarlo

> Reescrito al cerrar la sesión 43 (2026-07-23: ADR 0028 validado e implementado —
> parte de viajeros SES.Hospedajes—, sin desplegar). Cuando la próxima sesión termine,
> **reescribe este fichero** con el prompt de la siguiente.

---

## Estado en una línea

El **parte de viajeros (ADR 0028)** está **implementado y verde** (`pnpm check` 45/45
local), pero **sin desplegar** y **sin verificar contra el webservice real de
SES.Hospedajes** (no hay credenciales). Todo commiteado en la rama de la sesión 43,
lista para mergear a `main`.

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
- El PARTE DE VIAJEROS (ADR 0028, SES.Hospedajes / RD 933/2021) está IMPLEMENTADO y
  verde (pnpm check 45/45 local, API 182/182, hospedajes 22/22). Vertical completo:
  migración D1 0006 aditiva, paquete puro packages/hospedajes (buildParte/serializeParte/
  transporte manual+ses), config modules.hospedajes + secrets SES en el Worker, rutas
  GET /hospedajes/parte y POST /hospedajes/enviar (con audit_log, cubiertas por el
  barrido de aislamiento), pantalla "Parte de viajeros" en el dashboard, ficha de
  huésped ampliada, guía gestion/parte, y seed con datos SES reales.
- NO está desplegado. sesTransport (webservice real) está ESCRITO pero SIN VERIFICAR
  contra el entorno real — no hay credenciales (misma categoría que Stripe/Redsys).

LO PRIMERO: decide con Andreu el objetivo (una sesión = un objetivo, dilo antes):

OPCIÓN A — DESPLEGAR el parte de viajeros (lo natural tras la sesión 43):
  - `cd apps/api && pnpm run deploy:demo` — compone site+web+dashboard, aplica la
    migración 0006 en la D1 remota y despliega el Worker. El módulo hospedajes ya va
    activo en el seed de la demo, así que la pantalla nace con datos.
  - Verificar en producción (dashboard usa rutas HASH: /admin/#/parte tras login
    gerencia@calasereno.example / calasereno): la lista de llegadas, los avisos de
    datos que faltan, el select de forma de pago, la descarga del XML, y el ? a
    /docs/gestion/parte/. La demo opera en MODO MANUAL (sin secrets SES) → "Enviar"
    no aparece, solo "Descargar XML". Correcto y esperado.
  - OJO: la demo hace reset nocturno; el módulo hospedajes vive en el seed, se
    mantiene. La migración 0006 hay que aplicarla en remoto (el deploy:demo lo hace).

OPCIÓN B — VERIFICAR contra SES.Hospedajes real (requiere a Andreu + credenciales):
  - Cerrar los nombres/códigos exactos del XML contra la ESPECIFICACIÓN OFICIAL del
    webservice (serializeParte tiene hoy una estructura provisional y honesta): sexo,
    parentesco, país en alpha-3 (la ficha guarda alpha-2 → mapear en serialize),
    forma de pago. Poner los secrets SES_HOSPEDAJES_* como wrangler secret. Probar
    sesTransport contra el entorno de PRUEBAS de SES. NO por tu cuenta: credenciales.

OPCIÓN C — FASE 9, primer alta real de un tenant. `pnpm new:camping` escrito y
  testeado (17 tests) pero --apply NUNCA ejecutado (doble candado). Requiere
  credenciales de Cloudflare y a Andreu presente decidiendo el camping.

CONTRATO (CLAUDE.md, no negociable)
- ~6h/semana; nada que multiplique el trabajo por camping.
- TypeScript estricto, nada de `any`. Dinero en céntimos con desglose auditable.
  Fechas ISO sin zona, date_from inclusive / date_to exclusive.
- Textos de UI SIEMPRE vía i18n. Cero mocks: el "fake" se resuelve en el seed.
- ADR antes de código en fase nueva, y PARAR a validar. pnpm check verde al cerrar.

TRAMPAS CONOCIDAS
- vitest-pool-workers aísla el almacenamiento POR TEST; solo persiste beforeAll.
- Segfault de workerd sobre reset.test.ts = contenedor cloud (45/45 en local).
- seed.sql está gitignored (se regenera con `pnpm --filter @tenant/demo seed:sql`).
- Dashboard en dev: --var LOGIC_CAMP_DEV_ORIGINS:1 (ya en launch.json) o 403.
- El dashboard en prod usa rutas HASH (/admin/#/parte); /admin/parte da 404 (no es
  fallo). Para verificar logueado: /admin/, login gerencia@calasereno.example /
  calasereno, navega por hash.
- exports/ sigue en .gitignore (documentos de identidad reales).
- Verificación sin wrangler: vite/astro build real + servidor Node/python sobre el
  dist + navegador. Scripts de sesión NUNCA se commitean.

Cierra con /session-close, mergea a main, súbelo a GitHub y reescribe
docs/SIGUIENTE-SESION.md apuntando a lo que siga.
```

---

## Notas de la sesión 43

- **ADR 0028** validado por Andreu → estado `aceptado`. Dos hallazgos del pase /equipo
  incorporados y, además, la corrección contra la espec: el campo es **"número de
  soporte del documento"**, no "fecha/país de expedición" (que el ADR anticipó de
  memoria). Por eso el contrato pide cerrar contra la espec oficial.
- **Barrido de aislamiento**: las 2 rutas nuevas quedaron cubiertas solas (46→48 sin
  tocar `isolation.test.ts`). La propiedad de diseño del ADR 0026 funcionando.
- **Bug de contraste** cazado en la verificación en navegador: `--lc-status-*-fg` es
  texto para el chip, no para el fondo de página. Corregido a `foreground`/
  `muted-foreground` + ámbar en el icono. AA en claro y oscuro.
- **Lo que queda del parte**, señalizado sin inventar: envío real sin verificar
  (credenciales), campos/códigos exactos del XML contra la espec, y traducir la prosa
  de la guía (hoy solo `es`, fallback visible).
