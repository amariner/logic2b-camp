# Demo comercial estática · verano de 2026

El catálogo comercial y `/admin/` se construyen con escenarios locales. El reloj
operativo del gestor es siempre **7 de agosto de 2026, 12:00 UTC**. Inicio,
planning, plano, llegadas, partes, informes, recibos y «Hoy» utilizan ese reloj.
Se puede navegar manualmente por el calendario; el paso de los días reales no
mueve reservas ni el día de referencia. «Temporada» abarca del 1 de junio al
1 de septiembre (extremo excluido: incluye el 31 de agosto).

Los ocho gestores tienen reservas, solicitudes, clientes, tarifas, pagos y
notificaciones de ejemplo. El histórico de junio y julio se deriva de las
reservas de agosto con identificadores propios y sin añadir solapes. Sol
d'Hivern conserva sus estancias largas de verano. Los registros, contactos y
estados de envío son ficticios. Ninguna notificación de estos paneles se envía.
Las acciones ya disponibles de demostración se guardan exclusivamente en el
navegador y «Restablecer demo» recupera el escenario original, sin refresco semanal.

## Presupuesto D1

| Operación | Filas leídas | Filas escritas |
| --- | ---: | ---: |
| Abrir cualquiera de los gestores | 0 | 0 |
| Filtrar, navegar y consultar fichas | 0 | 0 |
| Acciones locales y restablecer fixtures | 0 | 0 |
| Paso de un día o una semana | 0 | 0 |
| 10.000 visitas, con cualquier número de pantallas | 0 | 0 |

La garantía es estructural: `tenants/demo/wrangler.jsonc` no tiene binding D1 y
publica `crons: []`. Su Worker solo admite salud y captación comercial; las rutas
operativas antiguas responden 410. Incluso una llamada al antiguo cron es un
no-op. Los builds de gestores interceptan sus peticiones con adaptadores locales,
sin fallback HTTP, y desactivan el sondeo periódico. La web Cala Sereno también
usa el transporte local de reservas. Los campings reales mantienen su API,
base de datos, permisos y reloj actuales.

D1 contabiliza consultas y almacenamiento, según
[la documentación de Cloudflare](https://developers.cloudflare.com/d1/platform/pricing/).
La base histórica **no se elimina**: el espacio que ya ocupe sigue existiendo,
aunque esta demo deje de leerla o escribirla. No se afirma que toda la cuenta
Cloudflare tenga consumo cero. Los assets estáticos y las peticiones al Worker
son conceptos separados; la captación comercial sigue usando Resend si está
configurado, sin D1.

## Desarrollo y publicación

- `pnpm --filter @logic-camp/api bundle:demo`: compone landing, webs y gestores
  estáticos. `/admin/` abre el escenario avanzado de Mar de Fondo.
- `pnpm exec wrangler dev --config tenants/demo/wrangler.jsonc --port 8787`:
  sirve el bundle local sin base de datos.
- `pnpm --filter @logic-camp/dashboard dev:demo`: gestor con HMR en 5173.
- `pnpm --filter @logic-camp/site dev -- --port 4330`: landing; las demos se
  proxyfican al Worker local, nunca al despliegue remoto.
- `pnpm --filter @logic-camp/api deploy:demo`: publica el bundle y el Worker.
  Este comando ya no aplica migraciones ni siembra D1.

Los cambios de crons y bindings remotos solo surten efecto cuando se publica
la nueva configuración. Los antiguos scripts seed/refresh se conservan como
material de pruebas locales, pero no forman parte del Worker ni del despliegue.
