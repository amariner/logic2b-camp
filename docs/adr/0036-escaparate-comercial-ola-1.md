# 0036 — La primera ola se compara desde la landing

- **Estado:** propuesto
- **Fecha:** 2026-08-07
- **Fase:** D4-V (parcial: galería y comparador)

## Contexto

L'Olivar, Pinada del Mar y Mar de Fondo ya tienen rutas navegables, miniatura
propia y un recorrido comercial distinto. La landing, sin embargo, todavía
enseña direcciones visuales como una cinta de temas y obliga a conocer las URLs
para comparar las tres demos. La pieza que debía convertir «escalable» en
evidencia seguía cerrada hasta tener tres destinos clicables; ese umbral ya se
cumple.

La producción fotográfica de Mar de Fondo continúa abierta y el generador está
fallando por red. La galería no debe depender de completar ese lote: la
miniatura aprobada ya existe y es el contrato de entrada al portfolio.

## Decisión

1. La landing gana una sección `#demos` con las tres anclas de la ola 1. Cada
   tarjeta enseña identidad, tamaño, nivel, resultado, recorrido y dos enlaces:
   entrada a la web pública y momento firma.
2. Debajo se presenta un comparador por resultados —captación, operación,
   automatización y decisión—, no una matriz técnica ni una lista de features.
3. Las imágenes se importan directamente desde
   `tenants/{slug}/content/media/miniatura.webp`. El sitio comercial no crea
   copias manuales ni usa las fotografías de Cala Sereno o de una propuesta
   distinta.
4. Los tres destinos se etiquetan como demostraciones ficticias. Inicio,
   Gestión y Visión describen el alcance visible; no afirman que pagos,
   comunicaciones o IA estén conectados en producción.
5. La galería es HTML estático, sin isla ni API. En móvil las tarjetas se
   apilan y el comparador se convierte en tres fichas verticales; no se obliga
   a desplazar una tabla ancha.
6. D4-V queda **parcial**: campaña de muestra, ficha comercial descargable y
   vídeo continúan en backlog. D3-V tampoco se cierra: conserva sus seis fotos
   y QA final pendientes.

## Consecuencias

- La landing ya demuestra tres escalones sobre el mismo producto y permite
  elegir la demo más parecida al camping del prospecto.
- La miniatura de cada tenant pasa a tener un consumidor real. Cambiarla
  actualiza el escaparate en el siguiente build sin sincronización manual.
- `apps/site` depende deliberadamente de esos tres activos fuente. Un build
  roto o una miniatura ausente falla antes de publicar.
- Abrir la ola 2 exigirá ampliar un dato y un activo, no duplicar el componente.

## Validación

- Build compuesto y guardia de enlaces internos verdes.
- Las seis entradas (web y momento firma) resuelven dentro del bundle.
- QA a 1366 y 375 px: sin desborde de página, imágenes rotas ni errores de
  consola; teclado y foco visibles en enlaces.
- `prefers-reduced-motion` no cambia el acceso al contenido.
