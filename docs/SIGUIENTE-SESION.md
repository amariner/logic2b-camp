# Prompt para la siguiente sesión — R12 contrato SES.Hospedajes

> Reescrito tras la sesión 121 (2026-08-10). R0–R11 están cerrados; R12 tiene
> inventario, correo local y fronteras Stripe/Redsys cerradas. Producción y
> proveedores siguen requiriendo autorización explícita.

## Estado en una línea

Pagos ya rechaza entradas/salidas ambiguas sin fabricar cobros o devoluciones;
el siguiente contrato local parcial es `sesTransport`, que hoy no tiene timeout
y considera aceptado cualquier HTTP 2xx aunque el acuse sea vacío/desconocido.

## Objetivo prioritario

Continuar **R12 · Integraciones y proveedores reales** con una auditoría y, solo
si existe contrato oficial suficiente, un corte de transporte SES.Hospedajes:

1. Buscar en fuentes oficiales vigentes del Ministerio del Interior el endpoint,
   autenticación, request, acuse, códigos y semántica de duplicados/reintentos.
   No completar huecos con blogs, SDKs de terceros ni el regex actual.
2. Si la especificación pública es insuficiente o requiere un alta/portal,
   documentar exactamente el gate y mantener `manualTransport` como recorrido
   operativo. No endurecer contra un XML inventado.
3. Si el contrato sí es verificable, reproducir primero que un 2xx vacío o
   rechazado se acepta, que no existe timeout y qué texto remoto podría cruzar.
4. Añadir timeout y validación tipada del acuse. Reintentar solo si la fuente
   oficial demuestra una identidad o semántica que evite duplicar comunicaciones;
   una ambigüedad no equivale a fallo definitivo ni autoriza un segundo envío.
5. Mantener descarga manual, XML local y ausencia de credenciales como
   degradación principal. Tests con transporte inyectado; sin endpoint, usuario,
   contraseña, sede, datos de huéspedes ni escritura externa.
6. Actualizar ADR 0028, inventario, dossier, runbook y continuidad. Después,
   decidir si queda otro contrato local R12 o si todos los siguientes pasos están
   detrás de un gate externo.

## Gates que siguen cerrados

- SES.Hospedajes oficial requiere formato vigente, alta, endpoint y credenciales;
  INE no está implementado ni se presenta como tal.
- Stripe/Redsys sandbox, Resend real, Analytics, Sentry/Logpush,
  fiscal/VeriFactu, OTA e IA requieren cuenta, destino, credencial, alcance y
  autorización del módulo.
- Redsys debe confirmar la versión de firma por terminal; el adaptador actual
  solo implementa `HMAC_SHA256_V1`, mientras Redirección v4.1 usa SHA-512 V2.
- Restauración D1 remota y Time Travel siguen pendientes; nunca restaurar sobre
  la base viva.
- Cualquier deploy requiere backup/rollback, revisión de migraciones y confirmar
  `AUTH_SECRET` remoto.

## Ya verificado — no repetir sin cambio relevante

- Callback Redsys: sobre completo, versión SHA-256 exacta, record JSON string,
  pedido, respuesta de cuatro dígitos e importe de 1–12 dígitos antes de firma y
  conversión. `0000`–`0099` es éxito.
- Un callback firmado con importe JSON numérico devuelve 400; D1 conserva
  `pending`, saldo cero y cero pagos.
- Refund Redsys: un intento de 8 s, sobre+firma, `0900`, pedido/importe y ningún
  reintento ambiguo.
- Pagos unitarios **44/44** y recorrido API de pagos **16/16**. No hubo deploy,
  secrets, proveedor válido ni dinero real.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
