# 0009 — Selector de temas de la demo comercial

- **Fecha**: 2026-07-19
- **Fase**: transversal de demo (adelanta una pieza del "modo demo" de Fase 10)
- **Estado**: aceptado (petición directa de Andreu en sesión: "un selector de temas para que el cliente pueda ver la demo en diferentes estilos")

## Contexto

La demo `camp.logic2b.com` es LA herramienta de ventas (§0). En una llamada comercial, el director de un camping pregunta siempre lo mismo: *"¿y esto puede ir con mis colores?"*. Hoy la respuesta es teórica ("cambiamos un fichero de tokens"). Un selector de temas en vivo convierte la respuesta en un click delante del cliente — y de paso **demuestra la arquitectura**: un tenant se re-viste cambiando `theme.css`, sin tocar un componente.

## Decisión

### 1. Temas = bloques `[data-theme]` en el `theme.css` del tenant demo

La cascada ya está preparada: los componentes solo consumen tokens `--lc-*`, y los derivados (`tinta-suave`, `arena-suave`) son `color-mix()` sobre las variables base — se recalculan solos. Un tema nuevo = redefinir las 5 base (+ hover y radio si procede) bajo `:root[data-theme='x']`. **Cero cambios en componentes.**

Cuatro temas, todos dentro del territorio (mediterráneo real, materia) y fuera del antimodelo (ni SaaS azul isométrico ni crema+serif+terracota). Mismas fuentes en todos (Clash Display + Inter): cambiar tipografía = cargar webfonts extra = pagar Lighthouse; la identidad tipográfica es del producto, la paleta es del tenant.

| Tema | Idea | Acción |
|---|---|---|
| `pinada` (defecto) | pino carrasco, el actual | verde pino `#1f4d3a` |
| `mar` | posidonia, roca húmeda | verde-azul profundo `#14555e` |
| `garriga` | oliva, romero, tierra seca | oliva oscura `#55531d` |
| `nit` | acampada de noche | verde luminoso sobre fondo oscuro (`color-scheme: dark`) |

`nit` es además la prueba de fuego del sistema: si el modo oscuro sale gratis con los mismos tokens, cualquier identidad de cliente sale gratis.

### 2. Demo-only, tras flag de config

`TenantWebConfig` gana `demoThemes?: string[]`. Solo el tenant `demo` lo define; sin el flag **el selector no se renderiza y no añade un byte** al HTML de un cliente real. Un camping real tiene UN tema: el suyo (su `theme.css`). El selector es atrezzo comercial, no feature de producto.

### 3. Selector sin islas: `<details>` + vanilla JS + `localStorage`

Mismo patrón que el selector de idioma (nativo, accesible). Botones con `aria-pressed`, swatch del color de acción de cada tema como pista visual. Script inline en `<head>` (3 líneas) aplica el tema guardado ANTES del primer paint — sin FOUC. Persistencia en `localStorage` (`lc-theme`): el prospecto navega toda la demo con el tema elegido. Sin JS, la demo simplemente se ve con el tema por defecto — degradación limpia. **La regla dura del nivel 1 (0 islas) queda intacta**: es vanilla JS como el formulario de contacto.

Textos vía content JSONs del tenant en los 6 idiomas (`nav.tema`, `tema.{nombre}`), como todo lo demás.

### 4. Qué NO hace

- No toca el dashboard (sus tokens se tenant-izan en Fase 9; el prospecto ve la web).
- No persiste en servidor ni por URL (si algún día el comercial quiere enviar un enlace con tema, `?tema=x` es una línea — anotado en BACKLOG).
- No genera assets por tema (las fotos son las mismas: la materia no cambia de marca).

## Consecuencias

- Argumento comercial nuevo: "tu marca, un fichero" se enseña en vivo.
- `theme.css` del demo pasa de 1 a 4 paletas — es el único fichero que crece.
- Riesgo aceptado: un tema con contraste AA mal ajustado en algún estado raro. Mitigación: los cuatro temas se verifican en navegador (home, tarifas, funnel) antes de cerrar.
