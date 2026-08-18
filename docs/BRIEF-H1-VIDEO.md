# Brief H1-V — bucles ambientales de las tres anclas

> Estado: listo para producción; bloqueado antes de generar bytes por saldo
> insuficiente del proveedor el 2026-08-18. Este documento fija el trabajo, no
> aprueba ningún vídeo. La fuente de verdad técnica continúa en ADR 0047 y
> `apps/web/scripts/hero-motion-contract.mjs`.

## 1. Decisión común

- Modelo: Seedance 2.0 (`seedance_2_0`), validado en el catálogo completo.
- Modalidad: imagen a vídeo, plano único, cámara fija, 6 s y 720p.
- Audio: desactivado. Inicio y final usan el mismo póster para favorecer un
  cierre continuo.
- Escritorio: 16:9 para L'Olivar y 21:9 para Pinada/Mar de Fondo si el modelo
  conserva esa relación; el primer prototipo de L'Olivar se produce a 16:9.
- Móvil: 9:16 propio después de aprobar el escritorio. La referencia puede ser
  la misma, pero el resultado debe reconstruir el encuadre central; un recorte
  que pierda sujeto, acceso o contexto se rechaza.
- Movimiento máximo: hojas, lona, sombras, agua y vegetación. Nada entra o sale
  de escena y no se añaden huéspedes para compensar que el póster esté vacío.
- Una solicitud cada vez: L'Olivar escritorio → inspección → L'Olivar móvil →
  integración/QA. Pinada y Mar de Fondo no se lanzan antes de ese gate.

Los prompts describen solo movimiento, tal como pide el flujo imagen-a-vídeo;
el póster ya fija lugar, arquitectura, luz y paleta.

## 2. L'Olivar — sombra y lona entre olivos

- Póster y referencia: `tenants/olivar/content/media/hero-dia.webp`, 1920×1080,
  manifiesto corregido a 16:9.
- Claves finales previstas: `hero-motion.mp4` y `hero-motion-mobile.mp4`.
- Aporte buscado: que la parcela deje de parecer congelada sin convertir el
  microcamping en una escena publicitaria.

**Prompt escritorio**

> Locked-off single documentary shot. A very light breeze moves only a few
> olive leaves and the raw tent canvas by millimetres while dappled shadows
> drift slowly across the dry ground. Geometry, exposure, colour and every
> object remain stable. The campsite stays unoccupied and quiet. Motion is
> subtle enough to sit behind a website headline. Finish on the exact opening
> composition for a seamless loop.

**Prompt móvil**

> Recompose the same locked-off scene vertically around the tent, olive trunk
> and stone path. A faint breeze moves a few leaves and the canvas by
> millimetres; soft shadows shift slowly. The full tent entrance and usable
> path remain visible throughout. Stable geometry, exposure and colour; quiet,
> unoccupied campsite. End on the opening composition for a seamless loop.

Rechazo específico: respiración del tronco o muro, lona que cambia de forma,
tienda que se abre, objetos nuevos, exposición pulsante o salto al reiniciar.

## 3. Pinada del Mar — sombra de pinos y mar al fondo

- Póster y referencia: `tenants/pinadamar/content/media/hero-calle.webp`,
  1915×821, 21:9.
- Claves finales previstas: `hero-motion.mp4` y `hero-motion-mobile.mp4`.
- Aporte buscado: mostrar el ritmo calmado de una calle costera operativa sin
  inventar llegadas, tráfico ni actividad infantil.

**Prompt escritorio**

> Locked-off single documentary shot. Pine needles and the outer edges of the
> green awnings move gently in a mild sea breeze; dappled shade shifts slowly
> over the compacted avenue and the distant sea has a restrained shimmer.
> Caravans, posts, hedges and perspective remain perfectly stable. The street
> stays empty and quiet. Constant natural exposure. Return to the exact opening
> composition for a seamless loop.

**Prompt móvil**

> Recompose vertically around the central campsite avenue, its pine canopy and
> the distant opening to the sea. Keep the full lane and clear access visible.
> Pine needles, awning edges and dappled shade move gently; the distant sea
> shimmers slightly. Caravans and posts remain rigid, with constant exposure.
> The street stays empty. End on the opening composition for a seamless loop.

Rechazo específico: caravanas que se deforman, matrículas o rótulos nuevos,
ramas agitadas, mar de temporal, calle bloqueada o pérdida del punto de fuga.

## 4. Mar de Fondo — agua contenida y escala ordenada

- Póster y referencia: `tenants/mardefondo/content/media/hero-laguna.webp`,
  2000×838, 21:9.
- Claves finales previstas: `hero-motion.mp4` y `hero-motion-mobile.mp4`.
- Aporte buscado: hacer legibles agua, brisa y escala sin introducir el lenguaje
  de anuncio de resort que la identidad veta.

**Prompt escritorio**

> Locked-off single editorial shot. Small coherent ripples travel slowly across
> the lagoon; palm fronds and the parasol edge move barely in a light coastal
> breeze. White and sand-coloured buildings, terraces, furniture and horizon
> remain rigid. Stable natural golden-hour exposure and restrained reflections.
> The scene stays unoccupied and orderly. Finish on the exact opening
> composition for a seamless loop.

**Prompt móvil**

> Recompose vertically around the lagoon edge, one white volume and the ordered
> sand-coloured terraces. Water ripples slowly; one palm and the parasol edge
> move slightly in a coastal breeze. Architecture, furniture, horizon, exposure
> and reflections remain stable. The scene stays unoccupied. Return to the
> opening composition for a seamless loop.

Rechazo específico: nivel del agua variable, reflejos que licúan bordes,
palmeras duplicadas, arquitectura cambiante, huéspedes nuevos o efecto dron.

## 5. Orden de integración y evidencia

Cada salida se incorpora con `pnpm motion -- stage`: el pipeline la normaliza
fuera del runtime a H.264 `yuv420p`, sin pista de audio y con `faststart`, y la
deja en `.motion-staging` hasta inspeccionarla. `approve` publica solo una pieza
revisada y `reject` conserva el descarte con su evidencia. Después:

1. aprobar mediante el pipeline para copiar el final a `content/media/` y crear
   `movimiento.json` con proveedor, modelo, prompt, fechas, aprobación visual y
   SHA-256;
2. declarar `heroMotion.desktop`, `heroMotion.mobile` y `position` en config;
3. ejecutar `node apps/web/scripts/hero-motion-contract.mjs` y el build aislado;
4. comprobar 375/1366, reinicio de bucle, consola, transferencia y legibilidad;
5. repetir con movimiento reducido y ahorro de datos: no debe solicitarse el
   vídeo y el póster debe conservar LCP, contraste y composición.

Solo un par que supera ese recorrido desbloquea el siguiente tenant. Los clips
rechazados no se renombran como finales ni se declaran en `movimiento.json`.
