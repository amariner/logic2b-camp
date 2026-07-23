# EQUIPO — los roles que gobiernan cada decisión

Logic Camp lo desarrolla una sola persona ~6h/semana, pero cada decisión debe pasar
por la cabeza de **un equipo completo**. Este fichero define ese equipo: ocho lentes
que se aplican **a la vez**, no por turnos. Ninguna funcionalidad se cierra sin haber
pasado por todas las que le apliquen.

Este documento **no sustituye** a CLAUDE.md (el contrato) ni a los ADR (las
decisiones). Es la lente con la que se leen: CLAUDE.md dice *qué está prohibido*,
los ADR *qué se decidió*, y este fichero *desde qué ocho ángulos se juzga* lo nuevo.

> **Regla de oro sobre todas las lentes** (CLAUDE.md §0): ~6h/semana. Cualquier
> decisión que multiplique el trabajo por número de clientes está prohibida. Alta de
> un camping nuevo = una tarde. **Desempate entre roles**: _¿qué necesita un camping
> real para operar en agosto?_ Eso gana.

---

## Los ocho roles

### 1. Arquitecto de Software

- **Mandato**: que el sistema siga siendo un código para N campings, no N sistemas.
- **Le importa**: una D1 por tenant (aislamiento por binding, nunca `WHERE tenant_id`);
  puntos de extensión declarados en vez de tocar el core; el motor (`packages/core`)
  puro y sin I/O; ADR antes de código en fase nueva; los 5 invariantes con test.
- **Veta si**: la solución mete lógica de un cliente fuera de `tenants/{slug}/custom/`,
  comparte estado entre tenants, acopla el motor a I/O, o multiplica trabajo por
  camping o por funcionalidad (p. ej. escribir 40 tests a mano en vez de un barrido).
- **Vive en**: `packages/core`, `packages/config`, `packages/db`, `docs/adr/`,
  los invariantes de CLAUDE.md.

### 2. Fullstack / Visión Global

- **Mandato**: que las piezas encajen de punta a punta y nada se pierda entre capas.
- **Le importa**: que un cambio de esquema Zod llegue coherente de API a los dos
  clientes; que el pipeline de deploy siga siendo un solo `deploy:demo`; la deuda
  técnica registrada en BACKLOG y no en la cabeza; que PROGRESS y SIGUIENTE-SESION
  reflejen la realidad; que una decisión de una fase no rompa otra en silencio.
- **Veta si**: un cambio deja las capas incoherentes (tipo que no viaja, ruta que el
  cliente no consume), o crea trabajo manual de despliegue por camping.
- **Vive en**: la frontera `apps/api` ↔ `apps/dashboard` ↔ `apps/web`/`apps/site`,
  `packages/*` compartidos, PROGRESS.md, docs/BACKLOG.md.

### 3. Backend

- **Mandato**: datos correctos, seguros y auditables; el servidor es la autoridad.
- **Le importa**: TypeScript estricto (cero `any`, tipos de Zod + Drizzle); **dinero
  en céntimos enteros con `price_breakdown` auditable, nunca float ni número suelto**;
  fechas ISO sin zona, `date_from` inclusive / `date_to` exclusive; el precio lo
  calcula **siempre** el servidor (requote/move, ADR 0023); transacciones (cancelar
  libera inventario en la misma); RGPD operativo y retención (ADR 0026); toda ruta
  nueva nace con test de fuga cruzada (barrido de `isolation.test.ts`).
- **Veta si**: hay dinero en float, precio calculado en cliente, una ruta sin cubrir
  por el barrido, o un dato personal sin plazo de retención.
- **Vive en**: `apps/api`, `packages/db`, `packages/core`, `packages/payments`,
  `packages/notifications`.

### 4. Frontend

- **Mandato**: que la interfaz funcione en todos sus estados, no solo en el feliz.
- **Le importa**: estados de carga / error / vacío reales (cero `<p>Cargando…</p>`,
  error boundary por ruta, toasts con deshacer); optimismo con rollback verificado;
  confirmación en acciones destructivas; navegación por teclado; el planning como
  pieza firma (gestos, snap, re-cotización); ⌘K; que un filtro o un edge case no deje
  la vista rota.
- **Veta si**: una interacción no tiene su estado de error/vacío, una acción
  destructiva no confirma, o un gesto escapa a la validación del servidor.
- **Vive en**: `apps/dashboard`, islas React de `apps/web`, `packages/ui`.

### 5. Product Designer (producto vendible a campings)

- **Mandato**: que lo que se construye sea lo que un camping real paga y usa.
- **Le importa**: los cuatro niveles (Camp Web → Solicitudes → Reservas → Motor) como
  una escalera de config, no proyectos distintos; que el nivel 1 funcione con el motor
  apagado y sin arrastrarlo en el bundle; priorizar por "¿qué necesita un camping para
  operar en agosto?"; la demo (`camp.logic2b.com`) como herramienta de venta; no
  construir Camp Motor hasta que alguien pague; el cumplimiento legal español real
  (RD 933/2021, RGPD) porque sin él no se puede vender.
- **Veta si**: se construye algo que ningún camping ha pedido ni pagará, se rompe la
  escalera de niveles, o el nivel 1 empieza a depender del motor.
- **Vive en**: docs/TIERS.md, docs/ROADMAP.md, docs/DOMAIN.md, docs/DEMO-SCRIPT.md.

### 6. UX

- **Mandato**: que la recepcionista de 55 años haga su trabajo sin pensar en la
  herramienta.
- **Le importa**: el flujo de un día real de mostrador (llegadas → check-in → cobro →
  mover → check-out); densidad sin ruido; el camino más corto a la tarea; mensajes que
  explican y se pueden copiar/reenviar (p. ej. la negativa de supresión RGPD con fecha,
  no un toast); ayuda contextual (`?`) donde surge la duda; que el error diga qué
  hacer.
- **Veta si**: un flujo obliga a pasos que el mostrador no daría, o un mensaje de error
  no dice qué hacer a continuación.
- **Vive en**: los flujos de `apps/dashboard`, las guías de `apps/site/src/content/docs`,
  `apps/dashboard/src/lib/ayuda.ts`.

### 7. UI / Visual

- **Mandato**: dos marcas coherentes, nunca confundidas, siempre accesibles.
- **Le importa**: **producto Logic2B** (dashboard, landing, docs) vs **web del tenant**
  (mediterránea, ADR 0006) — ver docs/BRAND.md; tokens oklch, radios y ritmo derivados
  (no valores sueltos); toda familia de token usada como utilidad declarada en `@theme`
  (bug sidebar, sesión 38); contraste **AA** con test (texto ≥4.5:1, barra/fondo ≥3:1,
  claro y oscuro); foco de teclado visible; `prefers-reduced-motion`; usable a 1366px y
  responsive a 375px; antimodelo (ni SaaS azul isométrico ni crema+serif+terracota).
- **Veta si**: se mezcla la marca del producto con la del tenant, un color no pasa AA,
  o un token se usa sin estar mapeado.
- **Vive en**: `packages/ui` (theme.css, DS), docs/BRAND.md, `theme-contrast.test.ts`,
  `tenants/{slug}/theme.css`.

### 8. SEO

- **Mandato**: que la web pública y las guías se encuentren y carguen rápido.
- **Le importa**: Astro con SSG para la web crítica; canonical + hreflang que
  **conservan la página** (no mandan a portada); sitemap que incluye las guías (la cola
  larga del producto: "cómo hacer el check-in en un camping"); Core Web Vitals /
  Lighthouse ≥95 en producción; imágenes como `<img>` con `fetchpriority`, no
  background CSS; `noindex` en la demo bajo `/demo/`; i18n con hreflang saliendo del
  bucle de locales.
- **Veta si**: una página pública pierde canonical/hreflang, la demo se indexa, o una
  imagen pesada entra como recurso bloqueante de render.
- **Vive en**: `apps/site`, `apps/web`, `Base.astro` (ruta/seo), el sitemap, los 6
  ficheros `content/{lang}.json`.

---

## Cómo se resuelven los conflictos

Los roles chocan a propósito — ahí está el valor. El orden de desempate:

1. **La regla de oro** (CLAUDE.md §0): si algo multiplica el trabajo por camping,
   pierde, lo defienda quien lo defienda.
2. **¿Qué necesita un camping real para operar en agosto?** Lo que un camping necesita
   para funcionar gana a lo que es elegante, completo o bonito.
3. **La página publicada es la especificación** (ADR 0026): si ya se prometió algo por
   escrito a un cliente, hacerlo verdad gana a lo nuevo.
4. **Empate real → ADR**: si dos roles no se reconcilian, la decisión merece un ADR y
   parar a validar con Andreu. No se resuelve en silencio dentro del código.

Ejemplos de tensión sana:
- UI quiere una foto grande en el héroe; SEO teme el LCP. → Se mide (Lighthouse
  98/96, ADR/PROGRESS sesión 41): `<img fetchpriority="high">` no penaliza. Gana la
  medida, no la intuición.
- Frontend quiere un estado `in_house`; Arquitecto avisa de que caería fuera de ~8
  filtros por `status`. → Se deriva de un campo `checked_in_at` (ADR 0022). Gana el
  aislamiento.
- Product quiere el parte de viajeros ya; Backend no tiene credenciales SES. → Paquete
  puro + descarga manual operativa hoy, envío real diferido (ADR 0028). Gana operar en
  agosto sin bloquear por credenciales.

---

## El pase de revisión (checklist operativo)

Antes de cerrar cualquier trabajo, se pasa por esta lista. No todas aplican siempre;
las que apliquen y fallen, bloquean.

- [ ] **Arquitecto**: ¿multiplica trabajo por camping o por funcionalidad? ¿Toca el
      core algo que debería ir en `custom/` o en un punto de extensión? ¿Invariantes con test?
- [ ] **Fullstack**: ¿los tipos viajan coherentes API↔clientes? ¿El deploy sigue siendo
      uno solo? ¿La deuda quedó en BACKLOG y el estado en PROGRESS?
- [ ] **Backend**: ¿dinero en céntimos con desglose? ¿Precio calculado en servidor?
      ¿Fechas ISO from-inclusive/to-exclusive? ¿Ruta nueva en el barrido de aislamiento?
      ¿Dato personal con retención?
- [ ] **Frontend**: ¿estados carga/error/vacío? ¿Acción destructiva confirmada?
      ¿Teclado? ¿Edge cases (filtros, listas vacías)?
- [ ] **Product**: ¿lo pagaría/usaría un camping real? ¿Respeta la escalera de niveles?
      ¿El nivel 1 sigue sin depender del motor?
- [ ] **UX**: ¿es el camino más corto para el mostrador? ¿Los errores dicen qué hacer?
      ¿Hay ayuda donde surge la duda?
- [ ] **UI**: ¿marca correcta (producto vs tenant)? ¿AA en claro y oscuro? ¿Tokens
      mapeados en `@theme`? ¿1366px y 375px?
- [ ] **SEO**: ¿canonical/hreflang conservan página? ¿Sitemap? ¿Lighthouse? ¿Demo
      noindex? (solo si toca superficie pública)
- [ ] **Cierre**: `pnpm check` verde.

---

## Cómo trabajo como los ocho a la vez

- **Al planificar / escribir un ADR**: nombro explícitamente qué roles tensionan la
  decisión y cómo se resuelve (como en los ejemplos de arriba). Un ADR sin tensión
  declarada suele ser un ADR que se saltó una lente.
- **Al implementar**: el pase de revisión es la lista mental; cuando una lente tiene
  algo que decir, lo digo en el resumen, no solo lo aplico en silencio.
- **Al revisar**: `/equipo` (o `Skill equipo`) corre el pase sobre un diff o una
  decisión concreta y saca los conflictos a la superficie.
- **Cuando dos lentes chocan de verdad y no las reconcilio**: paro y lo llevo a Andreu
  con un ADR, en vez de decidir por defecto.
