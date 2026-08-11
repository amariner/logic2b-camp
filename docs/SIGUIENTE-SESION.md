# Prompt para la siguiente sesión — auditoría no visual R15

> Reescrito tras la sesión 132 (2026-08-11). El preflight R13 ya distingue qué
> impide construir y qué solo impide publicar; completar un candidato exige
> material real aprobado.

## Estado en una línea

La plantilla conserva 1.989 bloqueos locales de build —identidad/legal,
contenido, inventario/tarifas y media/tema— y 4 verificaciones externas de
publicación. No deben resolverse inventando datos. R14 Camp Motor sigue cerrado.

## Objetivo prioritario

Abrir el corte no visual de **R15 · integración y cierre del objetivo**:

1. Auditar R0–R14 contra evidencia ejecutable y documentos actuales, excluyendo
   cualquier producción o modificación de temas y activos.
2. Clasificar cada resto como trabajo local ejecutable, material/decisión de
   cliente, credencial/proveedor, autorización de producción o gate comercial.
3. Ejecutar suites dirigidas, `pnpm check`, bundle compuesto y verificadores de
   enlaces/recursos que no dependan de completar material visual pendiente.
4. Reconciliar ROADMAP, BACKLOG, PROGRESS y esta guía con los hallazgos, sin
   reabrir trabajo acreditado ni presentar gates externos como completados.
5. Si aparece trabajo funcional local de alto valor fuera de temas, resolver el
   primero con pruebas y volver a auditar. Si no aparece, dejar explícito qué
   señal o material desbloquea cada resto.

## Ya verificado — no repetir sin cambio relevante

- CLI 54/54 y `pnpm check` 63/63 tras el preflight.
- `pnpm activation:rehearse`: `buildReady=false`, `publishReady=false`; 31 +
  1.938 + 7 + 13 bloqueos locales y 4 verificaciones externas.
- Los perfiles técnicos 1/2/3, el carril D1 local, rollback, activación y
  write-set ya están acreditados en temporales.
- El preflight termina antes de Astro, Wrangler, red, proveedor o deploy y no
  expone valores sensibles.

## Límites de autoridad

- No tocar `tenants/vinyes/`, `pnpm-lock.yaml`, `tmp/`, temas, fotografía ni
  activos; son trabajo concurrente o quedan fuera del encargo.
- No pasar `--apply`, usar `--remote`, deploy, DNS, secrets, cuentas ni
  proveedores.
- No inventar identidad legal, contenido, inventario, tarifas, IDs o material
  visual para convertir el readiness en verde.
- No abrir R14 Camp Motor sin decisión/pago explícito.

## Prompt

```text
continúa con el desarrollo de este proyecto, excepto temas
```
