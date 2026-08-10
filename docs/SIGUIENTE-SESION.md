# Prompt para la siguiente sesión — objetivo duradero en R7

> Reescrito tras la sesión 110 (2026-08-10). R0–R6 están cerrados; producción
> sigue requiriendo autorización explícita.

## Estado en una línea

El gestor ya está cerrado por roles, estados, semántica y recorridos firma; el
siguiente trabajo seguro es auditar la landing de venta y la documentación de
producto como un único recorrido comercial honesto.

## Objetivo prioritario

Cerrar **R7 · Landing de venta y documentación de producto** de
`docs/RUTA-DESARROLLO-CONTINUO.md`:

1. Recorrer la home completa y contrastar jerarquía, promesa, CTAs, estados
   comerciales y saltos landing↔demo↔gestor con lo que el producto hace hoy.
2. Corregir primero promesas, enlaces o marca obsoletos que se reproduzcan;
   revisar `DEMO-SCRIPT.md` y `BRAND.md` sin reescribir prosa por simetría.
3. Añadir `BreadcrumbList` a las guías si el inventario confirma que sigue
   faltando, validar el JSON-LD y verificar formularios, pistas y alternativas
   textuales a 1366/375 px sin perder presupuestos.

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
- R6 cerrado: guía y shell, política compartida de roles, estados recuperables,
  cotización vigente antes del alta y confirmaciones terminales. Demo solo ve
  las cinco acciones de estancia autorizadas; una estancia en casa se cierra por
  check-out. Recorridos firma 11/11 en 320/375/430/1366 px; cero alias visuales
  antiguos y diez claves i18n huérfanas retiradas. Bundles en
  173,18/177,65/183,43 kB gzip.
- D1-V L'Olivar, D2-V Pinada del Mar, D3-V Mar de Fondo y D4-V escaparate están
  cerrados; D5-V continúa detrás de aprendizaje comercial.
- La entrega visual de la sesión 104 sigue incluida en el candidato, pero ya no
  es el único cambio pendiente de publicar.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
