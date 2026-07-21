# Prompt para la siguiente sesión — el Frente C está cerrado

> Reescrito al cerrar la sesión 36 (2026-07-21, C6 · documentación, ADR 0025).
> Cuando la próxima sesión termine, **reescribe este fichero** con el prompt de la siguiente.

---

## Estado en una línea

**Frente C CERRADO** (C0 ✅ · C1 ✅ · C2+C3 ✅ · C4 ✅ · C5 🟨 · C6 ✅ · C7 ✅) y **Frente B CERRADO** (B4 se cerró dentro de C6). Lo único abierto del acabado es C5, y **no es código**: 6 fotos ya generadas que este contenedor no puede descargar. Queda decidir hacia dónde va el proyecto: la recomendación es **Fase 11 — endurecimiento**.

## ▶ Prompt para pegar

```
Logic Camp (SaaS de campings, monorepo pnpm/Turborepo, repo amariner/logic2b-camp).
Lee primero PROGRESS.md, CLAUDE.md y docs/ROADMAP.md antes de tocar nada.

Estado: main al día en GitHub (commit 3c2595d) y la demo DESPLEGADA y verificada
en camp.logic2b.com. El Frente C (acabado profesional) está CERRADO y el Frente B
también. Lo construido hasta hoy: producto completo (fases 0-8), marca Logic2B
aplicada a dashboard/web/landing, planning con gestos, plano del camping, workflow
de recepción con check-in, y 21 páginas de documentación en camp.logic2b.com/docs/.

El objetivo de ESTA sesión es la FASE 11 — endurecimiento (docs/ROADMAP.md):
auditoría de aislamiento, RGPD, backups, observabilidad, carga y legales. Es la
puerta antes del primer camping real en producción.

Por qué esta y no otra: en C6 acabamos de PUBLICAR una ficha técnica
(camp.logic2b.com/docs/tecnica/datos-rgpd/) que hace afirmaciones concretas ante
el informático de un cliente — una base D1 por camping con test de fuga cruzada,
consentimiento con fecha, restauración a un punto en el tiempo, exportación y
portabilidad bajo demanda. Esa página incluso admite por escrito que "el
endurecimiento completo es una fase propia del plan". Esta sesión es la que
convierte esa promesa en algo verificable, y además es la única fase relevante
que NO está bloqueada por credenciales ni por tener un cliente.

Alcance sugerido (afínalo tú en el ADR 0026, y recorta si es demasiado para una
sesión — mejor cerrar dos bloques de verdad que dejar cinco a medias):

1. Auditoría de aislamiento: el test A↛B ya existe (fuga de datos Y de sesión).
   Revisar que cubre TODA la superficie de hoy, que creció mucho desde que se
   escribió — /api/admin/map (C7), check-in/check-out y huéspedes (C4),
   requote/move (C1), ⌘K, rutas /reservas/$id y /clientes/$id.
2. RGPD operativo: retención y borrado, export de datos de un interesado,
   registro de actividades de tratamiento, y el texto legal de la web.
   OJO: el parte de viajeros tiene plazo legal propio y NO se borra con el resto.
3. Backups: hoy dependemos del point-in-time recovery de Cloudflare y de un
   export manual. Decidir si hace falta export programado a almacenamiento
   propio (la ficha técnica ya dice que no viene por defecto — que siga siendo
   verdad o cámbialo, pero que la doc y el código no se contradigan).
4. Observabilidad: hoy no hay forma de saber que algo va mal en producción sin
   que lo cuente un cliente.

Contrato del proyecto (CLAUDE.md, no negociable):
- La restricción que lo gobierna todo: ~6h/semana de desarrollo; cualquier
  decisión que multiplique el trabajo por camping está prohibida — dar de alta
  un camping nuevo debe costar una tarde.
- TypeScript estricto, nada de `any`. Dinero en céntimos enteros con desglose
  auditable. Fechas ISO sin zona horaria, date_from inclusive / date_to exclusive.
- Textos de UI siempre vía i18n, nunca hardcodeados.
- ADR en docs/adr/NNNN-titulo.md ANTES de escribir código. Una sesión = una fase.
- `pnpm check` verde antes de cerrar.

Si la Fase 11 te parece mal encaminada con lo que veas al leer el repo, dilo y
propón alternativa antes de abrir el ADR — las opciones están más abajo en este
fichero.

Cierra con /session-close, mergea a main, súbelo a GitHub y reescribe
docs/SIGUIENTE-SESION.md apuntando a lo que siga.
```

---

## El mapa completo de lo que queda

| Candidato | Estado | Bloqueo |
|---|---|---|
| **Fase 11 · Endurecimiento** | ⬜ Sin empezar | **Ninguno** ← por eso es la recomendación |
| Fase 9 · Alta real de un tenant | 🟨 Solo falta `--apply` contra Cloudflare | Credenciales + decisión de Andreu |
| Fase 10 · Dashboard demo readonly | 🟨 | Alcance sin decidir (ADR 0013) |
| Fase 10 · Web Analytics | 🟨 | Credenciales |
| Fase 10 · `ui.logic2b.com` / Storybook | ⬜ | Es su propio objetivo de fase + decisión **B-iii** |
| C5 · Descargar 6 fotos | 🟨 | **Red**, no código. `pnpm --filter @tenant/demo fetch:fotos` |
| Remates de BACKLOG | — | Ninguno, pero es limpieza, no avance |
| Fase 12 · Camp Motor | 🚫 | **No construir hasta que alguien pague** |

**Si prefieres una sesión corta y visible** en vez de la Fase 11, los remates de BACKLOG mejor amortizados son: sidebar móvil off-canvas (el primitivo `Sheet` ya existe), "en casa" en `/reservas`, idiomas fr/de/nl de la landing, y las guías de `/informes`, `/tarifas` y `/ajustes` que C6 dejó sin escribir a propósito.

## Decisiones abiertas

- **B-iii** — relación entre `packages/ui` y `ui.logic2b.com` (¿consume, replica, o se fusiona el Storybook?). Bloquea la Fase 10 de Storybook. **No** bloquea la Fase 11.
- **B-iv** — logotipo completo de Logic2B (hoy solo tenemos el isotipo monocromo).
- **B-v** — ¿puede el dashboard de un camping teñir `--primary` con su color, o se mantiene 100 % neutro Logic2B?
- **Indexación de la demo** — ¿`camp.logic2b.com` se indexa ya en Google? La landing y las guías **sí** se indexan (`robots.txt`), la demo bajo `/demo/` va `noindex`. Confirmar que es lo que se quiere ahora que hay 21 páginas de contenido real que posicionar.

## Cosas que hay que saber antes de tocar nada

- **El `main` local puede quedarse atrás.** Al empezar la sesión 36 estaba **5 commits por detrás** del remoto con el árbol limpio y nada lo delataba. **Haz `git fetch` y compara antes de trabajar.**
- **`pnpm db:reset` hace `rm -rf .wrangler-demo`** → reinicia el Worker después.
- **El dashboard necesita el flag de dev**: `wrangler dev … --var LOGIC_CAMP_DEV_ORIGINS:1` (ya en `.claude/launch.json`). Sin él, login 403 en `:5173`.
- **Credenciales del seed** (contraseña `calasereno`): `direccion@` / `gerencia@` / `recepcion@` / `consulta@calasereno.example`.
- **Cero mocks en el cliente** — propiedad del proyecto. "Modo fake" se resuelve en el seed.
- **El segfault de workerd sobre `reset.test.ts` es del contenedor cloud, no del código**: en la máquina de Andreu `pnpm check` da **42/42 verde** (confirmado en la sesión 36). Si trabajas en cloud y ves 40/42, es eso; verifica las suites en aislamiento y sigue.
- **El mapa de color tiene contrato de test** (`packages/ui/test/theme-contrast.test.ts`): cambiar un `--lc-status-*` sin AA rompe la suite.
- **El precio lo calcula SIEMPRE el servidor** (`requote`/`move`, ADR 0023).
- **Deploy de la demo**: `cd apps/api && pnpm run deploy:demo` (compone site+web+dashboard, migra la D1 remota y despliega). **Los assets tardan ~30 s en propagar**: si justo después ves 404 mezclados con 200, no es un fallo — reintenta.
- **Las docs se despliegan solas**: viven en `apps/site`, cuyo `dist` ES el directorio de assets del Worker. Una página nueva en `src/pages/docs/` no toca el pipeline.
- **Red bloqueada a `cloudfront.net`**: confirmado en **4 sesiones** distintas. No reintentar en cloud; es tarea de Andreu desde su máquina.

## Verificación sin poder levantar wrangler

Patrón ya usado en C1, C5 y C6: `vite build` real del dashboard + un servidor Node stub que sirve ese bundle y responde `/api/admin/*` con datos calculados del MISMO `generateSeed(2026)` + Playwright/chromium. El stub es un script de sesión y **nunca se commitea**. Para `apps/site` (estático) basta `preview_start` con la config `site` de `.claude/launch.json` (puerto 4330).
