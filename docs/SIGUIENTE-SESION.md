# Prompt para la siguiente sesión — objetivo duradero en R11

> Reescrito tras la sesión 113 (2026-08-10). R0–R10 están cerrados; producción
> sigue requiriendo autorización explícita.

## Estado en una línea

El portfolio no necesita otra demo sin señal comercial y el bundle canónico ya
tiene un recorrido reproducible de venta, temas, gestor, assets y responsive;
ahora toca convertir la seguridad y la activación del primer cliente en una
lista verificable, no en supuestos dispersos.

## Objetivo prioritario

Abrir **R11 · Seguridad y preparación del primer cliente** de
`docs/RUTA-DESARROLLO-CONTINUO.md` y agotar primero su trabajo local:

1. Inventariar las fronteras existentes de aislamiento, auth, roles, cookies,
   headers, CORS/CSRF, rate limits y rutas públicas; reproducir antes de tocar.
2. Revisar RGPD, retención, anonimización, consentimiento y exports contra código,
   tests, ADR y runbooks actuales, separando riesgo real de deuda hipotética.
3. Auditar `docs/RUNBOOK-COPIAS.md`: probar solo export/restauración local y dejar
   la restauración remota detrás de credencial y autorización.
4. Documentar la observabilidad mínima disponible y el punto ciego que no puede
   cerrarse sin una cuenta externa autorizada.
5. Actualizar el dossier de activación por módulo —Inicio, Gestión, pagos,
   comunicaciones, fiscal/SES, OTA e IA— con estado, dueño, secreto/proveedor,
   prueba de aceptación, rollback y gate.
6. Convertir cada defecto local demostrado en una corrección pequeña con prueba
   o runbook; no crear infraestructura ni activar integraciones por anticipado.

## Gates que siguen cerrados

- D5-V continúa en tres demos: Montaña, Familiar y Parcela carecen de una señal
  observada propia. Sus disparadores están en `docs/AUDITORIA-PORTFOLIO-R9.md`.
- Restauración remota, Analytics/Sentry, email, pagos, SES.Hospedajes, OTA e IA
  requieren cuenta, credencial, destino y autorización según el módulo.
- El candidato acumulado incluye `0007_scrub_payment_raw.sql`; cualquier deploy
  debe revisar el borrado deliberado, backup/rollback y `AUTH_SECRET` remoto.

## Ya verificado — no repetir sin un cambio relevante

- R9 comparó tres demos con Montaña/Familiar/Parcela y dejó D5-V esperando 3/3;
  D6-V todavía no es evaluable.
- `qa:canonical` construye el bundle compuesto y recorre 11 superficies / 22
  vistas a 375/1366 px: ES/EN, docs, Cala, L'Olivar, Pinada y Mar de Fondo.
- El gate comprueba testigos, indexación/noindex, imágenes, fuentes, overflow,
  consola, peticiones y cinco assets/MIME; la inspección visual cubrió landing,
  planning y los dos prototipos supervisados.
- Playwright recorre funnel, gestión, mobile, permisos, reduced motion, temas y
  reset real; cada test usa una IP de cliente determinista sin desactivar las
  cuotas de producción.
- El dashboard compuesto ya publica favicon bajo cada `BASE_URL`. Better Auth
  conserva rate limit en producción, usa `cf-connecting-ip` y solo desactiva su
  segunda cuota bajo el flag local sin `AUTH_SECRET`.
- No hubo deploy, reseed remoto, proveedor, secreto ni escritura de producción.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
