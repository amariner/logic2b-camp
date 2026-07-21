# 0026 — Endurecimiento: aislamiento verificable, RGPD operativo, observabilidad y copias (Fase 11)

- **Fecha**: 2026-07-21
- **Fase**: 11 — Endurecimiento. Puerta declarada **antes del primer camping real en producción**.
- **Estado**: **aceptado** — validado por Andreu el 2026-07-21 antes de escribir código. Aprobados el encuadre ("hacer verdad lo publicado"), la decisión de dominio 2.2 (anonimizar y negar con fecha), el bloque 4 sin pipeline propio (a recomendación explícita) y el alcance de los cuatro bloques con recorte a criterio.

## Contexto

La Fase 11 estaba en el plan como "auditoría de aislamiento, RGPD, backups, observabilidad, carga y legales": una lista de buenas intenciones sin criterio para ordenarla. La auditoría previa a este ADR le ha encontrado uno, y no es el que esperaba.

En la sesión 36 (C6, ADR 0025) publicamos `camp.logic2b.com/docs/tecnica/datos-rgpd/`. Es la página que lee **el informático de confianza del camping antes de que su jefe firme**, y hace afirmaciones concretas y comprobables. La auditoría de hoy las ha contrastado una por una contra el código.

**Cuatro de ellas no son verdad hoy.** No son exageraciones de marketing: son frases que invitan al cliente a pedir una prueba que no podríamos entregar.

| Afirmación publicada                                                             | Línea    | Estado real                                                                                                                                      |
| -------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| "hay un **test automático explícito** que en cada entrega intenta la fuga"       | :18      | **Media verdad.** Existe, pero cubre **3 de 40 rutas** (7,5 %)                                                                                   |
| "el sistema guarda el **consentimiento con su fecha**"                           | :30      | **Falso en recepción.** `admin.ts:839` lo escribe siempre `null`; el _checkbox_ del funnel público no tiene `name` y **nunca llega al servidor** |
| "**Registro de auditoría inalterable**"                                          | :47      | **Falso.** Tabla D1 normal, sin _append-only_ ni encadenado. La demo la borra entera cada noche                                                  |
| "se entrega un volcado en SQL **y en CSV**… pedid una **exportación de prueba**" | :63, :73 | **Falso.** No existe exportador de ninguna clase en todo el repo                                                                                 |

A eso se suma lo que la página no menciona porque no hay nada que mencionar: **no existe export de los datos de un interesado (art. 15/20), ni borrado ni anonimización (art. 17), ni política de retención, ni aviso legal, ni política de privacidad**. La web pública de un camping español no tiene hoy una sola página legal — y las claves i18n `footer.legal` y `footer.privacidad` llevan seis idiomas escritas y **huérfanas**, sin ruta que las renderice (`es.json:107-108` vs `Base.astro:292-325`).

Y un hallazgo que no es de RGPD pero que multiplica trabajo por camping, que es la línea roja del proyecto: **`tenants/_template/wrangler.jsonc:12` tiene el cron comentado.** Un camping nuevo nace sin purga de _holds_ y sin recordatorios de llegada hasta que alguien se acuerde de descomentarlo. El alta "de una tarde" incluye hoy un paso silencioso y olvidable.

## El criterio que ordena la fase

La lista original no dice qué es urgente. La auditoría sí:

> **La página publicada es la especificación.** Ya le hemos dicho a un cliente potencial qué hace este producto. Cada bloque de la Fase 11 se juzga por una sola pregunta: _¿hace verdad una frase que ya está publicada, o corrige una que no lo es?_

Esto no es una preocupación de estilo. Es que la asimetría se paga en la dirección mala: una promesa incumplida sobre protección de datos, hecha por escrito a quien está evaluando si firmar, no cuesta una funcionalidad — cuesta la venta y la credibilidad de todo lo demás que dice la página. Y lo de la línea :73 es peor que una exageración: es una **invitación explícita a pedir una prueba** ("pedid una exportación de prueba de la base de la demo") que hoy terminaría en un silencio incómodo.

De ahí salen dos reglas para esta sesión:

1. **Ninguna frase falsa sobre datos personales sobrevive a esta sesión.** O se implementa, o se corrige el texto. Nunca se deja.
2. **Lo que se implemente se implementa de forma que no se vuelva a desalinear** — que es lo que decide el diseño del bloque 1.

## Decisión

Cuatro bloques. Dos grandes (1 y 2), dos pequeños (3 y 4). Los pequeños no se recortan porque son justamente los que cierran frases publicadas.

### 1. El aislamiento se prueba por **barrido**, no ruta por ruta

El hueco es de 37 rutas. La reacción obvia —escribir 37 tests— es exactamente la decisión prohibida por el contrato del proyecto: no multiplica por camping, pero **multiplica por funcionalidad**, y peor, depende de que nadie se olvide. Un test de fuga que se olvida en la ruta nueva es un test que da falsa tranquilidad justo donde no la hay. La cobertura del 7,5 % de hoy no es negligencia de quien lo escribió: es lo que pasa siempre con los tests que hay que acordarse de escribir.

**Decisión: el test se dirige solo, desde el inventario de rutas del propio Hono.** Verificado en la versión instalada: `app.routes` devuelve el array completo de rutas registradas, **incluidas las de los routers montados con `.route()` y con su path completo** (`DELETE /api/z/:id`). El test enumera esa lista, y por cada ruta lanza la petición contra el env del tenant **B** con identificadores y sesión del tenant **A**, y exige que falle (401/403/404 — nunca 200 con datos de A).

La propiedad que compra esto, que es la razón de elegirlo: **una ruta nueva queda cubierta el día que se escribe, sin que nadie haga nada.**

Y el cierre del bucle, que es lo que lo hace de verdad fiable: **toda ruta registrada tiene que estar barrida o declarada en una tabla de excepciones con su motivo, y el test falla si aparece una que no esté en ninguna de las dos.** Así una ruta que no se pueda barrer automáticamente (porque necesita un cuerpo válido, un webhook firmado, etc.) no se cuela en silencio: obliga a una línea explícita que alguien tiene que escribir a conciencia.

Es el mismo movimiento que el test de cobertura del plano en C7 (`expandPlano` coloca exactamente las 83 unidades del seed, y si añades un tipo y olvidas el plano, salta): en vez de comprobar los casos que se nos ocurren, se comprueba que **no falte ninguno**.

Nota de honestidad técnica que va en el ADR para que no se pierda: el aislamiento real lo da el **binding** (`tenant.ts:46`, `createDb(c.env.DB)`), no un filtro `WHERE tenant_id`. Con esa arquitectura un test por ruta es _en teoría_ redundante. Se hace igual por dos motivos: `admin.ts` **sí** usa `tenantId` en algunas escrituras (p. ej. `:1169`), así que el modelo mental no es uniforme y una regresión es posible; y porque la frase publicada promete el test, no la arquitectura.

### 2. RGPD operativo

**2.1 — Export de un interesado.** `GET /api/admin/guests/:id/export` (rol gerencia). Devuelve todo lo que el sistema sabe de esa persona: su ficha, sus reservas, sus pagos y las entradas de auditoría que la mencionan. Es el art. 15 y el art. 20 en una sola pieza, y de paso convierte en verdad la línea :63.

**2.2 — Supresión: se anonimiza, y a veces se niega — con fecha.**

Esta es la decisión de dominio de la fase, y merece explicarse porque la implementación ingenua es ilegal en las dos direcciones.

Borrar la fila del huésped en duro **no se puede**: sus reservas y pagos deben sobrevivir por obligación fiscal, y el registro de viajeros tiene su propio plazo legal (RD 933/2021). Pero ignorar la petición **tampoco**. Así que:

- `DELETE /api/admin/guests/:id` **nunca borra en duro**. Anonimiza: vacía nombre, documento, fecha de nacimiento, nacionalidad, contacto y dirección, y sella `anonymized_at`. La reserva y el dinero siguen ahí, sin dueño identificable — el histórico y los informes no se mueven.
- Si la persona tiene **alguna estancia todavía dentro de un plazo legal de conservación**, la petición se **rechaza con 409 y la fecha exacta a partir de la cual sí se podrá**. Ni se hace a medias en silencio, ni se dice que no sin explicar hasta cuándo.

Eso último es el punto: un "no" sin fecha es indistinguible de un producto que no sabe hacerlo. Un "no hasta el 14 de marzo de 2029, porque la estancia del 13/03/2026 está sujeta al plazo del registro de viajeros" es una respuesta que el camping puede reenviarle al interesado tal cual.

**2.3 — El consentimiento, de verdad.** Tres arreglos a un campo que la doc ya promete: el _checkbox_ del funnel público pasa a viajar al servidor (hoy `FunnelTitular.tsx:222` no tiene `name`: no se serializa, y el `ts` que se guarda es la hora del servidor, no la del acto); se registra **qué versión del texto** se aceptó, porque un consentimiento sin saber a qué no prueba nada; y recepción puede registrarlo (hoy `admin.ts:839` clava `null` sin alternativa, y `guestPatchSchema` ni siquiera admite el campo).

**2.4 — Retención.** Ventana declarada en config con un defecto de producto por encima del máximo legal aplicable, y la tarea del cron que anonimiza lo vencido, siempre con entrada de auditoría y con modo de simulación para poder mirar antes qué haría. Automático porque el RGPD obliga a suprimir cuando la finalidad expira, no a tener un informe de lo que habría que suprimir; con ventana generosa y auditada porque una anonimización equivocada no tiene vuelta atrás.

**2.5 — Páginas legales.** Aviso legal y política de privacidad como **texto de producto** con los datos del tenant interpolados desde un bloque `legal` nuevo en `TenantWebConfig` (razón social, NIF, domicilio, datos registrales, canal de derechos). Se escribe una vez y sirve a todos los campings; el alta rellena cinco campos. Escribir el texto legal a mano por camping habría sido justo lo prohibido.

Las claves `footer.legal` y `footer.privacidad`, huérfanas desde hace seis idiomas, por fin apuntan a algún sitio.

**Y una conclusión que ahorra trabajo, en vez de generarlo: no hace falta banner de cookies.** Comprobado, no supuesto: la web pública no tiene analítica, ni píxeles, ni `document.cookie`; su único almacenamiento es `lc-theme` y `lc-nivel` en `localStorage` (`Base.astro:50-107`) — preferencia de tema y conmutador de la demo, ambos estrictamente funcionales — y la única cookie del sistema es la de sesión de Better Auth, estrictamente necesaria. Con eso **no hay nada que consentir**, y la página de cookies lo que hace es explicar exactamente eso. Es una posición defendible y comprobable, y sale gratis por una decisión de arquitectura que ya estaba tomada. Si algún día entra Cloudflare Web Analytics (Fase 10), es _cookieless_ y la posición aguanta; cualquier otra cosa la rompe, y queda escrito aquí para que se note al añadirla.

### 3. Observabilidad mínima

Hoy `apps/api/src/app.ts` no tiene `onError` ni `notFound` (cero coincidencias en todo `src/`). Consecuencia literal: **cualquier excepción no capturada sale como 500 con el stack trace en el cuerpo de la respuesta** — una fuga de información hacia el cliente— y nadie se entera nunca. El `scheduled()` (`index.ts:18-26`) encadena tres tareas con `await` sin `try/catch`: si la purga de _holds_ falla, los recordatorios de llegada de ese tick **no llegan a ejecutarse**.

Tres piezas pequeñas y de valor desproporcionado: `onError` que devuelve un error limpio con identificador de correlación y registra el detalle del lado del servidor; `scheduled` donde cada tarea falla sola sin arrastrar a las siguientes; y aviso al buzón de la casa cuando algo revienta, reusando el canal de `booking_pending_stuck` que ya existe.

Con una salvedad que hay que decir en voz alta porque es un punto ciego circular: **el aviso viaja por correo, y si lo que ha fallado es el correo, no llega nadie** (`notify.ts:74` escribe un `console.error` y sigue; `notifications_log` queda en `failed` y nada reintenta). No lo resuelve esta sesión. Se registra como lo que es: la observabilidad de verdad necesita un canal que no dependa del sistema que vigila, y eso es Logpush o Sentry, que necesitan credenciales.

### 4. Copias: se decide **no** construir export programado — y la doc lo dice ya

La ficha técnica dice que la exportación programada a almacenamiento propio "no viene por defecto" (:56). **Esa frase se queda como está, porque es verdad y es la decisión correcta**: montar y vigilar un pipeline de copias propio con 6h/semana es exactamente el tipo de infraestructura que se pudre sin que nadie lo note, y el _point-in-time recovery_ de Cloudflare es mejor que lo que construiríamos nosotros.

Lo que sí falta es que el resto del párrafo sea verdad. Hoy "se puede exportar bajo demanda" descansa en que `wrangler d1 export` existe, no en que este repo lo haga o alguien lo haya probado nunca. Así que: comando de export real en el repo, **runbook de restauración escrito y probado contra la demo** (una copia que nadie ha restaurado nunca no es una copia), y la línea del CSV se hace verdad con 2.1 o se cae del texto.

## Qué NO se hace, y por qué

- **Parte de viajeros / SES.Hospedajes.** Es integración con la Guardia Civil, con formato y altas propias: fase entera, no un bloque. Lo que sí entra aquí es su consecuencia de retención (2.2), que es lo que hoy nos puede meter en un problema.
- **Sentry / Logpush.** Credenciales. Se deja el `onError` con el enganche listo.
- **Auditoría realmente inalterable** (encadenado por hash). Es trabajo serio y su valor real es discutible frente a un D1 gestionado con PITR. Esta sesión **corrige la palabra "inalterable"** de la doc, que es lo urgente, y deja la decisión anotada.
- **Pruebas de carga.** Necesitan un entorno desplegado y un objetivo declarado ("cuántas reservas simultáneas en agosto"). Sin ese número, medir es teatro. Va a BACKLOG con la pregunta que hay que responder antes.
- **Reintento de notificaciones fallidas.** Cae del lado del canal que no podemos arreglar sin credenciales (bloque 3).

## Consecuencias

- La página `datos-rgpd.es.md` deja de tener afirmaciones falsas — implementadas o corregidas, ninguna en pie.
- Una ruta nueva de API nace con test de fuga cruzada sin que nadie se acuerde. El coste de mantener el aislamiento verificado pasa a ser cero.
- Un camping nuevo obtiene sus páginas legales rellenando cinco campos del config; el texto es del producto.
- Se arregla el cron comentado de `_template`, que era un paso olvidable en un alta que debe costar una tarde.
- Un derecho de supresión se puede atender desde el gestor, y cuando no se puede, el camping tiene la fecha y el motivo para responder.
- El sistema deja de contestar 500 con el stack trace.

## Lo que este ADR pide validar antes de escribir código

1. **El encuadre**: ordenar la fase por "hacer verdad lo publicado" en vez de por la lista original del ROADMAP.
2. **2.2 — anonimizar y negar con fecha** en vez de borrar. Es la decisión de dominio de la fase y la más difícil de cambiar después.
3. **El bloque 4**: confirmar que **no** construimos copias propias, solo el comando y el runbook.
4. **Sin banner de cookies**, apoyado en que no hay seguimiento — con la consecuencia de que meter analítica no _cookieless_ en el futuro obliga a revisarlo.
5. **El alcance de cuatro bloques** para una sesión. Si es demasiado, el orden de recorte es: primero cae 2.4 (retención automática), luego 2.1 (export). Los bloques 1, 3 y las páginas legales de 2.5 **no se recortan**: son los que cierran frases ya publicadas o un agujero legal abierto.
