---
title: "Correo saliente"
description: "Cómo envía el sistema los emails a tus clientes, y qué hay que configurar para que no caigan en spam."
lang: es
orden: 3
---

El sistema envía emails automáticos: confirmación de reserva, aviso de solicitud, cancelación, recordatorio de llegada. Esos correos salen **con tu dominio como remitente**, para que tu cliente vea `reservas@tucamping.com` y no una dirección desconocida.

## Quién los envía

El proveedor es **[Resend](https://resend.com)**. Logic2B tiene una única cuenta con **varios dominios verificados**, uno por camping. Tu dominio es tuyo y tu reputación de envío también: lo que envíe otro camping no te afecta.

## Qué hay que configurar

Para poder enviar en tu nombre hay que añadir unos registros DNS. Son **registros de envío**, no de recepción: **no cambian dónde llega tu correo**.

| Registro | Para qué |
|---|---|
| **SPF** (TXT) | Autoriza a Resend a enviar en nombre de tu dominio |
| **DKIM** (TXT) | Firma criptográfica de cada mensaje |
| **DMARC** (TXT) | Política de qué hacer si un mensaje no pasa las comprobaciones |

Los valores exactos te los pasamos al dar de alta el camping. Se ponen una vez.

> **Si ya tienes SPF**, no crees un segundo registro: hay que **añadir** el mecanismo de Resend al que ya existe. Dos registros SPF en un dominio los invalidan los dos, y es la causa número uno de que el correo empiece a caer en spam después de un cambio. Si lo prefieres, revísalo con nosotros antes de aplicarlo.

## Subdominio de envío

Se puede usar un subdominio (`envios.tucamping.com`) en vez del dominio principal. Tiene una ventaja real: **aísla la reputación** del correo automático de la del correo que escribís vosotros a mano. Si un día una campaña genera quejas, no arrastra a tu buzón corporativo.

Es lo que recomendamos si el camping envía mucho.

## Qué se envía

| Evento | A quién |
|---|---|
| Solicitud recibida | Al cliente (acuse) y al camping (aviso) |
| Reserva confirmada | Al cliente, con código y desglose |
| Reserva cancelada | Al cliente, con el reembolso previsto |
| Recordatorio de llegada | Al cliente, el día antes |
| Reserva pendiente de pago colgada | Al camping |

Cada uno en **el idioma en que el cliente navegó** (los seis soportados). Y **cada notificación se enciende o se apaga** desde los ajustes del gestor, sin necesidad de despliegue.

## Trazabilidad

Todo intento de envío queda registrado —enviado, en cola, fallido o desactivado— con su destinatario, su evento y su fecha, consultable desde la pantalla **Notificaciones** del gestor.

Es la respuesta a "¿le llegó la confirmación al cliente?" sin depender de que alguien mire un buzón.

## Robustez

El envío ocurre **después** de responder al usuario. Si Resend tuviera una caída, la reserva se crea igual: el email se registra como fallido y se puede reintentar. **Un problema del proveedor de correo nunca afecta a una reserva.**
