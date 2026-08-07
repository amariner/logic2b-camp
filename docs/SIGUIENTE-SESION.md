# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito tras la sesión 90 (2026-08-07). **D3-V está en curso**: web,
> reserva, operación, Automatiza e Inteligente ya forman un recorrido local
> completo y honesto de Mar de Fondo.

## Estado en una línea

La primera ola tiene Inicio y Gestión terminadas; Visión ya demuestra escala,
revisión humana y recomendación explicable. El siguiente corte visible es el
**resumen de incidencias**, segundo fixture Automatiza comprometido en el
contrato visual.

## Objetivo prioritario

1. Añadir a Automatiza un resumen operativo de incidencias derivado del
   escenario Mar de Fondo, visible solo en su build y sin crear una pantalla de
   relleno si cabe con claridad en la ruta existente.
2. Usar un fixture tipado con periodo, agrupación, severidad, fuentes y límites;
   toda incidencia y persona deben ser ficticias y coherentes con el escenario.
3. Permitir revisar y preparar el resumen para entrega interna, pero nunca
   enviarlo, publicarlo ni abrir tickets externos. Mantener revisión humana y
   estados locales reversibles.
4. Integrarlo con el reset común y fijar con tests la derivación, los estados
   imposibles, el parseo fail-safe y la ausencia de red/proveedor.
5. Verificar 375/1366, teclado/foco, persistencia/reset, cero desborde y bundle
   compuesto. Mantener `pnpm check` verde.

## Ya terminado — no repetir

- `tenants/mardefondo`: identidad, contenido, cuatro familias, 300 unidades,
  tarifas/extras y reserva local `MF-DEMO-001`.
- Gestor: 240 reservas, planning, ficha, búsquedas, llegada/cobro/devolución,
  plano propio y reset, todo local y sin `/api`.
- Automatiza/reseña: borrador editable con fuentes y límites; descartar o
  aprobar solo lo deja preparado. Nunca publica ni envía.
- Inteligente: recomendación derivada de ocupación, periodo, fuentes, rango,
  confianza y límites; descartar o preparar nunca modifica tarifa, cupo o
  reserva. Seis tests y QA 375/1366.
- Bundle: 11.307 enlaces / 358 HTML; dashboard 29/29; `pnpm check` 53/53.
- Pipeline fotográfico resiliente (ADR 0035), ocho pruebas y primera pareja de
  Mar de Fondo aprobada. Codex integrado abrió circuito tras dos fallos y el
  resto del manifiesto usa Higgsfield con trazabilidad y revisión en staging.

## Cola visual

El manifiesto conserva 14 piezas en 7 tandas y **2/14 resultados aprobados**:
`hero-laguna` + `hero-horizonte`. El circuito de Codex está abierto y la
siguiente pareja (`parcela-atlantica` + `bungalow-laguna`) está lista para
`pnpm fotos -- run mardefondo`. Inspeccionar `.staging` y ejecutar `approve` o
`reject` antes de cualquier tanda posterior; nunca generar más de dos a ciegas.

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
