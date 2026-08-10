# Prompt para la siguiente sesión — objetivo duradero en R12

> Reescrito tras la sesión 114 (2026-08-10). R0–R11 están cerrados; producción y
> proveedores siguen requiriendo autorización explícita.

## Estado en una línea

Seguridad, RGPD, cabeceras, copia local y dossier de activación ya tienen
evidencia ejecutable; ahora toca ordenar las integraciones por recorrido y
terminar solo los contratos locales que reduzcan riesgo antes de abrir una
cuenta externa.

## Objetivo prioritario

Abrir **R12 · Integraciones y proveedores reales** de
`docs/RUTA-DESARROLLO-CONTINUO.md` con este orden:

1. Inventariar por tier y recorrido qué usan hoy Inicio, Gestión, Automatiza e
   Inteligente: Resend, pagos, analítica/errores, SES/fiscal, OTA e IA.
2. Comparar cada adaptador existente con el contrato transversal exigido por
   R12: Zod, idempotencia, timeout, reintento, correlación, redacción de PII,
   estado degradado, ownership, coste y apagado.
3. Elegir el primer defecto **local y reproducible** que atraviese un recorrido
   actual; arreglarlo con prueba. No construir un conector sin módulo aprobado.
4. Mantener `none`, `disabled`, `manual` y demo como estados explícitos; ninguna
   simulación puede compartir el éxito de un proveedor.
5. Actualizar dossier/runbook por cada contrato que cambie y dejar toda prueba
   externa como checklist, no como afirmación.

## Gates que siguen cerrados

- Resend real, Stripe/Redsys sandbox, Analytics, Sentry/Logpush,
  SES.Hospedajes oficial, fiscal/VeriFactu, OTA e IA requieren cuenta, destino,
  credencial, alcance y autorización del módulo.
- Restauración D1 remota y Time Travel siguen pendientes pese al ensayo local
  íntegro; nunca restaurar encima de la base viva.
- D5-V continúa esperando señal propia de Montaña/Familiar/Parcela. D6-V aún no
  es evaluable.
- El candidato incluye la migración deliberada `0007_scrub_payment_raw.sql`;
  cualquier deploy requiere backup/rollback y confirmar `AUTH_SECRET` remoto.

## Ya verificado — no repetir sin un cambio relevante

- `AUDITORIA-SEGURIDAD-R11.md` cierra aislamiento, auth, roles, cookies,
  cabeceras, CORS/CSRF, cuotas, superficie pública, RGPD y observabilidad mínima.
- API y assets tienen cabeceras verificadas; la cookie de producción es Secure,
  HttpOnly y SameSite=Lax.
- `pnpm backup:rehearse demo` restauró 3426/2568/3109 con huella exacta y
  pagos/solapes 0/0. No es evidencia remota.
- `DOSSIER-ACTIVACION-PRODUCCION.md` separa estado, dueño, secreto, aceptación y
  rollback para Inicio, Gestión, pagos, comunicaciones, fiscal/SES, OTA e IA.
- R10 conserva el bundle canónico de 11 superficies / 22 vistas y Playwright
  recorre funnel, gestión, permisos, responsive y reset real.
- No hubo deploy, reseed remoto, proveedor, secreto ni escritura de producción.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
