# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito tras la sesión 101 (2026-08-08). La primera ola D0-V–D4-V está
> cerrada localmente y pendiente de publicación; D5-V requiere aprendizaje
> comercial real antes de crear una cuarta demo.

## Estado en una línea

La primera ola ya se puede navegar, enviar y explicar sin una demo en directo:
galería, comparador, ficha, campaña y captura guiada ES/EN están verificadas.

## Objetivo prioritario

1. Si el entorno local tiene credenciales de Cloudflare, publicar **el bundle
   demo existente** con `pnpm --filter @logic-camp/api deploy:demo` y verificar
   en producción landing ES/EN, vídeo, subtítulos y los tres saltos a demo a
   1366/375. No crear infraestructura ni un tenant nuevo.
2. Si no hay credenciales, no consumir la sesión reintentando el candado. Tomar
   el siguiente objetivo visible y local del backlog: **[C6] explicar los gestos
   del planning en la guía de recepción** mediante una pieza corta y accesible.
   Reutilizar el patrón de captura de ADR 0039 y el bundle/stub ya existente;
   mantener mover, estirar y crear como una sola historia acotada.
3. Para C6, escribir el contrato antes de grabar: recorrido determinista,
   duración y peso máximos, póster, controles, `playsinline`, sin autoplay,
   subtítulos o alternativa textual y verificación 1366/375 con teclado/foco.
4. Ejecutar `pnpm check`; si Workers vuelve a salir bajo concurrencia, revalidar
   únicamente los paquetes cancelados de forma aislada y registrar ambos
   resultados.

## Gate de expansión

- No abrir D5-V ni inventar otras tres marcas porque D4-V esté cerrado.
- Registrar antes una conversación, objeción o ICP real que las demos actuales
  no cubran. Cada nueva demo debe responder a esa evidencia y seguir sin rama ni
  backend propio.
- No crear D1, usuarios, email, pagos, cuentas publicitarias o integraciones por
  marca; la activación productiva sigue en el dossier interno.

## Ya terminado — no repetir

- D1-V L'Olivar, D2-V Pinada del Mar, D3-V Mar de Fondo y D4-V escaparate están
  cerrados.
- Mar de Fondo tiene 14/14 fotos, tres capturas firma, derivados, campaña y
  vídeo guiado aprobado.
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
