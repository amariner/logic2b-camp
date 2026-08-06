# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito tras el checkpoint de D2-V (sesión 83, 2026-08-06). No rehacer el
> adaptador, dataset, plano ni contenido: están implementados y verificados.

## Estado en una línea

Pinada del Mar ya recorre solicitud → gestor → planning → ficha sin API ni
credenciales, pero la cola fotográfica falló antes del primer resultado y D2-V
no puede cerrarse ni publicarse sin sus activos y QA visual.

## Objetivo único: reanudar y cerrar D2-V · Pinada del Mar

1. Leer el checkpoint visual al principio de `PROGRESS.md` y reanudar con un
   **lote nuevo** de máximo dos imágenes; no reenviar el lote fallido.
2. Completar, siempre 2×2 con resumen y pausa de 5 segundos, las diez piezas:
   `hero-calle`, `hero-bungalows`, `parcela`, `bungalow-exterior`,
   `bungalow-interior`, `mobil-home`, `recepcion`, `calle-pinos`,
   `piscina-familiar`, `textura-lona`.
3. Validar continuidad de geografía/luz y producir derivados WebP/JPG; conservar
   originales sin modificarlos y usar thumbnails para inspección cuando existan.
4. Enlazar las piezas a las claves ya declaradas en `tenants/pinadamar/data.ts`
   y `content/es.json`; añadir los derivados de recepción/piscina/entorno que
   necesiten las páginas, sin copiar fotos de Cala o L'Olivar.
5. Construir `pnpm --filter @logic-camp/api bundle:demo` y recorrer desde
   `/demos/pinadamar/` la solicitud `PM-WEB-001` hasta planning, plano y ficha.
6. Verificar `?demoState=loading|error|empty`, solape, unidad inactiva, reset,
   teclado/foco, reduced motion, contraste, enlaces y ausencia de red `/api`.
7. QA a 375 y 1366 px y tres capturas firma: solicitud nueva, planning denso y
   plano conservando fecha/unidad. Después ejecutar `pnpm check` y cerrar D2-V.

## Ya terminado — no repetir

- `tenants/pinadamar`: identidad, contenido, paleta, config y 110 unidades.
- Adaptador tipado `apps/dashboard/src/demo/pinadamar.ts`: 42 solicitudes en
  cuatro idiomas, 84 estancias, estados forzables, reset y plano propio.
- `demo-session`: persistencia reversible web↔gestor en el mismo navegador.
- Flujo nueva → contactada → convertida y salto a planning con fecha/unidad.
- Segundo build del dashboard, `noindex`, bundle/link-check y tests de fixture.
- `pnpm check` 50/50 y recorrido headless sin peticiones `/api`.

## Hecho cuando

- Las diez fotografías están validadas e integradas sin romper la cola visual.
- El guion de ocho minutos funciona desde un enlace, también a 375 px.
- Planning, plano y ficha conservan la estancia, fecha y unidad de la consulta.
- El bundle compuesto y `pnpm check` están verdes y existen tres capturas firma.
- `PROGRESS.md` declara D2-V cerrado y D3-V como siguiente trabajo, no antes.

## Regla de alcance

- No abrir Mar de Fondo, Automatiza, Inteligente ni D4-V hasta cerrar D2-V.
- No crear D1, Worker, usuarios, email, pagos ni infraestructura por marca.
- No reexaminar imágenes de L'Olivar ni sustituir las diez fotos por placeholders.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
