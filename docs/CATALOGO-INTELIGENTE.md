# Catálogo Inteligente · Control total

> Catálogo interno provisional aprobado como alcance documental el 2026-08-14.
> Las 56 capacidades pertenecen exclusivamente a Inteligente. Una ficha no
> significa producto disponible: manda su columna **Estado**.

## Cómo leer las fichas

- **Usuario/problema** fija para quién existe y qué evita.
- **Resultado/UX** describe el comportamiento visible, no una tecnología.
- **Datos** enumera la mínima fuente necesaria.
- **Autonomía** sigue ADR 0048: automática, supervisada o confirmación fuerte.
- **Dependencia/riesgo** impide que una maqueta esconda un gate real.
- **Demo/gate** separa la evidencia actual de la activación productiva.

## 1. Centro de operaciones

| Capacidad | Tier | Usuario/problema | Resultado/UX | Datos | Autonomía | Estado | Dependencia/riesgo | Demo/gate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Pulso diario | Inteligente | Gerencia abre varias pantallas para entender el día | Cabecera con ocupación, entradas, salidas, preparación, cobros y riesgos | Planning, tareas, pagos, incidencias | Automática, solo lectura | Demo funcional | Una cifra sin definición puede mentir | Centro Mar de Fondo; gate: contrato de cada KPI |
| Alertas priorizadas | Inteligente | Lo urgente compite con ruido | Bandeja ordenada por impacto, plazo y reversibilidad | Eventos y plazos | Automática para ordenar; confirmar acciones | Demo funcional | Priorización opaca o alarmista | Tres riesgos ficticios; gate: reglas auditables |
| Entradas y salidas | Inteligente | Recepción y gerencia pierden el contexto cruzado | Dos listas con estado de unidad, pago y documentación | Reservas, check-in/out, preparación | Lectura automática | Disponible | Duplicar la fuente de Llegadas | Reutiliza operación actual; gate: selector único |
| Preparación de unidades | Inteligente | Una reserva confirmada no dice si la unidad está lista | Mapa y contador sucia/en curso/revisión/lista/bloqueada | Unidades y tareas | Automática para derivar; validación humana | Demo funcional | Confundir limpieza con disponibilidad comercial | Fixture cruzado; gate: invariante independiente |
| Situación económica | Inteligente | Valor, cobro y saldo se mezclan | Pulso separado de valor reservado, cobrado, saldo y diferencias | Reservas, pagos, caja | Lectura automática | Disponible | Llamar facturación a reservas | Informes actuales; gate: contabilidad define export |
| Carga del equipo | Inteligente | Nadie ve cuellos de botella hasta el retraso | Capacidad por turno, tareas vencidas y reparto | Turnos, tareas, duración | Recomendación supervisada | Demo funcional | Convertir productividad en vigilancia individual | Escenario agregado; gate: política laboral |
| Horizonte siete días | Inteligente | Se actúa solo cuando llega el problema | Próximos picos de salidas, grupos, limpieza y cobros | Planning y tareas previstas | Automática para señal; humana para plan | Visión futura | Previsión sin histórico suficiente | Pantalla de escenario; gate: temporada real completa |

## 2. Limpieza y preparación

| Capacidad | Tier | Usuario/problema | Resultado/UX | Datos | Autonomía | Estado | Dependencia/riesgo | Demo/gate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Generación por salida | Inteligente | La limpieza depende de que alguien recuerde cada salida | Tarea prevista al programar la salida y accionable tras check-out | Reserva, unidad, tipo | Automática y reversible | Demo funcional | Duplicados al mover/cancelar | Fixture; gate: idempotencia por estancia/unidad |
| Prioridad de rotación | Inteligente | Una unidad sale y entra el mismo día sin destacar | Chip “entrada hoy”, hora límite e impacto | Salida, próxima entrada | Automática | Demo funcional | Prometer hora sin política de entrega | BL-018 ficticia; gate: horario del cliente |
| Asignación | Inteligente | El reparto vive en papel o chat | Asignar equipo/persona y zona desde tablero | Tareas, disponibilidad | Supervisada | Demo funcional | Ausencias y permisos no modelados | Acción local; gate: identidad y turnos reales |
| Checklist móvil | Inteligente | El estándar cambia por tipo y no deja evidencia | Lista táctil por alojamiento con incidencias rápidas | Plantillas por tipo | Automática para cargar; persona completa | Demo funcional | Checklist interminable o datos sensibles | Vista 390 px; gate: validar con limpiadoras |
| Estados de preparación | Inteligente | “Hecho” no distingue limpiar de revisar | `scheduled/pending/in_progress/review/ready/blocked` con historial | Tarea y transiciones | Persona opera | Demo funcional | Saltos inválidos o dos operadores | Reducer; gate: concurrencia en servidor |
| Inspección y reapertura | Inteligente | Una unidad puede declararse lista con defecto | Gerencia valida o reabre con motivo | Checklist, autor, tiempo | Confirmación humana | Demo funcional | Cultura punitiva o reaperturas sin contexto | Flujo completo; gate: responsabilidad acordada |
| Consumibles y tiempos | Inteligente | Faltan sábanas o material en el pico | Consumo previsto/real y duración por tipo, no ranking personal | Plantillas, existencias, tiempos | Señal automática; ajuste humano | Visión futura | Inventario ligero deriva a ERP | Escenario; gate: catálogo y proceso de reposición |

## 3. Mantenimiento y activos

| Capacidad | Tier | Usuario/problema | Resultado/UX | Datos | Autonomía | Estado | Dependencia/riesgo | Demo/gate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Reporte desde operación | Inteligente | Un fallo se pierde al pasar de limpieza a recepción | Crear incidencia desde unidad/tarea con categoría y descripción | Unidad, tarea, autor | Persona confirma | Demo funcional | Texto/foto con PII | Hallazgo de limpieza; gate: límites y retención |
| Triage e impacto | Inteligente | Todas las averías parecen iguales | Prioridad por seguridad, huésped, inventario y plazo | Incidencia, próximas estancias | Recomendación supervisada | Demo funcional | Algoritmo minimiza riesgo humano | Gerente elige impacto; gate: matriz aprobada |
| Órdenes de trabajo | Inteligente | No hay responsable ni siguiente paso | Asignación, fecha, estado y resolución | Incidencia, equipo | Supervisada | Visión futura | Proveedor externo sin identidad | Pantalla; gate: equipo/proveedor real |
| Evidencias | Inteligente | La reparación no deja contexto verificable | Fotos, comentarios y antes/después | R2, autoría | Persona aporta | Visión futura | PII, malware y coste de almacenamiento | Mock visual; gate: R2, escaneo y borrado |
| Impacto en inventario | Inteligente | Una avería y una reserva viven separadas | Mostrar llegada afectada, bloquear y preparar reasignación | Unidad, planning, bloqueo | Confirmación fuerte | Demo funcional | Bloquear o mover incorrectamente una venta | Flujo completo; gate: transacción e invariantes |
| Preventivo | Inteligente | Solo se repara después del fallo | Calendario por activo/uso/temporada | Activos, periodicidad | Creación automática; cierre humano | Visión futura | Frecuencias inventadas | Escenario; gate: inventario técnico del cliente |
| Historial y costes | Inteligente | No se detectan fallos repetidos ni coste real | Línea temporal por activo con tiempo, material y recurrencia | Incidencias, costes | Lectura automática | Visión futura | Costes incompletos inducen decisiones falsas | Escenario; gate: criterio contable operativo |

## 4. Equipo y turnos

| Capacidad | Tier | Usuario/problema | Resultado/UX | Datos | Autonomía | Estado | Dependencia/riesgo | Demo/gate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Planificación de turno | Inteligente | La cobertura no se cruza con la carga prevista | Vista de personas, franja y capacidad operativa | Disponibilidad y previsión | Propuesta supervisada | Visión futura | No sustituye RR. HH. ni fichaje | Escenario; gate: frontera laboral |
| Tablero de tareas | Inteligente | Trabajo de áreas distintas queda en canales distintos | Lista unificada por área, plazo y responsable | Tareas operativas | Persona opera | Demo funcional | Un tablero genérico pierde dominio | Centro y subvista; gate: taxonomía real |
| Preparar relevo | Inteligente | El turno saliente redacta desde memoria | Borrador agregado de pendientes, riesgos y compromisos | Eventos del día | Automática para reunir; humana revisa | Demo funcional | Copiar PII innecesaria | Flujo local; gate: minimización y fuentes |
| Reconocer relevo | Inteligente | Nadie sabe si el siguiente turno leyó | Confirmación con hora, persona y versión | Handover, identidad | Confirmación humana | Demo funcional | Firma aparente sin autenticación | Simulación local; gate: sesión real y auditoría |
| Carga de trabajo | Inteligente | Una zona queda saturada y otra ociosa | Capacidad agregada y redistribución sugerida | Tareas, turnos, duración | Supervisada | Visión futura | Métricas individuales sensibles | Escenario agregado; gate: política laboral |
| Escalado | Inteligente | Una tarea vencida no llega al responsable correcto | Reglas por gravedad/tiempo con salida manual | Tarea, prioridad, jerarquía | Automática reversible | Visión futura | Fatiga de alertas | Pantalla; gate: canal y SLA reales |
| Protocolos | Inteligente | Los pasos críticos dependen de experiencia tácita | Checklists versionados por evento y área | Plantillas y versiones | Carga automática; persona completa | Siguiente por validar | Burocracia o versión obsoleta | Wiki Dirección; gate: validar un protocolo real |

## 5. Huésped y comunicación

| Capacidad | Tier | Usuario/problema | Resultado/UX | Datos | Autonomía | Estado | Dependencia/riesgo | Demo/gate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cronología del huésped | Inteligente | Mensajes, cobros y estancia se consultan separados | Timeline única con fuentes y estados | Reserva, pagos, mensajes, incidencias | Lectura automática | Siguiente por validar | Exposición excesiva de PII | Escenario; gate: permisos y retención |
| Pre-check-in | Inteligente | Recepción captura documentos durante el pico | Formulario previo, progreso y revisión | Huéspedes, documentos, consentimiento | Recordatorio automático; envío humano | Siguiente por validar | Datos de identidad de alto riesgo | Pantalla conceptual; gate: DPIA y canal seguro |
| Vehículos y acceso | Inteligente | Matrícula, llegada tardía o movilidad quedan en notas | Estado de acceso y necesidades junto a llegada | Vehículos, solicitudes | Supervisada | Siguiente por validar | Integración física y minimización | Escenario; gate: hardware/proveedor |
| Bandeja unificada | Inteligente | Email, WhatsApp y web fragmentan la conversación | Conversaciones por reserva con estado de entrega | Mensajes y canal | Supervisada | Siguiente por validar | Proveedores, consentimiento y plantillas | Integra prototipo; gate: un canal contratado |
| Plantillas y traducción | Inteligente | Responder en varios idiomas consume tiempo | Plantilla localizada con variables y revisión | Contenido, locale, reserva mínima | Preparar automático; aprobar sensible | Siguiente por validar | Traducción errónea o datos filtrados | Automatiza actual; gate: proveedor y evals |
| Peticiones e incidencias | Inteligente | Una promesa al huésped no se convierte en trabajo | Petición ligada a estancia, responsable y plazo | Mensaje, reserva, tarea | Supervisada | Siguiente por validar | Notas libres con PII | Escenario; gate: taxonomía y permisos |
| Reputación y consentimiento | Inteligente | Se pide reseña sin comprobar experiencia o permiso | Solicitud postestancia y respuesta preparada con trazabilidad | Estancia, consentimiento, reseña | Riesgo graduado | Siguiente por validar | Plataforma externa y bases legales | Prototipo actual; gate: canal y política |

## 6. Reservas y grupos

| Capacidad | Tier | Usuario/problema | Resultado/UX | Datos | Autonomía | Estado | Dependencia/riesgo | Demo/gate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Expediente multiunidad | Inteligente | Familias/grupos se gestionan como reservas aisladas | Un expediente agrupa estancias sin borrar su independencia | Reservas, grupo | Confirmación fuerte | Siguiente por validar | Cambia invariantes, pagos y cancelación | Escenario; gate: ADR de dominio |
| Presupuestos y opciones | Inteligente | Una consulta telefónica no puede reservar decisión | Oferta versionada, caducidad y enlace de aceptación | Cotización, inventario | Preparar supervisado; aceptar fuerte | Siguiente por validar | Bloqueo especulativo de inventario | Pantalla; gate: política de holds |
| Rooming list | Inteligente | Participantes llegan por canales dispersos | Lista de ocupantes por unidad y progreso documental | Huéspedes, estancias | Persona revisa | Siguiente por validar | PII de terceros | Escenario; gate: consentimiento y acceso seguro |
| Varios pagadores | Inteligente | Una sola cuenta no refleja grupos | Distribuir calendario y saldo por responsable | Pagadores, pagos | Confirmación fuerte | Siguiente por validar | Conciliación y reembolsos complejos | Escenario; gate: proveedor y reglas |
| Proximidad | Inteligente | Asignar unidades juntas exige revisar plano a mano | Sugerir conjunto cercano compatible | Plano, disponibilidad | Recomendación supervisada | Siguiente por validar | Optimización no debe crear solape | Escenario; gate: algoritmo e invariante |
| Lista de espera | Inteligente | Un “no hay” pierde demanda recuperable | Registrar preferencia y avisar ante hueco | Solicitud, disponibilidad | Aviso supervisado | Siguiente por validar | Spam y expectativas falsas | Wiki; gate: consentimiento y caducidad |
| Prórrogas y cambios | Inteligente | Estancias largas y upgrades exigen cancelar/recrear | Re-cotizar extensión o cambio con impacto visible | Reserva, tarifas, unidad | Confirmación fuerte | Siguiente por validar | Precio histórico, cobros y tipo distinto | Escenario; gate: ADR de modificación |

## 7. Ingresos, caja y consumos

| Capacidad | Tier | Usuario/problema | Resultado/UX | Datos | Autonomía | Estado | Dependencia/riesgo | Demo/gate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Calendario de cobro | Inteligente | Depósito/saldo no tienen hitos explícitos | Cuotas, vencimientos y estado por reserva/grupo | Booking, pagos | Creación por política; cambios fuertes | Visión futura | No confundir calendario con factura | Escenario; gate: política y proveedor |
| Vencimientos | Inteligente | Seguimiento depende de memoria | Cola de saldos próximos/vencidos y recordatorio preparado | Calendario, mensajes | Riesgo graduado | Visión futura | Cobro duplicado o presión indebida | Centro; gate: idempotencia y canal |
| Cierre de caja | Inteligente | Efectivo y TPV se cuadran fuera | Apertura, movimientos esperados, contado y diferencia | Pagos, caja | Confirmación fuerte | Visión futura | Fiscalidad y fraude | Escenario; gate: procedimiento/asesoría |
| Conciliación | Inteligente | Proveedor y sistema divergen sin señal | Emparejar movimientos y aislar diferencias | Extractos, pagos | Automática para match; humana resuelve | Visión futura | Estado externo ambiguo | Escenario; gate: sandbox y ficheros reales |
| Valor, cobrado y saldo | Inteligente | Un KPI único confunde venta con caja | Tres series con definición y periodo | Reservas y pagos | Lectura automática | Disponible | Doble conteo y fechas distintas | Informes actuales; gate: mantener contrato |
| Rentabilidad | Inteligente | Ocupación alta puede esconder margen bajo | Margen provisional por tipo/temporada con fuentes | Ingresos, costes operativos | Recomendación supervisada | Visión futura | Costes parciales producen falsa precisión | Inteligente; gate: fuente de costes acordada |
| Contadores, fianzas y extras | Inteligente | Consumos/material se cobran manualmente | Lectura inicial/final, depósito y cargos preparados | Medidores, extras, pagos | Lectura humana; cargo fuerte | Visión futura | Hardware, fraude y fiscalidad | Escenario; gate: dispositivos y política |

## 8. Inteligencia e integraciones

| Capacidad | Tier | Usuario/problema | Resultado/UX | Datos | Autonomía | Estado | Dependencia/riesgo | Demo/gate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Resumen diario | Inteligente | Dirección interpreta decenas de señales | Resumen con fuentes, cambios y límites | Centro y eventos | Preparación automática; revisión humana | Demo funcional | Alucinación o pérdida de matiz | Relevo/Automatiza; gate: evals |
| Previsión de demanda | Inteligente | Se decide sin anticipar ocupación | Rango y confianza por periodo/tipo | Histórico suficiente | Recomendación supervisada | Visión futura | Dataset pequeño o deriva estacional | Inteligente actual; gate: dos temporadas |
| Previsión de personal | Inteligente | El pico se descubre al empezar el turno | Carga esperada por área y franja | Salidas, entradas, tareas, tiempos | Recomendación supervisada | Visión futura | Impacto laboral y falsos mínimos | Escenario; gate: datos/criterio humano |
| Precios y promociones | Inteligente | Baja demanda no se traduce en acción trazable | Propuesta acotada con impacto y rollback | Tarifas, demanda, margen | Confirmación fuerte | Demo funcional | Erosión de precio o discriminación | Inteligente actual; gate: margen y sandbox |
| Anomalías y recurrencia | Inteligente | Patrones de fallo pasan desapercibidos | Señalar desvíos con evidencia y umbral | Incidencias, activos, operación | Señal automática | Visión futura | Falsos positivos y vigilancia | Escenario; gate: métrica base |
| Copiloto | Inteligente | Consultar el negocio exige saber cada pantalla | Pregunta, fuentes citadas y acción preparada | Índice autorizado | Lectura/preparación; nunca ejecución sensible | Visión futura | PII, prompt injection y permisos | Pantalla; gate: proveedor, RAG y evals |
| Hub de integraciones | Inteligente | OTA, fiscal, accesos y mensajería parecen promesas iguales | Catálogo con estado, dueño, salud y última sincronización | Adaptadores y observabilidad | Según riesgo; fallo seguro | Visión futura | Credenciales, autoridad y lock-in | Escenario; gate individual R12 por proveedor |

## Selección pública de 18 capacidades

Pulso diario, alertas, horizonte semanal, prioridad de rotación, checklist móvil,
validación de limpieza, incidencia con impacto, preventivo, relevo, carga de
equipo, pre-check-in, bandeja unificada, grupos, presupuestos/opciones, calendario
de cobro, rentabilidad, recomendaciones explicables y hub de integraciones.
