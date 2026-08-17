# Roadmap de mejora de temas — humanidad, entorno y movimiento

> Aceptado por Andreu el 2026-08-14. Este frente sucede al cierre de D6-V y no abre una
> nueva fábrica paralela: amplía la fábrica visual común y la aplica por olas a
> las doce demos de portfolio más Cala Sereno.

## 1. Resultado buscado

Cada demo debe dejar de parecer un recinto recién preparado y todavía vacío.
La mejora no consiste en llenar todas las fotografías de gente, sino en mostrar
una hospitalidad creíble: llegadas, conversación en recepción, uso real de un
servicio, descanso y rutas que empiezan alrededor del camping.

Al terminar, cada tema debe incluir:

- al menos cuatro escenas humanas propias y coherentes con su territorio;
- una recepción en funcionamiento y un servicio usado de manera natural;
- tres rutas o planes cercanos presentados como propuestas útiles;
- el acceso transversal a Logic2B por WhatsApp preservado y verificado;
- un héroe con un bucle de vídeo lento y sutil, con póster estático equivalente;
- la misma calidad a 320, 375, 430, 768 y 1366 px;
- movimiento accesible, carga contenida y alternativa estática completa.

Las demos siguen siendo ficticias. Ninguna imagen acredita un establecimiento
real y ningún CTA puede enviar datos a un número inventado.

## 2. Diagnóstico de partida

La base visual y responsive es buena, pero el vacío es sistémico:

- los manifiestos actuales tienen entre 8 y 14 piezas por demo y casi todos
  vetan personas de forma explícita;
- no hay vídeo en `tenants/*/content/media/` ni soporte declarado para vídeo de
  héroe en la configuración compartida;
- WhatsApp ya está resuelto por ADR 0046 mediante un acceso transversal a
  Logic2B, activo por defecto y desactivable por contrato; no debe duplicarse
  como un número ficticio de recepción;
- instalaciones solo fotografía los servicios que tengan una pieza
  `instalacion-{id}`; el resto se reduce a texto;
- entorno dispone de relato y distancias, pero no de fichas de ruta con
  duración, dificultad, salida, temporada, foto y recomendación de recepción;
- en la home, después de alojamientos solo hay una franja material y un bloque
  textual de entorno: falta una capa intermedia de vida cotidiana;
- las homes comprobadas a 375 y 1366 px no desbordan y conservan buena jerarquía.

La dirección correcta es ampliar los contratos de contenido y de activos una
vez y después producir variaciones por tenant. No se duplican componentes.

## 3. Contrato visual humano

### 3.1 Reglas de realismo

- Personas anónimas, sin rostros protagonistas ni parecidos reconocibles.
- Gestos pequeños: escuchar una explicación, dejar una mochila, abrir una
  ventana, servir un café, ajustar una bicicleta o caminar.
- Vestuario, edad, equipaje y actividad compatibles con el arquetipo de la demo.
- Luz, vegetación, arquitectura y materiales idénticos a los activos aprobados.
- La persona ocupa entre el 10 % y el 35 % del encuadre; el camping sigue siendo
  el producto.
- Nada de poses publicitarias, grupos mirando a cámara, sonrisas de catálogo,
  manos imposibles, multitudes, logos, matrículas o texto generado.
- Una misma demo mantiene continuidad razonable de estación y hora del día; no
  reutiliza personas, edificios o paisaje de otro tenant.
- La generación continúa en tandas máximas de dos piezas, con inspección del
  conjunto antes de seguir y aprobación explícita en el pipeline de fotos.

### 3.2 Cuatro papeles mínimos por demo

1. `vida-llegada`: llegada o instalación en parcela/alojamiento.
2. `vida-recepcion`: una conversación práctica en el mostrador o acceso.
3. `vida-servicio`: uso natural del servicio más característico.
4. `vida-entorno`: paseo, bicicleta, observación o descanso en el paraje propio.

Se pueden conservar los activos vacíos como fotografías arquitectónicas. La
humanidad se añade como segunda capa, no sustituyendo todas las vistas limpias.

## 4. Mejora de la fábrica compartida

### 4.1 Héroe con vídeo

Añadir una configuración opcional y tipada de vídeo con fuentes de escritorio y
móvil, póster, encuadre y posición. El componente común debe:

- usar `<video autoplay muted loop playsinline>` únicamente como fondo;
- conservar el póster como LCP y como fallback completo;
- montar un bucle de 6–10 segundos, sin cortes visibles ni cámara nerviosa;
- limitar el movimiento a viento, agua, ramas, una llegada lejana o caminar
  pausado; no convertir el héroe en un anuncio;
- usar una versión móvil con encuadre específico, no un recorte ciego del 21:9;
- no reproducir con `prefers-reduced-motion`, ahorro de datos o si falla la
  carga; en esos casos permanece la fotografía;
- no introducir sonido, controles, reproducción a pantalla completa ni saltos
  de contraste que comprometan el titular;
- presupuestar aproximadamente 1,5 MB en móvil y 3 MB en escritorio por bucle,
  además de póster WebP/AVIF.

Antes de generar trece vídeos se valida un prototipo en L'Olivar, Pinada del Mar
y Mar de Fondo. Un vídeo que no mejore claramente la sensación de presencia se
descarta y conserva el póster.

### 4.2 Bloque `La vida aquí`

Crear una sección compartida de dos o tres escenas editoriales, colocada entre
alojamientos y entorno. El contenido vive en cada locale del tenant y admite:

- una escena principal humana;
- una escena de recepción o servicio;
- un pie breve que explique el gesto, no la fotografía;
- variantes de composición para evitar que las trece demos parezcan la misma
  plantilla.

### 4.3 Instalaciones con personas

Evolucionar la página actual sin perder sus fallbacks:

- recepción debe tener siempre una escena humana aprobada;
- al menos un segundo servicio se muestra en uso;
- las instalaciones sin foto siguen funcionando como lista compacta;
- la galería alterna espacio, acción y detalle para no repetir tarjetas 3:2;
- recepción y contacto quedan conectados con un CTA visible.

### 4.4 Rutas y parajes

Extender `entornoPagina` con `rutas[]`, tipado y traducible. Cada ruta incluye:

- nombre, promesa corta y tipo de plan;
- distancia o duración, dificultad, salida y mejor momento;
- recomendación de recepción y aviso de condiciones variables;
- fotografía humana propia;
- enlace de mapa opcional solo cuando exista un destino verificado.

La página mostrará tres tarjetas de ruta, un bloque editorial del paisaje y las
distancias prácticas existentes. No se dibuja una cartografía ficticia ni se
promete acceso, seguridad o apertura en tiempo real.

### 4.5 WhatsApp ya resuelto: preservar, no duplicar

La ADR 0046 ya aporta el contacto transversal por WhatsApp a Logic2B en todas
las webs tenant. Este frente no añade `contact.whatsapp`, no inventa números de
recepción y no carga widgets de Meta.

- Se conserva la fuente única `@logic-camp/config/contact` y su mensaje sin PII.
- La mejora de temas debe comprobar que el acceso no tapa las nuevas galerías,
  tarjetas de ruta, formularios o navegación móvil.
- Sigue siendo un contacto de Logic2B, no un servicio ficticio del camping.
- Cualquier futuro WhatsApp operativo de recepción será otro alcance, con
  número verificado, consentimiento, responsable y política propios.

## 5. Olas de aplicación

### Ola H0 — contrato y prototipo compartido

Alcance: fábrica común, tipos, fallbacks, accesibilidad, presupuesto de medios y
pruebas de regresión. Sin producir todavía todo el portfolio.

Salida:

- esquema y contenido de plantilla ampliados;
- componentes de vídeo, vida y rutas, compatibles con el WhatsApp existente;
- una demo sin nuevos campos continúa construyendo igual;
- tests de config y render para ausencia/presencia de cada capacidad.

### Ola H1 — tres anclas

1. **L'Olivar**: anfitrión en la masía, pareja preparando desayuno, baño en la
   balsa y paseo por piedra seca. Movimiento: hojas de olivo y llegada a pie.
2. **Pinada del Mar**: familia llegando, recepción activa, piscina usada con
   calma y salida en bicicleta hacia la costa. Movimiento: pinos, toldo y paso
   lejano de una familia.
3. **Mar de Fondo**: check-in de resort, restaurante/terraza, club familiar y
   paseo de laguna o playa. Movimiento: agua, cañizo y servicio discreto.

Gate: las tres deben sentirse humanas sin compartir composición, figurantes ni
temperatura de color. Se revisa la conversación comercial antes de escalar.

### Ola H2 — costa, humedal y río

- **Cala Sereno**: recepción, restaurante, cala y senderos desde el camping.
- **La Duna**: llegada ligera, módulo de servicios, pasarela y ruta litoral.
- **El Delta**: recepción práctica, observación de aves y ruta ciclista llana.
- **Riu Clar**: bienvenida, refugio/baños y senderismo junto al río.
- **La Ballena**: cambio de turno familiar, parque de agua, club y salinas.

Gate: cada demo comunica un uso distinto del agua y no deriva a la misma imagen
de “familia en piscina”.

### Ola H3 — interior, montaña y larga estancia

- **La Carrasca**: explicación de reglas en recepción, piscina natural, era
  común y paseo por encinar.
- **Serralta**: parte de rutas, secadero, fuego común controlado y senderistas.
- **Els Tarongers**: recepción familiar, patio/piscina y paseo entre huerta y
  costa.
- **Entre Vinyes**: llegada en vendimia, patio, despensa y ruta de bodegas.
- **Sol d'Hivern**: residentes de larga estancia, correo/recepción, lavandería,
  salón común y caminos de almendros.

Gate: las edades, ritmos y tipos de grupo responden al arquetipo de cada tema;
no todo el portfolio representa familias jóvenes.

## 6. Secuencia de sesiones

| Sesión | Objetivo                | Entregable verificable                                                 |
| ------ | ----------------------- | ---------------------------------------------------------------------- |
| T1     | Contrato y schema       | Tipos, plantilla, fallback y ADR si el cambio de contrato lo requiere  |
| T2     | Componentes comunes     | Vida y rutas con datos de prueba, sin duplicación por tenant           |
| T3     | Prototipo de movimiento | Vídeo responsive y accesible en una ancla, con presupuesto de carga    |
| T4–T5  | Ola H1                  | Tres demos ancla completas y comparadas a 375/1366                     |
| T6–T8  | Ola H2                  | Cinco demos de costa/agua, producidas en tandas de dos imágenes        |
| T9–T11 | Ola H3                  | Cinco demos de interior, montaña y larga estancia                      |
| T12    | QA transversal          | Matriz móvil, teclado, movimiento reducido, carga y revisión comercial |

La estimación es deliberadamente por sesiones, no por fecha. Si la generación
de vídeo no alcanza el realismo o el peso acordado, no bloquea el resto: la demo
sale con póster humano y se reintenta el vídeo como subfase posterior.

## 7. Criterios de aceptación por demo

- Cuatro papeles humanos aprobados y declarados en `fotos.json`.
- Ninguna pieza reutilizada desde otro tenant.
- Recepción y un servicio aparecen en uso, no solo vacíos.
- Tres rutas/planes completos, útiles y prudentes.
- Contacto Logic2B por WhatsApp visible, honesto y sin solapar el contenido.
- Vídeo sutil con póster idéntico en intención; sin sonido y sin reproducción
  cuando el usuario pide menos movimiento.
- Sin desborde a 320/375/430; CTA y controles de 44 px como mínimo.
- Recorte de personas y texto correcto en 375 y 1366 px.
- Navegación y contenido utilizables con teclado.
- Sin regresión de LCP por sustituir el póster por el vídeo.
- Build del tenant, comprobación de enlaces, imágenes, `alt`, consola y 404 en
  verde.
- La ficción comercial se identifica y no envía a servicios reales por error.

## 8. Orden de prioridad

1. **P0 — humanidad visible:** papeles fotográficos, recepción, servicio y
   bloque de vida en H1.
2. **P0 — conversión honesta:** preservar y verificar el WhatsApp transversal.
3. **P1 — entorno útil:** rutas visuales y recomendaciones de recepción.
4. **P1 — movimiento:** vídeo sutil después de validar peso y accesibilidad.
5. **P2 — profundidad:** más escenas por tema, variaciones estacionales y
   microinteracciones solo si aportan a la demo comercial.

El primer hito vendible no exige terminar las trece demos: H1 completa debe
estar lista para enseñar y aprender antes de consumir el coste de H2 y H3.
