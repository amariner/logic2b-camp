# Prompt para la siguiente sesión — objetivo duradero en R8

> Reescrito tras la sesión 111 (2026-08-10). R0–R7 están cerrados; producción
> sigue requiriendo autorización explícita.

## Estado en una línea

El producto, el gestor y su recorrido comercial ya dicen la misma verdad; el
siguiente trabajo seguro es demostrar que una identidad nueva puede construirse
con la fábrica común sin copiar aplicaciones ni filtrar marcas al core.

## Objetivo prioritario

Cerrar **R8 · Fábrica común de temas, contenido y media** de
`docs/RUTA-DESARROLLO-CONTINUO.md`:

1. Inventariar el contrato real `config.ts` + `theme.css` + `content/` +
   `custom/`, la plantilla y el dry-run del CLI; localizar conocimiento de
   Cala Sereno o de las demos que haya escapado al core compartido.
2. Contrastar Montaña, Familiar y Parcela con el brief mínimo de identidad,
   tokens semánticos, selector, persistencia, URL, fallback, contraste,
   reduced motion y fronteras entre sitio comercial, tenant y gestor.
3. Auditar el pipeline fotográfico y de media desde manifiesto/brief hasta
   responsive, OG, procedencia y presupuestos. Corregir primero cualquier
   duplicación o paso manual reproducible; no generar activos ni gastar
   créditos sin una necesidad y aprobación concretas.
4. Terminar con una receta ejecutable y verificada para crear, construir,
   probar, capturar y documentar una identidad sin modificar el core ni crear
   infraestructura por marca.

## Publicación preparada, no autorizada

- El candidato acumulado incluye código R4 y la migración
  `0007_scrub_payment_raw.sql`; `deploy:demo` aplicaría la migración antes del
  Worker.
- Antes de una autorización: comprobar destino y diff, confirmar que el secret
  remoto `AUTH_SECRET` existe y tiene al menos 32 caracteres, revisar el borrado
  deliberado de `payments.raw` y conservar rollback/backup.
- La demo declara `LEADS_TRANSPORT=demo`; los formularios muestran una
  simulación explícita y no prometen una entrega real.

## Ya verificado — no repetir sin un cambio relevante

- R0–R6: línea base, fronteras de configuración/demo, API y pagos fail-closed,
  motor/seed creíbles y gestor cerrado por roles, estados, semántica y
  recorridos firma.
- R7: los cuatro estados comerciales aparecen en home y precios; las cuatro
  guías se enlazan desde la portada; `BRAND.md` reconoce el sistema botánico sin
  contaminar dashboard o tenant; el guion usa URLs HTTPS y alcance real del rol
  demo. Las 60 rutas de guía llevan `BreadcrumbList` validado en `<head>`.
- QA R7 recorrió home, precios y guía en ES/EN a 1366/375, formulario, diálogo,
  FAQ visible+JSON-LD, vídeo de 38,9 s con controles, pistas ES/EN y
  transcripción, y tres formatos de campaña sin desborde, recursos rotos ni
  errores de navegador.
- D1-V L'Olivar, D2-V Pinada del Mar, D3-V Mar de Fondo y D4-V escaparate están
  cerrados; D5-V continúa detrás de aprendizaje comercial y no autoriza una
  demo nueva en R8.
- No hubo deploy, reseed ni escritura remota en R7.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
