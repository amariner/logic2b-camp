# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito tras la sesión 98 (2026-08-07). **D3-V está cerrado** con 14/14
> fotografías aprobadas. D4-V continúa tras publicar la galería y el comparador
> de las tres demos.

## Estado en una línea

La primera ola ya tiene tres demos navegables y completas; falta convertir el
escaparate en una pieza comercial que Andreu pueda enviar o usar en campaña.

## Objetivo prioritario

1. Confirmar `pnpm fotos -- status mardefondo`: debe indicar 14/14 y cola
   completa. No regenerar fotografía ni derivados si sus fuentes no cambian.
2. Continuar D4-V con **una ficha comercial descargable de la primera ola**,
   reutilizando la galería, el comparador, las tres miniaturas y las capturas ya
   aprobadas. Debe explicar Inicio / Gestión / Visión por resultado, recorrido y
   tamaño, no como inventario técnico.
3. Mantener el documento honesto: demos y datos ficticios rotulados; Automatiza
   e Inteligente como prototipos supervisados; nada de logos de clientes reales,
   métricas inventadas, cuentas publicitarias, píxeles o proveedores externos.
4. Preferir una salida reproducible desde el repositorio y enlazable desde la
   landing. Si el formato abre una fase o una dependencia nueva, escribir el ADR
   propuesto antes del código y mantener el cambio reversible.
5. Verificar a 1366/375, enlaces internos, peso de recursos y descarga; ejecutar
   `pnpm check`. Si reaparece el timeout de API bajo concurrencia, reejecutar la
   suite aislada y documentar ambos resultados.

## Ya terminado — no repetir

- D1-V L'Olivar, D2-V Pinada del Mar y D3-V Mar de Fondo están cerrados.
- Mar de Fondo: 14/14 fotos aprobadas, `.staging` vacío, tres capturas firma,
  miniatura/OG/icono reproducibles y build específico verde.
- La landing ya incluye galería y comparador bilingüe con enlaces a cada web y
  momento firma (ADR 0036, D4-V parcial).
- No desplegar un tenant ni crear D1, usuarios, email, pagos o infraestructura
  por marca.

## Regla de alcance

- Pago: «Pago simulado · no se ha realizado ningún cargo».
- Automatiza: «Prototipo supervisado».
- Inteligente: «Prototipo · no ejecuta cambios».
- Canales/fiscal/SES: «Roadmap sujeto a integración».

## Prompt

```text
continúa con el desarrollo de este proyecto
```
