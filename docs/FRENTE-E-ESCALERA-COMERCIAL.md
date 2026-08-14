# FRENTE E — Escalera comercial: de la primera web al copiloto

> **Aprobado por Andreu el 2026-08-05.** Este documento define el relato
> comercial, el alcance y el orden de trabajo para sustituir la oferta pública
> actual por una escalera de cuatro niveles. **E1 y E2 están implementadas en
> la landing local**: el ADR 0033 acepta nombres, precios y condiciones; la
> representación comercial del nivel 0 se construye en E3-V. D0-V ya fijó su
> correspondencia mínima: oferta Inicio sobre el carril estático del tier
> técnico 1, con transporte de consulta separado de la persistencia heredada.
> Desde el mandato
> demo-first del 2026-08-06, la operación real se documenta y se activa cuando
> exista un cliente; no bloquea el escaparate.

## 1. Texto breve para compartir con el socio

La propuesta es ordenar Logic2B Campings como una escalera clara. Un camping
pequeño puede empezar con una web atractiva por 49 €/mes y, cuando lo necesite,
subir al sistema de gestión, la automatización y finalmente la inteligencia de
negocio. No cambia de proveedor ni vuelve a empezar: conserva su web, su marca y
sus datos mientras activa nuevas capacidades.

La progresión comercial sería:

1. **Inicio — 49 €/mes:** web atractiva y formulario de consulta que llega al
   correo de recepción. Sin gestor, motor de reservas ni base de datos del PMS.
2. **Gestión — 149 €/mes:** reservas, clientes, planning, pagos, web y motor en
   una única plataforma.
3. **Automatiza — 249 €/mes:** comunicaciones, recordatorios, reseñas,
   estadísticas y asistencia de IA para recepción.
4. **Inteligente — precio a medida:** Control total, rentabilidad, comparativas, previsiones,
   integraciones y un copiloto que permite consultar y operar el camping con
   lenguaje natural.

La IA empieza ayudando, no tomando decisiones por su cuenta: busca información,
redacta, traduce, prepara presupuestos y resume el día. Las acciones que afectan
a reservas, precios, cobros o clientes siempre se revisan y confirman.

El mensaje para el cliente es sencillo: **empieza consiguiendo consultas,
después controla el camping, luego automatiza trabajo y finalmente utiliza los
datos para decidir mejor.**

## 2. Relato para la landing

### Empieza por lo que necesitas hoy. Crece sin cambiar de sistema.

No todos los campings necesitan un motor de reservas o inteligencia artificial
desde el primer día. Logic2B permite empezar con una buena presencia online y
activar gestión, automatización e inteligencia cuando el negocio esté
preparado.

```text
Inicio           Gestión           Automatiza          Inteligente
Consigue         Pon orden         Ahorra tiempo       Decide mejor
consultas        en el camping     cada día            con tus datos
49 €/mes         149 €/mes         249 €/mes           A medida
```

Subir de nivel conserva el dominio, la web, la marca y los datos disponibles.
No hay migración a otro producto ni comisión por reserva.

## 3. Los cuatro niveles

### Nivel 0 · Logic Camp Inicio

**Una web que empieza a trabajar por ti.**

Para campings pequeños que necesitan verse profesionales, aparecer bien en
móvil y convertir visitas en consultas sin implantar todavía un programa de
gestión.

Incluye:

- Web responsive sobre una plantilla Logic2B cuidada.
- Adaptación de logotipo, colores, fotografías y datos aportados por el camping.
- Secciones esenciales: presentación, alojamientos, servicios, galería,
  ubicación y contacto.
- Formulario de consulta enviado al correo de recepción.
- HTTPS, alojamiento, mantenimiento técnico y SEO básico.
- Un idioma y un único destinatario de recepción en el alcance base.

No incluye:

- Panel de gestión, usuarios o histórico de solicitudes.
- Base de datos del PMS, disponibilidad ni precios en tiempo real.
- Motor de reservas, pagos o automatizaciones.
- Redacción, fotografía, migración o diseño completamente a medida.
- Dominio y servicios de terceros, cuando tengan coste.

**Precio objetivo:** 49 €/mes · **alta 0 €**.

Condición para que sea sostenible: contenido entregado mediante formulario
estructurado, plantilla cerrada y compromiso mínimo de 12 meses. Alternativa
comercial equivalente: 490 €/año. Si se permite cancelar el primer mes, el alta
real queda sin remunerar y el producto deja de ser escalable.

> “Sin backend” se comunica al cliente como **sin gestor ni motor**. Un
> navegador no puede enviar correo de forma fiable sin un servicio receptor. El
> ADR 0033 decidirá si el formulario usa un endpoint compartido y mínimo o un
> proveedor de formularios. En ambos casos este nivel no tendrá D1, dashboard ni
> persistencia de solicitudes.

### Nivel 1 · Logic Camp Gestión

**Todo el camping bajo control.**

Para quien quiere dejar atrás hojas de cálculo, agendas y herramientas
separadas.

- Web y motor de reservas.
- Planning y plano del camping.
- Reservas, clientes, alojamientos y tarifas.
- Pagos, check-in y check-out.
- Usuarios, permisos e informes básicos.

**Precio objetivo:** 149 €/mes · **alta desde 2.900 €**.

Resultado: recepción sabe qué está libre, quién llega, qué queda por cobrar y
qué ocurre hoy desde un solo lugar.

### Nivel 2 · Logic Camp Automatiza

**Menos tareas repetitivas. Más tiempo para los clientes.**

Incluye todo Gestión, más:

- Confirmaciones, recordatorios y seguimiento automático.
- Solicitud de reseñas y plantillas de comunicación.
- Estadísticas y comparativas operativas.
- Redacción y traducción asistidas por IA.
- Búsqueda inteligente de clientes y reservas.
- Preparación supervisada de respuestas y presupuestos.
- WhatsApp cuando la integración, el consentimiento y las plantillas estén
  disponibles.

**Precio objetivo:** 249 €/mes · **alta desde 3.900 €**.

Resultado: el sistema se ocupa de tareas que hoy dependen de que recepción las
recuerde y acelera las que todavía necesitan revisión humana.

### Nivel 3 · Logic Camp Inteligente

**De gestionar el camping a dirigirlo con mejores datos.**

Incluye todo Automatiza, más:

- Rentabilidad por alojamiento y temporada.
- Comparativas entre periodos y años.
- Previsión de ocupación e ingresos cuando exista histórico suficiente.
- Alertas de baja demanda y recomendaciones de promociones o precios.
- Segmentación de clientes recurrentes.
- Integraciones con contabilidad, accesos y channel managers.
- Copiloto para consultar y preparar acciones con lenguaje natural.

**Precio:** a medida, incluida el alta. Esta decisión del 2026-08-14 sustituye
el precio objetivo de lanzamiento fijado inicialmente por ADR 0033.

Resultado: el sistema no solo muestra información; ayuda a encontrar problemas,
explicar causas y preparar la siguiente acción.

Las integraciones específicas, el consumo extraordinario de servicios externos
y el trabajo a medida se presupuestan aparte. Ninguna recomendación de IA cambia
precios, cancela reservas, cobra o envía campañas sin confirmación humana.

## 4. Regla de upgrade

La escalera debe cumplir una promesa verificable:

- El cliente no vuelve a pagar una segunda alta completa.
- Al subir abona la diferencia de activación y cualquier trabajo nuevo real.
- Dominio, identidad y contenido se conservan.
- Los datos existentes se mantienen; el nivel 0 no promete histórico porque no
  lo almacena.
- Una capacidad planificada se muestra como “próximamente” o “piloto”, nunca
  como disponible.

## 5. Estado real del producto

| Nivel       | Estado 2026-08-05           | Qué falta antes de venderlo con este nombre                                      |
| ----------- | --------------------------- | -------------------------------------------------------------------------------- |
| Inicio      | No existe con este alcance  | Tier estático real, transporte del formulario, onboarding cerrado y demo propia  |
| Gestión     | Mayoritariamente construido | Recalibrar alcance/precio, facturación no prometida y validar alta estandarizada |
| Automatiza  | Parcial                     | Reseñas, plantillas completas, IA de recepción y WhatsApp                        |
| Inteligente | Planificado                 | Series históricas, rentabilidad, previsión, integraciones y copiloto             |

## 6. Roadmap de integración en la landing

### E0 · Decisión de producto y comercial ✅

- Aceptar o corregir el ADR 0033.
- Cerrar nombres, precios, permanencia del nivel 0 y regla de upgrade.
- Decidir el transporte del formulario y el responsable del tratamiento.
- Separar claramente “disponible”, “en desarrollo” y “visión”.

**Hecho cuando:** existe un contrato de producto que diseño, código y ventas
pueden aplicar sin interpretar.

### E1 · Modelo de contenido y página de precios ✅

- Sustituir las tres tarjetas actuales por cuatro niveles en `es` y `en`.
- Mostrar resultado antes que listado de funcionalidades.
- Añadir condiciones del nivel 0, alcance de las altas y costes de terceros.
- Explicar la diferencia entre mantenimiento, automatización, IA e
  integraciones.
- Revisar SEO y datos estructurados solo con ofertas realmente contratables.

**Hecho cuando:** `/precios/` permite elegir un nivel sin hablar con un técnico
y no presenta como disponible nada que aún no pueda contratarse.

**Cerrado 2026-08-05:** cuatro tarjetas en `es/en`, resultado antes que
funciones, precios y altas visibles, condiciones de Inicio, estados
Lanzamiento/Disponible/En desarrollo/Roadmap, SEO y guía del dueño coherentes.

### E2 · Escalera en la landing ✅

- Reemplazar el relato actual de niveles por el recorrido Inicio → Gestión →
  Automatiza → Inteligente.
- Titulares de negocio: consigue consultas, controla, ahorra tiempo, decide.
- Estado visible por nivel y CTA adecuado: contratar, pedir demo o conocer el
  roadmap.
- Conservar la demo real como prueba del nivel Gestión.
- Verificar 320/375/430/1366 px, teclado, contraste y movimiento reducido.

**Hecho cuando:** un gerente entiende en menos de un minuto dónde empieza y qué
ganará al subir.

**Cerrado 2026-08-05:** héroe reorientado a la progresión, selector por problema
de negocio y escalera 00–03 con resultado, cuota, alta, estado y CTA propio.
Revisado en 1366 y 375 px, sin desborde ni errores de consola; typecheck y build
del sitio verdes.

### E3-V · Representación vendible del nivel 0

- Construir la web Inicio como primera demo ancla, con una identidad completa.
- Representar el formulario mediante un adaptador demo con estados tipados de
  éxito, error y antispam, sin configurar un proveedor real.
- Mostrar el alcance, consentimiento y condiciones comerciales en la propia
  experiencia.
- Crear su ficha interna: entrega real, privacidad, antispam, dominio,
  cancelación y onboarding a activar con el cliente.

**Hecho cuando:** el recorrido anuncio → web → consulta se puede enseñar en
móvil y escritorio, está claramente marcado como demo y no requiere terminal,
credenciales ni infraestructura propia.

### E4-V · Gancho de campaña

- Crear una demo clicable de un microcamping con nivel 0.
- Preparar una landing de campaña “Tu web por 49 €/mes, sin alta”.
- Explicar de forma visible la permanencia/contratación anual y el alcance.
- Representar visita → formulario → contacto comercial; analytics real queda
  documentado para activación con consentimiento.

**Hecho cuando:** el anuncio puede recorrerse hasta una consulta de demo y ventas
puede enseñar exactamente qué recibe el cliente.

### E5-V · Automatización e IA representadas

- Diseñar escenarios navegables de reseñas, plantillas, redacción, traducción,
  resumen y preparación del día.
- Usar resultados de muestra coherentes y siempre presentarlos como borradores
  supervisados.
- Documentar modelo/proveedor, permisos, coste, evaluación y observabilidad que
  habrá que activar con un cliente.

**Hecho cuando:** un prospecto entiende qué tiempo ahorraría y ninguna pantalla
presenta una respuesta precalculada como IA operativa real.

### E6-V · Inteligencia y copiloto representados

- Representar series, rentabilidad, previsión, recomendaciones e integraciones
  sobre un dataset demo coherente.
- Hacer explicable cada recomendación: datos de origen, motivo, incertidumbre y
  acción propuesta.
- Simular el copiloto sobre un catálogo cerrado de acciones y confirmaciones.
- Documentar servicios tipados, permisos, evaluación e integraciones reales;
  no construirlos hasta conocer el alcance del primer cliente.

**Hecho cuando:** la demo explica el valor y sus límites sin prometer que el
copiloto o las integraciones están ya conectados.

## 7. Orden recomendado

`E0 ✅ → E1 ✅ → E2 ✅ → D0-V → E3-V/E4-V → E5-V/E6-V`

E5-V y E6-V aparecen con estado explícito. Sus precios siguen siendo objetivos
de lanzamiento y su versión productiva no se contrata hasta estimarla contra un
caso real.
