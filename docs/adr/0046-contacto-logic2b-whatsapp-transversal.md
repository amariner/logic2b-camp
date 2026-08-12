# 0046 — Contacto transversal con Logic2B por WhatsApp

- **Estado**: propuesto; requiere validación de Andreu antes de escribir código
- **Fecha**: 2026-08-12
- **Ámbito**: sitio comercial y documentación (`apps/site`), webs tenant
  (`apps/web`) y gestor (`apps/dashboard`)

## Contexto

Andreu ha pedido que todo el escaparate tenga un acceso directo por WhatsApp a
Logic2B, incluido el gestor demo, usando el **626 432 316**. La referencia visual
es la píldora de `logic2b.com`: superficie oscura, icono verde, texto breve y
aparición después de que la visita haya empezado a recorrer la página.

Copiar ese elemento tres veces no basta. Las superficies tienen marcas y
conflictos distintos: la landing ya tiene consentimiento y un diálogo de lead;
la web pública debe seguir pareciendo del camping; el gestor reserva la esquina
inferior derecha para toasts y tiene controles de operación y paneles móviles.
Además, dentro de una demo ficticia el enlace no puede parecer el WhatsApp de
recepción del camping.

## Decisión propuesta

### 1. Un contrato de plataforma, tres adaptadores de presentación

`@logic-camp/config/contact` será la única fuente de verdad para:

- teléfono visible: `+34 626 432 316`;
- URL base: `https://wa.me/34626432316`;
- etiquetas visibles y accesibles en es/ca/en/fr/de/nl;
- mensajes genéricos por contexto `commercial`, `docs`, `tenant` y `dashboard`;
- construcción de la URL final mediante `URLSearchParams`.

El mensaje precargado solo identifica el producto y el contexto general. No
incluye nombre de persona o camping, email, teléfono del visitante, fechas,
reserva, ruta actual, query string ni texto libre. No se lee el DOM para
enriquecerlo. Astro y React solo deciden cómo se pinta; no repiten número, copy
ni reglas comerciales.

### 2. En sitio y webs públicas aparece tras scroll y se retira ante el pie

`apps/site` y `apps/web` usan una píldora flotante en la esquina inferior
derecha. Permanece fuera del orden de foco hasta que la página supera **280 px
de scroll**; a partir de ahí entra y sigue siendo un enlace normal de teclado.
Un `IntersectionObserver` la oculta cuando el pie entra en pantalla, de modo que
no compite con sus enlaces ni parece una segunda llamada final.

La posición respeta `env(safe-area-inset-right)` y
`env(safe-area-inset-bottom)`, con un margen mínimo de 16 px. A 375 px conserva
texto visible; no se degrada a un icono ambiguo. Con movimiento reducido no hay
desplazamiento ni transición.

En `apps/site` se oculta además mientras el banner de consentimiento esté
visible o el diálogo de proyecto esté abierto. No se añade evento analítico en
el primer corte: el enlace funciona sin consentimiento y, al no medirlo, no
existe riesgo de emitir antes de una decisión válida. Las webs tenant siguen sin
GTM ni tracker.

### 3. El gestor adapta el acceso a su operación

El gestor **no** usa una píldora flotante. La esquina inferior derecha pertenece
a Sonner; el plano y el planning tienen controles propios, y los paneles móviles
ocupan el borde inferior. Forzar el patrón visual de marketing ahí haría peor el
producto.

En su lugar:

- el login muestra un enlace secundario bajo la tarjeta de acceso;
- el shell lo incorpora al pie compartido de la sidebar;
- al plegar la sidebar queda el icono con `title` y `aria-label` completos;
- en móvil aparece dentro del mismo drawer, con objetivo mínimo de 44 px.

Así está disponible antes y después de iniciar sesión sin tapar navegación,
toasts, banners demo, diálogos ni gestos del planning. El texto dice «Ayuda
Logic2B por WhatsApp», nunca «Contactar con recepción».

### 4. Las webs de camping lo identifican como Logic2B y permiten desactivarlo

La píldora de `apps/web` muestra «Logic2B · Contacta» y su etiqueta accesible
explicita WhatsApp. No usa el teléfono, nombre ni colores del camping salvo los
tokens estructurales necesarios para convivir con su superficie; la marca de
destino no queda implícita.

`TenantWebConfig` añade `logic2bContact?: boolean`. La ausencia equivale a
`true` para mantener la política transversal sin editar cada tenant; un
contrato real puede declarar `false` y retirar tanto HTML como script del build.
La plantilla documenta ese interruptor. No se admiten números alternativos en
esta propiedad: un WhatsApp de recepción sería una funcionalidad distinta y
requeriría su propio responsable, copy y política.

### 5. Accesibilidad, seguridad y privacidad

Todos los enlaces usan `target="_blank"`, `rel="noopener noreferrer"`, foco
visible AA y una caja táctil mínima de 44 px. El icono es decorativo cuando el
texto está presente. La entrada por scroll no roba foco ni se anuncia mediante
`aria-live`.

Abrir `wa.me` comunica la IP y metadatos habituales a WhatsApp/Meta por decisión
del visitante. El enlace no instala scripts, píxeles, iframes ni cookies de Meta
en las páginas de Logic2B o del camping. Las políticas no afirmarán que
WhatsApp está integrado: es un enlace externo iniciado por la persona.

## Tensión de las ocho lentes

- **Arquitectura/Fullstack:** un contrato importable por Astro y React evita
  números y copy divergentes; el interruptor de tenant no crea forks.
- **Backend:** no hay endpoint, almacenamiento, webhook ni proveedor que activar;
  la URL no transporta PII ni identificadores.
- **Frontend/UX:** el patrón flotante se usa donde ayuda a captar; en el gestor
  se adapta al shell para no competir con la operación.
- **Producto:** una persona sabe que habla con Logic2B incluso desde una marca
  ficticia. El camping no recibe por error una expectativa de soporte.
- **UI:** sitio, tenant y gestor conservan sus tres sistemas de marca. La
  referencia visual no obliga a vestir el dashboard como marketing.
- **SEO:** enlace externo sin runtime remoto, bloqueo de render ni efecto en
  canonical, hreflang o indexación.

## Pruebas de aceptación

1. El paquete común prueba número, URL, seis locales, cuatro contextos y ausencia
   de PII en los mensajes precargados.
2. Landing, precios, temas, documentación y legales contienen el enlace; antes
   de 280 px no es interactuable, con el pie visible se retira.
3. Consentimiento y diálogo de lead tienen prioridad visual sobre la píldora.
4. Una web Inicio, una Gestión y una Visión muestran «Logic2B» y el mensaje
   `tenant`; con `logic2bContact: false` no se genera enlace ni script.
5. Login, shell expandido, shell plegado y drawer móvil exponen el mensaje
   `dashboard` sin solapar toasts, planning, plano o paneles.
6. Teclado, foco, 44 px, zoom, safe area y movimiento reducido pasan a 375 y
   1366 px; no hay desborde, errores de consola ni recursos rotos.
7. Los artefactos de tenant y dashboard siguen sin trackers o recursos remotos
   ejecutables.
8. `pnpm check` y el bundle compuesto quedan verdes. No se despliega sin una
   autorización separada.

## Alternativas descartadas

- **Píldora flotante también en el gestor:** colisiona con toasts y controles
  fijos; adaptar la ubicación por pantalla multiplicaría estados frágiles.
- **Número/copy dentro de cada app o JSON de tenant:** permite divergencia y
  multiplica el alta por camping.
- **Mensaje con camping, ruta o reserva actual:** añade contexto a costa de
  filtrar datos o identificadores en una URL de tercero.
- **Aparición inmediata en páginas públicas:** compite con el CTA principal y el
  banner de consentimiento antes de que exista intención.
- **Cargar un widget oficial de WhatsApp:** introduce runtime y seguimiento de
  Meta donde un enlace accesible ya resuelve el contacto.

## Validación que se solicita

Andreu puede desbloquear la implementación con `OK ADR 0046`. Esa validación
confirma conjuntamente:

1. aparición pública tras 280 px y retirada ante pie/modal/consentimiento;
2. mensajes genéricos por superficie, sin datos del visitante ni de reserva;
3. acceso del gestor en login/sidebar/drawer en vez de flotante;
4. activo por defecto en tenant y desactivable con `logic2bContact: false`.
