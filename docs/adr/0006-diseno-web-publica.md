# 0006 — Plan de diseño de la web pública (Fase 4)

- **Fecha**: 2026-07-18
- **Fase**: 4 · Web pública + niveles
- **Estado**: aceptado e implementado (Fase 4). **Reemplazado en parte por ADR 0018** (fase B2, 2026-07-20) en dos puntos: (1) la escala de radios pasa de `2px/4px` sueltos a **una base 4px + derivados por `calc()`**; (2) el pie gana la firma discreta **"powered by Logic2B"**. El resto de este ADR (paleta, tipografía display Clash, wireframes, elemento firma) sigue **vigente** — B2 es alineamiento estructural, no reskin de identidad.
- **Dirección pedida**: minimalista y moderno, nivel e-commerce premiado (Awwwards), sobre el territorio del §8: camping mediterráneo REAL — materia, no vector.

## Tesis

La web se comporta como una tienda de producto premiada: **fondo casi blanco, tipografía editorial enorme, una foto que huele a pino, y un único objeto interactivo protagonista**. Nada de ilustraciones, nada de gradientes SaaS, nada de crema+serif+terracota. El color lo pone la fotografía; la interfaz calla.

## Paleta (5 hex nombrados)

| Nombre | Hex | Rol |
|---|---|---|
| **Tinta de pino** | `#0E1512` | texto e iconos — negro con 5% de verde, nunca #000 |
| **Hueso** | `#F4F2EC` | fondo global — papel cálido, no blanco puro |
| **Pino carrasco** | `#1F4D3A` | acción: CTAs, foco, estados activos. ÚNICO color de marca |
| **Arena compactada** | `#C9B99A` | bordes, separadores, fills suaves, precios tachados |
| **Mar de fondo** | `#2E6E73` | enlaces, info, disponibilidad "quedan pocas" |

Regla: superficie ≥90% hueso+tinta. Pino carrasco aparece solo donde se puede hacer clic. Éxito/error del sistema: derivados de pino/arena (tokens en `theme.css`, no nuevos colores).

## Tipografías (2, con rol)

| Fuente | Rol | Por qué |
|---|---|---|
| **Clash Display** (Fontshare, variable, self-host) | Titulares y cifras grandes. Peso 500–600, tracking −2%, tamaños desmedidos (clamp 2.5rem→7rem) | Geométrica con carácter, la voz "premio" sin caer en serif-crema |
| **Inter** (variable, self-host) | Texto, UI, formularios, widget. 400/500/600 | Legibilidad total — la recepcionista de 55 años y el francés de 70 la leen igual de bien |

Números tabulares (`font-variant-numeric: tabular-nums`) en precios y fechas, siempre.

## Wireframe héroe — NIVEL 3 (el widget ES el héroe)

```
┌──────────────────────────────────────────────────────────────┐
│ CALA SERENO                 Alojamientos Entorno Tarifas ES▾ │  ← nav mínima, hueso
│                                                              │
│   FOTO 21:9 full-bleed (pinos, sombra, lona, mar al fondo)   │
│   ┌────────────────────────────┐                             │
│   │ Dormir bajo                │   ← Clash Display 7rem,     │
│   │ los pinos,                 │     tinta sobre la zona     │
│   │ a 300 m de la cala.        │     de aire de la foto      │
│   └────────────────────────────┘                             │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ MOSTRADOR ★  [ 12 ago → 19 ago ] [ 2 adultos, 1 niño ▾ ] │ │  ← EL OBJETO:
│ │              [ Ver disponibilidad → ]  (pino carrasco)   │ │    widget real
│ └──────────────────────────────────────────────────────────┘ │    contra la API
│   83 parcelas y alojamientos · abierto mar–oct · ★ 4,7       │  ← prueba, Inter 14
└──────────────────────────────────────────────────────────────┘
```

Al hacer scroll, el **mostrador** se despega y queda sticky bajo la nav (48px), siempre operativo. Los resultados se pintan EN la página (sin salto): tarjetas 3:2 con foto, precio "desde" del servidor y estado `closed` diferenciado ("Cerrado en esas fechas — abrimos el 15 de marzo").

## Wireframe héroe — NIVEL 1 (sin motor, héroe distinto)

Propuesta (la fase pedía proponerlo): **la promesa + la prueba + una sola acción**. Sin fechas, sin números que huelan a motor: la foto nocturna, la frase, y "Escríbenos" que ancla al formulario→`enquiries`.

```
┌──────────────────────────────────────────────────────────────┐
│ CALA SERENO                    Alojamientos Entorno Contacto │
│                                                              │
│   FOTO 21:9 (anochecer, luces cálidas bajo los pinos)        │
│                                                              │
│              Las vacaciones que                              │
│              vuelven solas cada año.                         │  ← centrado, aire
│                                                              │
│              [ Escríbenos → ]     (ancla al formulario)      │
│                                                              │
│ ── ticker lento: 80 parcelas · cala a 300 m · familias desde │
│    1974 · perros bienvenidos · mar–oct ──                    │
└──────────────────────────────────────────────────────────────┘
```

El formulario (todos los niveles) guarda SIEMPRE en `enquiries` y envía por Resend (hook Fase 7): nombre, email, fechas aproximadas opcionales, mensaje. 3 campos visibles, el resto progresivo.

## Elemento firma

**El mostrador** (widget sticky) es el elemento firma del nivel 3 — un solo objeto, siempre presente, que responde de verdad. Firma secundaria transversal (niveles 1 y 3): **sombra de pino** — los separadores de sección usan la textura fotográfica de lona con sombra de ramas (generada, ver assets) como banda de 96px, en lugar de líneas. Materia, no vector.

## Estructura y reglas

- Páginas: home · alojamientos (+detalle por tipo) · instalaciones · entorno · tarifas · contacto · blog (cableado). Astro 5, islas React SOLO para el mostrador y resultados (nivel 3).
- **Nivel 1 no arrastra el motor**: la isla del widget se incluye por config del tenant en build (`modules.booking`), no por CSS. Bundle nivel 1 = cero JS de motor.
- Contenido 100% desde `tenants/demo/content/` (6 idiomas, hreflang, schema.org `Campground`+`LodgingBusiness`+`Offer`, sitemap, OG).
- Tokens en `tenants/{slug}/theme.css` (colores, radios, fuentes): cambiar el fichero re-viste toda la web.
- Suelo: AA, foco visible, `prefers-reduced-motion` (el ticker y el sticky se congelan), usable a 1366px, Lighthouse ≥95.
- Micro-movimiento: 150–250ms, solo transform/opacity; las fotos hacen un scale 1.02 lentísimo al entrar (una vez).

## Assets fotográficos (Higgsfield)

Generados con Nano Banana Pro (4K 21:9, héroes) y Soul 2.0 (2k 3:2, tarjetas + textura): héroe día (nivel 3), héroe anochecer (nivel 1), parcela, bungalow, glamping, textura lona-sombra. Se guardan optimizados (AVIF/WebP + fallback) en `tenants/demo/content/media/`.

## Qué NO haremos

- Ilustración vectorial, iconos decorativos, 3D, glassmorphism, degradados de marca.
- Serif + crema + terracota (antimodelo explícito), y azul SaaS.
- Carruseles automáticos, popups, vídeo de fondo en el héroe (peso y Lighthouse).
- Animaciones de scroll complejas (scroll-jacking). El único "efecto" caro es el mostrador sticky.
