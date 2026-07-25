# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito al cerrar la sesión 50 (2026-07-25: acceso a la demo sin registro,
> ADR 0029, con Andreu presente).
> Cuando la próxima sesión termine, **reescribe este fichero** con el prompt de
> la siguiente.

---

## Estado en una línea

Las sesiones son **autónomas**: basta "continúa con el desarrollo de este
proyecto" y se ejecuta `docs/CONTINUA.md` completo — **incluido el cierre en
`main` también desde cloud** (permiso permanente de Andreu, 2026-07-25). El MVP
es una **demo fake** — nada de servicios externos reales. La Fase 10 cierra su
pieza de más valor comercial: **cualquiera puede entrar al dashboard de la demo
sin registro** (botón "Ver la demo" → rol `demo`, lee todo, mueve reservas en el
planning y hace check-in, y puede restablecer los datos).

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
- **[10] Bloqueos para el visitante de la demo**: hoy crear/levantar bloqueos le
  da el aviso de solo lectura, y el gesto de "crear arrastrando sobre celda
  libre" del planning es el único que empieza y no puede terminar. Alcance
  acotado por Andreu en la sesión 50 — **reabrir solo si al enseñar la demo se
  echa en falta**, no por completismo.
- **[C1] Aviso inline del pendiente negativo** al mover una reserva ya pagada a
  un precio menor (hoy la ficha lo enseña después; el diálogo de precio no).
- **[B1] Rename literal de tokens camping→DS** (~400 usos, mecánico; valor demo
  nulo — solo si no hay nada visual pendiente).

## Bloqueado (NO tocar en sesión autónoma, esperar a Andreu + credenciales)

- Verificar SES.Hospedajes real / secrets (opción B histórica).
- Fase 9 alta real (`new:camping --apply`), reseed remoto `--apply`.
- Traducciones de guías: descartadas con motivo (ADR 0025 §3).

## Trampas conocidas (heredadas + una nueva de la sesión 50)

- `git fetch` y comparar con origin/main ANTES de trabajar. El `main` local del
  contenedor suele venir viejo: `git reset --hard origin/main` antes del merge.
- **NUEVA (sesión 50)**: en el panel del navegador, `computer` con `coordinate`
  usa coordenadas del **viewport** (1280×720), no de la captura (800×450) —
  factor 1,6. Un arrastre con las de la captura cae en otro sitio y **parece un
  fallo de la app**. Y su `left_click_drag` no dispara los *pointer events* de
  las barras del planning: para verificar gestos hace falta Playwright.
- El **reset nocturno de la demo SÍ existe** (`tenants/demo/worker.ts`, cron
  `0 3 * * *` → `resetDemoData`). Notas viejas decían lo contrario.
- `wrangler dev` del demo a mano necesita `--persist-to <raíz>/.wrangler-demo` —
  sin eso levanta una D1 vacía («no such table: users») aunque `pnpm db:seed`
  haya ido bien. Y exige `apps/site/dist` construido **+ copiar
  `apps/dashboard/dist` a `apps/site/dist/admin`** para ver el dashboard. Ojo:
  `pnpm db:reset` borra `.wrangler-demo` bajo los pies del `wrangler dev` y lo
  mata — resembrar ANTES de levantarlo. En local, `.claude/launch.json` ya lo
  levanta bien (`preview_start` con `name: "api"`).
- En Playwright, ir de `/admin/` a `/admin/#/…` **no recarga** (sólo cambia el
  hash) → `await p.reload()` después. El **planning vive en `/`**, no en
  `/planning`; con `?date=&unit=unt_…` la virtualización desplaza hasta la unidad.
- En el contenedor cloud, Playwright no encuentra su navegador solo —
  `chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })` y
  `import { chromium } from '@playwright/test'` (el script debe vivir dentro de
  `apps/web` para resolverlo).
- Segfault de workerd sobre `reset.test.ts` = solo contenedor cloud (45/45 local).
- `seed.sql` gitignored; el seed LOCAL puede estar viejo → `pnpm db:reset &&
pnpm db:seed` si el plano sale "automático" o falta `modules.*`.
- Login del dashboard: el formulario React no responde a eventos sintéticos por
  coordenadas; usar los `ref_N` del árbol de accesibilidad, o `fetch` a
  `/api/auth/sign-in/email`. Demo: gerencia@calasereno.example / calasereno,
  rutas hash. **Para entrar como visitante ya no hacen falta credenciales**:
  botón "Ver la demo".
- exports/ en .gitignore. Scripts de sesión nunca se commitean.
