# Integraciones, operación y captación — mapa comercial y técnico

> **Estado: investigación, 2026-08-04.** Este documento separa lo que ya
> existe en Logic2B de los canales que merecen discovery. Ninguna entrada de
> esta lista equivale a una integración activa, a una certificación de partner
> ni a permiso para usar una marca en la landing.

## La distinción que evita vender humo

| Etiqueta | Significa | Cómo se puede comunicar |
| --- | --- | --- |
| **Disponible** | Está construido, probado y puede activarse con las credenciales del camping. | «Disponible para tu instancia». |
| **En evaluación** | La plataforma tiene una vía técnica pública o para partners, pero falta contrato, sandbox y adapter. | «Podemos estudiar la conexión». Nunca «integramos con». |
| **Canal comercial** | Es un directorio, OTA o guía donde el camping puede anunciarse/listarse. No sincroniza inventario por sí solo. | «Te ayudamos a llevar tráfico al canal directo». |

La web y el motor tienen una prioridad comercial sencilla: primero mejorar la
reserva **directa** y medirla; después conectar inventario a terceros cuando el
contrato y el volumen de un cliente lo justifiquen. Un logo no sustituye una
sincronización de disponibilidad ni una certificación.

## 1. Integraciones del producto

### Disponibles en el código, pendientes de credenciales reales

| Área | Plataforma | Situación | Documentación oficial |
| --- | --- | --- | --- |
| Cobro | Stripe | El contrato `PaymentProvider` contempla Stripe; el cobro real requiere las credenciales y la validación del primer camping. | [Stripe API](https://docs.stripe.com/api) |
| Cobro | Redsys | Existe adaptador y documentación del TPVV; falta validación contra sandbox/comercio real. | [Redsys para desarrolladores](https://pagosonline.redsys.es/desarrolladores-inicio/) |
| Correo | Resend | Diseñado para confirmaciones y avisos; falta dominio y clave reales. | [Resend Docs](https://resend.com/docs) |

### Prioridad alta de discovery: adquisición y atribución

| Plataforma | Qué aportaría | Requisito técnico/comercial | Estado |
| --- | --- | --- | --- |
| Google Hotel Center / Hotel Prices | Mostrar precio y disponibilidad del canal directo en superficies de viajes de Google, sujeto a elegibilidad. | Feed de hoteles, precios/disponibilidad, landing de reserva y alta/aprobación de Google. | En evaluación. [Guía oficial](https://developers.google.com/hotels/hotel-prices/dev-guide) |
| Google Ads | Medir una reserva o solicitud procedente de una campaña propia. | Modelo de consentimiento, identificadores de conversión por tenant y eventos server-side auditables. | En evaluación. [Conversion management](https://developers.google.com/google-ads/api/docs/conversions/overview) |
| Meta Conversions API | Medir conversiones de campañas Meta sin depender solo del navegador. | Consentimiento previo, minimización de datos y endpoint por tenant; no instalar píxeles por defecto. | En evaluación. [Conversions API](https://developers.facebook.com/docs/marketing-api/conversions-api/) |

Estas tres son candidatas antes que una OTA: hacen visible si la web propia
convierte y permiten explicar el ahorro de comisión con datos del camping.

### Distribución y migración: solo mediante adapter y partnerización

| Plataforma | Vía publicada | Qué habría que validar antes de prometerla |
| --- | --- | --- |
| Booking.com | Portal de APIs para partners de conectividad. | Programa de partner, disponibilidad real de endpoints para campings, mapeo unidad/tipo, reglas de cancelación y sincronización bidireccional. [Booking.com APIs](https://developers.booking.com/) |
| Expedia Group | Rapid es su plataforma de APIs de alojamiento. | Contrato aplicable al caso de uso, mapeo e inventario, webhooks/confirmaciones y soporte de camping. [Expedia Group Developer Hub](https://developers.expediagroup.com/rapid) |
| SiteMinder | Plataforma y programa de partners para conectividad hotelera. | Certificación, alcance camping, coste y ownership de inventario. [SiteMinder Partners](https://www.siteminder.com/partners/) |
| Cloudbeds | Portal de desarrolladores para integraciones con PMS/canal. | Sandbox, permisos, modelo de unidades y estrategia de migración sin doble venta. [Cloudbeds Developers](https://developers.cloudbeds.com/) |
| Beds24 | API documentada para integraciones de propiedad/inventario. | Un cliente que la use, sandbox y definición de fuente de verdad. [Beds24 API](https://wiki.beds24.com/index.php/Category:API) |

**Regla de arquitectura:** cada uno necesita un adapter de distribución nuevo,
idempotencia, cola/reintento, trazabilidad y pruebas de doble reserva. No se
conecta una OTA desde el navegador ni se publican logos de estas marcas como si
fueran integraciones existentes. Se prioriza el primer partner que traiga un
cliente real; implementar cinco conectores antes de ello multiplicaría coste y
riesgo sin demostrar venta.

## 2. Canales donde posicionar cada camping

| Canal | Papel comercial | Siguiente paso honesto | Referencia |
| --- | --- | --- | --- |
| Google Business Profile / Google Travel | Descubrimiento local y enlace a la reserva directa. | Auditar ficha, categorías, fotos, reseñas y enlace de reserva de cada camping. | [Google Travel](https://www.google.com/travel/hotels) |
| ACSI / CampingCard ACSI | Audiencia europea de camping y temporada baja. | Pedir condiciones de presencia, contenido y disponibilidad; no asumir API pública. | [ACSI](https://www.acsi.eu/) · [CampingCard ACSI](https://www.campingcard.com/) |
| camping.info | Directorio europeo especializado. | Verificar plan para operadores, carga de ficha y enlace a la web directa. | [camping.info](https://www.camping.info/en) |
| Pitchup | Marketplace y motor de descubrimiento de parcelas/campings. | Abrir conversación comercial y decidir si el canal compensa su comisión y sus reglas de inventario. | [Pitchup](https://www.pitchup.com/) |
| Campings.com | Marketplace especializado, fuerte en mercado europeo. | Validar encaje geográfico, condiciones de alta y vía de sincronización antes de incluirlo en un pitch. | [Campings.com](https://www.campings.com/es/) |
| Federación Española de Campings | Presencia sectorial y acceso a red/asociaciones. | Contactar para directorio, acciones de difusión y eventos; es canal institucional, no integración. | [camping.es](https://www.camping.es/) |
| Turismo autonómico / Spain.info | Descubrimiento de destino y campañas de contenido. | Tramitar presencia con el organismo de destino correspondiente; la operación depende de cada comunidad/destino. | [Comunitat Valenciana](https://www.comunitatvalenciana.com/) · [Spain.info](https://www.spain.info/es/) |

Los directorios se ordenan por mercado objetivo, temporada y coste de
adquisición; no por el tamaño de su logo. La página de cada camping debe tener
UTMs, eventos de solicitud/reserva y una landing específica antes de comprar
tráfico.

## 3. Qué debe entrar en la documentación pública

La futura página «Integraciones y captación» debe contener:

1. Una matriz de logos con tres estados visibles: **disponible**, **en
   evaluación** y **canal comercial**.
2. Un enlace a la documentación oficial de cada plataforma y la fecha de
   revisión.
3. Una explicación de una línea del beneficio y del requisito real. Por
   ejemplo, «Google Hotel Center: posible distribución directa; requiere feed
   y alta de Google».
4. Una ficha por canal con pasos comerciales: alta de ficha, material que
   aporta el camping, UTM, evento de conversión y KPI a revisar.
5. Aviso de privacidad para Ads/Meta: no se carga seguimiento sin la base de
   consentimiento que corresponda.

Los logos se incorporarán **desde el kit oficial o una fuente permitida por la
marca**, con enlace a sus normas de uso. No se usarán para implicar partnership
ni compatibilidad antes de que el adapter esté aprobado. El catálogo debe vivir
en `apps/site` (documentación del producto), no multiplicarse por tenant.

## 4. Orden de trabajo propuesto

1. Validar el ADR 0032: variedad real de demos y este lenguaje comercial.
2. Hacer discovery con el primer camping real sobre Google Hotel Center,
   Google Ads/Meta y **su** channel manager/OTA actual.
3. Escribir un ADR por la primera integración elegida: fuente de verdad,
   mapeo, reintentos, cancelación, privacidad, sandbox y criterio de salida.
4. Publicar la página de integraciones con estados y logos verificados.
5. Añadir a la landing una sección comercial que hable de **canal directo y
   atribución**, no de una lista inflada de logos.

## 5. Lo que el sector conecta además del motor

La primera versión de este mapa estaba demasiado centrada en distribución. Dos
PMS que sirven campings y alojamiento, [Newbook](https://www.newbook.cloud/integrations/)
y [RMS](https://www.rmscloud.com/integrations/), publican familias de
integración que se repiten: control de acceso, kioscos, TPV/pagos,
contabilidad, Wi-Fi, canal, experiencia huésped y herramientas de revenue.
Eso es una señal de mercado, no una lista de funcionalidades que haya que
construir de golpe.

| Dominio | Resultado para el camping | Referencias de discovery | Prioridad |
| --- | --- | --- | --- |
| **Acceso por matrícula (ANPR/LPR) + barrera** | La reserva autoriza la entrada y salida del vehículo; recepción conserva el override. | [AXIS License Plate Verifier](https://www.axis.com/products/axis-license-plate-verifier) · [Genetec AutoVu](https://www.genetec.com/products/unified-security/autovu) | **P1** para campings con barrera y alta rotación. |
| **Llaves y cerraduras inteligentes** | Código o llave móvil temporal para bungalow, glamping, armario o sala, revocado al salir. | [Nuki Developers](https://developer.nuki.io/) | P2; muy útil donde hay alojamientos cerrados. |
| **Check-in digital e identificación** | Antes de llegar: documentos, firma, datos de viajeros y una llegada más corta. | [Chekin](https://chekin.com/) · vertical propio de Parte de viajeros | **P1** regulatorio/comercial; el envío oficial requiere su ADR propio. |
| **TPV físico y caja** | Cobrar en mostrador, bar o tienda y cuadrar el pago con la reserva. | [Stripe Terminal](https://docs.stripe.com/terminal) · [Redsys](https://pagosonline.redsys.es/desarrolladores-inicio/) | **P1** para recepción; separar cobro de reserva y POS de restauración. |
| **Facturación y contabilidad** | Factura, cierres y export para asesoría, sin reescribir las reservas. | [Holded API](https://developer.holded.com/) | P2; decidir por el software de la asesoría del cliente. |
| **Electricidad, agua y recarga EV** | Medir/autorizar consumos de parcela, vender recarga y detectar anomalías. | [OCPP — Open Charge Alliance](https://openchargealliance.org/protocols/open-charge-point-protocol/) | P2 para áreas de autocaravanas y campings con recarga. |
| **Wi-Fi y portal cautivo** | Credenciales de huésped, acceso temporal y diagnóstico de red, sin usarlo para vigilancia comercial por defecto. | [UniFi Network API](https://developer.ui.com/) | P2; primero la calidad de red, después el portal. |
| **WhatsApp y mensajería transaccional** | Confirmación, instrucciones de llegada y avisos en el canal que el huésped consulta. | [WhatsApp Business Platform](https://developers.facebook.com/docs/whatsapp/) | P2; plantillas aprobadas, opt-in y trazabilidad. |
| **Kiosco de autoservicio** | Llegadas fuera de horario, escaneo de documento, cobro/llave y llamada a recepción como excepción. | Categoría presente en [Newbook](https://www.newbook.cloud/integrations/) | P3 hasta validar que el perfil de cliente lo necesita. |
| **CRM, fidelización y reseñas** | Segmentar repetidores, pedir reseña tras la salida y medir retorno, sin mezclar marketing con datos operativos. | Se selecciona por cliente; requiere consentimiento y un contrato de datos. | P3. |
| **Actividades, alquileres y extras** | Vender desayuno, bicicletas, late checkout, actividades o paquete de mascota desde la reserva. | Primero como extras del dominio actual; APIs externas solo cuando un camping ya use un proveedor. | P3. |

### ANPR: cómo debe plantearse, no solo qué cámara comprar

Un lector de matrículas no es una llamada directa del Worker a una cámara. La
instalación debe resolver cuatro capas:

1. **Campo:** cámara LPR, barrera/relé, red y alimentación instaladas por una
   empresa habilitada de baja tensión/seguridad que visite el recinto.
2. **Edge local:** un pequeño conector en la red del camping recibe la lectura,
   habla con la controladora de barrera y se comunica hacia fuera por HTTPS
   firmado. Cloudflare no debe abrir una conexión entrante a la LAN del cliente.
3. **Core:** la reserva genera una autorización con ventana de entrada/salida,
   vehículo asociado, decisión y auditoría; recepción puede abrir o revocar sin
   depender de que la cámara acierte.
4. **Privacidad y operación:** la matrícula es dato personal. Antes de activar
   hay que fijar cartel/información, contrato con instalador/proveedor, acceso a
   los registros, retención y revisión de protección de datos. No se reutiliza
   automáticamente la retención del parte de viajeros.

La compra depende de barrera existente, distancia/iluminación, carril de
entrada/salida, cobertura y volumen de vehículos. Por ello no se elegirá una
marca ni un instalador "de catálogo" antes de una visita y una especificación
de aceptación: tasa de lectura en los dos sentidos, apertura manual segura,
funcionamiento sin Internet y registro de fallos. Axis y Genetec son referencias
para evaluar el componente LPR, no proveedores con los que Logic2B esté
integrado.

### Arquitectura común para hardware e integraciones locales

Para no convertir cada camping en un proyecto a medida, cualquier integración
de hardware debe respetar este contrato antes de comprarla:

- API local documentada o relé/controladora accesible; nunca scraping de una
  aplicación de instalador.
- Edge saliente, actualizable y monitorizado; cola local limitada cuando se
  cae Internet y reconciliación idempotente al volver.
- Un modelo explícito de **fuente de verdad**: Logic2B, el POS, el PMS previo o
  la controladora. Dos sistemas no pueden cambiar disponibilidad/cobro sin una
  regla de conciliación.
- Eventos auditables (`autorización creada`, `lectura reconocida`, `barrera
  abierta`, `fallo`, `override de recepción`) y un modo manual seguro.
- Un ADR por familia y un piloto en un solo camping antes de convertirlo en
  catálogo.

## 6. Propuesta de prioridad realista

No hace falta integrar todo para vender. El orden recomendado por impacto y
riesgo es:

1. **Parte de viajeros/check-in digital** y **TPV de recepción**: dolor diario,
   cumplimiento y conversión de la reserva en estancia.
2. **ANPR + barrera**, solo si el primer camping piloto tiene acceso vehicular
   controlado y un instalador que acepte el contrato técnico anterior.
3. **Google Hotel Center + Ads/Meta con consentimiento**: traer y atribuir
   reservas directas una vez la experiencia de llegada sea sólida.
4. **Channel manager/OTA que el primer cliente ya use**: un adapter concreto,
   no cinco logos preventivos.
5. **Cerraduras, Wi-Fi, contabilidad, energía/EV y kiosco**, escogidos por el
   modelo del camping (bungalows, autocaravanas, recepción 24h, etc.).

La página comercial puede presentar estas capacidades como una **hoja de ruta
de conexiones por tipo de camping**. Solo las filas que pasen el piloto,
contrato y pruebas se llamarán «integración disponible» y llevarán logo con
esa etiqueta.
