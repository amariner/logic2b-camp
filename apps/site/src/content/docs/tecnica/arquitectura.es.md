---
title: 'Cómo está montado'
description: 'La arquitectura en una página: dónde corre, con qué está hecho y por qué.'
lang: es
orden: 1
---

Esta guía está escrita para quien lleva la informática del camping y quiere saber dónde se mete antes de dar el visto bueno. Sin marketing.

## En una frase

Logic2B Campings es una aplicación **serverless en el borde de Cloudflare**: web estática + API en Workers + una base de datos **SQLite (D1) por cliente**. No hay servidores que administrar, ni sistema operativo que parchear, ni base de datos compartida.

## Las piezas

| Pieza         | Tecnología                        | Por qué                                                                                   |
| ------------- | --------------------------------- | ----------------------------------------------------------------------------------------- |
| Web pública   | **Astro 5**                       | HTML estático con islas de interactividad. Se sirve desde CDN: no hay render por petición |
| Gestor        | **React 19** (SPA)                | Aplicación de una sola página, servida bajo `/admin` del mismo dominio                    |
| API           | **Hono sobre Cloudflare Workers** | Cómputo en el borde, arranque en frío inapreciable. Tipada de extremo a extremo           |
| Base de datos | **Cloudflare D1** (SQLite)        | **Una instancia por camping.** Ver [Datos y aislamiento](/docs/tecnica/datos-rgpd/)       |
| Autenticación | **Better Auth**                   | Sesión por cookie `HttpOnly` + `Secure`, roles jerárquicos, revocables al instante        |
| Correo        | **Resend**                        | Un dominio verificado por camping. Ver [Correo](/docs/tecnica/correo/)                    |
| Pagos         | **Stripe** o **Redsys**           | Webhooks idempotentes. Configurable por camping, o ninguno                                |
| Ficheros      | **Cloudflare R2**                 | Imágenes y adjuntos, con prefijo por camping                                              |

## Un dominio, un Worker

Todo tu camping —web pública, API y gestor— se sirve desde **un único Worker** en **tu propio dominio**:

- `tucamping.com/` → la web pública
- `tucamping.com/api/*` → la API
- `tucamping.com/admin/` → el gestor

Mismo origen para todo. Eso significa que **no hay CORS**, la cookie de sesión no viaja entre dominios, y no hay una segunda dirección que mantener ni proteger.

## Decisiones que igual te llaman la atención

**Dinero en céntimos enteros, nunca decimales.** Todo importe se guarda como entero. Los decimales flotantes acumulan error de redondeo, y en un sistema que registra reservas y cobros eso acaba en un descuadre que nadie sabe explicar.

**Los precios se guardan con su desglose completo, no como un total.** Cada reserva conserva línea a línea de dónde sale su importe: cada tramo de temporada, cada extra, cada descuento, la tasa, la fianza. Años después se puede justificar cada céntimo ante un cliente o ante Hacienda. Y cambiar una tarifa **nunca** altera una reserva ya confirmada.

**Fechas ISO `YYYY-MM-DD`, sin hora ni zona horaria.** Una estancia es un rango de días, no de instantes. `date_from` es inclusive y `date_to` **exclusive**: el día de salida libera la plaza. Meter zonas horarias en esto solo produce el clásico bug de la reserva que se mueve un día.

**El precio lo calcula siempre el servidor.** El navegador nunca calcula un importe que se vaya a cobrar. Lo que se ve en pantalla viene ya calculado de la API.

## Garantías con test automático

Hay un puñado de propiedades que no se confían a la revisión humana. Cada entrega ejecuta tests que las verifican:

1. **Dos reservas no pueden solaparse** en la misma unidad. La comprobación final ocurre en la base de datos, en el mismo acto de insertar.
2. **La suma de los pagos es igual a lo pagado** de la reserva. Siempre.
3. **Cambiar una tarifa no modifica** ninguna reserva ya confirmada.
4. **Cancelar libera el inventario** en la misma transacción.
5. **Un camping solo puede acceder a su propia base de datos** — con un test explícito que intenta la fuga cruzada y comprueba que no hay camino.

## Actualizaciones

El código es común a todos los campings; lo que varía es la configuración, el diseño y el contenido de cada uno. Una mejora llega a todo el mundo a la vez.

El despliegue a producción de **tu** camping es **siempre manual y aprobado**, nunca automático. Nadie despliega en tu instancia por accidente un viernes a las siete.
