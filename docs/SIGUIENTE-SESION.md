# Prompt para la siguiente sesión — preflight completo R13

> Reescrito tras la sesión 131 (2026-08-11). El carril automático y su write-set
> están medidos; el coste humano y los destinos reales siguen detrás de sus gates.

## Estado en una línea

`pnpm onboarding:rehearse 2026` completa datos, rollback y activación en 7,13 s
locales, con procesos aislados en temporales. El siguiente corte debe decir con
precisión por qué un candidato todavía no puede construir/publicar, sin producir
temas ni activos para ocultar los bloqueos.

## Objetivo prioritario

Cerrar el quinto corte de **R13 · preflight completo de candidato**:

1. Derivar un informe único desde el scaffold real que clasifique cada marcador
   pendiente en identidad/legal, contenido, inventario/tarifas, media/tema e
   infraestructura; no limitarse a contar `__TODO__`.
2. Crear primero pruebas para un candidato incompleto, uno con incoherencia
   config↔seed↔Wrangler y uno estructuralmente listo. El preflight debe fallar
   antes de Astro, Wrangler o cualquier runner externo y dar rutas/códigos
   accionables sin mostrar valores sensibles.
3. Reutilizar las validaciones de scaffold y activación. No duplicar esquemas ni
   resolver automáticamente contenido, precios, temas, fotografía o secrets.
4. Separar `buildReady` de `publishReady`: un candidato puede estar listo para
   build local y seguir bloqueado por D1, DNS, auth o proveedor real.
5. Acreditar el write-set otra vez y documentar qué parte del build/E2E/QA puede
   ensayarse sin material visual aprobado. No crear ni modificar temas o activos.

## Ya verificado — no repetir sin cambio relevante

- Carril automático: 7,13 s total; scaffold 6,54 ms, migraciones 2,91 s, seed
  1,13 s, backup 0,93 s, restauración 1,94 s y activación 0,21 s.
- CLI 51/51, config 73/73; ocho migraciones y huellas de seed/datos idénticas.
- Activación tiers técnicos 1/2/3 con pagos/correo/Hospedajes apagados y solo
  nombres de secrets.
- Hijos con HOME/config/caché temporales; cero perfiles, secrets, red, Wrangler
  remoto, DNS, deploy o residuos.
- El coste de una tarde sigue `not_proven` hasta medir trabajo humano real.

## Límites de autoridad

- No pasar `--apply`, invocar `--remote`, deploy, DNS, secrets, cuentas ni
  proveedores.
- No usar demos existentes como fixture ni tocar `tenants/vinyes/`, temas,
  fotografía o activos.
- No inventar contenido legal, inventario, tarifas o IDs para convertir un rojo
  legítimo en verde.
- Camp Motor continúa vetado hasta una decisión/pago explícito.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
