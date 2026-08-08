# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito tras la sesión 103 (2026-08-08). La primera ola D0-V–D4-V y las
> imágenes propias del catálogo están publicadas en producción; D5-V requiere
> aprendizaje comercial real antes de crear una cuarta demo.

## Estado en una línea

La primera ola ya se puede navegar, enviar y explicar desde producción; el
siguiente hueco visible es enseñar en movimiento los tres gestos firma del
planning dentro de la guía de recepción.

## Objetivo prioritario

1. Cerrar el pendiente **[C6] vídeo de gestos del planning** con una sola pieza
   corta y accesible que muestre mover, estirar y crear arrastrando. Reutilizar
   el patrón acotado de ADR 0039 y el bundle/stub de C1/C5; no construir un
   editor ni un pipeline general.
2. Escribir el contrato antes de grabar: recorrido y datos deterministas,
   resolución **1280×720**, duración objetivo **20–35 s**, H.264 sin audio y peso
   máximo **2 MB**. La captura debe terminar antes de confirmar una mutación si
   el rol demo no la autoriza; no fingir permisos ni resultados.
3. Integrar el mismo metraje en la guía `/docs/recepcion/mover/`, con póster,
   controles, `playsinline`, sin autoplay, carga bajo demanda y alternativa
   textual. Enlazar desde `nueva-reserva` si aporta contexto, sin duplicar el
   archivo ni convertir toda la documentación en vídeo.
4. Verificar la guía a 1366/375 con teclado, foco, movimiento reducido, peso,
   vídeo e imágenes cargados y cero desborde. Ejecutar `pnpm check`; si Workers
   vuelve a salir bajo concurrencia, revalidar solo los paquetes cancelados y
   registrar ambos resultados.

## Gate de expansión

- No abrir D5-V ni inventar otras tres marcas porque D4-V esté cerrado.
- No convertir Montaña, Familiar o Parcela en páginas/demos por el mero hecho de
  que ya tengan imagen: siguen siendo direcciones visuales rotuladas como
  concepto.
- Registrar antes una conversación, objeción o ICP real que las demos actuales
  no cubran. Cada nueva demo debe responder a esa evidencia y seguir sin rama ni
  backend propio.
- No crear D1, usuarios, email, pagos, cuentas publicitarias o integraciones por
  marca; la activación productiva sigue en el dossier interno.

## Ya terminado — no repetir

- El bundle completo está publicado como Worker
  `87d60d0a-b4bc-4f4a-8bf5-5d2b85b221e7`; no repetir un deploy sin cambios.
- D1-V L'Olivar, D2-V Pinada del Mar, D3-V Mar de Fondo y D4-V escaparate están
  cerrados.
- Mar de Fondo tiene 14/14 fotos, tres capturas firma, derivados, campaña y
  vídeo guiado aprobado.
- El catálogo de temas tiene imágenes locales propias para Montaña, Familiar y
  Parcela; no volver a generar ni reutilizar Azahar para esas tres tarjetas.
- El vídeo de 38,9 s comparte metraje en ES/EN y ya incluye controles, póster,
  subtítulos y transcripción; no crear más formatos sin una necesidad concreta.
- La landing incluye galería, comparador y ficha PDF ES/EN desde la misma fuente
  de portfolio.

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
