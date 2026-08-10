# Inventario de integraciones y proveedores R12

> Corte local del 2026-08-10. «Implementado» significa código y prueba local;
> nunca acredita una cuenta, sandbox, entrega o entorno oficial. El dossier de
> activación sigue siendo la autoridad para producción.

## 1. Recorridos por oferta y tier técnico

| Oferta / carril                        | Recorrido actual que puede tocar una integración                        | Estado sin proveedor                                                                                                  | Gate externo                                                                            |
| -------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Inicio** / build tier 1              | consulta de huésped y lead comercial Logic2B → correo                   | las demos `demo`/`demo-session` no hacen red; el backend productivo distingue `disabled`/`failed` y no afirma entrega | cuenta Resend, dominio/remitente, buzón, `RESEND_API_KEY`, privacidad y prueba recibida |
| **Gestión** / base tier 3              | solicitud/reserva → avisos; cobro manual; parte de viajeros descargable | `notifications_log=disabled`, pagos `none`/manual y `manualTransport` de SES mantienen operación                      | solo los módulos contratados: correo, Stripe/Redsys o SES                               |
| **Automatiza** / tier 3 + capacidades  | recordatorio y aviso de reserva pendiente sobre el mismo correo         | eventos desactivables por config; sin Queue ni reenvío programado                                                     | correo real y, si el volumen lo justifica, Queue aprobada; IA sigue siendo prototipo    |
| **Inteligente** / tier 3 + capacidades | informes y escenarios supervisados de OTA/IA                            | fixtures locales etiquetados; no existe conector ni llamada de modelo                                                 | contrato de producto, proveedor, autoridad, datos, coste, permisos y evaluación         |

El tier técnico 2 conserva solicitudes y dashboard lite para instalaciones
anteriores. Camp Motor/tier 4 continúa vetado hasta que exista un cliente que lo
pague.

## 2. Matriz de contratos

Leyenda: **sí** probado localmente; **parcial** existe pero falta parte del
contrato; **gate** requiere tercero; **no** no existe y no se simula como real.

| Integración                          | Zod/frontera                                                                  | Idempotencia                                              | Timeout     | Reintento              | Correlación + PII                                    | Degradación                                     | Dueño, coste y apagado  | Estado/gate                                                 |
| ------------------------------------ | ----------------------------------------------------------------------------- | --------------------------------------------------------- | ----------- | ---------------------- | ---------------------------------------------------- | ----------------------------------------------- | ----------------------- | ----------------------------------------------------------- |
| **Resend: notificaciones y leads**   | sí: input tipado y éxito externo validado con Zod                             | sí: clave por entrega; misma en ambos intentos            | 8 s/intento | uno, solo transitorios | sí: ref, intentos y códigos cerrados sin body remoto | sí: `disabled` y eventos on/off                 | runbook + dossier       | **primer corte local R12 cerrado**; sin cuenta autorizada   |
| **Stripe**                           | sí local: webhook y respuestas salientes Zod                                  | sí: D1 + clave estable en cada POST Stripe                | 8 s/intento | uno, solo seguro       | códigos cerrados sin body/error remoto               | sí: `provider:none` y fallo cerrado sin secrets | runbook + dossier       | **tercer corte local R12 cerrado**; sandbox sigue como gate |
| **Redsys**                           | sí local: callback y refund con Zod+firma                                     | webhook/pago D1; refund no reintenta sin garantía oficial | 8 s/refund  | no por ambigüedad      | códigos cerrados; payload no persistido              | sí: `provider:none`                             | runbook + dossier       | **quinto corte local R12 cerrado**; sandbox sigue como gate |
| **SES.Hospedajes**                   | parcial: config tenant validada; credenciales/acuse no tienen esquema oficial | no                                                        | no          | no                     | Basic Auth no se loguea; acuse mínimo                | sí: descarga `manual` operativa                 | parcial en dossier      | endpoint simulado; credenciales/formato oficial son gate    |
| **Analytics**                        | no                                                                            | n/a                                                       | n/a         | n/a                    | no hay captura ni CMP                                | sí: ausente                                     | pendiente               | cuenta, finalidad, consentimiento y retención son gate      |
| **Errores: logs / Sentry / Logpush** | log propio cerrado                                                            | n/a                                                       | n/a         | n/a                    | sí: referencia y redacción local                     | stdout del Worker                               | canal externo pendiente | cuenta/destino y prueba de alerta son gate                  |
| **Fiscal / VeriFactu**               | no                                                                            | no                                                        | no          | no                     | no hay envío                                         | sistema fiscal vigente sigue siendo autoridad   | pendiente de asesoría   | no construir sin obligación, proveedor y contrato aprobados |
| **OTA / channel manager**            | no                                                                            | no                                                        | no          | no                     | no hay intercambio                                   | fixture etiquetado                              | pendiente               | proveedor, mapeos y autoridad de inventario son gate        |
| **IA / automatización**              | fixtures tipados de UI, no frontera de modelo                                 | no                                                        | no          | no                     | no se envía PII a modelos                            | modo manual y confirmación humana               | pendiente               | casos, proveedor, evals, presupuesto y retención son gate   |

## 3. Orden de cierre local

1. **Correo:** timeout, reintento idempotente, respuesta Zod, códigos sin cuerpo
   remoto, referencia e intentos exactos. Es el único proveedor que atraviesa
   Inicio y reservas ya implementadas.
2. **Pagos:** Stripe y Redsys cierran ya sus fronteras HTTP locales. La versión
   de firma Redsys sigue siendo un gate de terminal/sandbox y nunca se infiere.
3. **SES:** mantener descarga manual como resultado principal; auditar primero
   el contrato oficial y cerrar timeout, acuse y duplicados solo si está
   publicado/aprobado, sin inventar XML de respuesta.
4. **Analytics/errores/fiscal/OTA/IA:** no crear adaptador hasta que el módulo y
   el proveedor estén aprobados. Mantener ausencia, prototipo o modo manual como
   estados explícitos.

## 4. Evidencia que falta y no puede inferirse localmente

- entrega, rebote, spam, DNS y dominio remitente de Resend;
- Checkout/webhook/refund y conciliación contra sandbox Stripe o Redsys;
- aceptación/rechazo y formato vigente de SES.Hospedajes;
- recepción independiente de una alerta;
- consentimiento y eventos de analítica;
- cualquier alta, cambio o cancelación OTA;
- calidad, coste, latencia, privacidad y supervisión de un modelo de IA.

Cada punto permanece como checklist hasta disponer de cuenta, destino,
credencial, alcance y autorización explícitos.
