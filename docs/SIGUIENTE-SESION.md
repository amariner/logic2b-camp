# Prompt para la siguiente sesión — R12 salida HTTP de pagos

> Reescrito tras la sesión 116 (2026-08-10). R0–R11 están cerrados; R12 tiene
> inventario, contrato Resend y frontera de entrada Stripe. Producción y
> proveedores siguen requiriendo autorización explícita.

## Estado en una línea

Stripe ya rechaza replay >300 s y payloads Checkout mal tipados; el siguiente
riesgo local está en sus llamadas salientes, todavía sin timeout, idempotencia
HTTP, respuesta Zod ni error cerrado.

## Objetivo prioritario

Continuar **R12 · Integraciones y proveedores reales** con un único corte de
salida Stripe:

1. Auditar `stripeRequest`, `createIntent` y `refund` contra el checklist de
   `INVENTARIO-INTEGRACIONES-R12.md` y `RUNBOOK-PAGOS.md`.
2. Reproducir primero: fetch sin límite, POST sin `Idempotency-Key`, respuesta
   casteada y mensaje/body remoto propagado al error.
3. Definir una clave estable por operación sin PII. Si el contrato actual de
   `PaymentProvider` no transporta suficiente identidad para un refund, ajustar
   el contrato explícitamente; no derivarla de datos mutables ni aleatorios.
4. Añadir timeout, Zod y códigos cerrados. Reintentar solo si la semántica e
   idempotencia de Stripe lo hacen seguro; no copiar automáticamente la política
   de Resend.
5. Mantener `provider:none`, cobro manual y reserva `pending` como degradaciones
   honestas. Tests inyectados, sin red, SDK, sandbox ni credenciales.
6. Actualizar ADR 0011, inventario, runbook, dossier y continuidad. Redsys refund
   queda como el corte posterior: hoy cualquier 2xx se considera aceptación.

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

- Webhook Stripe: body crudo, timestamp entero, al menos una firma `v1`, HMAC,
  tolerancia de 300 s y cualquiera de las firmas de rotación.
- Zod exige evento/tipo/sesión e importe entero no negativo; un string firmado
  ya no se coacciona a céntimos.
- El test HTTP envía una firma HMAC válida de 301 s, recibe 400 y comprueba que
  no aparece ningún asiento.
- Idempotencia D1 por evento/referencia, importe exacto y `payments.raw=null`
  siguen vigentes.
- `RUNBOOK-PAGOS.md` documenta variables, ownership, coste, preflight, sandbox,
  rotación, conciliación y apagado sin afirmar una activación.
- No hubo deploy, secrets, proveedor válido ni escritura de producción.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
