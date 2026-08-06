# Research 2026 — plataformas y motores de reserva para orientar las demos

> Revisión de páginas oficiales realizada el **2026-08-06**. Este análisis no
> define qué backend construir ahora; identifica qué resultados reconoce el
> mercado y cómo debe representarlos Logic Camp para vender una visión creíble.

## Resumen ejecutivo

El mercado no compra «un motor» aislado: compra una combinación de venta
directa, operación visual, cumplimiento, distribución y soporte. Los productos
maduros muestran amplitud mediante módulos, integraciones y cifras. Logic Camp
no puede ganar ahora por catálogo ni por industrialización; sí puede ganar la
conversación mediante una experiencia más clara, una web de camping realmente
cuidada y un recorrido unido desde captación hasta planning/plano.

La posición demo-first recomendada es:

> **La plataforma visual de venta directa y operación para campings
> independientes: una web que convierte y un gestor que se entiende al verlo.**

No presentar todavía Logic Camp como el sustituto operativo completo de todas
las plataformas. Presentarlo como una tecnología unificada cuya versión final
se activa según el cliente, mientras las demos enseñan el resultado.

## Referencias de mercado

| Plataforma                                                                       | Qué vende de forma visible                                                                                                                           | Señal comercial pública                                                                             | Lectura para nuestras demos                                                                                                                                                                  |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [CloudingCamp](https://cloudingcamp.com/)                                        | Plano por estado, planning Gantt, reservas, check-in con documentos/NFC, SES/INE, facturación/VeriFactu, motor, tarifas, TPV, estadísticas y accesos | 85 €/mes y 2,50 € por reserva web; prueba y sin permanencia según su web                            | Es la referencia española que hace peligroso vender solo «funciones PMS». Debemos enseñar una experiencia visual superior y no afirmar cumplimiento conectado donde solo hay prototipo.      |
| [Mastercamping / Septeo](https://www.mastercamping.com/)                         | Suite integral: PMS, motor, TPV, CRM y Business Intelligence                                                                                         | Precio bajo propuesta                                                                               | Enseña profundidad/empresa. Nuestra demo Visión debe expresar amplitud sin intentar construir la suite completa antes de vender.                                                             |
| [Camping.care](https://www.camping.care/products/property-management-system-pms) | PMS modular, motor, canales y ecosistema de producto                                                                                                 | Suscripción modular/calculada según configuración                                                   | Buen modelo visual: módulos que crecen con el camping. Refuerza Inicio → Gestión → Automatiza → Inteligente.                                                                                 |
| [Booking Experts](https://www.bookingexperts.com/camping-reservation-system)     | PMS, canales, motor, app store, BI, propietarios y CMS                                                                                               | [Starter 295 €/mes; Premium desde 495 €/mes](https://www.bookingexperts.com/pricing) en la revisión | Prueba que hay espacio de precio cuando el producto transmite operación y crecimiento. Su navegación por plataforma inspira un comparador por resultados, no una lista técnica interminable. |
| [Ctoutvert](https://www.ctoutvert.com/en/)                                       | Motor/distribución/CRM/revenue especializado en outdoor hospitality                                                                                  | Declara 4.300 campings, 36 partners OTA y conexión con 40+ PMS/channel managers                     | La conectividad genera confianza, pero construir conectores ahora sería dispersión. En demo: representar el hub y documentar qué integración se activaría con cliente.                       |
| [CampManager](https://www.campmanager.com/Booking-Management/)                   | Reservas, motor, automatización, grupos, propietarios, energía, facturación y canales                                                                | Precio bajo consulta                                                                                | Muestra la amplitud operativa que aparece con clientes maduros. Reservarla para el dossier y la demo Visión, no para el backend inmediato.                                                   |

## Qué es table-stakes y cómo enseñarlo

| Expectativa del mercado   |   Demo Inicio |            Demo Gestión |                     Demo Visión | Producción con cliente          |
| ------------------------- | ------------: | ----------------------: | ------------------------------: | ------------------------------- |
| Web móvil y venta directa |   Real visual |             Real visual |                     Real visual | Dominio, analytics y entrega    |
| Consulta/reserva          | Consulta demo |    Funnel completo demo |            Funnel + upsell demo | Email, pago y antifraude        |
| Planning/plano            |             — |    Interactivo con seed |            Interactivo a escala | Rendimiento/datos del cliente   |
| Check-in/cobro            |             — |       Estados sembrados |         Flujo completo simulado | Proveedores y conciliación      |
| Facturación/VeriFactu     |             — | Estado/ficha de muestra |              Flujo representado | Validación fiscal real          |
| SES/INE/pre-check-in      |             — |       Estado de muestra |              Flujo representado | Entorno oficial y soporte       |
| Canales/OTA               |             — |     Indicador de origen | Hub/integraciones representados | Conector elegido por demanda    |
| Automatización            |             — |              Plantillas |      Centro de automatizaciones | Colas, canales y observabilidad |
| BI/previsión/IA           |             — |    KPIs reales del seed |          Escenarios explicables | Datos, proveedor y evaluación   |

## Qué debe lucir mejor que la competencia

1. **La marca del camping**: tres webs que no parezcan el mismo template con
   colores cambiados.
2. **El recorrido unido**: anuncio → web → consulta/reserva → planning → ficha,
   sin saltos entre productos ni explicación técnica.
3. **Planning y plano**: son las imágenes firma; deben ser los momentos que se
   recuerdan y se comparten después de la reunión.
4. **La progresión**: mostrar cómo un camping pequeño empieza y cómo crece sin
   convertir la demo en una matriz de cien funciones.
5. **La inteligencia explicable**: enseñar recomendación, origen y aprobación;
   no un chat genérico pegado al dashboard.

## Implicación para el precio y el relato

- Inicio a 49 €/mes es un gancho de presencia y captación, no un PMS.
- Gestión a 149 €/mes no debe competir solo contra cuotas más bajas: la alta y
  la cuota se justifican por **web/marca + canal directo + implantación
  acompañada + experiencia operativa**, no por una checklist.
- Automatiza e Inteligente pueden enseñarse y generar conversaciones, pero se
  cotizan como alcance de lanzamiento hasta conocer datos, proveedor y uso.
- La ausencia de comisión por reserva es un argumento fuerte, pero no debe
  ocultar costes de pasarela, campañas o integraciones de terceros.

## Decisión de roadmap derivada

La investigación no cambia el orden demo-first; lo refuerza:

1. tres demos ancla con dirección de arte y recorridos completos;
2. galería/comparador y materiales de venta;
3. entrevistas y demostraciones para observar qué módulos provocan interés;
4. seis/doce variantes según objeciones reales;
5. producción e integraciones únicamente contra el alcance del primer cliente.

Intentar alcanzar ahora el catálogo de CloudingCamp, Mastercamping o Booking
Experts consumiría la capacidad antes de generar una venta. La estrategia es
mostrar una visión más deseable y conservar por escrito el camino técnico para
convertirla en entrega.
