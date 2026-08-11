# Prompt para la siguiente sesión — continuar D6-V con Soldhivern

> Reescrito tras completar Camping La Ballena el 2026-08-11. El mandato
> vigente es terminar los temas pendientes por el orden del Frente D.

## Estado en una línea

El portfolio está en **11/12**: D5-V cerró en seis y D6-V ya aporta Serralta,
Entre Vinyes, Els Tarongers, La Carrasca y La Ballena. El único tema pendiente
es `soldhivern`.

## Evidencia de La Ballena

- Tenant tier 3 de 250 unidades y ruta `/demos/ballena/`.
- Verano por semanas con mínimo de siete noches y llegada/salida en sábado;
  señal simulada del 25 % y cancelación por tramos 21/8/0 días.
- Gestor reversible en `/demos/ballena/gestion/`, con prefijo `BL-26-`,
  planning y plano propios; tres olas de llegadas de sábado prueban ocupación
  al límite sin crear una integración real.
- Inventario de parcelas Orilla y Brisa, bungalow Ola y mobil-home Marea.
- Fotografía propia aprobada 10/10 más miniatura, OG y favicon.
- QA canónico de home y planning a 375/1366 px, `noindex` y consola limpia.

## Última vertical

Construir **Camping Soldhivern** con una identidad aún no cubierta por las once
demos ya navegables. Debe mantener el contrato de fábrica: brief, contenido,
fotografía propia, inventario/tarifas, escenario si el nivel lo requiere,
catálogo, bundle y QA, sin reutilizar activos ni abrir infraestructura nueva.

## Límites

- Una marca nueva no obtiene rama, backend, D1, Worker ni servicio propio.
- Fotos en lotes máximos de dos, inspección visual antes de avanzar y sin reutilizar
  activos entre tenants.
- Nada de deploy, DNS, secretos, proveedores de comunicación o cobro reales.
- `tmp/` pertenece al usuario y queda fuera del trabajo.

## Prompt

```text
terminar los temas pendientes
```
