# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito tras la sesión 86 (2026-08-07). **D3-V está en curso**: Mar de
> Fondo ya llega desde disponibilidad hasta recibo DEMO, pero todavía no conecta
> esa reserva con la operación del gestor.

## Estado en una línea

La primera ola tiene Inicio y Gestión terminadas; Visión ya tiene web, catálogo
de 300 unidades y reserva local reversible. El siguiente corte es **operación a
escala: planning + plano + ficha + llegada/cobro**.

## Objetivo prioritario

Crear el escenario `mardefondo` del mismo dashboard Logic2B, sin copiar un
segundo producto ni tocar una D1:

1. generalizar el selector de escenarios que hoy está acoplado a Pinada;
2. dataset determinista de ~300 unidades y agosto denso, con al menos una unidad
   inactiva y una reserva firma coherente con `MF-DEMO-001`;
3. plano propio: laguna central, cuatro zonas, recepción/acceso y playa;
4. recorrido recibo → gestor → planning → ficha → plano → llegada/cobro, con
   reset visible y cero peticiones de red;
5. estados carga/error/vacío/solape, QA 375/1366 y bundle compuesto.

Solo después abrir los prototipos Automatiza e Inteligente.

## Ya terminado — no repetir

- `tenants/mardefondo`: config, tema, contenido, favicon, catálogo, 300 unidades,
  tarifas/extras y build `tier: 3` en `/demos/mardefondo/`.
- `bookingTransport: 'demo-session'`: disponibilidad, quote, hold, reserva,
  recibo, cambio y cancelación locales, derivados del catálogo y sin D1/API.
- Recorrido real a 375 px: 18–24 agosto → Bungalow Laguna → titular ficticio →
  `MF-DEMO-001`; sin desborde y con rótulo de pago simulado.
- `/temas` enlaza L'Olivar, Pinada y Mar de Fondo con estados honestos.
- Bundle compuesto: 11.283 enlaces / 357 HTML; portfolio 3/3.
- Política visual: mejor modelo integrado de Codex y tandas máximas de 2.
  Manifiesto Mar de Fondo: 14 piezas en 7 tandas.

## Cola visual

La primera tanda (`hero-laguna`, `hero-horizonte`) falló antes de generar por un
error de red del backend integrado de Codex. Estado: **0/14**. Reintentar esa
misma pareja cuando `imagegen` esté disponible, inspeccionarla y no lanzar la
siguiente hasta aprobar ambas. No usar CLI/API ni otro proveedor sin nueva
decisión explícita.

## Regla de alcance

- No crear D1, Worker, usuarios, email, pagos ni infraestructura por marca.
- No reutilizar fotos, contenido ni plano de Cala Sereno, L'Olivar o Pinada.
- Pago: «Pago simulado · no se ha realizado ningún cargo».
- Automatiza: «Prototipo supervisado».
- Inteligente: «Prototipo · no ejecuta cambios».
- Canales/fiscal/SES: «Roadmap sujeto a integración».

## Prompt

```text
continúa con el desarrollo de este proyecto
```
