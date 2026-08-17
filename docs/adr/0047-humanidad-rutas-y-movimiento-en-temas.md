# 0047 — Humanidad, rutas y movimiento pertenecen a la fábrica de temas

- **Estado:** aceptado por Andreu
- **Fecha:** 2026-08-13
- **Aceptado:** 2026-08-14
- **Fase:** mejora de temas · H0

## Contexto

El portfolio ya demuestra doce identidades diferenciadas sobre una fábrica
común y Cala Sereno conserva el escenario histórico. La fotografía es coherente
con cada territorio, pero la mayoría de los manifiestos se redactó prohibiendo
personas de forma explícita. El resultado protege la arquitectura ficticia y
evita rostros defectuosos, aunque también presenta campings demasiado vacíos:
hay parcelas, recepción, piscina y caminos, pero poca evidencia visual de
hospitalidad, uso o vida cotidiana.

El contenido de entorno ya describe paseos, pueblos y distancias. Sin embargo,
la página compartida solo admite párrafos y una lista de distancias; no puede
presentar rutas con duración, dificultad, punto de salida, mejor momento,
recomendación de recepción y fotografía propia. Las instalaciones muestran
fotografía únicamente cuando existe `instalacion-{id}` y no distinguen una
vista arquitectónica de una escena en uso.

Los héroes son imágenes optimizadas con buena jerarquía a 375 y 1366 px. No hay
un contrato de vídeo en `TenantWebConfig`, el import de medios no admite vídeo y
no existe una política común de ahorro de datos o movimiento reducido para esa
superficie.

El contacto por WhatsApp no está pendiente: ADR 0046 ya lo resolvió como acceso
transversal a Logic2B, sin PII, widgets ni número ficticio de recepción. Esta
decisión debe convivir con él y no crear una segunda fuente de verdad.

## Decisión

### 1. Una capacidad compartida, contenido y activos por tenant

La mejora se implementa en `apps/web` y en los contratos compartidos. Cada
tenant aporta únicamente contenido, configuración y medios; ningún tenant
obtiene un componente propio ni una rama en la home.

El contenido web amplía su contrato con dos bloques opcionales durante la
migración:

- `vida`: título, introducción y entre dos y tres escenas con clave de foto,
  título y texto breve;
- `entornoPagina.rutas`: entre tres y cuatro propuestas con nombre, resumen,
  tipo de plan, duración o distancia, dificultad, salida, mejor momento,
  recomendación prudente de recepción, clave de foto y enlace verificado
  opcional.

Los bloques son opcionales para que un build antiguo siga siendo válido durante
las tres olas. El gate final del portfolio los exige en las trece demos; la
opcionalidad es una herramienta de migración, no el estado final del producto.
La plantilla `_template` los documenta para que un alta nueva no nazca vacía.

### 2. Cuatro papeles humanos mínimos y nombres estables

Cada `fotos.json` incorpora como mínimo estos papeles:

1. `vida-llegada` — llegada o instalación en parcela/alojamiento;
2. `vida-recepcion` — conversación práctica en recepción;
3. `vida-servicio` — uso natural del servicio propio del arquetipo;
4. `vida-entorno` — paseo, bicicleta, observación o descanso en el paraje.

Los activos arquitectónicos actuales se conservan. Las escenas humanas son una
segunda capa y no sustituyen todas las vistas limpias. `Instalaciones.astro`
prefiere `vida-recepcion` para el relato de hospitalidad y conserva
`instalacion-recepcion` como vista del espacio; lo mismo aplica a servicio. La
home recibe un bloque compartido «La vida aquí» entre alojamientos y entorno,
con composiciones alternables desde datos, no desde forks de componente.

La producción mantiene ADR 0035: tandas de dos, staging, inspección, aprobación
y procedencia registrada. Los prompts piden personas anónimas y secundarias,
gestos pequeños, escala y vestuario plausibles, continuidad de luz y territorio,
sin miradas a cámara, poses de catálogo, marcas, texto, matrículas ni rostros
reconocibles. No se reutiliza una imagen entre tenants.

### 3. Las rutas son recomendaciones editoriales, no garantías operativas

El nuevo componente de rutas presenta información que un huésped puede comparar
sin convertir la demo en guía oficial:

- duración/distancia y dificultad son copy del tenant, no cálculos del cliente;
- la recomendación distingue recorrido propio, camino público y servicio de
  terceros;
- el enlace de mapa solo aparece con una URL verificada;
- cierres, incendios, caudal, viento y accesos variables se remiten a la fuente
  oficial o a confirmación en recepción;
- una demo ficticia no inventa coordenadas ni seguimiento en tiempo real.

En ausencia de `rutas`, la página actual de secciones y distancias sigue siendo
completa. Con rutas, la cabecera paisajística, las tarjetas humanas y las
distancias prácticas forman una sola historia.

### 4. Vídeo de héroe como mejora progresiva, nunca como LCP

`TenantWebConfig` añade una propiedad opcional `heroMotion` con claves locales
de vídeo de escritorio y móvil. El póster continúa siendo la imagen de héroe ya
configurada; no se introduce una segunda fuente visual obligatoria.

Un componente compartido de medio de héroe mantiene la imagen optimizada como
base y monta el vídeo por encima solo cuando puede reproducirse. El contrato es:

- bucle de 6–10 segundos, sin audio, `muted`, `loop` y `playsinline`;
- movimiento lento de ramas, agua, lona o una acción humana lejana; sin paneos,
  cortes nerviosos o cambios fuertes de luminosidad;
- fuente móvil con encuadre propio cuando el 21:9 no preserve el sujeto;
- el vídeo no tiene `fetchpriority` y no sustituye el preload del póster;
- no se solicita si `prefers-reduced-motion: reduce` o `Save-Data` está activo;
- si falta, falla o no reproduce, la fotografía queda visible sin salto;
- presupuesto objetivo de 1,5 MB móvil y 3 MB escritorio, H.264/WebM local,
  `faststart` y sin pista de audio.

La primera prueba se limita a L'Olivar, Pinada del Mar y Mar de Fondo. Solo tras
medir recorte, LCP, transferencia y estabilidad en esas tres se produce el
resto. Un vídeo que no mejora la presencia o no cumple el presupuesto se
rechaza; su demo sigue terminada con el póster humano.

### 5. WhatsApp conserva ADR 0046

No se añade `contact.whatsapp`, un número por tenant ni un widget remoto. El
acceso existente sigue identificando a Logic2B y continúa activo por defecto con
`logic2bContact?: boolean`. El QA de este frente comprueba que las nuevas
secciones y el vídeo no lo solapan en móvil, y que el pie sigue retirándolo.

Un WhatsApp operativo de recepción requeriría otra decisión con número real,
responsable, consentimiento, plantillas, horario y tratamiento de datos. No se
simula dentro de las demos.

### 6. Despliegue por olas y gate final

- **H0:** contratos, componentes, fallbacks, plantilla y pruebas.
- **H1:** L'Olivar, Pinada del Mar y Mar de Fondo.
- **H2:** Cala Sereno, La Duna, El Delta, Riu Clar y La Ballena.
- **H3:** La Carrasca, Serralta, Els Tarongers, Entre Vinyes y Sol d'Hivern.

La build de cada tenant sigue siendo independiente. El verificador del
portfolio acredita al final cuatro papeles humanos, tres rutas y configuración
de movimiento por demo, además de ausencia de referencias cruzadas de medios.
Durante H1 y H2 solo exige los slugs ya migrados para no bloquear trabajo en
tandas.

## Tensión de las ocho lentes

- **Arquitectura:** los bloques opcionales permiten migrar sin trece cambios
  atómicos; el gate final impide que la opcionalidad se convierta en deuda. Una
  implementación y N contenidos preservan la fábrica.
- **Fullstack:** config, imports de medios, contenido, render y verificadores
  avanzan juntos. El vídeo no se cuela como URL libre ni como convención sin
  tipo.
- **Backend:** no hay endpoint, geolocalización, tracking ni proveedor en
  runtime. Las rutas son editoriales y WhatsApp no transporta PII.
- **Frontend:** cada capacidad tiene fallback completo. Error de vídeo, ausencia
  de ruta o foto pendiente no rompe la home ni instalaciones.
- **Producto:** personas y rutas mejoran lo que un prospecto puede reconocer y
  vender; el trabajo invisible se limita a lo necesario para repetirlo.
- **UX:** se muestra uso real y se comparan planes sin abrumar. WhatsApp sigue
  siendo de Logic2B y no crea una expectativa falsa de recepción.
- **UI:** la humanidad respeta cada dirección de arte. Vídeo y composiciones no
  homogeneizan las marcas y contemplan movimiento reducido.
- **SEO:** el póster sigue siendo LCP, el vídeo no bloquea render y las rutas
  añaden contenido útil sin alterar canonical, hreflang o sitemap.

## Pruebas de aceptación

1. `TenantWebConfig` acepta `heroMotion` válido y rechaza claves, combinaciones
   o URLs no permitidas; una config anterior continúa pasando.
2. El import de medios encuentra solo vídeo local aprobado y no introduce URLs
   temporales o remotas.
3. Home, instalaciones y entorno construyen con bloques completos y sin ellos.
4. A 320, 375, 430, 768 y 1366 px no hay desborde, cortes de personas/texto ni
   controles menores de 44 px.
5. Con movimiento reducido, ahorro de datos, vídeo ausente o error de carga no
   se solicita/reproduce el vídeo y el póster sigue visible.
6. El héroe conserva preload, `fetchpriority` y dimensiones del póster; el vídeo
   no empeora el LCP acordado ni supera 1,5/3 MB.
7. Teclado, foco, contraste, `alt`, enlaces de mapa y WhatsApp pasan QA; el
   acceso de Logic2B no tapa contenido ni aparece como recepción.
8. Cada demo migrada acredita cuatro papeles humanos propios y tres rutas; el
   gate final cubre las trece.
9. Los manifiestos conservan proveedor, modelo, prompt, aprobación y huella; no
   hay fotografía reutilizada entre tenants.
10. Builds por tier, comprobación de portfolio y `pnpm check` quedan verdes.

## Alternativas descartadas

- **Retocar cada home por separado:** multiplica el coste por cliente y hace
  imposible mantener trece demos.
- **Sustituir todas las fotos vacías:** pierde vistas útiles de arquitectura y
  fuerza escenas humanas donde no aportan.
- **Autoplay obligatorio con `<source src>` desde el HTML:** puede descargar
  vídeo aunque el usuario pida menos movimiento o ahorro de datos.
- **Vídeo remoto o iframe:** añade dependencia, seguimiento y un fallo ajeno al
  render crítico.
- **Una sola versión 21:9 recortada en móvil:** corta personas y convierte la
  revisión responsive en azar.
- **WhatsApp propio ficticio por demo:** contradice ADR 0046, envía a números no
  verificados y confunde soporte comercial con recepción.

## Validación resuelta

Andreu valida conjuntamente:

1. cuatro papeles humanos mínimos por demo;
2. rutas editoriales enriquecidas sin mapa ni estado en tiempo real inventados;
3. vídeo progresivo, con póster como LCP y corte por movimiento reducido/ahorro
   de datos;
4. H1 en tres anclas antes de producir las diez demos restantes;
5. reutilizar el WhatsApp de Logic2B ya aprobado, sin crear uno de recepción.

El contrato queda aceptado. H0 se implementa antes de producir H1; las imágenes
y vídeos siguen sometidos a tandas, inspección y aprobación del pipeline.
