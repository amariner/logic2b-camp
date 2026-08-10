# Prompt para la siguiente sesión — objetivo duradero en R4

> Reescrito tras la sesión 105 (2026-08-10). R0–R3 están cerrados; la entrega
> 104 sigue preparada para publicar, pero producción requiere autorización
> explícita.

## Estado en una línea

Configuración y escenarios ya fallan cerrados; el siguiente trabajo seguro es
auditar contratos de API, permisos, idempotencia, rate limit y errores.

## Objetivo prioritario

Cerrar **R4 · Backend mínimo y contratos de API** de
`docs/RUTA-DESARROLLO-CONTINUO.md`:

1. Inventariar endpoints públicos, admin, auth y leads contra validación,
   permisos, idempotencia, rate limit y errores.
2. Separar inequívocamente los resultados demo/noop/entrega real del formulario
   comercial.
3. Revisar pagos y notificaciones para que una integración incompleta falle
   cerrada sin dejar reservas o logs ambiguos.
4. Añadir únicamente las pruebas de contrato que cubran huecos demostrados.

## Publicación preparada, no autorizada todavía

- Candidato: vídeo del planning de 22,1 s, póster de 42 kB y VTT ya verificados.
- Comando único: `pnpm --filter @logic-camp/api deploy:demo`.
- Tras una autorización explícita: comprobar destino/diff/migraciones, publicar
  y verificar `/docs/recepcion/mover/` a 1366/375 y los MIME MP4/WebP/VTT.

## Ya verificado — no repetir sin un cambio relevante

- R0: rama sincronizada, entrega 104 aislada en `aa39ee3` y QA vídeo 1366/375.
- R1: marca/rutas/fases reconciliadas y pendientes clasificados por gate.
- R2: `docs/LINEA-BASE-CALIDAD.md`, `pnpm check` 53/53, tests secuenciales,
  presupuestos y bundle compuesto verificados; el test web ya protege los tiers.
- R3: ADR 0041, config web/API y módulos validados; dashboard normal sin fixtures
  demo, escenarios aislados por build y API 245/245.
- D1-V L'Olivar, D2-V Pinada del Mar, D3-V Mar de Fondo y D4-V escaparate están
  cerrados.
- Mar de Fondo tiene 14/14 fotos, capturas firma, campaña, ficha y vídeo guiado.
- Montaña, Familiar y Parcela siguen siendo conceptos, no demos abiertas.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
