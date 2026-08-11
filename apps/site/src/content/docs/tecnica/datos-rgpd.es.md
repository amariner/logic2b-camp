---
title: 'Datos, aislamiento, RGPD y copias'
description: 'Dónde están los datos, quién puede verlos, qué exige el RGPD y qué pasa si te quieres ir.'
lang: es
orden: 4
updated: '2026-07-21'
---

La página que probablemente te trajo aquí.

## Una base de datos por camping. Física, no lógica.

Es la decisión de arquitectura más importante del producto, así que conviene decirla con precisión.

Muchos SaaS multi-cliente guardan a todo el mundo en la misma base de datos y separan los datos con una columna (`WHERE cliente_id = …`). Funciona hasta que **una consulta se olvida el `WHERE`** — y entonces un cliente ve los datos de otro. Es el fallo más repetido del sector.

Aquí no es así. **Cada camping tiene su propia base de datos D1**, un fichero SQLite independiente. El Worker de tu camping solo tiene enlazada la tuya: no existe conexión, credencial ni ruta de código que llegue a la de otro.

La diferencia práctica: la fuga cruzada no es que esté _prohibida_, es que **no hay camino** por el que pueda ocurrir.

Y no nos limitamos a afirmarlo. En cada entrega, un test automático levanta **dos campings reales** con sus dos bases, y **recorre una por una todas las rutas de la API** intentando leer los datos del primero desde el segundo, con su identificador y su sesión. Hoy son **42 rutas barridas**; las tres restantes están declaradas por escrito con el motivo por el que no se pueden barrer solas.

El detalle que hace que esto siga siendo cierto dentro de dos años: el test **se genera del inventario de rutas del propio servidor**, no de una lista escrita a mano. Una funcionalidad nueva queda cubierta el día que se escribe, y si alguien añade una ruta que el barrido no sabe recorrer, **la entrega falla** hasta que se declare. No depende de que nadie se acuerde.

## Dónde están físicamente

En la infraestructura de **Cloudflare**. D1 se aloja en la región elegida al crear la base; para clientes españoles se crea en **Europa Occidental**, con lo que los datos personales no salen del EEE.

Cloudflare está adherida a las cláusulas contractuales tipo de la UE y ofrece Acuerdo de Encargado del Tratamiento (DPA).

## RGPD

**Los papeles.** Tú, el camping, eres el **responsable del tratamiento**. Logic2B es **encargado del tratamiento**, y Cloudflare y Resend son subencargados. Al dar de alta el camping se firma el **contrato de encargo** correspondiente. Si tu asesoría quiere revisarlo antes, se lo pasamos.

**Qué se guarda de tus clientes.** Nombre, contacto, documento de identidad, fecha de nacimiento y nacionalidad de los huéspedes (necesarios para el parte de viajeros), y el histórico de reservas y pagos. El sistema guarda el **consentimiento con su fecha y con la versión del texto que se aceptó** — una fecha sin saber a qué se consintió no prueba nada. Es revocable desde la ficha.

Una reserva hecha por la web **no se puede crear sin consentimiento**: no es una casilla que se valida en el navegador, es una condición que el servidor rechaza.

**Derechos de los interesados.** Acceso, rectificación, supresión y portabilidad se atienden **desde el propio gestor**, en la ficha del cliente: un botón descarga todo lo que el sistema sabe de esa persona (ficha, reservas, pagos y rastro de auditoría) en un formato legible por máquina, y otro ejerce la supresión.

**Cómo funciona la supresión, dicho con precisión.** No se borra la fila en duro, porque las reservas y los pagos deben sobrevivir por obligación fiscal. Se **anonimiza**: desaparecen nombre, documento, fecha de nacimiento, nacionalidad y contacto, y el histórico queda sin dueño identificable. Se limpia además el dato personal que hubiera quedado copiado en el registro de auditoría — si no, la anonimización sería aparente.

Y cuando **no se puede**, el sistema no dice que no a secas: responde con **la fecha exacta a partir de la cual sí se podrá**, y con el motivo. Ejemplo real: si la última estancia terminó el 14/03/2026, el registro de viajeros obliga a conservar la identidad hasta el 14/03/2029, y eso es literalmente lo que contesta. Es una respuesta que podéis reenviarle al interesado tal cual.

**Bases legales.** La reserva se trata por **ejecución de contrato**; el registro de viajeros por **obligación legal**; las comunicaciones comerciales, si las hubiera, requieren **consentimiento**.

**Conservación.** El registro de viajeros tiene su plazo legal propio (**tres años**, RD 933/2021), y durante ese plazo la identidad no se suprime aunque se pida. Pasada la ventana de conservación, una tarea automática **anonimiza sola** lo vencido, y deja constancia en el registro de auditoría. La ventana por defecto son seis años, deliberadamente por encima del plazo legal: una anonimización no tiene vuelta atrás.

Esto **también corre en el nivel 1**, que no tiene motor de reservas pero sí acumula solicitudes de contacto: se anonimiza el contacto y se conserva la solicitud, porque el histórico de peticiones es vuestro y las fechas no son dato personal.

**Textos legales.** La web de cada camping publica su **aviso legal**, su **política de privacidad** y su **política de cookies**, con vuestros datos de responsable. No llevan banner de cookies, y no por descuido: el sitio no tiene analítica, ni píxeles de seguimiento, ni cookies de terceros. La única cookie es la de sesión del gestor, que es estrictamente necesaria y está exenta. Si algún día se añade analítica, se revisa.

## Seguridad

- **HTTPS obligatorio**, certificado gestionado y renovado por Cloudflare.
- **Contraseñas con hash moderno** — jamás en claro, jamás recuperables.
- **Sesión por cookie `HttpOnly` + `Secure`**, revocable al instante: un empleado que se va deja de entrar hoy.
- **Roles jerárquicos** (consulta / recepción / gerencia / dirección) verificados **en el servidor**, no solo escondiendo botones en la pantalla.
- **Límite de peticiones** en la API pública, contra abuso y fuerza bruta.
- **Registro de auditoría**: cada acción de gestión guarda quién, qué y cuándo — incluida la entrega de un export y el ejercicio de una supresión.
- **No hay registro público** de usuarios: las cuentas las crea la dirección del camping.
- **Errores sin filtración**: si algo falla, la respuesta lleva una referencia y nada más. El detalle técnico se queda en el servidor bajo esa misma referencia; nunca viaja al navegador.

> **Precisión sobre la auditoría**, porque una versión anterior de esta página decía "inalterable" y no es exacto: el registro es una tabla de la base de datos con permisos de aplicación, **no un almacén append-only con encadenado criptográfico**. Es resistente a errores de operación y suficiente para reconstruir qué pasó; no es una prueba forense frente a alguien con acceso administrativo a la base. Si vuestra política exige lo segundo, decidlo y lo hablamos — preferimos precisar esto por escrito antes de firmar que después.

## Copias de seguridad

D1 mantiene **restauración a un punto en el tiempo** (_Time Travel_) gestionada por Cloudflare, continua y con una ventana de **30 días**.

Sobre eso, la base de cada camping se **exporta bajo demanda** con un comando del propio proyecto, que produce el volcado completo en SQL **y** los cuadros principales en CSV.

Lo que nos parece más importante deciros: existe un **procedimiento de restauración escrito**, con las comprobaciones que hay que pasar antes de dar una copia por buena — incluidas dos consultas que verifican que los pagos cuadran con lo cobrado y que no hay reservas solapadas. Una copia que nadie ha restaurado nunca no es una copia, es una suposición.

> Si vuestra política interna exige copias con una frecuencia y una retención concretas —o guardadas fuera de Cloudflare—, decidlo al dar de alta: se monta una exportación programada a vuestro propio almacenamiento. **No viene por defecto, y es una decisión deliberada**: preferimos apoyarnos en la restauración continua de Cloudflare antes que mantener un pipeline propio de copias que puede degradarse sin que nadie lo note.

## Portabilidad: si un día os vais

Sin letra pequeña:

- Los datos son **del camping**.
- Se entrega un **volcado completo en SQL** y, en CSV, los cuadros principales: reservas, clientes y pagos. Es un comando, no un favor: sale en minutos.
- El **dominio es vuestro** y nunca ha dejado de serlo: se apunta a donde queráis.
- No hay ningún dato retenido como forma de asegurar la permanencia.

## Cómo comprobar todo esto

Lo que dice esta página es verificable. Si queréis auditarlo antes de firmar, pedid:

- El detalle del **test de aislamiento** entre campings, con la lista de rutas que barre y las excepciones declaradas.
- El **DPA** y la cadena de subencargados.
- Una **exportación de prueba** de la base de la demo, para ver el formato de salida.
- El **procedimiento de restauración**, con sus comprobaciones.
- Una **prueba del ejercicio de derechos**: pedidnos el export y la supresión de un cliente ficticio de la demo y os enseñamos las dos respuestas, incluida la de un plazo legal que lo impide.

Escribid a **hola@logic2b.com**.
