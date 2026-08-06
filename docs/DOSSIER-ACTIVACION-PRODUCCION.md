# Dossier interno de activación a producción

> Documento interno. No es material comercial ni prueba de que una integración
> esté operativa. Se usa cuando un cliente convierte una capacidad demostrada
> en alcance contractual. Estrategia origen:
> `docs/ESTRATEGIA-DEMO-FIRST.md`.

## 1. Cómo se usa

1. Duplicar la ficha de cliente del final de este documento.
2. Marcar solo los módulos contratados y eliminar el resto del plan de entrega.
3. Confirmar proveedor, credenciales, titularidad, datos y responsable antes de
   estimar.
4. Convertir cada módulo activado en tareas con criterio de aceptación.
5. No declarar producción hasta completar ensayo, reversión y evidencias.

Una pantalla existente en demo no reduce automáticamente el trabajo de
producción. La interfaz prueba el valor y el contrato de interacción; proveedor,
seguridad, operación y cumplimiento siguen necesitando activación.

## 2. Matriz maestra

| Capacidad                | Estado de demo permitido                                | Activación productiva                                                                 | Entradas del cliente/tercero                                   | Verificación antes de entregar                                         |
| ------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Web/dominio              | Marca, contenido y navegación reales sobre dominio demo | Tenant/config/contenido definitivo, DNS, SSL, redirects, privacidad y SEO             | Dominio, marca, textos, fotos, idiomas, razón social           | Lighthouse, enlaces, formularios, canonical/hreflang, 375/1366 px      |
| Formulario Inicio        | Adaptador con éxito/error/antispam determinista         | Receptor fiable, rate limit, antispam, consentimiento, retención y borrado            | Destinatario, textos legales, proveedor si aplica              | Entrega real, error controlado, spam, logs sin PII indebida, E2E       |
| Tenant e infraestructura | Escenario por ruta/config y runtime compartido          | D1/bindings/secrets/dominio, migración, alta/baja y separación de entornos            | Cuenta Cloudflare, dominio, responsables, región/contrato      | Aislamiento, deploy, rollback, eliminación y exportación ensayados     |
| Usuarios y permisos      | Roles ficticios sobre datos demo                        | Identidades reales, altas/bajas, recuperación, MFA si se contrata y auditoría         | Lista de usuarios, roles y política de acceso                  | Matriz de permisos, fuga cruzada, recuperación y revocación            |
| Reservas/inventario      | Seed denso y operaciones reversibles                    | Inventario/tarifas/reglas reales, importación y corte operativo                       | Unidades, temporadas, restricciones, reservas futuras          | Invariantes, solapes, precios, importación conciliada y UAT            |
| Email/SMS/WhatsApp       | Previsualización y estados de envío                     | Proveedor, dominio, plantillas, consentimiento, reintentos y bajas                    | Cuenta, remitentes, plantillas, idiomas, consentimiento        | SPF/DKIM/DMARC, sandbox/real controlado, bounce y opt-out              |
| Pagos                    | Pasarela simulada, recibo marcado demo                  | Stripe/Redsys, webhooks, idempotencia, conciliación, reembolso y disputas             | Cuenta comercio, condiciones, monedas, política de cancelación | Sandbox completo, webhook repetido, fallo, reembolso y cierre contable |
| Facturación/VeriFactu    | Factura/estado de muestra                               | Serie, impuestos, numeración, rectificativas, firma/envío o integración fiscal        | Datos fiscales, asesoría, series, proveedor                    | Casos aprobados por asesor/proveedor y exportación conciliada          |
| SES.Hospedajes/INE       | Parte y estados de muestra                              | Credenciales, formato vigente, colas/reintentos, trazabilidad y soporte               | Alta oficial, establecimiento, códigos y responsables          | Sandbox/entorno oficial disponible, rechazo, reintento y evidencia     |
| Channel manager/OTA      | Hub y sincronizaciones representadas                    | Un conector elegido, mapeos, idempotencia, conflictos y reconciliación                | Contrato/API, inventario/canales y reglas de autoridad         | Alta/cambio/cancelación duplicados, caída, recuperación y conciliación |
| Analytics/atribución     | Dashboard sobre dataset demo                            | CMP/consentimiento, herramienta, eventos, UTM y política de retención                 | Cuenta, objetivos, base legal y campañas                       | Consent mode, eventos reales, exclusión interna y documentación        |
| Automatizaciones         | Escenarios y plantillas navegables                      | Triggers, colas, horario, canales, aprobación, reintentos y límites                   | Casos, textos, responsables, ventanas y excepciones            | Dry-run, duplicados, fallo de canal, pausa global y auditoría          |
| IA/copiloto/forecast     | Respuestas o escenarios precalculados, etiquetados      | Proveedor/modelo, datos, herramientas tipadas, permisos, evaluación, coste y fallback | Casos, datos suficientes, tolerancia al error y presupuesto    | Dataset de evaluación, permisos, coste/latencia, rechazo y supervisión |
| Backups/observabilidad   | Mensajes y paneles de muestra                           | Export/restauración, alertas, logs, retención, runbooks y responsables                | RPO/RTO, contactos y política de soporte                       | Restauración real fechada, alerta recibida y simulacro de incidente    |

## 3. Secuencia de una implantación real

### P0 · Descubrimiento y cierre de alcance

- Inventario de unidades, temporadas, tarifas, canales, reservas futuras y
  herramientas actuales.
- Obligaciones: facturación, SES/INE, RGPD, pagos y comunicaciones.
- Qué sustituye Logic Camp y qué continúa siendo externo.
- Fecha objetivo, ventana de corte, responsable y criterio de vuelta atrás.
- Alcance firmado por módulos; nada del roadmap entra por defecto.

### P1 · Instancia y datos

- Tenant/config/contenido y dominio.
- D1/bindings/secrets y entornos.
- Importación con informe de filas aceptadas/rechazadas.
- Usuarios/roles y verificación de aislamiento.
- Backup inicial y reversión antes del primer cambio real.

### P2 · Proveedores contratados

- Activar solo email, pagos, fiscalidad, SES/INE o canales incluidos.
- Probar sandbox cuando exista y un caso real controlado cuando corresponda.
- Registrar titularidad de cuenta, renovación, límites, coste y soporte.
- Documentar qué ocurre si el proveedor cae.

### P3 · UAT y formación

- Recorrer un día real: consulta/reserva → cobro → llegada → estancia → salida.
- Casos de error: solape, pago fallido, mensaje rebotado, caída y duplicado.
- Formación por rol y guía del cliente.
- Aceptación escrita de los recorridos contratados.

### P4 · Salida y estabilización

- Freeze/import final, DNS y smoke test.
- Monitorización intensiva y canal de incidencia con límites claros.
- Conciliación de reservas, cobros y documentos.
- Ensayo de restauración y entrega de exportación/portabilidad.

## 4. Ficha que acompaña a cada demo

```md
### [Capacidad / pantalla]

- Prospecto ve:
- Resultado que vende:
- Mecanismo de demo:
- Etiqueta visible (demo/prototipo/roadmap):
- Trabajo productivo pendiente:
- Proveedor/credenciales necesarios:
- Datos y riesgos:
- Criterio de aceptación:
- Estimación después de discovery:
```

## 5. Ficha de activación por cliente

```md
# Activación — [cliente]

## Contexto

- Camping / tamaño / temporada:
- Fecha objetivo:
- Responsable cliente:
- Responsable Logic2B:
- Sistema actual y alcance de sustitución:

## Módulos contratados

- [ ] Web/dominio
- [ ] Formularios
- [ ] Gestión/reservas
- [ ] Pagos
- [ ] Comunicaciones
- [ ] Facturación/VeriFactu
- [ ] SES/INE
- [ ] Channel manager/OTA
- [ ] Analytics
- [ ] Automatización/IA

## Dependencias y credenciales

- Pendientes:
- Responsable:
- Fecha límite:

## Datos y migración

- Fuente:
- Volumen:
- Reglas de limpieza/mapeo:
- Informe de conciliación:

## Pruebas de aceptación

- Recorrido principal:
- Fallos/reintentos:
- Seguridad/roles:
- Restauración/reversión:
- UAT firmada:

## Go-live

- Ventana:
- Rollback:
- Soporte de estabilización:
- Evidencias y cierre:
```

## 6. Regla de activación

Un cliente interesado no convierte automáticamente todo este dossier en
roadmap. Primero se identifica qué necesita para operar y qué compró. Después
se activan solo esas filas, en el orden que permita entregar un recorrido
completo, seguro y verificable.
