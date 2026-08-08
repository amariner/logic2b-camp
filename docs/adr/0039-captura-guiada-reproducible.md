# 0039 — La captura guiada se genera desde el recorrido real y se publica como asset ligero

- **Estado:** propuesto
- **Fecha:** 2026-08-08
- **Fase:** D4-V (vídeo/captura guiada de la primera ola)

## Contexto

La primera ola ya tiene galería, comparador, ficha comercial y campaña de
muestra. Falta una pieza corta que pueda explicar el recorrido sin depender de
una demo en directo: creatividad → web/disponibilidad → reserva y recibo demo →
operación o recomendación explicable.

Playwright ya produce las capturas estáticas de Mar de Fondo. Antes de decidir
el formato se ensayó su grabación nativa con Chromium: el Chrome del sistema no
arrancó dentro del aislamiento y, con permiso, quedó bloqueado al cerrar el
vídeo; el Chromium empaquetado por Playwright sí generó y cerró un WebM de
1280×720 en una prueba acotada. `ffmpeg` 8 está disponible localmente y permite
convertirlo a un MP4 H.264 compatible y optimizado para descarga progresiva.

Una secuencia manual grabada con una herramienta de escritorio sería más rápida
una vez, pero perdería selectores, fechas, datos, duración y peso verificables.
Un editor o una plataforma de vídeo multiplicaría el mantenimiento sin aportar
al relato comercial.

## Decisión

1. Un script editorial de Playwright recorre el **bundle compuesto real** a
   1280×720 y graba una sola página durante 35–60 segundos. No intercepta ni
   maqueta pantallas: reutiliza el adaptador demo de reserva, los datos de Mar de
   Fondo y el escenario compartido del gestor.
2. El relato contiene cuatro capítulos: creatividad de búsqueda; disponibilidad
   y desglose; confirmación con pago simulado; planning y recomendación
   explicable. Las acciones externas, proveedores y cuentas inexistentes quedan
   fuera.
3. La fecha del navegador se fija durante la grabación en agosto de 2026, el año
   declarado por el fixture del tenant. Así la regeneración no depende del día
   en que se ejecute y sigue encontrando la temporada y las mismas tarifas.
4. Playwright produce un WebM temporal. `ffmpeg` lo normaliza a MP4 H.264,
   `yuv420p`, sin audio y con `faststart`; el script valida duración, resolución
   y un presupuesto máximo antes de reemplazar el asset publicado.
5. La landing ES/EN comparte exactamente el mismo metraje. Solo se localizan el
   cromo, la alternativa textual y dos pistas WebVTT; no se mantienen dos vídeos
   ni se incrusta texto comercial dentro de los fotogramas.
6. El `<video>` usa póster ya aprobado, controles nativos, `playsinline`, carga
   diferida mediante `preload="metadata"` y nunca `autoplay`. La alternativa
   textual conserva el recorrido aunque el visitante no reproduzca vídeo.
7. El generador es una herramienta editorial explícita, no parte del build
   normal. El build consume el MP4 versionado y falla si el recurso o sus pistas
   faltan.

## Tensiones resueltas por el equipo

- **Arquitectura / fullstack:** un script y una pieza sirven a toda la landing;
  no nace un pipeline, vídeo ni rama de código por camping. El bundle compuesto
  sigue siendo la fuente que se publica y la que se captura.
- **Backend:** el metraje usa únicamente adaptadores y fixtures demo existentes;
  no crea datos reales, credenciales, cobros ni rutas nuevas.
- **Frontend / UX:** el relato es corto, controlable y sin reproducción forzada;
  teclado, subtítulos y alternativa textual cubren reproducción y no reproducción.
- **Producto:** la pieza responde a una objeción concreta —entender el recorrido
  sin coordinar una demo— y no inventa métricas o integraciones.
- **UI:** el metraje conserva las dos marcas en su contexto real. El póster es
  una captura aprobada de Mar de Fondo y el contenedor se verifica a 1366/375.
- **SEO:** el MP4 carga bajo demanda, no interviene en el LCP y el texto indexable
  explica la pieza sin depender del vídeo.

## Consecuencias

- D4-V se puede cerrar con una pieza reproducible, enviable y honesta.
- Regenerarla exige tener Chromium de Playwright y `ffmpeg`; ambos son herramientas
  editoriales locales y no dependencias del Worker.
- El vídeo conserva UI española porque el escenario público de Mar de Fondo solo
  declara ese idioma. La landing inglesa lo contextualiza con pista inglesa y
  alternativa textual, sin fingir que el tenant ya dispone de una segunda versión.
- Si Playwright o `ffmpeg` dejan de estar disponibles, el MP4 versionado sigue
  publicándose; el fallback de mantenimiento es la secuencia de tres capturas ya
  aprobadas, no una integración externa.

## Validación

- Regeneración completa contra el bundle compuesto y comprobación con `ffprobe`:
  1280×720, 35–60 segundos, H.264, sin audio y dentro del presupuesto acordado.
- Pistas ES/EN válidas y alternativa textual equivalente a los cuatro capítulos.
- QA a 1366/375: póster y metadatos cargan, controles nativos, foco visible,
  `playsinline`, sin autoplay, sin desborde, peticiones fallidas ni recurso roto.
- Guardia de enlaces internos del bundle compuesto y `pnpm check` verdes o fallo
  ambiental documentado y revalidado en aislamiento.
