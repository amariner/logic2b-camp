# TARIFAS LOGIC2B CAMPINGS — modelo comercial v2

> Modelo aceptado el 2026-08-05 y actualizado el 2026-08-14 para que
> Inteligente sea precio a medida. Publica precios transparentes sin
> confundir producto, puesta en marcha y trabajo a medida. Revisar después de
> los tres primeros clientes. Importes sin IVA. Contrato completo en el
> ADR 0033 y ejecución en `docs/FRENTE-E-ESCALERA-COMERCIAL.md`.

## 1. Principios

1. **Alta y cuota son cosas distintas.** El alta remunera configuración,
   diseño, carga de inventario y salida a producción. La cuota mantiene el
   producto, la infraestructura y el soporte ordinario.
2. **Sin comisión por reserva.** Las comisiones de Stripe/Redsys, dominio,
   correo transaccional extraordinario u otros terceros se repercuten al coste
   cuando apliquen; Logic2B no cobra un porcentaje de la venta.
3. **El mantenimiento correctivo del producto está incluido.** Una avería o una
   actualización de seguridad no consume bolsa de horas. Cambios de contenido,
   nuevas integraciones y funcionalidades propias sí son desarrollo.
4. **Inicio es un gancho acotado, no un proyecto web ilimitado.** Los 49 €/mes
   funcionan con alta 0 €, un idioma, un único destinatario en recepción,
   material entregado por el camping y compromiso de 12 meses o 490 €/año. No
   incluye backend, motor de reservas ni histórico de consultas.
5. **No vender horas de IA; vender alcance y responsabilidad.** Las horas sirven
   para estimar margen y capacidad, no para penalizar la eficiencia.

## 2. Planes de producto

| Paso | Plan        | Alta desde |     Cuota | Estado        | Resultado principal                                                     |
| ---: | ----------- | ---------: | --------: | ------------- | ----------------------------------------------------------------------- |
|   00 | Inicio      |        0 € |  49 €/mes | Lanzamiento   | Web atractiva + formulario directo al email de recepción                |
|   01 | Gestión     |    2.900 € | 149 €/mes | Disponible    | Reservas, clientes, planning, pagos, web y motor en una sola plataforma |
|   02 | Automatiza  |    3.900 € | 249 €/mes | En desarrollo | Comunicaciones, tareas repetitivas e IA supervisada                     |
|   03 | Inteligente | A medida | A medida | Roadmap · Control total | Operaciones, BI, previsiones, integraciones y copiloto con confirmación humana |

Las cifras «desde» presuponen material utilizable entregado por el camping, un
catálogo razonable y adaptación dentro de los puntos de configuración actuales.
Migraciones complejas, fotografía, redacción extensa o integraciones heredadas
se presupuestan aparte. Automatiza e Inteligente expresan la dirección y el
precio objetivo; no se presentan como funcionalidad disponible hoy.

### Referencias usadas (consulta 2026-08-03)

- [CloudingCamp](https://cloudingcamp.com/) publica 85 €/mes todo incluido más
  2,50 € por reserva web. Es el comparable español más directo y marca el suelo
  visible de un PMS especializado; Logic2B separa niveles y no cobra por reserva.
- Las referencias españolas de mantenimiento sitúan una web profesional activa
  aproximadamente entre 40 y 200 €/mes según alcance; cuando el software es SaaS,
  infraestructura, correctivos y actualizaciones forman parte de la cuota. Véase
  [Plugcore](https://plugcore.com/es/blog-y-noticias/cuanto-cuesta-el-mantenimiento-web)
  y [Vibra Marketing](https://vibramarketing.es/noticias/mantenimiento-web-mensual-que-incluye-precios-2026).
- El contrato fundador de este repositorio fijaba dos anclas comerciales:
  empezar la conversación de la web alrededor de 60 €/mes y la del motor en
  250 €/mes (`LOGIC-CAMP-Super-Prompt.md` §2). Inicio baja a 49 €/mes porque
  elimina alta, backend e histórico y exige compromiso; Automatiza conserva el
  ancla de 249 €/mes para el escalón en el que entra la IA operativa.

Estas referencias no calculan el margen de Logic2B. Ese cálculo lo darán las
tres primeras demos mediante la fórmula de §6; si no deja margen, cambia el alta
o el alcance, no se finge que el trabajo cuesta menos.

## 3. Qué incluye la cuota

- Alojamiento, HTTPS y operación de la web pública en Cloudflare.
- En Gestión y superiores, operación de la instancia y base de datos aislada.
- Actualizaciones funcionales generales y parches de seguridad.
- Copias/exportación según el runbook del producto.
- Monitorización técnica y resolución de incidencias del producto.
- Soporte por email en horario laboral, con respuesta objetivo de 2 días laborables.
- Pequeñas correcciones de contenido durante el alta; no una bolsa mensual.

No incluye dominio, campañas, producción de contenido recurrente, comisiones de
pasarela, servicios de terceros, cambios de marca posteriores ni evolutivos
exclusivos del cliente.

## 4. Desarrollo y mantenimiento evolutivo

| Modalidad               |  Precio | Uso                                                                                       |
| ----------------------- | ------: | ----------------------------------------------------------------------------------------- |
| Diagnóstico y propuesta |   290 € | Auditoría, alcance, riesgos y presupuesto cerrado; descontable si se contrata el proyecto |
| Bolsa 5 h               |   350 € | Cambios concretos y pequeños, 70 €/h efectiva                                             |
| Bolsa 10 h              |   650 € | Mejoras agrupadas, 65 €/h efectiva                                                        |
| Sprint 20 h             | 1.200 € | Entrega acotada con revisión, 60 €/h efectiva                                             |
| Urgencia                |  90 €/h | Intervención prioritaria fuera del SLA ordinario, mínimo 2 h                              |

Las bolsas caducan a los seis meses y se consumen únicamente con trabajo
aceptado. Antes de empezar se entrega una estimación; si cambia el alcance se
vuelve a aprobar. Una funcionalidad útil para todos puede incorporarse al core
sin cobrar al cliente el coste completo de propiedad.

## 5. Packs de servicios

- **Lanzamiento** — incluido en cada alta: configuración, carga inicial,
  verificación y formación de 60 minutos.
- **Migración** — desde 600 €: importación de clientes/reservas desde una fuente
  estructurada. Se presupuesta después de revisar la muestra.
- **Identidad y contenido** — desde 900 €: dirección visual, adaptación de marca
  y redacción de las páginas principales cuando el camping no entrega material
  listo.
- **SEO local de salida** — 490 €: investigación breve, titles/descriptions,
  Search Console, ficha de negocio y medición inicial. No incluye SEO mensual.
- **Campaña de lanzamiento** — desde 750 € más inversión: creatividades y
  configuración de campaña. La compra de medios y el seguimiento recurrente se
  presupuestan aparte.

## 6. Revisión con datos

Durante la producción de las demos se anotan **horas por bloque**, no cada
intervención: identidad/contenido, inventario/tarifas, configuración, QA y
publicación. Con tres demos se calcula:

`coste de alta = horas × coste interno objetivo + costes directos + 25 % de colchón`

El registro exhaustivo de intervenciones queda para el final, como decisión de
producto. Lo necesario ahora es conocer el coste de producir una demo vendible
y comprobar que las altas publicadas dejan margen.
