# 0050 — Logic2B UI como base y una identidad comercial compartida

- **Estado:** aceptado por Andreu en la petición que abre este desarrollo
- **Fecha:** 2026-09-01
- **Fase:** sistema visual transversal · gestor

## Contexto

El gestor ya consume `@logic-camp/ui`: los primitivos React, la geometría,
los estados, el foco y los tokens neutros se extrajeron de la instancia real de
`https://ui.logic2b.com/`. La comparación con su CSS público actual confirma la
misma base shadcn/ui New York, Tailwind v4, radio de 10 px y variables semánticas.
No hace falta importar otro kit ni duplicar componentes.

La identidad comercial de `apps/site`, en cambio, vive como un overlay local en
`botanical.css`: papel, verde tinta, salvia, menta y una voz editorial. La separación
anterior hacía que la página comercial y el gestor parecieran productos distintos.
Andreu pide ahora usar `ui.logic2b.com` como cimiento y los colores y sistema visual
del sitio comercial como identidad de todo Logic2B Campings.

Importar las 1.633 líneas de `botanical.css` en el gestor no es válido: además de
tokens contiene el chasis Astro, héroes, cabecera, pie, documentación y diálogos de
captación. También dejaría sin resolver el modo oscuro del gestor.

## Decisión

### 1. La base estructural sigue siendo Logic2B UI

`packages/ui` continúa siendo la única fuente de primitivos y contratos de interfaz.
Los bloques `:root` y `.dark` conservan la base neutral de `ui.logic2b.com`, de modo
que se pueda comparar y actualizar sin mezclar marca con estructura.

No se duplican Button, Card, Input, Table, Sheet, Dialog, estados ni navegación. El
dashboard continúa consumiendo sus variables semánticas y no recibe colores literales
en las pantallas.

### 2. La identidad comercial se convierte en una variante compartida

`packages/ui/theme.css` expone:

- primitivas de marca `--logic2b-*` para tinta, sombra, salvia, keylime, menta,
  slate, papel, carbón y borde;
- `.theme-logic2b`, que remapea `background`, `foreground`, `card`, `popover`,
  `primary`, `secondary`, `muted`, `accent`, `border`, `input`, `ring`, `link` y
  toda la familia `sidebar-*`;
- `.dark.theme-logic2b`, con una variante verde oscura completa y accesible.

La variante oscura usa una escala propia de verdes profundos para superficies,
acciones y navegación. También oscurece `confirmed` e `inhouse` dentro del scope
de marca; los estados ámbar, rojo, gris y azul no cambian. La variante clara
refuerza por separado el texto secundario y los límites de controles, sin convertir
el borde decorativo de cards y tablas en una rejilla visualmente pesada.

El sitio comercial y el dashboard activan la misma clase. `botanical.css` mantiene
solo sus aliases y reglas editoriales/de-layout. Así ambos consumidores comparten la
paleta y los estados de los primitivos, pero el gestor no arrastra CSS comercial.

### 3. La identidad se comparte por rol, no copiando la landing

- Cuerpo, controles, tablas y navegación del gestor conservan Inter y su densidad
  operativa. La serif editorial sigue reservada a titulares comerciales.
- La escala de radio permanece en 10 px: Card ya resuelve a 14 px y los controles a
  8–10 px, la misma geometría útil observada en el sitio.
- `--chart-*` no se recolorea. `--lc-status-*` conserva sus roles operativos; solo
  confirmed e inhouse reciben verdes más profundos en la variante oscura.
  `--destructive` usa la pareja roja AA de «no presentada», que conserva el
  significado de peligro y evita texto insuficiente en oscuro.
- Las webs públicas de cada camping continúan usando exclusivamente su identidad de
  tenant. La unificación afecta a las superficies del producto Logic2B, no a la marca
  del cliente.

### 4. La variante se activa en el documento

El dashboard declara `theme-logic2b` en `<html>` antes del primer pintado. Esto cubre
login, shell y portales Radix sin parpadeo. El selector claro/oscuro/sistema solo
alterna `.dark`.

El layout comercial declara `theme-logic2b theme-botanical`: la primera clase aporta
tokens compartidos; la segunda conserva la dirección editorial y el layout público.

## Tensión entre las ocho lentes

- **Arquitectura / Fullstack:** una variante en `packages/ui` evita dos paletas que
  divergen y no multiplica trabajo por camping.
- **Frontend / UX:** el cambio es por tokens; planning, virtualización, gestos,
  estados y densidad no se reescriben.
- **Producto / UI:** el gestor gana continuidad con la página que lo vende, pero no
  adopta titulares gigantes ni ornamentación de marketing en tareas de mostrador.
- **Backend / SEO:** no cambian contratos de datos ni rutas. La web comercial conserva
  su SSG, metadatos y estructura.

## Consecuencias

- `ui.logic2b.com` queda explícitamente como base técnica y `packages/ui` como su
  materialización local.
- Comercial y gestor comparten color, foco, superficies y sidebar con un solo cambio.
- La variante neutra permanece disponible para comparación, pruebas o consumidores
  que no activen la marca.
- Cualquier cambio futuro de paleta se hace en primitivas `--logic2b-*`, no en cada
  pantalla.
- Este ADR sustituye la prohibición de vestir el gestor con la paleta comercial en
  `CLAUDE.md` y `docs/BRAND.md`; esos contratos se actualizan en esta misma fase.

## Pruebas de aceptación

1. La hoja pública actual de `ui.logic2b.com` y el bloque base local mantienen los
   mismos tokens estructurales principales.
2. Sitio y gestor activan `theme-logic2b`; `botanical.css` no duplica el remapeo
   semántico.
3. Todas las parejas semánticas, destructive y límites de control de la variante
   pasan WCAG AA en claro y oscuro; en claro también pasan los cruces de texto
   secundario y controles contra papel, muted y accent.
4. Los estados del planning conservan texto ≥ 4,5:1 y forma ≥ 3:1 sobre los nuevos
   fondos.
5. El dashboard pasa typecheck, lint, tests y build; la entrada continúa bajo su
   presupuesto gzip.
6. Verificación visual a 1366 px y 375 px, en claro y oscuro, sin errores de consola.

## Reversión

En el dashboard, quitar `theme-logic2b` devuelve la base neutral sin tocar
componentes ni datos. En el sitio hay que retirar juntas `theme-logic2b` y
`theme-botanical`: la segunda conserva aliases y reglas editoriales que consumen
las primitivas de marca. Tras quitar ambas clases, las primitivas quedan inertes y
pueden retirarse en un cambio posterior.
