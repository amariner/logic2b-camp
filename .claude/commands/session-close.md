---
description: Cierra la sesión de trabajo actualizando PROGRESS.md con estado y siguiente paso
---

Cierra la sesión de trabajo de Logic Camp:

1. Ejecuta `pnpm check` si hay código en el repo. Si falla, NO cierres: arregla o documenta explícitamente el rojo en PROGRESS.md.
2. Actualiza `PROGRESS.md`:
   - Añade la entrada de esta sesión con la plantilla del fichero (hecho, sin terminar, decisiones/ADRs, siguiente paso, estado de `/check`).
   - Actualiza el bloque "Estado actual": fase, último check, **siguiente paso concreto y accionable** (la próxima sesión empieza leyéndolo).
3. Mueve cualquier idea fuera de fase que haya surgido a `docs/BACKLOG.md`.
4. Si hay repo git: propón un commit pequeño con contexto (no lo hagas sin confirmación).
5. Resume en 5 líneas máximo: qué se hizo, qué queda, dónde retomar.
