# PROGRESS — Logic Camp

## Producción incorpora el cierre de mejora de temas · 2026-08-18 (sesión 150)

- `main` no tenía ramas sin fusionar ni cambios locales pendientes y coincidía
  con `origin/main` en `e59d9a2`; no se creó un merge vacío. Ese commit ya estaba
  publicado en GitHub antes de iniciar producción.
- `pnpm --filter @logic-camp/api deploy:demo` recompuso landing, documentación,
  doce demos y gestores, verificó 17.030 enlaces internos en 540 HTML y mantuvo
  los presupuestos M6. D1 no tenía migraciones pendientes y no se ejecutó reseed.
- Cloudflare subió 310 activos nuevos o modificados y publicó el Worker
  `logic-camp-demo` con versión `bf56617c-c499-4a92-87d1-388c0165f382` sobre
  `camp.logic2b.com/*`; los dos cron existentes permanecen activos.
- El smoke remoto devuelve 200 en landing, temas, Cala Sereno, gestor, API y las
  cuatro superficies revisadas del portfolio. El HTML de L'Olivar referencia el
  nuevo héroe móvil y Sol d'Hivern sirve el bloque «Quedarse también es ordenar
  lo cotidiano» y la fotografía del salón. No se cambiaron secrets, DNS ni datos.

## La mejora de temas cierra fotografía y deja el vídeo preparado · 2026-08-18 (sesión 149)

- H3 queda cerrado en 5/5 con Sol d'Hivern: llegada de larga estancia,
  paquetería en recepción, salón común y salida cotidiana en bicicleta se
  integran en «La vida aquí», instalaciones y tres planes prudentes. La ola
  completa suma veinte escenas propias, cinco bloques de vida y quince rutas
  sin repetir grupo, conflicto operativo, servicio central ni relación con el
  paisaje.
- Las tres anclas H1 sirven ahora un póster vertical 9:16 propio bajo 640 px.
  `<picture>` y dos preloads mutuamente excluyentes conservan el LCP sin obligar
  al móvil a descargar también el apaisado; el portfolio fija el contrato en el
  HTML construido de L'Olivar, Pinada del Mar y Mar de Fondo.
- H1-V queda preparado pero no fingido: `HeroMedia` carga vídeo solo como mejora
  progresiva, declara el MIME real y reacciona a movimiento reducido o ahorro
  de datos. El contrato acredita procedencia, huella, duración, pistas, códec,
  orientación, peso y `faststart`; `pnpm motion` normaliza fuera del runtime y
  solo publica tras inspección explícita. Con cero clips activos, los trece
  tenants conservan el fallback estático íntegro.
- Seedance 2.0 se reintentó únicamente para L'Olivar con el brief aprobado,
  mismo póster al inicio y al final, 6 s, 720p, 16:9 y audio desactivado. El
  proveedor respondió `not_enough_credits` antes de crear el trabajo: no hay
  bytes parciales, activo que revisar ni consumo atribuible a esta sesión.
- Verificación: 28/28 pruebas dirigidas, contrato de fábrica, gate de vídeo y
  builds aislados de los doce campings verdes; `pnpm check` termina 71/71. Se
  inspeccionaron también los tres pósteres verticales. No hubo deploy, cambios
  remotos ni publicación.

## El carril no temático queda revalidado en su límite local · 2026-08-17 (sesión 148)

- La revisión posterior a la conversión de solicitudes no encuentra otro bloque
  funcional local autorizado: R0–R11 y R15 están cerrados, la porción local de
  R12–R13 está agotada y R14 conserva el veto de Camp Motor. Los siguientes
  pasos requieren cliente, proveedor/credenciales, autorización de publicación
  o una nueva señal de producto; no se fabrica alcance para mantener actividad.
- `pnpm check` vuelve a pasar 71/71 tareas. El QA canónico reconstruye el
  candidato, valida 17.012 enlaces internos en 540 HTML y recorre 28 superficies
  / 56 vistas a 375 y 1366 px, además de cinco formatos/MIME. La entrada mayor,
  Mar de Fondo, queda en 188,75 kB gzip, dentro del presupuesto M6.
- El árbol termina limpio y sincronizado con `origin/main`. Esta revalidación no
  crea ni modifica temas, media o fotografía y no despliega ni toca datos,
  proveedores o infraestructura remota.

## Solicitud y reserva vuelven a ser la misma conversión · 2026-08-17 (sesión 147)

- «Marcar convertida» ya no cambia una etiqueta sin crear inventario: abre el
  alta manual con tipo, fechas, ocupación, idioma y titular precargados, conserva
  la cotización en servidor y solo termina al crear la reserva real.
- API y D1 enlazan reserva y solicitud en el mismo batch idempotente. El segundo
  intento con otra clave no puede duplicar la reserva; el `PATCH` de estado solo
  responde `409 conversion_requires_booking` y cada conversión deja su asiento
  de auditoría con el ID de reserva.
- El panel compartido queda corregido también en móvil: ocupa el viewport sin
  desbordar, mantiene campos a 16 px y objetivos táctiles de 44 px; al cerrar
  con Escape devuelve el foco a la acción de origen. QA real con Worker+D1 a
  375/1366 px, cotización de 213 €, consola y overflow limpios.
- Regresión: dashboard 69/69, API 284/284 y `pnpm check` 71/71. El trabajo no
  crea ni modifica temas, media o fotografía; tampoco despliega ni toca datos
  remotos.

## Control total cierra su contrato no temático · 2026-08-14 (sesión 146)

- El nuevo frente F queda integrado sin convertir la visión en producto real:
  ocho módulos exclusivos de Mar de Fondo, tres flujos reversibles, Centro
  compartido, página Inteligente y guía Dirección. Esta sesión no desarrolla
  temas, fotografía ni media del frente H.
- `ControlTotal.tsx` deja de inferir madurez comparando el texto «Demo
  funcional»: los estados son tipados, el segmento de ruta se valida en el
  módulo puro y toda la interfaz nueva pasa por el diccionario i18n. La
  subnavegación declara además `aria-current="page"`.
- La QA real encontró un defecto que las capturas anteriores no veían: a 320 px
  el enlace de ayuda se comprimía a 25 px. El grupo de acciones ahora envuelve y
  ayuda/reset no encogen; a 320/375/430 no hay desborde y todos los controles
  visibles miden al menos 44×44. A 1366 conserva la densidad de escritorio.
- Limpieza, incidencia y relevo se completaron desde el bundle real. El Centro
  terminó con 6 preparaciones, 2 unidades bloqueadas, 2 riesgos y turno
  reconocido; consola limpia y estado restablecido. El QA canónico incorpora
  desde ahora `marde-control-total` como superficie reproducible.
- Verificación: dashboard 67/67, tipos, lint y builds normal/Mar de Fondo verdes;
  entrada Mar de Fondo 188,69 kB gzip (<200 kB), bundle compuesto con 17.012
  enlaces en 540 HTML y `pnpm check` 71/71. No hubo deploy, proveedor, datos
  remotos ni cambios de tema.

## R15 cierra el trabajo local no temático · 2026-08-13 (sesión 145)

- La ruta continua deja de arrastrar estados históricos: R9 refleja el portfolio
  ya completado en 12/12, el veto de Camp Motor queda revalidado y R15 cierra
  únicamente su porción local. Proveedores, cliente, infraestructura y una
  publicación posterior conservan dueño, entradas y autorización explícitos.
- `pnpm --filter @logic-camp/web qa:canonical` reconstruye el candidato completo
  y verifica 16.186 enlaces internos en 522 HTML, 27 superficies, 54 vistas a
  375/1366 px y cinco formatos/MIME. Los presupuestos M6 permanecen verdes; la
  entrada más amplia, Mar de Fondo, mide 185,10 kB gzip.
- La inspección real de landing, guía «Leer el planning» y gestor Mar de Fondo
  confirma cero overflow y consola limpia. En móvil, navegación, selector de
  periodo y acciones de agenda conservan objetivos de 44 px o más.
- `pnpm check` pasa 71/71 sobre el mismo `main`. El candidato queda construido y
  no desplegado; no se tocaron temas, fotografía, proveedores, datos remotos ni
  `tmp/`.

## El cambio de estancia avisa si deja dinero por devolver · 2026-08-13 (sesión 144)

- El dry-run de `requote` devuelve también `paidCents`, leído por el servidor de
  la reserva vigente. Si el nuevo total queda por debajo, el diálogo explica el
  importe cobrado y el exceso antes de confirmar; mover sigue sin tocar cobros,
  registrar devoluciones ni fabricar movimientos contables.
- El cálculo del exceso vive en una función pura con casos de exceso, saldo y
  pendiente. API, tipos del gestor y los ocho escenarios tier 3 comparten el
  nuevo contrato; una previsualización no modifica `paidCents`.
- El QA de Mar de Fondo reprodujo 459 € cobrados frente a 438 € de total nuevo.
  El aviso, foco inicial, ausencia de desborde y consola limpia quedaron
  verificados a 1280 y 375 px. La revisión elevó las dos acciones móviles de 32
  a 44 px y restableció el estado de la demo al terminar.
- El mismo recorrido descubrió y corrigió que las demos persistían las fechas
  movidas pero no su total re-cotizado: una segunda revisión ya parte del último
  total confirmado. La regresión dirigida pasa 15/15, API 59/59 y `pnpm check`
  71/71; no hubo deploy, proveedor, datos remotos, temas ni fotografía.

## La reserva pendiente puede retomar el mismo pago · 2026-08-13 (sesión 143)

- `POST /api/bookings/:code/payment` verifica código, email y estado `pending`
  antes de devolver las instrucciones de pago ya persistidas. No crea otro
  intento ni llama al proveedor: una identidad incorrecta responde 404, una
  reserva ya confirmada responde 409 y la renovación por caducidad sigue
  reservada al gate externo R12.
- `/reserva` ofrece «Reintentar el pago» tanto al volver de una cancelación como
  durante una espera prolongada. Redirect y formulario comparten una sola
  continuación; el copy queda localizado en seis idiomas, cuatro fixtures tier
  3 y la plantilla, sin alterar temas ni media.
- El QA local levantó D1 y Worker desechables con Redsys de prueba, pero no envió
  el formulario ni contactó con el TPV. La reserva sintética se recuperó a 375 y
  1366 px sin desborde ni consola; la revisión corrigió el control de 41 a 44 px.
  `API_PROXY` permite aislar ese Worker conservando `8787` como valor por defecto.
- La regresión dirigida pasa 21/21 y `pnpm check` cierra 71/71 tareas, incluidas
  281 pruebas de API, 235 páginas Astro y el portfolio 12/12. No hubo deploy,
  infraestructura remota, proveedor real ni creación de temas.

## GitHub y producción incorporan B5 y el portfolio 12/12 · 2026-08-12 (sesión 142)

- `main` integra el contacto transversal B5 y Sol d'Hivern mediante los commits
  `d4c54a7` y `8712a7e`; ambos están publicados en GitHub.
- `pnpm --filter @logic-camp/api deploy:demo` despliega el artefacto compuesto en
  `camp.logic2b.com` con la versión Cloudflare
  `c2f8188b-37d9-48d3-bedb-b12d6f0719ed`. D1 no tenía migraciones pendientes y
  no se ejecutó reseed, borrado de datos ni cambio DNS.
- El smoke remoto devuelve 200 en portada, precios, temas, guía, demo general,
  Sol d'Hivern, su reserva, su gestor, `/admin/` y `/api/health`. WhatsApp queda
  verificado en esas superficies públicas, en el login del gestor y en la barra
  lateral de Sol d'Hivern.
- El QA comercial remoto pasa portada, precios y guía en ES/EN a 375/1366 px,
  sin errores, desbordes ni carga de Google antes del consentimiento.

## Sol d'Hivern completa el portfolio D6-V en 12/12 · 2026-08-12 (sesión 141)

- `tenants/soldhivern/` entrega la última demo Visión: un camping mediterráneo
  ficticio abierto todo el año, con 200 unidades y una operación centrada en
  estancias de 45 noches o más, consumos cotidianos y prórrogas.
- Web, reserva local y gestor reversible comparten prefijo `SH-26-`, señal
  simulada del 15 %, cuatro categorías, plano propio y 199 ocupaciones largas
  de 60/75/90 noches. No existe cobro, proveedor ni envío real.
- Diez fotografías exclusivas y sus derivados quedan aprobados en el pipeline.
  La landing sustituye el concepto genérico «Parcela» por Sol d'Hivern y pasa de
  once a doce demos navegables, todas sostenidas por un tenant real.
- El bundle y el QA canónico incorporan la portada y el planning de Sol
  d'Hivern: 16.186 enlaces internos en 522 HTML y tres superficies nuevas
  verificadas a 375/1366 px. La fábrica construye 12/12 campings y el dashboard
  pasa 56/56 pruebas. `pnpm check` cierra 71/71 tareas y el QA canónico, 27
  superficies y 54 vistas. D6-V queda cerrado; no hubo deploy, DNS ni
  infraestructura remota.

## B5 lleva el contacto Logic2B a todo el escaparate · 2026-08-12 (sesión 140)

- Andreu aceptó ADR 0046. `@logic-camp/config/contact` fija teléfono, URL,
  umbral, seis idiomas y cuatro contextos sin PII; sitio, tenants y gestor ya no
  repiten número, copy ni decisiones comerciales.
- Sitio y webs tenant muestran una píldora accesible tras 280 px y la retiran
  ante el pie; el sitio prioriza además consentimiento y diálogo comercial. La
  política tenant queda activa por defecto y `logic2bContact: false` la desactiva
  sin admitir un número alternativo de recepción.
- El gestor adapta el contacto a login, pie de sidebar, estado plegado y drawer
  móvil. Mantiene 44 px, foco y nombre accesible sin ocupar el plano de Sonner ni
  tapar planning, navegación o paneles.
- Las guardias inspeccionan artefactos comerciales, once tenants, escenarios de
  dashboard y frontera R12. QA comercial es/en, QA canónico de 24 superficies y
  E2E contra Worker pasan a 375/1366 px; el bundle conserva 497 HTML y 15.557
  enlaces internos. `pnpm check` cierra 69/69 tareas. No hubo tracker, proveedor,
  infraestructura remota, deploy ni creación de temas.

## La ficha de Solicitudes conserva la estancia elegida · 2026-08-12 (sesión 138)

- La revisión del diff local encontró una divergencia con ADR 0044: el primer
  corte añadía el formulario contextual también a Inicio y al lado nivel 1 del
  conmutador comercial. Se corrigió la frontera: solo tier técnico 2 cierra la
  solicitud dentro de la ficha; tier 1 sigue llevando a Contacto y tier 3
  conserva mostrador y funnel.
- `EnquiryForm.astro` acepta `fixedStayId`, valida el catálogo y presenta el
  nombre elegido como dato fijo. El mismo identificador llega a la confirmación
  demo, la solicitud reversible de `demo-session` y `POST /api/enquiries`; no se
  crea una reserva provisional.
- Pinada del Mar, Serralta, Els Tarongers y Entre Vinyes explican que se trata de
  una solicitud y que recepción debe responder, sin afirmar disponibilidad ni
  confirmación. La guardia del portfolio comprueba ancla, sección, campo oculto
  y frontera exacta tier 1/2.
- Verificación: web Astro 0 errores/warnings/hints; 13/13 pruebas locales;
  fábrica de 12 tenants válida; portfolio 11/11; captura de la ficha Bungalow
  Familiar de Pinada a 375/1366 px sin consola, recursos rotos ni desborde. No
  hubo deploy, infraestructura, proveedores ni creación de temas.

## Camping La Ballena lleva D6-V a 11/12 · 2026-08-11 (sesión 137)

- `tenants/ballena/` entrega una demo Visión de camping familiar costero con
  identidad, contenido, inventario y fotografía propios: 250 unidades en
  cuatro categorías, parque de agua compacto y una operación de verano que no
  reutiliza la voz de Mar de Fondo ni La Carrasca.
- La tarifa de `sea_semanal` exige siete noches con llegada y salida en sábado
  para las cuatro categorías. La reserva local muestra la semana completa,
  señal simulada del 25 % y cancelación por tramos 21/8/0 sin cobro, proveedor
  ni asesoramiento legal.
- El gestor reversible en `/demos/ballena/gestion/` conserva el prefijo
  `BL-26-`, plano de acceso/agua/club y 249 reservas ficticias repartidas en
  tres olas de sábados; con ello planning, llegadas y ocupación demuestran el
  cambio de turno intenso sin datos personales ni sistema propio.
- Diez fotografías exclusivas, inspeccionadas por lotes de dos y sin texto o
  marcas, quedan aprobadas junto con miniatura, OG y favicon. El catálogo ES/EN
  publica la nueva demo y el bundle incorpora web y gestor.
- Verificación: factory 12 tenants, dashboard 54/54, typecheck del tenant,
  build aislado de Ballena, bundle compuesto con 15.541 enlaces internos en
  497 HTML y QA canónico de portada y planning a 375/1366 px verdes. No hubo
  deploy, DNS, secretos, proveedores ni pagos reales. Solo queda `soldhivern`.

## Camping La Carrasca lleva D6-V a 10/12 · 2026-08-11 (sesión 136)

- `tenants/carrasca/` entrega una demo Visión de interior con identidad y
  contenido propios, 150 unidades en cuatro categorías, fotografía aprobada
  10/10 y derivados locales. No crea un fork: web, reserva y gestor siguen
  usando la fábrica y los puntos de extensión compartidos.
- La configuración demo tipa una política reproducible y exclusiva de
  `demo-session`: tasa ficticia de 1,20 € por adulto/noche limitada a siete
  noches, señal del 30 % y cancelación 14/7/0. El recorrido conserva importes
  en céntimos y hace visibles desglose, señal y condiciones sin activar pagos,
  proveedores ni asesoramiento legal.
- La reserva creada en `/demos/carrasca/` llega al escenario reversible del
  gestor en `/demos/carrasca/gestion/`; catálogo, planning, plano, aviso de
  simulación y prefijo `CR-26-` prueban la misma vertical. El bundle compuesto
  acredita 14.912 enlaces internos en 472 HTML y el gestor queda en 178,90 kB
  gzip con Planning y Plano bajo demanda.
- El QA canónico pasa 22 superficies y 44 vistas a 375/1366 px, incluida home y
  planning de Carrasca, sin desborde, consola, recursos rotos ni pérdida de
  `noindex`. Al ampliar la galería se corrigió una espera frágil sobre imágenes
  lazy ya decodificadas y el testigo de portada de Serralta se alineó con su
  héroe real de nivel 2.
- El sitemap comercial publica `lastmod` estable derivado del frontmatter de
  las guías y deja los alternates en el `<head>` canónico, evitando el namespace
  XHTML que impedía a algunos visores mostrar el árbol XML. Build comercial:
  79 páginas; fábrica: 11 tenants válidos y 10 campings construibles.
- Verificación aislada: config 74/74, dashboard 51/51, web 13/13 más fábrica y
  portfolio, typecheck/lint del tenant y builds de web, gestor y sitio verdes.
  `pnpm check` cierra 67/67 tareas. No hubo red de proveedores, infraestructura
  remota ni deploy. El siguiente tema vertical es `ballena`; después queda
  `soldhivern`.

## Auditoría R15 no visual y colecciones Astro · 2026-08-11 (sesión 133)

- `docs/AUDITORIA-R15-NO-VISUAL.md` contrasta R0–R14 y las ocho lentes con
  evidencia ejecutable. No queda trabajo funcional local no visual oculto: los
  restos son portfolio/temas, material/decisión de cliente,
  credencial/proveedor, producción o el gate comercial de Camp Motor.
- Los hallazgos ejecutables eran la autogeneración obsoleta de colecciones en
  Astro 5 y cinco diagnósticos del chequeo web. `apps/site/src/content.config.ts`
  declara `docs`, `apps/web/src/content.config.ts` declara `legal`, tres scripts
  quedan explícitamente inline y dos handlers migran de `FormEvent` deprecado a
  `SubmitEvent`; no cambian prosa, rutas, estilos ni activos.
- Bundle compuesto verde: 13.539 enlaces internos en 417 HTML. Presupuesto M6:
  173,13 kB gzip normal; 178,09 Pinadamar; 177,97 Serralta; 183,39 Mar de Fondo.
  Builds aislados: sitio 79 páginas y web 235, sin el aviso de colecciones; el
  typecheck web queda en cero errores, warnings y hints.
- El primer `pnpm check` dejó 54/63 tareas verdes y Turbo canceló el resto porque
  el `content/es.json` del tenant concurrente `vinyes` estaba temporalmente mal
  formado. Se preservaron `tenants/vinyes/`, `pnpm-lock.yaml` y `tmp/`; no se
  atribuye ese rojo al diff ni se corrige desde este frente.
- No se ejecutó QA visual, red, proveedores, infraestructura remota ni deploy.
  Los avisos de fuentes de CSS tenant quedan en el frente visual excluido.

## Preflight completo de candidato R13 · 2026-08-11 (sesión 132)

- `candidateReadinessReport` clasifica el scaffold real en cinco categorías
  tipadas: identidad/legal, contenido, inventario/tarifas, media/tema e
  infraestructura. Cada bloqueo declara código, ruta y si impide build,
  publicación o ambos.
- `pnpm activation:rehearse` devuelve ahora `buildReady=false` y
  `publishReady=false`: 31 bloqueos de identidad/legal, 1.938 de contenido, 7
  de inventario/tarifas y 13 de media/tema impiden construir; 4 verificaciones
  externas de infraestructura impiden publicar. El informe conserva los rojos
  legítimos sin inventar material para volverlos verdes.
- D1, el valor de auth y DNS quedan como gates exclusivos de publicación. Una
  incoherencia entre config, seed y Wrangler bloquea tanto build como publish;
  las pruebas fijan ambos casos y un candidato estructuralmente listo.
- El preflight reutiliza `ScaffoldResult` y `ActivationAuditReport`, termina
  antes de Astro, Wrangler o proveedores, no muestra valores sensibles y vuelve
  a acreditar huella y limpieza del temporal.
- Verificación: CLI 54/54 y `pnpm check` 63/63. Se preservaron los cambios
  concurrentes en `tenants/vinyes/`, `pnpm-lock.yaml` y `tmp/`; no hubo cambios
  en temas/activos, red, deploy ni infraestructura remota.

## Coste automático y write-set del alta R13 · 2026-08-11 (sesión 131)

- `onboarding:rehearse` reutiliza ahora el ensayo de activación tras
  scaffold→migraciones→seed→backup→restauración; no existe un tercer carril ni
  una segunda matriz. El resultado tipado conserva evidencia y duración por
  bloque, además del total con limpieza.
- Medida local reproducida dos veces: **7,61 s** y **7,13 s** totales. La última
  ejecución desglosa scaffold 6,54 ms, migraciones 2.913,93 ms, seed 1.126,79 ms,
  backup 928,73 ms, restauración 1.938,84 ms y activación 209,75 ms. Ocho
  migraciones, seed, owner y huellas lógicas permanecen idénticos.
- El informe no convierte esos segundos en la promesa «una tarde»:
  contenido/identidad, inventario/tarifas y aceptación figuran como trabajo
  humano **no medido**; recursos Cloudflare, DNS, proveedores y deploy figuran
  como gates externos. `verdict: not_proven` impide cerrar el coste total sin un
  onboarding real.
- Los procesos hijos usan `HOME`, config y caché dentro del temporal y heredan
  solo PATH/variables temporales, nunca perfiles ni secrets del shell. Toda orden
  D1 conserva `--local`, el plan remoto sigue fuera del recorrido y el candidato
  de activación verifica la huella de `apps/`/`packages/` antes/después.
- CLI **51/51**, tipos/lint y el comando reproducible verdes. `pnpm check`
  cerró **63/63** tareas, incluido el workspace paralelo ya visible. No quedó
  `tenants/{slug}`, D1, dump ni temporal. `tenants/vinyes/` apareció como trabajo
  paralelo ajeno durante la sesión y se preservó sin leerlo ni modificarlo.

## Candidato local fail-closed R13 · 2026-08-11 (sesión 130)

- La matriz común de activación inventaría `WORKER`, `TENANT_SLUG`, `DB` y
  dominio; nombres de secrets; y adaptadores de auth, notificaciones, pagos y
  Hospedajes. Binding/base incoherentes, valores secretos persistidos, proveedor
  sin secret, flags demo y tier 4 producen bloqueos explícitos sin devolver el
  valor sensible.
- `pnpm activation:rehearse` crea un scaffold sintético solo bajo un temporal,
  inspecciona sus `config.ts`, `seed.ts` y `wrangler.jsonc` con un proceso local
  que no hereda credenciales, y proyecta los tiers técnicos 1/2/3 desde esos
  artefactos. El proceso y el plan no tienen acceso a Wrangler, `--remote`, DNS,
  secrets ni proveedores.
- Los tres perfiles conservan pagos `none`, correo totalmente desactivado y
  Hospedajes manual/apagado. Solo se inventaría el nombre `AUTH_SECRET`; el UUID
  estructural de D1 vive únicamente en `/tmp` y tanto binding, valor de auth como
  DNS continúan en `externalVerification`, nunca acreditados como destino real.
  Automatiza no gana un perfil ficticio: R12 mantiene su ejecución externa en
  `none/manual`.
- El preflight rechaza cualquier plan ejecutable antes de crear el candidato,
  el runner de inspección es inyectable y el `finally` elimina el temporal en
  éxito o error. Una huella antes/después demuestra que el ensayo no modifica
  `apps/` ni `packages/`; tampoco deja `tenants/{slug}`.
- CLI queda en **51/51**, configuración en **73/73**, tipos/lint y el comando
  reproducible verdes. Huella del candidato: `998debf6…`; 18 ficheros y 14
  marcadores pendientes inventariados. `pnpm check` cerró **61/61** tareas con
  los siete campings construidos. No hubo deploy, red, credenciales ni escritura
  externa.

## Analítica consentida y captación comercial real · 2026-08-11 (sesión 129)

- ADR 0045 aceptado: `apps/site` reutiliza el GTM de Logic2B
  (`GTM-TVDWZ9LC`) con consentimiento básico versionado. La carga remota no
  existe antes de aceptar; rechazo y revocación impiden nuevas emisiones. Los
  eventos comerciales no admiten PII.
- Banner Astro sin runtime nuevo, adaptado a la identidad botánica, con
  aceptar/rechazar/configurar al mismo nivel y control permanente en
  `/cookies`. Las webs tenant, `/demo/`, `/demos/*` y `/admin/` siguen sin
  tracker por contrato de build.
- Aviso legal, privacidad y cookies propios de Camp publicados en es/en, con
  Logic2b S.L. como titular, canonical, hreflang, sitemap y enlaces en todos los
  footers. Los formularios inline y modal exigen privacidad y añaden honeypot.
- El lead comercial usa `LEADS_RESEND_API_KEY`; `RESEND_API_KEY` permanece
  ausente para no activar mensajes internos de reservas o solicitudes. El
  Worker versiona `LEADS_TRANSPORT=resend` y conserva timeout, reintento
  idempotente, cuota y errores sin PII.
- `pnpm check` cerró 61/61 tareas; API 278/278, config 73/73 y siete campings
  construidos. QA Playwright local y producción verde en es/en a 1366 y 375 px.
- Despliegue activo: Worker `35f78f54-10cc-4f99-8c18-2ee39adef2d9`. Smoke
  autorizado de `POST /api/leads`: 202 `outcome=delivered`; un único correo de
  prueba técnica enviado a la bandeja Logic2B.

## Alta local recuperable R13 · 2026-08-10 (sesión 128)

- La auditoría de migraciones, seed de `_template`, auth y ensayo de copias
  confirmó tres huecos: el backup local partía del estado compartido de un
  tenant, la huella del seed mínimo no cubría inventario ni owner y no existía
  una prueba que alterase datos antes de restaurarlos.
- `pnpm onboarding:rehearse <año>` crea un scaffold sintético, copia las ocho
  migraciones y ejecuta origen+restauración dentro de un único temporal. Todas
  las órdenes D1 declaran `--local`, Wrangler corre desde ese directorio sin
  variables de credenciales Cloudflare y un `finally` elimina SQL, scaffold y
  persistencia en éxito o error.
- El gate aplica las migraciones dos veces, genera el seed dos veces con el mismo
  año y compara SHA-256. Verifica exactamente un tenant, temporada, tipo,
  tarifa, owner/credential y tres unidades; además comprueba relación owner→ID
  opaco del tenant, correo, pagos y solapes.
- Tras exportar esquema+datos elimina deliberadamente la credential sintética,
  exige que cambie la huella y restaura el volcado en una segunda D1. El ensayo
  2026 cerró 8/8 migraciones (`9ed0b4a0…`), seed `54f45866…`, esquema
  `435e846a…` y datos `03471cef…`, recuperando la huella lógica exacta sin dejar
  tenant ni D1.
- CLI pasa **48/48**, tipos/lint y `_template` están verdes. `pnpm check` alcanza
  **39/59** y se corta únicamente porque el tenant concurrente `serralta` aún no
  tiene el final aprobado `instalacion-recepcion.webp`; Turbo canceló el resto y
  se confirmó que no dejó temporal del ensayo.
- No hubo `--remote`, `--apply`, red, secrets, proveedor ni escritura en demos.
  El siguiente corte selecciona bindings, nombres de secrets y adaptadores
  `none` sobre otro candidato sintético local.

## Dry-run literal y preflight fail-closed R13 · 2026-08-10 (sesión 127)

- La auditoría de `_template`, `TenantWebConfig` y `packages/cli` encontró tres
  huecos reales: el supuesto dry-run escribía en `tenants/`; nombre/dirección se
  sustituían sin escape contextual y podían romper TS/JSON; y el informe omitía
  marcadores legales, dirección y D1. El runner también empezaba un plan antes
  de cruzar sus pasos manuales.
- Pruebas rojas fijaron identidad segura, escape, JSON/TS sintáctico, symlinks,
  atomicidad, inventario completo de `__...__`, huella determinista y cero
  residuos. `--dry-run` monta ahora el scaffold en un temporal del sistema,
  calcula SHA-256 y lo elimina; el comando real escribe primero en staging y
  publica con un `rename` atómico.
- Slug, nombre, dominio, zona y dirección se validan/normalizan antes de generar.
  Dominio y zona deben ser hostnames coherentes. `runInfraPlan` recibe un runner
  inyectable para test y rechaza cualquier paso manual en preflight, antes del
  primer proceso; el plan vigente conserva `database_id` y DNS como gates.
- La reproducción inicial demostró el fallo antiguo creando accidentalmente la
  D1 vacía `logic-camp-la-pineda`
  (`ae2d753c-9249-489d-bd81-69bbf044e5f5`). Se verificó con cero tablas, se
  eliminó de inmediato y una segunda lista confirmó su ausencia y la permanencia
  de las cuatro D1 preexistentes. Ninguna prueba posterior lanza procesos reales.
- CLI pasa **45/45**, configuración **66/66**, `_template`, tipos y lint están
  verdes. El ensayo `r13-audit` genera 18 ficheros, huella
  `9562db329d432f4dbebb457d0ad779f68a2d54cb80fb2b8c1e416d75ca8efe37`,
  enumera legal/contenido/D1 y deja el destino inexistente. `pnpm check` alcanza
  **39/59** y se corta solo porque el tenant concurrente `serralta` aún no tiene
  `tipo-parcela-bosque.webp`; no se modificó ese trabajo.
- El primer corte local R13 queda cerrado sin tenant persistido, deploy, secrets
  ni infraestructura vigente. El siguiente ensaya migraciones, seed, usuario y
  rollback exclusivamente sobre un entorno local desechable.

## Gates locales finales de R12 · 2026-08-10 (sesión 126)

- La auditoría final confirma cuatro fronteras honestas: la web pública no carga
  Analytics ni píxeles; los errores permanecen en JSON local con correlación y
  redacción de PII; no existe conector OTA; y Automatiza/Inteligente no ejecutan
  acciones ni modelos. Ningún SDK, cuenta o proveedor se presenta como activo.
- Pruebas rojas fijaron un contrato ejecutable de build. El guard inspecciona
  fuente, dependencias y artefacto publicado, rechaza trackers, SDKs externos,
  recursos remotos ejecutables y términos de ejecución simulada, y conserva la
  política de cookies sin analítica.
- `RUNBOOK-GATES-R12.md` consolida para Analytics, observabilidad externa, OTA e
  IA el disparador, owner, entradas, aceptación, degradación y apagado. Cuentas,
  sandbox, coste, rotación y validación real siguen siendo gates abiertos; esta
  documentación no los acredita.
- La frontera nueva pasa **4/4**; errores **17/17**; Automatiza, Inteligente y Mar
  de Fondo **23/23**; web **13/13**, fábrica **7 tenants + plantilla + 2
  conceptos**, portfolio **6/6** y build **235 páginas**. El artefacto verifica
  **198 fuentes, 25 manifiestos y 244 archivos** sin tracker, SDK externo, OTA ni
  ejecución de IA.
- `pnpm check` alcanza **50/59** y se detiene únicamente porque el tenant
  concurrente `serralta` aún no contiene el final aprobado `hero-calle.webp`;
  R12 ya había pasado sus pruebas dentro del mismo gate. No hubo deploy, secrets,
  proveedor ni escritura externa y se preservó todo el portfolio paralelo.
  Agotada la porción local honesta de R12, el siguiente corte local abre R13 con
  plantilla, esquema, CLI y dry-run sin `--apply`.

## Camping El Delta cierra D5-V en 6/6 · 2026-08-10 (sesión 126)

- La sexta demo programada, **Camping El Delta (`delta`)**, queda terminada y
  abre el paso a D6-V; `serralta` es ahora la siguiente. Es un tenant tier 1,
  demo-only y en español, con 16 parcelas —10 Cañizo y 6 Arrozal—, tres momentos
  de una temporada corta, precios y extras deterministas.
- El recorrido convierte el tamaño mínimo en argumento comercial: abril–octubre,
  silencio nocturno, suelo drenante, caminos llanos, bicicletas y observación
  responsable. Reutiliza el core y el transporte demo sin Worker, D1 ni
  dashboard propios.
- Fotografía **8/8** aprobada y trazada en cuatro tandas. El generador integrado
  falló dos veces antes de entregar bytes y abrió el fallback documentado. La
  revisión descartó matrículas, marcas, cableado, objetos deformados, cubiertas
  imposibles y geografía incoherente; Higgsfield escaló una parcela a GPT Image
  2 tras dos rechazos. Los finales miden como máximo 2.000 px y tienen miniatura,
  OG, favicon y apple-touch icon derivados.
- `/temas` incorpora la sexta tarjeta navegable y el bundle declara
  `/demos/delta/` con `noindex`. La build aislada produce 13 páginas sin motor;
  la fábrica valida **7 tenants + plantilla + 2 conceptos** y el portfolio
  construye **6/6** campings.
- El QA canónico dirigido pasa a **375/1366**, cinco formatos/MIME, sin desborde
  ni fallos visibles. El bundle serial completo quedó temporalmente detenido por
  la frontera R12 concurrente de observabilidad, no por Delta; no se modificó
  ese trabajo ajeno. No hubo deploy ni escritura remota.

## Frontera fiscal honesta de informes R12 · 2026-08-10 (sesión 125)

- La auditoría detectó una contradicción con ADR 0034 y el dossier: el dashboard
  llamaba «facturado» e «ingresos» al valor total de reservas, aunque no existe
  motor fiscal, serie, factura, firma, envío ni VeriFactu. También presentaba el
  cobro como caja del periodo cuando se atribuía por fecha de llegada.
- Pruebas rojas fijaron el contrato de API, la copia visible y los datos demo.
  `/reports` expone ahora `bookingValue`: valor de las reservas cuya llegada cae
  en el rango y cobro registrado en esas mismas reservas. Se eliminó `revenue`
  de esta frontera y los informes explican que no son factura ni flujo de caja
  por fecha.
- Inicio, Informes, Mar de Fondo y Pina da Mar consumen el contrato preciso. Las
  guías públicas, el inventario, el dossier, ADR 0034, BACKLOG y la ruta R12
  conservan como gate real el alcance fiscal, asesoría, series, rectificativas,
  proveedor, firma/envío y conciliación.
- API pasa **276/276** y dashboard **39/39**, con tipos y lint verdes. El sitio
  construye **73 páginas** y valida su artefacto comercial. La build demo supera
  presupuesto y la revisión visual 1366/375 no muestra desbordes, errores ni
  afirmaciones fiscales. El gate serial sin Delta cierra **57/57** tareas.
- `pnpm check` global alcanza 47/57 antes de que Turbo cancele por el `ES1623`
  inválido del `tsconfig` de Delta, ajeno a este corte. No hubo deploy, secrets,
  proveedor ni escritura externa; Delta, Duna y RiuClar se preservaron. R12
  continúa con la auditoría local final de Analytics, observabilidad, OTA e IA.

## Frontera fail-closed de SES.Hospedajes R12 · 2026-08-10 (sesión 123)

- La guía y las preguntas frecuentes vigentes del Ministerio acreditan el alta,
  la gestión manual y los dos momentos de comunicación, pero sitúan la descarga
  técnica del servicio web dentro del acceso autenticado de la entidad. No hay
  base pública suficiente para afirmar endpoint, autenticación, XML, acuse,
  códigos, duplicados o reintentos.
- Una prueba roja demostró que endpoint, usuario y contraseña bastaban para
  activar un adaptador provisional: enviaba PII con Basic Auth, aceptaba
  cualquier 2xx y extraía un supuesto acuse por regex. Se retiró ese transporte
  y las variables quedan reservadas sin habilitar red.
- El módulo resuelve siempre `manualTransport`; `/hospedajes/enviar` responde
  `manual_only` y no registra una entrega inexistente. La UI y la guía pública
  llaman al XML determinista **borrador local** y remiten a revisión/comunicación
  en la Sede. El flujo actual no se presenta como cobertura del momento de
  reserva/formalización/cancelación.
- ADR 0028, inventario, dossier, runbook, BACKLOG y continuidad fijan el gate:
  obtener la documentación autenticada y aprobar endpoint, autenticación,
  request, acuse, errores, cancelación, duplicados y reintentos antes de volver a
  añadir una integración directa.
- Hospedajes pasa **17/17**, su recorrido API **7/7**, dashboard **37/37**, el
  sitio construye **73 páginas** y la API completa **276/276**. El gate global
  alcanza 53 tareas antes de quedar bloqueado por el `tsconfig` inválido del
  tenant concurrente y, al excluirlo, por `EADDRNOTAVAIL` de Workers; la misma
  suite API pasa completa en aislamiento.
- No hubo deploy, secrets, acceso autenticado, proveedor ni escritura externa.
  El trabajo simultáneo de Delta, Duna y RiuClar se preservó separado. R12
  continúa con la auditoría contractual de los módulos restantes antes de
  decidir su cierre local y la transición a R13.

## Camping La Duna lleva D5-V a 5/6 · 2026-08-10 (sesión 122)

- El mandato visual se amplía al portfolio completo de doce demos. La quinta,
  **Camping La Duna (`duna`)**, queda terminada y `delta` pasa a ser la siguiente
  programada; después se continúa por B2–B4 y C2–C4, siempre de forma vertical.
- La Duna es un tenant tier 1, demo-only y en español: microcamping de 20 plazas
  camper, con dos tamaños, tres temporadas, precios y extras deterministas.
  Gálibo, suelo, viento y pasarela forman el recorrido; reutiliza el core y el
  transporte demo sin Worker, D1 ni dashboard propios.
- Fotografía **8/8** aprobada y trazada en cuatro tandas. El generador integrado
  falló dos veces antes de producir bytes y abrió el fallback documentado. La
  inspección descartó personas, matrículas, marcas, arena de playa, tendidos y
  geometría dudosa; Higgsfield Soul Location escaló a GPT Image 2 tras dos
  rechazos por pieza. Los finales miden como máximo 2.000 px y tienen miniatura,
  OG, favicon y apple-touch icon derivados.
- `/temas` incorpora la quinta tarjeta navegable y el bundle sirve
  `/demos/duna/` con `noindex`. La build aislada produce 13 páginas sin motor;
  la fábrica valida **6 tenants + plantilla + 2 conceptos** y el portfolio
  construye **5/5**.
- El bundle compuesto valida **12.297 enlaces / 384 HTML**. El QA canónico pasa
  a **375/1366**, cinco formatos/MIME, sin desborde ni fallos visibles. No hubo
  deploy ni escritura remota; el desarrollo global simultáneo se preservó.

## Frontera Zod del callback Redsys R12 · 2026-08-10 (sesión 121)

- El quinto corte local R12 contrasta la notificación POST con el manual oficial
  de Redirección v4.1. Ocho tests unitarios nacieron rojos: versión ausente/ajena,
  importe o respuesta no string, importe inseguro/`NaN` y campos mínimos
  ausentes producían eventos. La integración firmada con importe JSON numérico
  recibía 200 y registraba el cobro.
- El formulario exige ahora los tres campos y `HMAC_SHA256_V1`, la única versión
  implementada. Zod valida que el JSON sea un record de strings antes del
  percent-decoding y exige pedido Redsys, respuesta de cuatro dígitos e importe
  de 1–12 dígitos. Solo después se compara la firma en tiempo constante y
  `0000`–`0099` decide éxito.
- El manual v4.1 presenta `HMAC_SHA512_V2` como estándar actual. No se acepta
  como alias de SHA-256: terminal y versión deben confirmarse en sandbox y una
  migración será explícita si corresponde.
- La prueba D1 mal tipada devuelve 400 y conserva reserva `pending`, saldo cero y
  cero pagos. Pagos pasa **44/44**, el recorrido API de pagos **16/16**, la API
  completa **276/276** y `pnpm check` cierra **57/57** tareas en **12,138 s**.
- No hubo deploy, secrets, sandbox, cobro ni escritura externa. El trabajo
  simultáneo de las demos se preservó separado. R12 continúa con la auditoría
  del contrato de transporte SES.Hospedajes sin inventar un acuse oficial.

## Acuse funcional de refund Redsys R12 · 2026-08-10 (sesión 119)

- El cuarto corte local R12 contrasta la devolución REST con el manual oficial
  v4.0.1. Cinco reproducciones rojas demostraron que el adaptador aceptaba 2xx
  vacíos, rechazos firmados y pedidos ajenos, omitía el timeout y filtraba el
  error de transporte.
- El refund tiene ahora un único intento de **8 s**: valida con Zod el sobre y
  sus parámetros, verifica la firma en tiempo constante y solo confirma
  `Ds_Response=0900` para el mismo pedido e importe. `errorCode`, HTTP, red,
  timeout, firma, esquema y rechazo quedan reducidos a códigos cerrados.
- No se reintenta una devolución ambigua porque Redsys no documenta una clave
  idempotente equivalente. El manual recomienda `HMAC_SHA512_V1`, pero mantiene
  SHA-256 disponible; el adaptador conserva `HMAC_SHA256_V1` hasta confirmar en
  sandbox la versión habilitada por el terminal.
- La integración D1 prueba que un `0180` válido no reduce `paidCents` ni inserta
  un refund. Pagos pasa **35/35**, el recorrido API de pagos **15/15**, la API
  **275/275** y `pnpm check` completa **55/55** tareas en **14,824 s**.
- No hubo deploy, secrets, llamada a proveedor, cobro, devolución ni escritura
  externa. El trabajo simultáneo de Riu Clar se preservó separado. R12 continúa
  con la frontera Zod del callback Redsys.

## Càmping Riu Clar abre D5-V · 2026-08-10 (sesión 118)

- La decisión explícita de Andreu sustituye el gate de espera de R9 y abre el
  desarrollo visual en paralelo al trabajo global, demo a demo. La siguiente
  programada, **Càmping Riu Clar (`riuclar`)**, ya es la cuarta demo del
  portfolio; D5-V pasa de 3/6 a **4/6** y `duna` queda como siguiente de la cola.
- Riu Clar es un tenant tier 1, demo-only y catalán: microcamping fluvial de 24
  parcelas, con dos tipologías, tres temporadas, precios y extras
  deterministas. Identidad, tema, contenido, datos y aviso legal son propios;
  reutiliza el core y el transporte demo sin backend ni infraestructura por
  marca.
- El manifiesto fotográfico queda **8/8** aprobado y trazado. El generador
  integrado falló dos veces por red antes de producir bytes; el pipeline registró
  ambos fallos y abrió su fallback documentado. Higgsfield completó después las
  tandas con inspección y descartes auditables. Los finales se normalizaron a
  2.000 px y derivaron miniatura, OG, favicon y apple-touch icon.
- `/temas` incorpora la cuarta tarjeta navegable y el bundle compuesto publica
  `/demos/riuclar/` con `noindex`; el concepto genérico Montaña queda sustituido
  por la demo real. La build aislada produjo 13 páginas sin rutas ni chunks de
  motor. La fábrica valida **5 tenants + plantilla + 2 conceptos**.
- La build comercial, el bundle de la API (**11.985 enlaces / 372 HTML**) y el
  QA canónico de Riu Clar pasaron en **375/1366**, con cinco assets/MIME y cero
  desborde visible. `pnpm check` cerró **55/55** tareas, con portfolio **4/4**,
  fábrica **5 tenants + plantilla + 2 conceptos**, API **275/275** y pagos
  **33/33**. No hubo deploy ni escritura remota. Los cambios simultáneos de
  pagos se preservaron sin modificarlos; el bloqueo histórico que sesiones
  116/117 atribuían al tenant no versionado queda resuelto en su configuración.

## Salida HTTP idempotente de Stripe R12 · 2026-08-10 (sesión 117)

- El tercer corte local R12 cierra `stripeRequest`, Checkout y refund sin
  proveedor ni red real. Siete pruebas rojas reprodujeron POST sin identidad,
  error remoto con PII, 2xx mal formado aceptado, ausencia de reintento y de
  timeout, y refund sin referencia validada.
- Cada POST lleva ahora una identidad explícita sin PII: Checkout usa
  `checkout/{bookingId}` y la API entrega al refund una clave versionada por el
  saldo previo. Un `AbortController` limita cada intento a **8 s**; hay máximo
  **dos intentos** con la misma clave y cuerpo, solo ante red/timeout, 409/5xx o
  indicación expresa de Stripe. Los 4xx ordinarios no se reintentan.
- Zod valida las respuestas 2xx de Checkout, consulta de sesión y refund. Body,
  mensaje remoto y error de transporte se reducen a códigos cerrados; un 2xx
  inválido nunca fabrica redirección ni afirma que devolvió dinero. El contrato
  `PaymentProvider.refund` transporta identidad, pero Redsys la deja sin usar
  hasta demostrar su semántica oficial en el corte siguiente.
- Pagos pasa **27/27**, el recorrido API de pagos **14/14** y la API completa
  **274/274**. La prueba de integración corta la primera conexión y exige dos
  intentos Stripe con `checkout/{bookingId}` idéntico. El gate sin el workspace
  ajeno completa **53/53** tareas en **11,70 s**.
- `pnpm check` global mantiene un único bloqueo externo a la entrega: el tenant
  no versionado `riuclar` importa `@logic-camp/core` sin declararlo. Se preservó
  intacto y se retiró solo su importer automático del lockfile. ADR 0011,
  inventario, runbook, dossier, backlog, roadmap y continuidad distinguen este
  cierre local de sandbox/producción. No hubo deploy, secrets, cobro, reembolso
  ni escritura externa.

## Antirreplay y frontera Zod de Stripe R12 · 2026-08-10 (sesión 116)

- El segundo corte R12 cierra la entrada del webhook Stripe sin proveedor ni
  red. La reproducción demostró dos falsos aceptados: un HMAC correcto con 301 s
  de antigüedad y un `amount_total: "12345"` firmado atravesaban el driver. Los
  dos tests nacieron rojos antes de cambiar la implementación.
- `Stripe-Signature` exige ahora timestamp entero y al menos una firma `v1` de
  64 hex; conserva varias firmas durante rotación, compara cada candidata en
  tiempo constante y aplica los **300 s** predeterminados por el SDK oficial.
  Después del HMAC y la recencia, Zod valida evento, tipo, sesión e importe
  entero no negativo. Ya no hay casts ni coerción de dinero en esta entrada.
- La prueba HTTP envía una firma válida pero caducada, recibe 400 y exige que no
  aparezca ningún asiento. El contrato D1 previo sigue deduplicando evento y
  referencia, exige importe idéntico al intent y mantiene `payments.raw=null`.
  Pagos pasa **22/22**, el recorrido API de pagos **13/13** y la API completa
  **273/273**.
- `RUNBOOK-PAGOS.md` separa estado local, ownership, variables, coste, preflight,
  sandbox, rotación, conciliación, apagado e incidente para Stripe y Redsys. El
  ADR 0011, inventario, dossier, roadmap y ruta distinguen este contrato de una
  activación. La salida Stripe y el acuse refund Redsys continúan abiertos.
- El `pnpm check` global encontró un único rojo fuera de la entrega: el tenant
  no versionado `riuclar` importa `@logic-camp/core` sin declararlo. Se preservó
  intacto. Excluyendo solo ese workspace ajeno, el mismo gate completó **53/53**
  tareas en **14,75 s**. No hubo deploy, secrets, sandbox, cobro, reembolso ni
  escritura de producción.

## Contrato acotado de correo e inventario R12 · 2026-08-10 (sesión 115)

- R12 arranca con un inventario trazable por oferta y familia: correo, Stripe,
  Redsys, SES, analítica, errores, fiscalidad, OTA e IA. Cada integración queda
  clasificada por modo local, gate, credenciales, consentimiento, reintentos,
  idempotencia, observabilidad, degradación y runbook; no se equiparan los dobles
  locales con una activación real.
- El primer corte vertical endurece Resend sin tocar proveedor ni producción.
  Cada envío usa una clave de idempotencia sin PII, timeout de **8 s**, un máximo
  de **2 intentos** y reintento solo ante timeout, red, 408, 429 o 5xx. La
  respuesta 2xx se valida con Zod y los errores públicos ya no copian cuerpos del
  proveedor. El log conserva correlación e intentos reales.
- Las pruebas fijan aceptación, reintento 503 con la misma clave, 422 sin
  reintento, respuesta 2xx inválida, timeout y clave inválida: notifications
  **14/14**. La integración de leads comprueba además que correo y cuerpo remoto
  no aparecen en el log; API pasó **272/272** y el recorrido dirigido **29/29**.
- La guía pública ya no afirma que exista una cuenta o dominio verificados ni
  confunde aceptación del proveedor con entrega en bandeja. El nuevo runbook
  documenta preflight, activación autorizada, rotación, degradación y apagado.
  La reproducción inicial con una clave ficticia `re_test` recibió 401 de Resend
  y no produjo entrega; no se usaron credenciales válidas.
- Verificación final: `pnpm check` completó **53/53** tareas en **16,60 s**. No
  hubo deploy, secretos, cambios de proveedor ni escritura de producción. R12
  continúa con la frontera local de Stripe y Redsys.

## Seguridad y activación de producción R11 · 2026-08-10 (sesión 114)

- R11 queda cerrado con una auditoría reproducible de superficie, autenticación,
  CORS, CSRF, cuotas, RGPD y operación. API y sitio estático emiten una política
  defensiva común (CSP mínima, HSTS, `nosniff`, `DENY`, referrer y permisos);
  Better Auth activa cookies `__Secure-`, `Secure`, `HttpOnly` y `SameSite=Lax`
  cuando existe secreto, sin alterar el modo demo local. Las pruebas cubren 200,
  401 y 404, origen CORS no permitido y cookie de producción.
- El export local ya usa el estado D1 asociado al `wrangler.jsonc` del tenant y
  genera el SQL en dos fases, esquema antes que datos. Esto evita la ordenación
  intercalada de Wrangler que podía insertar `booking_guests` antes de crear
  `guests`. `backup:rehearse demo` restaura en una D1 temporal y exige igualdad
  exacta: **3.426 reservas / 2.568 huéspedes / 3.109 relaciones**, migraciones
  idénticas, cero descuadres de pago y cero solapes.
- El dossier de activación fija la verdad local de Inicio, Gestión, pagos,
  comunicaciones, fiscalidad, SES, OTA, IA, copias y observabilidad, con gate,
  responsable, secretos, criterio de aceptación y rollback. El runbook separa
  claramente copias locales de D1 remoto y deja las comprobaciones remotas
  pendientes de cuenta, base, permisos y autorización explícita.
- Verificación final: `pnpm check` completó **53/53** tareas en **22,50 s**
  (API **272/272**, CLI **33/33**, demo **63/63**); `qa:canonical` pasó
  **11 superficies / 22 vistas**, cinco assets y 11.673 enlaces; Playwright pasó
  **25/25**, incluidas las cabeceras estáticas y del Worker. No hubo deploy,
  reseed remoto, secretos ni escritura de producción. La siguiente ruta es
  **R12**, cierre de huecos operativos sin fingir integraciones externas.

## Auditoría de portfolio R9 y QA canónico R10 · 2026-08-10 (sesión 113)

- R9 queda agotado hasta recibir aprendizaje externo. La matriz compara
  L'Olivar, Pinada del Mar y Mar de Fondo con Montaña, Familiar y Parcela por
  ICP, objeción, nivel, recorrido y pantalla firma. Ningún concepto tiene una
  señal observada propia: D5-V permanece esperando 3/3 con disparadores exactos
  y D6-V todavía no es evaluable. No se generaron activos ni se consumió
  proveedor para inventar otra demo.
- R10 queda cerrado con un gate canónico reproducible. `qa:canonical` construye
  el bundle compuesto y recorre landing ES/EN, docs, Cala home+detalle,
  L'Olivar, Pinada web+planning y Mar de Fondo web+Automatiza+Inteligente a
  **375/1366 px**: **11 superficies / 22 vistas** más cinco formatos/MIME. Cada
  vista exige testigos, política de indexación, imágenes y fuentes cargadas,
  cero overflow, 4xx, fallos de petición, errores de consola o página.
- La inspección de capturas confirmó jerarquía y encaje en landing móvil,
  planning de escritorio y prototipos supervisados. El barrido encontró un 404
  real en `/favicon.ico`: los tres builds del gestor incluyen ahora el mismo
  favicon SVG bajo su `BASE_URL`, sin depender de la raíz del sitio.
- La suite completa compartía localhost como una sola identidad y agotaba las
  cuotas antes de llegar a la puerta demo. Cada contexto de Playwright usa ahora
  una IP privada determinista en `cf-connecting-ip`; Better Auth reconoce esa
  cabecera de Cloudflare y solo desactiva su segunda cuota bajo el flag local
  sin `AUTH_SECRET`. Producción conserva ambos rate limits. La unidad fija esa
  frontera y API pasa **267/267**.
- Un E2E nuevo cerró la deuda antigua del reset local: ejecuta las 84 sentencias,
  exige 200, espera la renovación de sesión, comprueba el aviso y recarga sin
  expulsar al visitante. El recorrido completo contra Worker+D1+bundle reales
  pasó **23/23**; el bundle conserva **11.673 enlaces internos / 360 HTML** y
  entradas de **173,18 / 177,64 / 183,44 kB gzip**.
- Verificación final: `pnpm check` completó **53/53** tareas en **17,67 s**;
  `qa:canonical` pasó 22/22 vistas y 5/5 assets; Playwright, 23/23. No hubo
  deploy, reseed remoto, secretos, proveedor ni escritura de producción. La
  siguiente ruta es **R11**, seguridad y preparación del primer cliente.

## Fábrica común de identidades R8 · 2026-08-10 (sesión 112)

- R8 queda cerrado. `identity.json` fija el brief mínimo de Cala Sereno,
  L'Olivar, Pinada del Mar y Mar de Fondo; Montaña, Familiar y Parcela tienen el
  mismo contrato como conceptos. `_template` y `pnpm new:camping` ya entregan
  brief, manifiesto y destino de media sin modificar aplicaciones ni core.
- `check-tenant-factory.mjs`, incorporado a `pnpm check`, descubre identidades y
  valida locales, tokens, contraste AA, temas claro/oscuro, radios, procedencia,
  lotes, dimensiones y presupuestos. Los cuatro manifiestos quedan completos:
  **12/12, 8/8, 11/11 y 14/14**.
- El selector de tema sincroniza URL y `localStorage`, limpia valores inválidos y
  conserva el predeterminado; Playwright pasó selector y reduced motion
  **5/5**. La captura genérica construyó L'Olivar y Cala nocturna a 375/1366 px
  sin 4xx ni errores, y la inspección confirmó jerarquía, media, formulario,
  footer y el héroe histórico normalizado.
- Los tres builds de portfolio y el bundle compuesto pasaron. No se generó
  fotografía ni se consumieron créditos; solo se normalizaron derivados locales.
  No hubo deploy, reseed ni escritura remota. La siguiente ruta quedó en R9,
  auditoría del hueco comercial antes de abrir D5-V.

## Recorrido comercial y documentación R7 · 2026-08-10 (sesión 111)

- R7 queda cerrado. Home y precios muestran el estado localizado de cada plan
  desde el mismo componente: Inicio/Gestión disponibles, Automatiza en
  desarrollo e Inteligente en roadmap. La portada consume `GUIAS` y vuelve a
  ofrecer las cuatro ayudas, incluida Gestión, sin una lista duplicada.
- La auditoría de copy retiró promesas que el producto no podía sostener: la
  versión inglesa deja de garantizar una implantación en una tarde, evita
  absolutos sobre temporada/escala y llama «de ejemplo» a los datos del
  planning. El mensaje de lead ya no promete un SLA de 24 h. El guion comercial
  usa enlaces HTTPS reales, explica exactamente qué puede hacer la puerta demo
  y acuerda alcance, materiales y calendario antes del alta.
- `BRAND.md` deja de describir un sitio neutro que ya no existe: separa gestor
  Logic2B UI, sitio comercial botánico y web de tenant; documenta papel, verde
  tinta, serif editorial, radio 14 px y tokens comunes sin contaminar dashboard
  ni identidades de camping. Home, precios, temas y docs siguen usando un solo
  `Base.astro` y overlay botánico.
- El `BreadcrumbList` que ya calculaba `Docs.astro` ahora entra en una ranura
  real de `<head>`, usa el título del índice como raíz y deja la última miga
  alineada con canonical. El build incorpora un contrato sobre el artefacto:
  estados y enlaces de las cuatro páginas de planes, 60 rutas de guía ES/EN,
  ocho índices localizados, posiciones continuas, URLs absolutas y cero copia
  del breadcrumb en `<body>`.
- QA de navegador contra el build estático: home, precios y guía en ES/EN a
  **1366/375 px**, formulario principal, diálogo con plan, FAQ visible+JSON-LD,
  índice desktop/móvil y tratamientos de estado, todo sin overflow, recursos
  rotos ni errores. El vídeo dura **38,9 s**, conserva controles, póster, foco,
  pistas ES/EN y transcripción; los tres formatos de campaña mantienen sus UTM.
  `qa:video` puede leer metadatos con `mdls` en macOS cuando `ffprobe` no está
  instalado, y las QA de media ya distinguen la cancelación deliberada de un
  rango `preload=metadata` de una descarga rota.
- Verificación final: site **53 archivos / 0 diagnósticos**, contrato comercial
  **4 páginas de planes + 60 guías**, QA comercial **4/4**, vídeo **4/4** y
  campaña **4/4**. `pnpm check` completó **53/53** tareas en **4,72 s**. No hubo
  deploy, reseed ni escritura remota. El siguiente checkpoint es **R8**, fábrica
  común de temas, contenido y media.

## Estados, cierres y semántica del gestor R6 · 2026-08-10 (sesión 110)

- R6 queda cerrado. El alta manual y el diálogo de bloqueos ya distinguen carga
  y error del catálogo con `SkeletonText`/`QueryError` y permiten reintentar. La
  cotización inesperadamente fallida deja de ser un hueco sin explicación y
  «Crear la reserva» permanece deshabilitado hasta tener la cotización vigente
  del servidor; el cliente continúa sin calcular ningún precio.
- Cancelar, marcar no presentada y completar son transiciones terminales con
  `AlertDialog` y texto propio. Una estancia «En casa» ya no ofrece cancelación,
  no-show ni cierre paralelo: el check-out es el único camino que registra la
  salida y completa la reserva. El E2E encontró y corrigió también una primera
  etiqueta repetida que mostraba «Cancelar reserva» en los tres disparadores.
- La deuda semántica se resolvió por evidencia. No queda ningún uso de los
  antiguos alias `pino`/`arena`/`tinta`/`crema` en el dashboard; las clases
  `lc-*` restantes nombran componentes de dominio. Diez claves i18n de
  carga/error verificadas como huérfanas se retiraron y los ejemplos visibles
  del alta entraron en el diccionario.
- Los E2E móviles que prueban edición y solicitudes pasan ahora con recepción,
  no con el visitante demo al que R6 retiró esas puertas. Bundle real: alta,
  confirmaciones y ficha móvil **5/5**; planning, plano, operación diaria,
  búsqueda, shell y carga dinámica **6/6**, recorriendo 320/375/430/1366 px sin
  mutaciones confirmadas. Entradas M6: **173,18 / 177,65 / 183,43 kB gzip** y
  **11.671 enlaces / 360 HTML** verdes.
- Verificación final: dashboard **37/37**, typecheck y lint verdes; `pnpm check`
  completó **53/53** tareas en **3,13 s**. No hubo deploy, reseed ni escritura
  remota. La siguiente ruta es **R7**, landing de venta y documentación de
  producto.

## Afordancias por rol del gestor R6 · 2026-08-10 (sesión 109)

- API y dashboard comparten ahora una política pura de roles y capacidades en
  `@logic-camp/config/roles`. El servidor continúa siendo la barrera de
  seguridad, pero la interfaz deja de ofrecer mutaciones que acabarían en 403;
  la excepción `demo` conserva únicamente mover, reasignar y registrar o
  deshacer entradas/salidas.
- Planning, plano, ficha, huéspedes, reservas, llegadas, solicitudes,
  inventario, tarifas, ajustes y RGPD adaptan controles, arrastre, teclado y
  diálogos al rol real. Los datos de lectura siguen visibles. Un E2E de navegador
  fija que demo puede operar estancias, pero no crear reservas/bloqueos, cobrar,
  cancelar, editar huéspedes, cambiar solicitudes, inventario, tarifas o
  ajustes.
- El barrido encontró un defecto independiente y reproducible en Parte de
  viajeros: cambiar la forma de pago enviaba `POST` a una ruta que solo acepta
  `PATCH`, por lo que un manager recibía 404. El cliente usa ya el verbo del
  contrato que cubre la integración API existente.
- El E2E también reveló que la puerta demo creaba una sesión válida, pero las
  guardas privadas comparaban solo el slug `demo` con el ID opaco sembrado
  `ten_calasereno`; toda llamada `/api/admin` terminaba en 401. La guarda valida
  ahora ambas representaciones de la misma D1, falla cerrada ante cualquier otra
  y la provisión nueva persiste el ID canónico. La integración fija el caso
  `ten_alfa` ↔ `alfa` que los tests anteriores no distinguían.
- Importar la política desde el barrel general elevó Mar de Fondo a **203,17 kB
  gzip** y la barrera M6 falló. El subpath dedicado evita arrastrar configuración
  de tenant al gestor: entradas finales de **173,10 kB** (normal), **177,58 kB**
  (Pinada) y **183,36 kB** (Mar de Fondo), con **11.671 enlaces internos / 360
  HTML** verdes.
- Verificación: config **66/66**, dashboard **37/37**, API dirigida **137/137**,
  E2E de permisos+shell **2/2** y `pnpm check` **53/53** en **31,19 s**. No hubo
  deploy, reseed ni escritura remota. R6 continúa con estados de interfaz,
  acciones destructivas y deuda semántica/i18n demostrable.

## Shell y ayuda del gestor R6 · 2026-08-10 (sesión 108)

- La portada ya no es la única pantalla operativa sin ayuda: incorpora
  `BotonAyuda` y una guía propia, «Orientarte desde la portada», que explica las
  cuatro cifras, las tres listas diarias, el catálogo filtrado por rol y el
  punto de entrada adecuado para cada tarea. El orden de la guía de recepción
  pasa a 15 páginas sin alterar sus URLs.
- El doble `aria-current` registrado en B1 ya no se reproduce con TanStack
  Router actual. La regresión queda cerrada con navegador real: exige un solo
  enlace activo en Inicio, después de cambiar el hash directamente a
  Solicitudes y después de activar Planning con `.click()` sintético.
- El E2E del gestor había dejado de poder iniciar la demo tras el cierre
  fail-closed de auth de R4. Playwright levanta ahora exclusivamente su Worker
  local con `LOGIC_CAMP_DEV_AUTH=1`; no relaja el runtime desplegable ni escribe
  en producción.
- Verificación dirigida: dashboard **37/37**, E2E del shell/portada **1/1** a
  320/375/430/1366 px, nueva guía sin overflow a 375/1366 px, bundle compuesto
  con **11.671 enlaces internos / 360 HTML** y entradas gzip de 172,99 kB
  (normal), 177,46 kB (Pinada) y 183,25 kB (Mar de Fondo), todas dentro de R2.
  La línea final `pnpm check` completa **53/53** tareas en **10,75 s**. R6
  continúa abierto: el siguiente checkpoint son las afordancias de mutación por
  rol y la revisión de estados/acciones destructivas.

## Motor, seed y datos creíbles R5 · 2026-08-10 (sesión 107)

- R5 queda cerrado tras reejecutar el motor puro y los recorridos API que lo
  materializan. Core mantiene **68/68** casos de fechas, temporadas, pricing,
  disponibilidad, holds, asignación, tasa turística, cancelación y casos límite;
  API de disponibilidad/reservas/gestión/pagos pasó **96/96** de forma dirigida.
- El único defecto nuevo observable estaba en `/solicitudes`: mensaje, idioma y
  prefijo concordaban, pero firmas como «Tom Ferrer» o «Matteo Ricci» no. Las 15
  solicitudes usan ahora identidades locales por idioma, emails únicos y una
  prueba determinista sobre diez temporadas. El generador combinatorio de las
  fichas de huéspedes no cambia: nombre↔nacionalidad sigue siendo plausible y
  no se perfecciona sin evidencia, tal como exige R5.
- Las **23 anclas** conservan cronología, pagos, estados, estancias históricas,
  no-solape, desglose y tasa. Reset y seed pasan **63/63**. En el ancla real
  2026-08-10 hay **3.426 reservas**, 83 unidades, 55 estancias en casa, 11
  llegadas y 14 salidas; el plano coloca 83/83 unidades y la operación diaria
  mantiene al menos dos gestos de entrada y salida durante todo el año.
- `converted_booking_id` se revalidó y se deja sin tocar: el endpoint lo devuelve
  pero la pantalla no lo pinta ni enlaza, de modo que no existe hoy una
  contradicción visible que justifique inventar una conversión histórica.
- Verificación final: `pnpm check` completó **53/53** tareas en **16,86 s**, con
  API **265/265**, core **68/68**, tenant demo **63/63**, enlaces **3/3**, lint,
  typecheck, builds y Worker seco verdes. No hubo deploy, reseed remoto ni
  escritura de producción. El siguiente checkpoint es **R6**, gestor y Logic2B
  UI.

## Backend mínimo y contratos de API R4 · 2026-08-10 (sesión 106)

- R4 queda cerrado con ADR 0042 y un inventario ejecutable de **47 rutas**. Cada
  endpoint declara propietario, autenticación, validación, mutación,
  idempotencia y cuota; el test falla tanto si aparece una ruta sin contrato
  como si queda un contrato huérfano. Los barridos existentes mantienen cerrado
  el rol demo y el aislamiento A↛B de datos y sesiones.
- La reproducción inicial dejó **22 pruebas rojas / 239 verdes**: formulario de
  venta con éxito ficticio, webhook que aceptaba otro importe, doble cobro por
  `providerRef`, secreto de auth conocido, fechas inexistentes, inputs ambiguos,
  `payments.raw`, PII sin anonimizar y rate limit compartido. La implementación
  final separa `delivered`/`demo`/`disabled`/`failed`, exige un secreto de 32
  caracteres o interruptor local y aplica cuotas por superficie con
  `Retry-After`.
- Cada intent guarda importe e instrucciones; el reintento idempotente recupera
  la misma operación, la clave externa queda hasheada y el retorno no contiene
  correo. El webhook exige importe exacto, deduplica evento y referencia, evita
  sobrepago y actualiza asiento+reserva en un batch. Si crear el intent falla,
  responde **502** con referencia y declara la reserva `pending` persistida.
- La anonimización cubre segundo apellido, sexo, soporte documental, parentesco,
  consentimiento y notas vinculadas. Los logs redactan email, teléfono, código
  de reserva y credenciales reconocibles; `payments.raw` no sale por API/export
  y la migración **0007** limpia el legado. Fechas, rangos, bloqueos, estados de
  solicitud, moneda, locales e `Idempotency-Key` fallan antes de escribir.
- Las cinco invariantes conservan evidencia: capacidad+holds en core,
  pago/`paidCents` atómico, tarifa histórica inmutable, cancelación que libera
  inventario y aislamiento por D1. Cron, avisos, reset y reintentos actuales
  siguen verdes; Resend, Stripe, Redsys, SES.Hospedajes, WAF y observabilidad
  externa pasan a R12 con sus gates escritos, sin activar cuentas ni secretos.
- Verificación dirigida: API **265/265**, enlaces demo **3/3**, API TypeScript y
  Astro **50 archivos / 0 diagnósticos**. La pasada final de `pnpm check` cerró
  **53/53** tareas en **15,29 s**, incluidos seed demo **62/62**, builds y Worker
  seco. El formulario se recorrió en Chrome a **1366/375**, ES/EN y diálogo
  móvil: resultado demo explícito, sin overflow ni errores. El siguiente
  checkpoint es **R5**, la coherencia del motor, seed y datos. No hubo deploy ni
  escritura remota; la siguiente publicación incluye la migración 0007 y exige
  confirmar el `AUTH_SECRET` remoto antes de autorizarla.

## Consolidación del punto de partida R0 · 2026-08-10 (sesión 105)

- R0 de la ruta duradera queda cerrado sobre una base limpia y sincronizada:
  `main` y `origin/main` estaban en `acc60b7`, sin commits ni cambios locales
  heredados. La entrega de la sesión 104 ya vive aislada en `aa39ee3` y no se
  mezcló con trabajo posterior.
- ADR 0040, componente, MP4, póster y VTT se revisaron contra su contrato. El QA
  reproducible pasó a **1366/375** usando Chrome local y un `ffprobe` temporal:
  H.264 **1280×720**, **22,1 s**, sin audio, controles, pista de tres capítulos,
  foco visible, alternativa textual, cero desborde, errores o recursos fallidos.
- El sitio conserva **50 archivos / 0 diagnósticos**. `pnpm check` completó
  **53/53** tareas sin cancelaciones: API **240/240**, tenant demo **62/62**,
  verificador de enlaces API **3/3** y todos los builds verdes en **32,52 s**.
- El candidato queda listo para el único `deploy:demo`, sin migración ni reseed.
  No se tocó producción: el despliegue continúa condicionado a autorización
  explícita.
- R1 también queda cerrado en la misma sesión: CLAUDE y BRAND distinguen ya
  wordmark de producto e isotipo auxiliar; `ui.logic2b.com` queda como referencia
  externa y no como Storybook pendiente; ROADMAP cierra Fase 4, Fase 10 local y
  B0–B4, y corrige checkboxes viejos de fotos, planning y datos.
- `DEMO-SCRIPT` separa landing, `/demo/` y `/admin/`, usa la puerta anónima y
  fechas ofrecidas por el seed actual. BACKLOG incorpora un índice operativo
  que clasifica cada resto por checkpoint local, cliente, credencial, decisión
  comercial o descarte; además cierra duplicados ya resueltos por M1/M4/M5.
- El siguiente checkpoint es **R2**, fijar una línea base de calidad reproducible
  por paquete, tier y bundle. El diff documental pasó `git diff --check` y un
  barrido dirigido de estados/rutas obsoletos; no cambió código de producto.
- R2 queda cerrado en `docs/LINEA-BASE-CALIDAD.md`: tests secuenciales verdes en
  **28,39 s**, `pnpm check` **53/53** en **32,52 s**, presupuesto inicial del
  dashboard entre **176,11–184,38 kB gzip**, Worker seco en **451,47 KiB gzip**
  y bundle compuesto con **11.535 enlaces / 358 HTML**.
- El test del portfolio ya inspecciona el artefacto: L'Olivar tier 1 y Pinada
  tier 2 rechazan rutas/chunks del motor; Mar de Fondo tier 3 exige ambos puntos
  de entrada y sus cuatro chunks. La comprobación forma parte de `pnpm check` y
  evita que una build verde oculte una frontera de producto rota.
- El siguiente checkpoint pasa a **R3**, endurecer configuración y fronteras
  demo/producción. Producción sigue intacta y sin autorización de despliegue.
- R3 queda cerrado con ADR 0041. La web valida el objeto de tenant en runtime de
  build, impide que `TIER` eleve capacidad y exige coherencia entre locale,
  transportes, flags demo y ruta del gestor. La API ya no convierte una política
  explícitamente inválida en otra silenciosa; pagos, notificaciones y el PATCH de
  ajustes validan sus claves conocidas.
- El dashboard resuelve normal/Pinada/Mar de Fondo como artefactos distintos. El
  normal ya no importa sesión, reset ni fixtures del portfolio; Automatiza e
  Inteligente solo existen en Mar de Fondo. El presupuesto inspecciona todos los
  chunks y pasa con entradas de **173,01 / 177,48 / 183,26 kB gzip**.
- Validación R3: config **59/59**, API **245/245 + 3/3**, dashboard **34/34**,
  portfolio **3/3** y bundle compuesto **11.535 enlaces / 358 HTML**. Los builds
  inválidos probados fallan con mensaje útil; la pasada final de `pnpm check`
  cerró **53/53** tareas en **30,14 s**. El siguiente checkpoint es **R4**; no
  hubo despliegue ni escritura remota.

## Vídeo de gestos del planning · 2026-08-09 (sesión 104)

- Cierra el pendiente C6 con ADR 0040: una captura reproducible muestra mover
  `MF-DEMO-001`, estirar su salida con revisión del precio y crear arrastrando
  hasta abrir el alta con tipo, unidad y fechas precargados. La pieza termina
  sin pulsar «Crear la reserva» y no atribuye permisos ni resultados ficticios.
- `video:planning` sirve el bundle compuesto en un puerto efímero, fija el reloj
  del escenario de Mar de Fondo, graba con Playwright y normaliza con `ffmpeg`.
  Solo reemplaza los assets tras validar H.264, 1280×720, ausencia de audio,
  duración de 20–35 s y presupuestos de vídeo/póster.
- Resultado aprobado: MP4 de **22,1 s / 590 kB**, póster WebP de **42 kB** y
  pista descriptiva de tres capítulos. La guía `/docs/recepcion/mover/` añade
  controles nativos, `playsinline`, carga de metadatos, foco visible y una
  alternativa textual que declara que el alta no se confirma.
- QA real a **1366/375**: metadatos y póster cargados, vídeo inicialmente en
  pausa, tres pasos, pista, foco y cero desborde, errores o recursos fallidos.
  La hoja de contacto y el fotograma final se inspeccionaron manualmente.
- Sitio: lint verde, Astro **50 archivos / 0 diagnósticos** y build de **71
  páginas**. `pnpm check` completó **53/53** tareas: API **240/240**, tenant demo
  **62/62** y todos los builds verdes. Sin deploy; el siguiente despliegue no
  necesita migración ni reseed. D5-V continúa cerrado por el gate comercial.

## Publicación de la primera ola · 2026-08-08 (sesión 103)

- El bundle de demostración completo queda publicado en Cloudflare como versión
  **`87d60d0a-b4bc-4f4a-8bf5-5d2b85b221e7`**. La sesión OAuth local era válida;
  `deploy:demo` recompuso landing, demo base, las tres marcas y sus gestores antes
  de subir, sin crear infraestructura ni tenants nuevos.
- D1 no tenía migraciones pendientes. El verificador del bundle recorrió
  **11.533 enlaces internos / 358 HTML**; Cloudflare leyó 1.361 activos y subió
  192 nuevos o modificados. El Worker arrancó en **78 ms** y conserva sus dos
  cron existentes.
- QA real en `camp.logic2b.com` a **1366/375**: landing ES/EN sin desborde ni
  errores, vídeo H.264 de **38,87 s** con controles, `playsinline`, sin autoplay,
  póster y las dos pistas VTT; cada idioma marca como predeterminada la suya.
  Las tres creatividades mantienen UTM distintas y los tres momentos clave abren
  L'Olivar/consulta, Pinada/planning y Mar de Fondo/inteligente sin imágenes
  rotas.
- `/temas/` y `/en/temas/` sirven Montaña, Familiar y Parcela desde los WebP
  propios de **1440×960**, también a 375 px, con cero desborde. La publicación
  cierra la deuda de despliegue de las sesiones 98–102; D5-V sigue bloqueada por
  aprendizaje comercial y no se abre una cuarta demo.
- `pnpm check` completó **42/53** tareas antes del fallo ambiental conocido al
  arrancar Workers bajo concurrencia; no falló ninguna aserción. El sitio se
  revalidó aislado: lint verde, Astro **47 archivos / 0 diagnósticos** y build de
  **71 páginas**. El despliegue había recompuesto además todos los bundles y su
  verificador de enlaces antes de publicar.

## Checkpoint visual de temas · 2026-08-08 (sesión 102)

- El catálogo `/temas/` deja de reutilizar tres fotografías de la propuesta
  Azahar para sus conceptos. Montaña, Familiar y Parcela tienen ahora piezas
  originales que responden a su dirección de arte: refugio de temporada larga,
  camping familiar vivido y parcela de touring operativa.
- Las tres se generaron con el modelo integrado de Codex en dos tandas máximas
  de 2, con revisión visual entre ambas y sin CLI, API con clave ni fallback.
  Cada llamada produjo una variante válida; manifiesto, prompt exacto, proveedor,
  huella SHA-256, dimensiones y destino quedan en `apps/site/fotos-temas*.json`.
- Los finales locales son WebP sRGB de **1440×960**: Familiar **268 kB**,
  Montaña **336 kB** y Parcela **320 kB**. ES/EN apuntan a `/temas/`; no se crea
  una cuarta demo, marca, D1 o backend, y los conceptos siguen rotulados como
  tales.
- QA real del bundle a **1366/375**: seis tarjetas, 3/3 imágenes nuevas cargadas,
  recortes e interfaz superpuesta legibles, cero desborde horizontal y cero
  avisos/errores de consola en ES/EN. Sitio: **71 páginas**, build y typecheck
  verdes.
- `pnpm check` alcanzó **42/53** antes de que Workers agotara el arranque de la
  API bajo concurrencia. En aislado pasaron **190/240** pruebas API y las **50**
  restantes no empezaron por timeout/crash ambiental del runtime; enlaces API
  **3/3**. Tenant demo pasó **60/62** y las dos restantes agotaron 5 s sin fallo
  de aserción antes de que el runtime dejara de arrancar. Sin deploy.

## Checkpoint comercial D4-V · 2026-08-08 (sesión 101)

- D4-V queda cerrado con una captura guiada reproducible de **38,9 s**,
  **1280×720**, H.264, sin audio y de **1,0 MB**. El recorrido conecta la
  creatividad de Mar de Fondo con disponibilidad, alojamiento, extra, titular,
  recibo, planning y recomendación explicable; usa una fecha fija y los datos
  demo existentes, sin servicios ni acciones externas.
- `video:ola1` graba el bundle compuesto con Playwright/Chromium y normaliza el
  resultado con ffmpeg. Valida códec, resolución, duración y peso antes de
  publicar el MP4. ADR 0039 propuesto deja acotado este patrón a capturas
  comerciales reproducibles, no a una plataforma general de vídeo.
- La landing ES/EN comparte el metraje y añade póster aprobado, controles
  nativos, `playsinline`, carga bajo demanda, subtítulos localizados y una
  transcripción indexable de cuatro pasos. No hay autoplay ni una narración
  comercial distinta entre idiomas.
- `qa:video` queda verde en ES/EN a **1366/375**: duración, resolución, pistas,
  foco de 2 px, cuatro pasos y cero desborde. Las capturas y una hoja de contacto
  del vídeo se inspeccionaron manualmente. Sitio: **71 páginas**, typecheck
  **0 errores**; bundle compuesto: **11.533 enlaces / 358 HTML**.
- `pnpm check` completó **42/53** antes de que el runtime de Workers saliera
  bajo concurrencia y Wrangler intentara escribir su log fuera del sandbox.
  Todo lo cancelado se revalidó aislado: API **240/240** + enlaces **3/3**,
  tenant demo **62/62**, pipeline web **9/9** + portfolio **3/3** y build seco
  del Worker correcto con el log redirigido. Sin deploy.

## Checkpoint comercial D4-V · 2026-08-08 (sesión 100)

- La landing ya demuestra el origen de una reserva directa: una nueva sección
  bilingüe reúne anuncio de búsqueda, display 300×250 y feed 1080×1080 de Mar de
  Fondo. Los tres formatos son HTML/CSS estático y reutilizan por import la
  fotografía aprobada `instalacion-laguna.webp`; no hay copias, generación ni
  JavaScript nuevo.
- Cada creatividad abre `/demos/mardefondo/` en `#mostrador` con la campaña
  ficticia `mar_de_fondo_agosto` y un `utm_content` propio. El rótulo
  «Creatividad de ejemplo» aparece dentro de las tres piezas; la sección declara
  además que no existe cuenta ni medición real y que el pago es simulado, sin
  cargo. No se copiaron logos o cromo de plataformas ni se inventaron ROAS o
  conversiones.
- ADR 0038 propuesto: campaña propia → web propia → reserva directa es un
  recorrido comercial estático, no una integración publicitaria. El guion de
  venta incorpora la entrada desde `#campanas` y la comprobación visible de las
  UTM antes de continuar hacia disponibilidad.
- `qa:campana` valida ES/EN a **1366/375**, tres enlaces, UTM completas y
  distintas, imagen cargada, foco de 2 px, movimiento reducido, cero desborde,
  errores de consola o peticiones fallidas. Las cuatro capturas se inspeccionaron
  manualmente y la jerarquía se mantiene en ambos idiomas.
- El bundle compuesto quedó verde con **11.531 enlaces internos / 358 HTML**.
  `pnpm check` llegó a **43/53** antes del timeout `resolveId` conocido del tenant
  demo bajo concurrencia; aislado pasó **62/62**. Sitio específico: **71 páginas**,
  typecheck sin errores. D4-V queda pendiente solo del vídeo/captura guiada. Sin
  deploy.

## Checkpoint comercial D4-V · 2026-08-08 (sesión 99)

- La primera ola ya tiene una ficha comercial que se puede enviar: dos PDF A4
  de tres páginas, ES/EN, construidos desde el mismo `portfolio` bilingüe de la
  landing. Inicio, Gestión y Visión se explican por tamaño, resultado y recorrido;
  no aparece una segunda lista técnica que pueda divergir del sitio.
- El generador reproducible usa las tres miniaturas y tres capturas aprobadas,
  valida el orden `olivar`/`pinadamar`/`mardefondo` y publica copias idénticas en
  `output/pdf/` y `apps/site/public/`. Cada archivo pesa **307 kB**, contiene tres
  enlaces a momentos firma y un QR de contacto; pypdf confirma **3 páginas / enlaces
  [0,3,1]** y extracción de texto completa.
- La landing incorpora una descarga localizada y estática, sin isla, API ni
  proveedor externo. El alcance ficticio permanece visible tanto en la página
  como dentro del PDF; pago, automatización e inteligencia no se presentan como
  integraciones operativas. ADR 0037 queda propuesto para validación posterior.
- QA real en navegador a **1366/375** sobre ES/EN: CTA visible, ancho móvil de
  293 px, `download` y destino correctos, cero desborde, imágenes rotas o avisos
  de consola. Las seis páginas se renderizaron e inspeccionaron tras corregir el
  solape inicial de un enlace sobre el tercer paso; MIME del bundle
  `application/pdf`.
- Dos pasadas de `pnpm check` alcanzaron **49/53** tareas antes de que el runtime
  del tenant demo volviera a salir sin aserción bajo concurrencia y Turbo
  cancelara tres tareas en curso. Reejecuciones aisladas verdes: tenant demo **62/62**, pipeline
  fotográfico **9/9** + portfolio **3/3**, sitio **71 páginas** y typecheck
  **0 errores**. Sin deploy.

## Checkpoint visual D3-V · 2026-08-07 (sesión 98)

- La generación integrada de OpenAI vuelve a producir bytes. Las seis piezas
  pendientes de Mar de Fondo se generaron **de una en una**, con inspección,
  aprobación y pausas de 20 segundos entre llamadas: interior de glamping,
  piscina laguna, restaurante, recepción, entorno dunar y textura de agua.
- Las siete tandas del manifiesto quedan completas: **14/14 fotografías
  aprobadas** y `.staging` vacío. Los seis nuevos másteres locales pesan entre
  **76 y 157 kB**; las dos cabeceras 21:9 terminan en 2000×857. El integrado
  entregó ambas a 1915×821 y se normalizaron localmente a 2100×900 antes del
  ingest para superar el mínimo de 900 px sin pedir otra generación.
- Cada activo conserva proveedor/modelo y huella del prompt en
  `fotos.estado.json`. No se ejecutó el fallback de Higgsfield, no se usó
  CLI/API con clave y no hubo llamadas concurrentes.
- Build específico de Mar de Fondo verde: **25 páginas / 112 derivados**.
  Pipeline **9/9** y dashboard **34/34**. La primera pasada global completó
  46/53 tareas por timeout de resolución en API; la segunda llegó a 51/53, con
  API **240/240**, y solo registró seis timeouts de 5 s en `seed/reset` del
  tenant demo bajo concurrencia. Las reejecuciones aisladas pasaron completas:
  API **240/240** + enlaces demo **3/3** y tenant demo **62/62**, sin fallos de
  aserción.

## Checkpoint comercial D4-V · 2026-08-07 (sesión 97)

- La landing ya abre el escaparate de la primera ola: L'Olivar, Pinada del Mar
  y Mar de Fondo se comparan por tamaño, resultado, recorrido y capacidad, con
  entrada a la web pública y al momento firma de cada demo.
- Las tarjetas consumen directamente las tres `miniatura.webp` aprobadas de
  los tenants. No se generó ninguna imagen, no se tocó la cola 8/14 de Mar de
  Fondo y desaparecen de las tres demos navegables las fotos prestadas de la
  propuesta Azahar.
- La comparación es HTML estático, bilingüe y honesta: Inicio, Gestión y Visión
  se describen por captación, operación, automatización y decisión; los
  prototipos y datos ficticios quedan rotulados en la propia sección.
- QA real a 1366/375: tres tarjetas y tres fichas comparativas, nueve enlaces,
  cero imágenes rotas, desborde, errores de consola o respuestas fallidas.
  Bundle compuesto: **11.523 enlaces / 358 HTML**. `pnpm check` **53/53**.
- **Desplegado en producción** por petición de Andreu: Worker
  `790dabd4-a300-4a08-8ef6-10e4425f6ffd`, sin migraciones D1 pendientes. Raíz,
  inglés, las tres webs y los dos gestores devuelven 200; QA en vivo 1366/375
  conserva 3/3 tarjetas, 3/3 comparativas, cero imágenes rotas y cero desborde.

## Checkpoint visual D3-V · 2026-08-07 (sesión 96)

- La instrucción más reciente de Andreu pide usar el generador integrado de
  OpenAI, una imagen cada vez y con pausa para no saturar. Dos nuevos intentos
  espaciados 15 segundos sobre `glamping-duna-interior` fallaron por red antes
  de producir bytes y quedan trazados en `fotos.estado.json`; no se lanzó la
  piscina ni se cambió silenciosamente a Higgsfield o a una API con clave.
- Mar de Fondo tiene **14 piezas / 7 tandas** definidas en
  `tenants/mardefondo/fotos.json`. Las cuatro primeras tandas quedan aprobadas:
  `hero-laguna`, `hero-horizonte`, `parcela-atlantica`, `bungalow-laguna`,
  `bungalow-laguna-interior`, `mobil-horizonte`, `mobil-horizonte-interior` y
  `glamping-duna`. El nuevo interior necesitó dos descartes (distribución vacía;
  arquitectura de villa incompatible con un mobil-home); el cambio automático
  a GPT Image 2 produjo la variante válida. Estado real: **8/14**. La siguiente
  sigue siendo `glamping-duna-interior` + `instalacion-laguna`.
- D3-V ya conserva tres capturas firma reproducibles y optimizadas:
  `portada-reserva-1366` (62 kB), `planning-1366` (40 kB) e
  `inteligente-1366` (69 kB). Al producirlas se detectó que el héroe Visión
  ignoraba `hero-laguna`; ahora usa la clave configurada si falta `hero-dia`.
- Los derivados de marca ya no dependen de trabajo manual: `pnpm fotos --
derive mardefondo` exige una fuente aprobada y genera miniatura 16:10 (62
  kB), OG 1200×630 (58 kB) y apple-touch icon (2 kB), con límites de peso que
  hacen fallar el comando antes de publicar un activo excesivo.

Diario de sesiones. Se actualiza al cerrar cada sesión con `/session-close`. La sesión siguiente empieza leyendo este fichero.

## Estado actual

- **Checkpoint activo: carril local no temático cerrado.** R0–R15, el portfolio
  12/12 y el frente F están completados; la conversión de una solicitud
  presupuestada vuelve a crear y enlazar una reserva real de forma idempotente.
- **Producto visible:** candidato compuesto construido y no desplegado. El
  gestor conserva datos, recorridos y accesibilidad verificados sin tematizarlo.
- **Siguiente trabajo autorizado:** solo un defecto o una decisión nueva y
  reproducible. Cliente, proveedor, credenciales, infraestructura, publicación
  y Camp Motor mantienen sus gates; temas, fotografía y media quedan fuera del
  encargo actual.

## Historial consolidado hasta la sesión 102 (no usar para elegir trabajo)

- **Sesión autónoma 102 (2026-08-08): los conceptos del catálogo ya tienen
  fotografía propia.** Montaña, Familiar y Parcela sustituyen los tres préstamos
  de Azahar por WebP originales de 1440×960 generados con el integrado de Codex,
  en tandas 2+1 y con revisión antes de continuar. El manifiesto conserva los
  prompts exactos y el estado conserva proveedor, huella y salida. ES/EN sirven
  las tres rutas locales; QA 1366/375 confirma carga, recorte, legibilidad, cero
  desborde y consola limpia. No se abre D5-V ni una cuarta demo. Sitio 71 páginas,
  build/typecheck verdes; el check global volvió a quedar condicionado por el
  runtime de Workers bajo concurrencia y sus paquetes se revalidaron hasta el
  límite ambiental descrito en el checkpoint. Sin deploy.
- **Sesión autónoma 100 (2026-08-08): la campaña de muestra ya desemboca en
  una reserva directa navegable.** ADR 0038 propuesto: búsqueda, display 300×250
  y feed 1080×1080 viven como HTML/CSS estático bilingüe, consumen la fotografía
  aprobada de Mar de Fondo y abren su mostrador con UTM ficticias diferenciadas.
  Cada pieza se rotula como ejemplo y el alcance común explica que no hay cuenta,
  medición ni cargo real. `qa:campana` pasa ES/EN a 1366/375 con teclado,
  movimiento reducido, imágenes y consola limpios. Bundle compuesto **11.531
  enlaces / 358 HTML**; el check global alcanzó **43/53** por timeout ambiental
  del tenant demo y su reejecución aislada pasó **62/62**. D4-V queda pendiente
  solo del vídeo/captura guiada. Sin deploy.
- **Sesión autónoma 99 (2026-08-08): D4-V ya dispone de una ficha comercial
  descargable y bilingüe.** ADR 0037 propuesto: un solo generador editorial lee
  el contenido que ya alimenta la landing y compone dos PDF de tres páginas con
  las miniaturas/capturas aprobadas, enlaces a cada recorrido, QR de contacto y
  alcance de demostración explícito. Las copias publicadas y de QA son idénticas,
  pesan **307 kB** por idioma y se sirven como `application/pdf`. La landing gana
  un CTA localizado sin JavaScript; QA 1366/375 en ES/EN confirma cero desborde,
  imágenes rotas o consola. Dos pases globales llegaron a **49/53** por la salida
  sin aserción del tenant demo bajo concurrencia; aislado pasó **62/62**, junto al
  pipeline **9/9**, portfolio **3/3**, sitio **71 páginas** y typecheck limpio.
  D4-V continúa por la campaña de muestra y el vídeo. Sin deploy.
- **Sesión autónoma 98 (2026-08-07): D3-V cierra su fotografía con el
  generador integrado y sin saturar el servidor.** Se generaron y aprobaron,
  en orden y una por una, `glamping-duna-interior`, `instalacion-laguna`,
  `instalacion-restaurante`, `instalacion-recepcion`, `entorno` y
  `textura-agua`; cada llamada quedó separada por ingest, revisión visual y una
  pausa explícita antes de la siguiente. El interior comunica cuatro plazas y
  baño compacto; la piscina, restaurante y recepción comparten arquitectura y
  operación plausibles; el entorno y la firma material cierran las cabeceras
  21:9. Estado **14/14**, sin staging, fallback ni proveedor externo. Build
  Mar de Fondo **25 páginas / 112 derivados**; pipeline **9/9** y dashboard
  **34/34**. Dos pasadas globales alcanzaron 46/53 y 51/53 tareas por timeouts
  bajo concurrencia, sin fallos de aserción; las reejecuciones aisladas pasaron
  API **240/240** + enlaces demo **3/3** y tenant demo **62/62**.
  D3-V queda cerrado; D4-V continúa por la ficha comercial/campaña. Sin deploy.
- **Sesión 97 (2026-08-07): el portfolio deja de ser una promesa y se puede
  elegir desde la landing.** ADR 0036 propuesto: D4-V se abre solo por su parte
  independiente de la fotografía pendiente. `PortfolioGallery` presenta las
  tres anclas con su escala (22/110/300 unidades), un recorrido de tres pasos y
  dos destinos reales; el comparador explica qué cambia en captación,
  operación, automatización y decisión sin convertirlo en una tabla técnica.
  Las miniaturas se importan desde cada tenant y Vite las versiona: un activo
  ausente rompe el build antes de publicar. La cinta de temas y su catálogo
  también dejan de enseñar Azahar como si fuera L'Olivar, Pinada o Mar de Fondo.
  Navegación y copy bilingüe actualizados. QA visual y funcional 1366/375
  verde; bundle **11.523 enlaces / 358 HTML**, portfolio **3/3** y `pnpm check`
  **53/53**. D4-V queda parcial: campaña, ficha descargable y vídeo siguen
  pendientes; D3-V conserva sus seis fotos. **Subido a `main` y desplegado** en
  producción como versión `790dabd4-a300-4a08-8ef6-10e4425f6ffd`; no había
  migraciones D1 pendientes.
- **Sesión autónoma 96 (2026-08-07): Mar de Fondo ya tiene derivados sociales
  ligeros aunque la red siga bloqueando su quinta pareja.** Se hicieron dos
  llamadas al generador integrado de OpenAI para `glamping-duna-interior`, de
  una en una y separadas por 15 segundos. Ambas fallaron antes de producir
  bytes; los fallos quedan registrados y no se pidió `instalacion-laguna`, no
  se ejecutó el fallback habilitado de Higgsfield ni se usó una API con clave.
  El relevo dentro de D3-V generaliza el pipeline con `derive`: valida que la
  foto fuente pertenezca al manifiesto y esté aprobada, compone un OG con scrim
  legible, genera la miniatura y rasteriza el favicon, todo de forma atómica y
  con techos de **320/180/40 kB**. Sobre `hero-laguna` produjo una miniatura de
  **62 kB**, un OG de **58 kB** y un icono de **2 kB**; inspección visual
  aprobada y build específico confirma dimensiones, hash y metadatos OG. Un
  test nuevo fija la receta y rechaza fuentes ajenas. Fotografía **8/14**,
  pipeline **9/9**, portfolio **3/3** y `pnpm check` **53/53**. Sin deploy.
- **Sesión autónoma 95 (2026-08-07): Mar de Fondo ya tiene material comercial
  real y recupera su fotografía de héroe.** Siguiendo la instrucción de Andreu,
  el modelo integrado de OpenAI se invocó solo para
  `glamping-duna-interior`, de una en una y con 15 segundos entre intentos. Los
  dos fallaron por red antes de producir bytes; se registraron y no se lanzó
  `instalacion-laguna`, Higgsfield ni una API de pago. El relevo dentro de D3-V
  creó un capturador reproducible contra el bundle compuesto real, a 1366 px,
  con reduced motion, fuentes cargadas, guardia de imágenes rotas y límite de
  450 kB. La inspección rechazó un primer encuadre de catálogo 3+1 y eligió tres
  piezas vendibles: portada con disponibilidad (**62 kB**), planning de **300
  unidades / 222 reservas a la vista** (**40 kB**) e Inteligente con fuentes,
  rango y decisión (**69 kB**), todas WebP. La captura descubrió un defecto real:
  el héroe instantáneo solo buscaba `hero-dia` y enseñaba Materia aunque
  `hero-laguna` estaba aprobado y configurado; el fallback compatible lo
  corrige sin cambiar Cala Sereno. QA visual en Chrome real, capturador **3/3**,
  pipeline **8/8**, portfolio **3/3**, bundle **11.307 enlaces / 358 HTML** y
  `pnpm check` **53/53**. Fotografía **8/14**; sin deploy.
- **Sesión autónoma 94 (2026-08-07): Mar de Fondo completa su cuarta pareja
  con un interior que sí cabe en un mobil-home.** `glamping-duna` pasa a la
  primera con `soul_location`: lona arena, plataforma baja, pino mediterráneo y
  paisaje de dunas sin lujo ficticio, personas, texto ni marcas. Las dos
  primeras variantes de `mobil-horizonte-interior` se rechazan por una estancia
  vacía que no comunica cinco plazas y por una arquitectura abierta de villa
  incompatible con el alojamiento; al segundo rechazo el pipeline activa GPT
  Image 2 por política. La tercera muestra una planta longitudinal plausible,
  cocina compacta, comedor, sofá y salida directa a la terraza. Estado **8/14**;
  los descartes quedan solo para auditoría local. El build específico genera
  **80 derivados WebP/AVIF**. QA en Chrome real sobre ambas fichas a 1366/375:
  respuestas 200, AVIF esperados cargados, cero desbordes, imágenes rotas,
  errores de consola o peticiones fallidas. Pipeline **8/8**, portfolio **3/3**
  y `pnpm check` **53/53**. Siguiente pareja sin lanzar:
  `glamping-duna-interior` + `instalacion-laguna`. Sin deploy.
- **Sesión autónoma 93 (2026-08-07): la tercera pareja fotográfica ya vende
  dos alojamientos completos.** `mobil-horizonte` pasa a la primera con
  `soul_location`: mobil-home reconocible, terraza longitudinal, toldo verde
  azulado y horizonte marítimo. El primer `bungalow-laguna-interior` se rechaza
  por una persona reconocible en primer plano y el segundo por subexposición y
  escala impropia de un bungalow para seis; al segundo rechazo el pipeline
  cambia solo y de forma trazable a GPT Image 2. Su tercera variante aporta
  cocina compacta, varias zonas de descanso, terraza sombreada y luz de laguna
  sin texto, marcas ni geometría imposible. Estado **6/14**; los descartes se
  conservan solo para auditoría local. El build genera **58 derivados
  WebP/AVIF**. QA en Chrome real sobre las fichas a 1366/375: ambos AVIF cargan,
  `scrollWidth === clientWidth`, sin imágenes rotas. Pipeline **8/8** y
  portfolio **3/3**. Siguiente pareja sin lanzar:
  `mobil-horizonte-interior` + `glamping-duna`. `pnpm check` **53/53**. Sin
  deploy.
- **Sesión autónoma 92 (2026-08-07): la segunda tanda fotográfica de Mar de
  Fondo entra en la demo con revisión real.** El circuito abierto reutiliza el
  fallback Higgsfield registrado sin borrar los dos fallos previos de Codex.
  `bungalow-laguna` pasa a la primera con `soul_location`; las dos primeras
  variantes de `parcela-atlantica` se rechazan por los números «5» y «16» y
  otra rotulación legible en los bolardos. Al segundo rechazo el pipeline cambia
  de forma trazable a GPT Image 2, cuya parcela amplia, operativa y sin texto
  legible queda aprobada. Estado **4/14**; descartes conservados solo para
  auditoría local y siguiente pareja sin lanzar. El build específico genera
  **36 derivados WebP/AVIF** de las fotos ya disponibles. QA en Chrome real a
  375/1366 sobre el bundle compuesto: ambas tarjetas cargan sus AVIF, cero
  desborde, errores de consola o peticiones fallidas. Pipeline **8/8**,
  portfolio **3/3**, `pnpm check` **53/53** y bundle **11.307 enlaces / 358
  HTML**. Sin deploy.
- **Sesión autónoma 91 (2026-08-07): Automatiza convierte incidencias en un
  relevo revisable, no en tickets automáticos.** La ruta existente gana dos
  tareas accesibles por pestañas: conserva la respuesta a reseña y añade un
  parte interno derivado del escenario canónico de Mar de Fondo. El fixture
  agrupa por área y explica periodo, severidad, cuatro fuentes y tres límites;
  sus tres incidencias cruzan **8 llegadas / 7 check-ins**, **27 min** de espera
  ficticia, **4 reservas sin señal / 2.748 € pendientes** y la unidad `BL-042`
  fuera de servicio. El borrador se puede editar, descartar, reabrir o dejar
  preparado para el relevo, pero no existe estado de enviado/publicado/ticket,
  llamada `/api` ni proveedor. Persistencia fail-safe y reset común cubren las
  dos tareas de Automatiza. La QA en Chrome real a 375/1366 confirma pestañas y
  foco de teclado, controles móviles de 44 px, cero desborde, persistencia,
  reset y cero respuestas fallidas; además detectó y corrigió una divergencia
  inicial entre el importe escrito y el calculado. **5 tests nuevos**;
  dashboard **34/34**, `pnpm check` **53/53** y bundle compuesto **11.307
  enlaces / 358 HTML**. Sin deploy.
- **Sesión autónoma 90 (2026-08-07): Inteligente explica antes de recomendar.**
  Mar de Fondo gana `/inteligente`, una pantalla exclusiva de su build que
  deriva del escenario una recomendación de ocupación para Bungalow Laguna:
  **152/826 noches, 18% de ocupación, 32 reservas y 25 web directas**. Expone
  periodo, tres fuentes, confianza media (64/100), limitaciones y un rango
  explícito de resultado (**22–28%**, impacto bruto estimado entre **−900 € y
  +1.600 €**). «Descartar recomendación» y «Preparar cambio» solo mutan estado
  local reversible; no existe transición de aplicar/ejecutar, llamada `/api` ni
  cambio de tarifa, cupo o reserva. El reset común la devuelve en vivo a
  revisión y el rótulo exacto advierte «Prototipo · no ejecuta cambios». Seis
  tests nuevos fijan derivación, céntimos/puntos básicos enteros, no ejecución,
  persistencia, reversibilidad y reset; dashboard **29/29**. QA real a 375/1366:
  cero desborde, controles de 44 px, teclado, persistencia, reset y cero red.
  Bundle compuesto **11.307 enlaces / 358 HTML**; `pnpm check` **53/53**. Sin
  deploy.
- **Sesión autónoma 89 (2026-08-07): la fotografía deja de depender de reintentos
  manuales.** Los dos fallos previos del backend integrado de Codex abren un
  circuit breaker explícito para el manifiesto de Mar de Fondo. El nuevo
  `foto-pipeline.mjs` limita la cola a una pareja, consulta la cuenta, reanuda o
  reutiliza trabajos idénticos, descarga con reintento acotado, valida proporción
  y tamaño, optimiza a WebP y registra proveedor/modelo/trabajo/SHA del prompt
  sin guardar secretos ni URLs temporales. Ningún resultado entra en la web:
  `.staging` exige `approve`; `reject` conserva el descarte y excluye su trabajo
  de futuras reutilizaciones. Dos rechazos de `hero-horizonte` con
  `soul_location` activaron GPT Image 2 dentro de Higgsfield; la tercera variante
  pasó revisión junto a `hero-laguna`. Estado **2/14**, primera pareja aprobada,
  siguiente pareja preparada pero no lanzada. Ocho pruebas cubren lote,
  circuito, modelos, descarte, argumentos, validación y redacción. `pnpm check`
  **53/53** y portfolio 3/3. ADR 0035 aceptado; sin deploy.
- **Sesión autónoma 88 (2026-08-07): Automatiza ya enseña supervisión, no
  magia.** El reintento obligatorio de `hero-laguna` volvió a fallar antes de
  producir bytes; la skill integrada impide degradar silenciosamente a CLI/API,
  así que la sesión avanzó al relevo pactado. Mar de Fondo gana
  `/automatiza`: una reseña ficticia activa un borrador editable y muestra las
  tres fuentes y los tres límites que explican la propuesta. La persona puede
  descartarla o **«Aprobar y dejar preparada»**; el estado final dice de forma
  persistente que no se publicó ni envió y el modelo de estados ni siquiera
  contiene una transición `sent`. El fixture vive fuera del componente, el
  estado es local/persistente y el reset común lo devuelve en vivo a revisión.
  La ruta y su módulo de portada/sidebar solo son alcanzables en el build Mar
  de Fondo; un dashboard normal o Pinada no los ofrece. **5 tests nuevos** fijan fuentes,
  límites, no-ejecución, reversibilidad, reset y parseo fail-safe. QA sobre el
  build real a 375/1366: cero desborde, CTA móvil 44 px, foco devuelto por el
  menú, aprobación persistente y reset sin recarga; cero errores de página.
  `pnpm check` **53/53** y bundle compuesto **11.307 enlaces / 358 HTML**.
  D3-V sigue por Inteligente, dos fixtures, fotografía y capturas. Sin deploy.
- **Sesión autónoma 87 (2026-08-07): Mar de Fondo ya une reserva y operación
  en el mismo escenario reversible.** El selector del dashboard deja de conocer
  solo Pinada y centraliza identidad, vuelta a la web, banner, transporte y
  reset por `VITE_DEMO_SCENARIO`. El nuevo escenario Mar de Fondo contiene
  **300 unidades exactas**, 240 reservas de agosto sin solapes, una unidad
  inactiva y `MF-DEMO-001` en `BL-008`; si la reserva se acaba de crear en la
  web, el gestor importa sus fechas e importe desde el mismo `localStorage`.
  Planning, ficha, búsquedas, llegada, check-in/check-out, cobro, devolución y
  log de pagos son mutaciones locales persistentes, sin API, D1 ni proveedor.
  El plano propio materializa las 300 celdas alrededor de laguna, playa,
  recepción y servicios; su build vive en `/demos/mardefondo/gestion/`. El
  banner público enlaza directamente al gestor y el reset borra ambos lados.
  Cinco pruebas fijan escala, firma, mapa, cobro y ausencia de solapes. QA del
  bundle a 1366/375: traspaso con importe propio, ficha, check-in, planning,
  **308 textos SVG**, cero errores y cero desborde. Bundle **11.307 enlaces /
  358 HTML**; `pnpm check` **53/53**, dashboard **17/17**. D3-V sigue abierto
  únicamente por fotografía, derivados/capturas y los prototipos explicables
  Automatiza/Inteligente. Sin deploy remoto.
- **Sesión autónoma 86 (2026-08-07): D3-V abre con una web Visión ya recorrible
  hasta el recibo.** Se crea `tenants/mardefondo`: identidad atlántica propia,
  contenido completo, cuatro familias y **300 unidades exactas** (150 parcelas,
  60 bungalows, 60 mobil-homes, 30 glamping), tres temporadas, 12 planes y cuatro
  extras en céntimos. `bookingTransport: 'demo-session'` instala antes de hidratar
  React un adaptador común derivado del catálogo del tenant: disponibilidad,
  cotización, extras, hold, titular, reserva, consulta, cambio y cancelación viven
  solo en `localStorage`; no llaman a Cala Sereno, D1 ni proveedor. Recorrido real
  a 375 px: 18–24 agosto → Bungalow Laguna → titular ficticio → `MF-DEMO-001` →
  recibo «Pago simulado · no se ha realizado ningún cargo», sin desborde ni
  respuestas `/api` de red. `/temas` deja de llamar concepto futuro a todo:
  L'Olivar y Pinada enlazan como demos y Mar de Fondo figura «En producción».
  La misma QA corrige la cabecera móvil del sitio: sus dos CTA de escritorio ya
  no duplican las acciones del menú ni provocan 34 px de desborde a 375 px.
  El bundle incorpora `/demos/mardefondo/` y comprueba **11.283 enlaces / 357
  HTML**. Guardia portfolio: 3/3 campings construyen; `pnpm check` **53/53**.
  Política de imágenes fijada y manifiesto de 14 piezas en 7 parejas; primera
  pareja bloqueada por error de red de `imagegen`, 0/14. ADR 0034 propuesto;
  planning/plano, operación, Automatiza/Inteligente y fotografía siguen
  pendientes. Sin deploy remoto.
- **Sesión autónoma 84 (2026-08-06): un camping sin fotos ya construye, y el
  bundle compuesto vuelve a estar verde.** La cola fotográfica de D2-V no es
  ejecutable en cloud (403 de política de egress, ver checkpoint), así que la
  sesión atacó lo que la bloqueaba de verdad: **`bundle:demo` estaba ROTO en
  `main`** desde la 83 y `pnpm check` no lo notaba. Dos aserciones del core sobre
  claves que la demo tiene y otro camping no —`images['hero-anochecer']!` en el
  404 y `plan('ut_std', …)!` en Tarifas, el id de Cala Sereno escrito a mano en
  una página compartida— tumbaban el build entero de Pinada del Mar. Ahora cada
  caja de foto ausente la ocupa **`<Materia>`**: un campo de color de la paleta
  del propio tenant, con variante clara/oscura elegida por el texto que lleva
  encima (7,2:1 y 7,5:1 medidos), nunca una foto de relleno. Además: **guardia
  nueva en `pnpm check`** que construye todos los campings del escaparate y falla
  nombrando al roto (verificada en rojo con la regresión exacta); **`/tarifas`
  dejaba de caber a 375px** en cualquier camping de nombres de temporada largos
  (`min-width:auto` de un hijo de grid, 108px de desborde, solo Pinada lo
  enseñaba); y el **plano decía «1 de 110 ocupadas · 1%» con 18 unidades
  ocupadas** — el resumen no contaba a quien está _en casa_ y mezclaba dos
  denominadores, defecto de Cala Sereno también. Ahora es `ocupacionDeLaNoche`,
  pura y con 4 tests en `packages/config`. Recorrido real verificado contra el
  bundle: solicitud `PM-WEB-001` → gestor → bandeja → planning (110 unidades, 82
  reservas) → plano, con **0 peticiones `/api`**; 8 páginas × 2 anchos sin
  desborde ni imágenes rotas. Bundle **10.670 enlaces / 333 HTML**. `pnpm check`
  **49/51**: rojo ambiental conocido (`reset.test.ts` hace segfault de workerd,
  CONTINUA §5) y el build de web **cancelado en cascada** por turbo — aislado
  pasa, 235 páginas. Sin deploy remoto.
- **Sesión autónoma 83 (2026-08-06): D2-V queda funcionalmente preparado y
  visualmente en checkpoint.** Se crea `tenants/pinadamar` con voz/paleta
  costera propia, catálogo de **110 unidades** y web Gestión `tier: 2`. El nuevo
  transporte tipado `demo-session` guarda una solicitud ficticia solo en
  `localStorage` y enlaza con un segundo build del mismo dashboard bajo
  `/demos/pinadamar/gestion/`; el build normal conserva sesión/API/D1 sin
  cambios. El adaptador determinista contiene **42 solicitudes / 4 idiomas, 84
  estancias de agosto, 1 unidad inactiva**, llegadas/salidas, error/carga/vacío,
  rechazo de solape y plano propio con mar al este, acceso, dos calles, anillo
  de bungalows y servicios. El recorrido headless completa portada → solicitud
  → contactada → convertida → planning con fecha/unidad → ficha, con **0
  peticiones `/api`**. Reset, PII ficticia y cero mensajes quedan visibles. El
  bundle compuesto y su link-check conocen web+gestor Pinada; `pnpm check`
  **50/50**. El generador de imágenes falló por red antes del primer resultado:
  cola detenida en **0/10**, sin reintento ni material de L'Olivar. Por ello no
  se construyó el bundle Pinada completo, no hubo QA visual/capturas y D2-V no
  está cerrado. Medición automatizada no visual: identidad/contenido 0,10 h,
  tenant/config 0,08 h, dataset/plano 0,18 h, unión web↔gestor 0,17 h, QA
  funcional 0,10 h e integración 0,05 h (**~0,68 h**); fotografía y QA visual
  quedan fuera. Sin deploy remoto.
- **Última sesión autónoma (82, 2026-08-06): D1-V convierte L'Olivar en la
  primera demo vendible del portfolio.** `tenants/olivar` representa Inicio
  sobre el carril técnico `tier: 1`: español, 18 parcelas, 4 tiendas, identidad
  seca del Maestrat y contenido completo sin `__TODO__`. Los ocho originales
  fotográficos se validaron en cola 2×2 y se conservaron localmente fuera de
  Git; la web usa derivados
  optimizados, favicon/monograma, apple touch icon, OG, miniatura y tres
  capturas (`home-375`, `tienda-1366`, `confirmacion-375`). El contrato común
  gana `enquiryTransport?: 'persisted' | 'demo'`: ausente sigue persistiendo
  como antes; `demo` reproduce éxito/error/antispam, preserva el alojamiento
  elegido, devuelve foco y resumen copiable y hace **cero peticiones de red**.
  El bundle compuesto incorpora `/demos/olivar/`, corrige fuentes bajo
  `BASE_PATH`, excluye `*-source.*`, publica `noindex`/robots cerrado y no
  genera rutas de motor. QA real a 375/1366: cero desborde, imágenes rotas,
  fallos de red o consola; reduced motion `none`, fuentes cargadas, contraste
  mínimo de acción **5,79:1**. Bundle: **10.302 enlaces / 318 HTML**; `pnpm
check` **48/48**. Medición de esta ejecución automatizada: identidad/contenido
  0,12 h, configuración 0,08 h, interacción 0,07 h, QA 0,12 h e integración
  0,03 h (**~0,42 h**); excluye la generación previa de los ocho PNG fuente y
  no debe usarse aún como coste humano. **Siguiente objetivo: D2-V, Pinada del
  Mar / Gestión.** Sin deploy remoto.
- **Última sesión autónoma (81, 2026-08-06): D0-V convierte la primera ola en
  un encargo de producción.** L'Olivar representa Inicio, Pinada del Mar
  Gestión y Mar de Fondo Visión. `docs/CONTRATO-VISUAL-OLA-1.md` fija para las
  tres ICP, problema, promesa, CTA, historias de 5/8/12 minutos, pantallas,
  dirección de arte, activos y momentos capturables. Cada interacción queda
  asignada a SSG/config, fixture/seed, adaptador demo o dataset compartido, con
  rótulo exacto y ficha de activación productiva. La auditoría conserva
  estructura, fuentes y capturas Logic2B; prohíbe reciclar fotos de Cala o
  activos de Azahar. Siguiente objetivo: **D1-V, producir L'Olivar** como build
  comercial 0 sobre el carril técnico tier 1 en `/demos/olivar/`, sin motor,
  D1 ni credenciales. Cambio documental; sin deploy.
- **Mandato demo-first (sesión 80, 2026-08-06): el escaparate pasa a ser el
  producto inmediato.** Frontend, demos y backend de demostración tienen
  prioridad sobre CLI, aprovisionamiento, integraciones o endurecimiento que un
  prospecto no puede ver. El portfolio se construirá en olas **3 → 6 → 12**:
  Inicio, Gestión y Visión primero; cada una con recorrido vendible y soporte
  mínimo mediante seed, fixture, adaptador o D1 compartida. Producción queda en
  un dossier de activación por capacidad y solo se ejecuta con cliente. Fuentes
  alineadas: estrategia, research competitivo, dossier de producción,
  `CLAUDE.md`, `docs/EQUIPO.md`, CONTINUA, ROADMAP, Frente D/E, BACKLOG y
  SIGUIENTE-SESION. D0-V queda cerrado en la sesión 81.
- **Última sesión autónoma (79, 2026-08-06): el historial de reservas ya
  tiene antigüedad real.** Las 3.426 reservas del seed dejan de nacer todas en
  el ancla: web se crea entre uno y seis meses antes, teléfono entre dos días y
  seis semanas, y mostrador el día de llegada o en los últimos tres días para
  una estancia futura. Un PRNG propio conserva intactos ocupación, huéspedes y
  cobros. Sobre 23 anclas se exige que ninguna alta sea futura/posterior a la
  llegada, que web adelante a teléfono, que mostrador quede junto a la llegada
  y que existan >180 fechas distintas. D1 local: web 2.794 reservas / 400 fechas
  / 115 días medios; teléfono 455 / 167 / 47; cero fechas imposibles.
  `pnpm check` **46/46**, tenant demo **62/62**, bundle compuesto **9.994
  enlaces** y navegador sobre ficha histórica **1/1**. Sin deploy remoto.
- **Última sesión guiada (78, 2026-08-05): Frente E, E0–E2 cerrados.** ADR 0033
  aceptado y landing comercial reescrita como Inicio → Gestión → Automatiza →
  Inteligente, con cuotas **49/149/249/399 €**, altas, resultados y estado real.
  El héroe vende la progresión; el selector pregunta qué necesita resolver el
  camping; `/precios/`, FAQ y las tres guías del dueño ya no contradicen la
  oferta. Inicio declara alta 0 €, un idioma, formulario directo a recepción y
  12 meses/490 € anual; sin PMS, dashboard, D1 ni histórico. Automatiza figura
  “En desarrollo” e Inteligente “Roadmap”. Verificado `site` typecheck/build,
  navegador a 1366/375 px, cero desborde y cero errores de consola. **E3 queda
  pendiente:** construir el tier 0 y su entrega de formulario antes de escalar
  campañas. Sin deploy remoto.
- **Última sesión autónoma (77, 2026-08-04)**: M6 cierra el Frente M reduciendo
  la entrada del gestor de **785,80/234,75 kB a 533,71/170,04 kB min/gzip**.
  Las 14 pantallas son chunks de ruta con `lazyRouteComponent`, fallback
  accesible y precarga por intención; Planning (17,26 kB gzip) y Plano (8,47
  kB) solo viajan al abrirlos y quedan cacheados. El build conserva un
  manifiesto y falla si la entrada vuelve a ≥200 kB gzip o esas dos pantallas
  dejan de ser dinámicas. Las fuentes pasan de 15 activos a cuatro WOFF2
  latinos. Playwright nuevo comprueba peticiones reales y caché; el puerto E2E
  es configurable porque 8787 puede estar ocupado por otro proyecto local.
  `pnpm check` **46/46**, bundle compuesto **9.286 enlaces**, regresiones
  móviles previas **7/7** en dos Workers y regresión M6 **1/1**. Sin deploy
  remoto: producción queda en la sesión 76.
- **Última sesión autónoma (76, 2026-08-04)**: M4 sustituye bajo `md` el tape
  chart comprimido por una agenda móvil real de día/semana. Cada estancia y su
  unidad son objetivos independientes de al menos 44 px; ficha y plano abren
  desde la fila, con retorno de foco. Fechas y unidad se cambian mediante un
  formulario explícito de 16 px que reutiliza `requote`/`move`: precio,
  disponibilidad y solapes siguen bajo autoridad del servidor. Los filtros
  conservan scroll local y el documento no desborda a 320/375/430. Desde `md`
  solo se monta el tape chart original, incluidos sus gestos y controles de 28
  px. Se cierra además B1: el último selector de fecha crudo pasa a `Input` con
  nombre accesible. Playwright móvil queda **7/7 verde en procesos limpios**
  (la ejecución única agota el rate limit demo después del quinto spec);
  `pnpm check` **46/46 verde**. **Desplegada después por petición de Andreu**
  junto con la deuda de 67–70 y 72–75; producción verificada con cache-buster
  en portada, demo, gestor y `/api/health` (versión Cloudflare
  `cfe8405b-810a-4a1f-9f27-aaef7852b88e`).
- **Última sesión autónoma (75, 2026-08-04)**: M5 convierte el plano móvil en
  una superficie táctil sin alterar el escritorio. Bajo `md` entra ampliado 8×
  y centrado en una unidad: los rectángulos auditados en 10×7 px superan ahora
  44×44 a 320/375/430; seleccionar vuelve a centrar y «Ajustar» recupera el
  recinto completo. Los controles, fecha y acciones alcanzan 44 px y el campo
  usa 16 px. Un dedo vertical conserva `touch-action: pan-y`; el modo explícito
  «Mover plano» activa `touch-none` solo mientras se necesita. Unidades libres,
  bloqueadas o inactivas abren ficha inferior con foco/retorno; reservas
  conservan la ficha completa de M1. La prueba real descubrió y corrigió que el
  estado derivado `inhouse` se resaltaba pero no abría reserva. Playwright M1–M5
  **6/6 verde** contra bundle compuesto + D1; `pnpm check` **46/46 verde**. Sin
  deploy: producción suma la 75 a la deuda manual de 67–70 y 72–74.
- **Última sesión autónoma (74, 2026-08-04)**: M3 hace operables con una mano
  Llegadas, Salidas y Solicitudes sin rebajar la densidad de escritorio. La
  fecha, navegación del día, filtros, filas, contactos y cambios de estado
  alcanzan 44 px bajo `md`; check-in/out conserva a la vista huésped, estado y
  saldo en una rejilla que cabe a 320 px. El check-out directo pide ahora la
  misma confirmación que la ficha, avisa del saldo pendiente y devuelve el foco
  al disparador; para que Radix pudiera hacerlo, `BotonRecepcion` pasó a exponer
  su `ref`. Los filtros de Solicitudes permanecen en una línea con scroll local,
  no de página. Playwright contra bundle compuesto + D1 recorre 320/375/430 y
  escritorio: la regresión M3 y las de M1–M2 dan **5/5 verde**. `pnpm check`
  **46/46 verde**. Sin deploy: producción suma la 74 a la deuda manual de 67–70
  y 72–73.
- **Última sesión autónoma (73, 2026-08-04)**: M2 ordena la portada móvil por
  urgencia —KPIs → entradas/salidas/solicitudes → módulos— y conserva en
  escritorio la composición anterior. El shell gana botón táctil de búsqueda
  global de 44×44 px conectado a la misma paleta que `⌘/Ctrl+K`; campo enfocado
  al abrir y retorno al botón al cerrar. El menú usa por fin un `SheetTrigger`
  real, entra por Inicio, vuelve a la hamburguesa con Escape y eleva rutas,
  tema, salir y cierre a 44 px bajo `md`. `Button` admite `ref` sin romper
  `asChild`. Playwright contra bundle compuesto + D1 recorre 320/375/430 y
  escritorio, además de la ficha móvil existente: **4/4 verde**. `pnpm check`
  **46/46 verde**. Sin deploy: producción suma la 73 a la deuda manual de
  67–70 y 72.
- **Última sesión autónoma (72, 2026-08-04)**: M1 convierte la ficha de reserva
  en un **Sheet móvil a pantalla completa** bajo 768 px sin alterar el panel
  lateral de escritorio. A 320/375/430 px: ancho exacto, cero desborde, cabecera
  pegajosa, cierre/acciones ≥44 px, campos ≥16 px, trampa de foco, Escape y
  retorno a la fila origen. La prueba real detectó que la limpieza de Radix
  pisaba el foco del padre; la ficha captura ahora el origen y lo restaura tras
  el desmontaje. `NAV_GROUPS` gana rol mínimo: demo/readonly/recepción ya no ven
  `/parte` ni en sidebar ni en portada; manager/owner sí, y el 403 del servidor
  sigue intacto. `pnpm check` **46/46 verde**, UI **57/57**, dashboard **7/7** y
  Playwright contra bundle compuesto + D1 **3/3**. Sin deploy: producción suma
  la 72 a la deuda manual de 67–70.
- **Última sesión autónoma (71, 2026-08-04)**: M0 cierra la primera auditoría
  móvil del gestor con contrato en **ADR 0031** e informe reproducible en
  `docs/AUDITORIA-MOVIL.md`. Bundle real + D1 del seed, roles demo/recepción/
  gerencia y 320/375/430 px: cero desborde global en las cinco pantallas base,
  pero seis P1 de interacción — búsqueda sin entrada táctil, ficha fija de 360
  px (40 px de desborde a 320), check-in/out 36×28, unidades del plano 10–17 px,
  tape chart sin agenda móvil y `/parte` ofrecido a roles que no pueden abrirlo.
  Orden medido de ejecución: **M1 → M2 → M3 → M5 → M4 → M6**. Es una entrega
  documental, sin deploy nuevo; producción sigue esperando las sesiones 67–70.
  `pnpm check` **45/45 verde**.
- **Última sesión autónoma (70, 2026-08-04)**: el despliegue de la demo ahora
  comprueba el **bundle compuesto** antes de migrar o publicar: recorre los
  enlaces navegables internos de landing, web `/demo/` y gestor `/admin/` y
  falla señalando el HTML de origen si alguno no resuelve. El barrido real
  validó **9.286 enlaces en 304 páginas**; tres tests nativos fijan rutas entre
  superficies, rutas rotas y el fallback `404.html`. Código en `main`, pendiente
  del mismo deploy manual con credenciales que las sesiones 67–69. `pnpm check`
  queda bloqueado solo por el fallo ambiental intermitente de workerd/Miniflare
  (`node:vm`/`EADDRNOTAVAIL`) al ejecutar API y tenant demo en paralelo; el test
  API aislado (237 + 3) y las builds del bundle compuesto quedaron verdes.
- **Repriorización comercial de Andreu (2026-08-03, desplegada 2026-08-04)**:
  al terminar el modo demo, manda el **portfolio de demos** para vender; el alta
  real y el registro exhaustivo de intervenciones pasan detrás. Nueva página
  `/precios/` es/en con altas 1.490/2.490/4.900 €, cuotas 69/119/249 €, packs y
  bolsas; modelo y referencias en `docs/TARIFAS-LOGIC2B.md`, a recalibrar con
  horas por bloque de las tres primeras demos. Azahar conserva la propuesta y
  baja sus activos de ~15 MB a ~4,1 MB. Deuda SEO barata cerrada (OG del tenant,
  `x-default` en sitemaps, `BreadcrumbList` en guías). BACKLOG gana el Frente M
  completo para el dashboard móvil. `pnpm check` 45/45 verde.
- **Última sesión autónoma (69, 2026-08-03)**: Cala Sereno muestra dos
  unidades fuera de servicio reales (`C-10` y `MH-04`) en Inventario, Planning
  y Plano, sin reservas asignadas ni cupo ficticio. Código en `main`, pendiente
  del mismo deploy manual con credenciales que las sesiones 67 y anteriores.
- **Fase 11 (endurecimiento)**: 🟨 **PARCIAL** (ADR 0026, 2026-07-21, sesión 37). Cuatro bloques cerrados de verdad: **aislamiento verificable por barrido** (42 rutas, dirigido por `app.routes` — una ruta nueva queda cubierta el día que se escribe, y la entrega falla si alguien añade una sin declarar), **RGPD operativo** (export del interesado, supresión que anonimiza y **niega con fecha** cuando corre el plazo del RD 933/2021, limpieza del PII copiado en `audit_log`, consentimiento con fecha y versión, retención en cron incluida la del nivel 1, y aviso legal + privacidad + cookies sin banner porque no hay seguimiento), **observabilidad mínima** (`onError` — antes se devolvía 500 con el stack trace en el cuerpo—, log estructurado, aviso con cortafuegos, cron que falla por tarea) y **copias** (sin pipeline propio, por decisión: comando `pnpm export:tenant` probado + runbook de restauración con verificación de invariantes). El criterio que ordenó la fase: **la página publicada es la especificación** — la ficha técnica de C6 hacía cuatro afirmaciones falsas y ninguna sobrevive. **DESPLEGADA y verificada en producción** (versión `f4288603`, migración `0005_rgpd.sql` aplicada en la D1 remota). **Queda**: verificar en vivo el bloque "Protección de datos" de la ficha de cliente (necesita sesión logueada — 5 min de Andreu), parte de viajeros (fase propia), Sentry/Logpush y ensayo real de restauración (credenciales), pruebas de carga (falta objetivo declarado), y el primer cliente.
- **Frente C (acabado profesional: visual + workflow + docs)**: abierto 2026-07-20. Prioridad declarada por Andreu: **la interfaz, en modo fake** — todo previsto y pensado, pero lo que manda es que el cliente vea algo bien pensado y profesional. Regla dura: "fake" se resuelve en el **seed**, nunca con mocks en el cliente. Contrato completo en **[`docs/FRENTE-C-ACABADO.md`](docs/FRENTE-C-ACABADO.md)** (8 fases C0–C7 + bugs registrados). **C0 ✅** (ADR 0019), **C2+C3 ✅** (ADR 0020) y **C7 ✅** (ADR 0021). C0: HMR desbloqueado y seed denso (planning 25 → **346 reservas a la vista**, agosto al 86%). C2+C3: el DS conectado (Radix + 16 primitivos, 43 → 2 `<button>` crudos, rename de tokens cerrado) y los estados (0 `<p>Cargando…</p>`, error boundary por ruta, toasts con deshacer, confirmación en las 3 acciones destructivas). **C7: el plano del camping** — geometría pura y testeada en `packages/config` (`expandPlano`/`autoPlano`/`unitStateOn`, 18 tests), descriptor declarativo en `tenants/demo/plano.ts` → `modules.plano` (columna JSON existente, **cero migración D1**) → `GET /api/admin/map` genérico → `CampingMap` (SVG, pan/zoom, colores `--lc-status-*` del planning) + página `Plano` con estado en vivo por fecha, click→ficha y salto plano↔planning. **C4 ✅** (ADR 0022): **el workflow de recepción** — check-in como campo `checked_in_at` (**no** un estado `in_house`: un estado nuevo caería fuera de ~8 filtros por `status` y olvidar uno es un doble-booking; el campo no toca ninguno y "en casa" se deriva), migración aditiva `0004`; huéspedes y documentos editables (base del parte de viajeros), "cobrar todo lo pendiente" con guarda ≤pendiente, crear/levantar bloqueos desde planning y plano, ⌘K (`cmdk`) y rutas `/reservas/$id` `/clientes/$id`; token nuevo `--lc-status-inhouse` (verde AA 5.5:1) en barra/plano/leyenda + `inhouse` en `unitStateOn`. **C1 ✅** (ADR 0023): **el planning como pieza de exhibición** — gesto horizontal (mover arrastrando manteniendo noches, diagonal fecha+unidad en una acción, estirar por los bordes), re-cotización SIEMPRE en servidor (`requote` dry-run + `move` con candado `expectedTotalCents`; desglose nuevo en diálogo antes de confirmar; rechazo explicado; Deshacer; teclado ←/→ y Shift+←/→), crear arrastrando sobre celdas libres (alta precargada, `preferredUnitId`), bandeja "sin asignar" arrastrable, línea de HOY + continuación + franja de temporada + filtros/búsqueda dentro del planning, **C1.5 cerrado** (mapa `--lc-status-*` definitivo con test AA de 27 aserciones y pareja `.dark` → **modo oscuro conectado**, toggle claro/oscuro/sistema sin FOUC), y finde en UN gradiente por lienzo (geometría pura en `packages/config`). Verificado en vivo: 22/22 gestos con Playwright contra el bundle real. **C5 🟨 PARCIAL** (ADR 0024, 2026-07-21): auditoría reveló que las 6 fotos que hacían falta para **C-BUG-5** ya estaban generadas desde sesión 8 (prompts ya cumplen el contrato de arte — lista definitiva cerrada, no hacía falta generar nada nuevo); el hueco es solo de **descarga**, bloqueada por la política de red del contenedor (`cloudfront.net`, 403, 3ª sesión consecutiva con el mismo bloqueo) — script listo (`pnpm --filter @tenant/demo fetch:fotos`) para ejecutar desde un entorno con esa salida. **C5.2 ✅**: capturas reales del planning y del plano (bundle `vite build` + stub Node con datos del generador de seed puro `generateSeed(2026)`, sin workerd, mismo patrón que C1) reemplazan la maqueta CSS de la landing (cierra BACKLOG [B3]) y OG image de marca Logic2B (1200×630, tokens oklch + isotipo, sin fotografía del tenant). **C6 ✅** (ADR 0025, 2026-07-21) — **la documentación, ÚLTIMA fase del frente: el Frente C queda CERRADO.** Resuelve además la decisión pendiente **B-ii** y cierra **B4** del Frente B. **21 páginas** en `camp.logic2b.com/docs/`: **guía de recepción (14 páginas, una tarea por página)** en el orden de un día real de mostrador (entrar · llegadas/salidas · check-in · cobrar · leer el planning · mover/estirar · plano · alta manual · huéspedes y documentos · check-out · bloqueos · solicitudes · ⌘K · qué hacer cuando algo falla), **guía del dueño (3)** — los niveles como escalera, qué cambia y qué **no** al subir (dominio, web, SEO e histórico se mantienen), qué aportar en el alta — y **ficha técnica (4)** — arquitectura, DNS, correo (SPF/DKIM/DMARC con el aviso del SPF duplicado), datos/aislamiento/RGPD/backups/portabilidad. **B-ii se resolvió por una observación que reordena el criterio**: la documentación es del **producto**, no del tenant — se escribe una vez y sirve a todos los campings, así que el coste por camping ya era cero en las tres opciones y la decisión se juega en **coste fijo de construcción con 6h/semana**, donde `apps/site` gana solo: hereda tokens, fuentes, isotipo, i18n y SEO, y sobre todo **el pipeline de despliegue** (`apps/site/dist` **ya es** el directorio de assets del Worker del tenant → una página nueva se despliega sin tocar nada). Starlight exigía un tercer build y re-tematizar su DS entero; `ui.logic2b.com` está detrás de **B-iii**, sin decidir. Corolario descartado explícitamente: **docs servidas por cada tenant**, que sí habrían multiplicado el alta — el dashboard enlaza con **URL absoluta**. Prosa en Markdown / cromo en i18n, con el idiom que el repo ya usaba para el blog (`import.meta.glob` + `{slug}.{lang}.md` + fallback **por página**, avisado en pantalla, nunca en silencio). Idiomas: cromo es/en/ca, **prosa es**. Enlazada desde la landing (nav, pie y bloque propio tras "niveles") y desde el dashboard con **`BotonAyuda`** en las **12 barras de pantalla**, con el mapa pantalla→página en un módulo único (`apps/dashboard/src/lib/ayuda.ts`). **`pnpm check` verde 42/42** (esta sesión corrió en la máquina de Andreu, sin el segfault de workerd del contenedor cloud). **B4 absorbida en C6 y cerrada.**
- **Frente B (marca Logic2B + landing de producto + docs)**: abierto 2026-07-19. **B0-lite + B3 + B1 + B2 HECHOS** (ADR 0016, 0017, 0018). **B2 (ADR 0018, 2026-07-20)**: web de tenant alineada al esqueleto del DS Logic2B **sin reskin** — la identidad mediterránea (ADR 0006) intacta. (1) Escala de radios derivada, base **4px** + `calc()` (`--lc-radius-sm/md/lg`) en `_template`+`demo`, expuesta a Tailwind; se propaga a toda la web por el token del tenant (antes 2px sueltos). (2) Ritmo de bloques tokenizado (`--spacing-section`/`py-section`) en el ritmo canónico (Home + secciones finales), cambio de valor cero. (3) Firma discreta **"powered by Logic2B"** en el pie: isotipo compartido vía `LogoMark.astro` (SVG, sin runtime React), `currentColor`, enlaza a la landing; `footer.poweredBy` (aria/title) en los 6 idiomas ×`_template`+`demo`. Convergencia de fuentes CERRADA en BRAND.md §3: web=Clash Display, producto=Space Grotesk. Verificado con Playwright contra el dev real (home nivel 3, pie con firma, 1366px y 375px). `pnpm check` verde (41/41). Pendiente **B4** (docs) + remate: re-medir Lighthouse ≥95 en producción (no se añaden fuentes ni JS). B1 (ADR 0017): dashboard reskinneado a Logic2B UI — `packages/ui` es ya librería React (cn + Button/Card/Badge/LogoMark shadcn); shell = sidebar agrupada plegable con isotipo; tokens/fuentes del DS; planning con el mapa de colores aprobado. Verificado en vivo. Remates en BACKLOG (rename literal de tokens, off-canvas móvil). **B0-lite + B3 HECHOS y en vivo** (ADR 0016): `packages/ui` con tema/tokens/isotipo Logic2B; `apps/site` = landing de producto (es/en/ca) sirviéndose en `camp.logic2b.com/`; demo movida a `camp.logic2b.com/demo/` (routing por prefijo en el mismo Worker, `localePath` consciente del `base`); `POST /api/leads`. Deploy manual con `pnpm --filter @logic-camp/api deploy:demo` (ahora compone site+web+dashboard, migra y despliega). Pendientes B1 (dashboard→Logic2B UI), B2 (web de tenant), B4 (docs) + remates en BACKLOG. Contrato de marca en `docs/BRAND.md`.
- **Fase actual**: 10 🟨 PARCIAL (ADR 0013 — reset nocturno + conmutador de nivel 1/3 + banner de demo hechos y verificados contra el Worker real; **ADR 0029, sesión 50: el acceso al dashboard sin registro queda CERRADO** — rol `demo` fail-closed en el nivel 0, excepción por acción para los gestos del planning y check-in/out, barrido sobre `app.routes`, puerta en `tenants/demo/worker.ts` y botón de restablecer; queda Cloudflare Web Analytics —credenciales— y `ui.logic2b.com`/Storybook —su propio objetivo de fase—). BACKLOG 7.x y 8.x cerrados en la misma sesión cloud (ADR 0014 + ADR 0015): cron de aviso de reservas `pending` colgadas y recordatorio de llegada al huésped, ambos genéricos para cualquier tenant con pagos (no solo la demo). Fase 9 sigue 🟨 PARCIAL detrás (ver ADR 0012 — solo queda el tenant de prueba real, bloqueado por credenciales de Cloudflare, no por código) · Siguiente: sesión con Andreu presente para el primer alta real con `--apply`, o seguir cerrando remates de Fase 10. Antes, en local: redeploy demo (`pnpm --filter @logic-camp/api deploy:demo` — el `main` de `tenants/demo/wrangler.jsonc` ahora es `./worker.ts`, el script de deploy no cambia), descargar fotos Higgsfield (`pnpm --filter @tenant/demo fetch:fotos`, script listo desde ADR 0024 — mismo bloqueo de red que sesiones 8 y C5), re-audit Lighthouse en producción.
- **Docs de cliente**: `docs/FUNCIONALIDADES.md` (sesión 14, al día con Fase 8 en sesión 19) — actualizar con cada funcionalidad nueva.
- **DESPLEGADO en la sesión 41 (2026-07-22)**: la landing atmosférica (ADR 0027), las 6 fotos del tenant y los cambios de dashboard de la sesión 38 están **por fin en producción** (`camp.logic2b.com`, versión `1d2c2f37`). Verificado en vivo: rutas es/fr/de/nl + `/demo/` 200, 0 imágenes rotas, 0 errores de consola; **Lighthouse contra producción desktop 98 / móvil 96** (LCP 1,0s / 1,8s — la foto del héroe no penaliza: es un `<img fetchpriority="high">`, sin preload); y la supresión RGPD de Fase 11 verificada logueada (`DELETE /guests/gst_044 → 409 {retention_hold, until:2029-08-18, basis:traveller_registry}` + aviso persistente con fecha exacta, no toast). **Pendiente**: desplegar la cuarta guía "gestión" añadida esta misma sesión (ver abajo) — NO está en producción.
- **Parte de viajeros (ADR 0028, sesión 43, 2026-07-23)**: 🟩 **IMPLEMENTADO y DESPLEGADO a la demo** (sesión 44, 2026-07-24), sin verificar contra el webservice real. Andreu validó el ADR (estado `aceptado`). Vertical completo: migración D1 **0006** aditiva (5 columnas nulables: `guests.sex/second_surname/doc_support_number/kinship` + `bookings.payment_kind`), paquete PURO **`packages/hospedajes`** (`buildParte` valida y devuelve issues por reserva/campo · `serializeParte` XML determinista y escapado —estructura provisional, honesta: los nombres/códigos exactos del XML se cierran contra la espec oficial cuando haya credenciales— · `HospedajesTransport` con `manualTransport` (descarga, opera hoy) y `sesTransport` (webservice real escrito, **NO verificado** —como Stripe/Redsys—), **22 tests puros**), config `tenants.modules.hospedajes` (schema Zod en `packages/config`) + secrets SES en el Worker, rutas `GET /hospedajes/parte?date=` y `POST /hospedajes/enviar` (con `audit_log`) **recogidas solas por el barrido de aislamiento** (46→48), acción `set_payment_kind`, pantalla **Parte de viajeros** en el dashboard + ficha de huésped ampliada + guía `gestion/parte`, y **seed con datos SES reales** (cero mocks: DNI+soporte para españoles, ~1/6 con un dato a falta para enseñar el estado "faltan datos"). **Corrección clave contra la espec** (no de memoria): el campo real es **"número de soporte del documento"**, no la "fecha/país de expedición" que el ADR anticipó. **Bug de contraste** cazado en la verificación en navegador y arreglado: los tokens `--lc-status-*-fg` son texto para el chip, no para el fondo de página (ilegibles en oscuro) → avisos en `foreground`/`muted-foreground` con el ámbar solo en el icono, AA en claro y oscuro. **Pendiente**: verificar contra el webservice SES real (credenciales + código de establecimiento), cerrar campos/códigos contra la espec oficial, traducir la prosa de la guía.
- **DESPLEGADO en la sesión 42 (2026-07-23)**: la cuarta guía "gestión" (informes/tarifas/ajustes) + los `?` del dashboard, en producción (`camp.logic2b.com`, versión `e3113865`). La deuda "desplegar guía gestión" de la sesión 41 (línea de arriba) queda **cerrada**.
- **DESPLEGADO en la sesión 44 (2026-07-24)**: el **parte de viajeros** (ADR 0028) en producción (`camp.logic2b.com`, versión `105e5097`, migración `0006_hospedajes.sql` aplicada en la D1 remota). Verificado logueado en `/admin/#/parte`: lista de llegadas con datos reales, banner "faltan datos en N campos" + aviso por fila, `<select>` de forma de pago, "Descargar XML" (modo manual, sin botón "Enviar" porque la demo no tiene secrets SES — correcto), `?`→`/docs/gestion/parte/` (200), web pública 200. **Hallazgo que costó la mitad de la sesión**: la demo **NO tiene reseed remoto automático** (el "reset nocturno" de las notas **no existe** — ni `scheduled()`, ni `deploy-demo.yml`, ni script; ver [[demo-sin-reseed-remoto]] y BACKLOG `[infra]`); el deploy solo lleva **schema**, no **datos**, así que la pantalla salió "no activado" hasta re-sembrar la remota a mano (wipe **hijos→padres** por `--command` porque D1 **sí** fuerza FKs y el `--file` masivo hace `fetch failed`, preservando `d1_migrations`, + `seed --file` que es INSERT-only). Reseed OK: 26.561 filas, `modules.hospedajes.enabled=1`, 2032 reservas/huéspedes restaurados.
- **HECHO en la sesión 45 (2026-07-24)**: **`pnpm db:seed:remote`** — reseed remoto de la demo FK-safe en un comando, cerrando la deuda `[infra]` que costó media sesión 44. Plan puro y testeado (`tenants/demo/remote-seed.ts`, reusa `DELETE_ORDER` del reset local; 6 tests) + shell fino bajo **doble candado** (`--apply` + `LOGIC_CAMP_ALLOW_REMOTE_SEED=1`, calcado de `runInfraPlan`), dry-run por defecto. El `--apply` real contra la remota queda para Andreu con credenciales (nunca ejecutado desde cloud, como `new:camping --apply`). **Sin cambios de comportamiento en runtime**: solo tooling + `export` de `DELETE_ORDER`.
- **HECHO en la sesión 45 (2026-07-24), 2º objetivo**: **recibo/ticket imprimible del check-out** (BACKLOG `[C4→C4.3]`) — botón "Imprimir recibo" en la ficha (`BookingPanel`) → `window.print()` sobre un recibo limpio (`BookingReceipt.tsx`, portal a `<body>`, oculto en pantalla y único contenido al imprimir, negro sobre blanco). Reutiliza el desglose auditable + cobros de la ficha y el nombre del establecimiento. Verificado en navegador (bundle real + stub + Playwright `emulateMedia:print`). Front-desk real, sin dominio nuevo ni credenciales.
- **HECHO en la sesión 48 (2026-07-25)**: **levantar un bloqueo desde el propio planning** (BACKLOG `[C1]`) — la barra rayada `lc-block` era pintura con `title`; ahora es un `role="button"` con `tabIndex=0`, `aria-label` (motivo + rango + unidad), activación por click y por Enter/Espacio, y la afordancia que le faltaba (`cursor: pointer`, realce al pasar por encima, anillo de foco del DS, todo por token). Click → `AlertDialog` con el detalle del bloqueo y, si es de **tipo**, el aviso de que levantarlo libera todas las unidades de ese tipo → `DELETE /blocks/:id` + toast + invalidación. El foco vuelve a la barra al cancelar. **Cero cambios de backend** (la ruta existía testeada desde C4; le faltaba la segunda pantalla que la llamara) y **sin arrastre**: un bloqueo no se mueve, se levanta y se vuelve a crear (ADR 0023 ya lo había decidido). Con esto el ciclo completo del bloqueo —crear y levantar— está en **las dos** pantallas, plano y planning.
- **HECHO en la sesión 51 (2026-07-25)**: **`prefers-reduced-motion` de verdad** (BACKLOG `[C2]`, cerrado) — la auditoría en navegador destapó que `motion-reduce:animate-none` **no anulaba nada** en diálogos/sheets/popovers/menús/tooltips (las variantes `data-[state=…]` de Radix tienen especificidad (0,2,0) y una `@media` no suma: (0,1,0) pierde siempre), y que seguían vivas todas las transiciones de Tailwind (43 elementos en la web, 151 en el dashboard). Sustituido por el reset canónico en **un bloque por raíz** (`packages/ui/theme.css`, `apps/web`, `apps/site` —a esta le faltaba además `animation-iteration-count: 1`), 14 clases `motion-reduce:*` borradas, y `apps/web/e2e/reduced-motion.spec.ts` barriendo el DOM como red de seguridad. De paso, **`[B3]` cerrado**: el E2E del funnel llevaba **rojo 4/4 desde ADR 0016** por el prefijo `/demo/` del bundle compuesto, y debajo tenía dos fuentes de flakiness propias (fechas inventadas que caían en septiembre lleno 4 de cada 12 minutos; ciclo de fechas de 12 min contra holds de 15) — ahora las fechas se le preguntan a la API (`estanciaLibre`). Suite **7/7 verde en tres vueltas consecutivas**. **Sin desplegar** (CSS + tests; sale en el próximo `deploy:demo`).
- **HECHO en la sesión 52 (2026-07-25)**: **los primitivos del DS en las tres pantallas de lista** (BACKLOG `[B1]`, avance real: 3 de 11) — y el motivo dejó de ser estético a los cinco minutos de mirar el código: **Pagos y Notificaciones pintaban sus datos como `<ul>` con rejilla CSS y NO tenían cabecera de columna**. Los nombres de las columnas vivían en un **comentario** del código y las siete claves i18n que debían pintarlos (`pagl.fecha/reserva/proveedor/importe`, `ntf.fecha/evento/destino/canal`) estaban escritas y **muertas** — el detector de C2 las contaba como huérfanas y no lo eran: **les faltaba el sitio donde usarse**. Ahora las tres pantallas usan `Table*` del DS con `<thead>` real (semántica de tabla para lector de pantalla incluida), y en Notificaciones la columna de intentos deja de repetir su etiqueta por fila ("Intentos: 0") para ser un número alineado a la derecha. Reservas suelta además su tabla a mano —clases de `TableHead`/`TableCell` copiadas, que copiadas se desincronizan— y sus `<input>`/`<select>` crudos, que pasan a `Input`/`SelectNative`, y su anillo de foco a `focusRing` importado. **El primitivo tuvo que crecer para poder adoptarlo**: `Table` fijaba `overflow-x-auto` en su contenedor, lo que lo convierte en contenedor de scroll de **ambos** ejes (`overflow-y: visible` computa a `auto` cuando el otro eje no es visible) y deja un `<thead sticky>` pegado a algo que nunca se desplaza → nuevo `containerClassName` (con test de que `overflow-auto` **gana** al defecto). Dos defectos de densidad cazados en navegador y arreglados: con la ficha abierta el código de reserva se partía en tres líneas (triplicando la altura de cada fila) y el chip "No presentada" se rompía en dos — el `nowrap` del chip va en `.lc-chip`, no celda a celda, porque el chip se pinta en 6 pantallas. Verificado contra el Worker real en claro y oscuro a 1366px y a 375px: cabecera pegada al desplazar (`thTop === contTop` medido), fila clicable y con el anillo de foco del DS por teclado (`:focus-visible` afirmado), 0 errores de consola.
- **DESPLEGADO en la sesión 52 (2026-07-25)**: las **tres sesiones que estaban en deuda —48, 51 y 52— salen juntas a producción** (`camp.logic2b.com`, versión `48c0b6dc`; sin migraciones nuevas, ninguna toca esquema ni datos, así que **no hizo falta reseed remoto**). Verificado en vivo entrando **como visitante anónimo** por el botón "Ver la demo" (`demo@calasereno.example`, banner de demo visible), no con credenciales: las tres tablas con cabecera real —y Notificaciones con **25 filas de verdad** que los crones de 15 min ya habían generado (recordatorios de llegada + avisos de pendiente sin pagar), no con datos inventados—, chips en una línea (`white-space: nowrap` leído del CSS servido), 0 errores de consola. De la **48**: la barra de bloqueo del planning es en producción un `role="button"` con `tabIndex=0` y `aria-label` completo ("Bloqueo de A-24: Larga estancia, del 2026-04-01 al 2026-10-01…"), sobre 95 barras a la vista. De la **51**: el reset de `prefers-reduced-motion` llega al CSS servido —**3 bloques en el dashboard, 2 en la web del tenant**, con el `animation-iteration-count: 1` que faltaba—. Web pública del tenant: título correcto, **6 imágenes, 0 rotas**. Rutas `/`, `/demo/`, `/admin/`, `/docs/gestion/parte/` → 200.
- **HECHO en la sesión 53 (2026-07-25)**: **Clientes y Tarifas a los primitivos del DS** (BACKLOG `[B1]`, **5 de 11**) — `Table*` en las dos, `Input` en el buscador de Clientes y en los siete campos por fila de Tarifas (a `h-7`, la altura que el botón `size="xs"` ya imponía a la fila), y la constante local `FILA_FOCO`, que era carácter por carácter el `focusRing` del DS, borrada e importada. Un defecto del primitivo arreglado **en el primitivo**: `TableRow` iluminaba también la fila de `<thead>` al pasar por encima, prometiendo un click inexistente → anulado en `TableHeader`, con test, para las cinco pantallas ya migradas. **Y el hallazgo real de la sesión, que no era de UI**: la lista de clientes enseñaba 25 filas seguidas con el mismo nombre y correo porque el seed acoplaba nombre y apellido al mismo índice (`b % 20` y `(b*3) % 20`) — **2 032 huéspedes eran 20 personas y 20 correos**. Desacoplados los ritmos y ampliados los repertorios a 40 × 40: **1 600 nombres y correos distintos**, primera página con 25 personas distintas. Test propio en `seed.test.ts` que falla con el código viejo. **Sin desplegar** — y el reset nocturno de la demo re-siembra desde `generateSeed()`, así que el próximo `deploy:demo` arregla la remota sola a las 3:00, **sin reseed remoto `--apply`**.
- **HECHO en la sesión 54 (2026-07-25)**: **el seed genera clientes que repiten** (BACKLOG `[10]`, cerrado) — hasta hoy había **un huésped nuevo por reserva**, así que la columna "Reservas" de `/clientes` valía 1 en las 2 032 fichas y el historial de la ficha tenía siempre una sola estancia: la pantalla existía y **no enseñaba nunca lo que la justifica**. Ahora una de cada cuatro fichas entra en un censo de habituales con su número de estancias sorteado, y una de cada tres reservas reutiliza una — **1 521 fichas: 1 168 con una estancia, 223 con dos, 102 con tres, 28 con cuatro**, con tope por ficha y holgura de 7 días entre estancias (dos estancias pegadas se leen como un fallo de datos, no como un cliente que vuelve). La decisión **no consume del PRNG**: el relleno por curva de temporada queda byte a byte igual y el único diff son las fichas. **Y de paso, el mismo defecto de la 53 una columna a la derecha**: la primera página salía entera "Andersen" (40 apellidos → 38 fichas cada uno, y la lista se ordena por apellido) → repertorio a **161**, y el emparejamiento reescrito como **recorrido de las 6 440 parejas a saltos coprimos**, que convierte "casi no hay nombres repetidos" en **garantía de que no puede haberlos** (ni correos: antes ~430 compartidos, ahora 0). El **sexo pasa a salir del nombre** y no de `bkgN % 2`, que era el contador del que también salía el nombre: "María" iba marcada M en todas sus fichas — en el **parte de viajeros, documento con valor legal, eso es un dato falso**. Verificado en navegador contra el Worker real (ficha con 4 estancias de estados distintos repartidas por la temporada). **Sin desplegar**: no toca esquema, y el reset nocturno re-siembra desde `generateSeed()`, así que el próximo `deploy:demo` basta — **sin `--apply`**.
- **HECHO en la sesión 55 (2026-07-25)**: **la bandeja de solicitudes deja de leerse como generada** (BACKLOG `[B1]`, **6 de 11**) — las 15 solicitudes se sembraban **todas el mismo día** (el ancla, «15 jul» quince veces en la columna "Recibida") y `date_from` salía de una fecha fija sin mirar la recepción, así que había solicitudes **pidiendo una estancia ya terminada el día que se escribieron**. Ahora la recepción se escalona por **edad del estado** (nuevas de esta semana, perdidas de hace semanas — y como la lista ordena por `created_at DESC`, la bandeja se ordena sola), la estancia se pide **siempre con antelación sobre su propia recepción** (invariante con test), y caen los **dos acoplamientos por el mismo contador**: `source`/"trae fechas" compartían `n % 4` (ninguna solicitud de teléfono traía fechas, ninguna de web las omitía — y la verdad del dominio va justo al revés: en el formulario público las fechas son opcionales) y `unit_type_id`/niños compartían `n % 3`. La mezcla que la demo debe enseñar **se planta, no se sortea**: el reset re-siembra con el año en curso, así que una mezcla sorteada es una mezcla que algún año no sale. Además, cada solicitud escribe **en su idioma** con el **prefijo telefónico de su mercado** (la bandeja entera estaba en castellano con `+33` en todos los teléfonos), el teléfono solo entra en horario de recepción y el tipo pedido admite a la gente que viene. **En la pantalla**: cabecera de columnas —`sol.recibida`/`sol.fechas`/`sol.tipo` llevaban desde la sesión 18 escritas y muertas, el mismo hallazgo de la 52: no sobraba la clave, faltaba la UI— y, lo que la cabecera destapó, que **las columnas de la lista nunca estuvieron alineadas entre sí**: cada fila es su propia rejilla y la última columna era `auto`, así que la palabra del chip de estado movía la columna "Tipo solicitado" **46 px** de una fila a otra (1116/1134/1137/1153/1162 medidos en el navegador). Ancho fijo y rejilla en una sola constante compartida por cabecera y fila → 1104 en las quince. Tests sobre **diez temporadas**, no sobre una — y eso cazó de inmediato un umbral estadístico disfrazado de garantía. **Sin desplegar**: no toca esquema, el próximo `deploy:demo` basta.
- **HECHO en la sesión 56 (2026-07-27)**: **Llegadas deja de repetir la misma palabra veinte veces** (BACKLOG `[B1]`, **7 de 11**) — la columna del saldo decía «Pendiente: …» en las veinte filas del día y **nunca «Pagada»**: el seed cobraba a todas las confirmadas el mismo 30%. Ahora lo cobrado sale de **dónde está la estancia y por dónde entró** (liquidada si ya empezó; 0 si es de mostrador o está sin confirmar; señal del 30% o pago entero si es de web), con **PRNG propio** para no colgar del contador del que ya cuelgan el medio de pago, el idioma y el check-in — cinco tests nuevos sobre diez temporadas, uno de ellos comprobando el desacoplamiento desde fuera. **En la pantalla, tres desalineaciones medidas**: las dos columnas de los extremos eran `auto` (columna 1 de 33,8 a **46,7px** según «A-01» o «MH-03»; columna 3 de 117,4 a **74,6px** según «Pendiente: …» o «Pagada» — este segundo **invisible mientras «Pagada» no existía**: los dos defectos se tapaban), y la fila **sin** botón de recepción se estiraba **109px** más que sus vecinas, sacando estado y saldo fuera de columna. Y la peor: el corte de las dos listas iba por `lg:` —el ancho de **pantalla**— cuando quien las estrecha es **la ficha de reserva**; a 1366px con el panel abierto el titular quedaba en **45px** («Pierre B…»). Ahora el corte lo decide el hueco real con `@container` y las listas se apilan → 394px. **Trampa nueva anotada**: el `@container` y el `@3xl:` no pueden ir en el mismo elemento (no falla, simplemente no coincide nunca). En móvil el botón se queda en icono porque con rótulo el saldo **se pintaba encima del nombre**. Campo de fecha a `Input` del DS y **con nombre accesible**, que no tenía. **Cabecera de columnas descartada con motivo** (la fila son 3 columnas en dos renglones; tres rótulos nombrarían la mitad de los seis valores) y las cinco claves muertas borradas con la razón al lado. **Hallazgo no arreglado**: el botón de **check-out no aparece nunca en la demo**, ningún día — raíz en el ancla fija del seed, que es el BACKLOG `[10]`, no un retoque. **Sin desplegar**: no toca esquema, el próximo `deploy:demo` basta.
- **HECHO en la sesión 57 (2026-07-27)**: **el ancla móvil** (BACKLOG `[10]`, cerrado · **ADR 0030, estado `propuesto`** — reabre ADR 0013 §1, pendiente de validación de Andreu) — el seed tenía un "hoy" (el 15 de julio) y el dashboard tenía otro (el día real del navegador), y las dos líneas solo coincidían un día al año. Consecuencia medida en la sesión 56: **el botón de check-out no aparecía NUNCA, ningún día**, y fuera de abril–octubre `/llegadas` salía vacía. Ahora `generateSeed` recibe una **fecha** y esa fecha es hoy; el reloj lo lee el llamante, no el generador, que sigue puro. El PRNG se sigue sembrando con el **año** a propósito: el camping es el mismo los 365 días —con test: las doce anclas de 2026 dan el mismo reparto de estancias— y lo único que se mueve es la línea de HOY; para eso los tres sorteos que dependían de una rama pasan a consumirse siempre. La ventana de siembra pasa a **`${Y-1}-11-15 → ${Y+1}-02-15`** (el desborde evita que el 1 de enero no haya pasado y el 28 de diciembre no haya futuro), la apertura declarada se queda en el **año natural** porque la tabla de tarifas de la web imprime el rango sin años y «Apertura · 15 nov – 15 feb» decía lo contrario de lo que significa, y la curva gana el invierno con **invernantes de 45 noches** mezclados con el finde corto. La línea temporal se resuelve en **cinco casos** —pasada · sale hoy · en casa · llega hoy · futura—, y el histórico deja de decir que aquellos huéspedes nunca llegaron a entrar. Lo que el sorteo no puede garantizar **se planta**: seis reservas alrededor del ancla, porque un 15 de enero al 18 % el relleno dejaba UNA salida y encima ya cerrada. Verificado en navegador (13 llegadas · 11 salidas hoy con 8 check-out, y el gesto ejecutado; y resembrando en enero: 7 · 3 con planning vivo). **Coste**: 2 032 → 3 491 reservas, SQL 1,95 → 3,4 MB (53 → 84 sentencias), probado contra D1 real en workerd — **vigilar el cron tras el primer deploy**. **Sin desplegar**: no toca esquema, el próximo `deploy:demo` basta.
- **DESPLEGADO en la sesión 58 (2026-07-28, con Andreu)**: las **cinco sesiones en deuda —53, 54, 55, 56 y 57— salen juntas a producción** (`camp.logic2b.com`, versión `9d85c8c5`; sin migraciones nuevas). Andreu eligió desplegar ANTES de trabajar, así que lo desplegado es exactamente `origin/main` de la 57 — el trabajo de la propia 58 queda para el siguiente deploy. Verificado en vivo: **el reset de la demo contra D1 real tarda 1,2 s** (`POST /api/demo/reset` como visitante → 200, re-ancla los datos al día real — mitad de la vigilancia que pedía ADR 0030 §2 despejada), `/api/admin/reports` del día devuelve la ocupación de julio re-anclada, `/demo/` y `/admin/` 200. **Queda mirar mañana que el cron de las 3:00 haya corrido** (la otra mitad de ADR 0030 §2). Nota de la sesión: el primer intento de deploy falló por un timeout intermitente de red hacia la API de Cloudflare (resolutor DNS de la red local lento, 200–300 ms por consulta; `-4`/`-6` explícito conectaba al instante) — reintento y fuera, no es del proyecto.
- **HECHO en la sesión 58 (2026-07-28, con Andreu)**: **Informes e Inventario al DS** (BACKLOG `[B1]`, **9 de 11**) — quedan Parte y Ajustes. En **Informes** el `Tile` a mano pasa a `Card`/`CardHeader`/`CardDescription`/`CardTitle` y el defecto anotado —el titular «Ingresos (por llegada)» a dos líneas hundía su cifra respecto de las otras cuatro tarjetas— se arregla **estructuralmente**: todas las tarjetas reservan la altura de **dos líneas de rótulo** (`min-h-[2lh]`), así que las cinco cifras comparten línea base a cualquier ancho — verificado forzando el caso a 1100px (titular partido, cifras alineadas) — y con cualquier idioma (el alemán partirá titulares que el español no parte; acortar el copy habría sido esconder el defecto). En **Inventario** el encargo decía «tiles → Card» pero **mirar la pantalla antes que el markup** (sexta vez que la regla paga) enseñó otra cosa: los chips **ya eran** `Button` del DS con su `AlertDialog`; lo crudo era la **estructura** — ocho secciones planas en una columna con medio lienzo vacío → fichas `Card` por tipo en **rejilla de 2 columnas**, el parque entero a la vista sin scroll. Esqueletos de ambas actualizados a la misma forma (ADR 0020). Verificado contra el Worker real en claro y oscuro: cifras alineadas, diálogo de baja vivo dentro del `Card` («¿Dar de baja A-01?»), sidebar con un solo activo tras click real, 0 errores de consola. **Tres hallazgos anotados en BACKLOG**: ninguna de las 83 unidades está fuera de servicio en el seed (el estado que la pantalla explica no se ve nunca — «válido pero falso» otra vez); la sidebar duplica el activo solo con navegación programática por hash (click real perfecto); y **el atajo del reset local de la 56 ha muerto** — `POST /api/demo/reset` cuelga el workerd local con el seed de 3,4 MB (180 s y el proceso deja de contestar; remoto: 1,2 s), el camino es parar el server + `pnpm db:reset && pnpm db:seed` + relevantar. **Sin desplegar** (el deploy de esta sesión fue anterior al trabajo): sale en el próximo `deploy:demo`.
- **HECHO en la sesión 59 (2026-07-29)**: **`[B1]` CERRADO — 11 de 11** (Parte y Ajustes, las dos que faltaban). En **Ajustes** el hallazgo no era de markup sino de comportamiento: el bloque de notificaciones vivía **dentro del `<form>` de datos del camping**, así que pulsar **Intro** en «Buzón interno de avisos» disparaba el submit de nombre/zona/moneda — y si esos tres no estaban sucios, **no pasaba nada en absoluto**: el correo escrito se perdía al navegar, en silencio. Dos `<form>` con su propio submit; verificado con Intro real (Playwright): **un solo PATCH**, y es el de `modules.notifications`. Además, tres `Card` en rejilla de dos columnas (la columna única de `max-w-xl` dejaba **dos tercios** del lienzo vacíos a 1366px), las dos fichas cortas apiladas en la misma celda para no dejar 200px muertos bajo «Datos», y la ficha de solo lectura «Nivel e idiomas» **fuera** de entre el último campo editable y el botón de guardar. En **Parte**, medido y no estimado: el `justify-between` a lo ancho dejaba el desplegable de forma de pago a **810px** de su código de reserva —más cerca de la fila de abajo que de la suya—; ahora es columna de ancho fijo con cabecera y **la rejilla vive en UNA constante** compartida por cabecera y filas (regla de la 55: ninguna columna `auto` en listas que no son `<table>`) → las 8 filas y la cabecera en **x=819 exacto**. El campo de fecha crudo pasa al `Input` del DS (29,5px contra 28px de sus vecinos y **sin anillo de foco**, comprobado con Tab de verdad) y los dos estados vacíos a `EmptyState`. **Y de paso, el cron de las 3:00 quedó comprobado**: las reservas de `camp.logic2b.com` vienen con `createdAt` del día → **ADR 0030 §2 despejado entero**. **Sin desplegar**: se acumula a la deuda de la 58.
- **CAMBIO DE MARCA en la sesión 59 (2026-07-29, petición extraordinaria de Andreu)**: el logo del producto pasa a ser el wordmark **«Logic2B Campings»**, tipografía y estilo de `logic2b-norte`, **sin isotipo**. Poppins con dos caras reales — «Logic» en 600 a plena tinta, «2B» en 800 sobre `--logo-2b` (un punto por debajo de `--foreground`), «Campings» en 600 sobre `--muted-foreground` —, tracking `.015em`. De norte se replica la **relación** de color, no sus hex (allí el texto arranca más oscuro que en este DS). Tipografía y color en `packages/ui/theme.css`; el lockup en `Wordmark` (React) + `Wordmark.astro`, que **comparten clases** para que cabecera, pie y login no puedan divergir. Aplicado en dashboard (sidebar, cabecera móvil, login) y landing (cabecera y pie); **34 apariciones** de «Logic Camp» renombradas en los seis idiomas, títulos de docs y `app.nombre`. Tres decisiones anotadas: la **sidebar plegada son 56px** y ahí no cabe ni «Logic2B» → enseña **«2B»** (la parte distintiva del lockup, no un símbolo nuevo, con `aria-label` completo); el **favicon sigue siendo el isotipo** (un wordmark no funciona a 32px); y el **pie de la web del tenant conserva el isotipo** como firma «powered by Logic2B», que ahí es un crédito y no el logo del producto. La propia build delató un derroche: `@fontsource/poppins/600.css` arrastra todos los subsets y metía **180 kB de Poppins Devanagari** para dos palabras → `latin-600`/`latin-800`, **16 kB**; en la landing el 800 va subsetado a sus dos glifos (824 B). `docs/BRAND.md` §2 reescrito con la decisión.
- **FRENTE D ABIERTO en la sesión 58 (2026-07-28, mandato directo de Andreu;
  gate original sustituido en la sesión 80)**: portfolio de 12 demos de
  campings, landing y creatividades de muestra. Se mantiene «campings y solo
  campings», pero ya no espera a backend avanzado, ADR de infra ×12 ni CLI: se
  ejecuta como fábrica visual en olas 3 → 6 → 12 según el mandato demo-first.
- **Último `/check`**: **2026-08-07 (sesión 88) — LOCAL, 53/53 verde**;
  dashboard **23/23**, portfolio **3/3**, bundle compuesto **11.307 enlaces /
  358 HTML** y entrada del build Mar de Fondo **178,16 kB gzip**, dentro del
  presupuesto M6. Automatiza pasa además QA real a 375/1366 con persistencia,
  reset, foco y cero desborde. Las referencias ambientales antiguas siguen en
  las sesiones 38–48; en esta máquina `reset.test.ts` no presenta el segfault.
- **HECHO en la sesión 63 (2026-07-31, apunte prioritario de Andreu) y DESPLEGADO**: **las dos caras de la demo se enlazan entre sí** (`camp.logic2b.com`, versión `c86d5793`). El héroe de la landing ofrece web y mostrador con el mismo peso, el pie lista ambas, el banner de demo de la web del tenant lleva al mostrador (en los seis idiomas) y el `DemoBanner` del dashboard vuelve a la web. Al verificar apareció un **404 vivo desde ADR 0016**: el CTA del planning apuntaba a `/demo/admin/` cuando el dashboard se sirve en `/admin/` — era el único enlace de la landing al mostrador. En BACKLOG queda que **nadie comprueba los enlaces entre las tres superficies del bundle compuesto**.
- **HECHO en la sesión 64 (2026-07-31)**: **el mostrador dentro de la ficha de alojamiento** (candidato `[4.x/web]`, cerrado) — el CTA devolvía al visitante a la home sin precargar el tipo que miraba. Ahora la ficha contesta por **su** tipo con el mismo `GET /api/availability` (sin endpoint nuevo) y el botón entra al funnel con tipo y fechas puestos; y cuando ese tipo no entra pero el camping sí tiene algo libre, ofrece la **salida** al mostrador general **conservando fechas y grupo** en vez de ser un callejón. Dos tests E2E nuevos (`ficha-mostrador.spec.ts`), etiquetas en los seis idiomas. Un defecto propio cazado en navegador: el mostrador dentro de la columna lateral reventaba la rejilla (`1fr` es `minmax(auto,1fr)`) y dejaba la **galería** en una tira → va a ancho completo fuera de la rejilla, galería de vuelta a 705px. **DESPLEGADO** el mismo día (versión `bfc479ac`), verificado contra producción con `no-cache`: la ficha sirve el título de disponibilidad y monta la isla del mostrador, también en alemán.
- **DEUDA TÉCNICA NUEVA anotada en la 64, preexistente y no tocada**: (1) **la regla dura de niveles está incumplida** — un build `TIER=1` sin conmutador emite igualmente `Mostrador.*.js`, porque las rutas del funnel se siguen generando en nivel 1 (comprobado contra el código de la 63, antes de tocar nada); (2) el **héroe de nivel 1 de la home queda invisible** en un build de nivel 1 real, porque `global.css` oculta `[data-hero-nivel='1']` salvo bajo el conmutador de demo y `Home.astro` emite el atributo siempre. Las dos son bombas para el primer Camp Web real, no para la demo.
- **HECHO en la sesión 65 (2026-07-31, dos encargos de Andreu)**: (1) **el producto pasa a llamarse «Gestor de camping»** donde era «el mostrador» — respetando los otros dos sentidos de la palabra, que NO se tocan: el widget de disponibilidad de la web pública (ADR 0006) y el canal `walkin`/el mueble de recepción de las guías. Seis idiomas en el banner de demo, es/en en la landing, login del dashboard. Borrada de paso la clave muerta `nav.mostrador` que creó la 63. (2) **portada del gestor en `/`**: cifras de hoy (ocupación, llegadas, salidas, pendiente de cobro), rejilla de los trece módulos con una frase cada uno, y las cinco últimas solicitudes. Sin API nueva (`/reports` ×2 + `/enquiries`, y se comprobó antes que el rol `demo` las lee). El **planning pasa a `/planning`** y `NAV_GROUPS` sale a `src/lib/nav.ts` para que barra lateral y rejilla no sean dos copias. **DESPLEGADO** el mismo día (versión `f133e692`).
- **HECHO en la sesión 66 (2026-08-01, dos encargos de Andreu)**: (1) **las tres listas del día en la portada** — entradas de hoy, salidas de hoy y últimas solicitudes en tres columnas, cinco filas cada una, con un componente `Panel` compartido y las mismas claves de caché que Llegadas. Corregido de paso un defecto de lectura: el chip marca ahora lo que YA pasó por recepción en las dos columnas (antes, salidas al revés = diez chips idénticos una mañana normal). (2) **el wordmark del gestor enlaza**: «Logic2B» → logic2b.com y «Campings» → camp.logic2b.com, igual que la landing; `enlazado` es opt-in en `packages/ui`, en pestaña nueva, y plegado no enlaza. **DESPLEGADO** el mismo día (versión `b65a5dfb`).
- **Repo**: https://github.com/amariner/logic2b-camp
- **Cloudflare**: login OK (en local). D1 `logic-camp-demo` migrada (0000+0001) y sembrada en remoto. Worker desplegado con `/api/*`; **pendiente redeploy** para activar la ruta nueva `camp.logic2b.com/*` con la web (esta sesión cloud no tiene credenciales — NO simulado).
- **Pendiente de Andreu (cierra Fase 0)**: registro DNS en zona logic2b.com: `AAAA camp → 100::` proxied.
- **Deploy de la demo = MANUAL desde local**, hoy y hasta nuevo aviso: `pnpm --filter @logic-camp/api deploy:demo` (compone el bundle site+`/demo/`+`/admin/`, migra la D1 remota y despliega). El workflow `deploy-demo.yml` **existe pero no despliega**: sin la var de repo `DEPLOY_DEMO_ENABLED=true` el job se salta entero — comprobado en los 52 runs de `main`, todos verdes con los pasos de deploy en `skipped`. Desde la sesión 49 el workflow ya no duplica los pasos: llama a ese mismo script, así que encenderlo es solo poner los secrets `CLOUDFLARE_*` + la variable. **Un check verde en `main` no significa que la demo se haya actualizado.**

## Sesiones

### Sesión 94 — 2026-08-07 · **La cuarta pareja distingue mobil-home y glamping sin fantasía** (autónoma, protocolo CONTINUA)

- Se procesa exclusivamente `mobil-horizonte-interior` + `glamping-duna` con
  el circuito de Higgsfield ya abierto; el historial de los dos fallos de Codex
  integrado se conserva.
- `glamping-duna` queda aprobado a la primera. El interior acumula dos rechazos
  concretos y el pipeline cambia solo de `soul_location` a GPT Image 2; la
  tercera variante queda aprobada sin retocar a mano la política.
- Las fichas reales del mobil-home y del glamping responden 200 y cargan sus
  derivados a 1366 y 375 px, sin desborde, imágenes rotas, errores de consola ni
  peticiones fallidas.
- Estado fotográfico **8/14**; siguiente lote
  `glamping-duna-interior` + `instalacion-laguna`, todavía sin generar.
- Verificación aislada: pipeline **8/8**, portfolio **3/3**, build Mar de Fondo
  **25 páginas / 80 derivados**; `pnpm check` **53/53**. Sin deploy remoto.

### Sesión 93 — 2026-08-07 · **Un interior creíble completa la tercera pareja de Mar de Fondo** (autónoma, protocolo CONTINUA)

- Se procesa exclusivamente `bungalow-laguna-interior` + `mobil-horizonte` con
  el circuito de Higgsfield ya abierto; no se reintenta Codex ni se borra su
  historial.
- `mobil-horizonte` queda aprobado a la primera. El interior acumula dos
  rechazos concretos y el pipeline activa GPT Image 2 sin editar la política a
  mano; la tercera variante queda aprobada.
- La ficha real del bungalow usa el interior como segunda imagen a 1366 px y la
  del mobil-home carga su exterior a 375 px. Ambas sirven AVIF, no desbordan y
  conservan el aviso de demo, tarifa y mostrador.
- Estado fotográfico **6/14**; siguiente lote
  `mobil-horizonte-interior` + `glamping-duna`, todavía sin generar.
- Verificación aislada: pipeline **8/8**, portfolio **3/3**, build Mar de Fondo
  **25 páginas / 58 derivados**; `pnpm check` **53/53**. Sin deploy remoto.

### Sesión 88 — 2026-08-07 · **Automatiza se detiene antes de ejecutar**

El objetivo visual empezó por la pareja contractual de Mar de Fondo. La primera
llamada (`hero-laguna`) volvió a fallar en tres segundos por red del backend
integrado, antes de producir bytes. Se respetó el límite de dos, no se lanzó la
segunda llamada a ciegas y no se cambió a CLI/API u otro proveedor. El relevo de
`SIGUIENTE-SESION` era el primer prototipo Automatiza supervisado.

La nueva ruta `/automatiza` solo entra en el build `mardefondo`. Un fixture
tipado separa reseña, estancia ficticia, incidencias de recepción, resumen,
fuentes, límites y respuesta propuesta. La pantalla recorre detectar → proponer
→ revisar → preparar; permite editar, descartar y reabrir. Aprobar produce
`prepared`, nunca `sent`, y lo explica dos veces: en el encabezado («No publica,
no envía y no cobra») y en el resultado persistente. El reset común borra el
estado y avisa a la pantalla abierta para que vuelva al fixture sin recargar.

El pase por las ocho lentes mantiene un runtime y el DS común, i18n para todo el
cromo, navegación/portada exclusivas por escenario, estado determinista y cero
infraestructura. Verificación: dashboard 23/23; `pnpm check` 53/53; QA de
navegador a 375/1366 con aprobación, recarga, reapertura, menú/foco y reset;
bundle compuesto 11.307 enlaces / 358 HTML. No hubo deploy remoto.

### Sesión 85 — 2026-08-06 · **Pinada del Mar ya tiene piel propia**

**D2-V cerrado.** Se descartaron también las dos URLs antiguas de Higgsfield:
las **11 fotografías** de Pinada del Mar se generaron de nuevo con el modelo
integrado de imagen de Codex, se inspeccionaron por lotes y se optimizaron a
WebP. La serie comparte pinada litoral, arena, lona verde, arquitectura sobria
y tratamiento documental; no reutiliza activos de Cala Sereno ni L'Olivar.

Se añadieron `favicon.svg`, `apple-touch-icon.png`, `og.jpg` y
`miniatura.webp`. `fetch-fotos.mjs` ya no confunde «sin URL» con «pendiente»:
reconoce los finales locales y Pinada informa **11/11 disponibles** sin depender
de una CDN. Build aislado verde: 15 páginas y 79 variantes responsive. El
siguiente objetivo contractual pasa a ser **D3-V, Mar de Fondo**.

### Sesión 84 — 2026-08-06 · **Un camping sin fotos también se enseña** (autónoma, protocolo CONTINUA)

**Objetivo elegido y por qué cambió.** El prompt de `SIGUIENTE-SESION` mandaba
reanudar la cola fotográfica de D2-V. Se intentó: se generaron dos piezas y, al
ir a bajarlas, el proxy contestó **403 al CONNECT** — y no solo contra la CDN del
generador: también contra `example.com`. El contenedor sale por **lista blanca**
(npm, GitHub, Anthropic, MCP). CONTINUA §3 dice que un objetivo que no es
ejecutable sin Andreu se anota y se elige otro, así que la pregunta pasó a ser
**qué impedía de verdad avanzar D2-V**. La respuesta salió de intentar construir:
`bundle:demo` llevaba roto desde la sesión 83 y nadie lo veía.

**Los dos defectos que tumbaban a Pinada del Mar.** Los dos son de la misma
familia: el core afirmando con `!` una clave que solo la demo tiene.

1. `404.astro` hacía `getImage({ src: images['hero-anochecer']! })`. `hero-anochecer`
   es el nombre de un ROL (héroe secundario), no de una foto que todo camping
   tenga. Un tenant sin ese fichero no construía **ninguna** de sus 15 páginas.
2. `Tarifas.astro` leía los suplementos con `plan('ut_std', s.id)!` — el id de
   parcela de Cala Sereno **escrito a mano en una página compartida**. Pinada
   llama a las suyas `ut_parcela_pino`, así que la página entera reventaba.
   Ahora sale del primer tipo `pitch` del propio camping, y cabecera y cuerpo de
   la tabla se generan de la MISMA lista de pares (temporada, plan) para que una
   temporada sin tarifa no descuadre la tabla una celda.

**`<Materia>`, y por qué no es un placeholder.** Un camping trae config,
contenido y tarifas semanas antes que su sesión de fotos; eso no puede significar
"web rota". La caja de la foto ausente la ocupa un campo de color **de la paleta
del propio tenant** (`--lc-pino` → `--lc-arena`, con bandas verticales al 4-5 %
que dan textura sin dibujar nada). No imita una fotografía ni anuncia un fallo, y
cuando el `.webp` aparece en `content/media/` desaparece sola — no hay nada que
desmontar. Tres tonos, elegidos **por lo que va encima**, no por gusto:
`--oscura` bajo texto hueso (héroe nivel 1, 404) y `--clara` bajo texto tinta
(héroe nivel 3, que lleva el mostrador), medidos a 7,2:1 y 7,5:1; sin variante
donde no va texto (tarjetas, galería, franja, entorno). El héroe de nivel 3 **no
se cae** sin foto: ahí el héroe es el mostrador, y sigue montándose encima.

**La guardia que faltaba.** `pnpm check` construía `apps/web` una sola vez, con
el tenant por defecto. Los campings del escaparate solo se construyen dentro de
`bundle:demo`, que nadie corre al cerrar sesión — por eso la 83 pudo cerrar
**50/50 verde con el bundle roto**. `apps/web/scripts/check-portfolio.mjs`
construye todos los campings de `tenants/` (menos `_template` y `demo`, ya
cubierto) a un `dist-portfolio/` propio para no pisar la caché de turbo, y falla
nombrando al roto. Comprobado en rojo reintroduciendo la regresión exacta del 404. Cuesta 10s y cubre el portfolio según crezca a 6 y a 12.

**Dos defectos más, encontrados mirando la pantalla.**

- **`/tarifas` desbordaba 108px a 375**, y solo en Pinada: un hijo de grid nace
  con `min-width:auto`, así que el ancho mínimo de las cabeceras `nowrap`
  estiraba la rejilla y sacaba el DOCUMENTO de la pantalla — por mucho
  `overflow-x-auto` que llevara el envoltorio de dentro. Con "Alta"/"Media" de la
  demo cabía; con "Final de temporada" no. `min-w-0` en las dos columnas.
- **El plano decía «1 de 110 ocupadas · 1%»** con 18 unidades ocupadas a la
  vista. El resumen sumaba `occupied` y `arrival` pero **no `inhouse`**, que es
  justo quien ya ha hecho el check-in; y mezclaba dos denominadores en la misma
  frase (el "de N" del total de unidades, el "%" de ocupadas+libres). Afectaba
  igual a Cala Sereno. Sale de la pantalla a `ocupacionDeLaNoche` en
  `packages/config`, pura y con cuatro tests. Ahora: **18 de 110 · 16%**.

**Verificación.** Recorrido real contra el bundle servido: `/demos/pinadamar/` →
solicitud `PM-WEB-001` → "Abrir en el gestor" → portada con la solicitud → bandeja
→ planning (110 unidades, 82 reservas a la vista) → plano (110 unidades, `B-12`
fuera de servicio), **0 peticiones `/api`** en todo el recorrido. Ocho páginas ×
1366/375: cero desborde, cero imágenes rotas, cero errores de consola salvo el
`favicon.ico` implícito (Pinada aún no tiene favicon: va con la sesión de fotos).
`bundle:demo` **10.670 enlaces / 333 HTML OK**. `packages/config` 49/49.
`pnpm check` **49/51** — `@tenant/demo#test` rojo por el segfault de workerd sobre
`reset.test.ts` (ambiental y documentado; `seed.test.ts` 48/48 y
`remote-seed.test.ts` 6/6 pasan), y `@logic-camp/web#build` cancelado en cascada
por turbo al caer aquel: aislado construye 235 páginas y sale 0.

**Lo que NO se hizo y por qué.** Las 9 fotos que faltan no se generaron a ciegas:
la herramienta devuelve URL, no imagen, así que en cloud no hay forma de
inspeccionarlas, y ADR 0024 fijó que no se queman créditos sin ver el resultado.
En su lugar quedan los 11 prompts fijados en `tenants/pinadamar/fotos.json` y un
script que las aterriza en un paso. Sin deploy remoto.

### Sesión 81 — 2026-08-06 · **D0-V: tres demos dejan de ser nombres y pasan a producción** (autónoma, protocolo CONTINUA)

**Objetivo elegido:** cerrar el contrato visual y comercial de Inicio, Gestión
y Visión. Es el siguiente bloque de `SIGUIENTE-SESION`, es visible, no necesita
credenciales y evita abrir tres identidades con decisiones pendientes.

**Decisión:** L'Olivar (`olivar`, 22 unidades) abre Inicio; Pinada del Mar
(`pinadamar`, ~110) conecta web y operación en Gestión; Mar de Fondo
(`mardefondo`, ~300) enseña reserva, escala y prototipos supervisados en Visión.
Comparten código y pueden compartir runtime/dataset ficticio, pero no fotografía,
territorio ni relato. Cala Sereno sigue como baseline funcional, no como cuarta
identidad reciclada.

**Contrato:** `docs/CONTRATO-VISUAL-OLA-1.md` contiene ICP, problema, promesa,
CTA, guiones 5/8/12 minutos, mapa de pantallas, paletas, tipografía, briefs de
foto, activos, estados, soporte técnico, rótulos de honestidad y criterios de
aceptación. Incluye la ficha de activación a producción de formularios,
inventario, usuarios, pagos, automatización, IA, canales y cumplimiento.

**Auditoría y ocho lentes:** se reutilizan `apps/web`, `_template`, Clash/Inter,
el pipeline de imagen y capturas Logic2B. Se descartan como activos finales las
fotos de Cala, la propuesta Azahar y un plano recoloreado. El runtime compartido
es solo portfolio con datos ficticios; un cliente real vuelve a D1 aislada por
binding. D1-V puede empezar por frontend puro: `tenants/olivar`, español, nivel
1 como carril estático, ocho fotos y transporte demo sin red ni persistencia.

**Verificación:** documentación formateada, `git diff --check` limpio y
`pnpm check` **46/46 verde** (typecheck, lint, tests y builds de los 17 paquetes;
cache íntegra al ser una sesión documental). Sin código de producto, servicios
externos ni deploy.

### Sesión 80 — 2026-08-06 · **Replanteo demo-first: vender primero lo visible**

**Objetivo:** impedir que el proyecto siga invirtiendo su capacidad limitada en
backend, CLI e integraciones invisibles antes de tener un escaparate capaz de
vender la tecnología.

**Decisión:** el frontend es el producto comercial inmediato. El backend de
demo solo sostiene recorridos creíbles; la producción real se especifica en un
dossier de activación y se implementa cuando un cliente la contrata. Las doce
demos siguen siendo la visión, pero se validan en olas 3 → 6 → 12.

**Documentación:** nueva fuente de verdad `docs/ESTRATEGIA-DEMO-FIRST.md`,
research oficial de plataformas, dossier interno de activación y alineación de
CLAUDE/EQUIPO/CONTINUA/ROADMAP/Frente D/Frente E/BACKLOG. La próxima sesión pasa
de E3 técnico a **D0-V**, contrato visual de Inicio, Gestión y Visión. No se ha
modificado producto ni desplegado nada.

### Sesión 79 — 2026-08-06 · **Las reservas dejan de nacer el día del reset** (autónoma, protocolo CONTINUA)

**Objetivo elegido**: cerrar el candidato `[seed] created_at` recomendado para
una sesión sin credenciales. E3 queda reservado a su gate técnico con Andreu;
este cambio no abre fase, es reversible y mejora la demo que ya se enseña.

**El defecto**: las 3.426 reservas llevaban `created_at = anchor`, también una
estancia terminada meses antes. `/reservas` ordena por ese campo y la ficha lo
enseña, por lo que SQLite aceptaba una cronología que un camping reconoce como
imposible. La prueba se escribió primero y reprodujo cuatro fallos: altas tras la
llegada, cero antelación por canal, mostrador desligado de la llegada y una sola
fecha de alta para todo el historial.

**Implementación**: `bookingCreatedAt` deriva la antelación del canal: web 30–180
días, teléfono 2–41 y mostrador el día de llegada; si la estancia aún es futura,
amplía el plazo para que el alta exista ya y, en mostrador presencial, la deja
en los últimos tres días. Hora y minuto también son deterministas y un alta del
ancla queda antes de `updated_at` (08:00). Un PRNG independiente, consumido tres
veces por reserva sin ramas, evita desplazar el generador general o atar el dato
a idioma, medio de pago, saldo o recepción.

**Contrato de regresión**: cuatro tests barren las 23 anclas de ADR 0030: ninguna
alta posterior a llegada/ancla ni actualización anterior a creación; mediana web
≥30 días y mayor que teléfono; cada reserva de mostrador histórica nace el día
de llegada (las futuras, como máximo dos días antes del ancla); y >180 fechas de
alta distintas en cada snapshot.

**Evidencia real**: D1 regenerada desde cero con ancla 2026-08-06: web **2.794
reservas / 400 fechas / 115 días medios**, teléfono **455 / 167 / 47** y
mostrador **177 / 70**; cero altas futuras o posteriores a llegada. Bundle
compuesto: **9.994 enlaces en 306 HTML**. Playwright con Chrome local abre
`bkg_001` en el dashboard real, contrasta API/calendario y ve la fecha de alta
histórica en la ficha: **1/1**.

**Verificación**: `pnpm check` **46/46**; API **240/240** + enlaces **3/3**;
tenant demo **62/62** (seed 48, reset D1 8, remoto 6); typecheck/lint y build
verdes. Sin deploy remoto: producción sigue en la sesión 76.

**Pase EQUIPO**: Arquitectura/Fullstack conservan el generador puro, una sola
fuente y cero trabajo por tenant; Backend fija cronología y determinismo sin
tocar esquema, dinero ni rutas; Frontend/UX reciben orden y fecha creíbles sin
cambio de UI; Producto mejora una pantalla que ventas ya enseña; UI no cambia;
SEO no aplica a datos privados `noindex`. No hay conflicto que exija ADR.

### Sesión 77 — 2026-08-04 · **M6: carga inicial por debajo de 200 kB gzip** (autónoma, protocolo CONTINUA)

**Objetivo elegido**: `[M6] Rendimiento móvil del dashboard`, último P1 y
candidato recomendado tras M4. La build arrastraba las 14 pantallas desde
`main.tsx`: 785,80 kB minificados / 234,75 kB gzip antes de mostrar la portada,
incluidos Planning y Plano.

**Una pantalla, un chunk**: las rutas usan `lazyRouteComponent`; TanStack
precarga por intención en hover/touchstart y conserva el import resuelto al
volver. Un `defaultPendingComponent` común mantiene shell, navegación y un
estado `role=status` traducido mientras llega una pantalla. La portada ya no
pide Planning ni Plano: quedan en 17,26 y 8,47 kB gzip respectivamente.

**Presupuesto, no captura**: Vite genera manifiesto y
`scripts/check-entry-budget.mjs` recorre el grafo estático real, comprime sus
JS y rompe la build si llega a 200 kB o si Planning/Plano dejan de ser entradas
dinámicas. Resultado estable: **533,71 kB min / 170,04 kB gzip**, 27,6 % menos
que la línea base. La advertencia de Vite sobre 500 kB minificados permanece:
no se oculta, pero el criterio de red fijado por M6 queda verde.

**Fuentes y navegador**: las importaciones generales de Fontsource emitían
cirílico, griego, vietnamita y latin-ext. `fonts.css` declara únicamente Inter,
Space Grotesk y los dos pesos Poppins como cuatro WOFF2 latinos (15 → 4
activos). Una regresión Playwright escucha las respuestas del Worker: portada
sin chunks densos, cada ruta los pide una vez y la segunda visita no repite la
descarga. `E2E_PORT` permite verificar sin parar otro Worker local que ya use 8787.

**Verificación**: `pnpm check` **46/46**; build M6 en 170,04 kB gzip; bundle
compuesto **9.286 enlaces en 304 HTML**; regresiones M1–M5 **7/7** repartidas en
dos Workers limpios y M6 **1/1**. Sin deploy remoto ni cambio de datos.

**Pase EQUIPO**: Arquitectura/Fullstack conservan una SPA y el despliegue único;
Backend y dominio no cambian; Frontend añade pending/error sin duplicar rutas;
Producto/UX hacen más corta la primera visita móvil y conservan navegación
instantánea tras caché; UI mantiene las tres familias tipográficas con subsets
latinos; SEO no aplica a la SPA `noindex`. No abre fase ni ADR: ejecuta M6 del
ADR 0031 propuesto.

### Sesión 76 — 2026-08-04 · **M4: el Planning móvil se convierte en agenda** (autónoma, protocolo CONTINUA)

**Objetivo elegido**: `[M4] Planning móvil como agenda`, siguiente P1 y candidato
recomendado tras M5. El chart de escritorio cabía bajo 375 px solo porque
conservaba filas de 32 px, barras de 24 px, asas de 8 px y arrastres que compiten
con el scroll. Inflarlo habría perdido contexto sin resolver el gesto; se aplica
la alternativa reversible del ADR 0031.

**Un modelo por ancho**: bajo `md`, la consulta pide un día o siete según el
selector Día/Semana y pinta secciones por fecha. Cada estancia es una fila
tocable con código, estado, fechas y ocupación; la unidad tiene su propia acción
hacia el plano. Navegación, modos, fecha, filtros, búsqueda, filas y acciones
alcanzan 44 px, los campos usan 16 px y el overflow de filtros es local. Desde
`md` no coexiste una agenda oculta: se monta únicamente el tape chart original,
con virtualización, barras, teclado, drag/resize y densidad intactos.

**Cambios explícitos, servidor intacto**: una reserva viva y asignada despliega
Entrada, Salida y Unidad compatibles en un formulario nativo. «Aplicar cambio»
entra en el mismo `startMove` del gesto de escritorio: `POST /requote`, diálogo
de desglose si cambia el total y `PATCH move` con `expectedTotalCents`. La UI no
calcula precio ni disponibilidad. Cancelar devuelve el foco al disparador; la
ficha móvil de M1 conserva Escape y retorno a la fila.

**Remate B1**: el selector de fecha de escritorio era el último `<input>` crudo
del dashboard y carecía de nombre accesible. Pasa a `Input` del DS, con altura
compacta de 32 px en escritorio; la agenda usa la misma pieza a 44 px/16 px.

**Verificación**: `pnpm check` **46/46**. La regresión M4 contra bundle compuesto,
Worker y D1 recorre 320/375/430 y 1366 px: **1/1 verde**, con cero desborde,
medidas, día/semana, siete secciones, ficha, editor, Escape y retorno de foco.
Las seis regresiones M1–M5 también quedan verdes al separarlas en procesos
limpios. Juntarlas todas agota el rate limit anónimo después del quinto spec y
los dos restantes fallan antes del login; reiniciados, pasan 1/1 cada uno.

**Pase EQUIPO**: Arquitectura/Fullstack mantienen una consulta y mutaciones
compartidas; Backend conserva precio, fechas y solapes en servidor; Frontend
cubre carga/error/vacío, filtros, teclado y foco; Producto/UX resuelven la
urgencia móvil sin duplicar el mostrador; UI conserva tokens y mide móvil más
1366 px; SEO no aplica a la SPA privada. No hace falta ADR nuevo: M4 ejecuta el
ADR 0031 propuesto. Bundle actual: **785,80 kB min / 234,75 kB gzip**, que deja
M6 como siguiente objetivo. **Desplegada después por petición de Andreu** junto
con las sesiones 67–70 y 72–75: `deploy:demo` validó 9.286 enlaces en 304 HTML,
no encontró migraciones pendientes y publicó la versión Cloudflare
`cfe8405b-810a-4a1f-9f27-aaef7852b88e`. Verificación pública con cache-buster:
portada, `/demo/`, `/admin/` y `/api/health` responden 200; el gestor sirve el
bundle `index-CqAFxEe9.js` con la agenda nueva.

**Siguiente**: M6 — dividir el dashboard por rutas, cargar Planning/Plano bajo
demanda y bajar el chunk de entrada por debajo de 200 kB gzip.

### Sesión 75 — 2026-08-04 · **M5: el plano deja de ser una miniatura** (autónoma, protocolo CONTINUA)

**Objetivo elegido**: `[M5] Plano táctil`, siguiente P1 del orden medido por M0
y candidato recomendado por `SIGUIENTE-SESION`. La vista cabía en móvil, pero
sus unidades de 10–17 × 7–12 px exigían precisión de ratón. Se ejecuta dentro
del contrato reversible del ADR 0031, sin rutas, datos ni permisos nuevos.

**Escala y orientación**: bajo `md`, `CampingMap` entra al zoom máximo ya
existente (8×), centrado en la unidad seleccionada o en la primera del recinto.
La geometría mínima del descriptor pasa así el blanco físico de 44 px en los
tres anchos auditados. Cada selección vuelve a centrar su unidad; acercar,
alejar y ajustar miden 44 px, y «Ajustar a la pantalla» conserva la visión
general cuando se necesita recuperar contexto. Escritorio sigue entrando con
todo el recinto encajado y controles de 28 px.

**Gestos sin secuestro**: el SVG abandona `touch-none` permanente. Por defecto
declara `touch-action: pan-y`, de modo que un dedo vertical pertenece a la
página; el botón visible «Mover plano» activa y desactiva `touch-none` de forma
explícita para desplazar el recinto. La rueda, botones, flechas y activación de
unidades con Enter/Espacio permanecen intactos. Barra de mando y leyenda usan
scroll horizontal local en una sola línea para devolver altura útil al mapa;
fecha, navegación, acciones y ayuda alcanzan 44 px y el input usa 16 px.

**Ficha inferior y foco**: las unidades libres, bloqueadas o inactivas montan
`UnitPanel` en un `Sheet` inferior bajo `md`, con trampa de foco, Escape,
acciones de 44 px, safe area y retorno al grupo SVG que la abrió. Las reservas
siguen usando la ficha completa móvil de M1. En escritorio se conserva el panel
lateral de 360 px. No se duplican consultas, mutaciones ni formularios.

**Hallazgo de navegador**: la primera unidad del seed estaba «En casa». El mapa
la seleccionaba y resaltaba, pero no abría ficha: la condición contemplaba
`occupied`, `arrival` y `departure`, no el estado derivado `inhouse`. Se añadió
esa rama y se mantuvo la aserción de apertura. La propia regresión aprendió a no
confundir `toBeVisible()` con estar dentro del `viewBox`: elige un blanco cuyo
centro está realmente dentro del SVG antes de pulsarlo.

**Verificación**: dashboard **7/7** y `pnpm check` **46/46**. Playwright contra
bundle compuesto, Worker y D1 sembrada recorre 320/375/430 y 1366 px; mide
unidades/controles, tipografía, cero desborde, `touch-action`, posición de la
hoja inferior, roles/nombres accesibles, Enter, flechas, Escape y retorno de
foco. Ejecutado junto a las regresiones M1–M3: **6/6 verde**.

**Pase EQUIPO**: Arquitectura mantiene un componente y geometría compartidos;
Fullstack y Backend no cambian contratos ni servidor; Frontend conserva todos
los estados y corrige `inhouse`; Producto y UX hacen localizable y accionable
una unidad desde el teléfono sin sacrificar el plano de mostrador; UI fija 44 px
y semántica accesible sin tocar tokens/contraste; SEO no aplica a la SPA
privada. No hace falta ADR nuevo: M5 ejecuta el ADR 0031. Sin deploy remoto.

**Siguiente**: M4 — ofrecer una agenda día/semana móvil con reservas y unidades
tocables y cambios explícitos, manteniendo el tape chart intacto desde `md`.

### Sesión 74 — 2026-08-04 · **M3: la operación diaria ya cabe bajo el pulgar** (autónoma, protocolo CONTINUA)

**Objetivo elegido**: `[M3] Llegadas, salidas y solicitudes operables con una
mano`, siguiente P1 del orden medido por M0 y recomendado por
`SIGUIENTE-SESION`. Resuelve blancos de 28–40 px en las tareas que recepción
repite durante el día, sin cambiar contratos API, permisos ni datos.

**Llegadas y salidas**: navegación anterior/hoy/siguiente, selector de fecha,
ayuda, filas y acciones de recepción alcanzan 44 px bajo `md`; desde `md`
recuperan su altura compacta anterior. La rejilla móvil reserva 44 px exactos a
la acción y comprime solo la presentación del saldo, no la información: nombre,
estado y cantidad siguen visibles y la descripción accesible conserva el texto
completo. Check-out directo suma una confirmación coherente con la ficha de
reserva, incluido el aviso cuando queda saldo pendiente, sin duplicar mutaciones
ni mensajes del servidor.

**Solicitudes**: los seis filtros se mantienen en una sola línea desplazable
dentro de su propia barra; miden 44 px junto con filas, correo, teléfono y
cambios de estado. Las dos transiciones caben juntas incluso a 320 px, por lo
que no se escondió una acción útil en un menú innecesario. A partir de `md` se
preserva la barra envolvente y la densidad de 28 px existente.

**Foco y prueba real**: el primer recorrido descubrió que el diálogo cerraba
pero no devolvía el foco porque `BotonRecepcion`, usado bajo `asChild`, no
reenviaba la referencia de Radix. Se corrigió con `forwardRef` y se mantuvo la
aserción, en vez de relajarla. La nueva regresión atraviesa Llegadas y
Solicitudes a 320/375/430 px en una sola sesión demo, comprueba cero desborde de
página, targets, tipografía del campo de fecha, diálogo y retorno de foco; a
1366 px fija la altura anterior.

**Verificación**: dashboard **7/7** y `pnpm check` **46/46**. Playwright contra
bundle compuesto, Worker y D1 sembrada ejecutado junto a M1 y M2: **5/5 verde**.
La cancelación del diálogo evita mutar la base durante la regresión.

**Pase EQUIPO**: Arquitectura mantiene una sola vista responsiva; Fullstack y
Backend no reciben rutas, esquemas ni permisos; Frontend conserva consultas,
mutaciones y mensajes existentes; Producto y UX dejan siempre visible la acción
primaria y todos los datos críticos; UI fija 44 px y foco a tres anchos sin
inflar escritorio; SEO no aplica a la SPA privada. No hace falta ADR nuevo: M3
ejecuta el contrato reversible del ADR 0031. Sin deploy remoto.

**Siguiente**: M5 — convertir el plano comprimido en una superficie táctil con
targets efectivos de 44 px, pan/zoom compatible con el scroll y ficha inferior,
sin perder la navegación por teclado del SVG.

### Sesión 73 — 2026-08-04 · **M2: lo urgente aparece primero y el shell recupera el foco** (autónoma, protocolo CONTINUA)

**Objetivo elegido**: `[M2] Portada y shell móvil orientados a hoy`, siguiente
P1 recomendado por la auditoría M0 y por `SIGUIENTE-SESION`. Era el camino más
corto para que recepción pueda orientarse y buscar desde un teléfono; no exige
API, credenciales ni una bifurcación del producto. Se implementa bajo el ADR
0031 todavía `propuesto`, con cambios responsivos y reversibles.

**Portada**: el DOM sigue ahora el recorrido móvil: cifras, las tres listas de
la jornada y, al final, el catálogo de módulos. Las clases `order` a partir de
`md` preservan la lectura histórica de escritorio —cifras, módulos, listas— sin
duplicar componentes, datos ni consultas.

**Shell y búsqueda**: la cabecera móvil suma un botón Buscar de 44×44 px. La
paleta deja de esconder su estado en el componente y acepta un único contrato
controlado, de modo que botón y `⌘/Ctrl+K` abren la misma instancia. El input
conserva el foco inicial y `onCloseAutoFocus` devuelve el foco al botón solo
cuando ese fue el origen. `Button` expone su nodo con `forwardRef`, también a
través de `asChild`.

**Menú accesible**: la hamburguesa pasa a ser `SheetTrigger`; Radix puede así
restaurarla al cerrar con Escape. `onOpenAutoFocus` lleva el foco a Inicio en
vez de al tema, y los objetivos táctiles del menú —rutas, tema, salir y cierre—
suben a 44 px bajo `md` sin cambiar la densidad de la sidebar de escritorio.
Los dos enlaces del wordmark reciben también altura táctil en la barra móvil.

**Verificación**: UI **57/57**, dashboard **7/7** y `pnpm check` **46/46**.
Playwright sobre el bundle compuesto, Worker y D1 sembrada valida a 320, 375 y
430 px el orden móvil, blancos de 44 px, foco inicial y retorno de búsqueda y
menú; a 1366 px fija el orden anterior. Se ejecutó junto a la regresión M1 para
confirmar que el cambio compartido del `Sheet` no rompe la ficha: **4/4 verde**.
La prueba recorre los tres anchos en una sola sesión de demo para no consumir el
rate limit de autenticación.

**Pase EQUIPO**: Arquitectura conserva una SPA y una instancia por control;
Fullstack no cambia contratos API ni el despliegue; Backend no recibe rutas ni
permisos nuevos; Frontend unifica estado y deja regresión de teclado; Producto y
UX ponen la jornada y la búsqueda antes que el catálogo; UI conserva 1366 px y
fija 44 px/foco en los tres anchos; SEO no aplica a la SPA privada. No hace falta
ADR nuevo: M2 ejecuta el contrato ya documentado en ADR 0031. Sin deploy remoto.

**Siguiente**: M3 — llegadas, salidas y solicitudes operables con una mano,
elevando acciones primarias y filtros a 44 px sin perder datos ni densidad.

### Sesión 72 — 2026-08-04 · **M1: la ficha cabe en el móvil y vuelve a su origen** (autónoma, protocolo CONTINUA)

**Objetivo elegido**: `[M1] Ficha de reserva móvil`, el candidato recomendado
por M0 y el primer P1 del orden medido. Se implementa bajo el ADR 0031 todavía
`propuesto`: el cambio es reversible, no altera dominio ni contratos de API y
mantiene intacta la variante de escritorio.

**Implementación**: `BookingPanel` elige con `matchMedia` una sola variante —no
duplica formularios, IDs ni peticiones—: `Sheet` modal a ancho/alto de viewport
bajo `md`, y el `aside` no modal de 360 px en escritorio. La hoja integra su
propio cierre de 44 px, cabecera pegajosa, overscroll contenido, safe area,
botones táctiles ≥44 px y entradas/selector/notas/huéspedes a 16 px en móvil.
Radix aporta overlay, Escape y trampa de foco. La ficha captura además el
elemento activo al abrir y lo recupera en el frame posterior al desmontaje.

**Navegación honesta**: el tuple común de `NAV_GROUPS` admite un rol mínimo y
`/parte` declara `manager`. Sidebar y portada consumen `navGroupsForRole`; demo,
consulta y recepción dejan de recibir una puerta imposible, manager y owner la
conservan. Esto solo mejora la promesa de la UI: `requireRole('manager')` sigue
siendo la barrera de seguridad y no se ha tocado ninguna ruta.

**Verificación**: dashboard gana Vitest propio y 7 casos sobre los cinco roles
más el fallo cerrado; UI queda **57/57** con el cierre integrado de `Sheet`.
Playwright contra bundle compuesto, Worker real y D1 sembrada abre una reserva
real a **320, 375 y 430 px** y fija ancho exacto, cero desborde, foco dentro,
tipografía editable ≥16 px, cierre ≥44 px, cabecera visible tras scroll, Escape
y retorno a la fila: **3/3 verde**. La inspección visual a 375 px confirmó la
jerarquía completa hasta pagos. `pnpm check`: **46/46 verde**.

**Pase EQUIPO**: Arquitectura preserva el contrato no modal de escritorio y
monta una sola rama; Backend/Seguridad no cambian API ni autorización;
Frontend/UI y Producto/UX ganan operabilidad táctil y navegación veraz;
Accesibilidad fija foco, Escape y tamaños; QA deja regresiones puras y E2E;
Rendimiento reutiliza Radix ya presente en el bundle; Observabilidad, SEO e
infra no cambian. Sin ADR nuevo y sin deploy remoto.

**Siguiente**: M2 — portada y shell orientados a hoy, entrada táctil de búsqueda
y foco/retorno correctos del menú móvil.

### Sesión 71 — 2026-08-04 · **M0: el gestor móvil se mide por tareas, no por capturas** (autónoma, protocolo CONTINUA)

**Objetivo elegido**: `[M0] Auditoría móvil del gestor por tarea y rol`, el
candidato recomendado de SIGUIENTE-SESION y prioridad declarada por Andreu. No
se corrige una pantalla todavía: se fija primero qué significa poder resolver
una urgencia desde el teléfono, para que M1–M6 no sean una cadena de parches a
375 px.

**Contrato antes de medir**: ADR 0031 (`propuesto`, sesión autónoma de riesgo
bajo) declara tres anchos —320 suelo, 375 objetivo, 430 control—, roles demo y
recepción más gerencia como control, tareas completas, objetivo táctil de 44 px,
inputs móviles de 16 px, foco recuperable y navegación honesta por permisos. La
salida queda en `docs/AUDITORIA-MOVIL.md`, con severidad y fase dueña.

**La evidencia no usa mocks**: D1 local migrada y sembrada con ancla
`2026-08-04`, bundle de `site` + web `/demo/` + dashboard `/admin/` compuesto
como el deploy, Worker real y Playwright sobre Chrome. Se recorrieron portada,
llegadas/salidas, solicitudes, búsqueda global, ficha+cobro, planning y plano;
después `/parte` como demo, recepción y gerencia. La sonda temporal midió
`scrollWidth`, cajas interactivas, tamaños de input y foco, y se retiró al cerrar:
cada M1–M6 conservará solo la regresión estable de lo que arregle.

**Resultado**: cero P0 y cero desborde global en las cinco pantallas base a los
tres anchos. Eso es solo el suelo. Los seis P1 son:

1. la paleta devuelve seis resultados reales y enfoca bien, pero solo se abre
   con `⌘/Ctrl+K`: en un teléfono no existe;
2. `BookingPanel` mide 360 px: desborda **40 px a 320**, deja una tira inútil de
   15 px a 375, cierre 28×28 y cobro a 13 px;
3. el seed ofrece 5 check-in y 10 check-out hoy, con botón **36×28**;
4. el plano ajustado reduce las unidades a **10–17 × 7–12 px**;
5. el planning conserva barras de 24 px y asas de 8 px: se alcanza a mirar, no
   a operar con el pulgar;
6. `NAV_GROUPS` ofrece “Parte de viajeros” a demo/recepción y ambos terminan en
   la negativa de gerencia; el backend protege bien, la navegación promete mal.

**Hallazgos P2 que cambian el orden**: las tres listas del día están después de
los trece módulos de portada; el menú enfoca el control de tema al abrir y no
devuelve foco a la hamburguesa con Escape; fechas/filtros/cobro usan 13–14 px; y
la entrada JS sigue en **768,96 kB min / 230,42 kB gzip**. Solicitudes es la
mejor base: reduce de cinco columnas a tres sin desbordar y expande mensaje,
contacto y acciones; solo le falta tamaño táctil (28–40 px).

**Decisión de producto**: móvil no comprime el tape chart. El orden resultante
es **M1 → M2 → M3 → M5 → M4 → M6**: cerrar cuenta y encontrar reserva; operación
del día; plano; agenda móvil; carga. BACKLOG reescrito con medidas y criterios de
aceptación. `pnpm check` **45/45 verde**; la auditoría exploratoria pasó 1/1 contra
el bundle real.

**Deploy**: no aplica — ADR, informe y continuidad. La producción sigue en
`b65a5dfb`; 67–70 esperan el deploy manual ya documentado.

### Sesión 69 — 2026-08-03 · **Dos bajas de servicio que la demo deja ver** (autónoma, protocolo CONTINUA)

**Objetivo elegido**: resolver el candidato recomendado: Inventario explicaba
el estado «fuera de servicio», pero las 83 unidades del seed estaban activas y
la demostración nunca enseñaba ese flujo ni sus consecuencias en Planning y
Plano.

**Implementación**: el seed determinista marca `C-10` (parcela premium, avería
eléctrica) y `MH-04` (mobil-home, reforma) como `inactive`; el generador de
reservas, el relleno y la banda diaria excluyen esas unidades, conservando cupo
y asignaciones válidas. `unitStateOn` gana el estado `inactive`, pero conserva
visible una reserva previa si alguna administración da de baja una unidad ya
ocupada. Planning tacha y cubre la fila, impide crear, mover o reasignar a una
unidad inactiva; Plano la pinta con trama roja y leyenda, y su ficha deja de
ofrecer el bloqueo temporal. Inventario ya consumía el estado y pasa a enseñar
datos reales, sin texto específico del tenant en la interfaz.

**Verificación**: las 23 anclas del seed exigen exactamente esas dos bajas y
cero reservas asignadas a ellas. `@logic-camp/config` **45/45** y
`@tenant/demo` **58/58** verdes; typecheck, lint y build del dashboard también.
Navegador contra el bundle real: a 1366px, `C-10` muestra la franja roja
«Fuera de servicio» en Planning y `C-10`/`MH-04` aparecen con trama y leyenda
en Plano, sin errores de consola. No se desplegó: producción sigue en
`b65a5dfb`; requiere deploy manual con credenciales locales.

**Pase EQUIPO**: Arquitectura y Fullstack mantienen un cambio de seed y estado
de UI genérico, sin multiplicación por tenant; Backend conserva sus invariantes
de capacidad y asignación, sin API, dinero ni PII nuevos; Producto/UX hacen
visible una situación operativa real y Frontend/UI la distinguen de un bloqueo
temporal. Sin ADR: decisión local, reversible y sin cambio contractual; SEO no
se ve afectado.

### Sesión 68 — 2026-08-03 · **La lista de clientes gana una cola larga real** (autónoma, protocolo CONTINUA)

**Objetivo elegido**: resolver el candidato recomendado: `/clientes` enseñaba
once «Aalto» seguidos porque la biyección nombre×apellido repartía cada apellido
de forma uniforme. Es visible en la demo y no requería credenciales ni una
decisión de producto nueva.

**Implementación**: el seed conserva una plaza única por combinación de nombre y
apellido, pero las plazas de apellidos se asignan por bandas de frecuencia
deterministas: 2–40 apariciones, con pocos apellidos frecuentes y una cola larga
de poco frecuentes. Un paso coprimo recorre esas 2 684 plazas sin dejar una zona
fuera cuando el censo actual (~2 600 fichas) no las llena; dentro de cada apellido
los 40 nombres siguen sin repetirse. Por ello los correos derivados permanecen
únicos.

**Verificación**: se amplía el test sobre las **23 anclas** de ADR 0030: nombres
únicos, primera página con al menos siete apellidos y como máximo cuatro filas por
apellido, frecuencias globales de 1–40. `@tenant/demo` **57/57** y `pnpm check`
**45/45** verde. No se desplegó: producción sigue en `b65a5dfb`; requiere deploy
manual con credenciales locales.

**Pase EQUIPO**: Arquitectura y Fullstack conservan un seed puro, genérico y sin
trabajo por camping; Backend preserva las garantías y no toca API, precios ni PII;
Producto/UX mejoran una lista demostrable; Frontend/UI/SEO no ganan superficie ni
riesgo visual adicional. Sin ADR: el cambio es local, reversible y solo hace real
la lectura de datos fake de la demo.

### Sesión 67 — 2026-08-03 · **La regla dura de niveles queda realmente aislada** (autónoma, protocolo CONTINUA)

**Objetivo elegido**: corregir el incumplimiento de la regla dura de niveles
que SIGUIENTE-SESION marcaba como candidato recomendado: un build de nivel 1
emitía el motor de reservas, sus islas y las rutas del funnel.

**Implementación**: el build lee el `tier` literal del tenant y resuelve los
componentes del motor mediante aliases: niveles 1–2 apuntan a un componente
vacío y nivel 3 al componente real. Las entradas raíz/localizadas del funnel
son rutas dinámicas con `getStaticPaths()` vacío sin motor; las rutas por tipo
mantienen la misma guarda. `Home.astro` solo emite `data-hero-nivel="1"` para
el conmutador de demo, así que un Camp Web real muestra su héroe.

**Verificación**: `TIER=1` → **126 páginas, cero rutas `/reservar`/`/reserva`,
cero chunks `Mostrador`/`Funnel*`/`ReservaGestion` y héroe visible**. `TIER=3`
conserva las rutas y los cuatro chunks del motor. `pnpm check` **45/45 verde**.
No se desplegó: producción sigue en `b65a5dfb`; requiere deploy manual con
credenciales locales.

### Sesión 66 — 2026-08-01 · **Las tres listas del día en la portada, y el wordmark del gestor enlaza** (dos encargos de Andreu)

**Encargo 1: entradas y salidas al lado de las solicitudes, en tres columnas.** La portada de la 65 tenía las cifras de llegadas y salidas pero no decía **quién**. Ahora el bloque de abajo son tres listas en paralelo —entradas de hoy · salidas de hoy · últimas solicitudes—, cinco filas cada una, con nombre, unidad (o fechas) y estado, y cada columna sale a su pantalla. Reutiliza `/api/admin/bookings?arrivalsOn=` y `?departuresOn=` con **las mismas claves de caché que la pantalla de Llegadas**, así que saltar de aquí allí no parpadea.

Las tres comparten un componente `Panel` (cabecera, esqueleto, vacío y error). Lo único que cambia por lista es cómo se pinta la fila: con tres copias, el estado vacío de una acabaría divergiendo de las otras el día que alguien toque una — la lección de las listas de las sesiones 55 y 59.

**Un defecto de lectura, cazado mirando los datos y no la pantalla**: la columna de salidas marcaba con chip lo pendiente y en gris lo hecho, al revés que entradas. Con los datos de hoy —**10 salidas vivas, 0 con check-out**— eso son diez chips negros idénticos gritando a la vez, que es ruido y no información. Unificado: el **chip marca lo que YA pasó por recepción** («Ha entrado» / «Ha salido») y el gris es el estado por defecto. Con 15 entradas y 0 check-in, la columna queda tranquila hasta que alguien empieza a trabajar.

**Encargo 2: el wordmark del gestor enlaza.** «Logic2B» → `logic2b.com` y «Campings» → `camp.logic2b.com`, **igual que en la landing** desde la sesión 59 (Andreu lo confirmó al preguntarle: su frase admitía el orden inverso). El `Wordmark` de `packages/ui` gana `enlazado` —opt-in, así que ningún otro consumidor cambia— replicando el patrón del gemelo Astro: el envoltorio **no** puede ser un `<a>` (HTML no anida enlaces), cada mitad lleva su `aria-label` porque «Campings» a secas no dice adónde va, y el espacio que las separa queda fuera de los dos. Salen del gestor, así que `target="_blank"`: quien está en recepción no pierde la pantalla en la que trabaja. Aplicado a la barra lateral y a la cabecera móvil; **plegada no enlaza**, porque ahí solo queda «2B» y lo que se recorta es el dibujo, no la marca.

**Verificado en navegador**: las tres columnas alineadas en la misma fila a 1600px **y a 1366px** (el suelo declarado del proyecto), apiladas por debajo, móvil a 375px sin scroll horizontal, y los cuatro enlaces del wordmark (dos mitades × barra lateral y cabecera móvil) con su `href` y su `target` correctos. `pnpm check` **45/45**, E2E **9/9**.

### Sesión 65 — 2026-07-31 · **«Gestor de camping», y una portada en vez de aterrizar en el planning** (dos encargos de Andreu)

**Encargo 1: el producto se llama «Gestor de camping», no «el mostrador».** El renombrado tenía trampa, porque en este proyecto «mostrador» significa **tres cosas** y solo una era el nombre del producto:

1. el **widget de disponibilidad** de la web pública (`c.mostrador`, `#mostrador`, `Mostrador.tsx`) — elemento firma del nivel 3 (ADR 0006). **Intacto.**
2. el **canal de venta** `walkin` («Mostrador») y la prosa de las guías («el ordenador del mostrador», «con el mostrador a media luz») — es el mueble de recepción, castellano correcto. **Intacto.**
3. el **nombre del dashboard**, que es lo que se renombra: login (`Entrar al gestor de camping`), héroe/pie/contacto de la landing (es/en) y el enlace del banner de demo en los **seis idiomas**.

De paso cae una **clave muerta que había creado la sesión 63**: `nav.mostrador` se definió en es/en y no la usaba ningún componente — el header son 50px y el enlace al gestor ya vive en el héroe, el pie y la línea de contacto. Es el mismo defecto que las sesiones 52, 55 y 59 (una clave sin UI, o una UI sin clave); esta vez sobraba la clave.

**Encargo 2: la portada del gestor.** Entrar te dejaba directamente en el **planning** — la pantalla más densa del producto, sin contexto y sin una sola pista de que detrás hubiera trece módulos más. Al prospecto de la demo le pasaba dentro del gestor lo mismo que le pasaba en la web antes de la 63: veía una cara y se perdía el resto. Ahora `/` es una portada con tres bloques, en el orden en que se miran:

- **Cifras de hoy**: ocupación (69 de 83 unidades, 83 %), llegadas, salidas y pendiente de cobro del mes. Cada tarjeta es un enlace a la pantalla que la explica.
- **La rejilla de los trece módulos**, agrupada igual que la barra lateral, cada uno con una frase que dice qué es — «Parte de viajeros» no significa nada si no sabes que es lo que pide la Guardia Civil.
- **Las cinco últimas solicitudes**, con contacto, fechas y estado, y salida a la bandeja.

**Sin API nueva**: se compone de `/api/admin/reports` (dos rangos) y `/api/admin/enquiries`, que ya existían. Antes de escribir la pantalla se comprobó en vivo que el rol `demo` puede leer las dos (200/200) — el visitante anónimo es justo quien más la va a ver, y una portada que le sale en 403 sería peor que no tenerla.

**La navegación, en UN sitio**: `NAV_GROUPS` sale de `main.tsx` a `src/lib/nav.ts` porque ahora tiene dos consumidores (barra lateral y rejilla). Dos copias de una lista de rutas se desincronizan el día que alguien añade una pantalla — la lección de las listas de las sesiones 55 y 59, aplicada antes de que cueste. El planning pasa a `/planning`, con sus cuatro referencias movidas: barra lateral, salto desde el plano, «volver al planning» del error de ruta y el mapa de ayuda contextual (la portada no tiene guía propia, así que no se pinta el `?` — `null`, no un enlace aproximado).

**Verificado en navegador** contra el bundle compuesto: rejilla a 1440px en claro y oscuro, los KPI navegan (`#/planning`, `#/llegadas`, `#/informes`), las tarjetas de módulo también (`#/parte`), vuelta por «Inicio» y **móvil a 375px sin scroll horizontal**. Un defecto propio cazado midiendo: «15.848,35 €» a 26px **tocaba el borde** de su tarjeta en dos columnas a 375px → la cifra arranca a 21px y crece con el hueco (16px de aire ahora). `pnpm check` **45/45**, E2E **9/9** — el de `reduced-motion` entraba por la raíz esperando el tape chart y ahora comprueba la portada y llega al planning **con click real** en la barra lateral (navegar por hash deja dos activos, trampa de la 58).

### Sesión 64 — 2026-07-31 · **El mostrador dentro de la ficha de alojamiento** (autónoma, protocolo CONTINUA)

**Objetivo elegido** (el recomendado por SIGUIENTE-SESION, criterio CONTINUA «lo que el cliente ve»): el CTA de la ficha de alojamiento en nivel 3 devolvía al visitante a la home (`#mostrador`) **sin llevarse el tipo que estaba mirando** — justo donde se pierden reservas. Observación de Andreu en la 58, verificada en código.

**Lo que hace ahora la ficha.** El mostrador vive dentro de ella y contesta **solo por su tipo**: mismas fechas, mismo grupo, y el botón «Reservar» entra al funnel con `unit_type` y fechas ya puestos. La API no cambia (`GET /api/availability` sigue devolviendo el camping entero, una sola consulta, **sin endpoint nuevo**) — lo que cambia es qué se pinta.

**Y la decisión que de verdad importaba: qué se dice cuando ESE tipo no entra.** Filtrar sin más convierte la ficha en un callejón sin salida. Como la respuesta ya trae el camping entero, se sabe si queda algo libre: entonces se dice «Este alojamiento no queda libre en esas fechas» **con la salida al mostrador general conservando fechas y grupo** (`?from=…&to=…#mostrador`), que el visitante no tiene que reescribir. Sin alternativa real, no se ofrece enlace falso.

**Dos hallazgos de la verificación en navegador, uno propio y dos preexistentes:**

1. **Propio, arreglado**: el mostrador dentro de la columna lateral **reventó la proporción de la rejilla**. La barra tiene cuatro campos y un botón, así que su ancho mínimo intrínseco es grande, y en CSS grid `1fr` es `minmax(auto,1fr)`: la columna de la ficha se comió el `1.5fr` de la **galería** —las fotos, que son lo que vende— hasta dejarla en una tira de ~300px. Ahora el mostrador va a **ancho completo fuera de la rejilla**; galería medida de nuevo en **705px**.
2. **Preexistente, anotado en BACKLOG**: la **regla dura de niveles está incumplida hoy** — un build `TIER=1` sin conmutador **sí** emite `Mostrador.*.js`. Comprobado que es anterior a esta sesión construyendo el código de la 63 en las mismas condiciones. El cuidado de importar el wrapper dinámicamente no sirve mientras las rutas del funnel se sigan generando en nivel 1.
3. **Preexistente, anotado**: el héroe de nivel 1 de la home queda **invisible** en un build de nivel 1 real (`global.css` oculta `[data-hero-nivel='1']` salvo bajo el conmutador de demo, y `Home.astro` emite el atributo siempre). La ficha nueva emite el atributo **solo con `showTierSwitch`**, que es lo correcto.

**Verificación**: `pnpm check` **45/45 verde**; E2E **9/9** contra el bundle compuesto real, incluidos los **dos tests nuevos** (`apps/web/e2e/ficha-mostrador.spec.ts`). El segundo test no inventa fechas: pregunta a la API por una estancia donde el tipo esté lleno **y** quede otra cosa libre (existe el 3 de septiembre), y si el seed dejara de producir el caso se salta con motivo en vez de fallar en rojo. Etiquetas nuevas en los **seis idiomas**.

### Sesión 63 — 2026-07-31 · **La demo tenía dos caras y la landing solo enseñaba una** (apunte prioritario de Andreu)

**Encargo directo antes de continuar**: que el enlace al mostrador demo sea tan evidente como el de la web demo, y que desde cada cara se salte a la otra.

El producto son **dos** cosas —la web pública y el mostrador— y el recorrido solo ofrecía la primera. Ahora: el héroe de la landing ofrece las dos con el mismo peso, el pie lista ambas y la línea de contacto enlaza las dos; la web del tenant lleva el enlace **dentro del banner de demo** (atrezzo comercial: un camping real sin `isDemo` no genera ni el nodo, y el pie «powered by Logic2B» sigue siendo el único punto de marca Logic2B en su web); y el `DemoBanner` del dashboard gana la vuelta a la web.

**Un 404 vivo en producción, encontrado al verificar**: el CTA «Verlo funcionando en la demo» de la sección del planning apuntaba a `/demo/admin/` y el dashboard se sirve en `/admin/`. Roto desde que ADR 0016 movió la web del tenant bajo `/demo/` — era el **único** enlace de la landing al mostrador, así que la única puerta que existía estaba tapiada. En BACKLOG queda la causa de que durara tantas sesiones: **nadie comprueba los enlaces entre las tres superficies del bundle compuesto**, y no lo cazaría un test de `apps/site` porque `/demo/` y `/admin/` solo existen cuando `deploy:demo` compone los tres `dist/`.

Vocabulario: se deja de decir «la demo» como si fuera una sola cosa — la web es «la web de ejemplo» y el dashboard «el mostrador», que es como ya lo llamaba el login.

**DESPLEGADO** (`camp.logic2b.com`, versión `c86d5793`) y verificado contra producción con `no-cache`: cuatro rutas a 200, los ocho enlaces en su sitio en es y en, `/demo/admin/` sin un solo enlazador. De limpieza: retiradas dos ramas de sesión ya mergeadas en `origin` y un worktree huérfano de la 49.

### Sesión 60 — 2026-07-30 · **El header a los raíles de norte y la landing empieza a vender escalabilidad** (con Andreu · D5.2 temprana)

**Sesión interactiva, dos mandatos de Andreu**: (1) igualar los márgenes del header de la landing con `logic2b-norte`, y los bordes de los botones — que se asemeje a la imagen Logic2B; (2) **prioridad a marketing**: empezar a promocionar el servicio, orientado a **transmitir escalabilidad** (el mandato que el roadmap ya recogía en el Frente D), lo más profesional posible.

**El header, medido contra norte, no estimado.** Norte usa contenedor de `--maxw: 1440px` con gutter `clamp(24px, 4vw, 32px)` y 50px de alto; el nuestro era `max-w-6xl` (1152px), `px-4` (16px) y 56px. En botones, norte fija `--r-btn: 10px` «el mismo en header, prefooter y forms» — y nuestro DS **ya tenía ese valor** en `--radius` (0.625rem), así que igualar es pasar de `rounded-md` (8px) a `rounded-lg` (= `var(--radius)`): **cero tokens nuevos**. Aplicado a los 7 botones/CTA de la landing (header ×2, héroe ×2, planning, niveles, formulario); el footer sube a los mismos raíles para que los dos wordmarks alineen. Verificado computado en navegador: 50px de alto, 1440px, 24px de gutter al viewport de prueba, 10px de radio.

**Marketing: la versión temprana de D5.2 que el propio Frente D deja adelantar** (`FRENTE-D-ESCAPARATE.md` §7: la franja de cifras tiene versión que no depende del portfolio — y Andreu presente pidiendo priorizar marketing es exactamente el «decidir en D0 si se adelantan»). Se construyen las dos piezas de §3 que **no prometen nada inclicable**:

- **La franja de cifras** (§3.2): sección nueva `#escala` entre el planning y los niveles — «1 código para todos los campings · 1 base de datos por camping · 4 niveles del mismo producto · 1 tarde para el alta», numerales grandes en Space Grotesk sobre hairlines. **Solo cifras que ya son verdad hoy**, como exige el doc. La **galería del portfolio (§3.1) NO se abre**: el criterio «nunca prometer en la landing lo que no se puede clicar» sigue mandando y no hay ≥3 demos.
- **La escalera como recorrido** (§3.3): «¿Cuántas parcelas tienes?» con cuatro chips (menos de 25 · 25–100 · más de 100 · ya tengo web) que señalan la tarjeta de su nivel con el anillo y lo dicen en texto («Tu punto de partida: Camp Solicitudes…»). Vanilla JS sin backend, `aria-pressed` + `role=status`; mientras hay elección, la tarjeta destacada estática **cede el anillo** (CSS por especificidad, no JS), y el segundo clic desmarca.
- El nav de la landing gana **«Escalabilidad»** y pasa a ordenarse como las secciones al hacer scroll (Producto · El planning · Escalabilidad · Planes · Guías).

**Los seis idiomas a la vez, cada uno en su tono** (es/ca tutean, fr de vous, de con Sie, nl con u): los 6 JSON ganan `nav.escala`, el bloque `escala` y `niveles.selector`, insertados por script para que el diff sean solo las claves nuevas (+46/−2 por fichero, cero ruido de reformateo).

**Trampa de verificación nueva** (a SIGUIENTE-SESION): con `transition-colors` en el elemento, `getComputedStyle` leído en el mismo tick del click devuelve el color **viejo** (t=0 de la transición) — parecía que `aria-pressed:bg-primary` no aplicaba, y aplicaba perfectamente. Se mide tras dejar acabar la transición.

**Verificado** — `pnpm check` **45/45 verde**, 186 páginas construidas. En navegador: métricas del header computadas, recorrido funcionando en es y fr (el mensaje coge el nombre del nivel **ya traducido**: «Camp Moteur»), sin errores de consola.

**Segunda parte (decisión de Andreu en la misma sesión): la landing se queda en DOS idiomas, es/en.** El razonamiento que la sostiene: la landing le vende al **dueño** del camping (mercado es/en); los seis idiomas son para el **campista**, y viven en la web de tenant (`apps/web`), **que no se toca** — así los textos de la landing que presumen de «6 idiomas» siguen siendo verdad, porque hablan del producto, no de la landing. Ejecución barata porque solo había UN punto cableado: `LOCALES` en `lib/i18n.ts` (páginas `[lang]`, sitemap, hreflang y selector del pie derivan todos de ahí) + borrar `ca/fr/de/nl.json` (las traducciones de la primera parte incluidas — dos horas de vida, cero deuda). Verificado: hreflang es/en/x-default, pie ES·EN, `/en/` 200, `/fr/` y `/de/` 404, `pnpm check` 45/45 verde.

**Pendiente que deja**: la deuda de despliegue ya son **TRES sesiones (58, 59 y 60)** y esta es la más visible — la landing de venta entera. La galería del portfolio sigue esperando ≥3 demos (gate del ADR D0 intacto).

### Sesión 61 — 2026-07-30 · **La landing fuera de la landing: la tarjeta al compartir y lo que lee Google**

**Objetivo elegido** (CONTINUA, prioridad "lo que el cliente ve" + el mandato de marketing de la 60): lo que un prospecto ve de la landing **sin estar en la landing** — al compartir el enlace y en los resultados de búsqueda. Motivo de urgencia: la OG image seguía diciendo **«LogicCamp» con el isotipo**, una marca que desde la 59 **no existe en ninguna pantalla**; compartir el enlace enseñaba un producto distinto del que se abre al clicar.

**La OG regenerada, y esta vez con generador commiteado.** La tarjeta de C5.2 se renderizó con un script de sesión que no se guardó, así que rehacerla ha costado reconstruir el generador entero — exactamente el coste que la regla de "no multiplicar trabajo" existe para evitar. Ahora vive en `apps/site/scripts/og.mjs` (`pnpm --filter @logic-camp/site og`): un cambio de marca es **un comando**. Dos tarjetas, **una por idioma** (`og.png` / `og-en.png`), con el texto sacado del **mismo `content/{lang}.json`** que pinta la landing — compartir el enlace en inglés y recibir una tarjeta en español es el detalle que delata a un producto descuidado.

**Los colores NO se copian al generador: se leen del `:root` de `packages/ui/src/theme.css`.** Empezaron como literales y era la misma deuda en pequeño (la marca cambia en el DS y no en la tarjeta). Prueba de que la lectura es fiel: al sustituir los literales por la lectura, el PNG salió **byte a byte idéntico** (mismo `shasum`). Trampa encontrada al hacerlo: cortar el CSS por `indexOf('.dark')` corta **en un comentario de la línea 42** que menciona `.dark`, dejando fuera medio `:root` — se corta por el selector (`/^\.dark\s*\{/m`).

**Composición**: sin isotipo (retirado en la 59), el hueco que dejaba lo ocupa una jerarquía real — kicker · wordmark «Logic2B Campings» (Poppins 600/800, el mismo lockup del header) · titular del héroe en Space Grotesk · la promesa de alta · pie con dominio. Primera versión rechazada por dos motivos mirando el PNG: el tercio central quedaba hueco y **la rejilla se veía justo en la mitad sin contenido** (el velo la apagaba solo bajo el texto), así que el lado vacío se leía como un descuido en vez de como aire.

**Datos estructurados, que no había ninguno.** `Organization` + `SoftwareApplication` en el layout (todas las páginas) y **`FAQPage` en la landing**, construida desde el **mismo array** que pinta los `<details>` — Google exige que la respuesta esté visible, lo está, y si alguien borra la sección el marcado se va con ella. Escrito con una regla explícita: **cero `aggregateRating` y cero reseñas** (no existen, inventarlas es mentir y Google lo penaliza) y **sin `offers`** (los precios son a medida; declararlos exigiría un número que no existe). Un fallo propio corregido al verificar: `applicationSubCategory` acababa valiendo «Logic2B Campings» —el nombre, no una categoría— y se elimina: un valor incorrecto es peor que ninguno.

**Meta social completa**: `og:site_name`, `og:locale` + `og:locale:alternate`, `og:image:width/height` (sin ellos algunas redes recortan a cuadrado en vez de servir la tarjeta ancha), `og:image:alt` y `twitter:image:alt`.

**Verificado** — `pnpm check` **45/45 verde**. En navegador y **en el HTML construido** (no solo en dev): los tres tipos de JSON-LD parsean en es y en en, `/` sirve `og.png` y `/en/` sirve `og-en.png` (200, `image/png`), 5 preguntas en el marcado y 5 visibles en la página.

**Pendiente que deja**: la deuda de despliegue sigue siendo de tres sesiones (58–60) y suma esta. Sin desplegar, la tarjeta vieja seguirá saliendo al compartir `camp.logic2b.com`.

### Sesión 62 — 2026-07-30 · **Desplegadas las sesiones 58–61 · y el renombrado de la 59 estaba incompleto**

**Andreu dio el visto bueno y pidió desplegar.** `pnpm --filter @logic-camp/api deploy:demo` (reconstruye landing + web con `BASE_PATH=/demo` + dashboard, recompone `apps/site/dist`, aplica migraciones remotas y despliega). Versión **`78616a9d`**, 86 assets nuevos, migraciones sin cambios pendientes. **La deuda de cuatro sesiones (58–61) queda en producción.**

**Dos hallazgos que solo aparecieron verificando contra producción, no contra el build local:**

**1. Un HIT de caché de borde enseñando el título viejo.** La primera comprobación de `camp.logic2b.com/` devolvió `<title>Logic Camp — …`, el nombre anterior al cambio de logo. No era un deploy a medias: `cf-cache-status: HIT` sobre una copia rancia; con `?v=` o `Cache-Control: no-cache` salía ya el título nuevo, y minutos después el HIT también. **La comprobación que sí vale para un asset que conserva la URL**: `og.png` no cambia de nombre entre versiones, así que se comparó el **shasum de producción contra el local** — idénticos, o sea que el borde ya servía los bytes nuevos de la tarjeta. Nota para futuros deploys de marca: verificar contenido, no código de estado, y hacerlo con cache-buster antes de dar nada por roto.

**2. El renombrado de la sesión 59 dejó cuatro sitios vivos** — sus «34 apariciones» cubrieron i18n del producto, títulos de docs y `app.nombre`, pero no el HTML estático ni las cadenas de servidor. El peor, con diferencia: **el banner de la demo del tenant en los seis idiomas** («Estás viendo la demo comercial de **Logic Camp**») — lo lee todo prospecto que clica "Ver la demo en vivo", justo después de que la landing le haya dicho «Logic2B Campings». Los otros tres: el `<title>` del dashboard (`apps/dashboard/index.html`, la pestaña del navegador de la recepcionista), el remitente de los avisos de plataforma (`notify.ts`) y el remitente + asunto del correo de peticiones de demo (`leads.ts`). Corregidos los cuatro; el banner es contenido de build, así que **no hace falta reseed**.

**`pnpm check` falló dos veces y a la tercera dio verde, sin tocar nada entre medias**: `@logic-camp/api#test` en aislamiento da **237/237**, y bajo turbo con el dev server y el navegador abiertos se cae. Es contención de recursos de la suite de workerd, no una regresión — pero queda escrito porque un rojo intermitente que nadie explica acaba normalizándose.

### Sesión 59 — 2026-07-29 · **B1 cerrado (11/11) — el formulario que guardaba el otro formulario** · y, a petición de Andreu, **el logo pasa a «Logic2B Campings»**

**Objetivo**: `[B1]` Parte y Ajustes, las dos pantallas que faltaban para cerrar la adopción del DS. Elegido del prompt de la 58 (dashboard = lo que el cliente ve en la demo, sin credenciales).

**Lo primero: el cron de las 3:00 SÍ corrió.** Sin credenciales, como visitante contra `camp.logic2b.com`: las reservas vienen con `createdAt` = `2026-07-28T08:00:00Z`, o sea el ancla del día. **La vigilancia de ADR 0030 §2 queda despejada entera** (la otra mitad —el reset a mano en 1,2 s— la cerró la 58).

**Ajustes: el hallazgo no era markup, era comportamiento.** El bloque de notificaciones vivía **dentro del `<form>` de datos del camping**. Como la sumisión implícita de un `<input>` va a `input.form`, pulsar **Intro** en «Buzón interno de avisos» disparaba el submit de nombre/zona/moneda — y si esos tres no estaban sucios, **no pasaba absolutamente nada**: el correo escrito se perdía al navegar, sin aviso. Ahora son dos `<form>` con su propio submit. **Verificado con Intro real (Playwright)**: sale **un solo PATCH** y es el de `modules.notifications`. De paso, guardar notificaciones decía «Ajustes guardados» — clave propia.

**Ajustes, la parte que sí era markup.** Una columna de `max-w-xl` dejaba **dos tercios del lienzo vacíos** a 1366px → tres `Card` del DS en rejilla de dos columnas (547px cada una). Las dos fichas cortas van **apiladas en la misma celda**: como celdas hermanas, la fila la estiraba «Notificaciones» y quedaban 200px muertos. Y la ficha de solo lectura «Nivel e idiomas» **sale de entre el último campo editable y el botón de guardar**, que es donde parecía un campo más.

**Parte: la forma de pago a 810px de su reserva.** Medido, no estimado: el `justify-between` a lo ancho de la fila dejaba el desplegable **810px** a la derecha de su código de reserva —más cerca de la fila de abajo que de la suya—. Ahora es columna de ancho fijo (11rem) con cabecera, y **la rejilla vive en UNA constante** compartida por cabecera y filas (regla de la 55: en una lista de filas que no son `<table>`, ninguna columna `auto`). Verificado: las 8 filas y la cabecera caen en **x=819 exacto**. Además, el campo de fecha crudo pasa al `Input` del DS —era 29,5px contra los 28px de sus vecinos y **sin anillo de foco**, comprobado con Tab de verdad— y los dos estados vacíos pasan a `EmptyState`.

**Con esto B1 queda 11/11.** La adopción de los primitivos del DS en el dashboard está cerrada.

**Segunda parte (petición extraordinaria de Andreu): el logo.** «Logic2B Campings», tipografía y estilo de `logic2b-norte`, **sin isotipo**. El lockup replicado: Poppins, «Logic» en **600** a plena tinta y «2B» en **800** un punto por debajo (`--logo-2b`), tracking `.015em`; «Campings» hereda el 600 y baja a gris de cuerpo. De norte se copia la **relación**, no los hex: allí el texto arranca más oscuro que en este DS. Tipografía y color viven en `packages/ui/theme.css`, y el lockup en un `Wordmark` de React con su gemelo `Wordmark.astro` que comparte clases — cabecera, pie y login no pueden divergir. Aplicado en dashboard (sidebar, cabecera móvil, login) y landing (cabecera y pie), y renombradas las **34 apariciones** de «Logic Camp» en los seis idiomas, títulos de docs y `app.nombre`.

**Tres decisiones del logo, escritas porque no eran obvias.** (1) **La sidebar plegada son 56px**: ahí no cabe ni «Logic2B», y al retirar el isotipo alguien tenía que ocupar ese hueco → plegada enseña **«2B»** (20px), que es la parte distintiva del lockup y no un símbolo nuevo; nombre accesible completo por `aria-label`. (2) **El favicon sigue siendo el isotipo**: un wordmark no funciona a 32px. `LogoMark.astro` de la landing queda sin uso pero conservado y anotado — igual que norte conserva `.logo-mark` por si se recupera. (3) **El pie de la web del tenant mantiene el isotipo** como firma «powered by Logic2B»: ahí no es el logo del producto, es un crédito (decisión de Andreu al acotar el alcance).

**Un derroche que delató la propia build**: `@fontsource/poppins/600.css` arrastra todos los subsets y metía **180 kB de Poppins Devanagari** para pintar dos palabras. `latin-600`/`latin-800` → **16 kB**. En la landing el 800 va subsetado a sus dos glifos (824 B, reaprovechado de norte) con la orden de regeneración escrita al lado.

**Verificado** — `pnpm check` **45/45 verde**. En navegador contra el Worker real: Poppins cargada en los dos pesos, 600/800 y colores correctos, **cero isotipos** en la landing, sidebar plegada con «2B», y **0px de desborde horizontal a 375px** en Ajustes, Parte y la cabecera móvil.

**Pendiente que deja**: `docs/BRAND.md` §2 describe el logo anterior. Y sin desplegar: se acumula a la deuda de la 58.

### Sesión 58 — 2026-07-28 · **La deuda desplegada y las dos rejillas al DS** (con Andreu · BACKLOG `[B1]` 9/11)

**Sesión interactiva**: Andreu pidió levantar dev, repasar el proyecto y planificar. Del plan salieron dos decisiones suyas: **desplegar la deuda de las sesiones 53–57 ahora mismo** (antes de trabajar, para que lo desplegado fuera exactamente `origin/main` verificado) y **B1 Informes + Inventario** como objetivo. ADR 0030 sigue `propuesto` — no le tocaba a esta sesión aceptarlo.

**El deploy, y lo que enseñó por el camino.** El primer intento murió con «The request to Cloudflare's API timed out» — y `camp.logic2b.com` tampoco contestaba, con google en 200: la red local resolvía DNS a 200–300 ms por consulta y a ratos se atascaba (forzando `-4` o `-6` conectaba al instante). Reintento en ventana buena: **sin migraciones que aplicar, versión `9d85c8c5`**, los dos crons declarados. La verificación remota incluyó lo que ADR 0030 §2 pedía vigilar: **el reset re-siembra la D1 real en 1,2 s** (pulsado como visitante, con su sesión invalidada y los datos re-anclados al día — `/api/admin/reports` del 28 de julio con la ocupación de julio). Queda la otra mitad: mirar mañana el cron de las 3:00.

**El hallazgo previo al deploy, apuntado donde toca.** En LOCAL ese mismo endpoint **cuelga workerd**: 180 s sin contestar y el proceso deja de servir hasta `GET /`. El atajo de la sesión 56 («`POST /api/demo/reset` sin parar nada») **ha muerto en local** con el seed de 3,4 MB — el camino ahora es parar el preview, `pnpm db:reset && pnpm db:seed` (el CLI va por fichero, no por el batch en-worker, y tarda segundos) y relevantar. En BACKLOG como `[infra]`, con el dato remoto al lado para que nadie lo lea como riesgo de producción.

**Informes.** El defecto anotado se confirmó en pantalla antes de tocar nada: «INGRESOS (POR LLEGADA)» a dos líneas hundía su cifra. El `Tile` a mano pasa a `Card` del DS, y el arreglo es **reservar dos líneas de rótulo en las cinco tarjetas** (`min-h-[2lh]` sobre el `CardDescription`): las cifras comparten línea base a cualquier ancho — **verificado forzando el caso** a 1100px, titular partido y cifras alineadas — y con cualquier idioma, que es el motivo de no arreglarlo acortando el copy: las traducciones alemanas partirán titulares que el español no parte. Esqueleto a la misma forma (ADR 0020).

**Inventario, donde el encargo se equivocaba.** «Rejillas de tiles → Card» decía el BACKLOG, pero los chips **ya eran** `Button` del DS con `AlertDialog` de confirmación y esqueleto con forma real. Lo crudo era la **estructura**: ocho secciones planas apiladas en una columna, con «Mobil-home 5 pax · 4» dejando el 90 % de su fila vacía. Ahora cada tipo es una ficha `Card` (el `h2` se queda, por semántica) en **rejilla de 2 columnas** — los 8 tipos y las 83 unidades a la vista sin scroll a 1100×800, y los pares naturales del catálogo (24/18, 10/8, 8/6, 4/5) equilibran las alturas solos. Sexta sesión seguida en que **mirar la pantalla antes que el markup** cambia el trabajo.

**Verificado** — `pnpm check` **45/45 verde**. En navegador contra el Worker real, claro y oscuro: cifras alineadas con y sin titular partido, diálogo «¿Dar de baja A-01?» vivo dentro del `Card` y cerrado con Escape, un solo `aria-current` tras click real, 0 errores de consola. Los datos locales re-sembrados con ancla de hoy: la entrega de la 57 enseña sus dos gestos (9 llegadas · 15 salidas el 28 de julio, botones de check-in y check-out presentes).

**Tres hallazgos a BACKLOG.** (1) **Ninguna de las 83 unidades está fuera de servicio** — la cabecera explica un estado que la demo no enseña nunca, «válido pero falso» otra vez. (2) La sidebar **duplica el activo** solo con navegación programática por hash (URL directa o `.click()` sintético); con puntero real, perfecto — lo verá un E2E antes que una persona. (3) El cuelgue del reset local de arriba.

**Sin desplegar el trabajo propio de la sesión** (el deploy fue deliberadamente anterior): Informes e Inventario salen en el próximo `deploy:demo`.

**Segunda parte (misma sesión): el briefing de producto de Andreu → Frente D documentado.** Andreu pidió dejar constancia en el roadmap, "súper súper detallado", de una dirección de producto/marketing que corre prisa **poder enseñar** (la construcción espera a que el backend demo esté muy avanzado): (1) **más sensación de escalabilidad en la landing de venta**; (2) un **portfolio de 12 demos** en tres escalones de nivel — con el objetivo declarado de **abarcar el máximo de clientes posibles**; (3) **creatividades de campaña de muestra** (display Google/Meta + búsqueda, maquetas fake con UTM que clican al funnel de su demo — el cierre del argumento anti-OTA); y (4) una observación suya sobre la demo actual que resultó exacta al verificarla en el código: **el detalle de alojamiento no permite consultar disponibilidad ahí dentro** — `AlojamientoDetalle.astro:57` manda al visitante de vuelta a la home (`#mostrador`) sin precargar el tipo que estaba mirando, justo donde se pierden reservas. Todo escrito en **`docs/FRENTE-D-ESCAPARATE.md`** (visión, 12 demos con nombre/slug/tema/qué-demuestra, fases D0–D6, encaje temporal, coste de materia, infra ×12 como preguntas del ADR, honestidad comercial de las maquetas), resumido en `ROADMAP.md` §Frente D con decisión anotada, y en BACKLOG los cuatro ítems ([4.x/web] mostrador en el detalle — candidato cercano —, [D], [D5], [D6]).

**Tercera parte (misma sesión): la rectificación de alcance.** La primera redacción del portfolio incluía casas rurales, un hostal y un hotel (el briefing original los pedía), y eso matizaba el "solo campings" de §0. **Andreu lo rectificó al leerlo: campings, y solo campings** — los otros verticales **serán un CLON del proyecto cuando llegue el momento** (un vertical, un producto; el mismo patrón de casa que separa ecom de camp). Los cinco huecos del portfolio se rellenaron con campings de segmentos distintos (el grupo grande pasa a enseñar cuatro NEGOCIOS de camping: resort premium, interior/eco, animación familiar con sábados en bloque, e invernante todo-el-año — este último es justo la mezcla que ADR 0030 metió en el seed), `CLAUDE.md` y §0 quedan intactos, el ADR D0 pierde el punto de alcance, y la rectificación queda anotada con fecha en ROADMAP §Decisiones. La lectura estratégica que queda escrita: construir las 12 demos con `pnpm new:camping` es a la vez la prueba comercial y **doce ensayos del onboarding de la Fase 9** — la promesa "un alta en una tarde" sale del frente medida o desmentida.

### Sesión 57 — 2026-07-27 · **El ancla móvil: el seed tenía un "hoy" y el dashboard tenía otro** (autónoma, protocolo CONTINUA · ADR 0030 `propuesto`)

**Objetivo elegido** (candidato `[10]` recomendado por SIGUIENTE-SESION, con la evidencia que la sesión 56 le puso encima): **el reset nocturno v2**. Estaba declarado fuera de v1 en ADR 0013 §1 con un motivo que seguía siendo válido; lo que cambió fue el precio, medido: **el botón de check-out no aparecía nunca, ningún día del año**, y fuera de abril–octubre `/llegadas` —la pantalla que la recepcionista mira más veces al día— salía **vacía**. Como reabre una decisión cerrada, ADR primero (`0030`, marcado `propuesto` para que Andreu lo valide a posteriori: toca solo `tenants/demo/`, ningún camping real carga un byte de esto).

**La raíz, en una frase.** `generateSeed(anchorYear)` derivaba TODO —qué está terminado, quién está en casa, quién ha hecho check-in, cuántos días lleva una solicitud— del `15 de julio`. El dashboard mira el día real del navegador. Las dos líneas temporales solo coincidían un día al año, y ni siquiera ese: `anchor < to` excluye justo a quien se va el propio 15 de julio.

**Lo hecho — el generador**

- **El ancla es una FECHA y es hoy.** `generateSeed(anchor: string)`. El reloj lo lee el llamante (`reset.ts` con `hoyIso()`, `write-seed.ts` con `SEED_ANCHOR`, `data.ts` con el día del build), nunca el generador: sigue siendo puro y el reset determinista dado su ancla.
- **El PRNG se sigue sembrando con el AÑO, y eso es media decisión.** Si colgara del día, la demo se reorganizaría entera cada madrugada: otras reservas, otros clientes, y el `CS-2026-0412` que un comercial enseñó ayer sería hoy otra cosa. Lo que se mueve es la línea de HOY, no el camping — con test: las doce anclas de 2026 producen **exactamente el mismo reparto de estancias**. Para eso, los tres sorteos que dependían de una rama (`rEstado`, `payRand`, `recepRand`) pasan a consumirse **siempre**: una tirada condicional desplaza la secuencia y con ella la temporada entera.
- **La ventana de siembra** pasa de `abr-15 → oct-15` a **`${Y-1}-11-15 → ${Y+1}-02-15`**. El desborde de dos meses y medio por lado no es lujo: sin él, el 1 de enero la demo no tiene ni un día de pasado (`/informes` en blanco) y el 28 de diciembre no tiene futuro (el planning acabando en una pared). Son los meses más flojos, o sea el trozo de calendario más barato.
- **La temporada declarada, en cambio, vuelve al año natural** (`1 ene – 31 dic`). Se probó declararla sobre la ventana entera y **la tabla de tarifas de la web pública quedó diciendo «Apertura · 15 nov – 15 feb»** —imprime el rango sin años—, que es lo contrario de lo que significa. Cazado en el navegador, no en un test.
- **La curva de ocupación gana el invierno** (18–22 %) con la mezcla que lo explica: el fin de semana corto de siempre conviviendo con el **invernante** que se planta 45 noches. Sin la parte larga no hay ocupación; sin la corta no hay llegadas ningún día. Y un bloqueo `longstay` de invierno, que faltaba: los dos que había eran de verano.
- **La línea temporal, en una función de cinco casos** (`situacionDe`): pasada · **sale hoy** · en casa · **llega hoy** · futura. Las dos en negrita no existían. De paso, el histórico deja de mentir: hasta hoy una reserva `completed` de mayo no tenía ni check-in ni check-out — la ficha del cliente decía que aquel huésped nunca llegó a entrar.
- **Las seis reservas de caso límite** dejan de llevar el estado escrito a mano donde el estado **no es el caso** (cruce de temporada, estancia larga, grupo familiar): lo derivan del ancla. Y la reserva **sin unidad asignada** —la bandeja "sin asignar" del planning, que es una TAREA— se coloca relativa al ancla: clavada en agosto, once meses al año era historia.

**Lo hecho — lo que el sorteo no puede garantizar: la banda del día.** El 15 de enero, con el camping al 18 %, el relleno dejaba **UNA** salida en todo el día, y esa una estaba entre el 25 % que ya había entregado la llave: el botón de check-out volvía a no existir. Un día concreto es una tirada, no una propiedad. Así que se **plantan** seis reservas alrededor del ancla —dos salidas con el gesto disponible, una que ya se fue, dos llegadas por registrar, una ya registrada—, como los quince casos de la bandeja de solicitudes (55) y los casos límite. Van **después** del relleno a propósito: si fueran antes, sus fechas empujarían el cursor del recorrido por unidad y la demo dejaría de ser la misma todos los días. Y si no hay hueco para nueve noches (junio va al 45 % pero troceado en estancias de tres), **se acorta la estancia** en vez de renunciar a la unidad.

**Verificado** — `pnpm check` **45/45 verde**, `tenants/demo` **57/57** con la batería nueva del ancla móvil, que se juzga sobre una **muestra de 23 anclas**: los doce meses, los bordes duros del calendario (1 de enero, 31 de diciembre, 29 de febrero) y diez temporadas seguidas. El defecto era estacional, así que un test estacional lo habría dejado pasar igual que lo dejó pasar la aplicación. En navegador contra el Worker real, en claro y oscuro: **13 llegadas · 11 salidas** el día real, con **8 botones de check-out** y 6 de check-in, y el gesto ejecutado de verdad («Check-out registrado», la fila pasa a «Completada»). Y resembrando con ancla **2026-01-15**: 7 llegadas · 3 salidas, 5 check-in, 2 check-out, planning con **136 reservas a la vista** y la bandeja "sin asignar" con su tarea. 0 errores de consola.

**Coste, y qué vigilar.** El seed pasa de **2 032 a 3 491 reservas** y el SQL de **1,95 a 3,4 MB** (53 → 84 sentencias): son quince meses de temporada donde había seis. El `db.batch()` del reset sigue siendo una transacción y el límite que encontró ADR 0019 §2.3 era el **número** de sentencias (>8 000), no los bytes — pero conviene mirar el cron tras el primer deploy: si fallara, la demo se queda con los datos de la víspera.

**Hallazgo no arreglado, con diagnóstico.** `/clientes` enseña **once "Aalto" seguidos**, y no es el defecto de las sesiones 53/54 otra vez: el emparejamiento nombre×apellido es una biyección **uniforme**, así que cada apellido toca a exactamente `fichas / apellidos` fichas (~9 antes, ~11 ahora) y la lista se ordena por apellido. **Alargar el repertorio no lo arregla** — ya se ha alargado dos veces (40 → 161 → 242) y el bloque sigue midiendo N/L. Hace falta la cola larga que tienen los apellidos de verdad, y eso pelea con la garantía de unicidad de la sesión 54. En BACKLOG, y escrito **dentro del test** que pasa, para que nadie lo lea como "esto está bien".

**Sin desplegar.** No toca esquema. El reset nocturno re-siembra desde `generateSeed()`, que es código desplegado: un `deploy:demo` normal y a las 3:00 la demo remota tiene el ancla del día. **No hace falta `db:seed:remote --apply`.**

### Sesión 56 — 2026-07-27 · **Llegadas: veinte filas diciendo lo mismo, y una rejilla que nunca alineó** (autónoma, protocolo CONTINUA)

**Objetivo elegido** (candidato `[B1]` recomendado por SIGUIENTE-SESION): **Llegadas**, la gemela de Solicitudes y la pantalla de la operación diaria — la que la recepcionista mira más veces al día. El encargo traía dos preguntas concretas: si arrastra el mismo `auto` de la última columna, y si le falta cabecera. La primera, sí. La segunda, **no** — y eso es una decisión, no un olvido (abajo).

**Lo que se veía al abrir la pantalla.** Las veinte filas del día —once llegadas y nueve salidas— con la **misma palabra en la última columna**: «Pendiente: …», en rojo, todas. Ni una «Pagada». El seed cobraba a **todas** las confirmadas el mismo 30% (`paidRatio ?? 0.3`), así que la columna del saldo era una constante disfrazada de dato. Es el patrón de las sesiones 53, 54 y 55 por cuarta vez: **válido y falso a la vez**, invisible para cualquier test de invariantes porque cada fila, por separado, cuadra.

**Lo hecho — el seed (`defaultPaidRatio`)**

- Lo cobrado depende ahora de **dónde está la estancia** y de **por dónde entró**, no de una constante: terminada o ya empezada en el ancla → **liquidada** (nadie pasa una semana dentro debiendo el 70%); futura sin confirmar → 0; futura de **mostrador** → 0 (quien aparece sin reserva no ha podido pagar nada antes); futura de **teléfono** → señal del 30% o nada; futura de **web** → señal del 30% o **la estancia entera**, que es el caso que hace aparecer «Pagada».
- El sorteo sale de un **PRNG propio** (`payRand`), no del general y no de `bkgN`. Del general, porque el relleno por curva sortea fechas, duraciones y huecos contra `rand()` y una tirada de más movería la temporada entera. De `bkgN`, porque de ahí ya cuelgan el medio de pago (`% 6`, `% 4`), el idioma (`% 6`), los habituales (`% 4`) y el check-in (`% 5`) — **dos rasgos sobre el mismo contador no son dos ritmos** (lección de la 54), y el resultado habría sido "todas las de tarjeta van pagadas".
- Cinco tests nuevos sobre **diez temporadas**, uno de ellos comprobando el desacoplamiento desde fuera (dentro de cada `payment_kind` tiene que haber de las dos). Los cinco fallan con el código viejo.

**Lo hecho — la pantalla**

- **La rejilla, medida antes de tocarla.** Las dos columnas de los extremos eran `auto` y cada fila es su propia rejilla (`<button>` sueltos, no un `<table>`): la columna 1 medía 33,8px con «A-01» y **46,7px con «MH-03»**, así que el titular arrancaba 13px más a la derecha en esa fila; y la columna 3 pasaba de 117,4px («Pendiente: 823,20 €») a **74,6px** («Pagada»), 43px de salto que **no se veía porque «Pagada» no existía**. Los dos defectos se tapaban el uno al otro.
- **Y un tercero, mayor**: el botón de recepción vive fuera del `<button>` de la fila, así que la fila que **no** puede registrarse (una llegada aún pendiente de pago) se estiraba **109px** más que sus vecinas y sacaba su estado y su saldo fuera de columna. Ahora el hueco del botón se reserva para toda la lista o para ninguna fila. Medido después: **un solo valor** por borde de columna en cada lista.
- **El corte de las dos listas iba por `lg:`, es decir por el ancho de PANTALLA — y quien las estrecha es la ficha de reserva.** A 1366px con el panel abierto el hueco baja de 1142 a 782px y las dos columnas seguían partiéndoselo: titular de **45px**, «Pierre B…». Es la trampa de la 52 ("la densidad se rompe donde la lista se estrecha") en su forma literal: la media query medía otra cosa distinta de la que se rompía. Ahora el corte lo decide el hueco real (`@container`, umbral 1024px sacado de la cuenta de la fila) y con la ficha abierta las listas **se apilan**: titular de 394px.
- **Trampa nueva de `@container`**: el contenedor y el `@3xl:` **no pueden ir en el mismo elemento**. No falla ruidosamente — `container-type` queda aplicado, la consulta se resuelve contra un ancestro que no existe y no coincide nunca. Medido: 1142px de ancho y `flex-direction: column`. El `@container` va en la columna de la página.
- **En hueco de móvil el botón se queda en el icono.** No es cosmética: con los 112px del botón rotulado, la columna del saldo bajaba a 78px para un texto de 117px y, al ir pegado a la derecha, **se pintaba encima del nombre del titular**. Conserva `aria-label` y `title`, así que no pierde nombre accesible.
- **DS**: el campo de fecha pasa a `Input` del DS —tenía borde y radio propios, sin el anillo de foco del sistema— y **gana nombre accesible**: iba sin ninguno (`dia.elegir`).
- **Cabecera de columnas: NO.** Aquí, al contrario que en Solicitudes, no falta. La fila son 3 columnas en **dos renglones** (código/unidad, titular/ocupación, estado/saldo) y tres rótulos nombrarían la mitad de los seis valores. Las claves muertas (`dia.titular`, `dia.unidad`, y `dia.error`/`dia.sinLlegadas`/`dia.sinSalidas`, superadas por `QueryError`/`EmptyState`) **se borran con el motivo escrito al lado**, para que la próxima sesión no las lea otra vez como "falta la UI".

**Verificado** — `pnpm check` **45/45 verde**, `tenants/demo` **45/45**. En navegador contra el Worker real, tras `db:reset && db:seed`: mezcla de «Pagada» y «Pendiente» en las dos listas; un único valor por borde de columna con y sin ficha abierta; a 375px sin solapamiento y con el botón en icono; anillo de foco del DS en el campo de fecha con `:focus-visible` afirmado (Tab de verdad); y el check-in refactorizado sigue funcionando (la fila pasa a «En casa» y el botón desaparece). Claro y oscuro.

**Hallazgo que NO se ha arreglado, y por qué.** El botón de **check-out no aparece nunca en la demo, ningún día del año**: el seed estampa `checked_in_at` solo sobre las estancias que contienen el ancla (`Y-07-15`) y la pantalla mira el **día real**, así que quien sale hoy, según el reloj del seed, todavía no ha llegado. Ni siquiera el propio 15 de julio lo enseñaría: `anchor < to` excluye justo a los que se van ese día. La raíz es el ancla fija, que es el BACKLOG `[10]` "reset nocturno v2" —declarado fuera de v1 en ADR 0013 §1—, no un retoque. Anotado allí con esta evidencia. Ver SIGUIENTE-SESION.

**Sin desplegar.** No toca esquema: el reset nocturno re-siembra desde `generateSeed()`, así que el próximo `deploy:demo` normal pone la demo remota al día. **No hace falta `db:seed:remote --apply`.**

**Nota de entrega.** La sesión corrió **sin red** (el entorno no resolvía `github.com`: falló el `git fetch` de apertura —así que se trabajó sin comparar con `origin/main`— y falló el push del cierre). Al recuperarse la conexión se comprobó que `main` iba **1 commit por delante y 0 por detrás** y se empujó en fast-forward, sin rebase. Ninguna rama `claude/*`, local ni remota, tenía commits fuera de `main`.

### Sesión 55 — 2026-07-25 · **La bandeja de solicitudes: quince el mismo día, pidiendo estancias ya pasadas** (autónoma, protocolo CONTINUA)

**Objetivo elegido** (candidato `[B1]` recomendado por SIGUIENTE-SESION): seguir metiendo primitivos del DS en las pantallas que faltan, empezando por **Solicitudes**. El aviso del BACKLOG —"mirar cada una antes de tocarla; en las tres últimas migraciones el hallazgo de valor no estuvo en el markup sino en lo que el markup destapaba"— volvió a acertar, y por partida doble.

**Lo que se veía al abrir la pantalla.** Las **quince solicitudes con la misma fecha de recepción** («15 jul», el ancla del seed), y varias pidiendo una estancia **anterior a esa fecha**: recibida el 15 de julio, estancia del 3 al 10 de julio. Es el defecto de las sesiones 53 y 54 en su tercera encarnación — datos válidos que son falsos, que ningún test de invariantes ve porque cada fila, por separado, está bien formada.

**Lo hecho — el seed de `enquiries`**

- **La recepción se escalona por edad**, que es lo que de verdad significa el estado de una solicitud: lo que sigue "nueva" entró esta semana, lo que se ganó o se perdió lleva semanas en la bandeja. Bandas solapadas por estado (`new` 0–5 días, `lost` 16–52). Como la lista se ordena por `created_at DESC`, la bandeja **se ordena sola** como una bandeja real: nuevas arriba, resueltas abajo.
- **La estancia se pide siempre con antelación sobre la propia recepción** (4 días a 11 semanas). Es la invariante nueva, con test: `date_from > created_at`.
- **Los dos acoplamientos por el mismo contador, rotos.** `source` y "trae fechas" salían ambos de `n % 4`: **ninguna** solicitud de teléfono traía fechas y **ninguna** de web las omitía. `unit_type_id` y los niños salían ambos de `n % 3`: quien no pedía tipo no traía niños, jamás. La verdad del dominio va justo al revés — en el formulario público las fechas son **opcionales** (`EnquiryForm.astro`, `dateFrom.optional()`) y por teléfono las apunta recepción.
- **La mezcla se planta, no se sortea.** El reset nocturno re-siembra con el **año en curso**, así que la tirada del PRNG cambia cada 1 de enero: una mezcla sorteada es una mezcla que algún año no sale. Los quince casos (estado × origen × con/sin fechas × tipo concreto o "Cualquiera") están declarados uno a uno, como los casos límite de las reservas. Lo que varía sin consecuencias —hora, pax, tipo, mensaje— sí se sortea con `rand()`.
- **Coherencias que se ven en pantalla**: el teléfono solo entra en horario de recepción (9–20h) y la web a cualquier hora; el tipo solicitado **admite a la gente que viene** (no se pide un bungalow de 4 para 5 pax); cada solicitud escribe **en su idioma** (seis repertorios) y con el **prefijo telefónico de su mercado** — la bandeja entera estaba en castellano con `+33` en todos los teléfonos.

**Lo hecho — la pantalla**

- **Cabecera de columnas**, que no existía. Las claves `sol.recibida`, `sol.fechas` y `sol.tipo` llevaban desde la sesión 18 en el diccionario **sin usarse**: exactamente el hallazgo de Pagos y Notificaciones en la 52 — no sobraba la clave, faltaba la UI. Va `aria-hidden` a propósito: las filas son `<button>`, no celdas, y el lector de pantalla ya lee cada valor dentro de su fila.
- **Y la cabecera destapó lo segundo**: las columnas de esta lista **nunca han estado alineadas entre sí**. Cada fila es su propia rejilla (son `<button>` sueltos) y la última columna era `auto`, así que la anchura la decidía la palabra del chip de esa fila: medido en el navegador, la columna "Tipo solicitado" empezaba en **1116, 1134, 1137, 1153 o 1162 px** según el estado — **46 px de baile**. Sin cabecera contra la que mirar, no se veía. Columna de estado a ancho fijo (104px) y rejilla en **una sola constante** compartida por cabecera y fila. Medido después: un único valor, 1104, en las quince filas y en la cabecera.

**Verificado** — `pnpm check` **45/45 verde**, `tenants/demo` **40/40** con siete tests nuevos. Los tests de solicitudes corren sobre **diez temporadas seguidas** (2026–2035), no sobre una: el reset re-siembra con el año en curso, así que un test que solo mira 2026 comprueba una tirada, no una propiedad. Eso pagó de inmediato — cazó que "sin tipo y con niños" no salía en 2028, que era un umbral estadístico disfrazado de garantía, y por eso el tipo acabó plantado. En navegador contra el Worker real, tras `db:reset && db:seed`: recepciones del 9 jun al 15 jul, bandeja ordenada por edad, "Sin fechas" repartido entre web y teléfono, y la ficha desplegada de Sophie Solé con su mensaje **en catalán** junto a "Idioma: CA". A 1366px y a 375px.

**Sin desplegar.** No toca esquema: el reset nocturno re-siembra desde `generateSeed()`, así que el próximo `deploy:demo` normal pone la demo remota al día. **No hace falta `db:seed:remote --apply`.**

### Sesión 54 — 2026-07-25 · **Los clientes que vuelven — y la lista que dejaba de leerse como generada** (autónoma, protocolo CONTINUA)

**Objetivo elegido** (candidato `[10]` recomendado por SIGUIENTE-SESION): que el seed genere **huéspedes que repiten**. Criterio CONTINUA: es lo que el cliente ve en la demo, no necesita credenciales, y llega a `camp.logic2b.com` con un `deploy:demo` normal porque el reset nocturno re-siembra desde `generateSeed()`.

**El problema, dicho con precisión.** El generador creaba **un huésped nuevo por reserva**. Consecuencia: la columna "Reservas" de `/clientes` valía **1 en las 2 032 fichas** y el historial de la ficha tenía **siempre una sola estancia**. O sea, la pantalla estaba, funcionaba, y **no enseñaba nunca lo único que justifica que exista** — la memoria comercial del camping. Un producto puede tener la pantalla correcta y unos datos que la vacían de sentido; eso no lo detecta ningún test de invariantes, porque los datos son válidos.

**Lo hecho — huéspedes que repiten**

- Un **censo de habituales**: una de cada cuatro fichas nuevas entra, con su número de estancias sorteado sobre `REPEAT_SHAPE = [2,2,2,2,2,2,3,3,3,4]`. Una de cada tres reservas reutiliza una ficha del censo; si ninguna encaja, estrena. Resultado medido: **1 521 fichas** (antes 2 032) con **1 168 de una estancia, 223 de dos, 102 de tres y 28 de cuatro**. La forma importa tanto como el hecho: si todas las que repiten tuvieran el mismo número, la lista volvería a delatarse — es "todas tienen 1" con otro número.
- **Dos reglas que evitan datos falsos**: tope de estancias por ficha (sin él las ~670 reutilizaciones se acumulan en la cabeza del censo y salen familias con ocho estancias en una temporada) y **holgura de 7 días** entre estancias de la misma ficha — dos estancias que no se solapan pero se tocan (sale el 9, entra el 10) se leen como un fallo de datos, no como un cliente que vuelve.
- **La reutilización NO consume del PRNG**: se decide con la aritmética de `bkgN`. Deliberado — el relleno por curva de temporada (ocupación, precios, invariante 1, planning) queda **byte a byte como estaba** y el único diff del seed son las fichas.
- El **idioma de la reserva lo manda la ficha** cuando se reutiliza: la nacionalidad ya está grabada y una reserva en francés a nombre de un titular español sería incoherente. Test que lo barre entero.

**Lo hecho — y de paso, la lista deja de delatarse (mismo defecto, otra columna)**

Al mirar la pantalla en el navegador, la primera página salía **entera "Andersen"**: 40 apellidos para ~1 500 fichas tocan a 38 por apellido, y `/clientes` se ordena por apellido. Es el defecto de la sesión 53 corrido una columna a la derecha, y era **anterior** a esta sesión.

- Repertorio de apellidos de **40 → 161** (mediterráneos y europeos, coherentes con los `locales` del seed): tocan a ~9 por apellido y la primera página enseña tres o cuatro, que es lo que se ve en un listado de verdad.
- **Y el emparejamiento reescrito**: ampliar las listas con `bkgN % 40` y `floor(bkgN/40) % 161` habría vuelto a acoplar los dos índices. Ahora se **numeran las 40 × 161 = 6 440 parejas y se recorren a saltos de 2 371** (primo, luego coprimo con 6 440): el recorrido pasa por todas antes de repetir ninguna. Con ~1 500 fichas eso deja de ser estadística y pasa a ser **garantía: no puede haber dos clientes que se llamen igual** — ni, por tanto, dos con el mismo correo (antes ~430 lo compartían; ahora 0). Test que lo afirma en absoluto (`Set.size === length`), no con un umbral.
- **El sexo sale ahora del nombre**, no de `bkgN % 2`. Salía del mismo contador del que salía el nombre, así que **"María" quedaba marcada M en todas sus fichas**. En una lista es feo; en el **parte de viajeros, que es un documento con valor legal, es un dato falso**.

**Verificado** — `pnpm check` **45/45 verde**, `tenants/demo` **32/32** (seis tests nuevos). En navegador contra el Worker real, tras `db:reset && db:seed`: la columna "Reservas" alterna 0/1/2/3/4; la primera página ya no es un bloque de apellido (Almeida → Andersen); la ficha de **Nadia Almeida** enseña **cuatro estancias repartidas por la temporada** con estados distintos (abril completada, junio completada, julio pendiente, septiembre confirmada), que es exactamente la historia que esa pantalla vende. 0 errores de consola.

**Sin desplegar.** No toca esquema: el próximo `deploy:demo` basta y el reset nocturno (`cron 0 3 * * *` → `resetDemoData`, que re-siembra desde `generateSeed()`) pone la demo remota al día sola. **No hace falta `db:seed:remote --apply`.**

### Sesión 53 — 2026-07-25 · **[B1] Clientes y Tarifas al DS — y los 2 032 clientes que eran 20 personas repetidas** (autónoma, protocolo CONTINUA)

**Objetivo elegido** (candidato recomendado por SIGUIENTE-SESION): seguir con `[B1]`, los primitivos del DS en **Clientes** y **Tarifas** — las dos únicas de las 8 restantes que sí son tablas de verdad (Llegadas y Solicitudes son listas con acciones por fila; Informes e Inventario son rejillas de tiles). Criterio CONTINUA: visual, con final, sin credenciales.

**Lo hecho — las dos pantallas**

- **Clientes**: tabla a mano → `Table*` del DS con `containerClassName="min-h-0 flex-1 overflow-auto"` (el contenedor que desplaza es quien sostiene la cabecera pegajosa, lección de la 52); el `<input type=search>` crudo pasa a `Input`; la constante local `FILA_FOCO` —que era **carácter por carácter** el `focusRing` del DS— se borra y se importa. El anillo de la fila va `focus-visible:ring-inset`, porque en una tabla el de fuera lo recorta el contenedor de scroll. La columna "Reservas" queda alineada a la derecha (es un número), y documento y última estancia con `whitespace-nowrap`: la trampa de la 52 es que la densidad se rompe **con la ficha lateral abierta**, no a pantalla completa.
- **Tarifas**: las N tablas por temporada pasan a `Table*` (sin cabecera pegajosa: son tablas cortas dentro de un mismo scroll) y los siete `<input>` por fila —que llevaban una constante `celda` con el borde, el radio y el tamaño **copiados del DS a mano**— pasan a `Input`. Se les baja la altura a `h-7`: **la altura de la fila ya la fijaba el botón `size="xs"`, también de 28px**, así que con `h-7` campo y botón quedan por fin a la misma línea y la fila no crece ni un píxel (con el `h-8` de serie sí crecería). Las cabeceras de importe se alinean a la derecha, sobre sus números.

**Un defecto del primitivo, arreglado en el primitivo** (`packages/ui`)

`TableRow` aplica `hover:bg-accent/60` a **todas** sus filas, incluida la de `<thead>`: la cabecera se iluminaba al pasar por encima prometiendo un click que no existe. En vez de neutralizarlo pantalla por pantalla, se anula en `TableHeader` (`[&_tr]:hover:bg-transparent`) — el error era de la primitiva, no de quien la usa. Arregla de una vez Pagos, Notificaciones, Reservas, Clientes y Tarifas. Con su test (56/56 en `@logic-camp/ui`).

**El hallazgo, que es lo que de verdad se ve en la demo**

Con la pantalla ya migrada, la lista de clientes seguía leyéndose como un fallo de datos: **25 filas seguidas con el mismo nombre y el mismo correo**. No era la pantalla, era el seed. El generador hacía `firstNames[b % 20]` y `lastNames[(b * 3) % 20]`: **los dos índices quedan determinados por `b % 20`**, así que los 2 032 huéspedes eran **20 personas repetidas ~100 veces** — y, como el correo se deriva del nombre, **20 correos para 2 032 clientes**. Ningún test lo veía: los datos eran válidos, sólo eran falsos.

Arreglado en dos pasos, los dos en el seed (la regla del Frente C: lo fake se resuelve ahí, nunca con mocks):

1. **Desacoplar los ritmos**: el apellido avanza una vez por vuelta completa de nombres (`Math.floor(b / firstNames.length)`), y el segundo apellido a un tercer ritmo. 20 → **400** combinaciones.
2. Con 2 032 huéspedes, 400 parejas seguían dando **bloques de cinco filas idénticas** al ordenar por apellido. Los repertorios pasan a **40 × 40 = 1 600** parejas (nombres nuevos sin acentos a propósito: el correo se deriva del nombre). Resultado medido: **1 600 nombres y 1 600 correos distintos**, y la primera página de 25 sale con **25 personas distintas**.

Los multiplicadores del generador de **solicitudes** se dejan como estaban, con el motivo escrito al lado: son ~doce filas y con `n` pequeño cada una cae en una pareja distinta; aplicarles el truco de dividir les daría el mismo apellido a las doce.

Lo fija un test nuevo en `tenants/demo/seed.test.ts` (nombres distintos > 10% de los huéspedes, y la primera página de 25 **ordenada como ordena la API** —apellido, luego nombre— con más de una persona). Falla con el código viejo.

**Verificación** (Worker real en `:8787`, bundle compuesto, `db:reset` + `db:seed` con el seed nuevo)

- Clientes y Tarifas en **claro y oscuro** a 1366px, y Clientes también **con la ficha lateral abierta** (filas de 36–37px, ni una partida).
- **Cabecera pegajosa medida**: tras desplazar, `theadTop === contTop` y el contenedor con `overflow: auto`. Cabecera **sin realce** al pasar por encima (`backgroundColor: rgba(0,0,0,0)` leído, no supuesto).
- **Teclado**: `:focus-visible` afirmado sobre un `Input` de Tarifas y sobre una fila de Clientes, con el anillo de 3px visible en captura. (Ojo: `getComputedStyle().boxShadow` **no** refleja el valor compuesto por las variables del ring en este Chrome — el que manda es el píxel, y ahí está.)
- **Camino de escritura de Tarifas completo**: editar → "Guardar" se activa → `AlertDialog` de confirmación → `PUT` → toast → refetch con el valor nuevo → borrador limpio. Restaurado el valor original después.
- 0 errores de consola. **`pnpm check` 45/45 verde** (local).

**Lo que NO se hizo, con motivo**: la columna "Reservas" sigue valiendo **1 para todos** — el seed crea un huésped nuevo por reserva, así que la "memoria comercial del camping", que es justo lo que esta pantalla vende, no se ve. Es un cambio del generador de reservas con implicaciones en `booking_guests` y en los invariantes: queda en BACKLOG con su motivo, no improvisado a última hora.

### Sesión 52 — 2026-07-25 · **[B1] Los primitivos del DS en las listas — y la cabecera que nunca se pintó** (autónoma, protocolo CONTINUA)

**Objetivo elegido** (candidato recomendado por SIGUIENTE-SESION): adoptar los primitivos de `packages/ui` en 2–3 pantallas del dashboard. Criterio de CONTINUA: es lo único visual y demo-visible de la lista que se cierra entero sin credenciales ni Andreu. Los otros candidatos son limpieza (C2, rename de tokens), un aviso acotado (C1) o algo que Andreu acotó a "solo si al enseñar la demo se echa en falta" (bloqueos del visitante).

**Lo que apareció al abrir el código, que cambia el sentido de la sesión**

Esto no era un reskin. **Pagos y Notificaciones no tenían cabecera de columna.** Los datos se pintaban como `<ul>` con `grid-cols-[100px_1fr_auto]`, y los nombres de las columnas existían en un **comentario**:

```
/* Columnas del esqueleto = la rejilla real: fecha · reserva · proveedor · estado · importe. */
```

Y había una segunda mitad: las claves i18n para esas cabeceras **ya estaban escritas** (`pagl.fecha`, `pagl.reserva`, `pagl.importe`, `ntf.fecha`, `ntf.evento`, `ntf.destino`, `ntf.canal`) y **ninguna se usaba**. El detector de claves huérfanas de `[C2]` las cuenta entre las ~105 candidatas a borrar; borrarlas habría sido tapar el hueco en vez de rellenarlo. **No eran huérfanas: les faltaba el sitio donde usarse.** La usuaria real —la recepcionista de 55 años, CLAUDE.md— tenía delante una columna de importes sin etiqueta.

**Lo hecho**

- **Pagos** y **Notificaciones**: `<ul>`+rejilla → `Table/TableHeader/TableBody/TableRow/TableHead/TableCell` del DS, con `<thead>` real (y con él, semántica de tabla para el lector de pantalla, que antes no existía) usando las siete claves que estaban muertas. En Notificaciones la columna de intentos deja de repetir su etiqueta en cada fila (`Intentos: 0`) y pasa a ser un número alineado a la derecha, comparable de un vistazo. Importes y totales a la derecha con `tnum`.
- **Reservas**: la tabla era markup propio con las clases de `TableHead`/`TableCell` **copiadas a mano** (copiadas se desincronizan del DS; importadas, no), el buscador y el filtro eran `<input>`/`<select>` crudos con `border-foreground/20` y `rounded-(--lc-radius)`, y el anillo de foco de la fila estaba copiado clase a clase. Ahora: primitivos `Table*`, `Input`, `SelectNative` y `focusRing` importado.
- **El chip de estado se queda como `lc-chip`, NO pasa a `Badge`**, a propósito: comparte el mapa de color con las barras del planning (`lc-bar`, ADR 0017). Sustituirlo por un primitivo del DS habría roto el color en dos sitios para ganar coherencia nominal. Escrito en el código para que no se "arregle" luego.

**El primitivo tuvo que crecer para poder adoptarlo** (`packages/ui`)

`Table` fijaba `overflow-x-auto` en su contenedor y no dejaba tocarlo (`className` va a la `<table>`). Eso hace que **el contenedor sea el contenedor de scroll de ambos ejes** —`overflow-y: visible` computa a `auto` en cuanto el otro eje no es `visible`— y entonces un `<thead className="sticky top-0">` se queda pegado a un contenedor que nunca se desplaza: la cabecera se va con el scroll de fuera. Nuevo prop **`containerClassName`**, con su test: `overflow-auto` tiene que **ganar** al defecto, no acumularse (lo resuelve `twMerge`, y el test lo fija para que un cambio de `cn` no lo rompa en silencio). 55/55 en `@logic-camp/ui`.

**Dos defectos de densidad que solo salen en navegador**

1. Con la ficha de reserva abierta la lista se estrecha y `CS-2026-0008` **se partía en tres líneas**: filas de triple altura, justo lo que el primitivo documenta como requisito de producto ("densidad sin ruido"). Arreglado con `whitespace-nowrap` en el código de reserva: antes que partir un identificador, scroll horizontal.
2. El chip `No presentada` se rompía en dos líneas. El arreglo va en **`.lc-chip`** (una insignia es atómica), no celda a celda: el chip se pinta en 6 pantallas y así se arregla en todas.

**Verificación** (Worker real en `:8787`, bundle compuesto, seed limpio)

- Las tres pantallas en **claro y oscuro** a **1366px** y a **375px** (donde las columnas secundarias caen por `hidden sm:table-cell` y quedan tres: fecha · reserva · importe).
- **Cabecera pegajosa medida, no mirada**: tras desplazar, `thTop === contTop` y el contenedor tiene `overflow-y: auto` con `overflow-x-auto` ya descartado por `twMerge`.
- **Fila clicable**: abre la ficha con ratón, y con **teclado** el anillo del DS se pinta de verdad — `:focus-visible` afirmado y `box-shadow` de 3px inset leído del `getComputedStyle`, no supuesto (la lección de la sesión 51: un test de accesibilidad puede pasar por el motivo equivocado).
- `notifications_log` sale vacío del seed, así que las notificaciones se generaron **por el camino real** (`POST /api/enquiries` ×3 → 6 filas: acuse al solicitante + aviso al camping), no insertando filas a mano.
- 0 errores de consola. `pnpm check` **45/45 verde**.

**Lo que NO se hizo, con motivo**: las 8 pantallas restantes (Clientes y Tarifas con tabla a mano; Informes, Inventario, Llegadas, Parte y Solicitudes con listas `<ul>`) quedan en BACKLOG — y ojo, **no todas deben ser tablas**: Llegadas y Solicitudes son listas con acciones por fila, no rejillas tabulares. Convertirlas por simetría sería una regresión. Tampoco se pudo ver un importe negativo en Pagos (el seed no trae reembolsos): la rama de color queda sin comprobar en vivo.

### Sesión 51 — 2026-07-25 · **[C2] `prefers-reduced-motion`: la guardia que no guardaba nada** (autónoma, protocolo CONTINUA)

**Objetivo elegido** (de los candidatos de SIGUIENTE-SESION): auditar las animaciones bajo `prefers-reduced-motion` en navegador real. Criterio: es suelo de accesibilidad —no adorno—, es barato de verificar de verdad, y era el único candidato que se cerraba entero sin credenciales ni Andreu. El resto (B1, bloqueos del visitante, C1) o son incrementales sin final, o Andreu los acotó explícitamente a "solo si al enseñar la demo se echa en falta".

**El hallazgo, que es el motivo de la sesión**

La sospecha del BACKLOG era correcta y peor de lo anotado: **`motion-reduce:animate-none` no anulaba absolutamente nada** en diálogos, alert-dialogs, sheets, popovers, menús y tooltips. No es un despiste de escritura, es aritmética de CSS:

- las variantes de Radix compilan a `.data-\[state\=open\]\:animate-in[data-state=open]` → clase + atributo = especificidad **(0,2,0)**;
- `motion-reduce:animate-none` compila a `.motion-reduce\:animate-none` **dentro de un `@media`** → **(0,1,0)**, porque **una media query no suma especificidad**.

(0,2,0) gana a (0,1,0) **en cualquier orden**. La guardia perdía siempre. Comprobado en navegador con la preferencia activada: el alert dialog del banner de demo seguía entrando con `animation: enter 0.15s`.

Y debajo había más: **todas** las transiciones de Tailwind seguían vivas — 43 elementos en la web pública (`transition-colors`, el `duration-700` del zoom de las fotos) y 151 en el dashboard (las asas del tape chart, `transition-[width]` de la sidebar…). Sólo la landing de producto (`apps/site`) estaba bien, porque era la única con el reset global… y **también incompleta**: le faltaba `animation-iteration-count: 1`, sin el cual una animación en bucle infinito sigue repintando para siempre aunque cada vuelta dure 0,01ms.

**Trampa de método, la más cara de la sesión**: el primer barrido salió **verde** con `test.use({ reducedMotion: 'reduce' })`. No estaba bien: `matchMedia('(prefers-reduced-motion: reduce)').matches` devolvía **false** — la preferencia nunca llegó a activarse con esta configuración. Un test de accesibilidad que pasa sin que la preferencia esté puesta es peor que no tenerlo. Ahora se emula con `page.emulateMedia()` **y se comprueba en cada barrido** que la preferencia está activa antes de mirar nada.

**Hecho**

- **Un solo bloque por raíz en vez de N clases por componente** (`packages/ui/src/theme.css`, `apps/web/src/styles/global.css`, `apps/site/src/styles/global.css`): el reset canónico con `!important` sobre `*`, `::before` y `::after`. Se eligió `0.01ms` y **no** `animation: none` a propósito: Radix desmonta al recibir `animationend`, y con `none` ese evento no llega nunca. Verificado que el diálogo abre y **cierra** con Escape bajo la preferencia.
- **Borradas las 14 clases `motion-reduce:*`** de `packages/ui` y del dashboard. Las inertes mentían —son exactamente lo que hizo invisible este bug— y las que sí funcionaban eran ya redundantes; dejar una política mixta invitaba a repetir el error. Ahora hay **un sitio** donde mirar, y el comentario de `theme.css` explica por qué.
- **`apps/web/e2e/reduced-motion.spec.ts`**: barre TODO el DOM (portales de Radix incluidos) y falla si algo anima o transiciona por encima de 40ms, agrupando por motivo (40 asas idénticas son un fallo, no 40 líneas). Cubre web pública + resultados, landing (que además no puede dejar contenido a opacidad 0) y dashboard con el diálogo y el tooltip abiertos.
- **De regalo, `[B3]` — que resultó ser tres bugs, no uno**: el E2E del funnel estaba **rojo 4/4** desde ADR 0016 y nadie lo sabía.
  1. Navegaba a `/reservar`, y en el bundle compuesto la web del tenant vive en `/demo/reservar`. Prefijo extraído a `e2e/base.ts` (`WEB`, sobreescribible con `E2E_WEB_BASE`).
  2. Arreglado eso, seguía fallando **1 de cada 3 veces**, y la tentación era llamarlo "flaky" y seguir. No lo era: las fechas salían de `10 + (minutos % 12)` **a ciegas**, y en el seed limpio el glamping está **lleno del 17 al 20 de septiembre** — cuatro de los doce minutos del ciclo fallaban por el reloj, con la base recién sembrada y el código intacto.
  3. Y el ciclo de fechas duraba **12 minutos** mientras un hold vive **15**: dos pasadas seguidas caían en la misma fecha con los holds de la anterior aún vivos (el cron que los purga no corre en `wrangler dev`) y se envenenaban entre sí.
     Ahora `estanciaLibre()` **le pregunta a la API** por dónde hay hueco y avanza hasta el primero real, **de una petición en una**: el primer intento barría el mes entero de golpe y se comía media suite contra el rate limit de `/api/*` (60 peticiones/minuto), que devolvía 429 hasta al health check del `webServer`.
- También `playwright.config.ts` forzaba el chromium de `/opt` del contenedor cloud, lo que impedía correr `pnpm e2e` en el Mac; ahora sólo lo usa si existe.

**Verificado**

- `pnpm e2e` **7/7 verde** (4 funnel + 3 reduced-motion) en **tres vueltas consecutivas sin resembrar entre medias**, contra el bundle compuesto real (`/` landing, `/demo/` web, `/admin/` dashboard).
- El barrido pasó de **5 y 6 grupos de movimiento** (web y dashboard) a **cero**.
- **El reset no se filtra al modo normal**: sin la preferencia, el diálogo sigue animando `enter 0.15s`. Comprobado explícitamente, porque "arreglar" la accesibilidad matando la animación de todo el mundo habría sido un cambio de diseño encubierto.
- **`pnpm check` verde 45/45** (local, sin el segfault de workerd del contenedor cloud). Corrido dos veces, la segunda tras los arreglos del funnel.
- Repaso visual en navegador del dashboard en modo normal tras quitar las clases: login, banner de demo y planning intactos.

**No hecho, a propósito**: no se ha desplegado. El cambio es CSS + tests y no corre prisa; sale en el próximo `deploy:demo` de una sesión local con credenciales.

### Sesión 50 — 2026-07-25 · **[Fase 10] La demo se abre sola: acceso sin registro con rol `demo`** (ADR 0029, validado por Andreu antes de escribir código)

**Contexto**: sesión LOCAL con Andreu presente — y eso decidió el objetivo. De los cinco candidatos de SIGUIENTE-SESION, cuatro se podían hacer solos; **este no**: llevaba parado desde el ADR 0013 (2026-07-19) porque su alcance dependía de tres decisiones de producto que nadie podía tomar en una sesión autónoma. Se le plantearon las tres y las contestó: puerta **anónima** (botón en el login, no enlace firmado), alcance **leer + gestos del planning + check-in/out**, y limpieza con **botón de restablecer** además del cron nocturno. Con eso, ADR escrito → **parada a validación** (contrato de CLAUDE.md para fase nueva) → validado → implementado.

**Dos hechos del terreno que contradecían las notas** y que cambiaron el diseño:

1. **El reset nocturno SÍ existe** y está desplegado (`tenants/demo/worker.ts`, cron `0 3 * * *`). Una memoria mía afirmaba lo contrario; queda corregida. Es justo lo que hace defendible dejar que un desconocido toque los datos: son desechables por construcción.
2. **`users.role` no tiene `CHECK`** en la migración (`text NOT NULL` pelado; el `enum` de Drizzle es solo tipo de TS). **Añadir un rol no necesita migración.**

**Hecho**

- **Rol `demo` en el nivel 0**, empatado con `readonly`. Nace **fail-closed**: sin una línea más ya lee los 13 GET y se estrella con 403 en las 15 rutas que mutan y en los 4 GET elevados (export RGPD, parte de viajeros, retención, usuarios). Se descartó ponerlo al nivel de `reception` con un middleware que denegara: eso falla **abierto** ante un error de orden de montaje, y en autorización el sentido en el que se falla es la decisión.
- **La excepción se autoriza por ACCIÓN, no por ruta** — la pieza que más piensa del cambio. `PATCH /bookings/:id` es la puerta de las 13 acciones de la unión discriminada: abrirlo entero habría regalado `cancel`, `record_payment` y `refund`. `requireReceptionOrDemoAction()` sólo deja pasar `DEMO_ACTIONS` (mover, asignar, check-in/out/deshacer), y `requireReceptionOrDemo()` abre el `requote` (dry-run del gesto, no escribe).
- **Un barrido que se cierra solo** (`apps/api/test/demo-role.test.ts`, 55 tests): dirigido por `app.routes`, igual que el de aislamiento. Toda ruta admin debe dar 403 salvo las declaradas con su motivo — **incluida una ruta nueva de LECTURA**, que por la jerarquía pasaría sola y aquí salta hasta que alguien la declare. Se comprueba en los dos sentidos (lo permitido NO debe dar 403), acción por acción, y que la API genérica devuelva **404** en `/api/demo*`: si esa puerta subiera a `apps/api`, todos los campings ofrecerían acceso anónimo.
- **La puerta vive en `tenants/demo/worker.ts`**, que pasa a envolver también `fetch` (antes solo `scheduled`). Tres rutas: `GET /api/demo` (sonda), `POST /api/demo/sign-in` (reenvía a Better Auth con las credenciales sembradas y devuelve SU `Set-Cookie`) y `POST /api/demo/reset` (reusa `resetDemoData`, exige sesión). **Cero mecanismo de sesión nuevo** y la contraseña no sale del Worker. Gracias a la sonda **el dashboard sigue siendo genérico**: pregunta, y a un camping real le contestan 404 → no se pinta el botón, sin flags de build.
- **El "no" se explica en un solo punto.** Detectado durante la implementación: sólo las dos rutas de excepción devolvían `demo_readonly`; el resto daba `forbidden`, así que el aviso amable casi nunca se habría disparado. Se arregló **en el servidor** (`negar()`): al rol `demo` se le dice que esto es la demo, a un rol normal qué nivel hacía falta. El cliente lo traduce en `avisos.ts` (`errorMutacion`), y los ~22 `onError` de las pantallas pasan por ahí en vez de escupir su mensaje genérico, que además mentía ("no se ha podido aplicar, recarga la ficha" cuando no ha fallado nada).
- **Banner de demo dentro del dashboard** (el de `Base.astro` no llega aquí), con el botón "Restablecer datos" y su confirmación. **Trampa resuelta en diseño, no en producción**: el wipe borra `sessions`, así que restablecer mataba la sesión de quien pulsa → el flujo vuelve a entrar por la puerta antes de refrescar.
- Seed: `usr_demo` / `demo@calasereno.example`, rol `demo`. Sobrevive a los resets porque el reset regenera `users` desde el seed.

**Verificado**: `pnpm check` **45/45 verde en local** (sin el segfault de workerd del contenedor cloud). **En navegador contra el Worker real** (`wrangler dev` :8787 con `--persist-to .wrangler-demo`, D1 re-sembrada): el botón aparece porque la sonda contesta 200 → un click entra directo al planning (83 unidades, 328 reservas) con el banner arriba; crear un bloqueo → el aviso honesto con icono de info, sin bloqueo creado; **check-in desde Llegadas → funciona** (0252 pasa a "En casa"); **Restablecer → deshace el check-in, sale "Demo restablecida" y la sesión sobrevive**. Claro y oscuro, 0 errores de consola. Además, contra el Worker real, `requote` y `move` con la sesión demo devuelven **422 de regla de negocio, no 403**: la autorización pasa.

**Sin terminar / dicho con honestidad**: el **arrastre** del planning no se pudo re-verificar en navegador con el automatismo — su `left_click_drag` no dispara los _pointer events_ que usan las barras (no es un fallo de la app: no hay lógica de rol en `Planning.tsx`, el camino es el mismo para todos). La autorización de mover sí está verificada por integración (test que mueve la reserva con sesión demo y comprueba la base) y en vivo por `fetch`. Y **crear arrastrando sobre una celda libre** (ADR 0023 §2) acaba en el aviso de solo lectura: es el único gesto del planning que el visitante empieza y no puede terminar — anotado en BACKLOG.

**Trampa nueva para la lista**: en el panel del navegador, `computer` con `coordinate` usa coordenadas del **viewport** (1280×720), no de la captura (800×450) — factor 1,6. Un arrastre con las coordenadas de la captura cae en otro sitio y parece un fallo de la app.

**DESPLEGADO a producción en esta misma sesión** (Andreu presente, autorizó las dos operaciones): `deploy:demo` → versión **`454cec71`**, y **`pnpm db:seed:remote --apply`** con su doble candado (26.567 filas). El reseed remoto **no era opcional**: `usr_demo` vive en el seed, así que desplegar solo el código habría dejado el botón "Ver la demo" a la vista y **fallando** hasta el reset de las 3:00. Con esto se despliegan por fin las sesiones **47, 48 y 50** juntas. Verificado contra `camp.logic2b.com`: sonda `{"enabled":true}`, sign-in anónimo 200 con rol `demo`, `GET /planning` 200, `POST /blocks` → `{"error":"demo_readonly"}`, `GET /users` → 403, y en navegador el recorrido completo (botón → planning con banner, 0 errores de consola).

**Siguiente paso**: ver `docs/SIGUIENTE-SESION.md`.

### Sesión 49 — 2026-07-25 · **[infra] El workflow de deploy deja de mentir: llama al script real** (sin ADR)

**Contexto**: sesión dirigida (no CONTINUA). `.github/workflows/deploy-demo.yml` llevaba desde el ADR 0016 desfasado respecto al deploy real y nadie lo había notado porque **nunca llegó a ejecutarse**.

**El desfase**: el workflow construía `apps/web` **sin `BASE_PATH`**, copiaba el dashboard a `apps/web/dist/admin` y desplegaba. Pero `tenants/demo/wrangler.jsonc` sirve `../../apps/site/dist` desde el ADR 0016 (bundle compuesto: landing en la raíz + web en `/demo/` + dashboard en `/admin/`) y el workflow **nunca construía `apps/site`**: de haberse encendido habría desplegado un directorio inexistente o de otra época. La causa raíz no es el YAML, es la **duplicación**: los pasos vivían en dos sitios (el YAML y el script `deploy:demo` de `apps/api`) y solo uno se ejecutaba de verdad, así que solo uno se mantenía.

**Hecho**

- El workflow ya **no duplica** nada: un único paso, `pnpm --filter @logic-camp/api deploy:demo` — exactamente el comando del deploy manual (compone site+web(`BASE_PATH=/demo`)+dashboard, aplica migraciones en la D1 remota y despliega). Si mañana cambia el bundle, cambia el script y el CI le sigue solo.
- Guard `DEPLOY_DEMO_ENABLED` movido a **nivel de job** (antes hacía `checkout` + `pnpm install --frozen-lockfile` en cada push para luego saltarse todo) + `workflow_dispatch` añadido. El job `disabled-notice` dice en claro que no se ha desplegado nada y cuál es el comando manual.
- Docs alineadas con la realidad: `CLAUDE.md` (tabla de stack), `LOGIC-CAMP-Super-Prompt.md` §5, `docs/ROADMAP.md` (fila de Fase 0 + decisión nueva) y este fichero decían o insinuaban "main→demo automático".

**Verificado**: contra la API pública de GitHub, los **52 runs** de `deploy-demo` en `main` terminaron **verdes con los tres pasos de deploy en `skipped`** y solo el "Skip notice" en `success` — prueba directa de que `DEPLOY_DEMO_ENABLED` no está a `true` y de que **el deploy automático nunca ha desplegado nada**. Los secrets `CLOUDFLARE_*` no son consultables sin `gh` (no está instalado aquí) y la decisión 2026-07-19 dice que nunca se pegaron. YAML validado con un parser. **No se ha ejecutado `pnpm check`**: el cambio es un workflow de CI y prosa, no toca ni una línea de TS ni de test.

**Sigue pendiente**: el deploy real de la demo, que **acumula ya las sesiones 47, 48 y 49** — `pnpm --filter @logic-camp/api deploy:demo` desde local.

### Sesión 48 — 2026-07-25 · **[C1] Levantar un bloqueo desde el propio planning: la barra rayada deja de ser pintura** (remate C1/C4.4, sin ADR)

**Contexto**: sesión autónoma cloud (protocolo `docs/CONTINUA.md`), rama de sesión `claude/project-development-continue-4hz01z` partiendo de `origin/main` = `0434212`. Objetivo elegido: el candidato **[C1]** de SIGUIENTE-SESION — el único de la lista que es a la vez demo-visible (el planning es la pieza firma) y ejecutable sin credenciales. Cierra el ciclo que la sesión 47 dejó a medias: el **plano** ya crea _y_ levanta bloqueos desde su panel de unidad, pero en el **planning** las barras `lc-block` seguían siendo sólo pintura con un `title`.

**La decisión de diseño que gobernó el gesto**: el planning tiene su propio modelo de interacción — todo se arrastra (mover, estirar, crear, asignar). Un bloqueo **no** entra en ese modelo: no se mueve, se levanta y se vuelve a crear (así lo dejó ya decidido ADR 0023 al descartar "crear bloqueos arrastrando"). Así que el gesto es un **click discreto**, no un arrastre — y eso, además, sale gratis: `onRowPointerDown` ya se guarda con `e.target !== e.currentTarget`, de modo que pinchar una barra nunca arranca un arrastre de crear-reserva.

**Hecho**

- **La barra es un botón de verdad**, no pintura: `role="button"` + `tabIndex={0}` + `aria-label` con motivo, rango y unidad (`planning.bloqueo.aria`), activación por **click y por Enter/Espacio**, y `title` con la pista de qué pasa al pulsar. La afordancia visual faltaba por completo (parecía decoración): `cursor: pointer`, realce del borde y del texto al pasar por encima, y anillo de foco `--ring` del DS — todo en `.lc-block[role='button']`, con tokens, sin un solo hex.
- **Confirmación antes de borrar**, como las otras tres acciones destructivas (C3): `AlertDialog` con el detalle del bloqueo (motivo + `date_from → date_to`) y, si es un bloqueo **de tipo** (`unitId === null`, pintado en todas las unidades del tipo), el aviso explícito de que levantarlo las libera todas. Reutiliza las claves i18n que ya existían huérfanas (`confirmar.quitarBloqueo.*`, `bloqueo.quitad*`); sólo 2 claves nuevas.
- **El foco vuelve a su sitio**: `onCloseAutoFocus` devuelve el foco a la barra que abrió el diálogo al _cancelar_, y no lo intenta cuando se ha confirmado (la barra ya no existe: se comprueba con `isConnected`). Sin esto, "Volver" dejaba el foco en `<body>` — comprobado en el navegador antes de arreglarlo.
- Backend: **cero cambios**. `DELETE /api/admin/blocks/:id` ya existía, testeado y con rol `reception`; lo que faltaba era una segunda pantalla que lo llamara.

**Verificado**: `pnpm check` cloud **43/45**, y los dos rojos re-verificados en aislamiento y ajenos a lo tocado — `@logic-camp/api` **182/182** verde por su cuenta (flaky sólo bajo carga paralela, ya documentado) y `tenants/demo` `seed.test`+`remote-seed.test` **18/18**, quedando únicamente el segfault de workerd sobre `reset.test.ts` (`ECONNREFUSED`, sólo contenedor cloud). Dashboard typecheck + lint + build verdes. **En navegador contra el Worker real** (`wrangler dev` :8787 con `--persist-to .wrangler-demo`, D1 local re-sembrada, login por `fetch` a Better Auth): sobre el bloqueo de larga estancia de A-24 → `role`/`tabindex`/`aria-label`/`cursor:pointer` correctos, **foco de teclado con `:focus-visible = true`**, Enter abre el diálogo con motivo y rango, "Volver" **no borra** y devuelve el foco a la barra, click → "Levantar" → la barra desaparece y sale el toast "Bloqueo levantado". Claro y oscuro. Único error de consola: el `favicon.ico` 404 del bundle local (confirmado en el log del Worker, no es de la app).

**Trampa nueva para la lista**: en la verificación con Playwright, ir de `/admin/` a `/admin/#/…` **no recarga** (sólo cambia el hash), así que la app se queda con el estado "sin sesión" aunque el login por `fetch` haya devuelto 200 — hay que `reload()` después. Y el planning vive en la ruta **`/`**, no en `/planning`; se le pasa `?date=&unit=` para que la virtualización de filas desplace hasta la unidad que interesa.

**Sin terminar / diferido con motivo**: nada del objetivo. El resto de candidatos de la lista (adoptar primitivos de `packages/ui`, auditar `prefers-reduced-motion`, ADR del acceso readonly a la demo) sigue en SIGUIENTE-SESION.

**Siguiente paso**: ver `docs/SIGUIENTE-SESION.md`.

### Sesión 47 — 2026-07-24 · **[C4.4] Bloqueos desde el propio plano: panel de unidad + fix de defaults del diálogo** (remate C4/C7, sin ADR)

**Contexto**: sesión autónoma cloud (protocolo `docs/CONTINUA.md`), rama de sesión `claude/continuacion-proyecto-yhq05n` partiendo de `origin/main` = `705ed6e`. Objetivo elegido: el primer candidato de SIGUIENTE-SESION, **[C4.4] crear bloqueos desde el plano**, siguiendo su propia instrucción de "verificar primero qué hace hoy el diálogo". **Cierre**: Andreu dio en la misma sesión **permiso permanente** para que las sesiones cloud hagan merge a `main` — hecho aquí (ff `705ed6e → 27b9918` + este commit de docs), mandato escrito en `docs/CONTINUA.md` §7, rama de sesión borrada. Trampa que picó: el `main` local del contenedor era un resto del día 1 con historia pre-reescritura (6 commits del 17-jul que ya no son ancestros de origin) — `git reset --hard origin/main` antes del merge, sin pérdida (su contenido lleva en origin desde entonces).

**Lo que la auditoría previa encontró** (y convirtió el "pulido" en dos arreglos de verdad):

1. **`BlockDialog` perdía la unidad y la fecha en silencio**: el diálogo vive montado (animación de Radix) y sus `default*` se captaban en el `useState` del PRIMER render — "seleccionar la A-12 y pulsar Nuevo bloqueo" abría el formulario vacío. Afectaba a plano Y planning.
2. **`DELETE /api/admin/blocks/:id` no tenía UI**: la ruta existe y está testeada (rol reception, `admin.test.ts`), y las claves i18n `bloqueo.quitar`/`confirmar.quitarBloqueo.*` estaban escritas… pero ninguna pantalla la llamaba. Un bloqueo creado era eterno salvo SQL a mano.

**Hecho**

- **`BlockDialog`**: al abrir, resincroniza con la pantalla (`useEffect` sobre `open`): unidad seleccionada, fecha del día mirado, y "hasta" arranca en **una noche** — el caso común (avería hoy) queda a un click. Aplica a plano y planning.
- **`UnitPanel.tsx`** (nuevo): panel contextual de UNIDAD en el plano, mismo idiom de panel lateral que la ficha. Al pinchar una unidad **libre** → código + chip + tipo + "Libre la noche del X" + **"Bloquear esta unidad"** (diálogo precargado) + "Ver en el planning". Al pinchar una **bloqueada** → motivo y rango del bloqueo que cubre esa noche + **"Levantar el bloqueo"** con confirmación (`AlertDialog`, las claves que estaban huérfanas) → `DELETE /blocks/:id` + invalidación de `['planning']`. Si el bloqueo es **de tipo**, el panel y la confirmación avisan de que cubre todas las unidades del tipo. Esc cierra, foco al abrir, chips nuevos `st-free`/`st-blocked` en `styles.css` (tokens, sin hex).
- **`Plano.tsx`**: resuelve unidad seleccionada + estado + bloqueo que cubre la fecha (unidad o tipo) y monta el panel solo en libre/bloqueada (ocupada sigue abriendo la ficha). 5 claves i18n nuevas `plano.unidad.*`.

**Verificado**: dashboard typecheck+lint+build verdes. `pnpm check` cloud: **42/45 + los 3 ambientales documentados re-verificados en aislamiento** — `api:test` **182/182**, `web:build` verde, demo `seed.test`+`remote-seed.test` **18/18**; el único rojo real sigue siendo el segfault de workerd sobre `reset.test.ts` (señal 11, solo contenedor cloud). **En navegador contra el Worker real** (`wrangler dev` :8787 + D1 local re-sembrada + login por fetch a Better Auth): ciclo completo con Playwright — click en BM-06 libre → panel; "Bloquear esta unidad" → diálogo con **BM-06 + 12 ago → 13 ago precargados**; crear → la unidad pasa a "Bloqueada · Mantenimiento" rayada; click → panel de bloqueada con motivo y rango; levantar + confirmar → libre otra vez. Claro y oscuro, 0 errores de consola (solo el favicon del bundle local).

**Trampa nueva para la lista**: el `wrangler dev` del demo lanzado a mano necesita `--persist-to <raíz>/.wrangler-demo` — sin eso levanta una D1 local vacía ("no such table: users") aunque `pnpm db:seed` haya ido bien, porque los scripts `db:*` de la raíz persisten ahí.

**Sin terminar / diferido con motivo**: el gesto en el planning (click en la barra rayada de un bloqueo → levantarlo) queda en BACKLOG — el planning tiene su propio modelo de interacción (arrastre) y merece su pase; el plano ya cubre el ciclo entero.

**Siguiente paso**: ver `docs/SIGUIENTE-SESION.md`.

### Sesión 46 — 2026-07-24 · **Protocolo "continúa con el desarrollo" (docs/CONTINUA.md) + iconos de servicio en el plano** (remate [C7], sin ADR)

**Contexto**: `git fetch` de arranque OK (`main` = `origin/main` = `07fbe73`, árbol limpio). Mandato nuevo de Andreu para las sesiones venideras: **el MVP es una demo fake** — no configurar servicios externos reales (Resend, Stripe, SES…) y que cada chat nuevo funcione con solo "continúa con el desarrollo de este proyecto", con la IA decidiendo sola. Eso descarta las opciones B (SES real) y C (alta real) del prompt anterior (credenciales/Andreu) y D seguía descartada con motivo (ADR 0025 §3).

**Hecho — objetivo 1: la metodología**. **`docs/CONTINUA.md`**: protocolo de sesión autónoma en 8 pasos (sincronizar → situarse → elegir UN objetivo ejecutable sin credenciales, prioridad "lo que el cliente ve en la demo" → implementar → verificar → documentar → commit+push a main → cerrar), con la lista explícita de lo que una sesión autónoma NO hace (`--apply` remoto, deploy de tenant, secrets, reabrir decisiones cerradas). Enganchado desde `CLAUDE.md` (sección nueva "Sesiones autónomas") para que cualquier chat lo recoja sin más prompt.

**Hecho — objetivo 2: iconos de servicio en el plano** (BACKLOG [C7]). El `icon` de `PlanoServiceIcon` estaba tipado desde ADR 0021 pero nunca se dibujaba. En `CampingMap.tsx`: mapa `SERVICE_ICONS` de los 7 servicios a componentes lucide (reception→`ConciergeBell`, pool→`Waves`, restaurant→`Utensils`, wc→`ShowerHead`, playground→`Baby`, market→`ShoppingCart`, shop→`Store` — todos verificados presentes en lucide-react 0.550) renderizados **dentro** del `<svg>` del plano (svg anidado válido; color por `currentColor` → `--muted-foreground`, nunca hex suelto), tamaño derivado del recinto (`clamp(min(w,h)*0.35, 12, 18)`), icono centrado y etiqueta debajo. Sin tocar geometría, API ni descriptor: solo la piel.

**Verificado**: `pnpm check` **45/45 verde** (local, incl. `reset.test` sin segfault). En navegador contra el **Worker real** (`wrangler dev` :8787, D1 local re-sembrada — el seed local estaba viejo y el plano salía "automático"): los 7 servicios con su glifo en **claro y oscuro**, 0 errores de consola. Nota de proceso: el formulario de login no responde a los eventos sintéticos del panel del navegador (React controlado); el login se hizo por `fetch` al endpoint real de Better Auth — mismo backend, sin stub.

**Siguiente paso**: ver `docs/SIGUIENTE-SESION.md`.

### Sesión 45 — 2026-07-24 · **`pnpm db:seed:remote`: reseed remoto FK-safe en un comando** (deuda [infra], sin ADR)

**Contexto**: `git fetch` de arranque **sí** sincronizado (`main` local = `origin/main` = `4e246c3`, árbol limpio — la trampa de sesiones anteriores no picó esta vez). Objetivo elegido con Andreu (una sesión = un objetivo): **Opción A** — cerrar la deuda `[infra]` del BACKLOG que costó media sesión 44: encapsular el reseed remoto de la demo (que **no** existe como automatismo — no hay reset nocturno remoto) en un solo comando. Pequeño, alto valor, sin credenciales nuevas para construirlo. No es fase nueva → sin ADR.

**Hecho** (tooling puro + shell fino, calcado del idiom de `new:camping`)

- **`tenants/demo/remote-seed.ts`** (PURO, sin `node:`, typecheck+test): `buildRemoteSeedCommands()` devuelve el plan completo como argv — regenerar `seed.sql` → vaciar las 21 tablas **hijo→padre** con `--command` una a una → sembrar con `--file seed.sql`. Reusa `DELETE_ORDER` de `reset.ts` (**exportado**, fuente única: el wipe local y el remoto no pueden divergir); `d1_migrations` se preserva sola por no estar en el orden.
- **`tenants/demo/remote-seed.test.ts`** (**6 tests**): fija las tres lecciones de la sesión 44 — 21 tablas hijo→padre en el mismo orden que el reset local, `d1_migrations` nunca tocada, el `--file` va solo en el seed final (el wipe por `--command`), y todos los comandos apuntan a `--remote` + config del demo. Corre limpio en el pool de workerd (el fichero puro no importa `node:`).
- **`tenants/demo/scripts/seed-remote.ts`** (shell fino, en `scripts/` como `fetch:fotos`, no bundleado al Worker): imprime el plan (dry-run por defecto) o lo lanza con `spawnSync`. **Doble candado** calcado de `runInfraPlan` (ADR 0012 §5): ejecuta solo con `--apply` **Y** `LOGIC_CAMP_ALLOW_REMOTE_SEED=1` (+ credenciales de Cloudflare). Sin los dos, no toca nada. Impresión con comillas para líneas copiables a mano; ejecución sin shell (argv).
- **Wiring**: `pnpm db:seed:remote` (raíz) → `@tenant/demo seed:remote` → `tsx scripts/seed-remote.ts`. Documentado en `tenants/demo/README.md`. Deuda `[infra]` del BACKLOG marcada **hecha**.

**Verificado** (sin tocar la remota — no hay credenciales en cloud): dry-run imprime el plan completo (23 pasos); `--apply` sin la env var → **bloqueado con exit 1** (candado probado); `remote-seed.test` **6/6**; `seed.test`+`remote-seed.test` **18/18**; typecheck+lint+build **36/36 tareas**; tests no-demo **8/8** (API 182/182). El `--apply` real contra la D1 remota queda para Andreu con credenciales, exactamente como `new:camping --apply` (nunca ejecutado desde el contenedor).

**Sin terminar / diferido con motivo**: el `--apply` real no se ha ejecutado (credenciales de Cloudflare — mismo candado que Fase 9). Sigue sin existir un reseed **automático** (cron / GH Action): decisión consciente — el reseed remoto es destructivo y raro, un comando bajo doble candado es lo correcto, no un automatismo.

**Segundo objetivo (misma sesión, tras "continúa con el desarrollo")**: con B y C bloqueadas por credenciales y D descartada con motivo (ADR 0025 §3), se eligió el remate de más valor front-desk que se puede cerrar y verificar sin credenciales: **el recibo/ticket imprimible del check-out** (`[C4→C4.3]`). Botón "Imprimir recibo" en la ficha (`BookingPanel`, sección desglose) → `window.print()`; recibo presentacional `BookingReceipt.tsx` montado por **portal a `<body>`**, oculto en pantalla y único contenido al imprimir (`@media print`: `#root` oculto, `.lc-receipt` en block), **colores fijos negro/blanco** (el modo oscuro no llega al papel). Reutiliza el desglose auditable + cobros de la ficha (misma `conceptLabel`/`eur`/`fecha`, invariante 2 intacto) + nombre del establecimiento (`/api/admin/settings`, caché compartida con Ajustes). Honesto: "No es una factura." 7 claves i18n `recibo.*`. **Verificado en navegador** (bundle `vite build` real + stub Node + Playwright `emulateMedia:print`, patrón C1/C5): recibo completo y correcto, `#root` oculto/recibo en block, negro sobre blanco, 0 errores (salvo el favicon del stub). Dashboard typecheck+lint+build verdes. **Diferido** (BACKLOG): vídeo/GIF de gestos, traducción de guías — sin cambios.

**Siguiente paso**: ver `docs/SIGUIENTE-SESION.md`.

### Sesión 44 — 2026-07-24 · **Deploy del parte de viajeros a la demo** (sin ADR, remate de la 43)

**Contexto**: `main` local al día con `origin/main` (`e6c7a2f`, el merge de la 43 ya subido). `git fetch` de arranque falló por un corte de DNS transitorio; se reintentó al recuperar red y **sí** estaba sincronizado. Objetivo elegido con Andreu al empezar (una sesión = un objetivo): **Opción A — desplegar el parte** de la sesión 43. Sin cambios de código: solo deploy, reseed remoto y docs.

**Hecho**

- **Pre-vuelo**: `pnpm check` **45/45 verde** (local, sin cambios), `wrangler whoami` OK, migración `0006_hospedajes.sql` confirmada **pendiente** en la D1 remota.
- **`deploy:demo`** (`apps/api`): build de site+web(`BASE_PATH=/demo`)+dashboard → copia a `site/dist/{demo,admin}` → **migración 0006 aplicada en remoto** → `wrangler deploy` del Worker. Versión **`105e5097`**, triggers `camp.logic2b.com/*` + crons activos.
- **Reseed remoto de la demo** (ver "Hallazgo"): wipe FK-safe tabla a tabla + `seed --file` → **26.561 filas**, `modules.hospedajes.enabled=1`, `codigoEstablecimiento=CS-DEMO-0001`, 2032 reservas/huéspedes/booking_guests restaurados, `d1_migrations` preservada.
- **Verificado en producción** (logueado `gerencia@calasereno.example`, rutas hash): `/admin/#/parte` con lista de llegadas real, banner "faltan datos en 3 campos", aviso por fila con enlace a la ficha, `<select>` de forma de pago (Plataforma/Transferencia/Tarjeta/Sin forma de pago), **"Descargar XML"** presente y **sin "Enviar"** (modo manual, correcto sin secrets SES). `/docs/gestion/parte/` y `/demo/` → 200.

**Hallazgo (raíz del sobrecoste de la sesión)**: la demo **no re-siembra la D1 remota sola**. El "reset nocturno" que asumían las notas de la 43 **no existe en el código**: el `scheduled()` del Worker solo purga holds/avisos/retención, `deploy-demo.yml` solo hace `wrangler deploy`, y `db:reset`/`db:seed` son **solo locales**. Por eso, tras el deploy, la pantalla salió **"este camping todavía no tiene activado el parte"** (degradación limpia, no un fallo): la migración lleva el **schema** pero `modules.hospedajes` vivía solo en el **seed**, y la remota tenía datos viejos. Re-sembrar a mano tuvo dos trampas: (1) **D1 sí fuerza foreign keys** → `DELETE FROM bookings` suelto da `FOREIGN KEY constraint failed`; hay que borrar **hijos→padres**; (2) el `--file` con miles de borrados hace `fetch failed` (timeout del batch) → ir **tabla a tabla con `--command`** (requests pequeños), preservando `d1_migrations`. El `seed.sql` es **INSERT-only** (no idempotente): exige DB vacía. Registrado en `docs/BACKLOG.md` `[infra]` y en memoria `demo-sin-reseed-remoto` (pendiente: un `pnpm db:seed:remote` que encapsule wipe FK-safe + seed).

**Sin terminar / diferido con motivo**: `sesTransport` sigue **sin verificar** contra el webservice SES real (credenciales — misma categoría que Stripe/Redsys). Nombres/códigos exactos del XML sin cerrar contra la espec oficial. Prosa de la guía solo en `es`. La descarga real del XML **no** se probó desde el navegador (requiere permiso de descarga; el botón y el modo manual quedan verificados por presencia).

**Verificado**: `pnpm check` **45/45** (local, sin cambios de código). Deploy y reseed verificados contra la D1/Worker **remotos** reales y en el navegador contra producción.

**Siguiente paso**: ver `docs/SIGUIENTE-SESION.md`.

### Sesión 43 — 2026-07-23 · **Parte de viajeros** (ADR 0028) · fase propia

**Contexto**: `main` local al día con `origin/main` (árbol limpio, `git fetch` de arranque como manda la trampa de sesiones anteriores — esta vez sí estaba sincronizado). El trabajo de la sesión 42 (sistema EQUIPO, skill `/equipo`, ADR 0028) **ya estaba commiteado y subido** (`d7009a3`), al contrario de lo que anticipaba el prompt. Andreu **validó el ADR 0028** al empezar → estado `aceptado`, luz verde para implementar.

**La decisión que ordenó el alcance**: el ADR se escribió reconociendo por adelantado dos huecos "de memoria" a cerrar contra la especificación oficial. Al investigarla (SES.Hospedajes / RD 933/2021), el campo que el ADR llamó "fecha/país de expedición del documento" resulta ser **"número de soporte del documento"** — un dato distinto del número, que en el DNI es el código IDESP. Justo el motivo por el que el contrato pide cerrar contra la espec y no de memoria. Se corrigió en la migración, el modelo y la ficha.

**Hecho** (vertical completo, en el orden del ADR)

- **Migración D1 `0006` aditiva** (5 columnas nulables, sin backfill, mismo criterio que 0004/0005): `guests.sex`, `second_surname`, `doc_support_number`, `kinship` (parentesco, solo menores <14) + `bookings.payment_kind` (forma de pago, dato **propio**, no derivado de `payments.provider`). Reflejada en `schema.ts`.
- **`packages/hospedajes`** (paquete PURO, espejo de `payments`/ADR 0011, **22 tests**): `buildParte` valida antes de generar y devuelve un `ParteIssue` por reserva/campo que falta (adulto vs menor de 14, pasaporte sin exigir soporte/2º apellido, estancia sin forma de pago…); `serializeParte` produce XML determinista y escapado — **estructura provisional y honesta**, con aviso de que nombres/códigos exactos se cierran contra la espec oficial; `HospedajesTransport` con `manualTransport` (descarga, opera desde el día uno) y `sesTransport` (webservice real escrito con `fetch` inyectable, **sin verificar** hasta credenciales, como Stripe/Redsys/Resend).
- **Config + orquestación**: `tenantHospedajesSchema` en `packages/config` (`modules.hospedajes`), secrets SES en el `Worker` (`Bindings`, no en `modules`), y `apps/api/src/hospedajes.ts` (`loadHospedajesConfig` + `resolveTransport` + `gatherEstancias` + `buildParteForDate`, resultado discriminado disabled/empty/issues/ready).
- **API**: `GET /api/admin/hospedajes/parte?date=` y `POST /api/admin/hospedajes/enviar` (con `audit_log`), rol `manager`. **Nacieron cubiertas por el barrido de `isolation.test.ts`** (46→48 sin tocar el test — la propiedad de diseño del ADR 0026 en acción). Acción `set_payment_kind` en `bookingActionSchema`. Campos SES añadidos a `guestCreate`/`guestPatch` (Zod). **+10 tests de API → 182/182** (7 de orquestación en `hospedajes.test.ts` + 1 de `set_payment_kind` + 2 del barrido).
- **Dashboard**: pantalla **Parte de viajeros** (`pages/Parte.tsx`) — navegación por día, lista de llegadas, avisos de datos que faltan con enlace a la ficha, `<select>` de forma de pago por estancia, botones Descargar XML / Enviar (este solo si el transporte es `ses`). Ruta + nav en el grupo Gestión + `ayuda.ts` (`/parte → gestion/parte`) + i18n. **Ficha de huésped ampliada** (`GuestsSection`) con 2º apellido, sexo, nº de soporte y parentesco.
- **Guía `gestion/parte.es.md`** (escrita contra la pantalla real, principio "la página publicada es la especificación") — el índice de docs pasa a **4 páginas** en gestión; cromo de la guía actualizado en los **6 idiomas** para mencionar el parte.
- **Seed con datos SES reales** (cero mocks): módulo `hospedajes` activo en la demo, `payment_kind` rotando por reserva, DNI+nº de soporte para huéspedes españoles y pasaporte para extranjeros, **~1 de cada 6 con un dato a falta** para que la pantalla enseñe también el estado "faltan datos". `seed.sql` regenerado (gitignored).

**Hallazgo propio en la verificación**: los tokens `--lc-status-*-fg` son el color de texto **sobre el chip** (casi negro), no sobre el fondo de página — usados como texto de aviso quedaban **ilegibles en modo oscuro** (viola el contraste AA del contrato). Corregido: texto en `foreground`/`muted-foreground`, ámbar solo en el icono. Verificado legible en claro **y** oscuro.

**Verificado**: `pnpm check` **45/45 tareas verde** (local). Navegador contra los bundles reales (patrón stub Node, sin wrangler): la guía `/docs/gestion/parte/` renderiza con índice de 4 páginas y el índice de docs muestra las 4 tarjetas; la pantalla del dashboard renderiza en claro y oscuro con **0 errores de consola**, los avisos en ámbar legibles, el `?` apuntando a `camp.logic2b.com/docs/gestion/parte/`, y las dos estancias (una completa con "Tarjeta", otra con dos avisos + enlace a la ficha).

**Sin terminar / diferido con motivo**: NO desplegado (`deploy:demo`). `sesTransport` **NO verificado** contra el webservice real (sin credenciales — misma categoría que Stripe/Redsys). Los nombres/códigos exactos del XML (sexo, parentesco, país en alpha-3 —la ficha guarda alpha-2—, forma de pago) se cierran contra la espec oficial cuando se implemente el envío real. Prosa de la guía solo en `es` (fallback visible, criterio ADR 0025).

**Siguiente paso**: ver `docs/SIGUIENTE-SESION.md`.

### Sesión 41 — 2026-07-22 · **Deploy de la sesión 40 + guías de gestión** (remate BACKLOG, sin ADR)

**Contexto**: sesión en local, con Andreu presente. El `main` local **sí** estaba al día con `origin/main` esta vez (se comprobó con `git fetch` de arranque, como manda la trampa de las sesiones 36/38/40). Dos bloques: primero desplegar y medir lo que la sesión 40 dejó sin subir; después, elegido por Andreu, el remate de las **guías de gestión**.

**Hecho — bloque 1: desplegar y medir** (lo que pedía el prompt de la 40)

- **Desplegada la demo** (`pnpm run deploy:demo`, versión `1d2c2f37`): se subieron de una vez la landing atmosférica (ADR 0027), las 6 fotos del tenant descargadas en la 40, y los cambios de dashboard de la **sesión 38** (gris de sidebar + off-canvas móvil) que llevaban dos sesiones sin desplegar. Migraciones remotas aplicadas, cron activo.
- **Verificado en producción**: `/` `/fr/` `/de/` `/nl/` `/demo/` y las fotos del héroe → 200; h1 traducidos correctos; héroe atmosférico + marco `captura-web.webp` + galerías del tenant cargando, **0 imágenes rotas, 0 errores de consola**.
- **Lighthouse real contra producción** (Chrome headless): **desktop 98 / móvil 96** en Performance; accesibilidad 96/100, best-practices 100, SEO 100. LCP 1,0s (desktop) / 1,8s (móvil), CLS 0. **La foto del héroe (224KB) NO penaliza**: el elemento LCP es `<img src="/hero-atmosfera.webp" fetchpriority="high">` — ya prioriza la carga, sin necesidad de preload ni bajar calidad. Se descarta la mitigación que el prompt tenía preparada.
- **Verificada la supresión RGPD de Fase 11** (pendiente logueada): abierto un cliente con estancia reciente (Emma Bakker, estancia 4–18 ago 2026) e intentada la supresión → `DELETE /api/admin/guests/gst_044 → 409 {error:"retention_hold", until:"2029-08-18", basis:"traveller_registry"}`. Fecha exacta y calculada (salida 18 ago 2026 + 3 años del RD 933/2021), no error genérico. La UI **no** usa toast: pinta un aviso persistente (`role="alert"`, "Todavía no se pueden suprimir… a partir del 18 de agosto de 2029… puedes copiar este aviso y enviárselo") — por diseño, para que se lea entero y se copie. También confirmado que el bloque "Protección de datos" de la ficha renderiza con sesión.

**Hecho — bloque 2: guías de gestión** (remate BACKLOG [C6], objetivo elegido por Andreu)

- **Decisión de IA con Andreu**: informes/tarifas/ajustes son de **gestión del negocio** (gerencia/dirección), ni recepción de mostrador ni decisión de compra → **cuarta guía "gestión"** propia, no dentro de "dueño" (para no mezclar páginas estratégicas —niveles— con operativas —informes—). `GUIAS` pasa a `['recepcion','gestion','dueno','tecnica']`, una escalera: mostrador → llevar el negocio → decidir → informático.
- **Tres páginas de prosa** (`apps/site/src/content/docs/gestion/{informes,tarifas,ajustes}.es.md`), escritas **contra el código real** de cada pantalla (principio de Fase 11 "la página publicada es la especificación"): Informes (3 rangos, 5 tiles con la distinción ingresos/cobrado, ocupación por tipo, solo-lectura en vivo); Tarifas (tabla por temporada, 6 importes + mín. noches, invariante 3 a la vista —cambiar tarifa no toca reserva confirmada—, temporadas por prioridad); Ajustes (nombre/zona/moneda editables, nivel+idiomas de solo-lectura porque afectan al despliegue, notificaciones on/off sin deploy + remitente + buzón).
- **Cromo en los 6 idiomas** (`content/{es,en,ca,fr,de,nl}.json`): `docs.guias.gestion.{nombre,para,texto}`, subtítulo del índice reescrito ("Tres/Cuatro guías…") y `docs.seo.title/description` con la gestión añadida. Prosa solo `es` con aviso de fallback (mismo criterio que ADR 0025 §3).
- **Ayuda contextual conectada**: `apps/dashboard/src/lib/ayuda.ts` deja de devolver `null` en `/informes` `/tarifas` `/ajustes` → el `?` (ya presente en las tres pantallas) se pinta y abre su página. Sin tocar el componente.

**Verificado**: `pnpm check` **42/42** (local; el único "hint" de site:typecheck es preexistente en Landing.astro:417, ajeno). Build del site **180 páginas** (antes 156), las 24 páginas de gestión (3 + índice × 6 idiomas) generadas. Navegador contra el `dist` servido: índice `/docs/` con **4 tarjetas** en orden y recuentos correctos (14·3·3·4), página de tarifas renderizada (índice lateral, prosa con negritas/listas, 0 errores de consola), y `/en/docs/gestion/informes/` con cromo en inglés + aviso de fallback + prosa en es. Typecheck del dashboard limpio.

**Deuda conocida de la sesión**: la cuarta guía **no se desplegó a producción** (el `?` del dashboard en producción todavía apunta a páginas que aún no existen allí; el dashboard desplegado sigue siendo el de antes de este cambio, así que en producción no hay incoherencia hasta que se despliegue). Primer paso de la próxima sesión: `cd apps/api && pnpm run deploy:demo` para subir las guías + los `?` juntos.

**Siguiente paso**: ver `docs/SIGUIENTE-SESION.md` — desplegar las guías de gestión y luego elegir frente (Fase 9 alta real, o Parte de viajeros con su ADR 0028).

### Sesión 40 — 2026-07-22 · **Landing atmosférica** (ADR 0027) — primera sesión en la máquina de Andreu con Higgsfield funcionando

**Contexto**: sesión en local (no cloud). La primera mitad del chat fue planificación (sesión 39 de facto): diagnóstico de por qué la landing de venta se sentía "de plantilla" y decisión de Andreu de reabrir la parte "sin fotografía" de la marca del Frente B → dirección **atmosférica**. El main local estaba **1 commit por detrás** de origin/main (tercera vez: sesiones 36, 38 y esta) — sincronizado con fast-forward antes de tocar nada. Rama `sesion-40-landing-atmosferica`.

**Hecho**

- **ADR 0027 — landing atmosférica**: la landing de venta lleva fotografía de camping como **atmósfera contenida** (héroe con scrim AA); el resto de superficies Logic2B siguen neutras; tipografía/paleta no cambian (atmosférica ≠ crema+serif+terracota). Excepción anotada en `BRAND.md` §0.
- **Desbloqueado el atasco de 4 sesiones**: `pnpm --filter @tenant/demo fetch:fotos` corrió sin el bloqueo de red del contenedor — las **6 fotos del tenant (C5.1)** descargadas y commiteadas en `tenants/demo/content/media/`.
- **Héroe nuevo**: foto Higgsfield generada esta sesión (contrato de arte ADR 0024: pino carrasco, primera luz, sin gente, sin HDR; 219KB desktop + 69KB móvil) + **marco de navegador con captura REAL de la web del tenant** con su widget de disponibilidad a la vista (cumple por fin "el héroe es el widget funcionando" del CLAUDE.md). Captura tomada con Playwright contra el dev real (patrón C5), sin la franja de demo.
- **Cuerpo de la landing**: bloques "dos caras" con captura por cara (web/planning), planning firma a ancho completo con `captura-plano.webp` asomando (existía sin usar), niveles como **escalera** (número 01–04 + destacado elevado con `Recomendado` i18n), iconos lucide inline (sin dependencia), checks en vez de puntitos, y **reveal on-scroll** con doble guardia: sin JS todo visible desde el primer paint (`html.lc-js` como gate) y `prefers-reduced-motion` salta el observer. Bug encontrado y arreglado por verificación en navegador: la regla de ocultación ganaba por especificidad a la de visibilidad (`html.lc-js .lc-reveal` (0,2,1) > `.lc-reveal.lc-visible` (0,2,0)).
- **fr/de/nl completos** (cierra [B3] del BACKLOG): `fr.json`/`de.json`/`nl.json` traducidos enteros (landing + cromo de guías) + `LOCALES` ampliado a 6 — **156 páginas** construidas, hreflang y sitemap salen solos del bucle existente.

**Verificado**: typecheck 0 errores; build de site limpio; **`pnpm check` 42/42** (local, sin los rojos ambientales del cloud); Playwright full-page a **1366px y 375px** — 0 errores de consola, 0 imágenes rotas (la única "rota" en móvil es el plano `hidden sm:block`, que nunca se muestra ni carga ahí, correcto); reduced-motion con 0 elementos ocultos; `/fr/` `/de/` `/nl/` responden 200 con su h1 traducido.

**Deuda conocida de la sesión**: la prosa de las guías sigue solo en `es` — los 3 idiomas nuevos ven el aviso de fallback (decisión del ADR 0025, sin cambio). El screenshot del panel de preview quedaba en blanco tras scroll programático (limitación de la herramienta, no de la página — verificado vía Playwright).

**Siguiente paso**: desplegar (`cd apps/api && pnpm run deploy:demo`) — se llevan de una vez la landing nueva, las 6 fotos del tenant Y los cambios de dashboard de la sesión 38 que seguían sin desplegar; re-medir Lighthouse ≥95 en producción con la foto del héroe. Después: Fase 9 (alta real) o parte de viajeros (su ADR será el **0028**, el 0027 lo ocupó esta sesión).

### Sesión 38 — 2026-07-21 · **Remates cortos de BACKLOG** (sin ADR — no es fase nueva)

**Contexto**: con los Frentes B/C cerrados y la Fase 11 desplegada, Andreu eligió una sesión corta de remates. Rama `claude/estas-69xl50`. **El main local estaba 2 commits por detrás de `origin/main`** (solo docs del despliegue de la Fase 11) — reseteada la rama a `origin/main` antes de tocar nada. La trampa de la sesión 36 volvió a estar viva; sigue mereciendo el `git fetch` de arranque.

**Hecho** (dos remates + un bug de raíz que destapó el segundo)

- **"En casa" en `/reservas` y en la ficha de cliente** ([C4] BACKLOG): la tabla de gestión mostraba "Confirmada" a un huésped presente. Ahora el estado se **deriva** igual que en el planning/plano/Llegadas (`status==='confirmed' && checkedInAt && !checkedOutAt → 'inhouse'`, misma expresión que `Planning.tsx:67`, inline siguiendo el precedente del repo). `/reservas` no necesitó API (`BookingListItem` ya traía los timestamps). El historial de la ficha sí: se añadieron `checkedInAt`/`checkedOutAt` al select de `GET /guests/:id` (aditivo, ruta existente → el barrido de aislamiento no se toca) y al tipo `GuestBooking`, con el test de `admin.test.ts` extendido para cubrirlo.
- **Sidebar móvil off-canvas** ([B1] BACKLOG): bajo `md` la sidebar persistente se oculta (`hidden md:flex`) y una barra con hamburguesa abre la navegación en el primitivo **`Sheet`** (`side="left"`: trampa de foco + Escape + overlay, ya existía desde C2); pulsar un enlace cierra el drawer. El contenido de la sidebar se extrajo a **`SidebarInner`**, compartido por la aside de escritorio y el off-canvas — añadir un enlace no se puede olvidar en una de las dos vistas. El `<Outlet>` se envolvió en un `<main>` flex-col que descuenta la barra móvil (las páginas usan `h-full`/`flex-1` esperando ser hijo-flex del contenedor).
- **Bug de raíz destapado** (`packages/ui/src/theme.css`): la familia `--color-sidebar*` **no estaba mapeada en `@theme`**, así que `bg-sidebar`/`border-sidebar-border` **no generaban CSS desde B1** (ADR 0017) — la sidebar iba **transparente**, invisible sobre página blanca pero destapada por el overlay del drawer (el panel se veía a través). Mapeada la familia completa (8 tokens que ya existían en `:root`/`.dark`). Misma clase de bug "el DS funciona por coincidencia" del hallazgo Tailwind de ADR 0020. **Efecto lateral visible**: la aside de escritorio ahora tiene su gris tenue real (`--sidebar`, oklch 98.5% en claro) que la separa del contenido — el look shadcn buscado, no una regresión.

**Verificado** (patrón stub sin workerd, como C1/C5/C6): `vite build` real del dashboard + servidor Node que sirve el bundle y stubbea `/api/auth/get-session` + `/api/admin/*`, con Playwright/chromium. **1366px**: aside visible, sin hamburguesa. **375px**: aside oculta, hamburguesa visible, el drawer abre con los **12 enlaces** y **cierra al navegar** (URL → `/reservas`). Panel opaco confirmado en **claro** (`oklch 0.985`) y **oscuro** (`oklch 0.205`). Capturas enviadas a Andreu.

**`pnpm check`**: cloud **38/42**, todos los fallos **ambientales y ajenos a lo tocado**, confirmados en aislamiento: `api` typecheck + **172/172** tests + lint verdes; `dashboard` typecheck + build + lint verdes; `ui` typecheck + **54/54** (incl. `theme-contrast`, mi cambio no rompe el contrato AA) + lint verdes; `web` typecheck **0 errores** (no tocado). Los rojos del paralelo: `web:build` crash de esbuild ("callback is not a function", worker reiniciado a mitad de sesión), `tenants/demo:test` crash del pool de workerd (`ECONNREFUSED`/unhandled rejection en `[worker eval]` — el segfault documentado sobre `reset.test.ts`, no tocado), `api:test` flaky bajo carga paralela. Es el "si ves 40/42 en cloud, es eso" de las sesiones 32–37.

**Siguiente paso**: ver `docs/SIGUIENTE-SESION.md` — Fase 9 (alta real, con Andreu + credenciales) o Parte de Viajeros (ADR 0027). Quedan de este bloque de remates: fr/de/nl de la landing y guías de gestión.

### Sesión 37 — 2026-07-21 · **Fase 11 — endurecimiento** (ADR 0026)

**Contexto**: primera fase tras cerrar los Frentes B y C. Es la puerta declarada antes del primer camping real en producción. Rama `claude/endurecimiento-fase11`. (El `main` local **sí** estaba al día esta vez — se comprobó con `git fetch` antes de tocar nada, como quedó escrito tras el susto de la sesión 36.)

**El hallazgo que reordenó la fase.** La Fase 11 estaba en el plan como una lista de buenas intenciones ("aislamiento, RGPD, backups, observabilidad, carga, legales") sin criterio para ordenarla. La auditoría previa al ADR le encontró uno, y no era el esperado: en C6 (sesión 36) publicamos `camp.logic2b.com/docs/tecnica/datos-rgpd/`, la página que lee **el informático del cliente antes de que su jefe firme** — y **cuatro de sus afirmaciones no eran verdad**:

| Afirmación publicada                                            | Realidad medida                                                                                                      |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| "test automático explícito que en cada entrega intenta la fuga" | Existía, cubría **3 de 40 rutas** (7,5 %)                                                                            |
| "el sistema guarda el consentimiento con su fecha"              | `admin.ts:839` lo escribía siempre `null`, y el _checkbox_ del funnel **no tenía `name`**: nunca llegaba al servidor |
| "Registro de auditoría **inalterable**"                         | Tabla D1 normal. La demo la borra entera cada noche                                                                  |
| "volcado en SQL **y en CSV**… pedid una exportación de prueba"  | **No existía exportador de ninguna clase** en el repo                                                                |

La última es la peor: no es una exageración, es **una invitación explícita a pedir una prueba** que habría terminado en silencio. De ahí el criterio del ADR 0026, que Andreu validó: **la página publicada es la especificación**. Cada bloque se juzga por si hace verdad una frase ya publicada, o corrige una que no lo es. Ninguna afirmación falsa sobre datos personales sobrevive a la sesión.

**Las dos decisiones de diseño que mandan**

- **El aislamiento se prueba por BARRIDO, no ruta por ruta.** El hueco era de 37 rutas; escribir 37 tests es la decisión prohibida por el contrato: no multiplica por camping, pero **multiplica por funcionalidad** y depende de que nadie se olvide — que es exactamente cómo se llegó al 7,5 %. Verificado que `app.routes` de Hono expone el inventario completo **incluidos los routers montados**, el test se genera de ahí: **42 rutas barridas** + 3 excepciones declaradas con motivo, y **falla si aparece una ruta que no esté ni barrida ni declarada**. Mismo movimiento que el test de cobertura del plano en C7: en vez de comprobar los casos que se nos ocurren, se comprueba que no falte ninguno. Demostración involuntaria de que funciona: mientras el agente lo escribía, otro frente añadió `/guests/:id/export` y `/rgpd/retention` — **el barrido las recogió solas**.
- **La supresión anonimiza, y cuando no puede NIEGA CON FECHA.** Borrar en duro es ilegal (reservas y pagos por obligación fiscal, identidad por RD 933/2021); ignorar la petición también. Así que `DELETE /guests/:id` nunca borra: vacía los datos personales y conserva el histórico sin dueño identificable; y si hay una estancia en plazo responde **409 con la fecha exacta** desde la que sí se podrá. Un "no" sin fecha es indistinguible de un producto que no sabe hacerlo; un "no hasta el 14/03/2029 porque la estancia del 14/03/2026 está sujeta al plazo del registro de viajeros" es una respuesta que el camping reenvía al interesado tal cual.

**Hecho** (4 bloques + 3 hallazgos propios)

- **ADR 0026**, validado antes de escribir código. Andreu aprobó el encuadre, la decisión de dominio 2.2, el bloque 4 sin pipeline propio (a recomendación explícita) y el alcance de los cuatro bloques.
- **Bloque 1 — aislamiento** (`apps/api/test/isolation.test.ts`, **46 tests**): 42 rutas barridas contra el tenant B con identificadores y sesión de A. **Cero fugas reales.** Verificado además que el cierre del bucle **falla de verdad** al romperlo a propósito — una comprobación que no puede fallar no vale nada.
- **Bloque 2 — RGPD operativo** (`packages/core/src/retention.ts` **17 tests puros** · `apps/api/src/rgpd.ts` · **24 tests** de integración): export del interesado (art. 15/20, auditado — entregar un export también es un tratamiento), anonimización con el freno legal, **limpieza del PII que `audit_log` había copiado** (sin eso la anonimización sería de mentira: `PATCH /guests/:id` volcaba el patch entero, documento incluido), consentimiento con fecha **y versión** sellada por el servidor, y retención automática en cron. El esquema separa el consentimiento por puerta: `literal(true)` en la web —una reserva web sin consentimiento **no se puede crear**— y `boolean` en mostrador, que lo recoge en papel y no puede quedarse bloqueado.
- **Bloque 2.5 — páginas legales**: aviso legal, privacidad y cookies como **texto de PRODUCTO** con datos de tenant interpolados desde un bloque `legal` nuevo en `TenantWebConfig` (18 páginas, 6 locales). **Sin banner de cookies**, y comprobado en vez de supuesto: no hay analítica, ni píxeles, ni `document.cookie`. Las claves `footer.legal`/`footer.privacidad`, huérfanas desde hacía seis idiomas, por fin apuntan a algo.
- **Bloque 3 — observabilidad**: `onError`/`notFound` (antes **cualquier excepción salía como 500 con el stack trace en el cuerpo**), log estructurado JSON de una línea con enganche único para Logpush/Sentry, aviso al buzón con cortafuegos de 15 min agrupado por ruta, y cada tarea del cron **falla sola** (antes, si la purga de holds reventaba, los recordatorios de llegada de ese tick no se ejecutaban).
- **Bloque 4 — copias**: decidido **no** montar pipeline propio (con 6h/semana se pudre en silencio, y una copia que descubres rota el día que la necesitas es peor que no tenerla). Sí: `pnpm export:tenant` (SQL + CSV, **10 tests** en la parte pura) **probado contra la base local** — 2032 reservas, 2032 huéspedes, 1898 pagos, CSV verificado con anchos constantes — y `docs/RUNBOOK-COPIAS.md` con restauración, comandos verificados contra el `wrangler` real, y **cinco comprobaciones que incluyen los invariantes 1 y 2** antes de dar una copia por buena.
- **`docs/RAT-PLANTILLA.md`**: registro de actividades del art. 30, plantilla de producto — se escribe una vez y el alta rellena cinco campos.

**Tres hallazgos propios, fuera del encargo**

1. **El cron de `tenants/_template/wrangler.jsonc` estaba COMENTADO.** Un camping nuevo nacía sin purga de holds ni recordatorios — y ahora tampoco tendría retención de datos. Era un paso silencioso y olvidable en un alta que debe costar una tarde: la línea roja del proyecto. Activado, con el motivo escrito.
2. **El nivel 1 acumulaba datos personales para siempre.** No tiene motor ni reservas, pero sus `enquiries` guardan nombre, correo y teléfono. Se añadió purga propia que **anonimiza el contacto y conserva la solicitud** — porque el histórico de peticiones es lo que hace renovar al nivel 1 (CLAUDE.md) y las fechas no son dato personal.
3. **Hono solo entrega a `onError` lo que es `instanceof Error`**: un `throw 'texto'` se escapaba a workerd, que respondía con su propio 500 — la misma fuga por otra puerta. Tapado con un middleware que normaliza lo lanzado.

**La doc publicada, corregida**: `datos-rgpd.es.md` reescrita entera en sus afirmaciones. Las cuatro falsas o se implementaron o se corrigieron; "inalterable" pasa a decir **exactamente lo que el registro es y lo que no es**, con la invitación a hablarlo si la política del cliente exige más. Se añaden dos pruebas nuevas que un cliente puede pedir: el procedimiento de restauración y una demostración del ejercicio de derechos, **incluida la respuesta de un plazo legal que lo impide**.

**Verificado en el navegador** (web de tenant real): privacidad con los datos del tenant interpolados, cookies con la variante correcta de la demo, los tres enlaces del pie, el aviso de fallback en francés con `lang="es"` solo en la prosa, y **0 errores de consola**.

**`pnpm check`**: ✅ **verde 42/42** — API **172/172**, `@tenant/demo` 18/18, sin el segfault de workerd (sesión en la máquina de Andreu).

**Desplegado en producción** el mismo día (versión `f4288603`): migración `0005_rgpd.sql` aplicada en la D1 remota (verificado en `d1_migrations` y en `pragma_table_info('guests')`), páginas legales en vivo con los datos del tenant interpolados y 0 errores de consola, ficha técnica corregida servida, rutas `/guests/:id/export` y `/rgpd/retention` respondiendo 401 sin sesión, y `notFound` devolviendo JSON en vez del HTML por defecto de Hono. Queda una comprobación manual con sesión: el bloque "Protección de datos" de la ficha de cliente.

**Siguiente paso**: ver `docs/SIGUIENTE-SESION.md`.

### Sesión 36 — 2026-07-21 · **Frente C — C6: documentación** (ADR 0025) · **cierra el Frente C**

**Contexto**: última fase del Frente C, y la que arrastraba la decisión pendiente **B-ii** desde el 2026-07-19. Con C1/C4/C5/C7 cerrados existe por fin un flujo completo que documentar (llegada → check-in → cobro → mover en el planning → check-out) y capturas reales del producto. Rama `claude/docs-c6-cmtsyf`.

**Hallazgo de arranque**: el `main` local estaba **5 commits por detrás** de `origin/main` (01539e7 vs 5b0e8a6) — el trabajo de C7/C4/C1/C5 vivía solo en el remoto. Fast-forward antes de tocar nada. Merece registro porque el árbol de trabajo estaba limpio y nada lo delataba salvo comparar con el remoto.

**La decisión (B-ii), y la observación que la resuelve**: el criterio del proyecto es siempre "¿qué NO multiplica el trabajo por camping?". Aplicado aquí no discrimina, porque **la documentación es del PRODUCTO, no del tenant**: se escribe una vez y sirve a todos, así que el coste por camping ya es cero en las tres opciones. Eso mueve la decisión al **coste fijo de construcción con 6h/semana** — y ahí `apps/site` gana sin discusión: ya trae tokens oklch, Inter/Space Grotesk self-hosted, isotipo, i18n es/en/ca, canonical/hreflang/OG **y el pipeline de despliegue**, porque `apps/site/dist` **es** el directorio de assets que compone el Worker del tenant (`tenants/demo/wrangler.jsonc:18`). Una página nueva en `src/pages/docs/` se despliega sin tocar el pipeline. Starlight habría exigido un tercer build, un paso de composición nuevo y re-tematizar su DS a Logic2B, a cambio de buscador y versionado que tres guías no necesitan; `ui.logic2b.com` es externo al repo y su relación con `packages/ui` es **B-iii, todavía abierta** — acoplar la última fase del frente a una decisión sin tomar habría sido bloquearla por algo ajeno. El corolario que sí habría multiplicado el alta queda descartado por escrito: **docs por tenant**, no; URL absoluta a la casa común.

**Hecho**

- **ADR 0025**: resuelve B-ii, fija el reparto prosa/cromo, los idiomas de arranque, las tres audiencias y la ayuda contextual. Con su sección de "qué NO se hace y por qué".
- **21 páginas de guía** (`apps/site/src/content/docs/`): recepción **14** (una tarea por página, orden de un día de mostrador), dueño **3**, técnica **4**. Escritas para su lector: la de recepción sin una palabra de jerga y con la salida a mano en cada apuro; la técnica sin marketing, con las decisiones que un informático pregunta (céntimos enteros, fechas sin zona horaria con `date_to` exclusive, precio calculado en servidor, base D1 por camping con test de fuga cruzada) y con una nota honesta sobre el estado del endurecimiento RGPD.
- **Infraestructura de docs**: `lib/docs.ts` (glob + fallback **por página**, no por guía — 3 páginas traducidas no deben tirar la guía entera al castellano), `layouts/Docs.astro` (índice lateral, `order-last` en móvil sin JS ni acordeón), `DocsIndice`/`DocsGuia`/`DocsPagina` y 6 rutas (`/docs/…` + `/{lang}/docs/…`). `Base.astro` generalizado con `ruta`/`seo` para que canonical, hreflang y el selector de idioma **conserven la página** en vez de mandar siempre a la portada.
- **Prosa sin dependencia nueva**: `.lc-prosa` en `global.css` (~15 selectores) en vez de `@tailwindcss/typography`. Cuerpo a 17px/1.7 a propósito — la lectora de referencia es la recepcionista de 55 años. Con `kbd` de verdad para las teclas del gestor y tablas que scrollan ellas (nunca el body) en móvil.
- **Ayuda contextual en el dashboard**: `BotonAyuda` en las **12 barras de pantalla**, leyendo la ruta activa del router (una pantalla nueva solo pone el componente; el destino lo decide el mapa único de `lib/ayuda.ts`). Es un `<a target="_blank">` real, no un botón con `window.open`, para que se pueda copiar y mandar. Las rutas con parámetro (`/reservas/$id`) heredan la ayuda de su lista.
- **Enlaces**: landing (nav, pie y bloque propio de las tres guías tras "niveles") y **sitemap** ampliado — las guías son la superficie de búsqueda larga del producto ("cómo hacer el check-in en un camping"), así que entran como todo lo demás.

**Diferido con motivo** (BACKLOG): guías de `/informes`, `/tarifas` y `/ajustes` — son pantallas de gestión, fuera del alcance de una guía de recepción; su `?` **no se pinta**, a propósito. Vídeo/GIF de los gestos del planning (un arrastre se explica mejor en movimiento, pero exige un pipeline de vídeo que hoy no existe). Traducción de la prosa a en/ca.

**`pnpm check`**: ✅ **verde 42/42**. Esta sesión corrió en la máquina de Andreu, así que **no apareció el segfault de workerd** sobre `reset.test.ts` que tumba el check en el contenedor cloud — se confirma que era ambiental, como se venía registrando.

**Siguiente paso**: el Frente C está cerrado. Ver `docs/SIGUIENTE-SESION.md` para el replanteo de qué sigue.

### Sesión 35 — 2026-07-21 · sesión autónoma · **Frente C — C5: materia, fotos e imagen** (ADR 0024)

**Contexto**: mandato autónomo permanente del Frente C. Andreu autorizó Higgsfield al cerrar la sesión 34, con la prudencia de siempre (fijar prompts antes de generar, tandas pequeñas). ADR primero, criterio propio, no parar hasta cerrarlo — como C7/C4/C1.

**El giro que cambió el alcance**: antes de generar nada, se audita el estado real de la 1ª tanda de fotos (sesión 8) y resulta que **las 6 fotos que hacían falta ya estaban generadas** — de los 4 ficheros que pide `C-BUG-5` y los 2 de `Instalaciones.astro`, los 6 UUIDs ya estaban en `docs/BACKLOG.md` con prompts que cumplen el contrato de arte (pino de Alepo, luz de mañana/última hora, sin gente, sin HDR). Por cómo compone `fotos.ts` (`[principal, detalle]` deduplicado), descargar solo 2 de esos 6 ficheros (`detalle-bungalow-interior`, `detalle-glamping-interior`) también cierra sola la "2ª foto por tipo" en bungalow/mobil/glamping. **El hueco nunca fue de prompt ni de crédito — es de descarga**, y la descarga sigue bloqueada por la política de red del contenedor (`d8j0ntlcm91z4.cloudfront.net`, 403 confirmado de nuevo hoy en `$HTTPS_PROXY/__agentproxy/status`, **3ª sesión consecutiva** con el idéntico bloqueo, mismo README del proxy: "do not retry or route around it"). Decisión de fondo (ADR 0024): **no generar nada nuevo** (regenerar no resuelve nada — la imagen nueva viviría en el mismo host bloqueado) — se prepara en su lugar un script listo para ejecutar en cuanto haya red.

**Hecho**

- **ADR 0024**: audita el estado real, cierra la lista de 6 prompts como definitiva (tabla con UUID + resumen de cada uno), decide no gastar créditos, y fija la metodología de C5.2 (capturas reales sin red externa, OG image de marca sin fotografía).
- **`tenants/demo/scripts/fetch-higgsfield-fotos.ts`** (+ `sharp` como devDependency de `@tenant/demo`, `pnpm --filter @tenant/demo fetch:fotos`): descarga las 6 `rawUrl` conocidas y las optimiza a WebP ~2000px `q78` (mismo perfil que el resto de `tenants/demo/content/media/`) directamente con el nombre que el código ya espera — cero cambio de código cuando se ejecute. No se pudo correr en este contenedor (mismo bloqueo); es la tarea de Andreu (o de una sesión con otra política de red) de unos minutos.
- **`docs/FRENTE-C-ACABADO.md`**: C5 pasa a 🟨 PARCIAL con el detalle de qué está cerrado (lista de prompts, código de degradación) y qué falta (solo bytes); `C-BUG-5` igual — registrado honestamente como bloqueo de entorno, no de código, misma categoría que el bloqueo de credenciales de Cloudflare en Fase 9.
- **C5.2 (✅ completo, sin red)**: un agente en paralelo construyó el bundle real del dashboard (`vite build`) + un servidor Node stub que sirve ese bundle y responde `/api/admin/planning`+`/api/admin/map` con datos calculados del MISMO generador de seed puro (`generateSeed(2026)`, transformado a las formas camelCase de `apps/dashboard/src/api.ts`) — sin workerd, mismo patrón que C1/ADR 0023 — y Playwright/chromium capturó el planning real (agosto 2026, ~319 reservas visibles) y el plano real. La captura del planning sustituye la maqueta CSS de `apps/site/src/components/Landing.astro` (cierra BACKLOG **[B3]**); la del plano queda en `docs/img/captura-plano.webp` para **C6** (no hay sección de plano en la landing hoy). Además, una **OG image de marca Logic2B** (1200×630, tokens oklch exactos de `packages/ui/src/theme.css`, isotipo, Space Grotesk, sin fotografía del tenant — la landing es superficie Logic2B, `BRAND.md` §0) reemplaza el placeholder del isotipo suelto en `Base.astro`.
- **Verificación propia tras el agente**: revisadas las 3 imágenes (dimensiones, contenido visual correcto — planning denso real con códigos de reserva, plano reconocible con zonas/colores, tarjeta de marca limpia), `pnpm --filter @logic-camp/site build` limpio, `git status` sin residuos de scripts de sesión. Web de tenant comprobada con Playwright contra el build real: `ut_prem`/`ut_moto`/`ut_bung4`/`ut_glamp`/`instalaciones` → **0 imágenes rotas, 0 errores de consola** — la degradación a `tipo-parcela` y el filtrado de instalaciones sin foto funcionan exactamente como se documentó, sin ningún bug de cliente.

**Diferido con motivo**: descarga real de las 6 fotos (bloqueada por red; script listo — recomendación directa a Andreu de correrlo desde su máquina). Sección de plano en la landing (no pedida; activo listo para C6). Más densidad de fotos (baños, exteriores) — BACKLOG, no bloquea C5.

**`pnpm check`**: 40/42 tareas — verde salvo el mismo fallo ambiental de siempre (workerd segfaulta sobre `reset.test.ts`, no tocado). `@tenant/demo` seed 12/12 en aislamiento; `@logic-camp/site` y `@logic-camp/web` typecheck/lint/build limpios; no se tocó código de API/config/ui.

**Siguiente paso**: **C6** — documentación, última fase del Frente C (absorbe B4). Ver `docs/SIGUIENTE-SESION.md`.

### Sesión 34 — 2026-07-21 · sesión autónoma · **Frente C — C1: el planning como pieza de exhibición** (ADR 0023)

**Contexto**: mandato autónomo permanente del Frente C. C1 era el elemento firma declarado y el único que no estaba a la altura: sólido de ingeniería (virtualización, DnD vertical, optimista, teclado) y **pobre de gesto**. ADR primero (0023), criterio propio, no parar hasta cerrarlo — como C7/C4. Rama `claude/planning-c1-gestures-c1ni7l`.

**Las decisiones de fondo**

- **El gesto escribe por la MISMA puerta que todo lo demás**: `move` es una acción más de `bookingActionSchema` (no una ruta aparte) — hereda rol, auditoría y patrón de errores. Espejo del `modify` público, que era el precedente: cambiar fechas re-cotiza SIEMPRE en servidor (el invariante 3 habla de _tarifas_, no de esto).
- **El candado `expectedTotalCents`**: "enseñar el desglose antes de confirmar" obliga a un paso de previsualización (`POST /bookings/:id/requote`, dry-run con las MISMAS validaciones), y toda previsualización caduca. El cliente manda el total que enseñó; si el servidor recalcula otro → 409 `price_changed` con el desglose fresco. Sin ese campo habría una ventana confirmas-X-se-escribe-Y.
- **`preferredUnitId` es preferencia, nunca garantía**: crear arrastrando en la fila A-08 pide A-08; si justo se ocupó, asigna el motor — el alta no falla por la preferencia.
- **NO virtualizar el eje horizontal**: medido, el coste no eran las barras sino el sombreado de finde (`<div>` por celda×fila ≈ miles de nodos). Ahora es UN `repeating-linear-gradient` por lienzo con la fase calculada del día de semana (`weekendBackground`). Descartado con medida, no por intuición — reabrir solo si existe un zoom "Año".
- **C1.5**: el mapa provisional se confirma en estructura y se cierra con **contrato de test** — 27 aserciones oklch→sRGB→WCAG en `packages/ui` (texto ≥4.5:1, barra/fondo ≥3:1, light Y dark). El test cazó de inmediato que el **ámbar provisional de `pending` se quedaba en 1.7:1** sobre blanco (ahora ámbar profundo, 5.6/3.5) y que el `.dark` no declaraba ningún token de estado. Con el mapa cerrado, **modo oscuro conectado** (dependencia declarada en ADR 0020): toggle claro/oscuro/sistema en la sidebar + script pre-React en `index.html` (sin FOUC).

**Hecho**

- **API** (+11 tests → **86/86**): `requote` (dry-run) y `move` (con `unitId` opcional para el diagonal: fecha+unidad en UNA acción y UN deshacer) sobre `quoteMove()` compartido — validateStay con claves `stay.*` explicadas, solape unidad-concreta (o disponibilidad de tipo si va sin asignar), re-cotización con los extras contratados (la electricidad se infiere del `price_breakdown`, que es la fuente de verdad auditable), batch + audit con from/to. `/planning` devuelve `seasons`. `adminBookingCreateSchema` gana `preferredUnitId` (el asignador lo respeta si está libre).
- **`packages/config`** (+14 tests → **39/39**): `planning.ts` puro — `barGeometry` (con `clipStart/clipEnd`), `todayOffset`, `weekendBackground` (incluye el caso domingo, banda partida), `seasonBands` (prioridad por día como el motor, bandas fundidas, tono estable), `snapDays`.
- **Dashboard**: `Planning.tsx` reescrito — arrastre horizontal con snap a celda y tooltip en vivo (fechas+noches junto al cursor, manipulación directa del DOM, cero re-render por frame), asas de resize en los bordes (ocultas en un borde recortado), flujo soltar→requote→commit directo si el total no cambia / `AlertDialog` con desglose viejo→nuevo si cambia, deshacer que es otro `move` al origen, rechazo explicado por clave (`unit_occupied`, `invalid_stay` con sus issues…), teclado ←/→ y Shift+←/→ (con guard anti-repeat), crear arrastrando (overlay de selección + `NewBookingPanel` con prop `initial`), chips de la bandeja arrastrables (con guard de click), filtros tipo/estado/búsqueda (atenúan con `.lc-dim`, Enter centra la coincidencia), línea de HOY, franja de temporada, chevrons de continuación, y la capa única de finde. `ThemeToggle` + script anti-FOUC.
- **`packages/ui`** (+27 tests → **54/54**): mapa `--lc-status-*` definitivo en `:root` y `.dark` + tokens nuevos `--lc-today`, `--lc-season-0..3`, `--lc-weekend-fill`; `theme-contrast.test.ts` parsea el CSS real (sin comentarios — un `--token:` citado en un comentario se comía la declaración siguiente), resuelve `var()` y convierte oklch→sRGB en el propio test.

**Verificación EN VIVO sin workerd** (nuevo listón para este contenedor): bundle real de `vite build` + **stub de API en memoria** (node puro, misma forma que `/api/admin`) + Playwright → **22/22 comprobaciones de gesto**: mover +7 días (commit directo), Deshacer, mover 2 días (diálogo de precio con desglose y confirmación **verificada contra los datos**), destino ocupado (409 + toast explicado + rollback verificado), resize con diálogo, crear arrastrando (alta precargada "Unidad A-08"), chip de bandeja→fila (verificado en datos), filtros (atenúa 8/deja 3; tipo deja 4 filas), Shift+→ por teclado, toggle dark (token `inhouse` dark aplicado al píxel) y persistencia del tema tras recarga. Capturas light/dark/diálogo enviadas a Andreu.

**Diferido con motivo** (BACKLOG): mover a OTRO tipo arrastrando, crear bloqueos arrastrando, gesto táctil móvil, aviso inline de reembolso en el diálogo de precio. El diferido de C7 "crear desde el plano" queda **cerrado** por C1.2.

**Lo ambiental que impide `pnpm check` 100% verde aquí** (idéntico a sesiones 32/33, ajeno a C1): (1) workerd segfaulta sobre `reset.test.ts` (no tocado) y tumba la suite de `@tenant/demo` del check completo; (2) el rate-limit de la API parpadea bajo carga paralela. **Cada suite pasa en aislamiento** (API 86/86 · config 39/39 · ui 54/54 · seed 12/12 · core 51/51 · notifications 7/7 · payments 20/20 · cli 17/17); typecheck/lint/build de los 31 targets verdes.

**Siguiente paso**: **C5** (fotos Higgsfield — fijar prompts y **confirmar la tanda con Andreu antes de gastar créditos**; las capturas del planning/plano para la landing ya se pueden hacer) o **C6** (documentación, absorbe B4, cero-riesgo). Ver `docs/SIGUIENTE-SESION.md`.

**`/check`**: verde salvo los dos fallos ambientales de arriba (40/42 tareas), ambos ajenos a C1.

### Sesión 33 — 2026-07-21 · sesión autónoma · **Frente C — C4: workflow de recepción** (ADR 0022)

**Contexto**: mandato autónomo permanente del Frente C. C4 era **el único hueco de DOMINIO** que quedaba (el resto del frente es pulido de UI). ADR primero, criterio propio, no parar hasta cerrarlo — como C7.

**La decisión de fondo (el modelo de check-in) — campo, no estado**
Las dos opciones del contrato: estado `in_house` en la máquina de estados, o campo `checked_in_at` sobre la reserva. Se eligió el **campo**, y no por estética: es la única que **no mete un bug de corrección latente**. El `status` es el ciclo de vida (`pending→confirmed→completed/…`); que un huésped esté presente es un hecho **ortogonal** (una confirmada con el titular dentro sigue confirmada). El sistema filtra por `status` donde ocupación e ingresos dependen de ello: `OCCUPIES` (plano), el filtro de `/reports`, el solape de `reassign`, el motor y el seed. Un estado `in_house` **saldría de todos** salvo que se parchee cada uno, y **olvidar uno es un doble-booking**. El campo no toca ninguno: "en casa" = `status==='confirmed' && checked_in_at && !checked_out_at`, derivado. Migración **aditiva** `0004` (dos columnas nulables, sin backfill). Detalle en ADR 0022 §1.

**Hecho**

- **Migración `0004` + `schema`**: `checked_in_at`/`checked_out_at` en `bookings` (nulables). `unitStateOn` (`packages/config`) gana `kind: 'inhouse'` (la "línea de más" que C7 dejó preparada) — **3 tests nuevos** (25/25).
- **API** (`admin.ts`, **13 tests nuevos** → 75/75): acciones `check_in` / `check_out` (completa + sella salida) / `undo_checkin`, con `TRANSITIONS` intacto; guarda `record_payment ≤ pendiente` (simetría con el reembolso); **huéspedes editables** (`POST /bookings/:id/guests`, `PATCH /guests/:id`, `DELETE /bookings/:id/guests/:guestId` — nunca al titular); **bloqueos** (`POST /blocks` con solape validado, `DELETE /blocks/:id`). `/planning` devuelve los dos timestamps.
- **Dashboard**: `--lc-status-inhouse` (verde esmeralda **oklch(0.5 0.14 152)**, AA **5.5:1** con blanco — verificado con los tokens compilados y Playwright, el primer valor L=0.648 daba 2.99:1 y se corrigió) en barra del planning, `<svg>` del plano, chips y leyenda. Ficha: sección Recepción (check-in/out/deshacer + chip "En casa"), **huéspedes editables** (`GuestsSection`), **"cobrar todo lo pendiente"** con validación en cliente. Llegadas: botón de check-in por llegada / check-out por salida. **⌘K** (`cmdk`, instalado aquí a propósito, no en C2) buscando reserva/cliente/unidad → `CommandPalette` + primitivo `Command` en el DS (**+1 test**, ui 27/27). **Rutas direccionables** `/reservas/$id` `/clientes/$id` (patrón search-param de C7). `BlockDialog` reutilizado por planning y plano.
- **Seed** (puro, determinista): check-in de demostración sobre las confirmadas presentes en el ancla `Y-07-15` (~4 de cada 5; ~1 "solo tiene reserva") → el planning y el plano enseñan la mezcla "en casa / confirmada / entra hoy" **sin un mock en el cliente**. +1 test de cobertura (seed 12/12).

**Verificación visual sin workerd** (el contenedor no levanta wrangler): render de los chips/barras/leyenda con los **tokens compilados reales** (Playwright/chromium `/opt/pw-browsers`) — el verde "en casa" queda distinto de confirmada (negro), pendiente (ámbar) y del resto; contraste AA medido sobre el pixel renderizado. Captura enviada a Andreu.

**Diferido con motivo** (BACKLOG): export del **parte de viajeros** (formato legal, pieza propia — el modelo y la captura ya están), recibo imprimible del check-out, "en casa" en la lista `/reservas`, crear reserva arrastrando (es C1.2).

**Lo ambiental que impide `pnpm check` 100% verde aquí** (ajeno a C4, como en C7): (1) workerd segfaulta sobre `reset.test.ts` (fichero no tocado; el `pnpm check` completo cae por él); (2) el rate-limit de la API parpadea bajo carga paralela. **Cada suite pasa en aislamiento** (API 75/75, config 25/25, seed 12/12, ui 27/27); typecheck/lint/build de los 17 paquetes verdes.

**Siguiente paso**: **C1 — gestos horizontales del planning** (mover/estirar fechas arrastrando, crear arrastrando, línea de "hoy", filtros dentro del planning). Ya hereda de C3 el toast con Deshacer y de C4 el mapa de color completo (incluido "en casa"). Alternativa: **C5** (fotos, cuesta créditos Higgsfield — fijar prompts y confirmar la tanda con Andreu) o **C6** (documentación, cero-riesgo). Ver `docs/SIGUIENTE-SESION.md`.

**`/check`**: verde salvo los dos fallos ambientales de arriba, ambos ajenos a C4.

### Sesión 32 — 2026-07-21 · sesión autónoma · **Frente C — C7: plano del camping** (ADR 0021)

**Contexto**: Andreu al cerrar la sesión 31: _"continua como creas conveniente pero no pares hasta conseguirlo todo cuando lo termines replantea lo siguiente en el roadmap"_ — mandato autónomo. Siguiente pieza desbloqueada: **C7**, porque C1.5/C2 ya fijaron el mapa de color (`--lc-status-*`) y C0.2 el seed denso (un plano de un camping vacío no enseña nada).

**La decisión de fondo (dónde vive la geometría) — tercera vía**
Las dos opciones abiertas eran columna en `units` (D1) o fichero de tenant. Se eligió la síntesis: **fuente de verdad en `tenants/{slug}/plano.ts`** (descriptor declarativo), **materializado en `modules.plano`** (columna JSON que YA existe → **cero migración de D1**), **servido por `GET /api/admin/map` genérico** (`apps/api` intacto, ni un dato de Cala Sereno en su bundle). Es el mismo camino que ya recorren las unidades: fichero de tenant → seed → D1 → API genérico → dashboard. No es un compromiso, es coherencia (ADR 0021 §1).

**Hecho**

- **`packages/config/src/plano.ts`** (puro, **18 tests**): `PLANO_GRID` (constantes de rejilla en **un solo sitio** → defecto 1 del original cerrado), `expandPlano` (descriptor → rectángulos + viewBox), `autoPlano` (**degradación honesta**: un camping sin plano ve un layout por zonas, no una pantalla rota), `unitStateOn` (estado por fecha: libre/ocupada/entra/sale/turnover/bloqueada, from inclusive / to exclusive, la cancelada no ocupa).
- **`tenants/demo/plano.ts`**: descriptor declarativo de Cala Sereno (mar al norte, premium/vista-mar en la playa, parcelas A/B, autocaravanas D, piscina/restaurante/recepción/súper/aseos/juegos como servicios, pinada al este). Decorado del recinto **como dato** → defecto 2 del original cerrado. Enganchado a `modules.plano` en `seed.ts`.
- **Seed test de cobertura**: `expandPlano(modules.plano)` coloca EXACTAMENTE las 83 unidades del seed (sin huérfanas ni duplicadas) — si se añade un tipo y se olvida el plano, salta.
- **`GET /api/admin/map`** genérico (lee `modules.plano ?? null`), **3 tests** (degradación null, round-trip, 401).
- **`CampingMap.tsx`**: SVG inline puro/controlado, **pan/zoom** por viewBox (rueda hacia el cursor, arrastre, botones +/−/ajustar, teclado) — lo que el original en Svelte NO traía. Tooltip `<title>` nativo, `role=button`+teclado por unidad, halo `feDropShadow`, `prefers-reduced-motion`. Colores desde los **mismos `--lc-status-*` que el planning** (nunca una segunda paleta). Ilustración `map` nueva en el DS para el estado vacío.
- **`pages/Plano.tsx`** + ruta `/plano` + entrada de nav: selector de fecha, estado en vivo de una noche (de `/planning?from=D&to=D+1`), leyenda, click en unidad ocupada → la **misma** `BookingPanel`, y **salto plano↔planning conservando unidad+fecha** por search params (validados en ambas rutas). Del plano al planning: ancla la fecha, centra la fila de la unidad, la resalta y abre su ficha si esa noche está ocupada.

**Verificación visual SIN workerd** (el contenedor de esta sesión cloud no puede levantar wrangler — workerd segfaulta): el plano se renderizó desde el **descriptor real** + los **tokens reales del DS** con Playwright/chromium (`/opt/pw-browsers`), y sale un **camping reconocible** (captura enviada a Andreu). Además, script de colisiones: **83 unidades, 0 solapes unidad-unidad, 0 solapes unidad-servicio** (una primera pasada dio 2 autocaravanas pisando Recepción → corregido subiendo la fila de `y:540` a `y:505`).

**Un bug propio cazado por el typecheck**: importar `Map` de lucide-react en `Planning.tsx` **sombreaba el `Map` nativo** → `new Map()` reventaba. Aliaseado a `MapIcon`.

**Lo ambiental que impide `pnpm check` 100% verde aquí** (y no es de C7): (1) el pool de workerd segfaulta sobre `reset.test.ts` (fichero no tocado; segfaulta incluso solo) — es el binario de workerd crasheando en este contenedor; (2) el test de rate-limit de usuarios de la API parpadea bajo carga paralela (pre-existente, sesión 24). **Cada suite pasa en aislamiento** (API 65/65, config 22/22, seed 11/11, ui 26/26); typecheck/lint/build del monorepo verdes.

**Diferido con motivo** (BACKLOG): crear reserva arrastrando sobre celda libre del plano (es C1.2), crear bloqueos desde el plano (C4.4), iconos de servicio dentro del SVG, y verificar 375px en vivo cuando haya un entorno con Worker. El plano de C7 **lee y navega**; todavía no crea.

**Siguiente paso**: **C4 — workflow real de recepción** (check-in como decisión de dominio en su ADR, huéspedes+documentos editables, "cobrar todo lo pendiente", ⌘K con `cmdk`, y las **rutas direccionables** `/reservas/$id` `/clientes/$id` que C3 dejó explícitamente para aquí). Alternativa transversal: **C1** (gestos horizontales del planning) o **C5/C6** (fotos/documentación). Ver `docs/SIGUIENTE-SESION.md`.

**`/check`**: verde salvo los dos fallos ambientales de arriba (workerd segfault + rate-limit flaky), ambos ajenos a C7.

### Sesión 31 — 2026-07-21 · Andreu presente · **Frente C — C2 + C3** (ADR 0020)

**Contexto**: continuación de la sesión 30. Objetivo declarado por Andreu: C2 y C3 **como un solo objetivo** ("el DS conectado y los estados"), porque están acoplados — sin `skeleton`/`toast`/`alert-dialog` en el DS, C3 no se puede hacer; y C2 sin C3 no se nota en pantalla. ADR primero y parada a validar; Andreu: _"me parece bien tu propuesta continua con el proyecto"_.

**Los dos bugs no eran lo que parecían — y eso cambió el ADR**

- **C-BUG-1**: los 5 `--chart-*` de `:root` eran la columna **dark** de BRAND §4. Pero el valor light correcto de `--chart-4` es **morado**, y `--chart-4` pinta las barras `pending` del planning: _arreglar el bug tal cual rompía la pantalla firma_ (y no pasaba AA con texto negro). Solución: corregir los 5 **y** desacoplar el planning a tokens semánticos `--lc-status-*`, con los valores de hoy → **el planning no cambió ni un píxel** (verificado en el navegador). C1.5 decidirá el mapa definitivo tocando 5 valores en un sitio. Además faltaba `--radius-2xl` y el bloque `.dark` **no declaraba ningún `--chart-*`**, que es justo por lo que el bug pasó desapercibido.
- **C-BUG-2**: `--color-mar` tenía **dos significados**. De sus 44 usos, **4 eran enlaces** `mailto:`/`tel:`, así que reapuntarlo a `--destructive` habría pintado los contactos en rojo. Se partió por significado: token `--link` propio para enlaces, `--destructive` para el resto.

**Hecho**

- **C2**: 11 paquetes Radix + `sonner` (**alcance acotado a propósito**: `cmdk` es C4; `calendar`/`form` merecen ADR propio; `scroll-area` descartado por el virtualizador del planning). 16 primitivos nuevos. **43 → 2 `<button>` crudos** (los 2 restantes son filas que **son** su rejilla CSS; su anillo de foco es ya `focusRing`, export del DS, así que no queda estilo copiado a mano). **Rename cerrado**: 352 usos del vocabulario de ADR 0008 → **0**, alias eliminado. `packages/ui` **estrena runner de tests: 26**, incluidos los 4 componentes de B1 que nunca tuvieron ninguno.
- **C3**: 12 `<p>Cargando…</p>` → **0** (esqueletos con la **forma** del contenido, no rectángulos). Error boundary por ruta + `notFound` con salida. Errores de query diferenciados **401/403/red/500** (antes los cuatro eran el mismo `<p>`); el QueryClient deja de reintentar 401/403. Los 6 `useState<{text,error}>` → toasts, con **Deshacer real** en la reasignación del planning. Confirmación en las **3 acciones destructivas que no la tenían** (reembolso, baja de unidad, tarifas) y el "doble click" de cancelar sustituido por `alert-dialog`. Estados vacíos con ilustración de trazo y salida. **Login** con marca (isotipo, Card, Spinner). 16 claves i18n nuevas, cero cadenas hardcodeadas.
- Migración de las 15 pantallas repartida en **5 agentes en paralelo** con ficheros disjuntos y una spec común; `i18n.ts` quedó fuera de su alcance (zona compartida) y se mezcló al final para evitar que se pisaran.

**Lo que solo apareció mirando la pantalla** (y es la lección de la sesión): **Tailwind v4 no escanea `node_modules`**, y `@logic-camp/ui` entra por symlink de pnpm. Las clases que viven **solo** en el DS (`size-14`, `translate-x-4`, `rounded-[4px]`, `min-w-[10rem]`) **no generaban CSS** — el DS funcionaba por coincidencia, porque sus clases más comunes (`h-9`, `bg-primary`, `px-4`) también estaban en el código de la app. Se detectó porque el error boundary pintaba su icono a **384px** en vez de 56. Afectaba al pulsador del `Switch`, al radio del `Checkbox`, al ancho del `DropdownMenu` y a todas las ilustraciones. Arreglado con `@source` en dashboard **y** landing. **Tests verdes y typecheck limpio no dicen nada sobre si una clase de Tailwind existe.**

**Otras dos correcciones de criterio propio durante la implementación**

- Los `--lc-status-*` se colocaron primero en el dashboard y hubo que **moverlos a `packages/ui`**: la maqueta de planning de la **landing** usaba `bg-chart-4` para la misma idea de "pendiente". Con dos consumidores (y C7 llegando), el sitio es el DS — si landing y producto enseñaran colores distintos para "pendiente", la demo desmentiría a la página de venta.
- **`@radix-ui/react-select` no se instaló** pese a estar en el ADR: para listas cortas de filtro el `<select>` nativo gana (teclado del sistema, cero JS, igual en móvil). Se expone como `SelectNative` con la piel del DS.

**Bug nuevo (C-BUG-6)**: `Planning.tsx:199` pintaba el resaltado del destino al arrastrar con `var(--lc-pino)` — variable que el dashboard **nunca define** (solo existe en los temas de tenant de la web) → declaración inválida, **resaltado invisible**. Resto de ADR 0008. Corregido a `var(--primary)`.

**Sin terminar / diferido con motivo**

- **Rutas direccionables** (`/reservas/$id`, `/clientes/$id`) → **C4**: es lo único de la lista de C3 que no es un estado, y su valor se cobra junto a la navegación de ⌘K.
- **Modo oscuro** → detrás de **C1.5** (la tercera vía del ADR §4, aprobada): su superficie más difícil son las barras del planning, y decidirlo antes de fijar ese mapa de color sería decidirlo dos veces. Mientras, el bloque `.dark` deja de estar roto.
- **375px**: el sidebar sigue ocupando media pantalla. **No es regresión** (viene de B1) y ya estaba en BACKLOG; ahora está **desbloqueado**, porque su pendiente era "añadir el primitivo Sheet" y `Sheet` ya existe.

**Verificado en el navegador** contra el Worker real, 1366px y 375px: planning **idéntico** tras corregir los tokens, "Pendiente de pago" ya en rojo y no en negro, ruta inexistente con estado y salida, `AlertDialog` de reembolso con el importe real interpolado, `Switch` operativo, **0 errores de consola**.

**Siguiente paso**: **C1 — el planning como pieza de exhibición** (ADR propio). Ya hereda de esta sesión lo que le hacía falta: `toast` con **Deshacer** (C1.4) y los `--lc-status-*` donde vivirá el mapa de color de **C1.5**. Lo que toca: arrastre **horizontal** (mover y estirar fechas), crear reserva arrastrando sobre celdas vacías, **línea de "hoy"**, indicador de continuación cuando la barra se sale del borde, y filtros dentro del planning. Ojo al rendimiento: hoy se pinta un `<div>` de fin de semana por celda y por fila con 83 unidades × 92 días — considerar virtualizar también el eje horizontal.

**`/check`**: ✅ verde (**42/42** · API 62/62 · `@tenant/demo` 16/16 · `packages/ui` 26/26 nuevos)

### Sesión 30 — 2026-07-20 · Andreu presente · **Frente C abierto** + C0: desbloqueo (ADR 0019)

**Contexto**: Andreu pide levantar el dev y revisar cómo va la parte visual, con prioridad declarada en **la interfaz en modo fake** — "que el cliente vea una interfaz bien pensada y profesional". Se audita el estado real, se abre el **Frente C (acabado profesional)** y se implementa su primera fase.

**Auditoría (medida, no opinada)**. Lo construido es honesto: 11 pantallas sin esqueletos, **0 mocks** (todo contra API real), 267 claves i18n sin huecos en 6 idiomas, funnel cerrado. El problema es que **el producto no se está luciendo**. Tres hallazgos que mandan: (1) **el planning estaba vacío** — 83 unidades, 29 reservas, nada de A-09 abajo en pleno agosto, siendo el elemento firma declarado; (2) **el DS existe y no se usa** — `packages/ui` son 101 líneas con **0 usos** de `<Button>`/`<Card>`/`<Badge>` y **41 `<button>` crudos**, sin Radix; (3) **estados en texto plano** — 0 skeletons, 0 error boundaries, 0 toasts en 11 pantallas. Más: no existe el **check-in** (ni en cliente ni en API), no se editan huéspedes/documentos (requisito legal), login sin marca, y 4 ficheros de foto referenciados que no existen.

**Hecho**

- `docs/FRENTE-C-ACABADO.md` (nuevo): contrato del frente — auditoría, **7 fases C0–C7**, checklists, 5 bugs registrados (C-BUG-1..5), dirección de arte para Higgsfield, grafo de dependencias. `ROADMAP.md` registra el Frente C; **B4 (docs) queda absorbida en C6**.
- **C7 · Plano del camping** (pedido por Andreu): registrado, no construido. Ojo — Andreu lo situó en `logic2b-norte`; **ahí no está** (verificado árbol, package.json e historial git de 3 ramas). Está en **`gestor-reservas/src/lib/components/camping-map.svelte`** (518 L, Svelte 5 + SVG puro, `mapPosition` por unidad, layout por factories). Al portar hay que corregir dos defectos del original: constantes de rejilla duplicadas y decorado del recinto cableado a ese camping. No trae pan/zoom. Decisión de fondo abierta: **dónde vive la geometría** (inclinación: `tenants/{slug}/`, no columna en D1).
- **ADR 0019 + C0 implementado** (ver commit `f0806cb`):
  - **C0.1 HMR**: el login fallaba con **403** desde `:5173` (Better Auth rechazaba el origen cruzado; `auth.ts` no declaraba `trustedOrigins`). Fail-closed en 3 capas: lista de orígenes **constante** en código, la var es solo interruptor, y se pasa por `--var` en `launch.json` para no existir en ningún `wrangler.jsonc` (que es el fichero que despliega a producción). 3 tests fijan el contrato en ambas direcciones. `apps/dashboard/README.md` nuevo documenta el flujo, que no estaba escrito en ninguna parte.
  - **C0.2 seed denso**: relleno de 10 definiciones fijas → **recorrido unidad a unidad por curva de temporada** (el invariante 1 se cumple _por construcción_: el cursor nunca retrocede). **40 → 2.032 reservas**; planning **25 → 346 a la vista**, todas las filas pobladas. Curva real: abr 12% · may 26% · jun 51% · jul 73% · **ago 86%** · sep 55% · oct 11%.

**Tres cosas aprendidas implementando** (detalle en el ADR): (1) **ocupación ≠ probabilidad de arranque** — `p=0.45` en junio daba 66% real porque cada estancia ocupa luego N noches; se invierte la fórmula para que la constante diga lo que significa. (2) **El límite de D1 es de BYTES, no de filas** — trocear a 200 filas reventó con `SQLITE_TOOBIG` (las filas de `bookings` llevan el `price_breakdown` entero); troceado por presupuesto de bytes: **8.155 → 54 sentencias**, reset nocturno atómico intacto. (3) El **invariante 1 cazó un solape real**: las reservas de caso límite se colocan antes del recorrido y el bucle las pisaba.

**Gotcha operativo**: `pnpm db:reset` hace `rm -rf .wrangler-demo` → **hay que reiniciar el Worker después** o queda apuntando a un directorio borrado y devuelve 500.

**Siguiente paso**: **C2 + C3 como un solo objetivo** ("el DS conectado y los estados") — están acoplados: sin `skeleton`/`toast`/`alert-dialog` en el DS, C3 no se puede hacer bien, y C2 sin C3 no se nota. Antes, opcionalmente, los dos bugs baratos (C-BUG-1 y C-BUG-2). **C1** (gestos del planning) después, ya con toasts para el "deshacer". **C7** cuando C1.5 haya fijado el mapa de color, o el plano y el planning no se parecerán.

**`/check`**: ✅ verde (41/41)

### Sesión 29 — 2026-07-20 · sesión cloud · Frente B B2: web de tenant sobre estructura Logic2B (ADR 0018)

**Contexto**: Andreu pregunta "¿cómo va y con qué seguimos?" → tras repasar estado, el siguiente pendiente **desbloqueado** (sin credenciales) es B2. Se redacta ADR 0018 y se pide validación; Andreu responde "aplica tu criterio y continúa todo lo que puedas" → se cierran por criterio los 4 puntos abiertos y se implementa.

**Decisiones (por criterio)**: (1) base de radios **4px** (un punto sobre el 2px de ADR 0006, firme, lejos del 10px del producto); (2) titular **sigue con Clash Display** (cambiar a Space Grotesk sería reskin); (3) firma "powered by Logic2B" → raíz `camp.logic2b.com/`; (4) alcance = **alineamiento estructural sin reskin** (la identidad mediterránea no se toca).

**Hecho**

- `docs/adr/0018-web-tenant-estructura-logic2b.md`: aceptado por criterio. Principio: converge el _esqueleto_ (ritmo, radios, anatomía de header), no la _piel_. Los dos sistemas de tokens (`--lc-*` tenant / oklch DS) NO se mezclan — la web no importa el tema del DS.
- **Radios**: `tenants/_template/theme.css` y `tenants/demo/theme.css` pasan de `2px/4px` sueltos a **una base `--lc-radius: 4px` + `--lc-radius-sm/md/lg` por `calc()`** (misma forma que la escala del DS, BRAND.md §5). `apps/web/src/styles/global.css` expone la escala completa a Tailwind. Los componentes ya usaban `rounded-(--lc-radius)`/`-lg` → el cambio se propaga solo, sin renombrar nada ni valores sueltos.
- **Ritmo de bloques**: `--spacing-section`/`--spacing-section-lg` en `@theme` → `py-section`/`md:py-section-lg`. Aplicado al ritmo canónico (Home 3 secciones + secciones finales `pb-24` de las interiores) con cambio de valor CERO (24 = 6rem) — pura tokenización, dejando intactas las intermedias `pb-16`/bandeadas `py-16` (roles deliberados).
- **Firma "powered by Logic2B"**: `apps/web/src/components/LogoMark.astro` nuevo — inyecta el mismo `<path>` del isotipo que `packages/ui` pero en Astro puro (comparte el SVG, NO el runtime React: el header/pie de la web es 100% estático, regla dura del nivel 1). Pie de `Base.astro` gana una línea discreta (isotipo `currentColor` + "powered by Logic2B") alineada con el contacto, enlazando a la landing. `footer.poweredBy` (aria/title localizado) añadido a `content/*.json` en los **6 idiomas** × `_template` **y** `demo` (12 ficheros). El texto visible "powered by Logic2B" es marca fija; se localiza solo la etiqueta accesible.
- Docs: BRAND.md §3 (convergencia de fuentes CERRADA) y §5 (escala de radios del tenant); ADR 0006 marcado "reemplazado en parte por 0018" en 2 puntos (radios + firma); `FUNCIONALIDADES.md` §2.4 (la firma del pie); `ROADMAP.md` B2 → ✅ hecho.
- **Verificado**: `pnpm check` verde (41/41 · API 59/59 · web build 217 páginas). Playwright contra el dev real (`apps/web` en :4330): home nivel 3 con el héroe Clash Display y el mostrador intactos (radio 4px sutil), pie con la firma discreta a la derecha (desktop) y apilada (móvil 375px), interiores OK. Capturas en scratchpad (no versionadas).

**Pendiente**: **B4** (documentación de producto, siguiente pieza desbloqueada del Frente B, con su ADR) · remate de B2: re-medir Lighthouse ≥95 en producción cuando haya credenciales/red (no se añaden fuentes ni JS, no debería moverse).

**`/check`**: ✅ verde (41/41)

### Sesión 28 — 2026-07-19 · Andreu presente · Frente B: marca Logic2B + landing de producto (ADR 0016)

**Contexto**: sesión de revisión con Andreu. (1) Se detectó que `main` local estaba en Fase 4 (21 commits atrás) → sincronizado. (2) La demo `camp.logic2b.com` estaba CAÍDA (web+dashboard 404, D1 sin migrar) → arreglada en vivo (deploy manual + 2 migraciones remotas). (3) Se decidió **deploy manual** (CI descartado: la sesión OAuth no puede crear API token, 403/9109) y `deploy:demo` ahora migra. (4) Andreu pidió alinear la marca con Logic2B y, sobre todo, **crear la landing de producto que faltaba** (vender Logic Camp al director de camping, distinta de la demo del camping ficticio) + documentación.

**Hecho**

- `docs/BRAND.md` + `docs/brand/logo-mark.svg`: contrato de marca Logic2B extraído del CSS real de `ui.logic2b.com` (shadcn "neutral": Inter Variable + Space Grotesk, tokens oklch light/dark, radius 10px, isotipo).
- `docs/ROADMAP.md`: **Frente B** (B0–B4) en paralelo a las 12 fases, con checklist y decisiones (landing en `/`, demo a `/demo/`, deploy manual).
- ADR 0016 (aceptado por Andreu): landing de producto + fundación DS B0-lite + routing por prefijo.
- **B0-lite**: `packages/ui` (antes vacío) con `theme.css` (tokens Logic2B), fuentes self-hosted, isotipo. Lo consumirá el dashboard en B1.
- **B3 landing** (`apps/site`, Astro, marca Logic2B): héroe, problema, producto (web+gestor), planning pieza estrella, 4 niveles (TIERS), alta en una tarde, FAQ, formulario "pedir demo". i18n es/en/ca, SEO/OG/hreflang/sitemap/robots, indexable.
- `POST /api/leads` (`apps/api/src/routes/leads.ts`): lead por email (reusa Resend), sin tabla ni tocar `enquiries`.
- **Routing** `/demo/`: `apps/web` gana `base` configurable (`BASE_PATH=/demo`); `localePath` consciente del `base` → funnel/nav/canonical/hreflang/sitemap bajo `/demo/` con un cambio; demo `noindex` bajo `/demo/`. `wrangler.jsonc` sirve el bundle compuesto (`apps/site/dist`); `deploy:demo` compone site+web(base)+dashboard → migra → deploy.
- **Verificado**: `pnpm check` verde (41/41, API 59/59); bundle compuesto servido en local (/ landing, /demo/ Cala Sereno, /admin/ dashboard, /demo/alojamientos con base); **desplegado y en vivo** (/ landing, /demo/ demo, /admin/ dashboard, `/api/leads` → `{ok:true}`, todo 200 tras refrescar caché de borde).

**`/check`**: ✅ verde (41/41)

### Sesión 27 — 2026-07-19 · BACKLOG 7.x · ADR 0015 — recordatorio de llegada

**Hecho** (continuación de la misma sesión cloud: "continua")

- `docs/adr/0015-recordatorio-de-llegada.md`: el motivo original del aplazamiento ("cuando haya API key de Resend") ya no aplica — ADR 0014 (esta misma sesión) demostró que se verifica igual de bien en estado `disabled`. Reutiliza el cron de 15 min de ADR 0007/0014 en vez de un cron diario nuevo por tenant: "diario" se cumple por deduplicación en `notifications_log`, y de hecho llega antes que un cron a hora fija (dentro de los primeros 15 min desde que la llegada pasa a ser "mañana", no hasta 24h después).
- `packages/notifications`: kind `booking_reminder` (mismo `BookingPayload`, sin desglose ni botón de gestión — recuerda, no repite la confirmación), i18n en los 6 idiomas. 1 test nuevo (7/7 en el paquete).
- `notifyArrivalReminders(db, tenantSlug, apiKey)` en `apps/api/src/notify.ts`: reservas `status:'confirmed'` con `date_from = mañana`, cualquier canal, resuelve el email del titular vía `booking_guests`/`guests` — **si no tiene email, se omite sin más**, nunca cae al buzón interno del camping como sustituto (a diferencia del aviso de `pending`, este SÍ va al huésped). Dedup igual que ADR 0014. Enganchado al mismo `scheduled()` en `apps/api/src/index.ts`.
- Corregido de paso un descuido de la sesión anterior: `booking_pending_stuck` (ADR 0014) se quedó fuera de la lista `EVENTOS` de Ajustes y no tenía toggle visible en el dashboard pese a la promesa de ADR 0010 ("control total desde Ajustes"). Esta sesión añade AMBOS kinds nuevos a `apps/dashboard/src/pages/Ajustes.tsx` + etiquetas en `i18n.ts`.
- **4 tests de integración nuevos** (`apps/api/test/notify-cron.test.ts`, ahora también cubre ADR 0015): recuerda a un huésped confirmado que llega mañana y no repite el recordatorio, NO recuerda sin email del titular, NO recuerda una llegada que no es mañana, NO recuerda una reserva `pending` aunque llegue mañana. 59/59 en la suite privada.
- **Verificado contra el Worker real** (wrangler dev + D1 local sembrada + `--test-scheduled`): reserva confirmada de prueba con llegada "mañana" (fecha real, no de demo) y email del titular → el cron generó el recordatorio (`disabled`, sin `RESEND_API_KEY` local). Capturas de `/admin/#/ajustes` (los 6 toggles, incluidos los 2 nuevos) y `/admin/#/notificaciones` (las 5 notificaciones del aviso de `pending` de la sesión anterior + el recordatorio nuevo, todas resueltas correctamente). Datos de prueba limpiados después.
- `docs/FUNCIONALIDADES.md` §8, `docs/BACKLOG.md` al día
- **`pnpm check`**: ✅ verde (38/38)

**`/check`**: ✅ verde (38/38) · API 59/59 · notifications 7/7

### Sesión 26 — 2026-07-19 · BACKLOG 8.x · ADR 0014 — aviso de reservas `pending` colgadas

**Hecho** (continuación de la misma sesión cloud: "sigue perfilando... sin parar")

- `docs/adr/0014-aviso-reservas-pending-colgadas.md`: decisión v1 = SOLO avisa (no auto-cancela ni libera inventario) — un webhook de pasarela puede llegar con minutos de retraso por causas normales; cancelar de más perdería una venta real. Cancelar sigue siendo, como hoy, una acción manual de recepción.
- `packages/notifications`: kind nuevo `booking_pending_stuck` (reutiliza `BookingPayload`, sin campos nuevos salvo el ya existente `holderName`), plantilla propia sin desglose ni botón de gestión (es un aviso interno, nunca llega al huésped), i18n en los 6 idiomas. 1 test nuevo (7/7 en el paquete).
- `apps/api/src/notify.ts`: `dispatch`/`unitTypeName` dejan de depender de un `Context` de Hono (hasta hoy todo disparo de notificación ocurría dentro de una petición HTTP) — se extrae a un objeto plano `{db, tenantSlug, apiKey}`; `notifyAfter` (rutas) lo arma desde `c` sin cambiar su firma pública, `notifyNow` (nuevo) lo recibe directo para usarse desde un cron. Cero cambio de comportamiento en los 4 disparos existentes — verificado con la suite completa antes/después.
- `notifyStuckPendingBookings(db, tenantSlug, apiKey)`: reservas `channel:'web'` `status:'pending'` de más de 2h, avisa UNA vez (comprueba `notifications_log` antes de repetir), con el nombre del titular resuelto vía `booking_guests`/`guests` (mismo join que ya usaba `/admin/bookings`). Enganchado al MISMO cron `*/15 * * * *` de purga de holds de la Fase 5 en `apps/api/src/index.ts` (genérico — corre en cualquier tenant tier 3+ con pagos, no solo la demo; nada que tocar en `tenants/_template/wrangler.jsonc`).
- **4 tests de integración nuevos** (`apps/api/test/notify-cron.test.ts`, D1 real): avisa de una `pending` vieja con el titular y sin tocar su `status`, no repite el aviso en una segunda pasada del cron, NO avisa de una reciente (<2h), NO avisa de una confirmada aunque sea vieja, NO avisa de una `pending` por teléfono (nunca nace así por pago). 55/55 en la suite privada.
- **Verificado contra el Worker real** (wrangler dev + D1 local sembrada + `--test-scheduled`): insertada a mano una reserva `pending` de prueba (el demo usa `payments:{mode:'none'}`, así que nunca genera una `pending` real por su cuenta) — al disparar el cron aparecieron avisos para ELLA Y para 4 reservas `pending` reales que ya traía el seed (fechas del ancla de temporada, ya "viejas" respecto al reloj real), cada una `status:'disabled'` (sin `RESEND_API_KEY` local) con el código resuelto en `/admin/#/notificaciones`. Segunda pasada del cron: mismas 5, cero duplicados. Datos de prueba limpiados después.
- `docs/FUNCIONALIDADES.md` §8, `docs/BACKLOG.md` al día
- **`pnpm check`**: ✅ verde (38/38)

**Decisiones**: purgar de verdad (auto-cancelar + liberar inventario) queda declarado para cuando el volumen real de reservas colgadas lo justifique, no antes — ver ADR 0014 §1 para el porqué.
**`/check`**: ✅ verde (38/38) · API 55/55 · notifications 7/7

### Sesión 25 — 2026-07-19 · Fase 10 (1/varias) · ADR 0013 — reset nocturno + conmutador de nivel + banner de demo

**Hecho** (petición de Andreu en sesión cloud: "sigue perfilando... sin parar... con tu criterio cierra temas y comitea, mergea y sube a la rama principal")

- `docs/adr/0013-modo-demo.md`: de los cinco remates de Fase 10 pendientes, se cierran los tres que no dependen de ninguna cuenta real (reset nocturno, conmutador de nivel, banner); los otros dos (acceso readonly sin registro, Web Analytics) y `ui.logic2b.com`/Storybook quedan en BACKLOG con motivo explícito — ver "qué queda fuera" del ADR.
- **Reset nocturno**: `tenants/demo/reset.ts` (`resetDemoData`: `DELETE FROM` de las 21 tablas de la app en orden hijo→padre + `INSERT` del seed regenerado con el año en curso, todo en un único `db.batch()` atómico) + `tenants/demo/worker.ts` (envuelve `@logic-camp/api` sin tocarlo — apps/api sigue siendo 100% genérico, ni una tabla de Cala Sereno entra en su bundle; solo `tenants/demo/wrangler.jsonc` apunta su `main` aquí). Segundo cron `0 3 * * *` junto al de purga de holds de la Fase 5. Doble guarda (`TENANT_SLUG==='demo'` + cron correcto) aunque el fichero nunca se referencia desde otro tenant.
  - `apps/api` gana un `exports` en su `package.json` (no lo necesitaba: nadie lo importaba como paquete hasta hoy) y re-exporta el tipo `Bindings` desde `index.ts` — cero cambios de comportamiento.
  - 16 tests nuevos en `tenants/demo` (`reset.test.ts`, D1 real vía `@cloudflare/vitest-pool-workers` — primera vez que este tenant tiene su propia D1 de test, mismo patrón que `apps/api`): siembra completa, wipe+reseed sin acumular basura de un "día de demo" simulado (notificación+auditoría+sesión de más, insertadas a mano y confirmadas borradas), determinismo, orden de borrado.
  - **Verificado contra el Worker real** (`wrangler dev --test-scheduled`): login, nota de prueba en `bkg_001` vía `PATCH`, disparo de `/cdn-cgi/handler/scheduled?cron=0+3+*+*+*` → la nota vuelve a la del seed, la sesión anterior queda invalidada (sesiones también se borran), 83 unidades siguen ahí. Cron de purga de holds verificado igual, sin cambios.
- **Conmutador de nivel 1/3**: `config.demoTierSwitch` (packages/config) + `Home.astro` genera LOS DOS héroes cuando está activo (antes solo uno, según `TIER` de build) con `data-hero-nivel`, CSS puro en `global.css` (`:root[data-nivel]`) decide cuál se ve — mismo patrón sin-FOUC que el selector de temas del ADR 0009. Verificado que la regla dura del bundle sigue intacta: un tenant real (`demoTierSwitch` nunca definido) con `TIER=1` sigue en 121 páginas, 0 islas — el flag es la única puerta.
- **Banner de demo**: `config.isDemo` + franja fija en `Base.astro`, 6 idiomas nuevos (`demo.banner/nivel/nivel1/nivel3` en los content JSON). Envuelto en el mismo contenedor `fixed` que el header (no lo solapa, lo empuja) y variable CSS `--lc-chrome-h` (3.5rem sin banner, 5.5rem con él) que el `sticky` del mostrador de Home.astro consume — verificado con capturas que no hay solape ni en el héroe ni al hacer scroll con el mostrador pegado.
- **Verificado visualmente con Playwright contra el Worker real** (1366px y 375px): banner + header + mostrador sin solape, toggle de nivel cambia de héroe en el sitio sin recarga, versión móvil legible. Capturas en `/tmp` (no versionadas).
- `docs/ROADMAP.md` (Fase 10 pasa a 🟨 parcial, checklist de remates al día), `docs/BACKLOG.md` (los tres diferidos + el refinamiento de ancla "hoy" para v2)
- **`pnpm check`**: ✅ verde (38/38, sin tareas nuevas en el pipeline — `tenants/demo` ya tenía su propio `test`)

**Decisiones**: el reset vive SOLO en `tenants/demo/` (no en `apps/api`) — mismo principio que separa `apps/web` de `tenants/{slug}/content`; el conmutador de nivel es atrezzo dentro de un build tier 3 real, no un segundo build (la demo siempre construye `TIER=3`); el ancla del reset sigue siendo mitad de temporada alta del año en curso, no "hoy" exacto — ver ADR 0013 §1 para el motivo y el v2 declarado en BACKLOG.
**`/check`**: ✅ verde (38/38) · `@tenant/demo` 16/16 nuevos (26 en total con `seed.test.ts`)

### Sesión 24 — 2026-07-19 · BACKLOG 8.x · Log de pagos en el dashboard

**Hecho** (continuación de la misma sesión cloud)

- **`GET /api/admin/payments`** (`provider`/`status` opcionales, paginado): a diferencia de `/notifications`, `payments.bookingId` es `NOT NULL` — un solo `innerJoin` con `bookings` basta, sin la resolución en dos pasos que sí hace falta cuando el destino es opcional. Sin migración: `payments.createdAt` ya existía desde el modelo de datos de la Fase 1.
- **`/admin/#/pagos`** (11ª pantalla del dashboard): dos filas de filtros (proveedor × estado), reutiliza literalmente el diccionario `pago.*` que ya existía para la ficha de reserva (Fase 8) — cero claves i18n nuevas para las etiquetas de proveedor/estado, solo las de la pantalla en sí. Importe con signo (reembolso en negativo, mismo criterio visual que la ficha).
- **1 test de integración nuevo** (`admin.test.ts`, suite en 51/51): alta manual + `record_payment`, filtra por `provider=manual&status=succeeded` y confirma que NO aparece al filtrar por `provider=stripe`. Atrapado y corregido en el propio desarrollo: las peticiones sin `cf-connecting-ip` propio compartían el "cubo" de rate-limit (`60/min`) del fichero entero de tests y tumbaban un test posterior con 429 — se les dio su propia cabecera de IP, mismo patrón que ya usaba el bloque "pagos (ADR 0011)".
- **Verificado en navegador contra el Worker real** (wrangler dev + D1 local sembrada): reserva por teléfono + cobro manual por curl → visible en la lista junto a los 24 pagos del seed, filtro "Manual" → 1 fila, 0 errores JS. D1 local restaurada después.
- `docs/FUNCIONALIDADES.md` §6.15, `docs/BACKLOG.md` al día
- **`pnpm check`**: ✅ verde (38/38)

**`/check`**: ✅ verde (38/38) · API 51/51

### Sesión 23 — 2026-07-19 · Fase 10 (adelantado) · `docs/DEMO-SCRIPT.md`

**Hecho** (continuación de la misma sesión cloud)

- `docs/DEMO-SCRIPT.md`: guion de venta de 12 minutos, minuto a minuto (mostrador → reserva completa con hold y reembolso previsto → multi-idioma+móvil → selector de temas explicado como atrezzo comercial, no feature del cliente → planning con DnD y ficha → modo lite → informes/clientes/log de notificaciones → el argumento de seguridad de D1 por camping → niveles y cierre), más variantes según interlocutor (camping pequeño escéptico / camping grande con Excel / interlocutor técnico) y qué NO enseñar todavía (cobro real, reenvío de notificaciones, reset nocturno) para no prometer de más.
- Grounded en datos reales del seed y sesiones anteriores (credenciales de demo verificadas por curl en la sesión 22, temas de ADR 0009, ancla de temporada de `tenants/demo/seed.ts`) — nada inventado.
- Adelantado de Fase 10 a propósito: es puro documento, no depende de ningún código pendiente de esa fase (reset nocturno, dashboard readonly, conmutador de nivel, Storybook) — mismo criterio que el selector de temas en la sesión 14.
- `docs/ROADMAP.md`: ítem de Fase 10 marcado hecho

**`/check`**: ✅ verde (38/38, sin cambios de código)

### Sesión 22 — 2026-07-19 · BACKLOG 7.x · Log de notificaciones en el dashboard

**Hecho** (continuación de la misma sesión cloud: "sigue perfilando... sin parar")

- **`notifications_log.created_at`**: columna nueva (nullable — como `sentAt`, las filas de antes de esta sesión no tienen fecha real que inventar), migración `0003_notifications-log-created-at.sql` generada con `drizzle-kit`. Sin ella no había forma de ordenar el log por recencia: los IDs son UUID aleatorios, no ordenables.
- **`GET /api/admin/notifications`** (`status` opcional, paginado): mismo patrón que `/guests` — dos consultas cortas para resolver el destino de la página pedida (código de reserva o contacto de solicitud), nunca un join N×M.
- **`/admin/#/notificaciones`**: pantalla nueva (10ª del dashboard), filtro por estado con chips (mismo lenguaje visual que Solicitudes), fecha, evento (i18n con `tDyn`, fallback al nombre técnico), destino, canal, intentos y el chip de estado con sus propios colores (`ntf-sent`/`ntf-queued`/`ntf-failed`/`ntf-disabled`). Nota visible en la propia pantalla explicando por qué todo aparece "desactivada" sin Resend configurado — no es un fallo, es el comportamiento correcto.
- **Deliberadamente NO hecho**: reenvío manual de fallidos (backlog original lo pedía junto a la pantalla). Sin `RESEND_API_KEY` real todo el tráfico de la demo cae en "desactivada", nunca en "fallida" — no hay ningún envío real que reenviar ni manera de verificar la función en el navegador contra el Worker real, que es como se verifica todo en este proyecto. Se queda en BACKLOG hasta que haya una cuenta Resend real con tráfico que falle de verdad.
- **1 test de integración nuevo** (`admin.test.ts`, suite en 50/50): crea una solicitud, confirma que queda en el log con el contacto resuelto y que el filtro por estado funciona.
- **Verificado en navegador contra el Worker real** (wrangler dev + D1 local sembrada): enquiry FR por curl → 2 filas visibles con el nombre del solicitante, filtro "Desactivada" → mismas 2 filas, 0 errores JS relacionados con la pantalla. Capturas en `/tmp` (no versionadas). D1 local restaurada a la seed limpia después.
- `docs/FUNCIONALIDADES.md` §6.14 y §8, `docs/BACKLOG.md` al día
- **`pnpm check`**: ✅ verde (38/38)

**`/check`**: ✅ verde (38/38) · API 50/50

### Sesión 21 — 2026-07-19 · Fase 9 (continuación) · `packages/cli` — `pnpm new:camping` (ADR 0012 §7)

**Hecho** (petición de Andreu en sesión cloud: "sigue perfilando... sin parar... con tu criterio cierra temas")

- **`packages/cli`**: implementada la parte pura de la Capa 1 del alta que ADR 0012 §5 dejó explícitamente declarada como segura de construir sin credenciales ("se puede escribir y testear su lógica de plantillas sin ejecutar un solo comando contra Cloudflare"):
  - `scaffold.ts` — `scaffoldTenant()` copia `tenants/_template` → `tenants/{slug}` sustituyendo los tokens de identidad (`__SLUG__`/`__NOMBRE_DEL_CAMPING__`/`__DOMINIO__`/`__ZONA__`/`__DIRECCION__` opcional) SOLO en `config.ts`/`seed.ts`/`wrangler.jsonc`/`package.json` — el resto (`content/*.json`, `custom/hooks.ts`, `data.ts`) se copia intacto porque su contenido es Capa 2 (interpretación del material real del cliente, no mecánica). Valida el slug (formato + reservados) y no sobrescribe un tenant existente. Genera un `README.md` de estado propio (no el instruccional de `_template`) y reporta qué `__TODO__` de contenido quedan y si falta el `database_id` real.
  - `plan.ts` — `infraPlan()` pura: los 8 pasos de infraestructura real (crear D1, migrar, sembrar, construir, desplegar, DNS) como datos, en el orden correcto que exigen sus dependencias.
  - `infra.ts` — `runInfraPlan()`, el único punto que puede tocar Cloudflare de verdad: doble candado deliberado, `--apply` en la CLI Y `LOGIC_CAMP_ALLOW_INFRA=1` en el entorno, ninguno basta solo. **No se ha invocado ni una vez contra la cuenta real** — sigue exactamente igual de bloqueado que antes de esta sesión, solo que ahora el código de la Capa 1 mecánica ya no hay que escribirlo a mano el día que haya credenciales.
  - `cli.ts` — `pnpm new:camping <slug> --name --domain [--zone] [--address] [--apply]`.
- **17 tests** contra el `_template` real del repo. Atrapado y arreglado un bug real durante el propio desarrollo: `walk()` seguía los symlinks de `node_modules` de pnpm (workspace) y arrastraba miles de ficheros del store (`5006 ficheros` en el primer smoke test) — arreglado excluyendo `node_modules`/`.turbo`/`dist`/`.wrangler`. También corregido un efecto colateral en `tenants/_template/wrangler.jsonc`: su comentario de cabecera citaba literalmente `__TODO__`/`__SLUG__` como texto documental, y la sustitución de tokens (ciega a propósito, sin parsear comentarios) lo dejaba con texto sin sentido en el tenant generado.
- **Verificado de extremo a extremo, no solo con tests**: `pnpm new:camping smoke-test --name "Camping Smoke Test" --domain smoketest.example.com --zone example.com` → 16 ficheros, plan de 8 pasos impreso, nada ejecutado sin `--apply`; `pnpm --filter @tenant/smoke-test typecheck && lint` limpios sobre el tenant generado; tenant de prueba borrado después, no queda en el repo.
- `docs/adr/0012-instancias-custom-asistente.md` §7 (addendum), `docs/ROADMAP.md` y `docs/BACKLOG.md` al día
- **`pnpm check`**: ✅ verde (38/38, todo el monorepo con el paquete nuevo)

**Sigue pendiente de Fase 9** (sin cambios de fondo, ver ADR 0012 §5): crear un tenant de prueba REAL contra la cuenta de Cloudflare y probar `runInfraPlan --apply` por primera vez — bloqueado por credenciales (`CLOUDFLARE_API_TOKEN` con los scopes de §5 del super prompt) y por mandato explícito de Andreu, no por código. Registro de extensiones (`custom/`) sigue diseñado sin conectar — se conecta cuando el primer `custom/` real lo necesite.
**Pendiente de Andreu**: token de Cloudflare + decidir el primer camping candidato + estar presente en la sesión que ejecute el primer `--apply` real
**`/check`**: ✅ verde (38/38) · cli 17/17

### Sesión 20 — 2026-07-19 · Fase 9 (parcial) · Instancias, TenantConfig, `_template` (ADR 0012)

**Hecho** (ADR 0012 aceptado por delegación explícita en sesión cloud, continuación de la sesión 19)

- **`packages/config`**: `TenantConfig` (tasa turística + política de cancelación, con `loadTenantConfig` que valida y cae a defaults seguros sin lanzar nunca) + 4 tests. Deliberadamente NO incluye `payments`/`notifications` — esos ya tienen dueño propio con más matices (ADR 0010/0011) y forzarlos aquí habría sido una abstracción de más.
- **`apps/api/src/tenant-config.ts`**: envoltorio que añade la lectura de D1. Sustituye `TAX_POLICY`/`CANCEL_POLICY`, dos constantes **idénticas y duplicadas a mano** en `public.ts` Y `admin.ts` con el comentario "de TenantConfig en Fase 9" desde la Fase 3 — ahora se leen del tenant en las 7 llamadas donde se usaban. `notify.ts`: el idioma del aviso interno de solicitudes deja de ser `'es'` fijo (usa `TenantConfig.locales[0]`). Seed demo y fixtures de test declaran `taxPolicy:'valencia'` explícitamente (antes invisible). **49/49 tests siguen en verde** tras el cambio — verificado, no asumido.
- **`tenants/_template/`**: `config.ts`, `theme.css`, `content/{6 idiomas}.json` (todas las claves de la web como `__TODO__` — un `grep` te dice qué falta), `custom/hooks.ts` (no-op documentado, sin conectar aún), `seed.ts`+`write-seed.ts`+`data.ts` (mínimo: 1 temporada, 1 tipo, 3 unidades, 1 owner con contraseña `cambia-esta-clave` — **hash scrypt real**, calculado con `better-auth/crypto` y verificado con `verifyPassword` antes de fijarlo, no inventado), `wrangler.jsonc` parametrizado, `README.md` con checklist de alta. `pnpm --filter @tenant/_template typecheck/lint` limpios; `write-seed.ts` genera un `seed.sql` válido de verdad (verificado a mano).
- **`docs/ONBOARDING.md`**: primer borrador — capas 1 (mecánica)/2 (interpretativa, `/new-camping`)/3 (dashboard, no construida), qué NO se automatiza y por qué, checklist de verificación.
- **Deliberadamente NO hecho esta sesión** (ver ADR 0012 §5-6, con motivo explícito): registro de extensiones (Fase 2, `createExtensionRegistry`, sigue sin instanciarse — no hay todavía ningún `custom/` real que lo necesite, conectar seis ficheros para que operen sobre un registro perpetuamente vacío es diseñar para lo hipotético); `packages/cli`/`pnpm new:camping`; crear de verdad un tenant de prueba — estas dos últimas implican `wrangler d1 create`/`deploy`/DNS **contra la cuenta real de Cloudflare de Logic2B**, una acción con impacto fuera del repo que esta sesión no tiene ni credenciales ni mandato explícito para ejecutar sin Andreu presente.
- Intento de descargar las 6 fotos Higgsfield pendientes de la sesión 8: localizados los 6 UUIDs completos en el historial de la cuenta (contenido verificado contra el nombre esperado), pero la descarga sigue bloqueada por la misma política de red del contenedor (403 en el CONNECT a `cloudfront.net`, confirmado en el proxy) — **mismo bloqueo que hace 11 sesiones**, no se generó nada nuevo ni se dejaron ficheros a medias. UUIDs completos anotados en BACKLOG para la próxima sesión con salida de red permitida.
- `docs/ROADMAP.md`/`BACKLOG.md`/`ONBOARDING.md` al día

**Pendiente de Andreu**: token de Cloudflare con los scopes de §5 del super prompt + estar presente (o delegar explícitamente) en la sesión que implemente `packages/cli` y ejecute la primera alta real; decidir el primer camping candidato
**`/check`**: ✅ verde (37/37) · API 49/49 · config 4/4 · `_template` typecheck/lint limpios

### Sesión 19 — 2026-07-19 · Fase 8 · Pagos (ADR 0011)

**Hecho** (ADR 0011 aceptado por delegación explícita en sesión cloud — "sigue perfilando... con tu criterio cierra temas")

- **`packages/payments`** (puro, sin D1): interfaz `PaymentProvider` (`createIntent`/`parseWebhook`/`refund`), `computeChargeAmount` (modos `none`/`deposit`/`full` — `bond`/fianza vía pasarela queda en BACKLOG, ver §2 del ADR), adaptador `stripe` (Checkout Session por `fetch`, sin SDK, verificación de webhook HMAC-SHA256 con `crypto.subtle`) y `none`. **20 tests**
- **Adaptador `redsys`**: firma HMAC SHA256 con derivación de clave por pedido en 3DES-CBC — **bloqueo técnico real**: Workers no soporta 3DES en `crypto.subtle`, así que se implementó DES/3DES puro en TypeScript (`des.ts`, tablas FIPS 46-3). Verificado contra `node:crypto` (`des-ede3-cbc`, IV cero) en **500 casos aleatorios** desde el propio test (Node sí lo soporta nativo, sirve de oráculo aunque producción no pueda usarlo). Algoritmo cruzado contra la guía oficial de migración a HMAC SHA256 y la implementación de referencia `santiperez/node-redsys-api` (investigación vía WebFetch/WebSearch en esta sesión). **Pendiente real declarado**: sin credenciales de comercio no se ha podido probar contra el sandbox de Redsys — BACKLOG antes del primer cobro real
- **`apps/api/src/payments.ts`**: orquestación (mismo patrón que `notify.ts`) — `loadPaymentsConfig`/`resolveProvider` (secrets del Worker, `payment_not_configured` explícito si faltan), `recordPaymentEvent` (webhook idempotente reutilizando `meta`, **sin tabla ni migración nueva**), `executeRefund` (llama al proveedor si hay cobro de pasarela detrás, nunca dobla el cobro) y `recordManualPayment`
- **`bookings.ts`**: solo `channel:'web'` con modo≠`none` bifurca a `status:'pending'` y crea el intent tras el batch atómico (si falla, la reserva queda `pending` sin intent — recepción la resuelve, no se auto-cancela); `phone`/`walkin` siguen confirmando al instante como siempre
- **`public.ts`**: `booking_confirmed` ya no se dispara incondicionalmente al crear — solo cuando la reserva nace `confirmed` o al confirmarla el webhook; nuevo `POST /api/payments/webhook/:provider`; cancelación web ejecuta el reembolso real (antes solo el email con la cifra prevista)
- **`admin.ts`**: dos acciones tipadas nuevas en `PATCH /bookings/:id` — `record_payment` (cobro en efectivo/tarjeta física) y `refund` (422 si supera lo pagado); cancelar desde el dashboard también ejecuta el reembolso real según la política
- **8 tests de integración de pagos** (`apps/api/test/payments.test.ts`: gating por modo, misconfiguración, intent redsys real sin red, webhook idempotente de extremo a extremo, firma inválida) + **3 nuevos en `admin.test.ts`** (record_payment auditado, refund con tope, cancelación con reembolso real) — **49 tests** en la suite privada
- **Web**: `FunnelTitular.tsx` redirige (Stripe) o auto-postea un formulario oculto (Redsys) cuando la reserva exige pago; `ReservaGestion.tsx` sondea unas pocas veces cuando vuelve con `?pago=ok` y la reserva sigue `pending` (el webhook puede tardar más que la vuelta del navegador). 6 idiomas (`reserva.pago.*`). TIER=1 re-verificado: 121 páginas, 0 islas
- Seed demo: `modules.payments: {provider:'stripe', mode:'none'}` — mismo criterio que Resend en Fase 7: activar de verdad es solo secrets + config, sin deploy
- `docs/FUNCIONALIDADES.md` §4.4 (cobro al reservar), §6.3 ampliada (registrar pago/reembolsar), §10 y §11 al día
- **`pnpm check`**: ✅ verde (34/34, todo el monorepo)

**Decisiones**: ver ADR 0011 — modos v1 `none`/`deposit`/`full` (fianza vía pasarela fuera de v1), solo canal web pasa por la pasarela, webhooks reutilizan `meta` en vez de una tabla nueva, DES/3DES propio como único camino técnico para Redsys en Workers
**Pendiente de Andreu**: cuenta Stripe (modo test primero) + comercio Redsys real (clave, FUC, terminal) para activar de verdad y verificar contra su sandbox antes del primer cobro
**`/check`**: ✅ verde (34/34) · API 49/49 · payments 20/20

### Sesión 18 — 2026-07-19 · Fase 7 · Notificaciones (ADR 0010)

**Hecho** (ADR 0010 aceptado por delegación explícita en sesión cloud)

- **`packages/notifications`** (puro, sin DB): tipos de evento, diccionarios de email en 6 idiomas (+ etiquetas de conceptos del desglose), plantillas como funciones `(payload, lang) → {subject, html, text}` con layout de marca sin webfonts, `resendSender` (POST HTTP, sin SDK) y `noopSender`. **6 tests** (idiomas, céntimos formateados, escape XSS, fallback de idioma)
- **`apps/api/notify.ts`**: único punto que toca `notifications_log` — lee `modules.notifications` del tenant, decide (on/off por evento SIN deploy), renderiza, envía y registra sent/failed/**disabled** (sin `RESEND_API_KEY` no sale nada y queda constancia). `waitUntil` tras responder; en tests se espera inline
- **4 eventos** enganchados: `enquiry_received` (al buzón del camping) + `enquiry_autoreply` (al solicitante en SU idioma) en el POST público; `booking_confirmed` (web Y alta manual, con desglose traducido y botón de gestión) ; `booking_cancelled` (gestión web con reembolso previsto Y acción del dashboard, buscando el email del titular)
- **Ajustes**: sección de notificaciones con 4 toggles + remitente + buzón interno (PATCH auditado). Seed y fixtures con config
- **38 tests API** (+2: solicitud deja 2 filas en el log con status disabled; reserva web deja `booking_confirmed` y cancelar añade `booking_cancelled`)
- **Verificado contra el Worker real**: solicitud FR por curl → 2 filas en el log; reserva CA creada y cancelada → sus 2 filas; toggles guardan y persisten tras recargar; previews HTML de los emails generadas. Seed restaurado
- Desviaciones documentadas en el ADR: plantillas HTML puras (React Email en BACKLOG), `waitUntil` en vez de Queues (BACKLOG), idioma del aviso interno fijo a es hasta TenantConfig (F9)

**Pendiente de Andreu**: verificar dominio en Resend y `wrangler secret put RESEND_API_KEY` — con eso los emails salen sin tocar código
**`/check`**: ✅ verde (33/33) · API 38/38 · notifications 6/6

### Sesión 17 — 2026-07-19 · Fase 6 (cierre) · Clientes + informes + ajustes

**Hecho**

- **API**: `GET /api/admin/guests` (búsqueda contiene en nombre/apellidos/email, paginada, con `bookingsCount` y `lastStay` agregados solo para la página — dos consultas cortas, no un join N×M) y `GET /guests/:id` (ficha + historial con `isLead`). **36 tests** (+1; ojo: `isolatedStorage` de vitest-pool-workers aísla el storage POR TEST — lo que un test crea no existe en el siguiente; el test crea su propia reserva)
- **Clientes** (`/admin/#/clientes`): buscador en servidor, tabla (nombre/contacto/documento/nº reservas/última estancia), panel de ficha con contacto clicable, RGPD con fecha e **historial de reservas → click abre la ficha operativa** (BookingPanel reemplaza el panel; cerrar vuelve al cliente)
- **Informes** (`/admin/#/informes`): presets este mes / próximo / 3 meses; tiles de titular (ocupación global calculada de la capacidad real, ingresos por llegada, cobrado, llegadas, salidas) y **ocupación por tipo como medidor de un solo tono** (pino sobre arena-suave, texto en tinta, % + noches en title/aria)
- **Ajustes** (`/admin/#/ajustes`): nombre/zona/moneda editables (PATCH auditado, gerencia), nivel e idiomas en lectura con nota de que se cambian con Logic2B
- **Nav refactorizada** a lista (9 pantallas, orden operativo: día a día primero, configuración al final), email oculto <xl para que quepa a 1366px
- **Verificado en navegador contra el Worker real como gerencia**: búsqueda "dubois"→2, ficha con salto a CS-2026-0015, informes con 8 medidores y cambio de rango, ajustes guardados y verificados; 0 errores JS. Seed restaurado
- `docs/FUNCIONALIDADES.md`: §6.11 clientes, §6.12 informes, §6.13 ajustes

**La Fase 6 queda COMPLETA**: planning ★ con DnD y ficha, llegadas, solicitudes, reservas con alta manual, clientes, informes, inventario, tarifas y ajustes — 9 pantallas operativas
**`/check`**: ✅ verde (32/32) · API 36/36

### Sesión 16 — 2026-07-19 · Fase 6 (5/5 parcial) · Reservas + alta manual + inventario + tarifas

**Hecho**

- **API**: `/catalog` incluye extras; `PATCH /api/admin/units/:id {status}` (gerencia, auditado) para baja/alta de servicio — reasignar hacia una inactiva se rechaza (test). **35 tests** (+2, uno corregido: fechas de fixture fuera de temporada daban 422)
- **Lista de reservas** (`/admin/#/reservas`): tabla con búsqueda por código (prefijo, en servidor), filtro por estado, paginación; titular/fechas/unidad/canal/estado/total/**pendiente en mar**; fila → ficha; accesible por teclado
- **Alta manual** (`NewBookingPanel`): tipo (capacidades del catálogo), fechas, ocupación con edades de niños (input CSV validado 0-17), electricidad, extras del catálogo (obligatorios marcados y forzados), canal teléfono/mostrador, titular, notas. **Cotización EN VIVO contra `POST /api/quote`** con el desglose línea a línea y los errores del motor traducidos (`stay.min_stay` con params, etc.). Crear → `POST /api/admin/bookings` con **Idempotency-Key por apertura** (doble click = una reserva); 409 = "sin disponibilidad"; éxito → se abre la ficha de la nueva
- **Inventario** (`/admin/#/inventario`): unidades por tipo, contador en servicio/fuera, click = baja/alta (tachada en mar cuando está fuera), nota clara de que no toca reservas existentes
- **Tarifas** (`/admin/#/tarifas`): tabla por temporada (orden por prioridad) × tipo con edición inline **en euros** (conversión a céntimos al guardar), estancia mínima, guardado por fila vía `PUT /rates/:id` (solo campos cambiados), invariante 3 anunciada en pantalla
- `lib/format.ts` compartido (eur/fecha/noches/conceptLabel/stayError) — BookingPanel refactorizado; fallback de extras humanizado ("Extra: limpieza", no "ext_limpieza")
- **Verificado en navegador contra el Worker real como gerencia**: 25 listadas y búsqueda a 10; alta con cotización 99,00 € → CS-2026-808228 creada y ficha abierta; error "estancia mínima 3 noches" en vivo; A-01 fuera y de vuelta a servicio; tarifa 38→21,50 guardada y restaurada; 0 errores JS. Seed restaurado
- `docs/FUNCIONALIDADES.md`: §6.4 reescrito (lista+alta), §6.9 inventario, §6.10 tarifas

**Pendiente fase**: sesión 20 — clientes con historial, informes en pantalla, ajustes del tenant
**`/check`**: ✅ verde (32/32) · API 35/35

### Sesión 15 — 2026-07-19 · Fase 6 (4/5) · Solicitudes + llegadas = modo lite

**Hecho**

- **API**: `GET /api/admin/bookings` gana `arrivalsOn`/`departuresOn` (igualdad exacta con `date_from`/`date_to` — salida = día que se libera, exclusivo) y devuelve `unitCode` + `leadName` por join (unidad y titular a la vista en las listas). `GET /bookings/:id` devuelve `unitCode`. Nuevo `GET /api/admin/catalog` (tipos+unidades, para selects y nombres). **34 tests** (+2: llegadas/salidas con titular, catálogo)
- **Bandeja de solicitudes** (`/admin/#/solicitudes`): filtros por estado con recuento (Todas·15 / Nueva·4 / …), fila expandible con mensaje completo, contacto clicable (mailto/tel), idioma y origen; **acciones de siguiente paso natural** (nueva→contactada|perdida, contactada→presupuestada|perdida, presupuestada→convertida|perdida, perdida→reabrir) sobre el PATCH existente auditado. Chips `sol-*` con los tokens
- **Llegadas/salidas del día** (`/admin/#/llegadas`): día navegable (hoy/←/→/calendario), dos columnas con titular, unidad, pax·noches, estado y **pendiente de cobro destacado** (la cifra del check-in) o "Pagada"; canceladas fuera; click en fila → **BookingPanel reutilizado**
- `BookingPanel` simplificado: ya no necesita la prop `units` (el detalle trae `unitCode`)
- **Verificado en navegador contra el Worker real**: 15 solicitudes, filtro Nueva 4→3 tras marcar contactada (mensaje `role=status`), llegadas 1-ago = 3+3 con pendientes correctos, ficha desde fila y Esc devuelve el foco; 0 errores JS. Seed restaurado después
- `docs/FUNCIONALIDADES.md` al día (§6.7 llegadas, §6.8 bandeja)

**Pendiente fase**: sesión 19 (lista de reservas + alta manual UI + inventario/tarifas), sesión 20 (clientes/informes/ajustes). El "calendario de ocupación manual" del lite queda con el planning (ya cubre la lectura)
**`/check`**: ✅ verde (32/32) · API 34/34

### Sesión 14 — 2026-07-19 · Demo comercial · Selector de temas (ADR 0009) + docs de funcionalidades

**Hecho** (petición directa de Andreu en sesión: temas para enseñar la demo en varios estilos + documentación de cara al cliente)

- **ADR 0009**: temas = bloques `[data-theme]` en el `theme.css` del tenant (los derivados `color-mix` se recalculan solos → un tema son ~6 variables, cero cambios en componentes). Demo-only tras `config.demoThemes` — sin el flag no se renderiza ni un byte. Mismas fuentes en todos (cambiar tipografía = pagar Lighthouse).
- **4 temas** dentro del territorio y fuera del antimodelo: `pinada` (actual, defecto), `mar` (posidonia/roca húmeda), `garriga` (oliva/tierra seca) y `nit` (**modo oscuro completo** con `color-scheme: dark` — la prueba de fuego del sistema de tokens). Botón "Ver disponibilidad" en nit ~5.5:1 AA.
- **Selector sin islas** en la cabecera: `<details>` nativo como el de idioma, swatches que pintan el color de acción de cada tema vía el propio bloque de tokens (`.lc-swatch[data-swatch]` comparte selector — sin duplicar hex), `aria-pressed`, script inline anti-FOUC en `<head>` + persistencia `localStorage`. OJO Astro: las expresiones dentro de `<script is:inline>` NO se evalúan — hay que usar `set:html` (el primer intento emitía el JS como cadena inerte).
- i18n en los 6 content JSONs (`nav.tema` + bloque `temas`); `TenantWebConfig.demoThemes?: string[]`; tipo `Content.temas?`.
- **`docs/FUNCIONALIDADES.md`**: guía completa de cara al cliente — niveles, web (idiomas/SEO/rendimiento/temas), mostrador, funnel con holds, autogestión, precios explicables, dashboard (planning/DnD/ficha/roles/auditoría), solicitudes, seguridad (D1 por camping), roadmap honesto y ficha técnica. Mantener al día con cada feature nueva.
- **Verificado en navegador contra el Worker real**: 4 temas cambian en vivo (fondos comprobados por computed style), persisten entre páginas (localStorage), vuelta al defecto limpia (atributo y storage fuera), `aria-pressed` marca el activo, 0 errores JS. **Regla dura re-verificada**: build TIER=1 → 121 páginas, 0 islas, selector presente (es vanilla).
- BACKLOG: `?tema=x` por URL y tematizar el dashboard (ambos Fase 10).

**Decisiones**: ver ADR 0009 (demo-only, un cliente real tiene UN tema; el selector es atrezzo comercial, no feature)
**`/check`**: ✅ verde (32/32)

### Sesión 13 — 2026-07-19 · Fase 6 (3/5) · Ficha de reserva: panel lateral con acciones tipadas

**Hecho**

- **Panel lateral no modal** (`components/BookingPanel.tsx`) sobre el planning: click en una barra (sin drag, el umbral de 4px distingue), Enter/Espacio con la barra enfocada, o click en un chip de la bandeja "sin asignar" (ahora botones). Esc cierra desde cualquier sitio (listener a nivel de documento — el foco puede salir del panel al deshabilitarse un botón) y el foco vuelve a quien la abrió
- **Contenido**: código + chip de estado (mismos tokens que las barras), estancia (fechas→noches, ocupación con edades, unidad, canal, creada), titular y acompañantes, **desglose auditable línea a línea** (conceptos i18n con `tDyn` de fallback, descuentos en negativo en pino), total/tasa/fianza/pagado/**pendiente de pago** en mar, pagos con signo, notas editables (acción `note`, botón deshabilitado si no hay cambio)
- **Acciones tipadas** contra `PATCH /api/admin/bookings/:id`: espejo cliente de TRANSITIONS del servidor (pending→confirm|cancel, confirmed→cancel|no_show|complete) — solo se ofrecen las que aplican, el servidor valida SIEMPRE. Cancelar exige **doble confirmación inline** ("¿Seguro? Sí, cancelar"). Éxito → mensaje `role=status` + invalidación de ficha y planning
- Tipos `BookingDetail`/`BookingGuest`/`BookingPayment`/`PriceLine` en el cliente; ~60 claves i18n nuevas
- **Verificado en navegador contra el Worker real** (build servido desde `/admin/` del Worker — el login via proxy Vite da 403 de origen, nota abajo): abrir ficha (868,00 € de desglose correcto), guardar nota, Esc, confirmar una pendiente (chip y barra del planning pasan a pino), cancelar con doble confirmación (la barra desaparece = inventario liberado), 0 errores JS. Seed restaurado después

**Decisiones**: panel no modal (se sigue viendo el planning al lado); en dev el dashboard se prueba servido por el Worker (mismo origen que Better Auth), el `vite dev` con proxy queda para iterar UI sin sesión
**Pendiente fase**: sesiones 18–20 (solicitudes+llegadas=lite, reservas/inventario/tarifas, clientes/informes/ajustes)
**`/check`**: ✅ verde (32/32)

### Sesión 12 — 2026-07-19 · Fase 6 (2/5, parcial) · Drag & drop de reasignación en el planning

**Hecho**

- **DnD con Pointer Events nativos** (sin librería, según ADR 0008): arrastrar una barra verticalmente a otra unidad del MISMO tipo — umbral de 4px (un click no es un drag), transform directo al DOM (cero re-render por frame), resaltado de la fila destino válida en pino, detección de fila vía las posiciones del virtualizador
- **Optimista con rollback**: `PATCH /api/admin/bookings/:id {action:'reassign'}` — la caché de Query se actualiza al soltar y se restaura si el servidor responde 409 (solape/estado); mensaje `role=status` con el resultado ("Reserva movida a A-05" / error). El servidor valida SIEMPRE — la UI nunca decide
- **Teclado**: barra enfocable, ↑/↓ reasigna a la unidad adyacente del mismo tipo (misma mutación, mismos mensajes)
- `apiPatch` en el cliente del dashboard (las acciones tipadas del admin son PATCH)
- **Verificado en navegador contra el Worker real**: drop en fila libre → movida; drop en fila con solape → 409 + rollback visual; teclado contra fila ocupada → rechazo informado; 0 errores JS

**Pendiente sesión 17**: panel lateral de ficha con acciones tipadas
**`/check`**: ✅ verde (32/32)

### Sesión 11 — 2026-07-19 · Fase 6 (1/5) · ADR 0008 + dashboard con planning v1

**Hecho** (ADR 0008 aceptado por la misma delegación)

- `docs/adr/0008-dashboard-planning.md`: SPA en `/admin/` del MISMO Worker (un deploy = web+API+dashboard, misma cookie Better Auth, cero CORS), hash history (`/admin/#/…` — sin rewrites en estático), virtualización propia de FILAS + barras absolutas, DnD con pointer events nativos (sesión 17), reparto 16–20
- `apps/dashboard` real: React 19 + Vite + **TanStack Router** (hash) + **TanStack Query** + Tailwind v4 con los tokens de la demo. Login contra Better Auth (cookie), guardia de sesión en la raíz, i18n por diccionario `t()` desde el día 1 (es)
- **Planning v1 (tape chart ★, lectura)**: filas virtualizadas con `@tanstack/react-virtual` (~40 renderizadas de 300 posibles), cabecera de meses+días sticky, columna de unidades sticky, findes sombreados, grupos por tipo, **colores por estado con los tokens** (confirmed=pino · pending=arena · no_show=mar · completed=tinta-suave), bloqueos rayados con motivo, **bandeja "sin asignar"**, zoom semana/mes/temporada (96/42/22px), navegación ←/hoy/→ + fecha, refresco de cortesía cada 60 s, tooltips con código·estado·fechas·pax
- Deploy cableado: `deploy:demo` construye web + dashboard y copia `dist` a `web/dist/admin/`; CI `deploy-demo.yml` igual
- **Verificado en navegador contra el Worker real**: login recepción → planning de agosto (83 unidades · 13 reservas a la vista · CS-2026-0006 en la bandeja sin asignar), zoom temporada, scroll a la última fila fluido, 0 errores JS

**Pendiente fase**: sesiones 17–20 (DnD+ficha, solicitudes+llegadas=modo lite, reservas+inventario+tarifas, clientes+informes+ajustes)
**`/check`**: ✅ verde (32/32)

### Sesión 10 — 2026-07-19 · Fase 5 · Flujo de reserva completo (ADR 0007)

**Hecho** (ADR 0007 aceptado por delegación explícita de Andreu en sesión)

- **Motor**: `searchAvailability` acepta `holds` + `now` (expiración perezosa) — 4 tests nuevos ANTES de implementar (51 total). Tipo `Hold` en el dominio
- **Modelo**: tabla `inventory_holds` (migración 0002 con drizzle-kit), hold por TIPO, índices por tipo/fechas y por expiración
- **API**: `POST/DELETE /api/holds` (valida estancia + disponibilidad, TTL 15 min), availability y bookings cuentan holds vivos, `createBooking` consume el hold EN el mismo batch que crea la reserva (y rechaza hold caducado/ajeno con 409), `GET /bookings/:code` devuelve previsión de cancelación, `POST /bookings/:code/cancel` (libera inventario, auditado) y `/modify` (re-cotización COMPLETA en servidor, 409 si no cabe, desglose nuevo auditable). Primer **Cron Trigger** (purga de holds cada 15 min). 7 tests de integración nuevos (32 total)
- **Web**: funnel `/reservar` (resultados=mostrador con botón Reservar) → `/reservar/{tipo}` (extras + desglose EN VIVO del servidor, errores i18n del motor) → `/reservar/{tipo}/titular` (hold al entrar con contador mm:ss, liberación con `pagehide` si se abandona) → confirmación en `/reserva?code&email&nueva=1` (resguardo imprimible con @media print). Gestión completa: ver, **cancelar con el reembolso a la vista**, **cambiar fechas** re-cotizado. 6 idiomas (bloques `reservar`/`reserva` en los JSONs), noindex en páginas de proceso, Idempotency-Key = hold
- **Regla dura re-verificada**: TIER=1 → 121 páginas, **0 islas** en todo el sitio, `/reservar` y `/reserva` degradan a redirección sin JS; los 8×2 pasos por tipo ni se generan
- **E2E Playwright** (`apps/web/e2e`, `pnpm e2e`, webServer wrangler): camino feliz (buscar→extras→hold→confirmar→**aparece en /api/admin/planning** ✅ criterio de fase→modificar→cancelar) + 3 infelices: tipo agotado entre pasos, hold caducado al confirmar (reintento revalida sin perder el formulario), estancia inválida en alta (mín. 7 noches + sábado). **4/4 verdes** contra el Worker real
- Verificado también a mano en navegador: reserva CS-2026-785715 creada, modificada (nuevo total del servidor) y cancelada, 0 errores JS

**Decisiones**: hold por tipo (no por unidad — la asignación sigue libre para el planning); gestión en `/reserva?code=…` (query, no segmento — salida estática); sin hold también se puede confirmar (el hold protege la UX, el servidor siempre revalida)
**Pendiente**: pago real (Fase 8: la pantalla confirma directo con `payments:'none'`); emails (Fase 7, hooks anotados)
**`/check`**: ✅ verde (32/32) · E2E 4/4

### Sesión 9 — 2026-07-19 · Fase 4 (remates) · Lighthouse ≥95 local + ADR 0007 propuesto

**Hecho**

- **Lighthouse contra el Worker local** (assets reales, red y CPU emuladas): home desktop **100/100/100/100**, detalle glamping móvil **100**, tarifas desktop **100**, home móvil **96/100/100/100**. Objetivo ≥95 cumplido en todo lo auditado
- Los dos arreglos que lo consiguieron: **fuentes subseteadas** con fonttools a latín+latín-ext+signos (Inter 352→101 KB, Clash 29→23 KB — el render del héroe pasaba 2,1 s esperando ancho de banda) y **imágenes**: héroe webp calidad 60, separador de lona 287→~60 KB como `<img loading="lazy">`
- `.claude/launch.json`: el server `api` crea `apps/web/dist` si falta (wrangler dev con assets exige que exista el directorio)
- **`docs/adr/0007-flujo-de-reserva.md` PROPUESTO** (Fase 5): funnel en apps/web con isla por paso, estado en URL, `inventory_holds` por tipo con expiración perezosa + primer Cron Trigger, gestión código+email (ver/cancelar/modificar re-cotizado), E2E Playwright feliz + 3 infelices, reparto sesiones 13–15. **Sin código de Fase 5 — esperando validación**

**`/check`**: ✅ verde (32/32)

### Sesión 8 — 2026-07-19 · Fase 4 (2/3) · Web completa, 6 idiomas, Workers Assets

**Hecho**

- **Páginas restantes**: alojamientos (lista por familias) + detalle por tipo (galería, ficha técnica y precios por temporada **desde los mismos datos que la D1** vía `tenants/demo/data.ts` → `generateSeed`), instalaciones, entorno, tarifas (tabla tipos×temporadas + suplementos + extras + condiciones desde `rate_plans`), contacto (datos+horario+cómo llegar+formulario), blog cableado (`content/blog/{slug}.{lang}.md`, fallback al idioma por defecto) y 404 propia con foto y CTA
- **6 idiomas completos** (es/ca/en/fr/de/nl): content JSONs ampliados (~380 claves/idioma), selector de idioma accesible (`<details>` nativo, sin JS), menú móvil, rutas `/{lang}/…` con wrappers `[lang]` (109 páginas estáticas)
- **API**: `GET /api/availability` devuelve `opensOn` (próxima apertura real de `seasons_calendar`) cuando las fechas caen en cerrado + 2 tests (25 total)
- **Mostrador**: skeleton de carga, mensaje "cerrado — abrimos el {fecha}" con la fecha REAL de la API formateada por locale, deep-link `/?from=&to=&adults=&children=` bidireccional (lee la URL al cargar y la escribe al buscar)
- **Workers Assets**: `tenants/demo/wrangler.jsonc` sirve `apps/web/dist` en `camp.logic2b.com/*` con `run_worker_first: ["/api/*"]` y 404 propia; `deploy:demo` construye la web antes; CI `deploy-demo.yml` actualizado. Un deploy = web + API
- **SEO técnico**: sitemap.xml (todas las rutas × idiomas con alternates hreflang), robots.txt por tenant, favicon SVG + apple-touch-icon con la marca, og.jpg 1200×630 derivada del héroe (sharp), JSON-LD CampingPitch/Accommodation+Offer por tipo
- **Imágenes responsive**: astro:assets con `Picture` AVIF/WebP (fallback webp forzado — el default png pesaba 5MB), preload del héroe con imagesrcset, sharp como dep del workspace
- Seed: `seasons/unit_types/rate_plans/extras` tipados (`SeedSeason`…) — la web los consume sin `any`
- **Verificado en navegador (worker real, 1366+375)**: búsqueda → 8 resultados con precios de servidor, deep-link reproducible, cerrado con "15 de marzo", 0 errores JS, sitemap/robots/404 servidos por el Worker. TIER=1: 0 islas referenciadas en las 109 páginas
- 6 fotos nuevas generadas en Higgsfield (interiores bungalow/glamping, piscina, restaurante, premium mar, autocaravana)

**Pendiente fase (sesión 3)**

- Redeploy de la demo con credenciales (esta sesión cloud no las tiene — el deploy NO se ha hecho): `pnpm --filter @logic-camp/api deploy:demo`
- Descargar fotos Higgsfield (egress del contenedor bloqueaba la CDN) → `tenants/demo/content/media/`: `detalle-bungalow-interior`←job `f5ac46f2`, `detalle-glamping-interior`←`9bfdfd4b`, `instalacion-piscina`←`9a9eeb15`, `instalacion-restaurante`←`1cbee642`, `tipo-premium`←`32b5b013`, `tipo-autocaravana`←`2ba71b99` (WebP ~2000px, q78; la web ya las engancha por nombre de fichero sin tocar código)
- Lighthouse ≥95 contra producción (aquí verificado solo funcionalmente)

**Decisiones**: datos de web en build desde el generador del seed (`data.ts`) — misma fuente de verdad que la D1, sin drift de tarifas; fallback de blog al idioma por defecto con aviso; `fallbackFormat="webp"` obligatorio en `Picture`
**`/check`**: ✅ verde (32/32)

### Sesión 7 — 2026-07-18 · Fase 4 (1/3) · Diseño + home con mostrador

**Hecho**

- ADR 0006 (plan de diseño validado por Andreu): paleta 5 hex (tinta/hueso/pino/arena/mar), Clash Display + Inter self-host, wireframes de los dos héroes, elemento firma "el mostrador"
- 6 assets fotográficos con Higgsfield (Nano Banana Pro 4K héroes 21:9, Soul 2.0 tarjetas/textura), optimizados a WebP (86MB→2.2MB) en `tenants/demo/content/media/`
- `apps/web` real: Astro 5 + islas React + Tailwind v4. Alias `@tenant` resuelto en build (TENANT=slug), tokens en `tenants/demo/theme.css` (@theme de Tailwind mapea variables → cambiar el fichero re-viste todo)
- `packages/config`: `TenantWebConfig` + `bookingMode()` (nivel→comportamiento)
- Home completa ES+EN: héroe nivel 3 con **Mostrador** (fechas+huéspedes → GET /api/availability real, resultados en página, sticky) · héroe nivel 1 (anochecer + promesa + ticker) · tarjetas de tipos · separador de lona (firma secundaria) · entorno · formulario→POST /api/enquiries (vanilla JS, todos los niveles)
- **Regla dura verificada**: TIER=1 build → 0 islas, 0 JS referenciado en el HTML (wrapper HeroMostrador.astro con import dinámico)
- SEO: hreflang es/en/x-default, canonical, OG, JSON-LD Campground+LodgingBusiness
- Verificado en navegador: mostrador devuelve 8 tipos con precios del servidor (114/138/177€…), enquiry aparece en la D1 local
- `.claude/launch.json`: servidores `api` (wrangler dev + D1 local sembrada) y `web` (astro dev, proxy /api→8787)

**Decisiones**: @astrojs/react v4 (la v6 es de Astro 6/vite8 y rompe el dev server); tenant en build via alias, no runtime (Fase 9 revisará)
**Pendiente fase**: páginas restantes (alojamientos+detalle, instalaciones, entorno, tarifas, contacto, blog), 4 idiomas más (ca/fr/de/nl), sitemap, Lighthouse ≥95, deploy de la web a camp.logic2b.com (ahora solo /api/* pasa por el Worker)
**`/check`**: ✅ verde (32/32)

### Sesión 6 — 2026-07-18 · Fase 3 (2/2) · Better Auth + API privada

**Hecho**

- `docs/adr/0005-auth-privada.md`
- Better Auth 1.6 sobre la MISMA tabla `users` (adaptador Drizzle, D1 del binding): migración `0001_auth.sql` (users ampliada + sessions/accounts/verifications), instancia por petición en `auth.ts`, registro público desactivado, provisión en servidor (`provisionUser`), `requireRole` con jerarquía readonly<reception<manager<owner
- `routes/admin.ts` (`/api/admin`): `/planning` (el SELECT del tape chart), bookings (lista/detalle/alta manual phone|walkin/acciones tipadas confirm|cancel|no_show|complete|reassign|note), enquiries, rates, `/reports` (ocupación/ingresos/llegadas), `/settings`, users (solo owner). Toda mutación escribe `audit_log`
- `bookings.ts`: creación de reserva extraída y compartida público↔manual (mismo motor, precio en servidor)
- 13 tests de integración nuevos (24 total): 401/403, registro cerrado, fuga cruzada de sesión A↛B, **invariante 3** (cambiar tarifa no toca reserva confirmada) e **invariante 4** (cancelar libera inventario), reasignación con solape 409
- Seed demo: 4 usuarios (uno por rol) con credencial `calasereno` (hash scrypt constante ⇒ determinista); `db:reset && db:seed` verificado con 0001
- Remoto: migración 0001 aplicada, D1 re-sembrada, `AUTH_SECRET` puesto, Worker redesplegado

**Decisiones**: una sola tabla de usuario (nada de espejo), sesiones revocables en D1 (no JWT), jerarquía de roles como Record — ver ADR 0005. Nota técnica: better-auth arrastra `kysely` y duplicaba los tipos de drizzle-orm; se unifica con `kysely` como devDep de `packages/db`.
**Pendiente**: nada de la fase. `AUTH_SECRET` en CI/despliegues nuevos.
**`/check`**: ✅ verde (32/32)

### Sesión 5 — 2026-07-17 · Fase 3 (1/2) · API pública

**Hecho**

- `docs/adr/0004-api-publica.md`
- `apps/api` reestructurada: `schemas.ts` (Zod), `tenant.ts` (contexto por binding + rate limit 60/min), `data.ts` (filas→dominio), `routes/public.ts`, `app.ts`, `client.ts` (RPC `hono/client`)
- Endpoints: `GET /api/availability` (precio en servidor, closed≠unavailable), `POST /api/quote` (desglose + extras obligatorios + tasa), `POST /api/enquiries` (guarda SIEMPRE), `POST /api/bookings` (revalida, re-cotiza en servidor, asigna unidad, batch atómico, **Idempotency-Key** vía tabla `meta`), `GET /api/bookings/:code?email=`
- Tests de integración con `@cloudflare/vitest-pool-workers@0.9.14` (¡la 0.18 requiere Vitest 4 — no subir!): D1 real ×2 con migraciones reales, 11 tests incl. back-to-back (to exclusive), idempotencia, 409 agotado y **fuga cruzada A↛B** (invariante 5)
- Worker demo redesplegado con la API nueva

**Decisiones**: aislamiento por binding = un Worker por tenant (el middleware no elige DB, la trae el entorno). Config test propia `test/wrangler.test.jsonc` con DB y DB_B.
**Pendiente fase**: sesión 2 — Better Auth + rutas privadas.
**`/check`**: ✅ verde (32/32)

### Sesión 4 — 2026-07-17 · Fase 2 ★ · Motor de disponibilidad y precios

**Hecho**

- `docs/adr/0003-motor-core.md`
- `packages/core` puro (sin I/O, sin Drizzle): `searchAvailability` (disponibilidad por tipo con reasignación implícita — comprobación por noche, exacta para intervalos), `quote` (desglose por tramos de temporada, sum(lines)==total por construcción), `applyRules` (stackables + mejor exclusiva, descuentos como líneas negativas), `validateStay` (acumula todos los errores, códigos i18n), `assignUnit` (menos huecos, con alternativas), `calculateTouristTax` (política como dato: valencia/catalunya/none), `calculateCancellationRefund` (tramos), `createExtensionRegistry` (los 11 hooks de §3)
- Tests ANTES que implementación: `edge-cases.test.ts` con los 7 casos que rompen productos genéricos + `engine.test.ts` por módulo. **47 tests verdes**
- Distinción cerrado ≠ sin disponibilidad en todo el motor (`closed` / `ClosedError`)

**Decisiones**: tipos de dominio propios del core (no los de Drizzle) — ADR 0003.
**`/check`**: ✅ verde (32/32)

### Sesión 3 — 2026-07-17 · Fase 1 · Modelo de datos

**Hecho**

- `docs/adr/0002-modelo-de-datos.md`
- `packages/db/src/schema.ts`: las 16 tablas de §4 tipadas (JSON tipado: Occupancy, PriceBreakdown…), índices de disponibilidad, migración única `0000_modelo-datos.sql`
- Seed demo Cala Sereno en `tenants/demo/seed.ts`: generador puro y determinista (fecha ancla → listo para reset nocturno Fase 10). 83 unidades (60 parcelas/4 tipos, 18 bungalow-mobil/3 tipos, 5 glamping), 3 temporadas solapadas por prioridad, 12 extras, 3 reglas, 40 reservas con casos límite (cruce de temporadas, 28 noches, grupo 8 pax con niño exento de tasa, cancelada, no-show, sin asignar), 15 solicitudes en 5 estados, bloqueos (mantenimiento + longstay)
- 10 tests Vitest del seed, incluyendo invariantes: sin solapes por unidad, `sum(payments)==paid_cents`, desglose==total, precio por tramos
- `pnpm db:reset` / `pnpm db:seed` (D1 local en `.wrangler-demo/`); `tenants/*` añadido al workspace
- D1 **remota** migrada y sembrada; Worker demo desplegado (falta solo el DNS)

**Decisiones**: ver ADR 0002 (IDs texto, tenant_id documental, payments con signo, enquiries tabla propia).
**`/check`**: ✅ verde (31/31)

### Sesión 2 — 2026-07-17 · Fase 0 · Scaffold del monorepo

**Hecho**

- `docs/adr/0001-scaffold.md` (aceptado con el OK de fase de Andreu)
- Monorepo pnpm + Turborepo: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, ESLint 9 flat + Prettier, `.gitignore`, git init (rama `main`)
- `apps/api`: Hono + `GET /health` + tests Vitest + wrangler.jsonc dev + build dry-run
- `apps/web` (Astro 5) y `apps/dashboard` (React 19 + Vite) placeholders
- `packages/db`: Drizzle + schema `meta` + migración 0000; `packages/tsconfig`; 8 paquetes reservados compilando
- `tenants/_template/` documentado + `tenants/demo/` (wrangler.jsonc con ruta camp.logic2b.com/api/*)
- CI: `check.yml` y `deploy-demo.yml` (skip explícito hasta tener secrets)

**Sin terminar**: deploy real (sin `wrangler login` ni D1 creada), remoto GitHub.
**Decisiones**: `wrangler.jsonc` en vez de `.toml` (ADR 0001); lint de `.astro` diferido a Fase 4.
**`/check`**: ✅ verde (28/28)

### Sesión 1 — 2026-07-17 · Fundación documental (§1 BRIEF)

### Sesión 1 — 2026-07-17 · Fundación documental (§1 BRIEF)

**Hecho**

- `CLAUDE.md` (arquitectura, niveles, convenciones, visual, qué NO hacer)
- `docs/TIERS.md`, `docs/ROADMAP.md`, `docs/DOMAIN.md`, `docs/BACKLOG.md`
- `PROGRESS.md` (este fichero)
- `.claude/commands/`: `session-close.md`, `new-camping.md`, `check.md`, `adr.md`

**Sin hacer (deliberadamente)**: código, scaffold, repo git.

**Abierto**: ver dudas listadas al final de la sesión (prerrequisitos §5, git remoto, etc.)

---

<!-- Plantilla de entrada:
### Sesión N — YYYY-MM-DD · Fase X · <objetivo>
**Hecho**: …
**Sin terminar**: …
**Decisiones**: … (con enlace al ADR si aplica)
**Siguiente paso**: …
**`/check`**: verde/rojo
-->
