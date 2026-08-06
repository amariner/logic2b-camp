# Prompt para la siguiente sesión — protocolo CONTINUA activo

> Reescrito tras la sesión 84 (2026-08-06). El recorrido de Pinada del Mar está
> cerrado y verificado; lo que falta de D2-V es **la piel**, y la piel necesita
> salida a internet. No rehacer adaptador, dataset, plano, contenido ni el
> degradado sin foto: están implementados y verificados.

## Estado en una línea

Pinada del Mar ya recorre solicitud → gestor → planning → plano sin API ni
credenciales y con el bundle compuesto verde; le faltan 9 fotografías y sus
derivados de marca, que **no se pueden bajar desde el contenedor cloud**.

## Antes de elegir objetivo: leer esto

La cola fotográfica **no es ejecutable en una sesión cloud**. El proxy sale por
lista blanca (npm, GitHub, Anthropic, MCP) y contesta **403 al CONNECT** a
cualquier otro host, `example.com` incluido. Generar sí funciona (entra por MCP);
bajar, no. No volver a diagnosticarlo: está en `docs/BACKLOG.md` y en la cabecera
de `apps/web/scripts/fetch-fotos.mjs`.

## Objetivo A — si esta sesión corre en la máquina de Andreu

Cerrar D2-V del todo, en este orden:

1. Generar las **9 piezas pendientes** de `tenants/pinadamar/fotos.json` — el
   prompt de cada una ya está fijado y validado contra la dirección de arte. En
   lotes de 2, inspeccionando cada una antes de seguir; no reenviar un lote que
   falle.
2. Pegar la URL de cada pieza en su entrada del JSON y correr
   `node apps/web/scripts/fetch-fotos.mjs pinadamar` (sale 0 cuando las 11 están).
3. Añadir los derivados de marca que hoy no existen: `favicon.svg`,
   `apple-touch-icon.png`, `og.jpg`, `miniatura.webp` (mismo juego que L'Olivar).
   Eso apaga el único error de consola que queda en la demo.
4. `pnpm --filter @logic-camp/api bundle:demo` y QA a 375/1366: ninguna caja debe
   seguir enseñando `.lc-materia` en Pinada.
5. Tres capturas firma con foto: home, solicitud nueva y planning denso.
6. `pnpm check` y declarar D2-V cerrado en `PROGRESS.md`. Solo entonces, D3-V.

## Objetivo B — si esta sesión corre en cloud (lo normal)

**No** intentar la cola fotográfica. Elegir del BACKLOG con el criterio
demo-first, y el candidato con más valor visible es **D4-V, el escaparate**:
hoy las tres demos existen pero **no hay ninguna puerta que lleve a ellas** desde
la landing. Una galería en `apps/site` con las tres tarjetas (Inicio / Gestión /
Visión), qué enseña cada una y cuánto dura su recorrido, es visible, vendible y
no necesita ni credenciales ni fotos nuevas: L'Olivar ya tiene las suyas y Pinada
degrada con dignidad. Alternativa más pequeña: los remates de `docs/BACKLOG.md`
marcados `[dashboard]` sobre módulos que la barra lateral ofrece y el rol no
puede abrir.

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
