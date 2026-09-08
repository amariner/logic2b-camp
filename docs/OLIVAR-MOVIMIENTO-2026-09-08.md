# L'Olivar — primer tema con vídeo ambiental

> Corte histórico: la dirección visual y los medios vigentes se describen en
> [el rediseño 360](OLIVAR-REDISENO-360-2026-09-08.md), posterior a este corte.

Estado: integrado y verificado en local el 2026-09-08. Sin despliegue ni
modificación de datos remotos. Alcance autorizado: L'Olivar; las otras demos
conservan sus medios actuales.

## Resultado

La portada conserva la identidad del Maestrat y gana movimiento discreto en
las hojas y la lona. El titular se reduce a «Sombra de olivo. Noches frescas.»;
el contexto de las 18 parcelas y 4 tiendas pasa a una entradilla y se añade
«Encuentra tu bancal» junto a la consulta de fechas. Los campos de contenido
son opcionales y están disponibles en la fábrica compartida.

Las tres rutas tienen ahora imágenes distintas: el paseo corto conserva
`vida-entorno`, el sendero largo usa `vida-ruta-collado` y la visita local usa
`vida-ruta-obrador`. Las dos piezas nuevas se generaron con OpenAI integrado,
una por una, y entraron por `foto-pipeline ingest/approve`. Prompts completos
en `tenants/olivar/fotos.json`; procedencia y aprobación en `fotos.estado.json`.

## Vídeos entregados

| Salida     | Final local en `tenants/olivar/content/media/` | Dimensiones | Duración | Peso                       |
| ---------- | ---------------------------------------------- | ----------- | -------- | -------------------------- |
| Escritorio | `hero-motion.mp4`                              | 1280 × 720  | 6 s      | 1.804.586 bytes (1,72 MiB) |
| Móvil      | `hero-motion-mobile.mp4`                       | 720 × 1280  | 6 s      | 1.473.344 bytes (1,41 MiB) |

Seedance 2.0, modo estándar y sin audio. Un intento por salida; **54 créditos
según preflight (27 + 27)**, sin repeticiones. El saldo global cambia con otras
tareas de la cuenta y no se usa como prueba del coste de este par.

Se usó `hero-dia.webp` como primer y último fotograma de escritorio y
`hero-mobile.webp` en móvil. Los originales se normalizaron con `pnpm motion`
a H.264, yuv420p y faststart, y se inspeccionaron antes de aprobarlos. La tienda,
los muros y el encuadre se mantienen; la variación está en follaje, lona y
sombras. Planchas a 0, 1, 2, 3, 4, 5 y 5,95 s en `output/olivar-motion/`.
La procedencia, los prompts definitivos y las huellas SHA-256 están en
`tenants/olivar/movimiento.json`.

## Reproductor y contrato

- Botón localizado de pausa/reanudación, operable con teclado y de al menos
  44 px. La decisión de pausar permanece al cambiar las preferencias.
- Cero petición de vídeo con movimiento reducido, ahorro de datos o sin JS.
  El póster responsive y su preload siguen siendo el contenido inicial.
- Pausa cuando el héroe sale de pantalla o la pestaña queda oculta.
- Selección de una sola fuente por viewport y actualización al pasar entre
  escritorio y móvil sin recargar la página.
- Un `play()` pendiente no puede volver a mostrar vídeo tras una orden de
  pausa o una preferencia restrictiva.
- La evidencia móvil registra su póster vertical real; el verificador detecta
  una referencia equivocada. Antes el pipeline estampaba siempre el escritorio.
- CI instala FFmpeg. Turbo conserva los overrides `FFMPEG_PATH` y
  `FFPROBE_PATH` para instalaciones locales fuera de PATH.

## Verificación

- `pnpm check --concurrency=1`: **74/74 tareas**; tipos, lint, pruebas y builds.
  La primera ejecución detectó FFprobe fuera de PATH; en macOS se usó un
  wrapper local para las bibliotecas de Remotion antes de repetir el gate.
- Pruebas específicas de movimiento: **25/25**, incluidos nueve escenarios
  Chromium del componente real.
- Contrato de medios: **1 tenant activo, L'Olivar**, con ambos finales válidos.
- Build aislado: **13 HTML**. La fábrica sigue validando las 13 demos y el
  portfolio construye los 12 temas del catálogo.
- QA Chromium sobre el build final: **60 vistas** (12 páginas × 320, 375,
  430, 768 y 1366 px), sin overflow, imágenes rotas ni errores de consola/HTTP;
  tipografías de marca cargadas y un H1 por página.
- **Seis escenarios** sobre medios reales: reproducción y pausa por teclado,
  fuente móvil/escritorio y ausencia de descarga con preferencias restrictivas.
- Menú móvil, anclas y formulario demo verificados: confirmación visible y
  **cero solicitudes de envío**. Sin JS: póster visible y cero descargas de vídeo.

Informes y capturas locales: `output/olivar-motion/qa/`. Pruebas con tamaños
emulados en Chromium, no con dispositivos físicos. WebKit no se ejecutó porque
su binario no está instalado en este entorno. No se ha medido Lighthouse en
producción ni se ha publicado este corte.

## Revisión y continuación

Previsualización local preparada en `http://127.0.0.1:4328/demos/olivar/`.
Para reconstruirla:

```sh
TENANT=olivar BASE_PATH=/demos/olivar pnpm --filter @logic-camp/web exec astro build --outDir dist-capture/olivar
TENANT=olivar BASE_PATH=/demos/olivar pnpm --filter @logic-camp/web exec astro preview --host 127.0.0.1 --port 4328 --outDir dist-capture/olivar
```

La publicación del conjunto queda pendiente de una petición de despliegue.
Después, si se amplía el alcance, continúan Pinada del Mar y Mar de Fondo con
sus briefs propios; no hay que regenerar L'Olivar.
