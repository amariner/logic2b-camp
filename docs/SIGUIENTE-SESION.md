# Prompt para la siguiente sesión — objetivo duradero en R6

> Reescrito tras la sesión 109 (2026-08-10). R0–R5 están cerrados; producción
> sigue requiriendo autorización explícita.

## Estado en una línea

Shell, portada, navegación y mutaciones por rol ya están alineados; el siguiente
trabajo seguro es revisar los estados y acciones destructivas de los recorridos
firma y resolver solo la deuda semántica/i18n que tenga evidencia.

## Objetivo prioritario

Cerrar **R6 · Gestor y Logic2B UI** de
`docs/RUTA-DESARROLLO-CONTINUO.md`:

1. Revisar loading/empty/error/success y acciones destructivas en los recorridos
   firma. Priorizar defectos observables, confirmaciones engañosas o salidas sin
   recuperación; no uniformar estados solo por simetría.
2. Resolver por evidencia los nombres camping que puentean tokens Logic2B y la
   i18n realmente huérfana; no hacer renames masivos ni borrar claves por
   detector automático.
3. Confirmar planning, plano, ficha, llegadas, solicitudes y búsqueda a 1366 y
   375 px, manteniendo los presupuestos de bundle fijados en R2/R3.

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
- R5: core 68/68, seed/reset 63/63 sobre 23 anclas, firmas de solicitudes
  coherentes por idioma y volumen diario/plano verificado. La relación de una
  solicitud convertida con su reserva sigue diferida porque ninguna pantalla la
  muestra.
- R6 parcial: guía contextual de Inicio y shell verificados; política compartida
  de roles/capacidades con config 66/66, dashboard 37/37, API dirigida 137/137 y
  E2E permisos+shell 2/2. Demo solo ve las cinco acciones de estancia que la API
  autoriza; las demás mutaciones ya no conducen a 403. La sesión sembrada acepta
  el ID opaco del tenant y la provisión nueva lo conserva. Los bundles siguen en
  173,10/177,58/183,36 kB gzip.
- D1-V L'Olivar, D2-V Pinada del Mar, D3-V Mar de Fondo y D4-V escaparate están
  cerrados; D5-V continúa detrás de aprendizaje comercial.
- La entrega visual de la sesión 104 sigue incluida en el candidato, pero ya no
  es el único cambio pendiente de publicar.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
