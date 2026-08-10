# Auditoría R11 — seguridad, privacidad y operación local

> Corte: 2026-08-10. Esta auditoría describe código y pruebas locales. No acredita
> configuración, credenciales, restauración, alertas ni proveedores remotos.

## 1. Fronteras revisadas

| Frontera              | Evidencia ejecutable                                                                                                            | Resultado y límite conocido                                                                                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Aislamiento de tenant | `apps/api/test/isolation.test.ts` descubre `app.routes`, usa sesión de A contra D1 B y falla si aparece una ruta sin clasificar | Binding D1 por Worker y cierre exhaustivo A↛B. Tres excepciones públicas llevan motivo escrito.                                                                                                                           |
| Auth                  | `apps/api/test/admin.test.ts` prueba secreto ausente/corto, alta pública cerrada, sesión cruzada y orígenes                     | Producción exige `AUTH_SECRET` ≥32 caracteres. El fallback solo existe con `LOGIC_CAMP_DEV_AUTH=1`.                                                                                                                       |
| Roles                 | política común en `packages/config/src/roles.ts`; barrido en `demo-role.test.ts`                                                | El servidor decide; `demo` solo ejecuta la lista de acciones reversible. La UI no sustituye esta barrera.                                                                                                                 |
| Cookies               | `authUsesSecureCookies` y prueba del `Set-Cookie` de producción                                                                 | Con `AUTH_SECRET`: prefijo `__Secure-`, `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/`. Local conserva cookie HTTP solo con interruptor explícito.                                                                        |
| Cabeceras             | `security.test.ts`, `_headers` y contrato del build del sitio                                                                   | API y estáticos emiten CSP mínima, Permissions-Policy, Referrer-Policy, HSTS, `nosniff` y `DENY`. COOP/CORP/COEP se aplazan hasta probar pagos/recursos reales.                                                           |
| CORS/CSRF             | pruebas de origen de Better Auth y ausencia de `Access-Control-Allow-Origin`                                                    | El gestor es mismo origen, las cookies son Lax y Better Auth rechaza orígenes no confiables. No hay CORS amplio. Si nace una API cross-origin o una mutación de formulario simple, debe abrirse un diseño CSRF explícito. |
| Rate limit            | contratos de rutas + pruebas de cuotas y `Retry-After`                                                                          | Hay cuotas por superficie e IP. Son mapas por isolate: no son un límite global distribuido; WAF/rate limiting de borde queda como gate de R12.                                                                            |
| Superficie pública    | `route-contracts.test.ts` inventaría 47 rutas y exige auth/validación/idempotencia/cuota                                        | Ninguna ruta admin puede declararse pública y toda mutación anónima tiene cuota específica.                                                                                                                               |

El Worker solo intercepta `/api/*`; los estáticos los sirve Workers Assets. Por
eso las cabeceras están deliberadamente en dos puntos: middleware Hono y
`apps/site/public/_headers`. Cloudflare documenta que `_headers` solo afecta a
respuestas de assets, no a las respuestas generadas por el Worker:
<https://developers.cloudflare.com/workers/static-assets/headers/>.

## 2. RGPD y minimización

| Obligación                         | Estado local demostrado                                                                                                                                                |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Consentimiento                     | La reserva web exige consentimiento y guarda fecha+versión; mostrador no inventa una fecha; se puede registrar o retirar después.                                      |
| Acceso/portabilidad del interesado | Export de ficha, reservas, pagos sin `raw` y auditoría; solo gerencia; la propia extracción deja rastro.                                                               |
| Supresión                          | Un único anonimizador vacía contacto, documento, parte de viajeros, consentimiento, notas y PII copiada al audit log; es idempotente y no permite rehidratar la ficha. |
| Conservación legal                 | Si existe una estancia dentro del plazo, responde `409 retention_hold` con fecha; vencido el plazo permite anonimizar.                                                 |
| Leads/solicitudes                  | La purga conserva la fila operativa y anonimiza contacto vencido; admite dry-run e idempotencia.                                                                       |
| Barrido periódico                  | Ruta de previsualización solo owner y tarea cron aislada; un fallo no impide las demás tareas.                                                                         |
| Pago                               | `payments.raw` no sale por API/export y la migración 0007 limpia el legado.                                                                                            |

La cobertura vive en `apps/api/test/rgpd.test.ts`. Los plazos y bases legales
siguen siendo una decisión contractual/jurídica por cliente: las pruebas
garantizan que la política configurada se ejecuta, no que una demo sustituya el
asesoramiento legal o el contrato de encargo.

## 3. Copias y restauración

- `pnpm export:tenant <slug> --local` usa la misma persistencia que reset, seed y
  `wrangler dev` y produce SQL+CSV.
- El SQL se construye con el esquema antes de los datos. Esto evita el fallo
  reproducido en Wrangler 4.111, cuyo volcado completo intercalaba
  `booking_guests` antes de crear `guests`.
- `pnpm backup:rehearse demo` exporta, restaura en una D1 local temporal, compara
  reservas/huéspedes/pagos/última reserva/migraciones y exige cero descuadres de
  pago y cero solapes.
- Ensayo 2026-08-10: **3426 reservas, 2568 huéspedes, 3109 pagos; huellas iguales;
  invariantes 0/0**.
- Esto no prueba D1 remota ni Time Travel. La prueba remota requiere cuenta,
  autorización, una base nueva y el runbook `RUNBOOK-COPIAS.md`.

D1 Time Travel conserva puntos de restauración por minuto durante 30 días y el
restore devuelve un bookmark que permite deshacerlo, según la documentación
oficial: <https://developers.cloudflare.com/d1/reference/time-travel/>.

## 4. Observabilidad mínima

Hoy existe:

- error público JSON sin mensaje interno ni stack, con referencia correlacionable;
- una línea JSON estructurada por evento/tenant/referencia;
- redacción de email, teléfono, código de reserva y formatos de credencial conocidos;
- cortafuegos de avisos por ruta/ventana y contador de suprimidos;
- persistencia del intento de aviso y aislamiento de tareas cron;
- tests de que el propio canal de aviso no rompe la respuesta original.

Punto ciego aceptado: los logs quedan en la plataforma y el aviso usa email. Si
falla el correo o nadie mira los logs, no hay canal independiente. Logpush,
Sentry o equivalente requieren destino, cuenta, retención, responsables y
credenciales autorizadas. No se puede declarar «alerta recibida» todavía.

## 5. Gates que permanecen cerrados

- Restauración/Time Travel remotos y cualquier cambio de binding o despliegue.
- WAF/rate limiting distribuido y observabilidad externa independiente.
- Cuenta y entrega real de Resend; sandbox/cobro de Stripe o Redsys; credenciales
  SES.Hospedajes; fiscal/VeriFactu; OTA; proveedor/modelo de IA.
- CSP más restrictiva, COOP/CORP/COEP o apertura de CORS hasta conocer y probar
  los recursos e integraciones reales del tenant.

## 6. Conclusión de R11

No quedan riesgos locales demostrados de esta ronda sin contrato o prueba. El
primer cliente todavía necesita discovery, credenciales, ensayos externos y
aceptación por módulo, pero ya no obliga a redescubrir qué existe, qué falta,
quién lo aporta y cómo se revierte: eso queda en
`DOSSIER-ACTIVACION-PRODUCCION.md`.
