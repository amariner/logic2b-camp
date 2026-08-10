# DEMO-SCRIPT — el recorrido de venta de 12 minutos

> Guion para enseñar **camp.logic2b.com** (producto) y
> **camp.logic2b.com/demo/** (Camping Cala Sereno, ficticio) a un director de
> camping desde el primer email comercial. Objetivo: que piense «esto es más
> serio que mi web actual» antes del minuto 5.

## Antes de empezar

- **Dispositivo**: portátil a 1366px si es posible — es el ancho mínimo que el producto garantiza pulido; el móvil se enseña aparte en el minuto 3 (375px, la web es responsive de verdad).
- **Pestañas abiertas**: `camp.logic2b.com/` (landing),
  `camp.logic2b.com/demo/` (web de Cala Sereno) y
  `camp.logic2b.com/admin/`. Para el recorrido compartido, entrar con «Ver la
  demo»; usar una cuenta de gerencia solo si hace falta enseñar ajustes o
  operaciones deliberadamente cerradas al visitante.
- **Fechas a usar en el mostrador**: un rango futuro que el propio mostrador
  ofrezca. El seed se ancla al día real y Cala Sereno abre todo el año; no fijar
  agosto ni un año en el guion.
- **Qué NO enseñar todavía** (honestidad primero, se pierde una venta más rápido prometiendo de más que admitiendo el roadmap):
  - El cobro online real: la demo tiene Stripe con `mode:'none'` — el pago se activa con credenciales reales del camping, no antes.
  - El reenvío manual de notificaciones fallidas: no construido (BACKLOG, requiere una cuenta Resend real para poder probarlo).
  - Reset nocturno automático: si la demo lleva mucho sin reiniciarse puede haber reservas de sesiones de prueba anteriores — si se nota, decirlo con naturalidad ("esto es una demo compartida, tu instancia empieza limpia").
- **Si algo falla en directo**: seguir hablando del producto por FUNCIONALIDADES.md (`docs/FUNCIONALIDADES.md`) mientras se recarga. Nunca improvisar un número o una fecha — este producto vende precisión, un dato inventado en la demo la contradice.

---

## Minuto 0–1 · La web: el mostrador de verdad

Si el interlocutor pregunta por captación propia, empezar 30 segundos antes en
`camp.logic2b.com/#campanas`: abrir búsqueda, display o feed, señalar el rótulo
«Creatividad de ejemplo» y clicar. En Mar de Fondo, enseñar en la barra de
direcciones las UTM de muestra y el salto directo a `#mostrador` antes de seguir.
Frase de encuadre:

> "Aquí no fingimos una cuenta publicitaria ni resultados: enseñamos el recorrido
> completo que sí controlamos, desde una campaña propia hasta la disponibilidad y
> una reserva directa. El pago de esta demo es simulado y no hace ningún cargo."

Sin esa entrada alternativa, abrir `camp.logic2b.com/demo/`; si se ha usado la
campaña, quedarse en Mar de Fondo. Dejar que la portada respire un segundo
(fotografía de demostración aprobada, no una imagen atribuida a un camping real)
y decir la frase que ancla todo lo que sigue:

> "Esto no es una web con un formulario de contacto disfrazado de motor de reservas. El buscador de aquí arriba consulta la disponibilidad real, ahora mismo."

Rellenar el mostrador con el rango futuro elegido y 2 adultos, buscar. Señalar:

- Los precios que aparecen son del **mismo motor** que cobra — nunca hay un precio de la web y otro de la reserva.
- Si el rango cae en unidades sin hueco, el sistema lo dice claro (no "error", sino "agotado" o "cerrado" según el caso — un camping real distingue las dos cosas).

## Minuto 1–3 · Una reserva de principio a fin

Clicar "Reservar" en un resultado. Recorrer rápido, narrando en vez de leyendo:

- **Extras** (ropa de cama, mascota, electricidad…) con el desglose recalculándose en vivo — cada línea del precio a la vista, nunca un total opaco.
- Al llegar a los datos del titular, señalar el **contador de 15 minutos**: "la unidad queda apartada mientras rellena sus datos, como en cualquier venta online seria — sin bloquear inventario para siempre si alguien lo abandona a medias".
- Confirmar. Mostrar la página de confirmación: código de reserva, desglose imprimible, y el enlace de autogestión.
- Abrir ese enlace de gestión (código + email) en una pestaña aparte un momento: "el cliente cancela o cambia fechas sin llamar a recepción — y si cancela, ve el reembolso previsto ANTES de confirmar, no después".

Volver a `/admin` más tarde en el minuto 5 y enseñar esa misma reserva ya en el planning — es el momento "click" de la demo: lo que el cliente acaba de hacer en la web, recepción ya lo tiene delante.

## Minuto 3–4 · Multi-idioma y el móvil

Cambiar el idioma con el selector de la cabecera (francés o alemán, según quién esté delante). Frase: "seis idiomas completos, no una traducción automática pegada encima — es el idioma real del cliente de un camping mediterráneo: francés, alemán, neerlandés, inglés, catalán y español".

Reducir la ventana (o cambiar de dispositivo) a un ancho de móvil. El mostrador, el menú y el buscador siguen funcionando igual de bien — "la mitad de sus reservas van a llegar desde el móvil en la playa, no desde un escritorio".

## Minuto 4–5 · El selector de temas (atrezzo comercial, decirlo así)

Abrir el selector de temas de la cabecera (solo existe en esta demo — ver nota abajo) y cambiar entre `pinada`/`mar`/`garriga`/`nit`. Frase honesta, no vender de más:

> "Esto en concreto es una herramienta de venta nuestra, no algo que tendrá cada camping — cada cliente real tiene SU marca, sus colores, en un solo fichero de diseño. Lo que quiero que vea es que re-vestir el sitio entero, sin tocar una sola página, es así de barato para nosotros — así que el coste de mantenerle a USTED con su marca durante años también lo es."

## Minuto 5–8 · El programa de gestión: el planning

Cambiar a la pestaña de `/admin/`, entrando por la puerta anónima de la demo. El
planning (tape chart) es el elemento firma — dejarlo cargar y quedarse un
segundo callado antes de hablar, que se vea.

- Señalar los colores por estado, la bandeja "sin asignar", los bloqueos con motivo.
- **Arrastrar una reserva** de una parcela a otra del mismo tipo: "reasignar es esto, un arrastre — y el servidor lo valida siempre, si hay solape rebota solo".
- Abrir la ficha de una reserva: desglose, pagos con signo, acciones según el estado ("solo se ofrecen las que tienen sentido ahora mismo — no hay un botón de cancelar en una reserva ya cancelada").
- Si hay tiempo, buscar por el código de la reserva creada en el minuto 2: verla en la lista de reservas confirma el hilo de principio a fin.

## Minuto 8–9 · Gestión (si el camping empieza por solicitudes)

Bandeja de solicitudes: filtros por estado con recuento, mensaje completo al expandir, contacto con un clic. Llegadas del día: quién llega, quién sale, qué queda por cobrar destacado.

> «Si usted hoy necesita que las peticiones de la web no se pierdan en una
> bandeja de correo, Gestión cubre ese paso sin obligarle a activar todavía la
> reserva directa. Puede subir después sobre la misma base.»

## Minuto 9–10 · Lo que no se ve pero vende

Tres pantallas rápidas, sin detenerse mucho en ninguna:

- **Informes**: ocupación y ingresos del mes con un clic.
- **Clientes**: buscar un huésped, ver su historial completo.
- **Log de notificaciones**: "cada email que ha salido — o que no ha salido y por qué — queda aquí. Nunca la duda de si le llegó la confirmación al cliente."

## Minuto 10–11 · Seguridad, la frase que cierra objeciones

> "Cada camping tiene su propia base de datos, físicamente separada de la de cualquier otro cliente nuestro. No es una fila más en una tabla compartida protegida por un filtro — es imposible que sus datos y los de otro camping se crucen, porque no comparten base. Lo comprobamos con un test automático en cada entrega, no de vez en cuando."

## Minuto 11–12 · Niveles y cierre

Volver a la tabla de niveles (`docs/FUNCIONALIDADES.md` §1 si hace falta apoyo visual). Frase de cierre:

> "No le estoy vendiendo un proyecto a medida de tres meses. Empieza en el nivel que necesita hoy — aunque sea solo la web con un formulario que avisa por email — y sube de nivel activando lo que ya existe, sin migrar nada. Lo que ha visto en el planning es literalmente lo que tendría funcionando en cuestión de una tarde una vez tengamos su material."

Cerrar con la pregunta abierta: qué nivel encaja con lo que tienen hoy, y qué material necesitaríamos de su camping (tarifas, parcelas, fotos) para el alta.

---

## Variantes según el interlocutor

- **Camping pequeño, escéptico de pagar por software**: empezar por el minuto 0
  (web) y el 11 (niveles), saltarse el planning entero — Inicio es su puerta de
  entrada; Gestión es la progresión, no la obligación inicial.
- **Camping grande con Excel/corcho hoy**: empezar directamente en el minuto 5 (planning) — es lo que más les va a doler de ver que no tienen.
- **Interlocutor técnico** (el "informático de confianza" de FUNCIONALIDADES.md §11): tener a mano la ficha técnica — Cloudflare Workers/D1, Astro, tests en cada entrega — y saltarse el discurso comercial.

## Después de la demo

Registrar en la ficha del prospecto: nivel que le interesa, comunidad autónoma (para la tasa turística), idiomas que necesita, y si tiene ya web/fotos propias o hay que generarlas. Es lo que la Fase 9 (`docs/ONBOARDING.md`) pide para dar de alta en una tarde.
