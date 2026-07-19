# 0017 — Dashboard sobre Logic2B UI (Frente B, fase B1)

- **Fecha**: 2026-07-20
- **Fase**: Frente B — B1 (reskin del dashboard al DS Logic2B)
- **Estado**: aceptado (Andreu, 2026-07-20). (a) sidebar izquierda plegable agrupada; (b) mapa de colores del planning con tokens del DS aprobado.

## Contexto

El dashboard (`apps/dashboard`, ADR 0008) usa hoy la **paleta mediterránea del tenant** (`tinta/arena/pino/mar/hueso`), `--lc-radius: 2px`, Inter del sistema y CSS a mano (`.lc-*`). No se parece al producto **Logic2B** (`docs/BRAND.md`): shadcn/ui neutro, Inter Variable + Space Grotesk, isotipo, radius 10px, tokens oklch. Andreu pidió explícitamente que **"se note que el dashboard está basado en ui.logic2b.com"**.

`packages/ui` tiene ya (B0-lite, ADR 0016) el `theme.css` con los tokens y el isotipo, pero **ningún componente React** — se aplazaron a esta fase. El dashboard es React 19 + Vite + TanStack Router (hash, `/admin/#/…`) + TanStack Query, 11 pantallas, **sin tests propios** (se verifica contra el Worker y por preview). Vite `base: '/admin/'`.

Restricción (§0): densidad sin ruido, **el planning es el elemento firma**, rápido antes que bonito, usable a 1366px por la recepcionista de 55 años. El reskin **no puede** ralentizar el planning (300 uds × 90 días) ni robarle ancho.

## Decisión

### 1. `packages/ui` se vuelve una librería de componentes React (shadcn/ui)

Se copian los primitivos shadcn que el dashboard usa, con la marca Logic2B ya aplicada por `theme.css`:

- Util `cn()` (`clsx` + `tailwind-merge`).
- Primitivos: `Button` (variantes primary/secondary/outline/ghost/destructive), `Card` (+ header/title/description/content), `Badge`, `Input`, `Label`, `Select`, `Table`, `Separator`, `Sheet`/`Dialog` (para la ficha de reserva lateral), `Tabs`. Los que no se usen aún, no se copian.
- Deps nuevas de `packages/ui`: `clsx`, `tailwind-merge`, `class-variance-authority`, y los `@radix-ui/react-*` de los componentes con comportamiento (select, dialog, tabs). `react`/`react-dom` como **peer**. `tsconfig` react.
- `exports`: `.` (índice con los componentes + `cn`), `./theme.css`, `./logo-mark.svg`.

El dashboard **consume** estos componentes; deja de tener estilos a mano salvo lo específico del planning.

### 2. Tema y fuentes

- `apps/dashboard/src/styles.css`: quita el bloque `@theme` de la paleta camping y `@import '@logic-camp/ui/theme.css'`. Radius pasa de 2px a 10px (tokens del DS).
- **Fuentes**: Inter Variable + Space Grotesk vía `@fontsource-variable/*` importados en el entry del dashboard (Vite los empaqueta con el `base: '/admin/'` correcto — evita el problema de rutas absolutas `/fonts`). Es lo que hace `ui.logic2b.com`.

### 3. Shell: **sidebar izquierda plegable, agrupada** (el gesto Logic2B)

Hoy hay una barra superior con 11 enlaces planos. Se sustituye por una **sidebar izquierda** al estilo `ui.logic2b.com` (`BRAND.md` §6): isotipo Logic2B arriba, ítems agrupados por bloques con etiquetas `text-[11px] uppercase tracking-wide text-muted-foreground`, activo con `bg-accent text-accent-foreground`, y el email + cerrar sesión abajo. Grupos (respetando el orden operativo actual):

- **Operación diaria**: Planning · Llegadas · Solicitudes
- **Gestión**: Reservas · Clientes · Informes · Inventario · Tarifas
- **Configuración**: Notificaciones · Pagos · Ajustes

**Plegable a solo iconos** (persistido en localStorage) para que el **planning recupere el ancho** cuando haga falta — resuelve el único inconveniente real de la sidebar frente a la barra superior. En móvil (375px) la sidebar se oculta tras un botón (Sheet).

### 4. Colores por estado del planning → tokens del DS (sin hex sueltos)

El tape chart mantiene su semántica de color, derivada de tokens (`BRAND.md`): 

| Estado | Token |
|---|---|
| `confirmed` | `--primary` (tinta casi negra), texto `--primary-foreground` |
| `pending` | `--chart-4` (ámbar), texto `--foreground` |
| `no_show` | `--destructive` |
| `completed` | `--muted-foreground` |
| `cancelled` | contorno (`border`, texto `--muted-foreground`) |
| bloqueo | rayado con `--muted-foreground` a baja opacidad |

Los mismos tokens para los `chip` de reserva/solicitud/notificación. Fin de semana: `--muted`.

### 5. Alcance

**Solo `apps/dashboard` + `packages/ui`** (añadir los componentes). NO toca `apps/web`, `apps/site` ni la API. No cambia el comportamiento ni las rutas: es reskin + reestructura del shell. Verificación: `pnpm check` verde + preview a **1366px y 375px**, foco AA visible, y el planning fluido (sin regresión de rendimiento del DnD y el scroll virtualizado).

## Alternativas descartadas

- **Barra superior re-estilizada** (mantener el layout actual con tokens Logic2B): más barato y conserva el ancho del planning, pero "se nota menos que es Logic2B UI" — que es justo lo pedido. La sidebar plegable recupera el ancho cuando se necesita, así que gana.
- **Aliasar los nombres viejos** (`--color-tinta` → `--primary`…) sin tocar las clases: rápido pero deja el código mintiendo (una clase `bg-pino` que en realidad es casi-negra). Se remapea de verdad.
- **Traer TODOS los primitivos shadcn de golpe**: se copian solo los que el dashboard usa; el resto, cuando aparezca su consumidor.
- **Fuentes self-hosted en `/public/fonts`** como en `apps/site`: con `base:'/admin/'` obliga a rutas `/admin/fonts`; `@fontsource` lo resuelve solo.

## Consecuencias

- **Se gana**: el gestor se lee como producto Logic2B; `packages/ui` pasa a ser un DS real (componentes), listo para que la web de tenant (B2) también lo aproveche donde convenga.
- **A vigilar**:
  - **Riesgo principal**: reescribir el shell (sidebar) y remapear tokens en 11 pantallas sin romper la densidad ni el rendimiento del planning. Migrar pantalla a pantalla, verificando el planning primero.
  - El planning con sidebar: confirmar que a 1366px **plegada** hay ancho suficiente para una semana cómoda.
  - `packages/ui` como lib React: no debe arrastrar peso muerto al bundle del dashboard (tree-shaking de Radix).
  - Accesibilidad AA: foco visible con `--ring`, navegación por teclado del menú, `prefers-reduced-motion`.
  - Al cerrar: actualizar `PROGRESS.md`, ROADMAP (estado B1) y, si cambia el recorrido, `DEMO-SCRIPT.md`.

---

**PARADO a esperar validación de Andreu.** No se escribe código hasta aceptar este ADR 0017. Punto a confirmar sobre todo: **(a) sidebar izquierda plegable agrupada** (mi recomendación, "se nota Logic2B") **vs barra superior re-estilizada** (conserva ancho del planning). Y (b) ¿de acuerdo con el mapa de colores por estado del planning con tokens del DS?
