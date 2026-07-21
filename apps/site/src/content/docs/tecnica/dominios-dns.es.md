---
title: 'Dominios y DNS'
description: 'Qué hay que tocar en tu DNS, qué NO hay que tocar y cómo se hace el cambio sin caída.'
lang: es
orden: 2
---

Tu web sigue en **tu dominio**, con tu registrador de siempre. No hay que transferir nada ni comprar dominio nuevo.

## Lo que hace falta

El dominio tiene que resolver contra Cloudflare. Hay dos formas, y la elegís vosotros:

**Opción A — delegar el dominio a Cloudflare (recomendada).** Se cambian los **servidores de nombres (NS)** en el registrador y a partir de ahí el DNS se gestiona desde Cloudflare. Es lo más simple y lo que menos mantenimiento da después.

**Opción B — mantener tu DNS actual.** Se apunta el registro del sitio contra Cloudflare desde donde estés. Es viable; solo hace falta coordinar el cambio.

Si el dominio ya está en Cloudflare, no hay nada que hacer.

## Qué registros se tocan

- El **apex** (`tucamping.com`) y el **`www`** apuntan al Worker.
- Si tienes `blog.`, `tienda.` u otros subdominios, **se quedan como están**. Solo se toca lo que sirve la web del camping.
- Los registros de **correo (MX)** no se tocan. Tu buzón sigue exactamente donde está. Ver [Correo](/docs/tecnica/correo/).

## Certificado HTTPS

Lo emite y lo renueva Cloudflare, automáticamente. No hay certificados que vigilar ni fechas de caducidad que apuntar en el calendario. HTTPS obligatorio y HTTP/3 desde el primer día.

## El cambio, sin caída

El orden es este, y evita que haya un solo minuto con la web caída:

1. Se monta tu instancia completa en una dirección de pruebas.
2. La revisas con calma: contenido, fotos, precios, idiomas.
3. Se **baja el TTL** de los registros actuales (a 300 segundos) unas horas antes.
4. Se hace el cambio de DNS.
5. La web nueva empieza a responder en minutos, no en días.

La web antigua puede seguir levantada mientras tanto. Si algo no cuadra, se vuelve atrás cambiando el DNS otra vez.

## Posicionamiento

Como el dominio y la estructura de direcciones se mantienen, **no se pierde posicionamiento**. Además se entregan:

- `sitemap.xml` por idioma
- `robots.txt`
- Etiquetas `hreflang` correctas entre los seis idiomas
- Datos estructurados del camping y de cada alojamiento
- Open Graph para compartir en redes

Si vienes de una web con direcciones distintas, se preparan las **redirecciones 301** desde las antiguas. Pásanos la lista de las que tengan tráfico.

## Correo ya existente

Insistimos porque es el miedo más habitual: **el correo no se toca**. Si usas Google Workspace, Microsoft 365 o el correo de tu proveedor, sigue igual. Lo único que se añade es un registro para que el sistema pueda **enviar** notificaciones en tu nombre, y eso se explica en la página siguiente.
