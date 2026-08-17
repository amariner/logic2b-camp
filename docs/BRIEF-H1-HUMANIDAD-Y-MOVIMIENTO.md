# Brief H1 — humanidad y movimiento en las tres demos ancla

> Preparación editorial del 2026-08-13. Este documento no abre producción:
> convierte ADR 0047 y el contrato visual de la primera ola en encargos
> inspeccionables para L'Olivar, Pinada del Mar y Mar de Fondo. Los prompts no
> entran en `fotos.json` ni se generan hasta que ADR 0047 sea aceptada.

## 1. Objetivo del lote

H1 debe demostrar que la fábrica puede añadir personas sin perder la identidad
de cada camping ni caer en fotografía de catálogo. Cada ancla recibe cuatro
escenas humanas y un bucle de héroe ambiental:

| Papel            | Lo que debe probar                                        | Proporción base |
| ---------------- | --------------------------------------------------------- | --------------- |
| `vida-llegada`   | Alguien llega y entiende cómo instalarse                  | 3:2             |
| `vida-recepcion` | Existe una hospitalidad concreta y una conversación útil  | 3:2             |
| `vida-servicio`  | El servicio característico se usa con naturalidad         | 3:2             |
| `vida-entorno`   | El paraje se recorre, no funciona solo como fondo         | 3:2             |
| `hero-motion`    | El lugar respira con movimiento lento, sin robar atención | 16:9 / 8 s      |

Las escenas se suman a los activos existentes. Los héroes, instalaciones y
espacios vacíos siguen siendo útiles para arquitectura, tarifa y comparación.

## 2. Continuidad común

### 2.1 Personas

- Personas anónimas, mediterráneas/europeas plausibles y vestidas para la
  actividad, estación y hora del día; nada de estilismo de campaña.
- Rostros en perfil, tres cuartos, de espaldas o fuera del plano de foco. Nunca
  una cara frontal protagonista ni parecida a una persona real reconocible.
- Una o dos acciones por imagen. Nadie posa, mira a cámara ni sostiene un objeto
  sin propósito.
- Manos ocupadas en un gesto simple y verificable: apoyar un mapa, ajustar una
  correa, colocar una bolsa, servir agua o sujetar un manillar.
- Diversidad de edades y ritmos entre demos. No convertir las trece identidades
  futuras en la misma familia joven con dos niños.
- La persona ocupa aproximadamente entre el 10 % y el 30 % del encuadre. El
  camping conserva el protagonismo.

### 2.2 Realismo físico

- Pies apoyados en el suelo correcto, sombras en la misma dirección y contacto
  real con mostrador, silla, bicicleta, equipaje o camino.
- Anatomía completa: cinco dedos cuando sean visibles, manos no fusionadas,
  articulaciones plausibles y ropa que no atraviesa objetos.
- Arquitectura, vegetación, mobiliario y materiales compatibles con las fotos
  actuales del tenant. No aparece un edificio alternativo para la misma
  recepción.
- Sin texto legible, logos, uniformes de marca, matrículas, pulseras con letras,
  mapas detallados, pantallas brillantes, menús o señalética generada.
- Color documental, piel sin retoque plástico, rango dinámico natural, sin HDR,
  bokeh extremo, flare publicitario ni saturación de folleto.

### 2.3 Composición responsive

- La acción principal queda dentro del 60 % central para sobrevivir a una
  tarjeta móvil estrecha.
- Cabezas, manos y pies conservan aire suficiente; ningún recorte se decide en
  la generación a menos de 8 % del borde.
- El frame también debe funcionar sin copy superpuesto. El componente decide la
  composición editorial; la imagen no lleva espacio negativo artificial salvo
  el héroe.
- Cada pareja se inspecciona a tamaño original, 335 px de ancho y recorte 3:2.
- El vídeo usa el póster existente como primer frame. Solo se crea una fuente
  móvil propia si el recorte de 375 px falla en la prueba H1.

## 3. L'Olivar — presencia cercana y sin pose

### 3.1 Lectura de los activos existentes

`hero-dia` fija una mañana seca entre olivos, lona cruda, piedra oscura y cal.
La escala es íntima y casi artesanal. `instalacion-balsa` es deliberadamente
modesta; no debe convertirse en piscina ni spa. La nueva humanidad tiene que
parecer propietaria/huésped de un microcamping, no personal de hotel.

**Reparto de continuidad:** una anfitriona de 50–60 años con ropa de trabajo
clara y una pareja de 35–50 años que viaja ligera. La anfitriona puede repetirse
en llegada y recepción si la identidad visual es consistente; nunca se exige
continuidad facial exacta entre imágenes si eso reduce realismo.

**Luz:** mañana seca y templada, sombra irregular de hoja de olivo, verdes
apagados, cal `#F3EFE3`, piedra `#C9BDA4` y lona cruda.

### 3.2 Tanda O1 — llegada y recepción

#### `vida-llegada`

**Papel:** la pareja coloca una bolsa de viaje y abre la entrada de una tienda
premontada mientras la anfitriona señala dónde queda el camino de baños. No se
representa check-in formal ni equipaje de lujo.

**Prompt de trabajo:**

> Fotografía editorial documental fotorrealista del mismo microcamping del
> Maestrat mostrado en los activos de L'Olivar, mañana seca bajo olivos adultos.
> Una pareja de 35–50 años con ropa sencilla de viaje instala una bolsa de lona
> junto a una tienda premontada cruda; una anfitriona de 50–60 años, de perfil y
> ligeramente desenfocada, señala con un gesto pequeño el camino de piedra hacia
> los baños. Suelo firme, muro de piedra seca, cal y sombra irregular de hojas,
> escala íntima de 22 unidades, fotografía natural a 35 mm, piel y ropa sin
> retoque. Acción central, cuerpos completos y espacio de recorte móvil. Sin
> miradas a cámara, pose publicitaria, texto, logos, marcas, matrículas, manos
> deformes, arquitectura nueva, glamping de lujo, HDR ni saturación.

**Rechazo específico:** tienda de safari, maletas rígidas premium, anfitriona
uniformada, más de tres personas o ambiente de boda rural.

#### `vida-recepcion`

**Papel:** conversación en el porche de una masía pequeña. La anfitriona apoya
un plano sin detalles legibles y recomienda dos caminos; la huésped escucha.

**Prompt de trabajo:**

> Fotografía editorial documental fotorrealista en el pequeño porche de una
> masía encalada del mismo microcamping entre olivos. Una anfitriona de 50–60
> años, vista tres cuartos de espalda, apoya una hoja de mapa sin texto legible
> sobre una mesa de madera y explica una ruta a una huésped adulta de perfil.
> Una llave lisa, una botella de agua y una cesta de pan aportan escala, sin
> mostrador hotelero. Luz lateral de mañana, cal mate, piedra seca y sombra de
> olivo, 35 mm, gesto contenido, manos visibles y naturales. Sin pose, sonrisa a
> cámara, rótulos, pantallas, logos, folletos legibles, recepción de resort,
> arquitectura imposible, HDR ni piel plástica.

**Rechazo específico:** lobby, ordenador de hotel, uniforme corporativo, mapa
con carreteras/letras o decorado de tienda gourmet.

### 3.3 Tanda O2 — servicio y entorno

#### `vida-servicio`

**Papel:** cocina común a escala humana. Una persona corta pan y otra llena una
jarra; no se convierte en restaurante ni banquete.

**Prompt de trabajo:**

> Fotografía editorial documental fotorrealista de una cocina común pequeña y
> cubierta en el mismo microcamping del Maestrat. Dos huéspedes adultos preparan
> un desayuno sencillo: una persona corta pan sobre una tabla y otra llena una
> jarra de agua junto a un fregadero. Mesa larga usada pero ordenada, dos fuegos,
> cal, madera sin barniz brillante y sombra de olivos entrando por el lateral.
> Luz natural de media mañana, encuadre 3:2, personas secundarias y manos claras.
> Sin mirar a cámara, brunch de lujo, chef, restaurante, buffet, texto, marcas,
> comida perfecta de publicidad, dedos extra, HDR ni saturación.

**Rechazo específico:** piscina/balsa usada como baño, cocina doméstica grande,
vajilla de hotel o mesa llena de atrezzo.

#### `vida-entorno`

**Papel:** camino de bancales; la pareja camina con una bolsa de pan y se detiene
ante un muro de piedra. El paisaje sigue siendo cotidiano.

**Prompt de trabajo:**

> Fotografía editorial documental fotorrealista de un camino público entre
> bancales de olivos y muros de piedra seca del Maestrat, misma luz y paleta de
> L'Olivar. Una pareja adulta camina alejándose de cámara; una persona lleva una
> pequeña bolsa de papel de pan sin marca y la otra se detiene para observar el
> muro. Ropa sencilla, calzado de paseo, relieve suave, romero y tierra seca,
> escala cotidiana, 50 mm, profundidad natural. Sin pose turística, mochilas de
> expedición, monumento, letras, señales, logos, bastones alpinos, manos o pies
> deformes, HDR ni postal saturada.

**Rechazo específico:** montaña alpina, pueblo monumental, cosecha teatral o
grupo grande de senderistas.

### 3.4 Vídeo O3 — respiración del olivar

**Inicio:** `hero-dia` aprobado, sin alterar tienda, muro o encuadre.

**Movimiento:** ocho segundos de hojas y ramas moviéndose muy levemente, sombra
moteada desplazándose sobre la lona y una respiración mínima del tejido. Cámara
fija con acercamiento óptico inferior al 2 %. Sin aparición de personas,
animales, humo ni objetos nuevos.

**Prompt de movimiento:**

> Animate only the existing olive leaves, dappled sunlight and raw canvas with
> extremely subtle natural wind. Locked documentary camera with an almost
> imperceptible two-percent push-in, no cuts, no shake, no new objects, no
> people entering, no architecture changes, no exposure flicker. Eight-second
> seamless-feeling slow ambient shot, realistic Mediterranean morning.

**Gate:** el primer y último frame no deben producir salto visible en la lona.

### 3.5 Rutas propuestas

| Ruta                   | Tipo               | Duración/distancia    | Dificultad | Salida             | Mejor momento        | Recomendación prudente                                                   |
| ---------------------- | ------------------ | --------------------- | ---------- | ------------------ | -------------------- | ------------------------------------------------------------------------ |
| Vuelta de los bancales | paseo a pie        | 4,2 km · 1 h 15 min   | fácil      | puerta del camping | mañana o última hora | Tras lluvia, recepción confirma el tramo bajo del camino.                |
| Horno y almazara       | paseo/bici         | 7 km · 35 min en bici | fácil      | camino de la masía | antes del mediodía   | Los horarios pertenecen a terceros y se comprueban antes de salir.       |
| Pinar alto             | sendero de mirador | 6,8 km · 2 h 15 min   | moderada   | bancal norte       | primavera y otoño    | Evitar horas centrales y confirmar riesgo forestal o cierres temporales. |

No se publican coordenadas ni nombres de negocios ficticios. `vida-entorno`
viste la primera ruta; las otras reutilizan la cabecera solo durante el
prototipo H1 y reciben foto propia antes del gate final si la ADR exige una por
ruta.

## 4. Pinada del Mar — volumen familiar y recepción activa

### 4.1 Lectura de los activos existentes

`hero-calle` ofrece una avenida muy creíble bajo pinos, caravanas instaladas y
mar al fondo. `instalacion-recepcion` fija una recepción encalada con porche de
madera, mostrador oscuro, romero y bicicleta. Las escenas humanas deben habitar
esas arquitecturas, no sustituirlas por una recepción acristalada o un camping
de resort.

**Reparto de continuidad:** familia con dos personas adultas y una niña o niño
de 7–11 años; recepcionista de 45–60 años. En servicio pueden aparecer otras dos
personas al fondo, nunca multitud.

**Luz:** media mañana mediterránea bajo pino, verdes lona/pino apagados, arena
compactada, sal marina contenida y sombras largas legibles.

### 4.2 Tanda P1 — llegada y recepción

#### `vida-llegada`

**Papel:** llegada práctica a bungalow o mobil-home: una persona baja una bolsa,
otra comprueba la parcela y el menor lleva una toalla enrollada. Sin coche de
marca protagonista.

**Prompt de trabajo:**

> Photoreal editorial documentary photograph in the same Pinada del Mar
> Mediterranean campsite, under tall Aleppo pines at mid-morning. A family of
> two adults and one child aged roughly 7–11 arrives at a sober bungalow or
> mobile-home pitch: one adult places a soft travel bag on the shaded timber
> deck, the other checks the pitch connection, and the child carries a rolled
> plain towel. Compacted sand, green canvas, pale render and realistic campsite
> scale, 35 mm natural light, full bodies and central action for mobile crop.
> No one looks at camera, no staged smiles, no branded vehicle, no readable
> numbers, text, logos, extra fingers, luxury resort, HDR or brochure colour.

**Rechazo específico:** equipaje de aeropuerto, carrito de hotel, coche
reconocible, cinco o más personas o césped tropical.

#### `vida-recepcion`

**Papel:** conservar la recepción existente. La recepcionista señala en una
hoja simple la calle de la parcela mientras una persona adulta escucha y el
menor espera junto a la bicicleta.

**Prompt de trabajo:**

> Photoreal editorial documentary scene using the same small white reception
> building, deep timber porch, dark counter, potted rosemary and bicycle seen in
> Pinada del Mar. A receptionist aged 45–60 stands behind the open counter and
> points to a plain map with no readable text; one adult guest listens in
> profile while a child waits naturally beside the bicycle without touching
> traffic. Morning pine shade, muted green and sand palette, 50 mm, believable
> hand contact and quiet operational mood. No frontal faces, posing, hotel
> uniforms, readable brochures, screens, logos, invented glass lobby, malformed
> hands, HDR or saturation.

**Rechazo específico:** eliminar la bicicleta/romero, lobby profundo, cola de
check-in, pulseras con letras o mostrador de aeropuerto.

### 4.3 Tanda P2 — servicio y entorno

#### `vida-servicio`

**Papel:** piscina familiar en uso contenido. Un adulto permanece sentado a la
sombra mientras el menor entra por los escalones; no hay parque acuático ni
docenas de bañistas.

**Prompt de trabajo:**

> Photoreal editorial documentary photograph of the same modest rectangular
> family pool at Pinada del Mar, late morning under Aleppo pines. One child aged
> 7–11 enters the shallow section using the real steps while an adult sits
> nearby in open shade with a plain towel and watches attentively. Two distant
> guests may be softly out of focus for scale. Natural still water, simple
> concrete surround, muted greens and warm stone, 70 mm documentary framing,
> no identifiable frontal face. No staged splashing, inflatables, water park,
> tropical palms, crowds, unsafe supervision, logos, text, distorted limbs,
> glossy skin, HDR or brochure saturation.

**Rechazo específico:** menor sin supervisión, piscina infinita, bikini de
campaña, socorrista ficticio o más de cuatro figuras.

#### `vida-entorno`

**Papel:** salida familiar en bicicleta por la vía verde; recepción presta una
bomba, pero la foto se centra en ajustar una rueda antes de iniciar la ruta.

**Prompt de trabajo:**

> Photoreal editorial documentary photograph at the sandy entrance of the same
> pine campsite near the Mediterranean coast. An adult crouches to check the
> tyre pressure of a simple unbranded bicycle while another adult adjusts a
> child's helmet; the child stands calmly beside a smaller bicycle. Pine shade,
> coastal light, compacted sand and a modest greenway disappearing between
> trees, natural 35 mm colour and clear physical contact. No racing kits, posed
> smiles, readable signs, logos, professional cycling, road traffic, malformed
> hands, floating wheels, HDR or tourism-poster saturation.

**Rechazo específico:** ciclismo deportivo, playa tropical, familia mirando a
cámara, bicicleta imposible o casco mal colocado.

### 4.4 Vídeo P3 — sombra de pino y llegada lenta

**Inicio:** `hero-calle` aprobado. La avenida central y el horizonte no cambian.

**Movimiento:** ocho segundos con copas de pino y lonas moviéndose de forma
ligera, manchas de luz desplazándose sobre la arena y mar casi inmóvil al fondo.
Cámara fija, sin personas nuevas ni caravanas en movimiento.

**Prompt de movimiento:**

> Animate only the existing Aleppo pine canopies, small green canvas movements,
> dappled shadows on compacted sand and a barely moving distant sea. Locked
> documentary camera, no cuts, no shake, no zoom beyond one percent, no people
> appearing, no vehicles moving, no caravan or architecture changes, no light
> flicker. Eight seconds of restrained realistic Mediterranean mid-morning.

**Gate:** las lonas no se deforman y el mar no invade el camino.

### 4.5 Rutas propuestas

| Ruta                       | Tipo            | Duración/distancia    | Dificultad | Salida                | Mejor momento      | Recomendación prudente                                              |
| -------------------------- | --------------- | --------------------- | ---------- | --------------------- | ------------------ | ------------------------------------------------------------------- |
| Pasarela de la playa       | paseo familiar  | 2,6 km · 45 min       | fácil      | acceso este           | primera hora/tarde | Consultar bandera y estado del mar; no implica zona reservada.      |
| Vía verde de las dos calas | bicicleta       | 18 km · 1 h 30 min    | fácil      | aparcabicis recepción | mañana             | Confirmar obras y tramos compartidos antes de salir con menores.    |
| Mercado y puerto           | bicicleta/paseo | 9 km · 55 min en bici | fácil      | salida principal      | martes o sábado    | Mercado y comercios son de terceros; comprobar calendario y acceso. |

`vida-entorno` corresponde a la preparación de la vía verde. La pasarela y el
mercado requieren escenas propias en el cierre del tenant si las tarjetas no
admiten una foto editorial común.

## 5. Mar de Fondo — servicio visible, no lujo escenificado

### 5.1 Lectura de los activos existentes

`hero-laguna` establece una vista elevada, arquitectura clara y agua profunda;
la escala humana falta y el conjunto puede leerse como hotel. Las nuevas escenas
deben devolverlo al mundo camping mediante operación, familias, mobil-homes y
recorridos, sin convertirlo en complejo de moda. `instalacion-restaurante` y
`instalacion-recepcion` ofrecen arquitectura suficiente para escenas derivadas.

**Reparto de continuidad:** familia de dos adultos y dos menores de 8–14 años;
recepcionista de 40–60 años; una persona de servicio en restaurante. Personas
mayores o parejas pueden aparecer al fondo para evitar una demografía única.

**Luz:** última hora limpia, sal/blanco, arena clara, agua profunda y coral solo
en detalles pequeños. Premium por orden y atención, no por vestuario o lujo.

### 5.2 Tanda M1 — llegada y recepción

#### `vida-llegada`

**Papel:** familia llegando a un bungalow o mobil-home, con carro de equipaje
sencillo y una persona adulta verificando el número en un resguardo sin texto.

**Prompt de trabajo:**

> Photoreal editorial documentary photograph in the same large Mediterranean
> campsite resort as Mar de Fondo at clean late-afternoon light. A family of two
> adults and two children aged roughly 8–14 arrives at a plausible low
> salt-white bungalow or mobile-home; one adult moves a simple campsite luggage
> trolley with soft bags, the other checks a plain reservation slip with no
> readable text, and the children step onto the shaded terrace. Native grasses,
> pale path, restrained teal canvas and real campsite proportions, 35 mm,
> natural skin and full bodies. No posing, fashion styling, bellhop, hotel lobby,
> branded luggage, readable numbers, logos, malformed hands, luxury cars, HDR or
> resort-ad saturation.

**Rechazo específico:** villa privada, maletero uniformado, mármol/dorados,
maletas de lujo o arquitectura diferente del catálogo actual.

#### `vida-recepcion`

**Papel:** cuatro puestos no significan una cola teatral. Una recepcionista
atiende a una familia; otra persona del equipo trabaja al fondo desenfocada.

**Prompt de trabajo:**

> Photoreal editorial documentary scene inside the same ordered Mar de Fondo
> reception hall with pale stone floor, salt-white walls, warm timber counter
> and broad glass opening to the arrival court. One receptionist aged 40–60
> calmly explains a plain resort map with no readable text to two adult guests;
> a second staff member works softly out of focus at another check-in position.
> Late natural light, operational spacing, 50 mm, restrained teal and sand
> palette, natural hand gestures and no frontal hero face. No queue, hotel
> uniforms, gold, readable screens, logos, fake signage, posed smiles, malformed
> fingers, glossy skin, HDR or luxury cliché.

**Rechazo específico:** recepción de cinco estrellas, cola con maletas, pantallas
con UI inventada o cuatro empleados alineados.

### 5.3 Tanda M2 — servicio y entorno

#### `vida-servicio`

**Papel:** restaurante al inicio del servicio. Una persona sirve agua a una mesa
familiar mientras otra prepara una mesa al fondo; ninguna escena gastronómica de
lujo.

**Prompt de trabajo:**

> Photoreal editorial documentary photograph in the same open-sided Mar de
> Fondo campsite restaurant facing the lagoon at golden hour. A service worker
> in plain unbranded clothing pours water into a glass at a family table while
> another worker quietly prepares a table in the background. The family is in
> natural side view, talking rather than posing; simple Mediterranean food,
> timber ceiling, pale masonry and deep teal water reflections remain visible.
> 50 mm, calm organisation, believable hand contact and natural skin. No fine
> dining theatre, chef hats, champagne, gold, readable menu, logos, frontal
> smiles, extra fingers, HDR or glossy resort advertising.

**Rechazo específico:** banquete vacío con una sola modelo, camarero de hotel,
mesa recargada, cócteles protagonistas o uniforme con marca.

#### `vida-entorno`

**Papel:** familia y pareja mayor comparten la pasarela hacia la playa, con
distancias suficientes para que no parezca una sesión de grupo.

**Prompt de trabajo:**

> Photoreal editorial documentary photograph on the same timber boardwalk
> crossing restrained Mediterranean dunes near Mar de Fondo at clean late
> golden hour. A family of four walks away toward the open beach, naturally
> spaced, carrying plain towels; farther ahead an older couple walks at a slower
> pace. Native grasses, calm sea, broad horizon and long natural shadows, 50 mm,
> people secondary to the landscape and central enough for mobile crop. No one
> looks back, no fashion beachwear, no private beach setup, logos, readable
> signs, malformed limbs, tropical vegetation, HDR or travel-poster saturation.

**Rechazo específico:** club de playa, tumbonas privadas, ropa de pasarela,
multitud o puesta de sol naranja extrema.

### 5.4 Vídeo M3 — agua y servicio silencioso

**Inicio:** `hero-laguna` aprobado. La geometría de piscina y edificios queda
fija.

**Movimiento:** ocho segundos de ondulación leve en la laguna, reflejos sobre
cal, hojas de palmera contenidas y sombra de sombrilla desplazándose apenas.
Cámara fija; no aparecen bañistas ni se modifica la arquitectura.

**Prompt de movimiento:**

> Animate only the existing deep-teal lagoon ripples, reflected light on
> salt-white walls, restrained palm leaves and a very slight umbrella shadow.
> Locked elevated documentary camera, no cuts, no shake, no added people, no
> water-level or building changes, no moving furniture, no exposure flicker.
> Eight seconds of realistic clean late-afternoon Mediterranean atmosphere.

**Gate:** bordes de piscina y líneas arquitectónicas permanecen inmóviles; no
aparecen ondas gelatinosas en paredes o suelo.

### 5.5 Rutas propuestas

| Ruta                    | Tipo                  | Duración/distancia  | Dificultad | Salida                | Mejor momento | Recomendación prudente                                               |
| ----------------------- | --------------------- | ------------------- | ---------- | --------------------- | ------------- | -------------------------------------------------------------------- |
| Duna y playa abierta    | paseo accesible       | 4 km · 1 h 15 min   | fácil      | pasarela del resort   | mañana/tarde  | Confirmar bandera, calor y accesibilidad temporal de la pasarela.    |
| Vuelta de la marjal     | bicicleta/observación | 16 km · 1 h 40 min  | fácil      | recepción/aparcabicis | primera hora  | Respetar zonas sensibles y comprobar cierres o nivel de agua.        |
| Puerto al caer la tarde | paseo + traslado      | 5,5 km de recorrido | fácil      | llegada al puerto     | última hora   | El traslado y los horarios son de muestra; verificar proveedor real. |

`vida-entorno` viste la ruta de duna. La marjal debe evitar primeros planos de
aves generadas o señales inventadas; el puerto no se representa hasta disponer
de una referencia visual verificada.

## 6. Orden de producción H1

La producción continúa en tandas máximas de dos activos:

1. O1 `vida-llegada` + `vida-recepcion`.
2. O2 `vida-servicio` + `vida-entorno`.
3. P1 `vida-llegada` + `vida-recepcion`.
4. P2 `vida-servicio` + `vida-entorno`.
5. M1 `vida-llegada` + `vida-recepcion`.
6. M2 `vida-servicio` + `vida-entorno`.
7. O3, P3 y M3 se generan individualmente después de aprobar los doce estáticos
   y de tener el componente de vídeo verificado con un clip técnico local.

No se lanzan seis trabajos en paralelo. Cada pareja se ve junta y se aprueba o
rechaza antes de la siguiente. Un rechazo por anatomía o continuidad no se
compensa con una segunda imagen buena.

## 7. Matriz de inspección

Cada pieza está aprobada solo si pasa todas las filas:

| Control                 | Pregunta verificable                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------- |
| Identidad               | ¿Sin copy puede asignarse a la demo correcta y no a las otras dos?                     |
| Continuidad             | ¿Edificio, material, vegetación, luz y mobiliario coinciden con los activos actuales?  |
| Acción                  | ¿Se entiende qué hacen las personas sin una explicación larga?                         |
| Anatomía                | ¿Rostros, manos, dedos, pies, articulaciones y contactos resisten zoom al 100 %?       |
| Física                  | ¿Sombras, reflejos, peso, apoyos y oclusiones son coherentes?                          |
| Naturalidad             | ¿Nadie posa, mira a cámara o parece modelo de stock?                                   |
| Seguridad               | ¿No se representa un comportamiento inseguro con menores, agua, fuego o tráfico?       |
| Ficción honesta         | ¿No aparecen nombres, señales, coordenadas, marcas o servicios inventados como reales? |
| Escritorio              | ¿El 3:2 funciona a 640–1024 px sin perder acción ni contexto?                          |
| Móvil                   | ¿El recorte a 335 px conserva cabeza, manos, pies y gesto principal?                   |
| Color                   | ¿La pieza comparte temperatura, contraste y grano con su tenant?                       |
| Accesibilidad editorial | ¿Se puede escribir un `alt` breve y factual sin interpretar emociones o identidad?     |

Para vídeo se añaden:

- primer frame equivalente al póster;
- bucle sin salto visible;
- cero geometría licuada o aparición de objetos;
- H.264/WebM local sin audio, `faststart`, duración 6–10 s;
- ≤1,5 MB móvil y ≤3 MB escritorio;
- fallback completo con movimiento reducido, ahorro de datos y error de carga.

## 8. Copy inicial para los futuros bloques

Este copy es dirección editorial; se localizará dentro de cada tenant al
implementar H0.

### L'Olivar

- **Título:** «Aquí te recibe quien conoce cada bancal».
- **Intro:** «Llegar, preguntar por el pan y elegir un camino forman parte del
  mismo gesto. L'Olivar funciona pequeño, cercano y sin intermediarios.»
- **Escenas:** «Llegar sin prisa» · «Dos caminos sobre la mesa» · «Lo común, de
  verdad» · «Salir andando».

### Pinada del Mar

- **Título:** «Agosto tiene ritmo, no ruido».
- **Intro:** «Recepción ordena llegadas, la sombra reparte el día y cada servicio
  queda donde una familia lo necesita.»
- **Escenas:** «Todo listo para instalarse» · «La calle correcta a la primera» ·
  «Piscina con escala familiar» · «La vía verde empieza aquí».

### Mar de Fondo

- **Título:** «La escala se nota en el servicio».
- **Intro:** «Tres centenares de unidades pueden sentirse claras cuando llegada,
  restaurante, agua y recorridos cuentan la misma historia.»
- **Escenas:** «Llegar con todo previsto» · «Una explicación, no una cola» · «El
  servicio empieza antes de sentarse» · «Del resort al mar a pie».

## 9. Gate para abrir producción

H1 solo se produce cuando:

1. ADR 0047 está aceptada;
2. H0 admite `vida`, rutas y vídeo con fallback sin exigir todavía los campos a
   todos los tenants;
3. el verificador identifica los slugs migrados y evita referencias cruzadas;
4. los prompts anteriores se trasladan a `fotos.json` conservando papel,
   proporción, lote y procedencia;
5. existe una prueba de recorte a 375/1366 antes de aprobar cada pareja;
6. WhatsApp de Logic2B sigue visible sin tapar las nuevas secciones.

El encargo no autoriza despliegue ni convierte las rutas o servicios ficticios
en información operativa real.
