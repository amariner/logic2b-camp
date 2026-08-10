# Prompt para la siguiente sesión — objetivo duradero en R6

> Reescrito tras la sesión 107 (2026-08-10). R0–R5 están cerrados; producción
> sigue requiriendo autorización explícita.

## Estado en una línea

Motor, contratos y datos actuales ya están coherentes; el siguiente trabajo
seguro es auditar el gestor por roles, estados y lenguaje visual sin migrar
markup por simetría.

## Objetivo prioritario

Cerrar **R6 · Gestor y Logic2B UI** de
`docs/RUTA-DESARROLLO-CONTINUO.md`:

1. Auditar shell, portada y navegación por rol, empezando por afordancias que
   conducen a un 403 o prometen acciones que el rol no puede completar.
2. Revisar loading/empty/error/success y acciones destructivas en los recorridos
   firma, incluida la ayuda contextual de la portada si aún falta.
3. Resolver por evidencia los nombres camping que puentean tokens Logic2B, la
   i18n realmente huérfana y el doble `aria-current`; no hacer renames masivos ni
   borrar claves por detector automático.
4. Confirmar planning, plano, ficha, llegadas, solicitudes y búsqueda a 1366 y
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
- D1-V L'Olivar, D2-V Pinada del Mar, D3-V Mar de Fondo y D4-V escaparate están
  cerrados; D5-V continúa detrás de aprendizaje comercial.
- La entrega visual de la sesión 104 sigue incluida en el candidato, pero ya no
  es el único cambio pendiente de publicar.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
