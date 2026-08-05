# FRENTE E — Escalera comercial: de la primera web al copiloto

> **Aprobado por Andreu el 2026-08-05.** Este documento define el relato
> comercial, el alcance y el orden de trabajo para sustituir la oferta pública
> actual por una escalera de cuatro niveles. **E1 y E2 están implementadas en
> la landing local**: el ADR 0033 acepta nombres, precios y condiciones; la
> viabilidad operativa del nivel 0 se verifica en E3 antes de venderlo a escala.

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
4. **Inteligente — 399 €/mes:** rentabilidad, comparativas, previsiones,
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
49 €/mes         149 €/mes         249 €/mes           399 €/mes
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

**Precio objetivo:** 399 €/mes · **alta desde 5.900 €**.

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

### E3 · Producto mínimo del nivel 0

- Añadir un tier estático que no genere rutas ni chunks de motor/dashboard.
- Resolver el formulario mediante el mecanismo aceptado en el ADR.
- Protección antispam, consentimiento, privacidad, estados de éxito/error y
  prueba extremo a extremo.
- Onboarding por formulario estructurado, con límites que impidan trabajo a
  medida accidental.
- Medir tiempo real de alta; objetivo máximo: una hora de operación humana.

**Hecho cuando:** una web Inicio nace, recibe una consulta en recepción y puede
cancelarse sin dejar infraestructura o datos huérfanos.

### E4 · Demo y gancho de campaña

- Crear una demo clicable de un microcamping con nivel 0.
- Preparar una landing de campaña “Tu web por 49 €/mes, sin alta”.
- Explicar de forma visible la permanencia/contratación anual y el alcance.
- Medir visita → formulario → contacto comercial sin instalar seguimiento sin
  consentimiento.

**Hecho cuando:** el anuncio puede recorrerse hasta una consulta real y ventas
puede enseñar exactamente qué recibe el cliente.

### E5 · Automatización e IA de recepción

- Completar reseñas y plantillas deterministas antes de llamarlas IA.
- Añadir redacción, traducción y resumen como borradores supervisados.
- Construir después el asistente de consulta con herramientas de solo lectura.
- Registrar coste, latencia, aceptación de borradores y errores por caso de uso.

**Hecho cuando:** Automatiza ahorra tiempo medible y ninguna operación sensible
depende de una respuesta generativa sin confirmar.

### E6 · Inteligencia y copiloto

- Series temporales y rentabilidad calculadas de forma determinista.
- Previsión solo para campings con datos suficientes y con error medido.
- Recomendaciones con explicación, límites y aprobación humana.
- Integraciones escogidas por demanda real del primer cliente.
- Copiloto de lenguaje natural sobre servicios tipados del PMS, nunca SQL o D1
  directo.

**Hecho cuando:** una recomendación puede explicar sus datos de origen, su
incertidumbre y la acción que propone.

## 7. Orden recomendado

`E0 ✅ → E1 ✅ → E2 ✅ → E3 → E4 → E5 → E6`

E5 y E6 aparecen con estado explícito, pero sus precios siguen siendo objetivos
de lanzamiento hasta medir coste y uso real.
