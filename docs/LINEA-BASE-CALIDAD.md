# Línea base de calidad

> Referencia local fijada el 2026-08-10 en `main`, sesión 105. No acredita el
> estado de producción ni sustituye el QA posterior a un despliegue.

## Entorno de referencia

- macOS 26.6, arm64.
- Node.js 24.13.1.
- pnpm 11.10.0.
- Ejecución sin caché previa relevante y sin servicios de desarrollo abiertos.

## Cierre global

El comando obligatorio sigue siendo:

```bash
pnpm check
```

La referencia de esta sesión es **53/53 tareas verdes en 32,52 s**. Incluye
typecheck, lint, tests y builds del monorepo. En particular, API pasa **240/240**,
tenant demo **62/62** y los enlaces de la API **3/3**. Tras R3, la API amplía su
referencia a **245/245** por las cinco pruebas de configuración de módulos.

Para distinguir un fallo de aserción de la contención ocasional al arrancar
Workers/D1, la misma batería de tests se ejecutó en serie:

```bash
/usr/bin/time -p pnpm -r --workspace-concurrency=1 --if-present test
```

Resultado: salida 0 en **28,39 s**. La tabla registra la duración que comunica
cada runner; el total incluye arranques, builds del portfolio y enlaces.

| Paquete | Resultado | Duración del runner |
| --- | ---: | ---: |
| `@logic-camp/cli` | 27/27 | 0,227 s |
| `@logic-camp/config` | 49/49 | 0,299 s |
| `@logic-camp/core` | 68/68 | 0,215 s |
| `@logic-camp/hospedajes` | 22/22 | 0,191 s |
| `@logic-camp/notifications` | 8/8 | 0,297 s |
| `@logic-camp/payments` | 20/20 | 0,531 s |
| `@logic-camp/ui` | 57/57 | 1,54 s |
| `@logic-camp/api` | 240/240 + enlaces 3/3 | 6,53 s + 0,042 s |
| `@logic-camp/dashboard` | 34/34 | 0,314 s |
| `@logic-camp/web` | fotos 9/9 + portfolio 3/3 | ~6,4 s de builds |
| `@tenant/demo` | 62/62 | 7,70 s |

Los avisos de Better Auth por URL/secreto ficticios y el desfase entre la fecha
máxima de compatibilidad del Workers instalado y `2026-07-01` no fueron fallos
de aserción. Deben revisarse al actualizar dependencias, no ocultarse.

## Revalidación aislada de Workers/D1

Si `pnpm check` falla o cancela tareas durante el arranque concurrente del
runtime:

1. Conservar el primer error completo e identificar el paquete y la prueba.
2. Cerrar procesos `dev`/`preview` del repositorio que compitan por recursos.
3. Ejecutar `pnpm --filter @logic-camp/api test`.
4. Ejecutar `pnpm --filter @tenant/demo test`.
5. Ejecutar typecheck, lint y build del paquete afectado.
6. Ejecutar `pnpm --filter @logic-camp/api test:demo-links` si cambió el bundle,
   sus rutas o el Worker.
7. Volver a `pnpm check` antes de cerrar.

Un timeout solo se clasifica como ambiental si la suite afectada pasa aislada y
no hay ninguna aserción fallida. Una aserción, excepción de producto o salida
no cero reproducible sigue siendo una regresión.

## Fronteras de tier

`pnpm --filter @logic-camp/web test` construye cada camping real y comprueba el
contenido del artefacto, no solo que Astro termine:

| Tenant | Tier | HTML | JS | Contrato comprobado |
| --- | ---: | ---: | ---: | --- |
| L'Olivar | 1 | 13 | 1 | Sin rutas ni chunks del motor |
| Pinada del Mar | 2 | 15 | 1 | Sin rutas ni chunks del motor/cobro |
| Mar de Fondo | 3 | 25 | 8 | Con `/reserva/`, `/reservar/` y los cuatro chunks del motor |

La guardia vive en `apps/web/scripts/check-portfolio.mjs` y forma parte de
`pnpm check`. En tiers 1–2 rechaza `Mostrador`, `FunnelDetalle`,
`FunnelTitular` y `ReservaGestion`; en tier 3 exige esos chunks y ambas rutas.

## Presupuestos automatizados

- Dashboard: entrada inicial **<200 kB gzip**; Planning y Plano deben seguir
  como entradas dinámicas. Referencia tras R3: normal **173,01 kB**; Pinada:
  **177,48 kB**; Mar de Fondo: **183,26 kB**. La misma guarda rechaza fixtures
  de otro escenario o de demo en el artefacto normal.
- Worker API: build seco de **2.649,36 KiB**, **451,47 KiB gzip**. Se registra
  como referencia comparativa; Wrangler no impone aquí un límite propio del
  repositorio.
- Vídeo de gestos: máximo **2 MB**, póster máximo **350 kB**, duración 20–35 s.
  Referencia aprobada: **590 kB**, **42 kB**, **22,1 s**.
- Vídeo de primera ola: máximo **7,5 MB**, duración acotada por el generador.
- Capturas de Mar de Fondo: máximo **450 kB** por WebP.
- Pipeline fotográfico: lado máximo **2.000 px** y lotes de hasta dos imágenes.

Los límites se ejecutan desde los scripts que generan o construyen cada activo;
no son objetivos informales de documentación.

## Bundle compuesto

```bash
pnpm --filter @logic-camp/api bundle:demo
```

La referencia es: sitio de **71 páginas**, artefacto compuesto de unos **71.800
kB / 985 archivos**, y **11.535 enlaces internos verificados en 358 HTML**. El
comando recompone landing, demo, tres marcas y sus gestores; también vuelve a
ejecutar el presupuesto del dashboard para sus tres escenarios.

No ejecuta migraciones ni autoriza un despliegue. Publicar continúa requiriendo
permiso explícito y QA posterior en producción.
