# Riu Clar · mejora editorial y movimiento

Encargo de Andreu del 18 de septiembre de 2026, inspirado en tres referencias de naturaleza y senderismo. Se adopta su jerarquía fotográfica y tipográfica, conservando el microcàmping fluvial prepirenaico, sus 24 parcelas y su identidad fluvial. Por indicación posterior de Andreu, todo el tema pasa a castellano y la marca se muestra como «Riu Clar».

Presentación `outdoor` compartida (ADR 0051), con dirección propia declarada en el CSS y contenido del tenant: hero a todo el ancho, bosque/papel/lima, bienvenida editorial, parcelas, información de temporada y acceso, refugio, rutas, FAQ y consulta demo. El contrato compartido añade únicamente foto y pie secundarios opcionales para no imponer nombres de activos de otro camping. Las tarjetas se alinean con los IDs reales `ut_std` y `ut_conf`, lo que permite precios y enlaces correctos.

Dos imágenes originales generadas con la herramienta OpenAI integrada en esta cuenta, sin usar API key ni generación de imágenes en Higgsfield:

- `tenants/riuclar/content/media/hero-riu-editorial.webp`: río, bosque y dos caminantes lejanos.
- `tenants/riuclar/content/media/camins-editorial.webp`: paseo de dos adultos por la ribera.

Prompts exactos en `tenants/riuclar/fotos.json`; procedencia y aprobación visual en `fotos.estado.json`. Los másteres `*-source.png` se conservan localmente. Póster móvil derivado mediante recorte central, miniatura y OG actualizados.

Vídeo generado en Higgsfield / Seedance 2.0 desde el hero de OpenAI: 8 segundos, cámara fija, agua, hojas y movimiento humano lejano. Un original con dos derivados locales H.264 sin audio y faststart: escritorio 1600×900 (~1,27 MiB), móvil 540×960 (~0,68 MiB). Prompt, proveedor, fecha y huellas en `tenants/riuclar/movimiento.json`. `HeroMedia` mantiene póster como base, pausa manual, suspensión fuera de pantalla, movimiento reducido y ahorro de datos.

Validación: `pnpm check` con ffprobe local, 74/74 tareas correctas; build de Riu Clar, 13 páginas, sin motor. QA de navegador correcto a 320, 375, 768 y 1440 px, 12 enlaces locales, menú, FAQ, consulta sin envío y vídeo con pausa/reanudación; con movimiento reducido o ahorro de datos no se solicita vídeo. Informes y capturas en `output/riuclar/`; el directorio contiene originales, herramientas temporales e informes y está excluido de Git. Previsualización de la build en `http://127.0.0.1:4324/demos/riuclar/`.

Publicado el 18 de septiembre de 2026 en `https://camp.logic2b.com/demos/riuclar/`, junto con todos los cambios vigentes de `main` (`a292534`). Versión Cloudflare `ff485298-cc39-42fd-9913-8351cf00b73c`. Comprobación global 74/74, revisión canónica a 375/1366 px y verificación real en producción de imágenes, idioma, layout y vídeo (huella SHA-256, reproducción y pausa). Evidencias: `output/riuclar/qa-production.json` y `production-{375,1366}.png`.

Traducción completa: `content/es.json`, idioma `es` único, nombres de datos y temporadas, dirección de muestra y razón social, metadatos e imagen social en castellano. Se conservan identificadores, URLs, fotografías y vídeo.

Validación de castellano: 13 páginas con `lang="es"` y marca «Riu Clar», estados de error/antispam traducidos, formulario correcto y sin desbordamientos a 320/375/768/1440 px. Evidencias: `output/riuclar/qa-language.json` y `qa-es.log`. Comprobación global 74/74.
