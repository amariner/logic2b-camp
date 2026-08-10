# Runbook de SES.Hospedajes

> Estado del 2026-08-10: preparación y revisión local; **sin envío automático**.
> Este documento no sustituye el procedimiento ni la documentación técnica del
> Ministerio del Interior.

## 1. Verdad operativa actual

- Logic Camp reúne las llegadas confirmadas, señala datos incompletos y genera un
  XML determinista de revisión.
- El fichero se rotula **borrador**: no se afirma que sea un payload oficial, una
  carga masiva válida ni evidencia de comunicación.
- `manualTransport` es el único transporte exportado. No abre red.
- `POST /api/admin/hospedajes/enviar` devuelve `409 manual_only` aun cuando existan
  `SES_HOSPEDAJES_ENDPOINT`, `SES_HOSPEDAJES_USER` y
  `SES_HOSPEDAJES_PASSWORD`.
- No se crea `audit_log` de envío sin un acuse oficial. El código de comunicación
  de la Sede, su consulta y la eventual anulación son la evidencia externa.

## 2. Qué confirma la fuente oficial pública

La [Sede del Ministerio](https://sede.interior.gob.es/portal/sede/informacion_hospedajes)
indica que el registro proporciona credenciales de aplicación y de servicio web.
La guía visual v. 29.08.2025 muestra nueva comunicación, alta masiva, consulta,
anulación y código de comunicación aceptada.

La FAQ oficial actualizada el 09.04.2025 fija comunicación inmediata y, como
máximo, en 24 horas desde:

1. la reserva, formalización o anulación; y
2. el inicio de los servicios.

Una modificación de datos requiere una nueva comunicación. Un tercero puede
comunicar solo con autorización válida del sujeto obligado.

## 3. Gate técnico exacto

La guía oficial sitúa la descarga de la documentación del servicio web dentro del
área autenticada de la entidad. Las fuentes públicas no publican de forma
verificable:

- endpoint y entornos;
- protocolo exacto de autenticación;
- XSD/namespaces y códigos de cada campo;
- estructura de request y acuse;
- códigos de aceptación/rechazo;
- identidad de comunicación, duplicados e idempotencia;
- qué condiciones permiten reintentar sin duplicar una obligación legal.

No completar esos huecos con blogs, SDKs, XML locales ni inspección de terceros.
Un 2xx no equivale a comunicación aceptada y una respuesta vacía es ambigua.

## 4. Recorrido manual mientras el gate está cerrado

1. Abrir **Parte de viajeros** y elegir el día de llegada.
2. Resolver todos los avisos contra la documentación del huésped y escoger la
   forma de pago real.
3. Exportar el borrador XML si sirve para revisión interna; no subirlo como formato
   oficial sin contrastarlo con la documentación autenticada.
4. Entrar en el procedimiento oficial y crear la comunicación o alta masiva con el
   formato que la propia Sede vigente indique.
5. Conservar el código de comunicación, fecha, establecimiento y responsable.
6. Consultar el resultado en **Mis comunicaciones**. Si hay un error, corregirlo
   allí; si corresponde anular, usar el recorrido oficial de anulación.
7. Una caída o resultado ambiguo se consulta antes de repetir. No reenviar a
   ciegas.

## 5. Activación futura autorizada

Antes de escribir o habilitar el adaptador automático:

1. confirmar alcance contractual, autorización del establecimiento y responsable;
2. descargar la documentación técnica vigente desde la entidad autorizada y
   registrar versión/fecha sin guardar credenciales;
3. modelar request y acuse con Zod, fixtures sanitizados y códigos cerrados;
4. definir identidad, timeout y reintentos únicamente según la especificación;
5. probar aceptación, rechazo, respuesta vacía/mal formada, timeout, duplicado,
   consulta y anulación en el entorno oficial disponible;
6. conciliar código, establecimiento, reservas e inicios de servicio;
7. habilitar mediante una versión explícita de contrato, no por la mera presencia
   de tres secrets.

## 6. Desactivación e incidente

- El modo seguro es `manualTransport`; no depende de secretos ni proveedor.
- Ante duda de formato o acuse, detener el automático y consultar la Sede antes de
  repetir.
- No copiar XML, credenciales, documentos ni respuestas con PII a logs o tickets.
- El correo oficial publicado para dudas técnicas es
  `ses.hospedajes@interior.es`; contactar requiere autorización y no se ha usado en
  este corte.
