# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito tras la sesión 88 (2026-08-07). **D3-V está en curso**: web,
> reserva, operación y el primer prototipo Automatiza ya forman un recorrido
> local completo de Mar de Fondo.

## Estado en una línea

La primera ola tiene Inicio y Gestión terminadas; Visión ya demuestra escala y
revisión humana. El siguiente corte visible es **Inteligente explicable**: una
recomendación de ocupación con fuentes, incertidumbre y cambio solo preparado.

## Objetivo prioritario

1. Añadir a Mar de Fondo una ruta/pantalla Inteligente visible solo en su build.
2. Usar un fixture tipado de recomendación de ocupación/rentabilidad derivado
   del escenario: fuentes identificables, periodo, rango de confianza y límites.
3. Ofrecer «Descartar / Preparar cambio»; nunca cambiar tarifas, cupo o reservas.
   Rótulo exacto: **«Prototipo · no ejecuta cambios»**.
4. Hacer el estado local, reversible y cubierto por el reset común, igual que
   Automatiza. No crear endpoint, modelo, proveedor, D1 ni integración.
5. Verificar 375/1366, teclado/foco, persistencia/reset, cero desborde y bundle
   compuesto. Mantener `pnpm check` verde.

## Ya terminado — no repetir

- `tenants/mardefondo`: identidad, contenido, cuatro familias, 300 unidades,
  tarifas/extras y reserva local `MF-DEMO-001`.
- Gestor: 240 reservas, planning, ficha, búsquedas, llegada/cobro/devolución,
  plano propio y reset, todo local y sin `/api`.
- Automatiza: trigger de reseña → borrador editable → fuentes/límites →
  descartar o aprobar para dejar preparada. Nunca publica ni envía; estado
  persistente y reseteable; 5 tests de contrato.
- QA Automatiza 375/1366: cero desborde, objetivos móviles 44 px, foco devuelto,
  persistencia y reset en vivo. Bundle: 11.307 enlaces / 358 HTML;
  `pnpm check` 53/53.

## Cola visual

El manifiesto conserva 14 piezas en 7 tandas y **0/14 resultados**. En las
sesiones 86 y 88 el backend integrado de `imagegen` falló antes de producir
bytes al empezar `hero-laguna`; no se usó CLI/API ni otro proveedor. No repetir
el mismo intento en cada sesión: reanudar la pareja `hero-laguna` +
`hero-horizonte` cuando el backend integrado vuelva a estar disponible o exista
una instrucción explícita nueva, siempre máximo 2 e inspección antes del lote 2.

## Regla de alcance

- No crear D1, Worker, usuarios, email, pagos ni infraestructura por marca.
- Pago: «Pago simulado · no se ha realizado ningún cargo».
- Automatiza: «Prototipo supervisado».
- Inteligente: «Prototipo · no ejecuta cambios».
- Canales/fiscal/SES: «Roadmap sujeto a integración».

## Prompt

```text
continúa con el desarrollo de este proyecto
```
