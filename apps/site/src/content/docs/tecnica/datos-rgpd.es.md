---
title: "Datos, aislamiento, RGPD y copias"
description: "Dónde están los datos, quién puede verlos, qué exige el RGPD y qué pasa si te quieres ir."
lang: es
orden: 4
---

La página que probablemente te trajo aquí.

## Una base de datos por camping. Física, no lógica.

Es la decisión de arquitectura más importante del producto, así que conviene decirla con precisión.

Muchos SaaS multi-cliente guardan a todo el mundo en la misma base de datos y separan los datos con una columna (`WHERE cliente_id = …`). Funciona hasta que **una consulta se olvida el `WHERE`** — y entonces un cliente ve los datos de otro. Es el fallo más repetido del sector.

Aquí no es así. **Cada camping tiene su propia base de datos D1**, un fichero SQLite independiente. El Worker de tu camping solo tiene enlazada la tuya: no existe conexión, credencial ni ruta de código que llegue a la de otro.

La diferencia práctica: la fuga cruzada no es que esté *prohibida*, es que **no hay camino** por el que pueda ocurrir. Y hay un **test automático explícito** que en cada entrega intenta la fuga —de datos y de sesión— y comprueba que falla.

## Dónde están físicamente

En la infraestructura de **Cloudflare**. D1 se aloja en la región elegida al crear la base; para clientes españoles se crea en **Europa Occidental**, con lo que los datos personales no salen del EEE.

Cloudflare está adherida a las cláusulas contractuales tipo de la UE y ofrece Acuerdo de Encargado del Tratamiento (DPA).

## RGPD

**Los papeles.** Tú, el camping, eres el **responsable del tratamiento**. Logic2B es **encargado del tratamiento**, y Cloudflare y Resend son subencargados. Al dar de alta el camping se firma el **contrato de encargo** correspondiente. Si tu asesoría quiere revisarlo antes, se lo pasamos.

**Qué se guarda de tus clientes.** Nombre, contacto, documento de identidad, fecha de nacimiento y nacionalidad de los huéspedes (necesarios para el parte de viajeros), y el histórico de reservas y pagos. El sistema guarda el **consentimiento con su fecha**.

**Derechos de los interesados.** Acceso, rectificación, supresión y portabilidad se atienden desde el propio gestor o, si hace falta un volcado completo, pidiéndonoslo.

**Bases legales.** La reserva se trata por **ejecución de contrato**; el registro de viajeros por **obligación legal**; las comunicaciones comerciales, si las hubiera, requieren **consentimiento**.

**Conservación.** El registro de viajeros tiene su plazo legal propio. El resto se conserva mientras dure la relación y el plazo fiscal aplicable.

> **Nota honesta**: el endurecimiento completo de RGPD y retención (políticas de borrado automático, avisos legales, registro de actividades) es una fase de trabajo declarada en el plan **antes del primer cliente en producción**. Preguntad por su estado si estáis a punto de firmar.

## Seguridad

- **HTTPS obligatorio**, certificado gestionado y renovado por Cloudflare.
- **Contraseñas con hash moderno** — jamás en claro, jamás recuperables.
- **Sesión por cookie `HttpOnly` + `Secure`**, revocable al instante: un empleado que se va deja de entrar hoy.
- **Roles jerárquicos** (consulta / recepción / gerencia / dirección) verificados **en el servidor**, no solo escondiendo botones en la pantalla.
- **Límite de peticiones** en la API pública, contra abuso y fuerza bruta.
- **Registro de auditoría inalterable**: cada acción de gestión guarda quién, qué y cuándo.
- **No hay registro público** de usuarios: las cuentas las crea la dirección del camping.

## Copias de seguridad

D1 mantiene **restauración a un punto en el tiempo** (*point-in-time recovery*) gestionada por Cloudflare, que permite volver a un momento anterior dentro de la ventana de retención del plan.

Sobre eso, la base de cada camping se puede **exportar bajo demanda** en SQL.

> Si vuestra política interna exige copias con una frecuencia y una retención concretas —o guardadas fuera de Cloudflare—, decidlo al dar de alta: se puede montar una exportación programada a vuestro propio almacenamiento. No viene por defecto.

## Portabilidad: si un día os vais

Sin letra pequeña:

- Los datos son **del camping**.
- Se entrega un **volcado completo en SQL** (y en CSV los cuadros principales: reservas, clientes, pagos) a petición.
- El **dominio es vuestro** y nunca ha dejado de serlo: se apunta a donde queráis.
- No hay ningún dato retenido como forma de asegurar la permanencia.

## Cómo comprobar todo esto

Lo que dice esta página es verificable. Si queréis auditarlo antes de firmar, pedid:

- El detalle del **test de aislamiento** entre campings.
- El **DPA** y la cadena de subencargados.
- Una **exportación de prueba** de la base de la demo, para ver el formato de salida.

Escribid a **hola@logic2b.com**.
