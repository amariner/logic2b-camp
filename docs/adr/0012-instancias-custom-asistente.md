# 0012 — Instancias, `TenantConfig`, `custom/` y asistente (Fase 9)

- **Fecha**: 2026-07-19
- **Fase**: 9 · Instancias, `custom/` y asistente
- **Estado**: **diseño aceptado** por delegación explícita en sesión cloud (mismo régimen que ADR 0009/0010/0011). **Implementación PARCIAL en esta sesión** — ver §6: lo que toca infraestructura real de Cloudflare (crear una D1, un Worker, DNS) queda fuera hasta tener las credenciales y la supervisión de Andreu, igual que Fase 0 con `wrangler login`. No es un blocker técnico: es una acción de alto impacto y difícil de revertir sobre una cuenta real, y esta sesión no tiene ni las credenciales ni el mandato explícito para tocarla.

## Contexto

`packages/config` hoy es un placeholder deliberado (`TenantWebConfig` mínimo para la web, comentario explícito "el `TenantConfig` completo llega en Fase 9"). Mientras tanto, cada sesión ha ido resolviendo su trocito de config directamente contra `tenants.modules` a mano y con comentarios "de TenantConfig en Fase 9" repetidos por todo `apps/api` (política de tasa turística y de cancelación en `public.ts`/`admin.ts`, `PaymentsConfig`/`NotificationsConfig` leídos con un `SELECT` + cast en `payments.ts`/`notify.ts`). Es deuda consciente y documentada, no descuido — pero para dar de alta un camping real hace falta que exista de verdad.

Además, `packages/core/src/extensions.ts` tiene desde la Fase 2 un `createExtensionRegistry()` completo (9 hooks del §3 del super prompt) que **nadie instancia todavía** — ni `apps/api` ni `apps/web` lo importan. `custom/` no tiene dónde engancharse.

## Decisión

### 1. `TenantConfig` en `packages/config`: un tipo, no una promesa

```ts
export const taxPolicySchema = z.enum(['valencia', 'catalunya', 'none']);
export const cancellationPolicySchema = z.object({
  tiers: z.array(z.object({ minDaysBefore: z.number().int().min(0), refundPct: z.number().min(0).max(100) })).min(1),
});
export type TenantConfig = {
  slug: string; name: string; tier: 1 | 2 | 3 | 4; timezone: string; currency: string; locales: string[];
  taxPolicy: TaxPolicyName;
  cancellationPolicy: CancellationPolicyConfig;
  demoThemes?: string[]; // ADR 0009, demo-only
};
export function loadTenantConfig(row: TenantRow): TenantConfig { /* valida y aplica defaults, nunca lanza */ }
```

`TenantWebConfig` (el de la web pública, Fase 4) no desaparece: es el subconjunto que necesita `apps/web` en **build time** (nunca lee D1). `TenantConfig` es el que lee `apps/api` en **request time** desde `tenants.modules`, con un envoltorio `apps/api/src/tenant-config.ts` que añade la lectura de D1.

**A propósito, `payments`/`notifications` NO entran en `TenantConfig`**: `apps/api/src/payments.ts` (ADR 0011) y `notify.ts` (ADR 0010) ya validan y normalizan esas dos claves con matices propios (secrets del Worker, defaults por modo, `depositPercent`) que no le corresponde duplicar a este paquete — forzarlas aquí habría sido una abstracción de más sin ganar nada. Lo que sí llevaba años sin dueño era la política de tasa turística y de cancelación: hasta esta sesión vivían como `TAX_POLICY`/`CANCEL_POLICY`, dos constantes **idénticas y duplicadas** a mano en `public.ts` Y `admin.ts`, cada una con el comentario "de TenantConfig en Fase 9". Ahora se leen con `loadTenantConfig(db)` en los 7 sitios donde se usaban (verificado con la suite completa tras el cambio: 49/49 en verde, sin fixture que se rompiera).

### 2. Resolución por host: ya está resuelta desde la Fase 0 — lo que falta es caché, no enrutado

**No se reabre ADR 0002/0004**: aislamiento por *binding* D1, un Worker por tenant, `TENANT_SLUG` como variable de ese Worker. El "host → binding correcto" de §5 del super prompt lo hace **Cloudflare** (Custom Domain / DNS apuntando al Worker de ese tenant), no código nuestro — por eso no hay nada que enrutar dentro de un único Worker multi-tenant (eso rompería el aislamiento físico, que es la decisión de fondo de todo el producto). Lo que sí toca código: hoy cada request hace un `SELECT * FROM tenants` para leer `modules` (en `notify.ts`, `payments.ts`, y ahora en `loadTenantConfig`). Con un camping real (no un seed de test) esto es barato pero repetido — cachear en KV (`CONFIG` binding, ya previsto en §5) con invalidación explícita en `PATCH /api/admin/settings` es la optimización natural. **Se declara para cuando haya un camping real generando tráfico** (BACKLOG) — antes es optimizar sin medir.

### 3. `custom/` operativo: conectar el registro que ya existe, no inventar uno nuevo (diseñado, sin conectar aún)

`createExtensionRegistry()` (Fase 2) ya tiene los 9 hooks tipados, pero **nadie lo instancia** — es una pieza probada y sin usar. Lo que hace falta:
- Instanciarlo **una vez por tenant** (no por request — los `custom/hooks.ts` de un tenant no cambian entre peticiones) y exponerlo en el contexto de Hono (`c.get('extensions')`).
- Cargar `tenants/{slug}/custom/hooks.ts` en **build time** vía alias, exactamente igual que `@tenant` ya resuelve `tenants/{slug}/content` hoy en `apps/web` (Fase 4, sesión 7) — Workers no permite `import()` dinámico de una ruta arbitraria en runtime, así que la resolución tiene que ser estática. `tenants/_template/custom/hooks.ts` exporta una función `register(ext: ExtensionRegistry)` vacía por defecto; un tenant real la sobrescribe.
- Enganchar `transform('beforeAvailabilitySearch', …)`/`transform('afterAvailabilitySearch', …)`/`transform('onQuoteCalculated', …)` en `data.ts`/`routes/public.ts`, y `emit('onBookingCreated'|'onBookingModified'|'onBookingCancelled', …)` en `bookings.ts`/`public.ts`/`admin.ts` — en los puntos donde esas operaciones YA ocurren, sin cambiar su comportamiento cuando `custom/` no registra nada (el contrato: motor y API funcionan idénticos sin `custom/`).

**Por qué se queda en diseño esta sesión**: `apps/api` hoy es deliberadamente tenant-agnóstico en su código — todo lo que varía entre tenants vive en D1, nunca en el bundle. Un alias `custom/hooks.ts` resuelto en build sería el PRIMER código tenant-específico que entra en `apps/api`, y ningún tenant real tiene todavía un `custom/` que lo necesite (ni siquiera `tenants/_template/`, que esta sesión sí crea — ver §4). Cablear `transform()`/`emit()` por seis ficheros para que operen sobre un registro perpetuamente vacío es exactamente la clase de "diseñar para lo hipotético" que el proyecto evita a propósito. Se hace en la sesión en que el primer `custom/` real lo necesite.

### 4. `tenants/_template/`: la base de clonación, documentada

Directorio nuevo con la forma exacta de §3: `config.ts` (comentado campo a campo), `theme.css` (los 5 tokens de ADR 0006 con valores neutros), `content/{es,ca,en,fr,de,nl}.json` (placeholders con TODAS las claves que la web necesita — así un `diff` contra `_template` te dice qué le falta a un tenant a medio configurar), `custom/hooks.ts` (no-op documentado), `seed.ts` mínimo (un tipo de unidad, una temporada), `wrangler.jsonc` parametrizado (`{{slug}}` a sustituir), `README.md` con la checklist de alta.

### 5. `pnpm new:camping` y `/new-camping`: diseñados, no ejecutados esta sesión

Capa 1 (CLI) automatiza lo mecánico (D1, migración, seed, `wrangler.jsonc`, Worker, DNS, usuario owner) — implica ejecutar `wrangler d1 create`, `wrangler deploy` y tocar DNS **contra la cuenta real de Cloudflare**. Capa 2 (`/new-camping`, ya escrito desde la sesión 1) interpreta el material real de un cliente (PDF de tarifas, Excel de parcelas, su web) y propone config+seed para que Andreu valide antes de sembrar nada.

**Por qué no se ejecuta en esta sesión**: crear infraestructura de pago (D1, Workers, zonas DNS) en una cuenta real de Cloudflare es una acción con blast radius fuera del repositorio — no es reversible con un `git revert`, y esta sesión no tiene las credenciales (`CLOUDFLARE_API_TOKEN` con los scopes de §5) ni ha recibido el mandato explícito de tocar la cuenta de producción de Logic2B. Es la misma prudencia que ya paró el deploy real en la Fase 0 ("esta sesión cloud no tiene credenciales — NO simulado"). El código de `packages/cli` es puro Node (genera ficheros + orquesta `wrangler` como subproceso): se puede escribir y testear su lógica de plantillas sin ejecutar un solo comando contra Cloudflare — eso sí es seguro y queda para la siguiente sesión de esta fase.

### 6. Alcance real implementado esta sesión

- ✅ `packages/config`: `TenantConfig` (tasa + cancelación) + `loadTenantConfig`, con test propio. `apps/api/src/tenant-config.ts` lo conecta a D1.
- ✅ `public.ts`/`admin.ts`: las 7 lecturas de `TAX_POLICY`/`CANCEL_POLICY` pasan a `loadTenantConfig(db)`; las constantes duplicadas desaparecen. Seed demo y fixtures de test declaran `taxPolicy:'valencia'` explícitamente (antes era un hardcode invisible). 49/49 tests en verde tras el cambio.
- ✅ `notify.ts`: el idioma del aviso interno de solicitudes deja de ser `'es'` fijo — usa el primer idioma de `TenantConfig.locales`.
- ✅ `tenants/_template/` completo (ficheros, sin ninguna infraestructura creada).
- ✅ `docs/ONBOARDING.md` (primer borrador — el manual de la tarde).
- ⬜ Registro de extensiones conectado en `apps/api`: diseñado en §3, sin implementar — no hay todavía ningún `custom/` real que lo necesite.
- ✅ `packages/cli` (`pnpm new:camping`) — **sesión 21** (ver §7): la parte pura implementada y testeada; la ejecución real contra Cloudflare sigue bloqueada por el mismo motivo.
- ⬜ Crear de verdad un tenant de prueba nivel 1: bloqueado por credenciales/mandato, ver §5.

## Consecuencias

- El código pierde los comentarios "esto es de TenantConfig en Fase 9" que tenía la política de tasa/cancelación — o se resuelve, o se anota explícitamente en BACKLOG con motivo (el que queda: registro de extensiones, ver arriba).
- Riesgo aceptado: sin `custom/` conectado y sin un tenant de prueba real, "menos de una tarde" sigue sin verificarse de punta a punta — queda como el criterio de "hecho" real de esta fase, pendiente de sesión con Andreu presente. `packages/cli` reduce el riesgo (la parte mecánica ya no es manual) pero no lo elimina.
- Pendiente de Andreu: token de Cloudflare con los scopes de §5, decidir el primer camping candidato para el tenant de prueba y el primer `custom/` real, y estar presente (o delegar explícitamente) en la sesión que ejecute altas reales.

## 7. Addendum (sesión 21) — `packages/cli` implementado

Confirmando lo previsto en §5 ("se puede escribir y testear su lógica de plantillas sin ejecutar un solo comando contra Cloudflare — eso sí es seguro"): esta sesión implementa la parte pura de `pnpm new:camping`, sin tocar ninguna cuenta real.

- **`scaffold.ts`**: copia `tenants/_template` → `tenants/{slug}` sustituyendo los tokens de identidad (`__SLUG__`/`__NOMBRE_DEL_CAMPING__`/`__DOMINIO__`/`__ZONA__`/`__DIRECCION__` opcional) SOLO en los 4 ficheros que los llevan (`config.ts`, `seed.ts`, `wrangler.jsonc`, `package.json`) — `content/*.json`, `custom/hooks.ts` y `data.ts` se copian byte a byte porque sus TODOs son Capa 2 (interpretar el material real del cliente), no mecánicos. Genera un `README.md` de estado propio del tenant (no copia el de `_template`, que es instruccional). Valida el slug (regex + reservados `_template`/`demo`) y rechaza sobrescribir un tenant existente. Reporta qué queda pendiente: `__TODO__` de contenido por fichero y si `database_id` sigue sin la D1 real.
- **`plan.ts`**: `infraPlan()` — función pura, la checklist de comandos de la Capa 1 (crear D1, migrar, sembrar, construir, desplegar, DNS) como datos, en el orden correcto. No ejecuta nada.
- **`infra.ts`**: `runInfraPlan()` — el único punto que puede tocar Cloudflare de verdad, con doble candado deliberado (ninguno basta solo): flag `--apply` en la CLI Y `LOGIC_CAMP_ALLOW_INFRA=1` en el entorno. Sin los dos, lanza `InfraNotConfirmedError` antes de invocar un solo `spawnSync`.
- **`cli.ts`** (`pnpm new:camping <slug> --name … --domain … [--zone …] [--address …] [--apply]`): entrypoint que encadena las tres piezas e imprime el estado en cada paso.
- **17 tests** (`scaffold.test.ts`/`plan.test.ts`/`infra.test.ts`) contra el `_template` real del repo — incluye el bug real que atrapó la propia sesión: `walk()` seguía symlinks de `node_modules` (pnpm) y arrastraba miles de ficheros del store; arreglado excluyendo `node_modules`/`.turbo`/`dist`/`.wrangler` del recorrido. Verificado además a mano: `pnpm new:camping smoke-test --name … --domain …` seguido de `pnpm --filter @tenant/smoke-test typecheck && lint`, ambos limpios, tenant de prueba borrado después.
- Efecto colateral corregido en `tenants/_template/wrangler.jsonc`: su comentario de cabecera mencionaba literalmente `__TODO__`/`__SLUG__` como texto documental — la sustitución de tokens (deliberadamente ciega, sin parseo de comentarios) lo convertía en texto sin sentido en el tenant generado. Reescrito para no citar los tokens por nombre.
- **Sigue sin implementar**: la ejecución real de `runInfraPlan()` contra la cuenta de Cloudflare — sigue bloqueada por falta de credenciales y mandato, exactamente igual que antes de esta sesión. Nada en `--apply` se ha invocado nunca contra la cuenta real.
