# Prompt para la siguiente sesión — segundo corte local R13

> Reescrito tras la sesión 127 (2026-08-10). El carril de scaffold/dry-run está
> probado y no deja residuos. La ejecución remota continúa cerrada.

## Estado en una línea

`new:camping --dry-run` valida identidad, genera el scaffold en temporal, enumera
todos los marcadores y devuelve una huella reproducible. Un plan con pasos
manuales falla antes del primer proceso. El siguiente corte empieza después del
scaffold: esquema D1, seed inicial, owner y rollback, solo en local desechable.

## Objetivo prioritario

Cerrar el segundo corte de **R13 · migraciones y seed local recuperable**:

1. Auditar `packages/db/migrations`, `tenants/_template/seed.ts`,
   `write-seed.ts`, el esquema de auth y el ensayo de backup existente. Derivar
   qué evidencia acredita orden migración → seed → invariantes → export →
   restauración.
2. Crear primero reproducciones rojas para huecos reales: estado local no
   aislado, seed no determinista, owner incoherente, migración no idempotente,
   rollback que no restaura filas/huellas o comandos capaces de resolver remoto.
3. Ejecutar todo contra un directorio temporal del sistema y una D1/SQLite local
   desechable. El fixture puede usar datos sintéticos claramente marcados, pero
   no puede persistir un tenant bajo `tenants/` ni reutilizar las bases demo.
4. Comparar recuentos, huellas e invariantes antes/después de restaurar. Limpiar
   el temporal aun si falla una fase y documentar el procedimiento reproducible.
5. Si migración+seed+rollback quedan acreditados, seleccionar después bindings,
   secrets y adaptadores `none` en un candidato local; todavía sin proveedor,
   dominio, publicación ni cuenta real.

## Ya verificado — no repetir sin cambio relevante

- CLI **45/45** y configuración **66/66**, con tipos/lint verdes.
- Nombre/dirección con comillas producen TS/JSON válido; dominio y zona se
  normalizan y deben ser coherentes.
- El scaffold rechaza colisión, path inseguro/symlink y publica atómicamente.
- El dry-run `r13-audit` produjo 18 ficheros y huella
  `9562db329d432f4dbebb457d0ad779f68a2d54cb80fb2b8c1e416d75ca8efe37`,
  dejando `tenants/r13-audit` inexistente.
- `runInfraPlan` usa runner inyectado en tests y rechaza el plan actual por sus
  pasos manuales antes de ejecutar nada.
- El recurso accidental `logic-camp-la-pineda` fue eliminado vacío y una lista
  posterior confirmó que no queda. No usar red para volver a comprobarlo salvo
  nueva evidencia de divergencia.

## Límites de autoridad

- No pasar `--apply`, no definir `LOGIC_CAMP_ALLOW_INFRA=1` y no invocar
  comandos `--remote`, deploy, DNS, secrets, cuentas ni proveedores.
- Las pruebas del runner deben inyectar un ejecutor; nunca usar Wrangler, `echo`,
  `touch` u otro proceso real para demostrar el preflight.
- No usar `tenants/delta`, `duna`, `riuclar` o `serralta` como fixture. Su trabajo
  paralelo se preserva; hoy el gate global se detiene por una foto de `serralta`.
- Camp Motor continúa vetado hasta una decisión/pago explícito.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
