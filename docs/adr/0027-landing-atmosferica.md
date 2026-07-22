# ADR 0027 — Landing atmosférica: fotografía en la superficie de venta

- **Estado**: aceptado (decisión de Andreu, sesión 39/40, 2026-07-22)
- **Fase**: refinamiento de B3 (landing de producto)
- **Reabre**: la parte "sin fotografía" de la decisión de marca del Frente B (BRAND.md)

## Contexto

La landing de venta (`apps/site`, `camp.logic2b.com/`) tiene buen copy y estructura
completa (héroe → problema → producto → planning → niveles → guías → alta → FAQ →
contacto), pero es visualmente pobre: héroe 100 % texto, cero materia, todas las
secciones son la misma card `border-border` + `bg-card`, una sola imagen real (la
captura del planning, pequeña) y sin movimiento. Parece plantilla de dev-tool, y
contradice la propia dirección del proyecto: *"el héroe es el widget de
disponibilidad funcionando de verdad"* (CLAUDE.md).

El Frente B decidió que la landing era superficie Logic2B **neutra, sin fotografía
del tenant** (por eso la `og.png` es marca pura). Andreu decide reabrir ese punto:
la landing pasa a ser **atmosférica**, con fotografía de camping.

## Decisión

1. **La fotografía entra como atmósfera contenida, no como piel total.**
   Superficies con foto: el **héroe** (fondo fotográfico con velo/scrim que
   garantiza contraste AA del texto) y, con moderación, transiciones de sección.
   Siguen **neutras Logic2B**: la `og.png`, las cards de niveles, las guías
   (`/docs/`) y el pie.
2. **Sigue siendo Logic2B.** Space Grotesk + Inter, neutros oklch del DS, radius
   10, isotipo. Prohibido el antimodelo completo: ni SaaS azul isométrico **ni**
   crema+serif+terracota. La foto no arrastra la tipografía ni la paleta.
3. **La foto del héroe cumple el contrato de arte del ADR 0024**: camping
   mediterráneo real — pino de Alepo, luz de primera/última hora, sin gente, sin
   HDR. Generada con Higgsfield, servida self-hosted desde `apps/site/public/`
   (AVIF/WebP, `preload`, sin CDN externo).
4. **El héroe enseña el producto encima de la atmósfera**: marco de dispositivo
   con captura real del producto (planning o web del tenant con el widget). Las
   capturas salen del generador de seed puro (patrón C1/C5) — cero maquetas CSS.
5. **El resto del refinamiento no necesitaba ADR y entra en la misma sesión**:
   capturas reales en los bloques "dos caras", planning ampliado + plano
   (`captura-plano.webp` ya existía sin usar), niveles como escalera con nivel
   destacado elevado, iconografía lucide, movimiento sutil bajo
   `prefers-reduced-motion`, e idiomas fr/de/nl del contenido.

## Consecuencias

- `BRAND.md` debe anotar la excepción: "la landing puede llevar fotografía
  atmosférica en el héroe; el resto de superficies Logic2B siguen neutras".
- Lighthouse ≥95 se mantiene como listón: la foto del héroe entra optimizada
  (≤200 KB en el ancho servido, `fetchpriority="high"`, dimensiones explícitas).
- El contraste del texto sobre foto se garantiza con scrim, no con sombra de
  texto; se verifica a 1366 px y 375 px en claro y oscuro.
- La demo del tenant no cambia: su marca sigue siendo la del camping (ADR 0006).
