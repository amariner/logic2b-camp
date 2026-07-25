# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito al cerrar la sesión 48 (2026-07-25: levantar bloqueos desde el
> planning, BACKLOG [C1]).
> Cuando la próxima sesión termine, **reescribe este fichero** con el prompt de
> la siguiente.

---

## Estado en una línea

Las sesiones son **autónomas**: basta "continúa con el desarrollo de este
proyecto" y se ejecuta `docs/CONTINUA.md` completo — **incluido el cierre en
`main` también desde cloud** (permiso permanente de Andreu, 2026-07-25). El MVP
es una **demo fake** — nada de servicios externos reales. El ciclo del bloqueo
(crear y levantar) está ya cerrado en **las dos** pantallas, plano y planning.
Pendiente de deploy en la próxima sesión local:
`pnpm --filter @logic-camp/api deploy:demo` (acumula sesiones 47 y 48).

## ▶ Prompt para pegar

```
continúa con el desarrollo de este proyecto
```

## Candidatos de objetivo para la próxima sesión (elegir UNO, criterio CONTINUA)

- **[C2] Auditar animaciones bajo `prefers-reduced-motion`** en navegador real:
  los componentes llevan `motion-reduce:animate-none` pero **nunca se ha probado
  con la preferencia activa**. Barato de verificar con Playwright
  (`newContext({ reducedMotion: 'reduce' })`) y es suelo de accesibilidad, no
  adorno. Recomendado si se quiere algo cerrado y verificable en una sesión.
- **[B1] Adoptar primitivos de `packages/ui`** (Card/Badge/Input/Table…) en 2–3
  pantallas del dashboard (incremental, demo-visible).
- **[10] Acceso readonly a la demo sin registro**: MUCHO valor comercial, alcance
  sin decidir — una sesión autónoma puede escribir el ADR (`propuesto`) y PARAR.
- **[C1] Aviso inline del pendiente negativo** al mover una reserva ya pagada a
  un precio menor (hoy la ficha lo enseña después; el diálogo de precio no).
- **[B1] Rename literal de tokens camping→DS** (~400 usos, mecánico; valor demo
  nulo — solo si no hay nada visual pendiente).

## Bloqueado (NO tocar en sesión autónoma, esperar a Andreu + credenciales)

- Verificar SES.Hospedajes real / secrets (opción B histórica).
- Fase 9 alta real (`new:camping --apply`), reseed remoto `--apply`, deploy demo.
- Traducciones de guías: descartadas con motivo (ADR 0025 §3).

## Trampas conocidas (heredadas + dos nuevas de la sesión 48)

- `git fetch` y comparar con origin/main ANTES de trabajar. El `main` local del
  contenedor suele venir viejo: `git reset --hard origin/main` antes del merge.
- `wrangler dev` del demo a mano necesita `--persist-to <raíz>/.wrangler-demo` —
  sin eso levanta una D1 vacía («no such table: users») aunque `pnpm db:seed`
  haya ido bien. Y exige `apps/site/dist` construido (`pnpm --filter
@logic-camp/site build`) **+ copiar `apps/dashboard/dist` a
  `apps/site/dist/admin`** para ver el dashboard. Ojo: `pnpm db:reset` borra
  `.wrangler-demo` bajo los pies del `wrangler dev` y lo mata — resembrar
  ANTES de levantarlo.
- **NUEVA (sesión 48)**: en Playwright, ir de `/admin/` a `/admin/#/…` **no
  recarga** (sólo cambia el hash), así que la app se queda "sin sesión" aunque
  el login por `fetch` devuelva 200 → `await p.reload()` después. Y el
  **planning vive en `/`**, no en `/planning`; con `?date=&unit=unt_…` la
  virtualización de filas desplaza hasta la unidad que interesa.
- **NUEVA (sesión 48)**: en el contenedor cloud, Playwright no encuentra su
  navegador solo — `chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })`
  y `import { chromium } from '@playwright/test'` (el paquete `playwright` a
  secas no está instalado; el script debe vivir dentro de `apps/web` para
  resolverlo).
- Segfault de workerd sobre `reset.test.ts` = solo contenedor cloud (45/45 local).
- `seed.sql` gitignored; el seed LOCAL puede estar viejo → `pnpm db:reset &&
pnpm db:seed` si el plano sale "automático" o falta `modules.*`.
- Login del dashboard: el formulario React no responde a eventos sintéticos del
  panel; en verificación usar `fetch` a `/api/auth/sign-in/email` (Better Auth
  real) y recargar. Demo: gerencia@calasereno.example / calasereno, rutas hash.
- exports/ en .gitignore. Scripts de sesión nunca se commitean.
