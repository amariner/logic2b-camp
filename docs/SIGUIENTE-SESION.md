# Prompt para la siguiente sesión — objetivo duradero en R5

> Reescrito tras la sesión 106 (2026-08-10). R0–R4 están cerrados; producción
> sigue requiriendo autorización explícita.

## Estado en una línea

Los contratos actuales de API ya fallan cerrados; el siguiente trabajo seguro
es revisar motor, seed y coherencia de datos visibles sin perfeccionar casos que
la demo no enseña.

## Objetivo prioritario

Cerrar **R5 · Motor, seed y datos creíbles** de
`docs/RUTA-DESARROLLO-CONTINUO.md`:

1. Revalidar disponibilidad, pricing, asignación, cancelación y tasa turística
   contra los cinco invariantes ya protegidos.
2. Buscar contradicciones observables en reservas, solicitudes, pagos, estados y
   fechas del seed actual.
3. Corregir solo defectos que afecten a un recorrido presente; mantener reset,
   fixtures, capturas y demo deterministas.
4. Verificar el volumen firma de planning/plano y operación del día antes de
   cerrar el checkpoint.

## Publicación preparada, no autorizada

- El próximo candidato incluye código R4 y la migración
  `0007_scrub_payment_raw.sql`; `deploy:demo` aplicaría la migración antes del
  Worker.
- Antes de una autorización: comprobar destino y diff, confirmar que el secret
  remoto `AUTH_SECRET` existe y tiene al menos 32 caracteres, revisar el borrado
  deliberado de `payments.raw` y conservar rollback/backup.
- La demo declara `LEADS_TRANSPORT=demo`; el formulario mostrará que fue una
  simulación y no prometerá una entrega real.

## Ya verificado — no repetir sin un cambio relevante

- R0–R3: base sincronizada, fuentes reconciliadas, línea de calidad y fronteras
  de configuración/demo cerradas.
- R4: ADR 0042, 47 contratos de ruta, API 265/265, enlaces demo 3/3, auth y pagos
  fail-closed, redacción/anonimización ampliadas y proveedores remitidos a R12.
- D1-V L'Olivar, D2-V Pinada del Mar, D3-V Mar de Fondo y D4-V escaparate están
  cerrados; D5-V continúa detrás de aprendizaje comercial.
- La entrega visual de la sesión 104 sigue incluida en el candidato, pero ya no
  es el único cambio pendiente de publicar.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
