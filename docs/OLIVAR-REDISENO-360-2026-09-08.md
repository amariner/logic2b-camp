# L’Olivar — rediseño outdoor, humano y solo acampada

Encargo directo de Andreu, 2026-09-08, a partir de tres referencias visuales.
Sustituye la dirección del primer vídeo ambiental del mismo día. El informe
`OLIVAR-MOVIMIENTO-2026-09-08.md` describe ese corte anterior; los originales
quedan conservados en `output/olivar-360/previous-motion/`.

## Dirección y recorrido

De la primera referencia se toma la cabecera fotográfica amplia, los márgenes
abiertos y las imágenes escalonadas. De la segunda, la claridad de una revista
outdoor y la tipografía grande. De la tercera, la presencia humana, la variedad
de composiciones y el contraste entre oliva, crema, naranja y un cierre oscuro.
La oferta corresponde siempre a un camping pequeño para tiendas propias.

La portada presenta el lugar, la vida común, dos tamaños de parcela, cuatro
servicios esenciales, una escena al atardecer, tres paseos, preguntas frecuentes
y una consulta de fechas. Las fichas, tarifas, navegación, contacto y portfolio
se alinean con esa historia: 16 parcelas de 70 m² y 6 de 100 m², todas con dos
personas incluidas en la tarifa base. Se conservan las claves históricas para
mantener las URLs. La electricidad y otros suplementos siguen desglosados.

`presentation: 'outdoor'` es una opción del contrato común (ADR 0051). Los
componentes consumen textos, fotos y datos declarados por el tenant. La home
clásica sigue disponible para las otras demos. Las galerías explícitas del
catálogo tienen prioridad sobre fotos genéricas, evitando interiores de camas
en una ficha de parcela. Los grupos sin tipos no se muestran.

## Medios

Seis imágenes nuevas, revisadas una por una e incorporadas por `foto-pipeline ingest/approve`:

- `hero-humano`: vecinos conversando, familia en el camino y parcelas separadas.
- `hero-humano-mobile`: composición vertical propia de la misma escena.
- `parcela-viva`: pareja, tienda propia, lectura y café.
- `parcela-familia`: tienda familiar y una partida de cartas.
- `vida-mesa-comun`: mesa compartida junto a una cocina sencilla.
- `vida-atardecer`: vecinos, lámparas de camping y final del día.

Los cuatro primeros fotogramas usan OpenAI integrado. Las dos escenas finales
se completan con Nano Banana Pro en Higgsfield tras fallos de conexión del
generador integrado y un fallo del trabajo GPT Image 2 en Higgsfield. Los
intentos fallidos quedan registrados, sin atribuirles una imagen entregada.

Prompts y procedencia: `tenants/olivar/fotos.json` y `fotos.estado.json`.
Miniatura, Open Graph e icono derivados de la nueva cabecera.

Dos vídeos nuevos Seedance 2.0, 6 segundos sin audio, en 16:9 y 9:16, usando
el póster de cada formato como imagen inicial y final. Inspección de siete
momentos por clip antes de aprobar; salida normalizada H.264/yuv420p/faststart.
El móvil superó inicialmente el límite de 1,5 MiB; se volvió a normalizar el
original con CRF 27 (manteniendo resolución y contrato) y quedó en 1.029.988
bytes. El 2026-09-09 se sustituyó solo la salida de escritorio, después de una
revisión visual: las personas del camino hacen un giro breve y la brisa mueve
con más claridad las ramas finas, manteniendo el plano fijo y el cierre en
bucle. La variante final de escritorio pesa 2.064.460 bytes; la nueva
generación consumió 27 créditos. El móvil no cambió.
Los prompts, fechas y huellas del par vigente están en `movimiento.json`.
Los controles y reglas de carga del primer corte se mantienen: pausa accesible,
pausa fuera de pantalla, selección responsive y cero vídeo con movimiento
reducido, ahorro de datos o JavaScript desactivado.

## Revisión local

Previsualización: http://127.0.0.1:4328/demos/olivar/

```sh
TENANT=olivar BASE_PATH=/demos/olivar pnpm --filter @logic-camp/web exec astro build --outDir dist-capture/olivar
TENANT=olivar BASE_PATH=/demos/olivar pnpm --filter @logic-camp/web exec astro preview --host 127.0.0.1 --port 4328 --outDir dist-capture/olivar
```

Pruebas y capturas de este corte en `output/olivar-360/`. El formulario continúa
siendo una demostración sin envío ni persistencia. Sin despliegue ni cambios
remotos.

## Verificación del corte final

- `pnpm check --concurrency=1`: 74/74 tareas correctas (tipos, lint, pruebas
  y builds). La primera pasada detectó la foto aún pendiente; el gate final
  se repitió con todos los medios definitivos y pasó completo.
- Build aislado de L’Olivar: 13 páginas HTML.
- QA Chromium: 60 vistas, doce páginas en 320, 375, 430, 768 y 1366 px.
  Sin overflow, imágenes rotas, fallos HTTP ni errores de página. Un H1 por
  página, tipografías cargadas y titulares libres de la cabecera fija.
- Seis escenarios de medios reales: escritorio/móvil con reproducción normal,
  movimiento reducido y ahorro de datos. Una sola fuente cuando corresponde;
  cero descarga en los dos modos restrictivos. Pausa por teclado y reanudación.
- Menú móvil, anclas, acordeón accesible y consulta demo con cero solicitudes
  de envío. Sin JS: póster y preguntas operativos, sin descargar vídeo.
- Inventario fotográfico: 21/21 piezas locales, todas aprobadas, incluidas las
  seis del rediseño. Contrato de movimiento correcto en las dos salidas.

La QA se ejecutó en Chromium con tamaños emulados. No se ha medido Lighthouse
contra producción ni validado este corte en dispositivos físicos o WebKit.
