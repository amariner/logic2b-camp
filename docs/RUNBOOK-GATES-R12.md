# Runbook — gates externos pendientes de R12

> Estado local auditado el 2026-08-10. Este documento no acredita cuentas,
> proveedores, sandbox ni producción. Define cuándo se puede abrir cada gate y
> cómo volver al modo seguro sin confundir una demo con una integración real.

## 1. Evidencia local común

El contrato se ejecuta durante la build de `@logic-camp/web`:

```bash
pnpm --filter @logic-camp/web test
pnpm --filter @logic-camp/web build
```

`scripts/r12-boundaries.mjs` inspecciona fuente, manifiestos y el artefacto
generado. Falla si encuentra trackers, almacenamiento de seguimiento, SDKs de
analítica/modelos/OTA, recursos ejecutables remotos, un transporte externo en
los prototipos o una política de cookies que ya no describa el artefacto.

El contrato prueba **ausencia y degradación local**, no funcionamiento de un
tercero. Una credencial futura obliga a completar la fila correspondiente antes
de retirar su estado «pendiente».

## 2. Analytics / atribución

### Estado actual por superficie

- `apps/site` usa `GTM-TVDWZ9LC` con consentimiento básico: Google no se carga
  antes de aceptar y la decisión se puede rechazar o retirar desde `/cookies`.
- Los eventos comerciales son cerrados y no admiten nombre, camping, email,
  teléfono, mensaje ni datos de reserva.
- `apps/web`, `/demo/`, `/demos/*` y `/admin/` siguen sin tracker ni CMP. Un
  cliente real no hereda el contenedor de Logic2B.
- El producto y los formularios funcionan si la analítica se rechaza o falla.

### Disparador y responsables

- **Disparador tenant:** un cliente aprueba una pregunta de negocio concreta,
  responsable, cuenta y herramienta. La captación comercial ya fue autorizada
  por ADR 0045.
- **Owner Logic2B:** producto para definir eventos; responsable técnico para la
  integración y la retirada.
- **Owner cliente:** responsable del tratamiento/marketing; asesoría o DPO para
  base legal, consentimiento y retención cuando corresponda.

### Entradas obligatorias

- herramienta, cuenta, sitio/dominio y titularidad;
- finalidad y catálogo mínimo de eventos/UTM;
- base legal, CMP/consent mode si aplica y mecanismo de revocación;
- identificadores capturados, retención, acceso, exportación y borrado;
- exclusión de tráfico interno, coste, límites y contacto de soporte.

### Aceptación

1. La política de cookies coincide con el comportamiento real.
2. Una captura de red demuestra cero solicitudes a Google antes del
   consentimiento y eventos exactos después de otorgarlo.
3. Revocar impide nuevas emisiones; navegación, reserva y formulario no fallan.
4. Se prueban exclusión interna, UTM, retención y acceso a la cuenta.

### Degradación y desactivación

Rechazar o retirar consentimiento elimina nuevas emisiones sin impedir la web.
Para un apagado global se vacía `commercialSite.gtmId`, se reconstruye, se
repite la captura de red y se actualiza `/cookies`; no se conserva un snippet
que siga contactando al proveedor. El gate tenant continúa siendo `none` por
defecto y requiere un ADR/configuración propios.

## 3. Observabilidad externa — Sentry / Logpush

### Estado seguro actual

- `logEvent` emite JSON por stdout con nivel, evento, tenant y `requestId`.
- Correo, teléfono, código de reserva y tokens conocidos se redactan antes de
  escribir la línea; el cliente recibe una referencia, nunca stack ni detalle.
- No hay SDK ni transporte externo. El aviso por correo tiene un cortafuegos,
  pero no es canal independiente: si falla el correo, solo permanece el log.

### Disparador y responsables

- **Disparador:** entorno no productivo o cliente contratado con destino,
  contactos y objetivo de alerta aprobados.
- **Owner Logic2B:** responsable técnico/on-call de la aplicación.
- **Owner cliente:** contacto operativo que decide qué incidencias necesita
  recibir. Cloudflare/proveedor custodia el destino contratado.

### Entradas obligatorias

- cuenta, proyecto/dataset, región, destino y secret;
- eventos y severidades, muestreo, agrupación y umbrales;
- campos permitidos, reglas de PII, retención y acceso;
- canal de alerta **independiente del correo vigilado**, owner y escalado;
- presupuesto, límites, rotación de credenciales y soporte.

### Aceptación

1. Un error sintético devuelve referencia limpia y aparece una sola vez en el
   destino con el mismo `requestId`.
2. Email, teléfono, reserva, token y stack sensible no salen sin redacción.
3. La alerta llega por el canal independiente y respeta agrupación/muestreo.
4. Se comprueban coste/límite, retención, acceso, rotación y pérdida del destino.

### Degradación y desactivación

Sin destino o secret, `logEvent` debe continuar en stdout y la API no puede
depender del recolector. Retirar la configuración desactiva la exportación; se
prueba que la referencia y el log local sobreviven. Si el proveedor cae, se
conserva el diagnóstico local y se pausa el envío antes de generar tormentas.

## 4. OTA / channel manager

### Estado seguro actual

- No hay conector, sincronización, credencial, cola ni autoridad de inventario.
- Mar de Fondo solo genera reservas ficticias de origen `web` o `phone`; ninguna
  pantalla afirma conexión con Booking.com, Airbnb, Expedia u otro canal.
- La operación local no depende de un canal externo.

### Disparador y responsables

- **Disparador:** un cliente contrata un proveedor/API concreto y firma qué
  sistema manda sobre disponibilidad, precio y reserva.
- **Owner cliente:** responsable de inventario y relación con los canales.
- **Owner Logic2B:** contrato técnico, mapeos, idempotencia y conciliación.
- **Owner proveedor:** credenciales, límites, soporte y semántica oficial.

### Entradas obligatorias

- proveedor, contrato/API versionada, sandbox y credenciales;
- autoridad por dato, canales incluidos y mapeo unidad/tarifa/restricción;
- identificadores idempotentes, orden y ventana de eventos;
- límites, webhooks/polling, reintentos, cancelación y recuperación;
- política de conflictos, conciliación, coste y soporte.

### Aceptación

1. Alta, modificación y cancelación viajan en ambos sentidos acordados.
2. Repetición, desorden y timeout no duplican reserva ni venden inventario dos
   veces.
3. Caída y recuperación respetan la autoridad declarada y producen un informe
   de diferencias conciliable.
4. Los mapeos, límites, alertas y casos manuales quedan aprobados en UAT.

### Degradación y desactivación

El conector futuro debe tener `none/off` y no alterar el motor local. Ante
ambigüedad se congela la cola, no se reintenta a ciegas y el sistema elegido
permanece como autoridad. Para apagar: detener entrada/salida, exportar
pendientes, conciliar ambos lados y solo entonces retirar credenciales.

## 5. IA / Automatiza

### Estado seguro actual

- Automatiza usa fixtures locales: la respuesta queda `manual_external` y el
  parte de incidencias declara `execution: 'none'`.
- Inteligente declara `execution: 'none'`; sus reducers no admiten `apply` ni
  `execute`. Preparar nunca cambia tarifas, cupo, reservas ni abre tickets.
- No hay SDK, endpoint, modelo, envío de PII o acción externa escondida.

### Disparador y responsables

- **Disparador:** caso pagado con datos suficientes, tolerancia al error,
  supervisor y presupuesto aprobados.
- **Owner cliente:** responsable del proceso y persona que acepta/rechaza cada
  recomendación.
- **Owner Logic2B:** contrato de herramientas, permisos, evaluación y kill
  switch. Proveedor: modelo, región, retención, límites y soporte.

### Entradas obligatorias

- caso y acción máxima permitida; datos/campos autorizados;
- proveedor, modelo/versión, región, retención y uso para entrenamiento;
- herramientas tipadas, permisos por rol y confirmación humana;
- dataset de evaluación, umbrales, rechazo/fallback y prompt injection;
- presupuesto, latencia, rate limit, trazabilidad y contacto de soporte.

### Aceptación

1. El dataset versionado alcanza los umbrales acordados y conserva casos de
   rechazo, inyección y datos incompletos.
2. El modelo nunca obtiene herramientas o datos fuera del rol y el payload no
   contiene PII no autorizada.
3. Toda acción material exige confirmación humana y deja auditoría correlacionada.
4. Coste, latencia, timeout, límite y caída activan fallback sin bloquear la
   operación base.

### Degradación y desactivación

`provider:none` y un kill switch global son requisitos del contrato futuro. Al
activarlos desaparecen las llamadas y herramientas; el producto vuelve al flujo
manual y los prototipos siguen siendo solo borradores locales. Revocar la key no
debe impedir recepción, reservas, cobros ni informes.

## 6. Regla de cierre

Ninguna fila se considera activada por añadir un paquete, una variable o una
captura. Solo cambia de estado después de registrar cuenta/titularidad,
aceptación extremo a extremo, degradación, desactivación, coste, rotación y
evidencia fechada. Hasta entonces manda el modo seguro descrito aquí.
