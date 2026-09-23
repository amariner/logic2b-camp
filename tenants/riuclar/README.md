# Riu Clar

Demo comercial ficticia de **Logic Camp Inicio** sobre el carril técnico `tier: 1`.

- 24 parcelas: 16 de bosque y 8 de ribera.
- Castellano como único idioma; sin motor, dashboard, Worker ni D1 propios.
- El formulario usa `enquiryTransport: 'demo'`: no hace peticiones ni guarda datos.
- Ruta: `/demos/riuclar/`, siempre `noindex`.
- La temporada, el último tramo de acceso y el tiempo forman parte del recorrido.

## Construir

```bash
TENANT=riuclar TIER=1 BASE_PATH=/demos/riuclar pnpm --filter @logic-camp/web build
```

Estados de prueba del formulario: `?demoState=error#contacto` y
`?demoState=spam#contacto`.

## Fotografía y vídeo

El encargo y la procedencia se conservan en `identity.json`, `fotos.json`,
`fotos.estado.json` y `movimiento.json`. Se inspeccionan las imágenes antes
de aprobarlas mediante el pipeline común:

```bash
pnpm fotos -- status riuclar
pnpm fotos -- ingest riuclar {pieza} /ruta/al/master.png codex-integrated {modelo}
pnpm fotos -- approve riuclar {pieza}
pnpm fotos -- derive riuclar
```

La receta completa está en `docs/FABRICA-IDENTIDADES.md`.

Presentación `outdoor` con fotografías OpenAI integradas y vídeo ambiental
Higgsfield Seedance 2.0 de 8 segundos, en versiones de escritorio y móvil.
El póster móvil es un recorte del nuevo hero, sin generación adicional.
Informe: `docs/RIUCLAR-REDISENO-2026-09-18.md`.

## Idioma · 18 de septiembre de 2026

Todo el contenido público está en `content/es.json`, incluidos títulos SEO,
formularios y estados, fichas, rutas, tarifas y controles del vídeo. Las páginas
legales compartidas usan también castellano. El nombre de marca es **Riu Clar**.
