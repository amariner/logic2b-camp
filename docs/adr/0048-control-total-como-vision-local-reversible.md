# 0048 — Control total se demuestra con estado local reversible

- **Estado:** aceptado por Andreu
- **Fecha:** 2026-08-14
- **Fase:** Frente F · F0

## Contexto

El gestor ya demuestra reservas, planning, pagos y recepción sobre datos reales
o fixtures tipados. Mar de Fondo añade Automatiza e Inteligente como prototipos
supervisados sin proveedor ni ejecución. La siguiente visión comercial quiere
enseñar limpieza, mantenimiento, relevo, grupos, control económico e
integraciones a un CEO o gerente antes de que exista un cliente que cierre sus
reglas operativas.

Construir ahora tablas, permisos, jobs o integraciones convertiría hipótesis en
arquitectura productiva y contradiría el mandato demo-first. Una maqueta estática,
en cambio, no permite entender cómo una incidencia atraviesa unidades, equipo y
turno.

## Decisión

`Control total` es una suite exclusiva del escenario Mar de Fondo y del plan
comercial Inteligente. Usa fixtures TypeScript, reducers puros y `localStorage`.
No añade tablas, migraciones, endpoints, usuarios, proveedores ni tráfico de red.

Tres recorridos son interactivos y comparten una sola historia del 7 de agosto
de 2026:

1. asignar, ejecutar y validar una limpieza con entrada el mismo día;
2. convertir un hallazgo en incidencia, bloquear la unidad y preparar una
   reasignación;
3. preparar el relevo y reconocerlo desde el turno siguiente.

Las demás familias son pantallas de escenario. Todas llevan un aviso persistente
de visión interactiva y un estado explícito: Disponible, Demo funcional,
Siguiente por validar o Visión futura.

`/automatiza` y `/inteligente` conservan sus URLs y se integran en la
subnavegación. El reset de Mar de Fondo borra también el estado de Control total.
Un build sin `VITE_DEMO_SCENARIO=mardefondo` no incluye sus páginas ni fixtures.

## Política de autonomía

La visión usa riesgo graduado. Acciones locales, reversibles y operativas pueden
automatizarse. Precios, cobros, reservas, bloqueos con impacto comercial,
mensajes sensibles y cambios de inventario requieren revisión o confirmación.
La demo puede marcar una acción como `prepared`; nunca afirma que se envió,
cobró, publicó o ejecutó en un sistema externo.

## Consecuencias

- El recorrido comercial es coherente sin fabricar garantías productivas.
- La arquitectura futura se documenta como provisional y exige un ADR nuevo al
  activarse con cliente real.
- El estado local debe validarse, recuperarse ante corrupción y ser totalmente
  reseteable.
- Las métricas son ficción identificada del escenario, no resultados de un
  camping real ni proyecciones comerciales.

## Pruebas de aceptación

1. Los reducers cubren los tres flujos y no admiten transiciones inválidas.
2. Una limpieza validada actualiza el Centro y el relevo; una incidencia bloqueada
   altera la preparación y el riesgo, no la base de datos.
3. Estado ausente, viejo o corrupto vuelve al fixture canónico.
4. El reset general elimina todas las claves locales de la suite.
5. Otros escenarios resuelven el módulo a `ScenarioUnavailable` y su entrada no
   contiene el código de Control total.
6. No aparece ninguna llamada `fetch`, binding, secreto o SDK externo en el
   grafo de la suite.

## Reversión

Retirar la ruta y su alias de build elimina la capacidad completa. No hay datos,
schema ni infraestructura que migrar o limpiar.
