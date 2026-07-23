# Prompt para la siguiente sesión — guía de gestión desplegada; ADR 0028 escrito y a validar

> Reescrito a mitad de la sesión 42 (2026-07-23: deploy de la guía de gestión + sistema
> de roles EQUIPO + ADR 0028 del parte de viajeros, pendiente de validación).
> Cuando la próxima sesión termine, **reescribe este fichero** con el prompt de la siguiente.

---

## Estado en una línea

La cuarta guía "gestión" **ya está en producción y verificada** (`camp.logic2b.com`,
versión `e3113865`). Se creó el sistema **EQUIPO** (ocho lentes de rol documentadas) y
se escribió el **ADR 0028 (parte de viajeros)**, ya refinado con el pase `/equipo` pero
**pendiente del OK de Andreu**. Nada de esta sesión está commiteado todavía.

## ⚠️ Antes de nada: hay trabajo SIN COMMITEAR de la sesión 42

`git status` mostrará esto (main local estaba al día con origin/main al empezar):

- `M CLAUDE.md` — sección nueva "Cómo se trabaja este proyecto" (puntero a EQUIPO).
- `?? docs/EQUIPO.md` — los ocho roles, vetos, desempate y checklist.
- `?? .claude/skills/equipo/` — skill `/equipo` (pase de revisión invocable).
- `?? docs/adr/0028-parte-de-viajeros.md` — ADR **propuesto**, a validar.

Decide con Andreu si esto se commitea ya (docs + skill, sin código, es seguro) o se
agrupa con la implementación del parte. El deploy de producción NO depende de ello.

## ▶ Prompt para pegar

```
Logic Camp (SaaS de campings, monorepo pnpm/Turborepo, repo amariner/logic2b-camp,
dir /Users/andreumariner/Desktop/proyectos/logic-camp).

Lee PROGRESS.md, CLAUDE.md, docs/EQUIPO.md y docs/ROADMAP.md antes de tocar nada.
Haz `git fetch` y compara con origin/main ANTES de trabajar: el main local se queda
atrás con el árbol limpio en varias sesiones. Compara siempre.

CÓMO TRABAJAR (nuevo desde la sesión 42): este proyecto se desarrolla desde OCHO
lentes de rol a la vez (arquitecto, fullstack, backend, frontend, product designer,
UX, UI, SEO) — ver docs/EQUIPO.md, con el mandato, los vetos y el desempate de cada
uno. Aplícalas SIEMPRE, no solo al invocar. El skill /equipo hace un pase explícito
sobre un ADR o un diff. CLAUDE.md ya apunta a esto.

ESTADO
- La cuarta guía "gestión" (informes/tarifas/ajustes) está DESPLEGADA y verificada en
  producción (camp.logic2b.com, versión e3113865): /docs/ con 4 tarjetas, prosa
  renderiza, el ? del dashboard apunta bien en las tres pantallas. Cero errores.
- Trabajo de la sesión 42 SIN COMMITEAR (ver git status): CLAUDE.md (puntero EQUIPO),
  docs/EQUIPO.md, .claude/skills/equipo/, docs/adr/0028-parte-de-viajeros.md.
- ADR 0028 (parte de viajeros / SES.Hospedajes / RD 933/2021): ESCRITO y refinado con
  el pase /equipo, estado "propuesto", PENDIENTE de validación de Andreu. NO escribas
  código hasta que lo apruebe (contrato CLAUDE.md).

LO PRIMERO: confirma con Andreu si valida el ADR 0028 (o si hay que ajustarlo). Solo
tras el OK, implementar. El pase /equipo ya dejó dos hallazgos incorporados al ADR:
  1. El modelo NO captura todo: faltan casi seguro columnas SES (sexo, 2º apellido,
     fecha/país de expedición del documento, parentesco de menores<14) → migración
     0006 aditiva + ampliar la ficha de huésped. El alcance real es salida + columnas
     + ficha, no solo salida.
  2. El medio de pago NO se deriva de payments.provider (es el proveedor, no el medio):
     se captura explícitamente (paymentKind propio, nulable).

IMPLEMENTACIÓN DEL PARTE (tras OK), en este orden:
- Migración D1 0006 aditiva (columnas nulables) + ampliar la ficha de huésped y sus
  esquemas Zod. Cerrar los campos exactos contra la ESPECIFICACIÓN OFICIAL de
  SES.Hospedajes (no de memoria).
- Paquete puro packages/hospedajes (espejo de PaymentProvider / ADR 0011): buildParte
  (valida y devuelve issues por reserva/campo) + serializeParte (contra la espec) +
  interfaz HospedajesTransport con manualTransport (descarga, opera hoy) y sesTransport
  (webservice real, sin verificar hasta credenciales). Tests puros como redsys/modes.
- Config en tenants.modules.hospedajes (schema Zod junto a tenantLegalSchema en
  packages/config); credenciales SES como secrets del Worker, NO en modules.
- apps/api: GET /hospedajes/parte?date= y POST /hospedajes/enviar (con audit_log).
  Rutas nuevas → nacen cubiertas por el barrido de isolation.test.ts (automático).
- Dashboard: pantalla mínima "Parte de viajeros" + ? a página nueva de la guía gestión.

ALTERNATIVAS SI ANDREU CAMBIA DE OBJETIVO (una sesión = un objetivo, dilo antes):
1. FASE 9 — primer alta real de un tenant. `pnpm new:camping` escrito y testeado (17
   tests) pero --apply NUNCA ejecutado (doble candado --apply + LOGIC_CAMP_ALLOW_INFRA=1).
   Requiere credenciales y a Andreu presente decidiendo el camping. NO por tu cuenta.
2. Remates cortos: 2ª tanda de fotos del tenant (Higgsfield funciona desde el Mac de
   Andreu), o traducir la prosa de las guías a en/ca/fr/de/nl (hoy solo es, fallback
   visible — decisión del ADR 0025, solo si lo pide un cliente real).

CONTRATO (CLAUDE.md, no negociable)
- ~6h/semana; nada que multiplique el trabajo por camping.
- TypeScript estricto, nada de `any`. Dinero en céntimos con desglose auditable.
  Fechas ISO sin zona, date_from inclusive / date_to exclusive.
- Textos de UI SIEMPRE vía i18n (6 ficheros content/{lang}.json en apps/site). Cero
  mocks: el "fake" se resuelve en el seed.
- ADR antes de código en fase nueva, y PARAR a validar. pnpm check verde al cerrar.

TRAMPAS CONOCIDAS
- vitest-pool-workers aísla el almacenamiento POR TEST; solo persiste beforeAll.
- Segfault de workerd sobre reset.test.ts = contenedor cloud (42/42 en local).
- `pnpm db:reset` hace rm -rf .wrangler-demo → reinicia el Worker; la base local va una
  migración por detrás si no la reseteas.
- Dashboard en dev: --var LOGIC_CAMP_DEV_ORIGINS:1 (ya en launch.json) o 403.
- El dashboard en prod usa rutas HASH (/admin/#/informes); /admin/informes da 404 (no
  es fallo). Para verificar el ? logueado: entra en /admin/, login gerencia@
  calasereno.example / calasereno, y navega por hash.
- exports/ sigue en .gitignore (documentos de identidad reales).
- El precio lo calcula SIEMPRE el servidor (requote/move, ADR 0023).
- Verificación sin wrangler: vite/astro build real + servidor Node/python sobre el dist
  + Playwright a 1366px y 375px. Scripts de sesión NUNCA se commitean.

Cierra con /session-close, mergea a main, súbelo a GitHub y reescribe
docs/SIGUIENTE-SESION.md apuntando a lo que siga.
```

---

## Notas de la sesión 42

- **Deploy**: `cd apps/api && pnpm run deploy:demo` subió guía de gestión + dashboard
  con los `?` juntos (versión `e3113865`). Verificado en producción (4 tarjetas, prosa,
  `?` en informes/tarifas/ajustes apuntando a `/docs/gestion/…`, 0 errores de consola).
- **EQUIPO**: `docs/EQUIPO.md` es la fuente de verdad; el puntero en CLAUDE.md la hace
  activa cada sesión; `/equipo` es el pase explícito. Los ocho roles tienen mandato +
  "le importa" + "veta si" + dónde vive, más el orden de desempate y el checklist.
- **ADR 0028**: pasado por `/equipo` — dos hallazgos incorporados (columnas SES que
  faltan; medio de pago no derivable del provider). Estado propuesto, a validar.
