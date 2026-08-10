# Prompt para la siguiente sesión — objetivo duradero en R6

> Reescrito tras la sesión 108 (2026-08-10). R0–R5 están cerrados; producción
> sigue requiriendo autorización explícita.

## Estado en una línea

El shell y la ayuda de portada ya están verificados; el siguiente trabajo seguro
es impedir que cada rol empiece mutaciones que el servidor rechazará, sin
duplicar ni rebajar la barrera del backend.

## Objetivo prioritario

Cerrar **R6 · Gestor y Logic2B UI** de
`docs/RUTA-DESARROLLO-CONTINUO.md`:

1. Inventariar las mutaciones visibles por pantalla y cruzarlas con la jerarquía
   `readonly`/`reception`/`manager`/`owner` y las excepciones concretas de demo.
   Ocultar o explicar antes del gesto lo que terminaría en 403, manteniendo el
   servidor como fuente de autoridad.
2. Revisar loading/empty/error/success y acciones destructivas en los recorridos
   firma.
3. Resolver por evidencia los nombres camping que puentean tokens Logic2B y la
   i18n realmente huérfana; no hacer renames masivos ni borrar claves por
   detector automático.
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
- R6 parcial: guía contextual de Inicio, `BotonAyuda`, dashboard 37/37 y E2E del
  shell a 320/375/430/1366. El doble `aria-current` ya no se reproduce y queda
  fijado por hash directo y click sintético; Playwright recupera auth solo en su
  Worker local.
- D1-V L'Olivar, D2-V Pinada del Mar, D3-V Mar de Fondo y D4-V escaparate están
  cerrados; D5-V continúa detrás de aprendizaje comercial.
- La entrega visual de la sesión 104 sigue incluida en el candidato, pero ya no
  es el único cambio pendiente de publicar.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
