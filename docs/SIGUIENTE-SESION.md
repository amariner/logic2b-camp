# Prompt para la siguiente sesión — cierre contractual R12 y transición R13

> Reescrito tras la sesión 123 (2026-08-10). R0–R11 están cerrados. R12 ya
> dispone de inventario, correo local, fronteras Stripe/Redsys y un corte
> fail-closed para SES.Hospedajes. Producción y proveedores siguen requiriendo
> autorización explícita.

## Estado en una línea

SES.Hospedajes ya no contiene un transporte que finja un contrato oficial: el
recorrido es borrador local + comunicación manual en la Sede, y la integración
directa permanece cerrada hasta obtener la documentación técnica autenticada.

## Objetivo prioritario

Auditar los frentes restantes de **R12 · Integraciones y proveedores reales** y
decidir con evidencia si la porción local del checkpoint está agotada:

1. Releer inventario, dossier, BACKLOG y los runbooks de Resend, pagos y SES.
   Contrastar Analytics, Sentry/Logpush, fiscal/VeriFactu, canales/OTA e IA con la
   condición de cierre de R12.
2. Cerrar únicamente los contratos locales que sostengan un recorrido actual y
   puedan probarse sin proveedor. No crear adaptadores especulativos, pantallas o
   variables para módulos sin alcance aprobado.
3. Para cada gate externo, exigir que el estado honesto, el disparador, el dueño,
   la aceptación, la desactivación y la evidencia pendiente estén descritos en
   inventario/dossier/runbook. Una cuenta o secreto ausente no se sustituye por
   una simulación presentada como real.
4. Si ya no queda trabajo R12 ejecutable, registrar el cierre de su porción local
   y avanzar a **R13** con validación de plantilla, configuración y CLI en
   lectura o dry-run. No ejecutar `new:camping --apply`, migraciones remotas,
   secrets, dominios ni deploy.
5. Verificar el corte elegido en aislamiento y con `pnpm check`; actualizar
   ADR/ROADMAP/BACKLOG/PROGRESS/continuidad sin mezclar el portfolio visual que
   avanza en paralelo.

## Gate específico de SES.Hospedajes

- La guía y las preguntas frecuentes públicas acreditan el alta, los dos
  momentos de comunicación y la gestión manual en la Sede.
- La descarga de la documentación del servicio web está dentro del acceso
  autenticado de la entidad. Antes de implementar transporte deben quedar
  fijados endpoint, autenticación, esquema de request, acuse, códigos,
  cancelación, duplicados y reintentos.
- `SES_HOSPEDAJES_ENDPOINT`, `SES_HOSPEDAJES_USER` y
  `SES_HOSPEDAJES_PASSWORD` permanecen reservadas y no habilitan ningún envío.
- El XML actual es un borrador determinista para revisión; no se afirma que sea
  el fichero oficial ni un acuse del Ministerio. `/hospedajes/enviar` responde
  `manual_only` y no escribe auditoría de una entrega inexistente.
- INE no está implementado ni se presenta como tal.

## Gates que siguen cerrados

- Resend real, Stripe/Redsys sandbox, Analytics, Sentry/Logpush,
  fiscal/VeriFactu, OTA e IA requieren cuenta, destino, credencial, alcance y
  autorización del módulo.
- Redsys debe confirmar la versión de firma por terminal; el adaptador actual
  solo implementa `HMAC_SHA256_V1`, mientras Redirección v4.1 usa SHA-512 V2.
- Restauración D1 remota y Time Travel siguen pendientes; nunca restaurar sobre
  la base viva.
- El portfolio visual está autorizado hasta doce demos y avanza en paralelo:
  D5-V queda 5/6 tras La Duna; la siguiente programada es `delta`.
- Cualquier deploy requiere backup/rollback, revisión de migraciones y confirmar
  `AUTH_SECRET` remoto.

## Ya verificado — no repetir sin cambio relevante

- Resend local: respuesta Zod, timeout, reintento idempotente y error cerrado.
- Stripe: webhook antirreplay y salida tipada/idempotente con timeout.
- Redsys: callback tipado y refund con acuse funcional, firma y timeout.
- SES: una configuración completa de credenciales sigue resolviendo transporte
  manual; el test demuestra que no hay llamada de red.
- No hubo deploy, secrets, sandbox, proveedor válido ni escritura externa.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
