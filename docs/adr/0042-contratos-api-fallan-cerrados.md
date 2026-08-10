# 0042 — Los contratos de API fallan cerrados y declaran su resultado real

- **Fecha:** 2026-08-10
- **Fase:** R4 · backend mínimo y contratos de API
- **Estado:** aceptado por el protocolo autónomo de `docs/CONTINUA.md`: corrige
  promesas falsas y fallos de seguridad reproducibles sin activar proveedores
  ni tocar producción.

## Contexto

R3 cerró la validación de configuración, pero el barrido de R4 ha encontrado
cinco diferencias entre el contrato que el producto afirma y el que ejecuta:

1. `POST /api/leads` respondía siempre `{ ok: true }`, tanto si Resend entregaba
   como si no había proveedor o este había fallado. La landing borraba el
   formulario y prometía respuesta en 24 horas aunque no hubiese salido nada.
2. Un webhook de pago con firma válida confirmaba una reserva con cualquier
   importe positivo, porque el intent recordaba solo `providerRef → bookingId`.
   Además, dos eventos distintos del mismo cobro podían sumar dos veces.
3. Better Auth usaba un secreto constante si `AUTH_SECRET` faltaba. El comentario
   lo llamaba fallback local, pero el runtime no distinguía local de producción.
4. La supresión RGPD no vaciaba los campos personales añadidos por el parte de
   viajeros y dejaba notas libres de la reserva. `payments.raw`, aunque hoy se
   escribe siempre a `null`, seguía formando parte de las respuestas privadas y
   del export del interesado.
5. Varios inputs solo parecían validados: `YYYY-MM-DD` aceptaba días inexistentes,
   un bloqueo admitía unidad y tipo a la vez, un estado de solicitud desconocido
   devolvía toda la bandeja y un ajuste podía persistir una moneda que la lectura
   posterior rechazaría.

El inventario previo también confirma que el aislamiento A↛B y el rol `demo`
ya se dirigen desde `app.routes`; no hace falta duplicar un test por endpoint.
Sí hace falta que la auditoría de contrato deje una tabla exhaustiva y falle al
aparecer una ruta sin clasificar.

## Decisión

### 1. Inventario ejecutable

Cada ruta registrada queda clasificada por superficie, autenticación mínima,
validación, mutación, idempotencia y límite de tráfico. Un test compara las
claves de esa tabla con el inventario real de Hono. Las rutas internas de Better
Auth se declaran como contrato delegado; los endpoints de la demo siguen fuera
del Worker genérico y bajo el barrido propio de `tenants/demo`.

El limitador v1 sigue siendo una ventana fija por IP e isolate —no se presenta
como cuota distribuida—, pero separa captación, login/gestión pública y tráfico
general. Una cuota durable o WAF pertenece a R12 y exige volumen/política real.

### 2. El formulario dice qué ocurrió

El transporte comercial tiene tres resultados públicos y disjuntos:

- `delivered`: Resend aceptó el mensaje;
- `demo`: simulación activada explícitamente con `LEADS_TRANSPORT=demo`;
- `disabled` o `failed`: no hubo entrega; la API responde error y la UI conserva
  los datos.

Nunca se infiere `demo` del slug del tenant. Sin clave ni modo explícito se falla
cerrado como `disabled`. Un error del proveedor solo comparte una referencia de
correlación; su detalle queda sanitizado en servidor.

### 3. Sesión y pago necesitan evidencia verificable

`AUTH_SECRET` es obligatorio y de al menos 32 caracteres. El único fallback es
un secreto local activado con `LOGIC_CAMP_DEV_AUTH=1`; la plantilla y los
wrangler desplegables no contienen ese interruptor.

Cada intent persiste en `meta`, de forma atómica, el booking, el importe esperado
y las instrucciones de continuación. Así un reintento con la misma
`Idempotency-Key` devuelve la misma operación. La clave externa se guarda como
SHA-256 y los retornos de pasarela no llevan el correo del titular, para que la
idempotencia no cree una segunda copia de PII. El webhook solo escribe si:

1. su firma ya fue validada por el adaptador;
2. el `providerRef` pertenece al intent;
3. el importe coincide exactamente con el guardado;
4. el cobro no fue procesado ya con otro `eventId`;
5. no supera el saldo pendiente.

Un fallo al crear o persistir el intent responde `502` con `persisted: true` y
una referencia: la reserva queda `pending` y visible, pero nunca se disfraza de
alta completa. No se activa Stripe ni Redsys y no se inventa verificación de
sandbox.

### 4. PII mínima y columnas heredadas cerradas

La anonimización usa una lista única que incluye documento de soporte, segundo
apellido, sexo, parentesco y sellos de consentimiento; también vacía las notas
libres de las reservas vinculadas. El actor de una acción pública se registra
como `guest`, no con el correo en claro.

`payments.raw` queda como columna heredada, siempre `null`, se limpia mediante
migración y no sale por API ni export. Si un proveedor futuro necesita conservar
evidencia, deberá definir primero un esquema mínimo y una política de retención;
guardar el payload entero no vuelve a ser el default.

### 5. Validación antes de escribir

Las fechas ISO deben existir en el calendario; los rangos conservan salida
exclusiva. Los bloqueos eligen exactamente una unidad o un tipo y comprueban que
exista. Estados de filtro inválidos son `400`, no “sin filtro”. Moneda y locales
se validan con el mismo contrato que usa la lectura de `TenantConfig`.

## Proveedores que pasan a R12

- Resend real: dominio y clave, prueba de entrega, rebotes y política de
  reintentos/Queues.
- Stripe: cuenta sandbox, secreto de webhook, expiración/reintento del Checkout
  y conciliación de eventos reales.
- Redsys: FUC, terminal y clave de sandbox; comparación de request, callback y
  devolución contra el TPV oficial antes de aceptar un euro.
- SES.Hospedajes: credenciales, contrato oficial, acuse y reintento; hasta
  entonces el modo manual sigue siendo el único resultado honesto.
- WAF/rate limit distribuido y Sentry/Logpush: métricas y credenciales reales.

## Consecuencias

- Ninguna pantalla puede confundir simulación, ausencia de proveedor y entrega.
- Una integración incompleta deja un estado operativo explícito y correlacionado,
  no una reserva o un log ambiguos.
- Los barridos de aislamiento y rol demo siguen siendo la defensa estructural;
  el inventario de contratos añade cobertura sobre las demás dimensiones.
- La migración es aditiva y reversible salvo la limpieza deliberada de payloads
  `raw`, que no tienen consumidores ni escritura válida en el producto actual.
