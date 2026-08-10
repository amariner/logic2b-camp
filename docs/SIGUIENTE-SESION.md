# Prompt para la siguiente sesión — auditoría final local R12

> Reescrito tras la sesión 125 (2026-08-10). R0–R11 están cerrados. R12 dispone
> de contratos locales para correo, pagos y SES, y ya separa los importes de
> reservas de cualquier promesa fiscal. Producción y proveedores requieren
> autorización explícita.

## Estado en una línea

`/reports` expone `bookingValue`: valor de reservas con llegada en el periodo y
cobros registrados en ellas. No es factura, VeriFactu ni caja por fecha. Queda
auditar los cuatro frentes locales sin proveedor antes de declarar agotado R12.

## Objetivo prioritario

Cerrar la auditoría de **Analytics, observabilidad externa, OTA e IA** sin crear
adaptadores especulativos:

1. **Analytics:** demostrar sobre código y artefacto que no hay tracker, beacon,
   cookie o identificador de analítica. Confirmar que la página de cookies sigue
   siendo cierta. La activación necesita herramienta, finalidad, base legal,
   retención, cuenta y prueba de consentimiento cuando corresponda.
2. **Sentry/Logpush:** verificar que el modo local termina en log redactado y
   referencia; fijar cuenta/destino, muestreo, PII, alerta, owner, coste,
   rotación y apagado como gate. No duplicar la misma alerta sobre el correo que
   se pretende vigilar.
3. **OTA:** comprobar que no existe conector ni autoridad de inventario y que el
   escenario visible no afirma sincronización. Alta, cambio, cancelación,
   duplicados, caída y conciliación empiezan solo con proveedor contratado.
4. **IA/automatización:** reutilizar los tests que prueban `manual_external`,
   `execution:none` y ausencia de transición `sent/applied`. Fijar proveedor,
   datos, permisos, evals, presupuesto, retención y kill switch como gate.
5. Completar un runbook consolidado o evidencia equivalente con disparador,
   dueño, aceptación, degradación y desactivación de los cuatro frentes. Si cada
   uno queda probado como ausente/prototipo honesto y no aparece otro trabajo
   local, registrar el cierre de la porción ejecutable de R12 y avanzar a R13.

## Ya verificado — no repetir sin cambio relevante

- Resend local: Zod, timeout, reintento idempotente y error cerrado.
- Stripe/Redsys: entrada y salida tipadas; sandbox y conciliación siguen gated.
- SES: borrador/manual; las credenciales reservadas no habilitan red.
- Fiscal: `bookingValue` sustituye a `revenue`; textos, API y demos no afirman
  factura ni caja por fecha. El recibo dice expresamente «no es una factura».
- Facturación/VeriFactu real requiere alcance, asesoría, series, proveedor,
  rectificativas, firma/envío y conciliación aprobados.

## Límites de autoridad

- No crear cuentas, secrets, endpoints, píxeles, SDKs, conectores o modelos.
- No ejecutar `new:camping --apply`, migraciones remotas, reseed ni deploy.
- El portfolio visual autorizado avanza en paralelo; preservar sus cambios.
- El tenant `delta` concurrente no forma parte de este corte.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
