# FRENTE D — Escaparate: portfolio de demos y marketing de captación

> **Abierto 2026-07-28 por mandato directo de Andreu** (sesión 58, presente).
> Este documento es la **fuente de verdad** del frente: la visión completa, el
> portfolio de demos, las piezas de marketing y las decisiones que quedan
> abiertas para su ADR. El resumen ejecutivo vive en `docs/ROADMAP.md` §Frente D.
>
> **Cuándo se construye**: cuando el backend de la demo esté **muy avanzado**
> (palabras de Andreu). No es trabajo de la próxima sesión: es la dirección de
> producto que las próximas sesiones deben conocer y no contradecir. **Este
> documento se escribe ahora porque corre prisa PODER ENSEÑARLO**: es material
> para presentar el proyecto a terceros (socios, primeros clientes) antes de
> que exista el código.

---

## 1 · La tesis: una demo no demuestra escalabilidad — doce sí

Hoy Logic Camp tiene **una** demo (Camping Cala Sereno, `camp.logic2b.com/demo/`),
y es buena: motor real, pagos simulados, planning firma, reset nocturno. Pero
una sola demo cuenta la historia de **un** camping. Lo que un prospecto no
puede ver es justo lo que hace valioso el producto:

- que el **mismo código** sirve a un micro-camping de 18 parcelas y a un
  resort de 300 unidades;
- que **subir de nivel es cambiar config**, no comprar otro producto
  (`docs/TIERS.md`: cuatro niveles, cuatro flags);
- que la marca de cada alojamiento es **suya** (tema, fotos, textos, dominio)
  y aún así el alta cuesta **una tarde** (`pnpm new:camping`);
- que el modelo de dominio —se reserva un **tipo**, el establecimiento asigna
  la **unidad**— no es una peculiaridad campista: es exactamente cómo funciona
  una casa rural, un hostal o un hotel.

**La decisión de producto (Andreu, 2026-07-28): construir un portfolio de 12
demos** que enseñe esa escalera entera, con el objetivo comercial explícito de
**dar sensación de escalabilidad y abarcar el máximo de clientes posibles**.
El portfolio ES el argumento de venta: no un eslogan que dice "escala", sino
doce webs vivas que lo demuestran clicando.

### 1.1 · El matiz de alcance que esto introduce (y que hay que formalizar)

`CLAUDE.md` y el Super Prompt §0 dicen hoy "**para campings, y solo
campings**". Este frente lo matiza **por decisión del propietario del
producto**: el portfolio incluye **casas rurales, un hostal y un hotel**. No
es un capricho: el modelo de dominio ya generaliza (tipos de unidad ↔
categorías de habitación; parcela ≠ alojamiento está resuelto desde el
glosario; temporadas, tasa turística por persona/noche y fianza aplican igual
en rural y hotelería). Lo que cambia es el **posicionamiento comercial**:
de "SaaS de campings" a "SaaS de alojamiento turístico con el camping como
especialidad de origen".

**Esto reabre una decisión cerrada de §0 y por tanto exige su momento formal**:
el **ADR D0** (ver §7) debe recoger el cambio de alcance, y `CLAUDE.md` +
`LOGIC-CAMP-Super-Prompt.md` se revisan **entonces**, no antes. Hasta ese ADR,
la regla operativa para las sesiones es: **el core no adquiere ninguna
dependencia conceptual campista nueva** (nada de asumir "parcela" donde el
dominio dice "unidad"), pero tampoco se construye nada hotelero todavía.

---

## 2 · El portfolio: 12 demos en tres escalones

Regla de composición que pidió Andreu, literal:

- **Grupo A** — 4 demos "landing" de alojamientos **muy pequeños** (nivel 1,
  Camp Web): 3 micro-campings de temas diversos + **1 casa rural**.
- **Grupo B** — 4 demos de alojamientos **medianos con solo solicitud**
  (nivel 2, Camp Solicitudes — petición **sin cobro**): 2 campings de estilos
  distintos + **1 conjunto de casas rurales** + **1 hostal**.
- **Grupo C** — 4 demos **grandes con reserva y pago** (nivel 3, Camp
  Reservas): 2 campings de formas diversas + **1 gran hotel** + **1 complejo
  de 5 casas rurales**.

Los nombres, temas y perfiles siguientes son **propuesta de esta sesión**
(Andreu delegó los temas: "de los que se te ocurran"); se validan en el ADR
D0. Todos ficticios, todos mediterráneos/peninsulares, ninguno confundible con
un establecimiento real. Cala Sereno **se mantiene** como la demo canónica de
nivel 3 con conmutador — el portfolio no la sustituye, la rodea.

### Grupo A — Nivel 1 · Camp Web (web + formulario→email, motor apagado)

Lo que este grupo debe demostrar: que la entrada al producto es una **web
preciosa con formulario**, sin motor y sin dashboard — y que aún así **las
solicitudes se guardan** (histórico silencioso: el argumento de renovación y
de upgrade a nivel 2). Cuatro marcas, cuatro paletas, un solo código.

| # | Slug propuesto | Nombre | Qué es | Tamaño | Tema visual | Qué demuestra específicamente |
|---|---|---|---|---|---|---|
| A1 | `olivar` | **Camping L'Olivar** | Micro-camping de secano entre olivos centenarios (interior, Maestrat) | 18 parcelas + 4 tiendas premontadas | Tierra, sombra de olivo, cal y esparto; agroturismo slow | El caso arquetípico del nivel 1: camping familiar que solo quiere "salir bonito en Google" y recibir peticiones por email |
| A2 | `riuclar` | **Càmping Riu Clar** | Micro-camping fluvial de montaña (Prepirineo) | 24 parcelas | Río, chopos, piedra oscura, niebla de mañana | Otro héroe, otra luz, otra lengua de arranque (ca) — misma plantilla |
| A3 | `duna` | **Camping La Duna** | Micro-camping surfero/vanlife junto a playa de levante | 20 plazas autocaravana + tienda | Duna, madera lavada por el sol, furgonetas; estética joven | Que el sistema de temas aguanta una marca radicalmente distinta (la antípoda del "crema+serif" y del SaaS azul) |
| A4 | `elterrer` | **Masía El Terrer** | **Casa rural única** que se alquila entera | 1 casa · 8 plazas | Masía de piedra, interior, chimenea, viña | **El caso mínimo absoluto del modelo: 1 tipo × 1 unidad.** Si la web y el formulario funcionan aquí, el dominio no tiene nada campista cableado |

### Grupo B — Nivel 2 · Camp Solicitudes (bandeja + dashboard lite, sin cobro)

Lo que este grupo debe demostrar: la **petición sin pago** como flujo completo
— el visitante pide fechas desde la web, la solicitud cae en la **bandeja**
del dashboard lite, recepción contesta y gestiona con el calendario manual.
Es el escalón donde vive la mayoría del mercado real pequeño-mediano que no
quiere (aún) cobro online.

| # | Slug propuesto | Nombre | Qué es | Tamaño | Tema visual | Qué demuestra específicamente |
|---|---|---|---|---|---|---|
| B1 | `pinadamar` | **Camping Pinada del Mar** | Camping mediano costero | ~110 uds (parcelas + bungalows) | Pinada litoral, lona verde, arena compactada | La bandeja de solicitudes con volumen realista y estados vivos (nueva/contestada/convertida/perdida) |
| B2 | `serralta` | **Camping Serralta** | Camping mediano de montaña/naturaleza | ~80 uds | Bosque húmedo, pizarra, hoguera | Mismo lite, otra marca; solicitudes en varios idiomas (mercado francés/alemán de rutas) |
| B3 | `valldecases` | **Les Cases de la Vall** | **4 casas rurales** de un mismo pueblo gestionadas juntas | 4 casas (4 tipos × 1 ud) | Pueblo de interior, piedra y teja, huerto | Multi-unidad rural con petición: el calendario manual del lite gestionando cuatro casas distintas |
| B4 | `laplaceta` | **Hostal La Placeta** | **Hostal de pueblo** | 14 habitaciones en 3 tipos | Plaza mayor, azulejo, balcón de forja | **Habitaciones como tipos de unidad**: el glosario (tipo→unidad) estirándose a hotelería pequeña sin tocar el core |

### Grupo C — Nivel 3 · Camp Reservas (motor real + pago online)

Lo que este grupo debe demostrar: el producto **completo** a escala — motor de
disponibilidad, funnel con hold de 15 min, pago (señal/completo, simulado en
demo con el mismo criterio fake de siempre), dashboard entero con el planning
firma. Y que "grande" tiene formas muy distintas.

| # | Slug propuesto | Nombre | Qué es | Tamaño | Tema visual | Qué demuestra específicamente |
|---|---|---|---|---|---|---|
| C1 | `mardefondo` | **Camping Resort Mar de Fondo** | Camping-resort grande costero | ~300 uds (parcelas, bungalows, glamping, mobil-homes) | Resort mediterráneo: piscina lagoon, palmeral, lona blanca | **El planning a plena escala** (300 uds × 90 días fluido — la cifra de la Fase 6) y el catálogo más ancho |
| C2 | `carrasca` | **Camping La Carrasca** | Camping grande de interior/eco | ~150 uds | Encinar, cal, barro cocido, spa rural | Misma escala funcional con otra política (otra tasa turística regional, otra política de cancelación — todo config) |
| C3 | `granmiramar` | **Gran Hotel Miramar** | **Hotel clásico de costa** | ~90 habitaciones en 5 categorías | Paseo marítimo años 20 renovado, latón y azul profundo | **El motor en hotelería**: categorías=tipos, asignación de habitación en recepción (reasignable sin cancelar — nuestra ventaja de dominio aplicada a hotel), pago completo |
| C4 | `cincmases` | **Els Cinc Masos** | **Complejo de 5 casas rurales** con reserva y pago online | 5 casas (5 tipos × 1 ud) | Aldea recuperada, premium rural, piedra seca | Rural premium con cobro y fianza; el planning pequeño pero vivo — y el contraste directo con A4/B3: misma tipología, tres niveles distintos |

### 2.1 · Lo que el portfolio cuenta como conjunto (el guion comercial)

La lectura vertical (A4 → B3 → C4: casa rural en los tres niveles) enseña la
**escalera de precio** con el mismo tipo de negocio. La lectura horizontal
(cuatro marcas por nivel) enseña **variedad visual sobre un solo código**. La
lectura de esquina a esquina (L'Olivar de 18 parcelas → Mar de Fondo de 300)
enseña **rango**. Ninguna de esas tres frases hay que decirla: se ve.

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

1. **La galería del portfolio** ("Un motor, doce marcas"): rejilla de tarjetas
   con captura + logo + una línea ("18 parcelas · web y solicitudes por
   email") + enlace a la demo viva. Es la sección que convierte "escalable" de
   adjetivo en evidencia. Mientras el portfolio no exista, la versión honesta
   es Cala Sereno + los conmutadores actuales — la galería se abre cuando haya
   ≥3 demos que enseñar (criterio: nunca prometer en la landing lo que no se
   puede clicar).
2. **La franja de cifras**: "1 código · N alojamientos · una D1 aislada por
   cliente · alta en una tarde". Cifras que ya son verdad hoy y no dependen
   del portfolio.
3. **La escalera de niveles como recorrido**, no como tabla: el visitante
   elige "¿cuántas plazas tienes?" y la landing le señala su nivel y su demo
   más parecida (cuando exista). Barato en UI, muy vendedor, y reutiliza
   `TIERS.md` sin duplicarlo.
4. **El bloque de dominio como diferencia**: "No solo campings: casas rurales,
   hostales, hoteles" — SOLO publicable después del ADR D0 (cambio de alcance
   formalizado) y con al menos una demo no-camping viva. Antes sería humo.

Nota de coherencia con el Frente B: todo esto es evolución de B3 (misma app
`apps/site`, misma marca, mismos tokens). No es una landing nueva.

---

## 4 · Anuncios de muestra (Ads display Google/Meta): "así se captan reservas"

Mandato literal: "mostrar cómo si fueran anuncios de Ads display en Google o
Meta para mostrar cómo quedaría hacer campañas para captar reservas".

**Qué es**: una pieza de la landing de venta (y del guion comercial) que
enseña **creatividades de campaña ficticias** con la marca de las demos —
el aspecto exacto que tendrían los anuncios de un camping captando reservas
para SU propio motor. El mensaje de fondo es el argumento anti-OTA: *cada
reserva que entra por tu web con tu campaña es una reserva sin comisión de
Booking*. El anuncio de muestra cierra ese relato: canal propio + motor propio
+ campaña propia.

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
  + titular de temporada ("Agosto junto al mar, con tu parcela reservada") +
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
visitante ya ha decidido *qué quiere*; mandarlo a la home a repetir la
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

- **Cuándo**: "cuando esté muy avanzado el backend demo" (Andreu). Traducción
  operativa propuesta: después de cerrar los remates del frente B1 en curso
  (11/11), el ADR 0030 validado, y con la demo Cala Sereno estable sin deuda
  visual — es decir, el Frente D **no compite** con las sesiones inmediatas.
  Este documento existe para que mientras tanto **nada se construya en
  contra** (p. ej., no cablear nada campista nuevo en el core) y para poderse
  **enseñar ya** como visión.
- **La restricción de siempre manda**: ~6h/semana y "nada que multiplique el
  trabajo por número de clientes". Doce demos solo son viables si cada una es
  **config + contenido + seed** sobre el mismo código — que es a la vez la
  única forma de construirlas y la prueba comercial de la tesis. Si una demo
  pide una rama de código, la demo pierde.
- **El coste real que hay que presupuestar es el de la MATERIA**: 12 marcas ×
  (paleta + logo/tipografía del tenant + **fotos coherentes con el contrato
  de arte** + textos en su voz). Las fotos son la partida cara (Higgsfield,
  con el pipeline ya probado en C5); los textos y temas son horas de las
  sesiones. El seed necesita **parametrización** (hoy `generateSeed` está
  escrito con la forma de Cala Sereno: curva de costa mediterránea, 8 tipos,
  83 unidades — generalizarlo por tamaño/estacionalidad/tipología es LA pieza
  técnica del frente).
- **Infra por demo**: cada demo es un tenant → una D1, un reset nocturno, un
  host. Doce D1s de demo caben de sobra en Cloudflare, pero el **esquema de
  hosts** (¿`{slug}.camp.logic2b.com`? ¿un Worker por demo como hoy, o uno
  multi-demo?) y el **coste operativo del reset ×12** son decisiones del ADR
  D0, no de este documento. Todas las demos con `noindex` salvo decisión
  contraria (la landing de venta sí indexa; las demos son herramienta, no
  contenido).
- **Fase 12 (Camp Motor) sigue intacta**: NO construir. Ninguna demo del
  portfolio la necesita.

---

## 7 · Fases propuestas del frente (cada una abre con su ADR y su sesión)

| Fase | Nombre | Objetivo | Hecho cuando |
|---|---|---|---|
| **D0** | Decisiones de fondo (ADR, con Andreu) | Formalizar el cambio de alcance §0 (campings → alojamiento turístico), validar nombres/temas del portfolio, esquema de hosts e infra ×12, presupuesto de fotos, criterio de honestidad de las maquetas Ads | ADR `aceptado`; CLAUDE.md y Super Prompt §0 revisados en consecuencia |
| **D1** | La fábrica de demos | `generateSeed` parametrizable (tamaño, tipología, estacionalidad, idioma); plantilla de contenido por tema; que `pnpm new:camping` + seed produzca una demo completa | Una demo nueva de prueba nace en una tarde medida, sin tocar `apps/` ni `packages/` |
| **D2** | Grupo A (4 × nivel 1) | Las cuatro landings micro con formulario→email y histórico silencioso | Las 4 vivas con su marca, reset nocturno y `noindex`; Lighthouse ≥95 en las cuatro |
| **D3** | Grupo B (4 × nivel 2) | Los cuatro medianos con bandeja de solicitudes sin cobro | Las 4 vivas; una solicitud enviada desde cada web cae en su bandeja y se gestiona |
| **D4** | Grupo C (4 × nivel 3) | Los cuatro grandes con motor y pago (fake) | Las 4 vivas; una reserva completa en cada una aparece en su planning; Mar de Fondo mueve 300 uds fluido |
| **D5** | Landing de venta v2 | Galería del portfolio, franja de cifras, recorrido por tamaño, bloque de dominio ampliado | Un visitante entiende el rango del producto sin leer un párrafo; todo lo que se promete se clica |
| **D6** | Campañas de muestra | Creatividades display Google/Meta + búsqueda, con UTM fake, enlazadas al funnel de sus demos; sección "Campañas que reservan" + anexo en `DEMO-SCRIPT.md` | En una presentación se recorre anuncio → web → reserva sin salir del navegador |

El orden D2→D3→D4 es el de la escalera (barato→caro), pero D5.2 (franja de
cifras) y D6 (maquetas con Cala Sereno) tienen versiones tempranas que no
dependen del portfolio — decidir en D0 si se adelantan.

---

## 8 · Qué pueden hacer las sesiones de AHORA con este documento

1. **No contradecirlo**: ninguna decisión nueva del core debe asumir
   "camping" donde el dominio dice "unidad/alojamiento".
2. **El candidato cercano que sí es de ahora**: el mostrador dentro de la
   página de alojamiento (§5) — es deuda de la demo actual, no del frente.
3. **Enseñarlo**: este fichero + `docs/TIERS.md` + la demo viva son hoy el
   pitch de escalabilidad mientras el portfolio no existe.
4. **No empezar D1–D6 sin D0**: el frente entero cuelga de un ADR con Andreu
   presente, porque toca §0.
