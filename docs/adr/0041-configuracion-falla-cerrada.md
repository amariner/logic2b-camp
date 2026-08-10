# 0041 — La configuración inválida falla cerrada y los escenarios se aíslan en build

- **Estado:** propuesto
- **Fecha:** 2026-08-10
- **Fase:** R3 · configuración y fronteras demo/producción

## Contexto

`TenantWebConfig` era solo un tipo de TypeScript: un fichero generado, un cast o
una variable de entorno podían saltárselo. Astro extraía `tier` con una expresión
regular y usaba tier 3 si no lo encontraba; `TIER` admitía cualquier número y
podía elevar un tenant. En request time, `TenantConfig` convertía un tier inválido
en tier 1 y políticas explícitamente inválidas en defaults diferentes.

Los builds del dashboard seleccionaban un escenario con
`VITE_DEMO_SCENARIO`, pero un valor desconocido caía silenciosamente al gestor
normal. Además, el bundle normal importaba los adaptadores de Pinada y Mar de
Fondo aunque luego ocultara sus enlaces. Eso no abría las rutas demo del Worker,
pero sí mezclaba fixtures y acciones locales con un artefacto productivo.

ADR 0012 eligió en 2026-07-19 que `loadTenantConfig` «nunca lanza». Esta decisión
reemplaza únicamente esa tolerancia para valores **presentes e inválidos**. La
ausencia documentada de una política conserva su default compatible.

## Decisión

1. `tenantWebConfigSchema` valida en build identidad, tier, locales, dominio,
   contacto, bloque legal y transportes. `defaultLocale` debe publicarse y la
   config debe declarar el mismo slug que `TENANT`.
2. `demoThemes`, `demoTierSwitch`, transportes `demo`/`demo-session` y
   `demoManagerPath` exigen `isDemo: true`. Una sesión ficticia exige ruta de
   gestor; el transporte de reservas exige tier 3 o superior.
3. `TENANT` solo admite un slug. La web no construye tier 4, un override solo
   admite 1–3 y nunca puede elevar el tier declarado.
4. La fila D1 de `TenantConfig`, sus locales, tier, moneda y políticas se validan
   en runtime. Un módulo ausente usa el default documentado; uno presente e
   inválido lanza un error con su ruta. Una D1 sin fila `tenants` también falla.
5. Pagos, notificaciones y el `PATCH /api/admin/settings` comparten esquemas para
   las claves conocidas. Se conserva una sola degradación deliberada: depósito
   sin porcentaje se convierte en `none` para no crear un cobro pendiente de
   cero euros.
6. El dashboard exige que escenario y `BASE_PATH` coincidan. Un alias de build
   selecciona exactamente uno de tres módulos: normal, Pinada o Mar de Fondo.
   El normal no importa fixtures ni sesión/reset local; las rutas Automatiza e
   Inteligente solo se registran y compilan para Mar de Fondo.
7. `check-entry-budget.mjs` inspecciona todo el JavaScript emitido: cada escenario
   exige sus marcadores y rechaza los del otro; el build normal rechaza ambos.

## Consecuencias

- Un error de alta o de ajustes se ve en el build/PATCH o en la primera lectura,
  no se transforma en otra política comercial.
- Un tenant normal no puede activar atrezzo demo con un campo aislado ni recibir
  fixtures del portfolio en su gestor.
- Los adaptadores continúan siendo locales, deterministas, reseteables y sin red,
  pero solo entran en el artefacto que los solicita explícitamente.
- Corregir una config persistida inválida puede requerir editar D1; el mensaje
  conserva la ruta exacta del campo para hacerlo sin adivinar.

## Validación

- `@logic-camp/config`: 59/59 pruebas, incluidas nueve de config web.
- `@logic-camp/api`: 245/245 + enlaces 3/3, incluidas cinco de módulos.
- `@logic-camp/dashboard`: 34/34 y builds normal/Pinada/Mar de Fondo con frontera
  limpia y entrada de 173,01/177,48/183,26 kB gzip.
- Portfolio web: tiers 1/2/3 construyen y conservan sus fronteras.
- Bundle compuesto: 11.535 enlaces internos en 358 HTML.
