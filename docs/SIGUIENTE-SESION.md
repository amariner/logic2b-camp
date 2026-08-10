# Prompt para la siguiente sesión — R12 acuse de refund Redsys

> Reescrito tras la sesión 117 (2026-08-10). R0–R11 están cerrados; R12 tiene
> inventario, contrato Resend y fronteras Stripe entrante/saliente. Producción y
> proveedores siguen requiriendo autorización explícita.

## Estado en una línea

Stripe ya tiene antirreplay, Zod, timeout, POST idempotentes, reintento seguro y
errores cerrados; el siguiente riesgo local es `redsysProvider.refund`, que hoy
acepta cualquier HTTP 2xx como una devolución confirmada.

## Objetivo prioritario

Continuar **R12 · Integraciones y proveedores reales** con un único corte de
refund Redsys:

1. Auditar la petición y el acuse REST vigente contra documentación oficial de
   Redsys; no deducir el éxito a partir de ejemplos de terceros.
2. Reproducir primero que un 2xx vacío o funcionalmente rechazado devuelve
   `{ok:true}` y que timeout/red pueden filtrar texto del transporte.
3. Modelar con Zod exclusivamente los campos oficiales necesarios para decidir
   aceptación. Un HTTP 2xx no equivale por sí solo a dinero devuelto.
4. Añadir timeout y códigos cerrados. Definir reintento solo si Redsys ofrece una
   identidad/semántica documentada que descarte una devolución duplicada; no
   trasladar `Idempotency-Key` ni la política Stripe por analogía.
5. Mantener la firma y el pedido exactos, `provider:none`, cobro manual y
   reserva `pending` como degradaciones honestas. Tests inyectados, sin red,
   sandbox, FUC ni credenciales.
6. Actualizar ADR 0011, inventario, runbook, dossier y continuidad. El sandbox
   Stripe/Redsys continúa siendo un gate externo posterior.

## Gates que siguen cerrados

- Stripe/Redsys sandbox, Resend real, Analytics, Sentry/Logpush,
  SES.Hospedajes oficial, fiscal/VeriFactu, OTA e IA requieren cuenta, destino,
  credencial, alcance y autorización del módulo.
- Restauración D1 remota y Time Travel siguen pendientes; nunca restaurar sobre
  la base viva.
- D5-V continúa esperando señal propia de Montaña/Familiar/Parcela. D6-V aún no
  es evaluable.
- Cualquier deploy requiere backup/rollback, revisión de migraciones y confirmar
  `AUTH_SECRET` remoto.

## Ya verificado — no repetir sin cambio relevante

- Cada POST Stripe usa una clave estable sin PII; los reintentos conservan clave
  y cuerpo. Checkout deriva `checkout/{bookingId}` y refund recibe identidad
  explícita desde la API.
- Cada intento Stripe tiene timeout 8 s; hay máximo dos intentos y solo ante red,
  timeout, 409/5xx o indicación expresa del proveedor. Un 4xx ordinario termina.
- Checkout, consulta de sesión y refund validan 2xx con Zod; body remoto y error
  de transporte nunca atraviesan los códigos cerrados.
- Webhook Stripe: body crudo, HMAC, varias firmas de rotación, tolerancia 300 s,
  payload Zod, importe exacto y deduplicación D1 por evento/referencia.
- Pagos unitarios **27/27** y recorrido API de pagos **14/14**, todo con fetch
  inyectado. No hubo deploy, secrets, proveedor válido ni dinero real.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
