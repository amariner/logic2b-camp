# 0040 — El vídeo de gestos documenta el planning sin confirmar un alta

- **Estado:** propuesto
- **Fecha:** 2026-08-08
- **Fase:** C6 (documentación · vídeo de gestos del planning)

## Contexto

La guía de recepción explica cómo mover una estancia, estirarla y crear una
reserva arrastrando sobre el planning, pero la operación más visual del producto
solo se describe con texto. ADR 0039 ya demostró que Playwright y `ffmpeg`
permiten publicar una captura reproducible, ligera y sin una herramienta de
edición general.

El gestor de Mar de Fondo contiene un escenario determinista con el mismo
planning real, 300 unidades y mutaciones locales reversibles. El alta de una
reserva, en cambio, no forma parte de las operaciones que la pieza debe
confirmar: el gesto puede precargar tipo, unidad y fechas sin fingir que se ha
creado una estancia.

## Decisión

1. Una única captura de **1280×720** muestra tres gestos, en este orden:
   mover una estancia un día, estirar su salida un día y seleccionar fechas en
   una fila libre para abrir el alta precargada.
2. El recorrido usa el bundle compuesto y el escenario local de Mar de Fondo.
   Fija el reloj en agosto de 2026, limpia solo las claves de estado de ese
   escenario y trabaja con la reserva firma `MF-DEMO-001`.
3. Mover se confirma porque el adaptador demo soporta esa mutación. Estirar
   enseña primero el recálculo del servidor y se confirma dentro del mismo
   escenario reversible. El alta termina con el formulario abierto y sus datos
   precargados; **no pulsa «Crear la reserva»**.
4. Playwright produce un WebM temporal y un póster del estado inicial. `ffmpeg`
   normaliza el vídeo a MP4 H.264, `yuv420p`, sin audio y con `faststart`.
5. El contrato de salida es **20–35 segundos** y **máximo 2 MB**. El póster WebP
   conserva 1280×720 y no supera 350 kB. Solo se reemplazan los assets públicos
   después de validar todas las guardas.
6. La guía `/docs/recepcion/mover/` integra la pieza con controles nativos,
   `playsinline`, `preload="metadata"`, sin autoplay, una pista descriptiva y
   una alternativa textual equivalente a los tres gestos.
7. El generador sigue siendo una herramienta editorial explícita. No entra en
   el build normal ni se convierte en un pipeline de vídeo para cada pantalla.

## Consecuencias

- La operación firma se entiende sin coordinar una demo en directo.
- El metraje no crea datos reales, no toca D1 y no necesita credenciales.
- La captura no promete que un visitante anónimo pueda confirmar altas.
- Regenerar exige un bundle compuesto actual, Chromium de Playwright y
  `ffmpeg`; el MP4 versionado continúa publicándose aunque esas herramientas no
  estén presentes en un build posterior.

## Validación

- `ffprobe`: H.264, 1280×720, sin pista de audio, 20–35 segundos y ≤2 MB.
- Póster: WebP 1280×720 y ≤350 kB; VTT con los tres capítulos.
- Guía a 1366 y 375 px: vídeo en pausa, controles, `playsinline`, metadatos,
  foco visible, alternativa textual, cero desborde y cero recursos fallidos.
- Build y typecheck del sitio; `pnpm check` o revalidación aislada de cualquier
  paquete cancelado por el fallo ambiental conocido de Workers.
