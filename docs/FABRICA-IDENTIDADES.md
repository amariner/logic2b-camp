# Fábrica de identidades — contrato y receta R8

> Fuente de verdad para llevar una identidad desde un brief aprobado hasta un
> build y QA local. No crea Worker, D1, DNS, proveedor ni rama por marca.

## 1. Unidad de variación

Una identidad vive íntegramente bajo `tenants/{slug}/`:

| Artefacto               | Responsabilidad                                                                                         | Gate                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `identity.json`         | ICP, objeción, nivel comercial, historia, tono, paleta, tipografía, pantallas firma, inventario y éxito | Aprobado antes de redactar o producir media           |
| `config.ts`             | Slug, tier técnico, idiomas, dominio, transportes, contacto y legal                                     | Pasa `TenantWebConfig`                                |
| `theme.css`             | Cinco tokens base, derivados, fuentes y una escala de radios                                            | AA y contrato semántico                               |
| `content/{locale}.json` | Voz y contenido por idioma                                                                              | Existe para cada locale declarado y no contiene TODOs |
| `data.ts`               | Inventario, temporadas, tarifas y extras que consume el build                                           | Fixture determinista y coherente con el nivel         |
| `custom/hooks.ts`       | Registro explícito de extensiones                                                                       | Vacío por defecto; nunca parchea el core              |
| `fotos.json`            | Procedencia/licencia, papel, proporción, prompt, lotes y derivados                                      | Aprobado antes de gastar o ingerir bytes              |
| `content/media/`        | Finales locales aprobados                                                                               | Sin URLs temporales ni activos de otra marca          |

`apps/` y `packages/` no forman parte de la identidad. Si una necesidad real no
cabe en este contrato, es un punto de extensión o una capacidad común que debe
decidirse como producto; copiar una aplicación no es una salida válida.

## 2. Brief mínimo

El esquema ejecutable está en `tenants/_template/identity.json`. Un brief no se
aprueba hasta responder los diez campos de producto y arte:

1. `icp`: quién compra y en qué operación debe reconocerse.
2. `objection`: la duda que el recorrido tiene que desactivar.
3. `commercialLevel`: Inicio, Gestión, Automatiza o Inteligente; el tier técnico
   se documenta aparte.
4. `story`: principio, decisión y cierre que se pueden recorrer.
5. `tone`: voz y lenguaje vetado.
6. `palette`: `tinta`, `hueso`, `pino`, `arena` y `mar`, todos AA cuando cargan
   texto o acciones.
7. `typography`: familia, jerarquía y motivo; una fuente nueva reabre rendimiento.
8. `signatureScreens`: al menos dos pantallas que prueban reconocimiento y valor.
9. `photoInventory`: papeles concretos, no una lista de imágenes decorativas.
10. `successCriterion`: evidencia observable para aceptar o rechazar el resultado.

Los briefs aprobados de Cala Sereno, L'Olivar, Pinada del Mar y Mar de Fondo
viven junto a sus tenants. Montaña, Familiar y Parcela siguen siendo conceptos
sin enlace navegable; sus briefs completos viven en `docs/theme-briefs/`. R9
decidirá con evidencia cuál se convierte en demo: R8 no abre una ola nueva.

## 3. Tokens, selector y fronteras de marca

- La web del camping consume solo `--lc-*`. Los cinco colores base son hex
  auditables; los colores suaves derivan de ellos y los radios derivan de una
  única `--lc-radius`.
- Los temas alternativos son atrezzo exclusivo de una configuración con
  `demoThemes`. La URL `?tema=…` gana, se persiste en `lc-theme`, el selector
  mantiene URL y estado, y un valor desconocido se elimina antes de caer al
  tema persistido o al predeterminado.
- Un tenant sin `demoThemes` no genera selector ni almacenamiento de tema. El
  esquema impide activar campos demo en una configuración productiva.
- El dashboard conserva tokens y marca Logic2B. Los escenarios comerciales
  identificados viven bajo `apps/dashboard/src/demo/`; pueden cambiar fixtures
  y recorrido, pero nunca importan `theme.css` ni colores del camping.
- El sitio comercial usa su sistema botánico Logic2B. Las miniaturas simulan la
  dirección del tenant dentro de un marco, sin vestir la landing completa.

## 4. Media y presupuestos

`fotos.json` es encargo y manifiesto. Cada pieza declara un papel, una proporción
y un prompt; `procedencia` distingue material generado, licenciado, del cliente
o legado documentado. No se inventan trabajos retroactivos: Cala Sereno declara
la limitación de sus activos históricos y cualquier sustitución ya entra por el
pipeline actual.

Reglas comunes:

- una geografía, luz y lenguaje de color por identidad;
- lotes de una o dos piezas, revisión conjunta y aprobación explícita;
- sin rostros reconocibles, texto generado, logos, matrículas, HDR ni espacios
  imposibles;
- máster de trabajo en staging, final WebP local de 900–2000 px y máximo 750 KB;
- `miniatura.webp` 1600×1000 ≤320 KB, `og.jpg` 1200×630 ≤180 KB y
  `apple-touch-icon.png` 180×180 ≤40 KB;
- el modelo integrado de Codex es principal; dos fallos técnicos antes de bytes
  abren el fallback registrado. Nada cambia de proveedor en silencio.

El checker acepta finales históricos solo cuando tienen procedencia explícita.
Los cuatro tenants actuales están completos: Cala 12/12, L'Olivar 8/8, Pinada
11/11 y Mar de Fondo 14/14.

## 5. Receta local reproducible

### A. Scaffold y aprobación

```bash
pnpm new:camping -- {slug} --name "Camping …" --domain camping.example
```

La orden crea únicamente ficheros locales y muestra el plan remoto sin
ejecutarlo. Completar y aprobar `identity.json`; después ajustar `config.ts`,
`theme.css`, `content/`, `data.ts` y, solo si es necesario, `custom/hooks.ts`.

### B. Media

```bash
pnpm fotos -- status {slug}
pnpm fotos -- run {slug}
# o ingest para bytes obtenidos con el modelo integrado
pnpm fotos -- ingest {slug} {pieza} /ruta/al/master.png codex-integrated {modelo}
pnpm fotos -- approve {slug} {pieza}
pnpm fotos -- derive {slug}
```

`run` procesa solo el primer lote incompleto. Inspeccionar la pareja en
`.staging` antes de aprobar; rechazo, proveedor, modelo, trabajo y huella del
prompt quedan en `fotos.estado.json`.

### C. Contrato, build y capturas

```bash
node apps/web/scripts/check-tenant-factory.mjs
TENANT={slug} BASE_PATH=/demos/{slug} pnpm --filter @logic-camp/web build
pnpm --filter @logic-camp/web capture:tenant -- {slug}
pnpm --filter @logic-camp/web capture:tenant -- {slug} /contacto/
```

Las capturas se guardan fuera de git en
`test-results/tenant-factory/{slug}/`, a 375 y 1366 px, con reduced motion y
fallo ante recursos 4xx o errores de página. `--theme=nit` permite auditar una
variante de la demo canónica sin otro build.

### D. QA y documentación

```bash
pnpm --filter @logic-camp/cli test -- --run
pnpm --filter @logic-camp/web test
# Compone landing + /demo + /admin antes de arrancar el Worker local.
pnpm --filter @logic-camp/web e2e:factory
pnpm check
```

Revisar además teclado, foco, overflow, contenido y las pantallas firma del
brief. Documentar el resultado, la procedencia y las desviaciones aceptadas en
el README del tenant. Ningún paso de esta receta autoriza `--apply`, deploy,
reseed remoto, DNS, secrets o consumo de proveedor sin aprobación concreta.

## 6. Guardia automática

`check-tenant-factory.mjs`, incluido en `pnpm check`, descubre tenants en vez de
enumerar marcas. Comprueba contrato de ficheros, locales, briefs, tokens,
contraste claro/oscuro, coincidencia selector/CSS, radios, manifiestos, lotes,
procedencia, dimensiones y presupuestos. `check-portfolio.mjs` construye después
cada tenant y conserva las fronteras de tier. Playwright cubre URL,
persistencia, fallback y reduced motion contra el bundle compuesto real.
