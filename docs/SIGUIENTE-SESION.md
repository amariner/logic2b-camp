# Prompt para la siguiente sesión — revalidación condicionada R15

> Reescrito tras la sesión 133 (2026-08-11). La auditoría no visual no encuentra
> más trabajo funcional local honesto; no debe fabricarse actividad para ocultar
> gates externos o invadir el frente de temas.

## Estado en una línea

R0–R8 y R10–R11 están acreditados; R12–R13 agotaron su parte local y R14 sigue
vetado. Lo abierto requiere temas, material real, credencial/proveedor,
autorización de producción o una decisión comercial.

## Próxima acción válida

Antes de implementar nada, comprobar qué estado externo cambió:

1. Si `tenants/vinyes/` ya está estable, repetir `pnpm check` sin modificarlo y
   registrar el cierre global. El intento de la sesión 133 llegó a 54/63 antes
   de fallar por su `content/es.json` temporalmente inválido.
2. Si el usuario aporta material real de cliente, usar el readiness R13 para
   completar identidad/legal, contenido, inventario/tarifas o media sin inventar
   datos y respetando el alcance expresamente autorizado.
3. Si aporta cuenta, sandbox, credenciales y módulo contratado, seguir el gate
   correspondiente de `RUNBOOK-GATES-R12.md` y su runbook específico.
4. Si autoriza un destino, ejecutar primero el plan supervisado de R13; nunca
   inferir permiso para DNS, secrets, `--remote`, `--apply` o deploy.
5. Si existe decisión/pago explícito para Camp Motor, abrir R14 con ADR. Sin esa
   señal, el veto permanece.

Si ninguna condición ha cambiado, no abrir una funcionalidad especulativa:
informar que el trabajo local no visual está agotado y mantener los gates
visibles.

## Evidencia vigente

- Auditoría: `docs/AUDITORIA-R15-NO-VISUAL.md`.
- Bundle: 13.539 enlaces internos en 417 HTML; entradas M6 entre 173,13 y 183,39
  kB gzip.
- Sitio: 79 páginas; web base: 235; colecciones Astro explícitas y sin aviso
  deprecado; typecheck web con cero diagnósticos.
- Readiness: 1.989 bloqueos locales de build y 4 gates externos de publicación.
- CLI 54/54; último `pnpm check` completo anterior al cambio concurrente: 63/63.

## Límites de autoridad

- No tocar `tenants/vinyes/`, `pnpm-lock.yaml`, `tmp/`, temas, fotografía ni
  activos desde el frente no visual.
- No inventar identidad, contenido, inventario, tarifas, IDs o aceptación.
- No usar `--apply`, `--remote`, deploy, DNS, secrets, cuentas ni proveedores sin
  entradas y autorización explícitas.
- No abrir Camp Motor por iniciativa técnica.

## Prompt

```text
continúa con el desarrollo del proyecto, excepto temas
```
