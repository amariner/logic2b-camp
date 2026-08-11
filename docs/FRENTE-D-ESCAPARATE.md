# FRENTE D — Escaparate: portfolio de demos y marketing de captación

> **Abierto 2026-07-28 por mandato directo de Andreu** (sesión 58, presente).
> Este documento es la **fuente de verdad** del frente: la visión completa, el
> portfolio de demos, las piezas de marketing y las decisiones que quedan
> abiertas para su ADR. El resumen ejecutivo vive en `docs/ROADMAP.md` §Frente D.
>
> **Alcance, cerrado el mismo día**: **campings, y solo campings** — la primera
> redacción de este documento incluía casas rurales, un hostal y un hotel, y
> Andreu lo rectificó en la misma sesión. Los otros verticales (hoteles, casas
> rurales) **serán un CLON del proyecto cuando llegue el momento**, no una
> ampliación de este. Ver §1.1.
>
> **Replanteo 2026-08-06**: el escaparate ya no espera a que el backend esté
> avanzado. Es el frente prioritario para vender la tecnología. Se construyen
> primero tres demos visuales y navegables, apoyadas por seed/adaptadores de
> demo; CLI, integraciones e infraestructura por cliente se documentan para
> activarlas cuando exista una venta. Contrato transversal:
> `docs/ESTRATEGIA-DEMO-FIRST.md`.
>
> **Primera ola cerrada el 2026-08-08:** D0-V–D4-V están completas. La
> ampliación a seis queda sujeta a aprendizaje comercial, no al calendario.
>
> **Portfolio 10/12 el 2026-08-11:** D5-V está cerrada y D6-V ya incorpora
> Serralta, Entre Vinyes, Els Tarongers y La Carrasca. Quedan Ballena y Sol d'Hivern.

---

## 1 · La tesis: una demo no demuestra escalabilidad — doce sí

Hoy Logic Camp tiene **una** demo (Camping Cala Sereno, `camp.logic2b.com/demo/`),
y es buena: motor real, pagos simulados, planning firma, reset nocturno. Pero
una sola demo cuenta la historia de **un** camping. Lo que un prospecto no
puede ver es justo lo que hace valioso el producto:

- que el **mismo código** sirve a un micro-camping de 16 parcelas y a un
  resort de 300 unidades;
- que **subir de nivel es cambiar config**, no comprar otro producto
  (`docs/TIERS.md`: cuatro niveles, cuatro flags);
- que la marca de cada camping es **suya** (tema, fotos, textos, dominio)
  y aún así el alta cuesta **una tarde** (`pnpm new:camping`);
- que "camping" no es un solo negocio: el familiar de interior, el resort de
  costa, el de autocaravanas abierto todo el año y el surfero de 20 plazas
  operan **distinto** — y el producto los viste a todos.

**La decisión de producto (Andreu, 2026-07-28): construir un portfolio de 12
demos de campings** que enseñe esa escalera entera, con el objetivo comercial
explícito de **dar sensación de escalabilidad y abarcar el máximo de clientes
posibles dentro del vertical**. El portfolio ES el argumento de venta: no un
eslogan que dice "escala", sino doce webs vivas que lo demuestran clicando.

### 1.1 · El alcance NO cambia: solo campings (y qué pasa con los demás verticales)

Decisión de Andreu (2026-07-28, rectificando la primera redacción de este
documento en la misma sesión): **Logic Camp sigue siendo "para campings, y
solo campings"**, exactamente como dicen `CLAUDE.md` y el Super Prompt §0 —
que quedan **intactos y verdaderos**.

Hoteles y casas rurales **no entran en este producto ni en su portfolio**:
cuando llegue el momento, **se clonará el proyecto** como producto hermano
(el mismo patrón de casa que ya separa `ecom.logic2b.com` de este repo — un
vertical, un producto). Lo que ese clon costará ya lo abarata la arquitectura
actual por sí sola: instancias + config + una D1 por cliente + `custom/` por
puntos de extensión.

Dos consecuencias operativas para las sesiones de ahora:

1. **El pitch no se diluye**: "software DE campings" le vende a un camping
   mejor que "software de alojamientos". La landing, las demos y los anuncios
   de muestra hablan SOLO de campings.
2. **Higiene de dominio barata**: el glosario ya distingue unidad/tipo —
   mantenerlo limpio (no cablear supuestos que el glosario no impone) es lo
   que mañana abarata el clon. No es un mandato nuevo: es seguir usando el
   vocabulario de `docs/DOMAIN.md`.

---

## 2 · El portfolio: 12 demos de campings en tres escalones

Composición que pidió Andreu (2026-07-28, con la rectificación del mismo día:
todo campings):

- **Grupo A** — 4 demos "landing" de campings **muy pequeños** (nivel 1,
  Camp Web), de temas diversos propuestos por la sesión.
- **Grupo B** — 4 demos de campings **medianos con solo solicitud**
  (nivel 2, Camp Solicitudes — petición **sin cobro**), de estilos distintos.
- **Grupo C** — 4 demos de campings **grandes con reserva y pago**
  (nivel 3, Camp Reservas), de formas diversas.

Los nombres, temas y perfiles siguientes nacieron como propuesta en la sesión 58. **D0-V cerró el 2026-08-06 las tres anclas de la primera ola:** L'Olivar,
Pinada del Mar y Mar de Fondo. Su contrato de producción vive en
[`CONTRATO-VISUAL-OLA-1.md`](CONTRATO-VISUAL-OLA-1.md). El resto permanece como
reserva para las olas de seis y doce. Todos son ficticios,
mediterráneos/peninsulares y no deben confundirse con un establecimiento real.
Cala Sereno **se mantiene** como demo canónica; el portfolio no la sustituye,
la rodea.

### Grupo A — Nivel 1 · Camp Web (web + formulario→email, motor apagado)

Lo que este grupo debe demostrar: que la entrada al producto es una **web
preciosa con formulario**, sin motor y sin dashboard — y que aún así **las
solicitudes se guardan** (histórico silencioso: el argumento de renovación y
de upgrade a nivel 2). Cuatro marcas, cuatro paletas, un solo código.

| #   | Slug propuesto | Nombre               | Qué es                                                                | Tamaño                              | Tema visual                                                | Qué demuestra específicamente                                                                                                          |
| --- | -------------- | -------------------- | --------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | `olivar`       | **Camping L'Olivar** | Micro-camping de secano entre olivos centenarios (interior, Maestrat) | 18 parcelas + 4 tiendas premontadas | Tierra, sombra de olivo, cal y esparto; agroturismo slow   | El caso arquetípico del nivel 1: camping familiar que solo quiere "salir bonito en Google" y recibir peticiones por email              |
| A2  | `riuclar`      | **Càmping Riu Clar** | Micro-camping fluvial de montaña (Prepirineo)                         | 24 parcelas                         | Río, chopos, piedra oscura, niebla de mañana               | Otro héroe, otra luz, otra lengua de arranque (ca) — misma plantilla                                                                   |
| A3  | `duna`         | **Camping La Duna**  | Micro-camping surfero/vanlife junto a playa de levante                | 20 plazas autocaravana + tienda     | Duna, madera lavada por el sol, furgonetas; estética joven | Que el sistema de temas aguanta una marca radicalmente distinta (la antípoda del "crema+serif" y del SaaS azul)                        |
| A4  | `delta`        | **Camping El Delta** | Micro-camping de humedal (arrozales, observación de aves)             | 16 parcelas                         | Arrozal, luz plana de delta, cañizo, bicicletas            | El nivel 1 en su mínimo: 16 parcelas y un negocio estacional de temporada corta — si aquí sale a cuenta, sale a cuenta en todas partes |

### Grupo B — Nivel 2 · Camp Solicitudes (bandeja + dashboard lite, sin cobro)

Lo que este grupo debe demostrar: la **petición sin pago** como flujo completo
— el visitante pide fechas desde la web, la solicitud cae en la **bandeja**
del dashboard lite, recepción contesta y gestiona con el calendario manual.
Es el escalón donde vive la mayoría del mercado real pequeño-mediano que no
quiere (aún) cobro online.

| #   | Slug propuesto | Nombre                     | Qué es                                                     | Tamaño                          | Tema visual                                  | Qué demuestra específicamente                                                                                            |
| --- | -------------- | -------------------------- | ---------------------------------------------------------- | ------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| B1  | `pinadamar`    | **Camping Pinada del Mar** | Camping mediano costero                                    | ~110 uds (parcelas + bungalows) | Pinada litoral, lona verde, arena compactada | La bandeja de solicitudes con volumen realista y estados vivos (nueva/contestada/convertida/perdida)                     |
| B2  | `serralta`     | **Camping Serralta**       | Camping mediano de montaña/naturaleza                      | ~80 uds                         | Bosque húmedo, pizarra, hoguera              | Mismo lite, otra marca; solicitudes en varios idiomas (mercado francés/alemán de rutas)                                  |
| B3  | `vinyes`       | **Camping Entre Vinyes**   | Camping mediano agro/enoturismo entre viñedos              | ~70 uds                         | Viña, cepa vieja, bodega, tierra calcárea    | Un negocio de temporada distinta (vendimia = su agosto): las temporadas solapadas por prioridad del glosario, a la vista |
| B4  | `tarongers`    | **Camping Els Tarongers**  | Camping mediano familiar entre naranjos (llanura de costa) | ~100 uds                        | Azahar, acequia, sombra de cítrico           | El mediano familiar clásico de la costa: el comprador mayoritario del nivel 2 viéndose a sí mismo                        |

### Grupo C — Nivel 3 · Camp Reservas (motor real + pago online)

Lo que este grupo debe demostrar: el producto **completo** a escala — motor de
disponibilidad, funnel con hold de 15 min, pago (señal/completo, simulado en
demo con el mismo criterio fake de siempre), dashboard entero con el planning
firma. Y que "camping grande" tiene **cuatro modelos de negocio distintos**,
no cuatro decorados:

| #   | Slug propuesto | Nombre                          | Qué es                                                                     | Tamaño                                                | Tema visual                                                | Qué demuestra específicamente                                                                                                                 |
| --- | -------------- | ------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | `mardefondo`   | **Camping Resort Mar de Fondo** | Camping-resort premium costero                                             | ~300 uds (parcelas, bungalows, glamping, mobil-homes) | Resort mediterráneo: piscina lagoon, palmeral, lona blanca | **El planning a plena escala** (300 uds × 90 días fluido — la cifra de la Fase 6) y el catálogo más ancho                                     |
| C2  | `carrasca`     | **Camping La Carrasca**         | Camping grande de interior/eco con spa                                     | ~150 uds                                              | Encinar, cal, barro cocido                                 | Misma escala funcional con otra política (otra tasa turística regional, otra política de cancelación — todo config)                           |
| C3  | `ballena`      | **Camping La Ballena**          | Camping grande familiar de animación (parque acuático)                     | ~250 uds                                              | Toboganes, color, mascota; familias con niños              | El gigante vacacional de rotación semanal: ocupación al límite, llegadas de sábado en bloque (los `arrival_days` del dominio, a la vista)     |
| C4  | `soldhivern`   | **Camping Sol d'Hivern**        | Camping de larga estancia abierto todo el año (invernantes, autocaravanas) | ~200 uds                                              | Invierno suave, autocaravanas nórdicas, almendro en flor   | El negocio que NO es agosto: estancias de 45+ noches, ocupación plana de invierno — justo la mezcla que ADR 0030 metió en el seed, hecha demo |

### 2.1 · Lo que el portfolio cuenta como conjunto (el guion comercial)

La lectura vertical (A3 `duna` → B1 `pinadamar` → C1 `mardefondo`: camping de
costa en los tres niveles) enseña la **escalera de precio** con el mismo tipo
de negocio — el camino de upgrade que un cliente recorrería de verdad. La
lectura horizontal (cuatro marcas por nivel) enseña **variedad visual sobre un
solo código**. La lectura de esquina a esquina (El Delta de 16 parcelas → Mar
de Fondo de 300) enseña **rango**. Y el grupo C entero enseña que "grande" son
**cuatro negocios distintos** (premium, eco/interior, animación familiar,
invernante todo-el-año), no cuatro fachadas. Ninguna de esas frases hay que
decirla: se ve.

Además, construir el portfolio **es** el test de estrés de la Fase 9: cada
demo debe nacer con `pnpm new:camping` + config + contenido + seed. Si alguna
necesita tocar `apps/` o `packages/`, hemos encontrado un punto de extensión
que falta — que es exactamente la regla de CLAUDE.md. **Doce altas son doce
ensayos del onboarding real**, y la promesa "un camping nuevo en una tarde"
sale del frente o medida o desmentida.

---

## 3 · La landing de venta: sensación de escalabilidad

Mandato literal: "debemos dar más sensación de escalabilidad en la landing de
venta". La landing (raíz de `camp.logic2b.com`, marca Logic2B, Frente B3) hoy
vende **un** producto con **una** demo. Piezas propuestas, de menor a mayor
coste:

1. **La galería del portfolio** ("Un motor, doce campings"): rejilla de
   tarjetas con captura + logo + una línea ("18 parcelas · web y solicitudes
   por email") + enlace a la demo viva. Es la sección que convierte
   "escalable" de adjetivo en evidencia. Mientras el portfolio no exista, la
   versión honesta es Cala Sereno + los conmutadores actuales — la galería se
   abre cuando haya ≥3 demos que enseñar (criterio: nunca prometer en la
   landing lo que no se puede clicar).
2. **La franja de cifras**: "1 código · N campings · una D1 aislada por
   cliente · alta en una tarde". Cifras que ya son verdad hoy y no dependen
   del portfolio.
3. **La escalera de niveles como recorrido**, no como tabla: el visitante
   elige "¿cuántas parcelas tienes?" y la landing le señala su nivel y su demo
   más parecida (cuando exista). Barato en UI, muy vendedor, y reutiliza
   `TIERS.md` sin duplicarlo.

Nota de coherencia con el Frente B: todo esto es evolución de B3 (misma app
`apps/site`, misma marca, mismos tokens). No es una landing nueva.

> **Estado (2026-07-30, sesión 60, Andreu presente)**: las piezas **2 y 3
> están hechas en su versión temprana** — sección `#escala` con la franja de
> cifras (solo cifras verdad hoy: 1 código · 1 D1 por camping · 4 niveles ·
> 1 tarde) y el recorrido «¿cuántas parcelas tienes?» dentro de `#niveles`.
> En la misma sesión Andreu dejó la landing en **dos idiomas (es/en)**: vende
> al dueño, no al campista — los seis idiomas siguen en la web de tenant. La
> pieza **1 (galería) sigue cerrada** hasta tener ≥3 demos que clicar.

---

## 4 · Anuncios de muestra (Ads display Google/Meta): "así se captan reservas"

Mandato literal: "mostrar cómo si fueran anuncios de Ads display en Google o
Meta para mostrar cómo quedaría hacer campañas para captar reservas".

**Qué es**: una pieza de la landing de venta (y del guion comercial) que
enseña **creatividades de campaña ficticias** con la marca de las demos —
el aspecto exacto que tendrían los anuncios de un camping captando reservas
para SU propio motor. El mensaje de fondo es el argumento anti-OTA: _cada
reserva que entra por tu web con tu campaña es una reserva sin comisión de
Booking_. El anuncio de muestra cierra ese relato: canal propio + motor propio

- campaña propia.

**Qué NO es**: cuentas reales de Google Ads / Meta, píxeles, conversiones ni
ningún servicio externo. Regla del proyecto intacta: **lo fake se resuelve en
assets estáticos del repo**, igual que el seed. Son maquetas.

**Piezas propuestas**:

- **Formatos display de Google** (los estándar que cualquiera reconoce):
  300×250 (MPU), 728×90 (leaderboard), 160×600 (skyscraper), 320×100 (móvil).
- **Formatos Meta**: 1080×1080 (feed) y 1080×1920 (story/reel), con el cromo
  de la UI de Instagram/Facebook **esquematizado, sin logos de terceros**
  (un marco neutro "así se ve en el feed" — no reproducimos marcas de Meta).
- **Un anuncio de búsqueda de Google** en texto (titular + descripción + URL
  visible) para el guion comercial, porque es el formato que un dueño de
  camping ya ha visto funcionar.
- **Contenido**: foto real del tenant (las de Higgsfield del contrato de arte)
  - titular de temporada ("Agosto junto al mar, con tu parcela reservada") +
    CTA a la web de la demo. Cada creatividad **clica a su demo con parámetros
    UTM de mentira**, de modo que en una presentación se pueda recorrer el
    funnel entero: anuncio → landing del camping → mostrador → reserva.
- **Dónde vive**: sección propia en la landing de venta ("Campañas que
  reservan") + una diapositiva/página en `DEMO-SCRIPT.md` cuando exista. Los
  assets, en `apps/site` (son material del producto, no de un tenant).

**Advertencia de honestidad comercial** (para el ADR D0): las maquetas deben
declararse como muestra ("creatividad de ejemplo") en la propia pieza. Vender
con un mock sin decir que lo es se nos volvería en contra en la primera
conversación seria.

---

## 5 · El hueco encontrado en la demo actual: disponibilidad dentro del alojamiento

Observación de Andreu (2026-07-28), verificada contra el código en la misma
sesión: **en la página de detalle de un alojamiento no se puede consultar la
disponibilidad de ese alojamiento** — hay que volver "fuera" (a la home) y
usar el mostrador del héroe.

**Diagnóstico exacto**: `apps/web/src/components/paginas/AlojamientoDetalle.astro:57`
construye el CTA así — en nivel 3 (`mode === 'instant'`) apunta a
`${localePath(locale)}#mostrador`, es decir, **de vuelta a la home**, al ancla
del widget, y además **sin precargar el tipo** que el visitante estaba
mirando; en nivel 1/2 apunta a `/contacto` (eso sí es correcto: degradación
por nivel). El componente `Mostrador.tsx` no se monta en el detalle.

**Por qué importa** (más allá del fastidio): la página de detalle es donde el
visitante ya ha decidido _qué quiere_; mandarlo a la home a repetir la
selección es el punto exacto donde se pierden reservas. Y en el portfolio
futuro, las demos de nivel 3 heredarían el defecto multiplicado por cuatro.

**Dirección de arreglo** (para la sesión que lo tome — es candidato cercano,
no de este frente): montar el mostrador (o una variante compacta) **dentro del
detalle**, precargado con ese `unit_type`; como mínimo, que el CTA arrastre el
tipo en la URL para que el widget/funnel lo preseleccione (el funnel ya lee
parámetros de búsqueda desde Fase 5). Mantener la degradación por nivel tal
cual está (nivel 1/2 → contacto). Es trabajo de `apps/web` con isla React ya
existente — sin API nueva.

En `docs/BACKLOG.md` queda como ítem propio con esta referencia.

---

## 6 · Encaje temporal, dependencias y coste

> **Decisión 2026-08-03 (Andreu): el Frente D pasa a prioridad comercial.**
> Las demos no esperan al primer cliente: son la herramienta para conseguirlo.
> **Actualización 2026-08-06:** el ADR de infraestructura D0 se sustituye por
> D0-V, un contrato visual ligero. Su objetivo es evitar artesanía irrepetible
> sin decidir backend o despliegues ×12. La medición de horas se hace durante
> las demos y alimenta `docs/TARIFAS-LOGIC2B.md`.

- **Cuándo**: ahora. La prioridad inmediata es que el portfolio se pueda
  enseñar y vender; deuda no visible, CLI o verificaciones de producción no
  desplazan una demo salvo riesgo de seguridad o pérdida de datos.
- **La restricción de siempre manda**: ~6h/semana y "nada que multiplique el
  trabajo por número de clientes". Doce demos solo son viables si cada una es
  **config + contenido + seed** sobre el mismo código — que es a la vez la
  única forma de construirlas y la prueba comercial de la tesis. Si una demo
  pide una rama de código, la demo pierde.
- **El coste real que hay que presupuestar es el de la MATERIA**: 12 marcas ×
  (paleta + logo/tipografía del tenant + **fotos coherentes con el contrato
  de arte** + textos en su voz). Las fotos son la partida cara (Higgsfield,
  con el pipeline ya probado en C5); los textos y temas son horas de las
  sesiones. En la primera ola no se generaliza todo el seed: fixtures o
  escenarios tipados por arquetipo son suficientes si comparten contrato,
  resultan creíbles y pueden restablecerse.
- **Medición comercial mínima**: cada demo anota horas por cinco bloques
  (identidad/contenido, inventario/tarifas, configuración, QA y publicación).
  No se registra todavía cada intervención. Tras las tres primeras se revisan
  altas, cuotas, bolsas y packs de la página `/precios/`.
- **Infra por demo no es un requisito**: las primeras pueden compartir Worker,
  D1 y reset, seleccionando el escenario por ruta/configuración. Separar hosts,
  bases o despliegues solo si mejora la venta o la fiabilidad. Todas las demos
  permanecen `noindex` salvo decisión contraria.
- **Fase 12 (Camp Motor) sigue intacta**: NO construir. Ninguna demo del
  portfolio la necesita.
- **Hoteles y casas rurales: fuera** (decisión §1.1). Cuando llegue su
  momento serán un **clon del proyecto**, con su propia marca y su propio
  portfolio — nada de este frente los anticipa ni los menciona en la landing.

---

## 7 · Fases demo-first

| Fase        | Nombre            | Objetivo                                                                                             | Hecho cuando                                                 |
| ----------- | ----------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **D0-V ✅** | Contrato visual   | L'Olivar, Pinada del Mar y Mar de Fondo; relato, pantallas, arte, activos, honestidad y soporte demo | Cerrado en `CONTRATO-VISUAL-OLA-1.md`                        |
| **D1-V ✅** | Demo Inicio       | Primera marca completa, web móvil, alojamientos y consulta de muestra                                | L'Olivar lista en `/demos/olivar/`                           |
| **D2-V ✅** | Demo Gestión      | Segunda marca, solicitud, gestor, planning y plano con datos creíbles                                | Web → operación completa en una presentación                 |
| **D3-V ✅** | Demo Visión       | Reserva y operación más automatización/IA representadas                                              | El futuro se entiende sin confundir prototipo con producción |
| **D4-V ✅** | Landing y campaña | Galería de tres, comparador, fichas, capturas/vídeo y Ads de muestra                                 | Recorrido comercial completo y reproducible                  |
| **D5-V ✅** | Ola de seis       | Tres variantes adicionales nacidas de la fábrica visual                                              | Ninguna exige rama o backend propio                          |
| **D6-V**    | Ola de doce       | Completar el portfolio según aprendizaje comercial                                                   | 10/12; cada demo cubre una objeción o ICP distinto           |

---

## 8 · Qué hacen las sesiones de ahora

1. Usar **D0-V** como contrato de diseño y venta, no como ADR de
   infraestructura.
2. Usar L'Olivar como receta medida de Inicio, sin copiar su contenido ni su
   identidad en las demos siguientes.
3. Documentar en su ficha qué habría que activar para un cliente real; no
   implementarlo aún.
4. Repetir con Gestión y Visión antes de ampliar a seis o doce.
