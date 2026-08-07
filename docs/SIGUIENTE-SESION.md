# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito tras la sesión 99 (2026-08-08). D3-V está cerrado y D4-V ya tiene
> galería, comparador y ficha comercial bilingüe descargable.

## Estado en una línea

La primera ola ya se puede navegar y enviar en PDF; falta demostrar cómo una
campaña propia desemboca en reserva directa sin fingir cuentas publicitarias.

## Objetivo prioritario

1. Confirmar que los dos PDF de `output/pdf/` y `apps/site/public/` siguen
   presentes y que la landing los enlaza. No regenerarlos ni tocar fotografía si
   el contenido del portfolio no cambia.
2. Continuar D4-V con **una campaña de muestra acotada para Mar de Fondo**:
   anuncio de búsqueda, pieza display 300×250 y pieza de feed 1080×1080, todos
   derivados de fotografía aprobada y reunidos en una sección responsive de la
   landing.
3. El recorrido debe ser clicable y conservar una sola historia: creatividad de
   ejemplo → `/demos/mardefondo/` con UTM ficticias → disponibilidad/reserva demo.
   Rotular «creatividad de ejemplo» y «pago simulado» donde corresponda.
4. No usar logos ni cromo copiado de Google/Meta, abrir cuentas, instalar píxeles,
   inventar conversiones/ROAS o llamar a un proveedor. Son assets estáticos del
   repositorio; el argumento es canal propio y reserva directa, no una promesa de
   rendimiento.
5. Mantener ES/EN, teclado, foco, `prefers-reduced-motion`, cero desborde a
   1366/375 y enlaces verificables. Ejecutar `pnpm check`; si el tenant demo sale
   bajo concurrencia sin aserción, reejecutarlo aislado y documentar ambos
   resultados.

## Ya terminado — no repetir

- D1-V L'Olivar, D2-V Pinada del Mar y D3-V Mar de Fondo están cerrados.
- Mar de Fondo tiene 14/14 fotos, capturas firma y derivados aprobados.
- La landing incluye galería, comparador y descarga ES/EN de la ficha comercial.
- Los PDF son reproducibles desde el portfolio i18n, pesan 307 kB y contienen
  enlaces/QR; no crear otra fuente editorial ni otro formato en esta sesión.
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
