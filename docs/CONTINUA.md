# Protocolo "continúa con el desarrollo" — sesiones autónomas

Cuando un chat (local o cloud) reciba solo **"continúa con el desarrollo de este
proyecto"** (o equivalente), se ejecuta este protocolo completo, de principio a
fin, **sin esperar respuestas de Andreu**. La IA toma las decisiones y las deja
escritas con su motivo. Andreu revisa a posteriori leyendo PROGRESS.md.

## Contexto que gobierna las decisiones (mientras no haya cliente real)

- **El MVP es un ESCAPARATE DE DEMOS.** Manda
  `docs/ESTRATEGIA-DEMO-FIRST.md`: primero lo visible, navegable y vendible.
  Todo lo simulado sale del **seed**, fixtures tipados o un adaptador demo común,
  nunca de mocks aleatorios repartidos por el cliente.
- **No configurar ni verificar servicios externos reales**: Resend, Stripe, Redsys,
  SES.Hospedajes, Web Analytics… El código de integración puede existir (patrón
  `sesTransport`/Stripe: escrito, testeado, sin verificar), pero cualquier objetivo
  que **requiera credenciales o a Andreu presente queda descartado para la sesión
  autónoma** — se anota en BACKLOG/SIGUIENTE-SESION y se elige otro.
- **No elegir CLI, aprovisionamiento, integraciones ni backend de producción
  invisible** si puede documentarse en el dossier de activación y no bloquea la
  demo. Prioridad: demos vendibles del Frente D (web pública, dashboard,
  planning/plano, automatización/IA representadas y propuesta comercial) >
  calidad visible > backend mínimo de demo > documentación de activación >
  deuda técnica. Decisión de Andreu, actualizada 2026-08-06.

## Los 8 pasos de cada sesión

1. **Sincronizar**: `git fetch` y comparar `main` con `origin/main` ANTES de tocar
   nada (el main local se ha quedado atrás con árbol limpio en varias sesiones).
2. **Situarse**: leer `PROGRESS.md` (Estado actual + última sesión),
   `docs/SIGUIENTE-SESION.md` y `docs/BACKLOG.md`. `CLAUDE.md` manda siempre.
3. **Elegir UN objetivo** (una sesión = un objetivo; un 2º solo si el 1º queda
   verde y sobra sesión): del prompt de SIGUIENTE-SESION si es ejecutable sin
   credenciales; si no, del BACKLOG con el criterio de prioridad de arriba.
   **Declarar el objetivo y el porqué al principio de la respuesta.** Pasar la
   decisión por las 8 lentes de `docs/EQUIPO.md` (el skill `/equipo` para pases
   explícitos). Si el objetivo abre fase nueva → ADR primero; en sesión autónoma
   el ADR se escribe y se marca `propuesto`, se implementa solo si el riesgo es
   bajo y reversible, y se deja señalado para validación a posteriori.
4. **Implementar**: contrato de CLAUDE.md (TS estricto, céntimos, i18n, tests
   antes que implementación en el motor, cero mocks).
5. **Verificar**: tests de lo tocado en aislamiento + `pnpm check` (en cloud,
   descontar los rojos ambientales documentados: segfault de workerd sobre
   `reset.test.ts`). Si el cambio es visible: navegador contra el bundle real
   (patrón stub Node + Playwright de C1/C5, o dev server si hay entorno).
6. **Documentar**: entrada de sesión en `PROGRESS.md` (+ actualizar "Estado
   actual"), marcar lo hecho en `docs/BACKLOG.md`, y **reescribir
   `docs/SIGUIENTE-SESION.md`** con el prompt de la siguiente.
7. **Entregar**: commit(s) en `main` (mensaje `Sesión NN: …`), merge si se trabajó
   en rama, y **push a GitHub**. Las ramas de sesión se borran (memoria
   [[ramas-archivo-tags]]). **Esto aplica también a las sesiones cloud**: si el
   entorno impone una rama de sesión (`claude/...`), se desarrolla ahí, pero el
   cierre es merge a `main` + push de `main` + borrar la rama — permiso
   permanente de Andreu (2026-07-25). Ojo con la trampa del `main` local viejo:
   comparar con `origin/main` y, si divergió por historia reescrita antigua,
   `git reset --hard origin/main` antes del merge.
8. **Cerrar**: `/session-close` si está disponible; si no, los pasos 6–7 son el
   cierre. Nunca cerrar en rojo sin explicarlo en PROGRESS.

## Qué NO hace una sesión autónoma

- Ejecutar `--apply` contra infra remota (reseed remoto, `new:camping`) — doble
  candado, solo con Andreu.
- Deploy a producción de un tenant. El `deploy:demo` solo si hay credenciales en
  el entorno; si no, se deja anotado como primer paso de la próxima sesión local.
- Configurar secrets o cuentas de servicios externos.
- Reabrir decisiones cerradas (§0 del super prompt, ADRs `aceptado`) sin motivo
  nuevo real.
