# Arquitectura provisional — Inteligente · Control total

> Documento interno, 2026-08-14. Todo lo descrito aquí es provisional. La demo
> aprobada en ADR 0048 no implementa ninguna de estas tablas, rutas o permisos.

## 1. Frontera

Logic2B coordinaría operaciones de camping sobre la instancia D1 aislada del
tenant. Nóminas, contabilidad oficial y compras ERP quedan fuera. OTA,
contabilidad, fiscal/SES, control de accesos, telemetría y mensajería son
adaptadores separados; sin configuración deben degradar a `none`, nunca simular
éxito.

## 2. Agregados candidatos

| Agregado provisional | Responsabilidad | PII/retención |
| --- | --- | --- |
| `operation_tasks` | Trabajo asignable con plazo, unidad y checklist | Autor y notas; retención operativa configurable |
| `cleaning_runs` | Preparación ligada a salida/entrada y validación | Sin datos del huésped salvo referencia de reserva |
| `incidents` | Hallazgo, prioridad, impacto y resolución | Texto/fotos pueden contener PII; clasificación obligatoria |
| `assets` / `maintenance_plans` | Equipo físico, preventivo, coste e historial | Sin PII salvo responsable |
| `shift_handovers` / `acknowledgements` | Entrega de riesgos entre turnos | Autoría auditada; evitar copiar documentos del huésped |
| `group_files` / `group_stays` | Varias estancias bajo una negociación | Titular, participantes y pagadores: RGPD completo |
| `cash_sessions` / `reconciliations` | Apertura, cierre y diferencias | Datos económicos; nunca números completos de tarjeta |
| `meter_readings` / `deposits` | Consumos, fianzas y material | Vinculación mínima a unidad/reserva |

Cada agregado mantendría `tenant` por binding, IDs opacos, timestamps UTC,
acciones idempotentes y `audit_log`. Dinero siempre en céntimos; fechas de
estancia continúan `YYYY-MM-DD`, salida exclusiva.

## 3. Estados candidatos

- Preparación: `scheduled → pending → in_progress → review → ready`; `blocked`
  puede entrar desde cualquier estado no terminal y exige motivo.
- Incidencia: `reported → triaged → assigned → in_progress → resolved → closed`;
  bloquear inventario es una acción explícita independiente.
- Relevo: `draft → prepared → acknowledged`; una revisión crea versión nueva.
- Opción de grupo: `draft → offered → accepted|expired|declined`; aceptar debe
  cotizar de nuevo y reservar inventario en una transacción.
- Caja: `open → closing → reconciled`; una diferencia nunca se autocorrige.

## 4. Superficie API candidata

La futura API mantendría comandos pequeños: consultar Centro, listar/crear/asignar
tareas, transicionar una preparación, reportar/triage/resolver incidencia,
crear/levantar bloqueo, preparar/reconocer relevo, cotizar grupo, registrar
lectura y conciliar caja. Mutaciones con `Idempotency-Key`, Zod, rol/capacidad,
transacción y respuesta de conflicto con estado vigente.

No se decide aún REST exacto ni schema Drizzle. El ADR de cada familia deberá
inventariar rutas, cubrir aislamiento A↛B y declarar qué puede ejecutar el rol
demo. Una ruta nueva nace cerrada.

## 5. Capacidades y privacidad

El modelo jerárquico actual no debe exponer huéspedes y cobros al personal de
limpieza. La hipótesis es evolucionar a capacidades (`task:operate`,
`cleaning:validate`, `incident:triage`, `handover:ack`, `cash:reconcile`) sobre
roles dedicados o plantillas de rol. La autoridad sigue en servidor; la UI solo
oculta afordancias.

Fotos, notas y mensajes se consideran entrada no confiable: límite, tipo MIME,
escaneo, R2 por tenant, URLs firmadas y política de borrado. La IA recibe la
mínima información necesaria, con fuentes visibles y sin entrenar sobre datos
del cliente por defecto.

## 6. Eventos y autonomía

Eventos candidatos: `booking.departure_due`, `booking.checked_out`,
`cleaning.blocked`, `incident.reported`, `unit.blocked`, `handover.prepared`,
`payment.overdue`, `meter.reading_due`. Queues y cron reintentan con clave
estable; cada tarea falla aislada.

Autonomía por riesgo:

- automática: crear recordatorios/tareas reversibles y ordenar prioridades;
- supervisada: asignar equipo, preparar mensajes, opciones y recomendaciones;
- confirmación fuerte: precio, cobro, reembolso, reserva, bloqueo comercial,
  mensaje sensible o acción externa;
- prohibida sin proveedor/autoridad: OTA, fiscal/SES, cerraduras, WhatsApp o IA
  real.

## 7. Fallos y observabilidad

La ausencia de integración conserva el trabajo local y muestra `not_configured`.
Timeout deja estado `unknown`, nunca `sent` o `paid`. Webhooks verifican firma,
antireplay e idempotencia. Logs usan correlación, no cuerpos ni PII. Alertas no
dependen exclusivamente del proveedor que están vigilando.

## 8. Móvil, offline y rendimiento

La primera implementación real debe medir cobertura. Una PWA offline solo entra
si el cliente la necesita: cola local cifrada, versión, resolución explícita de
conflictos y prohibición de cachear documentos. Sin ese gate, responsive 320 px
y reintento seguro son suficientes. Centro y planning mantienen carga dinámica,
virtualización y presupuestos M6.

## 9. Activación por familia

Cada familia exige entrevista de proceso, métrica base, matriz de permisos,
modelo/retención, amenazas, ADR, tests de invariantes, migración y rollback,
dataset demo separado, documentación pública honesta y aceptación. Ninguna ficha
del catálogo sustituye este gate.
