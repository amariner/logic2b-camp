# Prompt para la siguiente sesión — tercer corte local R13

> Reescrito tras la sesión 129 (2026-08-11). Migraciones, seed, owner y rollback
> ya están acreditados en dos D1 locales desechables. La ejecución remota sigue
> cerrada.

## Estado en una línea

`pnpm onboarding:rehearse <año>` recorre scaffold → 8 migraciones → seed → owner
→ exportación → mutación → restauración dentro de un temporal, compara huellas y
lo elimina. El siguiente corte decide qué bindings y nombres de secrets exige un
candidato y demuestra la degradación `none` sin configurar ningún proveedor.

## Objetivo prioritario

Cerrar el tercer corte de **R13 · candidato local fail-closed**:

1. Auditar `wrangler.jsonc`, `apps/api/src/tenant.ts`, auth, notificaciones,
   pagos y la validación de `TenantConfig`. Derivar una matriz única por
   nivel/módulo: binding obligatorio, nombre de secret esperado, adaptador
   resuelto y condición que bloquea activación.
2. Crear primero reproducciones rojas para huecos reales: binding cuyo nombre o
   base no coincide con el slug, valor secreto persistido en config/informe,
   proveedor habilitado sin secret, modo demo confundido con entrega y un plan
   capaz de ejecutar remoto.
3. Generar el candidato solo bajo un temporal. Validar un nivel Inicio con
   notificaciones/pagos `none` y, si el contrato actual lo permite, candidatos
   Gestión/Automatiza sin activar red. No persistir un tenant ni reutilizar las
   D1 demo.
4. El resultado debe inventariar **nombres**, nunca valores, y distinguir
   requerido/configurado/bloqueado. Toda comprobación de runners usa ejecutor
   inyectado; ninguna prueba llama a Wrangler remoto, DNS, secrets o proveedor.
5. Si bindings+adaptadores quedan acreditados, continuar después con el coste de
   alta y la garantía de que un candidato completo no modifica `apps/` ni
   `packages/`.

## Ya verificado — no repetir sin cambio relevante

- La captación comercial de `camp.logic2b.com` está activa según ADR 0045:
  GTM consentido solo en `apps/site`, legales es/en y lead real mediante
  `LEADS_RESEND_API_KEY`. Las webs tenant y el gestor siguen sin tracker;
  `RESEND_API_KEY` continúa ausente para la mensajería interna. Worker activo
  `35f78f54-10cc-4f99-8c18-2ee39adef2d9`.

- CLI **48/48**, tipos/lint y `_template` verdes.
- El ensayo 2026 produce 8/8 migraciones, huella de migración
  `9ed0b4a00f623a8125433d16928a97e997928f6890f38dbaf71de2cd046a8dd3`, seed
  `54f4586659c8278502c2597970cb77fd2c5e8b105449905c27a2687d40fda053`, esquema
  `435e846adc8356ada14ebff2ff447186007ae287d7919ea52068131eec6311ee` y datos
  `03471cef85d81ef04132d05a463c03b7cade5dd0ae4736f22d91f59233ffd3ab`.
- Aplicar migraciones dos veces conserva la lista; dos seeds del mismo año son
  idénticos; el owner tiene credential y el ID opaco del tenant.
- Borrar la credential cambia la huella y restaurar el SQL recupera exactamente
  recuentos, datos, migraciones e invariantes.
- Éxito, fallo previo al runner y cancelación del gate global no dejaron
  temporales, tenants ni D1 locales persistentes.
- `pnpm check` se detuvo en 39/59 por el final pendiente
  `serralta/instalacion-recepcion.webp`, ajeno a R13.

## Límites de autoridad

- No pasar `--apply`, definir candados de infra ni invocar `--remote`, deploy,
  DNS, secrets, cuentas o proveedores.
- No leer perfiles/credenciales para «ver si están»; el contrato local trabaja
  con nombres y ejecutores inyectados.
- No usar `tenants/delta`, `duna`, `riuclar` o `serralta` como fixture ni corregir
  sus assets. Preservar ese trabajo paralelo.
- Camp Motor continúa vetado hasta una decisión/pago explícito.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
