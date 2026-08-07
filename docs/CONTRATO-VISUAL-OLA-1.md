# Contrato visual y comercial — primera ola de demos

> **D0-V cerrado el 2026-08-06.** Este documento convierte la estrategia
> demo-first en un encargo de producción para las tres anclas de la primera
> ola. No decide un host, una D1 ni un despliegue por camping. Sí fija qué se
> ve, qué historia se cuenta, qué activos hacen falta y dónde termina la demo.
>
> Fuentes: [`ESTRATEGIA-DEMO-FIRST.md`](ESTRATEGIA-DEMO-FIRST.md),
> [`FRENTE-D-ESCAPARATE.md`](FRENTE-D-ESCAPARATE.md),
> [`DOSSIER-ACTIVACION-PRODUCCION.md`](DOSSIER-ACTIVACION-PRODUCCION.md) y
> [`RESEARCH-PLATAFORMAS-RESERVA-2026.md`](RESEARCH-PLATAFORMAS-RESERVA-2026.md).

## 1. Decisión de la primera ola

| Ancla       | Demo                                           | ICP que debe reconocerse                                                                                | Problema que abre la conversación                                                          | Promesa                                                                      | CTA comercial                        |
| ----------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------ |
| **Inicio**  | **Camping L'Olivar** (`olivar`)                | Propietaria de un camping familiar de 12–30 unidades, sin equipo digital ni PMS que quiera sustituir    | La web parece antigua, no transmite el lugar y las peticiones llegan por canales dispersos | **Una web que parece tu camping y convierte visitas en consultas directas.** | «Quiero una web así para mi camping» |
| **Gestión** | **Camping Pinada del Mar** (`pinadamar`)       | Gerencia/recepción de un camping mediano de 70–140 unidades, con dos o más personas y calendario manual | Se pierden solicitudes, no hay una vista única de ocupación y recepción repite trabajo     | **De la consulta al planning, sin copiar datos entre herramientas.**         | «Quiero ver mi operativa en Logic2B» |
| **Visión**  | **Camping Resort Mar de Fondo** (`mardefondo`) | Dirección de un resort de 180–350 unidades que ya usa software, canales y campañas                      | Tiene datos y herramientas, pero no una experiencia unida ni decisiones explicables        | **Venta directa, operación y decisiones en una sola experiencia visual.**    | «Diseñemos el alcance de mi resort»  |

Las tres marcas forman una escalera, no tres productos aislados:

1. L'Olivar vende **presencia y captación**.
2. Pinada del Mar conecta **captación y operación**.
3. Mar de Fondo enseña la **visión completa y ampliable**.

La lectura no depende de conocer tiers, D1, Workers ni integraciones. Un
prospecto debe entender el salto mirando las pantallas y recorriendo una tarea.

### Decisiones descartadas

- **Cala Sereno no ocupa una de las tres anclas**: sigue siendo la demo
  canónica y la base funcional, pero usarla otra vez no demostraría una fábrica
  visual.
- **La Duna no abre la ola**: es más llamativa, pero una marca vanlife joven
  representa peor al comprador inicial de 49 €/mes que L'Olivar.
- **Els Tarongers no sustituye a Pinada del Mar**: la materia de naranjal ya
  existe en propuestas antiguas, pero el camping de pinada costera conecta de
  forma más directa Inicio → Gestión → Visión sin parecer un caso de
  agroturismo.
- **No se crean tres backends**: cada interacción usa el soporte mínimo de §6.

## 2. Contrato común de fábrica

### 2.1. Lo que comparten

- Un solo código de web pública y un solo producto Logic2B.
- Una carpeta de tenant por identidad: `tenants/olivar/`,
  `tenants/pinadamar/` y `tenants/mardefondo/`.
- La oferta llama **nivel 0** a Inicio. Para D1-V se conserva `tier: 1` como
  carril técnico de build estático —es el que ya elimina motor/dashboard— y se
  selecciona un transporte tipado `enquiryTransport: 'demo'`. No se presenta
  Camp Web/tier 1 como producto ni se activa su persistencia heredada.
- Identificadores lógicos estables y enlaces bajo `/demos/{slug}/`; esto no
  obliga a un host, Worker o base por demo.
- La estructura de contenido tipada existente, los papeles fotográficos ya
  admitidos por `apps/web` y las fuentes optimizadas **Clash Display + Inter**.
- Datos y estados deterministas. Cero `Math.random()` o respuesta inventada
  dentro de un componente.
- Un rótulo persistente y legible: **«Demostración ficticia · los datos se
  restablecen»**. En formularios: **«Demostración: no enviaremos tus datos»**.
- Web de tenant con su marca; gestor, automatización e inteligencia con marca
  Logic2B. Nunca se aplica el tema del camping al dashboard entero.
- QA mínimo a 375 y 1366 px, teclado, foco, reduced motion, contraste AA,
  estados de carga/error/vacío/éxito y `noindex`.

### 2.2. Lo que debe cambiar de verdad entre marcas

No basta con sustituir cinco hex. Cada demo cambia al menos cuatro de estos
seis planos: encuadre del héroe, luz, densidad, ritmo tipográfico, inventario,
voz. La navegación y los componentes pueden compartirse; la percepción no.

| Plano           | L'Olivar                                         | Pinada del Mar                                   | Mar de Fondo                                               |
| --------------- | ------------------------------------------------ | ------------------------------------------------ | ---------------------------------------------------------- |
| Luz             | Mañana seca, sombra irregular de olivo           | Mediodía filtrado por pino y reflejo marino      | Última hora limpia, agua y arquitectura de resort          |
| Encuadre        | Cercano, táctil, bajo; manos/objetos sin rostros | Recorridos y capas: calle, parcela, recepción    | Abierto y geométrico: escala, piscina, catálogo            |
| Densidad        | Mucho aire, pocas decisiones                     | Información útil y ritmo de operación            | Catálogo amplio, cifras y vistas panorámicas               |
| Voz             | Propietaria, directa, local                      | Recepción clara, resolutiva                      | Dirección segura, precisa, sin grandilocuencia             |
| Inventario      | 18 parcelas + 4 tiendas                          | ~110 unidades: parcelas, bungalows y mobil-homes | ~300 unidades: parcelas, bungalows, glamping y mobil-homes |
| Gesto memorable | Consulta sencilla que termina bien               | Solicitud que aparece en planning/plano          | Escala operativa + recomendación explicada y aprobable     |

### 2.3. Regla de fotografía

Fotografía editorial documental, creíble como un mismo establecimiento:

- materia antes que postal: corteza, lona, cal, arena, agua, sombra;
- una sola geografía, hora y lenguaje de color por demo;
- sin rostros reconocibles, texto generado, marcas, matrículas legibles, HDR,
  saturación de folleto ni arquitectura imposible;
- reservar espacio negativo en el héroe para titular/CTA a 375 y 1366 px;
- cada lote se valida como conjunto antes de entrar en contenido;
- WebP/AVIF responsive, héroe con `fetchpriority`, resto lazy y dimensiones
  explícitas.

Las imágenes generadas o de muestra son material de una ficción comercial, no
prueba de que exista el establecimiento. La ficha de la demo lo declara.

**Flujo Codex (decisión de Andreu, 2026-08-07):** el modelo integrado de mayor
calidad disponible es el proveedor principal. Si el manifiesto acumula dos
fallos técnicos registrados antes de producir bytes, `foto-pipeline.mjs` abre su
circuito y usa el fallback controlado de Higgsfield en los lotes restantes; no
hay cambio silencioso ni reintentos de generación a ciegas. Se generan como
máximo **2 piezas por tanda** y se registra proveedor, modelo, trabajo y huella
del prompt en `fotos.estado.json`. Cada pareja queda en `.staging` y solo
`approve`, después de inspeccionarla, la incorpora al contenido. Prompt,
proporción, papel y nombre final viven en
`tenants/{slug}/fotos.json`; al repositorio entran únicamente activos finales
locales, aprobados y optimizados. Véase ADR 0035.

## 3. Ancla Inicio — Camping L'Olivar

### 3.1. Marca y dirección de arte

**Territorio:** microcamping familiar del Maestrat, entre bancales de olivos,
muros de piedra seca y una masía encalada. No es lujo rural ni glamping de
revista: es pequeño, cuidado y tangible.

**Personalidad:** serena, honesta, próxima. Habla de sombra, silencio, pan,
aceite y noches frescas; evita «experiencia única», «paraíso» y «desconecta».

**Paleta de partida** — cinco colores, que D1-V deberá convertir a tokens y
validar en contraste:

| Papel         | Hex       | Uso                                  |
| ------------- | --------- | ------------------------------------ |
| Tinta carbón  | `#272820` | Texto y acciones de máxima jerarquía |
| Cal           | `#F3EFE3` | Fondo principal                      |
| Piedra        | `#C9BDA4` | Bordes, superficies y separadores    |
| Hoja de olivo | `#566044` | Enlaces, foco y acción de marca      |
| Barro cocido  | `#A85E3B` | Acento corto, nunca texto largo      |

**Tipografía:** Clash Display 500/600 para titulares cortos con caja normal e
Inter para cuerpo. Se reutilizan las fuentes existentes; la identidad nace del
ritmo, el espacio y la materia, no de añadir una descarga.

**Marca:** wordmark «L'Olivar» sobrio, sin escudo ilustrado. El apóstrofo y una
línea corta de bancal pueden formar el gesto, pero el primer entregable puede
ser tipográfico. Favicon monograma **O**/hoja de una tinta, legible a 32 px.

### 3.2. Historia guiada — 5 minutos

1. **Reconocimiento (45 s):** abrir la home móvil. «Esto no parece una
   plantilla de reservas: parece el camping.» Enseñar héroe, promesa y tamaño.
2. **Elección (75 s):** bajar a las dos formas de quedarse y abrir la ficha de
   una tienda. Ver fotos, capacidad, servicios y tarifa orientativa.
3. **Confianza (60 s):** recorrer entorno e instalaciones: piscina no; balsa,
   sombra, baños y producto local sí. La contención demuestra que el contenido
   responde al negocio.
4. **Conversión (90 s):** volver a «Consulta tus fechas», completar una
   petición y ver confirmación con resumen copiables. El rótulo deja claro que
   no se envía nada.
5. **Cierre (30 s):** «Esto es Inicio: marca, web y canal directo. Cuando el
   camping necesite operación, no rehacemos la web; sube a Gestión.» CTA.

### 3.3. Pantallas y estados

| Orden | Pantalla              | Qué debe verse                                              | Interacción/estado obligatorio                                                         | Soporte                 |
| ----: | --------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------- |
|     1 | Home                  | Héroe, 22 unidades, dos familias de estancia, entorno y CTA | Navegación móvil, foco, imagen LCP y anclas                                            | Estático/config         |
|     2 | Alojamientos          | Parcela entre olivos + tienda premontada                    | Lista, ficha, galería y tarifa orientativa                                             | Config + fixture tipado |
|     3 | Ficha de tienda       | Capacidad, cama, sombra, baño cercano, condiciones          | CTA conserva el alojamiento elegido                                                    | Estático/config         |
|     4 | Entorno/instalaciones | Masía, piedra seca, senderos, balsa y obrador cercano       | Contenido realista, sin instalaciones de resort                                        | Estático/config         |
|     5 | Consulta              | Fechas, grupo, estancia, contacto y mensaje                 | Éxito normal; `?demoState=error` y `?demoState=spam` reproducen error/antispam para QA | Adaptador demo común    |
|     6 | Confirmación          | Resumen, siguiente paso y CTA comercial                     | No código de reserva ni falsa entrega por email                                        | Fixture determinista    |

### 3.4. Activos de producción

**Imprescindibles (8):**

1. `hero-dia`: tienda y parcela bajo olivos, luz de mañana, espacio negativo.
2. `hero-anochecer`: masía/tienda con luz cálida y cielo aún azul.
3. `tipo-parcela`: suelo firme, muro de piedra, mesa sencilla.
4. `tipo-tienda`: tienda premontada de lona cruda, nada de resort.
5. `detalle-tienda-interior`: cama, lino y estructura de madera.
6. `instalacion-balsa`: pequeña lámina de agua o alberca creíble y segura.
7. `entorno-piedra-seca`: camino/bancal, sin postal turística.
8. `textura-lona`: sombra de hoja sobre cal o lona para la firma transversal.

**Derivados:** favicon SVG, apple touch icon, OG 1200×630, miniatura 16:10,
capturas 375/1366 de home y confirmación. No se genera un logo complejo antes
de comprobar que el wordmark funciona en cabecera y móvil.

**Momentos capturables:** héroe móvil con CTA; ficha de tienda con galería;
confirmación de consulta con el sello «demostración» visible.

### 3.5. Hecho cuando

- Un enlace abre el recorrido completo sin login, terminal ni credenciales.
- En una captura sin contexto se reconoce interior seco/olivar, no Cala Sereno.
- El build usa el carril técnico estático (`tier: 1`) para representar el nivel
  comercial 0 y no contiene motor, funnel ni dashboard.
- El formulario nunca envía ni persiste PII y explica qué ocurriría después.
- No hay `__TODO__`, fotos de Cala Sereno ni botones muertos.

## 4. Ancla Gestión — Camping Pinada del Mar

### 4.1. Marca y dirección de arte

**Territorio:** camping costero mediano bajo pinada litoral, con calles de
arena compactada, lona verde, bungalows sobrios y recepción muy activa.

**Personalidad:** práctica, familiar y luminosa. Menos contemplativa que
L'Olivar: aquí se nota el volumen y el trabajo de recepción.

**Paleta de partida:** tinta `#1E2925`, hueso `#F3F0E8`, arena `#C8B58F`,
pino `#245845`, sal marina `#5F8D91`. Clash Display 600 en titulares más
compactos; Inter y cifras tabulares en fechas/ocupación.

**Marca:** wordmark horizontal «Pinada del Mar» con un corte simple entre
pinada y horizonte. Sin árbol ilustrado ni ola genérica.

### 4.2. Historia guiada — 8 minutos

1. Entrar por la web como una familia que busca bungalow para seis noches.
2. Enviar una solicitud sin pago y conservar su código de demostración.
3. Cambiar al gestor Logic2B: portada de hoy con nueva solicitud visible.
4. Abrir la solicitud, revisar mensaje/idioma y marcarla contactada.
5. Convertirla en estancia de muestra y localizarla en el planning.
6. Saltar al plano para explicar ubicación y volver a la ficha sin perder
   fecha/unidad.
7. Cerrar con llegadas/salidas y la idea: «una sola historia, de la web al
   mostrador».

### 4.3. Pantallas y soporte

| Superficie | Pantalla/momento       | Soporte demo                             | Etiqueta                         |
| ---------- | ---------------------- | ---------------------------------------- | -------------------------------- |
| Tenant     | Home + alojamientos    | Config/contenido/fotos                   | «Camping ficticio» en pie/banner |
| Tenant     | Solicitud sin cobro    | Adaptador demo con persistencia temporal | «No se enviará ningún mensaje»   |
| Logic2B    | Portada de hoy         | Seed determinista `pinadamar`            | Banner global de demostración    |
| Logic2B    | Bandeja de solicitudes | Dataset demo; mutaciones reversibles     | Toast «Cambio solo en la demo»   |
| Logic2B    | Planning               | Seed/fixture de ~110 unidades            | Banner + reset visible           |
| Logic2B    | Plano                  | Descriptor declarativo del recinto       | Banner + fecha ancla             |
| Logic2B    | Ficha de reserva       | Datos ficticios y acciones controladas   | Datos personales ficticios       |

**Estados obligatorios:** solicitud nueva/contactada/convertida/perdida;
bandeja vacía mediante filtro; solape rechazado; carga/error; unidad fuera de
servicio; ficha móvil. Ningún estado necesita proveedor externo.

### 4.4. Activos y momentos capturables

- Lote mínimo de 10 fotos: dos héroes, parcela, bungalow exterior/interior,
  mobil-home, recepción, calle bajo pinos, piscina familiar y textura de lona.
- Plano propio reconocible: mar al este, acceso/recepción, dos calles de
  parcelas, anillo de bungalows y servicios; no recolorear el plano de Cala.
- Dataset: ~110 unidades, 35–50 solicitudes en cuatro idiomas, agosto denso,
  llegadas/salidas visibles y al menos una unidad fuera de servicio.
- Capturas firma: solicitud recién llegada en portada; planning denso con la
  estancia enfocada; plano con unidad/fecha conservadas.

## 5. Ancla Visión — Camping Resort Mar de Fondo

### 5.1. Marca y dirección de arte

**Territorio:** resort mediterráneo grande con piscina laguna, palmeral
contenido, arquitectura clara y un catálogo amplio. Debe leerse premium por
orden y servicio, no por dorados ni clichés de hotel.

**Personalidad:** segura, amplia, precisa. La web vende vacaciones; el gestor
vende control. La automatización vende revisión humana, no magia.

**Paleta de tenant:** tinta atlántica `#172A2D`, blanco sal `#F6F4EE`, arena
clara `#D8C7A5`, agua profunda `#176B73`, coral corto `#D0644B`. Clash Display
600/semibold a gran escala e Inter; cifras y dashboards permanecen en el DS
neutral de Logic2B con un único acento del tenant.

### 5.2. Historia guiada — 12 minutos

1. Abrir una creatividad marcada «ejemplo» y entrar en la web del resort.
2. Consultar disponibilidad, comparar tres familias y añadir un extra.
3. Completar una reserva y un pago simulado con recibo **DEMO**.
4. Abrir el gestor, encontrarla en el planning de ~300 unidades y moverla con
   re-cotización visible.
5. Pasar por plano, llegada/check-in y cobro pendiente.
6. Abrir Automatiza: revisar una plantilla y aprobar una respuesta propuesta.
7. Abrir Inteligente: recomendación de ocupación con origen, incertidumbre y
   acción reversible; nunca chat genérico.
8. Cerrar separando «lo que ya es interactivo» de «lo que activaríamos con
   tus proveedores y datos» y llevar al CTA de discovery.

### 5.3. Pantallas y honestidad

| Capacidad          | Resultado visible                             | Mecanismo                     | Rótulo exacto                                     |
| ------------------ | --------------------------------------------- | ----------------------------- | ------------------------------------------------- |
| Campaña            | Anuncio → web con UTM de muestra              | Asset estático + query        | «Creatividad de ejemplo»                          |
| Reserva            | Disponibilidad, extra, titular y confirmación | Seed/API demo                 | Banner «Demostración ficticia»                    |
| Pago               | Estado aprobado/fallido y recibo              | `PaymentProvider` de demo     | «Pago simulado · no se ha realizado ningún cargo» |
| Planning/plano     | Escala, movimientos y ficha                   | Dataset determinista ~300 uds | «Datos ficticios · se restablecen»                |
| Automatiza         | Trigger, borrador, revisión y aprobación      | Escenario precalculado        | Badge «Prototipo supervisado»                     |
| Inteligente        | Recomendación, fuentes, rango y confirmación  | Fixture explicable            | Badge «Prototipo · no ejecuta cambios»            |
| Canales/fiscal/SES | Estado y ficha informativa, nunca envío       | Documento/fixture             | Badge «Roadmap sujeto a integración»              |

**Momentos capturables:** comparador de alojamientos con piscina laguna;
planning a 90 días y escala completa; tarjeta de recomendación con «por qué»,
rango de confianza y botones «Descartar / Preparar cambio».

### 5.4. Activos

- 12–14 fotos coherentes: dos héroes, tres familias de alojamiento con
  interior, piscina laguna, restaurante, recepción, calle, club infantil,
  acceso playa y dos texturas.
- Plano propio y dataset de ~300 unidades; la captura actual del planning se
  reutiliza como referencia de composición, no como prueba de esa escala.
- Una creatividad 1080×1080, una 1080×1920, una 300×250 y un anuncio de
  búsqueda; todos marcados como muestra.
- Tres fixtures de prototipo: respuesta a reseña, resumen de incidencias y
  recomendación de ocupación. Cada uno declara fuentes y revisión humana.

## 6. Mapa técnico visible

El mecanismo se elige por interacción, no por marca. Esta tabla es el límite
de D1-V–D3-V; cualquier ampliación vuelve al backlog.

| Interacción            | L'Olivar                                             | Pinada del Mar                     | Mar de Fondo            | Sustitución productiva                         |
| ---------------------- | ---------------------------------------------------- | ---------------------------------- | ----------------------- | ---------------------------------------------- |
| Navegación/contenido   | SSG/config, nivel comercial 0 sobre carril técnico 1 | SSG/config                         | SSG/config              | Contenido y dominio del cliente                |
| Tarifas/catálogo       | Fixture tipado derivado del tenant                   | Seed/fixture                       | Seed/fixture            | Inventario/tarifas importados y conciliados    |
| Formulario             | Adaptador sin persistencia                           | Persistencia temporal de escenario | —                       | Receptor, antispam, consentimiento y retención |
| Reserva/planning/plano | —                                                    | Dataset demo compartido            | Dataset demo compartido | D1/bindings propios e aislamiento probado      |
| Pago                   | —                                                    | —                                  | Provider demo existente | Stripe/Redsys + webhooks/conciliación          |
| Automatiza/IA          | —                                                    | Plantillas de muestra              | Fixtures explicables    | Proveedor, colas, permisos, evaluación y coste |

El runtime compartido contiene **solo datos ficticios** y se considera un
portfolio, no una arquitectura de tenants reales. No autoriza a compartir una
D1 entre clientes. El paso a producción vuelve al aislamiento por binding.

## 7. Fichas de activación a producción

### 7.1. L'Olivar / Inicio

| Capacidad   | Prospecto ve / resultado        | Demo                                | Pendiente productivo y entradas                                | Aceptación antes de cliente                                | Riesgo                                   |
| ----------- | ------------------------------- | ----------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------- |
| Web y marca | Sitio móvil completo, SEO y CTA | SSG en ruta demo                    | Dominio, marca/fotos/textos finales, legales, redirects        | Lighthouse/enlaces/SEO/375–1366 y aprobación de contenido  | Bajo · 1–2 jornadas tras recibir materia |
| Formulario  | Consulta y confirmación         | Adaptador sin envío ni persistencia | Destinatario, base legal, antispam, rate limit, logs/retención | Entrega real, fallo controlado, spam y E2E sin PII en logs | Medio · estimar tras elegir receptor     |
| Analytics   | Solo recorrido visual; no píxel | Ninguno                             | CMP, base legal, herramienta, eventos/UTM                      | Consent mode y eventos verificados                         | Bajo/medio                               |

**Disparador:** contrato Inicio firmado y dominio/contenido entregados.

### 7.2. Pinada del Mar / Gestión

| Capacidad           | Prospecto ve / resultado           | Demo                      | Pendiente productivo y entradas                         | Aceptación antes de cliente                   | Riesgo                       |
| ------------------- | ---------------------------------- | ------------------------- | ------------------------------------------------------- | --------------------------------------------- | ---------------------------- |
| Solicitudes         | Web → bandeja y estados            | Dataset temporal ficticio | Receptor real, consentimiento, usuarios y retención     | Mensaje entregado, permisos y trazabilidad    | Medio                        |
| Inventario/reservas | Planning/plano y ficha             | Seed reversible           | Unidades, tarifas, temporadas, reservas futuras y corte | Importación conciliada, solapes/precios/UAT   | Alto · discovery obligatorio |
| Usuarios            | Recepción/gerencia ficticias       | Roles demo                | Identidades, altas/bajas, recuperación, MFA si aplica   | Matriz de permisos, revocación y fuga cruzada | Medio                        |
| Operación           | Llegadas/salidas/cobros de muestra | Seed                      | Procedimientos, pagos y formación reales                | Día operativo completo y errores ensayados    | Medio/alto                   |

**Disparador:** Gestión contratada y exportación del sistema/calendario actual
disponible para discovery.

### 7.3. Mar de Fondo / Visión

| Capacidad    | Prospecto ve / resultado        | Demo                   | Pendiente productivo y entradas                            | Aceptación antes de cliente                                  | Riesgo |
| ------------ | ------------------------------- | ---------------------- | ---------------------------------------------------------- | ------------------------------------------------------------ | ------ |
| Pago         | Reserva y recibo demo           | Provider simulado      | Comercio, proveedor, monedas, webhooks y política          | Sandbox, duplicado, fallo, reembolso y conciliación          | Alto   |
| Automatiza   | Borrador y aprobación           | Escenario precalculado | Triggers, canal, ventanas, responsables, colas y auditoría | Dry-run, fallo, duplicado, pausa global y reintento          | Alto   |
| IA/previsión | Recomendación explicable        | Fixture con fuentes    | Datos, modelo, permisos, evaluación, presupuesto/fallback  | Dataset de evaluación, coste/latencia, rechazo y supervisión | Alto   |
| Canales/OTA  | Hub representado                | Fixture/roadmap        | Un conector contratado, mapeos y autoridad de inventario   | Alta/cambio/cancelación duplicados y reconciliación          | Alto   |
| Fiscal/SES   | Estados y documentos de muestra | Fixture/roadmap        | Proveedor/entorno oficial, credenciales y soporte          | Casos aceptados, rechazo/reintento y evidencia               | Alto   |

**Disparador:** discovery firmado para una capacidad concreta. Ver la pantalla
no convierte toda la fila Visión en alcance contratado.

## 8. Auditoría de activos existentes

### Reutilizar

- La composición y papeles de imagen de `apps/web`: héroes, cards, galería,
  instalaciones, textura, favicon y OG.
- `tenants/_template` como contrato estructural, no como generador visual.
- Clash Display/Inter y el pipeline responsive AVIF/WebP ya medido.
- Las capturas reales `captura-planning.webp` y `captura-plano.webp` como
  referencia/producto Logic2B; una captura nueva sustituye a la antigua cuando
  el escenario difiera.
- Cala Sereno como baseline de calidad, flujo y densidad, nunca como banco de
  fotos de las nuevas marcas.

### No reutilizar como activo final

- Las fotos de Cala Sereno en L'Olivar, Pinada o Mar de Fondo: romperían la
  promesa de tres geografías coherentes.
- `apps/site/public/propuestas/azahar/*`: pertenecen a una propuesta/marca
  distinta, mezclan fotografía real y un logo reconocible y no tienen un
  contrato de uso aquí. Sirven solo como referencia de lo que no debe filtrarse
  a una demo ficticia.
- `hero-atmosfera.webp`: pertenece a la landing Logic2B y puede seguir allí;
  no define la identidad de un tenant.
- El plano de Cala recoloreado o la captura actual presentada como 300
  unidades. La escala debe salir del escenario correcto.

### Huecos reales

- No existe ningún lote fotográfico para las tres anclas.
- No existen sus wordmarks, favicons, OG ni miniaturas.
- Solo Cala Sereno tiene contenido completo en seis idiomas. Primera ola:
  L'Olivar empieza en **es**; Pinada y Mar de Fondo no se traducen hasta que su
  recorrido base esté cerrado. La arquitectura sigue preparada para ampliar.
- El formulario Inicio necesita un adaptador demo común y una confirmación que
  no sugiera entrega real.
- El build compuesto aún no publica `/demos/{slug}/`.

## 9. Backlog ejecutable

### D1-V ✅ — producir L'Olivar

1. Crear `tenants/olivar` a partir del contrato de `_template`, con nivel
   comercial 0 sobre el carril técnico `tier: 1`, idioma `es`, 22 unidades y
   dos tipos; sin Worker/D1 propios.
2. Producir y validar el lote de ocho imágenes como conjunto, luego wordmark,
   favicon, OG y miniatura.
3. Escribir tema y contenido completos sin `__TODO__`; recortar instalaciones,
   tarifas y entorno al tamaño real del negocio.
4. Añadir `enquiryTransport: 'demo' | 'persisted'` al contrato de web:
   `persisted` conserva sin cambios los tenants técnicos existentes y `demo`
   ofrece éxito/error/spam deterministas sin red, con mensaje explícito de no
   envío/no persistencia. El futuro transporte productivo `email` queda en el
   dossier y no se finge en esta sesión.
5. Construir bajo `/demos/olivar/`, añadir `noindex` y enlazar sus recursos sin
   cargar motor ni dashboard.
6. QA funcional/visual a 375 y 1366 px, teclado, reduced motion, contraste,
   enlaces, imágenes, bundle de nivel 1 y tres capturas comerciales.
7. Medir horas en identidad/contenido, configuración, interacción, QA y
   publicación. Ese dato decide cuánto se reutiliza en D2-V.

### D2-V y D3-V, preparados pero no abiertos

- D2-V empieza clonando la receta visual validada, no el contenido de
  L'Olivar. Solo entonces se crea dataset/plano `pinadamar` y el enlace entre
  solicitud y gestor.
- D3-V reutiliza Cala/gestor como base funcional, pero crea identidad,
  inventario y fixtures `mardefondo`. Automatiza/Inteligente no se implementan
  antes de que el recorrido reserva → operación sea convincente.

## 10. Pase por las ocho lentes

- **Arquitectura:** tres identidades, un código; la ruta demo no implica
  infraestructura por marca. La D1 compartida solo contiene ficción y no
  altera el aislamiento productivo.
- **Fullstack:** cada interacción tiene soporte y sustitución productiva; D1-V
  empieza con un recorrido que no depende de API real.
- **Backend:** fixtures/adaptadores son deterministas y tipados; no hay dinero,
  PII ni proveedor fingidos como reales. Visión conserva céntimos y desglose.
- **Frontend:** estados y rutas están definidos antes de construir; no hay CTA
  sin resultado ni simulación dispersa en componentes.
- **Producto:** cada ancla tiene ICP, problema, promesa y CTA distintos; las
  tres explican la escalera comercial.
- **UX:** historias de 5/8/12 minutos, principio y cierre; el rótulo demo evita
  que el presentador tenga que explicar la letra pequeña.
- **UI:** tres materias distintas sin caer en reskin; fuentes y pipeline se
  reutilizan; AA, móvil y captura son criterios de aceptación.
- **SEO:** las demos son `noindex`; la futura galería indexable enlazará casos
  solo cuando los tres recorridos existan.

D1-V quedó cerrado en la sesión 82: L'Olivar valida la receta con un resultado
compartible, transporte demo común y bundle compuesto. La siguiente sesión abre
D2-V con Pinada del Mar y mide qué parte de la fábrica sobrevive al salto de web
estática a web → solicitud → gestor.
