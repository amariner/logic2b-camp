# 0037 — La ficha comercial nace del mismo relato que la landing

- **Estado:** propuesto
- **Fecha:** 2026-08-07
- **Fase:** D4-V (ficha comercial de la primera ola)

## Contexto

La galería y el comparador de L'Olivar, Pinada del Mar y Mar de Fondo ya viven
en la landing, pero Andreu todavía no dispone de una pieza autónoma para enviar
antes de una conversación o adjuntar a una propuesta. Una captura larga de la
landing no funciona bien como documento: mezcla el portfolio con el resto de la
página, no tiene paginación y pierde legibilidad al imprimir.

La ficha debe conservar la promesa comercial ya publicada —resultado, recorrido
y tamaño— sin convertirse en un segundo inventario de funcionalidades ni en una
fuente de contenido que haya que mantener a mano.

## Decisión

1. La primera ola se resume en una ficha PDF breve, A4 y descargable, con una
   versión española y otra inglesa. No se crea una aplicación, una ruta dinámica
   ni un servicio de documentos.
2. Un único generador lee `apps/site/src/content/{es,en}.json` y reutiliza
   `portfolio.items`, `portfolio.comparador` y las tres miniaturas aprobadas.
   Los textos propios de portada, descarga y cierre viven también en i18n.
3. Los PDF finales se publican como assets estáticos de `apps/site/public/` y se
   conservan asimismo en `output/pdf/` como artefactos verificables. La landing
   enlaza el idioma correspondiente con descarga nativa.
4. El documento usa la marca del producto Logic2B; la identidad de cada camping
   entra solo a través de su fotografía y su nombre. No se mezclan logotipos de
   clientes ni se inventan métricas.
5. Cada demo incluye enlaces clicables. Pago, datos, automatización e inteligencia
   se rotulan con el mismo alcance honesto de la landing: demostración ficticia,
   pago simulado y prototipos supervisados que no ejecutan cambios.
6. El generador es una herramienta editorial explícita, no parte del build normal.
   Se ejecuta al cambiar el relato o las miniaturas, evitando convertir ReportLab
   en una dependencia de producción del sitio.

## Tensiones resueltas por el equipo

- **Arquitectura / fullstack:** una fuente bilingüe y un generador compartido
  evitan mantener tres fichas artesanales o duplicar el comparador.
- **Producto / UX:** un PDF corto y enlazable sirve para enviar y para imprimir;
  organiza la elección por problema resuelto y deja el detalle técnico en las
  demos vivas.
- **UI:** el cromo es Logic2B y las tres identidades no se homogeneizan; las
  fotografías se recortan, no se sustituyen ni se regeneran.
- **SEO / frontend:** el PDF es un recurso secundario descargable. La landing
  sigue siendo la superficie indexable y el enlace no añade JavaScript ni API.
- **Backend:** no hay datos personales, estado, dinero calculado ni integración
  externa; el documento solo describe escenarios de demostración existentes.

## Consecuencias

- La ficha puede adjuntarse o abrirse sin depender de una sesión iniciada.
- Cambiar el portfolio exige regenerar los dos archivos; el script valida que
  existan exactamente las tres demos y todos los activos fuente.
- El repositorio guarda dos binarios derivados, pero su fuente, sus entradas y el
  comando de reproducción quedan versionados.
- D4-V continúa abierta: el vídeo/capturas guiadas y la campaña de muestra siguen
  siendo entregas independientes.

## Validación

- Regeneración determinista de ES y EN desde el mismo comando.
- Inspección de las páginas renderizadas a PNG, sin cortes, solapes ni texto
  ilegible; extracción de texto para comprobar títulos y avisos.
- Descarga y enlaces desde las landing ES/EN; peso y tipo MIME comprobados en el
  bundle real.
- QA a 1366 y 375 px y `pnpm check` verde.
