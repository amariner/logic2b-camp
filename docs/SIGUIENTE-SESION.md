# Prompt para la siguiente sesión — R12 pagos y frontera HTTP

> Reescrito tras la sesión 115 (2026-08-10). R0–R11 están cerrados; R12 tiene
> inventario común y el primer corte Resend local. Producción y proveedores
> siguen requiriendo autorización explícita.

## Estado en una línea

Correo ya limita cada intento, reintenta una vez con la misma clave, valida la
respuesta y no registra el body remoto; el siguiente riesgo local está en la
frontera HTTP y de webhooks de Stripe/Redsys, todavía sin acreditar sandbox.

## Objetivo prioritario

Continuar **R12 · Integraciones y proveedores reales** con pagos:

1. Partir de `INVENTARIO-INTEGRACIONES-R12.md` y comparar Stripe y Redsys con
   Zod, idempotencia saliente, timeout, reintento, firma/antireplay,
   correlación, PII, degradación y conciliación.
2. Reproducir primero el defecto local de mayor riesgo. Candidatos visibles en
   el código actual: respuestas externas casteadas, llamadas sin timeout,
   timestamp de firma Stripe sin tolerancia y refund Redsys que trata cualquier
   HTTP 2xx como aceptación.
3. Cerrar un único corte vertical con tests puros y de API. No generalizar el
   runtime de Resend hasta que dos adaptadores demuestren la misma semántica.
4. Mantener `provider:none`, cobro manual y reserva `pending` como degradaciones
   honestas. Ningún mock, clave pública o firma local equivale a sandbox.
5. Actualizar ADR 0011/dossier y crear o completar el runbook de pagos con
   variables, ownership, coste, rotación y apagado.

## Gates que siguen cerrados

- Resend real y dominio remitente; Stripe/Redsys sandbox; Analytics,
  Sentry/Logpush, SES.Hospedajes oficial, fiscal/VeriFactu, OTA e IA requieren
  cuenta, destino, credencial, alcance y autorización del módulo.
- La prueba Resend de esta sesión usó solo `fetch` inyectado. La clave ficticia
  `re_test` recibió un 401 durante la reproducción inicial; no hubo entrega.
- Restauración D1 remota y Time Travel siguen pendientes; nunca restaurar sobre
  la base viva.
- D5-V continúa esperando señal propia de Montaña/Familiar/Parcela. D6-V aún no
  es evaluable.
- Cualquier deploy requiere backup/rollback, revisión de migraciones y confirmar
  `AUTH_SECRET` remoto.

## Ya verificado — no repetir sin cambio relevante

- `INVENTARIO-INTEGRACIONES-R12.md` clasifica oferta, recorrido y nueve familias
  por contrato y gate; `none`, `manual`, `disabled` y demo siguen explícitos.
- Resend: clave ≤256 validada, timeout 8 s, máximo dos intentos para
  timeout/red/408/429/5xx, misma clave, 4xx definitivo, éxito Zod y error sin
  body remoto.
- El lead integra correlación: los dos intentos comparten clave, otra petición
  usa otra y el error público conserva su referencia sin PII.
- `RUNBOOK-CORREO.md` separa preparación local de activación, rotación y apagado;
  no acredita cuenta, DNS, entrega, rebote ni recepción.
- No hubo deploy, secrets, proveedor válido ni escritura de producción.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
