---
title: Coordinar salidas y limpieza
description: Priorizar rotaciones, asignar equipo y validar una unidad antes de la siguiente entrada.
lang: es
orden: 2
updated: 2026-08-14
---

## La decisión

Una salida se convierte en prioridad cuando tiene una entrada próxima, poco margen o una condición especial. La demo propone BL-018: salida a las 10:22, nueva entrada a las 16:00 y 338 minutos de rotación.

## Flujo de demostración

**Detectada → Asignada → Lista → Validada**

1. Confirma la próxima entrada y el margen real.
2. Asigna BL-018 al Equipo 2. La asignación no envía una orden a ningún dispositivo.
3. Abre la previsualización móvil de 390 px y simula el checklist del equipo.
4. Marca la unidad lista desde la vista de trabajo.
5. Valida como gerente. Solo entonces el Centro reduce la alerta de preparación.

## Qué debería validar un cliente

- Qué reglas determinan prioridad y quién puede cambiarlas.
- Si el checklist varía por tipo de unidad.
- Qué evidencia exige una inspección y cuándo se reabre.
- Cómo se registran consumibles y tiempos sin convertir el trabajo en vigilancia.

## Automatización prudente

Calcular prioridad y proponer equipo son acciones reversibles. Validar una unidad, reabrirla o comprometer una hora de entrada exige una persona identificada y un historial de cambios.

La demo conserva el estado en este navegador y lo borra con el reset general de Mar de Fondo.
