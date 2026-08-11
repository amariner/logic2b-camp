# Prompt para la siguiente sesión — cuarto corte local R13

> Reescrito tras la sesión 130 (2026-08-11). Datos, rollback y contrato de
> activación ya están acreditados en temporales. La ejecución remota sigue
> cerrada.

## Estado en una línea

`pnpm activation:rehearse` inspecciona config, seed y Wrangler de un candidato
temporal, valida tiers técnicos 1/2/3 con adaptadores apagados y demuestra cero
cambios en `apps/`/`packages/`. El siguiente corte mide el coste real del carril
local y delimita exactamente su conjunto de escrituras.

## Objetivo prioritario

Cerrar el cuarto corte de **R13 · coste y escritura acotada del alta local**:

1. Instrumentar el recorrido local scaffold → configuración → migración → seed →
   auditoría → backup/rollback con duración y resultado por bloque, sin convertir
   la medida en una promesa de producción.
2. Crear primero pruebas que fallen si el recorrido escribe fuera de su temporal
   o del `tenants/{slug}` candidato, toca `apps/`/`packages/`, deja residuos al
   fallar o intenta ejecutar un plan remoto.
3. Reutilizar `onboarding:rehearse` y `activation:rehearse`; no crear un tercer
   carril que duplique scaffold, migraciones o la matriz de activación.
4. Entregar un informe reproducible que separe tiempo automatizado, trabajo
   humano de contenido/inventario y gates externos. Solo afirmar «cabe en una
   tarde» si la evidencia cubre las tres partes; si no, identificar el bloque
   no medido.
5. Si coste+write-set quedan acreditados, preparar después el candidato completo
   para build, enlaces, E2E y QA, sin producir temas ni activos visuales dentro
   de este objetivo.

## Ya verificado — no repetir sin cambio relevante

- `activation:rehearse`: 18 ficheros, 14 marcadores, huella `998debf6…`, tiers
  1/2/3, CLI 51/51 y config 73/73.
- `onboarding:rehearse 2026`: 8 migraciones, seed/owner deterministas y rollback
  con huella lógica exacta.
- Dry-run literal, scaffold atómico, identidad/escape y preflight sin procesos.
- El hijo de inspección no hereda credenciales; no hubo Wrangler, red, DNS,
  provider, secrets, deploy ni tenant persistente.
- Captación comercial/analytics de la sesión 129 pertenecen a `apps/site` y no
  deben activar `RESEND_API_KEY` interno ni trackers en tenants.

## Límites de autoridad

- No pasar `--apply`, invocar `--remote`, deploy, DNS, secrets, cuentas ni
  proveedores.
- No leer perfiles o credenciales para comprobar si existen; solo nombres y
  ejecutores inyectados.
- No usar demos reales como fixture ni modificar temas, fotografía o activos.
- Camp Motor continúa vetado hasta una decisión/pago explícito.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
