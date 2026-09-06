# Auditoría del catálogo · 5 de septiembre de 2026

Revisión de los doce temas comerciales y Cala Sereno, sus páginas interiores,
fotografía y recorridos de uso. Los cambios son locales; no se ha desplegado ni
modificado ninguna base de datos remota.

## Correcciones

- La altura real del aviso demo y la navegación determina ahora el espacio de
  los títulos, las anclas y los paneles fijos. El barrido inicial encontró
  títulos tapados en 334 de 1.144 combinaciones de página y tamaño.
- Menús con controles de al menos 44 × 44 px, desplegables limitados por el
  alto disponible, cierre exterior/Escape, recuperación del foco y página
  actual identificada. La navegación completa aparece cuando tiene espacio.
- Buscador de fechas distribuido por ancho disponible, con fechas legibles,
  controles separados de adultos/niños, límites deshabilitados y foco visible.
  Los titulares sobre fotografía tienen un fondo más legible.
- Acceso a consultar/buscar fechas antes de la galería de alojamiento; se
  conserva el tipo elegido. Las fichas distinguen camas de dormitorios.
- Tablas de tarifas operables por teclado en ambos motores y con el nombre de la fila fijo al
  desplazarse. Cabeceras de fila y columna identificadas semánticamente.
- Contacto de La Ballena, La Carrasca, Mar de Fondo y Sol d'Hivern: el
  formulario anunciaba que no enviaba datos, pero heredaba el transporte
  persistido. Ahora utiliza el adaptador demo, muestra una confirmación
  localizada y permite copiar el resumen sin enviarlo.
- Campos de consulta con ancho mínimo controlado para WebKit y texto de
  16 px. Se corrige el desbordamiento de contacto a 320 px detectado en los
  seis idiomas de Cala Sereno.
- Catálogo comercial: búsqueda con foco visible y estado vacío anunciado;
  nombres largos adaptados a móvil. La vista ampliada utiliza un diálogo
  nativo, conserva el iframe, bloquea el fondo y permite salir con Escape
  incluso desde la demo incrustada, devolviendo el foco al control.

## Fotografía

Se inspeccionaron 179 imágenes en planchas por camping, comparando paisaje,
vegetación, arquitectura, alojamientos y escenas de vida. Se corrigieron dos
defectos de Cala Sereno: la unión vertical de dos escenas en el héroe y el
marco incorporado en la fotografía de parcela.

Las dos piezas finales se generaron con ImageGen integrado, se inspeccionaron
y se incorporaron por `foto-pipeline ingest/approve`. El héroe utiliza un
máster 3:2 de 1536 × 1024; la parcela conserva 3:2. Los prompts finales están
en `tenants/demo/fotos.json`; proveedor, huella del prompt, dimensiones y
aprobación están en `tenants/demo/fotos.estado.json`. Se actualizaron la
miniatura y la imagen social derivadas del héroe.

| Camping | Coherencia visual revisada |
| --- | --- |
| L'Olivar | Olivos, piedra seca, lona y balsa |
| Riu Clar | Ribera, bosque húmedo, pizarra y refugio |
| La Duna | Dunas, pasarelas, vehículos y módulo de servicios |
| El Delta | Arrozales, cañizo, caminos llanos y bicicletas |
| Pinada del Mar | Pinar costero, bungalows, piscina y recepción |
| Serralta | Bosque húmedo, refugios oscuros y espacio de fuego cubierto |
| Entre Vinyes | Viñedo, caliza, casas y patio |
| Els Tarongers | Naranjal, acequias, casas blancas y piscina |
| La Carrasca | Encinar, piedra, parcelas y piscina |
| La Ballena | Pinar costero, salinas, alojamientos y zona de agua |
| Sol d'Hivern | Luz invernal, almendros, larga estancia y salón |
| Mar de Fondo | Costa, laguna, alojamientos y restaurante |
| Cala Sereno | Pinar mediterráneo, cala, lona y madera; dos piezas corregidas |

## Verificación

- `pnpm check --concurrency=1`: **74/74 tareas**, repetido después de corregir
  WebKit. Vitest limitado a un proceso/hilo para evitar los timeouts de carga
  observados en la primera pasada. No se ampliaron timeouts ni se omitieron tests.
- Bundle compuesto: **580 HTML y 17.334 enlaces internos válidos**.
- Chromium: **1.553 vistas de los trece campings sin fallos** a 320, 360, 375,
  390, 430, 768, 1024 y 1366 px; idiomas adicionales de Cala Sereno a 375 px.
- Chromium: **133 escenarios de interacción sin fallos**. Incluyen siete
  tamaños/orientaciones, doce consultas con error y recuperación, reservas
  completas de los cuatro temas con motor a cuatro anchos, incluido 320 px, y las doce fichas
  comerciales en ES/EN con búsquedas, expansión y cierre.
- WebKit: **858 vistas de los trece campings sin fallos** a 320, 375 y
  768 px, incluidos los seis idiomas de Cala Sereno.
- WebKit: **65 escenarios de interacción sin fallos** a 320 y 375 px y en
  horizontal (667 × 375). Incluyen reservas completas de los cuatro temas con
  motor a 320/375 px, consultas y las doce fichas comerciales en ambos idiomas.
- E2E con Worker y D1 temporal: **10 pruebas aprobadas y una omitida por la
  condición de disponibilidad del seed**, sin fallos. Reserva completa,
  inventario agotado, caducidad del hold, estancia inválida, selector de tema
  y movimiento reducido en web, comercial y gestor. La prueba de movimiento
  reducido buscaba el antiguo texto «Restablecer datos»; ahora usa el nombre
  accesible vigente «Actualizar demo».

Las capturas e informes JSON están en `test-results/theme-catalog/`, con
subdirectorios `photos/`, `webkit/` e `interactions/`. La revisión usa motores
de navegador locales y tamaños emulados; no sustituye una prueba en un
teléfono físico. Las operaciones del motor real se verifican sobre una D1
desechable en `/tmp/logic-camp-theme-qa-state`, separada del estado de trabajo.

## Repetir la auditoría

```sh
pnpm --filter @logic-camp/api bundle:demo
node apps/web/scripts/qa-theme-catalog.mjs
node apps/web/scripts/qa-theme-interactions.mjs
QA_BROWSER=webkit QA_WIDTHS=320,375,768 node apps/web/scripts/qa-theme-catalog.mjs
QA_BROWSER=webkit QA_WIDTHS=320,375,667 node apps/web/scripts/qa-theme-interactions.mjs
```

El barrido comprueba que todos los campings del repositorio estén construidos
antes de empezar. `QA_THEME` permite limitar una repetición a un camping y
`QA_WIDTHS` seleccionar anchos. WebKit requiere tener instalado el navegador
de Playwright.
