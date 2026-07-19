# LOGIC CAMP — Guía de funcionalidades

> Documento de cara al cliente. Describe todo lo que Logic Camp hace hoy, cómo lo hace y qué está en camino. La demo en vivo está en **camp.logic2b.com** (Camping Cala Sereno, un camping ficticio con datos realistas).
>
> Última actualización: julio 2026.

---

## 1. Qué es Logic Camp

Logic Camp es la plataforma de Logic2B para campings — y **solo** para campings: web pública, motor de reservas y programa de gestión, construidos alrededor de cómo funciona de verdad un camping mediterráneo (parcelas y alojamientos, temporadas que se solapan, tasa turística, larga estancia, el planning de recepción).

No es una plantilla ni un producto de hoteles adaptado. El vocabulario del sistema es el del sector: parcela ≠ bungalow, se reserva un **tipo** y el camping asigna la **unidad**, fuera de temporada se está **cerrado** (no "sin disponibilidad"), la fianza no es un ingreso y la tasa turística va aparte con sus exenciones por edad.

### Cuatro niveles, un solo producto

Cada camping contrata el nivel que necesita. Subir de nivel no es un proyecto nuevo: es activar módulos sobre lo que ya tiene, sin migraciones ni cambios de web.

| | **Camp Web** | **Camp Solicitudes** | **Camp Reservas** | **Camp Motor** |
|---|---|---|---|---|
| Web propia completa | ✅ | ✅ | ✅ | — (usa la suya) |
| Formulario de solicitud → email | ✅ | ✅ | ✅ | — |
| Historial de solicitudes guardado | ✅ | ✅ | ✅ | ✅ |
| Bandeja de solicitudes + panel básico | — | ✅ | ✅ | ✅ |
| Disponibilidad y precios en tiempo real | — | — | ✅ | ✅ |
| Reserva online con confirmación instantánea | — | — | ✅ | ✅ |
| Programa de gestión completo (planning) | — | — | ✅ | ✅ |
| Cobro online (opcional) | — | — | ✅ | ✅ |

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

La demo lo enseña en vivo: el menú **"Estilo"** de la cabecera cambia toda la web entre cuatro ambientes (*Pinada*, *Mar*, *Garriga* y *Noche* — este último, modo oscuro completo) delante del cliente. La elección se recuerda mientras navega. Así se ve en 10 segundos cómo quedaría la plataforma con la identidad de cada camping.

---

## 3. El mostrador: disponibilidad y precio en tiempo real

*(Nivel Camp Reservas)*

El buscador de la portada es el elemento central de la web:

- **Fechas + adultos + niños → resultados reales**: qué tipos quedan libres esas noches y **precio total exacto** calculado por el servidor (nunca por el navegador: el precio que se ve es el precio que se cobra).
- Si las fechas caen **fuera de temporada**, no dice "no hay disponibilidad" (que suena a lleno): dice **"cerrado — abrimos el 15 de marzo"**, con la fecha real de apertura del calendario del camping.
- Cada búsqueda tiene **URL propia** (`?from=…&to=…&adults=…`): se puede enviar por WhatsApp y el que la abre ve la misma búsqueda.
- Con indicador de carga, sin parpadeos, y usable por teclado.

---

## 4. La reserva online, de principio a fin

*(Nivel Camp Reservas)*

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

*(Nivel Camp Reservas completo; versión básica en Camp Solicitudes)*

En `su-dominio.com/admin`, con usuario y contraseña. Diseñado con una premisa: **densidad sin ruido, rápido antes que bonito** — es la herramienta que recepción tiene abierta todo el día.

### 6.1 El planning (tape chart) ★

La pantalla firma del producto. La rejilla unidades × días que en muchos campings sigue siendo un corcho o un Excel:

- **Todas las unidades a la vista** (la demo mueve 83; el sistema está dimensionado para 300) con scroll fluido, agrupadas por tipo, con la columna de códigos y la fila de fechas siempre visibles.
- **Colores por estado**: confirmada, pendiente, no presentada, completada. **Bloqueos** visibles con su motivo (mantenimiento, larga estancia…). Fines de semana sombreados.
- **Zoom** semana / mes / temporada, navegación por fechas y salto a hoy.
- **Bandeja "sin asignar"**: las reservas sin unidad física asignada nunca se pierden de vista.
- Se actualiza sola cada minuto.

### 6.2 Reasignar arrastrando

Cambiar una reserva de parcela es **arrastrar su barra** a otra fila del mismo tipo. La interfaz responde al instante y el servidor valida siempre: si hay solape o bloqueo, el movimiento "rebota" con su explicación. También funciona **por teclado** (flechas ↑/↓), porque no todo el mundo maneja bien el ratón.

Detalle de dominio importante: el cliente reservó un **tipo**, no una parcela concreta. Reasignar no toca su reserva, ni su precio, ni requiere avisarle.

### 6.3 La ficha de reserva

Un clic en cualquier reserva abre su ficha junto al planning, sin perderlo de vista:

- Estancia, ocupación (con edades de los niños), unidad, canal de entrada y fecha de creación.
- **Titular y acompañantes** con documento y contacto.
- **Desglose económico completo**: cada línea del precio, tasa turística, fianza, pagado y **pendiente de cobro** destacado.
- **Historial de pagos** con signo (los reembolsos, en negativo). La contabilidad interna cuadra por construcción: la suma de pagos ES lo pagado, con test automático que lo garantiza.
- **Notas internas** de recepción, editables.
- **Acciones según el estado**: confirmar, cancelar (con doble confirmación), marcar no presentada, completar. Solo se ofrecen las que tienen sentido en cada momento, y el servidor las re-valida todas.

### 6.4 Alta manual y otros canales

Recepción puede crear reservas por **teléfono o mostrador** desde el panel: mismo motor, mismas validaciones y mismo cálculo de precio que la web. El canal queda registrado (web / teléfono / mostrador / importada) para saber de dónde viene cada reserva.

### 6.5 Usuarios y permisos

Cuatro perfiles jerárquicos:

| Perfil | Puede |
|---|---|
| **Consulta** | Ver todo, tocar nada |
| **Recepción** | Operar: reservas, asignaciones, solicitudes, notas |
| **Gerencia** | Además: tarifas, temporadas y ajustes del camping |
| **Dirección** | Además: gestionar usuarios |

Las sesiones son revocables al instante (un empleado que se va deja de entrar HOY). No hay registro público: los usuarios los da de alta la dirección.

### 6.6 Todo queda registrado

Cada acción de gestión (confirmar, cancelar, reasignar, cambiar una tarifa, tocar los ajustes…) escribe **quién, qué y cuándo** en un registro de auditoría inalterable. Cuando dentro de seis meses alguien pregunte "¿quién movió esta reserva?", habrá respuesta.

### 6.7 Informes

Primer bloque disponible: **ocupación por tipo** (noches ocupadas sobre capacidad), **ingresos** del periodo (total y cobrado) y **llegadas/salidas**. Se amplía en las próximas fases.

---

## 7. Solicitudes: nada se pierde

El formulario de la web guarda cada petición con sus fechas, ocupación y mensaje — **en todos los niveles**, incluso cuando solo se reenvía por email. Es el historial comercial del camping.

En el panel, la bandeja de solicitudes las gestiona por estados: **nueva → contactada → presupuestada → convertida / perdida**. Una solicitud es una petición, no una reserva a medias: no bloquea inventario ni tiene precio cerrado hasta que recepción la convierte explícitamente.

---

## 8. Seguridad y datos

- **Una base de datos por camping. Física, no lógica.** Los datos de un camping no comparten base con los de ningún otro: la fuga cruzada no es que esté prohibida — es que **no hay camino** por el que pueda ocurrir. Hay un test automático explícito que lo verifica en cada entrega.
- Infraestructura en el borde (Cloudflare): la web responde rápido desde el punto más cercano al visitante, en Alemania o en Argentina.
- Contraseñas con hash moderno, sesiones con cookie segura, protección de tasa de peticiones en la API pública.
- Los datos de huéspedes guardan el consentimiento RGPD con fecha. El endurecimiento completo (copias, retención, legales) es una fase propia del plan antes del primer cliente en producción.

---

## 9. Qué está en camino

Con fecha en el plan de trabajo, no humo:

| Módulo | Qué añade |
|---|---|
| **Notificaciones** | Emails automáticos en los 6 idiomas (confirmación, recordatorio de llegada, aviso de solicitud…) con remitente del dominio del camping, activables una a una sin tocar código |
| **Pagos online** | Stripe **y Redsys** (la pasarela de los bancos españoles), con modos: sin cobro / señal / total / con fianza. Reembolsos desde la ficha. Un camping puede operar sin pasarela y activarla después |
| **Modo lite completo** | Bandeja + llegadas del día + calendario manual para el nivel Camp Solicitudes |
| **Alta exprés** | Proceso interno para poner un camping nuevo en marcha en una tarde con su material real |
| **Demo autolimpiable** | La demo comercial se reinicia cada noche con fechas siempre vigentes |

---

## 10. Ficha técnica (para el informático de confianza)

| | |
|---|---|
| Web pública | Astro 5 — HTML estático + islas de interactividad; por eso vuela |
| Panel de gestión | React 19 (aplicación de página única servida junto a la web) |
| API | Cloudflare Workers (cómputo en el borde), tipada de extremo a extremo |
| Base de datos | Cloudflare D1 (SQLite) — **una instancia por camping** |
| Emails | Resend, con dominio verificado del camping |
| Dinero | Céntimos enteros; jamás decimales flotantes |
| Fechas | ISO `YYYY-MM-DD`; el día de salida libera la plaza |
| Calidad | Tests unitarios + integración sobre base de datos real + extremo a extremo en navegador, en cada entrega |
| Despliegue | Automatizado a la demo; a producción de cada camping, siempre con aprobación manual |
