# Presupuesto y operación de Cloudflare D1

Auditoría local y remota realizada el 25-08-2026. Objetivo operativo por base:
menos de 5.000.000 filas leídas y 100.000 filas escritas al día. No se muestran
identificadores de cuenta, credenciales ni datos personales.

## Alcance e inventario

En la cuenta autenticada existen cuatro D1: `logic-camp-demo`, `ecom-demo`,
`mvp-db` y `c-reservas`. Este repositorio solo configura y administra
`logic-camp-demo`; las otras tres se inventarían en sus repositorios antes de
modificarlas. El binding productivo es `DB` en `tenants/demo/wrangler.jsonc`.
Además existen `logic-camp-dev` (configuración local), `test-a` y `test-b`
(aislamiento en tests), y el placeholder `logic-camp-__SLUG__` de la plantilla.

Fuentes de datos y tareas encontradas:

| Pieza                            | Antes                                                             | Después local                                               | Tablas                                                                                               |
| -------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Cron genérico                    | `*/15 * * * *`; ejecutaba las cinco tareas en cada tick           | `17 8 * * *`, solo operación acotada                        | `inventory_holds`, `notifications_log`                                                               |
| Retención RGPD                   | también cada 15 min; lectura total y N+1 por huésped              | `37 3 * * 1`, lote semanal de 25 y consultas agrupadas      | reales de `guests`, `bookings`, `audit_log`, `enquiries`                                             |
| Reset demo                       | `0 3 * * *`; borrado de 21 tablas + seed completo                 | eliminado del Worker; refresco diferencial semanal          | solo fixtures en `bookings`, `payments`, `enquiries` y dependencias `notifications_log`, `audit_log` |
| Botón demo                       | wipe completo, incluida la sesión                                 | comparte el candado semanal y el mismo refresco diferencial | mismas tablas del refresco; no toca sesiones                                                         |
| Polling del dashboard            | 7 consultas cada 60 s (Llegadas hace dos)                         | cada 5 min y pausado por React Query fuera de foco          | endpoints de planning, reservas, llegadas, solicitudes, pagos y notificaciones                       |
| `pnpm db:reset` + `pnpm db:seed` | wipe/seed                                                         | se conserva solo para D1 local                              | todas las tablas locales                                                                             |
| `pnpm db:seed:remote`            | 21 `DELETE` + seed, doble candado `--apply` y variable de entorno | se conserva como operación destructiva manual; nunca cron   | todas salvo `d1_migrations`                                                                          |
| Seeds de tests/onboarding        | programáticos, solo local/temporal                                | sin cambio                                                  | D1 locales                                                                                           |

El catálogo (`tenants`, temporadas, tipos, unidades, tarifas, extras, bloqueos de
catálogo y contenido frontend) queda estático. No existe ni se añade una
sincronización automática. Los resets de escenarios de portfolio bajo
`apps/dashboard/src/demo` usan estado del navegador y no consumen D1.

## Endpoints que pueden escribir D1

`ROUTE_CONTRACTS` es el inventario ejecutable. Esta tabla añade las tablas
afectadas; las notificaciones y la auditoría pueden escribirse como efecto
secundario de la operación principal.

| Endpoint o grupo                                     | Tablas D1 que puede escribir                                                                                                                |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/auth/*`                                   | `users`, `sessions`, `accounts`, `verifications` (Better Auth)                                                                              |
| `POST/DELETE /api/holds[/:id]`                       | `inventory_holds`                                                                                                                           |
| `POST /api/enquiries`                                | `enquiries`, `notifications_log`                                                                                                            |
| `POST /api/bookings` y `POST /api/admin/bookings`    | `bookings`, `guests`, `booking_guests`, `inventory_holds`; según pago/conversión, `payments`, `enquiries`, `notifications_log`, `audit_log` |
| pago/cancelación/modificación pública de una reserva | `bookings`, `payments`, `notifications_log`                                                                                                 |
| `POST /api/payments/webhook/:provider`               | `payments`, `bookings`, `notifications_log`                                                                                                 |
| `PATCH /api/admin/units/:id`                         | `units`, `audit_log`                                                                                                                        |
| `PATCH /api/admin/bookings/:id`                      | `bookings`, `payments`, `audit_log`, `notifications_log` según acción                                                                       |
| alta/baja/edición de huéspedes                       | `guests`, `booking_guests`, `bookings`, `audit_log`                                                                                         |
| alta/baja de bloqueos                                | `inventory_blocks`, `audit_log`                                                                                                             |
| `PATCH /api/admin/enquiries/:id`                     | `enquiries`, `audit_log`                                                                                                                    |
| `PUT /api/admin/rates/:id`                           | `rate_plans`, `audit_log`                                                                                                                   |
| `PATCH /api/admin/settings`                          | `tenants`, `audit_log`                                                                                                                      |
| `POST /api/admin/users`                              | `users`, `accounts`, `audit_log`                                                                                                            |
| `POST /api/admin/hospedajes/enviar`                  | ninguna actualmente: falla cerrado en modo manual                                                                                           |
| `POST /api/leads`                                    | ninguna: solo transporte de email                                                                                                           |
| `POST /api/demo/reset`                               | refresco semanal de fixtures descrito arriba                                                                                                |

## Medición anterior

Insights de `logic-camp-demo`, ventana de siete días. La suma es un **mínimo**:
Insights devuelve las consultas principales, no una contabilidad exhaustiva.

| Consulta observada                   | Ejecuciones/7 d | Filas leídas medias | Filas leídas/7 d | Causa                                                        |
| ------------------------------------ | --------------: | ------------------: | ---------------: | ------------------------------------------------------------ |
| enlaces de un huésped por `guest_id` |          39.391 |               3.491 |      137.513.981 | índice ausente + sweep RGPD N+1                              |
| lista de reservas con titular        |           1.109 |              20.944 |       23.226.896 | joins y ordenación antes de `LIMIT`, amplificado por polling |
| deduplicación reserva+plantilla      |          15.953 |                 328 |        5.235.019 | índice compuesto ausente                                     |
| pending colgadas                     |               — |                 483 |          227.493 | ejecución demasiado frecuente                                |
| lista de huéspedes                   |              81 |               2.612 |          211.572 | orden sin índice                                             |
| recordatorios de llegada             |             114 |               1.445 |          164.760 | índice de fecha/estado ausente                               |

Solo estas filas suman 166.579.721 lecturas/7 d, al menos **23.797.103/día,
476 %** del límite gratuito. Un sweep completo del código anterior podía hacer
2.568 búsquedas de enlaces; al coste remoto medio eran ~8,96 M lecturas por
ejecución. La divergencia con la proyección por 96 ticks/día confirma que no se
debe deducir el calendario remoto solo de las declaraciones del repositorio.

El seed actual contiene 12.717 filas lógicas. El reset completo declarado
borraba y reinsertaba como mínimo 25.434 filas/día (**25,4 %** del límite de
escritura), antes de contar el mantenimiento de índices. Insights no mostró ese
wipe entre las escrituras principales de la ventana; por eso se documenta como
coste del código/configuración declarados, no como prueba de que el trigger
remoto se ejecutase correctamente cada noche.

## Solución y presupuesto posterior

La migración `0010_d1_budget.sql` añade una marca explícita `demo_fixture` con
default `false`. Solo retroclasifica los IDs numéricos cortos deterministas del seed
(3–4 cifras); los IDs reales de la aplicación tienen 12 caracteres tras el prefijo.
Una reserva, huésped o solicitud creada por la aplicación conserva `false`; no
se deduce su naturaleza por canal, tenant, fecha o contenido.

Índices añadidos: `booking_guests(guest_id)`, titular por
`(booking_id,is_lead)`, notificaciones por `(booking_id,template)` y
`(status,created_at)`, fechas/creación/colas de `bookings`, fixtures y orden de
huéspedes. Además, disponibilidad/cotización carga únicamente reservas y
bloqueos solapados con las fechas solicitadas, y la lista normal de reservas
puede usar `created_at` antes del `LIMIT`.

| Presupuesto                  | Antes estimado/observado por día |                                                                         Después, máximo de diseño |            % límite gratuito después |
| ---------------------------- | -------------------------------: | ------------------------------------------------------------------------------------------------: | -----------------------------------: |
| Lecturas D1                  |           ≥23.797.103 observadas | cron diario 10.000; semanal genérico 20.000; refresco demo 10.000. Promedio cron+demo <15.000/día | <0,3 % por jobs; tráfico HTTP aparte |
| Escrituras D1                |        reset ≥25.434 + operación |                diario 100; semanal genérico 250; refresco demo 800. Promedio planificado <250/día | <0,25 % medio; 1,1 % el lunes máximo |
| Disparos cron                |   679/semana declarados (97/día) |                                                                                          8/semana |                     reducción 98,8 % |
| Polling por pestaña/pantalla |                            1/min |                                                                                           1/5 min |                       reducción 80 % |

Con el mismo tráfico observado, eliminar el N+1, indexar los dos siguientes
scans dominantes y reducir el polling proyecta las lecturas totales muy por
debajo de 100.000/día (<2 %). Es una estimación que debe comprobarse con
Insights 48–72 h después de publicar; el límite de tests cubre jobs, no tráfico
humano o bots.

## Fusibles e invariantes

- El cron diario admite como máximo 70 consultas, 10.000 filas leídas y 100
  escritas; el semanal genérico, 140/20.000/250.
- El refresco demo admite 812/10.000/800; junto con RGPD, el lunes queda bajo
  1.000 consultas, 30.000 lecturas y 1.100 escrituras.
- Holds: 50 borrados/día. Avisos: 25 reservas por lote. RGPD: 500 candidatas
  leídas y 25 anonimizaciones por semana.
- El refresco tiene un marcador semanal idempotente. Botón, cron y reintentos
  comparten clave. Si cambian IDs/cantidad del universo (incluido el salto de
  año), aborta antes de actualizar y requiere revisión manual.
- El refresco no puede tocar huéspedes, vínculos, usuarios, sesiones, catálogo,
  tarifas, unidades, tenant ni bloqueos. Los tests insertan una reserva, huésped
  y solicitud reales señuelo y comprueban que sobreviven.
- Los tests fallan al exceder consultas/lecturas/escrituras declaradas o añadir
  una tabla protegida al plan; además envuelven una D1 local real y verifican
  `meta.rows_read`/`meta.rows_written` de ambos crons.

## Publicación segura

No se ha desplegado ni ejecutado SQL remoto. Publicar requiere autorización
explícita y este orden:

1. backup/export de `logic-camp-demo`;
2. aplicar `0010_d1_budget.sql` y verificar conteos de `demo_fixture`;
3. desplegar Worker y assets; ese deploy sustituirá los Cron Triggers remotos;
4. no ejecutar `db:seed:remote`;
5. revisar Insights a las 24 h y 72 h, y comparar con esta línea base.

Quedarán preservadas todas las reservas y contactos con `demo_fixture=0`, sus
huéspedes, pagos y auditoría; también catálogo, actividades/contenido, usuarios,
cuentas y sesiones. Solo las filas sintéticas marcadas expresamente podrán
actualizarse semanalmente, y únicamente dentro de sus tablas dependientes.
