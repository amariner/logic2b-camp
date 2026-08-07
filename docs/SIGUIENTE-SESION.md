# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito tras la sesión 87 (2026-08-07). **D3-V está en curso**: web,
> reserva y operación de Mar de Fondo ya forman un recorrido local completo.

## Estado en una línea

La primera ola tiene Inicio y Gestión terminadas; Visión ya demuestra reserva,
300 unidades, planning, plano, ficha, llegada y cobro. El siguiente corte es
**materia visual propia y, si el generador sigue bloqueado, Automatiza
supervisado**.

## Objetivo prioritario

1. Reintentar con `imagegen` únicamente la pareja `hero-laguna` +
   `hero-horizonte`, usando el mejor modelo integrado de Codex.
2. Inspeccionar las dos piezas antes de lanzar nada más; si se aprueban,
   continuar siempre en tandas máximas de 2 siguiendo `fotos.json`.
3. Incorporar solo resultados aprobados al tenant, generar derivados de marca y
   comprobar que ningún activo procede de Cala, L'Olivar o Pinada.
4. Si `imagegen` vuelve a fallar antes de producir bytes, registrar el bloqueo
   una sola vez y avanzar con el primer prototipo **Automatiza · supervisado**:
   recomendación explicable, revisión humana y ninguna ejecución automática.
5. Mantener QA 375/1366, bundle compuesto y cero `/api` en Mar de Fondo.

## Ya terminado — no repetir

- `tenants/mardefondo`: identidad, contenido, cuatro familias, 300 unidades,
  tarifas/extras y reserva local `MF-DEMO-001`.
- Gestor bajo `/demos/mardefondo/gestion/`: selector común, 240 reservas sin
  solapes, una unidad inactiva, planning, ficha, búsquedas, llegada/cobro,
  devolución, log de pagos, plano propio y reset.
- Handoff web→gestor por estado local compartido; no hay D1, API, proveedor,
  credenciales ni mensajes.
- QA real 375/1366: 308 textos SVG, cero desborde y cero errores. Bundle:
  11.307 enlaces / 358 HTML; `pnpm check` 53/53.
- Política visual: mejor modelo integrado de Codex, máximo dos imágenes por
  tanda e inspección de cada pareja.

## Cola visual

El manifiesto contiene 14 piezas en 7 tandas. La primera pareja
(`hero-laguna`, `hero-horizonte`) falló antes de generar por error de red del
backend integrado. Estado real: **0/14**. No usar CLI/API ni otro proveedor sin
nueva decisión explícita.

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
