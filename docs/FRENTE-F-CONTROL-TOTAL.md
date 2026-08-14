# FRENTE F — Inteligente · Control total

> Aprobado por Andreu el 2026-08-14. El orden previsto sitúa este frente después
> de H0–H3. Al quedar H1 bloqueado por el servicio externo de generación, F0–F7
> avanzan como candidato local independiente sin declarar H1–H3 terminados.
> Amplía únicamente la visión comercial de Mar de Fondo y no activa producto,
> proveedor ni infraestructura real.

## 1. Promesa

**Inteligente** es el último plan y el que lo reúne todo. Su promesa es que una
persona responsable pueda saber qué ocurre hoy, detectar qué amenaza las
entradas, los ingresos o el servicio y preparar la siguiente acción desde un
solo lugar. El precio pasa a ser **a medida**.

La suite es exclusiva de Inteligente. Inicio, Gestión y Automatiza conservan su
alcance. Logic2B no se convierte en un ERP de nóminas, contabilidad o compras:
coordina trabajo, consumos y costes operativos y prepara integraciones.

## 2. Ocho familias

1. Centro de operaciones.
2. Limpieza y preparación.
3. Mantenimiento y activos.
4. Equipo y turnos.
5. Huésped y comunicación.
6. Reservas y grupos.
7. Ingresos, caja y consumos.
8. Inteligencia e integraciones.

El catálogo interno contiene 56 capacidades. La wiki pública selecciona 18 y
las organiza por decisiones del día, no por módulos.

## 3. Estados comunes

| Estado | Significado | Evidencia mínima |
| --- | --- | --- |
| Disponible | Existe en el producto común | Código, test y recorrido actual |
| Demo funcional | Interacción local reversible | Fixture tipado, reducer y QA |
| Siguiente por validar | Prioridad tras los tres flujos | Problema, usuario y gate definidos |
| Visión futura | Hipótesis útil sin compromiso | Ficha completa y activador explícito |

Ninguna pantalla puede inferir el estado por color solamente. El rótulo aparece
en la suite, la página comercial, la wiki y la ficha interna.

## 4. Historia ancla

Mar de Fondo, 7 de agosto de 2026, 300 unidades. El gerente abre Control total,
prioriza una limpieza con entrada hoy, observa cómo el equipo la completa desde
una vista móvil, valida la unidad y atiende otra avería que obliga a bloquear y
preparar una reasignación. Al final revisa el relevo agregado y el turno siguiente
confirma que lo ha leído.

El escenario hereda reservas, BL-042 fuera de servicio, pico de llegadas, cobros
pendientes y recomendación de ocupación existentes. No nace un segundo reloj ni
un dataset contradictorio.

## 5. Navegación y superficies

La barra lateral añade un único acceso `Control total`. La suite incorpora una
subnavegación con ocho destinos. `/automatiza` y `/inteligente` mantienen URL y
entran en el mismo shell.

La página pública `/inteligente/` explica las ocho familias, precio a medida y
dos salidas: ver la visión en Mar de Fondo y diseñar una propuesta con Logic2B.
La quinta guía pública, `Dirección`, se publica en español e inglés con siete
decisiones: abrir el día, coordinar salidas, resolver incidencias, cuidar
huéspedes/grupos, controlar ingresos, entregar turno y preparar mañana.

## 6. Fases

- **F0 · contrato:** ADR, catálogo, arquitectura provisional, estados y precio.
- **F1 · relato:** página Inteligente, guía Dirección y visualizaciones.
- **F2 · centro:** fixture compartido, shell, subnavegación, reset y Centro.
- **F3 · limpieza:** asignar → móvil → lista → validar.
- **F4 · incidencia:** detectar → valorar → bloquear → preparar reasignación.
- **F5 · relevo:** agregar → revisar → preparar → reconocer.
- **F6 · amplitud:** cinco pantallas de escenario e integración de Automatiza e
  Inteligente.
- **F7 · cierre:** precios, portfolio, demo script, capturas, ayudas y QA.

Tras F5, el orden de validación futura es Huésped/grupos → Control económico →
Instalaciones → inteligencia e integraciones reales.

## 7. Definición de terminado

- Tres flujos completos, coherentes entre sí y reversibles.
- Ocho pantallas accesibles solo en Mar de Fondo.
- Banner y badge de madurez en todas las superficies conceptuales.
- Vista móvil real y previsualización de 390 px para equipo.
- Página comercial y 14 páginas de Dirección (7 ES + 7 EN).
- 56 fichas internas, 18 capacidades públicas y tres diagramas de flujo.
- Cero API, D1, proveedor, PII real o ejecución externa.
- QA 320/375/430/1366, teclado, foco, contraste, reduced motion y consola.
- `pnpm check` y QA canónico verdes; candidato sin desplegar.

## 8. Gates de producto real

Antes de convertir una familia en producto: camping identificado, proceso
observado, responsable, métrica, política de permisos/retención, integración o
dispositivo real cuando aplique, ADR aceptado, prueba de reversión y aceptación
del cliente. La arquitectura de `ARQUITECTURA-INTELIGENTE-PROVISIONAL.md` es una
hipótesis de partida, nunca autorización de implementación.
