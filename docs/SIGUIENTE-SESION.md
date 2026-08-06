# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito tras la sesión 85 (2026-08-06). **D2-V está cerrado**: Pinada del
> Mar tiene recorrido, 11 fotografías propias, derivados de marca y build verde.

## Estado en una línea

La primera ola tiene Inicio (L'Olivar) y Gestión (Pinada del Mar) terminadas. El
siguiente objetivo contractual es **D3-V, Mar de Fondo / Visión**.

## Objetivo

Construir primero el recorrido convincente **reserva → operación** de Mar de
Fondo con identidad, catálogo, inventario y fixtures propios (~300 unidades),
reutilizando el runtime compartido sin copiar fotografía ni contenido de los
otros tenants. Solo después abrir Automatiza e Inteligente con fixtures
explicables y los rótulos exactos del contrato visual.

Orden recomendado:

1. `tenants/mardefondo`: config, tema, contenido, catálogo y dataset propios.
2. Reserva y pago demo con recibo inequívocamente simulado.
3. Planning/plano a escala y recorrido operativo.
4. Automatiza e Inteligente como prototipos supervisados, nunca como IA real.
5. Activos visuales, QA 375/1366, bundle compuesto y capturas firma.

## Ya terminado — no repetir

- `tenants/pinadamar`: identidad, contenido, paleta, config, 110 unidades,
  adaptador tipado de 42 solicitudes / 84 estancias, plano propio y reset.
- Recorrido web↔gestor verificado en navegador con **0 peticiones `/api`**.
- **Degradación sin fotografía** (`<Materia>` + `apps/web/src/lib/fotos.ts`): un
  camping sin media construye y se enseña. No sustituir por placeholders.
- **Guardia de escaparate** (`apps/web/scripts/check-portfolio.mjs`, tarea `test`
  de `apps/web`): `pnpm check` construye todos los campings y falla nombrando al
  roto.
- `ocupacionDeLaNoche` en `packages/config`, con tests: el plano ya no miente.
- `/tarifas` sin desborde a 375 en campings de nombres de temporada largos.

## Regla de alcance

- No abrir Mar de Fondo ni D3-V hasta cerrar D2-V, salvo que se elija el
  Objetivo B, que es D4-V y sí puede adelantarse porque no depende de la piel.
- No crear D1, Worker, usuarios, email, pagos ni infraestructura por marca.
- No sustituir las fotos que faltan por placeholders ni reciclar las de Cala
  Sereno o L'Olivar.

## Prompt

```text
continúa con el desarrollo de este proyecto
```
