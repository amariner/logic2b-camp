---
title: 'El parte de viajeros'
description: 'Revisar los datos de los viajeros que llegan y preparar un borrador local antes de completar la comunicación en la Sede de SES.Hospedajes.'
lang: es
orden: 4
updated: '2026-08-10'
---

Todo alojamiento en España tiene que comunicar al Ministerio del Interior los datos de las personas que se hospedan. Lo dice el **Real Decreto 933/2021** y se hace a través de la plataforma **SES.Hospedajes**. La pantalla **Parte de viajeros** reúne las llegadas de un día, avisa de lo que falta y prepara un borrador local para revisar los datos antes de completar el procedimiento oficial.

No hay que apuntar nada por separado: el parte se arma con los datos que ya metes en cada reserva. Esta pantalla solo los ordena y comprueba que estén completos.

## Elegir el día

Arriba a la izquierda eliges la fecha. El parte muestra las **llegadas confirmadas de ese día** —quién entra hoy. Con las flechas `←` y `→` te mueves al día anterior o al siguiente. Lo normal es hacerlo al cerrar las llegadas de la jornada.

## Qué necesita cada viajero

El parte pide, de **cada viajero mayor de 14 años**:

- Nombre y **los dos apellidos**
- **Sexo**
- **Tipo y número de documento**, y su **número de soporte** (un dato aparte del número; en el DNI es el código que empieza por letras)
- **Fecha de nacimiento** y **nacionalidad**

De los **menores de 14** basta con el nombre, la fecha de nacimiento y el **parentesco** con la persona que los acompaña (por ejemplo, «hijo»).

Además, de cada estancia hace falta la **forma de pago**: efectivo, tarjeta, transferencia o plataforma de pago.

Todos estos campos se rellenan en la **ficha de la reserva** (huésped a huésped), salvo la forma de pago, que se elige aquí mismo, en el desplegable de cada estancia.

## Completar lo que falta

Cada estancia de la lista muestra sus huéspedes y, debajo, **en ámbar, los datos que faltan** para poder comunicar —con el nombre del huésped y el campo concreto. No es un rechazo genérico del ministerio: ves exactamente qué falta y en quién.

Debajo de los avisos, el enlace **«Completar en la ficha de la reserva»** te lleva a esa reserva para rellenarlo. Cuando vuelvas al parte, el aviso habrá desaparecido.

Mientras quede un solo campo por rellenar, arriba verás **«Faltan datos en N campos»**. Cuando esté todo, cambia a **«Parte completo: N estancias listas para comunicar»**.

## Revisar y exportar

Cuando los datos están completos puedes pulsar **Exportar borrador XML**. El fichero es determinista y sirve para revisión o soporte, pero **no es el formato oficial de carga ni acredita una comunicación**. La documentación técnica vigente del servicio web se descarga dentro del área autenticada de cada entidad; por eso Logic Camp no activa un envío automático basándose solo en una URL, un usuario y una contraseña.

La comunicación se completa en la [Sede Electrónica del Ministerio del Interior](https://sede.interior.gob.es/portal/sede/informacion_hospedajes), donde una entidad registrada puede crear una comunicación o un alta masiva, consultarla y anularla. El código que muestra la Sede después de aceptar una comunicación es la evidencia oficial; un HTTP 2xx o este borrador no lo sustituyen.

La integración directa solo se habilitará después de importar la especificación autenticada, tipar petición y acuse, probar rechazos y decidir duplicados/reintentos sin repetir comunicaciones ambiguas.

> La FAQ oficial exige comunicación inmediata y, como máximo, en 24 horas tanto desde la reserva, formalización o anulación como desde el inicio del servicio. Esta pantalla ayuda hoy a revisar el segundo momento —las llegadas—; todavía no sustituye el recorrido oficial completo de reservas y modificaciones.
