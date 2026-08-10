# Runbook interno de pagos · Stripe y Redsys

> Preparación local R12. No acredita cuenta, comercio, endpoint, secret, sandbox,
> cobro, reembolso ni conciliación real. Cualquier paso con proveedor, Worker o
> dinero requiere cliente, destino y autorización explícitos.

## 1. Estado operativo local

`@logic-camp/payments` expone `stripe`, `redsys` y `none`; la API mantiene el
importe en céntimos, guarda la instrucción emitida, deduplica eventos y actualiza
`payments` y `paidCents` en el mismo batch. Solo una reserva web en modo
`deposit` o `full` abre pasarela. Teléfono, mostrador y cobro manual continúan
sin proveedor.

La frontera Stripe entrante exige:

1. body HTTP crudo, sin reserializar;
2. `Stripe-Signature` con timestamp entero y una o más firmas `v1` de 64 hex;
3. HMAC válido con `STRIPE_WEBHOOK_SECRET`;
4. antigüedad máxima de 300 segundos, igual al valor por defecto del
   [SDK oficial](https://github.com/stripe/stripe-node/blob/master/src/Webhooks.ts);
5. evento Checkout reconocido y validado con Zod;
6. importe entero no negativo y coincidencia exacta con el intent recordado;
7. deduplicación por evento y por referencia de pago antes de escribir.

La salida Stripe exige además timeout de 8 s por intento, máximo dos intentos,
la misma `Idempotency-Key` en cada POST repetido, respuesta Zod y códigos de
error cerrados sin leer el body remoto. Solo se reintentan ambigüedades de red,
409/5xx o una indicación explícita de Stripe; un 4xx ordinario termina.

Redsys genera y verifica HMAC-SHA256 con la clave diversificada mediante 3DES;
la implementación pura está cruzada localmente contra `node:crypto`. Esa
evidencia no sustituye el TPV de pruebas. El refund REST tiene un único intento
de 8 s y solo acepta un sobre válido, firmado, para el mismo pedido e importe con
`Ds_Response=0900`; un 2xx vacío, `errorCode`, rechazo, firma ajena o ambigüedad
de transporte fallan cerrados sin tocar el saldo.

El manual REST v4.0.1 recomienda `HMAC_SHA512_V1` para comercios actuales y
mantiene SHA-256 disponible en su anexo. Este adaptador conserva
`HMAC_SHA256_V1`; confirmar con la entidad qué versión tiene habilitada el
terminal antes del sandbox y no mezclar versiones en petición/respuesta.

## 2. Configuración y ownership

| Entrada                        | Dónde vive        | Responsable                 | Regla                                                       |
| ------------------------------ | ----------------- | --------------------------- | ----------------------------------------------------------- |
| cuenta/comercio y facturación  | proveedor         | cliente + Logic2B           | registrar titular, contacto, moneda, límites y soporte      |
| `modules.payments.provider`    | D1 del tenant     | cliente + Logic2B           | `none`, `stripe` o `redsys`; `none` es el modo seguro       |
| `modules.payments.mode`        | D1 del tenant     | cliente                     | `none`, `deposit` o `full`; política aprobada por escrito   |
| `depositPercent`               | D1 del tenant     | cliente                     | entero acordado; no representa fianza                       |
| `STRIPE_SECRET_KEY`            | secret del Worker | Logic2B                     | clave de API test/live del destino correcto                 |
| `STRIPE_WEBHOOK_SECRET`        | secret del Worker | Logic2B                     | secret propio del endpoint, distinto de la API key          |
| código, terminal y entorno     | D1 del tenant     | titular del comercio Redsys | FUC/terminal exactos; `test` antes de `production`          |
| `REDSYS_MERCHANT_KEY`          | secret del Worker | titular + Logic2B           | nunca config, `.env`, ticket, log, captura ni documentación |
| cancelación y reembolso        | ficha del cliente | cliente                     | plazos, parciales, autorización y canal de incidencias      |
| conciliación y cierre contable | procedimiento     | cliente                     | fuente de verdad y frecuencia acordadas antes de activar    |

Precio, comisión, plazo de liquidación, reserva, disputa y renovación se
consultan y registran en la activación; no se congelan tarifas cambiantes en el
repositorio.

## 3. Preflight sin transacciones

- [ ] módulo contratado y titular del comercio identificado;
- [ ] política `none`/señal/completo, porcentaje, moneda y reembolso aprobados;
- [ ] cuenta de **test**, operadores y segundo factor confirmados;
- [ ] endpoint no productivo identificado y secret propio obtenido;
- [ ] URLs de éxito, cancelación y webhook pertenecen al destino autorizado;
- [ ] reloj del Worker fiable: una deriva superior a cinco minutos invalida
      Stripe por diseño;
- [ ] no se reutilizan claves live en pruebas ni claves entre tenants;
- [ ] owner, coste, límites, soporte, alertas y conciliación registrados;
- [ ] rollback, reservas `pending` y procedimiento de disputa acordados.

## 4. Activación sandbox autorizada

### Stripe

1. Crear/restringir una API key de test y un endpoint webhook de test.
2. Guardar ambos secrets por el mecanismo del Worker sin imprimirlos.
3. Configurar `provider:stripe` y un modo de pago en un tenant no productivo.
4. Recorrer éxito, abandono, expiración y pago asíncrono fallido.
5. Repetir el mismo evento y enviar otro id sobre la misma sesión: debe existir
   un solo asiento y un único incremento de `paidCents`.
6. Probar importe distinto, firma inválida y evento con más de 300 s: deben
   fallar cerrados sin confirmar la reserva.
7. Probar reembolso parcial/total, conciliación, recibo y referencia del panel.
8. Forzar timeout/conexión cortada tras enviar y comprobar en el panel que una
   misma operación no creó dos Checkout Sessions ni dos refunds.

### Redsys

1. Confirmar FUC, terminal, clave y URLs del comercio de pruebas.
2. Configurar `environment:test`; nunca usar la clave de producción para el
   smoke.
3. Recorrer autorización, denegación, abandono y notificación duplicada.
4. Comparar pedido, importe y código de autorización con el panel del TPV.
5. Probar devolución y validar el acuse funcional, no solo el HTTP 2xx.
6. Conciliar los asientos locales con el informe del comercio.
7. Cortar la conexión después de enviar una devolución: no repetir a ciegas;
   comprobar pedido e importe en el Portal antes de decidir el asiento local.

No pasar a live hasta conservar evidencia fechada de todos los casos y resolver
cualquier diferencia de firma, importe, estado o conciliación.

## 5. Rotación

### Stripe

1. Crear una API key nueva y actualizar `STRIPE_SECRET_KEY` en test.
2. Ejecutar Checkout+webhook+refund controlados.
3. Revocar la API key anterior solo tras el smoke.
4. Rotar el secret del endpoint siguiendo la ventana de firmas múltiples de
   Stripe; actualizar `STRIPE_WEBHOOK_SECRET` y probar una entrega inmediata.

El parser acepta varias firmas `v1`, pero el Worker conserva un único secret
activo. No cerrar la ventana del proveedor hasta que el destino actualizado
haya aceptado un evento reciente.

### Redsys

Coordinar la nueva clave con el titular y Redsys, sustituir el secret en el
entorno exacto y probar primero el TPV de pruebas. La clave anterior solo se
retira cuando autorización, notificación y devolución se hayan conciliado.

## 6. Degradación, apagado e incidente

- `provider:none` impide abrir pasarela y conserva cobros manuales. No confirma
  silenciosamente una reserva que ya nació `pending` con otro proveedor.
- Ante caída, pausar el checkout web o cambiar a `none` solo después de listar y
  reconciliar intents/reservas pendientes. No borrar intents ni repetir cobros a
  ciegas.
- Sin secrets requeridos, la API falla `payment_not_configured`; nunca simula
  aceptación.
- Un webhook inválido o caducado no escribe pagos. Antes de reenviarlo, comparar
  reloj, endpoint, secret, cuerpo crudo, id e importe en el panel del proveedor.
- En sospecha de clave expuesta: pausar checkout, rotar credencial, conservar
  referencias, revisar eventos y conciliar antes de reanudar. No copiar payloads
  o datos de tarjeta a logs/tickets.
- Revertir código o config no revierte dinero. Todo rollback exige conciliación
  con el proveedor y el cliente.

## 7. Evidencia local y gates restantes

- pagos unitarios: **35/35**, incluida salida Stripe idempotente y refund Redsys
  con timeout, sobre firmado, `0900`, pedido/importe y rechazos cerrados;
- API de pagos: **15/15**; además de Stripe y los invariantes de entrada, un
  `0180` Redsys firmado conserva saldo y único asiento positivo;
- `payments.raw` permanece nulo y fuera de la API/export;
- no se usaron secrets válidos ni hubo llamada sandbox;
- faltan recepción real, refund y conciliación extremo a extremo, además de
  confirmar la versión de firma habilitada por el terminal.
