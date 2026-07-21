# Registro de actividades de tratamiento — plantilla

> Art. 30 del RGPD. **El responsable es el camping**, no Logic2B: es un documento que
> cada camping debe tener y poder enseñar si la AEPD lo pide. Logic2B es encargado del
> tratamiento y mantiene el suyo propio.
>
> Esta plantilla es **de producto**: se escribe una vez y sirve a todos los campings,
> porque todos tratan los mismos datos con el mismo sistema. Al dar de alta un camping
> solo se rellenan los campos entre `«»` — los mismos que ya pide `config.ts`.
> Ver ADR 0026 §2.

## Responsable del tratamiento

|                                 |                      |
| ------------------------------- | -------------------- |
| Razón social                    | «RAZÓN SOCIAL»       |
| NIF                             | «NIF»                |
| Domicilio                       | «DOMICILIO»          |
| Contacto para derechos          | «EMAIL DE DERECHOS»  |
| Delegado de Protección de Datos | No designado / «DPD» |

> La mayoría de campings **no está obligada** a designar DPD: no es autoridad pública,
> ni su actividad principal es la observación a gran escala, ni trata categorías
> especiales a gran escala (art. 37). Si vuestra asesoría opina distinto, mandan ellos.

## Actividades

### 1. Gestión de reservas y estancias

|                                    |                                                                                                                                    |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Finalidad**                      | Formalizar y gestionar la reserva, la estancia y su cobro                                                                          |
| **Base legal**                     | Ejecución de contrato (art. 6.1.b)                                                                                                 |
| **Interesados**                    | Titulares de reserva y acompañantes                                                                                                |
| **Categorías de datos**            | Identificativos (nombre, apellidos), contacto (correo, teléfono), datos de la estancia y económicos                                |
| **Destinatarios**                  | Encargado: Logic2B. Subencargados: Cloudflare (alojamiento), Resend (correo transaccional), «PASARELA DE PAGO»                     |
| **Transferencias internacionales** | No. Datos alojados en Europa Occidental                                                                                            |
| **Plazo de supresión**             | Duración de la relación + plazos de prescripción fiscal y mercantil. Anonimización automática a los 6 años de la última estancia   |
| **Medidas de seguridad**           | Base de datos dedicada por camping, cifrado en tránsito, control de acceso por roles verificado en servidor, registro de auditoría |

### 2. Registro de viajeros

|                          |                                                                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Finalidad**            | Cumplir la obligación de registro documental de viajeros                                                                                 |
| **Base legal**           | **Obligación legal** (art. 6.1.c) — RD 933/2021                                                                                          |
| **Interesados**          | Todas las personas alojadas                                                                                                              |
| **Categorías de datos**  | Identificativos, **documento de identidad**, fecha de nacimiento, nacionalidad, datos de la estancia                                     |
| **Destinatarios**        | Ministerio del Interior / Fuerzas y Cuerpos de Seguridad. Mismos encargados que en (1)                                                   |
| **Plazo de supresión**   | **Tres años** desde el fin de la estancia. **Durante ese plazo la supresión no se puede atender**, ni siquiera a petición del interesado |
| **Medidas de seguridad** | Las de (1). El sistema **impide** la anonimización mientras corre el plazo, y responde con la fecha exacta en que será posible           |

### 3. Solicitudes de información

|                         |                                                                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Finalidad**           | Atender consultas y presupuestos previos a la reserva                                                                      |
| **Base legal**          | Medidas precontractuales a petición del interesado (art. 6.1.b)                                                            |
| **Interesados**         | Personas que rellenan el formulario de contacto                                                                            |
| **Categorías de datos** | Nombre, correo, teléfono, fechas y mensaje libre                                                                           |
| **Destinatarios**       | Los mismos encargados que en (1)                                                                                           |
| **Plazo de supresión**  | Anonimización automática del contacto a los 6 años. Se conserva la solicitud sin datos personales como histórico comercial |

### 4. Gestión de usuarios del sistema

|                         |                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| **Finalidad**           | Dar acceso al personal del camping y trazar sus acciones                                   |
| **Base legal**          | Ejecución de contrato / interés legítimo en la seguridad (art. 6.1.b y f)                  |
| **Interesados**         | Empleados con acceso al gestor                                                             |
| **Categorías de datos** | Nombre, correo corporativo, rol, credencial cifrada, dirección IP y navegador de la sesión |
| **Plazo de supresión**  | Baja del empleado + plazo de prescripción de responsabilidades                             |

### 5. Comunicaciones comerciales — _solo si se activan_

|                        |                                            |
| ---------------------- | ------------------------------------------ |
| **Finalidad**          | Enviar ofertas y novedades                 |
| **Base legal**         | **Consentimiento** (art. 6.1.a), revocable |
| **Plazo de supresión** | Hasta la revocación                        |

> ⚠️ El sistema **no envía comunicaciones comerciales hoy**. Esta entrada solo aplica si
> se activan; si no, bórrala de vuestro registro en vez de dejarla declarada.

## Qué NO hay que declarar aquí

- **Videovigilancia, control horario o nóminas**: son tratamientos del camping ajenos a este sistema. Van en vuestro registro, pero no salen de esta plantilla.
- **Cookies de seguimiento**: no existen. El sitio no lleva analítica ni píxeles, y su única cookie es la de sesión del gestor.

---

**Última revisión de la plantilla**: 2026-07-21 · Logic2B
