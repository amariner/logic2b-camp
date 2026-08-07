# LOGIC CAMP — Guía de funcionalidades

> Documento de cara al cliente. Describe todo lo que Logic Camp hace hoy, cómo lo hace y qué está en camino. La demo en vivo está en **camp.logic2b.com** (Camping Cala Sereno, un camping ficticio con datos realistas).
>
> Última actualización: julio 2026.

> Nota comercial: los nombres Camp Web/Solicitudes/Reservas/Motor de este
> inventario describen los **tiers técnicos actuales**. La oferta pública
> aprobada en el ADR 0033 es Inicio/Gestión/Automatiza/Inteligente. Inicio,
> Gestión y la primera interacción supervisada de Automatiza ya tienen una demo
> propia; los carriles técnicos se conservan para no renombrar el motor a ciegas.

---

## 1. Qué es Logic Camp

Logic Camp es la plataforma de Logic2B para campings — y **solo** para campings: web pública, motor de reservas y programa de gestión, construidos alrededor de cómo funciona de verdad un camping mediterráneo (parcelas y alojamientos, temporadas que se solapan, tasa turística, larga estancia, el planning de recepción).

No es una plantilla ni un producto de hoteles adaptado. El vocabulario del sistema es el del sector: parcela ≠ bungalow, se reserva un **tipo** y el camping asigna la **unidad**, fuera de temporada se está **cerrado** (no "sin disponibilidad"), la fianza no es un ingreso y la tasa turística va aparte con sus exenciones por edad.

### Cuatro niveles, un solo producto

Cada camping contrata el nivel que necesita. Subir de nivel no es un proyecto nuevo: es activar módulos sobre lo que ya tiene, sin migraciones ni cambios de web.

|                                             | **Camp Web** | **Camp Solicitudes** | **Camp Reservas** | **Camp Motor**  |
| ------------------------------------------- | ------------ | -------------------- | ----------------- | --------------- |
| Web propia completa                         | ✅           | ✅                   | ✅                | — (usa la suya) |
| Formulario de solicitud → email             | ✅           | ✅                   | ✅                | —               |
| Historial de solicitudes guardado           | ✅           | ✅                   | ✅                | ✅              |
| Bandeja de solicitudes + panel básico       | —            | ✅                   | ✅                | ✅              |
| Disponibilidad y precios en tiempo real     | —            | —                    | ✅                | ✅              |
| Reserva online con confirmación instantánea | —            | —                    | ✅                | ✅              |
| Programa de gestión completo (planning)     | —            | —                    | ✅                | ✅              |
| Cobro online (opcional)                     | —            | —                    | ✅                | ✅              |

Detalle importante del nivel Camp Web: aunque no hay panel, **cada solicitud que entra por la web queda guardada** desde el primer día. Cuando el camping sube de nivel, su historial de peticiones ya está ahí.

---

## 2. La web pública

### 2.1 Páginas

Web completa generada para cada camping con su contenido, sus fotos y su marca:

- **Portada** con foto grande y, en el nivel Reservas, el **mostrador de disponibilidad** funcionando como protagonista (fechas + huéspedes → resultados con precio real).
- **Alojamientos**: listado por familias (parcelas, bungalows, glamping…) y **ficha de cada tipo** con galería, características (m², camas, capacidad, electricidad, mascotas…) y precios por temporada.
- **Instalaciones**, **El entorno** (con distancias a playa, pueblo, sanidad…), **Tarifas** (tabla completa tipos × temporadas, suplementos, extras y condiciones), **Contacto** (datos, horario, cómo llegar y formulario) y **Cuaderno** (blog).
- Página de error propia con foto y vuelta al inicio.

Las tarifas y fichas de la web salen **de los mismos datos que usa el motor de reservas**: es imposible que la web anuncie un precio y el motor cobre otro.

### 2.2 Seis idiomas

Todo el sitio existe en **español, catalán, inglés, francés, alemán y neerlandés** — los idiomas del cliente real de un camping mediterráneo. Selector accesible en la cabecera, URLs propias por idioma y etiquetado correcto para que Google sirva a cada visitante su versión. El contenido del blog puede traducirse por artículo; si falta una traducción, se muestra la versión principal.

### 2.3 Rendimiento y posicionamiento

- **Lighthouse ≥ 95 en todo lo auditado** (portada 100 en escritorio, 96 en móvil): fuentes optimizadas, imágenes servidas en formatos modernos (AVIF/WebP) con tamaños por dispositivo, sin peso muerto.
- La regla interna es estricta: la web de un camping de nivel Camp Web **no carga ni un byte** del motor de reservas.
- SEO técnico completo: mapa del sitio por idiomas, datos estructurados (el camping y cada alojamiento con su oferta, legibles por Google), Open Graph para compartir en redes, favicon e iconos con la marca.
- Accesibilidad como suelo, no como extra: navegable por teclado con foco visible, contraste AA, respeto de "reducir movimiento", usable a 1366px y en móvil de 375px. La probamos pensando en la recepcionista de 55 años, no en el desarrollador de 25.

### 2.4 La marca del camping, un fichero

Cada camping tiene su paleta, su radio de esquinas y su contenido. Re-vestir el sitio entero es cambiar **un solo fichero de diseño** — sin tocar ninguna página.

La demo lo enseña en vivo: el menú **"Estilo"** de la cabecera cambia toda la web entre cuatro ambientes (_Pinada_, _Mar_, _Garriga_ y _Noche_ — este último, modo oscuro completo) delante del cliente. La elección se recuerda mientras navega. Así se ve en 10 segundos cómo quedaría la plataforma con la identidad de cada camping.

En el pie de cada web aparece una firma discreta **"powered by Logic2B"** (en los seis idiomas) que enlaza con la información del producto. La web es del camping —su color, sus fotos, su nombre—; la firma solo deja constancia de quién la mueve, sin robar protagonismo.

Junto al de "Estilo", el menú **"Nivel"** enseña la misma web como se vería en Camp Web (sin motor de reservas) o en Camp Reservas (con él) sin salir de la página — útil para que un camping pequeño se reconozca sin imaginar nada. Como el de estilos, es atrezzo de la demo: un camping real tiene el nivel que ha contratado, no un interruptor.

### 2.5 Una demo que siempre está lista

La demo comercial se reinicia cada noche (datos ficticios, sin rastro de lo que un comercial o un visitante haya tocado durante el día) y siempre con el año en curso — nunca se encuentra con fechas del año pasado ni con una reserva que alguien canceló probando el sistema. Un banner discreto lo indica en todas las páginas.

---

## 3. El mostrador: disponibilidad y precio en tiempo real

_(Nivel Camp Reservas)_

El buscador de la portada es el elemento central de la web:

- **Fechas + adultos + niños → resultados reales**: qué tipos quedan libres esas noches y **precio total exacto** calculado por el servidor (nunca por el navegador: el precio que se ve es el precio que se cobra).
- Si las fechas caen **fuera de temporada**, no dice "no hay disponibilidad" (que suena a lleno): dice **"cerrado — abrimos el 15 de marzo"**, con la fecha real de apertura del calendario del camping.
- Cada búsqueda tiene **URL propia** (`?from=…&to=…&adults=…`): se puede enviar por WhatsApp y el que la abre ve la misma búsqueda.
- Con indicador de carga, sin parpadeos, y usable por teclado.

---

## 4. La reserva online, de principio a fin

_(Nivel Camp Reservas)_

### 4.1 El proceso de compra

1. **Resultados** → botón "Reservar" en el tipo elegido.
2. **Detalle y extras**: el cliente añade extras (ropa de cama, limpieza final, nevera…) y ve el **desglose actualizarse en vivo** — cada línea con su concepto, sin totales opacos. Los extras obligatorios se incluyen solos.
3. **Datos del titular**: al entrar en este paso, el sistema **aparta la plaza durante 15 minutos** (con contador visible). Nadie puede quitarle el hueco mientras rellena sus datos. Si abandona, la plaza se libera al instante.
4. **Confirmación**: página-resguardo imprimible con código de reserva, desglose completo y condiciones.

Reglas del camping aplicadas en cada paso: estancia mínima por temporada (p. ej. 7 noches en agosto), día de entrada fijo (p. ej. solo sábados), capacidad por tipo. Los errores se explican en el idioma del cliente ("la estancia mínima en estas fechas es de 7 noches"), no con códigos.

### 4.2 Autogestión del cliente: sin llamadas a recepción

Con su **código de reserva + email**, el cliente puede desde la web, sin registrarse:

- **Consultar** su reserva completa.
- **Cancelarla** viendo ANTES el reembolso exacto que le corresponde según la política de cancelación por tramos del camping.
- **Cambiar las fechas**: el sistema re-cotiza la estancia nueva completa (temporadas, extras, tasa) y muestra el nuevo total antes de confirmar el cambio. Si no cabe, lo dice claramente y la reserva original queda intacta.

### 4.3 Fiabilidad

- **Doble reserva imposible**: la comprobación definitiva de solape ocurre en la base de datos en el mismo acto de crear la reserva. Es una invariante del sistema con test automático propio.
- Si el cliente pulsa dos veces "Confirmar" (o la red falla a medias), la protección de idempotencia garantiza **una sola reserva**.
- Todo el proceso está cubierto por **tests automáticos de extremo a extremo** (el camino feliz y los infelices: plaza agotada entre pasos, apartado caducado, estancia inválida) que se ejecutan contra el sistema real antes de cada entrega.

### 4.4 Cobro al reservar

Cada camping elige, sin tocar código, cómo quiere cobrar:

- **Sin cobro online**: el producto funciona entero — la reserva confirma al instante y se cobra en recepción, como hoy. Es el punto de partida de todo camping nuevo.
- **Señal (%) o pago completo**: el cliente paga en el momento de reservar, con **Stripe** o con **Redsys** (la pasarela de los bancos españoles, obligatoria para muchos negocios en España). La reserva queda "pendiente" solo esos segundos, hasta que el banco confirma; el cliente vuelve automáticamente a su resguardo.
- **Nunca se cobra dos veces**: un reintento del banco (o que el cliente refresque la página) no duplica el cargo — está protegido igual que la creación de la reserva.
- **La fianza sigue aparte**: el depósito reembolsable no se mezcla nunca con el precio de la estancia (§5) — hoy se cobra en recepción; cobrarla también online es la siguiente vuelta de tuerca, ya diseñada.
- **Reembolsos reales**: cancelar (desde la web o desde el panel) devuelve el dinero de verdad a través de la misma pasarela con la que se cobró, no solo un email con la promesa.

_Nota: activar una pasarela real es solo configuración — la cuenta de Stripe o el contrato con el banco (Redsys), sin tocar una línea de código. Hasta entonces, el camping opera con "sin cobro online" sin ningún cambio visible._

---

## 5. Precios: siempre explicables

El sistema de tarifas modela lo que un camping hace de verdad:

- **Temporadas que se solapan** resueltas por prioridad (la semana de Pascua "pincha" sobre la temporada media). Una estancia que cruza temporadas se calcula **tramo a tramo**.
- **Plan tarifario por tipo y temporada**: base con N personas incluidas + persona extra + niño + electricidad + mascota + vehículo adicional.
- **Extras** por estancia, por noche o por persona; opcionales u obligatorios.
- **Descuentos como reglas**: larga estancia, reserva anticipada, carnet ACSI… combinables o excluyentes (se aplica la mejor), y siempre visibles como línea negativa en el desglose.
- **Tasa turística** por persona y noche con exenciones por edad según la normativa autonómica, calculada y mostrada **aparte** del precio (que es como se liquida).
- **Fianza** separada del total: es un depósito, no un ingreso.

Y la regla de oro: **ningún precio se guarda como un número suelto**. Toda reserva conserva su desglose línea a línea. Años después se puede explicar cada céntimo — a un cliente, a un auditor o a Hacienda. Además, **cambiar una tarifa jamás altera una reserva ya confirmada** (invariante con test propio).

---

## 6. El programa de gestión (dashboard)

_(Nivel Camp Reservas completo; versión básica en Camp Solicitudes)_

En `su-dominio.com/admin`, con usuario y contraseña. Diseñado con una premisa: **densidad sin ruido, rápido antes que bonito** — es la herramienta que recepción tiene abierta todo el día.

### 6.1 El planning (tape chart) ★

La pantalla firma del producto. La rejilla unidades × días que en muchos campings sigue siendo un corcho o un Excel:

- **Todas las unidades a la vista** (la demo mueve 83; el sistema está dimensionado para 300) con scroll fluido, agrupadas por tipo, con la columna de códigos y la fila de fechas siempre visibles.
- **Colores por estado**: confirmada, **en casa** (huésped dentro), pendiente, no presentada, completada. **Bloqueos** visibles con su motivo (mantenimiento, larga estancia…). Fines de semana sombreados.
- **Orientación de un vistazo**: línea vertical de **HOY**, franja de **temporada** en la cabecera (alta/media/baja con su nombre), y una marca cuando una estancia **continúa** más allá del borde visible.
- **Filtros y búsqueda sin salir del planning**: por tipo de alojamiento, por estado, o tecleando un código de reserva o de unidad — lo que no casa se atenúa, no desaparece (la ocupación real nunca se esconde).
- **Zoom** semana / mes / temporada, navegación por fechas y salto a hoy.
- **Bandeja "sin asignar"**: las reservas sin unidad física asignada nunca se pierden de vista — y se **arrastran directamente a una fila** para asignarlas.
- **Modo oscuro** (claro / oscuro / según el sistema): un mostrador a las 23:00 lo agradece. Los colores de estado están verificados de contraste en ambos temas.
- Se actualiza sola cada minuto.

### 6.2 Mover, estirar y crear arrastrando

El corcho de recepción, pero vivo. Sobre la barra de una reserva:

- **Arrastrar en vertical** la cambia de parcela (mismo tipo). Su reserva y su precio no se tocan: el cliente reservó un _tipo_, no una parcela concreta.
- **Arrastrar en horizontal** mueve la estancia de fechas (mismas noches); **estirar por los bordes** la alarga o acorta. Mientras se arrastra, las fechas y el número de noches acompañan al cursor.
- **El precio lo recalcula siempre el servidor.** Si el cambio de fechas cambia el importe, aparece el **desglose nuevo antes de confirmar** — nada se escribe hasta que recepción dice que sí. Si el hueco de destino está ocupado o bloqueado, el movimiento "rebota" con su explicación.
- **Deshacer** en un clic desde el aviso, en cualquier movimiento.
- **Arrastrar sobre celdas libres crea una reserva** con esa unidad y esas fechas ya rellenas — el alta donde ocurre la venta, no en otra pantalla.
- Todo funciona también **por teclado** (flechas para mover y reasignar, Mayús+flechas para estirar), porque no todo el mundo maneja bien el ratón.

### 6.2b El plano del camping ★

Si el planning responde _"¿cuándo?"_, el plano responde _"¿dónde?"_. Una **vista cenital del camping de verdad** — el director **reconoce su propio recinto** en la pantalla: el mar al norte, las parcelas premium pegadas a la playa, la piscina y la recepción donde están, la pinada al fondo.

- **Estado en vivo por fecha**: se elige un día y cada parcela/alojamiento se pinta con **los mismos colores que el planning** — libre, ocupada, falta cobrar, **entra hoy**, **sale hoy** (con una marca en la esquina), bloqueada. De un vistazo se ve cómo está el camping esa noche.
- **Un clic en una unidad ocupada abre su ficha** — la misma que en el planning, sin duplicar nada.
- **Salto plano ↔ planning** conservando la unidad y la fecha: se pasa de "¿dónde está la B-12?" a "¿qué días tiene libres?" y vuelta, sin perder el hilo. Ese ida y vuelta es la demo.
- **Zoom y desplazamiento** con rueda, arrastre o teclado — pensado para 300 unidades, no solo para 83.
- **Se dibuja solo**: el plano de cada camping se declara en un fichero (bloques de parcelas + servicios), no se dibuja rectángulo a rectángulo. Dar de alta el plano de un camping nuevo es cosa de una tarde. Y un camping sin plano definido no ve una pantalla rota: se le genera uno por zonas automáticamente.

### 6.3 La ficha de reserva

Un clic en cualquier reserva abre su ficha junto al planning, sin perderlo de
vista. En móvil ocupa la pantalla completa para que la cuenta se pueda operar
sin contenido cortado, mantiene la cabecera al alcance y al cerrar devuelve el
foco a la reserva de origen:

- Estancia, ocupación (con edades de los niños), unidad, canal de entrada y fecha de creación.
- **Titular y acompañantes** con documento y contacto.
- **Desglose económico completo**: cada línea del precio, tasa turística, fianza, pagado y **pendiente de cobro** destacado.
- **Historial de pagos** con signo (los reembolsos, en negativo). La contabilidad interna cuadra por construcción: la suma de pagos ES lo pagado, con test automático que lo garantiza.
- **Registrar un cobro** hecho en persona (efectivo o tarjeta física) y **reembolsar** sin salir de la ficha — si el cobro original fue con pasarela, el reembolso se ejecuta de verdad contra ella; nunca deja lo pagado en negativo.
- **Notas internas** de recepción, editables.
- **Acciones según el estado**: confirmar, cancelar (con doble confirmación), marcar no presentada, completar. Solo se ofrecen las que tienen sentido en cada momento, y el servidor las re-valida todas. Cancelar ejecuta el reembolso real según la política del camping, no solo el aviso por email.

### 6.4 La lista de reservas y el alta manual

Todas las reservas en una tabla operativa: **búsqueda por código**, filtro por estado, paginación, y de un vistazo titular, fechas, unidad, canal, total y **pendiente de cobro**. Un clic abre la ficha.

Recepción crea reservas por **teléfono o mostrador** desde el mismo panel: el formulario cotiza **en vivo contra el servidor** mientras se rellena (mismo motor y mismas reglas que la web — si la estancia mínima de agosto son 7 noches, lo dice ahí mismo), con extras, electricidad y edades de los niños para la tasa. Al crear, la reserva queda protegida contra dobles clics y el canal registrado (web / teléfono / mostrador) para saber de dónde viene cada una.

### 6.5 Usuarios y permisos

Cuatro perfiles jerárquicos:

| Perfil        | Puede                                              |
| ------------- | -------------------------------------------------- |
| **Consulta**  | Ver todo, tocar nada                               |
| **Recepción** | Operar: reservas, asignaciones, solicitudes, notas |
| **Gerencia**  | Además: tarifas, temporadas y ajustes del camping  |
| **Dirección** | Además: gestionar usuarios                         |

Las sesiones son revocables al instante (un empleado que se va deja de entrar
HOY). No hay registro público: los usuarios los da de alta la dirección. La
navegación tampoco ofrece módulos que el perfil no puede abrir —por ejemplo,
Parte de viajeros empieza en Gerencia— aunque la autorización real se vuelve a
comprobar siempre en el servidor.

### 6.6 Todo queda registrado

Cada acción de gestión (confirmar, cancelar, reasignar, cambiar una tarifa, tocar los ajustes…) escribe **quién, qué y cuándo** en un registro de auditoría inalterable. Cuando dentro de seis meses alguien pregunte "¿quién movió esta reserva?", habrá respuesta.

### 6.7 Las llegadas y salidas del día

La hoja de trabajo de recepción cada mañana, en una pantalla:

- **Quién llega y quién sale** el día elegido (hoy por defecto; se navega con flechas o calendario), con titular, unidad asignada, personas y noches.
- **Qué queda por cobrar**: cada llegada muestra su pendiente de pago destacado — la información clave en el momento del check-in — o "Pagada" si está al corriente.
- Un clic en cualquier fila abre la **ficha completa** de la reserva con sus acciones, sin cambiar de pantalla.

### 6.8 La bandeja de solicitudes

Las peticiones de la web, trabajables por estados:

- Filtros con recuento: **nueva → contactada → presupuestada → convertida / perdida**. De un vistazo se ve cuántas piden atención.
- Cada solicitud se expande para leer el **mensaje completo** y contactar con un clic (email y teléfono son enlaces directos), con su idioma y origen.
- Los botones ofrecen solo el **siguiente paso natural** del flujo (una nueva se marca contactada o perdida; una presupuestada, convertida o perdida; una perdida puede reabrirse). Cada cambio queda auditado.

### 6.9 Inventario

Las unidades físicas del camping, agrupadas por tipo. Gerencia puede **dar de baja de servicio** una parcela o alojamiento (avería, obra) con un clic: deja de contar para la disponibilidad y no admite asignaciones nuevas, **sin tocar las reservas que ya tiene**. Volver a ponerla en servicio es otro clic. Todo auditado.

### 6.10 Tarifas

Los planes de precio por temporada y tipo, editables en línea desde el panel (base por noche, persona extra, niño, mascota, electricidad, vehículo, estancia mínima) — en euros, guardado por fila, solo gerencia. Y la garantía del sistema bien visible: **cambiar una tarifa nunca modifica una reserva ya confirmada**.

### 6.11 Clientes

La memoria comercial del camping: buscador por nombre o email sobre todos los huéspedes, con su documento, número de estancias y **última estancia** a la vista. La ficha de cada cliente muestra su contacto (email y teléfono clicables), el consentimiento RGPD con fecha y el **historial completo de reservas** — y desde cualquier reserva del historial se salta a su ficha operativa con un clic.

### 6.12 Informes

Los números del periodo con un clic (este mes, el próximo, los próximos 3 meses): **ocupación global**, **ingresos y cobrado** (atribuidos por llegada), llegadas y salidas — y la **ocupación por tipo** con su medidor, unidades y noches ocupadas sobre capacidad. Se amplía con series temporales en próximas fases.

### 6.13 Ajustes

Los datos operativos del camping editables por gerencia (nombre, zona horaria, moneda), con el nivel de producto y los idiomas contratados a la vista. Todo cambio queda auditado.

### 6.14 Log de notificaciones

Cada email que el sistema ha intentado enviar (o ha decidido no enviar), en una lista filtrable por estado — enviada, en cola, fallida, desactivada —, con el evento, a quién iba dirigido (la reserva o la solicitud de origen) y cuándo. La respuesta directa a "¿le llegó el email de confirmación?" sin tener que preguntarle a nadie.

### 6.15 Log de pagos

Todos los cobros y reembolsos del camping en una sola lista, filtrable por proveedor (pasarela o manual) y por estado, con la reserva de origen, el importe (los reembolsos en negativo) y la fecha — sin tener que abrir ficha por ficha para saber qué ha cobrado la pasarela hoy.

### 6.16 Recepción: check-in, check-out y huéspedes

El acto central del mostrador. Cuando un huésped llega, recepción hace **check-in** desde la lista de llegadas del día, desde el plano o desde la ficha, y esa unidad pasa a pintarse **"en casa"** (verde) en el planning y en el plano — de un vistazo se distingue quién está dentro de quién solo tiene reserva. El **check-out** cierra la cuenta: avisa de lo que quede pendiente, deja cobrar en el mismo gesto y completa la reserva. Un clic erróneo se deshace.

En la ficha, los **huéspedes** de la reserva se editan (no solo se ven): añadir un acompañante, corregir su documento, nacimiento y nacionalidad, o quitarlo. Es la base del **parte de viajeros**, obligatorio en un camping español.

Además: **"cobrar todo lo pendiente"** en un botón (sin teclear la cifra), **crear un bloqueo** de una unidad o de un tipo (avería, propietario) desde el planning o el plano, y **⌘K** para buscar una reserva por código, un cliente por nombre o una unidad y saltar. Una reserva o un cliente tienen su propia dirección (`/reservas/…`, `/clientes/…`): se pueden enviar por enlace a un compañero.

---

## 7. Solicitudes: nada se pierde

El formulario de la web guarda cada petición con sus fechas, ocupación y mensaje — **en todos los niveles**, incluso cuando solo se reenvía por email. Es el historial comercial del camping.

En el panel, la bandeja de solicitudes (§6.8) las gestiona por estados: **nueva → contactada → presupuestada → convertida / perdida**. Una solicitud es una petición, no una reserva a medias: no bloquea inventario ni tiene precio cerrado hasta que recepción la convierte explícitamente.

---

## 8. Notificaciones por email

El sistema avisa solo, en el idioma de cada cual:

- **Al camping**: aviso de cada solicitud nueva en su buzón interno, y aviso — sin que nadie tenga que acordarse de mirar — de una reserva online que lleva más de dos horas esperando el pago sin cobrarse ni cancelarse. Ese aviso nunca cancela nada por su cuenta: solo lo hace visible; cancelarla, si hace falta, lo decide siempre una persona.
- **Al cliente**: acuse de recibo de su solicitud, **confirmación de reserva** con el código, el desglose completo y un botón para gestionarla, confirmación de **cancelación** con el reembolso previsto, y un **recordatorio el día antes de su llegada** — cada uno en el idioma en que navegó (los 6 soportados).
- **Control total desde Ajustes**: cada notificación se activa o desactiva al momento, sin despliegue, con el remitente del dominio del camping y el buzón interno configurables.
- **Todo queda registrado y es consultable en el dashboard**: cada email (enviado, fallido o desactivado), con su destino y fecha, en una pantalla propia con filtro por estado — nunca la duda de "¿le llegó?".
- Robustez: el envío ocurre después de responder; un problema del proveedor de email jamás afecta a una reserva.

_Nota: el envío real por camping se activa al verificar su dominio de correo (proceso de alta con Logic2B)._

## 9. Seguridad y datos

- **Una base de datos por camping. Física, no lógica.** Los datos de un camping no comparten base con los de ningún otro: la fuga cruzada no es que esté prohibida — es que **no hay camino** por el que pueda ocurrir. Hay un test automático explícito que lo verifica en cada entrega.
- Infraestructura en el borde (Cloudflare): la web responde rápido desde el punto más cercano al visitante, en Alemania o en Argentina.
- Contraseñas con hash moderno, sesiones con cookie segura, protección de tasa de peticiones en la API pública.
- Los datos de huéspedes guardan el consentimiento RGPD con fecha. El endurecimiento completo (copias, retención, legales) es una fase propia del plan antes del primer cliente en producción.

---

## 10. Qué está en camino

Con fecha en el plan de trabajo, no humo:

| Módulo                    | Qué añade                                                                                                                                                             |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fianza cobrada online** | Hoy la señal/pago completo ya se cobran online (§4.4); retener la fianza con la misma pasarela (pre-autorización, sin mezclarla con el ingreso) es el siguiente paso  |
| **Gestión ampliada**      | Series temporales en informes, conversión directa de solicitud a reserva con datos precargados                                                                        |
| **Automatiza**            | Prototipo supervisado en Mar de Fondo: explica las fuentes de una respuesta propuesta y exige revisión humana; aprobar solo la deja preparada, no la publica ni envía |
| **Inteligente**           | Próximo prototipo: recomendación de ocupación con origen, incertidumbre y cambio preparado; no ejecutará cambios                                                      |
| **Alta exprés**           | Proceso interno para poner un camping nuevo en marcha en una tarde con su material real                                                                               |

---

## 11. Ficha técnica (para el informático de confianza)

|                  |                                                                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| Web pública      | Astro 5 — HTML estático + islas de interactividad; por eso vuela                                         |
| Panel de gestión | React 19 (aplicación de página única servida junto a la web)                                             |
| API              | Cloudflare Workers (cómputo en el borde), tipada de extremo a extremo                                    |
| Base de datos    | Cloudflare D1 (SQLite) — **una instancia por camping**                                                   |
| Pagos            | Stripe y Redsys (firma HMAC-SHA256 propia, sin SDK), sin cobro/señal/total configurables por camping     |
| Emails           | Resend, con dominio verificado del camping                                                               |
| Dinero           | Céntimos enteros; jamás decimales flotantes                                                              |
| Fechas           | ISO `YYYY-MM-DD`; el día de salida libera la plaza                                                       |
| Calidad          | Tests unitarios + integración sobre base de datos real + extremo a extremo en navegador, en cada entrega |
| Despliegue       | Automatizado a la demo; a producción de cada camping, siempre con aprobación manual                      |
