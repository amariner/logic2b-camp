# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito tras la sesión 100 (2026-08-08). D4-V ya tiene galería, comparador,
> ficha comercial y campaña de muestra clicable; solo falta el vídeo.

## Estado en una línea

La primera ola ya se puede navegar, enviar y recorrer desde una creatividad; el
último hueco del escaparate es una captura guiada corta que lo explique sin una
demo en directo.

## Objetivo prioritario

1. Cerrar D4-V con **un vídeo/captura guiada reproducible y acotada** de la
   primera ola. Antes de elegir formato, comprobar localmente qué entrega estable
   ofrece Playwright/Chromium y dejar la decisión en ADR 0039 propuesto.
2. Contar una sola historia de 35–60 segundos: creatividad de ejemplo de Mar de
   Fondo → web/disponibilidad → reserva o recibo demo → planning o recomendación
   explicable. Reutilizar los recorridos y datos existentes; no grabar servicios,
   cuentas o acciones externas que no existen.
3. Publicar una pieza ligera con póster aprobado, controles nativos, `playsinline`,
   sin autoplay y con alternativa textual/subtítulos. La landing ES/EN debe
   compartir el mismo metraje y localizar únicamente cromo/copy.
4. No construir un editor, una plataforma de vídeo ni un pipeline general antes
   de probar una captura. Si MP4/WebM reproducible no es fiable en el entorno,
   elegir la alternativa más honesta y accesible (secuencia guiada de capturas)
   y documentar el descarte.
5. Verificar 1366/375, teclado, foco, movimiento reducido, peso, carga bajo
   demanda, cero desborde/imágenes o vídeo roto y enlaces del bundle compuesto.
   Ejecutar `pnpm check`; si el tenant demo vuelve a agotar `resolveId` bajo
   concurrencia, reejecutarlo aislado y documentar ambos resultados.

## Ya terminado — no repetir

- D1-V L'Olivar, D2-V Pinada del Mar y D3-V Mar de Fondo están cerrados.
- Mar de Fondo tiene 14/14 fotos, tres capturas firma y derivados aprobados.
- La landing incluye galería, comparador, ficha PDF ES/EN y campaña bilingüe con
  búsqueda, display 300×250 y feed 1080×1080.
- Las tres creatividades ya reutilizan una foto aprobada, llevan UTM ficticias y
  declaran que no existe cuenta, medición ni pago real. No crear más formatos sin
  evidencia comercial.
- No desplegar un tenant ni crear D1, usuarios, email, pagos o infraestructura
  por marca.

## Regla de alcance

- Campaña: «Creatividad de ejemplo · sin cuenta publicitaria ni medición real».
- Pago: «Pago simulado · no se ha realizado ningún cargo».
- Automatiza: «Prototipo supervisado».
- Inteligente: «Prototipo · no ejecuta cambios».
- Canales/fiscal/SES: «Roadmap sujeto a integración».

## Prompt

```text
continúa con el desarrollo de este proyecto
```
