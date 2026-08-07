# ADR 0035 — Pipeline fotográfico resiliente y con aprobación

**Estado:** aceptado · **Fecha:** 2026-08-07

## Contexto

La fotografía de Mar de Fondo depende de un generador integrado en Codex que no
puede invocarse ni reanudarse desde el repositorio. Dos intentos del primer lote
fallaron antes de producir bytes. El manifiesto solo distinguía «local», «URL» y
«pendiente»: no guardaba intentos, proveedor ni un punto seguro de reanudación.
Reintentar manualmente podía duplicar gasto y una descarga válida entraba en la
web antes de una revisión visual.

## Decisión

`apps/web/scripts/foto-pipeline.mjs` es la entrada para nuevas sesiones:

- Codex integrado continúa como proveedor principal. Dos fallos técnicos sin
  bytes abren el circuito para todo el manifiesto y habilitan Higgsfield
  `soul_location` como fallback explícito en los lotes restantes. Dos rechazos
  visuales de una misma pieza cambian el modelo dentro de Higgsfield a
  `gpt_image_2`, sin cambiar la cuenta ni ocultar el gasto.
- Solo se procesa el primer lote incompleto, con un máximo de dos piezas. Antes
  de crear un trabajo Higgsfield se busca uno idéntico para reanudarlo o
  reutilizarlo.
- La descarga admite reintentos acotados; se validan lado mínimo, proporción y
  formato. El máster queda local y el derivado WebP se escribe atómicamente.
- Todo resultado entra en `.staging`. La web no puede consumirlo hasta que una
  inspección visual ejecuta `approve`; `reject` conserva el descarte para
  auditoría y permite una nueva tentativa.
- `fotos.estado.json` conserva proveedor, modelo, id de trabajo, estado,
  dimensiones y SHA-256 del prompt. No persiste credenciales ni URLs temporales.

## Consecuencias

El proveedor real de cada imagen deja de ser ambiguo y los fallos se reanudan
sin generación ciega. Se añade una dependencia operativa en la CLI de
Higgsfield cuando se alcanza el fallback, pero no en tiempo de ejecución de la
web. La aprobación manual sigue siendo deliberadamente obligatoria: una imagen
técnicamente válida puede ser incoherente o inventar arquitectura.
