# 0013 — Modo demo (Fase 10, parte 1): reset nocturno, conmutador de nivel, banner

- **Fecha**: 2026-07-19
- **Fase**: 10 · Modo demo + `ui.logic2b.com`
- **Estado**: **aceptado por delegación explícita en sesión cloud** ("sigue perfilando... sin parar... con tu criterio cierra temas y comitea, mergea y sube a la rama principal"), mismo régimen que ADR 0009/0010/0011/0012. Implementación PARCIAL a propósito — ver §5: lo que exige una cuenta real (Cloudflare Web Analytics) o una decisión de producto abierta (acceso público al dashboard) queda en BACKLOG con motivo explícito, no se improvisa.

## Contexto

`camp.logic2b.com` es la herramienta de venta (§0 del super prompt), y la lista de remates de Fase 10 en `docs/ROADMAP.md` lleva pendiente desde que se cerró la Fase 9 (bloqueada por credenciales de Cloudflare, no por código — ver ADR 0012 §6). De los cinco puntos de esa lista, dos NO dependen de ninguna cuenta real y arreglan un problema que YA existe hoy en la demo desplegada:

1. **La demo no se auto-regenera.** `tenants/demo/seed.ts` es un generador puro y determinista de `generateSeed(anchorYear)` — pero hoy solo se invoca a mano (`pnpm db:seed`) una vez, en el momento del deploy. `write-seed.ts` y `data.ts` ya usan `new Date().getUTCFullYear()` como ancla (el patrón "año en curso" existe desde la Fase 4), pero eso solo resuelve el cambio de año: si la demo se despliega en 2026 y nadie vuelve a sembrarla, el 1 de enero de 2027 sigue mostrando el año 2026 sin que nada lo detecte. Sin un reset periódico, cualquier cosa que un comercial o un visitante toque durante una llamada (una reserva cancelada, un ajuste editado, una nota) se queda ahí para siempre — la demo acumula ruido en vez de volver siempre al mismo punto de partida limpio.
2. **No hay forma de enseñar el nivel 1 sin un segundo build.** El ADR 0009 ya resolvió el mismo problema para los temas (`demoThemes`, atrezzo comercial tras flag, sin tocar producto real); el nivel 1/3 necesita el mismo tratamiento — hoy `TIER` decide en build qué héroe se genera (`apps/web/src/components/Home.astro`, regla dura: nivel 1 no arrastra el motor en el bundle), así que la demo (tier 3) nunca puede enseñar en vivo "así se ve un Camp Web" sin desplegar un segundo tenant.

## Decisión

### 1. Reset nocturno: wipe + reseed atómico, SOLO en el Worker del tenant `demo`

**No se toca `apps/api`.** `apps/api/src/index.ts` sigue siendo 100% genérico — ni una tabla, ni un nombre ficticio de Cala Sereno entra en su código o en su bundle, para que ningún camping real cargue un byte de datos de la demo. En su lugar, el tenant `demo` deja de apuntar `main` directamente a `apps/api/src/index.ts` y pasa a tener su propio punto de entrada fino:

```
tenants/demo/worker.ts   → envuelve el Worker genérico (@logic-camp/api), añade el cron de reset
tenants/demo/reset.ts    → wipe + reseed atómico contra un D1Database (agnóstico del binding real)
tenants/demo/wrangler.jsonc → main: "./worker.ts", segundo cron "0 3 * * *"
```

Es exactamente el mismo principio que ya separa `apps/web` (genérico) de `tenants/{slug}/content` (lo que varía): lo que es solo de la demo vive en `tenants/demo/`, nunca en un paquete compartido. Cada camping real sigue apuntando `main` a `apps/api/src/index.ts` sin cambios — cero impacto, cero riesgo para un tenant que no sea la demo.

`reset.ts` reutiliza `generateSeed`/`seedToSql` (Fase 1, sin tocar su lógica) para construir una lista de sentencias SQL: primero `DELETE FROM` de las 21 tablas de la app en orden hijo→padre (evita violar FKs aunque D1/SQLite no las fuerce por defecto — es la disciplina correcta, no una prueba de que fallaría sin ella), luego los `INSERT` del seed regenerado con el año en curso como ancla. Todo se ejecuta en un único `db.batch(...)` — D1 lo trata como una transacción: o se aplican todas las sentencias, o ninguna. Un reset a medias (mitad borrado, mitad sembrado) sería peor que no resetear.

`tenants.modules`/`tier`/`name` también se resetean a los valores del seed: cualquier ajuste que un comercial cambie en vivo en `/admin/#/ajustes` durante una demo (p. ej. apagar una notificación para enseñar el toggle) vuelve a su estado por defecto por la noche — es el comportamiento correcto para una demo, no un efecto secundario.

**Guardas, por si algún día `main` se copia mal a un tenant real**: `worker.ts` solo llama a `resetDemoData()` si `env.TENANT_SLUG === 'demo'` Y el cron que disparó es el de reset (`event.cron === '0 3 * * *'`, distinto del `*/15 * * * *` de purga de holds de la Fase 5, que se sigue ejecutando igual). Doble cinturón sobre un fichero que, de todos modos, nunca se referencia desde ningún otro `wrangler.jsonc`.

**Qué NO hace v1** (declarado, no descuidado): el ancla sigue siendo el 15 de julio del año en curso (mitad de temporada alta), igual que hasta ahora — NO se recalcula para que "hoy" caiga siempre dentro de la ventana de llegadas/salidas del día. Eso exigiría redistribuir las reservas del generador con una franja separada alrededor de la fecha real (además del bloque histórico de temporada alta), tocando la lógica de `generateSeed` que hoy tiene 10 tests calibrados sobre el ancla fija — cambio de más riesgo del que esta sesión quiere asumir sin poder verificarlo en navegador contra varios "hoy" distintos. Queda en BACKLOG con el porqué. Fuera de la ventana de temporada alta, `Llegadas`/`Salidas` mostrarán poco o nada — que es, de hecho, el comportamiento honesto de un camping real fuera de temporada (mismo criterio que "cerrado ≠ sin disponibilidad" del dominio).

### 2. Conmutador de nivel 1/3: cosmético, tras flag, sin segundo build — mismo patrón que ADR 0009

`TenantWebConfig` gana `demoTierSwitch?: boolean` (solo el tenant `demo` lo activa). Cuando está activo, `Home.astro` renderiza **los dos héroes** en el HTML (hoy solo renderiza uno según `TIER` de build) y un interruptor `<details>` + vanilla JS + `localStorage` (`lc-nivel`, igual que `lc-tema`) decide cuál se ve — el otro queda oculto con CSS, nunca desmontado del DOM ni recargado por red. Sin JS, se ve el héroe del `TIER` de build (degradación limpia, igual que el selector de temas). Es atrezzo comercial: la demo sigue siendo un build tier 3 completo (el motor y el mostrador siguen ahí debajo); alternar a "nivel 1" oculta el mostrador y enseña la versión "web + formulario" para que un camping pequeño se reconozca, tal y como ya lo explica `docs/DEMO-SCRIPT.md` sobre el selector de temas ("atrezzo comercial, no feature del cliente"). **No es una prueba de la regla dura del bundle** — esa ya está verificada por separado (build real con `TIER=1`, 0 islas) y sigue siéndolo; este interruptor vive únicamente dentro del build tier 3 de la demo.

### 3. Banner "entorno de demostración"

Franja discreta y fija (no modal, no interrumpe) en `Base.astro`, tras el mismo flag `demoThemes`/`demoTierSwitch` (cualquiera de los dos ya implica "esto es la demo"; se usa una única bandera nueva y más clara: `isDemo?: boolean`, que las otras dos pasan a implicar en `tenants/demo/config.ts`). Texto i18n en los 6 idiomas, enlaza al alta comercial. Un camping real jamás la ve: no lee el flag, no se genera el nodo.

## Qué queda fuera (BACKLOG, con motivo)

- **Acceso al dashboard demo sin registro ("readonly con excepciones para tocar el planning")**: el roadmap lo describe pero no define QUÉ excepciones — ¿reasignar en el planning sí, cancelar no? ¿cualquier visitante anónimo o solo tras un enlace firmado que el comercial comparte? Eso es una decisión de producto (y probablemente un rol nuevo en la jerarquía `readonly < reception < manager < owner` de ADR 0005, con sus propios tests de que NO puede hacer nada más), no una mecánica que se pueda inferir sin ambigüedad. Se deja para una sesión con el alcance decidido explícitamente — inventar el alcance ahora sería exactamente el tipo de diseño-para-lo-hipotético que este proyecto evita.
- **Cloudflare Web Analytics en la demo**: necesita un token real del panel de Cloudflare que esta sesión no tiene (mismo bloqueo que Resend/Stripe/Redsys en fases anteriores).
- **`ui.logic2b.com` / Storybook**: es su propio objetivo de Fase 10 (`CLAUDE.md`: "no antes de la Fase 10" — ya estamos en fase, pero es un paquete nuevo entero con su propio deploy; no cabe como añadido de esta sesión sin diluir "una sesión, un objetivo").
- **Redistribuir el generador del seed para que "hoy" caiga siempre en la ventana de llegadas/salidas** (ver §1): motivo explicado arriba.

## Consecuencias

- `tenants/demo/worker.ts` es el primer fichero de un tenant que envuelve (no solo configura) el Worker genérico — precedente útil para cuando el primer `custom/` real necesite algo parecido, aunque esto NO es el registro de extensiones de ADR 0012 §3 (sigue sin conectar; un cron de reset no es uno de sus hooks, forzarlo ahí habría sido la abstracción equivocada).
- La demo se autolimpia cada noche sin intervención manual — el `pnpm db:seed` de un humano deja de ser el único mecanismo (sigue existiendo para desarrollo local).
- Riesgo aceptado: si el cron de reset falla silenciosamente (cuota, error transitorio), la demo se queda con los datos del día anterior — no es peor que el estado actual (nunca se resetea), y `db.batch()` atómico descarta el peor caso (mitad borrado).
