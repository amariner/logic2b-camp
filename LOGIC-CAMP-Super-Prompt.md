# LOGIC CAMP — Super Prompt maestro para Claude Code

### Logic2B · v2 · Julio 2026

> **Cómo usar este documento**
>
> 1. Verifica los **prerrequisitos de §5** antes de la primera sesión. Diez minutos ahora, dos sesiones ahorradas después.
> 2. Crea el repo privado `logic-camp` en GitHub y clónalo.
> 3. Pega la sección **§1 BRIEF** completa en tu primera sesión de Claude Code. Esa sesión solo genera `CLAUDE.md` y la documentación. Nada de código.
> 4. A partir de ahí: **una sesión por fase**, pegando su prompt de §10. No mezcles fases.
> 5. Al cerrar cada sesión: `/session-close`. Es tu memoria entre semanas.

---

## §0 Decisiones cerradas — no reabrir sin motivo nuevo

Este bloque existe para que dentro de tres meses, a las 23:30, no te replantees algo que ya está decidido.

| Decisión                | Elección                                                  | Por qué                                                                                                                         |
| ----------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Nicho**               | Solo campings                                             | Con recursos limitados, el nicho estrecho es la única ventaja disponible. Dos clientes campings = conocimiento de dominio real. |
| **Repo**                | **Uno solo**, modelo SaaS                                 | El cliente nº3 debe costar una tarde, no lo mismo que el nº1. Ese delta es el negocio.                                          |
| **Base de datos**       | **Una D1 por camping**, aislada                           | Código junto, datos separados. Aislamiento por diseño, no por `WHERE tenant_id`.                                                |
| **Personalización**     | `tenants/{slug}/custom/` + puntos de extensión declarados | La personalización tiene sitio y no se infiltra en el core.                                                                     |
| **Design system**       | shadcn/ui copiado en `packages/ui`                        | shadcn no es dependencia: te copia el código. Ya _es_ tu DS, con el 90% escrito.                                                |
| **`ui.logic2b.com`**    | Fase 10, como **escaparate** del DS                       | El DS nace dentro del producto y se endurece con uso real; luego se enseña. Al revés te acopla.                                 |
| **Niveles de producto** | 4 tiers por config (§2)                                   | Los "casos típicos" no son complicación: son la escalera comercial.                                                             |
| **Camp Motor (tier 4)** | **No construir hasta que alguien pague**                  | Widget en WordPress ajeno = el más caro de todos. Declarado, no construido.                                                     |
| **Email**               | Una cuenta Resend, N dominios verificados                 | Cada camping envía desde su dominio, sin gestionar N cuentas.                                                                   |
| **Salida**              | Si un cliente exige repo propio, se saca _ese_            | Empezar junto y separar uno es fácil. Empezar separado y consolidar cinco no se hace nunca.                                     |

---

## §1 BRIEF — Pega esto tal cual en la primera sesión

```
Eres el arquitecto y desarrollador principal de LOGIC CAMP, producto SaaS de
Logic2B (agencia de Castellón, Comunitat Valenciana).

QUÉ ES
Un sistema de web + reservas + gestión para campings, vendido en cuatro niveles
sobre un único código base. Cada camping cliente es una INSTANCIA: misma base de
código, su propia base de datos, su propia configuración, su propio dominio.

POR QUÉ EXISTE
Los campings pagan 15-18% de comisión a Booking/Pitchup. Logic Camp les da
reserva directa sin comisión y gestión diaria en una herramienta.
Nicho deliberado: SOLO campings. No hoteles, no apartamentos. El vocabulario,
el modelo de datos y la UI hablan el idioma del camping. Ahí está la ventaja.

RESTRICCIÓN QUE LO GOBIERNA TODO
El desarrollador trabaja ~6h/semana, de noche, después de su empleo. Cualquier
decisión que multiplique el trabajo por número de clientes está prohibida.
Dar de alta un camping nuevo debe costar una tarde. Ese delta es el margen.

CUATRO NIVELES (un código, cuatro flags — ver docs/TIERS.md)
  1. CAMP WEB         web + formulario → email.  Sin motor, sin dashboard.
  2. CAMP SOLICITUDES web + bandeja de solicitudes + dashboard lite.
  3. CAMP RESERVAS    motor real, pagos, dashboard completo.
  4. CAMP MOTOR       solo motor + dashboard, web del cliente. NO CONSTRUIR AÚN.
Subir de nivel = cambiar config. Nunca un proyecto nuevo.
REGLA DURA: el nivel 1 debe funcionar con el motor apagado y sin arrastrarlo.

ARQUITECTURA DE INSTANCIAS
  - UN repo, monorepo. Todos los clientes viven en tenants/{slug}/.
  - UNA base de datos D1 por camping. Nunca compartida. Nunca WHERE tenant_id
    como única barrera.
  - Lo que varía entre campings: config + tema + contenido + tenants/{slug}/custom/.
  - Si un cliente necesita tocar apps/ o packages/, o es feature del core (y la
    tienen todos) o falta un punto de extensión (y lo añades al core).

ENTORNOS
  camp.logic2b.com  → DEMO comercial. Camping ficticio. Reset nocturno. ES la
                       herramienta de ventas: prioridad visual máxima.
  ui.logic2b.com    → Storybook de packages/ui (Fase 10, no antes).
  {cliente}         → dominio propio del camping.

STACK CERRADO (no proponer alternativas salvo bloqueo técnico real)
  Monorepo:      pnpm workspaces + Turborepo
  Web pública:   Astro 5 + islas React (SEO crítico)
  Dashboard:     React 19 + Vite + TanStack Router + TanStack Query
  API:           Hono sobre Cloudflare Workers, RPC tipado (hono/client)
  DB:            Cloudflare D1 + Drizzle ORM + drizzle-kit
  Auth:          Better Auth (adaptador D1)
  Validación:    Zod, esquemas compartidos entre API y clientes
  UI:            Tailwind v4 + shadcn/ui dentro de packages/ui
  Email:         Resend + React Email (una cuenta, N dominios verificados)
  Colas:         Cloudflare Queues
  Cron:          Cloudflare Cron Triggers
  Ficheros:      Cloudflare R2, prefijo por tenant
  Cache:         Cloudflare KV (config de tenant, rate limiting)
  Pagos:         capa propia PaymentProvider: stripe | redsys | none
  Deploy:        Wrangler + GitHub Actions
  Tests:         Vitest (unit + integración D1 local), Playwright (E2E)

REGLAS DE TRABAJO
  - TypeScript estricto. Nada de `any`. Tipos derivados de Zod y Drizzle.
  - Todo dinero en céntimos, entero. Nunca float.
  - Fechas de estancia en ISO `YYYY-MM-DD` sin zona horaria. Sistema en UTC.
  - Textos de UI SIEMPRE vía i18n (es, ca, en, fr, de, nl). Nunca hardcodeados.
  - El precio se guarda siempre con desglose auditable, nunca como número suelto.
  - Cada función del motor va con sus tests. Tests antes que implementación.
  - No inventes librerías. Si dudas de una API, dilo en vez de improvisar.
  - Antes de escribir código en una fase nueva: ADR en docs/adr/NNNN-titulo.md
    y PARA a esperar validación.
  - Una sesión = una fase = un objetivo. Lo que se te ocurra de otra fase va a
    docs/BACKLOG.md, no al código.

PRIMERA TAREA — SOLO ESTO, NADA MÁS, NO HAGAS SCAFFOLD
  1. Genera CLAUDE.md en la raíz: arquitectura, niveles, convenciones, glosario
     de dominio, comandos, y una sección "qué NO hacer".
  2. Genera docs/TIERS.md con la matriz de niveles y qué debe seguir funcionando
     con cada módulo apagado.
  3. Genera docs/ROADMAP.md (12 fases) y PROGRESS.md vacío con su estructura.
  4. Genera docs/DOMAIN.md con el glosario de camping.
  5. Crea .claude/commands/:
       session-close.md → actualiza PROGRESS.md, deja el siguiente paso escrito
       new-camping.md   → asistente de alta de instancia (Fase 9)
       check.md         → typecheck + lint + tests + build del monorepo
       adr.md           → plantilla de ADR
  6. Para. Lista lo que has entendido mal o falta por decidir.
```

---

## §2 Los cuatro niveles — la escalera comercial

|                              | **1 · Camp Web**                             | **2 · Camp Solicitudes**              | **3 · Camp Reservas**                  | **4 · Camp Motor**                            |
| ---------------------------- | -------------------------------------------- | ------------------------------------- | -------------------------------------- | --------------------------------------------- |
| **Web pública**              | ✅                                           | ✅                                    | ✅                                     | ❌ (la suya)                                  |
| **Formulario → email**       | ✅                                           | ✅                                    | ✅                                     | —                                             |
| **Solicitudes guardadas**    | ✅ (silenciosas)                             | ✅                                    | ✅                                     | ✅                                            |
| **Bandeja + calendario**     | ❌                                           | ✅ lite                               | ✅                                     | ✅                                            |
| **Motor disponibilidad**     | ❌                                           | ❌                                    | ✅                                     | ✅                                            |
| **Precio automático**        | ❌                                           | ❌                                    | ✅                                     | ✅                                            |
| **Confirmación instantánea** | ❌                                           | ❌                                    | ✅                                     | ✅                                            |
| **Pagos**                    | ❌                                           | ❌                                    | opcional                               | opcional                                      |
| **Dashboard**                | ❌                                           | lite                                  | completo                               | completo                                      |
| **Config**                   | `web:true, booking:'email', dashboard:false` | `booking:'request', dashboard:'lite'` | `booking:'instant', dashboard:'full'`  | `web:false, booking:'instant'`                |
| **Para quién**               | El camping que solo quiere presencia digital | El que ya no da abasto con el correo  | El que quiere dejar de pagar a Booking | El que ya tiene web y no la va a tocar        |
| **Estado**                   | Fase 4                                       | Fase 4+6                              | Fases 2–8                              | **Fase 12 — no construir hasta que se pague** |

**La lógica del nivel 1 como caballo de Troya**: barato de vender, barato de mantener, y una vez eres su web ya estás dentro el día que les toque dar el salto. Vender el motor a puerta fría empieza la conversación en 250 €/mes y termina en nada; empezar por su web la empieza en 60 €/mes.

**Regla que hace que la escalera funcione**: en el nivel 1, la solicitud **se guarda igual** aunque el camping solo mire su Gmail. Tres años después, cuando sube a Camp Reservas, su histórico de solicitudes, clientes y patrones de demanda ya está ahí. Ningún competidor le puede dar eso. Es la razón de renovación más barata que vas a construir nunca.

---

## §3 Arquitectura del monorepo

```
logic-camp/
├── CLAUDE.md
├── PROGRESS.md
├── turbo.json  ·  pnpm-workspace.yaml
├── .claude/commands/        # session-close · new-camping · check · adr
├── .github/workflows/       # check.yml · deploy-demo.yml · deploy-tenant.yml
├── docs/
│   ├── ROADMAP.md · TIERS.md · DOMAIN.md · BACKLOG.md
│   ├── ONBOARDING.md        # manual de alta de camping (la tarde)
│   ├── DEMO-SCRIPT.md       # guion comercial de 12 min
│   └── adr/                 # una decisión por fase
├── apps/
│   ├── web/                 # Astro — landing + motor de reserva
│   ├── dashboard/           # React SPA — gestión
│   ├── api/                 # Hono / Workers
│   └── storybook/           # Fase 10 → ui.logic2b.com
├── packages/
│   ├── core/                # ★ motor: disponibilidad, precios, reglas. PURO
│   ├── db/                  # schema Drizzle + migraciones + seeds
│   ├── ui/                  # design system (shadcn + tokens Logic Camp)
│   ├── config/              # TenantConfig tipado + carga + validación Zod
│   ├── extensions/          # registro de puntos de extensión
│   ├── i18n/                # es · ca · en · fr · de · nl
│   ├── notifications/       # React Email + envío + cola
│   ├── payments/            # PaymentProvider + stripe/redsys/none
│   ├── cli/                 # pnpm new:camping
│   └── tsconfig/
└── tenants/
    ├── _template/           # base de clonación, documentada
    ├── demo/                # Camping Cala Sereno (ficticio) → camp.logic2b.com
    └── {slug}/              # una carpeta por camping cliente
```

### Anatomía de un tenant

```
tenants/{slug}/
├── config.ts          # tier, módulos, idiomas, pagos, tasa, from de email
├── theme.css          # sus tokens: color, tipografía, radios
├── content/           # sus textos por idioma, sus fotos
├── custom/            # ★ SU código propio
│   ├── hooks.ts       #   onBookingCreated, beforeAvailabilitySearch...
│   ├── rules.ts       #   reglas de precio propias
│   ├── pages/         #   páginas Astro extra
│   └── panels/        #   paneles extra del dashboard
├── seed.ts
├── wrangler.toml      # su D1, su Worker, sus secrets, su dominio
└── README.md          # estado, nivel contratado, qué falta
```

**El contrato**: `custom/` puede _engancharse_ al core, nunca _modificarlo_. Si un cliente pide algo que `custom/` no alcanza, es señal de que falta un punto de extensión — lo añades al core y ganan todos.

### Puntos de extensión (declarados en Fase 2, no improvisados)

```ts
onEnquiryReceived(enquiry)          → notificar, enrutar, enriquecer
beforeAvailabilitySearch(query)     → forzar filtros, ocultar inventario
afterAvailabilitySearch(results)    → reordenar, marcar, excluir
registerRateRule(rule)              → reglas de precio propias del camping
onQuoteCalculated(quote)            → ajustes finales, redondeos, recargos
onBookingCreated / Modified / Cancelled
registerDashboardPanel(panel)       → pantallas extra
registerWebRoute(route)             → páginas Astro extra
registerEmailTemplate(template)     → plantillas propias
```

---

## §4 Modelo de datos

```
tenants                 id, slug, name, tier, timezone, currency, locales[], modules(json)
seasons_calendar        tenant_id, name, date_from, date_to, priority, is_open
unit_types              tenant_id, kind(pitch|lodging), name_i18n, capacity_min/max,
                        included_persons, features(json), photos[]
units                   tenant_id, unit_type_id, code, attributes(json), status
rate_plans              tenant_id, unit_type_id, season_id, base_cents,
                        extra_person_cents, child_cents, pet_cents,
                        electricity_cents, vehicle_cents, min_stay, max_stay,
                        arrival_days[], departure_days[]
rate_rules              tenant_id, type(early_booking|last_minute|long_stay|acsi|promo),
                        conditions(json), discount(json), stackable, priority
extras                  tenant_id, name_i18n, price_cents, per(stay|night|person), required
inventory_blocks        tenant_id, unit_id?, unit_type_id?, date_from, date_to,
                        reason(maintenance|owner|longstay|manual)
★ enquiries             tenant_id, status(new|contacted|quoted|converted|lost),
                        date_from?, date_to?, occupancy(json)?, unit_type_id?,
                        message, contact(json), locale, source, converted_booking_id?
bookings                tenant_id, code, status, channel, date_from, date_to,
                        unit_type_id, unit_id?, occupancy(json), extras(json),
                        price_breakdown(json), total_cents, paid_cents,
                        tourist_tax_cents, deposit_cents, notes, locale
guests                  tenant_id, name, surname, doc_type, doc_number, birthdate,
                        nationality, email, phone, address, gdpr_consent_at
booking_guests          booking_id, guest_id, is_lead
payments                booking_id, provider, provider_ref, amount_cents, status, raw(json)
notifications_log       tenant_id, booking_id?, enquiry_id?, channel, template,
                        status, attempts, sent_at
users                   tenant_id, email, role(owner|manager|reception|readonly)
audit_log               tenant_id, user_id, entity, entity_id, action, diff(json)
```

**Por qué `enquiries` es tabla propia y no un `booking` en borrador**: no bloquea inventario, no tiene precio cerrado, no tiene unidad asignada. Invariantes distintas → tabla distinta. Y es la entidad que hace que el nivel 1 acumule valor. Tiene `convertToEnquiry → Booking` como acción explícita en el dashboard.

**Invariantes con test propio y obligatorio:**

- Una unidad no puede tener dos reservas solapadas (`date_from` inclusive, `date_to` exclusive — el día de salida se libera).
- `sum(payments.amount_cents) == bookings.paid_cents`, siempre.
- Cambiar una tarifa no modifica jamás una reserva ya confirmada.
- Cancelar libera inventario en la misma transacción.
- Cada `tenant` opera exclusivamente contra su propio binding D1. Test explícito de fuga cruzada.

---

## §5 Infraestructura, credenciales y dominios

### Prerrequisitos — verifica esto ANTES de la sesión 1

- [ ] `logic2b.com` con nameservers en Cloudflare (si no, hay que mover la zona o crear CNAME a mano — mejor saberlo hoy).
- [ ] Cuenta Cloudflare con Workers Paid (necesario para Queues y D1 sin límites de juguete).
- [ ] Cuenta Resend con `logic2b.com` verificado.
- [ ] `wrangler login` hecho en tu máquina.
- [ ] Token de API creado con los scopes de abajo, guardado en el gestor de contraseñas y en Settings → Secrets del repo.

### Credenciales

Claude Code corre en tu terminal y ejecuta `wrangler`: crea D1, despliega Workers y Pages, gestiona secrets, colas, KV, R2 y cron **sin que toques el panel**. Necesita:

```bash
wrangler login                    # desarrollo, OAuth por navegador
# CI (GitHub Actions):
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_ACCOUNT_ID=...
```

**Scopes del token** — cortarse aquí hace que Claude Code falle a medias, que es peor que fallar entero:

`Workers Scripts:Edit` · `D1:Edit` · `Pages:Edit` · `Workers KV Storage:Edit` · `R2:Edit` · `Queues:Edit` · `Zone:DNS:Edit` (sobre logic2b.com y las zonas de clientes) · `Account Settings:Read`

### Bases de datos: una por camping

```toml
# tenants/{slug}/wrangler.toml
name = "logic-camp-{slug}"
main = "../../apps/api/src/index.ts"

[[d1_databases]]
binding = "DB"
database_name = "logic-camp-{slug}"
database_id = "..."

[[r2_buckets]]
binding = "MEDIA"
bucket_name = "logic-camp-media"     # compartido, prefijo tenants/{slug}/

[[kv_namespaces]]
binding = "CONFIG"
id = "..."
```

Cada instancia es su propio Worker con su propio binding `DB`. **Fuga cruzada imposible por diseño.** Backup, restauración y borrado RGPD independientes por cliente. Alta de camping nuevo = un `wrangler.toml` más, no una migración de nada.

### Email: una cuenta Resend, N dominios

Resend admite varios dominios de envío verificados en la misma cuenta. Verificas el dominio del camping con sus DKIM/SPF y los emails salen desde `reservas@sudominio.com`, con su marca, sin que el camping toque nada y sin que tú gestiones N cuentas.

```ts
// tenants/{slug}/config.ts
email: {
  from: 'Camping Cala Sereno <reservas@calasereno.com>',
  replyTo: 'info@calasereno.com',
  // apiKey: opcional — solo si un cliente exige su propia cuenta
}
```

La API key vive en el entorno, no en el config. Si algún cliente exige cuenta propia, el campo opcional `resendApiKey` lo resuelve sin tocar código.

### Dominios: dos caminos

**A) El camping mueve sus nameservers a Cloudflare** (zona en tu cuenta) → declaras el dominio como custom domain del Worker y el DNS se crea solo. Gratis y limpio. Muchos campings ni saben dónde tienen el DNS y te lo agradecen. **Es el camino por defecto para los primeros clientes.**

**B) Cloudflare for SaaS / Custom Hostnames** → el cliente solo añade un CNAME apuntándote y tú le emites el SSL. Es literalmente el producto que Cloudflare vende para este caso. Tiene coste por hostname: **comprueba su pricing actual antes de decidir**. Es la vía correcta a partir de 10-15 clientes, cuando no quieras zonas ajenas en tu cuenta.

Empieza por A, ten B en el radar. La migración de A a B es transparente para el cliente.

### GitHub Actions

- PR → `pnpm check` (typecheck + lint + tests + build)
- Push a `main` → deploy automático **solo a demo** — _diseño; **hoy apagado**: `deploy-demo.yml` existe y llama a `deploy:demo`, pero sin `DEPLOY_DEMO_ENABLED=true` el job no corre y la demo se despliega **a mano desde local**. Ver la decisión 2026-07-19 en `docs/ROADMAP.md`._
- Producción → `workflow_dispatch` manual, por tenant. **Nunca automático**: el día que un camping esté vendiendo en agosto no quieres que un merge le tumbe las reservas.

---

## §6 Glosario de dominio — la ventaja competitiva

Va literal en `docs/DOMAIN.md`. Un producto genérico no modela bien nada de esto, y por eso existes.

| Término                      | Definición para el modelo                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Parcela**                  | Terreno donde el cliente monta su equipo (tienda, caravana, autocaravana). m², suelo, sombra, electricidad (A), acceso, servicios propios sí/no. |
| **Alojamiento**              | Unidad construida: bungalow, mobil-home, glamping, safari tent. Camas, capacidad, baños, mascotas.                                               |
| **Tipo de unidad**           | Agrupación comercial ("Bungalow 4 pax vista mar"). El cliente reserva un _tipo_; el camping asigna una _unidad_.                                 |
| **Asignación**               | Dar unidad física a una reserva. Manual o automática. Reasignable sin cancelar. **El dashboard vive de esto.**                                   |
| **Temporada**                | Rango con reglas propias: precio, estancia mínima, días de entrada. Se solapan por prioridad.                                                    |
| **Plan tarifario**           | Base (parcela/alojamiento) + N personas incluidas + persona extra + electricidad + mascota + vehículo extra.                                     |
| **Estancia mínima / máxima** | Por temporada y tipo. Julio-agosto, mínimo 7 noches en bungalow.                                                                                 |
| **Día de entrada fijo**      | Restricción típica de alta temporada: solo sábados.                                                                                              |
| **Tasa turística**           | Impuesto por persona y noche, con exenciones por edad, liquidado aparte. Varía por comunidad autónoma.                                           |
| **Fianza**                   | Depósito reembolsable. No es ingreso.                                                                                                            |
| **Canon / larga estancia**   | Parcela alquilada por temporada o año. No pasa por el motor diario, pero bloquea inventario.                                                     |
| **ACSI / clubs**             | Descuento por carnet en temporada baja. Regla condicional.                                                                                       |
| **Extras**                   | Ropa de cama, limpieza final, nevera, parking extra, late checkout. Por estancia o por día.                                                      |
| **Cierre de temporada**      | El camping no opera todo el año. Fuera de apertura no es "sin disponibilidad", es "cerrado". Mensaje distinto.                                   |
| **Overbooking controlado**   | Vender por tipo por encima de unidades con margen de reasignación. Configurable, por defecto off.                                                |

**Regla del motor**: el precio nunca se guarda como número suelto. Se guarda el desglose (`price_breakdown` JSON) para poder explicárselo al cliente y auditarlo. _Un camping que no puede explicar una factura no te renueva._

---

## §7 El asistente de alta de camping

Objetivo: **`pnpm new:camping`** y en una tarde hay un camping en producción. Tres capas.

**Capa 1 — CLI (`packages/cli`)**

```
pnpm new:camping
? Nombre ..................... Camping Pinar de la Vall
? Slug ....................... pinar-vall
? Nivel contratado ........... 1 · Camp Web
? Dominio .................... campingpinardelavall.com
? Idiomas .................... es, ca, en, fr
? Pagos ...................... (no aplica en nivel 1)
? Tasa turística ............. Comunitat Valenciana
? Inventario ................. csv / manual / omitir
```

Sin intervención: crea la D1, genera `config.ts` + `theme.css` + `content/` + `wrangler.toml`, migra, siembra, crea el Worker y las rutas DNS, crea el usuario owner, escribe su `README.md` con estado y pendientes.

**Capa 2 — `/new-camping` en Claude Code** (esto es lo que no automatiza una CLI)
Le pasas el material real del cliente y él lo interpreta:

- PDF de tarifas → propone `seasons` + `rate_plans` → tú validas
- Excel de parcelas → normaliza inventario → genera el seed
- Su web actual → redacta los textos de la landing en sus idiomas
- Rellena `config.ts`, abre PR

**Esa capa es el margen de Logic2B.** Convierte "montar un camping" de tres días a media tarde. La diferencia entre atender 5 clientes y atender 25 sin dejar Porcelanosa.

**Capa 3 — Onboarding en el dashboard** (nivel 2+)
Checklist para el propio camping: subir logo, revisar tarifas, conectar pasarela, publicar. Para que se sienta dueño y tú no seas el cuello de botella.

---

## §8 Dirección visual

Va en `CLAUDE.md` como brief de diseño, porque `camp.logic2b.com` **es** tu comercial.

- **Antimodelo**: ni SaaS azul con ilustraciones isométricas, ni el look "startup": fondo crema + serif de contraste + acento terracota. Eso lo tiene todo el mundo y se nota.
- **Territorio**: camping mediterráneo real. Pino carrasco, sombra, lona, arena compactada, mañana de agosto. Materia, no vector.
- **Landing**: la unidad narrativa es la **parcela**, no el "feature". El héroe es el widget de disponibilidad **funcionando de verdad**, no un mockup: que en la reunión el dueño busque fechas y vea su propio inventario. Ese es el momento en que se vende. _(En nivel 1 el héroe es otro: sin motor, el widget no existe.)_
- **Dashboard**: densidad sin ruido. La pantalla que se mira 200 veces al día es el **planning**: unidades en filas, días en columnas, drag & drop. Si esa pantalla es buena, el producto es bueno. **Rápida antes que bonita.**
- **Elemento firma**: el planning. Ahí gastas la ambición. Todo lo demás, callado y disciplinado.
- **Suelo no negociable**: responsive, foco de teclado visible, `prefers-reduced-motion`, contraste AA. La recepcionista de 55 años de un camping de costa es tu usuario real, y trabaja a 1366px.

---

## §9 ROADMAP — 12 fases, ~28 sesiones

> Cada fase: **objetivo → entregables → hecho cuando → prompt de sesión**.
> No se pasa de fase sin `/check` en verde.

---

### FASE 0 · Fundaciones — sesiones 1–2

**Objetivo**: repo que arranca, despliega y se comprueba solo.

**Entregables**: `CLAUDE.md`, `docs/{ROADMAP,TIERS,DOMAIN}.md`, `PROGRESS.md` · monorepo pnpm + Turborepo + tsconfig + ESLint/Prettier · `apps/api` con `/health` en Workers · `apps/web` y `apps/dashboard` arrancando vacíos · `packages/db` con Drizzle + D1 local + primera migración · Wrangler con entornos · GitHub Actions (PR→check, main→demo) · `.claude/commands/` operativos.

**Hecho cuando**: `pnpm check` verde y `https://camp.logic2b.com/api/health` responde.

```
Fase 0 del ROADMAP. Monta el scaffold completo del monorepo según CLAUDE.md.
No escribas lógica de negocio ni UI: solo estructura, tooling, CI y un /health
desplegable. Deja preparada la estructura tenants/_template aunque esté vacía.
Empieza escribiendo docs/adr/0001-scaffold.md con el plan y PARA para validarlo
antes de crear ficheros.
```

---

### FASE 1 · Modelo de datos — sesiones 3–4

**Objetivo**: el esquema de §4 en Drizzle, con `enquiries` de primera clase.

**Entregables**: schema completo tipado + migraciones · índices para las consultas de disponibilidad (son las que sufren) · seed `demo`: **Camping Cala Sereno** — 60 parcelas en 4 tipos, 18 bungalows en 3 tipos, 5 glampings, 3 temporadas, tarifas reales de mercado, 12 extras, 40 reservas con casos límite (estancia larga, grupo, mascota, cancelada, no-show) y 15 solicitudes en distintos estados · `docs/DOMAIN.md` cerrado.

**Hecho cuando**: `pnpm db:reset && pnpm db:seed` deja una base consultable y el planning se puede pintar de un `SELECT`.

```
Fase 1. Implementa el esquema completo de packages/db según §4 del super prompt.
Prioridades: (1) el modelo distingue parcela de alojamiento sin duplicar tablas,
(2) unit_type es lo reservable, unit lo asignable, (3) el precio se guarda
siempre con desglose, (4) enquiries es tabla propia con sus invariantes, no un
booking en borrador — justifícalo en el ADR. Seed demo con datos realistas de un
camping mediterráneo de 80 unidades. ADR primero.
```

---

### FASE 2 · Motor de disponibilidad y precios — sesiones 5–7 ★ LA FASE CRÍTICA

**Objetivo**: `packages/core` puro — sin I/O, sin Drizzle, sin framework. 100% testeado.

```ts
searchAvailability(input): AvailabilityResult[]
quote(input): Quote                          // con desglose completo
validateStay(input): ValidationResult        // min stay, arrival day, capacidad
assignUnit(input): UnitAssignment            // óptima: menos huecos
applyRules(quote, rules): Quote              // early booking, ACSI, promo
calculateTouristTax(occupancy, nights, region)
calculateCancellationRefund(booking, policy, now)
```

Más el **registro de puntos de extensión** de §3.

**Hecho cuando**: ≥40 tests verdes, incluyendo los 7 casos que rompen a todos los productos genéricos:

1. Estancia que cruza dos temporadas → precio por tramos, estancia mínima = la más restrictiva
2. Búsqueda de 7 noches con día de entrada fijo sábado
3. Tipo con 6 unidades y 6 reservas solapadas parciales → hay hueco, pero requiere reasignar
4. Niño de 3 años exento de tasa turística pero contando para capacidad
5. Parcela sin electricidad reservada con caravana → bloqueo con mensaje útil
6. Larga estancia bloqueando parcela 6 meses sin ensuciar el motor diario
7. Cancelación a 20 días con política 50% / 7 días

```
Fase 2, la fase crítica del producto. Implementa packages/core como lógica pura:
recibe datos, devuelve resultados, sin I/O. Escribe los tests ANTES que la
implementación, empezando por los 7 casos límite del roadmap. El desglose de
precio es requisito, no detalle: cada céntimo debe ser explicable a un cliente
enfadado. Diseña también el registro de puntos de extensión (§3) ahora, no
después. ADR primero con el diseño de tipos.
```

---

### FASE 3 · API — sesiones 8–9

**Entregables**: público (`GET /availability`, `POST /quote`, `POST /bookings`, `POST /enquiries`, `GET /bookings/:code`) · privado (CRUD + `/planning`, `/reports`, `/settings`) · Better Auth con roles · middleware que resuelve tenant por host y **selecciona su binding D1** · Zod entrada y salida · rate limiting · idempotencia en `POST /bookings` · cliente RPC exportado.

**Hecho cuando**: tests de integración contra D1 local, tipos inferidos end-to-end, y **test explícito de que el tenant A no puede leer datos del B**.

---

### FASE 4 · Web pública + niveles — sesiones 10–12

**Entregables**: Astro — home, tipos de alojamiento (+detalle), instalaciones, entorno, tarifas, contacto, blog cableado · widget de disponibilidad en el héroe contra la API real · **formulario de solicitud que guarda en `enquiries` y envía por Resend** · degradación limpia por nivel: sin `booking`, el widget no existe y **el bundle no arrastra el motor** · SEO: schema.org `Campground` + `LodgingBusiness` + `Offer`, hreflang de 6 idiomas, sitemap, OG · contenido desde `tenants/{slug}/content/`, cero texto en el código.

**Hecho cuando**: Lighthouse ≥95 en las cuatro; cambiar `theme.css` cambia toda la identidad sin tocar componentes; **la demo se puede levantar en nivel 1 y en nivel 3 y las dos funcionan**.

```
Fase 4. Construye apps/web en Astro. Lee §8: dirección visual de camping
mediterráneo real, NO SaaS genérico ni crema+serif+terracota. En nivel 3 el
héroe es el widget de disponibilidad funcionando contra la API; en nivel 1 el
widget NO EXISTE y no se incluye en el bundle — el héroe es otro y quiero que
propongas cuál. El formulario de solicitud guarda en enquiries SIEMPRE, en los
cuatro niveles. Antes de código: plan de diseño (paleta de 5 hex nombrados, dos
tipografías con rol, wireframe ASCII de los dos héroes, elemento firma) y PARA.
```

---

### FASE 5 · Flujo de reserva — sesiones 13–15

**Entregables**: fechas+ocupación → resultados → detalle → extras → titular → pago o confirmación → confirmación con código · estado en URL (compartible, recuperable, medible en GA4) · bloqueo temporal de inventario 15 min con expiración por cron · gestión por código+email: ver, modificar, cancelar · E2E Playwright del camino feliz y de tres infelices.

**Hecho cuando**: una reserva completa aparece en el planning en tiempo real.

---

### FASE 6 · Dashboard — sesiones 16–20

1. **Planning (tape chart)** ★ — unidades × días, drag & drop de reasignación, colores por estado, bloqueos, zoom semana/mes/temporada, virtualizado
2. **Reservas** — lista filtrable, ficha, alta manual (teléfono/mostrador), modificar, cancelar, cobrar
3. **Solicitudes** — bandeja, estados, responder, **convertir en reserva**. _Es todo el dashboard del nivel 2_
4. **Llegadas y salidas del día** — pantalla de recepción, check-in, registro de viajeros
5. **Inventario** — tipos, unidades, fotos, bloqueos de mantenimiento
6. **Tarifas** — temporadas, planes, reglas, extras, con **previsualización**: "familia de 4 con perro, 7 noches en agosto, paga X". Sin eso no lo entienden.
7. **Clientes** — ficha, historial, RGPD (exportar/borrar)
8. **Informes** — ocupación, ingresos, ADR, RevPAR, canal, previsión
9. **Ajustes** — datos, idiomas, pagos, notificaciones, usuarios y roles
10. **Onboarding** — checklist de puesta en marcha

**Dashboard lite (nivel 2)** = pantallas 3 + 4 + calendario de ocupación manual. Nada más. Debe funcionar sin motor.

**Hecho cuando**: se puede operar un día completo del camping demo sin tocar la base de datos a mano, y el modo lite arranca con el motor apagado.

```
Fase 6, sesión del planning. Es el elemento firma del producto: la pantalla que
recepción mira 200 veces al día. Requisitos: 300 unidades × 90 días fluido
(virtualización), drag & drop para reasignar sin cancelar, feedback inmediato
con rollback si la API rechaza, atajos de teclado, legible a 1366px. Rápida
antes que bonita. Propón el enfoque de virtualización y DnD antes de implementar.
```

---

### FASE 7 · Notificaciones — sesión 21

**Entregables**: React Email — solicitud recibida (cliente e interno), confirmación, modificación, cancelación, recordatorio 48h, post-estancia (reseña) · 6 idiomas, con marca del tenant · **Resend multidominio: `from` desde config** · Cloudflare Queues + Cron para diferidos · `notifications_log` con reintentos y estado visible · WhatsApp (Twilio) como módulo off por defecto · ajustes: qué se envía, cuándo, a quién.

**Hecho cuando**: activar/desactivar cada notificación desde ajustes funciona sin deploy, y **el nivel 1 solo usa las de solicitud**.

---

### FASE 8 · Pagos — sesiones 22–23

**Entregables**: interfaz `PaymentProvider` (`createIntent`, `capture`, `refund`, `handleWebhook`) · adaptadores `stripe`, `redsys` (obligatorio en España: SHA-256, firma, notificación — **su comercio, su clave, por camping**), `none` · modos: sin pago / señal % / completo / fianza · webhooks idempotentes · reembolso desde el dashboard según política.

**Hecho cuando**: `payments: 'none'` deja el producto funcionando entero sin rastro de pasarela en la UI.

---

### FASE 9 · Instancias, `custom/` y asistente — sesiones 24–26

**Entregables**: `packages/config` con `TenantConfig` tipado y validado · resolución por host + selección de binding D1 + caché KV · `tenants/_template/` completo y documentado · `custom/` operativo con los puntos de extensión de §3 · `packages/cli` con `pnpm new:camping` · slash command `/new-camping` · `docs/ONBOARDING.md` (el manual de la tarde) · workflow de deploy por tenant.

**Hecho cuando**: levantas un camping nuevo de cero en **menos de una tarde**, siguiendo solo el manual, sin improvisar nada.

```
Fase 9. El objetivo de negocio es que dar de alta un camping cueste una tarde y
no tres días: ese delta es el margen de Logic2B. Implementa TenantConfig,
resolución por host con selección del binding D1 correcto y caché KV, el
directorio custom/ con los puntos de extensión de la Fase 2, packages/cli con el
asistente, y /new-camping que lee material real del cliente (PDF de tarifas,
Excel de parcelas, su web actual) y propone config + seed para que yo valide.
Luego escribe docs/ONBOARDING.md y EJECÚTALO tú mismo creando un tenant de
prueba en nivel 1, distinto del demo — si el manual no se puede seguir de
principio a fin sin improvisar, no está terminado.
```

---

### FASE 10 · Modo demo + `ui.logic2b.com` — sesión 27

**Entregables**: reset nocturno del tenant demo por cron con **fechas relativas a hoy** (nunca una demo con reservas de 2024) · banner discreto de entorno de demostración · acceso al dashboard demo sin registro, `readonly` con excepciones para que se pueda tocar el planning · **conmutador de nivel en la demo**: enseñar el nivel 1 a un camping pequeño y el 3 a uno grande, en la misma URL · Storybook de `packages/ui` → `ui.logic2b.com` · `docs/DEMO-SCRIPT.md`, guion de 12 minutos.

---

### FASE 11 · Endurecimiento + primer cliente real — sesión 28+

Auditoría de aislamiento entre tenants · RGPD, retención, backups D1 por cliente · observabilidad (Workers Analytics, Sentry, alertas) · carga: 300 unidades × 90 días, 50 búsquedas/s · legales: aviso, privacidad, condiciones de reserva, cookies · **primer camping real en producción** · caso de estudio con métricas antes/después.

---

### FASE 12 · Camp Motor — NO CONSTRUIR HASTA QUE ALGUIEN LO PAGUE

Widget embebible en web ajena (WordPress que no controlas, estilos que pelean, iframe vs cross-domain, soporte de una web que no es tuya). Declarado aquí para que exista en la conversación comercial. **Ni lo mires.** Los tres primeros niveles salen del mismo trabajo; este cuesta aparte.

---

## §10 Higiene de sesiones

Vas a trabajar esto en ratos sueltos. La estructura importa más que la velocidad.

1. **Una fase, una sesión, un objetivo.** Lo que se te ocurra de otra fase → `docs/BACKLOG.md`.
2. **ADR antes de código, siempre.** 15 minutos de plan revisado ahorran una sesión entera de deshacer.
3. **`/session-close` al terminar.** `PROGRESS.md` con qué se hizo, qué falta, qué quedó abierto. La siguiente sesión empieza leyéndolo.
4. **`/check` verde antes de cerrar.** Nunca dejes el repo roto: el tú de dentro de dos semanas no recuerda por qué.
5. **Commits pequeños con contexto.** El histórico es documentación.
6. **La regla que decide los empates**: _¿qué necesita un camping real para operar en agosto?_ Eso gana. Lo demás espera. Si la respuesta es "nada", no es prioridad.

---

## §11 Orden de ataque

Trabajando ~6h/semana:

**Semanas 1–6** → Fases 0, 1, 2, 3 y 4 parcial (héroe + widget + un tipo de alojamiento).
Con eso ya tienes **una demo que vende**: buscar fechas reales, ver precio real desglosado, en una landing bonita. Nadie compra un dashboard en la primera visita; compran la idea de no pagarle 18% a Booking.

**Semanas 7–10** → Fase 4 completa + Fase 9 en nivel 1 → **primer camping real en producción**.
El nivel 1 es lo primero que se puede vender: barato de colocar, barato de mantener, y te deja dentro del cliente para el día que le toque subir de nivel.

**Semanas 11+** → Fases 5 a 8. Cuando el primer camping pida el motor de verdad, lo tienes.

---

_Logic Camp — Logic2B · Andreu · 2026_
