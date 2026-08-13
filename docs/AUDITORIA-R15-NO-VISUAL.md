# Auditoría R15 no visual

> **Cierre final, 2026-08-13 · sesión 145.** El corte histórico de abajo queda
> conservado como evidencia de la sesión 133. Desde entonces el portfolio llegó
> a 12/12, `pnpm check` pasó 71/71 y el QA canónico recorrió 27 superficies / 54
> vistas a 375/1366 px. El bundle actual verifica 16.186 enlaces en 522 HTML y
> cinco formatos/MIME. R15 queda cerrado localmente; el candidato no se
> desplegó y los gates externos continúan clasificados en R12–R14.

> Corte: 2026-08-11 · sesión 133. Alcance autorizado: producto común,
> contratos, build y documentación; se excluyen temas, fotografía y activos.

## Resultado

No queda trabajo funcional local no visual oculto entre R0 y R14. Los hallazgos
ejecutables del corte eran la autogeneración obsoleta de las colecciones Astro
`docs` y `legal`, tres scripts Astro implícitamente inline y dos usos del tipo
React `FormEvent` ya deprecado. Las colecciones quedan declaradas, los scripts
marcan su ejecución explícita y los formularios usan `SubmitEvent`; los builds
conservan rutas y artefactos.

R15 no puede declararse cerrado de forma global mientras continúen el portfolio
visual autorizado, la QA visual final y los gates de cliente, proveedor,
producción y Camp Motor. Esos restos no autorizan inventar datos, credenciales o
una decisión comercial.

## Checkpoints R0–R14

| Corte | Evidencia local                                                                                                                        | Resto y clasificación                                                                                                                                                |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R0–R8 | Checkpoints cerrados en la ruta continua; suites, configuración, API, motor, gestor, sitio y fábrica común tienen guardas ejecutables. | Ningún resto local no visual detectado.                                                                                                                              |
| R9    | Las seis demos D5-V están integradas y el contrato común tiene barridos de fábrica/portfolio.                                          | D6-V y su incorporación al catálogo son **portfolio/temas**, fuera de este encargo. `tenants/vinyes/` es trabajo concurrente y no se toca.                           |
| R10   | Recorridos canónicos, SEO/noindex, responsive y E2E constan acreditados.                                                               | Recorrer cada demo nueva acompaña a R9; la QA visual de las que estén en curso queda fuera de este corte.                                                            |
| R11   | Aislamiento, auth, RGPD, copias y dossier de activación tienen contratos y pruebas locales.                                            | Restauración remota, alerta externa y primer cliente son **destino/credencial/producción**.                                                                          |
| R12   | Adaptadores `none`, contratos de pagos/correo/Hospedajes y fronteras sin tracker/OTA/IA están probados localmente.                     | Resend, Stripe/Redsys, Analytics, observabilidad, OTA, fiscal/SES e IA son **proveedor, cuenta o decisión de cliente**.                                              |
| R13   | Scaffold, D1 local, seed, owner, rollback, activación, coste automático y readiness son reproducibles en temporales.                   | 1.989 bloqueos de build requieren **material real aprobado**; 4 gates de publicación requieren **infraestructura/autorización**. El coste humano sigue `not_proven`. |
| R14   | El veto y su disparador están explícitos.                                                                                              | Camp Motor es **gate comercial**: no existe decisión/pago que lo abra.                                                                                               |

## Pase por las ocho lentes

| Lente        | Resultado del corte                                                                                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Arquitectura | No se crea lógica por tenant ni se toca el core. Las dos declaraciones Astro pertenecen a sus aplicaciones y sustituyen comportamiento implícito por contrato explícito.   |
| Fullstack    | No hay esquema o tipo cruzado pendiente. BACKLOG, PROGRESS, ruta continua y siguiente sesión distinguen trabajo local de gates.                                            |
| Backend      | Suites y contratos locales siguen acreditados; no se simula proveedor, restauración remota ni datos de cliente.                                                            |
| Frontend     | No cambia ninguna interacción. Los builds de sitio/web y el bundle compuesto terminan correctamente.                                                                       |
| Producto     | No se abre Camp Motor ni una integración sin señal. El readiness rojo conserva la verdad comercial del candidato.                                                          |
| UX           | Sin cambios de flujo o mensajes; no aparece un muro funcional nuevo en la evidencia revisada.                                                                              |
| UI/visual    | Fuera del alcance. Se preservan `tenants/vinyes/` y los avisos de fuentes procedentes de CSS de tenant sin intervenirlos.                                                  |
| SEO          | Sitio 79 páginas, web base 235 páginas y guardia del bundle con 13.539 enlaces internos en 417 HTML. Canonical, hreflang y recursos continúan bajo sus guardas existentes. |

## Evidencia ejecutada

- `pnpm --filter @logic-camp/api bundle:demo`: verde; 13.539 enlaces internos en
  417 HTML. Fronteras R12: 128 fuentes, 26 manifiestos y 34 artefactos en el
  último escenario del bundle.
- Presupuesto M6 del gestor: entrada normal 173,13 kB gzip; Pinadamar 178,09 kB;
  Serralta 177,97 kB; Mar de Fondo 183,39 kB. Planning y Plano permanecen bajo
  demanda.
- `pnpm --filter @logic-camp/site build`: 79 páginas, contrato comercial y
  cabeceras verificados, sin autogeneración de colecciones.
- `pnpm --filter @logic-camp/web build`: 235 páginas y frontera R12 verde, sin
  autogeneración de colecciones.
- `pnpm --filter @logic-camp/web typecheck`: 64 ficheros, cero errores, warnings
  o hints después de explicitar scripts inline y migrar a `SubmitEvent`.
- Primer `pnpm check`: 54/63 tareas verdes antes de que Turbo cancelase las
  restantes porque el `content/es.json` del tenant concurrente `vinyes` estaba
  temporalmente mal formado. No es un fallo del diff auditado y no se modifica
  desde este corte. Debe repetirse cuando ese trabajo quede estable.

## Restos clasificados

1. **Portfolio/temas:** D6-V, catálogo y QA visual por demo. Responsable: frente
   visual autorizado. Disparador: entrega vertical aprobada de cada identidad.
2. **Material/decisión de cliente:** identidad legal, textos, inventario,
   tarifas, media y aceptación. Disparador: material real y validación del
   cliente; nunca datos inventados.
3. **Credencial/proveedor:** correo, pagos, Analytics/observabilidad, OTA,
   fiscal/SES e IA. Disparador: módulo contratado, cuenta/sandbox y criterios de
   aceptación del runbook.
4. **Producción:** D1/bindings, auth, DNS, deploy, smoke y restauración remota.
   Disparador: destino, credenciales y autorización explícita.
5. **Gate comercial:** Camp Motor. Disparador: decisión/pago explícito.

Con esas fronteras, no existe otro cambio local no visual de alto valor que sea
honesto ejecutar de forma autónoma en este corte.
