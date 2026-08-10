# Prompt para la siguiente sesión — R12 callback Redsys tipado

> Reescrito tras la sesión 119 (2026-08-10). R0–R11 están cerrados; R12 tiene
> inventario, contrato Resend, Stripe local y acuse refund Redsys. Producción y
> proveedores siguen requiriendo autorización explícita.

## Estado en una línea

El refund Redsys ya exige sobre firmado, `0900`, pedido e importe exactos y no
reintenta ambigüedades; el siguiente riesgo local está en `parseWebhook`, que
ignora `Ds_SignatureVersion`, castea el JSON y coacciona respuesta e importe.

## Objetivo prioritario

Continuar **R12 · Integraciones y proveedores reales** con un único corte de
entrada Redsys:

1. Auditar el callback y la versión SHA-256 que implementa el adaptador contra
   el manual oficial y `RUNBOOK-PAGOS.md`; no mezclar SHA-512 sin diseñar una
   migración/configuración explícita.
2. Reproducir primero: versión de firma ausente/ajena aceptada, valores no string
   convertidos mediante `String`, importe inseguro/`NaN` y campos mínimos
   ausentes que producen evento.
3. Validar formulario, base64 y payload con Zod antes de firmar o convertir.
   Exigir pedido, respuesta de cuatro dígitos e importe entero no negativo en
   string; no coaccionar tipos remotos.
4. Conservar comparación de firma en tiempo constante, `0000`–`0099` como
   autorización y códigos cerrados de la frontera HTTP. Tests inyectados, sin
   red, sandbox, FUC ni credenciales.
5. Añadir una integración API que demuestre que un callback firmado pero mal
   tipado responde 400 y no escribe pagos ni saldo.
6. Actualizar ADR 0011, inventario, runbook, dossier y continuidad. Después,
   auditar si queda otro contrato local R12 ejecutable o si los siguientes pasos
   están detrás de gate externo.

## Gates que siguen cerrados

- Stripe/Redsys sandbox, Resend real, Analytics, Sentry/Logpush,
  SES.Hospedajes oficial, fiscal/VeriFactu, OTA e IA requieren cuenta, destino,
  credencial, alcance y autorización del módulo.
- La versión de firma Redsys habilitada por cada terminal debe confirmarse con
  entidad/sandbox; el manual recomienda SHA-512 y mantiene SHA-256 disponible.
- Restauración D1 remota y Time Travel siguen pendientes; nunca restaurar sobre
  la base viva.
- D5-V continúa esperando señal propia de Montaña/Familiar/Parcela. D6-V aún no
  es evaluable.
- Cualquier deploy requiere backup/rollback, revisión de migraciones y confirmar
  `AUTH_SECRET` remoto.

## Ya verificado — no repetir sin cambio relevante

- Refund Redsys: `TransactionType=3`, un intento de 8 s y ningún reintento ante
  timeout/red por falta de garantía idempotente oficial.
- El 2xx debe contener sobre `HMAC_SHA256_V1` firmado; `errorCode`, vacío, firma
  inválida, pedido/importe distintos o `Ds_Response != 0900` fallan cerrados.
- La integración D1 recibe un `0180` firmado y conserva `paidCents` y el único
  asiento positivo.
- El manual REST oficial v4.0.1 confirma sobre, firma y código 900; recomienda
  SHA-512 pero documenta SHA-256 como disponible. No hubo migración implícita.
- Pagos unitarios **35/35** y recorrido API de pagos **15/15**, todo con fetch
  inyectado. No hubo deploy, secrets, proveedor válido ni dinero real.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
