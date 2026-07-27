# 0030 — El ancla móvil: el "hoy" del seed deja de ser el 15 de julio

- **Fecha**: 2026-07-27
- **Fase**: 10 · Modo demo
- **Estado**: **propuesto** (sesión autónoma, protocolo `docs/CONTINUA.md` §3: el ADR se escribe, se implementa porque el riesgo es bajo y reversible —toca solo `tenants/demo/`, ningún camping real carga un byte de esto— y queda señalado para validación de Andreu a posteriori)
- **Reabre**: ADR 0013 §1, que declaró esto fuera de v1 con motivo. El motivo sigue siendo válido; lo que ha cambiado es la evidencia.

## Contexto

`generateSeed(anchorYear)` genera la demo entera a partir de un **ancla fija**: el
`15 de julio` del año en curso, "mitad de temporada alta". Todo lo que depende
del tiempo se calcula contra esa fecha: qué reserva está terminada, quién está en
casa, quién ha hecho check-in, cuántos días lleva una solicitud en la bandeja.

El dashboard, en cambio, mira el **día real del navegador**. Las dos líneas
temporales solo coinciden un día al año, y ADR 0013 §1 lo dio por aceptable
("fuera de temporada la lista de llegadas mostrará poco o nada, que es el
comportamiento honesto de un camping real"). La sesión 56 le puso precio a esa
frase, midiendo:

1. **El botón de check-out no aparece NUNCA, ningún día del año.** La lista de
   Salidas ofrece el gesto solo si la reserva está `confirmed` **y** tiene
   `checked_in_at` **y** no tiene `checked_out_at` (`Llegadas.tsx`, `inHouse()`).
   El seed estampa `checked_in_at` únicamente sobre las estancias que contienen
   el ancla (`from <= anchor && anchor < to`), así que quien se va hoy —según el
   reloj del seed— todavía no ha llegado. Y no basta con corregir el `<` final:
   `anchor < to` excluye justo a los que salen el propio 15 de julio, de modo que
   **ni siquiera ese día** la pantalla enseñaría el gesto que la justifica.
2. **Fuera de abril–octubre, `/llegadas` sale vacía.** El relleno por curva de
   temporada solo siembra `${Y}-04-15 → ${Y}-10-15`. La mitad del año, la
   pantalla de la operación diaria —la que más veces se mira— es un `EmptyState`.

Las dos son la misma raíz: **el seed tiene un "hoy" y la aplicación tiene otro.**
Y las dos caen del lado que más importa, porque `camp.logic2b.com` no es un
entorno de pruebas: es la herramienta de venta.

## Decisión

### 1. El ancla es una FECHA, y es el día real

`generateSeed(anchor: string)` recibe un ISO `YYYY-MM-DD` en lugar de un año.
Ese ancla es el "hoy" de la demo, y lo pasan los tres llamantes:

| llamante | ancla |
| --- | --- |
| `reset.ts` (cron nocturno + botón de restablecer) | `hoyIso()` — el día en que corre |
| `write-seed.ts` (`pnpm db:seed`) | `SEED_ANCHOR` o el día en curso |
| `data.ts` (web pública, en build) | el día del build |

**El generador sigue siendo puro**: no lee el reloj por dentro. Quien lo lee es
el llamante, que es lo que exige el determinismo del reset (misma entrada → mismo
resultado, byte a byte; hay test).

### 2. El PRNG se siembra con el AÑO, no con el día

`rng(Y * 7919)` no cambia. Es deliberado y es la mitad del diseño: si el
generador colgara del día, **la demo entera se reorganizaría cada madrugada** —
otras reservas, otros clientes, otros códigos— y un comercial que enseñó ayer
`CS-2026-0412` encontraría hoy otra cosa en su sitio.

Con el PRNG atado al año, el reparto de estancias de una temporada es el mismo
los 365 días: lo que se mueve es **la línea de HOY que lo recorre**. Los rasgos
que sí dependen del ancla (estado, check-in/out, edad de las solicitudes, lo
cobrado) salen de PRNGs propios que se consultan **una vez por reserva y sin
condiciones**, para que la tirada de cada reserva tampoco dependa del día.

### 3. El camping abre todo el año, y se siembra el año entero y algo más

Para que "hoy" caiga siempre dentro de la ventana sembrada, la ventana tiene que
ser el año. Y para que "hoy" no se quede **pegado a un borde** de esa ventana
—el 1 de enero sin un día de pasado, el 28 de diciembre sin futuro—, la ventana
tiene que desbordarlo. Son dos cosas distintas y se declaran por separado:

- **La temporada declarada** (`sea_apertura`) pasa de `${Y}-03-15 → ${Y}-11-01`
  a **`${Y}-01-01 → ${Y}-12-31`**: el año natural, ni un día más. Es lo único
  que la tabla de tarifas de la web pública sabe leer — imprime el rango sin
  años, así que una apertura declarada sobre la ventana entera salía como
  «Apertura · 15 nov – 15 feb», que dice lo contrario de lo que significa.
  Con el año natural dice «Apertura · 1 ene – 31 dic»: **abierto todo el año**.
- **La ventana de siembra** (`SEED_FROM`/`SEED_TO`) pasa de
  `${Y}-04-15 → ${Y}-10-15` a **`${Y-1}-11-15 → ${Y+1}-02-15`**: el año más dos
  meses y medio por cada lado, en los meses más flojos y por tanto más baratos
  de sembrar. Las colas caen fuera de la temporada declarada y `seasonFor` les
  da la apertura por defecto, que es justo la que les tocaría.
- La curva de ocupación gana los meses que le faltaban (invierno ~18–22 %,
  hombros 22–30 %), y en invierno las estancias son **más largas** (el invernante
  del norte de Europa que pasa meses en la costa) mezcladas con el fin de semana
  corto. Sin esa mezcla, o no hay ocupación o no hay llegadas diarias.

Contrapartida asumida del desborde: para el motor esas colas son "cerrado", así
que la web pública diría "cerrado" para enero del año siguiente al del seed. A
trece meses vista no lo mira nadie; la tabla de tarifas sí se enseña.

**Esto convierte a Cala Sereno en un camping abierto todo el año**, que es lo que
son muchos campings de la costa de Castellón —y lo que ya insinuaban los dos
bloqueos `longstay` del propio seed—. Se pierde una demostración: el estado
"cerrado" del motor (`is_open: false`, "fuera de temporada = cerrado, no sin
disponibilidad") deja de verse en la web pública de la demo, porque ya no hay
ninguna fecha sin temporada.

Se acepta a sabiendas, y el criterio es el de siempre: **un mes de pantallas
vacías cuesta más que un argumento de conversación**. La alternativa —dejar un
cierre anual de tres semanas— reintroduce el defecto que este ADR viene a
arreglar durante esas tres semanas, que pueden ser justo las de la visita. La
capacidad sigue existiendo en el motor con su test propio
(`engine.test.ts`: "temporada cerrada (isOpen=false) no cuenta aunque cubra la
fecha") y en el editor de temporadas del producto. Queda en BACKLOG la variante
que las conserva las dos: una ventana cerrada derivada del ancla, siempre lejos
de hoy.

### 4. La línea temporal alrededor del ancla, reserva a reserva

El relleno deja de decidir el estado con un `to <= anchor` y pasa por una función
única (`situacion(from, to, anchor)`) con cinco casos, que son los cinco que la
recepción distingue:

| caso | estado | `checked_in_at` | `checked_out_at` |
| --- | --- | --- | --- |
| `to < anchor` — ya se fueron | `completed` | la tarde de entrada | la mañana de salida |
| `to === anchor` — **salen hoy** | `confirmed` | la tarde de entrada | `null` (≈1 de cada 4 ya salió: `completed`) |
| `from < anchor < to` — en casa | `confirmed` | la tarde de entrada (≈1 de cada 6 sin registrar) | `null` |
| `from === anchor` — **llegan hoy** | `confirmed` | `null` (≈1 de cada 4 ya registrada) | `null` |
| `from > anchor` — futuro | 9 % `pending`, 3 % `cancelled`, resto `confirmed` | `null` | `null` |

Las dos filas en negrita son las que no existían. La tercera columna del pasado
tampoco: hasta hoy una reserva `completed` de mayo no tenía ni check-in ni
check-out, lo que es otro dato **válido y falso a la vez** — el histórico de la
ficha de cliente decía que nadie había llegado nunca.

Las seis reservas de caso límite (cruce de temporada, larga estancia, grupo
familiar, cancelada, no-show, sin asignar) dejan de llevar el estado escrito a
mano donde el estado **no es el caso**: lo derivan del ancla como el resto. Solo
`cancelled` y `no_show` se conservan literales, porque ahí el estado ES el caso.
Y la reserva **sin unidad asignada** —la que llena la bandeja "sin asignar" del
planning— pasa a colocarse **relativa al ancla** (20 días por delante): en agosto
del año pasado no es una tarea pendiente, es historia.

## Qué NO resuelve (declarado, no descuidado)

- **La lista de clientes sigue enseñando once "Aalto" seguidos.** Medido esta
  sesión, y **no es una regresión**: el emparejamiento nombre×apellido es una
  biyección **uniforme**, así que cada apellido toca a exactamente
  `fichas / apellidos` fichas y `/clientes` se ordena por apellido — antes eran
  ~9 con 1 500 fichas y 161 apellidos, ahora ~11 con 2 600 y 242. Alargar la
  lista no lo arregla (el bloque sigue midiendo N/L): lo que hace falta es una
  distribución con la cola larga que tienen los apellidos de verdad, y eso pelea
  con la biyección que garantiza que no haya dos clientes iguales (sesión 54).
  Objetivo propio, en BACKLOG.
- **`created_at` de todas las reservas sigue siendo el ancla**: una reserva
  terminada en mayo dice que se creó hoy. Ya pasaba, no es de este objetivo, y
  arreglarlo bien es darle a cada reserva una antelación propia. En BACKLOG.
- **El nombre y el idioma siguen sin concordar** (BACKLOG `[seed]`): intacto.

## Consecuencias

- **El seed crece de 2 032 a 3 491 reservas y el SQL de 1,95 a 3,4 MB** (53 → 84
  sentencias): son quince meses de temporada donde antes había seis. El
  `db.batch()` del reset nocturno sigue siendo una sola transacción y el troceado
  por bytes de ADR 0019 §2.3 no cambia — el límite que aquel ADR encontró era el
  **número** de sentencias (>8 000 no cabían), y 84 no se acerca. Verificado
  contra D1 real en workerd (`reset.test.ts`), no solo sobre el objeto del
  generador. **Es lo que hay que vigilar tras el primer `deploy:demo`**: si el
  cron nocturno fallara, la demo se quedaría con los datos de la víspera.
- **La demo se pone al día sola.** El reset nocturno re-siembra desde
  `generateSeed()`, que es código desplegado: un `deploy:demo` normal basta, sin
  `db:seed:remote --apply`. A las 3:00 de la madrugada siguiente la demo remota
  tiene el ancla del día.
- Los tests del seed dejan de calibrarse sobre un ancla fija y pasan a barrer
  **una muestra de anclas repartida por el calendario** (día 1 y 15 de cada mes,
  más los bordes de año y un 29 de febrero). Un test sobre un solo ancla
  comprueba una tirada, no una propiedad — la lección de las sesiones 54–56, que
  aquí se vuelve literal: **el ancla es ahora una variable de entrada.**
