# Càmping Riu Clar

Demo comercial fictícia de **Logic Camp Inici** sobre el carril tècnic `tier: 1`.

- 24 parcel·les: 16 de bosc i 8 de ribera.
- Català com a llengua d'arrencada; cap motor, dashboard, Worker o D1 propi.
- El formulari usa `enquiryTransport: 'demo'`: no fa xarxa ni persisteix dades.
- Ruta prevista: `/demos/riuclar/`, sempre `noindex`.
- La temporada, l'últim tram d'accés i el temps formen part del recorregut, no
  d'una nota amagada al peu.

## Construir

```bash
TENANT=riuclar TIER=1 BASE_PATH=/demos/riuclar pnpm --filter @logic-camp/web build
```

Estats QA del formulari: `?demoState=error#contacto` i
`?demoState=spam#contacto`.

## Fotografia

El brief aprovat viu a `identity.json`; l'encàrrec, la procedència, les quatre
tandes i els vuit papers a `fotos.json`. Els finals només entren després de la
inspecció visual i l'aprovació explícita del pipeline comú.

```bash
pnpm fotos -- status riuclar
pnpm fotos -- ingest riuclar {peça} /ruta/al/master.png codex-integrated {model}
pnpm fotos -- approve riuclar {peça}
pnpm fotos -- derive riuclar
```

La recepta completa és a `docs/FABRICA-IDENTIDADES.md`.
