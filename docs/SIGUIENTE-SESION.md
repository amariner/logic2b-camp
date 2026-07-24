# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito al cerrar la sesión 46 (2026-07-24: `docs/CONTINUA.md` + iconos de
> servicio en el plano). Cuando la próxima sesión termine, **reescribe este
> fichero** con el prompt de la siguiente.

---

## Estado en una línea

Las sesiones son **autónomas**: basta "continúa con el desarrollo de este
proyecto" y se ejecuta `docs/CONTINUA.md` completo (elegir objetivo sin
credenciales, implementar, verificar, documentar, commit+push). El MVP es una
**demo fake** — nada de servicios externos reales. Frentes B y C cerrados,
Fase 11 parcial, parte de viajeros desplegado en modo manual.

## ▶ Prompt para pegar

```
continúa con el desarrollo de este proyecto
```

(Eso es todo: `CLAUDE.md` §"Sesiones autónomas" + `docs/CONTINUA.md` hacen el
resto. Si Andreu está presente y quiere dirigir el objetivo, lo dice y manda.)

## Candidatos de objetivo para la próxima sesión (elegir UNO, criterio CONTINUA)

- **[C4.4] Crear bloqueos desde el plano**: el plano pinta `blocked` y "Nuevo
  bloqueo" existe en la barra, pero no hay gesto desde una unidad del propio
  `<svg>` (click en unidad libre → ficha; falta atajo "bloquear esta unidad").
  Verificar primero qué hace hoy el diálogo desde el plano — puede estar ya
  cubierto por la barra (ADR 0022) y ser solo pulido.
- **[B1] Adoptar primitivos de `packages/ui`** (Card/Badge/Input/Table…) en 2–3
  pantallas del dashboard (incremental, demo-visible).
- **[C2] Auditar animaciones bajo `prefers-reduced-motion`** en navegador real.
- **[B1] Rename literal de tokens camping→DS** (~400 usos, mecánico, código que
  no mienta; valor demo nulo — solo si no hay nada visual pendiente).
- **[10] Acceso readonly a la demo sin registro**: MUCHO valor comercial, pero
  el alcance está sin decidir — una sesión autónoma puede escribir el ADR
  (`propuesto`) con la propuesta de alcance y PARAR ahí.

## Bloqueado (NO tocar en sesión autónoma, esperar a Andreu + credenciales)

- Verificar SES.Hospedajes real / secrets (opción B histórica).
- Fase 9 alta real (`new:camping --apply`), reseed remoto `--apply`, deploy demo.
- Traducciones de guías: descartadas con motivo (ADR 0025 §3).

## Trampas conocidas (heredadas, siguen vivas)

- `git fetch` y comparar con origin/main ANTES de trabajar.
- Segfault de workerd sobre `reset.test.ts` = solo contenedor cloud (45/45 local).
- `seed.sql` gitignored; el seed LOCAL puede estar viejo → si el plano sale
  "automático" o falta `modules.*`, `pnpm db:reset && pnpm db:seed` (y reiniciar
  el `wrangler dev` si estaba levantado: borra `.wrangler-demo` bajo sus pies).
- Login del dashboard: el formulario React no responde a eventos sintéticos del
  panel; en verificación usar `fetch` a `/api/auth/sign-in/email` (Better Auth
  real) y recargar. Demo: gerencia@calasereno.example / calasereno, rutas hash.
- exports/ en .gitignore. Scripts de sesión nunca se commitean.
