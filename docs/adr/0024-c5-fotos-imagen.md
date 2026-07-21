# 0024 — Materia: fotos e imagen (Frente C, fase C5)

- **Fecha**: 2026-07-21
- **Fase**: Frente C — C5 (fotos e imagen)
- **Estado**: **aceptado e implementado**. Mandato autónomo permanente del Frente C (Andreu, al cerrar C7/C4/C1: _"aplica tu criterio y no pares hasta cerrarlo"_). Higgsfield autorizado por Andreu el 2026-07-21 (registrado en `docs/SIGUIENTE-SESION.md`).

## Contexto

`CLAUDE.md` dice **"materia, no vector"**: pino carrasco, sombra real, lona, arena compactada, luz mediterránea de mañana o última hora, sin gente reconocible, sin HDR ni saturación de folleto. `FRENTE-C-ACABADO.md` §C5 registra dos huecos: **C-BUG-5** (4 ficheros de foto referenciados en `apps/web/src/lib/fotos.ts` que no existen, más 2ª foto de galería en 3 tipos) y **C5.2** (imagen del propio producto: capturas reales del planning/plano para la landing, OG image).

Antes de tocar nada se audita el estado real de la 1ª tanda:

- **Los 6 ficheros que hacen falta para C-BUG-5 YA ESTÁN GENERADOS.** Sesión 8 generó 6 fotos con Higgsfield (Soul 2.0) y quedaron sin descargar por bloqueo de red del contenedor; sus UUIDs completos están en `docs/BACKLOG.md`. De esos 6, **4 son exactamente los 4 que pide C-BUG-5** (`tipo-premium`, `tipo-autocaravana`, `detalle-bungalow-interior`, `detalle-glamping-interior`) y los otros 2 (`instalacion-piscina`, `instalacion-restaurante`) alimentan `Instalaciones.astro` (que ya degrada solo — `images['instalacion-${id}']` filtra lo que falta). Además, por cómo está escrito `fotos.ts` (§`detalle` mapea `ut_bung4/ut_bung6/ut_mobil → detalle-bungalow-interior` y `ut_glamp → detalle-glamping-interior`), **descargar esos 2 ficheros cierra también "2ª foto por tipo" en bungalow/mobil/glamping sin tocar código**: el `galeriaTipo()` ya compone `[principal, detalle]` y deduplica.
- Los 6 prompts (recuperados vía `job_display`) ya cumplen la dirección de arte del contrato: pino de Alepo (Aleppo pine = pino carrasco), luz de mañana/última hora tardía, sin gente, sin texto, "editorial documentary photography", grano de película — nada de HDR ni de saturación publicitaria. **No hace falta fijar una lista nueva de prompts: la de sesión 8 ya es la definitiva** (ver tabla en §1).
- **La descarga sigue bloqueada por política de red del contenedor** (`d8j0ntlcm91z4.cloudfront.net`, 403 en el `CONNECT`), verificado de nuevo hoy con `curl` + `$HTTPS_PROXY/__agentproxy/status`: `recentRelayFailures` muestra el mismo host, mismo motivo (`policy denial`), a las 12:21 de hoy. Es la **3ª sesión consecutiva** con el idéntico bloqueo (sesión 8, sesión "24" de descarga fallida registrada en PROGRESS línea 289, y esta). El README del proxy es explícito: _"403/407 … Do not retry or route around it — report the blocked host."_

Esto cambia la pregunta del ADR: no es "qué generar" sino **"qué hacer cuando lo que falta no es prompt ni crédito, sino una puerta de red que este contenedor no tiene"**.

## Decisión

### 1. C5.1 — no se genera nada nuevo; el hueco es solo de descarga

Generar de nuevo sería quemar créditos sin resolver nada: una imagen nueva de Higgsfield vive en el mismo host bloqueado que las 6 ya generadas. El contrato pide prudencia ("no quemar créditos a ciegas") — la decisión prudente aquí es **no generar**, porque no hay ningún prompt pendiente de fijar: los 6 ya cumplen el contrato de arte.

Lo que sí se entrega esta sesión:

- **Lista definitiva cerrada** (tabla abajo) — ya no es una decisión abierta.
- **`tenants/demo/scripts/fetch-higgsfield-fotos.mjs`**: script Node autocontenido (usa `sharp`, ya dependencia de `apps/web`) con las 6 `rawUrl` + nombre de fichero destino ya resueltos — descarga y optimiza a WebP (incremento de tamaño ~2000px de lado mayor, `q:78`, igual que el resto de `tenants/demo/content/media/`) en una sola orden. No se ejecuta en este contenedor (mismo bloqueo); queda listo para correrlo desde cualquier máquina con salida a `cloudfront.net` — la de Andreu, o una sesión futura con otra política de red.
- **C-BUG-5 se registra como 🟨 parcial, no como cerrado**: el código no tiene ningún bug de degradación (los `undefined` ya caen al fallback de `tipo-parcela` y `Instalaciones.astro` ya filtra lo que falta) — lo único que falta son los bytes. Misma categoría que el bloqueo de credenciales de Cloudflare en Fase 9: no es una tarea de código pendiente, es un recurso externo pendiente.

| Fichero destino                  | Job UUID                               | Prompt (resumen)                                                                                                          |
| -------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `tipo-premium.webp`              | `32b5b013-44b5-4bf4-9ec4-18009cbf00ef` | Parcela premium en terraza baja, sombra de pino de Alepo, mar entre troncos, luz de mediodía con sombras marcadas         |
| `tipo-autocaravana.webp`         | `2ba71b99-2b56-47a6-bcf1-af26efba53b3` | Plaza de autocaravana, toldo a medio desplegar, sombra moteada de mañana, agujas de pino en el suelo                      |
| `detalle-bungalow-interior.webp` | `f5ac46f2-f0eb-4a47-ab17-ef8ea694f924` | Interior de bungalow, madera de pino clara, cama hecha lino blanco/salvia, luz de mañana con sombra de pino en la ventana |
| `detalle-glamping-interior.webp` | `9bfdfd4b-5563-4f98-8d5b-874f76efb44b` | Interior de tienda safari, lona cruda, cama con lino natural, luz cálida moteada a través de la lona                      |
| `instalacion-piscina.webp`       | `9a9eeb15-b009-47e3-9de8-95d0d6fb0b44` | Piscina bajo pinos de Alepo, sombras largas sobre piedra, tumbonas vacías, luz de última mañana                           |
| `instalacion-restaurante.webp`   | `1cbee642-34bd-4d6a-b992-49d4e38d88b2` | Terraza-restaurante bajo lona crema entre troncos de pino, mesas sencillas, mar al fondo, luz dorada de última hora       |

Todos: `text2image_soul_v2`, sin personas, sin texto, grano de película — mismo estilo que las 6 fotos ya en `tenants/demo/content/media/`.

### 2. C5.2 — capturas reales del producto, sin red externa

El contrato del Frente C es claro: **"fake" se resuelve en el seed, nunca con mocks en el cliente**. Aplicado a una captura de pantalla: no vale maquetar el planning con `<div>` de colores (que es justo lo que la landing hace hoy, `Landing.astro:94-126`, con una nota en el propio código que dice "se sustituye por captura real cuando toque"). La captura tiene que salir del **dashboard real, con datos del seed real**.

Este contenedor no puede levantar `wrangler dev` (workerd segfaulta — el mismo motivo por el que `pnpm check` no puede correr `reset.test.ts` aquí, documentado desde C0). La sesión C1 (ADR 0023) ya estrenó el patrón que evita necesitar workerd para verificar en vivo: **`vite build` real del dashboard + un servidor Node mínimo que sirve el bundle y responde `/api/admin/*` con datos calculados a partir del MISMO generador de seed puro** (`generateSeed(2026)` de `tenants/demo/seed.ts`, `buildDemoPlano()` de `tenants/demo/plano.ts`) + Playwright/chromium. Se reutiliza aquí para C5.2:

- El servidor stub no vive en el repo (regla ya fijada en C1): es un script de sesión, descartable.
- Captura del **planning** (con el seed denso — 346 reservas visibles, agosto al 86%, gestos ya integrados) → reemplaza la maqueta CSS de `Landing.astro` → cierra `docs/BACKLOG.md` **[B3]**.
- Captura del **plano** → no hay sección de plano en la landing hoy (solo planning, `#planning`); se guarda como activo para **C6** (la guía de recepcionista/dueño lo va a necesitar) en vez de forzar una sección nueva en la landing que no estaba pedida.
- Ambas optimizadas a WebP con el mismo perfil que el resto de fotos del tenant (~2000px de lado mayor, `q:78`).

### 3. OG image — tarjeta de marca Logic2B, no foto de camping

`docs/BRAND.md` §0 es explícito: la landing de producto es superficie **Logic2B**, no del tenant — así que su OG image no puede ser una foto de Cala Sereno (eso mezclaría las dos marcas que el propio contrato manda no confundir). Se construye una tarjeta de marca estática (HTML+CSS con los tokens oklch exactos de `packages/ui/src/theme.css`/`BRAND.md` §4, isotipo `docs/brand/logo-mark.svg`, Space Grotesk para el titular) renderizada a 1200×630 con Playwright — cero fotografía, cero red externa, y respeta el antimodelo (nada de azul isométrico ni de crema+serif+terracota: es la misma paleta neutra shadcn que ya usa todo el producto).

## Consecuencias

- **C-BUG-5 queda 🟨 parcial**, bloqueado por red del contenedor, no por código — mismo tratamiento que el bloqueo de Fase 9. Recomendación directa a Andreu: correr `tenants/demo/scripts/fetch-higgsfield-fotos.mjs` desde una máquina con salida a `cloudfront.net` es una tarea de minutos.
- **C5.2 no depende de Higgsfield ni de red** — se completa entera esta sesión.
- La lista de prompts de la 1ª tanda queda **cerrada**; no hay una "2ª tanda" que decidir todavía — si en el futuro se detectan más huecos de foto de camping, es un C-BUG nuevo con su propia lista, no una reapertura de este ADR.

## Diferido con motivo

- Descarga real de las 6 fotos (bloqueada por red; script listo).
- Sección de plano en la landing (no pedida; la captura queda lista para C6).
- Fotos de más densidad (baños, exteriores adicionales) — placeholder en BACKLOG, no bloquea C5.
