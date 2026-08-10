# Ruta de desarrollo continuo

> Hilo conductor genérico para ejecutar Logic2B Campings con un objetivo
> duradero de Codex. No depende de horas, días ni número de sesiones. Incluye el
> producto común, el portfolio de temas y demos, su activación real y las
> expansiones posteriores, cada cosa cuando sus dependencias estén listas.

## 0. Objetivo duradero

Continuar el desarrollo de Logic2B Campings hasta dejar agotado el trabajo seguro
y verificable que permiten los gates abiertos, siguiendo esta ruta desde el
primer checkpoint incompleto.

El objetivo termina cuando:

1. todos los checkpoints ejecutables de esta ruta están cerrados con evidencia;
2. `pnpm check` y los verificadores específicos quedan verdes, o cada incidencia
   ambiental está revalidada de forma aislada y documentada;
3. landing, documentación, portfolio, demos, web canónica y gestor pasan QA a
   1366 y 375 px;
4. no quedan defectos P0/P1 conocidos que puedan resolverse localmente;
5. ROADMAP, BACKLOG, PROGRESS y SIGUIENTE describen el mismo estado real;
6. cada paso condicionado por cliente, credenciales, proveedor, decisión
   comercial o autorización de producción está ejecutado si su gate se abrió, o
   preparado y clasificado con el disparador exacto si todavía no se abrió.

No significa “terminar el SaaS para siempre”. Significa alcanzar de forma
verificable el límite correcto de cada etapa sin adelantar una dependencia ni
confundir preparación local con activación real.

## 1. Alcance

### Incluido

- motor, dominio, configuración y contratos compartidos;
- API y backend mínimo que sostiene los recorridos visibles;
- D1 local, seed, fixtures y adaptadores demo compartidos;
- autenticación, permisos, aislamiento, errores e invariantes;
- dashboard y sus flujos de recepción;
- `packages/ui` y coherencia con Logic2B UI;
- landing de venta, precios y documentación de producto;
- fábrica de temas, identidades, contenidos, fotografía y derivados;
- portfolio actual y nuevas demos D5-V/D6-V;
- web y demos canónicas;
- transportes, pagos, observabilidad, analítica, canales, fiscal/SES e IA;
- aprovisionamiento, onboarding y despliegue de demo o cliente;
- Camp Motor y nuevas capacidades cuando se abra su gate de producto;
- accesibilidad, móvil, rendimiento, SEO y calidad visual;
- tests, builds, bundle compuesto, documentación y runbooks;
- preparación y publicación de entregas cuando exista autorización.

### Alcance condicionado, no excluido

Ningún frente del producto queda fuera de esta ruta a priori. Algunos se
ejecutan solo cuando se cumple su gate:

- **Temas y demos:** después de estabilizar la fábrica común. Cada demo responde
  a un ICP, objeción, aprendizaje o hipótesis comercial explícita; nunca crea un
  fork, backend o D1 por marca durante la fase de escaparate.
- **Fotografía:** después de aprobar contrato visual, inventario y prompts. Se
  genera por lotes pequeños, se revisa entre lotes y solo entran finales locales
  con manifiesto, licencia/procedencia y derivados presupuestados.
- **D5-V/D6-V:** D5-V amplía de tres a seis demos; D6-V, de seis a doce. Cada ola
  empieza cuando ROADMAP registre su evidencia o una decisión explícita de
  Andreu y se ejecuta demo a demo, no como doce proyectos simultáneos.
- **Proveedores reales:** primero contrato, adaptador, tests, estados de fallo y
  runbook; después sandbox y finalmente cuenta real cuando existan credenciales
  y autoridad. Nunca se inventan secretos ni se declara verificado lo simulado.
- **Deploy:** el candidato se construye y verifica siempre; publicar demo o
  producción requiere comprobar destino, diff, migraciones, backup/rollback y
  autorización correspondiente.
- **Cliente real:** el dry-run y el onboarding se preparan antes. D1, dominio,
  usuarios, email, pagos o `new:camping --apply` solo se ejecutan sobre un cliente
  y destino identificados y autorizados.
- **Camp Motor:** permanece declarado hasta que exista el disparador comercial
  de CLAUDE.md; al abrirse, se construye sobre el motor y gestor comunes, sin
  bifurcar el producto.
- **Nuevas capacidades:** entran cuando un defecto, usuario, recorrido, métrica o
  decisión de producto concreta justifica su coste y define cómo verificarla.

## 2. Fuentes de verdad y orden de lectura

Al comenzar y después de cada compaction:

1. `CLAUDE.md` — contrato no negociable.
2. Este documento — orden de ejecución del objetivo duradero.
3. `PROGRESS.md` — hechos y verificaciones recientes.
4. `docs/SIGUIENTE-SESION.md` — entrega inmediata pendiente.
5. `docs/BACKLOG.md` — defectos y deuda clasificada.
6. `docs/ROADMAP.md` — estado de frentes y decisiones.
7. ADRs de la zona que se vaya a tocar.

Cuando haya contradicción:

- gana una decisión posterior y explícita de Andreu;
- después, `CLAUDE.md`;
- durante un `/goal`, esta ruta decide el orden y
  `SIGUIENTE-SESION.md` aporta contexto, no detiene el objetivo tras una sola
  entrega;
- PROGRESS aporta evidencia, pero una entrada histórica no gobierna una decisión
  posterior;
- un checkbox antiguo no gana a código, test y QA actuales.

## 3. Bucle autónomo

Codex repite este ciclo sin esperar una nueva instrucción:

1. Sincronizar y comprobar el árbol antes de escribir. Preservar cambios ajenos.
2. Localizar el primer checkpoint incompleto de esta ruta.
3. Elegir dentro de él un objetivo pequeño con resultado observable.
4. Reproducir o medir antes de corregir.
5. Escribir primero el test cuando el comportamiento sea automatizable.
6. Implementar la porción mínima que cierre la causa.
7. Verificar en aislamiento y después en el nivel proporcional de integración.
8. Si es visible, comprobarlo en navegador real.
9. Actualizar evidencia y estado, no solo la lista de tareas.
10. Hacer un commit coherente cuando el objetivo quede verde.
11. Continuar con el siguiente objetivo sin detenerse a pedir prioridades.

Un checkpoint grande se divide en entregas verticales. “Una sesión = un
objetivo” se conserva; `/goal` encadena muchas sesiones y objetivos dentro de una
sola ruta.

## 4. Reglas de prioridad dentro de cada checkpoint

1. Pérdida de datos, fuga entre tenants, permiso incorrecto o promesa comercial
   falsa.
2. Recorrido visible roto o acción principal que no se puede completar.
3. Defecto móvil, accesible o de estado que afecta al uso real.
4. Backend mínimo necesario para que el recorrido sea fiable.
5. Inconsistencia de Logic2B UI, de la landing o de una identidad de demo.
6. Siguiente entrega de temas/demos cuyo gate ya está abierto.
7. Activación o integración real que ya dispone de sus prerequisitos.
8. Rendimiento, SEO y mantenibilidad con una medida concreta.
9. Documentación que evita repetir errores o activar producción de forma insegura.
10. Limpieza técnica únicamente cuando elimina una mentira, un riesgo o una
    fricción medible.

No gana prioridad una tarea por ser profunda, elegante o antigua. Debe mejorar
un recorrido, un contrato o una condición de entrega.

## 5. Contratos transversales

### Backend mínimo, muy bien hecho

- Todo input externo y configuración no confiable se valida con Zod.
- No hay casts de `unknown` que simulen validación.
- Dinero en céntimos enteros y desglose auditable.
- Fechas `YYYY-MM-DD`, UTC y salida exclusiva.
- Seed y fixtures deterministas; cero mocks aleatorios en componentes.
- Producción y demo están separadas por config y fallan de forma segura.
- Un transporte real sin configurar no confirma silenciosamente una entrega.
- Mutaciones con permiso, idempotencia y transacción cuando corresponda.
- Un tenant nunca toca la D1 o la sesión de otro.
- Errores 5xx sin stack, secretos ni PII; referencia de correlación en cliente y
  detalle solo en servidor.
- Rutas nuevas nacen cerradas al rol demo.
- No se construye un backend por tema o recorrido de escaparate.

### Logic2B UI y dirección visual

- Gestor y controles: DS neutro de Logic2B UI, Inter/Space Grotesk, tokens oklch,
  radio base de 10 px, componentes compartidos y modo oscuro real.
- Landing, precios y documentación comercial: dirección botánica de la home de
  venta —papel, verde tinta, serif editorial, tarjetas grandes, radio de 14 px y
  CTAs de al menos 48 px— sin duplicar componentes.
- Web pública: identidad del camping; estructura común y crédito Logic2B discreto.
- Se reutiliza la gramática de interacción, no se aplica la misma piel a todas
  las superficies.
- Foco visible, contraste AA, movimiento reducido y uso real a 1366/375.

### Definition of Done de cualquier objetivo

- causa o necesidad demostrada;
- implementación acotada y sin duplicar core o backend por tema/cliente;
- tests dirigidos verdes;
- integración proporcional verde;
- QA visual si cambia una pantalla;
- i18n sin hardcodes;
- documentación actualizada cuando cambia un contrato;
- ninguna regresión conocida escondida como “pendiente menor”.

## 6. Checkpoints de la ruta

La ruta es secuencial por dependencia. Dentro de un checkpoint, Codex puede
reordenar tareas si una verificación descubre un riesgo mayor.

### R0 · Consolidar el punto de partida

- [x] Clasificar y preservar el árbol sucio heredado de la sesión 104.
- [x] Verificar el vídeo de gestos, guía, assets y ADR 0040.
- [x] Ejecutar los checks específicos y confirmar el estado global documentado.
- [x] Integrar la entrega en un commit coherente.
- [x] Prepararla para publicación sin desplegar salvo autorización explícita.
- [x] Confirmar que la rama local no está detrás de origin antes de avanzar.

**Cierra cuando:** hay una base limpia, reproducible y sin mezclar la entrega 104
con trabajo posterior.

### R1 · Reconciliar las fuentes de verdad

- [x] Eliminar contradicciones activas entre CLAUDE, ROADMAP, BACKLOG, PROGRESS y
      SIGUIENTE sin reescribir la historia.
- [x] Corregir estados obsoletos: fases cerradas con checkboxes abiertos,
      duplicados y referencias a decisiones ya sustituidas.
- [x] Actualizar marca y arquitectura donde aún describen isotipo, Storybook,
      rutas o prioridades antiguas como estado actual.
- [x] Clasificar cada pendiente en: local ahora, cliente real, credencial,
      decisión comercial o descartado.
- [x] Reconciliar el cambio de alcance: temas, demos, integraciones y activación
      real pertenecen a esta ruta, respetando sus gates.

**Cierra cuando:** una sesión nueva puede elegir el siguiente trabajo sin inferir
cuál documento dice la verdad.

### R2 · Fijar una línea base de calidad reproducible

- [x] Ejecutar suites por paquete y registrar duraciones/fallos reales.
- [x] Ejecutar `pnpm check` sin confundir timeouts ambientales con aserciones.
- [x] Fijar el procedimiento de revalidación aislada de Workers/D1.
- [x] Revisar presupuestos existentes de bundle, imágenes y entradas dinámicas.
- [x] Confirmar build tier 1 sin motor, tier 2 sin cobro y tier 3 con motor.
- [x] Confirmar el verificador de enlaces del bundle compuesto.

**Cierra cuando:** cualquier cambio posterior tiene una referencia verde y un
comando claro que detecta regresión.

### R3 · Endurecer configuración y fronteras demo/producción

- [x] Auditar `TenantWebConfig`, `TenantConfig`, locales, tier, módulos y
      transportes.
- [x] Sustituir casts/defaults inseguros por validación explícita donde exista
      riesgo demostrado.
- [x] Hacer que una config inválida falle en build/test con un mensaje útil.
- [x] Revisar `demoThemes`, `enquiryTransport`, `demo-session`, reset y flags de
      demo.
- [x] Garantizar que un tenant normal no expone rutas, sesión, reset o acciones
      de demo.
- [x] Mantener los adaptadores demo tipados, deterministas, reseteables, sin red
      y sin PII real.

**Cierra cuando:** no se puede activar accidentalmente una capacidad demo o un
tier incorrecto mediante un valor mal tipado o un default silencioso.

### R4 · Backend mínimo y contratos de API

- [x] Auditar endpoints públicos, admin, auth y leads por validación, permisos,
      idempotencia, rate limit y errores.
- [x] Revisar el formulario comercial: demo/noop/entrega real no pueden compartir
      un “éxito” ambiguo.
- [x] Verificar las cinco invariantes de dominio y sus transacciones.
- [x] Reforzar el inventario de rutas y el fail-closed del rol demo.
- [x] Confirmar aislamiento A↛B de datos y sesión.
- [x] Revisar logs, correlación, PII, `payments.raw` y notas libres; corregir lo
      que pueda resolverse sin credenciales ni política nueva.
- [x] Revisar cron, holds, avisos, reset y reintentos solo hasta el límite que la
      demo usa hoy.
- [x] Dejar identificados los contratos de proveedores que pasarán a R12, sin
      activarlos prematuramente desde el backend base.

**Cierra cuando:** los recorridos actuales descansan sobre contratos pequeños,
tipados, seguros y probados; los proveedores quedan listos para la activación
ordenada de R12.

### R5 · Motor, seed y datos creíbles

- [x] Ejecutar y revisar motor, disponibilidad, pricing, asignación, cancelación
      y tasa turística.
- [x] Comprobar que datos históricos, fechas, pagos, estados y solicitudes no se
      contradicen.
- [x] Atacar solo defectos del seed que se vean en recorridos actuales.
- [x] Mantener determinismo entre reset, tests, capturas y demo.
- [x] Verificar volumen firma: planning/plano y operación del día.
- [x] No perfeccionar nacionalidades, nombres o casos que nadie ve sin evidencia
      nueva.

**Cierra cuando:** los datos cuentan una historia coherente en web, API y gestor
y cada garantía relevante tiene test.

### R6 · Gestor y Logic2B UI

- [x] Auditar shell, portada y navegación por rol.
- [x] Resolver affordances que conducen a muros de permisos o explicarlas antes.
- [x] Crear/terminar la guía contextual de la portada si sigue faltando.
- [x] Revisar estados loading/empty/error/success y acciones destructivas.
- [x] Continuar adopción semántica de `packages/ui` donde reduzca mentira o
      duplicación; no migrar markup por simetría.
- [x] Revisar los nombres de clases camping que puentean tokens Logic2B y decidir
      cambios por lotes verificables.
- [x] Confirmar planning, plano, ficha, llegadas, solicitudes y búsqueda en
      escritorio y móvil.
- [x] Mantener rendimiento M6 y carga dinámica de pantallas pesadas.

**Cierra cuando:** los roles alcanzan solo lo que entienden y pueden usar, el
gestor habla Logic2B UI sin perder densidad y no quedan P0/P1 visibles.

### R7 · Landing de venta y documentación de producto

- [x] Auditar la home completa por jerarquía, promesa, CTAs, estados comerciales
      y recorrido web↔gestor.
- [x] Mantener la estética botánica como sistema del sitio, no como CSS aislado
      por sección.
- [x] Revisar coherencia de componentes con Logic2B UI sin neutralizar la voz
      comercial.
- [x] Corregir documentación de marca aún obsoleta.
- [x] Actualizar URLs antiguas de `DEMO-SCRIPT.md` y enlaces reales.
- [x] Añadir `BreadcrumbList` a las guías si sigue pendiente y validar JSON-LD.
- [x] Completar la ayuda de pantallas actuales; no traducir toda la prosa sin
      demanda real.
- [x] Verificar formularios, FAQ, precios, guías, vídeos, pistas y alternativas
      textuales.

**Cierra cuando:** un gerente entiende el producto, puede probarlo y resolver
dudas sin encontrar promesas, enlaces o estilos contradictorios.

### R8 · Fábrica común de temas, contenido y media

- [x] Auditar el contrato de variación `config.ts` + `theme.css` + `content/` +
      `custom/` y eliminar conocimiento de marca filtrado al core.
- [x] Confirmar que `_template`, CLI/dry-run, esquemas y builds permiten crear una
      identidad nueva sin copiar aplicaciones ni adaptar el backend.
- [x] Definir el brief mínimo por tema: ICP, objeción, nivel comercial, historia,
      tono, paleta, tipografía, pantallas firma, inventario y criterio de éxito.
- [x] Consolidar tokens semánticos y puntos de extensión para web y, cuando
      aporte valor, tematización controlada del dashboard.
- [x] Verificar selector y catálogo de temas, persistencia, URL, fallback,
      contraste, claro/oscuro, reduced motion y ausencia de fuga a producción.
- [x] Consolidar el pipeline de fotografía: prompt/manifiesto, revisión por lotes,
      conversión, responsive, OG, licencia/procedencia y presupuestos.
- [x] Preparar una receta repetible que construya, pruebe, capture y documente un
      tema sin crear infraestructura por marca.

**Cierra cuando:** una nueva identidad puede pasar de brief aprobado a build y QA
sin modificar el core, improvisar activos ni duplicar infraestructura.

### R9 · Portfolio, nuevos temas y olas D5-V/D6-V

- [ ] Auditar las tres demos actuales y el catálogo Montaña/Familiar/Parcela para
      localizar ICP, objeciones y recorridos todavía no cubiertos.
- [ ] Registrar en ROADMAP la evidencia o decisión que abre cada nueva demo y el
      criterio por el que no duplica una existente.
- [ ] Elegir primero entre conceptos ya creados cuando cubran el gap; crear una
      dirección nueva solo si ninguno lo cubre.
- [ ] Ejecutar cada demo como una entrega vertical: contrato visual → contenido →
      fotografía → config/tema → recorrido web/gestor → capturas → ficha → QA.
- [ ] Completar D5-V de tres a seis demos antes de abrir D6-V.
- [ ] Completar D6-V de seis a doce solo con evidencia propia por demo.
- [ ] Mantener un único core, un único sistema de componentes y adaptadores demo
      compartidos; ninguna marca gana rama, backend o servicio propio.
- [ ] Incorporar cada demo al catálogo, comparador, enlaces, campañas de muestra,
      SEO/noindex y bundle compuesto con copy comercial honesto.

**Cierra cuando:** el portfolio llega a la ola cuyo gate esté abierto y cada demo
cubre un caso distinto, es vendible y no multiplica el coste técnico por marca.

### R10 · Web y demos canónicas

- [ ] Recorrer web pública, disponibilidad, detalle, funnel, confirmación y
      gestión de reserva.
- [ ] Recorrer gestor demo, reset, planning, plano y operación del día.
- [ ] Verificar etiquetas honestas de pago, automatización e inteligencia.
- [ ] Confirmar `noindex` de superficies ficticias y SEO de superficies de venta.
- [ ] Revisar 1366 y 375, teclado, foco, reduced motion, contraste y desborde.
- [ ] Revisar imágenes, fuentes, favicon/OG, vídeos y MIME.
- [ ] Ejecutar E2E relevantes contra el bundle real.
- [ ] Recorrer también cada tema/demo nueva y compararla con su contrato visual.

**Cierra cuando:** la herramienta de venta actual se puede recorrer de principio
a fin sin explicación técnica, botones muertos ni errores visibles.

### R11 · Seguridad y preparación del primer cliente

- [ ] Revisar aislamiento, auth, roles, cookies, headers y superficies públicas.
- [ ] Revisar RGPD, retención, anonimización, consentimiento y exports existentes.
- [ ] Revisar backups/runbook y distinguir prueba local de restauración real.
- [ ] Revisar observabilidad mínima y documentar el punto ciego externo.
- [ ] Actualizar el dossier de activación con lo que realmente falta para Inicio,
      Gestión, pagos, comunicaciones, fiscal/SES, OTA e IA.
- [ ] Convertir cualquier riesgo local corregible en test o runbook.
- [ ] No ejecutar infra, secretos, restauración remota o proveedor sin autoridad.

**Cierra cuando:** el primer cliente no obligaría a descubrir de nuevo qué hay
que activar, qué riesgo existe y cómo se aceptará cada módulo.

### R12 · Integraciones y proveedores reales

- [ ] Inventariar por tier qué integración aporta un recorrido actual y qué gate
      necesita: email, pagos, analítica, errores, canales, fiscal/SES e IA.
- [ ] Terminar contratos y adaptadores comunes con Zod, idempotencia, timeouts,
      reintentos, correlación, redacción de PII y estados de degradación.
- [ ] Verificar Resend/React Email y dominios remitentes en sandbox o cuenta real
      cuando haya credenciales autorizadas.
- [ ] Verificar Stripe y Redsys en sandbox antes de cualquier cobro; incluir
      webhooks, firma, duplicados, cancelación, conciliación y reintento.
- [ ] Activar Analytics y Sentry con consentimiento, muestreo, filtros de PII,
      alertas útiles y prueba de recepción cuando haya cuentas autorizadas.
- [ ] Implementar y verificar canales/OTA, fiscal/SES.Hospedajes e IA por módulos
      separados solo cuando su contrato de producto y proveedor esté aprobado.
- [ ] Mantener `none`/demo explícito y operativo cuando un proveedor no esté
      configurado; ninguna simulación se presenta como entrega real.
- [ ] Actualizar runbooks, variables, rotación, ownership, coste y procedimiento
      de desactivación de cada proveedor activado.

**Cierra cuando:** toda integración cuyo gate esté abierto funciona extremo a
extremo y las demás tienen contrato, prueba local y activación reproducible sin
mentir sobre su estado.

### R13 · Aprovisionamiento, onboarding y publicación

- [ ] Validar plantilla, CLI, esquema de configuración y dry-run de alta.
- [ ] Probar migraciones, seed inicial, usuarios, dominio, bindings, secrets,
      correo, pagos, backup, restauración y rollback en entorno no productivo.
- [ ] Confirmar que dar de alta un camping no modifica `apps/` ni `packages/` y
      cabe en el coste operativo definido por CLAUDE.md.
- [ ] Construir el candidato completo, ejecutar verificador de enlaces, tests,
      E2E y QA 1366/375 antes de cualquier publicación.
- [ ] Publicar la demo cuando haya cambios verificados y autorización; registrar
      versión, migraciones, bundle, smoke test y rollback.
- [ ] Ejecutar `new:camping --apply` y el deploy de cliente únicamente con slug,
      dominio, tier, destino, credenciales y autorización explícitos.
- [ ] Completar smoke test y aceptación posdeploy sin reseed, borrar datos ni
      repetir una publicación que no tenga cambios.

**Cierra cuando:** el carril de alta y publicación está ensayado y cada destino
autorizado puede entregarse de forma repetible, auditable y recuperable.

### R14 · Camp Motor y expansiones justificadas

- [ ] Comprobar antes de abrir este checkpoint el pago/decisión que levanta el
      veto de Camp Motor en CLAUDE.md; si no existe, dejarlo preparado y seguir.
- [ ] Definir el contrato de integración con web ajena, límites de ownership,
      disponibilidad, checkout, callbacks, autenticación y soporte.
- [ ] Reutilizar motor, API, pagos y dashboard; añadir solo los puntos de
      extensión que la integración externa demuestre necesarios.
- [ ] Añadir nuevas capacidades surgidas de uso, métricas o decisiones aprobadas
      mediante ADR, criterios de aceptación y test de regresión.
- [ ] Rechazar forks por vertical: hoteles y casas rurales siguen siendo clones
      futuros separados, no tenants de Logic2B Campings.
- [ ] Validar seguridad, rendimiento, observabilidad, documentación comercial y
      operación antes de ofrecer la expansión.

**Cierra cuando:** las expansiones con gate abierto están integradas sin romper
el modelo común; las que aún no tienen señal conservan diseño y disparador claros.

### R15 · Integración y cierre del objetivo

- [ ] Revisar diff completo por las ocho lentes de `docs/EQUIPO.md`.
- [ ] Ejecutar suites aisladas, `pnpm check` y bundle compuesto.
- [ ] Ejecutar QA final 1366/375 de landing, docs, web y gestor.
- [ ] Confirmar cero enlaces/recursos rotos y presupuestos dentro de límites.
- [ ] Actualizar ROADMAP, BACKLOG, PROGRESS y SIGUIENTE con evidencia final.
- [ ] Clasificar cada resto condicionado con su disparador real.
- [ ] Dejar commits coherentes y comparar con origin.
- [ ] Preparar candidato de deploy; publicar únicamente con autorización expresa.

**Cierra cuando:** se cumplen las seis condiciones del §0 y no queda trabajo
local de alto valor escondido detrás de un documento desactualizado.

## 7. Validación mínima por tipo de cambio

| Cambio               | Validación obligatoria                                                |
| -------------------- | --------------------------------------------------------------------- |
| Motor/dominio        | Unit tests y casos límite del paquete.                                |
| DB/API               | Integración D1 local, permisos, error y aislamiento relevante.        |
| Config/tier          | Casos válidos/inválidos y builds tier 1/2/3.                          |
| Dashboard            | Tests dirigidos, build, navegador 1366/375, claro/oscuro y teclado.   |
| Landing/docs         | Astro check/build, links, navegador 1366/375 y SEO/JSON-LD si cambia. |
| Tema/media           | Contrato visual, manifiesto, pipeline, presupuesto y QA 1366/375.     |
| Demo/portfolio       | Build tenant, E2E, capturas, comparador y regla de nivel.             |
| Proveedor real       | Contrato, sandbox, fallos, PII, runbook y smoke test autorizado.      |
| Deploy/alta          | Dry-run, migración, backup/rollback, smoke y evidencia de versión.    |
| Bundle               | Composición completa y verificador de enlaces.                        |
| Contrato transversal | `pnpm check` antes de cerrar la entrega.                              |

## 8. Tratamiento de bloqueos

- Si una tarea necesita credenciales o producción, documentar y continuar con la
  siguiente tarea local del mismo checkpoint.
- Si necesita una decisión comercial, formular opciones y continuar con otra
  tarea reversible.
- Si una prueba global falla por el runtime conocido, reejecutar aislado y
  registrar ambos resultados.
- Si una aserción real falla, no avanzar hasta entender la causa.
- Si aparece trabajo de temas/demos antes de R8, registrarlo en su checkpoint y
  terminar primero la dependencia activa; desde R8 forma parte normal del goal.
- Si un gate de D5-V/D6-V, proveedor, cliente o Camp Motor no está abierto,
  completar la preparación local verificable, registrar el disparador y seguir.
- Si el árbol contiene cambios ajenos, trabajar alrededor; no resetear ni
  sobrescribir.
- Si el checkpoint queda agotado salvo bloqueos externos, marcar lo ejecutable
  completo y pasar al siguiente.

## 9. Registro de progreso del objetivo

Después de cada entrega:

- marcar únicamente las casillas realmente verificadas;
- añadir en PROGRESS objetivo, decisión, implementación y evidencia;
- actualizar SIGUIENTE con el primer objetivo incompleto de esta ruta;
- mover/cerrar el ítem exacto de BACKLOG;
- actualizar ROADMAP solo si cambia el estado de una fase/frente;
- registrar pruebas con resultado, no “tests hechos”;
- dejar claro qué no se desplegó.

El reporte compacto de `/goal` debe indicar:

1. checkpoint actual;
2. objetivo cerrado más reciente;
3. validación ejecutada;
4. siguiente objetivo;
5. bloqueo real, si existe.

## 10. Prompt de arranque

El comando corto que usará Andreu es:

```text
/goal sigue desarrollando este proyecto todo lo que puedas
```

Dentro de este repositorio se interpreta como: leer esta ruta, ejecutar desde el
primer checkpoint incompleto y continuar hasta cumplir la condición de cierre del
§0, incluyendo temas, demos y activaciones en el checkpoint que les corresponde,
sin saltarse los gates ni los límites de autoridad del §1.
