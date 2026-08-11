# 0045 — GTM, consentimiento y correo comercial en Camp

- **Estado**: aceptado por Andreu (2026-08-11, autorización explícita para comenzar el desarrollo)
- **Fecha**: 2026-08-11
- **Ámbito**: sitio comercial `apps/site`, endpoint `POST /api/leads` y despliegue
  demo `camp.logic2b.com`

## Contexto

`camp.logic2b.com` ya es una superficie comercial de Logic2B: presenta el
producto, enlaza sus temas y demos y capta solicitudes de propietarios de
campings. Sin embargo, su contrato de endurecimiento actual garantiza justo lo
contrario de lo que ahora se necesita activar:

- `apps/web/scripts/r12-boundaries.mjs` rechaza cualquier tracker en fuente o
  artefacto;
- la documentación y el inventario R12 declaran que no existe analítica ni CMP;
- `apps/site` no ofrece aviso legal, privacidad ni cookies propios;
- los formularios comerciales no exigen aceptar la política de privacidad;
- el Worker de producción usa `LEADS_TRANSPORT=demo`, por lo que la landing
  simula el envío y no entrega el lead.

La implementación de referencia vive en `../logic2b-note`: GTM
`GTM-TVDWZ9LC`, consentimiento versionado `l2b-consent`, carga diferida de GTM,
banner con aceptar/rechazar/configurar, páginas legales y una función de leads
que usa Resend. Se reutilizan sus decisiones, pero no se copia a ciegas su
stack Svelte ni una política redactada para servicios web genéricos: Camp usa
Astro, tiene identidad botánica y trata datos de interesados en un producto
para campings.

Hay una frontera adicional. En el Worker de Camp, `RESEND_API_KEY` alimenta hoy
tanto el lead comercial como las notificaciones de solicitudes y reservas. La
D1 demo contiene destinatarios y remitentes `.example`. Configurar una clave
real bajo ese binding activaría también intentos de mensajería interna que
Andreu ha pedido mantener apagados.

## Decisión

### 1. El GTM de Logic2B mide únicamente la superficie comercial

`apps/site` incorpora el contenedor existente `GTM-TVDWZ9LC`. La carga se hace
exclusivamente después de un consentimiento afirmativo para analítica; antes de
aceptar, y después de rechazar o revocar, el navegador no solicita recursos de
Google.

El alcance inicial incluye la landing, temas, precios, documentación y páginas
legales servidas por `Base.astro`. No se inyecta el contenedor en:

- las webs tenant de `apps/web`, incluidas las demos bajo `/demo/` y `/demos/*`;
- el gestor bajo `/admin/`;
- futuros dominios de clientes.

La landing sí puede medir, sin PII, los saltos hacia esas superficies mediante
eventos previos a la navegación. El catálogo inicial queda limitado a:

- vista de página, gestionada por la etiqueta GA4 ya publicada en el
  contenedor;
- `camp_open_lead_form`;
- `camp_view_demo` y `camp_open_manager`;
- `camp_submit_lead`, solo cuando `/api/leads` confirma `outcome=delivered`;
- atributos cerrados como idioma, plan o destino, nunca nombre, camping, email,
  teléfono, mensaje, identificador de reserva ni texto libre.

La propiedad y el contenedor siguen siendo de Logic2B. Los campings reales no
heredan analítica de la plataforma: cuando exista un cliente, su medición será
configuración explícita del tenant y una decisión separada de responsable,
cuenta, consentimiento y retención.

### 2. Se porta el comportamiento del banner, no el runtime Svelte

Se crea un componente Astro/TypeScript propio de `apps/site`, sin incorporar
Svelte ni otra dependencia. Conserva el contrato probado en `logic2b-note`:

- categorías reales: esenciales y analítica;
- decisión versionada en `localStorage` con clave `l2b-consent`;
- botones `Aceptar` y `Rechazar` con la misma jerarquía y visibilidad;
- panel de preferencias con analítica desactivada por defecto;
- mecanismo permanente desde `/cookies` para revocar o volver a decidir;
- retirada que borra las cookies `_ga*`, `_gid*` y `_gat*` accesibles desde el
  dominio y evita nuevas emisiones;
- foco, teclado, `aria-live`, contraste AA, responsive y
  `prefers-reduced-motion`.

El almacenamiento permanece separado por origen. Aunque la clave se llame igual,
la decisión tomada en `logic2b.com` no se puede leer desde
`camp.logic2b.com`. No se introduce ahora una cookie compartida `.logic2b.com`:
evita acoplar los dos despliegues y permite que cada política describa su sitio
real. El banner adopta el sistema botánico de Camp; no copia los colores de la
landing Horizonte.

La carga sigue el modo de consentimiento **básico**: no se usa Consent Mode
avanzado ni se envían pings sin cookies antes del consentimiento.

### 3. Camp publica sus propias páginas legales

Se crean aviso legal, privacidad y cookies dentro de `apps/site`, en español e
inglés, con canonical/hreflang, enlaces desde todos los footers y entrada en el
sitemap. Reutilizan los datos societarios reales de Logic2B S.L., pero describen
las finalidades específicas de Camp:

- información y demostración comercial del producto;
- respuesta a solicitudes de demo o proyecto;
- analítica de la superficie comercial solo tras consentimiento;
- Cloudflare como alojamiento/protección y Resend como transporte del lead;
- alcance explícito: las demos ficticias no son campings reales ni sus páginas
  legales sustituyen las de un cliente.

La política de cookies enumera únicamente el almacenamiento que realmente se
observe en el artefacto publicado. La tabla se mantiene conservadora (`l2b-consent`
y cookies GA4 `_ga*`) y se revisa contra el contenedor publicado antes del
despliegue. Las páginas no se redirigen a `logic2b.com`: compartir titular no
convierte ambas superficies en el mismo tratamiento ni evita explicar el
producto que el visitante está usando.

### 4. El formulario obtiene consentimiento y mantiene una frontera antispam

Los formularios comercial inline y modal incorporan:

- checkbox obligatorio con enlace a la privacidad y texto localizado;
- `accept: true` validado también por Zod en el servidor;
- honeypot que devuelve una respuesta neutra sin consumir Resend;
- la cuota anónima ya existente y sus pruebas.

La activación real no enviará datos a GTM. El evento de conversión ocurre tras
la respuesta de entrega y solo contiene dimensiones cerradas. Turnstile se
considera una segunda barrera recomendable, pero no se acopla a esta primera
activación hasta confirmar o crear un widget autorizado para
`camp.logic2b.com`; el honeypot, el rate limit y el interruptor del transporte
siguen funcionando sin un script externo adicional.

### 5. Resend se activa solo para captación comercial

El endpoint `POST /api/leads` deja de leer `RESEND_API_KEY` y usa un binding
dedicado `LEADS_RESEND_API_KEY`. En producción:

```text
LEADS_TRANSPORT=resend
LEADS_RESEND_API_KEY=<misma clave de la cuenta Resend de Logic2B>
RESEND_API_KEY=<ausente>
```

Esto permite usar, mientras convenga por el plan gratuito, la misma cuenta e
incluso el mismo valor de API key que `logic2b.com`, sin activar notificaciones
internas de reservas, solicitudes, recordatorios o errores del camping demo.
El remitente se mantiene bajo el dominio ya verificado de Logic2B y el
destinatario comercial se centraliza como constante/configuración de plataforma,
no como dato del tenant ficticio.

La clave solo se guarda como secret del Worker; no se copia desde el otro
repositorio, no se escribe en `.env`, documentación, comandos con valor visible
ni logs. Cloudflare y Resend no permiten recuperar posteriormente el valor de
un secreto ya almacenado, por lo que Andreu tendrá que introducir una vez la
clave vigente o crear una nueva si no la conserva.

Para apagar únicamente la captación real se restaura `LEADS_TRANSPORT=demo` o
`disabled` y se retira `LEADS_RESEND_API_KEY`. Las notificaciones internas
continúan independientes y apagadas mientras `RESEND_API_KEY` no exista.

### 6. El contrato R12 cambia de ausencia global a alcance permitido

No se elimina el gate para que el build pase. Se refactoriza para comprobar la
nueva propiedad:

- GTM, `dataLayer` y consentimiento solo pueden aparecer en `apps/site` y en su
  artefacto comercial;
- `apps/web` y `apps/dashboard` siguen fallando si incorporan trackers;
- la política `/cookies` debe declarar Google Analytics y el mecanismo de
  retirada;
- una prueba del artefacto confirma que el HTML inicial no contiene una carga
  ejecutable inmediata de Google y que la URL remota solo se construye tras la
  decisión afirmativa;
- las pruebas de navegador verifican rechazo, aceptación, persistencia y
  revocación, además de cero peticiones a Google antes de aceptar.

El inventario y el runbook R12 pasan Analytics de “ausente” a “activado solo en
captación comercial con consentimiento”; no cambian el estado de los tenants.

## Tensión de las ocho lentes

- **Arquitectura/Fullstack:** un solo componente y un solo contrato de eventos
  para la superficie comercial; ninguna configuración manual por camping. Los
  gates se estrechan por superficie en lugar de desaparecer.
- **Backend:** separar `LEADS_RESEND_API_KEY` impide que una credencial comercial
  active efectos internos no autorizados. El servidor valida consentimiento y
  no registra cuerpos o PII del proveedor.
- **Frontend/UX:** aceptar, rechazar y configurar son comprensibles y reversibles;
  el formulario explica el siguiente paso y no afirma entrega simulada cuando
  el transporte es real.
- **Producto:** medir la visita comercial y entregar el lead mejora la herramienta
  de ventas hoy; rastrear las demos tenant o construir mensajería de reservas no
  es necesario para ese objetivo.
- **UI:** se conserva la interacción de referencia dentro de la marca botánica,
  con controles AA y sin una dependencia Svelte solo para el banner.
- **SEO:** las legales son indexables y localizadas; GTM no bloquea render ni se
  carga sin consentimiento; canonical, hreflang y sitemap se mantienen desde la
  misma fuente de rutas.

## Pruebas de aceptación

1. En una visita nueva a una ruta de `apps/site`, no existe petición a
   `googletagmanager.com` ni `google-analytics.com` antes de decidir.
2. `Rechazar` guarda la decisión, oculta el banner y no carga Google al navegar.
3. `Aceptar` carga una sola vez `GTM-TVDWZ9LC`; recargar conserva la elección.
4. `/cookies` permite revocar, borra cookies GA accesibles y vuelve a mostrar el
   banner.
5. `/demo/`, `/demos/*` y `/admin/` no contienen GTM ni banner de Logic2B.
6. Las tres páginas legales existen en es/en, están enlazadas en footer y
   sitemap y conservan canonical/hreflang por página.
7. Ambos formularios rechazan en cliente y servidor si falta la aceptación; el
   honeypot no llama a Resend.
8. Con `LEADS_TRANSPORT=resend` y solo `LEADS_RESEND_API_KEY`, un lead controlado
   llega a la bandeja de Logic2B y las notificaciones internas permanecen
   `disabled`.
9. Logs y eventos de `dataLayer` no incluyen nombre, email, teléfono, mensaje ni
   nombre libre del camping.
10. `pnpm check`, el build compuesto y el smoke de producción quedan verdes.

## Alternativas descartadas

- **Enlazar las legales de `logic2b.com`**: no explican con precisión las demos,
  niveles y finalidad comercial de Camp.
- **Compartir consentimiento entre subdominios**: obliga a una cookie de dominio,
  acopla despliegues y amplía el alcance declarado sin necesidad de negocio.
- **Copiar `CookieBanner.svelte` e instalar Svelte**: añade runtime y mantenimiento
  para una interacción pequeña que Astro puede resolver sin dependencia.
- **Configurar la clave real en `RESEND_API_KEY`**: activaría intentos de
  notificación interna contra la configuración ficticia de Cala Sereno.
- **Eliminar el contrato R12 para permitir GTM**: dejaría sin defensa a las webs
  de clientes y al dashboard.
- **Cargar GTM con consentimiento denegado por defecto**: el modo avanzado emite
  señales sin cookies; no es necesario para la pregunta comercial aprobada.

## Lo que este ADR pide validar antes de escribir código

1. GTM y banner solo en la superficie comercial `apps/site`, no dentro de las
   demos de campings ni del gestor.
2. Páginas legales propias de Camp en español e inglés, con Logic2B S.L. como
   titular.
3. Misma cuenta/clave Resend, pero bajo `LEADS_RESEND_API_KEY`, dejando
   `RESEND_API_KEY` ausente para que la mensajería interna siga apagada.
4. Primera barrera antispam con consentimiento, honeypot y rate limit; Turnstile
   queda para una activación posterior cuando se confirme su widget para este
   hostname.

## Resultado de implementación

- Implementado y desplegado el 2026-08-11 en el Worker `logic-camp-demo`,
  versión `35f78f54-10cc-4f99-8c18-2ee39adef2d9`.
- Secrets remotos comprobados por nombre: `AUTH_SECRET` y
  `LEADS_RESEND_API_KEY`; `RESEND_API_KEY` permanece ausente.
- `LEADS_TRANSPORT=resend` está versionado en `tenants/demo/wrangler.jsonc`.
- `pnpm check`: 61/61 tareas verdes. API: 278/278 pruebas; configuración:
  73/73; portfolio: siete campings construidos.
- QA Playwright local y contra producción verde en es/en a 1366×900 y 375×812:
  cero Google antes de consentimiento, rechazo sin carga, aceptación con una
  carga, persistencia, revocación y legales sin desborde ni errores.
- Smoke real autorizado: `POST /api/leads` respondió `202` con
  `outcome=delivered`. Se envió un único correo rotulado como prueba técnica.
