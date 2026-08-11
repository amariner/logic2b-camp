# 0044 — Solicitud contextual en la ficha de alojamiento para tier 2

- **Estado**: propuesto
- **Fecha**: 2026-08-11
- **Ámbito**: web pública compartida (`apps/web`), modo `enquiry` / tier técnico 2

## Contexto

En Camp Solicitudes el recorrido actual termina mal: la persona abre la ficha de
un bungalow, parcela o mobil-home y el CTA la envía a `/contacto`. El formulario
vuelve a pedir «cómo quieres quedarte» y, en el transporte persistente, el
frontend ni siquiera envía `unitTypeId` aunque la API y la tabla `enquiries` ya
lo admiten.

La ficha es el punto donde el visitante ya ha elegido. Sacarlo de ella rompe la
continuidad y convierte una intención concreta («quiero este bungalow») en una
consulta genérica. En tier 2 no existe disponibilidad en tiempo real, hold ni
pago: debe sentirse como el último paso del recorrido comercial sin fingir que
la reserva está confirmada.

## Decisión

### 1. La ficha es el cierre del recorrido en modo `enquiry`

Cuando `bookingMode(tier) === 'enquiry'`, cada
`/alojamientos/{unitTypeId}` incorpora al final una sección de solicitud. El CTA
de la columna de ficha baja a esa sección mediante un ancla local; no navega a
`/contacto`.

La sección muestra un título y texto contextualizables desde el contenido del
tenant, con el nombre del tipo como variable (`{tipo}`). La copia debe hablar de
**solicitud** y de confirmación posterior por recepción, nunca de disponibilidad
comprobada ni reserva confirmada.

### 2. El tipo elegido queda fijado, visible y enviado

`EnquiryForm.astro` gana una entrada opcional `fixedStayId`. Cuando existe:

- valida que el tipo pertenece al catálogo del tenant;
- muestra el nombre del alojamiento como dato elegido, no como selector;
- emite un `input type="hidden" name="stay"` con su identificador;
- usa ese mismo tipo en el resumen de confirmación demo;
- lo conserva en `demo-session` y lo envía como `unitTypeId` al transporte
  persistente.

No se deduce el tipo a partir de la URL dentro del formulario. La página Astro
ya lo conoce y lo pasa explícitamente, de modo que el componente sigue siendo
reutilizable y comprobable.

### 3. La solicitud llega contextualizada a la bandeja

El `POST /api/enquiries` ya acepta `unitTypeId`, fechas y ocupación. El formulario
persistente enviará `unitTypeId` cuando haya una estancia seleccionada o fijada;
también enviará los campos estructurados que realmente tenga disponibles, sin
intentar interpretar texto libre como fechas.

Así, la bandeja de Solicitudes puede mostrar el bungalow/parcela exacto y el
equipo de recepción no necesita reconstruir la intención leyendo el mensaje.
`enquiries` sigue siendo una entidad propia: no se crea un booking provisional.

### 4. Las otras fronteras de nivel no cambian

- **Tier 1 / `none`**: conserva el CTA a `/contacto`; no gana motor, isla ni
  formulario extra en la ficha.
- **Tier 3 / `instant`**: conserva el mostrador de disponibilidad contextual y
  su funnel con hold/reserva.
- El conmutador comercial de la demo sigue representando únicamente sus
  variantes actuales; este cambio no añade un tercer estado al switch.

Los formularios generales de Home y Contacto se mantienen como vías de consulta
abierta. La ficha añade el cierre específico, no elimina esos puntos de entrada.

## Accesibilidad y experiencia

- El ancla de solicitud tendrá margen de scroll para no quedar bajo la cabecera.
- El alojamiento fijado se expondrá como texto visible asociado a una etiqueta;
  el campo oculto solo transporta el identificador.
- Errores, estado de envío y confirmación conservan `aria-live` y foco existentes.
- El formulario permanece completamente server-rendered con JavaScript mínimo;
  no se introduce una isla ni una llamada de disponibilidad en tier 2.

## Pruebas de aceptación

1. Un build tier 2 genera en cada ficha una sección de solicitud cuyo campo
   `stay` contiene exactamente el `unitTypeId` de esa ficha.
2. La estancia fijada no puede cambiarse desde el formulario y su nombre es
   visible antes de enviar.
3. En `demo-session`, enviar desde la ficha de Bungalow crea en `localStorage`
   una solicitud con `unitTypeId` de Bungalow y el gestor la muestra como tal.
4. El transporte persistente envía `unitTypeId` en el JSON de
   `/api/enquiries`.
5. Tier 1 sigue sin motor y sin formulario contextual; tier 3 conserva el
   mostrador/funnel actual.
6. La fábrica construye todos los tenants y `pnpm check` queda verde.

## Alternativas descartadas

- **Seguir enviando a `/contacto?stay=…`**: conserva el dato, pero no la sensación
  de continuidad solicitada; obliga a otra navegación justo al final.
- **Crear un mini-funnel React para tier 2**: añade peso y estado innecesarios.
  La solicitud no necesita cotización, hold ni pasos intermedios.
- **Crear un booking `pending`**: viola el modelo de dominio. Una solicitud no
  bloquea inventario ni es una reserva en borrador.
- **Ocultar completamente el tipo**: técnicamente lo enviaría, pero el visitante
  no tendría confirmación visible de qué está solicitando.
