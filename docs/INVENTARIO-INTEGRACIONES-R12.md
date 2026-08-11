# Inventario de integraciones y proveedores R12

> Corte local del 2026-08-10. «Implementado» significa código y prueba local;
> nunca acredita una cuenta, sandbox, entrega o entorno oficial. El dossier de
> activación sigue siendo la autoridad para producción.

## 1. Recorridos por oferta y tier técnico

| Oferta / carril                        | Recorrido actual que puede tocar una integración                         | Estado sin proveedor                                                                                                  | Gate externo                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Inicio** / build tier 1              | consulta de huésped y lead comercial Logic2B → correo                    | las demos `demo`/`demo-session` no hacen red; el backend productivo distingue `disabled`/`failed` y no afirma entrega | cuenta Resend, dominio/remitente, buzón, `RESEND_API_KEY`, privacidad y prueba recibida |
| **Gestión** / base tier 3              | solicitud/reserva → avisos; cobro manual; revisión del parte de viajeros | `notifications_log=disabled`, pagos `none`/manual y borrador SES sin red mantienen operación local                    | solo los módulos contratados: correo, Stripe/Redsys o SES                               |
| **Automatiza** / tier 3 + capacidades  | recordatorio y aviso de reserva pendiente sobre el mismo correo          | eventos desactivables por config; sin Queue ni reenvío programado                                                     | correo real y, si el volumen lo justifica, Queue aprobada; IA sigue siendo prototipo    |
| **Inteligente** / tier 3 + capacidades | informes y escenarios supervisados de OTA/IA                             | fixtures locales etiquetados; no existe conector ni llamada de modelo                                                 | contrato de producto, proveedor, autoridad, datos, coste, permisos y evaluación         |

El tier técnico 2 conserva solicitudes y dashboard lite para instalaciones
anteriores. Camp Motor/tier 4 continúa vetado hasta que exista un cliente que lo
pague.

## 2. Matriz de contratos

Leyenda: **sí** probado localmente; **parcial** existe pero falta parte del
contrato; **gate** requiere tercero; **no** no existe y no se simula como real.

| Integración                          | Zod/frontera                                                   | Idempotencia                                              | Timeout     | Reintento              | Correlación + PII                                    | Degradación                                     | Dueño, coste y apagado | Estado/gate                                                           |
| ------------------------------------ | -------------------------------------------------------------- | --------------------------------------------------------- | ----------- | ---------------------- | ---------------------------------------------------- | ----------------------------------------------- | ---------------------- | --------------------------------------------------------------------- |
| **Resend: notificaciones y leads**   | sí: input tipado y éxito externo validado con Zod              | sí: clave por entrega; misma en ambos intentos            | 8 s/intento | uno, solo transitorios | sí: ref, intentos y códigos cerrados sin body remoto | sí: `disabled` y eventos on/off                 | runbook + dossier      | **primer corte local R12 cerrado**; sin cuenta autorizada             |
| **Stripe**                           | sí local: webhook y respuestas salientes Zod                   | sí: D1 + clave estable en cada POST Stripe                | 8 s/intento | uno, solo seguro       | códigos cerrados sin body/error remoto               | sí: `provider:none` y fallo cerrado sin secrets | runbook + dossier      | **tercer corte local R12 cerrado**; sandbox sigue como gate           |
| **Redsys**                           | sí local: callback y refund con Zod+firma                      | webhook/pago D1; refund no reintenta sin garantía oficial | 8 s/refund  | no por ambigüedad      | códigos cerrados; payload no persistido              | sí: `provider:none`                             | runbook + dossier      | **quinto corte local R12 cerrado**; sandbox sigue como gate           |
| **SES.Hospedajes**                   | fail-closed: config/datos locales; sin frontera HTTP inventada | no: semántica oficial gated                               | no aplica   | no                     | cero red, acuse o log de envío fingido               | sí: revisión + borrador local + Sede oficial    | runbook + dossier      | **sexto corte local R12 cerrado**; contrato autenticado gate          |
| **Analytics comercial**              | sí; GTM `GTM-TVDWZ9LC` solo en `apps/site`                     | n/a                                                       | carga async | n/a                    | eventos cerrados sin PII; banner y retirada          | sí: rechazo impide cargar Google                | Logic2B + runbook      | **activado por ADR 0045**; webs tenant y gestor conservan ausencia    |
| **Errores: logs / Sentry / Logpush** | log propio cerrado; sin SDK/transporte                         | n/a                                                       | n/a         | n/a                    | sí: referencia y redacción local                     | stdout del Worker                               | runbook R12            | **cierre local**; destino independiente y prueba de alerta son gate   |
| **Fiscal / VeriFactu**               | no; informes separan valor reservado y cobro, nunca factura    | no                                                        | no          | no                     | no hay serie, firma, factura ni envío                | sistema fiscal vigente sigue siendo autoridad   | pendiente de asesoría  | no construir sin obligación, proveedor y contrato aprobados           |
| **OTA / channel manager**            | no; Mar de Fondo solo usa `web`/`phone`                        | no                                                        | no          | no                     | no hay intercambio                                   | fixture etiquetado                              | runbook R12            | **cierre local**; proveedor, mapeos y autoridad son gate              |
| **IA / automatización**              | fixtures tipados; `manual_external`/`execution:none`           | no                                                        | no          | no                     | no se envía PII ni existe acción de modelo           | modo manual y confirmación humana               | runbook R12            | **cierre local**; casos, proveedor, evals, coste y retención son gate |

## 3. Orden de cierre local

1. **Correo:** timeout, reintento idempotente, respuesta Zod, códigos sin cuerpo
   remoto, referencia e intentos exactos. Es el único proveedor que atraviesa
   Inicio y reservas ya implementadas.
2. **Pagos:** Stripe y Redsys cierran ya sus fronteras HTTP locales. La versión
   de firma Redsys sigue siendo un gate de terminal/sandbox y nunca se infiere.
3. **SES:** auditoría pública cerrada. La guía v. 29.08.2025 exige autenticación
   para descargar la documentación técnica; se retiró el adaptador inferido y
   las credenciales solas ya no activan red. El XML se rotula borrador, la Sede
   oficial es el recorrido manual y `RUNBOOK-SES-HOSPEDAJES.md` fija el gate.
4. **Analytics/errores/fiscal/OTA/IA:** no crear adaptador hasta que el módulo y
   el proveedor estén aprobados. Mantener ausencia, prototipo o modo manual como
   estados explícitos.

## 4. Evidencia que falta y no puede inferirse localmente

- entrega, rebote, spam, DNS y dominio remitente de Resend;
- Checkout/webhook/refund y conciliación contra sandbox Stripe o Redsys;
- documentación técnica autenticada, aceptación/rechazo y formato vigente de
  SES.Hospedajes, incluidas las comunicaciones de reserva y de inicio;
- recepción independiente de una alerta;
- captura de red fechada de consentimiento y eventos de analítica en producción;
- cualquier alta, cambio o cancelación OTA;
- calidad, coste, latencia, privacidad y supervisión de un modelo de IA.

Cada punto permanece como checklist hasta disponer de cuenta, destino,
credencial, alcance y autorización explícitos.

## Cierre de la porción local de R12 · 2026-08-10

`apps/web/scripts/r12-boundaries.mjs` convierte los estados tenant en contrato
de build: inspecciona código, dependencias y artefacto; mantiene cierta la
política de cookies de los campings; exige observabilidad local; rechaza conectores
OTA y SDKs de modelos; y fija las transiciones no ejecutables de la demo. El
procedimiento común de activación, aceptación, degradación y apagado vive en
`docs/RUNBOOK-GATES-R12.md`. `apps/site/scripts/check-commercial-artifact.mjs`
verifica por separado el alcance comercial de GTM, el banner y las páginas
legales (ADR 0045).

Con esta evidencia no queda adaptador local honesto que construir sin elegir un
tercero y abrir su gate. R12 continúa abierto para sus pruebas externas, pero su
porción ejecutable autónoma queda agotada y la ruta local avanza a R13.
