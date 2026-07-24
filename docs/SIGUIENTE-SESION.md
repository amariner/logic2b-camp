# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito al cerrar la sesión 47 (2026-07-24: bloqueos desde el plano, C4.4).
> Cuando la próxima sesión termine, **reescribe este fichero** con el prompt de
> la siguiente.

---

## Estado en una línea

Las sesiones son **autónomas**: basta "continúa con el desarrollo de este
proyecto" y se ejecuta `docs/CONTINUA.md` completo. El MVP es una **demo fake**
— nada de servicios externos reales. El plano cierra ya el ciclo entero del
bloqueo (crear Y levantar desde la unidad); el `BlockDialog` ya no pierde la
selección al abrir.

## ⚠ Pendiente de integrar

La sesión 47 (cloud) trabajó y pusheó en la rama **`claude/continuacion-proyecto-yhq05n`**
por mandato del entorno (no tenía permiso para pushear a `main`). Primer paso en
local: revisar y **merge a `main`** (fast-forward limpio sobre `705ed6e`), borrar
la rama. Después, cuando toque deploy: `pnpm --filter @logic-camp/api deploy:demo`.

## ▶ Prompt para pegar

```
continúa con el desarrollo de este proyecto
```

## Candidatos de objetivo para la próxima sesión (elegir UNO, criterio CONTINUA)

- **[B1] Adoptar primitivos de `packages/ui`** (Card/Badge/Input/Table…) en 2–3
  pantallas del dashboard (incremental, demo-visible).
- **[C2] Auditar animaciones bajo `prefers-reduced-motion`** en navegador real
  (los componentes llevan `motion-reduce:animate-none` pero nunca se probó con
  la preferencia activa).
- **[C1] Levantar bloqueos desde el planning** (click en la barra rayada →
  confirmar) — el plano ya lo hace (sesión 47); en el planning las barras
  `lc-block` siguen siendo pintura. Gesto pequeño, cuidado con el arrastre.
- **[10] Acceso readonly a la demo sin registro**: MUCHO valor comercial, alcance
  sin decidir — una sesión autónoma puede escribir el ADR (`propuesto`) y PARAR.
- **[B1] Rename literal de tokens camping→DS** (~400 usos, mecánico; valor demo
  nulo — solo si no hay nada visual pendiente).

## Bloqueado (NO tocar en sesión autónoma, esperar a Andreu + credenciales)

- Verificar SES.Hospedajes real / secrets (opción B histórica).
- Fase 9 alta real (`new:camping --apply`), reseed remoto `--apply`, deploy demo.
- Traducciones de guías: descartadas con motivo (ADR 0025 §3).

## Trampas conocidas (heredadas + una nueva)

- `git fetch` y comparar con origin/main ANTES de trabajar.
- **NUEVA (sesión 47)**: un `wrangler dev` del demo lanzado a mano necesita
  `--persist-to <raíz>/.wrangler-demo` — sin eso levanta una D1 vacía («no such
  table: users») aunque `pnpm db:seed` haya ido bien (los scripts `db:*` de la
  raíz persisten ahí). Y el worker exige `apps/site/dist` construido (+ copiar
  `apps/dashboard/dist` a `site/dist/admin` para ver el dashboard).
- Segfault de workerd sobre `reset.test.ts` = solo contenedor cloud (45/45 local).
- `seed.sql` gitignored; el seed LOCAL puede estar viejo → si el plano sale
  "automático" o falta `modules.*`, `pnpm db:reset && pnpm db:seed` (y reiniciar
  el `wrangler dev` si estaba levantado: borra `.wrangler-demo` bajo sus pies).
- Login del dashboard: el formulario React no responde a eventos sintéticos del
  panel; en verificación usar `fetch` a `/api/auth/sign-in/email` (Better Auth
  real) y recargar. Demo: gerencia@calasereno.example / calasereno, rutas hash.
- exports/ en .gitignore. Scripts de sesión nunca se commitean.
