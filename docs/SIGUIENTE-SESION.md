# Prompt para la siguiente sesión — objetivo duradero en R9

> Reescrito tras la sesión 112 (2026-08-10). R0–R8 están cerrados; producción
> sigue requiriendo autorización explícita.

## Estado en una línea

Una identidad nueva ya puede pasar de brief a contenido, tema, media, build y
capturas locales sin tocar el core ni crear infraestructura; ahora toca decidir
qué hueco comercial real falta en el portfolio antes de fabricar otra demo.

## Objetivo prioritario

Abrir **R9 · Portfolio, nuevos temas y olas D5-V/D6-V** de
`docs/RUTA-DESARROLLO-CONTINUO.md`, empezando solo por su auditoría y gate:

1. Comparar L'Olivar, Pinada del Mar y Mar de Fondo con los briefs de Montaña,
   Familiar y Parcela: ICP, objeción, nivel, recorrido y pantallas firma.
2. Identificar gaps demostrables sin asumir que seis tarjetas exigen seis demos.
3. Buscar en ROADMAP, notas comerciales y evidencia disponible qué concepto
   responde a una señal observada y registrar explícitamente por qué no duplica
   una ancla existente.
4. Si no existe señal suficiente, cerrar la auditoría con el gate en espera y
   avanzar al siguiente trabajo local permitido por la ruta; no generar activos,
   consumir proveedor ni inventar aprendizaje.
5. Solo si el gate queda probado, ejecutar una demo como entrega vertical usando
   `docs/FABRICA-IDENTIDADES.md`; D5-V precede siempre a D6-V.

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

- R0–R7: línea base, fronteras, motor, gestor y recorrido comercial cerrados.
- R8: `identity.json` fija el brief mínimo para cuatro tenants y tres conceptos;
  `_template` y `pnpm new:camping` incluyen brief, manifiesto y destino de media.
- `check-tenant-factory.mjs`, dentro de `pnpm check`, descubre identidades y
  valida locales, tokens, AA, temas claro/oscuro, radios, procedencia, lotes,
  dimensiones y presupuestos. Los cuatro manifiestos están completos: 12/12,
  8/8, 11/11 y 14/14.
- El selector sincroniza URL/localStorage, limpia temas inválidos y conserva el
  predeterminado; Playwright pasó selector + reduced motion 5/5 contra el bundle.
- La captura genérica construyó L'Olivar y Cala en tema nocturno a 375/1366 sin
  4xx ni errores; la inspección visual confirmó jerarquía, media, formulario,
  footer y el héroe histórico ya normalizado.
- Los tres builds de portfolio y el bundle compuesto pasaron. No se generó
  fotografía ni se consumieron créditos; sí se normalizaron derivados locales.
  No hubo deploy, reseed ni escritura remota en R8.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
