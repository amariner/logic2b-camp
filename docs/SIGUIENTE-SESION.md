# Prompt para la siguiente sesión — primer corte local R13

> Reescrito tras la sesión 126 (2026-08-10). R0–R11 están cerrados y la porción
> local autónoma de R12 está agotada. Sus cuentas, sandbox y proveedores siguen
> siendo gates externos, no trabajo simulado pendiente.

## Estado en una línea

Analytics, observabilidad externa, OTA e IA tienen un contrato ejecutable de
ausencia/no ejecución y un runbook de activación. La ruta local avanza a R13:
validar el carril de alta sin tocar infraestructura ni crear un tenant real.

## Objetivo prioritario

Cerrar el primer corte de **R13 · plantilla, configuración, CLI y dry-run**:

1. Releer ADR 0012, `docs/ONBOARDING.md`, `tenants/_template`, los esquemas de
   `packages/config` y los comandos de `packages/cli`.
2. Derivar el contrato mínimo de un alta: entradas, ficheros permitidos,
   validación, plan de infraestructura y prueba de que nunca modifica `apps/` ni
   `packages/`.
3. Crear primero reproducciones rojas para cualquier hueco real de plantilla,
   esquema, path traversal, colisión, dry-run o determinismo. No añadir trabajo
   mecánico si los tests existentes ya lo prueban con alcance suficiente.
4. Ejecutar el plan solo en lectura/dry-run y, si hace falta un destino, usar un
   directorio temporal fuera de `tenants/`. No ejecutar `--apply`, no crear D1,
   Worker, DNS, secrets, usuarios ni dominio.
5. Documentar el resultado, el siguiente gate R13 y la reversión. Si plantilla,
   config y dry-run quedan probados, seleccionar después migraciones/seed local
   en un entorno desechable, todavía sin publicación.

## Ya verificado — no repetir sin cambio relevante

- Resend, Stripe/Redsys y SES tienen fronteras locales fail-closed; sandbox y
  contratos oficiales siguen gated.
- `/reports` usa `bookingValue`; no afirma factura ni caja por fecha.
- `RUNBOOK-GATES-R12.md` cubre Analytics, observabilidad, OTA e IA.
- La build pública inspecciona fuente, dependencias y artefacto y falla si entra
  tracker, SDK externo, conector OTA o ejecución de modelo.
- Automatiza/Inteligente conservan `manual_external`/`execution:none` y no
  ofrecen transición `sent`, `applied` o `executed`.

## Límites de autoridad

- No ejecutar `new:camping --apply`, `LOGIC_CAMP_ALLOW_INFRA=1`, migraciones
  remotas, reseed, deploy, DNS, secrets ni cuentas.
- No usar `tenants/delta`, `tenants/duna`, `tenants/riuclar` o
  `tenants/serralta` como fixture del corte; pertenecen al portfolio concurrente
  y deben preservarse.
- No corregir un fallo concurrente del portfolio dentro de R13 salvo que bloquee
  un contrato común y pueda aislarse sin mezclar autoría.
- Camp Motor continúa vetado hasta una decisión/pago explícito.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
