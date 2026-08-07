# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito tras la sesión 91 (2026-08-07). **D3-V está en curso**: el recorrido
> funcional de Mar de Fondo ya cubre web, reserva, operación, Automatiza e
> Inteligente. La cola visible vuelve a ser la fotografía propia.

## Estado en una línea

La primera ola tiene Inicio y Gestión terminadas; Visión ya demuestra escala,
supervisión y recomendación explicable. Faltan doce piezas fotográficas y el QA
final que convierta ese recorrido en material de venta.

## Objetivo prioritario

1. Consultar `pnpm fotos -- status mardefondo` y reanudar **solo** la siguiente
   pareja activa: `parcela-atlantica` + `bungalow-laguna`.
2. Mantener el circuito abierto registrado: Codex integrado ya agotó sus dos
   intentos técnicos para este manifiesto; el pipeline debe usar el fallback
   explícito de Higgsfield sin reescribir ni ocultar el historial.
3. Inspeccionar ambas piezas juntas en `.staging`: geografía/luz coherentes,
   alojamiento posible, sin texto, marcas, matrículas o rostros reconocibles.
4. Aprobar solo las piezas válidas. Si una falla, rechazarla con motivo concreto
   y reintentar únicamente esa pieza; nunca avanzar a otra tanda con la pareja
   pendiente ni generar más de dos a ciegas.
5. Verificar estado, derivados y build de Mar de Fondo; mantener `pnpm check`
   verde. Actualizar PROGRESS/BACKLOG/SIGUIENTE y el registro del manifiesto.

## Ya terminado — no repetir

- `tenants/mardefondo`: identidad, contenido, cuatro familias, 300 unidades,
  tarifas/extras y reserva local `MF-DEMO-001`.
- Gestor: 240 reservas, planning, ficha, búsquedas, llegada/cobro/devolución,
  plano propio y reset, todo local y sin `/api`.
- Automatiza: respuesta a reseña y parte de tres incidencias con fuentes,
  límites, revisión, descarte y preparación local. Nunca publica, entrega ni
  abre tickets.
- Inteligente: recomendación derivada de ocupación con periodo, fuentes, rango,
  confianza y límites. Nunca modifica tarifa, cupo ni reserva.
- Bundle: 11.307 enlaces / 358 HTML; dashboard 34/34; `pnpm check` 53/53.
- Pipeline fotográfico resiliente (ADR 0035), ocho pruebas y primera pareja de
  Mar de Fondo aprobada.

## Cola visual

El manifiesto conserva 14 piezas en 7 tandas y **2/14 resultados aprobados**:
`hero-laguna` + `hero-horizonte`. El circuito de Codex está abierto y la
siguiente pareja (`parcela-atlantica` + `bungalow-laguna`) está lista para
`pnpm fotos -- run mardefondo`. Inspeccionar `.staging` y ejecutar `approve` o
`reject` antes de cualquier tanda posterior.

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
