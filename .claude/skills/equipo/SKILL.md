---
name: equipo
description: Pasa una decisión, un diseño o un diff por las ocho lentes del equipo (arquitecto, fullstack, backend, frontend, product, UX, UI, SEO) definidas en docs/EQUIPO.md y saca los conflictos a la superficie. Úsalo antes de cerrar una funcionalidad, al escribir un ADR, o al revisar un cambio.
---

# Pase de revisión del equipo

Fuente de verdad: **`docs/EQUIPO.md`**. Léelo si no está ya en contexto — define los
ocho roles, sus vetos, el desempate y el checklist. Este skill es el procedimiento
para aplicarlo a un objeto concreto (una decisión, un diseño, un diff o un ADR).

## Procedimiento

1. **Identifica el objeto** a revisar (qué decisión/cambio) y qué superficie toca
   (motor, API, dashboard, web pública, docs, infra). Eso determina qué lentes aplican.

2. **Pasa por cada rol que aplique** (no fuerces los que no tocan). Para cada uno:
   - ¿Qué le importa aquí en concreto?
   - ¿Tiene algo que objetar, o **veta** según su criterio de `docs/EQUIPO.md`?
   - Sé específico: tipos, rutas, tokens, invariantes — no generalidades.

3. **Saca los conflictos**. Cuando dos roles chocan, resuélvelos con el orden de
   desempate de `docs/EQUIPO.md`:
   1. Regla de oro: nada que multiplique trabajo por camping.
   2. ¿Qué necesita un camping real para operar en agosto?
   3. La página publicada es la especificación (ADR 0026).
   4. Empate real → ADR y parar a validar con Andreu.

4. **Cierra con el checklist operativo** de `docs/EQUIPO.md` (marca lo que aplica y su
   estado). Si algo falla y aplica, **bloquea** — dilo, no lo entierres.

## Salida

Un resumen breve, por rol que aplique (una o dos frases), los conflictos y su
resolución, y el veredicto: **listo / bloqueado por X / necesita ADR**. Si el objeto
era un diseño o decisión aún no implementada y algún rol veta, propón el ajuste.

No inventes hallazgos para rellenar los ocho roles: si una lente no tiene nada
sustantivo que decir sobre este objeto, dilo en una línea y sigue.
