# 0038 — La campaña demo es un recorrido estático, no una integración publicitaria

- **Estado:** propuesto
- **Fecha:** 2026-08-08
- **Fase:** D4-V (campaña de muestra de la primera ola)

## Contexto

La primera ola ya se puede recorrer desde la landing y compartir como ficha
comercial. Falta la primera escena del relato de Mar de Fondo: enseñar cómo una
campaña propia lleva a la web del camping y termina en una reserva directa.

El objetivo es comercial y visual. No existe una cuenta publicitaria contratada,
un píxel de conversión ni una campaña con rendimiento medido. Copiar el cromo de
una plataforma o inventar conversiones confundiría una muestra con una operación
real, y añadir un proveedor no mejoraría el recorrido que el prospecto necesita
ver.

## Decisión

1. La landing incorpora una sección bilingüe con tres formatos de Mar de Fondo:
   anuncio de búsqueda, display 300×250 y feed 1080×1080.
2. Las piezas son HTML y CSS estáticos. Reutilizan una fotografía aprobada del
   tenant mediante import de Vite; no duplican ni regeneran el activo y no añaden
   JavaScript al sitio.
3. Cada formato enlaza a `/demos/mardefondo/` con una combinación UTM ficticia y
   distinta, pero comparte la campaña `mar_de_fondo_agosto`. El destino conserva
   `#mostrador` para que el recorrido continúe en disponibilidad.
4. Las tres piezas muestran el rótulo «Creatividad de ejemplo». La sección declara
   además que no existe cuenta publicitaria ni medición real y que el pago del
   recorrido es simulado, sin cargo.
5. No se copian logotipos, controles ni cromo de Google, Meta u otra plataforma.
   Los formatos se reconocen por proporción y jerarquía; la marca visible es la
   del camping ficticio.
6. El argumento se limita a campaña propia → web propia → reserva directa. No se
   prometen ROAS, conversiones, comisiones evitadas ni resultados de una campaña
   que nunca ha existido.

## Tensiones resueltas por el equipo

- **Arquitectura / fullstack:** una sección y un activo fuente sostienen los tres
  formatos; no aparece una aplicación ni un pipeline por tenant.
- **Producto / UX:** el recorrido es clicable y explica qué sucede después del
  anuncio. El alcance demo aparece antes de entrar, no escondido en una nota legal.
- **UI / frontend:** la pieza usa la identidad de Mar de Fondo dentro del cromo
  Logic2B, mantiene foco de teclado y se reordena sin desborde a 375 px.
- **SEO:** el contenido sigue siendo HTML estático, la fotografía es un `<img>`
  versionado y la sección no crea una página indexable adicional.
- **Backend:** no hay eventos, datos personales, dinero calculado ni llamadas
  externas. Las UTM son solo parte del enlace de demostración.

## Consecuencias

- D4-V puede demostrar captación → reserva sin configurar infraestructura real.
- El contenido publicitario se localiza junto al resto de la landing y la imagen
  sigue teniendo una única fuente aprobada en el tenant.
- Una campaña productiva continúa requiriendo cuenta, consentimiento, medición,
  presupuesto y objetivos reales; nada de eso queda implícitamente activado.
- D4-V permanece abierta únicamente por el vídeo/captura guiada.

## Validación

- Los tres enlaces contienen `utm_source`, `utm_medium`, `utm_campaign`,
  `utm_content` y terminan en `#mostrador`.
- Build ES/EN y guardia de enlaces internos verdes.
- QA a 1366 y 375 px: tres formatos visibles, cero desborde, imágenes rotas,
  errores de consola o peticiones fallidas; foco visible y contenido accesible con
  movimiento reducido.
- `pnpm check` verde o fallo ambiental ya documentado revalidado en aislamiento.
