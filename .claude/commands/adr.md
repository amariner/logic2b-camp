---
description: Crea un ADR (Architecture Decision Record) para la fase actual y PARA a esperar validación
argument-hint: <título de la decisión>
---

Crea un ADR para: $ARGUMENTS

1. Determina el siguiente número NNNN mirando `docs/adr/`.
2. Crea `docs/adr/NNNN-<slug-del-titulo>.md` con esta plantilla:

```markdown
# NNNN — <Título>

- **Fecha**: <hoy>
- **Fase**: <fase del ROADMAP>
- **Estado**: propuesto | aceptado | reemplazado por NNNN

## Contexto

<Qué problema o decisión hay que tomar. Restricciones aplicables (recordar: ~6h/semana, nada que escale trabajo por cliente).>

## Decisión

<Qué se decide y su diseño concreto: tipos, contratos, estructura de ficheros si aplica.>

## Alternativas descartadas

<Cada una con el motivo en una línea.>

## Consecuencias

<Qué se gana, qué se compromete, qué habrá que vigilar.>
```

3. Rellénalo con la decisión de la fase actual, siendo concreto (tipos y contratos, no generalidades).
4. **PARA.** No escribas código hasta que el ADR esté validado por Andreu. Recuérdalo explícitamente al terminar.
